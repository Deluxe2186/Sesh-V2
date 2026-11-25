'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettings } from '@/lib/settings';

export default function ThemeQuickToggle() {
  const { settings, update } = useSettings();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Track the resolved theme (what's actually applied to the document)
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    setResolvedTheme(current === 'dark' ? 'dark' : 'light');
  }, []);

  // Watch for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-theme');
      setResolvedTheme(current === 'dark' ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  function cycleTheme() {
    const modes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(settings.theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    update({ theme: nextMode });
  }

  const getIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'auto':
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getAriaLabel = () => {
    switch (settings.theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to auto mode';
      case 'auto':
        return 'Switch to light mode';
    }
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={getAriaLabel()}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-surface text-foreground hover:bg-background"
    >
      {getIcon()}
    </button>
  );
}