// Ağır işler (HEIC/TIFF çözme, küçültme, filigran gömme/doğrulama).
// DOM'a bağımlı değildir: Web Worker'da, ana iş parçacığında ve Node testlerinde çalışır.
import { decodeWatermark, embedWatermark, type DecodedWatermark, type EmbedStrength, type PixelBuffer } from './watermark';

export type { PixelBuffer };

/** Alan ortalamalı (box) küçültme: canvas/OffscreenCanvas gerektirmez. */
export function downscale(source: PixelBuffer, targetWidth: number, targetHeight: number): PixelBuffer {
  if (targetWidth >= source.width && targetHeight >= source.height) return source;
  const out = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  const xRatio = source.width / targetWidth;
  const yRatio = source.height / targetHeight;
  for (let y = 0; y < targetHeight; y += 1) {
    const y0 = Math.floor(y * yRatio);
    const y1 = Math.max(y0 + 1, Math.min(source.height, Math.floor((y + 1) * yRatio)));
    for (let x = 0; x < targetWidth; x += 1) {
      const x0 = Math.floor(x * xRatio);
      const x1 = Math.max(x0 + 1, Math.min(source.width, Math.floor((x + 1) * xRatio)));
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let yy = y0; yy < y1; yy += 1) {
        let p = (yy * source.width + x0) * 4;
        for (let xx = x0; xx < x1; xx += 1, p += 4) {
          const alpha = source.data[p + 3];
          r += source.data[p] * alpha; g += source.data[p + 1] * alpha; b += source.data[p + 2] * alpha; a += alpha; count += 1;
        }
      }
      const o = (y * targetWidth + x) * 4;
      if (a > 0) { out[o] = r / a; out[o + 1] = g / a; out[o + 2] = b / a; }
      out[o + 3] = a / Math.max(1, count);
    }
  }
  return { data: out, width: targetWidth, height: targetHeight };
}

export function fitWithin(width: number, height: number, maxEdge: number, maxPixels: number): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height), Math.sqrt(maxPixels / (width * height)));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Saydam pikselleri beyaz zemine birleştirir (filigranın alfa kanalında bozulmaması için). */
export function flattenOnWhite(pixels: PixelBuffer): PixelBuffer {
  const { data } = pixels;
  for (let p = 0; p < data.length; p += 4) {
    const alpha = data[p + 3];
    if (alpha === 255) continue;
    const k = alpha / 255;
    data[p] = Math.round(data[p] * k + 255 * (1 - k));
    data[p + 1] = Math.round(data[p + 1] * k + 255 * (1 - k));
    data[p + 2] = Math.round(data[p + 2] * k + 255 * (1 - k));
    data[p + 3] = 255;
  }
  return pixels;
}

type LibHeif = {
  HeifDecoder: new () => {
    decode: (data: Uint8Array) => Array<{
      get_width: () => number;
      get_height: () => number;
      display: (target: { data: Uint8ClampedArray; width: number; height: number }, done: (result: unknown) => void) => void;
      free?: () => void;
    }>;
  };
};

export async function decodeHeic(buffer: ArrayBuffer, maxEdge: number, maxPixels: number): Promise<PixelBuffer> {
  const module = (await import('libheif-js/wasm-bundle')) as unknown as { default?: LibHeif } & LibHeif;
  const libheif: LibHeif = module.default ?? module;
  const decoder = new libheif.HeifDecoder();
  const images = decoder.decode(new Uint8Array(buffer));
  if (!images || images.length === 0) throw new Error('HEIC dosyasında görsel bulunamadı.');
  // Birden çok görsel varsa (ör. canlı fotoğraf/seri) en büyüğünü al.
  const image = images.reduce((best, item) => (item.get_width() * item.get_height() > best.get_width() * best.get_height() ? item : best));
  const width = image.get_width();
  const height = image.get_height();
  if (!width || !height) throw new Error('HEIC görselinin boyutları okunamadı.');
  if (width * height > 80_000_000) throw new Error('Bu HEIC fotoğrafı bu cihaz için çok büyük (80 MP üstü).');
  const target = { data: new Uint8ClampedArray(width * height * 4), width, height };
  await new Promise<void>((resolve, reject) => {
    image.display(target, (result) => (result ? resolve() : reject(new Error('HEIC fotoğrafı çözülemedi.'))));
  });
  const fit = fitWithin(width, height, maxEdge, maxPixels);
  return downscale(target, fit.width, fit.height);
}

