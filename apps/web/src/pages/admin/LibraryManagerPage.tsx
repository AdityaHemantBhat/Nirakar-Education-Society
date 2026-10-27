import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  RefreshCw,
  Eye,
  Trash2,
  Loader2,
  Search,
  Library as LibraryIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  Pencil,
  X,
  Clock,
  Globe,
  Archive,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { fetchWithAdminSession } from '../lib/admissions.js';
import { AdminSelect, SelectOption } from '../components/AdminSelect.js';
import { LibraryUploadDrawer } from '../components/LibraryUploadDrawer.js';
import { LibraryEditDrawer, VolumeEditDraft } from '../components/LibraryEditDrawer.js';
import {
  AdminLibraryListResponse,
  LIBRARY_CATEGORY_LABELS,
  LIBRARY_CATEGORY_OPTIONS,
  LIBRARY_STANDARD_OPTIONS,
  LibraryCategory,
  LibraryStandard,
  LibraryVolumeCard,
  libraryListQueryPrefix,
  MAX_LIBRARY_PDF_MB,
  MAX_LIBRARY_SEARCH_LENGTH,
} from '../lib/library.js';
import { getPublicSiteUrl } from '../lib/site.js';

const PAGE_SIZE = 10;

interface UploadDraft {
  title: string;
  description: string;
  author: string;
  publisher: string;
  academicYear: string;
  standard: LibraryStandard;
  category: LibraryCategory;
  subject: string;
  institutionCode: string;
  language: string;
  isPublished: boolean;
}

const EMPTY_DRAFT: UploadDraft = {
  title: '',
  description: '',
  author: '',
  publisher: '',
  academicYear: '',
  standard: 'V',
  category: 'TEXTBOOK',
  subject: '',
  institutionCode: '',
  language: 'English',
  isPublished: true,
};

/** Which volumes the listing is showing. */
type StatusFilter = 'ALL' | 'PUBLISHED' | 'DRAFT';

