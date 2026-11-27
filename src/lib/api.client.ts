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

export interface RecentSessionRow {
  id: string;
  date: string;
  skaterCount: number;
  durationMin: number;
}

/**
 * Get recent sessions from real session rows
 */
export async function getRecentSessions(spotId: string): Promise<RecentSessionRow[]> {
  const supabase = getBrowserClient();

  try {
    // Get last 20 ended sessions for this spot
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, started_at, ended_at')
      .eq('spot_id', spotId)
      .not('ended_at', 'is', null)
      .order('started_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    if (!sessions || sessions.length === 0) return [];

    return sessions.slice(0, 4).map((s, i) => {
      const started = new Date(s.started_at);
      const ended = new Date(s.ended_at!);
      const durationMin = Math.round((ended.getTime() - started.getTime()) / 60000);
      return {
        id: s.id,
        date: s.started_at,
        skaterCount: 1, // Each session row is one user's session
        durationMin: Math.max(1, durationMin),
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

export async function submitSpot(submission: SpotSubmission): Promise<SpotSubmission> {
  // Remove from drafts if it exists there
  const drafts = readDrafts();
  const filteredDrafts = drafts.filter((d) => d.id !== submission.id);
  writeDrafts(filteredDrafts);

  // Add to submissions
  const submissions = readSubmissions();
  const now = new Date().toISOString();

  const submissionToSave: SpotSubmission = {
    ...submission,
    id: submission.id || `submission-${Date.now()}`,
    userId: submission.userId || (await getCurrentUser())?.id || '',
    status: 'pending_review',
    createdAt: submission.createdAt || now,
    updatedAt: now,
  };

  submissions.push(submissionToSave);
  writeSubmissions(submissions);

  return submissionToSave;
}

export async function getUserSubmissions(userId: string): Promise<SpotSubmission[]> {
  const submissions = readSubmissions();
  const drafts = readDrafts();

  const userSubmissions = submissions.filter((s) => s.userId === userId);
  const userDrafts = drafts.filter((d) => d.userId === userId);

  // Combine and sort by updatedAt desc
  const all = [...userSubmissions, ...userDrafts].sort(
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