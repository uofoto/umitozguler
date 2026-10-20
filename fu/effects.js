(() => {
  'use strict';

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const smoothstep = (edge0, edge1, value) => {
    const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  };

  function paintStrokes(ctx, width, height, strokes, { color = '#47d7c3', alpha = .32 } = {}) {
    const minSide = Math.min(width, height);
    for (const stroke of strokes || []) {
      if (!stroke.points?.length) continue;
      ctx.save();
      ctx.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
      ctx.globalAlpha = stroke.erase ? 1 : alpha;
      ctx.strokeStyle = stroke.erase ? 'rgba(255,255,255,1)' : color;
      ctx.fillStyle = stroke.erase ? 'rgba(255,255,255,1)' : color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(2, (stroke.radius || .015) * minSide * 2);
      if (stroke.points.length === 1) {
        const [x, y] = stroke.points[0];
        ctx.beginPath();
        ctx.arc(x * width, y * height, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0][0] * width, stroke.points[0][1] * height);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i][0] * width, stroke.points[i][1] * height);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function buildWaterMask(source, targetWidth, targetHeight, strokes = [], maxSide = 1152) {
    const scale = Math.min(1, maxSide / Math.max(targetWidth, targetHeight));
    const width = Math.max(1, Math.round(targetWidth * scale));
    const height = Math.max(1, Math.round(targetHeight * scale));
    const analysis = document.createElement('canvas');
    analysis.width = width;
    analysis.height = height;
    const analysisCtx = analysis.getContext('2d', { willReadFrequently: true });
    analysisCtx.drawImage(source, 0, 0, width, height);
    const pixels = analysisCtx.getImageData(0, 0, width, height).data;

    const mask = document.createElement('canvas');
    mask.width = width;
    mask.height = height;
    const maskCtx = mask.getContext('2d', { willReadFrequently: true });
    const image = maskCtx.createImageData(width, height);

    for (let y = 0, i = 0; y < height; y++) {
      const yn = y / Math.max(1, height - 1);
      const verticalPrior = .12 + .88 * smoothstep(.34, .68, yn);
      for (let x = 0; x < width; x++, i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const hi = Math.max(r, g, b);
        const lo = Math.min(r, g, b);
        const luma = .2126 * r + .7152 * g + .0722 * b;
        const chroma = hi - lo;
        const blueWater = smoothstep(1, 36, b - r + 1) * smoothstep(75, 158, b);
        const cyanWater = smoothstep(0, 31, g - r) * smoothstep(65, 135, b) * smoothstep(68, 152, g);
        const neutralWater = chroma < 18 && luma > 82 && luma < 210 ? .08 : 0;
        let score = Math.max(blueWater * .88, cyanWater * .78, neutralWater) * verticalPrior;
        score = smoothstep(.045, .48, score);
        image.data[i] = 255;
        image.data[i + 1] = 255;
        image.data[i + 2] = 255;
        image.data[i + 3] = Math.round(score * 214);
      }
    }
    maskCtx.putImageData(image, 0, 0);
    paintStrokes(maskCtx, width, height, strokes, { color: '#fff', alpha: .97 });

    const feather = document.createElement('canvas');
    feather.width = width;
    feather.height = height;
    const featherCtx = feather.getContext('2d', { willReadFrequently: true });
    featherCtx.filter = `blur(${Math.max(1, Math.round(Math.min(width, height) * .003))}px)`;
    featherCtx.drawImage(mask, 0, 0);
    featherCtx.filter = 'none';
    const result = featherCtx.getImageData(0, 0, width, height);
    analysis.width = analysis.height = 1;
    mask.width = mask.height = 1;
    feather.width = feather.height = 1;
    return { width, height, data: result.data };
  }

  window.PhotoEffects = Object.freeze({ paintStrokes, buildWaterMask });
})();
