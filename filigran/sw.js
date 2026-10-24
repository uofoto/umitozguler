const CACHE_NAME = 'filigran-shell-v10';
const ROOT = new URL('./', self.registration.scope).toString();
const PRECACHE = [".","manifest.webmanifest","filigran-mark.svg","filigran-mark-192.png","filigran-mark-512.png","assets/index-B8wTUAb3.js","assets/index-Ch8poDy-.css","assets/watermark.worker-Ca1bih7-.js"].map((file) => file === '.' ? ROOT : new URL(file, ROOT).toString());

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
  const isNavigation = event.request.mode === 'navigate';
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (isNavigation && response.status === 404) {
        return caches.match(ROOT).then((root) => root || response);
      }
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => isNavigation
      ? caches.match(ROOT)
      : new Response('', { status: 504, statusText: 'Offline' })))
  );
});
