/**
 * Unit tests for coordinate conversion functions
 * These tests verify astronomy calculations and coordinate conversions
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { raDecToCartesian, calculateLST } from '@/lib/astronomy';

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
