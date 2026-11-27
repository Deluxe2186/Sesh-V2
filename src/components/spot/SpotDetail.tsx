'use client';

import { Check, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import ConditionsCard from '@/components/spot/ConditionsCard';
import DevTools from '@/components/spot/DevTools';
import MobileSessionBar from '@/components/spot/MobileSessionBar';
import LiveSessionCard from '@/components/spot/LiveSessionCard';
import RecentSessions from '@/components/spot/RecentSessions';
import SecurityCard from '@/components/spot/SecurityCard';
import PhotoPlaceholder from '@/components/PhotoPlaceholder';
import SpotMapClient from '@/components/SpotMapClient';
import { useSessions } from '@/lib/sessions';
import type { Spot } from '@/types';

// recharts is only needed on this page, so load it on demand.
const BestTimeCard = dynamic(
  () => import('@/components/spot/BestTimeCard'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] animate-pulse rounded-[12px] border bg-surface" />
    ),
  }
);

export default function SpotDetail({ spot }: { spot: Spot }) {
  const { getLiveCount } = useSessions();
  const [liveCount, setLiveCount] = useState(0);
  const [selectedMapSpotId, setSelectedMapSpotId] = useState(spot.id);
  const [focusRequest, setFocusRequest] = useState<{ id: string; request: number } | null>(null);

  useEffect(() => {
    setLiveCount(getLiveCount(spot.id));
    setSelectedMapSpotId(spot.id);
    setFocusRequest((current) => ({ id: spot.id, request: (current?.request ?? 0) + 1 }));
  }, [getLiveCount, spot.id]);

  function focusSpotOnMap(id: string) {
    setSelectedMapSpotId(id);
    setFocusRequest((current) => ({ id, request: (current?.request ?? 0) + 1 }));
  }

  const mapSpots = useMemo(() => [{ ...spot, liveCount }], [spot, liveCount]);

  return (
    <div className="mx-auto max-w-5xl pb-20 lg:pb-0 animate-stagger-fade-in">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted animate-fade-in-up stagger-1">
        <Link href="/explore" className="hover:text-foreground transition-colors duration-fast press-scale">
          Explore
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{spot.name}</span>
      </nav>

      {/* Header card */}
      <div className="rounded-[16px] border bg-surface p-6 card-hover hover-lift-sm animate-fade-in-up stagger-2">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Gallery */}
          <div className="flex flex-1 gap-3">
            <div className="min-w-0 flex-1 animate-scale-in stagger-1" style={{ animationDelay: '100ms' }}>
              <PhotoPlaceholder label="" />
            </div>
            <div className="hidden w-32 flex-col gap-3 sm:flex animate-stagger-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="h-[72px] animate-fade-in-up stagger-1">
                <PhotoPlaceholder label="" />
              </div>
              <div className="h-[72px] animate-fade-in-up stagger-2">
                <PhotoPlaceholder label="" />
              </div>
              <div className="h-[72px] animate-fade-in-up stagger-3">
                <PhotoPlaceholder label="" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex w-full flex-col justify-center gap-3 md:w-[280px] animate-fade-in-up stagger-3" style={{ animationDelay: '200ms' }}>
            <div>
              <h1 className="text-2xl font-bold font-display">{spot.name}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                <MapPin className="h-3.5 w-3.5" />
                {spot.area}, Lagos
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {spot.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent transition-all duration-fast hover:bg-accent/20 hover-lift-sm press-scale">
                  <Check className="h-3 w-3" />
                  Verified
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-normal ${
                  liveCount > 0
                    ? 'bg-live/10 text-live'
                    : 'border text-muted'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full transition-all duration-normal ${
                    liveCount > 0 ? 'bg-live animate-pulse' : 'bg-muted'
                  }`}
                />
                {liveCount > 0 ? `${liveCount} live` : 'Quiet'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Location map */}
      <section aria-label={`Map of ${spot.name}`} className="mt-6 overflow-hidden rounded-[12px] border bg-surface p-3">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-sm font-semibold">Find this spot</h2>
            <p className="text-xs text-muted">{spot.area}, Lagos</p>
          </div>
          <span className="text-xs font-medium text-muted">{liveCount} skating now</span>
        </div>
        <div className="relative h-[300px] overflow-hidden rounded-[10px] sm:h-[360px] lg:h-[420px]">
          <SpotMapClient
            spots={mapSpots}
            selectedId={selectedMapSpotId}
            focusRequest={focusRequest}
            onSelect={focusSpotOnMap}
            height="100%"
          />
        </div>
      </section>

      {/* Two columns */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row animate-stagger-fade-in">
        {/* Main column */}
        <div className="order-2 flex min-w-0 flex-1 flex-col gap-4 lg:order-none animate-fade-in-right">
          {/* About */}
          <div className="rounded-[12px] border bg-surface p-5 card-hover hover-lift-sm animate-fade-in-up stagger-1">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              About this spot
            </h2>
            <div className="flex flex-wrap gap-1.5 animate-stagger-fade-in">
              {spot.obstacles.map((o, i) => (
                <span
                  key={o}
                  className="rounded-full border px-3 py-1 text-sm transition-all duration-fast hover:border-accent/50 hover:text-accent hover:bg-accent/5 press-scale stagger-1 animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {o}
                </span>
              ))}
            </div>
            <dl className="mt-4 flex flex-col gap-2 text-sm animate-stagger-fade-in">
              <div className="flex justify-between border-b pb-2 stagger-1 animate-fade-in-up">
                <dt className="text-muted">Surface</dt>
                <dd className="font-medium">{spot.surface}</dd>
              </div>
              <div className="flex justify-between border-b pb-2 stagger-2 animate-fade-in-up">
                <dt className="text-muted">Shelter</dt>
                <dd className="font-medium">{spot.shelter}</dd>
              </div>
              <div className="flex justify-between stagger-3 animate-fade-in-up">
                <dt className="text-muted">Best time</dt>
                <dd className="text-right font-medium">{spot.bestTime}</dd>
              </div>
            </dl>
            <div className="mt-4 border-t pt-4 animate-fade-in-up stagger-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Tips
              </h3>
              <ul className="flex flex-col gap-2 animate-stagger-fade-in">
                {spot.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm stagger-1 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground transition-transform duration-fast hover:scale-110">
                      {i + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <SecurityCard spot={spot} />
          <ConditionsCard spot={spot} />
          <BestTimeCard spot={spot} />
          <RecentSessions spotId={spot.id} />
        </div>

        {/* Sidebar */}
        <div className="order-1 flex w-full shrink-0 flex-col gap-4 lg:order-none lg:w-[360px] animate-fade-in-left">
          <LiveSessionCard spotId={spot.id} />
          <DevTools spotId={spot.id} />
        </div>
      </div>

      <MobileSessionBar spotId={spot.id} />
    </div>
  );
}