type UtifIfd = { width: number; height: number };
type Utif = {
  decode: (buffer: ArrayBuffer) => UtifIfd[];
  decodeImage: (buffer: ArrayBuffer, ifd: UtifIfd, all: UtifIfd[]) => void;
  toRGBA8: (ifd: UtifIfd) => Uint8Array;
};

export async function decodeTiff(buffer: ArrayBuffer, maxEdge: number, maxPixels: number): Promise<PixelBuffer> {
  const module = (await import('utif2')) as unknown as { default?: Utif } & Utif;
  const utif: Utif = module.default ?? module;
  const ifds = utif.decode(buffer);
  if (!ifds.length) throw new Error('TIFF dosyasında görsel bulunamadı.');
  // En büyük sayfayı (genelde ilki) al; küçük önizleme sayfalarını atla.
  const page = ifds.reduce((best, item) => ((item.width || 0) * (item.height || 0) > (best.width || 0) * (best.height || 0) ? item : best));
  utif.decodeImage(buffer, page, ifds);
  if (!page.width || !page.height) throw new Error('TIFF görseli çözülemedi.');
  const rgba = utif.toRGBA8(page);
  const full: PixelBuffer = { data: new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.byteLength), width: page.width, height: page.height };
  const fit = fitWithin(full.width, full.height, maxEdge, maxPixels);
  return downscale(full, fit.width, fit.height);
}

export function embedTask(pixels: PixelBuffer, owner: string, strength: EmbedStrength): { pixels: PixelBuffer; capacity: number } {
  const result = embedWatermark(pixels, owner, strength);
  return { pixels: result.imageData, capacity: result.capacity };
}

export function verifyTask(pixels: PixelBuffer): DecodedWatermark | null {
  return decodeWatermark(pixels);
}

export type WorkerRequest =
  | { id: number; action: 'decode'; format: 'HEIC' | 'TIFF'; buffer: ArrayBuffer; maxEdge: number; maxPixels: number }
  | { id: number; action: 'embed'; pixels: ArrayBuffer; width: number; height: number; owner: string; strength: EmbedStrength }
  | { id: number; action: 'verify'; pixels: ArrayBuffer; width: number; height: number };

export type WorkerResponse =
  | { id: number; ok: true; pixels?: ArrayBuffer; width?: number; height?: number; watermark?: DecodedWatermark | null }
  | { id: number; ok: false; message: string };

/** Worker ve ana iş parçacığı yedeği aynı kodu çalıştırır. */
export async function handleRequest(request: WorkerRequest): Promise<{ response: WorkerResponse; transfer: ArrayBuffer[] }> {
  try {
    if (request.action === 'decode') {
      const pixels = request.format === 'HEIC'
        ? await decodeHeic(request.buffer, request.maxEdge, request.maxPixels)
        : await decodeTiff(request.buffer, request.maxEdge, request.maxPixels);
      flattenOnWhite(pixels);
      const buffer = pixels.data.buffer as ArrayBuffer;
      return { response: { id: request.id, ok: true, pixels: buffer, width: pixels.width, height: pixels.height }, transfer: [buffer] };
    }
    if (request.action === 'embed') {
      const result = embedTask({ data: new Uint8ClampedArray(request.pixels), width: request.width, height: request.height }, request.owner, request.strength);
      const buffer = result.pixels.data.buffer as ArrayBuffer;
      return { response: { id: request.id, ok: true, pixels: buffer, width: result.pixels.width, height: result.pixels.height }, transfer: [buffer] };
    }
    const watermark = verifyTask({ data: new Uint8ClampedArray(request.pixels), width: request.width, height: request.height });
    return { response: { id: request.id, ok: true, watermark }, transfer: [] };
  } catch (error) {
    return { response: { id: request.id, ok: false, message: error instanceof Error ? error.message : String(error) }, transfer: [] };
  }
}
