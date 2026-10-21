/* İzsiz Foto — salt-okunur köken ve piksel denetimi (2.8.0)
 *
 * Bu modül kaynak baytları YALNIZCA OKUR. Hiçbir şeyi değiştirmez, çıktıya yazmaz
 * ve temizleme çekirdeğinden (IzsizCore) bağımsızdır.
 *
 * KAPSAM SINIRI: SynthID gibi görünmez, anahtarlı filigranlar bu yöntemlerle
 * tespit EDİLEMEZ. Burada yalnızca (1) dosya içindeki açık köken kayıtları
 * (C2PA/JUMBF, XMP/IPTC DigitalSourceType, yazılım etiketleri) okunur ve
 * (2) genel amaçlı, kaba piksel istatistikleri hesaplanır. "Bulgu yok" sonucu
 * hiçbir filigranın veya yapay zekâ üretiminin olmadığı anlamına gelmez.
 */
(function (root) {
  'use strict';

  var DEC = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { fatal: false }) : null;
  function latin1(u8, a, b) {
    var s = '';
    for (var i = a; i < b; i++) s += String.fromCharCode(u8[i]);
    return s;
  }
  function utf8(u8, a, b) { return DEC ? DEC.decode(u8.subarray(a, b)) : latin1(u8, a, b); }
  function u32be(u8, p) { return ((u8[p] << 24) | (u8[p + 1] << 16) | (u8[p + 2] << 8) | u8[p + 3]) >>> 0; }
  function u32le(u8, p) { return (u8[p] | (u8[p + 1] << 8) | (u8[p + 2] << 16) | (u8[p + 3] << 24)) >>> 0; }

  // IPTC / C2PA "digital source type" değerleri -> insan okunur etiket
  var SOURCE_TYPES = [
    ['trainedAlgorithmicMedia', 'Yapay zekâ ile üretilmiş (trainedAlgorithmicMedia)'],
    ['compositeWithTrainedAlgorithmicMedia', 'Yapay zekâ ögesi içeren kompozit'],
    ['algorithmicMedia', 'Algoritmik üretim (algorithmicMedia)'],
    ['compositeSynthetic', 'Sentetik kompozit'],
    ['digitalCapture', 'Dijital yakalama (kamera)'],
    ['computationalCapture', 'Hesaplamalı yakalama'],
    ['digitalArt', 'Dijital sanat'],
    ['screenCapture', 'Ekran görüntüsü'],
  ];

  // Dosya içinde taranacak, bilinen üretici/yazılım izleri (yalnızca görüntülenir)
  var GENERATOR_HINTS = [
    'Google', 'Gemini', 'Imagen', 'OpenAI', 'DALL', 'Midjourney', 'Stable Diffusion',
    'Adobe Firefly', 'Firefly', 'Photoshop', 'Leonardo', 'Ideogram', 'Flux', 'Runway',
  ];

  function findPngChunks(u8) {
    var out = [];
    var p = 8;
    while (p + 12 <= u8.length) {
      var len = u32be(u8, p);
      var type = latin1(u8, p + 4, p + 8);
      var d0 = p + 8, d1 = d0 + len;
      if (d1 + 4 > u8.length) break;
      out.push({ type: type, a: d0, b: d1 });
      p = d1 + 4;
      if (type === 'IEND') break;
    }
    return out;
  }

  function findJpegSegments(u8) {
    var out = [];
    var p = 2;
    while (p + 4 <= u8.length && u8[p] === 0xff) {
      var mk = u8[p + 1];
      if (mk === 0xda || mk === 0xd9) break;
      if (mk === 0xff) { p++; continue; }
      if (mk === 0x01 || (mk >= 0xd0 && mk <= 0xd7)) { p += 2; continue; }
      var len = (u8[p + 2] << 8) | u8[p + 3];
      if (len < 2 || p + 2 + len > u8.length) break;
      out.push({ marker: mk, a: p + 4, b: p + 2 + len });
      p += 2 + len;
    }
    return out;
  }

  function findWebpChunks(u8) {
    var out = [];
    var p = 12;
    while (p + 8 <= u8.length) {
      var type = latin1(u8, p, p + 4);
      var len = u32le(u8, p + 4);
      var d0 = p + 8, d1 = d0 + len;
      if (d1 > u8.length) break;
      out.push({ type: type, a: d0, b: d1 });
      p = d1 + (len & 1);
    }
    return out;
  }

  function isJpeg(u8) { return u8.length > 3 && u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff; }
  function isPng(u8) { return u8.length > 8 && u8[0] === 0x89 && latin1(u8, 1, 4) === 'PNG'; }
  function isWebp(u8) { return u8.length > 12 && latin1(u8, 0, 4) === 'RIFF' && latin1(u8, 8, 12) === 'WEBP'; }

  // Bir bölge içinde XMP / C2PA / metin ipuçlarını arar; hepsi salt-okunur.
  function scanText(text, found) {
    var i, m;
    for (i = 0; i < SOURCE_TYPES.length; i++) {
      if (text.indexOf(SOURCE_TYPES[i][0]) >= 0 && found.sourceTypes.indexOf(SOURCE_TYPES[i][1]) < 0) {
        found.sourceTypes.push(SOURCE_TYPES[i][1]);
      }
    }
    m = /xmp:CreatorTool[=>"']+\s*([^"'<]{1,80})/.exec(text);
    if (m && found.tools.indexOf(m[1].trim()) < 0) found.tools.push(m[1].trim());
    m = /claim_generator(?:_info)?[^A-Za-z0-9]{1,6}([A-Za-z0-9 ._\/-]{2,80})/.exec(text);
    if (m && found.claimGenerators.indexOf(m[1].trim()) < 0) found.claimGenerators.push(m[1].trim());
    m = /c2pa\.(created|edited|opened|placed|converted|transcoded)/.exec(text);
    if (m && found.c2paActions.indexOf('c2pa.' + m[1]) < 0) found.c2paActions.push('c2pa.' + m[1]);
    for (i = 0; i < GENERATOR_HINTS.length; i++) {
      var h = GENERATOR_HINTS[i];
      if (text.indexOf(h) >= 0 && found.hints.indexOf(h) < 0) found.hints.push(h);
    }
  }

  /**
   * Kaynak dosyadaki AÇIK köken kayıtlarını okur.
   * Dönüş: { format, c2pa:boolean, xmp:boolean, exifSoftware, pngText:[], sourceTypes:[], ... }
   */
  function readProvenance(u8) {
    var found = {
      format: 'bilinmiyor', c2pa: false, xmp: false, exifSoftware: '',
      pngText: [], sourceTypes: [], tools: [], claimGenerators: [], c2paActions: [], hints: [],
    };
    var segs, i, s, t;
    try {
      if (isJpeg(u8)) {
        found.format = 'JPEG';
        segs = findJpegSegments(u8);
        for (i = 0; i < segs.length; i++) {
          s = segs[i];
          if (s.marker === 0xe1) {
            var head = latin1(u8, s.a, Math.min(s.b, s.a + 29));
            if (head.indexOf('http://ns.adobe.com/xap/1.0/') === 0) {
              found.xmp = true;
              scanText(utf8(u8, s.a, s.b), found);
            } else if (head.indexOf('Exif') === 0) {
              t = latin1(u8, s.a, s.b);
              var sw = /(?:Google|Adobe|Photoshop|Gemini|Midjourney|OpenAI|DALL|Stable Diffusion)[\x20-\x7e]{0,60}/.exec(t);
              if (sw && !found.exifSoftware) found.exifSoftware = sw[0].trim();
            }
          } else if (s.marker === 0xeb && latin1(u8, s.a, s.a + 2) === 'JP') {
            found.c2pa = true;
            scanText(latin1(u8, s.a, s.b), found);
          }
        }
      } else if (isPng(u8)) {
        found.format = 'PNG';
        segs = findPngChunks(u8);
        for (i = 0; i < segs.length; i++) {
          s = segs[i];
          if (s.type === 'caBX') {
            found.c2pa = true;
            scanText(latin1(u8, s.a, s.b), found);
          } else if (s.type === 'tEXt' || s.type === 'iTXt' || s.type === 'zTXt') {
            var raw = latin1(u8, s.a, Math.min(s.b, s.a + 4096));
            var key = raw.split('\0')[0].slice(0, 40);
            if (key === 'XML:com.adobe.xmp') { found.xmp = true; scanText(utf8(u8, s.a, s.b), found); }
            else if (/^(Software|Source|Comment|Description|parameters|Creation Time)$/i.test(key)) {
              if (found.pngText.length < 6) found.pngText.push(key);
              if (s.type !== 'zTXt') scanText(raw, found);
            }
          }
        }
      } else if (isWebp(u8)) {
        found.format = 'WebP';
        segs = findWebpChunks(u8);
        for (i = 0; i < segs.length; i++) {
          s = segs[i];
          if (s.type === 'C2PA') { found.c2pa = true; scanText(latin1(u8, s.a, s.b), found); }
          else if (s.type === 'XMP ') { found.xmp = true; scanText(utf8(u8, s.a, s.b), found); }
        }
      }
    } catch (e) {
      found.error = (e && e.message) || 'okunamadı';
    }
    return found;
  }

  /** Köken kayıtlarından Türkçe, kısa satırlar üretir. Her satır {text, level}. */
  function describeProvenance(f) {
    var rows = [];
    if (f.error) rows.push({ text: 'Köken kayıtları okunamadı: ' + f.error, level: 'warn' });
    if (f.sourceTypes.length) rows.push({ text: 'Dosyadaki kaynak türü etiketi: ' + f.sourceTypes.join('; '), level: 'warn' });
    if (f.c2pa) rows.push({ text: 'C2PA bildirimi (manifest) var' + (f.claimGenerators.length ? ' · üretici: ' + f.claimGenerators.slice(0, 2).join(', ') : ''), level: 'warn' });
    if (f.c2paActions.length) rows.push({ text: 'C2PA eylemleri: ' + f.c2paActions.join(', '), level: 'neutral' });
    if (f.tools.length) rows.push({ text: 'Oluşturucu yazılım (XMP): ' + f.tools.join(', '), level: 'neutral' });
    if (f.exifSoftware) rows.push({ text: 'Yazılım etiketi (EXIF): ' + f.exifSoftware, level: 'neutral' });
    if (f.pngText.length) rows.push({ text: 'PNG metin alanları: ' + f.pngText.join(', '), level: 'neutral' });
    if (!rows.length) rows.push({ text: 'Okunabilir açık köken/yapay zekâ etiketi bulunmadı (etiketlerin silinmiş olması mümkündür)', level: 'neutral' });
    return rows;
  }

  /**
   * Genel amaçlı, kaba piksel istatistikleri. SynthID DEĞİL, anahtarlı filigran DEĞİL.
   * rgba: Uint8ClampedArray, w*h*4. Yalnızca iki basit, bilinen sinyal bakılır:
   *  - LSB düzlemi dengesi/rastgeleliği (saf LSB gömmelerinde sapar; doğal fotoğrafta da sapabilir)
   *  - Yüksek geçirgen artıkta 8 piksel periyodunda tekrar eden desen (döşenmiş desenli filigranlar)
   */
  function analyzePixels(rgba, w, h) {
    var n = w * h;
    if (!n || rgba.length < n * 4) return { ok: false, reason: 'Piksel verisi yok' };
    var step = Math.max(1, Math.floor(Math.sqrt(n / 400000)));
    var ones = 0, total = 0, pairs = 0, pairSame = 0;
    var x, y, c, v, prev;
    for (y = 0; y < h; y += step) {
      prev = -1;
      for (x = 0; x < w; x += step) {
        for (c = 0; c < 3; c++) {
          v = rgba[(y * w + x) * 4 + c] & 1;
          ones += v; total++;
          if (c === 0) { if (prev >= 0) { pairs++; if (prev === v) pairSame++; } prev = v; }
        }
      }
    }
    var p1 = total ? ones / total : 0.5;
    var lsbBias = Math.abs(p1 - 0.5);
    var sameRate = pairs ? pairSame / pairs : 0.5;
    var lsbSuspicious = total > 5000 && lsbBias < 0.004 && Math.abs(sameRate - 0.5) < 0.004;

    // Periyodiklik: yatay yüksek geçirgen artığın faz başına ortalama enerjisi (periyot 8)
    var P = 8, phase = new Float64Array(P), cnt = new Float64Array(P);
    for (y = 0; y < h; y += step) {
      for (x = 1; x < w; x += 1) {
        var i1 = (y * w + x) * 4 + 1, i0 = i1 - 4;
        var d = rgba[i1] - rgba[i0];
        phase[x % P] += d * d; cnt[x % P]++;
      }
    }
    var mean = 0, k;
    for (k = 0; k < P; k++) { phase[k] = cnt[k] ? phase[k] / cnt[k] : 0; mean += phase[k]; }
    mean /= P;
    var maxDev = 0;
    for (k = 0; k < P; k++) maxDev = Math.max(maxDev, mean ? Math.abs(phase[k] - mean) / mean : 0);
    var periodic = mean > 0.5 && maxDev > 0.35 && w > 256;

    return {
      ok: true, sampled: total, step: step,
      lsbOnesRatio: p1, lsbSuspicious: lsbSuspicious,
      periodicDeviation: maxDev, periodicSuspicious: periodic,
    };
  }

  function describePixels(a) {
    var rows = [];
    if (!a || !a.ok) return [{ text: 'Piksel analizi yapılamadı' + (a && a.reason ? ': ' + a.reason : ''), level: 'neutral' }];
    if (a.lsbSuspicious) rows.push({ text: 'En düşük bit düzleminde aşırı düzgün/rastgele dağılım (genel gösterge; birçok doğal görüntüde de görülür)', level: 'warn' });
    if (a.periodicSuspicious) rows.push({ text: '8 piksellik tekrar eden desen izi (blok sıkıştırma veya döşenmiş desen olabilir)', level: 'warn' });
    if (!rows.length) rows.push({ text: 'Bu kaba testlerde belirgin sapma görülmedi', level: 'neutral' });
    rows.push({ text: 'Bu testler SynthID gibi görünmez filigranları tespit edemez; sonuç “filigran yok” demek değildir', level: 'warn' });
    return rows;
  }

  var api = { readProvenance: readProvenance, describeProvenance: describeProvenance, analyzePixels: analyzePixels, describePixels: describePixels };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.IzsizAudit = api;
})(typeof self !== 'undefined' ? self : this);
