import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  CreditCard,
  Image,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  Camera,
  MessageSquare,
} from 'lucide-react';

class AdminSessionError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'AdminSessionError';
  }
}

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
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
      return { role: role as string };
    },
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (sessionError instanceof AdminSessionError && [401, 403].includes(sessionError.status)) {
      navigate('/login', { replace: true });
    }
  }, [navigate, sessionError]);

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
            onClick={() => navigate('/login', { replace: true })}
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
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Student Admissions', path: '/admissions', icon: GraduationCap },
    { label: 'School Magazine', path: '/magazines', icon: BookOpen },
    { label: 'Supporter Pass & Pricing', path: '/access', icon: CreditCard },
    { label: 'Alumni Verifications', path: '/alumni', icon: GraduationCap },
    { label: 'Batch Photos Archive', path: '/batch-photos', icon: Camera },
    { label: 'Faculty Directory', path: '/faculty', icon: Users },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Media Library', path: '/media', icon: Image },
    { label: 'Notices & Content', path: '/content', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#1a1d27] text-white flex flex-col justify-between transition-all duration-300 z-30 shrink-0 border-r border-stone-800`}
      >
        <div>
          {/* Logo Brand */}
          <div className="p-4 sm:p-5 border-b border-stone-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center font-serif font-bold text-white shrink-0 shadow-sm">
                SN
              </div>
              {sidebarOpen && (
                <div className="truncate">
                  <h1 className="font-semibold text-sm text-stone-100 tracking-tight truncate">Shree Nirakar</h1>
                  <span className="text-[11px] text-stone-400 font-sans tracking-wide block">Administration</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-700 text-white font-semibold'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
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
              );
            })}
          </nav>
        </div>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-stone-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
            <span>Administration Console</span>
            <span>/</span>
            <span className="text-stone-900 font-medium">Shree Nirakar Education Society</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="API System Online" />
            <span className="text-xs font-mono text-stone-600">Administrator</span>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
