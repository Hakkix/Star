'use client'

import { useEffect } from 'react'

/**
 * Global Error Boundary
 * Catches unhandled errors throughout the entire application
 * Provides user-friendly error recovery options
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console (could be integrated with error tracking like Sentry)
    console.error('Global Application Error:', error)
  }, [error])

  return (
    <html>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#000',
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            marginBottom: '1rem',
            color: '#ff6b6b'
          }}>
            ❌ Application Error
          </h1>

          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            color: '#ccc'
          }}>
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>

          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#999',
            wordBreak: 'break-word',
            textAlign: 'left'
          }}>
            <strong>Error Details:</strong>
            <pre style={{
              marginTop: '0.5rem',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}>
              {error.message}
            </pre>
            {error.digest && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Error ID:</strong> {error.digest}
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
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

            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#fff',
                backgroundColor: '#555',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#666'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#555'}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
