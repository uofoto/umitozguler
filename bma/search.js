// search.js — Cami listesi filtreleme/arama ve dropdown doldurma

    // 5. CAMİ LİSTESİ
    function updateMosquesListUI() {
      const container = document.getElementById('mosquesList');
      const searchVal = document.getElementById('mosqueSearchInput').value.toLowerCase();
      const mosqueStats = {};
      PRESET_MOSQUES.forEach(m => { mosqueStats[m.id] = { Sabah: 0, Öğle: 0, İkindi: 0, Akşam: 0, Yatsı: 0, total: 0 }; });
      visitsData.forEach(v => {
        if (mosqueStats[v.mosqueId]) {
          mosqueStats[v.mosqueId][v.prayerTime] = (mosqueStats[v.mosqueId][v.prayerTime] || 0) + 1;
          mosqueStats[v.mosqueId].total += 1;
        }
      });

      const filtered = PRESET_MOSQUES.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchVal) || m.address.toLowerCase().includes(searchVal);
        let matchesDistrict = false;
        
        if (activeFilterDistrict === 'HEPSİ') {
          matchesDistrict = true;
        } else if (activeFilterDistrict === 'KILINANLAR') {
          const stats = mosqueStats[m.id] || { total: 0 };
          matchesDistrict = stats.total > 0;
        } else if (activeFilterDistrict === 'FAVORILER') {
          matchesDistrict = favoriteMosqueIds.has(m.id);
        } else if (activeFilterDistrict === 'DIGER') {
          matchesDistrict = m.district !== 'Osmangazi' && m.district !== 'Yıldırım' && m.district !== 'Nilüfer' && m.district !== 'İznik' && m.district !== 'Mudanya';
        } else {
          matchesDistrict = m.district === activeFilterDistrict;
        }
        
        return matchesSearch && matchesDistrict;
      });

      if (filtered.length === 0) {
        const isFavView = activeFilterDistrict === 'FAVORILER';
        container.innerHTML = `
          <div class="paper-card rounded-2xl empty-state">
            <div class="empty-icon"><i class="fa-solid ${isFavView ? 'fa-heart' : 'fa-mosque'}"></i></div>
            <p class="text-xs font-semibold" style="color:var(--ink-soft);">${isFavView ? 'Henüz favori camin yok' : 'Aradığınız mabet bulunamadı'}</p>
            <p class="text-[10px]" style="color:var(--ink-faint);">${isFavView ? 'Bir caminin kalp simgesine dokunarak favorilerine ekleyebilirsin.' : 'Farklı bir anahtar kelime veya filtre deneyin.'}</p>
          </div>`;
        return;
      }

      container.innerHTML = filtered.map(m => {
        const stats = mosqueStats[m.id] || { Sabah: 0, Öğle: 0, İkindi: 0, Akşam: 0, Yatsı: 0, total: 0 };
        const isVisited = stats.total > 0;
        const isOsmangazi = m.district === 'Osmangazi';
        const isYildirim = m.district === 'Yıldırım';
        const railClass = isOsmangazi ? 'bar-osmangazi' : (isYildirim ? 'bar-yildirim' : '');
        const railStyle = (!isOsmangazi && !isYildirim) ? 'background:linear-gradient(180deg, var(--gold-deep), var(--gold));' : '';
        const badgeClass = isOsmangazi ? 'badge-osmangazi' : (isYildirim ? 'badge-yildirim' : '');
        const badgeStyle = (!isOsmangazi && !isYildirim) ? 'color:var(--gold-deep); background:rgba(195,154,69,0.12);' : '';
        const customTag = m.isCustom ? `<span class="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full uppercase" style="background:rgba(195,154,69,0.16); color:var(--gold-deep);">Eklediğin</span>` : '';
        const activeColor = isOsmangazi ? 'var(--teal-900)' : (isYildirim ? 'var(--brick)' : 'var(--gold-deep)');

        const times = ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı'];
        const timeBadgesHTML = times.map(time => {
          const count = stats[time] || 0;
          const style = count > 0
            ? `background:${activeColor}; color:#fff; font-weight:700;`
            : `background:var(--paper-deep); color:var(--ink-faint);`;
          return `<span class="w-6 h-6 rounded-full text-[9px] flex items-center justify-center transition-all" style="${style}" title="${time}">${time[0]}</span>`;
        }).join('');

        // Google Haritalar URL kurgusu
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.mapsSearch || (m.name + ' ' + m.address))}`;

        const isFavorite = favoriteMosqueIds.has(m.id);
        const rating = mosqueRatings[m.id] || 0;
        const starsHTML = [1,2,3,4,5].map(n => `
          <button onclick="setMosqueRating('${m.id}', ${n}, event)" class="icon-btn" style="width:22px; height:22px;" title="${n} yıldız ver">
            <i class="fa-${n <= rating ? 'solid' : 'regular'} fa-star text-[12px]" style="color:${n <= rating ? 'var(--gold)' : 'var(--ink-faint)'};"></i>
          </button>`).join('');

        return `
          <div class="paper-card pressable rounded-2xl p-3.5 relative overflow-hidden transition-all fade-in-up" onclick="openMosqueInfoModal('${m.id}')" title="Cami hakkında bilgi al">
            <div class="district-rail absolute left-0 top-0 bottom-0 ${railClass}" style="${railStyle}"></div>
            <div class="flex justify-between items-start pl-1.5">
              <div class="space-y-0.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[9px] font-bold ${badgeClass} px-2 py-0.5 rounded-full uppercase" style="${badgeStyle}">${m.district}</span>
                  <span class="sicil-tag">${getSicilNo(m)}</span>
                  ${customTag}
                  ${isFavorite ? `<span class="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5" style="background:rgba(220,38,38,0.14); color:#DC2626;"><i class="fa-solid fa-heart text-[7px]"></i>Favori</span>` : ''}
                </div>
                <h3 class="font-bold text-xs mt-1" style="color:var(--ink);">${escapeHtml(m.name)}</h3>
                <p class="text-[10px] truncate max-w-[190px] mt-0.5 flex items-center gap-1" style="color:var(--ink-faint);">
                  <i class="fa-solid fa-location-dot"></i><span>${escapeHtml(m.address)}</span>
                </p>
                <p class="text-[9px] mt-1 flex items-center gap-1 font-semibold" style="color:var(--gold-deep);">
                  <i class="fa-solid fa-circle-info"></i><span>Tarihçesi için dokunun</span>
                </p>
              </div>
              <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
                <div class="flex items-center gap-1">
                  <button onclick="event.stopPropagation(); toggleFavoriteMosque('${m.id}')" class="icon-btn" style="background:${isFavorite ? '#DC2626' : 'rgba(220,38,38,0.08)'}; color:${isFavorite ? '#fff' : '#DC2626'}; width:26px; height:26px;" title="${isFavorite ? 'Favorilerden kaldır' : 'Favorilere ekle'}">
                    <i class="fa-solid fa-heart text-[10px]"></i>
                  </button>
                  <button onclick="event.stopPropagation(); openMosqueInfoModal('${m.id}')" class="icon-btn" style="background:rgba(195,154,69,0.12); color:var(--gold-deep); width:26px; height:26px;" title="Cami hakkında bilgi">
                    <i class="fa-solid fa-circle-info text-[10px]"></i>
                  </button>
                  <button onclick="event.stopPropagation(); openMosqueEditModal('${m.id}')" class="icon-btn" style="background:rgba(21,90,76,0.08); color:var(--teal-700); width:26px; height:26px;" title="Düzenle">
                    <i class="fa-solid fa-pen text-[10px]"></i>
                  </button>
                  <button onclick="event.stopPropagation(); triggerDeleteMosque('${m.id}')" class="icon-btn" style="background:rgba(168,86,49,0.08); color:var(--brick); width:26px; height:26px;" title="Listeden kaldır">
                    <i class="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                </div>
                ${isVisited
                  ? `<span class="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 whitespace-nowrap" style="background:rgba(21,90,76,0.12); color:var(--teal-900);"><i class="fa-solid fa-check"></i> <span>Namaz Kılındı</span></span>`
                  : `<span class="text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style="background:var(--paper-deep); color:var(--ink-faint);">Kılınmadı</span>`}
              </div>
            </div>
            <div class="pl-1.5 pt-2 flex items-center justify-between" onclick="event.stopPropagation()">
              <div class="flex items-center gap-0.5">${starsHTML}</div>
              ${rating > 0 ? `<span class="text-[9px] font-bold font-ledger" style="color:var(--gold-deep);">${rating}/5</span>` : `<span class="text-[9px]" style="color:var(--ink-faint);">Puan ver</span>`}
            </div>
            <div class="pl-1.5 pt-2.5 flex items-center justify-between mt-2.5" style="border-top:1px solid var(--line);">
              <div class="flex items-center space-x-1">${timeBadgesHTML}</div>
              <a href="${mapUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()" class="text-[10px] px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-colors" style="background:rgba(21,90,76,0.08); color:var(--teal-900);">
                <i class="fa-solid fa-map-location-dot"></i><span>Haritada Göster</span>
              </a>
            </div>
          </div>
        `;
      }).join('');
    }
    // 11. DROPDOWN DOLDURUCU 
    function populateMosquesDropdown() {
      const select = document.getElementById('formMosqueSelect');
      let optionsHTML = `<option value="" disabled selected>--- Cami Seçin ---</option>`;
      
      const districtOrder = ['Osmangazi', 'Yıldırım', 'Nilüfer', 'Mudanya', 'İznik', 'Gemlik', 'İnegöl', 'Orhangazi', 'Yenişehir', 'Karacabey', 'Mustafakemalpaşa', 'Kestel', 'Gürsu', 'Orhaneli', 'Keles', 'Büyükorhan', 'Harmancık'];
      const byDistrict = {};
      PRESET_MOSQUES.forEach(m => {
        if (!byDistrict[m.district]) byDistrict[m.district] = [];
        byDistrict[m.district].push(m);
      });
      // Prefer ordered, then any remaining
      const ordered = districtOrder.filter(d => byDistrict[d] && byDistrict[d].length);
      const remaining = Object.keys(byDistrict).filter(d => !districtOrder.includes(d)).sort();
      [...ordered, ...remaining].forEach(d => {
        const list = byDistrict[d];
        optionsHTML += `<optgroup label="${d} (${list.length})">`;
        list.forEach(m => { optionsHTML += `<option value="${m.id}">${m.name}</option>`; });
        optionsHTML += `</optgroup>`;
      });

      optionsHTML += `<optgroup label="Diğer"><option value="custom">+ Listede Olmayan Tarihi Cami Ekle</option></optgroup>`;
      select.innerHTML = optionsHTML;
    }
    window.toggleCustomMosqueInput = function() {
      const select = document.getElementById('formMosqueSelect');
      const customSection = document.getElementById('customMosqueSection');
      if (select.value === 'custom') {
        customSection.classList.remove('hidden');
        document.getElementById('formCustomName').required = true;
      } else {
        customSection.classList.add('hidden');
        document.getElementById('formCustomName').required = false;
      }
    };
    // 14. İLÇE FİLTRELEME
    window.filterDistrict = function(district) {
      activeFilterDistrict = district;
      // Bir ilçe/filtre butonuna tıklandığında, eski arama metni yüzünden o ilçedeki
      // camilerin "bulunamadı" görünmesini engellemek için arama kutusunu temizle
      const searchInputEl = document.getElementById('mosqueSearchInput');
      if (searchInputEl && searchInputEl.value) searchInputEl.value = '';
      const btnIds = ['btn-filter-all','btn-filter-kilinanlar','btn-filter-favoriler','btn-filter-osmangazi','btn-filter-yildirim','btn-filter-nilufer','btn-filter-iznik','btn-filter-mudanya','btn-filter-diger'];
      const baseStyle = "background:var(--paper-deep); color:var(--ink-soft);";
      const activeStyle = "background:var(--teal-900); color:#fff;";
      const activeStyleFavoriler = "background:#DC2626; color:#fff;";
      const favBtnExtra = " display:flex; align-items:center; justify-content:center; gap:.25rem;";
      
      btnIds.forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.setAttribute('style', baseStyle + (id === 'btn-filter-favoriler' ? favBtnExtra : ''));
      });
      
      const map = {
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
      const activeBtn = document.getElementById(map[district] || 'btn-filter-all');
      if (activeBtn) {
        const style = (district === 'FAVORILER') ? activeStyleFavoriler : activeStyle;
        activeBtn.setAttribute('style', style + (district === 'FAVORILER' ? favBtnExtra : ''));
      }
      
      updateMosquesListUI();
    };
    document.getElementById('mosqueSearchInput').addEventListener('input', () => updateMosquesListUI());
