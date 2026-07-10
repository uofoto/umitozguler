// Bursa Manevi Atlası — Service Worker (v2)
// Sayfa kabuğu (HTML) için "ağ öncelikli" strateji kullanılır: internet varsa
// her zaman en güncel sürüm indirilir; yoksa önbellekteki son sürüm açılır.
// Statik dosyalar (ikonlar, manifest) için "önbellek öncelikli" çalışır.
// NOT: Namaz kayıtlarınız bu dosyada değil, cihazınızın IndexedDB veritabanında
// saklanır; bu servis çalışanı yalnızca uygulamanın açılış hızını ve çevrimdışı
// erişimini yönetir.

const CACHE_NAME = "bursa-manevi-atlas-v3";
const APP_SHELL = [
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const isNavigation = event.request.mode === "navigate" || event.request.destination === "document";

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
    })
  );
});
