import path from 'node:path';
import fs from 'node:fs';
import { prisma } from '@nirakar/db';
import { SubmitAdmissionInput, UpdateAdmissionConfigInput } from './admissions.validator.js';
import { broadcastAdmissionsUpdate } from '../../lib/socket.js';

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
        guidelinesUrl: input.guidelinesUrl || null,
      },
      create: {
        id: 'default',
        isOpen: input.isOpen,
        academicYear: input.academicYear,
        announcementText: input.announcementText || null,
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

    const institutionName = INSTITUTION_NAMES[input.institutionCode] || 'Shree Nirakar Education Society';

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
        const admissionsUploadsDir = path.resolve('./uploads/admissions');
        if (!fs.existsSync(admissionsUploadsDir)) {
          fs.mkdirSync(admissionsUploadsDir, { recursive: true });
        }

        if (input.photoData) {
          const match = input.photoData.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
          const buffer = match && match[2] ? Buffer.from(match[2], 'base64') : Buffer.from(input.photoData, 'base64');
          const photoFileName = `${application.id}_photo.jpg`;
          const photoFilePath = path.join(admissionsUploadsDir, photoFileName);
          fs.writeFileSync(photoFilePath, buffer);
          photoUrl = `/uploads/admissions/${photoFileName}`;
        }

        if (input.signatureData) {
          const match = input.signatureData.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
          const buffer = match && match[2] ? Buffer.from(match[2], 'base64') : Buffer.from(input.signatureData, 'base64');
          const signatureFileName = `${application.id}_signature.png`;
          const signatureFilePath = path.join(admissionsUploadsDir, signatureFileName);
          fs.writeFileSync(signatureFilePath, buffer);
          signatureUrl = `/uploads/admissions/${signatureFileName}`;
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

    return app;
  }

  /**
   * Update status and notes for an application
   */
  async updateApplicationStatus(id: string, status: string, adminRemarks?: string | null) {
    return await (prisma as any).admissionApplication.update({
      where: { id },
      data: {
        status,
        adminRemarks: adminRemarks || undefined,
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
