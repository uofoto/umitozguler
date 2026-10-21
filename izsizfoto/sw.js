// İzsiz Foto servis çalışanı: uygulama kabuğunu ve yerel dönüştürücüleri önbelleğe alır.
// Yeni sürümde V, index.html içindeki APP.version ve version.json birlikte güncellenir.
const V = 'izsiz-v2.8.2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './heic-codec.js', './video-codec.js', './provenance-audit.js', './libheif-bundle.js', './webp-encoder.js', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== 'izsiz-share').map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  const u = new URL(r.url);
  // Android paylaşım hedefi: dosyaları kısa süreli sakla, bu paylaşıma özgü kimlikle yönlendir.
  if (r.method === 'POST' && u.pathname.endsWith('/share-target')) {
    e.respondWith(
      (async () => {
        const fd = await r.formData();
        const files = fd.getAll('photos').filter((f) => f && f.name !== undefined);
        const c = await caches.open('izsiz-share');
        const now = Date.now();
        for (const key of await c.keys()) {
          const old = await c.match(key);
          const created = Number(old && old.headers.get('x-created')) || 0;
          if (!created || now - created > 60 * 60 * 1000) await c.delete(key);
        }
        const id = self.crypto && crypto.randomUUID ? crypto.randomUUID() : now.toString(36) + '-' + Math.random().toString(36).slice(2);
        await Promise.all(
          files.map((f, i) =>
            c.put('./shared/' + id + '/' + i, new Response(f, { headers: { 'content-type': f.type || 'application/octet-stream', 'x-name': encodeURIComponent(f.name), 'x-mod': String(f.lastModified || ''), 'x-created': String(now) } }))
          )
        );
        return Response.redirect(new URL('./?shared=' + encodeURIComponent(id), self.registration.scope).href, 303);
      })()
    );
    return;
  }
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  // Sürüm bilgisi her zaman ağdan okunur (önbelleğe alınmaz)
  if (u.pathname.endsWith('/version.json')) { e.respondWith(fetch(r, { cache: 'no-store' })); return; }
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
