// theme.js — Karanlık/Aydınlık mod ve dokunsal geri bildirim (haptics) yönetimi.

// Cihaz titreşimini tetikler (destekleniyorsa). Kullanıcı ayarlardan
// dokunsal geri bildirimi kapattıysa (hapticsEnabled === false) sessizce
// hiçbir şey yapmaz.
window.haptic = function (duration = 6) {
  if (window.hapticsEnabled === false) return;
  if (!navigator.vibrate) return;
  try {
    navigator.vibrate(duration);
  } catch (e) {}
};

// Karanlık/aydınlık modu değiştirir (force verilirse doğrudan o değere
// zorlar), <html data-theme> özniteliğini ve localStorage'ı günceller,
// üst bardaki ay/güneş ikonunu ve ayarlar sayfasındaki anahtarı senkronlar.
window.toggleDarkMode = function (force) {
  const isDark = typeof force === 'boolean'
    ? force
    : document.documentElement.getAttribute('data-theme') !== 'dark';

  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  localStorage.setItem('manevi-atlas-theme', isDark ? 'dark' : 'light');
  document.getElementById('darkModeToggle')?.classList.toggle('on', isDark);

  const icon = document.getElementById('headerThemeIcon');
  if (icon) icon.className = isDark ? 'fa-solid fa-sun text-[11px]' : 'fa-solid fa-moon text-[11px]';

  window.haptic(15);
};

// Uygulama açılışında: daha önce kaydedilmiş bir tema tercihi varsa onu,
// yoksa cihazın sistem temasını (prefers-color-scheme) kullanarak temayı
// uygular. Sayfa her yenilendiğinde initApp() içinden çağrılır.
function loadTheme() {
  const saved = localStorage.getItem('manevi-atlas-theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : systemPrefersDark;

  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('darkModeToggle')?.classList.toggle('on', isDark);

  const icon = document.getElementById('headerThemeIcon');
  if (icon) icon.className = isDark ? 'fa-solid fa-sun text-[11px]' : 'fa-solid fa-moon text-[11px]';
}

// Dokunsal geri bildirim tercihi: varsayılan açık, kullanıcı kapatırsa
// localStorage'da 'off' olarak saklanır.
window.hapticsEnabled = localStorage.getItem('manevi-atlas-haptics') !== 'off';

window.toggleHaptics = function () {
  window.hapticsEnabled = !window.hapticsEnabled;
  localStorage.setItem('manevi-atlas-haptics', window.hapticsEnabled ? 'on' : 'off');
  document.getElementById('hapticToggle')?.classList.toggle('on', window.hapticsEnabled);
  window.haptic(15);
};

// Ayarlar sayfası açıldığında dokunsal geri bildirim anahtarının görsel
// durumunu mevcut tercihle senkronlar.
function loadHapticsUI() {
  document.getElementById('hapticToggle')?.classList.toggle('on', window.hapticsEnabled);
}
