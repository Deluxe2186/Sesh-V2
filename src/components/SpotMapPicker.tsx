'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const SpotMap = dynamic(() => import('@/components/SpotMapPickerInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-[12px] border bg-surface text-sm text-muted">
      Loading map…
    </div>
  ),
});

interface SpotMapPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  approximate: boolean;
  onApproximateChange: (value: boolean) => void;
  height?: string;
  disabled?: boolean;
}

export default function SpotMapPicker({
  lat,
  lng,
  onChange,
  approximate,
  onApproximateChange,
  height = '320px',
  disabled = false,
}: SpotMapPickerProps) {
  const [mapError, setMapError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="relative">
        <SpotMap
          lat={lat}
          lng={lng}
          onChange={onChange}
          approximate={approximate}
          disabled={disabled}
          height={height}
          onError={setMapError}
        />
        {mapError && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="mx-auto max-w-md rounded-md bg-destructive/90 p-3 text-center text-sm text-destructive-foreground shadow-lg">
              {mapError}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Switch
            id="approximate-location"
            checked={approximate}
            onCheckedChange={onApproximateChange}
            disabled={disabled}
          />
          <Label htmlFor="approximate-location" className="cursor-pointer">
            Show approximate location only (for sensitive spots)
          </Label>
        </div>
        {lat !== null && lng !== null && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted font-mono">
            <MapPin className="h-3 w-3" />
            <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
          </div>
        )}
      </div>
    </div>
  );
}