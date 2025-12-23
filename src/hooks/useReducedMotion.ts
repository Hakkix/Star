'use client';

import { useEffect, useState } from 'react';

/**
 * useReducedMotion Hook
 *
 * Detects user's motion preference from system settings
 * Respects prefers-reduced-motion media query
 *
 * @returns boolean indicating if user prefers reduced motion
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * // Conditionally apply animations
 * <div
 *   style={{
 *     transition: prefersReducedMotion ? 'none' : 'all 0.3s ease',
 *   }}
 * >
 *   Content
 * </div>
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create event listener for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener (use deprecated addListener for older browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * getAnimationDuration
 *
 * Returns appropriate animation duration based on reduced motion preference
 * @param normalDuration - Duration in ms when motion is enabled
 * @param prefersReducedMotion - User's motion preference
 * @returns Duration in ms (1ms if reduced motion preferred)
 */
export function getAnimationDuration(
  normalDuration: number,
  prefersReducedMotion: boolean
): number {
  return prefersReducedMotion ? 1 : normalDuration;
}

/**
 * getTransitionStyle
 *
 * Returns appropriate transition CSS based on reduced motion preference
 * @param normalTransition - Normal transition CSS string
 * @param prefersReducedMotion - User's motion preference
 * @returns 'none' if reduced motion preferred, otherwise normalTransition
 */
export function getTransitionStyle(
  normalTransition: string,
  prefersReducedMotion: boolean
): string {
  return prefersReducedMotion ? 'none' : normalTransition;
}
