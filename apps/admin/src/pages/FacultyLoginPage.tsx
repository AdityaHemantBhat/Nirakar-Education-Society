import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, ShieldAlert } from 'lucide-react';
import { AuthCaptchaNotice, useAuthCaptcha } from '../components/AuthCaptcha.js';

export const FacultyLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const getCaptchaToken = useAuthCaptcha();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const captchaToken = await getCaptchaToken('auth_faculty_login');
      const res = await fetch('/api/v1/auth/faculty/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, captchaToken }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Faculty authentication failed');
      }

      navigate('/faculty/me');
    } catch (err: any) {
      setError(err.message || 'Access restricted to faculty members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-800 flex items-center justify-center mx-auto">
            <Users size={22} />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wide">
            Faculty Portal Login
          </h1>
          <p className="text-xs text-stone-500 font-sans">
            Shri Nirakar • Tudal High School • S.S. Angle HSS
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
              Faculty Username or Email
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700"
            />
          </div>

          <div>
            <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700"
            />
          </div>

          <AuthCaptchaNotice />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-serif text-xs font-bold transition-all disabled:opacity-60 shadow-md"
          >
            {loading ? 'Authenticating...' : 'Sign In to Faculty Portal'}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
          Faculty accounts are issued directly by institutional principals.
        </div>
      </div>
    </div>
  );
};
