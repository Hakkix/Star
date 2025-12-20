/**
 * Test utilities for rendering components with necessary providers
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

/**
 * Custom render function that wraps components with necessary providers
 * Currently just a wrapper, but can be extended with Zustand stores, etc.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here if needed (e.g., initialStoreState)
}

function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Add providers here when needed, e.g.:
        <StoreProvider initialState={...}>
          {children}
        </StoreProvider>
      */}
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
