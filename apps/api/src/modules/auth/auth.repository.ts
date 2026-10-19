import { prisma, User, RefreshToken } from '@nirakar/db';

export class AuthRepository {
  async findByEmailOrUsername(identifier: string) {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        role: true,
        isSuspended: true,
        alumniProfile: {
          select: { id: true, verificationLevel: true },
        },
        facultyProfile: {
          select: { id: true, institutionCode: true, status: true },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isSuspended: true,
        createdAt: true,
        alumniProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            school: true,
            batchYear: true,
            verificationLevel: true,
            photoUrl: true,
          },
        },
        facultyProfile: {
          select: {
            id: true,
            institutionCode: true,
            designation: true,
            department: true,
            status: true,
          },
        },
      },
    });
  }

  async createAlumniUser(data: {
    email: string;
    username: string;
    passwordHash: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    school: any;
    batchYear: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          username: data.username,
          passwordHash: data.passwordHash,
          role: 'ALUMNI',
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
        },
      });

      const profile = await tx.alumniProfile.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          middleName: data.middleName || null,
          lastName: data.lastName,
          school: data.school,
          batchYear: data.batchYear,
          verificationLevel: 'UNVERIFIED',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          school: true,
          batchYear: true,
          verificationLevel: true,
        },
      });

      return { user, profile };
    });
  }

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
      select: { id: true },
    });
  }

  async findValidRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            isSuspended: true,
          },
        },
      },
    });
  }

  async revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
      select: { id: true },
    });
  }

  async revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }
}
