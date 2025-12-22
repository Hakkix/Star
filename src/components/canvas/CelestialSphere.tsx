'use client'

import { useRef } from 'react'
import { Group } from 'three'

/**
 * CelestialSphere component - Placeholder for HP-7
 *
 * This component will serve as the parent group that applies LST rotation
 * and latitude tilt to align celestial coordinates with the real world.
 *
 * TODO (HP-7): Implement full celestial alignment
 * - Use GPS coordinates from useGPS hook
 * - Calculate Local Sidereal Time (LST)
 * - Apply Y-axis rotation (LST alignment)
 * - Apply X-axis tilt (latitude correction: 90° - latitude)
 * - Update rotation when GPS changes
 * - Contain StarField and Planets as children
 *
 * For now, this is a placeholder that creates an empty group.
 * Stars and planets will be added as children in future tasks (HP-6, HP-8).
 */
export default function CelestialSphere() {
  const groupRef = useRef<Group>(null)

  return (
    <group ref={groupRef}>
      {/* Placeholder for StarField (HP-6) */}
      {/* Placeholder for Planets (HP-8) */}

      {/* Temporary test sphere to verify scene is rendering */}
      <mesh position={[0, 0, -10]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}
