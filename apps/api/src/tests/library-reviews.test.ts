import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { generateAccessToken } from '../lib/jwt.js';
import { prisma } from '@nirakar/db';

/**
 * The rating and review flow.
 *
 * Anyone may review a volume — an account is not required. A guest gives a
 * name and is identified by a per-device cookie; a signed-in reader is
 * identified by their account. Either way there is one review per reader
 * per volume, and the average shown on the volume is computed from the
 * stored reviews, so the figure on screen can never disagree with the
 * reviews behind it.
 *
 * The reCAPTCHA token is checked by the endpoint, so the tests stub the
 * verification rather than calling Google.
 */
describe('Digital Library reviews', () => {
  const app = createApp();

  let readerId: string;
  let otherReaderId: string;
  let readerToken: string;
  let otherReaderToken: string;

  let volumeId: string | null = null;
  let volumeSlug: string | null = null;

  beforeAll(async () => {
    /* Two real readers, because an account review is tied to a user by a
       foreign key. */
    const reader = await prisma.user.upsert({
      where: { email: 'library-reader@test.local' },
      update: {},
      create: {
        email: 'library-reader@test.local',
        username: 'library-reader-test',
        passwordHash: 'not-used-in-tests',
        role: 'READER',
      },
      select: { id: true, email: true, username: true },
    });

    const other = await prisma.user.upsert({
      where: { email: 'library-reader-2@test.local' },
      update: {},
      create: {
        email: 'library-reader-2@test.local',
        username: 'library-reader-test-2',
        passwordHash: 'not-used-in-tests',
        role: 'READER',
      },
      select: { id: true, email: true, username: true },
    });

    readerId = reader.id;
    otherReaderId = other.id;

    readerToken = generateAccessToken({
      sub: reader.id,
      email: reader.email,
      username: reader.username,
      role: 'READER',
    });

    otherReaderToken = generateAccessToken({
      sub: other.id,
      email: other.email,
      username: other.username,
      role: 'READER',
    });

    const volume = await prisma.libraryVolume.create({
      data: {
        title: 'Review Test Volume',
        slug: `review-test-volume-${Date.now()}`,
        description: 'A volume used by the review tests.',
        standard: 'X',
        category: 'TEXTBOOK',
        subject: 'Mathematics',
        status: 'PUBLISHED',
        isPublished: true,
        pageCount: 4,
        readingMinutes: 3,
        publishedAt: new Date(),
      },
      select: { id: true, slug: true },
    });

    volumeId = volume.id;
    volumeSlug = volume.slug;
  });

  afterAll(async () => {
    if (volumeId) {
      await prisma.libraryVolume.delete({ where: { id: volumeId } }).catch(() => undefined);
    }
    await prisma.user.deleteMany({
      where: { email: { in: ['library-reader@test.local', 'library-reader-2@test.local'] } },
    });
    await prisma.$disconnect();
    /* The database is remote and the test files run in parallel, so the
       cleanup needs longer than the default hook allows. */
  }, 30_000);

  it('rejects a review with no captcha token', async () => {
    const response = await request(app)
      .post(`/api/v1/library/volume/${volumeId}/review`)
      .send({ rating: 5 });

    expect(response.status).toBe(400);
  });

  it('rejects a rating outside one to five', async () => {
    for (const rating of [0, 6, -1]) {
      const response = await request(app)
        .post(`/api/v1/library/volume/${volumeId}/review`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ rating, captchaToken: 'test-token' });

      expect(response.status).toBe(400);
    }
  });

  it('records a review and reports the average', async () => {
    const response = await request(app)
      .post(`/api/v1/library/volume/${volumeId}/review`)
      .set('Authorization', `Bearer ${readerToken}`)
      .send({
        rating: 4,
        comment: 'Clear explanations and good worked examples.',
        captchaToken: 'test-token',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const { rating } = response.body.data;
    expect(rating.average).toBe(4);
    expect(rating.count).toBe(1);
    expect(rating.breakdown.find((b: any) => b.stars === 4)?.count).toBe(1);
  });

  it('averages across readers and keeps the count in step', async () => {
    const response = await request(app)
      .post(`/api/v1/library/volume/${volumeId}/review`)
      .set('Authorization', `Bearer ${otherReaderToken}`)
      .send({ rating: 2, comment: 'Some chapters felt rushed.', captchaToken: 'test-token' });

    expect(response.status).toBe(200);

    const { rating } = response.body.data;
    /* (4 + 2) / 2 = 3 */
    expect(rating.average).toBe(3);
    expect(rating.count).toBe(2);
  });

  it('lets a reader change their own rating without adding a second review', async () => {
    const response = await request(app)
      .post(`/api/v1/library/volume/${volumeId}/review`)
      .set('Authorization', `Bearer ${readerToken}`)
      .send({ rating: 5, comment: 'On reflection, it is excellent.', captchaToken: 'test-token' });

    expect(response.status).toBe(200);

    const { rating } = response.body.data;
    expect(rating.count).toBe(2);
    /* (5 + 2) / 2 = 3.5 */
    expect(rating.average).toBe(3.5);
  });

  it('returns the signed-in reader their own review', async () => {
    const response = await request(app)
      .get(`/api/v1/library/volume/${volumeId}/review/me`)
      .set('Authorization', `Bearer ${readerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.userReview.rating).toBe(5);
    expect(response.body.data.rating.count).toBe(2);
  });

  /* ------------------------------------------------------------------ */
  /* Guests                                                              */
  /* ------------------------------------------------------------------ */

  it('lets a guest review without an account', async () => {
    const response = await request(app)
      .post(`/api/v1/library/volume/${volumeId}/review`)
      .set('Cookie', 'nirakar_device_id=guest-device-one')
      .send({ rating: 5, guestName: 'A Guest Reader', captchaToken: 'test-token' });

    expect(response.status).toBe(200);

    const { rating } = response.body.data;
    /* (5 + 2 + 5) / 3 = 4 */
    expect(rating.count).toBe(3);
    expect(rating.average).toBe(4);
  });

  it('gives a guest one review per volume, not one per request', async () => {
    const response = await request(app)
      .post(`/api/v1/library/volume/${volumeId}/review`)
      .set('Cookie', 'nirakar_device_id=guest-device-one')
      .send({ rating: 3, guestName: 'A Guest Reader', captchaToken: 'test-token' });

    expect(response.status).toBe(200);

    const { rating } = response.body.data;
    /* The guest's second review replaced the first, so the count is
       unchanged. */
    expect(rating.count).toBe(3);
    /* (3 + 2 + 5) / 3 = 3.3 */
    expect(rating.average).toBe(3.3);
  });

  it('returns a guest their own review on their device', async () => {
    const response = await request(app)
      .get(`/api/v1/library/volume/${volumeId}/review/me`)
      .set('Cookie', 'nirakar_device_id=guest-device-one');

    expect(response.status).toBe(200);
    expect(response.body.data.guestReview.rating).toBe(3);
  });

  it('rejects a guest review with no name', async () => {
    const response = await request(app)
      .post(`/api/v1/library/volume/${volumeId}/review`)
      .set('Cookie', 'nirakar_device_id=guest-device-two')
      .send({ rating: 5, guestName: '', captchaToken: 'test-token' });

    expect(response.status).toBe(400);
  });

  /* ------------------------------------------------------------------ */

  it('shows the rating and the reviews on the public volume', async () => {
    const response = await request(app).get(`/api/v1/library/volume/${volumeSlug}`);

    expect(response.status).toBe(200);

    const volume = response.body.data;
    expect(volume.rating.average).toBe(3.3);
    expect(volume.rating.count).toBe(3);
    expect(volume.reviews).toHaveLength(3);

    /* Both kinds of reviewer appear — an account reader and a guest. */
    expect(volume.reviews.some((r: any) => r.user?.username)).toBe(true);
    expect(volume.reviews.some((r: any) => r.guestName)).toBe(true);
  });

  it('refuses a delete from a reader who is not an administrator', async () => {
    const id = volumeId!;

    const response = await request(app)
      .delete(`/api/v1/library/admin/${id}`)
      .set('Authorization', `Bearer ${readerToken}`);

    expect(response.status).toBe(403);
  });

  it('removes the reviews when the volume is deleted', async () => {
    const id = volumeId!;

    const admin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true, email: true, username: true },
    });
    const adminToken = generateAccessToken({
      sub: admin!.id,
      email: admin!.email,
      username: admin!.username,
      role: 'SUPER_ADMIN',
    });

    const response = await request(app)
      .delete(`/api/v1/library/admin/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    /* The reviews cascade with the volume. */
    const remaining = await prisma.libraryVolumeReview.count({ where: { volumeId: id } });
    expect(remaining).toBe(0);

    volumeId = null;
  });
});
