import { useEffect, useState } from 'react'

/**
 * Hook to register the service worker and manage PWA installation
 * Provides updates on SW registration state and install prompt
 */

export interface PWAState {
  isSupported: boolean
  isInstalled: boolean
  isRegistered: boolean
  canInstall: boolean
  error: string | null
}

export function usePWARegistration() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isSupported: false,
    isInstalled: false,
    isRegistered: false,
    canInstall: false,
    error: null,
  })

  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)

  useEffect(() => {
    // Check if running in PWA mode
    const isInstalled = () => {
      const nav = window.navigator as unknown as { standalone?: boolean }
      return window.matchMedia('(display-mode: standalone)').matches ||
             nav.standalone === true
    }

    // Check if service workers are supported
    const isSupported = 'serviceWorker' in navigator

    if (!isSupported) {
      setPwaState((prev) => ({
        ...prev,
        isSupported: false,
        error: 'Service Workers not supported',
      }))
      return
    }

    setPwaState((prev) => ({
      ...prev,
      isSupported: true,
      isInstalled: isInstalled(),
    }))

    // Register service worker
    navigator.serviceWorker
      .register('/service-worker.js', {
        scope: '/',
      })
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration)
        setPwaState((prev) => ({
          ...prev,
          isRegistered: true,
        }))

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('[PWA] Service Worker update found')
        })
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error)
        setPwaState((prev) => ({
          ...prev,
          error: error.message,
        }))
      })

    // Listen for install prompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event)
      setPwaState((prev) => ({
        ...prev,
        canInstall: true,
      }))
      console.log('[PWA] Install prompt available')
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed')
      setInstallPrompt(null)
      setPwaState((prev) => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    if (!installPrompt) {
      console.warn('[PWA] Install prompt not available')
      return false
    }

    try {
      const promptEvent = installPrompt as unknown as {
        prompt: () => Promise<void>
        userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
      }
      await promptEvent.prompt()
      const { outcome } = await promptEvent.userChoice
      console.log(`[PWA] User response: ${outcome}`)

      setInstallPrompt(null)
      setPwaState((prev) => ({
        ...prev,
        canInstall: false,
      }))

      return outcome === 'accepted'
    } catch (error) {
      console.error('[PWA] Installation failed:', error)
      return false
    }
  }

  return {
    ...pwaState,
    installPrompt,
    installPWA,
  }
}
