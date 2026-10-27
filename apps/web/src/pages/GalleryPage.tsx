import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { SectionEdge } from '../components/SectionEdge.js';
import {
  Sparkles,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  Camera,
  Compass,
  Eye,
  SlidersHorizontal,
  BookmarkCheck,
  CheckCircle2,
  ArrowUpRight,
  Grid,
  Film,
  Aperture,
  Check,
} from 'lucide-react';

interface GalleryItem {
  id: string;
  url: string;
  caption?: string | null;
  displayOrder: number;
}

interface GalleryAlbum {
  id: string;
  title: string;
  description?: string | null;
  institutionCode: 'NIRAKAR_HS' | 'TUDAL_HS' | 'ANGLE_HSS';
  category?: string | null;
  eventDate?: string | null;
  coverImage?: string | null;
  isPublished: boolean;
  displayOrder: number;
  items: GalleryItem[];
}

const INSTITUTIONS = [
  {
    code: 'ALL',
    label: 'All Institutions',
    shortName: 'Tri-Campus Collection',
    location: 'Canacona Taluka, Goa',
    curatorialBadge: 'Archives 1968–Present',
    accent: '#B45309',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    desc: 'Society-wide ceremonies, athletic championships, and community heritage across Canacona.',
  },
  {
    code: 'NIRAKAR_HS',
    label: 'Shri Nirakar High School',
    shortName: 'Nirakar High School',
    location: 'Mashem, Canacona',
    curatorialBadge: 'Estd. 1968 · Coastal Pioneer',
    accent: '#047857',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    desc: 'SSC excellence, robotics innovation, science fairs, and volleyball state championships.',
  },
  {
    code: 'TUDAL_HS',
    label: 'Tudal High School',
    shortName: 'Tudal High School',
    location: 'Gaondongrem, Canacona',
    curatorialBadge: 'Estd. 1989 · Forest Foothill',
    accent: '#0F766E',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
    desc: 'Rural education outreach, Western Ghats botanical biodiversity, and authentic Goan folklore.',
  },
  {
    code: 'ANGLE_HSS',
    label: 'S.S. Angle Higher Secondary School',
    shortName: 'S.S. Angle HSS',
    location: 'Dapot, Maxem, Canacona',
    curatorialBadge: 'Estd. 1996 · Senior Secondary',
    accent: '#B45309',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    desc: 'Senior Science, Commerce & Arts streams, NCC cadets, and collegiate sports pavilions.',
  },
] as const;

