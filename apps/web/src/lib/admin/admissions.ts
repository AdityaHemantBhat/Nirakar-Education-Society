export type AdmissionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'ADMITTED' | 'REJECTED';

export type AdmissionApplication = {
  id: string;
  applicationNumber: string;
  academicYear: string;
  institutionCode: string;
  institutionName: string;
  gradeApplied: string;
  stream?: string | null;
  studentName: string;
  dob: string;
  gender: string;
  placeOfBirth?: string | null;
  nationality?: string | null;
  motherTongue?: string | null;
  aadhaarNumber: string;
  category: string;
  bloodGroup?: string | null;
  fatherName: string;
  fatherOccupation?: string | null;
  motherName: string;
  motherOccupation?: string | null;
  primaryPhone: string;
  alternatePhone?: string | null;
  email: string;
  address: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  previousSchool?: string | null;
  previousClass?: string | null;
  previousPercentage?: number | null;
  status: AdmissionStatus;
  adminRemarks?: string | null;
  photoUrl?: string | null;
  signatureUrl?: string | null;
  createdAt: string;
};

export type AdmissionConfig = {
  id: string;
  isOpen: boolean;
  academicYear: string;
  announcementText?: string | null;
  announcementVisible?: boolean;
  guidelinesUrl?: string | null;
};

export type ApplicationListResponse = {
  items: AdmissionApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const STATUS_OPTIONS: AdmissionStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ADMITTED', 'REJECTED'];

export const STATUS_LABELS: Record<AdmissionStatus, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  VERIFIED: 'Verified',
  ADMITTED: 'Admitted',
  REJECTED: 'Rejected',
};

export const INSTITUTION_NAMES: Record<string, string> = {
  NIRAKAR_HS: 'Shri Nirakar High School (Mashem)',
  ANGLE_HSS: 'S. S. Angle Higher Secondary School (Dapot)',
  TUDAL_HS: 'Tudal High School (Gaondongrem)',
};

export const admissionsListQueryPrefix = ['admin_admissions_list'] as const;

export async function fetchWithAdminSession(input: RequestInfo | URL, init: RequestInit = {}) {
  const requestInit: RequestInit = { ...init, credentials: 'include' };
  const response = await fetch(input, requestInit);
  if (response.status !== 401) return response;

  const refreshResponse = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  if (!refreshResponse.ok) return response;

  return fetch(input, requestInit);
}

export function parseAdminRemarks(adminRemarks?: string | null): {
  photoUrl?: string | null;
  signatureUrl?: string | null;
  note: string;
} {
  try {
    const parsed = JSON.parse(adminRemarks || '');
    if (parsed && typeof parsed === 'object') {
      return {
        photoUrl: parsed.photoUrl || null,
        signatureUrl: parsed.signatureUrl || null,
        note: typeof parsed.note === 'string' ? parsed.note : '',
      };
    }
  } catch {
    // Plain-text remarks (legacy)
  }
  return { photoUrl: null, signatureUrl: null, note: adminRemarks || '' };
}

export function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return value;
  }
}

export function statusBadgeClasses(status: AdmissionStatus) {
  switch (status) {
    case 'ADMITTED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'VERIFIED':
      return 'border-violet-200 bg-violet-50 text-violet-800';
    case 'UNDER_REVIEW':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'REJECTED':
      return 'border-rose-200 bg-rose-50 text-rose-800';
    default:
      return 'border-sky-200 bg-sky-50 text-sky-800';
  }
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadAdmissionPdf(applicationId: string, applicationNumber: string) {
  const response = await fetchWithAdminSession(
    apiUrl(`/api/v1/admissions/applications/${encodeURIComponent(applicationId)}/pdf`),
  );
  if (!response.ok) throw new Error('Failed to download application PDF.');
  const blob = await response.blob();
  triggerBlobDownload(blob, `Admission_${applicationNumber}.pdf`);
}

export async function downloadAdmissionsCsv() {
  const response = await fetchWithAdminSession('/api/v1/admissions/admin/export');
  if (!response.ok) throw new Error('Failed to export admissions CSV.');
  const blob = await response.blob();
  triggerBlobDownload(blob, 'Nirakar_Admissions.csv');
}
import { apiUrl } from './api.js';
