import { AlumniRepository } from './alumni.repository.js';
import { AppError } from '../../middleware/error.js';
import { AlumniProfileUpdateInput } from '@nirakar/shared';

export class AlumniService {
  constructor(private repo = new AlumniRepository()) {}

  async listDirectory(params: any) {
    const result = await this.repo.findDirectoryProfiles(params);
    return {
      ...result,
      records: result.records.map((profile: any) => {
        const visibility = (profile.visibilitySettings as Record<string, string> | null) || {};
        return {
          ...profile,
          city: !visibility.city || visibility.city === 'PUBLIC' ? profile.city : null,
          occupation: !visibility.occupation || visibility.occupation === 'PUBLIC' ? profile.occupation : null,
        };
      }),
    };
  }

  async listAdminDirectory(search?: string) {
    return this.repo.findAdminDirectoryProfiles(search?.trim() || undefined);
  }

  async setAdminVerification(profileId: string, level: 'UNVERIFIED' | 'VERIFIED' | 'TRUSTED') {
    return this.repo.setVerificationLevel(profileId, level);
  }

  async deleteAdminAlumni(profileId: string) {
    const deletedProfile = await this.repo.deleteAdminAlumni(profileId);
    if (!deletedProfile) {
      throw new AppError('NOT_FOUND', 'Alumni profile not found', 404);
    }
    return deletedProfile;
  }

  async getProfile(username: string, viewer?: { userId?: string; role?: string }) {
    const profile = await this.repo.findByUsername(username);
    if (!profile) {
      throw new AppError('NOT_FOUND', 'Alumni profile not found', 404);
    }

    const isOwner = viewer?.userId === profile.userId;
    const isAlumni = viewer?.role === 'ALUMNI' || viewer?.role === 'SUPER_ADMIN' || viewer?.role === 'ADMIN';

    // Apply per-field privacy controls (default to PUBLIC unless explicitly set to ALUMNI_ONLY or PRIVATE)
    const vis = (profile.visibilitySettings as Record<string, string>) || {};
    const isVisible = (setting?: string) => {
      if (isOwner) return true;
      if (!setting || setting === 'PUBLIC') return true;
      if (setting === 'ALUMNI_ONLY') return isAlumni;
      return false; // PRIVATE
    };

    const filtered = {
      id: profile.id,
      username: profile.user.username,
      firstName: profile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName,
      school: profile.school,
      batchYear: profile.batchYear,
      photoUrl: profile.photoUrl,
      verificationLevel: profile.verificationLevel,
      city: isVisible(vis.city) ? profile.city : null,
      occupation: isVisible(vis.occupation) ? profile.occupation : null,
      bio: isVisible(vis.bio) ? profile.bio : null,
      socialLinks: isVisible(vis.socialLinks) ? profile.socialLinks : [],
      familyMembers: isVisible(vis.family) ? profile.familyMembers : [],
      galleryPhotos: isVisible(vis.gallery) ? profile.galleryPhotos : [],
      vouches: profile.vouches,
      isOwner,
    };

    return filtered;
  }

  async getOwnProfile(userId: string) {
    const profile = await this.repo.findByUserId(userId);
    if (!profile) {
      throw new AppError('NOT_FOUND', 'Alumni profile does not exist', 404);
    }
    return profile;
  }

  async updateOwnProfile(userId: string, input: AlumniProfileUpdateInput) {
    const current = await this.repo.findByUserId(userId);
    if (!current) {
      throw new AppError('NOT_FOUND', 'Alumni profile does not exist', 404);
    }

    return this.repo.updateProfile(current.id, {
      firstName: input.firstName,
      middleName: input.middleName || null,
      lastName: input.lastName,
      photoUrl: input.photoUrl,
      bio: input.bio,
      city: input.city,
      occupation: input.occupation,
      socialLinks: input.socialLinks as any,
      visibilitySettings: input.visibilitySettings as any,
      galleryPhotos: input.galleryPhotos,
    });
  }

  async vouchForAlumni(voucherUserId: string, targetProfileId: string, note?: string) {
    // Voucher must be verified alumni
    const voucherData = await this.repo.exportAlumniData(voucherUserId);
    if (!voucherData?.alumniProfile || voucherData.alumniProfile.verificationLevel === 'UNVERIFIED') {
      throw new AppError('FORBIDDEN', 'Only verified alumni may vouch for other members', 403);
    }

    if (voucherData.alumniProfile.id === targetProfileId) {
      throw new AppError('BAD_REQUEST', 'You cannot vouch for your own profile', 400);
    }

    await this.repo.createVouch(voucherUserId, targetProfileId, note);

    // If target now has >= 2 vouches and is VERIFIED, elevate to TRUSTED
    const vouchCount = await this.repo.countVouchesForProfile(targetProfileId);
    if (vouchCount >= 2) {
      await this.repo.setVerificationLevel(targetProfileId, 'TRUSTED', 'Elevated to TRUSTED following peer vouches');
    }

    return { success: true, message: 'Alumni vouch submitted successfully' };
  }

  async reportProfile(reporterUserId: string, targetProfileId: string, reason: string) {
    await this.repo.createReport(reporterUserId, targetProfileId, reason);
    return { success: true, message: 'Report submitted for administrative review' };
  }

  async exportData(userId: string) {
    return this.repo.exportAlumniData(userId);
  }

  async deleteData(userId: string) {
    await this.repo.deleteAlumniData(userId);
    return { success: true, message: 'Your personal data has been erased in accordance with DPDP Act 2023' };
  }
}
