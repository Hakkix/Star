'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Link from 'next/link'
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation'
import { useGPS } from '@/hooks/useGPS'
import { OnboardingFlow } from '@/components/dom/OnboardingFlow'
import { OnboardingTutorial } from '@/components/dom/OnboardingTutorial'
import { DetailOverlay } from '@/components/dom/DetailOverlay'
import { HelpButton } from '@/components/dom/HelpButton'
import { ARControls } from '@/components/dom/ARControls'
import { FavoritesPanel } from '@/components/dom/FavoritesPanel'
import { useStarStore } from '@/lib/store'

/**
 * AR Experience Page (HP-11 + UX-3 + UX-5)
 *
 * Main AR page that integrates all components for the interactive star map experience.
 * This page combines:
 * - 3D Scene with stars, planets, and camera controller
 * - Permission UI for GPS and device orientation
 * - Detail overlay for selected celestial bodies
 * - Help button and overlay (UX-3.2)
 * - Enhanced detail overlay with favorites and sharing (UX-3.3)
 * - AR controls bar with settings (UX-3.4)
 * - Favorites panel for saved celestial bodies (UX-5.1)
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
  // Store hooks
  const { hasCompletedOnboarding, favoritesPanelOpen, setFavoritesPanelOpen } = useStarStore();

  // Device orientation hook for camera control
  const {
    permission: orientationPermission,
    requestPermission: requestOrientationPermission,
    error: orientationError
  } = useDeviceOrientation()

  // GPS hook for celestial alignment
  const {
    latitude,
    longitude,
    requestPermission: requestGPSPermission,
    error: gpsError,
    isFallback: gpsIsFallback
  } = useGPS()

  // Determine permission states
  const hasGPSPermission = !!(latitude && longitude) || gpsIsFallback
  const hasOrientationPermission = orientationPermission === 'granted'

  return (
    <>
      {/* Back Button - Floating top-left */}
      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50px',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: '500',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(102, 126, 234, 0.3)'
          e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)'
          e.currentTarget.style.transform = 'translateX(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
          e.currentTarget.style.transform = 'translateX(0)'
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ width: '18px', height: '18px' }}
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Back to Home</span>
      </Link>

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

      {/* Onboarding Flow */}
      {!hasCompletedOnboarding && (
        <OnboardingFlow
          onRequestLocation={requestGPSPermission}
          onRequestOrientation={requestOrientationPermission}
          hasGPSPermission={hasGPSPermission}
          hasOrientationPermission={hasOrientationPermission}
          gpsError={gpsError?.message || null}
          orientationError={orientationError}
        />
      )}

      {/* GPS Fallback Warning - Non-blocking */}
      {gpsIsFallback && hasCompletedOnboarding && (
        <div style={{
          position: 'fixed',
          top: '5rem',
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

      {/* Onboarding Tutorial (shows after permissions granted, first time only) */}
      {hasCompletedOnboarding && <OnboardingTutorial />}

      {/* Detail Overlay for Selected Celestial Bodies (Enhanced with UX-3.3) */}
      <DetailOverlay />

      {/* Help Button (UX-3.2) - Shows after onboarding is complete */}
      {hasCompletedOnboarding && <HelpButton />}

      {/* AR Controls Bar (UX-3.4) - Shows after onboarding is complete */}
      {hasCompletedOnboarding && <ARControls />}

      {/* Favorites Panel (UX-5.1) - Shows when toggled from ARControls */}
      {hasCompletedOnboarding && (
        <FavoritesPanel
          isOpen={favoritesPanelOpen}
          onClose={() => setFavoritesPanelOpen(false)}
        />
      )}
    </>
  )
}
