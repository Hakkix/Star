import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useStarStore,
  useGPS,
  useOrientation,
  useSelectedBody,
  usePermissions,
  useUIState,
  useSettings,
  type CelestialBodyData,
} from './store';

describe('Star Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useStarStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('GPS State', () => {
    it('should initialize with null GPS data', () => {
      const { result } = renderHook(() => useGPS());
      expect(result.current).toBeNull();
    });

    it('should set GPS coordinates', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.setGPS(37.7749, -122.4194, 10);
      });

      expect(result.current.gps).toEqual({
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
      });
    });

    it('should clear GPS data', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.setGPS(37.7749, -122.4194, 10);
        result.current.clearGPS();
      });

      expect(result.current.gps).toBeNull();
    });

    it('should clear error when setting GPS', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.setError('GPS Error');
        result.current.setGPS(37.7749, -122.4194, 10);
      });

      expect(result.current.errorMessage).toBeNull();
    });

    it('should set GPS permission state', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.setGPSPermission('granted');
      });

      expect(result.current.gpsPermission).toBe('granted');
    });
  });

  describe('Device Orientation State', () => {
    it('should initialize with null orientation data', () => {
      const { result } = renderHook(() => useOrientation());
      expect(result.current).toBeNull();
    });

    it('should set device orientation', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.setOrientation(45, 30, -15);
      });

      expect(result.current.orientation).toEqual({
        alpha: 45,
        beta: 30,
        gamma: -15,
      });
    });

    it('should clear orientation data', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.setOrientation(45, 30, -15);
        result.current.clearOrientation();
      });

      expect(result.current.orientation).toBeNull();
    });

    it('should set orientation permission state', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.setOrientationPermission('granted');
      });

      expect(result.current.orientationPermission).toBe('granted');
    });
  });

  describe('Celestial Body Selection', () => {
    it('should initialize with no selected body', () => {
      const { result } = renderHook(() => useSelectedBody());
      expect(result.current).toBeNull();
    });

    it('should select a star', () => {
      const { result } = renderHook(() => useStarStore());
      const star: CelestialBodyData = {
        type: 'star',
        name: 'Sirius',
        ra: 6.7525,
        dec: -16.7161,
        mag: -1.46,
        con: 'CMA',
        dist: 8.6,
        hip: 32349,
      };

      act(() => {
        result.current.selectCelestialBody(star);
      });

      expect(result.current.selectedBody).toEqual(star);
    });

    it('should select a planet', () => {
      const { result } = renderHook(() => useStarStore());
      const planet: CelestialBodyData = {
        type: 'planet',
        name: 'Mars',
        ra: 12.5,
        dec: 20.3,
      };

      act(() => {
        result.current.selectCelestialBody(planet);
      });

      expect(result.current.selectedBody).toEqual(planet);
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useStarStore());
      const star: CelestialBodyData = {
        type: 'star',
        name: 'Sirius',
        ra: 6.7525,
        dec: -16.7161,
      };

      act(() => {
        result.current.selectCelestialBody(star);
        result.current.clearSelection();
      });

      expect(result.current.selectedBody).toBeNull();
    });
  });

  describe('UI State', () => {
    it('should initialize with loading false and no error', () => {
      const { result } = renderHook(() => useUIState());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.errorMessage).toBeNull();
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set error message', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.errorMessage).toBe('Test error');
    });

    it('should clear error message', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.setError('Test error');
        result.current.clearError();
      });

      expect(result.current.errorMessage).toBeNull();
    });
  });

  describe('Settings', () => {
    it('should initialize with constellations and planets visible', () => {
      const { result } = renderHook(() => useSettings());

      expect(result.current.showConstellations).toBe(true);
      expect(result.current.showPlanets).toBe(true);
    });

    it('should toggle constellations visibility', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.toggleConstellations();
      });

      expect(result.current.showConstellations).toBe(false);

      act(() => {
        result.current.toggleConstellations();
      });

      expect(result.current.showConstellations).toBe(true);
    });

    it('should toggle planets visibility', () => {
      const { result } = renderHook(() => useStarStore());

      act(() => {
        result.current.togglePlanets();
      });

      expect(result.current.showPlanets).toBe(false);

      act(() => {
        result.current.togglePlanets();
      });

      expect(result.current.showPlanets).toBe(true);
    });
  });

  describe('Permissions Selector', () => {
    it('should return both permission states', () => {
      const { result: permResult } = renderHook(() => usePermissions());
      const { result: storeResult } = renderHook(() => useStarStore());

      expect(permResult.current).toEqual({
        gps: 'prompt',
        orientation: 'prompt',
      });

      act(() => {
        storeResult.current.setGPSPermission('granted');
        storeResult.current.setOrientationPermission('denied');
      });

      const { result: updatedResult } = renderHook(() => usePermissions());

      expect(updatedResult.current).toEqual({
        gps: 'granted',
        orientation: 'denied',
      });
    });
  });

  describe('Store Reset', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useStarStore());

      // Set various state values
      act(() => {
        result.current.setGPS(37.7749, -122.4194, 10);
        result.current.setOrientation(45, 30, -15);
        result.current.setGPSPermission('granted');
        result.current.setOrientationPermission('granted');
        result.current.selectCelestialBody({
          type: 'star',
          name: 'Test Star',
          ra: 0,
          dec: 0,
        });
        result.current.setLoading(true);
        result.current.setError('Test error');
        result.current.toggleConstellations();
        result.current.togglePlanets();
      });

      // Reset store
      act(() => {
        result.current.reset();
      });

      // Verify all values are back to initial state
      expect(result.current.gps).toBeNull();
      expect(result.current.orientation).toBeNull();
      expect(result.current.gpsPermission).toBe('prompt');
      expect(result.current.orientationPermission).toBe('prompt');
      expect(result.current.selectedBody).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.errorMessage).toBeNull();
      expect(result.current.showConstellations).toBe(true);
      expect(result.current.showPlanets).toBe(true);
    });
  });

  describe('Selector Hooks', () => {
    it('should prevent unnecessary re-renders with selector hooks', () => {
      const { result: gpsResult } = renderHook(() => useGPS());
      const { result: storeResult } = renderHook(() => useStarStore());

      // Change orientation (GPS hook should not cause re-render)
      act(() => {
        storeResult.current.setOrientation(45, 30, -15);
      });

      // GPS data should still be null
      expect(gpsResult.current).toBeNull();

      // Now set GPS data
      act(() => {
        storeResult.current.setGPS(37.7749, -122.4194, 10);
      });

      const { result: updatedGpsResult } = renderHook(() => useGPS());

      expect(updatedGpsResult.current).toEqual({
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
      });
    });
  });
});
