import React from 'react';
import {
  Upload,
  Loader2,
  X,
  BookOpen,
} from 'lucide-react';
import {
  LIBRARY_CATEGORY_OPTIONS,
  LIBRARY_STANDARD_OPTIONS,
  LibraryCategory,
  LibraryStandard,
  formatFileSize,
  MAX_LIBRARY_PDF_MB,
} from '../lib/library.js';
import { AdminSelect } from './AdminSelect.js';

export interface UploadDraft {
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
  isPublished: boolean;
}

interface Props {
  draft: UploadDraft;
  setDraft: (draft: UploadDraft) => void;
  pdfFile: File | null;
  /** Called when a document is chosen or cleared. */
  onFileChange: (file: File | null) => void;
  pdfError: string | null;
  uploading: boolean;
  /* The form's own submit event and the foot button's click both reach
     this, so it is typed for either. */
  onSubmit: (e: React.SyntheticEvent) => void;
  onClose: () => void;
}

/**
 * The upload form, shown as a panel that slides in over the page.
 *
 * The volumes are the main thing on this page, so the form does not take
 * a column of its own and push them to one side. It arrives when it is
 * wanted and steps aside when it is not.
 */
export const LibraryUploadDrawer: React.FC<Props> = ({
  draft,
  setDraft,
  pdfFile,
  onFileChange,
  pdfError,
  uploading,
  onSubmit,
  onClose,
}) => {
  return (
    <>
      {/* The dimmed page behind the panel */}
      <button
        type="button"
        aria-label="Close the upload panel"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-stone-900/30 backdrop-blur-[1px]"
        style={{ animation: 'adminFadeIn 180ms ease-out' }}
      />

      {/* The panel itself */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add a volume"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col overflow-y-auto border-l border-stone-200 bg-white shadow-2xl"
        style={{ animation: 'adminSlideIn 240ms cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        {/* Its head */}
        <div className="sticky top-0 z-10 flex items-start gap-3 border-b border-stone-200 bg-white px-6 py-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Upload size={17} />
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-stone-900">Add a volume</h2>
            <p className="mt-0.5 text-[11.5px] text-stone-500">
              A PDF document, up to {MAX_LIBRARY_PDF_MB} MB.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close the upload panel"
            className="-mr-1 shrink-0 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={17} />
          </button>
        </div>

        {/* Its body */}
        <form onSubmit={onSubmit} className="flex-1 space-y-5 px-6 py-6">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Title *
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g. Std X Mathematics Textbook"
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
                icon={BookOpen}
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
                placeholder="Mathematics"
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
                placeholder="2026–27"
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
              placeholder="What this volume covers and who it is for."
              className="w-full resize-y rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Source document *
            </label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onFileChange(file);
              }}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-800 hover:file:bg-brand-100"
            />
            {pdfFile && (
              <p className="mt-1.5 text-[11px] text-stone-500">
                {pdfFile.name} · {formatFileSize(pdfFile.size)}
              </p>
            )}
            {pdfError && (
              <p role="alert" className="mt-1.5 text-[11px] font-semibold text-rose-700">
                {pdfError}
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-xs text-stone-700">
            <input
              type="checkbox"
              checked={draft.isPublished}
              onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })}
              className="rounded text-brand-700 focus:ring-brand-700"
            />
            <span>Publish immediately to the public library</span>
          </label>
        </form>

        {/* Its foot */}
        <div className="sticky bottom-0 border-t border-stone-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSubmit}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <BookOpen size={15} />
              )}
              {uploading ? 'Uploading…' : 'Upload volume'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-stone-500 transition hover:text-stone-800"
            >
              Cancel
            </button>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-stone-500">
            The PDF is stored, then rendered into multi-resolution page images with its text layer
            extracted for search and reader mode. Rendering happens in the background, so a large
            document does not block the upload. A document longer than 400 pages is sampled down
            to an even spread of 400 pages rather than refused.
          </p>

          <p className="mt-2 text-[11px] leading-relaxed text-stone-400">
            The source PDF is kept on the server and is never published. Only the rendered
            page images are served to readers.
          </p>
        </div>
      </div>
    </>
  );
};

export default LibraryUploadDrawer;
