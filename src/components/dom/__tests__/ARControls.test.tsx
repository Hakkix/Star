import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ARControls } from '../ARControls'
import { useStarStore } from '@/lib/store'

describe('ARControls', () => {
  beforeEach(() => {
    // Reset store before each test
    useStarStore.getState().reset()
  })

  it('renders control bar with buttons', () => {
    render(<ARControls />)

    expect(screen.getByLabelText('Toggle constellation lines')).toBeDefined()
    expect(screen.getByLabelText('Toggle planets')).toBeDefined()
    expect(screen.getByLabelText('Take screenshot')).toBeDefined()
    expect(screen.getByLabelText('Open settings')).toBeDefined()
  })

  it('toggles constellation lines', () => {
    render(<ARControls />)

    const toggleButton = screen.getByLabelText('Toggle constellation lines')
    const initialState = useStarStore.getState().showConstellations

    fireEvent.click(toggleButton)

    expect(useStarStore.getState().showConstellations).toBe(!initialState)
  })

  it('toggles planets visibility', () => {
    render(<ARControls />)

    const toggleButton = screen.getByLabelText('Toggle planets')
    const initialState = useStarStore.getState().showPlanets

    fireEvent.click(toggleButton)

    expect(useStarStore.getState().showPlanets).toBe(!initialState)
  })

  it('opens settings panel', () => {
    render(<ARControls />)

    const settingsButton = screen.getByLabelText('Open settings')

    // Settings panel should not be visible initially
    expect(screen.queryByText('Display Settings')).toBeNull()

    // Click to open
    fireEvent.click(settingsButton)

    // Settings panel should now be visible
    expect(screen.getByText('Display Settings')).toBeDefined()
  })

  it('closes settings panel', () => {
    render(<ARControls />)

    // Open settings panel
    const settingsButton = screen.getByLabelText('Open settings')
    fireEvent.click(settingsButton)

    expect(screen.getByText('Display Settings')).toBeDefined()

    // Close settings panel
    const closeButton = screen.getByLabelText('Close settings')
    fireEvent.click(closeButton)

    expect(screen.queryByText('Display Settings')).toBeNull()
  })

  it('shows active state for enabled features', () => {
    // Both features should be enabled by default
    expect(useStarStore.getState().showConstellations).toBe(true)
    expect(useStarStore.getState().showPlanets).toBe(true)

    render(<ARControls />)

    const constellationButton = screen.getByLabelText('Toggle constellation lines')
    const planetsButton = screen.getByLabelText('Toggle planets')

    // Both buttons should have classes (verify they rendered)
    expect(constellationButton.className).toBeTruthy()
    expect(planetsButton.className).toBeTruthy()

    // Toggle them off and verify state changes
    fireEvent.click(constellationButton)
    expect(useStarStore.getState().showConstellations).toBe(false)

    fireEvent.click(planetsButton)
    expect(useStarStore.getState().showPlanets).toBe(false)

    // Toggle them back on
    fireEvent.click(constellationButton)
    expect(useStarStore.getState().showConstellations).toBe(true)

    fireEvent.click(planetsButton)
    expect(useStarStore.getState().showPlanets).toBe(true)
  })

  it('displays screenshot alert', () => {
    // Create a mock alert function
    const originalAlert = window.alert
    window.alert = vi.fn()

    render(<ARControls />)

    const screenshotButton = screen.getByLabelText('Take screenshot')
    fireEvent.click(screenshotButton)

    expect(window.alert).toHaveBeenCalledWith('Screenshot feature coming soon!')

    // Restore original alert
    window.alert = originalAlert
  })

  it('settings panel shows current state', () => {
    render(<ARControls />)

    // Open settings
    const settingsButton = screen.getByLabelText('Open settings')
    fireEvent.click(settingsButton)

    // Check initial states (both should be true by default)
    expect(screen.getByText('Enabled')).toBeDefined()
    expect(screen.getByText('Visible')).toBeDefined()
  })

  it('toggle switches work in settings panel', () => {
    render(<ARControls />)

    // Open settings
    const settingsButton = screen.getByLabelText('Open settings')
    fireEvent.click(settingsButton)

    // Find toggle switches
    const toggles = screen.getAllByRole('switch')
    const constellationToggle = toggles[0]
    const planetToggle = toggles[1]

    // Test constellation toggle
    const initialConstellations = useStarStore.getState().showConstellations
    fireEvent.click(constellationToggle)
    expect(useStarStore.getState().showConstellations).toBe(!initialConstellations)

    // Test planet toggle
    const initialPlanets = useStarStore.getState().showPlanets
    fireEvent.click(planetToggle)
    expect(useStarStore.getState().showPlanets).toBe(!initialPlanets)
  })
})
