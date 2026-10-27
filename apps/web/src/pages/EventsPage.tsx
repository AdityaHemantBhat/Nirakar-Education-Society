import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { contentSlug } from '@nirakar/shared';
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
import { fetchEvents } from '../lib/content.js';
import { useQuery } from '@tanstack/react-query';

export const EventsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [campusFilter, setCampusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const eventsRef = useRef<HTMLDivElement>(null);

  /* The calendar, read from the registry. */
  const { data: events = [], isLoading } = useQuery<CampusEvent[]>({
    queryKey: ['public_events', timeFilter, campusFilter],
    queryFn: () => fetchEvents({ filter: timeFilter, institutionCode: campusFilter }),
    staleTime: 60 * 1000,
  });

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      const matchesCampus = campusFilter === 'all' || ev.institutionCode === campusFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q);
      return matchesCampus && matchesSearch;
    });
  }, [events, search, campusFilter, timeFilter]);

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
    return timeFilter === 'upcoming' || timeFilter === 'all' ? events.find((ev) => ev.isUpcoming) : undefined;
  }, [events, timeFilter]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>Campus Events Archive | Shri Nirakar Education Society</title>
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
                    <Link to={`/events/${contentSlug(featuredUpcomingEvent.title)}`}>
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
                    to={`/events/${contentSlug(featuredUpcomingEvent.title)}`}
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
              { key: 'today', label: 'Today', count: timeFilter === 'today' ? events.length : undefined },
              { key: 'upcoming', label: 'Upcoming Calendar', count: timeFilter === 'upcoming' ? events.length : undefined },
              { key: 'all', label: 'All Chronicles', count: timeFilter === 'all' ? events.length : undefined },
              { key: 'past', label: 'Past Chronicles', count: timeFilter === 'past' ? events.length : undefined },
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
                  {t.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
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
              <span className="hidden sm:inline"> • {timeFilter === 'today' ? 'Today Only' : timeFilter === 'upcoming' ? 'Upcoming Only' : 'Past Only'}</span>
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
        {isLoading ? (
          <div className="py-16 text-center text-sm text-stone-500">Loading campus events…</div>
        ) : paginatedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {paginatedEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${contentSlug(event.title)}`}
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
