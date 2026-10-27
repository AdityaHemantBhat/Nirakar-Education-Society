import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  Plus,
  Trash2,
  Pencil,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  ExternalLink,
  CalendarDays,
  Images,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { AdminSelect, SelectOption } from '../components/AdminSelect.js';
import {
  BATCH_STREAM_OPTIONS,
  batchPhotosQueryKey,
  deleteBatchPhoto,
  fetchBatchPhotoStats,
  fetchBatchPhotos,
  type BatchStream,
} from '../lib/batchPhotos.js';
import { FileTypeIcon } from '../components/FileTypeIcon.js';
import { getPublicSiteUrl } from '../lib/site.js';

const CAMPUS_OPTIONS = [
  { code: 'NIRAKAR_HS', short: 'Nirakar HS' },
  { code: 'TUDAL_HS', short: 'Tudal HS' },
  { code: 'ANGLE_HSS', short: 'Angle HSS' },
];

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export const BatchPhotosManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [pageSize, setPageSize] = useState<number>(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  /* The archive, as the server holds it. */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      ...batchPhotosQueryKey,
      { search: searchQuery, school: schoolFilter, type: typeFilter, page: currentPage, limit: pageSize },
    ],
    queryFn: () =>
      fetchBatchPhotos({
        search: searchQuery,
        institutionCode: schoolFilter,
        stream: typeFilter as BatchStream,
        page: currentPage,
        limit: pageSize,
      }),
    staleTime: 30 * 1000,
  });

  /* How the archive is spread out, for the totals at the top of the page. */
  const { data: stats } = useQuery({
    queryKey: [...batchPhotosQueryKey, 'stats'],
    queryFn: fetchBatchPhotoStats,
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBatchPhoto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchPhotosQueryKey });
      showStatus('The photograph was taken out of the archive', 'success');
    },
    onError: (err: Error) => showStatus(err.message, 'error'),
  });

  const photos = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  /* The counts beside each campus pill, so a person can see where the
     photographs are before they click. */
  const campusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: stats?.total ?? 0 };
    for (const campus of CAMPUS_OPTIONS) {
      counts[campus.code] = stats?.byCampus.find((c) => c.institutionCode === campus.code)?.count ?? 0;
    }
    return counts;
  }, [stats]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const element = document.getElementById('admin-batch-photos-section');
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="w-full space-y-6 pb-16 font-sans">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex animate-[adminFadeIn_150ms_ease-out] items-center gap-3 rounded-xl border px-5 py-3 text-sm font-medium shadow-xl ${
            statusMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ============================== Header ============================== */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-stone-900 sm:text-3xl">
            <Camera className="text-brand-700" size={28} />
            <span>Batch Photos Archive</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Every graduating class the Society has a photograph of, kept in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`${getPublicSiteUrl()}/batch-photos`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            <ExternalLink size={14} />
            <span>View public gallery</span>
          </a>

          <button
            type="button"
            onClick={() => navigate('/batch-photos/new')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-800"
          >
            <Plus size={15} />
            <span>Add batch photo</span>
          </button>
        </div>
      </header>

      {/* ============================== The archive at a glance ============================== */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Archive totals">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Photographs held</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              <Images size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-stone-900">{stats?.total ?? '—'}</p>
          <p className="mt-1 text-xs text-stone-400">Across the whole archive</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Campuses covered</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Building2 size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-stone-900">{stats?.campuses ?? '—'}</p>
          <p className="mt-1 text-xs text-stone-400">Mashem, Gaondongrem and Dapot</p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Years on record</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <CalendarDays size={16} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-stone-900">
            {stats?.latestYear ?? '—'}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Earliest batch from {stats?.earliestYear ?? '—'}
          </p>
        </div>
      </section>

      {/* ============================== The archive itself ============================== */}
      <section id="admin-batch-photos-section" className="scroll-mt-6 space-y-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-stone-900 sm:text-lg">
              <Images size={18} className="text-brand-700" />
              Graduating class photographs
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Uploads here appear on the public gallery straight away.
            </p>
          </div>

          <label className="relative w-full xl:max-w-sm">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by year, title, or campus..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
            />
          </label>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-stone-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSchoolFilter('ALL');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                schoolFilter === 'ALL'
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All campuses
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  schoolFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-white text-stone-600'
                }`}
              >
                {campusCounts.ALL}
              </span>
            </button>

            {CAMPUS_OPTIONS.map((campus) => (
              <button
                key={campus.code}
                type="button"
                onClick={() => {
                  setSchoolFilter(campus.code);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  schoolFilter === campus.code
                    ? 'bg-brand-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {campus.short}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    schoolFilter === campus.code
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-stone-600'
                  }`}
                >
                  {campusCounts[campus.code]}
                </span>
              </button>
            ))}
          </div>

          <div className="w-48 sm:w-56 shrink-0">
            <AdminSelect
              value={typeFilter}
              onChange={(val) => {
                setTypeFilter(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All streams' },
                ...BATCH_STREAM_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
              ]}
              icon={Images}
              compact
            />
          </div>
        </div>

        {/* The photographs */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500">
            <Loader2 size={18} className="animate-spin text-brand-700" />
            <span>Loading the archive...</span>
          </div>
        ) : isError ? (
          <div className="py-14 text-center">
            <AlertCircle size={36} className="mx-auto text-rose-300" />
            <p className="mt-3 text-sm font-semibold text-stone-700">The archive could not be loaded</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-stone-400">
              {(error as Error)?.message || 'Please try again in a moment.'}
            </p>
          </div>
        ) : photos.length === 0 ? (
          <div className="py-14 text-center">
            <Camera size={36} className="mx-auto text-stone-300" />
            <p className="mt-3 text-sm font-semibold text-stone-700">
              {total === 0 && !searchQuery && schoolFilter === 'ALL' && typeFilter === 'ALL'
                ? 'The archive is empty'
                : 'No photographs match these filters'}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-stone-400">
              {total === 0 && !searchQuery && schoolFilter === 'ALL' && typeFilter === 'ALL'
                ? 'Upload the first graduating class photograph to begin the archive.'
                : 'Try a different campus or stream, or clear the search.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/batch-photos/new')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-800"
            >
              <Plus size={15} />
              <span>Add a photograph</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {photos.map((photo) => (
              <article
                key={photo.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-50/60 transition hover:border-stone-300 hover:shadow-xs"
              >
                {/* The photograph */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-900">
                  <img
                    src={photo.photoUrl}
                    alt={photo.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                  {/* The session, stamped like a date on the print */}
                  {photo.batchSession && (
                    <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-black/55 px-2 py-1 font-[ui-monospace,SFMono-Regular,Menlo,Consolas,monospace] text-[11px] font-bold text-white backdrop-blur-sm">
                      {photo.batchSession}
                    </span>
                  )}
                </div>

                {/* What we know about it */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-bold leading-snug text-stone-900">{photo.title}</h3>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-medium text-stone-700">
                      {CAMPUS_OPTIONS.find((c) => c.code === photo.institutionCode)?.short ??
                        photo.institutionCode}
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                      {BATCH_STREAM_OPTIONS.find((s) => s.value === photo.stream)?.short ??
                        photo.stream}
                    </span>
                    {photo.division && (
                      <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                        {photo.division}
                      </span>
                    )}
                  </div>

                  {photo.caption && (
                    <p className="mt-3 line-clamp-2 text-[11px] leading-relaxed text-stone-500">
                      {photo.caption}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                      <span>{photo.batchYear}</span>
                      <span
                        className="inline-flex items-center gap-0.5 text-stone-400"
                        title={`Stored as ${photo.imageFormat.toUpperCase()}`}
                      >
                        <FileTypeIcon format={photo.imageFormat} size={11} />
                      </span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/batch-photos/${photo.id}/edit`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Take "${photo.title}" out of the archive? The photograph file itself is kept.`,
                            )
                          ) {
                            deleteMutation.mutate(photo.id);
                          }
                        }}
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 transition hover:bg-rose-100"
                        title={`Remove ${photo.title}`}
                        aria-label={`Remove ${photo.title}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Full Pagination */}
        {total > 0 && (
          <div className="flex flex-col gap-4 border-t border-stone-200 pt-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Range & Items per page */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
              <p>
                Showing <strong className="font-semibold text-stone-900">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="font-semibold text-stone-900">
                  {Math.min(currentPage * pageSize, total)}
                </strong>{' '}
                of <strong className="font-semibold text-stone-900">{total}</strong> photographs
              </p>

              <div className="flex items-center gap-1.5 pl-0 sm:border-l sm:border-stone-200 sm:pl-3">
                <span className="text-stone-400">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-700 outline-none hover:bg-stone-100 focus:border-brand-700"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pagination Buttons */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center gap-1">
                {/* First page */}
                <button
                  type="button"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                  title="First page"
                  aria-label="First page"
                >
                  <ChevronsLeft size={14} />
                </button>

                {/* Previous page */}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers(currentPage, totalPages).map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-xs text-stone-400 select-none">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => goToPage(p)}
                        className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-bold transition ${
                          p === currentPage
                            ? 'bg-brand-700 text-white shadow-xs'
                            : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                        }`}
                        aria-current={p === currentPage ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>

                {/* Next page */}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={14} />
                </button>

                {/* Last page */}
                <button
                  type="button"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Last page"
                  aria-label="Last page"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default BatchPhotosManagerPage;
