/* İzsiz Video: MP4/MOV, WebM ve AVI kapsayıcı metadata temizleyici.
   Video ve ses örnekleri yeniden kodlanmaz; metadata alanları aynı boyutta
   boş/padding alanlarına çevrilerek medya akışları ve ofsetler korunur. */
(function (root) {
  'use strict';
  var text = function (u, s, e) { var r = ''; for (var i = s; i < e && i < u.length; i++) r += String.fromCharCode(u[i]); return r; };
  var u32be = function (u, p) { return ((u[p] << 24) | (u[p + 1] << 16) | (u[p + 2] << 8) | u[p + 3]) >>> 0; };
  var u32le = function (u, p) { return (u[p] | (u[p + 1] << 8) | (u[p + 2] << 16) | (u[p + 3] << 24)) >>> 0; };
  var u64be = function (u, p) { return u32be(u, p) * 4294967296 + u32be(u, p + 4); };
  var mp4Metadata = new Set(['udta', 'meta', 'uuid', 'ilst', 'XMP_', 'prfl', 'loci', 'name', '©nam', '©ART', '©alb', '©day', '©cmt', '©too']);
  var mp4Containers = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'dinf', 'mvex', 'moof', 'traf', 'mfra', 'skip']);
  var mp4Brands = new Set(['isom', 'iso2', 'iso3', 'iso4', 'iso5', 'iso6', 'mp41', 'mp42', 'avc1', 'dash', 'M4V ', 'qt  ', '3gp4', '3g2a', '3g2b']);
  var aviMetadata = new Set(['IDIT', 'ISFT', 'INAM', 'IART', 'ICMT', 'IGNR', 'IPRD', 'ICRD', 'ICOP', 'IKEY', 'IENG', 'ITCH', 'ISBJ', 'ISRF']);

  function isMp4(u) {
    if (!u || u.length < 12 || text(u, 4, 8) !== 'ftyp') return false;
    var size = u32be(u, 0), end = Math.min(u.length, size >= 8 ? size : u.length);
    if (end < 16) return false;
    for (var p = 8; p + 4 <= end; p += 4) if (mp4Brands.has(text(u, p, p + 4))) return true;
    return false;
  }
  function isAvi(u) { return !!u && u.length >= 12 && text(u, 0, 4) === 'RIFF' && text(u, 8, 12) === 'AVI '; }
  function isWebm(u) {
    if (!u || u.length < 12 || u[0] !== 0x1a || u[1] !== 0x45 || u[2] !== 0xdf || u[3] !== 0xa3) return false;
    for (var i = 0; i + 4 <= Math.min(u.length, 4096); i++) if (text(u, i, i + 4) === 'webm') return true;
    return false;
  }
  function atom(u, p, end) {
    if (p + 8 > end) return null;
    var n = u32be(u, p), type = text(u, p + 4, p + 8), header = 8;
    if (n === 1) { if (p + 16 > end) return null; n = u64be(u, p + 8); header = 16; }
    else if (n === 0) n = end - p;
    if (!Number.isSafeInteger(n) || n < header || p + n > end) return null;
    return { pos: p, size: n, type: type, header: header, body: p + header, end: p + n };
  }
  function blankMp4(u, a, found) {
    var header = new Uint8Array(a.header);
    for (var h = 0; h < a.header; h++) header[h] = u[a.pos + h];
    for (var i = a.pos; i < a.end; i++) u[i] = 0;
    for (var j = 0; j < a.header; j++) u[a.pos + j] = header[j];
    u[a.pos + 4] = 0x66; u[a.pos + 5] = 0x72; u[a.pos + 6] = 0x65; u[a.pos + 7] = 0x65;
    found.push(a.type);
    return a.size - a.header;
  }
  function stripMp4(u8) {
    var out = new Uint8Array(u8), found = [], removed = 0;
    function walk(start, end) {
      var p = start;
      while (p + 8 <= end) {
        var a = atom(u8, p, end); if (!a) break;
        if (mp4Metadata.has(a.type)) removed += blankMp4(out, a, found);
        else if (mp4Containers.has(a.type)) walk(a.body, a.end);
        p = a.end;
      }
    }
    walk(0, u8.length);
    if (!found.length) found = ['metadata alanı bulunamadı'];
    return { parts: [out], mime: text(u8, 8, 12) === 'qt  ' ? 'video/quicktime' : 'video/mp4', ext: text(u8, 8, 12) === 'qt  ' ? '.mov' : '.mp4', inSize: u8.length, outSize: out.length, video: true, videoFormat: text(u8, 8, 12) === 'qt  ' ? 'MOV' : 'MP4', metadataBytes: removed, removed: [], found: found };
  }

  function vint(u, p, end) {
    if (p >= end) return null;
    var first = u[p], mask = 0x80, width = 1;
    while (width <= 8 && !(first & mask)) { mask >>= 1; width++; }
    if (width > 8 || p + width > end) return null;
    var value = first & (mask - 1), unknown = value === mask - 1;
    for (var i = 1; i < width; i++) value = value * 256 + u[p + i];
    return { width: width, value: value, unknown: unknown };
  }
  function ebmlId(u, p, end) {
    var v = vint(u, p, end); if (!v) return null;
    var value = 0;
    for (var i = 0; i < v.width; i++) value = value * 256 + u[p + i];
    return { width: v.width, value: value };
  }
  function writeSize(u, p, width, value) {
    for (var i = width - 1; i >= 0; i--) { u[p + i] = value & 255; value = Math.floor(value / 256); }
    u[p] |= 1 << (8 - width);
  }
  function blankWebm(out, a, found) {
    var total = a.end - a.pos, width = a.sizeWidth, body = total - 1 - width;
    out[a.pos] = 0xec; // EBML Void element
    writeSize(out, a.pos + 1, width, body);
    for (var i = a.pos + 1 + width; i < a.end; i++) out[i] = 0;
    found.push(a.name); return body;
  }
  function stripWebm(u8) {
    var out = new Uint8Array(u8), found = [], removed = 0, targets = { 0x1254c367: 'Tags', 0x1941a469: 'Attachments', 0x1043a770: 'Chapters' };
    var segment = null, p = 0;
    while (p + 4 <= u8.length) { var id = ebmlId(u8, p, u8.length); if (!id) break; var sz = vint(u8, p + id.width, u8.length); if (!sz) break; var end = sz.unknown ? u8.length : p + id.width + sz.width + sz.value;
      if (id.value === 0x18538067) { segment = { body: p + id.width + sz.width, end: end }; break; } p = end; }
    if (segment) {
      p = segment.body;
      while (p < segment.end) {
        var eid = ebmlId(u8, p, segment.end); if (!eid) break; var es = vint(u8, p + eid.width, segment.end); if (!es) break;
        var total = es.unknown ? segment.end - p : eid.width + es.width + es.value, end = p + total;
        if (targets[eid.value] && !es.unknown && total >= 3) { var a = { pos: p, end: end, sizeWidth: es.width, name: targets[eid.value] }; removed += blankWebm(out, a, found); }
        p = end;
      }
    }
    if (!found.length) found = ['metadata alanı bulunamadı'];
    return { parts: [out], mime: 'video/webm', ext: '.webm', inSize: u8.length, outSize: out.length, video: true, videoFormat: 'WebM', metadataBytes: removed, removed: [], found: found };
  }

  function blankAvi(out, p, end, name, found) {
    var size = u32le(out, p + 4), total = 8 + size + (size & 1); if (p + total > end) return 0;
    for (var i = p; i < p + total; i++) out[i] = 0;
    out[p] = 0x4a; out[p + 1] = 0x55; out[p + 2] = 0x4e; out[p + 3] = 0x4b; out[p + 4] = size & 255; out[p + 5] = (size >> 8) & 255; out[p + 6] = (size >> 16) & 255; out[p + 7] = (size >> 24) & 255;
    found.push(name); return size;
  }
  function stripAvi(u8) {
    var out = new Uint8Array(u8), found = [], removed = 0, rootEnd = Math.min(u8.length, 8 + u32le(u8, 4));
    function walk(start, end) {
      var p = start;
      while (p + 8 <= end) {
        var type = text(u8, p, p + 4), size = u32le(u8, p + 4), chunkEnd = p + 8 + size + (size & 1);
        if (chunkEnd > end || chunkEnd < p) break;
        if (type === 'LIST' && p + 12 <= end) {
          var listType = text(u8, p + 8, p + 12);
          if (listType === 'INFO') removed += blankAvi(out, p, end, 'LIST/INFO', found);
          else walk(p + 12, p + 8 + size);
        } else if (aviMetadata.has(type)) removed += blankAvi(out, p, end, type, found);
        p = chunkEnd;
      }
    }
    walk(12, rootEnd);
    if (!found.length) found = ['metadata alanı bulunamadı'];
    return { parts: [out], mime: 'video/x-msvideo', ext: '.avi', inSize: u8.length, outSize: out.length, video: true, videoFormat: 'AVI', metadataBytes: removed, removed: [], found: found };
  }

  function isSupported(u) { return isMp4(u) || isWebm(u) || isAvi(u); }
  function strip(u8) {
    if (isMp4(u8)) return stripMp4(u8);
    if (isWebm(u8)) return stripWebm(u8);
    if (isAvi(u8)) return stripAvi(u8);
    throw new Error('Desteklenmeyen video biçimi (MP4, MOV, WebM ve AVI desteklenir)');
  }
  root.IzsizVideo = { isMp4: isMp4, isWebm: isWebm, isAvi: isAvi, isSupported: isSupported, strip: strip };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.IzsizVideo;
})(typeof self !== 'undefined' ? self : this);
