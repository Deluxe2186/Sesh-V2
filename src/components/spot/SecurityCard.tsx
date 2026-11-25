'use client';

import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useCallback, useEffect, useState } from 'react';
import { getStoredReports, reportSecurity } from '@/lib/api';
import { relativeTime } from '@/lib/time';
import type { SecurityReport, SecurityReportType, Spot } from '@/types';

const REPORT_BUTTONS: { type: SecurityReportType; label: string }[] = [
  { type: 'Security came by', label: 'Security came by' },
  { type: 'Asked to leave', label: 'Asked to leave' },
  { type: 'All clear', label: 'All clear' },
];

function levelColor(
  level: Spot['securityLevel']
): { bg: string; text: string; icon: typeof Shield } {
  if (level === 'Low')
    return { bg: 'bg-live/10', text: 'text-live', icon: ShieldCheck };
  if (level === 'Medium')
    return { bg: 'bg-warning/10', text: 'text-warning', icon: Shield };
  return { bg: 'bg-danger/10', text: 'text-danger', icon: ShieldAlert };
}

export default function SecurityCard({ spot }: { spot: Spot }) {
  const [reports, setReports] = useState<SecurityReport[]>(
    spot.securityReports
  );

  useEffect(() => {
    setReports([...getStoredReports(spot.id), ...spot.securityReports]);
  }, [spot]);

  const handleReport = useCallback(
    async (type: SecurityReportType) => {
      const report = await reportSecurity(spot.id, type);
      setReports((prev) => [report, ...prev]);
      toast.success('Thanks, reported');
    },
    [spot.id]
  );

  const { bg, text, icon: Icon } = levelColor(spot.securityLevel);
  const latest = reports[0];

  return (
    <div className="rounded-[12px] border bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Security and disturbance
      </h2>

      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${bg} ${text}`}>
        <Icon className="h-4 w-4" />
        {spot.securityLevel} security
      </div>

      <p className="mt-3 text-sm leading-[150%]">{spot.securityNote}</p>

      <p className="mt-2 text-xs text-muted">
        Last report: {latest ? relativeTime(latest.at) : 'No reports yet'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {REPORT_BUTTONS.map((btn) => (
          <button
            key={btn.type}
            type="button"
            onClick={() => handleReport(btn.type)}
            className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium hover:border-accent"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {reports.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1.5 border-t pt-3">
          {reports.slice(0, 3).map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between text-xs"
            >
              <span>{r.type}</span>
              <span className="text-muted">{relativeTime(r.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
