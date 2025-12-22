/**
 * Astronomy calculation utilities
 * Handles coordinate conversions and celestial calculations
 */

import * as Astronomy from 'astronomy-engine';

/**
 * Cartesian coordinates in 3D space
 */
export type CartesianCoords = {
  x: number;
  y: number;
  z: number;
};

/**
 * Observer location for astronomical calculations
 */
export type ObserverLocation = {
  latitude: number;
  longitude: number;
  altitude?: number;
};

/**
 * Planet position data with equatorial coordinates
 */
export type PlanetPositionData = {
  name: string;
  ra: number;
  dec: number;
  dist: number;
};

/**
 * Converts celestial coordinates (Right Ascension/Declination) to Cartesian coordinates
 * for use in Three.js 3D space
 *
 * @param ra - Right Ascension in hours (0-24)
 * @param dec - Declination in degrees (-90 to 90)
 * @param radius - Distance from origin (default 1000)
 * @returns Cartesian coordinates {x, y, z}
 *
 * Coordinate system:
 * - X-axis: Points to vernal equinox (RA=0h, Dec=0°)
 * - Y-axis: Points to North Celestial Pole (Dec=90°)
 * - Z-axis: Points to RA=6h, Dec=0°
 */
export function raDecToCartesian(
  ra: number,
  dec: number,
  radius: number = 1000
): CartesianCoords {
  // Convert RA from hours to degrees to radians
  const raRad = ((ra * 15) * Math.PI) / 180;

  // Convert Dec from degrees to radians
  const decRad = (dec * Math.PI) / 180;

  // Calculate Cartesian coordinates
  const x = radius * Math.cos(decRad) * Math.cos(raRad);
  const y = radius * Math.sin(decRad);
  const z = radius * Math.cos(decRad) * Math.sin(raRad);

  return { x, y, z };
}

/**
 * Calculates Local Sidereal Time for a given date and longitude
 *
 * @param date - The date/time to calculate LST for
 * @param longitude - Observer's longitude in degrees (east positive)
 * @returns Local Sidereal Time in degrees (0-360)
 *
 * Note: This is a simplified calculation. For production use,
 * consider using astronomy-engine for higher accuracy.
 */
export function calculateLST(date: Date, longitude: number): number {
  // Convert date to Julian Date
  const jd = date.getTime() / 86400000 + 2440587.5;

  // Calculate Greenwich Mean Sidereal Time (GMST)
  // Formula based on IAU 2000 simplified version
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0);

  // Add longitude to get Local Sidereal Time
  const lst = (gmst + longitude) % 360;

  return lst;
}

/**
 * Gets the position of a planet or celestial body at a given date and observer location
 *
 * @param bodyName - Name of the celestial body (e.g., 'Sun', 'Moon', 'Mars', 'Jupiter')
 * @param date - The date/time to calculate position for
 * @param observer - Observer's location {latitude, longitude, altitude}
 * @returns Planet position with Right Ascension, Declination, and distance
 *
 * Note: This wraps astronomy-engine's Equator() function for easy integration
 * Supported bodies: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
 */
export function getPlanetPosition(
  bodyName: Astronomy.Body,
  date: Date,
  observer: ObserverLocation
): PlanetPositionData {
  // Create astronomy-engine Observer
  const astroObserver = new Astronomy.Observer(
    observer.latitude,
    observer.longitude,
    observer.altitude || 0
  );

  // Calculate equatorial coordinates
  // Parameters: body, date, observer, ofdate (true for date coordinates), aberration (true)
  const equPoint = Astronomy.Equator(
    bodyName,
    date,
    astroObserver,
    true,
    true
  );

  return {
    name: bodyName,
    ra: equPoint.ra,
    dec: equPoint.dec,
    dist: equPoint.dist,
  };
}
