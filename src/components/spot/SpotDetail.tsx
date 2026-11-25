'use client';

import { Check, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import ConditionsCard from '@/components/spot/ConditionsCard';
import DevTools from '@/components/spot/DevTools';
import MobileSessionBar from '@/components/spot/MobileSessionBar';
import LiveSessionCard from '@/components/spot/LiveSessionCard';
import RecentSessions from '@/components/spot/RecentSessions';
import SecurityCard from '@/components/spot/SecurityCard';
import PhotoPlaceholder from '@/components/PhotoPlaceholder';
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

  useEffect(() => {
    setLiveCount(getLiveCount(spot.id));
  }, [getLiveCount, spot.id]);

  return (
    <div className="mx-auto max-w-5xl pb-20 lg:pb-0">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted">
        <Link href="/explore" className="hover:text-foreground">
          Explore
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{spot.name}</span>
      </nav>

      {/* Header card */}
      <div className="rounded-[16px] border bg-surface p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Gallery */}
          <div className="flex flex-1 gap-3">
            <div className="min-w-0 flex-1">
              <PhotoPlaceholder label="" />
            </div>
            <div className="hidden w-32 flex-col gap-3 sm:flex">
              <div className="h-[72px]">
                <PhotoPlaceholder label="" />
              </div>
              <div className="h-[72px]">
                <PhotoPlaceholder label="" />
              </div>
              <div className="h-[72px]">
                <PhotoPlaceholder label="" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex w-full flex-col justify-center gap-3 md:w-[280px]">
            <div>
              <h1 className="text-2xl font-bold font-display">{spot.name}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                <MapPin className="h-3.5 w-3.5" />
                {spot.area}, Lagos
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {spot.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  <Check className="h-3 w-3" />
                  Verified
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  liveCount > 0
                    ? 'bg-live/10 text-live'
                    : 'border text-muted'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    liveCount > 0 ? 'bg-live' : 'bg-muted'
                  }`}
                />
                {liveCount > 0 ? `${liveCount} live` : 'Quiet'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        {/* Main column */}
        <div className="order-2 flex min-w-0 flex-1 flex-col gap-4 lg:order-none">
          {/* About */}
          <div className="rounded-[12px] border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              About this spot
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {spot.obstacles.map((o) => (
                <span
                  key={o}
                  className="rounded-full border px-3 py-1 text-sm"
                >
                  {o}
                </span>
              ))}
            </div>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted">Surface</dt>
                <dd className="font-medium">{spot.surface}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted">Shelter</dt>
                <dd className="font-medium">{spot.shelter}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Best time</dt>
                <dd className="text-right font-medium">{spot.bestTime}</dd>
              </div>
            </dl>
            <div className="mt-4 border-t pt-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Tips
              </h3>
              <ul className="flex flex-col gap-2">
                {spot.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
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
        <div className="order-1 flex w-full shrink-0 flex-col gap-4 lg:order-none lg:w-[360px]">
          <LiveSessionCard spotId={spot.id} />
          <DevTools spotId={spot.id} />
        </div>
      </div>

      <MobileSessionBar spotId={spot.id} />
    </div>
  );
}
