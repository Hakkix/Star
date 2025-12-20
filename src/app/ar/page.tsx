'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './ar.module.css'

export default function ARExperience() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.placeholder}>
        <div className={styles.content}>
          <h1 className={styles.title}>AR Experience</h1>
          <p className={styles.message}>
            The AR star map will be implemented here using Three.js, React Three Fiber, and device sensors.
          </p>
          <p className={styles.features}>
            <strong>Coming soon:</strong>
          </p>
          <ul className={styles.featureList}>
            <li>Real-time device orientation tracking</li>
            <li>GPS-based celestial positioning</li>
            <li>5000+ stars from Hipparcos catalog</li>
            <li>Live planet positions</li>
            <li>Interactive constellation overlay</li>
            <li>Tap-to-learn celestial object details</li>
          </ul>
          <Link href="/" className={styles.backButton}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
