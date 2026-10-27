import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRight, 
  ShieldCheck, 
  Briefcase, 
  MapPin, 
  Award, 
  Quote, 
  Users, 
  X,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface AlumniProps {
  alumni?: any[];
  registeredCount?: number;
}

export interface AlumnusItem {
  id: string;
  username: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  school: string;
  batchYear: number;
  occupation: string;
  city: string;
  bio: string;
  photoUrl: string;
  accolade: string;
}

/**
 * Maps any institution identifier or enum to the FULL, dignified school name.
 * Prevents raw codes like 'Angle_HSS' or 'Nirakar_HS' from ever appearing on screen.
 */
export const getFullSchoolName = (schoolCode: string = '') => {
  const clean = (schoolCode || '').toUpperCase().trim();

  if (clean.includes('TUDAL') || clean.includes('GAODONGREM') || clean.includes('GAONDONGREM')) {
    return {
      fullName: 'Tudal High School',
      campus: 'Gaondongrem, Canacona',
      shortCampus: 'Gaondongrem Campus',
      headerBg: 'from-[#022c22] via-[#064e3b] to-[#0b132b]',
      accentColor: '#10b981',
      badgeClass: 'bg-emerald-50/90 text-emerald-950 border-emerald-300/80',
      dotClass: 'bg-emerald-600',
    };
  }

  if (clean.includes('ANGLE') || clean.includes('HSS') || clean.includes('HIGHER')) {
    return {
      fullName: 'S. S. Angle Higher Secondary School',
      campus: 'Mashem, Canacona',
      shortCampus: 'Mashem Senior Campus',
      headerBg: 'from-[#451a03] via-[#78350f] to-[#0b132b]',
      accentColor: '#f59e0b',
      badgeClass: 'bg-amber-50/90 text-amber-950 border-amber-300/80',
      dotClass: 'bg-amber-600',
    };
  }

  // Default flagship institution
  return {
    fullName: 'Shri Nirakar High School',
    campus: 'Mashem, Canacona',
    shortCampus: 'Mashem Central Campus',
    headerBg: 'from-[#07112c] via-[#0b132b] to-[#111b5e]',
    accentColor: '#3b82f6',
    badgeClass: 'bg-blue-50/90 text-[#111b5e] border-blue-200/90',
    dotClass: 'bg-[#111b5e]',
  };
};

