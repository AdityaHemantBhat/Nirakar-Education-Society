import { prisma, InstitutionCode } from '@nirakar/db';

export class ContentRepository {
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

    const all = await prisma.notice.findMany({ take: 200 });
    const matched = all.find(
      (n) => n.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === idOrSlug
    );
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

  async getEvents(upcoming?: boolean, institutionCode?: InstitutionCode, limit = 100) {
    return (prisma.event as any).findMany({
      where: {
        ...(upcoming !== undefined ? { isUpcoming: upcoming } : {}),
        ...(institutionCode ? { institutionCode } : {}),
      },
      orderBy: { startDate: upcoming ? 'asc' : 'desc' },
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
  }

  async getEventById(idOrSlug: string) {
    const direct = await prisma.event.findUnique({
      where: { id: idOrSlug },
    });
    if (direct) return direct;

    const all = await prisma.event.findMany({ take: 200 });
    const matched = all.find(
      (e) => e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === idOrSlug
    );
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
        items: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, mediaUrl: true, caption: true },
        },
      },
    });
  }

  async getBatchPhotos(school: InstitutionCode, batchYear?: number) {
    return prisma.batchPhoto.findMany({
      where: {
        institutionCode: school,
        ...(batchYear ? { batchYear } : {}),
      },
      orderBy: { batchYear: 'desc' },
      select: {
        id: true,
        institutionCode: true,
        batchYear: true,
        title: true,
        photoUrl: true,
        caption: true,
      },
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
        content: true,
        createdAt: true,
      },
    });
  }

  async createComment(data: any) {
    return prisma.comment.create({
      data: {
        ...data,
        status: 'APPROVED', // Default approved in school community
      },
      select: { id: true, authorName: true, content: true },
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
}
