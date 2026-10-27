import fs from 'node:fs/promises';
import path from 'node:path';
import { LibraryRepository } from './library.repository.js';
import { Prisma, prisma } from '@nirakar/db';
import { AppError } from '../../middleware/error.js';
import { config, PRIVATE_STORAGE_PATH } from '../../config/index.js';
import { analyzeLibraryPdf, slugifyLibraryTitle } from '../../lib/library-pdf.js';
import { dispatchLibraryPdfJob } from '../../jobs/library-pdf.js';
import type { LibraryCatalogQuery, LibraryVolumeCreateInput, LibraryVolumeUpdateInput } from '@nirakar/shared';

export class LibraryService {
  constructor(private repo = new LibraryRepository()) {}

  /* ---------------------------------------------------------------------- */
  /* Public catalogue                                                       */
  /* ---------------------------------------------------------------------- */

  async getCatalog(query: LibraryCatalogQuery) {
    const [catalog, subjects, standardCounts] = await Promise.all([
      this.repo.findCatalog(query),
      this.repo.findSubjects(),
      this.repo.findStandardCounts(),
    ]);

    return { ...catalog, subjects, standardCounts };
  }

  async getVolumeBySlug(slug: string) {
    const volume = await this.repo.findPublishedBySlugWithReviews(slug);
    if (!volume) {
      throw new AppError('NOT_FOUND', 'Library volume not found', 404);
    }

    /* The counter is a write, so it runs detached — a slow counter update
       must never delay the reader's first paint. */
    void this.repo.incrementViewCount(volume.id).catch(() => undefined);

    return volume;
  }

  /* ---------------------------------------------------------------------- */
  /* Ratings & reviews                                                      */
  /* ---------------------------------------------------------------------- */

  /** The signed-in reader's own review, so the form can pre-fill. */
  async getUserReview(volumeId: string, userId: string) {
    const [summary, userReview] = await Promise.all([
      this.repo.getRatingSummary(volumeId),
      this.repo.findUserReview(volumeId, userId),
    ]);
    return { rating: summary, userReview };
  }

  /** A guest's own review, so the form can pre-fill on this device. */
  async getGuestReview(volumeId: string, guestKey: string) {
    const [summary, guestReview] = await Promise.all([
      this.repo.getRatingSummary(volumeId),
      this.repo.findGuestReview(volumeId, guestKey),
    ]);
    return { rating: summary, guestReview };
  }

