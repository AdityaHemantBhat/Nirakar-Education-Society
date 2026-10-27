import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '../lib/api.js';
import {
  Camera,
  Search,
  Download,
  Share2,
  X,
  ZoomIn,
  Check,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { CustomSelect } from '../components/CustomSelect.js';
import { FileTypeIcon } from '../components/FileTypeIcon.js';
import {
  BATCH_CAMPUS_OPTIONS,
  BATCH_STREAM_OPTIONS,
  fetchPublicBatchPhotos,
  fetchPublicBatchPhotoStats,
  publicBatchPhotosQueryKey,
  type BatchPhotoRecord,
  type BatchStream,
} from '../lib/batchPhotos.js';

const PAGE_SIZE_OPTIONS = [12, 24, 48];

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

export const BatchPhotosPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>(() => {
    const campus = searchParams.get('campus');
    return BATCH_CAMPUS_OPTIONS.some((school) => school.code === campus) ? campus! : 'ALL';
  });
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [decadeFilter, setDecadeFilter] = useState<string>('ALL');
  const [pageSize, setPageSize] = useState<number>(24);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    if (!targetId) return;
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' });
    });
  }, []);

  /* The archive, as the registry holds it. */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      ...publicBatchPhotosQueryKey,
      {
        search: searchQuery,
        campus: schoolFilter,
        stream: typeFilter,
        decade: decadeFilter,
        page: currentPage,
        limit: pageSize,
      },
    ],
    queryFn: () =>
      fetchPublicBatchPhotos({
        search: searchQuery,
        institutionCode: schoolFilter,
        stream: typeFilter as BatchStream,
        decade: decadeFilter !== 'ALL' ? parseInt(decadeFilter, 10) : undefined,
        page: currentPage,
        limit: pageSize,
      }),
    staleTime: 60 * 1000,
  });

  /* The stats and years held by the archive for total counters and decade pills */
  const { data: stats } = useQuery({
    queryKey: [...publicBatchPhotosQueryKey, 'stats'],
    queryFn: fetchPublicBatchPhotoStats,
    staleTime: 60 * 1000,
  });

  const allYears = stats?.years ?? [];
  const batches = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const filteredBatches = batches;

  // Lightbox Modal State
  const [activePhoto, setActivePhoto] = useState<BatchPhotoRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const element = document.getElementById('batch-filters');
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  const handleCopyShare = async (_photo: BatchPhotoRecord) => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const decades = useMemo(() => {
    const years = allYears ?? [];
    const seen = new Set<number>();
    for (const year of years) seen.add(Math.floor(year / 10) * 10);
    return [
      { label: 'All Decades', value: 'ALL' },
      ...[...seen]
        .sort((a, b) => b - a)
        .map((decade) => ({ label: `${decade}s`, value: String(decade) })),
    ];
  }, [allYears]);

  /* The years the archive reaches back to, worked out from what is held
     rather than written into the page by hand. */
  const yearRange = useMemo(() => {
    if (stats?.earliestYear && stats?.latestYear) {
      return stats.earliestYear === stats.latestYear
        ? `${stats.earliestYear}`
        : `${stats.earliestYear}–${stats.latestYear}`;
    }
    const years = allYears ?? [];
    if (years.length === 0) return '';
    const earliest = Math.min(...years);
    const latest = Math.max(...years);
    return earliest === latest ? `${earliest}` : `${earliest}–${latest}`;
  }, [stats, allYears]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>
          {yearRange
            ? `Batch Photos Archive (${yearRange}) | Shri Nirakar Education Society`
            : 'Batch Photos Archive | Shri Nirakar Education Society'}
        </title>
        <meta
          name="description"
          content={
            yearRange
              ? `Historical graduating class photographs across Shri Nirakar High School, Tudal High School, and S.S. Angle HSS from ${yearRange.split('–')[0]} to the present.`
              : 'Historical graduating class photographs across Shri Nirakar High School, Tudal High School, and S.S. Angle HSS.'
          }
        />
      </Helmet>

      <Navbar />

      {/* HEADER BANNER - Full-width seamless dark navy banner */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center space-y-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-flex items-center gap-1.5">
              <Camera size={13} />
              <span>
                Historical Alumni Registry
                {yearRange ? ` • ${yearRange.split('–')[0]} to Present` : ''}
              </span>
            </span>
            <span className="text-xs font-mono text-stone-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 hidden sm:inline-block">
              {stats?.total ?? total} Archived Batches
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Secondary & Higher Secondary Batch Photos
          </h1>

          <p className="max-w-3xl text-stone-300 text-sm sm:text-base leading-relaxed">
            Preserving six decades of memories, graduating classes, student portraits, and respected faculty mentors across Shri Nirakar High School (Mashem), Tudal High School (Gaondongrem), and S. S. Angle Higher Secondary School (Dapot).
          </p>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      {/* MAIN CONTAINER */}
      <main className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-10 sm:py-14 space-y-8">
        {/* INTERACTIVE FILTER & SEARCH BAR */}
        <div id="batch-filters" className="relative z-30 scroll-mt-28 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          {/* Search + School Quick Tabs */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search batches by year (e.g. 1985), school, or keyword..."
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-stone-50 hover:bg-white focus:bg-white text-stone-900 placeholder:text-stone-400 border border-stone-200 focus:border-amber-600 rounded-xl outline-none font-sans transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* School Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              <button
                type="button"
                onClick={() => {
                  setSchoolFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide uppercase transition-all shrink-0 cursor-pointer ${
                  schoolFilter === 'ALL'
                    ? 'bg-[#0b132b] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                }`}
              >
                All {BATCH_CAMPUS_OPTIONS.length} Campuses
              </button>
              {BATCH_CAMPUS_OPTIONS.map((campus) => (
                <button
                  key={campus.code}
                  type="button"
                  onClick={() => {
                    setSchoolFilter(campus.code);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide uppercase transition-all shrink-0 cursor-pointer ${
                    schoolFilter === campus.code
                      ? 'bg-[#0b132b] text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  {campus.short} ({campus.place})
                </button>
              ))}
            </div>
          </div>

          {/* Sub Filters: Stream / Level & Decades */}
          <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Batch Stream Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-mono text-stone-400 text-[11px] uppercase tracking-wider shrink-0">Stream:</span>
              <div className="flex-1 sm:flex-initial min-w-0">
                <CustomSelect
                  value={typeFilter}
                  onChange={(val) => {
                    setTypeFilter(val);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: 'ALL', label: 'All Batch Streams' },
                    ...BATCH_STREAM_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    })),
                  ]}
                  size="sm"
                  className="bg-stone-50 w-full sm:min-w-[170px]"
                />
              </div>
            </div>

            {/* Decade Quick Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto pb-1 sm:pb-0">
              <span className="font-mono text-stone-400 text-[11px] uppercase tracking-wider shrink-0 mr-1">
                Decade:
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {decades.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => {
                      setDecadeFilter(d.value);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 sm:py-0.5 rounded-md font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                      decadeFilter === d.value
                        ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS HEADER */}
        <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
          <div>
            Showing <strong className="text-stone-900 font-bold">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-stone-900 font-bold">{Math.min(currentPage * pageSize, total)}</strong> of{' '}
            <strong className="text-stone-900 font-bold">{total}</strong> archived batch photographs
          </div>
          {(searchQuery || schoolFilter !== 'ALL' || typeFilter !== 'ALL' || decadeFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSchoolFilter('ALL');
                setTypeFilter('ALL');
                setDecadeFilter('ALL');
                setCurrentPage(1);
              }}
              className="text-amber-800 hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <RotateCcw size={12} />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* GRID OF BATCH PHOTO CARDS */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-stone-500">
            <Loader2 size={18} className="animate-spin text-amber-700" />
            <span>Opening the archive...</span>
          </div>
        ) : isError ? (
          <div className="space-y-2 rounded-3xl border border-stone-200 bg-white py-20 text-center">
            <AlertCircle size={32} className="mx-auto text-rose-400" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              The archive could not be opened.
            </h3>
            <p className="text-xs text-stone-500">
              {(error as Error)?.message || 'Please try again in a moment.'}
            </p>
          </div>
        ) : filteredBatches.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => setActivePhoto(batch)}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  {/* Photo Thumbnail with Zoom Overlay */}
                  <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
                    <img
                      src={batch.photoUrl}
                      alt={batch.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="px-3 py-1.5 rounded-full bg-white/95 text-stone-900 font-mono text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all">
                        <ZoomIn size={13} />
                        <span>Inspect Photo</span>
                      </span>
                    </div>

                    {/* Year Tag Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black tracking-wider bg-[#0b132b]/90 text-amber-300 backdrop-blur-md shadow-xs border border-white/10">
                        {batch.batchYear}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {BATCH_CAMPUS_OPTIONS.find((c) => c.code === batch.institutionCode)?.short ??
                            batch.institutionCode}
                        </span>
                        {batch.batchSession && (
                          <span className="font-mono text-stone-500 text-[11px]">
                            {batch.batchSession}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                        {batch.title}
                      </h3>

                      {batch.caption && (
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {batch.caption}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-500">
                        {batch.classLevel} {batch.division ? `• ${batch.division}` : ''}
                      </span>
                      <span className="text-blue-700 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                        <span>View</span>
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FULL PAGINATION BAR */}
            {total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200">
                {/* Total & Per Page Selector */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-stone-600">
                  <span>
                    Showing <strong className="text-stone-900 font-bold">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                    <strong className="text-stone-900 font-bold">
                      {Math.min(currentPage * pageSize, total)}
                    </strong>{' '}
                    of <strong className="text-stone-900 font-bold">{total}</strong> archived photographs
                  </span>

                  <div className="flex items-center gap-1.5 pl-0 sm:border-l sm:border-stone-300 sm:pl-3">
                    <span className="text-stone-400">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs font-mono font-bold text-stone-800 outline-none hover:border-amber-500 focus:border-amber-600 transition-colors cursor-pointer"
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size} / page
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Page Navigation Buttons */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    {/* First Page Button */}
                    <button
                      type="button"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="h-9 w-9 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                      title="First page"
                      aria-label="First page"
                    >
                      <ChevronsLeft size={15} />
                    </button>

                    {/* Previous Page Button */}
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-9 px-3 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 flex items-center gap-1 text-xs font-mono font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={15} />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers(currentPage, totalPages).map((p, idx) =>
                        p === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-1.5 text-xs font-mono text-stone-400 select-none">
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => goToPage(p)}
                            className={`h-9 min-w-[36px] px-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                              p === currentPage
                                ? 'bg-[#0b132b] text-amber-300 shadow-md ring-2 ring-amber-400/40'
                                : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 hover:border-stone-300 shadow-xs'
                            }`}
                            aria-current={p === currentPage ? 'page' : undefined}
                          >
                            {p}
                          </button>
                        ),
                      )}
                    </div>

                    {/* Next Page Button */}
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-9 px-3 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 flex items-center gap-1 text-xs font-mono font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                      aria-label="Next page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={15} />
                    </button>

                    {/* Last Page Button */}
                    <button
                      type="button"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                      title="Last page"
                      aria-label="Last page"
                    >
                      <ChevronsRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center space-y-2 bg-white rounded-3xl border border-stone-200">
            <Camera size={32} className="text-stone-400 mx-auto" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              No batch photos found matching your search.
            </h3>
            <p className="text-xs text-stone-500">
              Try adjusting your year, school, or stream filters.
            </p>
          </div>
        )}
      </main>

      {/* HIGH-RES LIGHTBOX MODAL */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-800/20 flex flex-col lg:flex-row h-auto max-h-[92vh]"
          >
            {/* Left: High-Res Photo Display */}
            <div className="flex-1 bg-stone-950 relative flex items-center justify-center p-2 sm:p-4 md:p-6 min-h-[260px] sm:min-h-[380px] lg:min-h-[540px] overflow-hidden">
              <img
                src={activePhoto.photoUrl}
                alt={activePhoto.title}
                className="w-full h-full max-h-[50vh] sm:max-h-[60vh] lg:max-h-[82vh] object-contain drop-shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="lg:hidden absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer z-10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Right: Metadata & Details Sidebar */}
            <div className="w-full lg:w-88 p-5 sm:p-7 lg:p-8 flex flex-col justify-between space-y-5 overflow-y-auto bg-stone-50/80 border-t lg:border-t-0 lg:border-l border-stone-200 shrink-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Class of {activePhoto.batchYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePhoto(null)}
                    className="hidden lg:inline-flex p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                    {activePhoto.title}
                  </h2>
                  <div className="text-xs font-mono text-stone-500 mt-1">
                    Academic Session: {activePhoto.batchSession}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-200 text-xs font-sans">
                  <div>
                    <span className="font-mono text-stone-400 uppercase text-[10px] block">Institution</span>
                    <span className="font-bold text-stone-900">
                      {BATCH_CAMPUS_OPTIONS.find((c) => c.code === activePhoto.institutionCode)?.short ??
                        activePhoto.institutionCode}
                    </span>
                    <span className="block text-[11px] text-stone-500">
                      {BATCH_CAMPUS_OPTIONS.find((c) => c.code === activePhoto.institutionCode)?.place}
                    </span>
                  </div>

                  <div>
                    <span className="font-mono text-stone-400 uppercase text-[10px] block">Level / Stream</span>
                    <span className="font-semibold text-stone-800">
                      {BATCH_STREAM_OPTIONS.find((s) => s.value === activePhoto.stream)?.label ??
                        activePhoto.stream}
                    </span>
                  </div>

                  {activePhoto.division && (
                    <div>
                      <span className="font-mono text-stone-400 uppercase text-[10px] block">Class / Division</span>
                      <span className="font-mono text-stone-800">{activePhoto.division}</span>
                    </div>
                  )}

                  <div>
                    <span className="font-mono text-stone-400 uppercase text-[10px] block">Photograph File</span>
                    <span className="inline-flex items-center gap-1.5 font-mono text-stone-800">
                      <FileTypeIcon format={activePhoto.imageFormat} size={12} />
                      <span className="uppercase">{activePhoto.imageFormat}</span>
                    </span>
                  </div>

                  {activePhoto.caption && (
                    <div className="pt-2">
                      <span className="font-mono text-stone-400 uppercase text-[10px] block">Archive Notes</span>
                      <p className="text-xs text-stone-600 leading-relaxed mt-0.5">
                        {activePhoto.caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-stone-200 text-xs font-mono">
                <a
                  href={apiUrl(`/api/v1/batch-photos/${activePhoto.id}/download`)}
                  download
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0b132b] hover:bg-stone-800 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Download size={14} />
                  <span>Download Original HD Photo</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyShare(activePhoto)}
                  className="w-full py-2 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Share Archive Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
