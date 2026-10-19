import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  ImagePlus,
  Info,
  LoaderCircle,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { useAlumniSocket } from '../hooks/useAlumniSocket.js';

type SocialPlatform = 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'website' | 'github';
type Visibility = 'PUBLIC' | 'ALUMNI_ONLY' | 'PRIVATE';

interface AlumniProfile {
  id: string;
  username?: string;
  user?: { username?: string | null } | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  school: string;
  batchYear: number;
  photoUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  occupation?: string | null;
  verificationLevel: 'UNVERIFIED' | 'VERIFIED' | 'TRUSTED';
  socialLinks?: Array<{ platform: SocialPlatform; url: string }> | Record<string, string> | null;
  visibilitySettings?: Record<string, Visibility> | null;
  galleryPhotos?: string[];
  familyMembers?: Array<{ name: string; relation: string; photoUrl?: string | null; bio?: string | null }>;
}

interface AlumniProfileDraft {
  firstName: string;
  middleName: string;
  lastName: string;
  photoUrl: string;
  bio: string;
  city: string;
  occupation: string;
  socialLinks: Record<SocialPlatform, string>;
  visibilitySettings: Record<string, Visibility>;
}

class AlumniRequestError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const platforms: SocialPlatform[] = ['linkedin', 'instagram', 'facebook', 'twitter', 'github', 'website'];
const defaultVisibility: Record<string, Visibility> = {
  city: 'PUBLIC',
  occupation: 'PUBLIC',
  bio: 'PUBLIC',
  family: 'ALUMNI_ONLY',
  socialLinks: 'PUBLIC',
  gallery: 'ALUMNI_ONLY',
};

const fieldClass =
  'w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/15';
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-600';

function isAlumniProfileDraft(value: unknown): value is AlumniProfileDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<AlumniProfileDraft>;
  return (
    typeof draft.firstName === 'string' &&
    typeof draft.middleName === 'string' &&
    typeof draft.lastName === 'string' &&
    typeof draft.photoUrl === 'string' &&
    typeof draft.bio === 'string' &&
    typeof draft.city === 'string' &&
    typeof draft.occupation === 'string' &&
    !!draft.socialLinks &&
    typeof draft.socialLinks === 'object' &&
    !!draft.visibilitySettings &&
    typeof draft.visibilitySettings === 'object'
  );
}

function getSocialValues(socialLinks: AlumniProfile['socialLinks']): Record<SocialPlatform, string> {
  const values = Object.fromEntries(platforms.map((platform) => [platform, ''])) as Record<SocialPlatform, string>;
  if (Array.isArray(socialLinks)) {
    socialLinks.forEach(({ platform, url }) => {
      if (platform in values) values[platform] = url;
    });
  } else if (socialLinks && typeof socialLinks === 'object') {
    platforms.forEach((platform) => {
      const url = socialLinks[platform];
      if (typeof url === 'string') values[platform] = url;
    });
  }
  return values;
}

