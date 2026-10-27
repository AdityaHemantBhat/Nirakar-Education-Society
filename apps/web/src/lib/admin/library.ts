export type LibraryStandard = 'V' | 'VI' | 'VII' | 'VIII' | 'IX' | 'X' | 'XI' | 'XII';

export type LibraryCategory =
  | 'TEXTBOOK'
  | 'WORKBOOK'
  | 'REFERENCE'
  | 'QUESTION_PAPER'
  | 'PRACTICE_PAPER'
  | 'NOTEBOOK'
  | 'OTHER';

export type LibraryStatus = 'DRAFT' | 'PROCESSING' | 'PUBLISHED' | 'ARCHIVED';

export interface LibraryVolumeCard {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  author?: string | null;
  publisher?: string | null;
  academicYear?: string | null;
  standard: LibraryStandard;
  category: LibraryCategory;
  subject?: string | null;
  institutionCode?: string | null;
  language: string;
  status?: LibraryStatus;
  isPublished?: boolean;
  pageCount: number;
  readingMinutes: number;
  fileSizeBytes: number;
  coverUrl?: string | null;
  keywords: string[];
  excerpt?: string | null;
  viewCount: number;
  publishedAt?: string | null;
  createdAt?: string;
  originalName?: string | null;
  /** How far the background parser has got, 0-100. */
  processingProgress?: number;
  /** The step the parser is currently on. */
  processingStep?: string | null;
  /** Why the last processing attempt failed, if it did. */
  processingError?: string | null;
  /** How many pages the source PDF really had. */
  sourcePageCount?: number;
  /** True when the source was longer than the ceiling and was sampled. */
  isSampled?: boolean;
}

export interface AdminLibraryListResponse {
  items: LibraryVolumeCard[];
  total: number;
  page: number;
  limit: number;
}

export const LIBRARY_STANDARD_OPTIONS: Array<{ value: LibraryStandard; label: string }> = [
  { value: 'V', label: 'Std V' },
  { value: 'VI', label: 'Std VI' },
  { value: 'VII', label: 'Std VII' },
  { value: 'VIII', label: 'Std VIII' },
  { value: 'IX', label: 'Std IX' },
  { value: 'X', label: 'Std X' },
  { value: 'XI', label: 'Std XI' },
  { value: 'XII', label: 'Std XII' },
];

export const LIBRARY_CATEGORY_OPTIONS: Array<{ value: LibraryCategory; label: string }> = [
  { value: 'TEXTBOOK', label: 'Textbook' },
  { value: 'WORKBOOK', label: 'Workbook' },
  { value: 'REFERENCE', label: 'Reference' },
  { value: 'QUESTION_PAPER', label: 'Question Paper' },
  { value: 'PRACTICE_PAPER', label: 'Practice Paper' },
  { value: 'NOTEBOOK', label: 'Notebook' },
  { value: 'OTHER', label: 'Other' },
];

export const LIBRARY_CATEGORY_LABELS: Record<LibraryCategory, string> = {
  TEXTBOOK: 'Textbook',
  WORKBOOK: 'Workbook',
  REFERENCE: 'Reference',
  QUESTION_PAPER: 'Question Paper',
  PRACTICE_PAPER: 'Practice Paper',
  NOTEBOOK: 'Notebook',
  OTHER: 'Other',
};

export const libraryListQueryPrefix = ['admin_library_list'] as const;

/** Maximum accepted PDF size, in megabytes. Matches the server's multer limit. */
export const MAX_LIBRARY_PDF_MB = 100;

/**
 * The longest search the server will accept.
 *
 * The catalogue query is capped at this length, so the box in the console
 * is capped at the same length — otherwise a longer search would be
 * refused by the server and the whole listing would disappear.
 */
export const MAX_LIBRARY_SEARCH_LENGTH = 120;

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatLibraryDate(value?: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
