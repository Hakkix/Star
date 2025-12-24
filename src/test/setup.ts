/**
 * Global test setup for Vitest
 * This file is loaded before all tests
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();

  // Clean up Three.js WebGL contexts to prevent memory leaks
  // This is critical for tests that create Canvas/WebGL contexts
  if (global.gc) {
    global.gc();
  }
});

// Mock window.matchMedia (used by some UI libraries)
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock IntersectionObserver (used by some R3F components)
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as unknown as typeof IntersectionObserver;
});

// Mock ResizeObserver (used by R3F Canvas)
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as unknown as typeof ResizeObserver;
});

// Suppress console errors in tests (optional, but reduces noise)
// You can remove this if you want to see all console outputs
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress known warnings from React/R3F
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLCanvasElement.prototype.getContext'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// Restore console.error after tests
afterEach(() => {
  console.error = originalError;
});
