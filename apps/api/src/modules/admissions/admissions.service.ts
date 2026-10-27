import path from 'node:path';
import fs from 'node:fs';
import { prisma } from '@nirakar/db';
import { SubmitAdmissionInput, UpdateAdmissionConfigInput } from './admissions.validator.js';
import { broadcastAdmissionsUpdate } from '../../lib/socket.js';
import { PRIVATE_STORAGE_PATH } from '../../config/index.js';
import sharp from 'sharp';

export const INSTITUTION_NAMES: Record<string, string> = {
  NIRAKAR_HS: 'Shri Nirakar High School (Mashem)',
  ANGLE_HSS: 'S. S. Angle Higher Secondary School (Dapot, Canacona)',
  TUDAL_HS: 'Tudal High School (Gaondongrem)',
};

export class AdmissionsService {
  /**
   * Fetch current admission system configuration (Open flag, Academic Year, etc.)
   */
  async getConfig() {
    try {
      const config = await (prisma as any).admissionConfig.findUnique({
        where: { id: 'default' },
      });

      if (!config) {
        // Initialize default configuration
        return await (prisma as any).admissionConfig.create({
          data: {
            id: 'default',
            isOpen: true,
            academicYear: '2026–2027',
            announcementText:
              'Online Admissions Open for Academic Year 2026–2027 across Secondary & Higher Secondary campuses.',
          },
        });
      }

      return config;
    } catch (err) {
      console.error('[AdmissionsService] getConfig fallback error:', err);
      return {
        id: 'default',
        isOpen: true,
        academicYear: '2026–2027',
        announcementText:
          'Online Admissions Open for Academic Year 2026–2027 across Secondary & Higher Secondary campuses.',
      };
    }
  }

  /**
   * Admin can toggle admissions open/closed and edit the active academic year (e.g., 2026–2027 -> 2027–2028)
   */
  async updateConfig(input: UpdateAdmissionConfigInput) {
    const updated = await (prisma as any).admissionConfig.upsert({
      where: { id: 'default' },
      update: {
        isOpen: input.isOpen,
        academicYear: input.academicYear,
        announcementText: input.announcementText || null,
        announcementVisible: input.announcementVisible ?? true,
        guidelinesUrl: input.guidelinesUrl || null,
      },
      create: {
        id: 'default',
        isOpen: input.isOpen,
        academicYear: input.academicYear,
        announcementText: input.announcementText || null,
        announcementVisible: input.announcementVisible ?? true,
        guidelinesUrl: input.guidelinesUrl || null,
      },
    });

    // Instantly notify web visitors via Socket.IO
    broadcastAdmissionsUpdate(updated);

    return updated;
  }

