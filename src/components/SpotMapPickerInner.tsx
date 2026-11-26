'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
  const isInitialized = useRef(false);
  const approximateRef = useRef(approximate);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  useEffect(() => {
    approximateRef.current = approximate;
  }, [approximate]);

  function handleLocateMe() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    const map = mapRef.current;
    if (!map || !map._loaded) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;

        map.setView([newLat, newLng], 16, { animate: true });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([newLat, newLng]);
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
          userMarkerRef.current = L.marker([newLat, newLng], { icon: userIcon }).addTo(mapRef.current!);
        }
      },
      (error) => {
        alert('Unable to retrieve your location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Initialize map once when container is ready
  useEffect(() => {
    if (isInitialized.current || !containerRef.current) return;

    const container = containerRef.current;
    if (container.offsetHeight === 0 || container.offsetWidth === 0) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    let map: L.Map;
    try {
      map = L.map(containerRef.current, {
        center: lat && lng ? [lat, lng] : [6.5244, 3.3792],
        zoom: lat && lng ? 16 : 11,
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
          if (disabled) return;
          let newLat = e.latlng.lat;
          let newLng = e.latlng.lng;

          if (approximateRef.current) {
            newLat += (Math.random() - 0.5) * 0.004;
            newLng += (Math.random() - 0.5) * 0.004;
          }

          onChange(newLat, newLng);
        });

        if (lat !== null && lng !== null) {
          addMarker(map, lat, lng);
        }
      });

    } catch (err) {
      console.error('Map initialization error:', err);
      onError('Failed to load map. Please try again.');
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (err) {
          console.warn('map.remove failed:', err);
        }
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker when lat/lng changes from outside (without re-initializing map)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map._loaded) return;

    if (lat !== null && lng !== null) {
      addMarker(lat, lng);
      if (!disabled) {
        map.setView([lat, lng], map.getZoom(), { animate: true });
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [lat, lng, disabled]);

  function addMarker(latitude: number, longitude: number) {
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
        draggable: true,
      }).addTo(mapRef.current!);

      markerRef.current.on('dragend', (e) => {
        let newLat = e.target.getLatLng().lat;
        let newLng = e.target.getLatLng().lng;

        if (approximateRef.current) {
          const jitterLat = newLat + (Math.random() - 0.5) * 0.004;
          const jitterLng = newLng + (Math.random() - 0.5) * 0.004;
          onChange(jitterLat, jitterLng);
          e.target.setLatLng([jitterLat, jitterLng]);
        } else {
          onChange(newLat, newLng);
        }
      });
    }

  const approximateRef = { current: true };
  useEffect(() => {
    approximateRef.current = true;
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className={cn(
        'overflow-hidden rounded-[12px] border bg-surface relative',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {!disabled && (
        <button
          type="button"
          onClick={() => {
            if (!navigator.geolocation) {
              alert('Geolocation is not supported by your browser');
              return;
            }
            const map = mapRef.current;
            if (!map || !map._loaded) return;

            navigator.geolocation.getCurrentPosition(
              (position) => {
                const newLat = position.coords.latitude;
                const newLng = position.coords.longitude;
                const map = mapRef.current;
                if (map) {
                  map.setView([position.coords.latitude, position.coords.longitude], 16, { animate: true });
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
          className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-foreground shadow-lg transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="Show my location"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
          </svg>
        </button>
      )}
    </div>
  );
}