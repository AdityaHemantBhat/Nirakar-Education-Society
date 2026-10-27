import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  Camera,
  MessageSquare,
  Library,
  ScrollText,
  Settings,
  ShieldCheck,
  Building2,
  Award,
  ShieldAlert,
} from 'lucide-react';

class AdminSessionError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'AdminSessionError';
  }
}

/**
 * The console's navigation.
 *
 * The items are grouped so that the sidebar reads as a list of areas
 * rather than one long column — the everyday work at the top, the people
 * and the money in the middle, and the things about the console itself at
 * the bottom.
 */
interface NavGroup {
  label: string;
  items: Array<{ label: string; path: string; icon: React.ComponentType<{ size?: number }> }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Everyday',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      { label: 'Student Admissions', path: '/admissions', icon: GraduationCap },
      { label: 'School Magazine', path: '/magazines', icon: BookOpen },
      { label: 'Digital Library', path: '/library', icon: Library },
      { label: 'Events & Notices', path: '/content', icon: FileText },
      { label: 'Institution Content', path: '/institutions', icon: Building2 },
      { label: 'Public Comments', path: '/comments', icon: MessageSquare },
      { label: 'Photo Gallery', path: '/gallery', icon: Camera },
      { label: 'Home Slider', path: '/home-slider', icon: Camera },
      { label: 'Homepage Popup', path: '/homepage-popup', icon: Bell },
      { label: 'Academic Results', path: '/academic-results', icon: Award },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Alumni Verifications', path: '/alumni', icon: Users },
      { label: 'Faculty Directory', path: '/faculty', icon: GraduationCap },
      { label: 'Batch Photos Archive', path: '/batch-photos', icon: Camera },
      { label: 'Messages', path: '/messages', icon: MessageSquare },
      { label: 'Privacy & Grievances', path: '/privacy-cases', icon: ShieldAlert },
    ],
  },
  {
    label: 'The Console',
    items: [
      { label: 'Activity Log', path: '/activity-log', icon: ScrollText },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    data: adminSession,
    error: sessionError,
    isPending: sessionPending,
    refetch: retrySessionCheck,
  } = useQuery({
    queryKey: ['adminSession'],
    queryFn: async () => {
      const response = await fetch('/api/v1/auth/me');
      if (!response.ok) {
        throw new AdminSessionError('Your admin session is not valid.', response.status);
      }

      const json = await response.json();
      const role = json.data?.role;
      if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role)) {
        throw new AdminSessionError('An administrator account is required.', 403);
      }
      return { role: role as string, username: json.data?.username as string | undefined };
    },
    retry: false,
    staleTime: 30_000,
  });

  /* The sign-in address is set by an administrator, so the console has to
     ask where it is rather than assume. */
  const { data: loginPathData } = useQuery({
    queryKey: ['adminLoginPath'],
    queryFn: async () => {
      const response = await fetch('/api/v1/settings/login-path');
      if (!response.ok) return { path: 'login' };
      const json = await response.json();
      return { path: (json.data?.path as string) || 'login' };
    },
    staleTime: 5 * 60_000,
  });

  const loginPath = loginPathData?.path ?? 'login';

  useEffect(() => {
    if (sessionError instanceof AdminSessionError && [401, 403].includes(sessionError.status)) {
      navigate(`/${loginPath}`, { replace: true });
    }
  }, [navigate, sessionError, loginPath]);

  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ['facultyConversationUnreadCount'],
    queryFn: async () => {
      const response = await fetch('/api/v1/faculty-messages/admin/unread-count');
      if (!response.ok) throw new Error('Could not load message counts');
      const json = await response.json();
      return typeof json.data?.count === 'number' ? json.data.count : 0;
    },
    refetchInterval: 30_000,
  });

  /* The console's own settings, which decide whether the administrator's
     email address is shown in the header. */
  const { data: consoleSettings } = useQuery({
    queryKey: ['consoleSettings'],
    queryFn: async () => {
      const response = await fetch('/api/v1/settings/console');
      if (!response.ok) return null;
      const json = await response.json();
      return json.data as { showAccountEmail?: boolean } | null;
    },
    staleTime: 60_000,
    retry: false,
  });

  /* The navigation groups filtered by role:
     - EDITOR:
       - Everyday (excluding Public Comments)
       - People (Alumni, Faculty, Batch Photos ONLY; no Messages, no Privacy & Grievances)
       - The Console (Settings only; no Activity Log)
     - SUPER_ADMIN & ADMIN: All items
  */
  const userRole = adminSession?.role;

  const visibleNavGroups = React.useMemo(() => {
    if (userRole !== 'EDITOR') {
      return NAV_GROUPS;
    }
    return [
      {
        label: 'Everyday',
        items: NAV_GROUPS[0].items.filter((item) => item.path !== '/comments'),
      },
      {
        label: 'People',
        items: NAV_GROUPS[1].items.filter(
          (item) => item.path !== '/messages' && item.path !== '/privacy-cases',
        ),
      },
      {
        label: 'The Console',
        items: NAV_GROUPS[2].items.filter((item) => item.path !== '/activity-log'),
      },
    ].filter((g) => g.items.length > 0);
  }, [userRole]);

  if (sessionPending || (sessionError instanceof AdminSessionError && [401, 403].includes(sessionError.status))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
      </div>
    );
  }

  if (!adminSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 p-6 text-center">
        <p className="text-sm text-stone-600">Could not verify your administrator session. Check your connection and try again.</p>
        <div className="flex gap-3">
          <button
            onClick={() => void retrySessionCheck()}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Try again
          </button>
          <button
            onClick={() => navigate(`/${loginPath}`, { replace: true })}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    navigate(`/${loginPath}`);
  };

  /* The section the current page belongs to, so the header can name it. */
  const currentSection =
    visibleNavGroups.find((group) => group.items.some((item) => item.path === location.pathname))
      ?.label ?? 'The Console';

  const isMagazinePage = location.pathname.replace(/\/$/, '').endsWith('/magazines');

  const currentPage =
    visibleNavGroups.flatMap((g) => g.items).find((item) => item.path === location.pathname)?.label ??
    'Administration';

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* ============================== The sidebar ============================== */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-[68px]'
        } bg-[#141824] text-white flex flex-col transition-all duration-300 z-30 shrink-0 border-r border-white/[0.06]`}
      >
        {/* The brand */}
        <div className={`flex items-center border-b border-white/[0.06] py-4 ${sidebarOpen ? 'gap-3 px-4' : 'justify-center gap-1 px-1'}`}>
          {sidebarOpen && (
            <>
              <img
                src="/images/Logo.webp"
                alt=""
                className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain p-0.5"
              />
              <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold leading-tight text-white">
                Shree Nirakar
              </p>
              <p className="truncate text-[11px] leading-tight text-stone-400">
                Administration Console
              </p>
              </div>
            </>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse the sidebar' : 'Expand the sidebar'}
            className={`shrink-0 rounded-lg p-1 text-stone-400 transition hover:bg-white/10 hover:text-white ${sidebarOpen ? '' : 'ml-0.5'}`}
          >
            {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>

        {/* The navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {visibleNavGroups.map((group) => (
            <div key={group.label}>
              {sidebarOpen && (
                <p className="mb-1.5 px-2.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-stone-500">
                  {group.label}
                </p>
              )}

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        end={item.path === '/'}
                        title={sidebarOpen ? undefined : item.label}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                            isActive
                              ? 'bg-brand-700 font-semibold text-white'
                              : 'text-stone-400 hover:bg-white/[0.06] hover:text-white'
                          } ${sidebarOpen ? '' : 'justify-center'}`
                        }
                      >
                        <Icon size={17} />
                        {sidebarOpen && (
                          <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                            <span className="truncate">{item.label}</span>
                            {item.path === '/messages' && unreadMessages > 0 && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-stone-900">
                                {unreadMessages > 99 ? '99+' : unreadMessages}
                              </span>
                            )}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* The account */}
        <div className="border-t border-white/[0.06] p-3">
          {sidebarOpen && adminSession.username && (
            <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-white/[0.04] px-2.5 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
                {adminSession.username.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-semibold text-stone-200">
                  {adminSession.username}
                </p>
                <p className="truncate text-[10px] text-stone-500">
                  {adminSession.role.replace('_', ' ').toLowerCase()}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title={sidebarOpen ? undefined : 'Sign out'}
            className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] text-stone-400 transition-colors hover:bg-white/[0.06] hover:text-white ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ============================== The main pane ============================== */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 border-b border-stone-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="hidden font-mono text-stone-500 sm:inline">{currentSection}</span>
            <span className="hidden text-stone-300 sm:inline">/</span>
            <span className="truncate font-semibold text-stone-900">{currentPage}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-[11px] text-stone-500 sm:flex">
              <ShieldCheck size={13} className="text-emerald-600" />
              Session secure
            </span>
            <span className="flex items-center gap-2 text-xs text-stone-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" title="The system is online" />
              {consoleSettings?.showAccountEmail ? adminSession.username : 'Administrator'}
            </span>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto ${isMagazinePage ? 'p-0' : 'p-6 md:p-8'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
