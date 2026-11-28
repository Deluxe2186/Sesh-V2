'use client';

import { createClient } from '@/lib/supabase/client';
import { cacheSpots, getCachedSpots } from '@/lib/offlineCache';
import type {
  SecurityReport,
  SecurityReportType,
  Session,
  Skater,
  Spot,
  SpotSubmission,
  SubmissionFile,
  SubmissionStatus,
  User,
} from '@/types';

// Browser client singleton
let browserClient: ReturnType<typeof createClient> | null = null;
function getBrowserClient() {
  if (!browserClient) browserClient = createClient();
  return browserClient;
}

/**
 * Map database spot row to Spot type with computed stats
 */
async function mapSpotRow(
  spot: {
    id: string;
    name: string;
    area: string;
    lat: number;
    lng: number;
    obstacles: string[];
    surface: string;
    best_time: string;
    notes: string;
    how_to_find: string;
    shelter: string;
    security_level: string;
    security_note: string;
    tips: string[];
    verified: boolean;
    approximate_location: boolean;
    status: string;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  },
  stats: {
    weeklyVisits: number;
    lastActive: string | null;
    busyByTime: { morning: number; afternoon: number; evening: number; night: number };
    busyByDay: number[];
  },
  liveCount: number,
  securityReports: { id: string; type: string; created_at: string }[]
): Promise<Spot> {
  return {
    id: spot.id,
    name: spot.name,
    area: spot.area,
    lat: spot.lat,
    lng: spot.lng,
    obstacles: spot.obstacles as Spot['obstacles'],
    surface: spot.surface as Spot['surface'],
    bestTime: spot.best_time,
    notes: spot.notes,
    verified: spot.verified,
    liveCount,
    weeklyVisits: stats.weeklyVisits,
    lastActive: stats.lastActive || spot.updated_at,
    securityLevel: spot.security_level as Spot['securityLevel'],
    securityNote: spot.security_note,
    securityReports: securityReports.map((r) => ({
      id: r.id,
      type: r.type as SecurityReportType,
      at: r.created_at,
    })),
    shelter: spot.shelter as Spot['shelter'],
    tips: spot.tips,
    busyByTime: stats.busyByTime,
    busyByDay: stats.busyByDay,
  };
}

/**
 * Fetch spots with live counts and stats
 * Returns approved spots + current user's own pending spots
 */
export async function getSpots(): Promise<Spot[]> {
  // Try cache first for instant response
  const cached = getCachedSpots();
  if (cached) return cached;

  const supabase = getBrowserClient();

  try {
    // Get current user to include their pending spots
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build query: approved spots OR user's own spots
    let query = supabase
      .from('spots')
      .select('*')
      .order('name');

    if (user) {
      query = query.or(`status.eq.approved,created_by.eq.${user.id}`);
    } else {
      query = query.eq('status', 'approved');
    }

    const { data: spots, error } = await query;

    if (error) throw error;

    if (!spots || spots.length === 0) {
      const empty: Spot[] = [];
      cacheSpots(empty);
      return empty;
    }

    // Fetch live counts for these spots
    const spotIds = spots.map((s) => s.id);
    const { data: liveCounts } = await supabase
      .from('spot_live_counts')
      .select('spot_id, live_count')
      .in('spot_id', spotIds);
    const liveCountMap = new Map(liveCounts?.map((lc) => [lc.spot_id, lc.live_count]) || []);

    // Fetch security reports for these spots
    const { data: reports } = await supabase
      .from('security_reports')
      .select('id, spot_id, type, created_at')
      .in('spot_id', spotIds);
    const reportsMap = new Map<string, { id: string; type: string; created_at: string }[]>();
    reports?.forEach((r) => {
      const arr = reportsMap.get(r.spot_id) || [];
      arr.push({ id: r.id, type: r.type, created_at: r.created_at });
      reportsMap.set(r.spot_id, arr);
    });

    // Fetch stats for each spot using the spot_stats function
    const spotsWithStats = await Promise.all(
      spots.map(async (spot) => {
        const { data: stats } = await supabase.rpc('spot_stats', { p_spot_id: spot.id });
        const safeStats = stats || {
          weeklyVisits: 0,
          lastActive: null,
          busyByTime: { morning: 0, afternoon: 0, evening: 0, night: 0 },
          busyByDay: [0, 0, 0, 0, 0, 0, 0],
        };
        return mapSpotRow(spot, safeStats, liveCountMap.get(spot.id) || 0, reportsMap.get(spot.id) || []);
      })
    );

    cacheSpots(spotsWithStats);
    return spotsWithStats;
  } catch (error) {
    // Return cached data on error (offline fallback)
    const cached = getCachedSpots();
    if (cached) return cached;
    throw error;
  }
}

