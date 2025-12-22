'use client'

import { Canvas } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import CameraController from './CameraController'
import CelestialSphere from './CelestialSphere'

/**
 * Main 3D scene component for the AR star map
 * Sets up React Three Fiber Canvas with proper configuration for AR experience
 */
export default function Scene() {
  const [hasWebGL, setHasWebGL] = useState(true)
  const [contextLost, setContextLost] = useState(false)

  useEffect(() => {
    // Check WebGL support on mount
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      setHasWebGL(false)
    }
  }, [])

  // Handle WebGL context loss
  const handleContextLost = (event: Event) => {
    event.preventDefault()
    setContextLost(true)
    console.error('WebGL context lost')
  }

  const handleContextRestored = () => {
    setContextLost(false)
    console.log('WebGL context restored')
  }

  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost)
      canvas.addEventListener('webglcontextrestored', handleContextRestored)

      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost)
        canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      }
    }
  }, [])

  if (!hasWebGL) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: '#fff',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h2>WebGL Not Supported</h2>
          <p>Your browser does not support WebGL, which is required for the AR star map.</p>
          <p>Please try using a modern browser like Chrome, Firefox, Safari, or Edge.</p>
        </div>
      </div>
    )
  }

  if (contextLost) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        color: '#fff',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h2>Graphics Context Lost</h2>
          <p>The WebGL context was lost. This can happen when the GPU is overloaded.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <Canvas
      camera={{
        fov: 75,
        near: 0.01,
        far: 2000,
        position: [0, 0, 0.1]
      }}
      gl={{
        antialias: true,
        alpha: false
      }}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000000'
      }}
    >
      {/* Ambient lighting for basic visibility */}
      <ambientLight intensity={0.5} />

      {/* Camera controller syncs camera to device orientation */}
      <CameraController />

      {/* Celestial sphere contains stars, planets, and handles alignment */}
      <CelestialSphere />
    </Canvas>
  )
}
