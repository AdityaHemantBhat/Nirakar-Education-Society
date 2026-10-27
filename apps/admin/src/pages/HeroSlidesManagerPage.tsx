import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Plus, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface HeroSlide { id: string; title: string; campus: string; tag: string; image: string }

export const HeroSlidesManagerPage: React.FC = () => {
  const client = useQueryClient();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(slides.length / pageSize));
  const pageSlides = slides.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageOffset = (currentPage - 1) * pageSize;
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const { data: initialSlides = [], isLoading } = useQuery<HeroSlide[]>({
    queryKey: ['hero_slides'],
    queryFn: async () => {
      const response = await fetch('/api/v1/content/hero-slides');
      if (!response.ok) throw new Error('Could not load homepage slides');
      const json = await response.json();
      return Array.isArray(json.data) ? json.data : [];
    },
  });

  useEffect(() => {
    setSlides((current) => initialSlides.length && current.length === 0 ? initialSlides : current);
  }, [initialSlides]);

  const update = (id: string, patch: Partial<HeroSlide>) => {
    setSaveStatus('idle');
    setMessage('');
    setSlides((current) => current.map((slide) => slide.id === id ? { ...slide, ...patch } : slide));
  };

  const upload = async (slideId: string, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
    if (file.size > 15 * 1024 * 1024) throw new Error('Choose an image smaller than 15 MB.');
    setUploadingIndex(slideId);
    setMessage('Optimizing and uploading image…');
    try {
      let preparedFile = file;
      if (!/image\/(webp|avif)/i.test(file.type) && 'createImageBitmap' in window) {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const converted = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
        if (converted && converted.size < file.size) {
          preparedFile = new File([converted], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' });
        }
      }
      const body = new FormData();
      body.append('file', preparedFile);
      body.append('altText', file.name);
      const response = await fetch('/api/v1/content/media/upload', { method: 'POST', credentials: 'include', body });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || 'Image upload failed');
      update(slideId, { image: json.data?.url || `/uploads/${json.data.filename}` });
      setMessage('Image uploaded. Save changes to publish it.');
    } finally { setUploadingIndex(null); }
  };

  const save = async () => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/content/hero-slides', {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || 'Could not save slides');
      setSlides(json.data);
      setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil(json.data.length / pageSize))));
      await client.invalidateQueries({ queryKey: ['hero_slides'] });
      setSaveStatus('saved');
      setMessage('Saved successfully.');
    } catch (error) {
      setSaveStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not save slides');
    } finally { setBusy(false); }
  };

  const add = () => {
    const nextPage = Math.floor(slides.length / pageSize) + 1;
    setSlides((items) => [...items, { id: `slide-${Date.now()}-${Math.random().toString(36).slice(2)}`, title: '', campus: '', tag: '', image: '' }]);
    setSaveStatus('idle');
    setMessage('');
    setCurrentPage(nextPage);
    setSaveStatus('idle');
  };

  return <main className="w-full space-y-6 p-4 sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5">
      <div><p className="text-xs font-bold uppercase tracking-wider text-brand-700">Homepage</p><h1 className="mt-1 text-2xl font-bold text-stone-900">Home Slider</h1><p className="mt-1 text-sm text-stone-500">Manage the scrolling campus cards below the hero. Cards without an image are hidden.</p></div>
      <div className="flex flex-wrap items-center gap-3"><span aria-live="polite" className={`text-sm font-semibold ${saveStatus === 'saved' ? 'text-emerald-700' : saveStatus === 'error' ? 'text-red-700' : 'text-stone-500'}`}>{busy ? 'Saving changes…' : saveStatus === 'saved' ? 'Saved successfully' : saveStatus === 'error' ? 'Save failed — review the message below' : 'Unsaved changes'}</span><button onClick={save} disabled={busy || isLoading || uploadingIndex !== null} className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16}/>{busy ? 'Saving…' : 'Save changes'}</button></div>
    </header>
    {message && <p role="status" className={`rounded-xl border p-3 text-sm ${saveStatus === 'saved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : saveStatus === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-sky-200 bg-sky-50 text-sky-800'}`}>{message}</p>}
    <div className="space-y-4">
      {pageSlides.map((slide, pageIndex) => {
        const index = pageOffset + pageIndex;
        return <article key={slide.id} className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 md:grid-cols-[220px_1fr]">
        <div className="relative min-h-36 overflow-hidden rounded-xl bg-stone-100">
          {slide.image ? <img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover"/> : <div className="flex h-full min-h-36 items-center justify-center text-sm text-stone-400"><ImagePlus size={20} className="mr-2"/>Image required to display</div>}
          <label className="absolute bottom-2 left-2 cursor-pointer rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-stone-800 shadow">
            {uploadingIndex === slide.id ? 'Optimizing…' : slide.image ? 'Replace image' : 'Upload image'}
            <input className="hidden" type="file" accept="image/*" disabled={uploadingIndex !== null} onChange={(e) => { void upload(slide.id, e.target.files?.[0]).catch((error) => setMessage(error.message)); e.currentTarget.value = ''; }}/>
          </label>
        </div>
        <div className="grid content-start gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-stone-600">Card title<input value={slide.title} onChange={(e) => update(slide.id, { title: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"/></label>
          <label className="text-xs font-semibold text-stone-600">Top label<input value={slide.tag} onChange={(e) => update(slide.id, { tag: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"/></label>
          <label className="text-xs font-semibold text-stone-600 sm:col-span-2">Location / campus<input value={slide.campus} onChange={(e) => update(slide.id, { campus: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"/></label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="button" title="Move up" onClick={() => { setSaveStatus('idle'); setMessage(''); setSlides((items) => { if (index === 0) return items; const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; }); }} className="rounded-lg border p-2"><ArrowUp size={16}/></button>
            <button type="button" title="Move down" onClick={() => { setSaveStatus('idle'); setMessage(''); setSlides((items) => { if (index === items.length - 1) return items; const next = [...items]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next; }); }} className="rounded-lg border p-2"><ArrowDown size={16}/></button>
            <button type="button" onClick={() => { setSaveStatus('idle'); setMessage(''); setSlides((items) => items.filter((_, i) => i !== index)); setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil((slides.length - 1) / pageSize)))); }} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"><Trash2 size={15}/>Remove card</button>
          </div>
        </div>
      </article>;
      })}
      {!slides.length && !isLoading && <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">No homepage feature cards configured.</p>}
    </div>
    {pageCount > 1 && <nav aria-label="Home Slider pages" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3">
      <p className="text-sm text-stone-600">Showing {pageOffset + 1}–{Math.min(pageOffset + pageSize, slides.length)} of {slides.length} slides</p>
      <div className="flex items-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><span className="px-2 text-sm font-medium text-stone-700">Page {currentPage} of {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setCurrentPage((page) => page + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div>
    </nav>}
    <button type="button" onClick={add} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700"><Plus size={16}/>Add feature card</button>
  </main>;
};
