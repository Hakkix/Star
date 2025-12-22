'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useStarStore } from '@/lib/store'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const [isVisible, setIsVisible] = useState(false)

  const showConstellations = useStarStore((state) => state.showConstellations)
  const showPlanets = useStarStore((state) => state.showPlanets)
  const toggleConstellations = useStarStore((state) => state.toggleConstellations)
  const togglePlanets = useStarStore((state) => state.togglePlanets)
  const resetOnboarding = useStarStore((state) => state.resetOnboarding)
  const reset = useStarStore((state) => state.reset)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleResetOnboarding = () => {
    if (confirm('Are you sure you want to reset the onboarding flow? You will see the welcome screens again on your next visit to the AR experience.')) {
      resetOnboarding()
      alert('Onboarding has been reset. You will see the welcome flow again when you launch the AR experience.')
    }
  }

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all settings? This will clear all your preferences and restart the app.')) {
      reset()
      alert('All settings have been reset to defaults.')
    }
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={`${styles.hero} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            <span className={styles.titleGradient}>Settings</span>
          </h1>
          <p className={styles.subtitle}>
            Customize your stargazing experience
          </p>
        </div>
      </section>

      {/* Display Settings */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.highlight}>Display</span> Settings
          </h2>
          <p className={styles.sectionDescription}>
            Control what celestial objects are visible in the AR experience
          </p>

          <div className={styles.settingsGroup}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <div className={styles.settingIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className={styles.settingText}>
                  <h3 className={styles.settingTitle}>Show Constellations</h3>
                  <p className={styles.settingDescription}>
                    Display constellation patterns and groupings in the sky
                  </p>
                </div>
              </div>
              <button
                className={`${styles.toggle} ${showConstellations ? styles.active : ''}`}
                onClick={toggleConstellations}
                aria-label="Toggle constellations"
                aria-pressed={showConstellations}
              >
                <span className={styles.toggleSlider}></span>
              </button>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <div className={styles.settingIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                  </svg>
                </div>
                <div className={styles.settingText}>
                  <h3 className={styles.settingTitle}>Show Planets</h3>
                  <p className={styles.settingDescription}>
                    Display real-time positions of planets in our solar system
                  </p>
                </div>
              </div>
              <button
                className={`${styles.toggle} ${showPlanets ? styles.active : ''}`}
                onClick={togglePlanets}
                aria-label="Toggle planets"
                aria-pressed={showPlanets}
              >
                <span className={styles.toggleSlider}></span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* App Settings */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.highlight}>App</span> Settings
          </h2>
          <p className={styles.sectionDescription}>
            Manage app behavior and reset options
          </p>

          <div className={styles.actionGroup}>
            <div className={styles.actionItem}>
              <div className={styles.actionInfo}>
                <div className={styles.actionIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className={styles.actionText}>
                  <h3 className={styles.actionTitle}>Reset Onboarding</h3>
                  <p className={styles.actionDescription}>
                    Show the welcome flow again when launching the AR experience
                  </p>
                </div>
              </div>
              <button
                className={styles.actionButton}
                onClick={handleResetOnboarding}
              >
                Reset
              </button>
            </div>

            <div className={styles.actionItem}>
              <div className={styles.actionInfo}>
                <div className={`${styles.actionIcon} ${styles.dangerIcon}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div className={styles.actionText}>
                  <h3 className={styles.actionTitle}>Reset All Settings</h3>
                  <p className={styles.actionDescription}>
                    Clear all preferences and return to default settings
                  </p>
                </div>
              </div>
              <button
                className={`${styles.actionButton} ${styles.dangerButton}`}
                onClick={handleResetAll}
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Data */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.highlight}>Privacy</span> & Data
          </h2>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className={styles.infoContent}>
              <h3 className={styles.infoTitle}>Your Data is Private</h3>
              <p className={styles.infoText}>
                All astronomical calculations and location processing happen entirely on your device.
                Star never sends your GPS coordinates, device orientation, or any personal data to
                external servers. Your settings are stored locally in your browser and remain completely
                private.
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <div className={styles.infoContent}>
              <h3 className={styles.infoTitle}>Open Source</h3>
              <p className={styles.infoText}>
                Star is completely open source. You can review the code, verify privacy claims,
                and contribute improvements on GitHub. We believe in transparency and community-driven
                development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Explore?</h2>
          <p className={styles.ctaDescription}>
            Your settings are saved automatically. Launch the AR experience to see them in action.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/ar" className={styles.primaryButton}>
              <span>Launch AR Experience</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/help" className={styles.secondaryButton}>
              View Help
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
