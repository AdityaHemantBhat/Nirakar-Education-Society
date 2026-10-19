import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { slugify } from '../utils/slugify.js';
import { decodeNoticeMeta } from '../utils/noticeMeta.js';
import { 
  Calendar, 
  FileText, 
  ArrowRight, 
  MapPin, 
  Download, 
  Sparkles, 
  Bell, 
  ExternalLink,
  Clock,
  CheckCircle2,
  Bookmark,
  Share2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  Play,
  Film,
  Image as ImageIcon,
  Layers,
  Eye,
  Printer,
  Check,
  Copy,
  AlertCircle,
  Building2,
  Filter,
  Grid,
  ListFilter
} from 'lucide-react';

export interface EventPhoto {
  url: string;
  caption?: string;
  altText?: string;
}

export interface EventDocument {
  url: string;
  title: string;
  size?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  dateStr: string;
  rawStartDate: string;
  rawEndDate?: string | null;
  day: string;
  month: string;
  year: string;
  weekday: string;
  time: string;
  location: string;
  campus: string;
  institutionCode: string;
  category: string;
  coverImage: string;
  photos: EventPhoto[];
  documents: EventDocument[];
  videoUrl?: string | null;
  pdfUrl?: string | null;
  description: string;
  isUpcoming: boolean;
}

export interface NoticeItem {
  id: string;
  refNo: string;
  type: 'exam' | 'admission' | 'scholarship' | 'circular';
  title: string;
  date: string;
  urgent: boolean;
  fileSize: string;
  target: string;
  institutionCode: string;
  description: string;
  pdfUrl?: string | null;
  tapeColor?: 'amber' | 'sage' | 'lavender' | 'rose';
}

interface NewsAndEventsProps {
  upcoming?: any[];
  past?: any[];
  notices?: any[];
}

/**
 * Google Developer-grade URL Sanitizer for safe video embedding.
 */
export function getSafeVideoEmbedUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }

  const vimeoMatch = trimmed.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i
  );
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  if (
    trimmed.startsWith('/uploads/') ||
    trimmed.match(/^https:\/\/[a-zA-Z0-9.-]+\/.*\.(mp4|webm|mov|mkv)(\?.*)?$/i)
  ) {
    return trimmed;
  }

  return null;
}

/**
 * Authentic Washi Masking Tape Sticker Component using custom SVG paths with jagged torn edges.
 */
