import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, MessageSquare, RefreshCw, Trash2 } from 'lucide-react';
import { fetchWithAdminSession } from '../lib/admissions.js';

type AdminComment = {
  id: string;
  authorName: string;
  email: string | null;
  place: string | null;
  content: string;
  targetType: string;
  targetId: string | null;
  status: string;
  createdAt: string;
};

export const CommentsManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const { data: comments = [], isLoading, isError, isFetching, refetch } = useQuery<AdminComment[]>({
    queryKey: ['adminComments'],
    queryFn: async () => {
      const response = await fetchWithAdminSession('/api/v1/content/admin/comments');
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to load comments.');
      }
      return result.data as AdminComment[];
    },
  });

  const deleteComment = async (comment: AdminComment) => {
    if (!window.confirm(`Delete the comment from ${comment.authorName}? This cannot be undone.`)) return;
    setBusyId(comment.id);
    setMessage(null);
    try {
      const response = await fetchWithAdminSession(`/api/v1/content/admin/comments/${comment.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || 'Unable to delete comment.');
      setMessage('Comment deleted.');
      await queryClient.invalidateQueries({ queryKey: ['adminComments'] });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete comment.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">Moderation</p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">Public comments</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-stone-500">Review comments submitted on public events and remove anything that violates the community rules.</p>
        </div>
        <button type="button" onClick={() => void refetch()} className="inline-flex items-center gap-2 self-start rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50">
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : undefined} /> Refresh
        </button>
      </header>

      {message && <div className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">{message}</div>}
      {isError && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertTriangle size={16} /> Unable to load comments.</div>}

      <section className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-stone-500"><RefreshCw size={16} className="animate-spin" /> Loading comments…</div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-stone-500"><MessageSquare size={28} /><p className="text-sm">No comments to review.</p></div>
        ) : (
          <div className="divide-y divide-stone-100">
            {comments.map((comment) => (
              <article key={comment.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
                    <strong className="text-sm text-stone-900">{comment.authorName}</strong>
                    <span>·</span><span>{comment.email || 'No email'}</span>
                    {comment.place && <><span>·</span><span>{comment.place}</span></>}
                    <span>·</span><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString()}</time>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-700">{comment.content}</p>
                  <p className="text-[11px] uppercase tracking-wide text-stone-400">{comment.targetType}{comment.targetId ? ` · ${comment.targetId}` : ''} · {comment.status}</p>
                </div>
                <button type="button" disabled={busyId === comment.id} onClick={() => void deleteComment(comment)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Delete comment from ${comment.authorName}`}>
                  <Trash2 size={14} /> {busyId === comment.id ? 'Deleting…' : 'Delete'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
