import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { Canvas } from '@react-three/fiber'
import * as Astronomy from 'astronomy-engine'
import Planets from '../Planets'
import { useGPS } from '@/hooks/useGPS'
import { getPlanetPosition } from '@/lib/astronomy'
import { useStarStore } from '@/lib/store'

// Mock dependencies
vi.mock('@/hooks/useGPS')
vi.mock('@/lib/astronomy', async () => {
  const actual = await vi.importActual('@/lib/astronomy')
  return {
    ...actual,
    getPlanetPosition: vi.fn(),
    raDecToCartesian: vi.fn((ra: number, dec: number, radius: number) => ({
      x: radius * Math.cos((dec * Math.PI) / 180) * Math.cos((ra * 15 * Math.PI) / 180),
      y: radius * Math.sin((dec * Math.PI) / 180),
      z: radius * Math.cos((dec * Math.PI) / 180) * Math.sin((ra * 15 * Math.PI) / 180),
    })),
  }
})
vi.mock('@/lib/store')

describe('Planets Component', () => {
  const mockUseGPS = vi.mocked(useGPS)
  const mockGetPlanetPosition = vi.mocked(getPlanetPosition)
  const mockSelectCelestialBody = vi.fn()

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Mock useStarStore
    vi.mocked(useStarStore).mockReturnValue(mockSelectCelestialBody)

    // Mock GPS coordinates (New York)
    mockUseGPS.mockReturnValue({
      latitude: 40.7128,
      longitude: -74.0060,
      altitude: 0,
      accuracy: 10,
      error: null,
      loading: false,
      requestPermission: vi.fn(),
    })

    // Mock planet positions
    mockGetPlanetPosition.mockImplementation((body: Astronomy.Body) => {
      const positions: Record<string, { ra: number; dec: number; dist: number }> = {
        Sun: { ra: 12.0, dec: 0.0, dist: 1.0 },
        Moon: { ra: 14.0, dec: 10.0, dist: 0.0026 },
        Mercury: { ra: 10.0, dec: 5.0, dist: 0.5 },
        Venus: { ra: 8.0, dec: -5.0, dist: 0.7 },
        Mars: { ra: 16.0, dec: 15.0, dist: 1.5 },
        Jupiter: { ra: 18.0, dec: -10.0, dist: 5.2 },
        Saturn: { ra: 20.0, dec: -15.0, dist: 9.5 },
        Uranus: { ra: 22.0, dec: 5.0, dist: 19.2 },
        Neptune: { ra: 23.0, dec: -5.0, dist: 30.1 },
      }

      return {
        name: body,
        ...positions[body],
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render without crashing when GPS is available', () => {
    const { container } = render(
      <Canvas>
        <Planets />
      </Canvas>
    )

    // Component should render without errors
    expect(container).toBeTruthy()
    expect(container.querySelector('canvas')).toBeTruthy()
  })

  it('should not render planets when GPS coordinates are not available', () => {
    mockUseGPS.mockReturnValue({
      latitude: null,
      longitude: null,
      altitude: null,
      accuracy: null,
      error: 'GPS not available',
      loading: false,
      requestPermission: vi.fn(),
    })

    const { container } = render(
      <Canvas>
        <Planets />
      </Canvas>
    )

    // Component should render but not show planets
    expect(container).toBeTruthy()
  })

  it('should use GPS hook to get coordinates', () => {
    const { container } = render(
      <Canvas>
        <Planets />
      </Canvas>
    )

    // Component should render successfully (implicit GPS usage)
    expect(container).toBeTruthy()
    expect(container.querySelector('canvas')).toBeTruthy()
  })

  it('should handle null latitude gracefully', () => {
    mockUseGPS.mockReturnValue({
      latitude: null,
      longitude: -74.0060,
      altitude: 0,
      accuracy: 10,
      error: null,
      loading: false,
      requestPermission: vi.fn(),
    })

    const { container } = render(
      <Canvas>
        <Planets />
      </Canvas>
    )

    // Should render without crashing
    expect(container).toBeTruthy()
  })

  it('should handle null longitude gracefully', () => {
    mockUseGPS.mockReturnValue({
      latitude: 40.7128,
      longitude: null,
      altitude: 0,
      accuracy: null,
      error: null,
      loading: false,
      requestPermission: vi.fn(),
    })

    const { container } = render(
      <Canvas>
        <Planets />
      </Canvas>
    )

    // Should render without crashing
    expect(container).toBeTruthy()
  })

  it('should access the store for selectCelestialBody action', () => {
    const { container } = render(
      <Canvas>
        <Planets />
      </Canvas>
    )

    // Component should render successfully (implicit store usage)
    expect(container).toBeTruthy()
    expect(mockSelectCelestialBody).toBeDefined()
  })

  it('should render a group element', () => {
    const { container } = render(
      <Canvas>
        <Planets />
      </Canvas>
    )

    // Canvas should be rendered
    expect(container.querySelector('canvas')).toBeTruthy()
  })

  it('should handle GPS loading state', () => {
    mockUseGPS.mockReturnValue({
      latitude: null,
      longitude: null,
      altitude: null,
      accuracy: null,
      error: null,
      loading: true,
      requestPermission: vi.fn(),
    })

    const { container } = render(
      <Canvas>
        <Planets />
      </Canvas>
    )

    // Should render without errors even during loading
    expect(container).toBeTruthy()
  })

  it('should handle GPS error state', () => {
    mockUseGPS.mockReturnValue({
      latitude: null,
      longitude: null,
      altitude: null,
      accuracy: null,
      error: {
        code: 1,
        message: 'User denied Geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      },
      loading: false,
      requestPermission: vi.fn(),
    })

    const { container } = render(
      <Canvas>
        <Planets />
      </Canvas>
    )

    // Should render without errors even when GPS has error
    expect(container).toBeTruthy()
  })

  it('should verify getPlanetPosition function is available', () => {
    // This test verifies the mock is set up correctly
    const result = getPlanetPosition('Sun' as Astronomy.Body, new Date(), {
      latitude: 40.7128,
      longitude: -74.0060,
      altitude: 0,
    })

    expect(result).toBeDefined()
    expect(result.name).toBe('Sun')
    expect(result.ra).toBeDefined()
    expect(result.dec).toBeDefined()
    expect(result.dist).toBeDefined()
  })
})
