'use client'

import { useEffect, useState } from 'react'
import styles from './SocialProof.module.css'

interface Testimonial {
  name: string
  role: string
  content: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Chen',
    role: 'Amateur Astronomer',
    content: 'This app has completely transformed my stargazing experience. Being able to identify stars and planets instantly is incredible!',
    rating: 5,
  },
  {
    name: 'Michael Torres',
    role: 'Science Teacher',
    content: 'An amazing educational tool for my students. The accuracy and ease of use make learning about astronomy engaging and fun.',
    rating: 5,
  },
  {
    name: 'Emma Williams',
    role: 'Photography Enthusiast',
    content: 'Perfect for planning night sky photography. I can scout locations and know exactly where celestial objects will be.',
    rating: 5,
  },
]

export default function SocialProof() {
  const [githubStars, setGithubStars] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Fetch GitHub stars (replace with actual repo URL when available)
    // For now, using a placeholder value
    const fetchStars = async () => {
      try {
        // Example: const response = await fetch('https://api.github.com/repos/username/star')
        // const data = await response.json()
        // setGithubStars(data.stargazers_count)

        // Placeholder for demo
        setGithubStars(156)
      } catch (error) {
        console.error('Failed to fetch GitHub stars:', error)
        setGithubStars(null)
      }
    }

    fetchStars()

    // Intersection observer for fade-in animation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    const section = document.getElementById('social-proof')
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="social-proof"
      className={`${styles.socialProof} ${isVisible ? styles.visible : ''}`}
    >
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>
          Trusted by <span className={styles.highlight}>Stargazers</span> Worldwide
        </h2>

        {/* Social Stats */}
        <div className={styles.socialStats}>
          {githubStars !== null && (
            <div className={styles.statBadge}>
              <svg
                className={styles.githubIcon}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{githubStars.toLocaleString()}</div>
                <div className={styles.statLabel}>GitHub Stars</div>
              </div>
            </div>
          )}

          <div className={styles.statBadge}>
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>1,000+</div>
              <div className={styles.statLabel}>Active Users</div>
            </div>
          </div>

          <div className={styles.statBadge}>
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>4.9/5</div>
              <div className={styles.statLabel}>Average Rating</div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className={styles.testimonials}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <div className={styles.stars}>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <svg
                    key={i}
                    className={styles.starIcon}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className={styles.testimonialContent}>{testimonial.content}</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className={styles.authorName}>{testimonial.name}</div>
                  <div className={styles.authorRole}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
