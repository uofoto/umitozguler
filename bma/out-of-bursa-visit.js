// out-of-bursa-visit.js
// "Bursa Dışında Ziyaret Ettim" özelliği.
//
// Bursa dışındaki bir ilde/tarihi camide kılınan namazı deftere kaydetmeye
// yarar. PRESET_MOSQUES listesine (Bursa cami veritabanı) HİÇBİR ŞEY
// eklemez; bu yüzden Bursa'ya özel istatistikleri (toplam cami, ilçe
// dağılımı, "tüm camileri ziyaret et" tamamlama yüzdesi vb.) etkilemez.
// Kayıt, günlükteki diğer ziyaretler gibi visitsData içine normal şekilde
// eklenir; sadece `district` alanına ilçe yerine girilen şehir adı, ve
// ayırt edici bir `outOfBursa:true` bayrağı yazılır.
//
// index.html'e eklenen #outOfBursaSection, #mosqueSelectFieldWrap ve
// #btnToggleOutOfBursa elemanlarıyla birlikte çalışır. ui.js/db.js
// içindeki window.handleVisitSubmit, window.triggerEditVisit ve
// window.cancelEditVisit fonksiyonları SARMALANIR (monkey-patch); orijinal
// obfuscate edilmemiş ama dokunulmayan koda hiçbir satır eklenmez/silinmez
// (ui.js'teki küçük rozet eklemesi hariç, o da ayrı bir düzenlemedir).

