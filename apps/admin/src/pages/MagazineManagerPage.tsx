import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { BookOpen, Upload, RefreshCw, Eye, EyeOff, Send, Trash2, CheckCircle2, AlertCircle, Clock3 } from 'lucide-react';
import { getPublicSiteUrl } from '../lib/site.js';
import { fetchWithAdminSession } from '../lib/admissions.js';
import { socketOrigin } from '../lib/api.js';

export const MagazineManagerPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [publishDate, setPublishDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    return new Date(today.getTime() - offset * 60_000).toISOString().slice(0, 10);
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingIssueId, setDeletingIssueId] = useState<string | null>(null);
  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [processingIssues, setProcessingIssues] = useState<Record<string, { status: string; progress: number; message: string }>>({});
  const [visibleIssueStatus, setVisibleIssueStatus] = useState<{ status: string; progress: number; message: string } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket: Socket = io(socketOrigin(), { transports: ['websocket', 'polling'], reconnection: true, withCredentials: true });
    const refresh = (event: { issueId: string; status: string; action?: 'updated' | 'deleted'; progress?: number; message?: string }) => {
      if (!event.action) {
        const nextStatus = {
          status: event.status,
          progress: event.progress ?? 0,
          message: event.message || '',
        };
        if (event.status === 'PUBLISHED' || event.status === 'DRAFT') {
          setProcessingIssues((current) => {
            const updated = { ...current };
            delete updated[event.issueId];
            return updated;
          });
        } else {
          setProcessingIssues((current) => ({ ...current, [event.issueId]: nextStatus }));
        }
        setVisibleIssueStatus(nextStatus);
        if (event.status === 'PUBLISHED' || event.status === 'DRAFT') {
          setUploading(false);
          setUploadProgress(event.status === 'PUBLISHED' ? 100 : 0);
          setStatusMessage(event.status === 'PUBLISHED' ? 'Issue published and ready to read.' : event.message || 'PDF analysis failed. Check the issue details and try again.');
          setTimeout(() => {
            setVisibleIssueStatus((current) => current?.status === event.status ? null : current);
          }, 6000);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['admin_magazines'] });
      queryClient.invalidateQueries({ queryKey: ['magazine_calendar'] });
    };
    socket.on('magazine:updated', refresh);
    return () => {
      socket.off('magazine:updated', refresh);
      socket.disconnect();
    };
  }, [queryClient]);

  // Fetch recent issues
  const { data: issues = [], refetch } = useQuery({
    queryKey: ['admin_magazines'],
    queryFn: async () => {
      const res = await fetch('/api/v1/magazine/admin/issues');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
  });

  const handleDelete = async (issue: any) => {
    const confirmed = window.confirm(`Delete “${issue.title}” (${issue.publishDate})? This permanently removes the issue, its source PDF, and generated pages.`);
    if (!confirmed) return;

    setDeletingIssueId(issue.id);
    setDeleteError('');
    try {
      const res = await fetchWithAdminSession(`/api/v1/magazine/admin/${encodeURIComponent(issue.id)}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error?.message || 'Could not delete this magazine issue.');
      queryClient.invalidateQueries({ queryKey: ['admin_magazines'] });
      queryClient.invalidateQueries({ queryKey: ['magazine_calendar'] });
      await refetch();
    } catch (err: any) {
      setDeleteError(err.message || 'Could not delete this magazine issue.');
    } finally {
      setDeletingIssueId(null);
    }
  };

  const handlePublication = async (issue: any) => {
    const nextStatus = issue.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED';
    const action = nextStatus === 'ARCHIVED' ? 'unpublish' : 'publish';
    const detail = nextStatus === 'ARCHIVED'
      ? 'It will disappear from the public archive, but its PDF and pages will be kept.'
      : 'It will become available to readers in the public archive.';
    if (!window.confirm(`${action === 'unpublish' ? 'Unpublish' : 'Publish'} “${issue.title}” (${issue.publishDate})? ${detail}`)) return;

    setUpdatingIssueId(issue.id);
    setActionError('');
    try {
      const res = await fetchWithAdminSession(`/api/v1/magazine/admin/${encodeURIComponent(issue.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error?.message || `Could not ${action} this issue.`);
      queryClient.invalidateQueries({ queryKey: ['admin_magazines'] });
      queryClient.invalidateQueries({ queryKey: ['magazine_calendar'] });
      await refetch();
    } catch (err: any) {
      setActionError(err.message || `Could not ${action} this issue.`);
    } finally {
      setUpdatingIssueId(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      alert('Please select a PDF publication document');
      return;
    }

    setUploading(true);
    setUploadProgress(20);
    setStatusMessage('Uploading PDF and initiating deterministic analysis pipeline...');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('publishDate', publishDate);
    formData.append('pdf', pdfFile);

    try {
      setUploadProgress(50);
      const res = await fetch('/api/v1/magazine/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to upload and process issue');
      }

      const issueId = json.data?.id;
      if (issueId) {
        const current = (queryClient.getQueryData<any[]>(['admin_magazines']) || []).find((issue) => issue.id === issueId);
        if (current?.status === 'PUBLISHED') {
          setVisibleIssueStatus({ status: 'PUBLISHED', progress: 100, message: 'Issue published and ready to read.' });
          setUploadProgress(100);
          setStatusMessage('Issue published and ready to read.');
          setUploading(false);
        }
      }
      setTitle('');
      setPdfFile(null);
      const refreshed = await refetch();
      const currentIssue = issueId
        ? (refreshed.data || []).find((issue: any) => issue.id === issueId)
        : null;

      if (currentIssue?.status === 'PUBLISHED') {
        setProcessingIssues((current) => {
          const updated = { ...current };
          delete updated[issueId];
          return updated;
        });
        setVisibleIssueStatus({ status: 'PUBLISHED', progress: 100, message: 'Issue published and ready to read.' });
        setUploadProgress(100);
        setStatusMessage('Issue published and ready to read.');
        setUploading(false);
      } else if (currentIssue?.status === 'DRAFT') {
        setProcessingIssues((current) => {
          const updated = { ...current };
          delete updated[issueId];
          return updated;
        });
        setVisibleIssueStatus({ status: 'DRAFT', progress: 0, message: 'PDF analysis failed. Check the issue and try again.' });
        setUploadProgress(0);
        setStatusMessage('PDF analysis failed. Check the issue and try again.');
        setUploading(false);
      } else {
        setVisibleIssueStatus({ status: 'PROCESSING', progress: 0, message: 'PDF received. Preparing analysis…' });
        if (issueId) {
          setProcessingIssues((current) => ({
            ...current,
            [issueId]: { status: 'PROCESSING', progress: 0, message: 'PDF received. Preparing analysis…' },
          }));
        }
        setUploadProgress(100);
        setStatusMessage('PDF received. Preparing analysis…');
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Upload error');
      setVisibleIssueStatus({ status: 'FAILED', progress: 0, message: err.message || 'Upload error' });
      setUploading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#f6f4ef] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px] space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-sm sm:px-7">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-700">Publication studio</p>
            <h1 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">School Magazine Manager</h1>
            <p className="mt-1 max-w-2xl text-sm text-stone-600">Upload an edition PDF. Its pages and searchable text are extracted before it appears in the public archive.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#f6f4ef] px-4 py-3">
            <span className="font-serif text-3xl font-bold text-stone-900">{issues.filter((issue: any) => issue.status === 'PUBLISHED').length}</span>
            <span className="max-w-20 text-[10px] font-semibold uppercase leading-tight tracking-wider text-stone-500">Published issues</span>
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(340px,0.72fr)_minmax(0,1.8fr)]">
          {/* Upload Form */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-stone-100 pb-4 text-brand-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50"><Upload size={19} /></div>
              <div>
                <h2 className="font-serif text-lg font-bold">Add an edition</h2>
                <p className="text-xs text-stone-500">PDF files up to 100 MB</p>
              </div>
            </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                Publication Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Canacona Jubilee Edition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                Publication Date *
              </label>
              <input
                type="date"
                required
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-mono focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                PDF Document (Max 100MB) *
              </label>
              <input
                type="file"
                required
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-800 hover:file:bg-brand-100"
              />
            </div>

            {(uploading || visibleIssueStatus) && (
              <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                  {visibleIssueStatus?.status === 'PUBLISHED' ? <CheckCircle2 size={15} className="text-emerald-600" /> :
                    visibleIssueStatus?.status === 'FAILED' || visibleIssueStatus?.status === 'DRAFT' ? <AlertCircle size={15} className="text-red-600" /> : <Clock3 size={15} className="text-amber-600" />}
                  <span>{visibleIssueStatus?.status === 'PUBLISHED' ? 'Issue published and ready to read.' : visibleIssueStatus?.message || statusMessage}</span>
                  {visibleIssueStatus && <span className="ml-auto uppercase text-[10px] tracking-wide">{visibleIssueStatus.status}</span>}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                  <div
                    className={`h-full transition-all duration-300 ${visibleIssueStatus?.status === 'PUBLISHED' ? 'bg-emerald-600' : visibleIssueStatus?.status === 'FAILED' || visibleIssueStatus?.status === 'DRAFT' ? 'bg-red-500' : 'bg-brand-700'}`}
                    style={{ width: `${visibleIssueStatus?.progress ?? uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-serif text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <BookOpen size={16} />
              <span>{uploading ? 'Processing Issue...' : 'Upload & Process Issue'}</span>
            </button>
          </form>
          </section>

          {/* Magazine Collection */}
          <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">Your collection</p>
              <h2 className="font-serif text-xl font-bold text-stone-900">Magazine editions</h2>
            </div>
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"
              title="Refresh List"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {(deleteError || actionError) && <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{deleteError || actionError}</p>}
          <div className="space-y-3">
            {issues.length > 0 ? (
              issues.map((iss: any) => (
                <div
                  key={iss.id}
                  className="flex flex-col gap-4 border-b border-stone-100 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-200 shadow-sm">
                      {iss.coverUrl ? <img src={iss.coverUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-[#111b5e] text-white"><BookOpen size={20} /></div>}
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-base font-bold text-ink">{iss.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${iss.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : iss.status === 'ARCHIVED' ? 'bg-stone-100 text-stone-600' : iss.status === 'DRAFT' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                          {iss.status === 'PUBLISHED' ? 'Published' : iss.status === 'ARCHIVED' ? 'Unpublished' : iss.status === 'DRAFT' ? 'Needs attention' : 'Analyzing'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        <span>{iss.publishDate}</span>
                        <span>•</span>
                        <span>{iss.pageCount || 0} pages</span>
                        <span>•</span>
                        <span>~{iss.readingMinutes || 0} min</span>
                      </div>
                      {iss.status !== 'PUBLISHED' && iss.status !== 'ARCHIVED' && (
                        <div className="max-w-md space-y-1">
                          <p className="text-[11px] text-stone-500">{processingIssues[iss.id]?.message || (iss.status === 'DRAFT' ? 'PDF analysis failed. Re-upload this edition to try again.' : 'Processing PDF')}</p>
                          {iss.status !== 'DRAFT' && <div className="h-1 w-full overflow-hidden rounded-full bg-stone-200"><div className="h-full bg-brand-700 transition-all" style={{ width: `${processingIssues[iss.id]?.progress ?? 0}%` }} /></div>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:shrink-0">
                    <span className="text-[10px] text-stone-400">{iss.status === 'PUBLISHED' ? 'Free to read' : 'Not in public archive yet'}</span>
                    {iss.status === 'PUBLISHED' && <a
                      href={`${getPublicSiteUrl()}/magazine/issue/${encodeURIComponent(iss.publishDate)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-stone-50"
                    >
                      <Eye size={13} />
                      <span>Open reader</span>
                    </a>}
                    {(iss.status === 'PUBLISHED' || iss.status === 'ARCHIVED') && (
                      <button
                        type="button"
                        onClick={() => handlePublication(iss)}
                        disabled={updatingIssueId === iss.id || deletingIssueId === iss.id}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${iss.status === 'PUBLISHED' ? 'border-amber-200 bg-white text-amber-800 hover:bg-amber-50' : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'}`}
                      >
                        {updatingIssueId === iss.id ? <RefreshCw size={13} className="animate-spin" /> : iss.status === 'PUBLISHED' ? <EyeOff size={13} /> : <Send size={13} />}
                        <span>{updatingIssueId === iss.id ? 'Saving…' : iss.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(iss)}
                      disabled={deletingIssueId === iss.id || updatingIssueId === iss.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Delete ${iss.title}`}
                    >
                      <Trash2 size={13} />
                      <span>{deletingIssueId === iss.id ? 'Deleting…' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-stone-500">
                <div className="mb-3 rounded-2xl bg-stone-100 p-4"><BookOpen size={24} /></div>
                <p className="font-serif text-base font-semibold text-stone-700">Your archive starts here</p>
                <p className="mt-1 text-xs">Upload a PDF to create the first edition.</p>
              </div>
            )}
          </div>
          </section>
        </div>
      </div>
    </div>
  );
};
