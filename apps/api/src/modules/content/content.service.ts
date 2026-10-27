import { CommitteeRosterConflictError, ContentRepository } from './content.repository.js';
import { AppError } from '../../middleware/error.js';
import { processMediaUpload } from '../../lib/media.js';
import { memoryCache } from '../../lib/cache.js';
import { broadcastNoticeUpdate, broadcastEventUpdate, broadcastInstitutionUpdate } from '../../lib/socket.js';
import {
  contentSlug,
  noticeCategoryFromTitle,
  noticeRefNo,
  campusLabel,
  decodeNoticeMeta,
  eventCategoryFromTitle,
  eventTimeRange,
  CAMPUS_NAMES,
  SCHOOLS,
} from '@nirakar/shared';

export class ContentService {
  constructor(private repo = new ContentRepository()) {}

  /**
   * A circular, as the public site reads it.
   *
   * The record from the registry is passed through untouched, and the
   * handful of things the site would otherwise have to guess for itself —
   * the web address, the kind of circular, the reference number, the
   * campus — are worked out here, once, on the server.
   */
  private decorateNotice(row: any) {
    if (!row) return row;
    const decoded = decodeNoticeMeta(row.content);
    const institutionCode = row.institutionCode ?? null;

    return {
      ...row,
      slug: contentSlug(row.title),
      category: noticeCategoryFromTitle(row.title),
      refNo: noticeRefNo(decoded.refNo || row.refNo, institutionCode, row.id),
      urgent: row.urgent !== undefined ? Boolean(row.urgent) : decoded.urgent,
      target: campusLabel(institutionCode),
    };
  }

  /**
   * A gathering, as the public site reads it.
   *
   * As with circulars, the record is passed through untouched and the
   * derived details are added alongside it.
   */
  private decorateEvent(row: any) {
    if (!row) return row;
    const institutionCode = row.institutionCode ?? null;

    return {
      ...row,
      slug: contentSlug(row.title),
      category: eventCategoryFromTitle(row.title),
      campus:
        row.campus ??
        (institutionCode
          ? CAMPUS_NAMES[institutionCode as keyof typeof CAMPUS_NAMES]
          : 'Society Central') ??
        'Society Central',
      time: eventTimeRange(row.startDate, row.endDate),
    };
  }

  async getAdminInstitutions() {
    return this.repo.getAdminInstitutions();
  }

  async updateInstitution(id: string, input: any) {
    if (!(await this.repo.getInstitution(id))) throw new AppError('NOT_FOUND', 'Institution not found.', 404);
    if (!input || typeof input.tagline !== 'string' || !input.tagline.trim()) {
      throw new AppError('BAD_REQUEST', 'A tagline is required.', 400);
    }
    if (!input.profile || typeof input.profile !== 'object' || Array.isArray(input.profile)) {
      throw new AppError('BAD_REQUEST', 'A profile object is required.', 400);
    }
    const updated = await this.repo.updateInstitution(id, {
      tagline: input.tagline.trim(),
      history: typeof input.history === 'string' ? input.history : null,
      vision: typeof input.vision === 'string' ? input.vision : null,
      bannerUrl: typeof input.bannerUrl === 'string' && input.bannerUrl.trim() ? input.bannerUrl.trim() : null,
      profile: input.profile as import('@nirakar/db').Prisma.InputJsonValue,
    });
    broadcastInstitutionUpdate({ action: 'updated', id: updated.id, code: updated.code, slug: updated.slug });
    return updated;
  }

  private emitInstitutionUpdate(institution: { id: string; code: string; slug: string }) {
    broadcastInstitutionUpdate({ action: 'committee_updated', ...institution });
  }

