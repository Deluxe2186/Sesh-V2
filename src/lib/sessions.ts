'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { spots as seedSpots } from '@/data/seed';
import type { LiveSession, SessionMember } from '@/types';

const STORAGE_KEY = 'sesh-sessions';
// A session older than this is treated as finished.
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

type SessionsMap = Record<string, LiveSession>;

// SAMPLE DATA: anonymous skaters so the map and spot pages show activity.
// Remove this when live sessions come from the database.
function seedSessions(): SessionsMap {
  const map: SessionsMap = {};
  seedSpots.forEach((spot) => {
    if (spot.liveCount <= 0) return;
    map[spot.id] = {
      id: `session-seed-${spot.id}`,
      spotId: spot.id,
      startedAt: new Date(
        Date.now() - (10 + spot.liveCount * 7) * 60000
      ).toISOString(),
      members: Array.from({ length: spot.liveCount }, (_, i) => ({
        id: `seed-${spot.id}-${i}`,
        named: false,
      })),
    };
  });
  return map;
}

function readSessions(): SessionsMap {
  if (typeof window === 'undefined') return {};
  let stored: SessionsMap = {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    stored = raw ? (JSON.parse(raw) as SessionsMap) : {};
  } catch {
    stored = {};
  }
  const fresh: SessionsMap = {};
  Object.keys(stored).forEach((spotId) => {
    const age = Date.now() - new Date(stored[spotId].startedAt).getTime();
    if (age < SESSION_MAX_AGE_MS) fresh[spotId] = stored[spotId];
  });
  return { ...seedSessions(), ...fresh };
}

function writeSessions(s: SessionsMap) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

interface SessionContextValue {
  sessions: SessionsMap;
  ready: boolean;
  startSession: (
    spotId: string,
    member: SessionMember
  ) => LiveSession;
  joinSession: (
    spotId: string,
    member: SessionMember
  ) => LiveSession;
  leaveSession: (spotId: string, memberId: string) => void;
  getSessionForSpot: (spotId: string) => LiveSession | null;
  getLiveCount: (spotId: string) => number;
  addMockMember: (spotId: string) => void;
  removeMockMember: (spotId: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const SELF_ID = 'self';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<SessionsMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessions(readSessions());
    setReady(true);
  }, []);

  function commit(next: SessionsMap) {
    setSessions(next);
    writeSessions(next);
  }

  const startSession = useCallback(
    (spotId: string, member: SessionMember): LiveSession => {
      let created: LiveSession;
      setSessions((prev) => {
        const existing = prev[spotId];
        if (existing) {
          const hasMember = existing.members.some(
            (m) => m.id === member.id
          );
          const members = hasMember
            ? existing.members
            : [...existing.members, member];
          created = { ...existing, members };
          const next = { ...prev, [spotId]: created };
          writeSessions(next);
          return next;
        }
        created = {
          id: `session-${Date.now()}`,
          spotId,
          startedAt: new Date().toISOString(),
          members: [member],
        };
        const next = { ...prev, [spotId]: created };
        writeSessions(next);
        return next;
      });
      return created!;
    },
    []
  );

  const joinSession = useCallback(
    (spotId: string, member: SessionMember): LiveSession => {
      return startSession(spotId, member);
    },
    [startSession]
  );

  const leaveSession = useCallback((spotId: string, memberId: string) => {
    setSessions((prev) => {
      const existing = prev[spotId];
      if (!existing) return prev;
      const members = existing.members.filter((m) => m.id !== memberId);
      if (members.length === 0) {
        const next = { ...prev };
        delete next[spotId];
        writeSessions(next);
        return next;
      }
      const next = { ...prev, [spotId]: { ...existing, members } };
      writeSessions(next);
      return next;
    });
  }, []);

  const getSessionForSpot = useCallback(
    (spotId: string): LiveSession | null => {
      return sessions[spotId] ?? null;
    },
    [sessions]
  );

  const getLiveCount = useCallback(
    (spotId: string): number => {
      return sessions[spotId]?.members.length ?? 0;
    },
    [sessions]
  );

  const addMockMember = useCallback((spotId: string) => {
    setSessions((prev) => {
      const existing = prev[spotId];
      const id = `mock-${Date.now()}`;
      const member: SessionMember = { id, named: false };
      const session: LiveSession = existing
        ? { ...existing, members: [...existing.members, member] }
        : {
            id: `session-${Date.now()}`,
            spotId,
            startedAt: new Date().toISOString(),
            members: [member],
          };
      const next = { ...prev, [spotId]: session };
      writeSessions(next);
      return next;
    });
  }, []);

  const removeMockMember = useCallback((spotId: string) => {
    setSessions((prev) => {
      const existing = prev[spotId];
      if (!existing) return prev;
      const mockMembers = existing.members.filter((m) =>
        m.id.startsWith('mock-')
      );
      if (mockMembers.length === 0) return prev;
      const toRemove = mockMembers[mockMembers.length - 1];
      const members = existing.members.filter((m) => m.id !== toRemove.id);
      const next = { ...prev };
      if (members.length === 0) {
        delete next[spotId];
      } else {
        next[spotId] = { ...existing, members };
      }
      writeSessions(next);
      return next;
    });
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      sessions,
      ready,
      startSession,
      joinSession,
      leaveSession,
      getSessionForSpot,
      getLiveCount,
      addMockMember,
      removeMockMember,
    }),
    [
      sessions,
      ready,
      startSession,
      joinSession,
      leaveSession,
      getSessionForSpot,
      getLiveCount,
      addMockMember,
      removeMockMember,
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
