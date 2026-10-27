import { afterEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { privacyRoutes } from '../modules/privacy/privacy.routes.js';
import { generateAccessToken } from '../lib/jwt.js';

vi.mock('@nirakar/db', () => ({
  prisma: {
    privacyRequest: { create: vi.fn(), findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), update: vi.fn() },
    grievanceCase: { create: vi.fn(), findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    privacyConsentRecord: { create: vi.fn() },
    user: { findUnique: vi.fn() }, alumniProfile: { findUnique: vi.fn() }, facultyProfile: { findUnique: vi.fn() },
    post: { findMany: vi.fn() }, comment: { findMany: vi.fn() }, libraryVolumeReview: { findMany: vi.fn() }, magazineIssueReview: { findMany: vi.fn() },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  },
}));

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/api/v1/privacy', privacyRoutes);
app.use((error: any, _req: any, res: any, _next: any) => res.status(error.statusCode || 500).json({ error: { code: error.code, message: error.message } }));
const adminToken = () => generateAccessToken({ sub: 'admin-user', email: 'admin@example.test', role: 'ADMIN', username: 'admin' });
afterEach(() => vi.clearAllMocks());

describe('privacy and grievance workflow', () => {
  it('accepts a rights request and returns its reference', async () => {
    const { prisma } = await import('@nirakar/db');
    vi.mocked(prisma.privacyRequest.create).mockResolvedValue({ reference: 'PR-TEST1234', createdAt: new Date() } as never);
    const response = await request(app).post('/api/v1/privacy/requests').send({ name: 'Test User', email: 'test@example.test', requestType: 'ACCESS', details: 'Please provide my personal data.' });
    expect(response.status).toBe(201);
    expect(response.body.data.reference).toBe('PR-TEST1234');
  });

  it('creates a grievance and returns the one-time tracking code, storing only a hash', async () => {
    const { prisma } = await import('@nirakar/db');
    vi.mocked(prisma.grievanceCase.create).mockImplementation((async (args: { data: { reference?: string } }) => ({ reference: args.data.reference, createdAt: new Date() })) as never);
    const response = await request(app).post('/api/v1/privacy/grievances').send({ name: 'Test User', email: 'test@example.test', category: 'GENERAL', subject: 'A concern', description: 'This is a sample grievance for testing.' });
    expect(response.status).toBe(201);
    expect(response.body.data.trackingCode).toBeTruthy();
    const createArg = vi.mocked(prisma.grievanceCase.create).mock.calls[0][0] as any;
    expect(createArg.data.trackingTokenHash).not.toBe(response.body.data.trackingCode);
    expect(createArg.data.trackingTokenHash).toHaveLength(64);
  });

  it('does not reveal grievance details for an invalid tracking code', async () => {
    const { prisma } = await import('@nirakar/db');
    vi.mocked(prisma.grievanceCase.findFirst).mockResolvedValue(null);
    const response = await request(app).post('/api/v1/privacy/grievances/track').send({ reference: 'GR-TEST1234', trackingCode: 'x'.repeat(32) });
    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe('Tracking details were not recognized.');
  });

  it('requires an authorized staff session to list requests', async () => {
    expect((await request(app).get('/api/v1/privacy/admin/requests')).status).toBe(401);
    const reader = generateAccessToken({ sub: 'reader', email: 'reader@example.test', role: 'READER', username: 'reader' });
    expect((await request(app).get('/api/v1/privacy/admin/requests').set('Cookie', `accessToken=${reader}`)).status).toBe(403);
    expect((await request(app).get('/api/v1/privacy/admin/requests').set('Cookie', `accessToken=${adminToken()}`)).status).toBe(200);
  });
});
