import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';

type VerificationLevel = 'UNVERIFIED' | 'EMAIL_VERIFIED' | 'VERIFIED' | 'TRUSTED';
type AlumniVerificationRecord = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  school: string;
  batchYear: number;
  photoUrl?: string | null;
  verificationLevel: VerificationLevel;
  user?: { username: string } | null;
};
type AlumniFilter = 'ALL' | 'UNVERIFIED' | 'VERIFIED' | 'TRUSTED';
type AlumniDirectoryEvent = { data?: AlumniVerificationRecord };

const alumniQueryPrefix = ['admin_alumni_list'] as const;
const getAlumniQueryKey = (search: string) => [...alumniQueryPrefix, search.trim()] as const;
const PAGE_SIZE = 8;

const schoolNames: Record<string, string> = {
  NIRAKAR_HS: 'Shri Nirakar Vidyalaya',
  TUDAL_HS: 'Tudal High School',
  ANGLE_HSS: 'S. S. Angle Higher Secondary School',
};

function getAlumniName(alumnus: AlumniVerificationRecord) {
  return [alumnus.firstName, alumnus.middleName, alumnus.lastName]
    .filter((part) => typeof part === 'string' && part.trim())
    .join(' ');
}

function getPublicSiteUrl() {
  const { hostname, origin, protocol } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:5000`;
  }
  return origin;
}

function getSocketUrl() {
  const localHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  return localHost
    ? `${window.location.protocol}//${window.location.hostname}:4000`
    : '/';
}

async function fetchWithAdminSession(input: RequestInfo | URL, init: RequestInit = {}) {
  const requestInit: RequestInit = { ...init, credentials: 'include' };
  const response = await fetch(input, requestInit);
  if (response.status !== 401) return response;

  const refreshResponse = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  if (!refreshResponse.ok) return response;

  return fetch(input, requestInit);
}

