/**
 * useGPS Hook
 * Provides access to device GPS coordinates via Geolocation API
 */

import { useState, useEffect } from 'react';

/**
 * GPS state returned by the useGPS hook
 */
export type GPSState = {
  /** Latitude in degrees (-90 to 90) */
  latitude: number | null;
  /** Longitude in degrees (-180 to 180) */
  longitude: number | null;
  /** Accuracy of the position in meters */
  accuracy: number | null;
  /** Error object if geolocation fails */
  error: GeolocationPositionError | null;
  /** Whether the hook is currently fetching position */
  loading: boolean;
};

/**
 * Creates a GeolocationPositionError for testing/fallback purposes
 * @internal
 */
export function createGeolocationError(
  code: number,
  message: string
): GeolocationPositionError {
  return {
    code,
    message,
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as GeolocationPositionError;
}

/**
 * Hook to access device GPS coordinates
 *
 * @returns GPSState object with coordinates, accuracy, error, and loading state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { latitude, longitude, error, loading } = useGPS();
 *
 *   if (loading) return <div>Getting location...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!latitude || !longitude) return <div>No location available</div>;
 *
 *   return <div>Lat: {latitude}, Lon: {longitude}</div>;
 * }
 * ```
 */
export function useGPS(): GPSState {
  const [state, setState] = useState<GPSState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: createGeolocationError(2, 'Geolocation not supported'),
      }));
      return;
    }

    // Request current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error,
          loading: false,
        }));
      }
    );
  }, []);

  return state;
}
