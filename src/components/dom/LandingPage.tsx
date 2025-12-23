'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { ARLaunchLink } from './ARLaunchButton'
import styles from './LandingPage.module.css'

// Dynamic imports for components below the fold
const FAQ = dynamic(() => import('./FAQ'), {
  loading: () => <div style={{ minHeight: '600px' }} />,
})

const SocialProof = dynamic(() => import('./SocialProof'), {
  loading: () => <div style={{ minHeight: '400px' }} />,
})

// Animated counter component for statistics
function AnimatedCounter({ end, duration, suffix = '' }: { end: number; duration: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.5 }
    )

    if (counterRef.current) {
      observer.observe(counterRef.current)
    }

    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [hasStarted, end, duration])

  return <span ref={counterRef}>{count.toLocaleString()}{suffix}</span>
}

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  const rotatingTexts = [
    "Identify constellations in real-time",
    "Track planets across the sky",
    "Learn about 5000+ stars",
    "Discover the cosmos in AR"
  ]

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Animated text carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [rotatingTexts.length])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Star particle system
    class Star {
      x: number
      y: number
      z: number
      px: number
      py: number
      width: number
      height: number

      constructor(width: number, height: number) {
        this.width = width
        this.height = height
        this.x = Math.random() * width - width / 2
        this.y = Math.random() * height - height / 2
        this.z = Math.random() * 1000
        this.px = 0
        this.py = 0
      }

      update(speed: number) {
        this.z -= speed
        if (this.z <= 0) {
          this.z = 1000
          this.x = Math.random() * this.width - this.width / 2
          this.y = Math.random() * this.height - this.height / 2
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const x = (this.x / this.z) * 200 + this.width / 2
        const y = (this.y / this.z) * 200 + this.height / 2
        const size = (1 - this.z / 1000) * 2

        const opacity = 1 - this.z / 1000
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        // Draw trail
        if (this.px !== 0 && this.py !== 0) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`
          ctx.lineWidth = size
          ctx.beginPath()
          ctx.moveTo(this.px, this.py)
          ctx.lineTo(x, y)
          ctx.stroke()
        }

        this.px = x
        this.py = y
      }
    }

    const stars: Star[] = []
    const numStars = 500

    for (let i = 0; i < numStars; i++) {
      stars.push(new Star(canvas.width, canvas.height))
    }

    const speed = 0.5
    let animationId: number

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach(star => {
        star.update(speed)
        star.draw(ctx)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.starfield} />

      {/* Hero Section */}
      <section className={`${styles.hero} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            <span className={styles.titleGradient}>Explore</span> the Cosmos
          </h1>
          <p className={styles.subtitle}>
            <span className={styles.rotatingText} key={currentTextIndex}>
              {rotatingTexts[currentTextIndex]}
            </span>
          </p>
          <div className={styles.heroButtons}>
            <ARLaunchLink className={styles.primaryButton}>
              <span>Launch AR Experience</span>
              <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </ARLaunchLink>
            <a href="#features" className={styles.secondaryButton}>
              Learn More
            </a>
          </div>

          {/* Statistics Section */}
          <div className={styles.statistics}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>
                <AnimatedCounter end={5000} duration={2000} suffix="+" />
              </div>
              <div className={styles.statLabel}>Stars</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>
                <AnimatedCounter end={8} duration={2000} suffix="" />
              </div>
              <div className={styles.statLabel}>Planets</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>
                <AnimatedCounter end={88} duration={2000} suffix="" />
              </div>
              <div className={styles.statLabel}>Constellations</div>
            </div>
          </div>
        </div>
        <div className={styles.scrollIndicator}>
          <div className={styles.mouse}>
            <div className={styles.wheel}></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>
            Experience the <span className={styles.highlight}>Universe</span>
          </h2>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Real-time Tracking</h3>
              <p className={styles.featureDescription}>
                Uses your device&apos;s GPS and gyroscope to accurately map celestial objects based on your location and orientation
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>5000+ Stars</h3>
              <p className={styles.featureDescription}>
                Explore thousands of stars from the Hipparcos catalog with accurate positions, magnitudes, and constellation data
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Live Planets</h3>
              <p className={styles.featureDescription}>
                View real-time positions of planets, calculated using precise astronomical algorithms
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Interactive AR</h3>
              <p className={styles.featureDescription}>
                Tap any celestial object to learn more about it. Discover constellations, distances, and fascinating facts
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Privacy First</h3>
              <p className={styles.featureDescription}>
                All calculations happen on your device. Your location data never leaves your phone
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Free & Open</h3>
              <p className={styles.featureDescription}>
                Completely free to use with no ads or subscriptions. Built with open-source technologies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <SocialProof />

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.howItWorksContainer}>
          <h2 className={styles.sectionTitle}>
            How It <span className={styles.highlight}>Works</span>
          </h2>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Grant Permissions</h3>
              <p className={styles.stepDescription}>
                Allow access to your device&apos;s location and motion sensors
              </p>
            </div>

            <div className={styles.stepConnector}></div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Point at the Sky</h3>
              <p className={styles.stepDescription}>
                Aim your device toward any part of the night sky
              </p>
            </div>

            <div className={styles.stepConnector}></div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Explore & Discover</h3>
              <p className={styles.stepDescription}>
                See stars, planets, and constellations overlaid in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Explore?</h2>
          <p className={styles.ctaDescription}>
            The universe is waiting. Start your journey through the cosmos.
          </p>
          <ARLaunchLink className={styles.ctaButton}>
            <span>Launch AR Experience</span>
            <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </ARLaunchLink>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            Built with Next.js, Three.js, and astronomy-engine
          </p>
          <p className={styles.footerCopyright}>
            © {new Date().getFullYear()} Star. Open source and free forever.
          </p>
        </div>
      </footer>
    </div>
  )
}
