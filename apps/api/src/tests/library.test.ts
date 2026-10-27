import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../app.js';
import { generateAccessToken } from '../lib/jwt.js';
import { prisma } from '@nirakar/db';
import { config } from '../config/index.js';
import {
  extractLibraryKeywords,
  extractLibraryExcerpt,
  slugifyLibraryTitle,
} from '../lib/library-pdf.js';

/**
 * Builds a small but structurally valid multi-page PDF. Hand-assembled so the
 * test does not depend on a PDF generation library, and so the parsed output
 * (page count, text layer) is predictable.
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
  const firstPageObj = 4 + pageCount; // catalog=1, pages=2, font=3, contents=4..
  const kids = Array.from(
    { length: pageCount },
    (_, i) => `${firstPageObj + i} 0 R`,
  ).join(' ');

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

/**
 * Waits for a volume's background renderer to finish.
 *
 * The upload is asynchronous by design — a large document takes minutes to
 * render, so the request returns immediately and the work continues in the
 * background. The test waits for that work to land rather than assuming it
 * has already happened.
 */
async function waitForProcessing(id: string, timeoutMs = 60_000): Promise<void> {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const volume = await prisma.libraryVolume.findUnique({
      where: { id },
      select: { status: true, processingError: true },
    });

    if (!volume) throw new Error('The volume disappeared while it was being processed.');
    if (volume.status !== 'PROCESSING') return;
    if (volume.processingError) {
      throw new Error(`Processing failed: ${volume.processingError}`);
    }

    await new Promise((r) => setTimeout(r, 100));
  }

  throw new Error('The volume was still being processed when the test gave up waiting.');
}

