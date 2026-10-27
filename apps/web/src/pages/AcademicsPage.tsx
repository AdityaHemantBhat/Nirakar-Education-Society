import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { BookOpen, GraduationCap, Calendar, Award, CheckCircle, FileText } from 'lucide-react';

export const AcademicsPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#0f172a] flex flex-col font-sans">
      <Helmet>
        <title>Academics & Curriculum | Shri Nirakar Education Society</title>
        <meta name="description" content="Explore Goa Board curriculum, higher secondary science, commerce, and arts streams, labs, and examination schedules." />
      </Helmet>

      <Navbar />

      {/* Header Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="w-full relative z-10 max-w-5xl space-y-3">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block">
            Teaching & Learning
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Academic Framework & Disciplined Pedagogy
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            State-certified curriculum from Standard VIII through Standard XII with focus on science inquiry, mathematics, languages, and moral values.
          </p>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      <main className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 py-14 space-y-14">
        {/* Secondary Section */}
        <section id="secondary-education" className="scroll-mt-28 bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-[#16247e] flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">Goa Board of Secondary Education</span>
              <h2 className="font-serif text-2xl font-bold text-ink">Secondary Education (Std VIII to X)</h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Offered at **Shri Nirakar High School (Mashem)** and **Tudal High School (Gaondongrem)**. The curriculum strictly follows the Goa Board syllabus with strong laboratory focus in Physics, Chemistry, and Biology.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h4 className="font-serif font-bold text-sm text-ink">Languages & Literature</h4>
              <p className="text-xs text-stone-500 mt-1">English (First Language), Konkani, Marathi, and Hindi.</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h4 className="font-serif font-bold text-sm text-ink">Science & Mathematics</h4>
              <p className="text-xs text-stone-500 mt-1">Practical lab sessions, geometry, algebra, and physics experiments.</p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <h4 className="font-serif font-bold text-sm text-ink">Social Sciences & Arts</h4>
              <p className="text-xs text-stone-500 mt-1">History of Goa, Indian Civics, Geography, Drawing & Craft.</p>
            </div>
          </div>
        </section>

        {/* Higher Secondary Section */}
        <section id="higher-secondary" className="scroll-mt-28 bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-800 flex items-center justify-center">
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#16247e]">S. S. Angle Higher Secondary</span>
              <h2 className="font-serif text-2xl font-bold text-ink">Higher Secondary College Streams (Std XI & XII)</h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Preparing students for competitive university entrances including JEE, NEET, GUJCET, and commerce professional tracks (CA / CS Foundation).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-brand-50/50 border border-brand-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800">Stream 01</span>
              <h3 className="font-serif font-bold text-base text-ink">Science Stream</h3>
              <p className="text-xs text-stone-600">Physics, Chemistry, Mathematics, Biology, Computer Science, and English.</p>
            </div>
            <div className="p-6 rounded-2xl bg-accent-50/50 border border-accent-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-800">Stream 02</span>
              <h3 className="font-serif font-bold text-base text-ink">Commerce Stream</h3>
              <p className="text-xs text-stone-600">Accountancy, Business Studies, Economics, Commercial Mathematics & IT.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600">Stream 03</span>
              <h3 className="font-serif font-bold text-base text-ink">Arts & Humanities</h3>
              <p className="text-xs text-stone-600">History, Political Science, Psychology, Sociology, and Literature.</p>
            </div>
          </div>
        </section>

        {/* Examination & Evaluation Policy */}
        <section id="evaluation-policy" className="scroll-mt-28 bg-stone-50 rounded-3xl p-8 border border-stone-200 space-y-4">
          <h3 className="font-serif text-xl font-bold text-ink">Examination & Continuous Assessment Policy</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Evaluation comprises periodic unit tests, quarterly progress monitoring, practical lab journals, and preliminary board trials. Parent-teacher meetings (PTA) are conducted every term to review every child's individual progress.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};
