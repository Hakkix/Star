/**
 * Animation Library
 * Standardized animation utilities and keyframes for consistent UI animations
 */

import { duration, easing } from './constants';

// ============================================================================
// ANIMATION TYPES
// ============================================================================

export type AnimationDirection = 'up' | 'down' | 'left' | 'right';
export type AnimationTiming = 'fast' | 'normal' | 'slow' | 'slower';

export interface AnimationConfig {
  duration?: AnimationTiming;
  easing?: keyof typeof easing;
  delay?: number;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// ============================================================================
// KEYFRAMES
// ============================================================================

export const keyframes = {
  // Fade animations
  fadeIn: `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,

  fadeOut: `
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `,

  // Slide animations
  slideInUp: `
    @keyframes slideInUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,

  slideInDown: `
    @keyframes slideInDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,

  slideInLeft: `
    @keyframes slideInLeft {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,

  slideInRight: `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `,

  slideOutUp: `
    @keyframes slideOutUp {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(-100%);
        opacity: 0;
      }
    }
  `,

  slideOutDown: `
    @keyframes slideOutDown {
      from {
        transform: translateY(0);
        opacity: 1;
      }
      to {
        transform: translateY(100%);
        opacity: 0;
      }
    }
  `,

  // Scale animations
  scaleIn: `
    @keyframes scaleIn {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,

  scaleOut: `
    @keyframes scaleOut {
      from {
        transform: scale(1);
        opacity: 1;
      }
      to {
        transform: scale(0.8);
        opacity: 0;
      }
    }
  `,

  // Rotate animations
  rotate: `
    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,

  // Bounce animation
  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-20px);
      }
    }
  `,

  // Pulse animation
  pulse: `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `,

  // Shimmer/loading animation
  shimmer: `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
  `,

  // Shake animation
  shake: `
    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-10px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(10px);
      }
    }
  `,

  // Glow animation
  glow: `
    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
      }
      50% {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
      }
    }
  `,

  // Float animation
  float: `
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }
  `,
} as const;

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

/**
 * Get animation duration based on timing preset
 */
export const getAnimationDuration = (timing: AnimationTiming = 'normal'): string => {
  return duration[timing];
};

/**
 * Create fade in animation
 */
export const fadeIn = (config: AnimationConfig = {}): string => {
  const {
    duration: dur = 'normal',
    easing: ease = 'smooth',
    delay = 0,
    fillMode = 'both',
  } = config;

  return `fadeIn ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode}`;
};

/**
 * Create fade out animation
 */
export const fadeOut = (config: AnimationConfig = {}): string => {
  const {
    duration: dur = 'normal',
    easing: ease = 'smooth',
    delay = 0,
    fillMode = 'both',
  } = config;

  return `fadeOut ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode}`;
};

/**
 * Create slide in animation
 */
export const slideIn = (
  direction: AnimationDirection = 'up',
  config: AnimationConfig = {}
): string => {
  const {
    duration: dur = 'normal',
    easing: ease = 'smooth',
    delay = 0,
    fillMode = 'both',
  } = config;

  const animationName = `slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
  return `${animationName} ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode}`;
};

/**
 * Create slide out animation
 */
