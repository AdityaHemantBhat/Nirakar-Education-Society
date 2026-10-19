import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { GraduationCap, Users, Calendar, Award, FileText, Image as ImageIcon, BookOpen } from 'lucide-react';

export const InstitutionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'faculty' | 'notices' | 'batch'>('overview');

  const { data: inst, isLoading } = useQuery({
    queryKey: ['institution', slug],
    queryFn: async () => {
      const res = await fetch(`/api/v1/content/institutions/${slug}`);
      if (!res.ok) throw new Error('Institution not found');
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-700 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!inst) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4">
        <h2 className="font-serif text-2xl font-bold text-ink">Institution Not Found</h2>
        <a href="/" className="mt-4 text-brand-700 font-semibold underline">
          Return to Home
        </a>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${inst.name} | Shree Nirakar Education Society`}</title>
        <meta name="description" content={inst.tagline || inst.history} />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-[#FAF7F2] pb-20 font-sans">
        {/* Hero Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
        <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
          {/* Thread-like curve wave strips in light orange / amber */}
          <HeroWaves opacity={0.85} />

          {inst.bannerUrl && (
            <div className="absolute inset-0 -z-10 opacity-20">
              <img src={inst.bannerUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b132b] via-[#0b132b]/80 to-transparent" />
            </div>
          )}

          <div className="max-w-7xl mx-auto space-y-4 text-center relative z-10">
            <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block">
              {inst.code} • CANACONA, GOA
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              {inst.name}
            </h1>
            <p className="text-sm sm:text-lg text-stone-200 font-sans max-w-2xl mx-auto leading-relaxed">
              {inst.tagline}
            </p>
          </div>
        </div>

        <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

        {/* Micro-site Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2.5 rounded-xl font-serif text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-ink hover:bg-stone-100'
              }`}
            >
              Overview & Vision
            </button>
            <button
              onClick={() => setActiveTab('faculty')}
              className={`px-5 py-2.5 rounded-xl font-serif text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'faculty'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-ink hover:bg-stone-100'
              }`}
            >
              Faculty Directory ({inst.facultyProfiles?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-5 py-2.5 rounded-xl font-serif text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'batch'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-ink hover:bg-stone-100'
              }`}
            >
              Batch Photos & Heritage
            </button>
          </div>

          {/* Tab 1: Overview & Vision */}
          {activeTab === 'overview' && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-brand-800">
                  <BookOpen size={20} />
                  <h2 className="font-serif text-xl font-bold">Institutional History</h2>
                </div>
                <p className="text-sm font-sans text-stone-700 leading-relaxed">
                  {inst.history ||
                    'Founded under the auspices of Shree Nirakar Education Society to provide stellar academic training and values-based character formation in Canacona, South Goa.'}
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-brand-800">
                  <Award size={20} />
                  <h2 className="font-serif text-xl font-bold">Vision & Guiding Ideals</h2>
                </div>
                <p className="text-sm font-sans text-stone-700 leading-relaxed">
                  {inst.vision ||
                    'To nurture intellectually sound, socially empathetic, and culturally grounded citizens capable of contributing meaningfully to society and Goa’s progress.'}
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Faculty Directory */}
          {activeTab === 'faculty' && (
            <div className="mt-8">
              {inst.facultyProfiles && inst.facultyProfiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inst.facultyProfiles.map((f: any) => (
                    <div
                      key={f.id}
                      className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col items-center text-center space-y-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-stone-100 border-2 border-brand-100">
                        {f.photoUrl ? (
                          <img src={f.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Users size={32} />
                          </div>
                        )}
                      </div>
                      <h3 className="font-serif text-base font-bold text-ink">
                        {f.name || f.publicContactToggles?.name || f.publicContactToggles?.fullName || f.user?.username || 'Faculty Member'}
                      </h3>
                      <p className="text-xs font-serif font-semibold text-brand-800">{f.designation || 'Faculty Member'}</p>
                      <p className="text-xs text-stone-600 font-sans">{f.department}</p>
                      <p className="text-xs text-stone-500 font-sans">
                        {f.subjects?.join(', ')} • {f.qualification}
                      </p>
                      <span className="text-[11px] font-mono text-stone-400">
                        Experience: {f.experience}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-cream rounded-3xl p-10 text-center max-w-md mx-auto space-y-2 border border-stone-200">
                  <Users size={32} className="mx-auto text-stone-400" />
                  <h4 className="font-serif text-base font-bold text-ink">Faculty Directory</h4>
                  <p className="text-xs text-stone-600 font-sans">
                    Faculty profiles are being curated. Approved faculty entries will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Batch Photos */}
          {activeTab === 'batch' && (
            <div className="mt-8 bg-cream p-10 rounded-3xl border border-stone-200 text-center max-w-lg mx-auto space-y-3">
              <ImageIcon size={32} className="mx-auto text-stone-400" />
              <h3 className="font-serif text-base font-bold text-ink">Historical Batch Albums</h3>
              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                Archival graduation photos and batch memories from Shri Nirakar institutions are being cataloged.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};
