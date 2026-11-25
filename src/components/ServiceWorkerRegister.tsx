'use client';

import { useEffect } from 'react';

// Registers the offline service worker. Skipped in development so it never
// serves stale files while building.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Not critical: the app works without it.
    });
  }, []);

  return null;
}
