/**
 * Mock utilities for browser sensor APIs
 * Used in tests for GPS and device orientation functionality
 */

import { vi } from 'vitest';

export interface MockGeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface MockDeviceOrientation {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  absolute?: boolean;
}

/**
 * Mock the Geolocation API
 * @param coords - Coordinates to return
 * @param options - Additional options
 */
export function mockGeolocation(
  coords: MockGeolocationCoords,
  options?: {
    delay?: number;
    error?: GeolocationPositionError;
  }
) {
  const defaultCoords: GeolocationCoordinates = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? 10,
    altitude: coords.altitude ?? null,
    altitudeAccuracy: coords.altitudeAccuracy ?? null,
    heading: coords.heading ?? null,
    speed: coords.speed ?? null,
    toJSON() {
      return {
        latitude: this.latitude,
        longitude: this.longitude,
        accuracy: this.accuracy,
        altitude: this.altitude,
        altitudeAccuracy: this.altitudeAccuracy,
        heading: this.heading,
        speed: this.speed,
      };
    },
  };

  const position: GeolocationPosition = {
    coords: defaultCoords,
    timestamp: Date.now(),
    toJSON() {
      return {
        coords: this.coords,
        timestamp: this.timestamp,
      };
    },
  };

  const mockGetCurrentPosition = vi.fn(
    (
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback
    ) => {
      if (options?.error && errorCallback) {
        setTimeout(() => errorCallback(options.error!), options?.delay ?? 0);
      } else {
        setTimeout(() => successCallback(position), options?.delay ?? 0);
      }
    }
  );

  const mockWatchPosition = vi.fn(
    (
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback
    ) => {
      if (options?.error && errorCallback) {
        setTimeout(() => errorCallback(options.error!), options?.delay ?? 0);
      } else {
        setTimeout(() => successCallback(position), options?.delay ?? 0);
      }
      return 1; // watchId
    }
  );

  const mockClearWatch = vi.fn();

  const mockGeolocation = {
    getCurrentPosition: mockGetCurrentPosition,
    watchPosition: mockWatchPosition,
    clearWatch: mockClearWatch,
  };

  // Stub the global navigator.geolocation
  vi.stubGlobal('navigator', {
    ...navigator,
    geolocation: mockGeolocation,
  });

  return {
    geolocation: mockGeolocation,
    position,
  };
}

/**
 * Mock DeviceOrientationEvent
 * @param orientation - Orientation data to return
 */
export function mockDeviceOrientation(orientation: MockDeviceOrientation) {
  // Create a mock DeviceOrientationEvent
  const mockEvent = {
    alpha: orientation.alpha,
    beta: orientation.beta,
    gamma: orientation.gamma,
    absolute: orientation.absolute ?? false,
  } as DeviceOrientationEvent;

  // Mock the requestPermission method (iOS 13+)
  const mockRequestPermission = vi
    .fn()
    .mockResolvedValue('granted' as PermissionState);

  // Add requestPermission to DeviceOrientationEvent if it doesn't exist
  if (typeof DeviceOrientationEvent !== 'undefined') {
    (DeviceOrientationEvent as { requestPermission?: () => Promise<PermissionState> }).requestPermission = mockRequestPermission;
  }

  // Helper to dispatch the event
  const dispatchEvent = () => {
    window.dispatchEvent(
      new CustomEvent('deviceorientation', { detail: mockEvent })
    );
  };

  return {
    event: mockEvent,
    dispatchEvent,
    requestPermission: mockRequestPermission,
  };
}

/**
 * Create a mock GeolocationPositionError
 */
export function createGeolocationError(
  code: number = 1,
  message: string = 'User denied geolocation'
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
 * Reset all sensor mocks
 */
export function resetSensorMocks() {
  vi.unstubAllGlobals();
}
