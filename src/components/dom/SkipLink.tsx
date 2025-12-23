'use client';

/**
 * SkipLink Component
 *
 * Provides a "Skip to main content" link for keyboard users
 * Improves accessibility by allowing users to bypass navigation
 */

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
        padding: '1rem 2rem',
        backgroundColor: '#1e293b',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '0.5rem',
        border: '2px solid #3b82f6',
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = '1rem';
        e.currentTarget.style.top = '1rem';
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px';
        e.currentTarget.style.top = 'auto';
      }}
    >
      Skip to main content
    </a>
  );
}
