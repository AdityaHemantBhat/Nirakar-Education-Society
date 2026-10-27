import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  X,
  Library as LibraryIcon,
  Loader2,
  ArrowUpDown,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { LibraryVolumeCard } from '../components/LibraryVolumeCard.js';
import {
  buildLibraryQuery,
  LIBRARY_CATEGORY_LABELS,
  LIBRARY_STANDARD_OPTIONS,
  LibraryCatalogResponse,
  LibraryCategory,
  LibraryStandard,
} from '../lib/library.js';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently added' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'standard', label: 'By standard' },
  { value: 'popular', label: 'Most read' },
] as const;

export const LibraryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [standard, setStandard] = useState<'ALL' | LibraryStandard>('ALL');
  const [category, setCategory] = useState<'ALL' | LibraryCategory>('ALL');
  const [subject, setSubject] = useState<string>('');
  const [sort, setSort] = useState<string>('recent');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const queryString = buildLibraryQuery({
    standard,
    category,
    subject,
    q: search,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  const { data, isLoading, isError, isFetching, refetch } = useQuery<LibraryCatalogResponse>({
    queryKey: ['library_catalog', queryString],
    queryFn: async () => {
      const response = await fetch(`/api/v1/library/catalog?${queryString}`);
      if (!response.ok) throw new Error('Could not load the library catalogue.');
      const json = await response.json();
      if (!json.success) throw new Error('The library catalogue response was invalid.');
      return json.data as LibraryCatalogResponse;
    },
    placeholderData: (previous) => previous,
    staleTime: 60 * 1000,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.pageCount ?? 1;
  const subjects = data?.subjects ?? [];
  const standardCounts = data?.standardCounts ?? [];

  const countFor = (value: LibraryStandard) =>
    standardCounts.find((c) => c.standard === value)?.count ?? 0;

  const standardLabel = (value: LibraryStandard) =>
    LIBRARY_STANDARD_OPTIONS.find((o) => o.value === value)?.label ?? `Std ${value}`;

  const activeFilterCount =
    (standard !== 'ALL' ? 1 : 0) + (category !== 'ALL' ? 1 : 0) + (subject ? 1 : 0);

  const resetFilters = () => {
    setStandard('ALL');
    setCategory('ALL');
    setSubject('');
    setPage(1);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#0f172a] flex flex-col font-sans">
      <Helmet>
        <title>Digital Library · Shree Nirakar Education Society</title>
        <meta
          name="description"
          content="Read textbooks, question papers and reference volumes for Standards V to XII, online, from the Society's digital library."
        />
      </Helmet>

      <Navbar />

      {/* ================================================================== */}
      {/* The reading-room banner                                             */}
      {/* ================================================================== */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        <HeroWaves opacity={0.85} />

        <div className="w-full relative z-10 max-w-5xl space-y-3">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block">
            The Society Archive
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            The Reading Room
          </h1>

          <p className="text-stone-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Every volume is published as a real page-turning book. Browse textbooks, question
            papers and reference material for Standards V through XII, and read them online from
            any device — on the campus Wi-Fi, on a commute, or from home.
          </p>

          {/* The search sits in the banner, where a reader would look for it. */}
          <div className="mt-6 w-full max-w-2xl">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search the shelves by title, author or subject…"
                className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 pl-12 pr-4 text-sm text-white shadow-lg outline-none transition placeholder:text-stone-400 focus:border-amber-400/60 focus:bg-white/15"
              />
            </div>

            {/* The quick standards, right under the search. */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setStandard('ALL');
                  setPage(1);
                }}
                className={`rounded-full border px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] transition ${
                  standard === 'ALL'
                    ? 'border-amber-400 bg-amber-400 text-[#0b132b]'
                    : 'border-white/20 text-stone-300 hover:border-white/40 hover:text-white'
                }`}
              >
                All
              </button>
              {LIBRARY_STANDARD_OPTIONS.map((o) => {
                const count = countFor(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    disabled={count === 0 && standard !== o.value}
                    onClick={() => {
                      setStandard(o.value);
                      setPage(1);
                    }}
                    className={`rounded-full border px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] transition disabled:cursor-not-allowed disabled:opacity-25 ${
                      standard === o.value
                        ? 'border-amber-400 bg-amber-400 text-[#0b132b]'
                        : 'border-white/20 text-stone-300 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {o.label.replace('Std ', '')}
                    {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />
      {/* ================================================================== */}
      {/* The catalogue                                                        */}
      {/* ================================================================== */}
      <main className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-14">
        <div className="mx-auto w-full max-w-7xl">
          {/* ---------------------------- The toolbar ---------------------------- */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 sm:text-2xl">
                {isLoading ? 'Opening the shelves…' : 'The catalogue'}
              </h2>
              <p className="mt-1 font-mono text-[11px] text-stone-500">
                {isLoading ? ' ' : `${total} volume${total === 1 ? '' : 's'} on the shelves`}
                {isFetching && !isLoading && ' · updating'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 lg:hidden"
              >
                <Filter size={13} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#111b5e] px-1 text-[9px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <label className="relative flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-600">
                <ArrowUpDown size={13} className="shrink-0 text-stone-400" />
                <span className="sr-only">Sort volumes</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="cursor-pointer appearance-none bg-transparent pr-4 text-xs font-semibold text-stone-700 outline-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* ---------------------------- The filters ---------------------------- */}
          <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="mt-5 flex flex-col gap-4 border-y border-stone-200/80 py-4 lg:flex-row lg:items-start lg:gap-8">
              {/* Material type */}
              <div className="lg:w-[38%]">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">
                  Material type
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('ALL');
                      setPage(1);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                      category === 'ALL'
                        ? 'border-[#111b5e] bg-[#111b5e] text-white'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
                    }`}
                  >
                    All
                  </button>
                  {(Object.keys(LIBRARY_CATEGORY_LABELS) as LibraryCategory[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setCategory(key);
                        setPage(1);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                        category === key
                          ? 'border-accent-600 bg-accent-600 text-white'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {LIBRARY_CATEGORY_LABELS[key]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="lg:flex-1">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-400">
                  Subject
                </p>
                {subjects.length === 0 ? (
                  <p className="text-[11px] text-stone-400">No subjects catalogued yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSubject('');
                        setPage(1);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                        subject === ''
                          ? 'border-[#111b5e] bg-[#111b5e] text-white'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      All
                    </button>
                    {subjects.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSubject(s);
                          setPage(1);
                        }}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                          subject === s
                            ? 'border-[#111b5e] bg-[#111b5e] text-white'
                            : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* The active filters */}
              {activeFilterCount > 0 && (
                <div className="shrink-0 lg:pt-6">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-stone-500 transition hover:text-[#111b5e]"
                  >
                    <X size={11} />
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ------------------------------ The grid ------------------------------ */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-sm text-stone-500">
              <Loader2 size={16} className="animate-spin" />
              Opening the library…
            </div>
          ) : isError ? (
            <div className="py-24 text-center">
              <p className="text-sm text-stone-600">The catalogue could not be loaded.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-2 text-xs font-semibold text-[#111b5e] underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <LibraryIcon size={30} className="text-stone-300" />
              <p className="font-serif text-lg font-bold text-stone-700">No volumes found</p>
              <p className="max-w-sm text-sm text-stone-500">
                {activeFilterCount > 0
                  ? 'Try clearing the filters, or search for a different title.'
                  : 'The library is being prepared. Please check back shortly.'}
              </p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[#111b5e] underline underline-offset-4"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((volume) => (
                  <li key={volume.id}>
                    <LibraryVolumeCard
                      volume={volume}
                      standardLabel={standardLabel(volume.standard)}
                    />
                  </li>
                ))}
              </ul>

              {/* ---------------------------- Pagination ---------------------------- */}
              {pageCount > 1 && (
                <nav
                  className="mt-12 flex items-center justify-center gap-1.5"
                  aria-label="Catalogue pages"
                >
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="mr-1 rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-[11px] font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-35"
                  >
                    Previous
                  </button>

                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={n === page ? 'page' : undefined}
                      className={`h-9 min-w-9 rounded-lg px-2.5 font-mono text-xs font-semibold transition ${
                        n === page
                          ? 'bg-[#111b5e] text-white'
                          : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={page >= pageCount}
                    className="ml-1 rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-[11px] font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-35"
                  >
                    Next
                  </button>
                </nav>
              )}

              {/* The page count */}
              <p className="mt-4 text-center font-mono text-[10.5px] text-stone-400">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
            </>
          )}
        </div>
      </main>

      {/* ================================================================== */}
      {/* The closing note                                                    */}
      {/* ================================================================== */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pb-14 sm:pb-16">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-700">
              <Sparkles size={22} />
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold text-ink sm:text-3xl">
              A shelf that is always open
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
              Every volume uploaded by the Society office appears here within minutes. Nothing to
              install, nothing to sign up for — open a book and start reading.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/academics"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-xs font-bold text-stone-700 transition hover:border-[#111b5e]/30 hover:text-[#111b5e]"
              >
                <GraduationCap size={14} />
                Explore academics
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-[#111b5e] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#0b132b]"
              >
                Request a volume
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LibraryPage;
