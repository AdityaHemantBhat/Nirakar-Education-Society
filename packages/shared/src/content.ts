/**
 * The shared language of notices and events.
 *
 * Both the API and the public site need to agree on three things: what a
 * notice or event is called, what its web address is, and which campus it
 * belongs to. If the two sides each guess their own slugs, a link built on
 * the site can land on a page the server cannot find. So the rules live
 * here, once, and both sides import them.
 */

import { SCHOOLS, type SchoolCode } from './constants.js';

/* -------------------------------------------------------------------------- */
/* Slugs                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The web address of a notice or an event.
 *
 * The same function runs when the server looks a record up and when the
 * site builds a link to it, so a link always finds its way home.
 */
export function contentSlug(title: string | null | undefined): string {
  if (!title) return '';
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // drop punctuation, keeping letters, digits and marks
    .replace(/[\s_-]+/g, '-') // spaces and underscores become dashes
    .replace(/^-+|-+$/g, ''); // no dash at either end
}

/** The address of a notice's own page. */
export function noticeHref(slug: string): string {
  return `/notices/${slug}`;
}

/** The address of an event's own page. */
export function eventHref(slug: string): string {
  return `/events/${slug}`;
}

/* -------------------------------------------------------------------------- */
/* Campuses                                                                   */
/* -------------------------------------------------------------------------- */

/** How each campus is written out on the public pages. */
export const CAMPUS_LABELS: Record<SchoolCode, string> = {
  NIRAKAR_HS: 'Shri Nirakar High School • Mashem',
  TUDAL_HS: 'Tudal High School • Gaondongrem',
  ANGLE_HSS: 'S. S. Angle Higher Secondary School • Dapot',
};

/** The same campuses, without the bullet between the name and the place. */
export const CAMPUS_NAMES: Record<SchoolCode, string> = {
  NIRAKAR_HS: 'Shri Nirakar High School, Mashem',
  TUDAL_HS: 'Tudal High School, Gaondongrem',
  ANGLE_HSS: 'S. S. Angle Higher Secondary School, Dapot',
};

/** The short form used in tight spaces, such as a card's footer. */
export const CAMPUS_SHORT_LABELS: Record<SchoolCode, string> = {
  NIRAKAR_HS: 'Nirakar HS',
  TUDAL_HS: 'Tudal HS',
  ANGLE_HSS: 'S.S. Angle HSS',
};

/** The jurisdiction a notice or event belongs to, or the whole Society. */
export function campusLabel(code: string | null | undefined, short = false): string {
  if (!code) return 'All Society Campuses';
  const table = short ? CAMPUS_SHORT_LABELS : CAMPUS_LABELS;
  return table[code as SchoolCode] ?? 'All Society Campuses';
}

/* -------------------------------------------------------------------------- */
/* Notices                                                                    */
/* -------------------------------------------------------------------------- */

/** The kinds of circular the archive sorts itself into. */
export const NOTICE_CATEGORIES = ['exam', 'admission', 'scholarship', 'circular'] as const;
export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

/** How each kind of circular is written on the page. */
export const NOTICE_CATEGORY_LABELS: Record<NoticeCategory, string> = {
  exam: 'Board Exam',
  admission: 'Admissions',
  scholarship: 'Scholarship',
  circular: 'Official Gazette',
};

/**
 * Which kind of circular a title describes.
 *
 * The registry has no category column, so the kind is read from the words
 * the title uses. A title that names none of them is simply a circular.
 */
export function noticeCategoryFromTitle(title: string | null | undefined): NoticeCategory {
  const t = (title || '').toLowerCase();
  if (
    t.includes('exam') ||
    t.includes('board') ||
    t.includes('timetable') ||
    t.includes('form') ||
    t.includes('ssc') ||
    t.includes('hssc')
  ) {
    return 'exam';
  }
  if (t.includes('admission') || t.includes('enrollment') || t.includes('prospectus')) {
    return 'admission';
  }
  if (
    t.includes('scholarship') ||
    t.includes('tribal') ||
    t.includes('dbt') ||
    t.includes('grant')
  ) {
    return 'scholarship';
  }
  return 'circular';
}

/**
 * The registry reference a circular is filed under.
 *
 * A circular may carry its own reference, written into the body by the
 * office. When it does not, one is derived from the campus and the
 * record's own number, so every circular still has a citation.
 */
