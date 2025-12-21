/**
 * Tests for Overlay component
 * Verifies component behavior for permission requests, loading, and error states
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
import { Overlay } from '@/components/dom/Overlay';

describe('Overlay Component', () => {
  test('renders permission request UI when permission not granted', () => {
    render(<Overlay permissionGranted={false} />);

    expect(screen.getByRole('heading', { name: /star ar requires permissions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enable device orientation/i })).toBeInTheDocument();
  });

  test('calls onRequestPermission when button clicked', async () => {
    const user = userEvent.setup();
    const mockRequestPermission = vi.fn();

    render(<Overlay permissionGranted={false} onRequestPermission={mockRequestPermission} />);

    const button = screen.getByRole('button', { name: /enable device orientation/i });
    await user.click(button);

    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  test('does not render overlay when permission granted', () => {
    render(<Overlay permissionGranted={true} />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders loading state', () => {
    render(<Overlay showLoading={true} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading star map/i)).toBeInTheDocument();
  });

  test('loading state has proper ARIA attributes', () => {
    render(<Overlay showLoading={true} />);

    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toHaveAttribute('aria-live', 'polite');
  });

  test('renders error message when provided', () => {
    const errorMessage = 'Failed to load star catalog';
    render(<Overlay errorMessage={errorMessage} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  test('error state has proper ARIA attributes', () => {
    render(<Overlay errorMessage="Something went wrong" />);

    const errorElement = screen.getByRole('alert');
    expect(errorElement).toHaveAttribute('aria-live', 'assertive');
  });

  test('permission button is keyboard accessible', async () => {
    const user = userEvent.setup();
    const mockRequestPermission = vi.fn();

    render(<Overlay permissionGranted={false} onRequestPermission={mockRequestPermission} />);

    const button = screen.getByRole('button', { name: /enable device orientation/i });

    // Focus the button
    await user.tab();
    expect(button).toHaveFocus();

    // Press Enter
    await user.keyboard('{Enter}');
    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  test('loading takes precedence over permission UI', () => {
    render(<Overlay showLoading={true} permissionGranted={false} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('error takes precedence over permission UI', () => {
    render(<Overlay errorMessage="Error occurred" permissionGranted={false} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('error takes precedence over loading', () => {
    render(<Overlay errorMessage="Error occurred" showLoading={true} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('Overlay Component - Accessibility', () => {
  test('has descriptive text explaining why permissions are needed', () => {
    render(<Overlay permissionGranted={false} />);

    expect(
      screen.getByText(/to view the star map, we need access to your device orientation and location/i)
    ).toBeInTheDocument();
  });

  test('button has clear action label', () => {
    render(<Overlay permissionGranted={false} />);

    const button = screen.getByRole('button', { name: /enable device orientation/i });
    expect(button).toHaveAccessibleName();
  });

  test('error messages are announced to screen readers', () => {
    render(<Overlay errorMessage="GPS unavailable" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  test('loading state is announced to screen readers', () => {
    render(<Overlay showLoading={true} />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});

describe('Overlay Component - State Transitions', () => {
  test('transitions from loading to permission request', () => {
    const { rerender } = render(<Overlay showLoading={true} />);

    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Overlay showLoading={false} permissionGranted={false} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enable/i })).toBeInTheDocument();
  });

  test('transitions from permission request to hidden (permission granted)', () => {
    const { rerender } = render(<Overlay permissionGranted={false} />);

    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Overlay permissionGranted={true} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('transitions from any state to error', () => {
    const { rerender } = render(<Overlay permissionGranted={true} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<Overlay errorMessage="Network error" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('Overlay Component - iOS Specific', () => {
  test('mentions device orientation for iOS users', () => {
    render(<Overlay permissionGranted={false} />);

    // iOS 13+ requires explicit permission for DeviceOrientationEvent
    const elements = screen.getAllByText(/device orientation/i);
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0]).toBeInTheDocument();
  });
});
