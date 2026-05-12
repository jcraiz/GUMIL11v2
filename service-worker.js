/**
 * GET UNDERWAY - Service Worker (Level 11)
 * Offline support, asset caching, and background sync
 * Consistent with Level 12 architecture
 */

const CACHE_NAME = 'getunderway-l11-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/enhancements.css',
  '/scripts/progress-manager.js',
  '/lib/api-client.js',
  '/content/assets/level11_military.webp',
  '/content/assets/level11_militaryb.webp',
  '/content/assets/level11_militaryc.webp',
  '/content/assets/level11_militaryd.webp'
];

const API_CACHE_NAME = 'getunderway-api-cache';
const API_ENDPOINTS = ['/api/progress'];

// ── Install: Cache static assets ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ── Activate: Clean old caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// ── Fetch: Network-first for API, Cache-first for static ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests: Network-first with cache fallback
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET responses
          if (request.method === 'GET' && response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE_NAME)
              .then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline: Return cached response or error
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets: Cache-first with network fallback
  if (request.destination === 'image' || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.html')) {
    
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            // Update cache in background
            fetch(request)
              .then((response) => {
                if (response.ok) {
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(request, response));
                }
              })
              .catch(() => {}); // Ignore network errors for background update
            return cached;
          }
          return fetch(request);
        })
    );
    return;
  }

  // Default: Network-first
  event.respondWith(fetch(request));
});

// ── Background Sync: Queue offline requests ──
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress-l11') {
    event.waitUntil(processSyncQueue());
  }
});

async function processSyncQueue() {
  // Read queued requests from IndexedDB (simplified)
  // In production, use a proper queue library
  console.log('[SW] Processing background sync');
  
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE' });
  });
}

// ── Push Notifications (optional) ──
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Get Underway', {
      body: data.body || 'New content available',
      icon: '/content/assets/icon-192.webp',
      badge: '/content/assets/icon-72.webp',
      tag: 'getunderway-notification',
      requireInteraction: false
    })
  );
});

// ── Message Handler: Cache busting, manual refresh ──
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME)
        .then(() => caches.open(CACHE_NAME))
        .then((cache) => cache.addAll(STATIC_ASSETS))
    );
  }
  
  if (event.data?.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});