export const AlumniDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);
  useAlumniSocket();

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AlumniProfile, Error>({
    queryKey: ['alumni_dashboard_profile'],
    queryFn: async () => {
      const response = await fetch('/api/v1/alumni/me', {
        credentials: 'same-origin',
        signal: AbortSignal.timeout(15000),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new AlumniRequestError(
          json.error?.message || 'Could not load your alumni profile.',
          response.status,
        );
      }
      const data = json.data as AlumniProfile;
      return {
        ...data,
        username: data.username || data.user?.username || '',
      };
    },
    retry: false,
  });

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [imageMetrics, setImageMetrics] = useState<{ original: string; converted: string; reduction: string } | null>(null);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [occupation, setOccupation] = useState('');
  const [socialLinks, setSocialLinks] = useState<Record<SocialPlatform, string>>(() => getSocialValues(null));
  const [visibilitySettings, setVisibilitySettings] = useState(defaultVisibility);
  const [formError, setFormError] = useState('');
  const [draftHydratedFor, setDraftHydratedFor] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState('');
  const [draftError, setDraftError] = useState('');

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setPhotoError('');
    setImageMetrics(null);
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file. PDF and document files cannot be used as profile photos.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setPhotoError('Choose an image smaller than 20 MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const image = await createImageBitmap(file);
      const maxDimension = 1200;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        image.close();
        throw new Error('Your browser could not process this image. Try another image file.');
      }
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, width, height);
      image.close();

      const webpBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Could not convert this image to WebP.'))),
          'image/webp',
          0.86,
        );
      });
      if (webpBlob.type !== 'image/webp') {
        throw new Error('Your browser does not support WebP image conversion. Update your browser or try another one.');
      }

      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== 'string') {
            reject(new Error('Could not read the converted image.'));
            return;
          }
          resolve(reader.result);
        };
        reader.onerror = () => reject(new Error('Could not read the converted image.'));
        reader.readAsDataURL(webpBlob);
      });
      const response = await fetch('/api/v1/faculty/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });
      const json = await response.json();
      if (!response.ok || !json.photoUrl) {
        throw new Error(json.error?.message || 'The profile photo could not be uploaded.');
      }

      const originalKb = file.size / 1024;
      const convertedKb = webpBlob.size / 1024;
      const reduction = Math.max(0, Math.round((1 - convertedKb / originalKb) * 100));
      setPhotoUrl(json.photoUrl);
      setImageMetrics({
        original: `${originalKb.toFixed(1)} KB`,
        converted: `${convertedKb.toFixed(1)} KB WebP`,
        reduction: `${reduction}% smaller`,
      });
    } catch (uploadError) {
      setPhotoError(uploadError instanceof Error ? uploadError.message : 'The profile photo could not be uploaded.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  useEffect(() => {
    if (!profile) return;
    const storageKey = `nirakar_alumni_profile_draft_${profile.id}`;
    let draft: AlumniProfileDraft | null = null;
    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const parsed: unknown = JSON.parse(savedDraft);
        if (isAlumniProfileDraft(parsed)) {
          draft = parsed;
          setDraftStatus('Unsaved changes from this browser were restored.');
        } else {
          setDraftError('An earlier local draft could not be read. Your saved profile is still available.');
        }
      }
    } catch {
      setDraftError('Your local draft could not be read. Your saved profile is still available.');
    }

    setFirstName(draft?.firstName ?? profile.firstName ?? '');
    setMiddleName(draft?.middleName ?? profile.middleName ?? '');
    setLastName(draft?.lastName ?? profile.lastName ?? '');
    setPhotoUrl(draft?.photoUrl ?? profile.photoUrl ?? '');
    setBio(draft?.bio ?? profile.bio ?? '');
    setCity(draft?.city ?? profile.city ?? '');
    setOccupation(draft?.occupation ?? profile.occupation ?? '');
    setSocialLinks(draft?.socialLinks ?? getSocialValues(profile.socialLinks));
    setVisibilitySettings({
      ...defaultVisibility,
      ...profile.visibilitySettings,
      ...draft?.visibilitySettings,
    });
    setDraftHydratedFor(profile.id);
  }, [profile?.id]);

  useEffect(() => {
    if (!profile || draftHydratedFor !== profile.id) return;
    const storageKey = `nirakar_alumni_profile_draft_${profile.id}`;
    const draft: AlumniProfileDraft = {
      firstName,
      middleName,
      lastName,
      photoUrl,
      bio,
      city,
      occupation,
      socialLinks,
      visibilitySettings,
    };
    const savedProfile: AlumniProfileDraft = {
      firstName: profile.firstName || '',
      middleName: profile.middleName || '',
      lastName: profile.lastName || '',
      photoUrl: profile.photoUrl || '',
      bio: profile.bio || '',
      city: profile.city || '',
      occupation: profile.occupation || '',
      socialLinks: getSocialValues(profile.socialLinks),
      visibilitySettings: { ...defaultVisibility, ...profile.visibilitySettings },
    };

    try {
      if (JSON.stringify(draft) === JSON.stringify(savedProfile)) {
        localStorage.removeItem(storageKey);
        setDraftStatus('');
      } else {
        localStorage.setItem(storageKey, JSON.stringify(draft));
        setDraftStatus('Unsaved changes are saved in this browser and will be restored after a refresh.');
      }
      setDraftError('');
    } catch {
      setDraftError('This browser could not save your local draft. Save your changes before leaving or refreshing.');
    }
  }, [
    profile,
    draftHydratedFor,
    firstName,
    middleName,
    lastName,
    photoUrl,
    bio,
    city,
    occupation,
    socialLinks,
    visibilitySettings,
  ]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      setFormError('');

      const response = await fetch('/api/v1/alumni/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          middleName: middleName.trim() || null,
          lastName: lastName.trim(),
          photoUrl: photoUrl.trim() || null,
          bio: bio.trim() || null,
          city: city.trim() || null,
          occupation: occupation.trim() || null,
          socialLinks: platforms
            .filter((platform) => socialLinks[platform].trim())
            .map((platform) => ({ platform, url: socialLinks[platform].trim() })),
          familyMembers: profile?.familyMembers || [],
          galleryPhotos: profile?.galleryPhotos || [],
          visibilitySettings,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        const detail = json.error?.details?.[0]?.message;
        throw new AlumniRequestError(detail || json.error?.message || 'Could not save your profile.', response.status);
      }
      const data = json.data as Partial<AlumniProfile>;
      return {
        ...data,
        username: data.username || data.user?.username || profile?.username || '',
      };
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<AlumniProfile>(['alumni_dashboard_profile'], (current) => ({
        ...current,
        ...updatedProfile,
      } as AlumniProfile));
      if (profile?.username) {
        queryClient.invalidateQueries({ queryKey: ['alumni_profile', profile.username] });
      }
    },
    onError: (saveError: Error) => setFormError(saveError.message),
  });

  const isUnauthenticated =
    error instanceof AlumniRequestError &&
    (error.status === 401 || error.status === 403 || error.status === 404);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-stone-900" aria-busy="true">
        <Navbar />
        <header className="relative isolate w-full overflow-hidden bg-[#0b132b] px-4 pb-10 pt-12 text-white sm:px-8 sm:pb-12 sm:pt-16 lg:-mt-[78px] lg:px-12 lg:pb-14 lg:pt-28 xl:px-16">
          <HeroWaves opacity={0.85} />
          <div className="relative z-10 mx-auto flex w-full max-w-[1850px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full max-w-2xl space-y-3">
              <div className="h-3 w-24 animate-pulse rounded bg-white/15" />
              <div className="h-9 w-64 max-w-full animate-pulse rounded-lg bg-white/20" />
              <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />
            </div>
            <div className="h-11 w-36 animate-pulse rounded-xl bg-amber-400/40" />
          </div>
        </header>
        <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />
        <main className="mx-auto w-full max-w-[1850px] px-4 py-7 sm:px-8 lg:px-12">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section
              className="space-y-7 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8"
              aria-label="Loading your profile form"
            >
              <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div className="space-y-2">
                  <div className="h-5 w-44 animate-pulse rounded bg-stone-200" />
                  <div className="h-3 w-64 max-w-full animate-pulse rounded bg-stone-100" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-amber-100" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {[0, 1, 2, 3].map((field) => (
                  <div key={field} className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-stone-200" />
                    <div className="h-11 animate-pulse rounded-xl border border-stone-100 bg-stone-50" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-3 w-28 animate-pulse rounded bg-stone-200" />
                <div className="h-28 animate-pulse rounded-xl border border-stone-100 bg-stone-50" />
              </div>
              <div className="h-11 w-32 animate-pulse rounded-xl bg-[#0b132b]/15" />
            </section>
            <aside className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="h-5 w-36 animate-pulse rounded bg-stone-200" />
              <div className="aspect-square w-full animate-pulse rounded-2xl bg-stone-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-stone-100" />
            </aside>
          </div>
          <p className="mt-5 text-center text-sm text-stone-500" role="status">
            Loading your alumni profile…
          </p>
        </main>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-stone-900">
        <Navbar />
        <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
          <AlertCircle size={38} className="mb-4 text-amber-700" />
          <h1 className="font-serif text-3xl font-bold">
            {isUnauthenticated ? 'Sign in with your alumni account' : 'Your dashboard is unavailable'}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-stone-600">
            {isUnauthenticated
              ? 'This session is not connected to an alumni profile. Sign in with the alumni account that owns your profile, then return here to edit it.'
              : error?.message || 'We could not load your alumni account right now.'}
          </p>
          {isUnauthenticated ? (
            <Link to="/alumni/login" className="mt-6 rounded-xl bg-[#0b132b] px-5 py-3 text-sm font-semibold text-white">
              Sign in to Alumni
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-6 rounded-xl bg-[#0b132b] px-5 py-3 text-sm font-semibold text-white"
            >
              Try again
            </button>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  const schoolName =
    profile.school === 'NIRAKAR_HS'
      ? 'Shri Nirakar Vidyalaya'
      : profile.school === 'ANGLE_HSS'
      ? 'S. S. Angle Higher Secondary School'
      : 'Tudal High School';
  const profileUsername = profile.username || profile.user?.username || '';
  const publicProfileUrl = profileUsername ? `/alumni/${encodeURIComponent(profileUsername)}` : '/alumni';
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900">
      <Helmet>
        <title>My Alumni Dashboard | Shree Nirakar Education Society</title>
      </Helmet>
      <Navbar />
      <header className="relative isolate w-full overflow-hidden bg-[#0b132b] px-4 pb-10 pt-12 text-white sm:px-8 sm:pb-12 sm:pt-16 lg:-mt-[78px] lg:px-12 lg:pb-14 lg:pt-28 xl:px-16">
        <HeroWaves opacity={0.85} />
        <div className="relative z-10 mx-auto flex w-full max-w-[1850px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Alumni space</p>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">Your dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
              Keep your alumni profile current. Changes you save here are stored in your account and update your public profile.
            </p>
          </div>
          <Link
            to={publicProfileUrl}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-[#0b132b] transition hover:bg-amber-300"
          >
            View my profile <ArrowRight size={16} />
          </Link>
        </div>
      </header>
      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      <main className="mx-auto w-full max-w-[1850px] px-4 pb-16 pt-7 sm:px-8 lg:px-12 xl:px-16">
        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveProfile.mutate();
            }}
            className="space-y-7 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-5">
              <div>
                <h2 className="font-serif text-2xl font-bold">Edit your profile</h2>
                <p className="mt-1 text-sm text-stone-500">The details below are saved to your alumni record.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
                <ShieldCheck size={14} />
                {profile.verificationLevel === 'UNVERIFIED'
                  ? 'Awaiting verification'
                  : profile.verificationLevel === 'TRUSTED'
                  ? 'Trusted'
                  : 'Verified'}
              </span>
            </div>

            {formError && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {formError}
              </div>
            )}
            {saveProfile.isSuccess && (
              <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle2 size={17} /> Your profile has been saved.
              </div>
            )}

            <section>
              <h3 className="mb-4 font-serif text-lg font-bold">Personal details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>First name</span>
                  <input className={fieldClass} value={firstName} onChange={(event) => setFirstName(event.target.value)} required minLength={2} />
                </label>
                <label>
                  <span className={labelClass}>Middle name</span>
                  <input className={fieldClass} value={middleName} onChange={(event) => setMiddleName(event.target.value)} />
                </label>
                <label>
                  <span className={labelClass}>Last name</span>
                  <input className={fieldClass} value={lastName} onChange={(event) => setLastName(event.target.value)} required minLength={2} />
                </label>
                <div className="sm:col-span-2">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={labelClass + ' mb-0'}>Profile photo</span>
                    <span className="group relative inline-flex">
                      <button
                        type="button"
                        aria-label="Photo upload information"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-stone-400 transition hover:bg-amber-50 hover:text-amber-800"
                      >
                        <Info size={15} />
                      </button>
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg bg-[#0b132b] px-3 py-2 text-xs font-normal leading-5 text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
                      >
                        Upload JPG, PNG, WebP, or AVIF. Large images are resized to fit 1200 px and converted to WebP before upload. PDF files are not supported.
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 sm:flex-row sm:items-center">
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={`${fullName || 'Your'} profile photo preview`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-stone-300">
                          <UserRound size={38} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-800">Choose a clear, recent photo</p>
                      <p className="mt-1 text-xs leading-5 text-stone-500">
                        JPG, PNG, WebP, or AVIF · up to 20 MB before compression.
                      </p>
                      {imageMetrics && (
                        <p className="mt-2 text-xs font-medium text-emerald-800">
                          {imageMetrics.original} → {imageMetrics.converted} ({imageMetrics.reduction})
                        </p>
                      )}
                      {photoError && <p role="alert" className="mt-2 text-xs text-red-700">{photoError}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={(event) => void handlePhotoUpload(event)}
                          className="sr-only"
                        />
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#0b132b] px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#16247e] disabled:cursor-wait disabled:opacity-60"
                        >
                          {uploadingPhoto ? <LoaderCircle size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                          {uploadingPhoto ? 'Optimizing and uploading…' : photoUrl ? 'Change photo' : 'Upload photo'}
                        </button>
                        {photoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoUrl('');
                              setImageMetrics(null);
                              setPhotoError('');
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-600 transition hover:border-red-200 hover:text-red-700"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <label>
                  <span className={labelClass}>Current city</span>
                  <input className={fieldClass} maxLength={100} value={city} onChange={(event) => setCity(event.target.value)} placeholder="City, country" />
                </label>
                <label>
                  <span className={labelClass}>Occupation</span>
                  <input className={fieldClass} maxLength={100} value={occupation} onChange={(event) => setOccupation(event.target.value)} placeholder="Your role or profession" />
                </label>
                <label className="sm:col-span-2">
                  <span className={labelClass}>About you</span>
                  <textarea className={`${fieldClass} min-h-32 resize-y`} maxLength={1000} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Share a little about your work and journey since school." />
                  <span className="mt-1 block text-right text-xs text-stone-400">{bio.length}/1000</span>
                </label>
              </div>
            </section>

            <section className="border-t border-stone-100 pt-6">
              <h3 className="mb-1 font-serif text-lg font-bold">Social profiles</h3>
              <p className="mb-4 text-sm text-stone-500">Add only links you want included on your public profile.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {platforms.map((platform) => (
                  <label key={platform}>
                    <span className={labelClass}>{platform === 'website' ? 'Personal website' : platform}</span>
                    <input
                      className={fieldClass}
                      type="url"
                      value={socialLinks[platform]}
                      onChange={(event) => setSocialLinks((current) => ({ ...current, [platform]: event.target.value }))}
                      placeholder={`https://${platform === 'website' ? 'example.com' : `${platform}.com/your-name`}`}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="border-t border-stone-100 pt-6">
              <h3 className="mb-1 font-serif text-lg font-bold">Privacy</h3>
              <p className="mb-4 text-sm text-stone-500">Choose who can see each personal detail on your profile.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(['bio', 'city', 'occupation', 'socialLinks'] as const).map((field) => (
                  <label key={field}>
                    <span className={labelClass}>{field === 'socialLinks' ? 'Social profiles' : field}</span>
                    <select
                      className={fieldClass}
                      value={visibilitySettings[field] || 'PUBLIC'}
                      onChange={(event) => setVisibilitySettings((current) => ({
                        ...current,
                        [field]: event.target.value as Visibility,
                      }))}
                    >
                      <option value="PUBLIC">Everyone</option>
                      <option value="ALUMNI_ONLY">Signed-in alumni</option>
                      <option value="PRIVATE">Only me</option>
                    </select>
                  </label>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-6">
              <p className="text-xs leading-5 text-stone-500">Your school and graduation year are kept as registered for verification.</p>
              <button
                type="submit"
                disabled={saveProfile.isPending || uploadingPhoto}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0b132b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#16247e] disabled:cursor-wait disabled:opacity-60"
              >
                {saveProfile.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                {saveProfile.isPending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
                <UserRound size={23} />
              </div>
              <h2 className="font-serif text-xl font-bold">{fullName || profileUsername || 'Alumni profile'}</h2>
              {profileUsername && <p className="mt-1 text-sm text-stone-500">@{profileUsername}</p>}
              <div className="mt-5 space-y-3 border-t border-stone-100 pt-4 text-sm">
                <div className="flex items-start gap-2.5 text-stone-600">
                  <GraduationCap size={17} className="mt-0.5 shrink-0 text-amber-800" />
                  <span>{schoolName}<br /><span className="text-xs text-stone-400">Class of {profile.batchYear}</span></span>
                </div>
              </div>
              <Link to={publicProfileUrl} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#16247e] hover:underline">
                Open public profile <ExternalLink size={14} />
              </Link>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6">
              <div className="flex items-center gap-2 font-serif font-bold text-amber-950">
                <ShieldCheck size={18} /> Verification status
              </div>
              <p className="mt-2 text-sm leading-6 text-amber-950/75">
                {profile.verificationLevel === 'UNVERIFIED'
                  ? 'Your account is created. The school administration reviews alumni records before granting a verified badge and public directory listing.'
                  : 'Your profile has been reviewed by the school administration.'}
              </p>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};
