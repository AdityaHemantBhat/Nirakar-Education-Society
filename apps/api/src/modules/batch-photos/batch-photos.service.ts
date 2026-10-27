import sharp, { type Metadata, type Sharp } from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { AppError } from '../../middleware/error.js';
import { config } from '../../config/index.js';
import { broadcastBatchPhotoUpdate } from '../../lib/socket.js';
import {
  BatchPhotoCreateSchema,
  BatchPhotoUpdateSchema,
  BATCH_STREAM_LABELS,
  type BatchPhotoListResponse,
} from '@nirakar/shared';
import { batchPhotosRepository, BatchPhotosRepository } from './batch-photos.repository.js';

/**
 * The longest side a batch photograph is stored at.
 *
 * A class photograph is looked at on a phone as often as on a desktop, and
 * it is printed rarely, so a print-width image is plenty. Keeping it small
 * also keeps the archive quick on a slow connection.
 */
const MAX_WIDTH = 1600;

/**
 * The quality the photograph is stored at.
 *
 * WebP at this quality is indistinguishable from the original at this
 * size, and takes a fraction of the space of a JPEG.
 */
const WEBP_QUALITY = 82;

/** The largest photograph the server will accept, before conversion. */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/**
 * Where the converted photographs are written.
 *
 * They sit in the uploads directory, which is served publicly, because the
 * archive is meant to be seen.
 */
function batchPhotoDir(): string {
  return path.resolve(config.STORAGE_LOCAL_PATH, 'batch');
}

/**
 * Saves both the web display WebP and the original HD photograph.
 *
 * For web browsing and fast loading across gallery pages, a balanced
 * WebP version is used. For download, the full-fidelity original photograph
 * is preserved in its original upload quality.
 */
export async function convertToWebP(
  buffer: Buffer,
  originalName: string,
): Promise<{
  filename: string;
  url: string;
  hdUrl: string;
  originalFilename: string;
  sizeBytes: number;
  width: number;
  height: number;
  originalFormat: string;
}> {
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new AppError('FILE_TOO_LARGE', 'That photograph is larger than 25 MB.', 413);
  }

  await fs.mkdir(batchPhotoDir(), { recursive: true });

  let image: Sharp;
  try {
    image = sharp(buffer, { failOn: 'none' });
  } catch {
    throw new AppError('INVALID_IMAGE', 'That file could not be read as a photograph.', 400);
  }

  let metadata: Metadata;
  try {
    metadata = await image.metadata();
  } catch {
    throw new AppError('INVALID_IMAGE', 'That file could not be read as a photograph.', 400);
  }

  if (!metadata.width || !metadata.height) {
    throw new AppError('INVALID_IMAGE', 'That file could not be read as a photograph.', 400);
  }

  // Determine original extension
  const parsedExt = path.extname(originalName).replace('.', '').toLowerCase();
  const originalExt = parsedExt || metadata.format || 'jpg';

  const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  const hdFilename = `batch-${hash}-hd.${originalExt}`;
  const hdPath = path.join(batchPhotoDir(), hdFilename);

  // Save the full original HD buffer
  await fs.writeFile(hdPath, buffer);

  /* Web display copy: straightened and optimized WebP */
  let pipeline = image.rotate();
  if (metadata.width > MAX_WIDTH || metadata.height > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, MAX_WIDTH, { fit: 'inside', withoutEnlargement: true });
  }

  let webp: Buffer;
  try {
    webp = await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();
  } catch (err) {
    throw new AppError(
      'INVALID_IMAGE',
      'That file could not be converted to a photograph. Try a JPEG or PNG.',
      400,
    );
  }

  const convertedMeta = await sharp(webp).metadata();
  const webpFilename = `batch-${hash}.webp`;
  await fs.writeFile(path.join(batchPhotoDir(), webpFilename), webp);

  return {
    filename: webpFilename,
    url: `/uploads/batch/${webpFilename}`,
    hdUrl: `/uploads/batch/${hdFilename}`,
    originalFilename: hdFilename,
    sizeBytes: buffer.length,
    width: metadata.width,
    height: metadata.height,
    originalFormat: originalExt,
  };
}

