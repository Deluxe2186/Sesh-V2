'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useRef, useMemo } from 'react';
import type { Spot, BusyByTime } from '@/types';
import { cn } from '@/lib/utils';
import { useSettings } from '@/lib/settings';

const LAGOS_CENTER: [number, number] = [6.5244, 3.3792];

interface HeatmapMapProps {
  spots: Spot[];
  timeOfDay: keyof BusyByTime;
  isWeekend: boolean;
  selectedSpotId: string | null;
  onSpotClick: (id: string) => void;
  height?: string;
}

export default function HeatmapMap({
  spots,
  timeOfDay,
  isWeekend,
  selectedSpotId,
  onSpotClick,
  height = '100%',
}: HeatmapMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circlesRef = useRef<Record<string, L.Circle>>({});
  const { settings } = useSettings();
  const lowDataMode = settings.lowDataMode;

  // Calculate circle radius and opacity based on weeklyVisits
  const maxWeeklyVisits = useMemo(() =>
    Math.max(...spots.map(s => s.weeklyVisits), 1), [spots]);

  // Color scale: soft yellow (quiet) to deep orange (busiest)
  const getColor = (visits: number) => {
    const ratio = visits / maxWeeklyVisits;
    // Interpolate from soft yellow to deep orange
    const r = Math.round(255);
    const g = Math.round(255 * (1 - ratio * 0.6));
    const b = Math.round(0);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getRadius = (visits: number) => {
    const ratio = visits / maxWeeklyVisits;
    // Radius between 150m and 1500m
    return 150 + ratio * 1350;
  };

  const getOpacity = (visits: number) => {
    const ratio = visits / maxWeeklyVisits;
    // Opacity between 0.15 and 0.6
    return 0.15 + ratio * 0.45;
  };

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: LAGOS_CENTER,
      zoom: 11,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      circlesRef.current = {};
    };
  }, []);

  // Update circles when spots, timeOfDay, or isWeekend changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove circles that no longer exist in the filtered set
    Object.keys(circlesRef.current).forEach((id) => {
      if (!spots.some((s) => s.id === id)) {
        circlesRef.current[id].remove();
        delete circlesRef.current[id];
      }
    });

    // Add or refresh circles for current spots
    spots.forEach((spot) => {
      const existing = circlesRef.current[spot.id];
      const isSelected = spot.id === selectedSpotId;

      // Use busyByTime for the selected time of day, or weeklyVisits as fallback
      const timeVisits = spot.busyByTime[timeOfDay];
      // If weekend, average Saturday and Sunday from busyByDay
      const dayVisits = isWeekend
        ? (spot.busyByDay[5] + spot.busyByDay[6]) / 2
        : spot.busyByDay.slice(0, 5).reduce((a, b) => a + b, 0) / 5;

      // Weight the visits based on time of day and day type
      const weight = isWeekend ? 0.7 : 0.3;
      const effectiveVisits = timeVisits * weight + dayVisits * (1 - weight);

      // Also consider weeklyVisits as a base
      const finalVisits = Math.max(effectiveVisits, spot.weeklyVisits * 0.1);

      const color = getColor(finalVisits);
      const radius = getRadius(finalVisits);
      const opacity = getOpacity(finalVisits);

      if (!circlesRef.current[spot.id]) {
        const circle = L.circle([spot.lat, spot.lng], {
          radius,
          color: '#FF5A1F',
          fillColor: color,
          fillOpacity: opacity,
          weight: isSelected ? 3 : 1,
          opacity: isSelected ? 0.9 : 0.6,
          className: 'heatmap-circle',
        }).addTo(map);

        circle.on('click', () => onSpotClick(spot.id));

        // Add hover effect
        circle.on('mouseover', () => {
          circle.setStyle({ weight: 3, opacity: 0.9 });
        });
        circle.on('mouseout', () => {
          circle.setStyle({
            weight: spot.id === selectedSpotId ? 3 : 1,
            opacity: spot.id === selectedSpotId ? 0.9 : 0.6
          });
        });

        circlesRef.current[spot.id] = circle;
      } else {
        // Update existing circle
        circlesRef.current[spot.id].setLatLng([spot.lat, spot.lng]);
        circlesRef.current[spot.id].setRadius(radius);
        circlesRef.current[spot.id].setStyle({
          fillColor: color,
          fillOpacity: opacity,
          weight: isSelected ? 3 : 1,
          opacity: isSelected ? 0.9 : 0.6,
        });
      }
    });
  }, [spots, timeOfDay, isWeekend, selectedSpotId, onSpotClick]);

  // Fly to spot when selectedSpotId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSpotId) return;

    const spot = spots.find((s) => s.id === selectedSpotId);
    if (spot) {
      map.flyTo([spot.lat, spot.lng], 14, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [selectedSpotId, spots]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className={cn(
        'overflow-hidden rounded-[12px] border',
        lowDataMode && 'heatmap-low-data'
      )}
    />
  );
}