/* Lumina Studio — arayüz + PWA kaydı */
const E = LuminaEngine;
let P = E.defaultParams();
const DEF = E.defaultParams();
const $ = (id) => document.getElementById(id);
const view = $('view'), vctx = view.getContext('2d', { willReadFrequently: true });
const ph = document.querySelector('.photo'), stage = document.querySelector('.stage');
let src = null, baseP = null, baseD = null, last = null, comparing = false, hslSel = 5;
let zoomValue = 48, tx = 0, ty = 0;

/* ---------- yardımcılar ---------- */
function toast(msg) { const t = $('toast'); t.textContent = '✓  ' + msg; t.classList.add('show'); clearTimeout(window.tt); window.tt = setTimeout(() => t.classList.remove('show'), 1800); }
const getp = (o, path) => path.split('.').reduce((a, k) => a[k], o);
function setp(o, path, v) { const k = path.split('.'); const l = k.pop(); k.reduce((a, q) => a[q], o)[l] = v; }

/* ---------- geçmiş ---------- */
const H = { s: [JSON.stringify(P)], i: 0 };
function commit() { const j = JSON.stringify(P); if (j === H.s[H.i]) return; H.s = H.s.slice(0, H.i + 1); H.s.push(j); if (H.s.length > 60) H.s.shift(); H.i = H.s.length - 1; updUndo(); }
function undo(d) { const i = H.i + d; if (i < 0 || i >= H.s.length) return; H.i = i; P = JSON.parse(H.s[i]); populate(); schedule(); updUndo(); }
function updUndo() { $('undo').style.opacity = H.i > 0 ? 1 : .35; $('redo').style.opacity = H.i < H.s.length - 1 ? 1 : .35; }

/* ---------- görüntü kaynağı & işleme ---------- */
function makeBase(max) {
  const s = Math.min(1, max / Math.max(src.width, src.height));
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(src.width * s)); c.height = Math.max(1, Math.round(src.height * s));
  const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, c.width, c.height);
  return x.getImageData(0, 0, c.width, c.height);
}
function draw(base) {
  const im = new ImageData(new Uint8ClampedArray(base.data), base.width, base.height);
  E.process(im, P);
  if (view.width !== im.width || view.height !== im.height) { view.width = im.width; view.height = im.height; }
  vctx.putImageData(im, 0, 0); return im;
}
let raf = 0, idle = 0;
function schedule() {
  if (!baseD) return;
  if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (!comparing) draw(baseD); });
  clearTimeout(idle);
  idle = setTimeout(() => { if (!comparing) { last = draw(baseP); hist(last); } }, 200);
}
function hist(im) {
  const h = E.histogram(im, 32).l;
  $('hist').innerHTML = Array.from(h, (v) => `<i style="height:${Math.max(3, v * 100)}%"></i>`).join('');
}
function setSource(canvas, name) {
  src = canvas;
  const mobile = matchMedia('(pointer:coarse)').matches;
  baseP = makeBase(mobile ? 1400 : 1800); baseD = makeBase(520);
  $('pname').textContent = name; $('fname').textContent = name;
  $('dims').textContent = `${(src.width * src.height / 1e6).toFixed(1)} MP · ${src.width} × ${src.height}`;
  $('meta').textContent = `${src.width} × ${src.height}`;
  view.width = baseP.width; view.height = baseP.height;
  fit(true); layoutPhoto(); last = draw(baseP); hist(last);
}
function sampleCanvas() {
  const c = document.createElement('canvas'); c.width = 1600; c.height = 1000; const x = c.getContext('2d');
  let g = x.createLinearGradient(0, 0, 0, 700); g.addColorStop(0, '#26335c'); g.addColorStop(.55, '#c47a6a'); g.addColorStop(1, '#f2b866');
  x.fillStyle = g; x.fillRect(0, 0, 1600, 1000);
  g = x.createRadialGradient(1050, 600, 10, 1050, 600, 420); g.addColorStop(0, '#fff2c0'); g.addColorStop(1, 'rgba(255,200,120,0)');
  x.fillStyle = g; x.fillRect(0, 0, 1600, 1000);
  [['#6f6a8f', 520, 110, .004], ['#4b5a6a', 640, 130, .006], ['#2c4140', 760, 150, .009], ['#16241f', 880, 90, .013]].forEach(([col, base, amp, f], k) => {
    x.fillStyle = col; x.beginPath(); x.moveTo(0, 1000);
    for (let i = 0; i <= 1600; i += 8) x.lineTo(i, base - amp * (Math.abs(Math.sin(i * f + k * 2)) + .5 * Math.sin(i * f * 2.7 + k)));
    x.lineTo(1600, 1000); x.fill();
  });
  return c;
}
async function loadFile(file) {
  try {
    let bmp;
    try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) { bmp = await createImageBitmap(file); }
    const s = Math.min(1, 4096 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(bmp, 0, 0, c.width, c.height);
    setSource(c, file.name.replace(/\.[^.]+$/, '') || 'Fotoğraf'); toast('Fotoğraf açıldı');
  } catch (e) { toast('Bu görüntü açılamadı'); }
}
function openFile() { $('file').click(); }
$('file').addEventListener('change', (e) => { if (e.target.files[0]) loadFile(e.target.files[0]); e.target.value = ''; });
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) loadFile(f); });

