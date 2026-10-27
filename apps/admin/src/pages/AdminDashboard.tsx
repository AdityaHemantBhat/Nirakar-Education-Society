import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
  Library,
  MessageSquare,
  Plus,
  RefreshCw,
  ScrollText,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { fetchWithAdminSession, formatDate } from '../lib/admissions.js';
import { actionTone, describeAction, entrySummary, formatAuditDate } from '../lib/settings.js';
import { getPublicSiteUrl } from '../lib/site.js';

interface DashboardStats {
  admissionsTotal: number;
  admissionsPending: number;
  admissionsOpen: boolean;
  academicYear: string;
  alumniTotal: number;
  alumniUnverified: number;
  facultyTotal: number;
  facultyPending: number;
  magazinesTotal: number;
  libraryVolumes: number;
  unreadMessages: number;
  pendingGrievances: number;
  pendingPrivacyRequests: number;
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string;
    createdAt: string;
    user?: { username: string } | null;
    details?: Record<string, unknown> | null;
  }>;
  recentApplications: Array<{
    id: string;
    applicationNumber: string;
    studentName: string;
    institutionCode: string;
    gradeApplied: string;
    status: string;
    createdAt: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  // Current time for warm greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Fetch administrator identity
  const { data: adminMe } = useQuery({
    queryKey: ['admin_dashboard_me'],
    queryFn: async () => {
      const res = await fetchWithAdminSession('/api/v1/auth/me');
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as { username: string; role: string; email?: string } | null;
    },
    staleTime: 300_000,
  });

  const userRole = adminMe?.role;
  const isEditor = userRole === 'EDITOR';

  // Fetch comprehensive admin overview (scoped conditionally if user is EDITOR)
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<DashboardStats>({
    queryKey: ['admin_dashboard_full_stats', userRole],
    queryFn: async () => {
      // Editors are restricted from messages, grievances, privacy cases, and audit-logs
      const fetchPromises: Promise<Response>[] = [
        fetchWithAdminSession('/api/v1/admissions/admin/applications?page=1&limit=5'),
        fetchWithAdminSession('/api/v1/admissions/config'),
        fetchWithAdminSession('/api/v1/alumni/admin/all'),
        fetchWithAdminSession('/api/v1/faculty/admin/all'),
        fetchWithAdminSession('/api/v1/faculty/pending'),
        fetchWithAdminSession('/api/v1/magazine/admin/issues'),
        fetchWithAdminSession('/api/v1/library/admin?page=1&limit=1'),
      ];

      if (!isEditor) {
        fetchPromises.push(
          fetchWithAdminSession('/api/v1/faculty-messages/admin/unread-count'),
          fetchWithAdminSession('/api/v1/privacy/admin/grievances'),
          fetchWithAdminSession('/api/v1/privacy/admin/requests'),
          fetchWithAdminSession('/api/v1/audit-log?page=1&limit=6'),
        );
      }

      const results = await Promise.allSettled(fetchPromises);
      const [
        admissionsRes,
        admissionsConfigRes,
        alumniRes,
        facultyRes,
        facultyPendingRes,
        magazinesRes,
        libraryRes,
        messagesRes,
        grievancesRes,
        privacyRes,
        auditRes,
      ] = results;

      // Admissions
      let admissionsTotal = 0;
      let recentApplications: DashboardStats['recentApplications'] = [];
      if (admissionsRes.status === 'fulfilled' && admissionsRes.value.ok) {
        const json = await admissionsRes.value.json().catch(() => null);
        admissionsTotal = json?.data?.total || 0;
        recentApplications = (json?.data?.items || []).slice(0, 5);
      }

      // Admissions Config
      let admissionsOpen = false;
      let academicYear = '2025–2026';
      if (admissionsConfigRes.status === 'fulfilled' && admissionsConfigRes.value.ok) {
        const json = await admissionsConfigRes.value.json().catch(() => null);
        if (json?.data) {
          admissionsOpen = Boolean(json.data.isOpen);
          academicYear = json.data.academicYear || academicYear;
        }
      }

      // Alumni
      let alumniTotal = 0;
      let alumniUnverified = 0;
      if (alumniRes.status === 'fulfilled' && alumniRes.value.ok) {
        const json = await alumniRes.value.json().catch(() => null);
        const list = Array.isArray(json?.data) ? json.data : [];
        alumniTotal = list.length;
        alumniUnverified = list.filter((a: any) => a.verificationLevel === 'UNVERIFIED').length;
      }

      // Faculty
      let facultyTotal = 0;
      if (facultyRes.status === 'fulfilled' && facultyRes.value.ok) {
        const json = await facultyRes.value.json().catch(() => null);
        facultyTotal = Array.isArray(json?.data) ? json.data.length : 0;
      }

      // Pending faculty
      let facultyPending = 0;
      if (facultyPendingRes.status === 'fulfilled' && facultyPendingRes.value.ok) {
        const json = await facultyPendingRes.value.json().catch(() => null);
        facultyPending = Array.isArray(json?.data) ? json.data.length : 0;
      }

      // Magazines
      let magazinesTotal = 0;
      if (magazinesRes.status === 'fulfilled' && magazinesRes.value.ok) {
        const json = await magazinesRes.value.json().catch(() => null);
        magazinesTotal = Array.isArray(json?.data) ? json.data.length : 0;
      }

      // Library
      let libraryVolumes = 0;
      if (libraryRes.status === 'fulfilled' && libraryRes.value.ok) {
        const json = await libraryRes.value.json().catch(() => null);
        libraryVolumes = json?.data?.total || 0;
      }

      // Messages unread (Admins & Super Admins only)
      let unreadMessages = 0;
      if (messagesRes && messagesRes.status === 'fulfilled' && messagesRes.value.ok) {
        const json = await messagesRes.value.json().catch(() => null);
        unreadMessages = json?.data?.unreadCount || 0;
      }

      // Grievances (Admins & Super Admins only)
      let pendingGrievances = 0;
      if (grievancesRes && grievancesRes.status === 'fulfilled' && grievancesRes.value.ok) {
        const json = await grievancesRes.value.json().catch(() => null);
        const list = Array.isArray(json?.data) ? json.data : [];
        pendingGrievances = list.filter((g: any) => g.status === 'RECEIVED' || g.status === 'UNDER_REVIEW').length;
      }

      // Privacy requests (Admins & Super Admins only)
      let pendingPrivacyRequests = 0;
      if (privacyRes && privacyRes.status === 'fulfilled' && privacyRes.value.ok) {
        const json = await privacyRes.value.json().catch(() => null);
        const list = Array.isArray(json?.data) ? json.data : [];
        pendingPrivacyRequests = list.filter((r: any) => r.status === 'RECEIVED' || r.status === 'UNDER_REVIEW').length;
      }

      // Audit Log (Admins & Super Admins only)
      let recentActivity: DashboardStats['recentActivity'] = [];
      if (auditRes && auditRes.status === 'fulfilled' && auditRes.value.ok) {
        const json = await auditRes.value.json().catch(() => null);
        recentActivity = json?.data?.items || [];
      }

      return {
        admissionsTotal,
        admissionsPending: recentApplications.filter((a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length,
        admissionsOpen,
        academicYear,
        alumniTotal,
        alumniUnverified,
        facultyTotal,
        facultyPending,
        magazinesTotal,
        libraryVolumes,
        unreadMessages,
        pendingGrievances,
        pendingPrivacyRequests,
        recentActivity,
        recentApplications,
      };
    },
    staleTime: 30_000,
  });

  const institutionBadge = (code: string) => {
    switch (code) {
      case 'NIRAKAR_HS':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Shri Nirakar Vidyalaya</span>;
      case 'ANGLE_HSS':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">S. S. Angle HSS</span>;
      case 'TUDAL_HS':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">Tudal High School</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">{code}</span>;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ADMITTED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Admitted</span>;
      case 'VERIFIED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-violet-100 text-violet-800 border border-violet-300">Verified</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">Under Review</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">Submitted</span>;
    }
  };

  const pendingAttentionCount =
    (stats?.alumniUnverified || 0) +
    (stats?.facultyPending || 0) +
    (!isEditor ? (stats?.unreadMessages || 0) + (stats?.pendingGrievances || 0) + (stats?.pendingPrivacyRequests || 0) : 0);

  return (
    <div className="w-full space-y-6 font-sans pb-12">
      {/* ================= 1. REFINED COLOR-ACCENTED HERO (SOLID ACCENTS, NO GRADIENTS) ================= */}
      <section className="rounded-2xl border border-stone-300 bg-stone-900 text-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold tracking-wide uppercase bg-brand-800 text-brand-200 border border-brand-700">
                {isEditor ? 'NES Editorial Desk' : 'NES Admin Console'}
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-300">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {greeting}, {adminMe?.username ? adminMe.username : isEditor ? 'Editor' : 'Administrator'}
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed">
              {isEditor
                ? 'Editorial and publications dashboard for managing announcements, school magazines, academic results, and verified archives.'
                : 'Consolidated administration overview across Shri Nirakar Vidyalaya, S. S. Angle HSS, and Tudal High School.'}{' '}
              You have{' '}
              <span className="text-amber-400 font-bold underline decoration-amber-500/50 underline-offset-2">
                {pendingAttentionCount} {pendingAttentionCount === 1 ? 'item' : 'items'}
              </span>{' '}
              requiring review today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition disabled:opacity-50"
              title="Refresh dashboard stats"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
            <a
              href={getPublicSiteUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-700 hover:bg-brand-600 text-white shadow-xs transition"
            >
              <ExternalLink size={13} />
              Public Website
            </a>
          </div>
        </div>

        {/* Status Strip inside hero with crisp solid accents */}
        <div className={`mt-5 pt-5 border-t border-stone-800 grid grid-cols-2 ${isEditor ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} gap-4`}>
          <div className="space-y-0.5">
            <span className="text-xs text-stone-400 font-medium block">Admissions Window</span>
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${stats?.admissionsOpen ? 'bg-emerald-400' : 'bg-stone-500'}`} />
              <span className="text-sm font-semibold text-white">
                {stats?.admissionsOpen ? `Open (${stats?.academicYear})` : 'Closed'}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs text-stone-400 font-medium block">Alumni Verifications</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-amber-300">
                {stats?.alumniUnverified ?? 0} pending
              </span>
              {(stats?.alumniUnverified || 0) > 0 && (
                <Link to="/alumni" className="text-xs font-medium text-amber-400 hover:text-amber-300 underline underline-offset-2">Review &rarr;</Link>
              )}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs text-stone-400 font-medium block">Faculty Submissions</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-emerald-300">
                {stats?.facultyPending ?? 0} awaiting
              </span>
              {(stats?.facultyPending || 0) > 0 && (
                <Link to="/faculty" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Review &rarr;</Link>
              )}
            </div>
          </div>

          {!isEditor && (
            <div className="space-y-0.5">
              <span className="text-xs text-stone-400 font-medium block">Parent Inquiries</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-sky-300">
                  {stats?.unreadMessages ?? 0} unread
                </span>
                {(stats?.unreadMessages || 0) > 0 && (
                  <Link to="/messages" className="text-xs font-medium text-sky-400 hover:text-sky-300 underline underline-offset-2">Inbox &rarr;</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= 2. CORE SYSTEM METRICS (DISTINCT COLOR CARDS, FLAT BORDERS) ================= */}
      <section aria-labelledby="core-metrics-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="core-metrics-heading" className="text-xs font-bold uppercase tracking-wider text-stone-700">
            {isEditor ? 'Editorial & Media Overview' : 'Database Overview'}
          </h2>
          <span className="text-xs text-stone-500 font-medium">Live counts</span>
        </div>

        <div className={`grid grid-cols-2 sm:grid-cols-3 ${isEditor ? 'lg:grid-cols-5' : 'lg:grid-cols-6'} gap-3`}>
          {/* Admissions - Sky Blue Accent */}
          <Link
            to="/admissions"
            className="group rounded-xl border border-sky-200 bg-sky-50/50 p-4 shadow-2xs hover:border-sky-400 hover:bg-sky-50 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="h-8 w-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                <FileText size={16} />
              </span>
              <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">Portal</span>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-bold text-sky-950">
                {isLoading ? '—' : stats?.admissionsTotal?.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-sky-800 mt-0.5 font-medium truncate">Admissions</p>
            </div>
          </Link>

          {/* Alumni - Amber Warm Accent */}
          <Link
            to="/alumni"
            className="group rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs hover:border-amber-400 hover:bg-amber-50 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="h-8 w-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                <GraduationCap size={16} />
              </span>
              {(stats?.alumniUnverified || 0) > 0 ? (
                <span className="text-xs font-bold text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded">
                  +{stats?.alumniUnverified}
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Live</span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-bold text-amber-950">
                {isLoading ? '—' : stats?.alumniTotal?.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-amber-800 mt-0.5 font-medium truncate">Alumni Directory</p>
            </div>
          </Link>

          {/* Faculty - Emerald Fresh Accent */}
          <Link
            to="/faculty"
            className="group rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs hover:border-emerald-400 hover:bg-emerald-50 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Users size={16} />
              </span>
              {(stats?.facultyPending || 0) > 0 ? (
                <span className="text-xs font-bold text-emerald-900 bg-emerald-200 px-1.5 py-0.5 rounded">
                  +{stats?.facultyPending}
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Staff</span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-bold text-emerald-950">
                {isLoading ? '—' : stats?.facultyTotal?.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-emerald-800 mt-0.5 font-medium truncate">Faculty Members</p>
            </div>
          </Link>

          {/* Digital Library - Indigo Rich Accent */}
          <Link
            to="/library"
            className="group rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-2xs hover:border-indigo-400 hover:bg-indigo-50 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Library size={16} />
              </span>
              <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">Books</span>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-bold text-indigo-950">
                {isLoading ? '—' : stats?.libraryVolumes?.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-indigo-800 mt-0.5 font-medium truncate">Library Volumes</p>
            </div>
          </Link>

          {/* School Magazine - Orange Warm Accent */}
          <Link
            to="/magazines"
            className="group rounded-xl border border-orange-200 bg-orange-50/50 p-4 shadow-2xs hover:border-orange-400 hover:bg-orange-50 transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="h-8 w-8 rounded-lg bg-orange-600 text-white flex items-center justify-center">
                <BookOpen size={16} />
              </span>
              <span className="text-xs font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded">Issues</span>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-bold text-orange-950">
                {isLoading ? '—' : stats?.magazinesTotal?.toLocaleString() ?? 0}
              </div>
              <p className="text-xs text-orange-800 mt-0.5 font-medium truncate">Magazines</p>
            </div>
          </Link>

          {/* Grievances & Privacy - Rose Crimson Accent (Omitted for EDITOR) */}
          {!isEditor && (
            <Link
              to="/privacy-cases"
              className="group rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-2xs hover:border-rose-400 hover:bg-rose-50 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="h-8 w-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                  <ShieldAlert size={16} />
                </span>
                {((stats?.pendingGrievances || 0) + (stats?.pendingPrivacyRequests || 0)) > 0 && (
                  <span className="text-xs font-bold text-rose-900 bg-rose-200 px-1.5 py-0.5 rounded">
                    {(stats?.pendingGrievances || 0) + (stats?.pendingPrivacyRequests || 0)}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <div className="text-xl sm:text-2xl font-bold text-rose-950">
                  {isLoading ? '—' : (stats?.pendingGrievances || 0) + (stats?.pendingPrivacyRequests || 0)}
                </div>
                <p className="text-xs text-rose-800 mt-0.5 font-medium truncate">Active Cases</p>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ================= 3. TWO-COLUMN: RECENT ADMISSIONS & RECENT AUDIT (OR EDITORIAL SUITE FOR EDITORS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left column: Recent Admission Applications (7 cols) */}
        <section className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span className="p-1 rounded bg-sky-100 text-sky-700">
                    <FileText size={15} />
                  </span>
                  Recent Admission Applications
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Latest online submissions for academic year {stats?.academicYear || '2025–2026'}.
                </p>
              </div>
              <Link
                to="/admissions"
                className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline flex items-center gap-1"
              >
                View all &rarr;
              </Link>
            </div>

            {isLoading ? (
              <div className="py-10 text-center text-xs text-stone-400">Loading recent applications...</div>
            ) : !stats?.recentApplications || stats.recentApplications.length === 0 ? (
              <div className="py-10 text-center text-stone-500 text-xs">
                No admission applications received yet.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 mt-1">
                {stats.recentApplications.map((app) => (
                  <div key={app.id} className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50/70 rounded-lg px-2 transition">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-stone-900 truncate">
                          {app.studentName}
                        </span>
                        <span className="text-xs font-mono font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                          #{app.applicationNumber}
                        </span>
                        {statusBadge(app.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        {institutionBadge(app.institutionCode)}
                        <span>Grade {app.gradeApplied}</span>
                        <span>· {formatDate(app.createdAt)}</span>
                      </div>
                    </div>

                    <Link
                      to={`/admissions/${app.id}`}
                      className="shrink-0 inline-flex items-center justify-center p-1.5 rounded-lg text-stone-500 hover:text-brand-700 hover:bg-brand-50 transition"
                      title="Inspect Application"
                    >
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span>Total applications received: <strong className="text-stone-900">{stats?.admissionsTotal ?? 0}</strong></span>
            <Link to="/admissions" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
              Admissions Portal &rarr;
            </Link>
          </div>
        </section>

        {/* Right column: Recent Activity & Audit Feed (5 cols for ADMIN / SUPER_ADMIN) OR Publishing Hub (for EDITOR) */}
        {!isEditor ? (
          <section className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <span className="p-1 rounded bg-stone-100 text-stone-700">
                      <ScrollText size={15} />
                    </span>
                    Recent System Activity
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Audit events recorded across the management console.
                  </p>
                </div>
                <Link
                  to="/activity-log"
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline flex items-center gap-1"
                >
                  Log &rarr;
                </Link>
              </div>

              {isLoading ? (
                <div className="py-10 text-center text-xs text-stone-400">Loading activity log...</div>
              ) : !stats?.recentActivity || stats.recentActivity.length === 0 ? (
                <div className="py-10 text-center text-stone-500 text-xs">
                  No recent activity recorded.
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {stats.recentActivity.map((event) => (
                    <div key={event.id} className="p-2.5 rounded-lg border border-stone-200 bg-stone-50 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${actionTone(event.action)}`}>
                          {describeAction(event.action)}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          {formatAuditDate(event.createdAt)}
                        </span>
                      </div>
                      <p className="font-medium text-stone-900 line-clamp-1 text-xs">
                        {entrySummary(event as any)}
                      </p>
                      {event.user?.username && (
                        <p className="text-xs text-stone-600">
                          by <span className="font-semibold text-stone-800">{event.user.username}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 text-center">
              <Link to="/activity-log" className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                View Complete Audit Trail &rarr;
              </Link>
            </div>
          </section>
        ) : (
          /* Editor Hub: Fast Publishing & Media Controls */
          <section className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <span className="p-1 rounded bg-amber-100 text-amber-800">
                      <Sparkles size={15} />
                    </span>
                    Editorial Quick Actions
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Fast shortcuts for publishing updates and media files.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 mt-3">
                <Link
                  to="/content"
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/80 transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-blue-100 text-blue-800">
                      <FileText size={16} />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-stone-900">Post New Circular / Event</div>
                      <div className="text-[11px] text-stone-500">Publish official notices with PDF downloads</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-stone-700 transition" />
                </Link>

                <Link
                  to="/magazines"
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/80 transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-orange-100 text-orange-800">
                      <BookOpen size={16} />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-stone-900">Upload Magazine Edition</div>
                      <div className="text-[11px] text-stone-500">Annual school magazines and periodicals</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-stone-700 transition" />
                </Link>

                <Link
                  to="/batch-photos"
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/80 transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                      <Camera size={16} />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-stone-900">Batch Photo Archive</div>
                      <div className="text-[11px] text-stone-500">Add class photos and student name tags</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-stone-700 transition" />
                </Link>

                <Link
                  to="/home-slider"
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/80 transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                      <Building2 size={16} />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-stone-900">Homepage Hero Slider</div>
                      <div className="text-[11px] text-stone-500">Update campus pictures and highlights</div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-stone-700 transition" />
                </Link>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 text-center">
              <Link to="/settings" className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                Manage My Password &rarr;
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* ================= 4. ALL WORKSPACES & MANAGEMENT MODULES (CURATED TONES) ================= */}
      <section aria-labelledby="all-tools-heading" className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 id="all-tools-heading" className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            {isEditor ? 'Permitted Editorial Workspaces' : 'Administrative Workspaces'}
          </h2>
          <p className="text-xs text-stone-500">
            {isEditor
              ? 'Authorized tools for everyday school content, publications, and faculty directories.'
              : 'All tools, registries, and publishing controls grouped by domain.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Everyday School Work */}
          <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm border-b border-blue-100 pb-2.5">
              <span className="p-1 rounded-md bg-blue-100 text-blue-800"><Building2 size={16} /></span>
              Academics & Everyday Content
            </div>
            <div className="space-y-1.5">
              <Link
                to="/admissions"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50/60 transition border border-transparent hover:border-blue-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">Student Admissions</div>
                  <div className="text-xs text-stone-500">Applications, dates, and student records</div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-blue-700 transition" />
              </Link>

              <Link
                to="/academic-results"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50/60 transition border border-transparent hover:border-blue-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">Academic Results</div>
                  <div className="text-xs text-stone-500">Board exams, merit lists, and rank cards</div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-blue-700 transition" />
              </Link>

              <Link
                to="/institutions"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50/60 transition border border-transparent hover:border-blue-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">Institution Pages & Committees</div>
                  <div className="text-xs text-stone-500">Banners, history, vision, and staff committees</div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-blue-700 transition" />
              </Link>

              <Link
                to="/content"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50/60 transition border border-transparent hover:border-blue-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">Notices, Events & News</div>
                  <div className="text-xs text-stone-500">Official circulars, gallery photos, and calendar</div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-blue-700 transition" />
              </Link>

              {/* Public comments ONLY visible to Super Admin and Admin, NOT Editor */}
              {!isEditor && (
                <Link
                  to="/comments"
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50/60 transition border border-transparent hover:border-blue-200 group"
                >
                  <div>
                    <div className="font-semibold text-xs text-stone-900">Public Comments</div>
                    <div className="text-xs text-stone-500">Review and moderate community replies</div>
                  </div>
                  <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-blue-700 transition" />
                </Link>
              )}
            </div>
          </div>

          {/* Publications & Media */}
          <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm border-b border-indigo-100 pb-2.5">
              <span className="p-1 rounded-md bg-indigo-100 text-indigo-800"><Library size={16} /></span>
              Publications & Media Archives
            </div>
            <div className="space-y-1.5">
              <Link
                to="/magazines"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50/60 transition border border-transparent hover:border-indigo-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">School Magazines</div>
                  <div className="text-xs text-stone-500">Upload PDF issues with 3D flipbook reader</div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-indigo-700 transition" />
              </Link>

              <Link
                to="/library"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50/60 transition border border-transparent hover:border-indigo-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">Digital Library</div>
                  <div className="text-xs text-stone-500">Curated textbooks, reference notes, and papers</div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-indigo-700 transition" />
              </Link>

              <Link
                to="/batch-photos"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50/60 transition border border-transparent hover:border-indigo-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">Batch Photo Archive</div>
                  <div className="text-xs text-stone-500">Class photographs across decades with student tagging</div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-indigo-700 transition" />
              </Link>

              <Link
                to="/home-slider"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50/60 transition border border-transparent hover:border-indigo-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">Home Hero Slider</div>
                  <div className="text-xs text-stone-500">Manage photos and promotional slides on homepage</div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-indigo-700 transition" />
              </Link>

              <Link
                to="/homepage-popup"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50/60 transition border border-transparent hover:border-indigo-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">Homepage Welcome Popup</div>
                  <div className="text-xs text-stone-500">Dedicated greeting or urgent announcement modal</div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-indigo-700 transition" />
              </Link>
            </div>
          </div>

          {/* People, Security & System */}
          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm border-b border-emerald-100 pb-2.5">
              <span className="p-1 rounded-md bg-emerald-100 text-emerald-800"><ShieldCheck size={16} /></span>
              {isEditor ? 'People & Personal Settings' : 'People, Inquiries & Governance'}
            </div>
            <div className="space-y-1.5">
              <Link
                to="/alumni"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50/60 transition border border-transparent hover:border-emerald-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">Alumni Verifications</div>
                  <div className="text-xs text-stone-500">Alumni directory, badges, and verification levels</div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-700 transition" />
              </Link>

              <Link
                to="/faculty"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50/60 transition border border-transparent hover:border-emerald-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">Faculty Directory</div>
                  <div className="text-xs text-stone-500">Staff listings, departments, ordering, and approvals</div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-700 transition" />
              </Link>

              {/* Messages & Grievances restricted from Editor */}
              {!isEditor && (
                <>
                  <Link
                    to="/messages"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50/60 transition border border-transparent hover:border-emerald-200 group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-stone-900">Parent & Visitor Messages</div>
                      <div className="text-xs text-stone-500">Direct inquiries, attachments, and messaging</div>
                    </div>
                    <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-700 transition" />
                  </Link>

                  <Link
                    to="/privacy-cases"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50/60 transition border border-transparent hover:border-emerald-200 group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-stone-900">Privacy & Grievances</div>
                      <div className="text-xs text-stone-500">Grievance cases, DPDP data requests, and audit logs</div>
                    </div>
                    <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-700 transition" />
                  </Link>
                </>
              )}

              <Link
                to="/settings"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50/60 transition border border-transparent hover:border-emerald-200 group"
              >
                <div>
                  <div className="font-semibold text-xs text-stone-900">
                    {isEditor ? 'Account Settings & Password' : 'Console Settings & Security'}
                  </div>
                  <div className="text-xs text-stone-500">
                    {isEditor ? 'Change your personal login password' : 'Secret login path, session timeout, and passwords'}
                  </div>
                </div>
                <ArrowRight size={13} className="text-stone-400 group-hover:translate-x-0.5 group-hover:text-emerald-700 transition" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. QUICK ACTIONS DOCK (RICH SOLID BRAND) ================= */}
      <section className="rounded-xl border border-stone-200 bg-brand-50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-700 text-white flex items-center justify-center shrink-0">
            <Compass size={17} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-brand-950">Publish announcements to parents and students</h4>
            <p className="text-xs text-brand-800">
              Create an official circular on the notices board or trigger a popup alert on the homepage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/content"
            className="flex-1 sm:flex-none text-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-brand-200 text-brand-800 hover:bg-brand-100 transition shadow-2xs"
          >
            New Notice
          </Link>
          <Link
            to="/homepage-popup"
            className="flex-1 sm:flex-none text-center px-3.5 py-2 rounded-lg text-xs font-semibold bg-brand-700 text-white hover:bg-brand-800 transition shadow-2xs"
          >
            Popup Announcement
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
