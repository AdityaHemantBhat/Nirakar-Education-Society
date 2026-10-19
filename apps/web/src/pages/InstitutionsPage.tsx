import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Campuses } from '../components/Campuses.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';

export const InstitutionsPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#0f172a] flex flex-col font-sans">
      <Helmet>
        <title>Our Campuses & Institutions | Shree Nirakar Education Society</title>
        <meta name="description" content="Explore Shri Nirakar High School, Tudal High School, and S.S. Angle Higher Secondary School." />
      </Helmet>

      <Navbar />

      {/* Header Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
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

      <main className="w-full flex-1">
        <Campuses />
      </main>

      <Footer />
    </div>
  );
};