export function noticeRefNo(
  declaredRefNo: string | null | undefined,
  institutionCode: string | null | undefined,
  id: string | null | undefined,
): string {
  const declared = (declaredRefNo || '').trim();
  if (declared) return declared;

  const tail = String(id || '').slice(-4).toUpperCase();
  if (institutionCode) {
    return `${institutionCode.replace('_', '/')}/CIR/${tail}`;
  }
  return `SNES/CIR/${tail}`;
}

/* -------------------------------------------------------------------------- */
/* Notice metadata                                                            */
/* -------------------------------------------------------------------------- */

/**
 * The reference number and the urgent flag are kept in the body of a
 * circular, in a small comment at the very top, so that the registry needs
 * no extra columns and old records keep working.
 */
export interface NoticeMeta {
  refNo: string;
  urgent: boolean;
}

/** The same metadata, as it is read back out of a circular's body. */
export type DecodedNoticeMeta = NoticeMeta;

const NOTICE_META_PATTERN = /^<!--NOTICE_META:(\{.*?\})-->\n?/;

/** Reads the reference number and the urgent flag out of a circular's body. */
export function decodeNoticeMeta(rawContent: string | null | undefined): {
  content: string;
  refNo: string;
  urgent: boolean;
} {
  if (!rawContent) return { content: '', refNo: '', urgent: false };

  const match = rawContent.match(NOTICE_META_PATTERN);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      return {
        content: rawContent.slice(match[0].length),
        refNo: parsed.refNo || '',
        urgent: Boolean(parsed.urgent),
      };
    } catch {
      /* The comment was not ours, so it is read as plain text. */
    }
  }
  return { content: rawContent, refNo: '', urgent: false };
}

/** Writes the reference number and the urgent flag into a circular's body. */
export function encodeNoticeMeta(
  body: string,
  meta: { refNo?: string | null; urgent?: boolean },
): string {
  const cleanRef = meta.refNo ? meta.refNo.trim() : '';
  const isUrgent = Boolean(meta.urgent);
  if (!cleanRef && !isUrgent) return body;

  const header = `<!--NOTICE_META:${JSON.stringify({ refNo: cleanRef, urgent: isUrgent })}-->\n`;
  return header + (body || '');
}

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

/** The kinds of gathering the calendar sorts itself into. */
export const EVENT_CATEGORIES = [
  'Athletics & Sports',
  'Academic Honor',
  'Alumni Gathering',
  'Cultural Festival',
  'Science & Innovation',
  'Campus Gathering',
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/**
 * Which kind of gathering an event is.
 *
 * As with circulars, the registry has no category column, so the kind is
 * read from the title. A title that names none of them is a gathering.
 */
export function eventCategoryFromTitle(title: string | null | undefined): EventCategory {
  const t = (title || '').toLowerCase();
  if (t.includes('athletic') || t.includes('sports') || t.includes('volleyball')) {
    return 'Athletics & Sports';
  }
  if (
    t.includes('merit') ||
    t.includes('felicitation') ||
    t.includes('academic') ||
    t.includes('board')
  ) {
    return 'Academic Honor';
  }
  if (t.includes('alumni') || t.includes('reunion')) return 'Alumni Gathering';
  if (
    t.includes('natak') ||
    t.includes('cultural') ||
    t.includes('fugdi') ||
    t.includes('folk') ||
    t.includes('utsav')
  ) {
    return 'Cultural Festival';
  }
  if (t.includes('science') || t.includes('robotics') || t.includes('exhibition')) {
    return 'Science & Innovation';
  }
  return 'Campus Gathering';
}

/** The month abbreviations the calendar tiles use. */
export const MONTH_ABBREVIATIONS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

/**
 * The time of day an event runs, worked out from the hours it starts and
 * ends. An event with no end time is shown as a single moment.
 */
export function eventTimeRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): string {
  const start = formatClock(startDate);
  const end = formatClock(endDate);
  if (!start) return '';
  return end ? `${start} – ${end}` : start;
}

