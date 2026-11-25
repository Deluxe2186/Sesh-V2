import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { Spot } from '@/types';

interface SpotMapProps {
  spots: Spot[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  onView?: (id: string) => void;
  height?: string;
}

const LAGOS_CENTER: [number, number] = [6.5244, 3.3792];

export default function SpotMap({
  spots,
  selectedId = null,
  hoveredId = null,
  onSelect,
  onHover,
  onView,
  height = '100%',
}: SpotMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const popupsRef = useRef<Record<string, L.Popup>>({});
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);
  const onViewRef = useRef(onView);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onHoverRef.current = onHover;
    onViewRef.current = onView;
  });

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

    // The map can start hidden (phone list view). Re-measure when it appears.
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => map.invalidateSize())
        : null;
    observer?.observe(containerRef.current);

    return () => {
      observer?.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
      popupsRef.current = {};
    };
  }, []);

  function buildIcon(spot: Spot): L.DivIcon {
    const isSelected = spot.id === selectedId;
    const isHovered = spot.id === hoveredId;
    const isLive = spot.liveCount > 0;

    const size = isSelected ? 34 : isHovered ? 30 : 26;
    const bg = isLive ? '#FF5A1F' : '#9A9AA2';
    const classes = [
      'sesh-dot',
      isLive ? 'sesh-dot--live' : '',
      isSelected ? 'sesh-dot--selected' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const label = isLive ? String(spot.liveCount) : '';

    return L.divIcon({
      className: 'sesh-marker',
      html: `<span class="${classes}" style="width:${size}px;height:${size}px;background:${bg};border:2px solid #FFFFFF;box-shadow:0 1px 3px rgba(0,0,0,0.25);">${label}</span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  function escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function popupHtml(spot: Spot): string {
    const live = spot.liveCount > 0;
    return `<div style="min-width:180px;">
      <div style="font-weight:600;font-size:14px;margin-bottom:2px;">${escapeHtml(spot.name)}</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:8px;">${escapeHtml(spot.area)}</div>
      <div style="display:flex;align-items:center;gap:6px;font-size:12px;margin-bottom:10px;">
        <span style="width:8px;height:8px;border-radius:9999px;background:${
          live ? '#16A34A' : 'var(--muted)'
        };"></span>
        ${live ? `${spot.liveCount} skating now` : 'No one yet'}
      </div>
      <a href="/spot/${spot.id}" data-sesh-popup-link="${spot.id}" style="
        display:inline-flex;align-items:center;justify-content:center;
        background:#FF5A1F;color:#FFFFFF;text-decoration:none;
        padding:6px 14px;border-radius:9999px;font-size:13px;font-weight:600;
      ">View spot</a>
    </div>`;
  }

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Rebuild icons for state changes without recreating markers.
    spots.forEach((spot) => {
      const existing = markersRef.current[spot.id];
      if (existing) {
        existing.setIcon(buildIcon(spot));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, hoveredId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove markers that no longer exist in the filtered set.
    Object.keys(markersRef.current).forEach((id) => {
      if (!spots.some((s) => s.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
        delete popupsRef.current[id];
      }
    });

    // Add or refresh markers for current spots.
    spots.forEach((spot) => {
      let marker = markersRef.current[spot.id];
      if (!marker) {
        marker = L.marker([spot.lat, spot.lng], { icon: buildIcon(spot) }).addTo(map);
        marker.on('click', () => onSelectRef.current?.(spot.id));
        marker.on('mouseover', () => onHoverRef.current?.(spot.id));
        marker.on('mouseout', () => onHoverRef.current?.(null));
        markersRef.current[spot.id] = marker;

        const popup = L.popup({
          className: 'sesh-popup',
          closeButton: false,
          offset: [0, -14],
        }).setContent(popupHtml(spot));
        marker.bindPopup(popup);
        popupsRef.current[spot.id] = popup;
      } else {
        marker.setIcon(buildIcon(spot));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots]);

  // Handle popup link clicks via event delegation on the map container.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest(
        '[data-sesh-popup-link]'
      ) as HTMLElement | null;
      if (target) {
        const id = target.getAttribute('data-sesh-popup-link');
        if (id) onViewRef.current?.(id);
      }
    }

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className="overflow-hidden rounded-[12px] border"
    />
  );
}
