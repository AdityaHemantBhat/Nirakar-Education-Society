import { ContentRepository } from './content.repository.js';
import { AppError } from '../../middleware/error.js';
import { processMediaUpload } from '../../lib/media.js';
import { memoryCache } from '../../lib/cache.js';

export class ContentService {
  constructor(private repo = new ContentRepository()) {}

  async getInstitutions() {
    return this.repo.getInstitutions();
  }

  async getInstitutionDetails(slug: string) {
    const inst = await this.repo.getInstitutionBySlug(slug);
    if (!inst) {
      throw new AppError('NOT_FOUND', 'Institution not found', 404);
    }
    return inst;
  }

  async getNotices(institutionCode?: any) {
    return this.repo.getNotices(institutionCode);
  }

  async getNotice(id: string) {
    const notice = await this.repo.getNoticeById(id);
    if (!notice) throw new AppError('NOT_FOUND', 'Notice not found', 404);
    return notice;
  }

  async createNotice(data: any) {
    const notice = await this.repo.createNotice({
      title: data.title,
      content: data.content,
      date: data.date,
      pinned: data.pinned,
      pdfUrl: data.pdfUrl,
      institutionCode: data.institutionCode || data.school || null,
    });
    memoryCache.invalidate('home_aggregate');
    return notice;
  }

  async updateNotice(id: string, data: any) {
    const existing = await this.repo.getNoticeById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Notice not found', 404);
    const updated = await this.repo.updateNotice(id, {
      title: data.title,
      content: data.content,
      date: data.date,
      pinned: data.pinned,
      pdfUrl: data.pdfUrl,
      institutionCode: data.institutionCode !== undefined ? (data.institutionCode || data.school || null) : undefined,
    });
    memoryCache.invalidate('home_aggregate');
    return updated;
  }

  async deleteNotice(id: string) {
    const existing = await this.repo.getNoticeById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Notice not found', 404);
    await this.repo.deleteNotice(id);
    memoryCache.invalidate('home_aggregate');
    return { success: true };
  }

  async getEvents(upcoming?: boolean, institutionCode?: any) {
    return this.repo.getEvents(upcoming, institutionCode);
  }

  async getEvent(id: string) {
    const event = await this.repo.getEventById(id);
    if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
    return event;
  }

  async createEvent(data: any) {
    const event = await this.repo.createEvent({
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      isUpcoming: data.isUpcoming,
      coverUrl: data.coverUrl || (Array.isArray(data.photos) && data.photos[0]?.url ? data.photos[0].url : null),
      pdfUrl: data.pdfUrl || (Array.isArray(data.documents) && data.documents[0]?.url ? data.documents[0].url : null),
      photos: Array.isArray(data.photos) ? data.photos : [],
      documents: Array.isArray(data.documents) ? data.documents : [],
      videoUrl: data.videoUrl || null,
      institutionCode: data.institutionCode || data.school || null,
    });
    memoryCache.invalidate('home_aggregate');
    return event;
  }

  async updateEvent(id: string, data: any) {
    const existing = await this.repo.getEventById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Event not found', 404);
    const updated = await this.repo.updateEvent(id, {
      title: data.title,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      isUpcoming: data.isUpcoming,
      coverUrl: data.coverUrl !== undefined ? data.coverUrl : (Array.isArray(data.photos) && data.photos[0]?.url ? data.photos[0].url : undefined),
      pdfUrl: data.pdfUrl !== undefined ? data.pdfUrl : (Array.isArray(data.documents) && data.documents[0]?.url ? data.documents[0].url : undefined),
      photos: data.photos !== undefined ? data.photos : undefined,
      documents: data.documents !== undefined ? data.documents : undefined,
      videoUrl: data.videoUrl !== undefined ? data.videoUrl : undefined,
      institutionCode: data.institutionCode !== undefined ? (data.institutionCode || data.school || null) : undefined,
    });
    memoryCache.invalidate('home_aggregate');
    return updated;
  }

  async deleteEvent(id: string) {
    const existing = await this.repo.getEventById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Event not found', 404);
    await this.repo.deleteEvent(id);
    memoryCache.invalidate('home_aggregate');
    return { success: true };
  }

  async getActivities(institutionCode?: any) {
    return this.repo.getActivities(institutionCode);
  }

  async getGalleries(institutionCode?: any) {
    return this.repo.getGalleries(institutionCode);
  }

  async getBatchPhotos(school: any, batchYear?: number) {
    return this.repo.getBatchPhotos(school, batchYear);
  }

  async getBlogs() {
    return this.repo.getBlogs();
  }

  async createBlog(data: any) {
    return this.repo.createBlog(data);
  }

  async getComments(targetType?: string, targetId?: string) {
    return this.repo.getComments(targetType, targetId);
  }

  async createComment(data: any) {
    return this.repo.createComment(data);
  }

  async submitContact(data: any) {
    return this.repo.saveContactMessage(data);
  }

  async getPage(slug: string) {
    const cached = memoryCache.get(`page_${slug}`);
    if (cached) return cached;

    const page = await this.repo.getPageBySlug(slug);
    if (!page) {
      throw new AppError('NOT_FOUND', 'Page not found', 404);
    }

    memoryCache.set(`page_${slug}`, page, 120);
    return page;
  }

  async savePage(data: any) {
    const page = await this.repo.upsertPage(data);
    memoryCache.invalidate(`page_${data.slug}`);
    return page;
  }

  async getStats() {
    const cached = memoryCache.get('site_stats');
    if (cached) return cached;

    const stats = await this.repo.getStats();
    memoryCache.set('site_stats', stats, 300);
    return stats;
  }

  async uploadMedia(fileBuffer: Buffer, originalName: string, altText?: string, mimeType?: string) {
    const processed = await processMediaUpload(fileBuffer, originalName, mimeType);
    return this.repo.saveMediaRecord({
      filename: processed.filename,
      originalName: processed.originalName,
      mimeType: processed.mimeType,
      sizeBytes: processed.sizeBytes,
      width: processed.width,
      height: processed.height,
      blurhash: processed.blurhash,
      dominantColor: processed.dominantColor,
      variants: processed.variants as any,
      altText,
    });
  }

  async listMedia() {
    return this.repo.listMedia();
  }
}
