import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  MapPin, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SectionEdge } from './SectionEdge.js';

interface CampusData {
  id: string;
  index: string;
  roman: string;
  name: string;
  place: string;
  taluka: string;
  estYear: number;
  role: string;
  descriptor: string;
  tagline: string;
  image: string;
  themeColor: string;
  accentGlow: string;
  heritageStory: string;
  hallmarks: string[];
  link: string;
  mapUrl: string;
}

const CAMPUSES: CampusData[] = [
  {
    id: 'nirakar-hs',
    index: '01',
    roman: 'I',
    name: 'Shri Nirakar High School',
    place: 'Mashem',
    taluka: 'Canacona, South Goa',
    estYear: 1950,
    role: 'Secondary Education • Classes V to X',
    descriptor: 'Flagship Secondary Institution • Estd. 1924 / 1950',
    tagline: 'Setting benchmarks of academic distinction, sports excellence, and moral character in Mashem.',
    image: '/images/Nirakar_Vidyalaya_Mashem.webp',
    themeColor: 'from-[#07112c]/95 via-[#07112c]/75 to-transparent',
    accentGlow: 'rgba(217, 119, 6, 0.4)',
    heritageStory:
      'Established as the pioneering center of secondary schooling in southern Canacona, Shri Nirakar High School has spent more than five decades cultivating scholars of distinction. Nestled in Mashem, the campus features experiential science laboratories, an Atal Tinkering Lab for innovation and robotics, dedicated physical education fields, and an unbroken legacy of 100% SSC board examination results.',
    hallmarks: [
      'Unbroken 100% SSC Board Track Record',
      'Modern Physics, Chemistry & Biology Labs',
      'State-Level Volleyball & Athletics Ground',
      'Atal Tinkering Lab & Innovation Stations'
    ],
    link: '/institutions/nirakar-high-school',
    mapUrl: 'https://maps.app.goo.gl/bvkukHjw9TVyw1WH6?g_st=aw',
  },
  {
    id: 'tudal-hs',
    index: '02',
    roman: 'II',
    name: 'Tudal High School',
    place: 'Gaondongrem',
    taluka: 'Sahyadri Foothills, South Goa',
    estYear: 1998,
    role: 'Forest Outreach • Classes V to X',
    descriptor: 'The Sahyadri Foothill Sanctuary',
    tagline: 'Bridging the deep forest divide so every rural child finds their wings.',
    image: '/images/Tudal_High_School_Gaodongrem.webp',
    themeColor: 'from-[#041c14]/95 via-[#041c14]/75 to-transparent',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    heritageStory:
      'Tucked deep into the emerald foothills of the Western Ghats at Gaondongrem, Tudal High School was founded in 1998 to ensure no child in the interior forest hamlets was denied secondary education. Today, with dedicated subsidized bus connectivity, tribal merit scholarships, award-winning Goan folk theatre (Natak, Fugdi, Dhalo), and biodiversity stewardship cells, it is the heartbeat of rural Canacona.',
    hallmarks: [
      'Subsidized Bus Lines to Interior Forest Hamlets',
      'Tribal & Rural Scholarship Facilitation',
      'State-Awarded Folk Arts, Natak & Fugdi Troupes',
      'Sahyadri Forest Eco-Stewardship Clubs'
    ],
    link: '/institutions/tudal-high-school',
    mapUrl: 'https://maps.app.goo.gl/UigQTdh1Skaxc8SJ8?g_st=aw',
  },
  {
    id: 'angle-hss',
    index: '03',
    roman: 'III',
    name: 'S. S. Angle Higher Secondary School',
    place: 'Dapot',
    taluka: 'Canacona, South Goa',
    estYear: 1993,
    role: 'Junior College • Classes XI & XII',
    descriptor: 'The Collegiate Preparatory Academy',
    tagline: 'Grooming Canacona’s finest minds for medicine, engineering, commerce, and civic leadership.',
    image: '/images/S.S.Angle_Higher_Secondary_School_Dapot.webp',
    themeColor: 'from-[#140b28]/95 via-[#140b28]/75 to-transparent',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
    heritageStory:
      'Established in 1993 to fulfill a generational dream—giving South Goa students access to premier higher secondary education without having to migrate to Margao or Panaji. S. S. Angle Higher Secondary provides rigorous Class XI & XII training across Science, Commerce, and Arts, paired with specialized foundation mentoring for NEET, IIT-JEE, CA foundation, and national university entrances.',
    hallmarks: [
      'Distinguished Arts, Science & Commerce Streams',
      'Targeted NEET, IIT-JEE & CA Foundation Coaching',
      'Advanced IT Laboratories & Seminar Auditoriums',
      'Direct Pipeline to Goa & National Universities'
    ],
    link: '/institutions/angle-higher-secondary',
    mapUrl: 'https://maps.app.goo.gl/AqxNosipxGN5d5828?g_st=aw',
  },
];

