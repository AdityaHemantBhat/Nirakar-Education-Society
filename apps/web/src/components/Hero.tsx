import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  GraduationCap,
  MapPin
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

const CAMPUS_SLIDES: CampusSlide[] = [
  {
    id: 'angle-hss',
    title: 'S.S. Angle Higher Secondary School',
    campus: 'Dapot, Mashem, Canacona',
    tag: 'Arts, Science & Commerce Streams',
    image: '/images/S.S.Angle_Higher_Secondary_School_Dapot.webp',
  },
  {
    id: 'science-lab',
    title: 'Modern Science & Wet Laboratories',
    campus: 'Mashem Science Block',
    tag: 'Physics, Chemistry & Biology Labs',
    image: '/images/science_lab.jpg',
  },
  {
    id: 'nirakar-hs',
    title: 'Shri Nirakar High School',
    campus: 'Mashem Campus • Estd. 1924',
    tag: 'Goa Board Secondary SSC Merit',
    image: '/images/Nirakar_Vidyalaya_Mashem.webp',
  },
  {
    id: 'tudal-hs',
    title: 'Tudal High School (Sahyadri Foothills)',
    campus: 'Gaondongrem • Forest Outreach',
    tag: 'Community Education & SSC Merit',
    image: '/images/Tudal_High_School_Gaodongrem.webp',
  },
  {
    id: 'sports-field',
    title: 'Athletics & Championship Sports Ground',
    campus: 'Mashem Athletic Complex',
    tag: 'Inter-School Athletics & Football Champions',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cultural-arts',
    title: 'Goan Heritage & Folk Arts Traditions',
    campus: 'All 3 Canacona Campuses',
    tag: 'State Drama (Natak), Fugdi & Dhalo',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
  },
];

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

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-2 pb-6">

        {/* 1. THE GRAND BILINGUAL HEADLINE */}
        <div className="relative max-w-5xl mx-auto space-y-2 mb-6 pt-2">

          {/* Marathi Motto Inscription */}
          <span
            ref={marathiRef}
            className="block font-marathi font-black text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] text-[#111b5e] leading-tight tracking-normal"
          >
            निराकारातून आकाराकडे.
          </span>

          {/* English Grand Headline with Transparent Outlined Stroke Typography */}
          <h1
            ref={headlineRef}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.4rem] font-extrabold text-[#0b132b] tracking-[-0.035em] leading-[1.06] uppercase"
          >
            <span className="block text-[#0b132b]">
              Where Village Roots
            </span>
            <span className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 mt-1 sm:mt-2">
              <span className="text-[#111b5e]">Meet</span>
              {/* Transparent Outlined Stroke Typography with Attached Senior Calligraphic Underline */}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent [-webkit-text-stroke:2px_#111b5e] sm:[-webkit-text-stroke:2.75px_#111b5e] hover:[-webkit-text-stroke:2.75px_#d97706] transition-all duration-300">
                  Boundless
                </span>
                {/* Senior Typography Flourish: Custom Dual-Stroke Gold Calligraphy Underline */}
                <svg
                  viewBox="0 0 260 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute -bottom-2 sm:-bottom-2.5 left-0 w-full h-3 sm:h-3.5 pointer-events-none overflow-visible select-none"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="boundlessUnderlineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#111b5e" stopOpacity="0.2" />
                      <stop offset="15%" stopColor="#d97706" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                      <stop offset="85%" stopColor="#d97706" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#111b5e" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  {/* Primary energetic calligraphy arc */}
                  <path
                    ref={flourishPathRef}
                    d="M 4 10 C 65 18, 195 18, 256 8"
                    stroke="url(#boundlessUnderlineGrad)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  {/* Secondary delicate artisanal echo arc */}
                  <path
                    d="M 22 15 C 80 20, 180 20, 238 13"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                </svg>
              </span>
              <span className="bg-gradient-to-r from-[#111b5e] via-[#1d35d8] to-[#d97706] bg-clip-text text-transparent">
                Intellect.
              </span>
            </span>
          </h1>
        </div>

        {/* 3. NARRATIVE PROSE & TACTILE CTAS (100% English • Clean, Human, No Box Containers) */}
        <div ref={narrativeRef} className="max-w-2xl mx-auto space-y-4 mb-10">
          <p className="font-sans text-base sm:text-lg text-stone-700 leading-relaxed font-normal">
            Rooted in Canacona since 1939, Shree Nirakar Education Society has nurtured generations of scholars through academic excellence, moral leadership, and inclusive rural empowerment. Today, the Society delivers premier secondary and higher secondary schooling to over 1,450 scholars across three campuses.
          </p>
          <p className="mt-2 text-sm text-stone-600 italic">
            From foundational secondary classrooms to advanced senior secondary streams in Science, Commerce, and Arts, our multi-campus ecosystem sets enduring benchmarks across South Goa.
          </p>

          {/* High-Contrast Tactile Interaction Cluster */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 pb-2">
            {/* Primary Pill with smooth Left-to-Right color fill (No transform or scale) */}
            <a
              href="#campuses"
              className="group relative inline-flex items-center gap-3 bg-[#0b132b] text-white font-mono text-xs sm:text-sm font-semibold uppercase tracking-wider px-7 py-3.5 rounded-full shadow-lg hover:shadow-[0_8px_25px_-4px_rgba(37,70,235,0.45)] transition-shadow duration-500 overflow-hidden cursor-pointer"
            >
              {/* Vibrant & Clearly Visible Left-to-Right Color Fill Wipe */}
              <span className="absolute inset-0 bg-gradient-to-r from-[#0b132b]/15 via-[#0c182d]/15 to-[#0d1e35]/15 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out pointer-events-none rounded-full" />

              {/* Stationary Content (Zero Transform / Zero Scale) */}
              <span className="relative z-10">Explore 3 Campuses</span>
              <span className="relative z-10 w-6 h-6 rounded-full bg-accent-400 text-ink flex items-center justify-center font-bold text-xs shadow-xs">
                ↓
              </span>
            </a>

            {/* Dynamic Admissions CTA Link (Toggled via Admin and synced via Socket.IO) */}
            {isAdmissionsOpen && (
              <a
                href="/admissions"
                className="group inline-flex items-center gap-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-mono text-xs sm:text-sm font-semibold px-5 py-3.5 rounded-full shadow-xs hover:border-stone-400 transition-all cursor-pointer"
                title={`Open Online Admissions Portal for Academic Session ${academicYear}`}
              >
                <GraduationCap size={15} className="text-accent-600 group-hover:scale-110 transition-transform" />
                <span>Admissions {academicYear}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-semibold">Open</span>
              </a>
            )}

            {/* Society Heritage Link */}
            <a
              href="/society"
              className="inline-flex items-center gap-1.5 text-stone-700 hover:text-[#111b5e] font-mono text-xs sm:text-sm font-semibold px-4 py-3 transition-colors uppercase tracking-wider group"
            >
              <span>Society Heritage</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 text-accent-600 transition-transform" />
            </a>
          </div>

          {/* Historical Chronicle Milestones */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-2 text-xs font-mono text-stone-500">
            <span>1924: Early Society Origins</span>
            <span className="text-stone-300">•</span>
            <span>1939: Agrashala Classes</span>
            <span className="text-stone-300">•</span>
            <span>1962: 100% SSC First Batch</span>
            <span className="text-stone-300 hidden sm:inline">•</span>
            <span className="hidden sm:inline">1993: S.S. Angle HSS</span>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: Google Developer-Standard 60/120fps Hardware-Accelerated Marquee Carousel */}
      <div className="relative w-full mt-6 sm:mt-10 overflow-hidden group select-none py-2">

        {/* Foggy Vignette Left Edge */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-44 z-20 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent" />

        {/* Foggy Vignette Right Edge */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-44 z-20 bg-gradient-to-l from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent" />

        {/* Continuous Glider Track (GPU Composited • 0ms loop jump • Pauses on hover) */}
        <div className="campus-marquee-track flex items-center gap-5 sm:gap-6 py-3">
          {[...CAMPUS_SLIDES, ...CAMPUS_SLIDES].map((slide, idx) => (
            <div
              key={`${slide.id}-${idx}`}
              className="relative w-[300px] sm:w-[380px] h-[210px] sm:h-[250px] rounded-3xl overflow-hidden shadow-xl border border-stone-200/90 group/card shrink-0 bg-stone-100 transform-gpu hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer"
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
    </section>
  );
};