  /**
   * Submit a new student admission application with strict sanitization and validation
   */
  async createApplication(input: SubmitAdmissionInput, ipAddress?: string) {
    const config = await this.getConfig();

    if (!config.isOpen) {
      throw new Error('Admissions are currently closed for the requested academic session.');
    }

    const institutionName = INSTITUTION_NAMES[input.institutionCode] || 'Shri Nirakar Education Society';

    // Generate unique sequential-style reference code e.g. SNES-2026-8341
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const yearPrefix = config.academicYear.substring(0, 4) || '2026';
    const applicationNumber = `SNES-${yearPrefix}-${randomSuffix}`;

    const application = await (prisma as any).admissionApplication.create({
      data: {
        applicationNumber,
        academicYear: config.academicYear,
        institutionCode: input.institutionCode,
        institutionName,
        gradeApplied: input.gradeApplied,
        stream: input.stream || null,
        studentName: input.studentName,
        dob: new Date(input.dob),
        gender: input.gender,
        placeOfBirth: input.placeOfBirth || null,
        nationality: input.nationality,
        motherTongue: input.motherTongue,
        aadhaarNumber: input.aadhaarNumber,
        category: input.category,
        bloodGroup: input.bloodGroup || null,
        fatherName: input.fatherName,
        fatherOccupation: input.fatherOccupation || null,
        motherName: input.motherName,
        motherOccupation: input.motherOccupation || null,
        primaryPhone: input.primaryPhone,
        alternatePhone: input.alternatePhone || null,
        email: input.email.toLowerCase().trim(),
        address: input.address,
        village: input.village,
        taluka: input.taluka,
        district: input.district,
        state: input.state,
        pincode: input.pincode,
        previousSchool: input.previousSchool || null,
        previousClass: input.previousClass || null,
        previousPercentage: input.previousPercentage ? Number(input.previousPercentage) : null,
        status: 'SUBMITTED',
        ipAddress: ipAddress || null,
      },
    });

    // Save uploaded candidate photo and signature to uploads/admissions if provided
    let photoUrl: string | null = null;
    let signatureUrl: string | null = null;

    if (input.photoData || input.signatureData) {
      try {
        const admissionsUploadsDir = path.resolve(PRIVATE_STORAGE_PATH, 'admissions');
        if (!fs.existsSync(admissionsUploadsDir)) {
          fs.mkdirSync(admissionsUploadsDir, { recursive: true });
        }

        if (input.photoData) {
          const buffer = await decodeImageData(input.photoData);
          const photoFileName = `${application.id}_photo.jpg`;
          const photoFilePath = path.join(admissionsUploadsDir, photoFileName);
          fs.writeFileSync(photoFilePath, buffer);
          photoUrl = `/api/v1/admissions/applications/${application.id}/media/photo`;
        }

        if (input.signatureData) {
          const buffer = await decodeImageData(input.signatureData);
          const signatureFileName = `${application.id}_signature.png`;
          const signatureFilePath = path.join(admissionsUploadsDir, signatureFileName);
          fs.writeFileSync(signatureFilePath, buffer);
          signatureUrl = `/api/v1/admissions/applications/${application.id}/media/signature`;
        }

        if (photoUrl || signatureUrl) {
          await (prisma as any).admissionApplication.update({
            where: { id: application.id },
            data: {
              adminRemarks: JSON.stringify({ photoUrl, signatureUrl }),
            },
          });
        }
      } catch (err) {
        console.warn('[AdmissionsService] Failed to persist uploaded photo/signature to disk:', err);
      }
    }

    return {
      ...application,
      photoUrl,
      signatureUrl,
    };
  }

