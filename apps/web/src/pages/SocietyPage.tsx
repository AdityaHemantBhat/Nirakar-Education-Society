import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import {
  Compass,
  Sparkles,
  Award,
  ShieldCheck,
  Quote,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const SocietyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const getInitialTab = (): 'vision' | 'president' | 'history' | 'institutions' | 'governance' => {
    const tab = searchParams.get('tab');
    if (tab && ['vision', 'president', 'history', 'institutions', 'governance'].includes(tab)) {
      return tab as any;
    }
    return 'vision';
  };

  const getInitialSubTab = (): 'nirakar' | 'angle' | 'tudal' => {
    const sub = searchParams.get('sub');
    if (sub && ['nirakar', 'angle', 'tudal'].includes(sub)) {
      return sub as any;
    }
    return 'nirakar';
  };

  const [activeTab, setActiveTab] = useState<'vision' | 'president' | 'history' | 'institutions' | 'governance'>(getInitialTab);
  const [institutionSubTab, setInstitutionSubTab] = useState<'nirakar' | 'angle' | 'tudal'>(getInitialSubTab);

  const scrollToTarget = (id: string) => {
    const tryScroll = (attempts = 0) => {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -90; // offset for sticky navbar
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      } else if (attempts < 6) {
        setTimeout(() => tryScroll(attempts + 1), 60);
      }
    };
    setTimeout(() => tryScroll(0), 50);
  };

  useEffect(() => {
    const handleCustomTabSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: string; sub?: string; hash?: string }>;
      const { tab, sub, hash } = customEvent.detail || {};
      if (tab && ['vision', 'president', 'history', 'institutions', 'governance'].includes(tab)) {
        setActiveTab(tab as any);
      }
      if (sub && ['nirakar', 'angle', 'tudal'].includes(sub)) {
        setInstitutionSubTab(sub as any);
      }
      if (hash) {
        scrollToTarget(hash);
      } else {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }
    };

    window.addEventListener('society-tab-switch', handleCustomTabSwitch);

    // Read initial/updated query params
    const tabParam = searchParams.get('tab');
    if (tabParam && ['vision', 'president', 'history', 'institutions', 'governance'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
    const subParam = searchParams.get('sub');
    if (subParam && ['nirakar', 'angle', 'tudal'].includes(subParam)) {
      setInstitutionSubTab(subParam as any);
    }

    const targetHash = window.location.hash.replace('#', '') || searchParams.get('section');
    if (targetHash) {
      scrollToTarget(targetHash);
    }

    return () => {
      window.removeEventListener('society-tab-switch', handleCustomTabSwitch);
    };
  }, [searchParams, location.search, location.hash]);

  const handleTabChange = (newTab: 'vision' | 'president' | 'history' | 'institutions' | 'governance') => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>About Society | Shri Nirakar Education Society, Canacona, Goa</title>
        <meta
          name="description"
          content="History, vision statement, presidential address, and institutional chronicles of Shri Nirakar Education Society since 1924. Giving Akar to the future of Goa."
        />
      </Helmet>

      <Navbar />

      {/* Hero Header: Full-Width Stretched under Navbar golden curve */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-6 sm:px-10 lg:px-14 xl:px-20 2xl:px-24 relative z-0 overflow-hidden border-b border-stone-800">
        {/* Organic mathematical thread wave strips in warm light orange/amber */}
        <HeroWaves opacity={0.85} />

        <div className="relative z-10 mx-auto w-full max-w-6xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-amber-300 uppercase">
              ESTD. 1924 • CANACONA, SOUTH GOA • REG. NO. 128/GOA
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
            Shri Nirakar Education Society
          </h1>

          <p className="font-serif italic text-lg sm:text-2xl text-amber-300/90 font-medium">
            "Nirakar gives Akar to the future of Goa"
          </p>

          <p className="mx-auto max-w-4xl text-stone-300 text-xs sm:text-sm md:text-base leading-relaxed font-sans">
            Born from the sacred grassroots ideal of <em>Mushtifund</em> (a handful of rice for education) during the pre-liberation era, evolving over a century into an educational beacon nurturing over 2,400 students across three premier Canacona institutions.
          </p>

          {/* Clean Rounded Metric Badges */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-xs flex items-center gap-3">
              <span className="font-serif font-black text-xl text-amber-400">1924</span>
              <span className="text-[11px] text-stone-300 font-sans leading-tight">Mushtifund<br />Genesis</span>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-xs flex items-center gap-3">
              <span className="font-serif font-black text-xl text-amber-400">3 Campuses</span>
              <span className="text-[11px] text-stone-300 font-sans leading-tight">Mashem, Dapot<br />& Gaondongrem</span>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-xs flex items-center gap-3">
              <span className="font-serif font-black text-xl text-amber-400">2,400+</span>
              <span className="text-[11px] text-stone-300 font-sans leading-tight">Active<br />Scholars</span>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-xs flex items-center gap-3">
              <span className="font-serif font-black text-xl text-amber-400">16,500+</span>
              <span className="text-[11px] text-stone-300 font-sans leading-tight">Alumni<br />Worldwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar: Full-Width Stretched with Rounded Pill Buttons */}
      <div className="w-full bg-white border-b border-stone-200/90 px-6 sm:px-10 lg:px-14 xl:px-20 2xl:px-24">
        <div className="w-full flex items-center gap-2 sm:gap-4 overflow-x-auto py-3 scrollbar-none text-xs sm:text-sm font-semibold">
          <button
            onClick={() => handleTabChange('vision')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${activeTab === 'vision'
                ? 'bg-[#111b5e] text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            Vision & Core Identity
          </button>
          <button
            onClick={() => handleTabChange('president')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${activeTab === 'president'
                ? 'bg-[#111b5e] text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            From the President’s Desk
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${activeTab === 'history'
                ? 'bg-[#111b5e] text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            Society Chronicle (1924–Present)
          </button>
          <button
            onClick={() => handleTabChange('institutions')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${activeTab === 'institutions'
                ? 'bg-[#111b5e] text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            Our Three Institutions' Heritage
          </button>
          <button
            onClick={() => handleTabChange('governance')}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${activeTab === 'governance'
                ? 'bg-[#111b5e] text-white shadow-xs font-bold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            Governing Council & Leadership
          </button>
        </div>
      </div>

      {/* Main Content Area: Full-Width Stretched with Rounded Elegance */}
      <main className="w-full flex-1 px-6 sm:px-10 lg:px-14 xl:px-20 2xl:px-24 py-10 lg:py-14">
        {/* ========================================================= */}
        {/* TAB 1: VISION STATEMENT & CORE IDENTITY */}
        {/* ========================================================= */}
        {activeTab === 'vision' && (
          <div className="w-full space-y-10">
            {/* Vision Statement Header Card */}
            <div id="pillars" className="w-full bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
                <div className="space-y-1.5">
                  <span className="inline-block px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/60">
                    INSTITUTIONAL CHARTER
                  </span>
                  <h2 className="font-serif text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
                    Vision Statement of Nirakar Education Society
                  </h2>
                </div>
                <p className="text-stone-500 text-xs sm:text-sm md:text-base font-sans">
                  Enshrined tenets guiding pedagogy, curriculum, character building, and community service across all institutions.
                </p>
              </div>

              {/* Four Vision Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pillar 1 */}
                <div className="rounded-2xl border border-stone-200/90 bg-[#FAF7F2] p-6 sm:p-8 hover:bg-white hover:border-amber-400 hover:shadow-md transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl font-black text-amber-700/80">01</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
                      <Compass size={20} />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                    To strive for excellence in education by developing intellectual potential of students
                  </h3>
                  <p className="text-sm sm:text-base text-stone-600 font-sans leading-relaxed">
                    Fostering critical thinking, scientific curiosity, scholastic discipline, and board exam laurels.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="rounded-2xl border border-stone-200/90 bg-[#FAF7F2] p-6 sm:p-8 hover:bg-white hover:border-amber-400 hover:shadow-md transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl font-black text-amber-700/80">02</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
                      <Sparkles size={20} />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                    To impart quality education through innovative learning practices in keeping with time
                  </h3>
                  <p className="text-sm sm:text-base text-stone-600 font-sans leading-relaxed">
                    Integrating modern Atal Tinkering Labs, robotics, digital classrooms, and continuous comprehensive evaluation.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="rounded-2xl border border-stone-200/90 bg-[#FAF7F2] p-6 sm:p-8 hover:bg-white hover:border-amber-400 hover:shadow-md transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl font-black text-amber-700/80">03</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
                      <Award size={20} />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                    To provide creative environment to tap and nurture talent for development of professional skills
                  </h3>
                  <p className="text-sm sm:text-base text-stone-600 font-sans leading-relaxed">
                    Equipping students with vocational acumen, sports proficiency, stage confidence, and technological readiness.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="rounded-2xl border border-stone-200/90 bg-[#FAF7F2] p-6 sm:p-8 hover:bg-white hover:border-amber-400 hover:shadow-md transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl font-black text-amber-700/80">04</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                    To inculcate high moral values and sense of nationalism in keeping with the glorious heritage of Nirakar Education Society
                  </h3>
                  <p className="text-sm sm:text-base text-stone-600 font-sans leading-relaxed">
                    Preserving Goan cultural identity, patriotic devotion, civic ethics, and selfless service to the motherland.
                  </p>
                </div>
              </div>
            </div>

            {/* Society Motto & Core Creed Inscription - Minimalist Institutional Edition */}
            <div id="anthem" className="w-full bg-[#0b132b] text-white rounded-3xl border border-stone-800 p-8 sm:p-12 lg:p-14 relative overflow-hidden">
              <div className="max-w-5xl mx-auto space-y-10">
                {/* Minimalist Top Attribution Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4 text-xs font-mono">
                  <span className="tracking-[0.2em] text-amber-400/90 uppercase font-semibold">
                    Institutional Motto & Creed
                  </span>
                  <span className="text-stone-400 tracking-wider">
                    Enshrined 1924 • Canacona, Goa
                  </span>
                </div>

                {/* Central Sacred Inscription */}
                <div className="text-center space-y-3 py-2">
                  <h3 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-wide">
                    ।। तमसो मा ज्योतिर्गमय ।।
                  </h3>
                  <p className="text-stone-300 text-xs sm:text-sm tracking-[0.22em] uppercase font-sans font-medium">
                    "Lead Us From Darkness Unto Light"
                  </p>

                  {/* Delicate Hairline Separator */}
                  <div className="w-12 h-px bg-amber-400/40 mx-auto my-5" />

                  <div className="space-y-1">
                    <p className="font-marathi font-medium text-xl sm:text-3xl text-amber-200">
                      निराकारातून आकाराकडे
                    </p>
                    <p className="font-serif italic text-stone-400 text-xs sm:text-sm">
                      "Nirakar gives Akar to the future of Goa"
                    </p>
                  </div>
                </div>

                {/* Three Tenets - Clean Typographic Columns (No Bulky Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/10">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold block">
                      01 / Dispelling Darkness
                    </span>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                      Rooted in the ancient Sanskrit invocation, guiding rural youths from the darkness of ignorance toward scientific discernment and enlightened citizenship.
                    </p>
                  </div>

                  <div className="space-y-2 md:border-l md:border-white/10 md:pl-8">
                    <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold block">
                      02 / Giving Noble Shape
                    </span>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                      Molding raw potential into distinguished scholars, innovators, civil servants, and athletes through discipline, compassionate guidance, and modern pedagogy.
                    </p>
                  </div>

                  <div className="space-y-2 md:border-l md:border-white/10 md:pl-8">
                    <span className="text-[11px] font-mono tracking-widest text-amber-400 uppercase font-bold block">
                      03 / Mushtifund Pledge
                    </span>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                      Honoring the sacred 1924 tradition of "a handful of rice for education," ensuring that every rural child in Canacona receives quality schooling regardless of circumstance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mushtifund Heritage & Institutional Profile Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left: Mushtifund Heritage */}
              <div id="mushtifund" className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest uppercase text-amber-800 bg-amber-50/90 border border-amber-200/80 px-3 py-1 rounded-md mb-4">
                    SACRED BEGINNINGS • 1924
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-5">
                    The Sacred Concept of Mushtifund
                  </h3>
                  <div className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans space-y-4">
                    <p>
                      The history of Nirakar Education Society goes back to the pre-liberation Portuguese era when people concerned about educational prosperity came forward to start Marathi medium schools in the village of Loliem in Canacona taluka, the southernmost taluka on Goa-Karnataka border (then Goa-India border).
                    </p>
                    <p>
                      With the blessings of His Holiness Gokarn Partagal Mathadheesh Indirakant Teerth Swamiji, in 1924, the villagers came together to set up three schools – No 1 in Loliem, No 2 in Mashem and No 3 at Panaskhandem, on the border of Poinguinim village. They started as primary schools, from Standard I to IV.
                    </p>
                    <blockquote className="border-l-4 border-amber-600 bg-amber-50/40 pl-5 pr-4 py-4 rounded-r-xl my-4 text-stone-800 font-serif text-sm sm:text-base leading-relaxed italic shadow-2xs">
                      “The concept to run the schools was Mushtifund. A handful of rice each student would contribute and the dedicated teachers would teach the students with the ‘salary of rice’. There was no independent school premises. The village temple was also the temple of knowledge and education.”
                    </blockquote>
                    <p>
                      Eventually, the School No 3 at Panaskhandem closed down. But School No 1 was converted into today’s Shree Damodar Vidyalaya, Loliem and School No 2 into Shree Nirakar Vidyalaya, Mashem. The Shree Nirakar Vidyalaya kept on shifting its classes from temple to Agrashala, depending on the festivities.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono">
                  <span>Preserving Canacona's Educational Heritage</span>
                  <span className="text-amber-800 font-semibold">100+ Years Legacy</span>
                </div>
              </div>

              {/* Right: Institutional Facts Registry */}
              <div id="registry" className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-center gap-3.5 border-b border-stone-200/80 pb-4">
                    <img 
                      src="/images/Logo.jpg" 
                      alt="Society Seal" 
                      className="w-12 h-12 shrink-0 aspect-square object-contain" 
                    />
                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-bold text-[#111b5e] leading-snug">
                        Institutional Registry
                      </h4>
                      <span className="text-[11px] sm:text-xs text-stone-500 font-mono block">
                        Government of Goa Recognized Trust • Reg. No. 128/Goa
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-stone-100 text-xs sm:text-sm font-sans pt-2">
                    {[
                      { label: "Founded Under Swamiji's Blessings", value: "1924 (Mushtifund)" },
                      { label: "Regular Classes Commenced", value: "1939 (Agrashala)" },
                      { label: "First Independent Premises", value: "1950 (Mashem Campus)" },
                      { label: "First SSC Pune Board Batch", value: "1962-63 (100% Pass)" },
                      { label: "Young Brigade Takeover", value: "1991 (Prashant Naik Era)" },
                      { label: "S.S. Angle HSS Established", value: "1993 (Dapot Campus)" },
                      { label: "Tudal High School Established", value: "1998-99 (Gaondongrem)" },
                      { label: "Central Headquarters", value: "Mashem, Canacona, South Goa" },
                      { label: "Affiliation & Authority", value: "Goa Board of Secondary & HSSC" },
                    ].map((row, idx) => (
                      <div 
                        key={idx} 
                        className="py-2.5 px-2 flex items-center justify-between gap-4 transition-colors hover:bg-stone-50/80 rounded-md"
                      >
                        <span className="text-stone-600 font-medium text-xs sm:text-sm">{row.label}</span>
                        <span className="font-semibold text-stone-900 text-xs sm:text-sm text-right shrink-0">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between text-[11px] sm:text-xs text-stone-500 font-mono">
                  <span>Directorate of Education, Goa</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Official Record
                  </span>
                </div>
              </div>
            </div>

            {/* Campus Infrastructure Overview */}
            <div id="amenities" className="w-full bg-[#0b132b] text-white rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-md space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-white/10 text-amber-400 border border-white/20">
                CAMPUS INFRASTRUCTURE & PUBLIC ENDOWMENTS
              </span>
              <h3 className="font-serif text-xl sm:text-3xl font-bold text-white">
                World-Class Learning & Sports Amenities
              </h3>
              <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans w-full">
                In addition, the Nirakar Education Society is today well equipped with one of the best playgrounds – <strong id="sports-pavilion">Nirakar Maidan</strong> – at Dapot and an <strong>Indoor Stadium</strong>. Nirakar Education Society has proved to be one of the best institutes today in Goa, just not in Canacona, to give Akar (shape) to the student community.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2 text-xs font-sans">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                  <span>Nirakar Maidan at Dapot (Sprawling Football & Cricket Ground)</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                  <span>Indoor Stadium & Cricket Practice Pitch</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                  <span>Student Library & Digital Learning Archives</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                  <span>Atal Tinkering Innovation Lab (Robotics & 3D Prototyping)</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                  <span>Advanced Physics, Chemistry & Biology Wet Labs</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                  <span>Central Society Library, Audio-Visual Suites & DEITI Center</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FROM THE PRESIDENT'S DESK (MR. PRASHANT NAIK) */}
        {/* ========================================================= */}
        {activeTab === 'president' && (
          <div className="w-full bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-8">
            {/* Header: Title */}
            <div className="border-b border-stone-200/80 pb-6 space-y-2">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/60">
                PRESIDENTIAL ADDRESS
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight">
                LET’S DO IT TOGETHER
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-sans">
                From the Desk of Mr. Prashant Naik, President / Chairperson, Shri Nirakar Education Society
              </p>
            </div>

            {/* Layout: Photo first on mobile (order-1 lg:order-2), Text paragraphs below photo on mobile (order-2 lg:order-1) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Text Column: order-2 on mobile, order-1 on desktop (lg:col-span-7 xl:col-span-8) */}
              <div className="order-2 lg:order-1 lg:col-span-7 xl:col-span-8 space-y-5 text-base sm:text-base md:text-[16.5px] text-stone-800 leading-[1.8] font-sans">
                {/* Lead Quote */}
                <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-5 sm:p-6 italic text-stone-900 font-serif text-base sm:text-lg leading-relaxed shadow-2xs">
                  "The mission of our society was to consciously espouse and promote the values of self-reliance, patriotism, civil liberties and freedom from colonial bondage. Today, our focus is to guarantee quality education coupled with life-oriented skills, ensuring young learners remain tied to the values of the soil as they soar to rise to their full potential."
                </div>

                <p>
                  As I pen these lines, I recollect the patriotic fervour surrounding the formation of the Shri Nirakar Education Society. Those were the days of struggle for liberation and education was regarded as a powerful vehicle in the march towards political freedom. The mission of our society was to consciously espouse and promote the values of self-reliance, patriotism, civil liberties and freedom from colonial bondage.
                </p>

                <p>
                  With the liberation of Goa, the focus in the mission moved to promote and preserve the local language and culture. Our institution repositioned itself to work for the educational empowerment of rural students with emphasis on imbibing in the young minds our local culture, values and language.
                </p>

                <p>
                  There were ups and downs as we look back. Migration of locals to towns, preference for English-medium education and competition from other schools results in dwindling strength of our institution. We had to rework our mission and strategy to answer the needs and requirements of the changing times. The focus today in all our institutions is to ensure better infrastructure, innovative methodologies of learning and dedicated teachers. The motto is to guarantee quality education coupled with life-oriented skills insuring that the young learners are tied to the values of the soil as they soar to rise to their full potential at State, National and international levels.
                </p>

                <p>
                  Founded in 1924 as a Mushtifund Saunstha the NES moved in three different places before settling in its present premises of Nirakar High School in 1950s the regular classes of a full-fledged school stated in 1939. Ours was one of the first education societies to send students for SSC of Pune Board in 1962. In fact that was the first time we achieved hundred percent result of our Nirakar High School a feat which we have achieved after fifty years this year.
                </p>

                <p>
                  In 1991 we youngsters took over the reins of NES and from then, there was no looking back. In 1993 we started the Satyavati Soiru Angle Higher Secondary School with substantial help coming from a renowned philanthropist and former Member of Parliament Ramakant Angle. In 1998 we crossed the borders of Loliem Polem Panchayat and started a High School in Tudal village of Gaodongari Panchayat. This school which is catering to over ninety percent students from ST community has carved out a name for itself in the educational field. The latest edition is that of science stream at the Satyavati Soiru Angle Higher Secondary School, which we opened last year that is in 2011.
                </p>

                <p>
                  All this was possible due to the unstinted support from the Nirakar Devsthan Committee and co-operation and help received from my committee members of NES, contributions and support received from Village Panchayat Loliem Polem, Maji Vidyarthi Sanghatana of Nirakar High School, Mashem Cricket Club and above all the loving people of Goa in general and Canacona in particular.
                </p>

                <p>
                  Let me reiterate that the main aim of the Society is to render <strong>“Quality Education”</strong> to the student fraternity of Nirakar. The Society would be one which would strive to be the best in every area and field it undertakes. As it blossoms full, it will spread its fragrance throughout Goa and to all the nooks and corners of the globe through its alumni.
                </p>

                <p>
                  We are committed to create an educational community of hardworking individuals who have a noble sense of purpose in their lives, inspiring all around them to transcend barriers, overcome odds and work in unison to bring progressive values in society.
                </p>

                <p>
                  I have no doubt that through this web portal we will reach out and communicate to our students, alumni and all the stakeholders strengthening the bonds of love and friendship. This bonding and sharing will result in the enrichment of all and pave the way for achieving our vision and mission. Let’s move hand in hand and put our hands together in unison. I look forward for this synergy to keep the Nirakar flag flying and fluttering high in the educational skies.
                </p>

                {/* Presidential Sign-off */}
                <div className="pt-6 border-t border-stone-200 mt-6">
                  <div className="text-sm font-sans">
                    <span className="font-serif font-black text-xl text-stone-900 block">
                      Mr. Prashant Naik
                    </span>
                    <span className="text-xs text-amber-900 font-mono font-bold block mt-0.5">
                      President / Chairperson, Shri Nirakar Education Society
                    </span>
                    <span className="text-xs text-stone-500 font-mono block">
                      Mashem Campus, Canacona, South Goa
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Enlarged Prominent Photo of Mr. Prashant Naik (order-1 on mobile, order-2 on desktop) */}
              <div className="order-1 lg:order-2 lg:col-span-5 xl:col-span-4 space-y-4">
                <div className="bg-[#FAF7F2] rounded-3xl border-2 border-amber-400/80 p-4 sm:p-5 shadow-lg space-y-4">
                  {/* Big Enlarged Photo */}
                  <div className="w-full h-80 sm:h-96 lg:h-[440px] rounded-2xl overflow-hidden border border-amber-300 shadow-md bg-stone-100 relative group">
                    <img
                      src="/images/Prashant_Naik_Chairman.png"
                      alt="Mr. Prashant Naik, President / Chairperson"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 left-3 right-3 bg-[#0b132b]/85 backdrop-blur-xs text-amber-300 border border-white/15 px-3.5 py-1.5 rounded-xl text-center text-xs font-mono font-bold uppercase tracking-wider">
                      President / Chairperson
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="text-center space-y-1">
                    <h3 className="font-serif text-xl sm:text-2xl font-black text-stone-900">
                      Mr. Prashant Naik
                    </h3>
                    <p className="text-xs font-bold text-amber-900 font-mono tracking-wide uppercase">
                      President, Shri Nirakar Education Society
                    </p>
                    <p className="text-[11px] text-stone-500 font-sans">
                      Leading the Society & Young Brigade Renaissance Since 1991
                    </p>
                  </div>

                  {/* Key Contributions Summary */}
                  <div className="border-t border-stone-200/90 pt-3 space-y-2 text-xs font-sans text-stone-700">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>Elected President at age 28 in 1991</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>Established S.S. Angle HSS in 1993</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>Spearheaded Tudal High School in 1998</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>Developed Nirakar Maidan Sports Complex</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SOCIETY CHRONICLE (1924–PRESENT) */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <div className="w-full space-y-6">
            <div id="chronicle" className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/60">
                CHRONOLOGICAL GAZETTE
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-black text-stone-900">
                History: Nirakar gives Akar to the future of Goa
              </h2>
              <p className="text-sm sm:text-base text-stone-600 font-sans w-full">
                The continuous record of educational service, infrastructural expansion, and student empowerment across Canacona Taluka from 1924 to the present era.
              </p>
            </div>

            {/* 85+ Years & Centenary Milestone (1939–2026) */}
            <div id="milestones" className="bg-gradient-to-r from-amber-900/10 via-amber-50 to-amber-100/40 rounded-2xl border-2 border-amber-500/60 shadow-md p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-amber-300/60 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-600 text-white shadow-xs shrink-0 whitespace-nowrap w-fit">
                    1939 – 2026 (85+ YEARS)
                  </span>
                  <h3 className="font-serif font-black text-lg sm:text-2xl text-stone-900 leading-snug">
                    85+ Years of Dedicated Service & Centenary Legacy
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200/70 px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap w-fit self-start sm:self-auto">
                  Mushtifund Centenary (1924–2024)
                </span>
              </div>
              <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-sans">
                From the first regular classes begun in the temple Agrashala in 1939, Shri Nirakar Education Society has rendered over 85 years of uninterrupted, dedicated educational service to Canacona Taluka. Marking a full century since the original 1924 Mushtifund genesis, the Society today educates over 2,400 active scholars across three campuses, with a global alumni fraternity exceeding 16,500 graduates.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
                <div className="bg-white/80 rounded-xl p-3 border border-amber-200">
                  <span className="block font-serif font-black text-xl text-amber-900">1939</span>
                  <span className="text-[11px] text-stone-600 font-mono">Regular School Founded</span>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-amber-200">
                  <span className="block font-serif font-black text-xl text-amber-900">1962</span>
                  <span className="text-[11px] text-stone-600 font-mono">100% First SSC Result</span>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-amber-200">
                  <span className="block font-serif font-black text-xl text-amber-900">3 Campuses</span>
                  <span className="text-[11px] text-stone-600 font-mono">Mashem, Dapot, Tudal</span>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-amber-200">
                  <span className="block font-serif font-black text-xl text-amber-900">85+ Yrs</span>
                  <span className="text-[11px] text-stone-600 font-mono">Continuous Service</span>
                </div>
              </div>
            </div>

            {/* Timeline Cards in Smooth Rounded-2xl Styling */}
            <div className="space-y-4">
              {/* 1924 */}
              <div id="pioneers" className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all p-6 sm:p-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-stone-200/80 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100/80 text-amber-900 border border-amber-200/80 shrink-0 whitespace-nowrap">
                      1924
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                      The Mushtifund Genesis Under Swamiji's Blessings
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Pre-Liberation Portuguese Era</span>
                </div>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  The history of Nirakar Education Society goes back to the pre-liberation Portuguese era when people concerned about educational prosperity came forward to start Marathi medium schools in the village of Loliem in Canacona taluka, the southernmost taluka on Goa-Karnataka border (then Goa-India border). With the blessings of His Holiness Gokarn Partagal Mathadheesh Indirakant Teerth Swamiji, in 1924, the villagers came together to set up three schools – No 1 in Loliem, No 2 in Mashem and No 3 at Panaskhandem, on the border of Poinguinim village. They started as primary schools, from Standard I to IV.
                </p>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  The concept to run the schools was Mushtifund. A handful of rice each student would contribute and the dedicated teachers would teach the students with the ‘salary of rice’. There was no independent school premises. The village temple was also the temple of knowledge and education. The school No 1 was thus running in Shree Keshav temple, No 2 in Shree Nirakar temple and No 3 in Shree Venkatesh temple.
                </p>
                <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans italic">
                  Eventually, the School No 3 at Panaskhandem closed down. But School No 1 was converted into today’s Shree Damodar Vidyalaya, Loliem and School No 2 into Shree Nirakar Vidyalaya, Mashem. The Shree Nirakar Vidyalaya kept on shifting its classes from temple to Agrashala, depending on the festivities.
                </p>
              </div>

              {/* 1939 - 1950 */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all p-6 sm:p-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-stone-200/80 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100/80 text-amber-900 border border-amber-200/80 shrink-0 whitespace-nowrap">
                      1939 & 1950
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                      Agrashala Classes to Permanent Four-Room School
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">First Independent Building</span>
                </div>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  After struggling for the first 15 years, the Nirakar Vidyalaya started working with regular classes from Nirakar Devalaya’s Agrashala from 1939. But the school was shifted to its independent premises only in 1950. This was just a building of four rooms, what we see today from left side, where Headmaster’s chamber is located.
                </p>
              </div>

              {/* 1958 */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all p-6 sm:p-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-stone-200/80 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100/80 text-amber-900 border border-amber-200/80 shrink-0 whitespace-nowrap">
                      1958
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                      Expansion by Late Tukaram Lolayekar for Pune Board Recognition
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Full-Fledged High School</span>
                </div>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  The building was later extended with more rooms in 1958. The then NES president late Tukaram Lolayekar, an eminent businessman and social worker, took initiative to take up this task at his own cost. The building had become mandatory to get recognition from the Pune Board of Education, Maharashtra to start a full-fledged High School with the batches of SSC (Std XI in those days). Nirakar Vidyalaya was the second institution in the whole of Canacona taluka, after Mallikarjun Vidyalaya, Char Rasta, Canacona, to start full-fledged classes.
                </p>
              </div>

              {/* 1962-63 */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all p-6 sm:p-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-stone-200/80 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100/80 text-amber-900 border border-amber-200/80 shrink-0 whitespace-nowrap">
                      1962-63
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                      Historic 100% First SSC Batch Result (17 Out of 17 Passed)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Post-Liberation Laurel</span>
                </div>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  With the accomplishment of this Herculean task, the first batch of SSC passed out from Nirakar High School in the academic year 1962-63, soon after Goa’s liberation in 1961. It was a matter of pride for the school that the result of the first batch was 100 per cent, with all the 17 students studying in SSC passed out. Till then, the students of Nirakar High School were going for their higher studies across the border, either at Majali or Karwar.
                </p>
              </div>

              {/* 1961-65 */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all p-6 sm:p-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-stone-200/80 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100/80 text-amber-900 border border-amber-200/80 shrink-0 whitespace-nowrap">
                      1961–1965
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                      Samaj Mandir, Panchayat Founding & Silver Jubilee with CM Bandodkar
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Civic & Campus Growth</span>
                </div>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  The Nirakar Education Society then took up construction of two rooms in 1961, which are the small rooms of today’s school hall. The Nirakar Education Society as well as the Loliem-Pollem Village Panchayat started functioning from these two rooms of the hall. The Panchayat was later shifted to its own premises in Loliem in 1963.
                </p>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  Later on, a hall – called Samaj Mandir – was constructed in 1963, adjacent to these two rooms, leaving half of its area open. It was inaugurated at the hands of then Lt Governor Mr M R Sachdev. (The hall area was extended and fully covered with proper roofing as well as walls in 1989-90.) This was followed by annexe building on the hill top with six rooms, two of which were big rooms, in 1963-64. The need was felt as the strength of students started increasing with its best performance in academics as well as all-round development of the students in co-curricular activities.
                </p>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  The school then continued progressing while celebrating its Silver Jubilee (25 years) in 1964-65. The grand celebration was honoured by Goa’s first Chief Minister late Bhausaheb alias Dayanand Bandodkar.
                </p>
              </div>

              {/* 1991 */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all p-6 sm:p-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-stone-200/80 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100/80 text-amber-900 border border-amber-200/80 shrink-0 whitespace-nowrap">
                      1991
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                      The Young Brigade Takes Reins of Nirakar Education Society
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Young Leadership Renaissance</span>
                </div>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  1991 was the year of a major transformation that took place in the history of Nirakar Education Society. The Young Brigade, which had passed out from the school in recent times, took over the management of the Society with an aim to upgrade the quality of education and rise to new heights. Mr Prashant Naik took over as the President of Nirakar Education Society at the age of 28 while Mr Prasad Lolayekar took over as the Chairman of the Managing Committee at the age of 23. Most of the members of the newly elected committee were around the same age.
                </p>
              </div>

              {/* 1993 - 1996 */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all p-6 sm:p-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-stone-200/80 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100/80 text-amber-900 border border-amber-200/80 shrink-0 whitespace-nowrap">
                      1993–1996
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                      Founding of S.S. Angle Higher Secondary School at Dapot
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Collegiate Expansion</span>
                </div>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  The young management then took a major step to set up S S Angle Higher Secondary School in 1993. With the financial support rendered by a Margao-based businessman and social worker Mr Ramakant Angle, the premises was shifted to a new venue at Dapot in Mashem in 1995-96. The higher secondary made its mark at the state level by producing the best talent which is making its presence felt in different areas of Goa’s social, cultural, literary, sports and educational fields.
                </p>
              </div>

              {/* 1998 - 1999 */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all p-6 sm:p-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-stone-200/80 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100/80 text-amber-900 border border-amber-200/80 shrink-0 whitespace-nowrap">
                      1998–1999
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                      Setting Up Tudal High School in Gaondongrem (Tribal Mission)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">37-Year Void Resolved</span>
                </div>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  Yet another major step was then taken by the Young Brigade when it responded to the advertisement by the Education Department, Government of Goa, to come forward to set up a High School in a remote area of Tudal in Gaodongri village in Canacona. This predominantly tribal area of Canacona did not have a High School for 37 years even after Goa’s liberation.
                </p>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  The Nirakar Education Society thus spread its tentacles outside Loliem village by setting up Tudal High School in 1998-99. While classes were started in Saraswati Mandir, the Young Brigade also constructed its first building, with four classrooms, within one year.
                </p>
              </div>

              {/* 1999-2000 */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all p-6 sm:p-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-stone-200/80 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100/80 text-amber-900 border border-amber-200/80 shrink-0 whitespace-nowrap">
                      1999–2000
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                      Diamond Jubilee Celebrations with Dr. Anil Kakodkar
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Eminent Nuclear Scientist</span>
                </div>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  This was the year – 1999-2000, when Nirakar Education Society celebrated its Diamond Jubilee. India’s eminent scientist of Goan origin, Dr Anil Kakodkar, graced the occasion while series of programmes were also held this year to upgrade the academic standard of the teaching faculty.
                </p>
              </div>

              {/* 2002 to Present */}
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all p-6 sm:p-8 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-stone-200/80 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-2 sm:gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100/80 text-amber-900 border border-amber-200/80 shrink-0 whitespace-nowrap">
                      2002 to Present
                    </span>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                      Science Stream, Primary School, Nirakar Maidan & Beyond
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">Modern State-of-the-Art Hub</span>
                </div>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  By 2002-03, Tudal High School constructed a two-storied full-fledged building. The school has made its mark with best performance in the academic as well as in the co-curricular field.
                </p>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
                  By 2011-12, the S S Angle Higher Secondary School took yet another important step by starting a Science stream. In 2012-13, Tudal High School was granted permission by the Education Department to start a Primary School in Konkani medium.
                </p>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans font-medium">
                  In addition, the Nirakar Education Society is today well equipped with one of the best playground – Nirakar Maidan – at Dapot and an Indoor Stadium. Nirakar Education Society has proved to be one of the best institutes today in Goa, just not in Canacona, to give Akar (shape) to the student community.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: OUR THREE INSTITUTIONS' HERITAGE */}
        {/* ========================================================= */}
        {activeTab === 'institutions' && (
          <div className="w-full space-y-8">
            {/* Responsive Sub-Tabs with generous breathing gap */}
            <div className="w-full overflow-x-auto scrollbar-none pt-1 pb-3 mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white p-1.5 sm:p-2 rounded-full border border-stone-200/90 shadow-2xs min-w-max">
                <button
                  type="button"
                  onClick={() => setInstitutionSubTab('nirakar')}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${institutionSubTab === 'nirakar'
                      ? 'bg-[#111b5e] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                >
                  <span className="sm:inline hidden">Shri Nirakar High School History</span>
                  <span className="sm:hidden">Shri Nirakar High School</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInstitutionSubTab('angle')}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${institutionSubTab === 'angle'
                      ? 'bg-[#111b5e] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                >
                  <span className="sm:inline hidden">Angle Higher Secondary School History</span>
                  <span className="sm:hidden">Angle Higher Secondary School</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInstitutionSubTab('tudal')}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-serif font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${institutionSubTab === 'tudal'
                      ? 'bg-[#111b5e] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                >
                  <span className="sm:inline hidden">Tudal High School History</span>
                  <span className="sm:hidden">Tudal High School</span>
                </button>
              </div>
            </div>

            {/* Sub-Tab 1: Shri Nirakar High School History */}
            {institutionSubTab === 'nirakar' && (
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-6">
                <div className="border-b border-stone-200/80 pb-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/60 mb-2">
                    FLAGSHIP FOUNDING CAMPUS • MASHEM (ESTD. 1924 / MIDDLE SCHOOL 1950)
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-black text-stone-900">
                    Nirakar High School History
                  </h2>
                </div>

                {/* Real Campus Photo Showcase - Uncropped Full View */}
                <div className="w-full rounded-2xl overflow-hidden border border-stone-200/90 shadow-md bg-stone-900 group">
                  <div className="w-full min-h-[380px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[620px] flex items-center justify-center p-3 sm:p-6 relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900">
                    <img
                      src="/images/Nirakar_Vidyalaya_Mashem.webp"
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none"
                    />
                    <img
                      src="/images/Nirakar_Vidyalaya_Mashem.webp"
                      alt="Shri Nirakar High School, Mashem"
                      className="relative z-10 max-h-[580px] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 bg-stone-50 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-sans text-stone-600">
                    <span className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                      Shri Nirakar High School (Mashem Flagship Campus)
                    </span>
                    <span className="font-mono text-stone-500 text-xs">
                      Estd. 1924 (Mushtifund) • Secondary Schooling Since 1950 • Mashem, Canacona
                    </span>
                  </div>
                </div>

                {/* Full-Width Institutional Text */}
                <div className="w-full space-y-6 text-sm sm:text-base lg:text-[17px] text-stone-800 leading-relaxed font-sans">
                  <p>
                    From the noble ideal of ‘Mushtifund’ was born Shri Nirakar Vidyalaya in 1924. The traditional pedagogy of the village found its sustenance through a handful offerings of grain and the unflinching support of its community members. Against all odds of the pre-liberation period it emerged as a full-fledged middle school on 5th of June 1950.
                  </p>

                  <p>
                    While the entire nation and the state was making impressive strides in education, it was only a distant dream for Kankonkars. So the crusade for imparting good education had to be bolstered. During the time when Goa was charged with the spirit of nationalism, the school nurtured young minds and hearts who immensely contributed to the cause of liberation of Goa.
                  </p>

                  <p>
                    The actual work of the school began on 5th June 1940. Catering to the educational needs of only 15-20 pupils was its humble beginning. Gradually it progressed due to the dedication and selfless work of teachers like <strong>Shri Madhav B. Prabhugaonkar</strong>, <strong>Shri Venkatesh Y. Bhende</strong>, <strong>Shri Madhav H. Prabhudesai</strong>, <strong>Shri Ramchandra V. Prabhudesai</strong> and <strong>Smt. Sudarabai N. Prabhudesai</strong>. Classes were conducted at various places like the veranda of someone’s house, in the assembly hall of Shri Nirakar temple as the school did not have an independent building of its own. However the plans of constructing a school building received overwhelming support of the villagers who generously lent timber and other material required for its construction. As per plans the construction began in the property that belonged to the Shri Nirakar Devalay and in the year 1950 the school building was inaugurated at the hands of <strong>Dr. Vasantrao Nagarsekar</strong>.
                  </p>

                  <p>
                    However with the subsequent addition of classes space constraint was felt and the school building towards its east side was constructed under the patronage of the then President of the management, <strong>Shri Tukaram S. Lolayekar</strong>.
                  </p>

                  <p>
                    In the year 1950 its first batch of std VII answered the primary school exam from Karwar centre. After its initial success in educational endeavours, <strong>Mr. Gopal V. Prabhu</strong> made efforts to take it two steps further by introducing std VIII and IX in the years 1954 and 55 respectively. For the approval of the Pune S.S.C. board it was mandatory to have pucca walls for the classes. The school celebrated its silver jubilee in the year 1965. Goa’s first Chief Minister <strong>Mr. Bahusaheb Bandodkar</strong> was the chief guest for the silver jubilee function. It was in 1969 the building with six classes was inaugurated.
                  </p>

                  <p>
                    After liberation, that is from the year 1961 the school was upgraded to impart quality education upto S.S.C level. The full fledged school was run under the leadership of <strong>Shri Suresh Kanekar</strong>, <strong>Shri Ravindra Pai Raiturkar</strong> and <strong>Shri Ram V. Bhat</strong>. From the year 1964 to 1970 the school was under the tutelage of <strong>Shri Ramdas N. Phene</strong>, whose competency brought in great stability and many accomplishments. In the year 1971 <strong>Shri Suresh Prabhugaonkar</strong> was appointed the headmaster of the school. The school celebrated its golden Jubilee during his leadership. <strong>Mr. Jairam Gaonkar</strong> was appointed as the Headmaster of this institution in the year 1998. Many innovative methods of teaching were carried out in school during his tenure. The society also provided extensive support for students coming from disadvantaged backgrounds. Students not only from Canacona but from different parts of Goa are availing education at this institution. Presently the school is run under the able leadership of <strong>Mr. Hemant Kamat</strong>. Plans for developments are ongoing and every effort is made by NES to provide the best facilities.
                  </p>

                  <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-6 sm:p-8 italic text-stone-900 font-serif text-base sm:text-lg leading-relaxed shadow-xs">
                    "As envisioned by the founders, the school has lived up to its highest enshrined values and principles and produced excellent leaders in various fields. We are proud of these Nirakarians, who keep the flag of highest values handed over to us by the founders, soaring high... Today we have a team of the stakeholders of education-the Management, the staff and the parents working creatively to give a new direction to the innovative young minds to excel and shine."
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Angle Higher Secondary School History */}
            {institutionSubTab === 'angle' && (
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-6">
                <div className="border-b border-stone-200/80 pb-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/60 mb-2">
                    COMMENCED JUNE 1993 • DAPOT, MASHEM CAMPUS
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-black text-stone-900">
                    Angle Higher Secondary School History
                  </h2>
                  <p className="font-serif italic text-sm sm:text-base text-amber-900/90 mt-1">
                    "Imprints on the Sands of Time" • Mission: Manavyam Paramam Dheyyam
                  </p>
                </div>

                {/* Real Campus Photo Showcase - Uncropped Full View */}
                <div className="w-full rounded-2xl overflow-hidden border border-stone-200/90 shadow-md bg-stone-900 group">
                  <div className="w-full min-h-[380px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[620px] flex items-center justify-center p-3 sm:p-6 relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900">
                    <img
                      src="/images/S.S.Angle_Higher_Secondary_School_Dapot.webp"
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none"
                    />
                    <img
                      src="/images/S.S.Angle_Higher_Secondary_School_Dapot.webp"
                      alt="S.S. Angle Higher Secondary School, Dapot"
                      className="relative z-10 max-h-[580px] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 bg-stone-50 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-sans text-stone-600">
                    <span className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                      Satyawati Soiru Angle Higher Secondary School (Dapot Campus)
                    </span>
                    <span className="font-mono text-stone-500 text-xs">
                      Commenced June 1993 • Classes XI & XII (Arts, Science & Commerce) • Dapot, Mashem
                    </span>
                  </div>
                </div>

                {/* Full-Width Institutional Text */}
                <div className="w-full space-y-6 text-sm sm:text-base lg:text-[17px] text-stone-800 leading-relaxed font-sans">
                  <p>
                    Inspired by a young and energetic team of management members, Shri Nirakar Education Society’s <strong>Satyawati Soiru Angle Higher Secondary School</strong> commenced classes in June 1993 in the premises of Shree Nirakar Vidyalaya under the dynamic leadership of <strong>Dr. Narayan B Desai</strong>. The avowed aim was to enable individuals to develop academic and social skills, strength of character, resourcefulness and creativity necessary to become successful family members, citizens and workers, by providing a happy, intellectually stimulating and caring environment in which everyone is given the opportunity to reach their full potential.
                  </p>

                  <p>
                    The essence of our school’s mission statement <em>Manavyam Paramam Dheyyam</em> is best expressed in John J. Dunphy award winning essay, The Humanist (1983), when he says: <em>"The battle for humankind's future must be waged and won in the public school classroom by teachers who correctly perceive their role as the proselytisers of a new faith: A religion of humanity -- utilizing a classroom instead of a pulpit to carry humanist values into wherever they teach.”</em>
                  </p>

                  <p>
                    As we enter into our journey we feel obliged with gratitude to remember the exceptional contribution made by our mentors <strong>late Balkrishna Prabhugaonkar</strong>, <strong>late Mangaldas Lolayekar</strong>, <strong>late Shashank Shirodkar</strong> who are no more with us. Their names will always remain etched in our collective memory for many years to come.
                  </p>

                  <p>
                    Thanks to the goodwill and sustained commitment of these and many other visionary people, Angle Higher Secondary School has come a long way to grow in its stature as one of the leading rural institutions in the state. On <strong>June 21st 1998</strong> the spacious new building of Shri Nirakar Education Society’s S. S. Angle Higher Secondary School was inaugurated by then Governor of Goa <strong>H.E. Lt. General J. F. R. Jacob (PVSM)</strong> on the sprawling Nirakar Maidan marking another important milestone in the history of the Society.
                  </p>

                  <p>
                    In June 2011 the Society added another feather to its cap when the <strong>science stream</strong> was introduced with a strength of 24 students and science laboratories equipped with all modern amenities and state of the art technology. Amidst cycles of greatness and lows too, that can sometimes be very irksome and thorny, we continue to march ahead with renewed commitment and dedication to come in the reckoning of greatness in our pursuit of excellence.
                  </p>

                  {/* Chairman and Principal Declarations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="rounded-2xl border border-stone-200/90 bg-[#FAF7F2] p-6 space-y-3">
                      <span className="text-xs font-mono font-bold uppercase text-amber-900 block">
                        MR. PRASHANT NAIK • CHAIRMAN, SHRI NIRAKAR EDUCATION SOCIETY
                      </span>
                      <p className="font-serif italic text-sm sm:text-base text-stone-800 leading-relaxed">
                        “The Higher Secondary has grown to be one of the top rural institutions in the state and can boast of infrastructural facilities that match the best in the country that include a spacious premises/ new building, Full length hall besides a mini hall, Indoor cricket pitch, Sprawling Football/Cricket Ground, well equipped gymnasium, Volleyball Court, Baseball Ground, Recreation Room, Computer Lab, state of the art laboratories, Audio-Visual Room, Library, Music Room, NSS Room, Agriculture plot, and a DEITI centre. The society has big expansion plans and will continue to make the rural institution into a centre for excellence.”
                      </p>
                    </div>

                    <div className="rounded-2xl border border-stone-200/90 bg-[#FAF7F2] p-6 space-y-3">
                      <span className="text-xs font-mono font-bold uppercase text-[#111b5e] block">
                        MR. JAIRAM K. GAONKAR • PRINCIPAL
                      </span>
                      <p className="font-serif italic text-sm sm:text-base text-stone-800 leading-relaxed">
                        “Great institutions take a long time and very many great people to build it. Many a factors come together for greatness to happen. Management, teachers, students, parents, in all their diversity, have to come together and a culture has to come about where such greatness becomes a possibility and a norm. With legitimate pride and sound optimism we can say it is a dream destined to be true.”
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 3: Tudal High School History */}
            {institutionSubTab === 'tudal' && (
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-6">
                <div className="border-b border-stone-200/80 pb-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/60 mb-2">
                    FOUNDED 1998-99 • GAONDONGREM HINTERLAND CAMPUS
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-black text-stone-900">
                    Tudal High School History
                  </h2>
                  <p className="font-serif italic text-sm sm:text-base text-amber-900/90 mt-1">
                    "A Village Nestled Among the Hills • The Uncut Diamonds of Goa"
                  </p>
                </div>

                {/* Real Campus Photo Showcase - Uncropped Full View */}
                <div className="w-full rounded-2xl overflow-hidden border border-stone-200/90 shadow-md bg-stone-900 group">
                  <div className="w-full min-h-[380px] sm:min-h-[480px] md:min-h-[560px] lg:min-h-[620px] flex items-center justify-center p-3 sm:p-6 relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900">
                    <img
                      src="/images/Tudal_High_School_Gaodongrem.webp"
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none"
                    />
                    <img
                      src="/images/Tudal_High_School_Gaodongrem.webp"
                      alt="Tudal High School, Gaondongrem"
                      className="relative z-10 max-h-[580px] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 bg-stone-50 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-sans text-stone-600">
                    <span className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                      Tudal High School (Gaondongrem Rural Sanctuary Campus)
                    </span>
                    <span className="font-mono text-stone-500 text-xs">
                      Founded 1998-99 • Classes V to X • Gaondongrem, Sahyadri Foothills
                    </span>
                  </div>
                </div>

                {/* Full-Width Institutional Text */}
                <div className="w-full space-y-6 text-sm sm:text-base lg:text-[17px] text-stone-800 leading-relaxed font-sans">
                  <p>
                    <strong>Tudal High School</strong> has the rare distinction of being the only school in Goa named after the village it was meant to be in. And it is in Gaondongrem, a place literally meaning ‘a village nestled among the hills’. It definitely conjures up images of verdant fields fringed by steep towering mountains and dense forests. A picturesque beauty, it is the idyllic setting for a temple of learning.
                  </p>

                  <p>
                    In 1998, the reputed educational organization of Shri Nirakar Education Society was invited by the Government of Goa to set up a new school in the middle of a rustic village with an old world charm, not far from the hustle and bustle of the booming new town of Canacona. Inspite of a couple of attempts by other private educational societies to do the same (which obviously ended in failure), <strong>Mr. Prasad Lolayekar</strong> of Shri Nirakar Education Society took up the cudgels and began the groundwork arduously. The Headmaster of Shri Nirakar Vidyalaya, Mashem, <strong>Mr. Jairam K. Gaonkar</strong>, was appointed as the acting Headmaster of the school and all efforts began in earnest. In fact, it was he who christened the school at its fledgling stage the lyrical <em>Tudal Middle School</em>.
                  </p>

                  <p>
                    Although this middle school began in a humble shed, the society went on, contradicting critics, in building a school in a location close by with classrooms, a library, a laboratory and an office. The villagers of Tudal, themselves austere, simple folk, generously donated their land for the school.
                  </p>

                  <p>
                    To cap it all, a new three-storeyed building was constructed for the high school with the best facilities for the students under the leadership of the Headmaster, <strong>Mr. Vijaykumar A. Prabhu</strong>. A great amount of credit goes to the astute Chairman of Shri Nirakar Education Society, <strong>Mr. Prashant Naik</strong>, for successfully establishing the fully modern structure of the school as it now stands.
                  </p>

                  <p>
                    The children in the locality of Gaondongrem are the uncut diamonds of our state. The majority not only belongs to the tribal community, they are economically backward and first-generation learners. The sparkle in their eyes to know the world keeps Shri Nirakar Education Society’s lamp of commitment burning. The teaching-learning process would be incomplete without the active participation of the parents. The Parent Teacher Association meetings witness full house attendance with eager, optimistic parents keenly participating in the discussions pertaining to the progress and development of their wards.
                  </p>

                  <p>
                    Tudal High School has much to boast about since its inception. It raced against time to make up for what other schools took decades – be it in academics, sports or co-curricular activities. The students under the guidance of an all-young staff have showcased their talents in different spheres. They have even presented their science projects at prestigious exhibitions all over in India. Since the students live and study in the bosom of nature herself, they know nature in its truest form and hence, passionately participate in nature conservation programmes. The sports champions of the school have won accolades not only for the school but have made our state proud.
                  </p>

                  <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-6 sm:p-8 italic text-stone-900 font-serif text-base sm:text-lg leading-relaxed shadow-xs">
                    "Looking back over the years, the development that has taken place in Tudal High School has been tremendous, not just in proving quality education but in changing society to look forward towards a brighter future."
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: GOVERNING COUNCIL & LEADERSHIP */}
        {/* ========================================================= */}
        {activeTab === 'governance' && (
          <div id="governance" className="w-full space-y-8">
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/60">
                EXECUTIVE GOVERNANCE
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-black text-stone-900">
                Governing Council & Society Leadership
              </h2>
              <p className="text-sm sm:text-base text-stone-600 font-sans w-full">
                Led by the Young Brigade administration that assumed governance in 1991, supported by institutional heads and managing committee trustees.
              </p>
            </div>

            {/* Leadership Cards Grid in Rounded-3xl / 2xl */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* President Prashant Naik */}
              <div id="council" className="bg-white rounded-3xl border-2 border-amber-400/80 shadow-md p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 border border-amber-300 shrink-0">
                    <img src="/images/Prashant_Naik_Chairman.png" alt="Mr. Prashant Naik" className="w-full h-full object-cover object-top" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      PRESIDENT / CHAIRPERSON
                    </span>
                    <h3 className="font-serif text-lg font-bold text-stone-900 mt-1">Mr. Prashant Naik</h3>
                    <p className="text-[11px] text-stone-500 font-sans">President since 1991</p>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-sans pt-2 border-t border-stone-100">
                  Visionary leader of the Young Brigade, overseeing the expansion of Angle HSS, Tudal High School, Nirakar Maidan, and society modernization.
                </p>
              </div>

              {/* Chairman Managing Committee Prasad Lolayekar */}
              <div id="managing-committee" className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111b5e] bg-blue-50 px-2.5 py-1 rounded-full">
                  CHAIRMAN, MANAGING COMMITTEE
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">Mr. Prasad Lolayekar</h3>
                <p className="text-[11px] text-stone-500 font-sans">Managing Committee Head since 1991</p>
                <p className="text-xs text-stone-600 leading-relaxed font-sans pt-2 border-t border-stone-100">
                  Key architect of the 1991 Young Brigade renaissance; led the pioneering groundwork in establishing Tudal High School in Gaondongrem.
                </p>
              </div>

              {/* Headmaster Shri Nirakar HS */}
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                  HEADMASTER • NIRAKAR HS
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">Mr. Hemant Kamat</h3>
                <p className="text-[11px] text-stone-500 font-sans">Mashem Flagship Campus</p>
                <p className="text-xs text-stone-600 leading-relaxed font-sans pt-2 border-t border-stone-100">
                  Leading secondary academic rigour, board exam distinction preparation, and Atal Tinkering Labs innovation.
                </p>
              </div>

              {/* Principal S.S. Angle HSS */}
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-full">
                  PRINCIPAL • ANGLE HSS
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">Mr. Jairam K. Gaonkar</h3>
                <p className="text-[11px] text-stone-500 font-sans">Dapot Collegiate Campus</p>
                <p className="text-xs text-stone-600 leading-relaxed font-sans pt-2 border-t border-stone-100">
                  Distinguished educational administrator, former founding headmaster of Tudal Middle School and long-serving principal of Angle HSS.
                </p>
              </div>

              {/* Headmaster Tudal HS */}
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">
                  HEADMASTER • TUDAL HS
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">Mr. Vijaykumar A. Prabhu</h3>
                <p className="text-[11px] text-stone-500 font-sans">Gaondongrem Rural Mission</p>
                <p className="text-xs text-stone-600 leading-relaxed font-sans pt-2 border-t border-stone-100">
                  Spearheaded the construction of the three-storeyed Tudal High School complex and rural community outreach.
                </p>
              </div>

              {/* Central Secretariat */}
              <div id="secretariat" className="bg-[#FAF7F2] rounded-3xl border border-stone-200/90 shadow-sm p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 bg-stone-200/70 px-2.5 py-1 rounded-full">
                    CENTRAL SECRETARIAT
                  </span>
                  <h3 className="font-serif text-lg font-bold text-stone-900 mt-2">Society Administrative Office</h3>
                  <p className="text-xs text-stone-600 mt-1 font-sans">
                    Shri Nirakar Education Society Central Office, Mashem, Canacona, South Goa 403728
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-200/80 space-y-1.5 text-xs text-stone-700 font-mono">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-[#111b5e]" />
                    <span>+91 832 2643236</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-[#111b5e]" />
                    <span>nirakareducation@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Annual General Body Meetings & Trust Governance */}
            <div id="meetings" className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-full">
                    STATUTORY GOVERNANCE & AGBM
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-1">
                    Annual General Body Meetings & Registered Trust Compliance
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                  Trust Reg. No. 128/Goa
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                Shri Nirakar Education Society operates as an officially registered educational trust under the Societies Registration Act (Registration No. 128/Goa). The Society convenes regular Annual General Body Meetings (AGBM) of registered life members and trustees at the Mashem Headquarters to present audited financial statements, review academic directorate milestones, ratify infrastructure development resolutions, and sanction welfare endowments.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-sans">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-[#111b5e] block">Annual Statutory Audits</span>
                  <span className="text-stone-500 text-[11px] mt-0.5 block">Chartered Accountant vetted balance sheets submitted to Registrar of Societies.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-[#111b5e] block">Managing Committee Elections</span>
                  <span className="text-stone-500 text-[11px] mt-0.5 block">Democratic election of office bearers under Society Constitution Bylaws.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="font-bold text-[#111b5e] block">Public Disclosures</span>
                  <span className="text-stone-500 text-[11px] mt-0.5 block">Statutory gazette notices published under Directorate of Education Goa norms.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SocietyPage;
