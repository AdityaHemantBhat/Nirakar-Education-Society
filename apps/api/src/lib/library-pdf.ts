import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { encode } from 'blurhash';
import { config } from '../config/index.js';

/**
 * Library volume page rendering.
 *
 * The magazine pipeline already renders PDF pages to multi-resolution WebP via
 * pdfjs + @napi-rs/canvas + sharp. This module follows the same shape but is
 * tuned for library volumes:
 *   - a hard page-count ceiling that keeps one volume from monopolising disk
 *   - sequential page rendering to bound peak memory (a 400-page PDF at 2x
 *     scale would otherwise hold every bitmap alive at once)
 *   - text extraction so the reader's accessible text mode and in-book search
 *     work without a second pass over the source PDF
 */

export interface LibraryPageImageVariants {
  thumb: string;
  w640: string;
  w1024: string;
  w1600: string;
  zoom: string;
}

export interface ExtractedLibraryPage {
  pageNo: number;
  text: string;
  imageVariants: LibraryPageImageVariants;
  blurhash: string;
}

export interface LibraryPdfResult {
  /** The number of pages actually rendered into the book. */
  pageCount: number;
  /** The number of pages the source PDF really had. */
  sourcePageCount: number;
  /**
   * True when the source was longer than the page ceiling and was therefore
   * sampled — the book shows an even spread of the document rather than
   * every page.
   */
  isSampled: boolean;
  wordCount: number;
  readingMinutes: number;
  keywords: string[];
  excerpt: string;
  coverUrl: string;
  pages: ExtractedLibraryPage[];
}

/**
 * A single volume may not exceed this many pages.
 *
 * The ceiling is on *rendered* pages rather than on the PDF's own page
 * count: a large document is a legitimate upload, and the way to keep it
 * affordable is to render fewer pages rather than to refuse the file.
 */
export const MAX_LIBRARY_PAGES = 400;

/**
 * The most pages a PDF may contain before it is refused outright.
 *
 * This is a sanity ceiling, not a quality one — a 12,000-page document is
 * unusual but not malformed, so it is accepted and sampled down to
 * {@link MAX_LIBRARY_PAGES} rendered pages rather than turned away.
 */
export const MAX_SOURCE_PAGES = 20_000;

/** The largest PDF that is accepted, in bytes. */
export const MAX_PDF_BYTES = 100 * 1024 * 1024;

/** Render scale for the mid/high-resolution variants. */
const RENDER_SCALE = 2.0;

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'to', 'for', 'with', 'as',
  'by', 'from', 'this', 'that', 'it', 'be', 'are', 'was', 'were', 'will', 'have', 'has', 'had',
  'shri', 'vidyalaya', 'school', 'nirakar', 'society', 'page', 'chapter', 'mashem', 'canacona',
  'exercise', 'questions', 'answer', 'student', 'teacher', 'notes', 'unit',
]);

/**
 * Classical RAKE/TF-IDF keyword extraction — deterministic, no external AI.
 */
export function extractLibraryKeywords(text: string, maxKeywords = 8): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
}

/** Extractive excerpt: the first few meaningful sentences. */
export function extractLibraryExcerpt(text: string, maxLen = 280): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';

  const sentences = clean.split(/(?<=[.?!])\s+/);
  let result = '';
  for (const s of sentences) {
    if ((result + ' ' + s).trim().length > maxLen) break;
    result = (result + ' ' + s).trim();
    if (result.length >= 100) break;
  }
  return result || clean.slice(0, maxLen);
}

/**
 * Validates the PDF header and size. Runs before any parsing so a malformed
 * upload fails fast rather than halfway through rendering.
 */
export async function validateLibraryPdf(filePath: string): Promise<void> {
  const fileHandle = await fs.open(filePath, 'r');
  const buffer = Buffer.alloc(5);
  await fileHandle.read(buffer, 0, 5, 0);
  await fileHandle.close();

  if (buffer.toString('utf-8', 0, 4) !== '%PDF') {
    throw new Error('Invalid file format: file header does not match the %PDF specification');
  }

  const stat = await fs.stat(filePath);
  if (stat.size > MAX_PDF_BYTES) {
    throw new Error(
      `File exceeds the maximum allowable size of ${Math.round(MAX_PDF_BYTES / (1024 * 1024))} MB`,
    );
  }
}

