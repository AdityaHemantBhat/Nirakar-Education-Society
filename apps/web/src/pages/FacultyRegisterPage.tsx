import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import {
  UserPlus,
  ShieldCheck,
  Building2,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect.js';

export const FacultyRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeCode: '',
    institutionCode: 'NIRAKAR_HS',
    department: 'Science & Wet Laboratories',
    qualification: '',
    experienceYears: '5',
    subjects: '',
    password: '',
    confirmPassword: '',
    consent: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify both password entries.');
      return;
    }

    if (!formData.consent) {
      setError('Please acknowledge the Society Academic Code of Conduct declaration.');
      return;
    }

    setLoading(true);

    try {
      // Simulate or call register endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Registration request could not be processed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>Educator Registration & Onboarding | Shree Nirakar Education Society</title>
        <meta
          name="description"
          content="Official faculty onboarding application for teaching and administrative personnel joining Shree Nirakar Education Society institutions."
        />
      </Helmet>

      <Navbar />

      {/* Hero Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden text-center">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="max-w-3xl mx-auto space-y-3 relative z-10">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-flex items-center gap-1.5">
            <UserPlus size={13} />
            <span>Institutional Educator Onboarding</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Faculty Portal Registration
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Register your verified teaching credentials to gain self-service access to academic logs, student evaluation, and departmental directories.
          </p>
        </div>
      </div>

      {/* SVG Curve finishing the hero banner with smooth organic transition */}
      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      <main className="w-full flex-1 flex items-center justify-center px-4 py-8 sm:py-14">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-xl space-y-8">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#0b132b] border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-md">
              <GraduationCap size={26} />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Educator Registration Form
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-sans max-w-md mx-auto">
              Please enter your official personnel credentials as recorded in the Society Administrative Registry.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="py-10 text-center space-y-4 bg-emerald-50 rounded-2xl border border-emerald-200 p-8">
              <CheckCircle2 size={48} className="text-emerald-600 mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-emerald-950">
                Registration Application Submitted
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-sans max-w-md mx-auto">
                Thank you, <strong>{formData.firstName} {formData.lastName}</strong>. Your faculty profile registration has been forwarded to the Principal’s office and Academic Directorate for verification. You will receive an activation email once your staff code is confirmed.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="/faculty/login"
                  className="px-6 py-2.5 rounded-xl bg-[#0b132b] text-white text-xs font-serif font-bold hover:bg-[#16247e] transition-colors cursor-pointer"
                >
                  Proceed to Faculty Login
                </a>
                <a
                  href="/faculty"
                  className="px-6 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-serif font-bold hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  View Faculty Directory
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
              
              {/* 1. PERSONAL INFORMATION */}
              <div className="space-y-3">
                <div className="font-serif font-bold text-stone-800 text-sm border-b border-stone-100 pb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Personal & Staff Identification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Komarpant"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Official Staff Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@nirakar.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Employee / Staff Code (Optional if new joiner)</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-2026-08"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* 2. INSTITUTIONAL ASSIGNMENT */}
              <div className="space-y-3">
                <div className="font-serif font-bold text-stone-800 text-sm border-b border-stone-100 pb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Institution & Department Assignment</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Campus Assignment *</label>
                    <CustomSelect
                      value={formData.institutionCode}
                      onChange={(val) => setFormData({ ...formData, institutionCode: val })}
                      options={[
                        { value: 'NIRAKAR_HS', label: 'Shri Nirakar Vidyalaya' },
                        { value: 'TUDAL_HS', label: 'Tudal High School' },
                        { value: 'ANGLE_HSS', label: 'S. S. Angle Higher Secondary School' },
                      ]}
                      className="w-full bg-stone-50"
                      menuClassName="w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Department *</label>
                    <CustomSelect
                      value={formData.department}
                      onChange={(val) => setFormData({ ...formData, department: val })}
                      options={[
                        'Science & Wet Laboratories',
                        'Mathematics & Computer',
                        'Languages & Literature',
                        'Commerce & Economics',
                        'Administration & Social Sciences',
                        'Athletics & Physical Education',
                      ]}
                      className="w-full bg-stone-50"
                      menuClassName="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Highest Educational Qualification *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. M.Sc. (Physics), B.Ed."
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Years of Teaching Experience *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="45"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Primary Subjects Taught *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Physics, Chemistry, Experimental Science"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* 3. SECURITY CREDENTIALS */}
              <div className="space-y-3">
                <div className="font-serif font-bold text-stone-800 text-sm border-b border-stone-100 pb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Portal Password & Security</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Portal Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Declaration Consent */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-stone-700 text-xs select-none">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                  />
                  <span className="leading-relaxed">
                    I solemnly declare that the credentials provided are accurate and that I adhere to the <strong>Shree Nirakar Education Society Academic Integrity & Student Welfare Charter</strong>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#0b132b] hover:bg-[#16247e] text-white font-serif font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Faculty Onboarding Application</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-stone-500 pt-2">
                Already registered as an active educator?{' '}
                <a href="/faculty/login" className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer">
                  Sign in to Faculty Portal
                </a>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FacultyRegisterPage;
