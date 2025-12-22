/**
 * useGPS Hook
 * Provides access to device GPS coordinates via Geolocation API
 */

import { useState } from 'react';

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
  /** Whether the current location is a fallback (not actual GPS) */
  isFallback: boolean;
  /** Function to manually request GPS permission */
  requestPermission: () => Promise<void>;
};

/**
 * Default fallback location when GPS is unavailable or denied
 * Using San Francisco, CA as a reasonable default for celestial observations
 */
const FALLBACK_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: null,
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
 * @returns GPSState object with coordinates, accuracy, error, loading state, and requestPermission function
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { latitude, longitude, error, loading, requestPermission } = useGPS();
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
  const [state, setState] = useState<Omit<GPSState, 'requestPermission'>>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
    isFallback: false,
  });

  /**
   * Request GPS permission and get current position
   */
  const requestPermission = async (): Promise<void> => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      // Use fallback location when geolocation is not supported
      setState({
        ...FALLBACK_LOCATION,
        error: createGeolocationError(2, 'Geolocation not supported'),
        loading: false,
        isFallback: true,
      });
      throw new Error('Geolocation not supported');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            error: null,
            loading: false,
            isFallback: false,
          });
          resolve();
        },
        (error) => {
          // Use fallback location when permission is denied or other errors occur
          setState({
            ...FALLBACK_LOCATION,
            error,
            loading: false,
            isFallback: true,
          });
          reject(error);
        }
      );
    });
  };

  return {
    ...state,
    requestPermission,
  };
}
