/**
 * useSatellites Hook
 *
 * Fetches satellite TLE data from CelesTrak and manages satellite state
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchCelesTrakData,
  parseCelesTrakJSON,
  calculateSatellitePosition,
  calculateSatellitePositions,
  filterByConstellation,
  CelesTrakSatellite,
  SatellitePosition,
  ParsedTLE,
} from '@/lib/tle';

/**
 * Hook configuration options
 */
export interface UseSatellitesOptions {
  group?: string; // CelesTrak group (e.g., 'active', 'iridium')
  constellation?: string; // Filter by constellation (e.g., 'STARLINK')
  autoRefresh?: boolean; // Auto-refresh positions periodically
  refreshInterval?: number; // Refresh interval in milliseconds (default 10 seconds)
  maxSatellites?: number; // Limit number of satellites (for performance)
}

/**
 * Hook state
 */
export interface UseSatellitesState {
  satellites: SatellitePosition[];
  rawData: CelesTrakSatellite[];
  loading: boolean;
  error: Error | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
  setConstellation: (name: string) => void;
  filterBySize: (minAltitude: number) => SatellitePosition[];
}

/**
 * Hook to fetch and manage satellite data from CelesTrak
 *
 * @param options - Configuration options
 * @returns Satellite state and control functions
 *
 * @example
 * ```typescript
 * const { satellites, loading, error } = useSatellites({
 *   group: 'active',
 *   constellation: 'STARLINK',
 *   autoRefresh: true,
 *   maxSatellites: 500,
 * });
 * ```
 */
export function useSatellites(options: UseSatellitesOptions = {}): UseSatellitesState {
  const {
    group = 'active',
    constellation,
    autoRefresh = true,
    refreshInterval = 10000, // 10 seconds
    maxSatellites,
  } = options;

  const [satellites, setSatellites] = useState<SatellitePosition[]>([]);
  const [rawData, setRawData] = useState<CelesTrakSatellite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentConstellation, setConstellation] = useState(constellation);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch and process satellite data
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch raw data
      let data = await fetchCelesTrakData(group);

      // Filter by constellation if specified
      if (currentConstellation) {
        data = filterByConstellation(data, currentConstellation);
      }

      // Limit satellites for performance
      if (maxSatellites && data.length > maxSatellites) {
        data = data.slice(0, maxSatellites);
      }

      setRawData(data);

      // Calculate positions
      const positions = calculateSatellitePositions(data);
      setSatellites(positions);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Failed to fetch satellites:', error);
    } finally {
      setLoading(false);
    }
  }, [group, currentConstellation, maxSatellites]);

  /**
   * Update satellite positions (recalculate without fetching new data)
   * Useful for continuous updates as time passes
   */
  const updatePositions = useCallback(() => {
    if (rawData.length === 0) return;

    try {
      const positions = calculateSatellitePositions(rawData);
      setSatellites(positions);
      setLastUpdate(new Date());
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    }
  }, [rawData]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Auto-refresh positions if enabled
   */
  useEffect(() => {
    if (!autoRefresh) return;

    // Update positions frequently (every 1 second)
    const updateInterval = setInterval(updatePositions, 1000);

    // Refetch data periodically (every refreshInterval)
    refreshTimeoutRef.current = setTimeout(() => {
      refresh();
    }, refreshInterval);

    return () => {
      clearInterval(updateInterval);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, updatePositions, refresh]);

  /**
   * Filter satellites by minimum altitude
   */
  const filterBySize = useCallback(
    (minAltitude: number): SatellitePosition[] => {
      return satellites.filter((sat) => sat.altitude >= minAltitude);
    },
    [satellites]
  );

  /**
   * Handle constellation change
   */
  const handleSetConstellation = useCallback((name: string) => {
    setConstellation(name);
  }, []);

  return {
    satellites,
    rawData,
    loading,
    error,
    lastUpdate,
    refresh,
    setConstellation: handleSetConstellation,
    filterBySize,
  };
}

/**
 * Alternative hook for manual position updates
 * Use this if you want to calculate positions for specific satellites without fetching
 *
 * @param tles - Array of parsed TLE data
 * @param autoUpdate - Whether to update positions every frame
 * @returns Calculated satellite positions
 */
export function useSatellitePositions(
  tles: ParsedTLE[],
  autoUpdate: boolean = true
): SatellitePosition[] {
  const [positions, setPositions] = useState<SatellitePosition[]>([]);

  useEffect(() => {
    const calculatePositions = () => {
      const newPositions = tles.map((tle) => {
        try {
          return calculateSatellitePosition(tle);
        } catch (error) {
          console.error(`Failed to calculate position for ${tle.name}:`, error);
          return null;
        }
      }).filter((pos): pos is SatellitePosition => pos !== null);

      setPositions(newPositions);
    };

    if (!autoUpdate) {
      calculatePositions();
      return;
    }

    // Update positions every second
    calculatePositions();
    const interval = setInterval(calculatePositions, 1000);

    return () => clearInterval(interval);
  }, [tles, autoUpdate]);

  return positions;
}
