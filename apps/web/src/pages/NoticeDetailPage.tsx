import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Printer, 
  Copy,
  Check,
  Building2,
  ExternalLink
} from 'lucide-react';
import { NoticeItem } from '../components/NewsAndEvents.js';
import { slugify } from '../utils/slugify.js';
import { decodeNoticeMeta } from '../utils/noticeMeta.js';

const KNOWN_NOTICES: NoticeItem[] = [
  {
    id: 'n1',
    refNo: 'NIRAKAR/HS/CIR/0114',
    title: 'Goa Board SSC Examination Form Submission & Document Verification',
    date: '2026-10-18',
    target: 'Shri Nirakar High School, Mashem',
    type: 'exam',
    urgent: true,
    fileSize: '1.4 MB',
    pdfUrl: '/documents/ssc_form_notice_2026.pdf',
    description: `Mandatory submission of birth certificates, Aadhaar identity verification, and photograph endorsements for March 2027 Goa Board examinations.

All Class X students of Shri Nirakar High School (Mashem) and Tudal High School (Gaondongrem) must report to the central administrative office along with two sets of self-attested photocopies by October 30, 2026.

Requirements for Form Submission:
1. Original Birth Certificate with 2 self-attested photocopies
2. Aadhaar Card copy linked to student bank account
3. Four recent passport-sized color photographs with white background
4. Caste Certificate (where claiming statutory category concessions)

Late submissions will incur statutory penalty fees as stipulated by the Goa Board of Secondary and Higher Secondary Education, Alto-Betim. Guardians may contact class mentors for verification support.`,
    institutionCode: 'NIRAKAR_HS',
  },
  {
    id: 'n2',
    refNo: 'ANGLE/HSS/CIR/0092',
    title: 'Enrollment Open: S.S. Angle Higher Secondary (Science, Commerce & Arts)',
    date: '2026-10-15',
    target: 'S.S. Angle HSS, Dapot',
    type: 'admission',
    urgent: true,
    fileSize: '2.8 MB',
    pdfUrl: '/documents/angle_prospectus_2026.pdf',
    description: `Prospectus, subject choice counseling, and integrated NEET/IIT-JEE foundation coaching enrollments are now available at the administrative counter.

Merit scholarships are applicable for distinction holders and rural students of Canacona taluka. The orientation counseling sessions will take place at the Memorial Auditorium on October 22, 2026.`,
    institutionCode: 'ANGLE_HSS',
  },
  {
    id: 'n3',
    refNo: 'TUDAL/HS/CIR/0078',
    title: 'State Government Tribal & Rural Student Scholarship Disbursal 2026',
    date: '2026-10-10',
    target: 'Tudal High School, Gaondongrem',
    type: 'scholarship',
    urgent: false,
    fileSize: '950 KB',
    pdfUrl: '/documents/tribal_scholarship_list.pdf',
    description: `Direct Benefit Transfer (DBT) verification for Goa Social Welfare tribal scholarship beneficiaries.

Eligible students must confirm their Nationalised Bank account details, IFSC code, and Aadhaar seeding status at the school accounts section for electronic grant transfer.`,
    institutionCode: 'TUDAL_HS',
  },
  {
    id: 'n4',
    refNo: 'SNES/CIR/0065',
    title: 'First Term Examination Schedule for Secondary Standards (Std VIII–X)',
    date: '2026-10-04',
    target: 'All Society Campuses',
    type: 'exam',
    urgent: false,
    fileSize: '1.1 MB',
    pdfUrl: '/documents/first_term_timetable.pdf',
    description: `Detailed subject timetable, laboratory practical dates, and internal assessment guidelines published on central school boards and parent-teacher portal.

Morning sessions begin promptly at 9:00 AM. Hall tickets must be collected from respective class mentors.`,
    institutionCode: '',
  },
  {
    id: 'n5',
    refNo: 'TUDAL/HS/CIR/0054',
    title: 'Selection Trials for Directorate of Sports Goa State Volleyball Meet',
    date: '2026-09-25',
    target: 'Tudal High School, Gaondongrem',
    type: 'circular',
    urgent: false,
    fileSize: '780 KB',
    pdfUrl: null,
    description: `Under-17 and Under-19 boys and girls volleyball trials scheduled at Tudal pavilion ground under supervision of physical education faculty.`,
    institutionCode: 'TUDAL_HS',
  },
  {
    id: 'n6',
    refNo: 'SNES/CIR/0048',
    title: 'National Cadet Corps (NCC) Navy & Army Wing Annual Enlistment',
    date: '2026-09-12',
    target: 'Shri Nirakar High School, Mashem',
    type: 'circular',
    urgent: false,
    fileSize: '1.6 MB',
    pdfUrl: '/documents/ncc_enlistment.pdf',
    description: `Cadet enlistment drive for Class VIII and IX students with parade drills, camps at Naval Base Karwar, and B/C Certificate bonus points for higher education admissions.`,
    institutionCode: 'NIRAKAR_HS',
  }
];

