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
    <div className="rounded-[12px] border bg-surface p-5 card-hover hover-lift-sm animate-fade-in-up stagger-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted stagger-1 animate-fade-in-up">
        Recent sessions
      </h2>
      <ul className="flex flex-col gap-3 animate-stagger-fade-in">
        {rows.map((row, index) => (
          <li
            key={row.id}
            className="flex items-center justify-between border-b pb-3 text-sm last:border-b-0 last:pb-0 stagger-1 animate-fade-in-up transition-colors duration-fast hover:text-foreground press-scale"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span className="text-muted">{relativeTime(row.date)}</span>
            <span className="font-medium">{row.skaterCount} skaters</span>
            <span className="text-muted">{row.durationMin} min</span>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="text-center text-sm text-muted py-4 stagger-1 animate-fade-in-up">
            No recent sessions yet
          </li>
        )}
      </ul>
    </div>
  );
}