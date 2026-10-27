import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Camera,
  Save,
  Upload,
  AlertCircle,
  CheckCircle2,
  X,
  Building2,
  CalendarDays,
  GraduationCap,
  Image as ImageIcon,
} from 'lucide-react';
import { AdminSelect } from '../components/AdminSelect.js';
import {
  BATCH_STREAM_OPTIONS,
  batchPhotosQueryKey,
  createBatchPhoto,
  deleteBatchPhoto,
  fetchBatchPhotos,
  formatFileSize,
  updateBatchPhoto,
  uploadBatchPhoto,
  type BatchPhotoInput,
  type BatchStream,
} from '../lib/batchPhotos.js';
import { FileTypeIcon } from '../components/FileTypeIcon.js';

const CAMPUS_OPTIONS = [
  { value: 'NIRAKAR_HS', label: 'Shri Nirakar High School', place: 'Mashem, Canacona' },
  { value: 'TUDAL_HS', label: 'Tudal High School', place: 'Gaondongrem, Canacona' },
  { value: 'ANGLE_HSS', label: 'S. S. Angle Higher Secondary School', place: 'Dapot, Mashem' },
];

/**
 * The session a batch belongs to.
 *
 * It is worked out from the year the batch passed out, the way a school
 * writes it on the photograph — "2022-23" for a batch that finished in
 * 2023.
 */
function sessionForYear(year: number): string {
  const start = year - 1;
  return `${start}-${String(year).slice(-2)}`;
}

/** The title a batch photograph is given, unless it is written by hand. */
function titleForYear(year: number, stream: BatchStream): string {
  const short = BATCH_STREAM_OPTIONS.find((o) => o.value === stream)?.short ?? 'SSC';
  const streamName = short.includes('Class X') ? 'SSC' : short.split(' ')[0];
  return `${streamName} Batch Photo ${sessionForYear(year)}`;
}

/** The class the students sat in, which follows from the stream. */
function classLevelForStream(stream: BatchStream): string {
  switch (stream) {
    case 'SSC':
      return 'Std X';
    case 'SPECIAL':
      return 'Special Batch';
    default:
      return 'Std XII';
  }
}

