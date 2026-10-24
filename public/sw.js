// AutoVerse Stage 23: Progressive Web App Service Worker
// Cache version: autoverse-cache-v1
// Manages application shell caching, offline navigation fallback, and safe static asset caching.
// Adheres strictly to security rules: NEVER caches private user records, auth tokens, or admin routes.

const CACHE_NAME = 'autoverse-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
];

// Sensitive patterns that MUST NEVER be cached ('/admin', '/my-', '/api/auth', '/api/user')
const SENSITIVE_URL_PATTERNS = [
  /\/admin(\/.*)?$/,
  /\/my-.*$/,
  /\/api\/auth(\/.*)?$/,
  /\/api\/user(\/.*)?$/,
  /\/login$/,
  /\/register$/,
  /\/reset-password$/,
  /\/sell-car$/,
  /token=/,
  /auth=/
];

// Check if request is safe for caching
function isSafeToCache(request) {
  // Only cache GET requests
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);

  // Exclude external third-party origins unless fonts
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.gstatic.com') && !url.hostname.includes('fonts.googleapis.com')) {
    return false;
  }

  // Strictly check against sensitive path patterns
  for (const pattern of SENSITIVE_URL_PATTERNS) {
    if (pattern.test(url.pathname)) {
      return false;
    }
  }

  // Never cache requests with Authorization header
  if (request.headers.has('Authorization')) {
    return false;
  }

  return true;
}

// 1. Install event: Precache core shell and offline assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[AutoVerse SW] Precache partial error (non-fatal):', err);
      });
    })
  );
  // Do NOT self.skipWaiting() automatically to allow user-controlled refresh
});

// 2. Activate event: Safe obsolete cache cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith('autoverse-cache-') && name !== CACHE_NAME) {
            console.log('[AutoVerse SW] Removing obsolete cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Fetch event: Stale-while-revalidate for static assets, Network-first with offline fallback for navigation
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // If request is not safe to cache, pass through to network directly without caching
  if (!isSafeToCache(request)) {
    return;
  }

  // A. Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If valid response received, clone and store in cache if safe
          if (response && response.status === 200 && isSafeToCache(request)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          // Network failed: try cache match, or fallback to offline.html
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;

          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) return offlinePage;

          return new Response('AutoVerse is offline. Please reconnect to the internet.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // B. Static assets (JS, CSS, Images, Fonts, SVGs): Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.match(/\.(js|css|svg|png|jpg|jpeg|webp|woff|woff2|ttf|ico)$/) ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.startsWith('/assets/');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // fallback to cached response if network fails

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// 4. Message event: User-directed SKIP_WAITING for app updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
