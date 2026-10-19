import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  ChevronDown,
  Menu as MenuIcon,
  X,
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
} from 'lucide-react';
import { MegaMenuPanels } from './MegaMenuPanels.js';
import { useCurrentAuthUser } from '../hooks/useCurrentAuthUser.js';

export const Navbar: React.FC = () => {
  const authUser = useCurrentAuthUser();
  const facultyProfileHref = authUser?.facultyProfile?.id
    ? `/faculty/${authUser.facultyProfile.id}`
    : '/faculty/dashboard';
  const alumniProfileHref = `/alumni/${authUser?.alumniProfile?.username || authUser?.username || ''}`;
  const isFaculty = authUser?.role === 'FACULTY';
  const isAlumni = authUser?.role === 'ALUMNI';
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [currentMenu, setCurrentMenu] = useState<string | null>(null);
  const [campusesOpen, setCampusesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const megaMenuContainerRef = useRef<HTMLDivElement>(null);
  const megaMenuContentRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      className={`sticky top-0 z-50 w-full bg-transparent font-sans transition-[filter,box-shadow] duration-300 ${
        isScrolled ? 'drop-shadow-md' : ''
      }`}
    >
      {/* 1. TOP INSTITUTIONAL UTILITY BAR (Dark Navy Contrast) */}
      <div className="bg-[#0b132b] text-stone-200 text-xs py-1.5 px-4 sm:px-8 lg:px-12 xl:px-16 border-b border-stone-800">
        <div className="w-full flex items-center justify-between">
          {/* Left: Campuses Quick Switcher */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button
                onClick={() => setCampusesOpen(!campusesOpen)}
                className="flex items-center space-x-1.5 text-accent-400 hover:text-white font-semibold py-0.5 transition-colors cursor-pointer"
                aria-expanded={campusesOpen}
              >
                <Building2 size={12} className="text-accent-400" />
                <span>Our 3 Campuses</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${campusesOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {campusesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 mt-2 w-84 bg-white text-stone-900 rounded-2xl shadow-2xl border border-stone-200 p-3 z-50"
                  >
                    <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-2 font-serif">
                      Institutions Under Society
                    </div>
                    <div className="space-y-1">
                      <a
                        href="/institutions/nirakar-high-school"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors"
                        onClick={() => setCampusesOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-[#111b5e] font-bold text-xs shrink-0 font-serif">
                          NHS
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-stone-900">Shri Nirakar High School</div>
                          <div className="text-[11px] text-stone-500">Mashem, Canacona • Estd. 1968</div>
                        </div>
                      </a>

                      <a
                        href="/institutions/tudal-high-school"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors"
                        onClick={() => setCampusesOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-accent-50 border border-accent-200 flex items-center justify-center text-accent-900 font-bold text-xs shrink-0 font-serif">
                          THS
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-stone-900">Tudal High School</div>
                          <div className="text-[11px] text-stone-500">Gaondongrem, Canacona • Estd. 1989</div>
                        </div>
                      </a>

                      <a
                        href="/institutions/angle-higher-secondary"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors"
                        onClick={() => setCampusesOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-[#111b5e] font-bold text-xs shrink-0 font-serif">
                          SSA
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-stone-900">S. S. Angle Higher Secondary</div>
                          <div className="text-[11px] text-stone-500">Arts, Science & Commerce Streams</div>
                        </div>
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-stone-600 hidden md:inline">|</span>
            <div className="hidden md:flex items-center space-x-2 text-stone-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-[11px]">Goa Board Recognized • SSC Index 08.006 • HSSC Index 08.06</span>
            </div>
          </div>

          {/* Right: Quick Links */}
          <div className="flex items-center space-x-4 lg:space-x-5 text-[11px] font-mono">
            <a href="/notices" className="hover:text-accent-400 flex items-center space-x-1 transition-colors">
              <FileText size={12} />
              <span className="hidden sm:inline">Circulars & Notices</span>
              <span className="sm:hidden">Notices</span>
            </a>
            <span className="text-stone-700 hidden sm:inline">|</span>
            <a href="/faculty" className="hover:text-amber-400 flex items-center space-x-1 text-stone-200 transition-colors">
              <GraduationCap size={12} className="text-amber-400" />
              <span>Faculty</span>
            </a>
            {(!authUser || isFaculty) && <>
              <span className="text-stone-700">|</span>
              <a href={isFaculty ? facultyProfileHref : '/faculty/login'} className="hover:text-amber-400 flex items-center space-x-1 text-amber-300 font-semibold transition-colors">
                {isFaculty ? <GraduationCap size={12} className="text-amber-400" /> : <Lock size={12} className="text-amber-400" />}
                <span>{isFaculty ? 'My Faculty Profile' : 'Faculty Portal'}</span>
              </a>
            </>}
            {(!authUser || isAlumni) && <>
              <span className="text-stone-700 hidden md:inline">|</span>
              <a href={isAlumni ? alumniProfileHref : '/account/login'} className="hover:text-accent-400 hidden md:inline transition-colors">
                <span>{isAlumni ? 'My Alumni Profile' : 'Alumni Portal'}</span>
              </a>
            </>}
          </div>
        </div>
      </div>

      {/* 2. MIDDLE CURVED HORIZON CONTAINER (Preserved Iconic Design) */}
      <div className="relative w-full bg-transparent z-40">
        {/* Seamless Continuous Vector SVG Canvas */}
        <div
          className={`absolute inset-0 pointer-events-none w-full h-[72px] lg:h-[150px] overflow-hidden z-40 transition-all duration-300 ${
            isScrolled ? 'drop-shadow-lg' : 'drop-shadow-md'
          }`}
        >
          <svg
            className="w-full h-full"
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
        </div>

        {/* Content Container (Split Navigation & Centered Emblem) */}
        <div className="relative z-40 w-full px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="flex items-start justify-between min-h-[72px] lg:min-h-[150px]">
            {/* LEFT SIDE MENU: Home, Society, Campuses, Academics (with Mega Menu) */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-start h-20 pt-1 z-50 relative">
              {/* 1. HOME BUTTON */}
              <a
                href="/"
                className="group relative inline-flex items-center text-xs xl:text-sm font-serif font-bold text-stone-700 hover:text-[#111b5e] px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200"
              >
                <span>Home</span>
                <span className="absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>

              {/* 2. SOCIETY (Mega Menu Trigger) */}
              <div
                onMouseEnter={() => handleMouseEnter('society')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'society' ? null : 'society')}
                  className={`group relative inline-flex items-center gap-1 text-xs xl:text-sm font-serif font-bold px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200 cursor-pointer ${
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
                    className={`absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] transition-transform duration-200 origin-left ${
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
                  className={`group relative inline-flex items-center gap-1 text-xs xl:text-sm font-serif font-bold px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200 cursor-pointer ${
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
                    className={`absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] transition-transform duration-200 origin-left ${
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
                  className={`group relative inline-flex items-center gap-1 text-xs xl:text-sm font-serif font-bold px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200 cursor-pointer ${
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
                    className={`absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] transition-transform duration-200 origin-left ${
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
                  className={`group relative inline-flex items-center gap-1 text-xs xl:text-sm font-serif font-bold px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200 cursor-pointer ${
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
                    className={`absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] transition-transform duration-200 origin-left ${
                      activeMenu === 'faculty' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>
              </div>
            </nav>

            {/* CENTER LOGO & UNIVERSITY EMBLEM IN SVG CURVED CRADLE */}
            <div className="flex flex-col items-center justify-center shrink-0 px-4 z-50 group relative pt-1 pb-2">
              <a href="/" className="flex flex-col items-center text-center group">
                <div className="relative group-hover:scale-105 transition-transform duration-300">
                  <img
                    src="/images/Logo.webp"
                    alt="Shree Nirakar Education Society Emblem"
                    className="h-14 sm:h-16 w-auto object-contain"
                  />
                </div>
                <span className="text-[11px] sm:text-xs font-serif font-black tracking-tight text-[#111b5e] mt-1 block leading-tight">
                  SHREE NIRAKAR EDUCATION SOCIETY
                </span>
                <span className="text-[9px] sm:text-[10px] text-accent-700 font-serif font-bold tracking-wider block mt-0.5 leading-none">
                  Mashem, Canacona, South Goa • Estd. 1939
                </span>
              </a>
            </div>

            {/* RIGHT SIDE MENU: Daily Magazine, Alumni, Notices, Contact, Join Alumni */}
            <nav className="hidden lg:flex items-center space-x-1.5 flex-1 justify-end h-20 pt-1 z-50 relative">
              {/* Daily Magazine */}
              <a
                href="/magazine"
                className="group relative inline-flex items-center text-xs xl:text-sm font-serif font-bold text-stone-700 hover:text-[#111b5e] px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200"
              >
                <span>Daily Magazine</span>
                <span className="absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>

              {/* Alumni Mega Menu Trigger */}
              <div
                onMouseEnter={() => handleMouseEnter('alumni')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === 'alumni' ? null : 'alumni')}
                  className={`group relative inline-flex items-center gap-1 text-xs xl:text-sm font-serif font-bold px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200 cursor-pointer ${
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
                    className={`absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] transition-transform duration-200 origin-left ${
                      activeMenu === 'alumni' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </button>
              </div>

              {/* Notices */}
              <a
                href="/notices"
                className="group relative inline-flex items-center text-xs xl:text-sm font-serif font-bold text-stone-700 hover:text-[#111b5e] px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200"
              >
                <span>Notices</span>
                <span className="absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>

              {/* Contact */}
              <a
                href="/contact"
                className="group relative inline-flex items-center text-xs xl:text-sm font-serif font-bold text-stone-700 hover:text-[#111b5e] px-3.5 py-2 rounded-lg hover:bg-stone-50/80 transition-colors duration-200"
              >
                <span>Contact</span>
                <span className="absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-[#111b5e] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>

              {/* Join Alumni Action Pill */}
              <div className="pl-2">
                <a
                  href={isAlumni ? alumniProfileHref : '/alumni/register'}
                  className="bg-[#111b5e] hover:bg-[#0b132b] text-white font-serif font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow"
                >
                  <span>{isAlumni ? 'My Profile' : 'Join Alumni'}</span>
                </a>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center pt-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-700 hover:text-[#111b5e]"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={26} /> : <MenuIcon size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. FULL-WIDTH STRETCHED MEGA MENU (PERSISTENT ZERO-FLASH GSAP CONTAINER OPTIMIZED FOR PC & TABLET) */}
        {/* Hidden on mobile; only visible on lg+ screens */}
        <div
          ref={megaMenuContainerRef}
          style={{ display: 'none', visibility: 'hidden', opacity: 0 }}
          className="fixed left-0 right-0 top-[98px] lg:top-[100px] z-30 pointer-events-none will-change-transform max-h-[calc(100vh-116px)] overflow-y-auto lg:max-h-[none]"
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

        {/* 4. MOBILE DRAWER NAVIGATION */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-stone-200 bg-white px-6 pt-3 pb-8 space-y-3 shadow-xl max-h-[80vh] overflow-y-auto"
            >
              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-serif font-bold text-[#111b5e] border-b border-stone-100"
              >
                Home
              </a>
              <a href="/society" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-serif font-semibold text-stone-900 border-b border-stone-100">
                About Society
              </a>
              <a href="/institutions" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-serif font-semibold text-stone-900 border-b border-stone-100">
                Our 3 Campuses
              </a>

              {/* Academics in Mobile */}
              <div className="py-2 border-b border-stone-100">
                <a href="/academics" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-serif font-semibold text-stone-900 mb-1.5">
                  Academics & Curricula
                </a>
                <div className="pl-3 space-y-1.5 text-xs text-stone-600">
                  <a href="/batch-photos" onClick={() => setMobileMenuOpen(false)} className="block text-[#111b5e] font-bold">
                    Batch Photos Archive (97 Photos)
                  </a>
                  <a href="/admissions" onClick={() => setMobileMenuOpen(false)} className="block text-stone-600 hover:text-stone-900">
                    Online Admissions 2026-27
                  </a>
                  <a href="/academics" onClick={() => setMobileMenuOpen(false)} className="block text-stone-600 hover:text-stone-900">
                    Programs & Science Labs
                  </a>
                </div>
              </div>

              <a href="/faculty" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-serif font-semibold text-amber-800 border-b border-stone-100 flex items-center justify-between">
                <span>Faculty & Mentors Directory</span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">92+ Educators</span>
              </a>
              {(!authUser || isFaculty) && <a href={isFaculty ? facultyProfileHref : '/faculty/login'} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-serif font-semibold text-stone-900 border-b border-stone-100 flex items-center justify-between">
                <span>{isFaculty ? 'My Faculty Profile' : 'Faculty Portal'}</span>
                <span className="text-[10px] font-mono text-stone-500">{isFaculty ? 'View / Edit Profile' : 'Login / Register'}</span>
              </a>}
              <a href="/magazine" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-serif font-semibold text-stone-900 border-b border-stone-100">
                Daily Magazine
              </a>
              <a href="/alumni" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-serif font-semibold text-stone-900 border-b border-stone-100">
                Alumni Sanctuary
              </a>
              <a href="/notices" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-serif font-semibold text-stone-900 border-b border-stone-100">
                Notices & Circulars
              </a>
              <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-serif font-semibold text-stone-900 border-b border-stone-100">
                Contact & Helplines
              </a>

              <div className="pt-2 flex flex-col gap-2">
                <a href={isAlumni ? alumniProfileHref : '/alumni/register'} onClick={() => setMobileMenuOpen(false)} className="w-full text-center bg-[#111b5e] text-white py-2.5 rounded-xl text-sm font-serif font-bold shadow-sm">
                  {isAlumni ? 'My Alumni Profile' : 'Register as Alumni'}
                </a>
                {isAlumni && <a href="/alumni/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center border border-stone-300 py-2 rounded-xl text-sm font-serif font-semibold text-stone-700">
                  Manage My Profile
                </a>}
                {!authUser && <a href="/account/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center border border-stone-300 py-2 rounded-xl text-sm font-serif font-semibold text-stone-700">
                  Alumni Login
                </a>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
