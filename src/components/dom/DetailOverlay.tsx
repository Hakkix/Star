'use client'

import { useEffect, useState } from 'react'
import { useStarStore, type StarStoreState } from '@/lib/store'
import type { CelestialBodyData } from '@/lib/store'
import styles from './DetailOverlay.module.css'

/**
 * DetailOverlay Component (HP-10 + UX-3.3)
 *
 * Enhanced detail overlay displaying information about selected celestial bodies.
 * Appears as a slide-up card when user taps a star or planet in the AR view.
 *
 * ## Features (HP-10)
 * - Subscribe to Zustand store for selected body
 * - Display comprehensive celestial data
 * - Smooth slide-up animation
 * - Dismissible via close button or backdrop click
 * - Matches landing page design theme
 *
 * ## Enhanced Features (UX-3.3)
 * - Description/information about the celestial body
 * - Share button (copy coordinates/name to clipboard)
 * - Favorite/bookmark button (localStorage)
 * - "Learn more" Wikipedia link
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
  const selectedBody = useStarStore((state: StarStoreState) => state.selectedBody)
  const clearSelection = useStarStore((state: StarStoreState) => state.clearSelection)
  const toggleFavorite = useStarStore((state: StarStoreState) => state.toggleFavorite)
  const favorites = useStarStore((state: StarStoreState) => state.favorites)
  const [isVisible, setIsVisible] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Trigger slide-up animation when a body is selected
  useEffect(() => {
    if (selectedBody) {
      // Small delay to ensure smooth animation
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [selectedBody])

  // Check if current body is favorited
  const isFavorite = selectedBody
    ? favorites.some((fav: CelestialBodyData) => fav.name === selectedBody.name && fav.type === selectedBody.type)
    : false

  // Toggle favorite status
  const handleToggleFavorite = () => {
    if (!selectedBody) return
    toggleFavorite(selectedBody)
  }

  // Handle share (copy to clipboard)
  const handleShare = async () => {
    if (!selectedBody) return

    const coordinates = selectedBody.ra !== undefined && selectedBody.dec !== undefined
      ? `\nRA: ${selectedBody.ra.toFixed(4)}h, Dec: ${selectedBody.dec.toFixed(4)}°`
      : ''
    const shareText = `${selectedBody.name} (${selectedBody.type})${coordinates}\n${selectedBody.dist ? `Distance: ${formatDistance(selectedBody.dist, selectedBody.type)}` : ''}`

    try {
      await navigator.clipboard.writeText(shareText)
      setShareStatus('success')
      setTimeout(() => setShareStatus('idle'), 2000)
    } catch {
      setShareStatus('error')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }

  // Get Wikipedia link
  const getWikipediaLink = (body: CelestialBodyData): string => {
    const searchTerm = encodeURIComponent(body.name)
    return `https://en.wikipedia.org/wiki/${searchTerm}`
  }

  // Get description
  const getDescription = (body: CelestialBodyData): string => {
    if (body.type === 'planet') {
      const descriptions: Record<string, string> = {
        Sun: 'The Sun is the star at the center of our Solar System. It is a nearly perfect sphere of hot plasma, providing the energy necessary for life on Earth.',
        Moon: 'Earth\'s only natural satellite, the Moon is the fifth largest satellite in the Solar System and the largest relative to its host planet.',
        Mercury: 'The smallest planet in our Solar System and closest to the Sun. Mercury has a very thin atmosphere and experiences extreme temperature variations.',
        Venus: 'Often called Earth\'s "sister planet" due to similar size and mass. Venus has a thick, toxic atmosphere and is the hottest planet in our Solar System.',
        Mars: 'Known as the "Red Planet" due to iron oxide on its surface. Mars has the largest volcano and canyon in the Solar System.',
        Jupiter: 'The largest planet in our Solar System, a gas giant with a mass more than twice that of all other planets combined.',
        Saturn: 'Famous for its spectacular ring system, Saturn is the second-largest planet and a gas giant with dozens of moons.',
        Uranus: 'An ice giant with a unique sideways rotation. Uranus appears blue-green due to methane in its atmosphere.',
        Neptune: 'The most distant planet from the Sun, Neptune is an ice giant known for its deep blue color and supersonic winds.',
      }
      return descriptions[body.name] || 'A celestial body in our Solar System.'
    } else if (body.type === 'satellite') {
      // Satellite description
      return 'An artificial satellite orbiting Earth, currently visible in the night sky from this location.'
    } else {
      // Generic star description
      if (body.mag !== undefined && body.mag < 1) {
        return 'One of the brightest stars visible in the night sky, easily seen with the naked eye even in light-polluted areas.'
      } else if (body.mag !== undefined && body.mag < 3) {
        return 'A prominent star visible to the naked eye on clear nights, part of a well-known constellation pattern.'
      } else {
        return 'A distant star in our galaxy, part of the vast cosmic tapestry visible in the night sky.'
      }
    }
  }

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

  const formatDistance = (dist?: number, type?: 'star' | 'planet' | 'satellite'): string => {
    if (!dist) return 'Unknown'
    // Planets are in AU, stars are in light-years, satellites are in km
    if (type === 'planet') {
      return `${dist.toFixed(3)} AU`
    } else if (type === 'satellite') {
      return `${dist.toFixed(0)} km`
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
          {/* Description */}
          <div className={styles.description}>
            <p>{getDescription(selectedBody)}</p>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button
              className={`${styles.actionButton} ${isFavorite ? styles.favoriteActive : ''}`}
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
            </button>
            <button
              className={styles.actionButton}
              onClick={handleShare}
              aria-label="Share coordinates"
              title="Copy to clipboard"
            >
              {shareStatus === 'success' ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : shareStatus === 'error' ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <span>Failed</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  <span>Share</span>
                </>
              )}
            </button>
            <a
              href={getWikipediaLink(selectedBody)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionButton}
              aria-label="Learn more on Wikipedia"
              title="Learn more"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>Learn More</span>
            </a>
          </div>

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
            {selectedBody.ra !== undefined && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Right Ascension</span>
                <span className={styles.infoValue}>{formatRA(selectedBody.ra)}</span>
              </div>
            )}

            {/* Declination */}
            {selectedBody.dec !== undefined && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Declination</span>
                <span className={styles.infoValue}>{formatDec(selectedBody.dec)}</span>
              </div>
            )}
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
