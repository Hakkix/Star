'use client'

import { useEffect } from 'react'
import { usePWARegistration } from '@/hooks/usePWARegistration'

/**
 * PWA Initialization Component
 * Registers service worker and manages PWA installation state
 * This component runs only on the client side
 */

export function PWAInit() {
  const { isSupported, isRegistered, error } = usePWARegistration()

  useEffect(() => {
    if (isSupported && isRegistered) {
      console.log('[PWA] Service Worker registered successfully')
    }

    if (error) {
      console.warn('[PWA] Error during initialization:', error)
    }
  }, [isSupported, isRegistered, error])

  // This component doesn't render anything
  return null
}
