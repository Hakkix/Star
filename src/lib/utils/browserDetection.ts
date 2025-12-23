/**
 * Browser Detection and Feature Support Utilities
 * Detects browser capabilities required for the AR star map
 */

// Type for iOS 13+ DeviceOrientationEvent with requestPermission
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export interface BrowserCapabilities {
  hasGeolocation: boolean;
  hasDeviceOrientation: boolean;
  hasWebGL: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  needsOrientationPermission: boolean;
  browser: string;
  isSupported: boolean;
  warnings: string[];
}

/**
 * Detect if geolocation is supported
 */
export const hasGeolocation = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  return 'geolocation' in navigator;
};

/**
 * Detect if device orientation is supported
 */
export const hasDeviceOrientation = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return 'DeviceOrientationEvent' in window;
};

/**
 * Detect if WebGL is supported
 */
export const hasWebGL = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
};

/**
 * Detect iOS device
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor;
  return /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
};

/**
 * Detect Android device
 */
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor;
  return /android/i.test(userAgent);
};

/**
 * Detect if device is mobile
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check for touch support
  const hasTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0;

  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  return hasTouch || mobileRegex.test(userAgent);
};

/**
 * Detect if iOS 13+ permission is required
 */
export const needsOrientationPermission = (): boolean => {
  if (!isIOS()) return false;

  return (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission === 'function'
  );
};

/**
 * Detect browser name
 */
export const getBrowserName = (): string => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'Unknown';
  }

  const userAgent = navigator.userAgent;

  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('SamsungBrowser')) return 'Samsung Internet';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  if (userAgent.includes('Trident')) return 'Internet Explorer';
  if (userAgent.includes('Edge')) return 'Edge (Legacy)';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';

  return 'Unknown';
};

/**
 * Check if browser is HTTPS
 */
export const isHTTPS = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.location.protocol === 'https:';
};

/**
 * Get all browser capabilities
 */
export const getBrowserCapabilities = (): BrowserCapabilities => {
  const geoSupport = hasGeolocation();
  const orientationSupport = hasDeviceOrientation();
  const webGLSupport = hasWebGL();
  const ios = isIOS();
  const android = isAndroid();
  const mobile = isMobile();
  const needsPermission = needsOrientationPermission();
  const browser = getBrowserName();
  const https = isHTTPS();

  const warnings: string[] = [];

  // Check for critical missing features
  if (!geoSupport) {
    warnings.push('Geolocation is not supported by your browser');
  }

  if (!orientationSupport) {
    warnings.push('Device orientation sensors are not available');
  }

  if (!webGLSupport) {
    warnings.push('WebGL is not supported - 3D graphics may not work');
  }

  if (!https && typeof window !== 'undefined') {
    warnings.push('HTTPS is required for sensor access on some devices');
  }

  if (!mobile) {
    warnings.push('This experience is designed for mobile devices with sensors');
  }

  // Determine if browser is supported
  const isSupported = geoSupport && orientationSupport && webGLSupport;

  return {
    hasGeolocation: geoSupport,
    hasDeviceOrientation: orientationSupport,
    hasWebGL: webGLSupport,
    isIOS: ios,
    isAndroid: android,
    isMobile: mobile,
    needsOrientationPermission: needsPermission,
    browser,
    isSupported,
    warnings,
  };
};

/**
 * Get user-friendly error message
 */
export const getCompatibilityMessage = (capabilities: BrowserCapabilities): string => {
  if (capabilities.isSupported) {
    if (capabilities.warnings.length > 0) {
      return `Note: ${capabilities.warnings.join('. ')}`;
    }
    return 'Your browser is compatible!';
  }

  if (!capabilities.hasWebGL) {
    return 'Your browser does not support WebGL, which is required for 3D graphics. Please use a modern browser like Chrome, Firefox, Safari, or Edge.';
  }

  if (!capabilities.hasGeolocation) {
    return 'Your browser does not support geolocation. Please enable location services or use a compatible browser.';
  }

  if (!capabilities.hasDeviceOrientation) {
    return 'Your browser does not support device orientation sensors. This feature requires a mobile device with gyroscope.';
  }

  return 'Your browser may not be fully compatible. Please use a modern mobile browser for the best experience.';
};

/**
 * Get recommended browsers
 */
export const getRecommendedBrowsers = (): string[] => {
  return [
    'Chrome (Android/iOS)',
    'Safari (iOS)',
    'Firefox (Android)',
    'Edge (Android/iOS)',
    'Samsung Internet (Android)',
  ];
};

/**
 * Check if should show compatibility warning
 */
export const shouldShowWarning = (capabilities: BrowserCapabilities): boolean => {
  return !capabilities.isSupported || capabilities.warnings.length > 0;
};
