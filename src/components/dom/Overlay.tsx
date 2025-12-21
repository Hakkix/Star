/**
 * Overlay Component
 * Displays permission requests, loading states, and error messages
 * for the AR star map experience
 */

import React from 'react';

export interface OverlayProps {
  /** Callback when user clicks permission button */
  onRequestPermission?: () => void;
  /** Whether device orientation permission has been granted */
  permissionGranted?: boolean;
  /** Whether the app is currently loading */
  showLoading?: boolean;
  /** Error message to display (if any) */
  errorMessage?: string | null;
}

/**
 * Overlay component for permission requests and status messages
 *
 * @example
 * ```tsx
 * <Overlay
 *   permissionGranted={false}
 *   onRequestPermission={handleRequestPermission}
 * />
 * ```
 */
export function Overlay({
  onRequestPermission,
  permissionGranted = false,
  showLoading = false,
  errorMessage = null,
}: OverlayProps) {
  // Error takes highest precedence
  if (errorMessage) {
    return (
      <div role="alert" aria-live="assertive">
        <p>Error: {errorMessage}</p>
      </div>
    );
  }

  // Loading takes second precedence
  if (showLoading) {
    return (
      <div role="status" aria-live="polite">
        <p>Loading star map...</p>
      </div>
    );
  }

  // Permission request UI
  if (!permissionGranted) {
    return (
      <div>
        <h2>Star AR Requires Permissions</h2>
        <p>To view the star map, we need access to your device orientation and location.</p>
        <button onClick={onRequestPermission}>Enable Device Orientation</button>
      </div>
    );
  }

  // No overlay when everything is granted
  return null;
}
