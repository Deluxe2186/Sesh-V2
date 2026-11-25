'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/lib/settings';

export function useTheme() {
  const { settings } = useSettings();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Compute the effective theme based on settings
  useEffect(() => {
    let theme: 'light' | 'dark';

    if (settings.theme === 'auto') {
      const now = new Date();
      const hours = now.getHours();

      // Check which time period we're in
      const nightStart = parseInt(settings.themeAutoRules.night.start.split(':')[0], 10);
      const nightEnd = parseInt(settings.themeAutoRules.night.end.split(':')[0], 10);
      const dayStart = parseInt(settings.themeAutoRules.day.start.split(':')[0], 10);
      const dayEnd = parseInt(settings.themeAutoRules.day.end.split(':')[0], 10);
      const noonStart = parseInt(settings.themeAutoRules.noon.start.split(':')[0], 10);
      const noonEnd = parseInt(settings.themeAutoRules.noon.end.split(':')[0], 10);

      // Check if current hour is in night period (18:00 - 05:59)
      // Night spans midnight, so we check if hour >= nightStart OR hour < nightEnd
      const isNight = hours >= nightStart || hours < nightEnd;

      if (isNight) {
        theme = settings.themeAutoRules.night.theme;
      } else if (hours >= dayStart && hours <= dayEnd) {
        theme = settings.themeAutoRules.day.theme;
      } else if (hours >= noonStart && hours <= noonEnd) {
        theme = settings.themeAutoRules.noon.theme;
      } else {
        // Default to day theme for any gaps
        theme = settings.themeAutoRules.day.theme;
      }
    } else {
      theme = settings.theme;
    }

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    setResolvedTheme(theme);
  }, [settings.theme, settings.themeAutoRules]);

  // Also apply theme when settings change
  useEffect(() => {
    if (settings.theme !== 'auto') {
      document.documentElement.setAttribute('data-theme', settings.theme);
      setResolvedTheme(settings.theme);
    }
  }, [settings.theme]);

  return {
    theme: settings.theme,
    resolvedTheme,
    setTheme: (theme: 'light' | 'dark' | 'auto') => {
      // This will be handled by the SettingsProvider's update function
      // We just need to update the settings
    },
  };
}

/**
 * Hook to get the current resolved theme (light or dark)
 * Useful for components that need to know the current theme
 */
export function useResolvedTheme() {
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
    setResolvedTheme(theme || 'light');

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
      setResolvedTheme(theme || 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  return resolvedTheme;
}