import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import {
  Lock,
  Mail,
  User,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Phone,
  Check,
  Building2,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect.js';
import { AuthCaptchaNotice, useAuthCaptcha } from '../components/AuthCaptcha.js';
import { notifyAuthChanged } from '../hooks/useCurrentAuthUser.js';

interface AlumniAuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AlumniAuthPage: React.FC<AlumniAuthPageProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const getCaptchaToken = useAuthCaptcha();

  // Determine initial mode based on prop or current URL
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    if (initialMode) return initialMode;
    return location.pathname.includes('register') ? 'register' : 'login';
  });

  // Dynamic card height measurement to eliminate empty white space on shorter forms
  const loginRef = useRef<HTMLDivElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const updateCardHeight = () => {
      if (mode === 'login' && loginRef.current) {
        setCardHeight(loginRef.current.offsetHeight);
      } else if (mode === 'register' && registerRef.current) {
        setCardHeight(registerRef.current.offsetHeight);
      }
    };

    updateCardHeight();

    const t1 = setTimeout(updateCardHeight, 40);
    const t2 = setTimeout(updateCardHeight, 200);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateCardHeight());
      if (loginRef.current) observer.observe(loginRef.current);
      if (registerRef.current) observer.observe(registerRef.current);
    }

    window.addEventListener('resize', updateCardHeight);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateCardHeight);
    };
  }, [mode]);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.includes('register')) {
        setMode('register');
      } else {
        setMode('login');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync mode if location changes externally
  useEffect(() => {
    if (location.pathname.includes('register')) {
      setMode('register');
    } else if (location.pathname.includes('login')) {
      setMode('login');
    }
  }, [location.pathname]);

  // Smooth in-page switch without full-page reloads or SVG transitions
  const switchMode = (newMode: 'login' | 'register') => {
    if (mode === newMode) return;
    setMode(newMode);
    const targetUrl = newMode === 'register' ? '/alumni/register' : '/account/login';
    window.history.pushState({ mode: newMode }, '', targetUrl);
  };

  // ==================== LOGIN STATE ====================
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const captchaToken = await getCaptchaToken('auth_alumni_login');
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword, captchaToken }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Invalid alumni credentials. Please verify username or password.');
      }

      if (json.data?.user) {
        localStorage.setItem('nirakar_auth_user', JSON.stringify(json.data.user));
        notifyAuthChanged();
      }
      const username = json.data?.user?.username;
      if (!username) {
        throw new Error('Signed in, but the alumni profile username was not returned.');
      }
      setLoginSuccess(true);
      setTimeout(() => {
        navigate(`/alumni/${encodeURIComponent(username)}`, { replace: true });
      }, 1000);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ==================== REGISTER STATE ====================
  const [regData, setRegData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    school: 'NIRAKAR_HS',
    batchYear: new Date().getFullYear() - 5,
    username: '',
    password: '',
    confirmPassword: '',
    consent: false,
  });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regData.password !== regData.confirmPassword) {
      setRegError('Passwords do not match. Please verify both password entries.');
      return;
    }

    if (!regData.consent) {
      setRegError('Please acknowledge the privacy policy & alumni code.');
      return;
    }

    setRegLoading(true);

    try {
      const captchaToken = await getCaptchaToken('auth_alumni_register');
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regData,
          batchYear: Number(regData.batchYear),
          captchaToken,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Registration could not be completed.');
      }

      if (!json.data?.user) {
        throw new Error('Registration succeeded, but the sign-in session could not be started. Please sign in.');
      }
      localStorage.setItem('nirakar_auth_user', JSON.stringify(json.data.user));
      notifyAuthChanged();
      navigate(`/alumni/${encodeURIComponent(json.data.user.username)}`, { replace: true });
    } catch (err: any) {
      setRegError(err.message || 'Could not complete alumni registration.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>
          {mode === 'login'
            ? 'Alumni & Community Sign In | Shri Nirakar Education Society'
            : 'Alumni Registration & Enrollment | Shri Nirakar Education Society'}
        </title>
        <meta
          name="description"
          content="Official Alumni Sanctuary portal for Shri Nirakar High School, Tudal High School, and S. S. Angle Higher Secondary School."
        />
      </Helmet>

      <Navbar />

      {/* Hero Banner: Seamlessly tucked under Navbar golden curve */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden text-center">
        <HeroWaves opacity={0.85} />

        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-flex items-center gap-1.5">
            <User size={13} />
            <span>Alumni Network</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            {mode === 'login' ? 'Alumni & Community Portal' : 'Alumni Registration & Enrollment'}
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Reconnecting graduates across generations of Shri Nirakar Vidyalaya, Tudal High School, and S. S. Angle Higher Secondary School.
          </p>
        </div>
      </div>

      {/* SVG Curve finishing the hero banner */}
      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      {/* Main Full-Width Stretched Content Container */}
      <main className="w-full flex-1 py-8 sm:py-14">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Alumni Community Heritage */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-6 lg:sticky lg:top-28">
              <div className="bg-[#0b132b] text-white rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center">
                    <GraduationCap size={24} />
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-widest font-serif font-bold text-amber-300">
                      Alumni Sanctuary
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1 text-white">
                      Instant Access & Verified Badges
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                    Every alumnus receives immediate access to our alumni network upon sign up. You can view all batch records, search for classmates, and read publications with zero waiting time.
                  </p>

                  <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} />
                      </div>
                      <span className="text-stone-300">
                        Alumni community, publications & classmate directory
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} />
                      </div>
                      <span className="text-stone-300">
                        Verified alumnus badge upon record attestation
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} />
                      </div>
                      <span className="text-stone-300">
                        Historical batch photographs and class archives
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Batch Archive Link */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-sm text-xs text-stone-600 space-y-2">
                <div className="font-serif font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-700" />
                  <span>Looking for Vintage Photographs?</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Explore our historic class archives and graduation ceremonies spanning from 1968 to present day in the{' '}
                  <a href="/batch-photos" className="text-amber-800 font-semibold underline">
                    Batch Photo Archives →
                  </a>
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Sliding Auth Station */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-5 sm:space-y-6 w-full min-w-0">
              
              {/* Segmented Pill Switcher with Smooth Slide Indicator */}
              <div className="bg-white p-1 sm:p-1.5 rounded-2xl border border-stone-200/90 shadow-sm flex items-center w-full max-w-md mx-auto sm:mx-0 relative">
                <div
                  className={`absolute top-1 bottom-1 sm:top-1.5 sm:bottom-1.5 rounded-xl bg-[#0b132b] transition-all duration-500 ease-in-out shadow-md ${
                    mode === 'login' ? 'left-1 w-[calc(50%-4px)] sm:left-1.5 sm:w-[calc(50%-6px)]' : 'left-[calc(50%+2px)] w-[calc(50%-4px)] sm:left-[calc(50%+3px)] sm:w-[calc(50%-6px)]'
                  }`}
                />

                <button
                  type="button"
                  data-no-transition="true"
                  onClick={() => switchMode('login')}
                  className={`relative z-10 flex-1 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-bold rounded-xl transition-colors duration-300 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 select-none ${
                    mode === 'login' ? 'text-amber-300' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Lock size={14} className="shrink-0" />
                  <span className="truncate">Alumni Sign In</span>
                </button>

                <button
                  type="button"
                  data-no-transition="true"
                  onClick={() => switchMode('register')}
                  className={`relative z-10 flex-1 py-2.5 sm:py-3 text-center text-xs sm:text-sm font-bold rounded-xl transition-colors duration-300 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 select-none ${
                    mode === 'register' ? 'text-amber-300' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <UserPlus size={14} className="shrink-0" />
                  <span className="truncate">Enrollment</span>
                </button>
              </div>

              {/* Sliding Forms Container Track (Overflow hidden + flex track + dynamic height animation) */}
              <div
                style={{ height: cardHeight ? `${cardHeight}px` : undefined }}
                className="w-full bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden relative transition-[height] duration-500 ease-in-out"
              >
                <div
                  style={{ width: '200%', minWidth: '200%', maxWidth: 'none' }}
                  className={`flex items-start transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ease-in-out ${
                    mode === 'login' ? 'translate-x-0' : '-translate-x-1/2'
                  }`}
                >
                  
                  {/* ==================== SLIDE 1: ALUMNI LOGIN FORM ==================== */}
                  <div ref={loginRef} style={{ width: '50%', minWidth: '50%', maxWidth: '50%' }} className="shrink-0 p-5 sm:p-8 md:p-10 lg:p-12 space-y-6 sm:space-y-7">
                    <div className="space-y-1.5 border-b border-stone-100 pb-4 sm:pb-5">
                      <div className="flex items-center gap-2 text-amber-800 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                        <User size={13} className="shrink-0" />
                        <span>Member Access</span>
                      </div>
                      <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 leading-tight">
                        Sign In to Your Alumni Account
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 font-sans leading-relaxed">
                        Enter your registered username or email to access your profile, directories, and archives.
                      </p>
                    </div>

                    {loginError && (
                      <div className="p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 font-medium flex items-start gap-2.5">
                        <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                        <span className="break-words">{loginError}</span>
                      </div>
                    )}

                    {loginSuccess && (
                      <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-medium flex items-center gap-2.5">
                        <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
                        <span className="break-words">Welcome back! Navigating to Alumni Portal...</span>
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-6 font-sans">
                      {/* Identifier */}
                      <div className="space-y-2">
                        <label className="font-semibold text-stone-800 block text-sm">
                          Email Address or Directory Username *
                        </label>
                        <div className="relative">
                          <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. ananya_naik_ca or ananya.naik@alumni.nirakar.org"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-semibold text-stone-800 text-sm">Password *</label>
                          <span className="text-sm font-medium text-amber-800 hover:underline cursor-pointer">
                            Forgot Password?
                          </span>
                        </div>
                        <div className="relative">
                          <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full h-12 pl-11 pr-11 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer p-1"
                            aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                          >
                            {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <AuthCaptchaNotice />
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full h-12 rounded-xl bg-[#0b132b] hover:bg-[#16247e] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
                      >
                        {loginLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Sign In to Alumni Account</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Smooth Switch Callout */}
                    <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-600">
                      <div>
                        Not yet enrolled in the alumni network?{' '}
                        <button
                          type="button"
                          data-no-transition="true"
                          onClick={() => switchMode('register')}
                          className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer ml-1"
                        >
                          Register Your Profile →
                        </button>
                      </div>

                      <a
                        href="/alumni"
                        className="text-stone-500 hover:text-stone-800 transition-colors text-xs"
                      >
                        Explore Public Directory
                      </a>
                    </div>
                  </div>

                  {/* ==================== SLIDE 2: ALUMNI REGISTER FORM ==================== */}
                  <div ref={registerRef} style={{ width: '50%', minWidth: '50%', maxWidth: '50%' }} className="shrink-0 p-5 sm:p-8 md:p-10 lg:p-12 space-y-6 sm:space-y-7">
                    <div className="space-y-1.5 border-b border-stone-100 pb-4 sm:pb-5">
                      <div className="flex items-center gap-2 text-amber-800 text-[11px] sm:text-xs font-serif font-bold uppercase tracking-wider">
                        <UserPlus size={13} className="shrink-0" />
                        <span>Alumni Verification Registry</span>
                      </div>
                      <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 leading-tight">
                        Enroll in Alumni Directory
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 font-sans leading-relaxed">
                        Enter your academic credentials from Shri Nirakar Vidyalaya, Tudal High School, or S. S. Angle Higher Secondary School.
                      </p>
                    </div>

                    {regError && (
                      <div className="p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 font-medium flex items-start gap-2.5">
                        <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                        <span className="break-words">{regError}</span>
                      </div>
                    )}

                      <form onSubmit={handleRegisterSubmit} className="space-y-6 font-sans">
                        
                        {/* Name Grid */}
                        <div className="space-y-2">
                          <label className="font-semibold text-stone-800 text-sm block">
                            Full Legal Name *
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <input
                                type="text"
                                required
                                placeholder="First Name *"
                                value={regData.firstName}
                                onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                              />
                            </div>

                            <div className="space-y-1">
                              <input
                                type="text"
                                placeholder="Middle Name (Optional)"
                                value={regData.middleName}
                                onChange={(e) => setRegData({ ...regData, middleName: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                              />
                            </div>

                            <div className="space-y-1">
                              <input
                                type="text"
                                required
                                placeholder="Last Name *"
                                value={regData.lastName}
                                onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="font-semibold text-stone-800 block text-sm">Email Address *</label>
                            <input
                              type="email"
                              required
                              placeholder="sanket@alumni.nirakar.org"
                              value={regData.email}
                              onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                              className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-semibold text-stone-800 block text-sm">Mobile Phone Number *</label>
                            <input
                              type="tel"
                              required
                              placeholder="+91 98230 77812"
                              value={regData.phone}
                              onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                              className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                            />
                          </div>
                        </div>

                        {/* School and Batch Year */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="font-semibold text-stone-800 block text-sm">Alma Mater School *</label>
                            <CustomSelect
                              value={regData.school}
                              onChange={(val) => setRegData({ ...regData, school: val })}
                              options={[
                                { value: 'NIRAKAR_HS', label: 'Shri Nirakar Vidyalaya' },
                                { value: 'TUDAL_HS', label: 'Tudal High School' },
                                { value: 'ANGLE_HSS', label: 'S. S. Angle Higher Secondary School' },
                              ]}
                              className="w-full bg-stone-50"
                              menuClassName="w-full"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-semibold text-stone-800 block text-sm">Passing Batch Year *</label>
                            <input
                              type="number"
                              required
                              min={1960}
                              max={new Date().getFullYear()}
                              value={regData.batchYear}
                              onChange={(e) => setRegData({ ...regData, batchYear: parseInt(e.target.value) || 2020 })}
                              className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-mono focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                            />
                          </div>
                        </div>

                        {/* Directory Username */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-stone-800 block text-sm">
                            Unique Directory Username *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. sanket_prabhu"
                            value={regData.username}
                            onChange={(e) => setRegData({ ...regData, username: e.target.value.toLowerCase().trim() })}
                            className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-mono focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                          />
                          <p className="text-xs text-stone-400">
                            Public profile link: nirakar.org/alumni/{regData.username || 'username'}
                          </p>
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <label className="font-semibold text-stone-800 block text-sm">
                              Password (min 8 chars) *
                            </label>
                            <div className="relative">
                              <input
                                type={showRegPassword ? 'text' : 'password'}
                                required
                                minLength={8}
                                placeholder="••••••••••••"
                                value={regData.password}
                                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                                className="w-full h-12 pl-4 pr-11 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer p-1"
                                aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                              >
                                {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-semibold text-stone-800 block text-sm">Confirm Password *</label>
                            <div className="relative">
                              <input
                                type={showRegConfirmPassword ? 'text' : 'password'}
                                required
                                minLength={8}
                                placeholder="••••••••••••"
                                value={regData.confirmPassword}
                                onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                                className="w-full h-12 pl-4 pr-11 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer p-1"
                                aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                              >
                                {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Consent */}
                        <label className="flex items-start gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            required
                            checked={regData.consent}
                            onChange={(e) => setRegData({ ...regData, consent: e.target.checked })}
                            className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                          />
                          <span className="text-xs leading-relaxed text-stone-600">
                            I verify that I was enrolled as a student in the selected institution and consent to being listed in the Shree Nirakar alumni network. I understand that I receive immediate full viewing access upon login, and my verified badge will be attested by the Society administration.
                          </span>
                        </label>

                        {/* Submit Button */}
                        <AuthCaptchaNotice />
                        <button
                          type="submit"
                          disabled={regLoading}
                          className="w-full h-12 rounded-xl bg-[#0b132b] hover:bg-[#16247e] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {regLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Complete Alumni Registration & Enter Portal</span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </form>

                    {/* Smooth Switch Callout */}
                    <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-600">
                      <div>
                        Already registered an alumni profile?{' '}
                        <button
                          type="button"
                          data-no-transition="true"
                          onClick={() => switchMode('login')}
                          className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer ml-1"
                        >
                          ← Sign In to Alumni Sanctuary
                        </button>
                      </div>

                      <a
                        href="/alumni"
                        className="text-stone-500 hover:text-stone-800 transition-colors text-xs"
                      >
                        Explore Public Directory
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AlumniAuthPage;
