// Bursa Manevi Atlası — Service Worker (v5)
// ---------------------------------------------------------------------------
// STRATEJİ: Stale-While-Revalidate (SWR) — kapsamlı çevrimdışı destek.
//
// Uygulama kabuğu (HTML/JS/CSS), Leaflet harita kütüphanesi, Font Awesome,
// jsPDF, uygulama ikonları ve HARİTA KAROLARI dahil hemen hemen her statik
// varlık artık aynı mantıkla sunulur: önbellekte bir kopya varsa ANINDA o
// döndürülür (kullanıcı interneti olmayan bir cami avlusunda olsa bile
// uygulama gecikmeden açılır), bunun ARKA PLANINDA ağdan taze bir kopya
// çekilip önbellek sessizce güncellenir. Ağ isteği başarısız olursa
// (çevrimdışı), elimizdeki son önbellek kopyası zaten kullanıcıya sunulmuş
// olur — hiçbir kesinti yaşanmaz.
//
// Kodun kendi sürüm kontrolü (version.json + checkForAppUpdate, bkz. ui.js)
// zaten "yeni sürüm var" bildirimini ayrıca gösterip kullanıcı onayıyla
// güncellemeyi tetikliyor; bu yüzden burada HTML/JS/CSS için "ağ önceliği"
// zorlamaya gerek yok — SWR ile hem hız hem çevrimdışı erişim kazanılıyor.
//
// Canlı veri servisleri (hava durumu, namaz vakitleri, konum arama,
// analytics) SW önbelleğinin tamamen dışında tutulur ve doğrudan ağa
// yönlendirilir; bu veriler zaten uygulamanın kendi localStorage/IndexedDB
// katmanında, tarihe duyarlı şekilde önbelleklenir.
//
// NOT: Namaz kayıtlarınız bu dosyada değil, cihazınızın IndexedDB
// veritabanında saklanır; bu servis çalışanı yalnızca uygulamanın açılış
// hızını ve çevrimdışı erişimini yönetir.

