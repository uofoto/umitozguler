/* Lumina Studio — service worker: ilk yüklemede önbelleğe alır, sonra çevrimdışı çalışır.
   Dosyaları güncellediğinde VERSION'ı artır (ör. v2) ki eski önbellek silinsin. */
const VERSION = 'v1';
const CACHE = 'lumina-' + VERSION;
const FILES = ['./', 'index.html', 'style.css', 'engine.js', 'app.js', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('lumina-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Önbellekten hemen sun, arka planda yenile (stale-while-revalidate)
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const cached = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => cached);
    return cached || net;
  }));
});
