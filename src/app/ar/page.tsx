'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation'
import { useGPS } from '@/hooks/useGPS'
import { Overlay } from '@/components/dom/Overlay'
import { DetailOverlay } from '@/components/dom/DetailOverlay'

/**
 * AR Experience Page (HP-11)
 *
 * Main AR page that integrates all components for the interactive star map experience.
 * This page combines:
 * - 3D Scene with stars, planets, and camera controller
 * - Permission UI for GPS and device orientation
 * - Detail overlay for selected celestial bodies
 *
 * The Scene component is dynamically imported with SSR disabled to prevent
 * server-side rendering issues with Three.js and WebGL.
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
  // Device orientation hook for camera control
  const {
    permission: orientationPermission,
    requestPermission: requestOrientationPermission,
    error: orientationError
  } = useDeviceOrientation()

  // GPS hook for celestial alignment
  const {
    error: gpsError,
    loading: gpsLoading
  } = useGPS()

  // Determine overall permission state
  const permissionGranted = orientationPermission === 'granted'
  const hasError = orientationError || gpsError
  const errorMessage = orientationError || (gpsError ? gpsError.message : null)

  return (
    <>
      {/* 3D Scene Canvas */}
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

      {/* Permission and Status Overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: permissionGranted && !hasError ? 'none' : 'auto',
        zIndex: 10
      }}>
        <Overlay
          permissionGranted={permissionGranted}
          onRequestPermission={requestOrientationPermission}
          showLoading={gpsLoading}
          errorMessage={errorMessage}
        />
      </div>

      {/* Detail Overlay for Selected Celestial Bodies */}
      <DetailOverlay />
    </>
  )
}
