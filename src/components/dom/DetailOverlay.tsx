'use client'

import { useEffect, useState } from 'react'
import { useStarStore } from '@/lib/store'
import styles from './DetailOverlay.module.css'

/**
 * DetailOverlay Component (HP-10)
 *
 * Displays detailed information about a selected celestial body (star or planet).
 * Appears as a slide-up card when user taps a star or planet in the AR view.
 *
 * ## Features
 * - Subscribe to Zustand store for selected body
 * - Display comprehensive celestial data
 * - Smooth slide-up animation
 * - Dismissible via close button or backdrop click
 * - Matches landing page design theme
 *
 * ## Data Display
 * - **Stars**: Name, HIP number, magnitude, constellation, distance, RA/Dec
 * - **Planets**: Name, distance from Earth, RA/Dec coordinates
 *
 * @example
 * ```tsx
 * <DetailOverlay />
 * ```
 */
export function DetailOverlay() {
  const selectedBody = useStarStore((state) => state.selectedBody)
  const clearSelection = useStarStore((state) => state.clearSelection)
  const [isVisible, setIsVisible] = useState(false)

  // Trigger slide-up animation when a body is selected
  useEffect(() => {
    if (selectedBody) {
      // Small delay to ensure smooth animation
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [selectedBody])

  // Handle backdrop click to dismiss
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      clearSelection()
    }
  }

  // Handle close button click
  const handleClose = () => {
    clearSelection()
  }

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBody) {
        clearSelection()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedBody, clearSelection])

  // Don't render if no body is selected
  if (!selectedBody) {
    return null
  }

  // Format numbers for display
  const formatRA = (ra: number): string => {
    const hours = Math.floor(ra)
    const minutes = Math.floor((ra - hours) * 60)
    const seconds = Math.floor(((ra - hours) * 60 - minutes) * 60)
    return `${hours}h ${minutes}m ${seconds}s`
  }

  const formatDec = (dec: number): string => {
    const degrees = Math.floor(Math.abs(dec))
    const minutes = Math.floor((Math.abs(dec) - degrees) * 60)
    const seconds = Math.floor(((Math.abs(dec) - degrees) * 60 - minutes) * 60)
    const sign = dec >= 0 ? '+' : '-'
    return `${sign}${degrees}° ${minutes}' ${seconds}"`
  }

  const formatDistance = (dist?: number, type?: 'star' | 'planet'): string => {
    if (!dist) return 'Unknown'
    // Planets are in AU, stars are in light-years
    if (type === 'planet') {
      return `${dist.toFixed(3)} AU`
    }
    return `${dist.toFixed(1)} light-years`
  }

  return (
    <div
      className={`${styles.backdrop} ${isVisible ? styles.backdropVisible : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-overlay-title"
    >
      <div className={`${styles.card} ${isVisible ? styles.cardVisible : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 id="detail-overlay-title" className={styles.title}>
              {selectedBody.name}
            </h2>
            <span className={styles.badge}>
              {selectedBody.type === 'star' ? '⭐ Star' : '🪐 Planet'}
            </span>
          </div>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close details"
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

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.infoGrid}>
            {/* Hipparcos Number (Stars only) */}
            {selectedBody.type === 'star' && selectedBody.hip && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>HIP Number</span>
                <span className={styles.infoValue}>{selectedBody.hip}</span>
              </div>
            )}

            {/* Magnitude (Stars only) */}
            {selectedBody.type === 'star' && selectedBody.mag !== undefined && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Magnitude</span>
                <span className={styles.infoValue}>{selectedBody.mag.toFixed(2)}</span>
              </div>
            )}

            {/* Constellation (Stars only) */}
            {selectedBody.type === 'star' && selectedBody.con && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Constellation</span>
                <span className={styles.infoValue}>{selectedBody.con}</span>
              </div>
            )}

            {/* Distance */}
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Distance</span>
              <span className={styles.infoValue}>
                {formatDistance(selectedBody.dist, selectedBody.type)}
              </span>
            </div>

            {/* Right Ascension */}
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Right Ascension</span>
              <span className={styles.infoValue}>{formatRA(selectedBody.ra)}</span>
            </div>

            {/* Declination */}
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Declination</span>
              <span className={styles.infoValue}>{formatDec(selectedBody.dec)}</span>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className={styles.footer}>
          <p className={styles.hint}>
            Tap outside or press ESC to close
          </p>
        </div>
      </div>
    </div>
  )
}
