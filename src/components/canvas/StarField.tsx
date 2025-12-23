/**
 * StarField Component
 * Renders 5000+ stars using InstancedMesh for optimal performance
 * Uses star catalog data with RA/Dec coordinates converted to 3D Cartesian
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { raDecToCartesian } from '@/lib/astronomy';
import { useStarStore, type StarStoreState, CelestialBodyData } from '@/lib/store';
import starsData from '@/data/stars.json';

// Constants
const UNIVERSE_RADIUS = 1000; // Distance from origin to place stars
const MIN_STAR_SIZE = 0.1;
const MAX_STAR_SIZE = 0.4;

/**
 * Star data structure from catalog
 */
interface StarData {
  hip: number;
  ra: number;
  dec: number;
  mag: number;
  con: string;
  dist: number;
  name?: string;
}

/**
 * Calculates star scale based on apparent magnitude
 * Brighter stars (lower magnitude) = larger spheres
 *
 * @param magnitude - Apparent magnitude (lower is brighter)
 * @returns Scale factor for star size
 */
function magnitudeToScale(magnitude: number): number {
  // Invert magnitude: brighter stars (lower mag) should be larger
  // Typical visible star magnitudes: -1.5 (Sirius) to 6.5 (faintest naked eye)
  // Normalize to 0-1 range, then map to MIN_STAR_SIZE to MAX_STAR_SIZE

  // Clamp magnitude to reasonable range
  const clampedMag = Math.max(-2, Math.min(7, magnitude));

  // Invert: -2 mag -> 1.0, 7 mag -> 0.0
  const normalized = 1 - ((clampedMag + 2) / 9);

  // Map to size range
  return MIN_STAR_SIZE + (normalized * (MAX_STAR_SIZE - MIN_STAR_SIZE));
}

export default function StarField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const selectCelestialBody = useStarStore((state: StarStoreState) => state.selectCelestialBody);

  // Load and process star data
  const stars = useMemo(() => {
    return (starsData as StarData[]).map((star) => {
      const position = raDecToCartesian(star.ra, star.dec, UNIVERSE_RADIUS);
      const scale = magnitudeToScale(star.mag);

      return {
        ...star,
        position,
        scale,
      };
    });
  }, []);

  const starCount = stars.length;

  // Initialize InstancedMesh matrices
  useEffect(() => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    const mesh = meshRef.current;

    console.log(`Initializing ${stars.length} stars in InstancedMesh`);

    stars.forEach((star, i) => {
      // Set position
      dummy.position.set(star.position.x, star.position.y, star.position.z);

      // Set scale based on magnitude
      dummy.scale.setScalar(star.scale);

      // Update matrix
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    // Mark for update
    mesh.instanceMatrix.needsUpdate = true;
    console.log('Stars initialized successfully');
  }, [stars]);

  // Optional: Subtle twinkle effect (can be disabled for performance)
  useFrame((state) => {
    if (!meshRef.current) return;

    // Very subtle rotation to simulate atmospheric twinkle
    // This is optional and can be commented out for better performance
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(time * 0.05) * 0.001;
  });

  /**
   * Handle star click/tap
   * Uses raycasting to determine which star instance was clicked
   */
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    // Get the instanceId from the raycaster
    const instanceId = event.instanceId;

    if (instanceId === undefined || instanceId < 0 || instanceId >= stars.length) {
      return;
    }

    const star = stars[instanceId];

    // Create CelestialBodyData object for the store
    const bodyData: CelestialBodyData = {
      type: 'star',
      name: star.name || `HIP ${star.hip}`,
      ra: star.ra,
      dec: star.dec,
      mag: star.mag,
      con: star.con,
      dist: star.dist,
      hip: star.hip,
    };

    // Update store with selected star
    selectCelestialBody(bodyData);
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, starCount]}
      onClick={handleClick}
      frustumCulled={false}
    >
      {/* Sphere geometry for each star */}
      <sphereGeometry args={[0.15, 8, 8]} />

      {/* Basic material - stars are self-luminous */}
      <meshBasicMaterial
        color="#ffffff"
        toneMapped={false}
      />
    </instancedMesh>
  );
}
