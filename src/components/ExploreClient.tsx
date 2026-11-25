'use client';

import { Check, MapPin, Users, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import PhotoPlaceholder from '@/components/PhotoPlaceholder';
import SpotMapClient from '@/components/SpotMapClient';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSessions } from '@/lib/sessions';
import { useAuth } from '@/components/AuthProvider';
import type { Obstacle, Spot } from '@/types';
import { toast } from 'sonner';

type FilterId = 'all' | 'live' | Obstacle;

const FILTER_PILLS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live now' },
  { id: 'Stairs', label: 'Stairs' },
  { id: 'Rail', label: 'Rails' },
  { id: 'Ledge', label: 'Ledges' },
  { id: 'Ramp', label: 'Ramps' },
  { id: 'Flatground', label: 'Flatground' },
];

function CardSkeleton() {
  return (
    <div className="flex gap-3 rounded-[12px] border bg-surface p-3">
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-[8px] bg-border" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-border" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-border" />
        <div className="mt-1 h-3 w-1/2 animate-pulse rounded-full bg-border" />
      </div>
    </div>
  );
}

export default function ExploreClient({ spots }: { spots: Spot[] }) {
  const router = useRouter();
  const { sessions } = useSessions();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activePills, setActivePills] = useState<Set<FilterId>>(
    () => new Set<FilterId>(['all'])
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionSpot, setSessionSpot] = useState<string>(spots[0]?.id ?? '');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  function togglePill(id: FilterId) {
    setActivePills((prev) => {
      const next = new Set(prev);
      if (id === 'all') {
        next.clear();
        next.add('all');
        return next;
      }
      next.delete('all');
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size === 0) next.add('all');
      return next;
    });
  }

  const liveCountFor = (id: string): number =>
    sessions[id]?.members.length ?? 0;

  const filtered = useMemo(() => {
    let result = spots;
    const showAll = activePills.has('all') || activePills.size === 0;
    if (!showAll) {
      result = result.filter((spot) => {
        const liveOk = !activePills.has('live') || liveCountFor(spot.id) > 0;
        const obstacleOk = Array.from(activePills)
          .filter((p): p is Obstacle => p !== 'live')
          .every((obs) => spot.obstacles.includes(obs));
        return liveOk && obstacleOk;
      });
    }
    return [...result].sort(
      (a, b) => liveCountFor(b.id) - liveCountFor(a.id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots, activePills, sessions]);

  function handleStartSession() {
    if (!sessionSpot) return;
    setStarting(true);
    const { startSession: start } = useSessionsRef.current;
    start(sessionSpot, {
      id: 'self',
      named: false,
    });
    toast.success('Session started');
    router.push(`/spot/${sessionSpot}`);
    setStarting(false);
  }

  return (
    <div className="flex h-[calc(100vh-64px)] gap-6">
      {/* Left panel */}
      <aside className="flex w-[380px] shrink-0 flex-col gap-4 overflow-y-auto pr-1">
        <div>
          <h1 className="text-2xl font-bold font-display">Spots near you</h1>
          <p className="mt-1 text-sm text-muted">Sorted by live activity</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_PILLS.map((pill) => {
            const active = activePills.has(pill.id);
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => togglePill(pill.id)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'bg-surface text-muted hover:text-foreground'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="rounded-[12px] border bg-surface p-8 text-center">
              <p className="text-sm font-medium">No spots match those filters</p>
              <p className="mt-1 text-sm text-muted">
                Try clearing a filter or pick a different obstacle.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => setActivePills(new Set<FilterId>(['all']))}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            filtered.map((spot) => {
              const isHighlighted = selectedId === spot.id || hoveredId === spot.id;
              return (
                <Link
                  key={spot.id}
                  href={`/spot/${spot.id}`}
                  onMouseEnter={() => setHoveredId(spot.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(spot.id)}
                  onBlur={() => setHoveredId(null)}
                  onClick={() => setSelectedId(spot.id)}
                  className={`block rounded-[12px] border bg-surface p-3 transition-colors hover:border-accent ${
                    isHighlighted ? 'border-accent ring-1 ring-accent' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[8px]">
                      <PhotoPlaceholder label="" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="truncate font-semibold font-display">
                          {spot.name}
                        </h2>
                        {spot.verified && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                            <Check className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                        <MapPin className="h-3 w-3" />
                        {spot.area}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {spot.obstacles.map((o) => (
                          <span
                            key={o}
                            className="rounded-full border px-2 py-0.5 text-[11px] text-muted"
                          >
                            {o}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs">
                        {liveCountFor(spot.id) > 0 ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-[var(--live)]" />
                            <span className="font-semibold text-[var(--live)]">
                              {liveCountFor(spot.id)} skating now
                            </span>
                          </>
                        ) : (
                          <span className="text-muted">No one yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {bannerOpen && !loading && (
          <div className="mt-2 flex items-center gap-3 rounded-[12px] border bg-surface p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <MapPin className="h-4 w-4" />
            </span>
            <p className="flex-1 text-sm">
              Visiting Lagos? Open Sesh to see where the session is.
            </p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setBannerOpen(false)}
              className="rounded-full p-1 text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Map */}
      <div className="relative flex-1">
        <SpotMapClient
          spots={filtered}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={(id) => setSelectedId(id)}
          onHover={setHoveredId}
          onView={(id) => router.push(`/spot/${id}`)}
          height="100%"
        />

        <button
          type="button"
          onClick={() => setSessionOpen(true)}
          className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-lg transition-transform hover:scale-[1.02]"
        >
          <Zap className="h-4 w-4" />
          Start a session
        </button>
      </div>

      <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you at a skate spot?</DialogTitle>
            <DialogDescription>
              Pick where you are and start a session so other skaters can find
              you.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <label className="text-sm font-medium">Spot</label>
            <Select value={sessionSpot} onValueChange={setSessionSpot}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a spot" />
              </SelectTrigger>
              <SelectContent>
                {spots.map((spot) => (
                  <SelectItem key={spot.id} value={spot.id}>
                    {spot.name} — {spot.area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setSessionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full"
              onClick={handleStartSession}
              disabled={starting || !sessionSpot}
            >
              {starting ? 'Starting…' : 'Start session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
