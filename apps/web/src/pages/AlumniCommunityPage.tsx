import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowDown, ImagePlus, LoaderCircle, MessageCircle, Pencil, Send, Trash2, X } from 'lucide-react';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { Navbar } from '../components/Navbar.js';
import { useCurrentAuthUser } from '../hooks/useCurrentAuthUser.js';
import { apiUrl } from '../lib/api.js';

type Media = { id: string; url: string; mediaType: 'IMAGE' | 'VIDEO'; mimeType: string; order: number };
type Post = { id: string; title: string; body: string; createdAt: string; authorId: string; author: { username: string; alumniProfile: { firstName: string; middleName?: string | null; lastName: string; school: string; batchYear: number; photoUrl?: string | null; verificationLevel: string } | null }; media: Media[] };
type Upload = { id: string; url: string; mediaType: 'IMAGE' | 'VIDEO'; mimeType: string };
const queryKey = ['community_posts'];
const authQueryKey = ['current-auth-user'];
const publicUrl = (url: string) => apiUrl(url.startsWith('http') ? url : url.startsWith('/uploads/') ? url : `/api/v1${url}`);

export const AlumniCommunityPage: React.FC = () => {
  const user = useCurrentAuthUser();
  const client = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [media, setMedia] = useState<Upload[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [older, setOlder] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const authLoading = client.getQueryState(authQueryKey)?.status === 'pending';
  const isAlumni = user?.role === 'ALUMNI';

  const feed = useQuery<Post[]>({
    queryKey,
    enabled: isAlumni,
    queryFn: async () => {
      const response = await fetch('/api/v1/community-posts/feed?limit=15', { credentials: 'same-origin' });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || 'Could not load the community feed.');
      setCursor(json.meta?.cursor || null);
      return json.data || [];
    },
  });
  useEffect(() => { setOlder([]); setCursor(null); }, [user?.id]);

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true); setError('');
    try {
      for (const file of Array.from(files)) {
        if (media.length >= 4) throw new Error('A post can include up to four images or videos.');
        const form = new FormData(); form.append('file', file);
        const response = await fetch('/api/v1/community-posts/media', { method: 'POST', body: form, credentials: 'same-origin' });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error?.message || json.message || 'Upload failed.');
        setMedia((current) => current.length < 4 ? [...current, json.data] : current);
      }
    } catch (reason: any) { setError(reason.message || 'Upload failed.'); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ''; }
  };

  const publish = async (event: React.FormEvent) => {
    event.preventDefault(); if (!body.trim()) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/v1/community-posts', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim(), body: body.trim(), mediaIds: media.map((item) => item.id) }) });
      const json = await response.json(); if (!response.ok) throw new Error(json.error?.message || json.message || 'Could not publish your post.');
      client.setQueryData<Post[]>(queryKey, (current = []) => [json.data, ...current]); setTitle(''); setBody(''); setMedia([]);
    } catch (reason: any) { setError(reason.message || 'Could not publish your post.'); }
    finally { setBusy(false); }
  };

  const loadMore = async () => {
    if (!cursor) return;
    try {
      const response = await fetch(`/api/v1/community-posts/feed?limit=15&cursor=${encodeURIComponent(cursor)}`, { credentials: 'same-origin' });
      const json = await response.json(); if (!response.ok) throw new Error(json.error?.message || 'Could not load older posts.');
      setOlder((current) => [...current, ...(json.data || [])]); setCursor(json.meta?.cursor || null);
    } catch (reason: any) { setError(reason.message || 'Could not load older posts.'); }
  };

  const saveEdit = async (postId: string) => {
    try {
      const response = await fetch(`/api/v1/community-posts/${encodeURIComponent(postId)}`, { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editTitle, body: editBody }) });
      const json = await response.json(); if (!response.ok) throw new Error(json.error?.message || 'Could not update post.');
      client.setQueryData<Post[]>(queryKey, (current = []) => current.map((post) => post.id === postId ? json.data : post)); setEditing(null);
    } catch (reason: any) { setError(reason.message || 'Could not update post.'); }
  };

  const deletePost = async (postId: string) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      const response = await fetch(`/api/v1/community-posts/${encodeURIComponent(postId)}`, { method: 'DELETE', credentials: 'same-origin' });
      const json = await response.json(); if (!response.ok) throw new Error(json.error?.message || 'Could not delete post.');
      client.setQueryData<Post[]>(queryKey, (current = []) => current.filter((post) => post.id !== postId));
    } catch (reason: any) { setError(reason.message || 'Could not delete post.'); }
  };

  const posts = [...(feed.data || []), ...older];
  return <div className="min-h-screen bg-[#f6f4ef] text-stone-900">
    <Helmet><title>Alumni Community | Shree Nirakar Education Society</title><meta name="description" content="Reconnect with the Nirakar alumni community and share memories, milestones, and updates." /></Helmet>
    <Navbar />
    <section className="relative isolate -mt-0 w-full overflow-hidden bg-[#0b132b] px-4 pb-12 pt-12 text-white sm:px-8 sm:pb-14 sm:pt-16 lg:-mt-[78px] lg:px-12 lg:pb-16 lg:pt-28 xl:px-16 2xl:px-24"><HeroWaves opacity={0.85} /><div className="relative z-10 mx-auto w-full max-w-[1850px]"><Link to="/alumni" className="inline-flex rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10">Browse alumni directory →</Link><div className="mx-auto mt-7 max-w-4xl text-center"><p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">Nirakar alumni • Mashem, Canacona</p><h1 className="mt-4 font-serif text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">The Alumni Commons</h1><p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-stone-300 sm:text-base">Reconnect, share what you’re building, and keep school memories alive.</p></div></div></section>
    <SectionEdge variant="wave" color="#f6f4ef" bgColor="#0b132b" height={36} withGoldLine />
    <main className="min-h-screen w-full bg-[#f6f4ef] px-4 py-8 text-stone-900 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 lg:py-10"><div className="mx-auto grid w-full max-w-[1850px] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"><section className="min-w-0 space-y-5">
      {authLoading ? <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500"><LoaderCircle className="mx-auto mb-2 animate-spin" size={20} />Checking your alumni sign-in…</div> : !isAlumni ? <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10"><span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900">Alumni space</span><h2 className="mt-4 font-serif text-2xl font-bold">Sign in to join the conversation</h2><p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">The Commons is free for logged-in alumni. Sign in or register to read and share posts.</p><div className="mt-5 flex flex-wrap gap-3"><Link to="/alumni/login" className="rounded-xl bg-[#111b5e] px-5 py-3 text-xs font-bold text-white">Alumni sign in</Link><Link to="/alumni/register" className="rounded-xl border border-stone-300 px-5 py-3 text-xs font-bold text-stone-700">Create an alumni account</Link></div></div> : <>
        <form onSubmit={publish} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111b5e] font-serif text-sm font-bold text-white">{user?.username.slice(0,1).toUpperCase()}</div><div><p className="text-sm font-bold">Share with the alumni community</p><p className="text-[11px] text-stone-500">Visible to signed-in alumni · no subscription required</p></div></div><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={140} placeholder="Short title (optional)" className="mb-3 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-600" /><textarea value={body} onChange={(event) => setBody(event.target.value)} required maxLength={5000} rows={4} placeholder="Share a reunion, milestone, memory, or update…" className="w-full resize-y rounded-xl border border-stone-200 px-4 py-3 text-sm leading-6 outline-none focus:border-amber-600" />{media.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{media.map((item) => <div key={item.id} className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-100">{item.mediaType === 'VIDEO' ? <video src={publicUrl(item.url)} controls className="aspect-square w-full object-cover" /> : <img src={publicUrl(item.url)} alt="Post attachment preview" className="aspect-square w-full object-cover" />}<button type="button" onClick={() => setMedia((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Remove attachment" className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"><X size={14} /></button></div>)}</div>}{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4"><div className="flex items-center gap-2"><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm,video/quicktime" multiple className="hidden" onChange={(event) => void uploadFiles(event.target.files)} /><button type="button" disabled={uploading || media.length >= 4} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"><ImagePlus size={15} />Add photo/video</button>{uploading && <span className="inline-flex items-center gap-1 text-[11px] text-stone-500"><LoaderCircle size={13} className="animate-spin" />Uploading…</span>}<span className="hidden text-[10px] text-stone-400 sm:inline">Up to 4 attachments · 50 MB each</span></div><button type="submit" disabled={busy || uploading || !body.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#111b5e] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#0b132b] disabled:opacity-50">{busy ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}Share post</button></div></form>
        <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3"><div><h2 className="font-serif text-base font-bold">Community feed</h2><p className="text-[11px] text-stone-500">Latest updates from fellow alumni</p></div><span className="rounded-full bg-[#111b5e]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#111b5e]">Newest</span></div>
        {feed.isLoading && <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500"><LoaderCircle className="mx-auto mb-2 animate-spin" size={20} />Loading the alumni feed…</div>}{feed.isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Could not load the alumni feed. Refresh and try again.</div>}{!feed.isLoading && !feed.isError && posts.length === 0 && <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-900"><MessageCircle size={20} /></div><h3 className="mt-4 font-serif text-lg font-bold">Start the conversation</h3><p className="mt-1 text-sm text-stone-500">Share a memory, reunion plan, or milestone.</p></div>}
        {posts.map((post) => { const profile = post.author.alumniProfile; const author = profile ? [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') : post.author.username; const owns = post.authorId === user?.id; return <article key={post.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"><div className="flex min-w-0 items-start gap-3 px-5 pt-5"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 font-serif font-bold text-[#111b5e]">{profile?.photoUrl ? <img src={publicUrl(profile.photoUrl)} alt={`${author} profile`} className="block h-full w-full shrink-0 rounded-full object-cover" /> : author.slice(0,1).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2"><span className="text-sm font-bold">{author}</span>{profile && ['VERIFIED','TRUSTED'].includes(profile.verificationLevel) && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Verified alum</span>}<span className="text-[11px] text-stone-400">· {new Date(post.createdAt).toLocaleDateString()}</span></div><p className="mt-0.5 text-[11px] text-stone-500">{profile?.school.replaceAll('_',' ')}{profile?.batchYear ? ` · Class of ${profile.batchYear}` : ''}</p></div>{owns && <div className="flex gap-1"><button type="button" onClick={() => { setEditing(post.id); setEditTitle(post.title); setEditBody(post.body); }} aria-label="Edit post" className="rounded-lg p-2 text-stone-400 hover:bg-stone-100"><Pencil size={15} /></button><button type="button" onClick={() => void deletePost(post.id)} aria-label="Delete post" className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button></div>}</div><div className="px-5 pb-4 pt-4">{editing === post.id ? <div className="space-y-2"><input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={140} placeholder="Short title (optional)" className="w-full rounded-xl border border-stone-200 p-3 text-sm" /><textarea value={editBody} onChange={(event) => setEditBody(event.target.value)} rows={4} maxLength={5000} className="w-full rounded-xl border border-stone-200 p-3 text-sm" /><div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-lg px-3 py-2 text-xs text-stone-600">Cancel</button><button type="button" onClick={() => void saveEdit(post.id)} className="rounded-lg bg-[#111b5e] px-4 py-2 text-xs font-bold text-white">Save</button></div></div> : <><h3 className="font-serif text-lg font-bold leading-snug">{post.title || (post.body.length > 120 ? `${post.body.slice(0,120).trimEnd()}…` : '')}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">{post.body}</p></>}</div>{post.media.length > 0 && <div className={`grid gap-1 overflow-hidden ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>{post.media.map((item) => item.mediaType === 'VIDEO' ? <video key={item.id} src={publicUrl(item.url)} controls preload="metadata" className="max-h-[560px] w-full bg-black object-contain" /> : <img key={item.id} src={publicUrl(item.url)} alt="Alumni community post" loading="lazy" className="max-h-[560px] w-full bg-stone-100 object-contain" />)}</div>}<footer className="flex items-center gap-2 border-t border-stone-100 px-5 py-3 text-[11px] text-stone-500"><MessageCircle size={14} />Community post</footer></article>; })}
        {cursor && <button type="button" onClick={() => void loadMore()} className="w-full rounded-xl border border-stone-200 bg-white py-3 text-xs font-bold text-[#111b5e] hover:bg-stone-50">Load older posts <ArrowDown size={14} className="ml-1 inline" /></button>}
      </>}</section><aside className="hidden space-y-4 lg:block"><div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">A shared legacy</p><h2 className="mt-2 font-serif text-lg font-bold">Nirakar, wherever life takes you.</h2><p className="mt-2 text-xs leading-5 text-stone-600">Reconnect with classmates, share good news, and celebrate the people and places that made your school years memorable.</p><Link to="/alumni" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#111b5e]">Find a classmate →</Link></div><div className="rounded-2xl border border-amber-200/70 bg-[#fffaf0] p-5"><h3 className="font-serif text-sm font-bold">Community guidelines</h3><ul className="mt-3 space-y-2 text-[11px] leading-5 text-stone-600"><li>• Be kind and respectful.</li><li>• Share only media you have permission to post.</li><li>• Keep personal contact details private.</li><li>• Never include sensitive records.</li></ul></div></aside></div></main><Footer />
  </div>;
};
