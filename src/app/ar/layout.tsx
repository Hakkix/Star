import { Metadata, Viewport } from 'next'

/**
 * AR Page Layout
 * Provides metadata and layout configuration for the AR experience
 */

export const metadata: Metadata = {
  title: 'AR Star Map | Star',
  description: 'Interactive augmented reality star map. Point your device at the sky to explore stars, planets, and constellations in real-time.',
  keywords: ['AR', 'augmented reality', 'star map', 'astronomy', 'celestial navigation', 'planets', 'stars', 'constellations'],
  openGraph: {
    title: 'AR Star Map | Star',
    description: 'Interactive augmented reality star map using device sensors',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function ARLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
