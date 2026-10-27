import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CurrentAuthUser } from '../hooks/useCurrentAuthUser.js';

interface MegaMenuPanelsProps {
  activeMenu: string | null;
  onClose?: () => void;
  authUser: CurrentAuthUser | null;
}

export const MegaMenuPanels: React.FC<MegaMenuPanelsProps> = ({ activeMenu, onClose, authUser }) => {
  const navigate = useNavigate();
  const isFaculty = authUser?.role === 'FACULTY';
  const isAlumni = authUser?.role === 'ALUMNI';
  const facultyProfileHref = authUser?.facultyProfile?.id
    ? `/faculty/${authUser.facultyProfile.id}`
    : '/faculty/dashboard';
  const alumniProfileHref = `/alumni/${authUser?.alumniProfile?.username || authUser?.username || ''}`;

  const handleSocietyNav = (e: React.MouseEvent<HTMLAnchorElement>, tab: string, hash?: string) => {
    if (onClose) onClose();
    const targetUrl = `/society?tab=${tab}${hash ? '#' + hash : ''}`;
    if (window.location.pathname === '/society') {
      e.preventDefault();
      navigate(targetUrl);
      window.dispatchEvent(new CustomEvent('society-tab-switch', { detail: { tab, hash } }));
    }
  };
  return (
    <>
      {/* 1. FACULTY MEGA MENU */}
      {activeMenu === 'faculty' && (
        <div className="w-full bg-white shadow-2xl border-b border-stone-200/90 overflow-hidden">
          <div className="w-full px-6 sm:px-10 lg:px-14 pt-[74px] sm:pt-[82px] lg:pt-[90px] pb-8 lg:pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Minimalist Column (Span 3) */}
            <div className="lg:col-span-3 lg:border-r lg:border-stone-200/80 pr-0 lg:pr-8 flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-stone-100 text-stone-600 border border-stone-200/70 mb-2.5">
                  ACADEMIC LEADERSHIP
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Faculty
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 font-sans leading-relaxed mt-2.5 max-w-xs">
                  Meet the dedicated educators, laboratory specialists, and institutional leaders shaping scholars across Mashem and Gaondongrem.
                </p>
              </div>
              <a
                href="/faculty"
                className="pt-4 border-t border-stone-100 text-xs sm:text-[12.5px] font-mono font-bold tracking-wider uppercase text-[#111b5e] hover:text-amber-700 inline-flex items-center gap-1.5 transition-colors group"
              >
                <span>FACULTY OVERVIEW</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform text-amber-600" />
              </a>
            </div>

            {/* Right Columns (Span 9, 3 Columns) */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  TEACHING DIRECTORY
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a href="/faculty" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      All-Campus Faculty Directory
                    </a>
                  </li>
                  <li>
                    <a href="/faculty?campus=NIRAKAR_HS" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Shri Nirakar High School Teachers
                    </a>
                  </li>
                  <li>
                    <a href="/faculty?campus=ANGLE_HSS" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      S.S. Angle Higher Secondary Lecturers
                    </a>
                  </li>
                  <li>
                    <a href="/faculty?campus=TUDAL_HS" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Tudal High School Rural Educators
                    </a>
                  </li>
                  <li>
                    <a href="/faculty?q=Robotics" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Laboratory & ATL Robotics Mentors
                    </a>
                  </li>
                  <li>
                    <a href="/faculty?dept=Athletics%20%26%20Physical%20Education" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Physical Education & Sports Coaches
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  FACULTY PORTAL
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  {(!authUser || isFaculty) && <li>
                    <a href={isFaculty ? facultyProfileHref : '/faculty/login'} className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      {isFaculty ? 'My Faculty Profile' : 'Faculty Portal Sign In'}
                    </a>
                  </li>}
                  {isFaculty && <li>
                    <a href="/faculty/dashboard" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Faculty Dashboard & Messages
                    </a>
                  </li>}
                  <li>
                    <a href="/notices" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      School Notices & Circulars
                    </a>
                  </li>
                </ul>
              </div>

              {!authUser && <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  EDUCATOR ONBOARDING
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a href="/faculty/register" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      New Educator Registration
                    </a>
                  </li>
                  <li>
                    <a href="/academics" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Academic Framework & Pedagogy
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Contact the Society Office
                    </a>
                  </li>
                </ul>
              </div>}
            </div>
          </div>

          {/* Minimal Sub-Footer */}
          <div className="border-t border-stone-100 bg-stone-50/95 px-6 sm:px-10 lg:px-14 py-3 flex flex-wrap items-center justify-between text-xs font-mono text-stone-600 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>92+ Accredited Faculty Members across 3 Canacona Campuses</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/faculty" className="hover:text-stone-900 transition-colors">Directory</a>
              <span>•</span>
              {(!authUser || isFaculty) && <a href={isFaculty ? facultyProfileHref : '/faculty/login'} className="hover:text-stone-900 transition-colors">{isFaculty ? 'My Profile' : 'Staff Login'}</a>}
              {!authUser && <><span>•</span><a href="/faculty/register" className="hover:text-stone-900 transition-colors">Register</a></>}
            </div>
          </div>
          {/* Continuous Dual Golden Accent Edge (Seamless, No Transparent BG) */}
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent" />
        </div>
      )}

      {/* 2. ACADEMICS MEGA MENU */}
      {activeMenu === 'academics' && (
        <div className="w-full bg-white shadow-2xl border-b border-stone-200/90 overflow-hidden">
          <div className="w-full px-6 sm:px-10 lg:px-14 pt-[74px] sm:pt-[82px] lg:pt-[90px] pb-8 lg:pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Minimalist Column (Span 3) */}
            <div className="lg:col-span-3 lg:border-r lg:border-stone-200/80 pr-0 lg:pr-8 flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-stone-100 text-stone-600 border border-stone-200/70 mb-2.5">
                  LEARNING AT NIRAKAR
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Academics
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 font-sans leading-relaxed mt-2.5 max-w-xs">
                  Explore our academic framework, Goa Board secondary and higher secondary curricula, science laboratories, and learning resources.
                </p>
              </div>
              <a
                href="/academics"
                className="pt-4 border-t border-stone-100 text-xs sm:text-[12.5px] font-mono font-bold tracking-wider uppercase text-[#111b5e] hover:text-amber-700 inline-flex items-center gap-1.5 transition-colors group"
              >
                <span>ACADEMICS OVERVIEW</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform text-amber-600" />
              </a>
            </div>

            {/* Right Columns (Span 9, 3 Columns) */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  ACADEMIC RESOURCES
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a href="/academics" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Academics Overview
                    </a>
                  </li>
                  <li>
                    <a href="/academics#secondary-education" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Goa Board SSC Curriculum (Classes 8–10)
                    </a>
                  </li>
                  <li>
                    <a href="/academics#higher-secondary" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Senior Secondary (Science, Arts, Commerce)
                    </a>
                  </li>
                  <li>
                    <a href="/academics#secondary-education" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Modern Science & Wet Laboratories
                    </a>
                  </li>
                  <li>
                    <a href="/society?tab=vision#amenities" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Atal Tinkering Innovation Lab (ATL)
                    </a>
                  </li>
                  <li>
                    <a href="/society?tab=vision#amenities" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Central Society Library & Archives
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  TEACHING & LEARNING
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a href="/academics#secondary-education" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Curriculum & Teaching Approach
                    </a>
                  </li>
                  <li>
                    <a href="/library" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Digital Library &amp; Textbooks (Std V–XII)
                    </a>
                  </li>
                  <li>
                    <a href="/results" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Academic Results &amp; Toppers (Std V–XII)
                    </a>
                  </li>
                  <li>
                    <a href="/academics#evaluation-policy" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      System of Continuous Evaluation (CCE)
                    </a>
                  </li>
                  <li>
                    <a href="/notices" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      School Notices & Academic Updates
                    </a>
                  </li>
                  <li>
                    <a href="/notices?search=term" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Term Examination Schedule
                    </a>
                  </li>
                  <li>
                    <a href="/events?search=Merit" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Goa Board Merit Felicitations
                    </a>
                  </li>
                  <li>
                    <a href="/notices?search=Enrollment" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      NEET & JEE Foundation Enrollment
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  ENROLLMENT & FACULTY
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a href="/admissions#application-form" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Online Admissions 2026-27
                    </a>
                  </li>
                  <li>
                    <a href="/admissions#application-form" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Admission Application Form
                    </a>
                  </li>
                  <li>
                    <a href="/notices?search=Scholarship" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Government Scholarship Notice
                    </a>
                  </li>
                  <li>
                    <a href="/faculty" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Teaching Faculty Directory
                    </a>
                  </li>
                  <li>
                    <a href={isFaculty ? facultyProfileHref : '/faculty/login'} className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      {isFaculty ? 'My Faculty Profile' : 'Faculty Portal Sign In'}
                    </a>
                  </li>
                  <li>
                    <a href="/gallery" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5 font-medium text-amber-800">
                      Campus Photo Gallery (All 3 Institutions)
                    </a>
                  </li>
                  <li>
                    <a href="/batch-photos" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Historical Batch Photos (1968–2026)
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Minimal Sub-Footer */}
          <div className="border-t border-stone-100 bg-stone-50/95 px-6 sm:px-10 lg:px-14 py-3 flex flex-wrap items-center justify-between text-xs font-mono text-stone-600 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Goa Board Index: SSC 08.006 • HSSC 08.06 • Mashem & Gaondongrem</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/admissions" className="hover:text-stone-900 transition-colors">Admissions Open</a>
              <span>•</span>
              <a href="/academics" className="hover:text-stone-900 transition-colors">Curricula</a>
              <span>•</span>
              <a href="/contact" className="hover:text-stone-900 transition-colors">Office: +91 832 2643236</a>
            </div>
          </div>
          {/* Continuous Dual Golden Accent Edge (Seamless, No Transparent BG) */}
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent" />
        </div>
      )}

      {/* 3. SOCIETY MEGA MENU */}
      {activeMenu === 'society' && (
        <div className="w-full bg-white shadow-2xl border-b border-stone-200/90 overflow-hidden">
          <div className="w-full px-6 sm:px-10 lg:px-14 pt-[74px] sm:pt-[82px] lg:pt-[90px] pb-8 lg:pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Minimalist Column (Span 3) */}
            <div className="lg:col-span-3 lg:border-r lg:border-stone-200/80 pr-0 lg:pr-8 flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-stone-100 text-stone-600 border border-stone-200/70 mb-2.5">
                  ESTABLISHED 1939
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Society
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 font-sans leading-relaxed mt-2.5 max-w-xs">
                  Founded in Mashem to deliver accessible, value-grounded schooling and moral leadership to generations of rural scholars across Canacona.
                </p>
              </div>
              <a
                href="/society?tab=vision"
                onClick={(e) => handleSocietyNav(e, 'vision')}
                className="pt-4 border-t border-stone-100 text-xs sm:text-[12.5px] font-mono font-bold tracking-wider uppercase text-[#111b5e] hover:text-amber-700 inline-flex items-center gap-1.5 transition-colors group"
              >
                <span>SOCIETY OVERVIEW</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform text-amber-600" />
              </a>
            </div>

            {/* Right Columns (Span 9, 3 Columns) */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  HERITAGE & CHARTER
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a
                      href="/society?tab=history#chronicle"
                      onClick={(e) => handleSocietyNav(e, 'history', 'chronicle')}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Society History & Charter (1939–2026)
                    </a>
                  </li>
                  <li>
                    <a
                      href="/society?tab=vision#pillars"
                      onClick={(e) => handleSocietyNav(e, 'vision', 'pillars')}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Vision, Mission & Core Values
                    </a>
                  </li>
                  <li>
                    <a
                      href="/society?tab=vision#anthem"
                      onClick={(e) => handleSocietyNav(e, 'vision', 'anthem')}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Society Anthem & Motto Inscription
                    </a>
                  </li>
                  <li>
                    <a
                      href="/society?tab=history#pioneers"
                      onClick={(e) => handleSocietyNav(e, 'history', 'pioneers')}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Founding Trustees & Pioneers
                    </a>
                  </li>
                  <li>
                    <a
                      href="/society?tab=history#milestones"
                      onClick={(e) => handleSocietyNav(e, 'history', 'milestones')}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      85+ Years of Dedicated Service
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  GOVERNANCE & TRUST
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a
                      href="/society?tab=governance#council"
                      onClick={(e) => handleSocietyNav(e, 'governance', 'council')}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Governing Council & Office Bearers
                    </a>
                  </li>
                  <li>
                    <a
                      href="/society?tab=governance#managing-committee"
                      onClick={(e) => handleSocietyNav(e, 'governance', 'managing-committee')}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Managing Committee & Trustees
                    </a>
                  </li>
                  <li>
                    <a
                      href="/society?tab=vision#registry"
                      onClick={(e) => handleSocietyNav(e, 'vision', 'registry')}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Registered Trust Under Societies Act
                    </a>
                  </li>
                  <li>
                    <a
                      href="/society?tab=governance#meetings"
                      onClick={(e) => handleSocietyNav(e, 'governance', 'meetings')}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Annual General Body Meetings
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy"
                      onClick={() => onClose?.()}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Statutory Gazette & Disclosures
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  COMMUNITY & REACH
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a
                      href="/contact"
                      onClick={() => onClose?.()}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Central Secretariat (Mashem Campus)
                    </a>
                  </li>
                  <li>
                    <a
                      href="/grievance-redressal"
                      onClick={() => onClose?.()}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Grievance Redressal
                    </a>
                  </li>
                  <li>
                    <a
                      href="/society?tab=vision#amenities"
                      onClick={(e) => handleSocietyNav(e, 'vision', 'amenities')}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Central Library & Archives
                    </a>
                  </li>
                  <li>
                    <a
                      href="/society?tab=vision#sports-pavilion"
                      onClick={(e) => handleSocietyNav(e, 'vision', 'sports-pavilion')}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Athletics Grounds & Sports Pavilion
                    </a>
                  </li>
                  <li>
                    <a
                      href="/notices"
                      onClick={() => onClose?.()}
                      className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5"
                    >
                      Official Circulars & Notices
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Minimal Sub-Footer */}
          <div className="border-t border-stone-100 bg-stone-50/95 px-6 sm:px-10 lg:px-14 py-3 flex flex-wrap items-center justify-between text-xs font-mono text-stone-600 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Registered Society No. 128/Goa • Mashem, Canacona, South Goa</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/society" className="hover:text-stone-900 transition-colors">History</a>
              <span>•</span>
              <a href="/privacy" className="hover:text-stone-900 transition-colors">Statutory Gazette</a>
              <span>•</span>
              <a href="/contact" className="hover:text-stone-900 transition-colors">Secretariat: +91 832 2643236</a>
            </div>
          </div>
          {/* Continuous Dual Golden Accent Edge (Seamless, No Transparent BG) */}
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent" />
        </div>
      )}

      {/* 4. CAMPUSES MEGA MENU */}
      {activeMenu === 'campuses' && (
        <div className="w-full bg-white shadow-2xl border-b border-stone-200/90 overflow-hidden">
          <div className="w-full px-6 sm:px-10 lg:px-14 pt-[74px] sm:pt-[82px] lg:pt-[90px] pb-8 lg:pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Minimalist Column (Span 3) */}
            <div className="lg:col-span-3 lg:border-r lg:border-stone-200/80 pr-0 lg:pr-8 flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-stone-100 text-stone-600 border border-stone-200/70 mb-2.5">
                  3 CANACONA INSTITUTIONS
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Campuses
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 font-sans leading-relaxed mt-2.5 max-w-xs">
                  Providing continuous quality schooling from Standard 5th through senior secondary science, commerce, and arts across Canacona Taluka.
                </p>
              </div>
              <a
                href="/institutions"
                className="pt-4 border-t border-stone-100 text-xs sm:text-[12.5px] font-mono font-bold tracking-wider uppercase text-[#111b5e] hover:text-amber-700 inline-flex items-center gap-1.5 transition-colors group"
              >
                <span>ALL INSTITUTIONS OVERVIEW</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform text-amber-600" />
              </a>
            </div>

            {/* Right Columns (Span 9, 3 Columns) */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  SHRI NIRAKAR HIGH SCHOOL
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a href="/institutions/nirakar-high-school" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Mashem Flagship Campus (Estd. 1968)
                    </a>
                  </li>
                  <li>
                    <a href="/institutions/nirakar-high-school" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Secondary SSC Program (Classes 5–10)
                    </a>
                  </li>
                  <li>
                    <a href="/institutions/nirakar-high-school" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Atal Tinkering Robotics Lab (ATL)
                    </a>
                  </li>
                  <li>
                    <a href="/batch-photos" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Class Batch Photos Archive (1968–2026)
                    </a>
                  </li>
                  <li>
                    <a href="/magazine" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Daily School Magazine Editions
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  S.S. ANGLE HIGHER SECONDARY
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a href="/institutions/angle-higher-secondary" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Dapot Collegiate Campus (Estd. 1993)
                    </a>
                  </li>
                  <li>
                    <a href="/institutions/angle-higher-secondary" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Higher Secondary Science (PCMB/CS)
                    </a>
                  </li>
                  <li>
                    <a href="/institutions/angle-higher-secondary" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Commerce & Accountancy Stream
                    </a>
                  </li>
                  <li>
                    <a href="/institutions/angle-higher-secondary" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Arts & Goan Humanities Stream
                    </a>
                  </li>
                  <li>
                    <a href="/institutions/angle-higher-secondary" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Pre-Medical & Engineering Cell
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  TUDAL HIGH SCHOOL
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a href="/institutions/tudal-high-school" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Gaondongrem Rural Mission (Estd. 1989)
                    </a>
                  </li>
                  <li>
                    <a href="/institutions/tudal-high-school" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Sahyadri Foothills Secondary Classes
                    </a>
                  </li>
                  <li>
                    <a href="/institutions/tudal-high-school" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Tribal Community Education Mission
                    </a>
                  </li>
                  <li>
                    <a href="/institutions/tudal-high-school" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Goan Folk Arts & Theatre Traditions
                    </a>
                  </li>
                  <li>
                    <a href="/institutions/tudal-high-school" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Student Midday Nutrition Program
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Minimal Sub-Footer */}
          <div className="border-t border-stone-100 bg-stone-50/95 px-6 sm:px-10 lg:px-14 py-3 flex flex-wrap items-center justify-between text-xs font-mono text-stone-600 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>3 Recognized Centers • Mashem, Dapot & Gaondongrem, Canacona</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/institutions" className="hover:text-stone-900 transition-colors">Campuses</a>
              <span>•</span>
              <a href="/batch-photos" className="hover:text-stone-900 transition-colors">Batch Photos</a>
              <span>•</span>
              <a href="/contact" className="hover:text-stone-900 transition-colors">Desk: +91 832 2643236</a>
            </div>
          </div>
          {/* Continuous Dual Golden Accent Edge (Seamless, No Transparent BG) */}
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent" />
        </div>
      )}

      {/* 5. ALUMNI MEGA MENU */}
      {activeMenu === 'alumni' && (
        <div className="w-full bg-white shadow-2xl border-b border-stone-200/90 overflow-hidden">
          <div className="w-full px-6 sm:px-10 lg:px-14 pt-[74px] sm:pt-[82px] lg:pt-[90px] pb-8 lg:pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Minimalist Column (Span 3) */}
            <div className="lg:col-span-3 lg:border-r lg:border-stone-200/80 pr-0 lg:pr-8 flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-stone-100 text-stone-600 border border-stone-200/70 mb-2.5">
                  GLOBAL NIRAKARIAN NETWORK
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Alumni
                </h3>
                <p className="text-xs sm:text-[13px] text-stone-600 font-sans leading-relaxed mt-2.5 max-w-xs">
                  Connecting over 16,500 graduates from 1968 to 2026 across Goa, India, and overseas chapters.
                </p>
              </div>
              <a
                href="/alumni"
                className="pt-4 border-t border-stone-100 text-xs sm:text-[12.5px] font-mono font-bold tracking-wider uppercase text-[#111b5e] hover:text-amber-700 inline-flex items-center gap-1.5 transition-colors group"
              >
                <span>ALUMNI OVERVIEW</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform text-amber-600" />
              </a>
            </div>

            {/* Right Columns (Span 9, 3 Columns) */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  ALUMNI COMMUNITY
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a href="/alumni" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Alumni Directory
                    </a>
                  </li>
                  <li>
                    <a href="/alumni/community" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Alumni Commons — community posts
                    </a>
                  </li>
                  <li>
                    <a href="/alumni#directory-filters" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Search Alumni by Batch & Campus
                    </a>
                  </li>
                  {(!authUser || isAlumni) && <li>
                    <a href={isAlumni ? alumniProfileHref : '/alumni/login'} className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      {isAlumni ? 'My Alumni Profile' : 'Alumni Member Sign In'}
                    </a>
                  </li>}
                  {(!authUser || isAlumni) && <li>
                    <a href={isAlumni ? '/alumni/dashboard' : '/alumni/login'} className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      {isAlumni ? 'Manage My Alumni Profile' : 'Manage Your Alumni Profile'}
                    </a>
                  </li>}
                  {!authUser && <li>
                    <a href="/alumni/register" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Register Verified Alumni Profile
                    </a>
                  </li>}
                  <li>
                    <a href="/alumni#directory-filters" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Browse Verified Alumni Profiles
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  MEMORIES & REUNIONS
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a href="/batch-photos" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Historical Batch Photo Archive
                    </a>
                  </li>
                  <li>
                    <a href="/batch-photos#batch-filters" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Filter Photos by Campus
                    </a>
                  </li>
                  <li>
                    <a href="/events?search=Alumni" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Annual Alumni Homecoming & Reunion
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <span className="text-xs sm:text-[12px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-3.5 pb-1 border-b border-amber-800/15">
                  ALUMNI RELATIONS
                </span>
                <ul className="space-y-2.5 text-[13.5px] sm:text-sm font-sans font-medium">
                  <li>
                    <a href="/alumni#directory-filters" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Find Alumni by Career
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Contact the Alumni Desk
                    </a>
                  </li>
                  <li>
                    <a href="/alumni#directory-filters" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Find Alumni by Location
                    </a>
                  </li>
                  <li>
                    <a href="/magazine" className="text-stone-700 hover:text-[#111b5e] hover:font-semibold transition-all block py-0.5">
                      Daily Digital Magazine Issues
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Minimal Sub-Footer */}
          <div className="border-t border-stone-100 bg-stone-50/95 px-6 sm:px-10 lg:px-14 py-3 flex flex-wrap items-center justify-between text-xs font-mono text-stone-600 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Nirakar Alumni Association • Mashem Campus, Canacona</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/alumni" className="hover:text-stone-900 transition-colors">Directory</a>
              <span>•</span>
              <a href="/alumni/register" className="hover:text-stone-900 transition-colors">Register Profile</a>
              <span>•</span>
              <a href="/contact" className="hover:text-stone-900 transition-colors">Alumni Desk: +91 832 2643236</a>
            </div>
          </div>
          {/* Continuous Dual Golden Accent Edge (Seamless, No Transparent BG) */}
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/80 to-transparent" />
        </div>
      )}
    </>
  );
};

export default MegaMenuPanels;
