import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  GraduationCap,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAdmissionsSocket } from '../hooks/useAdmissionsSocket.js';

gsap.registerPlugin(ScrollTrigger);

interface CampusSlide {
  id: string;
  title: string;
  campus: string;
  tag: string;
  image: string;
}

const CAMPUS_SLIDES: CampusSlide[] = [];

export const Hero: React.FC = () => {
  const heroRootRef = useRef<HTMLElement>(null);
  const orbRef1 = useRef<HTMLDivElement>(null);
  const orbRef2 = useRef<HTMLDivElement>(null);

  const marathiRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const flourishPathRef = useRef<SVGPathElement>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);

  const DEFAULT_ADMISSIONS_CONFIG = {
    isOpen: true,
    academicYear: '2026–27',
  };

  // Admissions Configuration (Socket.IO synchronised with real-time updates)
  useAdmissionsSocket();

  const { data: admissionsConfig } = useQuery({
    queryKey: ['admissions_config'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/admissions/config');
        if (!res.ok) return DEFAULT_ADMISSIONS_CONFIG;
        const json = await res.json();
        return json.data || DEFAULT_ADMISSIONS_CONFIG;
      } catch {
        return DEFAULT_ADMISSIONS_CONFIG;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const academicYear = admissionsConfig?.academicYear || '2026–27';
  const isAdmissionsOpen = admissionsConfig ? admissionsConfig.isOpen === true : true;

  const { data: heroSlidesData = [] } = useQuery<CampusSlide[]>({
    queryKey: ['hero_slides'],
    queryFn: async () => {
      const res = await fetch('/api/v1/content/hero-slides');
      if (!res.ok) throw new Error('Could not load homepage feature cards');
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const activeSlides = heroSlidesData.filter((slide) => slide.image?.trim());
  const mobileHeroSliderRef = useRef<HTMLDivElement>(null);
  const [mobileHeroIndex, setMobileHeroIndex] = useState(0);

  const handleMobileHeroScroll = () => {
    if (mobileHeroSliderRef.current) {
      const { scrollLeft, clientWidth } = mobileHeroSliderRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setMobileHeroIndex(index);
    }
  };

  const handleScrollHeroMobile = (direction: 'prev' | 'next') => {
    if (mobileHeroSliderRef.current) {
      const { clientWidth } = mobileHeroSliderRef.current;
      const targetIndex = direction === 'next'
        ? Math.min(mobileHeroIndex + 1, activeSlides.length - 1)
        : Math.max(mobileHeroIndex - 1, 0);

      mobileHeroSliderRef.current.scrollTo({
        left: targetIndex * clientWidth,
        behavior: 'smooth',
      });
      setMobileHeroIndex(targetIndex);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Animate SVG wave flourish smoothly
      if (flourishPathRef.current) {
        const length = flourishPathRef.current.getTotalLength();
        gsap.set(flourishPathRef.current, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(flourishPathRef.current, {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: 'power2.out',
          delay: 0.2,
        });
      }
    }, heroRootRef);

    return () => ctx.revert();
  }, []);

  // Smooth mouse parallax on ambient light orbs
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;

    if (orbRef1.current) {
      gsap.to(orbRef1.current, {
        x: x * 35,
        y: y * 25,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
    if (orbRef2.current) {
      gsap.to(orbRef2.current, {
        x: -x * 40,
        y: -y * 30,
        duration: 1.4,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  const handleMouseLeave = () => {
    if (orbRef1.current) gsap.to(orbRef1.current, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
    if (orbRef2.current) gsap.to(orbRef2.current, { x: 0, y: 0, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
  };

  return (
    <section
      ref={heroRootRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full pt-6 sm:pt-10 pb-12 lg:pb-16 bg-[#FAF7F2] text-ink overflow-hidden"
    >
      {/* Background Flowing Topographic SVG Curves (Organic Canacona River & Hills) */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-40 -z-10 overflow-hidden">
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          <path
            d="M -100 220 C 300 100, 600 400, 1000 180 C 1250 60, 1450 300, 1600 220"
            stroke="rgba(17, 27, 94, 0.06)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M -80 300 C 320 160, 620 470, 1020 250 C 1270 120, 1470 360, 1620 280"
            stroke="rgba(217, 119, 6, 0.07)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M -50 380 C 350 230, 650 540, 1050 320 C 1300 180, 1500 420, 1650 340"
            stroke="rgba(17, 27, 94, 0.04)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* Ambient Fluid Glow Orbs */}
      <div
        ref={orbRef1}
        className="absolute top-10 left-1/4 w-[560px] h-[560px] bg-gradient-to-tr from-[#111b5e]/8 via-brand-500/4 to-transparent rounded-full blur-3xl pointer-events-none"
      />
      <div
        ref={orbRef2}
        className="absolute top-1/4 right-1/4 w-[580px] h-[580px] bg-gradient-to-bl from-accent-400/15 via-amber-200/8 to-transparent rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 text-center pt-2 sm:pt-4 pb-6">

        {/* 1. CRAFTED HERITAGE BADGE (Academic & Authentic • No Awkward Wrapping) */}
        <div className="inline-flex max-w-full items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 rounded-full bg-white/95 border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-xs mb-5 sm:mb-6">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-amber-600 ring-4 ring-amber-500/20" />
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-stone-700 uppercase whitespace-nowrap">
            Est. 1939 <span className="hidden xs:inline">• Canacona, Goa</span>
          </span>
          <span className="text-stone-300 select-none shrink-0">|</span>
          <span className="text-[11px] sm:text-xs font-sans font-medium text-stone-600 whitespace-nowrap">
            Govt. Recognized
          </span>
        </div>

        {/* 2. THE GRAND BILINGUAL HEADLINE */}
        <div className="relative max-w-6xl mx-auto space-y-3 sm:space-y-4 mb-6 sm:mb-8 pt-1">

          {/* Marathi Motto Inscription - Prestigious Editorial Style */}
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <span className="hidden sm:inline-block h-[1.5px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#111b5e]/50" />
            <span
              ref={marathiRef}
              className="block font-marathi font-black text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] text-[#111b5e] tracking-tight leading-none"
            >
              निराकारातून आकाराकडे
            </span>
            <span className="hidden sm:inline-block h-[1.5px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#111b5e]/50" />
          </div>

          {/* English Grand Headline with Pure Typography Craftsmanship & Transparent Boundless */}
          <h1
            ref={headlineRef}
            className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-[4.4rem] xl:text-[5.2rem] font-black text-[#0b132b] tracking-[-0.035em] leading-[1.06] sm:leading-[1.02]"
          >
            <span className="block text-[#0b132b]">
              Where Village Roots
            </span>
            <span className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1 mt-1 sm:mt-2">
              <span className="text-[#111b5e] font-serif italic font-normal tracking-normal text-[0.88em]">
                meet
              </span>
              {/* Boundless: Transparent outlined stroke without color inside & matching mobile/desktop typography */}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent [-webkit-text-stroke:1.8px_#111b5e] sm:[-webkit-text-stroke:2.8px_#111b5e] tracking-normal font-black uppercase select-none">
                  Boundless
                </span>
                <svg
                  viewBox="0 0 260 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute -bottom-1.5 sm:-bottom-2.5 left-0 w-full h-2.5 sm:h-3.5 pointer-events-none overflow-visible select-none"
                  preserveAspectRatio="none"
                >
                  <path
                    ref={flourishPathRef}
                    d="M 4 10 C 65 18, 195 18, 256 8"
                    stroke="#d97706"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 22 15 C 80 20, 180 20, 238 13"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </span>
              <span className="text-amber-700">
                Intellect.
              </span>
            </span>
          </h1>
        </div>

        {/* 3. NARRATIVE PROSE & TACTILE CTAS */}
        <div ref={narrativeRef} className="max-w-2xl mx-auto space-y-4 mb-6 sm:mb-10">
          <p className="font-sans text-sm sm:text-base md:text-lg text-stone-700 leading-relaxed font-normal">
            Rooted in Canacona since 1939, Shri Nirakar Education Society has nurtured generations of scholars through academic excellence, moral leadership, and inclusive rural empowerment. Today, the Society delivers premier secondary and higher secondary schooling to over 1,450 scholars across three campuses.
          </p>

          {/* High-Contrast Tactile Interaction Cluster */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 pt-3 pb-2">
            {/* Primary Action Button */}
            <a
              href="#campuses"
              className="inline-flex items-center justify-center gap-3 bg-[#0b132b] hover:bg-[#111b5e] text-white font-mono text-xs sm:text-sm font-semibold uppercase tracking-wider px-7 py-3.5 rounded-full shadow-[0_4px_14px_rgba(11,19,43,0.3)] hover:shadow-[0_6px_20px_rgba(17,27,94,0.4)] transition-all duration-300 cursor-pointer w-full sm:w-auto"
            >
              <span>Explore 3 Campuses</span>
              <span className="w-5 h-5 rounded-full bg-amber-500 text-[#0b132b] flex items-center justify-center font-black text-xs">
                ↓
              </span>
            </a>

            {/* Dynamic Admissions CTA Link */}
            {isAdmissionsOpen && (
              <a
                href="/admissions"
                className="inline-flex items-center justify-center gap-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-stone-400 font-mono text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full shadow-xs transition-all cursor-pointer w-full sm:w-auto"
                title={`Open Online Admissions Portal for Academic Session ${academicYear}`}
              >
                <GraduationCap size={16} className="text-amber-600" />
                <span>Admissions {academicYear}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-semibold">Open</span>
              </a>
            )}

            {/* Society Heritage Link */}
            <a
              href="/society"
              className="inline-flex items-center justify-center gap-1.5 text-stone-700 hover:text-[#111b5e] font-mono text-xs sm:text-sm font-semibold px-4 py-2.5 sm:py-3 transition-colors uppercase tracking-wider group"
            >
              <span>Society Heritage</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 text-amber-600 transition-transform" />
            </a>
          </div>

          {/* Institutional Trust Badges (Single unified line on desktop, clean responsive flow) */}
          <div className="w-full pt-3 border-t border-stone-200/80">
            <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-x-4 sm:gap-x-5 md:gap-x-6 gap-y-2 text-[11px] sm:text-xs font-mono text-stone-600">
              <span className="inline-flex items-center gap-1.5 font-medium shrink-0 whitespace-nowrap">
                <span className="text-amber-600 font-bold">1939</span> First Agrashala
              </span>
              <span className="text-stone-300 hidden sm:inline select-none shrink-0">•</span>
              <span className="inline-flex items-center gap-1.5 font-medium shrink-0 whitespace-nowrap">
                <span className="text-[#111b5e] font-bold">1,450+</span> Enrolled Scholars
              </span>
              <span className="text-stone-300 hidden sm:inline select-none shrink-0">•</span>
              <span className="inline-flex items-center gap-1.5 font-medium shrink-0 whitespace-nowrap">
                <span className="text-[#111b5e] font-bold">100%</span> Board Pass Legacy
              </span>
              <span className="text-stone-300 hidden sm:inline select-none shrink-0">•</span>
              <span className="inline-flex items-center gap-1.5 font-medium shrink-0 whitespace-nowrap">
                <span className="text-amber-600 font-bold">Goa Board</span> Recognized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION */}
      {activeSlides.length > 0 && (
        <div className="w-full mt-4 sm:mt-8 lg:mt-10">
          {/* MOBILE ONLY (<sm): ONE-BY-ONE CARD CAROUSEL */}
          <div className="sm:hidden px-4 select-none">
            {/* Slider Viewport (Snap to 100% width card) */}
            <div
              ref={mobileHeroSliderRef}
              onScroll={handleMobileHeroScroll}
              className="flex items-center gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none py-2"
            >
              {activeSlides.map((slide, idx) => (
                <div
                  key={`mobile-${slide.id}-${idx}`}
                  className="w-full shrink-0 snap-center relative rounded-2xl overflow-hidden shadow-lg border border-stone-200/90 bg-stone-100 h-[210px]"
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  {/* Cinematic gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a103c]/90 via-[#0a103c]/30 to-transparent pointer-events-none" />

                  {/* Top Tag */}
                  <div className="absolute top-3 left-3.5 z-10">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-300 bg-[#111b5e]/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 shadow-xs">
                      {slide.tag}
                    </span>
                  </div>

                  {/* Bottom Details */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 z-10 text-white space-y-0.5">
                    <div className="text-[11px] text-stone-300 font-sans flex items-center gap-1">
                      <MapPin size={11} className="text-accent-400" />
                      <span>{slide.campus}</span>
                    </div>
                    <h3 className="font-display text-sm font-bold text-white leading-snug drop-shadow-sm line-clamp-1">
                      {slide.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Controls & Indicator */}
            {activeSlides.length > 1 && (
              <div className="flex items-center justify-between pt-2.5 px-1 text-xs font-mono text-stone-500">
                <span className="text-[11px] bg-stone-100 px-2.5 py-0.5 rounded-full font-bold text-[#0b132b] border border-stone-200">
                  {mobileHeroIndex + 1} / {activeSlides.length}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleScrollHeroMobile('prev')}
                    disabled={mobileHeroIndex === 0}
                    className={`p-1.5 rounded-xl border border-stone-200 transition-all ${mobileHeroIndex === 0
                      ? 'opacity-40 cursor-not-allowed bg-stone-50 text-stone-400'
                      : 'bg-white hover:bg-stone-100 text-[#0b132b] shadow-xs active:scale-95'
                      }`}
                    aria-label="Previous campus slide"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollHeroMobile('next')}
                    disabled={mobileHeroIndex >= activeSlides.length - 1}
                    className={`p-1.5 rounded-xl border border-stone-200 transition-all ${mobileHeroIndex >= activeSlides.length - 1
                      ? 'opacity-40 cursor-not-allowed bg-stone-50 text-stone-400'
                      : 'bg-white hover:bg-stone-100 text-[#0b132b] shadow-xs active:scale-95'
                      }`}
                    aria-label="Next campus slide"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DESKTOP & TABLET (sm:block): CONTINUOUS MARQUEE (UNTOUCHED) */}
          <div className={`hidden sm:block relative w-full overflow-hidden group select-none py-2 ${activeSlides.length < 4 ? 'campus-marquee-static' : ''}`}>
            {/* Foggy Vignette Left Edge */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-44 z-20 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent" />

            {/* Foggy Vignette Right Edge */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-44 z-20 bg-gradient-to-l from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent" />

            {/* Continuous Glider Track (GPU Composited • 0ms loop jump • Pauses on hover) */}
            <div className="campus-marquee-track flex items-center gap-4 sm:gap-6 py-2 sm:py-3">
              {(activeSlides.length < 4
                ? activeSlides
                : [...activeSlides, ...activeSlides, ...activeSlides]
              ).map((slide, idx) => (
                <div
                  key={`${slide.id}-${idx}`}
                  className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-stone-200/90 group/card shrink-0 bg-stone-100 w-[320px] md:w-[380px] lg:w-[420px] h-[240px] md:h-[280px] lg:h-[320px] transform-gpu hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer"
                >
                  {/* Photo with smooth scale and network error fallback */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-700 ease-out"
                    loading={idx < 6 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Multi-stop cinematic shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a103c]/90 via-[#0a103c]/30 to-transparent pointer-events-none" />

                  {/* Top Tag */}
                  <div className="absolute top-3.5 left-4 z-10">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-300 bg-[#111b5e]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xs">
                      {slide.tag}
                    </span>
                  </div>

                  {/* Bottom Details */}
                  <div className="absolute bottom-3.5 left-4 right-4 z-10 text-white space-y-0.5">
                    <div className="text-[11px] text-stone-300 font-sans flex items-center gap-1">
                      <MapPin size={11} className="text-accent-400" />
                      <span>{slide.campus}</span>
                    </div>
                    <h3 className="font-display text-sm sm:text-base font-bold text-white leading-snug drop-shadow-sm">
                      {slide.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
