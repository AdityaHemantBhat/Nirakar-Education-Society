import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { SupporterPassModal } from '../components/SupporterPassModal.js';
import { ShieldCheck, Heart, BookOpen, Award } from 'lucide-react';

export const SupporterPassPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#0f172a] flex flex-col font-sans">
      <Helmet>
        <title>Supporter Pass | Shri Nirakar Education Society</title>
        <meta name="description" content="Support Shri Nirakar Education Society and help keep daily Magazine publications freely available." />
      </Helmet>

      <Navbar />

      {/* Header Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="w-full relative z-10 max-w-5xl mx-auto text-center space-y-3">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block">
            Institutional Contribution
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            The Nirakar Supporter Pass
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            A pay-what-you-want voluntary contribution (from ₹10 to ₹1000) that unlocks all daily Magazine publications and directly supports rural student sports and lab equipment.
          </p>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      <main className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 py-14 max-w-4xl mx-auto space-y-10">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-accent-100 text-accent-800 flex items-center justify-center mx-auto">
            <Heart size={32} />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Empower the Next Generation of Canacona Learners
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed font-sans">
            Whether you choose to contribute ₹10, ₹100, or ₹1,000, your gift helps fund science laboratory kits, rural student sports uniforms, and school library acquisitions.
          </p>

          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#0b132b] hover:bg-[#16247e] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Choose Supporter Contribution Amount
          </button>
        </div>
      </main>

      {modalOpen && <SupporterPassModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />}

      <Footer />
    </div>
  );
};
