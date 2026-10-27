import { prisma, InstitutionCode, Prisma } from '@nirakar/db';
import { contentSlug } from '@nirakar/shared';
import { config } from '../../config/index.js';
import { eventDateSortValue, matchesEventDateFilter } from '../../lib/event-dates.js';

export class CommitteeRosterConflictError extends Error {
  constructor() {
    super('The submitted member order does not match this committee roster. Refresh and try again.');
    this.name = 'CommitteeRosterConflictError';
  }
}

export class ContentRepository {
  async getAdminInstitutions() {
    return prisma.institution.findMany({
      orderBy: { code: 'asc' },
      include: {
        committees: {
          orderBy: { order: 'asc' },
          include: { members: { orderBy: { order: 'asc' } } },
        },
      },
    });
  }

  async updateInstitution(id: string, data: {
    tagline: string;
    history: string | null;
    vision: string | null;
    bannerUrl: string | null;
    profile: Prisma.InputJsonValue;
  }) {
    return prisma.institution.update({ where: { id }, data });
  }

  async createCommittee(data: { institutionId: string; name: string; slug: string; description: string | null; order: number }) {
    return prisma.committee.create({ data, include: { members: true } });
  }

  async getCommittee(id: string) {
    return prisma.committee.findUnique({ where: { id }, select: { id: true, institution: { select: { id: true, code: true, slug: true } } } });
  }

  async getInstitution(id: string) {
    return prisma.institution.findUnique({ where: { id }, select: { id: true, code: true, slug: true } });
  }

  async updateCommittee(id: string, data: { name: string; slug: string; description: string | null; order: number }) {
    return prisma.committee.update({ where: { id }, data });
  }

  async deleteCommittee(id: string) {
    return prisma.committee.delete({ where: { id } });
  }

  async createCommitteeMember(committeeId: string, data: { name: string; designation: string; role: string; photoUrl: string | null; order: number }) {
    return prisma.committeeMember.create({ data: { ...data, committeeId } });
  }

  async updateCommitteeMember(id: string, data: { name: string; designation: string; role: string; photoUrl: string | null; order: number }) {
    return prisma.committeeMember.update({ where: { id }, data });
  }

  async getCommitteeMember(id: string) {
    return prisma.committeeMember.findUnique({
      where: { id },
      select: { id: true, committee: { select: { institution: { select: { id: true, code: true, slug: true } } } } },
    });
  }

  async deleteCommitteeMember(id: string) {
    return prisma.committeeMember.delete({ where: { id } });
  }