const WashiTapeSticker: React.FC<{ color?: 'amber' | 'sage' | 'lavender' | 'rose' }> = ({ color = 'amber' }) => {
  const configs = {
    amber: {
      fill: 'rgba(254, 240, 138, 0.88)',
      stroke: 'rgba(217, 119, 6, 0.4)',
      stripe: 'rgba(217, 119, 6, 0.25)',
      rotation: '-rotate-1',
    },
    sage: {
      fill: 'rgba(187, 247, 208, 0.88)',
      stroke: 'rgba(5, 150, 105, 0.4)',
      stripe: 'rgba(5, 150, 105, 0.25)',
      rotation: 'rotate-1',
    },
    lavender: {
      fill: 'rgba(233, 213, 255, 0.88)',
      stroke: 'rgba(124, 58, 237, 0.4)',
      stripe: 'rgba(124, 58, 237, 0.25)',
      rotation: '-rotate-2',
    },
    rose: {
      fill: 'rgba(254, 205, 211, 0.88)',
      stroke: 'rgba(225, 29, 72, 0.4)',
      stripe: 'rgba(225, 29, 72, 0.25)',
      rotation: 'rotate-2',
    },
  }[color];

  return (
    <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-sm select-none ${configs.rotation}`}>
      <svg width="132" height="28" viewBox="0 0 132 28" fill="none">
        <path
          d="M 6 1 L 126 1 L 131 5 L 127 9 L 131 14 L 126 19 L 130 23 L 125 27 L 6 27 L 1 23 L 5 18 L 0 14 L 5 9 L 1 4 Z"
          fill={configs.fill}
          stroke={configs.stroke}
          strokeWidth="0.8"
        />
        <line x1="22" y1="2" x2="34" y2="26" stroke={configs.stripe} strokeWidth="1" strokeDasharray="3 3" />
        <line x1="48" y1="2" x2="60" y2="26" stroke={configs.stripe} strokeWidth="1" strokeDasharray="3 3" />
        <line x1="74" y1="2" x2="86" y2="26" stroke={configs.stripe} strokeWidth="1" strokeDasharray="3 3" />
        <line x1="100" y1="2" x2="112" y2="26" stroke={configs.stripe} strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    </div>
  );
};

const DEFAULT_FALLBACK_EVENTS: CampusEvent[] = [
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
      { url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80', caption: '100m sprint sprint line-up at Mashem pavilion', altText: 'Runners on track' },
      { url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80', caption: 'Kabaddi tournament inter-school playoff finals', altText: 'Kabaddi match' },
      { url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80', caption: 'Annual march-past parade with society brass band', altText: 'Parade ceremony' }
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
    description: 'Reconnecting classmates across five decades with authenticated directory verification, mentoring pledges for current rural students, and cultural performances by alumni artists.',
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
    title: 'Directorate of Sports Goa State Volleyball Championship',
    dateStr: 'Tuesday, March 10, 2027',
    rawStartDate: '2027-03-10T08:00:00',
    day: '10',
    month: 'MAR',
    year: '2027',
    weekday: 'Tuesday',
    time: '08:00 AM – 06:00 PM',
    location: 'Mashem Central Sports Pavilion & Floodlit Court',
    campus: 'Society Central',
    institutionCode: 'NIRAKAR_HS',
    category: 'Athletics & Sports',
    coverImage: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80', caption: 'State volleyball tournament quarterfinal match in progress', altText: 'Volleyball match' }
    ],
    documents: [
      { url: '/documents/volleyball_brackets.pdf', title: 'Official Tournament Fixtures & Match Pools', size: '1.1 MB' }
    ],
    videoUrl: null,
    description: 'Inter-district volleyball tournament organized under the aegis of Directorate of Sports and Youth Affairs, Goa with top school teams competing.',
    isUpcoming: true,
  }
];

function formatCampusEvent(ev: any): CampusEvent {
  const d = new Date(ev.startDate);
  const isValidDate = !isNaN(d.getTime());

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const day = isValidDate ? String(d.getDate()).padStart(2, '0') : '28';
  const month = isValidDate ? months[d.getMonth()] : 'OCT';
  const year = isValidDate ? String(d.getFullYear()) : '2026';
  const weekday = isValidDate ? daysOfWeek[d.getDay()] : 'Wednesday';

  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = isValidDate ? fullMonthNames[d.getMonth()] : 'October';
  const dateStr = `${weekday}, ${monthName} ${isValidDate ? d.getDate() : 28}, ${year}`;

  let timeStr = '08:30 AM – 04:30 PM';
  if (ev.startDate && ev.startDate.includes('T')) {
    const timePart = ev.startDate.split('T')[1];
    if (timePart) {
      const [hh, mm] = timePart.split(':');
      const hour = parseInt(hh, 10);
      if (!isNaN(hour)) {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        timeStr = `${String(formattedHour).padStart(2, '0')}:${mm || '00'} ${ampm}`;
      }
    }
  }

  let campus = 'Society Central';
  if (ev.institutionCode === 'NIRAKAR_HS') campus = 'Shri Nirakar High School (Mashem)';
  else if (ev.institutionCode === 'TUDAL_HS') campus = 'Tudal High School (Gaondongrem)';
  else if (ev.institutionCode === 'ANGLE_HSS') campus = 'S.S. Angle HSS (Dapot)';
  else if (ev.campus) campus = ev.campus;

  let category = ev.category || 'Campus Gathering';
  const titleLower = (ev.title || '').toLowerCase();
  if (titleLower.includes('athletic') || titleLower.includes('sports') || titleLower.includes('volleyball')) {
    category = 'Athletics & Sports';
  } else if (titleLower.includes('merit') || titleLower.includes('felicitation') || titleLower.includes('academic') || titleLower.includes('board')) {
    category = 'Academic Honor';
  } else if (titleLower.includes('alumni') || titleLower.includes('reunion')) {
    category = 'Alumni Gathering';
  } else if (titleLower.includes('natak') || titleLower.includes('cultural') || titleLower.includes('fugdi') || titleLower.includes('folk')) {
    category = 'Cultural Festival';
  } else if (titleLower.includes('science') || titleLower.includes('robotics') || titleLower.includes('exhibition')) {
    category = 'Science & Innovation';
  }

  let parsedPhotos: EventPhoto[] = [];
  if (Array.isArray(ev.photos)) {
    parsedPhotos = ev.photos;
  } else if (typeof ev.photos === 'string') {
    try {
      parsedPhotos = JSON.parse(ev.photos);
    } catch {}
  }
  const primaryCover = ev.coverUrl || ev.image || (parsedPhotos[0]?.url) || '/images/sports_champs.jpg';
  if (parsedPhotos.length === 0 && primaryCover) {
    parsedPhotos = [{ url: primaryCover, caption: ev.title, altText: ev.title }];
  }

  let parsedDocuments: EventDocument[] = [];
  if (Array.isArray(ev.documents)) {
    parsedDocuments = ev.documents;
  } else if (typeof ev.documents === 'string') {
    try {
      parsedDocuments = JSON.parse(ev.documents);
    } catch {}
  }
  if (parsedDocuments.length === 0 && ev.pdfUrl) {
    parsedDocuments = [{ url: ev.pdfUrl, title: 'Official Event Protocols & Schedule', size: 'PDF' }];
  }

  return {
    id: String(ev.id || Math.random()),
    title: ev.title || 'Campus Gathering',
    dateStr,
    rawStartDate: ev.startDate || '',
    rawEndDate: ev.endDate || null,
    day,
    month,
    year,
    weekday,
    time: timeStr,
    location: ev.location || 'Society Central Sports Pavilion, Mashem, Canacona',
    campus,
    institutionCode: ev.institutionCode || '',
    category,
    coverImage: primaryCover,
    photos: parsedPhotos,
    documents: parsedDocuments,
    videoUrl: ev.videoUrl || null,
    pdfUrl: ev.pdfUrl || (parsedDocuments[0]?.url) || null,
    description: ev.description || 'Inter-school championship and academic gathering hosted by Shree Nirakar Education Society.',
    isUpcoming: ev.isUpcoming ?? true,
  };
}

function formatNoticeItem(n: any, idx: number): NoticeItem {
  let target = 'All Society Campuses';
  if (n.institutionCode === 'NIRAKAR_HS') target = 'Shri Nirakar High School • Mashem';
  else if (n.institutionCode === 'TUDAL_HS') target = 'Tudal High School • Gaondongrem';
  else if (n.institutionCode === 'ANGLE_HSS') target = 'S.S. Angle HSS • Dapot';

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
      ? `${n.institutionCode.replace('_', '/')}/CIR/${String(n.id || '').slice(-4).toUpperCase()}`
      : `SNES/CIR/${String(n.id || '').slice(-4).toUpperCase()}`;

  const tapeColors: Array<'amber' | 'sage' | 'lavender' | 'rose'> = ['amber', 'sage', 'lavender', 'rose'];
  const tapeColor = tapeColors[idx % tapeColors.length];

  return {
    id: String(n.id || Math.random()),
    refNo,
    type,
    title: n.title,
    date: n.date || new Date().toISOString().split('T')[0],
    urgent: n.urgent !== undefined ? Boolean(n.urgent) : decoded.urgent,
    fileSize: n.pdfUrl ? 'Official PDF' : 'Circular',
    target,
    institutionCode: n.institutionCode || '',
    description: decoded.content || n.content || n.description || 'Authenticated administrative directive issued by the central office.',
    pdfUrl: n.pdfUrl || null,
    tapeColor,
  };
}

export const NewsAndEvents: React.FC<NewsAndEventsProps> = ({ 
  upcoming = [], 
  past = [],
  notices = [] 
}) => {
  // Slider ref for smooth horizontal scrolling
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filters
  const [eventCampusFilter, setEventCampusFilter] = useState<string>('all');
  const [eventTimeFilter, setEventTimeFilter] = useState<'upcoming' | 'past'>('upcoming');

  // Notice board search & category filters
  const [noticeFilter, setNoticeFilter] = useState<'all' | 'exam' | 'admission' | 'scholarship'>('all');
  const [noticeSearch, setNoticeSearch] = useState('');

  // Process data with rich default fallback if list is small
  const upcomingEventsList: CampusEvent[] = useMemo(() => {
    const parsed = (upcoming || []).map(formatCampusEvent);
    return parsed.length > 0 ? parsed : DEFAULT_FALLBACK_EVENTS;
  }, [upcoming]);

  const pastEventsList: CampusEvent[] = useMemo(() => {
    return (past || []).map(formatCampusEvent);
  }, [past]);

  const rawNotices: NoticeItem[] = useMemo(() => {
    return (notices || []).map(formatNoticeItem);
  }, [notices]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    const list = eventTimeFilter === 'upcoming' 
      ? upcomingEventsList 
      : (pastEventsList.length > 0 ? pastEventsList : upcomingEventsList);
    if (eventCampusFilter === 'all') return list;
    return list.filter((ev) => ev.institutionCode === eventCampusFilter);
  }, [upcomingEventsList, pastEventsList, eventTimeFilter, eventCampusFilter]);

  // Filtered Notices
  const filteredNotices = useMemo(() => {
    return rawNotices.filter((n: NoticeItem) => {
      const matchesType = noticeFilter === 'all' || n.type === noticeFilter;
      const q = noticeSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        n.title.toLowerCase().includes(q) || 
        n.description.toLowerCase().includes(q) || 
        n.refNo.toLowerCase().includes(q) ||
        n.target.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [rawNotices, noticeFilter, noticeSearch]);

  // Slider scroll management
  const checkSliderScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkSliderScroll();
    const handleResize = () => checkSliderScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [filteredEvents]);

  const handleSlide = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const step = sliderRef.current.clientWidth / 3;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth'
      });
      setTimeout(checkSliderScroll, 300);
    }
  };

  return (
    <div id="news-and-events" className="w-full bg-[#FAF8F5] text-stone-900 font-sans selection:bg-amber-200 selection:text-stone-900">

      {/* ===================================================================== */}
      {/* 1. CAMPUS EVENTS 3-IN-A-ROW SLIDER (CRISP & CLEAR, NO BLUR/FOG)       */}
      {/* ===================================================================== */}
      <section className="relative w-full py-20 sm:py-24 border-b border-stone-200/80">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">

          {/* Section Header with View All Link and Slider Nav Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 backdrop-blur-md text-amber-900 text-xs font-mono font-bold uppercase tracking-wider mb-3.5 border border-amber-300/80 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                <span>Campus Life & Gathering Chronicles • 2026–2027</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b132b] tracking-tight">
                Campus Happenings & Gatherings
              </h2>
              <p className="text-stone-600 text-sm sm:text-base font-sans mt-3 max-w-2xl leading-relaxed">
                Live photographic dispatches from athletics championships, cultural festivals, academic honors, and student symposiums across Canacona.
              </p>
            </div>

            {/* Controls Toolbar: Campus Pills + Clean Prev/Next Arrow Buttons + View All */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Campus Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/70 backdrop-blur-md border border-stone-200 shadow-xs">
                {[
                  { code: 'all', label: 'All Campuses' },
                  { code: 'NIRAKAR_HS', label: 'Nirakar HS' },
                  { code: 'TUDAL_HS', label: 'Tudal HS' },
                  { code: 'ANGLE_HSS', label: 'S.S. Angle HSS' },
                ].map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setEventCampusFilter(c.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      eventCampusFilter === c.code
                        ? 'bg-[#0b132b] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Clean Slider Navigation Arrow Buttons (NO blurry fog!) */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/80 border border-stone-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => handleSlide('left')}
                  disabled={!canScrollLeft}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    canScrollLeft 
                      ? 'text-[#0b132b] hover:bg-stone-100' 
                      : 'text-stone-300 cursor-not-allowed'
                  }`}
                  aria-label="Previous events"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSlide('right')}
                  disabled={!canScrollRight}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    canScrollRight 
                      ? 'text-[#0b132b] hover:bg-stone-100' 
                      : 'text-stone-300 cursor-not-allowed'
                  }`}
                  aria-label="Next events"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* View All Events Link button directly to /events dedicated page */}
              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#0b132b] hover:bg-amber-600 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md shrink-0"
              >
                <span>View All Events</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* SLIDER WRAPPER (100% CRISP, NO BLUR/FOGGY OVERLAYS) */}
          <div className="relative w-full">

            {/* THE HORIZONTAL SLIDER CONTAINER: ONLY THREE VISIBLE IN A ROW ON DESKTOP */}
            <div
              ref={sliderRef}
              onScroll={checkSliderScroll}
              className="flex items-stretch gap-6 overflow-x-auto scroll-smooth scrollbar-none py-2 px-0.5"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {filteredEvents.map((event) => (
                <Link
                  to={`/events/${slugify(event.title)}`}
                  key={event.id}
                  style={{ scrollSnapAlign: 'start' }}
                  className="group relative flex-none w-[88vw] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-white/90 shadow-md hover:shadow-2xl hover:border-amber-400/80 transition-all duration-300 flex flex-col justify-between cursor-pointer block text-inherit no-underline"
                >
                  <div>
                    {/* Media Container with Floating Indicators (NO tags or SN icons) */}
                    <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20 pointer-events-none" />

                      {/* Floating Glassmorphic Media Badges */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-1.5">
                          {event.photos.length > 1 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                              <ImageIcon size={12} className="text-amber-400" />
                              <span>{event.photos.length} Photos</span>
                            </span>
                          )}
                          {event.videoUrl && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-red-900/75 backdrop-blur-md text-white border border-red-400/30">
                              <Film size={12} className="text-red-300" />
                              <span>Video</span>
                            </span>
                          )}
                        </div>

                        {event.documents.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-900/75 backdrop-blur-md text-amber-200 border border-amber-400/30">
                            <FileText size={12} />
                            <span>{event.documents.length} PDF{event.documents.length > 1 ? 's' : ''}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ARTISTIC SVG PATH CUTOUT TRANSITION (ORGANIC CURVED CUTOUT PATH) */}
                    <div className="relative -mt-6 z-10 w-full overflow-hidden leading-none pointer-events-none">
                      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-7 fill-white/85 text-white/85">
                        <path d="M0,0 C200,80 450,20 600,60 C750,100 1000,10 1200,50 L1200,120 L0,120 Z" />
                      </svg>
                    </div>

                    {/* Glassmorphic Card Body */}
                    <div className="p-5 sm:p-6 space-y-3.5 -mt-1">
                      
                      {/* Date & Time pill */}
                      <div className="flex items-center gap-2.5 text-xs font-mono text-amber-900">
                        <span className="inline-flex items-center gap-1.5 font-bold bg-amber-50/90 px-2.5 py-1 rounded-lg border border-amber-200/80 shadow-xs">
                          <Calendar size={12} className="text-amber-600" />
                          <span>{event.day} {event.month} {event.year}</span>
                        </span>
                        <span className="text-stone-500 text-[11px] truncate">
                          {event.time}
                        </span>
                      </div>

                      {/* Event Title in commanding serif */}
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0b132b] group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                        {event.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 font-sans">
                        <MapPin size={13} className="text-amber-600 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      {/* Description excerpt */}
                      <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Glassmorphic Action Bar */}
                  <div className="px-5 py-3.5 bg-white/40 backdrop-blur-sm border-t border-white/60 flex items-center justify-between text-xs font-mono font-bold">
                    <span className="text-[#0b132b] group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                      <span>View Event Post</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>

                    <span className="text-[11px] font-semibold text-stone-400">
                      {event.isUpcoming ? 'Upcoming' : 'Concluded'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Slider Bottom Archival Link Strip */}
            <div className="mt-8 flex items-center justify-between text-xs font-mono text-stone-500 border-t border-stone-200/70 pt-4">
              <span>Showing official campus events • Scroll or use arrows to browse</span>
              <Link
                to="/events"
                className="font-bold text-[#0b132b] hover:text-amber-700 hover:underline flex items-center gap-1"
              >
                <span>View All Past & Present Events Archive</span>
                <ChevronRight size={13} />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. AUTHENTIC NOTICE BOARD (OPENS DEDICATED NOTICE DETAIL PAGE)        */}
      {/* ===================================================================== */}
      <section className="relative w-full py-20 sm:py-24 bg-[#F2EEE6] border-b border-stone-300/80">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">

          {/* Section Header with View All Link */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-14">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111b5e]/10 text-[#111b5e] text-xs font-mono font-bold uppercase tracking-wider mb-3.5 border border-[#111b5e]/20">
                <ShieldCheck size={14} className="text-[#111b5e]" />
                <span>Official Institutional Registry • Central Gazette</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b132b] tracking-tight">
                Directorate Circulars & Official Notices
              </h2>
              <p className="text-stone-600 text-sm sm:text-base font-sans mt-3 max-w-2xl leading-relaxed">
                Authenticated board examination schedules, admission guidelines, government scholarships, and administrative orders for students, parents, and faculty across Canacona.
              </p>
            </div>

            {/* View All Notices Link button directly to /notices dedicated archive page */}
            <Link
              to="/notices"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#0b132b] hover:bg-amber-600 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md shrink-0"
            >
              <span>View All Notices</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* REAL BULLETIN BOARD (Fine Linen / Cork Backing with Subtle Glassmorphism) */}
          <div className="rounded-3xl bg-[#E8E1D3]/90 backdrop-blur-md p-4 sm:p-7 lg:p-9 shadow-xl border-4 border-[#C8BCAB]/90 relative overflow-hidden">
            
            {/* Search & Category Filter Bar */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/70 shadow-sm mb-10 space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search size={15} className="absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={noticeSearch}
                    onChange={(e) => setNoticeSearch(e.target.value)}
                    placeholder="Search circulars by keyword, Ref No., SSC/HSSC, scholarship..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50/80 hover:bg-white focus:bg-white text-stone-900 placeholder:text-stone-400 border border-stone-200 focus:border-amber-500 rounded-xl outline-none transition-all font-sans"
                  />
                  {noticeSearch && (
                    <button
                      type="button"
                      onClick={() => setNoticeSearch('')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                  {[
                    { key: 'all', label: 'All Circulars' },
                    { key: 'exam', label: 'Board Exams' },
                    { key: 'admission', label: 'Admissions' },
                    { key: 'scholarship', label: 'Scholarships' },
                  ].map((tab) => {
                    const isTabActive = noticeFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setNoticeFilter(tab.key as any)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide uppercase transition-all shrink-0 cursor-pointer ${
                          isTabActive
                            ? 'bg-[#0b132b] text-white shadow-xs'
                            : 'bg-stone-100/80 hover:bg-stone-200 text-stone-700 border border-stone-200/80'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Pinned Memorandum Cards Grid (With Washi Tape Stickers & Subtle Glassmorphism) */}
            {filteredNotices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8 pt-2">
                {filteredNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="group bg-white/85 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/80 shadow-md hover:shadow-xl hover:border-amber-400/80 transition-all flex flex-col justify-between relative text-stone-900"
                  >
                    {/* AUTHENTIC WASHI TAPE STICKER */}
                    <WashiTapeSticker color={notice.tapeColor} />

                    <div className="space-y-3 pt-2">
                      {/* Reference Number & Urgent Stamp */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="font-mono font-bold text-stone-500 tracking-wider">
                          {notice.refNo}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {notice.urgent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 animate-pulse">
                              URGENT
                            </span>
                          )}
                          <span className="text-stone-400 font-mono text-[11px]">
                            {notice.date}
                          </span>
                        </div>
                      </div>

                      {/* Notice Title linking directly to dedicated notice page */}
                      <Link
                        to={`/notices/${slugify(notice.title)}`}
                        className="font-serif text-base sm:text-lg font-bold text-[#0b132b] group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug cursor-pointer block no-underline"
                      >
                        {notice.title}
                      </Link>

                      {/* Target Campus Badge */}
                      <div className="inline-block text-[11px] font-mono text-amber-900 bg-amber-50/80 border border-amber-200/80 px-2.5 py-0.5 rounded-lg">
                        {notice.target}
                      </div>

                      {/* Excerpt */}
                      <p className="text-xs text-stone-600 font-sans leading-relaxed line-clamp-3">
                        {notice.description}
                      </p>
                    </div>

                    {/* Notice Card Action Footer */}
                    <div className="pt-4 mt-4 border-t border-stone-200/60 flex items-center justify-between gap-2">
                      <Link
                        to={`/notices/${slugify(notice.title)}`}
                        className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#0b132b] hover:text-amber-700 cursor-pointer"
                      >
                        <span>Read Circular</span>
                        <ChevronRight size={13} />
                      </Link>

                      {notice.pdfUrl && (
                        <a
                          href={notice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#0b132b] hover:bg-stone-800 text-white transition-colors"
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
              <div className="py-16 text-center space-y-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-stone-300">
                <FileText size={32} className="text-stone-400 mx-auto" />
                <p className="text-sm font-bold text-stone-800 font-sans">
                  No circulars found matching your search.
                </p>
                <p className="text-xs text-stone-500 font-sans">
                  Try clearing the search query or selecting 'All Circulars'.
                </p>
              </div>
            )}

            {/* Bottom Archival Link Bar */}
            <div className="mt-8 pt-5 border-t border-stone-300/80 flex items-center justify-between text-xs font-mono text-stone-600">
              <span>Central Board Archive • All historical circulars cataloged</span>
              <Link
                to="/notices"
                className="font-bold text-[#0b132b] hover:text-amber-700 hover:underline flex items-center gap-1"
              >
                <span>View Full Past & Present Notices Archive</span>
                <ChevronRight size={13} />
              </Link>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
