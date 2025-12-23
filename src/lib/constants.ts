/**
 * Design System Constants
 * Centralized design tokens for consistent UI across the application
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Primary palette
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Background colors
  background: {
    primary: '#000000',
    secondary: '#0a0a0a',
    tertiary: '#1a1a1a',
    overlay: 'rgba(0, 0, 0, 0.8)',
    glass: 'rgba(255, 255, 255, 0.05)',
  },

  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#a3a3a3',
    tertiary: '#737373',
    muted: '#525252',
    inverse: '#000000',
  },

  // Accent colors
  accent: {
    blue: '#3b82f6',
    purple: '#a855f7',
    pink: '#ec4899',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
  },

  // Semantic colors
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Celestial colors (for stars, planets, etc.)
  celestial: {
    star: '#ffffff',
    sun: '#FDB813',
    moon: '#F4F6F0',
    mars: '#E27B58',
    venus: '#E3BB76',
    jupiter: '#C88B3A',
    saturn: '#C5AB6E',
    mercury: '#A0A0A0',
    neptune: '#4C6EF5',
    uranus: '#8FCEEC',
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  full: '9999px',
} as const;

// ============================================================================
// Z-INDEX SYSTEM
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
  max: 9999,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
  ultrawide: '1920px',
} as const;

// Media query helpers
export const mediaQueries = {
  mobile: `@media (min-width: ${breakpoints.mobile})`,
  tablet: `@media (min-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
  wide: `@media (min-width: ${breakpoints.wide})`,
  ultrawide: `@media (min-width: ${breakpoints.ultrawide})`,
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const duration = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '1000ms',
} as const;

// ============================================================================
// ANIMATION EASING
// ============================================================================

export const easing = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Custom cubic-bezier curves
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  glow: '0 0 20px rgba(59, 130, 246, 0.5)',
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  base: `${duration.normal} ${easing.smooth}`,
  fast: `${duration.fast} ${easing.smooth}`,
  slow: `${duration.slow} ${easing.smooth}`,
  all: `all ${duration.normal} ${easing.smooth}`,
  colors: `color ${duration.normal} ${easing.smooth}, background-color ${duration.normal} ${easing.smooth}, border-color ${duration.normal} ${easing.smooth}`,
  transform: `transform ${duration.normal} ${easing.smooth}`,
  opacity: `opacity ${duration.normal} ${easing.smooth}`,
} as const;

// ============================================================================
// COMPONENT SIZES
// ============================================================================

export const componentSizes = {
  button: {
    sm: { height: '32px', padding: '0 12px', fontSize: typography.fontSize.sm },
    md: { height: '40px', padding: '0 16px', fontSize: typography.fontSize.base },
    lg: { height: '48px', padding: '0 24px', fontSize: typography.fontSize.lg },
  },
  input: {
    sm: { height: '32px', padding: '0 12px', fontSize: typography.fontSize.sm },
    md: { height: '40px', padding: '0 16px', fontSize: typography.fontSize.base },
    lg: { height: '48px', padding: '0 20px', fontSize: typography.fontSize.lg },
  },
} as const;

// ============================================================================
// CONSTANTS
// ============================================================================

export const constants = {
  // 3D Scene constants
  UNIVERSE_RADIUS: 100,
  STAR_COUNT: 20, // MVP test fixture
  PLANET_RADIUS: 90,

  // Performance
  TARGET_FPS: 60,
  PERFORMANCE_SAMPLE_SIZE: 60,

  // LocalStorage keys
  STORAGE_KEYS: {
    FAVORITES: 'star_app_favorites',
    SETTINGS: 'star_app_settings',
    TUTORIAL_COMPLETE: 'star_app_tutorial_complete',
    ONBOARDING_COMPLETE: 'star_app_onboarding_complete',
  },

  // External links
  LINKS: {
    GITHUB: 'https://github.com/yourusername/star',
    DOCS: 'https://github.com/yourusername/star/wiki',
    SUPPORT: 'https://github.com/yourusername/star/issues',
  },
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Color = typeof colors;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type ZIndex = typeof zIndex;
export type Breakpoint = typeof breakpoints;
export type Typography = typeof typography;
export type Duration = typeof duration;
export type Easing = typeof easing;
export type Shadow = typeof shadows;
export type Transition = typeof transitions;
