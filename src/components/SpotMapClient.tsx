'use client';

import dynamic from 'next/dynamic';
import type { Spot } from '@/types';

const SpotMap = dynamic(() => import('@/components/SpotMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-[12px] border bg-surface text-sm text-muted">
      Loading map…
    </div>
  ),
});

export default function SpotMapClient(props: {
  spots: Spot[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  onView?: (id: string) => void;
  height?: string;
}) {
  return <SpotMap {...props} />;
}
