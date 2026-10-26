// Çalıştırma: npm test  (esbuild ile paketlenip Node'da koşar)
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { sniffBytes, formatFromHints, readDimensions } from '../src/lib/formats';
import { decodeHeic, decodeTiff, downscale, fitWithin, embedTask, verifyTask } from '../src/lib/core';

const dir = process.env.SAMPLES ?? '/tmp/samples';
const bytes = (name: string) => new Uint8Array(fs.readFileSync(`${dir}/${name}`));
const ab = (name: string) => { const b = fs.readFileSync(`${dir}/${name}`); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer; };
let passed = 0;
const ok = (label: string) => { passed += 1; console.log('  ✓', label); };

console.log('Biçim tanıma (içeriğe göre)');
const expected: Record<string, string> = {
  't.jpg': 'JPEG', 't.png': 'PNG', 't.webp': 'WEBP', 't.gif': 'GIF', 't.bmp': 'BMP', 't.tif': 'TIFF',
  't.heic': 'HEIC', 't.avif': 'AVIF', 'rot.jpg': 'JPEG',
  'fake.jpg': 'HEIC',   // .jpg adlı ama içeriği HEIC  → kullanıcının yaşadığı durum
  'fake.heic': 'JPEG',  // .heic adlı ama içeriği JPEG
};
for (const [name, format] of Object.entries(expected)) {
  assert.equal(sniffBytes(bytes(name).slice(0, 64)), format, name);
  ok(`${name} → ${format}`);
}
assert.equal(sniffBytes(new TextEncoder().encode('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"/>')), 'SVG'); ok('svg');
assert.equal(sniffBytes(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])), 'UNKNOWN'); ok('bilinmeyen');
assert.equal(formatFromHints('x.HEIC', ''), 'HEIC'); assert.equal(formatFromHints('x', 'image/png'), 'PNG'); ok('uzantı/MIME yedeği');
assert.deepEqual(readDimensions(bytes('t.jpg')), { width: 800, height: 600 }); assert.deepEqual(readDimensions(bytes('t.png')), { width: 800, height: 600 }); ok('JPEG/PNG boyut okuma');

console.log('HEIC / TIFF çözme (WASM, cihaz içi)');
const heic = await decodeHeic(ab('t.heic'), 2200, 4_000_000);
assert.equal(heic.width, 800); assert.equal(heic.height, 600); ok('t.heic 800×600');
const fakeJpg = await decodeHeic(ab('fake.jpg'), 2200, 4_000_000);
assert.equal(fakeJpg.width, 800); ok('fake.jpg (içeriği HEIC) çözüldü');
const small = await decodeHeic(ab('t.heic'), 400, 4_000_000);
assert.equal(small.width, 400); assert.equal(small.height, 300); ok('HEIC küçültme 400×300');
const tiff = await decodeTiff(ab('t.tif'), 2200, 4_000_000);
assert.equal(tiff.width, 800); assert.equal(tiff.height, 600); ok('t.tif 800×600');
assert.deepEqual(fitWithin(6000, 4000, 2200, 4_000_000), { width: 2200 > 0 ? 2449 > 2200 ? 2200 : 2449 : 0, height: 1467 }); ok('fitWithin 6000×4000 → 2200×1467');

console.log('Filigran gömme → doğrulama');
function synthetic(width: number, height: number) {
  const data = new Uint8ClampedArray(width * height * 4);
  let seed = 7;
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const noise = ((seed >>> 24) % 25) - 12;
    const i = (y * width + x) * 4;
    data[i] = Math.max(0, Math.min(255, (x * 255) / width + noise));
    data[i + 1] = Math.max(0, Math.min(255, (y * 255) / height + noise));
    data[i + 2] = Math.max(0, Math.min(255, ((x + y) * 255) / (width + height) + noise));
    data[i + 3] = 255;
  }
  return { data, width, height };
}
for (const strength of ['soft', 'balanced', 'durable'] as const) {
  const image = synthetic(1600, 1067);
  const { pixels } = embedTask({ data: new Uint8ClampedArray(image.data), width: image.width, height: image.height }, 'Ayşe Öztürk © 2026', strength);
  const found = verifyTask(pixels);
  assert.ok(found, `${strength}: imza bulunamadı`);
  assert.equal(found!.owner, 'Ayşe Öztürk © 2026');
  ok(`${strength}: "${found!.owner}" geri okundu`);
}
{
  const image = synthetic(2200, 1467);
  const { pixels } = embedTask({ data: new Uint8ClampedArray(image.data), width: image.width, height: image.height }, 'foto', 'balanced');
  const t0 = Date.now(); const found = verifyTask(pixels); const verifyMs = Date.now() - t0;
  assert.equal(found?.owner, 'foto'); ok(`2200×1467 doğrulama ${verifyMs} ms`);
  const t1 = Date.now(); assert.equal(verifyTask(synthetic(2200, 1467)), null); ok(`imzasız görsel → bulunamadı (${Date.now() - t1} ms)`);
}
{
  // HEIC'ten çözülen gerçek piksellerle de dene
  const { pixels } = embedTask({ data: new Uint8ClampedArray(heic.data), width: heic.width, height: heic.height }, 'heic-test', 'durable');
  assert.equal(verifyTask(pixels)?.owner, 'heic-test'); ok('HEIC kaynaklı görselde imza gömüldü ve okundu');
}
{
  const image = synthetic(2200, 1467);
  const half = downscale(image, 1100, 733);
  assert.equal(half.width, 1100); ok('downscale boyutları');
}
console.log(`\n${passed} kontrol geçti.`);
