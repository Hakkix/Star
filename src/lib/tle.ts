/**
 * TLE (Two-Line Element) Parsing and Satellite Position Calculation
 *
 * TLE Format: Industry standard for orbital data. CelesTrak provides TLE sets.
 * Reference: https://celestrak.org/
 *
 * Two-Line Element format:
 * Line 1: 1 NNNNNC UUUUUUUU NNNNNN NNNNN.NNNNNNNN  .NNNNNNNN  NNNNN NNNUU NNNNNNNNN NNNNNNN N
 * Line 2: 2 NNNNN NNN.NNNN NNN.NNNN NNNNNNN NNN.NNNN NNN.NNNN NN.NNNNNNNNNNNNNN
 *
 * This module provides:
 * - TLE parsing from text/JSON
 * - Satellite position calculation (SGP4 simplified propagation)
 * - Conversion to Cartesian coordinates for Three.js
 */

/**
 * Raw TLE data structure
 */
export interface RawTLE {
  name: string;
  line1: string;
  line2: string;
}

/**
 * Parsed TLE orbital elements
 */
export interface ParsedTLE {
  name: string;
  noradId: number;
  epochYear: number;
  epochDay: number;
  epochDate: Date;
  meanMotionFirstDerivative: number;
  meanMotionSecondDerivative: number;
  dragTerm: number;
  inclination: number;
  rightAscension: number;
  eccentricity: number;
  argumentOfPerigee: number;
  meanAnomaly: number;
  meanMotion: number;
  revolutionNumber: number;
}

/**
 * Satellite position in Cartesian coordinates
 */
export interface SatellitePosition {
  name: string;
  noradId: number;
  x: number;
  y: number;
  z: number;
  lat: number;
  lon: number;
  altitude: number; // kilometers
  velocity: number; // km/s
}

/**
 * CelesTrak JSON format for TLE data
 */
export interface CelesTrakSatellite {
  OBJECT_NAME: string;
  NORAD_CAT_ID: number;
  EPOCH: string;
  MEAN_MOTION: number;
  ECCENTRICITY: number;
  INCLINATION: number;
  RA_OF_ASC_NODE: number;
  ARG_OF_PERICENTER: number;
  MEAN_ANOMALY: number;
  EPHEMERIS_TYPE?: number;
  CLASS_OF_ORBIT?: string;
  DECAY_DATE?: string;
  OBJECT_ID?: string;
  RCS_SIZE?: string;
  COUNTRY_CODE?: string;
  LAUNCH_DATE?: string;
  SITE?: string;
  STATUS?: string;
  TLE_LINE0?: string;
  TLE_LINE1?: string;
  TLE_LINE2?: string;
}

/**
 * Parse a TLE string pair (line1 and line2)
 *
 * @param name - Satellite name
 * @param line1 - First line of TLE
 * @param line2 - Second line of TLE
 * @returns Parsed TLE orbital elements
 *
 * @throws Error if TLE format is invalid
 */