const FALLBACK_ALBUMS: GalleryAlbum[] = [
  {
    id: 'fb-1',
    title: 'Atal Tinkering Robotics & Innovation Lab Showcase',
    description: 'Scholars of Shri Nirakar High School experimenting with microcontroller kits, sensor programming, and 3D prototyping models.',
    institutionCode: 'NIRAKAR_HS',
    category: 'STEM & Robotics',
    eventDate: '2025-11-18',
    coverImage: '/images/science_lab.jpg',
    isPublished: true,
    displayOrder: 1,
    items: [
      { id: 'fb-1-1', url: '/images/science_lab.jpg', caption: 'Students assembling automated obstacle-avoiding sensor robots.', displayOrder: 0 },
      { id: 'fb-1-2', url: '/images/nirakar_vidyalaya_real.jpg', caption: 'Interactive wet chemistry and optics stations at the Mashem campus.', displayOrder: 1 },
      { id: 'fb-1-3', url: '/images/nirakar_student_winner.jpg', caption: 'Canacona zonal science exposition prize winners.', displayOrder: 2 },
    ],
  },
  {
    id: 'fb-2',
    title: 'Inter-School Athletics & Volleyball Championships',
    description: 'State tournament victories, volleyball rallies, and athletics meets hosted at the historic Mashem sports pavilion.',
    institutionCode: 'NIRAKAR_HS',
    category: 'Sports & Athletics',
    eventDate: '2025-12-04',
    coverImage: '/images/sports_champs.jpg',
    isPublished: true,
    displayOrder: 2,
    items: [
      { id: 'fb-2-1', url: '/images/sports_champs.jpg', caption: 'State Volleyball Champions Trophy and celebration.', displayOrder: 0 },
      { id: 'fb-2-2', url: '/images/mashem_campus.jpg', caption: 'Athletics meet track on the Mashem pavilion grounds.', displayOrder: 1 },
    ],
  },
  {
    id: 'fb-3',
    title: 'Traditional Goan Folk Arts, Natak & Fugdi Festival',
    description: 'State-awarded traditional folk theatre, Natak, Dhalo, and Fugdi presentations preserving Goan rural performing arts in Gaondongrem.',
    institutionCode: 'TUDAL_HS',
    category: 'Cultural & Heritage',
    eventDate: '2026-01-22',
    coverImage: '/images/folk_arts.jpg',
    isPublished: true,
    displayOrder: 3,
    items: [
      { id: 'fb-3-1', url: '/images/folk_arts.jpg', caption: 'State award-winning theatrical performance by Tudal High School students.', displayOrder: 0 },
      { id: 'fb-3-2', url: '/images/Tudal_High_School_Gaodongrem.webp', caption: 'The serene rural sanctuary campus in Gaondongrem.', displayOrder: 1 },
      { id: 'fb-3-3', url: '/images/tudal_campus.jpg', caption: 'Celebrating traditional songs and folklore of the Canacona hinterlands.', displayOrder: 2 },
    ],
  },
  {
    id: 'fb-4',
    title: 'Western Ghats Biodiversity & Eco-Sanctuary Walk',
    description: 'Field botany excursions, indigenous tree planting, and biodiversity observation clubs across Gaondongrem hills.',
    institutionCode: 'TUDAL_HS',
    category: 'Nature & Campus',
    eventDate: '2025-10-15',
    coverImage: '/images/tudal_campus.jpg',
    isPublished: true,
    displayOrder: 4,
    items: [
      { id: 'fb-4-1', url: '/images/tudal_campus.jpg', caption: 'Medicinal plants and biodiversity sanctuary maintained by students.', displayOrder: 0 },
      { id: 'fb-4-2', url: '/images/Tudal_High_School_Gaodongrem.webp', caption: 'Village Outreach bus fleet ensuring education reaches interior forest settlements.', displayOrder: 1 },
    ],
  },
  {
    id: 'fb-5',
    title: 'Higher Secondary Science, Commerce & Arts Conclave',
    description: 'Class XI & XII laboratory practicals, commerce symposiums, and university entrance foundation mentoring sessions at Dapot.',
    institutionCode: 'ANGLE_HSS',
    category: 'Academic Life',
    eventDate: '2025-12-14',
    coverImage: '/images/S.S.Angle_Higher_Secondary_School_Dapot.webp',
    isPublished: true,
    displayOrder: 5,
    items: [
      { id: 'fb-5-1', url: '/images/S.S.Angle_Higher_Secondary_School_Dapot.webp', caption: 'The landmark collegiate campus of Satyawati Soiru Angle Higher Secondary School.', displayOrder: 0 },
      { id: 'fb-5-2', url: '/images/science_lab.jpg', caption: 'Advanced experiential learning laboratory preparing scholars for professional entrances.', displayOrder: 1 },
      { id: 'fb-5-3', url: '/images/nirakar_students_real1.jpg', caption: 'Senior educators guiding graduating scholars on college roadmaps.', displayOrder: 2 },
    ],
  },
  {
    id: 'fb-6',
    title: 'Nirakar Maidan Sports & Republic Day Ceremonial Parade',
    description: 'NCC cadets, Scouts & Guides, and track events conducted at the sprawling Nirakar Maidan grounds in Dapot.',
    institutionCode: 'ANGLE_HSS',
    category: 'Sports & NCC',
    eventDate: '2026-01-26',
    coverImage: '/images/angle_campus.jpg',
    isPublished: true,
    displayOrder: 6,
    items: [
      { id: 'fb-6-1', url: '/images/angle_campus.jpg', caption: 'Full-scale cricket, football, and athletic pavilion at Dapot.', displayOrder: 0 },
      { id: 'fb-6-2', url: '/images/nirakar_students_real2.jpg', caption: 'Disciplined youth leadership marching in ceremonial state parades.', displayOrder: 1 },
    ],
  },
];