  /**
   * List applications for admin review with filtering and search
   */
  async listApplications(filters: {
    search?: string;
    institutionCode?: string;
    status?: string;
    academicYear?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.min(100, Math.max(1, Number(filters.limit || 20)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.institutionCode && filters.institutionCode !== 'ALL') {
      where.institutionCode = filters.institutionCode;
    }

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }

    if (filters.academicYear) {
      where.academicYear = filters.academicYear;
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { studentName: { contains: q, mode: 'insensitive' } },
        { applicationNumber: { contains: q, mode: 'insensitive' } },
        { primaryPhone: { contains: q } },
        { aadhaarNumber: { contains: q } },
        { fatherName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      (prisma as any).admissionApplication.count({ where }),
      (prisma as any).admissionApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieve single application by ID or Reference Number
   */
  async getApplicationById(id: string) {
    const app = await (prisma as any).admissionApplication.findFirst({
      where: {
        OR: [{ id }, { applicationNumber: id }],
      },
    });

    if (!app) {
      throw new Error('Admission application not found');
    }

    // Attach candidate photo/signature URLs — disk is the source of truth
    const admissionsUploadsDir = path.resolve(PRIVATE_STORAGE_PATH, 'admissions');
    const photoOnDisk = fs.existsSync(path.join(admissionsUploadsDir, `${app.id}_photo.jpg`));
    const signatureOnDisk = fs.existsSync(path.join(admissionsUploadsDir, `${app.id}_signature.png`));

    return {
      ...app,
      photoUrl: photoOnDisk
        ? `/api/v1/admissions/applications/${app.id}/media/photo`
        : null,
      signatureUrl: signatureOnDisk
        ? `/api/v1/admissions/applications/${app.id}/media/signature`
        : null,
    };
  }

  async getApplicationMedia(id: string, kind: string) {
    if (kind !== 'photo' && kind !== 'signature') throw new Error('Application media not found');
    const app = await (prisma as any).admissionApplication.findFirst({
      where: { OR: [{ id }, { applicationNumber: id }] },
      select: { id: true, applicationNumber: true },
    });
    if (!app) throw new Error('Application media not found');

    const extension = kind === 'photo' ? 'jpg' : 'png';
    const mediaPath = path.resolve(PRIVATE_STORAGE_PATH, 'admissions', `${app.id}_${kind}.${extension}`);
    if (!fs.existsSync(mediaPath)) throw new Error('Application media not found');
    return {
      path: mediaPath,
      mimeType: kind === 'photo' ? 'image/jpeg' : 'image/png',
      filename: `Admission_${app.applicationNumber}_${kind}.${extension}`,
    };
  }

  /**
   * Update status and notes for an application.
   * Preserves photo/signature metadata stored in adminRemarks JSON.
   */
  async updateApplicationStatus(id: string, status: string, adminRemarks?: string | null) {
    const existing = await (prisma as any).admissionApplication.findUnique({ where: { id } });

    let mergedRemarks: string | null | undefined = adminRemarks || undefined;

    if (existing?.adminRemarks) {
      try {
        const parsed = JSON.parse(existing.adminRemarks);
        if (parsed && typeof parsed === 'object') {
          mergedRemarks = JSON.stringify({
            photoUrl: parsed.photoUrl ?? null,
            signatureUrl: parsed.signatureUrl ?? null,
            note: adminRemarks ?? parsed.note ?? null,
          });
        }
      } catch {
        // Legacy plain-text remarks — fall through to plain replacement
      }
    }

    return await (prisma as any).admissionApplication.update({
      where: { id },
      data: {
        status,
        adminRemarks: mergedRemarks,
      },
    });
  }

  /**
   * Export all applications as structured CSV for administrative records
   */
  async exportCsv(academicYear?: string) {
    const where: any = {};
    if (academicYear) where.academicYear = academicYear;

    const apps = await (prisma as any).admissionApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Application Number',
      'Date Submitted',
      'Academic Year',
      'Institution',
      'Grade Applied',
      'Stream',
      'Student Name',
      'DOB',
      'Gender',
      'Aadhaar Number',
      'Category',
      'Blood Group',
      "Father's Name",
      "Mother's Name",
      'Primary Phone',
      'Email',
      'Village',
      'Taluka',
      'Status',
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = apps.map((a: any) => [
      escapeCsv(a.applicationNumber),
      escapeCsv(new Date(a.createdAt).toISOString().split('T')[0]),
      escapeCsv(a.academicYear),
      escapeCsv(a.institutionName),
      escapeCsv(a.gradeApplied),
      escapeCsv(a.stream || 'N/A'),
      escapeCsv(a.studentName),
      escapeCsv(new Date(a.dob).toISOString().split('T')[0]),
      escapeCsv(a.gender),
      escapeCsv(a.aadhaarNumber),
      escapeCsv(a.category),
      escapeCsv(a.bloodGroup || 'N/A'),
      escapeCsv(a.fatherName),
      escapeCsv(a.motherName),
      escapeCsv(a.primaryPhone),
      escapeCsv(a.email),
      escapeCsv(a.village),
      escapeCsv(a.taluka),
      escapeCsv(a.status),
    ]);

    return [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
  }
}

async function decodeImageData(value: string): Promise<Buffer> {
  const match = value.match(/^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$/i);
  if (!match?.[2]) throw new Error('Uploaded image data is invalid.');
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0 || buffer.length > 2 * 1024 * 1024) throw new Error('Uploaded image is invalid or too large.');
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height || !metadata.format) throw new Error('Uploaded image is invalid.');
  return buffer;
}
