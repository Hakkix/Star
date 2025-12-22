'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './AboutPage.module.css'

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={`${styles.hero} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            About <span className={styles.titleGradient}>Star</span>
          </h1>
          <p className={styles.subtitle}>
            Bringing the universe to your fingertips through augmented reality
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            Our <span className={styles.highlight}>Mission</span>
          </h2>
          <p className={styles.missionText}>
            Star was created to make astronomy accessible to everyone. We believe that exploring
            the night sky should be intuitive, educational, and magical. By combining cutting-edge
            web technologies with precise astronomical calculations, we&apos;ve built an AR experience
            that lets you discover the cosmos simply by pointing your device at the sky.
          </p>
          <p className={styles.missionText}>
            Whether you&apos;re a seasoned stargazer or just curious about that bright object in the sky,
            Star helps you identify celestial bodies in real-time and learn about the universe around us.
          </p>
        </div>
      </section>

      {/* Technology Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            Built with <span className={styles.highlight}>Modern Tech</span>
          </h2>

          <div className={styles.techGrid}>
            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className={styles.techTitle}>Next.js 14+</h3>
              <p className={styles.techDescription}>
                React framework with App Router for optimal performance and developer experience
              </p>
            </div>

            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <h3 className={styles.techTitle}>Three.js + R3F</h3>
              <p className={styles.techDescription}>
                WebGL rendering engine with React Three Fiber for 3D graphics and AR visualization
              </p>
            </div>

            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <h3 className={styles.techTitle}>Astronomy Engine</h3>
              <p className={styles.techDescription}>
                Precise astronomical calculations for real-time planet positions and celestial mechanics
              </p>
            </div>

            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M2 12h20"/>
                  <path d="M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>
                </svg>
              </div>
              <h3 className={styles.techTitle}>Device Sensors</h3>
              <p className={styles.techDescription}>
                GPS and gyroscope integration for accurate real-world alignment and positioning
              </p>
            </div>

            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3 className={styles.techTitle}>Hipparcos Catalog</h3>
              <p className={styles.techDescription}>
                5000+ stars from the Hipparcos space mission with accurate positions and magnitudes
              </p>
            </div>

            <div className={styles.techCard}>
              <div className={styles.techIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h3 className={styles.techTitle}>TypeScript</h3>
              <p className={styles.techDescription}>
                Type-safe development for reliable code and better developer experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            Key <span className={styles.highlight}>Features</span>
          </h2>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={styles.featureNumber}>01</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Real-time AR Tracking</h3>
                <p className={styles.featureDescription}>
                  Uses your device&apos;s GPS and gyroscope to accurately map celestial objects
                  based on your exact location and orientation
                </p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureNumber}>02</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>5000+ Stars</h3>
                <p className={styles.featureDescription}>
                  Explore thousands of stars from the Hipparcos catalog with precise positions,
                  magnitudes, and constellation information
                </p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureNumber}>03</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Live Planet Positions</h3>
                <p className={styles.featureDescription}>
                  View real-time positions of planets calculated using precise astronomical
                  algorithms from the Astronomy Engine library
                </p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureNumber}>04</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Interactive Learning</h3>
                <p className={styles.featureDescription}>
                  Tap any celestial object to learn more about it, including distance,
                  constellation, and fascinating astronomical facts
                </p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureNumber}>05</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Privacy-First Design</h3>
                <p className={styles.featureDescription}>
                  All calculations happen on your device. Your location data never leaves
                  your phone, ensuring complete privacy
                </p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureNumber}>06</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Free & Open Source</h3>
                <p className={styles.featureDescription}>
                  Completely free to use with no ads, subscriptions, or hidden costs. Built
                  with open-source technologies and available on GitHub
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            Open Source & <span className={styles.highlight}>Community</span>
          </h2>
          <p className={styles.communityText}>
            Star is open source and we welcome contributions from the community. Whether you&apos;re
            fixing bugs, adding features, or improving documentation, your help makes Star better
            for everyone.
          </p>
          <div className={styles.communityButtons}>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryButton}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>View on GitHub</span>
            </a>
            <Link href="/help" className={styles.secondaryButton}>
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Explore the Cosmos?</h2>
          <p className={styles.ctaDescription}>
            Launch the AR experience and start discovering the universe
          </p>
          <Link href="/ar" className={styles.ctaButton}>
            <span>Launch AR Experience</span>
            <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
