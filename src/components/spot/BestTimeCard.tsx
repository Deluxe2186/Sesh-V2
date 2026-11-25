'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Spot } from '@/types';

const TIME_KEYS = ['morning', 'afternoon', 'evening', 'night'] as const;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type Mode = 'time' | 'day';

export default function BestTimeCard({ spot }: { spot: Spot }) {
  const [mode, setMode] = useState<Mode>('time');

  const data = useMemo(() => {
    if (mode === 'time') {
      return TIME_KEYS.map((k, i) => ({
        label: ['Morning', 'Afternoon', 'Evening', 'Night'][i],
        value: spot.busyByTime[k],
      }));
    }
    return spot.busyByDay.map((v, i) => ({
      label: DAY_LABELS[i],
      value: v,
    }));
  }, [spot, mode]);

  const maxVal = Math.max(...data.map((d) => d.value));
  const busiest = data.find((d) => d.value === maxVal);

  return (
    <div className="rounded-[12px] border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Best time to go
        </h2>
        <div className="flex rounded-full border p-0.5">
          <button
            type="button"
            onClick={() => setMode('time')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              mode === 'time'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted'
            }`}
          >
            Time of day
          </button>
          <button
            type="button"
            onClick={() => setMode('day')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              mode === 'day'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted'
            }`}
          >
            Day of week
          </button>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
            />
            <ReTooltip
              cursor={{ fill: 'var(--border)', opacity: 0.4 }}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                color: 'var(--foreground)',
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((d) => (
                <Cell
                  key={d.label}
                  fill={d.value === maxVal ? 'var(--accent)' : 'var(--muted)'}
                  fillOpacity={d.value === maxVal ? 1 : 0.4}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-sm text-muted">
        Busiest in the {busiest?.label.toLowerCase()}.
      </p>
    </div>
  );
}
