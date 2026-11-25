'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor, User, Mail, LogOut, Shield, Eye, Wifi, WifiOff, Trash2, Save, Clock, MapPin, Users, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useSettings } from '@/lib/settings';
import { getCurrentUser } from '@/lib/api';
import type { User as UserType } from '@/types';
import type { SeshUser } from '@/lib/auth';

// Extended user type for editing that includes email
interface EditableUser {
  name: string;
  email: string;
}
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { getCachedSpotsCount, clearOfflineCache, formatCacheSize } from '@/lib/offlineCache';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const THEME_MODES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'auto', label: 'Auto', icon: Monitor },
] as const;

const TIME_RULES = [
  { key: 'day', label: 'Day', time: '06:00–11:59', theme: 'Light' },
  { key: 'noon', label: 'Noon', time: '12:00–17:59', theme: 'Light' },
  { key: 'night', label: 'Night', time: '18:00–05:59', theme: 'Dark' },
] as const;

function getCurrentTimePeriod(autoRules: { day: { start: string; end: string }; noon: { start: string; end: string }; night: { start: string; end: string } }) {
  const now = new Date();
  const hours = now.getHours();

  const nightStart = parseInt(autoRules.night.start.split(':')[0], 10);
  const nightEnd = parseInt(autoRules.night.end.split(':')[0], 10);
  const dayStart = parseInt(autoRules.day.start.split(':')[0], 10);
  const dayEnd = parseInt(autoRules.day.end.split(':')[0], 10);
  const noonStart = parseInt(autoRules.noon.start.split(':')[0], 10);
  const noonEnd = parseInt(autoRules.noon.end.split(':')[0], 10);

  // Check if current hour is in night period (spans midnight)
  const isNight = hours >= 18 || hours < 6; // Default fallback
  // Actually use the configured night start/end
  const actualNightStart = parseInt(autoRules.night.start.split(':')[0], 10);
  const actualNightEnd = parseInt(autoRules.night.end.split(':')[0], 10);
  const isNightActual = hours >= actualNightStart || hours < actualNightEnd;

  const actualDayStart = parseInt(autoRules.day.start.split(':')[0], 10);
  const actualDayEnd = parseInt(autoRules.day.end.split(':')[0], 10);
  const actualNoonStart = parseInt(autoRules.noon.start.split(':')[0], 10);
  const actualNoonEnd = parseInt(autoRules.noon.end.split(':')[0], 10);

  let period: 'day' | 'noon' | 'night';
  if (isNightActual) {
    period = 'night';
  } else if (hours >= actualDayStart && hours <= actualDayEnd) {
    period = 'day';
  } else if (hours >= actualNoonStart && hours <= actualNoonEnd) {
    period = 'noon';
  } else {
    period = 'day'; // Default fallback
  }

  return { period, theme: { day: 'Light', noon: 'Light', night: 'Dark' }[period] };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function SettingsPage() {
  const { user, logOut } = useAuth();
  const { settings, update, toggle } = useSettings();
  const router = useRouter();

  const [editableUser, setEditableUser] = useState<EditableUser>({
  name: '',
  email: '',
});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [showLocationPermissionDialog, setShowLocationPermissionDialog] = useState(false);
  const [cachedSpotsCount, setCachedSpotsCount] = useState(0);

  // Load cached spots count on mount
  useEffect(() => {
    setCachedSpotsCount(getCachedSpotsCount());
  }, []);

  // Load user data for editing
  useEffect(() => {
    if (user) {
      setEditableUser({
        name: user.name,
        email: user.email || '',
      });
      setNewName(user.name);
      setNewEmail(user.email || '');
    }
  }, [user]);

  // Current time period for Auto theme
  const currentPeriod = getCurrentTimePeriod(settings.themeAutoRules);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      // In a real app, this would call an API to update the user profile
      // For now, we'll just update local state and show success
      // Update with the edited values
      setEditableUser({
        name: newName,
        email: newEmail,
      });
      setIsEditingProfile(false);
      toast.success('Profile saved');
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  const handleCancelEdit = () => {
    setEditableUser({
      name: user?.name || '',
      email: user?.email || '',
    });
    setNewName(user?.name || '');
    setNewEmail(user?.email || '');
    setIsEditingProfile(false);
  };

  const handleAutoJoinToggle = (enabled: boolean) => {
    if (enabled) {
      // Request location permission
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            // Permission granted
            toggle('autoJoin');
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              // Permission denied - show dialog with instructions
              setShowLocationPermissionDialog(true);
            } else {
              // Other error - still toggle off
              toggle('autoJoin');
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
        );
      } else {
        // Geolocation not supported
        toggle('autoJoin');
      }
    } else {
      toggle('autoJoin');
    }
  };

  const handleClearCache = () => {
    clearOfflineCache();
    setCachedSpotsCount(0);
    toast.success('Cached data cleared');
  };

  const handleLogOut = async () => {
    await logOut();
    router.push('/login');
  };

  const getPrivacyPreview = () => {
    if (settings.ghostMode) {
      return {
        title: 'Nothing. You are hidden and not counted.',
        description: 'Ghost mode is on. You won\'t appear in any session lists or headcounts.',
        variant: 'destructive' as const,
      };
    }
    if (settings.showByName) {
      return {
        title: 'Your initials, stance and level appear in the session list.',
        description: 'Other skaters nearby can see who you are.',
        variant: 'default' as const,
      };
    }
    return {
      title: 'You are counted in the headcount, but not named.',
      description: 'Others see a headcount increase but not your identity.',
      variant: 'secondary' as const,
    };
  };

  const privacyPreview = getPrivacyPreview();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your appearance, privacy, data usage, and account.
        </p>
      </div>

      {/* APPEARANCE Card */}
      <Card className="rounded-[12px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-accent" />
            Appearance
          </CardTitle>
          <CardDescription>
            Choose how Sesh looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          {/* Theme Selector */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Theme</Label>
            <ToggleGroup
              type="single"
              value={settings.theme}
              onValueChange={(value) => update({ theme: value as 'light' | 'dark' | 'auto' })}
              className="flex gap-2"
            >
              {THEME_MODES.map((mode) => (
                <ToggleGroupItem
                  key={mode.value}
                  value={mode.value}
                  className="flex items-center gap-2 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                >
                  <mode.icon className="h-4 w-4" />
                  {mode.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {/* Auto Theme Rules - shown when Auto is selected */}
            {settings.theme === 'auto' && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto rules</span>
                  <Badge variant="outline" className="text-xs">
                    Right now: {currentPeriod.period.charAt(0).toUpperCase() + currentPeriod.period.slice(1)}, using {currentPeriod.theme}
                  </Badge>
                </div>
                <div className="grid gap-2">
                  {TIME_RULES.map((rule) => {
                    const ruleConfig = settings.themeAutoRules[rule.key as keyof typeof settings.themeAutoRules];
                    const isCurrent = currentPeriod.period === rule.key;
                    return (
                      <div
                        key={rule.key}
                        className={cn(
                          'flex items-center justify-between rounded-lg p-3 text-sm transition-colors',
                          isCurrent ? 'bg-accent/10 border-accent' : 'bg-background'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-16 font-medium">{rule.label}</span>
                          <span className="text-muted">{rule.time}</span>
                          <Badge variant="outline" className="text-xs">
                            {rule.theme}
                          </Badge>
                        </div>
                        {isCurrent && (
                          <div className="flex items-center gap-1 text-accent text-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                            Active
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted">
                  Auto switches theme based on time of day. Edit the time ranges in the theme config if needed.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PRIVACY Card */}
      <Card className="rounded-[12px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Privacy
          </CardTitle>
          <CardDescription>
            Control what others can see about you in sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          {/* Ghost Mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Ghost mode</p>
              <p className="text-sm text-muted">
                Hide yourself completely. You are not counted in any session.
              </p>
            </div>
            <Toggle
              pressed={settings.ghostMode}
              onPressedChange={(value) => toggle('ghostMode')}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            />
          </div>

          {/* Show by Name */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show me by name in sessions</p>
              <p className="text-sm text-muted">
                Everyone nearby is counted. Turn this on to appear in the list with your initials, stance and level.
              </p>
            </div>
            <Toggle
              pressed={settings.showByName}
              onPressedChange={(value) => toggle('showByName')}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            />
          </div>

          {/* Auto-join Sessions */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-join sessions near a spot</p>
              <p className="text-sm text-muted">
                Counts you automatically when you are near a spot. Works only while Sesh is open.
              </p>
            </div>
            <Switch
              checked={settings.autoJoin}
              onCheckedChange={handleAutoJoinToggle}
              disabled={settings.ghostMode}
            />
          </div>

          {/* What Others Can See Preview */}
          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-sm font-medium mb-3">What others can see</p>
            <div className={cn(
              'rounded-lg p-3 text-sm',
              privacyPreview.variant === 'destructive' && 'bg-destructive/20 text-destructive border border-destructive/30',
              privacyPreview.variant === 'default' && 'bg-accent/20 text-accent border border-accent/30',
              privacyPreview.variant === 'secondary' && 'bg-muted/30 text-foreground border border-muted/30'
            )}>
              <p className="font-medium">{privacyPreview.title}</p>
              <p className="mt-1 text-xs opacity-90">{privacyPreview.description}</p>
            </div>
            <p className="mt-3 text-xs text-muted">
              Your exact position is never shown to other skaters.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* DATA Card */}
      <Card className="rounded-[12px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-accent" />
            Data
          </CardTitle>
          <CardDescription>
            Control how Sesh uses your mobile data.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          {/* Low Data Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <WifiOff className="h-5 w-5 text-muted" />
              </div>
              <div>
                <p className="font-medium">Low data mode</p>
                <p className="text-sm text-muted">
                  Uses less mobile data. Disables automatic weather fetch, video previews, and map animations.
                </p>
              </div>
            </div>
            <Toggle
              pressed={settings.lowDataMode}
              onPressedChange={(value) => toggle('lowDataMode')}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            />
          </div>

          {/* When low data mode is on, show what it affects */}
          {settings.lowDataMode && (
            <div className="rounded-lg bg-accent/10 border border-accent/20 p-4 space-y-2">
              <p className="text-sm font-medium text-accent">Low data mode is active</p>
              <ul className="text-sm text-muted space-y-1 pl-4 list-disc">
                <li>Weather shows "Load weather" button instead of auto-fetching</li>
                <li>Video previews disabled (shows poster + file size)</li>
                <li>Map animations and transitions disabled</li>
                <li>Images lazy-loaded at lowest available resolution</li>
              </ul>
            </div>
          )}

          {/* Saved on this Device */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="font-medium">Saved on this device</p>
              <p className="text-sm text-muted">
                {cachedSpotsCount} spot{cachedSpotsCount !== 1 ? 's' : ''} cached for offline access.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              disabled={cachedSpotsCount === 0}
              className="rounded-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear saved data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ACCOUNT Card */}
      <Card className="rounded-[12px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            Account
          </CardTitle>
          <CardDescription>
            Manage your profile and sign out.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          {/* Profile Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl font-bold bg-accent text-accent-foreground">
                {user ? getInitials(user.name) : '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditingProfile ? (
                <>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-xl font-bold font-display bg-transparent border-none outline-none focus:ring-2 focus:ring-accent rounded px-1 w-full"
                  />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 text-sm text-muted bg-transparent border-none outline-none focus:ring-2 focus:ring-accent rounded px-1 w-full"
                  />
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold font-display">{user?.name}</h2>
                  <p className="text-sm text-muted">@{user?.handle}</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditingProfile ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                  Edit profile
                </Button>
              )}
            </div>
          </div>

          {/* Username and Email */}
          {!isEditingProfile && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm text-muted">Username</Label>
                <p className="mt-1 font-medium text-muted">@{user?.handle}</p>
              </div>
              <div>
                <Label className="text-sm text-muted">Email</Label>
                <p className="mt-1 font-medium">{user?.email}</p>
              </div>
            </div>
          )}

          {/* Log Out */}
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              className="w-full rounded-full"
              onClick={handleLogOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}