export const BatchPhotoEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState<BatchPhotoInput>({
    institutionCode: 'NIRAKAR_HS',
    batchYear: currentYear,
    stream: 'SSC',
    batchSession: sessionForYear(currentYear),
    classLevel: 'Std X',
    division: '',
    title: titleForYear(currentYear, 'SSC'),
    caption: '',
    photoUrl: '',
    fileSizeBytes: 0,
    imageFormat: 'webp',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hasManuallyNamed, setHasManuallyNamed] = useState(false);

  /* The photograph being edited is read once, so that the form opens on
     what is actually filed. */
  const { data: existing, isLoading: isLoadingExisting } = useQuery({
    queryKey: [...batchPhotosQueryKey, 'editor', id],
    queryFn: async () => {
      const result = await fetchBatchPhotos({ limit: 100 });
      return result.items.find((item) => item.id === id) ?? null;
    },
    enabled: isEditing,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (!existing) return;
    setFormData({
      institutionCode: existing.institutionCode,
      batchYear: existing.batchYear,
      stream: existing.stream,
      batchSession: existing.batchSession ?? sessionForYear(existing.batchYear),
      classLevel: existing.classLevel ?? classLevelForStream(existing.stream),
      division: existing.division ?? '',
      title: existing.title,
      caption: existing.caption ?? '',
      photoUrl: existing.photoUrl,
      fileSizeBytes: existing.fileSizeBytes,
      imageFormat: existing.imageFormat,
    });
    setHasManuallyNamed(true);
  }, [existing]);

  /* The photograph itself, converted by the server before it is kept. */
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadBatchPhoto(file),
    onSuccess: (uploaded) => {
      setFormData((prev) => ({
        ...prev,
        photoUrl: uploaded.photoUrl,
        fileSizeBytes: uploaded.fileSizeBytes,
        imageFormat: uploaded.imageFormat,
      }));
      setErrorMessage(null);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (input: BatchPhotoInput) => {
      if (isEditing) {
        return updateBatchPhoto(id!, input);
      }
      return createBatchPhoto(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchPhotosQueryKey });
      navigate('/batch-photos');
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteBatchPhoto(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchPhotosQueryKey });
      navigate('/batch-photos');
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  /* When the year or the stream changes, the session and the title follow
     it, unless the title has been written by hand. */
  const handleYearChange = (year: number) => {
    setFormData((prev) => {
      const batchSession = sessionForYear(year);
      return {
        ...prev,
        batchYear: year,
        batchSession,
        title: hasManuallyNamed ? prev.title : titleForYear(year, prev.stream),
      };
    });
  };

  const handleStreamChange = (stream: BatchStream) => {
    setFormData((prev) => ({
      ...prev,
      stream,
      classLevel: classLevelForStream(stream),
      title: hasManuallyNamed ? prev.title : titleForYear(prev.batchYear, stream),
    }));
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('That file is not a photograph. Choose a JPEG, PNG, WebP or AVIF file.');
      return;
    }
    setNotice(null);
    uploadMutation.mutate(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.photoUrl) {
      setErrorMessage('A photograph is required before the batch can be filed.');
      return;
    }
    if (!formData.title.trim()) {
      setErrorMessage('A title is required.');
      return;
    }

    saveMutation.mutate({ ...formData, title: formData.title.trim() });
  };

  const isBusy = uploadMutation.isPending || saveMutation.isPending;

  const campusName = useMemo(
    () => CAMPUS_OPTIONS.find((c) => c.value === formData.institutionCode),
    [formData.institutionCode],
  );

  return (
    <div className="w-full space-y-6 pb-16 font-sans">
      {/* ============================== Header ============================== */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/batch-photos')}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 transition hover:text-brand-700"
          >
            <ArrowLeft size={14} />
            <span>Back to the archive</span>
          </button>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-stone-900 sm:text-3xl">
            <Camera className="text-brand-700" size={28} />
            <span>{isEditing ? 'Edit batch photograph' : 'Post a batch photograph'}</span>
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {isEditing
              ? 'Amend what is filed for this graduating class.'
              : 'File a graduating class photograph in the archive.'}
          </p>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Take this photograph out of the archive?')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
          >
            <X size={14} />
            <span>Remove from archive</span>
          </button>
        )}
      </header>

      {/* ============================== The form ============================== */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-7">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-stone-900">
              <Building2 size={18} className="text-brand-700" />
              Which graduating class
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              The campus, the stream and the year the batch passed out in.
            </p>
          </div>

          {/* Campus */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700">
              Campus <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {CAMPUS_OPTIONS.map((campus) => {
                const selected = formData.institutionCode === campus.value;
                return (
                  <button
                    key={campus.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, institutionCode: campus.value })}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      selected
                        ? 'border-brand-700 bg-brand-50 ring-1 ring-brand-700'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <span className={`block text-xs font-bold ${selected ? 'text-brand-800' : 'text-stone-800'}`}>
                      {campus.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-stone-500">{campus.place}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stream and year */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <AdminSelect
                label="Stream *"
                value={formData.stream}
                onChange={(val) => handleStreamChange(val as BatchStream)}
                options={BATCH_STREAM_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                icon={GraduationCap}
                compact
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700">
                Passing out year <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1960}
                max={2035}
                value={formData.batchYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700">
                Academic session <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.batchSession}
                onChange={(e) => setFormData({ ...formData, batchSession: e.target.value })}
                placeholder="2022-23"
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
              />
              <p className="mt-1 text-[11px] text-stone-500">As it is written on the photograph.</p>
            </div>
          </div>

          {/* Class and division */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700">
                Class <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.classLevel}
                onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                placeholder="Std X"
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-800 transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700">
                Division
              </label>
              <input
                type="text"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                placeholder="e.g. Div A"
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-800 transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
              />
            </div>
          </div>
        </section>

        {/* ============================== The photograph ============================== */}
        <section className="space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-7">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-stone-900">
              <ImageIcon size={18} className="text-brand-700" />
              The photograph
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Whatever is picked is converted to WebP on the way in, so the archive holds
              one format and the gallery stays quick.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
                <span className="font-medium">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="cursor-pointer rounded p-0.5 text-rose-500 transition hover:text-rose-800"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {notice && (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                <span className="font-medium">{notice}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="cursor-pointer rounded p-0.5 text-emerald-600 transition hover:text-emerald-800"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? 'border-brand-500 bg-brand-50/70'
                : formData.photoUrl
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-stone-300 bg-stone-50/60 hover:bg-stone-50'
            }`}
          >
            {uploadMutation.isPending ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
                <span className="text-xs font-medium text-stone-600">
                  Converting the photograph to WebP...
                </span>
              </div>
            ) : formData.photoUrl ? (
              <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
                <div className="h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-900">
                  <img
                    src={formData.photoUrl}
                    alt="Batch preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1.5 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      <CheckCircle2 size={12} />
                      <span>Ready</span>
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded border border-stone-200 bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-700"
                      title="The format the photograph is stored in"
                    >
                      <FileTypeIcon format={formData.imageFormat} />
                      <span>{formData.imageFormat.toUpperCase()}</span>
                    </span>
                    {formData.fileSizeBytes > 0 && (
                      <span className="text-[11px] font-medium text-stone-500">
                        {formatFileSize(formData.fileSizeBytes)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    The photograph has been converted and is ready to file.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer text-xs font-bold text-brand-700 transition hover:underline"
                    >
                      Choose a different photograph
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          photoUrl: '',
                          fileSizeBytes: 0,
                        }))
                      }
                      className="cursor-pointer text-xs font-bold text-rose-600 transition hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Upload size={20} />
                </div>
                <div className="text-xs text-stone-700">
                  <span
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer font-bold text-brand-700 transition hover:underline"
                  >
                    Choose a photograph
                  </span>{' '}
                  or drag it here
                </div>
                <p className="text-[11px] text-stone-400">
                  JPEG, PNG, WebP or AVIF — all converted to WebP on upload
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        </section>

        {/* ============================== How it is described ============================== */}
        <section className="space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-7">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-stone-900">
              <GraduationCap size={18} className="text-brand-700" />
              How it is described
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              The title and the note the gallery shows beside the photograph.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => {
                setHasManuallyNamed(true);
                setFormData({ ...formData, title: e.target.value });
              }}
              placeholder="e.g. SSC Batch Photo 2022-23"
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-800 transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
            <p className="mt-1 text-[11px] text-stone-500">
              Written for you from the year and stream, and yours to change.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700">
              Caption
            </label>
            <textarea
              rows={3}
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="e.g. Class of 2022 seated with the Headmaster and faculty mentors on the school grounds."
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm leading-relaxed text-stone-800 transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>
        </section>

        {/* ============================== Actions ============================== */}
        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/batch-photos')}
            className="cursor-pointer rounded-xl border border-stone-300 px-5 py-2.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isBusy || isLoadingExisting}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-700 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save size={15} />
            )}
            <span>
              {isEditing ? 'Save changes' : 'File this photograph'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BatchPhotoEditorPage;
