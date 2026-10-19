import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { AuthCaptchaNotice, useAuthCaptcha } from '../components/AuthCaptcha.js';
import schoolEmblem from '../../../web/public/images/Logo.webp';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const getCaptchaToken = useAuthCaptcha();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const captchaToken = await getCaptchaToken('auth_admin_login');
      const res = await fetch('/api/v1/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, captchaToken }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Administrative authentication failed');
      }

      navigate('/');
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'We could not sign you in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f3] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex min-h-[76px] w-full max-w-6xl items-center gap-3 px-5 sm:px-8">
          <img
            src={schoolEmblem}
            alt="Shree Nirakar Education Society emblem"
            width={44}
            height={44}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-11 w-11 object-contain"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-5 text-stone-900 sm:text-base">Shree Nirakar Education Society</p>
            <p className="text-xs leading-5 text-stone-500">Administration</p>
          </div>
        </div>
      </header>

      <section className="flex flex-1 items-start justify-center px-4 py-12 sm:items-center sm:px-6 sm:py-16">
        <div className="w-full max-w-[420px] rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="mb-7 border-b border-stone-100 pb-5">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Administrator sign in</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Sign in with your school administrator account.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <ShieldAlert size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-identifier" className="mb-1.5 block text-sm font-medium text-stone-800">
                Email or username
              </label>
              <input
                id="admin-identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 hover:border-stone-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-stone-800">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 pr-11 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 hover:border-stone-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-stone-500 hover:text-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AuthCaptchaNotice className="justify-start pt-0.5" />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-wait disabled:opacity-65"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 border-t border-stone-100 pt-5 text-xs leading-5 text-stone-500">
            Need help signing in? Contact the society office.
          </p>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-4 text-xs text-stone-500 sm:px-8">
          Shree Nirakar Education Society · Canacona, Goa
        </div>
      </footer>
    </main>
  );
};
