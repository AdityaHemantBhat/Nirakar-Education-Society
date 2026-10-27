import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { ShieldCheck, UserPlus, AlertCircle } from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.consent) {
      setError('You must consent to the privacy policy');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          batchYear: Number(formData.batchYear),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Registration failed');
      }

      const user = json.data?.user;
      if (!user?.username) {
        throw new Error('Registration succeeded, but the alumni profile could not be opened. Please sign in.');
      }
      localStorage.setItem('nirakar_auth_user', JSON.stringify(user));
      navigate(`/alumni/${encodeURIComponent(user.username)}`, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Could not complete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] flex flex-col font-sans">
      <Helmet>
        <title>Alumni Registration | Shri Nirakar Education Society</title>
        <meta name="description" content="Register as an alumnus of Shri Nirakar High School, Tudal High School, or S.S. Angle Higher Secondary School." />
      </Helmet>

      <Navbar />

      {/* Hero Banner with Thread-like Curved Wave Strips */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 text-center relative z-0 overflow-hidden">
        <HeroWaves opacity={0.85} />

        <div className="max-w-3xl mx-auto space-y-3 relative z-10">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-flex items-center gap-1.5">
            <UserPlus size={13} />
            <span>Alumni Verification Registry</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Register as Alumni
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join the verified institutional directory of Shri Nirakar High School, Tudal High School, and S. S. Angle Higher Secondary School graduates.
          </p>
        </div>
      </div>

      {/* Organic Section Transition */}
      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      <main className="w-full flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-14">
        <div className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-5 sm:p-8 md:p-10 shadow-xl space-y-5 sm:space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0b132b] border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-md">
              <UserPlus size={24} className="sm:w-6 sm:h-6" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight">Alumni Enrollment</h2>
            <p className="text-xs sm:text-sm text-stone-500 font-sans max-w-sm mx-auto leading-relaxed">
              Please enter your academic credentials to ensure verified alumnus status.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700 bg-white"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700 bg-white"
                />
              </div>
            </div>

            {/* Institution & Batch Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Institution *
                </label>
                <CustomSelect
                  value={formData.school}
                  onChange={(val) => setFormData({ ...formData, school: val })}
                  options={[
                    { value: 'NIRAKAR_HS', label: 'Shri Nirakar Vidyalaya' },
                    { value: 'TUDAL_HS', label: 'Tudal High School' },
                    { value: 'ANGLE_HSS', label: 'S. S. Angle Higher Secondary School' },
                  ]}
                  className="w-full bg-white"
                  menuClassName="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Batch Year (Passout) *
                </label>
                <input
                  type="number"
                  required
                  min={1960}
                  max={new Date().getFullYear()}
                  value={formData.batchYear}
                  onChange={(e) => setFormData({ ...formData, batchYear: parseInt(e.target.value) || 2020 })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700 bg-white font-mono"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                Choose Username *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. aditya_k"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700 bg-white font-mono"
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Password (min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-brand-700 bg-white"
                />
              </div>
            </div>

            {/* DPDP Consent */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-0.5 rounded text-brand-700 focus:ring-brand-700"
                />
                <span>
                  I consent to the verification and storage of my profile details under the provisions of the Digital Personal Data Protection (DPDP) Act 2023.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-serif text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <ShieldCheck size={16} />
              <span>{loading ? 'Creating Profile...' : 'Complete Registration'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-stone-100 flex flex-col gap-2 text-center text-xs text-stone-500">
            <div>
              <span>Already registered? </span>
              <Link to="/login" className="text-brand-700 font-serif font-bold hover:underline">
                Member Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
