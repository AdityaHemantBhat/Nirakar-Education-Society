import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ExternalLink,
  Award,
  AlertCircle,
  LogOut,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import {
  getDynamicDepartments,
  addDynamicDepartment,
  removeDynamicDepartment,
} from '../data/departmentData.js';
import { FACULTY_DATA } from '../data/facultyData.js';
import { COMPREHENSIVE_ALUMNI } from '../data/alumniData.js';

export const AdminConsolePage: React.FC = () => {
  const navigate = useNavigate();

  // Check current logged-in user
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('nirakar_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const isAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.username === 'admin' ||
    currentUser?.email === 'admin@nirakar.org';

  // Active top-level admin tab
  const [activeTab, setActiveTab] = useState<'faculty' | 'alumni'>('faculty');

  // ==================== FACULTY MANAGEMENT STATE ====================
  // 1. Pending faculty applications
  const PENDING_PER_PAGE = 6;
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingFaculty, setPendingFaculty] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('nirakar_pending_faculty_apps');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed initial realistic pending applications if empty
    return [
      {
        id: 'fac-app-01',
        name: 'Ramesh Komarpant',
        email: 'ramesh.komarpant@nirakar.org',
        phone: '+91 98221 44550',
        employeeCode: 'NES-FAC-2026',
        institutionCode: 'ANGLE_HSS',
        institutionName: 'S. S. Angle Higher Secondary School',
        department: 'Science & Wet Laboratories',
        qualification: 'M.Sc. Physics, B.Ed. (Goa University)',
        experienceYears: 12,
        experience: '12 Years',
        subjects: ['Physics', 'Electronics Lab'],
        appliedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'PENDING',
      },
      {
        id: 'fac-app-02',
        name: 'Snehal Dessai',
        email: 'snehal.dessai@nirakar.org',
        phone: '+91 94220 88910',
        employeeCode: 'NES-FAC-2027',
        institutionCode: 'NIRAKAR_HS',
        institutionName: 'Shri Nirakar Vidyalaya',
        department: 'Mathematics & Computer Science',
        qualification: 'M.Sc. Mathematics, PGDCA',
        experienceYears: 7,
        experience: '7 Years',
        subjects: ['Applied Mathematics', 'Information Practice'],
        appliedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'PENDING',
      },
    ];
  });

  // 2. Dynamic departments state
  const [departments, setDepartments] = useState<string[]>(() => getDynamicDepartments());
  const [newDeptInput, setNewDeptInput] = useState('');
  const [deptFeedback, setDeptFeedback] = useState('');

  // 3. Published faculty list
  const [publishedFaculty, setPublishedFaculty] = useState<any[]>(() => {
    try {
      const custom = localStorage.getItem('nirakar_faculty_custom');
      if (custom) {
        const parsed = JSON.parse(custom);
        return [parsed, ...FACULTY_DATA.filter((f) => f.id !== parsed.id)];
      }
    } catch {}
    return FACULTY_DATA;
  });

  // Handle Faculty Approval
  const handleApproveFaculty = (appId: string) => {
    const app = pendingFaculty.find((f) => f.id === appId);
    if (!app) return;

    // Convert into published faculty member
    const newPublished = {
      id: `fac-${Date.now()}`,
      name: app.name,
      designation: 'Lecturer & Faculty Member',
      department: app.department,
      institutionCode: app.institutionCode,
      institutionName: app.institutionName,
      qualification: app.qualification,
      experience: app.experience,
      experienceYears: app.experienceYears,
      subjects: app.subjects,
      bio: `Dedicated educator in ${app.department} at ${app.institutionName}.`,
      photoUrl: '',
      achievements: ['Goa Board Certified Educator'],
      publications: [],
      email: app.email,
      phone: app.phone,
      socialLinks: {},
      status: 'PUBLISHED',
    };

    const updatedPublished = [newPublished, ...publishedFaculty];
    setPublishedFaculty(updatedPublished);
    localStorage.setItem('nirakar_faculty_custom', JSON.stringify(newPublished));

    // Remove from pending
    const updatedPending = pendingFaculty.filter((f) => f.id !== appId);
    setPendingFaculty(updatedPending);
    localStorage.setItem('nirakar_pending_faculty_apps', JSON.stringify(updatedPending));

    // Dispatch sync events
    window.dispatchEvent(new Event('nirakar_faculty_updated'));
  };

  // Handle Faculty Rejection
  const handleRejectFaculty = (appId: string) => {
    const updatedPending = pendingFaculty.filter((f) => f.id !== appId);
    setPendingFaculty(updatedPending);
    localStorage.setItem('nirakar_pending_faculty_apps', JSON.stringify(updatedPending));
  };

  // Dynamic Department Addition
  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptInput.trim()) return;
    const updated = addDynamicDepartment(newDeptInput.trim());
    setDepartments(updated);
    setNewDeptInput('');
    setDeptFeedback(`Department "${newDeptInput.trim()}" added to dynamic registry!`);
    setTimeout(() => setDeptFeedback(''), 3500);
  };

  // Dynamic Department Removal
  const handleRemoveDepartment = (dept: string) => {
    const updated = removeDynamicDepartment(dept);
    setDepartments(updated);
    setDeptFeedback(`Department "${dept}" removed.`);
    setTimeout(() => setDeptFeedback(''), 3500);
  };

  // ==================== ALUMNI MANAGEMENT STATE ====================
  // Alumni list with verification status
  const [alumniList, setAlumniList] = useState<any[]>(() => {
    try {
      const registered = localStorage.getItem('nirakar_alumni_registered');
      const regList = registered ? JSON.parse(registered) : [];
      return [...regList, ...COMPREHENSIVE_ALUMNI];
    } catch {}
    return COMPREHENSIVE_ALUMNI;
  });

  const [alumniSearch, setAlumniSearch] = useState('');

  // Toggle or Grant Verified Badge to Alumni
  const handleToggleAlumniBadge = (username: string) => {
    const updated = alumniList.map((a) => {
      const uName = a.user?.username || a.username;
      if (uName === username) {
        const isVerified = a.verificationLevel === 'VERIFIED' || a.verificationLevel === 'DOC_VERIFIED';
        return {
          ...a,
          verificationLevel: isVerified ? 'UNVERIFIED' : 'DOC_VERIFIED',
        };
      }
      return a;
    });

    setAlumniList(updated);
    try {
      localStorage.setItem('nirakar_alumni_registered', JSON.stringify(updated));
      window.dispatchEvent(new Event('nirakar_alumni_registered_updated'));
    } catch {}
  };

  const filteredAlumni = alumniList.filter((a) => {
    const name = a.name || `${a.firstName || ''} ${a.lastName || ''}`;
    const username = a.user?.username || a.username || '';
    const q = alumniSearch.toLowerCase();
    return name.toLowerCase().includes(q) || username.toLowerCase().includes(q);
  });

  // Admin Quick Login Bypass for testing
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminUser = {
      id: 'super-admin-01',
      username: adminId || 'admin',
      email: adminId.includes('@') ? adminId : 'admin@nirakar.org',
      role: 'SUPER_ADMIN',
    };
    localStorage.setItem('nirakar_auth_user', JSON.stringify(adminUser));
    setCurrentUser(adminUser);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('nirakar_auth_user');
    setCurrentUser(null);
  };

  // ACCESS GATE IF NOT LOGGED IN AS ADMIN
  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
        <Helmet>
          <title>Administrative Governance Gate | Shree Nirakar Education Society</title>
        </Helmet>
        <Navbar />

        <main className="w-full flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-10 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#0b132b] text-amber-300 flex items-center justify-center mx-auto border border-amber-400/30">
                <ShieldCheck size={28} />
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Administrative Directorate Gate
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Access restricted to authorized Executive Committee and Directorate Administrators.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Administrator ID or Email</label>
                <input
                  type="text"
                  required
                  placeholder="admin@nirakar.org"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Administrative Key / Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#0b132b] hover:bg-[#16247e] text-white font-serif font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                Authenticate as Administrator
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
      <Helmet>
        <title>Central Administrative Governance | Shree Nirakar Education Society</title>
        <meta name="description" content="Official administrative management for faculty onboarding and alumni verification." />
      </Helmet>

      <Navbar />

      {/* FULL-WIDTH HERO BANNER */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        <HeroWaves opacity={0.85} />

        <div className="w-full max-w-[1850px] mx-auto space-y-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-flex items-center gap-1.5">
              <ShieldCheck size={13} />
              <span>Executive Directorate Administration Console</span>
            </span>

            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-300 font-mono hidden sm:inline">
                Admin: <strong>{currentUser?.email || 'admin@nirakar.org'}</strong>
              </span>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-mono font-semibold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Institutional Governance & Verification Center
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl font-sans leading-relaxed">
              Vetting onboarded faculty applications, maintaining dynamic academic departments, and attesting official verified alumni seals.
            </p>
          </div>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      {/* MAIN FULL WIDTH STRETCHED DESK */}
      <main className="w-full flex-1 max-w-[1850px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 space-y-8">
        
        {/* TOP LEVEL NAVIGATION SWITCHER: SEPARATE FACULTY VS ALUMNI */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/90 pb-4">
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-stone-200 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('faculty')}
              className={`px-5 py-2.5 rounded-xl font-serif font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'faculty'
                  ? 'bg-[#0b132b] text-amber-300 shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Building2 size={16} />
              <span>Faculty Directorate & Approvals</span>
              {pendingFaculty.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-[#0b132b] text-[10px] font-black flex items-center justify-center font-mono">
                  {pendingFaculty.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('alumni')}
              className={`px-5 py-2.5 rounded-xl font-serif font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'alumni'
                  ? 'bg-[#0b132b] text-amber-300 shadow-md'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <GraduationCap size={16} />
              <span>Alumni Directorate & Badge Verification</span>
            </button>
          </div>

          <div className="text-xs text-stone-500 font-mono">
            {activeTab === 'faculty' ? 'Faculty Governance Mode' : 'Alumni Verification Mode'}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: FACULTY GOVERNANCE & ONBOARDING APPROVALS                         */}
        {/* ========================================================================= */}
        {activeTab === 'faculty' && (
          <div className="space-y-10">
            
            {/* Top metrics strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-sm space-y-1">
                <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-amber-800">
                  Pending Applications
                </span>
                <div className="text-3xl font-black font-serif text-stone-900">
                  {pendingFaculty.length}
                </div>
                <p className="text-[11px] text-stone-500">Awaiting executive committee approval</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-sm space-y-1">
                <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-emerald-800">
                  Published Educators
                </span>
                <div className="text-3xl font-black font-serif text-stone-900">
                  {publishedFaculty.length}
                </div>
                <p className="text-[11px] text-stone-500">Live across 3 Canacona institutions</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-sm space-y-1">
                <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-sky-800">
                  Active Departments
                </span>
                <div className="text-3xl font-black font-serif text-stone-900">
                  {departments.length}
                </div>
                <p className="text-[11px] text-stone-500">Dynamically configured by admin</p>
              </div>
            </div>

            {/* 1. PENDING FACULTY ONBOARDING APPLICATIONS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                    <Clock size={20} className="text-amber-600" />
                    <span>Pending Faculty Applications Awaiting Approval</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Educators who registered via the onboarding portal. Approving will publish them to the live public directory.
                  </p>
                </div>
              </div>

              {pendingFaculty.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs font-sans space-y-2">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                  <p className="font-serif font-bold text-stone-700 text-sm">
                    All faculty onboarding requests have been processed!
                  </p>
                  <p>New registrations submitted via /faculty/register will immediately appear here.</p>
                </div>
              ) : (() => {
                const totalPages = Math.ceil(pendingFaculty.length / PENDING_PER_PAGE);
                const safePage = Math.min(pendingPage, totalPages);
                const pageItems = pendingFaculty.slice(
                  (safePage - 1) * PENDING_PER_PAGE,
                  safePage * PENDING_PER_PAGE
                );
                return (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {pageItems.map((app) => (
                        <div
                          key={app.id}
                          className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5 space-y-4 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                                  {app.employeeCode || 'PENDING ID'}
                                </span>
                                <span className="text-[10px] font-mono text-stone-400">
                                  {app.institutionCode === 'NIRAKAR_HS'
                                    ? 'Shri Nirakar Vidyalaya'
                                    : app.institutionCode === 'TUDAL_HS'
                                    ? 'Tudal High School'
                                    : 'S. S. Angle HSS'}
                                </span>
                              </div>
                              <h4 className="font-serif text-base font-bold text-stone-900 mt-1.5 leading-snug">
                                {app.name}
                              </h4>
                              <p className="text-xs font-semibold text-amber-900 font-sans">
                                {app.department}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 text-[10px] font-bold font-mono shrink-0">
                              Pending Approval
                            </span>
                          </div>

                          <div className="text-xs text-stone-600 space-y-1.5 border-y border-stone-200/70 py-3 font-sans">
                            <div><strong>Qualification:</strong> {app.qualification}</div>
                            <div><strong>Experience:</strong> {app.experience}</div>
                            {app.subjects?.length > 0 && (
                              <div><strong>Subjects:</strong> {app.subjects.join(', ')}</div>
                            )}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-stone-500 text-[11px] pt-1 font-mono">
                              {app.email && <span>✉ {app.email}</span>}
                              {app.phone && <span>📞 {app.phone}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => handleApproveFaculty(app.id)}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-serif font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve &amp; Publish</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectFaculty(app.id)}
                              className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-serif font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination — only shown when more than 6 applications exist */}
                    {totalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
                        <span className="text-[11px] font-mono text-stone-400">
                          Showing {(safePage - 1) * PENDING_PER_PAGE + 1}–{Math.min(safePage * PENDING_PER_PAGE, pendingFaculty.length)} of {pendingFaculty.length} pending applications
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={safePage <= 1}
                            onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-serif font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            ← Prev
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                            <button
                              key={pg}
                              type="button"
                              onClick={() => setPendingPage(pg)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer ${
                                pg === safePage
                                  ? 'bg-[#0b132b] text-white shadow-sm'
                                  : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                              }`}
                            >
                              {pg}
                            </button>
                          ))}
                          <button
                            type="button"
                            disabled={safePage >= totalPages}
                            onClick={() => setPendingPage((p) => Math.min(totalPages, p + 1))}
                            className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-serif font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* 2. DYNAMIC DEPARTMENT MANAGER */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                    <Layers size={20} className="text-amber-700" />
                    <span>Dynamic Academic Department Manager</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Departments configured here immediately propagate to the Faculty Registration form and Faculty Profile Editor dropdowns.
                  </p>
                </div>
              </div>

              {deptFeedback && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-600" />
                  <span>{deptFeedback}</span>
                </div>
              )}

              {/* Add department form */}
              <form onSubmit={handleAddDepartment} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="Enter new department name (e.g. Artificial Intelligence & Robotics, Vocational Agriculture)..."
                  value={newDeptInput}
                  onChange={(e) => setNewDeptInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none text-xs transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#0b132b] hover:bg-[#16247e] text-white font-serif font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus size={15} />
                  <span>Add Department</span>
                </button>
              </form>

              {/* Department tags list */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-stone-500">
                  Current Active Departments ({departments.length})
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {departments.map((dept) => (
                    <div
                      key={dept}
                      className="px-3.5 py-2 rounded-xl bg-stone-100 border border-stone-200/90 text-stone-800 text-xs font-medium flex items-center gap-2.5 shadow-2xs"
                    >
                      <span>{dept}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDepartment(dept)}
                        className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title={`Remove ${dept}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. PUBLISHED FACULTY ROSTER */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Published Institutional Faculty Directory ({publishedFaculty.length})
                </h3>
                <Link
                  to="/faculty"
                  className="text-xs text-amber-800 hover:text-amber-950 font-serif font-bold underline flex items-center gap-1"
                >
                  <span>View Public Faculty Page</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 font-serif uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Educator Name</th>
                      <th className="py-3 px-3">Campus</th>
                      <th className="py-3 px-3">Department</th>
                      <th className="py-3 px-3">Experience</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {publishedFaculty.slice(0, 8).map((fac) => (
                      <tr key={fac.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3 font-semibold text-stone-900">
                          {fac.name}
                        </td>
                        <td className="py-3 px-3 text-stone-600">
                          {fac.institutionCode === 'ANGLE_HSS'
                            ? 'S. S. Angle Higher Secondary School'
                            : fac.institutionCode === 'TUDAL_HS'
                            ? 'Tudal High School'
                            : 'Shri Nirakar Vidyalaya'}
                        </td>
                        <td className="py-3 px-3 text-amber-900 font-medium">
                          {fac.department}
                        </td>
                        <td className="py-3 px-3 text-stone-600 font-mono">
                          {fac.experience || `${fac.experienceYears || 5} Years`}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/faculty/${fac.id}`}
                            className="text-amber-800 hover:underline font-bold text-[11px]"
                          >
                            View Dossier &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ALUMNI DIRECTORATE & BADGE VERIFICATION                           */}
        {/* ========================================================================= */}
        {activeTab === 'alumni' && (
          <div className="space-y-8">
            
            {/* Explanatory Banner: Immediate Access vs Verified Badge */}
            <div className="bg-[#0b132b] text-white rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-md relative overflow-hidden space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-xs uppercase tracking-wider">
                <Award size={16} />
                <span>Alumni Access & Verification Protocol</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Open Fellowship & Administrative Golden Seal Badges
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
                When alumni register, they receive <strong>immediate full access</strong> to log in, view posts, read *Nirakar Patrika*, and explore classmate directories. As an Administrator, your role here is to review their historical school enrollment and <strong>grant or revoke the official Golden "Verified Alumnus" Badge</strong>.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search by name or directory username..."
                    value={alumniSearch}
                    onChange={(e) => setAlumniSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-600 outline-none text-xs transition-all"
                  />
                </div>

                <div className="text-xs text-stone-500 font-mono">
                  Showing {filteredAlumni.length} registered alumni
                </div>
              </div>

              {/* Alumni Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 font-serif uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Alumnus Name & Username</th>
                      <th className="py-3 px-3">Alma Mater School</th>
                      <th className="py-3 px-3">Batch Year</th>
                      <th className="py-3 px-3">Platform Access</th>
                      <th className="py-3 px-3">Badge Status</th>
                      <th className="py-3 px-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredAlumni.map((alm) => {
                      const uName = alm.user?.username || alm.username;
                      const displayName = alm.name || `${alm.firstName || ''} ${alm.lastName || ''}`;
                      const isVerified =
                        alm.verificationLevel === 'VERIFIED' ||
                        alm.verificationLevel === 'DOC_VERIFIED' ||
                        alm.isVerified;

                      return (
                        <tr key={alm.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-stone-900">{displayName}</div>
                            <div className="text-[11px] font-mono text-stone-400">@{uName}</div>
                          </td>

                          <td className="py-3 px-3 text-stone-600">
                            {alm.school === 'ANGLE_HSS'
                              ? 'S. S. Angle HSS'
                              : alm.school === 'TUDAL_HS'
                              ? 'Tudal High School'
                              : 'Shri Nirakar Vidyalaya'}
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-stone-800">
                            Class of {alm.batchYear}
                          </td>

                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                              <CheckCircle2 size={11} className="text-emerald-600" />
                              <span>Full Access</span>
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold font-serif shadow-2xs">
                                <Award size={11} className="text-amber-600" />
                                <span>Verified Alumnus</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-medium font-serif">
                                <span>Member (No Badge)</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleAlumniBadge(uName)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                                  isVerified
                                    ? 'bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200'
                                    : 'bg-amber-400 hover:bg-amber-300 text-[#0b132b] shadow-xs'
                                }`}
                              >
                                {isVerified ? 'Revoke Badge' : 'Grant Verified Badge'}
                              </button>

                              <Link
                                to={`/alumni/${uName}`}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
                                title="View Public Profile"
                              >
                                <ExternalLink size={14} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default AdminConsolePage;
