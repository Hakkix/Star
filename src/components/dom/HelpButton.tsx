/**
 * HelpButton Component
 *
 * Floating help button in bottom-right corner of AR experience.
 * Opens the help overlay when clicked.
 */

import React from 'react';

export interface HelpButtonProps {
  /** Callback when button is clicked */
  onClick: () => void;
  /** Whether the help overlay is currently visible */
  isOpen?: boolean;
}

/**
 * Floating help button with question mark icon
 */
export function HelpButton({ onClick, isOpen = false }: HelpButtonProps) {
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: isOpen
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    fontSize: '1.5rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isOpen
      ? '0 8px 32px rgba(102, 126, 234, 0.4)'
      : '0 4px 16px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    zIndex: 50,
  };

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!isOpen) {
          e.currentTarget.style.background = 'rgba(102, 126, 234, 0.3)';
          e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isOpen) {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = isOpen ? 'scale(1)' : 'scale(0.95)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = isOpen ? 'scale(1)' : 'scale(1.1)';
      }}
      aria-label={isOpen ? 'Close help' : 'Open help'}
    >
      {isOpen ? '✕' : '?'}
    </button>
  );
}
