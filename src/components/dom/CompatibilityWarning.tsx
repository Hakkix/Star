'use client';

import { useEffect, useState } from 'react';
import {
  getBrowserCapabilities,
  getCompatibilityMessage,
  getRecommendedBrowsers,
  shouldShowWarning,
  type BrowserCapabilities,
} from '@/lib/utils/browserDetection';
import { colors, spacing, borderRadius, typography } from '@/lib/constants';
import { fadeIn, keyframes } from '@/lib/animations';

export interface CompatibilityWarningProps {
  onProceed?: () => void;
  onCancel?: () => void;
  showOnlyIfIncompatible?: boolean;
}

export const CompatibilityWarning = ({
  onProceed,
  onCancel,
  showOnlyIfIncompatible = false,
}: CompatibilityWarningProps) => {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const caps = getBrowserCapabilities();
    setCapabilities(caps);

    if (showOnlyIfIncompatible) {
      setIsVisible(shouldShowWarning(caps));
    } else {
      setIsVisible(true);
    }
  }, [showOnlyIfIncompatible]);

  if (!capabilities || !isVisible) {
    return null;
  }

  const message = getCompatibilityMessage(capabilities);
  const recommendedBrowsers = getRecommendedBrowsers();

  return (
    <>
      <style>{keyframes.fadeIn}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: spacing.lg,
          animation: fadeIn({ duration: 'normal' }),
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && onCancel) {
            onCancel();
          }
        }}
      >
        <div
          style={{
            backgroundColor: colors.background.secondary,
            border: `1px solid ${colors.background.tertiary}`,
            borderRadius: borderRadius.xl,
            padding: spacing['2xl'],
            maxWidth: '500px',
            width: '100%',
          }}
        >
          {/* Icon */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: spacing.xl,
            }}
          >
            {capabilities.isSupported ? (
              // Success icon
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.semantic.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.text.primary}
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ) : (
              // Warning icon
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: borderRadius.full,
                  backgroundColor: colors.semantic.warning,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.text.primary}
                  strokeWidth="3"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing.md,
              textAlign: 'center',
            }}
          >
            {capabilities.isSupported ? 'Browser Compatible' : 'Compatibility Notice'}
          </h2>

          {/* Message */}
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
              marginBottom: spacing.xl,
              lineHeight: typography.lineHeight.relaxed,
              textAlign: 'center',
            }}
          >
            {message}
          </p>

          {/* Requirements List */}
          {!capabilities.isSupported && (
            <div
              style={{
                backgroundColor: colors.background.tertiary,
                borderRadius: borderRadius.md,
                padding: spacing.lg,
                marginBottom: spacing.xl,
              }}
            >
              <h3
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                  textTransform: 'uppercase',
                  letterSpacing: typography.letterSpacing.wide,
                }}
              >
                Requirements
              </h3>
              <ul style={{ margin: 0, paddingLeft: spacing.lg }}>
                <li
                  style={{
                    color: capabilities.hasGeolocation
                      ? colors.semantic.success
                      : colors.semantic.error,
                    marginBottom: spacing.sm,
                  }}
                >
                  Geolocation API
                </li>
                <li
                  style={{
                    color: capabilities.hasDeviceOrientation
                      ? colors.semantic.success
                      : colors.semantic.error,
                    marginBottom: spacing.sm,
                  }}
                >
                  Device Orientation Sensors
                </li>
                <li
                  style={{
                    color: capabilities.hasWebGL
                      ? colors.semantic.success
                      : colors.semantic.error,
                  }}
                >
                  WebGL Support
                </li>
              </ul>
            </div>
          )}

          {/* Recommended Browsers */}
          {!capabilities.isSupported && (
            <div
              style={{
                marginBottom: spacing.xl,
              }}
            >
              <h3
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Recommended Browsers:
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: spacing.lg,
                  color: colors.text.secondary,
                }}
              >
                {recommendedBrowsers.map((browser, index) => (
                  <li key={index} style={{ marginBottom: spacing.xs }}>
                    {browser}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              gap: spacing.md,
              justifyContent: 'center',
            }}
          >
            {capabilities.isSupported && onProceed && (
              <button
                onClick={onProceed}
                style={{
                  padding: `${spacing.md} ${spacing.xl}`,
                  backgroundColor: colors.primary[500],
                  color: colors.text.primary,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[600];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary[500];
                }}
              >
                Continue to AR Experience
              </button>
            )}

            {!capabilities.isSupported && onProceed && (
              <button
                onClick={onProceed}
                style={{
                  padding: `${spacing.md} ${spacing.xl}`,
                  backgroundColor: 'transparent',
                  color: colors.text.secondary,
                  border: `1px solid ${colors.background.tertiary}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary[500];
                  e.currentTarget.style.color = colors.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.background.tertiary;
                  e.currentTarget.style.color = colors.text.secondary;
                }}
              >
                Try Anyway
              </button>
            )}

            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  padding: `${spacing.md} ${spacing.xl}`,
                  backgroundColor: 'transparent',
                  color: colors.text.secondary,
                  border: `1px solid ${colors.background.tertiary}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary[500];
                  e.currentTarget.style.color = colors.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.background.tertiary;
                  e.currentTarget.style.color = colors.text.secondary;
                }}
              >
                {capabilities.isSupported ? 'Maybe Later' : 'Go Back'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
