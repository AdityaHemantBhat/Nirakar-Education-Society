import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  Search,
  Settings2,
  Upload,
  UserRound,
} from 'lucide-react';
import {
  AdmissionConfig,
  AdmissionStatus,
  ApplicationListResponse,
  STATUS_OPTIONS,
  STATUS_LABELS,
  admissionsListQueryPrefix,
  downloadAdmissionsCsv,
  fetchWithAdminSession,
  formatDate,
  statusBadgeClasses,
} from '../lib/admissions.js';
import { CustomCampusSelect } from '../components/AdminSelect.js';

const PAGE_SIZE = 10;

export const AdmissionsManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AdmissionStatus>('ALL');
  const [institutionFilter, setInstitutionFilter] = useState<'ALL' | string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [configDraft, setConfigDraft] = useState<{ isOpen: boolean; academicYear: string; announcementText: string; announcementVisible: boolean } | null>(null);

  const {
    data: config,
    isLoading: isConfigLoading,
  } = useQuery({
    queryKey: ['admin_admissions_config'],
    queryFn: async () => {
      const response = await fetchWithAdminSession('/api/v1/admissions/config');
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to load admission configuration.');
      return result.data as AdmissionConfig;
    },
  });

  useEffect(() => {
    if (config && !configDraft) {
      setConfigDraft({
        isOpen: config.isOpen,
        academicYear: config.academicYear,
        announcementText: config.announcementText || '',
        announcementVisible: config.announcementVisible !== false,
      });
    }
  }, [config, configDraft]);

  const {
    data: applications,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [...admissionsListQueryPrefix, search.trim(), statusFilter, institutionFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
      });
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (institutionFilter !== 'ALL') params.set('institutionCode', institutionFilter);

      const response = await fetchWithAdminSession(`/api/v1/admissions/admin/applications?${params.toString()}`);
      if (!response.ok) throw new Error('Unable to load admission applications.');
      const result = await response.json();
      if (!result.success || !result.data) throw new Error('The admission applications response was invalid.');
      return result.data as ApplicationListResponse;
    },
    placeholderData: (previous) => previous,
  });

  const updateConfig = useMutation({
    mutationFn: async (input: { isOpen: boolean; academicYear: string; announcementText: string; announcementVisible: boolean }) => {
      const response = await fetchWithAdminSession('/api/v1/admissions/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOpen: input.isOpen,
          academicYear: input.academicYear,
          announcementText: input.announcementText || null,
          announcementVisible: input.announcementVisible,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to update admission settings.');
      return result.data as AdmissionConfig;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin_admissions_config'], updated);
      if (configDraft) {
        setConfigDraft({
          isOpen: updated.isOpen,
          academicYear: updated.academicYear,
          announcementText: updated.announcementText || '',
          announcementVisible: updated.announcementVisible !== false,
        });
      }
    },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, institutionFilter]);

  const items = applications?.items ?? [];
  const total = applications?.total ?? 0;
  const totalPages = applications?.totalPages ?? 1;

  const pageNumbers: (number | 'ellipsis')[] = [];
  for (let page = 1; page <= totalPages; page++) {
    if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
      pageNumbers.push(page);
    } else if (pageNumbers[pageNumbers.length - 1] !== 'ellipsis') {
      pageNumbers.push('ellipsis');
    }
  }

  return (
    <div className="w-full space-y-6 font-sans">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-stone-900 sm:text-3xl">
            <GraduationCap className="text-brand-700" size={28} />
            Student admissions
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Review submitted admission applications, update their status, and manage the online admission window.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void downloadAdmissionsCsv().catch(() => undefined)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-xs transition hover:bg-stone-50"
        >
          <Download size={15} />
          Export CSV
        </button>
      </header>

      {/* Admission configuration */}
      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-stone-900 sm:text-lg">
              <Settings2 size={18} className="text-brand-700" />
              Admission settings
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Control whether the public admission form is open and which academic year it applies to.
            </p>
          </div>
          {configDraft && (
            <button
              type="button"
              disabled={updateConfig.isPending}
              onClick={() =>
                updateConfig.mutate({
                  isOpen: !configDraft.isOpen,
                  academicYear: configDraft.academicYear,
                  announcementText: configDraft.announcementText,
                  announcementVisible: configDraft.announcementVisible,
                })
              }
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition disabled:opacity-50 ${
                configDraft.isOpen
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-stone-800 text-white hover:bg-stone-900'
              }`}
            >
              {updateConfig.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {configDraft.isOpen ? 'Admissions are open — click to close' : 'Admissions are closed — click to open'}
            </button>
          )}
        </div>

        {isConfigLoading || !configDraft ? (
          <p className="pt-5 text-xs text-stone-500">Loading admission settings...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-stone-700">Active academic year</span>
              <input
                type="text"
                value={configDraft.academicYear}
                onChange={(event) => setConfigDraft({ ...configDraft, academicYear: event.target.value })}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
                placeholder="e.g. 2026–2027"
              />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs font-semibold text-stone-700">Public announcement text</span>
              <textarea
                rows={2}
                value={configDraft.announcementText}
                onChange={(event) => setConfigDraft({ ...configDraft, announcementText: event.target.value })}
                maxLength={500}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
                placeholder="Shown on the public admissions page..."
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={configDraft.announcementVisible}
                onChange={(event) => setConfigDraft({ ...configDraft, announcementVisible: event.target.checked })}
                className="h-4 w-4 rounded border-stone-300 accent-brand-700"
              />
              Show announcement
            </label>
            <div className="flex items-center gap-3 sm:col-span-2">
              <button
                type="button"
                disabled={updateConfig.isPending}
                onClick={() =>
                  updateConfig.mutate({
                    isOpen: configDraft.isOpen,
                    academicYear: configDraft.academicYear,
                    announcementText: configDraft.announcementText,
                    announcementVisible: configDraft.announcementVisible,
                  })
                }
                className="rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50"
              >
                {updateConfig.isPending ? 'Saving...' : 'Save settings'}
              </button>
              {updateConfig.isSuccess && (
                <span className="text-xs font-semibold text-emerald-700">Settings saved successfully.</span>
              )}
              {updateConfig.isError && (
                <span role="alert" className="text-xs font-semibold text-rose-700">
                  {updateConfig.error.message}
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Applications list */}
      <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-stone-900 sm:text-lg">
              <FileText size={18} className="text-brand-700" />
              Admission applications
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              {isLoading || isError ? 'Loading records...' : `${total} application${total === 1 ? '' : 's'} received`}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <label className="relative w-full sm:w-80 lg:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search name, application no., phone..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-brand-700 focus:bg-white"
              />
            </label>
            <div className="w-full shrink-0 sm:w-64">
              <CustomCampusSelect
                compact
                value={institutionFilter === 'ALL' ? '' : institutionFilter}
                onChange={(val) => setInstitutionFilter(val || 'ALL')}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 pb-4">
          {(['ALL', ...STATUS_OPTIONS] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                statusFilter === value
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {value === 'ALL' ? 'All statuses' : STATUS_LABELS[value]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Institution & grade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr><td colSpan={6} className="py-10 text-center text-stone-500">Loading admission applications...</td></tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-rose-700">
                    Could not load admission applications.
                    <button type="button" onClick={() => void refetch()} className="ml-2 font-semibold underline">Retry</button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-stone-500">No admission applications match this filter.</td></tr>
              ) : items.map((application) => (
                <tr key={application.id} className="transition-colors hover:bg-stone-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-800">
                        <UserRound size={18} />
                      </span>
                      <div>
                        <p className="font-semibold text-stone-900">{application.studentName}</p>
                        <p className="mt-0.5 text-[11px] text-stone-400">
                          {application.fatherName} · {application.primaryPhone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-[11px] font-semibold text-stone-900">{application.applicationNumber}</p>
                    <p className="mt-0.5 text-[11px] text-stone-400">{application.academicYear}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-stone-400" />
                      {application.institutionName}
                    </span>
                    <span className="mt-1 block text-[11px] text-stone-400">
                      {application.gradeApplied}{application.stream ? ` — ${application.stream}` : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClasses(application.status)}`}>
                      {STATUS_LABELS[application.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{formatDate(application.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admissions/${application.id}`}
                        className="rounded-lg bg-brand-700 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-brand-800"
                      >
                        Review
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && total > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-5 sm:flex-row">
            <p className="text-xs text-stone-500">
              Showing <strong className="text-stone-900">{(currentPage - 1) * PAGE_SIZE + 1}</strong> to{' '}
              <strong className="text-stone-900">{Math.min(currentPage * PAGE_SIZE, total)}</strong> of{' '}
              <strong className="text-stone-900">{total}</strong> applications
              {isFetching && <span className="ml-2 text-stone-400">(updating...)</span>}
            </p>
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                {pageNumbers.map((page, index) =>
                  page === 'ellipsis' ? (
                    <span key={`page-gap-${index}`} className="px-1 text-xs text-stone-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      aria-current={currentPage === page ? 'page' : undefined}
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-xl px-2.5 text-xs font-bold transition ${
                        currentPage === page
                          ? 'bg-brand-700 text-white shadow-xs'
                          : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
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

export default AdmissionsManagerPage;
