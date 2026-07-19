// Bursa Manevi Atlası — Service Worker (v4)
// Sayfa kabuğu (HTML) için "ağ öncelikli" strateji kullanılır: internet varsa
// her zaman en güncel sürüm indirilir; yoksa önbellekteki son sürüm açılır.
// Statik dosyalar (ikonlar, manifest, CDN kütüphaneleri) için "önbellek
// öncelikli" çalışır: bir kez indirildikten sonra tekrar tekrar ağa gitmez,
// bu da çevrimdışı erişimi mümkün kılar.
// Canlı veri servisleri (hava durumu, namaz vakitleri, konum arama) SW
// önbelleğinin tamamen dışında tutulur ve doğrudan ağa yönlendirilir; bu
// veriler zaten uygulamanın kendi localStorage/IndexedDB katmanında,
// tarihe duyarlı şekilde önbelleklenir. Aksi halde örn. hava durumu isteği
// URL'i günden güne değişmediği için SW onu sonsuza dek önbellekte
// dondurup güncel veriyi asla getirmez.
// NOT: Namaz kayıtlarınız bu dosyada değil, cihazınızın IndexedDB veritabanında
// saklanır; bu servis çalışanı yalnızca uygulamanın açılış hızını ve çevrimdışı
// erişimini yönetir.

const CACHE_NAME = "bursa-manevi-atlas-v16";
const APP_SHELL = [
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./styles.css",
  "./mosques-data.js",
  "./db.js",
  "./theme.js",
  "./map.js",
  "./stats.js",
  "./search.js",
  "./backup.js",
  "./ui.js"
];

// Bu sunuculara giden istekler asla SW önbelleğine takılmaz, her zaman
// doğrudan ağa gider (canlı/güncel veri gerektiren servisler).
const NETWORK_ONLY_HOSTS = [
  "api.open-meteo.com",
  "api.aladhan.com",
  "nominatim.openstreetmap.org",
  "www.googletagmanager.com",
  "www.google-analytics.com",
  "region1.google-analytics.com"
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

  let hostname = "";
  try { hostname = new URL(event.request.url).hostname; } catch (e) {}

  // "Güncelle" özelliğinin çalışması için version.json HİÇBİR ZAMAN önbelleğe
  // alınmaz; her istek doğrudan ağa gider. Aksi halde uygulama, sunucudaki
  // gerçek sürüm yerine önbellekteki eski version.json'u kontrol eder ve
  // güncelleme bildirimi hiç görünmez.
  if (event.request.url.includes("version.json")) {
    event.respondWith(fetch(event.request, { cache: "no-store" }).catch(() => Response.error()));
    return;
  }

  // Canlı veri API'leri: önbelleğe hiç dokunma, doğrudan ağa git.
  // Çevrimdışıyken bu istekler doğal olarak başarısız olur; uygulama
  // kodu bunu zaten try/catch ile nazikçe yönetiyor.
  if (NETWORK_ONLY_HOSTS.includes(hostname)) {
    event.respondWith(fetch(event.request).catch(() => Response.error()));
    return;
  }

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
