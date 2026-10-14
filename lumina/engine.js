/* Lumina Studio — görüntü işleme motoru (DOM'dan bağımsız, saf JS) */
(function (root) {
  'use strict';

  const HSL_CENTERS = [0, 30, 60, 120, 180, 225, 270, 320];
  const HSL_WIDTHS = [35, 30, 45, 60, 50, 50, 45, 45];
  const HSL_NAMES = ['Kırmızı', 'Turuncu', 'Sarı', 'Yeşil', 'Aqua', 'Mavi', 'Mor', 'Pembe'];

  function defaultParams() {
    return {
      exposure: 0, contrast: 0, highlights: 0, shadows: 0, whites: 0, blacks: 0,
      temp: 0, tint: 0, vibrance: 0, saturation: 0,
      hsl: HSL_CENTERS.map(() => ({ h: 0, s: 0, l: 0 })),
      grade: {
        sh: { h: 220, s: 0 }, mid: { h: 40, s: 0 }, hi: { h: 45, s: 0 },
        blend: 50, balance: 0
      },
      curves: { rgb: [[0, 0], [1, 1]], r: [[0, 0], [1, 1]], g: [[0, 0], [1, 1]], b: [[0, 0], [1, 1]] },
      texture: 0, clarity: 0, dehaze: 0,
      sharpen: 0, sharpRadius: 1, sharpDetail: 25, sharpMask: 0,
      vignette: 0, vigMid: 50, vigRound: 0, vigFeather: 50, vigHighlights: 0,
      grain: 0, grainSize: 25, grainRough: 50,
      cal: { shTint: 0, rH: 0, rS: 0, gH: 0, gS: 0, bH: 0, bS: 0 },
      mask: {
        on: false, type: 'radial', x: 0.5, y: 0.5, size: 40, feather: 60, angle: 0, invert: false,
        exposure: 0, contrast: 0, saturation: 0, clarity: 0
      },
      geo: { rot: 0, flipH: false, aspect: 'orig' }
    };
  }

  /* ---------- yardımcılar ---------- */
  const S2L = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const c = i / 255;
    S2L[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  const L2S_N = 4096;
  const L2S = new Float32Array(L2S_N + 1);
  for (let i = 0; i <= L2S_N; i++) {
    const c = i / L2S_N;
    L2S[i] = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }
  function lin2srgb(x) {
    if (x <= 0) return 0;
    if (x >= 1) return x >= 4 ? 1 : (1.055 * Math.pow(x, 1 / 2.4) - 0.055);
    return L2S[(x * L2S_N + 0.5) | 0];
  }
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  function smoothstep(a, b, x) {
    if (a === b) return x < a ? 0 : 1;
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }
  function hue2rgb(h) { // 0..360 → [r,g,b] (s=1,v=1)
    h = ((h % 360) + 360) % 360 / 60;
    const x = 1 - Math.abs((h % 2) - 1);
    if (h < 1) return [1, x, 0];
    if (h < 2) return [x, 1, 0];
    if (h < 3) return [0, 1, x];
    if (h < 4) return [0, x, 1];
    if (h < 5) return [x, 0, 1];
    return [1, 0, x];
  }

  /* Monoton kübik interpolasyon → 1024'lük LUT (Fritsch–Carlson) */
  function buildCurveLUT(points) {
    const N = 1024;
    const lut = new Float32Array(N);
    const p = points.slice().sort((a, b) => a[0] - b[0]);
    if (p.length < 2) { for (let i = 0; i < N; i++) lut[i] = i / (N - 1); return lut; }
    const n = p.length, dx = [], m = [], t = new Array(n);
    for (let i = 0; i < n - 1; i++) {
      dx[i] = Math.max(1e-6, p[i + 1][0] - p[i][0]);
      m[i] = (p[i + 1][1] - p[i][1]) / dx[i];
    }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
      const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
    }
    let seg = 0;
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      let y;
      if (x <= p[0][0]) y = p[0][1];
      else if (x >= p[n - 1][0]) y = p[n - 1][1];
      else {
        while (seg < n - 2 && x > p[seg + 1][0]) seg++;
        const h = dx[seg], s = (x - p[seg][0]) / h, s2 = s * s, s3 = s2 * s;
        y = (2 * s3 - 3 * s2 + 1) * p[seg][1] + (s3 - 2 * s2 + s) * h * t[seg] +
            (-2 * s3 + 3 * s2) * p[seg + 1][1] + (s3 - s2) * h * t[seg + 1];
      }
      lut[i] = clamp01(y);
    }
    return lut;
  }
  function isIdentityCurve(pts) {
    return pts.length === 2 && pts[0][0] === 0 && pts[0][1] === 0 && pts[1][0] === 1 && pts[1][1] === 1;
  }

  /* Hızlı kutu bulanıklığı (kenar sıkıştırmalı), Uint8 düzlem */
  function boxBlurPass(src, dst, w, h, r, horizontal) {
    const len = horizontal ? w : h, lines = horizontal ? h : w;
    const st = horizontal ? 1 : w, sl = horizontal ? w : 1;
    if (r >= len) r = len - 1;
    const inv = 1 / (2 * r + 1);
    for (let l = 0; l < lines; l++) {
      const base = l * sl, first = src[base], last = src[base + (len - 1) * st];
      let acc = first * r;
      for (let i = 0; i < r; i++) acc += src[base + i * st];
      // i = 0 .. r  (sol kenar)
      for (let i = 0; i <= r && i < len; i++) {
        const add = i + r < len ? src[base + (i + r) * st] : last;
        acc += add;
        dst[base + i * st] = (acc * inv + 0.5) | 0;
        acc -= first;
      }
      // orta kısım
      for (let i = r + 1; i < len - r; i++) {
        acc += src[base + (i + r) * st];
        dst[base + i * st] = (acc * inv + 0.5) | 0;
        acc -= src[base + (i - r) * st];
      }
      // sağ kenar
      for (let i = Math.max(r + 1, len - r); i < len; i++) {
        acc += last;
        dst[base + i * st] = (acc * inv + 0.5) | 0;
        acc -= src[base + (i - r) * st];
      }
    }
  }
  function blurPlane(plane, w, h, radius) {
    const r = Math.max(1, Math.round(radius));
    const a = new Uint8Array(plane.length), b = new Uint8Array(plane.length);
    boxBlurPass(plane, a, w, h, r, true);
    boxBlurPass(a, b, w, h, r, false);
    boxBlurPass(b, a, w, h, r, true);
    boxBlurPass(a, b, w, h, r, false);
    return b;
  }

  function hash2(x, y, seed) {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967295;
  }

  /* ---------- ana işlem ---------- */
  function process(imgData, P) {
    const w = imgData.width, h = imgData.height, d = imgData.data, N = w * h;
    const longSide = Math.max(w, h);

    // --- ön hesaplar ---
    const rG = (1 + 0.0035 * P.temp) * (1 + 0.0015 * P.tint);
    const gG = 1 - 0.003 * P.tint;
    const bG = (1 - 0.0035 * P.temp) * (1 + 0.0015 * P.tint);
    const hasWB = P.temp !== 0 || P.tint !== 0;

    // kalibrasyon matrisi (sütunlar = yeni primerler)
    const cal = P.cal;
    const hasCal = cal.rH || cal.rS || cal.gH || cal.gS || cal.bH || cal.bS;
    let M = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    if (hasCal) {
      const prim = [[0, cal.rH, cal.rS], [120, cal.gH, cal.gS], [240, cal.bH, cal.bS]];
      const cols = prim.map(([hh, sh, ss]) => {
        let v = hue2rgb(hh + sh * 0.35);
        const mean = (v[0] + v[1] + v[2]) / 3;
        if (ss >= 0) v = v.map((c) => c + (c - mean) * ss / 100 * 0.5);
        else v = v.map((c) => c + (mean - c) * (-ss) / 100 * 0.7);
        return v.map((c) => Math.max(0, c));
      });
      M = [cols[0][0], cols[1][0], cols[2][0], cols[0][1], cols[1][1], cols[2][1], cols[0][2], cols[1][2], cols[2][2]];
    }
    const shTint = cal.shTint / 100;

    const expMul = Math.pow(2, P.exposure);
    const hasExp = P.exposure !== 0;
    const cst = P.contrast / 100;
    const hl = P.highlights / 100, sh = P.shadows / 100, wh = P.whites / 100, bl = P.blacks / 100;
    const hasTone = cst || hl || sh || wh || bl;
    const dehaze = P.dehaze / 100;
    const vib = P.vibrance / 100, sat = P.saturation / 100;
    const hasSat = vib || sat;

    const hasHSL = P.hsl.some((c) => c.h || c.s || c.l);
    const hslW = new Float32Array(8);

    const g = P.grade;
    const hasGrade = g.sh.s > 0 || g.mid.s > 0 || g.hi.s > 0;
    const gradeAmt = g.blend / 100 * 0.35;
    const tc = [g.sh, g.mid, g.hi].map((z) => hue2rgb(z.h).map((c) => (c - 0.5) * z.s / 100));
    const pivot = 0.5 + g.balance / 100 * 0.25;

    const curveRGB = isIdentityCurve(P.curves.rgb) ? null : buildCurveLUT(P.curves.rgb);
    const curveR = isIdentityCurve(P.curves.r) ? null : buildCurveLUT(P.curves.r);
    const curveG = isIdentityCurve(P.curves.g) ? null : buildCurveLUT(P.curves.g);
    const curveB = isIdentityCurve(P.curves.b) ? null : buildCurveLUT(P.curves.b);
    const hasCurve = !!(curveRGB || curveR || curveG || curveB);

    const pass1 = hasWB || hasCal || hasExp || shTint || hasTone || dehaze || hasSat || hasHSL || hasGrade || hasCurve;
    // --- 1. geçiş: renk / ton ---
    if (pass1) for (let i = 0; i < d.length; i += 4) {
      let r = S2L[d[i]], gg = S2L[d[i + 1]], b = S2L[d[i + 2]];
      if (hasWB) { r *= rG; gg *= gG; b *= bG; }
      if (hasCal) {
        const nr = M[0] * r + M[1] * gg + M[2] * b;
        const ng = M[3] * r + M[4] * gg + M[5] * b;
        const nb = M[6] * r + M[7] * gg + M[8] * b;
        r = nr; gg = ng; b = nb;
      }
      if (hasExp) { r *= expMul; gg *= expMul; b *= expMul; }
      r = lin2srgb(r); gg = lin2srgb(gg); b = lin2srgb(b);

      if (shTint) {
        const l0 = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
        const wS = 1 - smoothstep(0, 0.5, l0);
        gg -= shTint * 0.06 * wS; r += shTint * 0.03 * wS; b += shTint * 0.03 * wS;
      }

      if (hasTone) {
        let L = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
        if (sh) {
          const wS = 1 - smoothstep(0, 0.6, L);
          const gain = 1 + sh * 0.9 * wS;
          r *= gain; gg *= gain; b *= gain;
          L *= gain;
        }
        if (hl) {
          const wH = smoothstep(0.35, 1, L);
          const gain = 1 + hl * 0.35 * wH;
          r *= gain; gg *= gain; b *= gain;
        }
        if (wh) {
          r += wh * 0.22 * r * r * r; gg += wh * 0.22 * gg * gg * gg; b += wh * 0.22 * b * b * b;
        }
        if (bl) {
          let u = 1 - clamp01(r); r += bl * 0.2 * u * u * u;
          u = 1 - clamp01(gg); gg += bl * 0.2 * u * u * u;
          u = 1 - clamp01(b); b += bl * 0.2 * u * u * u;
        }
        if (cst > 0) {
          let v = clamp01(r); r = v + (v * v * (3 - 2 * v) - v) * cst * 1.15;
          v = clamp01(gg); gg = v + (v * v * (3 - 2 * v) - v) * cst * 1.15;
          v = clamp01(b); b = v + (v * v * (3 - 2 * v) - v) * cst * 1.15;
        } else if (cst < 0) {
          const k = 1 + cst;
          r = 0.5 + (r - 0.5) * k; gg = 0.5 + (gg - 0.5) * k; b = 0.5 + (b - 0.5) * k;
        }
      }

      if (dehaze) {
        const mn = Math.min(r, gg, b);
        if (dehaze > 0) {
          const A = dehaze * 0.55 * mn;
          const den = Math.max(0.2, 1 - A);
          r = (r - A) / den; gg = (gg - A) / den; b = (b - A) / den;
        } else {
          const k = -dehaze * 0.3;
          r = r * (1 - k) + k * 0.72; gg = gg * (1 - k) + k * 0.72; b = b * (1 - k) + k * 0.72;
        }
      }

      if (hasSat) {
        const L = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
        const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
        const s0 = mx > 1e-5 ? (mx - mn) / mx : 0;
        const f = (1 + sat) * (1 + vib * (1 - clamp01(s0)) * 1.2);
        r = L + (r - L) * f; gg = L + (gg - L) * f; b = L + (b - L) * f;
      }

      if (hasHSL) {
        r = clamp01(r); gg = clamp01(gg); b = clamp01(b);
        const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), dl = mx - mn;
        if (dl > 1e-4) {
          let hh;
          if (mx === r) hh = ((gg - b) / dl) % 6; else if (mx === gg) hh = (b - r) / dl + 2; else hh = (r - gg) / dl + 4;
          hh *= 60; if (hh < 0) hh += 360;
          const l = (mx + mn) / 2;
          let s = dl / (1 - Math.abs(2 * l - 1) + 1e-6);
          let dh = 0, ds = 0, dL = 0;
          for (let k = 0; k < 8; k++) {
            let a = Math.abs(hh - HSL_CENTERS[k]); if (a > 180) a = 360 - a;
            const wk = Math.max(0, 1 - a / HSL_WIDTHS[k]);
            if (wk > 0) { const c = P.hsl[k]; dh += wk * c.h; ds += wk * c.s; dL += wk * c.l; }
          }
          hh = (hh + dh / 100 * 30 + 360) % 360;
          s = clamp01(s * (1 + ds / 100));
          const l2 = clamp01(l + dL / 100 * 0.25 * (1 - Math.abs(2 * l - 1)) * 2 * Math.min(1, s * 2 + 0.2));
          const C = (1 - Math.abs(2 * l2 - 1)) * s;
          const hp = hh / 60, X = C * (1 - Math.abs((hp % 2) - 1)), m = l2 - C / 2;
          let rr, g2, bb;
          if (hp < 1) { rr = C; g2 = X; bb = 0; } else if (hp < 2) { rr = X; g2 = C; bb = 0; }
          else if (hp < 3) { rr = 0; g2 = C; bb = X; } else if (hp < 4) { rr = 0; g2 = X; bb = C; }
          else if (hp < 5) { rr = X; g2 = 0; bb = C; } else { rr = C; g2 = 0; bb = X; }
          r = rr + m; gg = g2 + m; b = bb + m;
        }
      }

      if (hasGrade) {
        const L = clamp01(0.2126 * r + 0.7152 * gg + 0.0722 * b);
        const wS = 1 - smoothstep(0, pivot, L), wH = smoothstep(pivot, 1, L), wM = Math.max(0, 1 - wS - wH);
        r += gradeAmt * (wS * tc[0][0] + wM * tc[1][0] + wH * tc[2][0]) * 2.2;
        gg += gradeAmt * (wS * tc[0][1] + wM * tc[1][1] + wH * tc[2][1]) * 2.2;
        b += gradeAmt * (wS * tc[0][2] + wM * tc[1][2] + wH * tc[2][2]) * 2.2;
      }

      r = clamp01(r); gg = clamp01(gg); b = clamp01(b);
      if (hasCurve) {
        if (curveRGB) { r = curveRGB[(r * 1023 + 0.5) | 0]; gg = curveRGB[(gg * 1023 + 0.5) | 0]; b = curveRGB[(b * 1023 + 0.5) | 0]; }
        if (curveR) r = curveR[(r * 1023 + 0.5) | 0];
        if (curveG) gg = curveG[(gg * 1023 + 0.5) | 0];
        if (curveB) b = curveB[(b * 1023 + 0.5) | 0];
      }
      d[i] = r * 255 + 0.5; d[i + 1] = gg * 255 + 0.5; d[i + 2] = b * 255 + 0.5;
    }

    // --- 2. geçiş: detay, yerel maske, vinyet, tane ---
    const M_ = P.mask, maskOn = M_.on && (M_.exposure || M_.contrast || M_.saturation || M_.clarity);
    const needTex = P.texture !== 0;
    const needClar = P.clarity !== 0 || (maskOn && M_.clarity !== 0);
    const needSharp = P.sharpen > 0;
    const hasVig = P.vignette !== 0, hasGrain = P.grain > 0;
    if (!(needTex || needClar || needSharp || maskOn || hasVig || hasGrain)) return imgData;

    let lum = null, bTex = null, bClar = null, bSharp = null;
    if (needTex || needClar || needSharp) {
      lum = new Uint8Array(N);
      for (let i = 0, j = 0; j < N; i += 4, j++) lum[j] = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) + 0.5;
      if (needTex) bTex = blurPlane(lum, w, h, longSide * 0.0016);
      if (needClar) bClar = blurPlane(lum, w, h, longSide * 0.012);
      if (needSharp) bSharp = blurPlane(lum, w, h, Math.max(1, longSide * 0.0005 * (0.4 + P.sharpRadius * 1.1)));
    }

    // maske geometrisi
    let mCx = 0, mCy = 0, mR = 1, mFe = 0.5, mCos = 1, mSin = 0, mKind = 0;
    if (maskOn) {
      mCx = M_.x * w; mCy = M_.y * h;
      mFe = 0.15 + M_.feather / 100 * 0.85;
      mKind = M_.type === 'radial' ? 0 : 1;
      mR = Math.max(4, M_.size / 100 * longSide * 0.6);
      const ang = M_.angle * Math.PI / 180; mCos = Math.cos(ang); mSin = Math.sin(ang);
    }
    // vinyet
    const vigA = P.vignette / 100, vigMid = 0.25 + P.vigMid / 100 * 0.7, vigFe = 0.1 + P.vigFeather / 100 * 0.6;
    const vigRound = P.vignette !== 0 ? P.vigRound / 100 : 0;
    const vcx = w / 2, vcy = h / 2;
    let ax, ay;
    if (vigRound >= 0) { // yuvarlak → daire; 0 → görüntü oranı
      const rad = Math.hypot(vcx, vcy);
      ax = vcx + (rad - vcx) * vigRound; ay = vcy + (rad - vcy) * vigRound;
    } else { ax = vcx; ay = vcy; }
    if (vigRound < 0) { const k = -vigRound; ax = vcx * (1 + k * 0.5); ay = vcy * (1 - k * 0.5); }
    const vigHL = P.vigHighlights / 100;
    // tane
    const grA = P.grain / 100 * 0.14 * 255;
    const grBs = Math.max(1, Math.round((0.6 + P.grainSize / 40) * longSide / 1600));
    const grRo = P.grainRough / 100;

    const clarA = P.clarity / 100, texA = P.texture / 100 * 1.4;
    const shA = P.sharpen / 100 * 2.2 * (1 + P.sharpDetail / 100 * 0.6);
    const shTh = P.sharpMask / 100 * 18;

    for (let y = 0, idx = 0, p = 0; y < h; y++) {
      for (let x = 0; x < w; x++, idx++, p += 4) {
        let r = d[p], g2 = d[p + 1], b = d[p + 2];
        let delta = 0;
        const lm = lum ? lum[idx] : 0;
        let wm = 0;
        if (maskOn) {
          if (mKind === 0) {
            const dist = Math.sqrt((x - mCx) * (x - mCx) + (y - mCy) * (y - mCy)) / mR;
            wm = 1 - smoothstep(1 - mFe, 1, dist);
          } else {
            const t = ((x - mCx) * mSin - (y - mCy) * mCos) / (mR);
            wm = 1 - smoothstep(-mFe, mFe, t);
          }
          if (M_.invert) wm = 1 - wm;
        }
        if (bTex) delta += (lm - bTex[idx]) * texA;
        if (bClar) {
          const l = lm / 255, mid = 4 * l * (1 - l);
          const ca = clarA + (wm ? M_.clarity / 100 * wm : 0);
          delta += (lm - bClar[idx]) * ca * 1.1 * (0.35 + 0.65 * mid);
        }
        if (bSharp) {
          const df = lm - bSharp[idx];
          const ad = Math.abs(df);
          const mk = shTh > 0 ? smoothstep(shTh * 0.5, shTh * 1.5, ad) : 1;
          delta += df * shA * mk;
        }
        if (delta) {
          if (delta > 70) delta = 70; else if (delta < -70) delta = -70;
          r += delta; g2 += delta; b += delta;
        }
        if (wm) {
          if (M_.exposure) { const f = Math.exp(M_.exposure * wm * 0.312); r *= f; g2 *= f; b *= f; }
          if (M_.contrast) { const k = 1 + M_.contrast / 100 * wm; r = 128 + (r - 128) * k; g2 = 128 + (g2 - 128) * k; b = 128 + (b - 128) * k; }
          if (M_.saturation) {
            const l = 0.2126 * r + 0.7152 * g2 + 0.0722 * b, k = 1 + M_.saturation / 100 * wm;
            r = l + (r - l) * k; g2 = l + (g2 - l) * k; b = l + (b - l) * k;
          }
        }
        if (hasVig) {
          const dx = (x - vcx) / ax, dy = (y - vcy) / ay;
          const dd = Math.sqrt(dx * dx + dy * dy) / 1.0;
          let wv = smoothstep(vigMid - vigFe, vigMid + vigFe + 0.4, dd);
          if (vigHL) { const l = (0.2126 * r + 0.7152 * g2 + 0.0722 * b) / 255; wv *= 1 - vigHL * l * l; }
          if (vigA < 0) { const k = 1 + vigA * wv * 0.95; r *= k; g2 *= k; b *= k; }
          else { const k = vigA * wv * 0.8; r += (255 - r) * k; g2 += (255 - g2) * k; b += (255 - b) * k; }
        }
        if (hasGrain) {
          const bx = (x / grBs) | 0, by = (y / grBs) | 0;
          let n = (hash2(bx, by, 7) + hash2(bx, by, 13) - 1);
          if (grRo > 0) n = n * (1 - grRo * 0.6) + (hash2(x, y, 31) + hash2(x, y, 53) - 1) * grRo * 0.6;
          const l = (0.2126 * r + 0.7152 * g2 + 0.0722 * b) / 255;
          const k = grA * (1 - Math.abs(2 * l - 1) * 0.55) * n;
          r += k; g2 += k; b += k;
        }
        d[p] = r; d[p + 1] = g2; d[p + 2] = b; // Uint8ClampedArray kırpar
      }
    }
    return imgData;
  }

  /* 32 kutulu histogram (luma + R,G,B) */
  function histogram(imgData, bins) {
    bins = bins || 32;
    const d = imgData.data, out = { l: new Float32Array(bins), r: new Float32Array(bins), g: new Float32Array(bins), b: new Float32Array(bins) };
    const step = Math.max(1, Math.floor(d.length / 4 / 60000)) * 4;
    for (let i = 0; i < d.length; i += step) {
      const R = d[i], G = d[i + 1], B = d[i + 2];
      out.r[(R * bins / 256) | 0]++; out.g[(G * bins / 256) | 0]++; out.b[(B * bins / 256) | 0]++;
      out.l[((0.2126 * R + 0.7152 * G + 0.0722 * B) * bins / 256) | 0]++;
    }
    let mx = 1;
    for (const k of ['l', 'r', 'g', 'b']) for (let i = 1; i < bins - 1; i++) mx = Math.max(mx, out[k][i]);
    for (const k of ['l', 'r', 'g', 'b']) for (let i = 0; i < bins; i++) out[k][i] = Math.min(1, out[k][i] / mx);
    return out;
  }

  const api = { defaultParams, process, histogram, buildCurveLUT, blurPlane, HSL_NAMES, HSL_CENTERS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LuminaEngine = api;
})(typeof self !== 'undefined' ? self : this);
