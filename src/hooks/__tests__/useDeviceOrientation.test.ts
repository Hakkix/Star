/**
 * Tests for useDeviceOrientation hook
 * Verifies hook behavior when interacting with DeviceOrientation API
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import {
  mockDeviceOrientation,
  resetSensorMocks,
} from '@/test/mocks/sensors';

/**
 * Type definitions for testing purposes
 */
interface WindowWithDeviceOrientation extends Window {
  DeviceOrientationEvent?: typeof DeviceOrientationEvent;
}

interface DeviceOrientationEventConstructor {
  requestPermission?: () => Promise<PermissionState>;
}

describe('useDeviceOrientation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetSensorMocks();
  });

  test('initially returns null orientation values on iOS (permission required)', () => {
    // Mock iOS environment (requires permission)
    mockDeviceOrientation({ alpha: 45, beta: 10, gamma: 5 });

    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.alpha).toBeNull();
    expect(result.current.beta).toBeNull();
    expect(result.current.gamma).toBeNull();
    expect(result.current.permission).toBe('prompt');
  });

  test('successfully retrieves orientation after permission granted', async () => {
    const orientationData = { alpha: 45, beta: 10, gamma: 5 };
    const mock = mockDeviceOrientation(orientationData);

    const { result } = renderHook(() => useDeviceOrientation());

    // Request permission
    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.permission).toBe('granted');

    // Dispatch orientation event
    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.alpha).toBe(45);
      expect(result.current.beta).toBe(10);
      expect(result.current.gamma).toBe(5);
    });
  });

  test('handles permission denial', async () => {
    const mock = mockDeviceOrientation({ alpha: 45, beta: 10, gamma: 5 });

    // Override to return 'denied'
    mock.requestPermission.mockResolvedValue('denied' as PermissionState);

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.permission).toBe('denied');
    expect(result.current.error).toBe('Permission denied by user');
  });

  test('updates orientation values when device moves', async () => {
    const mock = mockDeviceOrientation({ alpha: 0, beta: 0, gamma: 0 });

    const { result } = renderHook(() => useDeviceOrientation());

    // Grant permission
    await act(async () => {
      await result.current.requestPermission();
    });

    // First orientation
    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.alpha).toBe(0);
    });

    // Update orientation
    mock.event.alpha = 90;
    mock.event.beta = 45;
    mock.event.gamma = -10;

    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.alpha).toBe(90);
      expect(result.current.beta).toBe(45);
      expect(result.current.gamma).toBe(-10);
    });
  });

  test('handles null orientation values from sensor', async () => {
    const mock = mockDeviceOrientation({ alpha: null, beta: null, gamma: null });

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.alpha).toBeNull();
      expect(result.current.beta).toBeNull();
      expect(result.current.gamma).toBeNull();
    });
  });

  test('handles edge case: full rotation (0-360° alpha)', async () => {
    const mock = mockDeviceOrientation({ alpha: 359.9, beta: 0, gamma: 0 });

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.alpha).toBeCloseTo(359.9);
    });
  });

  test('handles edge case: beta rotation limits (-180 to 180°)', async () => {
    const mock = mockDeviceOrientation({ alpha: 0, beta: 180, gamma: 0 });

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.beta).toBe(180);
    });
  });

  test('handles edge case: gamma rotation limits (-90 to 90°)', async () => {
    const mock = mockDeviceOrientation({ alpha: 0, beta: 0, gamma: -90 });

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.gamma).toBe(-90);
    });
  });

  test('cleans up event listener on unmount', async () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    mockDeviceOrientation({ alpha: 45, beta: 10, gamma: 5 });

    const { result, unmount } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'deviceorientation',
      expect.any(Function)
    );
  });

  test('handles multiple rapid orientation changes', async () => {
    const mock = mockDeviceOrientation({ alpha: 0, beta: 0, gamma: 0 });

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    // Rapid updates
    for (let i = 0; i < 10; i++) {
      mock.event.alpha = i * 10;
      act(() => {
        mock.dispatchEvent();
      });
    }

    await waitFor(() => {
      expect(result.current.alpha).toBe(90);
    });
  });
});

describe('useDeviceOrientation Hook - Browser Compatibility', () => {
  test('handles missing DeviceOrientation API', () => {
    // Save original
    const originalDeviceOrientationEvent = (window as WindowWithDeviceOrientation).DeviceOrientationEvent;

    // Remove DeviceOrientationEvent
    delete (window as WindowWithDeviceOrientation).DeviceOrientationEvent;

    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.permission).toBe('unsupported');

    // Restore
    (window as WindowWithDeviceOrientation).DeviceOrientationEvent = originalDeviceOrientationEvent;
  });

  test('handles Android-style (no permission required)', async () => {
    const mock = mockDeviceOrientation({ alpha: 45, beta: 10, gamma: 5 });

    // Remove requestPermission (simulate Android)
    delete (DeviceOrientationEvent as unknown as DeviceOrientationEventConstructor).requestPermission;

    const { result } = renderHook(() => useDeviceOrientation());

    // Should auto-grant on Android
    expect(result.current.permission).toBe('granted');

    // Should be able to receive events immediately
    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.alpha).toBe(45);
    });
  });

  test('handles permission request error', async () => {
    const mock = mockDeviceOrientation({ alpha: 45, beta: 10, gamma: 5 });

    // Override to throw error
    mock.requestPermission.mockRejectedValue(new Error('NotAllowedError'));

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.permission).toBe('denied');
    expect(result.current.error).toBe('NotAllowedError');
  });
});

describe('useDeviceOrientation Hook - Real-world Scenarios', () => {
  test('simulates phone held upright (portrait)', async () => {
    const mock = mockDeviceOrientation({
      alpha: 0, // Facing north
      beta: 90, // Standing upright
      gamma: 0, // Not tilted left/right
    });

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.alpha).toBe(0);
      expect(result.current.beta).toBe(90);
      expect(result.current.gamma).toBe(0);
    });
  });

  test('simulates phone lying flat', async () => {
    const mock = mockDeviceOrientation({
      alpha: 180,
      beta: 0, // Flat on table
      gamma: 0,
    });

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.beta).toBe(0);
    });
  });

  test('simulates compass heading change', async () => {
    const mock = mockDeviceOrientation({ alpha: 0, beta: 90, gamma: 0 });

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    // Start facing north
    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.alpha).toBe(0);
    });

    // Rotate to east
    mock.event.alpha = 90;
    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.alpha).toBe(90);
    });

    // Rotate to south
    mock.event.alpha = 180;
    act(() => {
      mock.dispatchEvent();
    });

    await waitFor(() => {
      expect(result.current.alpha).toBe(180);
    });
  });
});
