// notes-autocomplete.js
// "Seyyah Notları / Tefekkür" alanı (#formNotes) için:
//  1) Alan yazdıkça kendiliğinden uzar (mobilde rahat yazım).
//  2) Yazarken kelime tamamlama önerileri sunar. Öneriler, kullanıcının daha
//     önce kayıtlarına yazdığı kelimelerden (sık kullanılanlar önde) ve
//     yerleşik bir manevi/dua kelime listesinden gelir. Hepsi cihazda çalışır,
//     hiçbir veri dışarı gönderilmez.
// Mevcut form mantığına (handleVisitSubmit, düzenleme modu vb.) dokunmaz;
// yalnızca textarea'nın üstüne ayrı bir katman ekler.

(function () {
  'use strict';

  var BUILTIN = [
    'Allah', 'Allah’ım', 'Rabbim', 'Rabbime', 'Rabbimizin', 'Resulullah', 'Peygamber', 'Efendimiz',
    'şükür', 'şükrettim', 'hamdolsun', 'elhamdülillah', 'subhanallah', 'maşallah', 'inşallah', 'bismillah',
    'dua', 'dualar', 'duamı', 'dua ettim', 'duaya', 'âmin', 'tövbe', 'istiğfar', 'af', 'mağfiret', 'rahmet', 'merhamet',
    'huzur', 'huzurlu', 'huzurla', 'sükûnet', 'sükunet', 'sekinet', 'gönül', 'gönlüm', 'gönlümde', 'kalbim', 'kalbimde',
    'hissiyat', 'hissettim', 'hissettiğim', 'duygulandım', 'duygusal', 'gözlerim', 'doldu', 'ağladım', 'hüzün', 'hüzünlü',
    'sevinç', 'mutlu', 'mutluluk', 'ferahlık', 'ferahladım', 'rahatladım', 'iç huzuru', 'derin', 'derinden',
    'cami', 'camii', 'mescit', 'mihrap', 'minber', 'minare', 'kubbe', 'avlu', 'şadırvan', 'abdest', 'abdesthane',
    'cemaat', 'cemaatle', 'imam', 'müezzin', 'ezan', 'ezanı', 'kamet', 'hutbe', 'vaaz', 'sohbet', 'zikir', 'tesbih',
    'namaz', 'namazı', 'namazdan', 'sabah', 'öğle', 'ikindi', 'akşam', 'yatsı', 'cuma', 'cumaya', 'teravih', 'teheccüd',
    'kıraat', 'tilavet', 'Kur’an', 'Kur’an-ı Kerim', 'okudum', 'okundu', 'sure', 'âyet', 'yasin', 'fatiha', 'ihlas', 'ayetel kürsi',
    'secde', 'secdeye', 'rükû', 'kıyam', 'kunut', 'selam', 'salavat', 'salât', 'ibadet', 'ibadetle', 'huşu', 'huşuyla', 'huşu içinde',
    'manevi', 'maneviyat', 'ruhani', 'ruhum', 'ruhumu', 'nur', 'nurlu', 'berekâtlı', 'bereket', 'mübarek', 'kutsal', 'tarihi', 'tarih',
    'Osmanlı', 'Selçuklu', 'mimari', 'mimarisi', 'hat', 'hattat', 'çini', 'taş', 'ahşap', 'işleme', 'süsleme', 'kandil', 'halı', 'serin',
    'sessiz', 'sessizlik', 'sakin', 'sakinlik', 'kalabalık', 'kalabalıktı', 'tenha', 'ıssız', 'güzel', 'güzeldi', 'muhteşem', 'etkileyici',
    'ziyaret', 'ziyaretçi', 'ziyaret ettim', 'ziyaretimiz', 'ailemle', 'ailece', 'arkadaşlarımla', 'eşimle', 'çocuklarımla', 'annemle', 'babamla',
    'Allah razı olsun', 'Allah kabul etsin', 'Allah rahmet eylesin', 'Allah’a emanet', 'Allah’ıma şükürler olsun',
    'türbe', 'türbeyi', 'ziyaret ettik', 'fatiha okudum', 'ruhuna', 'ruhuna fatiha', 'vefat', 'rahmetli', 'geçmişlerimiz', 'annem', 'babam', 'dedem', 'ninem',
    'memleketim', 'Bursa', 'Bursa’nın', 'şehir', 'şehrin', 'kalbi', 'vatan', 'millet', 'ümmet', 'İslam', 'Müslüman', 'kardeşlik',
    'sağlık', 'şifa', 'afiyet', 'hidayet', 'iman', 'takva', 'sabır', 'tevekkül', 'kanaat', 'ihlas', 'samimiyet', 'sevgi', 'muhabbet',
    'dilek', 'niyet', 'niyaz', 'temenni', 'arzu', 'hayırlı', 'hayırlara', 'kolaylık', 'kolaylaştır', 'bağışla', 'yardım', 'inayet', 'lütuf'
  ];

  var STARTERS = [
    'Allah’a şükürler olsun, ',
    'Gönlüm huzurla doldu, ',
    'Cemaatle namaz kıldık, ',
    'Rabbim kabul etsin, ',
    'Bu mübarek mekânda ',
    'Dualarımda '
  ];

  var MAX_SUGGEST = 6;
  var MIN_PREFIX = 2;

  function trLower(s) { return (s || '').toLocaleLowerCase('tr'); }
  function trUpperFirst(s) { return s ? s.charAt(0).toLocaleUpperCase('tr') + s.slice(1) : s; }

  var userWords = [];     // [{w, n}] sık kullanıma göre sıralı
  var builtin = BUILTIN.map(function (w) { return { w: w, k: trLower(w) }; });

  function rebuildUserWords() {
    var counts = Object.create(null);
    try {
      var list = (typeof visitsData !== 'undefined' && Array.isArray(visitsData)) ? visitsData : [];
      list.forEach(function (v) {
        if (!v || !v.notes) return;
        var parts = String(v.notes).split(/[^\p{L}’'\-]+/u);
        for (var i = 0; i < parts.length; i++) {
          var w = parts[i].replace(/^[’'\-]+|[’'\-]+$/g, '');
          if (w.length < 4 || w.length > 30) continue;
          var key = trLower(w);
          if (!counts[key]) counts[key] = { w: w, n: 0 };
          counts[key].n++;
          // Küçük harfli kullanımı tercih et (cümle başı büyük harfini değil)
          if (w === key) counts[key].w = w;
        }
      });
    } catch (e) { /* sessizce geç */ }
    userWords = Object.keys(counts).map(function (k) { return { w: counts[k].w, k: k, n: counts[k].n }; })
      .sort(function (a, b) { return b.n - a.n; });
  }

  function currentWord(ta) {
    var pos = ta.selectionStart;
    var before = ta.value.slice(0, pos);
    var m = before.match(/[\p{L}’'\-]+$/u);
    return { text: m ? m[0] : '', start: m ? pos - m[0].length : pos, end: pos };
  }

  function suggest(prefixRaw) {
    var p = trLower(prefixRaw);
    var out = [], seen = Object.create(null);
    function push(item) {
      if (out.length >= MAX_SUGGEST) return;
      if (item.k === p || seen[item.k]) return;
      seen[item.k] = 1;
      out.push(item.w);
    }
    userWords.forEach(function (it) { if (it.k.indexOf(p) === 0) push(it); });
    builtin.forEach(function (it) { if (it.k.indexOf(p) === 0) push(it); });
    var capitalized = prefixRaw.charAt(0) !== trLower(prefixRaw.charAt(0));
    return out.map(function (w) {
      return (capitalized && w.charAt(0) === trLower(w.charAt(0))) ? trUpperFirst(w) : w;
    });
  }

  function init() {
    var ta = document.getElementById('formNotes');
    if (!ta || ta.dataset.acReady) return;
    ta.dataset.acReady = '1';

    // Klavye / tarayıcı ipuçları
    ta.setAttribute('lang', 'tr');
    ta.setAttribute('spellcheck', 'true');
    ta.setAttribute('autocapitalize', 'sentences');
    ta.setAttribute('autocorrect', 'on');
    ta.setAttribute('enterkeyhint', 'enter');

    var bar = document.createElement('div');
    bar.id = 'notesSuggestBar';
    bar.className = 'notes-suggest-bar hidden';
    bar.setAttribute('role', 'listbox');
    bar.setAttribute('aria-label', 'Kelime önerileri');
    ta.parentNode.insertBefore(bar, ta.nextSibling);

    function autoGrow() {
      ta.style.height = 'auto';
      var max = Math.round(window.innerHeight * 0.55);
      ta.style.height = Math.min(Math.max(ta.scrollHeight + 2, 144), max) + 'px';
      ta.style.overflowY = ta.scrollHeight + 2 > max ? 'auto' : 'hidden';
    }

    function hideBar() { bar.classList.add('hidden'); bar.innerHTML = ''; }

    function render(items, mode) {
      if (!items.length) { hideBar(); return; }
      bar.innerHTML = '';
      items.forEach(function (text) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'notes-suggest-chip';
        b.textContent = mode === 'starter' ? text.replace(/[,\s]+$/, '') : text;
        b.setAttribute('role', 'option');
        // Odağı textarea'dan kaçırmamak için (klavye kapanmasın):
        b.addEventListener('mousedown', function (e) { e.preventDefault(); });
        b.addEventListener('touchstart', function (e) { e.preventDefault(); apply(text, mode); }, { passive: false });
        b.addEventListener('click', function () { apply(text, mode); });
        bar.appendChild(b);
      });
      bar.classList.remove('hidden');
      bar.scrollLeft = 0;
    }

    function apply(text, mode) {
      var val = ta.value;
      if (mode === 'starter') {
        var pos0 = ta.selectionStart;
        ta.value = val.slice(0, pos0) + text + val.slice(ta.selectionEnd);
        var np0 = pos0 + text.length;
        ta.setSelectionRange(np0, np0);
      } else {
        var cw = currentWord(ta);
        var ins = text + ' ';
        ta.value = val.slice(0, cw.start) + ins + val.slice(cw.end);
        var np = cw.start + ins.length;
        ta.setSelectionRange(np, np);
      }
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.focus();
    }

    function update() {
      var cw = currentWord(ta);
      if (cw.text.length >= MIN_PREFIX) {
        render(suggest(cw.text), 'word');
      } else if (!ta.value.trim()) {
        render(STARTERS, 'starter');
      } else {
        hideBar();
      }
    }

    ta.addEventListener('input', function () { autoGrow(); update(); });
    ta.addEventListener('click', update);
    ta.addEventListener('keyup', function (e) {
      if (e.key && e.key.indexOf('Arrow') === 0) update();
    });
    ta.addEventListener('focus', function () {
      rebuildUserWords();
      autoGrow();
      update();
      // Klavye açılınca alan ekranda görünür kalsın
      setTimeout(function () {
        try { ta.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* eski tarayıcı */ }
      }, 300);
    });
    ta.addEventListener('blur', function () { setTimeout(hideBar, 150); });

    // Düzenleme modu / form sıfırlama gibi koddan değer atamalarında yüksekliği ayarla
    var desc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
    if (desc && desc.set && desc.configurable !== false) {
      Object.defineProperty(ta, 'value', {
        configurable: true,
        get: function () { return desc.get.call(this); },
        set: function (v) { desc.set.call(this, v); requestAnimationFrame(autoGrow); }
      });
    }
    window.addEventListener('resize', autoGrow);
    autoGrow();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
