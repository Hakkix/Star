'use client'

import { useFrame, useThree } from '@react-three/fiber'

/**
 * CameraController component - Placeholder for HP-5
 *
 * This component will sync the Three.js camera rotation to device orientation sensors.
 *
 * TODO (HP-5): Implement full device orientation sync
 * - Use useDeviceOrientation hook
 * - Convert euler angles to quaternions (avoid gimbal lock)
 * - Apply -90° X rotation (phone vs camera coordinate system)
 * - Update camera rotation in useFrame
 * - Handle missing sensor data gracefully
 *
 * For now, this is a placeholder that keeps the camera at the origin.
 */
export default function CameraController() {
  const { camera } = useThree()

  useFrame(() => {
    // Placeholder: Camera stays at initial position
    // Will be replaced with device orientation sync in HP-5
    camera.updateMatrixWorld()
  })

  return null
}
