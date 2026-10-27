import { PrismaClient, Prisma, BatchStream } from '@prisma/client';
import { BatchPhotoQuerySchema, type BatchPhotoListResponse } from '@nirakar/shared';

const prisma = new PrismaClient();

export interface BatchPhotoFilters {
  institutionCode?: string;
  stream?: BatchStream;
  batchYear?: number;
  decade?: number;
  search?: string;
  page: number;
  limit: number;
}

export class BatchPhotosRepository {
  /**
   * How the archive is sorted when nobody asks for an order.
   *
   * The newest batch comes first, because that is the photograph somebody
   * looking for a classmate will want to see.
   */
  private static readonly ORDER: Prisma.BatchPhotoOrderByWithRelationInput[] = [
    { batchYear: 'desc' },
    { createdAt: 'desc' },
  ];

  /**
   * Turns the query the archive was asked for into a database filter.
   *
   * The words someone typed are matched against the title and the caption
   * together, so a search for "science" finds the batch whether the stream
   * is written in the title or only in the caption.
   */
  private static buildWhere(filters: BatchPhotoFilters): Prisma.BatchPhotoWhereInput {
    const where: Prisma.BatchPhotoWhereInput = {};

    if (filters.institutionCode) {
      where.institutionCode = filters.institutionCode as any;
    }
    if (filters.stream) {
      where.stream = filters.stream;
    }
    if (filters.batchYear) {
      where.batchYear = filters.batchYear;
    } else if (filters.decade) {
      where.batchYear = {
        gte: filters.decade,
        lt: filters.decade + 10,
      };
    }
    if (filters.search) {
      const term = filters.search;
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { caption: { contains: term, mode: 'insensitive' } },
        { batchSession: { contains: term, mode: 'insensitive' } },
        { classLevel: { contains: term, mode: 'insensitive' } },
        { division: { contains: term, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async list(filters: BatchPhotoFilters): Promise<BatchPhotoListResponse> {
    const where = BatchPhotosRepository.buildWhere(filters);

    const [items, total] = await Promise.all([
      prisma.batchPhoto.findMany({
        where,
        orderBy: BatchPhotosRepository.ORDER,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.batchPhoto.count({ where }),
    ]);

    return {
      items: items.map((row) => ({
        id: row.id,
        institutionCode: row.institutionCode,
        batchYear: row.batchYear,
        title: row.title,
        photoUrl: row.photoUrl,
        caption: row.caption,
        stream: row.stream,
        batchSession: row.batchSession,
        classLevel: row.classLevel,
        division: row.division,
        fileSizeBytes: row.fileSizeBytes,
        imageFormat: row.imageFormat,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      })),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    };
  }

  /** Every photograph, for the seed that fills the archive. */
  async findAll(): Promise<any[]> {
    return prisma.batchPhoto.findMany({ orderBy: BatchPhotosRepository.ORDER });
  }

  async findById(id: string) {
    return prisma.batchPhoto.findUnique({ where: { id } });
  }

  async findByTitle(title: string, institutionCode: string) {
    return prisma.batchPhoto.findFirst({ where: { title, institutionCode: institutionCode as any } });
  }

  async create(data: {
    institutionCode: string;
    batchYear: number;
    title: string;
    photoUrl: string;
    caption?: string | null;
    stream: BatchStream;
    batchSession: string;
    classLevel: string;
    division?: string | null;
    fileSizeBytes: number;
    imageFormat: string;
  }) {
    return prisma.batchPhoto.create({ data: data as any });
  }

  async update(id: string, data: Record<string, any>) {
    return prisma.batchPhoto.update({ where: { id }, data });
  }

  async remove(id: string) {
    return prisma.batchPhoto.delete({ where: { id } });
  }

  /** How the archive is spread out, for the totals at the top of the page. */
  async stats() {
    const [total, byCampus, byStream, earliest, latest, years] = await Promise.all([
      prisma.batchPhoto.count(),
      prisma.batchPhoto.groupBy({ by: ['institutionCode'], _count: { _all: true } }),
      prisma.batchPhoto.groupBy({ by: ['stream'], _count: { _all: true } }),
      prisma.batchPhoto.findFirst({ orderBy: { batchYear: 'asc' }, select: { batchYear: true } }),
      prisma.batchPhoto.findFirst({ orderBy: { batchYear: 'desc' }, select: { batchYear: true } }),
      prisma.batchPhoto.findMany({ select: { batchYear: true }, distinct: ['batchYear'], orderBy: { batchYear: 'desc' } }),
    ]);

    return {
      total,
      campuses: byCampus.length,
      streams: byStream.length,
      earliestYear: earliest?.batchYear ?? null,
      latestYear: latest?.batchYear ?? null,
      years: years.map((row) => row.batchYear),
      byCampus: byCampus.map((row) => ({
        institutionCode: row.institutionCode,
        count: row._count._all,
      })),
      byStream: byStream.map((row) => ({
        stream: row.stream,
        count: row._count._all,
      })),
    };
  }

  /** Reads the query the archive was asked for, rejecting nonsense. */
  static parseQuery(raw: unknown) {
    const parsed = BatchPhotoQuerySchema.safeParse(raw ?? {});
    return parsed.success ? parsed.data : BatchPhotoQuerySchema.parse({});
  }
}

export const batchPhotosRepository = new BatchPhotosRepository();
