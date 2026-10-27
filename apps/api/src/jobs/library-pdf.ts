import { logger } from '../lib/logger.js';
import { LibraryService } from '../modules/library/library.service.js';

/**
 * Background rendering of library volumes.
 *
 * Turning a PDF into a readable book means rendering every page into five
 * image variants. For a large document that takes minutes, which is far
 * too long to hold an HTTP request open for — the browser would time out
 * and the admin would think the upload had failed.
 *
 * So the upload only records the file and returns; the rendering happens
 * here, on the queue if one is running and in-process otherwise.
 */

/** The queue name this job is sent to. */
export const LIBRARY_PDF_JOB = 'process-library-pdf';

/**
 * The queue, when pg-boss is running. It is set by the worker at startup.
 */
let queue: { send: (name: string, data: unknown) => Promise<string | null> } | null = null;

/** Called by the worker once pg-boss is up. */
export function setLibraryPdfQueue(q: typeof queue) {
  queue = q;
}

/**
 * Renders a volume, reporting progress as it goes. Used both by the queue
 * worker and by the in-process fallback.
 */
export async function runLibraryPdfJob(
  volumeId: string,
  pdfPath: string,
  isPublished: boolean,
): Promise<void> {
  const service = new LibraryService();

  try {
    await service.processVolume(volumeId, pdfPath, isPublished);
    logger.info({ volumeId }, 'Library PDF processing completed');
  } catch (err: any) {
    logger.error({ err, volumeId }, 'Library PDF processing failed');
    throw err;
  }
}

/**
 * Hands a freshly uploaded PDF to the background renderer.
 *
 * The function never rejects: if the queue cannot take the job, the work
 * still has to happen, so it falls back to running it in this process.
 */
export async function dispatchLibraryPdfJob(
  volumeId: string,
  pdfPath: string,
  isPublished: boolean,
): Promise<void> {
  if (queue) {
    try {
      const id = await queue.send(LIBRARY_PDF_JOB, { volumeId, pdfPath, isPublished });
      /* pg-boss returns null when it declines the job — for instance when
         the queue has not been created. That is not a success, so the work
         is run here instead of being silently dropped. */
      if (id) return;
      logger.warn({ volumeId }, 'The library PDF job was not queued; running it here instead');
    } catch (err) {
      logger.warn({ err, volumeId }, 'Could not queue the library PDF job; running it here instead');
    }
  }

  /* No queue available — start the work without awaiting it, so the upload
     response is not held up by it. */
  setImmediate(() => {
    void runLibraryPdfJob(volumeId, pdfPath, isPublished).catch(() => undefined);
  });
}
