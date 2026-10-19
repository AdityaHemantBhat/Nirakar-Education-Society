import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { notifyAuthChanged } from '../hooks/useCurrentAuthUser.js';
import {
  Lock,
  Mail,
  Building2,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  BookOpen,
  Sparkles,
  Phone,
  Check,
  Briefcase,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect.js';
import { getDynamicDepartments } from '../data/departmentData.js';
import { AuthCaptchaNotice, useAuthCaptcha } from '../components/AuthCaptcha.js';

interface FacultyAuthPageProps {
  initialMode?: 'login' | 'register';
}

export const FacultyAuthPage: React.FC<FacultyAuthPageProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const getCaptchaToken = useAuthCaptcha();

  // Determine initial mode based on prop or current URL
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    if (initialMode) return initialMode;
    return location.pathname.includes('register') ? 'register' : 'login';
  });

  // Dynamic card height measurement to eliminate empty white space
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

  // Dynamic departments fetched from centralized registry (administered by Admin)
  const [departments, setDepartments] = useState<string[]>(() => getDynamicDepartments());
  const [customDept, setCustomDept] = useState('');
  const [isOtherDept, setIsOtherDept] = useState(false);

  useEffect(() => {
    // Initial fetch from server
    fetch('/api/v1/faculty/departments')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setDepartments(json.data);
        }
      })
      .catch(() => {});

    const handleDeptUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setDepartments(e.detail);
      } else {
        setDepartments(getDynamicDepartments());
      }
    };
    window.addEventListener('nirakar_departments_updated', handleDeptUpdate);
    return () => window.removeEventListener('nirakar_departments_updated', handleDeptUpdate);
  }, []);

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

  // Update mode when location changes externally
  useEffect(() => {
    if (location.pathname.includes('register')) {
      setMode('register');
    } else if (location.pathname.includes('login')) {
      setMode('login');
    }
  }, [location.pathname]);

  // Smooth in-page switch without full-page reloads or SVG screen wipes
  const switchMode = (newMode: 'login' | 'register') => {
    if (mode === newMode) return;
    setMode(newMode);
    const targetUrl = newMode === 'register' ? '/faculty/register' : '/faculty/login';
    window.history.pushState({ mode: newMode }, '', targetUrl);
  };

  // ==================== LOGIN STATE ====================
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [loginInstitution, setLoginInstitution] = useState('NIRAKAR_HS');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const captchaToken = await getCaptchaToken('auth_faculty_login');
      const res = await fetch('/api/v1/auth/faculty/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword, captchaToken }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Invalid faculty credentials. Please check your staff ID or password.');
      }

      const user = json.data?.user;
      if (!user) {
        throw new Error('Signed in, but your faculty account details were not returned.');
      }
      localStorage.setItem('nirakar_auth_user', JSON.stringify(user));
      notifyAuthChanged();
      const landingPath = user.facultyProfile?.id
        ? `/faculty/${encodeURIComponent(user.facultyProfile.id)}`
        : '/faculty';
      setLoginSuccess(true);
      setTimeout(() => {
        navigate(landingPath, { replace: true });
      }, 1000);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please check network or credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ==================== REGISTER STATE ====================
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    employeeCode: '',
    institutionCode: 'NIRAKAR_HS',
    department: departments[0] || 'Science & Wet Laboratories',
    qualification: '',
    experienceYears: '8', // Normal number string, not dropdown
    subjects: '',
    bio: '',
    password: '',
    confirmPassword: '',
    consent: false,
  });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSubmitted, setRegSubmitted] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regData.password !== regData.confirmPassword) {
      setRegError('Passwords do not match. Please verify both password entries.');
      return;
    }

    if (!regData.consent) {
      setRegError('Please acknowledge the Society Academic Code of Conduct declaration.');
      return;
    }

    setRegLoading(true);

    try {
      const captchaToken = await getCaptchaToken('auth_faculty_register');
      const finalDept = isOtherDept && customDept.trim() ? customDept.trim() : regData.department;
      const resolvedUsername = regData.username.trim()
        ? regData.username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
        : `${regData.firstName.toLowerCase()}.${regData.lastName.toLowerCase()}`.replace(/[^a-z0-9._-]/g, '');

      // Save application into pending queue so Admin can review and approve it
      const newApplication = {
        id: `fac-app-${Date.now()}`,
        firstName: regData.firstName,
        lastName: regData.lastName,
        name: `${regData.firstName} ${regData.lastName}`,
        username: resolvedUsername,
        email: regData.email,
        phone: regData.phone,
        employeeCode: regData.employeeCode || `NES-FAC-${Math.floor(1000 + Math.random() * 9000)}`,
        institutionCode: regData.institutionCode,
        institutionName:
          regData.institutionCode === 'NIRAKAR_HS'
            ? 'Shri Nirakar Vidyalaya'
            : regData.institutionCode === 'TUDAL_HS'
            ? 'Tudal High School'
            : 'S. S. Angle Higher Secondary School',
        department: finalDept,
        qualification: regData.qualification,
        experienceYears: Number(regData.experienceYears) || 1,
        experience: `${regData.experienceYears} Years`,
        subjects: regData.subjects ? regData.subjects.split(',').map((s) => s.trim()) : [],
        bio: regData.bio.trim(),
        appliedAt: new Date().toISOString(),
        status: 'PENDING', // Awaiting Admin Approval
      };

      // 1. Submit to backend API so it appears across all admin consoles
      const res = await fetch('/api/v1/faculty/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newApplication,
          password: regData.password,
          captchaToken,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error?.message || 'Server failed to record faculty registration application.');
      }

      // 2. Local storage backup
      try {
        const existingApps = JSON.parse(localStorage.getItem('nirakar_pending_faculty_apps') || '[]');
        existingApps.unshift(newApplication);
        localStorage.setItem('nirakar_pending_faculty_apps', JSON.stringify(existingApps));
        window.dispatchEvent(new Event('nirakar_pending_faculty_updated'));
      } catch {}

      setRegSubmitted(true);
    } catch (err: any) {
      setRegError(err.message || 'Registration request could not be processed.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>
          {mode === 'login'
            ? 'Faculty & Staff Portal Login | Shree Nirakar Education Society'
            : 'Educator Registration & Onboarding | Shree Nirakar Education Society'}
        </title>
        <meta
          name="description"
          content="Official faculty and educator portal for Shree Nirakar Education Society institutions in Canacona."
        />
      </Helmet>

      <Navbar />

      {/* Hero Banner: Seamlessly tucked under Navbar golden curve */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden text-center">
        <HeroWaves opacity={0.85} />

        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-flex items-center gap-1.5">
            <GraduationCap size={13} />
            <span>Faculty & Educator Portal</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            {mode === 'login' ? 'Faculty & Educator Portal' : 'Faculty Onboarding & Registration'}
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Secure self-service gateway for verified teachers, department heads, and academic mentors across Canacona campuses.
          </p>
        </div>
      </div>

      {/* Section Edge Transition */}
      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      {/* Main Full-Width Stretched Content Container */}
      <main className="w-full flex-1 py-8 sm:py-14">
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Society Heritage & Academic Privileges */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-6 lg:sticky lg:top-28">
              <div className="bg-[#0b132b] text-white rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 space-y-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center">
                    <Building2 size={24} />
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-widest font-serif font-bold text-amber-300">
                      Academic Directorate
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1 text-white">
                      Educator Sanctuary & Self-Service
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                    Shree Nirakar Education Society provides educators complete autonomy over their pedagogical records, public research profiles, and digital classroom interactions.
                  </p>

                  <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} />
                      </div>
                      <span className="text-stone-300">
                        Institutional onboarding & directory listing
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} />
                      </div>
                      <span className="text-stone-300">
                        Self-service profile and publications management
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} />
                      </div>
                      <span className="text-stone-300">
                        Direct photo upload with automatic optimization
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Academic Governance Contact */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-sm text-xs text-stone-600 space-y-2">
                <div className="font-serif font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-700" />
                  <span>Administrative Verification Desk</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  For employee ID verification, designation corrections, or transfer orders, contact the Central Administrative Desk at <a href="mailto:academics@nirakar.org" className="text-amber-800 font-semibold underline">academics@nirakar.org</a>.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Sliding Auth Station */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-6">
              
              {/* Segmented Pill Switcher with Smooth Slide Indicator */}
              <div className="bg-white p-1.5 rounded-2xl border border-stone-200/90 shadow-sm flex items-center max-w-md mx-auto sm:mx-0 relative">
                <div
                  className={`absolute top-1.5 bottom-1.5 rounded-xl bg-[#0b132b] transition-all duration-500 ease-in-out shadow-md ${
                    mode === 'login' ? 'left-1.5 w-[calc(50%-6px)]' : 'left-[calc(50%+3px)] w-[calc(50%-6px)]'
                  }`}
                />

                <button
                  type="button"
                  data-no-transition="true"
                  onClick={() => switchMode('login')}
                  className={`relative z-10 flex-1 py-3 text-center text-sm font-bold rounded-xl transition-colors duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                    mode === 'login' ? 'text-amber-300' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Lock size={15} />
                  <span>Faculty Sign In</span>
                </button>

                <button
                  type="button"
                  data-no-transition="true"
                  onClick={() => switchMode('register')}
                  className={`relative z-10 flex-1 py-3 text-center text-sm font-bold rounded-xl transition-colors duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                    mode === 'register' ? 'text-amber-300' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <UserPlus size={15} />
                  <span>Educator Registration</span>
                </button>
              </div>

              {/* Sliding Forms Container Track (Overflow hidden + flex track + dynamic height animation) */}
              <div
                style={{ height: cardHeight ? `${cardHeight}px` : undefined }}
                className="w-full bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden relative transition-[height] duration-500 ease-in-out"
              >
                <div
                  className={`flex w-[200%] items-start transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ease-in-out ${
                    mode === 'login' ? 'translate-x-0' : '-translate-x-1/2'
                  }`}
                >
                  
                  {/* ==================== SLIDE 1: LOGIN FORM ==================== */}
                  <div ref={loginRef} className="w-1/2 shrink-0 p-6 sm:p-10 lg:p-12 space-y-7">
                    <div className="space-y-1.5 border-b border-stone-100 pb-5">
                      <div className="flex items-center gap-2 text-amber-800 text-xs font-serif font-bold uppercase tracking-wider">
                        <Lock size={14} />
                        <span>Staff Terminal Access</span>
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                        Sign In to Your Faculty Profile
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 font-sans">
                        Access syllabus logs, student grading, and update your published institutional profile.
                      </p>
                    </div>

                    {loginError && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-start gap-2.5">
                        <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    {loginSuccess && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2.5">
                        <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
                        <span>Authentication verified! Redirecting to Educator Dashboard...</span>
                      </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-6 font-sans">
                      {/* Campus Selector */}
                      <div className="space-y-2">
                        <label className="font-semibold text-stone-800 block text-sm">
                          Assigned Campus / Institution *
                        </label>
                        <CustomSelect
                          value={loginInstitution}
                          onChange={(val) => setLoginInstitution(val)}
                          options={[
                            { value: 'NIRAKAR_HS', label: 'Shri Nirakar Vidyalaya' },
                            { value: 'TUDAL_HS', label: 'Tudal High School' },
                            { value: 'ANGLE_HSS', label: 'S. S. Angle Higher Secondary School' },
                          ]}
                          className="w-full bg-stone-50"
                          menuClassName="w-full"
                        />
                      </div>

                      {/* Identifier */}
                      <div className="space-y-2">
                        <label className="font-semibold text-stone-800 block text-sm">
                          Staff Email, Username, or Employee Code *
                        </label>
                        <div className="relative">
                          <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. urvee.phaldessai, name@nirakar.org, or NES-FAC-2018"
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

                      {/* Remember */}
                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-stone-600 text-sm select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                          />
                          <span>Remember this workstation</span>
                        </label>
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
                            <span>Sign In to Faculty Portal</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Smooth Switch Callout */}
                    <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-600">
                      <div>
                        New educator joining Shree Nirakar?{' '}
                        <button
                          type="button"
                          data-no-transition="true"
                          onClick={() => switchMode('register')}
                          className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer ml-1"
                        >
                          Register Faculty Account →
                        </button>
                      </div>

                      <a
                        href="/faculty"
                        className="text-stone-500 hover:text-stone-800 transition-colors text-xs"
                      >
                        Public Faculty Directory
                      </a>
                    </div>
                  </div>

                  {/* ==================== SLIDE 2: REGISTER FORM ==================== */}
                  <div ref={registerRef} className="w-1/2 shrink-0 p-6 sm:p-10 lg:p-12 space-y-7">
                    <div className="space-y-1.5 border-b border-stone-100 pb-5">
                      <div className="flex items-center gap-2 text-amber-800 text-xs font-serif font-bold uppercase tracking-wider">
                        <UserPlus size={14} />
                        <span>Personnel Onboarding Form</span>
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                        Register Faculty Credentials
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 font-sans">
                        Complete your official educator profile for administrative review and public faculty directory listing.
                      </p>
                    </div>

                    {regError && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-start gap-2.5">
                        <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                        <span>{regError}</span>
                      </div>
                    )}

                    {regSubmitted ? (
                      <div className="py-12 text-center space-y-5 bg-emerald-50 rounded-2xl border border-emerald-200 p-8 sm:p-12">
                        <CheckCircle2 size={52} className="text-emerald-600 mx-auto" />
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-950">
                          Application Submitted for Administrative Approval
                        </h3>
                        <p className="text-sm text-emerald-800 leading-relaxed font-sans max-w-lg mx-auto">
                          Thank you, <strong>{regData.firstName} {regData.lastName}</strong>. Your faculty profile registration has been submitted to the Central Administrative Committee. Once verified by the Directorate, your profile will be published and activated.
                        </p>
                        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                          <button
                            type="button"
                            data-no-transition="true"
                            onClick={() => switchMode('login')}
                            className="px-6 py-3 rounded-xl bg-[#0b132b] text-white text-sm font-bold hover:bg-[#16247e] transition-colors cursor-pointer"
                          >
                            ← Back to Faculty Sign In
                          </button>
                          <a
                            href="/faculty"
                            className="px-6 py-3 rounded-xl bg-white border border-stone-200 text-stone-700 text-sm font-bold hover:bg-stone-50 transition-colors cursor-pointer"
                          >
                            Explore Faculty Directory
                          </a>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleRegisterSubmit} className="space-y-8 font-sans">
                        
                        {/* Section 1: Personal Information */}
                        <div className="space-y-4">
                          <div className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2.5 flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">
                              1
                            </span>
                            <span>Personal & Identification</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="font-semibold text-stone-800 block text-sm">First Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Ramesh"
                                value={regData.firstName}
                                onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="font-semibold text-stone-800 block text-sm">Last Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Komarpant"
                                value={regData.lastName}
                                onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="font-semibold text-stone-800 block text-sm">Official Staff Email *</label>
                              <input
                                type="email"
                                required
                                placeholder="name@nirakar.org"
                                value={regData.email}
                                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="font-semibold text-stone-800 block text-sm">Contact Phone Number *</label>
                              <input
                                type="tel"
                                required
                                placeholder="+91 9876543210"
                                value={regData.phone}
                                onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="font-semibold text-stone-800 block text-sm">
                                Staff Portal Username / Handle *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. urvee.phaldessai"
                                value={regData.username}
                                onChange={(e) => setRegData({ ...regData, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })}
                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm font-mono focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                              />
                              <p className="text-[11px] text-stone-400 font-mono">Unique handle for staff sign-in and profile vanity URL.</p>
                            </div>

                            <div className="space-y-1.5">
                              <label className="font-semibold text-stone-800 block text-sm">
                                Employee / Staff Code (Optional)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. NES-FAC-2024"
                                value={regData.employeeCode}
                                onChange={(e) => setRegData({ ...regData, employeeCode: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                              />
                              <p className="text-[11px] text-stone-400 font-mono">Assigned institutional employee registration number.</p>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Institutional Assignment & Dynamic Department */}
                        <div className="space-y-4">
                          <div className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2.5 flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">
                              2
                            </span>
                            <span>Institution & Academic Department</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="font-semibold text-stone-800 block text-sm">Campus Assignment *</label>
                              <CustomSelect
                                value={regData.institutionCode}
                                onChange={(val) => setRegData({ ...regData, institutionCode: val })}
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
                              <label className="font-semibold text-stone-800 block text-sm">
                                Academic Department *
                              </label>
                              <CustomSelect
                                value={isOtherDept ? 'OTHER' : regData.department}
                                onChange={(val) => {
                                  if (val === 'OTHER') {
                                    setIsOtherDept(true);
                                  } else {
                                    setIsOtherDept(false);
                                    setRegData({ ...regData, department: val });
                                  }
                                }}
                                options={[
                                  ...departments.map((d) => ({ value: d, label: d })),
                                  { value: 'OTHER', label: '+ Other / Enter Custom Department' },
                                ]}
                                className="w-full bg-stone-50"
                                menuClassName="w-full"
                              />

                              {isOtherDept && (
                                <input
                                  type="text"
                                  required
                                  placeholder="Type custom department name..."
                                  value={customDept}
                                  onChange={(e) => setCustomDept(e.target.value)}
                                  className="w-full mt-2 h-12 px-4 rounded-xl bg-stone-50 border border-amber-300 text-stone-900 text-sm focus:bg-white focus:border-amber-600 outline-none transition-all"
                                />
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="font-semibold text-stone-800 block text-sm">
                                Highest Academic Qualification *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. M.Sc. Physics (Goa University), B.Ed."
                                value={regData.qualification}
                                onChange={(e) => setRegData({ ...regData, qualification: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                              />
                            </div>

                            {/* Normal Experience Input (NO dropdown) */}
                            <div className="space-y-1.5">
                              <label className="font-semibold text-stone-800 block text-sm">
                                Total Teaching Experience (In Years) *
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="60"
                                  required
                                  placeholder="e.g. 12"
                                  value={regData.experienceYears}
                                  onChange={(e) => setRegData({ ...regData, experienceYears: e.target.value })}
                                  className="w-full h-12 pl-4 pr-16 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm font-mono focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono text-stone-500 pointer-events-none">
                                  Years
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-semibold text-stone-800 block text-sm">
                              Key Subjects Taught (Comma separated)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Physics, Electronics, Practical Laboratory Mechanics"
                              value={regData.subjects}
                              onChange={(e) => setRegData({ ...regData, subjects: e.target.value })}
                              className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-semibold text-stone-800 block text-sm">
                              Teaching Philosophy & Professional Biography (Optional)
                            </label>
                            <textarea
                              rows={4}
                              placeholder="Share your academic background, pedagogical philosophy, and student mentorship devotion at Nirakar Education Society..."
                              value={regData.bio}
                              onChange={(e) => setRegData({ ...regData, bio: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-y"
                            />
                            <p className="text-[11px] text-stone-400 font-mono">Appears prominently in your official educator dossier once approved by administration.</p>
                          </div>
                        </div>

                        {/* Section 3: Password & Consent */}
                        <div className="space-y-4">
                          <div className="font-bold text-stone-900 text-base border-b border-stone-100 pb-2.5 flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">
                              3
                            </span>
                            <span>Security & Ethics Declaration</span>
                          </div>

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
                                  className="w-full h-12 pl-4 pr-11 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
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
                                  className="w-full h-12 pl-4 pr-11 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
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

                          <label className="flex items-start gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              required
                              checked={regData.consent}
                              onChange={(e) => setRegData({ ...regData, consent: e.target.checked })}
                              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                            />
                            <span className="text-xs leading-relaxed text-stone-600">
                              I confirm that all entered educational qualifications and employment history details are accurate as per Goa Educational Board norms and Shree Nirakar Education Society policies. I understand that my profile will be reviewed by the Administrative Directorate prior to public publishing.
                            </span>
                          </label>
                        </div>

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
                              <span>Submit Official Faculty Application</span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* Smooth Switch Callout */}
                    <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-600">
                      <div>
                        Already registered with Shree Nirakar?{' '}
                        <button
                          type="button"
                          data-no-transition="true"
                          onClick={() => switchMode('login')}
                          className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer ml-1"
                        >
                          ← Sign In to Faculty Portal
                        </button>
                      </div>

                      <a
                        href="/faculty"
                        className="text-stone-500 hover:text-stone-800 transition-colors text-xs"
                      >
                        Public Faculty Directory
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

export default FacultyAuthPage;
