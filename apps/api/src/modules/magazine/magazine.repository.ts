import { prisma, MagazineStatus } from '@nirakar/db';

export class MagazineRepository {
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
        isLocked: true,
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
        isLocked: true,
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
    return prisma.magazineIssue.findUnique({
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
        isLocked: true,
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
        isLocked: true,
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

  async createIssue(data: {
    publishDate: string;
    title: string;
    status: MagazineStatus;
    pdfPath: string;
    isLocked: boolean;
  }) {
    return prisma.magazineIssue.create({
      data: {
        publishDate: data.publishDate,
        title: data.title,
        status: data.status,
        pdfPath: data.pdfPath,
        isLocked: data.isLocked,
      },
      select: {
        id: true,
        publishDate: true,
        title: true,
        status: true,
      },
    });
  }

  async updateIssue(id: string, data: any) {
    return prisma.magazineIssue.update({
      where: { id },
      data,
      select: {
        id: true,
        publishDate: true,
        title: true,
        status: true,
        coverUrl: true,
        isLocked: true,
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
            isLocked: true,
          },
        },
      },
    });
  }
}
