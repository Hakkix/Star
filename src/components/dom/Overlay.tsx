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
  // Container styles - full screen centered overlay
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.95)',
    padding: '2rem',
    textAlign: 'center',
    zIndex: 100,
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#ffffff',
    lineHeight: '1.3',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '1rem',
    marginBottom: '2rem',
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '400px',
    lineHeight: '1.5',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '1rem 2rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
    minWidth: '200px',
  };

  const errorStyle: React.CSSProperties = {
    ...containerStyle,
    background: 'rgba(139, 0, 0, 0.95)',
  };

  // Error takes highest precedence
  if (errorMessage) {
    return (
      <div role="alert" aria-live="assertive" style={errorStyle}>
        <h2 style={headingStyle}>Permission Error</h2>
        <p style={textStyle}>Error: {errorMessage}</p>
        <p style={{ ...textStyle, marginBottom: 0, fontSize: '0.875rem' }}>
          Please check your browser settings and try again.
        </p>
      </div>
    );
  }

  // Loading takes second precedence
  if (showLoading) {
    return (
      <div role="status" aria-live="polite" style={containerStyle}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1.5rem',
        }} />
        <p style={textStyle}>Loading star map...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Permission request UI
  if (!permissionGranted) {
    return (
      <div style={containerStyle}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1.5rem',
          filter: 'drop-shadow(0 0 20px rgba(102, 126, 234, 0.5))',
        }}>
          ✨
        </div>
        <h2 style={headingStyle}>Star AR Requires Permissions</h2>
        <p style={textStyle}>
          To view the star map, we need access to your device orientation and location.
          Point your device at the sky to see stars and planets in real-time!
        </p>
        <button
          onClick={onRequestPermission}
          style={buttonStyle}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Enable Device Orientation
        </button>
        <p style={{
          ...textStyle,
          fontSize: '0.75rem',
          marginTop: '2rem',
          marginBottom: 0,
          opacity: 0.6,
        }}>
          Your location data stays on your device and is never shared.
        </p>
      </div>
    );
  }

  // No overlay when everything is granted
  return null;
}
