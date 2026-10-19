import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  Calendar,
  Building2,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Eye,
  Check,
} from 'lucide-react';
import {
  BatchPhoto,
  INITIAL_BATCH_PHOTOS,
  SCHOOL_OPTIONS,
  BATCH_TYPE_OPTIONS,
} from '../data/batchPhotosData.js';

const STORAGE_KEY = 'nirakar_custom_batch_photos';

interface BatchFormData {
  school: 'NIRAKAR_HS' | 'TUDAL_HS' | 'ANGLE_HSS';
  batchType: 'SSC' | 'HSSC_SCIENCE' | 'HSSC_COMMERCE' | 'HSSC_ARTS' | 'SPECIAL';
  year: number;
  batchSession: string;
  title: string;
  classLevel: string;
  division: string;
  imageUrl: string;
  caption: string;
  fileSize: string;
}

export const BatchPhotosManagerPage: React.FC = () => {
  // Load combined batch photos (initial + custom)
  const [batches, setBatches] = useState<BatchPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge custom items with initial seed
          const customIds = new Set(parsed.map((p) => p.id));
          const remainingInitial = INITIAL_BATCH_PHOTOS.filter((b) => !customIds.has(b.id));
          return [...parsed, ...remainingInitial];
        }
      }
    } catch {}
    return INITIAL_BATCH_PHOTOS;
  });

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Editor / Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const defaultYear = new Date().getFullYear();
  const [formData, setFormData] = useState<BatchFormData>({
    school: 'NIRAKAR_HS',
    batchType: 'SSC',
    year: defaultYear,
    batchSession: `${defaultYear - 1}-${String(defaultYear).slice(-2)}`,
    title: `SSC Batch Photo ${defaultYear - 1}-${String(defaultYear).slice(-2)}`,
    classLevel: 'Std X',
    division: 'Div A',
    imageUrl: '',
    caption: '',
    fileSize: '',
  });

  // Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Sync to localStorage
  const saveBatches = (newBatches: BatchPhoto[]) => {
    setBatches(newBatches);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBatches));
    } catch {}
  };

  // Auto-generate title and session when school, batchType, or year changes
  const handleYearChange = (yearVal: number) => {
    const session = `${yearVal - 1}-${String(yearVal).slice(-2)}`;
    const typeObj = BATCH_TYPE_OPTIONS.find((t) => t.code === formData.batchType);
    const prefix = typeObj ? typeObj.label.split(' ')[0] : 'SSC';
    setFormData((prev) => ({
      ...prev,
      year: yearVal,
      batchSession: session,
      title: `${prefix} Batch Photo ${session}`,
    }));
  };

  const handleBatchTypeChange = (typeVal: BatchFormData['batchType']) => {
    const typeObj = BATCH_TYPE_OPTIONS.find((t) => t.code === typeVal);
    const prefix = typeObj ? typeObj.label.split(' ')[0] : 'SSC';
    const classLvl = typeVal === 'SSC' ? 'Std X' : typeVal === 'SPECIAL' ? 'Special Batch' : 'Std XII';
    setFormData((prev) => ({
      ...prev,
      batchType: typeVal,
      classLevel: classLvl,
      title: `${prefix} Batch Photo ${prev.batchSession}`,
    }));
  };

  // Image Processing & Compression (Auto target 20-50 KB)
  const processImageFile = async (file: File) => {
    setUploadError(null);

    // Validate type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setUploadError('Invalid format. Please upload a JPEG, JPG, PNG, or WebP photo.');
      return;
    }

    setIsCompressing(true);

    try {
      // If image is already lightweight (under 60 KB), read directly as base64 data url
      if (file.size <= 65 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const kbSize = Math.round(file.size / 1024);
          setFormData((prev) => ({
            ...prev,
            imageUrl: result,
            fileSize: `${kbSize} KB`,
          }));
          setIsCompressing(false);
          if (kbSize < 15 || kbSize > 55) {
            // Friendly note if outside recommended 20-50 KB range
            setUploadError(`Note: Photo is ${kbSize} KB. Recommended target is 20–50 KB for optimal speed.`);
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // If file is larger, compress via Canvas to ~25-45 KB
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        // Calculate scaled dimensions (max width 1200px)
        const maxWidth = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas not available');
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.72 quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);
        const approximateBytes = Math.round(compressedDataUrl.length * (3 / 4));
        const kbSize = Math.round(approximateBytes / 1024);

        setFormData((prev) => ({
          ...prev,
          imageUrl: compressedDataUrl,
          fileSize: `${kbSize} KB`,
        }));
        setIsCompressing(false);
      };

      img.onerror = () => {
        setIsCompressing(false);
        setUploadError('Failed to parse image file. Please choose another photograph.');
      };

      img.src = objectUrl;
    } catch (err: any) {
      setIsCompressing(false);
      setUploadError(err.message || 'Image compression failed.');
    }
  };

  // Start Create Form
  const handleStartCreate = () => {
    setEditingId(null);
    setUploadError(null);
    const yr = new Date().getFullYear();
    const session = `${yr - 1}-${String(yr).slice(-2)}`;
    setFormData({
      school: 'NIRAKAR_HS',
      batchType: 'SSC',
      year: yr,
      batchSession: session,
      title: `SSC Batch Photo ${session}`,
      classLevel: 'Std X',
      division: 'Div A',
      imageUrl: '',
      caption: '',
      fileSize: '',
    });
    setIsEditorOpen(true);
  };

  // Start Edit Form
  const handleStartEdit = (b: BatchPhoto) => {
    setEditingId(b.id);
    setUploadError(null);
    setFormData({
      school: b.school,
      batchType: b.batchType,
      year: b.year,
      batchSession: b.batchSession,
      title: b.title,
      classLevel: b.classLevel,
      division: b.division || '',
      imageUrl: b.imageUrl,
      caption: b.caption || '',
      fileSize: b.fileSize || '35 KB',
    });
    setIsEditorOpen(true);
  };

  // Delete Batch
  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}" from the batch archive?`)) {
      const updated = batches.filter((b) => b.id !== id);
      saveBatches(updated);
      showStatus('Batch photo deleted successfully', 'success');
    }
  };

  // Submit Save
  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showStatus('Batch title is required', 'error');
      return;
    }
    if (!formData.imageUrl) {
      setUploadError('Please upload a batch photograph (20–50 KB).');
      showStatus('Please upload a batch photograph', 'error');
      return;
    }

    const schoolObj = SCHOOL_OPTIONS.find((s) => s.code === formData.school) || SCHOOL_OPTIONS[0];
    const typeObj = BATCH_TYPE_OPTIONS.find((t) => t.code === formData.batchType) || BATCH_TYPE_OPTIONS[0];

    if (editingId) {
      // Edit existing
      const updated = batches.map((b) =>
        b.id === editingId
          ? {
              ...b,
              school: formData.school,
              schoolName: schoolObj.label,
              campus: schoolObj.campus,
              batchType: formData.batchType,
              batchTypeLabel: typeObj.label,
              year: Number(formData.year),
              batchSession: formData.batchSession,
              title: formData.title.trim(),
              classLevel: formData.classLevel,
              division: formData.division.trim() || undefined,
              imageUrl: formData.imageUrl,
              caption: formData.caption.trim() || undefined,
              fileSize: formData.fileSize || '35 KB',
            }
          : b
      );
      saveBatches(updated);
      showStatus('Batch photo updated successfully', 'success');
    } else {
      // Create new
      const newBatch: BatchPhoto = {
        id: `batch-${Date.now()}`,
        school: formData.school,
        schoolName: schoolObj.label,
        campus: schoolObj.campus,
        batchType: formData.batchType,
        batchTypeLabel: typeObj.label,
        year: Number(formData.year),
        batchSession: formData.batchSession,
        title: formData.title.trim(),
        classLevel: formData.classLevel,
        division: formData.division.trim() || undefined,
        imageUrl: formData.imageUrl,
        caption: formData.caption.trim() || undefined,
        fileSize: formData.fileSize || '35 KB',
        createdAt: new Date().toISOString(),
      };
      saveBatches([newBatch, ...batches]);
      showStatus('New batch photo published to public archive', 'success');
    }

    setIsEditorOpen(false);
  };

  // Filtered Batches List
  const filteredBatches = batches.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.schoolName.toLowerCase().includes(q) ||
      String(b.year).includes(q) ||
      (b.caption && b.caption.toLowerCase().includes(q));

    const matchesSchool = schoolFilter === 'ALL' || b.school === schoolFilter;
    const matchesType = typeFilter === 'ALL' || b.batchType === typeFilter;

    return matchesSearch && matchesSchool && matchesType;
  });

  return (
    <div className="w-full space-y-7 pb-16 font-sans">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl border flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Historical Batch Photos Archive
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {batches.length} Batches
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-1">
            Publish and manage graduating Class X and Class XII batch photos across all three institutions (1963 to 2024+).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="http://localhost:5000/batch-photos"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-800 bg-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink size={14} />
            <span>View Public Gallery</span>
          </a>

          <button
            type="button"
            onClick={handleStartCreate}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Batch Photo</span>
          </button>
        </div>
      </div>

      {/* EDITOR MODAL / SLIDE-IN PANEL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    {editingId ? 'Edit Batch Photograph' : 'Post New Batch Photograph'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select target institution, batch stream, year, and upload high-clarity photo (20–50 KB).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBatch} className="p-6 sm:p-8 space-y-5">
              {/* Row 1: Target School Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target School Institution <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.school}
                  onChange={(e) =>
                    setFormData({ ...formData, school: e.target.value as BatchFormData['school'] })
                  }
                  className="w-full px-4 py-2.5 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all cursor-pointer"
                >
                  {SCHOOL_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Choose which campus this batch belongs to (Shri Nirakar HS, Tudal HS, or S.S. Angle HSS).
                </p>
              </div>

              {/* Row 2: Batch Type & Passing Out Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Batch Stream / Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.batchType}
                    onChange={(e) =>
                      handleBatchTypeChange(e.target.value as BatchFormData['batchType'])
                    }
                    className="w-full px-4 py-2.5 text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all cursor-pointer"
                  >
                    {BATCH_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Passing Out Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1960}
                    max={2035}
                    value={formData.year}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm font-mono font-semibold text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto">
                    <span className="text-[10px] text-slate-400 font-mono">Quick:</span>
                    {[2024, 2023, 2022, 2020, 2015, 2005, 1995, 1985, 1975].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => handleYearChange(yr)}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono cursor-pointer transition-colors ${
                          formData.year === yr
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Batch Title & Division */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Batch Title / Display Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. SSC Batch Photo 2023-24"
                    className="w-full px-4 py-2.5 text-sm font-semibold text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Class / Division
                  </label>
                  <input
                    type="text"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    placeholder="e.g. Div A, Science, etc."
                    className="w-full px-4 py-2.5 text-sm text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Row 4: Caption / Mentors Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Caption & Faculty Mentors (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="e.g. Class of 2023 seated with Headmaster and faculty mentors on campus grounds..."
                  className="w-full px-4 py-2 text-xs leading-relaxed text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>

              {/* Row 5: Image Upload Box with 20–50 KB Guide & In-Box Error Alert */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Batch Photograph File <span className="text-red-500">*</span>
                    </span>
                    {/* INFO TOOLTIP */}
                    <div className="relative group inline-flex items-center">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        title="Optimal Size Info"
                      >
                        <Info size={14} />
                      </button>
                      <div className="absolute left-6 -top-2 w-72 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 leading-relaxed">
                        <strong>Recommended Size: 20 KB – 50 KB.</strong>
                        <br />
                        Compressed WebP and JPEG images ensure instant historical mobile gallery loading without eating bandwidth.
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    Recommended: <strong className="text-blue-700">20–50 KB</strong>
                  </span>
                </div>

                {/* Dropzone Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      processImageFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`relative p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/70'
                      : formData.imageUrl
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50'
                  }`}
                >
                  {/* IN-BOX ERROR ALERT (SAME BOX AS REQUESTED BY USER) */}
                  {uploadError && (
                    <div className="w-full mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={15} className="text-red-600 shrink-0" />
                        <span className="font-medium text-left">{uploadError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadError(null)}
                        className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {isCompressing ? (
                    <div className="py-6 flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-mono text-slate-600">
                        Optimizing & compressing photograph (targeting 20–50 KB)...
                      </span>
                    </div>
                  ) : formData.imageUrl ? (
                    <div className="w-full flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-40 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shrink-0 shadow-sm relative group">
                        <img
                          src={formData.imageUrl}
                          alt="Batch Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 text-left space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check size={12} />
                            <span>Photo Ready</span>
                          </span>
                          {formData.fileSize && (
                            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {formData.fileSize}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Photo formatted and optimized for high-speed archive rendering.
                        </p>
                        <div className="pt-1 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, imageUrl: '', fileSize: '' }))
                            }
                            className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <Upload size={20} />
                      </div>
                      <div className="text-xs text-slate-700">
                        <span
                          onClick={() => fileInputRef.current?.click()}
                          className="font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Click to browse
                        </span>{' '}
                        or drag and drop batch photograph here
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Recommended: JPEG / WebP • Target 20–50 KB (Auto-compressed if larger)
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Publish Batch Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by year, title, or student/mentor name..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-white focus:bg-white text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:border-blue-600 rounded-xl outline-none font-sans"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* School Filter */}
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">All 3 Schools</option>
            <option value="NIRAKAR_HS">Shri Nirakar HS (Mashem)</option>
            <option value="TUDAL_HS">Tudal HS (Gaondongrem)</option>
            <option value="ANGLE_HSS">S.S. Angle HSS (Dapot)</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">All Streams / Batches</option>
            <option value="SSC">SSC (Class X)</option>
            <option value="HSSC_SCIENCE">HSSC Science</option>
            <option value="HSSC_COMMERCE">HSSC Commerce</option>
            <option value="HSSC_ARTS">HSSC Arts</option>
            <option value="SPECIAL">Special Batches</option>
          </select>
        </div>
      </div>

      {/* BATCHES TABLE */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-5">Photograph Preview</th>
                <th className="py-4 px-5">Batch Title</th>
                <th className="py-4 px-5">School & Campus</th>
                <th className="py-4 px-5">Stream / Level</th>
                <th className="py-4 px-5">Year</th>
                <th className="py-4 px-5">Size</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-slate-400 mb-2">No batch photos found matching your search.</div>
                    <button
                      type="button"
                      onClick={handleStartCreate}
                      className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      + Add the first batch photograph
                    </button>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                        <img
                          src={b.imageUrl}
                          alt={b.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="font-bold text-slate-900 text-sm">{b.title}</div>
                      {b.division && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {b.division}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {b.school === 'NIRAKAR_HS'
                          ? 'Nirakar HS'
                          : b.school === 'TUDAL_HS'
                          ? 'Tudal HS'
                          : 'Angle HSS'}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-xs font-mono text-slate-600">
                        {b.batchTypeLabel}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className="font-mono font-bold text-slate-900 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                        {b.year}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className="text-xs font-mono text-slate-500">
                        {b.fileSize || '35 KB'}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(b)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id, b.title)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
