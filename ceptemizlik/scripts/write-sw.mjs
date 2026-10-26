// Derleme çıktısındaki (dist) tüm dosyaları önbelleğe alan service worker üretir.
// Önbellek adı dosya içeriklerinin özetinden türetilir: her yayında otomatik yenilenir,
// elle sürüm numarası artırmaya gerek kalmaz.
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));
  return files.flat();
}

const files = (await walk(dist))
  .map((file) => path.relative(dist, file).split(path.sep).join('/'))
  .filter((file) => file !== 'sw.js' && !file.endsWith('.map') && !file.endsWith('.woff') && !file.startsWith('.'))
  .sort();

const hash = createHash('sha256');
for (const file of files) {
  hash.update(file);
  hash.update(await readFile(path.join(dist, file)));
}
const version = hash.digest('hex').slice(0, 10);
const precache = ['.', ...files];

const source = `const CACHE_NAME = 'filigran-shell-${version}';
const ROOT = new URL('./', self.registration.scope).toString();
const PRECACHE = ${JSON.stringify(precache)}.map((file) => file === '.' ? ROOT : new URL(file, ROOT).toString());

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
`;
await writeFile(path.join(dist, 'sw.js'), source);
console.log(`service worker: sürüm ${version}, ${precache.length} dosya önbelleğe alınacak`);
