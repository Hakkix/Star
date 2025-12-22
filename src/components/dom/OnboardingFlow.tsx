/**
 * OnboardingFlow Component
 *
 * Multi-step onboarding that guides users through required permissions
 * with clear explanations at each step.
 */

import React, { useEffect, useState } from 'react';
import { useStarStore } from '@/lib/store';

export interface OnboardingFlowProps {
  /** Callback to request GPS permission */
  onRequestLocation?: () => Promise<void>;
  /** Callback to request device orientation permission */
  onRequestOrientation?: () => Promise<void>;
  /** Whether GPS permission has been granted */
  hasGPSPermission?: boolean;
  /** Whether device orientation permission has been granted */
  hasOrientationPermission?: boolean;
  /** GPS permission error (if any) */
  gpsError?: string | null;
  /** Orientation permission error (if any) */
  orientationError?: string | null;
}

/**
 * Smooth onboarding flow with step-by-step permission requests
 */
export function OnboardingFlow({
  onRequestLocation,
  onRequestOrientation,
  hasGPSPermission = false,
  hasOrientationPermission = false,
  gpsError = null,
  orientationError = null,
}: OnboardingFlowProps) {
  const { onboardingStep, setOnboardingStep, completeOnboarding } = useStarStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Load onboarding completion state from localStorage on mount
  useEffect(() => {
    const hasCompletedBefore = localStorage.getItem('star-onboarding-completed') === 'true';
    if (hasCompletedBefore) {
      completeOnboarding();
    }
  }, [completeOnboarding]);

  // Auto-advance to ready when both permissions are granted
  useEffect(() => {
    if (hasGPSPermission && hasOrientationPermission && onboardingStep !== 'ready' && onboardingStep !== 'completed') {
      setOnboardingStep('ready');
    }
  }, [hasGPSPermission, hasOrientationPermission, onboardingStep, setOnboardingStep]);

  // Handle step transitions with animation
  const transitionToStep = (nextStep: typeof onboardingStep) => {
    setIsAnimating(true);
    setTimeout(() => {
      setOnboardingStep(nextStep);
      setIsAnimating(false);
    }, 300);
  };

  // Handle location permission request
  const handleLocationRequest = async () => {
    if (!onRequestLocation) return;
    setIsRequesting(true);
    try {
      await onRequestLocation();
      // Wait a bit before transitioning to show success
      setTimeout(() => {
        transitionToStep('orientation');
        setIsRequesting(false);
      }, 500);
    } catch {
      setIsRequesting(false);
    }
  };

  // Handle orientation permission request
  const handleOrientationRequest = async () => {
    if (!onRequestOrientation) return;
    setIsRequesting(true);
    try {
      await onRequestOrientation();
      // Wait a bit before transitioning to show success
      setTimeout(() => {
        transitionToStep('ready');
        setIsRequesting(false);
      }, 500);
    } catch {
      setIsRequesting(false);
    }
  };

  // Handle completion
  const handleComplete = () => {
    transitionToStep('completed');
    setTimeout(() => {
      completeOnboarding();
      localStorage.setItem('star-onboarding-completed', 'true');
    }, 300);
  };

  // Handle skip tutorial
  const handleSkip = () => {
    completeOnboarding();
    localStorage.setItem('star-onboarding-completed', 'true');
  };

  // Container styles
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
    background: 'linear-gradient(135deg, rgba(0, 0, 20, 0.98) 0%, rgba(20, 0, 40, 0.98) 100%)',
    padding: '2rem',
    textAlign: 'center',
    zIndex: 100,
    opacity: isAnimating ? 0 : 1,
    transition: 'opacity 0.3s ease',
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '500px',
    width: '100%',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '4rem',
    marginBottom: '1.5rem',
    filter: 'drop-shadow(0 0 30px rgba(102, 126, 234, 0.6))',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#ffffff',
    lineHeight: '1.3',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    marginBottom: '2rem',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: '1.6',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '1rem 2.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
    minWidth: '200px',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: 'none',
    marginTop: '1rem',
  };

  const featureListStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: '2rem 0',
    textAlign: 'left',
  };

  const featureItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1rem',
  };

  const stepIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  };

  const stepDotStyle = (active: boolean): React.CSSProperties => ({
    width: active ? '2rem' : '0.75rem',
    height: '0.75rem',
    borderRadius: '0.5rem',
    background: active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
  });

  const errorStyle: React.CSSProperties = {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: 'rgba(220, 38, 38, 0.2)',
    border: '1px solid rgba(220, 38, 38, 0.4)',
    borderRadius: '0.5rem',
    color: '#fca5a5',
    fontSize: '0.875rem',
  };

  const skipButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    transition: 'color 0.2s ease',
  };

  // Step indicators
  const renderStepIndicator = () => {
    const steps = ['welcome', 'location', 'orientation', 'ready'];
    const currentIndex = steps.indexOf(onboardingStep);

    return (
      <div style={stepIndicatorStyle}>
        {steps.map((step, index) => (
          <div key={step} style={stepDotStyle(index <= currentIndex)} />
        ))}
      </div>
    );
  };

  // Welcome step
  if (onboardingStep === 'welcome') {
    return (
      <div style={containerStyle}>
        <button
          onClick={handleSkip}
          style={skipButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          Skip Tutorial →
        </button>
        <div style={contentStyle}>
          {renderStepIndicator()}
          <div style={iconStyle}>✨</div>
          <h1 style={titleStyle}>Welcome to Star AR</h1>
          <p style={descriptionStyle}>
            Transform your device into a window to the cosmos. Point at the sky and discover stars, planets, and constellations in real-time.
          </p>
          <ul style={featureListStyle}>
            <li style={featureItemStyle}>
              <span style={{ fontSize: '1.5rem' }}>🌍</span>
              <span><strong>Location-aware</strong> - See exactly what&apos;s visible from where you are</span>
            </li>
            <li style={featureItemStyle}>
              <span style={{ fontSize: '1.5rem' }}>📱</span>
              <span><strong>Motion tracking</strong> - Your view aligns perfectly with the real sky</span>
            </li>
            <li style={featureItemStyle}>
              <span style={{ fontSize: '1.5rem' }}>🔒</span>
              <span><strong>Privacy first</strong> - All data stays on your device</span>
            </li>
          </ul>
          <button
            onClick={() => transitionToStep('location')}
            style={buttonStyle}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Location permission step
  if (onboardingStep === 'location') {
    return (
      <div style={containerStyle}>
        <button
          onClick={handleSkip}
          style={skipButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          Skip Tutorial →
        </button>
        <div style={contentStyle}>
          {renderStepIndicator()}
          <div style={iconStyle}>📍</div>
          <h1 style={titleStyle}>Enable Location Access</h1>
          <p style={descriptionStyle}>
            We need your location to calculate which celestial objects are visible from your position on Earth.
          </p>
          <div style={{
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '2rem',
            textAlign: 'left',
          }}>
            <h3 style={{ color: '#a5b4fc', marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem' }}>
              Why location matters:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              <li>Different stars are visible from different parts of Earth</li>
              <li>Calculates precise altitude and azimuth angles</li>
              <li>Shows accurate rise and set times for celestial objects</li>
            </ul>
          </div>
          <button
            onClick={handleLocationRequest}
            disabled={isRequesting || hasGPSPermission}
            style={{
              ...buttonStyle,
              opacity: (isRequesting || hasGPSPermission) ? 0.6 : 1,
              cursor: (isRequesting || hasGPSPermission) ? 'not-allowed' : 'pointer',
            }}
          >
            {isRequesting ? 'Requesting...' : hasGPSPermission ? 'Location Granted ✓' : 'Allow Location Access'}
          </button>
          {gpsError && (
            <div style={errorStyle}>
              {gpsError}
            </div>
          )}
          {hasGPSPermission && (
            <button
              onClick={() => transitionToStep('orientation')}
              style={secondaryButtonStyle}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Device orientation permission step
  if (onboardingStep === 'orientation') {
    return (
      <div style={containerStyle}>
        <button
          onClick={handleSkip}
          style={skipButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          Skip Tutorial →
        </button>
        <div style={contentStyle}>
          {renderStepIndicator()}
          <div style={iconStyle}>📱</div>
          <h1 style={titleStyle}>Enable Motion Sensors</h1>
          <p style={descriptionStyle}>
            We need access to your device&apos;s motion sensors (gyroscope) to align the star map with where you&apos;re pointing.
          </p>
          <div style={{
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '2rem',
            textAlign: 'left',
          }}>
            <h3 style={{ color: '#a5b4fc', marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem' }}>
              How it works:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              <li>Tracks which direction your device is facing</li>
              <li>Rotates the celestial sphere in real-time as you move</li>
              <li>Creates an immersive AR experience</li>
            </ul>
            <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Note: No camera access needed - only motion sensors
            </p>
          </div>
          <button
            onClick={handleOrientationRequest}
            disabled={isRequesting || hasOrientationPermission}
            style={{
              ...buttonStyle,
              opacity: (isRequesting || hasOrientationPermission) ? 0.6 : 1,
              cursor: (isRequesting || hasOrientationPermission) ? 'not-allowed' : 'pointer',
            }}
          >
            {isRequesting ? 'Requesting...' : hasOrientationPermission ? 'Motion Access Granted ✓' : 'Allow Motion Access'}
          </button>
          {orientationError && (
            <div style={errorStyle}>
              {orientationError}
            </div>
          )}
          {hasOrientationPermission && (
            <button
              onClick={() => transitionToStep('ready')}
              style={secondaryButtonStyle}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Ready step
  if (onboardingStep === 'ready') {
    return (
      <div style={containerStyle}>
        <div style={contentStyle}>
          {renderStepIndicator()}
          <div style={iconStyle}>🚀</div>
          <h1 style={titleStyle}>You&apos;re All Set!</h1>
          <p style={descriptionStyle}>
            Everything is ready for your cosmic journey. Point your device at the sky to begin exploring.
          </p>
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '2rem',
          }}>
            <h3 style={{ color: '#86efac', marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem' }}>
              Quick tips:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'rgba(255, 255, 255, 0.8)', textAlign: 'left' }}>
              <li>Go outside at night for the best experience</li>
              <li>Tap any star or planet to learn more about it</li>
              <li>Move your device slowly for smooth tracking</li>
              <li>Give your eyes a few minutes to adjust to darkness</li>
            </ul>
          </div>
          <button
            onClick={handleComplete}
            style={buttonStyle}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Start Exploring the Cosmos
          </button>
        </div>
      </div>
    );
  }

  // Completed - don't render anything
  return null;
}