const ITEMS_PER_PAGE = 4;

export const GalleryPage: React.FC = () => {
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'curatorial' | 'sheet'>('curatorial');

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxAlbum, setLightboxAlbum] = useState<GalleryAlbum | null>(null);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number>(0);

  // Fetch albums from backend
  const { data: serverAlbums } = useQuery<GalleryAlbum[]>({
    queryKey: ['public-gallery-albums', selectedCampus],
    queryFn: async () => {
      const url =
        selectedCampus === 'ALL'
          ? '/api/v1/content/galleries'
          : `/api/v1/content/galleries?institutionCode=${selectedCampus}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch gallery albums');
      const json = await res.json();
      const rawList = json.data || [];
      return rawList.map((a: any, idx: number) => ({
        id: a.id || `album-${idx}`,
        title: a.title,
        description: a.description,
        institutionCode: a.institutionCode,
        category: a.category || 'Curated Exhibition',
        eventDate: a.eventDate || a.createdAt,
        coverImage: a.coverUrl || a.coverImage || a.items?.[0]?.mediaUrl || a.items?.[0]?.url,
        isPublished: true,
        displayOrder: a.displayOrder || idx + 1,
        items: (a.items || []).map((it: any, iIdx: number) => ({
          id: it.id || `item-${iIdx}`,
          url: it.mediaUrl || it.url,
          caption: it.caption || it.title,
          displayOrder: it.order ?? it.displayOrder ?? iIdx,
        })),
      }));
    },
    staleTime: 60 * 1000,
  });

  // Effective albums
  const allAlbums = useMemo(() => {
    if (serverAlbums && serverAlbums.length > 0) {
      if (selectedCampus === 'ALL') return serverAlbums;
      return serverAlbums.filter((a) => a.institutionCode === selectedCampus);
    }
    if (selectedCampus === 'ALL') return FALLBACK_ALBUMS;
    return FALLBACK_ALBUMS.filter((a) => a.institutionCode === selectedCampus);
  }, [serverAlbums, selectedCampus]);

  // Filtered
  const filteredAlbums = useMemo(() => {
    return allAlbums.filter((album) => {
      const matchSearch =
        !searchQuery ||
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (album.description && album.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (album.category && album.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [allAlbums, searchQuery]);

  // Pagination
  const totalAlbums = filteredAlbums.length;
  const totalPages = Math.max(1, Math.ceil(totalAlbums / ITEMS_PER_PAGE));

  const pageAlbums = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAlbums.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAlbums, currentPage]);

  // Sync active exhibition album
  useEffect(() => {
    if (pageAlbums.length > 0) {
      if (!activeAlbumId || !pageAlbums.some((a) => a.id === activeAlbumId)) {
        setActiveAlbumId(pageAlbums[0].id);
        setActivePhotoIndex(0);
      }
    } else {
      setActiveAlbumId(null);
    }
  }, [pageAlbums, activeAlbumId]);

  const activeAlbum = useMemo(() => {
    return (
      pageAlbums.find((a) => a.id === activeAlbumId) ||
      pageAlbums[0] ||
      null
    );
  }, [pageAlbums, activeAlbumId]);

  const activePhoto = useMemo(() => {
    if (!activeAlbum || !activeAlbum.items || activeAlbum.items.length === 0) {
      return {
        id: 'default',
        url: activeAlbum?.coverImage || '/images/science_lab.jpg',
        caption: activeAlbum?.title || 'Visual Record',
        displayOrder: 0,
      };
    }
    return activeAlbum.items[activePhotoIndex] || activeAlbum.items[0];
  }, [activeAlbum, activePhotoIndex]);

  // Lightbox handlers
  const openLightbox = (album: GalleryAlbum, photoIdx = 0) => {
    setLightboxAlbum(album);
    setLightboxPhotoIndex(photoIdx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxAlbum(null);
  };

  const nextLightboxPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!lightboxAlbum || !lightboxAlbum.items?.length) return;
    setLightboxPhotoIndex((prev) => (prev + 1) % lightboxAlbum.items.length);
  };

  const prevLightboxPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!lightboxAlbum || !lightboxAlbum.items?.length) return;
    setLightboxPhotoIndex((prev) => (prev - 1 + lightboxAlbum.items.length) % lightboxAlbum.items.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightboxPhoto();
      if (e.key === 'ArrowLeft') prevLightboxPhoto();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, lightboxAlbum]);

  const getInstitutionDetails = (code: string) => {
    return (
      INSTITUTIONS.find((i) => i.code === code) || {
        code: 'ALL',
        label: 'Shri Nirakar Education Society',
        shortName: 'Education Society',
        location: 'Canacona, South Goa',
        curatorialBadge: 'Estd. 1968',
        accent: '#B45309',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        desc: '',
      }
    );
  };

  const totalCuratedFrames = useMemo(() => {
    return allAlbums.reduce((sum, a) => sum + (a.items?.length || 1), 0);
  }, [allAlbums]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      <Helmet>
        <title>Campus Photo Gallery — Archival Visual Chronicle | Shri Nirakar Education Society</title>
        <meta
          name="description"
          content="Explore authentic photographs and visual stories from Shri Nirakar High School (Mashem), Tudal High School (Gaondongrem), and S.S. Angle HSS (Dapot)."
        />
      </Helmet>

      <Navbar />

      {/* HEADER BANNER - Consistent with About, Batch Photos, Admissions */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center space-y-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-flex items-center gap-1.5">
              <Camera size={13} />
              <span>The Curatorial Exhibition &middot; 3 Campuses</span>
            </span>
            <span className="text-xs font-mono text-stone-300 bg-white/5 px-3 py-1 rounded-full border border-white/10 hidden sm:inline-block">
              Mashem &middot; Gaondongrem &middot; Dapot
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Campus Life &amp; <span className="text-amber-400 italic">Living Memories</span>
          </h1>

          <p className="max-w-3xl text-stone-300 text-sm sm:text-base leading-relaxed">
            Every photograph here captures the heartbeat of Canacona’s students — from lab experiments and coastal sports championships to Goan folk traditions across our three institutions.
          </p>

          {/* Quick HUD Metrics Bar */}
          <div className="pt-2 flex items-center justify-center gap-6 text-xs font-mono text-stone-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span><strong>{allAlbums.length}</strong> Curated Collections</span>
            </div>
            <span>&middot;</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span><strong>{totalCuratedFrames}</strong> Archival Photographs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scoop Edge with Golden Hairline - standard across all pages */}
      <SectionEdge variant="scoop" color="#FAF8F5" bgColor="#0b132b" height={36} withGoldLine />

      {/* MAIN CONTAINER */}
      <main className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-6 sm:py-8 space-y-8">
        {/* INTERACTIVE CONTROLS & FILTER BAR */}
        <section className="w-full bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
            {/* Campus selector buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {INSTITUTIONS.map((inst) => {
                const active = selectedCampus === inst.code;
                return (
                  <button
                    key={inst.code}
                    onClick={() => {
                      setSelectedCampus(inst.code);
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-2 rounded-xl font-serif text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      active
                        ? 'bg-[#111b5e] text-white shadow-md shadow-[#111b5e]/20 scale-[1.02]'
                        : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/70'
                    }`}
                  >
                    <span>{inst.shortName}</span>
                    {active && <Check size={13} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>

            {/* Right Tools: Search & Stage vs Sheet View Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[240px] sm:w-72">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search event, science, sports..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50 hover:bg-white focus:bg-white text-stone-900 placeholder:text-stone-400 border border-stone-200 focus:border-[#111b5e] rounded-xl outline-none font-sans transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* View Switcher: Curator Stage vs Contact Sheet */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0">
                <button
                  onClick={() => setViewMode('curatorial')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    viewMode === 'curatorial'
                      ? 'bg-white text-[#111b5e] font-bold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Curator Exhibition Stage"
                >
                  <Film size={13} />
                  <span>Curator Stage</span>
                </button>
                <button
                  onClick={() => setViewMode('sheet')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    viewMode === 'sheet'
                      ? 'bg-white text-[#111b5e] font-bold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Archival Contact Sheet Grid"
                >
                  <Grid size={13} />
                  <span>Contact Sheet</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* EXHIBITION CONTENT AREA */}
        {filteredAlbums.length === 0 ? (
          /* Empty Search State */
          <div className="my-16 max-w-lg mx-auto bg-white border border-dashed border-stone-300 rounded-3xl p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
              <Camera size={28} />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">No Photo Collections Found</h3>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              We couldn’t find any photographic collections matching "{searchQuery}". Try selecting another campus tab or clearing the query.
            </p>
            <button
              onClick={() => {
                setSelectedCampus('ALL');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#111b5e] hover:bg-[#111b5e]/90 text-white font-serif font-bold text-xs transition-colors cursor-pointer"
            >
              Reset Exhibition View
            </button>
          </div>
        ) : viewMode === 'curatorial' && activeAlbum ? (
          /* ========================================================================= */
          /* Bespoke Mode 1: Interactive Curatorial Exhibition Stage                   */
          /* ========================================================================= */
          <div className="space-y-8">
            {/* STAGE CONTAINER */}
            <div className="w-full bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 lg:p-8 shadow-sm relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Visual Viewport (8 Cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Photo Frame Container */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-md group">
                    <img
                      key={activePhoto.url}
                      src={activePhoto.url}
                      alt={activePhoto.caption || activeAlbum.title}
                      className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02]"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Top Status Bar */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-auto">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/15">
                          {activeAlbum.category || 'Curated Exhibition'}
                        </span>
                        <span className="font-mono text-[10px] text-stone-200 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 hidden sm:inline-block">
                          Frame {activePhotoIndex + 1} of {activeAlbum.items?.length || 1}
                        </span>
                      </div>

                      <button
                        onClick={() => openLightbox(activeAlbum, activePhotoIndex)}
                        className="bg-black/70 hover:bg-amber-400 hover:text-stone-950 text-white p-2 sm:px-3 sm:py-1.5 rounded-xl border border-white/20 backdrop-blur-md font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Enter Fullscreen Darkroom Inspection"
                      >
                        <Maximize2 size={13} />
                        <span className="hidden sm:inline">Inspect Fullscreen</span>
                      </button>
                    </div>

                    {/* Bottom Caption Pill */}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                      <div className="bg-black/75 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-white/15 max-w-xl text-white">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 mb-1">
                          <Aperture size={11} />
                          <span>Curator Notes &middot; Frame {activePhotoIndex + 1}</span>
                        </div>
                        <p className="text-white text-xs sm:text-sm font-light leading-snug">
                          {activePhoto.caption || activeAlbum.description || activeAlbum.title}
                        </p>
                      </div>

                      {/* Photo Prev/Next Buttons on Stage */}
                      {(activeAlbum.items?.length || 0) > 1 && (
                        <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/20 shrink-0 text-white">
                          <button
                            onClick={() =>
                              setActivePhotoIndex((prev) =>
                                prev === 0 ? activeAlbum.items.length - 1 : prev - 1
                              )
                            }
                            className="p-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Previous Frame"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="font-mono text-xs font-bold text-amber-400 px-1">
                            {activePhotoIndex + 1}/{activeAlbum.items.length}
                          </span>
                          <button
                            onClick={() =>
                              setActivePhotoIndex((prev) =>
                                (prev + 1) % activeAlbum.items.length
                              )
                            }
                            className="p-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Next Frame"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Contact Filmstrip for this Album */}
                  {(activeAlbum.items?.length || 0) > 1 && (
                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Film size={12} className="text-[#111b5e]" />
                        <span className="font-mono text-[11px] uppercase tracking-wider text-stone-600 font-semibold">
                          Curated Filmstrip Reel ({activeAlbum.items.length} frames)
                        </span>
                      </div>
                      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-300">
                        {activeAlbum.items.map((item, idx) => {
                          const isFrameActive = idx === activePhotoIndex;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setActivePhotoIndex(idx)}
                              className={`relative shrink-0 w-24 sm:w-28 h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                                isFrameActive
                                  ? 'border-[#111b5e] ring-2 ring-[#111b5e]/30 scale-105'
                                  : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-400'
                              }`}
                            >
                              <img
                                src={item.url}
                                alt={item.caption || `Frame ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 font-mono text-[9px] bg-black/80 px-1 rounded text-white">
                                #{idx + 1}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Album Provenance & Exhibition Dossier (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
                  {(() => {
                    const instDetails = getInstitutionDetails(activeAlbum.institutionCode);
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider uppercase border ${instDetails.badgeClass}`}>
                            {instDetails.curatorialBadge}
                          </span>
                        </div>

                        <div>
                          <span className="font-mono text-xs text-[#111b5e] uppercase tracking-widest font-bold block mb-1">
                            {instDetails.label}
                          </span>
                          <h2 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                            {activeAlbum.title}
                          </h2>
                          <div className="flex items-center gap-2 mt-2 text-xs font-mono text-stone-500">
                            <MapPin size={12} className="text-amber-600" />
                            <span>{instDetails.location}</span>
                            {activeAlbum.eventDate && (
                              <>
                                <span>&middot;</span>
                                <Calendar size={12} className="text-amber-600" />
                                <span>
                                  {new Date(activeAlbum.eventDate).toLocaleDateString('en-GB', {
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {activeAlbum.description && (
                          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-700 text-xs sm:text-sm leading-relaxed">
                            {activeAlbum.description}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Actions & Inspection Button */}
                  <div className="space-y-3 pt-4 border-t border-stone-200">
                    <button
                      onClick={() => openLightbox(activeAlbum, activePhotoIndex)}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#111b5e] hover:bg-[#111b5e]/90 text-white font-serif font-bold text-sm tracking-wide transition-all shadow-md shadow-[#111b5e]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye size={16} />
                      <span>Launch Immersive Darkroom View</span>
                    </button>

                    <div className="flex items-center justify-between text-xs font-mono text-stone-500 px-1">
                      <span>Total frames in collection:</span>
                      <strong className="text-stone-900">
                        {activeAlbum.items?.length || 1} photographs
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CURATORIAL SHELVES / ALBUM SELECTOR (Page Albums) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-[#111b5e]" />
                  <span className="font-mono text-xs uppercase tracking-wider text-stone-700 font-bold">
                    Page {currentPage} Collections ({pageAlbums.length} Available)
                  </span>
                </div>
                <span className="font-mono text-xs text-stone-500 hidden sm:inline">
                  Click any folio card below to bring it to the Stage
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {pageAlbums.map((album) => {
                  const isCurrentActive = album.id === activeAlbum.id;
                  const inst = getInstitutionDetails(album.institutionCode);
                  const cover =
                    album.coverImage ||
                    album.items?.[0]?.url ||
                    '/images/science_lab.jpg';

                  return (
                    <div
                      key={album.id}
                      onClick={() => {
                        setActiveAlbumId(album.id);
                        setActivePhotoIndex(0);
                      }}
                      className={`group relative rounded-2xl overflow-hidden border p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                        isCurrentActive
                          ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-400/30 shadow-md'
                          : 'bg-white border-stone-200 hover:border-stone-400 shadow-2xs hover:shadow-md'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-stone-100">
                        <img
                          src={cover}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                        {/* Photo count pill */}
                        <div className="absolute top-2 right-2">
                          <span className="bg-black/70 backdrop-blur-md text-[10px] font-mono px-2 py-0.5 rounded-md border border-white/20 text-white flex items-center gap-1">
                            <Layers size={10} className="text-amber-400" />
                            <span>{album.items?.length || 1}</span>
                          </span>
                        </div>

                        {/* Location */}
                        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-stone-200 flex items-center gap-1">
                          <MapPin size={10} className="text-amber-400" />
                          <span>{inst.location.split(',')[0]}</span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                            {inst.shortName}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-stone-900 group-hover:text-[#111b5e] transition-colors line-clamp-1">
                            {album.title}
                          </h4>
                          <p className="text-stone-600 text-[11px] line-clamp-2 mt-1 leading-snug">
                            {album.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono">
                          <span
                            className={
                              isCurrentActive ? 'text-amber-700 font-bold' : 'text-stone-500'
                            }
                          >
                            {isCurrentActive ? '● On Stage' : 'Click to Load'}
                          </span>
                          <ArrowUpRight
                            size={12}
                            className="text-stone-400 group-hover:text-[#111b5e] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* Bespoke Mode 2: Archival Contact Sheet Grid View                          */
          /* ========================================================================= */
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-stone-500 border-b border-stone-200 pb-3">
              <span>CONTACT SHEET INDEX &middot; ALL FRAMES INSPECTION</span>
              <span>
                Displaying {pageAlbums.length} Collections of {totalAlbums} Total
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pageAlbums.map((album) => {
                const inst = getInstitutionDetails(album.institutionCode);
                const items = album.items || [];

                return (
                  <article
                    key={album.id}
                    className="bg-white border border-stone-200/90 rounded-3xl p-6 space-y-4 hover:border-amber-400/60 shadow-xs hover:shadow-lg transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-amber-800 uppercase tracking-widest block mb-1">
                          {inst.label} &middot; {inst.location}
                        </span>
                        <h3 className="font-serif text-xl font-bold text-stone-900 leading-snug">
                          {album.title}
                        </h3>
                        {album.description && (
                          <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                            {album.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => openLightbox(album, 0)}
                        className="bg-stone-100 hover:bg-[#111b5e] hover:text-white text-stone-700 p-2.5 rounded-xl border border-stone-200 transition-all cursor-pointer shrink-0"
                        title="View Album"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>

                    {/* Contact Negative Strip (All Photos in this collection) */}
                    <div className="grid grid-cols-3 gap-2.5 pt-2">
                      {items.map((photo, pIdx) => (
                        <div
                          key={photo.id}
                          onClick={() => openLightbox(album, pIdx)}
                          className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200 cursor-pointer group hover:border-[#111b5e] transition-all"
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption || `Frame ${pIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye size={16} className="text-white" />
                          </div>
                          <span className="absolute bottom-1 right-1 font-mono text-[9px] bg-black/80 px-1 rounded text-white">
                            #{pIdx + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <Layers size={12} className="text-[#111b5e]" />
                        <span>{items.length} Archival Frames</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveAlbumId(album.id);
                          setViewMode('curatorial');
                        }}
                        className="text-[#111b5e] hover:text-amber-700 font-semibold underline underline-offset-4 cursor-pointer"
                      >
                        Load to Curator Stage &rarr;
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ELEGANT PAGINATION BAR */}
        {totalAlbums > 0 && (
          <div className="mt-12 w-full bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="font-mono text-xs text-stone-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>
                Page <strong className="text-stone-900">{currentPage}</strong> of{' '}
                <strong className="text-stone-900">{totalPages}</strong> &middot;{' '}
                <span>
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalAlbums)} of {totalAlbums} folios
                </span>
              </span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs text-stone-700 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    const isPageActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                          isPageActive
                            ? 'bg-[#111b5e] text-white shadow-sm scale-105'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs text-stone-700 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* HISTORICAL GRADUATION ARCHIVE BRIDGE BANNER */}
        <div className="mt-14 w-full bg-gradient-to-r from-[#0b132b] via-[#111b5e] to-[#0b132b] rounded-3xl p-6 sm:p-8 lg:p-10 border border-amber-500/30 text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center lg:text-left">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-amber-400/30 inline-block">
              Centenary Memory Corridor
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-black text-white">
              Searching for Historic Class Batch Graduation Portraits?
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed max-w-2xl">
              In addition to event chronicles, we curate the permanent historical archive of annual class cohorts from 1968 to 2026 across SSC and Higher Secondary departments.
            </p>
          </div>

          <a
            href="/batch-photos"
            className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-serif font-bold text-xs sm:text-sm tracking-wide transition-all shadow-xl shadow-amber-400/20 shrink-0 inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Visit Class Batch Archive (1968–2026)</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* IMMERSIVE CURATORIAL DARKROOM LIGHTBOX MODAL                              */}
      {/* ========================================================================= */}
      {lightboxOpen && lightboxAlbum && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-fadeIn select-none"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between border-b border-white/10 pb-4 text-white z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <Aperture size={12} />
                <span>Curatorial Darkroom Inspection &middot; Frame {lightboxPhotoIndex + 1} of {lightboxAlbum.items?.length || 1}</span>
              </span>
              <h3 className="font-serif text-base sm:text-xl font-bold text-white">
                {lightboxAlbum.title}
              </h3>
            </div>

            <button
              onClick={closeLightbox}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
            >
              <X size={16} />
              <span className="hidden sm:inline">Close Inspector</span>
            </button>
          </div>

          {/* Main Inspection Viewport */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            {(lightboxAlbum.items?.length || 0) > 1 && (
              <button
                onClick={prevLightboxPhoto}
                className="absolute left-2 sm:left-6 z-20 w-12 h-12 rounded-2xl bg-black/60 hover:bg-amber-400 hover:text-stone-950 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Current Image */}
            <div className="max-w-5xl max-h-[75vh] relative flex flex-col items-center">
              <img
                src={
                  lightboxAlbum.items?.[lightboxPhotoIndex]?.url ||
                  lightboxAlbum.coverImage ||
                  '/images/science_lab.jpg'
                }
                alt={lightboxAlbum.items?.[lightboxPhotoIndex]?.caption || lightboxAlbum.title}
                className="max-h-[68vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/15"
              />

              {/* Inspector Caption Footer */}
              <div className="mt-3 bg-black/80 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/15 text-center max-w-2xl">
                <p className="text-xs sm:text-sm text-stone-200 font-light">
                  {lightboxAlbum.items?.[lightboxPhotoIndex]?.caption ||
                    lightboxAlbum.description ||
                    lightboxAlbum.title}
                </p>
              </div>
            </div>

            {/* Next Button */}
            {(lightboxAlbum.items?.length || 0) > 1 && (
              <button
                onClick={nextLightboxPhoto}
                className="absolute right-2 sm:right-6 z-20 w-12 h-12 rounded-2xl bg-black/60 hover:bg-amber-400 hover:text-stone-950 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
                title="Next (Right Arrow)"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Filmstrip in Modal */}
          {(lightboxAlbum.items?.length || 0) > 1 && (
            <div
              className="border-t border-white/10 pt-4 flex items-center justify-center gap-2 overflow-x-auto z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxAlbum.items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setLightboxPhotoIndex(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    idx === lightboxPhotoIndex
                      ? 'border-amber-400 scale-110 shadow-lg'
                      : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};
