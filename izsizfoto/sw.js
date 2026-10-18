// İzsiz Foto servis çalışanı: uygulama kabuğunu önbelleğe alır, çevrimdışı çalışır.
// index.html değiştiğinde V sürümünü artır.
const V = 'izsiz-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== 'izsiz-share').map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  const u = new URL(r.url);
  // Android paylaşım hedefi: dosyaları geçici olarak sakla, uygulamaya yönlendir
  if (r.method === 'POST' && u.pathname.endsWith('/share-target')) {
    e.respondWith(
      (async () => {
        const fd = await r.formData();
        const files = fd.getAll('photos').filter((f) => f && f.name !== undefined);
        const c = await caches.open('izsiz-share');
        await Promise.all(
          files.map((f, i) =>
            c.put('./shared/' + Date.now() + '-' + i, new Response(f, { headers: { 'content-type': f.type || 'application/octet-stream', 'x-name': encodeURIComponent(f.name), 'x-mod': String(f.lastModified || '') } }))
          )
        );
        return Response.redirect(new URL('./?shared=' + files.length, self.registration.scope).href, 303);
      })()
    );
    return;
  }
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(r)
          .then((res) => {
            if (res.ok || res.type === 'opaque') {
              const cp = res.clone();
              caches.open(V).then((c) => c.put(r, cp));
            }
            return res;
          })
          .catch(() => (r.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
    )
  );
});