export const slideOut = (
  direction: AnimationDirection = 'up',
  config: AnimationConfig = {}
): string => {
  const {
    duration: dur = 'normal',
    easing: ease = 'smooth',
    delay = 0,
    fillMode = 'both',
  } = config;

  const animationName = `slideOut${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
  return `${animationName} ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode}`;
};

/**
 * Create scale animation
 */
export const scale = (
  type: 'in' | 'out' = 'in',
  config: AnimationConfig = {}
): string => {
  const {
    duration: dur = 'normal',
    easing: ease = 'smooth',
    delay = 0,
    fillMode = 'both',
  } = config;

  const animationName = type === 'in' ? 'scaleIn' : 'scaleOut';
  return `${animationName} ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode}`;
};

/**
 * Create rotate animation
 */
export const rotate = (config: AnimationConfig = {}): string => {
  const {
    duration: dur = 'normal',
    easing: ease = 'linear',
    delay = 0,
    fillMode = 'both',
  } = config;

  return `rotate ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode} infinite`;
};

/**
 * Create bounce animation
 */
export const bounce = (config: AnimationConfig = {}): string => {
  const {
    duration: dur = 'normal',
    easing: ease = 'ease',
    delay = 0,
    fillMode = 'both',
  } = config;

  return `bounce ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode}`;
};

/**
 * Create pulse animation
 */
export const pulse = (config: AnimationConfig = {}): string => {
  const {
    duration: dur = 'slow',
    easing: ease = 'ease',
    delay = 0,
    fillMode = 'both',
  } = config;

  return `pulse ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode} infinite`;
};

/**
 * Create shimmer/loading animation
 */
export const shimmer = (config: AnimationConfig = {}): string => {
  const {
    duration: dur = 'slower',
    easing: ease = 'linear',
    delay = 0,
    fillMode = 'both',
  } = config;

  return `shimmer ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode} infinite`;
};

/**
 * Create shake animation
 */
export const shake = (config: AnimationConfig = {}): string => {
  const {
    duration: dur = 'fast',
    easing: ease = 'ease',
    delay = 0,
    fillMode = 'both',
  } = config;

  return `shake ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode}`;
};

/**
 * Create glow animation
 */
export const glow = (config: AnimationConfig = {}): string => {
  const {
    duration: dur = 'slow',
    easing: ease = 'ease',
    delay = 0,
    fillMode = 'both',
  } = config;

  return `glow ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode} infinite`;
};

/**
 * Create float animation
 */
export const float = (config: AnimationConfig = {}): string => {
  const {
    duration: dur = 'slow',
    easing: ease = 'ease',
    delay = 0,
    fillMode = 'both',
  } = config;

  return `float ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode} infinite`;
};

// ============================================================================
// TRANSITION UTILITIES
// ============================================================================

/**
 * Create a custom transition
 */
export const createTransition = (
  properties: string[],
  config: AnimationConfig = {}
): string => {
  const {
    duration: dur = 'normal',
    easing: ease = 'smooth',
    delay = 0,
  } = config;

  return properties
    .map(prop => `${prop} ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms`)
    .join(', ');
};

/**
 * Create opacity transition
 */
export const transitionOpacity = (config: AnimationConfig = {}): string => {
  return createTransition(['opacity'], config);
};

/**
 * Create transform transition
 */
export const transitionTransform = (config: AnimationConfig = {}): string => {
  return createTransition(['transform'], config);
};

/**
 * Create color transitions
 */
export const transitionColors = (config: AnimationConfig = {}): string => {
  return createTransition(['color', 'background-color', 'border-color'], config);
};

/**
 * Create all transitions
 */
export const transitionAll = (config: AnimationConfig = {}): string => {
  return createTransition(['all'], config);
};

// ============================================================================
// PRESET ANIMATIONS
// ============================================================================

export const presets = {
  // Modal animations
  modalEnter: slideIn('up', { duration: 'normal', easing: 'smooth' }),
  modalExit: slideOut('down', { duration: 'fast', easing: 'smooth' }),

  // Toast animations
  toastEnter: slideIn('right', { duration: 'fast', easing: 'smooth' }),
  toastExit: slideOut('right', { duration: 'fast', easing: 'smooth' }),

  // Dropdown animations
  dropdownEnter: fadeIn({ duration: 'fast', easing: 'smooth' }),
  dropdownExit: fadeOut({ duration: 'fast', easing: 'smooth' }),

  // Button hover
  buttonHover: scale('in', { duration: 'fast', easing: 'smooth' }),

  // Loading
  loading: pulse({ duration: 'slow' }),
  spinner: rotate({ duration: 'slower' }),

  // Attention
  attention: shake({ duration: 'fast' }),
  highlight: glow({ duration: 'slow' }),
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Inject keyframes into document head
 * Call this once at app initialization to add all keyframe animations
 */
export const injectKeyframes = (): void => {
  if (typeof document === 'undefined') return;

  const styleId = 'star-animations';
  if (document.getElementById(styleId)) return; // Already injected

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = Object.values(keyframes).join('\n');
  document.head.appendChild(style);
};

/**
 * Get animation class name for CSS modules
 */
export const getAnimationClass = (
  animationName: keyof typeof keyframes,
  config: AnimationConfig = {}
): string => {
  const {
    duration: dur = 'normal',
    easing: ease = 'smooth',
    delay = 0,
    fillMode = 'both',
  } = config;

  return `animation: ${animationName} ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode}`;
};

/**
 * Create CSS string for inline styles
 */
export const createAnimationStyle = (
  animationName: keyof typeof keyframes,
  config: AnimationConfig = {}
): React.CSSProperties => {
  const {
    duration: dur = 'normal',
    easing: ease = 'smooth',
    delay = 0,
    fillMode = 'both',
  } = config;

  return {
    animation: `${animationName} ${getAnimationDuration(dur)} ${easing[ease]} ${delay}ms ${fillMode}`,
  };
};
