'use client';

import type { Spot } from '@/types';

const CACHE_KEY = 'sesh-spots-cache';
const CACHE_TIMESTAMP_KEY = 'sesh-spots-cache-timestamp';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedSpots {
  spots: Spot[];
  timestamp: number;
}

/**
 * Save spots to localStorage cache
 */
export function cacheSpots(spots: Spot[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(spots));
    window.localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Storage unavailable, ignore
  }
}

/**
 * Get cached spots if they exist and are not stale
 */
export function getCachedSpots(): Spot[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    const timestampRaw = window.localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!raw || !timestampRaw) return null;

    const timestamp = parseInt(timestampRaw, 10);
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      // Cache expired
      clearSpotsCache();
      return null;
    }

    return JSON.parse(raw) as Spot[];
  } catch {
    return null;
  }
}

/**
 * Clear the spots cache
 */
export function clearSpotsCache(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CACHE_KEY);
    window.localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Subscribe to online/offline events
 */
export function subscribeToOnlineStatus(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Get the count of cached spots
 */
export function getCachedSpotsCount(): number {
  const cached = getCachedSpots();
  return cached ? cached.length : 0;
}

/**
 * Clear all offline caches (spots, drafts, submissions, reports, sessions)
 */
export function clearOfflineCache(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('sesh-spots-cache');
    window.localStorage.removeItem('sesh-spots-cache-timestamp');
    window.localStorage.removeItem('sesh-spot-drafts');
    window.localStorage.removeItem('sesh-spot-submissions');
    window.localStorage.removeItem('sesh-security-reports');
    window.localStorage.removeItem('sesh-sessions');
  } catch {
    // Ignore
  }
}