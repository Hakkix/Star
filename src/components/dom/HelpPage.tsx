'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './HelpPage.module.css'

export default function HelpPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const faqs = [
    {
      question: 'What devices are supported?',
      answer: 'Star works on any modern smartphone or tablet with GPS and gyroscope sensors. This includes most iOS (iPhone/iPad) and Android devices. Desktop browsers are not recommended as they typically lack motion sensors.'
    },
    {
      question: 'Why do I need to grant permissions?',
      answer: 'Star needs access to your device location (GPS) to calculate which stars and planets are visible from your position. Motion sensors (gyroscope) are required to align the AR view with your device orientation. All data stays on your device and is never uploaded to any server.'
    },
    {
      question: 'Does Star work during the day?',
      answer: 'Yes! While you cannot see stars during the day, Star still shows you where celestial objects are located. This is great for learning or finding planets like Venus that are sometimes visible in daylight.'
    },
    {
      question: 'How accurate is the star positioning?',
      answer: 'Star uses precise astronomical calculations and real-time sensor data. Accuracy depends on your device\'s GPS and gyroscope quality. For best results, calibrate your compass in device settings and ensure you have a clear view of the sky.'
    },
    {
      question: 'Can I use Star offline?',
      answer: 'Once the page is loaded, Star works offline. Star catalogs are downloaded with the app. However, you need location services enabled, which may require an initial GPS fix online.'
    },
    {
      question: 'Why aren\'t planets showing up?',
      answer: 'Make sure planet visibility is enabled in Settings. Also, some planets may be below the horizon or very close to the Sun, making them difficult to observe. Check the planet positions before going outside.'
    },
    {
      question: 'How do I recalibrate my device?',
      answer: 'Most devices require calibration by moving your phone in a figure-8 pattern. On iOS, go to Settings > Privacy & Security > Location Services > System Services > Compass Calibration. On Android, open the Compass app and follow calibration prompts.'
    },
    {
      question: 'Is my location data private?',
      answer: 'Absolutely! All astronomical calculations happen locally on your device. Your GPS coordinates are never sent to any server. Star is completely privacy-first and works entirely in your browser.'
    }
  ]

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={`${styles.hero} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            <span className={styles.titleGradient}>Help</span> & Documentation
          </h1>
          <p className={styles.subtitle}>
            Everything you need to know to explore the cosmos with Star
          </p>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            Quick <span className={styles.highlight}>Start</span>
          </h2>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Launch the AR Experience</h3>
                <p className={styles.stepDescription}>
                  Click the &quot;Launch AR Experience&quot; button from the home page or navigation menu
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Grant Permissions</h3>
                <p className={styles.stepDescription}>
                  Allow access to your location (GPS) and device motion sensors when prompted. These are required for AR tracking
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Point at the Sky</h3>
                <p className={styles.stepDescription}>
                  Hold your device up and point it at the sky. Stars and planets will appear overlaid on your camera view
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Tap to Learn More</h3>
                <p className={styles.stepDescription}>
                  Tap on any celestial object to view detailed information including name, distance, and constellation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Device Requirements */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            Device <span className={styles.highlight}>Requirements</span>
          </h2>

          <div className={styles.requirementGrid}>
            <div className={styles.requirementCard}>
              <div className={styles.requirementIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>
              <h3 className={styles.requirementTitle}>Smartphone/Tablet</h3>
              <p className={styles.requirementDescription}>
                iOS 13+ or Android 8.0+ with modern browser (Safari, Chrome)
              </p>
            </div>

            <div className={styles.requirementCard}>
              <div className={styles.requirementIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <h3 className={styles.requirementTitle}>GPS</h3>
              <p className={styles.requirementDescription}>
                Location services for accurate celestial positioning
              </p>
            </div>

            <div className={styles.requirementCard}>
              <div className={styles.requirementIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M2 12h20"/>
                  <path d="M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>
                </svg>
              </div>
              <h3 className={styles.requirementTitle}>Gyroscope</h3>
              <p className={styles.requirementDescription}>
                Motion sensors to track device orientation in real-time
              </p>
            </div>

            <div className={styles.requirementCard}>
              <div className={styles.requirementIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                  <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                  <line x1="12" y1="20" x2="12.01" y2="20"/>
                </svg>
              </div>
              <h3 className={styles.requirementTitle}>Internet Connection</h3>
              <p className={styles.requirementDescription}>
                Initial load only - works offline after page loads
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.highlight}>Troubleshooting</span>
          </h2>

          <div className={styles.troubleshootingList}>
            <div className={styles.troubleshootingItem}>
              <h3 className={styles.troubleshootingTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Stars aren&apos;t appearing
              </h3>
              <ul className={styles.troubleshootingSolutions}>
                <li>Ensure you&apos;ve granted location and motion permissions</li>
                <li>Check that GPS is enabled in your device settings</li>
                <li>Make sure you&apos;re pointing the device at the sky, not the ground</li>
                <li>Try refreshing the page and granting permissions again</li>
              </ul>
            </div>

            <div className={styles.troubleshootingItem}>
              <h3 className={styles.troubleshootingTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Stars are in the wrong position
              </h3>
              <ul className={styles.troubleshootingSolutions}>
                <li>Calibrate your device compass (figure-8 motion)</li>
                <li>Ensure your device time and timezone are set correctly</li>
                <li>Move away from magnetic interference (metal objects, electronics)</li>
                <li>Check GPS accuracy - wait for better signal if needed</li>
              </ul>
            </div>

            <div className={styles.troubleshootingItem}>
              <h3 className={styles.troubleshootingTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Performance is slow or laggy
              </h3>
              <ul className={styles.troubleshootingSolutions}>
                <li>Close other apps running in the background</li>
                <li>Try reducing the number of visible objects in Settings</li>
                <li>Restart your browser or device</li>
                <li>Ensure your device meets minimum requirements</li>
              </ul>
            </div>

            <div className={styles.troubleshootingItem}>
              <h3 className={styles.troubleshootingTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Permission request doesn&apos;t appear (iOS)
              </h3>
              <ul className={styles.troubleshootingSolutions}>
                <li>Permissions must be triggered by user interaction - tap the button</li>
                <li>Check Safari Settings &gt; Privacy &amp; Security</li>
                <li>Ensure Location Services are enabled for Safari</li>
                <li>Try using HTTPS (required for sensors on iOS)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.section}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            Frequently Asked <span className={styles.highlight}>Questions</span>
          </h2>

          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openFAQ === index}
                >
                  <span>{faq.question}</span>
                  <svg
                    className={`${styles.faqIcon} ${openFAQ === index ? styles.open : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {openFAQ === index && (
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
          <p className={styles.ctaDescription}>
            Launch the AR experience and start exploring the night sky
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/ar" className={styles.primaryButton}>
              <span>Launch AR Experience</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/about" className={styles.secondaryButton}>
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
