import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Save, Sparkles, Eye, EyeOff } from 'lucide-react';
import { fetchWithAdminSession } from '../lib/admissions.js';

interface PopupData {
  title: string | null;
  body: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  visible: boolean;
  ctaText: string | null;
  ctaUrl: string | null;
}

export const HomepagePopupManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<PopupData | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [uploading, setUploading] = useState(false);

  const { data: initialPopup, isLoading } = useQuery<PopupData>({
    queryKey: ['admin_homepage_popup'],
    queryFn: async () => {
      const response = await fetchWithAdminSession('/api/v1/admissions/popup');
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || 'Could not load homepage popup settings');
      return json.data;
    },
  });

  useEffect(() => {
    if (initialPopup && !draft) {
      setDraft({
        title: initialPopup.title || '',
        body: initialPopup.body || '',
        mediaUrl: initialPopup.mediaUrl || '',
        mediaType: initialPopup.mediaType || 'image',
        visible: initialPopup.visible !== false,
        ctaText: initialPopup.ctaText || '',
        ctaUrl: initialPopup.ctaUrl || '',
      });
    }
  }, [initialPopup, draft]);

  const uploadImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
    if (file.size > 15 * 1024 * 1024) throw new Error('Image must be smaller than 15 MB.');
    setUploading(true);
    setMessage('Optimizing and uploading image...');
    try {
      let preparedFile = file;
      if (!/image\/(webp|avif)/i.test(file.type) && 'createImageBitmap' in window) {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const converted = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
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
      const url = json.data?.url || `/uploads/${json.data.filename}`;
      setDraft((cur) => (cur ? { ...cur, mediaUrl: url, mediaType: 'image' } : cur));
      setMessage('Image uploaded successfully. Click Save changes below to publish.');
      setSaveStatus('idle');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Image upload failed');
      setSaveStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetchWithAdminSession('/api/v1/admissions/admin/popup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title?.trim() || null,
          body: draft.body?.trim() || null,
          mediaUrl: draft.mediaUrl?.trim() || null,
          mediaType: draft.mediaUrl ? 'image' : null,
          visible: draft.visible,
          ctaText: draft.ctaText?.trim() || null,
          ctaUrl: draft.ctaUrl?.trim() || null,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || 'Could not save homepage popup settings');
      setDraft({
        title: json.data.title || '',
        body: json.data.body || '',
        mediaUrl: json.data.mediaUrl || '',
        mediaType: json.data.mediaType || 'image',
        visible: json.data.visible !== false,
        ctaText: json.data.ctaText || '',
        ctaUrl: json.data.ctaUrl || '',
      });
      await queryClient.invalidateQueries({ queryKey: ['admin_homepage_popup'] });
      await queryClient.invalidateQueries({ queryKey: ['homepage_popup'] });
      setSaveStatus('saved');
      setMessage('Homepage popup settings saved and broadcasted live to the website.');
    } catch (err) {
      setSaveStatus('error');
      setMessage(err instanceof Error ? err.message : 'Could not save popup settings');
    } finally {
      setBusy(false);
    }
  };

  if (isLoading || !draft) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="w-full space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full mb-2">
            <Sparkles size={13} />
            <span>Public Website Experience</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">Homepage Welcome Popup</h1>
          <p className="mt-1 text-sm text-stone-500">
            Configure the welcome modal popup displayed exclusively on the public website homepage after the entrance preloader finishes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-live="polite"
            className={`text-sm font-semibold ${
              saveStatus === 'saved' ? 'text-emerald-700' : saveStatus === 'error' ? 'text-red-700' : 'text-stone-500'
            }`}
          >
            {busy
              ? 'Saving changes...'
              : saveStatus === 'saved'
              ? 'Saved successfully'
              : saveStatus === 'error'
              ? 'Save failed'
              : 'Unsaved changes'}
          </span>
          <button
            onClick={save}
            disabled={busy || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-brand-800 disabled:opacity-50"
          >
            <Save size={16} />
            {busy ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </header>

      {message && (
        <div
          role="status"
          className={`rounded-xl border p-4 text-sm font-medium ${
            saveStatus === 'saved'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : saveStatus === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-sky-200 bg-sky-50 text-sky-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main configuration form */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h2 className="text-base font-bold text-stone-900">Popup Content &amp; Visibility</h2>
              <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 transition hover:bg-stone-100">
                <input
                  type="checkbox"
                  checked={draft.visible}
                  onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 accent-brand-700"
                />
                <span className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                  {draft.visible ? <Eye size={15} className="text-emerald-600" /> : <EyeOff size={15} className="text-stone-400" />}
                  {draft.visible ? 'Popup Enabled' : 'Popup Disabled'}
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-stone-700">Headline Title (Max 120 chars)</span>
                <input
                  type="text"
                  value={draft.title || ''}
                  maxLength={120}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g. Admissions Open for Academic Year 2026–2027"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-stone-700">Message Body (Max 500 chars)</span>
                <textarea
                  rows={4}
                  value={draft.body || ''}
                  maxLength={500}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  placeholder="Write the announcement message displayed inside the modal popup..."
                  className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-stone-700">Call to Action Button Text (Optional)</span>
                  <input
                    type="text"
                    value={draft.ctaText || ''}
                    maxLength={60}
                    onChange={(e) => setDraft({ ...draft, ctaText: e.target.value })}
                    placeholder="e.g. Apply Now"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-stone-700">Call to Action Link URL (Optional)</span>
                  <input
                    type="text"
                    value={draft.ctaUrl || ''}
                    maxLength={300}
                    onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })}
                    placeholder="e.g. /admissions or https://..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
                  />
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Media & Preview Card */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">Popup Image / Visual</h2>
            <p className="text-xs text-stone-500">
              Upload a banner or photo to accompany the welcome message on the left side of the modal.
            </p>

            <div className="relative min-h-48 overflow-hidden rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
              {draft.mediaUrl ? (
                <img src={draft.mediaUrl} alt="Popup preview" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-stone-400">
                  <ImagePlus size={32} className="mb-2 text-stone-400" />
                  <span className="text-xs font-medium">No image attached</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-stone-800">
                <ImagePlus size={16} />
                <span>{uploading ? 'Uploading...' : draft.mediaUrl ? 'Replace Image' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  className="hidden"
                  onChange={(e) => {
                    void uploadImage(e.target.files?.[0]).catch((err) => setMessage(err.message));
                    e.currentTarget.value = '';
                  }}
                />
              </label>

              {draft.mediaUrl && (
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, mediaUrl: '' })}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                >
                  Remove Image
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default HomepagePopupManagerPage;
