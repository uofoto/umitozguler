// mosque-select-search.js
// "Cami / Mescid Seçimi" dropdown'ına arama kutusu ve ilçe bazlı renklendirme
// ekler. Mevcut #formMosqueSelect elemanına ve onu dolduran
// populateMosquesDropdown() fonksiyonuna DOKUNMAZ; onun ÜZERİNE, ayrı bir
// katman olarak inşa edilir. Böylece formun kaydetme/doğrulama mantığı
// (required, onchange="toggleCustomMosqueInput()", handleVisitSubmit vb.)
// hiç değişmeden çalışmaya devam eder.
//
// Çalışma mantığı:
// 1) Gerçek <select id="formMosqueSelect"> görsel olarak ekrandan gizlenir
//    ama DOM'da kalır (form doğrulaması / mevcut kod onu okumaya devam eder).
// 2) Onun yerine tıklanabilir bir "tetikleyici" kutu + açılır panel (arama
//    inputu + gruplanmış/renkli sonuç listesi) oluşturulur.
// 3) Bir seçenek tıklanınca gerçek select'in value'su güncellenir ve
//    'change' event'i tetiklenir (uygulamanın geri kalanı bunu bekliyor).
// 4) populateMosquesDropdown() her çağrıldığında (cami eklenince, silinince,
//    yedek içe aktarılınca vb.) panel de otomatik güncellensin diye bu
//    fonksiyon "sarmalanır" (monkey-patch): önce orijinali çalışır, sonra
//    bizim panelimiz yeniden inşa edilir.

