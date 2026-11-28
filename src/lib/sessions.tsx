'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import type { LiveSession, SessionMember } from '@/types';

const SESSION_MAX_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours

interface SessionContextValue {
  sessions: Record<string, LiveSession>;
  ready: boolean;
  startSession: (
    spotId: string,
    member: SessionMember
  ) => Promise<LiveSession>;
  joinSession: (
    spotId: string,
    member: SessionMember
  ) => Promise<LiveSession>;
  leaveSession: (spotId: string, memberId: string) => Promise<void>;
  getSessionForSpot: (spotId: string) => LiveSession | null;
  getLiveCount: (spotId: string) => number;
  // Dev tools (only available when NEXT_PUBLIC_DEV_TOOLS=true)
  addMockMember?: (spotId: string) => Promise<void>;
  removeMockMember?: (spotId: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const SELF_ID = 'self';

// Browser client singleton
let supabaseClient: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!supabaseClient) supabaseClient = createClient();
  return supabaseClient;
}

function mapSupabaseSession(
  session: {
    id: string;
    spot_id: string;
    started_at: string;
    ended_at: string | null;
    member_name: string | null;
    member_stance: string | null;
    member_level: string | null;
  },
  named: boolean,
  fallbackName: string | undefined
): LiveSession {
  return {
    id: session.id,
    spotId: session.spot_id,
    startedAt: session.started_at,
    members: [
      {
        id: 'self',
        named,
        name: named ? (session.member_name || fallbackName) : undefined,
        stance: session.member_stance as SessionMember['stance'] | undefined,
        level: session.member_level as SessionMember['level'] | undefined,
      },
    ],
  };
}

