const CACHE_NAME = 'filigran-shell-v3';
const ROOT = new URL('./', self.registration.scope).toString();
const PRECACHE = [".","manifest.webmanifest","filigran-mark.svg","assets/index-D-xOdL1F.css","assets/index-D9O0TtSx.js"].map((file) => file === '.' ? ROOT : new URL(file, ROOT).toString());

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
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
