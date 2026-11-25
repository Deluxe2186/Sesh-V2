'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeAutoRules {
  day: { start: string; end: string; theme: 'light' };
  noon: { start: string; end: string; theme: 'light' };
  night: { start: string; end: string; theme: 'dark' };
}

export interface SeshSettings {
  ghostMode: boolean;
  showByName: boolean;
  autoJoin: boolean;
  lowDataMode: boolean;
  theme: ThemeMode;
  themeAutoRules: ThemeAutoRules;
  notifyWeeklyChallenges: boolean;
  notifyCosmetics: boolean;
}

const DEFAULT_THEME_AUTO_RULES: ThemeAutoRules = {
  day: { start: '06:00', end: '11:59', theme: 'light' },
  noon: { start: '12:00', end: '17:59', theme: 'light' },
  night: { start: '18:00', end: '05:59', theme: 'dark' },
};

const DEFAULT_SETTINGS: SeshSettings = {
  ghostMode: false,
  showByName: false,
  autoJoin: false,
  lowDataMode: false,
  theme: 'auto',
  themeAutoRules: DEFAULT_THEME_AUTO_RULES,
  notifyWeeklyChallenges: false,
  notifyCosmetics: false,
};

const STORAGE_KEY = 'sesh-settings';

type PartialSettings = Partial<SeshSettings>;

interface SettingsContextValue {
  settings: SeshSettings;
  ready: boolean;
  update: (patch: PartialSettings) => void;
  toggle: <K extends keyof SeshSettings>(key: K) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readSettings(): SeshSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as PartialSettings;
    // Merge with defaults to handle new settings added after user's last visit
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(s: SeshSettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// Helper to show "Saved" toast
function showSavedToast() {
  toast.success('Saved', { duration: 1500 });
}

// Helper to compute and apply theme to document
function applyTheme(settings: SeshSettings) {
  if (typeof window === 'undefined') return;

  let theme: 'light' | 'dark';

  if (settings.theme === 'auto') {
    const now = new Date();
    const hours = now.getHours();

    const nightStart = parseInt(settings.themeAutoRules.night.start.split(':')[0], 10);
    const nightEnd = parseInt(settings.themeAutoRules.night.end.split(':')[0], 10);

    // Night spans midnight, so check if hour >= nightStart OR hour < nightEnd
    const isNight = hours >= nightStart || hours < nightEnd;

    if (isNight) {
      theme = settings.themeAutoRules.night.theme;
    } else {
      // Default to light for day and noon periods
      theme = settings.themeAutoRules.day.theme;
    }
  } else {
    theme = settings.theme;
  }

  document.documentElement.setAttribute('data-theme', theme);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SeshSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  // Apply theme on initial load
  useEffect(() => {
    const loadedSettings = readSettings();
    setSettings(loadedSettings);
    applyTheme(loadedSettings);
    setReady(true);
  }, []);

  // Apply theme whenever settings change
  useEffect(() => {
    if (ready) {
      applyTheme(settings);
    }
  }, [settings, ready]);

  const update = useCallback((patch: PartialSettings) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      writeSettings(next);
      return next;
    });
    // Show saved toast after state update
    setTimeout(showSavedToast, 0);
  }, []);

  const toggle = useCallback(
    <K extends keyof SeshSettings>(key: K) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        writeSettings(next);
        return next;
      });
      // Show saved toast after state update
      setTimeout(showSavedToast, 0);
    },
    []
  );

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, ready, update, toggle }),
    [settings, ready, update, toggle]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
