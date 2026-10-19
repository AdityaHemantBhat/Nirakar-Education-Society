import React, { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { CustomSelect } from '../components/CustomSelect.js';
import { useAlumniSocket } from '../hooks/useAlumniSocket.js';

type AlumniProfile = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  school: string;
  batchYear: number;
  photoUrl?: string | null;
  city?: string | null;
  occupation?: string | null;
  verificationLevel: string;
  user?: { username: string } | null;
};

const schools: Record<string, string> = {
  NIRAKAR_HS: 'Shri Nirakar Vidyalaya',
  TUDAL_HS: 'Tudal High School',
  ANGLE_HSS: 'S. S. Angle Higher Secondary School',
};

const schoolOptions = [
  { value: '', label: 'All institutions' },
  { value: 'NIRAKAR_HS', label: schools.NIRAKAR_HS },
  { value: 'TUDAL_HS', label: schools.TUDAL_HS },
  { value: 'ANGLE_HSS', label: schools.ANGLE_HSS },
];

const cardMotion = {
  hidden: { opacity: 0, y: 22 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(index * 0.045, 0.4),
      duration: 0.42,
      ease: 'easeOut' as const,
    },
  }),
};

async function fetchAlumniDirectory(): Promise<AlumniProfile[]> {
  const alumni: AlumniProfile[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ limit: '100' });
    if (cursor) params.set('cursor', cursor);

    const response = await fetch(`/api/v1/alumni?${params.toString()}`);
    if (!response.ok) throw new Error('Unable to load the alumni directory.');

    const result = await response.json();
    if (!Array.isArray(result.data)) throw new Error('The alumni directory response was invalid.');
    alumni.push(...result.data);

    if (!result.meta?.hasNextPage) break;
    const nextCursor = result.meta.cursor;
    if (typeof nextCursor !== 'string' || !nextCursor || seenCursors.has(nextCursor)) {
      throw new Error('The alumni directory returned an invalid page cursor.');
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  } while (true);

  return alumni;
}

function getAlumniName(alumnus: AlumniProfile): string {
  return [alumnus.firstName, alumnus.middleName, alumnus.lastName]
    .filter((part) => typeof part === 'string' && part.trim())
    .join(' ');
}

function AlumniSkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" aria-hidden="true">
      <div className="h-11 animate-pulse border-b border-stone-100 bg-stone-50" />
      <div className="p-4 pb-2">
        <div className="aspect-[4/3] animate-pulse rounded-xl bg-stone-100" />
      </div>
      <div className="space-y-3 p-4 pt-1">
        <div className="h-5 w-3/4 animate-pulse rounded bg-stone-200" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-stone-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-stone-100" />
      </div>
      <div className="h-12 animate-pulse border-t border-stone-100 bg-stone-50/70" />
    </div>
  );
}

