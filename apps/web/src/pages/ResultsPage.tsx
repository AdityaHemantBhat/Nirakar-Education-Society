import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Award,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  Trophy,
  Download,
  FileText,
} from 'lucide-react';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { apiUrl } from '../lib/api.js';

interface AcademicResult {
  id: string;
  academicYear: string;
  standard: string;
  examType: string;
  title?: string | null;
  pdfUrl?: string | null;
  studentName?: string | null;
  rollNumber?: string | null;
  percentage?: number | null;
  cgpa?: number | null;
  grade?: string | null;
  stream?: string | null;
  institutionCode: string;
  remarks?: string | null;
  photoUrl?: string | null;
  isFeatured: boolean;
}

const STANDARDS = ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export const ResultsPage: React.FC = () => {
  const [selectedStandard, setSelectedStandard] = useState('X');
  const [selectedYear, setSelectedYear] = useState('2025–2026');
  const [selectedStream, setSelectedStream] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['public_academic_results', selectedStandard, selectedYear, selectedStream, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStandard) params.append('standard', selectedStandard);
      if (selectedYear) params.append('academicYear', selectedYear);
      if (selectedStream) params.append('stream', selectedStream);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '100');

      const res = await fetch(`/api/v1/results?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load results');
      return json.data as { items: AcademicResult[] };
    },
  });

  const handleDownloadReport = () => {
    const params = new URLSearchParams();
    if (selectedStandard) params.append('standard', selectedStandard);
    if (selectedYear) params.append('academicYear', selectedYear);
    if (selectedStream) params.append('stream', selectedStream);
    window.open(apiUrl(`/api/v1/results/pdf/download?${params.toString()}`), '_blank');
  };

  const resultsWithPdf = data?.items.filter((i) => i.pdfUrl) || [];

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>Academic Results (Std V–XII) — Shree Nirakar Education Society</title>
        <meta
          name="description"
          content="Explore official academic result sheets and examination reports across standards V to XII at Shree Nirakar Education Society campuses."
        />
      </Helmet>

      <Navbar />

      {/* Header Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="w-full relative z-10 space-y-3">
          <span className="text-xs uppercase font-mono font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
            Official Roll of Honour &amp; Academic Achievements
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Academic Results &amp; Merit Lists
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Download certified examination gazettes, merit rolls, and grade scorecards across Standards V to XII at Shree Nirakar Education Society campuses.
          </p>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF8F5" bgColor="#0b132b" height={36} withGoldLine />

      {/* Filter Toolbar */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 -mt-3 relative z-10 mb-8 sm:mb-10">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-amber-800" />
              <h2 className="text-base font-serif font-bold text-stone-900">Filter Examination Results</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-stone-500 hidden sm:block">
                Showing records for <span className="font-bold text-[#0b132b]">Std {selectedStandard}</span> ({selectedYear})
              </div>
              <button
                type="button"
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0b132b] hover:bg-[#16247e] px-4 py-2 text-xs font-serif font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Download size={14} className="text-amber-300" />
                <span>Download Summary Report (PDF)</span>
              </button>
            </div>
          </div>

            {/* Standard Filter Pills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-700">Filter by Standard</span>
                <span className="text-[11px] font-medium text-stone-400">Std V through Std XII</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {STANDARDS.map((std) => {
                  const active = selectedStandard === std;
                  return (
                    <button
                      key={std}
                      type="button"
                      onClick={() => setSelectedStandard(std)}
                      className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? 'bg-[#0b132b] text-white shadow-sm ring-2 ring-amber-400/70 ring-offset-1'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 hover:text-stone-900'
                      }`}
                    >
                      <GraduationCap size={14} className={active ? 'text-amber-300' : 'text-stone-400'} />
                      <span>Std {std}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
              <label className="block space-y-1.5">
                <span className="text-xs font-serif font-semibold text-stone-700">Academic Year</span>
                <input
                  type="text"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  placeholder="2025–2026"
                  className="w-full pl-3.5 pr-3 py-2.5 text-xs sm:text-sm bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 placeholder:text-stone-400 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none transition-colors"
                />
              </label>

              {['XI', 'XII'].includes(selectedStandard) && (
                <label className="block space-y-1.5">
                  <span className="text-xs font-serif font-semibold text-stone-700">Stream</span>
                  <select
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none transition-colors"
                  >
                    <option value="">All Streams</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                  </select>
                </label>
              )}

              <label className="block space-y-1.5">
                <span className="text-xs font-serif font-semibold text-stone-700">Search Results</span>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, student names..."
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-stone-50/70 hover:bg-stone-50 focus:bg-white text-stone-900 placeholder:text-stone-400 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none transition-colors"
                  />
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 pb-20 space-y-8">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#0b132b] border-t-amber-400" />
            </div>
          ) : !data?.items.length ? (
            <div className="rounded-2xl border border-stone-200/90 bg-white p-12 text-center shadow-xs">
              <GraduationCap size={44} className="mx-auto mb-3 text-stone-300" />
              <h3 className="text-lg font-bold font-serif text-stone-800">No result documents found for Std {selectedStandard}</h3>
              <p className="text-xs text-stone-500 mt-1">Try selecting a different academic year or checking back soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-amber-800" />
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
                    Official Result Documents &amp; Merit Lists (Std {selectedStandard})
                  </h2>
                </div>
                <div className="text-xs font-mono text-stone-500">{data.items.length} document(s) available</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {data.items.map((item) => {
                  let campusTitle = 'Shri Nirakar Vidyalaya, Mashem';
                  if (item.institutionCode === 'TUDAL_HS') {
                    campusTitle = 'Tudal High School, Gaodongrem';
                  } else if (item.institutionCode === 'ANGLE_HSS') {
                    campusTitle = 'S. S. Angle Higher Secondary School, Mashem';
                  }

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-amber-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5 group"
                    >
                      <div className="space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-200">
                              Std {item.standard} {item.stream ? `· ${item.stream}` : ''}
                            </span>
                            {item.isFeatured && (
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200/80 inline-flex items-center gap-1">
                                <Sparkles size={11} className="text-amber-600" />
                                <span>Merit Honour</span>
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono font-semibold text-stone-500 bg-stone-50 border border-stone-200/60 px-2.5 py-0.5 rounded-md">
                            {item.academicYear}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#0b132b] transition-colors leading-snug">
                            {item.title || `Std ${item.standard} Examination Result Sheet`}
                          </h3>
                          <p className="text-xs text-stone-500 mt-1 font-mono">
                            {campusTitle}
                          </p>
                        </div>

                        {/* Top Performer / Honour badge if available */}
                        {item.studentName && item.studentName !== 'Official Merit List' && (
                          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                                <Trophy size={12} className="text-amber-600" />
                                <span>Merit Topper</span>
                              </span>
                              {item.percentage !== null && item.percentage !== undefined && (
                                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                                  {item.percentage}% ({item.grade || 'A+'})
                                </span>
                              )}
                            </div>
                            <div className="font-serif font-bold text-sm text-stone-900">{item.studentName}</div>
                            {item.remarks && (
                              <p className="text-xs text-stone-600 font-sans italic">{item.remarks}</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                        {item.pdfUrl ? (
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0b132b] hover:bg-[#16247e] px-4 py-2.5 text-xs font-serif font-bold text-white shadow-xs transition-colors w-full justify-center group/btn"
                          >
                            <FileText size={15} className="text-amber-300 group-hover/btn:scale-110 transition-transform" />
                            <span>View / Download Official Gazette PDF</span>
                          </a>
                        ) : (
                          <span className="text-xs text-stone-400 italic font-mono">PDF pending upload</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    );
  };

export default ResultsPage;