/* ---------- dışa aktarma ---------- */
async function exportImage() {
  if (!src) return;
  toast('Hazırlanıyor…'); await new Promise((r) => setTimeout(r, 40));
  try {
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(src, 0, 0);
    const im = x.getImageData(0, 0, c.width, c.height); E.process(im, P); x.putImageData(im, 0, 0);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', .93));
    const name = ($('fname').textContent || 'foto') + '-lumina.jpg';
    const file = new File([blob], name, { type: 'image/jpeg' });
    if (matchMedia('(pointer:coarse)').matches && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('JPG indirildi');
  } catch (e) { toast('Dışa aktarma başarısız (bellek?)'); }
}

/* ---------- panel: kaydırıcılar ---------- */
function row(label, path, min = -100, max = 100, step = 1) {
  const v = getp(P, path), z = Math.max(0, Math.min(1, (0 - min) / (max - min)));
  return `<div class="row"><div class="meta"><span>${label}</span><b data-d="${getp(DEF, path)}" onclick="resetRow(this)">${fmt(v, min, step)}</b></div><div class="range"><input type="range" data-path="${path}" min="${min}" max="${max}" step="${step}" value="${v}" oninput="adjust(this)" onchange="commit()"><div class="track"><span class="center" style="left:${z * 100}%"></span><span class="fill"></span></div></div></div>`;
}
const fmt = (v, min, step) => (v > 0 && min < 0 ? '+' : '') + (step < 1 ? v.toFixed(step < .1 ? 2 : 1) : Math.round(v));
function paint(input) {
  const v = Number(input.value), min = Number(input.min), max = Number(input.max), pct = (v - min) / (max - min) * 100, z = (0 - min) / (max - min) * 100;
  const f = input.parentElement.querySelector('.fill'), zz = Math.max(0, Math.min(100, z));
  f.style.left = Math.min(zz, pct) + '%'; f.style.width = Math.abs(pct - zz) + '%';
  const b = input.parentElement.parentElement.querySelector('b'); b.textContent = fmt(v, min, Number(input.step));
  b.classList.toggle('mod', v !== Number(b.dataset.d));
}
function adjust(input) {
  paint(input); setp(P, input.dataset.path, Number(input.value));
  if (input.dataset.path.startsWith('mask.')) P.mask.on = !!(P.mask.exposure || P.mask.clarity);
  schedule();
}
function resetRow(b) { const i = b.closest('.row').querySelector('input'); i.value = b.dataset.d; adjust(i); commit(); }
function bindAll() { document.querySelectorAll('input[data-path]').forEach(paint); }
function populate() {
  const set = (id, h) => { $(id).innerHTML = h; };
  set('lightRows', row('Pozlama', 'exposure', -5, 5, .01) + row('Kontrast', 'contrast') + row('Açık tonlar', 'highlights') + row('Gölgeler', 'shadows') + row('Beyazlar', 'whites') + row('Siyahlar', 'blacks'));
  set('wbRows', row('Sıcaklık', 'temp') + row('Ton', 'tint'));
  set('colorRows', row('Canlılık', 'vibrance') + row('Doygunluk', 'saturation'));
  const h = `hsl.${hslSel}.`;
  set('hslRows', row('Ton', h + 'h') + row('Doygunluk', h + 's') + row('Işıklılık', h + 'l'));
  set('gradingRows', row('Karıştırma', 'grade.blend', 0, 100) + row('Denge', 'grade.balance'));
  set('detailRows', row('Doku', 'texture') + row('Netlik', 'clarity') + row('Pus giderme', 'dehaze') + row('Keskinleştirme', 'sharpen', 0, 100) + row('Yarıçap', 'sharpRadius', 0, 3, .1) + row('Detay', 'sharpDetail', 0, 100) + row('Maskeleme', 'sharpMask', 0, 100));
  set('effectRows', row('Vinyet', 'vignette') + row('Orta nokta', 'vigMid', 0, 100) + row('Yuvarlaklık', 'vigRound') + row('Geçiş yumuşatma', 'vigFeather', 0, 100) + row('Açık tonlar', 'vigHighlights', 0, 100) + row('Tane', 'grain', 0, 100) + row('Boyut', 'grainSize', 0, 100) + row('Pürüzlülük', 'grainRough', 0, 100));
  set('calRows', row('Gölgeler Ton', 'cal.shTint') + row('Red Primary · Ton', 'cal.rH') + row('Red Primary · Doygunluk', 'cal.rS') + row('Green Primary · Ton', 'cal.gH') + row('Green Primary · Doygunluk', 'cal.gS') + row('Blue Primary · Ton', 'cal.bH') + row('Blue Primary · Doygunluk', 'cal.bS'));
  set('maskRows', row('Mask Pozlama', 'mask.exposure', -2, 2, .01) + row('Mask Netlik', 'mask.clarity'));
  bindAll();
}
const PRESET = { exposure: -.65, contrast: 28, highlights: -55, shadows: -25, whites: -18, blacks: -32, temp: -6, tint: 2, vibrance: -5, saturation: -8, 'hsl.5.s': -15, 'hsl.5.l': -18, 'grade.blend': 42, 'grade.balance': -12, 'grade.sh.s': 30, 'grade.sh.h': 200, 'grade.hi.s': 22, 'grade.hi.h': 40, texture: 15, clarity: 18, dehaze: 22, sharpen: 40, sharpRadius: .9, sharpMask: 60, vignette: -15, vigMid: 35, vigFeather: 75, grain: 8, grainSize: 20, grainRough: 30, 'cal.rH': 5, 'cal.rS': -5, 'cal.gH': -10, 'cal.gS': -5, 'cal.bH': -10, 'cal.bS': -10 };
function applyPreset() { for (const k in PRESET) setp(P, k, PRESET[k]); populate(); schedule(); commit(); toast('Sinematik Alpler uygulandı'); }
function resetAll() { const g = P.geo; P = E.defaultParams(); P.geo = g; populate(); schedule(); commit(); toast('Tüm ayarlar sıfırlandı'); }
function copySettings() { try { navigator.clipboard.writeText(JSON.stringify(P)); toast('Ayarlar panoya kopyalandı'); } catch (e) { toast('Kopyalanamadı'); } }

/* ---------- karşılaştır / kılavuz / yakınlaştırma ---------- */
function setBefore(on) {
  if (!baseP || comparing === on) return; comparing = on;
  if (on) { vctx.putImageData(baseP, 0, 0); } else if (last) { vctx.putImageData(last, 0, 0); }
  $('status').textContent = on ? '● Orijinal · Ayar yok' : '● Canlı önizleme';
}
function toggleBefore() { setBefore(!comparing); }
function toggleGrid() { ph.classList.toggle('grid'); }
function layoutPhoto() {
  const cs = getComputedStyle(stage), aw = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), ah = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const ar = view.width / view.height; let w = aw, h = w / ar; if (h > ah) { h = ah; w = h * ar; }
  ph.style.width = Math.max(40, w) + 'px'; ph.style.height = Math.max(40, h) + 'px';
}
function applyView() { ph.style.transform = `translate(${tx}px,${ty}px) scale(${zoomValue / 48})`; $('zoom').textContent = zoomValue + '%'; }
function zoom(n) { zoomValue = Math.round(Math.max(25, Math.min(480, zoomValue * (n > 0 ? 1.25 : .8)))); if (zoomValue <= 48) { tx = ty = 0; } applyView(); }
function fit(silent) { zoomValue = 48; tx = ty = 0; applyView(); if (silent !== true) toast('Canvas fit edildi'); }
const ptrs = new Map(); let pinch = 0;
stage.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; stage.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); pinch = 0; });
stage.addEventListener('pointermove', (e) => {
  const p = ptrs.get(e.pointerId); if (!p) return;
  if (ptrs.size === 2) {
    ptrs.set(e.pointerId, [e.clientX, e.clientY]); const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (pinch) { zoomValue = Math.round(Math.max(25, Math.min(480, zoomValue * d / pinch))); applyView(); } pinch = d; return;
  }
  if (zoomValue > 48) { tx += e.clientX - p[0]; ty += e.clientY - p[1]; applyView(); }
  ptrs.set(e.pointerId, [e.clientX, e.clientY]);
});
['pointerup', 'pointercancel'].forEach((t) => stage.addEventListener(t, (e) => { ptrs.delete(e.pointerId); pinch = 0; }));
stage.addEventListener('wheel', (e) => { e.preventDefault(); zoom(e.deltaY < 0 ? 1 : -1); }, { passive: false });
stage.addEventListener('dblclick', () => fit(true));
new ResizeObserver(layoutPhoto).observe(stage);