export const LibraryManagerPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState<UploadDraft>(EMPTY_DRAFT);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  /* Whether the upload panel is open. It arrives when it is wanted, so
     the volumes keep the whole page to themselves. */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null,
  );
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [standardFilter, setStandardFilter] = useState<'ALL' | LibraryStandard>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | LibraryCategory>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingVolume, setEditingVolume] = useState<LibraryVolumeCard | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  /* ------------------------------------------------------------------ */
  /* Listing                                                             */
  /* ------------------------------------------------------------------ */

  const { data, isLoading, isError, isFetching, refetch } = useQuery<AdminLibraryListResponse>({
    queryKey: [
      ...libraryListQueryPrefix,
      search.trim(),
      standardFilter,
      categoryFilter,
      statusFilter,
      currentPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
      });
      if (search.trim()) params.set('q', search.trim());
      if (standardFilter !== 'ALL') params.set('standard', standardFilter);
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
      if (statusFilter === 'PUBLISHED') params.set('published', 'true');
      if (statusFilter === 'DRAFT') params.set('published', 'false');

      const response = await fetchWithAdminSession(`/api/v1/library/admin?${params.toString()}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to load library volumes.');
      }
      return result.data as AdminLibraryListResponse;
    },
    placeholderData: (previous) => previous,
    /* A volume being rendered is only visible through its progress, so the
       list refreshes on its own until nothing is left in progress. */
    refetchInterval: (query) => {
      const items = (query.state.data?.items ?? []) as LibraryVolumeCard[];
      return items.some((v) => v.status === 'PROCESSING') ? 2000 : false;
    },
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /* ------------------------------------------------------------------ */
  /* Upload                                                              */
  /* ------------------------------------------------------------------ */

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('title', draft.title);
      formData.append('description', draft.description);
      formData.append('author', draft.author);
      formData.append('publisher', draft.publisher);
      formData.append('academicYear', draft.academicYear);
      formData.append('standard', draft.standard);
      formData.append('category', draft.category);
      formData.append('subject', draft.subject);
      if (draft.institutionCode) formData.append('institutionCode', draft.institutionCode);
      formData.append('language', draft.language);
      formData.append('isPublished', String(draft.isPublished));
      formData.append('pdf', file);

      /* A FormData body cannot be replayed after a 401 refresh, so this call
         deliberately uses a plain fetch rather than fetchWithAdminSession. */
      const response = await fetch('/api/v1/library/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'The PDF could not be uploaded and processed.');
      }
      return result.data as LibraryVolumeCard;
    },
    onSuccess: (volume) => {
      /* The upload returns as soon as the file is stored; the pages are
         rendered in the background, so the volume appears in the list
         below with a progress bar and becomes readable when it is done. */
      showStatus(
        `“${volume.title}” was uploaded. Its pages are being rendered now — it will appear in the catalogue when the progress below reaches 100%.`,
        'success',
      );
      setDraft(EMPTY_DRAFT);
      setPdfFile(null);
      setPdfError(null);
      setStatusFilter('ALL');
      setCurrentPage(1);
      /* The panel has done its job, so it steps aside and the new
         volume — with its progress bar — is all that is left. */
      setDrawerOpen(false);
      void queryClient.invalidateQueries({ queryKey: libraryListQueryPrefix });
    },
    onError: (err: Error) => {
      showStatus(err.message, 'error');
    },
  });

  const handleUpload = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!draft.title.trim()) {
      setPdfError('A title is required.');
      return;
    }
    if (!pdfFile) {
      setPdfError('Select a PDF document to upload.');
      return;
    }
    if (pdfFile.size > MAX_LIBRARY_PDF_MB * 1024 * 1024) {
      setPdfError(
        `That PDF is ${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB, which exceeds the ${MAX_LIBRARY_PDF_MB} MB limit.`,
      );
      return;
    }

    setUploading(true);
    setPdfError(null);
    try {
      await uploadMutation.mutateAsync(pdfFile);
    } catch {
      /* The mutation's onError already surfaced the message. */
    } finally {
      setUploading(false);
    }
  };

  /**
   * Called when a document is chosen.
   *
   * A file that is not a PDF, or one that is too large, is refused here
   * rather than at the server, so the administrator is told straight away.
   */
  const handleFileChange = (file: File | null) => {
    setPdfError(null);

    if (!file) {
      setPdfFile(null);
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setPdfError('Only PDF documents are accepted.');
      setPdfFile(null);
      return;
    }

    if (file.size > MAX_LIBRARY_PDF_MB * 1024 * 1024) {
      setPdfError(
        `That PDF is ${(file.size / (1024 * 1024)).toFixed(1)} MB, which exceeds the ${MAX_LIBRARY_PDF_MB} MB limit.`,
      );
      setPdfFile(null);
      return;
    }

    /* Prefill the title from the filename when the admin has not typed one. */
    if (!draft.title.trim()) {
      const fromName = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      setDraft((d) => ({ ...d, title: fromName }));
    }

    setPdfFile(file);
  };

  /* ------------------------------------------------------------------ */
  /* Publish / delete                                                    */
  /* ------------------------------------------------------------------ */

  const togglePublishMutation = useMutation({
    mutationFn: async (volume: LibraryVolumeCard) => {
      const response = await fetchWithAdminSession(`/api/v1/library/admin/${volume.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !volume.isPublished }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to update the volume.');
      }
      return result.data as LibraryVolumeCard;
    },
    onSuccess: (volume) => {
      showStatus(
        volume.isPublished
          ? `“${volume.title}” is now live in the library.`
          : `“${volume.title}” has been withdrawn from the catalogue.`,
        'success',
      );
      void queryClient.invalidateQueries({ queryKey: libraryListQueryPrefix });
    },
    onError: (err: Error) => showStatus(err.message, 'error'),
  });

  /**
   * Renders a volume again from the PDF that was uploaded for it.
   *
   * A volume whose render failed has no pages, and the original PDF is
   * still on the server — so the document does not have to be uploaded a
   * second time.
   */
  const reprocessMutation = useMutation({
    mutationFn: async (volume: LibraryVolumeCard) => {
      const response = await fetchWithAdminSession(`/api/v1/library/admin/${volume.id}/reprocess`, {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to render the volume again.');
      }
      return result.data as LibraryVolumeCard;
    },
    onSuccess: (volume) => {
      showStatus(`“${volume.title}” is being rendered again.`, 'success');
      void queryClient.invalidateQueries({ queryKey: libraryListQueryPrefix });
    },
    onError: (err: Error) => showStatus(err.message, 'error'),
  });

  /**
   * Saves the details of a volume.
   *
   * The pages come from the uploaded PDF and are not touched here, so
   * this only rewrites the information written alongside them.
   */
  const editMutation = useMutation({
    mutationFn: async ({ volume, draft }: { volume: LibraryVolumeCard; draft: VolumeEditDraft }) => {
      const response = await fetchWithAdminSession(`/api/v1/library/admin/${volume.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          author: draft.author,
          publisher: draft.publisher,
          academicYear: draft.academicYear,
          standard: draft.standard,
          category: draft.category,
          subject: draft.subject,
          institutionCode: draft.institutionCode,
          language: draft.language,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to save the volume.');
      }
      return result.data as LibraryVolumeCard;
    },
    onSuccess: (volume) => {
      showStatus(`“${volume.title}” was updated.`, 'success');
      setEditingVolume(null);
      setEditError(null);
      void queryClient.invalidateQueries({ queryKey: libraryListQueryPrefix });
    },
    onError: (err: Error) => setEditError(err.message),
  });

  const deleteMutation = useMutation({    mutationFn: async (volume: LibraryVolumeCard) => {
      const response = await fetchWithAdminSession(`/api/v1/library/admin/${volume.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to delete the volume.');
      }
      return true;
    },
    onSuccess: () => {
      showStatus('The volume and its rendered pages were deleted.', 'success');
      void queryClient.invalidateQueries({ queryKey: libraryListQueryPrefix });
    },
    onError: (err: Error) => showStatus(err.message, 'error'),
  });

  /* ------------------------------------------------------------------ */
  /* Filters                                                             */
  /* ------------------------------------------------------------------ */

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (statusFilter !== 'ALL') {
      parts.push(statusFilter === 'PUBLISHED' ? 'Live' : 'Drafts');
    }
    if (standardFilter !== 'ALL') {
      parts.push(LIBRARY_STANDARD_OPTIONS.find((o) => o.value === standardFilter)?.label ?? standardFilter);
    }
    if (categoryFilter !== 'ALL') {
      parts.push(LIBRARY_CATEGORY_LABELS[categoryFilter]);
    }
    return parts.length ? parts.join(' · ') : 'Every volume';
  }, [standardFilter, categoryFilter, statusFilter]);

  const setFilter = <T,>(setter: (v: T) => void, value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  const activeFilterCount =
    (statusFilter !== 'ALL' ? 1 : 0) +
    (standardFilter !== 'ALL' ? 1 : 0) +
    (categoryFilter !== 'ALL' ? 1 : 0);

  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          role="status"
          className={`fixed right-6 top-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold shadow-lg ${
            statusMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0" />
          ) : (
            <AlertCircle size={16} className="shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ============================== The header ============================== */}
      <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">
            The Society Archive
          </p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">Digital Library</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-stone-500">
            Every document you upload is rendered into page images and published as a
            page-turning book. Large files are prepared in the background.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : undefined} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800"
          >
            <Upload size={14} />
            Add a volume
          </button>
        </div>
      </header>

      {/* ============================== The volumes ============================== */}
      <div className="space-y-4">
        {/* The tabs, the search and the sort — all on one line */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { value: 'ALL', label: 'All volumes', icon: LibraryIcon },
                { value: 'PUBLISHED', label: 'Live', icon: Globe },
                { value: 'DRAFT', label: 'Drafts', icon: Archive },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilter(setStatusFilter, tab.value)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                    active
                      ? 'bg-stone-900 text-white'
                      : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setStandardFilter('ALL');
                  setCategoryFilter('ALL');
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold text-stone-500 transition hover:text-brand-700"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          <div className="ml-auto flex flex-1 items-center gap-2 sm:flex-none sm:flex-1">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="search"
                value={search}
                maxLength={MAX_LIBRARY_SEARCH_LENGTH}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by title, author, publisher or subject…"
                className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-xs text-stone-900 outline-none transition focus:border-brand-700"
              />
            </div>

            <div className="w-48 sm:w-56 shrink-0">
              <AdminSelect
                value={standardFilter}
                onChange={(val) => setFilter(setStandardFilter, val as 'ALL' | LibraryStandard)}
                options={[
                  { value: 'ALL', label: 'All standards' },
                  ...LIBRARY_STANDARD_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
                ]}
                icon={LibraryIcon}
                compact
              />
            </div>

            <div className="w-48 sm:w-56 shrink-0">
              <AdminSelect
                value={categoryFilter}
                onChange={(val) => setFilter(setCategoryFilter, val as 'ALL' | LibraryCategory)}
                options={[
                  { value: 'ALL', label: 'All categories' },
                  ...LIBRARY_CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
                ]}
                icon={FileText}
                compact
              />
            </div>
          </div>
        </div>

        {/* The count */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
          <p className="text-[11px] text-stone-500">
            {filterSummary} ·{' '}
            <span className="font-semibold text-stone-700">
              {total} volume{total === 1 ? '' : 's'}
            </span>
          </p>
          {isFetching && !isLoading && (
            <p className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <Loader2 size={11} className="animate-spin" />
              updating
            </p>
          )}
        </div>

        {/* The volumes */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-stone-500">
            <Loader2 size={16} className="animate-spin" />
            Loading library volumes…
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <p className="text-sm text-rose-700">Could not load library volumes.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 text-xs font-semibold text-brand-700 underline"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-white/60 py-20 text-center">
            <Inbox size={26} className="text-stone-300" />
            <p className="text-sm font-medium text-stone-600">
              {statusFilter === 'DRAFT'
                ? 'No drafts at the moment.'
                : statusFilter === 'PUBLISHED'
                  ? 'Nothing is live in the library yet.'
                  : 'No volumes match this filter.'}
            </p>
            <p className="max-w-xs text-xs text-stone-400">
              {statusFilter === 'DRAFT'
                ? 'A volume appears here while it is still being prepared, or when it has been withdrawn from the public library.'
                : 'Upload a PDF to get started.'}
            </p>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-800"
            >
              <Upload size={13} />
              Add a volume
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {items.map((volume) => {
              const isProcessing = volume.status === 'PROCESSING';
              /* A volume whose render failed has no pages, so there is
                 nothing for the reader to open. It cannot be published
                 until it is rendered again. */
              const hasPages = volume.pageCount > 0;
              const canPublish = hasPages && !isProcessing;
              const isSampled = Boolean(volume.isSampled);

              return (
                <li
                  key={volume.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-stone-300 hover:shadow-sm"
                >
                  {/* The cover and the headline */}
                  <div className="flex gap-4 p-4">
                    <div className="h-[116px] w-[82px] shrink-0 overflow-hidden rounded-md bg-stone-100">
                      {volume.coverUrl ? (
                        <img
                          src={volume.coverUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-300">
                          <FileText size={20} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        {volume.isPublished ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <Globe size={9} />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <Archive size={9} />
                            Draft
                          </span>
                        )}
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                          Std {volume.standard}
                        </span>
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                          {LIBRARY_CATEGORY_LABELS[volume.category]}
                        </span>
                      </div>

                      <h3 className="text-[13px] font-bold leading-snug text-stone-900">
                        {volume.title}
                      </h3>

                      <p className="mt-1 truncate text-[11px] text-stone-500">
                        {volume.subject || volume.author || '—'}
                        {volume.academicYear ? ` · ${volume.academicYear}` : ''}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-stone-400">
                        <span className="inline-flex items-center gap-1">
                          <FileText size={11} />
                          {volume.pageCount} pp
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} />
                          {volume.readingMinutes} min
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye size={11} />
                          {volume.viewCount} reads
                        </span>
                      </div>

                      {/* A long document is sampled down rather than
                          refused, so the book holds fewer pages than the
                          PDF did. That is worth saying out loud. */}
                      {isSampled && (
                        <p className="mt-1.5 text-[10.5px] text-amber-600">
                          Sampled from {volume.sourcePageCount ?? volume.pageCount} pages
                        </p>
                      )}
                    </div>
                  </div>

                  {/* The background renderer's progress */}
                  {isProcessing && (
                    <div className="px-4 pb-3">
                      <div className="flex items-center justify-between text-[10.5px] text-stone-500">
                        <span className="truncate">
                          {volume.processingStep || 'Preparing…'}
                        </span>
                        <span className="ml-2 shrink-0 font-semibold">
                          {volume.processingProgress ?? 0}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-200">
                        <div
                          className="h-full rounded-full bg-brand-600 transition-all duration-500"
                          style={{ width: `${volume.processingProgress ?? 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Why the last attempt failed */}
                  {volume.processingError && (
                    <p className="mx-4 mb-3 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[10.5px] leading-relaxed text-rose-700">
                      {volume.processingError}
                    </p>
                  )}

                  {/* The actions */}
                  <div className="mt-auto flex items-center gap-2 border-t border-stone-100 px-4 py-2.5">
                    {volume.isPublished && (
                      <a
                        href={`${getPublicSiteUrl()}/library/${volume.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-brand-800"
                      >
                        <Eye size={12} />
                        View
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setEditError(null);
                        setEditingVolume(volume);
                      }}
                      title="Edit the details of this volume"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-600 transition hover:bg-stone-50"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        togglePublishMutation.mutate({
                          ...volume,
                          isPublished: Boolean(volume.isPublished),
                        })
                      }
                      disabled={togglePublishMutation.isPending || (isProcessing && !volume.isPublished)}
                      title={
                        !volume.isPublished && !canPublish
                          ? 'This volume has to be rendered before it can be published.'
                          : undefined
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
                    >
                      {volume.isPublished ? <Archive size={12} /> : <Globe size={12} />}
                      {volume.isPublished ? 'Withdraw' : 'Publish'}
                    </button>

                    {volume.processingError && (
                      <button
                        type="button"
                        onClick={() => reprocessMutation.mutate(volume)}
                        disabled={reprocessMutation.isPending || isProcessing}
                        title="Render this volume again from the PDF that was uploaded."
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-40"
                      >
                        <RefreshCw size={12} />
                        Render again
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete “${volume.title}” and its rendered pages?`)) {
                          deleteMutation.mutate(volume);
                        }
                      }}
                      disabled={deleteMutation.isPending || isProcessing}
                      title={
                        isProcessing
                          ? 'This volume is still being rendered. Wait for it to finish before deleting it.'
                          : undefined
                      }
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-40"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* The pagination */}
        {total > PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
            <p className="text-[11px] text-stone-500">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, total)} of {total}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
              >
                <ChevronLeft size={13} />
                Previous
              </button>

              <span className="px-2 text-[11px] font-semibold text-stone-500">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
              >
                Next
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* The upload panel, when it is wanted */}
      {drawerOpen && (
        <LibraryUploadDrawer
          draft={draft}
          setDraft={setDraft}
          pdfFile={pdfFile}
          onFileChange={handleFileChange}
          pdfError={pdfError}
          uploading={uploading}
          onSubmit={handleUpload}
          onClose={() => {
            if (uploading) return;
            setDrawerOpen(false);
          }}
        />
      )}

      {/* The edit panel, when a volume is being edited */}
      {editingVolume && (
        <LibraryEditDrawer
          volume={editingVolume}
          onSave={(draft) => editMutation.mutate({ volume: editingVolume, draft })}
          saving={editMutation.isPending}
          error={editError}
          onClose={() => {
            if (editMutation.isPending) return;
            setEditingVolume(null);
            setEditError(null);
          }}
        />
      )}
    </div>
  );
};

export default LibraryManagerPage;
