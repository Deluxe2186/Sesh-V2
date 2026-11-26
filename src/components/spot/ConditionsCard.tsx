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
    <div className="rounded-[12px] border bg-surface p-5 card-hover hover-lift-sm animate-fade-in-up stagger-1">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted animate-fade-in-up stagger-1">
        Conditions now
      </h2>

      {state.status === 'idle' && settings.lowDataMode && (
        <div className="flex flex-col items-start gap-3 animate-stagger-fade-in">
          <p className="text-sm text-muted stagger-1 animate-fade-in-up">
            Weather is not loaded in low data mode.
          </p>
          <Button
            variant="outline"
            className="rounded-full press-scale stagger-2 animate-fade-in-up"
            onClick={load}
          >
            Load weather
          </Button>
        </div>
      )}

      {state.status === 'loading' && (
        <div className="flex flex-col gap-2 animate-stagger-fade-in">
          <div className="h-5 w-32 shimmer rounded stagger-1" />
          <div className="h-4 w-48 shimmer rounded stagger-2" />
          <div className="h-4 w-40 shimmer rounded stagger-3" />
        </div>
      )}

      {state.status === 'error' && (
        <p className="text-sm text-muted animate-fade-in-up">Weather unavailable right now</p>
      )}

      {state.status === 'ok' && surface && (
        <div className="flex flex-col gap-2 animate-stagger-fade-in">
          <div className="flex items-center gap-2 text-sm stagger-1 animate-fade-in-up transition-colors duration-fast group-hover:gap-3">
            <Thermometer className="h-4 w-4 text-muted transition-transform duration-fast group-hover:scale-110" />
            <span className="font-medium">{state.data.temperature}°C</span>
            <span className="text-muted">{state.data.description}</span>
          </div>
          <div className="flex items-center gap-2 text-sm stagger-2 animate-fade-in-up transition-colors duration-fast group-hover:gap-3">
            <CloudRain className="h-4 w-4 text-muted transition-transform duration-fast group-hover:scale-110" />
            <span className="text-muted">
              {state.data.rainChanceNext3h}% rain in next 3h
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium stagger-3 animate-fade-in-up transition-colors duration-fast group-hover:gap-3">
            <CloudSun className="h-4 w-4 text-accent transition-transform duration-fast group-hover:scale-110" />
            <span>{surface}</span>
          </div>
        </div>
      )}
    </div>
  );
}