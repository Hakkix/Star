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
 * Onboarding steps
 */
export type OnboardingStep = 'welcome' | 'location' | 'orientation' | 'ready' | 'completed';

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

  // Onboarding
  onboardingStep: OnboardingStep;
  hasCompletedOnboarding: boolean;

  // Selected Celestial Body
  selectedBody: CelestialBodyData | null;

  // Favorites
  favorites: CelestialBodyData[];

  // UI State
  isLoading: boolean;
  errorMessage: string | null;
  favoritesPanelOpen: boolean;

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

  setOnboardingStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  selectCelestialBody: (body: CelestialBodyData) => void;
  clearSelection: () => void;

  addFavorite: (body: CelestialBodyData) => void;
  removeFavorite: (body: CelestialBodyData) => void;
  toggleFavorite: (body: CelestialBodyData) => void;
  isFavorite: (body: CelestialBodyData) => boolean;
  clearFavorites: () => void;
  loadFavorites: () => void;
  exportFavorites: () => string;
  importFavorites: (data: string) => boolean;

  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  clearError: () => void;

  toggleConstellations: () => void;
  togglePlanets: () => void;

  toggleFavoritesPanel: () => void;
  setFavoritesPanelOpen: (open: boolean) => void;

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
  onboardingStep: 'welcome' as OnboardingStep,
  hasCompletedOnboarding: false,
  selectedBody: null,
  favorites: [] as CelestialBodyData[],
  isLoading: false,
  errorMessage: null,
  favoritesPanelOpen: false,
  showConstellations: true,
  showPlanets: true,
};

/**
 * Helper function to get favorites from localStorage
 */
const getFavoritesFromStorage = (): CelestialBodyData[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('star-favorites');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Helper function to save favorites to localStorage
 */
const saveFavoritesToStorage = (favorites: CelestialBodyData[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('star-favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
};

/**
 * Helper function to check if two celestial bodies are the same
 */
const isSameBody = (a: CelestialBodyData, b: CelestialBodyData): boolean => {
  return a.name === b.name && a.type === b.type;
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

      // Onboarding Actions
      setOnboardingStep: (step) =>
        set({ onboardingStep: step }, false, 'setOnboardingStep'),

      completeOnboarding: () =>
        set(
          { hasCompletedOnboarding: true, onboardingStep: 'completed' },
          false,
          'completeOnboarding'
        ),

      resetOnboarding: () =>
        set(
          { hasCompletedOnboarding: false, onboardingStep: 'welcome' },
          false,
          'resetOnboarding'
        ),

      // Selection Actions
      selectCelestialBody: (body) =>
        set({ selectedBody: body }, false, 'selectCelestialBody'),

      clearSelection: () =>
        set({ selectedBody: null }, false, 'clearSelection'),

      // Favorites Actions
      addFavorite: (body) =>
        set(
          (state) => {
            const newFavorites = [...state.favorites, body];
            saveFavoritesToStorage(newFavorites);
            return { favorites: newFavorites };
          },
          false,
          'addFavorite'
        ),

      removeFavorite: (body) =>
        set(
          (state) => {
            const newFavorites = state.favorites.filter(
              (fav) => !isSameBody(fav, body)
            );
            saveFavoritesToStorage(newFavorites);
            return { favorites: newFavorites };
          },
          false,
          'removeFavorite'
        ),

      toggleFavorite: (body) =>
        set(
          (state) => {
            const isFav = state.favorites.some((fav) => isSameBody(fav, body));
            const newFavorites = isFav
              ? state.favorites.filter((fav) => !isSameBody(fav, body))
              : [...state.favorites, body];
            saveFavoritesToStorage(newFavorites);
            return { favorites: newFavorites };
          },
          false,
          'toggleFavorite'
        ),

      isFavorite: (body) => {
        const state = useStarStore.getState();
        return state.favorites.some((fav) => isSameBody(fav, body));
      },

      clearFavorites: () =>
        set(
          () => {
            saveFavoritesToStorage([]);
            return { favorites: [] };
          },
          false,
          'clearFavorites'
        ),

      loadFavorites: () =>
        set(
          () => {
            const favorites = getFavoritesFromStorage();
            return { favorites };
          },
          false,
          'loadFavorites'
        ),

      exportFavorites: () => {
        const state = useStarStore.getState();
        return JSON.stringify(state.favorites, null, 2);
      },

      importFavorites: (data) => {
        try {
          const imported = JSON.parse(data);
          if (Array.isArray(imported)) {
            set(
              () => {
                saveFavoritesToStorage(imported);
                return { favorites: imported };
              },
              false,
              'importFavorites'
            );
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

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

      toggleFavoritesPanel: () =>
        set(
          (state) => ({ favoritesPanelOpen: !state.favoritesPanelOpen }),
          false,
          'toggleFavoritesPanel'
        ),

      setFavoritesPanelOpen: (open) =>
        set({ favoritesPanelOpen: open }, false, 'setFavoritesPanelOpen'),

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
export const useFavorites = () => useStarStore((state) => state.favorites);
export const usePermissions = () => useStarStore((state) => ({
  gps: state.gpsPermission,
  orientation: state.orientationPermission,
}));
export const useOnboarding = () => useStarStore((state) => ({
  step: state.onboardingStep,
  hasCompleted: state.hasCompletedOnboarding,
}));
export const useUIState = () => useStarStore((state) => ({
  isLoading: state.isLoading,
  errorMessage: state.errorMessage,
}));
export const useSettings = () => useStarStore((state) => ({
  showConstellations: state.showConstellations,
  showPlanets: state.showPlanets,
}));
