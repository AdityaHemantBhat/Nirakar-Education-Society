import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  ExternalLink,
  GraduationCap,
  Layers,
  MapPin,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CampusItem {
  id: string;
  code: string;
  index: string;
  roman: string;
  name: string;
  marathiName: string;
  slug: string;
  place: string;
  taluka: string;
  estYear: number;
  role: string;
  tagline: string;
  image: string;
  description: string;
  badge: string;
  accentColor: string;
  stats: Array<{ value: string; label: string }>;
  keyHighlights: string[];
  streams: string[];
  mapUrl: string;
}

const CAMPUSES: CampusItem[] = [
  {
    id: 'nirakar-hs',
    code: 'NIRAKAR_HS',
    index: '01',
    roman: 'I',
    name: 'Shri Nirakar High School',
    marathiName: 'श्री निराकार हायस्कूल, माशेल',
    slug: 'nirakar-high-school',
    place: 'Mashem',
    taluka: 'Canacona, South Goa',
    estYear: 1950,
    role: 'Secondary Education • Classes V to X',
    badge: 'Centenary Heritage',
    tagline: 'Setting benchmarks of academic distinction, sports excellence, and moral character in Mashem.',
    image: '/images/Nirakar_Vidyalaya_Mashem.webp',
    description:
      'Born from the noble Mushtifund movement in 1924 and recognized as a high school in 1950, Shri Nirakar High School is the foundational anchor of the society. Nestled in the serene coastal valley of Mashem, the school combines high-discipline character building with experiential science education, robotics labs, and an unbroken 100% SSC board success rate.',
    accentColor: '#f59e0b',
    stats: [
      { value: '1924 / 1950', label: 'Estd. Heritage' },
      { value: '100%', label: 'SSC Success' },
      { value: 'ATL', label: 'Robotics Lab' },
      { value: 'V – X', label: 'Class Levels' },
    ],
    keyHighlights: [
      'Atal Tinkering Lab (ATL) for AI, 3D printing & hands-on electronics',
      'Unbroken record of academic distinctions in Goa Board Class X examinations',
      'Dedicated state-level volleyball courts, athletics track, and martial arts training',
      'Active Scouts & Guides, NCC cadets, and environmental club stewardship',
    ],
    streams: ['General Secondary', 'Science Lab Practicals', 'Computer Technology', 'Vocational & Arts'],
    mapUrl: 'https://maps.app.goo.gl/bvkukHjw9TVyw1WH6?g_st=aw',
  },
  {
    id: 'tudal-hs',
    code: 'TUDAL_HS',
    index: '02',
    roman: 'II',
    name: 'Tudal High School',
    marathiName: 'तुदळ हायस्कूल, गावडोंगरी',
    slug: 'tudal-high-school',
    place: 'Gaondongrem',
    taluka: 'Sahyadri Foothills, South Goa',
    estYear: 1998,
    role: 'Rural & Forest Outreach • Classes V to X',
    badge: 'The Sahyadri Foothill Sanctuary',
    tagline: 'Bridging the deep forest divide so every rural child finds their wings.',
    image: '/images/Tudal_High_School_Gaodongrem.webp',
    description:
      'Tucked deep into the emerald foothills of the Western Ghats at Gaondongrem, Tudal High School was founded in 1998 to ensure no child in interior forest hamlets was denied secondary education. Operating with subsidized bus lines, tribal merit scholarships, and award-winning folk theatre troupes, it is the heartbeat of rural Canacona.',
    accentColor: '#10b981',
    stats: [
      { value: '1998', label: 'Foundation' },
      { value: '100%', label: 'SSC Success' },
      { value: 'Bus Fleet', label: 'Forest Hamlets' },
      { value: 'State Folk', label: 'Cultural Honors' },
    ],
    keyHighlights: [
      'Dedicated institutional bus transport connecting remote forest settlements',
      'Complete tribal & rural merit scholarship guidance and welfare support',
      'State-awarded Goan folk cultural troupes (Natak, Fugdi, Dhalo, Dashavatari)',
      'Rich Western Ghats bio-diversity observation club and herbal sanctuary',
    ],
    streams: ['Secondary Curriculum', 'Eco-Stewardship', 'Traditional Goan Arts', 'Physical Education'],
    mapUrl: 'https://maps.app.goo.gl/UigQTdh1Skaxc8SJ8?g_st=aw',
  },
  {
    id: 'angle-hss',
    code: 'ANGLE_HSS',
    index: '03',
    roman: 'III',
    name: 'S. S. Angle Higher Secondary School',
    marathiName: 'एस. एस. आंगले उच्च माध्यमिक विद्यालय, दापोत',
    slug: 'angle-higher-secondary',
    place: 'Dapot',
    taluka: 'Canacona, South Goa',
    estYear: 1993,
    role: 'Junior College • Classes XI & XII (HSSC)',
    badge: 'Collegiate Preparatory Academy',
    tagline: 'Grooming Canacona’s finest minds for medicine, engineering, commerce, and civic leadership.',
    image: '/images/S.S.Angle_Higher_Secondary_School_Dapot.webp',
    description:
      'Established in 1993 to fulfill a generational dream—giving South Goa students access to premier higher secondary education without having to migrate to Margao or Panaji. S. S. Angle Higher Secondary provides rigorous Class XI & XII training across Science, Commerce, and Arts, paired with specialized foundation mentoring for NEET, JEE, and CA entrances.',
    accentColor: '#8b5cf6',
    stats: [
      { value: '1993', label: 'Foundation' },
      { value: '3 Streams', label: 'Arts, Sci & Comm' },
      { value: 'NEET / JEE', label: 'Entrance Mentoring' },
      { value: 'Top Ranks', label: 'Goa HSSC Board' },
    ],
    keyHighlights: [
      'Comprehensive Class XI & XII programs in Science, Commerce, and Arts',
      'Integrated preparation for NEET, IIT-JEE, CA Foundation, and GCET entrances',
      'Advanced physics, chemistry, biology, and high-speed computer laboratories',
      'Distinguished alumni pursuing top medical, engineering, civil, and corporate careers',
    ],
    streams: ['Science (PCB / PCM / IT)', 'Commerce (Accountancy & Maths)', 'Arts (Economics, Psych & Lang)'],
    mapUrl: 'https://maps.app.goo.gl/AqxNosipxGN5d5828?g_st=aw',
  },
];

