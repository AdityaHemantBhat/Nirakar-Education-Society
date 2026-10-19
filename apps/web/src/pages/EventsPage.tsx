import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { slugify } from '../utils/slugify.js';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { CustomSelect } from '../components/CustomSelect.js';
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Search, 
  Filter, 
  FileText, 
  Share2, 
  X, 
  Film, 
  Download, 
  Image as ImageIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2
} from 'lucide-react';
import { CampusEvent } from '../components/NewsAndEvents.js';

const ARCHIVE_EVENTS: CampusEvent[] = [
  {
    id: 'e1',
    title: 'Annual Inter-School Athletics & Sports Championship 2026',
    dateStr: 'Wednesday, October 28, 2026',
    rawStartDate: '2026-10-28T08:30:00',
    rawEndDate: '2026-10-28T17:00:00',
    day: '28',
    month: 'OCT',
    year: '2026',
    weekday: 'Wednesday',
    time: '08:30 AM – 05:00 PM',
    location: 'Mashem Central Sports Pavilion & Athletics Field',
    campus: 'Shri Nirakar High School (Mashem)',
    institutionCode: 'NIRAKAR_HS',
    category: 'Athletics & Sports',
    coverImage: '/images/sports_champs.jpg',
    photos: [
      { url: '/images/sports_champs.jpg', caption: 'Volleyball state-level championship finals victory ceremony', altText: 'Students celebrating volleyball tournament win' },
      { url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80', caption: '100m sprint line-up at Mashem pavilion', altText: 'Runners on track' },
      { url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80', caption: 'Kabaddi tournament inter-school playoff finals', altText: 'Kabaddi match' }
    ],
    documents: [
      { url: '/documents/athletics_schedule_2026.pdf', title: 'Official Championship Rulebook & Event Schedule 2026', size: '1.8 MB' },
      { url: '/documents/track_route_map.pdf', title: 'Pavilion Ground Track Layout & Spectator Guidelines', size: '820 KB' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Track and field sprint races, state-level volleyball finals, inter-school kabaddi championship, and march-past parade bringing together over 800 student athletes from Nirakar HS, Tudal HS, and S.S. Angle HSS across Canacona taluka.',
    isUpcoming: true,
  },
  {
    id: 'e2',
    title: 'Goa Board Secondary & Higher Secondary Merit Felicitations',
    dateStr: 'Thursday, November 12, 2026',
    rawStartDate: '2026-11-12T10:00:00',
    day: '12',
    month: 'NOV',
    year: '2026',
    weekday: 'Thursday',
    time: '10:00 AM – 01:30 PM',
    location: 'Shree Nirakar Memorial Auditorium, Mashem Campus',
    campus: 'Shri Nirakar High School (Mashem)',
    institutionCode: 'NIRAKAR_HS',
    category: 'Academic Honor',
    coverImage: '/images/campuses/nirakar_high_school_mashem.png',
    photos: [
      { url: '/images/campuses/nirakar_high_school_mashem.png', caption: 'Shree Nirakar High School heritage front courtyard', altText: 'Mashem campus' },
      { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80', caption: 'Honorary gold medal presentation to Goa Board toppers', altText: 'Award ceremony' }
    ],
    documents: [
      { url: '/documents/merit_roll_2026.pdf', title: 'Goa Board SSC & HSSC Society Merit Roll 2026', size: '2.1 MB' }
    ],
    videoUrl: null,
    description: 'Honoring distinction rankers, subject toppers, and our devoted mentor teachers who secured 100% results in the Goa Board examinations. Chief guest Shri Subhash Phal Dessai will address students.',
    isUpcoming: true,
  },
  {
    id: 'e3',
    title: 'Grand Annual Alumni Reunion & Heritage Dialogue Assembly',
    dateStr: 'Tuesday, December 22, 2026',
    rawStartDate: '2026-12-22T16:00:00',
    day: '22',
    month: 'DEC',
    year: '2026',
    weekday: 'Tuesday',
    time: '04:00 PM – 09:00 PM',
    location: 'Society Central Open Amphitheater & Lawns, Mashem',
    campus: 'Society Central',
    institutionCode: 'NIRAKAR_HS',
    category: 'Alumni Gathering',
    coverImage: '/images/campuses/ss_angle_higher_secondary_mashem.png',
    photos: [
      { url: '/images/campuses/ss_angle_higher_secondary_mashem.png', caption: 'S.S. Angle HSS modern academic block', altText: 'Campus view' },
      { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80', caption: 'Golden jubilee alumni gathering and networking dialogue', altText: 'Alumni reunion' }
    ],
    documents: [
      { url: '/documents/alumni_agenda_2026.pdf', title: '50-Year Alumni Council Charter & Project Allocations', size: '1.4 MB' }
    ],
    videoUrl: null,
    description: 'Reconnecting classmates across five decades with authenticated directory vouching, mentoring pledges for current rural students, and cultural performances by alumni artists.',
    isUpcoming: true,
  },
  {
    id: 'e4',
    title: 'Annual Science, Mathematics & Robotics Taluka Exhibition',
    dateStr: 'Friday, January 15, 2027',
    rawStartDate: '2027-01-15T09:30:00',
    day: '15',
    month: 'JAN',
    year: '2027',
    weekday: 'Friday',
    time: '09:30 AM – 04:30 PM',
    location: 'S.S. Angle HSS Modern Laboratories Complex',
    campus: 'S.S. Angle HSS (Dapot)',
    institutionCode: 'ANGLE_HSS',
    category: 'Science & Innovation',
    coverImage: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1200&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1200&q=80', caption: 'Student robotics models powered by solar micro-inverters', altText: 'Robotics project' }
    ],
    documents: [
      { url: '/documents/science_fair_guidelines.pdf', title: 'Exhibition Project Guidelines & Evaluation Rubric', size: '1.2 MB' }
    ],
    videoUrl: null,
    description: 'Featuring 60+ interactive working models created by secondary and higher secondary students on renewable coastal energy, organic cashew farming, and physics demonstrations.',
    isUpcoming: true,
  },
  {
    id: 'e5',
    title: 'All-Goa Inter-Collegiate Fugdi, Dhalo & Natak Folk Festival',
    dateStr: 'Saturday, February 06, 2027',
    rawStartDate: '2027-02-06T15:00:00',
    day: '06',
    month: 'FEB',
    year: '2027',
    weekday: 'Saturday',
    time: '03:00 PM – 09:30 PM',
    location: 'Tudal High School Open Air Cultural Grounds, Gaondongrem',
    campus: 'Tudal High School (Gaondongrem)',
    institutionCode: 'TUDAL_HS',
    category: 'Cultural Festival',
    coverImage: '/images/campuses/tudal_high_school_gaodongrem.png',
    photos: [
      { url: '/images/campuses/tudal_high_school_gaodongrem.png', caption: 'Tudal High School nestled in the Western Ghats greenery', altText: 'Tudal school campus' }
    ],
    documents: [
      { url: '/documents/cultural_guidelines.pdf', title: 'Folk Dance Protocols & Judging Criteria', size: '940 KB' }
    ],
    videoUrl: null,
    description: 'Celebrating authentic Goan rural arts with traditional Fugdi, Dhalo, and one-act Konkani natak presentations by student troupes across South Goa.',
    isUpcoming: true,
  },
  {
    id: 'e6',
    title: 'Golden Jubilee Founder Memorial Tree Plantation & Ecology Drive',
    dateStr: 'Saturday, July 18, 2026',
    rawStartDate: '2026-07-18T08:00:00',
    day: '18',
    month: 'JUL',
    year: '2026',
    weekday: 'Saturday',
    time: '08:00 AM – 12:30 PM',
    location: 'Canacona Coastal Eco Corridor & Mashem Riverbank',
    campus: 'Society Central',
    institutionCode: 'NIRAKAR_HS',
    category: 'Community Service',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80', caption: 'Students planting indigenous Goan saplings along coastal embankment', altText: 'Tree plantation' }
    ],
    documents: [
      { url: '/documents/ecology_report.pdf', title: 'Canacona Biodiversity & Sapling Conservation Register', size: '1.5 MB' }
    ],
    videoUrl: null,
    description: '1,500 indigenous fruit and mangrove saplings planted across Canacona by students, NCC cadets, and alumni to honor society founders.',
    isUpcoming: false,
  }
];

export const EventsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [campusFilter, setCampusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const eventsRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return ARCHIVE_EVENTS.filter((ev) => {
      const matchesCampus = campusFilter === 'all' || ev.institutionCode === campusFilter;
      const matchesTime = timeFilter === 'all' 
        ? true 
        : timeFilter === 'upcoming' 
          ? ev.isUpcoming 
          : !ev.isUpcoming;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || 
        ev.title.toLowerCase().includes(q) || 
        ev.description.toLowerCase().includes(q) || 
        ev.location.toLowerCase().includes(q);
      return matchesCampus && matchesTime && matchesSearch;
    });
  }, [search, campusFilter, timeFilter]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, campusFilter, timeFilter]);

  // Pagination calculation - strictly 8 items per page
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (eventsRef.current) {
      eventsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Featured flagship upcoming event for spotlight banner
  const featuredUpcomingEvent = useMemo(() => {
    return ARCHIVE_EVENTS.find((ev) => ev.isUpcoming);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>Campus Events Archive | Shree Nirakar Education Society</title>
        <meta name="description" content="Explore complete archive of athletic championships, academic awards, cultural festivals, and alumni gatherings." />
      </Helmet>

      <Navbar />

      {/* Header Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="w-full relative z-10 space-y-3">
          <span className="text-xs uppercase font-mono font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 inline-block">
            Central Society Academic & Cultural Calendar
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Campus Events & Historical Chronicles
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            The permanent society archive of athletic triumphs, Goa Board merit felicitations, science exhibitions, and cultural milestones across Canacona.
          </p>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF8F5" bgColor="#0b132b" height={36} withGoldLine />

      {/* Main Content & Filter Toolbar: Heavenly Minimal Layout (Optimized for 2GB/4GB RAM) */}
      <main ref={eventsRef} className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 space-y-8">
        
        {/* FEATURED UPCOMING FLAGSHIP EVENT (Serene Heavenly Spotlight) */}
        {featuredUpcomingEvent && timeFilter !== 'past' && !search && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0b132b] to-[#16247e] text-white shadow-xl border border-stone-200/20">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Event Image */}
              <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full overflow-hidden bg-stone-950">
                <img
                  src={featuredUpcomingEvent.coverImage}
                  alt={featuredUpcomingEvent.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0b132b]/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400 text-[#0b132b] shadow-xs">
                  <Sparkles size={12} />
                  <span>Upcoming Flagship Event</span>
                </div>
              </div>

              {/* Event Information */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-amber-300">
                    <span className="inline-flex items-center gap-1.5 font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                      <Calendar size={13} />
                      <span>{featuredUpcomingEvent.day} {featuredUpcomingEvent.month} {featuredUpcomingEvent.year}</span>
                    </span>
                    <span className="text-stone-300">
                      • {featuredUpcomingEvent.time}
                    </span>
                    <span className="text-stone-300 hidden sm:inline">
                      • {featuredUpcomingEvent.campus}
                    </span>
                  </div>

                  <h2 className="font-serif text-xl sm:text-3xl font-bold tracking-tight text-white hover:text-amber-200 transition-colors leading-snug">
                    <Link to={`/events/${slugify(featuredUpcomingEvent.title)}`}>
                      {featuredUpcomingEvent.title}
                    </Link>
                  </h2>

                  <div className="flex items-center gap-1.5 text-xs text-stone-300 font-sans">
                    <MapPin size={13} className="text-amber-400 shrink-0" />
                    <span>{featuredUpcomingEvent.location}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-200 font-sans leading-relaxed line-clamp-3">
                    {featuredUpcomingEvent.description}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    {featuredUpcomingEvent.photos.length > 0 && (
                      <span className="text-[11px] font-mono text-stone-300 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                        {featuredUpcomingEvent.photos.length} Photo Chronicles
                      </span>
                    )}
                    {featuredUpcomingEvent.documents.length > 0 && (
                      <span className="text-[11px] font-mono text-amber-200 bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
                        {featuredUpcomingEvent.documents.length} PDF Guidelines
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/events/${slugify(featuredUpcomingEvent.title)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0b132b] text-xs font-serif font-bold transition-all shadow-md cursor-pointer"
                  >
                    <span>Explore Full Chronicle</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MINIMAL SEARCH & FILTER BAR (Google Developer UI/UX Style) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by title, keyword, or venue..."
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

          {/* Timeline Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-stone-100 scrollbar-none">
            {[
              { key: 'all', label: 'All Chronicles', count: ARCHIVE_EVENTS.length },
              { key: 'upcoming', label: 'Upcoming Calendar', count: ARCHIVE_EVENTS.filter((e) => e.isUpcoming).length },
              { key: 'past', label: 'Past Chronicles', count: ARCHIVE_EVENTS.filter((e) => !e.isUpcoming).length },
            ].map((t) => {
              const isSelected = timeFilter === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTimeFilter(t.key as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0b132b] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULTS SUMMARY BAR */}
        <div className="flex items-center justify-between text-xs font-mono text-stone-500 px-1">
          <div>
            Showing <strong className="text-stone-900">{filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</strong>–<strong className="text-stone-900">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong className="text-stone-900">{filtered.length}</strong> campus events
            {campusFilter !== 'all' && (
              <span className="hidden sm:inline"> • Filtered Campus</span>
            )}
            {timeFilter !== 'all' && (
              <span className="hidden sm:inline"> • {timeFilter === 'upcoming' ? 'Upcoming Only' : 'Past Only'}</span>
            )}
          </div>

          {(search || campusFilter !== 'all' || timeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setCampusFilter('all');
                setTimeFilter('all');
              }}
              className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* EVENTS GRID - HEAVENLY MINIMAL CARDS (Strictly 8 items per page, zero lag on 2GB RAM) */}
        {paginatedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {paginatedEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${slugify(event.title)}`}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-amber-400 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer block text-inherit no-underline"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Status Pill */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                          event.isUpcoming
                            ? 'bg-amber-400 text-[#0b132b] shadow-xs'
                            : 'bg-black/60 backdrop-blur-xs text-white border border-white/20'
                        }`}
                      >
                        {event.isUpcoming ? 'Upcoming' : 'Concluded'}
                      </span>
                    </div>

                    {/* Media Badges */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 pointer-events-none">
                      {event.photos.length > 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-white border border-white/20">
                          <ImageIcon size={10} className="text-amber-400" />
                          <span>{event.photos.length}</span>
                        </span>
                      )}
                      {event.videoUrl && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-red-900/80 text-white border border-red-400/30">
                          <Film size={10} className="text-red-300" />
                          <span>Video</span>
                        </span>
                      )}
                      {event.documents.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-900/80 text-amber-200 border border-amber-400/30">
                          <FileText size={10} />
                          <span>{event.documents.length}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Event Meta & Content */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-900">
                      <span className="inline-flex items-center gap-1 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 text-[11px]">
                        <Calendar size={11} className="text-amber-600" />
                        <span>{event.day} {event.month} {event.year}</span>
                      </span>
                      <span className="text-stone-400 text-[11px] truncate">
                        {event.time}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-[#0b132b] transition-colors line-clamp-2 leading-snug">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-1 text-[11px] text-stone-500 font-sans truncate">
                      <MapPin size={11} className="text-amber-600 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>

                    <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-4 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-xs font-serif font-bold">
                  <span className="text-stone-700 group-hover:text-[#0b132b] transition-colors flex items-center gap-1">
                    <span>View Chronicle</span>
                    <ArrowRight size={12} />
                  </span>

                  <span className="text-[10px] font-mono font-semibold text-stone-400 truncate max-w-[120px]">
                    {event.campus.replace(/\(.*\)/, '')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 shadow-xs">
            <Calendar size={36} className="text-stone-300 mx-auto" />
            <h3 className="font-serif text-base font-bold text-stone-900">No events found matching your search</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No campus events match your selected criteria. Try adjusting your search keywords or switching time filters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCampusFilter('all');
                setTimeFilter('all');
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
              Page <strong className="text-stone-900">{currentPage}</strong> of <strong className="text-stone-900">{totalPages}</strong> ({filtered.length} events total)
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
