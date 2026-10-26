export type EmbedStrength = 'soft' | 'balanced' | 'durable';

export type WatermarkPayload = {
  owner: string;
  createdAt: string;
  method: string;
};

export type PixelBuffer = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

export type DecodedWatermark = WatermarkPayload & {
  confidence: number;
};

const MAGIC = [0x46, 0x47, 0x52, 0x32]; // FGR2
const VERSION = 2;
const BLOCK_SIZE = 8;
const BIT_REPETITION = 2;
const EMBED_BANDS = 8;
const MAX_OWNER_BYTES = 84;
const STRENGTH_STEP: Record<EmbedStrength, number> = {
  soft: 16,
  balanced: 24,
  durable: 32,
};
const SAMPLE_STRENGTHS: EmbedStrength[] = ['durable', 'balanced', 'soft'];
const COEFFICIENT_PAIRS: ReadonlyArray<readonly [readonly [number, number], readonly [number, number]]> = [
  [[0, 1], [1, 0]],
  [[0, 2], [2, 0]],
  [[0, 3], [3, 0]],
  [[1, 1], [1, 2]],
  [[1, 3], [2, 1]],
  [[2, 2], [3, 1]],
  [[2, 3], [1, 4]],
  [[3, 2], [4, 1]],
];
const COS = Array.from({ length: BLOCK_SIZE }, (_, frequency) =>
  Array.from({ length: BLOCK_SIZE }, (_, position) => Math.cos(((2 * position + 1) * frequency * Math.PI) / 16)),
);
const ALPHA = (frequency: number) => (frequency === 0 ? 1 / Math.sqrt(2) : 1);

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function crc16(bytes: Uint8Array): number {
  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc;
}

function packetFor(owner: string): { packet: Uint8Array; payload: WatermarkPayload } {
  const ownerBytes = new TextEncoder().encode(owner.trim());
  if (!ownerBytes.length) throw new Error('İmza veya sahiplik bilgisi gerekli.');
  if (ownerBytes.length > MAX_OWNER_BYTES) throw new Error('İmza metni biraz daha kısa olmalı.');
  const createdAt = new Date().toISOString();
  const seconds = Math.floor(Date.now() / 1000);
  const packet = new Uint8Array(10 + ownerBytes.length + 2);
  packet.set(MAGIC, 0);
  packet[4] = VERSION;
  packet[5] = ownerBytes.length;
  packet[6] = (seconds >>> 24) & 0xff;
  packet[7] = (seconds >>> 16) & 0xff;
  packet[8] = (seconds >>> 8) & 0xff;
  packet[9] = seconds & 0xff;
  packet.set(ownerBytes, 10);
  const crc = crc16(packet.slice(4, 10 + ownerBytes.length));
  packet[10 + ownerBytes.length] = (crc >>> 8) & 0xff;
  packet[11 + ownerBytes.length] = crc & 0xff;
  return {
    packet,
    payload: { owner: owner.trim(), createdAt, method: 'FGR2 / block-DCT QIM' },
  };
}

function bitsFor(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  for (const byte of bytes) for (let bit = 0; bit < 8; bit += 1) bits.push((byte >> bit) & 1);
  return bits;
}

// Luminance is computed once per image (not once per coefficient) – this makes
// verification several times faster on phones.
function lumaPlane(pixels: PixelBuffer): Float64Array {
  const { data, width, height } = pixels;
  const plane = new Float64Array(width * height);
  for (let i = 0, p = 0; i < plane.length; i += 1, p += 4) {
    plane[i] = 0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2];
  }
  return plane;
}

function dctCoefficient(plane: Float64Array, width: number, blockX: number, blockY: number, u: number, v: number): number {
  let sum = 0;
  for (let y = 0; y < BLOCK_SIZE; y += 1) {
    const rowOffset = (blockY + y) * width + blockX;
    const cosV = COS[v][y];
    for (let x = 0; x < BLOCK_SIZE; x += 1) {
      sum += (plane[rowOffset + x] - 128) * COS[u][x] * cosV;
    }
  }
  return 0.25 * ALPHA(u) * ALPHA(v) * sum;
}

