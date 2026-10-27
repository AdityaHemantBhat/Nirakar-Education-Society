import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  ChevronDown,
  ArrowRight,
  Phone,
  FileText,
  Camera,
  GraduationCap,
  Building2,
  Sparkles,
  BookOpen,
  Users,
  Award,
  MapPin,
  Mail,
  School,
  ShieldCheck,
  Calendar,
  Clock,
  Globe,
  Compass,
  Lock,
  UserPlus,
  LogOut,
  Search,
} from 'lucide-react';
import { MegaMenuPanels } from './MegaMenuPanels.js';
import { MobileMenuDrawer } from './MobileMenuDrawer.js';
import { CampusesMenu } from './CampusesMenu.js';
import { GlobalSearch } from './GlobalSearch.js';
import { useCurrentAuthUser } from '../hooks/useCurrentAuthUser.js';
import { useAdmissionsSocket } from '../hooks/useAdmissionsSocket.js';
import { useQuery } from '@tanstack/react-query';

export const Navbar: React.FC = () => {
  useAdmissionsSocket();
  const { data: admissionsConfig } = useQuery({
    queryKey: ['admissions_config'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admissions/config');
      if (!response.ok) throw new Error('Failed to load admissions announcement');
      const json = await response.json();
      return json.data as { announcementText?: string | null; announcementVisible?: boolean };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const announcementText =
    admissionsConfig?.announcementVisible !== false && typeof admissionsConfig?.announcementText === 'string'
      ? admissionsConfig.announcementText.trim()
      : '';
  const authUser = useCurrentAuthUser();
  const facultyProfileHref = authUser?.facultyProfile?.id
    ? `/faculty/${authUser.facultyProfile.id}`
    : '/faculty/dashboard';
  const alumniProfileHref = `/alumni/${authUser?.alumniProfile?.username || authUser?.username || ''}`;
  const isFaculty = authUser?.role === 'FACULTY';
  const isAlumni = authUser?.role === 'ALUMNI';
  const handleSignOut = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      localStorage.removeItem('nirakar_auth_user');
      window.dispatchEvent(new Event('nirakar:auth-changed'));
      window.location.href = '/';
    }
  };
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [currentMenu, setCurrentMenu] = useState<string | null>(null);
  const [campusesOpen, setCampusesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const megaMenuContainerRef = useRef<HTMLDivElement>(null);
  const megaMenuContentRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the campuses panel when clicking outside of it
  useEffect(() => {
    if (!campusesOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setCampusesOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [campusesOpen]);

  const handleMouseEnter = (menuName: string) => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 240);
  };

  // Close mega menu when tapping outside on tablet or clicking away
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        activeMenu &&
        headerRef.current &&
        !headerRef.current.contains(e.target as Node) &&
        megaMenuContainerRef.current &&
        !megaMenuContainerRef.current.contains(e.target as Node)
      ) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [activeMenu]);

  useEffect(() => {
    const container = megaMenuContainerRef.current;
    const content = megaMenuContentRef.current;
    if (!container) return;

    if (activeMenu) {
      setCurrentMenu(activeMenu);
      container.style.pointerEvents = 'auto';

      if (!isOpenRef.current) {
        // 1. OPENING: Silky smooth, gentle drop down right below navbar (zero flash, zero skeleton)
        isOpenRef.current = true;
        gsap.killTweensOf(container);
        if (content) gsap.killTweensOf(content);

        gsap.set(container, { display: 'block' });

        gsap.fromTo(
          container,
          {
            autoAlpha: 0,
            y: -14,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.38,
            ease: 'power3.out',
            overwrite: 'auto',
          }
        );

        if (content) {
          gsap.fromTo(
            content,
            { opacity: 0, y: -6 },
            { opacity: 1, y: 0, duration: 0.32, delay: 0.04, ease: 'power2.out' }
          );
        }
      } else {
        // 2. SWITCHING ITEMS: The container stays locked in place!
        // Only smoothly crossfades the content for zero flash!
        if (content) {
          gsap.killTweensOf(content);
          gsap.fromTo(
            content,
            { opacity: 0.35, y: 4 },
            { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out', overwrite: 'auto' }
          );
        }
      }
    } else {
      // 3. CLOSING: Smoothly recedes up and completely hides with display:none (zero skeleton)
      if (isOpenRef.current) {
        isOpenRef.current = false;
        container.style.pointerEvents = 'none';
        gsap.killTweensOf(container);
        if (content) gsap.killTweensOf(content);

        gsap.to(container, {
          autoAlpha: 0,
          y: -12,
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => {
            gsap.set(container, { display: 'none' });
            setCurrentMenu(null);
          },
        });
      }
    }
  }, [activeMenu]);

  return (
    <header
      ref={headerRef}
      className={`navbar-lg-compact sticky top-0 z-50 w-full bg-transparent font-sans transition-[filter,box-shadow] duration-300 ${
        isScrolled ? 'drop-shadow-md' : ''
      }`}
    >
      {/* 1. TOP INSTITUTIONAL UTILITY BAR (Dark Navy Contrast) */}
      {/* 1. TOP INSTITUTIONAL UTILITY BAR (Dark Navy Contrast) */}
      <div className="util-bar relative bg-[#0b132b] text-stone-200 text-xs py-1.5 px-2.5 sm:px-6 lg:px-12 xl:px-16 border-b border-stone-800">
        <div className="w-full flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] touch-pan-x overscroll-x-contain py-0.5">
          {/* Left: campus switcher and institutional identity */}
          <div className="util-left flex min-w-0 items-center gap-2 sm:gap-4 shrink-0">
            <div className="relative">
              <button
                onClick={() => setCampusesOpen(!campusesOpen)}
                className="flex items-center space-x-1 sm:space-x-1.5 whitespace-nowrap text-accent-400 hover:text-white font-semibold py-0.5 text-[11px] sm:text-xs transition-colors cursor-pointer shrink-0"
                aria-expanded={campusesOpen}
              >
                <Building2 size={13} className="text-accent-400 shrink-0" />
                <span>Our 3 Campuses</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${campusesOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            <span className="hidden h-3.5 w-px shrink-0 bg-white/20 lg:block" aria-hidden="true" />
            <div className="util-accreditation hidden min-w-0 items-center gap-4 text-[10px] tracking-wide text-stone-300 lg:flex xl:gap-5">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <MapPin size={12} className="shrink-0 text-accent-400" />
                <span>Mashem, Canacona <span className="text-stone-500">·</span> Est. 1939</span>
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap text-stone-400">
                <Award size={12} className="shrink-0 text-accent-400" />
                <span>Goa Board Recognized</span>
              </span>
            </div>
          </div>

          {/* Right: Quick Links & Search (ALL visible and cleanly spaced on all screens) */}
          <div className="util-right flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4 text-[11px] font-mono whitespace-nowrap pr-2 sm:pr-0">
            {/* Search Pill */}
            <button
              onClick={() => setSearchOpen(true)}
              className="group inline-flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/15 px-2 py-0.5 sm:px-2.5 sm:py-1 text-stone-200 hover:text-white border border-white/20 hover:border-amber-400/50 transition-all duration-200 cursor-pointer shadow-2xs shrink-0"
              title="Search website records"
              aria-label="Search website records"
            >
              <Search size={11} className="text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-sans text-[11px] font-medium tracking-normal text-stone-200 hidden sm:inline">Search records...</span>
              <span className="font-sans text-[11px] font-medium tracking-normal text-stone-200 sm:hidden">Search</span>
            </button>

            <span className="text-stone-700/80">|</span>
            <a href="/notices" className="hover:text-accent-400 flex items-center space-x-1 transition-colors shrink-0">
              <FileText size={12} className="shrink-0" />
              <span>Notices</span>
            </a>

            <span className="text-stone-700/80">|</span>
            <a href="/faculty" className="hover:text-amber-400 flex items-center space-x-1 text-stone-200 transition-colors shrink-0">
              <GraduationCap size={12} className="text-amber-400 shrink-0" />
              <span>Faculty</span>
            </a>

            {(!authUser || isFaculty) && (
              <>
                <span className="text-stone-700/80">|</span>
                <a href={isFaculty ? facultyProfileHref : '/faculty/login'} className="hover:text-amber-400 flex items-center space-x-1 text-amber-300 font-semibold transition-colors shrink-0">
                  {isFaculty ? <GraduationCap size={12} className="text-amber-400 shrink-0" /> : <Lock size={12} className="text-amber-400 shrink-0" />}
                  <span>{isFaculty ? 'Profile' : 'Portal'}</span>
                </a>
              </>
            )}

            {(!authUser || isAlumni) && (
              <>
                <span className="text-stone-700/80">|</span>
                <a href={isAlumni ? alumniProfileHref : '/account/login'} className="hover:text-accent-400 flex items-center space-x-1 transition-colors shrink-0">
                  <span>{isAlumni ? 'Alumni Profile' : 'Alumni'}</span>
                </a>
                {isAlumni && (
                  <button type="button" onClick={() => void handleSignOut()} className="inline-flex items-center gap-1 text-stone-200 transition-colors hover:text-amber-400 shrink-0" aria-label="Sign out of alumni account">
                    <LogOut size={12} className="shrink-0" />
                    <span>Sign out</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <CampusesMenu open={campusesOpen} onClose={() => setCampusesOpen(false)} />
      </div>

      {announcementText && (
        <div className="relative z-40 w-full overflow-hidden border-b border-amber-500/40 bg-[#111b5e] py-2 text-amber-100 sm:py-2.5" role="status" aria-label="Admissions announcement">
          <div className="admissions-announcement-marquee whitespace-nowrap px-4 text-[13px] font-semibold leading-5 sm:text-sm">
            <span>{announcementText}</span>
          </div>
        </div>
      )}

      {/* 2. MIDDLE CURVED HORIZON CONTAINER (Preserved Iconic Design) */}
      <div className="relative w-full bg-transparent z-40">
        {/* Seamless Continuous Vector SVG Canvas */}
        <div
          className={`absolute inset-0 pointer-events-none w-full h-[72px] lg:h-[150px] overflow-hidden z-40 transition-all duration-300 ${
            isScrolled ? 'drop-shadow-lg' : 'drop-shadow-md'
          }`}
        >
          {/* MOBILE / TABLET CURVE — soft, rounded cradle (lg and below only) */}
          <svg
            className="w-full h-full lg:hidden"
            viewBox="0 5 1440 72"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="navCurveAccentMobile" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#111b5e" stopOpacity="0.2" />
                <stop offset="25%" stopColor="#d97706" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="75%" stopColor="#d97706" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#111b5e" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* White nav surface with a smooth, rounded central dip cradling the emblem */}
            <path
              d="M 0,0
                 L 1440,0
                 L 1440,50
                 C 1250,50 1030,52 880,58
                 C 800,61 762,68 720,68
                 C 678,68 640,61 560,58
                 C 410,52 190,50 0,50
                 Z"
              fill="#ffffff"
            />

            {/* Matching soft gradient curve, rounded caps */}
            <path
              d="M 0,50
                 C 190,50 410,52 560,58
                 C 640,61 678,68 720,68
                 C 762,68 800,61 880,58
                 C 1030,52 1250,50 1440,50"
              fill="none"
              stroke="url(#navCurveAccentMobile)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          {/* DESKTOP CURVE — untouched */}
          <svg
            className="nav-curve-desktop w-full h-full hidden lg:block"
            viewBox="0 0 1440 150"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="navCurveAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#111b5e" stopOpacity="0.2" />
                <stop offset="25%" stopColor="#d97706" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="75%" stopColor="#d97706" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#111b5e" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Seamless White Nav Bar Base */}
            <path
              className="nav-curve-fill"
              d="M 0,0
                 L 1440,0
                 L 1440,72
                 C 1240,72 1020,80 880,92
                 C 800,98 760,144 720,144
                 C 680,144 640,98 560,92
                 C 420,80 200,72 0,72
                 Z"
              fill="#ffffff"
            />

            {/* Symmetrical Continuous Dual Curves */}
            <path
              className="nav-curve-stroke"
              d="M 0,72
                 C 200,72 420,80 560,92
                 C 640,98 680,144 720,144
                 C 760,144 800,98 880,92
                 C 1020,80 1240,72 1440,72"
              fill="none"
              stroke="url(#navCurveAccent)"
              strokeWidth="3"
            />
          </svg>

          {/* SHALLOWER COMPACT CURVE (1024–1279px) — the same cradle with a
              flatter belly and shallower shoulders, so it clears the emblem
              text on shorter desktop screens. */}
          <svg
            className="nav-curve-compact hidden w-full h-full"
            viewBox="0 0 1440 150"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="navCurveAccentCompact" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#111b5e" stopOpacity="0.2" />
                <stop offset="25%" stopColor="#d97706" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="75%" stopColor="#d97706" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#111b5e" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* White nav surface — flat belly, gently eased shoulders */}
            <path
              d="M 0,0
                 L 1440,0
                 L 1440,78
                 C 1240,78 1020,84 880,94
                 C 800,99 762,122 720,122
                 C 678,122 640,99 560,94
                 C 420,84 200,78 0,78
                 Z"
              fill="#ffffff"
            />

            {/* Matching gold curve */}
            <path
              d="M 0,78
                 C 200,78 420,84 560,94
                 C 640,99 678,122 720,122
                 C 762,122 800,99 880,94
                 C 1020,84 1240,78 1440,78"
              fill="none"
              stroke="url(#navCurveAccentCompact)"
              strokeWidth="3"
            />
          </svg>
        </div>

        {/* Content Container (Split Navigation & Centered Emblem) */}
        <div className="relative z-40 w-full px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="nav-row flex items-center lg:items-start justify-between min-h-[72px] lg:min-h-[150px]">
            {/* LEFT SIDE MENU: Home, Society, Campuses, Academics (with Mega Menu) */}
            <nav className="nav-rail nav-rail-left hidden lg:flex min-w-0 items-center space-x-1 flex-1 justify-start h-20 pt-1 z-50 relative">
              {/* 1. HOME BUTTON */}
              <a
                href="/"
                className="nav-link group relative inline-flex items-center whitespace-nowrap text-xs xl:text-sm font-serif font-bold text-stone-700 hover:text-[#111b5e] px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200"
              >
                <span>Home</span>
                <span className="absolute bottom-1 nav-underline left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>

              {/* 2. SOCIETY (Mega Menu Trigger) */}
              <div
                onMouseEnter={() => handleMouseEnter('society')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'society' ? null : 'society')}
                  className={`nav-link-btn group relative inline-flex items-center gap-1 whitespace-nowrap text-xs xl:text-sm font-serif font-bold px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200 cursor-pointer ${
                    activeMenu === 'society' ? 'text-[#111b5e]' : 'text-stone-700 hover:text-[#111b5e]'
                  }`}
                >
                  <span>Society</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      activeMenu === 'society' ? 'rotate-180 text-[#111b5e]' : 'text-stone-400 group-hover:text-[#111b5e]'
                    }`}
                  />
                  <span
                    className={`absolute bottom-1 nav-underline left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] transition-transform duration-200 origin-left ${
                      activeMenu === 'society' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>
              </div>

              {/* 3. CAMPUSES (Mega Menu Trigger) */}
              <div
                onMouseEnter={() => handleMouseEnter('campuses')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'campuses' ? null : 'campuses')}
                  className={`nav-link-btn group relative inline-flex items-center gap-1 whitespace-nowrap text-xs xl:text-sm font-serif font-bold px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200 cursor-pointer ${
                    activeMenu === 'campuses' ? 'text-[#111b5e]' : 'text-stone-700 hover:text-[#111b5e]'
                  }`}
                >
                  <span>Campuses</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      activeMenu === 'campuses' ? 'rotate-180 text-[#111b5e]' : 'text-stone-400 group-hover:text-[#111b5e]'
                    }`}
                  />
                  <span
                    className={`absolute bottom-1 nav-underline left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] transition-transform duration-200 origin-left ${
                      activeMenu === 'campuses' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>
              </div>

              {/* 4. ACADEMICS (MEGA MENU TRIGGER) */}
              <div
                onMouseEnter={() => handleMouseEnter('academics')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'academics' ? null : 'academics')}
                  className={`nav-link-btn group relative inline-flex items-center gap-1 whitespace-nowrap text-xs xl:text-sm font-serif font-bold px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200 cursor-pointer ${
                    activeMenu === 'academics' ? 'text-[#111b5e]' : 'text-stone-700 hover:text-[#111b5e]'
                  }`}
                >
                  <span>Academics</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      activeMenu === 'academics' ? 'rotate-180 text-[#111b5e]' : 'text-stone-400 group-hover:text-[#111b5e]'
                    }`}
                  />
                  <span
                    className={`absolute bottom-1 nav-underline left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] transition-transform duration-200 origin-left ${
                      activeMenu === 'academics' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>
              </div>

              {/* 5. FACULTY (SMALL MEGA MENU TRIGGER - LEFT SIDE) */}
              <div
                onMouseEnter={() => handleMouseEnter('faculty')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'faculty' ? null : 'faculty')}
                  className={`nav-link-btn group relative inline-flex items-center gap-1 whitespace-nowrap text-xs xl:text-sm font-serif font-bold px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200 cursor-pointer ${
                    activeMenu === 'faculty' ? 'text-[#111b5e]' : 'text-stone-700 hover:text-[#111b5e]'
                  }`}
                >
                  <span>Faculty</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      activeMenu === 'faculty' ? 'rotate-180 text-[#111b5e]' : 'text-stone-400 group-hover:text-[#111b5e]'
                    }`}
                  />
                  <span
                    className={`absolute bottom-1 nav-underline left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] transition-transform duration-200 origin-left ${
                      activeMenu === 'faculty' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>
              </div>
            </nav>

            {/* LEFT (MOBILE/TABLET): Full institution name, vertically centred on the logo axis */}
            <div className="lg:hidden flex items-center h-[72px] min-w-0 flex-1 justify-start pr-2 -translate-y-[15px]">
              {/* PHONE — compact two-line name */}
              <a
                href="/"
                className="sm:hidden min-w-0 max-w-[36vw] min-[400px]:max-w-[40vw] font-serif text-[10px] min-[400px]:text-[11px] font-bold uppercase text-[#111b5e] tracking-[0.06em] leading-[1.25] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111b5e]/25 rounded-sm"
                title="Shri Nirakar Education Society"
              >
                <span className="block">Shri Nirakar</span>
                <span className="block">Education Society</span>
              </a>

              {/* TABLET — the full identity, as on desktop */}
              <a
                href="/"
                className="hidden sm:block min-w-0 max-w-[46vw] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111b5e]/25 rounded-sm"
                title="Shri Nirakar Education Society"
              >
                <span className="block font-serif text-[11px] font-black uppercase tracking-[0.04em] leading-[1.2] text-[#111b5e]">
                  Shri Nirakar Education Society
                </span>
                <span className="mt-0.5 block font-serif text-[10px] font-bold tracking-[0.03em] leading-none text-accent-700">
                  Mashem, Canacona, South Goa • Estd. 1939
                </span>
              </a>
            </div>

            {/* CENTER (MOBILE/TABLET): Logo perfectly centered to the viewport */}
            <div className="lg:hidden absolute left-1/2 -translate-x-1/2 top-[6px] sm:top-[-2px] z-50 flex flex-col items-center pointer-events-none">
              <a
                href="/"
                className="pointer-events-auto flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111b5e]/25 rounded-full"
                aria-label="Shri Nirakar Education Society — Home"
              >
                <img
                  src="/images/Logo.webp"
                  alt="Shri Nirakar Education Society Emblem"
                  className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_2px_6px_rgba(11,19,43,0.12)]"
                />
              </a>
            </div>

            {/* CENTER LOGO & UNIVERSITY EMBLEM IN SVG CURVED CRADLE */}
            <div className="nav-emblem hidden lg:flex flex-col items-center justify-center shrink-0 px-2 z-50 group relative pt-1 pb-2">
              <a href="/" className="flex flex-col items-center text-center group">
                <div className="relative group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/images/Logo.webp"
                    alt="Shri Nirakar Education Society Emblem"
                    className="nav-emblem-img h-14 sm:h-16 w-auto object-contain"
                  />
                </div>
                <span className="nav-emblem-name text-[11px] sm:text-xs font-serif font-black tracking-tight text-[#111b5e] mt-1 block leading-tight">
                  SHRI NIRAKAR EDUCATION SOCIETY
                </span>
                <span className="nav-emblem-sub text-[9px] sm:text-[10px] text-accent-700 font-serif font-bold tracking-wider block mt-0.5 leading-none">
                  Mashem, Canacona, South Goa • Estd. 1939
                </span>
              </a>
            </div>

            {/* RIGHT SIDE MENU: Daily Magazine, Alumni, Notices, Contact, Join Alumni */}
            <nav className="nav-rail nav-rail-right hidden lg:flex min-w-0 items-center space-x-1 flex-1 justify-end h-20 pt-1 z-50 relative">
              {/* Daily Magazine */}
              <a
                href="/magazine"
                className="nav-link group relative inline-flex items-center whitespace-nowrap text-xs xl:text-sm font-serif font-bold text-stone-700 hover:text-[#111b5e] px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200"
              >
                <span className="hidden xl:inline">Daily Magazine</span>
                <span className="xl:hidden">Magazine</span>
                <span className="absolute bottom-1 nav-underline left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>

              {/* Digital Library */}
              <a
                href="/library"
                className="nav-link group relative inline-flex items-center whitespace-nowrap text-xs xl:text-sm font-serif font-bold text-stone-700 hover:text-[#111b5e] px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200"
              >
                <span>Library</span>
                <span className="absolute bottom-1 nav-underline left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>

              {/* Alumni Mega Menu Trigger */}
              <div
                onMouseEnter={() => handleMouseEnter('alumni')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'alumni' ? null : 'alumni')}
                  className={`nav-link-btn group relative inline-flex items-center gap-1 whitespace-nowrap text-xs xl:text-sm font-serif font-bold px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200 cursor-pointer ${
                    activeMenu === 'alumni' ? 'text-[#111b5e]' : 'text-stone-700 hover:text-[#111b5e]'
                  }`}
                >
                  <span>Alumni</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      activeMenu === 'alumni' ? 'rotate-180 text-[#111b5e]' : 'text-stone-400 group-hover:text-[#111b5e]'
                    }`}
                  />
                  <span
                    className={`absolute bottom-1 nav-underline left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] transition-transform duration-200 origin-left ${
                      activeMenu === 'alumni' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>
              </div>

              {/* Notices */}
              <a
                href="/notices"
                className="nav-link group relative inline-flex items-center whitespace-nowrap text-xs xl:text-sm font-serif font-bold text-stone-700 hover:text-[#111b5e] px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200"
              >
                <span>Notices</span>
                <span className="absolute bottom-1 nav-underline left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>

              {/* Contact */}
              <a
                href="/contact"
                className="nav-link group relative inline-flex items-center whitespace-nowrap text-xs xl:text-sm font-serif font-bold text-stone-700 hover:text-[#111b5e] px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200"
              >
                <span>Contact</span>
                <span className="absolute bottom-1 nav-underline left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>

              {/* Join Alumni Action Pill */}
              <div className="nav-cta-wrap pl-2">
                <a
                  href={isAlumni ? alumniProfileHref : '/alumni/register'}
                  className="nav-cta shrink-0 whitespace-nowrap bg-[#111b5e] hover:bg-[#0b132b] text-white font-serif font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow"
                >
                  <span>{isAlumni ? 'My Profile' : 'Join Alumni'}</span>
                </a>
              </div>
            </nav>

            {/* Mobile / Tablet Menu Button — modern minimal burger, 44px touch target */}
            <div className="lg:hidden flex items-center justify-end h-[72px] flex-1 pl-1 -translate-y-[15px]">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="group relative inline-flex items-center justify-center w-11 h-11 rounded-xl text-[#111b5e] hover:bg-[#111b5e]/[0.06] active:bg-[#111b5e]/[0.10] active:scale-[0.96] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111b5e]/30 shrink-0"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                <span className="relative block w-[22px] h-[16px]">
                  <motion.span
                    animate={mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute left-0 top-0 block h-[2px] w-[22px] rounded-full bg-current origin-center"
                  />
                  <motion.span
                    animate={
                      mobileMenuOpen
                        ? { opacity: 0, scaleX: 0.2, x: 4 }
                        : { opacity: 1, scaleX: 1, x: 0 }
                    }
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 block h-[2px] w-[14px] rounded-full bg-current origin-left"
                  />
                  <motion.span
                    animate={mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute left-0 bottom-0 block h-[2px] w-[22px] rounded-full bg-current origin-center"
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. FULL-WIDTH STRETCHED MEGA MENU (PERSISTENT ZERO-FLASH GSAP CONTAINER OPTIMIZED FOR PC & TABLET) */}
        {/* Hidden on mobile; only visible on lg+ screens */}
        <div
          ref={megaMenuContainerRef}
          style={{ display: 'none', visibility: 'hidden', opacity: 0 }}
          className={`fixed left-0 right-0 z-30 pointer-events-none will-change-transform max-h-[calc(100vh-116px)] overflow-y-auto lg:max-h-[none] ${announcementText ? 'top-[142px] lg:top-[144px]' : 'top-[98px] lg:top-[100px]'}`}
          onMouseEnter={() => {
            if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="w-full bg-transparent relative drop-shadow-[0_20px_45px_rgba(11,19,43,0.18)]">
            <div ref={megaMenuContentRef}>
              <MegaMenuPanels activeMenu={currentMenu} onClose={() => setActiveMenu(null)} authUser={authUser} />
            </div>
          </div>
        </div>

        {/* 4. MOBILE / TABLET FULL-SCREEN DRAWER (2026 premium sheet) */}
        <MobileMenuDrawer
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          isAlumni={isAlumni}
          isFaculty={isFaculty}
          hasAuthUser={!!authUser}
          alumniProfileHref={alumniProfileHref}
          facultyProfileHref={facultyProfileHref}
        />

        <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </header>
  );
};

export default Navbar;
