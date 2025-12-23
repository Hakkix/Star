'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'
import * as Astronomy from 'astronomy-engine'
import { useGPS } from '@/hooks/useGPS'
import { getPlanetPosition, raDecToCartesian } from '@/lib/astronomy'
import { useStarStore, type StarStoreState } from '@/lib/store'

/**
 * Planets Component (HP-8)
 *
 * Renders major planets at their real-time calculated positions using astronomy-engine.
 *
 * ## Performance Optimization
 *
 * Unlike stars (5000+ objects), we only have ~8 planets, so we use individual meshes
 * instead of InstancedMesh. This allows for:
 * - Individual colors per planet
 * - Individual sizes based on planet type
 * - Easy click detection
 * - Simpler code
 *
 * Positions are recalculated periodically (every 60 frames ~1 second) rather than
 * every frame, since planetary motion is slow enough that this is imperceptible.
 *
 * ## Color Coding
 *
 * Planets are color-coded to match their real appearance:
 * - Mercury: Gray
 * - Venus: Yellowish-white
 * - Mars: Red
 * - Jupiter: Orange with bands
 * - Saturn: Pale gold
 * - Uranus: Cyan
 * - Neptune: Deep blue
 * - Moon: Gray-white
 * - Sun: Yellow
 *
 * ## Coordinate System
 *
 * Planet positions are calculated in equatorial coordinates (RA/Dec) and converted
 * to Cartesian coordinates using the same system as stars. The CelestialSphere
 * parent component applies LST rotation and latitude tilt to align with the real sky.
 *
 * @example
 * ```tsx
 * <CelestialSphere>
 *   <StarField />
 *   <Planets />
 * </CelestialSphere>
 * ```
 */

/**
 * List of celestial bodies to render
 * Includes major planets, Moon, and Sun for MVP
 */
const BODIES: Astronomy.Body[] = [
  'Sun' as Astronomy.Body,
  'Moon' as Astronomy.Body,
  'Mercury' as Astronomy.Body,
  'Venus' as Astronomy.Body,
  'Mars' as Astronomy.Body,
  'Jupiter' as Astronomy.Body,
  'Saturn' as Astronomy.Body,
  'Uranus' as Astronomy.Body,
  'Neptune' as Astronomy.Body,
]

/**
 * Get color for a given celestial body
 */
function getPlanetColor(body: Astronomy.Body): string {
  const colors: Partial<Record<Astronomy.Body, string>> = {
    Sun: '#FDB813',
    Moon: '#C0C0C0',
    Mercury: '#8C7853',
    Venus: '#FFC649',
    Mars: '#CD5C5C',
    Jupiter: '#C88B3A',
    Saturn: '#FAD5A5',
    Uranus: '#4FD0E7',
    Neptune: '#4166F5',
    Pluto: '#A0826D',
  }

  return colors[body] || '#FFFFFF'
}

/**
 * Get relative size for a given celestial body
 * These are artistic sizes for visibility, not to scale
 */
function getPlanetSize(body: Astronomy.Body): number {
  const sizes: Partial<Record<Astronomy.Body, number>> = {
    Sun: 3.0,
    Moon: 2.5,
    Jupiter: 2.0,
    Saturn: 1.8,
    Venus: 1.5,
    Mars: 1.5,
    Mercury: 1.3,
    Uranus: 1.6,
    Neptune: 1.6,
    Pluto: 1.2,
  }

  return sizes[body] || 1.5
}

/**
 * Individual planet mesh component
 */
interface PlanetProps {
  position: Vector3
  color: string
  size: number
  onClick: () => void
}

function Planet({ position, color, size, onClick }: PlanetProps) {
  const meshRef = useRef<Mesh>(null)

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

/**
 * Main Planets component
 */
export default function Planets() {
  const { latitude, longitude } = useGPS()
  const selectCelestialBody = useStarStore((state: StarStoreState) => state.selectCelestialBody)
  const frameCountRef = useRef(0)
  const [planetPositions, setPlanetPositions] = useState<
    Map<Astronomy.Body, Vector3>
  >(new Map())

  /**
   * Calculate planet positions
   * Memoized to avoid recalculation unless GPS changes
   */
  const calculatePositions = useMemo(() => {
    return () => {
      if (latitude === null || longitude === null) return new Map()

      const positions = new Map<Astronomy.Body, Vector3>()
      const now = new Date()

      BODIES.forEach((body) => {
        try {
          // Get planet position in equatorial coordinates
          const planetData = getPlanetPosition(body, now, {
            latitude,
            longitude,
            altitude: 0,
          })

          // Convert to Cartesian coordinates
          const { x, y, z } = raDecToCartesian(
            planetData.ra,
            planetData.dec,
            1000 // Same radius as stars
          )

          positions.set(body, new Vector3(x, y, z))
        } catch (error) {
          console.error(`Error calculating position for ${body}:`, error)
        }
      })

      return positions
    }
  }, [latitude, longitude])

  /**
   * Update positions periodically (every 60 frames ≈ 1 second)
   * This is sufficient since planets move slowly
   */
  useFrame(() => {
    frameCountRef.current += 1
    if (frameCountRef.current >= 60) {
      setPlanetPositions(calculatePositions())
      frameCountRef.current = 0
    }
  })

  /**
   * Initialize positions on mount and when GPS changes
   */
  useEffect(() => {
    setPlanetPositions(calculatePositions())
  }, [calculatePositions])

  /**
   * Handle planet click
   */
  const handlePlanetClick = (body: Astronomy.Body) => {
    const planetData = getPlanetPosition(
      body,
      new Date(),
      {
        latitude: latitude || 0,
        longitude: longitude || 0,
        altitude: 0,
      }
    )

    selectCelestialBody({
      type: 'planet',
      name: body,
      ra: planetData.ra,
      dec: planetData.dec,
      dist: planetData.dist,
    })
  }

  // Don't render if we don't have GPS coordinates
  if (latitude === null || longitude === null) {
    return null
  }

  return (
    <group>
      {BODIES.map((body) => {
        const position = planetPositions.get(body)
        if (!position) return null

        return (
          <Planet
            key={body}
            position={position}
            color={getPlanetColor(body)}
            size={getPlanetSize(body)}
            onClick={() => handlePlanetClick(body)}
          />
        )
      })}
    </group>
  )
}
