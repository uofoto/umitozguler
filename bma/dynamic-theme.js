// dynamic-theme.js — Mevsim ve Vakitlere Göre Dinamik Tema
// Görsel katman: sinematik ışık geçişleri, aurora, ambient glow ve occasion motifleri.

const DYN_THEME_LAT = 40.1826, DYN_THEME_LON = 29.0665;
const DYN_THEME_CACHE_KEY = 'manevi-atlas-dyntheme-cache';
const DYN_THEME_OCCASION_SEEN_KEY = 'manevi-atlas-dyntheme-occasion-seen';
const DYN_THEME_KANDIL_DAYS = [
  { month: 3, day: 12, name: 'Mevlid Kandili' },
  { month: 7, day: 27, name: 'Miraç Kandili' },
  { month: 8, day: 15, name: 'Berat Kandili' },
  { month: 9, day: 27, name: 'Kadir Gecesi' }
];

function dynThemeDateKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function dynThemeFormatForApi(d) { return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`; }

async function dynThemeFetchDay(dateObj) {
  const url = `https://api.aladhan.com/v1/timings/${dynThemeFormatForApi(dateObj)}?latitude=${DYN_THEME_LAT}&longitude=${DYN_THEME_LON}&method=13`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Namaz vakti servisi yanıt vermedi');
  const json = await res.json();
  if (!json || !json.data) throw new Error('Namaz vakti verisi hatalı');
  return { timings: json.data.timings, hijri: (json.data.date && json.data.date.hijri) || null };
}