export class BatchPhotosService {
  /** The archive, as the public site reads it. */
  async listPublic(raw: unknown): Promise<BatchPhotoListResponse> {
    const query = BatchPhotosRepository.parseQuery(raw);
    return batchPhotosRepository.list(query);
  }

  /** The archive, as the console reads it. */
  async listAdmin(raw: unknown): Promise<BatchPhotoListResponse> {
    return this.listPublic(raw);
  }

  /** How the archive is spread out. */
  async stats() {
    return batchPhotosRepository.stats();
  }

  async getById(id: string) {
    const photo = await batchPhotosRepository.findById(id);
    if (!photo) {
      throw new AppError('NOT_FOUND', 'That photograph is no longer in the archive.', 404);
    }
    return photo;
  }

  /**
   * Resolves the full quality HD file path for download.
   * If an original HD copy was stored, it is returned; otherwise the high-res WebP.
   */
  async getDownloadFile(id: string): Promise<{ filePath: string; downloadFilename: string }> {
    const photo = await this.getById(id);
    const photoDir = batchPhotoDir();

    // photo.photoUrl is like /uploads/batch/batch-123456.webp
    const baseName = path.basename(photo.photoUrl); // batch-123456.webp
    const nameWithoutExt = baseName.replace(/\.[^/.]+$/, ''); // batch-123456

    // Check if HD original exists (e.g., batch-123456-hd.jpg, .png, etc.)
    try {
      const files = await fs.readdir(photoDir);
      const hdMatch = files.find((f) => f.startsWith(`${nameWithoutExt}-hd.`));
      if (hdMatch) {
        const ext = path.extname(hdMatch);
        const safeTitle = photo.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        return {
          filePath: path.join(photoDir, hdMatch),
          downloadFilename: `${safeTitle}-${photo.batchYear}-HD${ext}`,
        };
      }
    } catch {
      // Fallback
    }

    const defaultExt = path.extname(baseName) || '.webp';
    const safeTitle = photo.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    return {
      filePath: path.join(photoDir, baseName),
      downloadFilename: `${safeTitle}-${photo.batchYear}${defaultExt}`,
    };
  }

  /**
   * Puts a photograph into the archive.
   *
   * The photograph itself has already been converted by the time it gets
   * here; this records the facts about it — which campus, which year, which
   * stream — and makes sure the archive does not end up with the same
   * photograph filed under the same campus twice.
   */
  async create(input: unknown) {
    const data = BatchPhotoCreateSchema.parse(input);

    const duplicate = await batchPhotosRepository.findByTitle(
      data.title,
      data.institutionCode,
    );
    if (duplicate) {
      throw new AppError(
        'DUPLICATE',
        'A photograph with that title is already filed under this campus.',
        409,
      );
    }

    const created = await batchPhotosRepository.create({
      institutionCode: data.institutionCode,
      batchYear: data.batchYear,
      title: data.title,
      photoUrl: data.photoUrl,
      caption: data.caption || null,
      stream: data.stream,
      batchSession: data.batchSession,
      classLevel: data.classLevel,
      division: data.division || null,
      fileSizeBytes: data.fileSizeBytes,
      imageFormat: data.imageFormat,
    });

    broadcastBatchPhotoUpdate('created', created.id);
    return created;
  }

  /** Amends a photograph that is already in the archive. */
  async update(id: string, input: unknown) {
    await this.getById(id);
    const data = BatchPhotoUpdateSchema.parse(input);

    const updated = await batchPhotosRepository.update(id, {
      ...data,
      caption: data.caption === '' ? null : data.caption,
      division: data.division === '' ? null : data.division,
    });

    broadcastBatchPhotoUpdate('updated', id);
    return updated;
  }

  /**
   * Takes a photograph out of the archive.
   *
   * The file on disk is left alone, because it may be the only copy of a
   * photograph that has been in the archive for decades.
   */
  async remove(id: string) {
    await this.getById(id);
    const removed = await batchPhotosRepository.remove(id);
    broadcastBatchPhotoUpdate('deleted', id);
    return removed;
  }
}

export const batchPhotosService = new BatchPhotosService();
export { BATCH_STREAM_LABELS };
