import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HelpOverlay } from '../HelpOverlay'

describe('HelpOverlay', () => {
  it('renders help overlay with title', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    expect(screen.getByText('Help & Tips')).toBeDefined()
  })

  it('displays quick tips section', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    expect(screen.getByText('Quick Tips')).toBeDefined()
    expect(screen.getByText(/Point your device at the sky/)).toBeDefined()
    expect(screen.getByText(/Tap any star or planet/)).toBeDefined()
  })

  it('displays troubleshooting section', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    expect(screen.getByText('Troubleshooting')).toBeDefined()
    expect(screen.getByText('Stars not moving?')).toBeDefined()
    expect(screen.getByText(/device orientation permissions/)).toBeDefined()
  })

  it('displays keyboard shortcuts section', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    expect(screen.getByText('Keyboard Shortcuts')).toBeDefined()
    expect(screen.getByText('ESC')).toBeDefined()
    expect(screen.getByText('?')).toBeDefined()
    expect(screen.getByText('H')).toBeDefined()
  })

  it('displays learn more section with links', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    expect(screen.getByText('Learn More')).toBeDefined()
    expect(screen.getByText('View FAQ')).toBeDefined()
    expect(screen.getByText('Back to Home')).toBeDefined()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close help')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    const backdrop = screen.getByRole('dialog')
    fireEvent.click(backdrop)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when clicking inside overlay content', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    const title = screen.getByText('Help & Tips')
    fireEvent.click(title)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has proper ARIA attributes', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBe('help-overlay-title')
  })

  it('calls onClose when FAQ link is clicked', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    const faqLink = screen.getByText('View FAQ')
    fireEvent.click(faqLink)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when home link is clicked', () => {
    const onClose = vi.fn()
    render(<HelpOverlay onClose={onClose} />)

    const homeLink = screen.getByText('Back to Home')
    fireEvent.click(homeLink)

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
