// ui.js — Modallar, form akışları, sekmeler, kaydırma (swipe), lightbox, PWA kurulum ve genel arayüz yardımcıları

    // CAMİ LİSTESİ ÜSTÜNDEKİ "DOKUNARAK BİLGİ AL" İPUCU BANNER'I (bir kere gösterilir)
    function initMosqueInfoHintBanner() {
      const banner = document.getElementById('mosqueInfoHintBanner');
      if (!banner) return;
      const dismissed = localStorage.getItem('manevi-atlas-mosque-info-hint-dismissed');
      if (!dismissed) {
        banner.classList.remove('hidden');
        banner.classList.add('flex');
      }
    }
    window.dismissMosqueInfoHint = function() {
      localStorage.setItem('manevi-atlas-mosque-info-hint-dismissed', '1');
      const banner = document.getElementById('mosqueInfoHintBanner');
      if (banner) { banner.classList.add('hidden'); banner.classList.remove('flex'); }
    };
    // ANA SAYFADAKİ "YENİLİKLER" BİLDİRİM KARTI
    // Statik özellik güncellemeleri için (yeni bir uygulama özelliği yayınlandığında bu sürüm etiketini artırın)
    const WHATS_NEW_STATIC_VERSION = 'v6-oneri-offline-silinen-ayet';
    // Envanterdeki en yeni "addedAt" tarihini bulur; yeni cami eklendikçe bu otomatik değişir,
    // böylece kartın tekrar gösterilip gösterilmeyeceği koddaki bir sürüm numarasına değil,
    // gerçek veriye bağlı olur (elle güncelleme gerekmez).
    function getNewestMosqueAddedAt() {
      const withDates = PRESET_MOSQUES.filter(m => m.addedAt);
      if (withDates.length === 0) return 'none';
      return withDates.reduce((latest, m) => new Date(m.addedAt) > new Date(latest) ? m.addedAt : latest, withDates[0].addedAt);
    }
    // Son 14 gün içinde eklenen camileri (recentlyAdded ile aynı eşik) özetleyen bir madde üretip karta ekler
    function renderWhatsNewMosqueEntry() {
      const el = document.getElementById('whatsNewMosqueEntry');
      if (!el) return;

      const now = new Date();
      const recentNew = PRESET_MOSQUES
        .filter(m => m.addedAt)
        .filter(m => {
          const diffDays = Math.floor((now - new Date(m.addedAt)) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 14;
        })
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

      if (recentNew.length === 0) {
        el.innerHTML = '';
        return;
      }

      const districts = [...new Set(recentNew.map(m => m.district))];
      const districtText = districts.length > 1
        ? `${districts.slice(0, -1).join(', ')} ve ${districts[districts.length - 1]}`
        : districts[0];
      const namesPreview = recentNew.slice(0, 3).map(m => m.name).join(', ');
      const extra = recentNew.length > 3 ? ` ve ${recentNew.length - 3} diğeri` : '';

      el.innerHTML = `
        <div class="flex items-start gap-2.5">
          <span class="text-base leading-none mt-0.5">🕌</span>
          <div class="min-w-0">
            <p class="text-[11px] font-bold" style="color:var(--ink);">${recentNew.length} Yeni Cami Eklendi</p>
            <p class="text-[10px] leading-snug" style="color:var(--ink-soft);">${escapeHtml(districtText)} bölgelerinden ${escapeHtml(namesPreview)}${escapeHtml(extra)} envantere katıldı.</p>
          </div>
        </div>`;
    }
    function initWhatsNewBanner() {
      const banner = document.getElementById('whatsNewBanner');
      if (!banner) return;

      renderWhatsNewMosqueEntry();

      const currentVersion = `${WHATS_NEW_STATIC_VERSION}|${getNewestMosqueAddedAt()}`;
      window.__whatsNewCurrentVersion = currentVersion;

      const dismissedVersion = localStorage.getItem('manevi-atlas-whatsnew-dismissed');
      if (dismissedVersion !== currentVersion) {
        banner.classList.remove('hidden');
      }
    }
    window.dismissWhatsNewBanner = function() {
      localStorage.setItem('manevi-atlas-whatsnew-dismissed', window.__whatsNewCurrentVersion || WHATS_NEW_STATIC_VERSION);
      const banner = document.getElementById('whatsNewBanner');
      if (banner) banner.classList.add('hidden');
    };
    // Envanterde ayrıntılı kaydı bulunmayan mabetler için dürüst, genel bir tanıtım metni üretir
    function getMosqueInfo(m) {
      if (MOSQUE_INFO_OVERRIDES[m.id]) return MOSQUE_INFO_OVERRIDES[m.id];
      if (MOSQUE_INFO[m.id]) return MOSQUE_INFO[m.id];
      return {
        period: "Kesin yapım tarihi envanterimizde kayıtlı değil",
        founder: "Banisi hakkında doğrulanmış bir kayıt henüz eklenmedi",
        info: `${escapeHtml(m.name)}, Bursa'nın ${m.district} ilçesindeki tescilli tarihi cami ve mescidlerinden biridir. Bu mabetle ilgili yapım tarihi, banisi ve mimari geçmişine dair ayrıntılı bilgiler Vakıflar Genel Müdürlüğü ve yerel kültür envanteri kayıtlarında yer almaktadır; bu kayıtlar uygulamamıza henüz eklenmemiştir.`
      };
    }
    // YENİ EKLENEN: GÜNÜN AYETLERİ DİZİSİ
    const QURAN_VERSES = [
      { text: "\"Onlar gaybe inanırlar, namazı dosdoğru kılarlar, kendilerine rızık olarak verdiğimizden de Allah yolunda harcarlar.\"", source: "Bakara Sûresi 3" },
      { text: "\"Namazı kılın, zekâtı verin. Rükû edenlerle birlikte siz de rükû edin.\"", source: "Bakara Sûresi 43" },
      { text: "\"Sabrederek ve namaz kılarak (Allah’tan) yardım dileyin. Şüphesiz namaz, Allah’a derinden saygı duyanlardan başkasına ağır gelir.\"", source: "Bakara Sûresi 45" },
      { text: "\"Hani, biz İsrailoğulları’ndan, 'Allah’tan başkasına ibadet etmeyeceksiniz, anne babaya, yakınlara, yetimlere, yoksullara iyilik edeceksiniz, herkese güzel sözler söyleyeceksiniz, namazı kılacaksınız, zekâtı vereceksiniz' diye söz almıştık. Sonra pek azınız hariç, yüz çevirerek sözünüzden döndünüz.\"", source: "Bakara Sûresi 83" },
      { text: "\"Namazı dosdoğru kılın, zekâtı verin. Kendiniz için her ne iyilik işlemiş olursanız, Allah katında onu bulursunuz. Şüphesiz Allah bütün yaptıklarınızı görür.\"", source: "Bakara Sûresi 110" },
      { text: "\"Hani, biz Kâbe’yi insanlara toplantı ve güven yeri kılmıştık. Siz de Makam-ı İbrahim’den kendinize bir namaz yeri edinin. İbrahim ve İsmail’e şöyle emretmiştik: 'Tavaf edenler, kendini ibadete verenler, rükû ve secde edenler için evimi (Kâbe’yi) tertemiz tutun.'\"", source: "Bakara Sûresi 125" },
      { text: "\"Ey iman edenler! Sabrederek ve namaz kılarak Allah’tan yardım dileyin. Şüphe yok ki, Allah sabredenlerle beraberdir.\"", source: "Bakara Sûresi 153" },
      { text: "\"İyilik, yüzlerinizi doğu ve batı taraflarına çevirmeniz(den ibaret) değildir. Asıl iyilik, Allah’a, ahiret gününe, meleklere, kitap ve peygamberlere iman edenlerin; mala olan sevgilerine rağmen, onu yakınlara, yetimlere, yoksullara, yolda kalmışa, (ihtiyacından dolayı) isteyene ve (özgürlükleri için) kölelere verenlerin; namazı dosdoğru kılan, zekâtı veren, antlaşma yaptıklarında sözlerini yerine getirenlerin ve zorda, hastalıkta ve savaşın kızıştığı zamanlarda (direnip) sabredenlerin tutum ve davranışlarıdır. İşte bunlar, doğru olanlardır. İşte bunlar, Allah’a karşı gelmekten sakınanların ta kendileridir.\"", source: "Bakara Sûresi 177" },
      { text: "\"Namazlara ve orta namaza devam edin. Allah’a gönülden boyun eğerek namaza durun. Eğer (bir tehlikeden) korkarsanız, namazı yaya olarak veya binek üzerinde kılın. Güvenliğe kavuşunca da, Allah’ı, daha önce bilmediğiniz ve onun size öğrettiği şekilde anın (namazı normal vakitlerdeki gibi kılın).\"", source: "Bakara Sûresi 238-239" }
    ];
    // YENİ EKLENEN: RASTGELE AYET GÖSTERME FONKSİYONU
    function displayDailyVerse() {
      const randomIndex = Math.floor(Math.random() * QURAN_VERSES.length);
      const verse = QURAN_VERSES[randomIndex];
      const verseEl = document.getElementById('dailyVerseText');
      const sourceEl = document.getElementById('dailyVerseSource');
      if (verseEl && sourceEl) {
        verseEl.textContent = verse.text;
        sourceEl.textContent = "— " + verse.source;
      }
    }
    // YENİ EKLENEN: NAMAZ VAKTİ GERİ SAYIM SİSTEMİ (Bursa, Diyanet hesaplama metodu)
    const PRAYER_COUNTDOWN_LAT = 40.1826, PRAYER_COUNTDOWN_LON = 29.0665;
    const PRAYER_COUNTDOWN_MAP = [
      { key: 'Fajr', label: 'Sabah' },
      { key: 'Dhuhr', label: 'Öğle' },
      { key: 'Asr', label: 'İkindi' },
      { key: 'Maghrib', label: 'Akşam' },
      { key: 'Isha', label: 'Yatsı' }
    ];
    let prayerCountdownInterval = null;
    let prayerTimingsToday = null;
    let prayerTimingsTomorrow = null;
    let prayerTimingsDateKey = null;
    function pcDateKey(d) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    function pcFormatForApi(d) {
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
    async function fetchPrayerTimingsForDate(dateObj) {
      const url = `https://api.aladhan.com/v1/timings/${pcFormatForApi(dateObj)}?latitude=${PRAYER_COUNTDOWN_LAT}&longitude=${PRAYER_COUNTDOWN_LON}&method=13`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Namaz vakti servisi yanıt vermedi');
      const data = await res.json();
      if (!data || !data.data || !data.data.timings) throw new Error('Namaz vakti verisi hatalı');
      return data.data.timings;
    }
    async function getPrayerTimingsCached(dateObj) {
      const key = pcDateKey(dateObj);
      let cache = {};
      const raw = localStorage.getItem('manevi-atlas-prayertimes-cache');
      if (raw) { try { cache = JSON.parse(raw); } catch (e) {} }
      if (cache[key]) return cache[key];

      const timings = await fetchPrayerTimingsForDate(dateObj);
      cache[key] = timings;
      const keys = Object.keys(cache).sort();
      while (keys.length > 6) { delete cache[keys.shift()]; }
      localStorage.setItem('manevi-atlas-prayertimes-cache', JSON.stringify(cache));
      return timings;
    }
    function pcParseTimeOnDate(dateObj, hhmmRaw) {
      const hhmm = (hhmmRaw || '00:00').split(' ')[0];
      const [h, m] = hhmm.split(':').map(Number);
      const d = new Date(dateObj);
      d.setHours(h || 0, m || 0, 0, 0);
      return d;
    }
    window.initPrayerCountdown = async function() {
      document.getElementById('prayerCountdownLoading').classList.remove('hidden');
      document.getElementById('prayerCountdownError').classList.add('hidden');
      document.getElementById('prayerCountdownError').classList.remove('flex');
      document.getElementById('prayerCountdownContent').classList.add('hidden');

      const now = new Date();
      const todayKey = pcDateKey(now);

      try {
        if (prayerTimingsDateKey !== todayKey || !prayerTimingsToday || !prayerTimingsTomorrow) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const [todayT, tomorrowT] = await Promise.all([
            getPrayerTimingsCached(now),
            getPrayerTimingsCached(tomorrow)
          ]);
          prayerTimingsToday = todayT;
          prayerTimingsTomorrow = tomorrowT;
          prayerTimingsDateKey = todayKey;
        }

        document.getElementById('prayerCountdownLoading').classList.add('hidden');
        document.getElementById('prayerCountdownContent').classList.remove('hidden');

        if (prayerCountdownInterval) clearInterval(prayerCountdownInterval);
        tickPrayerCountdown();
        prayerCountdownInterval = setInterval(tickPrayerCountdown, 1000);
      } catch (e) {
        console.error('Namaz vakti alınamadı:', e);
        document.getElementById('prayerCountdownLoading').classList.add('hidden');
        document.getElementById('prayerCountdownContent').classList.add('hidden');
        const errBox = document.getElementById('prayerCountdownError');
        errBox.classList.remove('hidden');
        errBox.classList.add('flex');
      }
    };
    function tickPrayerCountdown() {
      if (!prayerTimingsToday) return;
      const now = new Date();

      // Gün değiştiyse verileri tazele
      if (pcDateKey(now) !== prayerTimingsDateKey) {
        initPrayerCountdown();
        return;
      }

      const todayBase = new Date(now); todayBase.setHours(0, 0, 0, 0);
      const tomorrowBase = new Date(todayBase); tomorrowBase.setDate(tomorrowBase.getDate() + 1);

      const todaysTimes = PRAYER_COUNTDOWN_MAP.map(p => ({
        key: p.key, label: p.label,
        time: pcParseTimeOnDate(todayBase, prayerTimingsToday[p.key])
      }));

      let next = todaysTimes.find(p => p.time.getTime() > now.getTime());
      let isTomorrow = false;
      if (!next && prayerTimingsTomorrow) {
        next = {
          key: 'Fajr', label: 'Sabah',
          time: pcParseTimeOnDate(tomorrowBase, prayerTimingsTomorrow['Fajr'])
        };
        isTomorrow = true;
      }
      if (!next) return;

      const totalSec = Math.max(0, Math.floor((next.time.getTime() - now.getTime()) / 1000));
      const hh = Math.floor(totalSec / 3600);
      const mm = Math.floor((totalSec % 3600) / 60);
      const ss = totalSec % 60;

      document.getElementById('nextPrayerName').textContent = `${next.label} Namazı${isTomorrow ? ' (Yarın)' : ''}`;
      document.getElementById('nextPrayerClock').textContent = `${String(next.time.getHours()).padStart(2, '0')}:${String(next.time.getMinutes()).padStart(2, '0')}`;
      document.getElementById('prayerCountdownH').textContent = String(hh).padStart(2, '0');
      document.getElementById('prayerCountdownM').textContent = String(mm).padStart(2, '0');
      document.getElementById('prayerCountdownS').textContent = String(ss).padStart(2, '0');

      const row = document.getElementById('prayerTimesRow');
      if (row) {
        row.innerHTML = todaysTimes.map(p => {
          const active = !isTomorrow && p.key === next.key;
          return `
            <div class="flex flex-col items-center flex-1 rounded-xl py-1.5 transition-all" style="${active ? 'background:var(--teal-900); color:#fff;' : 'background:var(--paper-deep); color:var(--ink-soft);'}">
              <span class="text-[8px] font-bold uppercase tracking-wide">${p.label}</span>
              <span class="text-[9.5px] font-bold font-ledger mt-0.5">${String(p.time.getHours()).padStart(2, '0')}:${String(p.time.getMinutes()).padStart(2, '0')}</span>
            </div>`;
        }).join('');
      }
    }
    // CAMİ DETAY / TARİHÇE BİLGİSİ MODALI
    let currentMosqueInfoId = null;
    window.openMosqueInfoModal = function(id) {
      const m = PRESET_MOSQUES.find(x => x.id === id);
      if (!m) return;
      currentMosqueInfoId = id;
      const detail = getMosqueInfo(m);
      const isOsmangazi = m.district === 'Osmangazi';

      document.getElementById('mosqueInfoDistrictBadge').textContent = `${m.district} · ${getSicilNo(m)}`;
      document.getElementById('mosqueInfoName').textContent = m.name;
      document.querySelector('#mosqueInfoAddress span').textContent = m.address;
      document.getElementById('mosqueInfoPeriod').textContent = detail.period;
      document.getElementById('mosqueInfoFounder').textContent = detail.founder;
      document.getElementById('mosqueInfoText').textContent = detail.info;

      const archWrap = document.getElementById('mosqueInfoArchitectWrap');
      if (detail.architect) {
        document.getElementById('mosqueInfoArchitect').textContent = detail.architect;
        archWrap.classList.remove('hidden');
      } else {
        archWrap.classList.add('hidden');
      }

      const isCustom = !!MOSQUE_INFO_OVERRIDES[id];
      const notice = document.getElementById('mosqueInfoCustomNotice');
      const resetBtn = document.getElementById('mosqueInfoResetBtn');
      notice.classList.toggle('hidden', !isCustom);
      notice.classList.toggle('flex', isCustom);
      resetBtn.classList.toggle('hidden', !isCustom);

      const heroPanel = document.querySelector('#mosqueInfoModal .hero-panel');
      if (heroPanel) {
        heroPanel.style.background = isOsmangazi
          ? 'radial-gradient(120% 140% at 100% 0%, rgba(195,154,69,0.18) 0%, rgba(195,154,69,0) 45%), linear-gradient(160deg, var(--teal-950) 0%, var(--teal-900) 55%, var(--teal-700) 130%)'
          : 'radial-gradient(120% 140% at 100% 0%, rgba(227,161,126,0.22) 0%, rgba(227,161,126,0) 45%), linear-gradient(160deg, var(--brick-deep) 0%, var(--brick) 65%, var(--brick-soft) 140%)';
      }

      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.mapsSearch || (m.name + ' ' + m.address))}`;
      document.getElementById('mosqueInfoMapLink').href = mapUrl;

      document.getElementById('mosqueInfoModal').classList.remove('hidden');
    };
    window.closeMosqueInfoModal = function() {
      document.getElementById('mosqueInfoModal').classList.add('hidden');
    };
    document.getElementById('mosqueInfoModal').addEventListener('click', function(e) { if (e.target === this) closeMosqueInfoModal(); });
    // CAMİ BİLGİ KARTINI DÜZENLEME
    window.openMosqueInfoEditModal = function(id) {
      const m = PRESET_MOSQUES.find(x => x.id === id);
      if (!m) return;
      const detail = getMosqueInfo(m);
      document.getElementById('mosqueInfoEditMosqueName').textContent = m.name;
      document.getElementById('editInfoPeriod').value = detail.period || '';
      document.getElementById('editInfoFounder').value = detail.founder || '';
      document.getElementById('editInfoArchitect').value = detail.architect || '';
      document.getElementById('editInfoText').value = detail.info || '';
      document.getElementById('mosqueInfoModal').classList.add('hidden');
      document.getElementById('mosqueInfoEditModal').classList.remove('hidden');
    };
    window.closeMosqueInfoEditModal = function() {
      document.getElementById('mosqueInfoEditModal').classList.add('hidden');
      if (currentMosqueInfoId) openMosqueInfoModal(currentMosqueInfoId);
    };
    document.getElementById('mosqueInfoEditModal').addEventListener('click', function(e) { if (e.target === this) closeMosqueInfoEditModal(); });
    window.saveMosqueInfoEdit = function() {
      if (!currentMosqueInfoId) return;
      const period = document.getElementById('editInfoPeriod').value.trim();
      const founder = document.getElementById('editInfoFounder').value.trim();
      const architect = document.getElementById('editInfoArchitect').value.trim();
      const info = document.getElementById('editInfoText').value.trim();

      if (!period || !founder || !info) {
        showToast("Lütfen yapılış tarihi, banisi ve kısa bilgi alanlarını doldurun.", "error");
        return;
      }

      MOSQUE_INFO_OVERRIDES[currentMosqueInfoId] = { period, founder, info };
      if (architect) MOSQUE_INFO_OVERRIDES[currentMosqueInfoId].architect = architect;
      saveMosqueInfoOverrides();

      document.getElementById('mosqueInfoEditModal').classList.add('hidden');
      openMosqueInfoModal(currentMosqueInfoId);
      showToast("Cami bilgisi güncellendi.", "success");
    };
    // CAMİ BİLGİ KARTINI SIFIRLAMA (KULLANICI DÜZENLEMESİNİ SİLME)
    let pendingInfoResetId = null;
    window.triggerResetMosqueInfo = function(id) {
      if (!id) return;
      pendingInfoResetId = id;
      pendingAction = 'resetMosqueInfo';
      openConfirmModal("Bilgi Kartı Sıfırlansın mı?", "Bu camiye ait düzenlediğiniz bilgiler silinerek varsayılan içeriğe dönülecektir.", "Sıfırla");
    };
    function executeResetMosqueInfo(id) {
      delete MOSQUE_INFO_OVERRIDES[id];
      saveMosqueInfoOverrides();
      if (currentMosqueInfoId === id) openMosqueInfoModal(id);
      showToast("Bilgi kartı varsayılan haline döndürüldü.", "success");
    }
    window.openMosqueEditModal = function(id) {
      const m = PRESET_MOSQUES.find(x => x.id === id);
      if (!m) return;
      editingMosqueId = id;
      document.getElementById('editMosqueName').value = m.name;
      document.getElementById('editMosqueAddress').value = m.address || '';
      const distSelect = document.getElementById('editMosqueDistrict');
      if (distSelect) {
        const opt = Array.from(distSelect.options).find(o => o.value === m.district);
        if (opt) distSelect.value = m.district;
        else distSelect.value = 'Osmangazi';
      }
      const notice = document.getElementById('editMosquePresetNotice');
      notice.classList.toggle('hidden', !!m.isCustom);
      notice.classList.toggle('flex', !m.isCustom);
      document.getElementById('mosqueEditModal').classList.remove('hidden');
    };
    window.closeMosqueEditModal = function() {
      document.getElementById('mosqueEditModal').classList.add('hidden');
      editingMosqueId = null;
    };
    window.saveMosqueEdit = function() {
      if (!editingMosqueId) return;
      const m = PRESET_MOSQUES.find(x => x.id === editingMosqueId);
      if (!m) return;

      const newName = document.getElementById('editMosqueName').value.trim();
      const newAddress = document.getElementById('editMosqueAddress').value.trim();
      const distSelect = document.getElementById('editMosqueDistrict');
      const newDistrict = distSelect ? distSelect.value : m.district;

      if (!newName) { showToast("Cami ismi boş bırakılamaz.", "error"); return; }

      const duplicate = PRESET_MOSQUES.some(x => x.id !== m.id && x.name.trim().toLowerCase() === newName.toLowerCase());
      if (duplicate) { showToast("Bu isimde bir mabet zaten listenizde var.", "error"); return; }

      m.name = newName;
      m.address = newAddress || m.address;
      m.district = newDistrict;
      m.mapsSearch = `${newName} ${newDistrict} Bursa`;

      if (m.isCustom) {
        persistCustomMosqueList();
      } else {
        saveMosqueOverride(m.id, { name: m.name, address: m.address, district: m.district, mapsSearch: m.mapsSearch });
      }

      // Bu camiye ait mevcut defter kayıtlarındaki isim/ilçe bilgisini de güncelle
      visitsData.forEach(v => {
        if (v.mosqueId === m.id) { v.mosqueName = m.name; v.district = m.district; }
      });

      populateMosquesDropdown();
      triggerAllUIUpdates();
      closeMosqueEditModal();
      showToast("Cami bilgileri güncellendi.", "success");
    };
    window.triggerDeleteMosque = function(id) {
      const m = PRESET_MOSQUES.find(x => x.id === id);
      if (!m) return;
      pendingMosqueDeleteId = id;
      pendingAction = 'deleteMosque';
      const visitCount = visitsData.filter(v => v.mosqueId === id).length;
      const msg = visitCount > 0
        ? `"${m.name}" cami listenizden kaldırılacak. Bu mabette ${visitCount} adet namaz kaydınız var, defterinizdeki kayıtlar silinmeyecek. Devam edilsin mi?`
        : `"${m.name}" cami listenizden kaldırılacak. Ayarlar > Silinen Camiler bölümünden istediğiniz zaman geri getirebilirsiniz.`;
      openConfirmModal("Cami Listeden Kaldırılsın mı?", msg, "Kaldır");
    };
    function executeDeleteMosque(id) {
      const idx = PRESET_MOSQUES.findIndex(m => m.id === id);
      if (idx === -1) return;
      const removed = PRESET_MOSQUES[idx];
      PRESET_MOSQUES.splice(idx, 1);

      // Özel (kullanıcının eklediği) bir camiyse, kendi deposundan da çıkar;
      // ancak her iki türü de (hazır + özel) aynı "Silinen Camiler" listesine
      // ekleyerek geri getirilebilir hale getir.
      if (removed.isCustom) {
        persistCustomMosqueList();
      }
      const deletedList = getDeletedPresetMosques();
      if (!deletedList.some(d => d.id === id)) deletedList.push(removed);
      localStorage.setItem('manevi-atlas-deleted-presets', JSON.stringify(deletedList));

      populateMosquesDropdown();
      triggerAllUIUpdates();
      updateDeletedMosquesCount();
      showToast(`"${removed.name}" listeden kaldırıldı.`, "success");
      pendingMosqueDeleteId = null;
    }
    window.openDeletedMosquesModal = function() {
      renderDeletedMosquesList();
      document.getElementById('deletedMosquesModal').classList.remove('hidden');
    };
    window.closeDeletedMosquesModal = function() {
      document.getElementById('deletedMosquesModal').classList.add('hidden');
    };
    function renderDeletedMosquesList() {
      const list = getDeletedPresetMosques();
      const container = document.getElementById('deletedMosquesList');
      if (list.length === 0) {
        container.innerHTML = `<p class="text-xs text-center py-6" style="color:var(--ink-faint);">Silinmiş cami bulunmuyor.</p>`;
        return;
      }
      container.innerHTML = list.map(m => `
        <div class="flex items-center justify-between rounded-xl p-2.5" style="background:var(--paper-deep); border:1px solid var(--line);">
          <div class="space-y-0.5 pr-2 min-w-0">
            <p class="font-bold text-xs truncate" style="color:var(--ink);">${escapeHtml(m.name)}</p>
            <p class="text-[10px]" style="color:var(--ink-faint);">${escapeHtml(m.district)}</p>
          </div>
          <button onclick="restoreDeletedMosque('${m.id}')" class="text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-white flex-shrink-0" style="background:var(--teal-900);">Geri Getir</button>
        </div>
      `).join('');
    }
    window.restoreDeletedMosque = function(id) {
      let list = getDeletedPresetMosques();
      const restored = list.find(m => m.id === id);
      list = list.filter(m => m.id !== id);
      localStorage.setItem('manevi-atlas-deleted-presets', JSON.stringify(list));
      if (restored && !PRESET_MOSQUES.some(m => m.id === id)) {
        PRESET_MOSQUES.push(restored);
        if (restored.isCustom) persistCustomMosqueList();
      }
      populateMosquesDropdown();
      triggerAllUIUpdates();
      updateDeletedMosquesCount();
      renderDeletedMosquesList();
      showToast(`"${restored ? restored.name : 'Cami'}" listeye geri eklendi.`, "success");
    };
    window.escapeHtml = function(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };
    const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23F2ECDD"/><text x="50%" y="50%" font-family="sans-serif" font-size="12" fill="%235B5445" text-anchor="middle" dy=".3em">Önizleme yok</text></svg>'
    );
    window.__imgFallback = function(el) { el.onerror = null; el.src = FALLBACK_IMG; };
    window.compressImage = function(file) {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('TIMEOUT')), 20000);
        const finishReject = (err) => { clearTimeout(timeoutId); reject(err); };
        const finishResolve = (val) => { clearTimeout(timeoutId); resolve(val); };

        const runCompression = (blobLike) => {
          const reader = new FileReader();
          reader.onerror = () => finishReject(new Error('READ_ERROR'));
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const maxDimension = 2400;
                let width = img.width, height = img.height;
                if (width > height) { if (width > maxDimension) { height = Math.round((height * maxDimension) / width); width = maxDimension; } }
                else { if (height > maxDimension) { width = Math.round((width * maxDimension) / height); height = maxDimension; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                finishResolve(canvas.toDataURL('image/jpeg', 0.92));
              } catch (err) { finishReject(err); }
            };
            img.onerror = () => finishReject(new Error('DECODE_ERROR'));
            img.src = event.target.result;
          };
          reader.readAsDataURL(blobLike);
        };

        const lowerName = (file.name || '').toLowerCase();
        const looksHeic = ['image/heic', 'image/heif'].includes((file.type || '').toLowerCase())
          || lowerName.endsWith('.heic') || lowerName.endsWith('.heif');

        if (looksHeic) {
          if (typeof heic2any === 'undefined') { finishReject(new Error('HEIC_LIB_MISSING')); return; }
          heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
            .then((converted) => runCompression(Array.isArray(converted) ? converted[0] : converted))
            .catch(() => finishReject(new Error('HEIC_CONVERT_ERROR')));
        } else {
          runCompression(file);
        }
      });
    };
    // === PROFIL FOTOGRAFI VE ISIM YONETIMI ===
    function loadProfileData() {
      const savedName = localStorage.getItem('manevi-atlas-username') || 'Ümit Özgüler';
      const savedPhoto = localStorage.getItem('manevi-atlas-userphoto');

      document.getElementById('profileNameInput').value = savedName;
      updateNameDisplays(savedName);

      if (savedPhoto) {
        setProfileImages(savedPhoto);
      } else {
        updateInitials(savedName);
      }

      updateOwnProfileHint();
    }
    // Kullanıcı henüz kendi adını/fotoğrafını eklememişse (varsayılan "Ümit Özgüler" profili duruyorsa)
    // ve banner'ı daha önce kapatmadıysa, kendi profilini oluşturması için uyarı göster.
    function updateOwnProfileHint() {
      const banner = document.getElementById('ownProfileHintBanner');
      if (!banner) return;
      const hasOwnName = !!localStorage.getItem('manevi-atlas-username');
      const hasOwnPhoto = !!localStorage.getItem('manevi-atlas-userphoto');
      const dismissed = localStorage.getItem('manevi-atlas-own-profile-hint-dismissed');

      if (!hasOwnName && !hasOwnPhoto && !dismissed) {
        banner.classList.remove('hidden');
        banner.classList.add('flex');
      } else {
        banner.classList.add('hidden');
        banner.classList.remove('flex');
      }
    }
    window.dismissOwnProfileHint = function() {
      localStorage.setItem('manevi-atlas-own-profile-hint-dismissed', '1');
      updateOwnProfileHint();
    };
    window.saveProfileName = function(name) {
      const val = name.trim() || 'Seyyah';
      localStorage.setItem('manevi-atlas-username', val);
      updateNameDisplays(val);
      if (!localStorage.getItem('manevi-atlas-userphoto')) {
        updateInitials(val);
      }
      updateOwnProfileHint();
      showToast("Profil ismi kaydedildi.", "success");
    }
    function updateNameDisplays(name) {
      if(document.getElementById('headerNameDisplay')) document.getElementById('headerNameDisplay').textContent = name;
      if(document.getElementById('heroNameDisplay')) document.getElementById('heroNameDisplay').textContent = name;
      if(document.getElementById('profileStatsName')) document.getElementById('profileStatsName').textContent = name;
    }
    function updateInitials(name) {
      let initials = "S";
      if(name && name.trim() !== "") {
         const parts = name.trim().split(' ');
         if(parts.length > 1) initials = parts[0][0] + parts[parts.length-1][0];
         else initials = parts[0].substring(0,2);
      }
      initials = initials.toUpperCase();
      if(document.getElementById('headerInitials')) document.getElementById('headerInitials').textContent = initials;
      if(document.getElementById('profileInitials')) document.getElementById('profileInitials').textContent = initials;
    }
    window.handleProfilePhotoUpload = async function(input) {
      if (input.files && input.files[0]) {
        try {
          showToast("Fotoğraf işleniyor...", "success");
          const base64Data = await window.compressImage(input.files[0]);
          localStorage.setItem('manevi-atlas-userphoto', base64Data);
          setProfileImages(base64Data);
          updateOwnProfileHint();
          showToast("Profil fotoğrafı güncellendi!", "success");
        } catch (err) {
          showToast("Fotoğraf yüklenemedi. Lütfen tekrar deneyin.", "error");
        }
      }
    }
    function setProfileImages(src) {
      const headerImg = document.getElementById('headerProfileImg');
      const profileImg = document.getElementById('profilePhotoImg');
      const headerInitials = document.getElementById('headerInitials');
      const profileInitials = document.getElementById('profileInitials');

      if(headerImg) { headerImg.src = src; headerImg.classList.remove('hidden'); }
      if(profileImg) { profileImg.src = src; profileImg.classList.remove('hidden'); }
      if(headerInitials) headerInitials.classList.add('hidden');
      if(profileInitials) profileInitials.classList.add('hidden');
    }
    async function initApp() {
      const __splashStart = Date.now();
      const __MIN_SPLASH_MS = 1400;
      loadTheme();
      loadHapticsUI();
      loadCustomAddedMosques();
      loadMosqueInfoOverrides();
      loadFavorites();
      loadRatings();
      loadGeocodeCache();
      // Sayfa yenilendiğinde tarayıcının eski arama kutusu değerini geri getirmesini
      // (form restore) önlemek için arama kutusunu ve filtreyi başlangıç durumuna sıfırla
      const __searchInputOnInit = document.getElementById('mosqueSearchInput');
      if (__searchInputOnInit) __searchInputOnInit.value = '';
      activeFilterDistrict = 'HEPSİ';
      initWhatsNewBanner();
      initMosqueInfoHintBanner();
      await loadVisits();
      loadProfileData(); 
      displayDailyVerse(); // <--- YENİ EKLENEN: AÇILIŞTA AYET GÖSTER
      initPrayerCountdown(); // <--- YENİ EKLENEN: NAMAZ VAKTİ GERİ SAYIMINI BAŞLAT

      document.getElementById('appModeBadge').innerHTML = useIndexedDB
        ? '<span style="color:var(--teal-700);">Cihazınızda Güvende</span>'
        : '<span style="color:var(--teal-700);">Yerel Yedek Modu</span>';
      document.getElementById('syncStatus').innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full" style="background:var(--gold);"></span>
        <span>Kayıtlar Hazır</span>
      `;
      triggerAllUIUpdates();

      const __elapsed = Date.now() - __splashStart;
      const __remaining = Math.max(0, __MIN_SPLASH_MS - __elapsed);
      setTimeout(() => {
        const loader = document.getElementById('authLoader');
        loader.style.opacity = '0';
        setTimeout(() => loader.classList.add('hidden'), 450);
      }, __remaining);
    }
    function triggerAllUIUpdates() {
      updateDashboardUI();
      updateMosquesListUI();
      updateHistoryFeedUI();
      updateDeletedMosquesCount();
      updateRecentlyAddedMosquesUI();
      updateFavoriteMosquesUI();
      updateStatsUI();
    }
    // DEFTER / İSTATİSTİK GÖRÜNÜM ANAHTARI
    window.switchDefterView = function(view) {
      const feed = document.getElementById('historyFeed');
      const stats = document.getElementById('statsPanel');
      const defterBtn = document.getElementById('defterViewBtn');
      const statsBtn = document.getElementById('statsViewBtn');
      if (view === 'stats') {
        feed.classList.add('hidden');
        stats.classList.remove('hidden');
        statsBtn.classList.add('active');
        statsBtn.style.color = '';
        defterBtn.classList.remove('active');
        defterBtn.style.color = 'var(--ink-soft)';
        updateStatsUI();
      } else {
        feed.classList.remove('hidden');
        stats.classList.add('hidden');
        defterBtn.classList.add('active');
        defterBtn.style.color = '';
        statsBtn.classList.remove('active');
        statsBtn.style.color = 'var(--ink-soft)';
      }
    };
    // 6. GÜNLÜK / GEÇMİŞ AKIŞI
    function updateHistoryFeedUI() {
      const container = document.getElementById('historyFeed');
      document.getElementById('historyTotalCount').textContent = `${visitsData.length} Kayıt`;

      if (visitsData.length === 0) {
        container.innerHTML = `
          <div class="paper-card rounded-2xl empty-state">
            <div class="empty-icon"><i class="fa-solid fa-feather-pointed"></i></div>
            <p class="text-xs font-semibold" style="color:var(--ink-soft);">Manevi günlüğünüz henüz boş</p>
            <p class="text-[10px] max-w-[220px]" style="color:var(--ink-faint);">İlk namaz kaydınızı işleyerek seyahatinizi başlatın.</p>
            <button onclick="switchTab(2)" class="btn-primary text-[10px] font-bold px-4 py-2 rounded-xl mt-1">İlk Kaydı Ekle</button>
          </div>`;
        return;
      }

      container.innerHTML = visitsData.map((v, idx) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
        const formattedDate = v.date ? new Date(v.date).toLocaleDateString('tr-TR', options) : 'Tarih Yok';

        let photosHTML = '';
        if (v.photos && v.photos.length > 0) {
          window.photoGalleries[v.id] = v.photos;
          photosHTML = `
            <div class="grid grid-cols-2 gap-2 mt-2">
              ${v.photos.map((p, pIdx) => `
                <div class="relative rounded-xl overflow-hidden h-24 cursor-pointer active:opacity-80 transition-opacity" style="background:var(--paper-deep); border:1px solid var(--line);" onclick="openLightboxFromRecord('${v.id}', ${pIdx})">
                  <img src="${p}" class="w-full h-full object-cover" alt="Ziyaret fotoğrafı" onerror="window.__imgFallback(this)">
                  <div class="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style="background:rgba(0,0,0,0.5);">
                    <i class="fa-solid fa-expand text-white text-[9px]"></i>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }

        let mapBtnHTML = '';
        if (v.address) {
          const isUrl = v.address.startsWith('http') || v.address.includes('google.com/maps');
          const targetUrl = isUrl ? v.address : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.mosqueName + ' ' + v.address)}`;
          mapBtnHTML = `
            <a href="${targetUrl}" target="_blank" rel="noopener" class="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-1 rounded-lg mt-2 transition-colors" style="background:rgba(21,90,76,0.08); color:var(--teal-900);">
              <i class="fa-solid fa-compass"></i><span class="truncate max-w-[150px]">${isUrl ? 'Konumu Görüntüle' : escapeHtml(v.address)}</span>
            </a>
          `;
        }

        const isLast = idx === visitsData.length - 1;
        return `
          <div class="relative pl-9 ${isLast ? '' : 'pb-1'} fade-in-up">
            ${!isLast ? `<div class="timeline-rail"></div>` : ''}
            <div class="absolute left-[15px] top-6 timeline-dot"></div>
            <div class="paper-card rounded-2xl p-4 relative">
              <div class="absolute top-4 right-4 flex items-center gap-2.5">
                <button onclick="triggerEditVisit('${v.id}')" class="p-1" style="color:var(--ink-faint);" title="Kaydı düzenle">
                  <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button onclick="triggerDelete('${v.id}')" class="p-1" style="color:var(--ink-faint);" title="Kaydı sil">
                  <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
              <div class="space-y-1 pr-12">
                <div class="flex items-center space-x-1.5">
                  <span class="text-[9px] font-bold text-white px-2 py-0.5 rounded font-ledger" style="background:var(--teal-900);">${escapeHtml(v.prayerTime)} Namazı</span>
                  <span class="text-[9px] font-bold uppercase tracking-wider" style="color:var(--ink-faint);">${escapeHtml(v.district)}</span>
                </div>
                <h3 class="font-bold text-xs mt-1" style="color:var(--ink);">${escapeHtml(v.mosqueName)}</h3>
                <p class="text-[10px]" style="color:var(--ink-faint);">${formattedDate} - Saat: ${escapeHtml(v.time) || '--:--'}</p>
              </div>
              ${v.notes ? `<p class="text-[11px] p-2.5 rounded-lg italic mt-2" style="color:var(--ink-soft); background:var(--paper-deep); border-left:2px solid var(--teal-700);">"${escapeHtml(v.notes)}"</p>` : ''}
              ${mapBtnHTML}
              ${photosHTML}
            </div>
          </div>
        `;
      }).join('');
    }
    // 7. ONAY MODALI (Silme / Sıfırlama ortak kullanım)
    let pendingDeleteId = null;
    let pendingAction = null;
 // 'delete' | 'resetAll'

    function openConfirmModal(title, message, actionLabel) {
      window.haptic([12, 40, 12]);
      document.getElementById('confirmTitle').textContent = title;
      document.getElementById('confirmMessage').textContent = message;
      const okBtn = document.getElementById('confirmOkBtn');
      if (actionLabel) okBtn.textContent = actionLabel;
      const modal = document.getElementById('customConfirmModal');
      modal.classList.remove('hidden');
      modal.style.opacity = '0';
      requestAnimationFrame(() => {
        modal.style.transition = 'opacity .28s ease';
        modal.style.opacity = '1';
        modal.firstElementChild.classList.remove('scale-95');
        modal.firstElementChild.classList.add('scale-100');
      });
    }
    window.triggerDelete = function(docId) {
      pendingDeleteId = docId;
      pendingAction = 'delete';
      openConfirmModal("Kaydı Siliyoruz", "Bu namaz ibadeti kaydı günlüğünüzden silinecektir. Emin misiniz?", "Sil");
    };
    window.triggerResetAll = function() {
      pendingAction = 'resetAll';
      openConfirmModal("Tüm Veriler Silinsin mi?", "Defterinizdeki tüm namaz kayıtları kalıcı olarak silinecek. Bu işlem geri alınamaz.", "Hepsini Sil");
    };
    document.getElementById('confirmCancelBtn').addEventListener('click', () => closeConfirmModal());
    document.getElementById('confirmOkBtn').addEventListener('click', async () => {
      window.haptic([16, 45, 16]);
      if (pendingAction === 'delete' && pendingDeleteId) {
        await executeDeleteLog(pendingDeleteId);
      } else if (pendingAction === 'resetAll') {
        await executeResetAll();
      } else if (pendingAction === 'deleteMosque' && pendingMosqueDeleteId) {
        executeDeleteMosque(pendingMosqueDeleteId);
      } else if (pendingAction === 'resetMosqueInfo' && pendingInfoResetId) {
        executeResetMosqueInfo(pendingInfoResetId);
      }
      closeConfirmModal();
    });
    function closeConfirmModal() {
      const modal = document.getElementById('customConfirmModal');
      modal.firstElementChild.classList.remove('scale-100');
      modal.firstElementChild.classList.add('scale-95');
      modal.style.opacity = '0';
      document.getElementById('confirmOkBtn').textContent = "Sil";
      setTimeout(() => { modal.classList.add('hidden'); modal.style.opacity = ''; pendingDeleteId = null; pendingMosqueDeleteId = null; pendingInfoResetId = null; pendingAction = null; }, 280);
    }
    async function executeResetAll() {
      const backup = visitsData;
      visitsData = [];
      try {
        if (useIndexedDB) {
          const db = await openDB();
          await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
          });
        } else {
          localStorage.removeItem(LS_FALLBACK_KEY);
        }
        triggerAllUIUpdates();
        showToast("Tüm kayıtlar silindi.", "success");
      } catch (e) {
        visitsData = backup;
        showToast("Veriler sıfırlanırken bir sorun oluştu.", "error");
      }
    }
    // 8. YENİ İBADET KAYDETME VE CAMI ONDERLIGINI LISTEYE KATMA
    window.handleVisitSubmit = async function(event) {
      event.preventDefault();

      const selectElem = document.getElementById('formMosqueSelect');
      const selectedOptionId = selectElem.value;
      const prayerTime = document.getElementById('formPrayerSelected').value;
      const address = document.getElementById('formAddress').value.trim();
      const date = document.getElementById('formDate').value;
      const time = document.getElementById('formTime').value;
      const notes = document.getElementById('formNotes').value.trim();

      if (!selectedOptionId) { showToast("Lütfen ibadet edilen mabedi seçin.", "error"); return; }
      if (!prayerTime) { showToast("Lütfen kılınan namaz vaktini belirtin.", "error"); return; }

      let mosqueName = "", mosqueId = selectedOptionId, district = "Osmangazi";
      
      if (selectedOptionId === "custom") {
        const customName = document.getElementById('formCustomName').value.trim();
        if (!customName) { showToast("Mabet ismi boş bırakılamaz.", "error"); return; }

        const existingMatch = PRESET_MOSQUES.find(m => m.name.trim().toLowerCase() === customName.toLowerCase());
        if (existingMatch && !(editingVisitId && existingMatch.id === visitsData.find(v => v.id === editingVisitId)?.mosqueId)) {
          mosqueName = existingMatch.name;
          mosqueId = existingMatch.id;
          district = existingMatch.district;
        } else {
          mosqueName = customName;
          const tempId = "custom-" + Date.now();
          mosqueId = tempId;
          district = document.getElementById('formCustomDistrict').value;

          const newCustomMosque = {
            id: tempId,
            name: customName,
            district: district,
            address: address || `${district}, Bursa`,
            mapsSearch: customName + " " + district + " Bursa",
            isCustom: true,
            addedAt: new Date().toISOString().slice(0, 10)
          };

          PRESET_MOSQUES.push(newCustomMosque);
          persistCustomMosqueList();
          populateMosquesDropdown();
        }
      } else {
        const matched = PRESET_MOSQUES.find(m => m.id === selectedOptionId);
        if (matched) { mosqueName = matched.name; district = matched.district; }
      }

      const photosArray = [];
      if (window.uploadedPhotos[1]) photosArray.push(window.uploadedPhotos[1]);
      if (window.uploadedPhotos[2]) photosArray.push(window.uploadedPhotos[2]);

      const btn = document.getElementById('btnSubmitForm');
      const origText = btn.innerHTML;
      const isEditing = !!editingVisitId;
      btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>${isEditing ? 'Güncelleniyor...' : 'Defter Yazılıyor...'}</span>`;
      btn.disabled = true;

      if (isEditing) {
        const idx = visitsData.findIndex(v => v.id === editingVisitId);
        if (idx === -1) {
          showToast("Düzenlenecek kayıt bulunamadı.", "error");
          btn.innerHTML = origText; btn.disabled = false;
          return;
        }
        const backup = { ...visitsData[idx] };
        const updatedRecord = {
          ...visitsData[idx], mosqueId, mosqueName, district, prayerTime,
          address: address || visitsData[idx].address || '',
          date, time, notes, photos: photosArray
        };
        visitsData[idx] = updatedRecord;
        sortVisitsInMemory();
        const ok = await persistNewVisit(updatedRecord);

        if (ok) {
          window.haptic(20);
          showToast("Kaydınız güncellendi.", "success");
          cancelEditVisit();
          triggerAllUIUpdates();
          switchTab(3);
        } else {
          const revertIdx = visitsData.findIndex(v => v.id === updatedRecord.id);
          if (revertIdx !== -1) visitsData[revertIdx] = backup;
        }
        btn.innerHTML = origText;
        btn.disabled = false;
        return;
      }

      const newRecord = {
        id: "v-" + Date.now(), mosqueId, mosqueName, district, prayerTime,
        address: address || (PRESET_MOSQUES.find(m => m.id === mosqueId)?.address || ''),
        date, time, notes, photos: photosArray, createdAt: new Date().toISOString()
      };

      visitsData.push(newRecord);
      sortVisitsInMemory();
      const ok = await persistNewVisit(newRecord);

      if (ok) {
        window.haptic([16, 55, 20]);
        showToast("İbadet kaydınız deftere işlendi. Allah kabul etsin!", "success");
        document.getElementById('visitForm').reset();
        window.uploadedPhotos = { 1: null, 2: null };
        resetPhotoPreview(1);
        resetPhotoPreview(2);
        document.querySelectorAll('.prayer-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('formPrayerSelected').value = "";
        toggleCustomMosqueInput();
        setTodayDateTime();
        triggerAllUIUpdates();
        switchTab(3);
      } else {
        visitsData = visitsData.filter(v => v.id !== newRecord.id);
      }

      btn.innerHTML = origText;
      btn.disabled = false;
    };
    // === MEVCUT DEFTER KAYDINI DÜZENLEME ===
    window.triggerEditVisit = function(id) {
      const v = visitsData.find(x => x.id === id);
      if (!v) return;
      editingVisitId = id;

      const select = document.getElementById('formMosqueSelect');
      const hasOption = Array.from(select.options).some(o => o.value === v.mosqueId);
      if (hasOption) {
        select.value = v.mosqueId;
        document.getElementById('customMosqueSection').classList.add('hidden');
        document.getElementById('formCustomName').required = false;
      } else {
        select.value = 'custom';
        document.getElementById('customMosqueSection').classList.remove('hidden');
        document.getElementById('formCustomName').value = v.mosqueName;
        document.getElementById('formCustomName').required = true;
        const distSel = document.getElementById('formCustomDistrict');
        if (distSel) {
          const opt = Array.from(distSel.options).find(o => o.value === v.district);
          if (opt) distSel.value = v.district;
        }
      }

      selectPrayer(v.prayerTime);
      document.getElementById('formAddress').value = v.address || '';
      document.getElementById('formDate').value = v.date || '';
      document.getElementById('formTime').value = v.time || '';
      document.getElementById('formNotes').value = v.notes || '';

      window.uploadedPhotos = {
        1: (v.photos && v.photos[0]) || null,
        2: (v.photos && v.photos[1]) || null
      };
      for (let i = 1; i <= 2; i++) {
        if (window.uploadedPhotos[i]) {
          const preview = document.getElementById(`photoPreview${i}`);
          preview.src = window.uploadedPhotos[i];
          preview.classList.remove('hidden');
          document.getElementById(`photoPlaceholder${i}`).classList.add('hidden');
          document.getElementById(`btnRemovePhoto${i}`).classList.remove('hidden');
        } else {
          resetPhotoPreview(i);
        }
      }

      document.getElementById('btnSubmitForm').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> <span>Kaydı Güncelle</span>`;
      document.getElementById('editModeNotice').classList.remove('hidden');

      switchTab(2);
    };
    window.cancelEditVisit = function() {
      editingVisitId = null;
      document.getElementById('visitForm').reset();
      window.uploadedPhotos = { 1: null, 2: null };
      resetPhotoPreview(1);
      resetPhotoPreview(2);
      document.querySelectorAll('.prayer-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('formPrayerSelected').value = '';
      toggleCustomMosqueInput();
      setTodayDateTime();
      document.getElementById('btnSubmitForm').innerHTML = `<i class="fa-solid fa-heart-circle-check"></i> <span>Vakti Deftere İşle</span>`;
      document.getElementById('editModeNotice').classList.add('hidden');
    };
    // 9. FOTOĞRAF ÖN İZLEME VE İŞLEME
    window.processAndPreviewImage = async function(input, index) {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const placeholder = document.getElementById(`photoPlaceholder${index}`);
        const origContent = placeholder.innerHTML;
        placeholder.innerHTML = `<i class="fa-solid fa-spinner animate-spin" style="color:var(--teal-700);"></i><p class="text-[8px] mt-0.5" style="color:var(--ink-soft);">İşleniyor...</p>`;

        try {
          const base64Data = await window.compressImage(file);
          window.uploadedPhotos[index] = base64Data;
          const preview = document.getElementById(`photoPreview${index}`);
          preview.src = base64Data;
          preview.classList.remove('hidden');
          placeholder.classList.add('hidden');
          document.getElementById(`btnRemovePhoto${index}`).classList.remove('hidden');
        } catch (err) {
          const messages = {
            HEIC_LIB_MISSING: "HEIC dönüştürücü yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.",
            HEIC_CONVERT_ERROR: "Bu HEIC fotoğraf dönüştürülemedi. Galeriden JPG/PNG olarak paylaşmayı deneyin.",
            READ_ERROR: "Dosya okunamadı. Lütfen tekrar deneyin.",
            DECODE_ERROR: "Bu görsel açılamadı. Farklı bir fotoğraf deneyin.",
            TIMEOUT: "Fotoğraf işlenemedi (zaman aşımı). Daha küçük bir fotoğraf deneyin."
          };
          showToast(messages[err?.message] || "Görsel işlenemedi. Lütfen başka bir fotoğraf deneyin.", "error");
          placeholder.innerHTML = origContent;
          input.value = '';
        }
      }
    };
    window.removePhoto = function(index) {
      window.uploadedPhotos[index] = null;
      resetPhotoPreview(index);
    };
    function resetPhotoPreview(index) {
      const input = document.getElementById(`photoInput${index}`);
      if (input) input.value = '';
      const preview = document.getElementById(`photoPreview${index}`);
      if (preview) { preview.removeAttribute('src'); preview.classList.add('hidden'); }
      const placeholder = document.getElementById(`photoPlaceholder${index}`);
      if (placeholder) placeholder.classList.remove('hidden');
      const removeBtn = document.getElementById(`btnRemovePhoto${index}`);
      if (removeBtn) removeBtn.classList.add('hidden');
    }
    // 10. NAMAZ SEÇİMİ
    window.selectPrayer = function(prayer) {
      window.haptic(15);
      document.querySelectorAll('.prayer-btn').forEach(btn => btn.classList.remove('active'));
      const selectedBtn = document.getElementById(`btn-p-${prayer}`);
      if (selectedBtn) selectedBtn.classList.add('active');
      document.getElementById('formPrayerSelected').value = prayer;
    };
    function setTodayDateTime() {
      const now = new Date();
      document.getElementById('formDate').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      document.getElementById('formTime').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    // 12. MOBİL SEKME GEÇİŞİ 
    window.switchTab = function(index) {
      const isChanging = index !== currentActiveTab;
      if (isChanging) window.haptic(15);
      currentActiveTab = index;
      document.getElementById('tabViewport').style.transform = `translateX(-${index * 20}%)`;
      document.getElementById('navIndicator').style.left = `${index * 20}%`;

      for (let i = 0; i < 5; i++) {
        const btn = document.getElementById(`nav-btn-${i}`);
        btn.classList.toggle('active', i === index);
      }

      if (index === 1) updateMosquesListUI();

      const panels = document.querySelectorAll('.tab-panel');
      const activePanel = panels[index];
      if (activePanel) {
        activePanel.scrollTo({ top: 0, behavior: 'instant' });
        // Sekmeye girişte hafif bir "içerik canlanması" hissi için mevcut
        // fade-in-up animasyonunu yeniden tetikle (kayma animasyonuna ek olarak).
        if (isChanging) {
          activePanel.classList.remove('tab-content-pop');
          void activePanel.offsetWidth; // reflow: animasyonu yeniden başlatmak için
          activePanel.classList.add('tab-content-pop');
        }
      }
    };
    // 13. PARMAK KAYDIRMA (SWIPE)
    let touchStartX = 0, touchEndX = 0;
    const swipeContainer = document.getElementById('swipeContainer');
    swipeContainer.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    swipeContainer.addEventListener('touchend', e => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); }, { passive: true });
    function handleSwipe() {
      const threshold = 75;
      const diff = touchStartX - touchEndX;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      if (diff > threshold && currentActiveTab < 4) switchTab(currentActiveTab + 1);
      else if (diff < -threshold && currentActiveTab > 0) switchTab(currentActiveTab - 1);
    }
    // 13b. AŞAĞI ÇEKEREK YENİLEME (PULL TO REFRESH)
    let ptrStartY = 0;
    let ptrTracking = false;
    let ptrPulling = false;
    let ptrDistance = 0;
    let ptrRefreshing = false;
    const PTR_THRESHOLD = 68;
    const PTR_MAX = 110;
    function ptrGetActivePanel() {
      const panels = document.querySelectorAll('.tab-panel');
      return panels[currentActiveTab] || null;
    }
    function ptrSetIndicator(distance, state) {
      const wrap = document.getElementById('pullToRefreshIndicator');
      const icon = document.getElementById('pullToRefreshIcon');
      const label = document.getElementById('pullToRefreshLabel');
      if (!wrap || !icon || !label) return;
      const height = Math.max(0, Math.min(distance, PTR_MAX));
      wrap.style.height = `${height}px`;
      wrap.style.opacity = height > 4 ? '1' : '0';

      if (state === 'refreshing') {
        icon.className = 'fa-solid fa-spinner animate-spin text-[11px]';
        icon.style.transform = 'none';
        label.textContent = 'Yenileniyor...';
      } else if (distance >= PTR_THRESHOLD) {
        icon.className = 'fa-solid fa-arrow-down text-[11px] transition-transform';
        icon.style.transform = 'rotate(180deg)';
        label.textContent = 'Bırakınca yenilenir';
      } else {
        icon.className = 'fa-solid fa-arrow-down text-[11px] transition-transform';
        icon.style.transform = 'none';
        label.textContent = 'Yenilemek için çek';
      }
    }
    function ptrReset(animated) {
      const wrap = document.getElementById('pullToRefreshIndicator');
      if (wrap) {
        wrap.style.transition = animated ? 'height .25s ease, opacity .2s ease' : 'none';
        wrap.style.height = '0';
        wrap.style.opacity = '0';
      }
      ptrDistance = 0;
      ptrPulling = false;
      ptrTracking = false;
    }
    async function refreshAppData() {
      if (ptrRefreshing) return;
      ptrRefreshing = true;
      ptrSetIndicator(PTR_MAX, 'refreshing');
      window.haptic(15);
      const minDisplay = new Promise(r => setTimeout(r, 550));
      try {
        loadCustomAddedMosques();
        applyMosqueOverrides();
        loadMosqueInfoOverrides();
        loadFavorites();
        loadRatings();
        await loadVisits();
        loadProfileData();
        displayDailyVerse();
        triggerAllUIUpdates();
        await initPrayerCountdown();
        showToast('Kayıtlar güncellendi.', 'success');
      } catch (e) {
        showToast('Yenileme sırasında bir sorun oluştu.', 'error');
      }
      await minDisplay;
      ptrRefreshing = false;
      ptrReset(true);
    }
    swipeContainer.addEventListener('touchstart', e => {
      if (ptrRefreshing) return;
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      const panel = ptrGetActivePanel();
      if (!panel || panel.scrollTop > 0) { ptrTracking = false; return; }
      ptrStartY = e.touches[0].screenY;
      ptrTracking = true;
      ptrPulling = false;
    }, { passive: true });
    swipeContainer.addEventListener('touchmove', e => {
      if (!ptrTracking || ptrRefreshing) return;
      const panel = ptrGetActivePanel();
      if (!panel || panel.scrollTop > 0) { ptrReset(false); return; }
      const currentY = e.touches[0].screenY;
      const deltaY = currentY - ptrStartY;
      if (deltaY <= 0) { ptrReset(false); return; }
      ptrPulling = true;
      ptrDistance = Math.min(deltaY * 0.5, PTR_MAX);
      ptrSetIndicator(ptrDistance, 'pulling');
    }, { passive: true });
    swipeContainer.addEventListener('touchend', () => {
      if (!ptrTracking) return;
      if (ptrPulling && ptrDistance >= PTR_THRESHOLD) {
        refreshAppData();
      } else {
        ptrReset(true);
      }
      ptrTracking = false;
    }, { passive: true });
    // 15. TOAST
    window.showToast = function(message, type = "success") {
      const toast = document.getElementById('toastNotification');
      const msgEl = document.getElementById('toastMessage');
      const iconEl = document.getElementById('toastIcon');
      msgEl.textContent = message;
      iconEl.innerHTML = type === "success"
        ? `<i class="fa-solid fa-circle-check text-base" style="color:var(--gold);"></i>`
        : `<i class="fa-solid fa-circle-xmark text-base" style="color:var(--brick-soft);"></i>`;
      toast.classList.remove('opacity-0', '-translate-y-4');
      toast.classList.add('opacity-100', 'translate-y-0');
      setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-4');
      }, 3000);
    };
    // 16. LIGHTBOX (Fotoğraf Büyütme / Yakınlaştırma / Gezinme)
    let lightboxPhotos = [];
    let lightboxIndex = 0;
    let lbScale = 1, lbX = 0, lbY = 0;
    let lbLastTapTime = 0;
    let lbPointers = new Map();
    let lbStartDist = 0, lbStartScale = 1;
    let lbDragging = false, lbDragStartX = 0, lbDragStartY = 0, lbStartX = 0, lbStartY = 0;
    window.openLightbox = function(src, photosList, index) {
      lightboxPhotos = (photosList && photosList.length) ? photosList : [src];
      lightboxIndex = index || 0;
      renderLightboxImage();
      document.getElementById('lightboxModal').classList.remove('hidden');
    };
    window.openLightboxFromRecord = function(recordId, index) {
      const photos = (window.photoGalleries && window.photoGalleries[recordId]) || [];
      if (!photos.length) return;
      openLightbox(photos[index], photos, index);
    };
    function renderLightboxImage() {
      resetLightboxZoom();
      const img = document.getElementById('lightboxImage');
      img.onerror = () => window.__imgFallback(img);
      img.src = lightboxPhotos[lightboxIndex];
      const counter = document.getElementById('lightboxCounter');
      const prevBtn = document.getElementById('lightboxPrevBtn');
      const nextBtn = document.getElementById('lightboxNextBtn');
      if (lightboxPhotos.length > 1) {
        counter.textContent = `${lightboxIndex + 1} / ${lightboxPhotos.length}`;
        prevBtn.classList.toggle('hidden', lightboxIndex === 0);
        nextBtn.classList.toggle('hidden', lightboxIndex === lightboxPhotos.length - 1);
      } else {
        counter.textContent = '';
        prevBtn.classList.add('hidden');
        nextBtn.classList.add('hidden');
      }
    }
    window.lightboxNav = function(dir) {
      const next = lightboxIndex + dir;
      if (next < 0 || next >= lightboxPhotos.length) return;
      lightboxIndex = next;
      renderLightboxImage();
    };
    function resetLightboxZoom() {
      lbScale = 1; lbX = 0; lbY = 0;
      applyLightboxTransform(true);
    }
    function applyLightboxTransform(animated) {
      const img = document.getElementById('lightboxImage');
      img.style.transition = animated ? 'transform 0.18s ease' : 'none';
      img.style.transform = `translate(${lbX}px, ${lbY}px) scale(${lbScale})`;
    }
    window.lightboxZoom = function(delta) {
      lbScale = Math.min(4, Math.max(1, +(lbScale + delta).toFixed(2)));
      if (lbScale === 1) { lbX = 0; lbY = 0; }
      applyLightboxTransform(true);
    };
    window.downloadLightboxImage = function() {
      try {
        const img = document.getElementById('lightboxImage');
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `bursa-manevi-atlas-hatira-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        showToast("Fotoğraf indirilemedi.", "error");
      }
    };
    window.closeLightbox = function() {
      document.getElementById('lightboxModal').classList.add('hidden');
      resetLightboxZoom();
    };
    document.getElementById('lightboxModal').addEventListener('click', function(e) { if (e.target === this) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (document.getElementById('lightboxModal').classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lightboxNav(1);
      if (e.key === 'ArrowLeft') lightboxNav(-1);
    });
    // Pinch-to-zoom, çift dokunma ve sürükleyerek gezinme (dokunmatik + fare)
    const lbViewport = document.getElementById('lightboxViewport');
    function lbDistance(p1, p2) { return Math.hypot(p1.x - p2.x, p1.y - p2.y); }
    lbViewport.addEventListener('pointerdown', (e) => {
      lbViewport.setPointerCapture(e.pointerId);
      lbPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (lbPointers.size === 1) {
        lbDragging = true;
        lbDragStartX = e.clientX; lbDragStartY = e.clientY;
        lbStartX = lbX; lbStartY = lbY;

        const now = Date.now();
        if (now - lbLastTapTime < 300) {
          if (lbScale > 1) { resetLightboxZoom(); }
          else { lbScale = 2.5; applyLightboxTransform(true); }
          lbLastTapTime = 0;
        } else {
          lbLastTapTime = now;
        }
      } else if (lbPointers.size === 2) {
        lbDragging = false;
        const pts = Array.from(lbPointers.values());
        lbStartDist = lbDistance(pts[0], pts[1]);
        lbStartScale = lbScale;
      }
    });
    lbViewport.addEventListener('pointermove', (e) => {
      if (!lbPointers.has(e.pointerId)) return;
      lbPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (lbPointers.size === 2) {
        const pts = Array.from(lbPointers.values());
        const dist = lbDistance(pts[0], pts[1]);
        lbScale = Math.min(4, Math.max(1, lbStartScale * (dist / lbStartDist)));
        applyLightboxTransform(false);
      } else if (lbPointers.size === 1 && lbDragging && lbScale > 1) {
        lbX = lbStartX + (e.clientX - lbDragStartX);
        lbY = lbStartY + (e.clientY - lbDragStartY);
        applyLightboxTransform(false);
      }
    });
    function lbPointerEnd(e) {
      lbPointers.delete(e.pointerId);
      lbDragging = false;
      if (lbScale < 1) resetLightboxZoom();
      else applyLightboxTransform(true);
    }
    lbViewport.addEventListener('pointerup', lbPointerEnd);
    lbViewport.addEventListener('pointercancel', lbPointerEnd);
    lbViewport.addEventListener('pointerleave', lbPointerEnd);
    lbViewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      lbScale = Math.min(4, Math.max(1, +(lbScale - e.deltaY * 0.0015 * lbScale).toFixed(2)));
      if (lbScale === 1) { lbX = 0; lbY = 0; }
      applyLightboxTransform(false);
    }, { passive: false });
    // 17. UYGULAMA OLARAK YÜKLEME (PWA install prompt)
    let deferredInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      document.getElementById('installBanner').classList.remove('hidden');
    });
    document.getElementById('installBtn').addEventListener('click', async () => {
      document.getElementById('installBanner').classList.add('hidden');
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    });
    document.getElementById('installDismissBtn').addEventListener('click', () => {
      document.getElementById('installBanner').classList.add('hidden');
    });
    window.addEventListener('appinstalled', () => {
      document.getElementById('installBanner').classList.add('hidden');
      showToast('Uygulama ana ekranınıza yüklendi!', 'success');
    });
    // 18. SERVICE WORKER KAYDI (çevrimdışı açılış desteği)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }
