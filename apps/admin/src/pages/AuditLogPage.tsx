import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Loader2,
  RefreshCw,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { fetchWithAdminSession } from '../lib/admissions.js';
import { AdminSelect, SelectOption } from '../components/AdminSelect.js';
import {
  AuditFacets,
  AuditListResponse,
  actionTone,
  describeAction,
  entrySummary,
  formatAuditDate,
} from '../lib/settings.js';

const PAGE_SIZE = 25;

export const AuditLogPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('ALL');
  const [entity, setEntity] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching, refetch } = useQuery<AuditListResponse>({
    queryKey: ['auditLog', search.trim(), action, entity, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search.trim()) params.set('q', search.trim());
      if (action !== 'ALL') params.set('action', action);
      if (entity !== 'ALL') params.set('entity', entity);

      const response = await fetchWithAdminSession(`/api/v1/audit-log?${params.toString()}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to load the activity log.');
      }
      return result.data as AuditListResponse;
    },
    placeholderData: (previous) => previous,
  });

  const { data: facets } = useQuery<AuditFacets>({
    queryKey: ['auditLogFacets'],
    queryFn: async () => {
      const response = await fetchWithAdminSession('/api/v1/audit-log/facets');
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to load the filters.');
      }
      return result.data as AuditFacets;
    },
    staleTime: 60_000,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const setFilter = (setter: (v: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* ============================== The header ============================== */}
      <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">
            The Console
          </p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">Activity log</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-stone-500">
            Everything that has been changed in the console, and who changed it.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : undefined} />
          Refresh
        </button>
      </header>

      {/* ============================== The filters ============================== */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search the log…"
            className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-xs text-stone-900 outline-none transition focus:border-brand-700"
          />
        </div>

        <div className="w-48 sm:w-56 shrink-0">
          <AdminSelect
            value={action}
            onChange={(val) => setFilter(setAction, val)}
            options={[
              { value: 'ALL', label: 'All actions' },
              ...(facets?.actions ?? []).map((a) => ({
                value: a.value,
                label: `${describeAction(a.value)} (${a.count})`,
              })),
            ]}
            icon={ScrollText}
            compact
          />
        </div>

        <div className="w-48 sm:w-56 shrink-0">
          <AdminSelect
            value={entity}
            onChange={(val) => setFilter(setEntity, val)}
            options={[
              { value: 'ALL', label: 'All types' },
              ...(facets?.entities ?? []).map((e) => ({
                value: e.value,
                label: `${e.value} (${e.count})`,
              })),
            ]}
            icon={ScrollText}
            compact
          />
        </div>
      </div>

      {/* ============================== The log ============================== */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-stone-500">
          <Loader2 size={16} className="animate-spin" />
          Loading the activity log…
        </div>
      ) : isError ? (
        <div className="py-20 text-center">
          <p className="text-sm text-rose-700">The activity log could not be loaded.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-2 text-xs font-semibold text-brand-700 underline"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <ScrollText size={26} className="text-stone-300" />
          <p className="text-sm font-medium text-stone-600">Nothing has been recorded yet</p>
          <p className="max-w-xs text-xs text-stone-400">
            Entries appear here as soon as something is changed in the console.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <ul className="divide-y divide-stone-100">
            {items.map((entry) => (
              <li key={entry.id} className="flex gap-3.5 px-4 py-3.5">
                {/* The action */}
                <span
                  className={`mt-0.5 inline-flex h-fit shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${actionTone(
                    entry.action,
                  )}`}
                >
                  {describeAction(entry.action)}
                </span>

                {/* The entry */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-relaxed text-stone-700">
                    {entrySummary(entry)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-stone-400">
                    <span className="font-semibold text-stone-500">
                      {entry.user?.username ?? 'The system'}
                    </span>
                    <span>{entry.entity}</span>
                    <span>{formatAuditDate(entry.createdAt)}</span>
                    {entry.ipAddress && (
                      <span className="inline-flex items-center gap-1">
                        <Globe size={10} />
                        {entry.ipAddress}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ============================== The pagination ============================== */}
      {total > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
          <p className="text-[11px] text-stone-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
            >
              <ChevronLeft size={13} />
              Previous
            </button>

            <span className="px-2 text-[11px] font-semibold text-stone-500">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
            >
              Next
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
