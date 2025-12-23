import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from '@/components/dom/Navigation'
import { SkipLink } from '@/components/dom/SkipLink'

export const metadata: Metadata = {
  title: 'Star - AR Star Map',
  description: 'Explore the cosmos in augmented reality. Point your device at the sky and discover stars, planets, and constellations in real-time.',
  keywords: ['AR', 'astronomy', 'star map', 'augmented reality', 'celestial', 'planets', 'constellations'],
  authors: [{ name: 'Star Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <Navigation />
        <main id="main-content" role="main">
          {children}
        </main>
      </body>
    </html>
  )
}
