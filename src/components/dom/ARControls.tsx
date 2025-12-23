'use client'

import { useState } from 'react'
import { useStarStore } from '@/lib/store'
import styles from './ARControls.module.css'

/**
 * ARControls Component (UX-3.4)
 *
 * Bottom control bar for AR view with various controls and toggles.
 * Provides quick access to settings and features without blocking the AR view.
 *
 * ## Features
 * - Time travel controls (future enhancement)
 * - Constellation lines toggle
 * - Planet visibility toggle
 * - Settings panel toggle
 * - Screenshot capture (future enhancement)
 * - Glass morphism design
 *
 * @example
 * ```tsx
 * <ARControls />
 * ```
 */
export function ARControls() {
  const [showSettings, setShowSettings] = useState(false)
  const showConstellations = useStarStore((state) => state.showConstellations)
  const showPlanets = useStarStore((state) => state.showPlanets)
  const toggleConstellations = useStarStore((state) => state.toggleConstellations)
  const togglePlanets = useStarStore((state) => state.togglePlanets)

  const handleScreenshot = () => {
    // Future: Implement screenshot functionality
    alert('Screenshot feature coming soon!')
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

        {/* Screenshot */}
        <button
          className={styles.controlButton}
          onClick={handleScreenshot}
          aria-label="Take screenshot"
          title="Screenshot (Coming Soon)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
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
