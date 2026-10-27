export type LibraryStandard = 'V' | 'VI' | 'VII' | 'VIII' | 'IX' | 'X' | 'XI' | 'XII';

export type LibraryCategory =
  | 'TEXTBOOK'
  | 'WORKBOOK'
  | 'REFERENCE'
  | 'QUESTION_PAPER'
  | 'PRACTICE_PAPER'
  | 'NOTEBOOK'
  | 'OTHER';

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
  pageCount: number;
  /** How many pages the source PDF really had, when it is known. */
  sourcePageCount?: number;
  /** True when the source was longer than the ceiling and was sampled. */
  isSampled?: boolean;
  readingMinutes: number;
  fileSizeBytes: number;
  coverUrl?: string | null;
  keywords: string[];
  excerpt?: string | null;
  viewCount: number;
  publishedAt?: string | null;
}

export interface LibraryCatalogResponse {
  items: LibraryVolumeCard[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
  subjects: string[];
  standardCounts: Array<{ standard: LibraryStandard; count: number }>;
}

export interface LibraryPage {
  id: string;
  pageNo: number;
  text: string;
  imageVariants: {
    thumb?: string;
    w640?: string;
    w1024?: string;
    w1600?: string;
    zoom?: string;
  };
  blurhash?: string;
}

export interface LibraryRatingSummary {
  average: number | null;
  count: number;
  breakdown: Array<{ stars: number; count: number }>;
}

export interface LibraryReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  /** The name of a guest reviewer; null when the reviewer had an account. */
  guestName?: string | null;
  user?: { username: string; email?: string | null } | null;
}

export interface LibraryVolumeDetail extends LibraryVolumeCard {
  pages: LibraryPage[];
  rating?: LibraryRatingSummary;
  reviews?: LibraryReview[];
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

export const LIBRARY_CATEGORY_LABELS: Record<LibraryCategory, string> = {
  TEXTBOOK: 'Textbook',
  WORKBOOK: 'Workbook',
  REFERENCE: 'Reference',
  QUESTION_PAPER: 'Question Paper',
  PRACTICE_PAPER: 'Practice Paper',
  NOTEBOOK: 'Notebook',
  OTHER: 'Other',
};

export const INSTITUTION_LABELS: Record<string, string> = {
  NIRAKAR_HS: 'Shri Nirakar High School',
  TUDAL_HS: 'Tudal High School',
  ANGLE_HSS: 'S. S. Angle Higher Secondary',
};

/**
 * Builds the catalogue query string. Empty values are omitted so the API
 * applies no unnecessary filters.
 */
export function buildLibraryQuery(params: {
  standard?: string;
  category?: string;
  subject?: string;
  q?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): string {
  const search = new URLSearchParams();
  if (params.standard && params.standard !== 'ALL') search.set('standard', params.standard);
  if (params.category && params.category !== 'ALL') search.set('category', params.category);
  if (params.subject) search.set('subject', params.subject);
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.sort) search.set('sort', params.sort);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  return search.toString();
}