describe('Digital Library', () => {
  const app = createApp();  let token: string;
  let volumeId: string | null = null;
  let volumeSlug: string | null = null;

  beforeAll(async () => {
    token = generateAccessToken({
      sub: 'dev-admin',
      email: 'admin@nirakar.org',
      username: 'admin',
      role: 'SUPER_ADMIN',
    });
  });

  afterAll(async () => {
    if (volumeId) {
      await prisma.libraryVolume.delete({ where: { id: volumeId } }).catch(() => undefined);
    }
    await prisma.$disconnect();
    /* The database is remote and the test files run in parallel, so the
       cleanup needs longer than the default hook allows. */
  }, 30_000);

  /* ------------------------------------------------------------------ */
  /* Pure helpers                                                         */
  /* ------------------------------------------------------------------ */

  it('extracts keywords and an excerpt deterministically', () => {
    const text =
      'Shree Nirakar Education Society published a mathematics textbook for standard ten. ' +
      'The textbook covers algebra, geometry and trigonometry with worked examples.';

    const keywords = extractLibraryKeywords(text, 5);
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords).toContain('Mathematics');

    const excerpt = extractLibraryExcerpt(text, 120);
    expect(excerpt.length).toBeLessThanOrEqual(130);
    expect(excerpt).toContain('Nirakar');
  });

  it('derives a url-safe slug from a title', () => {
    expect(slugifyLibraryTitle('Std X Mathematics Textbook')).toBe('std-x-mathematics-textbook');
    expect(slugifyLibraryTitle('  HSSC  Physics!  ')).toBe('hssc-physics');
    expect(slugifyLibraryTitle('!!!')).toBe('volume');
  });

  /* ------------------------------------------------------------------ */
  /* API                                                                  */
  /* ------------------------------------------------------------------ */

  it('rejects an unauthenticated upload', async () => {
    const pdf = buildTestPdf(3);
    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .field('title', 'Unauthorized Volume')
      .field('standard', 'X')
      .attach('pdf', pdf, 'unauthorized.pdf');

    expect(response.status).toBe(401);
  });

  it('rejects a non-PDF upload', async () => {
    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Not A PDF')
      .field('standard', 'X')
      .attach('pdf', Buffer.from('this is plain text'), 'notes.txt');

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('uploads a volume and prepares its pages in the background', async () => {
    /* The rendering happens in the background, so this test waits for it
       rather than assuming it is instant. */
    const pdf = buildTestPdf(6);

    const response = await request(app)
      .post('/api/v1/library/admin/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Std X Mathematics Textbook')
      .field('description', 'A test volume for the digital library.')
      .field('standard', 'X')
      .field('category', 'TEXTBOOK')
      .field('subject', 'Mathematics')
      .field('academicYear', '2026-27')
      .field('author', 'Test Author')
      .field('isPublished', 'true')
      .attach('pdf', pdf, 'maths.pdf');

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const volume = response.body.data;
    volumeId = volume.id;
    volumeSlug = volume.slug;
    expect(volume.standard).toBe('X');

    /* The upload returns as soon as the file is stored — the pages are
       rendered afterwards, so the response cannot already carry them. */
    expect(volume.status).toBe('PROCESSING');

    await waitForProcessing(volumeId!);
  }, 90_000);

  it('publishes the volume once the pages are rendered', async () => {
    const volume = await prisma.libraryVolume.findUnique({
      where: { id: volumeId! },
      select: { status: true, isPublished: true, pageCount: true, processingProgress: true },
    });

    expect(volume?.status).toBe('PUBLISHED');
    expect(volume?.isPublished).toBe(true);
    expect(volume?.pageCount).toBe(6);
    expect(volume?.processingProgress).toBe(100);
  });

  it('lists the volume in the public catalogue with filters applied', async () => {
    const response = await request(app)
      .get('/api/v1/library/catalog')
      .query({ standard: 'X' });

    expect(response.status).toBe(200);
    const { items, total, standardCounts } = response.body.data;
    expect(total).toBeGreaterThan(0);
    expect(items.some((v: any) => v.id === volumeId)).toBe(true);
    expect(standardCounts.some((c: any) => c.standard === 'X')).toBe(true);

    /* A standard with no volumes must return nothing, proving the filter runs
       on the server and not just in the UI. */
    const empty = await request(app)
      .get('/api/v1/library/catalog')
      .query({ standard: 'V' });
    expect(empty.body.data.items.every((v: any) => v.standard === 'V')).toBe(true);
  });

  it('serves the volume with all rendered pages to the public reader', async () => {
    const response = await request(app).get(`/api/v1/library/volume/${volumeSlug}`);

    expect(response.status).toBe(200);
    const volume = response.body.data;
    expect(volume.id).toBe(volumeId);
    expect(volume.pages).toHaveLength(6);
    expect(volume.pages[0].imageVariants.w1024).toContain('/uploads/library/');
    expect(volume.pages[0].imageVariants.thumb).toBeTruthy();
    expect(volume.pages[0].text).toContain('Chapter 1');
  });

  it('404s for an unknown slug', async () => {
    const response = await request(app).get('/api/v1/library/volume/does-not-exist');
    expect(response.status).toBe(404);
  });

  it('withdraws a volume from the public catalogue but keeps it for the admin', async () => {
    const update = await request(app)
      .put(`/api/v1/library/admin/${volumeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isPublished: false });

    expect(update.status).toBe(200);
    expect(update.body.data.isPublished).toBe(false);

    /* Gone from the public catalogue… */
    const publicList = await request(app).get('/api/v1/library/catalog');
    expect(publicList.body.data.items.some((v: any) => v.id === volumeId)).toBe(false);

    /* …but still listed for the admin. */
    const adminList = await request(app)
      .get('/api/v1/library/admin')
      .set('Authorization', `Bearer ${token}`);
    expect(adminList.body.data.items.some((v: any) => v.id === volumeId)).toBe(true);

    /* Put it back for the remaining assertions. */
    await request(app)
      .put(`/api/v1/library/admin/${volumeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isPublished: true });
  });

  it('rejects a catalogue query with an invalid standard', async () => {
    const response = await request(app).get('/api/v1/library/catalog').query({ standard: 'XXIII' });
    expect(response.status).toBe(400);
  });

  it('deletes the volume and its pages', async () => {
    const id = volumeId!;

    const response = await request(app)
      .delete(`/api/v1/library/admin/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    const remaining = await prisma.libraryVolumePage.count({ where: { volumeId: id } });
    expect(remaining).toBe(0);

    volumeId = null;
  });
});
