import fs from 'node:fs';
import path from 'node:path';
import argon2 from 'argon2';
import { FacultyRepository } from './faculty.repository.js';
import { AppError } from '../../middleware/error.js';
import { FacultyProfileUpdateInput } from '@nirakar/shared';
import { prisma } from '@nirakar/db';

export interface PendingFacultyApplication {
  id: string;
  name: string;
  username?: string;
  bio?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  employeeCode: string;
  institutionCode: string;
  institutionName: string;
  department: string;
  qualification: string;
  experienceYears: number;
  experience: string;
  subjects: string[];
  appliedAt: string;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
}

const DEFAULT_DEPARTMENTS = [
  'Science & Laboratories',
  'Mathematics & Computer Science',
  'Languages & Literature',
  'Commerce & Economics',
  'Social Sciences & Humanities',
  'Vocational Studies & Ecology',
  'Athletics & Physical Education',
  'Administration & Governance',
];

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PENDING_FILE = path.join(DATA_DIR, 'pending_faculty.json');
const DEPTS_FILE = path.join(DATA_DIR, 'departments.json');
const CANONICAL_FILE = path.join(DATA_DIR, 'canonical_faculty.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readCanonicalFaculty(): any[] {
  ensureDataDir();
  try {
    if (fs.existsSync(CANONICAL_FILE)) {
      const content = fs.readFileSync(CANONICAL_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading canonical_faculty.json:', e);
  }
  return [];
}

function readPendingApps(): PendingFacultyApplication[] {
  ensureDataDir();
  try {
    if (fs.existsSync(PENDING_FILE)) {
      const content = fs.readFileSync(PENDING_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading pending_faculty.json:', e);
  }
  return [];
}

function writePendingApps(apps: PendingFacultyApplication[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(PENDING_FILE, JSON.stringify(apps, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing pending_faculty.json:', e);
  }
}

function readDepartments(): string[] {
  ensureDataDir();
  try {
    if (fs.existsSync(DEPTS_FILE)) {
      const content = fs.readFileSync(DEPTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading departments.json:', e);
  }
  return DEFAULT_DEPARTMENTS;
}

function writeDepartments(depts: string[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(DEPTS_FILE, JSON.stringify(depts, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing departments.json:', e);
  }
}

function toSlug(str: string): string {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class FacultyService {
  constructor(private repo = new FacultyRepository()) {}

  async listPublished(institutionCode?: any, search?: string) {
    const list = await this.repo.findByInstitution(institutionCode);
    const mapped = list.map((f: any) => {
      const toggles = (f.publicContactToggles || {}) as any;
      const name =
        toggles.name ||
        toggles.fullName ||
        (toggles.firstName && toggles.lastName ? `${toggles.firstName} ${toggles.lastName}` : '') ||
        f.name ||
        f.fullName ||
        (f.user?.username ? (f.user.username.charAt(0).toUpperCase() + f.user.username.slice(1)) : '') ||
        (toggles.email ? toggles.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '') ||
        'Faculty Member';
      return {
        ...f,
        name,
        institutionName: f.institution?.name || f.institutionCode,
      };
    });

    if (!search) return mapped;
    const q = search.toLowerCase();
    return mapped.filter((f: any) =>
      f.name?.toLowerCase().includes(q) ||
      f.department?.toLowerCase().includes(q) ||
      f.designation?.toLowerCase().includes(q) ||
      (Array.isArray(f.subjects) && f.subjects.some((s: string) => s.toLowerCase().includes(q)))
    );
  }

  async getMyProfile(userId: string) {
    const profile = await this.repo.findByUserId(userId);
    if (!profile) {
      throw new AppError('NOT_FOUND', 'Faculty profile not registered', 404);
    }
    return profile;
  }

  async updateMyProfile(userId: string, input: FacultyProfileUpdateInput) {
    return this.repo.updateOwnProfile(userId, input);
  }

  async adminList() {
    return this.repo.adminListAll();
  }

  async adminApproveReject(id: string, status: any) {
    return this.repo.adminUpdateStatus(id, status);
  }

  // ==================== NEW DYNAMIC REGISTRATION & QUEUE ====================

  async registerApplicant(data: any): Promise<PendingFacultyApplication> {
    const firstName = data.firstName?.trim() || '';
    const lastName = data.lastName?.trim() || '';
    const fullName = data.name?.trim() || `${firstName} ${lastName}`.trim() || 'Faculty Member';
    const username = data.username?.trim() || fullName;
    const bio = data.bio?.trim() || '';
    const email = (data.email?.trim() || '').toLowerCase();
    const phone = data.phone?.trim() || '';
    const employeeCode = data.employeeCode?.trim() || `NES-FAC-${Math.floor(1000 + Math.random() * 9000)}`;
    const institutionCode = data.institutionCode || 'NIRAKAR_HS';
    const institutionName =
      data.institutionName ||
      (institutionCode === 'NIRAKAR_HS'
        ? 'Shri Nirakar Vidyalaya'
        : institutionCode === 'TUDAL_HS'
        ? 'Tudal High School'
        : 'S. S. Angle Higher Secondary School');
    const department = data.department || 'Science & Laboratories';
    const qualification = data.qualification || 'Certified Educator';
    const experienceYears = Number(data.experienceYears) || 1;
    const experience = data.experience || `${experienceYears} Years`;
    const subjects = Array.isArray(data.subjects)
      ? data.subjects
      : typeof data.subjects === 'string'
      ? data.subjects.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const newApp: PendingFacultyApplication = {
      id: `fac-app-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name: fullName,
      username,
      bio,
      firstName,
      lastName,
      email,
      phone,
      employeeCode,
      institutionCode,
      institutionName,
      department,
      qualification,
      experienceYears,
      experience,
      subjects,
      appliedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    // 1. Save to JSON store
    const existing = readPendingApps();
    const filtered = existing.filter((a) => a.email !== email);
    filtered.unshift(newApp);
    writePendingApps(filtered);

    // 2. Try to sync to DB if available
    try {
      let inst = await prisma.institution.findFirst({ where: { code: institutionCode as any } });
      if (!inst) inst = await prisma.institution.findFirst();

      let user = email ? await prisma.user.findFirst({ where: { email } }) : null;
      if (!user && data.password && email) {
        const passwordHash = await argon2.hash(data.password);
        user = await prisma.user.create({
          data: {
            email,
            username,
            passwordHash,
            role: 'FACULTY',
          },
        });
      }

      if (inst) {
        await prisma.facultyProfile.create({
          data: {
            userId: user?.id || null,
            institutionId: inst.id,
            institutionCode: institutionCode as any,
            designation: data.designation || 'Faculty Member',
            department,
            subjects,
            qualification,
            experience,
            bio: bio || null,
            status: 'PENDING' as any,
            publicContactToggles: { name: fullName, username, firstName, lastName, email, phone, employeeCode },
          },
        });
      }
    } catch (err) {
      console.warn('Database faculty profile sync note:', err);
    }

    return newApp;
  }

  async getPendingApplicants(): Promise<PendingFacultyApplication[]> {
    const fileApps = readPendingApps().filter((a) => a.status === 'PENDING');

    try {
      const dbPending = await prisma.facultyProfile.findMany({
        where: { status: 'PENDING' },
        include: { user: true, institution: true },
      });

      for (const p of dbPending) {
        const email = p.user?.email || (p.publicContactToggles as any)?.email;
        if (email && !fileApps.some((a) => a.email === email)) {
          fileApps.push({
            id: p.id,
            name: p.user?.username || 'Faculty Member',
            email: email || '',
            phone: (p.publicContactToggles as any)?.phone || '',
            employeeCode: (p.publicContactToggles as any)?.employeeCode || 'NES-FAC',
            institutionCode: p.institutionCode,
            institutionName: p.institution?.name || p.institutionCode,
            department: p.department,
            qualification: p.qualification,
            experienceYears: parseInt(p.experience) || 5,
            experience: p.experience,
            subjects: p.subjects,
            appliedAt: p.createdAt.toISOString(),
            status: 'PENDING',
          });
        }
      }
    } catch (e) {
      // DB query fallback
    }

    return fileApps;
  }

  async approveApplicant(id: string) {
    const apps = readPendingApps();
    const appIndex = apps.findIndex((a) => a.id === id);
    const target = appIndex !== -1 ? apps[appIndex] : null;

    if (target) {
      target.status = 'PUBLISHED';
      apps.splice(appIndex, 1);
      writePendingApps(apps);
    }

    // Update or upsert published faculty in DB
    try {
      if (target) {
        let inst = await prisma.institution.findFirst({ where: { code: target.institutionCode as any } });
        if (!inst) inst = await prisma.institution.findFirst();

        const user = target.email ? await prisma.user.findFirst({ where: { email: target.email } }) : null;

        await prisma.facultyProfile.upsert({
          where: user ? { userId: user.id } : { id },
          create: {
            userId: user?.id || null,
            institutionId: inst?.id || 'default-inst',
            institutionCode: target.institutionCode as any,
            designation: 'Faculty Member',
            department: target.department,
            subjects: target.subjects,
            qualification: target.qualification,
            experience: target.experience,
            status: 'PUBLISHED',
            publicContactToggles: {
              name: target.name || `${target.firstName || ''} ${target.lastName || ''}`.trim(),
              firstName: target.firstName,
              lastName: target.lastName,
              email: target.email,
              phone: target.phone,
              employeeCode: target.employeeCode,
            },
          },
          update: {
            status: 'PUBLISHED',
            publicContactToggles: {
              name: target.name || `${target.firstName || ''} ${target.lastName || ''}`.trim(),
              firstName: target.firstName,
              lastName: target.lastName,
              email: target.email,
              phone: target.phone,
              employeeCode: target.employeeCode,
            },
          },
        });
      } else {
        await prisma.facultyProfile.update({
          where: { id },
          data: { status: 'PUBLISHED' },
        });
      }
    } catch (err) {
      console.warn('Database approve sync warn:', err);
    }

    return { success: true, id };
  }

  async rejectApplicant(id: string) {
    const apps = readPendingApps();
    const updated = apps.filter((a) => a.id !== id);
    writePendingApps(updated);

    try {
      await prisma.facultyProfile.update({
        where: { id },
        data: { status: 'DRAFT' },
      }).catch(() => null);
    } catch {}

    return { success: true, id };
  }

  async deleteFaculty(id: string) {
    // 1. Remove from database
    try {
      await prisma.facultyProfile.delete({
        where: { id },
      }).catch(async () => {
        // Fallback: if foreign key prevents hard delete, mark status as DRAFT/ARCHIVED
        await prisma.facultyProfile.updateMany({
          where: { OR: [{ id }, { userId: id }] },
          data: { status: 'DRAFT' as any },
        });
      });
    } catch (e) {
      console.warn('DB delete warning:', e);
    }

    // 2. Remove from pending queue if present
    try {
      const apps = readPendingApps();
      const filtered = apps.filter((a) => a.id !== id);
      writePendingApps(filtered);
    } catch {}

    return { success: true, id };
  }

  getDepartments(): string[] {
    return readDepartments();
  }

  saveDepartments(depts: string[]): string[] {
    const clean = Array.from(new Set(depts.map((d) => d.trim()).filter(Boolean)));
    writeDepartments(clean.length > 0 ? clean : DEFAULT_DEPARTMENTS);
    return clean.length > 0 ? clean : DEFAULT_DEPARTMENTS;
  }

  async getById(id: string) {
    const normId = (id || '').trim().toLowerCase();
    const slugId = toSlug(normId);
    if (!normId) return null;

    // 1. Try finding in database
    try {
      let p = await prisma.facultyProfile.findFirst({
        where: { OR: [{ id }, { userId: id }] },
        include: { user: true, institution: true },
      });

      // If not found by direct ID, check if id is a slug or seed ID (e.g. fac-1)
      if (!p) {
        const canonical = readCanonicalFaculty();
        const seedMatch = canonical.find(
          (c) =>
            c.id.toLowerCase() === normId ||
            toSlug(c.name) === slugId ||
            toSlug(c.name.replace(/^(Mr\.|Mrs\.|Dr\.|Prof\.|Shri|Smt\.)\s+/i, '')) === slugId
        );

        const allDb = await prisma.facultyProfile.findMany({
          include: { user: true, institution: true },
        });

        // Try matching DB profile by toggles.name, user.username, email, or seed correspondence
        p = allDb.find((item) => {
          const toggles = (item.publicContactToggles || {}) as any;
          const tName = toggles.name || toggles.fullName || item.user?.username || '';
          const tSlug = toSlug(tName);
          const tCleanSlug = toSlug(tName.replace(/^(Mr\.|Mrs\.|Dr\.|Prof\.|Shri|Smt\.)\s+/i, ''));

          if (tSlug && (tSlug === slugId || tCleanSlug === slugId || slugId.includes(tCleanSlug) || tCleanSlug.includes(slugId))) {
            return true;
          }
          if (toggles.email && toggles.email.toLowerCase() === normId) return true;
          if (item.user?.email && item.user.email.toLowerCase() === normId) return true;
          if (seedMatch) {
            if (seedMatch.email && toggles.email && toggles.email.toLowerCase() === seedMatch.email.toLowerCase()) return true;
            if (seedMatch.name && tName && (tSlug === toSlug(seedMatch.name) || tName.toLowerCase().includes(seedMatch.name.toLowerCase()))) return true;
            if (seedMatch.isHead && toggles.isHead && item.institutionCode === seedMatch.institutionCode) return true;
          }
          return false;
        }) || null;
      }

      if (p) {
        const toggles = (p.publicContactToggles || {}) as any;
        const name =
          toggles.name ||
          toggles.fullName ||
          (toggles.firstName && toggles.lastName ? `${toggles.firstName} ${toggles.lastName}` : '') ||
          (p.user?.username ? (p.user.username.charAt(0).toUpperCase() + p.user.username.slice(1)) : '') ||
          (toggles.email ? toggles.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '') ||
          'Faculty Member';
        return {
          id: p.id,
          name,
          designation: p.designation || 'Faculty Member',
          department: p.department || 'General Academics',
          institutionCode: p.institutionCode,
          institutionName: p.institution?.name || p.institutionCode,
          qualification: p.qualification || 'Certified Educator',
          experience: p.experience || '10+ Years',
          subjects: Array.isArray(p.subjects) ? p.subjects : [],
          bio: p.bio || '',
          photoUrl: p.photoUrl || '',
          achievements: Array.isArray(p.achievements) ? p.achievements : [],
          status: p.status,
          publicContactToggles: p.publicContactToggles,
          email: toggles.showEmail !== false ? (toggles.email || p.user?.email) : undefined,
          phone: toggles.showPhone !== false ? toggles.phone : undefined,
          isHead: Boolean(toggles.isHead),
        };
      }
    } catch (e) {
      console.warn('DB getById fallback warning:', e);
    }

    // 2. Try pending file
    const apps = readPendingApps();
    const app = apps.find((a) => a.id === id || a.email?.toLowerCase() === normId);
    if (app) {
      return {
        id: app.id,
        name: app.name || `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Faculty Member',
        designation: 'Faculty Member',
        department: app.department || 'General Academics',
        institutionCode: app.institutionCode,
        institutionName: app.institutionName,
        qualification: app.qualification || 'Certified Educator',
        experience: app.experience || '10+ Years',
        subjects: app.subjects || [],
        status: app.status || 'PENDING',
        email: app.email,
        phone: app.phone,
      };
    }

    // 3. Fallback to canonical seed file
    const canonical = readCanonicalFaculty();
    const cMatch = canonical.find(
      (c) =>
        c.id.toLowerCase() === normId ||
        toSlug(c.name) === slugId ||
        toSlug(c.name.replace(/^(Mr\.|Mrs\.|Dr\.|Prof\.|Shri|Smt\.)\s+/i, '')) === slugId
    );
    if (cMatch) {
      return {
        ...cMatch,
        status: 'PUBLISHED',
      };
    }

    return null;
  }


  // ==================== FACULTY ORDERING ====================

  async saveFacultyOrder(facultyIds: string[]) {
    const publishedFaculty = await prisma.facultyProfile.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, order: true },
      orderBy: { order: 'asc' },
    });
    const publishedIds = new Set(publishedFaculty.map((faculty) => faculty.id));
    const unknownIds = facultyIds.filter((id) => !publishedIds.has(id));
    if (unknownIds.length > 0) {
      throw new AppError('BAD_REQUEST', 'Order contains faculty records that are not published.', 400);
    }

    const orderedIds = [
      ...facultyIds,
      ...publishedFaculty
        .filter((faculty) => !facultyIds.includes(faculty.id))
        .map((faculty) => faculty.id),
    ];
    await prisma.$transaction(
      orderedIds.map((id, order) =>
        prisma.facultyProfile.update({
          where: { id },
          data: { order },
        })
      )
    );

    const ORDER_FILE = path.join(path.resolve(process.cwd(), 'data'), 'faculty_order.json');
    const dataDir = path.dirname(ORDER_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const updatedAt = new Date().toISOString();
    fs.writeFileSync(ORDER_FILE, JSON.stringify({ facultyIds: orderedIds, updatedAt }, null, 2), 'utf-8');
    return { facultyIds: orderedIds, updatedAt };
  }

  async getFacultyOrder() {
    const ORDER_FILE = path.join(path.resolve(process.cwd(), 'data'), 'faculty_order.json');
    try {
      if (fs.existsSync(ORDER_FILE)) {
        const content = fs.readFileSync(ORDER_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed && Array.isArray(parsed.facultyIds)) {
          return parsed.facultyIds;
        }
      }
    } catch (e) {
      console.warn('Error reading faculty_order.json:', e);
    }
    return [];
  }
}