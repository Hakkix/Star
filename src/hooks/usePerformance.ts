import { useEffect, useState, useRef, useCallback } from 'react'

export interface PerformanceMetrics {
  fps: number
  memory: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
}

export interface RendererStats {
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
}

/**
 * Hook to monitor Three.js performance metrics
 * Only available in development mode
 *
 * Tracks:
 * - FPS (frames per second)
 * - Memory usage (JS heap)
 * - Draw calls (updated externally via updateRendererStats)
 * - Triangle count (updated externally via updateRendererStats)
 * - Geometry count (updated externally via updateRendererStats)
 * - Texture count (updated externally via updateRendererStats)
 */
export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: null,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0
  })

  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const fpsUpdateInterval = 500 // Update FPS every 500ms

  // Track FPS and memory
  useEffect(() => {
    let animationFrameId: number

    const measureFPS = () => {
      frameCount.current++
      const currentTime = performance.now()
      const elapsed = currentTime - lastTime.current

      if (elapsed >= fpsUpdateInterval) {
        const fps = Math.round((frameCount.current * 1000) / elapsed)

        // Get memory info if available (Chrome/Edge)
        interface PerformanceMemory {
          usedJSHeapSize: number
          totalJSHeapSize: number
          jsHeapSizeLimit: number
        }
        const performanceWithMemory = performance as Performance & { memory?: PerformanceMemory }
        const memory = performanceWithMemory.memory
          ? {
              usedJSHeapSize: performanceWithMemory.memory.usedJSHeapSize,
              totalJSHeapSize: performanceWithMemory.memory.totalJSHeapSize,
              jsHeapSizeLimit: performanceWithMemory.memory.jsHeapSizeLimit
            }
          : null

        setMetrics(prev => ({
          ...prev,
          fps,
          memory
        }))

        frameCount.current = 0
        lastTime.current = currentTime
      }

      animationFrameId = requestAnimationFrame(measureFPS)
    }

    animationFrameId = requestAnimationFrame(measureFPS)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  // Callback to update renderer stats from external source (Canvas)
  const updateRendererStats = useCallback((stats: RendererStats) => {
    setMetrics(prev => ({
      ...prev,
      ...stats
    }))
  }, [])

  return { metrics, updateRendererStats }
}
