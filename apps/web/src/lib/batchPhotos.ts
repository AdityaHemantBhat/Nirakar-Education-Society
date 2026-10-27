/**
 * The public side of the batch photograph archive.
 *
 * The photographs are held in the registry, so what the gallery shows is
 * whatever the office has filed — there is no second list kept here.
 */
import {
  BATCH_STREAM_LABELS,
  BATCH_STREAM_SHORT_LABELS,
  type BatchPhotoListResponse,
  type BatchPhotoRecord,
  type BatchStream,
} from '@nirakar/shared';

export type { BatchPhotoRecord, BatchStream };

/** The query the gallery asks for. */
export interface BatchPhotoQuery {
  institutionCode?: string;
  /** The stream, or 'ALL' for every stream. */
  stream?: BatchStream | 'ALL';
  batchYear?: number;
  decade?: number | 'ALL';
  search?: string;
  page?: number;
  limit?: number;
}

export const publicBatchPhotosQueryKey = ['public_batch_photos'] as const;

/** How the archive is spread out, for the totals at the top of the page. */
export interface BatchPhotoStats {
  total: number;
  campuses: number;
  streams: number;
  earliestYear: number | null;
  latestYear: number | null;
  years?: number[];
  byCampus: { institutionCode: string; count: number }[];
  byStream: { stream: BatchStream; count: number }[];
}

/** How the campuses are written on the gallery cards. */
export const BATCH_CAMPUS_OPTIONS = [
  { code: 'NIRAKAR_HS', short: 'Nirakar HS', place: 'Mashem' },
  { code: 'TUDAL_HS', short: 'Tudal HS', place: 'Gaondongrem' },
  { code: 'ANGLE_HSS', short: 'Angle HSS', place: 'Dapot' },
] as const;

/** How the streams are written on the gallery cards. */
export const BATCH_STREAM_OPTIONS: { value: BatchStream; label: string; short: string }[] = (
  Object.keys(BATCH_STREAM_LABELS) as BatchStream[]
).map((code) => ({
  value: code,
  label: BATCH_STREAM_LABELS[code],
  short: BATCH_STREAM_SHORT_LABELS[code],
}));

/** The decades the archive reaches back to, worked out from what is held. */
export function decadesFrom(years: number[]): { label: string; value: string }[] {
  const decades = new Set<number>();
  for (const year of years) {
    decades.add(Math.floor(year / 10) * 10);
  }
  return [...decades]
    .sort((a, b) => b - a)
    .map((decade) => ({ label: `${decade}s`, value: String(decade) }));
}

export async function fetchPublicBatchPhotos(
  params: BatchPhotoQuery = {},
): Promise<BatchPhotoListResponse> {
  const search = new URLSearchParams();
  if (params.institutionCode && params.institutionCode !== 'ALL') {
    search.set('institutionCode', params.institutionCode);
  }
  if (params.stream && params.stream !== 'ALL') search.set('stream', params.stream);
  if (params.batchYear) search.set('batchYear', String(params.batchYear));
  if (params.decade && params.decade !== 'ALL') {
    search.set('decade', String(params.decade));
  }
  if (params.search?.trim()) search.set('search', params.search.trim());
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));

  const response = await fetch(`/api/v1/batch-photos?${search.toString()}`);
  if (!response.ok) {
    throw new Error('The batch photograph archive could not be loaded.');
  }
  const json = await response.json();
  return json.data as BatchPhotoListResponse;
}

export async function fetchPublicBatchPhotoStats(): Promise<BatchPhotoStats> {
  const response = await fetch('/api/v1/batch-photos/stats');
  if (!response.ok) {
    throw new Error('Could not load the archive totals.');
  }
  const json = await response.json();
  return json.data as BatchPhotoStats;
}

/** The size of a file, written the way a person would say it. */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
