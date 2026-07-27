// stats.js — Favoriler, cami puanlama ve istatistik/gösterge paneli (dashboard) mantığı

const FAVORITES_KEY = 'manevi-atlas-favorites';
const RATINGS_KEY = 'manevi-atlas-ratings';
let favoriteMosqueIds = new Set();
let mosqueRatings = {};

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    favoriteMosqueIds = new Set(raw ? JSON.parse(raw) : []);
  } catch (e) {
    favoriteMosqueIds = new Set();
  }
}
function saveFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favoriteMosqueIds)));
  } catch (e) {}
}
function loadRatings() {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    mosqueRatings = raw ? JSON.parse(raw) : {};
  } catch (e) {
    mosqueRatings = {};
  }
}
function saveRatings() {
  try {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(mosqueRatings));
  } catch (e) {}
}

window.toggleFavoriteMosque = function (mosqueId) {
  if (favoriteMosqueIds.has(mosqueId)) {
    favoriteMosqueIds.delete(mosqueId);
    window.haptic(15);
    showToast('Favorilerden kaldırıldı.', 'success');
  } else {
    favoriteMosqueIds.add(mosqueId);
    window.haptic([14, 45, 14]);
    showToast('Favorilere eklendi.', 'success');
  }
  saveFavorites();
  updateMosquesListUI();
  updateFavoriteMosquesUI();
};

window.setMosqueRating = function (mosqueId, star, event) {
  if (event) event.stopPropagation();
  const currentRating = mosqueRatings[mosqueId] || 0;
  // Aynı yıldıza tekrar basılırsa puanı sıfırla (kaldır), değilse yeni değeri ata
  mosqueRatings[mosqueId] = currentRating === star ? 0 : star;
  window.haptic(currentRating === star ? 12 : 16);
  saveRatings();
  updateMosquesListUI();
  updateFavoriteMosquesUI();
};

function computeMosqueVisitStats() {
  const visitCountByMosque = {};
  PRESET_MOSQUES.forEach(m => { visitCountByMosque[m.id] = 0; });
  visitsData.forEach(v => {
    if (visitCountByMosque[v.mosqueId] !== undefined) {
      visitCountByMosque[v.mosqueId] += 1;
    }
  });
  return visitCountByMosque;
}

