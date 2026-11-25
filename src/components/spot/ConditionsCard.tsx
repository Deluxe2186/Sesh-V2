'use client';

import { CloudRain, CloudSun, Thermometer } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/lib/settings';
import {
  fetchWeather,
  judgeSurface,
  type WeatherResult,
} from '@/lib/weather';
import type { Spot } from '@/types';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'idle' }
  | { status: 'ok'; data: WeatherResult };

export default function ConditionsCard({ spot }: { spot: Spot }) {
  const { settings, ready } = useSettings();
  const [state, setState] = useState<State>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetchWeather(spot.lat, spot.lng, spot.id);
      setState({ status: 'ok', data });
    } catch {
      setState({ status: 'error' });
    }
  }, [spot.lat, spot.lng, spot.id]);

  useEffect(() => {
    // Wait until saved settings are loaded so low data mode is respected
    // before any weather request is made.
    if (!ready) return;
    if (settings.lowDataMode) {
      setState({ status: 'idle' });
      return;
    }
    load();
  }, [load, ready, settings.lowDataMode]);

  const surface =
    state.status === 'ok'
      ? judgeSurface(state.data, spot.shelter)
      : null;

  return (
    <div className="rounded-[12px] border bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Conditions now
      </h2>

      {state.status === 'idle' && settings.lowDataMode && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted">
            Weather is not loaded in low data mode.
          </p>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={load}
          >
            Load weather
          </Button>
        </div>
      )}

      {state.status === 'loading' && (
        <div className="flex flex-col gap-2">
          <div className="h-5 w-32 animate-pulse rounded bg-border" />
          <div className="h-4 w-48 animate-pulse rounded bg-border" />
          <div className="h-4 w-40 animate-pulse rounded bg-border" />
        </div>
      )}

      {state.status === 'error' && (
        <p className="text-sm text-muted">Weather unavailable right now</p>
      )}

      {state.status === 'ok' && surface && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Thermometer className="h-4 w-4 text-muted" />
            <span className="font-medium">{state.data.temperature}°C</span>
            <span className="text-muted">{state.data.description}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CloudRain className="h-4 w-4 text-muted" />
            <span className="text-muted">
              {state.data.rainChanceNext3h}% rain in next 3h
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <CloudSun className="h-4 w-4 text-accent" />
            <span>{surface}</span>
          </div>
        </div>
      )}
    </div>
  );
}
