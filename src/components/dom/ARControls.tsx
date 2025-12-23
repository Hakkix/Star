'use client'

import { useState } from 'react'
import { useStarStore } from '@/lib/store'
import { captureAndShare, captureAndDownload } from '@/lib/utils/screenshot'
import styles from './ARControls.module.css'

/**
 * ARControls Component (UX-3.4 + UX-5.2)
 *
 * Bottom control bar for AR view with various controls and toggles.
 * Provides quick access to settings and features without blocking the AR view.
 *
 * ## Features
 * - Time travel controls (future enhancement)
 * - Constellation lines toggle
 * - Planet visibility toggle
 * - Favorites panel toggle (UX-5.1)
 * - Screenshot capture and sharing (UX-5.2)
 * - Settings panel toggle
 * - Glass morphism design
 *
 * @example
 * ```tsx
 * <ARControls />
 * ```
 */
export function ARControls() {
  const [showSettings, setShowSettings] = useState(false)
  const [screenshotStatus, setScreenshotStatus] = useState<'idle' | 'capturing' | 'success' | 'error'>('idle')
  const showConstellations = useStarStore((state) => state.showConstellations)
  const showPlanets = useStarStore((state) => state.showPlanets)
  const favoritesPanelOpen = useStarStore((state) => state.favoritesPanelOpen)
  const toggleConstellations = useStarStore((state) => state.toggleConstellations)
  const togglePlanets = useStarStore((state) => state.togglePlanets)
  const toggleFavoritesPanel = useStarStore((state) => state.toggleFavoritesPanel)

  const handleScreenshot = async () => {
    setScreenshotStatus('capturing')

    try {
      // Try to share first (if supported)
      const shared = await captureAndShare(
        'Star AR Screenshot',
        'Check out this celestial view from Star AR!'
      )

      // If not shared (Web Share API not supported), it falls back to download
      setScreenshotStatus('success')

      // Reset status after 2 seconds
      setTimeout(() => setScreenshotStatus('idle'), 2000)
    } catch (error) {
      console.error('Screenshot failed:', error)
      setScreenshotStatus('error')
      setTimeout(() => setScreenshotStatus('idle'), 2000)
    }
  }

  const handleSettings = () => {
    setShowSettings((prev) => !prev)
  }

  return (
    <div className={styles.container}>
      {/* Settings Panel */}
      {showSettings && (
        <div className={styles.settingsPanel}>
          <div className={styles.settingsPanelHeader}>
            <h3>Display Settings</h3>
            <button
              className={styles.closePanelButton}
              onClick={() => setShowSettings(false)}
              aria-label="Close settings"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className={styles.settingsContent}>
            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <span>Constellation Lines</span>
                <span className={styles.settingHint}>
                  {showConstellations ? 'Enabled' : 'Disabled'}
                </span>
              </label>
              <button
                className={`${styles.toggle} ${showConstellations ? styles.toggleActive : ''}`}
                onClick={toggleConstellations}
                aria-label="Toggle constellation lines"
                role="switch"
                aria-checked={showConstellations}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>
            <div className={styles.settingItem}>
              <label className={styles.settingLabel}>
                <span>Show Planets</span>
                <span className={styles.settingHint}>
                  {showPlanets ? 'Visible' : 'Hidden'}
                </span>
              </label>
              <button
                className={`${styles.toggle} ${showPlanets ? styles.toggleActive : ''}`}
                onClick={togglePlanets}
                aria-label="Toggle planets visibility"
                role="switch"
                aria-checked={showPlanets}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className={styles.controlBar}>
        {/* Constellation Lines */}
        <button
          className={`${styles.controlButton} ${showConstellations ? styles.controlButtonActive : ''}`}
          onClick={toggleConstellations}
          aria-label="Toggle constellation lines"
          title="Constellation Lines"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="5" cy="5" r="1.5" fill="currentColor" />
            <circle cx="19" cy="5" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="5" cy="19" r="1.5" fill="currentColor" />
            <circle cx="19" cy="19" r="1.5" fill="currentColor" />
            <line x1="5" y1="5" x2="12" y2="12" strokeOpacity="0.5" />
            <line x1="19" y1="5" x2="12" y2="12" strokeOpacity="0.5" />
            <line x1="12" y1="12" x2="5" y2="19" strokeOpacity="0.5" />
            <line x1="12" y1="12" x2="19" y2="19" strokeOpacity="0.5" />
          </svg>
        </button>

        {/* Planets */}
        <button
          className={`${styles.controlButton} ${showPlanets ? styles.controlButtonActive : ''}`}
          onClick={togglePlanets}
          aria-label="Toggle planets"
          title="Show/Hide Planets"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </button>

        {/* Favorites */}
        <button
          className={`${styles.controlButton} ${favoritesPanelOpen ? styles.controlButtonActive : ''}`}
          onClick={toggleFavoritesPanel}
          aria-label="Toggle favorites panel"
          title="Favorites"
        >
          <svg viewBox="0 0 24 24" fill={favoritesPanelOpen ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Screenshot */}
        <button
          className={`${styles.controlButton} ${screenshotStatus === 'success' ? styles.controlButtonSuccess : ''} ${screenshotStatus === 'error' ? styles.controlButtonError : ''}`}
          onClick={handleScreenshot}
          disabled={screenshotStatus === 'capturing'}
          aria-label="Take screenshot"
          title={
            screenshotStatus === 'capturing'
              ? 'Capturing...'
              : screenshotStatus === 'success'
              ? 'Screenshot saved!'
              : screenshotStatus === 'error'
              ? 'Screenshot failed'
              : 'Take Screenshot'
          }
        >
          {screenshotStatus === 'capturing' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="15">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          ) : screenshotStatus === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : screenshotStatus === 'error' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          )}
        </button>

        {/* Settings */}
        <button
          className={`${styles.controlButton} ${showSettings ? styles.controlButtonActive : ''}`}
          onClick={handleSettings}
          aria-label="Open settings"
          title="Settings"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
          </svg>
        </button>
      </div>
    </div>
  )
}
