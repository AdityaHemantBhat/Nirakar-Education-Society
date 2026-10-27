import { randomBytes, createHash } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@nirakar/db';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { contactLimiter } from '../../middleware/rate-limiter.js';
import { recordAudit } from '../../lib/audit.js';
import type { UserRole } from '@nirakar/shared';

const router = Router();

const asyncRoute = (handler: (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<unknown>) =>
  (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    void handler(req, res, next).catch(next);
  };
const requestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  requestType: z.enum(['ACCESS', 'CORRECTION', 'ERASURE', 'NOMINATION', 'GRIEVANCE']),
  details: z.string().trim().min(10).max(3000),
});
const consentSchema = z.object({
  purpose: z.enum(['CONTACT_RESPONSE', 'ADMISSIONS_PROCESSING', 'FACULTY_MESSAGES']),
  noticeVersion: z.literal('2026-10-24-v1'),
  action: z.enum(['GRANTED', 'WITHDRAWN']),
});
const grievanceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  category: z.enum(['GENERAL', 'ADMISSIONS', 'PRIVACY', 'SAFETY', 'DISCRIMINATION', 'OTHER']),
  subject: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(5000),
  restricted: z.boolean().default(false),
});
const trackingSchema = z.object({ reference: z.string().trim().min(8).max(64), trackingCode: z.string().min(32).max(128) });
const caseUpdateSchema = z.object({
  status: z.enum(['RECEIVED', 'UNDER_REVIEW', 'AWAITING_INFORMATION', 'RESOLVED', 'CLOSED']).optional(),
  assignedToUserId: z.string().trim().min(1).max(100).nullable().optional(),
  message: z.string().trim().min(1).max(3000).optional(),
  isInternal: z.boolean().default(true),
}).refine((value) => value.status || value.assignedToUserId !== undefined || value.message, 'At least one update is required');
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const staffRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];

router.post('/requests', contactLimiter, asyncRoute(async (req, res) => {
  const input = requestSchema.parse(req.body);
  const data = await prisma.privacyRequest.create({
    data: {
      name: input.name,
      email: input.email,
      type: input.requestType,
      details: input.details,
      reference: `PR-${randomBytes(8).toString('hex').toUpperCase()}`,
      events: { create: { kind: 'RECEIVED', message: 'Request received', isInternal: false } },
    },
    select: { reference: true, createdAt: true },
  });
  res.status(201).json({ success: true, data: { reference: data.reference, receivedAt: data.createdAt } });
}));

router.get('/admin/requests', authenticate, requireRole(...staffRoles), asyncRoute(async (_req, res) => {
  const items = await prisma.privacyRequest.findMany({
    orderBy: { createdAt: 'desc' }, take: 250,
    select: { id: true, reference: true, name: true, email: true, type: true, status: true, identityStatus: true, assignedToUserId: true, createdAt: true, updatedAt: true },
  });
  res.json({ success: true, data: items });
}));