(function () {
  'use strict';

  window.__outOfBursaActive = false;

  window.toggleOutOfBursaMode = function (force) {
    var active = (typeof force === 'boolean') ? force : !window.__outOfBursaActive;
    window.__outOfBursaActive = active;

    var fieldWrap = document.getElementById('mosqueSelectFieldWrap');
    var select = document.getElementById('formMosqueSelect');
    var customSection = document.getElementById('customMosqueSection');
    var customNameInput = document.getElementById('formCustomName');
    var outSection = document.getElementById('outOfBursaSection');
    var cityInput = document.getElementById('formOutOfBursaCity');
    var nameInput = document.getElementById('formOutOfBursaName');
    var toggleBtn = document.getElementById('btnToggleOutOfBursa');

    if (active) {
      if (fieldWrap) fieldWrap.classList.add('hidden');
      if (customSection) customSection.classList.add('hidden');
      if (customNameInput) customNameInput.required = false;
      if (select) select.required = false;
      if (outSection) outSection.classList.remove('hidden');
      if (cityInput) cityInput.required = true;
      if (nameInput) nameInput.required = true;
      if (toggleBtn) toggleBtn.classList.add('hidden');
    } else {
      if (fieldWrap) fieldWrap.classList.remove('hidden');
      if (select) select.required = true;
      if (outSection) outSection.classList.add('hidden');
      if (cityInput) { cityInput.required = false; cityInput.value = ''; }
      if (nameInput) { nameInput.required = false; nameInput.value = ''; }
      if (toggleBtn) toggleBtn.classList.remove('hidden');
      if (typeof window.toggleCustomMosqueInput === 'function') window.toggleCustomMosqueInput();
    }
  };

  function wrapHandleVisitSubmit() {
    var originalSubmit = window.handleVisitSubmit;
    if (!originalSubmit || originalSubmit.__outOfBursaWrapped) return;

    var wrapped = async function (event) {
      if (!window.__outOfBursaActive) {
        return originalSubmit.apply(this, arguments);
      }

      event.preventDefault();

      var city = document.getElementById('formOutOfBursaCity').value.trim();
      var mosqueName = document.getElementById('formOutOfBursaName').value.trim();
      var prayerTime = document.getElementById('formPrayerSelected').value;
      var address = document.getElementById('formAddress').value.trim();
      var date = document.getElementById('formDate').value;
      var time = document.getElementById('formTime').value;
      var notes = document.getElementById('formNotes').value.trim();

      if (!city) { showToast('Lütfen şehir/il adını girin.', 'error'); return; }
      if (!mosqueName) { showToast('Mabet ismi boş bırakılamaz.', 'error'); return; }
      if (!prayerTime) { showToast('Lütfen kılınan namaz vaktini belirtin.', 'error'); return; }

      var photosArray = [];
      if (window.uploadedPhotos[1]) photosArray.push(window.uploadedPhotos[1]);
      if (window.uploadedPhotos[2]) photosArray.push(window.uploadedPhotos[2]);

      var btn = document.getElementById('btnSubmitForm');
      var origText = btn.innerHTML;
      var isEditing = !!editingVisitId;
      btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> <span>' +
        (isEditing ? 'Güncelleniyor...' : 'Defter Yazılıyor...') + '</span>';
      btn.disabled = true;

      if (isEditing) {
        var idx = visitsData.findIndex(function (v) { return v.id === editingVisitId; });
        if (idx === -1) {
          showToast('Düzenlenecek kayıt bulunamadı.', 'error');
          btn.innerHTML = origText; btn.disabled = false;
          return;
        }
        var backup = Object.assign({}, visitsData[idx]);
        var updatedRecord = Object.assign({}, visitsData[idx], {
          mosqueId: visitsData[idx].outOfBursa ? visitsData[idx].mosqueId : ('outofbursa-' + Date.now()),
          mosqueName: mosqueName,
          district: city,
          outOfBursa: true,
          prayerTime: prayerTime,
          address: address || visitsData[idx].address || '',
          date: date, time: time, notes: notes, photos: photosArray
        });
        visitsData[idx] = updatedRecord;
        sortVisitsInMemory();
        var okEdit = await persistNewVisit(updatedRecord);

        if (okEdit) {
          window.haptic(20);
          showToast('Kaydınız güncellendi.', 'success');
          cancelEditVisit();
          triggerAllUIUpdates();
          switchTab(3);
        } else {
          var revertIdx = visitsData.findIndex(function (v) { return v.id === updatedRecord.id; });
          if (revertIdx !== -1) visitsData[revertIdx] = backup;
        }
        btn.innerHTML = origText;
        btn.disabled = false;
        return;
      }

      var newRecord = {
        id: 'v-' + Date.now(),
        mosqueId: 'outofbursa-' + Date.now(),
        mosqueName: mosqueName,
        district: city,
        outOfBursa: true,
        prayerTime: prayerTime,
        address: address,
        date: date, time: time, notes: notes, photos: photosArray,
        createdAt: new Date().toISOString()
      };

      visitsData.push(newRecord);
      sortVisitsInMemory();
      var ok = await persistNewVisit(newRecord);

      if (ok) {
        window.haptic([16, 55, 20]);
        showToast('İbadet kaydınız deftere işlendi. Allah kabul etsin!', 'success');
        document.getElementById('visitForm').reset();
        window.uploadedPhotos = { 1: null, 2: null };
        resetPhotoPreview(1);
        resetPhotoPreview(2);
        document.querySelectorAll('.prayer-btn').forEach(function (b) { b.classList.remove('active'); });
        document.getElementById('formPrayerSelected').value = '';
        window.toggleOutOfBursaMode(false);
        setTodayDateTime();
        triggerAllUIUpdates();
        switchTab(3);
      } else {
        visitsData = visitsData.filter(function (v) { return v.id !== newRecord.id; });
      }

      btn.innerHTML = origText;
      btn.disabled = false;
    };

    wrapped.__outOfBursaWrapped = true;
    window.handleVisitSubmit = wrapped;
  }

  function wrapTriggerEditVisit() {
    var originalTriggerEdit = window.triggerEditVisit;
    if (!originalTriggerEdit || originalTriggerEdit.__outOfBursaWrapped) return;

    var wrapped = function (id) {
      originalTriggerEdit.apply(this, arguments);
      var v = visitsData.find(function (x) { return x.id === id; });
      if (v && v.outOfBursa) {
        window.toggleOutOfBursaMode(true);
        document.getElementById('formOutOfBursaCity').value = v.district || '';
        document.getElementById('formOutOfBursaName').value = v.mosqueName || '';
      } else {
        window.toggleOutOfBursaMode(false);
      }
    };

    wrapped.__outOfBursaWrapped = true;
    window.triggerEditVisit = wrapped;
  }

  function wrapCancelEditVisit() {
    var originalCancel = window.cancelEditVisit;
    if (!originalCancel || originalCancel.__outOfBursaWrapped) return;

    var wrapped = function () {
      originalCancel.apply(this, arguments);
      window.toggleOutOfBursaMode(false);
    };

    wrapped.__outOfBursaWrapped = true;
    window.cancelEditVisit = wrapped;
  }

  // Kart üzerindeki timeline çizgisini (rail) ve alt boşluğunu, bölünmüş
  // liste içindeki yeni "son eleman" konumuna göre yeniden düzenler.
  function fixTimelineRail(nodeList) {
    nodeList.forEach(function (node, i) {
      var isLast = i === nodeList.length - 1;
      var rail = node.querySelector('.timeline-rail');
      if (isLast) {
        if (rail) rail.remove();
        node.classList.remove('pb-1');
      } else {
        node.classList.add('pb-1');
        if (!rail) {
          var railDiv = document.createElement('div');
          railDiv.className = 'timeline-rail';
          node.insertBefore(railDiv, node.firstElementChild);
        }
      }
    });
  }

  // updateHistoryFeedUI, #historyFeed içine visitsData sırasıyla birebir
  // eşleşen kartları basar. Bu fonksiyon, o kartları arka planda Bursa /
  // Bursa-dışı olarak ikiye ayırıp Bursa-dışı olanları #outOfBursaFeed'e
  // taşır; böylece Bursa defteri yalnızca Bursa içi kayıtları gösterir.
  function reorganizeHistoryFeed() {
    var feed = document.getElementById('historyFeed');
    var outWrap = document.getElementById('outOfBursaSectionWrap');
    var outFeed = document.getElementById('outOfBursaFeed');
    var totalBadge = document.getElementById('historyTotalCount');
    var outBadge = document.getElementById('outOfBursaTotalCount');
    if (!feed || !outFeed) return;

    if (!Array.isArray(visitsData) || visitsData.length === 0) {
      if (outWrap) outWrap.classList.add('hidden');
      if (outFeed) outFeed.innerHTML = '';
      if (outBadge) outBadge.textContent = '0 Kayıt';
      return;
    }

    var children = Array.prototype.slice.call(feed.children);
    var bursaNodes = [];
    var outNodes = [];
    children.forEach(function (node, idx) {
      var v = visitsData[idx];
      if (v && v.outOfBursa) outNodes.push(node); else bursaNodes.push(node);
    });

    feed.innerHTML = '';
    if (bursaNodes.length === 0) {
      feed.innerHTML =
        '<div class="paper-card rounded-2xl empty-state">' +
        '<div class="empty-icon"><i class="fa-solid fa-mosque"></i></div>' +
        '<p class="text-xs font-semibold" style="color:var(--ink-soft);">Bursa içinde henüz kayıt yok</p>' +
        '<p class="text-[10px] max-w-[220px]" style="color:var(--ink-faint);">Bursa\'daki bir camide kıldığınız namazı işleyerek başlayın.</p>' +
        '</div>';
    } else {
      bursaNodes.forEach(function (n) { feed.appendChild(n); });
      fixTimelineRail(bursaNodes);
    }

    outFeed.innerHTML = '';
    outNodes.forEach(function (n) { outFeed.appendChild(n); });
    fixTimelineRail(outNodes);

    if (outWrap) {
      if (outNodes.length === 0) outWrap.classList.add('hidden');
      else outWrap.classList.remove('hidden');
    }

    if (totalBadge) totalBadge.textContent = bursaNodes.length + ' Kayıt';
    if (outBadge) outBadge.textContent = outNodes.length + ' Kayıt';
  }

  function wrapUpdateHistoryFeedUI() {
    var original = window.updateHistoryFeedUI;
    if (!original || original.__outOfBursaWrapped) return;

    var wrapped = function () {
      original.apply(this, arguments);
      reorganizeHistoryFeed();
    };

    wrapped.__outOfBursaWrapped = true;
    window.updateHistoryFeedUI = wrapped;
  }

  // Defter/İstatistik sekmesi değiştirildiğinde Bursa-dışı bölümünün
  // görünürlüğünü senkron tutar (İstatistik görünümündeyken gizli kalır).
  function wrapSwitchDefterView() {
    var original = window.switchDefterView;
    if (!original || original.__outOfBursaWrapped) return;

    var wrapped = function (view) {
      original.apply(this, arguments);
      var outWrap = document.getElementById('outOfBursaSectionWrap');
      if (!outWrap) return;
      if (view === 'stats') {
        outWrap.classList.add('hidden');
      } else {
        var outFeed = document.getElementById('outOfBursaFeed');
        if (outFeed && outFeed.children.length > 0) {
          outWrap.classList.remove('hidden');
        }
      }
    };

    wrapped.__outOfBursaWrapped = true;
    window.switchDefterView = wrapped;
  }

  function init() {
    wrapHandleVisitSubmit();
    wrapTriggerEditVisit();
    wrapCancelEditVisit();
    wrapUpdateHistoryFeedUI();
    wrapSwitchDefterView();
  }

  document.addEventListener('DOMContentLoaded', init);
  // Bazı fonksiyonlar DOMContentLoaded'dan önce zaten window'a atanmış
  // olabileceğinden, script yüklenir yüklenmez de bir deneme yapalım.
  init();
})();
