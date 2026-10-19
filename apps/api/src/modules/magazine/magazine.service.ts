import { MagazineRepository } from './magazine.repository.js';
import { AppError } from '../../middleware/error.js';
import { dispatchPdfJob } from '../../jobs/boss.js';
import { AccessRepository } from '../access/access.repository.js';

export class MagazineService {
  constructor(
    private repo = new MagazineRepository(),
    private accessRepo = new AccessRepository()
  ) {}

  async getCalendar(year: number, month: number) {
    return this.repo.findCalendarIssues(year, month);
  }

  async getIssueByDate(
    publishDate: string,
    reader: { userId?: string; deviceId: string; role?: string }
  ) {
    let issue = null;
    if (publishDate === 'today' || publishDate === 'latest') {
      issue = await this.repo.findLatest();
    } else {
      issue = await this.repo.findByDate(publishDate);
      if (!issue) {
        issue = await this.repo.findById(publishDate);
      }
      if (!issue) {
        issue = await this.repo.findLatest();
      }
    }

    if (!issue) {
      throw new AppError('NOT_FOUND', 'Magazine issue not found', 404);
    }

    // Check Entitlement if Issue is Locked
    let hasFullAccess = !issue.isLocked;

    if (issue.isLocked) {
      // 1. Check if user has active pass
      if (reader.userId) {
        hasFullAccess = await this.accessRepo.hasActivePass(reader.userId);
      }

      // 2. If no pass, check metered free reads
      if (!hasFullAccess) {
        const canFreeRead = await this.accessRepo.canMeteredRead(
          reader.userId,
          reader.deviceId,
          'MAGAZINE',
          issue.id
        );
        if (canFreeRead) {
          hasFullAccess = true;
          // Record read event
          await this.accessRepo.recordReadEvent(reader.userId, reader.deviceId, 'MAGAZINE', issue.id);
        }
      }
    }

    // If no full access, provide preview: first 2 pages only
    if (!hasFullAccess) {
      return {
        ...issue,
        isPaywalled: true,
        pages: issue.pages.map((p) => {
          if (p.pageNo <= 2) return p;
          return {
            id: p.id,
            pageNo: p.pageNo,
            text: '',
            textItems: null,
            imageVariants: {
              thumb: (p.imageVariants as any)?.thumb,
              w640: '',
              w1024: '',
              w1600: '',
              zoom: '',
            },
            blurhash: p.blurhash,
            isLockedPage: true,
          };
        }),
      };
    }

    return {
      ...issue,
      isPaywalled: false,
    };
  }

  async uploadAndCreateIssue(data: {
    publishDate: string;
    title: string;
    pdfPath: string;
    isLocked?: boolean;
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
      isLocked: data.isLocked ?? true,
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

  async updateAdminIssue(id: string, data: any) {
    return this.repo.updateIssue(id, data);
  }
}
