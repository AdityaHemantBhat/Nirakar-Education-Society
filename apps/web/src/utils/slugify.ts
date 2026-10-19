/**
 * SEO-friendly slug generator for events, notices, and articles.
 * Converts titles into clean URL-safe slugs.
 */
export function slugify(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-alphanumeric chars
    .replace(/[\s_-]+/g, '-') // convert spaces and underscores to dashes
    .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes
}