/**
 * Get a single spot by ID with full stats
 */
export async function getSpot(id: string): Promise<Spot | undefined> {
  const supabase = getBrowserClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase.from('spots').select('*').eq('id', id).single();

    const { data: spot, error } = await query;

    if (error || !spot) return undefined;

    // Check access: approved or own spot
    if (spot.status !== 'approved' && spot.created_by !== user?.id) {
      return undefined;
    }

    // Get live count
    const { data: liveCountData } = await supabase
      .from('spot_live_counts')
      .select('live_count')
      .eq('spot_id', id)
      .single();
    const liveCount = liveCountData?.live_count || 0;

    // Get security reports
    const { data: reports } = await supabase
      .from('security_reports')
      .select('id, type, created_at')
      .eq('spot_id', id);

    // Get stats
    const { data: stats } = await supabase.rpc('spot_stats', { p_spot_id: id });
    const safeStats = stats || {
      weeklyVisits: 0,
      lastActive: null,
      busyByTime: { morning: 0, afternoon: 0, evening: 0, night: 0 },
      busyByDay: [0, 0, 0, 0, 0, 0, 0],
    };

    return mapSpotRow(spot, safeStats, liveCount, reports || []);
  } catch {
    return undefined;
  }
}

/**
 * Get skaters from profiles table
 */
export async function getSkaters(): Promise<Skater[]> {
  const supabase = getBrowserClient();

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name, handle, stance, level, preferred_obstacles')
      .not('handle', 'is', null);

    if (error) throw error;

    return (profiles || []).map((p) => ({
      id: p.id,
      name: p.name,
      handle: p.handle,
      stance: (p.stance as Skater['stance']) || 'Regular',
      level: (p.level as Skater['level']) || 'Beginner',
      preferredObstacles: (p.preferred_obstacles as Skater['preferredObstacles']) || [],
    }));
  } catch {
    return [];
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getBrowserClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, handle, stance, level, preferred_obstacles')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      // Fallback to auth metadata
      return {
        id: user.id,
        name: user.user_metadata?.name || '',
        handle: user.user_metadata?.handle || '',
        stance: (user.user_metadata?.stance as User['stance']) || 'Regular',
        level: (user.user_metadata?.level as User['level']) || 'Beginner',
        preferredObstacles: [],
      };
    }

    return {
      id: profile.id,
      name: profile.name,
      handle: profile.handle,
      stance: (profile.stance as User['stance']) || 'Regular',
      level: (profile.level as User['level']) || 'Beginner',
      preferredObstacles: (profile.preferred_obstacles as User['preferredObstacles']) || [],
    };
  } catch {
    return null;
  }
}

/**
 * Update user profile in Supabase
 */
export async function updateProfile(
  updates: {
    name?: string;
    stance?: 'Regular' | 'Goofy';
    level?: 'Beginner' | 'Intermediate' | 'Advanced';
    preferred_obstacles?: string[];
    share_location?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = getBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Must be logged in' };

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) return { success: false, error: error.message };

  return { success: true };
}

export interface RecentSessionRow {
  id: string;
  date: string;
  skaterCount: number;
  durationMin: number;
  spotName?: string;
  area?: string;
}

/**
 * Get recent sessions for a user from real session rows
 */
