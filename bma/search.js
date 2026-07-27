// search.js — Cami listesi filtreleme/arama, dropdown doldurma ve ilçe filtre butonları

function updateMosquesListUI() {
  const listEl = document.getElementById('mosquesList');
  const searchValue = document.getElementById('mosqueSearchInput').value.toLowerCase();

  // Her cami için namaz vakti bazlı ziyaret sayılarını hesapla
  const visitCounts = {};
  PRESET_MOSQUES.forEach(m => {
    visitCounts[m.id] = { Sabah: 0, Öğle: 0, İkindi: 0, Akşam: 0, Yatsı: 0, total: 0 };
  });
  visitsData.forEach(v => {
    if (visitCounts[v.mosqueId]) {
      visitCounts[v.mosqueId][v.prayerTime] = (visitCounts[v.mosqueId][v.prayerTime] || 0) + 1;
      visitCounts[v.mosqueId].total += 1;
    }
  });

  // Arama metnine ve aktif ilçe/özel filtreye göre camileri filtrele
  const filtered = PRESET_MOSQUES.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchValue) || m.address.toLowerCase().includes(searchValue);
    let matchesFilter = false;

    if (activeFilterDistrict === 'HEPSİ') {
      matchesFilter = true;
    } else if (activeFilterDistrict === 'KILINANLAR') {
      const counts = visitCounts[m.id] || { total: 0 };
      matchesFilter = counts.total > 0;
    } else if (activeFilterDistrict === 'FAVORILER') {
      matchesFilter = favoriteMosqueIds.has(m.id);
    } else if (activeFilterDistrict === 'DIGER') {
      matchesFilter = m.district !== 'Osmangazi' && m.district !== 'Yıldırım' && m.district !== 'Nilüfer' && m.district !== 'İznik' && m.district !== 'Mudanya';
    } else {
      matchesFilter = m.district === activeFilterDistrict;
    }

    return matchesSearch && matchesFilter;
  }).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  if (filtered.length === 0) {
    const isFavoritesView = activeFilterDistrict === 'FAVORILER';
    listEl.innerHTML = `
          <div class="paper-card rounded-2xl empty-state">
            <div class="empty-icon"><i class="fa-solid ${isFavoritesView ? 'fa-heart' : 'fa-mosque'}"></i></div>
            <p class="text-xs font-semibold" style="color:var(--ink-soft);">${isFavoritesView ? 'Henüz favori camin yok' : 'Aradığınız mabet bulunamadı'}</p>
            <p class="text-[10px]" style="color:var(--ink-faint);">${isFavoritesView ? 'Bir caminin kalp simgesine dokunarak favorilerine ekleyebilirsin.' : 'Farklı bir anahtar kelime veya filtre deneyin.'}</p>
          </div>`;
    return;
  }

  listEl.innerHTML = filtered.map(mosque => {
    const counts = visitCounts[mosque.id] || { Sabah: 0, Öğle: 0, İkindi: 0, Akşam: 0, Yatsı: 0, total: 0 };
    const hasBeenVisited = counts.total > 0;
    const isOsmangazi = mosque.district === 'Osmangazi';
    const isYildirim = mosque.district === 'Yıldırım';
    const railClass = isOsmangazi ? 'bar-osmangazi' : isYildirim ? 'bar-yildirim' : '';
    const railStyle = !isOsmangazi && !isYildirim ? 'background:linear-gradient(180deg, var(--gold-deep), var(--gold));' : '';
    const badgeClass = isOsmangazi ? 'badge-osmangazi' : isYildirim ? 'badge-yildirim' : '';
    const badgeStyle = !isOsmangazi && !isYildirim ? 'color:var(--gold-deep); background:rgba(195,154,69,0.12);' : '';
    const customBadge = mosque.isCustom
      ? '<span class="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full uppercase" style="background:rgba(195,154,69,0.16); color:var(--gold-deep);">Eklediğin</span>'
      : '';
    const districtColor = isOsmangazi ? 'var(--teal-900)' : isYildirim ? 'var(--brick)' : 'var(--gold-deep)';

    const prayerTimes = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
    const prayerBadgesHtml = prayerTimes.map(pt => {
      const count = counts[pt] || 0;
      const style = count > 0
        ? `background:${districtColor}; color:#fff; font-weight:700;`
        : 'background:var(--paper-deep); color:var(--ink-faint);';
      return `
          <span class="w-6 h-6 rounded-full text-[9px] flex items-center justify-center transition-all" style="${style}" title="${pt}">${pt[0]}</span>`;
    }).join('');

    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mosque.mapsSearch || (mosque.name + ' ' + mosque.address));
    const isFavorite = favoriteMosqueIds.has(mosque.id);
    const rating = mosqueRatings[mosque.id] || 0;
    const starsHtml = [1, 2, 3, 4, 5].map(star => `
          <button onclick="setMosqueRating('${mosque.id}', ${star}, event)" class="icon-btn" style="width:22px; height:22px;" title="${star} yıldız ver">
            <i class="fa-${star <= rating ? 'solid' : 'regular'} fa-star text-[12px]" style="color:${star <= rating ? 'var(--gold)' : 'var(--ink-faint)'};"></i>
          </button>`).join('');

    return `
          <div class="paper-card pressable rounded-2xl p-3.5 relative overflow-hidden transition-all fade-in-up" onclick="openMosqueInfoModal('${mosque.id}')" title="Cami hakkında bilgi al">
            <div class="district-rail absolute left-0 top-0 bottom-0 ${railClass}" style="${railStyle}"></div>
            <div class="flex justify-between items-start pl-1.5">
              <div class="space-y-0.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[9px] font-bold ${badgeClass} px-2 py-0.5 rounded-full uppercase" style="${badgeStyle}">${mosque.district}</span>
                  <span class="sicil-tag">${getSicilNo(mosque)}</span>
                  ${customBadge}
                  ${isFavorite ? '<span class="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5" style="background:rgba(220,38,38,0.14); color:#DC2626;"><i class="fa-solid fa-heart text-[7px]"></i>Favori</span>' : ''}
                </div>
                <h3 class="font-bold text-xs mt-1" style="color:var(--ink);">${escapeHtml(mosque.name)}</h3>
                <p class="text-[10px] truncate max-w-[190px] mt-0.5 flex items-center gap-1" style="color:var(--ink-faint);">
                  <i class="fa-solid fa-location-dot"></i><span>${escapeHtml(mosque.address)}</span>
                </p>
                <p class="text-[9px] mt-1 flex items-center gap-1 font-semibold" style="color:var(--gold-deep);">
                  <i class="fa-solid fa-circle-info"></i><span>Tarihçesi için dokunun</span>
                </p>
              </div>
              <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
                <div class="flex items-center gap-1">
                  <button onclick="event.stopPropagation(); toggleFavoriteMosque('${mosque.id}')" class="icon-btn" style="background:${isFavorite ? '#DC2626' : 'rgba(220,38,38,0.08)'}; color:${isFavorite ? '#fff' : '#DC2626'}; width:26px; height:26px;" title="${isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}">
                    <i class="fa-solid fa-heart text-[10px]"></i>
                  </button>
                  <button onclick="event.stopPropagation(); openMosqueInfoModal('${mosque.id}')" class="icon-btn" style="background:rgba(195,154,69,0.12); color:var(--gold-deep); width:26px; height:26px;" title="Cami hakkında bilgi">
                    <i class="fa-solid fa-circle-info text-[10px]"></i>
                  </button>
                  <button onclick="event.stopPropagation(); openMosqueEditModal('${mosque.id}')" class="icon-btn" style="background:rgba(21,90,76,0.08); color:var(--teal-700); width:26px; height:26px;" title="Düzenle">
                    <i class="fa-solid fa-pen text-[10px]"></i>
                  </button>
                  <button onclick="event.stopPropagation(); triggerDeleteMosque('${mosque.id}')" class="icon-btn" style="background:rgba(168,86,49,0.08); color:var(--brick); width:26px; height:26px;" title="Listeden kaldır">
                    <i class="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                </div>
                ${hasBeenVisited
                  ? '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 whitespace-nowrap" style="background:rgba(21,90,76,0.12); color:var(--teal-900);"><i class="fa-solid fa-check"></i> <span>Namaz Kılındı</span></span>'
                  : '<span class="text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style="background:var(--paper-deep); color:var(--ink-faint);">Kılınmadı</span>'}
              </div>
            </div>
            <div class="pl-1.5 pt-2 flex items-center justify-between" onclick="event.stopPropagation()">
              <div class="flex items-center gap-0.5">${prayerBadgesHtml}</div>
              ${rating > 0
                ? `<span class="text-[9px] font-bold font-ledger" style="color:var(--gold-deep);">${rating}/5</span>`
                : '<span class="text-[9px]" style="color:var(--ink-faint);">Puan ver</span>'}
            </div>
            <div class="pl-1.5 pt-2.5 flex items-center justify-between mt-2.5" style="border-top:1px solid var(--line);">
              <div class="flex items-center space-x-1">${starsHtml}</div>
              <a href="${mapsUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-colors" style="background:rgba(21,90,76,0.08); color:var(--teal-900);">
                <i class="fa-solid fa-map-location-dot"></i><span>Haritada Göster</span>
              </a>
            </div>
          </div>
        `;
  }).join('');
}

