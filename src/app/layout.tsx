import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navigation from '@/components/dom/Navigation'
import { SkipLink } from '@/components/dom/SkipLink'
import { PWAInit } from '@/components/dom/PWAInit'

export const metadata: Metadata = {
  title: 'Star - AR Star Map',
  description: 'Explore the cosmos in augmented reality. Point your device at the sky and discover stars, planets, and constellations in real-time.',
  keywords: ['AR', 'astronomy', 'star map', 'augmented reality', 'celestial', 'planets', 'constellations'],
  authors: [{ name: 'Star Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-192.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Star Map',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PWAInit />
        <SkipLink />
        <Navigation />
        <main id="main-content" role="main">
          {children}
        </main>
      </body>
    </html>
  )
}
