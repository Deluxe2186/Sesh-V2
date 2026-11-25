'use client';

import type { Spot } from '@/types';

const OFFLINE_CACHE_KEY = 'sesh-offline-spots';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  spots: Spot[];
  timestamp: number;
}

/**
 * Save spots to offline cache (localStorage)
 */
export function saveSpots(spots: Spot[]): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry = {
      spots,
      timestamp: Date.now(),
    };
    window.localStorage.setItem('sesh-offline-spots', JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to save spots to offline cache:', error);
  }
}

/**
 * Get spots from offline cache
 * Returns null if cache is empty or expired
 */
export function getCachedSpots(): Spot[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('sesh-offline-spots');
    if (!raw) return null;

    const entry: CacheEntry = JSON.parse(raw);

    // Check if cache is expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      window.localStorage.removeItem('sesh-offline-spots');
      return null;
    }

    return entry.spots;
  } catch (error) {
    console.warn('Failed to read offline cache:', error);
    return null;
  }
}

/**
 * Get the number of cached spots
 */
export function getCachedSpotsCount(): number {
  const cached = getCachedSpots();
  return cached?.length ?? 0;
}

/**
 * Clear the offline cache
 */
export function clearOfflineCache(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('sesh-offline-spots');
  } catch (error) {
    console.warn('Failed to clear offline cache:', error);
  }
}

/**
 * Get the cache size in bytes (approximate)
 */
export function getCacheSize(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem('sesh-offline-spots');
    return raw ? raw.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Format cache size for display
 */
export function formatCacheSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Check if cache has valid data
 */
export function hasValidCache(): boolean {
  return getCachedSpots() !== null;
}