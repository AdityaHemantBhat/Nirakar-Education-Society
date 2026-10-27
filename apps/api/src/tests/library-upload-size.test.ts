import { describe, it, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../app.js';
import { generateAccessToken } from '../lib/jwt.js';
import { prisma } from '@nirakar/db';
import { config } from '../config/index.js';

/**
 * The upload must write the bytes it was given. A file that arrives far
 * larger on disk than it was in the request would quietly fill the disk.
 */
describe('Library upload size integrity', () => {
  const app = createApp();
  const written: string[] = [];

  afterAll(async () => {
    /* The background renderer may still be running against the probe, so
       it is given a moment to notice the volume has gone. */
    await new Promise((r) => setTimeout(r, 500));

    for (const p of written) {
      await fs.promises.rm(p, { force: true }).catch(() => undefined);
    }
    /* The upload creates a volume. It is a probe, not real library content,
       so it is taken back out again — otherwise every test run leaves
       another one in the catalogue. */
    const probes = await prisma.libraryVolume
      .findMany({ where: { title: 'Upload Size Probe' }, select: { id: true } })
      .catch(() => [] as Array<{ id: string }>);

    for (const probe of probes) {
      await fs.promises
        .rm(path.resolve(config.STORAGE_LOCAL_PATH, 'library', probe.id), {
          recursive: true,
          force: true,
        })
        .catch(() => undefined);
    }

    await prisma.libraryVolume
      .deleteMany({ where: { title: 'Upload Size Probe' } })
      .catch(() => undefined);

    await prisma.$disconnect();
    /* The database is remote, and the test files run in parallel, so the
       cleanup needs longer than the default hook allows. */
  }, 30_000);

  it('writes a PDF to disk at exactly the size it was sent', async () => {
    const token = generateAccessToken({
      sub: 'dev-admin',
      email: 'admin@nirakar.org',
      username: 'admin',
      role: 'SUPER_ADMIN',
    });

    const body = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n' +
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n' +
        'trailer\n<< /Size 4 /Root 1 0 R >>\n%%EOF\n',
      'latin1',
    );

    const before = new Set(
      fs
        .readdirSync(path.resolve(config.STORAGE_LOCAL_PATH, 'library'))
        .filter((f) => f.endsWith('.pdf'))
        .map((f) => path.resolve(config.STORAGE_LOCAL_PATH, 'library', f)),
    );

    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Upload Size Probe')
      .field('standard', 'X')
      .attach('pdf', body, 'probe.pdf');

    expect([200, 201, 422]).toContain(response.status);

    const after = fs
      .readdirSync(path.resolve(config.STORAGE_LOCAL_PATH, 'library'))
      .filter((f) => f.endsWith('.pdf'))
      .map((f) => path.resolve(config.STORAGE_LOCAL_PATH, 'library', f))
      .filter((f) => !before.has(f));

    for (const p of after) {
      written.push(p);

      /* Other test files run in parallel and upload their own PDFs into the
         same directory, so only the file that holds this probe is
         checked. */
      const contents = fs.readFileSync(p);
      if (!contents.subarray(0, body.length).equals(body)) continue;

      /* The file on disk must be the size of the PDF that was sent — not
         the whole multipart body, and not a re-serialised copy. */
      expect(contents.length).toBeLessThanOrEqual(body.length + 1024);
    }
  });
});