  /**
   * Records or updates a review of a volume.
   *
   * A reader does not need an account. A signed-in reader is identified by
   * their user id; a guest is identified by a per-device key. Either way
   * there is one review per reader per volume, and the reCAPTCHA token —
   * checked by the caller before this is reached — is what stops the
   * endpoint from being flooded.
   */
  async submitReview(
    volumeId: string,
    rating: number,
    comment?: string | null,
    userId?: string | null,
    guestKey?: string | null,
    guestName?: string | null,
  ) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new AppError('BAD_REQUEST', 'A rating must be between 1 and 5.', 400);
    }

    if (comment && comment.length > 2000) {
      throw new AppError('BAD_REQUEST', 'A review may be at most 2000 characters.', 400);
    }

    const volume = await this.repo.findById(volumeId);
    if (!volume || !volume.isPublished) {
      throw new AppError('NOT_FOUND', 'Library volume not found', 404);
    }

    let review;
    if (userId) {
      review = await this.repo.upsertReview(volumeId, userId, rating, comment);
    } else {
      if (!guestKey) {
        throw new AppError('BAD_REQUEST', 'A device identifier is required to review.', 400);
      }

      const name = (guestName || '').trim() || null;
      if (!name) {
        throw new AppError('BAD_REQUEST', 'A display name is required for guest reviews.', 400);
      }
      review = await this.repo.upsertGuestReview(volumeId, guestKey, name, rating, comment);
    }

    /* The summary is recomputed rather than incremented, so the average
       can never drift away from the reviews that produced it. */
    const summary = await this.repo.getRatingSummary(volumeId);
    return { review, rating: summary };
  }

  /* ---------------------------------------------------------------------- */
  /* Admin: upload & processing                                             */
  /* ---------------------------------------------------------------------- */

  /**
   * Records the upload and hands the PDF to the background parser.
   *
   * Parsing a large document takes minutes, so it must not happen inside
   * the request: the admin would sit watching a spinner until the browser
   * timed out. The volume is persisted first, so it is visible in the
   * admin list with its progress, and the reader gets a response straight
   * away.
   */
  async uploadVolume(input: LibraryVolumeCreateInput & { pdfPath: string; originalName: string; fileSizeBytes: number }) {
    const slug = await this.uniqueSlug(input.title);

    const volume = await this.repo.createVolume({
      title: input.title,
      slug,
      description: input.description,
      author: input.author,
      publisher: input.publisher,
      academicYear: input.academicYear,
      standard: input.standard,
      category: input.category,
      subject: input.subject,
      institutionCode: input.institutionCode || undefined,
      language: input.language,
      isPublished: input.isPublished,
      pdfPath: input.pdfPath,
      originalName: input.originalName,
      fileSizeBytes: input.fileSizeBytes,
    });

    await this.repo.updateProcessingProgress(volume.id, 1, 'Queued for processing');

    await dispatchLibraryPdfJob(volume.id, input.pdfPath, input.isPublished);

    return volume;
  }

  /**
   * Renders the PDF into library pages. This is the body of the background
   * job — it is long-running and reports its progress as it goes.
   */
  async processVolume(
    volumeId: string,
    pdfPath: string,
    isPublished: boolean,
  ): Promise<void> {
    try {
      const result = await analyzeLibraryPdf(pdfPath, volumeId, (step, percent) => {
        /* Progress is written throttled by the repository call itself; the
           parser reports far more often than the row needs updating. */
        void this.repo.updateProcessingProgress(volumeId, percent, step).catch(() => undefined);
      });

      await this.repo.replacePages(
        volumeId,
        result.pages.map((p) => ({
          pageNo: p.pageNo,
          text: p.text,
          imageVariants: p.imageVariants as unknown as Prisma.InputJsonValue,
          blurhash: p.blurhash,
        })),
      );

      /* The volume may have been deleted while it was being rendered. The
         row is gone by now, so the write above has already failed and the
         rendered files are taken away below — but they are taken away here
         too, so nothing is left on the disk. */
      const stillThere = await this.repo.findById(volumeId);
      if (!stillThere) {
        await this.removeRenderedPages(volumeId);
        throw new Error('The volume was removed while it was being rendered.');
      }

      await this.repo.finalizeVolume(volumeId, {
        status: 'PUBLISHED',
        isPublished,
        pageCount: result.pageCount,
        wordCount: result.wordCount,
        readingMinutes: result.readingMinutes,
        keywords: result.keywords,
        excerpt: result.excerpt,
        coverUrl: result.coverUrl,
        sourcePageCount: result.sourcePageCount,
        isSampled: result.isSampled,
      });
    } catch (err: any) {
      /* The volume may have been deleted while it was being rendered. In
         that case there is no row to record the error on, and the rendered
         files are taken away below. */
      await this.repo
        .setProcessingError(volumeId, err?.message || 'The PDF could not be processed')
        .catch(() => undefined);
      await this.removeRenderedPages(volumeId);
      throw err;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Admin: management                                                      */
  /* ---------------------------------------------------------------------- */

  async listForAdmin(query: LibraryCatalogQuery) {
    return this.repo.listForAdmin(query);
  }

  async getForAdmin(id: string) {
    const volume = await this.repo.findById(id);
    if (!volume) {
      throw new AppError('NOT_FOUND', 'Library volume not found', 404);
    }
    return volume;
  }

  async updateVolume(id: string, input: LibraryVolumeUpdateInput) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('NOT_FOUND', 'Library volume not found', 404);
    }

    const data: Record<string, unknown> = { ...input };

    /* Changing the title should keep the public URL stable — the slug is
       derived once at creation so published links never break. The title
       itself is still saved, so the volume can be renamed without the
       edit being silently thrown away. */
    delete data.slug;

    if (input.isPublished !== undefined) {
      /* Publishing a volume that is still being rendered would put it live
         with only the pages that have been written so far. */
      if (input.isPublished && existing.status === 'PROCESSING') {
        throw new AppError(
          'BAD_REQUEST',
          'This volume is still being rendered. Wait for it to finish before publishing it.',
          400,
        );
      }

      /* A volume can only go live if its pages are actually there. A
         render that failed leaves the volume with no pages at all, and
         publishing it would put an empty book in front of the reader, so
         it is refused here rather than shown as a live volume. */
      if (input.isPublished && existing.pageCount < 1) {
        throw new AppError(
          'BAD_REQUEST',
          'This volume has no rendered pages yet, so it cannot be published. Render it first.',
          400,
        );
      }

      data.isPublished = input.isPublished;
      data.status = input.isPublished ? 'PUBLISHED' : 'DRAFT';
      data.publishedAt = input.isPublished ? new Date() : null;
    }

    return this.repo.updateVolume(id, data as any);
  }

  /**
   * Renders a volume again from the PDF that was uploaded for it.
   *
   * The source file is still on disk, so a document that failed to render
   * does not have to be uploaded a second time.
   */
  async reprocessVolume(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('NOT_FOUND', 'Library volume not found', 404);
    }

    if (!existing.pdfPath) {
      throw new AppError(
        'BAD_REQUEST',
        'The original PDF for this volume is no longer on the server. Please upload it again.',
        409,
      );
    }

    if (existing.status === 'PROCESSING') {
      throw new AppError('BAD_REQUEST', 'This volume is already being rendered.', 409);
    }

    const sourceExists = await fs
      .access(existing.pdfPath)
      .then(() => true)
      .catch(() => false);

    if (!sourceExists) {
      throw new AppError(
        'BAD_REQUEST',
        'The original PDF for this volume is no longer on the server. Please upload it again.',
        409,
      );
    }

    /* The old pages are taken away first, so a failed attempt cannot
       leave the previous render mixed in with the new one. */
    await this.removeRenderedPages(id);
    await this.repo.clearProcessingError(id);
    await this.repo.updateProcessingProgress(id, 1, 'Queued for processing');

    await dispatchLibraryPdfJob(id, existing.pdfPath, existing.isPublished);

    const updated = await this.repo.findById(id);
    if (!updated) {
      throw new AppError('NOT_FOUND', 'Library volume not found', 404);
    }

    return updated;
  }

  async deleteVolume(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new AppError('NOT_FOUND', 'Library volume not found', 404);
    }

    /* The volume is marked as being removed before the row goes, so a
       renderer that is still working on it stops and does not write a
       fresh set of page files into a directory that is being tidied
       away. */
    await this.repo.markAsDeleting(id).catch(() => undefined);

    await this.repo.deleteVolume(id);

    /* Remove the rendered page images and the source PDF from disk. */
    await this.removeRenderedPages(id);
    if (existing.pdfPath) {
      await fs.rm(existing.pdfPath, { force: true }).catch(() => undefined);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Helpers                                                                */
  /* ---------------------------------------------------------------------- */

  /** Derives a slug and appends a numeric suffix until it is unique. */
  private async uniqueSlug(title: string): Promise<string> {
    const base = slugifyLibraryTitle(title);
    let candidate = base;
    let n = 2;

    while (await this.repo.slugExists(candidate)) {
      candidate = `${base}-${n}`;
      n += 1;
      if (n > 100) {
        /* Astronomically unlikely; fall back to a timestamp suffix. */
        candidate = `${base}-${Date.now()}`;
        break;
      }
    }

    return candidate;
  }

  /** Deletes the rendered WebP variants for a volume. */
  private async removeRenderedPages(volumeId: string): Promise<void> {
    const dir = path.resolve(config.STORAGE_LOCAL_PATH, 'library', volumeId);
    await fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

/**
 * Moves the source PDFs of earlier volumes out of the public directory.
 *
 * The originals used to be written into the uploads directory, which is
 * served to the public as static files. They are private documents — a
 * draft must not be downloadable — so they are moved to the private
 * directory and the row is told where its file now lives.
 *
 * It runs once at startup and is safe to run again: a volume whose file
 * is already in the right place is left alone.
 */
export async function migrateLegacyLibrarySources(): Promise<void> {
  const publicDir = path.resolve(config.STORAGE_LOCAL_PATH, 'library');
  const privateDir = path.resolve(PRIVATE_STORAGE_PATH, 'library');

  const volumes = await prisma.libraryVolume
    .findMany({
      where: { pdfPath: { not: null } },
      select: { id: true, pdfPath: true },
    })
    .catch(() => []);

  for (const volume of volumes) {
    const current = volume.pdfPath;
    if (!current) continue;

    const inPublicDir = path.resolve(current).startsWith(path.resolve(publicDir) + path.sep);
    if (!inPublicDir) continue;

    const target = path.resolve(privateDir, path.basename(current));

    try {
      await fs.mkdir(privateDir, { recursive: true });
      await fs.rename(current, target);
    } catch {
      /* The file may already have been moved, or it may have been taken
         off the disk. Either way, the row is pointed at where it should
         be and the failure is not worth stopping the server for. */
    }

    await prisma.libraryVolume
      .update({ where: { id: volume.id }, data: { pdfPath: target } })
      .catch(() => undefined);
  }
}
