// map.js — Leaflet harita, konum/geocoding, rota oluşturma ve manevi yolculuk (journey) özellikleri

    // ---- MANEVİ HARİTA (Ziyaret Edilen / Edilmeyen Camiler Haritası) ----
    const GEOCODE_CACHE_KEY = 'manevi-atlas-geocode-cache';
    const LAST_LOCATION_KEY = 'manevi-atlas-last-location';
    const WEATHER_CACHE_KEY = 'manevi-atlas-weather-cache';
    let mosqueGeocodeCache = {};
    let leafletMapInstance = null;
    let mosqueMarkersLayer = null;
    let mosqueMarkersById = {};
    let mapFilterMode = 'HEPSI';
    let isGeocodingMosques = false;
    const BURSA_CENTER = [40.1885, 29.0610];
    function loadGeocodeCache() {
      try {
        const raw = localStorage.getItem(GEOCODE_CACHE_KEY);
        mosqueGeocodeCache = raw ? JSON.parse(raw) : {};
      } catch (e) { mosqueGeocodeCache = {}; }
    }
    function saveGeocodeCache() {
      try { localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(mosqueGeocodeCache)); } catch (e) {}
    }
    window.openMapModal = function() {
      document.getElementById('mapModal').classList.remove('hidden');
      setTimeout(() => {
        initMosqueMap();
        if (leafletMapInstance) leafletMapInstance.invalidateSize();
        renderMosqueMapMarkers();
        startGeocodingQueue();
      }, 50);
    };
    window.closeMapModal = function() {
      document.getElementById('mapModal').classList.add('hidden');
    };
    window.setMapFilter = function(mode) {
      mapFilterMode = mode;
      const ids = { 'HEPSI': 'btn-map-filter-all', 'ZIYARET_EDILEN': 'btn-map-filter-visited', 'ZIYARET_EDILMEYEN': 'btn-map-filter-unvisited' };
      Object.values(ids).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.setAttribute('style', 'background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.8);');
      });
      const activeBtn = document.getElementById(ids[mode]);
      if (activeBtn) activeBtn.setAttribute('style', 'background:rgba(255,255,255,0.18); color:#fff;');
      renderMosqueMapMarkers();
    };
    function initMosqueMap() {
      if (leafletMapInstance || typeof L === 'undefined') return;
      leafletMapInstance = L.map('mosqueMapContainer', { zoomControl: true }).setView(BURSA_CENTER, 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap katkıda bulunanlar'
      }).addTo(leafletMapInstance);
      mosqueMarkersLayer = L.layerGroup().addTo(leafletMapInstance);
    }
    function mosqueMatchesMapFilter(m, visitStats) {
      if (mapFilterMode === 'ZIYARET_EDILEN') return (visitStats[m.id] || 0) > 0;
      if (mapFilterMode === 'ZIYARET_EDILMEYEN') return (visitStats[m.id] || 0) === 0;
      return true;
    }
    function buildMosquePopupHTML(m, isVisited) {
      const rating = mosqueRatings[m.id] || 0;
      const isFav = favoriteMosqueIds.has(m.id);
      const starsHTML = rating > 0
        ? [1,2,3,4,5].map(n => `<i class="fa-${n <= rating ? 'solid' : 'regular'} fa-star" style="font-size:9px; color:${n <= rating ? '#C39A45' : '#ccc'};"></i>`).join('')
        : `<span style="font-size:9.5px; color:#999;">Puan yok</span>`;
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.mapsSearch || (m.name + ' ' + m.address))}`;
      return `
        <div style="font-family:'Manrope',sans-serif; min-width:180px;">
          <div style="font-weight:800; font-size:12.5px; color:#241F17; margin-bottom:2px;">${escapeHtml(m.name)}${isFav ? ' <i class="fa-solid fa-heart" style="color:#DC2626; font-size:10px;"></i>' : ''}</div>
          <div style="font-size:10px; color:#5B5445; margin-bottom:4px;">${escapeHtml(m.district)} · ${escapeHtml(m.address)}</div>
          <div style="display:flex; align-items:center; gap:3px; margin-bottom:6px;">${starsHTML}</div>
          <div style="font-size:10px; font-weight:700; color:${isVisited ? '#1F7A65' : '#A85631'}; margin-bottom:6px;">${isVisited ? '✓ Namaz Kılındı' : 'Henüz Kılınmadı'}</div>
          <div style="display:flex; gap:6px;">
            <button onclick="closeMapModal(); openMosqueInfoModal('${m.id}');" style="flex:1; font-size:10px; font-weight:700; padding:6px 8px; border-radius:8px; border:none; background:#124A3E; color:#fff; cursor:pointer;">Detay</button>
            <a href="${mapUrl}" target="_blank" rel="noopener" style="flex:1; text-align:center; font-size:10px; font-weight:700; padding:6px 8px; border-radius:8px; background:#F2ECDD; color:#124A3E; text-decoration:none;">Google'da Aç</a>
          </div>
        </div>
      `;
    }
    function addOrUpdateMosqueMarker(m) {
      if (!leafletMapInstance || !mosqueMarkersLayer) return;
      const coords = mosqueGeocodeCache[m.id];
      if (!coords) return;
      const visitStats = computeMosqueVisitStats();
      const isVisited = (visitStats[m.id] || 0) > 0;
      const isFav = favoriteMosqueIds.has(m.id);

      if (mosqueMarkersById[m.id]) {
        mosqueMarkersLayer.removeLayer(mosqueMarkersById[m.id]);
        delete mosqueMarkersById[m.id];
      }
      if (!mosqueMatchesMapFilter(m, visitStats)) return;

      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: isFav ? 9 : 7,
        fillColor: isVisited ? '#1F7A65' : '#A85631',
        color: isFav ? '#C39A45' : '#ffffff',
        weight: isFav ? 3 : 1.5,
        fillOpacity: 0.92
      });
      marker.bindPopup(buildMosquePopupHTML(m, isVisited));
      marker.addTo(mosqueMarkersLayer);
      mosqueMarkersById[m.id] = marker;
    }
    function renderMosqueMapMarkers() {
      if (!leafletMapInstance || !mosqueMarkersLayer) return;
      mosqueMarkersLayer.clearLayers();
      mosqueMarkersById = {};
      const visitStats = computeMosqueVisitStats();
      let shownCount = 0;
      PRESET_MOSQUES.forEach(m => {
        if (!mosqueGeocodeCache[m.id]) return;
        if (!mosqueMatchesMapFilter(m, visitStats)) return;
        addOrUpdateMosqueMarker(m);
        shownCount++;
      });
      const emptyState = document.getElementById('mapEmptyState');
      if (emptyState) emptyState.classList.toggle('hidden', shownCount > 0 || isGeocodingMosques);
    }
    async function geocodeSingleMosque(m) {
      const query = m.mapsSearch || (m.name + ' ' + m.address);
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tr&q=${encodeURIComponent(query + ', Bursa, Türkiye')}`;
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (data && data[0]) {
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
      } catch (e) { /* sessizce geç */ }
      return null;
    }
    async function startGeocodingQueue() {
      if (isGeocodingMosques) return;
      const toGeocode = PRESET_MOSQUES.filter(m => !mosqueGeocodeCache[m.id]);
      const progressWrap = document.getElementById('mapGeocodeProgressWrap');
      const progressLabel = document.getElementById('mapGeocodeProgressLabel');
      const progressBar = document.getElementById('mapGeocodeProgressBar');

      if (toGeocode.length === 0) {
        if (progressWrap) progressWrap.classList.add('hidden');
        renderMosqueMapMarkers();
        return;
      }

      isGeocodingMosques = true;
      if (progressWrap) progressWrap.classList.remove('hidden');
      const total = toGeocode.length;
      let done = 0;
      if (progressLabel) progressLabel.textContent = `${done} / ${total}`;

      for (const m of toGeocode) {
        if (document.getElementById('mapModal').classList.contains('hidden')) break; // harita kapatıldıysa dur
        const coords = await geocodeSingleMosque(m);
        if (coords) {
          mosqueGeocodeCache[m.id] = coords;
          saveGeocodeCache();
          addOrUpdateMosqueMarker(m);
        }
        done++;
        if (progressLabel) progressLabel.textContent = `${done} / ${total}`;
        if (progressBar) progressBar.style.width = `${Math.round((done / total) * 100)}%`;
        await new Promise(r => setTimeout(r, 1100)); // Nominatim kullanım kurallarına uygun bekleme
      }

      isGeocodingMosques = false;
      if (progressWrap) progressWrap.classList.add('hidden');
      renderMosqueMapMarkers();
    }
    // ---- ZİYARET ROTASI (En Yakın Ziyaret Edilmemiş Camilerden Otomatik Rota) ----
    let routeMapInstance = null;
    let routeMarkersLayer = null;
    let routePolyline = null;
    let routeUserCoords = null;
    function haversineKm(a, b) {
      const R = 6371;
      const dLat = (b.lat - a.lat) * Math.PI / 180;
      const dLng = (b.lng - a.lng) * Math.PI / 180;
      const lat1 = a.lat * Math.PI / 180;
      const lat2 = b.lat * Math.PI / 180;
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
    }
    function populateRouteDistrictSelect() {
      const sel = document.getElementById('routeDistrictSelect');
      if (!sel || sel.options.length > 0) return;
      const districtOrder = ['Osmangazi', 'Yıldırım', 'Nilüfer', 'Mudanya', 'İznik', 'Gemlik', 'İnegöl', 'Orhangazi', 'Yenişehir', 'Karacabey', 'Mustafakemalpaşa', 'Kestel', 'Gürsu', 'Orhaneli', 'Keles', 'Büyükorhan', 'Harmancık'];
      const present = districtOrder.filter(d => PRESET_MOSQUES.some(m => m.district === d));
      sel.innerHTML = present.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
    }
    window.openRouteModal = function() {
      populateRouteDistrictSelect();
      document.getElementById('routeModal').classList.remove('hidden');
    };
    window.closeRouteModal = function() {
      document.getElementById('routeModal').classList.add('hidden');
    };
    // ---- YAKINIMDA NE VAR? (GPS Konumuna Göre En Yakın Camiler) ----
    window.openNearbyModal = function() {
      document.getElementById('nearbyModal').classList.remove('hidden');
    };
    window.closeNearbyModal = function() {
      document.getElementById('nearbyModal').classList.add('hidden');
    };
    function formatDistance(km) {
      if (km < 1) {
        const meters = Math.max(10, Math.round((km * 1000) / 10) * 10);
        return `${meters} metre`;
      }
      return `${km.toFixed(1)} km`;
    }
    // Kuş uçuşu mesafeden yürüyerek ve araçla gidiş için ayrı mesafe/süre tahmini üretir.
    // Gerçek yol ağı verimiz olmadığından, yollardaki dolambaçlanmayı yansıtan makul çarpanlar kullanılır.
    function estimateTravelInfo(straightKm) {
      const walkKm = straightKm * 1.2;   // yürüyüş yolları kuş uçuşuna göre biraz daha uzun olur
      const driveKm = straightKm * 1.35; // araç yolları genelde daha dolambaçlı olur
      const walkMin = Math.max(1, Math.round((walkKm / 5) * 60));   // ~5 km/s yürüyüş hızı
      const driveMin = Math.max(1, Math.round((driveKm / 28) * 60)); // ~28 km/s şehir içi ortalama hız
      return { walkKm, driveKm, walkMin, driveMin };
    }
    // Tek satırda yürüme (🚶) ve araç (🚗) mesafe/süresini yan yana gösteren metin üretir
    function formatDualDistanceInline(straightKm) {
      const info = estimateTravelInfo(straightKm);
      return `🚶 ${formatDistance(info.walkKm)} · ~${info.walkMin} dk &nbsp;·&nbsp; 🚗 ${formatDistance(info.driveKm)} · ~${info.driveMin} dk`;
    }
    function renderNearbyList(sortedMosques, visitStats) {
      const wrap = document.getElementById('nearbyList');
      wrap.innerHTML = sortedMosques.map(item => {
        const m = item.mosque;
        const isVisited = (visitStats[m.id] || 0) > 0;
        const info = estimateTravelInfo(item.km);
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.mapsSearch || (m.name + ' ' + m.address))}`;
        return `
          <div class="paper-card rounded-2xl p-3 flex items-center gap-3">
            <div class="flex flex-col items-center justify-center flex-shrink-0 gap-0.5" style="width:66px;">
              <span class="text-[10px] font-black font-ledger" style="color:var(--teal-700);">🚶 ${formatDistance(info.walkKm)}</span>
              <span class="text-[10px] font-black font-ledger" style="color:var(--gold-deep);">🚗 ${formatDistance(info.driveKm)}</span>
            </div>
            <div class="flex-1 min-w-0 cursor-pointer" onclick="closeNearbyModal(); openMosqueInfoModal('${m.id}');">
              <p class="text-xs font-bold truncate" style="color:var(--ink);">${escapeHtml(m.name)}</p>
              <p class="text-[10px] truncate" style="color:var(--ink-soft);">${escapeHtml(m.district)}</p>
              <p class="text-[9.5px] font-semibold mt-0.5" style="color:${isVisited ? '#1F7A65' : '#A85631'};"><i class="fa-solid ${isVisited ? 'fa-circle-check' : 'fa-circle-xmark'} mr-1"></i>${isVisited ? 'Ziyaret edildi' : 'Ziyaret edilmedi'}</p>
            </div>
            <a href="${mapUrl}" target="_blank" rel="noopener" class="icon-btn flex-shrink-0" style="background:var(--paper-deep); color:var(--teal-900);" title="Google'da Aç"><i class="fa-solid fa-arrow-up-right-from-square text-[11px]"></i></a>
          </div>
        `;
      }).join('');
    }
    window.startNearbySearch = async function() {
      const idleState = document.getElementById('nearbyIdleState');
      const loadingState = document.getElementById('nearbyLoadingState');
      const deniedState = document.getElementById('nearbyDeniedState');
      const content = document.getElementById('nearbyContent');
      const loadingLabel = document.getElementById('nearbyLoadingLabel');
      const loadingBar = document.getElementById('nearbyLoadingBar');

      idleState.classList.add('hidden');
      deniedState.classList.add('hidden');
      content.classList.add('hidden');
      loadingState.classList.remove('hidden');
      loadingLabel.textContent = 'Konumun belirleniyor…';
      loadingBar.style.width = '8%';

      const userLoc = await tryGetUserLocation();
      if (!userLoc) {
        loadingState.classList.add('hidden');
        deniedState.classList.remove('hidden');
        return;
      }

      const toGeocode = PRESET_MOSQUES.filter(m => !mosqueGeocodeCache[m.id]);
      if (toGeocode.length) {
        let done = 0;
        loadingLabel.textContent = `Cami konumları hazırlanıyor… (0 / ${toGeocode.length})`;
        for (const m of toGeocode) {
          if (document.getElementById('nearbyModal').classList.contains('hidden')) return; // modal kapatıldıysa dur
          const coords = await geocodeSingleMosque(m);
          if (coords) { mosqueGeocodeCache[m.id] = coords; saveGeocodeCache(); }
          done++;
          loadingLabel.textContent = `Cami konumları hazırlanıyor… (${done} / ${toGeocode.length})`;
          loadingBar.style.width = `${8 + Math.round((done / toGeocode.length) * 87)}%`;
          await new Promise(r => setTimeout(r, 1100));
        }
      } else {
        loadingBar.style.width = '95%';
      }

      const withCoords = PRESET_MOSQUES.filter(m => mosqueGeocodeCache[m.id]);
      if (withCoords.length === 0) {
        loadingState.classList.add('hidden');
        deniedState.classList.remove('hidden');
        showToast('Cami konumları alınamadı, lütfen tekrar dene.', 'error');
        return;
      }

      const distances = withCoords.map(m => ({ mosque: m, km: haversineKm(userLoc, mosqueGeocodeCache[m.id]) }));
      distances.sort((a, b) => a.km - b.km);
      const nearest = distances.slice(0, 15);

      const visitStats = computeMosqueVisitStats();
      loadingBar.style.width = '100%';
      renderNearbyList(nearest, visitStats);

      loadingState.classList.add('hidden');
      content.classList.remove('hidden');
    };
    // ---- BUGÜN BURSA'DA (Günlük Ziyaret Önerisi Kartı) ----
    let todaysSuggestedMosque = null;
    const LAST_SUGGESTED_MOSQUE_KEY = 'manevi-atlas-last-suggested-mosque';
    function loadLastSuggestedMosqueId() {
      try { return localStorage.getItem(LAST_SUGGESTED_MOSQUE_KEY); } catch (e) { return null; }
    }
    function saveLastSuggestedMosqueId(id) {
      try { localStorage.setItem(LAST_SUGGESTED_MOSQUE_KEY, id); } catch (e) {}
    }
    function pickTodayMosque() {
      const visitedIds = new Set(visitsData.map(v => v.mosqueId));
      const unvisited = PRESET_MOSQUES.filter(m => !visitedIds.has(m.id));
      let pool = unvisited.length ? unvisited : PRESET_MOSQUES;
      if (!pool.length) return null;

      // Her açılışta farklı bir öneri gelsin diye, mümkünse bir önceki
      // önerilen camiyi havuzdan geçici olarak çıkar.
      const lastId = loadLastSuggestedMosqueId();
      if (lastId && pool.length > 1) {
        const withoutLast = pool.filter(m => m.id !== lastId);
        if (withoutLast.length) pool = withoutLast;
      }

      const lastLoc = loadLastKnownLocation();
      let chosen = null;

      if (lastLoc) {
        const withCoords = pool.filter(m => mosqueGeocodeCache[m.id]);
        if (withCoords.length) {
          const byDistance = withCoords
            .map(m => ({ mosque: m, km: haversineKm(lastLoc, mosqueGeocodeCache[m.id]) }))
            .sort((a, b) => a.km - b.km)
            .slice(0, 5);
          chosen = byDistance[Math.floor(Math.random() * byDistance.length)].mosque;
        }
      }

      if (!chosen) chosen = pool[Math.floor(Math.random() * pool.length)];

      saveLastSuggestedMosqueId(chosen.id);
      return chosen;
    }
    async function fetchTodayWeather() {
      try {
        const cachedRaw = localStorage.getItem(WEATHER_CACHE_KEY);
        const today = todayDateStr();
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached.date === today) return cached;
        }
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${BURSA_CENTER[0]}&longitude=${BURSA_CENTER[1]}&current_weather=true`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.current_weather) return null;
        const result = { date: today, temp: Math.round(data.current_weather.temperature), code: data.current_weather.weathercode };
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(result));
        return result;
      } catch (e) { return null; }
    }
    function weatherCodeToIcon(code) {
      if (code === 0) return 'fa-sun';
      if (code <= 3) return 'fa-cloud-sun';
      if (code <= 48) return 'fa-smog';
      if (code <= 67) return 'fa-cloud-rain';
      if (code <= 77) return 'fa-snowflake';
      if (code <= 82) return 'fa-cloud-showers-heavy';
      if (code <= 99) return 'fa-cloud-bolt';
      return 'fa-cloud-sun';
    }
    async function renderDailySuggestionStats(mosque) {
      const statsGrid = document.getElementById('dailySuggestionStatsGrid');
      const locBtn = document.getElementById('dailySuggestionLocationBtn');
      const lastLoc = loadLastKnownLocation();

      if (!lastLoc) {
        statsGrid.classList.add('hidden');
        locBtn.classList.remove('hidden');
        return;
      }

      let coords = mosqueGeocodeCache[mosque.id];
      if (!coords) {
        coords = await geocodeSingleMosque(mosque);
        if (coords) { mosqueGeocodeCache[mosque.id] = coords; saveGeocodeCache(); }
      }

      if (!coords) {
        statsGrid.classList.add('hidden');
        locBtn.classList.add('hidden');
        return;
      }

      const km = haversineKm(lastLoc, coords);
      const info = estimateTravelInfo(km);
      document.getElementById('dailySuggestionDistance').textContent = `${formatDistance(info.walkKm)} · ~${info.walkMin} dk`;
      document.getElementById('dailySuggestionDuration').textContent = `${formatDistance(info.driveKm)} · ~${info.driveMin} dk`;
      statsGrid.classList.remove('hidden');
      locBtn.classList.add('hidden');
    }
    window.refreshDailySuggestionLocation = async function() {
      const locBtn = document.getElementById('dailySuggestionLocationBtn');
      const originalHTML = locBtn.innerHTML;
      locBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Konum alınıyor…</span>';
      const loc = await tryGetUserLocation();
      locBtn.innerHTML = originalHTML;
      if (!loc) {
        showToast('Konumun alınamadı, lütfen konum iznini kontrol et.', 'error');
        return;
      }
      if (todaysSuggestedMosque) renderDailySuggestionStats(todaysSuggestedMosque);
    };
    window.startTodayMosqueJourney = function() {
      if (!todaysSuggestedMosque) return;
      const m = todaysSuggestedMosque;
      activeJourney = {
        date: todayDateStr(),
        district: m.district,
        createdAt: new Date().toISOString(),
        stops: [{ mosqueId: m.id, name: m.name, address: m.address, done: false, doneAt: null }]
      };
      saveActiveJourney();
      renderJourneyBanner();
      openJourneyModal();
      showToast('Yolculuğun başladı, Allah kabul etsin!', 'success');
    };
    async function updateDailySuggestionCard() {
      const dateEl = document.getElementById('dailySuggestionDate');
      const nameEl = document.getElementById('dailySuggestionMosqueName');
      const noteEl = document.getElementById('dailySuggestionVisitedNote');
      const startBtn = document.getElementById('dailySuggestionStartBtn');
      const weatherWrap = document.getElementById('dailySuggestionWeather');

      dateEl.textContent = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

      const mosque = pickTodayMosque();
      todaysSuggestedMosque = mosque;

      if (!mosque) {
        nameEl.textContent = "Namaz kaydı ekledikçe size özel öneriler burada görüntülenecek.";
        noteEl.textContent = '';
        startBtn.classList.add('hidden');
        document.getElementById('dailySuggestionStatsGrid').classList.add('hidden');
        document.getElementById('dailySuggestionLocationBtn').classList.add('hidden');
        return;
      }

      nameEl.textContent = mosque.name;
      startBtn.classList.remove('hidden');

      const visitedToday = visitsData.some(v => v.mosqueId === mosque.id && v.date === todayDateStr());
      const visitedEver = visitsData.some(v => v.mosqueId === mosque.id);
      if (visitedToday) {
        noteEl.textContent = `Bugün ${mosque.name}'yi ziyaret ettiniz. Allah kabul etsin! ✓`;
        noteEl.style.color = '#1F7A65';
      } else if (visitedEver) {
        noteEl.textContent = `Bugün bu camiyi henüz ziyaret etmediniz.`;
        noteEl.style.color = 'var(--ink-soft)';
      } else {
        noteEl.textContent = `Henüz ziyaret etmediğiniz bir mabet — bugün ilk ziyaretin olabilir.`;
        noteEl.style.color = 'var(--ink-soft)';
      }

      renderDailySuggestionStats(mosque);

      fetchTodayWeather().then(w => {
        if (!w) return;
        weatherWrap.classList.remove('hidden');
        weatherWrap.style.display = 'flex';
        document.getElementById('dailySuggestionTemp').textContent = `${w.temp}°`;
        document.getElementById('dailySuggestionWeatherIcon').className = `fa-solid ${weatherCodeToIcon(w.code)} text-xs`;
      });
    }
    function saveLastKnownLocation(loc) {
      try { localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify({ lat: loc.lat, lng: loc.lng, ts: Date.now() })); } catch (e) {}
    }
    function loadLastKnownLocation() {
      try {
        const raw = localStorage.getItem(LAST_LOCATION_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    }
    function tryGetUserLocation() {
      return new Promise((resolve) => {
        if (!('geolocation' in navigator)) { resolve(null); return; }
        const timer = setTimeout(() => resolve(null), 6000);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timer);
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            saveLastKnownLocation(loc);
            resolve(loc);
          },
          () => { clearTimeout(timer); resolve(null); },
          { enableHighAccuracy: true, timeout: 5500, maximum: 60000 }
        );
      });
    }
    function buildNearestNeighborRoute(startPoint, stops) {
      const remaining = stops.slice();
      const ordered = [];
      let current = startPoint;
      while (remaining.length) {
        let bestIdx = 0, bestDist = Infinity;
        remaining.forEach((s, idx) => {
          const d = haversineKm(current, mosqueGeocodeCache[s.id]);
          if (d < bestDist) { bestDist = d; bestIdx = idx; }
        });
        const next = remaining.splice(bestIdx, 1)[0];
        ordered.push({ mosque: next, distFromPrev: bestDist });
        current = mosqueGeocodeCache[next.id];
      }
      return ordered;
    }
    function initRouteMap() {
      if (routeMapInstance || typeof L === 'undefined') return;
      routeMapInstance = L.map('routeMapContainer', { zoomControl: false, attributionControl: false }).setView(BURSA_CENTER, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(routeMapInstance);
      routeMarkersLayer = L.layerGroup().addTo(routeMapInstance);
    }
    function renderRouteOnMap(orderedStops, startPoint, hasRealUserLocation) {
      initRouteMap();
      setTimeout(() => routeMapInstance && routeMapInstance.invalidateSize(), 60);
      routeMarkersLayer.clearLayers();
      if (routePolyline) { routeMapInstance.removeLayer(routePolyline); routePolyline = null; }

      const latlngs = [];
      if (hasRealUserLocation) {
        const userIcon = L.divIcon({
          html: '<div style="width:16px;height:16px;border-radius:50%;background:#1F7A65;border:2.5px solid #fff;box-shadow:0 0 0 2px rgba(31,122,101,0.4);"></div>',
          className: '', iconSize: [16, 16], iconAnchor: [8, 8]
        });
        L.marker([startPoint.lat, startPoint.lng], { icon: userIcon }).addTo(routeMarkersLayer).bindPopup('Konumun');
        latlngs.push([startPoint.lat, startPoint.lng]);
      }

      orderedStops.forEach((stop, i) => {
        const coords = mosqueGeocodeCache[stop.mosque.id];
        const numIcon = L.divIcon({
          html: `<div style="width:24px;height:24px;border-radius:50% 50% 6px 6px;background:#8C6A22;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;font-family:'JetBrains Mono',monospace;box-shadow:0 2px 6px rgba(0,0,0,0.35);">${i + 1}</div>`,
          className: '', iconSize: [24, 24], iconAnchor: [12, 22]
        });
        L.marker([coords.lat, coords.lng], { icon: numIcon }).addTo(routeMarkersLayer).bindPopup(`<b>${i + 1}. ${escapeHtml(stop.mosque.name)}</b>`);
        latlngs.push([coords.lat, coords.lng]);
      });

      if (latlngs.length > 1) {
        routePolyline = L.polyline(latlngs, { color: '#C39A45', weight: 3.5, opacity: 0.85, dashArray: '1,8', lineCap: 'round' }).addTo(routeMapInstance);
        routeMapInstance.fitBounds(routePolyline.getBounds(), { padding: [28, 28] });
      } else if (latlngs.length === 1) {
        routeMapInstance.setView(latlngs[0], 15);
      }
    }
    function buildGoogleMapsRouteUrl(orderedStops, startPoint, hasRealUserLocation) {
      const coordsList = orderedStops.map(s => mosqueGeocodeCache[s.mosque.id]);
      const destination = coordsList[coordsList.length - 1];
      const waypoints = coordsList.slice(0, -1).map(c => `${c.lat},${c.lng}`).join('|');
      const params = new URLSearchParams();
      params.set('api', '1');
      params.set('destination', `${destination.lat},${destination.lng}`);
      params.set('travelmode', 'walking');
      if (waypoints) params.set('waypoints', waypoints);
      if (hasRealUserLocation) params.set('origin', `${startPoint.lat},${startPoint.lng}`);
      return `https://www.google.com/maps/dir/?${params.toString()}`;
    }
    function renderRouteStopsList(orderedStops) {
      const wrap = document.getElementById('routeStopsList');
      wrap.innerHTML = orderedStops.map((stop, i) => {
        const m = stop.mosque;
        const info = estimateTravelInfo(stop.distFromPrev);
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.mapsSearch || (m.name + ' ' + m.address))}`;
        return `
          <div class="paper-card rounded-2xl p-3 flex items-start gap-3">
            <div class="arch-badge flex-shrink-0" style="width:26px; height:26px; background:#DC2626; color:#fff; font-size:11px; font-weight:800; font-family:'JetBrains Mono',monospace;">${i + 1}</div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold truncate" style="color:var(--ink);">${escapeHtml(m.name)}</p>
              <p class="text-[10px] truncate" style="color:var(--ink-soft);">${escapeHtml(m.address)}</p>
              <p class="text-[9.5px] font-semibold mt-0.5" style="color:var(--ink-faint);">${i === 0 ? 'Başlangıçtan' : 'Önceki duraktan'}</p>
              <p class="text-[9.5px] font-semibold mt-0.5" style="color:var(--gold-deep);">🚶 ${formatDistance(info.walkKm)} · ~${info.walkMin} dk &nbsp;·&nbsp; 🚗 ${formatDistance(info.driveKm)} · ~${info.driveMin} dk</p>
            </div>
            <a href="${mapUrl}" target="_blank" rel="noopener" class="icon-btn flex-shrink-0" style="background:var(--paper-deep); color:var(--teal-900);" title="Google'da Aç"><i class="fa-solid fa-arrow-up-right-from-square text-[11px]"></i></a>
          </div>
        `;
      }).join('');
    }
    window.generateVisitRoute = async function() {
      const district = document.getElementById('routeDistrictSelect').value;
      const stopCount = parseInt(document.getElementById('routeStopCountSelect').value, 10);
      if (!district) return;

      const visitedIds = new Set(visitsData.map(v => v.mosqueId));
      let candidates = PRESET_MOSQUES.filter(m => m.district === district && !visitedIds.has(m.id));

      if (candidates.length === 0) {
        showToast(`${district} ilçesinde ziyaret etmediğin cami kalmamış! 🎉`, 'success');
        return;
      }

      document.getElementById('routeEmptyState').classList.add('hidden');
      document.getElementById('routeContent').classList.add('hidden');
      document.getElementById('routeLoadingState').classList.remove('hidden');
      document.getElementById('routeStartJourneyBtn').classList.add('hidden');
      document.getElementById('routeGenerateBtn').disabled = true;
      const loadingLabel = document.getElementById('routeLoadingLabel');
      const loadingBar = document.getElementById('routeLoadingBar');
      loadingLabel.textContent = 'Konumun belirleniyor…';
      loadingBar.style.width = '10%';

      const userLoc = await tryGetUserLocation();
      const hasRealUserLocation = !!userLoc;
      routeUserCoords = userLoc;
      const startPoint = userLoc || mosqueGeocodeCache[candidates[0].id] || { lat: BURSA_CENTER[0], lng: BURSA_CENTER[1] };

      // Başlangıç noktasına göre en yakın adaylar önce gelsin (henüz konumu olmayanlar dahil edilecek şekilde geocode sırası da öncelikli olsun)
      const toGeocode = candidates.filter(m => !mosqueGeocodeCache[m.id]);
      if (toGeocode.length) {
        loadingLabel.textContent = `Cami konumları belirleniyor… (0 / ${toGeocode.length})`;
        let done = 0;
        for (const m of toGeocode) {
          const coords = await geocodeSingleMosque(m);
          if (coords) { mosqueGeocodeCache[m.id] = coords; saveGeocodeCache(); }
          done++;
          loadingLabel.textContent = `Cami konumları belirleniyor… (${done} / ${toGeocode.length})`;
          loadingBar.style.width = `${10 + Math.round((done / toGeocode.length) * 80)}%`;
          await new Promise(r => setTimeout(r, 1100));
        }
      } else {
        loadingBar.style.width = '90%';
      }

      candidates = candidates.filter(m => mosqueGeocodeCache[m.id]);
      if (candidates.length === 0) {
        document.getElementById('routeLoadingState').classList.add('hidden');
        document.getElementById('routeEmptyState').classList.remove('hidden');
        document.getElementById('routeGenerateBtn').disabled = false;
        showToast('Cami konumları alınamadı, lütfen tekrar dene.', 'error');
        return;
      }

      candidates.sort((a, b) => haversineKm(startPoint, mosqueGeocodeCache[a.id]) - haversineKm(startPoint, mosqueGeocodeCache[b.id]));
      const pool = candidates.slice(0, Math.max(stopCount * 2, stopCount));
      const chosen = pool.slice(0, Math.min(stopCount, pool.length));

      const orderedStops = buildNearestNeighborRoute(startPoint, chosen);
      const totalKm = orderedStops.reduce((sum, s) => sum + s.distFromPrev, 0);

      loadingBar.style.width = '100%';
      document.getElementById('routeLoadingState').classList.add('hidden');
      document.getElementById('routeContent').classList.remove('hidden');
      document.getElementById('routeGenerateBtn').disabled = false;

      const totalInfo = estimateTravelInfo(totalKm);
      document.getElementById('routeTotalDistanceWalk').textContent = `🚶 ${formatDistance(totalInfo.walkKm)} · ~${totalInfo.walkMin} dk`;
      document.getElementById('routeTotalDistanceDrive').textContent = `🚗 ${formatDistance(totalInfo.driveKm)} · ~${totalInfo.driveMin} dk`;
      document.getElementById('routeGoogleMapsLink').href = buildGoogleMapsRouteUrl(orderedStops, startPoint, hasRealUserLocation);
      renderRouteStopsList(orderedStops);
      renderRouteOnMap(orderedStops, startPoint, hasRealUserLocation);
      lastGeneratedRoute = { district, orderedStops };
      document.getElementById('routeStartJourneyBtn').classList.remove('hidden');

      if (!hasRealUserLocation) {
        showToast('Konumuna ulaşılamadı, en yakın camiden başlayan bir rota oluşturuldu.', 'success');
      }
    };
    // ---- MANEVİ YOLCULUK MODU (Bugünkü Rota İçin Ziyaret Kontrol Listesi) ----
    const JOURNEY_KEY = 'manevi-atlas-active-journey';
    let activeJourney = null;
    let lastGeneratedRoute = null;
    function todayDateStr() {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    function loadActiveJourney() {
      try {
        const raw = localStorage.getItem(JOURNEY_KEY);
        activeJourney = raw ? JSON.parse(raw) : null;
      } catch (e) { activeJourney = null; }
    }
    function saveActiveJourney() {
      try {
        if (activeJourney) localStorage.setItem(JOURNEY_KEY, JSON.stringify(activeJourney));
        else localStorage.removeItem(JOURNEY_KEY);
      } catch (e) {}
    }
    window.startJourneyFromRoute = function() {
      if (!lastGeneratedRoute) return;
      activeJourney = {
        date: todayDateStr(),
        district: lastGeneratedRoute.district,
        createdAt: new Date().toISOString(),
        stops: lastGeneratedRoute.orderedStops.map(s => ({
          mosqueId: s.mosque.id,
          name: s.mosque.name,
          address: s.mosque.address,
          done: false,
          doneAt: null
        }))
      };
      saveActiveJourney();
      closeRouteModal();
      renderJourneyBanner();
      openJourneyModal();
      showToast('Yolculuğun başladı, Allah kabul etsin!', 'success');
    };
    function renderJourneyBanner() {
      const card = document.getElementById('journeyBannerCard');
      if (!card) return;
      if (!activeJourney || !activeJourney.stops.length) { card.classList.add('hidden'); return; }
      const total = activeJourney.stops.length;
      const done = activeJourney.stops.filter(s => s.done).length;
      card.classList.remove('hidden');
      document.getElementById('journeyBannerLabel').textContent = `${done}/${total}`;
      document.getElementById('journeyBannerBar').style.width = `${total ? Math.round((done / total) * 100) : 0}%`;
    }
    window.openJourneyModal = function() {
      document.getElementById('journeyModal').classList.remove('hidden');
      renderJourneyChecklist();
    };
    window.closeJourneyModal = function() {
      document.getElementById('journeyModal').classList.add('hidden');
    };
    function getMosqueMapUrl(mosqueId, fallbackName, fallbackAddress) {
      const m = PRESET_MOSQUES.find(x => x.id === mosqueId);
      const query = (m && m.mapsSearch) || `${fallbackName || (m && m.name) || ''} ${fallbackAddress || (m && m.address) || ''}`;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }
    function renderJourneyChecklist() {
      const emptyState = document.getElementById('journeyEmptyState');
      const footer = document.getElementById('journeyFooter');
      const list = document.getElementById('journeyStopsList');
      const subtitle = document.getElementById('journeySubtitle');

      if (!activeJourney || !activeJourney.stops.length) {
        emptyState.classList.remove('hidden');
        footer.classList.add('hidden');
        list.innerHTML = '';
        subtitle.textContent = 'Uygulama sana rehberlik eder';
        return;
      }

      emptyState.classList.add('hidden');
      footer.classList.remove('hidden');
      subtitle.textContent = `${activeJourney.district} · Bugünkü Rota`;

      const journeyMapBtn = document.getElementById('journeyMapBtn');
      const nextStop = activeJourney.stops.find(s => !s.done);
      if (nextStop) {
        journeyMapBtn.href = getMosqueMapUrl(nextStop.mosqueId, nextStop.name, nextStop.address);
        journeyMapBtn.classList.remove('hidden');
        journeyMapBtn.style.display = 'flex';
      } else {
        journeyMapBtn.classList.add('hidden');
      }

      list.innerHTML = activeJourney.stops.map(stop => `
        <div class="paper-card w-full rounded-2xl p-3 flex items-center gap-3 ${stop.done ? 'opacity-70' : ''}">
          <button onclick="toggleJourneyStop('${stop.mosqueId}')" class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style="background:${stop.done ? 'var(--teal-900)' : 'var(--paper-deep)'}; border:1.5px solid ${stop.done ? 'var(--teal-900)' : 'var(--line)'};">
            ${stop.done ? '<i class="fa-solid fa-check text-[11px]" style="color:#fff;"></i>' : ''}
          </button>
          <button onclick="toggleJourneyStop('${stop.mosqueId}')" class="flex-1 min-w-0 text-left">
            <p class="text-xs font-bold truncate ${stop.done ? 'line-through' : ''}" style="color:var(--ink);">${escapeHtml(stop.name)}</p>
            <p class="text-[10px] truncate" style="color:var(--ink-faint);">${escapeHtml(stop.address)}</p>
          </button>
          ${stop.done ? '<span class="text-[9px] font-bold flex-shrink-0" style="color:var(--teal-700);">Namaz Kılındı</span>' : `
          <a href="${getMosqueMapUrl(stop.mosqueId, stop.name, stop.address)}" target="_blank" rel="noopener" class="icon-btn flex-shrink-0" style="background:var(--paper-deep); color:var(--teal-900); width:30px; height:30px;" title="Haritada Aç">
            <i class="fa-solid fa-diamond-turn-right text-[12px]"></i>
          </a>`}
        </div>
      `).join('');

      const total = activeJourney.stops.length;
      const done = activeJourney.stops.filter(s => s.done).length;
      const perc = total ? Math.round((done / total) * 100) : 0;
      document.getElementById('journeyProgressLabel').textContent = `${done}/${total}`;
      document.getElementById('journeyProgressBar').style.width = `${perc}%`;
      document.getElementById('journeyProgressPercent').textContent = `%${perc} tamamlandı`;

      if (done === total) {
        document.getElementById('journeyProgressPercent').textContent = `🎉 %${perc} tamamlandı — Rota bitti!`;
      }
    }
    window.toggleJourneyStop = async function(mosqueId) {
      if (!activeJourney) return;
      const stop = activeJourney.stops.find(s => s.mosqueId === mosqueId);
      if (!stop) return;

      const wasDone = stop.done;
      stop.done = !stop.done;
      stop.doneAt = stop.done ? new Date().toISOString() : null;
      saveActiveJourney();
      renderJourneyChecklist();
      renderJourneyBanner();

      window.haptic(stop.done ? [10, 40, 10] : 8);

      // Yeni işaretlenen durak için, bugüne ait bir kayıt yoksa deftere otomatik kısa bir ziyaret notu düşülür
      if (!wasDone && stop.done) {
        const today = todayDateStr();
        const alreadyLogged = visitsData.some(v => v.mosqueId === mosqueId && v.date === today);
        if (!alreadyLogged) {
          const mosque = PRESET_MOSQUES.find(m => m.id === mosqueId);
          const now = new Date();
          const record = {
            id: "v-" + Date.now(),
            mosqueId,
            mosqueName: stop.name,
            district: mosque ? mosque.district : (activeJourney.district || ''),
            prayerTime: '',
            address: stop.address || '',
            date: today,
            time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            notes: 'Manevi Yolculuk Modu ile kaydedildi.',
            photos: [],
            createdAt: now.toISOString()
          };
          visitsData.push(record);
          sortVisitsInMemory();
          const ok = await persistNewVisit(record);
          if (ok) triggerAllUIUpdates();
          else visitsData = visitsData.filter(v => v.id !== record.id);
        }
      }

      const total = activeJourney.stops.length;
      const done = activeJourney.stops.filter(s => s.done).length;
      if (done === total && !wasDone) {
        showToast('Bugünkü yolculuğunu tamamladın! Allah kabul etsin. 🌙', 'success');
      }
    };
    window.endJourney = function() {
      if (!activeJourney) { closeJourneyModal(); return; }
      const total = activeJourney.stops.length;
      const done = activeJourney.stops.filter(s => s.done).length;
      const msg = done < total
        ? `Yolculuğu sonlandırmak istediğine emin misin? (${done}/${total} tamamlandı)`
        : 'Tebrikler, yolculuğunu tamamladın! Kaydı kapatalım mı?';
      if (!confirm(msg)) return;
      activeJourney = null;
      saveActiveJourney();
      renderJourneyBanner();
      closeJourneyModal();
    };
