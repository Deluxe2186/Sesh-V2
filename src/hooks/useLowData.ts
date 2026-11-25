'use client';

import { useSettings } from '@/lib/settings';

/**
 * Hook to check if low data mode is enabled
 * Returns true if low data mode is enabled, false otherwise
 */
export function useLowData(): boolean {
  const { settings } = useSettings();
  return settings.lowDataMode;
}