/** Bir katsayıya `delta` eklemenin 8×8 piksel etkisini (kayan noktalı) `block` dizisine biriktirir. */
function accumulateCoefficientDelta(block: Float64Array, u: number, v: number, delta: number): void {
  const scale = 0.25 * ALPHA(u) * ALPHA(v) * delta;
  for (let y = 0; y < BLOCK_SIZE; y += 1) {
    for (let x = 0; x < BLOCK_SIZE; x += 1) block[y * BLOCK_SIZE + x] += scale * COS[u][x] * COS[v][y];
  }
}

/**
 * Biriken tüm değişikliği blok başına TEK kez yuvarlayarak uygular. (Eski sürüm her katsayıdan sonra
 * ayrı ayrı yuvarlıyordu; küçük düzeltmeler 0'a yuvarlanıp kayboluyor, imza güvenilmez okunuyordu.)
 */
function writeBlock(data: Uint8ClampedArray, width: number, blockX: number, blockY: number, block: Float64Array): void {
  for (let y = 0; y < BLOCK_SIZE; y += 1) {
    for (let x = 0; x < BLOCK_SIZE; x += 1) {
      const change = block[y * BLOCK_SIZE + x];
      const index = ((blockY + y) * width + blockX + x) * 4;
      data[index] = clamp(Math.round(data[index] + change), 0, 255);
      data[index + 1] = clamp(Math.round(data[index + 1] + change), 0, 255);
      data[index + 2] = clamp(Math.round(data[index + 2] + change), 0, 255);
    }
  }
}

