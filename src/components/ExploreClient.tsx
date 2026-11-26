'use client';

import { Check, MapPin, X, Zap } from 'lucide-react';
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
import { useSessions, SELF_ID } from '@/lib/sessions';
import { useSettings } from '@/lib/settings';
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

function CardSkeleton({ index }: { index: number }) {
  return (
    <div className="flex gap-3 rounded-[12px] border bg-surface p-3 animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="h-16 w-16 shrink-0 shimmer rounded-[8px]" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="h-3.5 w-2/3 shimmer rounded" />
        <div className="h-3 w-1/3 shimmer rounded" />
        <div className="mt-1 h-3 w-1/2 shimmer rounded-full" />
      </div>
    </div>
  );
}

function FilterPill({ pill, active, onClick }: { pill: typeof FILTER_PILLS[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-fast ease-out press-scale lg:min-h-0 ${
        active
          ? 'border-accent bg-accent text-accent-foreground shadow-sm'
          : 'bg-surface text-muted hover:text-foreground hover:bg-surface-elevated hover:border-accent/30'
      }`}
      aria-pressed={active}
    >
      {pill.label}
    </button>
  );
}

function SpotCard({ spot, liveCount, isHighlighted, onClick }: {
  spot: Spot;
  liveCount: number;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={`/spot/${spot.id}`}
      onClick={onClick}
      className={`block rounded-[12px] border bg-surface p-3 transition-all duration-normal ease-out card-hover hover-lift press-scale ${
        isHighlighted ? 'border-accent ring-1 ring-accent shadow-md' : ''
      }`}
    >
      <div className="flex gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[8px] transition-transform duration-normal group-hover:scale-[1.02]">
          <PhotoPlaceholder label="" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="truncate font-semibold font-display transition-colors duration-fast group-hover:text-accent">
              {spot.name}
            </h2>
            {spot.verified && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent transition-all duration-fast group-hover:bg-accent/20">
                <Check className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {spot.area}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {spot.obstacles.map((o) => (
              <span
                key={o}
                className="rounded-full border px-2 py-0.5 text-[11px] text-muted transition-all duration-fast group-hover:border-accent/50 group-hover:text-accent"
              >
                {o}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {liveCount > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-[var(--live)] animate-pulse" />
                <span className="font-semibold text-[var(--live)]">
                  {liveCount} skating now
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
}

export default function ExploreClient({ spots }: { spots: Spot[] }) {
  const router = useRouter();
  const { sessions, startSession } = useSessions();
  const { settings } = useSettings();
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
  // Phones show the map or the list, not both
  const [view, setView] = useState<'map' | 'list'>('map');

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

  // Map markers use the same live counts as the list, so both always agree.
  const mapSpots = useMemo(
    () => filtered.map((s) => ({ ...s, liveCount: liveCountFor(s.id) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, sessions]
  );

  function handleStartSession() {
    if (!sessionSpot) return;
    if (settings.ghostMode) {
      toast.error('Ghost mode is on. Turn it off to start a session.');
      return;
    }
    setStarting(true);
    const named = settings.showByName;
    startSession(sessionSpot, {
      id: SELF_ID,
      named,
      ...(named && user
        ? { name: user.name, stance: user.stance, level: user.level }
        : {}),
    });
    setSessionOpen(false);
    toast.success('Session started');
    router.push(`/spot/${sessionSpot}`);
    setStarting(false);
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-hidden animate-fade-in-up">
      {/* Map | List switch (phones only) */}
      <div
        role="tablist"
        aria-label="Spots view"
        className="grid shrink-0 grid-cols-2 rounded-full border bg-surface p-1 lg:hidden animate-fade-in-up"
      >
        {(['map', 'list'] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`min-h-[44px] rounded-full text-sm font-semibold transition-all duration-fast ease-out press-scale ${
              view === v
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            {v === 'map' ? "Map" : "List"}
          </button>
        ))}
      </div>

      {/* Mobile session action stays above the active map/list view. */}
      <div className="flex shrink-0 justify-end animate-fade-in-up lg:hidden" style={{ animationDelay: '100ms' }}>
        <button
          type="button"
          onClick={() => setSessionOpen(true)}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-lg hover-lift press-scale transition-all duration-fast"
          aria-label="Start a skate session"
        >
          <Zap className="h-4 w-4 transition-transform group-hover:rotate-12" />
          Start a session
        </button>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 gap-3 lg:gap-6">
      {/* Left panel */}
      <aside
        className={`min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto pr-1 lg:flex lg:w-[380px] lg:flex-none lg:shrink-0 animate-fade-in-right ${
          view === 'list' ? "flex" : "hidden"
        }`}
        style={{ animationDelay: '150ms' }}
      >
        <div className="flex-shrink-0 animate-fade-in-up">
          <h1 className="text-2xl font-bold font-display">Spots near you</h1>
          <p className="mt-1 text-sm text-muted">Sorted by live activity</p>
        </div>

        <div className="flex-shrink-0 flex flex-wrap gap-2 animate-stagger-fade-in" role="group" aria-label="Filter spots">
          {FILTER_PILLS.map((pill, index) => (
            <FilterPill
              key={pill.id}
              pill={pill}
              active={activePills.has(pill.id)}
              onClick={() => togglePill(pill.id)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-1 pb-4 animate-stagger-fade-in">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} index={i} />)
          ) : filtered.length === 0 ? (
            <div className="rounded-[12px] border bg-surface p-8 text-center animate-fade-in-up">
              <p className="text-sm font-medium">No spots match those filters</p>
              <p className="mt-1 text-sm text-muted">
                Try clearing a filter or pick a different obstacle.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-full press-scale"
                onClick={() => setActivePills(new Set<FilterId>(['all']))}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            filtered.map((spot, index) => {
              const liveCount = liveCountFor(spot.id);
              const isHighlighted = selectedId === spot.id || hoveredId === spot.id;
              return (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  liveCount={liveCount}
                  isHighlighted={isHighlighted}
                  onClick={() => setSelectedId(spot.id)}
                />
              );
            })
          )}
        </div>

        {bannerOpen && !loading && (
          <div className="mt-2 flex items-center gap-3 rounded-[12px] border bg-surface p-4 animate-fade-in-up hover-lift-sm" style={{ animationDelay: '200ms' }}>
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
              className="rounded-full p-1 text-muted hover:text-foreground hover:bg-surface-elevated transition-colors duration-fast press-scale"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Map column: desktop session action sits directly above the map. */}
      <section
        className={`min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex ${
          view === 'map' ? 'flex' : 'hidden'
        }`}
      >
        <div className="hidden shrink-0 justify-end lg:flex animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <button
            type="button"
            onClick={() => setSessionOpen(true)}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-lg hover-lift press-scale transition-all duration-fast"
            aria-label="Start a skate session"
          >
            <Zap className="h-4 w-4 transition-transform group-hover:rotate-12" />
            Start a session
          </button>
        </div>
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <SpotMapClient
            spots={mapSpots}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={(id) => setSelectedId(id)}
            onHover={setHoveredId}
            onView={(id) => router.push(`/spot/${id}`)}
            height="100%"
          />
        </div>
      </section>
      </div>

      <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
        <DialogContent className="sm:max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle>Are you at a skate spot?</DialogTitle>
            <DialogDescription>
              Pick where you are and start a session so other skaters can find
              you.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2 animate-stagger-fade-in">
            <label className="text-sm font-medium stagger-1 animate-fade-in-up">Spot</label>
            <Select value={sessionSpot} onValueChange={setSessionSpot}>
              <SelectTrigger className="w-full press-scale">
                <SelectValue placeholder="Select a spot" />
              </SelectTrigger>
              <SelectContent className="animate-fade-in-up">
                {spots.map((spot) => (
                  <SelectItem key={spot.id} value={spot.id}>
                    {spot.name} — {spot.area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="animate-stagger-fade-in">
            <Button
              variant="outline"
              className="rounded-full press-scale stagger-1 animate-fade-in-up"
              onClick={() => setSessionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full press-scale stagger-2 animate-fade-in-up"
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