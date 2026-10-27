import { AppError } from '../../middleware/error.js';
import { processImageUpload, processVideoUpload } from '../../lib/media.js';
import { CommunityPostsRepository } from './community-posts.repository.js';

export class CommunityPostsService {
  constructor(private repo = new CommunityPostsRepository()) {}

  async list(cursor?: string, limit = 15) {
    return this.repo.list(cursor, limit);
  }

  async create(authorId: string, data: { title?: string; body: string; mediaIds: string[] }) {
    try {
      return await this.repo.create(authorId, { title: data.title || '', body: data.body, mediaIds: data.mediaIds });
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: string, authorId: string, data: { title?: string; body?: string; mediaIds?: string[] }) {
    if (!(await this.repo.findOwned(id, authorId))) throw new AppError('NOT_FOUND', 'Post not found.', 404);
    try {
      return await this.repo.update(id, authorId, data);
    } catch (error: any) {
      if (error?.message === 'Post not found.') throw new AppError('NOT_FOUND', 'Post not found.', 404);
      throw error;
    }
  }

  async delete(id: string, authorId: string) {
    const result = await this.repo.delete(id, authorId);
    if (!result.count) throw new AppError('NOT_FOUND', 'Post not found.', 404);
  }

  async upload(authorId: string, buffer: Buffer, filename: string, mimeType: string) {
    if (buffer.length > 50 * 1024 * 1024) throw new AppError('BAD_REQUEST', 'Media uploads are limited to 50 MB.', 413);
    const ext = filename.toLowerCase().split('.').pop() || '';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'heic', 'gif'];
    const videoExtensions = ['mp4', 'webm', 'mov'];
    if ((mimeType.startsWith('image/') && !imageExtensions.includes(ext)) || (mimeType.startsWith('video/') && !videoExtensions.includes(ext)) || (!mimeType.startsWith('image/') && !mimeType.startsWith('video/'))) {
      throw new AppError('BAD_REQUEST', 'Unsupported image or video format.', 400);
    }
    let processed;
    try {
      processed = mimeType.startsWith('video/')
        ? await processVideoUpload(buffer, filename, mimeType)
        : await processImageUpload(buffer, filename);
    } catch (error: any) {
      throw new AppError('BAD_REQUEST', error.message || 'Media processing failed.', 400);
    }
    const media = await this.repo.createMedia(authorId, {
      filename: processed.filename,
      originalName: processed.originalName,
      mimeType: processed.mimeType,
      sizeBytes: processed.sizeBytes,
      width: processed.width,
      height: processed.height,
      blurhash: processed.blurhash,
      dominantColor: processed.dominantColor,
      variants: processed.variants,
    });
    const firstUrl = processed.variants.find((variant) => variant.url)?.url || `/uploads/${processed.filename}`;
    return { id: media.id, url: firstUrl, mediaType: media.mimeType.startsWith('video/') ? 'VIDEO' : 'IMAGE', mimeType: media.mimeType };
  }
}
