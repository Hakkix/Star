import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PerformanceStats } from '../PerformanceStats'

// Mock the usePerformance hook at the top level
const mockUpdateRendererStats = vi.fn()
const mockUsePerformance = vi.fn(() => ({
  metrics: {
    fps: 60,
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50 MB
      totalJSHeapSize: 100 * 1024 * 1024, // 100 MB
      jsHeapSizeLimit: 2048 * 1024 * 1024 // 2048 MB
    },
    drawCalls: 42,
    triangles: 15000,
    geometries: 10,
    textures: 5
  },
  updateRendererStats: mockUpdateRendererStats
}))

vi.mock('@/hooks/usePerformance', () => ({
  usePerformance: () => mockUsePerformance()
}))

describe('PerformanceStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('renders in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development')
    render(<PerformanceStats />)

    expect(screen.getByText('Performance Stats')).toBeDefined()
  })

  it('does not render in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { container } = render(<PerformanceStats />)

    expect(container.firstChild).toBeNull()
  })

  it('displays FPS metric', () => {
    vi.stubEnv('NODE_ENV', 'development')
    render(<PerformanceStats />)

    expect(screen.getByText('FPS:')).toBeDefined()
    expect(screen.getByText('60')).toBeDefined()
  })

  it('displays memory metrics when available', () => {
    vi.stubEnv('NODE_ENV', 'development')
    render(<PerformanceStats />)

    expect(screen.getByText('Memory:')).toBeDefined()
    expect(screen.getByText('50.0 MB')).toBeDefined()
    expect(screen.getByText('Limit:')).toBeDefined()
    expect(screen.getByText('2048.0 MB')).toBeDefined()
  })

  it('displays render stats', () => {
    vi.stubEnv('NODE_ENV', 'development')
    render(<PerformanceStats />)

    expect(screen.getByText('Draw Calls:')).toBeDefined()
    expect(screen.getByText('42')).toBeDefined()
    expect(screen.getByText('Triangles:')).toBeDefined()
    expect(screen.getByText('15,000')).toBeDefined()
    expect(screen.getByText('Geometries:')).toBeDefined()
    expect(screen.getByText('10')).toBeDefined()
    expect(screen.getByText('Textures:')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
  })

  it('displays development mode indicator', () => {
    vi.stubEnv('NODE_ENV', 'development')
    render(<PerformanceStats />)

    expect(screen.getByText('Development Mode')).toBeDefined()
  })

  it('handles missing memory gracefully', () => {
    // Override the mock to return null memory
    mockUsePerformance.mockReturnValueOnce({
      metrics: {
        fps: 60,
        memory: null as any,
        drawCalls: 42,
        triangles: 15000,
        geometries: 10,
        textures: 5
      },
      updateRendererStats: mockUpdateRendererStats
    })

    vi.stubEnv('NODE_ENV', 'development')
    render(<PerformanceStats />)

    // Should still render other metrics but not memory
    expect(screen.getByText('FPS:')).toBeDefined()
    expect(screen.getByText('Draw Calls:')).toBeDefined()
    // Memory should not be shown
    expect(screen.queryByText('Memory:')).toBeNull()
  })

  it('calls onRendererStatsUpdate callback when provided', () => {
    const mockCallback = vi.fn()
    vi.stubEnv('NODE_ENV', 'development')

    render(<PerformanceStats onRendererStatsUpdate={mockCallback} />)

    expect(mockCallback).toHaveBeenCalled()
  })

  it('has proper styling with semi-transparent background', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const { container } = render(<PerformanceStats />)

    const statsDiv = container.firstChild as HTMLElement
    expect(statsDiv).toBeDefined()
    expect(statsDiv?.style.position).toBe('fixed')
    expect(statsDiv?.style.top).toBe('1rem')
    expect(statsDiv?.style.right).toBe('1rem')
  })
})
