// stats.js — Favoriler, puanlama, istatistikler ve gösterge paneli (dashboard) hesaplamaları

    // ---- FAVORİLER & PUANLAMA ----
    const FAVORITES_KEY = 'manevi-atlas-favorites';
    const RATINGS_KEY = 'manevi-atlas-ratings';
    let favoriteMosqueIds = new Set();
    let mosqueRatings = {};
    function loadFavorites() {
      try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        favoriteMosqueIds = new Set(raw ? JSON.parse(raw) : []);
      } catch (e) { favoriteMosqueIds = new Set(); }
    }
    function saveFavorites() {
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favoriteMosqueIds))); } catch (e) {}
    }
    function loadRatings() {
      try {
        const raw = localStorage.getItem(RATINGS_KEY);
        mosqueRatings = raw ? JSON.parse(raw) : {};
      } catch (e) { mosqueRatings = {}; }
    }
    function saveRatings() {
      try { localStorage.setItem(RATINGS_KEY, JSON.stringify(mosqueRatings)); } catch (e) {}
    }
    window.toggleFavoriteMosque = function(id) {
      if (favoriteMosqueIds.has(id)) {
        favoriteMosqueIds.delete(id);
        showToast('Favorilerden kaldırıldı.', 'success');
      } else {
        favoriteMosqueIds.add(id);
        showToast('Favorilere eklendi.', 'success');
      }
      saveFavorites();
      updateMosquesListUI();
      updateFavoriteMosquesUI();
    };
    window.setMosqueRating = function(id, rating, evt) {
      if (evt) evt.stopPropagation();
      const current = mosqueRatings[id] || 0;
      // Aynı yıldıza tekrar dokunulursa puanı sıfırla (kaldır)
      mosqueRatings[id] = (current === rating) ? 0 : rating;
      saveRatings();
      updateMosquesListUI();
      updateFavoriteMosquesUI();
    };
    function computeMosqueVisitStats() {
      const stats = {};
      PRESET_MOSQUES.forEach(m => { stats[m.id] = 0; });
      visitsData.forEach(v => { if (stats[v.mosqueId] !== undefined) stats[v.mosqueId] += 1; });
      return stats;
    }
    // 4.5 İSTATİSTİK BÖLÜMÜ
    function updateStatsUI() {
      const container = document.getElementById('statsPanel');
      if (!container) return;

      const totalMosques = PRESET_MOSQUES.length;
      const visitedMosqueIds = new Set(visitsData.map(v => v.mosqueId));
      const visitedCount = PRESET_MOSQUES.filter(m => visitedMosqueIds.has(m.id)).length;
      const remaining = totalMosques - visitedCount;
      const completionPerc = totalMosques ? Math.round((visitedCount / totalMosques) * 100) : 0;

      if (visitsData.length === 0) {
        container.innerHTML = `
          <div class="empty-state paper-card rounded-3xl">
            <div class="empty-icon"><i class="fa-solid fa-chart-pie"></i></div>
            <p class="text-xs font-bold" style="color:var(--ink);">Henüz istatistik yok</p>
            <p class="text-[10.5px]" style="color:var(--ink-faint);">İlk ziyaretini deftere işlediğinde istatistiklerin burada belirecek.</p>
          </div>`;
        return;
      }

      // Tarih sıralı kayıtlar (eskiden yeniye)
      const sortedByDate = [...visitsData].filter(v => v.date).sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstVisitDate = sortedByDate.length ? sortedByDate[0].date : null;
      const lastVisitDate = sortedByDate.length ? sortedByDate[sortedByDate.length - 1].date : null;

      const now = new Date();
      const curYear = now.getFullYear();
      const curMonth = now.getMonth();
      const thisMonthCount = visitsData.filter(v => {
        if (!v.date) return false;
        const d = new Date(v.date);
        return d.getFullYear() === curYear && d.getMonth() === curMonth;
      }).length;
      const thisYearCount = visitsData.filter(v => {
        if (!v.date) return false;
        return new Date(v.date).getFullYear() === curYear;
      }).length;

      // Yoğun ziyaret edilen ay
      const monthNames = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
      const monthTally = {};
      visitsData.forEach(v => {
        if (!v.date) return;
        const d = new Date(v.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthTally[key] = (monthTally[key] || 0) + 1;
      });
      let busiestMonthLabel = '—';
      let busiestMonthCount = 0;
      Object.keys(monthTally).forEach(key => {
        if (monthTally[key] > busiestMonthCount) {
          busiestMonthCount = monthTally[key];
          const [y, m] = key.split('-').map(Number);
          busiestMonthLabel = `${monthNames[m]} ${y}`;
        }
      });

      // En çok ziyaret edilen cami
      const visitTallyByMosque = {};
      const visitNameByMosque = {};
      visitsData.forEach(v => {
        if (!v.mosqueId) return;
        visitTallyByMosque[v.mosqueId] = (visitTallyByMosque[v.mosqueId] || 0) + 1;
        if (v.mosqueName) visitNameByMosque[v.mosqueId] = v.mosqueName;
      });
      let topVisitedMosqueId = null, topVisitedCount = 0;
      Object.keys(visitTallyByMosque).forEach(id => {
        if (visitTallyByMosque[id] > topVisitedCount) { topVisitedCount = visitTallyByMosque[id]; topVisitedMosqueId = id; }
      });
      const topVisitedMosqueName = topVisitedMosqueId
        ? (visitNameByMosque[topVisitedMosqueId] || (PRESET_MOSQUES.find(m => m.id === topVisitedMosqueId) || {}).name || '—')
        : '—';

      // Fotoğraf istatistikleri
      let totalPhotos = 0;
      const photosByMosque = {};
      visitsData.forEach(v => {
        const count = (v.photos && v.photos.length) ? v.photos.length : 0;
        totalPhotos += count;
        if (count > 0) photosByMosque[v.mosqueId] = (photosByMosque[v.mosqueId] || 0) + count;
      });
      const avgPhotosPerMosque = visitedCount ? (totalPhotos / visitedCount).toFixed(1) : '0.0';
      let topPhotoMosqueId = null, topPhotoCount = 0;
      Object.keys(photosByMosque).forEach(id => {
        if (photosByMosque[id] > topPhotoCount) { topPhotoCount = photosByMosque[id]; topPhotoMosqueId = id; }
      });
      const topPhotoMosque = topPhotoMosqueId ? PRESET_MOSQUES.find(m => m.id === topPhotoMosqueId) : null;

      // İlçe dağılımı (ziyaret edilen benzersiz cami sayısı, ilçeye göre)
      const districtTally = {};
      PRESET_MOSQUES.filter(m => visitedMosqueIds.has(m.id)).forEach(m => {
        districtTally[m.district] = (districtTally[m.district] || 0) + 1;
      });
      const districtEntries = Object.entries(districtTally).sort((a, b) => b[1] - a[1]);
      const maxDistrictCount = districtEntries.length ? districtEntries[0][1] : 1;
      const districtColors = ['bar-osmangazi', 'bar-yildirim'];

      // Yolculuk özeti
      const sortedByCreated = [...visitsData].sort((a, b) => getVisitTimestamp(b) - getVisitTimestamp(a));
      const lastVisitRecord = sortedByCreated[0];

      // En uzun ara verilen ziyaret (ardışık iki ziyaret arasındaki en büyük gün farkı)
      let longestGapDays = 0;
      let longestGapLabel = '—';
      if (sortedByDate.length > 1) {
        for (let i = 1; i < sortedByDate.length; i++) {
          const d1 = new Date(sortedByDate[i - 1].date);
          const d2 = new Date(sortedByDate[i].date);
          const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
          if (diffDays > longestGapDays) {
            longestGapDays = diffDays;
            longestGapLabel = `${diffDays} gün`;
          }
        }
        if (longestGapDays === 0) longestGapLabel = '0 gün';
      }

      // En çok ardışık ziyaret edilen gün sayısı (en uzun seri — geçmiş dahil)
      const uniqueDateKeys = [...new Set(visitsData.filter(v => v.date).map(v => v.date))].sort();
      let longestStreak = uniqueDateKeys.length ? 1 : 0;
      let curStreak = uniqueDateKeys.length ? 1 : 0;
      for (let i = 1; i < uniqueDateKeys.length; i++) {
        const prev = new Date(uniqueDateKeys[i - 1]);
        const cur = new Date(uniqueDateKeys[i]);
        const diff = Math.round((cur - prev) / (1000 * 60 * 60 * 24));
        if (diff === 1) { curStreak++; longestStreak = Math.max(longestStreak, curStreak); }
        else { curStreak = 1; }
      }

      const fmtDate = (dstr) => dstr ? new Date(dstr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

      // Başarı rozetleri
      const badgeThresholds = [
        { count: 10, icon: '🥉', label: 'İlk 10 Cami' },
        { count: 25, icon: '🥈', label: '25 Cami' },
        { count: 50, icon: '🥇', label: '50 Cami' },
        { count: totalMosques, icon: '👑', label: 'Tüm Camiler Tamamlandı' }
      ];

      container.innerHTML = `
        <!-- GENEL İLERLEME -->
        <div class="paper-card rounded-3xl p-4 space-y-3">
          <h4 class="font-bold text-[10px] pb-2 uppercase tracking-wider flex items-center gap-1.5" style="color:var(--ink-faint); border-bottom:1px solid var(--line);">
            <i class="fa-solid fa-chart-simple"></i> Genel İlerleme
          </h4>
          <div class="grid grid-cols-2 gap-2.5">
            <div class="rounded-2xl p-3" style="background:var(--paper-deep);">
              <p class="text-[9.5px] font-semibold uppercase tracking-wide" style="color:var(--ink-faint);">Toplam Takipçi Cami</p>
              <p class="text-xl font-black font-ledger mt-0.5" style="color:var(--ink);">${totalMosques}</p>
            </div>
            <div class="rounded-2xl p-3" style="background:var(--paper-deep);">
              <p class="text-[9.5px] font-semibold uppercase tracking-wide" style="color:var(--ink-faint);">Ziyaret Edilen</p>
              <p class="text-xl font-black font-ledger mt-0.5" style="color:var(--teal-700);">${visitedCount}</p>
            </div>
            <div class="rounded-2xl p-3" style="background:var(--paper-deep);">
              <p class="text-[9.5px] font-semibold uppercase tracking-wide" style="color:var(--ink-faint);">Kalan</p>
              <p class="text-xl font-black font-ledger mt-0.5" style="color:var(--brick);">${remaining}</p>
            </div>
            <div class="rounded-2xl p-3" style="background:var(--paper-deep);">
              <p class="text-[9.5px] font-semibold uppercase tracking-wide" style="color:var(--ink-faint);">Tamamlanma Oranı</p>
              <p class="text-xl font-black font-ledger mt-0.5" style="color:var(--gold-deep);">%${completionPerc}</p>
            </div>
          </div>
          <div class="w-full h-2 rounded-full overflow-hidden" style="background:var(--paper-deep);">
            <div class="h-full rounded-full" style="width:${completionPerc}%; background:linear-gradient(90deg, var(--teal-700), var(--teal-500));"></div>
          </div>
        </div>

        <!-- ZİYARET İSTATİSTİKLERİ -->
        <div class="paper-card rounded-3xl p-4 space-y-1.5">
          <h4 class="font-bold text-[10px] pb-2 uppercase tracking-wider flex items-center gap-1.5" style="color:var(--ink-faint); border-bottom:1px solid var(--line);">
            <i class="fa-solid fa-calendar-days"></i> Ziyaret İstatistikleri
          </h4>
          <p class="flex justify-between text-[11px] py-1"><span style="color:var(--ink-soft);">İlk Ziyaret Tarihi</span><strong style="color:var(--ink);">${fmtDate(firstVisitDate)}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Son Ziyaret Tarihi</span><strong style="color:var(--ink);">${fmtDate(lastVisitDate)}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Bu Ay Ziyaret Edilen</span><strong style="color:var(--ink);">${thisMonthCount} cami</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Bu Yıl Ziyaret Edilen</span><strong style="color:var(--ink);">${thisYearCount} cami</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Yoğun Ziyaret Edilen Ay</span><strong style="color:var(--ink);">${busiestMonthLabel}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">En Çok Ziyaret Edilen Cami</span><strong style="color:var(--ink);">${topVisitedMosqueId ? `${escapeHtml(topVisitedMosqueName)} (${topVisitedCount} ziyaret)` : '—'}</strong></p>
        </div>

        <!-- FOTOĞRAF İSTATİSTİKLERİ -->
        <div class="paper-card rounded-3xl p-4 space-y-1.5">
          <h4 class="font-bold text-[10px] pb-2 uppercase tracking-wider flex items-center gap-1.5" style="color:var(--ink-faint); border-bottom:1px solid var(--line);">
            <i class="fa-solid fa-camera-retro"></i> Fotoğraf İstatistikleri
          </h4>
          <p class="flex justify-between text-[11px] py-1"><span style="color:var(--ink-soft);">Toplam Kaydedilen Fotoğraf</span><strong style="color:var(--ink);">${totalPhotos}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Cami Başına Fotoğraf Ortalaması</span><strong style="color:var(--ink);">${avgPhotosPerMosque}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">En Çok Fotoğraf Çekilen Cami</span><strong style="color:var(--ink);">${topPhotoMosque ? escapeHtml(topPhotoMosque.name) : '—'}</strong></p>
        </div>

        <!-- İLÇE DAĞILIMI -->
        <div class="paper-card rounded-3xl p-4 space-y-2.5">
          <h4 class="font-bold text-[10px] pb-2 uppercase tracking-wider flex items-center gap-1.5" style="color:var(--ink-faint); border-bottom:1px solid var(--line);">
            <i class="fa-solid fa-map-location-dot"></i> İlçe Dağılımı
          </h4>
          ${districtEntries.length === 0 ? `<p class="text-[10.5px]" style="color:var(--ink-faint);">Henüz ziyaret edilen bir cami yok.</p>` :
            districtEntries.map(([district, count], i) => `
              <div class="space-y-1">
                <div class="flex justify-between text-[11px]">
                  <span style="color:var(--ink-soft);">${escapeHtml(district)}</span>
                  <strong class="font-ledger" style="color:var(--ink);">${count}</strong>
                </div>
                <div class="w-full h-1.5 rounded-full overflow-hidden" style="background:var(--paper-deep);">
                  <div class="h-full rounded-full ${districtColors[i % districtColors.length]}" style="width:${Math.round((count / maxDistrictCount) * 100)}%;"></div>
                </div>
              </div>
            `).join('')
          }
        </div>

        <!-- YOLCULUK ÖZETİ -->
        <div class="paper-card rounded-3xl p-4 space-y-1.5">
          <h4 class="font-bold text-[10px] pb-2 uppercase tracking-wider flex items-center gap-1.5" style="color:var(--ink-faint); border-bottom:1px solid var(--line);">
            <i class="fa-solid fa-route"></i> Yolculuk Özeti
          </h4>
          <p class="flex justify-between text-[11px] py-1"><span style="color:var(--ink-soft);">En Son Ziyaret Edilen Cami</span><strong style="color:var(--ink);">${lastVisitRecord ? escapeHtml(lastVisitRecord.mosqueName) : '—'}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">En Uzun Ara Verilen Ziyaret</span><strong style="color:var(--ink);">${longestGapLabel}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Arka Arkaya En Çok Ziyaret Edilen Gün Sayısı</span><strong style="color:var(--ink);">${longestStreak} gün</strong></p>
        </div>

        <!-- BAŞARI ROZETLERİ -->
        <div class="paper-card rounded-3xl p-4 space-y-2.5">
          <h4 class="font-bold text-[10px] pb-2 uppercase tracking-wider flex items-center gap-1.5" style="color:var(--ink-faint); border-bottom:1px solid var(--line);">
            <i class="fa-solid fa-medal"></i> Başarı Rozetleri
          </h4>
          <div class="grid grid-cols-2 gap-2.5">
            ${badgeThresholds.map(b => {
              const earned = visitedCount >= b.count;
              return `
                <div class="rounded-2xl p-3 flex items-center gap-2.5 ${earned ? '' : 'opacity-40'}" style="background:var(--paper-deep);">
                  <span class="text-xl">${b.icon}</span>
                  <div class="min-w-0">
                    <p class="text-[10.5px] font-bold truncate" style="color:var(--ink);">${b.label}</p>
                    <p class="text-[9px]" style="color:var(--ink-faint);">${earned ? 'Kazanıldı' : `${visitedCount}/${b.count}`}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
    // FAVORİ CAMİLERİM (ana ekran)
    function updateFavoriteMosquesUI() {
      const container = document.getElementById('favoriteMosquesContainer');
      if (!container) return;

      const favorites = PRESET_MOSQUES.filter(m => favoriteMosqueIds.has(m.id));

      if (favorites.length === 0) {
        container.innerHTML = `<p class="text-xs py-2 text-center" style="color:var(--ink-faint);">Henüz favori camin yok. Cami Listesi'nde kalp simgesine dokunarak ekleyebilirsin.</p>`;
        return;
      }

      const districtBadgeClass = (d) => d === 'Osmangazi' ? 'badge-osmangazi' : (d === 'Yıldırım' ? 'badge-yildirim' : '');
      const districtBadgeStyle = (d) => (d === 'Osmangazi' || d === 'Yıldırım') ? '' : 'color:var(--gold-deep); background:rgba(195,154,69,0.14);';

      container.innerHTML = favorites.map((m, idx) => {
        const rating = mosqueRatings[m.id] || 0;
        const starsHTML = rating > 0
          ? `<span class="flex items-center gap-0.5">${[1,2,3,4,5].map(n => `<i class="fa-${n <= rating ? 'solid' : 'regular'} fa-star text-[8px]" style="color:${n <= rating ? 'var(--gold)' : 'var(--ink-faint)'};"></i>`).join('')}</span>`
          : `<span class="text-[9.5px]" style="color:var(--ink-faint);">Henüz puan verilmedi</span>`;

        return `
          <div class="flex items-center gap-2.5 pressable rounded-xl px-2 py-1.5 -mx-2 favorite-mosque-row" data-mosque-id="${m.id}" style="cursor:pointer;">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background:rgba(220,38,38,0.10); color:#DC2626;">
              <i class="fa-solid fa-heart text-[11px]"></i>
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-bold text-[11px] truncate" style="color:var(--ink);">${escapeHtml(m.name)}</h4>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="sicil-tag ${districtBadgeClass(m.district)}" style="${districtBadgeStyle(m.district)}">${escapeHtml(m.district)}</span>
                ${starsHTML}
              </div>
            </div>
            <button onclick="event.stopPropagation(); toggleFavoriteMosque('${m.id}')" class="icon-btn flex-shrink-0" style="background:rgba(220,38,38,0.10); color:#DC2626; width:26px; height:26px;" title="Favorilerden kaldır">
              <i class="fa-solid fa-heart-crack text-[10px]"></i>
            </button>
          </div>
          ${idx < favorites.length - 1 ? '<div class="gold-line" style="background:linear-gradient(90deg, transparent, var(--line), transparent);"></div>' : ''}
        `;
      }).join('');

      container.querySelectorAll('.favorite-mosque-row').forEach(row => {
        row.addEventListener('click', () => openMosqueInfoModal(row.getAttribute('data-mosque-id')));
      });
    }
    // SON EKLENEN CAMİLER (ana ekran)
    function updateRecentlyAddedMosquesUI() {
      const container = document.getElementById('recentlyAddedContainer');
      if (!container) return;

      const recent = PRESET_MOSQUES
        .filter(m => m.addedAt)
        .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
        .slice(0, 5);

      if (recent.length === 0) {
        container.innerHTML = `<p class="text-xs py-2 text-center" style="color:var(--ink-faint);">Yeni eklenen mabetler burada görüntülenecek.</p>`;
        return;
      }

      const districtBadgeClass = (d) => d === 'Osmangazi' ? 'badge-osmangazi' : (d === 'Yıldırım' ? 'badge-yildirim' : '');
      const districtBadgeStyle = (d) => (d === 'Osmangazi' || d === 'Yıldırım') ? '' : 'color:var(--gold-deep); background:rgba(195,154,69,0.14);';

      const now = new Date();
      container.innerHTML = recent.map((m, idx) => {
        const added = new Date(m.addedAt);
        const diffDays = Math.floor((now - added) / (1000 * 60 * 60 * 24));
        const isNew = diffDays <= 14;
        const dateLabel = diffDays <= 0 ? 'Bugün eklendi' : (diffDays === 1 ? 'Dün eklendi' : added.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }));

        return `
          <div class="flex items-center gap-2.5 pressable rounded-xl px-2 py-1.5 -mx-2 recent-mosque-row" data-mosque-name="${escapeHtml(m.name)}" style="cursor:pointer;">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background:rgba(21,90,76,0.10); color:var(--teal-700);">
              <i class="fa-solid fa-mosque text-[11px]"></i>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <h4 class="font-bold text-[11px] truncate" style="color:var(--ink);">${escapeHtml(m.name)}</h4>
                ${isNew ? '<span class="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0" style="background:#DC2626; color:#fff;">Yeni</span>' : ''}
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="sicil-tag ${districtBadgeClass(m.district)}" style="${districtBadgeStyle(m.district)}">${escapeHtml(m.district)}</span>
                <span class="text-[9.5px]" style="color:var(--ink-faint);">${dateLabel}</span>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-[9px] flex-shrink-0" style="color:var(--ink-faint);"></i>
          </div>
          ${idx < recent.length - 1 ? '<div class="gold-line" style="background:linear-gradient(90deg, transparent, var(--line), transparent);"></div>' : ''}
        `;
      }).join('');

      container.querySelectorAll('.recent-mosque-row').forEach(row => {
        row.addEventListener('click', () => {
          const mosqueName = row.getAttribute('data-mosque-name');
          switchTab(1);
          setTimeout(() => {
            const inp = document.getElementById('mosqueSearchInput');
            if (inp) {
              inp.value = mosqueName;
              inp.dispatchEvent(new Event('input'));
            }
          }, 380);
        });
      });
    }
    // 4. DASHBOARD + SEYAHAT ÖNERİSİ
    function updateDashboardUI() {
      document.getElementById('totalVisitsCount').textContent = `${visitsData.length} Vakit`;
      const streakEl = document.getElementById('streakCount');
      if (streakEl) { const s = computeStreak(); streakEl.textContent = `🔥 ${s} gün`; }
      const visitedMosqueIds = new Set(visitsData.map(v => v.mosqueId));
      const osmangaziTotal = PRESET_MOSQUES.filter(m => m.district === 'Osmangazi');
      const yildirimTotal = PRESET_MOSQUES.filter(m => m.district === 'Yıldırım');
      const digerTotal = PRESET_MOSQUES.filter(m => m.district !== 'Osmangazi' && m.district !== 'Yıldırım');
      const osmangaziVisited = osmangaziTotal.filter(m => visitedMosqueIds.has(m.id)).length;
      const yildirimVisited = yildirimTotal.filter(m => visitedMosqueIds.has(m.id)).length;
      const digerVisited = digerTotal.filter(m => visitedMosqueIds.has(m.id)).length;

      const totalCount = PRESET_MOSQUES.length;
      document.getElementById('totalCountInfoText').textContent = `Bursa'nın tüm ilçelerindeki tescilli ${totalCount} tarihi cami ve mescidi ihya etme yolculuğun.`;
      
      const allFilterBtn = document.getElementById('btn-filter-all');
      if(allFilterBtn) allFilterBtn.textContent = `Hepsi (${totalCount})`;

      const kilinanlarFilterBtn = document.getElementById('btn-filter-kilinanlar');
      if(kilinanlarFilterBtn) kilinanlarFilterBtn.textContent = `Kılınanlar (${visitedMosqueIds.size})`;

      const niluferCount = PRESET_MOSQUES.filter(m => m.district === 'Nilüfer').length;
      const iznikCount = PRESET_MOSQUES.filter(m => m.district === 'İznik').length;
      const mudanyaCount = PRESET_MOSQUES.filter(m => m.district === 'Mudanya').length;
      const digerCount = PRESET_MOSQUES.filter(m => m.district !== 'Osmangazi' && m.district !== 'Yıldırım' && m.district !== 'Nilüfer' && m.district !== 'İznik' && m.district !== 'Mudanya').length;

      const osmangaziFilterBtn = document.getElementById('btn-filter-osmangazi');
      if(osmangaziFilterBtn) osmangaziFilterBtn.textContent = `Osmangazi (${osmangaziTotal.length})`;

      const yildirimFilterBtn = document.getElementById('btn-filter-yildirim');
      if(yildirimFilterBtn) yildirimFilterBtn.textContent = `Yıldırım (${yildirimTotal.length})`;

      const niluferFilterBtn = document.getElementById('btn-filter-nilufer');
      if(niluferFilterBtn) niluferFilterBtn.textContent = `Nilüfer (${niluferCount})`;

      const iznikFilterBtn = document.getElementById('btn-filter-iznik');
      if(iznikFilterBtn) iznikFilterBtn.textContent = `İznik (${iznikCount})`;

      const mudanyaFilterBtn = document.getElementById('btn-filter-mudanya');
      if(mudanyaFilterBtn) mudanyaFilterBtn.textContent = `Mudanya (${mudanyaCount})`;

      const digerFilterBtn = document.getElementById('btn-filter-diger');
      if(digerFilterBtn) digerFilterBtn.textContent = `Diğer İlçeler (${digerCount})`;

      document.getElementById('osmangaziProgressTxt').textContent = `${osmangaziVisited} / ${osmangaziTotal.length}`;
      document.getElementById('yildirimProgressTxt').textContent = `${yildirimVisited} / ${yildirimTotal.length}`;
      const digerTxt = document.getElementById('digerProgressTxt');
      if (digerTxt) digerTxt.textContent = `${digerVisited} / ${digerTotal.length}`;
      document.getElementById('osmangaziProgressBar').style.width = `${osmangaziTotal.length > 0 ? (osmangaziVisited / osmangaziTotal.length) * 100 : 0}%`;
      document.getElementById('yildirimProgressBar').style.width = `${yildirimTotal.length > 0 ? (yildirimVisited / yildirimTotal.length) * 100 : 0}%`;
      const digerBar = document.getElementById('digerProgressBar');
      if (digerBar) digerBar.style.width = `${digerTotal.length > 0 ? (digerVisited / digerTotal.length) * 100 : 0}%`;

      const totalUniquePresetVisited = PRESET_MOSQUES.filter(m => visitedMosqueIds.has(m.id)).length;
      const overallPerc = Math.round((totalUniquePresetVisited / PRESET_MOSQUES.length) * 100) || 0;
      document.getElementById('overallBadge').textContent = `%${overallPerc} Tamamlandı`;

      updateDailySuggestionCard();

      // Unvan: herhangi bir ilçeyi tamamlayan Mihrap, hepsini Fatih
      const completedAnyDistrict = ['Osmangazi','Yıldırım','Nilüfer','Mudanya','İznik','Gemlik','İnegöl','Orhangazi','Yenişehir','Karacabey','Mustafakemalpaşa','Kestel','Gürsu','Orhaneli','Keles','Büyükorhan','Harmancık'].some(d => {
        const list = PRESET_MOSQUES.filter(m => m.district === d);
        return list.length > 0 && list.every(m => visitedMosqueIds.has(m.id));
      });
      let userTitle = "Seyyah 🧭";
      if (visitsData.length === 0) userTitle = "Yola Hazır Seyyah 🧭";
      else if (overallPerc === 100) userTitle = "Bursa Fatihi 👑";
      else if (completedAnyDistrict) userTitle = "Mihrap Fatihi 🌟";
      else if (totalUniquePresetVisited >= 5) userTitle = "Manevi Türbedar 🕌";
      else if (visitsData.length >= 1) userTitle = "Manevi Seyyah 👣";
      document.getElementById('userTitle').textContent = userTitle;

      const latestVisitDiv = document.getElementById('latestVisitContainer');
      if (visitsData.length > 0) {
        const last = visitsData[0];
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = last.date ? new Date(last.date).toLocaleDateString('tr-TR', options) : '';
        latestVisitDiv.innerHTML = `
          <div class="rounded-xl p-3 flex items-center justify-between" style="background:var(--paper-deep); border:1px solid var(--line);">
            <div class="space-y-0.5">
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-ledger" style="color:var(--teal-900); background:rgba(21,90,76,0.12);">${escapeHtml(last.prayerTime)} Namazı</span>
              <h4 class="font-bold text-xs mt-1 truncate max-w-[200px]" style="color:var(--ink);">${escapeHtml(last.mosqueName)}</h4>
              <p class="text-[10px]" style="color:var(--ink-faint);">${formattedDate} - Saat ${escapeHtml(last.time) || '--:--'}</p>
            </div>
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background:rgba(21,90,76,0.12); color:var(--teal-700);">
              <i class="fa-solid fa-check text-sm"></i>
            </div>
          </div>
        `;
      } else {
        latestVisitDiv.innerHTML = `
          <div class="flex flex-col items-center text-center py-3 space-y-1.5">
            <i class="fa-regular fa-clock text-lg" style="color:var(--ink-faint);"></i>
            <p class="text-xs" style="color:var(--ink-faint);">Henüz bir vakit namazı kaydı girmediniz.</p>
          </div>`;
      }
    }
    // === SERİ (STREAK) HESABI ===
    function computeStreak() {
      if (!visitsData.length) return 0;
      const dateSet = new Set(visitsData.filter(v => v.date).map(v => v.date));
      let streak = 0;
      let cursor = new Date();
      // Bugün kayıt yoksa dünden başlat, en fazla 1 gün tolerans tanı
      const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (!dateSet.has(toKey(cursor))) cursor.setDate(cursor.getDate() - 1);
      while (dateSet.has(toKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
      return streak;
    }
