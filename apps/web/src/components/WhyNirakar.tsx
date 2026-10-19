import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Compass, 
  Heart, 
  BookOpen, 
  Award, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Quote,
  CheckCircle2,
  Landmark,
  Layers,
  MapPin
} from 'lucide-react';

interface Pillar {
  id: string;
  number: string;
  roman: string;
  category: string;
  shortTag: string;
  title: string;
  subtitle: string;
  narrative: string;
  image: string;
  keyMetric: string;
  metricLabel: string;
  highlights: {
    label: string;
    description: string;
  }[];
  link: string;
  linkText: string;
  themeColor: string;
}

const PILLARS: Pillar[] = [
  {
    id: 'academic-rigour',
    number: '01',
    roman: 'I',
    category: 'Goa Board Merit • Secondary & Higher Secondary',
    shortTag: 'Academic Rigour',
    title: 'Unbroken 100% Board Passing Track Record Across Five Decades',
    subtitle: 'Where individual student care turns potential into state merit ranks',
    narrative:
      'At Shree Nirakar, academic distinction is not reserved for the few—it is a community covenant. Through systematic chapter review cycles, mandatory science laboratory experiments, and individualized after-school remedial mentoring for slow learners, our secondary and higher secondary scholars consistently secure 100% Goa State Board passing records and top rankings.',
    image: '/images/Nirakar_Vidyalaya_Mashem.webp',
    keyMetric: '100% Passing',
    metricLabel: 'Unbroken Decade Track Record in Goa Board SSC',
    highlights: [
      {
        label: 'Individualized Remedial Care',
        description: 'Dedicated after-hours tutoring ensuring no student is left behind in core subjects.',
      },
      {
        label: 'Science & Math Experiment Stations',
        description: 'Mandatory practical sessions from Std VIII through Std XII across Physics, Chem & Bio.',
      },
      {
        label: 'Goa State Board Merit Ranks',
        description: 'Consistent top-5 rankers across Canacona in SSC and HSSC board exams.',
      },
    ],
    link: '/academics',
    linkText: 'Explore Academic Curriculum',
    themeColor: '#111b5e',
  },
  {
    id: 'rural-empowerment',
    number: '02',
    roman: 'II',
    category: 'Social Equity • Sahyadri Forest Foothills',
    shortTag: 'Forest Outreach',
    title: 'Reaching Deep into Gaondongrem & Remote Forest Hamlets',
    subtitle: 'Ensuring geographical remoteness in the Western Ghats never prevents quality schooling',
    narrative:
      'Founded with a solemn duty to eliminate the rural-urban educational divide in southern Goa, Tudal High School brings high schooling directly to tribal and forest communities. With dedicated subsidized bus lines connecting interior hamlets, complete free textbook kits, and state tribal scholarship liaison, education reaches the doorstep of every child.',
    image: '/images/Tudal_High_School_Gaodongrem.webp',
    keyMetric: '380+ Hamlets',
    metricLabel: 'Connected Daily via Subsidized School Bus Routes',
    highlights: [
      {
        label: 'Dedicated Subsidized Bus Routes',
        description: 'Safe daily transport reaching deep interior hamlets across Gaondongrem forest zones.',
      },
      {
        label: '100% Free Study Materials',
        description: 'Complete textbook kits, notebooks, and uniforms provided to underserved students.',
      },
      {
        label: 'Tribal Scholarship Liaison',
        description: 'Direct institutional facilitation for government grants and merit endowments.',
      },
    ],
    link: '/institutions/tudal-high-school',
    linkText: 'Discover Tudal Outreach Program',
    themeColor: '#065f46',
  },
  {
    id: 'cultural-heritage',
    number: '03',
    roman: 'III',
    category: 'Culture & Character • Preserving Tradition',
    shortTag: 'Folk Heritage',
    title: 'Preserving Goan Natak, Fugdi, Dhalo & Moral Character',
    subtitle: 'Rooted in timeless local culture while cultivating global citizens',
    narrative:
      'Education at Nirakar is anchored in reverence for Goan soil and ethical living. Students participate in annual state-awarded Natak (Konkani and Marathi theatre), traditional Fugdi and Dhalo dance festivals, Konkani literary symposiums, and daily morning assemblies centered on moral discernment, community seva, and respect for village elders.',
    image: '/images/folk_arts.jpg',
    keyMetric: 'State Awards',
    metricLabel: 'Annual Trophies in Goan Folk Drama, Natak & Fugdi',
    highlights: [
      {
        label: 'State-Awarded Natak Troupes',
        description: 'Annual competitive Marathi and Konkani drama productions winning state honors.',
      },
      {
        label: 'Konkani & Marathi Literary Cells',
        description: 'Student literary publications, elocution circles, and traditional poetry meets.',
      },
      {
        label: 'Moral Instruction & Values Assembly',
        description: 'Daily character-building assemblies cultivating integrity, empathy, and seva.',
      },
    ],
    link: '/society',
    linkText: 'Explore Society Heritage & Arts',
    themeColor: '#991b1b',
  },
  {
    id: 'stem-laboratories',
    number: '04',
    roman: 'IV',
    category: 'Experiential STEM • Modern Infrastructure',
    shortTag: 'Science & Labs',
    title: 'Hands-On Wet Labs & Advanced Digital Computer Suites',
    subtitle: 'Equipping rural students for 21st-century technology and science',
    narrative:
      'Science cannot be mastered from blackboards alone. Our campuses boast dedicated Physics, Chemistry, and Biology laboratories equipped with individual experiment stations, precision optical microscopes, and high-speed digital IT suites, preparing rural students for medical, engineering, and digital careers.',
    image: '/images/science_lab.jpg',
    keyMetric: '3 Full Labs',
    metricLabel: 'Specialized Experiment Stations & 60+ Computer Terminals',
    highlights: [
      {
        label: 'Individualized Lab Workstations',
        description: 'Hands-on titration, optics, and biological specimen analysis for secondary batches.',
      },
      {
        label: 'Advanced IT Computer Laboratories',
        description: 'High-speed broadband suites training students in coding and digital research.',
      },
      {
        label: 'Integrated Entrance Foundation',
        description: 'Rigorous conceptual foundation for NEET, IIT-JEE, and CA exams at HSSC level.',
      },
    ],
    link: '/academics',
    linkText: 'View Laboratory Infrastructure',
    themeColor: '#0284c7',
  },
  {
    id: 'sports-ncc',
    number: '05',
    roman: 'V',
    category: 'Athletics & Discipline • Youth Leadership',
    shortTag: 'Sports & NCC',
    title: 'Championship Athletics Pavilion, Volleyball & NCC Wings',
    subtitle: 'Fostering athletic stamina, camaraderie, and disciplined youth leadership',
    narrative:
      'The expansive sports grounds at Mashem have produced generations of Goa State volleyball champions, inter-school athletics winners, and football champions. Integrated Bharat Scouts & Guides and NCC contingents build physical stamina, patriotic duty, teamwork, and emergency community disaster preparedness.',
    image: '/images/sports_champs.jpg',
    keyMetric: '18+ Medals',
    metricLabel: 'State Volleyball Championships & Inter-School Trophies',
    highlights: [
      {
        label: 'Volleyball & Athletics Ground',
        description: 'Expansive red-clay courts and athletic tracks hosting inter-school championships.',
      },
      {
        label: 'Recognized NCC Cadet Unit',
        description: 'Cadets marching in state ceremonial parades and national youth leadership camps.',
      },
      {
        label: 'Bharat Scouts & Guides Troops',
        description: 'Active outdoor survival skills, forest ecology walks, and community civic service.',
      },
    ],
    link: '/institutions/nirakar-high-school',
    linkText: 'Explore Sports & Youth Wings',
    themeColor: '#d97706',
  },
  {
    id: 'faculty-mentors',
    number: '06',
    roman: 'VI',
    category: 'Faculty Devotion • Community Mentorship',
    shortTag: 'Faculty Mentors',
    title: '92 Experienced Educators Committed to Every Scholar',
    subtitle: 'Lifelong mentors who know every student by name and family background',
    narrative:
      'Our 92 full-time qualified educators do not commute from distant cities—they live within Canacona, deeply understanding the village context and each child’s ambitions. With an enviable 1:18 teacher-student ratio, every learner receives compassionate personal attention, board examination strategy, and career counselling.',
    image: '/images/Urvee_Phaldessai_Headmaster.webp',
    keyMetric: '1:18 Ratio',
    metricLabel: 'Personal Attention from 92 Dedicated Full-Time Faculty',
    highlights: [
      {
        label: '1:18 Teacher-Student Ratio',
        description: 'Intimate classroom sizes ensuring every child receives direct teacher guidance.',
      },
      {
        label: 'Resident Faculty Mentors',
        description: 'Senior teachers living in Canacona with decades of dedicated service.',
      },
      {
        label: 'Personalized Career Mentorship',
        description: 'One-on-one academic roadmaps and university entrance counseling.',
      },
    ],
    link: '/society',
    linkText: 'Meet Our Leadership & Faculty',
    themeColor: '#4f46e5',
  },
  {
    id: 'global-alumni',
    number: '07',
    roman: 'VII',
    category: 'Alumni Network • Generational Brotherhood',
    shortTag: 'Global Alumni',
    title: '16,500+ Nirakarians Excelling in Law, Civil Services & Medicine',
    subtitle: 'An enduring lifelong fraternity empowering current generations',
    narrative:
      'From High Court advocates in Panaji and Mumbai to civil service administrators, specialized surgeons, technology founders, and overseas academics, our 16,500+ alumni remain intimately connected to their alma mater—funding laboratory equipment, sponsoring merit scholarships, and mentoring graduating batches.',
    image: '/images/S.S.Angle_Higher_Secondary_School_Dapot.webp',
    keyMetric: '16,500+',
    metricLabel: 'Worldwide Alumni Fraternity Across 54 Graduated Batches',
    highlights: [
      {
        label: 'Active Global Network',
        description: 'Thriving alumni chapters across Goa, Mumbai, the Gulf, and international hubs.',
      },
      {
        label: 'Endowment & Merit Scholarships',
        description: 'Substantial annual scholarships funded by alumni for deserving students.',
      },
      {
        label: 'Alumni Guest Lecture Series',
        description: 'Regular interactive sessions with judges, physicians, and civic leaders.',
      },
    ],
    link: '/alumni',
    linkText: 'Visit Alumni Association Directory',
    themeColor: '#1e293b',
  },
];

