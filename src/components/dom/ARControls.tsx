/**
 * ARControls Component
 *
 * Bottom control bar for AR experience with toggles for various features.
 * Provides quick access to settings without leaving the AR view.
 */

import React from 'react';
import { useStarStore } from '@/lib/store';

export interface ARControlsProps {
  /** Optional callback when settings button is clicked */
  onSettingsClick?: () => void;
}

/**
 * Floating control bar at bottom of AR view
 */
export function ARControls({ onSettingsClick }: ARControlsProps) {
  const { showConstellations, showPlanets, toggleConstellations, togglePlanets } = useStarStore();

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '1.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '60px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    zIndex: 40,
    maxWidth: '90%',
  };

  const controlButtonStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    background: isActive
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(255, 255, 255, 0.05)',
    border: '1px solid',
    borderColor: isActive ? 'rgba(102, 126, 234, 0.5)' : 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50px',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  });

  const iconButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '28px',
    background: 'rgba(255, 255, 255, 0.15)',
    margin: '0 0.25rem',
  };

  return (
    <div style={containerStyle}>
      {/* Constellations Toggle */}
      <button
        onClick={toggleConstellations}
        style={controlButtonStyle(showConstellations)}
        onMouseEnter={(e) => {
          if (!showConstellations) {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!showConstellations) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }
        }}
        aria-label={showConstellations ? 'Hide constellations' : 'Show constellations'}
      >
        <span>✨</span>
        <span className="hide-mobile">Constellations</span>
      </button>

      {/* Planets Toggle */}
      <button
        onClick={togglePlanets}
        style={controlButtonStyle(showPlanets)}
        onMouseEnter={(e) => {
          if (!showPlanets) {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!showPlanets) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }
        }}
        aria-label={showPlanets ? 'Hide planets' : 'Show planets'}
      >
        <span>🪐</span>
        <span className="hide-mobile">Planets</span>
      </button>

      <div style={dividerStyle} />

      {/* Calibrate Button */}
      <button
        onClick={() => {
          alert('Tip: Wave your device in a figure-8 pattern to calibrate the sensors.');
        }}
        style={iconButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Calibrate sensors"
        title="Calibrate sensors"
      >
        🧭
      </button>

      {/* Settings Button */}
      {onSettingsClick && (
        <button
          onClick={onSettingsClick}
          style={iconButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label="Settings"
          title="Settings"
        >
          ⚙️
        </button>
      )}

      {/* Inline styles for responsive text */}
      <style>
        {`
          @media (max-width: 640px) {
            .hide-mobile {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
}
