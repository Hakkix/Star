import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Celestial body data structure for stars and planets
 */
export interface CelestialBodyData {
  type: 'star' | 'planet';
  name: string;
  ra: number;        // Right Ascension in hours (0-24)
  dec: number;       // Declination in degrees (-90 to 90)
  mag?: number;      // Apparent magnitude (for stars)
  con?: string;      // 3-letter constellation code (for stars)
  dist?: number;     // Distance in light-years
  hip?: number;      // Hipparcos catalog number (for stars)
}

/**
 * Device orientation angles in degrees
 */
export interface DeviceOrientationData {
  alpha: number;     // Z-axis rotation (0-360°) - compass heading
  beta: number;      // X-axis rotation (-180 to 180°) - front-to-back tilt
  gamma: number;     // Y-axis rotation (-90 to 90°) - left-to-right tilt
}

/**
 * GPS coordinates and accuracy
 */
export interface GPSData {
  latitude: number;
  longitude: number;
  accuracy: number;  // Accuracy in meters
}

/**
 * Permission states for device sensors
 */
export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * Store state interface
 */
interface StarStoreState {
  // GPS & Location
  gps: GPSData | null;
  gpsPermission: PermissionState;

  // Device Orientation
  orientation: DeviceOrientationData | null;
  orientationPermission: PermissionState;

  // Selected Celestial Body
  selectedBody: CelestialBodyData | null;

  // UI State
  isLoading: boolean;
  errorMessage: string | null;

  // Settings
  showConstellations: boolean;
  showPlanets: boolean;

  // Actions
  setGPS: (latitude: number, longitude: number, accuracy: number) => void;
  clearGPS: () => void;
  setGPSPermission: (permission: PermissionState) => void;

  setOrientation: (alpha: number, beta: number, gamma: number) => void;
  clearOrientation: () => void;
  setOrientationPermission: (permission: PermissionState) => void;

  selectCelestialBody: (body: CelestialBodyData) => void;
  clearSelection: () => void;

  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  clearError: () => void;

  toggleConstellations: () => void;
  togglePlanets: () => void;

  // Reset entire store
  reset: () => void;
}

/**
 * Initial state values
 */
const initialState = {
  gps: null,
  gpsPermission: 'prompt' as PermissionState,
  orientation: null,
  orientationPermission: 'prompt' as PermissionState,
  selectedBody: null,
  isLoading: false,
  errorMessage: null,
  showConstellations: true,
  showPlanets: true,
};

/**
 * Main Zustand store for Star AR app state management
 *
 * Manages:
 * - GPS coordinates and permissions
 * - Device orientation data and permissions
 * - Selected celestial bodies (for interaction)
 * - Loading states and errors
 * - Display settings
 */
export const useStarStore = create<StarStoreState>()(
  devtools(
    (set) => ({
      ...initialState,

      // GPS Actions
      setGPS: (latitude, longitude, accuracy) =>
        set(
          { gps: { latitude, longitude, accuracy }, errorMessage: null },
          false,
          'setGPS'
        ),

      clearGPS: () =>
        set({ gps: null }, false, 'clearGPS'),

      setGPSPermission: (permission) =>
        set({ gpsPermission: permission }, false, 'setGPSPermission'),

      // Device Orientation Actions
      setOrientation: (alpha, beta, gamma) =>
        set(
          { orientation: { alpha, beta, gamma } },
          false,
          'setOrientation'
        ),

      clearOrientation: () =>
        set({ orientation: null }, false, 'clearOrientation'),

      setOrientationPermission: (permission) =>
        set(
          { orientationPermission: permission },
          false,
          'setOrientationPermission'
        ),

      // Selection Actions
      selectCelestialBody: (body) =>
        set({ selectedBody: body }, false, 'selectCelestialBody'),

      clearSelection: () =>
        set({ selectedBody: null }, false, 'clearSelection'),

      // UI State Actions
      setLoading: (loading) =>
        set({ isLoading: loading }, false, 'setLoading'),

      setError: (message) =>
        set({ errorMessage: message }, false, 'setError'),

      clearError: () =>
        set({ errorMessage: null }, false, 'clearError'),

      // Settings Actions
      toggleConstellations: () =>
        set(
          (state) => ({ showConstellations: !state.showConstellations }),
          false,
          'toggleConstellations'
        ),

      togglePlanets: () =>
        set(
          (state) => ({ showPlanets: !state.showPlanets }),
          false,
          'togglePlanets'
        ),

      // Reset Action
      reset: () =>
        set(initialState, false, 'reset'),
    }),
    {
      name: 'star-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selector hooks for optimized re-renders
 */
export const useGPS = () => useStarStore((state) => state.gps);
export const useOrientation = () => useStarStore((state) => state.orientation);
export const useSelectedBody = () => useStarStore((state) => state.selectedBody);
export const usePermissions = () => useStarStore((state) => ({
  gps: state.gpsPermission,
  orientation: state.orientationPermission,
}));
export const useUIState = () => useStarStore((state) => ({
  isLoading: state.isLoading,
  errorMessage: state.errorMessage,
}));
export const useSettings = () => useStarStore((state) => ({
  showConstellations: state.showConstellations,
  showPlanets: state.showPlanets,
}));
