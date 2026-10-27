import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { notifyAuthChanged } from '../hooks/useCurrentAuthUser.js';
import { FacultyMessagesInbox } from '../components/FacultyMessagesInbox.js';
import { slugify } from '../utils/slugify.js';
import { getInitialsAvatar } from '../utils/avatarUtils.js';
import { FACULTY_DATA, FacultyMember } from '../data/facultyData.js';
import { CustomSelect } from '../components/CustomSelect.js';
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
  Share2,
  Sparkles,
  ArrowLeft,
  User,
  Eye,
  AlertCircle,
  Upload,
  Camera,
  Image as ImageIcon,
  Lock,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export const FacultyDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('nirakar_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      return null;
    }
    return null;
  });

  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
  const isFaculty = currentUser?.role === 'FACULTY' || isAdmin;

  // Real educator profile to edit
  const [profile, setProfile] = useState<FacultyMember>(() => {
    if (currentUser) {
      // Find matching profile from comprehensive seed or saved data
      const matched = FACULTY_DATA.find(
        (f) =>
          f.name.toLowerCase().includes(currentUser.username.toLowerCase()) ||
          currentUser.username.toLowerCase().includes(f.name.toLowerCase()) ||
          f.id === currentUser.facultyProfile?.id
      );
      if (matched) return matched;
      return {
        id: currentUser.id || 'current-staff',
        name: currentUser.username || 'Faculty Member',
        designation: currentUser.facultyProfile?.designation || 'Lecturer & Mentor',
        department: currentUser.facultyProfile?.department || 'General Academics',
        institutionCode: (currentUser.facultyProfile?.institutionCode as any) || 'ANGLE_HSS',
        institutionName: 'S. S. Angle Higher Secondary School',
        qualification: 'Certified Educator',
        experience: '10+ Years',
        experienceYears: 10,
        subjects: [],
        bio: '',
        photoUrl: '',
        achievements: [],
        publications: [],
        email: currentUser.email || '',
        phone: '',
        officeHours: '',
        officeLocation: '',
        socialLinks: {},
      };
    }
    return FACULTY_DATA[0];
  });

  const [subjectsInput, setSubjectsInput] = useState(
    Array.isArray(profile.subjects) ? profile.subjects.join(', ') : ''
  );
  const [achievementsInput, setAchievementsInput] = useState(
    Array.isArray(profile.achievements) ? profile.achievements.join('\n') : ''
  );
  const [publicationsInput, setPublicationsInput] = useState(
    Array.isArray(profile.publications) ? profile.publications.join('\n') : ''
  );

  // Image upload & WebP conversion metrics
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMetrics, setImageMetrics] = useState<{ originalSize: string; convertedSize: string; reduction: string } | null>(null);
  const [uploadError, setUploadError] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Fetch real faculty data from backend /api/v1/faculty/me on mount if authenticated
  useEffect(() => {
    async function loadRealProfile() {
      try {
        const res = await fetch('/api/v1/faculty/me');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const d = json.data;
            const toggles = d.publicContactToggles || {};
            const loaded: FacultyMember = {
              id: d.id,
              name: d.user?.username || profile.name,
              designation: d.designation || profile.designation,
              department: d.department || profile.department,
              institutionCode: d.institutionCode || profile.institutionCode,
              institutionName:
                d.institutionCode === 'NIRAKAR_HS'
                  ? 'Shri Nirakar Vidyalaya'
                  : d.institutionCode === 'TUDAL_HS'
                  ? 'Tudal High School'
                  : 'S. S. Angle Higher Secondary School',
              qualification: d.qualification || profile.qualification,
              experience: d.experience || profile.experience,
              experienceYears: parseInt(d.experience) || 10,
              subjects: Array.isArray(d.subjects) ? d.subjects : [],
              bio: d.bio || '',
              photoUrl: d.photoUrl || profile.photoUrl,
              achievements: Array.isArray(d.achievements) ? d.achievements : [],
              publications: Array.isArray(toggles.publications) ? toggles.publications : [],
              email: toggles.email || d.user?.email || profile.email,
              phone: toggles.phone || profile.phone,
              officeHours: toggles.officeHours || '',
              officeLocation: toggles.officeLocation || '',
              isHead: Boolean(toggles.isHead),
              socialLinks: toggles.socialLinks || {},
            };
            setProfile(loaded);
            setSubjectsInput((loaded.subjects || []).join(', '));
            setAchievementsInput((loaded.achievements || []).join('\n'));
            setPublicationsInput((loaded.publications || []).join('\n'));
          }
        }
      } catch {
        // Fallback to loaded state
      }
    }
    if (currentUser) {
      loadRealProfile();
    }
  }, [currentUser]);

  // Client-side image upload & conversion to WebP
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError('');
    setImageMetrics(null);

    const originalKb = (file.size / 1024).toFixed(1);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        try {
          // Max dimension for retina faculty headshots
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not initialize canvas context');

          // High quality smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP with 0.86 quality (super crisp and lightweight)
          const webpDataUrl = canvas.toDataURL('image/webp', 0.86);

          // Calculate approximate byte size of base64
          const base64Length = webpDataUrl.length - (webpDataUrl.indexOf(',') + 1);
          const convertedKb = ((base64Length * 3) / 4 / 1024).toFixed(1);
          const reduction = Math.max(0, Math.round((1 - parseFloat(convertedKb) / parseFloat(originalKb)) * 100));

          setImageMetrics({
            originalSize: `${originalKb} KB (${file.type.split('/')[1]?.toUpperCase() || 'RAW'})`,
            convertedSize: `${convertedKb} KB (WebP)`,
            reduction: `${reduction}%`,
          });

          // Upload converted WebP to backend
          const uploadRes = await fetch('/api/v1/faculty/upload-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: webpDataUrl }),
          });

          if (uploadRes.ok) {
            const json = await uploadRes.json();
            if (json.photoUrl) {
              setProfile((prev) => ({ ...prev, photoUrl: json.photoUrl }));
            } else {
              setProfile((prev) => ({ ...prev, photoUrl: webpDataUrl }));
            }
          } else {
            // Fallback to WebP data URL
            setProfile((prev) => ({ ...prev, photoUrl: webpDataUrl }));
          }

          URL.revokeObjectURL(objectUrl);
        } catch (err: any) {
          setUploadError(err.message || 'Image conversion failed.');
        } finally {
          setUploadingImage(false);
        }
      };

      img.onerror = () => {
        setUploadError('Failed to decode image. Please ensure the file is a valid JPG, PNG, or WebP photo.');
        setUploadingImage(false);
      };

      img.src = objectUrl;
    } catch (err: any) {
      setUploadError(err.message || 'Could not process photo file.');
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error('Could not sign out. Please try again.');
      localStorage.removeItem('nirakar_auth_user');
      setCurrentUser(null);
      notifyAuthChanged();
      navigate('/faculty/login');
    } catch (err: any) {
      setSaveError(err.message || 'Could not sign out. Please try again.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    const parsedSubjects = subjectsInput
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const parsedAchievements = achievementsInput
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const parsedPublications = publicationsInput
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const updatedProfile: FacultyMember = {
      ...profile,
      subjects: parsedSubjects,
      achievements: parsedAchievements,
      publications: parsedPublications,
      institutionName:
        profile.institutionCode === 'NIRAKAR_HS'
          ? 'Shri Nirakar Vidyalaya'
          : profile.institutionCode === 'TUDAL_HS'
          ? 'Tudal High School'
          : 'S. S. Angle Higher Secondary School',
    };

    try {
      // 1. Dispatch to backend API /api/v1/faculty/save
      const payload = {
        userId: currentUser?.id,
        name: updatedProfile.name,
        institutionCode: updatedProfile.institutionCode,
        designation: updatedProfile.designation,
        department: updatedProfile.department,
        subjects: updatedProfile.subjects,
        qualification: updatedProfile.qualification,
        experience: updatedProfile.experience,
        bio: updatedProfile.bio || null,
        achievements: updatedProfile.achievements,
        photoUrl: updatedProfile.photoUrl || null,
        publicContactToggles: {
          name: updatedProfile.name,
          fullName: updatedProfile.name,
          showEmail: Boolean(updatedProfile.email),
          showPhone: Boolean(updatedProfile.phone),
          email: updatedProfile.email || null,
          phone: updatedProfile.phone || null,
          officeHours: updatedProfile.officeHours || null,
          officeLocation: updatedProfile.officeLocation || null,
          publications: updatedProfile.publications || [],
          socialLinks: updatedProfile.socialLinks || {},
          isHead: Boolean(updatedProfile.isHead),
        },
        status: 'PUBLISHED',
      };

      const res = await fetch('/api/v1/faculty/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // 2. Also persist locally for real-time live preview
      localStorage.setItem('nirakar_faculty_custom', JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event('nirakar_faculty_updated'));

      setProfile(updatedProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const previewSlug = slugify(profile.name || 'faculty');

  // ACCESS DENIED GATE: If user is not logged in as a faculty member or administrator
  if (!isFaculty) {
    return (
      <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
        <Helmet>
          <title>Access Restricted | Faculty Management Portal</title>
        </Helmet>
        <Navbar />

        <main className="flex-1 max-w-xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-sm">
            <Lock size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-stone-900">
              Educator Authentication Required
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
              Faculty profiles and credentials are authenticated institutional assets. Only verified educators and authorized administrators can edit their published dossiers.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/faculty/login"
              className="px-6 py-2.5 bg-[#0b132b] hover:bg-[#16247e] text-white rounded-xl text-xs font-serif font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Log In as Educator
            </Link>
            <Link
              to="/faculty"
              className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-serif font-semibold transition-all border border-stone-200 cursor-pointer"
            >
              Return to Directory
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>{`Faculty Dossier Management | ${profile.name} | Shri Nirakar Education Society`}</title>
        <meta name="description" content="Manage your official academic profile, research citations, and office hours." />
      </Helmet>

      <Navbar />

      {/* FULL WIDTH STRETCHED HERO BANNER */}
      <div data-profile-hero className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        <HeroWaves opacity={0.85} />

        <div className="w-full max-w-[1850px] mx-auto space-y-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/faculty"
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-serif font-bold text-xs transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Faculty Directory</span>
            </Link>

            <div className="flex items-center gap-3">
              {currentUser?.role === 'FACULTY' && (
                <FacultyMessagesInbox facultyName={profile.name} floating />
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-serif font-bold transition-all shadow-sm cursor-pointer"
                >
                  <ShieldCheck size={14} />
                  <span>Admin Governance Console</span>
                </Link>
              )}

              <Link
                to={`/faculty/${previewSlug}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#0b132b] rounded-xl text-xs font-serif font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Eye size={14} />
                <span>View My Published Profile</span>
                <ExternalLink size={12} />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-mono font-semibold border border-white/20 transition-all cursor-pointer"
                title="Sign out of Faculty Portal"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 font-mono text-[11px] font-bold">
              <ShieldCheck size={12} />
              <span>Authenticated Educator Dossier: {currentUser?.username || profile.name}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Manage Your Academic Dossier
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl font-sans leading-relaxed">
              Maintain your verified credentials, syllabus specializations, research citations, and consultation hours.
              <span className="text-amber-300 font-semibold ml-1">
                Any section or optional field you leave empty will be omitted from your public page!
              </span>
            </p>
          </div>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      {/* FULL WIDTH STRETCHED DASHBOARD BODY */}
      <main className="w-full flex-1 max-w-[1850px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 space-y-8">
        
        {/* Save notifications */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-sans flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>
                <strong>Profile Successfully Published!</strong> Your dossier changes have been verified and applied to your public profile page.
              </span>
            </div>
            <Link
              to={`/faculty/${previewSlug}`}
              className="underline font-serif font-bold text-emerald-800 hover:text-emerald-950 shrink-0"
            >
              View Profile &rarr;
            </Link>
          </div>
        )}

        {saveError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-sans flex items-center gap-2.5">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* THE PRODUCTION FORM */}
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* SECTION 1: Portrait Photo Upload & Real-Time WebP Conversion */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-800 tracking-wider">
                <Camera size={16} />
                <span>Section 1: Official Educator Portrait (Direct Phone/PC Upload)</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Upload your portrait photo directly from your device. Supported formats: JPG, JPEG, PNG, AVIF, WebP.
                Uploaded images are automatically optimized and converted to WebP format for fast, light loading.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Photo Preview Frame */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-stone-100 border-4 border-amber-400/90 shadow-lg shrink-0 group">
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getInitialsAvatar(profile.name || 'Faculty');
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                    <User size={48} />
                    <span className="text-[11px] font-mono mt-1">No Photo</span>
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-mono">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
                    <span>Converting to WebP...</span>
                  </div>
                )}
              </div>

              {/* Upload Controls & Format Details */}
              <div className="space-y-4 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0b132b] hover:bg-[#16247e] text-white rounded-xl text-xs font-serif font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Upload size={14} />
                    <span>Upload Photo from Phone / PC</span>
                  </button>

                  {profile.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, photoUrl: '' })}
                      className="text-xs font-mono text-stone-500 hover:text-rose-600 transition-colors"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Upload Format Badge & WebP Metrics */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs font-sans">
                  <div className="flex items-center gap-2 text-stone-700 font-semibold">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>Automatic WebP Format Conversion & Low-MB Compression</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    Any uploaded JPG, JPEG, or PNG is converted into a retina-optimized WebP photo directly on your browser before saving. This keeps download size small (~50–150 KB) without cutting off hair or cropping your portrait.
                  </p>

                  {imageMetrics && (
                    <div className="mt-2 pt-2 border-t border-stone-200/60 flex flex-wrap items-center gap-3 text-[11px] font-mono text-emerald-800">
                      <span>Original: <strong>{imageMetrics.originalSize}</strong></span>
                      <span>&rarr;</span>
                      <span>Optimized: <strong>{imageMetrics.convertedSize}</strong></span>
                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold">
                        {imageMetrics.reduction} Reduced
                      </span>
                    </div>
                  )}

                  {uploadError && (
                    <p className="text-rose-600 text-[11px] font-mono">{uploadError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Academic Identity & Institutional Post */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-800 tracking-wider">
                <GraduationCap size={16} />
                <span>Section 2: Academic Identity & Institutional Affiliation</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Your name, official designation, department, and campus institution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Full Name with Honorific *
                </label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Mr. Rajesh Phaldessai"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Designation / Role *
                </label>
                <input
                  type="text"
                  required
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                  placeholder="e.g. Principal & Senior Lecturer"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  placeholder="e.g. Administration & Chemistry"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Institution Affiliation *
                </label>
                <CustomSelect
                  value={profile.institutionCode}
                  onChange={(val) =>
                    setProfile({
                      ...profile,
                      institutionCode: val as any,
                      institutionName:
                        val === 'NIRAKAR_HS'
                          ? 'Shri Nirakar Vidyalaya'
                          : val === 'TUDAL_HS'
                          ? 'Tudal High School'
                          : 'S. S. Angle Higher Secondary School',
                    })
                  }
                  options={[
                    { value: 'ANGLE_HSS', label: 'S. S. Angle Higher Secondary School' },
                    { value: 'NIRAKAR_HS', label: 'Shri Nirakar Vidyalaya' },
                    { value: 'TUDAL_HS', label: 'Tudal High School' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Academic Degrees & Qualifications *
                </label>
                <input
                  type="text"
                  required
                  value={profile.qualification}
                  onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                  placeholder="e.g. M.Sc. (Organic Chemistry), M.Phil., B.Ed."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Teaching Devotion & Experience *
                </label>
                <input
                  type="text"
                  required
                  value={profile.experience}
                  onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  placeholder="e.g. 22 Years"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 md:col-span-3">
                <input
                  type="checkbox"
                  id="isHeadCheck"
                  checked={Boolean(profile.isHead)}
                  onChange={(e) => setProfile({ ...profile, isHead: e.target.checked })}
                  className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="isHeadCheck" className="text-xs font-mono font-bold text-stone-800 cursor-pointer">
                  Designate as Head of Department (HOD) / Academic Leadership
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 3: Teaching Philosophy, Curriculum & Publications */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-800 tracking-wider">
                <BookOpen size={16} />
                <span>Section 3: Teaching Philosophy, Subjects & Publications</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Any section you leave empty here will not be shown on your profile.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Teaching Philosophy & Bio (Optional)
                </label>
                <textarea
                  rows={4}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Describe your pedagogical mission, classroom philosophy, and dedication to student mentorship..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
                <span className="text-[11px] text-stone-400 font-sans">
                  Leave completely blank to omit the bio block from your profile.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Curriculum Subjects Mentored (Comma-separated)
                </label>
                <input
                  type="text"
                  value={subjectsInput}
                  onChange={(e) => setSubjectsInput(e.target.value)}
                  placeholder="e.g. Organic Chemistry, Physical Chemistry, NEET & JEE Foundation, Analytical Labs"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
                <span className="text-[11px] text-stone-400 font-sans">
                  Leave empty to omit the curriculum subjects block.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Notable Milestones, Commendations & Awards (One per line)
                </label>
                <textarea
                  rows={3}
                  value={achievementsInput}
                  onChange={(e) => setAchievementsInput(e.target.value)}
                  placeholder="e.g. Goa State Best Teacher Award Nominee (2022)&#10;Canacona Taluka Academic Leadership Council Member"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
                <span className="text-[11px] text-stone-400 font-sans">
                  Leave empty to omit the achievements and honors block.
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Scholarly Publications & Research Papers (One per line)
                </label>
                <textarea
                  rows={3}
                  value={publicationsInput}
                  onChange={(e) => setPublicationsInput(e.target.value)}
                  placeholder="e.g. Practical Organic Reagents for Higher Secondary Curricula (Journal of Chemical Education, 2021)"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
                <span className="text-[11px] text-stone-400 font-sans">
                  Leave empty to omit the research publications block.
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Campus Office & Departmental Contact */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-800 tracking-wider">
                <MapPin size={16} />
                <span>Section 4: Campus Office Hours & Official Contact Channels</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                If you leave any field empty here, its corresponding row and icon will be omitted.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Official Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="e.g. rajesh.phaldessai@nirakar.org"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
                <span className="text-[11px] text-stone-400 font-sans">Leave blank to hide email row & icon.</span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Campus Phone / Extension (Optional)
                </label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="e.g. +91 832 2643232"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
                <span className="text-[11px] text-stone-400 font-sans">Leave blank to hide phone row & icon.</span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Office Consultation Hours (Optional)
                </label>
                <input
                  type="text"
                  value={profile.officeHours || ''}
                  onChange={(e) => setProfile({ ...profile, officeHours: e.target.value })}
                  placeholder="e.g. Mon – Fri: 08:30 AM – 03:00 PM"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
                <span className="text-[11px] text-stone-400 font-sans">Leave blank to hide consultation hours row.</span>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Campus Room / Office Location (Optional)
                </label>
                <input
                  type="text"
                  value={profile.officeLocation || ''}
                  onChange={(e) => setProfile({ ...profile, officeLocation: e.target.value })}
                  placeholder="e.g. Room 204, Science Wing"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
                <span className="text-[11px] text-stone-400 font-sans">Leave blank to hide office location row.</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Academic & Research Social Links */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-800 tracking-wider">
                <Globe size={16} />
                <span>Section 5: Academic Networks & Official Scholar Links</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Enter your profile URLs. Any service left empty will have its icon omitted completely.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Google Scholar URL (Optional)
                </label>
                <input
                  type="url"
                  value={profile.socialLinks?.googleScholar || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, googleScholar: e.target.value },
                    })
                  }
                  placeholder="https://scholar.google.com/citations?user=..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  LinkedIn URL (Optional)
                </label>
                <input
                  type="url"
                  value={profile.socialLinks?.linkedin || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Twitter / X URL (Optional)
                </label>
                <input
                  type="url"
                  value={profile.socialLinks?.twitter || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, twitter: e.target.value },
                    })
                  }
                  placeholder="https://x.com/..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  ResearchGate URL (Optional)
                </label>
                <input
                  type="url"
                  value={profile.socialLinks?.researchGate || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, researchGate: e.target.value },
                    })
                  }
                  placeholder="https://researchgate.net/profile/..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  ORCID Profile URL (Optional)
                </label>
                <input
                  type="url"
                  value={profile.socialLinks?.orcid || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, orcid: e.target.value },
                    })
                  }
                  placeholder="https://orcid.org/0000-..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-stone-700 mb-1.5">
                  Personal Academic Website / Blog (Optional)
                </label>
                <input
                  type="url"
                  value={profile.socialLinks?.website || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, website: e.target.value },
                    })
                  }
                  placeholder="https://rajeshphaldessai.in"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-200 focus:border-[#0b132b] rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-8">
            <Link
              to={`/faculty/${previewSlug}`}
              className="text-xs font-serif font-bold text-stone-600 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5"
            >
              <Eye size={14} />
              <span>Preview Live Profile Without Saving</span>
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#0b132b] hover:bg-[#16247e] text-white rounded-2xl text-xs sm:text-sm font-serif font-bold transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>{saving ? 'Publishing Dossier...' : 'Save Profile & Publish Changes'}</span>
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};
