const APP_BASE = new URL("./", self.registration.scope);
const scopePath = new URL(self.registration.scope).pathname;
const scopeKey = scopePath.split("/").filter(Boolean).join("-") || "root";
const CACHE_PREFIX = `cep-bakimi-shell-${scopeKey}-`;
const CACHE_NAME = `${CACHE_PREFIX}v3`;
const APP_SHELL_PATHS = [
  "",
  "index.html",
  "styles.css?v=1.1.1",
  "app.js?v=1.1.1",
  "legal.js?v=1.0.0",
  "privacy.html",
  "terms.html",
  "manifest.webmanifest",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "manus-routes.json",
];
const APP_SHELL = APP_SHELL_PATHS.map((path) => new URL(path, APP_BASE).href);
const APP_INDEX_URL = new URL("index.html", APP_BASE).href;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(APP_BASE.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(APP_INDEX_URL))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});
