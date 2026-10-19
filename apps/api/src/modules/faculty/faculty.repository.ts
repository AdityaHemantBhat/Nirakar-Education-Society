import { prisma, FacultyStatus, InstitutionCode } from '@nirakar/db';

export class FacultyRepository {
  async findByInstitution(institutionCode?: InstitutionCode) {
    return prisma.facultyProfile.findMany({
      where: {
        status: 'PUBLISHED',
        ...(institutionCode ? { institutionCode } : {}),
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        institutionCode: true,
        designation: true,
        department: true,
        subjects: true,
        qualification: true,
        experience: true,
        bio: true,
        achievements: true,
        photoUrl: true,
        publicContactToggles: true,
        institution: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.facultyProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        institutionId: true,
        institutionCode: true,
        designation: true,
        department: true,
        subjects: true,
        qualification: true,
        experience: true,
        bio: true,
        achievements: true,
        photoUrl: true,
        publicContactToggles: true,
        status: true,
      },
    });
  }

  async updateOwnProfile(userId: string, data: any) {
    const institutionCode = data.institutionCode || 'ANGLE_HSS';
    let inst = await prisma.institution.findFirst({
      where: { code: institutionCode },
    });
    if (!inst) {
      inst = await prisma.institution.findFirst();
    }

    const { name, username, ...profileFields } = data;
    const resolvedUsername = (username || name || '').trim();
    const rawToggles = (profileFields.publicContactToggles || {}) as any;
    const finalToggles = {
      ...rawToggles,
      name: name || rawToggles.name || rawToggles.fullName,
      fullName: name || rawToggles.fullName || rawToggles.name,
      username: resolvedUsername || rawToggles.username,
    };

    // 1. Try finding by direct facultyProfile.id or userId
    let existingProfile: any = null;
    if (userId) {
      existingProfile = await prisma.facultyProfile.findFirst({
        where: { OR: [{ id: userId }, { userId }] },
        include: { user: true },
      }).catch(() => null);
    }

    // 2. If not found by direct ID (e.g. userId is 'fac-1' seed ID or custom slug), match by email / name / institution
    if (!existingProfile) {
      const allProfiles = await prisma.facultyProfile.findMany({
        include: { user: true },
      }).catch(() => []);

      const normName = (name || '').toLowerCase().trim();
      const normEmail = (data.email || rawToggles.email || '').toLowerCase().trim();

      existingProfile = allProfiles.find((p) => {
        const pToggles = (p.publicContactToggles || {}) as any;
        const pName = (pToggles.name || pToggles.fullName || p.user?.username || '').toLowerCase().trim();
        const pEmail = (pToggles.email || p.user?.email || '').toLowerCase().trim();

        if (normEmail && pEmail && normEmail === pEmail) return true;
        if (normName && pName && (normName === pName || normName.includes(pName) || pName.includes(normName))) {
          if (p.institutionCode === institutionCode) return true;
        }
        if (
          userId === 'fac-1' &&
          p.institutionCode === 'NIRAKAR_HS' &&
          (p.designation.toLowerCase().includes('headmaster') || pToggles.isHead)
        ) {
          return true;
        }
        return false;
      }) || null;
    }

    const safeData: any = {};
    if (profileFields.designation !== undefined) safeData.designation = profileFields.designation;
    if (profileFields.department !== undefined) safeData.department = profileFields.department;
    if (profileFields.subjects !== undefined) safeData.subjects = Array.isArray(profileFields.subjects) ? profileFields.subjects : [];
    if (profileFields.qualification !== undefined) safeData.qualification = profileFields.qualification;
    if (profileFields.experience !== undefined) safeData.experience = profileFields.experience;
    if (profileFields.bio !== undefined) safeData.bio = profileFields.bio;
    if (profileFields.achievements !== undefined) safeData.achievements = Array.isArray(profileFields.achievements) ? profileFields.achievements : [];
    if (profileFields.photoUrl !== undefined) safeData.photoUrl = profileFields.photoUrl;
    if (profileFields.institutionCode || existingProfile?.institutionCode) {
      safeData.institutionCode = profileFields.institutionCode || existingProfile.institutionCode;
    }
    safeData.status = profileFields.status || existingProfile?.status || 'PUBLISHED';

    if (existingProfile) {
      if (resolvedUsername && existingProfile.user?.id) {
        await prisma.user.update({
          where: { id: existingProfile.user.id },
          data: { username: resolvedUsername },
        }).catch(() => null);
      }

      const mergedToggles = {
        ...((existingProfile.publicContactToggles as object) || {}),
        ...finalToggles,
      };

      safeData.publicContactToggles = mergedToggles;

      const updated = await prisma.facultyProfile.update({
        where: { id: existingProfile.id },
        data: safeData,
        select: {
          id: true,
          institutionCode: true,
          designation: true,
          department: true,
          subjects: true,
          qualification: true,
          experience: true,
          bio: true,
          achievements: true,
          photoUrl: true,
          publicContactToggles: true,
          status: true,
        },
      });

      return {
        ...updated,
        name: name || (mergedToggles as any).name || (mergedToggles as any).fullName,
      };
    }

    const user = userId ? await prisma.user.findUnique({ where: { id: userId } }).catch(() => null) : null;

    // If a custom educator name is provided and user exists, update username
    if (name && user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { username: name },
      }).catch(() => null);
    }

    if (user) {
      const upserted = await prisma.facultyProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          institutionId: inst?.id || 'default-inst',
          institutionCode: institutionCode,
          designation: profileFields.designation || 'Educator',
          department: profileFields.department || 'Academics',
          subjects: profileFields.subjects || [],
          qualification: profileFields.qualification || 'Certified Educator',
          experience: profileFields.experience || '10+ Years',
          bio: profileFields.bio || null,
          achievements: profileFields.achievements || [],
          photoUrl: profileFields.photoUrl || null,
          publicContactToggles: finalToggles,
          status: profileFields.status || 'PUBLISHED',
        },
        update: {
          ...safeData,
          publicContactToggles: finalToggles,
          status: profileFields.status || 'PUBLISHED',
        },
        select: {
          id: true,
          institutionCode: true,
          designation: true,
          department: true,
          subjects: true,
          qualification: true,
          experience: true,
          bio: true,
          achievements: true,
          photoUrl: true,
          publicContactToggles: true,
          status: true,
        },
      });

      return {
        ...upserted,
        name: name || user.username,
      };
    }

    // Standalone faculty profile creation or update without direct user foreign key
    const existing = await prisma.facultyProfile.findFirst({
      where: {
        institutionCode,
        department: profileFields.department,
        designation: profileFields.designation,
      },
    });

    if (existing) {
      const mergedToggles = {
        ...((existing.publicContactToggles as object) || {}),
        ...finalToggles,
      };

      const updated = await prisma.facultyProfile.update({
        where: { id: existing.id },
        data: {
          ...safeData,
          publicContactToggles: mergedToggles,
          status: profileFields.status || 'PUBLISHED',
        },
        select: {
          id: true,
          institutionCode: true,
          designation: true,
          department: true,
          subjects: true,
          qualification: true,
          experience: true,
          bio: true,
          achievements: true,
          photoUrl: true,
          publicContactToggles: true,
          status: true,
        },
      });

      return {
        ...updated,
        name: name || (mergedToggles as any).name || (mergedToggles as any).fullName,
      };
    }

    const created = await prisma.facultyProfile.create({
      data: {
        institutionId: inst?.id || 'default-inst',
        institutionCode: institutionCode,
        designation: profileFields.designation || 'Educator',
        department: profileFields.department || 'Academics',
        subjects: profileFields.subjects || [],
        qualification: profileFields.qualification || 'Certified Educator',
        experience: profileFields.experience || '10+ Years',
        bio: profileFields.bio || null,
        achievements: profileFields.achievements || [],
        photoUrl: profileFields.photoUrl || null,
        publicContactToggles: finalToggles,
        status: profileFields.status || 'PUBLISHED',
      },
      select: {
        id: true,
        institutionCode: true,
        designation: true,
        department: true,
        subjects: true,
        qualification: true,
        experience: true,
        bio: true,
        achievements: true,
        photoUrl: true,
        publicContactToggles: true,
        status: true,
      },
    });

    return {
      ...created,
      name: name || (finalToggles as any).name || (finalToggles as any).fullName,
    };
  }

  async adminListAll() {
    return prisma.facultyProfile.findMany({
      orderBy: [{ institutionCode: 'asc' }, { order: 'asc' }],
      select: {
        id: true,
        institutionCode: true,
        designation: true,
        department: true,
        subjects: true,
        qualification: true,
        experience: true,
        photoUrl: true,
        status: true,
        order: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
  }

  async adminUpdateStatus(id: string, status: FacultyStatus) {
    return prisma.facultyProfile.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
  }
}
