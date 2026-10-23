import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const assets = (await readdir(path.join(dist, 'assets'))).map((file) => `assets/${file}`);
const precache = ['.', 'manifest.webmanifest', 'filigran-mark.svg', ...assets];
const source = `const CACHE_NAME = 'filigran-shell-v3';
const ROOT = new URL('./', self.registration.scope).toString();
const PRECACHE = ${JSON.stringify(precache)}.map((file) => file === '.' ? ROOT : new URL(file, ROOT).toString());

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
`;
await writeFile(path.join(dist, 'sw.js'), source);
console.log(`service worker precache: ${precache.length} files`);