/**
 * Chooses which pages of a source document are rendered.
 *
 * A document inside the page ceiling is rendered in full. A larger one is
 * *sampled* — evenly spread across the whole document rather than truncated
 * at the front — so a 12,000-page book still yields a readable book that
 * opens at its beginning and shows the whole span, instead of being refused.
 *
 * The result never has more than `maxPages` entries. The last page of the
 * document is always among them, so the room for it is taken from the
 * sample rather than added to it.
 */
export function selectPagesToRender(sourcePageCount: number, maxPages = MAX_LIBRARY_PAGES): number[] {
  if (sourcePageCount <= maxPages) {
    return Array.from({ length: sourcePageCount }, (_, i) => i + 1);
  }

  /* Evenly spaced sample, always including the first and the last page. */
  const step = sourcePageCount / maxPages;
  const chosen: number[] = [];
  for (let i = 0; i < maxPages; i++) {
    const page = Math.min(sourcePageCount, Math.floor(i * step) + 1);
    if (chosen[chosen.length - 1] !== page) chosen.push(page);
  }

  /* The last page of the document has to be in the book. If the even
     spacing left it out, it takes the place of the final entry — so the
     ceiling is still respected. */
  if (chosen[chosen.length - 1] !== sourcePageCount) {
    chosen[chosen.length - 1] = sourcePageCount;
  }

  return chosen;
}

/**
 * Renders every page of the PDF into multi-resolution WebP variants and
 * extracts the text layer.
 *
 * Pages are rendered one at a time and their bitmaps are released before the
 * next one, so peak memory stays proportional to a single page rather than to
 * the whole document.
 *
 * Each page is rasterised **once** and every variant is derived from that
 * one bitmap. Decoding a page is by far the most expensive step, so
 * rendering it once and downscaling five times is several times faster than
 * re-encoding the source five times.
 */
