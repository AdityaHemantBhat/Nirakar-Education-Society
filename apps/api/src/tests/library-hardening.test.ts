import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../app.js';
import { generateAccessToken } from '../lib/jwt.js';
import { prisma } from '@nirakar/db';
import { config, PRIVATE_STORAGE_PATH } from '../config/index.js';
import { selectPagesToRender, MAX_LIBRARY_PAGES } from '../lib/library-pdf.js';

/**
 * Builds a small but structurally valid multi-page PDF.
 */
function buildTestPdf(pages: number): Buffer {
  const contentStreams: string[] = [];
  for (let i = 0; i < pages; i++) {
    const label = `Chapter ${i + 1}`;
    const stream =
      `BT /F1 24 Tf 72 700 Td (${label}) Tj ET\n` +
      '0 0 1 rg 100 600 200 80 re f';
    contentStreams.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  }

  const pageCount = pages;
  const firstPageObj = 4 + pageCount;
  const kids = Array.from({ length: pageCount }, (_, i) => `${firstPageObj + i} 0 R`).join(' ');

  const objects: string[] = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
    ...contentStreams,
    ...Array.from({ length: pageCount }, (_, i) => {
      return (
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ` +
        `/Resources << /Font << /F1 3 0 R >> >> /Contents ${4 + i} 0 R >>`
      );
    }),
  ];

  let out = '%PDF-1.4\n';
  const offsets: number[] = [0];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  out +=
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(out, 'latin1');
}

describe('Digital Library hardening', () => {
  const app = createApp();
  let token: string;
  const created: string[] = [];

  beforeAll(() => {
    token = generateAccessToken({
      sub: 'dev-admin',
      email: 'admin@nirakar.org',
      username: 'admin',
      role: 'SUPER_ADMIN',
    });
  });

  afterAll(async () => {
    /* The background renderers may still be running against the probes,
       so they are given a moment to notice the volumes have gone. */
    await new Promise((r) => setTimeout(r, 500));

    for (const id of created) {
      await prisma.libraryVolume.delete({ where: { id } }).catch(() => undefined);
      await fsPromises
        .rm(path.resolve(config.STORAGE_LOCAL_PATH, 'library', id), { recursive: true, force: true })
        .catch(() => undefined);
    }
    await prisma.$disconnect();
  }, 30_000);

  /* ------------------------------------------------------------------ */
  /* The page ceiling                                                     */
  /* ------------------------------------------------------------------ */

  describe('the page ceiling', () => {
    it('renders a document inside the ceiling in full', () => {
      const pages = selectPagesToRender(50, 400);
      expect(pages).toHaveLength(50);
      expect(pages[0]).toBe(1);
      expect(pages[49]).toBe(50);
    });

    it('never renders more pages than the ceiling allows', () => {
      /* A long document is sampled down rather than refused, but the sample
         must not exceed the ceiling — an extra page here means a volume
         that claims to be a 400-page book is really 401. */
      for (const sourceCount of [401, 500, 1000, 5000, 20_000]) {
        const pages = selectPagesToRender(sourceCount, MAX_LIBRARY_PAGES);
        expect(pages.length).toBeLessThanOrEqual(MAX_LIBRARY_PAGES);
      }
    });

    it('always includes the first and the last page of the document', () => {
      for (const sourceCount of [401, 1000, 5000]) {
        const pages = selectPagesToRender(sourceCount, MAX_LIBRARY_PAGES);
        expect(pages[0]).toBe(1);
        expect(pages[pages.length - 1]).toBe(sourceCount);
      }
    });

    it('spreads the sample evenly rather than truncating the front', () => {
      const pages = selectPagesToRender(1000, 400);
      const middle = pages[Math.floor(pages.length / 2)];
      expect(middle).toBeGreaterThan(400);
      expect(middle).toBeLessThan(600);
    });
  });

  /* ------------------------------------------------------------------ */
  /* A volume with no pages cannot go live                                */
  /* ------------------------------------------------------------------ */

  it('refuses to publish a volume whose pages never rendered', async () => {
    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Never Rendered')
      .field('standard', 'X')
      .attach('pdf', buildTestPdf(2), 'never.pdf');

    expect(response.status).toBe(201);
    const id = response.body.data.id as string;
    created.push(id);

    /* The volume is put into the state a failed render leaves it in: no
       pages, and the reason why. */
    await prisma.libraryVolume.update({
      where: { id },
      data: { status: 'DRAFT', pageCount: 0, processingError: 'The PDF could not be processed' },
    });

    const publish = await request(app)
      .put(`/api/v1/library/admin/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isPublished: true });

    expect(publish.status).toBe(400);
    expect(publish.body.error.message).toMatch(/no rendered pages/i);

    /* And it must not be in the public catalogue. */
    const catalog = await request(app).get('/api/v1/library/catalog');
    expect(catalog.body.data.items.some((v: any) => v.id === id)).toBe(false);
  }, 30_000);

  it('refuses to publish a volume that is still being rendered', async () => {
    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Still Rendering')
      .field('standard', 'X')
      .attach('pdf', buildTestPdf(2), 'rendering.pdf');

    expect(response.status).toBe(201);
    const id = response.body.data.id as string;
    created.push(id);

    const publish = await request(app)
      .put(`/api/v1/library/admin/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isPublished: true });

    expect(publish.status).toBe(400);
    expect(publish.body.error.message).toMatch(/still being rendered/i);
  });

  /* ------------------------------------------------------------------ */
  /* The source PDF is not public                                         */
  /* ------------------------------------------------------------------ */

  it('keeps the source PDF out of the publicly served directory', async () => {
    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Private Source')
      .field('standard', 'X')
      .attach('pdf', buildTestPdf(2), 'private.pdf');

    expect(response.status).toBe(201);
    const id = response.body.data.id as string;
    created.push(id);

    const volume = await prisma.libraryVolume.findUnique({
      where: { id },
      select: { pdfPath: true },
    });

    /* The original PDF must not live under the uploads directory, which
       is served to the public as static files. */
    const publicDir = path.resolve(config.STORAGE_LOCAL_PATH);
    expect(path.resolve(volume!.pdfPath!).startsWith(publicDir + path.sep)).toBe(false);
    expect(path.resolve(volume!.pdfPath!).startsWith(path.resolve(PRIVATE_STORAGE_PATH))).toBe(true);
  });

  it('does not serve the source PDF over HTTP', async () => {
    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Unreachable Source')
      .field('standard', 'X')
      .attach('pdf', buildTestPdf(2), 'unreachable.pdf');

    expect(response.status).toBe(201);
    const id = response.body.data.id as string;
    created.push(id);

    const volume = await prisma.libraryVolume.findUnique({
      where: { id },
      select: { pdfPath: true },
    });

    const fileName = path.basename(volume!.pdfPath!);
    const served = await request(app).get(`/uploads/library/${fileName}`);

    expect(served.status).toBe(404);
  });

  /* ------------------------------------------------------------------ */
  /* A rejected upload leaves nothing behind                              */
  /* ------------------------------------------------------------------ */

  it('removes the uploaded file when the details are rejected', async () => {
    const sourceDir = path.resolve(PRIVATE_STORAGE_PATH, 'library');

    const before = new Set(
      fs.existsSync(sourceDir)
        ? fs.readdirSync(sourceDir).filter((f) => f.endsWith('.pdf')).map((f) => path.join(sourceDir, f))
        : [],
    );

    /* The title is required, so this upload is refused — but multer has
       already written the PDF to disk by then. */
    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', '')
      .field('standard', 'X')
      .attach('pdf', buildTestPdf(2), 'rejected.pdf');

    expect(response.status).toBe(400);

    const after = fs
      .readdirSync(sourceDir)
      .filter((f) => f.endsWith('.pdf'))
      .map((f) => path.join(sourceDir, f))
      .filter((f) => !before.has(f));

    expect(after).toHaveLength(0);
  });

  /* ------------------------------------------------------------------ */
  /* Editing a volume                                                     */
  /* ------------------------------------------------------------------ */

  it('saves the details of a volume without changing its address', async () => {
    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Original Title')
      .field('standard', 'X')
      .field('subject', 'Mathematics')
      .attach('pdf', buildTestPdf(2), 'editable.pdf');

    expect(response.status).toBe(201);
    const id = response.body.data.id as string;
    const slug = response.body.data.slug as string;
    created.push(id);

    const update = await request(app)
      .put(`/api/v1/library/admin/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'A Better Title',
        subject: 'Physics',
        author: 'A. Writer',
        description: 'Now with a description.',
      });

    expect(update.status).toBe(200);

    const volume = await prisma.libraryVolume.findUnique({
      where: { id },
      select: { title: true, subject: true, author: true, description: true, slug: true },
    });

    /* The edit is saved… */
    expect(volume?.title).toBe('A Better Title');
    expect(volume?.subject).toBe('Physics');
    expect(volume?.author).toBe('A. Writer');
    expect(volume?.description).toBe('Now with a description.');

    /* …and the public address still works. */
    expect(volume?.slug).toBe(slug);
  });

  it('does not let the status be set directly, only through isPublished', async () => {
    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Status Probe')
      .field('standard', 'X')
      .attach('pdf', buildTestPdf(2), 'status.pdf');

    expect(response.status).toBe(201);
    const id = response.body.data.id as string;
    created.push(id);

    const update = await request(app)
      .put(`/api/v1/library/admin/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PUBLISHED' });

    expect(update.status).toBe(200);

    const volume = await prisma.libraryVolume.findUnique({
      where: { id },
      select: { status: true, isPublished: true },
    });

    /* The status is not part of what a caller may set. It is worked out
       from `isPublished`, so asking for it directly changes nothing — and
       in particular it cannot be used to push a volume with no pages into
       the public catalogue. */
    expect(volume?.isPublished).toBe(false);
    expect(volume?.status).not.toBe('PUBLISHED');
  });

  /* ------------------------------------------------------------------ */
  /* The admin listing                                                    */
  /* ------------------------------------------------------------------ */

  it('finds a volume by its publisher, as the public catalogue does', async () => {
    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Publisher Probe')
      .field('standard', 'X')
      .field('publisher', 'Nirakar Publications')
      .attach('pdf', buildTestPdf(2), 'publisher.pdf');

    expect(response.status).toBe(201);
    const id = response.body.data.id as string;
    created.push(id);

    const list = await request(app)
      .get('/api/v1/library/admin')
      .set('Authorization', `Bearer ${token}`)
      .query({ q: 'Nirakar Publications' });

    expect(list.status).toBe(200);
    expect(list.body.data.items.some((v: any) => v.id === id)).toBe(true);
  });
});
