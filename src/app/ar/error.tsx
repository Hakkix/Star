'use client'

import { useEffect } from 'react'

/**
 * AR Page Error Boundary
 * Catches and displays errors that occur in the AR experience
 * Provides user-friendly error messages and recovery options
 */

export default function ARError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console (could be sent to error tracking service like Sentry)
    console.error('AR Experience Error:', error)
  }, [error])

  // Determine error type and provide specific messaging
  const isWebGLError = error.message.toLowerCase().includes('webgl') ||
                       error.message.toLowerCase().includes('context')
  const isSensorError = error.message.toLowerCase().includes('sensor') ||
                        error.message.toLowerCase().includes('orientation') ||
                        error.message.toLowerCase().includes('permission')
  const isGPSError = error.message.toLowerCase().includes('gps') ||
                     error.message.toLowerCase().includes('geolocation') ||
                     error.message.toLowerCase().includes('location')

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#fff',
      textAlign: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff6b6b' }}>
          {isWebGLError && '⚠️ Graphics Error'}
          {isSensorError && '📱 Sensor Error'}
          {isGPSError && '📍 Location Error'}
          {!isWebGLError && !isSensorError && !isGPSError && '❌ Something Went Wrong'}
        </h1>

        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#ccc' }}>
          {isWebGLError && 'There was a problem initializing the 3D graphics. This may be due to GPU limitations or browser compatibility.'}
          {isSensorError && 'Unable to access device sensors. Please ensure you have granted the necessary permissions.'}
          {isGPSError && 'Unable to access your location. Please ensure location services are enabled and permission is granted.'}
          {!isWebGLError && !isSensorError && !isGPSError && 'The AR experience encountered an unexpected error. Please try again.'}
        </p>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '8px', fontSize: '0.9rem', color: '#999', wordBreak: 'break-word' }}>
          <strong>Error Details:</strong>
          <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
            {error.message}
          </pre>
          {error.digest && (
            <div style={{ marginTop: '0.5rem' }}>
              <strong>Error ID:</strong> {error.digest}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#fff',
              backgroundColor: '#4CAF50',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
          >
            Try Again
          </button>

          <a
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#fff',
              backgroundColor: '#555',
              border: 'none',
              borderRadius: '8px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#666'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#555'}
          >
            Go Home
          </a>
        </div>

        {isWebGLError && (
          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
            💡 Try using a modern browser like Chrome, Firefox, Safari, or Edge
          </p>
        )}

        {isSensorError && (
          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
            💡 On iOS, tap the permission button and allow device orientation access
          </p>
        )}

        {isGPSError && (
          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
            💡 Check your device settings to ensure location services are enabled
          </p>
        )}
      </div>
    </div>
  )
}
