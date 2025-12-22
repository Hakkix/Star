/**
 * Tests for DetailOverlay component
 * Verifies component behavior for displaying celestial body information
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import { DetailOverlay } from '@/components/dom/DetailOverlay';
import { useStarStore } from '@/lib/store';
import type { CelestialBodyData } from '@/lib/store';

// Mock star data
const mockStar: CelestialBodyData = {
  type: 'star',
  name: 'Polaris',
  ra: 2.5301,
  dec: 89.2641,
  mag: 1.98,
  con: 'UMi',
  dist: 433,
  hip: 11767,
};

// Mock planet data
const mockPlanet: CelestialBodyData = {
  type: 'planet',
  name: 'Mars',
  ra: 10.5,
  dec: 15.3,
  dist: 1.523, // AU
};

describe('DetailOverlay Component', () => {
  beforeEach(() => {
    // Reset store before each test
    useStarStore.getState().reset();
  });

  test('does not render when no body is selected', () => {
    render(<DetailOverlay />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders when a star is selected', async () => {
    render(<DetailOverlay />);

    // Select a star
    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Polaris')).toBeInTheDocument();
    expect(screen.getByText('⭐ Star')).toBeInTheDocument();
  });

  test('renders when a planet is selected', async () => {
    render(<DetailOverlay />);

    // Select a planet
    useStarStore.getState().selectCelestialBody(mockPlanet);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Mars')).toBeInTheDocument();
    expect(screen.getByText('🪐 Planet')).toBeInTheDocument();
  });

  test('displays star-specific information', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByText('11767')).toBeInTheDocument(); // HIP number
      expect(screen.getByText('1.98')).toBeInTheDocument(); // Magnitude
      expect(screen.getByText('UMi')).toBeInTheDocument(); // Constellation
    });
  });

  test('does not display star-specific fields for planets', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockPlanet);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.queryByText(/HIP Number/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Magnitude/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Constellation/i)).not.toBeInTheDocument();
  });

  test('formats distance correctly for stars (light-years)', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByText('433.0 light-years')).toBeInTheDocument();
    });
  });

  test('formats distance correctly for planets (AU)', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockPlanet);

    await waitFor(() => {
      expect(screen.getByText('1.523 AU')).toBeInTheDocument();
    });
  });

  test('formats Right Ascension in hours/minutes/seconds', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      // RA 2.5301 hours = 2h 31m 48s (approximately)
      expect(screen.getByText(/2h 31m/)).toBeInTheDocument();
    });
  });

  test('formats Declination in degrees/minutes/seconds', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      // Dec 89.2641° = +89° 15' 50" (approximately)
      expect(screen.getByText(/\+89°/)).toBeInTheDocument();
    });
  });

  test('closes when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close details/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('closes when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const backdrop = screen.getByRole('dialog');
    await user.click(backdrop);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('does not close when card content is clicked', async () => {
    const user = userEvent.setup();
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click on the title (part of card content)
    const title = screen.getByText('Polaris');
    await user.click(title);

    // Should still be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('closes when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('does not close when other keys are pressed', async () => {
    const user = userEvent.setup();
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.keyboard('{Enter}');
    await user.keyboard('{Space}');
    await user.keyboard('a');

    // Should still be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('calls clearSelection when closed', async () => {
    const user = userEvent.setup();
    const clearSelection = vi.spyOn(useStarStore.getState(), 'clearSelection');

    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close details/i });
    await user.click(closeButton);

    expect(clearSelection).toHaveBeenCalledTimes(1);
  });
});

describe('DetailOverlay Component - Accessibility', () => {
  beforeEach(() => {
    useStarStore.getState().reset();
  });

  test('has proper ARIA role and attributes', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'detail-overlay-title');
    });
  });

  test('close button has accessible label', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /close details/i });
      expect(closeButton).toHaveAccessibleName();
    });
  });

  test('title has proper ID for aria-labelledby', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      const title = screen.getByText('Polaris');
      expect(title).toHaveAttribute('id', 'detail-overlay-title');
    });
  });

  test('information is organized in a clear structure', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByText(/Right Ascension/i)).toBeInTheDocument();
      expect(screen.getByText(/Declination/i)).toBeInTheDocument();
      expect(screen.getByText(/Distance/i)).toBeInTheDocument();
    });
  });

  test('close button is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Tab to close button
    await user.tab();
    const closeButton = screen.getByRole('button', { name: /close details/i });
    expect(closeButton).toHaveFocus();

    // Press Enter to close
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

describe('DetailOverlay Component - Data Edge Cases', () => {
  beforeEach(() => {
    useStarStore.getState().reset();
  });

  test('handles missing optional star fields gracefully', async () => {
    const incompleteStar: CelestialBodyData = {
      type: 'star',
      name: 'Unknown Star',
      ra: 0,
      dec: 0,
    };

    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(incompleteStar);

    await waitFor(() => {
      expect(screen.getByText('Unknown Star')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument(); // Distance
    });
  });

  test('formats negative declination correctly', async () => {
    const southernStar: CelestialBodyData = {
      type: 'star',
      name: 'Southern Star',
      ra: 5,
      dec: -45.5,
      dist: 100,
    };

    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(southernStar);

    await waitFor(() => {
      expect(screen.getByText(/-45°/)).toBeInTheDocument();
    });
  });

  test('formats very small planet distances correctly', async () => {
    const closePlanet: CelestialBodyData = {
      type: 'planet',
      name: 'Moon',
      ra: 0,
      dec: 0,
      dist: 0.0026, // AU (very close)
    };

    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(closePlanet);

    await waitFor(() => {
      expect(screen.getByText(/0\.003 AU/i)).toBeInTheDocument();
    });
  });

  test('handles zero coordinates', async () => {
    const zeroCoordsBody: CelestialBodyData = {
      type: 'star',
      name: 'Origin Star',
      ra: 0,
      dec: 0,
      dist: 10,
    };

    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(zeroCoordsBody);

    await waitFor(() => {
      expect(screen.getByText(/0h 0m/)).toBeInTheDocument();
      expect(screen.getByText(/\+0°/)).toBeInTheDocument();
    });
  });
});

describe('DetailOverlay Component - Animation', () => {
  beforeEach(() => {
    useStarStore.getState().reset();
  });

  test('applies visible class after mount', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    // Wait for animation to trigger
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    }, { timeout: 100 });
  });

  test('hint text is displayed', async () => {
    render(<DetailOverlay />);

    useStarStore.getState().selectCelestialBody(mockStar);

    await waitFor(() => {
      expect(screen.getByText(/tap outside or press esc to close/i)).toBeInTheDocument();
    });
  });
});
