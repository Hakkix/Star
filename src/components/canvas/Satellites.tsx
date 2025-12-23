'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, Vector3 } from 'three'
import { useSatellites } from '@/hooks/useSatellites'
import { satellitePositionToCartesian } from '@/lib/tle'
import { useStarStore, type StarStoreState } from '@/lib/store'

/**
 * Satellites Component
 *
 * Renders satellites fetched from CelesTrak TLE data.
 *
 * ## Performance Considerations
 *
 * Satellites are rendered as individual meshes for now, similar to planets.
 * For thousands of satellites, consider:
 * - Using InstancedMesh for better performance
 * - Level-of-detail (LOD) - only render closest satellites
 * - Culling - only render satellites in view cone
 * - Grouping by constellation for toggleable visibility
 *
 * ## Coordinate System
 *
 * Satellite positions are calculated in Earth-centered coordinates (ECI)
 * and scaled for visualization. They are NOT rotated with the celestial sphere
 * like stars/planets, since satellites orbit Earth, not appear on the celestial sphere.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <CelestialSphere>
 *     <StarField />
 *     <Planets />
 *   </CelestialSphere>
 *   <Satellites />
 * </Canvas>
 * ```
 */

/**
 * Individual satellite mesh component
 */
interface SatelliteMeshProps {
  position: Vector3;
  onClick: () => void;
}

function SatelliteMesh({ position, onClick }: SatelliteMeshProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshBasicMaterial color="#00ff00" />
    </mesh>
  );
}

/**
 * Main Satellites component
 */
export default function Satellites() {
  const { showSatellites, satelliteGroup } = useStarStore((state: StarStoreState) => ({
    showSatellites: state.showSatellites,
    satelliteGroup: state.satelliteGroup,
  }));
  const selectCelestialBody = useStarStore((state: StarStoreState) => state.selectCelestialBody);

  // Fetch satellite data from CelesTrak
  const { satellites, loading, error } = useSatellites({
    group: satelliteGroup,
    autoRefresh: true,
    refreshInterval: 60000, // Refresh every minute
    maxSatellites: 500, // Limit for performance
  });

  const [satellitePositions, setSatellitePositions] = useState<
    Map<number, Vector3>
  >(new Map());

  /**
   * Convert satellite positions to Three.js coordinates
   */
  const calculatePositions = useMemo(() => {
    return () => {
      if (satellites.length === 0) return new Map();

      const positions = new Map<number, Vector3>();

      satellites.forEach((sat) => {
        try {
          // Convert ECI coordinates to Three.js coordinates
          const { x, y, z } = satellitePositionToCartesian(sat, 10);
          positions.set(sat.noradId, new Vector3(x, y, z));
        } catch (error) {
          console.error(`Error converting position for ${sat.name}:`, error);
        }
      });

      return positions;
    };
  }, [satellites]);

  /**
   * Update positions as satellites move
   * Satellites move faster than planets, so update more frequently
   */
  useFrame(() => {
    setSatellitePositions(calculatePositions());
  });

  /**
   * Initialize positions
   */
  useEffect(() => {
    setSatellitePositions(calculatePositions());
  }, [calculatePositions]);

  /**
   * Handle satellite click
   */
  const handleSatelliteClick = (satellite: typeof satellites[0]) => {
    selectCelestialBody({
      type: 'satellite',
      name: satellite.name,
      noradId: satellite.noradId,
      altitude: satellite.altitude,
      velocity: satellite.velocity,
      lat: satellite.lat,
      lon: satellite.lon,
      dist: satellite.altitude,
    });
  };

  // Don't render if satellites are disabled or loading
  if (!showSatellites || loading) {
    return null;
  }

  // Log errors but continue rendering
  if (error) {
    console.warn('Satellite data error:', error.message);
  }

  return (
    <group>
      {satellites.map((sat) => {
        const position = satellitePositions.get(sat.noradId);
        if (!position) return null;

        return (
          <SatelliteMesh
            key={sat.noradId}
            position={position}
            onClick={() => handleSatelliteClick(sat)}
          />
        );
      })}
    </group>
  );
}
