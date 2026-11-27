'use client';

import dynamic from 'next/dynamic';
import type { Spot } from '@/types';

const HeatmapMap = dynamic(() => import('@/components/HeatmapMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-[12px] border bg-surface text-sm text-muted">
      Loading heatmap…
    </div>
  ),
});

export default function HeatmapMapClient(props: {
  spots: Spot[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  isWeekend: boolean;
  selectedSpotId: string | null;
  focusRequest?: { id: string; request: number } | null;
  onSpotClick: (id: string) => void;
  height?: string;
}) {
  return <HeatmapMap {...props} />;
}