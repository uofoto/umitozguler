// dynamic-theme.js — Mevsim ve Vakitlere Göre Dinamik Tema
//
// Mevcut Dark/Light temaya (theme.js) EK OLARAK: sabah namazı vaktinde
// uygulama şafak renklerine (mavi/pembe tonları), akşam namazında gün
// batımı tonlarına bürünür. Ayrıca Ramazan ayı, kandil geceleri ve cuma
// günlerinde arayüzde ince, sıcak altın tonlu özel bir motif otomatik
// devreye girer. Bu katman kullanıcının seçtiği Dark/Light temayı DEĞİŞTİRMEZ,
// yalnızca hero panellerin üzerine ince bir "ruh hali" (mood) katmanı ekler.
//
// Namaz vakitleri, ui.js'teki namaz vakti geri sayımıyla aynı kaynaktan
// (Aladhan API, Bursa koordinatları, Diyanet hesaplama metodu) alınır ve
// günlük olarak yerelde önbelleklenir. Ramazan/Kandil tespiti ise Hicri
// takvim hesaplamasına DEĞİL, Diyanet İşleri Başkanlığı'nın resmi olarak
// ilan ettiği sabit Miladi tarihlere dayanır (bkz. DYN_THEME_KANDIL_FIXED_DATES
// ve DYN_THEME_RAMADAN_RANGES) — çünkü Diyanet'in takvimi astronomik/Hicri
// hesaptan küçük farklarla ayrışabiliyor. Bu tarihlerin her yıl elle
// güncellenmesi gerekir.

const DYN_THEME_LAT = 40.1826, DYN_THEME_LON = 29.0665;
const DYN_THEME_CACHE_KEY = 'manevi-atlas-dyntheme-cache';
const DYN_THEME_OCCASION_SEEN_KEY = 'manevi-atlas-dyntheme-occasion-seen';

// ÖNEMLİ — YILLIK GÜNCELLEME GEREKTİRİR:
// Diyanet İşleri Başkanlığı'nın kandil/Ramazan tarihleri Hicri takvimin
// astronomik hesabından değil, Diyanet'in resmi olarak ilan ettiği takvimden
// alınır (bazı yıllarda ay gözlemine dayalı küçük kaymalar olabiliyor). Bu
// yüzden Aladhan API'nin Hicri gün/ay bilgisiyle eşleştirme YAPMIYORUZ;
// bunun yerine Diyanet'in yayımladığı takvimdeki sabit Miladi tarihleri
// elle giriyoruz. Her yıl (Diyanet yeni takvimi açıkladığında, genelde
// yıl başında) bu listenin güncellenmesi gerekir.
//
// Kaynak: Diyanet İşleri Başkanlığı 2026 Dini Günler Takvimi.
const DYN_THEME_KANDIL_FIXED_DATES = {
  '2026-01-15': 'Miraç Kandili',
  '2026-02-02': 'Berat Kandili',
  '2026-03-16': 'Kadir Gecesi',
  '2026-08-24': 'Mevlid Kandili',
  '2026-12-10': 'Regaib Kandili'
};

// Diyanet'in resmi Ramazan başlangıç/bitiş (arefe günü dahil son gün) tarihleri.
// Ramazan Bayramı arefe günü (19 Mart 2026) de Ramazan'ın son günü sayılır;
// bayramın kendisi (20 Mart itibarıyla) bu aralığa dahil değildir.
const DYN_THEME_RAMADAN_RANGES = [
  { start: '2026-02-19', end: '2026-03-19' }
];

// --- OTOMATİK YILLIK KAPSAM KONTROLÜ ------------------------------------
// Yukarıdaki iki listeyi her yıl elle güncellemek unutulabilir. Bu fonksiyon
// uygulama her açıldığında hangi yılların kapsandığını listelerin kendisinden
// çıkarır ve içinde bulunulan yıl (veya yaklaşan yeni yıl) eksikse konsola
// göz ardı edilmesi zor, büyük ve renkli bir uyarı basar. Ekim ayından
// itibaren bir sonraki yıl için de kontrol yapılır, böylece yıl dönmeden
// önce haber verilmiş olur.
function dynThemeCoveredYears() {
  const years = new Set();
  Object.keys(DYN_THEME_KANDIL_FIXED_DATES).forEach(k => years.add(Number(k.slice(0, 4))));
  DYN_THEME_RAMADAN_RANGES.forEach(r => {
    years.add(Number(r.start.slice(0, 4)));
    years.add(Number(r.end.slice(0, 4)));
  });
  return years;
}

