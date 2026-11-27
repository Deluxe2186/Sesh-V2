'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, Sunrise, Sun, Sunset, Moon, Calendar } from 'lucide-react';
import { getSpots } from '@/lib/api';
import type { Spot, BusyByTime } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import HeatmapMapClient from '@/components/HeatmapMapClient';
import { cn } from '@/lib/utils';

const TIME_OF_DAY_OPTIONS = [
  { value: 'morning' as keyof BusyByTime, label: 'Morning', icon: Sunrise },
  { value: 'afternoon' as keyof BusyByTime, label: 'Afternoon', icon: Sun },
  { value: 'evening' as keyof BusyByTime, label: 'Evening', icon: Sunset },
  { value: 'night' as keyof BusyByTime, label: 'Night', icon: Moon },
] as const;

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HeatmapPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<keyof BusyByTime>('evening');
  const [isWeekend, setIsWeekend] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ id: string; request: number } | null>(null);

  function focusSpot(id: string) {
    setSelectedSpotId(id);
    setFocusRequest((current) => ({ id, request: (current?.request ?? 0) + 1 }));
  }

  // Load spots after mount; never update React state during render.
  const loadSpots = useCallback(async () => {
    try {
      const spotsData = await getSpots();
      setSpots(spotsData);
    } catch (error) {
      console.error('Failed to load heatmap spots:', error);
    }
  }, []);

  useEffect(() => {
    void loadSpots();
  }, [loadSpots]);

  // Determine the busiest spot for the current time filter
  const busiestSpot = useMemo(() => {
    if (spots.length === 0) return null;

    return spots.reduce((busiest, spot) => {
      const timeVisits = spot.busyByTime[timeOfDay];
      // If weekend, average Saturday and Sunday from busyByDay
      const dayVisits = isWeekend
        ? (spot.busyByDay[5] + spot.busyByDay[6]) / 2
        : spot.busyByDay.slice(0, 5).reduce((a, b) => a + b, 0) / 5;

      const weight = isWeekend ? 0.7 : 0.3;
      const effectiveVisits = timeVisits * weight + dayVisits * (1 - weight);
      const currentBusiestVisits = busiest.busyByTime[timeOfDay];
      const currentDayVisits = isWeekend
        ? (busiest.busyByDay[5] + busiest.busyByDay[6]) / 2
        : busiest.busyByDay.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      const currentEffectiveVisits = currentBusiestVisits * weight + currentDayVisits * (1 - weight);

      return effectiveVisits > currentEffectiveVisits ? spot : busiest;
    }, spots[0]);
  }, [spots, timeOfDay, isWeekend]);

  // Top 5 spots ranked by effective visits for current filter
  const topSpots = useMemo(() => {
    if (spots.length === 0) return [];

    const weight = isWeekend ? 0.7 : 0.3;

    return [...spots]
      .map((spot) => {
        const timeVisits = spot.busyByTime[timeOfDay];
        const dayVisits = isWeekend
          ? (spot.busyByDay[5] + spot.busyByDay[6]) / 2
          : spot.busyByDay.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
        const effectiveVisits = timeVisits * weight + dayVisits * (1 - weight);
        return { spot, effectiveVisits };
      })
      .sort((a, b) => b.effectiveVisits - a.effectiveVisits)
      .slice(0, 5)
      .map((item, index) => ({
        ...item.spot,
        rank: index + 1,
        effectiveVisits: item.effectiveVisits,
      }));
  }, [spots, timeOfDay, isWeekend]);

  // Generate the description sentence
  const description = useMemo(() => {
    if (!busiestSpot) return 'Select a time to see the busiest spots.';

    const timeLabel = TIME_OF_DAY_OPTIONS.find(t => t.value === timeOfDay)?.label || timeOfDay;
    const dayLabel = isWeekend ? 'Weekends' : 'Weekdays';

    return `${timeLabel} is the busiest time at ${busiestSpot.name} on ${dayLabel}.`;
  }, [busiestSpot, timeOfDay, isWeekend]);

  // If spots aren't loaded yet, show loading state
  if (spots.length === 0) {
    return (
      <div className="space-y-6">
        <div className="mb-1">
          <h1 className="text-2xl font-bold font-display">Heatmap</h1>
          <p className="mt-1 text-sm text-muted">Loading Lagos skate spots…</p>
        </div>
        <div className="rounded-[12px] border bg-surface p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent mx-auto mb-4">
            <div className="h-6 w-6 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted">Loading heatmap data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-2xl font-bold font-display">Heatmap</h1>
        <p className="mt-1 text-sm text-muted">
          Skate activity across {spots.length} Lagos spots
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-[12px] border bg-surface p-5 space-y-4">
        {/* Time of Day Selector */}
        <div>
          <p className="text-sm font-medium mb-3">Time of day</p>
          <ToggleGroup
            type="single"
            value={timeOfDay}
            onValueChange={(value) => setTimeOfDay(value as keyof BusyByTime)}
            className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap"
          >
            {TIME_OF_DAY_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="flex items-center gap-1.5 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Weekdays/Weekends Selector */}
        <div>
          <p className="text-sm font-medium mb-3">Day type</p>
          <ToggleGroup
            type="single"
            value={isWeekend ? 'weekend' : 'weekday'}
            onValueChange={(value) => setIsWeekend(value === 'weekend')}
            className="flex gap-2"
          >
            <ToggleGroupItem
              value="weekday"
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Weekdays
            </ToggleGroupItem>
            <ToggleGroupItem
              value="weekend"
              className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Weekends
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Description Sentence */}
        <p className="text-sm text-muted pt-2 border-t">
          {description}
        </p>
      </div>

      {/* Map and Top Spots */}
      <div className="min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:gap-6">
        {/* Map */}
        <div className="relative h-[500px] overflow-hidden rounded-[12px] border lg:h-[600px]">
          <HeatmapMapClient
            spots={spots}
            timeOfDay={timeOfDay}
            isWeekend={isWeekend}
            selectedSpotId={selectedSpotId}
            focusRequest={focusRequest}
            onSpotClick={focusSpot}
            height="100%"
          />

          {/* Keep the legend opposite the recenter control. */}
          <div className="absolute bottom-4 left-4 z-20 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur">
            <p className="text-xs font-medium mb-2">Activity Level</p>
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 rounded bg-gradient-to-r from-yellow-300 via-orange-300 to-orange-600" />
              <div className="flex gap-4 text-xs text-muted">
                <span>Quiet</span>
                <span>Busy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Spots This Week */}
        <div className="space-y-4">
          <Card className="min-w-0 rounded-[12px] p-3">
            <CardHeader className="min-w-0 p-2">
              <CardTitle className="flex min-w-0 items-start gap-2 text-base leading-snug">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="min-w-0">Top spots this week</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-w-0 p-2 pt-0">
              <ol className="flex min-w-0 flex-col gap-2">
                {topSpots.map((spot) => (
                  <li key={spot.id} className="min-w-0">
                    <button
                      onClick={() => focusSpot(spot.id)}
                      className={cn(
                        'flex min-w-0 w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors hover:border-accent',
                        selectedSpotId === spot.id && 'border-accent bg-accent/5'
                      )}
                    >
                      <span className="w-5 shrink-0 font-bold text-accent">{spot.rank}</span>
                      <span className="min-w-0 flex-1 whitespace-normal break-words font-medium leading-snug">{spot.name}</span>
                      <Badge variant="secondary" className="ml-auto shrink-0 whitespace-nowrap text-[11px]">
                        {Math.round(spot.effectiveVisits)} visits
                      </Badge>
                    </button>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Note under the map */}
          <p className="text-center text-xs text-muted">
            Activity is based on early data and grows as more skaters join.
          </p>
        </div>
      </div>
    </div>
  );
}