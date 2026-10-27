import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import {
  ShieldCheck,
  FileText,
  Building2,
  Mail,
  Phone,
  Printer,
  ChevronRight,
  ExternalLink,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Scale,
} from 'lucide-react';

export const PolicyPage: React.FC = () => {
  const location = useLocation();

  // Tab state: 'privacy' or 'terms'
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/terms')) {
      return 'terms';
    }
    return 'privacy';
  });

  useEffect(() => {
    if (location.pathname.includes('/terms')) {
      setActiveTab('terms');
    } else if (location.pathname.includes('/privacy') || location.pathname.includes('/dpdp')) {
      setActiveTab('privacy');
    }
  }, [location.pathname]);

  const switchTab = (tab: 'privacy' | 'terms') => {
    setActiveTab(tab);
    const newPath = tab === 'terms' ? '/terms' : '/privacy';
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] text-[#1c1917] flex flex-col font-sans antialiased">
      <Helmet>
        <title>
          {activeTab === 'privacy'
            ? 'Statutory Privacy Policy & DPDP Act 2023 | Shri Nirakar Education Society'
            : 'Institutional Terms of Service & Code of Discipline | Shri Nirakar Education Society'}
        </title>
        <meta
          name="description"
          content="Official statutory charters, student data protection policies under the Digital Personal Data Protection Act, 2023, and institutional terms of service for Shri Nirakar Education Society institutions, Mashem, Canacona, Goa."
        />
      </Helmet>

      <Navbar />

      {/* Hero Banner: Royal Navy #0b132b with Thread-like Curve Waves */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="w-full relative z-10 mx-auto max-w-4xl text-center flex flex-col items-center">
          <div className="space-y-3.5 flex flex-col items-center text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-300">
              <span>Shri Nirakar Education Society</span>
              <span className="text-stone-500">•</span>
              <span>Mashem, Canacona, South Goa</span>
              <span className="text-stone-500">•</span>
              <span>Estd. 1939</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight text-center">
              {activeTab === 'privacy'
                ? 'Statutory Privacy Charter & DPDP Act 2023'
                : 'Terms of Service & Code of Discipline'}
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm max-w-3xl leading-relaxed font-sans text-center mx-auto">
              Official regulatory notifications, data protection provisions, student welfare safeguards, and institutional service terms governing Shri Nirakar High School, Tudal High School, and S.S. Angle Higher Secondary School.
            </p>
          </div>

          {/* Institutional Identification Strip (Cleanly Centered) */}
          <div className="mt-7 pt-5 border-t border-white/10 w-full flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-stone-300">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="bg-white/10 text-amber-300 px-3 py-1 rounded-full border border-white/15">
                Policy reference: not published
              </span>
              <span>Goa Board Index: SSC 08.006 / HSSC 08.06</span>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-1.5 rounded-full text-xs font-sans transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Official Gazette</span>
            </button>
          </div>
        </div>
      </div>

      {/* Finishing Scoop SectionEdge with Gold Accent Stroke */}
      <SectionEdge variant="scoop" color="#FDFBF7" bgColor="#0b132b" height={36} withGoldLine />

      {/* FULL-WIDTH FORMAL INSTITUTIONAL CANVAS */}
      <main className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12">
        
        {/* FORMAL GOVERNMENT-STYLE DOCUMENT SELECTOR (SOLID BORDER) */}
        <div className="w-full bg-white border border-stone-300 rounded-none shadow-sm mb-8">
          <div className="p-3 sm:p-4 bg-stone-100 border-b border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="font-serif font-bold text-stone-900 tracking-wide uppercase">
              Official Institutional Gazette • Directorate of Statutory Compliance
            </div>
            <div className="font-mono text-stone-600 text-[11px]">
              Statutory In-Force Date: Academic Year 2026–2027 (Notified: 1st June 2026)
            </div>
          </div>

          <div className="flex flex-col sm:flex-row border-b border-stone-200">
            <button
              onClick={() => switchTab('privacy')}
              className={`flex-1 py-3.5 px-6 text-left font-serif text-xs sm:text-sm font-bold border-b-2 sm:border-b-0 sm:border-r border-stone-200 transition-colors cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white text-[#111b5e] border-b-2 sm:border-b-0 sm:border-r-2 !border-b-[#111b5e] sm:!border-r-[#111b5e]'
                  : 'bg-stone-50/70 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>I. Privacy Policy & Digital Personal Data Protection (DPDP Act, 2023)</span>
                <span className="text-[10px] font-mono text-stone-400 font-normal">Section 1 to 10</span>
              </div>
            </button>

            <button
              onClick={() => switchTab('terms')}
              className={`flex-1 py-3.5 px-6 text-left font-serif text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-white text-[#111b5e] border-b-2 sm:border-b-0 !border-b-[#111b5e]'
                  : 'bg-stone-50/70 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>II. Institutional Terms of Service & Code of Discipline</span>
                <span className="text-[10px] font-mono text-stone-400 font-normal">Article 1 to 10</span>
              </div>
            </button>
          </div>
        </div>

        {/* 12-COLUMN SOLID GOVERNMENT LAYOUT */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: SOLID LEGAL INDEX & OFFICIAL CONTACT (Span 4) */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-28">
            {/* Document Index Table */}
            <div className="bg-white border border-stone-300 p-5 space-y-4">
              <div className="pb-2 border-b border-stone-200">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-500 block">
                  Official Index
                </span>
                <h3 className="font-serif font-bold text-sm text-stone-900 mt-0.5">
                  {activeTab === 'privacy' ? 'Sections of the Charter' : 'Articles of the Charter'}
                </h3>
              </div>

              <nav className="space-y-1 text-xs text-stone-700 font-sans">
                {activeTab === 'privacy' ? (
                  <>
                    <a href="#sec-1" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      1.0 Short Title, Enactment & Authority
                    </a>
                    <a href="#sec-2" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      2.0 Statutory Definitions
                    </a>
                    <a href="#sec-3" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      3.0 Student Admissions & Minors Data
                    </a>
                    <a href="#sec-4" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      4.0 Academic Records & Board Compliance
                    </a>
                    <a href="#sec-5" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      5.0 Alumni Registry & Privacy Controls
                    </a>
                    <a href="#sec-6" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      6.0 Teaching & Administrative Personnel
                    </a>
                    <a href="#sec-7" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      7.0 Non-Commercial Undertaking
                    </a>
                    <a href="#sec-8" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      8.0 Technical Security & Encryption
                    </a>
                    <a href="#sec-9" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      9.0 Rights of Data Principals
                    </a>
                    <a href="#sec-10" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      10.0 Data Protection Officer & Redressal
                    </a>
                  </>
                ) : (
                  <>
                    <a href="#art-1" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      1.0 Scope & Regulatory Authority
                    </a>
                    <a href="#art-2" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      2.0 Student Admissions & Eligibility
                    </a>
                    <a href="#art-3" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      3.0 Academic Discipline & Honor Code
                    </a>
                    <a href="#art-4" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      4.0 Campus Laboratories & Infrastructure
                    </a>
                    <a href="#art-5" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      5.0 Approved Fees & Caution Deposits
                    </a>
                    <a href="#art-6" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      6.0 Alumni Directory Usage Protocol
                    </a>
                    <a href="#art-7" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      7.0 Intellectual Property & Batch Archives
                    </a>
                    <a href="#art-8" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      8.0 Attendance & Evaluation Regulations
                    </a>
                    <a href="#art-9" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      9.0 Disciplinary Actions & Revocation
                    </a>
                    <a href="#art-10" className="block py-1.5 px-2 hover:bg-stone-100 rounded text-stone-800 font-medium">
                      10.0 Judicial Jurisdiction (Canacona/Goa)
                    </a>
                  </>
                )}
              </nav>
            </div>

            {/* Official Institutional Authority Block */}
            <div className="bg-stone-100 border border-stone-300 p-5 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-xs uppercase tracking-wider">
                <Building2 size={14} className="text-[#111b5e]" />
                <span>Competent Authority</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                Promulgated under the executive authority of the <strong>Governing Council of Shri Nirakar Education Society</strong>, Mashem, Canacona, South Goa.
              </p>
              <div className="text-[11px] font-mono text-stone-600 border-t border-stone-200 pt-2 space-y-1">
                <div>• Registration: Soc. Reg. Act XXI of 1860</div>
                <div>• Recognized: Directorate of Education, Goa</div>
                <div>• Affiliated: Goa Board (SSC & HSSC)</div>
              </div>
            </div>

            {/* Statutory Redressal Officer Desk */}
            <div className="bg-white border border-stone-300 p-5 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-xs uppercase tracking-wider">
                <Scale size={14} className="text-[#111b5e]" />
                <span>Statutory Compliance Officer</span>
              </div>

              <div>
                <div className="font-serif font-bold text-sm text-stone-900">
                  Office of the Registrar
                </div>
                <div className="text-xs text-stone-500 font-sans">
                  Designated Data Protection & Grievance Officer
                </div>
              </div>

              <div className="text-xs text-stone-700 space-y-1.5 pt-2 border-t border-stone-200">
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-stone-500 shrink-0 mt-0.5" />
                  <span>Central Administrative Office, Mashem Campus, Canacona, Goa 403728</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-stone-500 shrink-0" />
                  <a href="mailto:privacy@nirakar.edu" className="text-blue-900 hover:underline font-mono">
                    privacy@nirakar.edu
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-stone-500 shrink-0" />
                  <span className="font-mono">+91 832 2643236</span>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: SOLID, FORMAL LEGAL ARTICLES (Span 8) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* OFFICIAL LETTERHEAD PREAMBLE BLOCK */}
            <div className="bg-white border border-stone-300 p-6 sm:p-8 space-y-3">
              <div className="text-center pb-4 border-b border-stone-200 space-y-1">
                <div className="font-serif text-sm sm:text-base font-bold text-stone-900 tracking-wide uppercase">
                  Shri Nirakar Education Society
                </div>
                <div className="text-xs text-stone-600 font-sans">
                  Mashem, Canacona, South Goa, India – 403728
                </div>
                <div className="text-[11px] font-mono text-stone-500">
                  Registration No. 128/Goa under Societies Registration Act XXI of 1860
                </div>
              </div>

              <div className="pt-2 text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                <div className="font-mono text-xs text-stone-600">
                  NOTIFICATION NO: <strong>SNES/DPDP/AY26-27/01</strong>
                </div>
                <p>
                  {activeTab === 'privacy'
                    ? 'In exercise of the powers conferred by the Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023, Parliament of India), and in conformity with the Goa School Education Act, 1984, the Governing Council of Shri Nirakar Education Society hereby notifies the following statutory Data Protection Charter governing the processing of personal records of students, parents, alumni, and educators.'
                    : 'The Governing Council of Shri Nirakar Education Society hereby promulgates the following Institutional Terms of Service and Code of Academic Discipline to govern enrolment, academic integrity, use of campus scientific infrastructure, alumni relations, and administrative services across all institutions administered by the Society.'}
                </p>
              </div>
            </div>

            {/* =========================================================================
                PART I: STATUTORY PRIVACY POLICY (DPDP ACT, 2023)
                ========================================================================= */}
            {activeTab === 'privacy' && (
              <div className="bg-white border border-stone-300 divide-y divide-stone-200">
                
                {/* SECTION 1 */}
                <section id="sec-1" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Section 1.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Short Title, Extent & Commencement
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>1.1 Title:</strong> This Charter shall be cited as the <em>Shri Nirakar Education Society Statutory Personal Data Protection Regulations, 2026</em>.
                    </p>
                    <p>
                      <strong>1.2 Institutional Extent:</strong> These provisions apply to all digital databases, web portals, admission engines, alumni records, and staff management files operated for:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-stone-700">
                      <li>Shri Nirakar High School (Mashem, Canacona • Index 08.006)</li>
                      <li>Tudal High School (Gaondongrem, Canacona • Rural Mission)</li>
                      <li>S.S. Angle Higher Secondary School (Mashem, Canacona • Index 08.06)</li>
                    </ul>
                    <p>
                      <strong>1.3 Commencement:</strong> These regulations take effect immediately from the commencement of Academic Session 2026–2027 and supersede all prior informal data practices.
                    </p>
                  </div>
                </section>

                {/* SECTION 2 */}
                <section id="sec-2" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Section 2.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Statutory Definitions
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>In this Charter, unless the context otherwise requires:</p>
                    <ul className="space-y-2 text-stone-700">
                      <li>
                        <strong>(a) "Data Principal":</strong> Means the natural person to whom the personal data relates, including enrolled students, applicant pupils, parents/lawful guardians, alumni, and teaching or administrative personnel.
                      </li>
                      <li>
                        <strong>(b) "Data Fiduciary":</strong> Means Shri Nirakar Education Society, which alone determines the purpose and means of processing personal data.
                      </li>
                      <li>
                        <strong>(c) "Minor Student":</strong> Means an individual enrolled in standard 5th through 12th who has not attained eighteen years of age.
                      </li>
                      <li>
                        <strong>(d) "Verifiable Parental Consent":</strong> Means consent obtained from the lawful father, mother, or legal guardian of a minor pupil prior to processing their admission records.
                      </li>
                      <li>
                        <strong>(e) "Educational Record":</strong> Means official cumulative academic records, Goa Board enrollment registers, internal CCE assessments, and graduation certificates.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* SECTION 3 */}
                <section id="sec-3" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Section 3.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Student Admissions & Minors Data Protection (Section 9 DPDP Act)
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>3.1 Prohibition of Independent Processing:</strong> In strict compliance with Section 9(1) of the Digital Personal Data Protection Act, 2023, the Society shall not process the personal data of any minor student without verifiable consent from their parent or lawful guardian.
                    </p>
                    <p>
                      <strong>3.2 Purpose Limitation for Minors:</strong> Personal information collected during online or offline admission (student full name, date of birth, previous school marks, parent contact, residential address, caste category for reserved benefits, Aadhaar / APAAR ID) shall be utilized exclusively for academic enrolment, attendance, and welfare entitlements.
                    </p>
                    <p>
                      <strong>3.3 Absolute Bar on Tracking & Profiling:</strong> The Society strictly prohibits any behavioral tracking, commercial targeted advertisement, or psychological profiling directed at minor students across all digital properties.
                    </p>
                  </div>
                </section>

                {/* SECTION 4 */}
                <section id="sec-4" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Section 4.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Academic Records & Goa Board Statutory Obligations
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>4.1 Mandatory Board Disclosures:</strong> The Society is bound under Goa School Education Act, 1984 and GBSHSE Examination Bye-Laws to transmit student academic logs, internal continuous evaluation (CCE) marks, and examination registration data to the <strong>Goa Board of Secondary and Higher Secondary Education, Alto-Betim</strong>.
                    </p>
                    <p>
                      <strong>4.2 Government Welfare Schemas:</strong> Enrolment statistics and entitlement registries are shared with the <strong>Directorate of Education, Government of Goa</strong> solely for statutory mid-day meal administration, free bus pass schemes, and SC/ST/OBC educational scholarship verification.
                    </p>
                  </div>
                </section>

                {/* SECTION 5 */}
                <section id="sec-5" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Section 5.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Alumni Sanctuary & Granular Privacy Architecture
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>5.1 Voluntary Participation:</strong> Registration on the Shree Nirakar Alumni Sanctuary portal is entirely voluntary.
                    </p>
                    <p>
                      <strong>5.2 Granular Per-Field Visibility:</strong> In accordance with Privacy by Design standards, every registered alumnus possesses autonomous controls over their directory records:
                    </p>
                    <div className="overflow-x-auto my-3">
                      <table className="w-full text-left text-xs border border-stone-200">
                        <thead>
                          <tr className="bg-stone-100 border-b border-stone-200 font-serif font-bold text-stone-900">
                            <th className="p-2.5">Field Category</th>
                            <th className="p-2.5">Default Setting</th>
                            <th className="p-2.5">Access Scope</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          <tr>
                            <td className="p-2.5 font-medium">Name, Class Batch & Campus</td>
                            <td className="p-2.5 text-stone-700">Public</td>
                            <td className="p-2.5 text-stone-600">Visible to verified visitors in directory</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium">Higher Degree & Current City</td>
                            <td className="p-2.5 text-stone-700">Alumni Only</td>
                            <td className="p-2.5 text-stone-600">Restricted to logged-in alumni members</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium text-stone-900 font-bold">Mobile Number & Email Address</td>
                            <td className="p-2.5 text-red-900 font-bold">Strictly Private</td>
                            <td className="p-2.5 text-stone-600">Hidden from directory; accessible only via proxy contact form</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p>
                      <strong>5.3 Account De-registration:</strong> An alumnus may request immediate de-registration and profile deletion at any time by lodging an instruction with privacy@nirakar.edu.
                    </p>
                  </div>
                </section>

                {/* SECTION 6 */}
                <section id="sec-6" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Section 6.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Teaching & Administrative Personnel Records
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>6.1 Employee Data:</strong> Faculty credentials, B.Ed / M.Ed qualifications, service books, and salary disbursement records are processed strictly in conformity with Goa Directorate of Education Grant-in-Aid Codes.
                    </p>
                    <p>
                      <strong>6.2 Internal Faculty Portal:</strong> Credentials on the faculty portal are restricted to authenticated staff for syllabus completion logging and board evaluation management.
                    </p>
                  </div>
                </section>

                {/* SECTION 7 */}
                <section id="sec-7" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Section 7.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Strict Non-Commercial Undertaking
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p className="bg-stone-100 p-4 border-l-4 border-[#111b5e] font-serif text-stone-900">
                      <strong>Solemn Declaration:</strong> Shri Nirakar Education Society gives its solemn institutional undertaking that student, parent, alumni, and teacher contact records are <strong>never sold, commercialized, monetized, leased, or transferred</strong> to commercial marketing firms, private coaching institutes, or third-party data brokers under any circumstances.
                    </p>
                  </div>
                </section>

                {/* SECTION 8 */}
                <section id="sec-8" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Section 8.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Technical Security, Encryption & Retention Schedules
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>8.1 Security safeguards:</strong> The site uses security controls in its application and infrastructure. Specific encryption algorithms, database isolation and hosting safeguards must be confirmed by the Society’s technology provider before this policy can make technical assurances.
                    </p>
                    <p>
                      <strong>8.2 Retention Period:</strong> A retention schedule by data category has not been published. No automated deletion schedule is represented here; retention and deletion practices require institutional approval.
                    </p>
                  </div>
                </section>

                {/* SECTION 9 */}
                <section id="sec-9" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Section 9.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Statutory Rights of Data Principals (DPDP Act, 2023)
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>Every Data Principal (or their lawful parent/guardian in case of a minor) possesses statutory rights under Chapter III of the Act:</p>
                    <ul className="space-y-2 text-stone-700 pl-4 list-decimal">
                      <li>
                        <strong>Right of Access (Section 11):</strong> Right to obtain a summary of personal data being processed by the Society.
                      </li>
                      <li>
                        <strong>Right to Correction & Erasure (Section 12):</strong> Right to correct inaccurate information, update obsolete contact records, or request complete erasure where educational retention mandates have elapsed.
                      </li>
                      <li>
                        <strong>Grievance redressal:</strong> Submit a concern through the Grievance Redressal page and use the private tracking code to check published updates. Applicable legal response requirements and the Society’s approved service timeline must be confirmed before publication.
                      </li>
                      <li>
                        <strong>Right to Nominate (Section 14):</strong> Right to nominate an individual who shall exercise data rights in the event of death or incapacity.
                      </li>
                    </ul>
                  </div>
                </section>

                {/* SECTION 10 */}
                <section id="sec-10" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Section 10.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Statutory Data Protection Officer & Redressal Protocol
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-3">
                    <p>
                      All inquiries, rights requests, and statutory grievances must be addressed in writing to the designated compliance desk:
                    </p>
                    <div className="bg-stone-50 p-4 border border-stone-300 space-y-1.5 text-xs font-mono">
                      <div><strong>DESIGNATION:</strong> Registrar & Statutory Compliance Officer</div>
                      <div><strong>INSTITUTION:</strong> Shri Nirakar Education Society</div>
                      <div><strong>OFFICE:</strong> Central Secretariat, Mashem Campus, Canacona, South Goa – 403728</div>
                      <div><strong>EMAIL:</strong> privacy@nirakar.edu / registrar@nirakar.edu</div>
                      <div><strong>TELEPHONE:</strong> +91 832 2643236</div>
                      <div><strong>TIMELINE:</strong> Written response within thirty (30) statutory calendar days.</div>
                    </div>
                    <p className="text-xs text-stone-600">
                      If any grievance is not satisfactorily redressed by the Society within 30 days, the complainant retains the statutory right under Section 19 of the DPDP Act 2023 to submit a formal appeal directly to the <strong>Data Protection Board of India (DPBI)</strong>.
                    </p>
                  </div>
                </section>

              </div>
            )}

            {/* =========================================================================
                PART II: INSTITUTIONAL TERMS OF SERVICE & CODE OF DISCIPLINE
                ========================================================================= */}
            {activeTab === 'terms' && (
              <div className="bg-white border border-stone-300 divide-y divide-stone-200">
                
                {/* ARTICLE 1 */}
                <section id="art-1" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Article 1.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Scope, Authority & Binding Agreement
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>1.1 Promulgation:</strong> These regulations are framed under the authority of the Governing Council of Shri Nirakar Education Society (Estd. 1939) in compliance with the Goa School Education Act, 1984.
                    </p>
                    <p>
                      <strong>1.2 Applicability:</strong> Enrolment in any institutional branch (Shri Nirakar High School, Tudal High School, or S.S. Angle Higher Secondary School) or utilization of this portal implies explicit acceptance of these service terms.
                    </p>
                  </div>
                </section>

                {/* ARTICLE 2 */}
                <section id="art-2" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Article 2.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Student Admissions & Eligibility Verification
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>2.1 Veracity of Documents:</strong> All academic transcripts, birth certificates, and caste/income documents submitted during admission must be genuine. Submission of forged or altered certificates shall result in immediate summary cancellation of admission and forfeiture of fees.
                    </p>
                    <p>
                      <strong>2.2 Transfer Certificates (TC):</strong> Admitted students must produce an official Transfer Certificate countersigned by the competent educational inspector as mandated by the Directorate of Education, Goa.
                    </p>
                  </div>
                </section>

                {/* ARTICLE 3 */}
                <section id="art-3" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Article 3.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Academic Discipline & Student Honor Code
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>3.1 Decorum:</strong> Students must maintain exemplary moral conduct, punctuality, and respect towards educators, laboratory personnel, and fellow students.
                    </p>
                    <p>
                      <strong>3.2 Anti-Ragging Mandate:</strong> Ragging, harassment, cyber-bullying, or physical intimidation in any form is strictly prohibited under the <em>Goa Prohibition of Ragging Act, 2008</em> and will result in expulsion and police registration.
                    </p>
                    <p>
                      <strong>3.3 Substance Prohibition:</strong> Possession or consumption of tobacco, alcohol, narcotics, or prohibited intoxicants on school premises is strictly forbidden.
                    </p>
                  </div>
                </section>

                {/* ARTICLE 4 */}
                <section id="art-4" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Article 4.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Campus Scientific Laboratories & IT Infrastructure Usage
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>4.1 Laboratory Apparatus:</strong> Students utilizing science experimentation suites, Atal Tinkering Labs (ATL), or IT computer centers must strictly observe laboratory safety norms.
                    </p>
                    <p>
                      <strong>4.2 Cyber Integrity:</strong> Tampering with computer terminal configurations, introducing malicious software, accessing unauthorized networks, or attempting security breaches will invite disciplinary action and compensation for damages.
                    </p>
                  </div>
                </section>

                {/* ARTICLE 5 */}
                <section id="art-5" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Article 5.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Government-Approved Fees & Caution Deposits
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>5.1 Regulated Scales:</strong> Institutional tuition and laboratory maintenance fees are levied strictly in accordance with schedules approved by the Directorate of Education, Government of Goa.
                    </p>
                    <p>
                      <strong>5.2 Refund Norms:</strong> Refunds upon withdrawal are governed by official Goa Board regulations and issued only after deduction of administrative charges incurred prior to cut-off dates.
                    </p>
                  </div>
                </section>

                {/* ARTICLE 6 */}
                <section id="art-6" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Article 6.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Alumni Directory Protocol & Community Ethics
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>6.1 Community Fellowship:</strong> The alumni directory is designed for mutual mentorship, scholarly guidance, and commemorative alumni reunions.
                    </p>
                    <p>
                      <strong>6.2 Commercial Solicitation Bar:</strong> Members shall not extract contact coordinates to transmit unsolicited commercial proposals, political campaigning, or mass chain correspondence. Violation results in instant revocation of directory access.
                    </p>
                  </div>
                </section>

                {/* ARTICLE 7 */}
                <section id="art-7" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Article 7.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Intellectual Property & Historical Batch Archives
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>7.1 Society Insignia:</strong> The official emblem, motto (<em>।। तमसो मा ज्योतिर्गमय ।।</em>), syllabi, and daily magazine editions are intellectual property of Shri Nirakar Education Society.
                    </p>
                    <p>
                      <strong>7.2 Historical Portraits:</strong> Historical graduation batch photographs (1968–2026) are preserved for institutional heritage and student commemoration. Unauthorized commercial exploitation is actionable under the Copyright Act, 1957.
                    </p>
                  </div>
                </section>

                {/* ARTICLE 8 */}
                <section id="art-8" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Article 8.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Attendance, CCE & Board Examination Conditions
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>8.1 Attendance Mandate:</strong> A minimum of 75% verified instructional attendance is mandatory under Goa Board regulations to be eligible for SSC or HSSC public board examinations.
                    </p>
                    <p>
                      <strong>8.2 Internal Assessment (CCE):</strong> Marks awarded under Continuous Comprehensive Evaluation (CCE) require timely submission of journal records, science practicals, and internal projects.
                    </p>
                  </div>
                </section>

                {/* ARTICLE 9 */}
                <section id="art-9" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Article 9.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Disciplinary Inquiries, Suspension & Expulsion
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>9.1 Due Process:</strong> Any student or portal user accused of grave misconduct or academic fraud shall be accorded an inquiry by the Institutional Disciplinary Committee before final sanctions are imposed.
                    </p>
                    <p>
                      <strong>9.2 Executive Sanctions:</strong> The Principal, with approval of the Society Governing Council, reserves full authority to issue written warnings, suspend from classes, or issue a compulsory transfer certificate in instances of gross indiscipline.
                    </p>
                  </div>
                </section>

                {/* ARTICLE 10 */}
                <section id="art-10" className="p-6 sm:p-8 space-y-3 scroll-mt-28">
                  <div className="font-mono text-xs text-stone-500 uppercase">Article 10.0</div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Governing Law & Judicial Jurisdiction (Canacona / South Goa)
                  </h2>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed space-y-2">
                    <p>
                      <strong>10.1 Law of India:</strong> These Terms shall be construed and governed in accordance with the laws of the Republic of India and educational statutes of the State of Goa.
                    </p>
                    <p>
                      <strong>10.2 Exclusive Jurisdiction:</strong> In the event of any legal dispute, dispute resolution, or civil suit arising between the Society and any user, student, or guardian, the <strong>competent Civil and Criminal Courts situated in Canacona and Margao, South Goa</strong> shall exercise sole and exclusive judicial jurisdiction.
                    </p>
                  </div>
                </section>

              </div>
            )}

            {/* FORMAL SIGN-OFF MASTER BLOCK */}
            <div className="bg-stone-100 border border-stone-300 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-stone-700">
              <div>
                <div>BY ORDER OF THE GOVERNING COUNCIL</div>
                <div className="text-stone-500 text-[11px]">Shri Nirakar Education Society, Mashem, Canacona, Goa</div>
              </div>
              <div className="text-right">
                <div>REGISTRAR & SECRETARY</div>
                <div className="text-stone-500 text-[11px]">Academic Year 2026–2027</div>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default PolicyPage;