export const AlumniManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AlumniFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteError, setDeleteError] = useState('');

  const {
    data: alumni = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: getAlumniQueryKey(search),
    queryFn: async () => {
      const response = await fetchWithAdminSession(
        `/api/v1/alumni/admin/all?search=${encodeURIComponent(search.trim())}`,
      );
      if (!response.ok) throw new Error('Unable to load alumni verification records.');
      const result = await response.json();
      if (!Array.isArray(result.data)) throw new Error('The alumni verification response was invalid.');
      return result.data as AlumniVerificationRecord[];
    },
  });

  const updateVerification = useMutation({
    mutationFn: async ({ id, verificationLevel }: { id: string; verificationLevel: VerificationLevel }) => {
      const response = await fetchWithAdminSession(`/api/v1/alumni/admin/${encodeURIComponent(id)}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationLevel }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to update alumni verification.');
      }
      return result.data as AlumniVerificationRecord;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueriesData<AlumniVerificationRecord[]>({ queryKey: alumniQueryPrefix }, (current) =>
        current?.map((profile) => profile.id === updatedProfile.id ? { ...profile, ...updatedProfile } : profile),
      );
      void queryClient.invalidateQueries({ queryKey: ['alumni_directory'] });
      void queryClient.invalidateQueries({ queryKey: ['alumni_profile'] });
    },
  });

  const deleteAlumni = useMutation({
    mutationFn: async (profile: AlumniVerificationRecord) => {
      const response = await fetchWithAdminSession(`/api/v1/alumni/admin/${encodeURIComponent(profile.id)}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to delete this alumni record.');
      }
      return profile.id as string;
    },
    onSuccess: (profileId) => {
      setDeleteError('');
      queryClient.setQueriesData<AlumniVerificationRecord[]>({ queryKey: alumniQueryPrefix }, (current) =>
        current?.filter((profile) => profile.id !== profileId),
      );
      void queryClient.invalidateQueries({ queryKey: alumniQueryPrefix });
      void queryClient.invalidateQueries({ queryKey: ['alumni_directory'] });
      void queryClient.invalidateQueries({ queryKey: ['alumni_profile'] });
    },
    onError: (error: Error) => setDeleteError(error.message),
  });

  useEffect(() => {
    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
    });
    const handleAlumniUpdate = (event: AlumniDirectoryEvent) => {
      if (event.data?.id) {
        queryClient.setQueriesData<AlumniVerificationRecord[]>({ queryKey: alumniQueryPrefix }, (current) =>
          current?.map((profile) => profile.id === event.data!.id
            ? { ...profile, ...event.data }
            : profile),
        );
      }
      void queryClient.invalidateQueries({ queryKey: alumniQueryPrefix });
    };
    socket.on('alumni:updated', handleAlumniUpdate);
    return () => {
      socket.off('alumni:updated', handleAlumniUpdate);
      socket.disconnect();
    };
  }, [queryClient]);

  const counts = useMemo(() => ({
    all: alumni.length,
    unverified: alumni.filter((profile) => profile.verificationLevel === 'UNVERIFIED' || profile.verificationLevel === 'EMAIL_VERIFIED').length,
    verified: alumni.filter((profile) => profile.verificationLevel === 'VERIFIED').length,
    trusted: alumni.filter((profile) => profile.verificationLevel === 'TRUSTED').length,
  }), [alumni]);

  const filteredAlumni = useMemo(() => alumni.filter((profile) => {
    if (filter === 'UNVERIFIED') return profile.verificationLevel === 'UNVERIFIED' || profile.verificationLevel === 'EMAIL_VERIFIED';
    return filter === 'ALL' || profile.verificationLevel === filter;
  }), [alumni, filter]);
  const totalPages = Math.max(1, Math.ceil(filteredAlumni.length / PAGE_SIZE));
  const pageAlumni = filteredAlumni.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const formatLevel = (level: VerificationLevel) => {
    switch (level) {
      case 'TRUSTED': return 'Trusted';
      case 'VERIFIED': return 'Verified';
      case 'EMAIL_VERIFIED': return 'Email verified';
      default: return 'Unverified';
    }
  };

  const badgeClasses = (level: VerificationLevel) => {
    if (level === 'TRUSTED') return 'border-violet-200 bg-violet-50 text-violet-800';
    if (level === 'VERIFIED') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    return 'border-stone-200 bg-stone-100 text-stone-600';
  };

  return (
    <div className="w-full space-y-6 font-sans">
      <header>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold text-stone-900 sm:text-3xl">
          <ShieldCheck className="text-brand-700" size={28} />
          Alumni verification
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Review alumni records and assign verified or trusted status.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Alumni verification totals">
        {[
          { title: 'All alumni', count: counts.all, icon: Users, tone: 'stone' },
          { title: 'Verified', count: counts.verified, icon: CheckCircle2, tone: 'emerald' },
          { title: 'Trusted', count: counts.trusted, icon: Award, tone: 'amber' },
        ].map(({ title, count, icon: Icon, tone }) => (
          <div key={title} className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600">{title}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                  tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-stone-100 text-stone-600'
              }`}>
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-stone-900">{isLoading || isError ? '—' : count}</p>
            <p className="mt-1 text-xs text-stone-400">{title === 'All alumni' ? 'Registered records' : 'Current status'}</p>
          </div>
        ))}
      </section>

      <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-stone-900 sm:text-lg">
              <GraduationCap size={18} className="text-brand-700" />
              Alumni records
            </h2>
            <p className="mt-1 text-xs text-stone-500">Verification changes are saved to the database.</p>
          </div>
          <label className="relative w-full xl:max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by name or username..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 pb-4">
          {([
            ['ALL', 'All alumni', counts.all],
            ['UNVERIFIED', 'Needs review', counts.unverified],
            ['VERIFIED', 'Verified', counts.verified],
            ['TRUSTED', 'Trusted', counts.trusted],
          ] as const).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                filter === value
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                filter === value ? 'bg-white/20 text-white' : 'bg-white text-stone-600'
              }`}>{isLoading || isError ? '—' : count}</span>
            </button>
          ))}
        </div>

        {updateVerification.isError && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            {updateVerification.error.message}
          </div>
        )}
        {deleteError && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            {deleteError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <th className="px-4 py-3">Alumni member</th>
                <th className="px-4 py-3">School & class</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr><td colSpan={4} className="py-10 text-center text-stone-500">Loading alumni records...</td></tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-rose-700">
                    Could not load alumni records.
                    <button type="button" onClick={() => void refetch()} className="ml-2 font-semibold underline">Retry</button>
                  </td>
                </tr>
              ) : pageAlumni.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-stone-500">No alumni records match this filter.</td></tr>
              ) : pageAlumni.map((profile) => {
                const name = getAlumniName(profile) || 'Alumni member';
                const isUpdating = updateVerification.isPending && updateVerification.variables?.id === profile.id;
                return (
                  <tr key={profile.id} className="transition-colors hover:bg-stone-50/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {profile.photoUrl ? (
                          <img src={profile.photoUrl} alt="" className="h-10 w-10 rounded-xl border border-stone-200 object-cover" />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                            <UserRound size={18} />
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-stone-900">{name}</p>
                          <p className="mt-0.5 text-[11px] text-stone-400">
                            {profile.user?.username ? `@${profile.user.username}` : 'No username'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {schoolNames[profile.school] || profile.school}
                      <span className="mt-1 block text-[11px] text-stone-400">Class of {profile.batchYear}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClasses(profile.verificationLevel)}`}>
                        {profile.verificationLevel === 'TRUSTED' ? <Award size={12} /> :
                          profile.verificationLevel === 'VERIFIED' ? <CheckCircle2 size={12} /> :
                            <ShieldCheck size={12} />}
                        {formatLevel(profile.verificationLevel)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {profile.verificationLevel !== 'VERIFIED' && profile.verificationLevel !== 'TRUSTED' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => updateVerification.mutate({ id: profile.id, verificationLevel: 'VERIFIED' })}
                            className="rounded-lg bg-emerald-700 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                          >
                            Verify
                          </button>
                        )}
                        {profile.verificationLevel !== 'TRUSTED' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => updateVerification.mutate({ id: profile.id, verificationLevel: 'TRUSTED' })}
                            className="rounded-lg bg-brand-700 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50"
                          >
                            {profile.verificationLevel === 'VERIFIED' ? 'Mark trusted' : 'Verify & trust'}
                          </button>
                        )}
                        {profile.verificationLevel !== 'UNVERIFIED' && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => updateVerification.mutate({ id: profile.id, verificationLevel: 'UNVERIFIED' })}
                            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-[11px] font-semibold text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        )}
                        <a
                          href={`${getPublicSiteUrl()}/alumni/${encodeURIComponent(profile.user?.username || profile.id)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-[11px] font-semibold text-stone-700 transition hover:bg-stone-100"
                        >
                          Profile
                        </a>
                        <button
                          type="button"
                          disabled={deleteAlumni.isPending}
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Remove ${name} from the alumni directory? Their account will be deactivated and their record hidden.`,
                            );
                            if (confirmed) {
                              setDeleteError('');
                              deleteAlumni.mutate(profile);
                            }
                          }}
                          aria-label={`Delete ${name}`}
                          title="Deactivate and remove alumni record"
                          className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          {deleteAlumni.isPending && deleteAlumni.variables?.id === profile.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && filteredAlumni.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-5 sm:flex-row">
            <p className="text-xs text-stone-500">
              Showing <strong className="text-stone-900">{(currentPage - 1) * PAGE_SIZE + 1}</strong> to{' '}
              <strong className="text-stone-900">{Math.min(currentPage * PAGE_SIZE, filteredAlumni.length)}</strong> of{' '}
              <strong className="text-stone-900">{filteredAlumni.length}</strong> alumni
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40">
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="px-3 text-xs text-stone-600">
                  Page <strong className="text-stone-900">{currentPage}</strong> of <strong className="text-stone-900">{totalPages}</strong>
                </span>
                <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40">
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AlumniManagerPage;
