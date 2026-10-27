import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  Clock,
  Eye,
  User,
  Library,
  BookMarked,
  CalendarDays,
  Star,
  Layers,
  Quote,
} from 'lucide-react';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { LibraryFlipbook } from '../components/LibraryFlipbook.js';
import { LibraryRating } from '../components/LibraryRating.js';
import { useCurrentAuthUser } from '../hooks/useCurrentAuthUser.js';
import { useLibraryReviewSocket } from '../hooks/useLibraryReviewSocket.js';
import {
  INSTITUTION_LABELS,
  LIBRARY_CATEGORY_LABELS,
  LibraryVolumeDetail,
  LibraryRatingSummary,
} from '../lib/library.js';

const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 14 }) => (
  <span className="inline-flex items-center gap-0.5" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        strokeWidth={1.5}
        className={i <= Math.round(value) ? 'fill-accent-400 text-accent-400' : 'text-white/25'}
      />
    ))}
  </span>
);

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

export const LibraryReaderPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const authUser = useCurrentAuthUser();

  const { data: volume, isLoading, isError } = useQuery<LibraryVolumeDetail>({
    queryKey: ['library_volume', slug],
    queryFn: async () => {
      const response = await fetch(`/api/v1/library/volume/${encodeURIComponent(slug ?? '')}`);
      if (!response.ok) throw new Error('This volume could not be opened.');
      const json = await response.json();
      if (!json.success) throw new Error('This volume could not be opened.');
      return json.data as LibraryVolumeDetail;
    },
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
  });

  useLibraryReviewSocket(volume?.id);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#FAF7F2] text-[#0f172a] flex flex-col font-sans">
        <Navbar />
        <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#111b5e] border-t-transparent" />
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Opening the volume
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !volume) {
    return (
      <div className="w-full min-h-screen bg-[#FAF7F2] text-[#0f172a] flex flex-col font-sans">
        <Navbar />
        <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <FileText size={30} className="text-stone-300" />
          <h1 className="font-serif text-2xl font-bold text-stone-800">Volume not found</h1>
          <p className="max-w-sm text-sm text-stone-500">
            This volume may have been withdrawn from the library, or the link is incorrect.
          </p>
          <Link
            to="/library"
            className="inline-flex items-center gap-2 rounded-xl bg-[#111b5e] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#0b132b]"
          >
            <ArrowLeft size={14} />
            Back to the library
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const rating = volume.rating ?? { average: null, count: 0, breakdown: [] };
  const published = formatDate(volume.publishedAt);

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#0f172a] flex flex-col font-sans">
      <Helmet>
        <title>{volume.title} · Digital Library</title>
        <meta name="description" content={volume.excerpt || volume.description || undefined} />
      </Helmet>

      <Navbar />

      {/* ================================================================== */}
      {/* The masthead of the volume                                           */}
      {/* ================================================================== */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-24 pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        <HeroWaves opacity={0.85} />

        {/* Back to shelves on the left */}
        <Link
          to="/library"
          data-hero-left
          className="flex w-fit items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-stone-300 transition hover:text-amber-300 mb-6"
        >
          <ArrowLeft size={12} />
          Back to the shelves
        </Link>

        {/* Everything else centered */}
        <div className="w-full relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-serif text-xs font-bold uppercase tracking-widest text-amber-300">
              <BookMarked size={13} />
              <span>
                Std {volume.standard} · {LIBRARY_CATEGORY_LABELS[volume.category]}
              </span>
            </span>
            {volume.academicYear && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-stone-300">
                {volume.academicYear}
              </span>
            )}
            {volume.institutionCode && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-stone-300">
                {INSTITUTION_LABELS[volume.institutionCode]}
              </span>
            )}
          </div>

          <h1 className="mt-4 font-serif text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            {volume.title}
          </h1>

          {volume.description && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-300 sm:text-base">
              {volume.description}
            </p>
          )}

          {/* The facts, centered */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-[11px] text-stone-300">
            {volume.author && (
              <span className="inline-flex items-center gap-1.5">
                <User size={12} />
                {volume.author}
              </span>
            )}
            {volume.publisher && (
              <span className="inline-flex items-center gap-1.5">
                <Library size={12} />
                {volume.publisher}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <FileText size={12} />
              {volume.pageCount} pages
            </span>
            {volume.isSampled && volume.sourcePageCount ? (
              <span className="inline-flex items-center gap-1.5">
                <Layers size={12} />
                from {volume.sourcePageCount} pages
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} />
              {volume.readingMinutes} min read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye size={12} />
              {volume.viewCount} reads
            </span>
            {published && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={12} />
                Published {published}
              </span>
            )}
            {rating.average !== null && (
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold">
                <Stars value={rating.average} />
                {rating.average.toFixed(1)} · {rating.count} {rating.count === 1 ? 'REVIEW' : 'REVIEWS'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main flipbook content */}
      <div className="flex-1 w-full mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <LibraryFlipbook
          title={volume.title}
          pages={volume.pages}
          homeHref="/library"
          homeLabel="Back to shelves"
        />

        <div className="mt-16">
          <LibraryRating
            volumeId={volume.id}
            rating={volume.rating || { average: null, count: 0, breakdown: [] }}
            reviews={volume.reviews || []}
            readerName={authUser?.username}
            isSignedIn={Boolean(authUser)}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LibraryReaderPage;