export async function analyzeLibraryPdf(
  pdfFilePath: string,
  volumeId: string,
  onProgress?: (step: string, percent: number) => void
): Promise<LibraryPdfResult> {
  await validateLibraryPdf(pdfFilePath);
  onProgress?.('Validating PDF integrity', 5);

  const baseDir = path.resolve(config.STORAGE_LOCAL_PATH, 'library', volumeId);
  await fs.mkdir(baseDir, { recursive: true });

  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  /* The file is read once and handed to pdf.js as a view over that buffer.
     Passing `data` (rather than a URL) means the bytes are not copied again
     internally, which matters a great deal for a 50 MB document. */
  const pdfData = new Uint8Array(await fs.readFile(pdfFilePath));
  const doc = await pdfjsLib.getDocument({
    data: pdfData,
    useSystemFonts: true,
    /* Page images are produced by us, so pdf.js does not need to keep its
       own canvas copies around. */
    disableAutoFetch: false,
    isEvalSupported: false,
  }).promise;

  const sourcePageCount = doc.numPages;
  if (sourcePageCount < 1) {
    throw new Error('PDF contains no readable pages');
  }
  if (sourcePageCount > MAX_SOURCE_PAGES) {
    throw new Error(
      `PDF exceeds the maximum allowed page count (${MAX_SOURCE_PAGES} pages, received ${sourcePageCount})`,
    );
  }

  /* A large document is sampled down to the page ceiling rather than
     refused. The reader is told how many pages the source really had. */
  const pagesToRender = selectPagesToRender(sourcePageCount);
  const isSampled = pagesToRender.length < sourcePageCount;

  onProgress?.('Extracting document metadata', 10);
  await doc.getMetadata().catch(() => ({ info: {} }));

  const pages: ExtractedLibraryPage[] = [];
  let fullText = '';
  let rendered = 0;

  for (const pageNo of pagesToRender) {
    /* The volume may have been deleted while it was being rendered. The
       directory is checked rather than the row, because the row is gone
       by then and the files are what would be left behind. */
    if (!fsSync.existsSync(baseDir)) {
      throw new Error('The volume was removed while it was being rendered.');
    }

    rendered += 1;
    onProgress?.(
      `Rendering page ${pageNo} of ${sourcePageCount}`,
      Math.round(10 + (rendered / pagesToRender.length) * 80),
    );

    const page = await doc.getPage(pageNo);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    fullText += ' ' + pageText;

    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const { createCanvas } = await import('@napi-rs/canvas');
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');

    // @ts-expect-error napi canvas compatibility with pdfjs
    await page.render({ canvasContext: ctx, viewport }).promise;

    /* The page is rasterised once. Every variant below is a downscale of
       this single bitmap, so the expensive decode happens one time. */
    const renderedPage = sharp(canvas.toBuffer('image/png'));

    /* Release the page's resources before the next iteration so a long
       document does not accumulate every decoded page in memory. */
    page.cleanup();
    ctx.canvas.width = 0;
    ctx.canvas.height = 0;

    const pageBase = `page-${pageNo}`;
    const files = {
      thumb: `${pageBase}-thumb.webp`,
      w640: `${pageBase}-640.webp`,
      w1024: `${pageBase}-1024.webp`,
      w1600: `${pageBase}-1600.webp`,
      zoom: `${pageBase}-zoom.webp`,
    };

    /* The variants are produced together, in parallel. Each is an
       independent downscale of the same source, so there is no ordering
       constraint between them. */
    await Promise.all([
      renderedPage.clone().resize(160).webp({ quality: 72 }).toFile(path.join(baseDir, files.thumb)),
      renderedPage.clone().resize(640).webp({ quality: 78 }).toFile(path.join(baseDir, files.w640)),
      renderedPage.clone().resize(1024).webp({ quality: 80 }).toFile(path.join(baseDir, files.w1024)),
      renderedPage.clone().resize(1600).webp({ quality: 84 }).toFile(path.join(baseDir, files.w1600)),
      renderedPage.clone().webp({ quality: 88 }).toFile(path.join(baseDir, files.zoom)),
    ]);

    /* Blurhash gives the reader an instant paper-texture placeholder while
       the WebP variants stream in. */
    let pageBlurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';
    try {
      const rawRgba = await renderedPage
        .clone()
        .resize(32, 32)
        .ensureAlpha()
        .raw()
        .toBuffer();
      pageBlurhash = encode(new Uint8ClampedArray(rawRgba), 32, 32, 4, 4);
    } catch {
      /* keep the default placeholder */
    }

    const publicBase = `/uploads/library/${volumeId}`;
    pages.push({
      pageNo,
      text: pageText,
      imageVariants: {
        thumb: `${publicBase}/${files.thumb}`,
        w640: `${publicBase}/${files.w640}`,
        w1024: `${publicBase}/${files.w1024}`,
        w1600: `${publicBase}/${files.w1600}`,
        zoom: `${publicBase}/${files.zoom}`,
      },
      blurhash: pageBlurhash,
    });
  }

  onProgress?.('Compiling search index', 92);

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));
  const keywords = extractLibraryKeywords(fullText);
  const excerpt = extractLibraryExcerpt(fullText);
  const coverUrl = pages[0]?.imageVariants.w1024 || '';

  await doc.destroy().catch(() => undefined);
  onProgress?.('Completed', 100);

  return {
    /* The reader sees the number of pages actually rendered. */
    pageCount: pages.length,
    /* The real length of the source document, which may be larger. */
    sourcePageCount,
    isSampled,
    wordCount,
    readingMinutes,
    keywords,
    excerpt,
    coverUrl,
    pages,
  };
}

/**
 * Derives a URL-safe slug. Collisions are resolved by the caller, which
 * appends a numeric suffix.
 */
export function slugifyLibraryTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'volume'
  );
}
