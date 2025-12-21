/**
 * useDeviceOrientation Hook
 *
 * Provides access to device orientation sensors (gyroscope/accelerometer).
 * Handles iOS 13+ permission requirements where user gesture is needed.
 *
 * @returns Device orientation angles (alpha, beta, gamma), permission state, and control functions
 *
 * @example
 * ```tsx
 * const { alpha, beta, gamma, permission, requestPermission } = useDeviceOrientation();
 *
 * if (permission === 'prompt') {
 *   return <button onClick={requestPermission}>Enable Sensors</button>;
 * }
 * if (permission === 'denied') {
 *   return <div>Sensor access denied</div>;
 * }
 * return <div>Orientation: α={alpha}° β={beta}° γ={gamma}°</div>;
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * Type guard to check if the DeviceOrientationEvent has the iOS requestPermission method
 */
type DeviceOrientationEventConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

export interface DeviceOrientationState {
  /** Alpha: Rotation around Z-axis (0-360°, compass heading) */
  alpha: number | null;
  /** Beta: Rotation around X-axis (-180 to 180°, front-to-back tilt) */
  beta: number | null;
  /** Gamma: Rotation around Y-axis (-90 to 90°, left-to-right tilt) */
  gamma: number | null;
  /** Current permission state */
  permission: PermissionState;
  /** Function to request permission (iOS 13+ requires user gesture) */
  requestPermission: () => Promise<void>;
  /** Error message if permission request fails */
  error: string | null;
}

/**
 * Check if DeviceOrientation API is supported
 */
function isDeviceOrientationSupported(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

/**
 * Check if iOS-style permission request is required
 */
function requiresPermission(): boolean {
  return (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as DeviceOrientationEventConstructor).requestPermission === 'function'
  );
}

/**
 * Hook to access device orientation sensors
 *
 * Features:
 * - Handles iOS 13+ permission requirements
 * - Automatically starts listening when permission is granted
 * - Returns euler angles in degrees (alpha, beta, gamma)
 * - Cleans up event listeners on unmount
 * - Detects browser/device support
 *
 * iOS 13+ Note:
 * - requestPermission() MUST be called from a user gesture (button click)
 * - Calling it outside a user gesture will fail silently or throw an error
 *
 * Coordinate System:
 * - Alpha: 0-360° (compass heading, Z-axis rotation)
 * - Beta: -180 to 180° (front-to-back tilt, X-axis rotation)
 * - Gamma: -90 to 90° (left-to-right tilt, Y-axis rotation)
 */
export function useDeviceOrientation(): DeviceOrientationState {
  const [orientation, setOrientation] = useState<{
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  }>({
    alpha: null,
    beta: null,
    gamma: null,
  });

  const [permission, setPermission] = useState<PermissionState>(() => {
    if (!isDeviceOrientationSupported()) {
      return 'unsupported';
    }
    // If iOS-style permission is required, start in 'prompt' state
    // Otherwise, assume 'granted' (Android, desktop)
    return requiresPermission() ? 'prompt' : 'granted';
  });

  const [error, setError] = useState<string | null>(null);

  /**
   * Handle deviceorientation events
   */
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  }, []);

  /**
   * Request permission for device orientation (iOS 13+)
   * MUST be called from a user gesture (button click, etc.)
   */
  const requestPermission = useCallback(async () => {
    if (!isDeviceOrientationSupported()) {
      setError('Device orientation is not supported on this device');
      setPermission('unsupported');
      return;
    }

    // If permission request is not required (Android, desktop), grant immediately
    if (!requiresPermission()) {
      setPermission('granted');
      setError(null);
      return;
    }

    // iOS 13+ permission request
    try {
      const response = await (
        DeviceOrientationEvent as DeviceOrientationEventConstructor
      ).requestPermission?.();

      if (response === 'granted') {
        setPermission('granted');
        setError(null);
      } else {
        setPermission('denied');
        setError('Permission denied by user');
      }
    } catch (err) {
      setPermission('denied');
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to request device orientation permission'
      );
    }
  }, []);

  /**
   * Set up event listener when permission is granted
   */
  useEffect(() => {
    if (permission !== 'granted') {
      return;
    }

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permission, handleOrientation]);

  return {
    alpha: orientation.alpha,
    beta: orientation.beta,
    gamma: orientation.gamma,
    permission,
    requestPermission,
    error,
  };
}
