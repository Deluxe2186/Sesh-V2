import Link from 'next/link';
import { MapPin } from 'lucide-react';
import HeatChart from '@/components/HeatChart';
import SpotMapClient from '@/components/SpotMapClient';
import { getSpots } from '@/lib/api';

export default async function HeatmapPage() {
  const spots = await getSpots();
  const totalVisits = spots.reduce((sum, s) => sum + s.weeklyVisits, 0);

  // Deterministic distribution across the week derived from weekly visits.
  const weekly = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
    (day, i) => ({
      day,
      visits: Math.round(
        (spots.reduce((sum, s) => sum + s.weeklyVisits, 0) / 7) *
          (i >= 4 ? 1.5 : 0.75)
      ),
    })
  );

  const busiest = [...spots].sort((a, b) => b.weeklyVisits - a.weeklyVisits);

  return (
    <div>
      <div className="mb-1">
        <h1 className="text-2xl font-bold font-display">Heatmap</h1>
        <p className="mt-1 text-sm text-muted">
          {totalVisits} visits across {spots.length} Lagos spots this week
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-[12px] border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Visits by day
          </h2>
          <HeatChart data={weekly} />
        </div>
        <div className="rounded-[12px] border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Busiest spots this week
          </h2>
          <ol className="flex flex-col gap-2">
            {busiest.slice(0, 5).map((spot, i) => (
              <li key={spot.id}>
                <Link
                  href={`/spot/${spot.id}`}
                  className="flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm hover:border-accent"
                >
                  <span className="w-5 font-bold text-accent">{i + 1}</span>
                  <span className="font-medium">{spot.name}</span>
                  <span className="ml-auto text-muted">
                    {spot.weeklyVisits}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-4">
        <SpotMapClient spots={spots} height="420px" />
      </div>
    </div>
  );
}
