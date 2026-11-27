import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type {
  SecurityReport,
  SecurityReportType,
  Skater,
  Spot,
  SpotSubmission,
  SubmissionFile,
  SubmissionStatus,
  User,
} from '@/types';

// Server client (for Server Components)
async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(cookieStore);
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

// Server-side versions for Server Components
export async function getSpotsServer(): Promise<Spot[]> {
  const supabase = await getServerSupabase();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase.from('spots').select('*').order('name');

    if (user) {
      query = query.or(`status.eq.approved,created_by.eq.${user.id}`);
    } else {
      query = query.eq('status', 'approved');
    }

    const { data: spots, error } = await query;
    if (error) throw error;
    if (!spots || spots.length === 0) return [];

    const spotIds = spots.map((s) => s.id);
    const { data: liveCounts } = await supabase
      .from('spot_live_counts')
      .select('spot_id, live_count')
      .in('spot_id', spotIds);
    const liveCountMap = new Map(liveCounts?.map((lc) => [lc.spot_id, lc.live_count]) || []);

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

    return spotsWithStats;
  } catch {
    return [];
  }
}

export async function getSpotServer(id: string): Promise<Spot | undefined> {
  const supabase = await getServerSupabase();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: spot, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !spot) return undefined;

    if (spot.status !== 'approved' && spot.created_by !== user?.id) {
      return undefined;
    }

    const { data: liveCountData } = await supabase
      .from('spot_live_counts')
      .select('live_count')
      .eq('spot_id', id)
      .single();
    const liveCount = liveCountData?.live_count || 0;

    const { data: reports } = await supabase
      .from('security_reports')
      .select('id, type, created_at')
      .eq('spot_id', id);

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