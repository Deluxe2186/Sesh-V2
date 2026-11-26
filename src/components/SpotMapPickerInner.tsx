'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { cn } from '@/lib/utils';

interface SpotMapPickerInnerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  approximate: boolean;
  disabled: boolean;
  height: string;
  onError: (error: string | null) => void;
}

const LAGOS_CENTER: [number, number] = [6.5244, 3.3792];

export default function SpotMapPickerInner({
  lat,
  lng,
  onChange,
  approximate,
  disabled,
  height,
  onError,
}: SpotMapPickerInnerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const isInitialized = useRef(false);
  const approximateRef = useRef(approximate);

  // Keep approximate ref in sync
  useEffect(() => {
    approximateRef.current = approximate;
  }, [approximate]);

  // Initialize map once when container is ready
  useEffect(() => {
    if (isInitialized.current || !containerRef.current) return;

    // Ensure container has dimensions before initializing
    const container = containerRef.current;
    if (container.offsetHeight === 0) return;

    let map: L.Map;
    try {
      map = L.map(containerRef.current, {
        center: lat && lng ? [lat, lng] : LAGOS_CENTER,
        zoom: lat && lng ? 16 : 11,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      isInitialized.current = true;
      onError(null);

      // Add click handler to place pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (disabled) return;
        let newLat = e.latlng.lat;
        let newLng = e.latlng.lng;

        // Apply approximate jitter if enabled
        if (approximateRef.current) {
          newLat += (Math.random() - 0.5) * 0.004; // ±0.002°
          newLng += (Math.random() - 0.5) * 0.004; // ±0.002°
        }

        onChange(newLat, newLng);
      });

      // Add initial marker if lat/lng provided
      if (lat !== null && lng !== null) {
        addMarker(map, lat, lng);
      }
    } catch (err) {
      onError('Failed to load map. Please try again.');
      console.error('Map initialization error:', err);
    }

    return () => {
      if (map) {
        map.remove();
      }
      mapRef.current = null;
      isInitialized.current = false;
    };
  }, [disabled, onChange, onError]);

  // Update marker when lat/lng changes from outside (without re-initializing map)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isInitialized.current) return;

    if (lat !== null && lng !== null) {
      addMarker(map, lat, lng);
      if (!disabled) {
        map.setView([lat, lng], map.getZoom(), { animate: true });
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [lat, lng, disabled]);

  function addMarker(map: L.Map, latitude: number, longitude: number) {
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      const pinIcon = L.divIcon({
        className: 'sesh-pin-marker',
        html: `
          <div style="
            width: 32px;
            height: 42px;
            background: #FF5A1F;
            border: 3px solid #FFFFFF;
            border-radius: 16px 16px 16px 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 12px;
              height: 12px;
              background: #FFFFFF;
              border-radius: 50%;
              transform: rotate(45deg);
              margin-top: -2px;
            " />
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      });

      markerRef.current = L.marker([latitude, longitude], {
        icon: pinIcon,
        draggable: !disabled,
      }).addTo(map);

      markerRef.current.on('dragend', (e) => {
        let newLat = e.target.getLatLng().lat;
        let newLng = e.target.getLatLng().lng;

        if (approximateRef.current) {
          const jitterLat = newLat + (Math.random() - 0.5) * 0.004;
          const jitterLng = newLng + (Math.random() - 0.5) * 0.004;
          onChange(jitterLat, jitterLng);
          // Reset marker to jittered position
          e.target.setLatLng([jitterLat, jitterLng]);
        } else {
          onChange(newLat, newLng);
        }
      });
    }
  }

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className={cn(
        'overflow-hidden rounded-[12px] border bg-surface',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    />
  );
}