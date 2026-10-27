import fs from 'node:fs/promises';
import path from 'node:path';
import { MagazineRepository } from './magazine.repository.js';
import { AppError } from '../../middleware/error.js';
import { config } from '../../config/index.js';
import { dispatchPdfJob } from '../../jobs/boss.js';
import { broadcastMagazineUpdate } from '../../lib/socket.js';
export class MagazineService {
  constructor(private repo = new MagazineRepository()) {}

  async getCalendar(year: number, month: number) {
    return this.repo.findCalendarIssues(year, month);
  }

  async getAdminIssues() {
    return this.repo.findAdminIssues();
  }

  async getIssueByDate(publishDate: string) {
    let issue = null;
    if (publishDate === 'today' || publishDate === 'latest') {
      issue = await this.repo.findLatest();
    } else {
      issue = await this.repo.findByDate(publishDate);
      if (issue) {
        if (issue.status !== 'PUBLISHED') {
          throw new AppError('NOT_FOUND', 'Magazine issue not found', 404);
        }
      } else {
        issue = await this.repo.findById(publishDate);
        if (issue?.status !== 'PUBLISHED') {
          throw new AppError('NOT_FOUND', 'Magazine issue not found', 404);
        }
      }
    }

    if (!issue) {
      throw new AppError('NOT_FOUND', 'Magazine issue not found', 404);
    }

    const [rating, reviews] = await Promise.all([
      this.repo.getRatingSummary(issue.id),
      this.repo.findReviews(issue.id),
    ]).catch((error) => {
      if (error?.code === 'P2021') {
        return [
          { average: null, count: 0, breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 })) },
          [],
        ] as const;
      }
      throw error;
    });

    // Magazine issues are free to read; return every processed page regardless of legacy lock flags.
    return {
      ...issue,
      pages: issue.pages.map((page) => ({ ...page, isLockedPage: false })),
      rating,
      reviews,
    };
  }

  async getReaderReview(reference: string, userId?: string | null, guestKey?: string | null) {
    const target = await this.repo.findReviewTarget(reference);
    if (!target || target.status !== 'PUBLISHED') throw new AppError('NOT_FOUND', 'Magazine issue not found', 404);
    try {
      const [rating, userReview] = await Promise.all([
        this.repo.getRatingSummary(target.id),
        userId
          ? this.repo.findUserReview(target.id, userId)
          : guestKey
            ? this.repo.findGuestReview(target.id, guestKey)
            : Promise.resolve(null),
      ]);
      return { rating, userReview };
    } catch (error: any) {
      if (error?.code === 'P2021') {
        return {
          rating: { average: null, count: 0, breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 })) },
          userReview: null,
        };
      }
      throw error;
    }
  }

  async submitReview(reference: string, rating: number, comment?: string | null, userId?: string | null, guestKey?: string | null, guestName?: string | null) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new AppError('BAD_REQUEST', 'A rating must be between 1 and 5.', 400);
    }
    if (comment && comment.length > 2000) {
      throw new AppError('BAD_REQUEST', 'A review may be at most 2000 characters.', 400);
    }

    const target = await this.repo.findPublishedReviewTarget(reference);
    if (!target) throw new AppError('NOT_FOUND', 'Magazine issue not found', 404);

    try {
      let review;
      if (userId) {
        review = await this.repo.upsertReview(target.id, userId, rating, comment);
      } else {
        if (!guestKey) throw new AppError('BAD_REQUEST', 'A device identifier is required to review.', 400);
        review = await this.repo.upsertGuestReview(target.id, guestKey, (guestName || '').trim() || null, rating, comment);
      }

      const summary = await this.repo.getRatingSummary(target.id);
      return { review, rating: summary, issueId: target.id };
    } catch (error: any) {
      if (error?.code === 'P2021') {
        throw new AppError('INTERNAL_SERVER_ERROR', 'Magazine ratings are temporarily unavailable. Please try again later.', 503);
      }
      throw error;
    }
  }

  async uploadAndCreateIssue(data: {
    publishDate: string;
    title: string;
    pdfPath: string;
  }) {
    // Check if issue already exists for this date
    const existing = await this.repo.findByDate(data.publishDate);
    if (existing) {
      throw new AppError('CONFLICT', `A Patrika issue is already published or scheduled for date ${data.publishDate}`, 409);
    }

    const issue = await this.repo.createIssue({
      publishDate: data.publishDate,
      title: data.title,
      status: 'PROCESSING',
      pdfPath: data.pdfPath,
    });

    // Dispatch background analysis
    await dispatchPdfJob(issue.id, data.pdfPath);

    return issue;
  }

  async searchInside(query: string, issueId?: string) {
    return this.repo.searchPages(query, issueId);
  }

  async getAdminIssue(id: string) {
    const issue = await this.repo.findById(id);
    if (!issue) {
      throw new AppError('NOT_FOUND', 'Magazine issue not found', 404);
    }
    return issue;
  }

  async deleteIssue(id: string) {
    const issue = await this.repo.findForDelete(id);
    if (!issue) throw new AppError('NOT_FOUND', 'Magazine issue not found', 404);

    await this.repo.markAsDeleting(id).catch(() => undefined);
    await this.repo.deleteIssue(id);
    broadcastMagazineUpdate({ issueId: id, status: 'DELETED', action: 'deleted' });

    const generatedRoot = path.resolve(config.STORAGE_LOCAL_PATH, 'magazines');
    const generatedDir = path.resolve(generatedRoot, id);
    if (generatedDir.startsWith(`${generatedRoot}${path.sep}`)) {
      await fs.rm(generatedDir, { recursive: true, force: true }).catch(() => undefined);
    }

    if (issue.pdfPath) {
      const sourcePath = path.resolve(issue.pdfPath);
      const publicMagazineRoot = path.resolve(config.STORAGE_LOCAL_PATH, 'magazines');
      if (sourcePath.startsWith(`${publicMagazineRoot}${path.sep}`)) {
        await fs.rm(sourcePath, { force: true }).catch(() => undefined);
      }
    }
  }

  async updateAdminIssue(id: string, data: any) {
    const existing = await this.repo.findForDelete(id);
    if (!existing) throw new AppError('NOT_FOUND', 'Magazine issue not found', 404);

    if (data.status === 'PUBLISHED' || data.status === 'ARCHIVED') {
      const issue = await this.repo.findAdminIssueStatus(id);
      if (!issue) throw new AppError('NOT_FOUND', 'Magazine issue not found', 404);
      if (data.status === 'PUBLISHED' && issue.pageCount < 1) {
        throw new AppError('BAD_REQUEST', 'A magazine issue must have processed pages before it can be published', 409);
      }
      if (data.status === 'ARCHIVED' && issue.status !== 'PUBLISHED') {
        throw new AppError('BAD_REQUEST', 'Only a published issue can be unpublished', 409);
      }
    }

    const updatedIssue = await this.repo.updateIssue(id, data);
    if (data.status === 'PUBLISHED' || data.status === 'ARCHIVED') {
      broadcastMagazineUpdate({
        issueId: id,
        status: updatedIssue.status,
        action: 'updated',
      });
    }
    return updatedIssue;
  }
}
