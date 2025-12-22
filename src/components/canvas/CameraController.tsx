'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation'
import * as THREE from 'three'
import { useMemo } from 'react'

/**
 * CameraController Component
 *
 * Syncs Three.js camera rotation to device orientation sensors (gyroscope/accelerometer).
 *
 * Coordinate System Transformations:
 * 1. Device provides Euler angles (alpha, beta, gamma) in degrees
 * 2. Convert to radians and create Quaternion (avoids gimbal lock)
 * 3. Apply -90° X-axis rotation to align phone coordinate system with camera
 *    - Phone "looks out" the back of the screen (normal to screen surface)
 *    - Three.js camera "looks down" the negative Z-axis
 *    - This rotation bridges the two coordinate systems
 *
 * Euler Angle Definitions:
 * - Alpha (Z-axis): 0-360°, compass heading
 * - Beta (X-axis): -180 to 180°, front-to-back tilt
 * - Gamma (Y-axis): -90 to 90°, left-to-right tilt
 *
 * Desktop Fallback:
 * - When no sensor data is available, camera remains at initial orientation
 * - Allows development and testing without mobile device
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <CameraController />
 *   <Scene />
 * </Canvas>
 * ```
 */
export default function CameraController() {
  const { camera } = useThree()
  const { alpha, beta, gamma, permission } = useDeviceOrientation()

  // Pre-compute the camera alignment quaternion (only once)
  // This -90° X rotation aligns phone coordinate system with camera coordinate system
  const alignmentQuaternion = useMemo(
    () => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2),
    []
  )

  useFrame(() => {
    // Only update camera if we have valid sensor data
    if (permission === 'granted' && alpha !== null && beta !== null && gamma !== null) {
      // 1. Convert degrees to radians
      const alphaRad = THREE.MathUtils.degToRad(alpha)
      const betaRad = THREE.MathUtils.degToRad(beta)
      const gammaRad = THREE.MathUtils.degToRad(gamma)

      // 2. Create Euler angles in the correct order
      // 'YXZ' order is critical for proper device orientation
      const euler = new THREE.Euler(betaRad, alphaRad, -gammaRad, 'YXZ')

      // 3. Convert Euler to Quaternion (avoids gimbal lock)
      const deviceQuaternion = new THREE.Quaternion().setFromEuler(euler)

      // 4. Apply alignment rotation and update camera
      // Multiply device rotation by alignment correction
      camera.quaternion.copy(deviceQuaternion).multiply(alignmentQuaternion)
    }

    // Always update matrix (even if no sensor data, for desktop compatibility)
    camera.updateMatrixWorld()
  })

  return null
}
