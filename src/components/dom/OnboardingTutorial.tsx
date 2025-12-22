/**
 * OnboardingTutorial Component (UX-3.1)
 *
 * First-time user tutorial overlay that teaches how to use the AR star map.
 * Shows after permissions are granted, explaining core interactions.
 * Uses localStorage to track completion so it only shows once.
 */

import React, { useState, useEffect } from 'react';

export interface OnboardingTutorialProps {
  /** Callback when tutorial is completed or skipped */
  onComplete?: () => void;
  /** Force show tutorial even if already completed (for testing) */
  forceShow?: boolean;
}

interface TutorialStep {
  icon: string;
  title: string;
  description: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: '🌌',
    title: 'Point at the Sky',
    description: 'Hold your device up and point it toward the sky. The star map will align with what you see in real life.',
  },
  {
    icon: '👆',
    title: 'Tap to Explore',
    description: 'Tap any star or planet to learn more about it. You\'ll see its name, distance, and other fascinating details.',
  },
  {
    icon: '🔄',
    title: 'Move Around',
    description: 'Move your device slowly to explore different parts of the sky. The view will update in real-time as you move.',
  },
];

const STORAGE_KEY = 'star-ar-tutorial-completed';

/**
 * Interactive tutorial overlay for first-time users
 */
export function OnboardingTutorial({
  onComplete,
  forceShow = false,
}: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if tutorial has been completed
  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }

    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        setIsVisible(true);
      }
    } catch (error) {
      // localStorage not available, show tutorial anyway
      setIsVisible(true);
    }
  }, [forceShow]);

  // Handle step navigation with animation
  const goToNextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      completeTutorial();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  // Handle tutorial completion
  const completeTutorial = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch (error) {
        console.warn('Could not save tutorial completion to localStorage:', error);
      }
    }
    setIsVisible(false);
    onComplete?.();
  };

  // Handle skip
  const skipTutorial = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {
      console.warn('Could not save tutorial skip to localStorage:', error);
    }
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) {
    return null;
  }

  const currentTutorialStep = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    zIndex: 150,
  };

  const contentStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.95) 0%, rgba(40, 20, 60, 0.95) 100%)',
    border: '2px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '1.5rem',
    padding: '2.5rem 2rem',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    opacity: isAnimating ? 0.7 : 1,
    transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
    transition: 'all 0.2s ease',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '5rem',
    marginBottom: '1.5rem',
    filter: 'drop-shadow(0 0 30px rgba(102, 126, 234, 0.6))',
    animation: 'float 3s ease-in-out infinite',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#ffffff',
    lineHeight: '1.3',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    marginBottom: '2.5rem',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: '1.6',
  };

  const stepIndicatorStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    marginBottom: '2rem',
  };

  const stepDotStyle = (index: number): React.CSSProperties => ({
    width: index === currentStep ? '2rem' : '0.75rem',
    height: '0.75rem',
    borderRadius: '0.5rem',
    background: index === currentStep
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
  });

  const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  };

  const primaryButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: '1rem 1.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: '1rem 1.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    background: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const checkboxContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const skipButtonStyle: React.CSSProperties = {
    marginTop: '1rem',
    padding: '0.5rem',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    transition: 'color 0.2s ease',
  };

  return (
    <div style={overlayStyle}>
      <div style={contentStyle}>
        {/* Step indicators */}
        <div style={stepIndicatorStyle}>
          {TUTORIAL_STEPS.map((_, index) => (
            <div key={index} style={stepDotStyle(index)} />
          ))}
        </div>

        {/* Content */}
        <div style={iconStyle}>{currentTutorialStep.icon}</div>
        <h2 style={titleStyle}>{currentTutorialStep.title}</h2>
        <p style={descriptionStyle}>{currentTutorialStep.description}</p>

        {/* Navigation buttons */}
        <div style={buttonRowStyle}>
          {!isFirstStep && (
            <button
              onClick={goToPreviousStep}
              style={secondaryButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={goToNextStep}
            style={{
              ...primaryButtonStyle,
              flex: isFirstStep ? 1 : undefined,
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isLastStep ? 'Start Exploring' : 'Next →'}
          </button>
        </div>

        {/* Don't show again checkbox */}
        {isLastStep && (
          <label style={checkboxContainerStyle}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Don&apos;t show this tutorial again</span>
          </label>
        )}

        {/* Skip button */}
        {!isLastStep && (
          <button
            onClick={skipTutorial}
            style={skipButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
            }}
          >
            Skip tutorial
          </button>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
