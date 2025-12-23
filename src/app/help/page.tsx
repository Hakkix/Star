'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './Help.module.css'

export default function HelpPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section)
  }

  const compatibilityData = [
    { device: 'iOS (Safari)', gps: '✓', orientation: '✓ (iOS 13+ requires permission)', ar: '✓' },
    { device: 'Android (Chrome)', gps: '✓', orientation: '✓', ar: '✓' },
    { device: 'Android (Firefox)', gps: '✓', orientation: '✓', ar: '✓' },
    { device: 'Desktop (Chrome)', gps: '✗', orientation: '✗', ar: 'Limited' },
    { device: 'Desktop (Firefox)', gps: '✗', orientation: '✗', ar: 'Limited' },
  ]

  const troubleshooting = [
    {
      issue: "Stars don't appear",
      solutions: [
        'Check that you granted GPS and sensor permissions',
        'Ensure you have a clear view of the sky (away from buildings)',
        'Try refreshing the page',
        'Check your browser console for WebGL errors',
      ],
    },
    {
      issue: 'Camera orientation is wrong',
      solutions: [
        'On iOS, make sure you approved DeviceOrientation permission',
        'Try calibrating your device compass (Settings > Privacy > Location Services > System Services > Compass Calibration)',
        'Hold your device upright in portrait mode',
        'Move your device in a figure-8 pattern to recalibrate sensors',
      ],
    },
    {
      issue: 'Stars are in wrong positions',
      solutions: [
        'Verify your GPS location is accurate',
        'Check your device clock is set correctly',
        'Make sure you are outdoors with clear sky visibility',
        'Wait a few seconds for GPS to acquire accurate lock',
      ],
    },
    {
      issue: 'Low frame rate / lag',
      solutions: [
        'Close other browser tabs and apps',
        'Reduce screen brightness',
        'Disable battery saver mode',
        'Try clearing browser cache',
      ],
    },
    {
      issue: 'Permission denied errors',
      solutions: [
        'On iOS: Go to Settings > Safari > Advanced > Website Data, clear for this site, then reload',
        'On Android: Go to Site Settings in browser, reset permissions',
        'Make sure you clicked "Allow" on permission prompts',
        'Try using HTTPS (required for sensor access)',
      ],
    },
  ]

  const tips = [
    {
      title: 'Best Time to Stargaze',
      description: 'Use Star between sunset and sunrise, when the sky is dark. Avoid full moon nights for best visibility of faint stars.',
    },
    {
      title: 'Location Matters',
      description: 'Get away from city lights (light pollution). Parks, countryside, or beaches offer the best views.',
    },
    {
      title: 'Give Your Eyes Time',
      description: 'Let your eyes adjust to darkness for 15-20 minutes. Use Star\'s night mode to preserve night vision.',
    },
    {
      title: 'Steady Your Device',
      description: 'For best results, hold your phone steady or use a tripod mount when identifying faint objects.',
    },
    {
      title: 'Battery Life',
      description: 'AR mode uses GPS, sensors, and 3D rendering which drains battery. Bring a portable charger for extended sessions.',
    },
  ]

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Help & Documentation</h1>
          <p className={styles.subtitle}>
            Everything you need to know to get the most out of Star
          </p>
        </header>

        {/* Quick Navigation */}
        <nav className={styles.quickNav}>
          <a href="#getting-started" className={styles.navLink}>Getting Started</a>
          <a href="#compatibility" className={styles.navLink}>Compatibility</a>
          <a href="#troubleshooting" className={styles.navLink}>Troubleshooting</a>
          <a href="#tips" className={styles.navLink}>Tips</a>
          <a href="#contact" className={styles.navLink}>Contact</a>
        </nav>

        {/* Getting Started */}
        <section id="getting-started" className={styles.section}>
          <h2 className={styles.sectionTitle}>Getting Started</h2>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Open Star on Your Mobile Device</h3>
                <p className={styles.stepDescription}>
                  For the best experience, use a smartphone with GPS and orientation sensors.
                  Desktop browsers have limited functionality.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Grant Permissions</h3>
                <p className={styles.stepDescription}>
                  When prompted, allow access to your location (GPS) and device orientation
                  (sensors). These are essential for accurate star positioning.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Point at the Sky</h3>
                <p className={styles.stepDescription}>
                  Hold your device up toward the sky. The AR view will show stars and planets
                  aligned with your real-world view.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Explore & Learn</h3>
                <p className={styles.stepDescription}>
                  Tap any star or planet to see detailed information. Move your device to explore
                  different parts of the sky.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Compatibility */}
        <section id="compatibility" className={styles.section}>
          <h2 className={styles.sectionTitle}>Device Compatibility</h2>
          <p className={styles.text}>
            Star works best on modern smartphones with GPS and orientation sensors. Here&apos;s a
            compatibility overview:
          </p>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Device / Browser</th>
                  <th>GPS</th>
                  <th>Orientation</th>
                  <th>AR Support</th>
                </tr>
              </thead>
              <tbody>
                {compatibilityData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.device}</td>
                    <td>{row.gps}</td>
                    <td>{row.orientation}</td>
                    <td>{row.ar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.note}>
            <strong>Note:</strong> HTTPS is required for sensor access. Some features may not work
            on older devices or browsers.
          </div>
        </section>

        {/* Troubleshooting */}
        <section id="troubleshooting" className={styles.section}>
          <h2 className={styles.sectionTitle}>Troubleshooting Common Issues</h2>
          <div className={styles.accordion}>
            {troubleshooting.map((item, index) => (
              <div key={index} className={styles.accordionItem}>
                <button
                  className={`${styles.accordionButton} ${
                    activeSection === `trouble-${index}` ? styles.active : ''
                  }`}
                  onClick={() => toggleSection(`trouble-${index}`)}
                >
                  <span>{item.issue}</span>
                  <span className={styles.accordionIcon}>
                    {activeSection === `trouble-${index}` ? '−' : '+'}
                  </span>
                </button>
                {activeSection === `trouble-${index}` && (
                  <div className={styles.accordionContent}>
                    <ul className={styles.solutionList}>
                      {item.solutions.map((solution, sIndex) => (
                        <li key={sIndex}>{solution}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Tips for Best Experience */}
        <section id="tips" className={styles.section}>
          <h2 className={styles.sectionTitle}>Tips for Best Experience</h2>
          <div className={styles.tipsGrid}>
            {tips.map((tip, index) => (
              <div key={index} className={styles.tipCard}>
                <h3 className={styles.tipTitle}>{tip.title}</h3>
                <p className={styles.tipDescription}>{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Keyboard Shortcuts (Desktop)</h2>
          <div className={styles.shortcutsGrid}>
            <div className={styles.shortcut}>
              <kbd className={styles.kbd}>Esc</kbd>
              <span>Close overlays/modals</span>
            </div>
            <div className={styles.shortcut}>
              <kbd className={styles.kbd}>?</kbd>
              <span>Open help overlay</span>
            </div>
            <div className={styles.shortcut}>
              <kbd className={styles.kbd}>Space</kbd>
              <span>Toggle play/pause (time travel mode)</span>
            </div>
            <div className={styles.shortcut}>
              <kbd className={styles.kbd}>Tab</kbd>
              <span>Navigate interactive elements</span>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className={styles.section}>
          <h2 className={styles.sectionTitle}>Need More Help?</h2>
          <p className={styles.text}>
            Can&apos;t find what you&apos;re looking for? We&apos;re here to help!
          </p>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <h3 className={styles.contactTitle}>GitHub Issues</h3>
              <p className={styles.contactDescription}>
                Report bugs or request features on our GitHub repository.
              </p>
              <a
                href="https://github.com/Hakkix/Star/issues"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.button}
              >
                Open an Issue
              </a>
            </div>
            <div className={styles.contactCard}>
              <h3 className={styles.contactTitle}>Documentation</h3>
              <p className={styles.contactDescription}>
                Read the full technical documentation and guides.
              </p>
              <a
                href="https://github.com/Hakkix/Star/blob/main/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.button}
              >
                View Docs
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>
            <Link href="/about" className={styles.link}>
              Learn more about Star
            </Link>
            {' • '}
            <Link href="/" className={styles.link}>
              Back to Home
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
