import { prisma, Prisma } from '@nirakar/db';
import type { LibraryCatalogQuery } from '@nirakar/shared';

/**
 * Data access for the digital library.
 *
 * Every catalogue query is a single indexed lookup — the catalogue is read on
 * every page load and every filter column (standard, category, subject,
 * institution) is indexed in the schema. Listing selects only the columns the
 * catalogue card renders, never the page rows, so the catalogue payload stays
 * small regardless of how many pages a volume has.
 */

const CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  author: true,
  publisher: true,
  academicYear: true,
  standard: true,
  category: true,
  subject: true,
  institutionCode: true,
  language: true,
  pageCount: true,
  sourcePageCount: true,
  isSampled: true,
  readingMinutes: true,
  fileSizeBytes: true,
  coverUrl: true,
  keywords: true,
  excerpt: true,
  viewCount: true,
  publishedAt: true,
  createdAt: true,
} satisfies Prisma.LibraryVolumeSelect;

export class LibraryRepository {
  /* ---------------------------------------------------------------------- */
  /* Catalogue                                                              */
  /* ---------------------------------------------------------------------- */

  async findCatalog(query: LibraryCatalogQuery) {
    const where = this.buildWhere(query);

    const orderBy: Prisma.LibraryVolumeOrderByWithRelationInput[] =
      query.sort === 'title'
        ? [{ title: 'asc' }]
        : query.sort === 'standard'
          ? [{ standard: 'asc' }, { title: 'asc' }]
          : query.sort === 'popular'
            ? [{ viewCount: 'desc' }, { publishedAt: 'desc' }]
            : [{ publishedAt: 'desc' }, { createdAt: 'desc' }];

    const skip = (query.page - 1) * query.limit;

    /* Two round trips, run concurrently: the page of cards and the total
       count. The count is only needed for the pager, and both hit indexes. */
    const [items, total] = await Promise.all([
      prisma.libraryVolume.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        select: CARD_SELECT,
      }),
      prisma.libraryVolume.count({ where }),
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      pageCount: Math.max(1, Math.ceil(total / query.limit)),
    };
  }

  /**
   * Distinct subjects present in the published catalogue, for the filter UI.
   * Only published volumes are considered, and the list is capped so the
   * filter never grows unbounded.
   */
  async findSubjects(limit = 40) {
    const rows = await prisma.libraryVolume.findMany({
      where: { isPublished: true, status: 'PUBLISHED', subject: { not: null } },
      distinct: ['subject'],
      orderBy: { subject: 'asc' },
      take: limit,
      select: { subject: true },
    });
    return rows.map((r) => r.subject).filter((s): s is string => Boolean(s));
  }

  /** Counts per standard, for the standard filter badges. */
  async findStandardCounts() {
    const grouped = await prisma.libraryVolume.groupBy({
      by: ['standard'],
      where: { isPublished: true, status: 'PUBLISHED' },
      _count: { _all: true },
    });
    return grouped.map((g) => ({ standard: g.standard, count: g._count._all }));
  }

  private buildWhere(query: LibraryCatalogQuery): Prisma.LibraryVolumeWhereInput {
    const where: Prisma.LibraryVolumeWhereInput = {
      isPublished: true,
      status: 'PUBLISHED',
      /* A volume with no rendered pages has nothing for the reader to
         open, so it is kept out of the catalogue even if it was somehow
         marked as published. */
      pageCount: { gt: 0 },
    };

    if (query.standard) where.standard = query.standard;
    if (query.category) where.category = query.category;
    if (query.subject) where.subject = query.subject;
    if (query.institutionCode) where.institutionCode = query.institutionCode;

    if (query.q) {
      /* A single OR filter across the searchable columns. The trigram index
         (added in the migration) keeps this from degrading to a seq scan as
         the catalogue grows. */
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { author: { contains: query.q, mode: 'insensitive' } },
        { subject: { contains: query.q, mode: 'insensitive' } },
        { publisher: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /* ---------------------------------------------------------------------- */
  /* Single volume                                                          */
  /* ---------------------------------------------------------------------- */

  async findPublishedBySlug(slug: string) {
    return prisma.libraryVolume.findFirst({
      where: { slug, isPublished: true, status: 'PUBLISHED', pageCount: { gt: 0 } },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        author: true,
        publisher: true,
        academicYear: true,
        standard: true,
        category: true,
        subject: true,
        institutionCode: true,
        language: true,
        pageCount: true,
        sourcePageCount: true,
        isSampled: true,
        wordCount: true,
        readingMinutes: true,
        fileSizeBytes: true,
        coverUrl: true,
        keywords: true,
        excerpt: true,
        viewCount: true,
        publishedAt: true,
        pages: {
          orderBy: { pageNo: 'asc' },
          select: {
            id: true,
            pageNo: true,
            text: true,
            imageVariants: true,
            blurhash: true,
          },
        },
      },
    });
  }

  /**
   * The published volume with its rating summary and recent reviews, so the
   * reader page can show real figures without a second round trip.
   */
  async findPublishedBySlugWithReviews(slug: string) {
    const volume = await this.findPublishedBySlug(slug);
    if (!volume) return null;

    const [summary, reviews] = await Promise.all([
      this.getRatingSummary(volume.id),
      this.findReviews(volume.id),
    ]);

    return { ...volume, rating: summary, reviews };
  }

  async findById(id: string) {
    return prisma.libraryVolume.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        author: true,
        publisher: true,
        academicYear: true,
        standard: true,
        category: true,
        subject: true,
        institutionCode: true,
        language: true,
        status: true,
        isPublished: true,
        pageCount: true,
        sourcePageCount: true,
        isSampled: true,
        wordCount: true,
        readingMinutes: true,
        fileSizeBytes: true,
        originalName: true,
        pdfPath: true,
        coverUrl: true,
        keywords: true,
        excerpt: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        pages: {
          orderBy: { pageNo: 'asc' },
          select: {
            id: true,
            pageNo: true,
            text: true,
            imageVariants: true,
            blurhash: true,
          },
        },
      },
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Ratings & reviews                                                      */
  /* ---------------------------------------------------------------------- */

  /**
   * The aggregate rating for a volume: the average score and how many
   * readers have rated it. Both come from the same grouped query, so the
   * rating can never disagree with the count.
   */
  async getRatingSummary(volumeId: string) {
    const grouped = await prisma.libraryVolumeReview.groupBy({
      by: ['rating'],
      where: { volumeId },
      _count: { _all: true },
    });

    const total = grouped.reduce((sum, g) => sum + g._count._all, 0);
    const weighted = grouped.reduce((sum, g) => sum + g.rating * g._count._all, 0);

    return {
      average: total > 0 ? Math.round((weighted / total) * 10) / 10 : null,
      count: total,
      /* The five-star histogram, so the reader can show a distribution. */
      breakdown: [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: grouped.find((g) => g.rating === stars)?._count._all ?? 0,
      })),
    };
  }

  /** The most recent reviews, with the reader's name. */
  async findReviews(volumeId: string, limit = 20) {
    return prisma.libraryVolumeReview.findMany({
      where: { volumeId },
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        guestName: true,
        user: {
          select: {
            username: true,
            email: true,
            alumniProfile: { select: { firstName: true, lastName: true } },
            facultyProfile: { select: { publicContactToggles: true } },
          },
        },
      },
    });
  }

  /** The signed-in reader's own review, if they have left one. */
  async findUserReview(volumeId: string, userId: string) {
    return prisma.libraryVolumeReview.findUnique({
      where: { volumeId_userId: { volumeId, userId } },
      select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true },
    });
  }

  /** A guest's own review, if they have left one on this device. */
  async findGuestReview(volumeId: string, guestKey: string) {
    return prisma.libraryVolumeReview.findUnique({
      where: { volumeId_guestKey: { volumeId, guestKey } },
      select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true },
    });
  }

  /** Creates or updates a signed-in reader's review. */
  async upsertReview(volumeId: string, userId: string, rating: number, comment?: string | null) {
    return prisma.libraryVolumeReview.upsert({
      where: { volumeId_userId: { volumeId, userId } },
      create: { volumeId, userId, rating, comment: comment || null },
      update: { rating, comment: comment || null },
      select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true },
    });
  }

  /** Creates or updates a guest's review. */
  async upsertGuestReview(
    volumeId: string,
    guestKey: string,
    guestName: string | null,
    rating: number,
    comment?: string | null,
  ) {
    return prisma.libraryVolumeReview.upsert({
      where: { volumeId_guestKey: { volumeId, guestKey } },
      create: { volumeId, guestKey, guestName, rating, comment: comment || null },
      update: { guestName, rating, comment: comment || null },
      select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true },
    });
  }

  /** Increments the view counter without blocking the read path. */
  async incrementViewCount(id: string) {
    await prisma.libraryVolume.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { id: true },
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Admin operations                                                       */
  /* ---------------------------------------------------------------------- */

  async slugExists(slug: string, excludeId?: string) {
    const existing = await prisma.libraryVolume.findUnique({
      where: { slug },
      select: { id: true },
    });
    return Boolean(existing && existing.id !== excludeId);
  }

  async createVolume(data: {
    title: string;
    slug: string;
    description?: string | null;
    author?: string | null;
    publisher?: string | null;
    academicYear?: string | null;
    standard: Prisma.LibraryVolumeCreateInput['standard'];
    category: Prisma.LibraryVolumeCreateInput['category'];
    subject?: string | null;
    institutionCode?: Prisma.LibraryVolumeCreateInput['institutionCode'];
    language: string;
    isPublished: boolean;
    pdfPath: string;
    originalName: string;
    fileSizeBytes: number;
  }) {
    return prisma.libraryVolume.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        author: data.author || null,
        publisher: data.publisher || null,
        academicYear: data.academicYear || null,
        standard: data.standard,
        category: data.category,
        subject: data.subject || null,
        institutionCode: data.institutionCode || null,
        language: data.language,
        status: 'PROCESSING',
        isPublished: false,
        pdfPath: data.pdfPath,
        originalName: data.originalName,
        fileSizeBytes: data.fileSizeBytes,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        standard: true,
        category: true,
        status: true,
        isPublished: true,
        processingProgress: true,
      },
    });
  }

  async replacePages(volumeId: string, pages: Array<{
    pageNo: number;
    text: string;
    imageVariants: Prisma.InputJsonValue;
    blurhash: string;
  }>) {
    await prisma.$transaction(async (tx) => {
      await tx.libraryVolumePage.deleteMany({ where: { volumeId } });

      /* createMany in batches keeps the transaction from building one
         enormous statement for long volumes. */
      const BATCH = 100;
      for (let i = 0; i < pages.length; i += BATCH) {
        const batch = pages.slice(i, i + BATCH);
        await tx.libraryVolumePage.createMany({
          data: batch.map((p) => ({
            volumeId,
            pageNo: p.pageNo,
            text: p.text,
            imageVariants: p.imageVariants,
            blurhash: p.blurhash,
          })),
        });
      }
    });
  }

  async finalizeVolume(
    volumeId: string,
    data: {
      status: Prisma.LibraryVolumeUpdateInput['status'];
      isPublished: boolean;
      pageCount: number;
      wordCount: number;
      readingMinutes: number;
      keywords: string[];
      excerpt: string;
      coverUrl: string;
      sourcePageCount: number;
      isSampled: boolean;
    }
  ) {
    return prisma.libraryVolume.update({
      where: { id: volumeId },
      data: {
        status: data.status,
        isPublished: data.isPublished,
        pageCount: data.pageCount,
        sourcePageCount: data.sourcePageCount,
        isSampled: data.isSampled,
        wordCount: data.wordCount,
        readingMinutes: data.readingMinutes,
        keywords: data.keywords,
        excerpt: data.excerpt,
        coverUrl: data.coverUrl,
        publishedAt: data.isPublished ? new Date() : null,
        processingProgress: 100,
        processingStep: null,
        processingError: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        standard: true,
        category: true,
        status: true,
        isPublished: true,
        pageCount: true,
        readingMinutes: true,
        coverUrl: true,
      },
    });
  }

  /**
   * Records how far the background parser has got, so the admin panel can
   * show progress on a large volume instead of an indefinite spinner.
   */
  async updateProcessingProgress(volumeId: string, percent: number, step: string | null) {
    await prisma.libraryVolume.update({
      where: { id: volumeId },
      data: { processingProgress: Math.max(0, Math.min(100, Math.round(percent))), processingStep: step },
    });
  }

  /** Records why a background parse failed. */
  async setProcessingError(volumeId: string, message: string) {
    await prisma.libraryVolume.update({
      where: { id: volumeId },
      data: { status: 'DRAFT', processingError: message, processingStep: null },
    });
  }

  /**
   * Clears the record of a failed attempt, so the volume can be rendered
   * again without the old error still being shown.
   */
  async clearProcessingError(volumeId: string) {
    await prisma.libraryVolume.update({
      where: { id: volumeId },
      data: { status: 'PROCESSING', processingError: null, processingStep: null },
    });
  }

  /**
   * Marks a volume as being removed.
   *
   * The row is deleted moments later, but the marker tells a renderer that
   * is still working on it to stop — otherwise it would carry on writing
   * page files into a directory that is being tidied away, and the files
   * would be left behind.
   */
  async markAsDeleting(volumeId: string) {
    await prisma.libraryVolume.update({
      where: { id: volumeId },
      data: { status: 'PROCESSING', processingStep: 'Being deleted' },
    });
  }

  async updateVolume(id: string, data: Prisma.LibraryVolumeUpdateInput) {
    return prisma.libraryVolume.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        slug: true,
        standard: true,
        category: true,
        subject: true,
        status: true,
        isPublished: true,
        pageCount: true,
        author: true,
        publisher: true,
        academicYear: true,
        description: true,
        institutionCode: true,
        language: true,
      },
    });
  }

  async deleteVolume(id: string) {
    /* Pages cascade at the database level. */
    await prisma.libraryVolume.delete({ where: { id } });
  }

  /** Admin listing — includes unpublished and processing volumes. */
  async listForAdmin(query: LibraryCatalogQuery) {
    const where: Prisma.LibraryVolumeWhereInput = {};
    if (query.standard) where.standard = query.standard;
    if (query.category) where.category = query.category;
    if (query.subject) where.subject = query.subject;

    /* The admin can narrow the list to live volumes or to drafts. */
    if (query.published !== undefined) {
      where.isPublished = query.published;
    }

    if (query.q) {
      /* The same columns the public catalogue searches, so a volume an
         administrator cannot find on the site is a volume they cannot
         find in the console either. */
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { author: { contains: query.q, mode: 'insensitive' } },
        { subject: { contains: query.q, mode: 'insensitive' } },
        { publisher: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.LibraryVolumeOrderByWithRelationInput[] =
      query.sort === 'title'
        ? [{ title: 'asc' }]
        : query.sort === 'standard'
          ? [{ standard: 'asc' }, { title: 'asc' }]
          : query.sort === 'popular'
            ? [{ viewCount: 'desc' }, { publishedAt: 'desc' }]
            : [{ createdAt: 'desc' }];

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.libraryVolume.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        select: {
          ...CARD_SELECT,
          status: true,
          isPublished: true,
          originalName: true,
          createdAt: true,
          processingProgress: true,
          processingStep: true,
          processingError: true,
          sourcePageCount: true,
          isSampled: true,
        },
      }),
      prisma.libraryVolume.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }
}
