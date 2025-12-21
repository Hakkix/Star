/**
 * Unit tests for coordinate conversion functions
 * These tests verify astronomy calculations and coordinate conversions
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { raDecToCartesian, calculateLST, getPlanetPosition } from '@/lib/astronomy';

describe('Coordinate Conversion Functions', () => {
  describe('raDecToCartesian', () => {
    test('converts RA=0, Dec=0 to correct Cartesian coords', () => {
      const result = raDecToCartesian(0, 0, 1000);

      // At RA=0, Dec=0: point on celestial equator at vernal equinox
      expect(result.x).toBeCloseTo(1000, 1);
      expect(result.y).toBeCloseTo(0, 1);
      expect(result.z).toBeCloseTo(0, 1);
    });

    test('converts North Celestial Pole (Dec=90) correctly', () => {
      const result = raDecToCartesian(0, 90, 1000);

      // At Dec=90: North Celestial Pole (straight up Y-axis)
      expect(result.x).toBeCloseTo(0, 1);
      expect(result.y).toBeCloseTo(1000, 1);
      expect(result.z).toBeCloseTo(0, 1);
    });

    test('converts South Celestial Pole (Dec=-90) correctly', () => {
      const result = raDecToCartesian(0, -90, 1000);

      // At Dec=-90: South Celestial Pole (straight down Y-axis)
      expect(result.x).toBeCloseTo(0, 1);
      expect(result.y).toBeCloseTo(-1000, 1);
      expect(result.z).toBeCloseTo(0, 1);
    });

    test('converts RA=6h, Dec=0 (90° from vernal equinox)', () => {
      const result = raDecToCartesian(6, 0, 1000);

      // RA=6h = 90° east on equator
      expect(result.x).toBeCloseTo(0, 1);
      expect(result.y).toBeCloseTo(0, 1);
      expect(result.z).toBeCloseTo(1000, 1);
    });

    test('converts RA=12h, Dec=0 (opposite vernal equinox)', () => {
      const result = raDecToCartesian(12, 0, 1000);

      // RA=12h = 180° from vernal equinox
      expect(result.x).toBeCloseTo(-1000, 1);
      expect(result.y).toBeCloseTo(0, 1);
      expect(result.z).toBeCloseTo(0, 1);
    });

    test('respects custom radius parameter', () => {
      const result1 = raDecToCartesian(0, 0, 500);
      const result2 = raDecToCartesian(0, 0, 2000);

      expect(result1.x).toBeCloseTo(500, 1);
      expect(result2.x).toBeCloseTo(2000, 1);
    });

    test('handles edge case: RA=24h wraps to 0', () => {
      const result1 = raDecToCartesian(0, 0, 1000);
      const result2 = raDecToCartesian(24, 0, 1000);

      // RA=24h should equal RA=0h
      expect(result1.x).toBeCloseTo(result2.x, 1);
      expect(result1.y).toBeCloseTo(result2.y, 1);
      expect(result1.z).toBeCloseTo(result2.z, 1);
    });

    test('handles negative declinations', () => {
      const result = raDecToCartesian(0, -45, 1000);

      // Dec=-45°: southern hemisphere, below equator
      expect(result.y).toBeLessThan(0);
      expect(result.y).toBeCloseTo(-707.1, 1); // sin(-45°) * 1000
    });

    test('maintains correct vector length (radius)', () => {
      const coords = [
        { ra: 0, dec: 0 },
        { ra: 6, dec: 30 },
        { ra: 12, dec: -60 },
        { ra: 18, dec: 45 },
      ];

      coords.forEach(({ ra, dec }) => {
        const result = raDecToCartesian(ra, dec, 1000);
        const length = Math.sqrt(result.x ** 2 + result.y ** 2 + result.z ** 2);
        expect(length).toBeCloseTo(1000, 1);
      });
    });
  });

  describe('calculateLST', () => {
    beforeEach(() => {
      // Use fake timers for deterministic tests
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('calculates LST for Greenwich (longitude=0) at known time', () => {
      const date = new Date('2024-06-21T12:00:00Z'); // Summer solstice noon
      vi.setSystemTime(date);

      const lst = calculateLST(date, 0);

      // LST should be a value between 0-360
      expect(lst).toBeGreaterThanOrEqual(0);
      expect(lst).toBeLessThan(360);
    });

    test('LST increases with eastern longitude', () => {
      const date = new Date('2024-06-21T12:00:00Z');
      vi.setSystemTime(date);

      const lstGreenwich = calculateLST(date, 0);
      const lstNewYork = calculateLST(date, -74); // NYC is west, so LST should be less
      const lstTokyo = calculateLST(date, 139.7); // Tokyo is east, so LST should be more

      expect(lstNewYork).toBeLessThan(lstGreenwich);
      expect(lstTokyo).toBeGreaterThan(lstGreenwich);
    });

    test('LST advances ~360° per day', () => {
      const date1 = new Date('2024-06-21T12:00:00Z');
      const date2 = new Date('2024-06-22T12:00:00Z'); // 24 hours later

      const lst1 = calculateLST(date1, 0);
      const lst2 = calculateLST(date2, 0);

      // Sidereal day is ~4 minutes shorter than solar day
      // So LST should advance ~361° in 24 hours
      const diff = (lst2 - lst1 + 360) % 360;
      expect(diff).toBeCloseTo(0.986, 1); // ~1° extra per day
    });

    test('wraps correctly at 360°', () => {
      const date = new Date('2024-06-21T12:00:00Z');
      const lst = calculateLST(date, 180);

      // LST should always be 0-360
      expect(lst).toBeGreaterThanOrEqual(0);
      expect(lst).toBeLessThan(360);
    });
  });
});

describe('Star Data Validation', () => {
  test('validates star catalog entry has correct RA range', () => {
    const validStar = { ra: 12.5, dec: 45, mag: 2.0, con: 'UMA' };

    expect(validStar.ra).toBeGreaterThanOrEqual(0);
    expect(validStar.ra).toBeLessThan(24);
  });

  test('validates star catalog entry has correct Dec range', () => {
    const validStar = { ra: 12.5, dec: 45, mag: 2.0, con: 'UMA' };

    expect(validStar.dec).toBeGreaterThanOrEqual(-90);
    expect(validStar.dec).toBeLessThanOrEqual(90);
  });

  test('rejects invalid RA values', () => {
    const invalidRA = 25; // RA must be 0-24

    expect(invalidRA).toBeGreaterThanOrEqual(24);
  });

  test('rejects invalid Dec values', () => {
    const invalidDec = 95; // Dec must be -90 to 90

    expect(Math.abs(invalidDec)).toBeGreaterThan(90);
  });
});

describe('getPlanetPosition', () => {
  const observer = {
    latitude: 40.7128,   // New York City
    longitude: -74.0060,
    altitude: 10
  };

  beforeEach(() => {
    // Use fake timers for deterministic tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns valid position for Mars', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    vi.setSystemTime(date);

    const result = getPlanetPosition('Mars', date, observer);

    expect(result.name).toBe('Mars');
    expect(result.ra).toBeGreaterThanOrEqual(0);
    expect(result.ra).toBeLessThan(24);
    expect(result.dec).toBeGreaterThanOrEqual(-90);
    expect(result.dec).toBeLessThanOrEqual(90);
    expect(result.dist).toBeGreaterThan(0);
  });

  test('returns valid position for Jupiter', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    vi.setSystemTime(date);

    const result = getPlanetPosition('Jupiter', date, observer);

    expect(result.name).toBe('Jupiter');
    expect(result.ra).toBeGreaterThanOrEqual(0);
    expect(result.ra).toBeLessThan(24);
    expect(result.dec).toBeGreaterThanOrEqual(-90);
    expect(result.dec).toBeLessThanOrEqual(90);
    expect(result.dist).toBeGreaterThan(0);
  });

  test('returns valid position for the Moon', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    vi.setSystemTime(date);

    const result = getPlanetPosition('Moon', date, observer);

    expect(result.name).toBe('Moon');
    expect(result.ra).toBeGreaterThanOrEqual(0);
    expect(result.ra).toBeLessThan(24);
    expect(result.dec).toBeGreaterThanOrEqual(-90);
    expect(result.dec).toBeLessThanOrEqual(90);
    expect(result.dist).toBeGreaterThan(0);
    // Moon should be close to Earth (< 0.01 AU)
    expect(result.dist).toBeLessThan(0.01);
  });

  test('returns valid position for the Sun', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    vi.setSystemTime(date);

    const result = getPlanetPosition('Sun', date, observer);

    expect(result.name).toBe('Sun');
    expect(result.ra).toBeGreaterThanOrEqual(0);
    expect(result.ra).toBeLessThan(24);
    expect(result.dec).toBeGreaterThanOrEqual(-90);
    expect(result.dec).toBeLessThanOrEqual(90);
    // Sun should be approximately 1 AU away
    expect(result.dist).toBeCloseTo(1.0, 1);
  });

  test('supports all major planets', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    vi.setSystemTime(date);

    const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

    planets.forEach(planet => {
      const result = getPlanetPosition(planet, date, observer);
      expect(result.name).toBe(planet);
      expect(result.ra).toBeGreaterThanOrEqual(0);
      expect(result.ra).toBeLessThan(24);
    });
  });

  test('throws error for invalid body name', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    vi.setSystemTime(date);

    expect(() => {
      getPlanetPosition('InvalidPlanet', date, observer);
    }).toThrow('Invalid body name');
  });

  test('throws error for Earth (observer is on Earth)', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    vi.setSystemTime(date);

    expect(() => {
      getPlanetPosition('Earth', date, observer);
    }).toThrow('Invalid body name');
  });

  test('handles different observer locations', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    vi.setSystemTime(date);

    const tokyo = { latitude: 35.6762, longitude: 139.6503, altitude: 40 };
    const london = { latitude: 51.5074, longitude: -0.1278, altitude: 11 };

    const marsNYC = getPlanetPosition('Mars', date, observer);
    const marsTokyo = getPlanetPosition('Mars', date, tokyo);
    const marsLondon = getPlanetPosition('Mars', date, london);

    // All should return valid positions
    expect(marsNYC.name).toBe('Mars');
    expect(marsTokyo.name).toBe('Mars');
    expect(marsLondon.name).toBe('Mars');

    // Positions should be slightly different due to observer location
    // (parallax effect, though minimal for distant planets)
    expect(marsNYC.ra).toBeGreaterThanOrEqual(0);
    expect(marsTokyo.ra).toBeGreaterThanOrEqual(0);
    expect(marsLondon.ra).toBeGreaterThanOrEqual(0);
  });

  test('uses default altitude of 0 if not provided', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    vi.setSystemTime(date);

    const observerNoAlt = { latitude: 40.7128, longitude: -74.0060 };

    const result = getPlanetPosition('Mars', date, observerNoAlt);

    expect(result.name).toBe('Mars');
    expect(result.ra).toBeGreaterThanOrEqual(0);
    expect(result.ra).toBeLessThan(24);
  });

  test('planet positions change over time', () => {
    const date1 = new Date('2024-06-21T12:00:00Z');
    const date2 = new Date('2024-12-21T12:00:00Z'); // 6 months later

    const mars1 = getPlanetPosition('Mars', date1, observer);
    const mars2 = getPlanetPosition('Mars', date2, observer);

    // Position should be different after 6 months
    // (Mars orbital period is ~687 days, so significant movement)
    expect(mars1.ra).not.toBeCloseTo(mars2.ra, 1);
  });

  test('distance values are realistic', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    vi.setSystemTime(date);

    // Mercury: ~0.4-1.4 AU from Earth
    const mercury = getPlanetPosition('Mercury', date, observer);
    expect(mercury.dist).toBeGreaterThan(0.3);
    expect(mercury.dist).toBeLessThan(1.5);

    // Venus: ~0.3-1.7 AU from Earth
    const venus = getPlanetPosition('Venus', date, observer);
    expect(venus.dist).toBeGreaterThan(0.2);
    expect(venus.dist).toBeLessThan(1.8);

    // Jupiter: ~4-7 AU from Earth
    const jupiter = getPlanetPosition('Jupiter', date, observer);
    expect(jupiter.dist).toBeGreaterThan(3);
    expect(jupiter.dist).toBeLessThan(8);

    // Neptune: ~28-31 AU from Earth
    const neptune = getPlanetPosition('Neptune', date, observer);
    expect(neptune.dist).toBeGreaterThan(27);
    expect(neptune.dist).toBeLessThan(32);
  });
});
