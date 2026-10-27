import PgBoss from 'pg-boss';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { analyzePdfIssue } from '../lib/pdf.js';
import { prisma } from '@nirakar/db';
import { broadcastMagazineUpdate } from '../lib/socket.js';
import { LIBRARY_PDF_JOB, runLibraryPdfJob, setLibraryPdfQueue } from './library-pdf.js';

export const MAGAZINE_PDF_JOB = 'process-magazine-pdf';

export let boss: PgBoss | null = null;
let workerReady = false;
let workerStart: Promise<void> | null = null;
const activeMagazineIssues = new Set<string>();

export async function startWorker(): Promise<void> {
  if (workerReady) return;
  if (workerStart) return workerStart;

  workerStart = startWorkerInternal();
  try {
    await workerStart;
  } finally {
    workerStart = null;
  }
}

async function startWorkerInternal(): Promise<void> {
  let worker: PgBoss | null = null;
  try {
    worker = new PgBoss({
      connectionString: config.DATABASE_URL,
      schema: 'pgboss',
    });

    worker.on('error', (error) => {
      logger.warn({ err: error }, 'PgBoss background worker warning');
    });

    await worker.start();
    logger.info('PgBoss background job worker started successfully');

    /* pg-boss 10 requires a queue to exist before a job can be sent to it.
       Without this, `send` quietly returns null and the job is never queued. */
    await worker.createQueue(LIBRARY_PDF_JOB);
    await worker.createQueue(MAGAZINE_PDF_JOB);

    await worker.work(LIBRARY_PDF_JOB, async (job: any) => {
      const singleJob = Array.isArray(job) ? job[0] : job;
      const { volumeId, pdfPath, isPublished } = (singleJob?.data || {}) as {
        volumeId: string;
        pdfPath: string;
        isPublished: boolean;
      };

      logger.info({ volumeId }, 'Beginning background PDF processing for Library Volume');
      await runLibraryPdfJob(volumeId, pdfPath, isPublished);
    });

    await worker.work(MAGAZINE_PDF_JOB, async (job: any) => {
      const singleJob = Array.isArray(job) ? job[0] : job;
      const { issueId, pdfFilePath } = (singleJob?.data || {}) as { issueId: string; pdfFilePath: string };
      logger.info({ issueId }, 'Beginning background PDF processing for Magazine Issue');
      await runMagazinePdfJob(issueId, pdfFilePath);
    });

    setLibraryPdfQueue({
      send: (name, data) => worker!.send(name, data as object),
    });
    boss = worker;
    workerReady = true;

    await recoverPendingMagazineIssues();
  } catch (err) {
    workerReady = false;
    boss = null;
    setLibraryPdfQueue(null);
    if (worker) {
      await worker.stop().catch((stopError) => logger.warn({ err: stopError }, 'Could not stop partially initialized PgBoss worker'));
    }
    logger.warn({ err }, 'Could not initialize PgBoss queue. Asynchronous background queue will use in-process dispatch fallback.');
  }
}

async function recoverPendingMagazineIssues(): Promise<void> {
  const issues = await prisma.magazineIssue.findMany({
    where: { status: 'PROCESSING', pdfPath: { not: null } },
    select: { id: true, pdfPath: true },
  });

  for (const issue of issues) {
    if (activeMagazineIssues.has(issue.id)) continue;
    if (!issue.pdfPath || !fs.existsSync(issue.pdfPath)) {
      logger.warn({ issueId: issue.id }, 'Marking stuck magazine issue as draft because its source PDF is missing');
      await prisma.magazineIssue.update({
        where: { id: issue.id },
        data: { status: 'DRAFT' },
      }).catch((err) => logger.error({ err, issueId: issue.id }, 'Could not mark magazine issue with missing PDF as draft'));
      broadcastMagazineUpdate({ issueId: issue.id, status: 'DRAFT', progress: 0, message: 'Source PDF is missing. Upload the issue again.' });
      continue;
    }
    await dispatchPdfJob(issue.id, issue.pdfPath);
  }
}

async function runMagazinePdfJob(issueId: string, pdfFilePath: string): Promise<void> {
  if (activeMagazineIssues.has(issueId)) {
    logger.info({ issueId }, 'Skipping duplicate in-process magazine PDF job');
    return;
  }
  activeMagazineIssues.add(issueId);
  try {
    await prisma.magazineIssue.update({
      where: { id: issueId },
      data: { status: 'PROCESSING', isLocked: false },
    });
    broadcastMagazineUpdate({ issueId, status: 'PROCESSING', progress: 0, message: 'Analyzing PDF' });

    const result = await analyzePdfIssue(pdfFilePath, issueId, (step, percent) => {
      logger.debug({ issueId, step, percent }, 'PDF Processing progress');
      broadcastMagazineUpdate({ issueId, status: 'PROCESSING', progress: percent, message: step });
    });

    await prisma.$transaction(async (tx) => {
      await tx.magazineIssuePage.deleteMany({ where: { issueId } });
      await tx.magazineArticle.deleteMany({ where: { issueId } });

      for (const page of result.pages) {
        await tx.magazineIssuePage.create({
          data: {
            issueId,
            pageNo: page.pageNo,
            text: page.text,
            textItems: page.textItems as any,
            imageVariants: page.imageVariants as any,
            blurhash: page.blurhash,
            hasOcr: page.hasOcr,
          },
        });
      }

      for (const article of result.articles) {
        await tx.magazineArticle.create({
          data: {
            issueId,
            title: article.title,
            startPage: article.startPage,
            author: article.author,
          },
        });
      }

      await tx.magazineIssue.update({
        where: { id: issueId },
        data: {
          status: 'PUBLISHED',
          isLocked: false,
          pageCount: result.pageCount,
          wordCount: result.wordCount,
          readingMinutes: result.readingMinutes,
          keywords: result.keywords,
          excerpt: result.excerpt,
          coverUrl: result.coverUrl,
        },
      });
    });

    broadcastMagazineUpdate({ issueId, status: 'PUBLISHED', progress: 100, message: 'Issue is ready to read' });
    logger.info({ issueId, pageCount: result.pageCount }, 'Magazine PDF processing completed');
  } catch (err) {
    logger.error({ err, issueId }, 'Magazine PDF processing failed');
    await fs.promises.rm(path.resolve(config.STORAGE_LOCAL_PATH, 'magazines', issueId), { recursive: true, force: true }).catch(() => undefined);
    await prisma.magazineIssue.update({
      where: { id: issueId },
      data: { status: 'DRAFT' },
    }).catch((updateError) => logger.error({ err: updateError, issueId }, 'Could not mark failed magazine processing'));
    broadcastMagazineUpdate({ issueId, status: 'DRAFT', progress: 0, message: 'PDF analysis failed' });
    throw err;
  } finally {
    activeMagazineIssues.delete(issueId);
  }
}

export async function dispatchPdfJob(issueId: string, pdfFilePath: string): Promise<void> {
  if (workerReady && boss) {
    try {
      const id = await boss.send(MAGAZINE_PDF_JOB, { issueId, pdfFilePath }, { singletonKey: `magazine-issue:${issueId}` });
      if (id) return;
      logger.warn({ issueId }, 'Magazine PDF job was not queued; running it in-process');
    } catch (err) {
      logger.warn({ err, issueId }, 'Could not queue magazine PDF job; running it in-process');
    }
  }

  setImmediate(() => {
    void runMagazinePdfJob(issueId, pdfFilePath).catch(() => undefined);
  });
}
