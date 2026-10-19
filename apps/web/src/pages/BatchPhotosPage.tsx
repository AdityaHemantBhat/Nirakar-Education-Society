import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Camera,
  Search,
  Filter,
  Calendar,
  Building2,
  GraduationCap,
  Download,
  Share2,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { CustomSelect } from '../components/CustomSelect.js';
import {
  BatchPhoto,
  INITIAL_BATCH_PHOTOS,
  SCHOOL_OPTIONS,
  BATCH_TYPE_OPTIONS,
} from '../data/batchPhotosData.js';

const STORAGE_KEY = 'nirakar_custom_batch_photos';

export const BatchPhotosPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  // Load batches from localStorage if admin added new ones, else initial seed
  const [batches, setBatches] = useState<BatchPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customIds = new Set(parsed.map((p) => p.id));
          const remainingInitial = INITIAL_BATCH_PHOTOS.filter((b) => !customIds.has(b.id));
          return [...parsed, ...remainingInitial];
        }
      }
    } catch {}
    return INITIAL_BATCH_PHOTOS;
  });

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>(() => {
    const campus = searchParams.get('campus');
    return SCHOOL_OPTIONS.some((school) => school.code === campus) ? campus! : 'ALL';
  });
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [decadeFilter, setDecadeFilter] = useState<string>('ALL');

  useEffect(() => {
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    if (!targetId) return;
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' });
    });
  }, []);

  // Lightbox Modal State
  const [activePhoto, setActivePhoto] = useState<BatchPhoto | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered & Sorted Batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.schoolName.toLowerCase().includes(q) ||
        String(b.year).includes(q) ||
        b.batchSession.toLowerCase().includes(q) ||
        (b.caption && b.caption.toLowerCase().includes(q));

      const matchesSchool = schoolFilter === 'ALL' || b.school === schoolFilter;
      const matchesType = typeFilter === 'ALL' || b.batchType === typeFilter;

      let matchesDecade = true;
      if (decadeFilter !== 'ALL') {
        const decadeStart = parseInt(decadeFilter, 10);
        matchesDecade = b.year >= decadeStart && b.year < decadeStart + 10;
      }

      return matchesSearch && matchesSchool && matchesType && matchesDecade;
    }).sort((a, b) => b.year - a.year);
  }, [batches, searchQuery, schoolFilter, typeFilter, decadeFilter]);

  const handleCopyShare = async (photo: BatchPhoto) => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const decades = [
    { label: 'All Decades', value: 'ALL' },
    { label: '2020s', value: '2020' },
    { label: '2010s', value: '2010' },
    { label: '2000s', value: '2000' },
    { label: '1990s', value: '1990' },
    { label: '1980s', value: '1980' },
    { label: '1970s', value: '1970' },
    { label: '1960s', value: '1960' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>Batch Photos Archive (1963–2023) | Shree Nirakar Education Society</title>
        <meta
          name="description"
          content="Historical graduating class photographs across Shri Nirakar High School, Tudal High School, and S.S. Angle HSS from 1963 to the present."
        />
      </Helmet>

      <Navbar />

      {/* HEADER BANNER - Full-width seamless dark navy banner */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center space-y-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-flex items-center gap-1.5">
              <Camera size={13} />
              <span>Historical Alumni Registry • 1963 to Present</span>
            </span>
            <span className="text-xs font-mono text-stone-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 hidden sm:inline-block">
              {batches.length} Archived Batches
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Secondary & Higher Secondary Batch Photos
          </h1>

          <p className="max-w-3xl text-stone-300 text-sm sm:text-base leading-relaxed">
            Preserving six decades of memories, graduating classes, student portraits, and respected faculty mentors across Shri Nirakar High School (Mashem), Tudal High School (Gaondongrem), and S. S. Angle Higher Secondary School (Dapot).
          </p>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      {/* MAIN CONTAINER */}
      <main className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-10 sm:py-14 space-y-8">
        {/* INTERACTIVE FILTER & SEARCH BAR */}
        <div id="batch-filters" className="scroll-mt-28 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          {/* Search + School Quick Tabs */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batches by year (e.g. 1985), school, or keyword..."
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-stone-50 hover:bg-white focus:bg-white text-stone-900 placeholder:text-stone-400 border border-stone-200 focus:border-amber-600 rounded-xl outline-none font-sans transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* School Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              <button
                type="button"
                onClick={() => setSchoolFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide uppercase transition-all shrink-0 cursor-pointer ${
                  schoolFilter === 'ALL'
                    ? 'bg-[#0b132b] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                }`}
              >
                All 3 Campuses
              </button>
              <button
                type="button"
                onClick={() => setSchoolFilter('NIRAKAR_HS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide uppercase transition-all shrink-0 cursor-pointer ${
                  schoolFilter === 'NIRAKAR_HS'
                    ? 'bg-[#0b132b] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                }`}
              >
                Nirakar HS (Mashem)
              </button>
              <button
                type="button"
                onClick={() => setSchoolFilter('ANGLE_HSS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide uppercase transition-all shrink-0 cursor-pointer ${
                  schoolFilter === 'ANGLE_HSS'
                    ? 'bg-[#0b132b] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                }`}
              >
                Angle HSS (Dapot)
              </button>
              <button
                type="button"
                onClick={() => setSchoolFilter('TUDAL_HS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide uppercase transition-all shrink-0 cursor-pointer ${
                  schoolFilter === 'TUDAL_HS'
                    ? 'bg-[#0b132b] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                }`}
              >
                Tudal HS (Gaondongrem)
              </button>
            </div>
          </div>

          {/* Sub Filters: Stream / Level & Decades */}
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Batch Stream Dropdown */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-stone-400 text-[11px] uppercase tracking-wider">Stream:</span>
              <CustomSelect
                value={typeFilter}
                onChange={(val) => setTypeFilter(val)}
                options={[
                  { value: 'ALL', label: 'All Batch Streams' },
                  { value: 'SSC', label: 'SSC (Class X)' },
                  { value: 'HSSC_SCIENCE', label: 'HSSC Science (Class XII)' },
                  { value: 'HSSC_COMMERCE', label: 'HSSC Commerce (Class XII)' },
                  { value: 'HSSC_ARTS', label: 'HSSC Arts (Class XII)' },
                  { value: 'SPECIAL', label: 'Special Historical Batches' },
                ]}
                className="bg-stone-50 min-w-[170px]"
              />
            </div>

            {/* Decade Quick Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="font-mono text-stone-400 text-[11px] uppercase tracking-wider hidden sm:inline">
                Decade:
              </span>
              {decades.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDecadeFilter(d.value)}
                  className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] transition-colors cursor-pointer ${
                    decadeFilter === d.value
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS HEADER */}
        <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
          <div>
            Showing <strong className="text-stone-900 font-bold">{filteredBatches.length}</strong> archived batch photographs
          </div>
          {(searchQuery || schoolFilter !== 'ALL' || typeFilter !== 'ALL' || decadeFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSchoolFilter('ALL');
                setTypeFilter('ALL');
                setDecadeFilter('ALL');
              }}
              className="text-amber-800 hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <RotateCcw size={12} />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* GRID OF BATCH PHOTO CARDS */}
        {filteredBatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {filteredBatches.map((batch) => (
              <div
                key={batch.id}
                onClick={() => setActivePhoto(batch)}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Photo Thumbnail with Zoom Overlay */}
                <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
                  <img
                    src={batch.imageUrl}
                    alt={batch.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="px-3 py-1.5 rounded-full bg-white/95 text-stone-900 font-mono text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all">
                      <ZoomIn size={13} />
                      <span>Inspect Photo</span>
                    </span>
                  </div>

                  {/* Year Tag Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black tracking-wider bg-[#0b132b]/90 text-amber-300 backdrop-blur-md shadow-xs border border-white/10">
                      {batch.year}
                    </span>
                  </div>

                  {/* Size Indicator */}
                  {batch.fileSize && (
                    <div className="absolute bottom-2 right-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-white/90 bg-black/60 backdrop-blur-xs">
                        {batch.fileSize}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {batch.school === 'NIRAKAR_HS'
                          ? 'Nirakar HS'
                          : batch.school === 'TUDAL_HS'
                          ? 'Tudal HS'
                          : 'Angle HSS'}
                      </span>
                      <span className="font-mono text-stone-500 text-[11px]">
                        {batch.batchSession}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                      {batch.title}
                    </h3>

                    {batch.caption && (
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {batch.caption}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-500">
                      {batch.classLevel} {batch.division ? `• ${batch.division}` : ''}
                    </span>
                    <span className="text-blue-700 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                      <span>View</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-2 bg-white rounded-3xl border border-stone-200">
            <Camera size={32} className="text-stone-400 mx-auto" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              No batch photos found matching your search.
            </h3>
            <p className="text-xs text-stone-500">
              Try adjusting your year, school, or stream filters.
            </p>
          </div>
        )}
      </main>

      {/* HIGH-RES LIGHTBOX MODAL */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col lg:flex-row max-h-[92vh]">
            {/* Left: High-Res Photo Display */}
            <div className="flex-1 bg-stone-950 relative flex items-center justify-center min-h-[300px] lg:min-h-[500px] p-4">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="lg:hidden absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Right: Metadata & Details Sidebar */}
            <div className="w-full lg:w-84 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto bg-stone-50/60 border-t lg:border-t-0 lg:border-l border-stone-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Class of {activePhoto.year}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePhoto(null)}
                    className="hidden lg:inline-flex p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                    {activePhoto.title}
                  </h2>
                  <div className="text-xs font-mono text-stone-500 mt-1">
                    Academic Session: {activePhoto.batchSession}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-200 text-xs font-sans">
                  <div>
                    <span className="font-mono text-stone-400 uppercase text-[10px] block">Institution</span>
                    <span className="font-bold text-stone-900">{activePhoto.schoolName}</span>
                    <span className="block text-[11px] text-stone-500">{activePhoto.campus}</span>
                  </div>

                  <div>
                    <span className="font-mono text-stone-400 uppercase text-[10px] block">Level / Stream</span>
                    <span className="font-semibold text-stone-800">{activePhoto.batchTypeLabel}</span>
                  </div>

                  {activePhoto.division && (
                    <div>
                      <span className="font-mono text-stone-400 uppercase text-[10px] block">Class / Division</span>
                      <span className="font-mono text-stone-800">{activePhoto.division}</span>
                    </div>
                  )}

                  {activePhoto.caption && (
                    <div className="pt-2">
                      <span className="font-mono text-stone-400 uppercase text-[10px] block">Archive Notes</span>
                      <p className="text-xs text-stone-600 leading-relaxed mt-0.5">
                        {activePhoto.caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-stone-200 text-xs font-mono">
                <a
                  href={activePhoto.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`${activePhoto.id}.jpg`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0b132b] hover:bg-stone-800 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Download size={14} />
                  <span>Download Photo</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyShare(activePhoto)}
                  className="w-full py-2 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      <span>Share Archive Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
