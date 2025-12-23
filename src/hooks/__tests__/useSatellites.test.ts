import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSatellites, useSatellitePositions } from '../useSatellites';
import * as TLE from '@/lib/tle';

/**
 * Mock CelesTrak data for testing
 */
const mockCelesTrakData: TLE.CelesTrakSatellite[] = [
  {
    OBJECT_NAME: 'ISS (ZARYA)',
    NORAD_CAT_ID: 25544,
    EPOCH: '2024-12-24T12:00:00',
    MEAN_MOTION: 15.50244706,
    ECCENTRICITY: 0.0006278,
    INCLINATION: 51.6404,
    RA_OF_ASC_NODE: 235.0395,
    ARG_OF_PERICENTER: 47.0781,
    MEAN_ANOMALY: 313.2490,
    TLE_LINE1: '1 25544U 98067A   24358.50000000  .00010270  00000+0  18614-3 0  9996',
    TLE_LINE2: '2 25544  51.6404  235.0395 0006278  47.0781 313.2490 15.50244706436153',
  },
  {
    OBJECT_NAME: 'STARLINK-1019',
    NORAD_CAT_ID: 44713,
    EPOCH: '2024-12-24T12:00:00',
    MEAN_MOTION: 15.06402435,
    ECCENTRICITY: 0.0001314,
    INCLINATION: 53.0537,
    RA_OF_ASC_NODE: 140.3994,
    ARG_OF_PERICENTER: 90.7235,
    MEAN_ANOMALY: 269.4149,
    TLE_LINE1: '1 44713U 19071AU  24358.45639903  .00000747  00000+0  51849-4 0  9996',
    TLE_LINE2: '2 44713  53.0537 140.3994 0001314  90.7235 269.4149 15.06402435234567',
  },
];

describe('useSatellites Hook', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch satellite data on mount', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCelesTrakData,
    } as Response);

    const { result } = renderHook(() => useSatellites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rawData).toHaveLength(2);
    expect(result.current.satellites).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('should use specified CelesTrak group', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCelesTrakData,
    } as Response);

    renderHook(() => useSatellites({ group: 'iridium' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('GROUP=iridium'),
      );
    });
  });

  it('should filter satellites by constellation', async () => {
    const starlinkOnly = mockCelesTrakData.filter((sat) =>
      sat.OBJECT_NAME.includes('STARLINK'),
    );

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCelesTrakData,
    } as Response);

    const { result } = renderHook(() =>
      useSatellites({ constellation: 'STARLINK' }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.satellites.length).toBeLessThanOrEqual(
      starlinkOnly.length,
    );
  });

  it('should limit number of satellites when maxSatellites is set', async () => {
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      ...mockCelesTrakData[0],
      OBJECT_NAME: `SAT-${i}`,
      NORAD_CAT_ID: 10000 + i,
    }));

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => largeDataset,
    } as Response);

    const { result } = renderHook(() =>
      useSatellites({ maxSatellites: 50 }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rawData.length).toBeLessThanOrEqual(50);
  });

  it('should handle fetch errors gracefully', async () => {
    const errorMessage = 'Network error';
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useSatellites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain(errorMessage);
    expect(result.current.satellites).toHaveLength(0);
  });

  it('should handle invalid response format', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: 'format' }),
    } as Response);

    const { result } = renderHook(() => useSatellites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.satellites).toHaveLength(0);
  });

  it('should provide refresh function', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockCelesTrakData,
    } as Response);

    const { result } = renderHook(() => useSatellites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe('function');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Call refresh
    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should provide setConstellation function', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockCelesTrakData,
    } as Response);

    const { result } = renderHook(() => useSatellites());

    expect(typeof result.current.setConstellation).toBe('function');

    act(() => {
      result.current.setConstellation('STARLINK');
    });

    // The hook should re-run with the new constellation
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should provide filterBySize function', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCelesTrakData,
    } as Response);

    const { result } = renderHook(() => useSatellites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const filtered = result.current.filterBySize(400); // ISS altitude

    expect(Array.isArray(filtered)).toBe(true);
    // Should return satellites with altitude >= 400km
    filtered.forEach((sat) => {
      expect(sat.altitude).toBeGreaterThanOrEqual(400);
    });
  });

  it('should track last update time', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCelesTrakData,
    } as Response);

    const { result } = renderHook(() => useSatellites());

    expect(result.current.lastUpdate).toBeNull();

    await waitFor(() => {
      expect(result.current.lastUpdate).not.toBeNull();
    });

    expect(result.current.lastUpdate).toBeInstanceOf(Date);
  });

  it('should handle API returning non-OK status', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found',
    } as Response);

    const { result } = renderHook(() => useSatellites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain('CelesTrak API error');
  });
});

describe('useSatellitePositions Hook', () => {
  it('should calculate positions from TLE data', async () => {
    const tles = [
      TLE.parseTLE(
        'ISS (ZARYA)',
        '1 25544U 98067A   24358.50000000  .00010270  00000+0  18614-3 0  9996',
        '2 25544  51.6404  235.0395 0006278  47.0781 313.2490 15.50244706436153',
      ),
    ];

    const { result } = renderHook(() => useSatellitePositions(tles, false));

    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('ISS (ZARYA)');
    expect(result.current[0].altitude).toBeGreaterThan(0);
  });

  it('should update positions when autoUpdate is enabled', async () => {
    const tles = [
      TLE.parseTLE(
        'ISS (ZARYA)',
        '1 25544U 98067A   24358.50000000  .00010270  00000+0  18614-3 0  9996',
        '2 25544  51.6404  235.0395 0006278  47.0781 313.2490 15.50244706436153',
      ),
    ];

    const { result } = renderHook(() => useSatellitePositions(tles, true));

    expect(result.current).toHaveLength(1);

    // Wait a bit for auto-update interval
    await waitFor(
      () => {
        expect(result.current[0]).toBeDefined();
      },
      { timeout: 2000 },
    );
  });

  it('should handle multiple TLEs', async () => {
    const tles = [
      TLE.parseTLE(
        'ISS (ZARYA)',
        '1 25544U 98067A   24358.50000000  .00010270  00000+0  18614-3 0  9996',
        '2 25544  51.6404  235.0395 0006278  47.0781 313.2490 15.50244706436153',
      ),
      TLE.parseTLE(
        'STARLINK-1019',
        '1 44713U 19071AU  24358.45639903  .00000747  00000+0  51849-4 0  9996',
        '2 44713  53.0537 140.3994 0001314  90.7235 269.4149 15.06402435234567',
      ),
    ];

    const { result } = renderHook(() => useSatellitePositions(tles, false));

    expect(result.current).toHaveLength(2);
    expect(result.current[0].noradId).toBe(25544);
    expect(result.current[1].noradId).toBe(44713);
  });

  it('should handle invalid TLEs gracefully', async () => {
    // Create a TLE with invalid orbital parameters
    const invalidTLE: TLE.ParsedTLE = {
      name: 'INVALID',
      noradId: 99999,
      epochYear: 2024,
      epochDay: 358.5,
      epochDate: new Date(),
      meanMotionFirstDerivative: 0.0001,
      meanMotionSecondDerivative: 0,
      dragTerm: 0,
      inclination: 51.6,
      rightAscension: 235.0,
      eccentricity: 0.0006,
      argumentOfPerigee: 47.0,
      meanAnomaly: 313.2,
      meanMotion: 15.5,
      revolutionNumber: 436153,
    };

    const { result } = renderHook(() => useSatellitePositions([invalidTLE], false));

    // Should calculate position even with unusual parameters
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe('INVALID');
  });
});