export const AlumniDirectoryNextPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [school, setSchool] = useState(() => {
    const selectedSchool = searchParams.get('school');
    return schoolOptions.some((option) => option.value === selectedSchool) ? selectedSchool! : '';
  });
  const [year, setYear] = useState(() => searchParams.get('batchYear') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const directoryRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 8;
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const hero = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  useAlumniSocket();

  useEffect(() => {
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    if (!targetId) return;
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' });
    });
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-directory-hero]',
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.65, stagger: 0.1, ease: 'power3.out' },
      );
    }, hero);
    return () => context.revert();
  }, []);

  const {
    data: alumni = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['alumni_directory'],
    queryFn: fetchAlumniDirectory,
    staleTime: 20_000,
  });

  const filteredAlumni = useMemo(() => {
    const normalizedYear = year.trim();
    return alumni.filter((alumnus) => {
      const name = getAlumniName(alumnus).toLowerCase();
      const matchesSearch =
        !deferredSearch ||
        name.includes(deferredSearch) ||
        (alumnus.occupation || '').toLowerCase().includes(deferredSearch) ||
        (alumnus.city || '').toLowerCase().includes(deferredSearch);
      const matchesSchool = !school || alumnus.school === school;
      const matchesYear = !normalizedYear || String(alumnus.batchYear).includes(normalizedYear);
      return matchesSearch && matchesSchool && matchesYear;
    });
  }, [alumni, deferredSearch, school, year]);
  const totalPages = Math.max(1, Math.ceil(filteredAlumni.length / itemsPerPage));
  const pageAlumni = useMemo(
    () => filteredAlumni.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredAlumni, currentPage],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, school, year]);

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Helmet>
        <title>Alumni Directory | Shree Nirakar Education Society</title>
        <meta
          name="description"
          content="Explore alumni from Shree Nirakar Education Society schools and reconnect with your community."
        />
      </Helmet>
      <Navbar />

      <main className="min-h-screen bg-[#FAF7F2] pb-20 font-sans text-stone-900">
        <section
          ref={hero}
          className="relative isolate -mt-0 overflow-hidden bg-[#0b132b] px-4 pb-14 pt-12 text-white sm:px-8 sm:pb-18 sm:pt-16 lg:-mt-[78px] lg:px-12 lg:pt-28 xl:px-16 2xl:px-24"
        >
          <HeroWaves opacity={0.75} />
          <div className="relative z-10 mx-auto w-full max-w-[1850px] space-y-4 text-center">
            <div
              data-directory-hero
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-amber-200"
            >
              <Sparkles size={13} />
              Our alumni community
            </div>
            <h1
              data-directory-hero
              className="mx-auto max-w-5xl font-serif text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
            >
              Rooted here.
              <br />
              <em className="font-normal text-amber-300">Making a difference everywhere.</em>
            </h1>
            <p
              data-directory-hero
              className="mx-auto max-w-4xl text-sm leading-relaxed text-stone-300 sm:text-base"
            >
              Meet graduates from across our schools, find familiar faces, and celebrate the many paths our alumni have taken.
            </p>
          </div>
        </section>
        <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

        <div ref={directoryRef} className="relative z-10 -mt-1 w-full space-y-8 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <section id="directory-filters" className="scroll-mt-28 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <label className="relative flex min-w-0 flex-1 items-center">
                <Search size={17} className="absolute left-4 text-stone-400" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, career, or city..."
                  className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#0b132b] focus:bg-white focus:ring-4 focus:ring-stone-100"
                />
              </label>
              <div className="grid grid-cols-2 gap-3 lg:flex">
                <CustomSelect
                  value={school}
                  onChange={setSchool}
                  options={schoolOptions}
                  className="min-w-0 bg-stone-50 lg:min-w-[220px]"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  placeholder="Class year"
                  aria-label="Filter by class year"
                  className="h-12 min-w-0 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm outline-none transition focus:border-[#0b132b] focus:bg-white focus:ring-4 focus:ring-stone-100 lg:w-36"
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">Alumni directory</h2>
              <p className="mt-1 text-xs text-stone-500">
                {isLoading
                  ? 'Loading profiles...'
                  : `Showing ${filteredAlumni.length ? (currentPage - 1) * itemsPerPage + 1 : 0}–${Math.min(currentPage * itemsPerPage, filteredAlumni.length)} of ${filteredAlumni.length} alumni`}
              </p>
            </div>
            {!isLoading && !isError && (search || school || year) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSchool('');
                  setYear('');
                }}
                className="text-xs font-semibold text-amber-900 underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>

          {isLoading ? (
            <div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              role="status"
              aria-label="Loading alumni directory"
            >
              {Array.from({ length: itemsPerPage }, (_, index) => <AlumniSkeletonCard key={index} />)}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-rose-200 bg-white px-6 py-12 text-center">
              <h2 className="font-serif text-xl font-bold text-stone-900">Alumni directory unavailable</h2>
              <p className="mt-2 text-sm text-stone-600">Profiles could not be loaded. Please try again.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-5 rounded-xl bg-[#0b132b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18264c]"
              >
                Retry
              </button>
            </div>
          ) : filteredAlumni.length ? (
            <motion.div
              layout
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {pageAlumni.map((alumnus, index) => {
                const name = getAlumniName(alumnus) || 'Alumni';
                const initials = name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part.charAt(0))
                  .join('')
                  .toUpperCase();
                const profileLink = `/alumni/${alumnus.user?.username || alumnus.id}`;
                const schoolName = schools[alumnus.school] || alumnus.school;

                return (
                  <motion.article
                    key={alumnus.id}
                    layout
                    variants={cardMotion}
                    initial={reduceMotion ? false : 'hidden'}
                    animate="visible"
                    custom={index}
                    className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
                  >
                    <div className="flex h-12 items-center justify-between gap-2 border-b border-stone-100 bg-stone-50 px-4">
                      <span className="truncate text-[10px] font-bold uppercase tracking-wider text-stone-600" title={schoolName}>
                        <GraduationCap size={13} className="mr-1.5 inline text-amber-700" />
                        {schoolName}
                      </span>
                      <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-900">
                        {alumnus.batchYear}
                      </span>
                    </div>
                    <a
                      href={profileLink}
                      aria-label={`View ${name}'s alumni profile`}
                      className="relative block aspect-[4/3] overflow-hidden bg-stone-200 no-underline"
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0b132b] to-[#1c3158] font-serif text-5xl font-bold text-amber-200/80">
                        {initials || <UserRound size={44} strokeWidth={1.2} />}
                      </div>
                      {alumnus.photoUrl && (
                        <>
                          <img
                            src={alumnus.photoUrl}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            decoding="async"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                          />
                          <img
                            src={alumnus.photoUrl}
                            alt={name}
                            loading="lazy"
                            decoding="async"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                            className="absolute inset-0 z-10 h-full w-full object-contain"
                          />
                        </>
                      )}
                      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-2 p-3">
                        <span className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                          Class of {alumnus.batchYear}
                        </span>
                        {(alumnus.verificationLevel === 'VERIFIED' || alumnus.verificationLevel === 'TRUSTED') && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md">
                            <ShieldCheck size={12} />
                            {alumnus.verificationLevel === 'TRUSTED' ? 'Trusted' : 'Verified'}
                          </span>
                        )}
                      </div>
                    </a>
                    <div className="flex min-h-36 flex-col p-4">
                      <h3 className="truncate font-serif text-lg font-bold text-stone-900 transition-colors group-hover:text-amber-900" title={name}>
                        {name}
                      </h3>
                      <div className="mt-2 space-y-2">
                        {alumnus.occupation && (
                          <p className="flex items-start gap-2 text-xs leading-relaxed text-stone-700">
                            <BriefcaseBusiness size={14} className="mt-0.5 shrink-0 text-amber-700" />
                            <span className="line-clamp-2">{alumnus.occupation}</span>
                          </p>
                        )}
                        {alumnus.city && (
                          <p className="flex items-center gap-2 text-xs text-stone-500">
                            <MapPin size={14} className="shrink-0 text-stone-400" />
                            <span className="truncate">{alumnus.city}</span>
                          </p>
                        )}
                      </div>
                      <a
                        href={profileLink}
                        className="mt-auto flex items-center justify-between border-t border-stone-100 pt-3 text-xs font-bold text-stone-700 no-underline transition-colors hover:text-amber-900"
                      >
                        View profile
                        <ArrowUpRight size={15} className="text-amber-700 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-50 text-stone-400">
                <UserRound size={25} />
              </div>
              <h2 className="mt-4 font-serif text-xl font-bold text-stone-900">
                {alumni.length ? 'No profiles match these filters' : 'No verified alumni profiles yet'}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
                {alumni.length
                  ? 'Try another name, institution, or class year.'
                  : 'Verified alumni profiles will appear here once they have been reviewed.'}
              </p>
            </div>
          )}
          {!isLoading && !isError && totalPages > 1 && (
            <nav
              aria-label="Alumni directory pages"
              className="flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-6 sm:flex-row"
            >
              <p className="text-xs text-stone-500">
                Page <strong className="text-stone-900">{currentPage}</strong> of{' '}
                <strong className="text-stone-900">{totalPages}</strong>
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, index, visiblePages) => (
                    <React.Fragment key={page}>
                      {index > 0 && visiblePages[index - 1] !== page - 1 && (
                        <span className="px-1 text-xs text-stone-400" aria-hidden="true">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => changePage(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                        aria-label={`Page ${page}`}
                        className={`h-9 min-w-9 rounded-xl px-2 text-xs font-bold transition ${
                          currentPage === page
                            ? 'bg-[#0b132b] text-white'
                            : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  type="button"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};
