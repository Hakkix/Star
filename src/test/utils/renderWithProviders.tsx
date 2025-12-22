/**
 * Test utilities for rendering components with necessary providers
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode, useEffect } from 'react';
import { useStarStore } from '@/lib/store';

/**
 * Custom render function that wraps components with necessary providers
 * Includes Zustand store cleanup between tests
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here if needed (e.g., initialStoreState)
}

/**
 * Component that resets the Zustand store after unmounting
 * This ensures tests don't have state pollution
 */
function StoreCleanup() {
  const reset = useStarStore((state) => state.reset);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return null;
}

function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreCleanup />
      {children}
    </>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Export custom render as default
export { renderWithProviders as render };
