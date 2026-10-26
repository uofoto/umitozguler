import { detectFormat, formatLabel, readDimensions, readHead, type ImageFormat } from './formats';
import { fitWithin, flattenOnWhite, type PixelBuffer } from './core';
import { callWorker } from './worker-client';

// Mobil bellek güvenliği için çalışma çözünürlüğü sınırı.
export const MAX_EDGE = 2200;
export const MAX_PIXELS = 4_000_000;

export type LoadedImage = {
  pixels: PixelBuffer;
  format: ImageFormat;
  previewUrl: string;
  originalWidth: number | null;
  originalHeight: number | null;
};

type Drawable = { source: CanvasImageSource; width: number; height: number; release: () => void };

function readAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  return file.arrayBuffer
    ? file.arrayBuffer().catch(() => viaReader(file))
    : viaReader(file);
}

function viaReader(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (reader.result instanceof ArrayBuffer ? resolve(reader.result) : reject(new Error('Dosya okunamadı.')));
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsArrayBuffer(file);
  });
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Tarayıcı görseli çözemedi.'));
    image.src = url;
  });
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Dosya okunamadı.')));
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Tarayıcının kendi çözücüsüyle okur. Sırayla: createImageBitmap → <img> (blob URL) → <img> (data URL).
 * iOS Safari/WebView'larda bunlardan biri sıklıkla diğerinin başarısız olduğu dosyayı açar.
 */
async function decodeNative(file: File, format: ImageFormat, hintedSize: { width: number; height: number } | null): Promise<Drawable> {
  const isSvg = format === 'SVG';
  if (!isSvg && typeof createImageBitmap === 'function') {
    const tooBig = hintedSize && hintedSize.width * hintedSize.height > MAX_PIXELS * 4;
    const attempts: Array<ImageBitmapOptions | undefined> = [];
    if (tooBig && hintedSize) {
      // Çok büyük (ör. 48 MP) fotoğrafı bellekte tam boyutta açmamak için çözerken küçült.
      const resize: ImageBitmapOptions = { imageOrientation: 'from-image', resizeQuality: 'high' };
      if (hintedSize.width >= hintedSize.height) resize.resizeWidth = MAX_EDGE * 2; else resize.resizeHeight = MAX_EDGE * 2;
      attempts.push(resize);
    }
    attempts.push({ imageOrientation: 'from-image' });
    for (const options of attempts) {
      try {
        const bitmap = options ? await createImageBitmap(file, options) : await createImageBitmap(file);
        if (bitmap.width > 0 && bitmap.height > 0) return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
        bitmap.close();
      } catch {
        // sıradaki yöntemi dene
      }
    }
  }
  // <img> öğesi EXIF yönünü her modern tarayıcıda uygular; düz createImageBitmap(file) bazı eski
  // tarayıcılarda yönü yok sayabileceği için en sona bırakılır.
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImageElement(url);
    const width = image.naturalWidth || (isSvg ? 1024 : 0);
    const height = image.naturalHeight || (isSvg ? 1024 : 0);
    if (width > 0 && height > 0) return { source: image, width, height, release: () => { image.src = ''; URL.revokeObjectURL(url); } };
    URL.revokeObjectURL(url);
  } catch {
    URL.revokeObjectURL(url);
  }
  if (file.size > 40 * 1024 * 1024) throw new Error('Dosya çok büyük.');
  try {
    const image = await loadImageElement(await readAsDataUrl(file));
    if (image.naturalWidth && image.naturalHeight) return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => { image.src = ''; } };
  } catch {
    // son çare aşağıda
  }
  if (!isSvg && typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    if (bitmap.width > 0 && bitmap.height > 0) return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    bitmap.close();
  }
  throw new Error('Görselin boyutları okunamadı.');
}

function newCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function freeCanvas(canvas: HTMLCanvasElement | undefined) {
  if (canvas) { canvas.width = 0; canvas.height = 0; } // iOS Safari canvas belleğini ancak böyle bırakır
}

/** Kaynağı hedef boyuta yarı yarıya adımlarla küçülterek (kalite için) piksel dizisine çevirir. */
function drawToPixels(drawable: Drawable): PixelBuffer {
  const target = fitWithin(drawable.width, drawable.height, MAX_EDGE, MAX_PIXELS);
  let current: CanvasImageSource = drawable.source;
  let currentWidth = drawable.width;
  let currentHeight = drawable.height;
  let temp: HTMLCanvasElement | undefined;
  try {
    while (currentWidth / 2 > target.width && currentHeight / 2 > target.height) {
      const nextWidth = Math.max(target.width, Math.floor(currentWidth / 2));
      const nextHeight = Math.max(target.height, Math.floor(currentHeight / 2));
      const step = newCanvas(nextWidth, nextHeight);
      const stepContext = step.getContext('2d');
      if (!stepContext) throw new Error('Bu tarayıcıda görsel alanı başlatılamadı.');
      stepContext.imageSmoothingQuality = 'high';
      stepContext.drawImage(current, 0, 0, nextWidth, nextHeight);
      freeCanvas(temp);
      temp = step;
      current = step;
      currentWidth = nextWidth;
      currentHeight = nextHeight;
    }
    const canvas = newCanvas(target.width, target.height);
    try {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Bu tarayıcıda görsel alanı başlatılamadı.');
      // Saydam alanlar beyaza birleştirilir; alfa kanalı filigranı bozmasın.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, target.width, target.height);
      context.imageSmoothingQuality = 'high';
      context.drawImage(current, 0, 0, target.width, target.height);
      const imageData = context.getImageData(0, 0, target.width, target.height);
      return { data: imageData.data, width: target.width, height: target.height };
    } finally {
      freeCanvas(canvas);
    }
  } finally {
    freeCanvas(temp);
  }
}

