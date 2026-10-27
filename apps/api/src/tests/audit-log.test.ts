import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { generateAccessToken } from '../lib/jwt.js';
import { prisma } from '@nirakar/db';

/**
 * The activity log.
 *
 * Changes made in the console are written to it, so that an administrator
 * can see what happened and who did it.
 */
describe('Activity log', () => {
  const app = createApp();

  let adminToken: string;
  let editorToken: string;

  /* The moment the test began, so that its cleanup removes only its own
     entries. */
  let startedAt = new Date();

  beforeAll(async () => {
    startedAt = new Date();

    const admin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true, email: true, username: true },
    });

    adminToken = generateAccessToken({
      sub: admin!.id,
      email: admin!.email,
      username: admin!.username,
      role: 'SUPER_ADMIN',
    });

    const editor = await prisma.user.upsert({
      where: { email: 'audit-editor@test.local' },
      update: {},
      create: {
        email: 'audit-editor@test.local',
        username: 'audit-editor-test',
        passwordHash: 'not-used-in-tests',
        role: 'EDITOR',
      },
      select: { id: true, email: true, username: true },
    });

    editorToken = generateAccessToken({
      sub: editor.id,
      email: editor.email,
      username: editor.username,
      role: 'EDITOR',
    });
  });

  afterAll(async () => {
    /* Only the entries this test wrote are removed. The log is a record
       of what really happened, so it is never cleared wholesale — the
       marker below marks the point from which this test's own entries
       begin. */
    await prisma.auditLog.deleteMany({
      where: {
        createdAt: { gte: startedAt },
        OR: [
          { user: { email: 'audit-editor@test.local' } },
          { action: 'UPDATE', entity: 'AccessSettings' },
        ],
      },
    });
    await prisma.user.deleteMany({ where: { email: 'audit-editor@test.local' } });
    await prisma.$disconnect();
    /* The database is remote and the test files run in parallel, so the
       cleanup needs longer than the default hook allows. */
  }, 30_000);

  it('refuses the log to somebody who is not signed in', async () => {
    const response = await request(app).get('/api/v1/audit-log');

    expect(response.status).toBe(401);
  });

  it('refuses the log to an editor', async () => {
    const response = await request(app)
      .get('/api/v1/audit-log')
      .set('Authorization', `Bearer ${editorToken}`);

    expect(response.status).toBe(403);
  });

  it('gives the log to an administrator', async () => {
    const response = await request(app)
      .get('/api/v1/audit-log')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.items)).toBe(true);
  });

  it('records a change made in the console', async () => {
    /* A change that the console makes — the supporter pricing settings.
       The values are read back afterwards so that the test does not
       disturb the ones the Society has set. */
    const before = await request(app).get('/api/v1/access/settings');
    const current = before.body.data;

    const update = await request(app)
      .put('/api/v1/access/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        minAmount: current.minAmount ?? 10,
        maxAmount: current.maxAmount ?? 1000,
        defaultAmount: current.defaultAmount ?? 100,
        snapStops: current.snapStops ?? [10, 20, 50],
        purposeText: current.purposeText ?? 'A purpose for the contribution.',
      });

    expect(update.status).toBe(200);

    /* The log is written in the background, so it is given a moment to
       land. */
    await new Promise((r) => setTimeout(r, 400));

    const log = await request(app)
      .get('/api/v1/audit-log')
      .set('Authorization', `Bearer ${adminToken}`);

    const entry = log.body.data.items.find(
      (e: any) => e.entity === 'AccessSettings' && e.action === 'UPDATE',
    );

    expect(entry).toBeTruthy();
    expect(entry.user.username).toBeTruthy();
  });

  it('filters the log by the kind of action', async () => {
    const response = await request(app)
      .get('/api/v1/audit-log')
      .query({ action: 'UPDATE' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(
      response.body.data.items.every((e: any) => e.action === 'UPDATE'),
    ).toBe(true);
  });

  it('offers the kinds of action, entity and author for the filters', async () => {
    const response = await request(app)
      .get('/api/v1/audit-log/facets')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data.actions)).toBe(true);
    expect(Array.isArray(response.body.data.entities)).toBe(true);
    expect(Array.isArray(response.body.data.authors)).toBe(true);
  });
});