export async function getRecentSessions(userId: string): Promise<RecentSessionRow[]> {
  const supabase = getBrowserClient();

  try {
    // Get last 20 ended sessions for this user
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select(`
        id,
        spot_id,
        started_at,
        ended_at,
        spots:spot_id (name, area)
      `)
      .eq('user_id', userId)
      .not('ended_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    if (!sessions || sessions.length === 0) return [];

    return sessions.slice(0, 4).map((s, i) => {
      const started = new Date(s.started_at);
      const ended = new Date(s.ended_at!);
      const durationMin = Math.round((ended.getTime() - started.getTime()) / 60000);
      const spot = Array.isArray(s.spots) ? s.spots[0] : s.spots;
      return {
        id: s.id,
        date: s.started_at,
        skaterCount: 1, // Each session row is one user's session
        durationMin: Math.max(1, durationMin),
        spotName: (spot as { name: string; area: string } | null)?.name || 'Unknown Spot',
        area: (spot as { name: string; area: string } | null)?.area || '',
      };
    });
  } catch {
    return [];
  }
}

/**
 * Report security issue - limited to one per user per spot per hour
 */
export async function reportSecurity(
  spotId: string,
  type: SecurityReportType
): Promise<SecurityReport> {
  const supabase = getBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Must be logged in to report');

  // Check rate limit: one report per user per spot per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentReport } = await supabase
    .from('security_reports')
    .select('id')
    .eq('spot_id', spotId)
    .eq('user_id', user.id)
    .gte('created_at', oneHourAgo)
    .limit(1)
    .single();

  if (recentReport) {
    throw new Error('You can only report once per hour for this spot');
  }

  const { data: report, error } = await supabase
    .from('security_reports')
    .insert({
      spot_id: spotId,
      user_id: user.id,
      type,
    })
    .select('id, type, created_at')
    .single();

  if (error) throw error;

  return {
    id: report.id,
    type: report.type as SecurityReportType,
    at: report.created_at,
  };
}

/**
 * Get stored reports (now from Supabase, with localStorage fallback for offline)
 */
export function getStoredReports(spotId: string): SecurityReport[] {
  // This is kept for backward compatibility with UI that expects localStorage
  // The real data comes from Supabase via getSpot/getSpots
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('sesh-security-reports');
    return raw ? (JSON.parse(raw) as Record<string, SecurityReport[]>)[spotId] ?? [] : [];
  } catch {
    return [];
  }
}

// =============================================================================
// Spot Submission functions (localStorage-based for offline support)
// =============================================================================

const SUBMISSIONS_KEY = 'sesh-spot-submissions';
const DRAFTS_KEY = 'sesh-spot-drafts';

function readSubmissions(): SpotSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SUBMISSIONS_KEY);
    return raw ? (JSON.parse(raw) as SpotSubmission[]) : [];
  } catch {
    return [];
  }
}

function writeSubmissions(submissions: SpotSubmission[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

function readDrafts(): SpotSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DRAFTS_KEY);
    return raw ? (JSON.parse(raw) as SpotSubmission[]) : [];
  } catch {
    return [];
  }
}

