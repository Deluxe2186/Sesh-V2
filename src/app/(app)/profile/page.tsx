'use client';

import { useEffect, useState } from 'react';
import { Edit, MapPin, Clock, Users, Plus, Check, X, Star, Target } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useSettings } from '@/lib/settings';
import { getSpots, getCurrentUser } from '@/lib/api';
import type { Spot, Obstacle } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { toast } from 'sonner';

const STANCES: { value: 'Regular' | 'Goofy'; label: string }[] = [
  { value: 'Regular', label: 'Regular' },
  { value: 'Goofy', label: 'Goofy' },
];

const LEVELS: { value: 'Beginner' | 'Intermediate' | 'Advanced'; label: string }[] = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

const OBSTACLES: Obstacle[] = [
  'Stairs',
  'Ramp',
  'Rail',
  'Ledge',
  'Gap',
  'Flatground',
  'Bank',
  'Manual pad',
  'Bowl',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours}h`;
}

export default function ProfilePage() {
  const { user, logOut } = useAuth();
  const { settings } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [recommendedSpots, setRecommendedSpots] = useState<Spot[]>([]);
  const [recentSessions, setRecentSessions] = useState<{
    spotName: string;
    area: string;
    date: string;
    hours: number;
  }[]>([]);
  const [notifyWeekly, setNotifyWeekly] = useState(false);
  const [notifyCosmetics, setNotifyCosmetics] = useState(false);
  const [editableUser, setEditableUser] = useState<{
    name: string;
    stance: 'Regular' | 'Goofy';
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    preferredObstacles: Obstacle[];
  }>({
    name: '',
    stance: 'Regular',
    level: 'Beginner',
    preferredObstacles: [],
  });
  const [fullUser, setFullUser] = useState<{
    id: string;
    name: string;
    handle: string;
    stance: 'Regular' | 'Goofy';
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    preferredObstacles: Obstacle[];
  } | null>(null);

  // Load spots and user data
  useEffect(() => {
    async function loadData() {
      const spotsData = await getSpots();
      setSpots(spotsData);

      // Get full user data from API
      const fullUserData = await getCurrentUser();
      setFullUser(fullUserData);

      // Generate recommended spots based on user's preferred obstacles
      const userSpots = spotsData.filter((spot) =>
        spot.obstacles.some((obs) => fullUserData.preferredObstacles?.includes(obs))
      );
      // Filter out spots the user has "visited" (simulated - using spots from submissions or recent sessions)
      // For now, just take first 3 matching spots
      setRecommendedSpots(userSpots.slice(0, 3));

      // Generate mock recent sessions
      const mockSessions = [
        { spotName: 'National Stadium', area: 'Surulere', date: '2 days ago', hours: 2.5 },
        { spotName: 'Church Street', area: 'Alapere', date: '5 days ago', hours: 1.5 },
        { spotName: 'Waf Skatepark', area: 'Lagos Island', date: '1 week ago', hours: 3 },
        { spotName: 'Ebute Metta Station', area: 'Ebute Metta', date: '2 weeks ago', hours: 2 },
      ];
      setRecentSessions(mockSessions);

      // Load notification preferences from localStorage
      if (typeof window !== 'undefined') {
        const notifyWeeklyStr = localStorage.getItem('notify-weekly-challenges');
        const notifyCosmeticsStr = localStorage.getItem('notify-cosmetics');
        setNotifyWeekly(notifyWeeklyStr === 'true');
        setNotifyCosmetics(notifyCosmeticsStr === 'true');
      }
    }
    loadData();
  }, [user]);

  const handleSaveProfile = async () => {
    // In a real app, this would call an API to update the user profile
    // For now, we'll just show a toast and exit edit mode
    toast.success('Profile saved');
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditableUser({
      name: '',
      stance: 'Regular',
      level: 'Beginner',
      preferredObstacles: [],
    });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditableUser({
      name: fullUser?.name || '',
      stance: fullUser?.stance || 'Regular',
      level: fullUser?.level || 'Beginner',
      preferredObstacles: fullUser?.preferredObstacles || [],
    });
    setIsEditing(true);
  };

  const handleObstacleToggle = (obstacle: Obstacle) => {
    const current = editableUser.preferredObstacles || [];
    if (current.includes(obstacle)) {
      setEditableUser({
        ...editableUser,
        preferredObstacles: current.filter((o) => o !== obstacle),
      });
    } else {
      setEditableUser({
        ...editableUser,
        preferredObstacles: [...current, obstacle],
      });
    }
  };

  const handleStanceChange = (value: 'Regular' | 'Goofy') => {
    setEditableUser({ ...editableUser, stance: value });
  };

  const handleLevelChange = (value: 'Beginner' | 'Intermediate' | 'Advanced') => {
    setEditableUser({ ...editableUser, level: value });
  };

  const handleNotifyToggle = (key: 'notifyWeekly' | 'notifyCosmetics', value: boolean) => {
    if (key === 'notifyWeekly') {
      setNotifyWeekly(value);
      localStorage.setItem('notify-weekly-challenges', String(value));
    } else {
      setNotifyCosmetics(value);
      localStorage.setItem('notify-cosmetics', String(value));
    }
    toast.success("We'll let you know");
  };

  // Mock stats - in a real app these would come from the API
  const stats = [
    { label: 'Session hours', value: '24h', icon: Clock },
    { label: 'Spots visited', value: '8', icon: MapPin },
    { label: 'Spots added', value: '3', icon: Plus },
    { label: 'Sessions joined', value: '12', icon: Users },
  ];

  const initials = user ? getInitials(user.name) : '?';

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="rounded-[12px]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl font-bold bg-accent text-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editableUser.name || ''}
                      onChange={(e) =>
                        setEditableUser({ ...editableUser, name: e.target.value })
                      }
                      className="text-2xl font-bold font-display bg-transparent border-none outline-none focus:ring-2 focus:ring-accent rounded px-1"
                    />
                    <p className="text-sm text-muted">@{user?.handle}</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold font-display">{user?.name}</h2>
                    <p className="text-sm text-muted">@{user?.handle}</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                Lagos
              </Badge>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile}>
                    Save
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-[12px]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{stat.value}</p>
                  <p className="text-sm text-muted">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skater Details Card */}
      <Card className="rounded-[12px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            Skater details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isEditing ? (
            <div className="space-y-6">
              {/* Stance */}
              <div>
                <label className="text-sm font-medium mb-2 block">Stance</label>
                <ToggleGroup
                  type="single"
                  value={editableUser.stance || 'Regular'}
                  onValueChange={handleStanceChange}
                  className="flex gap-2"
                >
                  {STANCES.map((s) => (
                    <ToggleGroupItem
                      key={s.value}
                      value={s.value}
                      className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                    >
                      {s.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">Level</label>
                <ToggleGroup
                  type="single"
                  value={editableUser.level || 'Beginner'}
                  onValueChange={handleLevelChange}
                  className="flex gap-2"
                >
                  {LEVELS.map((l) => (
                    <ToggleGroupItem
                      key={l.value}
                      value={l.value}
                      className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                    >
                      {l.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Preferred Obstacles */}
              <div>
                <label className="text-sm font-medium mb-2 block">Preferred obstacles</label>
                <div className="flex flex-wrap gap-2">
                  {OBSTACLES.map((obstacle) => {
                    const isSelected = editableUser.preferredObstacles?.includes(obstacle);
                    return (
                      <Toggle
                        key={obstacle}
                        pressed={isSelected}
                        onPressedChange={() => handleObstacleToggle(obstacle)}
                        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                      >
                        {obstacle}
                      </Toggle>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <dl className="grid gap-4 md:grid-cols-3">
              <div>
                <dt className="text-sm text-muted">Stance</dt>
                <dd className="mt-1 font-medium">{fullUser?.stance}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Level</dt>
                <dd className="mt-1 font-medium">{fullUser?.level}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Preferred obstacles</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {fullUser?.preferredObstacles?.map((o) => (
                    <Badge key={o} variant="outline" className="gap-1">
                      {o}
                    </Badge>
                  ))}
                </dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Spots You Might Like */}
      <Card className="rounded-[12px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            Spots you might like
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedSpots.length > 0 ? (
              recommendedSpots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/spot/${spot.id}`}
                  className="block rounded-[12px] border bg-surface p-3 transition-colors hover:border-accent"
                >
                  <div className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-muted" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold font-display">{spot.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                        <MapPin className="h-3 w-3" />
                        {spot.area}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {spot.obstacles.slice(0, 3).map((o) => (
                          <Badge key={o} variant="outline" className="text-[11px]">
                            {o}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-muted">
                        Matches your love of {fullUser?.preferredObstacles?.slice(0, 2).join(' and ') || 'your favorite obstacles'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted">
                No matching spots found. Add more preferred obstacles to get recommendations.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card className="rounded-[12px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Recent sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {recentSessions.map((session, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-full border px-4 py-2.5 text-sm hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 font-bold text-accent">{i + 1}</span>
                  <div>
                    <p className="font-medium">{session.spotName}</p>
                    <p className="text-xs text-muted">{session.area}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatHours(session.hours)}</p>
                  <p className="text-xs text-muted">{session.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card className="rounded-[12px] border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-accent" />
            Coming soon
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Weekly challenges */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div>
              <p className="font-medium">Weekly challenges</p>
              <p className="text-sm text-muted">
                Land the trick of the week and win prizes from brands
              </p>
            </div>
            <Toggle
              pressed={notifyWeekly}
              onPressedChange={(value) => handleNotifyToggle('notifyWeekly', value)}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              Notify me
            </Toggle>
          </div>

          {/* Avatar and board customization */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div>
              <p className="font-medium">Avatar and board customization</p>
              <p className="text-sm text-muted">
                Earn cosmetics through session hours
              </p>
            </div>
            <Toggle
              pressed={notifyCosmetics}
              onPressedChange={(value) => handleNotifyToggle('notifyCosmetics', value)}
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              Notify me
            </Toggle>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}