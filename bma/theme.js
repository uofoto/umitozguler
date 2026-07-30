// theme.js — Karanlık/aydınlık tema ve dokunsal (haptic) geri bildirim ayarları
//
// NOT: Bu dosya orijinalinde javascript-obfuscator ile şifrelenmişti
// (tek satır, hex değişken adları, kodlanmış string dizisi). webcrack
// aracıyla statik olarak çözüldü ve okunabilir hale getirildi.
// Çözülen mantık tamamen zararsızdır: sadece localStorage üzerinden
// tema/haptic tercihini okuyup DOM'a uyguluyor. Ağ isteği, eval,
// veri gönderimi vb. hiçbir şüpheli davranış içermiyor.

// === DOKUNSAL GERİ BİLDİRİM (HAPTIC) ===
window.haptic = function (durationMs = 6) {
  if (window.hapticsEnabled === false) return;
  if (!navigator.vibrate) return;
  try {
    navigator.vibrate(durationMs);
  } catch (e) {
    // Bazı tarayıcılar/izin politikaları vibrate() çağrısını reddedebilir;
    // sessizce yok say.
  }
};

// === KARANLIK / AYDINLIK MOD ===
window.toggleDarkMode = function (forceValue) {
  const isDark =
    typeof forceValue === "boolean"
      ? forceValue
      : document.documentElement.getAttribute("data-theme") !== "dark";

  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  localStorage.setItem("manevi-atlas-theme", isDark ? "dark" : "light");

  document.getElementById("darkModeToggle")?.classList.toggle("on", isDark);

  const themeIcon = document.getElementById("headerThemeIcon");
  if (themeIcon) {
    themeIcon.className = isDark
      ? "fa-solid fa-sun text-[11px]"
      : "fa-solid fa-moon text-[11px]";
  }

  window.haptic(15);
};

function loadTheme() {
  const savedTheme = localStorage.getItem("manevi-atlas-theme");
  const systemPrefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme ? savedTheme === "dark" : systemPrefersDark;

  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  document.getElementById("darkModeToggle")?.classList.toggle("on", isDark);

  const themeIcon = document.getElementById("headerThemeIcon");
  if (themeIcon) {
    themeIcon.className = isDark
      ? "fa-solid fa-sun text-[11px]"
      : "fa-solid fa-moon text-[11px]";
  }
}

// === DOKUNSAL GERİ BİLDİRİM AÇ/KAPA ===
window.hapticsEnabled = localStorage.getItem("manevi-atlas-haptics") !== "off";

window.toggleHaptics = function () {
  window.hapticsEnabled = !window.hapticsEnabled;
  localStorage.setItem("manevi-atlas-haptics", window.hapticsEnabled ? "on" : "off");
  document.getElementById("hapticToggle")?.classList.toggle("on", window.hapticsEnabled);
  window.haptic(15);
};

function loadHapticsUI() {
  document.getElementById("hapticToggle")?.classList.toggle("on", window.hapticsEnabled);
}
