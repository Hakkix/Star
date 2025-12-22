'use client'

import { useState } from 'react'
import styles from './FAQ.module.css'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: 'What devices are supported?',
    answer:
      'Star works on modern smartphones and tablets with GPS and gyroscope sensors. For the best experience, use iOS 13+ (Safari) or Android 8+ (Chrome). Desktop browsers can view the demo but lack motion sensors for the full AR experience.',
  },
  {
    question: 'Does this work during daytime?',
    answer:
      'Yes! Star shows you where stars and planets are located even during the day. While you won\'t see them in the real sky, our AR overlay displays their accurate positions in real-time, making it a great educational tool anytime.',
  },
  {
    question: 'How accurate is the star positioning?',
    answer:
      'Star uses the Hipparcos catalog and the astronomy-engine library for precise celestial calculations. Positions are accurate to within a few arcminutes, comparable to professional planetarium software. Accuracy depends on your device\'s GPS precision and sensor calibration.',
  },
  {
    question: 'Why do I need to grant permissions?',
    answer:
      'Star requires GPS access to determine your exact location for accurate star positioning, and device orientation access to align the AR view with your physical direction. On iOS 13+, orientation access requires explicit user permission for privacy protection.',
  },
  {
    question: 'Is my location data stored?',
    answer:
      'No! All astronomical calculations happen entirely on your device. Your location data never leaves your phone, and we don\'t collect, store, or transmit any personal information. Star is privacy-first and works completely offline after initial load.',
  },
  {
    question: 'Can I use this without internet?',
    answer:
      'After the initial page load, Star works offline for basic features. The star catalog and planetary calculation libraries are downloaded to your device. However, you\'ll need internet for the first visit and to receive app updates.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className={styles.faq}>
      <div className={styles.faqContainer}>
        <h2 className={styles.sectionTitle}>
          Frequently Asked <span className={styles.highlight}>Questions</span>
        </h2>

        <div className={styles.faqList}>
          {faqData.map((item, index) => (
            <div key={index} className={styles.faqItem}>
              <button
                className={`${styles.faqQuestion} ${
                  openIndex === index ? styles.active : ''
                }`}
                onClick={() => toggleItem(index)}
                aria-expanded={openIndex === index}
              >
                <span>{item.question}</span>
                <svg
                  className={styles.faqIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`${styles.faqAnswer} ${
                  openIndex === index ? styles.open : ''
                }`}
              >
                <div className={styles.faqAnswerContent}>
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