function updateStatsUI() {
  const panelEl = document.getElementById('statsPanel');
  if (!panelEl) return;

  const totalMosques = PRESET_MOSQUES.length;
  const visitedMosqueIds = new Set(visitsData.map(v => v.mosqueId));
  const visitedCount = PRESET_MOSQUES.filter(m => visitedMosqueIds.has(m.id)).length;
  const remainingCount = totalMosques - visitedCount;
  const completionPerc = totalMosques ? Math.round((visitedCount / totalMosques) * 100) : 0;

  if (visitsData.length === 0) {
    panelEl.innerHTML = `
          <div class="empty-state paper-card rounded-3xl">
            <div class="empty-icon"><i class="fa-solid fa-chart-pie"></i></div>
            <p class="text-xs font-bold" style="color:var(--ink);">Henüz istatistik yok</p>
            <p class="text-[10.5px]" style="color:var(--ink-faint);">İlk ziyaretini deftere işlediğinde istatistiklerin burada belirecek.</p>
          </div>`;
    return;
  }

  const datedVisitsSorted = [...visitsData].filter(v => v.date).sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstVisitDate = datedVisitsSorted.length ? datedVisitsSorted[0].date : null;
  const lastVisitDate = datedVisitsSorted.length ? datedVisitsSorted[datedVisitsSorted.length - 1].date : null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const visitedThisMonth = visitsData.filter(v => {
    if (!v.date) return false;
    const d = new Date(v.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const visitedThisYear = visitsData.filter(v => {
    if (!v.date) return false;
    return new Date(v.date).getFullYear() === currentYear;
  }).length;

  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const visitCountByYearMonth = {};
  visitsData.forEach(v => {
    if (!v.date) return;
    const d = new Date(v.date);
    const key = d.getFullYear() + '-' + d.getMonth();
    visitCountByYearMonth[key] = (visitCountByYearMonth[key] || 0) + 1;
  });
  let busiestMonthLabel = '—';
  let busiestMonthCount = 0;
  Object.keys(visitCountByYearMonth).forEach(key => {
    if (visitCountByYearMonth[key] > busiestMonthCount) {
      busiestMonthCount = visitCountByYearMonth[key];
      const [year, month] = key.split('-').map(Number);
      busiestMonthLabel = monthNames[month] + ' ' + year;
    }
  });

  // Cami başına ziyaret sayısı ve en çok ziyaret edilen cami
  const visitCountByMosqueId = {};
  const mosqueNameById = {};
  visitsData.forEach(v => {
    if (!v.mosqueId) return;
    visitCountByMosqueId[v.mosqueId] = (visitCountByMosqueId[v.mosqueId] || 0) + 1;
    if (v.mosqueName) mosqueNameById[v.mosqueId] = v.mosqueName;
  });
  let mostVisitedMosqueId = null;
  let mostVisitedMosqueCount = 0;
  Object.keys(visitCountByMosqueId).forEach(id => {
    if (visitCountByMosqueId[id] > mostVisitedMosqueCount) {
      mostVisitedMosqueCount = visitCountByMosqueId[id];
      mostVisitedMosqueId = id;
    }
  });
  const mostVisitedMosqueName = mostVisitedMosqueId
    ? mosqueNameById[mostVisitedMosqueId] || (PRESET_MOSQUES.find(m => m.id === mostVisitedMosqueId) || {}).name || '—'
    : '—';

  // Fotoğraf istatistikleri
  let totalPhotoCount = 0;
  const photoCountByMosqueId = {};
  visitsData.forEach(v => {
    const photoCount = v.photos && v.photos.length ? v.photos.length : 0;
    totalPhotoCount += photoCount;
    if (photoCount > 0) {
      photoCountByMosqueId[v.mosqueId] = (photoCountByMosqueId[v.mosqueId] || 0) + photoCount;
    }
  });
  const avgPhotosPerMosque = visitedCount ? (totalPhotoCount / visitedCount).toFixed(1) : '0.0';
  let mostPhotographedMosqueId = null;
  let mostPhotographedMosqueCount = 0;
  Object.keys(photoCountByMosqueId).forEach(id => {
    if (photoCountByMosqueId[id] > mostPhotographedMosqueCount) {
      mostPhotographedMosqueCount = photoCountByMosqueId[id];
      mostPhotographedMosqueId = id;
    }
  });
  const mostPhotographedMosque = mostPhotographedMosqueId ? PRESET_MOSQUES.find(m => m.id === mostPhotographedMosqueId) : null;

  // İlçe dağılımı (ziyaret edilen camilerin ilçelere göre sayısı)
  const visitCountByDistrict = {};
  PRESET_MOSQUES.filter(m => visitedMosqueIds.has(m.id)).forEach(m => {
    visitCountByDistrict[m.district] = (visitCountByDistrict[m.district] || 0) + 1;
  });
  const districtEntriesSorted = Object.entries(visitCountByDistrict).sort((a, b) => b[1] - a[1]);
  const maxDistrictCount = districtEntriesSorted.length ? districtEntriesSorted[0][1] : 1;
  const districtBarClasses = ['bar-osmangazi', 'bar-yildirim'];

  // Yolculuk özeti: en son ziyaret, en uzun ara, en uzun seri
  const visitsSortedByRecency = [...visitsData].sort((a, b) => getVisitTimestamp(b) - getVisitTimestamp(a));
  const mostRecentVisit = visitsSortedByRecency[0];

  let longestGapDays = 0;
  let longestGapLabel = '—';
  if (datedVisitsSorted.length > 1) {
    for (let i = 1; i < datedVisitsSorted.length; i++) {
      const prevDate = new Date(datedVisitsSorted[i - 1].date);
      const curDate = new Date(datedVisitsSorted[i].date);
      const gapDays = Math.round((curDate - prevDate) / 86400000);
      if (gapDays > longestGapDays) {
        longestGapDays = gapDays;
        longestGapLabel = gapDays + ' gün';
      }
    }
    if (longestGapDays === 0) longestGapLabel = '0 gün';
  }

  const uniqueSortedDates = [...new Set(visitsData.filter(v => v.date).map(v => v.date))].sort();
  let longestStreakDays = uniqueSortedDates.length ? 1 : 0;
  let currentRunLength = uniqueSortedDates.length ? 1 : 0;
  for (let i = 1; i < uniqueSortedDates.length; i++) {
    const prevDate = new Date(uniqueSortedDates[i - 1]);
    const curDate = new Date(uniqueSortedDates[i]);
    const diffDays = Math.round((curDate - prevDate) / 86400000);
    if (diffDays === 1) {
      currentRunLength++;
      longestStreakDays = Math.max(longestStreakDays, currentRunLength);
    } else {
      currentRunLength = 1;
    }
  }

  const formatDate = (dateStr) => dateStr
    ? new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const badges = [
    { count: 10, icon: '🥉', label: 'İlk 10 Cami' },
    { count: 25, icon: '🥈', label: '25 Cami' },
    { count: 50, icon: '🥇', label: '50 Cami' },
    {
      count: totalMosques,
      icon: '<svg width="22" height="22" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;"><circle cx="20" cy="20" r="18" fill="none" stroke="#C39A45" stroke-width="2"/><circle cx="20" cy="20" r="14" fill="#8C6A22"/><path d="M23 12a9 9 0 1 0 0 16 7.2 7.2 0 1 1 0-16Z" fill="#F4E4B8"/><path d="M27.2 17.6l.9 1.9 2.1.3-1.5 1.45.35 2.05-1.85-.97-1.85.97.35-2.05-1.5-1.45 2.1-.3Z" fill="#F4E4B8"/></svg>',
      label: 'Tüm Camiler Tamamlandı'
    }
  ];

  panelEl.innerHTML = `
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
              <p class="text-xl font-black font-ledger mt-0.5" style="color:var(--brick);">${remainingCount}</p>
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
          <p class="flex justify-between text-[11px] py-1"><span style="color:var(--ink-soft);">İlk Ziyaret Tarihi</span><strong style="color:var(--ink);">${formatDate(firstVisitDate)}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Son Ziyaret Tarihi</span><strong style="color:var(--ink);">${formatDate(lastVisitDate)}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Bu Ay Ziyaret Edilen</span><strong style="color:var(--ink);">${visitedThisMonth} cami</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Bu Yıl Ziyaret Edilen</span><strong style="color:var(--ink);">${visitedThisYear} cami</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Yoğun Ziyaret Edilen Ay</span><strong style="color:var(--ink);">${busiestMonthLabel}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">En Çok Ziyaret Edilen Cami</span><strong style="color:var(--ink);">${mostVisitedMosqueId ? escapeHtml(mostVisitedMosqueName) + ' (' + mostVisitedMosqueCount + ' ziyaret)' : '—'}</strong></p>
        </div>

        <!-- FOTOĞRAF İSTATİSTİKLERİ -->
        <div class="paper-card rounded-3xl p-4 space-y-1.5">
          <h4 class="font-bold text-[10px] pb-2 uppercase tracking-wider flex items-center gap-1.5" style="color:var(--ink-faint); border-bottom:1px solid var(--line);">
            <i class="fa-solid fa-camera-retro"></i> Fotoğraf İstatistikleri
          </h4>
          <p class="flex justify-between text-[11px] py-1"><span style="color:var(--ink-soft);">Toplam Kaydedilen Fotoğraf</span><strong style="color:var(--ink);">${totalPhotoCount}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Cami Başına Fotoğraf Ortalaması</span><strong style="color:var(--ink);">${avgPhotosPerMosque}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">En Çok Fotoğraf Çekilen Cami</span><strong style="color:var(--ink);">${mostPhotographedMosque ? escapeHtml(mostPhotographedMosque.name) : '—'}</strong></p>
        </div>

        <!-- İLÇE DAĞILIMI -->
        <div class="paper-card rounded-3xl p-4 space-y-2.5">
          <h4 class="font-bold text-[10px] pb-2 uppercase tracking-wider flex items-center gap-1.5" style="color:var(--ink-faint); border-bottom:1px solid var(--line);">
            <i class="fa-solid fa-map-location-dot"></i> İlçe Dağılımı
          </h4>
          ${districtEntriesSorted.length === 0
            ? '<p class="text-[10.5px]" style="color:var(--ink-faint);">Henüz ziyaret edilen bir cami yok.</p>'
            : districtEntriesSorted.map(([district, count], idx) => `
              <div class="space-y-1">
                <div class="flex justify-between text-[11px]">
                  <span style="color:var(--ink-soft);">${escapeHtml(district)}</span>
                  <strong class="font-ledger" style="color:var(--ink);">${count}</strong>
                </div>
                <div class="w-full h-1.5 rounded-full overflow-hidden" style="background:var(--paper-deep);">
                  <div class="h-full rounded-full ${districtBarClasses[idx % districtBarClasses.length]}" style="width:${Math.round((count / maxDistrictCount) * 100)}%;"></div>
                </div>
              </div>
            `).join('')}
        </div>

        <!-- YOLCULUK ÖZETİ -->
        <div class="paper-card rounded-3xl p-4 space-y-1.5">
          <h4 class="font-bold text-[10px] pb-2 uppercase tracking-wider flex items-center gap-1.5" style="color:var(--ink-faint); border-bottom:1px solid var(--line);">
            <i class="fa-solid fa-route"></i> Yolculuk Özeti
          </h4>
          <p class="flex justify-between text-[11px] py-1"><span style="color:var(--ink-soft);">En Son Ziyaret Edilen Cami</span><strong style="color:var(--ink);">${mostRecentVisit ? escapeHtml(mostRecentVisit.mosqueName) : '—'}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">En Uzun Ara Verilen Ziyaret</span><strong style="color:var(--ink);">${longestGapLabel}</strong></p>
          <p class="flex justify-between text-[11px] py-1" style="border-top:1px solid var(--line);"><span style="color:var(--ink-soft);">Arka Arkaya En Çok Ziyaret Edilen Gün Sayısı</span><strong style="color:var(--ink);">${longestStreakDays} gün</strong></p>
        </div>

        <!-- BAŞARI ROZETLERİ -->
        <div class="paper-card rounded-3xl p-4 space-y-2.5">
          <h4 class="font-bold text-[10px] pb-2 uppercase tracking-wider flex items-center gap-1.5" style="color:var(--ink-faint); border-bottom:1px solid var(--line);">
            <i class="fa-solid fa-medal"></i> Başarı Rozetleri
          </h4>
          <div class="grid grid-cols-2 gap-2.5">
            ${badges.map(badge => {
              const earned = visitedCount >= badge.count;
              return `
                <div class="rounded-2xl p-3 flex items-center gap-2.5 ${earned ? '' : 'opacity-40'}" style="background:var(--paper-deep);">
                  <span class="text-xl">${badge.icon}</span>
                  <div class="min-w-0">
                    <p class="text-[10.5px] font-bold truncate" style="color:var(--ink);">${badge.label}</p>
                    <p class="text-[9px]" style="color:var(--ink-faint);">${earned ? 'Kazanıldı' : visitedCount + '/' + badge.count}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
}

function updateFavoriteMosquesUI() {
  const containerEl = document.getElementById('favoriteMosquesContainer');
  if (!containerEl) return;

  const favoriteMosques = PRESET_MOSQUES.filter(m => favoriteMosqueIds.has(m.id));
  if (favoriteMosques.length === 0) {
    containerEl.innerHTML = '<p class="text-xs py-2 text-center" style="color:var(--ink-faint);">Henüz favori camin yok. Cami Listesi\'nde kalp simgesine dokunarak ekleyebilirsin.</p>';
    return;
  }

  const badgeClassFor = (district) => district === 'Osmangazi' ? 'badge-osmangazi' : district === 'Yıldırım' ? 'badge-yildirim' : '';
  const badgeStyleFor = (district) => (district === 'Osmangazi' || district === 'Yıldırım') ? '' : 'color:var(--gold-deep); background:rgba(195,154,69,0.14);';

  containerEl.innerHTML = favoriteMosques.map((mosque, idx) => {
    const rating = mosqueRatings[mosque.id] || 0;
    const ratingHtml = rating > 0
      ? '<span class="flex items-center gap-0.5">' + [1, 2, 3, 4, 5].map(star =>
          `<i class="fa-${star <= rating ? 'solid' : 'regular'} fa-star text-[8px]" style="color:${star <= rating ? 'var(--gold)' : 'var(--ink-faint)'};"></i>`
        ).join('') + '</span>'
      : '<span class="text-[9.5px]" style="color:var(--ink-faint);">Henüz puan verilmedi</span>';

    return `
          <div class="flex items-center gap-2.5 pressable rounded-xl px-2 py-1.5 -mx-2 favorite-mosque-row" data-mosque-id="${mosque.id}" style="cursor:pointer;">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background:rgba(220,38,38,0.10); color:#DC2626;">
              <i class="fa-solid fa-heart text-[11px]"></i>
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-bold text-[11px] truncate" style="color:var(--ink);">${escapeHtml(mosque.name)}</h4>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="sicil-tag ${badgeClassFor(mosque.district)}" style="${badgeStyleFor(mosque.district)}">${escapeHtml(mosque.district)}</span>
                ${ratingHtml}
              </div>
            </div>
            <button onclick="event.stopPropagation(); toggleFavoriteMosque('${mosque.id}')" class="icon-btn flex-shrink-0" style="background:rgba(220,38,38,0.10); color:#DC2626; width:26px; height:26px;" title="Favorilerden kaldır">
              <i class="fa-solid fa-heart-crack text-[10px]"></i>
            </button>
          </div>
          ${idx < favoriteMosques.length - 1 ? '<div class="gold-line" style="background:linear-gradient(90deg, transparent, var(--line), transparent);"></div>' : ''}
        `;
  }).join('');

  containerEl.querySelectorAll('.favorite-mosque-row').forEach(row => {
    row.addEventListener('click', () => openMosqueInfoModal(row.getAttribute('data-mosque-id')));
  });
}

function updateRecentlyAddedMosquesUI() {
  const containerEl = document.getElementById('recentlyAddedContainer');
  if (!containerEl) return;

  const recentMosques = PRESET_MOSQUES.filter(m => m.addedAt).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).slice(0, 5);
  if (recentMosques.length === 0) {
    containerEl.innerHTML = '<p class="text-xs py-2 text-center" style="color:var(--ink-faint);">Yeni eklenen mabetler burada görüntülenecek.</p>';
    return;
  }

  const badgeClassFor = (district) => district === 'Osmangazi' ? 'badge-osmangazi' : district === 'Yıldırım' ? 'badge-yildirim' : '';
  const badgeStyleFor = (district) => (district === 'Osmangazi' || district === 'Yıldırım') ? '' : 'color:var(--gold-deep); background:rgba(195,154,69,0.14);';
  const now = new Date();

  containerEl.innerHTML = recentMosques.map((mosque, idx) => {
    const addedAt = new Date(mosque.addedAt);
    const daysSinceAdded = Math.floor((now - addedAt) / 86400000);
    const isNew = daysSinceAdded <= 14;
    const addedLabel = daysSinceAdded <= 0
      ? 'Bugün eklendi'
      : daysSinceAdded === 1
        ? 'Dün eklendi'
        : addedAt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    return `
          <div class="flex items-center gap-2.5 pressable rounded-xl px-2 py-1.5 -mx-2 recent-mosque-row" data-mosque-name="${escapeHtml(mosque.name)}" style="cursor:pointer;">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background:rgba(21,90,76,0.10); color:var(--teal-700);">
              <i class="fa-solid fa-mosque text-[11px]"></i>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <h4 class="font-bold text-[11px] truncate" style="color:var(--ink);">${escapeHtml(mosque.name)}</h4>
                ${isNew ? '<span class="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0" style="background:#DC2626; color:#fff;">Yeni</span>' : ''}
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="sicil-tag ${badgeClassFor(mosque.district)}" style="${badgeStyleFor(mosque.district)}">${escapeHtml(mosque.district)}</span>
                <span class="text-[9.5px]" style="color:var(--ink-faint);">${addedLabel}</span>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-[9px] flex-shrink-0" style="color:var(--ink-faint);"></i>
          </div>
          ${idx < recentMosques.length - 1 ? '<div class="gold-line" style="background:linear-gradient(90deg, transparent, var(--line), transparent);"></div>' : ''}
        `;
  }).join('');

  containerEl.querySelectorAll('.recent-mosque-row').forEach(row => {
    row.addEventListener('click', () => {
      const mosqueName = row.getAttribute('data-mosque-name');
      switchTab(1);
      setTimeout(() => {
        const searchInput = document.getElementById('mosqueSearchInput');
        if (searchInput) {
          searchInput.value = mosqueName;
          searchInput.dispatchEvent(new Event('input'));
        }
      }, 380);
    });
  });
}

function updateDashboardUI() {
  document.getElementById('totalVisitsCount').textContent = visitsData.length + ' Vakit';

  const streakEl = document.getElementById('streakCount');
  if (streakEl) {
    const streak = computeStreak();
    streakEl.textContent = '🔥 ' + streak + ' gün';
  }

  const visitedMosqueIds = new Set(visitsData.map(v => v.mosqueId));
  const osmangaziMosques = PRESET_MOSQUES.filter(m => m.district === 'Osmangazi');
  const yildirimMosques = PRESET_MOSQUES.filter(m => m.district === 'Yıldırım');
  const otherDistrictMosques = PRESET_MOSQUES.filter(m => m.district !== 'Osmangazi' && m.district !== 'Yıldırım');
  const osmangaziVisited = osmangaziMosques.filter(m => visitedMosqueIds.has(m.id)).length;
  const yildirimVisited = yildirimMosques.filter(m => visitedMosqueIds.has(m.id)).length;
  const otherVisited = otherDistrictMosques.filter(m => visitedMosqueIds.has(m.id)).length;
  const totalMosques = PRESET_MOSQUES.length;

  document.getElementById('totalCountInfoText').textContent = `Bursa'nın tüm ilçelerindeki tescilli ${totalMosques} tarihi cami ve mescidi ihya etme yolculuğun.`;

  const btnAll = document.getElementById('btn-filter-all');
  if (btnAll) btnAll.textContent = `Hepsi (${totalMosques})`;

  const btnKilinanlar = document.getElementById('btn-filter-kilinanlar');
  if (btnKilinanlar) btnKilinanlar.textContent = `Kılınanlar (${visitedMosqueIds.size})`;

  const niluferCount = PRESET_MOSQUES.filter(m => m.district === 'Nilüfer').length;
  const iznikCount = PRESET_MOSQUES.filter(m => m.district === 'İznik').length;
  const mudanyaCount = PRESET_MOSQUES.filter(m => m.district === 'Mudanya').length;
  const digerCount = PRESET_MOSQUES.filter(m =>
    m.district !== 'Osmangazi' && m.district !== 'Yıldırım' && m.district !== 'Nilüfer' && m.district !== 'İznik' && m.district !== 'Mudanya'
  ).length;

  const btnOsmangazi = document.getElementById('btn-filter-osmangazi');
  if (btnOsmangazi) btnOsmangazi.textContent = `Osmangazi (${osmangaziMosques.length})`;

  const btnYildirim = document.getElementById('btn-filter-yildirim');
  if (btnYildirim) btnYildirim.textContent = `Yıldırım (${yildirimMosques.length})`;

  const btnNilufer = document.getElementById('btn-filter-nilufer');
  if (btnNilufer) btnNilufer.textContent = `Nilüfer (${niluferCount})`;

  const btnIznik = document.getElementById('btn-filter-iznik');
  if (btnIznik) btnIznik.textContent = `İznik (${iznikCount})`;

  const btnMudanya = document.getElementById('btn-filter-mudanya');
  if (btnMudanya) btnMudanya.textContent = `Mudanya (${mudanyaCount})`;

  const btnDiger = document.getElementById('btn-filter-diger');
  if (btnDiger) btnDiger.textContent = `Diğer İlçeler (${digerCount})`;

  document.getElementById('osmangaziProgressTxt').textContent = `${osmangaziVisited} / ${osmangaziMosques.length}`;
  document.getElementById('yildirimProgressTxt').textContent = `${yildirimVisited} / ${yildirimMosques.length}`;

  const digerProgressTxt = document.getElementById('digerProgressTxt');
  if (digerProgressTxt) digerProgressTxt.textContent = `${otherVisited} / ${otherDistrictMosques.length}`;

  document.getElementById('osmangaziProgressBar').style.width = (osmangaziMosques.length > 0 ? (osmangaziVisited / osmangaziMosques.length) * 100 : 0) + '%';
  document.getElementById('yildirimProgressBar').style.width = (yildirimMosques.length > 0 ? (yildirimVisited / yildirimMosques.length) * 100 : 0) + '%';

  const digerProgressBar = document.getElementById('digerProgressBar');
  if (digerProgressBar) digerProgressBar.style.width = (otherDistrictMosques.length > 0 ? (otherVisited / otherDistrictMosques.length) * 100 : 0) + '%';

  const totalVisitedCount = PRESET_MOSQUES.filter(m => visitedMosqueIds.has(m.id)).length;
  const overallPerc = Math.round((totalVisitedCount / PRESET_MOSQUES.length) * 100) || 0;
  document.getElementById('overallBadge').textContent = `%${overallPerc} Tamamlandı`;

  updateDailySuggestionCard();

  // Tüm ilçelerdeki camileri tamamlamış mı? (rozet/unvan için)
  const allDistricts = ['Osmangazi', 'Yıldırım', 'Nilüfer', 'Mudanya', 'İznik', 'Gemlik', 'İnegöl', 'Orhangazi', 'Yenişehir', 'Karacabey', 'Mustafakemalpaşa', 'Kestel', 'Gürsu', 'Orhaneli', 'Keles', 'Büyükorhan', 'Harmancık'];
  const hasCompletedAnyDistrict = allDistricts.some(district => {
    const districtMosques = PRESET_MOSQUES.filter(m => m.district === district);
    return districtMosques.length > 0 && districtMosques.every(m => visitedMosqueIds.has(m.id));
  });

  let userTitle = 'Seyyah 🧭';
  if (visitsData.length === 0) {
    userTitle = 'Yola Hazır Seyyah 🧭';
  } else if (overallPerc === 100) {
    userTitle = 'Bursa Fatihi 👑';
  } else if (hasCompletedAnyDistrict) {
    userTitle = 'Mihrap Fatihi 🌟';
  } else if (totalVisitedCount >= 10) {
    userTitle = 'Manevi Türbedar 🕌';
  } else if (visitsData.length >= 1) {
    userTitle = 'Manevi Seyyah 👣';
  }
  document.getElementById('userTitle').textContent = userTitle;

  const latestVisitEl = document.getElementById('latestVisitContainer');
  if (visitsData.length > 0) {
    const latestVisit = visitsData[0];
    const dateOpts = { year: 'numeric', month: 'long', day: 'numeric' };
    const latestVisitDateLabel = latestVisit.date ? new Date(latestVisit.date).toLocaleDateString('tr-TR', dateOpts) : '';
    latestVisitEl.innerHTML = `
          <div class="rounded-xl p-3 flex items-center justify-between" style="background:var(--paper-deep); border:1px solid var(--line);">
            <div class="space-y-0.5">
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-ledger" style="color:var(--teal-900); background:rgba(21,90,76,0.12);">${escapeHtml(latestVisit.prayerTime)} Namazı</span>
              <h4 class="font-bold text-xs mt-1 truncate max-w-[200px]" style="color:var(--ink);">${escapeHtml(latestVisit.mosqueName)}</h4>
              <p class="text-[10px]" style="color:var(--ink-faint);">${latestVisitDateLabel} - Saat ${escapeHtml(latestVisit.time) || '--:--'}</p>
            </div>
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background:rgba(21,90,76,0.12); color:var(--teal-700);">
              <i class="fa-solid fa-check text-sm"></i>
            </div>
          </div>
        `;
  } else {
    latestVisitEl.innerHTML = `
          <div class="flex flex-col items-center text-center py-3 space-y-1.5">
            <i class="fa-regular fa-clock text-lg" style="color:var(--ink-faint);"></i>
            <p class="text-xs" style="color:var(--ink-faint);">Henüz bir vakit namazı kaydı girmediniz.</p>
          </div>`;
  }
}

// Bugüne kadarki en uzun ardışık gün serisini (streak) hesaplar: bugünden
// (veya bugün kayıt yoksa dünden) geriye doğru, ara vermeden ziyaret edilen
// gün sayısını sayar.
function computeStreak() {
  if (!visitsData.length) return 0;
  const visitDates = new Set(visitsData.filter(v => v.date).map(v => v.date));
  let streak = 0;
  let cursor = new Date();
  const formatDateKey = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  if (!visitDates.has(formatDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (visitDates.has(formatDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
