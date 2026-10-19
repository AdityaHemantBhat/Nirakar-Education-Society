import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { SocialIconsBar } from '../components/SocialIcons.js';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  ExternalLink,
  Users,
  AlertTriangle,
  Heart,
  ArrowLeft,
  Share2,
  Check,
  Pencil,
} from 'lucide-react';
export const AlumniProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const decodedParam = decodeURIComponent(username || '').toLowerCase().trim();

  const {
    data: profile,
    isLoading: isApiLoading,
    isError: isApiError,
    error: apiError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['alumni_profile', decodedParam],
    queryFn: async () => {
      const res = await fetch(`/api/v1/alumni/${encodeURIComponent(decodedParam)}`, {
        credentials: 'same-origin',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Could not load this alumni profile.');
      }
      return json?.data ?? null;
    },
    // Ownership depends on the current login cookie; a cached anonymous response
    // must not hide the edit action immediately after signing in.
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });

  const firstName = profile?.firstName || profile?.name || 'Alumnus';
  const lastName = profile?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const schoolName =
    profile?.schoolName ||
    (profile?.school === 'NIRAKAR_HS'
      ? 'Shri Nirakar Vidyalaya'
      : profile?.school === 'ANGLE_HSS'
      ? 'S. S. Angle Higher Secondary School'
      : 'Tudal High School');
  const verificationLevel = profile?.verificationLevel || 'UNVERIFIED';

  const mappedSocialLinks = React.useMemo(() => {
    if (!profile) return undefined;
    if (profile.socialLinks && typeof profile.socialLinks === 'object' && !Array.isArray(profile.socialLinks)) {
      return profile.socialLinks;
    }
    if (Array.isArray(profile.socialLinks)) {
      const obj: Record<string, string> = {};
      profile.socialLinks.forEach((item: any) => {
        if (!item?.url) return;
        const platform = (item.platform || '').toLowerCase();
        if (platform.includes('linkedin')) obj.linkedin = item.url;
        else if (platform.includes('twitter') || platform === 'x') obj.twitter = item.url;
        else if (platform.includes('github')) obj.github = item.url;
        else if (platform.includes('scholar')) obj.googleScholar = item.url;
        else if (platform.includes('researchgate')) obj.researchGate = item.url;
        else obj.website = item.url;
      });
      return obj;
    }
    return undefined;
  }, [profile]);

  if (!profile && isApiLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#16247e] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile && isApiError) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
        <Helmet>
          <title>Alumni Profile Unavailable | Shree Nirakar Education Society</title>
        </Helmet>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 py-24">
          <AlertTriangle size={44} className="text-amber-600 mx-auto" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Profile temporarily unavailable
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md">
            {apiError instanceof Error ? apiError.message : 'The alumni profile could not be loaded.'}
          </p>
          <button
            type="button"
            onClick={() => void refetchProfile()}
            className="px-6 py-2.5 bg-[#0b132b] text-white rounded-xl text-xs font-serif font-bold hover:bg-[#16247e] transition-colors"
          >
            Try again
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
        <Helmet>
          <title>Alumni Profile Not Found | Shree Nirakar Education Society</title>
        </Helmet>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 py-24">
          <User size={48} className="text-stone-300 mx-auto" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Alumni Profile Not Found
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md">
            The alumni directory profile for "{decodedParam}" could not be located or may be pending administrative verification.
          </p>
          <Link
            to="/alumni"
            className="px-6 py-2.5 bg-[#0b132b] text-white rounded-xl text-xs font-serif font-bold hover:bg-[#16247e] transition-colors"
          >
            Return to Alumni Directory
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${fullName} | Verified Alumni | Shree Nirakar Education Society`}</title>
        <meta
          name="description"
          content={`Profile of ${fullName}, Class of ${profile?.batchYear || 'Alumni'} from ${schoolName}.`}
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-[#FAF7F2] pb-20 font-sans">
        {/* Profile Header Hero: Seamlessly tucked under Navbar golden curve with ZERO gap */}
        <div data-profile-hero className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-20 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
          <HeroWaves opacity={0.85} />

          <div className="w-full max-w-[1850px] mx-auto space-y-6 relative z-10">
            {/* Top Breadcrumbs */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <Link
                to="/alumni"
                className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-serif font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Alumni Directory</span>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Prominent High-Res Avatar Portrait */}
              <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-stone-100 border-4 border-amber-400/90 shadow-2xl shrink-0 relative">
                {(profile.photoUrl || profile.avatarUrl) ? (
                  <img
                    src={profile.photoUrl || profile.avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-100">
                    <User size={64} />
                  </div>
                )}
              </div>

              {/* Identity Info */}
              <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {fullName}
                  </h1>
                  <div className={`px-3 py-1 rounded-full border text-xs font-mono font-semibold flex items-center gap-1 backdrop-blur-xs ${
                    verificationLevel === 'TRUSTED'
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                      : verificationLevel === 'VERIFIED'
                      ? 'bg-blue-950/80 border-blue-400/60 text-blue-200'
                      : 'bg-amber-950/80 border-amber-400/60 text-amber-200'
                  }`}>
                    <ShieldCheck size={14} />
                    <span>
                      {verificationLevel === 'TRUSTED'
                        ? 'Trusted Alumni'
                        : verificationLevel === 'VERIFIED'
                        ? 'Verified Graduate'
                        : 'Verification Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono text-stone-300">
                  <span className="bg-white/10 px-3 py-1 rounded-full border border-white/15">
                    {schoolName}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Calendar size={15} />
                    <span>Class of {profile.batchYear}</span>
                  </div>
                </div>

                {profile.occupation && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base font-serif text-amber-300 font-semibold">
                    <Briefcase size={16} />
                    <span>{profile.occupation}</span>
                  </div>
                )}

                {profile.city && (
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-stone-300">
                    <MapPin size={14} />
                    <span>Residing in {profile.city}</span>
                  </div>
                )}

                {/* REAL OFFICIAL SOCIAL ICONS BAR IN HERO */}
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-300 hidden sm:inline">
                    Connected Networks:
                  </span>
                  <SocialIconsBar links={mappedSocialLinks} size="md" theme="dark" />
                </div>
              </div>

              {profile.isOwner && (
                <Link
                  to="/alumni/dashboard"
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#0b132b] font-serif text-xs font-bold shadow-lg transition-all flex items-center gap-2 shrink-0 self-center sm:self-start"
                >
                  <Pencil size={16} />
                  <span>Edit my profile</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

        {/* FULL WIDTH STRETCHED BODY CONTAINER */}
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Profile Bio & Academic Roots Left */}
          <div className="lg:col-span-8 space-y-8">
            {/* Bio */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-stone-200/90 shadow-sm space-y-3.5">
              <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
                About & Professional Journey
              </h2>
              <p className="text-sm sm:text-base font-sans text-stone-700 leading-relaxed whitespace-pre-line">
                {profile.bio || 'Proud alumnus of Shree Nirakar Education Society, contributing to professional excellence and community advancement while carrying forward our institutional values.'}
              </p>
            </div>

            {/* Academic Roots & Institutional Heritage Card */}
            <div className="bg-white p-7 sm:p-9 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <GraduationCap size={18} className="text-amber-800" />
                <h2 className="font-serif text-xl font-bold text-stone-900">Academic Roots & Institutional Heritage</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="font-mono text-[10px] uppercase font-bold text-stone-400">Graduating Alma Mater</div>
                  <div className="font-serif font-bold text-stone-900 text-sm">{schoolName}</div>
                  <div className="text-stone-500 text-[11px]">Canacona, South Goa</div>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="font-mono text-[10px] uppercase font-bold text-stone-400">Graduation Class</div>
                  <div className="font-mono font-bold text-amber-900 text-sm">Class of {profile.batchYear || 'Alumni Member'}</div>
                  <div className="text-stone-500 text-[11px]">Verified Registry Record</div>
                </div>
              </div>
            </div>

            {/* Optional Family Members Section */}
            {profile.familyMembers && profile.familyMembers.length > 0 && (
              <div className="bg-white p-7 sm:p-9 rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                  <Users size={18} className="text-amber-800" />
                  <h2 className="font-serif text-xl font-bold text-stone-900">Nirakar Legacy & Family Members</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.familyMembers.map((fam: any) => (
                    <div key={fam.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
                      {fam.photoUrl ? (
                        <img src={fam.photoUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center shrink-0">
                          <User size={18} className="text-stone-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-serif text-sm font-bold text-stone-900">{fam.name}</h4>
                        <span className="text-xs font-mono text-stone-500">{fam.relation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Right */}
          <div className="lg:col-span-4 space-y-6">
            {/* Validated Real Social Profiles */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-serif text-base font-bold text-stone-900">Connected Profiles</h3>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Verified
                </span>
              </div>
              <p className="text-xs text-stone-500 font-sans leading-relaxed">
                Connect directly with this graduate across professional and social platforms:
              </p>
              <div className="pt-1">
                <SocialIconsBar links={mappedSocialLinks} size="lg" theme="brand" />
              </div>
            </div>

            {/* Trust Panel ("How this profile was verified") */}
            <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/30 p-6 sm:p-7 rounded-3xl border border-amber-200/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-900">
                <ShieldCheck size={20} className="text-amber-700" />
                <h3 className="font-serif text-base font-bold">Verification Transparency</h3>
              </div>
              <p className="text-xs text-stone-700 font-sans leading-relaxed">
                {verificationLevel === 'UNVERIFIED'
                  ? 'This alumni profile is awaiting review by Shree Nirakar Education Society administration. Verification is granted only after the school record has been checked.'
                  : 'This alumni profile has been reviewed by Shree Nirakar Education Society administration against available school records.'}{' '}
                Personal contact details are not displayed on this profile.
              </p>
              {profile.vouches && profile.vouches.length > 0 && (
                <div className="pt-2 border-t border-amber-200/60 text-xs text-stone-700 font-sans">
                  <span className="font-semibold text-amber-950">Vouched by:</span>{' '}
                  {profile.vouches.map((v: any) => v.voucher?.username || 'Alumni member').join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};
