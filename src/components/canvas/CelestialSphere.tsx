'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Group } from 'three'
import { useGPS } from '@/hooks/useGPS'
import { calculateLST } from '@/lib/astronomy'
import StarField from './StarField'
import Planets from './Planets'

/**
 * CelestialSphere Component (HP-7)
 *
 * Parent group that applies Local Sidereal Time (LST) rotation and latitude tilt
 * to align the celestial coordinate system with the real world.
 *
 * ## Coordinate System Transformations
 *
 * The celestial sphere uses the equatorial coordinate system (RA/Dec), which is
 * independent of the observer's location on Earth. To align this system with the
 * observer's view of the sky, we apply two critical transformations:
 *
 * 1. **LST Rotation (Y-axis)**:
 *    - Local Sidereal Time (LST) determines which portion of the celestial sphere
 *      is currently overhead at the observer's longitude
 *    - Applied as a rotation around the Y-axis (celestial pole axis)
 *    - Updates continuously as Earth rotates
 *
 * 2. **Latitude Tilt (X-axis)**:
 *    - Adjusts the celestial pole's altitude above the horizon
 *    - At the North Pole (90°), the celestial pole is directly overhead (no tilt)
 *    - At the Equator (0°), the celestial pole is on the horizon (90° tilt)
 *    - Formula: tilt = 90° - latitude
 *    - Applied as a rotation around the X-axis
 *
 * ## Performance Considerations
 *
 * - LST and tilt calculations are memoized to avoid recalculating on every frame
 * - Rotations only update when GPS coordinates change
 * - Children (StarField, Planets) inherit these transformations automatically
 *
 * @example
 * ```tsx
 * <CelestialSphere>
 *   <StarField />
 *   <Planets />
 * </CelestialSphere>
 * ```
 */
export default function CelestialSphere() {
  const groupRef = useRef<Group>(null)
  const { latitude, longitude } = useGPS()

  /**
   * Calculate Local Sidereal Time rotation (in radians)
   * Memoized to avoid expensive recalculation on every render
   */
  const lstRotation = useMemo(() => {
    if (longitude === null) return 0

    // Calculate LST in degrees
    const lstDegrees = calculateLST(new Date(), longitude)

    // Convert to radians for Three.js
    // LST rotation is applied around the Y-axis (celestial pole)
    return (lstDegrees * Math.PI) / 180
  }, [longitude])

  /**
   * Calculate latitude tilt (in radians)
   * This adjusts the altitude of the celestial pole above the horizon
   * Memoized to avoid recalculation on every render
   */
  const latitudeTilt = useMemo(() => {
    if (latitude === null) return 0

    // Tilt formula: 90° - latitude
    // At North Pole (90°): tilt = 0° (pole overhead)
    // At Equator (0°): tilt = 90° (pole on horizon)
    // At South Pole (-90°): tilt = 180° (pole below horizon)
    const tiltDegrees = 90 - latitude

    // Convert to radians for Three.js
    // Tilt is applied around the X-axis
    return (tiltDegrees * Math.PI) / 180
  }, [latitude])

  /**
   * Apply rotations to the celestial sphere group
   * Updates when GPS coordinates change (LST or latitude tilt changes)
   */
  useEffect(() => {
    if (!groupRef.current) return

    // Apply X-axis tilt (latitude correction)
    groupRef.current.rotation.x = latitudeTilt

    // Apply Y-axis rotation (LST alignment)
    groupRef.current.rotation.y = lstRotation
  }, [lstRotation, latitudeTilt])

  return (
    <group ref={groupRef}>
      {/* StarField: InstancedMesh rendering 5000+ stars */}
      <StarField />

      {/* Planets: Individual meshes for Sun, Moon, and major planets */}
      <Planets />
    </group>
  )
}
