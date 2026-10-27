import { prisma } from '@nirakar/db';

export class HomeRepository {
  async getHomepagePayload() {
    const today = new Date().toISOString().split('T')[0];

    const [
      stats,
      notices,
      upcomingEvents,
      pastEvents,
      newsEvents,
      alumniAchievers,
      latestPatrika,
      galleryItems,
      socialFeed,
      siteSettings,
      headerMenu,
      registeredAlumniCount,
    ] = await Promise.all([
      // 1. Stats
      prisma.stat.findMany({
        orderBy: { order: 'asc' },
        select: { key: true, label: true, value: true, prefix: true, suffix: true, icon: true },
      }),

      // 2. High priority notices
      prisma.notice.findMany({
        orderBy: [{ pinned: 'desc' }, { date: 'desc' }],
        take: 8,
        select: { id: true, title: true, content: true, date: true, pinned: true, pdfUrl: true, institutionCode: true },
      }),

      // 3. Upcoming Events
      (prisma.event as any).findMany({
        where: { isUpcoming: true },
        orderBy: { startDate: 'asc' },
        take: 8,
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          location: true,
          coverUrl: true,
          pdfUrl: true,
          photos: true,
          documents: true,
          videoUrl: true,
          institutionCode: true,
        },
      }),

      // 4. Past Events
      (prisma.event as any).findMany({
        where: { isUpcoming: false },
        orderBy: { startDate: 'desc' },
        take: 8,
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          location: true,
          coverUrl: true,
          pdfUrl: true,
          photos: true,
          documents: true,
          videoUrl: true,
          institutionCode: true,
        },
      }),

      // 5. News / Achievements
      prisma.newsEvent.findMany({
        orderBy: { date: 'desc' },
        take: 4,
        select: { id: true, title: true, excerpt: true, date: true, coverUrl: true, institutionCode: true },
      }),

      // 6. Proud Alumni Achievers (Verified/Trusted public alumni)
      prisma.alumniProfile.findMany({
        where: {
          verificationLevel: { in: ['VERIFIED', 'TRUSTED'] },
          photoUrl: { not: null },
          user: { isSuspended: false, deletedAt: null },
        },
        take: 8,
        orderBy: [{ batchYear: 'desc' }, { id: 'asc' }],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          school: true,
          batchYear: true,
          photoUrl: true,
          occupation: true,
          city: true,
          bio: true,
          adminNotes: true,
          user: { select: { username: true } },
        },
      }),

      // 7. Today's or Latest Patrika Issue
      prisma.magazineIssue.findFirst({
        where: { status: 'PUBLISHED' },
        orderBy: { publishDate: 'desc' },
        select: {
          id: true,
          publishDate: true,
          title: true,
          coverUrl: true,
          pageCount: true,
          readingMinutes: true,
          excerpt: true,
          isLocked: true,
        },
      }),

      // 8. Gallery Highlights
      prisma.galleryItem.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          mediaUrl: true,
          caption: true,
          album: {
            select: {
              id: true,
              title: true,
              institutionCode: true,
              category: true,
            },
          },
        },
      }),

      // 9. Social Feed (Facebook / Instagram)
      prisma.socialItem.findMany({
        take: 6,
        orderBy: { publishedAt: 'desc' },
        select: { id: true, source: true, type: true, text: true, mediaUrl: true, permalink: true, publishedAt: true },
      }),

      // 10. Site Settings
      prisma.siteSetting.findMany({
        select: { key: true, value: true },
      }),

      // 11. Header Menu
      prisma.menu.findFirst({
        where: { location: 'HEADER' },
        select: {
          items: {
            where: { parentId: null },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              label: true,
              url: true,
              children: {
                orderBy: { order: 'asc' },
                select: { id: true, label: true, url: true },
              },
            },
          },
        },
      }),

      // 12. Total registered alumni count in database
      prisma.alumniProfile.count({
        where: { user: { isSuspended: false, deletedAt: null } },
      }),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const s of siteSettings) {
      settingsMap[s.key] = s.value;
    }

    return {
      stats,
      notices,
      events: {
        upcoming: upcomingEvents,
        past: pastEvents,
      },
      news: newsEvents,
      alumniAchievers,
      registeredAlumniCount,
      latestPatrika,
      latestMagazine: latestPatrika,
      gallery: galleryItems,
      socialFeed,
      settings: settingsMap,
      navigation: headerMenu?.items || [],
      timestamp: new Date().toISOString(),
    };
  }
}
