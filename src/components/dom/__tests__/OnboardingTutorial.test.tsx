/**
 * Tests for OnboardingTutorial component (UX-3.1)
 * Verifies tutorial flow, navigation, localStorage tracking, and skip functionality
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import { OnboardingTutorial } from '@/components/dom/OnboardingTutorial';

const STORAGE_KEY = 'star-ar-tutorial-completed';

describe('OnboardingTutorial Component', () => {
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Visibility Logic', () => {
    test('shows tutorial when not completed before', () => {
      render(<OnboardingTutorial />);

      expect(screen.getByText('Point at the Sky')).toBeInTheDocument();
    });

    test('does not show tutorial when already completed', () => {
      localStorageMock[STORAGE_KEY] = 'true';

      const { container } = render(<OnboardingTutorial />);

      expect(container).toBeEmptyDOMElement();
    });

    test('shows tutorial when forceShow is true even if completed', () => {
      localStorageMock[STORAGE_KEY] = 'true';

      render(<OnboardingTutorial forceShow={true} />);

      expect(screen.getByText('Point at the Sky')).toBeInTheDocument();
    });
  });

  describe('Step Navigation', () => {
    test('renders first step initially', () => {
      render(<OnboardingTutorial />);

      expect(screen.getByText('Point at the Sky')).toBeInTheDocument();
      expect(screen.getByText(/Hold your device up and point it toward the sky/)).toBeInTheDocument();
      expect(screen.getByText('🌌')).toBeInTheDocument();
    });

    test('can navigate to next step', async () => {
      const user = userEvent.setup();
      render(<OnboardingTutorial />);

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Tap to Explore')).toBeInTheDocument();
      });
    });

    test('can navigate back to previous step', async () => {
      const user = userEvent.setup();
      render(<OnboardingTutorial />);

      // Go to step 2
      const nextButton = screen.getByRole('button', { name: /Next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Tap to Explore')).toBeInTheDocument();
      });

      // Go back to step 1
      const backButton = screen.getByRole('button', { name: /Back/i });
      await user.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Point at the Sky')).toBeInTheDocument();
      });
    });

    test('does not show back button on first step', () => {
      render(<OnboardingTutorial />);

      expect(screen.queryByRole('button', { name: /Back/i })).not.toBeInTheDocument();
    });

    test('shows all three steps in sequence', async () => {
      const user = userEvent.setup();
      render(<OnboardingTutorial />);

      // Step 1
      expect(screen.getByText('Point at the Sky')).toBeInTheDocument();

      // Navigate to step 2
      await user.click(screen.getByRole('button', { name: /Next/i }));
      await waitFor(() => {
        expect(screen.getByText('Tap to Explore')).toBeInTheDocument();
      });

      // Navigate to step 3
      await user.click(screen.getByRole('button', { name: /Next/i }));
      await waitFor(() => {
        expect(screen.getByText('Move Around')).toBeInTheDocument();
      });
    });

    test('shows "Start Exploring" button on last step', async () => {
      const user = userEvent.setup();
      render(<OnboardingTutorial />);

      // Navigate to last step
      await user.click(screen.getByRole('button', { name: /Next/i }));
      await user.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Start Exploring/i })).toBeInTheDocument();
      });
    });
  });

  describe('Step Indicators', () => {
    test('renders correct number of step indicators', () => {
      const { container } = render(<OnboardingTutorial />);

      // Should have 3 step indicator dots
      const stepIndicators = container.querySelectorAll('[style*="borderRadius"]');
      expect(stepIndicators.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Tutorial Completion', () => {
    test('calls onComplete when finishing tutorial', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingTutorial onComplete={onComplete} />);

      // Navigate to last step
      await user.click(screen.getByRole('button', { name: /Next/i }));
      await user.click(screen.getByRole('button', { name: /Next/i }));

      // Click "Start Exploring"
      await user.click(screen.getByRole('button', { name: /Start Exploring/i }));

      expect(onComplete).toHaveBeenCalled();
    });

    test('saves to localStorage when "don\'t show again" is checked', async () => {
      const user = userEvent.setup();
      render(<OnboardingTutorial />);

      // Navigate to last step
      await user.click(screen.getByRole('button', { name: /Next/i }));
      await user.click(screen.getByRole('button', { name: /Next/i }));

      // Check "don't show again"
      const checkbox = screen.getByRole('checkbox', { name: /Don't show this tutorial again/i });
      await user.click(checkbox);

      // Complete tutorial
      await user.click(screen.getByRole('button', { name: /Start Exploring/i }));

      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'true');
    });

    test('does not save to localStorage if "don\'t show again" is not checked', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingTutorial onComplete={onComplete} />);

      // Navigate to last step
      await user.click(screen.getByRole('button', { name: /Next/i }));
      await user.click(screen.getByRole('button', { name: /Next/i }));

      // Complete tutorial WITHOUT checking "don't show again"
      await user.click(screen.getByRole('button', { name: /Start Exploring/i }));

      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('Skip Functionality', () => {
    test('shows skip button on first step', () => {
      render(<OnboardingTutorial />);

      expect(screen.getByRole('button', { name: /Skip tutorial/i })).toBeInTheDocument();
    });

    test('shows skip button on middle steps', async () => {
      const user = userEvent.setup();
      render(<OnboardingTutorial />);

      await user.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Skip tutorial/i })).toBeInTheDocument();
      });
    });

    test('does not show skip button on last step', async () => {
      const user = userEvent.setup();
      render(<OnboardingTutorial />);

      // Navigate to last step
      await user.click(screen.getByRole('button', { name: /Next/i }));
      await user.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Skip tutorial/i })).not.toBeInTheDocument();
      });
    });

    test('saves to localStorage and calls onComplete when skipped', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<OnboardingTutorial onComplete={onComplete} />);

      await user.click(screen.getByRole('button', { name: /Skip tutorial/i }));

      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'true');
      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('Content Validation', () => {
    test('displays correct content for step 1', () => {
      render(<OnboardingTutorial />);

      expect(screen.getByText('Point at the Sky')).toBeInTheDocument();
      expect(screen.getByText(/Hold your device up and point it toward the sky/)).toBeInTheDocument();
    });

    test('displays correct content for step 2', async () => {
      const user = userEvent.setup();
      render(<OnboardingTutorial />);

      await user.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(() => {
        expect(screen.getByText('Tap to Explore')).toBeInTheDocument();
        expect(screen.getByText(/Tap any star or planet to learn more/)).toBeInTheDocument();
      });
    });

    test('displays correct content for step 3', async () => {
      const user = userEvent.setup();
      render(<OnboardingTutorial />);

      await user.click(screen.getByRole('button', { name: /Next/i }));
      await user.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(() => {
        expect(screen.getByText('Move Around')).toBeInTheDocument();
        expect(screen.getByText(/Move your device slowly to explore/)).toBeInTheDocument();
      });
    });
  });

  describe('Checkbox Interaction', () => {
    test('checkbox is initially unchecked', async () => {
      const user = userEvent.setup();
      render(<OnboardingTutorial />);

      // Navigate to last step
      await user.click(screen.getByRole('button', { name: /Next/i }));
      await user.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /Don't show this tutorial again/i });
        expect(checkbox).not.toBeChecked();
      });
    });

    test('checkbox can be checked and unchecked', async () => {
      const user = userEvent.setup();
      render(<OnboardingTutorial />);

      // Navigate to last step
      await user.click(screen.getByRole('button', { name: /Next/i }));
      await user.click(screen.getByRole('button', { name: /Next/i }));

      await waitFor(async () => {
        const checkbox = screen.getByRole('checkbox', { name: /Don't show this tutorial again/i });

        // Check it
        await user.click(checkbox);
        expect(checkbox).toBeChecked();

        // Uncheck it
        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles localStorage errors gracefully when reading', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage not available');
      });

      // Should still render (fallback to showing tutorial)
      render(<OnboardingTutorial />);

      expect(screen.getByText('Point at the Sky')).toBeInTheDocument();
      consoleWarnSpy.mockRestore();
    });

    test('handles localStorage errors gracefully when writing', async () => {
      const user = userEvent.setup();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      global.localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage not available');
      });

      render(<OnboardingTutorial />);

      // Try to skip (which tries to write to localStorage)
      await user.click(screen.getByRole('button', { name: /Skip tutorial/i }));

      // Should log warning but not crash
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });
});
