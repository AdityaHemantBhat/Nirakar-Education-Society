import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Eye } from 'lucide-react';
import {
  LIBRARY_CATEGORY_LABELS,
  LibraryStandard,
  LibraryVolumeCard as LibraryVolume,
} from '../lib/library.js';

interface Props {
  volume: LibraryVolume;
  standardLabel: string;
}

/**
 * A volume as a card.
 *
 * The cover is the card's face — a book standing up, with the spine down
 * one edge — and the details sit underneath it. The card is deliberately
 * plain: the cover does the work, and the text is only there to say what
 * the book is and how long it takes to read.
 */
export const LibraryVolumeCard: React.FC<Props> = ({ volume, standardLabel }) => {
  const hasCover = Boolean(volume.coverUrl);

  return (
    <Link
      to={`/library/${volume.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200/80 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_12px_28px_-16px_rgba(28,25,23,0.35)]"
    >
      {/* ------------------------------- The cover ------------------------------- */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
        {hasCover ? (
          <img
            src={volume.coverUrl!}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-400">
            <FileText size={26} />
            <span className="font-mono text-[9px] uppercase tracking-[0.16em]">No Cover</span>
          </div>
        )}

        {/* The spine, down the bound edge. */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[7px]"
          style={{
            background:
              'linear-gradient(to right, rgba(0,0,0,0.46), rgba(0,0,0,0.14) 45%, rgba(255,255,255,0.18))',
          }}
        />

        {/* A soft wash at the foot, so the badge stays legible. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
          style={{ background: 'linear-gradient(to top, rgba(11,19,43,0.55), transparent)' }}
        />

        {/* The standard, on the cover. */}
        <span className="absolute bottom-2.5 left-3 rounded-[3px] bg-white/95 px-1.5 py-[3px] font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[#111b5e] shadow-sm">
          {standardLabel}
        </span>

        {/* The material type, on the cover. */}
        <span className="absolute bottom-2.5 right-3 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-white/85">
          {LIBRARY_CATEGORY_LABELS[volume.category]}
        </span>
      </div>

      {/* ------------------------------- The details ------------------------------ */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-[15px] font-bold leading-snug text-stone-900 transition-colors group-hover:text-[#111b5e]">
          {volume.title}
        </h3>

        <p className="mt-1 truncate text-[11.5px] text-stone-500">
          {volume.author || 'Shree Nirakar Education Society'}
          {volume.academicYear ? ` · ${volume.academicYear}` : ''}
        </p>

        {volume.excerpt && (
          <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-stone-500">
            {volume.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3.5 pt-3 font-mono text-[10.5px] text-stone-400">
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
            {volume.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default LibraryVolumeCard;
