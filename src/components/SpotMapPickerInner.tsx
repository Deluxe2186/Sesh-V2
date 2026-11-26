'use client';

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
  const isInitialized = useRef(false);
  const approximateRef = useRef(approximate);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  // Keep approximate ref in sync
  useEffect(() => {
    approximateRef.current = approximate;
  }, [approximate]);

  function handleLocateMe() {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;

        const map = mapRef.current;
        if (map) {
          // Wait for map to be fully ready and check pane before setting view
          map.whenReady(() => {
            if (!mapRef.current) return;
            const mapPane = map.getPane('mapPane');
            if (!mapPane) {
              console.warn('Map pane not ready for setView, retrying...');
              setTimeout(() => {
                if (mapRef.current) mapRef.current.whenReady(() => {
                  if (mapRef.current) mapRef.current.setView([newLat, newLng], 16, { animate: true });
                });
              }, 50);
              return;
            }
            map.setView([newLat, newLng], 16, { animate: true });
          });
        }

        // Update user marker
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

        onLocateMe?.(newLat, newLng);
        onChange(newLat, newLng);
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

  // Initialize map once when container is ready
  useEffect(() => {
    if (isInitialized.current || !containerRef.current) return;

    // Ensure container has dimensions before initializing
    const container = containerRef.current;
    if (container.offsetHeight === 0 || container.offsetWidth === 0) return;

    // Check if container is visible in viewport
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    let map: L.Map;
    let observer: ResizeObserver | null = null;
    try {
      // Initialize map without zoom and without scroll wheel zoom
      // These will be enabled after the map is fully ready
      map = L.map(containerRef.current, {
        center: lat && lng ? [lat, lng] : LAGOS_CENTER,
        zoom: 11, // Default zoom, will be updated after map is ready
        scrollWheelZoom: false, // Disabled initially, enabled after map is ready
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      isInitialized.current = true;
      onError(null);

      // Wait for map to be fully ready before enabling interactions
      map.whenReady(() => {
        // Small delay to ensure map pane is fully rendered
        setTimeout(() => {
          if (!mapRef.current) return;

          // Check if map pane exists before any zoom operations
          const mapPane = map.getPane('mapPane');
          if (!mapPane) {
            console.warn('Map pane not ready, retrying...');
            setTimeout(() => {
              if (mapRef.current) mapRef.current.whenReady(() => {
                if (mapRef.current) {
                  const initialZoom = lat && lng ? 16 : 11;
                  mapRef.current.setZoom(initialZoom);
                  mapRef.current.scrollWheelZoom.enable();
                }
              });
            }, 50);
            return;
          }

          // Set the proper initial zoom
          const initialZoom = lat && lng ? 16 : 11;
          map.setZoom(initialZoom);

          // Enable scroll wheel zoom now that map is ready
          map.scrollWheelZoom.enable();
        map.on('click', (e: L.LeafletMouseEvent) => {
          // Don't prevent default or stop propagation - allow clicks to bubble for navigation
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

        // The map can start hidden (phone list view). Re-measure when it appears.
        observer =
          typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(() => {
                if (mapRef.current) {
                  mapRef.current.invalidateSize();
                }
              })
            : null;
        observer?.observe(containerRef.current);
      });

      } catch (err) {
        onError('Failed to load map. Please try again.');
        console.error('Map initialization error:', err);
      }

    return () => {
      if (observer) {
        observer.disconnect();
      }
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
        // Wait for map to be fully ready and check pane before setting view
        map.whenReady(() => {
          if (!mapRef.current) return;
          const mapPane = map.getPane('mapPane');
          if (!mapPane) {
            console.warn('Map pane not ready for setView, retrying...');
            setTimeout(() => {
              if (mapRef.current) mapRef.current.whenReady(() => {
                if (mapRef.current) mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: true });
              });
            }, 50);
            return;
          }
          map.setView([lat, lng], map.getZoom(), { animate: true });
        });
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
        'overflow-hidden rounded-[12px] border bg-surface relative',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {showLocateMe && !disabled && (
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-foreground shadow-lg transition-all hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="Show my location"
        >
          {locating ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
            </svg>
          )}
        </button>
      )}
      {locateError && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="mx-auto max-w-xs rounded-md bg-destructive/90 p-3 text-center text-sm text-destructive-foreground shadow-lg">
            {locateError}
          </div>
        </div>
      )}
    </div>
  );
}