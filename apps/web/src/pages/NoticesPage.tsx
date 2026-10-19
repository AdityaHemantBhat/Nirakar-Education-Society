import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { slugify } from '../utils/slugify.js';
import { decodeNoticeMeta } from '../utils/noticeMeta.js';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { CustomSelect } from '../components/CustomSelect.js';
import { 
  FileText, 
  Download, 
  Calendar, 
  Search, 
  Filter, 
  ShieldCheck, 
  X, 
  Printer, 
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Building2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const ALL_ARCHIVE_NOTICES = [
  {
    id: 'n1',
    refNo: 'NIRAKAR/HS/CIR/0114',
    title: 'Goa Board SSC Examination Form Submission & Document Verification',
    date: '2026-10-18',
    target: 'Shri Nirakar High School • Mashem',
    campusCode: 'NIRAKAR_HS',
    type: 'exam',
    urgent: true,
    fileSize: '1.4 MB',
    pdfUrl: '/documents/ssc_form_notice_2026.pdf',
    description: 'Mandatory submission of birth certificates, Aadhaar verification, and photograph endorsement for March 2027 Goa Board examinations. Please report to the central administrative counter by Oct 30.',
    tapeColor: 'amber' as const,
  },
  {
    id: 'n2',
    refNo: 'ANGLE/HSS/CIR/0092',
    title: 'Enrollment Open: S.S. Angle Higher Secondary (Science, Commerce & Arts)',
    date: '2026-10-15',
    target: 'S. S. Angle Higher Secondary School • Dapot',
    campusCode: 'ANGLE_HSS',
    type: 'admission',
    urgent: true,
    fileSize: '2.8 MB',
    pdfUrl: '/documents/angle_prospectus_2026.pdf',
    description: 'Prospectus, subject combination counseling, and integrated NEET/IIT-JEE foundation coaching enrollments available at the administrative block counter. Merit scholarships applicable.',
    tapeColor: 'sage' as const,
  },
  {
    id: 'n3',
    refNo: 'TUDAL/HS/CIR/0078',
    title: 'State Government Tribal & Rural Student Scholarship Disbursal 2026',
    date: '2026-10-10',
    target: 'Tudal High School • Gaondongrem',
    campusCode: 'TUDAL_HS',
    type: 'scholarship',
    urgent: false,
    fileSize: '950 KB',
    pdfUrl: '/documents/tribal_scholarship_list.pdf',
    description: 'Direct Benefit Transfer (DBT) verification for Goa Social Welfare tribal scholarship beneficiaries. Bank passbook validation and Aadhaar linkage required by end of month.',
    tapeColor: 'lavender' as const,
  },
  {
    id: 'n4',
    refNo: 'SNES/CIR/0065',
    title: 'First Term Examination Schedule for Secondary Standards (Std VIII–X)',
    date: '2026-10-04',
    target: 'All Society Campuses',
    campusCode: 'ALL',
    type: 'exam',
    urgent: false,
    fileSize: '1.1 MB',
    pdfUrl: '/documents/first_term_timetable.pdf',
    description: 'Detailed subject timetable, laboratory practical dates, and internal assessment guidelines published on central school boards and parent-teacher portal.',
    tapeColor: 'amber' as const,
  },
  {
    id: 'n5',
    refNo: 'TUDAL/HS/CIR/0054',
    title: 'Selection Trials for Directorate of Sports Goa State Volleyball Meet',
    date: '2026-09-25',
    target: 'Tudal High School • Gaondongrem',
    campusCode: 'TUDAL_HS',
    type: 'circular',
    urgent: false,
    fileSize: '780 KB',
    pdfUrl: null,
    description: 'Under-17 and Under-19 boys and girls volleyball trials scheduled at Tudal pavilion ground under supervision of physical education faculty.',
    tapeColor: 'rose' as const,
  },
  {
    id: 'n6',
    refNo: 'SNES/CIR/0048',
    title: 'National Cadet Corps (NCC) Navy & Army Wing Annual Enlistment',
    date: '2026-09-12',
    target: 'Shri Nirakar High School • Mashem',
    campusCode: 'NIRAKAR_HS',
    type: 'circular',
    urgent: false,
    fileSize: '1.6 MB',
    pdfUrl: '/documents/ncc_enlistment.pdf',
    description: 'Cadet enlistment drive for Class VIII and IX students with parade drills, camps at Naval Base Karwar, and B/C Certificate bonus points for higher education.',
    tapeColor: 'sage' as const,
  }
];

export const NoticesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [filter, setFilter] = useState<string>('all');
  const [campusFilter, setCampusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch live notices from database API
  const { data: apiNotices = [] } = useQuery<any[]>({
    queryKey: ['public_notices'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/content/notices');
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  // Combine dynamic API notices and archive notices
  const combinedNotices = useMemo(() => {
    const formattedApi = apiNotices.map((n: any, idx: number) => {
      let target = 'All Society Campuses';
      let campusCode = 'ALL';
      if (n.institutionCode === 'NIRAKAR_HS') {
        target = 'Shri Nirakar High School • Mashem';
        campusCode = 'NIRAKAR_HS';
      } else if (n.institutionCode === 'TUDAL_HS') {
        target = 'Tudal High School • Gaondongrem';
        campusCode = 'TUDAL_HS';
      } else if (n.institutionCode === 'ANGLE_HSS') {
        target = 'S. S. Angle Higher Secondary School • Dapot';
        campusCode = 'ANGLE_HSS';
      }

      let type: 'exam' | 'admission' | 'scholarship' | 'circular' = 'circular';
      const tLower = (n.title || '').toLowerCase();
      if (tLower.includes('exam') || tLower.includes('board') || tLower.includes('timetable') || tLower.includes('form') || tLower.includes('ssc') || tLower.includes('hssc')) {
        type = 'exam';
      } else if (tLower.includes('admission') || tLower.includes('enrollment') || tLower.includes('prospectus')) {
        type = 'admission';
      } else if (tLower.includes('scholarship') || tLower.includes('tribal') || tLower.includes('dbt') || tLower.includes('grant')) {
        type = 'scholarship';
      }

      const decoded = decodeNoticeMeta(n.content);
      const customRef = decoded.refNo || n.refNo;
      const refNo = customRef && customRef.trim().length > 0
        ? customRef.trim()
        : n.institutionCode
          ? `${n.institutionCode.replace('_', '/')}/CIR/${String(n.id).slice(-4).toUpperCase()}`
          : `SNES/CIR/${String(n.id).slice(-4).toUpperCase()}`;

      return {
        id: String(n.id),
        refNo,
        title: n.title,
        date: n.date || new Date().toISOString().split('T')[0],
        target,
        campusCode,
        type,
        urgent: n.urgent !== undefined ? Boolean(n.urgent) : decoded.urgent,
        pinned: Boolean(n.pinned),
        fileSize: n.pdfUrl ? 'Official PDF' : 'Circular',
        pdfUrl: n.pdfUrl || null,
        description: decoded.content || n.content || 'Authenticated circular issued by Shree Nirakar Education Society.',
      };
    });

    if (formattedApi.length === 0) {
      return ALL_ARCHIVE_NOTICES;
    }

    const apiTitles = new Set(formattedApi.map((a: any) => a.title.toLowerCase().trim()));
    const remainingMock = ALL_ARCHIVE_NOTICES.filter(
      (m) => !apiTitles.has(m.title.toLowerCase().trim())
    );

    return [...formattedApi, ...remainingMock].sort((a: any, b: any) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [apiNotices]);

  const filtered = useMemo(() => {
    return combinedNotices.filter((n: any) => {
      const matchesType = filter === 'all' || n.type === filter;
      const matchesCampus = campusFilter === 'all' || n.campusCode === campusFilter || n.campusCode === 'ALL';
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || 
        n.title.toLowerCase().includes(q) || 
        n.description.toLowerCase().includes(q) || 
        n.refNo.toLowerCase().includes(q) ||
        n.target.toLowerCase().includes(q);
      return matchesType && matchesCampus && matchesSearch;
    });
  }, [combinedNotices, search, filter, campusFilter]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, campusFilter]);

  // Pagination calculation - strictly 8 items per page
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedNotices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Extract top urgent directive if available
  const priorityNotice = useMemo(() => {
    return combinedNotices.find((n: any) => n.urgent);
  }, [combinedNotices]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>Official Notices & Central Gazette | Shree Nirakar Education Society</title>
        <meta name="description" content="Official repository of authenticated examination schedules, admissions circulars, and administrative orders." />
      </Helmet>

      <Navbar />

      {/* Header Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="w-full relative z-10 space-y-3">
          <span className="text-xs uppercase font-mono font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
            Directorate of Education Goa • Registered Circulars
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Central Administrative Gazette & Notices Archive
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            The authenticated digital registry of board examinations, admission protocols, government scholarships, and official memoranda issued by Shree Nirakar Education Society.
          </p>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF8F5" bgColor="#0b132b" height={36} withGoldLine />

      {/* Main Content: Heavenly, Minimal, Highly Readable Gazette (Optimized for 2GB/4GB RAM) */}
      <main ref={listRef} className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 space-y-8">
        
        {/* PRIORITY GAZETTE DIRECTIVE BANNER (If urgent circular exists) */}
        {priorityNotice && (
          <div className="bg-gradient-to-r from-[#0b132b] to-[#16247e] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-amber-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-400 text-[#0b132b]">
                  <AlertCircle size={11} />
                  <span>Immediate Action Required</span>
                </span>
                <span className="text-xs font-mono text-amber-300/90 font-semibold">
                  Ref: {priorityNotice.refNo}
                </span>
                <span className="text-xs font-mono text-stone-300 hidden sm:inline">
                  • {priorityNotice.date}
                </span>
              </div>
              <h2 className="font-serif text-base sm:text-xl font-bold tracking-tight text-white hover:text-amber-200 transition-colors">
                <Link to={`/notices/${slugify(priorityNotice.title)}`} className="text-white hover:text-amber-200">
                  {priorityNotice.title}
                </Link>
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 line-clamp-2 max-w-4xl">
                {priorityNotice.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              <Link
                to={`/notices/${slugify(priorityNotice.title)}`}
                className="flex-1 md:flex-initial text-center px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#0b132b] text-xs font-serif font-bold rounded-xl shadow-xs transition-colors"
              >
                Read Directive
              </Link>
              {priorityNotice.pdfUrl && (
                <a
                  href={priorityNotice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold rounded-xl border border-white/20 transition-colors"
                >
                  <Download size={12} />
                  <span>PDF</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* MINIMAL SEARCH & CATEGORY FILTER BAR */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search circulars by Ref No., SSC/HSSC, scholarship, or keywords..."
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

            {/* Campus Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-serif font-semibold text-stone-500 hidden sm:inline">Campus:</span>
              <CustomSelect
                value={campusFilter}
                onChange={(val) => setCampusFilter(val)}
                options={[
                  { value: 'all', label: 'All Society Campuses' },
                  { value: 'NIRAKAR_HS', label: 'Shri Nirakar Vidyalaya' },
                  { value: 'ANGLE_HSS', label: 'S. S. Angle Higher Secondary School' },
                  { value: 'TUDAL_HS', label: 'Tudal High School' },
                ]}
                align="right"
                className="min-w-[190px] sm:min-w-[220px]"
              />
            </div>
          </div>

          {/* Category Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-stone-100 scrollbar-none">
            {[
              { key: 'all', label: 'All Notices', count: combinedNotices.length },
              { key: 'exam', label: 'Board Exams', count: combinedNotices.filter((n: any) => n.type === 'exam').length },
              { key: 'admission', label: 'Admissions', count: combinedNotices.filter((n: any) => n.type === 'admission').length },
              { key: 'scholarship', label: 'Scholarships', count: combinedNotices.filter((n: any) => n.type === 'scholarship').length },
              { key: 'circular', label: 'Circulars & Sports', count: combinedNotices.filter((n: any) => n.type === 'circular').length },
            ].map((tab) => {
              const isSelected = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0b132b] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULTS SUMMARY BAR */}
        <div className="flex items-center justify-between text-xs font-mono text-stone-500 px-1">
          <div>
            Showing <strong className="text-stone-900">{filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</strong>–<strong className="text-stone-900">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong className="text-stone-900">{filtered.length}</strong> authenticated circulars
          </div>

          {(search || filter !== 'all' || campusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setFilter('all');
                setCampusFilter('all');
              }}
              className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* NOTICES LIST - HEAVENLY MINIMAL GAZETTE STREAM (Ultra-clean, zero lag on 2GB RAM) */}
        {paginatedNotices.length > 0 ? (
          <div className="space-y-3.5">
            {paginatedNotices.map((item: any) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 hover:border-amber-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                {/* Left Date Ribbon */}
                <div className="shrink-0 flex md:flex-col items-center justify-center bg-stone-50 group-hover:bg-amber-50/60 border border-stone-200/80 rounded-xl px-3 py-2 text-center min-w-[76px] transition-colors gap-1.5 md:gap-0">
                  <span className="font-mono text-base sm:text-lg font-black text-stone-900">
                    {item.date.split('-')[2] || '18'}
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    {new Date(item.date).toLocaleString('en-US', { month: 'short' }).toUpperCase()}
                  </span>
                  <span className="font-mono text-[9px] text-stone-400 hidden md:block">
                    {item.date.split('-')[0] || '2026'}
                  </span>
                </div>

                {/* Central Notice Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-mono font-bold text-stone-500 tracking-wider bg-stone-100 px-2 py-0.5 rounded">
                      {item.refNo}
                    </span>

                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                        item.type === 'exam'
                          ? 'bg-blue-50 text-blue-900 border border-blue-200/80'
                          : item.type === 'admission'
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80'
                          : item.type === 'scholarship'
                          ? 'bg-purple-50 text-purple-900 border border-purple-200/80'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {item.type === 'exam'
                        ? 'Board Exam'
                        : item.type === 'admission'
                        ? 'Admissions'
                        : item.type === 'scholarship'
                        ? 'Scholarship'
                        : 'Official Gazette'}
                    </span>

                    {item.urgent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                        Urgent
                      </span>
                    )}

                    <span className="text-stone-400 font-mono text-[11px] truncate">
                      • {item.target}
                    </span>
                  </div>

                  <Link 
                    to={`/notices/${slugify(item.title)}`}
                    className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#0b132b] transition-colors line-clamp-1 block no-underline"
                  >
                    {item.title}
                  </Link>

                  <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Right Action Buttons */}
                <div className="shrink-0 flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 justify-end">
                  <Link
                    to={`/notices/${slugify(item.title)}`}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold text-stone-700 hover:text-white bg-stone-100 hover:bg-[#0b132b] transition-colors cursor-pointer"
                  >
                    <span>Read Circular</span>
                    <ChevronRight size={13} />
                  </Link>

                  {item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#0b132b] hover:bg-[#16247e] text-white transition-colors"
                      title="Download Official Gazette PDF"
                    >
                      <Download size={11} />
                      <span>PDF</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 shadow-xs">
            <FileText size={36} className="text-stone-300 mx-auto" />
            <h3 className="font-serif text-base font-bold text-stone-900">No official circulars found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No notices match your current filters. Try adjusting your search term or selecting "All Notices".
            </p>
            <button
              onClick={() => {
                setSearch('');
                setFilter('all');
                setCampusFilter('all');
              }}
              className="px-4 py-2 bg-[#0b132b] text-white rounded-xl text-xs font-serif font-bold hover:bg-[#16247e] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* CLEAN MINIMAL PAGINATION (Strictly 8 items per page) */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200">
            <div className="text-xs font-mono text-stone-500 order-2 sm:order-1">
              Page <strong className="text-stone-900">{currentPage}</strong> of <strong className="text-stone-900">{totalPages}</strong> ({filtered.length} circulars total)
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
      </main>

      <Footer />
    </div>
  );
};
