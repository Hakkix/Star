'use client'

import { useEffect } from 'react'
import styles from './HelpOverlay.module.css'

interface HelpOverlayProps {
  onClose: () => void
}

/**
 * HelpOverlay Component (UX-3.2)
 *
 * Displays help content and quick tips for using the AR star map.
 * Shows troubleshooting, keyboard shortcuts, and links to documentation.
 *
 * ## Features
 * - Quick tips for using the app
 * - Troubleshooting section
 * - Keyboard shortcuts reference
 * - Dismissible without blocking AR view
 * - Escape key to close
 *
 * @example
 * ```tsx
 * <HelpOverlay onClose={() => setIsOpen(false)} />
 * ```
 */
export function HelpOverlay({ onClose }: HelpOverlayProps) {
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-overlay-title"
    >
      <div className={styles.overlay}>
        {/* Header */}
        <div className={styles.header}>
          <h2 id="help-overlay-title" className={styles.title}>
            Help & Tips
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close help"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Quick Tips */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Quick Tips</h3>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.icon}>🌟</span>
                <span>Point your device at the sky to see stars in real-time</span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.icon}>👆</span>
                <span>Tap any star or planet to view detailed information</span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.icon}>📱</span>
                <span>Move your device slowly for best tracking accuracy</span>
              </li>
              <li className={styles.listItem}>
                <span className={styles.icon}>🌙</span>
                <span>Works best in dark environments with clear skies</span>
              </li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Troubleshooting</h3>
            <div className={styles.troubleshooting}>
              <div className={styles.troubleItem}>
                <strong>Stars not moving?</strong>
                <p>Make sure you&apos;ve granted device orientation permissions in your browser settings.</p>
              </div>
              <div className={styles.troubleItem}>
                <strong>Can&apos;t see any stars?</strong>
                <p>Check that location services are enabled and you&apos;ve granted GPS permissions.</p>
              </div>
              <div className={styles.troubleItem}>
                <strong>Positions seem wrong?</strong>
                <p>Calibrate your device&apos;s compass by moving it in a figure-8 pattern.</p>
              </div>
              <div className={styles.troubleItem}>
                <strong>Performance issues?</strong>
                <p>Close other apps and ensure you have a stable internet connection.</p>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Keyboard Shortcuts</h3>
            <div className={styles.shortcuts}>
              <div className={styles.shortcut}>
                <kbd className={styles.kbd}>ESC</kbd>
                <span>Close overlays and modals</span>
              </div>
              <div className={styles.shortcut}>
                <kbd className={styles.kbd}>?</kbd>
                <span>Toggle help (this overlay)</span>
              </div>
              <div className={styles.shortcut}>
                <kbd className={styles.kbd}>H</kbd>
                <span>Return to home page</span>
              </div>
            </div>
          </section>

          {/* Additional Resources */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Learn More</h3>
            <div className={styles.links}>
              <a href="/#faq" className={styles.link} onClick={onClose}>
                View FAQ
              </a>
              <a href="/" className={styles.link} onClick={onClose}>
                Back to Home
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.hint}>Press ESC or tap outside to close</p>
        </div>
      </div>
    </div>
  )
}
