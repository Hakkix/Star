/**
 * Example tests for useGPS hook
 * Demonstrates testing hooks that interact with browser APIs
 *
 * NOTE: This is a template test. Actual implementation will be added
 * when the useGPS hook is created.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useState, useEffect } from 'react';
import {
  mockGeolocation,
  createGeolocationError,
  resetSensorMocks,
} from '@/test/mocks/sensors';

// Example hook signature (will be implemented in src/hooks/useGPS.ts)
type GPSState = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: GeolocationPositionError | null;
  loading: boolean;
};

/**
 * Example useGPS hook implementation
 * This will be created in src/hooks/useGPS.ts
 */
function useGPS(): GPSState {
  const [state, setState] = useState<GPSState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: createGeolocationError(2, 'Geolocation not supported'),
      }));
      return;
    }

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

describe('useGPS Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetSensorMocks();
  });

  test('initially returns loading state', () => {
    mockGeolocation({ latitude: 40.7128, longitude: -74.006 });

    const { result } = renderHook(() => useGPS());

    expect(result.current.loading).toBe(true);
    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
  });

  test('successfully retrieves GPS coordinates', async () => {
    const coords = { latitude: 40.7128, longitude: -74.006, accuracy: 10 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.latitude).toBe(40.7128);
    expect(result.current.longitude).toBe(-74.006);
    expect(result.current.accuracy).toBe(10);
    expect(result.current.error).toBeNull();
  });

  test('handles permission denied error', async () => {
    const error = createGeolocationError(1, 'User denied geolocation');
    mockGeolocation({ latitude: 0, longitude: 0 }, { error });

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.code).toBe(1); // PERMISSION_DENIED
    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
  });

  test('handles position unavailable error', async () => {
    const error = createGeolocationError(2, 'Position unavailable');
    mockGeolocation({ latitude: 0, longitude: 0 }, { error });

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.code).toBe(2); // POSITION_UNAVAILABLE
  });

  test('handles timeout error', async () => {
    const error = createGeolocationError(3, 'Timeout');
    mockGeolocation({ latitude: 0, longitude: 0 }, { error });

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.code).toBe(3); // TIMEOUT
  });

  test('handles coordinates with high accuracy', async () => {
    const coords = { latitude: 51.5074, longitude: -0.1278, accuracy: 5 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.accuracy).toBe(5);
    });
  });

  test('handles coordinates with low accuracy', async () => {
    const coords = { latitude: 35.6762, longitude: 139.6503, accuracy: 100 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.accuracy).toBe(100);
    });
  });

  test('handles edge case: North Pole coordinates', async () => {
    const coords = { latitude: 90, longitude: 0 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.latitude).toBe(90);
    });
  });

  test('handles edge case: South Pole coordinates', async () => {
    const coords = { latitude: -90, longitude: 0 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.latitude).toBe(-90);
    });
  });

  test('handles edge case: International Date Line', async () => {
    const coords = { latitude: 0, longitude: 180 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.longitude).toBe(180);
    });
  });

  test('validates latitude range (-90 to 90)', async () => {
    const coords = { latitude: 40.7128, longitude: -74.006 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.latitude).toBeGreaterThanOrEqual(-90);
      expect(result.current.latitude).toBeLessThanOrEqual(90);
    });
  });

  test('validates longitude range (-180 to 180)', async () => {
    const coords = { latitude: 40.7128, longitude: -74.006 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.longitude).toBeGreaterThanOrEqual(-180);
      expect(result.current.longitude).toBeLessThanOrEqual(180);
    });
  });
});

describe('useGPS Hook - Browser Compatibility', () => {
  test('handles missing geolocation API', async () => {
    // Don't mock geolocation (simulate unsupported browser)
    const originalGeolocation = navigator.geolocation;
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useGPS());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    // Restore
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
    });
  });
});
