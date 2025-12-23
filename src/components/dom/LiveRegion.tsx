'use client';

import { useEffect, useRef } from 'react';

/**
 * LiveRegion Component
 *
 * ARIA live region for announcing dynamic content changes to screen readers
 * Used for important updates, notifications, and status messages
 */

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive' | 'off';
  clearAfter?: number; // Clear message after N milliseconds
}

export function LiveRegion({ message, politeness = 'polite', clearAfter }: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (clearAfter && message) {
      const timeout = setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, clearAfter);

      return () => clearTimeout(timeout);
    }
  }, [message, clearAfter]);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {message}
    </div>
  );
}

/**
 * useAnnounce Hook
 *
 * Programmatically announce messages to screen readers
 * @returns announce function
 */
export function useAnnounce() {
  const announceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create the announcement div if it doesn't exist
    if (!announceRef.current) {
      const div = document.createElement('div');
      div.setAttribute('role', 'status');
      div.setAttribute('aria-live', 'polite');
      div.setAttribute('aria-atomic', 'true');
      div.style.position = 'absolute';
      div.style.left = '-10000px';
      div.style.width = '1px';
      div.style.height = '1px';
      div.style.overflow = 'hidden';
      document.body.appendChild(div);
      announceRef.current = div;
    }

    return () => {
      if (announceRef.current && document.body.contains(announceRef.current)) {
        document.body.removeChild(announceRef.current);
        announceRef.current = null;
      }
    };
  }, []);

  const announce = (message: string, clearAfter = 3000) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;

      if (clearAfter) {
        setTimeout(() => {
          if (announceRef.current) {
            announceRef.current.textContent = '';
          }
        }, clearAfter);
      }
    }
  };

  return announce;
}
