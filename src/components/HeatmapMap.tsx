'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import MapLocationControl from '@/components/MapLocationControl';
import type { Spot, BusyByTime } from '@/types';
import { cn } from '@/lib/utils';
import { useSettings } from '@/lib/settings';
import { useSessions } from '@/lib/sessions';

const LAGOS_CENTER: [number, number] = [6.5244, 3.3792];

interface HeatmapMapProps {
  spots: Spot[];
  timeOfDay: keyof BusyByTime;
  isWeekend: boolean;
  selectedSpotId: string | null;
  focusRequest?: { id: string; request: number } | null;
  onSpotClick: (id: string) => void;
  height?: string;
}

export default function HeatmapMap({
  spots,
  timeOfDay,
  isWeekend,
  selectedSpotId,
  focusRequest = null,
  onSpotClick,
  height = '100%',
}: HeatmapMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circlesRef = useRef<Record<string, L.Circle>>({});
  const markersRef = useRef<Record<string, L.Marker>>({});
  const onSpotClickRef = useRef(onSpotClick);
  const [mapReady, setMapReady] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { settings } = useSettings();
  const { sessions } = useSessions();
  const lowDataMode = settings.lowDataMode;

  // Calculate circle radius and opacity based on weeklyVisits
  const maxWeeklyVisits = useMemo(() =>
    Math.max(...spots.map(s => s.weeklyVisits), 1), [spots]);

  // Color scale: soft yellow (quiet) to deep orange (busiest)
  const getColor = useCallback((visits: number) => {
    const ratio = visits / maxWeeklyVisits;
    // Interpolate from soft yellow to deep orange
    const r = Math.round(255);
    const g = Math.round(255 * (1 - ratio * 0.6));
    const b = Math.round(0);
    return `rgb(${r}, ${g}, ${b})`;
  }, [maxWeeklyVisits]);

  const getRadius = useCallback((visits: number) => {
    const ratio = visits / maxWeeklyVisits;
    // Radius between 150m and 1500m
    return 150 + ratio * 1350;
  }, [maxWeeklyVisits]);

  const getOpacity = useCallback((visits: number) => {
    const ratio = visits / maxWeeklyVisits;
    // Opacity between 0.15 and 0.6
    return 0.15 + ratio * 0.45;
  }, [maxWeeklyVisits]);

  const buildMarkerIcon = useCallback((spot: Spot, isSelected: boolean, isHovered: boolean) => {
    const liveCount = sessions[spot.id]?.members.length ?? 0;
    const isLive = liveCount > 0;
    const size = isSelected ? 36 : isHovered ? 34 : 26;
    const background = isSelected ? '#FF5A1F' : isLive ? '#FFFFFF' : '#9A9AA2';
    const color = isSelected || !isLive ? '#FFFFFF' : '#FF5A1F';
    const border = isHovered ? '3px solid #FF5A1F' : '2px solid #FFFFFF';
    return L.divIcon({
      className: 'sesh-marker',
      html: `<span style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;border-radius:50%;font-weight:700;line-height:1;width:${size}px;height:${size}px;background:${background};color:${color};border:${border};box-shadow:0 1px 3px rgba(0,0,0,0.25);">${liveCount}</span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, [sessions]);

  useEffect(() => {
    onSpotClickRef.current = onSpotClick;
  }, [onSpotClick]);

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
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      circlesRef.current = {};
      markersRef.current = {};
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
        markersRef.current[id]?.remove();
        delete markersRef.current[id];
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

        circle.on('click', () => onSpotClickRef.current(spot.id));

        // Add hover effect
        circle.on('mouseover', () => {
          setHoveredId(spot.id);
          circle.setStyle({ weight: 3, opacity: 0.9 });
        });
        circle.on('mouseout', () => {
          setHoveredId((current) => current === spot.id ? null : current);
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
          weight: isSelected || hoveredId === spot.id ? 3 : 1,
          opacity: isSelected || hoveredId === spot.id ? 0.9 : 0.6,
        });
      }

      const liveCount = sessions[spot.id]?.members.length ?? 0;
      const marker = markersRef.current[spot.id];
      if (marker) {
        marker.setLatLng([spot.lat, spot.lng]);
        marker.setIcon(buildMarkerIcon(spot, isSelected, hoveredId === spot.id));
      } else {
        const newMarker = L.marker([spot.lat, spot.lng], {
          icon: buildMarkerIcon(spot, isSelected, hoveredId === spot.id),
          keyboard: true,
          title: `${spot.name}: ${liveCount} skating now`,
          zIndexOffset: isSelected ? 500 : 0,
        }).addTo(map);
        newMarker.on('click', () => onSpotClickRef.current(spot.id));
        newMarker.on('mouseover', () => setHoveredId(spot.id));
        newMarker.on('mouseout', () => setHoveredId((current) => current === spot.id ? null : current));
        markersRef.current[spot.id] = newMarker;
      }
    });
  }, [spots, timeOfDay, isWeekend, selectedSpotId, sessions, hoveredId, mapReady, onSpotClick, getColor, getRadius, getOpacity, buildMarkerIcon]);

  // Focus spot selections from either the map or the ranked list.
  useEffect(() => {
    const map = mapRef.current;
    const selectedId = focusRequest?.id ?? selectedSpotId;
    if (!map || !selectedId) return;

    const spot = spots.find((candidate) => candidate.id === selectedId);
    if (spot) {
      map.flyTo([spot.lat, spot.lng], 16, { animate: true, duration: 0.8 });
    }
  }, [focusRequest, selectedSpotId, spots, mapReady]);

  return (
    <div
      style={{ height, width: '100%' }}
      className={cn(
        'relative z-0 isolate overflow-hidden rounded-[12px] border',
        lowDataMode && 'heatmap-low-data'
      )}
    >
      <div ref={containerRef} className="h-full w-full" />
      <MapLocationControl map={mapRef.current} />
    </div>
  );
}