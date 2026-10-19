import PgBoss from 'pg-boss';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { analyzePdfIssue } from '../lib/pdf.js';
import { prisma } from '@nirakar/db';

export let boss: PgBoss | null = null;

export async function startWorker(): Promise<void> {
  try {
    boss = new PgBoss({
      connectionString: config.DATABASE_URL,
      schema: 'pgboss',
    });

    boss.on('error', (error) => {
      logger.warn({ err: error }, 'PgBoss background worker warning');
    });

    await boss.start();
    logger.info('PgBoss background job worker started successfully');

    await boss.work('process-magazine-pdf', async (job: any) => {
      const singleJob = Array.isArray(job) ? job[0] : job;
      const { issueId, pdfFilePath } = (singleJob?.data || {}) as { issueId: string; pdfFilePath: string };
      logger.info({ issueId }, 'Beginning background PDF processing for Magazine Issue');

      try {
        await prisma.magazineIssue.update({
          where: { id: issueId },
          data: { status: 'PROCESSING' },
        });

        const result = await analyzePdfIssue(pdfFilePath, issueId, (step, percent) => {
          logger.debug({ issueId, step, percent }, 'PDF Processing progress');
        });

        // Save pages and articles in a transaction
        await prisma.$transaction(async (tx) => {
          // Delete old pages if re-processing
          await tx.magazineIssuePage.deleteMany({ where: { issueId } });
          await tx.magazineArticle.deleteMany({ where: { issueId } });

          // Insert extracted pages
          for (const p of result.pages) {
            await tx.magazineIssuePage.create({
              data: {
                issueId,
                pageNo: p.pageNo,
                text: p.text,
                textItems: p.textItems as any,
                imageVariants: p.imageVariants as any,
                blurhash: p.blurhash,
                hasOcr: p.hasOcr,
              },
            });
          }

          // Insert table of contents articles
          for (const a of result.articles) {
            await tx.magazineArticle.create({
              data: {
                issueId,
                title: a.title,
                startPage: a.startPage,
                author: a.author,
              },
            });
          }

          // Update issue metadata
          await tx.magazineIssue.update({
            where: { id: issueId },
            data: {
              status: 'PUBLISHED',
              pageCount: result.pageCount,
              wordCount: result.wordCount,
              readingMinutes: result.readingMinutes,
              keywords: result.keywords,
              excerpt: result.excerpt,
              coverUrl: result.coverUrl,
            },
          });
        });

        logger.info({ issueId, pageCount: result.pageCount }, 'Magazine PDF processing completed');
      } catch (err: any) {
        logger.error({ err, issueId }, 'Magazine PDF processing failed');
        await prisma.magazineIssue.update({
          where: { id: issueId },
          data: { status: 'DRAFT' },
        });
        throw err;
      }
    });
  } catch (err) {
    logger.warn({ err }, 'Could not initialize PgBoss queue. Asynchronous background queue will use in-process dispatch fallback.');
  }
}

export async function dispatchPdfJob(issueId: string, pdfFilePath: string): Promise<void> {
  if (boss) {
    await boss.send('process-magazine-pdf', { issueId, pdfFilePath });
  } else {
    // Immediate in-process execution fallback
    setImmediate(async () => {
      try {
        const result = await analyzePdfIssue(pdfFilePath, issueId);
        await prisma.$transaction(async (tx) => {
          await tx.magazineIssuePage.deleteMany({ where: { issueId } });
          await tx.magazineArticle.deleteMany({ where: { issueId } });

          for (const p of result.pages) {
            await tx.magazineIssuePage.create({
              data: {
                issueId,
                pageNo: p.pageNo,
                text: p.text,
                textItems: p.textItems as any,
                imageVariants: p.imageVariants as any,
                blurhash: p.blurhash,
                hasOcr: p.hasOcr,
              },
            });
          }

          for (const a of result.articles) {
            await tx.magazineArticle.create({
              data: {
                issueId,
                title: a.title,
                startPage: a.startPage,
                author: a.author,
              },
            });
          }

          await tx.magazineIssue.update({
            where: { id: issueId },
            data: {
              status: 'PUBLISHED',
              pageCount: result.pageCount,
              wordCount: result.wordCount,
              readingMinutes: result.readingMinutes,
              keywords: result.keywords,
              excerpt: result.excerpt,
              coverUrl: result.coverUrl,
            },
          });
        });
      } catch (err) {
        logger.error({ err, issueId }, 'In-process PDF processing fallback failed');
      }
    });
  }
}