export const NoticeDetailPage: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const routeParam = slug || id || '';
  const [copiedRef, setCopiedRef] = useState(false);

  // Fetch notice by slug or id from API
  const { data: apiData } = useQuery({
    queryKey: ['notice', routeParam],
    queryFn: async () => {
      try {
        // 1. Try direct lookup by ID or slug
        const res = await fetch(`/api/v1/content/notices/${encodeURIComponent(routeParam)}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) return json.data;
        }

        // 2. Fallback: Search all notices list by slug match
        const listRes = await fetch('/api/v1/content/notices');
        if (listRes.ok) {
          const listJson = await listRes.json();
          const allNotices = listJson?.data || [];
          const matched = allNotices.find(
            (item: any) =>
              slugify(item.title) === routeParam ||
              item.id === routeParam ||
              routeParam.includes(item.id)
          );
          if (matched) return matched;
        }
        return null;
      } catch {
        return null;
      }
    },
    staleTime: 60 * 1000,
  });

  const notice: NoticeItem = useMemo(() => {
    if (apiData) {
      let target = 'All Society Campuses';
      if (apiData.institutionCode === 'NIRAKAR_HS') target = 'Shri Nirakar High School, Mashem';
      else if (apiData.institutionCode === 'TUDAL_HS') target = 'Tudal High School, Gaondongrem';
      else if (apiData.institutionCode === 'ANGLE_HSS') target = 'S. S. Angle Higher Secondary School, Dapot';

      const decoded = decodeNoticeMeta(apiData.content);
      const customRef = decoded.refNo || apiData.refNo;
      const refNo = customRef && customRef.trim().length > 0
        ? customRef.trim()
        : apiData.institutionCode
          ? `${apiData.institutionCode.replace('_', '/')}/CIR/${String(apiData.id).slice(-4).toUpperCase()}`
          : `SNES/CIR/${String(apiData.id).slice(-4).toUpperCase()}`;

      // Urgent is strictly determined by the explicit urgent flag (not pinned!)
      const isUrgent = apiData.urgent !== undefined ? Boolean(apiData.urgent) : decoded.urgent;

      return {
        id: String(apiData.id),
        refNo,
        type: 'circular',
        title: apiData.title,
        date: apiData.date || new Date().toISOString().split('T')[0],
        urgent: isUrgent,
        fileSize: apiData.pdfUrl ? 'Official PDF' : 'Circular',
        target,
        institutionCode: apiData.institutionCode || '',
        description: decoded.content || apiData.content || apiData.description || 'Authenticated circular issued by Shree Nirakar Education Society.',
        pdfUrl: apiData.pdfUrl || null,
      };
    }

    if (routeParam) {
      const match = KNOWN_NOTICES.find(
        (n) => slugify(n.title) === routeParam || n.id === routeParam || routeParam.includes(n.id)
      );
      if (match) return match;
    }

    return KNOWN_NOTICES[0];
  }, [apiData, routeParam]);

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(notice.refNo);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    } catch {}
  };

  const handlePrint = () => {
    window.print();
  };

  // Format paragraphs
  const paragraphs = notice.description.split('\n\n').filter(Boolean);

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-amber-200 selection:text-stone-900">
      <Helmet>
        <title>{`${notice.title} | Official Circular | Shree Nirakar Education Society`}</title>
        <meta name="description" content={notice.description.slice(0, 160)} />
      </Helmet>

      <Navbar />

      {/* FULL-WIDTH BREADCRUMB STRIP */}
      <div className="w-full border-b border-stone-200/80 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-3">
        <div className="w-full flex items-center justify-between text-xs font-mono text-stone-500">
          <div className="flex items-center gap-2 truncate">
            <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <span className="text-stone-300">/</span>
            <Link to="/notices" className="hover:text-stone-900 transition-colors">Official Circulars</Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-800 font-medium truncate">{notice.refNo}</span>
          </div>

          <Link
            to="/notices"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-stone-600 hover:text-stone-900 shrink-0 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>All Circulars Archive</span>
          </Link>
        </div>
      </div>

      {/* FULL-WIDTH STRETCHED EDITORIAL CANVAS */}
      <main className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-14 space-y-10">
        
        {/* 1. AUTHENTIC INSTITUTIONAL LETTERHEAD DISPATCH HEADER */}
        <header className="space-y-6">
          
          {/* Institutional Crest & Seal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-stone-800">
            <div className="space-y-1">
              <div className="font-serif text-xl sm:text-2xl font-black text-[#0b132b] tracking-tight uppercase">
                Shree Nirakar Education Society
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-stone-500">
                Central Administrative Registry • Estd. 1968 • Mashem, Canacona, South Goa
              </div>
              <div className="text-[11px] text-stone-400 font-sans">
                Govt. Reg. No. 248/Goa • Recognized by Directorate of Education, Govt. of Goa
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto text-xs font-mono">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 hover:border-stone-800 text-stone-700 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer size={13} />
                <span>Print Circular</span>
              </button>

              <button
                type="button"
                onClick={handleCopyRef}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 hover:border-stone-800 text-stone-700 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedRef ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Ref</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Official Dispatch Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-stone-200 text-xs sm:text-sm font-mono text-stone-600">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <div>
                <span className="text-stone-400 uppercase text-[11px] mr-1.5">Ref No:</span>
                <span className="font-bold text-stone-900">{notice.refNo}</span>
              </div>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <div>
                <span className="text-stone-400 uppercase text-[11px] mr-1.5">Date of Issue:</span>
                <span className="font-medium text-stone-900">{notice.date}</span>
              </div>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <div>
                <span className="text-stone-400 uppercase text-[11px] mr-1.5">Jurisdiction:</span>
                <span className="font-medium text-amber-800 uppercase">{notice.target}</span>
              </div>
            </div>

            {notice.urgent && (
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                Statutory Compliance Required
              </span>
            )}
          </div>

          {/* Subject Line / Memorandum Title */}
          <div className="pt-2">
            <div className="text-xs font-mono uppercase tracking-widest text-stone-400 font-bold mb-2">
              Official Memorandum & Gazette Order
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b132b] tracking-tight leading-[1.18]">
              {notice.title}
            </h1>
          </div>
        </header>

        {/* 2. EXPANSIVE FULL-WIDTH 2-COLUMN DISPATCH LAYOUT */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-6 border-t border-stone-200">
          
          {/* Main Dispatch Narrative Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            <article className="space-y-6">
              <div className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
                Directive Preamble & Mandates
              </div>

              {paragraphs.map((p, idx) => (
                <div
                  key={idx}
                  className={`text-stone-800 leading-relaxed font-sans ${
                    idx === 0 
                      ? 'text-lg sm:text-xl font-serif text-stone-900 font-normal leading-relaxed' 
                      : 'text-base sm:text-lg whitespace-pre-line'
                  }`}
                >
                  {p}
                </div>
              ))}
            </article>

            {/* Official Administrative Attestation */}
            <div className="pt-10 border-t border-stone-200/90 space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
                Attested Under Seal of Society
              </div>

              <div className="space-y-1 font-serif text-stone-900">
                <div className="font-bold text-base">Office of the Headmaster & Board Liaison</div>
                <div className="text-sm text-stone-600 font-sans">Shree Nirakar Education Society, Canacona</div>
                <div className="text-xs text-stone-400 font-mono pt-1">
                  Dispatched via Society Circular Registry • Valid for Official & Legal Purposes
                </div>
              </div>
            </div>

            {/* Return link */}
            <div className="pt-6 border-t border-stone-200">
              <Link
                to="/notices"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0b132b] hover:text-amber-700 hover:underline transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Return to All Official Circulars Archive</span>
              </Link>
            </div>
          </div>

          {/* Institutional Sidebar: Attested PDF & Office Hours (4 Cols) */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Authenticated Download Block */}
            {notice.pdfUrl ? (
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-900 font-bold flex items-center gap-1.5">
                    <FileText size={15} className="text-amber-800" />
                    <span>Official Attested Circular</span>
                  </div>
                  <div className="text-xs text-stone-600 font-sans leading-relaxed">
                    Download the signed gazette document with official seal and registrar stamp.
                  </div>
                </div>

                <a
                  href={notice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="w-full py-3 px-4 rounded-xl bg-[#0b132b] hover:bg-stone-800 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow"
                >
                  <Download size={14} />
                  <span>Download Attested PDF</span>
                </a>

                <div className="text-[11px] font-mono text-stone-500 text-center">
                  File Size: {notice.fileSize || 'Standard PDF'} • Verified SHA-256
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-500 space-y-1">
                <div className="font-mono font-bold text-stone-700 uppercase">Physical Registry Notice</div>
                <div>This directive is displayed on campus bulletin boards. No supplementary digital attachment is appended.</div>
              </div>
            )}

            {/* Circular Logistics Sheet */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#0b132b] pb-2 border-b border-stone-300">
                Dispatch Summary
              </h3>

              <dl className="space-y-3.5 text-sm">
                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Circular Reference</dt>
                  <dd className="font-mono font-bold text-stone-900 mt-0.5">{notice.refNo}</dd>
                </div>

                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Date Published</dt>
                  <dd className="font-medium text-stone-900 mt-0.5">{notice.date}</dd>
                </div>

                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Campus Jurisdiction</dt>
                  <dd className="font-medium text-stone-900 mt-0.5">{notice.target}</dd>
                </div>

                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Issuing Authority</dt>
                  <dd className="text-xs text-stone-700 mt-0.5 leading-relaxed">
                    Executive Board of Trustees & Central Secretariat, Mashem, Canacona
                  </dd>
                </div>
              </dl>
            </div>

            {/* Helpline & Guidance */}
            <div className="space-y-2 pt-4 border-t border-stone-200 text-xs text-stone-500 font-sans leading-relaxed">
              <div className="font-mono font-bold uppercase text-stone-600">Verification & Assistance</div>
              <div>Administrative Office: +91 832 2643236</div>
              <div>Email: registry@nirakareducation.org</div>
              <div>Office Hours: Mon–Sat, 08:30 AM to 04:30 PM</div>
            </div>

          </aside>

        </section>

      </main>

      <Footer />
    </div>
  );
};
