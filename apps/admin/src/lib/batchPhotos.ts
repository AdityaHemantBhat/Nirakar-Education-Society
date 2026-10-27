/**
 * The console's side of the batch photograph archive.
 *
 * Everything the archive shows comes from the server, which keeps the
 * records in the database. Nothing here is written by hand.
 */
import { fetchWithAdminSession } from './admissions.js';
import {
  BATCH_STREAM_LABELS,
  BATCH_STREAM_SHORT_LABELS,
  type BatchPhotoListResponse,
  type BatchPhotoRecord,
  type BatchStream,
} from '@nirakar/shared';

export type { BatchPhotoRecord, BatchStream };

/** The query the archive is asked for. */
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

export const batchPhotosQueryKey = ['admin_batch_photos'] as const;

export const BATCH_STREAM_OPTIONS: { value: BatchStream; label: string; short: string }[] = (
  Object.keys(BATCH_STREAM_LABELS) as BatchStream[]
).map((code) => ({
  value: code,
  label: BATCH_STREAM_LABELS[code],
  short: BATCH_STREAM_SHORT_LABELS[code],
}));

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

function buildSearch(params: BatchPhotoQuery): string {
  const search = new URLSearchParams();
  if (params.institutionCode && params.institutionCode !== 'ALL') {
    search.set('institutionCode', params.institutionCode);
  }
  if (params.stream && params.stream !== 'ALL') {
    search.set('stream', params.stream);
  }
  if (params.batchYear) search.set('batchYear', String(params.batchYear));
  if (params.decade && params.decade !== 'ALL') {
    search.set('decade', String(params.decade));
  }
  if (params.search?.trim()) search.set('search', params.search.trim());
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  return search.toString();
}

export async function fetchBatchPhotos(params: BatchPhotoQuery = {}): Promise<BatchPhotoListResponse> {
  const query = buildSearch(params);
  const response = await fetchWithAdminSession(`/api/v1/batch-photos?${query}`);
  if (!response.ok) {
    throw new Error('Could not load the batch photograph archive.');
  }
  const json = await response.json();
  return json.data as BatchPhotoListResponse;
}

export async function fetchBatchPhotoStats(): Promise<BatchPhotoStats> {
  const response = await fetchWithAdminSession('/api/v1/batch-photos/stats');
  if (!response.ok) {
    throw new Error('Could not load the archive totals.');
  }
  const json = await response.json();
  return json.data as BatchPhotoStats;
}

/** The photograph itself, converted to WebP by the server. */
export interface BatchPhotoUpload {
  photoUrl: string;
  fileSizeBytes: number;
  imageFormat: string;
  width: number;
  height: number;
}

export async function uploadBatchPhoto(file: File): Promise<BatchPhotoUpload> {
  const form = new FormData();
  form.append('photo', file);

  const response = await fetchWithAdminSession('/api/v1/batch-photos/admin/upload', {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    let message = 'The photograph could not be uploaded.';
    try {
      const json = await response.json();
      message = json?.error?.message || message;
    } catch {
      /* The server did not answer with a readable error. */
    }
    throw new Error(message);
  }

  const json = await response.json();
  return json.data as BatchPhotoUpload;
}

/** The facts about a photograph, without the file. */
export interface BatchPhotoInput {
  institutionCode: string;
  batchYear: number;
  stream: BatchStream;
  batchSession: string;
  classLevel: string;
  division: string;
  title: string;
  caption: string;
  photoUrl: string;
  fileSizeBytes: number;
  imageFormat: string;
}

export async function createBatchPhoto(input: BatchPhotoInput): Promise<BatchPhotoRecord> {
  const response = await fetchWithAdminSession('/api/v1/batch-photos/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }
  const json = await response.json();
  return json.data as BatchPhotoRecord;
}

export async function updateBatchPhoto(
  id: string,
  input: Partial<BatchPhotoInput>,
): Promise<BatchPhotoRecord> {
  const response = await fetchWithAdminSession(
    `/api/v1/batch-photos/admin/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }
  const json = await response.json();
  return json.data as BatchPhotoRecord;
}

export async function deleteBatchPhoto(id: string): Promise<void> {
  const response = await fetchWithAdminSession(
    `/api/v1/batch-photos/admin/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const json = await response.json();
    return json?.error?.message || 'The archive could not be changed.';
  } catch {
    return 'The archive could not be changed.';
  }
}

/** The size of a file, written the way a person would say it. */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
