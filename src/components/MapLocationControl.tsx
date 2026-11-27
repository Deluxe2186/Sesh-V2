'use client';

import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';

interface MapLocationControlProps {
  map: L.Map | null;
  onLocateMe?: (lat: number, lng: number) => void;
}

export default function MapLocationControl({ map, onLocateMe }: MapLocationControlProps) {
  const userMarkerRef = useRef<L.Marker | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number; updatedAt: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
    };
  }, [map]);

  function showLocation(lat: number, lng: number) {
    if (!map) return;

    map.whenReady(() => map.setView([lat, lng], 16, { animate: true }));

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
      return;
    }

    const userIcon = L.divIcon({
      className: 'sesh-user-marker',
      html: '<span style="display:block;width:18px;height:18px;border-radius:50%;background:#16A34A;border:3px solid #FFFFFF;box-shadow:0 0 0 5px rgba(22,163,74,0.22),0 2px 8px rgba(0,0,0,0.3);"></span>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    userMarkerRef.current = L.marker([lat, lng], {
      icon: userIcon,
      title: 'Your current location',
      keyboard: false,
      zIndexOffset: 1000,
    }).addTo(map);
  }

  function handleLocateMe() {
    if (!map) return;
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser');
      return;
    }

    const cached = lastLocationRef.current;
    const cacheIsFresh = cached && Date.now() - cached.updatedAt < 5 * 60 * 1000;
    if (cacheIsFresh) {
      showLocation(cached.lat, cached.lng);
      setLocateError(null);
      return;
    }
    if (cached) showLocation(cached.lat, cached.lng);

    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        lastLocationRef.current = { lat, lng, updatedAt: Date.now() };
        setHasLocation(true);
        showLocation(lat, lng);
        onLocateMe?.(lat, lng);
        setLocating(false);
        setLocateError(null);
      },
      (error) => {
        let message = 'Unable to retrieve your location';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location access was denied. Please enable it in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out';
        }
        setLocateError(message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleLocateMe}
        disabled={locating || !map}
        className="absolute bottom-4 right-4 z-[1000] inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-foreground shadow-lg transition-all hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        aria-label={hasLocation ? 'Recenter to my location' : 'Show my location'}
      >
        {locating ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
            </svg>
            <span className="hidden lg:inline">My location</span>
          </>
        )}
      </button>
      {locateError && (
        <div className="absolute bottom-4 left-4 right-16 z-[1000]">
          <div role="status" className="mx-auto max-w-xs rounded-md bg-destructive/90 p-3 text-center text-sm text-destructive-foreground shadow-lg">
            {locateError}
          </div>
        </div>
      )}
    </>
  );
}
