// Dosya biçimi, uzantıya veya MIME türüne DEĞİL, dosyanın gerçek baytlarına bakılarak
// belirlenir. Mobil tarayıcılar (özellikle iOS) .jpg adlı dosyanın içine HEIC koyabilir,
// File.type'ı boş veya yanlış bildirebilir.

export type ImageFormat =
  | 'JPEG' | 'PNG' | 'WEBP' | 'GIF' | 'BMP' | 'TIFF' | 'ICO'
  | 'HEIC' | 'AVIF' | 'JXL' | 'JP2' | 'SVG' | 'UNKNOWN';

const HEIC_BRANDS = ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1'];
const AVIF_BRANDS = ['avif', 'avis'];

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let out = '';
  for (let i = start; i < start + length && i < bytes.length; i += 1) out += String.fromCharCode(bytes[i]);
  return out;
}

/** Dosyanın ilk baytlarından (en az 64 bayt önerilir) biçimi bulur. */
export function sniffBytes(bytes: Uint8Array): ImageFormat {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'JPEG';
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 3) === 'PNG') return 'PNG';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'WEBP';
  if (bytes.length >= 6 && ascii(bytes, 0, 4) === 'GIF8') return 'GIF';
  if (bytes.length >= 2 && ascii(bytes, 0, 2) === 'BM') return 'BMP';
  if (bytes.length >= 4 && ((ascii(bytes, 0, 2) === 'II' && bytes[2] === 0x2a && bytes[3] === 0) || (ascii(bytes, 0, 2) === 'MM' && bytes[2] === 0 && bytes[3] === 0x2a))) return 'TIFF';
  if (bytes.length >= 4 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0) return 'ICO';
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0x0a) return 'JXL';
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'JXL ') return 'JXL';
  if (bytes.length >= 12 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 0 && bytes[3] === 0x0c && ascii(bytes, 4, 4) === 'jP  ') return 'JP2';

  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp') {
    // ftyp kutusu: [boyut][ftyp][ana marka][sürüm][uyumlu markalar...]
    const declared = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
    const end = Math.min(bytes.length, declared >= 16 ? declared : bytes.length);
    const brands = [ascii(bytes, 8, 4)];
    for (let i = 16; i + 4 <= end; i += 4) brands.push(ascii(bytes, i, 4));
    if (brands.some((brand) => AVIF_BRANDS.includes(brand))) return 'AVIF';
    if (brands.some((brand) => HEIC_BRANDS.includes(brand))) return 'HEIC';
  }

  const head = ascii(bytes, 0, 512).trimStart().toLowerCase();
  if (head.startsWith('<svg') || ((head.startsWith('<?xml') || head.startsWith('<!doctype svg')) && head.includes('<svg'))) return 'SVG';
  return 'UNKNOWN';
}

/** Bayt tanıması başarısız olursa son çare: MIME türü ve uzantı. */
export function formatFromHints(name: string, mime: string): ImageFormat {
  const type = mime.toLowerCase().split(';')[0].trim();
  const ext = name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? '';
  if (type === 'image/jpeg' || type === 'image/jpg' || ext === 'jpg' || ext === 'jpeg' || ext === 'jfif' || ext === 'jpe') return 'JPEG';
  if (type === 'image/png' || ext === 'png') return 'PNG';
  if (type === 'image/webp' || ext === 'webp') return 'WEBP';
  if (type === 'image/gif' || ext === 'gif') return 'GIF';
  if (type === 'image/bmp' || type === 'image/x-ms-bmp' || ext === 'bmp') return 'BMP';
  if (type === 'image/tiff' || ext === 'tif' || ext === 'tiff') return 'TIFF';
  if (type === 'image/avif' || ext === 'avif') return 'AVIF';
  if (type === 'image/heic' || type === 'image/heif' || type === 'image/heic-sequence' || ext === 'heic' || ext === 'heif' || ext === 'hif') return 'HEIC';
  if (type === 'image/svg+xml' || ext === 'svg') return 'SVG';
  if (type === 'image/x-icon' || type === 'image/vnd.microsoft.icon' || ext === 'ico') return 'ICO';
  if (type === 'image/jxl' || ext === 'jxl') return 'JXL';
  if (type === 'image/jp2' || ext === 'jp2' || ext === 'j2k') return 'JP2';
  return 'UNKNOWN';
}

export async function readHead(file: Blob, length = 64): Promise<Uint8Array> {
  const slice = file.slice(0, length);
  try {
    return new Uint8Array(await slice.arrayBuffer());
  } catch {
    // Eski mobil WebView'lerde Blob.arrayBuffer() olmayabilir.
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => (reader.result instanceof ArrayBuffer ? resolve(new Uint8Array(reader.result)) : reject(new Error('Dosya başlığı okunamadı.')));
      reader.onerror = () => reject(new Error('Dosya başlığı okunamadı.'));
      reader.readAsArrayBuffer(slice);
    });
  }
}

export async function detectFormat(file: File): Promise<ImageFormat> {
  const bySignature = sniffBytes(await readHead(file));
  return bySignature !== 'UNKNOWN' ? bySignature : formatFromHints(file.name, file.type);
}

export function formatLabel(format: ImageFormat): string {
  return format === 'UNKNOWN' ? 'GÖRSEL' : format === 'JP2' ? 'JPEG 2000' : format === 'JXL' ? 'JPEG XL' : format;
}

/** Üst boyut okunabiliyorsa (JPEG/PNG/WebP) tam çözmeden önce kullanılır. */
export function readDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length >= 24 && bytes[0] === 0x89 && ascii(bytes, 1, 3) === 'PNG') return { width: view.getUint32(16), height: view.getUint32(20) };
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    let i = 2;
    while (i + 4 < bytes.length) {
      while (i < bytes.length && bytes[i] !== 0xff) i += 1;
      while (i < bytes.length && bytes[i] === 0xff) i += 1;
      if (i >= bytes.length) break;
      const marker = bytes[i++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
      if (i + 1 >= bytes.length) break;
      const length = (bytes[i] << 8) | bytes[i + 1];
      if (length < 2 || i + length > bytes.length) break;
      if (sof.has(marker) && length >= 7) return { height: (bytes[i + 3] << 8) | bytes[i + 4], width: (bytes[i + 5] << 8) | bytes[i + 6] };
      i += length;
    }
  }
  return null;
}
