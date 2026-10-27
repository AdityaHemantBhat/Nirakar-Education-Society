/**
 * Reading the circulars and the gatherings.
 *
 * Everything the public pages show about a notice or an event comes from
 * the registry through these calls. There is no second, hand-written copy
 * of the notices anywhere on the site.
 */

import {
  contentSlug,
  noticeCategoryFromTitle,
  noticeRefNo,
  campusLabel,
  decodeNoticeMeta,
  eventCategoryFromTitle,
  eventTimeRange,
  parseEventPhotos,
  parseEventDocuments,
  CAMPUS_NAMES,
  MONTH_ABBREVIATIONS,
  type NoticeCategory,
} from '@nirakar/shared';
import type { CampusEvent, NoticeItem } from '../components/NewsAndEvents.js';

/* -------------------------------------------------------------------------- */
/* Talking to the server                                                      */
/* -------------------------------------------------------------------------- */

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

/** Every circular in the registry. */
export async function fetchNotices(): Promise<NoticeItem[]> {
  const rows = await getJson<any[]>('/api/v1/content/notices');
  if (!rows) return [];
  return rows.map(toNoticeItem);
}

/** One circular, by its web address. */
export async function fetchNotice(slug: string): Promise<NoticeItem | null> {
  const row = await getJson<any>(
    `/api/v1/content/notices/${encodeURIComponent(slug)}`,
  );
  if (!row) return null;
  return toNoticeItem(row);
}

/** Every gathering in the selected calendar view. */
export async function fetchEvents(options: { filter?: 'all' | 'today' | 'upcoming' | 'past'; institutionCode?: string } = {}): Promise<CampusEvent[]> {
  const params = new URLSearchParams();
  if (options.filter) params.set('filter', options.filter);
  if (options.institutionCode && options.institutionCode !== 'all') params.set('institutionCode', options.institutionCode);
  const query = params.toString();
  const rows = await getJson<any[]>(`/api/v1/content/events${query ? `?${query}` : ''}`);
  if (!rows) return [];
  return rows.map(toCampusEvent);
}

/** One gathering, by its web address. */
export async function fetchEvent(slug: string): Promise<CampusEvent | null> {
  const row = await getJson<any>(
    `/api/v1/content/events/${encodeURIComponent(slug)}`,
  );
  if (!row) return null;
  return toCampusEvent(row);
}

export interface EventComment {
  id: string;
  authorName: string;
  place?: string | null;
  content: string;
  createdAt: string;
}

export async function fetchEventComments(eventId: string): Promise<EventComment[]> {
  const params = new URLSearchParams({ targetType: 'EVENT', targetId: eventId });
  return (await getJson<EventComment[]>(`/api/v1/content/comments?${params}`)) ?? [];
}

export async function submitEventComment(input: {
  eventId: string;
  authorName: string;
  place?: string;
  email: string;
  content: string;
  captchaToken: string;
}): Promise<EventComment | null> {
  try {
    const response = await fetch('/api/v1/content/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetType: 'EVENT',
        targetId: input.eventId,
        authorName: input.authorName,
        place: input.place || null,
        email: input.email,
        content: input.content,
        captchaToken: input.captchaToken,
      }),
    });
    if (!response.ok) {
      const json = await response.json().catch(() => null);
      throw new Error(json?.error?.message || 'Could not publish your comment.');
    }
    const json = await response.json();
    return json?.data ?? null;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Could not publish your comment.');
  }
}

/* -------------------------------------------------------------------------- */
/* Turning a registry row into something a page can draw                      */
/* -------------------------------------------------------------------------- */

/** A circular, ready for the notice board. */
export function toNoticeItem(row: any): NoticeItem {
  const decoded = decodeNoticeMeta(row.content);
  const institutionCode = row.institutionCode ?? null;

  const type: NoticeCategory =
    row.category ?? noticeCategoryFromTitle(row.title);

  return {
    id: String(row.id),
    refNo: row.refNo ?? noticeRefNo(decoded.refNo, institutionCode, row.id),
    type,
    title: row.title,
    date: row.date,
    urgent: row.urgent !== undefined ? Boolean(row.urgent) : decoded.urgent,
    fileSize: row.pdfUrl ? 'Official PDF' : 'Circular',
    target: row.target ?? campusLabel(institutionCode),
    institutionCode: institutionCode ?? '',
    description: decoded.content || row.content || '',
    pdfUrl: row.pdfUrl ?? null,
    pinned: Boolean(row.pinned),
  };
}

/**
 * The picture a card shows when the office has not put one on the record.
 *
 * A gathering may be published without any photograph at all, so the card
 * needs something to show rather than a broken image.
 */
export const EVENT_COVER_FALLBACK = '/images/mashem_campus.jpg';

/** A gathering, ready for the calendar. */
export function toCampusEvent(row: any): CampusEvent {
  const photos = parseEventPhotos(row.photos);
  const documents = parseEventDocuments(row.documents);
  const start = new Date(row.startDate);
  const valid = !Number.isNaN(start.getTime());

  /* The picture the office actually put on the record. The fallback is only
     for the card; it is not a photograph of this gathering, so it does not
     go into the gallery. */
  const storedCover = row.coverUrl || photos[0]?.url || '';
  const cover = storedCover || EVENT_COVER_FALLBACK;

  return {
    id: String(row.id),
    title: row.title,
    dateStr: valid
      ? start.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '',
    rawStartDate: row.startDate,
    rawEndDate: row.endDate ?? null,
    day: valid ? String(start.getDate()).padStart(2, '0') : '',
    month: valid ? MONTH_ABBREVIATIONS[start.getMonth()] : '',
    year: valid ? String(start.getFullYear()) : '',
    weekday: valid ? start.toLocaleDateString('en-US', { weekday: 'long' }) : '',
    time: row.time ?? eventTimeRange(row.startDate, row.endDate),
    location: row.location ?? '',
    campus:
      row.campus ??
      (row.institutionCode
        ? CAMPUS_NAMES[row.institutionCode as keyof typeof CAMPUS_NAMES]
        : 'Society Central') ??
      'Society Central',
    institutionCode: row.institutionCode ?? '',
    category: row.category ?? eventCategoryFromTitle(row.title),
    coverImage: cover,
    photos: photos.length
      ? photos
      : storedCover
        ? [{ url: storedCover, caption: row.title, altText: row.title }]
        : [],
    documents: documents.length
      ? documents
      : row.pdfUrl
        ? [{ url: row.pdfUrl, title: 'Official Event Protocols & Schedule' }]
        : [],
    videoUrl: row.videoUrl ?? null,
    pdfUrl: row.pdfUrl ?? documents[0]?.url ?? null,
    description: row.description ?? '',
    isUpcoming: row.isUpcoming ?? true,
  };
}

export { contentSlug };
