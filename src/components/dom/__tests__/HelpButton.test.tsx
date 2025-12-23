import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HelpButton } from '../HelpButton'

describe('HelpButton', () => {
  it('renders help button', () => {
    render(<HelpButton />)
    const button = screen.getByLabelText('Open help')
    expect(button).toBeDefined()
  })

  it('opens help overlay when clicked', () => {
    render(<HelpButton />)
    const button = screen.getByLabelText('Open help')

    // Help overlay should not be visible initially
    expect(screen.queryByText('Help & Tips')).toBeNull()

    // Click button
    fireEvent.click(button)

    // Help overlay should now be visible
    expect(screen.getByText('Help & Tips')).toBeDefined()
  })

  it('closes help overlay when close button is clicked', () => {
    render(<HelpButton />)
    const openButton = screen.getByLabelText('Open help')

    // Open help overlay
    fireEvent.click(openButton)
    expect(screen.getByText('Help & Tips')).toBeDefined()

    // Close help overlay
    const closeButton = screen.getByLabelText('Close help')
    fireEvent.click(closeButton)

    // Help overlay should be hidden
    expect(screen.queryByText('Help & Tips')).toBeNull()
  })

  it('has proper ARIA attributes', () => {
    render(<HelpButton />)
    const button = screen.getByLabelText('Open help')

    // Should have aria-expanded=false initially
    expect(button.getAttribute('aria-expanded')).toBe('false')

    // Click to open
    fireEvent.click(button)

    // Should have aria-expanded=true when open
    expect(button.getAttribute('aria-expanded')).toBe('true')
  })

  it('toggles help overlay on multiple clicks', () => {
    render(<HelpButton />)
    const button = screen.getByLabelText('Open help')

    // Open
    fireEvent.click(button)
    expect(screen.getByText('Help & Tips')).toBeDefined()

    // Close
    fireEvent.click(button)
    expect(screen.queryByText('Help & Tips')).toBeNull()

    // Open again
    fireEvent.click(button)
    expect(screen.getByText('Help & Tips')).toBeDefined()
  })
})
