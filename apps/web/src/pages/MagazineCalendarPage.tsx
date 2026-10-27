import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { BookOpen, ChevronLeft, ChevronRight, Search, ArrowUpRight, Sparkles, Clock3, CalendarDays } from 'lucide-react';

export const MagazineCalendarPage: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;
  const archiveRef = useRef<HTMLElement>(null);

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['magazine_calendar', currentYear, currentMonth],
    queryFn: async () => {
      const res = await fetch(`/api/v1/magazine/calendar?year=${currentYear}&month=${currentMonth}`);
      if (!res.ok) throw new Error('Failed to load magazine calendar');
      const json = await res.json();
      return json.data || [];
    },
  });

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [currentYear, currentMonth, searchQuery]);

  const filteredIssues = issues.filter((issue: any) =>
    issue.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  const [featuredIssue, ...otherIssues] = filteredIssues;
  const totalPages = Math.max(1, Math.ceil(otherIssues.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedIssues = otherIssues.slice(pageStart, pageStart + PAGE_SIZE);
  const visibleStart = filteredIssues.length ? (featuredIssue ? pageStart + 2 : pageStart + 1) : 0;
  const visibleEnd = featuredIssue ? Math.min(filteredIssues.length, pageStart + paginatedIssues.length + 1) : 0;

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    archiveRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const visiblePageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((page) => page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 1);
  const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <>
      <Helmet>
        <title>Shri Nirakar Daily Magazine — Publication Calendar & Archives</title>
        <meta
          name="description"
          content="Browse daily issues, back issues, and publication archives of Shri Nirakar Daily Magazine (Shri Nirakar High School)."
        />
      </Helmet>

      <Navbar />

      {/* Header: Seamlessly tucked under Navbar golden curve with ZERO gap */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
              <Sparkles size={13} /> The school magazine
            </span>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Stories from <span className="text-amber-300">our campus.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-stone-300 sm:text-base">
              Browse every edition, revisit memorable moments, and read the complete magazine free in an immersive page-flip reader.
            </p>
          </div>
          <div className="min-w-48 border-t border-white/15 px-8 pt-5 text-white/70">
            <p className="text-4xl font-serif text-amber-300">{issues.length.toString().padStart(2, '0')}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em]">Editions this month</p>
          </div>
        </div>
      </div>

      <SectionEdge variant="wave" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      <main className="min-h-screen bg-[#FAF7F2] pb-20 font-sans">
        <div className="mx-auto mt-8 max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <section ref={archiveRef} className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-700">The archive</p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-ink sm:text-3xl">
                  {monthNames[currentMonth - 1]} <span className="text-stone-400">{currentYear}</span>
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-500">
                  <Search size={16} />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Find an edition" className="w-full bg-transparent text-sm text-stone-800 outline-none sm:w-48" />
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={prevMonth} className="rounded-xl border border-stone-200 p-2.5 hover:bg-stone-50" aria-label="Previous Month"><ChevronLeft size={19} /></button>
                  <button type="button" onClick={nextMonth} className="rounded-xl border border-stone-200 p-2.5 hover:bg-stone-50" aria-label="Next Month"><ChevronRight size={19} /></button>
                </div>
              </div>
            </div>
            {isLoading ? <div className="p-8 text-center text-sm text-stone-500">Turning through the archive…</div> : null}
            {!isLoading && issues.length === 0 ? (
              <div className="bg-white px-6 py-16 text-center">
                <BookOpen size={28} className="mx-auto mb-3 text-stone-300" />
                <p className="font-serif text-lg font-semibold text-stone-700">No editions published in this month</p>
                <p className="mt-1 text-sm text-stone-500">Use the arrows to explore the archive.</p>
              </div>
            ) : null}
            {!isLoading && issues.length > 0 && !featuredIssue ? (
              <div className="bg-white px-6 py-16 text-center">
                <BookOpen size={28} className="mx-auto mb-3 text-stone-300" />
                <p className="font-serif text-lg font-semibold text-stone-700">No editions found</p>
                <p className="mt-1 text-sm text-stone-500">Try another title or choose a different month.</p>
              </div>
            ) : null}
            {!isLoading && featuredIssue && (
              <div className="bg-[#fbf9f4] p-4 sm:p-7 lg:p-9">
                <Link
                  to={`/magazine/issue/${encodeURIComponent(featuredIssue.publishDate)}`}
                  className="group grid overflow-hidden border border-stone-300 bg-white shadow-[0_14px_38px_-28px_rgba(28,25,23,0.45)] transition-shadow hover:shadow-[0_20px_44px_-26px_rgba(28,25,23,0.5)] md:grid-cols-[minmax(220px,0.8fr)_1.2fr]"
                >
                  <div className="relative flex min-h-[310px] items-center justify-center overflow-hidden bg-[#e9e2d6] p-4 sm:min-h-[380px] sm:p-6">
                    {featuredIssue.coverUrl ? (
                      <img src={featuredIssue.coverUrl} alt={`${featuredIssue.title} cover`} className="relative z-0 h-[290px] w-auto max-w-full object-contain transition-transform duration-700 group-hover:scale-[1.015] sm:h-[340px]" />
                    ) : (
                      <div className="relative flex h-[290px] w-full max-w-[260px] flex-col justify-between overflow-hidden bg-[#e9e2d6] p-6 sm:h-[340px] sm:p-9">
                        <div className="absolute inset-3 border border-[#111b5e]/20" />
                        <span className="relative font-mono text-[9px] uppercase tracking-[0.2em] text-[#111b5e]/75">Shri Nirakar Vidyalaya · Mashem</span>
                        <div className="relative max-w-sm">
                          <span className="mb-3 block h-px w-12 bg-amber-700" />
                          <span className="font-serif text-3xl font-bold leading-tight text-[#111b5e] sm:text-4xl">The school magazine</span>
                          <span className="mt-4 block font-mono text-[10px] uppercase tracking-[0.18em] text-stone-600">{formatDate(featuredIssue.publishDate)}</span>
                        </div>
                        <span className="relative self-end font-mono text-[9px] uppercase tracking-[0.16em] text-stone-500">Daily edition · No. 01</span>
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 bg-white/95 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[#111b5e] shadow-sm">Lead edition</span>
                    <span className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[9px] bg-gradient-to-r from-black/25 via-black/5 to-transparent" />
                  </div>
                  <div className="flex flex-col justify-between p-6 sm:p-9 lg:p-12">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-stone-500">
                      <span className="inline-flex items-center gap-2 text-amber-800"><span className="h-1.5 w-1.5 rounded-full bg-amber-700" /> From this month’s edition</span>
                      <span>{formatDate(featuredIssue.publishDate)}</span>
                    </div>
                    <div className="py-8">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">{featuredIssue.pageCount || 0} pages <span className="mx-1 text-amber-700">·</span> Free to read</p>
                      <h3 className="mt-4 max-w-2xl font-serif text-3xl font-bold leading-[1.08] tracking-tight text-[#171b29] sm:text-4xl lg:text-5xl">{featuredIssue.title}</h3>
                      {featuredIssue.excerpt && <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">{featuredIssue.excerpt}</p>}
                    </div>
                    <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-stone-500">Read the complete issue</span>
                      <span className="inline-flex items-center gap-2 font-serif text-sm font-bold text-[#111b5e] transition-colors group-hover:text-amber-800">Open magazine <ArrowUpRight size={16} /></span>
                    </div>
                  </div>
                </Link>

                {otherIssues.length > 0 && (
                  <div className="mt-10">
                    <div className="mb-4 flex items-end justify-between border-b-2 border-[#171b29] pb-2">
                      <div>
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-amber-800">More to read</p>
                        <h3 className="mt-1 font-serif text-2xl font-bold text-[#171b29]">Earlier editions</h3>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone-500">{otherIssues.length} {otherIssues.length === 1 ? 'issue' : 'issues'}</span>
                    </div>
                    <div className="divide-y divide-stone-300 border-b border-stone-300">
                      {paginatedIssues.map((issue: any, index: number) => {
                        const editionNumber = pageStart + index + 2;
                        return (
                          <Link key={issue.id} to={`/magazine/issue/${encodeURIComponent(issue.publishDate)}`} className="group grid gap-4 py-5 transition-colors hover:bg-white/70 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:items-center sm:px-3">
                            <div className="relative h-24 w-[76px] overflow-hidden border border-stone-300 bg-[#e9e2d6] shadow-[2px_2px_0_#d8d0c4]">
                              {issue.coverUrl ? <img src={issue.coverUrl} alt={`${issue.title} cover`} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full flex-col justify-between p-2"><span className="font-mono text-[7px] uppercase tracking-wide text-[#111b5e]">Nirakar</span><span className="font-serif text-[11px] font-bold leading-tight text-[#111b5e]">School<br />Magazine</span><span className="font-mono text-[7px] text-stone-500">{String(editionNumber).padStart(2, '0')}</span></div>}
                              <span className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-black/20 to-transparent" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.14em] text-stone-500"><span>Edition {String(editionNumber).padStart(2, '0')}</span><span className="text-amber-700">{formatDate(issue.publishDate)}</span></div>
                              <h4 className="mt-1 font-serif text-xl font-bold leading-tight text-[#171b29] group-hover:text-[#111b5e] sm:text-2xl">{issue.title}</h4>
                              {issue.excerpt && <p className="mt-1 line-clamp-2 max-w-2xl text-xs leading-relaxed text-stone-600">{issue.excerpt}</p>}
                              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-stone-400">{issue.pageCount || 0} pages · Free to read</p>
                            </div>
                            <span className="inline-flex items-center gap-1 self-end font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#111b5e] group-hover:text-amber-800 sm:self-center">Read issue <ArrowUpRight size={13} /></span>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex flex-col gap-3 border-t border-stone-300 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone-500">
                        Showing {visibleStart}–{visibleEnd} of {filteredIssues.length} {filteredIssues.length === 1 ? 'edition' : 'editions'}
                      </p>
                      {totalPages > 1 && (
                        <nav aria-label="Magazine archive pages" className="flex flex-wrap items-center justify-center gap-1.5">
                          <button type="button" onClick={() => changePage(safeCurrentPage - 1)} disabled={safeCurrentPage === 1} className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-serif font-bold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40">
                            <ChevronLeft size={14} /> Previous
                          </button>
                          {visiblePageNumbers.map((page, index) => {
                            const previous = visiblePageNumbers[index - 1];
                            return (
                              <React.Fragment key={page}>
                                {previous && page - previous > 1 && <span aria-hidden="true" className="px-1 text-xs text-stone-400">…</span>}
                                <button type="button" onClick={() => changePage(page)} aria-current={safeCurrentPage === page ? 'page' : undefined} aria-label={`Page ${page}`} className={`h-9 min-w-9 rounded-xl border px-2 text-xs font-mono font-bold transition ${safeCurrentPage === page ? 'border-[#0b132b] bg-[#0b132b] text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'}`}>
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          })}
                          <button type="button" onClick={() => changePage(safeCurrentPage + 1)} disabled={safeCurrentPage === totalPages} className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-serif font-bold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40">
                            Next <ChevronRight size={14} />
                          </button>
                        </nav>
                      )}
                    </div>
                  </div>
                )}
                <p className="mt-8 text-center font-serif text-sm italic text-stone-500">A few pages from school life, kept together for another day.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};
