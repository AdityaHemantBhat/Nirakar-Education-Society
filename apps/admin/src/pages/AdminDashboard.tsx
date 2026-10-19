import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  Camera,
  FileText,
  GraduationCap,
  MessageSquare,
  Users,
} from 'lucide-react';

type DashboardSummary = {
  alumni: number;
  faculty: number;
  applications: number;
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load dashboard data (${response.status}).`);
  return response.json() as Promise<T>;
}

export const AdminDashboard: React.FC = () => {
  const { data, isPending, isError, refetch } = useQuery<DashboardSummary>({
    queryKey: ['admin_dashboard_summary'],
    queryFn: async () => {
      const [alumniResult, facultyResult, admissionsResult] = await Promise.all([
        getJson<{ data: unknown[] }>('/api/v1/alumni/admin/all'),
        getJson<{ data: unknown[] }>('/api/v1/faculty/admin/all'),
        getJson<{ data: { total: number } }>('/api/v1/admissions/admin/applications?page=1&limit=1'),
      ]);

      if (!Array.isArray(alumniResult.data) || !Array.isArray(facultyResult.data)) {
        throw new Error('The dashboard summary response was invalid.');
      }
      if (typeof admissionsResult.data?.total !== 'number') {
        throw new Error('The admissions summary response was invalid.');
      }

      return {
        alumni: alumniResult.data.length,
        faculty: facultyResult.data.length,
        applications: admissionsResult.data.total,
      };
    },
    staleTime: 60_000,
  });

  const metrics = [
    { label: 'Alumni records', value: data?.alumni, icon: GraduationCap, tone: 'bg-amber-50 text-amber-800' },
    { label: 'Faculty profiles', value: data?.faculty, icon: Users, tone: 'bg-emerald-50 text-emerald-800' },
    { label: 'Admission applications', value: data?.applications, icon: FileText, tone: 'bg-sky-50 text-sky-800' },
  ];

  const managementLinks = [
    {
      title: 'Admissions',
      description: 'Review submitted applications and update their status.',
      path: '/admissions',
      icon: GraduationCap,
      tone: 'bg-sky-50 text-sky-800',
    },
    {
      title: 'Alumni',
      description: 'Review alumni records and verification status.',
      path: '/alumni',
      icon: Users,
      tone: 'bg-amber-50 text-amber-800',
    },
    {
      title: 'Faculty',
      description: 'Manage faculty profiles, departments, and approvals.',
      path: '/faculty',
      icon: BookOpen,
      tone: 'bg-emerald-50 text-emerald-800',
    },
    {
      title: 'Notices & content',
      description: 'Update the information published on the school website.',
      path: '/content',
      icon: FileText,
      tone: 'bg-violet-50 text-violet-800',
    },
    {
      title: 'Messages',
      description: 'View and respond to conversations from the community.',
      path: '/messages',
      icon: MessageSquare,
      tone: 'bg-rose-50 text-rose-800',
    },
    {
      title: 'Batch photos',
      description: 'Organize the school batch photo archive.',
      path: '/batch-photos',
      icon: Camera,
      tone: 'bg-stone-100 text-stone-700',
    },
    {
      title: 'School Magazine',
      description: 'Publish and manage magazine editions.',
      path: '/magazines',
      icon: BookOpen,
      tone: 'bg-orange-50 text-orange-800',
    },
  ];

  return (
    <div className="w-full space-y-6 font-sans">
      <header className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Administration</p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-stone-500">
            A quick overview of records and tools for the society’s three institutions.
          </p>
        </div>
        <Link
          to="/magazines"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          <BookOpen size={17} />
          Manage magazines
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Current records">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-600">{label}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
                <Icon size={18} />
              </span>
            </div>
            {isPending ? (
              <div className="mt-3 h-8 w-20 animate-pulse rounded-md bg-stone-100" aria-label={`Loading ${label}`} />
            ) : isError ? (
              <p className="mt-2 text-2xl font-bold text-stone-400" aria-label={`${label} unavailable`}>—</p>
            ) : (
              <p className="mt-2 text-2xl font-bold text-stone-900">{value?.toLocaleString()}</p>
            )}
            <p className="mt-1 text-xs text-stone-400">Current database records</p>
          </article>
        ))}
      </section>

      {isError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span>Dashboard counts could not be loaded. Please try again.</span>
          <button type="button" onClick={() => void refetch()} className="font-semibold underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      <section aria-labelledby="management-tools-heading">
        <div className="mb-4">
          <h2 id="management-tools-heading" className="text-lg font-bold text-stone-900">Management tools</h2>
          <p className="mt-1 text-sm text-stone-500">Choose an area to continue.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {managementLinks.map(({ title, description, path, icon: Icon, tone }) => (
            <Link
              key={path}
              to={path}
              className="group flex min-h-32 items-start gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-xs transition-colors hover:border-stone-300 hover:bg-stone-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-700"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                <Icon size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 text-sm font-semibold text-stone-900">
                  {title}
                  <ArrowRight size={16} className="shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" />
                </span>
                <span className="mt-1.5 block text-xs leading-5 text-stone-500">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
