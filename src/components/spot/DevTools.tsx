'use client';

import { UserMinus, UserPlus, Wrench } from 'lucide-react';
import { useSessions } from '@/lib/sessions';

export default function DevTools({ spotId }: { spotId: string }) {
  const { addMockMember, removeMockMember } = useSessions();

  if (process.env.NEXT_PUBLIC_DEV_TOOLS !== 'true') return null;

  return (
    <div className="rounded-[12px] border border-dashed bg-surface p-4">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <Wrench className="h-3.5 w-3.5" />
        Dev tools
      </h2>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => addMockMember(spotId)}
          className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium hover:border-accent"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Simulate arrival
        </button>
        <button
          type="button"
          onClick={() => removeMockMember(spotId)}
          className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium hover:border-accent"
        >
          <UserMinus className="h-3.5 w-3.5" />
          Simulate leaving
        </button>
      </div>
    </div>
  );
}