async function decodeWithWorker(file: File, format: 'HEIC' | 'TIFF'): Promise<PixelBuffer> {
  const buffer = await readAsArrayBuffer(file);
  const reply = await callWorker({ action: 'decode', format, buffer, maxEdge: MAX_EDGE, maxPixels: MAX_PIXELS });
  if (!reply.ok) throw new Error(reply.message);
  if (!reply.pixels || !reply.width || !reply.height) throw new Error('Çözülen görsel boş geldi.');
  return { data: new Uint8ClampedArray(reply.pixels), width: reply.width, height: reply.height };
}

function explain(format: ImageFormat, reason: unknown): Error {
  const detail = reason instanceof Error ? reason.message : '';
  if (format === 'JXL' || format === 'JP2') {
    return new Error(`${formatLabel(format)} biçimini bu tarayıcı açamıyor. Fotoğrafı JPEG veya PNG olarak dışa aktarıp yeniden seçin.`);
  }
  if (format === 'UNKNOWN') {
    return new Error('Dosya bir görsel olarak tanınmadı. JPEG, PNG, WebP, HEIC/HEIF, AVIF, GIF, BMP, TIFF, ICO veya SVG seçin.');
  }
  if (/büyük|memory|bellek/i.test(detail)) {
    return new Error('Bu fotoğraf bu cihaz için çok büyük. Galeride daha küçük bir kopya oluşturup yeniden seçin.');
  }
  return new Error(`${formatLabel(format)} dosyası açılamadı${detail ? ` (${detail})` : ''}. Dosya bozuk olmayabilir; galeriden JPEG/PNG kopyası oluşturup deneyin.`);
}

export async function decodePixels(file: File, format: ImageFormat): Promise<PixelBuffer> {
  const hintedSize = readDimensions(await readHead(file, 256 * 1024));
  const nativeAttempt = async () => {
    const drawable = await decodeNative(file, format, hintedSize);
    try { return drawToPixels(drawable); } finally { drawable.release(); }
  };

  if (format === 'HEIC') {
    // Safari/iOS HEIC'i kendisi açar; Chrome/Android/Firefox açamaz → cihaz içi WASM çözücü.
    try { return await nativeAttempt(); } catch (nativeError) {
      try { return await decodeWithWorker(file, 'HEIC'); } catch (wasmError) { throw explain(format, wasmError ?? nativeError); }
    }
  }
  if (format === 'TIFF') {
    try { return await decodeWithWorker(file, 'TIFF'); } catch (tiffError) {
      try { return await nativeAttempt(); } catch { throw explain(format, tiffError); }
    }
  }
  try {
    return await nativeAttempt();
  } catch (error) {
    throw explain(format, error);
  }
}

export function pixelsToCanvas(pixels: PixelBuffer, maxEdge?: number): HTMLCanvasElement {
  const full = newCanvas(pixels.width, pixels.height);
  const context = full.getContext('2d');
  if (!context) throw new Error('Bu tarayıcıda görsel alanı başlatılamadı.');
  context.putImageData(new ImageData(new Uint8ClampedArray(pixels.data.buffer as ArrayBuffer, pixels.data.byteOffset, pixels.data.byteLength), pixels.width, pixels.height), 0, 0);
  if (!maxEdge || Math.max(pixels.width, pixels.height) <= maxEdge) return full;
  const scale = maxEdge / Math.max(pixels.width, pixels.height);
  const small = newCanvas(Math.max(1, Math.round(pixels.width * scale)), Math.max(1, Math.round(pixels.height * scale)));
  const smallContext = small.getContext('2d');
  if (!smallContext) { freeCanvas(full); throw new Error('Bu tarayıcıda görsel alanı başlatılamadı.'); }
  smallContext.imageSmoothingQuality = 'high';
  smallContext.drawImage(full, 0, 0, small.width, small.height);
  freeCanvas(full);
  return small;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const fallback = async () => {
      try {
        const response = await fetch(canvas.toDataURL(type, quality));
        resolve(await response.blob());
      } catch {
        reject(new Error('Görsel dosyası oluşturulamadı.'));
      }
    };
    try {
      canvas.toBlob((blob) => (blob ? resolve(blob) : void fallback()), type, quality);
    } catch {
      void fallback();
    }
  });
}

export async function pixelsToPngBlob(pixels: PixelBuffer): Promise<Blob> {
  const canvas = pixelsToCanvas(pixels);
  try { return await canvasToBlob(canvas, 'image/png'); } finally { freeCanvas(canvas); }
}

async function makePreviewUrl(pixels: PixelBuffer): Promise<string> {
  const canvas = pixelsToCanvas(pixels, 1000);
  try {
    return URL.createObjectURL(await canvasToBlob(canvas, 'image/jpeg', 0.86));
  } finally {
    freeCanvas(canvas);
  }
}

/** Dosyayı seçildiği anda bir kez çözer; önizleme ve işleme aynı piksellerden yapılır. */
export async function loadImage(file: File): Promise<LoadedImage> {
  const format = await detectFormat(file);
  const dimensions = readDimensions(await readHead(file, 256 * 1024));
  const pixels = await decodePixels(file, format);
  flattenOnWhite(pixels);
  const previewUrl = await makePreviewUrl(pixels);
  return { pixels, format, previewUrl, originalWidth: dimensions?.width ?? null, originalHeight: dimensions?.height ?? null };
}