function populateMosquesDropdown() {
  const selectEl = document.getElementById('formMosqueSelect');
  let optionsHtml = '<option value="" disabled selected>--- Cami Seçin ---</option>';

  // Bilinen ilçelerin gösterim sırası; listede olmayan yeni bir ilçe eklenirse
  // (custom cami ile) alfabetik olarak sona eklenir.
  const districtOrder = [
    'Osmangazi', 'Yıldırım', 'Nilüfer', 'Mudanya', 'İznik', 'Gemlik',
    'İnegöl', 'Orhangazi', 'Yenişehir', 'Karacabey', 'Mustafakemalpaşa',
    'Kestel', 'Gürsu', 'Orhaneli', 'Keles', 'Büyükorhan', 'Harmancık'
  ];

  const groupedByDistrict = {};
  PRESET_MOSQUES.forEach(m => {
    if (!groupedByDistrict[m.district]) groupedByDistrict[m.district] = [];
    groupedByDistrict[m.district].push(m);
  });
  Object.keys(groupedByDistrict).forEach(district => {
    groupedByDistrict[district].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  });

  const knownDistrictsWithMosques = districtOrder.filter(d => groupedByDistrict[d] && groupedByDistrict[d].length);
  const unknownDistricts = Object.keys(groupedByDistrict).filter(d => !districtOrder.includes(d)).sort();

  [...knownDistrictsWithMosques, ...unknownDistricts].forEach(district => {
    const mosques = groupedByDistrict[district];
    optionsHtml += `<optgroup label="${district} (${mosques.length})">`;
    mosques.forEach(m => {
      optionsHtml += `<option value="${m.id}">${m.name}</option>`;
    });
    optionsHtml += '</optgroup>';
  });

  optionsHtml += '<optgroup label="Diğer"><option value="custom">+ Listede Olmayan Tarihi Cami Ekle</option></optgroup>';
  selectEl.innerHTML = optionsHtml;
}