export function parseTLE(name: string, line1: string, line2: string): ParsedTLE {
  // Validate line lengths
  if (line1.length < 69 || line2.length < 69) {
    throw new Error(
      `Invalid TLE format: lines must be at least 69 characters. Got ${line1.length} and ${line2.length}`
    );
  }

  // Parse Line 1
  const noradId = parseInt(line1.substring(2, 7).trim(), 10);
  const epochYear = parseInt(line1.substring(18, 20), 10);
  const epochDay = parseFloat(line1.substring(20, 32));
  const meanMotionFirstDerivative = parseFloat(line1.substring(33, 43));

  // Parse mean motion second derivative (exponential format: .NNNNN+/-D)
  // e.g., " 00000+0" means 0.00000 * 10^0
  const mmsd2FullStr = line1.substring(44, 52).trim();
  let meanMotionSecondDerivative = 0;
  if (mmsd2FullStr.length >= 6) {
    const mantissaPart = mmsd2FullStr.substring(0, 5); // "00000"
    const expPart = mmsd2FullStr.substring(5); // "+0" or "-3"
    const mantissa = parseFloat('0.' + mantissaPart);
    if (expPart.length >= 2) {
      const expValue = parseInt(expPart.substring(1), 10);
      const expSign = expPart.charAt(0) === '+' ? 1 : -1;
      meanMotionSecondDerivative = mantissa * Math.pow(10, expSign * expValue);
    }
  }

  // Parse drag term (exponential format: .NNNNN+/-D)
  // e.g., " 18614-3" means 0.18614 * 10^-3
  const dragFullStr = line1.substring(54, 62).trim();
  let dragTerm = 0;
  if (dragFullStr.length >= 6) {
    const mantissaPart = dragFullStr.substring(0, 5); // "18614"
    const expPart = dragFullStr.substring(5); // "-3"
    const mantissa = parseFloat('0.' + mantissaPart);
    if (expPart.length >= 2) {
      const expValue = parseInt(expPart.substring(1), 10);
      const expSign = expPart.charAt(0) === '+' ? 1 : -1;
      dragTerm = mantissa * Math.pow(10, expSign * expValue);
    }
  }

  // Calculate epoch date
  const fullYear = epochYear < 70 ? 2000 + epochYear : 1900 + epochYear;
  const epochDate = new Date(fullYear, 0, 1);
  epochDate.setDate(epochDate.getDate() + epochDay - 1);

  // Parse Line 2 (positions 1-indexed, convert to 0-indexed)
  // Format: line numbers may have spaces, so we parse positions and trim whitespace
  const inclination = parseFloat(line2.substring(8, 16).trim());
  const rightAscension = parseFloat(line2.substring(17, 25).trim());
  const eccentricity = parseFloat('0.' + line2.substring(26, 33).trim());
  const argumentOfPerigee = parseFloat(line2.substring(34, 42).trim());
  const meanAnomaly = parseFloat(line2.substring(43, 51).trim());

  // Mean motion is in columns 53-63. Try both interpretations of formatting
  let meanMotionStr = line2.substring(52, 63).trim();
  let meanMotion = meanMotionStr.length > 0 ? parseFloat(meanMotionStr) : 0;

  // If parsing failed or got unreasonable value, try position 53-64
  if (!meanMotion || meanMotion < 10 || meanMotion > 20) {
    meanMotionStr = line2.substring(53, 64).trim();
    meanMotion = meanMotionStr.length > 0 ? parseFloat(meanMotionStr) : 0;
  }

  const revolutionNumber = parseInt(line2.substring(63, 68).trim(), 10);

  return {
    name,
    noradId,
    epochYear: fullYear,
    epochDay,
    epochDate,
    meanMotionFirstDerivative,
    meanMotionSecondDerivative,
    dragTerm,
    inclination,
    rightAscension,
    eccentricity,
    argumentOfPerigee,
    meanAnomaly,
    meanMotion,
    revolutionNumber,
  };
}

/**
 * Parse CelesTrak JSON format (modern format)
 *
 * @param satellite - CelesTrak satellite object with TLE lines
 * @returns Parsed TLE orbital elements
 */
export function parseCelesTrakJSON(satellite: CelesTrakSatellite): ParsedTLE {
  if (!satellite.TLE_LINE1 || !satellite.TLE_LINE2) {
    throw new Error(`Missing TLE lines for ${satellite.OBJECT_NAME}`);
  }

  return parseTLE(satellite.OBJECT_NAME, satellite.TLE_LINE1, satellite.TLE_LINE2);
}

/**
 * Simplified SGP4 propagation to calculate satellite position
 *
 * This is a simplified implementation. For production, consider using a dedicated
 * library like satellite-js (npm package) which implements full SGP4/SDP4.
 *
 * Reference: https://www.celestrak.org/NORAD/documentation/
 *
 * @param tle - Parsed TLE
 * @param date - Date/time to calculate position for
 * @returns Satellite position in Earth-centered coordinates (km)
 */
