import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { FACULTY_DATA, FacultyMember } from '../data/facultyData.js';
import { slugify } from '../utils/slugify.js';
import {
  Save,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Award,
  BookOpen,
  Mail,
  Phone,
  Clock,
  MapPin,
  Building2,
  Globe,
  ArrowLeft,
  User,
  AlertCircle,
  Upload,
  Camera,
  X,
  Plus,
  ShieldCheck,
  Check,
  Sparkles,
  Eye,
  Trash2,
  HelpCircle,
  Share2,
  Lock,
} from 'lucide-react';

export const FacultyEditPage: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const identifier = id || slug || '';
  const roleParam = searchParams.get('role');

  // Authenticated user
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('nirakar_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      return null;
    }
    return null;
  });

  const isAdminUser = useMemo(() => {
    if (roleParam === 'admin') return true;
    if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') return true;
    try {
      return localStorage.getItem('nirakar_admin_role') === 'ADMIN';
    } catch {
      return false;
    }
  }, [roleParam, currentUser]);

  // Loading & original faculty data resolution
  const [loading, setLoading] = useState(true);
  const [targetFaculty, setTargetFaculty] = useState<FacultyMember | null>(null);

  // Auth guard: redirect unauthenticated users and faculty editing others' profiles
  useEffect(() => {
    if (loading) return; // wait until faculty data has loaded
    // Admins always have full access — never redirect them (covers ?role=admin URL param too)
    if (isAdminUser) return;
    if (!currentUser) {
      navigate('/faculty/login?redirect=' + encodeURIComponent(window.location.pathname), { replace: true });
      return;
    }
    // Faculty users can only edit their own profile
    if (currentUser.role === 'FACULTY') {
      if (identifier) {
        const myId = currentUser.id || '';
        const myEmail = (currentUser.email || '').toLowerCase();
        const myUsername = (currentUser.username || '').toLowerCase();
        const normIdent = identifier.toLowerCase();
        const isOwn =
          normIdent === myId ||
          normIdent === myEmail ||
          normIdent === myUsername ||
          (targetFaculty && (
            String(targetFaculty.id) === myId ||
            (targetFaculty.email || '').toLowerCase() === myEmail
          ));
        if (!isOwn) {
          const ownId = currentUser?.facultyProfile?.id || currentUser.id;
          navigate(`/faculty/edit/${ownId}`, { replace: true });
          return;
        }
      }
    }
  }, [loading, currentUser, isAdminUser, identifier, targetFaculty, navigate]);

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('General Academics');
  const [institutionCode, setInstitutionCode] = useState<'NIRAKAR_HS' | 'TUDAL_HS' | 'ANGLE_HSS'>('ANGLE_HSS');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(10);
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [officeHours, setOfficeHours] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');
  const [isHead, setIsHead] = useState(false);

  // Lists
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState('');
  const [publications, setPublications] = useState<string[]>([]);
  const [newPublication, setNewPublication] = useState('');

  // Social
  const [linkedin, setLinkedin] = useState('');
  const [scholar, setScholar] = useState('');
  const [website, setWebsite] = useState('');

  // Save states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMetrics, setImageMetrics] = useState<{ original: string; converted: string; reduction: string } | null>(null);

  // Load faculty on mount or identifier change
  useEffect(() => {
    let isMounted = true;

    async function resolveEducator() {
      setLoading(true);

      // Check localStorage edit overrides first
      let localOverride: any = null;
      if (identifier) {
        try {
          const raw =
            localStorage.getItem(`nirakar_faculty_override_${identifier}`) ||
            localStorage.getItem(`nirakar_faculty_edit_${identifier}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            // Sanitize: If corrupted name matches designation or 'Headmaster & Academic Director', discard the corrupted name
            if (
              parsed &&
              parsed.name &&
              (parsed.name === parsed.designation ||
                parsed.name === 'Headmaster & Academic Director')
            ) {
              delete parsed.name;
            }
            localOverride = parsed;
          }
        } catch {}
      }

      // Check API
      let apiData: any = null;
      if (identifier) {
        try {
          const res = await fetch(`/api/v1/faculty/${identifier}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data) apiData = json.data;
          }
        } catch {}
      }

      // If no identifier provided, try /api/v1/faculty/me for logged-in faculty
      if (!identifier && currentUser) {
        try {
          const res = await fetch('/api/v1/faculty/me');
          if (res.ok) {
            const json = await res.json();
            if (json.data) apiData = json.data;
          }
        } catch {}
      }

      // Check seed data
      const normIdent = identifier.toLowerCase();
      const seedMatch =
        FACULTY_DATA.find((f) => {
          if (!identifier) return false;
          if (f.id.toLowerCase() === normIdent) return true;
          if (slugify(f.name) === normIdent) return true;
          const cleanName = f.name.replace(/^(Mr\.|Mrs\.|Dr\.|Prof\.|Shri|Smt\.)\s+/i, '');
          if (slugify(cleanName) === normIdent) return true;
          return f.name.toLowerCase().includes(normIdent);
        }) ||
        (currentUser
          ? FACULTY_DATA.find((f) =>
              f.name.toLowerCase().includes((currentUser.username || '').toLowerCase())
            )
          : null);

      if (!isMounted) return;

      // Merge data: apiData > localOverride > seedMatch > defaults
      const resolvedName =
        apiData?.name && apiData?.name !== apiData?.designation
          ? apiData.name
          : localOverride?.name && localOverride?.name !== localOverride?.designation
          ? localOverride.name
          : seedMatch?.name || currentUser?.username || 'Faculty Member';

      const resolved: FacultyMember = {
        id: apiData?.id || localOverride?.id || seedMatch?.id || identifier || 'custom-educator',
        name: resolvedName,
        designation: apiData?.designation || localOverride?.designation || seedMatch?.designation || 'Lecturer & Mentor',
        department: apiData?.department || localOverride?.department || seedMatch?.department || 'General Academics',
        institutionCode: apiData?.institutionCode || localOverride?.institutionCode || seedMatch?.institutionCode || 'ANGLE_HSS',
        institutionName:
          apiData?.institutionName ||
          localOverride?.institutionName ||
          seedMatch?.institutionName ||
          'S. S. Angle Higher Secondary School',
        qualification: apiData?.qualification || localOverride?.qualification || seedMatch?.qualification || 'Certified Educator',
        experience: apiData?.experience || localOverride?.experience || seedMatch?.experience || '10+ Years',
        experienceYears: apiData?.experienceYears || localOverride?.experienceYears || seedMatch?.experienceYears || 10,
        subjects: apiData?.subjects || localOverride?.subjects || seedMatch?.subjects || [],
        bio: apiData?.bio || localOverride?.bio || seedMatch?.bio || '',
        photoUrl: apiData?.photoUrl || localOverride?.photoUrl || seedMatch?.photoUrl || '',
        achievements: apiData?.achievements || localOverride?.achievements || seedMatch?.achievements || [],
        publications: apiData?.publications || localOverride?.publications || seedMatch?.publications || [],
        email: apiData?.email || localOverride?.email || seedMatch?.email || '',
        phone: apiData?.phone || localOverride?.phone || seedMatch?.phone || '',
        officeHours: apiData?.officeHours || localOverride?.officeHours || seedMatch?.officeHours || '',
        officeLocation: apiData?.officeLocation || localOverride?.officeLocation || seedMatch?.officeLocation || '',
        isHead: Boolean(apiData?.isHead ?? localOverride?.isHead ?? seedMatch?.isHead ?? false),
        socialLinks: apiData?.socialLinks || localOverride?.socialLinks || seedMatch?.socialLinks || {},
      };

      setTargetFaculty(resolved);

      // Populate form
      setName(resolved.name || '');
      // Resolve username: API data > publicContactToggles > currentUser
      const resolvedUsername =
        (apiData?.username) ||
        (apiData?.publicContactToggles as any)?.username ||
        (localOverride?.publicContactToggles as any)?.username ||
        (currentUser?.username) ||
        '';
      setUsername(resolvedUsername);
      setDesignation(resolved.designation || '');
      setDepartment(resolved.department || 'General Academics');
      setInstitutionCode(resolved.institutionCode || 'ANGLE_HSS');
      setQualification(resolved.qualification || '');
      setExperience(resolved.experience || '');
      setExperienceYears(resolved.experienceYears || 10);
      setBio(resolved.bio || '');
      setPhotoUrl(resolved.photoUrl || '');
      setEmail(resolved.email || '');
      setPhone(resolved.phone || '');
      setOfficeHours(resolved.officeHours || '');
      setOfficeLocation(resolved.officeLocation || '');
      setIsHead(Boolean(resolved.isHead));
      setSubjects(Array.isArray(resolved.subjects) ? [...resolved.subjects] : []);
      setAchievements(Array.isArray(resolved.achievements) ? [...resolved.achievements] : []);
      setPublications(Array.isArray(resolved.publications) ? [...resolved.publications] : []);
      setLinkedin(resolved.socialLinks?.linkedin || '');
      setScholar(resolved.socialLinks?.googleScholar || (resolved.socialLinks as any)?.scholar || '');
      setWebsite(resolved.socialLinks?.website || '');

      setLoading(false);
    }

    resolveEducator();

    return () => {
      isMounted = false;
    };
  }, [identifier, currentUser]);

  // Image Upload with Client WebP conversion
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const originalKb = (file.size / 1024).toFixed(1);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const MAX_DIM = 1200;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX_DIM) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          }
        } else {
          if (h > MAX_DIM) {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          const webpData = canvas.toDataURL('image/webp', 0.88);

          const base64Bytes = webpData.length - (webpData.indexOf(',') + 1);
          const convertedKb = ((base64Bytes * 3) / 4 / 1024).toFixed(1);
          const reduction = Math.max(0, Math.round((1 - parseFloat(convertedKb) / parseFloat(originalKb)) * 100));

          setImageMetrics({
            original: `${originalKb} KB`,
            converted: `${convertedKb} KB (WebP)`,
            reduction: `${reduction}%`,
          });

          // Try uploading to server
          try {
            const uploadRes = await fetch('/api/v1/faculty/upload-photo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageBase64: webpData }),
            });
            if (uploadRes.ok) {
              const resJson = await uploadRes.json();
              if (resJson.photoUrl) {
                setPhotoUrl(resJson.photoUrl);
              } else {
                setPhotoUrl(webpData);
              }
            } else {
              setPhotoUrl(webpData);
            }
          } catch {
            setPhotoUrl(webpData);
          }
        }
        setUploadingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Tag & List additions
  const handleAddSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubject.trim()) return;
    if (!subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
    }
    setNewSubject('');
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleAddAchievement = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAchievement.trim()) return;
    setAchievements([...achievements, newAchievement.trim()]);
    setNewAchievement('');
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleAddPublication = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPublication.trim()) return;
    setPublications([...publications, newPublication.trim()]);
    setNewPublication('');
  };

  const handleRemovePublication = (index: number) => {
    setPublications(publications.filter((_, i) => i !== index));
  };

  // Save changes handler
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setSaveError('Educator full name is required');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const facultyId = targetFaculty?.id || identifier || `fac-${Date.now()}`;

    const institutionName =
      institutionCode === 'NIRAKAR_HS'
        ? 'Shri Nirakar Vidyalaya'
        : institutionCode === 'TUDAL_HS'
        ? 'Tudal High School'
        : 'S. S. Angle Higher Secondary School';

    const publicContactToggles = {
      name,
      fullName: name,
      username: username.trim() || undefined,
      email,
      phone,
      showEmail,
      showPhone,
      officeHours,
      officeLocation,
      isHead,
      publications,
      socialLinks: {
        linkedin: linkedin.trim() || undefined,
        scholar: scholar.trim() || undefined,
        website: website.trim() || undefined,
      },
    };

    const updatedProfilePayload = {
      id: facultyId,
      facultyId,
      name,
      username: username.trim() || undefined,
      designation,
      department,
      institutionCode,
      institutionName,
      qualification,
      experience: experience || `${experienceYears} Years`,
      experienceYears: Number(experienceYears) || 10,
      bio,
      photoUrl,
      subjects,
      achievements,
      email,
      phone,
      officeHours,
      officeLocation,
      isHead,
      status: 'PUBLISHED',
      publicContactToggles,
    };

    // 1. Immediately save to localStorage for client-side persistence
    try {
      localStorage.setItem(`nirakar_faculty_override_${facultyId}`, JSON.stringify(updatedProfilePayload));
      localStorage.setItem(`nirakar_faculty_edit_${facultyId}`, JSON.stringify(updatedProfilePayload));
      if (identifier) {
        localStorage.setItem(`nirakar_faculty_override_${identifier}`, JSON.stringify(updatedProfilePayload));
      }
      // Also register into global override index
      const existingAll = JSON.parse(localStorage.getItem('nirakar_faculty_all_overrides') || '{}');
      existingAll[facultyId] = updatedProfilePayload;
      if (identifier) existingAll[identifier] = updatedProfilePayload;
      localStorage.setItem('nirakar_faculty_all_overrides', JSON.stringify(existingAll));
    } catch (err) {
      console.warn('localStorage save warning:', err);
    }

    // 2. Persist to API
    try {
      const res = await fetch('/api/v1/faculty/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfilePayload),
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.data?.id) {
          updatedProfilePayload.id = json.data.id;
          updatedProfilePayload.facultyId = json.data.id;
          try {
            localStorage.setItem(`nirakar_faculty_override_${json.data.id}`, JSON.stringify(updatedProfilePayload));
            const existingAll = JSON.parse(localStorage.getItem('nirakar_faculty_all_overrides') || '{}');
            existingAll[json.data.id] = updatedProfilePayload;
            localStorage.setItem('nirakar_faculty_all_overrides', JSON.stringify(existingAll));
          } catch {}
        }
      } else {
        const errorData = await res.json().catch(() => null);
        console.warn('Backend save response not 200, but client saved:', errorData);
      }
    } catch (apiErr) {
      console.warn('Backend sync failed, saved locally:', apiErr);
    }

    // Dispatch global faculty update event so all open pages refetch/update
    window.dispatchEvent(new Event('nirakar_faculty_updated'));

    setSaving(false);
    setSaveSuccess(true);
    setTargetFaculty(updatedProfilePayload as any);

    // Auto clear success indicator after 4s
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  // Keyboard shortcut Ctrl+S or Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveProfile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const liveProfileSlug = useMemo(() => {
    if (!targetFaculty) return identifier;
    return targetFaculty.id || slugify(name || targetFaculty.name);
  }, [targetFaculty, identifier, name]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-3 border-[#0b132b] border-t-transparent animate-spin" />
        <p className="font-serif text-sm text-[#0b132b] font-bold">Loading Educator Dossier...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F6F4EE] text-stone-900 font-sans flex flex-col selection:bg-amber-400 selection:text-[#0b132b]">
      <Helmet>
        <title>Edit Profile • {name || 'Faculty Member'} | Nirakar Education Society</title>
        <meta name="description" content="Dedicated educator profile editor and dossier publisher." />
      </Helmet>

      <Navbar />

      {/* FULL WIDTH STRETCHED HERO BANNER: Seamlessly tucked under Navbar golden curve with ZERO gap */}
      <div data-profile-hero className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-8 sm:pb-12 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="w-full space-y-5 relative z-10">
          {/* Top Breadcrumb & Actions Bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 text-xs">
            <Link
              to={liveProfileSlug ? `/faculty/${liveProfileSlug}${isAdminUser ? '?role=admin' : ''}` : '/faculty'}
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-serif font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Faculty Profile</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to={`/faculty/${liveProfileSlug}${isAdminUser ? '?role=admin' : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-stone-300 hover:text-white px-3.5 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 transition-colors"
                title="Preview public profile on school directory"
              >
                <Eye size={13} />
                <span>Preview Public Page</span>
                <ExternalLink size={11} className="opacity-70" />
              </Link>

              <button
                type="button"
                onClick={() => handleSaveProfile()}
                disabled={saving}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-serif font-bold transition-all shadow-md cursor-pointer disabled:cursor-wait ${
                  saveSuccess
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-amber-400 hover:bg-amber-300 text-[#0b132b] shadow-amber-400/20 hover:scale-102'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0b132b] border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check size={14} className="stroke-[3]" />
                    <span>Published & Live!</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save & Publish</span>
                    <span className="hidden md:inline text-[10px] opacity-70 font-mono font-normal">(Ctrl+S)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hero Banner Title & Role Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 border-t border-white/10">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-4xl font-black tracking-tight text-white">
                  {name || 'Edit Educator Profile'}
                </h1>
                {isAdminUser ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <ShieldCheck size={12} />
                    <span>Admin Mode • Full Privileges</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <User size={12} />
                    <span>Faculty Dossier • Verified Editor</span>
                  </span>
                )}
              </div>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
                Full-scale educator profile management. Update designations, qualifications, teaching philosophy, public office hours, and curriculum tags across all society institutions.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-amber-300 font-mono text-xs font-bold">
                {institutionCode === 'NIRAKAR_HS'
                  ? 'Shri Nirakar Vidyalaya'
                  : institutionCode === 'TUDAL_HS'
                  ? 'Tudal High School'
                  : 'S. S. Angle HSS'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Curve finishing the hero banner with smooth organic transition */}
      <SectionEdge variant="scoop" color="#F6F4EE" bgColor="#0b132b" height={36} withGoldLine />

      {/* SUCCESS BANNER NOTIFICATION */}
      {saveSuccess && (
        <div className="w-full bg-emerald-600 text-white px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-3 shadow-md flex items-center justify-between transition-all animate-fadeIn">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <CheckCircle2 size={18} />
              <span>Changes have been successfully saved to the official database and are immediately live!</span>
            </div>
            <Link
              to={`/faculty/${liveProfileSlug}${isAdminUser ? '?role=admin' : ''}`}
              className="text-xs sm:text-sm font-bold underline hover:no-underline ml-4 shrink-0"
            >
              View Updated Profile →
            </Link>
          </div>
        </div>
      )}

      {/* ERROR BANNER */}
      {saveError && (
        <div className="w-full bg-rose-600 text-white px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-3 shadow-md">
          <div className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{saveError}</span>
            </div>
            <button type="button" onClick={() => setSaveError('')} className="p-1 hover:bg-rose-700 rounded cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FULL WIDTH STRETCHED MAIN WORKSPACE */}
      <main className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12">
        <form onSubmit={handleSaveProfile} className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* ==================== LEFT COLUMN: PREVIEW & STICKY CONTROLS (col-span-12 lg:col-span-4 xl:col-span-3) ==================== */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            
            {/* Live Card Preview Box */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5 sticky top-24">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                  Dossier Preview
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-stone-100 text-stone-600">
                  {institutionCode}
                </span>
              </div>

              {/* Photo & Quick Info */}
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-stone-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0b132b] to-[#16247e] text-amber-400 font-serif font-bold text-2xl flex items-center justify-center shadow-sm">
                      {name ? name.charAt(0).toUpperCase() : 'F'}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-medium"
                    title="Change Profile Photo"
                  >
                    <Camera size={16} />
                    <span>Upload</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-serif font-bold text-base text-[#0b132b] leading-tight truncate">
                    {name || 'Educator Name'}
                  </h3>
                  <p className="text-xs text-amber-700 font-medium truncate">
                    {designation || 'Academic Designation'}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    {department}
                  </p>
                </div>
              </div>

              {/* Upload image button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-stone-300 hover:border-[#0b132b] bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Upload size={14} />
                  <span>{uploadingImage ? 'Processing WebP...' : 'Change Headshot Photo'}</span>
                </button>
                {imageMetrics && (
                  <p className="text-[10px] text-emerald-600 font-mono mt-1 text-center">
                    Converted: {imageMetrics.original} → {imageMetrics.converted} ({imageMetrics.reduction} smaller)
                  </p>
                )}
              </div>

              <hr className="border-stone-100" />

              {/* Quick Section Nav Jump */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold block mb-2">
                  Dossier Sections
                </span>
                <nav className="flex flex-col space-y-1 text-xs">
                  <a
                    href="#section-identity"
                    className="flex items-center justify-between p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <User size={14} className="text-amber-600" />
                      <span>1. Core Identity & Campus</span>
                    </span>
                    <Check size={12} className={name ? 'text-emerald-500' : 'text-stone-300'} />
                  </a>

                  <a
                    href="#section-contact"
                    className="flex items-center justify-between p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <Mail size={14} className="text-amber-600" />
                      <span>2. Contact & Office Logistics</span>
                    </span>
                    <Check size={12} className={email ? 'text-emerald-500' : 'text-stone-300'} />
                  </a>

                  <a
                    href="#section-academic"
                    className="flex items-center justify-between p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap size={14} className="text-amber-600" />
                      <span>3. Qualifications & Pedigree</span>
                    </span>
                    <Check size={12} className={qualification ? 'text-emerald-500' : 'text-stone-300'} />
                  </a>

                  <a
                    href="#section-bio"
                    className="flex items-center justify-between p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen size={14} className="text-amber-600" />
                      <span>4. Teaching Philosophy & Bio</span>
                    </span>
                    <Check size={12} className={bio ? 'text-emerald-500' : 'text-stone-300'} />
                  </a>

                  <a
                    href="#section-subjects"
                    className="flex items-center justify-between p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <Award size={14} className="text-amber-600" />
                      <span>5. Subjects & Mentorship</span>
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">{subjects.length} items</span>
                  </a>

                  <a
                    href="#section-achievements"
                    className="flex items-center justify-between p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-600" />
                      <span>6. Honours & Publications</span>
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">{achievements.length} items</span>
                  </a>
                </nav>
              </div>

              {/* Bottom Quick Save Card Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-[#0b132b] hover:bg-[#16247e] text-white text-xs font-serif font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN: FULL WIDTH EXPANSIVE EDIT FORMS (col-span-12 lg:col-span-8 xl:col-span-9) ==================== */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            
            {/* SECTION 1: CORE IDENTITY & CAMPUS */}
            <div id="section-identity" className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <span className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
                  Section 01
                </span>
                <h2 className="text-xl font-serif font-bold text-[#0b132b]">
                  Core Academic Identity & Affiliation
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Official name, role, school campus, and department affiliation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Full Name */}
                <div className="sm:col-span-2 xl:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Full Name & Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Shekhar Naik"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] focus:ring-1 focus:ring-[#0b132b] outline-none text-sm font-medium transition-all"
                  />
                  <p className="text-[11px] text-stone-400 mt-1 font-mono">
                    Shown prominently on official transcripts, directory index, and hero banners.
                  </p>
                </div>

                {/* Staff Portal Username */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Portal Username / Handle
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                    placeholder="e.g. urvee.phaldessai"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] focus:ring-1 focus:ring-[#0b132b] outline-none text-sm font-mono transition-all"
                  />
                  <p className="text-[11px] text-stone-400 mt-1 font-mono">
                    Used for staff portal login and profile URL. Only lowercase letters, digits, dots, hyphens.
                  </p>
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Designation / Academic Role <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Head of Science / Senior Lecturer"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] focus:ring-1 focus:ring-[#0b132b] outline-none text-sm transition-all"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Academic Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] focus:ring-1 focus:ring-[#0b132b] outline-none text-sm bg-white cursor-pointer transition-all"
                  >
                    <option value="Science & Laboratories">Science & Laboratories</option>
                    <option value="Mathematics & Computer Science">Mathematics & Computer Science</option>
                    <option value="Languages & Literature">Languages & Literature</option>
                    <option value="Commerce & Economics">Commerce & Economics</option>
                    <option value="Social Sciences & Humanities">Social Sciences & Humanities</option>
                    <option value="Vocational Studies & Ecology">Vocational Studies & Ecology</option>
                    <option value="Athletics & Physical Education">Athletics & Physical Education</option>
                    <option value="Administration & Governance">Administration & Governance</option>
                    <option value="General Academics">General Academics</option>
                  </select>
                </div>

                {/* School Campus */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Campus / Institution <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={institutionCode}
                    onChange={(e) => setInstitutionCode(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] focus:ring-1 focus:ring-[#0b132b] outline-none text-sm bg-white cursor-pointer transition-all"
                  >
                    <option value="ANGLE_HSS">S. S. Angle Higher Secondary School</option>
                    <option value="NIRAKAR_HS">Shri Nirakar Vidyalaya</option>
                    <option value="TUDAL_HS">Tudal High School</option>
                  </select>
                </div>

                {/* Department Head Checkbox */}
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isHead"
                    checked={isHead}
                    onChange={(e) => setIsHead(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0b132b] focus:ring-[#0b132b] border-stone-300 cursor-pointer"
                  />
                  <label htmlFor="isHead" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Head of Department (HOD) / Senior Mentor
                  </label>
                </div>

                {/* Photo URL manual field */}
                <div className="sm:col-span-2 xl:col-span-3">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Profile Photo URL or Avatar Path
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="/images/faculty/shekhar-naik.webp or https://..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] focus:ring-1 focus:ring-[#0b132b] outline-none text-sm font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                    >
                      Browse...
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: CONTACT & OFFICE LOGISTICS */}
            <div id="section-contact" className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <span className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
                  Section 02
                </span>
                <h2 className="text-xl font-serif font-bold text-[#0b132b]">
                  Contact Information & Office Hours
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Official channels for parents, students, and administration to reach this educator.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
                {/* Official Email */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-700">Official Email</label>
                    <label className="flex items-center gap-1.5 text-[11px] text-stone-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showEmail}
                        onChange={(e) => setShowEmail(e.target.checked)}
                        className="rounded text-[#0b132b] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Public on directory</span>
                    </label>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="educator@nirakar.org"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-sm transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-700">Contact Number</label>
                    <label className="flex items-center gap-1.5 text-[11px] text-stone-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPhone}
                        onChange={(e) => setShowPhone(e.target.checked)}
                        className="rounded text-[#0b132b] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>Public on directory</span>
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98220 XXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-sm transition-all"
                  />
                </div>

                {/* Office Location */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Campus Office / Room No.
                  </label>
                  <input
                    type="text"
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    placeholder="e.g. Science Block, Room 102"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-sm transition-all"
                  />
                </div>

                {/* Office Hours */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Counseling / Office Consultation Hours
                  </label>
                  <input
                    type="text"
                    value={officeHours}
                    onChange={(e) => setOfficeHours(e.target.value)}
                    placeholder="e.g. Mon–Fri, 10:30 AM – 1:00 PM"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: QUALIFICATIONS & PEDIGREE */}
            <div id="section-academic" className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <span className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
                  Section 03
                </span>
                <h2 className="text-xl font-serif font-bold text-[#0b132b]">
                  Academic Qualifications & Pedigree
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Degrees, certifications, and teaching tenure.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Qualifications */}
                <div className="sm:col-span-2 xl:col-span-3">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Degrees & Certifications <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. M.Sc. Physics (Goa University), B.Ed., SET Qualified"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-sm transition-all"
                  />
                </div>

                {/* Experience text */}
                <div className="sm:col-span-1 xl:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Experience Statement
                  </label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 14+ Years in Senior Secondary Education"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-sm transition-all"
                  />
                </div>

                {/* Experience Years */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Years of Experience (Numeric)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: BIOGRAPHY & PHILOSOPHY */}
            <div id="section-bio" className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <span className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
                  Section 04
                </span>
                <h2 className="text-xl font-serif font-bold text-[#0b132b]">
                  Educator Biography & Teaching Philosophy
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Narrative overview of academic passions, pedagogical methodology, and student mentorship.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Professional Biography
                </label>
                <textarea
                  rows={6}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your academic background, pedagogical approach, and mentoring philosophy at Nirakar Education Society..."
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 focus:border-[#0b132b] outline-none text-sm leading-relaxed transition-all resize-y"
                />
                <div className="flex justify-between items-center text-[11px] text-stone-400 mt-1 font-mono">
                  <span>Formatted cleanly on public dossier page.</span>
                  <span>{bio.length} characters</span>
                </div>
              </div>
            </div>

            {/* SECTION 5: SUBJECTS & MENTORSHIP */}
            <div id="section-subjects" className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <span className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
                  Section 05
                </span>
                <h2 className="text-xl font-serif font-bold text-[#0b132b]">
                  Curriculum Subjects & Mentorship Focus
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Academic subjects taught and student club initiatives.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                    placeholder="e.g. Higher Secondary Physics, Applied Mechanics, Astronomy Club..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubject()}
                    className="px-5 py-2.5 rounded-xl bg-[#0b132b] hover:bg-[#16247e] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus size={14} />
                    <span>Add Subject</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {subjects.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No subjects added yet. Add one above.</p>
                  ) : (
                    subjects.map((sub, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(idx)}
                          className="hover:text-rose-600 cursor-pointer p-0.5 rounded"
                          title="Remove"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 6: ACHIEVEMENTS & PUBLICATIONS */}
            <div id="section-achievements" className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <span className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
                  Section 06
                </span>
                <h2 className="text-xl font-serif font-bold text-[#0b132b]">
                  Honours, Recognitions & Academic Publications
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Awards received, conference papers, curriculum contributions, and research.
                </p>
              </div>

              {/* Achievements list */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-700">
                  Awards & Institutional Honours
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
                    placeholder="e.g. State Best Teacher Award 2023, 100% Board Pass Rate Recognition..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAchievement()}
                    className="px-5 py-2.5 rounded-xl bg-[#0b132b] hover:bg-[#16247e] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {achievements.map((ach, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <Award size={15} className="text-amber-600 shrink-0" />
                        <span>{ach}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(idx)}
                        className="text-stone-400 hover:text-rose-600 cursor-pointer p-1"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* Publications list */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-700">
                  Scholarly Publications & Pedagogical Papers
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPublication}
                    onChange={(e) => setNewPublication(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPublication())}
                    placeholder="e.g. 'Innovative Pedagogy in High School STEM' (Goa Board Educational Journal 2022)..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPublication()}
                    className="px-5 py-2.5 rounded-xl bg-[#0b132b] hover:bg-[#16247e] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {publications.map((pub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen size={15} className="text-blue-600 shrink-0" />
                        <span>{pub}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePublication(idx)}
                        className="text-stone-400 hover:text-rose-600 cursor-pointer p-1"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 7: ONLINE & SCHOLARLY LINKS */}
            <div id="section-social" className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <span className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-widest block">
                  Section 07
                </span>
                <h2 className="text-xl font-serif font-bold text-[#0b132b]">
                  Scholarly Profiles & Professional Links
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Optional external profiles for academic citations, LinkedIn, and portfolios.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Google Scholar Profile
                  </label>
                  <input
                    type="url"
                    value={scholar}
                    onChange={(e) => setScholar(e.target.value)}
                    placeholder="https://scholar.google.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Personal / Academic Website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://myportfolio.edu"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#0b132b] outline-none text-xs transition-all"
                  />
                </div>
              </div>
            </div>

            {/* BIG PROMINENT SUBMIT / PUBLISH BAR */}
            <div className="bg-[#0b132b] text-white rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-white/10">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-serif font-bold text-lg text-white">
                  Ready to Publish Updated Profile?
                </h3>
                <p className="text-xs text-stone-400">
                  All changes will be updated live across the society directory, school faculty index, and search filters.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to={`/faculty/${liveProfileSlug}${isAdminUser ? '?role=admin' : ''}`}
                  className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-semibold transition-colors"
                >
                  Cancel & Return
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full sm:w-auto px-8 py-2.5 rounded-xl text-xs font-serif font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    saveSuccess
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-[#0b132b] hover:scale-102'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#0b132b] border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check size={14} className="stroke-[3]" />
                      <span>Published!</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Publish Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};
