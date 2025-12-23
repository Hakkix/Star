'use client'

import { useState } from 'react'
import styles from './HelpButton.module.css'
import { HelpOverlay } from './HelpOverlay'

/**
 * HelpButton Component (UX-3.2)
 *
 * Floating help button that appears in the bottom-right corner of the AR view.
 * Opens the HelpOverlay when clicked.
 *
 * ## Features
 * - Floating "?" button
 * - Opens help overlay on click
 * - Accessible with proper ARIA labels
 * - Dismissible without blocking AR view
 *
 * @example
 * ```tsx
 * <HelpButton />
 * ```
 */
export function HelpButton() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const handleToggleHelp = () => {
    setIsHelpOpen((prev) => !prev)
  }

  const handleCloseHelp = () => {
    setIsHelpOpen(false)
  }

  return (
    <>
      <button
        className={styles.helpButton}
        onClick={handleToggleHelp}
        aria-label="Open help"
        aria-expanded={isHelpOpen}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.icon}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {isHelpOpen && <HelpOverlay onClose={handleCloseHelp} />}
    </>
  )
}
