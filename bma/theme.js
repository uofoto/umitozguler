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
  const currentTheme = document.documentElement.getAttribute("data-theme");
  let nextTheme = "light";
  
  if (typeof forceValue === "boolean") {
    nextTheme = forceValue ? "dark" : "light";
  } else {
    // Döngü: Light -> Dark -> Auto -> Light
    if (currentTheme === "light") nextTheme = "dark";
    else if (currentTheme === "dark") nextTheme = "auto";
    else nextTheme = "light";
  }

  setTheme(nextTheme);
  window.haptic(15);
};

function setTheme(theme) {
  localStorage.setItem("manevi-atlas-theme", theme);
  
  if (theme === "auto") {
    updateDynamicTheme();
  } else {
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeUI(theme);
  }
}

function updateThemeUI(theme) {
  const isDark = theme === "dark" || (theme === "auto" && document.documentElement.getAttribute("data-theme") === "dark");
  document.getElementById("darkModeToggle")?.classList.toggle("on", theme === "dark");
  
  const themeIcon = document.getElementById("headerThemeIcon");
  if (themeIcon) {
    if (theme === "auto") {
      themeIcon.className = "fa-solid fa-wand-magic-sparkles text-[11px]";
    } else {
      themeIcon.className = isDark ? "fa-solid fa-sun text-[11px]" : "fa-solid fa-moon text-[11px]";
    }
  }
}

window.updateDynamicTheme = function() {
  const savedTheme = localStorage.getItem("manevi-atlas-theme");
  if (savedTheme !== "auto") return;

  const now = new Date();
  const day = now.getDay();
  let theme = "light";

  // 1. Özel Gün Kontrolü (Cuma / Kandil)
  // Kandil tarihleri (2026/2027 için basit bir liste eklenebilir)
  const isFriday = day === 5;
  if (isFriday) {
    theme = "special";
  }

  // 2. Vakit Kontrolü (Eğer namaz vakitleri yüklüyse)
  if (window.prayerTimingsToday) {
    const todayBase = new Date(); todayBase.setHours(0,0,0,0);
    
    const parseTime = (hhmm) => {
      const [h, m] = hhmm.split(':').map(Number);
      const d = new Date(todayBase); d.setHours(h, m, 0, 0);
      return d;
    };

    const fajr = parseTime(window.prayerTimingsToday.Fajr);
    const sunrise = parseTime(window.prayerTimingsToday.Sunrise);
    const maghrib = parseTime(window.prayerTimingsToday.Maghrib);
    const isha = parseTime(window.prayerTimingsToday.Isha);

    // Şafak: Fajr ile Sunrise arası + 1 saat
    const dawnEnd = new Date(sunrise); dawnEnd.setHours(dawnEnd.getHours() + 1);
    if (now >= fajr && now <= dawnEnd) {
      theme = "dawn";
    } 
    // Gün Batımı: Maghrib - 30dk ile Isha arası
    else if (now >= new Date(maghrib.getTime() - 30*60000) && now <= isha) {
      theme = "sunset";
    }
    // Gece: Isha'dan Fajr'a kadar
    else if (now >= isha || now < fajr) {
      theme = "dark";
    }
  } else {
    // Vakitler yoksa basit saat kontrolü
    const hour = now.getHours();
    if (hour >= 5 && hour <= 8) theme = "dawn";
    else if (hour >= 18 && hour <= 20) theme = "sunset";
    else if (hour >= 21 || hour <= 4) theme = "dark";
  }

  document.documentElement.setAttribute("data-theme", theme);
  updateThemeUI("auto");
};

function loadTheme() {
  const savedTheme = localStorage.getItem("manevi-atlas-theme") || "auto";
  setTheme(savedTheme);
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