function dynThemeWarnMissingYear(year, context) {
  const msg = `%c[dynamic-theme] UYARI: ${year} yılı için Diyanet kandil/Ramazan tarihleri (DYN_THEME_KANDIL_FIXED_DATES / DYN_THEME_RAMADAN_RANGES) girilmemiş! ${context} Diyanet'in ${year} Dini Günler Takvimi'ni kontrol edip dynamic-theme.js dosyasını güncelle.`;
  console.warn(msg, 'background:#b91c1c;color:#fff;font-weight:bold;padding:4px 8px;border-radius:4px;');
}

// Son hesaplanan kapsam durumu; window.dynThemeGetCoverageStatus() üzerinden
// mevcut ayarlar/admin paneline entegre edilebilir.
let dynThemeLastCoverageStatus = { ok: true, missingCurrentYear: null, missingNextYearSoon: null, message: null };

function dynThemeCheckYearlyCoverage(now) {
  const covered = dynThemeCoveredYears();
  const thisYear = now.getFullYear();
  const nextYear = thisYear + 1;
  const status = { ok: true, missingCurrentYear: null, missingNextYearSoon: null, message: null };

  if (!covered.has(thisYear)) {
    const ctx = 'İçinde bulunulan yıl kapsanmıyor, kandil/Ramazan motifleri bugün itibarıyla YANLIŞ ÇALIŞACAK.';
    dynThemeWarnMissingYear(thisYear, ctx);
    status.ok = false;
    status.missingCurrentYear = thisYear;
    status.message = `${thisYear} yılı için kandil/Ramazan takvimi eksik.`;
  }

  // Ekim ayının başından itibaren (ay index 9 = Ekim) gelecek yılı da kontrol et,
  // yıl dönmeden önce hazırlık için uyarı verilsin.
  if (now.getMonth() >= 9 && !covered.has(nextYear)) {
    const ctx = `Yeni yıla az kaldı, henüz veri girilmemiş.`;
    dynThemeWarnMissingYear(nextYear, ctx);
    status.missingNextYearSoon = nextYear;
    if (status.ok) {
      status.message = `${nextYear} yılı için kandil/Ramazan takvimi henüz eklenmemiş (yeni yıl yaklaşıyor).`;
    }
  }

  dynThemeLastCoverageStatus = status;
  dynThemeRenderCoverageBadge(status);
  return status;
}

// Mevcut ayarlar/admin panelinin çağırabileceği genel API. Panel kendi
// tasarımına göre bir rozet/ikon gösterebilir. Örnek kullanım:
//   const status = window.dynThemeGetCoverageStatus();
//   if (!status.ok) { /* panelde uyarı göster */ }
window.dynThemeGetCoverageStatus = function () {
  return dynThemeLastCoverageStatus;
};

// --- Kendiliğinden görünen, göze batmayan uyarı rozeti ---------------------
// Admin/ayarlar panelinin markup'ı bilinmediği için, sorun olduğunda
// sayfaya kendiliğinden küçük bir rozet enjekte edilir. Sadece eksik veri
// varken görünür; günlük olarak kapatılabilir (bir daha o gün çıkmaz).
const DYN_THEME_BADGE_DISMISS_KEY = 'manevi-atlas-dyntheme-badge-dismissed';
const DYN_THEME_BADGE_ID = 'dyntheme-coverage-badge';

function dynThemeBadgeDismissedToday() {
  try {
    return localStorage.getItem(DYN_THEME_BADGE_DISMISS_KEY) === dynThemeDateKey(new Date());
  } catch (e) { return false; }
}

function dynThemeDismissBadgeToday() {
  try { localStorage.setItem(DYN_THEME_BADGE_DISMISS_KEY, dynThemeDateKey(new Date())); } catch (e) {}
}