/* ---------- orijinal arayüz davranışları ---------- */
function tool(el, name) { document.querySelectorAll('.rail-btn').forEach((x) => x.classList.remove('active')); el.classList.add('active'); toast(name + ' aracı şimdilik önizleme'); }
function toggleSection(btn) { const body = btn.nextElementSibling, closed = body.style.display === 'none'; body.style.display = closed ? 'block' : 'none'; btn.querySelector('b').textContent = closed ? '⌄' : '›'; }
function filterSections(q) { document.querySelectorAll('.section').forEach((s) => s.style.display = s.textContent.toLowerCase().includes(q.toLowerCase()) ? 'block' : 'none'); }
function activateButtons() {
  document.querySelectorAll('.modes button').forEach((b) => b.addEventListener('click', () => { document.querySelectorAll('.modes button').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); }));
  document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => { document.querySelectorAll('.tabs button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); }));
  document.querySelectorAll('.channels button').forEach((b) => b.addEventListener('click', () => { document.querySelectorAll('.channels button').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); }));
  document.querySelectorAll('.swatches i').forEach((s, i) => s.addEventListener('click', () => {
    document.querySelectorAll('.swatches i').forEach((x) => x.style.borderColor = 'transparent'); s.style.borderColor = '#fff';
    hslSel = i; populate(); toast(E.HSL_NAMES[i] + ' kanalı seçildi');
  }));
}

/* ---------- başlangıç ---------- */
const cmp = $('cmp');
cmp.addEventListener('pointerdown', (e) => { e.preventDefault(); setBefore(true); });
['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => cmp.addEventListener(t, () => setBefore(false)));
cmp.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(e.shiftKey ? 1 : -1); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); undo(1); }
  else if (e.key === '\\') setBefore(true);
});
document.addEventListener('keyup', (e) => { if (e.key === '\\') setBefore(false); });
populate(); activateButtons(); updUndo();
setSource(sampleCanvas(), 'Örnek manzara');
if (matchMedia('(max-width:899px)').matches) document.querySelectorAll('.section-head').forEach((b, i) => { if (i) toggleSection(b); });

/* ---------- PWA ---------- */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
let deferred = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; $('install').hidden = false; });
$('install').addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('install').hidden = true; });
addEventListener('appinstalled', () => { $('install').hidden = true; toast('Lumina yüklendi'); });
if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone && !localStorage.getItem('lumina.ios')) {
  const b = $('ios'); b.hidden = false; $('iosClose').onclick = () => { b.hidden = true; try { localStorage.setItem('lumina.ios', '1'); } catch (e) { } };
}