export const WhyNirakar: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const active = PILLARS[activeIdx];

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? PILLARS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === PILLARS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section
      id="why-nirakar"
      className="relative w-full bg-[#FAF7F2] py-20 sm:py-28 overflow-hidden select-none"
    >
      {/* 1. GRAND EDITORIAL SECTION TITLE */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-28 mb-10 sm:mb-14">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2.5 mb-3 text-xs uppercase font-mono font-bold tracking-widest text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>Institutional Philosophy • The 7 Pillars of Distinction</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b132b] tracking-tight leading-[1.12]">
            Why Shree Nirakar Education Society?
          </h2>

          <p className="text-stone-600 text-sm sm:text-base font-sans mt-3 leading-relaxed max-w-3xl">
            More than an academic institution—a five-decade generational covenant bridging village sacrifice with state distinction, empowering every child across Canacona from Std V through Higher Secondary.
          </p>
        </div>
      </div>

      {/* 2. THE FOUNDER'S 1968 COVENANT ARCHIVAL MONOLITH (CLEAN & UNBOXED) */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-28 mb-12 sm:mb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07112c] via-[#0b132b] to-[#081330] p-8 sm:p-10 text-white shadow-2xl border border-white/10">
          {/* Subtle gold hairline accent on top */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Unique Background Stretched Artwork */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            {/* Luminous Ambient Glow Orbs */}
            <div className="absolute -top-20 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-16 w-80 h-80 bg-[#1d35d8]/12 rounded-full blur-3xl" />

            {/* Stretched Mushtifund Heritage Wave & Canacona Topography SVG Curves */}
            <svg
              viewBox="0 0 1200 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
              preserveAspectRatio="none"
            >
              <path
                d="M -100 100 C 220 20, 540 180, 840 80 C 1040 15, 1220 150, 1400 90"
                stroke="url(#covenantGoldGrad)"
                strokeWidth="1.75"
                fill="none"
              />
              <path
                d="M -80 170 C 260 90, 580 230, 880 130 C 1080 60, 1260 190, 1420 140"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M -50 50 C 300 150, 640 30, 960 170 C 1160 100, 1340 50, 1450 100"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
                fill="none"
              />
              <defs>
                <linearGradient id="covenantGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
            <div className="flex items-start gap-4 sm:gap-5 max-w-3xl">
              <Quote size={30} className="text-amber-400 shrink-0 mt-1 stroke-[1.8]" />

              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-xs font-serif font-bold tracking-wider uppercase text-amber-300">
                  <span>Founder's Solemn Covenant</span>
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  <span>Mashem, 1968</span>
                </div>

                <blockquote className="font-serif text-lg sm:text-xl lg:text-2xl font-bold italic text-white leading-snug">
                  "Let no child in Canacona remain uneducated due to distance, financial hardship, or lack of opportunity."
                </blockquote>

                <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
                  Forged in 1968 through the village ethos of <em className="text-amber-200/90 not-italic font-medium">Mushtifund</em>, where every household contributed a morning handful of rice to build a house of knowledge for their children.
                </p>
              </div>
            </div>

            <a
              href="/society"
              className="shrink-0 inline-flex items-center gap-2 text-xs font-serif font-bold text-amber-300 hover:text-white px-5 py-3 rounded-xl border border-amber-400/30 hover:border-amber-400/60 bg-amber-400/10 hover:bg-amber-400/20 transition-all self-start lg:self-center group"
            >
              <span>Explore Society History</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. NEW-AGE MASTER MONOGRAPH: THE SEVEN PILLARS SPATIAL EXHIBITION */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-28">
        
        {/* TOP: ARCHITECTURAL PILLARS DIAL (Desktop & Tablet Horizontal Station Selector) */}
        <div className="w-full overflow-x-auto pb-4 mb-8 scrollbar-none">
          <div className="flex items-center gap-2 border-b border-stone-200/80 pb-3 min-w-max">
            {PILLARS.map((p, idx) => {
              const isSelected = activeIdx === idx;

              return (
                <button
                  key={p.id}
                  onClick={() => setActiveIdx(idx)}
                  type="button"
                  className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0b132b] text-amber-400 shadow-md'
                      : 'bg-white/70 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/70'
                  }`}
                >
                  <span className={`font-serif font-black text-sm ${isSelected ? 'text-amber-400' : 'text-stone-400 group-hover:text-stone-600'}`}>
                    {p.number}
                  </span>
                  <span className="font-bold tracking-wide">
                    {p.shortTag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN SPATIAL LIVING STAGE (Two-Sided Monograph with Smooth Framer Motion Crossfade) */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
            
            {/* LEFT 6 COLS: PHOTOGRAPHIC WINDOW & PHYSICAL HALLMARK PLAQUE */}
            <div className="lg:col-span-6 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-stone-950">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={active.image}
                    alt={active.title}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />

                  {/* Multi-stop Cinematic Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060c24]/90 via-[#060c24]/40 to-transparent" />

                  {/* Watermark Roman Numeral */}
                  <div className="absolute top-6 left-6 font-serif font-black text-7xl sm:text-8xl text-white/10 select-none pointer-events-none leading-none">
                    {active.roman}
                  </div>

                  {/* Top Badge: Pillar Index */}
                  <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-mono text-stone-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Pillar {active.number} of 07</span>
                  </div>

                  {/* Bottom Attached Hallmark Plaque */}
                  <div className="absolute bottom-6 left-6 right-6 bg-[#07112c]/90 backdrop-blur-md p-5 rounded-2xl border border-amber-500/30 text-white shadow-xl space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                      <Sparkles size={13} />
                      <span>Verified Institutional Impact</span>
                    </div>
                    <div className="font-serif font-black text-2xl text-white">
                      {active.keyMetric}
                    </div>
                    <p className="text-xs text-stone-300 font-sans">
                      {active.metricLabel}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT 6 COLS: HAUTE-COUTURE EDITORIAL NARRATIVE & TRI-FOLD HIGHLIGHTS */}
            <div className="lg:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-6"
                >
                  {/* Category Header */}
                  <div>
                    <span className="text-xs uppercase font-mono font-bold tracking-widest text-amber-700 block mb-1">
                      {active.category}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-[#0b132b] tracking-tight leading-tight">
                      {active.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-serif italic text-stone-600 mt-2">
                      "{active.subtitle}"
                    </p>
                  </div>

                  {/* Editorial Narrative */}
                  <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-sans font-normal">
                    {active.narrative}
                  </p>

                  {/* Tri-Fold Unboxed Impact Highlights */}
                  <div className="space-y-3 pt-2 border-t border-stone-200/80">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-stone-400 font-bold">
                      Institutional Benchmarks
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {active.highlights.map((h, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#0b132b]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                            <span className="truncate">{h.label}</span>
                          </div>
                          <p className="text-[11px] text-stone-600 font-sans leading-snug line-clamp-2">
                            {h.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom Action Row & Station Navigation Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-200/80">
                <a
                  href={active.link}
                  className="inline-flex items-center justify-center gap-2.5 bg-[#0b132b] hover:bg-[#111b5e] text-white font-mono text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md transition-colors"
                >
                  <span>{active.linkText}</span>
                  <ArrowRight size={14} className="text-amber-400 stroke-[2.5]" />
                </a>

                {/* Previous & Next Stepper */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handlePrev}
                    type="button"
                    aria-label="Previous Pillar"
                    className="w-10 h-10 rounded-full border border-stone-300 hover:border-[#0b132b] flex items-center justify-center text-stone-700 hover:text-[#0b132b] transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="text-xs font-mono font-bold text-stone-500 px-2">
                    {active.number} / 07
                  </span>

                  <button
                    onClick={handleNext}
                    type="button"
                    aria-label="Next Pillar"
                    className="w-10 h-10 rounded-full border border-stone-300 hover:border-[#0b132b] flex items-center justify-center text-stone-700 hover:text-[#0b132b] transition-colors cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