function mapSupabaseSessions(
  sessions: Array<{
    id: string;
    spot_id: string;
    started_at: string;
    ended_at: string | null;
    user_id: string;
    member_name: string | null;
    member_stance: string | null;
    member_level: string | null;
  }>,
  currentUserId: string | null,
  userName: string | null
): Record<string, LiveSession> {
  const map: Record<string, LiveSession> = {};

  for (const session of sessions) {
    if (session.ended_at) continue;
    if (Date.now() - new Date(session.started_at).getTime() > SESSION_MAX_AGE_MS) continue;

    const isSelf = session.user_id === currentUserId;
    const named = isSelf
      ? session.member_name !== null
      : false; // Other users' names only shown if they chose to share

    const members = [{
      id: isSelf ? SELF_ID : session.user_id,
      named: isSelf ? (session.member_name !== null) : false,
      name: isSelf && session.member_name ? session.member_name : undefined,
      stance: session.member_stance as SessionMember['stance'] | undefined,
      level: session.member_level as SessionMember['level'] | undefined,
    }];

    // For other users, we don't expose their exact details unless they share
    if (!isSelf) {
      members[0].named = false;
      members[0].name = undefined;
      members[0].stance = undefined;
      members[0].level = undefined;
    }

    map[session.spot_id] = {
      id: session.id,
      spotId: session.spot_id,
      startedAt: session.started_at,
      members,
    };
  }

  return map;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Record<string, LiveSession>>({});
  const [ready, setReady] = useState(false);
  const channelsRef = useRef<Map<string, unknown>>(new Map());
  const { user } = useAuth();

  // Initial load + Realtime subscription
  useEffect(() => {
    let active = true;
    const supabase = getSupabase();

    // Load initial sessions
    async function loadInitial() {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .is('ended_at', null)
        .eq('hidden', false)
        .gte('started_at', new Date(Date.now() - SESSION_MAX_AGE_MS).toISOString());

      if (error) {
        console.error('Failed to load sessions:', error);
      } else if (active && data) {
        const mapped = mapSupabaseSessions(data, user?.id ?? null, user?.name ?? null);
        setSessions(mapped);
      }
      if (active) setReady(true);
    }

    loadInitial();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `ended_at=is.null,hidden=eq.false`,
        },
        (payload) => {
          if (!active) return;

          const session = payload.new as {
            id: string;
            spot_id: string;
            started_at: string;
            ended_at: string | null;
            user_id: string;
            hidden: boolean;
            member_name: string | null;
            member_stance: string | null;
            member_level: string | null;
          } | null;

          const oldSession = payload.old as {
            spot_id: string;
          } | null;

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (session && !session.ended_at && !session.hidden) {
              const mapped = mapSupabaseSessions([session], user?.id ?? null, user?.name ?? null);
              setSessions((prev) => ({ ...prev, ...mapped }));
            } else if (session && (session.ended_at || session.hidden)) {
              // Session ended or hidden - remove from local state
              setSessions((prev) => {
                const next = { ...prev };
                if (oldSession?.spot_id) delete next[oldSession.spot_id];
                if (session.spot_id) delete next[session.spot_id];
                return next;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setSessions((prev) => {
              const next = { ...prev };
              if (oldSession?.spot_id) delete next[oldSession.spot_id];
              return next;
            });
          }
        }
      )
      .subscribe();

    channelsRef.current.set('sessions', channel);

    return () => {
      active = false;
      channel.unsubscribe();
      channelsRef.current.clear();
    };
  }, [user?.id, user?.name]);

  // Clean up expired sessions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) => {
        const next: Record<string, LiveSession> = {};
        let changed = false;
        for (const [spotId, session] of Object.entries(prev)) {
          const age = Date.now() - new Date(session.startedAt).getTime();
          if (age < SESSION_MAX_AGE_MS) {
            next[spotId] = session;
          } else {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const startSession = useCallback(
    async (spotId: string, member: SessionMember): Promise<LiveSession> => {
      const supabase = getSupabase();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) throw new Error('Must be logged in to start a session');

      // Check if user already has an active session at this spot
      const { data: existing } = await supabase
        .from('sessions')
        .select('id')
        .eq('spot_id', spotId)
        .eq('user_id', authUser.id)
        .is('ended_at', null)
        .eq('hidden', false)
        .single();

      if (existing) {
        // Update existing session with new member info
        const { data: updated, error } = await supabase
          .from('sessions')
          .update({
            member_name: member.named ? member.name : null,
            member_stance: member.named ? member.stance : null,
            member_level: member.named ? member.level : null,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;

        const mapped = mapSupabaseSession(updated, member.named, member.name);
        setSessions((prev) => ({ ...prev, [spotId]: mapped }));
        return mapped;
      }

      // Create new session
      const { data: newSession, error } = await supabase
        .from('sessions')
        .insert({
          spot_id: spotId,
          user_id: authUser.id,
          started_at: new Date().toISOString(),
          member_name: member.named ? member.name : null,
          member_stance: member.named ? member.stance : null,
          member_level: member.named ? member.level : null,
          hidden: false,
        })
        .select()
        .single();

      if (error) throw error;

      const mapped = mapSupabaseSession(newSession, member.named, member.name);
      setSessions((prev) => ({ ...prev, [spotId]: mapped }));
      return mapped;
    },
    []
  );

  const joinSession = useCallback(
    async (spotId: string, member: SessionMember): Promise<LiveSession> => {
      return startSession(spotId, member);
    },
    [startSession]
  );

  const leaveSession = useCallback(
    async (spotId: string, memberId: string): Promise<void> => {
      if (memberId !== SELF_ID) return; // Only support leaving self for now

      const supabase = getSupabase();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) return;

      await supabase
        .from('sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('spot_id', spotId)
        .eq('user_id', authUser.id)
        .is('ended_at', null);

      setSessions((prev) => {
        const next = { ...prev };
        delete next[spotId];
        return next;
      });
    },
    []
  );

  const getSessionForSpot = useCallback(
    (spotId: string): LiveSession | null => {
      return sessions[spotId] ?? null;
    },
    [sessions]
  );

  const getLiveCount = useCallback(
    (spotId: string): number => {
      // Count only named self + other users (each session = 1 user)
      const session = sessions[spotId];
      if (!session) return 0;
      return session.members.length;
    },
    [sessions]
  );

  // Dev tools - only available when NEXT_PUBLIC_DEV_TOOLS=true
  const addMockMember = useCallback(
    async (spotId: string): Promise<void> => {
      if (process.env.NEXT_PUBLIC_DEV_TOOLS !== 'true') return;

      const supabase = getSupabase();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Add a mock anonymous member by creating a temporary session
      // In reality, this would be a separate mock session
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          spot_id: spotId,
          user_id: authUser.id,
          started_at: new Date().toISOString(),
          member_name: null,
          member_stance: null,
          member_level: null,
          hidden: false,
        })
        .select()
        .single();

      if (!error && data) {
        const mapped = mapSupabaseSession(data, false, undefined);
        setSessions((prev) => {
          const existing = prev[spotId];
          if (existing) {
            return {
              ...prev,
              [spotId]: {
                ...existing,
                members: [...existing.members, { id: `mock-${Date.now()}`, named: false }],
              },
            };
          }
          return { ...prev, [spotId]: mapped };
        });
      }
    },
    []
  );

  const removeMockMember = useCallback(
    async (spotId: string): Promise<void> => {
      if (process.env.NEXT_PUBLIC_DEV_TOOLS !== 'true') return;

      // For dev tools, we just remove a mock member from local state
      // Real sessions would need proper cleanup
      setSessions((prev) => {
        const existing = prev[spotId];
        if (!existing) return prev;

        const mockMembers = existing.members.filter((m) =>
          m.id.startsWith('mock-')
        );
        if (mockMembers.length === 0) return prev;

        const toRemove = mockMembers[mockMembers.length - 1];
        const members = existing.members.filter((m) => m.id !== toRemove.id);

        if (members.length === 0) {
          const next = { ...prev };
          delete next[spotId];
          return next;
        }

        return { ...prev, [spotId]: { ...existing, members } };
      });
    },
    []
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      sessions,
      ready,
      startSession,
      joinSession,
      leaveSession,
      getSessionForSpot,
      getLiveCount,
      addMockMember: process.env.NEXT_PUBLIC_DEV_TOOLS === 'true' ? addMockMember : undefined,
      removeMockMember: process.env.NEXT_PUBLIC_DEV_TOOLS === 'true' ? removeMockMember : undefined,
    }),
    [
      sessions,
      ready,
      startSession,
      joinSession,
      leaveSession,
      getSessionForSpot,
      getLiveCount,
    ]
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessions(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSessions must be used within a SessionProvider');
  }
  return ctx;
}

export { SELF_ID };