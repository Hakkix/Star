'use client';

import { useEffect, useState } from 'react';
import { colors, spacing, borderRadius, typography } from '@/lib/constants';
import { fadeIn, shimmer, keyframes } from '@/lib/animations';

export interface LoadingStage {
  id: string;
  message: string;
  progress: number; // 0-100
}

export interface LoadingProgressProps {
  stage: LoadingStage;
  onComplete?: () => void;
}

const LOADING_STAGES: LoadingStage[] = [
  { id: 'catalog', message: 'Loading star catalog...', progress: 0 },
  { id: 'astronomy', message: 'Calculating planetary positions...', progress: 33 },
  { id: 'scene', message: 'Initializing 3D scene...', progress: 66 },
  { id: 'complete', message: 'Ready to explore!', progress: 100 },
];

export const LoadingProgress = ({ stage, onComplete }: LoadingProgressProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const targetProgress = stage.progress;
    const step = () => {
      setDisplayProgress(prev => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.1) {
          if (targetProgress === 100 && onComplete) {
            setTimeout(onComplete, 500); // Delay before calling onComplete
          }
          return targetProgress;
        }
        return prev + diff * 0.1;
      });
    };

    const interval = setInterval(step, 16); // ~60fps
    return () => clearInterval(interval);
  }, [stage.progress, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background.primary,
        zIndex: 9999,
        animation: fadeIn({ duration: 'fast' }),
      }}
    >
      <style>{keyframes.fadeIn}</style>
      <style>{keyframes.shimmer}</style>

      {/* Logo/Title */}
      <div
        style={{
          marginBottom: spacing['2xl'],
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: typography.fontSize['5xl'],
            fontWeight: typography.fontWeight.bold,
            background: `linear-gradient(135deg, ${colors.primary[400]}, ${colors.accent.purple})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: spacing.md,
          }}
        >
          Star
        </h1>
        <p
          style={{
            color: colors.text.secondary,
            fontSize: typography.fontSize.lg,
          }}
        >
          {stage.message}
        </p>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '80%',
          maxWidth: '400px',
          marginBottom: spacing.xl,
        }}
      >
        {/* Progress bar container */}
        <div
          style={{
            position: 'relative',
            height: '8px',
            backgroundColor: colors.background.tertiary,
            borderRadius: borderRadius.full,
            overflow: 'hidden',
          }}
        >
          {/* Progress bar fill */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${displayProgress}%`,
              background: `linear-gradient(90deg, ${colors.primary[500]}, ${colors.accent.purple})`,
              borderRadius: borderRadius.full,
              transition: 'width 0.3s ease-out',
            }}
          />

          {/* Shimmer effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)`,
              animation: shimmer({ duration: 'slower' }),
            }}
          />
        </div>

        {/* Percentage */}
        <div
          style={{
            textAlign: 'center',
            marginTop: spacing.md,
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily.mono,
          }}
        >
          {Math.round(displayProgress)}%
        </div>
      </div>

      {/* Loading stages indicator */}
      <div
        style={{
          display: 'flex',
          gap: spacing.md,
          marginTop: spacing.xl,
        }}
      >
        {LOADING_STAGES.slice(0, -1).map((s, index) => (
          <div
            key={s.id}
            style={{
              width: '40px',
              height: '4px',
              backgroundColor:
                stage.progress >= s.progress
                  ? colors.primary[500]
                  : colors.background.tertiary,
              borderRadius: borderRadius.full,
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SKELETON SCREENS
// ============================================================================

export const SkeletonBox = ({
  width = '100%',
  height = '20px',
  borderRadius: radius = borderRadius.md,
}: {
  width?: string;
  height?: string;
  borderRadius?: string;
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: `linear-gradient(90deg, ${colors.background.tertiary} 25%, ${colors.background.glass} 50%, ${colors.background.tertiary} 75%)`,
        backgroundSize: '200% 100%',
        animation: shimmer({ duration: 'slower' }),
      }}
    >
      <style>{keyframes.shimmer}</style>
    </div>
  );
};

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height="16px"
        />
      ))}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div
      style={{
        padding: spacing.lg,
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.background.tertiary}`,
      }}
    >
      <SkeletonBox width="60%" height="24px" borderRadius={borderRadius.sm} />
      <div style={{ marginTop: spacing.md }}>
        <SkeletonText lines={3} />
      </div>
    </div>
  );
};

// ============================================================================
// LOADING SPINNER
// ============================================================================

export const LoadingSpinner = ({ size = '40px' }: { size?: string }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid ${colors.background.tertiary}`,
        borderTop: `3px solid ${colors.primary[500]}`,
        borderRadius: borderRadius.full,
        animation: 'rotate 1s linear infinite',
      }}
    >
      <style>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// HOOKS FOR LOADING STATE MANAGEMENT
// ============================================================================

export const useLoadingStages = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const currentStage = LOADING_STAGES[currentStageIndex];

  const nextStage = () => {
    setCurrentStageIndex(prev => {
      const next = prev + 1;
      if (next >= LOADING_STAGES.length) {
        setIsLoading(false);
        return prev;
      }
      return next;
    });
  };

  const setStage = (stageId: string) => {
    const index = LOADING_STAGES.findIndex(s => s.id === stageId);
    if (index !== -1) {
      setCurrentStageIndex(index);
    }
  };

  const reset = () => {
    setCurrentStageIndex(0);
    setIsLoading(true);
  };

  return {
    currentStage,
    isLoading,
    nextStage,
    setStage,
    reset,
    progress: currentStage.progress,
  };
};
