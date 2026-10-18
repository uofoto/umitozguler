// Çalıştır: node tests/test.js  (İzsiz çekirdeğini index.html içinden okur)
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const core = html.match(/<script>(\/\* İzsiz çekirdeği[\s\S]*?)<\/script>/)[1];
const m = { exports: {} }; new Function('module', 'self', core)(m, undefined);
const C = m.exports;
const cat = (parts) => Buffer.concat(parts.map((p) => Buffer.from(p)));
const seg = (mk, body) => Buffer.concat([Buffer.from([0xff, mk, (body.length + 2) >> 8, (body.length + 2) & 255]), Buffer.from(body)]);
// --- JPEG: SOI, APP1 EXIF(GPS var), COM, APP13, DQT, SOF0, SOS+veri, EOI, dosya sonu eki
const tiff = C.buildTiff(6, '2024:01:02 03:04:05');
const exif = Buffer.concat([Buffer.from('Exif\0\0'), Buffer.from(tiff)]);
const c2paPayload = Buffer.from('JP\0\1jumbtest');
const scan = Buffer.from([0xff, 0xda, 0, 4, 1, 0, 0x12, 0x34, 0xff, 0x00, 0x56, 0xff, 0xd9]);
const jpg = Buffer.concat([Buffer.from([0xff, 0xd8]), seg(0xe1, exif), seg(0xeb, c2paPayload), seg(0xfe, 'gizli yorum'), seg(0xed, 'Photoshop 3.0\0x'), seg(0xdb, Buffer.alloc(65, 1)), seg(0xc0, Buffer.from([8, 0, 2, 0, 2, 1, 1, 0x11, 0])), scan, Buffer.from('EKVERI')]);
let r = C.strip(new Uint8Array(jpg), { keepOrientation: false, keepICC: true, dropTrailing: true, keepDate: false });
let out = cat(r.parts);
assert(!out.includes('gizli yorum') && !out.includes('Exif') && !out.includes('Photoshop') && !out.includes('EKVERI'), 'JPEG: meta kaldı');
assert(!out.includes(c2paPayload), 'JPEG: C2PA varsayılan olarak kaldırılmalı');
assert(out.includes(Buffer.from([0x12, 0x34, 0xff, 0x00, 0x56])), 'JPEG: tarama verisi değişti');
out = cat(C.strip(new Uint8Array(jpg), { keepC2PA: true, dropTrailing: true }).parts);
assert(out.includes(c2paPayload), 'JPEG: C2PA seçeneğiyle köken verisi korunmalı');
r = C.strip(new Uint8Array(jpg), { keepOrientation: true, keepICC: true, dropTrailing: true, keepDate: false });
assert.strictEqual(r.orientation, 6); assert(r.orientationKept, 'yön korunmalı');
assert(!cat(r.parts).includes('2024:01:02'), 'tarih sızdı');
// --- PNG: tEXt ve tIME silinmeli, IDAT kalmalı
const crc = (b) => { const x = Buffer.alloc(4); x.writeUInt32BE(C.crc32(new Uint8Array(b)) >>> 0); return x; };
const ch = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); return Buffer.concat([l, td, crc(td)]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(1, 0); ihdr.writeUInt32BE(1, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ch('IHDR', ihdr), ch('tEXt', Buffer.from('Author\0Ali')), ch('tIME', Buffer.alloc(7)), ch('caBX', Buffer.from('C2PA')), ch('IDAT', Buffer.from([1, 2, 3])), ch('IEND', Buffer.alloc(0))]);
out = cat(C.strip(new Uint8Array(png), {}).parts);
assert(!out.includes('Author') && !out.includes('tIME') && !out.includes('C2PA') && out.includes('IDAT'), 'PNG hata');
out = cat(C.strip(new Uint8Array(png), { keepC2PA: true }).parts);
assert(out.includes('C2PA'), 'PNG: C2PA seçeneğiyle köken verisi korunmalı');
// --- WebP: RIFF son ek seçeneği ve sınır doğrulaması
const webpChunk = (type, data) => { const s = Buffer.alloc(4); s.writeUInt32LE(data.length); return Buffer.concat([Buffer.from(type), s, data, data.length & 1 ? Buffer.alloc(1) : Buffer.alloc(0)]); };
const webpData = Buffer.alloc(10);
const webpBody = Buffer.concat([Buffer.from('WEBP'), webpChunk('VP8 ', webpData), webpChunk('C2PA', Buffer.from('credential'))]);
const webpHeader = Buffer.alloc(8); webpHeader.write('RIFF'); webpHeader.writeUInt32LE(webpBody.length, 4);
const webp = Buffer.concat([webpHeader, webpBody, Buffer.from('TAIL')]);
out = cat(C.strip(new Uint8Array(webp), { dropTrailing: false }).parts);
assert(out.includes('TAIL'), 'WebP: seçenek kapalıyken son ek korunmalı');
assert(!out.includes('credential'), 'WebP: C2PA varsayılan olarak kaldırılmalı');
out = cat(C.strip(new Uint8Array(webp), { keepC2PA: true, dropTrailing: false }).parts);
assert(out.includes('credential'), 'WebP: C2PA seçeneğiyle köken verisi korunmalı');
out = cat(C.strip(new Uint8Array(webp), { dropTrailing: true }).parts);
assert(!out.includes('TAIL'), 'WebP: seçenek açıkken son ek kaldırılmalı');
const brokenWebp = Buffer.from(webp.subarray(0, webp.length - 4));
brokenWebp.writeUInt32LE(webpBody.length + 8, 4);
assert.throws(() => C.strip(new Uint8Array(brokenWebp), {}), /RIFF boyutu/);
const shortChunkHeader = Buffer.concat([webpHeader, webpBody, Buffer.from([1, 2, 3, 4])]);
shortChunkHeader.writeUInt32LE(webpBody.length + 4, 4);
assert.throws(() => C.strip(new Uint8Array(shortChunkHeader), {}), /kesik parça başlığı/);
// --- HEIC/HEIF imzaları AVIF'ten ayrılmalı
const ftyp = (major, compatible = []) => {
  const size = Buffer.alloc(4); size.writeUInt32BE(16 + compatible.length * 4);
  const minor = Buffer.alloc(4);
  return Buffer.concat([size, Buffer.from('ftyp' + major), minor, ...compatible.map((b) => Buffer.from(b))]);
};
assert(C.isHeif(new Uint8Array(ftyp('heic', ['mif1', 'heic']))), 'HEIC tanınmalı');
assert(C.isHeif(new Uint8Array(ftyp('mif1', ['heif']))), 'HEIF uyumlu marka listesinden tanınmalı');
assert(!C.isHeif(new Uint8Array(ftyp('avif', ['mif1']))), 'AVIF, HEIF olarak sınıflandırılmamalı');
assert.throws(() => C.strip(new Uint8Array(ftyp('mif1', ['avif']))), /AVIF/);
assert(!C.isHeif(new Uint8Array([0, 1, 2, 3, 4, 5])), 'Rastgele veri HEIF sayılmamalı');
// --- Sıkıştırmasız ZIP: dönüştürülmüş dosyanın veri baytları aynen eklenmeli
const zip = cat(C.makeZip([{ name: 'sample.png', parts: [Buffer.from([1, 2, 3, 4])] }]));
assert.strictEqual(zip.readUInt32LE(0), 0x04034b50, 'ZIP yerel dosya başlığı eksik');
assert.strictEqual(zip.subarray(30 + 'sample.png'.length, 30 + 'sample.png'.length + 4).toString('hex'), '01020304', 'ZIP dosya verisi değişti');
// --- Bozuk girişler hata vermeli
assert.throws(() => C.strip(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])), /Desteklenmeyen/);
assert.throws(() => C.strip(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0xff, 0xff, 0, 0])), /Bozuk|kesik/);
console.log('Tüm testler geçti');
