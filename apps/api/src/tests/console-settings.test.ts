import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { generateAccessToken } from '../lib/jwt.js';
import { prisma } from '@nirakar/db';

/**
 * The console's own settings.
 *
 * The sign-in address is the important one: an administrator can move the
 * sign-in page, and the address has to be validated, stored and read back
 * without a redeploy.
 */
describe('Console settings', () => {
  const app = createApp();

  let adminToken: string;
  let editorToken: string;

  beforeAll(async () => {
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

    /* An editor may change their own password but not the console's
       settings. This account is the settings test's own, so that it does
       not share an account with another test file. */
    const editor = await prisma.user.upsert({
      where: { email: 'console-editor@test.local' },
      update: {},
      create: {
        email: 'console-editor@test.local',
        username: 'console-editor-test',
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
    /* The settings this test wrote are taken back out, so that a real
       administrator's own settings are not disturbed. */
    await prisma.siteSetting.deleteMany({
      where: {
        key: {
          in: [
            'console.adminLoginPath',
            'console.sessionLengthHours',
            'console.auditRetentionDays',
            'console.logSignIns',
            'console.showAccountEmail',
          ],
        },
      },
    });
    await prisma.user.deleteMany({ where: { email: 'console-editor@test.local' } });
    await prisma.$disconnect();
    /* The database is remote and the test files run in parallel, so the
       cleanup needs longer than the default hook allows. */
  }, 30_000);

  it('reports where the sign-in page lives, without a session', async () => {
    const response = await request(app).get('/api/v1/settings/login-path');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(typeof response.body.data.path).toBe('string');
  });

  it('refuses to show the console settings to somebody who is not signed in', async () => {
    const response = await request(app).get('/api/v1/settings/console');

    expect(response.status).toBe(401);
  });

  it('gives the settings to an administrator', async () => {
    const response = await request(app)
      .get('/api/v1/settings/console')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.adminLoginPath).toBeTruthy();
    expect(response.body.data.sessionLengthHours).toBeGreaterThan(0);
  });

  it('refuses the settings to an editor', async () => {
    const response = await request(app)
      .get('/api/v1/settings/console')
      .set('Authorization', `Bearer ${editorToken}`);

    expect(response.status).toBe(403);
  });

  it('moves the sign-in page and reads the new address back', async () => {
    const update = await request(app)
      .put('/api/v1/settings/console')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adminLoginPath: 'signin-7f3a' });

    expect(update.status).toBe(200);
    expect(update.body.data.adminLoginPath).toBe('signin-7f3a');

    /* The public endpoint reports the new address, so the console knows
       where to send an administrator who is not signed in. */
    const path = await request(app).get('/api/v1/settings/login-path');
    expect(path.body.data.path).toBe('signin-7f3a');

    /* And it survives a fresh read of the settings. */
    const settings = await request(app)
      .get('/api/v1/settings/console')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(settings.body.data.adminLoginPath).toBe('signin-7f3a');
  });

  it('rejects a sign-in path that is not a single safe segment', async () => {
    for (const bad of ['ab', 'has/slash', 'has space', 'has_underscore', '..', 'api']) {
      const response = await request(app)
        .put('/api/v1/settings/console')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ adminLoginPath: bad });

      expect(response.status).toBe(400);
    }
  });

  it('rejects a session length outside the allowed range', async () => {
    for (const bad of [0, -1, 100000]) {
      const response = await request(app)
        .put('/api/v1/settings/console')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ sessionLengthHours: bad });

      expect(response.status).toBe(400);
    }
  });

  it('changes the session length and keeps the other settings', async () => {
    const response = await request(app)
      .put('/api/v1/settings/console')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sessionLengthHours: 168 });

    expect(response.status).toBe(200);
    expect(response.body.data.sessionLengthHours).toBe(168);
    /* The sign-in address was not touched by this change. */
    expect(response.body.data.adminLoginPath).toBe('signin-7f3a');
  });

  /* ------------------------------------------------------------------ */
  /* The password                                                         */
  /* ------------------------------------------------------------------ */

  it('refuses a password change without the current password', async () => {
    const response = await request(app)
      .post('/api/v1/settings/password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        currentPassword: '',
        newPassword: 'A-Strong-Pass9',
        confirmPassword: 'A-Strong-Pass9',
      });

    expect(response.status).toBe(400);
  });

  it('refuses a new password that does not match the confirmation', async () => {
    const response = await request(app)
      .post('/api/v1/settings/password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        currentPassword: 'whatever',
        newPassword: 'A-Strong-Pass9',
        confirmPassword: 'Different-Pass9',
      });

    expect(response.status).toBe(400);
  });

  it('refuses a new password that is too weak', async () => {
    for (const weak of ['short1A', 'alllowercase1', 'ALLUPPERCASE1', 'NoNumbersHere']) {
      const response = await request(app)
        .post('/api/v1/settings/password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          currentPassword: 'whatever',
          newPassword: weak,
          confirmPassword: weak,
        });

      expect(response.status).toBe(400);
    }
  });

  it('refuses a password change when the current password is wrong', async () => {
    const response = await request(app)
      .post('/api/v1/settings/password')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        currentPassword: 'ThisIsNotThePassword1',
        newPassword: 'A-Strong-Pass9',
        confirmPassword: 'A-Strong-Pass9',
      });

    expect(response.status).toBe(401);
  });

  it('lets an editor change their own password', async () => {
    /* The editor's real password is set here, so the change can be tried
       with the right current password. */
    const argon2 = await import('argon2');
    const editor = await prisma.user.findUnique({
      where: { email: 'console-editor@test.local' },
      select: { id: true, passwordHash: true },
    });

    await prisma.user.update({
      where: { id: editor!.id },
      data: { passwordHash: await argon2.hash('TheOldPassword1') },
    });

    const response = await request(app)
      .post('/api/v1/settings/password')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        currentPassword: 'TheOldPassword1',
        newPassword: 'TheNewPassword1',
        confirmPassword: 'TheNewPassword1',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.changed).toBe(true);

    /* The new password really is the one that works now. */
    const stored = await prisma.user.findUnique({
      where: { id: editor!.id },
      select: { passwordHash: true },
    });
    expect(await argon2.verify(stored!.passwordHash, 'TheNewPassword1')).toBe(true);
    expect(await argon2.verify(stored!.passwordHash, 'TheOldPassword1')).toBe(false);
  }, 30_000);
});