const CACHE_VERSION = "v40";
const STATIC_CACHE = `bursa-manevi-atlas-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `bursa-manevi-atlas-runtime-${CACHE_VERSION}`;
const TILE_CACHE = `bursa-manevi-atlas-tiles-${CACHE_VERSION}`;

// Harita karoları çok sayıda ve sürekli birikebileceği için ayrı bir
// önbellekte tutulup belirli bir sayının üzerinde en eskiler silinir
// (sınırsız disk kullanımı önlenir).
const TILE_CACHE_MAX_ENTRIES = 500;

// ---- Kendi sunucumuzdaki (uygulama kabuğu) dosyalar ----
const APP_SHELL = [
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./styles.css",
  "./mosques-data.js",
  "./mosques-geo.json",
  "./changelog.js",
  "./db.js",
  "./theme.js",
  "./map.js",
  "./stats.js",
  "./search.js",
  "./backup.js",
  "./ui.js",
  "./mosque-select-search.js",
  "./out-of-bursa-visit.js",
  "./storage-health.js"
];

// ---- Harici CDN kütüphaneleri ----
// Tailwind (arayüz stilleri), Font Awesome (ikonlar), Leaflet (harita) ve
// jsPDF (dışa aktarma) olmadan uygulama düzgün açılamaz. Kırsalda internet
// yokken bile kabuğun tamamen çalışabilmesi için bunlar da kuruluşta
// önbelleğe alınır.
const CDN_SHELL = [
  "https://cdn.tailwindcss.com",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js"
];

// Harita karolarının geldiği OpenStreetMap alt alan adları.
const TILE_HOSTS = [
  "a.tile.openstreetmap.org",
  "b.tile.openstreetmap.org",
  "c.tile.openstreetmap.org"
];

// Bu sunuculara giden istekler asla SW önbelleğine takılmaz, her zaman
// doğrudan ağa gider (canlı/güncel veri gerektiren servisler). Aksi halde
// örn. hava durumu isteği URL'i günden güne değişmediği için SW onu
// sonsuza dek önbellekte dondurup güncel veriyi asla getirmez.
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
    (async () => {
      const cache = await caches.open(STATIC_CACHE);

      // Kendi dosyalarımız: hepsi aynı origin. Biri bile başarısız olursa
      // (ör. tek bir dosya adı hatası) kurulumun tamamı iptal olmasın diye
      // addAll yerine tek tek, hataya toleranslı şekilde ekliyoruz.
      await Promise.allSettled(
        APP_SHELL.map((url) => cache.add(url).catch(() => {}))
      );

      // CDN dosyaları: önce normal "cors" modunda dene (cdnjs/jsdelivr genelde
      // CORS başlığı gönderir, böylece yanıt doğrulanabilir olur); başarısız
      // olursa "no-cors" ile opak (opaque) yanıtı yine de önbelleğe koy —
      // doğrulanamasa da çevrimdışı görüntüleme için işe yarar.
      await Promise.allSettled(
        CDN_SHELL.map(async (url) => {
          try {
            const res = await fetch(url, { mode: "cors" });
            await cache.put(url, res);
          } catch (e) {
            try {
              const res = await fetch(url, { mode: "no-cors" });
              await cache.put(url, res);
            } catch (e2) { /* internet yoksa kuruluşta sessizce atla */ }
          }
        })
      );
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC_CACHE, RUNTIME_CACHE, TILE_CACHE]);
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)));
      self.clients.claim();
    })()
  );
});

// Bir önbelleği belirli bir öğe sayısının altında tutar (en eski
// girdilerden başlayarak siler).
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const deleteCount = keys.length - maxEntries;
  for (let i = 0; i < deleteCount; i++) {
    await cache.delete(keys[i]);
  }
}

// Stale-While-Revalidate: önbellekte kopya varsa anında onu döndür, arka
// planda ağdan tazesini çekip önbelleği güncelle. Ağ başarısız olursa
// (çevrimdışı) elimizdeki son önbellek kopyası (varsa) döner.
function staleWhileRevalidate(request, cacheName, trimTo) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && (response.ok || response.type === "opaque")) {
            cache.put(request, response.clone());
            if (trimTo) trimCache(cacheName, trimTo);
          }
          return response;
        })
        .catch(() => undefined);

      // Önbellekte varsa hemen onunla dön (ağ isteği arka planda devam eder);
      // yoksa ağ yanıtını bekle.
      return cached || networkFetch || Response.error();
    })
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  let hostname = "";
  try { hostname = new URL(event.request.url).hostname; } catch (e) {}

  // "Güncelle" özelliğinin çalışması için version.json ve otomatik güncelleme
  // tespiti (__freshcheck) HİÇBİR ZAMAN önbelleğe alınmaz; her istek doğrudan
  // ağa gider.
  if (event.request.url.includes("version.json") || event.request.url.includes("__freshcheck=1")) {
    event.respondWith(fetch(event.request, { cache: "no-store" }).catch(() => Response.error()));
    return;
  }

  // Canlı veri API'leri: önbelleğe hiç dokunma, doğrudan ağa git. Çevrimdışıyken
  // bu istekler doğal olarak başarısız olur; uygulama kodu bunu zaten
  // try/catch ile nazikçe yönetiyor.
  if (NETWORK_ONLY_HOSTS.includes(hostname)) {
    event.respondWith(fetch(event.request).catch(() => Response.error()));
    return;
  }

  // Harita karoları: SWR + boyutu sınırlı ayrı önbellek. Kullanıcı daha önce
  // gezdiği bir bölgeyi (ör. kırsaldaki bir köy/mescit civarını) tekrar
  // açtığında, internet olmasa da harita karoları önbellekten gelir.
  if (TILE_HOSTS.includes(hostname)) {
    event.respondWith(staleWhileRevalidate(event.request, TILE_CACHE, TILE_CACHE_MAX_ENTRIES));
    return;
  }

  const isNavigation = event.request.mode === "navigate" || event.request.destination === "document";

  // Sayfa kabuğu (HTML): SWR — önbellekteki kabuk anında gösterilir, hiç
  // önbellek yoksa (ilk ziyaret) ağdan beklenir; ağ da başarısız olursa
  // (çevrimdışı + hiç önbellek yok) elimizdeki index.html'e düş.
  if (isNavigation) {
    event.respondWith(
      staleWhileRevalidate(event.request, STATIC_CACHE).then(
        (res) => res || caches.match("./index.html")
      ).catch(async () => (await caches.match("./index.html")) || Response.error())
    );
    return;
  }

  // Geri kalan HER ŞEY (uygulama JS/CSS dosyaları, Leaflet/Font Awesome/jsPDF
  // gibi CDN kütüphaneleri ve onların yazı tipi/görsel dosyaları, uygulama
  // ikonları, manifest, vb.): tek tip SWR. İlk çevrimiçi ziyarette dokunulan
  // her varlık otomatik olarak önbelleğe girer ve bir sonraki çevrimdışı
  // ziyarette kullanılabilir hale gelir.
  event.respondWith(staleWhileRevalidate(event.request, RUNTIME_CACHE));
});
