'use client';

import { useEffect, useState } from 'react';
import { useAutoJoin } from '@/lib/location';
import { SELF_ID, useSessions } from '@/lib/sessions';
import { useSettings } from '@/lib/settings';
import type { Spot } from '@/types';

export default function AutoJoinMount() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const { settings } = useSettings();
  const { sessions, leaveSession } = useSessions();

  useEffect(() => {
    let active = true;
    import('@/lib/api').then(({ getSpots }) => {
      getSpots().then((s) => {
        if (active) setSpots(s);
      });
    });
    return () => {
      active = false;
    };
  }, []);

  // Turning ghost mode on removes you from every session you are in.
  useEffect(() => {
    if (!settings.ghostMode) return;
    Object.keys(sessions).forEach((spotId) => {
      if (sessions[spotId].members.some((m) => m.id === SELF_ID)) {
        leaveSession(spotId, SELF_ID);
      }
    });
  }, [settings.ghostMode, sessions, leaveSession]);

  useAutoJoin(spots);
  return null;
}