/** The hour of a timestamp, written the way a clock face says it. */
function formatClock(value: string | null | undefined): string {
  if (!value || !value.includes('T')) return '';
  const timePart = value.split('T')[1];
  if (!timePart) return '';
  const [hh, mm] = timePart.split(':');
  const hour = parseInt(hh, 10);
  if (isNaN(hour)) return '';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(formattedHour).padStart(2, '0')}:${mm || '00'} ${ampm}`;
}

/* -------------------------------------------------------------------------- */
/* The records the site reads                                                 */
/* -------------------------------------------------------------------------- */

/** A circular, as the public site reads it. */
export interface NoticeRecord {
  id: string;
  title: string;
  date: string;
  content: string;
  refNo: string;
  urgent: boolean;
  pinned: boolean;
  pdfUrl: string | null;
  institutionCode: string | null;
  category: NoticeCategory;
  target: string;
  slug: string;
}

/** A gathering, as the public site reads it. */
export interface EventRecord {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  isUpcoming: boolean;
  coverUrl: string | null;
  pdfUrl: string | null;
  photos: EventPhoto[];
  documents: EventDocument[];
  videoUrl: string | null;
  institutionCode: string | null;
  category: EventCategory;
  campus: string;
  time: string;
  slug: string;
}

/** One photograph in an event's gallery. */
export interface EventPhoto {
  url: string;
  caption?: string;
  altText?: string;
}

/** One document attached to an event. */
export interface EventDocument {
  url: string;
  title: string;
  size?: string;
}

/** A list that may have been stored as an array or as its own text. */
function readStoredList(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** The photographs of an event, however they were stored. */
export function parseEventPhotos(value: unknown): EventPhoto[] {
  return readStoredList(value)
    .filter((p) => p && typeof p.url === 'string')
    .map((p) => ({
      url: p.url,
      caption: p.caption ?? undefined,
      altText: p.altText ?? undefined,
    }));
}

/** The documents of an event, however they were stored. */
export function parseEventDocuments(value: unknown): EventDocument[] {
  return readStoredList(value)
    .filter((d) => d && typeof d.url === 'string')
    .map((d) => ({
      url: d.url,
      title: d.title ?? 'Official Document',
      size: d.size ?? undefined,
    }));
}

/** Turns a row of the registry into the shape the public site reads. */
export function toNoticeRecord(row: any): NoticeRecord {
  const decoded = decodeNoticeMeta(row.content);
  const institutionCode = row.institutionCode ?? null;

  return {
    id: String(row.id),
    title: row.title,
    date: row.date,
    content: decoded.content,
    refNo: noticeRefNo(decoded.refNo || row.refNo, institutionCode, row.id),
    urgent: row.urgent !== undefined ? Boolean(row.urgent) : decoded.urgent,
    pinned: Boolean(row.pinned),
    pdfUrl: row.pdfUrl ?? null,
    institutionCode,
    category: row.category ?? noticeCategoryFromTitle(row.title),
    target: campusLabel(institutionCode),
    slug: contentSlug(row.title),
  };
}

/** Turns a row of the calendar into the shape the public site reads. */
export function toEventRecord(row: any): EventRecord {
  const photos = parseEventPhotos(row.photos);
  const storedDocuments = parseEventDocuments(row.documents);
  const documentList = storedDocuments.length
    ? storedDocuments
    : row.pdfUrl
      ? [{ url: row.pdfUrl, title: 'Official Event Protocols & Schedule', size: 'PDF' }]
      : [];

  const cover = row.coverUrl || photos[0]?.url || null;

  return {
    id: String(row.id),
    title: row.title,
    description: row.description || '',
    startDate: row.startDate,
    endDate: row.endDate ?? null,
    location: row.location ?? null,
    isUpcoming: row.isUpcoming ?? true,
    coverUrl: cover,
    pdfUrl: row.pdfUrl ?? documentList[0]?.url ?? null,
    photos: photos.length
      ? photos
      : cover
        ? [{ url: cover, caption: row.title, altText: row.title }]
        : [],
    documents: documentList,
    videoUrl: row.videoUrl ?? null,
    institutionCode: row.institutionCode ?? null,
    category: row.category ?? eventCategoryFromTitle(row.title),
    campus: row.campus ?? CAMPUS_NAMES[(row.institutionCode as SchoolCode)] ?? 'Society Central',
    time: eventTimeRange(row.startDate, row.endDate),
    slug: contentSlug(row.title),
  };
}

export { SCHOOLS };
