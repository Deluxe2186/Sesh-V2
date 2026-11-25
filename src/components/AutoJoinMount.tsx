'use client';

import { useEffect, useState } from 'react';
import { useAutoJoin } from '@/lib/location';
import type { Spot } from '@/types';

export default function AutoJoinMount() {
  const [spots, setSpots] = useState<Spot[]>([]);

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

  useAutoJoin(spots);
  return null;
}
