import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { encode } from 'blurhash';
import { config } from '../config/index.js';
import { MediaVariant } from '@nirakar/shared';

const TARGET_WIDTHS = [320, 768, 1440];

export interface ProcessedMedia {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  blurhash: string;
  dominantColor: string;
  variants: MediaVariant[];
}

export async function ensureUploadDirs() {
  const base = path.resolve(config.STORAGE_LOCAL_PATH);
  await fs.mkdir(base, { recursive: true });
  await fs.mkdir(path.join(base, 'variants'), { recursive: true });
  await fs.mkdir(path.join(base, 'magazines'), { recursive: true });
}

// Maximum allowed PDF buffer size (15MB threshold to accommodate exact 10MB files and compression variance)
const MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024;

export async function processDocumentUpload(
  buffer: Buffer,
  originalFilename: string
): Promise<ProcessedMedia> {
  if (buffer.length > MAX_PDF_SIZE_BYTES) {
    throw new Error('PDF exceeds the 15MB size limit. Please compress your PDF document before uploading.');
  }
  if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new Error('The uploaded document is not a valid PDF.');
  }

  await ensureUploadDirs();
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  const ext = path.extname(originalFilename).toLowerCase() || '.pdf';
  const mainFilename = `doc-${hash}${ext}`;
  const baseDir = path.resolve(config.STORAGE_LOCAL_PATH);

  await fs.writeFile(path.join(baseDir, mainFilename), buffer);

  return {
    filename: mainFilename,
    originalName: originalFilename,
    mimeType: 'application/pdf',
    sizeBytes: buffer.length,
    width: 0,
    height: 0,
    blurhash: 'PDF-DOCUMENT',
    dominantColor: '#1e293b',
    variants: [{ width: 0, format: 'pdf', url: `/uploads/${mainFilename}` }],
  };
}

export async function processVideoUpload(
  buffer: Buffer,
  originalFilename: string,
  mimeType?: string
): Promise<ProcessedMedia> {
  await ensureUploadDirs();
  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  const ext = path.extname(originalFilename).toLowerCase() || '.mp4';
  const mainFilename = `video-${hash}${ext}`;
  const baseDir = path.resolve(config.STORAGE_LOCAL_PATH);

  await fs.writeFile(path.join(baseDir, mainFilename), buffer);

  return {
    filename: mainFilename,
    originalName: originalFilename,
    mimeType: mimeType || 'video/mp4',
    sizeBytes: buffer.length,
    width: 1920,
    height: 1080,
    blurhash: 'VIDEO-CLIP',
    dominantColor: '#0b132b',
    variants: [{ width: 1920, format: (ext.replace('.', '') as any), url: `/uploads/${mainFilename}` }] as any,
  };
}

export async function processMediaUpload(
  buffer: Buffer,
  originalFilename: string,
  mimeType?: string
): Promise<ProcessedMedia> {
  if (mimeType === 'application/pdf' || originalFilename.toLowerCase().endsWith('.pdf')) {
    return processDocumentUpload(buffer, originalFilename);
  }
  if (mimeType?.startsWith('video/') || originalFilename.match(/\.(mp4|webm|mov|mkv)$/i)) {
    return processVideoUpload(buffer, originalFilename, mimeType);
  }
  return processImageUpload(buffer, originalFilename);
}

export async function processImageUpload(
  buffer: Buffer,
  originalFilename: string
): Promise<ProcessedMedia> {
  await ensureUploadDirs();

  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image: could not read dimensions');
  }

  // Auto-rotate and cap longest side at 2560px for optimal performance
  let pipeline = image.rotate();
  if (metadata.width > 2560 || metadata.height > 2560) {
    pipeline = pipeline.resize(2560, 2560, { fit: 'inside', withoutEnlargement: true });
  }

  // Determine target modern format: AVIF if uploaded as avif, otherwise convert to WebP
  const isAvifInput = originalFilename.toLowerCase().endsWith('.avif') || String(metadata.format) === 'avif';
  const targetFormat = isAvifInput ? 'avif' : 'webp';

  let optimizedBuffer: Buffer;
  if (targetFormat === 'avif') {
    optimizedBuffer = await pipeline.avif({ quality: 82, effort: 4 }).toBuffer();
  } else {
    // Automatically convert JPG, JPEG, PNG, GIF, WebP into modern optimized WebP
    optimizedBuffer = await pipeline.webp({ quality: 84, effort: 4 }).toBuffer();
  }

  const normalizedBuffer = optimizedBuffer;
  const optimizedMeta = await sharp(optimizedBuffer).metadata();
  const baseWidth = optimizedMeta.width || metadata.width;
  const baseHeight = optimizedMeta.height || metadata.height;

  // Generate unique content hash
  const hash = crypto.createHash('sha256').update(optimizedBuffer).digest('hex').slice(0, 16);
  const mainFilename = `${hash}.${targetFormat}`;
  const baseDir = path.resolve(config.STORAGE_LOCAL_PATH);

  // Save the optimized modern WebP/AVIF file
  await fs.writeFile(path.join(baseDir, mainFilename), optimizedBuffer);

  const [stats, rawRgba] = await Promise.all([
    sharp(normalizedBuffer).stats(),
    sharp(normalizedBuffer).resize(32, 32, { fit: 'fill' }).ensureAlpha().raw().toBuffer(),
  ]);
  const dominantColor = `#${(
    (1 << 24) +
    (Math.round(stats.dominant.r) << 16) +
    (Math.round(stats.dominant.g) << 8) +
    Math.round(stats.dominant.b)
  )
    .toString(16)
    .slice(1)}`;

  const blurhash = encode(new Uint8ClampedArray(rawRgba), 32, 32, 4, 4);

  // Generate multi-format variants: AVIF, WebP, JPEG
  const variants: MediaVariant[] = [];
  const applicableWidths = TARGET_WIDTHS.filter((w) => w <= baseWidth);
  if (!applicableWidths.includes(baseWidth)) {
    applicableWidths.push(baseWidth);
  }

  const variantResults = await Promise.all(applicableWidths.flatMap((w) => [
    (async () => {
      const filename = `${hash}-${w}.avif`;
      const data = await sharp(normalizedBuffer).resize(w, undefined, { withoutEnlargement: true }).avif({ quality: 76, effort: 2 }).toBuffer();
      await fs.writeFile(path.join(baseDir, 'variants', filename), data);
      return { width: w, format: 'avif' as const, url: `/uploads/variants/${filename}` };
    })(),
    (async () => {
      const filename = `${hash}-${w}.webp`;
      const data = await sharp(normalizedBuffer).resize(w, undefined, { withoutEnlargement: true }).webp({ quality: 78, effort: 3 }).toBuffer();
      await fs.writeFile(path.join(baseDir, 'variants', filename), data);
      return { width: w, format: 'webp' as const, url: `/uploads/variants/${filename}` };
    })(),
    (async () => {
      const filename = `${hash}-${w}.jpg`;
      const data = await sharp(normalizedBuffer).resize(w, undefined, { withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
      await fs.writeFile(path.join(baseDir, 'variants', filename), data);
      return { width: w, format: 'jpeg' as const, url: `/uploads/variants/${filename}` };
    })(),
  ]));
  variants.push(...variantResults);

  return {
    filename: mainFilename,
    originalName: originalFilename,
    mimeType: targetFormat === 'avif' ? 'image/avif' : 'image/webp',
    sizeBytes: optimizedBuffer.length,
    width: baseWidth,
    height: baseHeight,
    blurhash,
    dominantColor,
    variants,
  };
}
