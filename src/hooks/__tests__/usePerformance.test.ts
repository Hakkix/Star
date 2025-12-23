import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePerformance } from '../usePerformance'

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

describe('usePerformance', () => {
  let mockPerformance: Partial<PerformanceWithMemory>
  let originalPerformance: Performance

  beforeEach(() => {
    // Save original performance object
    originalPerformance = global.performance

    // Mock performance object with memory
    mockPerformance = {
      now: vi.fn(() => Date.now()),
      memory: {
        usedJSHeapSize: 50 * 1024 * 1024, // 50 MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100 MB
        jsHeapSizeLimit: 2048 * 1024 * 1024 // 2048 MB
      }
    }
    global.performance = mockPerformance as Performance
  })

  afterEach(() => {
    // Restore original performance object
    global.performance = originalPerformance
    vi.restoreAllMocks()
  })

  it('returns initial metrics with zero values', () => {
    const { result } = renderHook(() => usePerformance())

    expect(result.current.metrics.fps).toBe(0)
    expect(result.current.metrics.drawCalls).toBe(0)
    expect(result.current.metrics.triangles).toBe(0)
    expect(result.current.metrics.geometries).toBe(0)
    expect(result.current.metrics.textures).toBe(0)
  })

  it('initializes with null memory when not available', () => {
    // Remove memory from performance
    delete mockPerformance.memory

    const { result } = renderHook(() => usePerformance())

    expect(result.current.metrics.memory).toBeNull()
  })

  it('provides updateRendererStats callback', () => {
    const { result } = renderHook(() => usePerformance())

    expect(result.current.updateRendererStats).toBeDefined()
    expect(typeof result.current.updateRendererStats).toBe('function')
  })

  it('updates renderer stats when callback is called', () => {
    const { result } = renderHook(() => usePerformance())

    act(() => {
      result.current.updateRendererStats({
        drawCalls: 42,
        triangles: 15000,
        geometries: 10,
        textures: 5
      })
    })

    expect(result.current.metrics.drawCalls).toBe(42)
    expect(result.current.metrics.triangles).toBe(15000)
    expect(result.current.metrics.geometries).toBe(10)
    expect(result.current.metrics.textures).toBe(5)
  })

  it('preserves FPS and memory when updating renderer stats', () => {
    const { result } = renderHook(() => usePerformance())

    // Update renderer stats
    act(() => {
      result.current.updateRendererStats({
        drawCalls: 42,
        triangles: 15000,
        geometries: 10,
        textures: 5
      })
    })

    // FPS should still exist (even if 0)
    expect(result.current.metrics.fps).toBeDefined()
    // Memory should still be null or defined based on initial state
    expect(result.current.metrics.memory !== undefined).toBe(true)
  })

  it('allows multiple updates to renderer stats', () => {
    const { result } = renderHook(() => usePerformance())

    act(() => {
      result.current.updateRendererStats({
        drawCalls: 10,
        triangles: 1000,
        geometries: 5,
        textures: 2
      })
    })

    expect(result.current.metrics.drawCalls).toBe(10)

    act(() => {
      result.current.updateRendererStats({
        drawCalls: 20,
        triangles: 2000,
        geometries: 8,
        textures: 4
      })
    })

    expect(result.current.metrics.drawCalls).toBe(20)
    expect(result.current.metrics.triangles).toBe(2000)
  })
})
