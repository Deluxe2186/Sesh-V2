import { currentUser, skaters, spots as seedSpots } from '@/data/seed';
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

// Mutable in-memory copy so security reports persist during the session.
let spots: Spot[] = seedSpots.map((s) => ({ ...s }));

// Reports are also saved in the browser so they survive page loads and
// navigation (the server renders spots from the seed data each time).
const REPORTS_KEY = 'sesh-security-reports';

function readStoredReports(): Record<string, SecurityReport[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(REPORTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SecurityReport[]>) : {};
  } catch {
    return {};
  }
}

export function getStoredReports(spotId: string): SecurityReport[] {
  return readStoredReports()[spotId] ?? [];
}

export async function getSpots(): Promise<Spot[]> {
  return spots;
}

export async function getSpot(id: string): Promise<Spot | undefined> {
  return spots.find((spot) => spot.id === id);
}

export async function getSkaters(): Promise<Skater[]> {
  return skaters;
}

export async function getCurrentUser(): Promise<User> {
  return currentUser;
}

export async function getSpotSession(spotId: string): Promise<Session | null> {
  return null;
}

export async function startSession(spotId: string): Promise<Session> {
  return {
    id: `session-${Date.now()}`,
    spotId,
    skaterIds: [currentUser.id],
    startedAt: new Date().toISOString(),
    active: true,
  };
}

export async function reportSecurity(
  spotId: string,
  type: SecurityReportType
): Promise<SecurityReport> {
  const report: SecurityReport = {
    id: `report-${Date.now()}`,
    type,
    at: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      const all = readStoredReports();
      all[spotId] = [report, ...(all[spotId] ?? [])];
      window.localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
    } catch {
      // Storage unavailable: keep the in-memory copy only.
    }
  }
  spots = spots.map((s) =>
    s.id === spotId
      ? { ...s, securityReports: [report, ...s.securityReports] }
      : s
  );
  return report;
}

export interface RecentSessionRow {
  id: string;
  date: string;
  skaterCount: number;
  durationMin: number;
}

export async function getRecentSessions(
  spotId: string
): Promise<RecentSessionRow[]> {
  const spot = spots.find((s) => s.id === spotId);
  if (!spot) return [];
  const base = spot.weeklyVisits;
  const rows: RecentSessionRow[] = Array.from({ length: 4 }).map((_, i) => {
    const daysAgo = (i + 1) * 2;
    const date = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const skaterCount = Math.max(
      1,
      Math.round((base / 7) * (0.6 + (i % 3) * 0.2))
    );
    const durationMin = 45 + ((i * 37) % 120);
    return {
      id: `recent-${spotId}-${i}`,
      date,
      skaterCount,
      durationMin,
    };
  });
  return rows;
}

// Spot submission storage
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
    userId: submission.userId || currentUser.id,
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
