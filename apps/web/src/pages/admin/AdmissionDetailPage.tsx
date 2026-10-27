import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Loader2,
  UserRound,
} from 'lucide-react';
import {
  AdmissionApplication,
  AdmissionStatus,
  STATUS_OPTIONS,
  STATUS_LABELS,
  admissionsListQueryPrefix,
  downloadAdmissionPdf,
  fetchWithAdminSession,
  formatDate,
  parseAdminRemarks,
  statusBadgeClasses,
} from '../lib/admissions.js';
import { AdminSelect } from '../components/AdminSelect.js';

export const AdmissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [detailStatus, setDetailStatus] = useState<AdmissionStatus>('SUBMITTED');
  const [note, setNote] = useState('');

  const {
    data: detail,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin_admission_detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await fetchWithAdminSession(`/api/v1/admissions/applications/${encodeURIComponent(id!)}`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to load application.');
      return result.data as AdmissionApplication;
    },
  });

  useEffect(() => {
    if (detail) {
      setDetailStatus(detail.status);
      setNote(parseAdminRemarks(detail.adminRemarks).note);
    }
  }, [detail]);

  const updateStatus = useMutation({
    mutationFn: async ({ status, adminRemarks }: { status: AdmissionStatus; adminRemarks: string }) => {
      const response = await fetchWithAdminSession(`/api/v1/admissions/admin/applications/${encodeURIComponent(id!)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminRemarks: adminRemarks || null }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to update application status.');
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin_admission_detail', id] });
      void queryClient.invalidateQueries({ queryKey: admissionsListQueryPrefix });
    },
  });

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center gap-2 py-24 font-sans text-sm text-stone-500">
        <Loader2 size={20} className="animate-spin text-brand-700" />
        Loading application details...
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="w-full space-y-4 py-16 text-center font-sans">
        <p className="text-sm font-semibold text-rose-700">Could not load this admission application.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-800"
        >
          Retry
        </button>
        <div>
          <Link to="/admissions" className="text-xs font-semibold text-brand-700 underline">
            Back to admissions
          </Link>
        </div>
      </div>
    );
  }

  const media = parseAdminRemarks(detail.adminRemarks);
  const photoSrc = detail.photoUrl || media.photoUrl;
  const signatureSrc = detail.signatureUrl || media.signatureUrl;

  const infoRows: [string, string][] = [
    ['Date of birth', formatDate(detail.dob)],
    ['Gender', detail.gender],
    ['Aadhaar number', detail.aadhaarNumber],
    ['Category', detail.category],
    ['Blood group', detail.bloodGroup || '—'],
    ['Place of birth', detail.placeOfBirth || '—'],
    ['Nationality', detail.nationality || '—'],
    ['Mother tongue', detail.motherTongue || '—'],
    ['Primary phone', detail.primaryPhone],
    ['Alternate phone', detail.alternatePhone || '—'],
    ['Email', detail.email],
    ["Father's name", detail.fatherName],
    ["Father's occupation", detail.fatherOccupation || '—'],
    ["Mother's name", detail.motherName],
    ["Mother's occupation", detail.motherOccupation || '—'],
    ['Previous school', detail.previousSchool || '—'],
    ['Previous class', detail.previousClass || '—'],
    ['Previous percentage', detail.previousPercentage != null ? `${detail.previousPercentage}%` : '—'],
    ['Academic year', detail.academicYear],
    ['Submitted on', formatDate(detail.createdAt)],
  ];

  return (
    <div className="w-full space-y-6 font-sans">
      <Link
        to="/admissions"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 transition hover:text-brand-700"
      >
        <ArrowLeft size={14} />
        Back to student admissions
      </Link>

      <header className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          {photoSrc ? (
            <img
              src={photoSrc}
              alt={detail.studentName}
              className="h-28 w-22 rounded-xl border border-stone-200 object-cover"
              style={{ width: '88px', height: '112px' }}
            />
          ) : (
            <span className="flex h-28 w-22 items-center justify-center rounded-xl bg-sky-50 text-sky-800" style={{ width: '88px', height: '112px' }}>
              <UserRound size={28} />
            </span>
          )}
          <div>
            <p className="font-mono text-xs font-semibold text-brand-700">{detail.applicationNumber}</p>
            <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">{detail.studentName}</h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-500">
              <Building2 size={13} className="text-stone-400" />
              {detail.institutionName}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
              <GraduationCap size={13} className="text-stone-400" />
              {detail.gradeApplied}
              {detail.stream ? ` — ${detail.stream}` : ''} · {detail.academicYear}
            </p>
            <span className={`mt-2.5 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClasses(detail.status)}`}>
              {STATUS_LABELS[detail.status]}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void downloadAdmissionPdf(detail.id, detail.applicationNumber).catch(() => undefined)}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 shadow-xs transition hover:bg-stone-50"
        >
          <Download size={15} />
          Download PDF
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Candidate photo & signature */}
        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <h2 className="flex items-center gap-2 text-base font-bold text-stone-900">
            <FileText size={18} className="text-brand-700" />
            Candidate documents
          </h2>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Passport photo</p>
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={`Passport photo of ${detail.studentName}`}
                className="mt-2 rounded-xl border border-stone-200 bg-stone-50 object-cover"
                style={{ width: '128px', height: '160px' }}
              />
            ) : (
              <p className="mt-2 rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center text-[11px] text-stone-400">
                No photo uploaded with this application.
              </p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Signature</p>
            {signatureSrc ? (
              <img
                src={signatureSrc}
                alt={`Signature of ${detail.studentName}`}
                className="mt-2 rounded-xl border border-stone-200 bg-white p-1 object-contain"
                style={{ maxHeight: '80px' }}
              />
            ) : (
              <p className="mt-2 rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center text-[11px] text-stone-400">
                No signature uploaded with this application.
              </p>
            )}
          </div>
        </section>

        {/* Full particulars */}
        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs xl:col-span-2">
          <h2 className="flex items-center gap-2 text-base font-bold text-stone-900">
            <UserRound size={18} className="text-brand-700" />
            Application particulars
          </h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs sm:grid-cols-3">
            {infoRows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{label}</dt>
                <dd className="mt-0.5 font-medium text-stone-900">{value}</dd>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Residential address</dt>
              <dd className="mt-0.5 font-medium text-stone-900">
                {detail.address}, {detail.village}, {detail.taluka}, {detail.district}, {detail.state} — {detail.pincode}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Status update */}
      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6">
        <div>
          <h2 className="text-base font-bold text-stone-900">Review & update status</h2>
          <p className="mt-1 text-xs text-stone-500">
            Current status: <strong className="text-stone-900">{STATUS_LABELS[detail.status]}</strong>
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-stone-700">Status</span>
            <AdminSelect
              compact={false}
              value={detailStatus}
              onChange={(val) => setDetailStatus(val as AdmissionStatus)}
              icon={CheckCircle2}
              options={STATUS_OPTIONS.map((status) => ({
                value: status,
                label: STATUS_LABELS[status],
              }))}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-stone-700">Internal remarks (optional)</span>
            <textarea
              rows={3}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Notes visible only to admins..."
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={updateStatus.isPending}
            onClick={() => updateStatus.mutate({ status: detailStatus, adminRemarks: note })}
            className="rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50"
          >
            {updateStatus.isPending ? 'Saving...' : 'Save status'}
          </button>
          {updateStatus.isSuccess && (
            <span className="text-xs font-semibold text-emerald-700">Status updated successfully.</span>
          )}
          {updateStatus.isError && (
            <span role="alert" className="text-xs font-semibold text-rose-700">
              {updateStatus.error.message}
            </span>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdmissionDetailPage;
