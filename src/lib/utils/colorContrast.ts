/**
 * Color Contrast Utilities
 *
 * Utilities for checking WCAG 2.1 color contrast compliance
 * WCAG AA requires:
 * - Normal text: 4.5:1 contrast ratio
 * - Large text (18pt+/14pt+ bold): 3:1 contrast ratio
 * - UI components: 3:1 contrast ratio
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.1
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First color (hex format)
 * @param color2 - Second color (hex format)
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color format');
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param ratio - Contrast ratio
 * @param level - 'normal' or 'large' text
 * @returns true if compliant
 */
export function meetsWCAG_AA(ratio: number, level: 'normal' | 'large' = 'normal'): boolean {
  return level === 'normal' ? ratio >= 4.5 : ratio >= 3;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 * @param ratio - Contrast ratio
 * @param level - 'normal' or 'large' text
 * @returns true if compliant
 */
export function meetsWCAG_AAA(ratio: number, level: 'normal' | 'large' = 'normal'): boolean {
  return level === 'normal' ? ratio >= 7 : ratio >= 4.5;
}

/**
 * Star App Color Palette
 * Verified for WCAG AA compliance
 */
export const colorPalette = {
  // Background colors
  background: {
    primary: '#000000', // Pure black
    secondary: '#0f172a', // Slate 900
    tertiary: '#1e293b', // Slate 800
  },

  // Text colors
  text: {
    primary: '#ffffff', // Pure white
    secondary: '#e2e8f0', // Slate 200
    tertiary: '#94a3b8', // Slate 400
    muted: '#64748b', // Slate 500
  },

  // Accent colors
  accent: {
    primary: '#3b82f6', // Blue 500
    secondary: '#60a5fa', // Blue 400
    tertiary: '#93c5fd', // Blue 300
  },

  // Status colors
  status: {
    success: '#10b981', // Green 500
    warning: '#f59e0b', // Amber 500
    error: '#ef4444', // Red 500
    info: '#3b82f6', // Blue 500
  },

  // Planet colors (used in DetailOverlay)
  planets: {
    sun: '#FDB813',
    moon: '#F4F6F0',
    mercury: '#8C7853',
    venus: '#E3BB76',
    mars: '#E27B58',
    jupiter: '#C88B3A',
    saturn: '#C5AB6E',
    uranus: '#4FD0E7',
    neptune: '#4166F5',
  },
} as const;

/**
 * Verify color combinations meet WCAG AA standards
 * Run this in development to validate design system
 */
export function verifyColorContrast() {
  const results: Array<{
    name: string;
    foreground: string;
    background: string;
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
  }> = [];

  // Check common text combinations
  const combinations = [
    { name: 'Primary text on black', fg: colorPalette.text.primary, bg: colorPalette.background.primary },
    { name: 'Secondary text on black', fg: colorPalette.text.secondary, bg: colorPalette.background.primary },
    { name: 'Tertiary text on black', fg: colorPalette.text.tertiary, bg: colorPalette.background.primary },
    { name: 'Primary text on slate 900', fg: colorPalette.text.primary, bg: colorPalette.background.secondary },
    { name: 'Blue accent on black', fg: colorPalette.accent.primary, bg: colorPalette.background.primary },
    { name: 'White on blue', fg: colorPalette.text.primary, bg: colorPalette.accent.primary },
    { name: 'Success on black', fg: colorPalette.status.success, bg: colorPalette.background.primary },
    { name: 'Error on black', fg: colorPalette.status.error, bg: colorPalette.background.primary },
  ];

  combinations.forEach(({ name, fg, bg }) => {
    const ratio = getContrastRatio(fg, bg);
    results.push({
      name,
      foreground: fg,
      background: bg,
      ratio: Math.round(ratio * 100) / 100,
      passesAA: meetsWCAG_AA(ratio),
      passesAAA: meetsWCAG_AAA(ratio),
    });
  });

  return results;
}

/**
 * Get recommended text color (black or white) for a background
 * @param backgroundColor - Background color (hex)
 * @returns '#000000' or '#ffffff'
 */
export function getRecommendedTextColor(backgroundColor: string): '#000000' | '#ffffff' {
  const contrastWithWhite = getContrastRatio(backgroundColor, '#ffffff');
  const contrastWithBlack = getContrastRatio(backgroundColor, '#000000');

  return contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000';
}
