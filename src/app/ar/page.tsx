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
    loading: gpsLoading,
    isFallback: gpsIsFallback
  } = useGPS()

  // Determine overall permission state
  const permissionGranted = orientationPermission === 'granted'
  // Only show orientation errors as blocking errors
  // GPS errors are handled with fallback location
  const hasError = !!orientationError
  const errorMessage = orientationError

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
      {(!permissionGranted || hasError || gpsLoading) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10
        }}>
          <Overlay
            permissionGranted={permissionGranted}
            onRequestPermission={requestOrientationPermission}
            showLoading={gpsLoading}
            errorMessage={errorMessage}
          />
        </div>
      )}

      {/* GPS Fallback Warning - Non-blocking */}
      {gpsIsFallback && permissionGranted && !hasError && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 152, 0, 0.9)',
          color: '#000',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          zIndex: 20,
          fontSize: '0.875rem',
          fontWeight: '500',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          maxWidth: '90%',
          pointerEvents: 'none'
        }}>
          Using default location (San Francisco).{' '}
          {gpsError?.code === 1 ? 'Location permission denied.' : 'Unable to get your location.'}
        </div>
      )}

      {/* Detail Overlay for Selected Celestial Bodies */}
      <DetailOverlay />
    </>
  )
}
