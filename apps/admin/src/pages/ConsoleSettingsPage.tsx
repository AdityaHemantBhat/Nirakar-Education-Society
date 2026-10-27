import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  KeyRound,
  Link2,
  Clock,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Info,
  Users,
  UserPlus,
  Trash2,
  Lock,
  Shield,
  UserCheck,
} from 'lucide-react';
import { fetchWithAdminSession } from '../lib/admissions.js';
import {
  ConsoleSettings,
  DEFAULT_CONSOLE_SETTINGS,
} from '../lib/settings.js';
import { AdminSelect } from '../components/AdminSelect.js';

interface AdminUserItem {
  id: string;
  email: string;
  username: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
  isSuspended: boolean;
  createdAt: string;
}

/** How strong the new password looks, so the administrator is guided. */
function passwordStrength(password: string): { label: string; tone: string; percent: number } {
  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: 'Weak', tone: 'bg-rose-500', percent: 20 };
  if (score <= 2) return { label: 'Fair', tone: 'bg-amber-500', percent: 40 };
  if (score <= 3) return { label: 'Good', tone: 'bg-sky-500', percent: 65 };
  return { label: 'Strong', tone: 'bg-emerald-500', percent: 100 };
}

export const ConsoleSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ConsoleSettings>(DEFAULT_CONSOLE_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  /* The password form */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  /* User Management State */
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'ADMIN' | 'EDITOR'>('ADMIN');
  const [userActionMessage, setUserActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetTargetUser, setResetTargetUser] = useState<AdminUserItem | null>(null);
  const [resetTargetNewPassword, setResetTargetNewPassword] = useState('');

  // Fetch current administrator identity to know their role
  const { data: adminMe } = useQuery({
    queryKey: ['adminSession'],
    queryFn: async () => {
      const response = await fetch('/api/v1/auth/me');
      if (!response.ok) return null;
      const json = await response.json();
      return json.data as { username: string; role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR'; sub: string; email: string } | null;
    },
  });

  const isSuperAdmin = adminMe?.role === 'SUPER_ADMIN';
  const isRegularAdmin = adminMe?.role === 'ADMIN';
  const isEditor = adminMe?.role === 'EDITOR';

  // Only SUPER_ADMIN and ADMIN can read/manage console settings
  const { data, isLoading } = useQuery<ConsoleSettings>({
    queryKey: ['consoleSettings'],
    queryFn: async () => {
      const response = await fetchWithAdminSession('/api/v1/settings/console');
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to load the console settings.');
      }
      return result.data as ConsoleSettings;
    },
    enabled: isSuperAdmin || isRegularAdmin,
  });

  // Query administrator accounts (SUPER_ADMIN and ADMIN can view)
  const { data: adminUsers = [], isLoading: isUsersLoading, refetch: refetchUsers } = useQuery<AdminUserItem[]>({
    queryKey: ['adminConsoleUsers'],
    queryFn: async () => {
      const response = await fetchWithAdminSession('/api/v1/settings/users');
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to load admin accounts.');
      }
      return result.data as AdminUserItem[];
    },
    enabled: isSuperAdmin || isRegularAdmin,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (settings: ConsoleSettings) => {
      const response = await fetchWithAdminSession('/api/v1/settings/console', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to save the settings.');
      }
      return result.data as ConsoleSettings;
    },
    onSuccess: (settings) => {
      setForm(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      void queryClient.invalidateQueries({ queryKey: ['consoleSettings'] });
    },
    onError: (err: Error) => {
      setPasswordMessage({ type: 'error', text: err.message });
      setTimeout(() => setPasswordMessage(null), 6000);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (input: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const response = await fetchWithAdminSession('/api/v1/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to change the password.');
      }
      return result.data;
    },
    onSuccess: () => {
      setPasswordMessage({
        type: 'success',
        text: 'Your password has been changed. You will need to sign in again.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 8000);
    },
    onError: (err: Error) => {
      setPasswordMessage({ type: 'error', text: err.message });
      setTimeout(() => setPasswordMessage(null), 6000);
    },
  });

  // Create new Admin / Editor mutation (Super Admin only)
  const createUserMutation = useMutation({
    mutationFn: async (payload: { email: string; username: string; password: string; role: 'ADMIN' | 'EDITOR' }) => {
      const response = await fetchWithAdminSession('/api/v1/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to create account.');
      }
      return result.data;
    },
    onSuccess: (created) => {
      setUserActionMessage({
        type: 'success',
        text: `Successfully created ${created.role} account for ${created.username}.`,
      });
      setNewAdminEmail('');
      setNewAdminUsername('');
      setNewAdminPassword('');
      void refetchUsers();
      setTimeout(() => setUserActionMessage(null), 6000);
    },
    onError: (err: Error) => {
      setUserActionMessage({ type: 'error', text: err.message });
      setTimeout(() => setUserActionMessage(null), 6000);
    },
  });

  // Reset target user password mutation (Super Admin and Admin for permitted accounts)
  const resetUserPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const response = await fetchWithAdminSession(`/api/v1/settings/users/${userId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to reset password.');
      }
      return result.data;
    },
    onSuccess: (data) => {
      setUserActionMessage({
        type: 'success',
        text: `Password for ${data.username} has been successfully reset.`,
      });
      setResetTargetUser(null);
      setResetTargetNewPassword('');
      setTimeout(() => setUserActionMessage(null), 6000);
    },
    onError: (err: Error) => {
      setUserActionMessage({ type: 'error', text: err.message });
      setTimeout(() => setUserActionMessage(null), 6000);
    },
  });

  // Delete user mutation (Super Admin only, Super Admin cannot be deleted)
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetchWithAdminSession(`/api/v1/settings/users/${userId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Unable to delete account.');
      }
      return result.data;
    },
    onSuccess: (data) => {
      setUserActionMessage({
        type: 'success',
        text: `Administrator account ${data.username} has been permanently deleted.`,
      });
      void refetchUsers();
      setTimeout(() => setUserActionMessage(null), 6000);
    },
    onError: (err: Error) => {
      setUserActionMessage({ type: 'error', text: err.message });
      setTimeout(() => setUserActionMessage(null), 6000);
    },
  });

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    passwordMutation.mutate({ currentPassword, newPassword, confirmPassword });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionMessage(null);
    createUserMutation.mutate({
      email: newAdminEmail.trim(),
      username: newAdminUsername.trim(),
      password: newAdminPassword,
      role: newAdminRole,
    });
  };

  const handleDeleteUser = (user: AdminUserItem) => {
    if (user.role === 'SUPER_ADMIN') {
      alert('The Super Admin account cannot be deleted under any circumstances.');
      return;
    }
    if (!window.confirm(`Permanently delete account "${user.username}" (${user.role})? This cannot be undone.`)) {
      return;
    }
    deleteUserMutation.mutate(user.id);
  };

  const loginUrl = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/${
    form.adminLoginPath
  }`;

  const copyLoginUrl = async () => {
    try {
      await navigator.clipboard.writeText(loginUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* The clipboard is not available — the address is on screen to copy. */
    }
  };

  const strength = passwordStrength(newPassword);

  return (
    <div className="space-y-6">
      {/* ============================== The header ============================== */}
      <header className="border-b border-stone-200 pb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">
          The Console
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">Settings & Accounts</h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-stone-500">
          Manage system preferences, account credentials, and console administrators.
        </p>
      </header>

      {/* Global Message Banner */}
      {userActionMessage && (
        <div
          role="alert"
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
            userActionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{userActionMessage.text}</span>
          <button type="button" onClick={() => setUserActionMessage(null)} className="underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* ============================== SUPER ADMIN & ADMIN: USER MANAGEMENT SECTION ============================== */}
      {!isEditor && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white">
                <Users size={17} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-stone-900">Console Administrators & Editors</h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  {isSuperAdmin
                    ? 'As Super Admin, you can create new admins, reset passwords, and manage team permissions.'
                    : 'Administrators can view team members and reset authorized editor passwords.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                <Shield size={13} className="text-stone-700" />
                Role: {adminMe?.role}
              </span>
            </div>
          </div>

          {/* User List Table */}
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Administrator</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isUsersLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-stone-400">Loading administrators...</td>
                  </tr>
                ) : adminUsers.map((user) => {
                  const isTargetSuperAdmin = user.role === 'SUPER_ADMIN';
                  const isSelf = user.id === adminMe?.sub;

                  return (
                    <tr key={user.id} className="hover:bg-stone-50/60 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-stone-900 flex items-center gap-2">
                          {user.username}
                          {isSelf && (
                            <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded border border-stone-200">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-stone-400 text-[11px] font-mono">{user.email}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        {user.role === 'SUPER_ADMIN' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Super Admin
                          </span>
                        ) : user.role === 'ADMIN' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-900 border border-sky-300">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            Editor
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-stone-500">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-2">
                        {/* Password Reset Trigger */}
                        {(!isTargetSuperAdmin || isSuperAdmin) && (
                          <button
                            type="button"
                            onClick={() => {
                              setResetTargetUser(user);
                              setResetTargetNewPassword('');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                            title="Reset Password"
                          >
                            <Lock size={12} />
                            Reset
                          </button>
                        )}

                        {/* Delete Account Button:
                            - ONLY Super Admin can delete
                            - NO ONE can delete a Super Admin account
                        */}
                        {isSuperAdmin && !isTargetSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={deleteUserMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                            title="Delete administrator account"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Reset Password Modal / Drawer for target user */}
          {resetTargetUser && (
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Lock size={14} className="text-brand-700" />
                  Reset Password for: <span className="font-mono">{resetTargetUser.username}</span> ({resetTargetUser.role})
                </h4>
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="text-stone-400 hover:text-stone-700 text-xs font-bold"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="password"
                  placeholder="Enter new strong password (min 10 chars)..."
                  value={resetTargetNewPassword}
                  onChange={(e) => setResetTargetNewPassword(e.target.value)}
                  className="w-full sm:flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs outline-none focus:border-brand-700"
                />
                <button
                  type="button"
                  disabled={resetUserPasswordMutation.isPending || resetTargetNewPassword.length < 10}
                  onClick={() =>
                    resetUserPasswordMutation.mutate({
                      userId: resetTargetUser.id,
                      newPassword: resetTargetNewPassword,
                    })
                  }
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 disabled:opacity-40 transition"
                >
                  {resetUserPasswordMutation.isPending ? 'Resetting...' : 'Confirm Reset Password'}
                </button>
              </div>
            </div>
          )}

          {/* Super Admin: Create New Admin / Editor Form */}
          {isSuperAdmin && (
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus size={16} className="text-brand-700" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Create New Administrator or Editor
                </h3>
              </div>
              <p className="text-xs text-stone-500">
                Created accounts can immediately log into this admin panel using the custom login URL.
              </p>

              <form onSubmit={handleCreateUser} autoComplete="off" className="space-y-4 pt-1">
                {/* Fake inputs to absorb aggressive browser autofill */}
                <input type="text" style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />
                <input type="password" style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      name="new_admin_email_field"
                      placeholder="name@nirakar.org"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full h-10 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-brand-700 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      name="new_admin_username_field"
                      placeholder="username"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      className="w-full h-10 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-brand-700 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      name="new_admin_password_field"
                      placeholder="Minimum 10 characters..."
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full h-10 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-brand-700 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Role *</label>
                    <AdminSelect
                      value={newAdminRole}
                      onChange={(val) => setNewAdminRole(val as 'ADMIN' | 'EDITOR')}
                      compact
                      icon={Shield}
                      options={[
                        { value: 'ADMIN', label: 'Admin' },
                        { value: 'EDITOR', label: 'Editor' },
                      ]}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={
                      createUserMutation.isPending ||
                      !newAdminEmail ||
                      !newAdminUsername ||
                      newAdminPassword.length < 10
                    }
                    className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition"
                  >
                    {createUserMutation.isPending ? 'Creating Account...' : '+ Create Account'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      )}

      {/* ============================== CONSOLE HOUSEKEEPING (SUPER ADMIN & ADMIN ONLY) ============================== */}
      {!isEditor && (
        <>
          {/* ============================== The address ============================== */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Link2 size={17} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-stone-900">Sign-in address</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                  Where you and the other administrators go to sign into this console.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Current address
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-800">
                    {loginUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => void copyLoginUrl()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                  >
                    {copied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Change the address
                </label>
                <div className="flex max-w-md items-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-700 focus-within:border-brand-700 focus-within:bg-white">
                  <span className="text-stone-400 select-none">{window.location.origin}/</span>
                  <input
                    type="text"
                    value={form.adminLoginPath}
                    onChange={(e) => setForm({ ...form, adminLoginPath: e.target.value })}
                    className="flex-1 bg-transparent px-1 py-1 font-mono text-xs text-stone-900 outline-none"
                    placeholder="signin-7f3a"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-stone-500">
                  Use only letters, numbers and hyphens. Avoid generic names like “login” or “admin”.
                </p>
              </div>
            </div>
          </section>

          {/* ============================== Housekeeping ============================== */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Clock size={17} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-stone-900">Housekeeping</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                  How long a sign-in lasts, and how much of the activity log is kept.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Session length
                </label>
                <AdminSelect
                  value={String(form.sessionLengthHours)}
                  onChange={(val) =>
                    setForm({ ...form, sessionLengthHours: Number(val) })
                  }
                  options={[
                    { value: '1', label: '1 hour' },
                    { value: '8', label: '8 hours' },
                    { value: '24', label: '1 day' },
                    { value: '168', label: '1 week' },
                    { value: '720', label: '30 days' },
                  ]}
                />
                <p className="mt-1.5 text-[11px] text-stone-500">
                  How long you stay signed in before you have to sign in again.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Keep the activity log for
                </label>
                <AdminSelect
                  value={String(form.auditRetentionDays)}
                  onChange={(val) =>
                    setForm({ ...form, auditRetentionDays: Number(val) })
                  }
                  options={[
                    { value: '30', label: '30 days' },
                    { value: '90', label: '90 days' },
                    { value: '365', label: '1 year' },
                    { value: '1095', label: '3 years' },
                    { value: '3650', label: '10 years' },
                  ]}
                />
                <p className="mt-1.5 text-[11px] text-stone-500">
                  Entries older than this are cleared away.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => saveMutation.mutate(form)}
                  disabled={saveMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800 disabled:opacity-40"
                >
                  {saveMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                  Save console preferences
                </button>
                {saved && (
                  <span className="ml-3 text-xs font-semibold text-emerald-600">
                    Preferences saved successfully.
                  </span>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ============================== CHANGE OWN PASSWORD (ALL ROLES) ============================== */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <KeyRound size={17} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-stone-900">Your account password</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
              Changing your password ends every other active session you have open.
            </p>
          </div>
        </div>

        <form onSubmit={changePassword} className="max-w-md space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Current password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3.5 py-2.5 pr-10 text-xs text-stone-900 outline-none transition focus:border-brand-700 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide the password' : 'Show the password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 transition hover:text-stone-700"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* The strength */}
            {newPassword.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.tone}`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-stone-500">{strength.label}</span>
              </div>
            )}

            <p className="mt-1.5 text-[11px] leading-relaxed text-stone-500">
              At least 10 characters, with an upper-case letter, a lower-case letter and a number.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Confirm the new password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={`w-full rounded-lg border bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:bg-white ${
                confirmPassword.length > 0 && confirmPassword !== newPassword
                  ? 'border-rose-300 focus:border-rose-500'
                  : 'border-stone-200 focus:border-brand-700'
              }`}
            />
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <p className="mt-1.5 text-[11px] font-semibold text-rose-700">
                The two passwords do not match.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={
                passwordMutation.isPending ||
                !currentPassword ||
                newPassword.length < 10 ||
                newPassword !== confirmPassword
              }
              className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-stone-800 disabled:opacity-40"
            >
              {passwordMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShieldCheck size={14} />
              )}
              Change password
            </button>

            {passwordMessage?.type === 'success' && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={13} />
                {passwordMessage.text}
              </p>
            )}
          </div>
        </form>
      </section>

      {/* A note about permissions */}
      <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
        <Info size={15} className="mt-0.5 shrink-0 text-sky-700" />
        <p className="text-[11.5px] leading-relaxed text-sky-900">
          Super Administrators hold master control over user accounts and console settings. Administrators can view team accounts and manage content, but cannot delete fellow administrators or the Super Admin. Editors focus on everyday media and content.
        </p>
      </div>
    </div>
  );
};

export default ConsoleSettingsPage;
