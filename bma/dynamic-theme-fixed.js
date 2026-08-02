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
    hijri: (json.data.date && json.data.date.hijri) || null
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

function dynThemeApply(mood, occasion) {
  const body = document.body;
  const root = document.documentElement;
  if (!body || !root) return;

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
    layers.push('radial-gradient(circle at 50% 0%, rgba(231,212,160,0.32), transparent 65%)');
  }

  if (layers.length) {
    root.style.setProperty('--mood-overlay-bg', layers.join(', '));
    root.style.setProperty('--mood-overlay-opacity', '0.9');
    root.style.setProperty('--mood-overlay-blend', mood === 'normal' ? 'overlay' : 'soft-light');
  } else {
    root.style.setProperty('--mood-overlay-bg', 'none');
    root.style.setProperty('--mood-overlay-opacity', '0');
    root.style.setProperty('--mood-overlay-blend', 'normal');
  }
}

function dynThemeMaybeNotify(occasion) {
  if (!occasion || occasion.key === 'normal' || typeof showToast !== 'function') return;
  const todayKey = dynThemeDateKey(new Date());
  let seen = {};
  try { seen = JSON.parse(localStorage.getItem(DYN_THEME_OCCASION_SEEN_KEY) || '{}'); } catch (e) {}
  const seenKey = `${todayKey}:${occasion.key}`;
  if (seen[seenKey]) return;
  
  // Object.fromEntries alternatifi (daha geniş uyumluluk için)
  const filteredSeen = {};
  Object.keys(seen).forEach(k => {
    if (k.startsWith(todayKey)) filteredSeen[k] = seen[k];
  });
  seen = filteredSeen;
  
  seen[seenKey] = true;
  try { localStorage.setItem(DYN_THEME_OCCASION_SEEN_KEY, JSON.stringify(seen)); } catch (e) {}
  showToast(`${occasion.label} mübarek olsun. Uygulama bugüne özel bir motifle karşınızda.`, 'success');
}

let dynThemeDayCache = null;
let dynThemeDayCacheKey = null;

async function dynThemeTick() {
  const now = new Date();
  let hijri = null;
  let mood = 'normal';
  
  try {
    const todayKey = dynThemeDateKey(now);
    // Eğer bellek boşsa önce yerel depodan (localStorage) yüklemeyi dene
    if (!dynThemeDayCache) {
      try {
        const localCache = JSON.parse(localStorage.getItem(DYN_THEME_CACHE_KEY) || '{}');
        if (localCache[todayKey]) {
          dynThemeDayCache = localCache[todayKey];
          dynThemeDayCacheKey = todayKey;
        }
      } catch (e) {}
    }

    if (dynThemeDayCacheKey !== todayKey || !dynThemeDayCache) {
      dynThemeDayCache = await dynThemeGetDayCached(now);
      dynThemeDayCacheKey = todayKey;
    }

    if (dynThemeDayCache) {
      const todayBase = new Date(now); todayBase.setHours(0, 0, 0, 0);
      mood = dynThemeComputeMood(now, todayBase, dynThemeDayCache.timings);
      hijri = dynThemeDayCache.hijri;
    }
  } catch (e) {
    console.error('[dynamic-theme] Veri alınamadı, varsa eski veriler kullanılıyor:', e);
    // Hata durumunda eğer elimizde o güne ait eski bir önbellek varsa onu kullanmaya devam et
    if (dynThemeDayCache) {
      hijri = dynThemeDayCache.hijri;
    }
  }

  const occasion = dynThemeComputeOccasion(now, hijri);
  dynThemeApply(mood, occasion);
  dynThemeMaybeNotify(occasion);
}

function dynThemeInit() {
  dynThemeTick();
  setInterval(dynThemeTick, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') dynThemeTick();
  });
}

// Daha güvenli başlatma (DOMContentLoaded kaçırılmış olabilir)
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', dynThemeInit);
} else {
  dynThemeInit();
}