function blockDiff(data: Uint8ClampedArray, width: number, blockX: number, blockY: number, first: readonly [number, number], second: readonly [number, number]): number {
  const plane = new Float64Array(BLOCK_SIZE * BLOCK_SIZE);
  for (let y = 0; y < BLOCK_SIZE; y += 1) {
    for (let x = 0; x < BLOCK_SIZE; x += 1) {
      const i = ((blockY + y) * width + blockX + x) * 4;
      plane[y * BLOCK_SIZE + x] = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
  }
  return dctCoefficient(plane, BLOCK_SIZE, 0, 0, first[0], first[1]) - dctCoefficient(plane, BLOCK_SIZE, 0, 0, second[0], second[1]);
}

function quantizedBit(diff: number, step: number): number {
  const level = Math.round(diff / step);
  return Math.abs(level) % 2;
}

function readBlockBits(data: Float64Array, width: number, x: number, y: number, step: number): number[] {
  return COEFFICIENT_PAIRS.map(([first, second]) => {
    const diff = dctCoefficient(data, width, x, y, first[0], first[1]) - dctCoefficient(data, width, x, y, second[0], second[1]);
    return quantizedBit(diff, step);
  });
}

function bytesFromBits(bits: number[], start: number, count: number): Uint8Array {
  const bytes = new Uint8Array(count);
  for (let byteIndex = 0; byteIndex < count; byteIndex += 1) {
    let value = 0;
    for (let bit = 0; bit < 8; bit += 1) value |= (bits[start + byteIndex * 8 + bit] ?? 0) << bit;
    bytes[byteIndex] = value;
  }
  return bytes;
}

function payloadFromBits(bits: number[], start: number, confidence: number): DecodedWatermark | null {
  const header = bytesFromBits(bits, start, 10);
  if (!MAGIC.every((value, index) => header[index] === value) || header[4] !== VERSION) return null;
  const ownerLength = header[5];
  if (ownerLength < 1 || ownerLength > MAX_OWNER_BYTES) return null;
  const totalBytes = 10 + ownerLength + 2;
  if (start + totalBytes * 8 > bits.length) return null;
  const packet = bytesFromBits(bits, start, totalBytes);
  const expected = (packet[10 + ownerLength] << 8) | packet[11 + ownerLength];
  if (crc16(packet.slice(4, 10 + ownerLength)) !== expected) return null;
  const owner = new TextDecoder().decode(packet.slice(10, 10 + ownerLength));
  const seconds = (((packet[6] << 24) >>> 0) | (packet[7] << 16) | (packet[8] << 8) | packet[9]) >>> 0;
  return {
    owner,
    createdAt: new Date(seconds * 1000).toISOString(),
    method: 'FGR2 / block-DCT QIM',
    confidence,
  };
}

function findPayload(bits: number[], confidence: number): DecodedWatermark | null {
  const magicBits = bitsFor(new Uint8Array(MAGIC));
  for (let start = 0; start <= bits.length - magicBits.length; start += 1) {
    let matches = true;
    for (let bit = 0; bit < magicBits.length; bit += 1) {
      if (bits[start + bit] !== magicBits[bit]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      const result = payloadFromBits(bits, start, confidence);
      if (result) return result;
    }
  }
  return null;
}

function rowBits(plane: Float64Array, imageWidth: number, offsetX: number, rowY: number, step: number): { bits: number[]; confidence: number } {
  const bits: number[] = [];
  let confidenceTotal = 0;
  let blockCount = 0;
  for (let x = offsetX; x + BLOCK_SIZE <= imageWidth; x += BLOCK_SIZE) {
    const blockBits = readBlockBits(plane, imageWidth, x, rowY, step);
    bits.push(...blockBits);
    blockCount += 1;
    confidenceTotal += blockBits.length;
  }
  return { bits, confidence: Math.round(50 + Math.min(49, confidenceTotal / Math.max(1, blockCount))) };
}

function majorityBits(rows: number[][]): { bits: number[]; confidence: number } {
  const length = Math.min(...rows.map((row) => row.length));
  const bits: number[] = [];
  let agreement = 0;
  for (let index = 0; index < length; index += 1) {
    let ones = 0;
    for (const row of rows) ones += row[index];
    const zeros = rows.length - ones;
    const winning = Math.max(ones, zeros);
    bits.push(ones >= zeros ? 1 : 0);
    agreement += winning / rows.length;
  }
  return { bits, confidence: Math.round(50 + ((agreement / Math.max(1, length)) - 0.5) * 98) };
}

function collapseRepeatedBits(bits: number[]): { bits: number[]; confidence: number } {
  const collapsed: number[] = [];
  let agreement = 0;
  for (let index = 0; index + BIT_REPETITION <= bits.length; index += BIT_REPETITION) {
    const ones = bits.slice(index, index + BIT_REPETITION).reduce((total, bit) => total + bit, 0);
    const zeros = BIT_REPETITION - ones;
    collapsed.push(ones >= zeros ? 1 : 0);
    agreement += Math.max(ones, zeros) / BIT_REPETITION;
  }
  return { bits: collapsed, confidence: Math.round(50 + ((agreement / Math.max(1, collapsed.length)) - 0.5) * 98) };
}

const LEGACY_MAGIC = [0x46, 0x47, 0x52, 0x31]; // FGR1
const LEGACY_SAMPLES: Record<EmbedStrength, number> = { soft: 24, balanced: 40, durable: 64 };

function legacySeedFor(width: number, height: number): number {
  return (Math.imul(width, 73856093) ^ Math.imul(height, 19349663) ^ 0x9e3779b9) >>> 0;
}

function legacyRandom(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function* legacyPixels(width: number, height: number): Generator<number, void, unknown> {
  const random = legacyRandom(legacySeedFor(width, height));
  const used = new Set<number>();
  while (used.size < width * height) {
    const pixel = Math.floor(random() * width * height);
    if (used.has(pixel)) continue;
    used.add(pixel);
    yield pixel;
  }
}

function decodeLegacyWatermark(imageData: PixelBuffer): DecodedWatermark | null {
  for (const strength of SAMPLE_STRENGTHS) {
    const iterator = legacyPixels(imageData.width, imageData.height);
    const samples = LEGACY_SAMPLES[strength];
    const read = (count: number): { bytes: Uint8Array; confidence: number } => {
      const bytes = new Uint8Array(count);
      let confidenceTotal = 0;
      for (let byteIndex = 0; byteIndex < count; byteIndex += 1) {
        let value = 0;
        for (let bit = 0; bit < 8; bit += 1) {
          let ones = 0;
          for (let sample = 0; sample < samples; sample += 1) {
            const pixel = iterator.next().value as number;
            if ((imageData.data[pixel * 4 + 2] & 1) === 1) ones += 1;
          }
          value |= (ones >= samples / 2 ? 1 : 0) << bit;
          confidenceTotal += Math.abs(ones - samples / 2) / (samples / 2);
        }
        bytes[byteIndex] = value;
      }
      return { bytes, confidence: Math.round(50 + (confidenceTotal / Math.max(1, count * 8)) * 49) };
    };
    const header = read(7);
    if (!LEGACY_MAGIC.every((value, index) => header.bytes[index] === value) || header.bytes[4] !== 1) continue;
    const length = (header.bytes[5] << 8) | header.bytes[6];
    if (length < 2 || length > 144) continue;
    const rest = read(length + 2);
    const expected = (rest.bytes[length] << 8) | rest.bytes[length + 1];
    const body = rest.bytes.slice(0, length);
    if (crc16(body) !== expected) continue;
    try {
      const parsed = JSON.parse(new TextDecoder().decode(body)) as WatermarkPayload;
      if (typeof parsed.owner !== 'string' || typeof parsed.createdAt !== 'string' || typeof parsed.method !== 'string') continue;
      return { ...parsed, confidence: Math.round((header.confidence + rest.confidence) / 2) };
    } catch {
      continue;
    }
  }
  return null;
}

function bandBlockRow(band: number, bands: number, blocksHigh: number): number {
  return bands === 1 ? 0 : Math.round((band * (blocksHigh - 1)) / (bands - 1));
}

export function capacityFor(width: number, height: number, _strength: EmbedStrength = 'balanced'): number {
  return Math.floor((Math.floor(width / BLOCK_SIZE) * COEFFICIENT_PAIRS.length) / BIT_REPETITION / 8);
}

export function embedWatermark(
  imageData: PixelBuffer,
  owner: string,
  strength: EmbedStrength,
): { imageData: PixelBuffer; payload: WatermarkPayload; capacity: number } {
  const { packet, payload } = packetFor(owner);
  const bits = bitsFor(packet);
  const capacity = capacityFor(imageData.width, imageData.height, strength);
  if (capacity < packet.length) {
    const room = Math.max(0, capacity - 12);
    throw new Error(`Bu fotoğraf (${imageData.width}px genişlik) en fazla ${room} baytlık imza taşıyabilir; yazdığınız imza daha uzun. İmzayı kısaltın veya daha geniş bir fotoğraf seçin.`);
  }
  const step = STRENGTH_STEP[strength];
  const output = new Uint8ClampedArray(imageData.data);
  const plane = lumaPlane(imageData);
  const blocksWide = Math.floor(imageData.width / BLOCK_SIZE);
  const blocksHigh = Math.floor(imageData.height / BLOCK_SIZE);
  const bands = Math.min(EMBED_BANDS, blocksHigh);
  const blocksNeeded = Math.ceil((bits.length * BIT_REPETITION) / COEFFICIENT_PAIRS.length);
  for (let band = 0; band < bands; band += 1) {
    const blockY = bandBlockRow(band, bands, blocksHigh);
    const y = blockY * BLOCK_SIZE;
    for (let blockX = 0; blockX < Math.min(blocksWide, blocksNeeded); blockX += 1) {
      const x = blockX * BLOCK_SIZE;
      const targets: number[] = [];
      let delta = new Float64Array(BLOCK_SIZE * BLOCK_SIZE);
      for (let pairIndex = 0; pairIndex < COEFFICIENT_PAIRS.length; pairIndex += 1) {
        const [first, second] = COEFFICIENT_PAIRS[pairIndex];
        const repeatedIndex = blockX * COEFFICIENT_PAIRS.length + pairIndex;
        const bit = bits[Math.floor(repeatedIndex / BIT_REPETITION) % bits.length];
        const current = dctCoefficient(plane, imageData.width, x, y, first[0], first[1]) - dctCoefficient(plane, imageData.width, x, y, second[0], second[1]);
        let targetLevel = Math.round(current / step);
        if (Math.abs(targetLevel) % 2 !== bit) targetLevel += targetLevel >= 0 ? 1 : -1;
        const target = targetLevel * step;
        targets.push(target);
        const correction = (target - current) / 2;
        accumulateCoefficientDelta(delta, first[0], first[1], correction);
        accumulateCoefficientDelta(delta, second[0], second[1], -correction);
      }
      writeBlock(output, imageData.width, x, y, delta);
      // Kapalı döngü: 0/255'e kırpılan pikseller yüzünden kalan sapmayı ölç ve düzelt.
      for (let pass = 0; pass < 3; pass += 1) {
        delta = new Float64Array(BLOCK_SIZE * BLOCK_SIZE);
        let dirty = false;
        for (let pairIndex = 0; pairIndex < COEFFICIENT_PAIRS.length; pairIndex += 1) {
          const [first, second] = COEFFICIENT_PAIRS[pairIndex];
          const residual = targets[pairIndex] - blockDiff(output, imageData.width, x, y, first, second);
          if (Math.abs(residual) > step / 8) {
            dirty = true;
            accumulateCoefficientDelta(delta, first[0], first[1], residual / 2);
            accumulateCoefficientDelta(delta, second[0], second[1], -residual / 2);
          }
        }
        if (!dirty) break;
        writeBlock(output, imageData.width, x, y, delta);
      }
    }
  }
  return { imageData: { data: output, width: imageData.width, height: imageData.height }, payload, capacity };
}

function decodeAligned(imageData: PixelBuffer, plane: Float64Array): DecodedWatermark | null {
  // Kırpılmamış görsellerde imza, gömme sırasında seçilen 8 banda tekrarlanır; hepsini oylayarak oku.
  const blocksHigh = Math.floor(imageData.height / BLOCK_SIZE);
  const bands = Math.min(EMBED_BANDS, blocksHigh);
  if (bands < 1) return null;
  for (const strength of SAMPLE_STRENGTHS) {
    const step = STRENGTH_STEP[strength];
    const rows: number[][] = [];
    for (let band = 0; band < bands; band += 1) {
      const rowResult = rowBits(plane, imageData.width, 0, bandBlockRow(band, bands, blocksHigh) * BLOCK_SIZE, step);
      const collapsed = collapseRepeatedBits(rowResult.bits);
      const single = findPayload(collapsed.bits, collapsed.confidence);
      if (single) return single;
      rows.push(rowResult.bits);
    }
    const voted = majorityBits(rows);
    const collapsed = collapseRepeatedBits(voted.bits);
    const payload = findPayload(collapsed.bits, Math.min(voted.confidence, collapsed.confidence));
    if (payload) return payload;
  }
  return null;
}

export function decodeWatermark(imageData: PixelBuffer): DecodedWatermark | null {
  const plane = lumaPlane(imageData);
  const aligned = decodeAligned(imageData, plane);
  if (aligned) return aligned;
  const maxRows = Math.min(8, Math.floor(imageData.height / BLOCK_SIZE));
  for (const strength of SAMPLE_STRENGTHS) {
    const step = STRENGTH_STEP[strength];
    for (let offsetY = 0; offsetY < BLOCK_SIZE && offsetY + BLOCK_SIZE <= imageData.height; offsetY += 1) {
      for (let offsetX = 0; offsetX < BLOCK_SIZE && offsetX + BLOCK_SIZE <= imageData.width; offsetX += 1) {
        const rows: number[][] = [];
        for (let row = 0; row < maxRows; row += 1) {
          const rowResult = rowBits(plane, imageData.width, offsetX, offsetY + row * BLOCK_SIZE, step);
          const rowCollapsed = collapseRepeatedBits(rowResult.bits);
          const rowPayload = findPayload(rowCollapsed.bits, rowCollapsed.confidence);
          if (rowPayload) return rowPayload;
          rows.push(rowResult.bits);
        }
        const result = majorityBits(rows);
        const collapsed = collapseRepeatedBits(result.bits);
        const payload = findPayload(collapsed.bits, Math.min(result.confidence, collapsed.confidence));
        if (payload) return payload;
      }
    }
  }
  return decodeLegacyWatermark(imageData);
}

export function strengthLabel(strength: EmbedStrength): { title: string; note: string } {
  if (strength === 'soft') return { title: 'Narin', note: 'En düşük piksel etkisi · kayıpsız PNG için' };
  if (strength === 'durable') return { title: 'Dayanıklı', note: 'Daha güçlü sinyal · yeniden kodlamaya karşı daha iyi' };
  return { title: 'Dengeli', note: 'Görsel kalite ve doğrulama için önerilen ayar' };
}
