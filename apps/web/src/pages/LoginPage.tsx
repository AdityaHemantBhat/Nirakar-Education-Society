import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { Lock, User, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Authentication failed');
      }

      const user = json.data?.user;
      if (!user?.username) {
        throw new Error('Signed in, but the alumni profile username was not returned.');
      }
      localStorage.setItem('nirakar_auth_user', JSON.stringify(user));
      navigate(`/alumni/${encodeURIComponent(user.username)}`, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] flex flex-col font-sans">
      <Helmet>
        <title>Alumni & Reader Login | Shree Nirakar Education Society</title>
        <meta name="description" content="Sign in to your Shree Nirakar verified alumni profile and access Daily Magazine archives." />
      </Helmet>

      <Navbar />

      {/* Hero Banner with Thread-like Curved Wave Strips */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 text-center relative z-0 overflow-hidden">
        <HeroWaves opacity={0.85} />

        <div className="max-w-3xl mx-auto space-y-3 relative z-10">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-flex items-center gap-1.5">
            <User size={13} />
            <span>Alumni & Reader Community</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Alumni & Reader Portal
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Sign in to manage your verified alumni profile, reconnect with Canacona classmates, and explore Daily Magazine editions.
          </p>
        </div>
      </div>

      {/* Organic Section Transition */}
      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      <main className="w-full flex-1 flex items-center justify-center px-4 py-8 sm:py-14">
        <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-10 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#0b132b] border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-md">
              <User size={26} />
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">Alumni Sign In</h2>
            <p className="text-xs text-stone-500 font-sans">
              Enter your registered username or email to access your profile.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-700 mb-1">
                Email or Username
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. rahul.desai or email@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700 bg-stone-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-serif text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <Lock size={16} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 flex flex-col gap-2 text-center text-xs text-stone-500">
            <div>
              <span>Not registered in the Alumni Directory? </span>
              <Link to="/register" className="text-brand-700 font-serif font-bold hover:underline">
                Create Account
              </Link>
            </div>
            <div>
              <Link to="/faculty/login" className="text-stone-500 hover:text-stone-800 transition-colors">
                Are you a faculty member? Sign in here &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
