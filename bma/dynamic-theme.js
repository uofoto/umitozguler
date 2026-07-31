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
// (Aladhan API, Bursa koordinatları, Diyanet hesaplama metodu) alınır;
// burada ayrıca Hicri tarih bilgisi de okunup Ramazan/Kandil tespiti için
// kullanılır. Sonuçlar günlük olarak yerelde önbelleklenir.

const DYN_THEME_LAT = 40.1826, DYN_THEME_LON = 29.0665;
const DYN_THEME_CACHE_KEY = 'manevi-atlas-dyntheme-cache';
const DYN_THEME_OCCASION_SEEN_KEY = 'manevi-atlas-dyntheme-occasion-seen';

// Sabit Hicri gün/ay eşleşen kandiller (gece, ilgili Hicri günün akşamında idrak edilir):
// Mevlid (Rebiülevvel 12), Miraç (Recep 27), Berat (Şaban 15), Kadir (Ramazan 27).
// Regaib Kandili sabit bir Hicri güne denk gelmediği (Recep ayının ilk cuma gecesi)
// için bu basit eşleşme listesine dahil edilmemiştir.
const DYN_THEME_KANDIL_DAYS = [
  { month: 3, day: 12, name: 'Mevlid Kandili' },
  { month: 7, day: 27, name: 'Miraç Kandili' },
  { month: 8, day: 15, name: 'Berat Kandili' },
  { month: 9, day: 27, name: 'Kadir Gecesi' }
];

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

function dynThemeComputeOccasion(now, hijri) {
  const isFriday = now.getDay() === 5;
  let isRamadan = false, kandilName = null;

  if (hijri && hijri.month && hijri.day) {
    const hMonth = Number(hijri.month.number);
    const hDay = Number(hijri.day);
    isRamadan = hMonth === 9;
    const kandil = DYN_THEME_KANDIL_DAYS.find(k => k.month === hMonth && k.day === hDay);
    if (kandil) kandilName = kandil.name;
  }

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
      dynThemeDayCache = await dynThemeGetDayCached(now);
      dynThemeDayCacheKey = todayKey;
    }
    const todayBase = new Date(now); todayBase.setHours(0, 0, 0, 0);
    const mood = dynThemeComputeMood(now, todayBase, dynThemeDayCache.timings);
    const occasion = dynThemeComputeOccasion(now, dynThemeDayCache.hijri);
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
