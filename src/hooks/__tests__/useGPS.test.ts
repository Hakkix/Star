/**
 * Tests for useGPS hook
 * Verifies hook behavior when interacting with browser Geolocation API
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGPS, createGeolocationError } from '@/hooks/useGPS';
import {
  mockGeolocation,
  resetSensorMocks,
} from '@/test/mocks/sensors';

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

    // Initially, loading should be false until requestPermission is called
    expect(result.current.loading).toBe(false);
    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.isFallback).toBe(false);
  });

  test('successfully retrieves GPS coordinates', async () => {
    const coords = { latitude: 40.7128, longitude: -74.006, accuracy: 10 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation
    await result.current.requestPermission();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.latitude).toBe(40.7128);
    expect(result.current.longitude).toBe(-74.006);
    expect(result.current.accuracy).toBe(10);
    expect(result.current.error).toBeNull();
    expect(result.current.isFallback).toBe(false);
  });

  test('handles permission denied error with fallback location', async () => {
    const error = createGeolocationError(1, 'User denied geolocation');
    mockGeolocation({ latitude: 0, longitude: 0 }, { error });

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation
    await expect(result.current.requestPermission()).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.code).toBe(1); // PERMISSION_DENIED
    // Should use fallback location (San Francisco)
    expect(result.current.latitude).toBe(37.7749);
    expect(result.current.longitude).toBe(-122.4194);
    expect(result.current.isFallback).toBe(true);
  });

  test('handles position unavailable error with fallback location', async () => {
    const error = createGeolocationError(2, 'Position unavailable');
    mockGeolocation({ latitude: 0, longitude: 0 }, { error });

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation
    await expect(result.current.requestPermission()).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.code).toBe(2); // POSITION_UNAVAILABLE
    // Should use fallback location (San Francisco)
    expect(result.current.latitude).toBe(37.7749);
    expect(result.current.longitude).toBe(-122.4194);
    expect(result.current.isFallback).toBe(true);
  });

  test('handles timeout error with fallback location', async () => {
    const error = createGeolocationError(3, 'Timeout');
    mockGeolocation({ latitude: 0, longitude: 0 }, { error });

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation
    await expect(result.current.requestPermission()).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.code).toBe(3); // TIMEOUT
    // Should use fallback location (San Francisco)
    expect(result.current.latitude).toBe(37.7749);
    expect(result.current.longitude).toBe(-122.4194);
    expect(result.current.isFallback).toBe(true);
  });

  test('handles coordinates with high accuracy', async () => {
    const coords = { latitude: 51.5074, longitude: -0.1278, accuracy: 5 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation
    await result.current.requestPermission();

    await waitFor(() => {
      expect(result.current.accuracy).toBe(5);
    });
  });

  test('handles coordinates with low accuracy', async () => {
    const coords = { latitude: 35.6762, longitude: 139.6503, accuracy: 100 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation
    await result.current.requestPermission();

    await waitFor(() => {
      expect(result.current.accuracy).toBe(100);
    });
  });

  test('handles edge case: North Pole coordinates', async () => {
    const coords = { latitude: 90, longitude: 0 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation
    await result.current.requestPermission();

    await waitFor(() => {
      expect(result.current.latitude).toBe(90);
    });
  });

  test('handles edge case: South Pole coordinates', async () => {
    const coords = { latitude: -90, longitude: 0 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation
    await result.current.requestPermission();

    await waitFor(() => {
      expect(result.current.latitude).toBe(-90);
    });
  });

  test('handles edge case: International Date Line', async () => {
    const coords = { latitude: 0, longitude: 180 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation
    await result.current.requestPermission();

    await waitFor(() => {
      expect(result.current.longitude).toBe(180);
    });
  });

  test('validates latitude range (-90 to 90)', async () => {
    const coords = { latitude: 40.7128, longitude: -74.006 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation
    await result.current.requestPermission();

    await waitFor(() => {
      expect(result.current.latitude).toBeGreaterThanOrEqual(-90);
      expect(result.current.latitude).toBeLessThanOrEqual(90);
    });
  });

  test('validates longitude range (-180 to 180)', async () => {
    const coords = { latitude: 40.7128, longitude: -74.006 };
    mockGeolocation(coords);

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation
    await result.current.requestPermission();

    await waitFor(() => {
      expect(result.current.longitude).toBeGreaterThanOrEqual(-180);
      expect(result.current.longitude).toBeLessThanOrEqual(180);
    });
  });
});

describe('useGPS Hook - Browser Compatibility', () => {
  test('handles missing geolocation API with fallback location', async () => {
    // Don't mock geolocation (simulate unsupported browser)
    const originalGeolocation = navigator.geolocation;
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useGPS());

    // Call requestPermission to trigger geolocation check
    await expect(result.current.requestPermission()).rejects.toThrow('Geolocation not supported');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    // Should use fallback location (San Francisco)
    expect(result.current.latitude).toBe(37.7749);
    expect(result.current.longitude).toBe(-122.4194);
    expect(result.current.isFallback).toBe(true);

    // Restore
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
    });
  });
});
