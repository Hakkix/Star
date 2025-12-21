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
 * Observer location on Earth
 */
export type ObserverLocation = {
  latitude: number;   // degrees (-90 to 90)
  longitude: number;  // degrees (-180 to 180)
  altitude?: number;  // meters above sea level (default 0)
};

/**
 * Celestial body position data
 */
export type PlanetPosition = {
  name: string;       // Body name (e.g., "Mars")
  ra: number;         // Right Ascension in hours (0-24)
  dec: number;        // Declination in degrees (-90 to 90)
  dist: number;       // Distance from Earth in AU
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
 * Gets the current position of a celestial body (planet, moon, or sun)
 * using the astronomy-engine library
 *
 * @param bodyName - Name of the celestial body (e.g., "Mars", "Jupiter", "Moon", "Sun")
 * @param date - The date/time for which to calculate the position
 * @param observer - Observer's location on Earth (latitude, longitude, altitude)
 * @returns Planet position with RA, Dec, distance, and name
 *
 * @example
 * ```typescript
 * const observer = { latitude: 40.7128, longitude: -74.0060, altitude: 10 };
 * const mars = getPlanetPosition('Mars', new Date(), observer);
 * console.log(`Mars RA: ${mars.ra}h, Dec: ${mars.dec}°, Distance: ${mars.dist} AU`);
 * ```
 *
 * Supported bodies:
 * - Planets: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune
 * - Other: Sun, Moon, Pluto
 *
 * Note: Earth is not supported (observer is on Earth)
 */
export function getPlanetPosition(
  bodyName: string,
  date: Date,
  observer: ObserverLocation
): PlanetPosition {
  // Validate body name
  const validBodies = [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
    'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
  ];

  if (!validBodies.includes(bodyName)) {
    throw new Error(
      `Invalid body name "${bodyName}". Must be one of: ${validBodies.join(', ')}`
    );
  }

  // Create Observer object (altitude in meters, default to 0)
  const astroObserver = new Astronomy.Observer(
    observer.latitude,
    observer.longitude,
    observer.altitude ?? 0
  );

  // Calculate equatorial coordinates
  // ofdate=true: coordinates relative to Earth's equator at the given date
  // aberration=true: account for aberration of light (apparent position)
  const equatorial = Astronomy.Equator(
    bodyName as Astronomy.Body,
    date,
    astroObserver,
    true,  // ofdate
    true   // aberration
  );

  return {
    name: bodyName,
    ra: equatorial.ra,      // Right Ascension in hours (0-24)
    dec: equatorial.dec,    // Declination in degrees (-90 to 90)
    dist: equatorial.dist,  // Distance in AU
  };
}
