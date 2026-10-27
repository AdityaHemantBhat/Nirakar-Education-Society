import React, { useState } from 'react';
import { Loader2, X, Pencil, AlertCircle } from 'lucide-react';
import {
  LIBRARY_CATEGORY_OPTIONS,
  LIBRARY_STANDARD_OPTIONS,
  LibraryCategory,
  LibraryStandard,
  LibraryVolumeCard,
} from '../lib/library.js';
import { AdminSelect } from './AdminSelect.js';

export interface VolumeEditDraft {
  title: string;
  description: string;
  author: string;
  publisher: string;
  academicYear: string;
  standard: LibraryStandard;
  category: LibraryCategory;
  subject: string;
  institutionCode: string;
  language: string;
}

interface Props {
  volume: LibraryVolumeCard;
  onSave: (draft: VolumeEditDraft) => void;
  saving: boolean;
  error: string | null;
  onClose: () => void;
}

/**
 * The panel for editing a volume's details.
 *
 * The pages of a volume are rendered from the PDF, so they cannot be
 * edited here — but everything written alongside the PDF can be: the
 * title, the author, the subject, the campus it belongs to. A book
 * uploaded with the wrong details is fixed here rather than being
 * deleted and uploaded again.
 */
export const LibraryEditDrawer: React.FC<Props> = ({ volume, onSave, saving, error, onClose }) => {
  const [draft, setDraft] = useState<VolumeEditDraft>({
    title: volume.title,
    description: volume.description ?? '',
    author: volume.author ?? '',
    publisher: volume.publisher ?? '',
    academicYear: volume.academicYear ?? '',
    standard: volume.standard,
    category: volume.category,
    subject: volume.subject ?? '',
    institutionCode: volume.institutionCode ?? '',
    language: volume.language || 'English',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
  };

  return (
    <>
      {/* The dimmed page behind the panel */}
      <button
        type="button"
        aria-label="Close the edit panel"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-stone-900/30 backdrop-blur-[1px]"
        style={{ animation: 'adminFadeIn 180ms ease-out' }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit the volume"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col overflow-y-auto border-l border-stone-200 bg-white shadow-2xl"
        style={{ animation: 'adminSlideIn 240ms cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div className="sticky top-0 z-10 flex items-start gap-3 border-b border-stone-200 bg-white px-6 py-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Pencil size={17} />
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-stone-900">Edit the volume</h2>
            <p className="mt-0.5 text-[11.5px] text-stone-500">
              The pages themselves come from the uploaded PDF and are not changed here.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close the edit panel"
            className="-mr-1 shrink-0 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 space-y-5 px-6 py-6">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Title *
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <AdminSelect
                label="Standard *"
                value={draft.standard}
                onChange={(val) => setDraft({ ...draft, standard: val as LibraryStandard })}
                options={LIBRARY_STANDARD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                icon={Pencil}
                compact
              />
            </div>

            <div>
              <AdminSelect
                label="Category *"
                value={draft.category}
                onChange={(val) => setDraft({ ...draft, category: val as LibraryCategory })}
                options={LIBRARY_CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                compact
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Subject
              </label>
              <input
                type="text"
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Academic year
              </label>
              <input
                type="text"
                value={draft.academicYear}
                onChange={(e) => setDraft({ ...draft, academicYear: e.target.value })}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Author
              </label>
              <input
                type="text"
                value={draft.author}
                onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Publisher
              </label>
              <input
                type="text"
                value={draft.publisher}
                onChange={(e) => setDraft({ ...draft, publisher: e.target.value })}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <AdminSelect
              label="Campus"
              value={draft.institutionCode}
              onChange={(val) => setDraft({ ...draft, institutionCode: val })}
              options={[
                { value: '', label: 'All campuses' },
                { value: 'NIRAKAR_HS', label: 'Shri Nirakar High School' },
                { value: 'TUDAL_HS', label: 'Tudal High School' },
                { value: 'ANGLE_HSS', label: 'S. S. Angle Higher Secondary' },
              ]}
              compact
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Description
            </label>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="w-full resize-y rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
              {error}
            </p>
          )}
        </form>

        <div className="sticky bottom-0 border-t border-stone-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              onClick={submit}
              disabled={saving || draft.title.trim().length < 2}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Pencil size={15} />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-stone-500 transition hover:text-stone-800"
            >
              Cancel
            </button>
          </div>

          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-stone-500">
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            The public address of the volume does not change when it is renamed, so links to it
            keep working.
          </p>
        </div>
      </div>
    </>
  );
};

export default LibraryEditDrawer;
