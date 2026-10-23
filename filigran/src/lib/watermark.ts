export type EmbedStrength = 'soft' | 'balanced' | 'durable';

export type WatermarkPayload = {
  owner: string;
  createdAt: string;
  method: string;
};

export type DecodedWatermark = WatermarkPayload & {
  confidence: number;
};

const MAGIC = [0x46, 0x47, 0x52, 0x31]; // FGR1
const VERSION = 1;
const MAX_PAYLOAD_BYTES = 144;
const SAMPLES_PER_BIT: Record<EmbedStrength, number> = {
  soft: 24,
  balanced: 40,
  durable: 64,
};
const SAMPLE_OPTIONS: EmbedStrength[] = ['durable', 'balanced', 'soft'];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function seedFor(width: number, height: number): number {
  return (Math.imul(width, 73856093) ^ Math.imul(height, 19349663) ^ 0x9e3779b9) >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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

function packetFor(payload: WatermarkPayload): Uint8Array {
  const body = new TextEncoder().encode(JSON.stringify(payload));
  if (body.length > MAX_PAYLOAD_BYTES) throw new Error('İmza metni biraz daha kısa olmalı.');
  const packet = new Uint8Array(7 + body.length + 2);
  packet.set(MAGIC, 0);
  packet[4] = VERSION;
  packet[5] = (body.length >> 8) & 0xff;
  packet[6] = body.length & 0xff;
  packet.set(body, 7);
  const crc = crc16(body);
  packet[7 + body.length] = (crc >> 8) & 0xff;
  packet[8 + body.length] = crc & 0xff;
  return packet;
}

function bitsFor(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  for (const byte of bytes) for (let bit = 0; bit < 8; bit += 1) bits.push((byte >> bit) & 1);
  return bits;
}

function* pixelIterator(width: number, height: number): Generator<number, void, unknown> {
  const random = mulberry32(seedFor(width, height));
  const count = width * height;
  const used = new Set<number>();
  while (used.size < count) {
    const pixel = Math.floor(random() * count);
    if (used.has(pixel)) continue;
    used.add(pixel);
    yield pixel;
  }
}

function sampleBit(
  data: Uint8ClampedArray,
  iterator: Generator<number, void, unknown>,
  samples: number,
): { bit: number; confidence: number } {
  let ones = 0;
  for (let sample = 0; sample < samples; sample += 1) {
    const pixel = iterator.next().value as number;
    if ((data[pixel * 4 + 2] & 1) === 1) ones += 1;
  }
  const distance = Math.abs(ones - samples / 2) / (samples / 2);
  return { bit: ones >= samples / 2 ? 1 : 0, confidence: clamp(Math.round(50 + distance * 49), 50, 99) };
}

function readBytes(
  data: Uint8ClampedArray,
  iterator: Generator<number, void, unknown>,
  count: number,
  samples: number,
): { bytes: Uint8Array; confidences: number[] } {
  const bytes = new Uint8Array(count);
  const confidences: number[] = [];
  for (let byteIndex = 0; byteIndex < count; byteIndex += 1) {
    let value = 0;
    for (let bit = 0; bit < 8; bit += 1) {
      const sample = sampleBit(data, iterator, samples);
      value |= sample.bit << bit;
      confidences.push(sample.confidence);
    }
    bytes[byteIndex] = value;
  }
  return { bytes, confidences };
}

export function capacityFor(width: number, height: number, strength: EmbedStrength = 'balanced'): number {
  return Math.floor((width * height) / (SAMPLES_PER_BIT[strength] * 8));
}

export function embedWatermark(
  imageData: ImageData,
  owner: string,
  strength: EmbedStrength,
): { imageData: ImageData; payload: WatermarkPayload; capacity: number } {
  const cleanOwner = owner.trim();
  if (!cleanOwner) throw new Error('İmza veya sahiplik bilgisi gerekli.');
  const payload: WatermarkPayload = {
    owner: cleanOwner,
    createdAt: new Date().toISOString(),
    method: 'FGR1 / invisible channel-bit spread',
  };
  const packet = packetFor(payload);
  const bits = bitsFor(packet);
  const samples = SAMPLES_PER_BIT[strength];
  const capacity = capacityFor(imageData.width, imageData.height, strength);
  if (capacity < packet.length) {
    throw new Error(`Bu fotoğrafın çözünürlüğü imzayı taşımak için düşük. Daha büyük bir görsel deneyin.`);
  }

  const output = new Uint8ClampedArray(imageData.data);
  const iterator = pixelIterator(imageData.width, imageData.height);
  for (const bit of bits) {
    for (let sample = 0; sample < samples; sample += 1) {
      const pixel = iterator.next().value as number;
      const channel = pixel * 4 + 2;
      output[channel] = (output[channel] & 0xfe) | bit;
    }
  }
  return { imageData: new ImageData(output, imageData.width, imageData.height), payload, capacity };
}

function decodeWithStrength(imageData: ImageData, strength: EmbedStrength): DecodedWatermark | null {
  const samples = SAMPLES_PER_BIT[strength];
  const iterator = pixelIterator(imageData.width, imageData.height);
  const header = readBytes(imageData.data, iterator, 7, samples);
  if (!MAGIC.every((value, index) => header.bytes[index] === value) || header.bytes[4] !== VERSION) return null;
  const length = (header.bytes[5] << 8) | header.bytes[6];
  if (length < 2 || length > MAX_PAYLOAD_BYTES) return null;
  const rest = readBytes(imageData.data, iterator, length + 2, samples);
  const body = rest.bytes.slice(0, length);
  const expected = (rest.bytes[length] << 8) | rest.bytes[length + 1];
  if (crc16(body) !== expected) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(body)) as WatermarkPayload;
    if (typeof parsed.owner !== 'string' || typeof parsed.createdAt !== 'string' || typeof parsed.method !== 'string') return null;
    const allConfidences = [...header.confidences, ...rest.confidences];
    const confidence = Math.round(allConfidences.reduce((total, score) => total + score, 0) / allConfidences.length);
    return { ...parsed, confidence };
  } catch {
    return null;
  }
}

export function decodeWatermark(imageData: ImageData): DecodedWatermark | null {
  for (const strength of SAMPLE_OPTIONS) {
    const result = decodeWithStrength(imageData, strength);
    if (result) return result;
  }
  return null;
}

export function strengthLabel(strength: EmbedStrength): { title: string; note: string } {
  if (strength === 'soft') return { title: 'Narin', note: 'En küçük iz · görsel kalite öncelikli' };
  if (strength === 'durable') return { title: 'Dayanıklı', note: 'Daha çok tekrar · yeniden sıkıştırmalara karşı daha iyi' };
  return { title: 'Dengeli', note: 'Görsel kalite ve bulunabilirlik için önerilen ayar' };
}
