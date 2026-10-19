import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { FACULTY_DATA, FacultyMember } from '../data/facultyData.js';
import { slugify } from '../utils/slugify.js';
import { getInitialsAvatar } from '../utils/avatarUtils.js';
import { SocialIconsBar } from '../components/SocialIcons.js';
import { FacultyMessageWidget } from '../components/FacultyMessageWidget.js';
import { FacultyMessagesInbox } from '../components/FacultyMessagesInbox.js';
import { useCurrentAuthUser } from '../hooks/useCurrentAuthUser.js';
import {
  GraduationCap,
  Award,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Lock,
  Share2,
  Check,
  Calendar,
  MapPin,
  Sparkles,
  FileText,
  Edit3,
  ExternalLink,
  X,
  Save,
  User,
} from 'lucide-react';

export const FacultyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [copiedLink, setCopiedLink] = useState(false);

  const currentUser = useCurrentAuthUser();

  // Local storage custom faculty profile hook for real-time live preview & instant client overrides
  const [customProfile, setCustomProfile] = useState<FacultyMember | null>(() => {
    try {
      if (slug) {
        const rawOver =
          localStorage.getItem(`nirakar_faculty_override_${slug}`) ||
          localStorage.getItem(`nirakar_faculty_edit_${slug}`);
        if (rawOver) return JSON.parse(rawOver);

        const allOver = JSON.parse(localStorage.getItem('nirakar_faculty_all_overrides') || '{}');
        if (allOver[slug]) return allOver[slug];
      }
      const saved = localStorage.getItem('nirakar_faculty_custom');
      if (saved) return JSON.parse(saved);
    } catch {
      return null;
    }
    return null;
  });

  useEffect(() => {
    const handleStorageUpdate = (evt?: any) => {
      try {
        if (slug) {
          const rawOver =
            localStorage.getItem(`nirakar_faculty_override_${slug}`) ||
            localStorage.getItem(`nirakar_faculty_edit_${slug}`);
          if (rawOver) {
            setCustomProfile(JSON.parse(rawOver));
            return;
          }

          const allOver = JSON.parse(localStorage.getItem('nirakar_faculty_all_overrides') || '{}');
          if (allOver[slug]) {
            setCustomProfile(allOver[slug]);
            return;
          }
        }
        const saved = localStorage.getItem('nirakar_faculty_custom');
        if (saved) setCustomProfile(JSON.parse(saved));
      } catch {
        // ignore
      }
    };
    window.addEventListener('nirakar_faculty_updated', handleStorageUpdate);
    return () => window.removeEventListener('nirakar_faculty_updated', handleStorageUpdate);
  }, [slug]);

  const [searchParams] = useSearchParams();
  const isAdminFromUrl = searchParams.get('role') === 'admin' || searchParams.get('admin') === 'true';
  const isAdminUser = Boolean(isAdminFromUrl || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN');

  // Fetch dynamic published faculty from API with fallback to static comprehensive data
  const { data: apiFaculty, isLoading: isApiLoading } = useQuery({
    queryKey: ['faculty_published'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/faculty');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) return json.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    staleTime: 60 * 1000,
    retry: false,
  });

  // Query specific faculty member directly by ID / slug
  const { data: singleFaculty, isLoading: isSingleLoading } = useQuery({
    queryKey: ['faculty_single', slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const res = await fetch(`/api/v1/faculty/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const item = json.data;
            const toggles = item.publicContactToggles || {};
            const rawName =
              item.name ||
              toggles.name ||
              toggles.fullName ||
              (toggles.firstName && toggles.lastName ? `${toggles.firstName} ${toggles.lastName}` : '') ||
              (item.user?.name ? item.user.name : item.user?.username ? (item.user.username.charAt(0).toUpperCase() + item.user.username.slice(1)) : '') ||
              (toggles.email ? toggles.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '') ||
              'Faculty Member';

            const rawUsername = item.username || toggles.username || (item.user?.username ? item.user.username : undefined);
            const rawSocial = toggles.socialLinks || item.socialLinks || {};
            const normalizedSocial = {
              linkedin: rawSocial.linkedin || undefined,
              twitter: rawSocial.twitter || undefined,
              googleScholar: rawSocial.googleScholar || rawSocial.scholar || undefined,
              researchGate: rawSocial.researchGate || undefined,
              vidwan: rawSocial.vidwan || undefined,
              orcid: rawSocial.orcid || undefined,
              website: rawSocial.website || undefined,
              github: rawSocial.github || undefined,
            };

            return {
              id: item.id,
              name: rawName,
              username: rawUsername,
              designation: item.designation || 'Faculty Member',
              department: item.department || 'General Academics',
              institutionCode: item.institutionCode || 'NIRAKAR_HS',
              institutionName:
                item.institutionName ||
                (item.institutionCode === 'NIRAKAR_HS'
                  ? 'Shri Nirakar Vidyalaya'
                  : item.institutionCode === 'TUDAL_HS'
                  ? 'Tudal High School'
                  : 'S. S. Angle Higher Secondary School'),
              qualification: item.qualification || 'Certified Educator',
              experience: item.experience || '10+ Years',
              experienceYears: parseInt(item.experience) || 10,
              subjects: Array.isArray(item.subjects) ? item.subjects : [],
              bio: item.bio || '',
              photoUrl: item.photoUrl || '',
              achievements: Array.isArray(item.achievements) ? item.achievements : item.achievements ? [item.achievements] : [],
              publications: Array.isArray(toggles.publications) ? toggles.publications : [],
              email: toggles.showEmail !== false ? (toggles.email || item.email || item.user?.email) : undefined,
              phone: toggles.showPhone !== false ? (toggles.phone || item.phone) : undefined,
              officeHours: toggles.officeHours || '',
              officeLocation: toggles.officeLocation || '',
              isHead: Boolean(toggles.isHead || item.isHead),
              socialLinks: normalizedSocial,
            } as FacultyMember;
          }
        }
      } catch {}
      return null;
    },
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
    retry: false,
  });

  const allFaculty: FacultyMember[] = useMemo(() => {
    let list: FacultyMember[] = FACULTY_DATA;

    if (apiFaculty && apiFaculty.length > 0) {
      const apiMapped: FacultyMember[] = apiFaculty.map((item: any, idx: number) => {
        const toggles = item.publicContactToggles || {};
        const rawName =
          item.name ||
          toggles.name ||
          toggles.fullName ||
          (toggles.firstName && toggles.lastName ? `${toggles.firstName} ${toggles.lastName}` : '') ||
          (item.user?.name ? item.user.name : item.user?.username ? (item.user.username.charAt(0).toUpperCase() + item.user.username.slice(1)) : '') ||
          (toggles.email ? toggles.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '') ||
          'Faculty Member';

        const rawUsername = item.username || toggles.username || (item.user?.username ? item.user.username : undefined);
        const rawSocial = toggles.socialLinks || item.socialLinks || {};
        const normalizedSocial = {
          linkedin: rawSocial.linkedin || undefined,
          twitter: rawSocial.twitter || undefined,
          googleScholar: rawSocial.googleScholar || rawSocial.scholar || undefined,
          researchGate: rawSocial.researchGate || undefined,
          vidwan: rawSocial.vidwan || undefined,
          orcid: rawSocial.orcid || undefined,
          website: rawSocial.website || undefined,
          github: rawSocial.github || undefined,
        };

        return {
          id: item.id || `api-fac-${idx}`,
          name: rawName,
          username: rawUsername,
          designation: item.designation || 'Faculty Member',
          department: item.department || 'General Academics',
          institutionCode: item.institutionCode || 'NIRAKAR_HS',
          institutionName:
            item.institutionName ||
            (item.institutionCode === 'NIRAKAR_HS'
              ? 'Shri Nirakar Vidyalaya'
              : item.institutionCode === 'TUDAL_HS'
              ? 'Tudal High School'
              : 'S. S. Angle Higher Secondary School'),
          qualification: item.qualification || 'Certified Educator',
          experience: item.experience || '10+ Years',
          experienceYears: parseInt(item.experience) || 10,
          subjects: Array.isArray(item.subjects) ? item.subjects : [],
          bio: item.bio || '',
          photoUrl: item.photoUrl || '',
          achievements: Array.isArray(item.achievements) ? item.achievements : item.achievements ? [item.achievements] : [],
          publications: Array.isArray(toggles.publications) ? toggles.publications : [],
          email: toggles.showEmail !== false ? (toggles.email || item.user?.email || item.email) : undefined,
          phone: toggles.showPhone !== false ? (toggles.phone || item.phone) : undefined,
          officeHours: toggles.officeHours || '',
          officeLocation: toggles.officeLocation || '',
          isHead: Boolean(toggles.isHead || item.isHead),
          socialLinks: normalizedSocial,
        };
      });

      const isSeedMatched = (seed: FacultyMember) => {
        const seedSlug = slugify(seed.name);
        const seedCleanSlug = slugify(seed.name.replace(/^(Mr\.|Mrs\.|Dr\.|Prof\.|Shri|Smt\.)\s+/i, ''));
        const seedEmail = (seed.email || '').toLowerCase().trim();

        return apiMapped.some((apiF) => {
          if (apiF.id === seed.id) return true;
          const apiSlug = slugify(apiF.name);
          const apiCleanSlug = slugify(apiF.name.replace(/^(Mr\.|Mrs\.|Dr\.|Prof\.|Shri|Smt\.)\s+/i, ''));
          if (apiSlug === seedSlug || apiCleanSlug === seedCleanSlug || apiSlug === seedCleanSlug || apiCleanSlug === seedSlug) {
            return true;
          }
          if (seedEmail && apiF.email && apiF.email.toLowerCase().trim() === seedEmail) {
            return true;
          }
          if (
            seed.isHead &&
            apiF.isHead &&
            seed.institutionCode === apiF.institutionCode &&
            seed.designation.toLowerCase() === apiF.designation.toLowerCase()
          ) {
            return true;
          }
          return false;
        });
      };

      const remainingSeed = FACULTY_DATA.filter((s) => !isSeedMatched(s));
      list = [...apiMapped, ...remainingSeed];
    }

    if (customProfile) {
      const existingIdx = list.findIndex((f) => slugify(f.name) === slugify(customProfile.name));
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...customProfile };
      } else {
        list = [customProfile, ...list];
      }
    }

    return list;
  }, [apiFaculty, customProfile]);

  // Robust educator resolution supporting slug, ID, clean name, singleFaculty and custom profile
  const educator = useMemo(() => {
    if (!slug) return null;
    const raw = decodeURIComponent(slug).toLowerCase().trim();
    const slugified = slugify(raw);

    if (customProfile) {
      const cSlug = slugify(customProfile.name);
      if (cSlug === slugified || cSlug === raw || (customProfile.id && customProfile.id.toLowerCase() === raw)) {
        return customProfile;
      }
    }

    // Direct ID match first
    const byId = allFaculty.find((f) => f.id.toLowerCase() === raw);
    if (byId) return byId;

    // Direct fetched single faculty
    if (singleFaculty) return singleFaculty;

    // If slug matches a seed faculty item by ID or name, return the corresponding (possibly updated) educator in allFaculty
    const seedItem = FACULTY_DATA.find((s) => s.id.toLowerCase() === raw || slugify(s.name) === slugified);
    if (seedItem) {
      const updatedMatch = allFaculty.find((f) => {
        if (f.id === seedItem.id) return true;
        const sSlug = slugify(seedItem.name);
        const fSlug = slugify(f.name);
        if (sSlug === fSlug) return true;
        if (seedItem.email && f.email && seedItem.email.toLowerCase() === f.email.toLowerCase()) return true;
        return false;
      });
      if (updatedMatch) return updatedMatch;
    }

    return (
      allFaculty.find((f) => slugify(f.name) === slugified) ||
      allFaculty.find((f) => slugify(f.name) === raw) ||
      allFaculty.find((f) => {
        const cleanName = f.name.replace(/^(Mr\.|Mrs\.|Dr\.|Prof\.|Shri|Smt\.)\s+/i, '');
        return slugify(cleanName) === slugified || slugify(cleanName) === raw;
      }) ||
      allFaculty.find((f) => {
        const s = slugify(f.name);
        return s.includes(slugified) || slugified.includes(s);
      }) ||
      allFaculty.find((f) => {
        const words = raw.replace(/[-_.]/g, ' ').split(/\s+/).filter(Boolean);
        const nameLower = f.name.toLowerCase();
        return words.length > 0 && words.every((w) => nameLower.includes(w));
      }) ||
      null
    );
  }, [allFaculty, slug, customProfile, singleFaculty]);

  // Compute permission: admin can edit all profiles, logged-in faculty can ONLY edit their own profile
  const canEditThisProfile = useMemo(() => {
    if (isAdminUser) return true;
    if (!currentUser || !educator) return false;
    if (currentUser.role === 'FACULTY') {
      const uName = (currentUser.username || '').toLowerCase().trim();
      const eName = (educator.name || '').toLowerCase().trim();
      const uEmail = (currentUser.email || '').toLowerCase().trim();
      const eEmail = (educator.email || '').toLowerCase().trim();
      return Boolean(
        (uEmail && eEmail && uEmail === eEmail) ||
        (currentUser.id && (educator as any).userId && currentUser.id === (educator as any).userId) ||
        (currentUser.id && currentUser.id === educator.id) ||
        (currentUser.facultyProfile?.id && currentUser.facultyProfile.id === educator.id) ||
        (uName && eName && (uName === eName || slugify(uName) === slugify(eName)))
      );
    }
    return false;
  }, [currentUser, educator, isAdminUser]);
  const isFacultyUser = currentUser?.role === 'FACULTY';

  // Must be called before any early return — Rules of Hooks
  const hasSocialLinks = useMemo(() => {
    if (!educator?.socialLinks) return false;
    return Object.values(educator.socialLinks).some(
      (v) => typeof v === 'string' && v.trim().length > 0
    );
  }, [educator?.socialLinks]);

  const hasCampusContacts = Boolean(
    educator?.email || educator?.phone || educator?.officeHours || educator?.officeLocation
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!educator && (isApiLoading || isSingleLoading)) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#16247e] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!educator) {
    return (
      <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
        <Helmet>
          <title>Educator Not Found | Shree Nirakar Education Society</title>
        </Helmet>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 py-24">
          <GraduationCap size={48} className="text-stone-300 mx-auto" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Educator Profile Not Found
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md">
            The faculty profile you requested could not be located or may have been updated.
          </p>
          <Link
            to="/faculty"
            className="px-6 py-2.5 bg-[#0b132b] text-white rounded-xl text-xs font-serif font-bold hover:bg-[#16247e] transition-colors"
          >
            Return to Faculty Directory
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // hasSocialLinks and hasCampusContacts moved above early returns

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>{`${educator.name} | Faculty Credentials & Chronicle | Shree Nirakar Education Society`}</title>
        <meta
          name="description"
          content={`${educator.name}, ${educator.designation} in ${educator.department} at ${educator.institutionName}. ${educator.bio || ''}`}
        />
      </Helmet>

      <Navbar />

      {/* FULL WIDTH STRETCHED HERO BANNER */}
      <div data-profile-hero className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-20 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        <HeroWaves opacity={0.85} />

        <div className="w-full max-w-[1850px] mx-auto space-y-7 relative z-10">
          
          {/* Top Action Bar (Full Width Balanced) */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <Link
              to="/faculty"
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-serif font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Faculty Directory</span>
            </Link>

            <div className="flex items-center gap-2">
              {isAdminUser ? (
                <Link
                  to={`/faculty/edit/${educator?.id || slug}?role=admin`}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-serif font-bold bg-amber-400 hover:bg-amber-300 text-[#0b132b] px-3.5 py-1.5 rounded-xl transition-all shadow-md cursor-pointer hover:scale-102"
                  title="Edit this educator's full profile details on dedicated page"
                >
                  <Edit3 size={13} />
                  <span>Edit Profile</span>
                </Link>
              ) : canEditThisProfile ? (
                <Link
                  to={`/faculty/edit/${educator?.id || slug}`}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-serif font-bold bg-amber-400 hover:bg-amber-300 text-[#0b132b] px-3.5 py-1.5 rounded-xl transition-all shadow-md cursor-pointer hover:scale-102"
                  title="Edit your official educator dossier"
                >
                  <Edit3 size={13} />
                  <span>Edit Profile</span>
                </Link>
              ) : null}

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-xl border border-white/20 transition-colors cursor-pointer"
                title="Copy profile link"
              >
                {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
                <span>{copiedLink ? 'Link Copied' : 'Share Profile'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8 lg:gap-10">
            <div className="group relative mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-3xl border-4 border-amber-400/90 bg-stone-100 shadow-xl sm:mx-0 sm:h-44 sm:w-44 lg:h-48 lg:w-48">
              <img
                src={educator.photoUrl || getInitialsAvatar(educator.name)}
                alt={educator.name}
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-103"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getInitialsAvatar(educator.name);
                }}
              />
              {educator.isHead && (
                <div
                  className="absolute top-3 right-3 bg-amber-500 text-white p-1.5 rounded-xl shadow-md flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider px-2.5"
                  title="Head of Department / Academic Leadership"
                >
                  <Award size={13} />
                  <span>HOD</span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    educator.institutionCode === 'NIRAKAR_HS'
                      ? 'border-blue-400/40 bg-blue-500/20 text-blue-200'
                      : educator.institutionCode === 'ANGLE_HSS'
                      ? 'border-purple-400/40 bg-purple-500/20 text-purple-200'
                      : 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                  }`}
                >
                  {educator.institutionCode === 'NIRAKAR_HS'
                    ? 'Shri Nirakar Vidyalaya'
                    : educator.institutionCode === 'ANGLE_HSS'
                    ? 'S. S. Angle Higher Secondary School'
                    : 'Tudal High School'}
                </span>
                {educator.department && (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] text-stone-300">
                    {educator.department}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                  <h1 className="font-serif text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {educator.name}
                  </h1>
                </div>
                {educator.designation && (
                  <p className="text-base font-semibold text-amber-300 sm:text-lg">
                    {educator.designation}
                  </p>
                )}
                {educator.qualification && (
                  <p className="text-sm text-stone-300">
                    {educator.qualification}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 sm:justify-start">
                {educator.experience && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs text-amber-200">
                    <Clock size={13} className="text-amber-400" />
                    <span>{educator.experience} of teaching experience</span>
                  </div>
                )}
                {hasSocialLinks && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5">
                    <span className="hidden text-[10px] uppercase tracking-wider text-stone-300 sm:inline">Official links</span>
                    <SocialIconsBar links={educator.socialLinks} size="sm" theme="dark" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      {/* FULL WIDTH STRETCHED MAIN DOSSIER */}
      <main className="w-full flex-1 max-w-[1850px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-10 sm:py-14 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          
          {/* LEFT WING: Academic & Pedagogical Foundation */}
          <div className="space-y-6">
            
            {/* 1. Teaching Philosophy & Bio (ONLY SHOWN IF ENTERED BY FACULTY) */}
            {educator.bio && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-3.5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-800 tracking-wider">
                  <BookOpen size={16} />
                  <span>Teaching Devotion & Pedagogical Philosophy</span>
                </div>
                <p className="text-sm sm:text-base text-stone-700 font-sans leading-relaxed whitespace-pre-line">
                  {educator.bio}
                </p>
              </div>
            )}

            {/* 2. Academic Disciplines & Curriculum Coverage (ONLY SHOWN IF SUBJECTS EXIST) */}
            {educator.subjects && educator.subjects.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-800 tracking-wider">
                  <GraduationCap size={16} />
                  <span>Academic Disciplines & Curriculum Coverage</span>
                </div>
                <p className="text-xs text-stone-500 font-sans">
                  Curriculum streams, specialized laboratory mentoring, and foundation preparation overseen by this educator:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {educator.subjects.map((sub, i) => (
                    <span
                      key={i}
                      className="bg-amber-50 text-amber-950 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-serif font-semibold border border-amber-200/80 shadow-2xs"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Scholarly Publications & Research Papers (ONLY SHOWN IF PUBLICATIONS EXIST) */}
            {educator.publications && educator.publications.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-800 tracking-wider">
                  <FileText size={16} />
                  <span>Scholarly Publications, Papers & Research Citations</span>
                </div>
                <div className="space-y-2.5 pt-1">
                  {educator.publications.map((pub: string, idx: number) => (
                    <div
                      key={idx}
                      className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 flex items-start gap-3"
                    >
                      <CheckCircle2 size={16} className="text-amber-700 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-sans font-medium text-stone-800 leading-snug">
                        {pub}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Notable Milestones & State Commendations (ONLY SHOWN IF ACHIEVEMENTS EXIST) */}
            {educator.achievements && educator.achievements.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-900 tracking-wider">
                  <Award size={16} className="text-amber-600" />
                  <span>Notable Milestones, Commendations & State Honors</span>
                </div>
                <div className="space-y-2.5 pt-1">
                  {educator.achievements.map((ach: string, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-amber-200/60 flex items-start gap-3 shadow-2xs"
                    >
                      <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-sans font-medium text-stone-800 leading-snug">
                        {ach}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Educational Credentials Card (ONLY SHOWN IF QUALIFICATION ENTERED) */}
            {educator.qualification && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-stone-500 tracking-wider">
                  <Award size={15} />
                  <span>Verified Academic Credentials & Degrees</span>
                </div>
                <p className="text-sm font-mono font-bold text-stone-900">
                  {educator.qualification}
                </p>
                <p className="text-xs text-stone-500 font-sans leading-relaxed">
                  Credentials verified by the Directorate of Education, Government of Goa, and Shree Nirakar Education Society Academic Verification Board.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT WING: Campus Affiliation, Contacts & Parent Inquiry */}
          <div className="space-y-6">
            
            {/* Campus Affiliation & Consultation Hours (ONLY SHOWN IF DETAILS EXIST) */}
            {hasCampusContacts && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
                  <span>Campus Affiliation & Hours</span>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    Goa Board Affiliated
                  </span>
                </h3>

                <div className="space-y-3.5 text-xs font-sans">
                  {educator.institutionName && (
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">Institution Campus</div>
                        <span className="font-sans text-stone-800 font-semibold text-sm">
                          {educator.institutionName}
                        </span>
                        <p className="text-[11px] text-stone-500 mt-0.5">Canacona Taluka, South Goa, India - 403728</p>
                      </div>
                    </div>
                  )}

                  {/* ONLY SHOWN IF OFFICE LOCATION ENTERED */}
                  {educator.officeLocation && (
                    <div className="flex items-start gap-3">
                      <Building2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">Campus Office Location</div>
                        <span className="font-sans text-stone-800 font-medium">
                          {educator.officeLocation}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ONLY SHOWN IF OFFICE HOURS ENTERED */}
                  {educator.officeHours && (
                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">Consultation Hours</div>
                        <span className="font-sans text-stone-800 font-medium">
                          {educator.officeHours}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ONLY SHOWN IF EMAIL ENTERED */}
                  {educator.email && (
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">Official Email</div>
                        <a
                          href={`mailto:${educator.email}`}
                          className="font-mono text-stone-900 hover:text-amber-800 font-semibold truncate block transition-colors"
                        >
                          {educator.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* ONLY SHOWN IF PHONE ENTERED */}
                  {educator.phone && (
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">Campus Phone / Ext</div>
                        <a
                          href={`tel:${educator.phone}`}
                          className="font-mono text-stone-900 hover:text-amber-800 font-semibold transition-colors"
                        >
                          {educator.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Academic & Research Network Profiles Card (ONLY SHOWN IF SOCIAL LINKS EXIST) */}
            {hasSocialLinks && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Academic & Research Profiles
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    Verified Links
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-sans leading-relaxed">
                  Direct links to published research citations, curriculum repos, and official scholar profiles:
                </p>
                <div className="pt-1">
                  <SocialIconsBar links={educator.socialLinks} size="md" theme="brand" />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* FULL WIDTH Stretched Callout: Faculty Portal Self-Service */}
        <div className="w-full bg-[#0b132b] text-white rounded-3xl p-7 sm:p-10 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-md border border-white/15">
                Faculty Portal Self-Service
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Are you an educator at Shree Nirakar Education Society?
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-sans leading-relaxed">
                Log in to your authenticated Faculty Dashboard to update your verified credentials, research publications, consultation hours, and official links.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {canEditThisProfile ? (
                <Link
                  to="/faculty/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-[#0b132b] rounded-2xl text-xs sm:text-sm font-serif font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Edit3 size={15} />
                  <span>Open My Faculty Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/faculty/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-[#0b132b] rounded-2xl text-xs sm:text-sm font-serif font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Lock size={15} />
                    <span>Educator & Staff Login</span>
                  </Link>
                  <Link
                    to="/faculty/login"
                    className="inline-flex items-center gap-1.5 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-serif font-semibold border border-white/20 transition-all cursor-pointer"
                  >
                    <span>Staff Portal</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      {singleFaculty?.id && isFacultyUser && (
        <FacultyMessagesInbox
          key={`inbox-${currentUser?.id}`}
          facultyName={educator.name}
          floating
        />
      )}
      {singleFaculty?.id && !isAdminUser && !isFacultyUser && (
        <FacultyMessageWidget
          key={singleFaculty.id}
          facultyProfileId={singleFaculty.id}
          facultyName={educator.name}
        />
      )}

    </div>
  );
};