export const Campuses: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('nirakar-hs');
  const activeCampus = CAMPUSES.find((c) => c.id === activeId) || CAMPUSES[0];

  return (
    <section
      id="campuses"
      className="relative w-full bg-white pb-0 overflow-hidden"
    >
      {/* Seamless Transition Curve from HeadmasterMessage (#FAF7F2) into Campuses (White) */}
      <SectionEdge variant="scoop" position="top" fillColor="#FAF7F2" height={40} />

      {/* Main Section Content */}
      <div className="pt-8 sm:pt-12">
        {/* 1. GRAND EDITORIAL SECTION TITLE (Clean, Crisp White Backdrop) */}
        <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-28 mb-10 sm:mb-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 border-b border-stone-200/70 pb-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-3 text-xs uppercase font-mono font-bold tracking-widest text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span>Three Sanctuaries of Learning • Canacona Taluka</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b132b] tracking-tight leading-[1.12]">
              Three Campuses. One Enduring Educational Legacy.
            </h2>

            <p className="text-stone-600 text-sm sm:text-base font-sans mt-3 leading-relaxed max-w-2xl">
              From the coastal village of Mashem to the Sahyadri forest gateway of Gaondongrem and the collegiate halls of Dapot, explore the three institutions shaping South Goa's future.
            </p>
          </div>

          {/* Stable Segmented Switcher Controls (No overflow, No scale jitter, No scrollbars) */}
          <div className="flex items-center p-1.5 bg-stone-100 rounded-full border border-stone-200/80 shrink-0 self-start lg:self-end">
            {CAMPUSES.map((c) => {
              const isSelected = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  type="button"
                  className={`px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#0b132b] text-amber-400 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  <span className="opacity-60 mr-1.5">{c.index}</span>
                  <span>{c.place}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. ARCHITECTURAL SPATIAL PANORAMA (DESKTOP) */}
      <div className="hidden lg:block w-full px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-28">
        <div className="relative w-full h-[640px] flex overflow-hidden rounded-[2rem] bg-stone-950 shadow-2xl border border-stone-800/80 select-none contain-paint">
          {CAMPUSES.map((campus) => {
            const isActive = campus.id === activeId;

            return (
              <div
                key={campus.id}
                onClick={() => setActiveId(campus.id)}
                onMouseEnter={() => setActiveId(campus.id)}
                className={`relative h-full transition-[flex] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden cursor-pointer border-r border-white/10 last:border-r-0 ${
                  isActive ? 'flex-[3.5]' : 'flex-[0.8]'
                }`}
              >
                {/* Background Image with Cinematic Color Grade */}
                <img
                  src={campus.image}
                  alt={campus.name}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-out"
                  style={{
                    transform: isActive ? 'scale(1.03)' : 'scale(1)',
                    filter: isActive
                      ? 'brightness(0.92) contrast(1.05)'
                      : 'brightness(0.35) saturate(0.5)',
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80';
                  }}
                />

                {/* Atmospheric Gradient Layer */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${campus.themeColor} transition-opacity duration-700 ${
                    isActive ? 'opacity-95' : 'opacity-80'
                  }`}
                />

                {/* Subdued Watermark Roman Numeral */}
                <div className="absolute right-6 top-6 text-white/[0.07] font-serif font-black text-8xl xl:text-9xl select-none pointer-events-none leading-none">
                  {campus.roman}
                </div>

                {/* ACTIVE VIEW (Grand Editorial Exposition) */}
                {isActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 }}
                    className="absolute inset-0 p-10 xl:p-14 flex flex-col justify-between text-white z-10 overflow-hidden"
                  >
                    {/* Top Metadata Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-black text-3xl text-amber-400">
                          {campus.index}
                        </span>
                        <span className="w-8 h-px bg-amber-400/50" />
                        <div>
                          <p className="text-[11px] uppercase font-mono tracking-widest text-amber-300 font-bold">
                            {campus.descriptor}
                          </p>
                          <p className="text-xs text-stone-300 font-sans">
                            Estd. {campus.estYear} • {campus.taluka}
                          </p>
                        </div>
                      </div>

                      <div className="hidden xl:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 text-xs font-mono text-stone-200">
                        <MapPin size={12} className="text-amber-400" />
                        <span>{campus.place} Campus</span>
                      </div>
                    </div>

                    {/* Middle-to-Bottom Grand Narrative */}
                    <div className="max-w-2xl space-y-4">
                      <div>
                        <span className="text-xs uppercase font-mono tracking-widest text-amber-400/90 font-semibold block mb-1">
                          {campus.role}
                        </span>
                        <h3 className="font-serif text-3xl xl:text-4xl 2xl:text-5xl font-black text-white tracking-tight leading-[1.08]">
                          {campus.name}
                        </h3>
                        <p className="text-sm xl:text-base font-serif italic text-amber-200/90 mt-2">
                          "{campus.tagline}"
                        </p>
                      </div>

                      <p className="text-stone-200 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                        {campus.heritageStory}
                      </p>

                      {/* Hallmarks Minimalist Ticker Line */}
                      <div className="pt-2">
                        <p className="text-[10px] uppercase font-mono tracking-widest text-stone-400 mb-2">
                          Institutional Hallmarks
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-stone-200">
                          {campus.hallmarks.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                              <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Direct Action Link */}
                      <div className="flex flex-wrap items-center gap-3 pt-3">
                        <a
                          href={campus.link}
                          className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#07112c] font-mono text-xs font-bold uppercase tracking-widest px-7 py-3.5 rounded-full shadow-xl transition-all hover:brightness-105 cursor-pointer"
                        >
                          <span>Explore {campus.place} Campus Experience</span>
                          <ArrowRight size={14} className="stroke-[2.5]" />
                        </a>
                        <a
                          href={campus.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/20"
                        >
                          <MapPin size={14} />
                          Directions
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* INACTIVE MONOLITHIC SPINE VIEW (Vertical Stately Column) */
                  <div className="absolute inset-0 p-8 flex flex-col justify-between items-center text-white z-10 select-none pointer-events-none">
                    <span className="font-serif font-black text-2xl text-amber-400/80">
                      {campus.index}
                    </span>

                    {/* Vertical Monumental Title */}
                    <div className="rotate-180 [writing-mode:vertical-rl] text-center my-auto py-6">
                      <span className="font-serif text-lg xl:text-xl font-bold tracking-wider text-stone-200/90">
                        {campus.name}
                      </span>
                    </div>

                    <div className="text-center space-y-1">
                      <span className="block text-[11px] font-mono uppercase tracking-widest text-amber-400">
                        {campus.place}
                      </span>
                      <span className="block text-[10px] font-mono text-stone-400">
                        Estd. {campus.estYear}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. IMMERSIVE MOBILE MONOGRAPH (NO BOXED CARDS) */}
      <div className="lg:hidden w-full px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-stone-950 text-white shadow-xl border border-stone-800">
          {/* Active Campus Image Header */}
          <div className="relative h-64 sm:h-72 w-full overflow-hidden">
            <img
              src={activeCampus.image}
              alt={activeCampus.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${activeCampus.themeColor} opacity-90`} />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="font-serif font-black text-xl text-amber-400">
                {activeCampus.index}
              </span>
              <span className="text-[11px] uppercase font-mono tracking-wider text-amber-300 font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                Estd. {activeCampus.estYear}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-semibold block mb-0.5">
                {activeCampus.role}
              </span>
              <h3 className="font-serif text-2xl font-black text-white leading-tight">
                {activeCampus.name}
              </h3>
              <p className="text-xs text-amber-200/90 font-serif italic mt-0.5">
                "{activeCampus.descriptor}"
              </p>
            </div>
          </div>

          {/* Editorial Content Below Image */}
          <div className="p-6 space-y-4">
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-sans font-normal">
              {activeCampus.heritageStory}
            </p>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <p className="text-[10px] uppercase font-mono tracking-widest text-stone-400">
                Key Campus Hallmarks
              </p>
              {activeCampus.hallmarks.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-stone-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
              <a
                href={activeCampus.link}
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#07112c] font-mono text-xs font-bold uppercase tracking-wider py-3.5 rounded-full shadow-lg"
              >
                <span>Explore {activeCampus.place} Campus</span>
                <ArrowRight size={14} />
              </a>
              <a
                href={activeCampus.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20"
              >
                <MapPin size={14} />
                Directions
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Bottom Campus Selector Tabs */}
          <div className="grid grid-cols-3 border-t border-white/10 divide-x divide-white/10 bg-black/40">
            {CAMPUSES.map((c) => {
              const isSelected = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  type="button"
                  className={`py-3 px-2 text-center transition-colors cursor-pointer ${
                    isSelected ? 'bg-amber-500/20 text-amber-300' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <span className="block text-[10px] font-mono font-bold">{c.index}</span>
                  <span className="block text-xs font-serif font-bold truncate">{c.place}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. ARCHITECTURAL ADMISSIONS BANNER (Clean, Stretched, Unboxed) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-28 mt-14 sm:mt-18">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07112c] via-[#0b132b] to-[#081330] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
          {/* Subtle gold hairline accent on top */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Unique Background Stretched Artwork */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            {/* Luminous Ambient Glow Orbs */}
            <div className="absolute -top-20 -left-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-16 w-96 h-96 bg-[#2546eb]/15 rounded-full blur-3xl" />

            {/* Stretched Flowing Pathway SVG Curves */}
            <svg
              viewBox="0 0 1200 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
              preserveAspectRatio="none"
            >
              <path
                d="M -100 140 C 200 50, 520 210, 820 100 C 1020 30, 1220 170, 1400 110"
                stroke="url(#admissionsGoldGrad)"
                strokeWidth="1.75"
                fill="none"
              />
              <path
                d="M -80 200 C 240 110, 580 250, 880 150 C 1080 80, 1260 210, 1420 160"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M -50 70 C 280 170, 620 50, 940 190 C 1140 120, 1320 70, 1450 120"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
                fill="none"
              />
              <defs>
                <linearGradient id="admissionsGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                <Sparkles size={14} className="text-amber-400" />
                <span>Admissions 2026–2027 Open Across All 3 Institutions</span>
              </div>
              <h4 className="font-serif text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                Empowering Canacona's Youth From Secondary to Higher Secondary
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
                Standard V to X admissions at Mashem and Gaondongrem • Standard XI & XII (Arts, Science, Commerce) at Dapot.
              </p>
            </div>

            <a
              href="/admissions"
              className="shrink-0 inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-[#07112c] font-mono text-xs font-bold uppercase tracking-wider px-7 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105"
            >
              <span>Admissions Portal</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </a>
          </div>
        </div>
      </div>

      </div>

      {/* Seamless Transition Curve from Campuses (White) into WhyNirakar (#FAF7F2) */}
      <SectionEdge variant="scoop" position="bottom" fillColor="#FAF7F2" height={40} className="mt-14 sm:mt-20" />
    </section>
  );
};
