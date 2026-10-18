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
const scan = Buffer.from([0xff, 0xda, 0, 4, 1, 0, 0x12, 0x34, 0xff, 0x00, 0x56, 0xff, 0xd9]);
const jpg = Buffer.concat([Buffer.from([0xff, 0xd8]), seg(0xe1, exif), seg(0xfe, 'gizli yorum'), seg(0xed, 'Photoshop 3.0\0x'), seg(0xdb, Buffer.alloc(65, 1)), seg(0xc0, Buffer.from([8, 0, 2, 0, 2, 1, 1, 0x11, 0])), scan, Buffer.from('EKVERI')]);
let r = C.strip(new Uint8Array(jpg), { keepOrientation: false, keepICC: true, dropTrailing: true, keepDate: false });
let out = cat(r.parts);
assert(!out.includes('gizli yorum') && !out.includes('Exif') && !out.includes('Photoshop') && !out.includes('EKVERI'), 'JPEG: meta kaldı');
assert(out.includes(Buffer.from([0x12, 0x34, 0xff, 0x00, 0x56])), 'JPEG: tarama verisi değişti');
r = C.strip(new Uint8Array(jpg), { keepOrientation: true, keepICC: true, dropTrailing: true, keepDate: false });
assert.strictEqual(r.orientation, 6); assert(r.orientationKept, 'yön korunmalı');
assert(!cat(r.parts).includes('2024:01:02'), 'tarih sızdı');
// --- PNG: tEXt ve tIME silinmeli, IDAT kalmalı
const crc = (b) => { const x = Buffer.alloc(4); x.writeUInt32BE(C.crc32(new Uint8Array(b)) >>> 0); return x; };
const ch = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); return Buffer.concat([l, td, crc(td)]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(1, 0); ihdr.writeUInt32BE(1, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ch('IHDR', ihdr), ch('tEXt', Buffer.from('Author\0Ali')), ch('tIME', Buffer.alloc(7)), ch('IDAT', Buffer.from([1, 2, 3])), ch('IEND', Buffer.alloc(0))]);
out = cat(C.strip(new Uint8Array(png), {}).parts);
assert(!out.includes('Author') && !out.includes('tIME') && out.includes('IDAT'), 'PNG hata');
// --- Bozuk girişler hata vermeli
assert.throws(() => C.strip(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])), /Desteklenmeyen/);
assert.throws(() => C.strip(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0xff, 0xff, 0, 0])), /Bozuk|kesik/);
console.log('Tüm testler geçti');
