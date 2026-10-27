import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BookOpen, CalendarDays, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { LibraryFlipbook } from '../components/LibraryFlipbook.js';
import { MagazineRating } from '../components/MagazineRating.js';
import { useCurrentAuthUser } from '../hooks/useCurrentAuthUser.js';
import { useMagazineReviewSocket } from '../hooks/useMagazineReviewSocket.js';

export const MagazineReaderPage: React.FC = () => {
  const { date, id } = useParams<{ date?: string; id?: string }>();
  const target = date || id || 'today';
  const authUser = useCurrentAuthUser();
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['magazine_issue', target],
    queryFn: async () => {
      const res = await fetch(`/api/v1/magazine/issue/${target}`);
      if (!res.ok) {
        throw new Error('Could not load requested publication issue');
      }
      const json = await res.json();
      return json.data;
    },
  });

  useMagazineReviewSocket(issue?.id);

  const pageShell = (content: React.ReactNode) => (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] text-[#0f172a]">
      <Navbar />
      {content}
      <Footer />
    </div>
  );

  const masthead = (title?: string, description?: string, metadata?: React.ReactNode) => (
    <>
      <header className="relative z-0 w-full overflow-hidden bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-24 pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <HeroWaves opacity={0.85} />
        <Link to="/magazine" className="absolute left-3 top-12 z-20 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-stone-300 transition hover:text-amber-300 sm:left-8 sm:top-16 lg:left-12 lg:top-24 xl:left-16 2xl:left-24">
            <ArrowLeft size={12} /> All editions
        </Link>
        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <p className="mt-5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300">Shri Nirakar Vidyalaya · School magazine</p>
          {title && <h1 className="mt-3 font-serif text-3xl font-black leading-tight tracking-tight sm:text-5xl">{title}</h1>}
          {description && <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-stone-300 sm:text-base">{description}</p>}
          {metadata && <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-stone-300">{metadata}</div>}
        </div>
      </header>
      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />
    </>
  );

  if (isLoading) {
    return pageShell(
      <>
        {masthead('Opening the magazine')}
        <main className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#111b5e] border-t-transparent" />
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Preparing this edition</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !issue) {
    return pageShell(
      <>
        {masthead('Edition unavailable')}
        <main className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
            <BookOpen size={30} className="text-stone-300" />
            <h1 className="font-serif text-3xl font-bold text-stone-900">This edition could not be found</h1>
            <p className="max-w-md text-sm leading-relaxed text-stone-600">No published issue matches “{target}”. Browse the archive to choose another edition.</p>
            <Link to="/magazine" className="mt-2 inline-flex items-center gap-2 border-b border-amber-700 pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#111b5e]"><ArrowLeft size={13} /> Back to the archive</Link>
          </div>
        </main>
      </>
    );
  }

  const formattedDate = new Date(`${issue.publishDate}T12:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] text-[#0f172a]">
      <Helmet>
        <title>{`${issue.title} (${issue.publishDate}) | Shri Nirakar Daily Magazine`}</title>
        <meta name="description" content={issue.excerpt || `Read the complete issue of Shri Nirakar Daily Magazine published on ${issue.publishDate}.`} />
      </Helmet>
      <Navbar />
      {masthead(
        issue.title,
        issue.excerpt || undefined,
        <>
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={12} className="text-amber-300" />{formattedDate}</span>
            <span className="inline-flex items-center gap-1.5"><BookOpen size={12} className="text-amber-300" />{issue.pageCount || issue.pages?.length || 0} pages</span>
            {issue.readingMinutes ? <span className="inline-flex items-center gap-1.5"><Clock3 size={12} className="text-amber-300" />{issue.readingMinutes} min</span> : null}
          </>,
        )}
        <main className="flex-1">
          <section className="w-full flex-1 px-4 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
          {issue.pages?.length ? (
            <div className="h-[min(86vh,920px)] min-h-[520px] w-full overflow-hidden rounded-2xl border border-stone-200/90 shadow-sm">
              <LibraryFlipbook key={issue.id || issue.publishDate} title={`${issue.title} (${issue.publishDate})`} pages={issue.pages} articles={issue.articles || []} homeHref="/magazine" homeLabel="All Issues" />
            </div>
          ) : (
            <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 border border-stone-300 bg-white px-6 text-center">
              <BookOpen size={28} className="text-stone-300" />
              <h2 className="font-serif text-2xl font-bold text-stone-800">This issue has no readable pages yet</h2>
              <p className="max-w-md text-sm leading-relaxed text-stone-500">The archive entry exists, but page images are not available. Please return to the archive and try another edition.</p>
              <Link to="/magazine" className="mt-2 border-b border-amber-700 pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#111b5e]">Back to all editions</Link>
            </div>
          )}
        </section>
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-8 lg:px-12">
          <MagazineRating
            key={issue.id}
            issueId={issue.id}
            rating={issue.rating || { average: null, count: 0, breakdown: [] }}
            reviews={issue.reviews || []}
            readerName={authUser?.alumniProfile ? `${authUser.alumniProfile.firstName || ''} ${authUser.alumniProfile.lastName || ''}`.trim() : authUser?.facultyProfile ? (() => { const toggles = authUser.facultyProfile?.publicContactToggles as { name?: string; fullName?: string } | null; return toggles?.name || toggles?.fullName || 'your profile name'; })() : undefined}
            isSignedIn={Boolean(authUser)}
          />
          <p className="mt-10 border-t border-stone-300 pt-4 text-center font-serif text-sm italic text-stone-500">A school publication, kept in the Society archive for every reader.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};
