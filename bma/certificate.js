// certificate.js — Kişiye Özel Hat Sanatı Sertifikası
//
// Kullanıcı "Mihrap Fatihi" (bir ilçedeki tüm camileri tamamlama) veya
// "Bursa Fatihi" (envanterdeki tüm camileri tamamlama) unvanına ulaştığında,
// isminin geleneksel hat sanatı hissiyatlı bir fontla (Great Vibes / Amiri)
// işlendiği, çerçeveletilip asılabilecek kalitede yüksek çözünürlüklü bir
// dijital tablo (PNG/PDF) üretir. Mevcut "İstatistiklerini Paylaş"
// (backup.js) özelliğinden farklı olarak; sosyal medya paylaşım kartı değil,
// baskıya/çerçeveye uygun sanatsal bir sertifikadır.
//
// Sertifikanın kazanılması gereken en düşük eşik: UNVAN_TIERS içindeki
// index 3 ("Mihrap Fatihi") ve üzeri (bkz. stats.js — getCurrentUnvan).

const CERT_SEEN_KEY = 'manevi-atlas-certificate-tier-seen';
let certificateCanvasCache = null;

// Küçük bir metni verilen genişliğe sığacak şekilde birden çok satıra böler.
function certWrapText(ctx, text, maxWidth) {
  const words = (text || '').split(' ');
  const lines = [];
  let line = '';
  words.forEach(word => {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// İznik çinisi esintili küçük bir lale/rozet motifi (tek bir birim).
function certDrawTileMotif(ctx, cx, cy, size, colorMain, colorAccent) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = colorMain;
  ctx.lineWidth = Math.max(1, size * 0.045);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.62, -size * 0.32);
  ctx.lineTo(size * 0.62, size * 0.32);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.62, size * 0.32);
  ctx.lineTo(-size * 0.62, -size * 0.32);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = colorAccent;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Kenarlar boyunca tekrarlayan çini şeridi çizer.
function certDrawTileBorder(ctx, W, H, inset, gold, tealDeep) {
  const step = 46;
  for (let x = inset + step / 2; x < W - inset; x += step) {
    certDrawTileMotif(ctx, x, inset - 14, 12, gold, tealDeep);
    certDrawTileMotif(ctx, x, H - inset + 14, 12, gold, tealDeep);
  }
  for (let y = inset + step / 2; y < H - inset; y += step) {
    certDrawTileMotif(ctx, inset - 14, y, 12, gold, tealDeep);
    certDrawTileMotif(ctx, W - inset + 14, y, 12, gold, tealDeep);
  }
}

function certDrawCornerMedallion(ctx, cx, cy, r, gold, goldSoft, tealDeep) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = tealDeep;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = goldSoft;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.4, r * 0.09, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// Alt bilgi bölümündeki mühür/tuğra rozeti.
function certDrawSeal(ctx, cx, cy, r, gold, goldSoft, tealDeep) {
  ctx.save();
  ctx.translate(cx, cy);
  const grad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
  grad.addColorStop(0, goldSoft);
  grad.addColorStop(1, gold);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = tealDeep;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = tealDeep;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(r * 0.62)}px 'Playfair Display', serif`;
  ctx.fillText('BMA', 0, r * 0.06);
  ctx.font = `600 ${Math.round(r * 0.16)}px sans-serif`;
  ctx.fillText('MANEVİ ATLAS', 0, r * 0.42);
  ctx.restore();
}

async function certLoadFonts() {
  try {
    await Promise.all([
      document.fonts.load('italic 700 60px Amiri'),
      document.fonts.load('400 60px "Great Vibes"'),
      document.fonts.load('800 40px "Playfair Display"'),
      document.fonts.load('italic 500 40px "Playfair Display"')
    ]);
    await document.fonts.ready;
  } catch (e) {
    // Fontlar yüklenemezse tarayıcı sistem fontuna düşer; sertifika yine üretilir.
  }
}

function certBuildData() {
  const unvan = (typeof getCurrentUnvan === 'function') ? getCurrentUnvan() : null;
  const name = localStorage.getItem('manevi-atlas-username') || 'Seyyah';
  const totalMosques = (typeof PRESET_MOSQUES !== 'undefined') ? PRESET_MOSQUES.length : 0;
  const visitedMosqueIds = new Set((window.visitsData || []).map(v => v.mosqueId));
  const visitedCount = (typeof PRESET_MOSQUES !== 'undefined') ? PRESET_MOSQUES.filter(m => visitedMosqueIds.has(m.id)).length : 0;
  const totalVisits = (window.visitsData || []).length;
  const streak = (typeof computeStreak === 'function') ? computeStreak() : 0;
  const completionPerc = totalMosques ? Math.round((visitedCount / totalMosques) * 100) : 0;
  const dateLabel = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  return { unvan, name, totalMosques, visitedCount, totalVisits, streak, completionPerc, dateLabel };
}

async function renderCertificateCanvas(data) {
  await certLoadFonts();

  const W = 2000, H = 1414; // A4 yatay orana yakın, çerçeveye uygun yüksek çözünürlük
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const paper = '#FBF6E9', paperDeep = '#F2E9D2', ink = '#241F17', inkSoft = '#5B5445';
  const tealDeep = '#082B25', teal900 = '#0C3A32';
  const gold = '#B7893A', goldDeep = '#8C6A22', goldSoft = '#E7D4A0';

  // Zemin
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, paper);
  bgGrad.addColorStop(1, paperDeep);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Dış çerçeve
  ctx.strokeStyle = goldDeep;
  ctx.lineWidth = 6;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  // İznik çinisi esintili tekrarlayan motif şeridi
  certDrawTileBorder(ctx, W, H, 90, gold, teal900);

  // Köşe madalyonları
  certDrawCornerMedallion(ctx, 92, 92, 34, gold, goldSoft, tealDeep);
  certDrawCornerMedallion(ctx, W - 92, 92, 34, gold, goldSoft, tealDeep);
  certDrawCornerMedallion(ctx, 92, H - 92, 34, gold, goldSoft, tealDeep);
  certDrawCornerMedallion(ctx, W - 92, H - 92, 34, gold, goldSoft, tealDeep);

  ctx.textAlign = 'center';

  // Üst amblem (kemer + cami motifi)
  ctx.font = '64px sans-serif';
  ctx.fillText('🕌', W / 2, 195);

  // Üst etiket
  ctx.fillStyle = goldDeep;
  ctx.font = '600 30px sans-serif';
  ctx.fillText('B U R S A   M A N E V İ   A T L A S I', W / 2, 245);

  ctx.fillStyle = inkSoft;
  ctx.font = 'italic 500 26px "Playfair Display", serif';
  ctx.fillText('Hat Sanatı Sertifikası', W / 2, 280);

  // Ayraç
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W / 2 - 140, 305); ctx.lineTo(W / 2 + 140, 305); ctx.stroke();

  // Unvan (kazanılan makam)
  const title = data.unvan && data.unvan.current ? data.unvan.current.title : 'Manevi Seyyah';
  ctx.fillStyle = goldDeep;
  ctx.font = 'italic 700 78px Amiri, serif';
  ctx.fillText(title.toLocaleUpperCase('tr-TR'), W / 2, 400);

  ctx.fillStyle = inkSoft;
  ctx.font = '600 24px sans-serif';
  ctx.fillText('unvanına layık görülmüştür', W / 2, 440);

  // İsim — hat sanatı hissiyatlı imza fontu
  ctx.fillStyle = tealDeep;
  ctx.font = '400 150px "Great Vibes", cursive';
  ctx.fillText(data.name, W / 2, 590);

  // Unvan açıklaması (kazanılan makamın tarifi)
  const desc = (data.unvan && data.unvan.current) ? data.unvan.current.desc : '';
  ctx.fillStyle = inkSoft;
  ctx.font = 'italic 500 30px "Playfair Display", serif';
  const descLines = certWrapText(ctx, desc, W - 480);
  let dy = 660;
  descLines.forEach(line => { ctx.fillText(line, W / 2, dy); dy += 40; });

  // Ayraç
  ctx.strokeStyle = 'rgba(140,106,34,0.35)';
  ctx.beginPath(); ctx.moveTo(220, dy + 20); ctx.lineTo(W - 220, dy + 20); ctx.stroke();

  // İstatistik sütunları
  const statsY = dy + 100;
  const stats = [
    [`${data.visitedCount} / ${data.totalMosques}`, 'Ziyaret Edilen Cami'],
    [`%${data.completionPerc}`, 'Tamamlanma'],
    [`${data.totalVisits}`, 'Toplam Vakit'],
    [`🔥 ${data.streak}`, 'Gün Serisi']
  ];
  const colW = (W - 440) / stats.length;
  stats.forEach((s, i) => {
    const cx = 220 + colW * i + colW / 2;
    ctx.fillStyle = teal900;
    ctx.font = '800 46px sans-serif';
    ctx.fillText(s[0], cx, statsY);
    ctx.fillStyle = inkSoft;
    ctx.font = '600 20px sans-serif';
    ctx.fillText(s[1], cx, statsY + 32);
  });

  // Alt bilgi: tarih (sol) + mühür (sağ) + site (orta)
  const footerY = H - 130;
  ctx.textAlign = 'left';
  ctx.fillStyle = inkSoft;
  ctx.font = '600 22px sans-serif';
  ctx.fillText(`Tanzim Tarihi: ${data.dateLabel}`, 150, footerY);

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(91,84,69,0.7)';
  ctx.font = '500 20px sans-serif';
  ctx.fillText('umitozguler.com.tr/bma', W / 2, footerY);

  certDrawSeal(ctx, W - 190, footerY - 20, 62, gold, goldSoft, tealDeep);

  return canvas;
}

// === UNVANA GÖRE BUTON DURUMU ===
window.updateCertificateButtonUI = function () {
  const btn = document.getElementById('certificateBtn');
  const statusText = document.getElementById('certificateStatusText');
  if (!btn || typeof getCurrentUnvan !== 'function') return;

  const unvan = getCurrentUnvan();
  const eligible = !!(unvan.current && UNVAN_TIERS.findIndex(t => t.key === unvan.current.key) >= 3);

  if (eligible) {
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed');
    if (statusText) {
      statusText.textContent = `"${unvan.current.title}" unvanını kazandın! Adının hat sanatıyla işlendiği kişiye özel sertifikanı görüntüleyip indirebilirsin.`;
    }
    // İlk kez bu kademeye ulaşıldığında bir kereye mahsus bildirim göster
    try {
      const seen = JSON.parse(localStorage.getItem(CERT_SEEN_KEY) || '{}');
      if (!seen[unvan.current.key]) {
        seen[unvan.current.key] = true;
        localStorage.setItem(CERT_SEEN_KEY, JSON.stringify(seen));
        if (typeof showToast === 'function') {
          showToast(`Tebrikler! "${unvan.current.title}" unvanını kazandın. Hat Sanatı Sertifikan Profil sekmende hazır.`, 'success');
        }
      }
    } catch (e) {}
  } else {
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    if (statusText) {
      statusText.textContent = '"Mihrap Fatihi" veya "Bursa Fatihi" unvanını kazandığında; adının geleneksel hat sanatı fontuyla işlendiği, çerçeveletip asabileceğin yüksek çözünürlüklü kişiye özel bir sertifika burada seni bekleyecek.';
    }
  }
};

window.openCertificateModal = async function () {
  const unvan = (typeof getCurrentUnvan === 'function') ? getCurrentUnvan() : null;
  const eligible = !!(unvan && unvan.current && UNVAN_TIERS.findIndex(t => t.key === unvan.current.key) >= 3);
  if (!eligible) {
    if (typeof showToast === 'function') showToast('Sertifika için önce "Mihrap Fatihi" unvanını kazanmalısın.', 'error');
    return;
  }

  window.haptic && window.haptic(15);
  document.getElementById('certificateModal').classList.remove('hidden');
  document.getElementById('certificateLoading').classList.remove('hidden');
  document.getElementById('certificatePreviewImg').classList.add('hidden');

  try {
    const data = certBuildData();
    const canvas = await renderCertificateCanvas(data);
    certificateCanvasCache = canvas;
    const img = document.getElementById('certificatePreviewImg');
    img.src = canvas.toDataURL('image/png', 0.92);
    document.getElementById('certificateLoading').classList.add('hidden');
    img.classList.remove('hidden');
  } catch (e) {
    console.error('[openCertificateModal] Sertifika oluşturulamadı:', e);
    if (typeof showToast === 'function') showToast('Sertifika oluşturulurken bir hata oluştu.', 'error');
    closeCertificateModal();
  }
};

window.closeCertificateModal = function () {
  document.getElementById('certificateModal').classList.add('hidden');
};
document.getElementById('certificateModal') && document.getElementById('certificateModal').addEventListener('click', function (e) {
  if (e.target === this) closeCertificateModal();
});

window.downloadCertificatePNG = function () {
  if (!certificateCanvasCache) return;
  window.haptic && window.haptic(15);
  const stamp = new Date().toISOString().slice(0, 10);
  certificateCanvasCache.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bursa-manevi-atlas-hat-sanati-sertifikasi-${stamp}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('Sertifika görseli indirildi.', 'success');
  }, 'image/png', 1.0);
};

window.downloadCertificatePDF = function () {
  if (!certificateCanvasCache) return;
  if (!window.jspdf || !window.jspdf.jsPDF) {
    if (typeof showToast === 'function') showToast('PDF özelliği yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.', 'error');
    return;
  }
  window.haptic && window.haptic(15);
  try {
    const { jsPDF } = window.jspdf;
    const imgData = certificateCanvasCache.toDataURL('image/png', 1.0);
    const pdfWidthMM = 297; // A4 yatay genişlik
    const pdfHeightMM = pdfWidthMM * (certificateCanvasCache.height / certificateCanvasCache.width);
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [pdfWidthMM, pdfHeightMM] });
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidthMM, pdfHeightMM);
    const stamp = new Date().toISOString().slice(0, 10);
    doc.save(`bursa-manevi-atlas-hat-sanati-sertifikasi-${stamp}.pdf`);
    if (typeof showToast === 'function') showToast('Sertifika PDF olarak indirildi.', 'success');
  } catch (e) {
    console.error('[downloadCertificatePDF] hata:', e);
    if (typeof showToast === 'function') showToast('PDF oluşturulamadı: ' + e.message, 'error');
  }
};
