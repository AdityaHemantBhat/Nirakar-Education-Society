import React from 'react';
import { BookOpen, Calendar, Clock, ArrowRight } from 'lucide-react';

interface MagazineIssue {
  id: string;
  publishDate: string;
  title: string;
  coverUrl?: string | null;
  pageCount: number;
  readingMinutes: number;
  excerpt?: string | null;
}

interface DailyMagazineTeaserProps {
  issue?: MagazineIssue | null;
}

export const DailyMagazineTeaser: React.FC<DailyMagazineTeaserProps> = ({ issue }) => {
  return (
    <section className="relative bg-paper py-16 md:py-24 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-sm flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          {/* Issue Cover & Book Preview Left */}
          <div className="w-full sm:w-64 lg:w-72 shrink-0 flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] bg-stone-300 rounded-xl shadow-xl overflow-hidden border-2 border-[#111b5e]/20 group">
              {issue?.coverUrl ? (
                <img
                  src={issue.coverUrl}
                  alt={issue.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#07112c] text-white space-y-2">
                  <BookOpen size={40} className="text-amber-400" />
                  <span className="font-serif text-sm font-bold">Shree Nirakar Daily Magazine</span>
                  <span className="text-[10px] text-stone-300 uppercase tracking-widest">Canacona Edition</span>
                </div>
              )}

            </div>

            <span className="text-xs font-mono text-stone-500 mt-3">
              Published {issue?.publishDate || 'Daily'}
            </span>
          </div>

          {/* Issue Editorial Details Right */}
          <div className="flex-1 space-y-5 text-center lg:text-left">
            <div className="space-y-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-[#111b5e] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 inline-block">
                Daily Publications
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ink tracking-tight">
                {issue?.title || 'Daily Magazine: Campus Voices & Reflections'}
              </h2>
            </div>

            {/* Reading stats */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-mono text-stone-600">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#111b5e]" />
                <span>{issue?.publishDate || new Date().toISOString().split('T')[0]}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#111b5e]" />
                <span>{issue?.pageCount || 12} Pages</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#111b5e]" />
                <span>~{issue?.readingMinutes || 6} Min Read</span>
              </div>
            </div>

            {/* Excerpt */}
            <p className="text-sm sm:text-base text-stone-700 font-sans leading-relaxed max-w-2xl">
              {issue?.excerpt ||
                'Explore the latest daily edition of Shree Nirakar Daily Magazine featuring in-depth student essays, cultural festival dispatches, academic board reflections, and rural Goa developmental dialogue.'}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href={issue ? `/magazine/issue/${issue.publishDate}` : '/magazine'}
                className="px-6 py-3.5 rounded-xl bg-[#111b5e] hover:bg-[#0c1445] text-white font-serif text-sm font-bold shadow-md transition-all flex items-center gap-2 group"
              >
                <BookOpen size={16} />
                <span>Open Paper Reader</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="/magazine"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-ink font-serif text-sm font-semibold border border-stone-200 shadow-sm transition-all flex items-center gap-2"
              >
                <Calendar size={16} className="text-amber-500" />
                <span>Browse Calendar & Archive</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