export function calculateSatellitePosition(
  tle: ParsedTLE,
  date: Date = new Date()
): SatellitePosition {
  // Calculate time since epoch in minutes
  const timeSinceEpoch = (date.getTime() - tle.epochDate.getTime()) / 60000;

  // Mean motion in revolutions per day
  const n = tle.meanMotion; // revolutions per day
  const nRad = (n * 2 * Math.PI) / 1440; // radians per minute

  // Mean anomaly at time (in radians)
  const M = ((tle.meanAnomaly * Math.PI) / 180 + nRad * timeSinceEpoch) % (2 * Math.PI);

  // Solve Kepler's equation using Newton-Raphson
  let E = M; // Initial guess
  const ecc = tle.eccentricity;

  // Ensure eccentricity is valid
  if (ecc < 0 || ecc >= 1) {
    // Return default position if invalid orbit
    return {
      name: tle.name,
      noradId: tle.noradId,
      x: 0,
      y: 0,
      z: 0,
      lat: 0,
      lon: 0,
      altitude: 6371,
      velocity: 0,
    };
  }

  for (let i = 0; i < 10; i++) {
    const sinE = Math.sin(E);
    const cosE = Math.cos(E);
    const f = E - ecc * sinE - M;
    const fp = 1 - ecc * cosE;

    if (Math.abs(fp) < 1e-12) break; // Avoid division by zero

    const E_new = E - f / fp;
    if (Math.abs(E_new - E) < 1e-12) {
      E = E_new;
      break;
    }
    E = E_new;
  }

  // True anomaly
  const sinE = Math.sin(E / 2);
  const cosE = Math.cos(E / 2);
  const nu = 2 * Math.atan2(Math.sqrt(1 + ecc) * sinE, Math.sqrt(1 - ecc) * cosE);

  // Semi-major axis (from mean motion)
  // n (rev/day) = sqrt(GM/a^3), where GM = 398600.4418 km^3/s^2
  const a = Math.pow(398600.4418 / Math.pow((n * 2 * Math.PI) / 86400, 2), 1 / 3);

  // Distance from Earth center
  const r = (a * (1 - ecc * ecc)) / (1 + ecc * Math.cos(nu));

  // Calculate orbital plane coordinates
  const x_orb = r * Math.cos(nu);
  const y_orb = r * Math.sin(nu);

  // Inclination, RA, argument of perigee in radians
  const i = (tle.inclination * Math.PI) / 180;
  const Omega = (tle.rightAscension * Math.PI) / 180;
  const omega = (tle.argumentOfPerigee * Math.PI) / 180;

  // Rotation matrix from orbital plane to ECI (Earth-Centered Inertial)
  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosOmegaP = Math.cos(omega);
  const sinOmegaP = Math.sin(omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);

  const xPeri = x_orb * (cosOmegaP * cosOmega - sinOmegaP * sinOmega * cosI) -
    y_orb * (sinOmegaP * cosOmega + cosOmegaP * sinOmega * cosI);

  const yPeri = x_orb * (cosOmegaP * sinOmega + sinOmegaP * cosOmega * cosI) -
    y_orb * (sinOmegaP * sinOmega - cosOmegaP * cosOmega * cosI);

  const zPeri = x_orb * sinOmegaP * sinI + y_orb * cosOmegaP * sinI;

  // Earth radius in km
  const earthRadius = 6371;

  // Calculate latitude, longitude, altitude (simplified - no GMST rotation)
  const lat = Math.atan2(zPeri, Math.sqrt(xPeri * xPeri + yPeri * yPeri)) * (180 / Math.PI);
  const lon = (Math.atan2(yPeri, xPeri) * (180 / Math.PI)) % 360;
  const altitude = r - earthRadius;

  // Calculate velocity (simplified)
  const velocity = Math.sqrt((2 * 398600.4418) / r - 398600.4418 / a) / 1; // km/s

  return {
    name: tle.name,
    noradId: tle.noradId,
    x: xPeri,
    y: yPeri,
    z: zPeri,
    lat: isNaN(lat) ? 0 : lat,
    lon: isNaN(lon) ? 0 : lon,
    altitude: isNaN(altitude) ? 6371 : altitude,
    velocity: isNaN(velocity) ? 0 : velocity,
  };
}

/**
 * Convert Earth-centered coordinates to Cartesian coordinates for Three.js
 * Scales position for visualization (satellites are very close to Earth)
 *
 * @param position - Satellite position in ECI coordinates
 * @param scale - Scale factor for visualization
 * @returns Cartesian coordinates {x, y, z}
 */
export function satellitePositionToCartesian(
  position: SatellitePosition,
  scale: number = 10 // Scale factor for 3D visualization
) {
  return {
    x: (position.x / 6371) * scale, // Normalized to Earth radius
    y: (position.z / 6371) * scale,
    z: (position.y / 6371) * scale,
  };
}

/**
 * Fetch satellite data from CelesTrak
 *
 * @param group - Satellite group (e.g., 'active', 'iridium', 'stations')
 * @returns Array of satellites with TLE data
 *
 * @example
 * ```typescript
 * const satellites = await fetchCelesTrakData('active');
 * ```
 */
export async function fetchCelesTrakData(
  group: string = 'active'
): Promise<CelesTrakSatellite[]> {
  const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CelesTrak API error: ${response.statusText}`);
    }

    const data: CelesTrakSatellite[] = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid CelesTrak response format');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch CelesTrak data:', error);
    throw error;
  }
}

/**
 * Filter satellites by constellation name
 *
 * @param satellites - Array of satellites
 * @param constellation - Constellation name (e.g., 'STARLINK', 'ONEWEB')
 * @returns Filtered satellites
 */
export function filterByConstellation(
  satellites: CelesTrakSatellite[],
  constellation: string
): CelesTrakSatellite[] {
  const upperConstellation = constellation.toUpperCase();
  return satellites.filter((sat) =>
    sat.OBJECT_NAME.toUpperCase().includes(upperConstellation)
  );
}

/**
 * Parse batch of TLE data and calculate positions
 *
 * @param satellites - CelesTrak satellite data
 * @param date - Date/time for position calculation
 * @returns Array of satellite positions
 */
export function calculateSatellitePositions(
  satellites: CelesTrakSatellite[],
  date: Date = new Date()
): SatellitePosition[] {
  return satellites
    .map((sat) => {
      try {
        const tle = parseCelesTrakJSON(sat);
        return calculateSatellitePosition(tle, date);
      } catch (error) {
        console.warn(`Failed to calculate position for ${sat.OBJECT_NAME}:`, error);
        return null;
      }
    })
    .filter((pos): pos is SatellitePosition => pos !== null);
}
