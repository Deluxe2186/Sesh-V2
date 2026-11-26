'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
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
  showLocateMe?: boolean;
  onLocateMe?: (lat: number, lng: number) => void;
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
  showLocateMe = true,
  onLocateMe,
}: SpotMapPickerInnerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [locating, setLocating] = useState(false);

  function handleLocateMe() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    const map = mapRef.current;
    // Check if map is ready using type assertion for internal _loaded property
    if (!map || !(map as L.Map & { _loaded?: boolean })._loaded) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;

        const mapInstance = mapRef.current;
        if (mapInstance) {
          mapInstance.setView([position.coords.latitude, position.coords.longitude], 16, { animate: true });
        }

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([position.coords.latitude, position.coords.longitude]);
        } else if (mapRef.current) {
          const userIcon = L.divIcon({
            className: 'sesh-user-marker',
            html: `
              <div style="
                width: 20px;
                height: 20px;
                background: #16A34A;
                border: 3px solid #FFFFFF;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              " />
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          userMarkerRef.current = L.marker([position.coords.latitude, position.coords.longitude], { icon: userIcon }).addTo(mapRef.current!);
        }
      },
      () => {
        alert('Unable to retrieve your location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Initialize map once when container is ready
  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.offsetHeight === 0) return;

    const map = L.map(container, {
      center: [6.5244, 3.3792],
      zoom: 11,
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    map.whenReady(() => {
      map.scrollWheelZoom.enable();

      map.on('click', (e: L.LeafletMouseEvent) => {
        const newLat = e.latlng.lat;
        const newLng = e.latlng.lng;
        // onChange(newLat, newLng); // Disabled for now
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Initialize map with location if provided
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !(map as L.Map & { _loaded?: boolean })._loaded) return;

    if (lat !== null && lng !== null) {
      const initialZoom = 16;
      try {
        map.setView([lat, lng], initialZoom);
      } catch (err) {
        console.warn('setView failed:', err);
      }
    }
  }, [lat, lng]);

  return (
    <div
      style={{ height, width: '100%' }}
      className="overflow-hidden rounded-[12px] border bg-surface relative"
    >
      <div
        ref={containerRef}
        style={{ height, width: '100%' }}
        className="overflow-hidden rounded-[12px] border bg-surface"
      />
      <div className="absolute bottom-4 right-4 z-20">
        <button
          type="button"
          onClick={() => {
            if (!navigator.geolocation) {
              alert('Geolocation is not supported by your browser');
              return;
            }
            const map = mapRef.current;
            if (!map || !(map as L.Map & { _loaded?: boolean })._loaded) return;

            navigator.geolocation.getCurrentPosition(
              (position) => {
                const mapInstance = mapRef.current;
                if (mapInstance) {
                  mapInstance.setView([position.coords.latitude, position.coords.longitude], 16, { animate: true });
                }
              },
              () => {
                alert('Unable to retrieve your location');
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          }}
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-foreground shadow-lg transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="Show my location"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
          </svg>
        </button>
      </div>
    </div>
  );
}