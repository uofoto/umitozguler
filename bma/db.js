// db.js — IndexedDB erişim katmanı ve ziyaret kayıtlarının (visits) yüklenmesi/kaydedilmesi

    // IndexedDB & Backup configurations
    const DB_NAME = 'BursaManeviAtlasDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'visits';
    const LS_FALLBACK_KEY = 'bursa-manevi-atlas-visits-fallback-v1';
    // === YEDEKLEME HATIRLATMA TAKİBİ ===
    // Veriler yalnızca bu cihazda (IndexedDB/localStorage) saklandığı için,
    // kullanıcı çerezleri/site verilerini silerse veya farklı bir cihaza
    // geçerse tüm kayıtlar kaybolabilir. Bunu azaltmak için: kaç değişiklik
    // yapıldığını ve en son ne zaman JSON yedeği indirildiğini takip edip,
    // belirli bir eşiği geçince kullanıcıya nazik bir hatırlatma gösteriyoruz.
    const BACKUP_LAST_AT_KEY = 'manevi-atlas-last-backup-at';
    const BACKUP_CHANGES_KEY = 'manevi-atlas-unbacked-changes';
    const BACKUP_REMINDER_THRESHOLD = 2; // bu kadar yedeksiz değişiklikten sonra hatırlat
    function markDataChanged() {
      try {
        const n = (parseInt(localStorage.getItem(BACKUP_CHANGES_KEY) || '0', 10) || 0) + 1;
        localStorage.setItem(BACKUP_CHANGES_KEY, String(n));
      } catch (e) {}
      if (typeof window.maybeShowBackupReminder === 'function') window.maybeShowBackupReminder();
    }
    function getBackupStatus() {
      let lastAt = 0, changes = 0;
      try { lastAt = parseInt(localStorage.getItem(BACKUP_LAST_AT_KEY) || '0', 10) || 0; } catch (e) {}
      try { changes = parseInt(localStorage.getItem(BACKUP_CHANGES_KEY) || '0', 10) || 0; } catch (e) {}
      return { lastAt, changes };
    }
    let visitsData = [];
    let activeFilterDistrict = 'HEPSİ';
    let currentActiveTab = 0;
    let useIndexedDB = true;
    let dbInstance = null;
    window.uploadedPhotos = { 1: null, 2: null };
    window.photoGalleries = {};
    let editingVisitId = null;
    let editingMosqueId = null;
    let pendingMosqueDeleteId = null;
    try { if (!window.indexedDB) useIndexedDB = false; } catch (e) { useIndexedDB = false; }
    function openDB() {
      return new Promise((resolve, reject) => {
        if (dbInstance) { resolve(dbInstance); return; }
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => { dbInstance = req.result; resolve(dbInstance); };
        req.onerror = () => reject(req.error);
      });
    }
    async function dbGetAll() {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    }
    async function dbPut(record) {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(record);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    }
    async function dbDelete(id) {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    }
    function saveFallbackToLocalStorage() {
      localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(visitsData));
    }
    // localStorage/IndexedDB kota aşımı hatalarını, diğer hatalardan (örn.
    // gizli sekme kısıtlaması, geçici IO hatası) ayırt etmek için kullanılır;
    // tarayıcılar arasında hata adı/kodu tutarlı olmadığından ikisini de kontrol eder.
    function isQuotaExceededError(e) {
      if (!e) return false;
      return e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014;
    }
    // Cihazda IndexedDB kullanılamayıp localStorage'a düşüldüğünde kullanıcıyı
    // bir kere bilgilendirir (localStorage kotası ~5MB ile IndexedDB'ye göre
    // çok daha sınırlı olduğundan, özellikle fotoğraflı kayıtlarda sorun çıkabilir).
    let _fallbackWarningShown = false;
    function warnIndexedDBFallbackOnce() {
      if (_fallbackWarningShown) return;
      _fallbackWarningShown = true;
      if (typeof showToast === 'function') {
        showToast("Cihazınızda gelişmiş depolama (IndexedDB) kullanılamıyor; kayıtlar sınırlı yedek alanda tutulacak. Çok sayıda fotoğraflı kayıt sorun çıkarabilir, düzenli yedek almanız önerilir.", "error");
      }
    }
    function getVisitTimestamp(v) {
      if (v.date) {
        const d = new Date(`${v.date}T${v.time || '00:00'}`);
        if (!isNaN(d.getTime())) return d.getTime();
      }
      const c = v.createdAt ? new Date(v.createdAt).getTime() : NaN;
      return isNaN(c) ? 0 : c;
    }
    function sortVisitsInMemory() {
      visitsData.sort((a, b) => getVisitTimestamp(b) - getVisitTimestamp(a));
    }
    async function loadVisits() {
      try {
        if (useIndexedDB) {
          visitsData = await dbGetAll();
        } else {
          const raw = localStorage.getItem(LS_FALLBACK_KEY);
          visitsData = raw ? JSON.parse(raw) : [];
        }
      } catch (e) {
        useIndexedDB = false;
        warnIndexedDBFallbackOnce();
        try {
          const raw = localStorage.getItem(LS_FALLBACK_KEY);
          visitsData = raw ? JSON.parse(raw) : [];
        } catch (e2) {
          visitsData = [];
        }
      }
      sortVisitsInMemory();
    }
    async function persistNewVisit(record) {
      try {
        if (useIndexedDB) {
          await dbPut(record);
        } else {
          saveFallbackToLocalStorage();
        }
        markDataChanged();
        return true;
      } catch (e) {
        try { saveFallbackToLocalStorage(); markDataChanged(); return true; }
        catch (e2) {
          if (isQuotaExceededError(e2)) {
            showToast("Depolama alanınız doldu, kayıt eklenemedi. Ayarlar'dan yedek alıp bazı eski kayıtları/fotoğrafları silmeyi deneyin.", "error");
          } else {
            showToast("Kayıt cihazınıza kaydedilemedi. Depolama alanınızı kontrol edin.", "error");
          }
          return false;
        }
      }
    }
    async function persistDeleteVisit(id) {
      try {
        if (useIndexedDB) {
          await dbDelete(id);
        } else {
          saveFallbackToLocalStorage();
        }
        markDataChanged();
        return true;
      } catch (e) {
        try { saveFallbackToLocalStorage(); markDataChanged(); return true; }
        catch (e2) {
          showToast("Kayıt silinirken bir sorun oluştu.", "error");
          return false;
        }
      }
    }
    async function executeDeleteLog(docId) {
      const backup = visitsData;
      visitsData = visitsData.filter(v => v.id !== docId);
      const ok = await persistDeleteVisit(docId);
      if (ok) {
        triggerAllUIUpdates();
        showToast("Kayıt günlükten silindi.", "success");
      } else {
        visitsData = backup;
      }
    }
