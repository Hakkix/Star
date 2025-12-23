'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useStarStore } from '@/lib/store'
import styles from './Settings.module.css'

type Theme = 'auto' | 'light' | 'dark'

export default function SettingsPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [theme, setTheme] = useState<Theme>('auto')
  const [reduceMotion, setReduceMotion] = useState(false)
  const [starCount, setStarCount] = useState(5000)
  const [labelSize, setLabelSize] = useState(100)
  const [showSaveNotification, setShowSaveNotification] = useState(false)

  // Get store actions
  const { resetOnboarding, reset, showConstellations, showPlanets, toggleConstellations, togglePlanets } = useStarStore()

  useEffect(() => {
    setIsVisible(true)

    // Load settings from localStorage
    const savedTheme = localStorage.getItem('star-theme') as Theme
    const savedReduceMotion = localStorage.getItem('star-reduce-motion')
    const savedStarCount = localStorage.getItem('star-star-count')
    const savedLabelSize = localStorage.getItem('star-label-size')

    if (savedTheme) setTheme(savedTheme)
    if (savedReduceMotion) setReduceMotion(savedReduceMotion === 'true')
    if (savedStarCount) setStarCount(parseInt(savedStarCount))
    if (savedLabelSize) setLabelSize(parseInt(savedLabelSize))
  }, [])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('star-theme', newTheme)
    showNotification()

    // Apply theme immediately (if you have theme support)
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-theme')
      document.documentElement.classList.remove('dark-theme')
    } else if (newTheme === 'dark') {
      document.documentElement.classList.add('dark-theme')
      document.documentElement.classList.remove('light-theme')
    } else {
      document.documentElement.classList.remove('light-theme', 'dark-theme')
    }
  }

  const handleReduceMotionChange = (value: boolean) => {
    setReduceMotion(value)
    localStorage.setItem('star-reduce-motion', value.toString())
    showNotification()

    // Apply reduced motion preference
    if (value) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }

  const handleStarCountChange = (value: number) => {
    setStarCount(value)
    localStorage.setItem('star-star-count', value.toString())
    showNotification()
  }

  const handleLabelSizeChange = (value: number) => {
    setLabelSize(value)
    localStorage.setItem('star-label-size', value.toString())
    showNotification()
  }

  const handleResetTutorial = () => {
    resetOnboarding()
    localStorage.removeItem('star-onboarding-completed')
    showNotification()
  }

  const handleClearCache = () => {
    // Clear all Star-related localStorage items except settings
    const keysToKeep = ['star-theme', 'star-reduce-motion', 'star-star-count', 'star-label-size']
    const allKeys = Object.keys(localStorage)

    allKeys.forEach(key => {
      if (key.startsWith('star-') && !keysToKeep.includes(key)) {
        localStorage.removeItem(key)
      }
    })

    showNotification()
  }

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
      // Reset localStorage
      const allKeys = Object.keys(localStorage)
      allKeys.forEach(key => {
        if (key.startsWith('star-')) {
          localStorage.removeItem(key)
        }
      })

      // Reset store
      reset()

      // Reset local state
      setTheme('auto')
      setReduceMotion(false)
      setStarCount(5000)
      setLabelSize(100)

      // Remove theme classes
      document.documentElement.classList.remove('light-theme', 'dark-theme', 'reduce-motion')

      showNotification()
    }
  }

  const showNotification = () => {
    setShowSaveNotification(true)
    setTimeout(() => setShowSaveNotification(false), 2000)
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        {/* Save Notification */}
        {showSaveNotification && (
          <div className={styles.notification}>
            Settings saved ✓
          </div>
        )}

        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>
            Customize your Star AR experience
          </p>
        </header>

        {/* Appearance Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Appearance</h2>

          <div className={styles.setting}>
            <div className={styles.settingHeader}>
              <label className={styles.settingLabel}>Theme</label>
              <p className={styles.settingDescription}>
                Choose how Star appears
              </p>
            </div>
            <div className={styles.themeOptions}>
              <button
                className={`${styles.themeButton} ${theme === 'auto' ? styles.active : ''}`}
                onClick={() => handleThemeChange('auto')}
              >
                Auto
              </button>
              <button
                className={`${styles.themeButton} ${theme === 'light' ? styles.active : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                Light
              </button>
              <button
                className={`${styles.themeButton} ${theme === 'dark' ? styles.active : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                Dark
              </button>
            </div>
          </div>

          <div className={styles.setting}>
            <div className={styles.settingHeader}>
              <label className={styles.settingLabel}>Reduce Motion</label>
              <p className={styles.settingDescription}>
                Minimize animations for better accessibility
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => handleReduceMotionChange(e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.setting}>
            <div className={styles.settingHeader}>
              <label className={styles.settingLabel}>
                Label Size: {labelSize}%
              </label>
              <p className={styles.settingDescription}>
                Adjust text size for celestial body labels
              </p>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              step="10"
              value={labelSize}
              onChange={(e) => handleLabelSizeChange(parseInt(e.target.value))}
              className={styles.slider}
            />
          </div>
        </section>

        {/* Display Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Display</h2>

          <div className={styles.setting}>
            <div className={styles.settingHeader}>
              <label className={styles.settingLabel}>Show Constellations</label>
              <p className={styles.settingDescription}>
                Display constellation lines and boundaries
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={showConstellations}
                onChange={toggleConstellations}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.setting}>
            <div className={styles.settingHeader}>
              <label className={styles.settingLabel}>Show Planets</label>
              <p className={styles.settingDescription}>
                Display planets and their positions
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={showPlanets}
                onChange={togglePlanets}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </section>

        {/* Performance Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Performance</h2>

          <div className={styles.setting}>
            <div className={styles.settingHeader}>
              <label className={styles.settingLabel}>
                Maximum Stars: {starCount.toLocaleString()}
              </label>
              <p className={styles.settingDescription}>
                Adjust star count for better performance on older devices
              </p>
            </div>
            <input
              type="range"
              min="1000"
              max="8000"
              step="500"
              value={starCount}
              onChange={(e) => handleStarCountChange(parseInt(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.rangeLabels}>
              <span>1,000 (Faster)</span>
              <span>8,000 (More Stars)</span>
            </div>
          </div>
        </section>

        {/* Data & Privacy Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data & Privacy</h2>

          <div className={styles.setting}>
            <div className={styles.settingHeader}>
              <label className={styles.settingLabel}>Reset Tutorial</label>
              <p className={styles.settingDescription}>
                Show the onboarding tutorial again next time you visit
              </p>
            </div>
            <button className={styles.button} onClick={handleResetTutorial}>
              Reset Tutorial
            </button>
          </div>

          <div className={styles.setting}>
            <div className={styles.settingHeader}>
              <label className={styles.settingLabel}>Clear Cached Data</label>
              <p className={styles.settingDescription}>
                Clear favorites, search history, and temporary data
              </p>
            </div>
            <button className={styles.button} onClick={handleClearCache}>
              Clear Cache
            </button>
          </div>

          <div className={styles.setting}>
            <div className={styles.settingHeader}>
              <label className={styles.settingLabel}>Reset All Settings</label>
              <p className={styles.settingDescription}>
                Restore all settings to default values
              </p>
            </div>
            <button className={`${styles.button} ${styles.buttonDanger}`} onClick={handleResetAll}>
              Reset Everything
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoLabel}>Version</h3>
              <p className={styles.infoValue}>1.0.0 Beta</p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoLabel}>Data Privacy</h3>
              <p className={styles.infoValue}>All data stored locally</p>
            </div>
            <div className={styles.infoCard}>
              <h3 className={styles.infoLabel}>License</h3>
              <p className={styles.infoValue}>Open Source</p>
            </div>
          </div>

          <div className={styles.links}>
            <Link href="/about" className={styles.link}>
              About Star
            </Link>
            <Link href="/help" className={styles.link}>
              Help & Documentation
            </Link>
            <a
              href="https://github.com/Hakkix/Star"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              GitHub Repository
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>
            Changes are automatically saved.{' '}
            <Link href="/" className={styles.footerLink}>
              Return to Home
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
