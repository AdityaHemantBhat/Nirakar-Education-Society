import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { 
  BookOpen, 
  Calendar, 
  ArrowRight, 
  Play, 
  Pause, 
  ChevronRight,
  Feather,
  Sparkles,
  Volume2
} from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);
}

interface MagazineIssueData {
  id?: string;
  title?: string;
  publishDate?: string;
  coverUrl?: string;
  coverImage?: string;
  pageCount?: number;
  readingMinutes?: number;
  excerpt?: string;
  isLocked?: boolean;
  articles?: Array<{
    title: string;
    category?: string;
    pageNo?: number | string;
    snippet?: string;
  }>;
}

interface DailyMagazineSectionProps {
  issue?: MagazineIssueData | null;
}

// Subtle background morphing river contour
const WAVE_PATHS = {
  initial: 'M 0,30 C 340,75 660,10 980,55 C 1250,95 1370,25 1440,40 L 1440,100 L 0,100 Z',
  morphed: 'M 0,60 C 300,15 620,85 940,30 C 1210,75 1360,15 1440,50 L 1440,100 L 0,100 Z',
};

export const DailyMagazineSection: React.FC<DailyMagazineSectionProps> = ({ issue }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const wavePathRef = useRef<SVGPathElement>(null);
  const coverTiltRef = useRef<HTMLDivElement>(null);
  const contentFadeRef = useRef<HTMLDivElement>(null);

  // Audio reflection player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  // Dynamic formatting of date from admin or current date
  const formattedPublishDate = (() => {
    if (!issue?.publishDate) {
      return new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    const parsed = new Date(issue.publishDate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return issue.publishDate;
  })();

  const title = issue?.title || 'Daily Campus Edition';
  const pageCount = issue?.pageCount || 16;
  const readingMinutes = issue?.readingMinutes || 8;
  const excerpt =
    issue?.excerpt ||
    'Circulated daily across classrooms at the 8:00 AM morning assembly. Edited and published by our secondary students and faculty mentors—bringing assembly prayers, classroom breakthroughs, student literature, and official circulars directly into our classrooms.';
  
  const coverImage = issue?.coverUrl || issue?.coverImage || '/images/nirakar_daily_magazine_cover.jpg';
  const magazineUrl = `/magazine/${issue?.id || 'today'}`;

  // Dispatches come only from the currently published issue. Never show placeholder stories.
  const stories = (issue?.articles || []).map((article, idx) => ({
    category: article.category || 'Classroom News',
    title: article.title,
    pageNo: `Page ${String(article.pageNo || idx + 1).padStart(2, '0')}`,
    snippet: article.snippet || '',
    readingTime: '3 min read',
  }));

  // GSAP ScrollTrigger & SVG Morphing Orchestration
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Topographic River Contour Morphing with Scroll Scrub
      if (wavePathRef.current) {
        gsap.to(wavePathRef.current, {
          morphSVG: WAVE_PATHS.morphed,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }

      // 2. Dignified ScrollTrigger Entrance
      if (contentFadeRef.current) {
        gsap.from(contentFadeRef.current.children, {
          y: 28,
          opacity: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Subtle 3D Card Parallax on Mouse Hover
  const handleCoverMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!coverTiltRef.current) return;
    const rect = coverTiltRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(coverTiltRef.current, {
      rotateY: x * 6,
      rotateX: -y * 6,
      transformPerspective: 1200,
      ease: 'power2.out',
      duration: 0.4,
    });
  };

  const handleCoverMouseLeave = () => {
    if (!coverTiltRef.current) return;
    gsap.to(coverTiltRef.current, {
      rotateY: 0,
      rotateX: 0,
      ease: 'power2.out',
      duration: 0.6,
    });
  };

  return (
    <section
      ref={sectionRef}
      id="daily-magazine"
      className="relative w-full bg-[#FAF7F2] text-[#0b132b] py-14 sm:py-20 lg:py-28 overflow-hidden"
    >
      {/* Background Topographic Morphing Contour SVG */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-30 -z-10 overflow-hidden">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          <path
            ref={wavePathRef}
            d={WAVE_PATHS.initial}
            stroke="rgba(17, 27, 94, 0.08)"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      </div>

      {/* Full-Width Stretched Container across the viewport matching other homepage sections */}
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28">
        <div ref={contentFadeRef} className="space-y-8 sm:space-y-12 lg:space-y-16">

          {/* 1. TOP EDITORIAL WIRELINE (Clean, Minimalist Broadsheet Header) */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pb-2 sm:pb-3 text-[11px] sm:text-xs font-mono uppercase tracking-wider sm:tracking-widest text-stone-500">
              <div className="flex items-center gap-2 sm:gap-2.5 text-[#111b5e] font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-600 inline-block animate-pulse" />
                <span>Shri Nirakar Vidyalaya (High School) • Mashem, Canacona</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-stone-600">
                <span>Estd. 1968</span>
                <span className="text-stone-300">•</span>
                <span>Morning Circulation</span>
                <span className="text-stone-300">•</span>
                <span className="font-semibold text-stone-900">{formattedPublishDate}</span>
              </div>
            </div>

            {/* Main Headline & Narrative Lead */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-baseline">
              <div className="lg:col-span-7">
                <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black text-[#0b132b] tracking-tight leading-[1.12]">
                  Shri Nirakar Daily Magazine
                </h2>
              </div>
              <div className="lg:col-span-5">
                <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Printed and circulated daily exclusively within Shri Nirakar Vidyalaya. Written and edited by our students and teachers—capturing morning assembly prayers, classroom breakthroughs, and student literature.
                </p>
              </div>
            </div>
          </div>

          {/* 2. MAIN FULL-WIDTH SPREAD: 2-COLUMN BALANCED EDITORIAL DESK */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">

            {/* LEFT: MINIMAL PHYSICAL PUBLICATION CARD WITH 3D DEPTH */}
            <div className="lg:col-span-5 space-y-6">
              
              <div
                ref={coverTiltRef}
                onMouseMove={handleCoverMouseMove}
                onMouseLeave={handleCoverMouseLeave}
                onClick={() => window.location.href = magazineUrl}
                className="relative cursor-pointer select-none group"
              >
                {/* Physical Underlay Sheet for Paper Depth */}
                <div className="absolute inset-0 bg-[#e7e1d8] rounded-2xl rotate-1 translate-y-1.5 -translate-x-1 border border-stone-300/80 pointer-events-none transition-transform duration-300 group-hover:rotate-1.5" />

                {/* Primary Magazine Card */}
                <div className="relative bg-white rounded-2xl border border-stone-300 shadow-[0_12px_32px_-8px_rgba(11,19,43,0.12)] overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_20px_42px_-10px_rgba(11,19,43,0.2)]">
                  
                  {/* Left Spine Fold Gradient */}
                  <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-stone-400/25 via-transparent to-transparent z-20 pointer-events-none" />

                  {/* Magazine Cover Preview - Proportional, Compact & Not Elongated */}
                  <div className="relative w-full h-[240px] sm:h-[280px] lg:h-[310px] bg-stone-100/90 border-b border-stone-200 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
                    <img
                      src={coverImage}
                      alt={title}
                      className="w-full h-full object-contain rounded-md shadow-xs group-hover:scale-[1.01] transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.currentTarget.src = '/images/nirakar_vidyalaya_real.jpg';
                      }}
                    />

                    {/* Non-intrusive Top Status Pill */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-100/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-amber-300/80 shadow-xs">
                        {pageCount} Pages • {readingMinutes} Min Read
                      </span>
                    </div>
                  </div>

                  {/* Summary & Click Prompt - Tidy and Compact */}
                  <div className="p-4 sm:p-5 space-y-2.5 bg-white">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#0b132b] leading-snug line-clamp-1">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-sm font-sans text-stone-600 leading-relaxed line-clamp-2">
                      {excerpt}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-stone-100 text-xs font-mono">
                      <span className="text-stone-400">
                        Daily Classroom Edition
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-bold text-[#111b5e] group-hover:text-amber-700 transition-colors">
                        <span>Open Online Reader</span>
                        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Minimalist Action Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <a
                  href={magazineUrl}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#111b5e] hover:bg-[#070f38] text-white font-mono text-xs font-semibold uppercase tracking-wider py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                >
                  <BookOpen size={14} />
                  <span>Read Today's Daily Magazine</span>
                </a>

                <a
                  href="/magazine"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-mono text-xs font-semibold py-3 sm:py-3.5 px-4 rounded-xl transition-colors cursor-pointer text-center"
                  title="Browse past editions archive calendar"
                >
                  <Calendar size={14} className="text-[#111b5e]" />
                  <span>Archive Calendar</span>
                </a>
              </div>

            </div>

            {/* RIGHT: MINIMAL DISPATCH DESK & ASSEMBLY THOUGHT */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">

              {/* 1. Morning Assembly Reflection & Interactive Audio Dispatch */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider sm:tracking-widest uppercase text-amber-800">
                      Morning Assembly Reflection
                    </span>
                  </div>

                  {/* Audio Dispatch Simulated Player */}
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio((prev) => !prev)}
                    className="inline-flex items-center gap-2 text-xs font-mono font-semibold px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                    title="Simulate listening to morning assembly audio reflection"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause size={12} className="text-[#111b5e]" />
                        <span>Pause Reflection (1:30)</span>
                      </>
                    ) : (
                      <>
                        <Play size={12} className="text-[#111b5e] fill-[#111b5e]" />
                        <span>Listen to Assembly (1:30)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sanskrit Inscription & Headmaster Thought */}
                <div className="space-y-1.5 border-l-2 border-amber-600/70 pl-4 py-0.5">
                  <p className="font-serif italic text-sm sm:text-base text-stone-800 leading-relaxed">
                    “विद्या ददाति विनयं (Vidya Dadati Vinayam) — True knowledge bestows humility. In every classroom of Shri Nirakar Vidyalaya, scholarship begins with curiosity, discipline, and respect for our teachers and village heritage.”
                  </p>
                  <span className="text-xs font-sans text-stone-500 block">
                    — Headmaster Mrs. Urvee Phaldessai • Shri Nirakar Vidyalaya
                  </span>
                </div>

                {/* Morphing Soundwave Animation when Audio is Playing */}
                {isPlayingAudio && (
                  <div className="pt-1 flex items-center gap-3">
                    <div className="flex items-end gap-1 h-3.5">
                      {[14, 22, 10, 26, 18, 12, 24, 16, 20, 8].map((h, i) => (
                        <span
                          key={i}
                          className="w-1 bg-[#111b5e] rounded-full animate-pulse"
                          style={{
                            height: `${h}px`,
                            animationDelay: `${i * 0.08}s`,
                            animationDuration: '0.7s',
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-stone-500">
                      8:00 AM Morning Prayer Dispatch (Canacona Campus)
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Today's Dispatches (Clean, Minimalist Article List) */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <span className="font-serif text-sm font-bold text-[#0b132b] tracking-wide uppercase">
                    In Today's School Circulation
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    Circulated at 8:00 AM
                  </span>
                </div>

                {/* Article Dispatches */}
                <div className="divide-y divide-stone-100">
                  {stories.length === 0 ? (
                    <div className="px-2 py-8 text-center text-sm text-stone-500">
                      Today’s circulation is being prepared by the editorial board.
                    </div>
                  ) : stories.map((story, idx) => {
                    const isActive = idx === activeStoryIdx;
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setActiveStoryIdx(idx)}
                        onClick={() => {
                          setActiveStoryIdx(idx);
                          window.location.href = magazineUrl;
                        }}
                        className={`group py-3.5 transition-colors cursor-pointer rounded-lg px-2 -mx-2 ${
                          isActive ? 'bg-stone-50/80' : 'hover:bg-stone-50/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111b5e]">
                              {story.category}
                            </span>
                            <h4 className="font-serif text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#111b5e] transition-colors leading-snug">
                              {story.title}
                            </h4>
                            <p className="text-xs text-stone-600 font-sans line-clamp-1">
                              {story.snippet}
                            </p>
                          </div>

                          <span className="text-[11px] font-mono text-stone-400 group-hover:text-[#111b5e] whitespace-nowrap shrink-0 mt-1 transition-colors">
                            {story.pageNo} →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Bar */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                  <a
                    href="/magazine"
                    className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#111b5e] hover:text-[#0b132b] transition-colors"
                  >
                    <Calendar size={13} className="text-[#111b5e]" />
                    <span>Browse Publication Archives Calendar</span>
                    <ChevronRight size={13} />
                  </a>

                  <span className="text-[11px] font-mono text-stone-400">
                    Printed in School Lab
                  </span>
                </div>
              </div>

              {/* Colophon Note */}
              <div className="px-1 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-stone-500 gap-1.5 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Feather size={12} className="text-stone-400 shrink-0" />
                  <span>Student Editorial Board • Shri Nirakar High School</span>
                </div>
                <span className="self-start sm:self-auto text-stone-400">450 Copies Distributed Daily</span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
