'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './About.module.css'

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const techStack = [
    { name: 'Next.js 14+', purpose: 'React framework with App Router' },
    { name: 'Three.js', purpose: '3D rendering engine' },
    { name: 'React Three Fiber', purpose: 'React renderer for Three.js' },
    { name: '@react-three/drei', purpose: 'Three.js helpers' },
    { name: 'astronomy-engine', purpose: 'Celestial calculations' },
    { name: 'Zustand', purpose: 'State management' },
    { name: 'TypeScript', purpose: 'Type-safe development' },
  ]

  const dataSources = [
    { name: 'Hipparcos Catalog', description: 'High-precision star positions and magnitudes' },
    { name: 'astronomy-engine', description: 'Real-time planetary position calculations' },
    { name: 'IAU Standards', description: 'Celestial coordinate systems and constellation boundaries' },
  ]

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>About Star</h1>
          <p className={styles.subtitle}>
            Bringing the cosmos to your fingertips through augmented reality
          </p>
        </header>

        {/* Mission Section */}
        <section className={styles.section} aria-labelledby="mission-heading">
          <h2 id="mission-heading" className={styles.sectionTitle}>Our Mission</h2>
          <p className={styles.text}>
            Star is an open-source web-based augmented reality star map designed to make astronomy
            accessible to everyone. By combining your device&apos;s GPS and orientation sensors with
            precise astronomical calculations, we create an immersive experience that lets you
            explore the night sky in real-time.
          </p>
          <p className={styles.text}>
            Our vision is to inspire curiosity about the universe and make stargazing as simple
            as pointing your phone at the sky. No special equipment needed – just your smartphone
            and a clear view of the stars.
          </p>
        </section>

        {/* Technology Section */}
        <section className={styles.section} aria-labelledby="tech-heading">
          <h2 id="tech-heading" className={styles.sectionTitle}>Technology Stack</h2>
          <p className={styles.text}>
            Star is built with cutting-edge web technologies to deliver a smooth 60 FPS AR
            experience on mobile devices:
          </p>
          <div className={styles.techGrid}>
            {techStack.map((tech) => (
              <div key={tech.name} className={styles.techCard}>
                <h3 className={styles.techName}>{tech.name}</h3>
                <p className={styles.techPurpose}>{tech.purpose}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data Sources Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Sources</h2>
          <p className={styles.text}>
            We use scientifically accurate data from trusted astronomical sources:
          </p>
          <div className={styles.dataGrid}>
            {dataSources.map((source) => (
              <div key={source.name} className={styles.dataCard}>
                <h3 className={styles.dataName}>{source.name}</h3>
                <p className={styles.dataDescription}>{source.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Source Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Open Source</h2>
          <p className={styles.text}>
            Star is proudly open source. We believe that knowledge about the universe should be
            free and accessible to all. The entire codebase is available on GitHub, and we welcome
            contributions from developers, astronomers, and enthusiasts worldwide.
          </p>
          <div className={styles.buttonGroup}>
            <a
              href="https://github.com/Hakkix/Star"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.button}
            >
              View on GitHub
            </a>
            <Link href="/help" className={`${styles.button} ${styles.buttonSecondary}`}>
              Documentation
            </Link>
          </div>
        </section>

        {/* Privacy Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Privacy & Data</h2>
          <p className={styles.text}>
            Your privacy is paramount. Star operates entirely on your device:
          </p>
          <ul className={styles.list}>
            <li>GPS coordinates never leave your device</li>
            <li>All astronomical calculations are performed locally</li>
            <li>No user data is collected, stored, or transmitted</li>
            <li>No analytics or tracking scripts</li>
            <li>No cookies or third-party services</li>
          </ul>
          <p className={styles.text}>
            Your location is used solely to calculate the correct orientation of the celestial
            sphere. The moment you close the app, all data is discarded.
          </p>
        </section>

        {/* Team Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Team & Contributors</h2>
          <p className={styles.text}>
            Star is maintained by a community of developers, astronomers, and space enthusiasts.
            Special thanks to all contributors who have helped make this project possible.
          </p>
          <p className={styles.text}>
            Interested in contributing? Check out our{' '}
            <a
              href="https://github.com/Hakkix/Star/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              contributing guidelines
            </a>{' '}
            to get started.
          </p>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>
            Questions or feedback?{' '}
            <Link href="/help" className={styles.link}>
              Visit our Help page
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