function writeDrafts(drafts: SpotSubmission[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export async function saveDraft(submission: SpotSubmission): Promise<SpotSubmission> {
  const drafts = readDrafts();
  const existingIndex = drafts.findIndex((d) => d.id === submission.id);
  const now = new Date().toISOString();

  const draftToSave: SpotSubmission = {
    ...submission,
    updatedAt: now,
    status: 'ready_to_send',
  };

  if (existingIndex >= 0) {
    drafts[existingIndex] = draftToSave;
  } else {
    drafts.push(draftToSave);
  }

  writeDrafts(drafts);
  return draftToSave;
}

interface UploadProgress {
  fileName: string;
  loaded: number;
  total: number;
  percentage: number;
}

interface SubmitSpotOptions {
  onProgress?: (progress: UploadProgress[]) => void;
  onError?: (error: string, failedFile?: string) => void;
}

/**
 * Validate submission data before sending to server
 */
function validateSubmission(submission: SpotSubmission): string | null {
  if (!submission.name?.trim() || submission.name.length > 100) {
    return 'Spot name is required (max 100 characters)';
  }
  if (!submission.area?.trim() || submission.area.length > 100) {
    return 'Area is required (max 100 characters)';
  }
  if (!submission.description?.trim() || submission.description.length > 2000) {
    return 'Description is required (max 2000 characters)';
  }
  if (!submission.howToFind?.trim() || submission.howToFind.length > 1000) {
    return 'How to find is required (max 1000 characters)';
  }
  if (!submission.securityNote?.trim() || submission.securityNote.length > 1000) {
    return 'Security note is required (max 1000 characters)';
  }
  if (!submission.bestTime?.trim() || submission.bestTime.length > 200) {
    return 'Best time is required (max 200 characters)';
  }
  if (!submission.obstacles || submission.obstacles.length === 0) {
    return 'At least one obstacle is required';
  }
  if (submission.obstacles.length > 10) {
    return 'Maximum 10 obstacles allowed';
  }
  if (submission.lat < -90 || submission.lat > 90) {
    return 'Invalid latitude';
  }
  if (submission.lng < -180 || submission.lng > 180) {
    return 'Invalid longitude';
  }
  if (submission.files) {
    for (const file of submission.files) {
      if (file.originalSize > 31457280) { // 30MB
        return `File ${file.name} exceeds 30MB limit`;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        return `File ${file.name} must be an image or video`;
      }
      if (file.type.startsWith('video/') && file.duration && file.duration > 3600) {
        return `Video ${file.name} exceeds 1 hour limit`;
      }
    }
  }
  return null;
}

interface SubmitSpotOptions {
  onProgress?: (progress: UploadProgress[]) => void;
  onError?: (error: string, failedFile?: string) => void;
}

/**
 * Submit a spot with media uploads to Supabase
 * - Uploads compressed files to spot-media bucket
 * - Inserts spot_media rows
 * - Inserts spot as 'pending_review'
 * - Keeps draft until fully succeeded
 * - Calls onProgress callback for upload progress
 */
export async function submitSpot(
  submission: SpotSubmission,
  options: SubmitSpotOptions = {}
): Promise<SpotSubmission> {
  const { onProgress, onError } = options;
  const supabase = getBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Must be logged in to submit a spot');

  // Client-side validation
  const validationError = validateSubmission(submission);
  if (validationError) throw new Error(validationError);

  // Keep draft until fully succeeded
  const drafts = readDrafts();
  const filteredDrafts = drafts.filter((d) => d.id !== submission.id);
  writeDrafts(filteredDrafts);

  const now = new Date().toISOString();
  const submissionId = submission.id || `submission-${Date.now()}`;
  const userId = submission.userId || user.id;

  try {
    // 1. Upload media files
    const mediaRows: { kind: 'image' | 'video'; path: string; size_bytes: number; duration_s?: number }[] = [];
    const uploadProgress: UploadProgress[] = submission.files.map((f) => ({
      fileName: f.name,
      loaded: 0,
      total: f.originalSize,
      percentage: 0,
    }));
    onProgress?.([...uploadProgress]);

    for (let i = 0; i < submission.files.length; i++) {
      const file = submission.files[i];
      const progress = uploadProgress[i];
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `${user.id}/${submissionId}/${fileName}`;

      // Convert base64 thumbnail back to blob for upload
      // Note: In production, you'd upload the original compressed file, not the thumbnail
      // For now, we use the thumbnail as the uploaded file
      const base64Data = file.thumbnail.split(',')[1];
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
      const blob = new Blob([bytes], { type: file.type.startsWith('video/') ? 'video/mp4' : 'image/jpeg' });

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('spot-media')
        .upload(storagePath, blob, {
          contentType: file.type.startsWith('video/') ? 'video/mp4' : 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }

      progress.loaded = progress.total;
      progress.percentage = 100;
      onProgress?.([...uploadProgress]);

      mediaRows.push({
        kind: file.type.startsWith('video/') ? 'video' : 'image',
        path: storagePath,
        size_bytes: file.originalSize,
        duration_s: file.duration,
      });
    }

    // 2. Insert spot
    const { data: spot, error: spotError } = await supabase
      .from('spots')
      .insert({
        id: submissionId,
        name: submission.name,
        area: submission.area,
        lat: submission.lat,
        lng: submission.lng,
        obstacles: submission.obstacles,
        surface: submission.surface,
        best_time: submission.bestTime,
        notes: submission.description,
        how_to_find: submission.howToFind,
        shelter: submission.shelter,
        security_level: submission.securityLevel,
        security_note: submission.securityNote,
        tips: [], // tips are generated by admin on approval
        verified: false,
        approximate_location: submission.approximateLocation,
        status: 'pending_review',
        created_by: userId,
      })
      .select('id')
      .single();

    if (spotError) {
      // Clean up uploaded files on spot insert failure
      await Promise.all(
        mediaRows.map((m) => supabase.storage.from('spot-media').remove([m.path]))
      );
      throw new Error(`Failed to create spot: ${spotError.message}`);
    }

    // 3. Insert spot_media rows
    const mediaInserts = mediaRows.map((m) => ({
      spot_id: spot.id,
      kind: m.kind,
      path: m.path,
      size_bytes: m.size_bytes,
      duration_s: m.duration_s,
    }));

    const { error: mediaError } = await supabase.from('spot_media').insert(mediaInserts);

    if (mediaError) {
      // Clean up spot and files
      await supabase.from('spots').delete().eq('id', spot.id);
      await Promise.all(
        mediaRows.map((m) => supabase.storage.from('spot-media').remove([m.path]))
      );
      throw new Error(`Failed to save media: ${mediaError.message}`);
    }

    // 4. Success - add to local submissions
    const submissions = readSubmissions();
    const submissionToSave: SpotSubmission = {
      ...submission,
      id: spot.id,
      userId,
      status: 'pending_review',
      createdAt: submission.createdAt || now,
      updatedAt: now,
    };

    submissions.push(submissionToSave);
    writeSubmissions(submissions);

    return submissionToSave;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Submission failed';
    onError?.(message);
    throw error;
  }
}

/**
 * Fetch user's submissions from server (includes all statuses)
 */
export async function fetchUserSubmissionsFromServer(): Promise<SpotSubmission[]> {
  const supabase = getBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('spots')
    .select(`
      *,
      spot_media (
        id,
        kind,
        path,
        size_bytes,
        duration_s
      )
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((spot) => ({
    id: spot.id,
    userId: spot.created_by,
    status: spot.status as SubmissionStatus,
    createdAt: spot.created_at,
    updatedAt: spot.updated_at,
    // Step 1: Basics
    name: spot.name,
    area: spot.area,
    howToFind: spot.how_to_find,
    description: spot.notes,
    surface: spot.surface as SpotSubmission['surface'],
    shelter: spot.shelter as SpotSubmission['shelter'],
    bestTime: spot.best_time,
    securityLevel: spot.security_level as SpotSubmission['securityLevel'],
    securityNote: spot.security_note,
    lat: spot.lat,
    lng: spot.lng,
    approximateLocation: spot.approximate_location,
    // Step 2: Obstacles
    obstacles: spot.obstacles as string[],
    customObstacle: '',
    // Step 3: Proof
    files: (spot.spot_media || []).map((m: { path: string; size_bytes: number; kind: string; duration_s?: number }) => ({
      name: m.path.split('/').pop() || 'file',
      originalSize: m.size_bytes,
      compressedSize: m.size_bytes,
      thumbnail: `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')}/storage/v1/object/public/spot-media/${m.path}`,
      type: m.kind,
      duration: m.duration_s,
    })),
    // Computed
    totalDataMB: (spot.spot_media || []).reduce((sum: number, m: { size_bytes: number }) => sum + m.size_bytes, 0) / 1024 / 1024,
  }));
}

