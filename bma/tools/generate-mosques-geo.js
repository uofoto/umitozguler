#!/usr/bin/env node
/**
 * tools/generate-mosques-geo.js
 * -------------------------------------------------------------------------
 * TEK SEFERLİK DERLEME (BUILD-TIME) BETİĞİ.
 *
 * Ne yapar:
 *   mosques-data.js içindeki PRESET_MOSQUES listesindeki tüm camileri,
 *   mevcut map.js'teki (runtime) geocodeSingleMosque ile AYNI mantıkla
 *   Nominatim (OpenStreetMap) üzerinden sırayla geocode eder ve sonucu
 *   ./mosques-geo.json dosyasına yazar.
 *
 * Neden ayrı bir script:
 *   - Nominatim'in kullanım politikası (max ~1 istek/sn, tanımlı User-Agent)
 *     gereği yüzlerce camiyi ancak sıralı ve yavaş şekilde geocode edebiliriz.
 *   - Bunu HER kullanıcının cihazında tekrar tekrar yapmak yerine, BİR KEZ
 *     (geliştirici makinesinde, gerçek internet erişimiyle) çalıştırıp
 *     sonucu statik bir JSON olarak uygulamaya gömüyoruz. Böylece son
 *     kullanıcı hiçbir zaman bu gecikmeyi yaşamaz (bkz. map.js ->
 *     loadStaticGeoMatrix).
 *
 * Ne zaman çalıştırılır:
 *   - İlk kurulumda (mosques-geo.json henüz yoksa/boşsa).
 *   - mosques-data.js'e yeni preset cami eklendiğinde veya bir caminin
 *     adı/adresi önemli ölçüde değiştiğinde.
 *   - Not: Zaten mosques-geo.json'da koordinatı OLAN camiler tekrar
 *     sorgulanmaz (script varsayılan olarak sadece eksikleri tamamlar).
 *     Baştan tamamen yenilemek isterseniz --force bayrağını kullanın.
 *
 * Kullanım:
 *   node tools/generate-mosques-geo.js            # sadece eksikleri tamamla
 *   node tools/generate-mosques-geo.js --force     # tümünü yeniden geocode et
 *
 * Gereksinimler: Node.js 18+ (yerleşik fetch). İnternet erişimi gerekir.
 * -------------------------------------------------------------------------
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MOSQUES_DATA_PATH = path.join(ROOT, "mosques-data.js");
const OUTPUT_PATH = path.join(ROOT, "mosques-geo.json");
const REQUEST_DELAY_MS = 1100; // Nominatim kullanım politikasına uygun bekleme (map.js ile aynı değer)
const FORCE = process.argv.includes("--force");

// --- 1) mosques-data.js içinden SADECE PRESET_MOSQUES dizi literalini çıkar ---
// Dosyanın tamamını çalıştırmak yerine (DOM'a bağımlı, side-effect'li kod
// içerdiğinden riskli olurdu), "let PRESET_MOSQUES = [" ile başlayan kısmı
// parantez sayarak (bracket matching) buluyor ve SADECE o dizi literalini
// izole bir vm bağlamında değerlendiriyoruz. Bu hem daha güvenli hem de
// "let/const" bildirimlerinin vm sandbox'ında dışarıdan görünmemesi gibi
// Node vm tuhaflıklarından etkilenmez.
function extractPresetMosques() {
  const vm = require("vm");
  const src = fs.readFileSync(MOSQUES_DATA_PATH, "utf8");

  const marker = "PRESET_MOSQUES = [";
  const startIdx = src.indexOf(marker);
  if (startIdx === -1) {
    throw new Error("mosques-data.js içinde 'PRESET_MOSQUES = [' bulunamadı. Dosya yapısı değişmiş olabilir.");
  }
  const arrayStart = startIdx + marker.length - 1; // '[' karakterinin konumu

  let depth = 0;
  let endIdx = -1;
  for (let i = arrayStart; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) {
    throw new Error("PRESET_MOSQUES dizisinin kapanışı bulunamadı (eşleşmeyen köşeli parantez).");
  }

  const arrayLiteralSrc = src.slice(arrayStart, endIdx + 1);
  const list = vm.runInNewContext(`(${arrayLiteralSrc})`, {}, { filename: "mosques-data.js (extracted array)" });

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("PRESET_MOSQUES bulunamadı veya boş. mosques-data.js yapısı değişmiş olabilir.");
  }
  return list;
}

// --- 2) Tek bir cami için Nominatim sorgusu (map.js#geocodeSingleMosque ile aynı mantık) ---
async function geocodeSingleMosque(m) {
  const query = m.mapsSearch || `${m.name} ${m.address}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tr&q=${encodeURIComponent(query + ", Bursa, Türkiye")}`;
  const res = await fetch(url, {
    headers: {
      // Nominatim kullanım politikası tanımlı bir User-Agent ister.
      "User-Agent": "BursaManeviAtlasi-GeoBuildScript/1.0 (tek seferlik derleme betiği)",
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data && data[0]) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

// --- 3) Ana akış -----------------------------------------------------------
async function main() {
  const mosques = extractPresetMosques();
  console.log(`[bilgi] ${mosques.length} preset cami bulundu.`);

  let existing = {};
  if (!FORCE && fs.existsSync(OUTPUT_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
      if (parsed && typeof parsed === "object") existing = parsed;
    } catch (e) {
      console.warn("[uyarı] Mevcut mosques-geo.json okunamadı, sıfırdan başlanıyor.");
    }
  }

  const todo = mosques.filter((m) => FORCE || !existing[m.id]);
  console.log(`[bilgi] ${todo.length} cami geocode edilecek (${mosques.length - todo.length} zaten mevcut${FORCE ? ", --force ile hepsi yeniden yapılıyor" : ""}).`);

  const result = { ...existing };
  delete result._note; // şablon notunu temizle, gerçek veriyle değiştirilecek

  let done = 0;
  let failed = [];
  for (const m of todo) {
    let coords = null;
    try {
      coords = await geocodeSingleMosque(m);
    } catch (e) {
      console.warn(`[hata] ${m.id} (${m.name}) sorgulanırken hata: ${e.message}`);
    }
    if (coords) {
      result[m.id] = coords;
    } else {
      failed.push({ id: m.id, name: m.name });
      console.warn(`[bulunamadı] ${m.id} (${m.name}) için koordinat bulunamadı — elle eklemeniz gerekebilir.`);
    }
    done++;
    if (done % 10 === 0 || done === todo.length) {
      console.log(`[ilerleme] ${done} / ${todo.length}`);
    }
    // Nominatim kullanım politikasına uymak için istekler arasında bekle
    if (done < todo.length) {
      await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log(`\n[tamam] ${Object.keys(result).length} kayıt ${path.relative(ROOT, OUTPUT_PATH)} dosyasına yazıldı.`);
  if (failed.length) {
    console.log(`[uyarı] ${failed.length} cami için koordinat bulunamadı, bunları elle mosques-geo.json içine eklemeniz gerekir:`);
    failed.forEach((f) => console.log(`  - ${f.id}: ${f.name}`));
  }
}

main().catch((e) => {
  console.error("[kritik hata]", e);
  process.exit(1);
});
