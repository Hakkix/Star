'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

/**
 * AR Experience Page
 *
 * This page displays the interactive AR star map using Three.js and device sensors.
 * The Scene component is dynamically imported with SSR disabled to prevent server-side
 * rendering issues with Three.js and WebGL.
 */

// Dynamic import with SSR disabled (required for Three.js/WebGL)
const Scene = dynamic(() => import('@/components/canvas/Scene'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#fff',
      fontSize: '1.25rem'
    }}>
      Loading 3D Scene...
    </div>
  )
})

export default function ARExperience() {
  return (
    <Suspense fallback={
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: '#fff',
        fontSize: '1.25rem'
      }}>
        Initializing AR Experience...
      </div>
    }>
      <Scene />
    </Suspense>
  )
}
