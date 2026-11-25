import { currentUser, skaters, spots as seedSpots } from '@/data/seed';
import type {
  SecurityReport,
  SecurityReportType,
  Session,
  Skater,
  Spot,
  User,
} from '@/types';

// Mutable in-memory copy so security reports persist during the session.
let spots: Spot[] = seedSpots.map((s) => ({ ...s }));

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