router.get('/admin/requests/:id', authenticate, requireRole(...staffRoles), asyncRoute(async (req, res) => {
  const item = await prisma.privacyRequest.findUnique({ where: { id: req.params.id }, include: { events: { orderBy: { createdAt: 'asc' } } } });
  if (!item) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found.' } }); return; }
  recordAudit(req, { action: 'READ', entity: 'PrivacyRequest', entityId: item.id, summary: 'Viewed privacy request' });
  res.json({ success: true, data: { ...item, events: item.events.filter((event) => !event.isInternal || req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN') } });
}));

router.patch('/admin/requests/:id', authenticate, requireRole(...staffRoles), asyncRoute(async (req, res) => {
  const input = caseUpdateSchema.parse(req.body);
  const current = await prisma.privacyRequest.findUnique({ where: { id: req.params.id } });
  if (!current) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found.' } }); return; }
  const updates: Record<string, unknown> = {};
  if (input.status) updates.status = input.status;
  if (input.assignedToUserId !== undefined) updates.assignedToUserId = input.assignedToUserId;
  const item = await prisma.privacyRequest.update({ where: { id: current.id }, data: {
    ...updates,
    ...(input.message ? { events: { create: { actorUserId: req.user!.sub, kind: input.status ? 'RESPONSE' : 'NOTE', message: input.message, isInternal: input.isInternal } } } : {}),
  } });
  recordAudit(req, { action: 'UPDATE', entity: 'PrivacyRequest', entityId: item.id, summary: 'Updated privacy request' });
  res.json({ success: true, data: item });
}));

router.post('/grievances', contactLimiter, asyncRoute(async (req, res) => {
  const input = grievanceSchema.parse(req.body);
  const trackingCode = randomBytes(32).toString('base64url');
  const item = await prisma.grievanceCase.create({
    data: {
      reference: `GR-${randomBytes(8).toString('hex').toUpperCase()}`,
      trackingTokenHash: digest(trackingCode), name: input.name, email: input.email,
      category: input.category, subject: input.subject, description: input.description,
      restricted: input.restricted || input.category === 'SAFETY',
      events: { create: { kind: 'RECEIVED', message: 'Grievance received', isInternal: false } },
    }, select: { reference: true, createdAt: true },
  });
  res.status(201).json({ success: true, data: { reference: item.reference, trackingCode, receivedAt: item.createdAt } });
}));

router.post('/grievances/track', contactLimiter, asyncRoute(async (req, res) => {
  const input = trackingSchema.parse(req.body);
  const item = await prisma.grievanceCase.findFirst({ where: { reference: input.reference, trackingTokenHash: digest(input.trackingCode) }, select: { reference: true, status: true, category: true, subject: true, createdAt: true, updatedAt: true, events: { where: { isInternal: false }, orderBy: { createdAt: 'asc' }, select: { kind: true, message: true, createdAt: true } } } });
  if (!item) { res.status(404).json({ success: false, error: { code: 'CASE_NOT_FOUND', message: 'Tracking details were not recognized.' } }); return; }
  res.json({ success: true, data: item });
}));

router.get('/admin/grievances', authenticate, requireRole(...staffRoles), asyncRoute(async (req, res) => {
  const items = await prisma.grievanceCase.findMany({ where: req.user?.role === 'SUPER_ADMIN' ? {} : { restricted: false }, orderBy: { createdAt: 'desc' }, take: 250, select: { id: true, reference: true, name: true, email: true, category: true, subject: true, status: true, restricted: true, assignedToUserId: true, createdAt: true } });
  res.json({ success: true, data: items });
}));

router.get('/admin/grievances/:id', authenticate, requireRole(...staffRoles), asyncRoute(async (req, res) => {
  const item = await prisma.grievanceCase.findUnique({ where: { id: req.params.id }, select: { id: true, reference: true, name: true, email: true, category: true, subject: true, description: true, status: true, restricted: true, assignedToUserId: true, createdAt: true, updatedAt: true, events: { orderBy: { createdAt: 'asc' } } } });
  if (!item) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Grievance not found.' } }); return; }
  recordAudit(req, { action: 'READ', entity: 'GrievanceCase', entityId: item.id, summary: 'Viewed grievance case' });
  res.json({ success: true, data: { ...item, events: item.events.filter((event) => !event.isInternal || req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'ADMIN') } });
}));

router.patch('/admin/grievances/:id', authenticate, requireRole(...staffRoles), asyncRoute(async (req, res) => {
  const input = caseUpdateSchema.parse(req.body);
  const current = await prisma.grievanceCase.findUnique({ where: { id: req.params.id } });
  if (!current) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Grievance not found.' } }); return; }
  const updated = await prisma.grievanceCase.update({ where: { id: current.id }, data: {
    ...(input.status ? { status: input.status } : {}),
    ...(input.assignedToUserId !== undefined ? { assignedToUserId: input.assignedToUserId } : {}),
    ...(input.message ? { events: { create: { actorUserId: req.user!.sub, kind: input.status ? 'RESPONSE' : 'NOTE', message: input.message, isInternal: input.isInternal } } } : {}),
  }, select: { id: true, reference: true, status: true, assignedToUserId: true, updatedAt: true } });
  recordAudit(req, { action: 'UPDATE', entity: 'GrievanceCase', entityId: updated.id, summary: 'Updated grievance case' });
  res.json({ success: true, data: updated });
}));

router.post('/consent', asyncRoute(async (req, res) => {
  const input = consentSchema.parse(req.body);
  const subjectKey = req.user?.sub ?? req.cookies?.nirakar_privacy_id;
  if (!subjectKey) {
    res.status(400).json({ error: { code: 'IDENTIFIER_REQUIRED', message: 'Privacy preference identifier is missing.' } });
    return;
  }
  const data = await prisma.privacyConsentRecord.create({
    data: {
      subjectKey,
      purpose: input.purpose,
      noticeVersion: input.noticeVersion,
      action: input.action,
      channel: req.user ? 'AUTHENTICATED_WEB' : 'PUBLIC_WEB',
    },
    select: { id: true, action: true, createdAt: true },
  });
  res.status(201).json({ success: true, data });
}));

router.get('/me/export', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.sub;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, username: true, role: true, createdAt: true } });
    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User account was not found.' } });
      return;
    }
    const [alumniProfile, facultyProfile, posts, comments, libraryReviews] = await Promise.all([
      prisma.alumniProfile.findUnique({ where: { userId } }),
      prisma.facultyProfile.findUnique({ where: { userId } }),
      prisma.post.findMany({ where: { authorId: userId } }),
      prisma.comment.findMany({ where: { email: user.email } }),
      prisma.libraryVolumeReview.findMany({ where: { userId } }),
    ]);
    const magazineReviews = await prisma.magazineIssueReview.findMany({ where: { userId } }).catch((error: unknown) => {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') return [];
      throw error;
    });
    res.json({ success: true, data: { user, alumniProfile, facultyProfile, posts, comments, libraryReviews, magazineReviews } });
  } catch (error) {
    next(error);
  }
});

export { router as privacyRoutes };
