import { useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'

export interface RendererStats {
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
}

/**
 * Hook to monitor Three.js renderer stats from within the Canvas
 * Must be used inside <Canvas> component
 *
 * Tracks WebGL renderer statistics:
 * - Draw calls
 * - Triangle count
 * - Geometry count
 * - Texture count
 */
export function useRendererStats() {
  const { gl } = useThree()
  const [stats, setStats] = useState<RendererStats>({
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0
  })

  useFrame(() => {
    if (gl && gl.info) {
      setStats({
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures
      })
    }
  })

  return stats
}
