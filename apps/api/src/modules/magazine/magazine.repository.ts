import { prisma, MagazineStatus } from '@nirakar/db';

export class MagazineRepository {
  async findAdminIssues() {
    return prisma.magazineIssue.findMany({
      orderBy: { publishDate: 'desc' },
      select: {
        id: true,
        publishDate: true,
        title: true,
        status: true,
        coverUrl: true,
        pageCount: true,
        readingMinutes: true,
        excerpt: true,
      },
    });
  }

  async findCalendarIssues(year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    return prisma.magazineIssue.findMany({
      where: {
        publishDate: { gte: startDate, lt: endDate },
        status: 'PUBLISHED',
      },
      orderBy: { publishDate: 'asc' },
      select: {
        id: true,
        publishDate: true,
        title: true,
        coverUrl: true,
        pageCount: true,
        readingMinutes: true,
        excerpt: true,
      },
    });
  }

  async findLatest() {
    return prisma.magazineIssue.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { publishDate: 'desc' },
      select: {
        id: true,
        publishDate: true,
        title: true,
        status: true,
        coverUrl: true,
        pageCount: true,
        wordCount: true,
        readingMinutes: true,
        keywords: true,
        excerpt: true,
        articles: {
          orderBy: { startPage: 'asc' },
          select: { id: true, title: true, startPage: true, author: true },
        },
        pages: {
          orderBy: { pageNo: 'asc' },
          select: {
            id: true,
            pageNo: true,
            text: true,
            textItems: true,
            imageVariants: true,
            blurhash: true,
          },
        },
      },
    });
  }

  async findByDate(publishDate: string) {
    return prisma.magazineIssue.findFirst({
      where: { publishDate },
      select: {
        id: true,
        publishDate: true,
        title: true,
        status: true,
        coverUrl: true,
        pageCount: true,
        wordCount: true,
        readingMinutes: true,
        keywords: true,
        excerpt: true,
        articles: {
          orderBy: { startPage: 'asc' },
          select: { id: true, title: true, startPage: true, author: true },
        },
        pages: {
          orderBy: { pageNo: 'asc' },
          select: {
            id: true,
            pageNo: true,
            text: true,
            textItems: true,
            imageVariants: true,
            blurhash: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.magazineIssue.findUnique({
      where: { id },
      select: {
        id: true,
        publishDate: true,
        title: true,
        status: true,
        coverUrl: true,
        pageCount: true,
        wordCount: true,
        readingMinutes: true,
        keywords: true,
        excerpt: true,
        pdfPath: true,
        articles: {
          orderBy: { startPage: 'asc' },
          select: { id: true, title: true, startPage: true, author: true },
        },
        pages: {
          orderBy: { pageNo: 'asc' },
          select: {
            id: true,
            pageNo: true,
            text: true,
            textItems: true,
            imageVariants: true,
            blurhash: true,
            hasOcr: true,
          },
        },
      },
    });
  }

  async findPublishedReviewTarget(reference: string) {
    return prisma.magazineIssue.findFirst({
      where: {
        status: 'PUBLISHED',
        OR: [{ id: reference }, { publishDate: reference }],
      },
      select: { id: true },
    });
  }

  async findReviewTarget(reference: string) {
    return prisma.magazineIssue.findFirst({
      where: { OR: [{ id: reference }, { publishDate: reference }] },
      select: { id: true, status: true },
    });
  }

  async getRatingSummary(issueId: string) {
    const grouped = await prisma.magazineIssueReview.groupBy({
      by: ['rating'],
      where: { issueId },
      _count: { _all: true },
    });
    const count = grouped.reduce((sum, row) => sum + row._count._all, 0);
    const weighted = grouped.reduce((sum, row) => sum + row.rating * row._count._all, 0);
    return {
      average: count ? Math.round((weighted / count) * 10) / 10 : null,
      count,
      breakdown: [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: grouped.find((row) => row.rating === stars)?._count._all ?? 0,
      })),
    };
  }

  async findReviews(issueId: string, limit = 20) {
    return prisma.magazineIssueReview.findMany({
      where: { issueId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        guestName: true,
        user: {
          select: {
            alumniProfile: { select: { firstName: true, lastName: true } },
            facultyProfile: { select: { publicContactToggles: true } },
          },
        },
      },
    });
  }

  async findUserReview(issueId: string, userId: string) {
    return prisma.magazineIssueReview.findUnique({
      where: { issueId_userId: { issueId, userId } },
      select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true },
    });
  }

  async findGuestReview(issueId: string, guestKey: string) {
    return prisma.magazineIssueReview.findUnique({
      where: { issueId_guestKey: { issueId, guestKey } },
      select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true },
    });
  }

  async upsertReview(issueId: string, userId: string, rating: number, comment?: string | null) {
    return prisma.magazineIssueReview.upsert({
      where: { issueId_userId: { issueId, userId } },
      create: { issueId, userId, rating, comment: comment || null },
      update: { rating, comment: comment || null },
      select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true },
    });
  }

  async upsertGuestReview(issueId: string, guestKey: string, guestName: string | null, rating: number, comment?: string | null) {
    return prisma.magazineIssueReview.upsert({
      where: { issueId_guestKey: { issueId, guestKey } },
      create: { issueId, guestKey, guestName, rating, comment: comment || null },
      update: { guestName, rating, comment: comment || null },
      select: { id: true, rating: true, comment: true, createdAt: true, updatedAt: true },
    });
  }

  async createIssue(data: {
    publishDate: string;
    title: string;
    status: MagazineStatus;
    pdfPath: string;
  }) {
    return prisma.magazineIssue.create({
      data: {
        publishDate: data.publishDate,
        title: data.title,
        status: data.status,
        pdfPath: data.pdfPath,
        isLocked: false,
      },
      select: {
        id: true,
        publishDate: true,
        title: true,
        status: true,
      },
    });
  }

  async findForDelete(id: string) {
    return prisma.magazineIssue.findUnique({
      where: { id },
      select: { id: true, title: true, pdfPath: true },
    });
  }

  async markAsDeleting(id: string) {
    await prisma.magazineIssue.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  async deleteIssue(id: string) {
    await prisma.magazineIssue.delete({ where: { id } });
  }

  async findAdminIssueStatus(id: string) {
    return prisma.magazineIssue.findUnique({
      where: { id },
      select: { status: true, pageCount: true },
    });
  }

  async updateIssue(id: string, data: any) {
    return prisma.magazineIssue.update({
      where: { id },
      data: { ...data, isLocked: false },
      select: {
        id: true,
        publishDate: true,
        title: true,
        status: true,
        coverUrl: true,
        pageCount: true,
        readingMinutes: true,
        excerpt: true,
      },
    });
  }

  async searchPages(query: string, issueId?: string, limit = 20) {
    return prisma.magazineIssuePage.findMany({
      where: {
        text: { contains: query, mode: 'insensitive' },
        ...(issueId ? { issueId } : {}),
        issue: { status: 'PUBLISHED' },
      },
      take: limit,
      select: {
        id: true,
        pageNo: true,
        text: true,
        issue: {
          select: {
            id: true,
            publishDate: true,
            title: true,
              },
        },
      },
    });
  }
}
