'use client'

import { useRendererStats, type RendererStats } from '@/hooks/useRendererStats'
import { useEffect } from 'react'

interface PerformanceMonitorProps {
  onStatsUpdate: (stats: RendererStats) => void
}

/**
 * PerformanceMonitor Component
 *
 * Internal component that runs inside the Three.js Canvas
 * and monitors renderer statistics. Updates are passed to
 * the parent component via callback.
 *
 * Must be used inside <Canvas> component.
 */
export function PerformanceMonitor({ onStatsUpdate }: PerformanceMonitorProps) {
  const stats = useRendererStats()

  useEffect(() => {
    onStatsUpdate(stats)
  }, [stats, onStatsUpdate])

  return null // This component doesn't render anything
}
