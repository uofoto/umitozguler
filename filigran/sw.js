const CACHE_NAME = 'filigran-shell-v5';
const ROOT = new URL('./', self.registration.scope).toString();
const PRECACHE = [".","manifest.webmanifest","filigran-mark.svg","filigran-mark-192.png","filigran-mark-512.png","assets/index-BwT7p0jx.js","assets/index-Ch8poDy-.css"].map((file) => file === '.' ? ROOT : new URL(file, ROOT).toString());

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith('filigran-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key)),
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => event.request.mode === 'navigate'
      ? caches.match(ROOT)
      : new Response('', { status: 504, statusText: 'Offline' })))
  );
});