export const InstitutionsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>('nirakar-hs');
  const [cursorPos, setCursorPos] = useState<Record<string, { x: number; y: number }>>({});

  const handleCardMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos((prev) => ({
      ...prev,
      [id]: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    }));
  };

  // GSAP 3D Interactive Cards & Parallax Scroll Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Staggered Entrance of Cards
      const cards = gsap.utils.toArray<HTMLElement>('.gsap-stacked-card');
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 70, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // 2. Interactive Navigation Indicator micro-animation
      gsap.fromTo(
        '.gsap-quick-pills',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-[#FAF7F2] text-[#0f172a] flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900"
    >
      <Helmet>
        <title>Our Campuses & Institutions | Shri Nirakar Education Society</title>
        <meta
          name="description"
          content="Explore Shri Nirakar High School in Mashem, Tudal High School in Gaondongrem, and S. S. Angle Higher Secondary School in Dapot."
        />
      </Helmet>

      <Navbar />

      {/* Header Banner: EXACT same standard design as before (DO NOT CHANGE) */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="w-full relative z-10 max-w-5xl space-y-3">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block">
            Campuses & Centers
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Our Three Premier Institutions
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            From secondary high schooling foundations in Mashem and Gaondongrem to higher secondary college streams in Arts, Science & Commerce.
          </p>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      {/* NEW DISTINCTIVE LAYOUT: ReactBits 3D Interactive Bento Showcase with GSAP Animations */}
      <main className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-14">
        {/* Navigation Floating Quick-Filter Pill Bar (ReactBits Inspired) */}
        <div className="gsap-quick-pills flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
              <span>Three Unique Campuses Across Canacona</span>
            </div>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#0b132b]">
              Distinctive Sanctuaries of Learning
            </h2>
          </div>

          {/* Quick-Jump Smooth Scroll Bar */}
          <div className="inline-flex items-center gap-2 overflow-x-auto p-1.5 rounded-full bg-white border border-stone-200 shadow-sm self-start sm:self-auto">
            {CAMPUSES.map((c) => {
              const isSelected = activeTab === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveTab(c.id);
                    const el = document.getElementById(c.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-[#0b132b] text-amber-400 shadow-sm scale-105'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <span className="font-mono text-[11px] opacity-70">{c.index}</span>
                  <span>{c.place}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campuses Stack: Full-Width Bento Panels with ReactBits Mouse Spotlight + GSAP */}
        <div ref={stackRef} className="space-y-16">
          {CAMPUSES.map((campus, index) => {
            const isReversed = index % 2 === 1;
            const pos = cursorPos[campus.id] || { x: 300, y: 200 };

            return (
              <div
                key={campus.id}
                id={campus.id}
                onMouseMove={(e) => handleCardMouseMove(campus.id, e)}
                className="gsap-stacked-card group relative overflow-hidden rounded-[2.5rem] border border-stone-200/80 bg-white shadow-sm transition-all duration-500 hover:shadow-xl"
              >
                {/* ReactBits Dynamic Ambient Mouse Spotlight */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(650px circle at ${pos.x}px ${pos.y}px, rgba(245, 158, 11, 0.05), transparent 60%)`,
                  }}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                  {/* Left Column: Visual Showcase (5 Cols) */}
                  <div
                    className={`relative lg:col-span-5 min-h-[380px] sm:min-h-[460px] lg:min-h-full overflow-hidden bg-stone-950 flex flex-col justify-between p-6 sm:p-10 text-white ${
                      isReversed ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    {/* Campus Image with ReactBits Smooth Scale */}
                    <img
                      src={campus.image}
                      alt={campus.name}
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />

                    {/* Gradient Overlay Mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/65 to-stone-950/30" />

                    {/* Watermark Roman Index in Top Corner */}
                    <div className="absolute right-6 top-6 select-none font-serif text-8xl sm:text-9xl font-black text-white/[0.08] pointer-events-none leading-none">
                      {campus.roman}
                    </div>

                    {/* Top Floating Badge */}
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md">
                        <Sparkles size={12} className="text-amber-400 shrink-0" />
                        <span className="truncate">{campus.badge}</span>
                      </span>

                      <span className="shrink-0 rounded-full border border-white/20 bg-black/40 px-3 py-1 font-mono text-[11px] sm:text-xs font-semibold backdrop-blur-md text-stone-200">
                        Estd. {campus.estYear}
                      </span>
                    </div>

                    {/* Bottom Title Over Image */}
                    <div className="relative z-10 space-y-2 pt-20">
                      <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-amber-300">
                        <MapPin size={13} className="shrink-0 text-amber-400" />
                        <span>{campus.place} Campus • {campus.taluka}</span>
                      </div>
                      <h3 className="font-serif text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                        {campus.name}
                      </h3>
                      <p className="font-serif text-xs sm:text-sm text-stone-300 italic opacity-95">{campus.marathiName}</p>
                    </div>
                  </div>

                  {/* Right Column: Detailed Bento Story & Metrics (7 Cols) */}
                  <div
                    className={`lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-8 ${
                      isReversed ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    {/* Header Description */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-700">
                          {campus.role}
                        </span>
                      </div>

                      <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#0b132b] tracking-tight leading-snug">
                        "{campus.tagline}"
                      </h4>

                      <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-stone-600 font-sans">
                        {campus.description}
                      </p>
                    </div>

                    {/* ReactBits Bento Stat Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {campus.stats.map((st, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-stone-200/90 bg-[#FAF7F2] p-4 text-center transition-all duration-300 hover:border-amber-400/50 hover:bg-white hover:shadow-sm"
                        >
                          <p className="font-serif text-xl sm:text-2xl font-black text-[#0b132b]">
                            {st.value}
                          </p>
                          <p className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mt-1">
                            {st.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Academic Stages Offered */}
                    <div>
                      <p className="text-xs font-mono font-bold uppercase tracking-widest text-stone-500 mb-2.5">
                        Academic Offerings & Modules
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {campus.streams.map((stream, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs font-semibold text-stone-700"
                          >
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            <span>{stream}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Campus Hallmarks */}
                    <div className="border-t border-stone-100 pt-5">
                      <p className="text-xs font-mono font-bold uppercase tracking-widest text-stone-500 mb-2.5">
                        Infrastructure & Signature Highlights
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-stone-700">
                        {campus.keyHighlights.map((hl, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            <span>{hl}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="border-t border-stone-100 pt-6 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          to={`/institutions/${campus.slug}`}
                          className="group/btn inline-flex items-center gap-2 rounded-full bg-[#0b132b] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-brand-700 hover:shadow-md"
                        >
                          <span>Explore {campus.place} Campus</span>
                          <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                        </Link>

                        <Link
                          to={`/faculty?campus=${encodeURIComponent(campus.code)}`}
                          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3.5 text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:border-stone-400"
                        >
                          <Users size={16} className="text-amber-600" />
                          <span>Meet Faculty</span>
                        </Link>
                      </div>

                      <a
                        href={campus.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-stone-500 hover:text-[#0b132b] transition"
                      >
                        <MapPin size={13} className="text-stone-400" />
                        <span>Get Directions</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Society Connection Banner */}
        <div className="mt-20 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-8 sm:p-12 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-widest text-amber-700">
              <Sparkles size={14} /> Admissions 2026–2027 In Progress
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#0b132b]">
              Begin Your Educational Journey With Us
            </h3>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
              From Secondary schooling (Classes V–X) in Mashem or Gaondongrem to Junior College streams in Arts, Science, and Commerce at Dapot.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 shrink-0">
            <Link
              to="/admissions"
              className="rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-[#0b132b] shadow-sm hover:bg-amber-400 transition"
            >
              Apply for Admission
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-stone-300 bg-white px-6 py-3.5 text-sm font-bold text-stone-700 hover:bg-stone-50 transition"
            >
              Campus Enquiries
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
