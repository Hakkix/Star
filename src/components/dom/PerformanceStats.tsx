'use client'

import { usePerformance, RendererStats } from '@/hooks/usePerformance'

interface PerformanceStatsProps {
  onRendererStatsUpdate?: (callback: (stats: RendererStats) => void) => void
}

/**
 * PerformanceStats Component (UX-5.3 / UX-9.2)
 *
 * Displays real-time performance metrics for the AR experience.
 * Only visible in development mode (process.env.NODE_ENV === 'development').
 *
 * Metrics:
 * - FPS (frames per second)
 * - Memory usage (JS heap in MB)
 * - Draw calls
 * - Triangle count
 * - Geometry count
 * - Texture count
 *
 * Positioned in the top-right corner with a semi-transparent overlay.
 */
export function PerformanceStats({ onRendererStatsUpdate }: PerformanceStatsProps = {}) {
  const { metrics, updateRendererStats } = usePerformance()

  // Expose the update callback to parent
  if (onRendererStatsUpdate) {
    onRendererStatsUpdate(updateRendererStats)
  }

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Format bytes to MB
  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1)
  }

  // Determine FPS color (green > 55, yellow 30-55, red < 30)
  const getFPSColor = (fps: number) => {
    if (fps >= 55) return '#10b981' // Green
    if (fps >= 30) return '#f59e0b' // Yellow
    return '#ef4444' // Red
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '0.75rem',
        padding: '1rem',
        color: 'white',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        minWidth: '200px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
      }}
    >
      <h3
        style={{
          margin: '0 0 0.75rem 0',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          color: '#667eea',
          borderBottom: '1px solid rgba(102, 126, 234, 0.3)',
          paddingBottom: '0.5rem'
        }}
      >
        Performance Stats
      </h3>

      {/* FPS */}
      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8' }}>FPS:</span>
        <span style={{ color: getFPSColor(metrics.fps), fontWeight: 'bold' }}>
          {metrics.fps}
        </span>
      </div>

      {/* Memory (if available) */}
      {metrics.memory && (
        <>
          <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>Memory:</span>
            <span style={{ color: '#a78bfa' }}>
              {formatBytes(metrics.memory.usedJSHeapSize)} MB
            </span>
          </div>
          <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Limit:</span>
            <span style={{ color: '#64748b', fontSize: '0.65rem' }}>
              {formatBytes(metrics.memory.jsHeapSizeLimit)} MB
            </span>
          </div>
        </>
      )}

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          margin: '0.75rem 0'
        }}
      />

      {/* Render Stats */}
      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8' }}>Draw Calls:</span>
        <span style={{ color: '#60a5fa' }}>{metrics.drawCalls}</span>
      </div>

      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8' }}>Triangles:</span>
        <span style={{ color: '#60a5fa' }}>
          {metrics.triangles.toLocaleString()}
        </span>
      </div>

      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8' }}>Geometries:</span>
        <span style={{ color: '#34d399' }}>{metrics.geometries}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8' }}>Textures:</span>
        <span style={{ color: '#34d399' }}>{metrics.textures}</span>
      </div>

      {/* Environment indicator */}
      <div
        style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.65rem',
          color: '#64748b',
          textAlign: 'center'
        }}
      >
        Development Mode
      </div>
    </div>
  )
}
