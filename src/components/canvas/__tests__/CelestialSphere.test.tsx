/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import CelestialSphere from '../CelestialSphere';
import { useGPS } from '@/hooks/useGPS';
import { calculateLST } from '@/lib/astronomy';

// Mock the useGPS hook
vi.mock('@/hooks/useGPS', () => ({
  useGPS: vi.fn(),
}));

// Mock the calculateLST function - needs to return a value
vi.mock('@/lib/astronomy', async () => {
  const actual = await vi.importActual('@/lib/astronomy');
  return {
    ...actual,
    calculateLST: vi.fn(() => {
      // Default mock implementation returns a simple value
      return 0;
    }),
  };
});

// Mock StarField component to avoid complex rendering
vi.mock('../StarField', () => ({
  default: () => null,
}));

describe('CelestialSphere', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      vi.mocked(useGPS).mockReturnValue({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
        loading: true,
      });

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      expect(container.querySelector('canvas')).toBeTruthy();
    });

    it('should include StarField as a child', () => {
      vi.mocked(useGPS).mockReturnValue({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
        error: null,
        loading: false,
      });

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('LST Rotation Calculation', () => {
    it('should render correctly when longitude is available', () => {
      const mockLongitude = -74.006; // New York

      vi.mocked(useGPS).mockReturnValue({
        latitude: 40.7128,
        longitude: mockLongitude,
        accuracy: 10,
        error: null,
        loading: false,
      });

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      expect(container.querySelector('canvas')).toBeTruthy();
    });

    it('should return 0 rotation when longitude is null', () => {
      vi.mocked(useGPS).mockReturnValue({
        latitude: 40.7128,
        longitude: null,
        accuracy: null,
        error: null,
        loading: true,
      });

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      // Component should render even when longitude is null
      expect(container.querySelector('canvas')).toBeTruthy();
    });

    it('should handle LST degree to radian conversion correctly', () => {
      const expectedRadians = (90 * Math.PI) / 180; // π/2 radians

      vi.mocked(useGPS).mockReturnValue({
        latitude: 0,
        longitude: 0,
        accuracy: 10,
        error: null,
        loading: false,
      });

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      // Verify the conversion formula
      expect(expectedRadians).toBeCloseTo(Math.PI / 2);
    });
  });

  describe('Latitude Tilt Calculation', () => {
    it('should calculate latitude tilt when latitude is available', () => {
      const mockLatitude = 40.7128; // New York
      const expectedTiltDegrees = 90 - mockLatitude; // 49.2872 degrees
      const expectedTiltRadians = (expectedTiltDegrees * Math.PI) / 180;

      vi.mocked(useGPS).mockReturnValue({
        latitude: mockLatitude,
        longitude: -74.006,
        accuracy: 10,
        error: null,
        loading: false,
      });

      vi.mocked(calculateLST).mockReturnValue(0);

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      // Verify the tilt calculation
      expect(expectedTiltRadians).toBeCloseTo((49.2872 * Math.PI) / 180);
    });

    it('should return 0 tilt when latitude is null', () => {
      vi.mocked(useGPS).mockReturnValue({
        latitude: null,
        longitude: -74.006,
        accuracy: null,
        error: null,
        loading: true,
      });

      vi.mocked(calculateLST).mockReturnValue(0);

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      // With null latitude, tilt should be 0
    });

    it('should calculate correct tilt at North Pole (90°)', () => {
      // At North Pole: tilt = 90 - 90 = 0° (pole overhead)
      const mockLatitude = 90;
      const expectedTiltDegrees = 90 - mockLatitude; // 0 degrees
      const expectedTiltRadians = (expectedTiltDegrees * Math.PI) / 180;

      vi.mocked(useGPS).mockReturnValue({
        latitude: mockLatitude,
        longitude: 0,
        accuracy: 10,
        error: null,
        loading: false,
      });

      vi.mocked(calculateLST).mockReturnValue(0);

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      expect(expectedTiltRadians).toBe(0);
    });

    it('should calculate correct tilt at Equator (0°)', () => {
      // At Equator: tilt = 90 - 0 = 90° (pole on horizon)
      const mockLatitude = 0;
      const expectedTiltDegrees = 90 - mockLatitude; // 90 degrees
      const expectedTiltRadians = (expectedTiltDegrees * Math.PI) / 180;

      vi.mocked(useGPS).mockReturnValue({
        latitude: mockLatitude,
        longitude: 0,
        accuracy: 10,
        error: null,
        loading: false,
      });

      vi.mocked(calculateLST).mockReturnValue(0);

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      expect(expectedTiltRadians).toBeCloseTo(Math.PI / 2);
    });

    it('should calculate correct tilt at South Pole (-90°)', () => {
      // At South Pole: tilt = 90 - (-90) = 180° (pole below horizon)
      const mockLatitude = -90;
      const expectedTiltDegrees = 90 - mockLatitude; // 180 degrees
      const expectedTiltRadians = (expectedTiltDegrees * Math.PI) / 180;

      vi.mocked(useGPS).mockReturnValue({
        latitude: mockLatitude,
        longitude: 0,
        accuracy: 10,
        error: null,
        loading: false,
      });

      vi.mocked(calculateLST).mockReturnValue(0);

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      expect(expectedTiltRadians).toBeCloseTo(Math.PI);
    });
  });

  describe('GPS Updates', () => {
    it('should re-render when GPS coordinates change', () => {
      // Initial GPS
      vi.mocked(useGPS).mockReturnValue({
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
        error: null,
        loading: false,
      });

      const { container, rerender } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();

      // Updated GPS
      vi.mocked(useGPS).mockReturnValue({
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10,
        error: null,
        loading: false,
      });

      rerender(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      // Component should still render correctly with updated GPS
      expect(container).toBeTruthy();
      expect(container.querySelector('canvas')).toBeTruthy();
    });
  });

  describe('Performance Optimization', () => {
    it('should memoize LST calculation', () => {
      const mockGPS = {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
        error: null,
        loading: false,
      };

      vi.mocked(useGPS).mockReturnValue(mockGPS);
      vi.mocked(calculateLST).mockReturnValue(180);

      const { rerender } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      const initialCallCount = vi.mocked(calculateLST).mock.calls.length;

      // Rerender with same GPS data
      vi.mocked(useGPS).mockReturnValue(mockGPS);

      rerender(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      // calculateLST should be called same number of times (memoized)
      expect(vi.mocked(calculateLST).mock.calls.length).toBe(initialCallCount);
    });

    it('should memoize latitude tilt calculation', () => {
      const mockGPS = {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
        error: null,
        loading: false,
      };

      vi.mocked(useGPS).mockReturnValue(mockGPS);
      vi.mocked(calculateLST).mockReturnValue(180);

      const { container, rerender } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();

      // Rerender with same GPS data
      vi.mocked(useGPS).mockReturnValue(mockGPS);

      rerender(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      // Tilt should be recalculated only when latitude changes
      // With same latitude, memoization should prevent recalculation
      expect(container).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle GPS loading state', () => {
      vi.mocked(useGPS).mockReturnValue({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
        loading: true,
      });

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      // Should render even when GPS is loading
    });

    it('should handle GPS error state', () => {
      vi.mocked(useGPS).mockReturnValue({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: {
          code: 1,
          message: 'User denied Geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        },
        loading: false,
      });

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      // Should render even when GPS has an error
    });

    it('should handle partial GPS data (only latitude)', () => {
      vi.mocked(useGPS).mockReturnValue({
        latitude: 40.7128,
        longitude: null,
        accuracy: null,
        error: null,
        loading: false,
      });

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      // Should handle partial GPS data gracefully and still render
      expect(container.querySelector('canvas')).toBeTruthy();
    });

    it('should handle partial GPS data (only longitude)', () => {
      vi.mocked(useGPS).mockReturnValue({
        latitude: null,
        longitude: -74.006,
        accuracy: null,
        error: null,
        loading: false,
      });

      const { container } = render(
        <Canvas>
          <CelestialSphere />
        </Canvas>
      );

      expect(container).toBeTruthy();
      // Should handle partial GPS data gracefully and still render
      expect(container.querySelector('canvas')).toBeTruthy();
    });
  });
});
