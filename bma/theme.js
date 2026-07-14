// theme.js — Karanlık/Aydınlık mod ve titreşim (haptic) tercihleri

    // === MERKEZİ HAPTİK YARDIMCISI ===
    // Uygulama genelinde tutarlı dokunsal geri bildirim için tek nokta.
    // pattern: tek sayı (ms) veya dizi (örn. [8,30,8] çift vuruş için)
    window.haptic = function(pattern = 6) {
      if (window.hapticsEnabled === false) return;
      if (!navigator.vibrate) return;
      try { navigator.vibrate(pattern); } catch (e) {}
    };

    // === KOYU TEMA ===
    window.toggleDarkMode = function(forceValue) {
      const isDark = typeof forceValue === 'boolean' ? forceValue : document.documentElement.getAttribute('data-theme') !== 'dark';
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      localStorage.setItem('manevi-atlas-theme', isDark ? 'dark' : 'light');
      document.getElementById('darkModeToggle')?.classList.toggle('on', isDark);
      const icon = document.getElementById('headerThemeIcon');
      if (icon) icon.className = isDark ? 'fa-solid fa-sun text-[11px]' : 'fa-solid fa-moon text-[11px]';
      window.haptic(6);
    };
    function loadTheme() {
      const saved = localStorage.getItem('manevi-atlas-theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = saved ? saved === 'dark' : prefersDark;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.getElementById('darkModeToggle')?.classList.toggle('on', isDark);
      const icon = document.getElementById('headerThemeIcon');
      if (icon) icon.className = isDark ? 'fa-solid fa-sun text-[11px]' : 'fa-solid fa-moon text-[11px]';
    }
    // === DOKUNSAL GERİ BİLDİRİM AYARI ===
    window.hapticsEnabled = (localStorage.getItem('manevi-atlas-haptics') !== 'off');
    window.toggleHaptics = function() {
      window.hapticsEnabled = !window.hapticsEnabled;
      localStorage.setItem('manevi-atlas-haptics', window.hapticsEnabled ? 'on' : 'off');
      document.getElementById('hapticToggle')?.classList.toggle('on', window.hapticsEnabled);
      window.haptic(6);
    };
    function loadHapticsUI() {
      document.getElementById('hapticToggle')?.classList.toggle('on', window.hapticsEnabled);
    }
