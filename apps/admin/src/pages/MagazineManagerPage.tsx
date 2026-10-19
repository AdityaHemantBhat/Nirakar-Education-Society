import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Upload, Calendar, Lock, CheckCircle2, RefreshCw, FileText, Eye } from 'lucide-react';

export const MagazineManagerPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLocked, setIsLocked] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch recent issues
  const { data: issues = [], refetch } = useQuery({
    queryKey: ['admin_magazines'],
    queryFn: async () => {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const res = await fetch(`/api/v1/magazine/calendar?year=${year}&month=${month}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
  });

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
    formData.append('isLocked', String(isLocked));
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

      setUploadProgress(100);
      setStatusMessage('Issue uploaded successfully! Background worker is extracting pages and generating WebP/AVIF variants.');
      setTitle('');
      setPdfFile(null);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setStatusMessage('');
        refetch();
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Upload error');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          School Magazine Manager
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-sans mt-1">
          Upload whole PDF editions (up to 100MB). Our zero-AI deterministic engine extracts outlines, transcribes coordinates, and compiles paper-feel flipbooks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form Left */}
        <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-brand-800">
            <Upload size={20} />
            <h2 className="font-serif text-lg font-bold">Publish New Edition</h2>
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

            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLocked}
                  onChange={(e) => setIsLocked(e.target.checked)}
                  className="rounded text-brand-700 focus:ring-brand-700"
                />
                <span>Supporter Pass Protected (First 2 pages free preview)</span>
              </label>
            </div>

            {uploading && (
              <div className="space-y-2 pt-2">
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-700 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-500 font-mono">{statusMessage}</p>
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
        </div>

        {/* Existing Publications List Right */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Published Issues This Month
            </h2>
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"
              title="Refresh List"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {issues.length > 0 ? (
              issues.map((iss: any) => (
                <div
                  key={iss.id}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-sm font-bold text-ink">{iss.title}</h3>
                      {iss.isLocked && <Lock size={12} className="text-accent-700" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-stone-500">
                      <span>Date: {iss.publishDate}</span>
                      <span>•</span>
                      <span>{iss.pageCount} Pages</span>
                      <span>•</span>
                      <span>~{iss.readingMinutes} Min</span>
                    </div>
                  </div>

                  <a
                    href={`/patrika/issue/${iss.publishDate}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-serif font-bold text-brand-700 hover:bg-stone-100 flex items-center gap-1 shadow-sm shrink-0"
                  >
                    <Eye size={13} />
                    <span>Open Reader</span>
                  </a>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-stone-500">
                No editions published for current month. Upload a PDF on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