window.toggleCustomMosqueInput = function () {
  const selectEl = document.getElementById('formMosqueSelect');
  const customSection = document.getElementById('customMosqueSection');
  if (selectEl.value === 'custom') {
    customSection.classList.remove('hidden');
    document.getElementById('formCustomName').required = true;
  } else {
    customSection.classList.add('hidden');
    document.getElementById('formCustomName').required = false;
  }
};

window.filterDistrict = function (district) {
  activeFilterDistrict = district;

  const searchInput = document.getElementById('mosqueSearchInput');
  if (searchInput && searchInput.value) {
    searchInput.value = '';
  }

  const filterButtonIds = [
    'btn-filter-all', 'btn-filter-kilinanlar', 'btn-filter-favoriler',
    'btn-filter-osmangazi', 'btn-filter-yildirim', 'btn-filter-nilufer',
    'btn-filter-iznik', 'btn-filter-mudanya', 'btn-filter-diger'
  ];
  const inactiveStyle = 'background:var(--paper-deep); color:var(--ink-soft);';
  const activeStyle = 'background:var(--teal-900); color:#fff;';
  const activeFavoritesStyle = 'background:#DC2626; color:#fff;';
  const favoritesFlexStyle = ' display:flex; align-items:center; justify-content:center; gap:.25rem;';

  filterButtonIds.forEach(btnId => {
    const btnEl = document.getElementById(btnId);
    if (btnEl) {
      btnEl.setAttribute('style', inactiveStyle + (btnId === 'btn-filter-favoriler' ? favoritesFlexStyle : ''));
    }
  });

  const districtToButtonId = {
    'HEPSİ': 'btn-filter-all',
    'KILINANLAR': 'btn-filter-kilinanlar',
    'FAVORILER': 'btn-filter-favoriler',
    'Osmangazi': 'btn-filter-osmangazi',
    'Yıldırım': 'btn-filter-yildirim',
    'Nilüfer': 'btn-filter-nilufer',
    'İznik': 'btn-filter-iznik',
    'Mudanya': 'btn-filter-mudanya',
    'DIGER': 'btn-filter-diger'
  };
  const activeBtnEl = document.getElementById(districtToButtonId[district] || 'btn-filter-all');
  if (activeBtnEl) {
    const style = district === 'FAVORILER' ? activeFavoritesStyle : activeStyle;
    activeBtnEl.setAttribute('style', style + (district === 'FAVORILER' ? favoritesFlexStyle : ''));
  }

  updateMosquesListUI();
};

document.getElementById('mosqueSearchInput').addEventListener('input', () => updateMosquesListUI());