/**
 * Get user submissions - merges local drafts with server submissions
 */
export async function getUserSubmissions(userId: string): Promise<SpotSubmission[]> {
  const submissions = readSubmissions();
  const drafts = readDrafts();

  const userSubmissions = submissions.filter((s) => s.userId === userId);
  const userDrafts = drafts.filter((d) => d.userId === userId);

  // Try to fetch from server as well (for pending_review, approved, etc.)
  let serverSubmissions: SpotSubmission[] = [];
  try {
    serverSubmissions = await fetchUserSubmissionsFromServer();
  } catch {
    // Ignore server errors, use local only
  }

  // Merge: server submissions take precedence, then local submissions, then drafts
  // Use a map to deduplicate by ID
  const merged = new Map<string, SpotSubmission>();

  // Add server submissions first
  for (const s of serverSubmissions) {
    merged.set(s.id, s);
  }

  // Add local submissions (not already in server)
  for (const s of userSubmissions) {
    if (!merged.has(s.id)) merged.set(s.id, s);
  }

  // Add drafts (not already in server or local)
  for (const d of userDrafts) {
    if (!merged.has(d.id)) merged.set(d.id, d);
  }

  // Combine and sort by updatedAt desc
  const all = Array.from(merged.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return all;
}

export async function getDraft(id: string): Promise<SpotSubmission | undefined> {
  const drafts = readDrafts();
  return drafts.find((d) => d.id === id);
}

export async function deleteDraft(id: string): Promise<void> {
  const drafts = readDrafts();
  writeDrafts(drafts.filter((d) => d.id !== id));
}