function dynThemeRenderCoverageBadge(status) {
  if (typeof document === 'undefined' || !document.body) return;
  const existing = document.getElementById(DYN_THEME_BADGE_ID);

  if (status.ok || dynThemeBadgeDismissedToday()) {
    if (existing) existing.remove();
    return;
  }
  if (existing) return; // zaten gösteriliyor

  const badge = document.createElement('div');
  badge.id = DYN_THEME_BADGE_ID;
  badge.setAttribute('role', 'alert');
  badge.style.cssText = [
    'position:fixed', 'bottom:14px', 'right:14px', 'z-index:99999',
    'max-width:280px', 'background:#7c2d12', 'color:#fef3c7',
    'font-size:12.5px', 'line-height:1.4', 'padding:10px 12px',
    'border-radius:10px', 'box-shadow:0 4px 14px rgba(0,0,0,0.35)',
    'font-family:system-ui,-apple-system,sans-serif', 'display:flex',
    'align-items:flex-start', 'gap:8px'
  ].join(';');

  const text = document.createElement('span');
  text.textContent = `⚠️ ${status.message}`;
  text.style.flex = '1';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Uyarıyı kapat');
  closeBtn.style.cssText = 'background:none;border:none;color:#fef3c7;cursor:pointer;font-size:14px;line-height:1;padding:0;';
  closeBtn.onclick = () => { dynThemeDismissBadgeToday(); badge.remove(); };

  badge.appendChild(text);
  badge.appendChild(closeBtn);
  document.body.appendChild(badge);
}
// -------------------------------------------------------------------------

function dynThemeDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function dynThemeFormatForApi(d) {
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

async function dynThemeFetchDay(dateObj) {
  const url = `https://api.aladhan.com/v1/timings/${dynThemeFormatForApi(dateObj)}?latitude=${DYN_THEME_LAT}&longitude=${DYN_THEME_LON}&method=13`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Namaz vakti servisi yanıt vermedi');
  const json = await res.json();
  if (!json || !json.data) throw new Error('Namaz vakti verisi hatalı');
  return {
    timings: json.data.timings,
    hijri: json.data.hijri || null
  };
}

async function dynThemeGetDayCached(dateObj) {
  const key = dynThemeDateKey(dateObj);
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(DYN_THEME_CACHE_KEY) || '{}'); } catch (e) { cache = {}; }
  if (cache[key]) return cache[key];

  const dayData = await dynThemeFetchDay(dateObj);
  cache[key] = dayData;
  const keys = Object.keys(cache).sort();
  while (keys.length > 4) { delete cache[keys.shift()]; }
  try { localStorage.setItem(DYN_THEME_CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
  return dayData;
}

function dynThemeParseTimeOnDate(dateObj, hhmmRaw) {
  const hhmm = (hhmmRaw || '00:00').split(' ')[0];
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(dateObj);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

// Ekranda ışıltıyı fark ettirmek için gündüzün ortasında sürekli açık
// kalmasını istemiyoruz; bu yüzden şafak/gün batımı sadece dar bir zaman
// penceresinde aktif olur.
const DYN_THEME_DAWN_BEFORE_MIN = 25, DYN_THEME_DAWN_AFTER_MIN = 65;
const DYN_THEME_SUNSET_BEFORE_MIN = 25, DYN_THEME_SUNSET_AFTER_MIN = 55;

function dynThemeComputeMood(now, todayBase, timings) {
  if (!timings) return 'normal';
  const fajr = dynThemeParseTimeOnDate(todayBase, timings.Fajr);
  const maghrib = dynThemeParseTimeOnDate(todayBase, timings.Maghrib);
  const minutesBetween = (a, b) => (a.getTime() - b.getTime()) / 60000;

  const sinceFajr = minutesBetween(now, fajr);
  if (sinceFajr >= -DYN_THEME_DAWN_BEFORE_MIN && sinceFajr <= DYN_THEME_DAWN_AFTER_MIN) return 'dawn';

  const sinceMaghrib = minutesBetween(now, maghrib);
  if (sinceMaghrib >= -DYN_THEME_SUNSET_BEFORE_MIN && sinceMaghrib <= DYN_THEME_SUNSET_AFTER_MIN) return 'sunset';

  return 'normal';
}

function dynThemeIsWithinRange(todayKey, range) {
  return todayKey >= range.start && todayKey <= range.end;
}

function dynThemeComputeOccasion(now) {
  const todayKey = dynThemeDateKey(now);
  const isFriday = now.getDay() === 5;

  // Kandil geceleri Diyanet'in ilgili gününün akşamında (o günün gündüzünden
  // itibaren) idrak edilir; burada gün bazlı eşleştirme yeterlidir.
  const kandilName = DYN_THEME_KANDIL_FIXED_DATES[todayKey] || null;
  const isRamadan = DYN_THEME_RAMADAN_RANGES.some(r => dynThemeIsWithinRange(todayKey, r));

  if (kandilName) return { key: 'kandil', label: kandilName };
  if (isRamadan) return { key: 'ramadan', label: 'Ramazan Ayı' };
  if (isFriday) return { key: 'friday', label: 'Cuma Günü' };
  return { key: 'normal', label: null };
}

// Vakit (mood) ve özel gün (occasion) katmanlarını tek bir gradyanda birleştirip
// :root üzerinde CSS değişkeni olarak uygular (bkz. styles.css .hero-panel::after).
function dynThemeApply(mood, occasion) {
  const body = document.body;
  const root = document.documentElement;

  body.classList.remove('mood-dawn', 'mood-sunset', 'mood-normal');
  body.classList.add(`mood-${mood}`);

  body.classList.remove('occasion-ramadan', 'occasion-kandil', 'occasion-friday');
  if (occasion && occasion.key !== 'normal') body.classList.add(`occasion-${occasion.key}`);

  const layers = [];
  if (mood === 'dawn') {
    layers.push('linear-gradient(160deg, rgba(255,178,153,0.55) 0%, rgba(159,178,255,0.4) 55%, transparent 100%)');
  } else if (mood === 'sunset') {
    layers.push('linear-gradient(160deg, rgba(255,140,66,0.55) 0%, rgba(158,42,92,0.4) 60%, transparent 100%)');
  }
  if (occasion && occasion.key === 'ramadan') {
    layers.push('radial-gradient(circle at 85% 10%, rgba(231,212,160,0.5), transparent 60%)');
  } else if (occasion && occasion.key === 'kandil') {
    layers.push('radial-gradient(circle at 50% 0%, rgba(231,212,160,0.6), transparent 65%)');
  } else if (occasion && occasion.key === 'friday') {
    layers.push('radial-gradient(circle at 80% 15%, rgba(212,225,187,0.32), transparent 62%), radial-gradient(circle at 15% 85%, rgba(231,212,160,0.22), transparent 55%)');
  }

  if (layers.length) {
    root.style.setProperty('--mood-overlay-bg', layers.join(', '));
    root.style.setProperty('--mood-overlay-opacity', '0.9');
    root.style.setProperty('--mood-overlay-blend', mood === 'normal' ? 'overlay' : 'soft-light');
  } else {
    root.style.setProperty('--mood-overlay-opacity', '0');
  }
}

function dynThemeMaybeNotify(occasion) {
  if (!occasion || occasion.key === 'normal' || typeof showToast !== 'function') return;
  const todayKey = dynThemeDateKey(new Date());
  let seen = {};
  try { seen = JSON.parse(localStorage.getItem(DYN_THEME_OCCASION_SEEN_KEY) || '{}'); } catch (e) {}
  const seenKey = `${todayKey}:${occasion.key}`;
  if (seen[seenKey]) return;
  seen = { [seenKey]: true }; // eski günlerin kaydını biriktirmeye gerek yok
  try { localStorage.setItem(DYN_THEME_OCCASION_SEEN_KEY, JSON.stringify(seen)); } catch (e) {}
  showToast(`${occasion.label} mübarek olsun. Uygulama bugüne özel bir motifle karşınızda.`, 'success');
}

let dynThemeDayCache = null;
let dynThemeDayCacheKey = null;

async function dynThemeTick() {
  try {
    const now = new Date();
    const todayKey = dynThemeDateKey(now);
    if (dynThemeDayCacheKey !== todayKey || !dynThemeDayCache) {
      dynThemeCheckYearlyCoverage(now); // günde bir kez, gün değiştiğinde kontrol et
      dynThemeDayCache = await dynThemeGetDayCached(now);
      dynThemeDayCacheKey = todayKey;
    }
    const todayBase = new Date(now); todayBase.setHours(0, 0, 0, 0);
    const mood = dynThemeComputeMood(now, todayBase, dynThemeDayCache.timings);
    const occasion = dynThemeComputeOccasion(now);
    dynThemeApply(mood, occasion);
    dynThemeMaybeNotify(occasion);
  } catch (e) {
    // Ağ hatası vb. durumlarda dinamik tema sessizce devre dışı kalır;
    // uygulamanın geri kalanı (Dark/Light tema) normal çalışmaya devam eder.
    console.error('[dynamic-theme] güncellenemedi:', e);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  dynThemeTick();
  setInterval(dynThemeTick, 5 * 60 * 1000); // 5 dakikada bir tazele
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') dynThemeTick();
  });
});