export const AlumniShowcase: React.FC<AlumniProps> = ({ alumni = [], registeredCount }) => {
  const [activeModalItem, setActiveModalItem] = useState<AlumnusItem | null>(null);

  // Fallback data in case the network request is loading or offline
  const fallbackAlumni: AlumnusItem[] = [
    {
      id: 'a1',
      username: 'adv_aditya_desai',
      fullName: 'Adv. Aditya Desai',
      school: 'NIRAKAR_HS',
      batchYear: 1994,
      occupation: 'Senior Advocate, High Court of Bombay at Goa',
      city: 'Panaji, Goa',
      bio: 'The ethical grounding, debate society, and oratorical discipline I received at Nirakar High School shaped my entire career in constitutional and public interest law.',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      accolade: 'High Court of Bombay at Goa • Bar Council Leader',
    },
    {
      id: 'a2',
      username: 'dr_suman_gaonkar',
      fullName: 'Dr. Suman Gaonkar',
      school: 'TUDAL_HS',
      batchYear: 2002,
      occupation: 'Chief Medical Officer, Directorate of Health Services',
      city: 'Margao, Goa',
      bio: 'Growing up in rural Gaondongrem, Tudal High School provided the vital academic foundation, science encouragement, and scholarships that enabled my medical journey.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      accolade: 'Directorate of Health Services, Goa • Public Health Pioneer',
    },
    {
      id: 'a3',
      username: 'neha_prabhu_irs',
      fullName: 'Neha Prabhu, IRS',
      school: 'ANGLE_HSS',
      batchYear: 2011,
      occupation: 'Assistant Commissioner, Indian Revenue Service',
      city: 'New Delhi / Goa',
      bio: 'The rigorous academic standards, competitive mentorship, and guidance from S. S. Angle Higher Secondary laid the bedrock for clearing the UPSC Civil Services Examination.',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      accolade: 'UPSC Civil Services • Ministry of Finance, Govt of India',
    },
    {
      id: 'a4',
      username: 'rahul_mashemkar',
      fullName: 'Rahul Mashemkar',
      school: 'NIRAKAR_HS',
      batchYear: 2008,
      occupation: 'Principal Cloud Infrastructure Architect',
      city: 'Bengaluru, India',
      bio: 'From practical physics experiments in Mashem to engineering planetary-scale cloud systems, Nirakar teachers instilled a lifelong passion for technology and innovation.',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      accolade: 'Principal Enterprise Architect • Cloud & Distributed Systems',
    },
    {
      id: 'a5',
      username: 'prof_rajesh_desai',
      fullName: 'Prof. Rajesh Phal Dessai',
      school: 'NIRAKAR_HS',
      batchYear: 1989,
      occupation: 'Professor & Dean of Marine Sciences, Goa University',
      city: 'Taleigao Plateau, Goa',
      bio: 'My curiosity for oceanography began while observing the Talpona river estuary during school excursions. Nirakar faculty always encouraged scientific inquiry and research.',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      accolade: 'Dean, School of Earth & Ocean Sciences • National Scholar',
    },
    {
      id: 'a6',
      username: 'capt_vigneshwar_bhat',
      fullName: 'Capt. Vigneshwar Bhat',
      school: 'ANGLE_HSS',
      batchYear: 2005,
      occupation: 'Master Mariner & Port Operations Commander',
      city: 'Mormugao / Singapore',
      bio: 'Discipline, team leadership on the volleyball court, and focused study during Higher Secondary years at Maxem steered my maritime career across international oceans.',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      accolade: 'Master Mariner • Foreign Going Vessel Command',
    },
    {
      id: 'a7',
      username: 'pooja_gaonkar',
      fullName: 'Pooja Gaonkar',
      school: 'TUDAL_HS',
      batchYear: 2014,
      occupation: 'Forest Range Officer & Wildlife Biologist',
      city: 'Cotigao Sanctuary, Canacona',
      bio: 'Tudal High School taught us reverence for the Western Ghats and native biodiversity. Protecting our indigenous forests today feels like continuing that classroom lesson.',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      accolade: 'Goa Forest Department • Wildlife Conservation Lead',
    },
    {
      id: 'a8',
      username: 'ananya_naik_ca',
      fullName: 'Ananya Naik, CA',
      school: 'ANGLE_HSS',
      batchYear: 2016,
      occupation: 'Chartered Accountant & Corporate Finance Lead',
      city: 'Mumbai, India',
      bio: 'S.S. Angle HSS Commerce faculty gave rural students exceptional clarity in accountancy and financial law, enabling us to compete and rank at national ICAI levels.',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      accolade: 'All-India ICAI Merit Ranker • Corporate Finance',
    },
  ];

  // Helper to extract accolade from adminNotes
  const resolveAccolade = (item: any): string => {
    if (item.accolade) return item.accolade;
    if (item.adminNotes) {
      try {
        const parsed = typeof item.adminNotes === 'string' ? JSON.parse(item.adminNotes) : item.adminNotes;
        if (parsed?.accolade) return parsed.accolade;
      } catch {}
    }
    return 'Distinguished Nirakar Alumnus';
  };

  // Harmonize raw database objects into normalized items
  const normalizedItems: AlumnusItem[] = useMemo(() => {
    if (!alumni || alumni.length === 0) {
      return fallbackAlumni;
    }

    return alumni.map((item: any, idx: number) => {
      const fName = item.firstName || '';
      const lName = item.lastName || '';
      const computedFullName = item.fullName || (fName || lName ? `${fName} ${lName}`.trim() : `Alumnus ${idx + 1}`);

      return {
        id: item.id || `alumnus-${idx}`,
        username: item.user?.username || item.username || `alumnus_${idx + 1}`,
        fullName: computedFullName,
        firstName: item.firstName,
        lastName: item.lastName,
        school: item.school || 'NIRAKAR_HS',
        batchYear: item.batchYear || 2000,
        occupation: item.occupation || 'Distinguished Professional',
        city: item.city || 'Goa, India',
        bio: item.bio || item.quote || 'Education at Nirakar instilled timeless values, critical thinking, and civic leadership.',
        photoUrl: item.photoUrl || item.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        accolade: resolveAccolade(item),
      };
    });
  }, [alumni]);

  // Duplicate items twice to ensure a mathematically infinite, seamless marquee loop in one line
  const marqueeItems = useMemo(() => {
    return [...normalizedItems, ...normalizedItems];
  }, [normalizedItems]);

  // Real registered count from backend database
  const displayCount = typeof registeredCount === 'number' && registeredCount > 0
    ? registeredCount
    : normalizedItems.length;

  const sectionRef = useRef<HTMLElement>(null);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const mobileSliderRef = useRef<HTMLDivElement>(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);

  const handleMobileScroll = () => {
    if (mobileSliderRef.current) {
      const { scrollLeft, clientWidth } = mobileSliderRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setMobileActiveIndex(index);
    }
  };

  const handleScrollMobile = (direction: 'prev' | 'next') => {
    if (mobileSliderRef.current) {
      const { clientWidth } = mobileSliderRef.current;
      const targetIndex = direction === 'next' 
        ? Math.min(mobileActiveIndex + 1, normalizedItems.length - 1)
        : Math.max(mobileActiveIndex - 1, 0);
      
      mobileSliderRef.current.scrollTo({
        left: targetIndex * clientWidth,
        behavior: 'smooth',
      });
      setMobileActiveIndex(targetIndex);
    }
  };

  // GSAP ScrollTrigger for elegant section entrance
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-alumni-headline',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      );

      if (marqueeContainerRef.current) {
        gsap.fromTo(
          marqueeContainerRef.current,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            delay: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: marqueeContainerRef.current,
              start: 'top 88%',
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [normalizedItems]);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full bg-[#FAF7F2] py-14 sm:py-20 lg:py-24 overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-10 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/25 to-blue-200/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-10 w-96 h-96 rounded-full bg-gradient-to-tr from-stone-300/30 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header Section (Full Width with Fluid Padding) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="gsap-alumni-headline flex flex-col lg:flex-row lg:items-end justify-between mb-8 sm:mb-10 gap-4 sm:gap-6 border-b border-stone-200/90 pb-6 sm:pb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase font-serif font-bold tracking-wider sm:tracking-widest text-[#111b5e] bg-white/90 border border-stone-200/90 px-3.5 sm:px-4 py-1.5 rounded-full shadow-2xs mb-2.5 sm:mb-3">
              <ShieldCheck size={14} className="text-amber-500 shrink-0" />
              <span>{displayCount} Verified Alumni Across 3 Campuses</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black text-[#0b132b] tracking-tight leading-tight">
              Distinguished Alumni
            </h2>

            <p className="text-stone-600 text-xs sm:text-base mt-2 sm:mt-2.5 font-sans leading-relaxed">
              From High Court advocates and civil administrators to physicians, research scientists, and technology innovators, our verified graduates continue to serve Goa and the world with honor.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 self-start lg:self-auto">
            <a
              href="/alumni"
              className="inline-flex items-center gap-2 text-xs font-serif font-bold text-[#111b5e] hover:text-[#0b132b] bg-white/90 hover:bg-white px-4 py-2.5 rounded-xl border border-stone-300/80 shadow-2xs transition-all group"
            >
              <span>Explore All {displayCount} Profiles</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* MOBILE ONLY (<sm): ONE-BY-ONE CAROUSEL (NO CUTTING OFF, FULL CARD VISIBLE WITH SWIPE & STEPPER) */}
      <div className="sm:hidden w-full px-4 select-none">
        <div className="relative w-full">
          {/* Scrollable Container with 100% card snap */}
          <div 
            ref={mobileSliderRef}
            onScroll={handleMobileScroll}
            className="w-full flex items-stretch gap-4 overflow-x-auto scrollbar-none py-2 snap-x snap-mandatory"
          >
            {normalizedItems.map((alumnus: AlumnusItem, idx: number) => {
              const schoolInfo = getFullSchoolName(alumnus.school);

              return (
                <div
                  key={`mobile-${alumnus.id}-${idx}`}
                  className="w-full shrink-0 snap-center rounded-2xl overflow-hidden bg-white/95 border border-stone-200/90 shadow-[0_8px_30px_-6px_rgba(11,19,43,0.1)] flex flex-col justify-between relative"
                >
                  {/* 1. Header with dynamic campus gradient */}
                  <div className={`relative h-24 bg-gradient-to-r ${schoolInfo.headerBg} p-4 text-white overflow-hidden`}>
                    <div className="relative z-10 flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-amber-300">
                      <div className="flex items-center gap-1.5 opacity-90">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="truncate max-w-[150px]">{schoolInfo.shortCampus}</span>
                      </div>

                      <span className="bg-white/15 px-2.5 py-0.5 rounded-full border border-white/25 text-white font-serif font-bold text-[10px] tracking-wide shrink-0">
                        Class of {alumnus.batchYear}
                      </span>
                    </div>

                    {/* Bottom Organic SVG Curve */}
                    <svg
                      className="absolute -bottom-[1px] left-0 right-0 w-full h-8 overflow-visible"
                      viewBox="0 0 400 36"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path d="M0,0 C120,34 280,34 400,0 L400,36 L0,36 Z" fill="#ffffff" />
                      <path d="M0,0 C120,34 280,34 400,0" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
                    </svg>
                  </div>

                  {/* 2. Card Content */}
                  <div className="relative z-10 px-5 pt-1 pb-5 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Avatar Medallion */}
                      <div className="-mt-12 mb-2.5 flex items-end justify-between">
                        <div className="relative">
                          <div className="w-18 h-18 rounded-2xl overflow-hidden border-3 border-white shadow-md bg-stone-100 ring-2 ring-amber-400/40">
                            <img
                              src={alumnus.photoUrl}
                              alt={alumnus.fullName}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          </div>

                          <div 
                            className="absolute -bottom-1 -right-1 bg-[#111b5e] text-amber-300 rounded-full p-1 shadow border-2 border-white"
                            title="Verified Alumni Profile"
                          >
                            <ShieldCheck size={12} className="text-amber-400" />
                          </div>
                        </div>

                        <div className="text-right pb-1 max-w-[55%]">
                          <span className="text-xs font-serif font-bold text-[#111b5e] block truncate">
                            {schoolInfo.fullName}
                          </span>
                          <span className="text-[10px] text-stone-500 font-sans block">
                            Nirakar Alumni Record
                          </span>
                        </div>
                      </div>

                      {/* Name & Occupation */}
                      <div className="space-y-1">
                        <h3 className="font-serif text-lg font-bold text-[#0b132b] leading-tight">
                          {alumnus.fullName}
                        </h3>

                        <p className="text-xs text-stone-700 font-medium font-sans flex items-start gap-1.5 leading-relaxed">
                          <Briefcase size={13} className="text-[#111b5e] shrink-0 mt-0.5" />
                          <span>{alumnus.occupation}</span>
                        </p>
                      </div>

                      {/* Accolade */}
                      {alumnus.accolade && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700/90 font-sans font-medium pt-1">
                          <Award size={13} className="text-amber-600 shrink-0" />
                          <span className="line-clamp-1">{alumnus.accolade}</span>
                        </div>
                      )}

                      {/* Bio Quote */}
                      {alumnus.bio && (
                        <div className="pt-2.5 border-t border-stone-100">
                          <p className="text-xs text-stone-600 font-sans italic leading-relaxed line-clamp-3">
                            “{alumnus.bio}”
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      {alumnus.city && (
                        <div className="flex items-center gap-1 text-[11px] text-stone-500 font-sans truncate max-w-[50%]">
                          <MapPin size={11} className="text-amber-600 shrink-0" />
                          <span className="truncate">{alumnus.city}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                        <button
                          type="button"
                          onClick={() => setActiveModalItem(alumnus)}
                          className="text-[11px] font-serif font-semibold text-stone-500 hover:text-[#111b5e] underline transition-colors cursor-pointer"
                        >
                          Quick View
                        </button>

                        <a
                          href={`/alumni/${alumnus.username}`}
                          className="inline-flex items-center gap-1 text-xs font-serif font-bold text-[#111b5e] hover:text-[#0b132b]"
                        >
                          <span>Profile</span>
                          <ArrowRight size={13} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stepper Dots & Arrow Controls for Mobile One-by-One Navigation */}
          <div className="flex items-center justify-between pt-3 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleScrollMobile('prev')}
              className="p-2 rounded-full border border-stone-300 bg-white/90 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shadow-xs"
              aria-label="Previous Alumnus"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="text-stone-600 text-xs font-serif font-bold">
                {mobileActiveIndex + 1}
              </span>
              <span className="text-stone-300">/</span>
              <span className="text-stone-400 text-xs">
                {normalizedItems.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleScrollMobile('next')}
              className="p-2 rounded-full border border-stone-300 bg-white/90 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shadow-xs"
              aria-label="Next Alumnus"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP & TABLET (sm:block): Single-Line Marquee Carousel Container (Untouched) */}
      <div 
        ref={marqueeContainerRef}
        className="hidden sm:block alumni-marquee-container relative w-full overflow-hidden py-3 sm:py-4 select-none"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 1) 4%, rgba(0, 0, 1) 96%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 1) 4%, rgba(0, 0, 1) 96%, transparent 100%)',
        }}
      >
        {/* LEFT Smooth Edge Feathering (Zero harsh lines or cut-offs) */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 md:w-24 z-20 pointer-events-none bg-gradient-to-r from-[#FAF7F2] to-transparent" />

        {/* RIGHT Smooth Edge Feathering (Zero harsh lines or cut-offs) */}
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 md:w-24 z-20 pointer-events-none bg-gradient-to-l from-[#FAF7F2] to-transparent" />

        {/* The Continuous Infinite Marquee Track (One Line, Pauses on Hover) */}
        <div className="alumni-marquee-track flex items-stretch gap-4 sm:gap-6 md:gap-7 px-4 sm:px-6">
          {marqueeItems.map((alumnus: AlumnusItem, idx: number) => {
            const schoolInfo = getFullSchoolName(alumnus.school);

            return (
              <article
                key={`${alumnus.id}-${idx}`}
                className="group w-[320px] sm:w-[360px] md:w-[390px] shrink-0 rounded-2xl sm:rounded-[30px] overflow-hidden bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-[0_10px_35px_-8px_rgba(11,19,43,0.08)] hover:shadow-[0_24px_55px_-10px_rgba(17,27,94,0.18)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between relative"
              >
                {/* 1. ARCHITECTURAL SVG HEADER WITH DYNAMIC HERITAGE WAVE */}
                <div className={`relative h-28 bg-gradient-to-r ${schoolInfo.headerBg} p-5 text-white overflow-hidden`}>
                  {/* Subtle architectural geometric hatch watermark SVG */}
                  <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`arch-hatch-${idx}`} width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="currentColor" />
                        <path d="M 20 0 L 0 20" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#arch-hatch-${idx})`} />
                  </svg>

                  {/* Top Bar: Campus Tag & Collegiate Yearmark */}
                  <div className="relative z-10 flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-amber-300">
                    <div className="flex items-center gap-1.5 opacity-90">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{schoolInfo.shortCampus}</span>
                    </div>

                    <span className="bg-white/15 px-3 py-0.5 rounded-full border border-white/25 text-white font-serif font-bold text-[10px] tracking-wide">
                      Class of {alumnus.batchYear}
                    </span>
                  </div>

                  {/* Bottom Organic SVG Curve with Golden Accent Foil */}
                  <svg
                    className="absolute -bottom-[1px] left-0 right-0 w-full h-9 overflow-visible"
                    viewBox="0 0 400 36"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path d="M0,0 C120,34 280,34 400,0 L400,36 L0,36 Z" fill="#ffffff" />
                    <path d="M0,0 C120,34 280,34 400,0" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
                  </svg>
                </div>

                {/* 2. CARD CONTENT: HUMAN TOUCH, DIGNIFIED HIERARCHY (NO STACKED BOXES!) */}
                <div className="relative z-10 px-6 sm:px-7 pt-1 pb-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Overlapping Museum Medallion Portrait */}
                    <div className="-mt-14 mb-3 flex items-end justify-between">
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-3 border-white shadow-md bg-stone-100 ring-2 ring-amber-400/40 group-hover:scale-105 transition-transform duration-500">
                          <img
                            src={alumnus.photoUrl}
                            alt={alumnus.fullName}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        </div>

                        {/* Official Verification Crest Pin */}
                        <div 
                          className="absolute -bottom-1 -right-1 bg-[#111b5e] text-amber-300 rounded-full p-1 shadow border-2 border-white"
                          title="Verified Alumni Profile"
                        >
                          <ShieldCheck size={13} className="text-amber-400" />
                        </div>
                      </div>

                      {/* Collegiate Alma Mater Seal Tag */}
                      <div className="text-right pb-1">
                        <span className="text-xs font-serif font-bold text-[#111b5e] block">
                          {schoolInfo.fullName}
                        </span>
                        <span className="text-[10px] text-stone-500 font-sans block">
                          Nirakar Alumni Monograph
                        </span>
                      </div>
                    </div>

                    {/* Name & Official Designation */}
                    <div className="space-y-1">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0b132b] group-hover:text-[#111b5e] transition-colors leading-tight">
                        {alumnus.fullName}
                      </h3>

                      <p className="text-xs text-stone-700 font-medium font-sans flex items-start gap-1.5 leading-relaxed">
                        <Briefcase size={13} className="text-[#111b5e] shrink-0 mt-0.5" />
                        <span>{alumnus.occupation}</span>
                      </p>
                    </div>

                    {/* Distinguished Career Accolade (Clean & minimal, no left borders or boxes) */}
                    {alumnus.accolade && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700/90 font-sans font-medium pt-0.5">
                        <Award size={13} className="text-amber-600 shrink-0" />
                        <span className="truncate">{alumnus.accolade}</span>
                      </div>
                    )}

                    {/* Archival Student Reflection (Clean, minimal editorial quote) */}
                    {alumnus.bio && (
                      <div className="pt-3 border-t border-stone-100">
                        <p className="text-xs text-stone-600 font-sans italic leading-relaxed line-clamp-3">
                          “{alumnus.bio}”
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 3. CARD BASE: LOCATION & INTERACTIVE ACTIONS */}
                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                    {alumnus.city && (
                      <div className="flex items-center gap-1 text-[11px] text-stone-500 font-sans truncate">
                        <MapPin size={11} className="text-amber-600 shrink-0" />
                        <span className="truncate">{alumnus.city}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                      <button
                        type="button"
                        onClick={() => setActiveModalItem(alumnus)}
                        className="text-[11px] font-serif font-semibold text-stone-500 hover:text-[#111b5e] hover:underline transition-colors cursor-pointer"
                      >
                        Quick View
                      </button>

                      <a
                        href={`/alumni/${alumnus.username}`}
                        className="inline-flex items-center gap-1 text-xs font-serif font-bold text-[#111b5e] hover:text-[#0b132b] group-hover:translate-x-1 transition-transform"
                      >
                        <span>Profile</span>
                        <ArrowRight size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Global Lifelong Nirakar Fellowship CTA Ribbon (Full Width) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-28 mt-14 sm:mt-18">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#07112c] via-[#0b132b] to-[#081330] text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10">
          {/* Subtle gold hairline accent on top */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Unique Background Stretched Artwork */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            {/* Luminous Ambient Glow Orbs */}
            <div className="absolute -top-20 -left-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-16 w-96 h-96 bg-[#1d35d8]/15 rounded-full blur-3xl" />

            {/* Stretched Fellowship Constellation & River Connection SVG Curves */}
            <svg
              viewBox="0 0 1200 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
              preserveAspectRatio="none"
            >
              <path
                d="M -100 130 C 220 40, 520 200, 820 90 C 1020 25, 1220 160, 1400 100"
                stroke="url(#alumniGoldGrad)"
                strokeWidth="1.75"
                fill="none"
              />
              <path
                d="M -80 190 C 250 100, 580 240, 870 140 C 1070 70, 1250 200, 1420 150"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M -50 60 C 280 160, 620 40, 940 180 C 1140 110, 1320 60, 1450 110"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
                fill="none"
              />
              <defs>
                <linearGradient id="alumniGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col xl:flex-row items-center xl:items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-2 text-center xl:text-left max-w-2xl">
              <span className="text-[10px] sm:text-xs uppercase font-serif font-bold tracking-widest text-amber-300">
                Lifelong Nirakar Fellowship
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Are You an Alumnus of Our Three Campuses?
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
                Join our verified alumni directory, connect with batchmates across five decades, mentor current secondary and higher secondary students, and participate in annual campus reunions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href="/alumni/register"
                className="bg-amber-400 hover:bg-amber-300 text-[#0b132b] font-serif font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-md hover:scale-102 text-center"
              >
                Register in Alumni Directory
              </a>
              <a
                href="/alumni"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/25 font-serif font-semibold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition-all text-center"
              >
                Search {displayCount} Directory Profiles
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick View Alumnus Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 overflow-hidden">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-5">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#111b5e] shadow-md shrink-0">
                  <img
                    src={activeModalItem.photoUrl}
                    alt={activeModalItem.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck size={12} />
                    <span>Verified Alumni Record</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0b132b]">
                    {activeModalItem.fullName}
                  </h3>

                  <p className="text-xs text-stone-700 font-medium font-sans">
                    {activeModalItem.occupation}
                  </p>

                  <p className="text-xs text-stone-500 font-sans">
                    {activeModalItem.city} • Class of {activeModalItem.batchYear}
                  </p>
                </div>
              </div>

              {/* Full Alma Mater Details */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200/90 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-stone-500 block">Alma Mater</span>
                  <span className="font-serif font-bold text-sm text-[#111b5e]">
                    {getFullSchoolName(activeModalItem.school).fullName}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                  {getFullSchoolName(activeModalItem.school).campus}
                </span>
              </div>

              {/* Accolade */}
              {activeModalItem.accolade && (
                <div className="bg-amber-50/70 border border-amber-200/70 p-3 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <Award size={15} className="text-amber-600 shrink-0" />
                  <span className="font-serif font-medium">{activeModalItem.accolade}</span>
                </div>
              )}

              {/* Quote / Reflection */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100">
                <span className="text-[10px] font-mono uppercase text-stone-400">Student Days Reflection</span>
                <blockquote className="font-serif italic text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/60">
                  "{activeModalItem.bio}"
                </blockquote>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 text-xs font-serif font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={`/alumni/${activeModalItem.username}`}
                  className="inline-flex items-center gap-1.5 bg-[#111b5e] hover:bg-[#0b132b] text-white text-xs font-serif font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <span>Visit Full Profile</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
