import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Film, 
  Check,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { getSafeVideoEmbedUrl, CampusEvent, EventPhoto, EventDocument } from '../components/NewsAndEvents.js';
import { slugify } from '../utils/slugify.js';

const KNOWN_EVENTS: CampusEvent[] = [
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
    location: 'Mashem Central Sports Pavilion & Athletics Field, Canacona',
    campus: 'Shri Nirakar High School, Mashem',
    institutionCode: 'NIRAKAR_HS',
    category: 'Athletics & Sports',
    coverImage: '/images/sports_champs.jpg',
    photos: [
      { url: '/images/sports_champs.jpg', caption: 'Volleyball state-level championship finals victory ceremony at Mashem pavilion. Photo: Society Sports Archive.', altText: 'Students celebrating volleyball tournament win' },
      { url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1600&q=80', caption: '100m sprint heats line-up at the central athletic track. Photo: Campus Chronicle.', altText: 'Runners on track' },
      { url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1600&q=80', caption: 'Inter-school kabaddi playoff finals between Nirakar HS and Tudal HS.', altText: 'Kabaddi match' },
      { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80', caption: 'Annual march-past parade led by the society brass band along the pavilion pavilion.', altText: 'Parade ceremony' }
    ],
    documents: [
      { url: '/documents/athletics_schedule_2026.pdf', title: 'Official Championship Rulebook & Event Schedule 2026', size: '1.8 MB' },
      { url: '/documents/track_route_map.pdf', title: 'Pavilion Ground Track Layout & Spectator Guidelines', size: '820 KB' }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: `The premier annual sporting spectacle of Shree Nirakar Education Society convenes more than 800 student-athletes across three premier institutions: Shri Nirakar High School (Mashem), Tudal High School (Gaondongrem), and S.S. Angle Higher Secondary School (Dapot).

Field competitions include 100m, 200m, and 400m sprint heats, 4x100m campus relay, high jump, long jump, and shot put. The afternoon session hosts the state-level volleyball championship finals and the inter-school kabaddi championship playoffs.

The proceedings commence with the ceremonial march-past parade inspected by the Chairman, Headmaster, and Directorate of Sports officials. All parents, alumni, and community elders from Mashem, Loliem, Polem, and Gaondongrem are cordially invited to celebrate student sportsmanship.`,
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
    campus: 'Shri Nirakar High School, Mashem',
    institutionCode: 'NIRAKAR_HS',
    category: 'Academic Honor',
    coverImage: '/images/campuses/nirakar_high_school_mashem.png',
    photos: [
      { url: '/images/campuses/nirakar_high_school_mashem.png', caption: 'Shree Nirakar High School historic academic courtyard in Mashem.', altText: 'Mashem campus' },
      { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80', caption: 'Honorary gold medal felicitation of Goa Board state distinction holders.', altText: 'Award ceremony' }
    ],
    documents: [
      { url: '/documents/merit_roll_2026.pdf', title: 'Goa Board SSC & HSSC Society Merit Roll 2026', size: '2.1 MB' }
    ],
    videoUrl: null,
    description: `Honoring distinction rankers, subject toppers, and our devoted faculty members who secured 100% pass percentages in the Goa Board of Secondary & Higher Secondary Education examinations.

The ceremony recognizes student excellence across science, arts, commerce, and vocational streams. Special endowments from the Society Founder Trust will be conferred to first-generation rural achievers.`,
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
    campus: 'Society Central, Mashem',
    institutionCode: 'NIRAKAR_HS',
    category: 'Alumni Gathering',
    coverImage: '/images/campuses/ss_angle_higher_secondary_mashem.png',
    photos: [
      { url: '/images/campuses/ss_angle_higher_secondary_mashem.png', caption: 'S.S. Angle Higher Secondary campus grounds at sunset.', altText: 'Campus view' },
      { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80', caption: 'Alumni from classes 1974 through 2025 gathered for heritage dialogue.', altText: 'Alumni reunion' }
    ],
    documents: [
      { url: '/documents/alumni_agenda_2026.pdf', title: '50-Year Alumni Council Charter & Project Allocations', size: '1.4 MB' }
    ],
    videoUrl: null,
    description: `Reconnecting classmates across five decades with authenticated directory verification, student career mentorship pledges, and cultural performances by alumni artists.

The gathering includes an interactive dialogue on school infrastructure expansion, rural scholarship corpus growth, and digital learning initiatives in Canacona.`,
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
    location: 'S.S. Angle HSS Science Wings & Laboratories, Dapot',
    campus: 'S.S. Angle Higher Secondary School, Dapot',
    institutionCode: 'ANGLE_HSS',
    category: 'Science & Innovation',
    coverImage: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1600&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1600&q=80', caption: 'Student robotics working prototypes demonstrating coastal micro-energy grids.', altText: 'Robotics exhibit' }
    ],
    documents: [
      { url: '/documents/science_fair_guidelines.pdf', title: 'Exhibition Project Guidelines & Evaluation Rubric', size: '1.2 MB' }
    ],
    videoUrl: null,
    description: `Showcasing 60+ interactive working models created by secondary and higher secondary students on coastal renewable energy, organic agro-science, and physics experiments.`,
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
    campus: 'Tudal High School, Gaondongrem',
    institutionCode: 'TUDAL_HS',
    category: 'Cultural Festival',
    coverImage: '/images/campuses/tudal_high_school_gaodongrem.png',
    photos: [
      { url: '/images/campuses/tudal_high_school_gaodongrem.png', caption: 'Tudal High School nestled in the Western Ghats foothills.', altText: 'Tudal school campus' }
    ],
    documents: [
      { url: '/documents/cultural_guidelines.pdf', title: 'Folk Dance Protocols & Judging Criteria', size: '940 KB' }
    ],
    videoUrl: null,
    description: `Celebrating authentic Goan rural heritage with traditional Fugdi, Dhalo, and Konkani one-act natak presentations performed by student troupes across South Goa.`,
    isUpcoming: true,
  },
  {
    id: 'e6',
    title: 'Directorate of Sports Goa State Volleyball Championship',
    dateStr: 'Tuesday, March 10, 2027',
    rawStartDate: '2027-03-10T08:00:00',
    day: '10',
    month: 'MAR',
    year: '2027',
    weekday: 'Tuesday',
    time: '08:00 AM – 06:00 PM',
    location: 'Mashem Central Sports Pavilion & Floodlit Court',
    campus: 'Society Central, Mashem',
    institutionCode: 'NIRAKAR_HS',
    category: 'Athletics & Sports',
    coverImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1600&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1600&q=80', caption: 'State volleyball tournament quarterfinal match in progress.', altText: 'Volleyball match' }
    ],
    documents: [
      { url: '/documents/volleyball_brackets.pdf', title: 'Official Tournament Fixtures & Match Pools', size: '1.1 MB' }
    ],
    videoUrl: null,
    description: `Inter-district volleyball championship organized under the aegis of Directorate of Sports and Youth Affairs, Goa with top schools competing at Mashem.`,
    isUpcoming: true,
  }
];

export const EventDetailPage: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const routeParam = slug || id || '';
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  // Fetch event by slug or ID from API
  const { data: apiData } = useQuery({
    queryKey: ['event', routeParam],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/content/events/${routeParam}`);
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data || null;
      } catch {
        return null;
      }
    },
    staleTime: 60 * 1000,
  });

  // Resolve matching event by slug, title slug, or ID
  const event: CampusEvent = useMemo(() => {
    if (apiData) {
      let photos: EventPhoto[] = [];
      if (Array.isArray(apiData.photos)) photos = apiData.photos;
      else if (typeof apiData.photos === 'string') {
        try { photos = JSON.parse(apiData.photos); } catch {}
      }

      let documents: EventDocument[] = [];
      if (Array.isArray(apiData.documents)) documents = apiData.documents;
      else if (typeof apiData.documents === 'string') {
        try { documents = JSON.parse(apiData.documents); } catch {}
      }

      const cover = apiData.coverUrl || apiData.image || photos[0]?.url || '/images/sports_champs.jpg';
      if (photos.length === 0 && cover) {
        photos = [{ url: cover, caption: `${apiData.title}. Photo: Society Archives.`, altText: apiData.title }];
      }

      return {
        id: String(apiData.id),
        title: apiData.title,
        dateStr: apiData.startDate ? new Date(apiData.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Wednesday, October 28, 2026',
        rawStartDate: apiData.startDate,
        rawEndDate: apiData.endDate,
        day: apiData.startDate ? String(new Date(apiData.startDate).getDate()).padStart(2, '0') : '28',
        month: apiData.startDate ? new Date(apiData.startDate).toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'OCT',
        year: apiData.startDate ? String(new Date(apiData.startDate).getFullYear()) : '2026',
        weekday: apiData.startDate ? new Date(apiData.startDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'Wednesday',
        time: '08:30 AM – 05:00 PM',
        location: apiData.location || 'Mashem Central Sports Pavilion & Athletics Field, Canacona',
        campus: apiData.institutionCode === 'NIRAKAR_HS' ? 'Shri Nirakar High School, Mashem' : apiData.institutionCode === 'TUDAL_HS' ? 'Tudal High School, Gaondongrem' : apiData.institutionCode === 'ANGLE_HSS' ? 'S. S. Angle Higher Secondary School, Dapot' : 'Society Central, Mashem',
        institutionCode: apiData.institutionCode || '',
        category: apiData.category || 'Athletics & Sports',
        coverImage: cover,
        photos,
        documents,
        videoUrl: apiData.videoUrl || null,
        pdfUrl: apiData.pdfUrl || (documents[0]?.url) || null,
        description: apiData.description || 'Official campus gathering convened by Shree Nirakar Education Society.',
        isUpcoming: apiData.isUpcoming ?? true,
      };
    }

    if (routeParam) {
      const match = KNOWN_EVENTS.find(
        (e) => slugify(e.title) === routeParam || e.id === routeParam || routeParam.includes(e.id)
      );
      if (match) return match;
    }

    return KNOWN_EVENTS[0];
  }, [apiData, routeParam]);

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `${event.title} • ${event.dateStr} at ${event.location}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {}
  };

  const getGoogleCalendarUrl = (ev: CampusEvent) => {
    const title = encodeURIComponent(ev.title);
    const details = encodeURIComponent(`${ev.description}\n\nVenue: ${ev.location}\nCampus: ${ev.campus}`);
    const location = encodeURIComponent(ev.location);
    let dates = '';
    if (ev.rawStartDate) {
      try {
        const start = new Date(ev.rawStartDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
        const end = ev.rawEndDate 
          ? new Date(ev.rawEndDate).toISOString().replace(/-|:|\.\d\d\d/g, '')
          : new Date(new Date(ev.rawStartDate).getTime() + 4 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '');
        dates = `${start}/${end}`;
      } catch {}
    }
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${dates ? `&dates=${dates}` : ''}`;
  };

  const safeEmbedUrl = getSafeVideoEmbedUrl(event.videoUrl);
  const isDirectVideo = safeEmbedUrl ? (safeEmbedUrl.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i) || safeEmbedUrl.startsWith('/uploads/')) : false;

  // Split description into lead paragraph and body
  const descParagraphs = event.description.split('\n\n').filter(Boolean);
  const leadParagraph = descParagraphs[0] || '';
  const bodyParagraphs = descParagraphs.slice(1);

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-amber-200 selection:text-stone-900">
      <Helmet>
        <title>{`${event.title} | Shree Nirakar Education Society`}</title>
        <meta name="description" content={event.description.slice(0, 160)} />
      </Helmet>

      <Navbar />

      {/* FULL-WIDTH REFINED BREADCRUMB STRIP */}
      <div className="w-full border-b border-stone-200/80 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-3">
        <div className="w-full flex items-center justify-between text-xs font-mono text-stone-500">
          <div className="flex items-center gap-2 truncate">
            <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <span className="text-stone-300">/</span>
            <Link to="/events" className="hover:text-stone-900 transition-colors">Campus Events</Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-800 font-medium truncate">{event.title}</span>
          </div>

          <Link
            to="/events"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-stone-600 hover:text-stone-900 shrink-0 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>All Events Archive</span>
          </Link>
        </div>
      </div>

      {/* EXPANSIVE FULL-WIDTH STRETCHED EDITORIAL CANVAS */}
      <main className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-14 space-y-10 sm:space-y-12">
        
        {/* 1. REFINED EDITORIAL HEADLINE & METADATA (NO AI-SLOP PILLS OR BOXES) */}
        <header className="space-y-4">
          
          {/* Understated Editorial Kicker */}
          <div className="text-xs sm:text-[13px] font-mono tracking-widest uppercase text-stone-500 font-semibold flex items-center gap-2">
            <span>{event.campus}</span>
            <span className="text-stone-300">•</span>
            <span className="text-amber-800">{event.category}</span>
            <span className="text-stone-300">•</span>
            <span>{event.isUpcoming ? 'Scheduled Gathering' : 'Past Archive'}</span>
          </div>

          {/* Grand Editorial Serif Title */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-[#0b132b] tracking-tight leading-[1.12]">
            {event.title}
          </h1>

          {/* Clean Hairline Dateline Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200/90 text-xs sm:text-sm font-sans text-stone-600">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                {event.dateStr}
              </span>
              <span className="text-stone-300 font-mono hidden sm:inline">|</span>
              <span className="text-stone-700">
                {event.time}
              </span>
              <span className="text-stone-300 font-mono hidden sm:inline">|</span>
              <span className="text-stone-600">
                {event.location}
              </span>
            </div>

            <div className="flex items-center gap-5 text-xs font-mono">
              <a
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-600 hover:text-[#0b132b] underline underline-offset-4 flex items-center gap-1 transition-colors"
              >
                <span>Add to Calendar</span>
                <ArrowUpRight size={13} />
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="text-stone-600 hover:text-[#0b132b] underline underline-offset-4 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedShare ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    <span>Share Event</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* 2. FULL-WIDTH CINEMATIC PHOTOGRAPHY CONTAINER */}
        {event.photos.length > 0 && (
          <section className="w-full space-y-3">
            <div className="relative w-full aspect-[21/9] sm:aspect-[2.35/1] min-h-[340px] sm:min-h-[460px] lg:min-h-[540px] rounded-2xl overflow-hidden bg-stone-900 shadow-sm border border-stone-200/90 group">
              <img
                src={event.photos[activePhotoIdx]?.url || event.coverImage}
                alt={event.photos[activePhotoIdx]?.altText || event.title}
                className="w-full h-full object-cover transition-opacity duration-500"
              />

              {/* Minimal Prev / Next Arrows */}
              {event.photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? event.photos.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((prev) => (prev === event.photos.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-mono font-medium bg-black/60 backdrop-blur-md text-white border border-white/20 select-none">
                    {activePhotoIdx + 1} / {event.photos.length}
                  </div>
                </>
              )}
            </div>

            {/* Authentic Photographic Caption */}
            {event.photos[activePhotoIdx]?.caption && (
              <p className="text-xs sm:text-sm text-stone-500 italic font-serif pt-1">
                {event.photos[activePhotoIdx].caption}
              </p>
            )}

            {/* Minimalist thumbnail row */}
            {event.photos.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-2 scrollbar-none">
                {event.photos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative h-16 w-24 sm:h-20 sm:w-32 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx 
                        ? 'border-[#0b132b] shadow-sm' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. EXPANSIVE FULL-WIDTH 2-COLUMN EDITORIAL CONTENT GRID */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-8 border-t border-stone-200/90">
          
          {/* Main Chronicle Narrative Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* The Gathering Chronicle */}
            <article className="space-y-6">
              <h2 className="text-xs font-mono uppercase tracking-widest text-stone-400 font-bold">
                Chronicle & Order of Proceedings
              </h2>

              {leadParagraph && (
                <p className="text-lg sm:text-xl font-serif text-stone-800 leading-relaxed font-normal">
                  {leadParagraph}
                </p>
              )}

              {bodyParagraphs.map((para, i) => (
                <p key={i} className="text-stone-700 text-base sm:text-lg leading-relaxed font-sans">
                  {para}
                </p>
              ))}
            </article>

            {/* Official Campus Video Recording (if present) */}
            {safeEmbedUrl && (
              <div className="space-y-3 pt-8 border-t border-stone-200">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-900 font-bold">
                  <Film size={14} className="text-purple-600" />
                  <span>Official Campus Video Recording</span>
                </div>

                <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-black shadow-sm border border-stone-200">
                  {isDirectVideo ? (
                    <video 
                      src={safeEmbedUrl} 
                      controls 
                      playsInline 
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={safeEmbedUrl}
                      title={`${event.title} Video Player`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Back link */}
            <div className="pt-8 border-t border-stone-200">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0b132b] hover:text-amber-700 hover:underline transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Return to All Campus Events Archive</span>
              </Link>
            </div>
          </div>

          {/* Refined Institutional Fact Sheet & Documents Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Event Logistics Fact Sheet */}
            <div className="space-y-5">
              <h3 className="font-serif text-lg font-bold text-[#0b132b] pb-2 border-b border-stone-300">
                Event Information
              </h3>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Date & Day</dt>
                  <dd className="font-serif font-bold text-stone-900 mt-0.5">{event.dateStr}</dd>
                </div>

                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Timing</dt>
                  <dd className="font-medium text-stone-900 mt-0.5">{event.time}</dd>
                </div>

                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Pavilion & Venue</dt>
                  <dd className="font-medium text-stone-900 mt-0.5">{event.location}</dd>
                  <dd className="text-xs text-stone-500 mt-0.5">{event.campus}</dd>
                </div>

                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Organised By</dt>
                  <dd className="text-xs font-medium text-stone-700 mt-0.5">
                    Shree Nirakar Education Society Central Office, Mashem, Canacona
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Admission</dt>
                  <dd className="text-xs text-stone-600 mt-0.5">
                    Open to all students, parents, alumni, and local community members.
                  </dd>
                </div>
              </dl>
            </div>

            {/* Official Rulebooks & Schedules (Downloads) */}
            {event.documents.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <h3 className="font-serif text-lg font-bold text-[#0b132b] pb-2 border-b border-stone-300 flex items-center gap-2">
                  <FileText size={16} className="text-amber-800" />
                  <span>Official Schedules & Rulebooks</span>
                </h3>

                <div className="space-y-2.5">
                  {event.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="p-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 shadow-xs flex items-center justify-between gap-3 text-xs font-sans group transition-all"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate group-hover:text-amber-800 transition-colors">
                          {doc.title || 'Official Event PDF'}
                        </div>
                        <div className="text-[11px] font-mono text-stone-500 mt-0.5">
                          {doc.size || 'Authenticated PDF Document'}
                        </div>
                      </div>

                      <Download size={15} className="text-stone-400 group-hover:text-[#0b132b] shrink-0 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Society Contact Information */}
            <div className="space-y-2 pt-4 border-t border-stone-200 text-xs text-stone-500 font-sans leading-relaxed">
              <div className="font-mono font-bold uppercase text-stone-600">Event Inquiries</div>
              <div>Administrative Central Desk: +91 832 2643236</div>
              <div>Office of the General Secretary, Mashem, Canacona, Goa</div>
            </div>

          </aside>

        </section>

      </main>

      <Footer />
    </div>
  );
};
