import { prisma, SocialItemType, SocialSource } from '@nirakar/db';

export class SocialRepository {
  async getFeed(limit = 12) {
    return prisma.socialItem.findMany({
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        source: true,
        type: true,
        text: true,
        mediaUrl: true,
        permalink: true,
        publishedAt: true,
        eventStart: true,
        eventPlace: true,
      },
    });
  }

  async getPhotos(limit = 12) {
    return prisma.socialItem.findMany({
      where: {
        type: { in: ['PHOTO', 'ALBUM'] },
        mediaUrl: { not: null },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        text: true,
        mediaUrl: true,
        permalink: true,
        publishedAt: true,
      },
    });
  }

  async getEvents(upcoming?: boolean, limit = 10) {
    const now = new Date();
    return prisma.socialItem.findMany({
      where: {
        type: 'EVENT',
        ...(upcoming !== undefined
          ? upcoming
            ? { eventStart: { gte: now } }
            : { eventStart: { lt: now } }
          : {}),
      },
      orderBy: { eventStart: upcoming ? 'asc' : 'desc' },
      take: limit,
      select: {
        id: true,
        text: true,
        mediaUrl: true,
        permalink: true,
        eventStart: true,
        eventEnd: true,
        eventPlace: true,
      },
    });
  }

  async upsertItem(data: {
    source: SocialSource;
    externalId: string;
    type: SocialItemType;
    text?: string | null;
    mediaUrl?: string | null;
    permalink: string;
    publishedAt: Date;
    eventStart?: Date | null;
    eventEnd?: Date | null;
    eventPlace?: string | null;
  }) {
    return prisma.socialItem.upsert({
      where: { externalId: data.externalId },
      update: data,
      create: data,
    });
  }

  async getSyncState(source: SocialSource) {
    return prisma.socialSyncState.findUnique({
      where: { source },
    });
  }

  async updateSyncState(source: SocialSource, status: string, itemsCount = 0, errorMessage?: string) {
    return prisma.socialSyncState.upsert({
      where: { source },
      update: {
        status,
        itemsCount,
        lastSyncAt: new Date(),
        errorMessage: errorMessage || null,
      },
      create: {
        source,
        status,
        itemsCount,
        lastSyncAt: new Date(),
        errorMessage: errorMessage || null,
      },
    });
  }
}
