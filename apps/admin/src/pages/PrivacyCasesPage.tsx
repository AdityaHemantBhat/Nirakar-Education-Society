import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { fetchWithAdminSession } from '../lib/admissions.js';

type CaseItem = {
  id: string;
  reference: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  type?: string;
  category?: string;
  subject?: string;
  restricted?: boolean;
};
type CaseDetail = CaseItem & { details?: string; description?: string; events: Array<{ id: string; kind: string; message: string; isInternal: boolean; createdAt: string }> };

async function readJson<T>(path: string): Promise<T> {
  const response = await fetchWithAdminSession(path);
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error?.message || 'Unable to load cases.');
  return result.data as T;
}

import { AdminSelect, SelectOption } from '../components/AdminSelect.js';

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Received',
  UNDER_REVIEW: 'Under Review',
  AWAITING_INFORMATION: 'Awaiting Information',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const CASE_STATUS_OPTIONS: SelectOption[] = [
  { value: 'RECEIVED', label: 'Received' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'AWAITING_INFORMATION', label: 'Awaiting Information' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export const PrivacyCasesPage: React.FC = () => {
  const client = useQueryClient();
  const [selected, setSelected] = React.useState<{ kind: 'grievances' | 'requests'; id: string } | null>(null);
  const [status, setStatus] = React.useState('UNDER_REVIEW');
  const [message, setMessage] = React.useState('');
  const [isInternal, setIsInternal] = React.useState(true);
  const [notice, setNotice] = React.useState('');

  const [saving, setSaving] = React.useState(false);

  const grievances = useQuery({ queryKey: ['privacyCases', 'grievances'], queryFn: () => readJson<CaseItem[]>('/api/v1/privacy/admin/grievances') });
  const requests = useQuery({ queryKey: ['privacyCases', 'requests'], queryFn: () => readJson<CaseItem[]>('/api/v1/privacy/admin/requests') });
  const detail = useQuery({
    queryKey: ['privacyCase', selected],
    queryFn: () => readJson<CaseDetail>(`/api/v1/privacy/admin/${selected!.kind === 'requests' ? 'requests' : 'grievances'}/${selected!.id}`),
    enabled: !!selected,
  });

  React.useEffect(() => {
    if (detail.data?.status) {
      setStatus(detail.data.status);
    }
  }, [detail.data?.status]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || saving) return;
    setSaving(true);
    setNotice('');
    try {
      const response = await fetchWithAdminSession(`/api/v1/privacy/admin/${selected.kind === 'requests' ? 'requests' : 'grievances'}/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(message.trim() ? { message: message.trim(), isInternal } : {}) }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setNotice(result.error?.message || 'Unable to update case.');
        return;
      }
      setMessage('');
      setNotice('Case updated successfully.');
      if (result.data?.status) {
        setStatus(result.data.status);
      }
      await Promise.all([
        client.invalidateQueries({ queryKey: ['privacyCases'] }),
        client.invalidateQueries({ queryKey: ['privacyCase', selected] }),
      ]);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to update case.');
    } finally {
      setSaving(false);
    }
  };

  const loading = grievances.isPending || requests.isPending;
  const error = grievances.error || requests.error;
  const allItems = [...(grievances.data ?? []).map((item) => ({ ...item, kind: 'grievances' as const })), ...(requests.data ?? []).map((item) => ({ ...item, kind: 'requests' as const }))].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">People &amp; support</p><h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">Privacy requests &amp; grievances</h1><p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-stone-500">Submissions from the public are stored in the database and shown here for authorized staff review. Do not put sensitive personal details in internal notes.</p></div>
      <button type="button" onClick={() => { void grievances.refetch(); void requests.refetch(); }} className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"><RefreshCw size={14} /> Refresh</button>
    </header>
    {notice && <p role="status" className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">{notice}</p>}
    {error && <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertTriangle size={16} />{error instanceof Error ? error.message : 'Unable to load the case queue.'}</div>}
    <section className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      {loading ? <div className="p-10 text-center text-sm text-stone-500">Loading cases…</div> : allItems.length === 0 ? <div className="p-10 text-center text-sm text-stone-500">No privacy requests or grievances have been submitted.</div> : <div className="divide-y divide-stone-100">{allItems.map((item) => <button type="button" key={`${item.kind}:${item.id}`} onClick={() => { setSelected({ kind: item.kind, id: item.id }); setNotice(''); }} className="flex w-full flex-col gap-2 p-4 text-left transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between"><span className="min-w-0"><span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-stone-900"><ShieldAlert size={15} className="text-brand-700" />{item.reference}<span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-stone-600">{item.kind === 'grievances' ? 'Grievance' : `Rights: ${item.type}`}</span>{item.restricted && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-rose-700">Restricted</span>}</span><span className="mt-1 block truncate text-xs text-stone-500">{item.subject || item.name} · {item.email}</span></span><span className="shrink-0 text-xs font-medium text-stone-600">{STATUS_LABELS[item.status] || item.status} · {new Date(item.createdAt).toLocaleDateString()}</span></button>)}</div>}
    </section>
    {selected && <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">Case detail</p><h2 className="mt-1 text-xl font-bold text-stone-900">{detail.data?.reference ?? 'Loading…'}</h2></div><button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600">Close</button></div>
      {detail.isError && <p role="alert" className="mt-4 text-sm text-red-700">Could not load case details: {detail.error instanceof Error ? detail.error.message : 'Unknown error'}</p>}
      {detail.data && <div className="mt-5 grid gap-5 lg:grid-cols-2"><div className="space-y-3 text-sm"><p><strong>From:</strong> {detail.data.name} · {detail.data.email}</p><p><strong>Subject:</strong> {detail.data.subject || detail.data.type}</p><p className="whitespace-pre-wrap rounded-lg bg-stone-50 p-4 text-stone-700">{detail.data.description || detail.data.details}</p><div><h3 className="font-semibold text-stone-900">History</h3><ol className="mt-2 space-y-2">{detail.data.events?.map((event) => <li key={event.id} className="border-l-2 border-stone-200 pl-3"><p className="text-xs text-stone-500">{event.kind} · {new Date(event.createdAt).toLocaleString()} {event.isInternal ? '· Internal' : '· Public'}</p><p className="mt-0.5 text-sm text-stone-700">{event.message}</p></li>)}</ol></div></div>
      <form onSubmit={(event) => void save(event)} className="space-y-4 rounded-xl border border-stone-200 p-4">
        <h3 className="font-semibold text-stone-900">Update case</h3>
        <div>
          <AdminSelect
            label="Status"
            value={status}
            onChange={(val) => setStatus(val)}
            options={CASE_STATUS_OPTIONS}
            icon={ShieldAlert}
            compact
          />
        </div>
        <label className="block text-xs font-semibold text-stone-600">Note or response<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={3000} rows={4} className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm" placeholder="Record a concise action or response" /></label><label className="flex items-center gap-2 text-xs text-stone-600"><input type="checkbox" checked={isInternal} onChange={(event) => setIsInternal(event.target.checked)} /> Internal note (not visible in public tracking)</label><button type="submit" disabled={saving} className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50 cursor-pointer">{saving ? 'Saving update…' : 'Save update'}</button><p className="text-[11px] leading-relaxed text-stone-500">Public response text is displayed in the tracking portal. Only authorized administrators can manage cases; confirm the Society’s approved response timelines and escalation policy before operational use.</p></form></div>}
    </section>}
  </div>;
};
