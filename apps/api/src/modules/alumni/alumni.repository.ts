import { prisma, InstitutionCode, VerificationLevel } from '@nirakar/db';

export class AlumniRepository {
  async findAdminDirectoryProfiles(search?: string) {
    return prisma.alumniProfile.findMany({
      where: {
        user: {
          isSuspended: false,
          deletedAt: null,
        },
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' as const } },
                { middleName: { contains: search, mode: 'insensitive' as const } },
                { lastName: { contains: search, mode: 'insensitive' as const } },
                { user: { username: { contains: search, mode: 'insensitive' as const } } },
              ],
            }
          : {}),
      },
      orderBy: [{ verificationLevel: 'asc' }, { batchYear: 'desc' }, { id: 'asc' }],
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        school: true,
        batchYear: true,
        photoUrl: true,
        verificationLevel: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async findDirectoryProfiles(params: {
    school?: InstitutionCode;
    batchYear?: number;
    city?: string;
    occupation?: string;
    search?: string;
    cursor?: string;
    limit?: number;
  }) {
    const { school, batchYear, city, occupation, search, cursor, limit = 20 } = params;

    const where: any = {
      user: { isSuspended: false, deletedAt: null },
    };

    if (school) where.school = school;
    if (batchYear) where.batchYear = batchYear;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (occupation) where.occupation = { contains: occupation, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const items = await prisma.alumniProfile.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: [{ batchYear: 'desc' }, { id: 'asc' }],
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        school: true,
        batchYear: true,
        photoUrl: true,
        city: true,
        occupation: true,
        verificationLevel: true,
        visibilitySettings: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const hasNextPage = items.length > limit;
    const records = hasNextPage ? items.slice(0, -1) : items;
    const nextCursor = hasNextPage ? records[records.length - 1]?.id : null;

    return { records, nextCursor };
  }

  async findByUsername(username: string) {
    return prisma.alumniProfile.findFirst({
      where: {
        OR: [
          { user: { username, deletedAt: null } },
          { id: username },
        ],
      },
      select: {
        id: true,
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        school: true,
        batchYear: true,
        photoUrl: true,
        bio: true,
        city: true,
        occupation: true,
        socialLinks: true,
        visibilitySettings: true,
        verificationLevel: true,
        adminNotes: true,
        galleryPhotos: true,
        createdAt: true,
        user: {
          select: {
            username: true,
          },
        },
        familyMembers: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            relation: true,
            photoUrl: true,
            bio: true,
          },
        },
        vouches: {
          select: {
            id: true,
            voucher: {
              select: {
                username: true,
                alumniProfile: {
                  select: { firstName: true, lastName: true, school: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.alumniProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        school: true,
        batchYear: true,
        photoUrl: true,
        bio: true,
        city: true,
        occupation: true,
        socialLinks: true,
        visibilitySettings: true,
        verificationLevel: true,
        galleryPhotos: true,
        updatedAt: true,
        user: { select: { username: true } },
        familyMembers: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            relation: true,
            photoUrl: true,
            bio: true,
          },
        },
      },
    });
  }

  async updateProfile(profileId: string, data: any) {
    return prisma.alumniProfile.update({
      where: { id: profileId },
      data,
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        school: true,
        batchYear: true,
        photoUrl: true,
        bio: true,
        city: true,
        occupation: true,
        socialLinks: true,
        visibilitySettings: true,
        verificationLevel: true,
        galleryPhotos: true,
        updatedAt: true,
        user: { select: { username: true } },
        familyMembers: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            relation: true,
            photoUrl: true,
            bio: true,
          },
        },
      },
    });
  }

  async createVouch(voucherUserId: string, targetProfileId: string, note?: string) {
    return prisma.alumniVouch.create({
      data: {
        voucherId: voucherUserId,
        targetProfileId,
        note,
      },
      select: { id: true, createdAt: true },
    });
  }

  async countVouchesForProfile(targetProfileId: string) {
    return prisma.alumniVouch.count({
      where: { targetProfileId },
    });
  }

  async setVerificationLevel(profileId: string, level: VerificationLevel, adminNotes?: string) {
    return prisma.alumniProfile.update({
      where: { id: profileId },
      data: {
        verificationLevel: level,
        adminNotes,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        school: true,
        batchYear: true,
        verificationLevel: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async deleteAdminAlumni(profileId: string) {
    const profile = await prisma.alumniProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        userId: true,
        firstName: true,
        middleName: true,
        lastName: true,
      },
    });
    if (!profile) return null;

    await prisma.user.update({
      where: { id: profile.userId },
      data: { deletedAt: new Date() },
    });

    return {
      id: profile.id,
      firstName: profile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName,
      deleted: true,
    };
  }

  async createReport(reporterUserId: string, targetProfileId: string, reason: string) {
    return prisma.profileReport.create({
      data: {
        reporterId: reporterUserId,
        targetProfileId,
        reason,
      },
      select: { id: true, createdAt: true },
    });
  }

  async exportAlumniData(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        username: true,
        createdAt: true,
        alumniProfile: {
          include: { familyMembers: true, vouches: true },
        },
        supporterPasses: true,
        readEvents: true,
      },
    });
  }

  async deleteAlumniData(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }
}
