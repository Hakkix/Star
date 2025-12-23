'use client'

import { useEffect, useRef } from 'react'
import { useStarStore, type StarStoreState, useFavorites } from '@/lib/store'
import type { CelestialBodyData } from '@/lib/store'
import styles from './FavoritesPanel.module.css'

/**
 * FavoritesPanel Component (UX-5.1)
 *
 * Displays a sidebar panel with saved favorite celestial bodies.
 * Allows users to:
 * - View their favorited stars and planets
 * - Navigate to a favorite by selecting it
 * - Remove favorites
 * - Export/import favorites list
 * - Clear all favorites
 *
 * ## Features
 * - Slide-in sidebar animation
 * - List of all favorited bodies
 * - Quick actions (select, remove)
 * - Export/import JSON functionality
 * - Empty state when no favorites
 *
 * @example
 * ```tsx
 * <FavoritesPanel isOpen={true} onClose={() => {}} />
 * ```
 */

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FavoritesPanel({ isOpen, onClose }: FavoritesPanelProps) {
  const favorites = useFavorites()
  const selectCelestialBody = useStarStore((state: StarStoreState) => state.selectCelestialBody)
  const removeFavorite = useStarStore((state: StarStoreState) => state.removeFavorite)
  const clearFavorites = useStarStore((state: StarStoreState) => state.clearFavorites)
  const exportFavorites = useStarStore((state: StarStoreState) => state.exportFavorites)
  const importFavorites = useStarStore((state: StarStoreState) => state.importFavorites)
  const loadFavorites = useStarStore((state: StarStoreState) => state.loadFavorites)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load favorites from localStorage on mount
  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle select favorite
  const handleSelect = (body: CelestialBodyData) => {
    selectCelestialBody(body)
    // Don't close panel, allow multiple selections
  }

  // Handle remove favorite
  const handleRemove = (body: CelestialBodyData, e: React.MouseEvent) => {
    e.stopPropagation()
    removeFavorite(body)
  }

  // Handle export
  const handleExport = () => {
    const data = exportFavorites()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'star-favorites.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Handle import
  const handleImport = () => {
    fileInputRef.current?.click()
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const success = importFavorites(content)
      if (success) {
        alert('Favorites imported successfully!')
      } else {
        alert('Failed to import favorites. Please check the file format.')
      }
    }
    reader.readAsText(file)

    // Reset file input
    e.target.value = ''
  }

  // Handle clear all
  const handleClearAll = () => {
    if (favorites.length === 0) return

    const confirmed = confirm(
      `Are you sure you want to remove all ${favorites.length} favorite${favorites.length === 1 ? '' : 's'}?`
    )
    if (confirmed) {
      clearFavorites()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="favorites-panel-title"
    >
      <div className={`${styles.panel} ${isOpen ? styles.panelVisible : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <h2 id="favorites-panel-title" className={styles.title}>
            ⭐ Favorites
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close favorites panel"
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

        {/* Actions Bar */}
        <div className={styles.actionsBar}>
          <button
            className={styles.actionButton}
            onClick={handleExport}
            disabled={favorites.length === 0}
            title="Export favorites to JSON file"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button
            className={styles.actionButton}
            onClick={handleImport}
            title="Import favorites from JSON file"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import
          </button>
          <button
            className={styles.actionButton}
            onClick={handleClearAll}
            disabled={favorites.length === 0}
            title="Clear all favorites"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear All
          </button>
        </div>

        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-label="Import favorites file"
        />

        {/* Favorites List */}
        <div className={styles.content}>
          {favorites.length === 0 ? (
            <div className={styles.emptyState}>
              <svg
                className={styles.emptyIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <h3 className={styles.emptyTitle}>No favorites yet</h3>
              <p className={styles.emptyText}>
                Tap the heart icon on any celestial body to add it to your favorites.
              </p>
            </div>
          ) : (
            <div className={styles.list}>
              {favorites.map((body: CelestialBodyData, index: number) => (
                <div
                  key={`${body.type}-${body.name}-${index}`}
                  className={styles.favoriteItem}
                  onClick={() => handleSelect(body)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelect(body)
                    }
                  }}
                >
                  <div className={styles.favoriteIcon}>
                    {body.type === 'star' ? '⭐' : '🪐'}
                  </div>
                  <div className={styles.favoriteInfo}>
                    <div className={styles.favoriteName}>{body.name}</div>
                    <div className={styles.favoriteDetails}>
                      {body.type === 'star' && body.con && (
                        <span className={styles.favoriteDetail}>{body.con}</span>
                      )}
                      {body.mag !== undefined && (
                        <span className={styles.favoriteDetail}>
                          Mag: {body.mag.toFixed(2)}
                        </span>
                      )}
                      {body.dist !== undefined && (
                        <span className={styles.favoriteDetail}>
                          {body.type === 'planet'
                            ? `${body.dist.toFixed(2)} AU`
                            : `${body.dist.toFixed(1)} ly`}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={(e) => handleRemove(body, e)}
                    aria-label={`Remove ${body.name} from favorites`}
                    title="Remove from favorites"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            {favorites.length} favorite{favorites.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>
    </div>
  )
}
