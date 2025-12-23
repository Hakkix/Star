/**
 * Service Worker for Star AR Map
 * Handles offline support, caching, and background sync
 *
 * This service worker caches essential assets and provides offline functionality
 */

const CACHE_NAME = 'star-v1'
const ASSET_CACHE_NAME = 'star-assets-v1'
const API_CACHE_NAME = 'star-api-v1'

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/globals.css'
]

// Install event: cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching essential assets')
      return cache.addAll(ASSETS_TO_CACHE)
    }).catch((error) => {
      console.error('[Service Worker] Cache installation failed:', error)
    })
  )

  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('star-') &&
                   cacheName !== CACHE_NAME &&
                   cacheName !== ASSET_CACHE_NAME &&
                   cacheName !== API_CACHE_NAME
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )

  // Claim all clients immediately
  self.clients.claim()
})

// Fetch event: implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome extensions and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Different strategies for different types of requests
  if (request.destination === 'image' || request.destination === 'font') {
    // Cache-first strategy for images and fonts
    event.respondWith(cacheImageOrFont(request))
  } else if (url.pathname.startsWith('/api/')) {
    // Network-first strategy for API calls
    event.respondWith(networkFirst(request))
  } else if (request.destination === 'document') {
    // Network-first strategy for pages
    event.respondWith(networkFirst(request))
  } else {
    // Cache-first strategy for other assets
    event.respondWith(cacheFirst(request))
  }
})

/**
 * Cache-first strategy: return from cache if available, otherwise fetch
 */
function cacheFirst(request) {
  return caches.match(request).then((response) => {
    if (response) {
      return response
    }

    return fetch(request).then((response) => {
      // Don't cache if not successful
      if (!response || response.status !== 200 || response.type === 'error') {
        return response
      }

      // Clone and cache the response
      const responseClone = response.clone()
      caches.open(ASSET_CACHE_NAME).then((cache) => {
        cache.put(request, responseClone)
      })

      return response
    }).catch(() => {
      // Return offline page or cached response
      return caches.match(request)
    })
  })
}

/**
 * Network-first strategy: fetch first, fall back to cache if offline
 */
function networkFirst(request) {
  return fetch(request).then((response) => {
    // Don't cache if not successful
    if (!response || response.status !== 200) {
      return response
    }

    // Clone and cache the response
    const responseClone = response.clone()

    const cacheName = request.url.includes('/api/') ? API_CACHE_NAME : CACHE_NAME
    caches.open(cacheName).then((cache) => {
      cache.put(request, responseClone)
    })

    return response
  }).catch(() => {
    // Fall back to cache
    return caches.match(request)
  })
}

/**
 * Cache images and fonts with a specific strategy
 */
function cacheImageOrFont(request) {
  return caches.open(ASSET_CACHE_NAME).then((cache) => {
    return cache.match(request).then((response) => {
      return (
        response ||
        fetch(request).then((response) => {
          // Only cache successful responses
          if (response && response.status === 200) {
            cache.put(request, response.clone())
          }
          return response
        }).catch(() => {
          // Provide fallback for images
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
              '<rect fill="#f0f0f0" width="100" height="100"/>' +
              '<text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image unavailable</text>' +
              '</svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            )
          }
          return null
        })
      )
    })
  })
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
