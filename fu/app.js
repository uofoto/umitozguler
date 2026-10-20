(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const els = {
    fileInput: $('#fileInput'), openBtn: $('#openBtn'), emptyOpen: $('#emptyOpen'), dropzone: $('#dropzone'), replaceBtn: $('#replaceBtn'),
    dropTitle: $('#dropTitle'), dropHint: $('#dropHint'), fileCard: $('#fileCard'), fileName: $('#fileName'), fileMeta: $('#fileMeta'),
    sceneLabel: $('#sceneLabel'), sceneNote: $('#sceneNote'), autoBtn: $('#autoBtn'), aiPrompt: $('#aiPrompt'), aiApply: $('#aiApply'), localApply: $('#localApply'), keyBtn: $('#keyBtn'),
    workspaceTitle: $('#workspaceTitle'), stage: $('#stage'), emptyState: $('#emptyState'), previewWrap: $('#previewWrap'), originalCanvas: $('#originalCanvas'),
    editedCanvas: $('#editedCanvas'), compareDivider: $('#compareDivider'), stageResolution: $('#stageResolution'), stageFormat: $('#stageFormat'),
    zoomIn: $('#zoomIn'), zoomOut: $('#zoomOut'), zoomLabel: $('#zoomLabel'), fitBtn: $('#fitBtn'), compareHold: $('#compareHold'), splitBtn: $('#splitBtn'),
    splitControl: $('#splitControl'), splitRange: $('#splitRange'), splitOutput: $('#splitOutput'), undoBtn: $('#undoBtn'), redoBtn: $('#redoBtn'),
    resetBtn: $('#resetBtn'), historyCount: $('#historyCount'), adjustFieldset: $('#adjustFieldset'), formatSelect: $('#formatSelect'), quality: $('#quality'),
    qualityOutput: $('#qualityOutput'), qualityRow: $('#qualityRow'), exportNote: $('#exportNote'), downloadBtn: $('#downloadBtn'), headerExport: $('#headerExport'),
    originalDownload: $('#originalDownload'), statusText: $('#statusText'), statusLight: $('#statusLight'), progressTrack: $('#progressTrack'),
    progressFill: $('#progressFill'), settingsDialog: $('#settingsDialog'), apiKey: $('#apiKey'), modelName: $('#modelName'), clearKey: $('#clearKey'),
    filterLibraryBtn: $('#filterLibraryBtn'), filterDialog: $('#filterDialog'), filterDialogClose: $('#filterDialogClose'),
    filterCategories: $('#filterCategories'), filterSearch: $('#filterSearch'), filterGrid: $('#filterGrid'), filterResultsCount: $('#filterResultsCount'),
    waterMaskCanvas: $('#waterMaskCanvas'), waterBrushBtn: $('#waterBrushBtn'), waterEraserBtn: $('#waterEraserBtn'),
    waterMaskClear: $('#waterMaskClear'), waterMaskHint: $('#waterMaskHint'), waterBrushSize: $('#waterBrushSize'),
    installButton: $('#installAppBtn'), installButtonLabel: $('#installButtonLabel'),
    installDialog: $('#installDialog'), installDialogClose: $('#installDialogClose'), installSecurityNote: $('#installSecurityNote'),
    installIOSGuide: $('#installIOSGuide'), installAndroidGuide: $('#installAndroidGuide'), installDesktopGuide: $('#installDesktopGuide'),
  };
  const DEFAULTS = Object.freeze({ exposure: 0, contrast: 0, highlights: 0, shadows: 0, temperature: 0, saturation: 0, vibrance: 0, sharpness: 0, denoise: 0, fog: 0, vignette: 0, fade: 0, water: 0, waterDirection: 90, effectStrength: 100, sunGlow: 0, glow: 0, grain: 0 });
  const SETTING_NAMES = Object.keys(DEFAULTS);
  const MAX_HISTORY = 40;
  let originalBitmap = null;
  let originalFile = null;
  let sceneStats = null;
  let state = { values: { ...DEFAULTS }, generatedBitmap: null };
  let history = [];
  let historyIndex = -1;
  let isBusy = false;
  let splitVisible = false;
  let comparePressed = false;
  let zoom = 1;
  let previewToken = 0;
  let scheduledPreview = 0;
  let lastSliderState = '';
  let activeFilterCategory = 'all';
  let waterBrushActive = false;
  let waterBrushErase = false;
  let activeWaterStroke = null;
  let waterMaskPreviewCache = null;
  let deferredInstallPrompt = null;
  let appWasInstalled = false;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const normalizeSearchText = (text) => String(text).toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll('ı', 'i');
  const setMessage = (text, type = 'normal') => {
    els.statusText.textContent = text;
    els.statusLight.className = `status-light${type === 'error' ? ' error' : type === 'busy' ? ' busy' : ''}`;
  };
  const isAppleMobile = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroidMobile = () => /android/i.test(navigator.userAgent);

  function updateInstallButton() {
    const standalone = appWasInstalled || navigator.standalone === true || !!window.matchMedia?.('(display-mode: standalone)').matches;
    els.installButton.hidden = standalone;
    const label = isAppleMobile() ? 'Ana ekrana ekle' : isAndroidMobile() ? 'Uygulamayı yükle' : 'Telefona kur';
    els.installButtonLabel.textContent = label;
    els.installButton.setAttribute('aria-label', label);
    els.installButton.title = label;
  }

  function showInstallInstructions() {
    const ios = isAppleMobile();
    const android = isAndroidMobile();
    const localHost = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
    const secure = location.protocol === 'https:' || (location.protocol === 'http:' && localHost);
    els.installIOSGuide.hidden = !ios;
    els.installAndroidGuide.hidden = !android;
    els.installDesktopGuide.hidden = ios || android;
    els.installSecurityNote.textContent = location.protocol === 'https:'
      ? 'Bu site HTTPS üzerinden sunuluyor. Kurulum için aynı adresi telefonda tarayıcıda aç. İndirilmiş index.html dosyasını tek başına açmak uygulama kurmaz.'
      : secure
        ? 'Bu yerel test adresi yükleme denemesi için kullanılabilir. Telefonunda kullanmak için sitenin HTTPS adresini aç; indirilen index.html tek başına kurulamaz.'
      : 'Önce siteni HTTPS adresinden aç. file:// ile açılan indirilen index.html sayfası uygulama olarak kurulamaz.';
    try { els.installDialog.showModal(); }
    catch (_) { setMessage('Kurulum yönergeleri bu tarayıcıda açılamadı. HTTPS site adresini telefonda Safari veya Chrome ile aç.'); }
  }

  function setupInstallSupport() {
    updateInstallButton();
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      updateInstallButton();
    });
    window.addEventListener('appinstalled', () => {
      appWasInstalled = true;
      deferredInstallPrompt = null;
      updateInstallButton();
      setMessage('Fotoğraf Ustası telefona kuruldu. Uygulamayı ana ekrandan açabilirsin.');
    });
    els.installButton.addEventListener('click', async () => {
      if (!deferredInstallPrompt) { showInstallInstructions(); return; }
      const prompt = deferredInstallPrompt;
      deferredInstallPrompt = null;
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        setMessage(choice.outcome === 'accepted' ? 'Kurulum başlatıldı; uygulama telefona eklendiğinde ana ekrandan açabilirsin.' : 'Kurulum iptal edildi. İstediğinde yeniden deneyebilirsin.');
      } catch (_) {
        setMessage('Tarayıcı kurulum penceresini açamadı. Menüden “Uygulamayı yükle” veya “Ana ekrana ekle” seçeneğini kullan.');
      } finally { updateInstallButton(); }
    });
    els.installDialogClose.addEventListener('click', () => els.installDialog.close());
    els.installDialog.addEventListener('click', (event) => { if (event.target === els.installDialog) els.installDialog.close(); });
    const standaloneQuery = window.matchMedia?.('(display-mode: standalone)');
    if (standaloneQuery?.addEventListener) standaloneQuery.addEventListener('change', updateInstallButton);
    else standaloneQuery?.addListener?.(updateInstallButton);
  }
  const setProgress = (value, visible = true) => {
    els.progressTrack.hidden = !visible;
    els.progressFill.style.width = `${clamp(value, 0, 100)}%`;
  };
  const formatBytes = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  const ratioLabel = (w, h) => {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const divisor = gcd(w, h);
    const ratio = `${Math.round(w / divisor)}:${Math.round(h / divisor)}`;
    return (w / h > 1.6 && w / h < 1.9) ? '16:9' : (w / h > 1.3 && w / h < 1.45) ? '4:3' : (w / h > 1.45 && w / h < 1.6) ? '3:2' : ratio;
  };
  const cloneState = (item = state) => ({
    values: { ...item.values },
    generatedBitmap: item.generatedBitmap || null,
    waterMaskStrokes: (item.waterMaskStrokes || []).map((stroke) => ({ ...stroke, points: stroke.points.map((point) => [...point]) })),
  });
  const getSource = () => state.generatedBitmap || originalBitmap;
  const isNeutral = (values) => SETTING_NAMES.every((key) => Number(values[key]) === DEFAULTS[key]);

  function closeDetachedGeneratedBitmaps(candidates) {
    const retained = new Set(history.map((item) => item.generatedBitmap).filter(Boolean));
    if (state.generatedBitmap) retained.add(state.generatedBitmap);
    for (const bitmap of new Set(candidates.filter(Boolean))) {
      if (!retained.has(bitmap)) bitmap.close?.();
    }
  }

  function syncControls() {
    const hasPhoto = !!originalBitmap;
    const enabled = hasPhoto && !isBusy;
    els.openBtn.disabled = isBusy;
    els.emptyOpen.disabled = isBusy;
    els.dropzone.disabled = isBusy;
    els.autoBtn.disabled = !enabled;
    els.aiPrompt.disabled = !enabled;
    els.aiApply.disabled = !enabled;
    els.localApply.disabled = !enabled;
    for (const button of document.querySelectorAll('[data-look]')) button.disabled = !enabled;
    els.filterLibraryBtn.disabled = !enabled;
    els.waterBrushBtn.disabled = !enabled;
    els.waterEraserBtn.disabled = !enabled;
    els.waterMaskClear.disabled = !enabled || !(state.waterMaskStrokes || []).length;
    els.waterBrushBtn.setAttribute('aria-pressed', String(waterBrushActive && !waterBrushErase));
    els.waterEraserBtn.setAttribute('aria-pressed', String(waterBrushActive && waterBrushErase));
    for (const card of els.filterGrid.querySelectorAll('button')) card.disabled = !enabled;
    els.adjustFieldset.disabled = !enabled;
    els.formatSelect.disabled = !enabled;
    els.quality.disabled = !enabled;
    els.downloadBtn.disabled = !enabled;
    els.headerExport.disabled = !enabled;
    els.originalDownload.disabled = !hasPhoto || isBusy;
    els.undoBtn.disabled = !hasPhoto || historyIndex <= 0 || isBusy;
    els.redoBtn.disabled = !hasPhoto || historyIndex >= history.length - 1 || isBusy;
    const hasMaskEdits = (state.waterMaskStrokes || []).length > 0;
    els.resetBtn.disabled = !hasPhoto || (isNeutral(state.values) && !state.generatedBitmap && !hasMaskEdits) || isBusy;
    els.compareHold.disabled = !hasPhoto || isBusy || waterBrushActive;
    els.splitBtn.disabled = !hasPhoto || isBusy || waterBrushActive;
    els.zoomIn.disabled = !hasPhoto || isBusy;
    els.zoomOut.disabled = !hasPhoto || isBusy;
    els.fitBtn.disabled = !hasPhoto || isBusy;
    els.fileInput.disabled = isBusy;
    els.historyCount.textContent = historyIndex > 0 ? `${historyIndex} düzenleme` : 'Henüz düzenleme yok';
    for (const key of SETTING_NAMES) {
      const input = $(`#${key}`);
      if (input && document.activeElement !== input) input.value = String(state.values[key]);
      const output = $(`#value-${key}`);
      if (output) output.value = key === 'waterDirection' ? `${state.values[key]}°` : String(state.values[key]);
    }
    els.qualityOutput.value = `%${els.quality.value}`;
    const type = getImageType();
    const sourceType = getSourceType();
    const sourceName = (sourceType.split('/')[1] || originalFile?.name.split('.').pop() || 'görsel').toUpperCase();
    const sourceEncoder = ['image/jpeg', 'image/png', 'image/webp'].includes(sourceType);
    els.formatSelect.options[0].textContent = hasPhoto
      ? sourceEncoder ? `Orijinal biçim (${sourceName})` : `${sourceName} kaynağı → PNG`
      : 'Orijinal biçim';
    els.qualityRow.hidden = !['image/jpeg', 'image/webp'].includes(type);
    els.stageResolution.textContent = hasPhoto ? `${originalBitmap.width.toLocaleString('tr-TR')} × ${originalBitmap.height.toLocaleString('tr-TR')} px` : '—';
    els.stageFormat.textContent = hasPhoto ? sourceName : '—';
    els.zoomLabel.textContent = hasPhoto ? `${Math.round(zoom * 100)}%` : 'Sığdır';
    els.splitBtn.setAttribute('aria-pressed', String(splitVisible));
    els.splitControl.hidden = !splitVisible;
    els.previewWrap.classList.toggle('split', splitVisible);
    els.previewWrap.classList.toggle('compare-original', comparePressed);
    els.compareDivider.style.left = `${els.splitRange.value}%`;
    const edited = !isNeutral(state.values) || !!state.generatedBitmap;
    els.exportNote.textContent = state.generatedBitmap
      ? 'AI sonucu ayrı kopyadır ve modelin döndürdüğü piksel ölçüsünde kaydedilir; ince ayrıntı ve kamera metaverisi özgün dosyayla aynı olmayabilir. Orijinali aynen indirebilirsin.'
      : edited
        ? 'Yerel efektler özgün piksel boyutunda hesaplanır. Özgün dosyan değişmez; kamera metaverisini aynen korumak için orijinali indir.'
        : 'Özgün piksel boyutu ve dosyan korunur. İşlenmemiş orijinali metaverisiyle aynen indirebilirsin.';
  }

  function pushHistory() {
    const discarded = history.slice(historyIndex + 1).map((item) => item.generatedBitmap);
    history = history.slice(0, historyIndex + 1);
    history.push(cloneState());
    if (history.length > MAX_HISTORY) discarded.push(history.shift().generatedBitmap);
    historyIndex = history.length - 1;
    closeDetachedGeneratedBitmaps(discarded);
    syncControls();
  }

  function resizePreviewCanvases(width, height) {
    for (const canvas of [els.originalCanvas, els.editedCanvas, els.waterMaskCanvas]) {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }
    els.previewWrap.style.width = `${width}px`;
    els.previewWrap.style.height = `${height}px`;
  }

  function getPreviewSize() {
    const bounds = els.stage.getBoundingClientRect();
    const maxWidth = Math.max(80, bounds.width - 44);
    const maxHeight = Math.max(80, bounds.height - 44);
    const naturalW = originalBitmap.width;
    const naturalH = originalBitmap.height;
    const fitScale = Math.min(maxWidth / naturalW, maxHeight / naturalH, 1);
    const scale = fitScale * zoom;
    return { width: Math.max(1, Math.round(naturalW * scale)), height: Math.max(1, Math.round(naturalH * scale)) };
  }

  function filterFor(values) {
    const exposure = 2 ** ((values.exposure / 100) * 1.5);
    const contrast = 1 + values.contrast / 100;
    const saturation = Math.max(0, 1 + values.saturation / 100);
    return `brightness(${exposure}) contrast(${contrast}) saturate(${saturation})`;
  }

  function applySoftGlow(ctx, width, height, strength) {
    const scale = Math.min(1, 260 / Math.max(width, height));
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = Math.max(1, Math.round(width * scale));
    glowCanvas.height = Math.max(1, Math.round(height * scale));
    const glowCtx = glowCanvas.getContext('2d');
    glowCtx.filter = `blur(${Math.max(1, Math.round(strength / 18))}px)`;
    glowCtx.drawImage(ctx.canvas, 0, 0, glowCanvas.width, glowCanvas.height);
    glowCtx.filter = 'none';
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = strength / 100 * .32;
    ctx.drawImage(glowCanvas, 0, 0, width, height);
    ctx.restore();
    glowCanvas.width = 1; glowCanvas.height = 1;
  }

  function applyFilmGrain(ctx, width, height, strength) {
    const tile = document.createElement('canvas');
    tile.width = 96; tile.height = 96;
    const tileCtx = tile.getContext('2d');
    const noise = tileCtx.createImageData(tile.width, tile.height);
    let seed = (width * 73856093 ^ height * 19349663) >>> 0;
    for (let i = 0; i < noise.data.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const value = seed >>> 24;
      noise.data[i] = value; noise.data[i + 1] = value; noise.data[i + 2] = value; noise.data[i + 3] = 170;
    }
    tileCtx.putImageData(noise, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = strength / 100 * .34;
    ctx.fillStyle = ctx.createPattern(tile, 'repeat');
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    tile.width = 1; tile.height = 1;
  }

  function applyLooks(ctx, width, height, values) {
    if (values.fade) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = values.fade / 100 * .24;
      ctx.fillStyle = '#e8ddc9'; ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
    if (values.sunGlow) {
      const strength = values.sunGlow / 100;
      const radius = Math.max(width, height) * .72;
      const sunlight = ctx.createRadialGradient(width * .68, height * .70, 0, width * .68, height * .70, radius);
      sunlight.addColorStop(0, `rgba(255,183,107,${strength * .30})`);
      sunlight.addColorStop(.42, `rgba(255,192,132,${strength * .14})`);
      sunlight.addColorStop(1, 'rgba(255,199,151,0)');
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = sunlight;
      ctx.fillRect(0, 0, width, height); ctx.restore();
    }
    if (values.fog) {
      const strength = values.fog / 100;
      const haze = ctx.createLinearGradient(0, 0, width * .16, height);
      haze.addColorStop(0, `rgba(235,239,238,${strength * .10})`);
      haze.addColorStop(.48, `rgba(235,239,238,${strength * .36})`);
      haze.addColorStop(1, `rgba(235,239,238,${strength * .20})`);
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = haze;
      ctx.fillRect(0, 0, width, height); ctx.restore();
    }
    if (values.glow) applySoftGlow(ctx, width, height, values.glow);
    if (values.vignette) {
      const radius = Math.hypot(width, height) / 2;
      const vignette = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * .22, width / 2, height / 2, radius);
      vignette.addColorStop(0, 'rgba(20,25,22,0)');
      vignette.addColorStop(1, `rgba(20,25,22,${values.vignette / 100 * .48})`);
      ctx.save(); ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height); ctx.restore();
    }
    if (values.grain) applyFilmGrain(ctx, width, height, values.grain);
  }

  const ADJUSTMENT_RANGES = Object.freeze({
    exposure: [-100, 100], contrast: [-50, 50], highlights: [-100, 100], shadows: [-100, 100],
    temperature: [-50, 50], saturation: [-100, 50], vibrance: [0, 100], sharpness: [0, 100],
    denoise: [0, 100], fog: [0, 100], vignette: [0, 100], fade: [0, 100], water: [0, 100],
    sunGlow: [0, 100], glow: [0, 100], grain: [0, 100],
  });

  function amplifyEffects(values) {
    const factor = clamp(Number(values.effectStrength ?? 100), 50, 200) / 100;
    const amplified = { ...values };
    for (const [key, [min, max]] of Object.entries(ADJUSTMENT_RANGES)) amplified[key] = clamp((Number(values[key]) || 0) * factor, min, max);
    return amplified;
  }

  async function renderImage(source, width, height, values, onProgress = null, isCancelled = () => false) {
    values = amplifyEffects(values);
    const needsPixelPass = values.highlights || values.shadows || values.temperature || values.vibrance || values.sharpness || values.denoise || values.water;
    const output = document.createElement('canvas');
    output.width = width;
    output.height = height;
    const outputCtx = output.getContext('2d', { willReadFrequently: false });
    const filter = filterFor(values);
    if (!needsPixelPass) {
      outputCtx.filter = filter;
      outputCtx.drawImage(source, 0, 0, width, height);
      outputCtx.filter = 'none';
      applyLooks(outputCtx, width, height, values);
      if (onProgress) onProgress(100);
      return output;
    }
    const tile = document.createElement('canvas');
    tile.width = width;
    const sourceWidth = source.width || width;
    const sourceHeight = source.height || height;
    const rowBlock = Math.max(24, Math.min(128, Math.floor(900000 / Math.max(width, 1))));
    const waterRadius = values.water ? Math.max(2, Math.min(80, Math.round(Math.min(width, height) * .055 * values.water / 100))) : 0;
    const waterAngle = (Number(values.waterDirection ?? 90) * Math.PI) / 180;
    const waterPad = Math.ceil(Math.abs(Math.sin(waterAngle)) * waterRadius) + 2;
    const waterOffsets = Array.from({ length: 13 }, (_, i) => {
      const t = i / 12;
      return { dx: Math.cos(waterAngle) * waterRadius * t, dy: Math.sin(waterAngle) * waterRadius * t, weight: Math.exp(-3 * t * t) };
    });
    const waterMask = values.water && window.PhotoEffects
      ? window.PhotoEffects.buildWaterMask(source, width, height, state.waterMaskStrokes || [])
      : null;
    const warm = values.temperature * 0.56;
    const shadow = values.shadows / 100;
    const highlight = values.highlights / 100;
    const vibrance = values.vibrance / 100;
    const sharp = values.sharpness / 100 * 0.38;
    const denoise = values.denoise / 100 * 0.34;
    for (let y = 0; y < height; y += rowBlock) {
      if (isCancelled()) return null;
      const start = Math.max(0, y - waterPad);
      const end = Math.min(height, y + rowBlock + waterPad);
      const tileHeight = end - start;
      if (tile.height !== tileHeight) tile.height = tileHeight;
      const tileCtx = tile.getContext('2d', { willReadFrequently: true });
      tileCtx.filter = filter;
      tileCtx.drawImage(source, 0, start * sourceHeight / height, sourceWidth, tileHeight * sourceHeight / height, 0, 0, width, tileHeight);
      tileCtx.filter = 'none';
      const image = tileCtx.getImageData(0, 0, width, tileHeight);
      const data = image.data;
      const sourceData = data.slice();
      const first = y - start;
      const stop = Math.min(tileHeight, y + rowBlock - start);
      for (let row = first; row < stop; row++) {
        const up = Math.max(0, row - 1) * width * 4;
        const down = Math.min(tileHeight - 1, row + 1) * width * 4;
        let i = row * width * 4;
        for (let x = 0; x < width; x++, i += 4) {
          let r = sourceData[i]; let g = sourceData[i + 1]; let b = sourceData[i + 2];
          const originalLuma = .2126 * r + .7152 * g + .0722 * b;
          if (shadow > 0 && originalLuma < 122) {
            const amount = shadow * 52 * ((122 - originalLuma) / 122) ** 1.4;
            r += amount; g += amount; b += amount;
          } else if (shadow < 0 && originalLuma < 122) {
            const amount = shadow * 42 * ((122 - originalLuma) / 122);
            r += amount; g += amount; b += amount;
          }
          if (highlight !== 0 && originalLuma > 132) {
            const weight = ((originalLuma - 132) / 123) ** 1.5;
            const amount = highlight * 48 * weight;
            r -= amount; g -= amount; b -= amount;
          }
          r += warm; b -= warm;
          if (vibrance > 0) {
            const max = Math.max(r, g, b); const min = Math.min(r, g, b);
            const boost = vibrance * (max - min < 105 ? 1 - (max - min) / 150 : .3);
            const luma = .2126 * r + .7152 * g + .0722 * b;
            r += (r - luma) * boost; g += (g - luma) * boost; b += (b - luma) * boost;
          }
          if (values.water && waterMask) {
            const maskX = Math.min(waterMask.width - 1, Math.floor((x + .5) * waterMask.width / width));
            const maskY = Math.min(waterMask.height - 1, Math.floor((start + row + .5) * waterMask.height / height));
            const maskAlpha = waterMask.data[(maskY * waterMask.width + maskX) * 4 + 3] / 255;
            if (maskAlpha > .025) {
              let blurR = 0; let blurG = 0; let blurB = 0; let weightSum = 0;
              for (const sample of waterOffsets) {
                const sx = clamp(Math.round(x + sample.dx), 0, width - 1);
                const sy = clamp(Math.round(row + sample.dy), 0, tileHeight - 1);
                const sampleIndex = (sy * width + sx) * 4;
                blurR += sourceData[sampleIndex] * sample.weight;
                blurG += sourceData[sampleIndex + 1] * sample.weight;
                blurB += sourceData[sampleIndex + 2] * sample.weight;
                weightSum += sample.weight;
              }
              const blend = clamp((values.water / 100) * maskAlpha * 1.08, 0, .97);
              r = r * (1 - blend) + (blurR / weightSum) * blend;
              g = g * (1 - blend) + (blurG / weightSum) * blend;
              b = b * (1 - blend) + (blurB / weightSum) * blend;
              const veil = Math.max(0, (.2126 * r + .7152 * g + .0722 * b - 112) / 143) * blend * .09;
              r += veil * 11; g += veil * 13; b += veil * 15;
            }
          }
          const left = x ? i - 4 : i;
          const right = x < width - 1 ? i + 4 : i;
          const ur = up + x * 4; const dr = down + x * 4;
          const neighborR = (sourceData[left] + sourceData[right] + sourceData[ur] + sourceData[dr]) / 4;
          const neighborG = (sourceData[left + 1] + sourceData[right + 1] + sourceData[ur + 1] + sourceData[dr + 1]) / 4;
          const neighborB = (sourceData[left + 2] + sourceData[right + 2] + sourceData[ur + 2] + sourceData[dr + 2]) / 4;
          if (sharp) {
            const edge = Math.abs(r - neighborR) + Math.abs(g - neighborG) + Math.abs(b - neighborB);
            const edgeMask = clamp((edge - 6) / 25, 0, 1);
            r += (r - neighborR) * sharp * edgeMask;
            g += (g - neighborG) * sharp * edgeMask;
            b += (b - neighborB) * sharp * edgeMask;
          }
          if (denoise) {
            const localVariance = Math.abs(r - neighborR) + Math.abs(g - neighborG) + Math.abs(b - neighborB);
            const smooth = denoise * clamp(1 - localVariance / 72, 0, 1);
            r = r * (1 - smooth) + neighborR * smooth;
            g = g * (1 - smooth) + neighborG * smooth;
            b = b * (1 - smooth) + neighborB * smooth;
          }
          data[i] = clamp(r, 0, 255); data[i + 1] = clamp(g, 0, 255); data[i + 2] = clamp(b, 0, 255);
        }
      }
      outputCtx.putImageData(image, 0, start, 0, first, width, stop - first);
      if (onProgress) onProgress(Math.round(Math.min(100, (y + rowBlock) / height * 100)));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    tile.width = 1; tile.height = 1;
    applyLooks(outputCtx, width, height, values);
    return output;
  }

  function drawOriginal(width, height) {
    const ctx = els.originalCanvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    if (originalBitmap) ctx.drawImage(originalBitmap, 0, 0, width, height);
  }

  function schedulePreview() {
    if (!originalBitmap) return;
    if (scheduledPreview) cancelAnimationFrame(scheduledPreview);
    scheduledPreview = requestAnimationFrame(() => {
      scheduledPreview = 0;
      drawPreview();
    });
  }

  async function drawPreview() {
    if (!originalBitmap) return;
    const token = ++previewToken;
    const size = getPreviewSize();
    resizePreviewCanvases(size.width, size.height);
    drawMaskOverlay();
    drawOriginal(size.width, size.height);
    els.previewWrap.hidden = false;
    els.emptyState.hidden = true;
    const source = getSource();
    try {
      const rendered = await renderImage(source, size.width, size.height, state.values, null, () => token !== previewToken);
      if (!rendered || token !== previewToken) return;
      const ctx = els.editedCanvas.getContext('2d');
      ctx.clearRect(0, 0, size.width, size.height);
      ctx.drawImage(rendered, 0, 0);
    } catch (error) {
      setMessage(`Önizleme oluşturulamadı: ${error.message}`, 'error');
    }
    syncControls();
  }

  async function analyzeImage(bitmap) {
    const sample = document.createElement('canvas');
    sample.width = 72; sample.height = 72;
    const ctx = sample.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0, sample.width, sample.height);
    const pixels = ctx.getImageData(0, 0, sample.width, sample.height).data;
    let luminance = 0; let variance = 0; let saturation = 0; let dark = 0; let bright = 0; let blue = 0; let green = 0;
    const count = pixels.length / 4;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]; const g = pixels[i + 1]; const b = pixels[i + 2];
      const luma = (.2126 * r + .7152 * g + .0722 * b) / 255;
      luminance += luma;
      const high = Math.max(r, g, b); const low = Math.min(r, g, b);
      saturation += high ? (high - low) / high : 0;
      if (luma < .2) dark++;
      if (luma > .86) bright++;
      blue += b; green += g;
    }
    luminance /= count; saturation /= count; dark /= count; bright /= count;
    for (let i = 0; i < pixels.length; i += 4) {
      const luma = (.2126 * pixels[i] + .7152 * pixels[i + 1] + .0722 * pixels[i + 2]) / 255;
      variance += (luma - luminance) ** 2;
    }
    const deviation = Math.sqrt(variance / count);
    let face = false;
    if ('FaceDetector' in window) {
      try {
        const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 10 });
        face = (await detector.detect(sample)).length > 0;
      } catch (_) { face = false; }
    }
    const aspect = bitmap.width / bitmap.height;
    let scene;
    let note;
    if (luminance < .32 || dark > .32) {
      scene = 'Düşük ışık';
      note = 'Koyu tonlar belirgin. İyileştirme, gölgeleri ölçülü açıp parlak alanları korumaya odaklanır.';
    } else if (face || aspect < .76) {
      scene = face ? 'Portre' : 'Dikey kadraj · portre adayı';
      note = face ? 'Yüz algılandı. Cilt tonlarını doğal tutan, hafif ve kontrollü bir ışık dengesi önerilir.' : 'Dikey kadraj algılandı; portre olabilir. Bu tahmin yüz tanıma değil, biçim ve ton analizi kullanır.';
    } else if (aspect > 1.25 && (green > blue * .84 || aspect > 1.55)) {
      scene = 'Manzara';
      note = 'Geniş kadraj algılandı. Gökyüzü ve gölgeleri koruyup renk canlılığını ölçülü artıran ayar seçilecek.';
    } else {
      scene = 'Genel kadraj';
      note = 'Işık, kontrast ve renk dağılımı incelendi. Dengeli, doğal tonlar hedefleniyor.';
    }
    return { luminance, deviation, saturation, dark, bright, scene, note };
  }

  function recommendation(stats) {
    const portrait = stats.scene.toLocaleLowerCase('tr').includes('portre');
    const landscape = stats.scene === 'Manzara';
    const lowLight = stats.luminance < .30;
    return {
      exposure: Math.round(clamp((.46 - stats.luminance) * 54, -8, lowLight ? 24 : 13)),
      contrast: Math.round(clamp((.20 - stats.deviation) * 55 + (portrait ? -2 : landscape ? 4 : 0), -5, 15)),
      highlights: Math.round(clamp((stats.bright - .08) * 65 + (portrait ? 3 : 0), 2, 16)),
      shadows: Math.round(clamp((stats.dark - .14) * 90 + (portrait ? 2 : 0), 3, 20)),
      temperature: 0,
      saturation: Math.round(clamp((.27 - stats.saturation) * 22 + (portrait ? -2 : 0), -4, 7)),
      vibrance: Math.round(clamp((.27 - stats.saturation) * 23 + (landscape ? 5 : portrait ? -2 : 0), 0, 14)),
      sharpness: portrait ? 9 : landscape ? 18 : 13,
      denoise: lowLight ? 12 : portrait ? 2 : 3,
      fog: 0, vignette: 0, fade: 0,
    };
  }

  function supportedImageFile(file) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    return allowed.includes(file.type) || (!file.type && /\.(jpe?g|png|webp|avif)$/i.test(file.name));
  }

  async function openFile(file) {
    if (!file) return;
    if (isBusy) { setMessage('Mevcut işlem tamamlanınca başka bir fotoğraf açabilirsin.', 'busy'); return; }
    if (!supportedImageFile(file)) {
      setMessage('Bu dosya biçimi desteklenmiyor. JPG, PNG, WebP veya AVIF fotoğrafı seç.', 'error');
      return;
    }
    isBusy = true; setProgress(0); setMessage('Fotoğraf okunuyor…', 'busy'); syncControls();
    try {
      let bitmap;
      try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
      catch (_) { bitmap = await createImageBitmap(file); }
      if (!bitmap.width || !bitmap.height) throw new Error('Görsel boyutları okunamadı.');
      if (scheduledPreview) cancelAnimationFrame(scheduledPreview);
      scheduledPreview = 0; previewToken++;
      const retiredBitmaps = new Set([...history.map((entry) => entry.generatedBitmap), state.generatedBitmap, originalBitmap].filter(Boolean));
      for (const retired of retiredBitmaps) if (retired !== bitmap) retired.close?.();
      originalBitmap = bitmap;
      originalFile = file;
      state = { values: { ...DEFAULTS }, generatedBitmap: null, waterMaskStrokes: [] };
      history = [cloneState()]; historyIndex = 0; zoom = 1; splitVisible = false; comparePressed = false;
      setWaterBrushMode(false, false);
      els.fileCard.hidden = false;
      els.dropzone.hidden = true;
      els.fileName.textContent = file.name;
      els.fileMeta.textContent = `${bitmap.width.toLocaleString('tr-TR')} × ${bitmap.height.toLocaleString('tr-TR')} px · ${ratioLabel(bitmap.width, bitmap.height)} · ${formatBytes(file.size)}`;
      els.workspaceTitle.textContent = file.name;
      const sourceLabel = file.type.split('/')[1] || file.name.split('.').pop() || 'görsel';
      els.formatSelect.options[0].textContent = `Orijinal biçim (${sourceLabel.toUpperCase()})`;
      sceneStats = await analyzeImage(bitmap);
      els.sceneLabel.textContent = sceneStats.scene;
      els.sceneNote.textContent = sceneStats.note;
      await drawPreview();
      setMessage(`${sceneStats.scene} analizi tamamlandı. Orijinal fotoğraf korunuyor.`);
      if (bitmap.width * bitmap.height > 45000000) setMessage('Yüksek çözünürlüklü fotoğraf. Önizleme hızlı, dışa aktarma cihazına göre zaman alabilir.');
    } catch (error) {
      if (originalBitmap && originalBitmap !== undefined && !els.fileCard.hidden) {
        // Keep the previous valid photo if decoding the new selection fails.
      }
      setMessage(error.message?.includes('memory') ? 'Bu görsel cihaz belleği için çok büyük. Daha küçük bir kopya dene.' : `Fotoğraf açılamadı: ${error.message || 'dosyayı kontrol et.'}`, 'error');
    } finally {
      isBusy = false; setProgress(0, false); syncControls();
    }
  }

  async function analyzeAndImprove() {
    if (!originalBitmap || !sceneStats || isBusy) return;
    state = { values: { ...DEFAULTS, ...recommendation(sceneStats) }, generatedBitmap: null, waterMaskStrokes: state.waterMaskStrokes || [] };
    pushHistory();
    setMessage(`${sceneStats.scene} için doğal iyileştirme hazırlandı. Kaydetmeden önce ayarlayabilirsin.`);
    await drawPreview();
  }

  function commitAdjustment(patch, message) {
    state = { values: { ...state.values, ...patch }, generatedBitmap: state.generatedBitmap, waterMaskStrokes: state.waterMaskStrokes || [] };
    pushHistory();
    schedulePreview();
    setMessage(message);
  }

  function applyQuickLook(name) {
    if (!originalBitmap || isBusy) return;
    const looks = {
      warm: { temperature: 18, saturation: 5, highlights: 4 },
      fog: { fog: 42, contrast: -5, shadows: 5 },
      vintage: { temperature: 12, saturation: -24, contrast: -5, fade: 22, vignette: 18 },
      mono: { saturation: -100, contrast: 8 },
      vivid: { vibrance: 34, sharpness: 10 },
    };
    const labels = { warm: 'Sıcak ışık', fog: 'Hafif sis', vintage: 'Nostalji', mono: 'Siyah-beyaz', vivid: 'Canlı renk' };
    const patch = looks[name];
    if (patch) commitAdjustment({ ...patch, effectStrength: 145 }, `${labels[name]} görünümü uygulandı. Efekt gücünü istediğin gibi ayarlayabilirsin.`);
  }

  function applyPreset(preset) {
    if (!originalBitmap || isBusy || !preset) return;
    state = { values: { ...DEFAULTS, ...preset.values, effectStrength: 150 }, generatedBitmap: state.generatedBitmap, waterMaskStrokes: state.waterMaskStrokes || [] };
    pushHistory();
    schedulePreview();
    if (els.filterDialog.open) els.filterDialog.close();
    setMessage(`${preset.title} görünümü uygulandı. Kaydırıcılardan ince ayar yapabilirsin.`);
  }

  function setFilterCategory(categoryId) {
    activeFilterCategory = categoryId;
    for (const button of els.filterCategories.querySelectorAll('button')) {
      const active = button.dataset.category === categoryId;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    }
    renderFilterCards();
  }

  function renderFilterCards() {
    const catalog = window.PhotoFilterLibrary;
    if (!catalog) return;
    const query = normalizeSearchText(els.filterSearch.value.trim());
    const categoryName = (id) => catalog.categories.find((item) => item.id === id)?.label || '';
    const visible = catalog.filters.filter((preset) => {
      const matchesCategory = activeFilterCategory === 'all' || preset.category === activeFilterCategory;
      const haystack = normalizeSearchText(`${preset.title} ${preset.description} ${categoryName(preset.category)}`);
      return matchesCategory && (!query || haystack.includes(query));
    });
    els.filterGrid.replaceChildren();
    for (const preset of visible) {
      const card = document.createElement('button');
      card.type = 'button'; card.className = 'filter-card'; card.dataset.filter = preset.id;
      card.disabled = !originalBitmap || isBusy;
      card.setAttribute('aria-label', `${preset.title}: ${preset.description}. Uygula.`);
      const swatch = document.createElement('span'); swatch.className = 'filter-swatch'; swatch.style.background = preset.swatch;
      const copy = document.createElement('span'); copy.className = 'filter-card-copy';
      const title = document.createElement('strong'); title.textContent = preset.title;
      const description = document.createElement('small'); description.textContent = preset.description;
      copy.append(title, description); card.append(swatch, copy);
      card.addEventListener('click', () => applyPreset(preset));
      els.filterGrid.append(card);
    }
    if (!visible.length) {
      const empty = document.createElement('p'); empty.className = 'filter-no-results'; empty.textContent = 'Bu aramayla eşleşen filtre bulunamadı.';
      els.filterGrid.append(empty);
    }
    els.filterResultsCount.textContent = `${visible.length} / ${catalog.filters.length} filtre`;
  }

  function renderFilterLibrary() {
    const catalog = window.PhotoFilterLibrary;
    if (!catalog) { setMessage('Filtre kataloğu yüklenemedi. Sayfayı yenileyip yeniden dene.', 'error'); return; }
    els.filterCategories.replaceChildren();
    for (const category of catalog.categories) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'filter-category-chip'; button.dataset.category = category.id;
      button.setAttribute('role', 'tab'); button.setAttribute('aria-selected', 'false'); button.textContent = category.label;
      button.addEventListener('click', () => setFilterCategory(category.id));
      els.filterCategories.append(button);
    }
    setFilterCategory('all');
  }

  function applyLocalCommand() {
    if (!originalBitmap || isBusy) return;
    const text = normalizeSearchText(els.aiPrompt.value.trim());
    if (!text) { setMessage('Önce çevrimdışı uygulamak istediğin komutu yaz.', 'error'); els.aiPrompt.focus(); return; }
    const has = (...words) => words.some((word) => text.includes(normalizeSearchText(word)));
    const patch = {};
    let matched = false;
    if (has('harika', 'nefis', 'profesyonel', 'iyileştir', 'düzelt', 'muhteşem')) {
      Object.assign(patch, recommendation(sceneStats)); matched = true;
    }
    if (has('sis', 'pus', 'duman')) { patch.fog = has('orman', 'ağaç', 'yaprak') ? 70 : 54; patch.contrast = -7; patch.effectStrength = 145; matched = true; }
    if (has('tül', 'ipeksi su', 'ipek su', 'ipeksi akış', 'şelale', 'su efekti', 'uzun pozlama')) { patch.water = 100; patch.waterDirection = 90; patch.effectStrength = 175; matched = true; }
    if (has('siyah-beyaz', 'siyah beyaz', 'siyah', 'gri ton')) { patch.saturation = -100; patch.contrast = Math.max(patch.contrast || 0, 8); matched = true; }
    if (has('nostalji', 'nostaljik', 'vintage', 'retro', 'eski')) { Object.assign(patch, { temperature: 12, saturation: -24, contrast: -5, fade: 22, vignette: 18 }); matched = true; }
    if (has('gün batımı', 'sunset')) { Object.assign(patch, window.PhotoFilterLibrary.filters.find((item) => item.id === 'sunset').values); matched = true; }
    else if (has('gün doğumu', 'sunrise')) { Object.assign(patch, window.PhotoFilterLibrary.filters.find((item) => item.id === 'sunrise').values); matched = true; }
    else if (has('sıcak', 'altın', 'turuncu')) { patch.temperature = 20; patch.saturation = Math.max(patch.saturation || 0, 6); patch.sunGlow = 34; matched = true; }
    if (has('soğuk', 'buz', 'mavi')) { patch.temperature = -20; matched = true; }
    if (has('canlı', 'renkli', 'doygun')) { patch.vibrance = 34; matched = true; }
    if (has('soluk', 'mat', 'pastel')) { patch.saturation = -22; patch.fade = 18; matched = true; }
    if (has('keskin', 'net', 'detay')) { patch.sharpness = 35; matched = true; }
    if (has('aydınlık', 'parlak', 'aydınlat', 'ışık')) { patch.exposure = 16; patch.shadows = 12; matched = true; }
    if (has('karart', 'koyu', 'karanlık', 'gece')) { patch.exposure = -15; patch.contrast = Math.max(patch.contrast || 0, 7); matched = true; }
    if (has('vinyet', 'kenar gölgesi')) { patch.vignette = 36; matched = true; }
    if (!matched) {
      setMessage('Bu çevrimdışı komutu anlayamadım. Sis, suya tül, gün batımı, canlı renk veya film görünümü dene.', 'error');
      return;
    }
    if (!patch.effectStrength) patch.effectStrength = 140;
    commitAdjustment(patch, 'Güçlü çevrimdışı görünüm uygulandı. Yoğunluğu ayarlayabilir veya geri alabilirsin.');
    els.aiPrompt.value = '';
  }

  function restoreHistory(index) {
    if (index < 0 || index >= history.length || isBusy) return;
    historyIndex = index;
    state = cloneState(history[historyIndex]);
    syncControls();
    schedulePreview();
    setMessage(index === 0 ? 'Orijinal görünüm geri yüklendi.' : `Düzenleme geçmişi: ${index} / ${history.length - 1}`);
  }

  function resetAll() {
    const hasMaskEdits = (state.waterMaskStrokes || []).length > 0;
    if (!originalBitmap || isBusy || (isNeutral(state.values) && !state.generatedBitmap && !hasMaskEdits)) return;
    state = { values: { ...DEFAULTS }, generatedBitmap: null, waterMaskStrokes: [] };
    setWaterBrushMode(false, false);
    pushHistory();
    schedulePreview();
    setMessage('Tüm ayarlar ve maske işaretleri özgün fotoğrafa döndürüldü. Orijinal dosyan etkilenmedi.');
  }

  function setZoom(next) {
    zoom = clamp(next, .35, 2.5);
    schedulePreview();
    syncControls();
  }

  function getImageType() {
    if (els.formatSelect.value !== 'source') return els.formatSelect.value;
    const sourceType = getSourceType();
    return ['image/jpeg', 'image/png', 'image/webp'].includes(sourceType) ? sourceType : 'image/png';
  }

  function getSourceType() {
    const mime = String(originalFile?.type || '').toLowerCase();
    if (mime) return mime;
    const extension = originalFile?.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase();
    return ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' })[extension] || '';
  }

  async function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error('Görsel dışa aktarılamadı. Farklı biçim veya daha düşük çözünürlük dene.'));
        else resolve(blob);
      }, type, quality);
    });
  }

  function saveBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = fileName; anchor.rel = 'noopener';
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }

  function downloadOriginal() {
    if (!originalFile || isBusy) return;
    saveBlob(originalFile, originalFile.name);
    setMessage('Orijinal dosya, içindeki metaveriyle birlikte aynen indirildi.');
  }

  async function exportPhoto() {
    if (!originalBitmap || isBusy) return;
    const type = getImageType();
    const typeExtension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    if (!typeExtension[type]) {
      setMessage('Bu dışa aktarma biçimi bu tarayıcıda desteklenmiyor.', 'error'); return;
    }
    if (!state.generatedBitmap && isNeutral(state.values) && els.formatSelect.value === 'source') {
      downloadOriginal(); return;
    }
    const exportSource = getSource();
    const exportWidth = state.generatedBitmap ? exportSource.width : originalBitmap.width;
    const exportHeight = state.generatedBitmap ? exportSource.height : originalBitmap.height;
    const resolutionLabel = state.generatedBitmap ? 'AI çıktısının kendi çözünürlüğünde' : 'Özgün çözünürlükte';
    isBusy = true; syncControls(); setProgress(0); setMessage(`${resolutionLabel} işleniyor…`, 'busy');
    let outputCanvas;
    try {
      outputCanvas = await renderImage(exportSource, exportWidth, exportHeight, state.values, (percent) => {
        setProgress(percent);
        setMessage(`${resolutionLabel} işleniyor · %${percent}`, 'busy');
      });
      if (!outputCanvas) throw new Error('İşlem tamamlanamadı.');
      if (type === 'image/jpeg') {
        const context = outputCanvas.getContext('2d');
        context.globalCompositeOperation = 'destination-over';
        context.fillStyle = '#ffffff'; context.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
        context.globalCompositeOperation = 'source-over';
      }
      setMessage('Dosya hazırlanıyor…', 'busy');
      const quality = Number(els.quality.value) / 100;
      let blob = await canvasToBlob(outputCanvas, type, quality);
      if (blob.type && blob.type !== type) throw new Error('Bu tarayıcı seçilen biçimde kayıt yapamıyor. PNG deneyebilirsin.');
      const baseName = originalFile.name.replace(/\.[^.]+$/, '') || 'fotograf';
      saveBlob(blob, `${baseName}-duzenlenmis.${typeExtension[type]}`);
      setProgress(100);
      const details = state.generatedBitmap ? 'AI sonucu üretici çözünürlüğünde kaydedildi; orijinal dosya değişmedi.' : 'Orijinal dosya değişmedi.';
      setMessage(`Tamamlandı: ${outputCanvas.width.toLocaleString('tr-TR')} × ${outputCanvas.height.toLocaleString('tr-TR')} px · ${formatBytes(blob.size)}. ${details}`);
    } catch (error) {
      setMessage(`Dışa aktarma başarısız: ${error.message}`, 'error');
    } finally {
      if (outputCanvas) { outputCanvas.width = 1; outputCanvas.height = 1; }
      isBusy = false; setProgress(0, false); syncControls();
    }
  }

  async function canvasToDataUrl(source, maxSide = 2048, mimeType = 'image/jpeg', quality = .94) {
    const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(source.width * scale));
    canvas.height = Math.max(1, Math.round(source.height * scale));
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve, reject) => canvas.toBlob(async (blob) => {
      if (!blob) return reject(new Error('Yapay zekâ kopyası hazırlanamadı.'));
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('Görsel okunamadı.'));
      reader.readAsDataURL(blob);
    }, mimeType, quality));
  }

  function waterMaskToCanvas(mask) {
    const canvas = document.createElement('canvas');
    canvas.width = mask.width; canvas.height = mask.height;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(mask.width, mask.height);
    for (let i = 0; i < mask.data.length; i += 4) {
      const light = mask.data[i + 3];
      image.data[i] = light; image.data[i + 1] = light; image.data[i + 2] = light; image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
  }

  function buildGeminiEditPrompt(userPrompt, hasMask) {
    const normalized = normalizeSearchText(userPrompt);
    const asksForWater = /\b(tul|ipek|ipeksi|selale|suya|uzun pozlama|long exposure)\b/.test(normalized);
    if (asksForWater) {
      const target = hasMask
        ? 'Image 2 is a grayscale selection mask: white/bright pixels identify the water area to edit; black pixels must remain untouched.'
        : 'First identify only the actual visible water and waterfall surfaces in the photograph; do not mistake sky, haze, or the shoreline for water.';
      return `Create a clearly visible, beautiful, photorealistic long-exposure silk-water effect. User request: ${JSON.stringify(userPrompt)}. ${target} Transform the water into smooth, silky flowing ribbons with coherent directional motion, layered fine luminous streaks, soft milky highlights, subtle natural water color, and convincing flow around rocks and edges. Make the result unmistakably stronger than a faint blur while keeping the scene elegant and photographic. Restrict changes to the selected or identified water. Preserve rocks, trees, banks, buildings, people, sky, horizon, framing, viewpoint, and all non-water detail as closely as possible. No invented objects, crop, text, or border. Return only the edited image.`;
    }
    if (/\b(sis|pus|orman|mist|fog)\b/.test(normalized)) return `Edit the photograph according to this request: ${JSON.stringify(userPrompt)}. Add clearly visible but natural layered atmospheric mist with real depth and soft light falloff. Preserve the original composition, subject identity, trees and structures, colors and fine details. Avoid a flat white wash, excessive blur, invented objects, text, borders, or cropping. Return only the edited image.`;
    return `Edit the photograph according to this request: ${JSON.stringify(userPrompt)}. Make the requested effect visually clear, carefully blended, and professionally photographic rather than faint, while preserving subject identity, composition, natural textures, and unrelated scene details. Do not invent objects, add text or borders, or crop. Return only the edited image.`;
  }

  async function applyGeminiEdit() {
    if (!originalBitmap || isBusy) return;
    const prompt = els.aiPrompt.value.trim();
    if (!prompt) { setMessage('Önce nasıl bir değişiklik istediğini yaz.', 'error'); els.aiPrompt.focus(); return; }
    const apiKey = localStorage.getItem('fu_gemini_key') || '';
    const model = localStorage.getItem('fu_gemini_model') || 'gemini-2.5-flash-image';
    if (!apiKey) {
      setMessage('Gemini anahtarı eklemek için bağlantı ayarlarını aç.');
      try { els.settingsDialog.showModal(); } catch (_) {}
      return;
    }
    isBusy = true; syncControls(); setMessage('AI için çalışma kopyası hazırlanıyor; özgün dosyan cihazda kalıyor…', 'busy'); setProgress(12);
    try {
      const source = getSource();
      const scale = Math.min(1, 2048 / Math.max(source.width, source.height));
      const aiWidth = Math.max(1, Math.round(source.width * scale));
      const aiHeight = Math.max(1, Math.round(source.height * scale));
      const aiInput = await renderImage(source, aiWidth, aiHeight, state.values);
      const image = await canvasToDataUrl(aiInput, 2048, 'image/jpeg', .95);
      const hasMask = (state.waterMaskStrokes || []).length > 0;
      const requestParts = [
        { text: buildGeminiEditPrompt(prompt, hasMask) },
        { inline_data: { mime_type: 'image/jpeg', data: image } },
      ];
      if (hasMask) {
        const mask = window.PhotoEffects.buildWaterMask(source, aiWidth, aiHeight, state.waterMaskStrokes || []);
        const maskImage = await canvasToDataUrl(waterMaskToCanvas(mask), 2048, 'image/png');
        requestParts.push({ text: 'The next attached image is a grayscale edit-region mask: bright/white pixels mean edit this area; black pixels mean preserve the source. Treat it as a guide for localizing the requested change.' });
        requestParts.push({ inline_data: { mime_type: 'image/png', data: maskImage } });
      }
      setProgress(35); setMessage('Yapay zekâ fotoğrafı düzenliyor…', 'busy');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      let response;
      let json;
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            contents: [{ parts: requestParts }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
          }),
          signal: controller.signal,
        });
        json = await response.json().catch(() => ({}));
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('Gemini 2 dakika içinde yanıt vermedi. Bağlantıyı kontrol edip yerel düzenlemeyi kullanabilir veya yeniden deneyebilirsin.');
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
      if (!response.ok) throw new Error(json.error?.message || `Gemini yanıt vermedi (${response.status}).`);
      const parts = json.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((part) => part.inlineData || part.inline_data);
      const imageData = imagePart?.inlineData || imagePart?.inline_data;
      if (!imageData?.data) throw new Error(parts.find((part) => part.text)?.text || 'Model düzenlenmiş görsel döndürmedi. İsteği değiştirip yeniden dene.');
      const mime = imageData.mimeType || imageData.mime_type || 'image/png';
      const binary = atob(imageData.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const bitmap = await createImageBitmap(new Blob([bytes], { type: mime }));
      state = { values: { ...DEFAULTS }, generatedBitmap: bitmap, waterMaskStrokes: state.waterMaskStrokes || [] };
      pushHistory();
      els.aiPrompt.value = '';
      await drawPreview();
      setProgress(100); setMessage('AI düzenlenmiş kopyayı hazırladı. Özgün fotoğrafın değişmedi; AI sonucu farklı ayrıntı veya metadata içerebilir.');
    } catch (error) {
      setMessage(`Yapay zekâ düzenlemesi başarısız: ${error.message}`, 'error');
    } finally {
      isBusy = false; setProgress(0, false); syncControls();
    }
  }

  function drawMaskOverlay() {
    const canvas = els.waterMaskCanvas;
    if (!canvas) return;
    const width = els.editedCanvas.width || 1;
    const height = els.editedCanvas.height || 1;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    const strokes = state.waterMaskStrokes || [];
    const showSelection = waterBrushActive || strokes.length > 0;
    if (showSelection && originalBitmap && window.PhotoEffects) {
      const source = getSource();
      if (!waterMaskPreviewCache || waterMaskPreviewCache.source !== source || waterMaskPreviewCache.width !== width || waterMaskPreviewCache.height !== height) {
        if (waterMaskPreviewCache?.canvas) waterMaskPreviewCache.canvas.width = waterMaskPreviewCache.canvas.height = 1;
        const mask = window.PhotoEffects.buildWaterMask(source, width, height, []);
        const overlay = document.createElement('canvas'); overlay.width = width; overlay.height = height;
        const overlayCtx = overlay.getContext('2d');
        const image = overlayCtx.createImageData(width, height);
        for (let y = 0, i = 0; y < height; y++) {
          const maskY = Math.min(mask.height - 1, Math.floor((y + .5) * mask.height / height));
          for (let x = 0; x < width; x++, i += 4) {
            const maskX = Math.min(mask.width - 1, Math.floor((x + .5) * mask.width / width));
            const alpha = mask.data[(maskY * mask.width + maskX) * 4 + 3];
            image.data[i] = 39; image.data[i + 1] = 195; image.data[i + 2] = 169;
            image.data[i + 3] = Math.round(alpha * .34);
          }
        }
        overlayCtx.putImageData(image, 0, 0);
        waterMaskPreviewCache = { source, width, height, canvas: overlay };
      }
      ctx.drawImage(waterMaskPreviewCache.canvas, 0, 0, width, height);
    }
    if (strokes.length) window.PhotoEffects.paintStrokes(ctx, width, height, strokes, { color: '#29d9c4', alpha: .34 });
    canvas.classList.toggle('has-water-strokes', strokes.length > 0);
    els.previewWrap.classList.toggle('water-brush-active', waterBrushActive);
    canvas.setAttribute('aria-hidden', String(!waterBrushActive && !strokes.length));
  }

  function setWaterBrushMode(active, erase = false) {
    waterBrushActive = !!active;
    waterBrushErase = !!erase;
    if (waterBrushActive) {
      splitVisible = false; comparePressed = false;
      els.previewWrap.classList.remove('split', 'compare-original');
      els.splitControl.hidden = true;
      els.splitBtn.setAttribute('aria-pressed', 'false');
    }
    if (els.waterBrushBtn) {
      els.waterBrushBtn.textContent = waterBrushActive && !waterBrushErase ? 'Boyama tamam' : 'Fotoğrafı boyayarak seç';
      els.waterBrushBtn.setAttribute('aria-pressed', String(waterBrushActive && !waterBrushErase));
    }
    if (els.waterEraserBtn) {
      els.waterEraserBtn.textContent = waterBrushActive && waterBrushErase ? 'Silme tamam' : 'Seçimden sil';
      els.waterEraserBtn.setAttribute('aria-pressed', String(waterBrushActive && waterBrushErase));
    }
    if (els.waterMaskHint) {
      const count = (state.waterMaskStrokes || []).length;
      els.waterMaskHint.textContent = waterBrushActive
        ? `${waterBrushErase ? 'Fazla seçimi silmek için' : 'Su alanını işaretlemek için'} fotoğraf üzerinde sürükle. İşaret bitince düğmeye yeniden bas.`
        : count ? `${count} fırça izi seçime eklendi. Otomatik su algısı da çalışıyor.`
          : 'Renk tabanlı seçim yaklaşık sonuç verir. Fırçayla alan ekleyip silebilirsin.';
    }
    if (els.previewWrap) els.previewWrap.classList.toggle('water-brush-active', waterBrushActive);
    if (els.waterMaskCanvas) els.waterMaskCanvas.setAttribute('aria-hidden', String(!waterBrushActive && !(state.waterMaskStrokes || []).length));
    if (els.waterMaskCanvas) drawMaskOverlay();
    syncControls();
  }

  function waterPointFromEvent(event) {
    const rect = els.waterMaskCanvas.getBoundingClientRect();
    return [clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1), clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1)];
  }

  function openSettings() {
    els.apiKey.value = localStorage.getItem('fu_gemini_key') || '';
    els.modelName.value = localStorage.getItem('fu_gemini_model') || 'gemini-2.5-flash-image';
    try { els.settingsDialog.showModal(); } catch (_) { setMessage('Ayar penceresi bu tarayıcıda açılamadı.', 'error'); }
  }

  function setupEvents() {
    for (const button of [els.openBtn, els.emptyOpen, els.dropzone, els.replaceBtn]) button.addEventListener('click', () => { if (!isBusy) els.fileInput.click(); });
    els.fileInput.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (file) await openFile(file);
      event.target.value = '';
    });

    for (const target of [els.stage, els.dropzone]) {
      target.addEventListener('dragenter', (event) => { event.preventDefault(); els.stage.classList.add('drag-active'); els.dropzone.classList.add('drag-over'); });
      target.addEventListener('dragover', (event) => { event.preventDefault(); });
      target.addEventListener('dragleave', (event) => {
        if (event.relatedTarget && target.contains(event.relatedTarget)) return;
        els.stage.classList.remove('drag-active'); els.dropzone.classList.remove('drag-over');
      });
      target.addEventListener('drop', async (event) => {
        event.preventDefault(); els.stage.classList.remove('drag-active'); els.dropzone.classList.remove('drag-over');
        const file = event.dataTransfer?.files?.[0];
        if (file) await openFile(file);
      });
    }

    els.filterLibraryBtn.addEventListener('click', () => {
      if (!originalBitmap || isBusy) return;
      els.filterSearch.value = '';
      setFilterCategory('all');
      try { els.filterDialog.showModal(); els.filterSearch.focus(); }
      catch (_) { setMessage('Filtre kütüphanesi bu tarayıcıda açılamadı.', 'error'); }
    });
    els.filterDialogClose.addEventListener('click', () => els.filterDialog.close());
    els.filterDialog.addEventListener('click', (event) => { if (event.target === els.filterDialog) els.filterDialog.close(); });
    els.filterSearch.addEventListener('input', renderFilterCards);
    els.autoBtn.addEventListener('click', analyzeAndImprove);
    els.aiApply.addEventListener('click', applyGeminiEdit);
    els.localApply.addEventListener('click', applyLocalCommand);
    for (const button of document.querySelectorAll('[data-look]')) button.addEventListener('click', () => applyQuickLook(button.dataset.look));
    els.aiPrompt.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') applyGeminiEdit(); });
    els.waterBrushBtn.addEventListener('click', () => setWaterBrushMode(!waterBrushActive || waterBrushErase, false));
    els.waterEraserBtn.addEventListener('click', () => setWaterBrushMode(!waterBrushActive || !waterBrushErase, true));
    els.waterMaskClear.addEventListener('click', () => {
      if (!(state.waterMaskStrokes || []).length || isBusy) return;
      state = { ...state, waterMaskStrokes: [] }; setWaterBrushMode(false, false);
      pushHistory(); drawMaskOverlay(); if (state.values.water) schedulePreview();
      setMessage('Fırça işaretleri temizlendi. Otomatik su algısı kullanılacak.');
    });
    els.waterBrushSize.addEventListener('input', () => { $('#value-waterBrushSize').value = els.waterBrushSize.value; });
    els.waterMaskCanvas.addEventListener('pointerdown', (event) => {
      if (!waterBrushActive || isBusy || !originalBitmap) return;
      event.preventDefault(); els.waterMaskCanvas.setPointerCapture?.(event.pointerId);
      activeWaterStroke = { points: [waterPointFromEvent(event)], radius: Number(els.waterBrushSize.value) / 1000, erase: waterBrushErase };
      state.waterMaskStrokes = [...(state.waterMaskStrokes || []), activeWaterStroke];
      drawMaskOverlay();
    });
    els.waterMaskCanvas.addEventListener('pointermove', (event) => {
      if (!activeWaterStroke) return;
      const point = waterPointFromEvent(event);
      const previous = activeWaterStroke.points[activeWaterStroke.points.length - 1];
      if (Math.hypot(point[0] - previous[0], point[1] - previous[1]) < .0012) return;
      activeWaterStroke.points.push(point); drawMaskOverlay();
    });
    const finishWaterStroke = () => {
      if (!activeWaterStroke) return;
      activeWaterStroke = null; pushHistory(); drawMaskOverlay();
      if (state.values.water) schedulePreview();
      setWaterBrushMode(true, waterBrushErase);
      setMessage('Alan seçimi kaydedildi; su tülü bu seçimde ve AI isteğinde kullanılabilir.');
    };
    els.waterMaskCanvas.addEventListener('pointerup', finishWaterStroke);
    els.waterMaskCanvas.addEventListener('pointercancel', finishWaterStroke);
    els.keyBtn.addEventListener('click', openSettings);
    els.settingsDialog.addEventListener('close', () => {
      if (els.settingsDialog.returnValue === 'save') {
        const key = els.apiKey.value.trim(); const model = els.modelName.value.trim() || 'gemini-2.5-flash-image';
        if (key) localStorage.setItem('fu_gemini_key', key); else localStorage.removeItem('fu_gemini_key');
        localStorage.setItem('fu_gemini_model', model);
        setMessage(key ? 'Gemini bağlantı ayarları bu cihazda kaydedildi.' : 'Gemini anahtarı kaldırıldı.');
      }
    });
    els.clearKey.addEventListener('click', () => {
      localStorage.removeItem('fu_gemini_key'); els.apiKey.value = '';
      setMessage('Gemini anahtarı bu cihazdan silindi.');
    });

    for (const input of document.querySelectorAll('[data-setting]')) {
      input.addEventListener('pointerdown', () => { lastSliderState = JSON.stringify(state.values); });
      input.addEventListener('focus', () => { lastSliderState = JSON.stringify(state.values); });
      input.addEventListener('input', () => {
        const key = input.dataset.setting;
        state.values[key] = Number(input.value);
        const output = $(`#value-${key}`);
        if (output) output.value = key === 'waterDirection' ? `${input.value}°` : input.value;
        schedulePreview();
        els.resetBtn.disabled = isNeutral(state.values) && !state.generatedBitmap && !(state.waterMaskStrokes || []).length;
      });
      input.addEventListener('change', () => {
        if (JSON.stringify(state.values) !== lastSliderState) {
          pushHistory();
          setMessage('Ayar güncellendi. Orijinali karşılaştırabilir veya değişikliği geri alabilirsin.');
        }
        lastSliderState = JSON.stringify(state.values);
      });
    }

    els.undoBtn.addEventListener('click', () => restoreHistory(historyIndex - 1));
    els.redoBtn.addEventListener('click', () => restoreHistory(historyIndex + 1));
    els.resetBtn.addEventListener('click', resetAll);
    els.compareHold.addEventListener('pointerdown', (event) => { if (!originalBitmap) return; comparePressed = true; els.compareHold.setPointerCapture?.(event.pointerId); syncControls(); });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave']) els.compareHold.addEventListener(type, () => { if (comparePressed) { comparePressed = false; syncControls(); } });
    els.splitBtn.addEventListener('click', () => { splitVisible = !splitVisible; syncControls(); });
    els.splitRange.addEventListener('input', () => { els.splitOutput.value = `${els.splitRange.value}%`; els.compareDivider.style.left = `${els.splitRange.value}%`; els.editedCanvas.style.clipPath = `inset(0 0 0 ${els.splitRange.value}%)`; });
    els.zoomIn.addEventListener('click', () => setZoom(zoom + .15));
    els.zoomOut.addEventListener('click', () => setZoom(zoom - .15));
    els.fitBtn.addEventListener('click', () => setZoom(1));
    els.formatSelect.addEventListener('change', syncControls);
    els.quality.addEventListener('input', () => { els.qualityOutput.value = `%${els.quality.value}`; });
    els.downloadBtn.addEventListener('click', exportPhoto);
    els.headerExport.addEventListener('click', exportPhoto);
    els.originalDownload.addEventListener('click', downloadOriginal);
    document.addEventListener('keydown', (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault(); event.shiftKey ? restoreHistory(historyIndex + 1) : restoreHistory(historyIndex - 1);
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault(); restoreHistory(historyIndex + 1);
      }
    });
    if ('ResizeObserver' in window) new ResizeObserver(() => { if (originalBitmap) schedulePreview(); }).observe(els.stage);
    else window.addEventListener('resize', () => { if (originalBitmap) schedulePreview(); });
  }

  renderFilterLibrary();
  drawMaskOverlay();
  setupEvents();
  setupInstallSupport();
  syncControls();
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
})();
