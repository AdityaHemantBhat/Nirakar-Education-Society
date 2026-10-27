import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  Plus,
  Search,
  Trash2,
  Edit2,
  Sparkles,
  X,
  GraduationCap,
  Download,
  Upload,
  FileText,
} from 'lucide-react';
import { fetchWithAdminSession } from '../lib/admissions.js';
import { apiUrl } from '../lib/api.js';
import { AdminSelect, CustomCampusSelect, SelectOption } from '../components/AdminSelect.js';

interface AcademicResult {
  id: string;
  academicYear: string;
  standard: string;
  examType: string;
  title?: string | null;
  pdfUrl?: string | null;
  studentName?: string | null;
  rollNumber?: string | null;
  percentage?: number | null;
  cgpa?: number | null;
  grade?: string | null;
  stream?: string | null;
  institutionCode: string;
  remarks?: string | null;
  photoUrl?: string | null;
  isFeatured: boolean;
}

const STANDARDS = ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export const ResultsManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedStandard, setSelectedStandard] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<AcademicResult | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    academicYear: '2025–2026',
    standard: 'X',
    examType: 'Annual Board Exam',
    stream: '',
    institutionCode: 'NIRAKAR_HS',
    studentName: '',
    percentage: '',
    grade: '',
    remarks: '',
    isFeatured: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin_academic_results', selectedStandard, selectedYear, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStandard) params.append('standard', selectedStandard);
      if (selectedYear) params.append('academicYear', selectedYear);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '50');

      const res = await fetchWithAdminSession(`/api/v1/results?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load results');
      return json.data as { items: AcademicResult[] };
    },
  });

  const openCreateModal = () => {
    setEditingResult(null);
    setPdfFile(null);
    setFormData({
      title: '',
      academicYear: '2025–2026',
      standard: selectedStandard || 'X',
      examType: 'Annual Board Exam',
      stream: '',
      institutionCode: 'NIRAKAR_HS',
      studentName: '',
      percentage: '',
      grade: '',
      remarks: '',
      isFeatured: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: AcademicResult) => {
    setEditingResult(item);
    setPdfFile(null);
    setFormData({
      title: item.title || '',
      academicYear: item.academicYear,
      standard: item.standard,
      examType: item.examType,
      stream: item.stream || '',
      institutionCode: item.institutionCode,
      studentName: item.studentName || '',
      percentage: item.percentage !== null && item.percentage !== undefined ? String(item.percentage) : '',
      grade: item.grade || '',
      remarks: item.remarks || '',
      isFeatured: item.isFeatured,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      let pdfUrl = editingResult?.pdfUrl || '';

      if (pdfFile) {
        const uploadData = new FormData();
        uploadData.append('file', pdfFile);
        const uploadRes = await fetchWithAdminSession('/api/v1/content/media/upload', {
          method: 'POST',
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        if (uploadRes.ok && uploadJson.success) {
          pdfUrl = uploadJson.data?.variants?.[0]?.url || uploadJson.data?.url || '';
        }
      }

      const payload = {
        title: formData.title.trim() || `Std ${formData.standard} Results (${formData.academicYear})`,
        academicYear: formData.academicYear.trim(),
        standard: formData.standard,
        examType: formData.examType.trim(),
        stream: formData.stream.trim() || null,
        institutionCode: formData.institutionCode,
        studentName: formData.studentName.trim() || 'Official Merit List',
        percentage: formData.percentage ? parseFloat(formData.percentage) : null,
        grade: formData.grade.trim() || null,
        remarks: formData.remarks.trim() || null,
        pdfUrl: pdfUrl || null,
        isFeatured: formData.isFeatured,
      };

      const url = editingResult ? `/api/v1/results/${editingResult.id}` : '/api/v1/results';
      const method = editingResult ? 'PUT' : 'POST';

      const res = await fetchWithAdminSession(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save academic result');

      await queryClient.invalidateQueries({ queryKey: ['admin_academic_results'] });
      setModalOpen(false);
      setMessage(editingResult ? 'Result updated successfully.' : 'Result published successfully.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    try {
      const res = await fetchWithAdminSession(`/api/v1/results/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete result');
      await queryClient.invalidateQueries({ queryKey: ['admin_academic_results'] });
      setMessage('Result deleted successfully.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleDownloadReport = () => {
    const params = new URLSearchParams();
    if (selectedStandard) params.append('standard', selectedStandard);
    if (selectedYear) params.append('academicYear', selectedYear);
    window.open(apiUrl(`/api/v1/results/pdf/download?${params.toString()}`), '_blank');
  };

  return (
    <main className="w-full space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full mb-2">
            <Award size={13} />
            <span>Academic Excellence</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">Academic Results Manager (Std V–XII)</h1>
          <p className="mt-1 text-sm text-stone-500">
            Publish official student exam result PDFs and merit records across standards and campuses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-brand-800"
          >
            <Plus size={16} />
            <span>Add Result & Upload PDF</span>
          </button>
        </div>
      </header>

      {message && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><X size={16} /></button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, student name, remarks..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 py-2 text-sm text-stone-900 outline-none focus:border-brand-700 focus:bg-white"
            />
          </div>

          <div className="w-56 shrink-0">
            <AdminSelect
              value={selectedStandard}
              onChange={(val) => setSelectedStandard(val)}
              options={[
                { value: '', label: 'All Standards (V–XII)' },
                ...STANDARDS.map((std) => ({ value: std, label: `Std ${std}` })),
              ]}
              icon={GraduationCap}
              compact
            />
          </div>

          <input
            type="text"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            placeholder="Academic Year e.g. 2025–2026"
            className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-800 outline-none focus:border-brand-700"
          />
        </div>

        <button
          onClick={handleDownloadReport}
          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-stone-800"
        >
          <Download size={15} />
          <span>Download Summary PDF Report</span>
        </button>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
          </div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-stone-400">
            <GraduationCap size={48} className="mb-3 text-stone-300" />
            <p className="text-base font-semibold text-stone-700">No academic results found</p>
            <p className="text-xs text-stone-500 mt-1">Get started by clicking "Add Result & Upload PDF".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-5 py-4">Title / Result Details</th>
                  <th className="px-5 py-4">Standard / Stream</th>
                  <th className="px-5 py-4">Exam Type & Year</th>
                  <th className="px-5 py-4">PDF Document</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-stone-900">
                        {item.title || `Std ${item.standard} Exam Results`}
                      </div>
                      {item.studentName && item.studentName !== 'Official Merit List' && (
                        <div className="text-xs text-stone-600 mt-0.5">Top Achiever: {item.studentName}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-stone-800">Std {item.standard}</div>
                      {item.stream && <div className="text-xs text-stone-500">{item.stream}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-stone-900 font-medium">{item.examType}</div>
                      <div className="text-xs text-stone-500">{item.academicYear}</div>
                    </td>
                    <td className="px-5 py-4">
                      {item.pdfUrl ? (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200"
                        >
                          <FileText size={14} />
                          <span>View Result PDF</span>
                        </a>
                      ) : (
                        <span className="text-xs text-stone-400">No PDF uploaded</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded-lg border border-stone-200 bg-white p-2 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                          title="Edit result"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg border border-red-200 bg-red-50/50 p-2 text-red-600 hover:bg-red-100"
                          title="Delete result"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-brand-700" />
                <h2 className="text-lg font-bold font-serif text-stone-900">
                  {editingResult ? 'Edit Academic Result & PDF' : 'Add Academic Result & Upload PDF'}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-stone-700">Result Title / Heading</span>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Std X Board Exam Results 2025-2026"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-brand-700"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <AdminSelect
                    label="Standard *"
                    value={formData.standard}
                    onChange={(val) => setFormData({ ...formData, standard: val })}
                    options={STANDARDS.map((std) => ({ value: std, label: `Std ${std}` }))}
                    icon={GraduationCap}
                    compact
                  />
                </div>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-stone-700">Academic Year *</span>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="2025–2026"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-brand-700"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-stone-700">Exam Type *</span>
                  <input
                    type="text"
                    required
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    placeholder="Annual Board Exam"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-brand-700"
                  />
                </label>

                <div>
                  <AdminSelect
                    label="Institution / Campus"
                    value={formData.institutionCode}
                    onChange={(val) => setFormData({ ...formData, institutionCode: val })}
                    options={[
                      { value: 'NIRAKAR_HS', label: 'Shree Nirakar High School, Mashem' },
                      { value: 'TUDAL_HS', label: 'Shree Nirakar Tudal High School' },
                      { value: 'ANGLE_HSS', label: 'Shree Nirakar Angle Higher Secondary School' },
                    ]}
                    compact
                  />
                </div>
              </div>

              {['XI', 'XII'].includes(formData.standard) && (
                <div>
                  <AdminSelect
                    label="Stream"
                    value={formData.stream}
                    onChange={(val) => setFormData({ ...formData, stream: val })}
                    options={[
                      { value: '', label: 'General / All Streams' },
                      { value: 'Science', label: 'Science' },
                      { value: 'Commerce', label: 'Commerce' },
                      { value: 'Arts', label: 'Arts' },
                    ]}
                    icon={Award}
                    compact
                  />
                </div>
              )}

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-stone-700">Upload Result PDF Document *</span>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-4 hover:border-brand-600 transition">
                  <Upload size={22} className="text-brand-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-700 file:text-white hover:file:bg-brand-800"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      {pdfFile ? `Selected: ${pdfFile.name}` : editingResult?.pdfUrl ? 'Current PDF attached (upload new to replace)' : 'Upload official result PDF sheet'}
                    </p>
                  </div>
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-brand-700 px-6 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-brand-800 disabled:opacity-50"
                >
                  {busy ? 'Saving...' : editingResult ? 'Update Result' : 'Publish Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ResultsManagerPage;
