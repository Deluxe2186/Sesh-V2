'use client';

import { useEffect, useState } from 'react';
import { getRecentSessions, type RecentSessionRow } from '@/lib/api';
import { relativeTime } from '@/lib/time';

export default function RecentSessions({ spotId }: { spotId: string }) {
  const [rows, setRows] = useState<RecentSessionRow[]>([]);

  useEffect(() => {
    let active = true;
    getRecentSessions(spotId).then((r) => {
      if (active) setRows(r);
    });
    return () => {
      active = false;
    };
  }, [spotId]);

  return (
    <div className="rounded-[12px] border bg-surface p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
        Recent sessions
      </h2>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between border-b pb-3 text-sm last:border-b-0 last:pb-0"
          >
            <span className="text-muted">{relativeTime(row.date)}</span>
            <span className="font-medium">{row.skaterCount} skaters</span>
            <span className="text-muted">{row.durationMin} min</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
