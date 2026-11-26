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
  const mapReady = useRef(false);
  const initializationAttempted = useRef(false);
  const approximateRef = useRef(approximate);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  // Keep approximate ref in sync
  useEffect(() => {
    approximateRef.current = approximate;
  }, [approximate]);

  function checkMapPaneReady(map: L.Map): boolean {
    try {
      const pane = map.getPane('mapPane');
      return !!pane && pane.style.transform !== undefined && pane.style.transform !== '';
    } catch {
      return false;
    }
  }

  function waitForMapPane(map: L.Map, maxAttempts = 30): Promise<boolean> {
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        if (map._container && map._container.offsetWidth > 0 && map.getPane('mapPane')) {
          const pane = map.getPane('mapPane');
          if (pane && pane.style.transform && pane.style.transform !== '') {
            resolve(true);
            return;
          }
        }
        if (attempts >= 50) {
          console.warn('Map pane not ready after max attempts, proceeding anyway');
          resolve(false);
        } else {
          attempts++;
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  async function safeSetView(map: L.Map, center: [number, number], zoom: number, animate = true): Promise<void> {
    if (!map || !map._container) return;
    const ready = await new Promise<boolean>((resolve) => {
      let attempts = 0;
      const check = () => {
        if (map.getPane('mapPane')?.style.transform) {
          resolve(true);
        } else if (attempts >= 30) {
          resolve(false);
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
    if (!ready) {
      console.warn('Map pane not ready for setView, skipping');
      return;
    }
    try {
      map.setView(center, zoom, { animate });
    } catch (err) {
      console.warn('setView failed:', err);
    }
  }

  function handleLocateMe() {
    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;

        const map = mapRef.current;
        if (map && map._loaded) {
          try {
            map.setView([newLat, newLng], 16, { animate: true });
          } catch (err) {
            console.warn('setView failed:', err);
          }
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
    if (isInitialized.current || initializationAttempted.current || !containerRef.current) return;

    // Ensure container has dimensions before initializing
    const container = containerRef.current;
    if (container.offsetHeight === 0 || container.offsetWidth === 0) return;

    // Check if container is visible in viewport
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    initializationAttempted.current = true;

    let map: L.Map;
    let observer: ResizeObserver | null = null;
    let mapReady = false;

    try {
      // Initialize map without zoom and without scroll wheel zoom
      // These will be enabled after the map is fully ready
      map = L.map(containerRef.current, {
        center: lat && lng ? [lat, lng] : [6.5244, 3.3792],
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
      isInitialized.current = true;
      onError(null);

      // Setup map after it's fully ready
      const setupMap = () => {
        if (mapReady) return;
        mapReady = true;

        // Set proper initial zoom
        const initialZoom = lat && lng ? 16 : 11;
        try {
          map.setZoom(lat && lng ? 16 : 11);
        } catch (err) {
          console.warn('Initial setZoom failed:', err);
        }

        // Enable scroll wheel zoom now that map is ready
        try {
          map.scrollWheelZoom.enable();
        } catch (err) {
          console.warn('scrollWheelZoom.enable failed:', err);
        }

        // Add click handler to place pin
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

        // Add initial marker if lat/lng provided
        if (lat !== null && lng !== null) {
          addMarker(map, lat, lng);
        }

        // The map can start hidden (phone list view). Re-measure when it appears.
        const observer = typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(() => {
              if (mapRef.current) {
                try {
                  mapRef.current.invalidateSize();
                } catch (err) {
                  console.warn('invalidateSize failed:', err);
                }
              }
            })
          : null;
        observer?.observe(containerRef.current);
      };

      // Use map.whenReady with a small delay to ensure DOM is ready
      setTimeout(() => {
        map.whenReady(() => {
          setupMap();
        });
      }, 50);

    } catch (err) {
      onError('Failed to load map. Please try again.');
      console.error('Map initialization error:', err);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (map) {
        try {
          map.remove();
        } catch (err) {
          console.warn('map.remove failed:', err);
        }
      }
      mapRef.current = null;
      isInitialized.current = false;
    };
  }, [disabled, onChange, onError]);

  // Update marker when lat/lng changes from outside (without re-initializing map)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map._loaded) return;

    if (lat !== null && lng !== null) {
      addMarker(map, lat, lng);
      if (!disabled) {
        map.whenReady(() => {
          if (map._loaded) {
            map.setView([lat, lng], map.getZoom(), { animate: true });
          }
        });
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
          e.target.setLatLng([jitterLat, jitterLng]);
        } else {
          onChange(newLat, newLng);
        }
      });
    }
  }

  // Keep approximate ref in sync
  const approximateRef = { current: approximate };
  useEffect(() => {
    approximateRef.current = approximate;
  }, [approximate]);

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
                  userMarkerRef.current = L.marker([newLat, newLng], { icon: userIcon }).addTo(map);
                }
              },
              (error) => {
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