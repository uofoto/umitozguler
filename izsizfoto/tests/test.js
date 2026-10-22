// Çalıştır: node tests/test.js  (İzsiz çekirdeğini index.html içinden okur)
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const core = html.match(/<script>(\/\* İzsiz çekirdeği[\s\S]*?)<\/script>/)[1];
const m = { exports: {} }; new Function('module', 'self', core)(m, undefined);
const C = m.exports;
const V = require('../video-codec.js');
const P = require('../pixel-rewrite.js');
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
// --- MP4/MOV: metadata atomları boşaltılmalı, medya akışı byte-byte kalmalı
const box = (type, body) => { const b = Buffer.alloc(8 + body.length); b.writeUInt32BE(b.length, 0); b.write(type, 4, 4, 'ascii'); body.copy(b, 8); return b; };
const ftypMp4 = Buffer.alloc(20); ftypMp4.writeUInt32BE(20, 0); ftypMp4.write('ftypisom\0\0\0\0mp41', 4, 'ascii');
const mediaBytes = Buffer.from('VIDEO_AND_AUDIO_SAMPLE');
const fakeMp4 = Buffer.concat([ftypMp4, box('moov', Buffer.concat([box('trak', Buffer.from('TRACK')), box('udta', Buffer.from('AI_GENERATOR=secret-xmp')), box('meta', Buffer.from('C2PA credential'))])), box('mdat', mediaBytes)]);
assert(V.isMp4(new Uint8Array(fakeMp4)), 'MP4 tanınmalı');
const vr = V.strip(new Uint8Array(fakeMp4));
const vout = cat(vr.parts);
assert.strictEqual(vout.length, fakeMp4.length, 'Video boyutu değişmemeli');
assert(vout.includes(mediaBytes), 'MP4 medya akışı değişmemeli');
assert(!vout.includes('AI_GENERATOR') && !vout.includes('C2PA credential'), 'MP4 metadata kalmamalı');
const freePos = vout.indexOf('free');
assert(freePos >= 4 && vout.readUInt32BE(freePos - 4) > 0, 'MP4 free atom boyutu korunmalı');
assert(vr.metadataBytes > 0 && vr.video && vr.mime === 'video/mp4', 'MP4 temizleme sonucu hatalı');
// --- WebM: Segment içindeki Tags alanı boşaltılmalı, Cluster akışı kalmalı
const ebmlSize = (n) => Buffer.from([0x80 + n]);
const ebml = (id, body) => Buffer.concat([Buffer.from(id), ebmlSize(body.length), body]);
const webm = Buffer.concat([ebml([0x1a, 0x45, 0xdf, 0xa3], ebml([0x42, 0x82], Buffer.from('webm'))), ebml([0x18, 0x53, 0x80, 0x67], Buffer.concat([ebml([0x12, 0x54, 0xc3, 0x67], Buffer.from('AI metadata secret')), ebml([0x1f, 0x43, 0xb6, 0x75], Buffer.from('CLUSTER_MEDIA'))]))]);
assert(V.isWebm(new Uint8Array(webm)), 'WebM tanınmalı');
const wr = V.strip(new Uint8Array(webm)), wout = cat(wr.parts);
assert(wr.metadataBytes > 0 && wout.includes('CLUSTER_MEDIA') && !wout.includes('AI metadata secret'), 'WebM metadata temizleme hatası');
// --- AVI: LIST/INFO metadata'sı JUNK alanına çevrilmeli, movi akışı kalmalı
const aviChunk = (type, body) => { const b = Buffer.alloc(8 + body.length + (body.length & 1)); b.write(type, 0, 4, 'ascii'); b.writeUInt32LE(body.length, 4); body.copy(b, 8); return b; };
const aviInfo = aviChunk('LIST', Buffer.concat([Buffer.from('INFO'), aviChunk('INAM', Buffer.from('AI video secret'))]));
const aviMovi = aviChunk('LIST', Buffer.concat([Buffer.from('movi'), Buffer.from('AVI_MEDIA') ]));
const avi = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('AVI '), aviInfo, aviMovi]); avi.writeUInt32LE(avi.length - 8, 4);
assert(V.isAvi(new Uint8Array(avi)), 'AVI tanınmalı');
const ar = V.strip(new Uint8Array(avi)), aout = cat(ar.parts);
assert(ar.metadataBytes > 0 && aout.includes('AVI_MEDIA') && !aout.includes('AI video secret'), 'AVI metadata temizleme hatası');
// --- Bozuk girişler hata vermeli
assert.throws(() => C.strip(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])), /Desteklenmeyen/);
assert.throws(() => C.strip(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0xff, 0xff, 0, 0])), /Bozuk|kesik/);
// --- Salt-okunur köken/piksel denetimi (provenance-audit.js)
const A = require('../provenance-audit.js');
const xmpTxt = '<x:xmpmeta><rdf:Description xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia" xmp:CreatorTool="TestGen 1.0"/></x:xmpmeta>';
const xmpSeg = seg(0xe1, Buffer.concat([Buffer.from('http://ns.adobe.com/xap/1.0/\0'), Buffer.from(xmpTxt)]));
const c2paSeg = seg(0xeb, Buffer.from('JP\0\1jumb c2pa.created claim_generator TestGen'));
const jpgProv = Buffer.concat([Buffer.from([0xff, 0xd8]), xmpSeg, c2paSeg, seg(0xdb, Buffer.alloc(65, 1)), seg(0xc0, Buffer.from([8, 0, 2, 0, 2, 1, 1, 0x11, 0])), scan]);
const before = Buffer.from(jpgProv);
const pv = A.readProvenance(new Uint8Array(jpgProv));
assert(pv.c2pa && pv.xmp, 'C2PA ve XMP okunmalı');
assert(pv.sourceTypes.some((x) => /trainedAlgorithmicMedia/.test(x)), 'DigitalSourceType okunmalı');
assert(pv.tools.includes('TestGen 1.0'), 'CreatorTool okunmalı');
assert(pv.c2paActions.includes('c2pa.created'), 'C2PA eylemi okunmalı');
assert(Buffer.compare(before, jpgProv) === 0, 'Denetim girdiyi değiştirmemeli');
const pvEmpty = A.readProvenance(new Uint8Array(jpg.subarray(0, 2)));
assert(!pvEmpty.c2pa && A.describeProvenance(pvEmpty).length >= 1, 'Boş dosya hatasız raporlanmalı');
assert(A.readProvenance(new Uint8Array([1, 2, 3])).format === 'bilinmiyor', 'Bilinmeyen biçim çökmemeli');
// Piksel testi: SynthID iddiası olmamalı; düz doğal-benzeri veri çökmeden analiz edilmeli
const W = 300, H = 40, px = new Uint8ClampedArray(W * H * 4);
for (let i = 0; i < W * H; i++) { px[i * 4] = (i * 7) & 255; px[i * 4 + 1] = (i * 3) & 255; px[i * 4 + 2] = 120; px[i * 4 + 3] = 255; }
const pa = A.analyzePixels(px, W, H);
assert(pa.ok, 'Piksel analizi çalışmalı');
assert(A.describePixels(pa).some((x) => /SynthID/.test(x.text)), 'Piksel raporu SynthID sınırını belirtmeli');
assert(!A.analyzePixels(new Uint8ClampedArray(0), 0, 0).ok, 'Boş piksel verisi reddedilmeli');
console.log('Köken denetimi testleri geçti');
// --- Deneysel RGB düşük-bit dönüşümü: RGB LSB sıfırlanmalı, alfa korunmalı
const rgba = new Uint8ClampedArray([1, 2, 3, 4, 254, 255, 0, 128]);
const pixelStats = P.clearRgbLsb(rgba, 2, 1);
assert.deepStrictEqual(Array.from(rgba), [0, 2, 2, 4, 254, 254, 0, 128], 'RGB düşük bitleri doğru temizlenmeli; alfa değişmemeli');
assert.strictEqual(pixelStats.changedChannels, 3, 'değişen RGB kanalları sayılmalı');
assert.strictEqual(pixelStats.totalChannels, 6, 'toplam RGB kanalları sayılmalı');
assert.throws(() => P.clearRgbLsb(new Uint8ClampedArray(0), 0, 0), /geçersiz/, 'boş piksel verisi reddedilmeli');
console.log('Tüm testler geçti');