  async reorderCommitteeMembers(committeeId: string, orderedIds: string[]) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.committeeMember.findMany({ where: { committeeId }, select: { id: true } });
      const existingIds = new Set(existing.map(({ id }) => id));
      if (existingIds.size !== orderedIds.length || orderedIds.some((id) => !existingIds.has(id))) {
        throw new CommitteeRosterConflictError();
      }
      for (const [order, id] of orderedIds.entries()) {
        await tx.committeeMember.update({ where: { id }, data: { order } });
      }
      return tx.committeeMember.findMany({ where: { committeeId }, orderBy: { order: 'asc' } });
    });
  }

  async getInstitutions() {
    return prisma.institution.findMany({
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        slug: true,
        tagline: true,
        history: true,
        vision: true,
        bannerUrl: true,
        profile: true,
      },
    });
  }

  async getInstitutionBySlug(slug: string) {
    return prisma.institution.findUnique({
      where: { slug },
      select: {
        id: true,
        code: true,
        name: true,
        slug: true,
        tagline: true,
        history: true,
        vision: true,
        bannerUrl: true,
        profile: true,
        facultyProfiles: {
          where: { status: 'PUBLISHED' },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            designation: true,
            department: true,
            subjects: true,
            qualification: true,
            experience: true,
            photoUrl: true,
          },
        },
        committees: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            members: {
              orderBy: { order: 'asc' },
              select: { id: true, name: true, designation: true, role: true, photoUrl: true },
            },
          },
        },
      },
    });
  }

  async getNotices(institutionCode?: InstitutionCode, limit = 100) {
    return prisma.notice.findMany({
      where: institutionCode ? { institutionCode } : {},
      orderBy: [{ pinned: 'desc' }, { date: 'desc' }],
      take: limit,
      select: {
        id: true,
        institutionCode: true,
        title: true,
        content: true,
        date: true,
        pinned: true,
        pdfUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getNoticeById(idOrSlug: string) {
    const direct = await prisma.notice.findUnique({
      where: { id: idOrSlug },
    });
    if (direct) return direct;

    /* The public site addresses a circular by its title's slug, so the
       lookup uses the very same rule the links were built with. */
    const all = await prisma.notice.findMany({ take: 200 });
    const matched = all.find((n) => contentSlug(n.title) === idOrSlug);
    return matched || null;
  }

  async createNotice(data: {
    title: string;
    content?: string | null;
    date: string;
    pinned?: boolean;
    pdfUrl?: string | null;
    institutionCode?: InstitutionCode | null;
  }) {
    return prisma.notice.create({
      data: {
        title: data.title,
        content: data.content || null,
        date: data.date,
        pinned: data.pinned ?? false,
        pdfUrl: data.pdfUrl || null,
        institutionCode: data.institutionCode || null,
      },
    });
  }

  async updateNotice(id: string, data: Partial<{
    title: string;
    content?: string | null;
    date: string;
    pinned?: boolean;
    pdfUrl?: string | null;
    institutionCode?: InstitutionCode | null;
  }>) {
    return prisma.notice.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.date !== undefined ? { date: data.date } : {}),
        ...(data.pinned !== undefined ? { pinned: data.pinned } : {}),
        ...(data.pdfUrl !== undefined ? { pdfUrl: data.pdfUrl } : {}),
        ...(data.institutionCode !== undefined ? { institutionCode: data.institutionCode } : {}),
      },
    });
  }

  async deleteNotice(id: string) {
    return prisma.notice.delete({
      where: { id },
    });
  }

  async getEvents(filter: 'all' | 'today' | 'upcoming' | 'past' = 'all', institutionCode?: InstitutionCode, limit = 100) {
    const rows = await (prisma.event as any).findMany({
      where: institutionCode ? { institutionCode } : {},
      orderBy: { startDate: 'asc' },
      take: limit,
      select: {
        id: true,
        institutionCode: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        isUpcoming: true,
        coverUrl: true,
        pdfUrl: true,
        photos: true,
        documents: true,
        videoUrl: true,
        createdAt: true,
      },
    });

    const visible = rows.filter((row: any) =>
      matchesEventDateFilter(row.startDate, row.endDate, filter, config.APP_TIMEZONE),
    );

    return visible.sort((a: any, b: any) => {
      const aTime = eventDateSortValue(a.startDate, config.APP_TIMEZONE);
      const bTime = eventDateSortValue(b.startDate, config.APP_TIMEZONE);
      return filter === 'past' ? bTime.localeCompare(aTime) : aTime.localeCompare(bTime);
    });
  }

  async getEventById(idOrSlug: string) {
    const direct = await prisma.event.findUnique({
      where: { id: idOrSlug },
    });
    if (direct) return direct;

    /* The public site addresses a gathering by its title's slug, so the
       lookup uses the very same rule the links were built with. */
    const all = await prisma.event.findMany({ take: 200 });
    const matched = all.find((e) => contentSlug(e.title) === idOrSlug);
    return matched || null;
  }

  async createEvent(data: {
    title: string;
    description?: string | null;
    startDate: string;
    endDate?: string | null;
    location?: string | null;
    isUpcoming?: boolean;
    coverUrl?: string | null;
    pdfUrl?: string | null;
    photos?: any;
    documents?: any;
    videoUrl?: string | null;
    institutionCode?: InstitutionCode | null;
  }) {
    return (prisma.event as any).create({
      data: {
        title: data.title,
        description: data.description || null,
        startDate: data.startDate,
        endDate: data.endDate || null,
        location: data.location || null,
        isUpcoming: data.isUpcoming ?? true,
        coverUrl: data.coverUrl || null,
        pdfUrl: data.pdfUrl || null,
        photos: data.photos || [],
        documents: data.documents || [],
        videoUrl: data.videoUrl || null,
        institutionCode: data.institutionCode || null,
      },
    });
  }

  async updateEvent(id: string, data: Partial<{
    title: string;
    description?: string | null;
    startDate: string;
    endDate?: string | null;
    location?: string | null;
    isUpcoming?: boolean;
    coverUrl?: string | null;
    pdfUrl?: string | null;
    photos?: any;
    documents?: any;
    videoUrl?: string | null;
    institutionCode?: InstitutionCode | null;
  }>) {
    return (prisma.event as any).update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
        ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
        ...(data.isUpcoming !== undefined ? { isUpcoming: data.isUpcoming } : {}),
        ...(data.coverUrl !== undefined ? { coverUrl: data.coverUrl } : {}),
        ...(data.pdfUrl !== undefined ? { pdfUrl: data.pdfUrl } : {}),
        ...(data.photos !== undefined ? { photos: data.photos } : {}),
        ...(data.documents !== undefined ? { documents: data.documents } : {}),
        ...(data.videoUrl !== undefined ? { videoUrl: data.videoUrl } : {}),
        ...(data.institutionCode !== undefined ? { institutionCode: data.institutionCode } : {}),
      },
    });
  }

  async deleteEvent(id: string) {
    return prisma.event.delete({
      where: { id },
    });
  }

  async getActivities(institutionCode?: InstitutionCode, limit = 20) {
    return prisma.activity.findMany({
      where: institutionCode ? { institutionCode } : {},
      orderBy: { date: 'desc' },
      take: limit,
      select: {
        id: true,
        institutionCode: true,
        title: true,
        description: true,
        category: true,
        date: true,
        photos: true,
      },
    });
  }

  async getGalleries(institutionCode?: InstitutionCode) {
    return prisma.galleryAlbum.findMany({
      where: institutionCode ? { institutionCode } : {},
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        institutionCode: true,
        title: true,
        description: true,
        category: true,
        coverUrl: true,
        createdAt: true,
        items: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, mediaUrl: true, caption: true, order: true },
        },
      },
    });
  }

  async createGalleryAlbum(data: {
    institutionCode?: InstitutionCode;
    title: string;
    description?: string;
    category?: string;
    coverUrl?: string;
    items?: Array<{ title: string; mediaUrl: string; caption?: string; order?: number }>;
  }) {
    return prisma.galleryAlbum.create({
      data: {
        institutionCode: data.institutionCode,
        title: data.title,
        description: data.description,
        category: data.category || 'Campus',
        coverUrl: data.coverUrl,
        items: data.items && data.items.length > 0 ? {
          create: data.items.map((item, idx) => ({
            title: item.title || data.title,
            mediaUrl: item.mediaUrl,
            caption: item.caption,
            order: item.order ?? idx,
          })),
        } : undefined,
      },
      include: {
        items: true,
      },
    });
  }

  async updateGalleryAlbum(id: string, data: {
    institutionCode?: InstitutionCode;
    title?: string;
    description?: string;
    category?: string;
    coverUrl?: string;
    items?: Array<{ id?: string; title: string; mediaUrl: string; caption?: string; order?: number }>;
  }) {
    // If items are provided, delete existing and re-create to keep in sync
    if (data.items) {
      await prisma.galleryItem.deleteMany({ where: { albumId: id } });
    }

    return prisma.galleryAlbum.update({
      where: { id },
      data: {
        institutionCode: data.institutionCode,
        title: data.title,
        description: data.description,
        category: data.category,
        coverUrl: data.coverUrl,
        items: data.items ? {
          create: data.items.map((item, idx) => ({
            title: item.title || data.title || '',
            mediaUrl: item.mediaUrl,
            caption: item.caption,
            order: item.order ?? idx,
          })),
        } : undefined,
      },
      include: {
        items: true,
      },
    });
  }

  async deleteGalleryAlbum(id: string) {
    return prisma.galleryAlbum.delete({
      where: { id },
    });
  }

  async getBlogs(limit = 20) {
    return prisma.blog.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        authorName: true,
        authorRole: true,
        school: true,
        title: true,
        body: true,
        coverUrl: true,
        createdAt: true,
      },
    });
  }

  async createBlog(data: any) {
    return prisma.blog.create({
      data,
      select: { id: true, title: true, authorName: true },
    });
  }

  async getComments(targetType = 'GENERAL', targetId?: string) {
    return prisma.comment.findMany({
      where: {
        status: 'APPROVED',
        targetType,
        ...(targetId ? { targetId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        authorName: true,
        place: true,
        content: true,
        createdAt: true,
      },
    });
  }

  async getAdminComments(targetType?: string) {
    return prisma.comment.findMany({
      where: targetType ? { targetType } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        authorName: true,
        email: true,
        place: true,
        content: true,
        targetType: true,
        targetId: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async getCommentById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
      select: { id: true, targetType: true, targetId: true, authorName: true },
    });
  }

  async deleteComment(id: string) {
    return prisma.comment.delete({ where: { id }, select: { id: true } });
  }

  async createComment(data: any) {
    return prisma.comment.create({
      data: {
        authorName: data.authorName,
        email: data.email || null,
        place: data.place || null,
        content: data.content,
        targetType: data.targetType,
        targetId: data.targetId || null,
        status: 'APPROVED',
      },
      select: { id: true, authorName: true, place: true, content: true, createdAt: true },
    });
  }

  async saveContactMessage(data: any) {
    return prisma.contactMessage.create({
      data,
      select: { id: true, createdAt: true },
    });
  }

  async getPageBySlug(slug: string) {
    return prisma.page.findUnique({
      where: { slug, published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        metaDescription: true,
        sections: {
          where: { visible: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            type: true,
            order: true,
            title: true,
            subtitle: true,
            content: true,
          },
        },
      },
    });
  }

  async upsertPage(data: { slug: string; title: string; metaDescription?: string; published?: boolean; sections: any[] }) {
    return prisma.$transaction(async (tx) => {
      const page = await tx.page.upsert({
        where: { slug: data.slug },
        update: {
          title: data.title,
          metaDescription: data.metaDescription,
          published: data.published ?? true,
        },
        create: {
          slug: data.slug,
          title: data.title,
          metaDescription: data.metaDescription,
          published: data.published ?? true,
        },
      });

      await tx.pageSection.deleteMany({ where: { pageId: page.id } });

      for (let i = 0; i < data.sections.length; i++) {
        const s = data.sections[i];
        await tx.pageSection.create({
          data: {
            pageId: page.id,
            type: s.type,
            order: s.order ?? i,
            title: s.title || null,
            subtitle: s.subtitle || null,
            content: s.content || {},
            visible: s.visible ?? true,
          },
        });
      }

      return page;
    });
  }

  async getStats() {
    return prisma.stat.findMany({
      orderBy: { order: 'asc' },
      select: {
        key: true,
        label: true,
        value: true,
        prefix: true,
        suffix: true,
        icon: true,
      },
    });
  }

  async saveMediaRecord(data: any) {
    try {
      const record = await prisma.media.upsert({
        where: { filename: data.filename },
        update: {
          originalName: data.originalName,
          mimeType: data.mimeType,
          sizeBytes: data.sizeBytes,
          variants: data.variants,
          blurhash: data.blurhash,
          dominantColor: data.dominantColor,
          width: data.width,
          height: data.height,
          altText: data.altText,
        },
        create: data,
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          variants: true,
          blurhash: true,
          dominantColor: true,
          width: true,
          height: true,
        },
      });
      return {
        ...record,
        url: `/uploads/${record.filename}`,
      };
    } catch (err: any) {
      // Fallback: If any concurrent duplicate constraint occurs, fetch and return the existing record
      const existing = await prisma.media.findUnique({
        where: { filename: data.filename },
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          variants: true,
          blurhash: true,
          dominantColor: true,
          width: true,
          height: true,
        },
      });
      if (existing) {
        return {
          ...existing,
          url: `/uploads/${existing.filename}`,
        };
      }
      throw err;
    }
  }

  async listMedia(limit = 50) {
    return prisma.media.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        variants: true,
        blurhash: true,
        dominantColor: true,
        altText: true,
        createdAt: true,
      },
    });
  }

  async getHeroSlides() {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'home.hero_slides' },
    });
    if (!setting || !setting.value) return null;
    try {
      return JSON.parse(setting.value);
    } catch {
      return null;
    }
  }

  async saveHeroSlides(slides: any[]) {
    const value = JSON.stringify(slides);
    return prisma.siteSetting.upsert({
      where: { key: 'home.hero_slides' },
      create: { key: 'home.hero_slides', value, type: 'JSON' },
      update: { value },
    });
  }
}
