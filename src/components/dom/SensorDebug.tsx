'use client'

import { useDeviceOrientation } from '@/hooks/useDeviceOrientation'
import { useGPS } from '@/hooks/useGPS'

/**
 * SensorDebug Component
 *
 * Displays real-time sensor and GPS data for debugging purposes.
 * Only visible in development mode (process.env.NODE_ENV === 'development').
 *
 * Sensor Data:
 * - Alpha: Compass heading (0-360°)
 * - Beta: Front-to-back tilt (-180 to 180°)
 * - Gamma: Left-to-right tilt (-90 to 90°)
 * - Permission state
 *
 * GPS Data:
 * - Latitude (-90 to 90°)
 * - Longitude (-180 to 180°)
 * - Accuracy (in meters)
 * - Fallback status
 *
 * Positioned in the bottom-left corner with a semi-transparent overlay.
 */
export function SensorDebug() {
  const {
    alpha,
    beta,
    gamma,
    permission: orientationPermission,
    error: orientationError
  } = useDeviceOrientation()

  const {
    latitude,
    longitude,
    accuracy,
    isFallback,
    error: gpsError
  } = useGPS()

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Format number to fixed decimal places
  const formatNumber = (num: number | null, decimals: number = 2) => {
    if (num === null) return 'N/A'
    return num.toFixed(decimals)
  }

  // Get permission status color
  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'granted':
        return '#10b981' // Green
      case 'denied':
        return '#ef4444' // Red
      case 'prompt':
        return '#f59e0b' // Yellow
      default:
        return '#64748b' // Gray
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        zIndex: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '0.75rem',
        padding: '1rem',
        color: 'white',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        minWidth: '220px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
      }}
    >
      <h3
        style={{
          margin: '0 0 0.75rem 0',
          fontSize: '0.875rem',
          fontWeight: 'bold',
          color: '#667eea',
          borderBottom: '1px solid rgba(102, 126, 234, 0.3)',
          paddingBottom: '0.5rem'
        }}
      >
        Sensor & GPS Debug
      </h3>

      {/* Device Orientation */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: '#a78bfa',
            marginBottom: '0.5rem'
          }}
        >
          Device Orientation
        </div>

        <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Alpha (Z):</span>
          <span style={{ color: '#60a5fa' }}>
            {formatNumber(alpha, 1)}°
          </span>
        </div>

        <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Beta (X):</span>
          <span style={{ color: '#60a5fa' }}>
            {formatNumber(beta, 1)}°
          </span>
        </div>

        <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Gamma (Y):</span>
          <span style={{ color: '#60a5fa' }}>
            {formatNumber(gamma, 1)}°
          </span>
        </div>

        <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Permission:</span>
          <span style={{ color: getPermissionColor(orientationPermission), fontWeight: 'bold' }}>
            {orientationPermission}
          </span>
        </div>

        {orientationError && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.65rem', color: '#ef4444' }}>
            Error: {orientationError}
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          margin: '0.75rem 0'
        }}
      />

      {/* GPS Data */}
      <div>
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: '#a78bfa',
            marginBottom: '0.5rem'
          }}
        >
          GPS Location
        </div>

        <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Latitude:</span>
          <span style={{ color: '#34d399' }}>
            {formatNumber(latitude, 4)}°
          </span>
        </div>

        <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Longitude:</span>
          <span style={{ color: '#34d399' }}>
            {formatNumber(longitude, 4)}°
          </span>
        </div>

        <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Accuracy:</span>
          <span style={{ color: '#34d399' }}>
            {accuracy !== null ? `${formatNumber(accuracy, 0)}m` : 'N/A'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Status:</span>
          <span style={{ color: isFallback ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>
            {isFallback ? 'Fallback' : 'Active'}
          </span>
        </div>

        {gpsError && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.65rem', color: '#ef4444' }}>
            Error: {gpsError.message}
          </div>
        )}
      </div>

      {/* Environment indicator */}
      <div
        style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.65rem',
          color: '#64748b',
          textAlign: 'center'
        }}
      >
        Development Mode
      </div>
    </div>
  )
}
