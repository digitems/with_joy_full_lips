const CACHE_NAME = 'wjl-cache-v1';
const OFFLINE_URL = '/';

// Cache essential assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([OFFLINE_URL])
    )
  );
  self.skipWaiting();
});

// Clean old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Network-first strategy for navigation; skip hashed assets (browser handles them)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests and API calls
  if (request.method !== 'GET' || request.url.includes('/api/')) return;

  // Skip hashed assets (e.g. BrowsePage-Dz_jg4c9.js) — immutable, browser cache is sufficient
  if (request.url.match(/\/assets\/.+-[a-zA-Z0-9_-]{8,}\.(js|css)$/)) return;

  // For navigation requests, try network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // For other assets (images, fonts), network-first with cache fallback
  event.respondWith(
    fetch(request).then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    }).catch(() =>
      caches.match(request).then((cached) =>
        cached || new Response('', { status: 503, statusText: 'Offline' })
      )
    )
  );
});
