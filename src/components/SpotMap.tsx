import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import MapLocationControl from '@/components/MapLocationControl';
import type { Spot } from '@/types';

interface SpotMapProps {
  spots: Spot[];
  selectedId?: string | null;
  focusRequest?: { id: string; request: number } | null;
  hoveredId?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  onView?: (id: string) => void;
  height?: string;
  showLocateMe?: boolean;
  onLocateMe?: (lat: number, lng: number) => void;
}

const LAGOS_CENTER: [number, number] = [6.5244, 3.3792];

export default function SpotMap({
  spots,
  selectedId = null,
  focusRequest = null,
  hoveredId = null,
  onSelect,
  onHover,
  onView,
  height = '100%',
  showLocateMe = true,
  onLocateMe,
}: SpotMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const popupsRef = useRef<Record<string, L.Popup>>({});
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);
  const onViewRef = useRef(onView);
  const [containerReady, setContainerReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onHoverRef.current = onHover;
    onViewRef.current = onView;
  });

  // Initialize map once when container is ready
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    // Ensure container has dimensions before initializing
    const container = containerRef.current;
    if (container.offsetHeight === 0 || container.offsetWidth === 0) return;

    // Check if container is visible in viewport
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

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
    setContainerReady(true);

    // The map can start hidden (phone list view). Re-measure when it appears.
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          })
        : null;
    observer?.observe(containerRef.current);

    return () => {
      observer?.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
      }
      mapRef.current = null;
      markersRef.current = {};
      popupsRef.current = {};
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusRequest) return;

    const spot = spots.find((candidate) => candidate.id === focusRequest.id);
    if (!spot) return;

    map.flyTo([spot.lat, spot.lng], 16, { animate: true, duration: 0.8 });
  }, [focusRequest, spots, containerReady]);

  function buildIcon(spot: Spot): L.DivIcon {
    const isSelected = spot.id === selectedId;
    const isHovered = spot.id === hoveredId;
    const isLive = spot.liveCount > 0;

    const size = isSelected ? 36 : isHovered ? 34 : 26;
    const bg = isSelected ? '#FF5A1F' : isLive ? '#FFFFFF' : '#9A9AA2';
    const color = isSelected || !isLive ? '#FFFFFF' : '#FF5A1F';
    const border = isHovered ? '3px solid #FF5A1F' : '2px solid #FFFFFF';
    const classes = [
      'sesh-dot',
      isLive ? 'sesh-dot--live' : '',
      isSelected ? 'sesh-dot--selected' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return L.divIcon({
      className: 'sesh-marker',
      html: `<span class="${classes}" style="display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;border-radius:50%;font-weight:700;line-height:1;width:${size}px;height:${size}px;background:${bg};color:${color};border:${border};box-shadow:0 1px 3px rgba(0,0,0,0.25);">${spot.liveCount}</span>`,
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
    map.whenReady(() => {
      spots.forEach((spot) => {
        const existing = markersRef.current[spot.id];
        if (existing) {
          existing.setIcon(buildIcon(spot));
        }
      });
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
    map.whenReady(() => {
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
      style={{ height, width: '100%' }}
      className="relative z-0 isolate overflow-hidden rounded-[12px] border"
    >
      <div ref={containerRef} className="h-full w-full" />
      {showLocateMe && <MapLocationControl map={mapRef.current} onLocateMe={onLocateMe} />}
    </div>
  );
}
