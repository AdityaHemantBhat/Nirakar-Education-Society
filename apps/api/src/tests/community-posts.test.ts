import { afterEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { communityPostsRoutes } from '../modules/community-posts/community-posts.routes.js';
import { generateAccessToken } from '../lib/jwt.js';

vi.mock('@nirakar/db', () => ({
  prisma: {
    post: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    media: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn() },
  },
}));

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/api/v1/community-posts', communityPostsRoutes);
app.use((error: any, _req: any, res: any, _next: any) => res.status(error.statusCode || 500).json({ error: { code: error.code, message: error.message } }));

afterEach(() => vi.clearAllMocks());

describe('alumni community posts authorization', () => {
  it('requires authentication for feed reads', async () => {
    const response = await request(app).get('/api/v1/community-posts/feed');
    expect(response.status).toBe(401);
  });

  it('requires an alumni role even when the token is elevated', async () => {
    const token = generateAccessToken({ sub: 'admin-user', email: 'admin@example.test', role: 'SUPER_ADMIN', username: 'admin' });
    const response = await request(app).get('/api/v1/community-posts/feed').set('Cookie', `accessToken=${token}`);
    expect(response.status).toBe(403);
  });

  it('allows an authenticated alumni to read the empty feed', async () => {
    const token = generateAccessToken({ sub: 'alumni-user', email: 'alumni@example.test', role: 'ALUMNI', username: 'alumni' });
    const response = await request(app).get('/api/v1/community-posts/feed').set('Cookie', `accessToken=${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });
});
