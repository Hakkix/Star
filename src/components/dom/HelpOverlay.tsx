/**
 * HelpOverlay Component
 *
 * In-app help overlay with quick tips, keyboard shortcuts,
 * troubleshooting guides, and documentation links.
 */

import React from 'react';

export interface HelpOverlayProps {
  /** Whether the overlay is visible */
  isVisible: boolean;
  /** Callback to close the overlay */
  onClose: () => void;
}

/**
 * Help overlay with comprehensive usage information
 */
export function HelpOverlay({ isVisible, onClose }: HelpOverlayProps) {
  if (!isVisible) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 60,
    animation: 'fadeIn 0.3s ease',
  };

  const contentStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(0, 0, 30, 0.95) 0%, rgba(30, 0, 60, 0.95) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    position: 'relative',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    transition: 'color 0.2s ease',
    lineHeight: 1,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '2rem',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#a5b4fc',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const listItemStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: '0.75rem',
    paddingLeft: '1.5rem',
    position: 'relative',
    lineHeight: '1.6',
  };

  const bulletStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    color: '#667eea',
  };

  const shortcutStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    color: 'rgba(255, 255, 255, 0.85)',
  };

  const keyStyle: React.CSSProperties = {
    background: 'rgba(102, 126, 234, 0.2)',
    border: '1px solid rgba(102, 126, 234, 0.4)',
    borderRadius: '0.25rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    color: '#a5b4fc',
  };

  const linkStyle: React.CSSProperties = {
    color: '#667eea',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Help & Tips</h2>
          <button
            onClick={onClose}
            style={closeButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            }}
            aria-label="Close help"
          >
            ✕
          </button>
        </div>

        {/* Quick Tips */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <span>💡</span> Quick Tips
          </h3>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>Best experience at night:</strong> Go outside after sunset for optimal stargazing
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>Move slowly:</strong> Smooth, gradual movements provide better tracking accuracy
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>Tap to learn:</strong> Touch any star or planet to see detailed information
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>Calibrate sensors:</strong> Wave your device in a figure-8 pattern to improve accuracy
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>Dark adaptation:</strong> Give your eyes 5-10 minutes to adjust to darkness
            </li>
          </ul>
        </div>

        {/* Keyboard Shortcuts */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <span>⌨️</span> Keyboard Shortcuts
          </h3>
          <div style={shortcutStyle}>
            <span>Close overlays</span>
            <span style={keyStyle}>ESC</span>
          </div>
          <div style={shortcutStyle}>
            <span>Open help</span>
            <span style={keyStyle}>?</span>
          </div>
          <div style={shortcutStyle}>
            <span>Deselect object</span>
            <span style={keyStyle}>ESC</span>
          </div>
        </div>

        {/* Troubleshooting */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <span>🔧</span> Troubleshooting
          </h3>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>Stars not visible:</strong> Check that you&apos;ve granted location and motion permissions
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>Alignment is off:</strong> Try calibrating your device&apos;s compass and gyroscope
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>Poor performance:</strong> Close other apps and ensure good lighting for sensor tracking
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>iOS permissions:</strong> Go to Settings → Privacy → Location/Motion to grant access
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>Blank screen:</strong> Refresh the page and ensure WebGL is supported by your browser
            </li>
          </ul>
        </div>

        {/* Documentation Link */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <span>📚</span> Documentation
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6' }}>
            For more detailed information, visit our{' '}
            <a
              href="https://github.com/Hakkix/Star"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              GitHub repository
            </a>{' '}
            for technical documentation, FAQs, and community support.
          </p>
        </div>

        {/* Device Compatibility */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <span>📱</span> Device Compatibility
          </h3>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>iOS 13+:</strong> Full support with permission prompts
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>Android 5+:</strong> Full support on most devices
            </li>
            <li style={listItemStyle}>
              <span style={bulletStyle}>•</span>
              <strong>Desktop:</strong> Limited support (no motion sensors)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
