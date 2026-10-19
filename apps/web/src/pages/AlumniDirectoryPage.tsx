import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { AlumniCardSkeleton } from '@nirakar/ui';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { CustomSelect } from '../components/CustomSelect.js';
import { SocialIconsBar } from '../components/SocialIcons.js';
import { Search, ShieldCheck, User, ArrowRight, MapPin, Briefcase } from 'lucide-react';
import { COMPREHENSIVE_ALUMNI } from '../data/alumniData.js';

export const AlumniDirectoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [batchYear, setBatchYear] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['alumni_directory', search, selectedSchool, batchYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedSchool) params.append('school', selectedSchool);
      if (batchYear) params.append('batchYear', batchYear);

      const res = await fetch(`/api/v1/alumni?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load directory');
      const json = await res.json();
      return json.data || [];
    },
  });

  const combinedAlumni = React.useMemo(() => {
    const list = data && data.length > 0 ? data : COMPREHENSIVE_ALUMNI;
    return list.filter((alumnus: any) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        alumnus.firstName?.toLowerCase().includes(q) ||
        alumnus.lastName?.toLowerCase().includes(q) ||
        (alumnus.fullName && alumnus.fullName.toLowerCase().includes(q)) ||
        (alumnus.occupation && alumnus.occupation.toLowerCase().includes(q)) ||
        (alumnus.city && alumnus.city.toLowerCase().includes(q));

      const matchSchool = !selectedSchool || alumnus.school === selectedSchool;
      const matchYear = !batchYear || alumnus.batchYear?.toString().includes(batchYear.trim());

      return matchSearch && matchSchool && matchYear;
    });
  }, [data, search, selectedSchool, batchYear]);

  return (
    <>
      <Helmet>
        <title>Verified Alumni Directory | Shree Nirakar Education Society</title>
        <meta
          name="description"
          content="Connect with verified alumni of Shri Nirakar Vidyalaya, Tudal High School, and S. S. Angle Higher Secondary School across India and the globe."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-[#F8F6F1] pb-20 font-sans">
        {/* Academic Header Banner */}
        <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
          <HeroWaves opacity={0.85} />

          <div className="w-full max-w-[1850px] mx-auto space-y-4 text-center relative z-10">
            <span className="text-[10px] sm:text-xs uppercase font-serif font-bold tracking-[0.18em] text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-flex items-center">
              Lifelong Community
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white leading-[1.08]">
              Verified Alumni Directory & Network
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-stone-300 font-sans max-w-4xl mx-auto leading-relaxed">
              Discover, collaborate, and connect with trusted graduates across five decades of Canacona academic excellence.
            </p>
          </div>
        </div>

        <SectionEdge variant="wave" color="#F8F6F1" bgColor="#0b132b" height={36} withGoldLine />

        {/* FULL WIDTH STRETCHED CONTAINER */}
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-14 mt-6 space-y-8">
          {/* Filters Bar */}
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search alumni by name, career, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0b132b]/8 focus:border-[#0b132b] transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <CustomSelect
                value={selectedSchool}
                onChange={(val) => setSelectedSchool(val)}
                options={[
                  { value: '', label: 'All Institutions' },
                  { value: 'NIRAKAR_HS', label: 'Shri Nirakar Vidyalaya' },
                  { value: 'TUDAL_HS', label: 'Tudal High School' },
                  { value: 'ANGLE_HSS', label: 'S. S. Angle Higher Secondary School' },
                ]}
                className="bg-stone-50 min-w-[200px]"
              />

              <input
                type="number"
                placeholder="Batch Year (e.g. 1998)"
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                className="w-40 px-3.5 py-2 sm:py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0b132b]/8 focus:border-[#0b132b] transition-all"
              />
            </div>
          </div>

          {/* Directory Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6 lg:gap-7">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <AlumniCardSkeleton key={i} />
              ))}
            </div>
          ) : combinedAlumni && combinedAlumni.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6 lg:gap-7">
              {combinedAlumni.map((alumnus: any) => {
                const schoolName =
                  alumnus.schoolName ||
                  (alumnus.school === 'NIRAKAR_HS'
                    ? 'Shri Nirakar Vidyalaya'
                    : alumnus.school === 'TUDAL_HS'
                    ? 'Tudal High School'
                    : 'S. S. Angle Higher Secondary School');

                const fullName =
                  alumnus.fullName ||
                  `${alumnus.firstName || ''} ${alumnus.lastName || ''}`.trim();

                const profileLink = `/alumni/${alumnus.user?.username || alumnus.id}`;

                return (
                  <article
                    key={alumnus.id}
                    className="group bg-white rounded-[1.25rem] border border-stone-200 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_10px_40px_-20px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_60px_-20px_rgba(15,23,42,0.5)] flex flex-col overflow-hidden"
                  >
                    {/* School + Batch Strip */}
                    <div className="bg-[#0b132b] px-4 py-2 flex items-center justify-between text-white">
                      <span className="text-[10px] sm:text-[11px] font-serif font-bold text-amber-300 uppercase tracking-wide truncate">
                        {schoolName}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/15 shrink-0">
                        Class of {alumnus.batchYear}
                      </span>
                    </div>

                    {/* Big Full-Width Portrait */}
                    <a
                      href={profileLink}
                      className="relative block aspect-[4/5] w-full bg-stone-100 overflow-hidden"
                    >
                      {alumnus.photoUrl ? (
                        <img
                          src={alumnus.photoUrl}
                          alt={fullName || 'Alumni'}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80';
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-stone-100 to-stone-200 text-stone-400">
                          <User size={42} strokeWidth={1.2} />
                        </div>
                      )}
                    </a>

                    {/* Info Section */}
                    <div className="flex flex-1 flex-col p-4 sm:p-5 gap-2.5">
                      <div className="space-y-1.5">
                        <a href={profileLink} className="block no-underline">
                          <h3 className="font-serif text-[17px] sm:text-lg lg:text-xl font-bold text-stone-900 leading-tight line-clamp-2 group-hover:text-amber-900 transition-colors">
                            {fullName}
                          </h3>
                        </a>
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <ShieldCheck size={11} className="text-emerald-600 shrink-0" />
                          Verified Alumnus
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5 mt-0.5">
                        {alumnus.occupation && (
                          <p className="text-xs sm:text-sm font-medium text-stone-800 flex items-start gap-1.5">
                            <Briefcase size={14} className="text-amber-700 mt-0.5 shrink-0" />
                            <span className="line-clamp-2 leading-snug">{alumnus.occupation}</span>
                          </p>
                        )}
                        {alumnus.city && (
                          <p className="text-xs sm:text-sm text-stone-600 flex items-center gap-1.5">
                            <MapPin size={14} className="text-stone-400 shrink-0" />
                            <span className="truncate">{alumnus.city}</span>
                          </p>
                        )}
                      </div>

                      {alumnus.socialLinks && (
                        <div className="pt-1">
                          <SocialIconsBar links={alumnus.socialLinks} size="sm" theme="light" />
                        </div>
                      )}

                      <div className="mt-auto" />
                    </div>

                    {/* Footer */}
                    <div className="px-4 sm:px-5 py-3 border-t border-stone-100 bg-stone-50/70 group-hover:bg-amber-50/60 transition-colors">
                      <a
                        href={profileLink}
                        className="flex items-center justify-between w-full no-underline text-inherit"
                      >
                        <span className="text-xs sm:text-[13px] font-serif font-bold text-stone-900 group-hover:text-amber-900">
                          View Verified Profile
                        </span>
                        <ArrowRight
                          size={16}
                          className="text-amber-700 transition-transform group-hover:translate-x-1"
                        />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 sm:p-12 text-center max-w-lg mx-auto space-y-4 border border-stone-200 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-50 border border-stone-200">
                <User size={26} className="text-stone-400" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">No Alumni Found</h3>
              <p className="text-sm sm:text-base text-stone-600 font-sans leading-relaxed">
                No verified alumni matched your filter criteria. Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};