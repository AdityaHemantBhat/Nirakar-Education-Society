import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Upload, Save, CheckCircle2, AlertCircle, LogOut, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const FacultyPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saveMessage, setSaveMessage] = useState('');

  const [formData, setFormData] = useState<any>({
    institutionCode: 'NIRAKAR_HS',
    designation: '',
    department: '',
    subjects: ['English'],
    qualification: '',
    experience: '',
    bio: '',
    achievements: [],
    photoUrl: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['faculty_my_profile'],
    queryFn: async () => {
      const res = await fetch('/api/v1/faculty/me');
      if (!res.ok) throw new Error('Faculty profile not registered');
      const json = await res.json();
      setFormData({
        ...json.data,
        subjects: json.data.subjects || ['English'],
      });
      return json.data;
    },
  });

  const { data: unreadMessageCount = 0 } = useQuery({
    queryKey: ['facultyOwnUnreadCount'],
    queryFn: async () => {
      const res = await fetch('/api/v1/faculty-messages/faculty/unread-count');
      if (!res.ok) throw new Error('Could not load unread message count');
      const json = await res.json();
      return typeof json.data?.count === 'number' ? json.data.count : 0;
    },
    enabled: Boolean(profile),
    refetchInterval: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: async (updated: any) => {
      const res = await fetch('/api/v1/faculty/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Failed to update faculty profile');
      return res.json();
    },
    onSuccess: () => {
      setSaveMessage('Profile submitted for administrative approval.');
      queryClient.invalidateQueries({ queryKey: ['faculty_my_profile'] });
      setTimeout(() => setSaveMessage(''), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    navigate('/faculty/login');
  };

  if (isLoading) {
    return <div className="p-8 font-mono text-xs text-stone-500">Loading faculty self-service portal...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Faculty Portal
            </span>
            <h1 className="font-serif text-2xl font-bold text-stone-900 mt-2">
              Faculty Profile Management
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-serif font-bold transition-colors flex items-center gap-1.5"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Approval Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 block">Current Approval Status:</span>
            <span
              className={`font-serif text-base font-bold uppercase mt-1 inline-block ${
                profile?.status === 'PUBLISHED'
                  ? 'text-emerald-700'
                  : profile?.status === 'PENDING'
                  ? 'text-amber-700'
                  : 'text-stone-600'
              }`}
            >
              {profile?.status || 'PENDING'}
            </span>
          </div>

          <div className="text-right text-xs text-stone-500">
            {profile?.status === 'PUBLISHED'
              ? 'Your profile is live on the institution microsite'
              : 'Edits require verification by school administrator'}
          </div>
        </div>

        <Link
          to="/faculty/messages"
          className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <MessageSquare size={19} />
            </span>
            <div>
              <p className="font-serif text-base font-bold text-stone-900">Parent & student messages</p>
              <p className="mt-1 text-xs text-stone-500">Open your profile inquiries and reply securely.</p>
            </div>
          </div>
          {unreadMessageCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-700 px-2 text-xs font-bold text-white">
              {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
            </span>
          )}
        </Link>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          {saveMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{saveMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Teacher / HOD Physics"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Science / Mathematics"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                Educational Qualification *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. M.Sc., B.Ed."
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                Teaching Experience *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 14 Years"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
              Subjects Taught (comma separated) *
            </label>
            <input
              type="text"
              required
              value={formData.subjects?.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  subjects: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700"
            />
          </div>

          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
              Professional Biography
            </label>
            <textarea
              rows={4}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-serif text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Save size={15} />
            <span>Submit Profile for Review</span>
          </button>
        </form>
      </div>
    </div>
  );
};
