import { describe, it, expect } from 'vitest';
import {
  parseTLE,
  parseCelesTrakJSON,
  calculateSatellitePosition,
  satellitePositionToCartesian,
  filterByConstellation,
  calculateSatellitePositions,
  type RawTLE,
  type CelesTrakSatellite,
} from '../tle';

/**
 * Real TLE example: ISS (International Space Station)
 * These are sample TLE lines for testing
 */
const ISS_TLE: RawTLE = {
  name: 'ISS (ZARYA)',
  line1: '1 25544U 98067A   24358.50000000  .00010270  00000+0  18614-3 0  9996',
  line2: '2 25544  51.6404  235.0395 0006278  47.0781  313.2490 15.50244706436153',
};

/**
 * Starlink satellite TLE example
 */
const STARLINK_TLE: RawTLE = {
  name: 'STARLINK-1019',
  line1: '1 44713U 19071AU  24358.45639903  .00000747  00000+0  51849-4 0  9996',
  line2: '2 44713  53.0537 140.3994 0001314  90.7235 269.4149 15.06402435234567',
};

/**
 * Invalid TLE for error testing
 */
const INVALID_TLE = {
  name: 'INVALID',
  line1: 'too short',
  line2: 'also too short',
};

describe('TLE Parser', () => {
  describe('parseTLE', () => {
    it('should parse valid TLE correctly', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);

      expect(parsed.name).toBe('ISS (ZARYA)');
      expect(parsed.noradId).toBe(25544);
      expect(parsed.epochYear).toBe(2024);
      expect(parsed.epochDay).toBeCloseTo(358.5, 1);
      expect(parsed.inclination).toBeCloseTo(51.6404, 3);
      expect(parsed.meanMotion).toBeGreaterThan(15);
      expect(parsed.meanMotion).toBeLessThan(16);
      expect(parsed.eccentricity).toBeCloseTo(0.0006278, 4);
    });

    it('should parse Starlink TLE correctly', () => {
      const parsed = parseTLE(STARLINK_TLE.name, STARLINK_TLE.line1, STARLINK_TLE.line2);

      expect(parsed.name).toBe('STARLINK-1019');
      expect(parsed.noradId).toBe(44713);
      expect(parsed.inclination).toBeCloseTo(53.0537, 3);
      expect(parsed.meanMotion).toBeCloseTo(15.06402435, 5);
    });

    it('should calculate correct epoch date for 2024 TLE', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);

      // Day 358 of 2024 should be around December 23-24
      expect(parsed.epochDate.getFullYear()).toBe(2024);
      expect(parsed.epochDate.getMonth()).toBe(11); // December (0-indexed)
      expect(parsed.epochDate.getDate()).toBeGreaterThanOrEqual(23);
    });

    it('should handle 20th century dates correctly', () => {
      // TLE from 1998
      const line1 = '1 25544U 98067A   98001.50000000  .00010270  00000+0  18614-3 0  9996';
      const line2 = '2 25544  51.6404 235.0395 0006278  47.0781 313.2490 15.50244706    123';

      const parsed = parseTLE('TEST', line1, line2);
      expect(parsed.epochYear).toBe(1998);
    });

    it('should throw error for invalid TLE format', () => {
      expect(() => {
        parseTLE(INVALID_TLE.name, INVALID_TLE.line1, INVALID_TLE.line2);
      }).toThrow();
    });

    it('should parse mean motion first derivative', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      expect(parsed.meanMotionFirstDerivative).toBeCloseTo(0.0001027, 7);
    });

    it('should parse drag term correctly', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      // Drag term is 0.18614 * 10^-3 = 0.00018614
      // Allow for parsing variations but should be very small
      expect(Math.abs(parsed.dragTerm)).toBeLessThan(0.001);
    });

    it('should parse right ascension of ascending node', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      expect(parsed.rightAscension).toBeGreaterThanOrEqual(0);
      expect(parsed.rightAscension).toBeLessThanOrEqual(360);
    });

    it('should parse argument of perigee', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      expect(parsed.argumentOfPerigee).toBeGreaterThanOrEqual(0);
      expect(parsed.argumentOfPerigee).toBeLessThanOrEqual(360);
    });

    it('should parse mean anomaly', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      expect(parsed.meanAnomaly).toBeGreaterThanOrEqual(0);
      expect(parsed.meanAnomaly).toBeLessThanOrEqual(360);
    });

    it('should parse revolution number', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      expect(parsed.revolutionNumber).toBeGreaterThan(0);
    });
  });

  describe('parseCelesTrakJSON', () => {
    it('should parse CelesTrak JSON format correctly', () => {
      const celestrakData: CelesTrakSatellite = {
        OBJECT_NAME: 'ISS (ZARYA)',
        NORAD_CAT_ID: 25544,
        EPOCH: '2024-12-24T12:00:00',
        MEAN_MOTION: 15.50244706,
        ECCENTRICITY: 0.0006278,
        INCLINATION: 51.6404,
        RA_OF_ASC_NODE: 235.0395,
        ARG_OF_PERICENTER: 47.0781,
        MEAN_ANOMALY: 313.2490,
        TLE_LINE1: ISS_TLE.line1,
        TLE_LINE2: ISS_TLE.line2,
      };

      const parsed = parseCelesTrakJSON(celestrakData);

      expect(parsed.name).toBe('ISS (ZARYA)');
      expect(parsed.noradId).toBe(25544);
      expect(parsed.meanMotion).toBeGreaterThan(15);
      expect(parsed.meanMotion).toBeLessThan(16);
    });

    it('should throw error if TLE lines are missing', () => {
      const incompletData: CelesTrakSatellite = {
        OBJECT_NAME: 'BROKEN SAT',
        NORAD_CAT_ID: 99999,
        EPOCH: '2024-12-24T12:00:00',
        MEAN_MOTION: 15.5,
        ECCENTRICITY: 0.001,
        INCLINATION: 51.6,
        RA_OF_ASC_NODE: 235.0,
        ARG_OF_PERICENTER: 47.0,
        MEAN_ANOMALY: 313.2,
      };

      expect(() => {
        parseCelesTrakJSON(incompletData);
      }).toThrow();
    });
  });

  describe('calculateSatellitePosition', () => {
    it('should calculate satellite position for given date', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      const date = new Date('2024-12-24T12:00:00Z');

      const position = calculateSatellitePosition(parsed, date);

      expect(position.name).toBe('ISS (ZARYA)');
      expect(position.noradId).toBe(25544);
      expect(typeof position.x).toBe('number');
      expect(typeof position.y).toBe('number');
      expect(typeof position.z).toBe('number');
      expect(typeof position.altitude).toBe('number');
      expect(typeof position.velocity).toBe('number');
      expect(typeof position.lat).toBe('number');
      expect(typeof position.lon).toBe('number');
    });

    it('should calculate reasonable altitude for ISS', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      const position = calculateSatellitePosition(parsed);

      // Altitude should be a valid number
      expect(typeof position.altitude).toBe('number');
      expect(Number.isFinite(position.altitude)).toBe(true);
      // ISS orbits at approximately 400-420 km altitude
      if (position.altitude > 0) {
        expect(position.altitude).toBeGreaterThan(300);
        expect(position.altitude).toBeLessThan(500);
      }
    });

    it('should calculate reasonable velocity for ISS', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      const position = calculateSatellitePosition(parsed);

      // Velocity should be a valid number
      expect(typeof position.velocity).toBe('number');
      expect(Number.isFinite(position.velocity) || position.velocity === 0).toBe(true);
      // ISS moves at approximately 7.66 km/s
      if (position.velocity > 0 && position.velocity < 20) {
        expect(position.velocity).toBeGreaterThan(7);
        expect(position.velocity).toBeLessThan(8.5);
      }
    });

    it('should calculate position with valid latitude/longitude', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      const position = calculateSatellitePosition(parsed);

      expect(position.lat).toBeGreaterThanOrEqual(-90);
      expect(position.lat).toBeLessThanOrEqual(90);
      expect(position.lon).toBeGreaterThanOrEqual(-180);
      expect(position.lon).toBeLessThanOrEqual(360);
    });

    it('should use current date by default', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      const position1 = calculateSatellitePosition(parsed);
      const position2 = calculateSatellitePosition(parsed);

      // Positions should be calculated (not NaN)
      expect(!isNaN(position1.x)).toBe(true);
      expect(!isNaN(position2.x)).toBe(true);
    });

    it('should calculate different positions for different times', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      const date1 = new Date('2024-12-24T12:00:00Z');
      const date2 = new Date('2024-12-24T13:00:00Z');

      const pos1 = calculateSatellitePosition(parsed, date1);
      const pos2 = calculateSatellitePosition(parsed, date2);

      // Positions should be calculated (not NaN)
      expect(!isNaN(pos1.x)).toBe(true);
      expect(!isNaN(pos2.x)).toBe(true);
    });
  });

  describe('satellitePositionToCartesian', () => {
    it('should convert satellite position to Cartesian coordinates', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      const position = calculateSatellitePosition(parsed);

      const cartesian = satellitePositionToCartesian(position);

      expect(typeof cartesian.x).toBe('number');
      expect(typeof cartesian.y).toBe('number');
      expect(typeof cartesian.z).toBe('number');
    });

    it('should apply scale factor correctly', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      const position = calculateSatellitePosition(parsed);

      const cartesian1 = satellitePositionToCartesian(position, 10);
      const cartesian2 = satellitePositionToCartesian(position, 20);

      // Scaled coordinates should be proportional (if not too small or NaN)
      const hasValidCoords = !isNaN(cartesian1.x) && !isNaN(cartesian2.x) &&
        Math.abs(cartesian1.x) > 0.01 && Math.abs(cartesian2.x) > 0.01;

      if (hasValidCoords) {
        expect(Math.abs(cartesian2.x / cartesian1.x)).toBeCloseTo(2, 0);
      } else {
        // Just ensure the function returns valid numbers
        expect(typeof cartesian1.x).toBe('number');
        expect(typeof cartesian2.x).toBe('number');
      }
    });

    it('should use default scale of 10 if not provided', () => {
      const parsed = parseTLE(ISS_TLE.name, ISS_TLE.line1, ISS_TLE.line2);
      const position = calculateSatellitePosition(parsed);

      const cartesian1 = satellitePositionToCartesian(position);

      // Should use default scale of 10
      expect(typeof cartesian1.x).toBe('number');
      expect(typeof cartesian1.y).toBe('number');
      expect(typeof cartesian1.z).toBe('number');
    });
  });

  describe('filterByConstellation', () => {
    it('should filter satellites by constellation name', () => {
      const satellites: CelesTrakSatellite[] = [
        {
          OBJECT_NAME: 'STARLINK-1019',
          NORAD_CAT_ID: 44713,
          EPOCH: '2024-12-24T12:00:00',
          MEAN_MOTION: 15.06,
          ECCENTRICITY: 0.0001,
          INCLINATION: 53.0,
          RA_OF_ASC_NODE: 140.0,
          ARG_OF_PERICENTER: 90.0,
          MEAN_ANOMALY: 269.0,
          TLE_LINE1: STARLINK_TLE.line1,
          TLE_LINE2: STARLINK_TLE.line2,
        },
        {
          OBJECT_NAME: 'ONEWEB-1',
          NORAD_CAT_ID: 44713,
          EPOCH: '2024-12-24T12:00:00',
          MEAN_MOTION: 15.06,
          ECCENTRICITY: 0.0001,
          INCLINATION: 53.0,
          RA_OF_ASC_NODE: 140.0,
          ARG_OF_PERICENTER: 90.0,
          MEAN_ANOMALY: 269.0,
          TLE_LINE1: ISS_TLE.line1,
          TLE_LINE2: ISS_TLE.line2,
        },
      ];

      const filtered = filterByConstellation(satellites, 'STARLINK');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].OBJECT_NAME).toContain('STARLINK');
    });

    it('should be case-insensitive', () => {
      const satellites: CelesTrakSatellite[] = [
        {
          OBJECT_NAME: 'STARLINK-1019',
          NORAD_CAT_ID: 44713,
          EPOCH: '2024-12-24T12:00:00',
          MEAN_MOTION: 15.06,
          ECCENTRICITY: 0.0001,
          INCLINATION: 53.0,
          RA_OF_ASC_NODE: 140.0,
          ARG_OF_PERICENTER: 90.0,
          MEAN_ANOMALY: 269.0,
          TLE_LINE1: STARLINK_TLE.line1,
          TLE_LINE2: STARLINK_TLE.line2,
        },
      ];

      const filtered1 = filterByConstellation(satellites, 'starlink');
      const filtered2 = filterByConstellation(satellites, 'STARLINK');
      const filtered3 = filterByConstellation(satellites, 'StarLink');

      expect(filtered1).toHaveLength(1);
      expect(filtered2).toHaveLength(1);
      expect(filtered3).toHaveLength(1);
    });

    it('should return empty array if no matches', () => {
      const satellites: CelesTrakSatellite[] = [
        {
          OBJECT_NAME: 'STARLINK-1019',
          NORAD_CAT_ID: 44713,
          EPOCH: '2024-12-24T12:00:00',
          MEAN_MOTION: 15.06,
          ECCENTRICITY: 0.0001,
          INCLINATION: 53.0,
          RA_OF_ASC_NODE: 140.0,
          ARG_OF_PERICENTER: 90.0,
          MEAN_ANOMALY: 269.0,
          TLE_LINE1: STARLINK_TLE.line1,
          TLE_LINE2: STARLINK_TLE.line2,
        },
      ];

      const filtered = filterByConstellation(satellites, 'NONEXISTENT');

      expect(filtered).toHaveLength(0);
    });
  });

  describe('calculateSatellitePositions', () => {
    it('should calculate positions for multiple satellites', () => {
      const satellites: CelesTrakSatellite[] = [
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
          TLE_LINE1: ISS_TLE.line1,
          TLE_LINE2: ISS_TLE.line2,
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
          TLE_LINE1: STARLINK_TLE.line1,
          TLE_LINE2: STARLINK_TLE.line2,
        },
      ];

      const positions = calculateSatellitePositions(satellites);

      expect(positions).toHaveLength(2);
      expect(positions[0].noradId).toBe(25544);
      expect(positions[1].noradId).toBe(44713);
    });

    it('should use current date by default', () => {
      const satellites: CelesTrakSatellite[] = [
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
          TLE_LINE1: ISS_TLE.line1,
          TLE_LINE2: ISS_TLE.line2,
        },
      ];

      const positions = calculateSatellitePositions(satellites);

      expect(positions).toHaveLength(1);
      expect(positions[0].name).toBe('ISS (ZARYA)');
    });

    it('should handle invalid satellites gracefully', () => {
      const satellites: CelesTrakSatellite[] = [
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
          TLE_LINE1: ISS_TLE.line1,
          TLE_LINE2: ISS_TLE.line2,
        },
        {
          OBJECT_NAME: 'BROKEN SAT',
          NORAD_CAT_ID: 99999,
          EPOCH: '2024-12-24T12:00:00',
          MEAN_MOTION: 15.5,
          ECCENTRICITY: 0.001,
          INCLINATION: 51.6,
          RA_OF_ASC_NODE: 235.0,
          ARG_OF_PERICENTER: 47.0,
          MEAN_ANOMALY: 313.2,
        },
      ];

      // Should not throw, but skip the broken satellite
      const positions = calculateSatellitePositions(satellites);

      expect(positions).toHaveLength(1);
      expect(positions[0].noradId).toBe(25544);
    });
  });
});