  async createCommittee(institutionId: string, input: any) {
    const institution = await this.repo.getInstitution(institutionId);
    if (!institution) throw new AppError('NOT_FOUND', 'Institution not found.', 404);
    if (!input || typeof input.name !== 'string' || !input.name.trim()) throw new AppError('BAD_REQUEST', 'Committee name is required.', 400);
    const slug = typeof input.slug === 'string' && input.slug.trim()
      ? input.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) throw new AppError('BAD_REQUEST', 'Committee slug is required.', 400);
    const created = await this.repo.createCommittee({ institutionId, name: input.name.trim(), slug, description: input.description || null, order: Number.isInteger(input.order) ? input.order : 0 });
    this.emitInstitutionUpdate(institution);
    return created;
  }

  async updateCommittee(id: string, input: any) {
    const committee = await this.repo.getCommittee(id);
    if (!committee) throw new AppError('NOT_FOUND', 'Committee not found.', 404);
    if (!input || typeof input.name !== 'string' || !input.name.trim() || typeof input.slug !== 'string' || !input.slug.trim()) {
      throw new AppError('BAD_REQUEST', 'Committee name and slug are required.', 400);
    }
    const updated = await this.repo.updateCommittee(id, { name: input.name.trim(), slug: input.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), description: input.description || null, order: Number.isInteger(input.order) ? input.order : 0 });
    if (committee.institution) this.emitInstitutionUpdate(committee.institution);
    return updated;
  }

  async deleteCommittee(id: string) {
    const committee = await this.repo.getCommittee(id);
    if (!committee) throw new AppError('NOT_FOUND', 'Committee not found.', 404);
    await this.repo.deleteCommittee(id);
    if (committee.institution) this.emitInstitutionUpdate(committee.institution);
  }

  private validateCommitteeMember(input: any) {
    if (!input || typeof input.name !== 'string' || !input.name.trim() || typeof input.designation !== 'string' || !input.designation.trim()) {
      throw new AppError('BAD_REQUEST', 'A member name and designation are required.', 400);
    }
    return { name: input.name.trim(), designation: input.designation.trim(), role: typeof input.role === 'string' && input.role.trim() ? input.role.trim() : 'Member', photoUrl: typeof input.photoUrl === 'string' && input.photoUrl.trim() ? input.photoUrl.trim() : null, order: Number.isInteger(input.order) ? input.order : 0 };
  }

  async createCommitteeMember(committeeId: string, input: any) {
    const committee = await this.repo.getCommittee(committeeId);
    if (!committee) throw new AppError('NOT_FOUND', 'Committee not found.', 404);
    const created = await this.repo.createCommitteeMember(committeeId, this.validateCommitteeMember(input));
    if (committee.institution) this.emitInstitutionUpdate(committee.institution);
    return created;
  }

  async updateCommitteeMember(id: string, input: any) {
    const member = await this.repo.getCommitteeMember(id);
    if (!member) throw new AppError('NOT_FOUND', 'Committee member not found.', 404);
    const updated = await this.repo.updateCommitteeMember(id, this.validateCommitteeMember(input));
    if (member.committee.institution) this.emitInstitutionUpdate(member.committee.institution);
    return updated;
  }

  async deleteCommitteeMember(id: string) {
    const member = await this.repo.getCommitteeMember(id);
    if (!member) throw new AppError('NOT_FOUND', 'Committee member not found.', 404);
    await this.repo.deleteCommitteeMember(id);
    if (member.committee.institution) this.emitInstitutionUpdate(member.committee.institution);
  }

  async reorderCommitteeMembers(committeeId: string, memberIds: any) {
    const committee = await this.repo.getCommittee(committeeId);
    if (!committee) throw new AppError('NOT_FOUND', 'Committee not found.', 404);
    if (!Array.isArray(memberIds) || memberIds.some((id) => typeof id !== 'string') || new Set(memberIds).size !== memberIds.length) {
      throw new AppError('BAD_REQUEST', 'A unique ordered memberIds array is required.', 400);
    }
    try {
      const reordered = await this.repo.reorderCommitteeMembers(committeeId, memberIds);
      if (committee.institution) this.emitInstitutionUpdate(committee.institution);
      return reordered;
    } catch (error) {
      if (error instanceof CommitteeRosterConflictError) throw new AppError('CONFLICT', error.message, 409);
      throw error;
    }
  }

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
    const rows = await this.repo.getNotices(institutionCode);
    return rows.map((row) => this.decorateNotice(row));
  }

  async getNotice(id: string) {
    const notice = await this.repo.getNoticeById(id);
    if (!notice) throw new AppError('NOT_FOUND', 'Notice not found', 404);
    return this.decorateNotice(notice);
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
    broadcastNoticeUpdate('created', this.decorateNotice(notice));
    return this.decorateNotice(notice);
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
    const decorated = this.decorateNotice(updated);
    broadcastNoticeUpdate('updated', decorated);
    return decorated;
  }

  async deleteNotice(id: string) {
    const existing = await this.repo.getNoticeById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Notice not found', 404);
    await this.repo.deleteNotice(id);
    memoryCache.invalidate('home_aggregate');
    broadcastNoticeUpdate('deleted', { id });
    return { success: true };
  }

  async getEvents(filter: 'all' | 'today' | 'upcoming' | 'past' = 'all', institutionCode?: any) {
    const rows = await this.repo.getEvents(filter, institutionCode);
    return rows.map((row: any) => this.decorateEvent(row));
  }

  async getEvent(id: string) {
    const event = await this.repo.getEventById(id);
    if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
    return this.decorateEvent(event);
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
    const decorated = this.decorateEvent(event);
    broadcastEventUpdate('created', decorated);
    return decorated;
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
    const decorated = this.decorateEvent(updated);
    broadcastEventUpdate('updated', decorated);
    return decorated;
  }

  async deleteEvent(id: string) {
    const existing = await this.repo.getEventById(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Event not found', 404);
    await this.repo.deleteEvent(id);
    memoryCache.invalidate('home_aggregate');
    broadcastEventUpdate('deleted', { id });
    return { success: true };
  }

  async getActivities(institutionCode?: any) {
    return this.repo.getActivities(institutionCode);
  }

  async getGalleries(institutionCode?: any) {
    return this.repo.getGalleries(institutionCode);
  }

  async createGalleryAlbum(data: any) {
    return this.repo.createGalleryAlbum(data);
  }

  async updateGalleryAlbum(id: string, data: any) {
    return this.repo.updateGalleryAlbum(id, data);
  }

  async deleteGalleryAlbum(id: string) {
    return this.repo.deleteGalleryAlbum(id);
  }

  async getBlogs() {
    return this.repo.getBlogs();
  }

  async createBlog(data: any) {
    return this.repo.createBlog(data);
  }

  async getComments(targetType?: string, targetId?: string) {
    if (targetType === 'EVENT' && targetId) {
      const event = await this.repo.getEventById(targetId);
      if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
      return this.repo.getComments('EVENT', event.id);
    }
    return this.repo.getComments(targetType, targetId);
  }

  async getAdminComments(targetType?: string) {
    return this.repo.getAdminComments(targetType);
  }

  async deleteComment(id: string) {
    const comment = await this.repo.getCommentById(id);
    if (!comment) throw new AppError('NOT_FOUND', 'Comment not found', 404);
    await this.repo.deleteComment(id);
    return { success: true, id: comment.id, targetType: comment.targetType, targetId: comment.targetId };
  }

  async createComment(data: any) {
    if (data.targetType === 'EVENT') {
      const event = await this.repo.getEventById(data.targetId);
      if (!event) throw new AppError('NOT_FOUND', 'Event not found', 404);
      return this.repo.createComment({ ...data, targetId: event.id, captchaToken: undefined });
    }
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

  async getHeroSlides() {
    const slides = await this.repo.getHeroSlides();
    return Array.isArray(slides) ? slides : [];
  }

  async saveHeroSlides(slides: any[]) {
    const cleaned = slides.map((s, idx) => ({
      id: s.id || `slide-${Date.now()}-${idx}`,
      title: s.title || '',
      campus: s.campus || '',
      tag: s.tag || '',
      image: s.image || '',
    }));
    await this.repo.saveHeroSlides(cleaned);
    memoryCache.invalidate('home_aggregate');
    return cleaned;
  }
}
