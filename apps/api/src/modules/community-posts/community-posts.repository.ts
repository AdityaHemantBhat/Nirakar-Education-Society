import { prisma } from '@nirakar/db';
import { AppError } from '../../middleware/error.js';

const postSelect = {
  id: true,
  title: true,
  body: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  author: {
    select: {
      username: true,
      alumniProfile: {
        select: { firstName: true, middleName: true, lastName: true, school: true, batchYear: true, photoUrl: true, verificationLevel: true },
      },
    },
  },
  media: { orderBy: { order: 'asc' as const }, select: { id: true, url: true, mediaType: true, mimeType: true, order: true } },
};

export class CommunityPostsRepository {
  async list(cursor?: string, take = 15) {
    const cursorPost = cursor ? await prisma.post.findUnique({ where: { id: cursor }, select: { id: true, publishedAt: true } }) : null;
    const rows = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        author: { role: 'ALUMNI', isSuspended: false, deletedAt: null, alumniProfile: { isNot: null } },
        ...(cursorPost ? { OR: [{ publishedAt: { lt: cursorPost.publishedAt } }, { publishedAt: cursorPost.publishedAt, id: { lt: cursorPost.id } }] } : {}),
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
      select: postSelect,
    });
    const hasMore = rows.length > take;
    const records = hasMore ? rows.slice(0, take) : rows;
    const last = records[records.length - 1];
    return { records, nextCursor: hasMore && last ? last.id : null };
  }

  async create(authorId: string, data: { title: string; body: string; mediaIds: string[] }) {
    const media = await this.mediaRecords(data.mediaIds, authorId);
    return prisma.post.create({
      data: {
        authorId, title: data.title, body: data.body, excerpt: data.body.slice(0, 240), status: 'PUBLISHED', publishedAt: new Date(),
        media: media.length ? { create: media } : undefined,
      },
      select: postSelect,
    });
  }

  async update(id: string, authorId: string, data: { title?: string; body?: string; mediaIds?: string[] }) {
    const media = data.mediaIds === undefined ? undefined : await this.mediaRecords(data.mediaIds, authorId);
    return prisma.$transaction(async (tx) => {
      const result = await tx.post.updateMany({
        where: { id, authorId },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.body !== undefined ? { body: data.body, excerpt: data.body.slice(0, 240) } : {}),
        },
      });
      if (!result.count) throw new Error('Post not found.');
      if (media !== undefined) {
        await tx.postMedia.deleteMany({ where: { postId: id } });
        if (media.length) await tx.postMedia.createMany({ data: media.map((attachment) => ({ ...attachment, postId: id })) });
      }
      return tx.post.findFirstOrThrow({ where: { id, authorId }, select: postSelect });
    });
  }

  async delete(id: string, authorId: string) {
    return prisma.post.deleteMany({ where: { id, authorId } });
  }

  async findOwned(id: string, authorId: string) {
    return prisma.post.findFirst({ where: { id, authorId }, select: { id: true } });
  }

  async createMedia(authorId: string, data: { filename: string; originalName: string; mimeType: string; sizeBytes: number; width: number; height: number; blurhash: string; dominantColor: string; variants: any }) {
    return prisma.media.create({
      data: { ...data, uploadedById: authorId },
      select: { id: true, filename: true, originalName: true, mimeType: true, sizeBytes: true, width: true, height: true, variants: true, blurhash: true, dominantColor: true },
    });
  }

  private async mediaRecords(ids: string[], authorId: string) {
    if (new Set(ids).size !== ids.length) throw new AppError('BAD_REQUEST', 'Duplicate media attachments are not allowed.', 400);
    if (ids.length > 4) throw new AppError('BAD_REQUEST', 'A post can include at most four media attachments.', 400);
    if (!ids.length) return [];
    const records = await prisma.media.findMany({ where: { id: { in: ids }, uploadedById: authorId }, select: { id: true, filename: true, mimeType: true, variants: true } });
    if (records.length !== ids.length) throw new AppError('BAD_REQUEST', 'One or more media uploads could not be found for your account.', 400);
    return ids.map((id, order) => {
      const item = records.find((record) => record.id === id)!;
      if (!item.mimeType.startsWith('image/') && !item.mimeType.startsWith('video/')) throw new Error('Only image and video attachments are supported.');
      const variants = item.variants as Array<{ url?: string }>;
      const url = item.mimeType.startsWith('video/')
        ? `/uploads/${item.filename}`
        : variants.find((variant) => variant.url)?.url || `/uploads/${item.filename}`;
      return { mediaId: id, url, mediaType: item.mimeType.startsWith('video/') ? 'VIDEO' : 'IMAGE', mimeType: item.mimeType, order };
    });
  }
}