(function () {
  'use strict';

  // İlçeler için birbirinden ayırt edilebilir, uygulamanın renk paletiyle
  // uyumlu bir dizi renk. Sırayla, karşılaşılan her yeni ilçeye bir sonraki
  // renk atanır; böylece bir ilçeden diğerine geçildiğinde göz farkı olur.
  var DISTRICT_COLORS = [
    '#155A4C', // teal
    '#A85631', // brick
    '#8C6A22', // gold-deep
    '#2F6690', // mavi
    '#7A3C6B', // mor
    '#4B7F52', // yeşil
    '#B0473E', // kiremit kırmızısı
    '#5C6BC0', // indigo
    '#8D6E63', // kahve
    '#3E8E7E', // deniz yeşili
    '#C2793A', // turuncu-kahve
    '#6B4E9E'  // eflatun
  ];

  function turkishLower(str) {
    return (str || '')
      .replace(/İ/g, 'i')
      .replace(/I/g, 'ı')
      .toLocaleLowerCase('tr-TR');
  }

  function initMosqueSearchableSelect() {
    var select = document.getElementById('formMosqueSelect');
    if (!select) return;

    if (select.dataset.searchableInit === '1') {
      // Zaten kurulmuş; sadece panel içeriğini ve etiketi tazele.
      var existingWrap = select._searchWrap;
      if (existingWrap) {
        existingWrap._updateTriggerLabel();
        if (!existingWrap._panelEl.classList.contains('hidden')) {
          existingWrap._render(existingWrap._searchInputEl.value);
        }
      }
      return;
    }
    select.dataset.searchableInit = '1';
    select.classList.add('mosque-native-select-hidden');
    select.setAttribute('aria-hidden', 'true');
    select.setAttribute('tabindex', '-1');

    var wrap = document.createElement('div');
    wrap.className = 'mosque-select-wrap';
    select.parentNode.insertBefore(wrap, select.nextSibling);
    select._searchWrap = wrap;

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'field w-full rounded-xl px-3 py-2.5 text-xs mosque-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.innerHTML =
      '<span class="mosque-select-trigger-label mosque-select-placeholder">-- Cami Seçin --</span>' +
      '<i class="fa-solid fa-chevron-down mosque-select-trigger-icon"></i>';
    wrap.appendChild(trigger);

    var panel = document.createElement('div');
    panel.className = 'mosque-select-panel hidden';
    panel.innerHTML =
      '<div class="mosque-select-search-box">' +
        '<i class="fa-solid fa-magnifying-glass"></i>' +
        '<input type="text" class="mosque-select-search-input" placeholder="Cami veya mescid adı ara..." autocomplete="off">' +
      '</div>' +
      '<div class="mosque-select-results"></div>';
    wrap.appendChild(panel);

    var searchInput = panel.querySelector('.mosque-select-search-input');
    var resultsEl = panel.querySelector('.mosque-select-results');
    var triggerLabel = trigger.querySelector('.mosque-select-trigger-label');

    wrap._panelEl = panel;
    wrap._searchInputEl = searchInput;

    // Uygulamanın başka yerlerinde (örn. bir kaydı düzenlerken) doğrudan
    // `select.value = '...'` şeklinde programatik atama yapılabiliyor. Bu
    // durumlarda da tetikleyicideki etiketin güncel kalması için 'value'
    // özelliğini bu select örneğine özel olarak sarmalıyoruz.
    var proto = HTMLSelectElement.prototype;
    var desc = Object.getOwnPropertyDescriptor(proto, 'value');
    try {
      Object.defineProperty(select, 'value', {
        configurable: true,
        get: function () { return desc.get.call(select); },
        set: function (v) { desc.set.call(select, v); updateTriggerLabel(); }
      });
    } catch (e) { /* sessizce yok say, sadece görsel senkron kaybolur */ }

    function districtColor(name) {
      if (!wrap._colorMap) wrap._colorMap = {};
      if (!wrap._colorMap[name]) {
        var used = Object.keys(wrap._colorMap).length;
        wrap._colorMap[name] = DISTRICT_COLORS[used % DISTRICT_COLORS.length];
      }
      return wrap._colorMap[name];
    }

    function collectData() {
      var groups = [];
      var customOption = null;
      Array.prototype.forEach.call(select.children, function (node) {
        if (node.tagName === 'OPTGROUP') {
          var label = node.getAttribute('label') || '';
          var name = label.replace(/\s*\(\d+\)\s*$/, '').trim();
          var opts = Array.prototype.map.call(node.querySelectorAll('option'), function (o) {
            return { id: o.value, name: o.textContent };
          });
          groups.push({ district: name, options: opts });
        } else if (node.tagName === 'OPTION') {
          if (!node.value) return; // "-- Cami Seçin --" placeholder
          customOption = { id: node.value, name: node.textContent };
        }
      });
      return { groups: groups, customOption: customOption };
    }

    function updateTriggerLabel() {
      var opt = select.options[select.selectedIndex];
      if (opt && opt.value) {
        triggerLabel.textContent = opt.textContent;
        triggerLabel.classList.remove('mosque-select-placeholder');
      } else {
        triggerLabel.textContent = '-- Cami Seçin --';
        triggerLabel.classList.add('mosque-select-placeholder');
      }
    }

    function selectMosque(id) {
      desc.set.call(select, id);
      select.dispatchEvent(new Event('change', { bubbles: true }));
      updateTriggerLabel();
      closePanel();
      trigger.focus();
    }

    function render(filterText) {
      var data = collectData();
      var q = turkishLower((filterText || '').trim());
      var html = '';
      var anyResult = false;

      data.groups.forEach(function (g) {
        var filteredOpts = q
          ? g.options.filter(function (o) { return turkishLower(o.name).indexOf(q) !== -1; })
          : g.options;
        if (!filteredOpts.length) return;
        anyResult = true;
        var color = districtColor(g.district);
        html += '<div class="mosque-select-group" style="--district-color:' + color + '">' +
          '<div class="mosque-select-group-label">' +
            '<span class="mosque-select-group-dot"></span>' +
            escapeHtmlLocal(g.district) +
            ' <span class="mosque-select-group-count">(' + filteredOpts.length + ')</span>' +
          '</div>';
        filteredOpts.forEach(function (o) {
          html += '<div class="mosque-select-option" data-id="' + escapeAttrLocal(o.id) + '">' +
            '<span class="mosque-select-option-dot"></span>' + escapeHtmlLocal(o.name) +
          '</div>';
        });
        html += '</div>';
      });

      if (!anyResult) {
        html += '<div class="mosque-select-empty">' +
          (q ? '"' + escapeHtmlLocal(filterText) + '" ile eşleşen cami bulunamadı.' : 'Sonuç bulunamadı.') +
        '</div>';
      }

      if (data.customOption) {
        html += '<div class="mosque-select-group mosque-select-custom-group">' +
          '<div class="mosque-select-option mosque-select-custom-option" data-id="' + escapeAttrLocal(data.customOption.id) + '">' +
            '<i class="fa-solid fa-plus"></i> ' + escapeHtmlLocal(data.customOption.name) +
          '</div>' +
        '</div>';
      }

      resultsEl.innerHTML = html;
      Array.prototype.forEach.call(resultsEl.querySelectorAll('.mosque-select-option'), function (row) {
        row.addEventListener('click', function () { selectMosque(row.getAttribute('data-id')); });
      });
    }

    function escapeHtmlLocal(str) {
      var div = document.createElement('div');
      div.textContent = str == null ? '' : String(str);
      return div.innerHTML;
    }
    function escapeAttrLocal(str) {
      return escapeHtmlLocal(str).replace(/"/g, '&quot;');
    }

    function openPanel() {
      panel.classList.remove('hidden');
      trigger.classList.add('open');
      searchInput.value = '';
      render('');
      setTimeout(function () { searchInput.focus(); }, 0);
      document.addEventListener('mousedown', onOutsideClick);
      document.addEventListener('keydown', onKeyDown);
    }
    function closePanel() {
      panel.classList.add('hidden');
      trigger.classList.remove('open');
      document.removeEventListener('mousedown', onOutsideClick);
      document.removeEventListener('keydown', onKeyDown);
    }
    function onOutsideClick(e) {
      if (!wrap.contains(e.target)) closePanel();
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') { closePanel(); trigger.focus(); }
    }

    trigger.addEventListener('click', function () {
      if (panel.classList.contains('hidden')) openPanel(); else closePanel();
    });

    var debounceTimer = null;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      var v = searchInput.value;
      debounceTimer = setTimeout(function () { render(v); }, 80);
    });

    wrap._render = render;
    wrap._updateTriggerLabel = updateTriggerLabel;
    updateTriggerLabel();
  }

  // populateMosquesDropdown() her çağrıldığında panelimizi de tazeleyelim.
  if (typeof window.populateMosquesDropdown === 'function') {
    var originalPopulate = window.populateMosquesDropdown;
    window.populateMosquesDropdown = function () {
      var result = originalPopulate.apply(this, arguments);
      initMosqueSearchableSelect();
      return result;
    };
  }

  document.addEventListener('DOMContentLoaded', initMosqueSearchableSelect);
})();