async function dynThemeGetDayCached(dateObj) {
  const key = dynThemeDateKey(dateObj);
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(DYN_THEME_CACHE_KEY) || '{}'); } catch (e) { cache = {}; }
  if (cache[key]) return cache[key];
  const dayData = await dynThemeFetchDay(dateObj);
  cache[key] = dayData;
  const keys = Object.keys(cache).sort();
  while (keys.length > 4) delete cache[keys.shift()];
  try { localStorage.setItem(DYN_THEME_CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
  return dayData;
}

function dynThemeParseTimeOnDate(dateObj, hhmmRaw) {
  const [h, m] = (hhmmRaw || '00:00').split(' ')[0].split(':').map(Number);
  const d = new Date(dateObj); d.setHours(h || 0, m || 0, 0, 0); return d;
}

const DYN_THEME_DAWN_BEFORE_MIN = 25, DYN_THEME_DAWN_AFTER_MIN = 65;
const DYN_THEME_SUNSET_BEFORE_MIN = 25, DYN_THEME_SUNSET_AFTER_MIN = 55;

function dynThemeComputeMood(now, todayBase, timings) {
  if (!timings) return 'normal';
  const fajr = dynThemeParseTimeOnDate(todayBase, timings.Fajr);
  const maghrib = dynThemeParseTimeOnDate(todayBase, timings.Maghrib);
  const delta = (a, b) => (a.getTime() - b.getTime()) / 60000;
  const sinceFajr = delta(now, fajr);
  if (sinceFajr >= -DYN_THEME_DAWN_BEFORE_MIN && sinceFajr <= DYN_THEME_DAWN_AFTER_MIN) return 'dawn';
  const sinceMaghrib = delta(now, maghrib);
  if (sinceMaghrib >= -DYN_THEME_SUNSET_BEFORE_MIN && sinceMaghrib <= DYN_THEME_SUNSET_AFTER_MIN) return 'sunset';
  return 'normal';
}

function dynThemeComputeOccasion(now) {
  return now.getDay() === 5 ? { key: 'friday', label: 'Cuma Günü' } : { key: 'normal', label: null };
}

function dynThemeInstallVisualLayer() {
  if (document.getElementById('dyn-theme-visual-layer')) return;
  const style = document.createElement('style'); style.id = 'dyn-theme-visual-layer';
  style.textContent = `
    :root { --mood-overlay-bg:none; --mood-overlay-opacity:0; --mood-overlay-blend:normal; --mood-accent:#8faeff; --mood-accent-2:#e5edff; --mood-glow:rgba(157,184,255,.28); --mood-canvas:#101a31; --mood-surface:rgba(30,43,72,.72); --mood-duration:1400ms; }
    body { --dyn-transition: color var(--mood-duration) ease, background-color var(--mood-duration) ease; transition:var(--dyn-transition); }
    body::before, body::after { content:""; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:var(--mood-overlay-opacity); transition:opacity var(--mood-duration) ease, background var(--mood-duration) ease, transform 2s ease; }
    body::before { background:var(--mood-overlay-bg), radial-gradient(ellipse at 18% 8%, rgba(255,255,255,.16), transparent 26%), conic-gradient(from 215deg at 72% 32%, transparent 0deg, rgba(255,255,255,.08) 38deg, transparent 78deg); background-size:180% 180%, 140% 140%, 170% 170%; background-position:0% 50%, 0% 0%, 100% 100%; mix-blend-mode:var(--mood-overlay-blend); animation:dyn-aurora 24s cubic-bezier(.37,0,.18,1) infinite alternate; }
    body::after { inset:-22%; background:radial-gradient(ellipse at 16% 18%, var(--mood-glow), transparent 22%), radial-gradient(ellipse at 84% 78%, var(--mood-glow), transparent 25%), radial-gradient(ellipse at 58% 4%, rgba(255,255,255,.10), transparent 18%); filter:blur(42px); opacity:calc(var(--mood-overlay-opacity) * .8); animation:dyn-orbit 17s cubic-bezier(.45,0,.2,1) infinite alternate; }
    body > * { position:relative; z-index:1; }
    .mood-dawn { --mood-accent:#ffc86e; --mood-accent-2:#dff4ff; --mood-glow:rgba(255,194,107,.38); --mood-canvas:#8fc8e8; --mood-surface:rgba(39,78,120,.78); }
    .mood-sunset { --mood-accent:#ffd27f; --mood-accent-2:#ffe4c4; --mood-glow:rgba(255,166,101,.38); --mood-canvas:#bd817e; --mood-surface:rgba(106,61,76,.76); }
    .mood-normal { --mood-accent:#a9c1ff; --mood-accent-2:#edf2ff; --mood-canvas:#101a31; --mood-surface:rgba(30,43,72,.72); }
    .occasion-friday { --mood-accent:#c99545; --mood-accent-2:#fff3cf; --mood-glow:rgba(255,215,126,.48); --mood-canvas:#b8e7df; --mood-surface:rgba(39,105,108,.78); }
    .occasion-friday::after { opacity:calc(var(--mood-overlay-opacity) * .82); background:radial-gradient(circle at 78% 10%, rgba(255,247,205,.56), transparent 28%), radial-gradient(circle at 22% 88%, rgba(255,219,149,.28), transparent 30%); }
    @media (prefers-reduced-motion: reduce) { body::after { animation:none; } body::before, body::after { animation:none; transition:none; } }
    @keyframes dyn-breathe { from { transform:translate3d(-1%, -1%, 0) scale(1); } to { transform:translate3d(1%, 1%, 0) scale(1.04); } }
    @keyframes dyn-aurora { 0% { background-position:0% 50%, 0% 0%, 100% 100%; transform:scale(1) rotate(0deg); } 45% { background-position:48% 42%, 72% 18%, 54% 72%; transform:scale(1.035) rotate(.35deg); } 100% { background-position:100% 50%, 18% 76%, 0% 18%; transform:scale(1.06) rotate(-.35deg); } }
    @keyframes dyn-orbit { 0% { transform:translate3d(-1.5%, 1%, 0) scale(1); } 50% { transform:translate3d(1%, -1.5%, 0) scale(1.035); } 100% { transform:translate3d(2%, 1%, 0) scale(1.07); } }
    @media (prefers-reduced-motion: reduce) { body::after { animation:none; } body::before, body::after { animation:none; transition:none; } }
  `;
  document.head.appendChild(style);

}

function dynThemeApply(mood, occasion) {
  const body = document.body, root = document.documentElement;
  if (!body || !root) return;
  dynThemeInstallVisualLayer();
  body.classList.remove('mood-dawn', 'mood-sunset', 'mood-normal', 'occasion-friday');
  body.classList.add(`mood-${mood}`);
  if (occasion && occasion.key !== 'normal') body.classList.add(`occasion-${occasion.key}`);
  const layers = [];
  if (mood === 'dawn') layers.push('linear-gradient(135deg, rgba(255,215,164,.76) 0%, rgba(159,211,255,.42) 48%, rgba(177,184,255,.2) 76%, transparent 100%)');
  if (mood === 'sunset') layers.push('linear-gradient(145deg, rgba(255,188,104,.66) 0%, rgba(236,123,99,.5) 42%, rgba(166,90,147,.4) 76%, transparent 100%)');
  if (occasion?.key === 'friday') layers.push('radial-gradient(circle at 78% 8%, rgba(255,241,190,.72), transparent 32%), radial-gradient(circle at 12% 88%, rgba(255,215,151,.38), transparent 36%)');
  root.style.setProperty('--mood-overlay-bg', layers.length ? layers.join(', ') : 'none');
  root.style.setProperty('--mood-overlay-opacity', layers.length ? '1' : '0');
  root.style.setProperty('--mood-overlay-blend', mood === 'normal' ? 'soft-light' : 'screen');
  const isSpecial = mood !== 'normal' || occasion?.key === 'friday';
  root.style.setProperty('--mood-canvas', mood === 'dawn' ? '#8fc8e8' : mood === 'sunset' ? '#bd817e' : occasion?.key === 'friday' ? '#b8e7df' : '#101a31');
  body.style.background = isSpecial ? 'var(--mood-canvas)' : '';
  window.dispatchEvent(new CustomEvent('dynamic-theme-change', { detail: { mood, occasion } }));
}

function dynThemeMaybeNotify(occasion) {
  if (!occasion || occasion.key === 'normal' || typeof showToast !== 'function') return;
  const todayKey = dynThemeDateKey(new Date()); let seen = {};
  try { seen = JSON.parse(localStorage.getItem(DYN_THEME_OCCASION_SEEN_KEY) || '{}'); } catch (e) {}
  const seenKey = `${todayKey}:${occasion.key}`; if (seen[seenKey]) return;
  const filteredSeen = {}; Object.keys(seen).forEach(k => { if (k.startsWith(todayKey)) filteredSeen[k] = seen[k]; });
  filteredSeen[seenKey] = true;
  try { localStorage.setItem(DYN_THEME_OCCASION_SEEN_KEY, JSON.stringify(filteredSeen)); } catch (e) {}
  showToast(`${occasion.label} mübarek olsun. Uygulama bugüne özel bir motifle karşınızda.`, 'success');
}

let dynThemeDayCache = null, dynThemeDayCacheKey = null;
async function dynThemeTick() {
  const now = new Date(); let hijri = null, mood = 'normal';
  try {
    const todayKey = dynThemeDateKey(now);
    if (!dynThemeDayCache) { try { const c = JSON.parse(localStorage.getItem(DYN_THEME_CACHE_KEY) || '{}'); if (c[todayKey]) { dynThemeDayCache = c[todayKey]; dynThemeDayCacheKey = todayKey; } } catch (e) {} }
    if (dynThemeDayCacheKey !== todayKey || !dynThemeDayCache) { dynThemeDayCache = await dynThemeGetDayCached(now); dynThemeDayCacheKey = todayKey; }
    if (dynThemeDayCache) { const base = new Date(now); base.setHours(0, 0, 0, 0); mood = dynThemeComputeMood(now, base, dynThemeDayCache.timings); hijri = dynThemeDayCache.hijri; }
  } catch (e) { console.error('[dynamic-theme] Veri alınamadı:', e); if (dynThemeDayCache) hijri = dynThemeDayCache.hijri; }
  const occasion = dynThemeComputeOccasion(now); dynThemeApply(mood, occasion); dynThemeMaybeNotify(occasion);
}

function dynThemeInit() { dynThemeInstallVisualLayer(); dynThemeTick(); setInterval(dynThemeTick, 5 * 60 * 1000); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') dynThemeTick(); }); }

// Ön izleme sayfası veya test ortamı için güvenli kontrol noktası.
window.dynThemePreview = { apply: dynThemeApply, install: dynThemeInstallVisualLayer };
if (!new URLSearchParams(location.search).has('preview')) {
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', dynThemeInit); else dynThemeInit();
}
