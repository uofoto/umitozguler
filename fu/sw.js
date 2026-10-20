const CACHE = 'foto-ustasi-v11';
const SHELL = ['./', './index.html', './styles.css', './filters.js', './effects.js', './app.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './manus-routes.json'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const path of SHELL) {
      const url = new URL(path, self.location.href);
      url.searchParams.set('__shell_version', CACHE);
      const response = await fetch(url.href, { cache: 'reload' });
      if (!response.ok) throw new Error(`PWA shell asset failed: ${path} (${response.status})`);
      await cache.put(path, response);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('foto-ustasi-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) return response;
      return caches.match('./index.html').then((cached) => cached || response);
    }).catch(() => caches.match('./index.html')));
    return;
  }

  if (SHELL.some((path) => new URL(path, self.location.href).pathname === url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
  }
});
