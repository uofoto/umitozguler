const CACHE_NAME = 'filigran-shell-4d0d0b7a29';
const ROOT = new URL('./', self.registration.scope).toString();
const PRECACHE = [".","assets/UTIF-DE_fZg9J.js","assets/UTIF-D_Egx2_X.js","assets/_commonjs-dynamic-modules-CGE348Hf.js","assets/dm-mono-latin-400-normal-Du9W-GAy.woff2","assets/dm-mono-latin-500-normal-CLN5ozUA.woff2","assets/dm-mono-latin-ext-400-normal-CPKZr-9B.woff2","assets/dm-mono-latin-ext-500-normal-DJqo96_E.woff2","assets/dm-sans-latin-400-normal-COF6noiJ.woff2","assets/dm-sans-latin-500-normal-kGSpR5A9.woff2","assets/dm-sans-latin-600-normal-DrBIvsIy.woff2","assets/dm-sans-latin-700-normal-1DREuLwQ.woff2","assets/dm-sans-latin-ext-400-normal-Cygz-XR6.woff2","assets/dm-sans-latin-ext-500-normal-BBd_G3i-.woff2","assets/dm-sans-latin-ext-600-normal-CFRgRepe.woff2","assets/dm-sans-latin-ext-700-normal-CGQ_Vo0j.woff2","assets/image.worker-B25Lw298.js","assets/index-BX_Vs8Ud.css","assets/index-CMRY_DdY.js","assets/playfair-display-latin-600-italic-DUHhWHzL.woff2","assets/playfair-display-latin-600-normal-CHZ-UWfP.woff2","assets/playfair-display-latin-700-italic-DnvGFUOX.woff2","assets/playfair-display-latin-700-normal-CtHl6EpB.woff2","assets/playfair-display-latin-ext-600-italic-BMMU2VFS.woff2","assets/playfair-display-latin-ext-600-normal-Ce0DF62x.woff2","assets/playfair-display-latin-ext-700-italic-BuOqpLMf.woff2","assets/playfair-display-latin-ext-700-normal-DfIbajr-.woff2","assets/wasm-bundle-CBw2mUBK.js","assets/wasm-bundle-DZK6tB_W.js","filigran-mark-192.png","filigran-mark-512.png","filigran-mark.svg","index.html","manifest.webmanifest"].map((file) => file === '.' ? ROOT : new URL(file, ROOT).toString());

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('filigran-shell-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function networkFirst(request) {
  // Sayfa açılışı: önce ağ (yeni sürüm hemen görünsün), ağ yoksa/yavaşsa önbellek.
  return new Promise((resolve) => {
    let settled = false;
    const fallback = () => caches.match(ROOT).then((cached) => cached || Response.error());
    const timer = setTimeout(() => { if (!settled) { settled = true; fallback().then(resolve); } }, 4000);
    fetch(request).then((response) => {
      clearTimeout(timer);
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(ROOT, copy));
      }
      if (!settled) { settled = true; resolve(response.ok || response.status !== 404 ? response : fallback()); }
    }).catch(() => {
      clearTimeout(timer);
      if (!settled) { settled = true; fallback().then(resolve); }
    });
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(() => new Response('', { status: 504, statusText: 'Offline' }))),
  );
});
