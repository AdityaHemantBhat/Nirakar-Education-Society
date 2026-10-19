import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import {
  FacultyMember,
  DEPARTMENTS,
  INSTITUTION_OPTIONS,
} from '../data/facultyData.js';
import { CustomSelect } from '../components/CustomSelect.js';
import { SocialIconsBar } from '../components/SocialIcons.js';
import { getInitialsAvatar } from '../utils/avatarUtils.js';
import {
  GraduationCap,
  Search,
  BookOpen,
  Award,
  Building2,
  Phone,
  Clock,
  Sparkles,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  X,
  MessageCircle,
  Lock,
  Edit3,
} from 'lucide-react';
import { slugify } from '../utils/slugify.js';

export const FacultyPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [selectedInstitution, setSelectedInstitution] = useState<string>(() => {
    const campus = searchParams.get('campus');
    return INSTITUTION_OPTIONS.some((institution) => institution.code === campus) ? campus! : 'ALL';
  });
  const [selectedDept, setSelectedDept] = useState<string>(() => {
    const department = searchParams.get('dept');
    return DEPARTMENTS.includes(department || '') ? department! : 'All Departments';
  });

  // Pagination State - strictly 8 items per page
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const directoryRef = useRef<HTMLDivElement>(null);

  // The directory is sourced only from published faculty records in the API.
  const {
    data: apiFaculty = [],
    isLoading: isFacultyLoading,
    isError: isFacultyError,
    refetch: refetchFaculty,
  } = useQuery({
    queryKey: ['faculty_published'],
    queryFn: async () => {
      const res = await fetch('/api/v1/faculty');
      if (!res.ok) throw new Error('Failed to load faculty records.');
      const json = await res.json();
      if (!Array.isArray(json.data)) throw new Error('Invalid faculty records response.');
      return json.data;
    },
    staleTime: 60 * 1000,
  });

  
  const allFaculty: FacultyMember[] = useMemo(() => {
    return apiFaculty.map((item: any): FacultyMember => {
      const toggles = (item.publicContactToggles || {}) as any;
      const name =
        item.name ||
        toggles.name ||
        toggles.fullName ||
        (toggles.firstName && toggles.lastName ? `${toggles.firstName} ${toggles.lastName}` : '') ||
        (item.user?.username
          ? item.user.username.startsWith('Prof.') ||
            item.user.username.startsWith('Dr.') ||
            item.user.username.startsWith('Mr.') ||
            item.user.username.startsWith('Mrs.')
            ? item.user.username
            : `Prof. ${item.user.username}`
          : '') ||
        (toggles.email
          ? toggles.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          : '');

      return {
        id: item.id,
        name,
        designation: item.designation || '',
        department: item.department || '',
        institutionCode: item.institutionCode,
        institutionName:
          item.institutionName ||
          INSTITUTION_OPTIONS.find((institution) => institution.code === item.institutionCode)?.name ||
          item.institutionCode ||
          '',
        qualification: item.qualification || '',
        experience: item.experience || '',
        experienceYears: parseInt(item.experience) || 0,
        subjects: Array.isArray(item.subjects) ? item.subjects : [],
        bio: item.bio || '',
        photoUrl: item.photoUrl || '',
        achievements: Array.isArray(item.achievements) ? item.achievements : item.achievements ? [item.achievements] : [],
        email: toggles.showEmail !== false ? (toggles.email || item.email || item.user?.email) : undefined,
        phone: toggles.showPhone !== false ? (toggles.phone || item.phone) : undefined,
        isHead: Boolean(toggles.isHead || item.isHead),
      };
    });
  }, [apiFaculty]);

  // Filtered Faculty List
  const filteredFaculty = useMemo(() => {
    return allFaculty.filter((f) => {
      const matchInst =
        selectedInstitution === 'ALL' || f.institutionCode === selectedInstitution;
      const matchDept =
        selectedDept === 'All Departments' || f.department.toLowerCase().includes(selectedDept.toLowerCase());
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.designation.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q) ||
        f.qualification.toLowerCase().includes(q) ||
        f.subjects.some((s) => s.toLowerCase().includes(q));

      return matchInst && matchDept && matchSearch;
    });
  }, [allFaculty, selectedInstitution, selectedDept, search]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedInstitution, selectedDept]);

  // Pagination calculation - strictly 8 items per page
  const totalPages = Math.max(1, Math.ceil(filteredFaculty.length / ITEMS_PER_PAGE));
  const paginatedFaculty = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFaculty.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFaculty, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (directoryRef.current) {
      directoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>Teaching & Administrative Faculty Directory | Shree Nirakar Education Society</title>
        <meta
          name="description"
          content="Meet the distinguished educators, subject specialists, and laboratory mentors across Shri Nirakar High School, Tudal High School, and S. S. Angle Higher Secondary School."
        />
      </Helmet>

      <Navbar />

      {/* Hero Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="w-full max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-flex items-center gap-1.5">
                <GraduationCap size={13} />
                <span>Academic Leadership & Mentorship</span>
              </span>
              <span className="text-xs font-mono text-stone-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 hidden sm:inline-block">
                {allFaculty.length} Educators Across 3 Campuses
              </span>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Distinguished Teaching & Mentorship Faculty
          </h1>

          <p className="text-stone-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            The foundation of Shree Nirakar Education Society's excellence. Meet the dedicated educators, department heads, and laboratory mentors shaping generations of scholars across Shri Nirakar High School (Mashem), Tudal High School (Gaondongrem), and S. S. Angle Higher Secondary School (Dapot).
          </p>
        </div>
      </div>

      {/* SVG Curve finishing the hero banner with smooth organic transition */}
      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      {/* MAIN CONTAINER */}
      <main ref={directoryRef} className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 space-y-8">
        
        {/* MINIMAL FILTER & SEARCH TOOLBAR (Optimized for 2GB/4GB RAM with crisp styling) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teachers by name, subject, or qualification..."
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 placeholder:text-stone-400 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Department Dropdown Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-serif font-semibold text-stone-500 hidden sm:inline">Department:</span>
              <CustomSelect
                value={selectedDept}
                onChange={(val) => setSelectedDept(val)}
                options={DEPARTMENTS}
                align="right"
                className="min-w-[190px] sm:min-w-[220px]"
                menuClassName="!min-w-[280px] sm:!min-w-[300px]"
              />
            </div>
          </div>

          {/* Campus Quick Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-stone-100 scrollbar-none">
            {INSTITUTION_OPTIONS.map((inst) => {
              const count =
                inst.code === 'ALL'
                  ? allFaculty.length
                  : allFaculty.filter((f) => f.institutionCode === inst.code).length;

              const isSelected = selectedInstitution === inst.code;

              return (
                <button
                  key={inst.code}
                  type="button"
                  onClick={() => setSelectedInstitution(inst.code)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0b132b] text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                  }`}
                >
                  <Building2 size={13} className={isSelected ? 'text-amber-300' : 'text-stone-400'} />
                  <span>{inst.name}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULTS SUMMARY BAR */}
        <div className="flex items-center justify-between text-xs font-mono text-stone-500 px-1">
          <div>
            Showing <strong className="text-stone-900">{filteredFaculty.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</strong> to <strong className="text-stone-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredFaculty.length)}</strong> of <strong className="text-stone-900">{filteredFaculty.length}</strong> educators
            {selectedInstitution !== 'ALL' && (
              <span className="hidden sm:inline"> in {INSTITUTION_OPTIONS.find((i) => i.code === selectedInstitution)?.name}</span>
            )}
            {selectedDept !== 'All Departments' && <span className="hidden sm:inline"> | {selectedDept}</span>}
          </div>

          {(search || selectedInstitution !== 'ALL' || selectedDept !== 'All Departments') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedInstitution('ALL');
                setSelectedDept('All Departments');
              }}
              className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* FACULTY CARDS GRID - STRICTLY 8 VISIBLE ITEMS (Ultra-clean, minimal, heavenly layout) */}
        {isFacultyLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 sm:gap-7"
            role="status"
            aria-label="Loading faculty"
          >
            {Array.from({ length: ITEMS_PER_PAGE }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                <div className="h-11 border-b border-stone-100 bg-stone-50 px-4 py-3">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-stone-200" />
                </div>
                <div className="p-4 pb-2">
                  <div className="aspect-[4/3] animate-pulse rounded-xl bg-stone-100" />
                </div>
                <div className="space-y-3 p-4 pt-1">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-stone-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
                  <div className="flex gap-2">
                    <div className="h-5 w-24 animate-pulse rounded-md bg-stone-100" />
                    <div className="h-5 w-20 animate-pulse rounded-md bg-stone-100" />
                  </div>
                  <div className="h-8" />
                  <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
                </div>
                <div className="h-12 border-t border-stone-100 bg-stone-50/70" />
              </div>
            ))}
          </div>
        ) : isFacultyError ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto space-y-3 border border-stone-200 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-stone-900">Faculty Records Unavailable</h3>
            <p className="text-xs text-stone-500 font-sans leading-relaxed">
              Faculty records could not be loaded from the database. Please try again.
            </p>
            <button
              onClick={() => void refetchFaculty()}
              className="px-4 py-2 bg-[#0b132b] text-white rounded-xl text-xs font-serif font-bold hover:bg-[#16247e] transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : paginatedFaculty.length === 0 ? (
          <div className="w-full bg-white rounded-3xl p-12 text-center space-y-3 border border-stone-200 shadow-sm">
            <GraduationCap size={40} className="mx-auto text-stone-300" />
            <h3 className="font-serif text-lg font-bold text-stone-900">
              {allFaculty.length === 0 ? 'No Faculty Records Available' : 'No Faculty Match Found'}
            </h3>
            <p className="text-xs text-stone-500 font-sans leading-relaxed">
              {allFaculty.length === 0
                ? 'There are no published faculty records in the database.'
                : 'No faculty members match your filter criteria. Try adjusting your query or resetting the filters.'}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedInstitution('ALL');
                setSelectedDept('All Departments');
              }}
              className="px-4 py-2 bg-[#0b132b] text-white rounded-xl text-xs font-serif font-bold hover:bg-[#16247e] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 sm:gap-7">
            {paginatedFaculty.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-stone-200/90 hover:border-amber-500/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group text-left"
              >
                {/* 1. Academic Institution Header Bar */}
                <div className="px-4 py-3 bg-stone-50/90 border-b border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Building2 size={13} className="text-amber-700 shrink-0" />
                    <span className="text-[11px] font-serif font-bold text-stone-800 truncate" title={member.institutionName}>
                      {member.institutionName}
                    </span>
                  </div>
                  {member.isHead && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-900 bg-amber-100/90 border border-amber-300/70 px-2 py-0.5 rounded-md shrink-0">
                      <Award size={11} className="text-amber-700" />
                      HOD
                    </span>
                  )}
                </div>

                {/* 2. Full portrait over a soft blurred fill to avoid empty side bars. */}
                <div className="p-4 pb-2">
                  <Link
                    to={`/faculty/${slugify(member.name)}`}
                    className="block relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-xs group/img"
                  >
                    {member.photoUrl && (
                      <img
                        src={member.photoUrl}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
                      />
                    )}
                    <img
                      src={member.photoUrl || getInitialsAvatar(member.name)}
                      alt={member.name}
                      loading="lazy"
                      decoding="async"
                      className="relative z-10 w-full h-full object-contain object-center"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getInitialsAvatar(member.name);
                      }}
                    />
                  </Link>
                </div>

                {/* 3. Educator Credentials & Faculty Dossier */}
                <div className="p-4 pt-1 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <Link
                      to={`/faculty/${slugify(member.name)}`}
                      className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors leading-snug block no-underline"
                    >
                      {member.name}
                    </Link>

                    {/* Department & Role */}
                    <div className="flex items-center gap-1.5 text-xs font-serif font-semibold text-amber-800">
                      <GraduationCap size={13} className="shrink-0 text-amber-700" />
                      <span>{member.designation}</span>
                      <span className="text-stone-300">|</span>
                      <span className="text-stone-600 font-sans text-[11px] font-normal truncate">{member.department}</span>
                    </div>

                    {/* Credentials & Pedagogy Experience */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200/70 font-mono">
                        {member.qualification}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/70 font-mono font-medium">
                        <Clock size={11} className="text-amber-700" />
                        {member.experience}
                      </span>
                    </div>
                  </div>

                  {/* Real Lucide Social & Research Icons Bar */}
                  <div className="pt-1 pb-1">
                    <SocialIconsBar links={member.socialLinks} size="sm" theme="light" />
                  </div>

                  {/* Academic Subjects */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {member.subjects.slice(0, 3).map((sub, i) => (
                        <span
                          key={i}
                          className="bg-stone-50 text-stone-700 text-[10px] font-sans px-2 py-0.5 rounded-md border border-stone-200/70"
                        >
                          {sub}
                        </span>
                      ))}
                      {member.subjects.length > 3 && (
                        <span className="text-[10px] font-mono text-stone-400 px-1 py-0.5">
                          +{member.subjects.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Devotion Bio */}
                  <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-2">
                    {member.bio}
                  </p>
                </div>

                {/* 4. Action Footer */}
                <div className="p-3.5 border-t border-stone-100 flex items-center justify-between gap-2 bg-stone-50/70">
                  <Link
                    to={`/faculty/${slugify(member.name)}`}
                    className="text-xs font-serif font-bold text-stone-700 group-hover:text-amber-800 flex items-center gap-1 transition-colors no-underline"
                  >
                    <span>Full Profile</span>
                    <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to={`/faculty/${slugify(member.name)}?message=1`}
                    className="inline-flex items-center gap-1.5 text-xs font-serif font-bold bg-[#0b132b] hover:bg-[#16247e] text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <MessageCircle size={12} />
                    <span>Message</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CLEAN MINIMAL PAGINATION CONTROLS (Strictly 8 items per page) */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200">
            <div className="text-xs font-mono text-stone-500 order-2 sm:order-1">
              Page <strong className="text-stone-900">{currentPage}</strong> of <strong className="text-stone-900">{totalPages}</strong> ({filteredFaculty.length} educators total)
            </div>

            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-colors cursor-pointer ${
                  currentPage === 1
                    ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400'
                    : 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 shadow-xs'
                }`}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {/* Numeric Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#0b132b] text-white shadow-xs'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span key={pageNum} className="px-1 text-stone-400 font-mono text-xs select-none">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-colors cursor-pointer ${
                  currentPage === totalPages
                    ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400'
                    : 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 shadow-xs'
                }`}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Compact Academic Governance & Faculty Accreditation Strip (Small, Sleek, Refined) */}
        <section className="mt-12 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <GraduationCap size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-sm font-bold text-stone-900 leading-snug">
                Accredited Faculty & Academic Governance
              </h3>
              <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
                Directly overseen by the Directorate of Education, Government of Goa & Shree Nirakar Academic Council.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <Link
              to="/contact"
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-serif font-semibold transition-colors"
            >
              Academic Inquiries
            </Link>
            <Link
              to="/faculty/login"
              className="px-4 py-2 bg-[#0b132b] hover:bg-[#16247e] text-white rounded-xl text-xs font-serif font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Lock size={12} className="text-amber-300" />
              <span>Staff Login</span>
            </Link>
          </div>
        </section>

      </main>



      <Footer />
    </div>
  );
};

export default FacultyPage;
