// storage-health.js — Depolama Sağlığı Kontrolü ve buna duyarlı akıllı yedek hatırlatması
//
// Bazı ortamlarda (gizli sekme/Incognito, iOS Safari, düşük kotalı cihazlar)
// IndexedDB/localStorage hataları sessizce düşebilir ya da veriler tarayıcı
// tarafından beklenenden erken temizlenebilir. Bu dosya:
//   1) Açılışta navigator.storage.estimate()/persist() ile depolamanın
//      durumunu ölçer; riskli görünüyorsa kullanıcıyı görsel olarak uyarır
//      (Ana Sayfa'da banner, Ayarlar'da kalıcı durum satırı).
//   2) Riskli bir ortam tespit edilirse, mevcut yedek hatırlatma mekanizmasının
//      eşiğini düşürerek (window.maybeShowBackupReminder sarmalanarak)
//      kullanıcıyı normalden daha erken yedek almaya teşvik eder.
//
// db.js / backup.js / ui.js içindeki hiçbir satıra dokunulmaz; yalnızca
// var olan window.* fonksiyonları monkey-patch ile sarmalanır
// (out-of-bursa-visit.js'teki yaklaşımla aynı desen).

(function () {
  'use strict';

  var RISKY_QUOTA_BYTES = 50 * 1024 * 1024; // ~50MB altı kota -> genelde gizli sekme/kısıtlı ortam belirtisi
  var CRITICAL_USAGE_RATIO = 0.85;           // kullanılan alan kotanın %85'ini geçtiyse kritik say
  var RISKY_REMINDER_THRESHOLD = 1;          // riskli ortamda bu kadar yedeksiz değişiklikten sonra hemen uyar

  window.__storageHealth = {
    checked: false,
    supported: !!(navigator.storage && navigator.storage.estimate),
    persisted: null,  // true / false / null (desteklenmiyorsa null)
    risky: false,
    reason: '',       // kullanıcıya gösterilecek gerekçe anahtarı
    usageBytes: null,
    quotaBytes: null,
    usageRatio: null
  };

  var __checkStarted = false;

  async function runStorageHealthCheck() {
    if (__checkStarted) return;
    __checkStarted = true;

    var health = window.__storageHealth;

    try {
      if (navigator.storage && navigator.storage.estimate) {
        var est = await navigator.storage.estimate();
        health.usageBytes = est.usage || 0;
        health.quotaBytes = est.quota || 0;
        if (health.quotaBytes > 0) {
          health.usageRatio = health.usageBytes / health.quotaBytes;
        }
        if (health.quotaBytes && health.quotaBytes < RISKY_QUOTA_BYTES) {
          health.risky = true;
          health.reason = 'quota-low';
        }
        if (health.usageRatio !== null && health.usageRatio >= CRITICAL_USAGE_RATIO) {
          health.risky = true;
          health.reason = 'usage-critical';
        }
      } else {
        // Tarayıcı estimate() desteklemiyorsa temkinli davranıyoruz (örn. bazı eski/gizli sekme durumları).
        health.risky = true;
        health.reason = 'unsupported';
      }
    } catch (e) {
      health.risky = true;
      health.reason = 'estimate-error';
    }

    try {
      if (navigator.storage && navigator.storage.persist) {
        health.persisted = await navigator.storage.persist();
        if (!health.persisted && !health.reason) {
          health.risky = true;
          health.reason = 'not-persisted';
        }
      }
    } catch (e) {
      health.persisted = false;
    }

    // db.js zaten IndexedDB'yi kullanamayıp localStorage'a düştüyse, bu da riskli sayılır.
    if (typeof useIndexedDB !== 'undefined' && useIndexedDB === false) {
      health.risky = true;
      health.reason = 'no-indexeddb';
    }

    health.checked = true;
    updateStorageHealthUI();

    if (health.risky && typeof window.maybeShowBackupReminder === 'function') {
      window.maybeShowBackupReminder();
    }
  }

  function formatBytes(n) {
    if (n === null || n === undefined) return '?';
    if (n < 1024 * 1024) return Math.round(n / 1024) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function reasonText(reason) {
    switch (reason) {
      case 'quota-low':
        return 'Bu tarayıcıda ayrılan depolama alanı çok düşük görünüyor (gizli sekme/Incognito olabilir). Kayıtlarınız kalıcı olmayabilir; sık sık yedek almanız önerilir.';
      case 'usage-critical':
        return 'Depolama alanınız neredeyse dolu. Yeni kayıt/fotoğraf eklemek başarısız olabilir; lütfen yedek alıp gerekirse eski kayıt/fotoğrafları temizleyin.';
      case 'not-persisted':
        return 'Tarayıcı, verilerinizi "kalıcı" olarak işaretlemedi; sistem depolama alanı azaldığında kayıtlarınız otomatik silinebilir. Düzenli yedek almanız önerilir.';
      case 'no-indexeddb':
        return 'Cihazınızda gelişmiş depolama (IndexedDB) kullanılamıyor, kayıtlar sınırlı yedek alanda tutuluyor. Düzenli yedek almanız önerilir.';
      case 'unsupported':
      case 'estimate-error':
      default:
        return 'Bu tarayıcı ortamında depolama durumu tam olarak doğrulanamadı. Önlem olarak düzenli yedek almanız önerilir.';
    }
  }

  window.updateStorageHealthUI = function () {
    var health = window.__storageHealth;
    var banner = document.getElementById('storageHealthBanner');
    var bannerText = document.getElementById('storageHealthBannerText');
    var infoEl = document.getElementById('storageHealthInfo');
    var iconEl = document.getElementById('storageHealthIcon');

    if (infoEl) {
      if (!health.checked) {
        infoEl.textContent = 'Kontrol ediliyor...';
        infoEl.style.color = '';
      } else if (health.risky) {
        infoEl.textContent = '⚠ Risk altında — ' + reasonText(health.reason);
        infoEl.style.color = 'var(--brick)';
      } else {
        var detail = health.quotaBytes ? (' (' + formatBytes(health.usageBytes) + ' / ' + formatBytes(health.quotaBytes) + ')') : '';
        infoEl.textContent = '✓ Kalıcı ve sağlıklı' + detail;
        infoEl.style.color = 'var(--teal-900)';
      }
    }
    if (iconEl) {
      iconEl.style.background = health.risky ? 'rgba(168,86,49,0.14)' : 'rgba(21,90,76,0.1)';
      iconEl.style.color = health.risky ? 'var(--brick)' : 'var(--teal-900)';
    }

    if (banner && bannerText) {
      var dismissed = false;
      try { dismissed = sessionStorage.getItem('manevi-atlas-storage-health-dismissed') === '1'; } catch (e) {}
      if (health.checked && health.risky && !dismissed) {
        bannerText.textContent = reasonText(health.reason);
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }
  };

  window.dismissStorageHealthBanner = function () {
    try { sessionStorage.setItem('manevi-atlas-storage-health-dismissed', '1'); } catch (e) {}
    var banner = document.getElementById('storageHealthBanner');
    if (banner) banner.classList.add('hidden');
  };

  // Riskli bir ortam tespit edilirse yedek hatırlatma eşiğini düşürür:
  // normalde BACKUP_REMINDER_THRESHOLD (2) yedeksiz değişiklik beklenirken,
  // riskli ortamda RISKY_REMINDER_THRESHOLD (1) değişiklik sonrası bile
  // banner gösterilir.
  function wrapMaybeShowBackupReminder() {
    var original = window.maybeShowBackupReminder;
    if (!original || original.__storageHealthWrapped) return;

    var wrapped = function () {
      var health = window.__storageHealth;
      if (health && health.risky) {
        try {
          if (sessionStorage.getItem('manevi-atlas-backup-reminder-dismissed') === '1') return;
        } catch (e) {}
        var status = (typeof getBackupStatus === 'function') ? getBackupStatus() : { lastAt: 0, changes: 0 };
        var banner = document.getElementById('backupReminderBanner');
        if (banner && status.changes >= RISKY_REMINDER_THRESHOLD) {
          banner.classList.remove('hidden');
          return;
        }
      }
      return original.apply(this, arguments);
    };

    wrapped.__storageHealthWrapped = true;
    window.maybeShowBackupReminder = wrapped;
  }

  function init() {
    wrapMaybeShowBackupReminder();
    runStorageHealthCheck();
  }

  document.addEventListener('DOMContentLoaded', init);
  // ui.js/db.js gibi diğer dosyalarda olduğu gibi, DOMContentLoaded'dan önce
  // de bir deneme yapalım (bu script zaten body sonunda yüklendiği için DOM hazırdır).
  init();
})();
