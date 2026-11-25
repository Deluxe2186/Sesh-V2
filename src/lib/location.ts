'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useSettings } from '@/lib/settings';
import { useSessions } from '@/lib/sessions';
import { useAuth } from '@/components/AuthProvider';
import type { Spot } from '@/types';

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useAutoJoin(spots: Spot[]): void {
  const { settings } = useSettings();
  const { getSessionForSpot, startSession, joinSession, leaveSession } =
    useSessions();
  const { user } = useAuth();

  const watchIdRef = useRef<number | null>(null);
  const joinedSpotRef = useRef<string | null>(null);
  const farSinceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!settings.autoJoin || settings.ghostMode) {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (joinedSpotRef.current) {
        leaveSession(joinedSpotRef.current, 'self');
        joinedSpotRef.current = null;
      }
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    function buildMember() {
      const named = settings.showByName;
      return {
        id: 'self',
        named,
        name: named ? user?.name : undefined,
        stance: named ? user?.stance : undefined,
        level: named ? user?.level : undefined,
      };
    }

    function handlePosition(pos: GeolocationPosition) {
      const { latitude, longitude } = pos.coords;

      let nearest: Spot | null = null;
      let nearestDist = Infinity;
      for (const spot of spots) {
        const d = haversineMeters(latitude, longitude, spot.lat, spot.lng);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = spot;
        }
      }

      if (nearest && nearestDist <= 75) {
        farSinceRef.current = null;
        if (joinedSpotRef.current !== nearest.id) {
          const existing = getSessionForSpot(nearest.id);
          if (existing) {
            joinSession(nearest.id, buildMember());
          } else {
            startSession(nearest.id, buildMember());
          }
          joinedSpotRef.current = nearest.id;
          toast.success(
            `You're at ${nearest.name}. You're being counted.`
          );
        }
      } else if (joinedSpotRef.current) {
        if (nearestDist > 150) {
          if (farSinceRef.current === null) {
            farSinceRef.current = Date.now();
          } else if (Date.now() - farSinceRef.current >= 120000) {
            leaveSession(joinedSpotRef.current, 'self');
            joinedSpotRef.current = null;
            farSinceRef.current = null;
          }
        }
      }
    }

    function handleError(err: GeolocationPositionError) {
      if (err.code === err.PERMISSION_DENIED) {
        // Silently ignore — user denied location.
      }
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 27000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.autoJoin,
    settings.ghostMode,
    settings.showByName,
    spots,
    user,
  ]);
}
