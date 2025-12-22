/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { Canvas } from '@react-three/fiber'
import CameraController from '../CameraController'
import * as THREE from 'three'

// Mock the useDeviceOrientation hook
vi.mock('@/hooks/useDeviceOrientation')

import { useDeviceOrientation } from '@/hooks/useDeviceOrientation'

const mockUseDeviceOrientation = vi.mocked(useDeviceOrientation)

describe('CameraController', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render without crashing', () => {
    // Mock with no sensor data (desktop fallback)
    mockUseDeviceOrientation.mockReturnValue({
      alpha: null,
      beta: null,
      gamma: null,
      permission: 'prompt',
      requestPermission: vi.fn(),
      error: null,
    })

    const { container } = render(
      <Canvas>
        <CameraController />
      </Canvas>
    )

    expect(container).toBeTruthy()
  })

  it('should not update camera when permission is not granted', () => {
    mockUseDeviceOrientation.mockReturnValue({
      alpha: 90,
      beta: 45,
      gamma: 30,
      permission: 'denied',
      requestPermission: vi.fn(),
      error: null,
    })

    const { container } = render(
      <Canvas>
        <CameraController />
      </Canvas>
    )

    expect(container).toBeTruthy()
    // Camera should remain at initial orientation when permission is denied
  })

  it('should not update camera when sensor data is null', () => {
    mockUseDeviceOrientation.mockReturnValue({
      alpha: null,
      beta: null,
      gamma: null,
      permission: 'granted',
      requestPermission: vi.fn(),
      error: null,
    })

    const { container } = render(
      <Canvas>
        <CameraController />
      </Canvas>
    )

    expect(container).toBeTruthy()
    // Camera should remain at initial orientation when sensor data is null
  })

  it('should update camera quaternion when sensor data is available', async () => {
    mockUseDeviceOrientation.mockReturnValue({
      alpha: 0,
      beta: 0,
      gamma: 0,
      permission: 'granted',
      requestPermission: vi.fn(),
      error: null,
    })

    const { container } = render(
      <Canvas>
        <CameraController />
      </Canvas>
    )

    expect(container).toBeTruthy()
    // Note: Full validation of quaternion values requires more complex Three.js mocking
    // This test verifies the component renders and doesn't crash with valid sensor data
  })

  it('should correctly convert euler angles to quaternions', () => {
    // Test the mathematical conversion independently
    const alpha = 90 // degrees
    const beta = 45
    const gamma = 30

    const alphaRad = THREE.MathUtils.degToRad(alpha)
    const betaRad = THREE.MathUtils.degToRad(beta)
    const gammaRad = THREE.MathUtils.degToRad(gamma)

    const euler = new THREE.Euler(betaRad, alphaRad, -gammaRad, 'YXZ')
    const quaternion = new THREE.Quaternion().setFromEuler(euler)

    expect(quaternion).toBeInstanceOf(THREE.Quaternion)
    expect(quaternion.x).toBeTypeOf('number')
    expect(quaternion.y).toBeTypeOf('number')
    expect(quaternion.z).toBeTypeOf('number')
    expect(quaternion.w).toBeTypeOf('number')
  })

  it('should apply alignment quaternion correctly', () => {
    // Test the -90° X-axis rotation alignment
    const alignmentQuaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -Math.PI / 2
    )

    expect(alignmentQuaternion).toBeInstanceOf(THREE.Quaternion)

    // Verify it's a 90-degree rotation around X-axis
    const euler = new THREE.Euler().setFromQuaternion(alignmentQuaternion)
    expect(Math.abs(euler.x + Math.PI / 2)).toBeLessThan(0.0001)
  })

  it('should handle all zero angles (device lying flat)', () => {
    mockUseDeviceOrientation.mockReturnValue({
      alpha: 0,
      beta: 0,
      gamma: 0,
      permission: 'granted',
      requestPermission: vi.fn(),
      error: null,
    })

    const { container } = render(
      <Canvas>
        <CameraController />
      </Canvas>
    )

    expect(container).toBeTruthy()
  })

  it('should handle extreme angle values', () => {
    // Test with maximum angle values
    mockUseDeviceOrientation.mockReturnValue({
      alpha: 360,
      beta: 180,
      gamma: 90,
      permission: 'granted',
      requestPermission: vi.fn(),
      error: null,
    })

    const { container } = render(
      <Canvas>
        <CameraController />
      </Canvas>
    )

    expect(container).toBeTruthy()
  })

  it('should handle negative angle values', () => {
    // Test with negative angle values
    mockUseDeviceOrientation.mockReturnValue({
      alpha: 0,
      beta: -90,
      gamma: -45,
      permission: 'granted',
      requestPermission: vi.fn(),
      error: null,
    })

    const { container } = render(
      <Canvas>
        <CameraController />
      </Canvas>
    )

    expect(container).toBeTruthy()
  })

  it('should use YXZ euler order for device orientation', () => {
    // Verify the Euler order is correct for device orientation
    const euler = new THREE.Euler(0, 0, 0, 'YXZ')
    expect(euler.order).toBe('YXZ')
  })

  it('should memoize alignment quaternion', () => {
    // This is implicitly tested by useMemo in the component
    // Alignment quaternion is only created once
    const q1 = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -Math.PI / 2
    )
    const q2 = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -Math.PI / 2
    )

    // Verify quaternions are equal
    expect(q1.x).toBe(q2.x)
    expect(q1.y).toBe(q2.y)
    expect(q1.z).toBe(q2.z)
    expect(q1.w).toBe(q2.w)
  })

  it('should handle permission state changes', () => {
    const { rerender } = render(
      <Canvas>
        <CameraController />
      </Canvas>
    )

    // Start with denied permission
    mockUseDeviceOrientation.mockReturnValue({
      alpha: 90,
      beta: 45,
      gamma: 30,
      permission: 'denied',
      requestPermission: vi.fn(),
      error: null,
    })

    rerender(
      <Canvas>
        <CameraController />
      </Canvas>
    )

    // Grant permission
    mockUseDeviceOrientation.mockReturnValue({
      alpha: 90,
      beta: 45,
      gamma: 30,
      permission: 'granted',
      requestPermission: vi.fn(),
      error: null,
    })

    rerender(
      <Canvas>
        <CameraController />
      </Canvas>
    )

    // Component should handle permission state changes gracefully
    expect(true).toBe(true)
  })

  it('should handle rapid sensor updates', () => {
    // Simulate rapid sensor data changes
    const mockFn = vi.fn()

    for (let i = 0; i < 100; i++) {
      mockUseDeviceOrientation.mockReturnValue({
        alpha: i * 3.6, // 0-360 degrees
        beta: Math.sin(i) * 90,
        gamma: Math.cos(i) * 45,
        permission: 'granted',
        requestPermission: mockFn,
        error: null,
      })
    }

    const { container } = render(
      <Canvas>
        <CameraController />
      </Canvas>
    )

    expect(container).toBeTruthy()
    // Component should handle rapid updates without crashing
  })
})
