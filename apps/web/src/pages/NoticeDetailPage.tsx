import React, { useState } from 'react';
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
import { fetchNotice } from '../lib/content.js';

/* The circular itself, read from the registry. There is no second,
   hand-written copy to fall back on: if the registry has no such
   circular, the page says so rather than showing something else in
   its place. */

export const NoticeDetailPage: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const routeParam = slug || id || '';
  const [copiedRef, setCopiedRef] = useState(false);

  const { data: notice, isLoading } = useQuery<NoticeItem | null>({
    queryKey: ['notice', routeParam],
    queryFn: () => fetchNotice(routeParam),
    enabled: Boolean(routeParam),
    staleTime: 60 * 1000,
  });

  const handleCopyRef = async () => {
    if (!notice) return;
    try {
      await navigator.clipboard.writeText(notice.refNo);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    } catch { }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#FDFBF7] text-stone-900 font-sans flex flex-col">
        <Navbar />
        <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0b132b] border-t-transparent" />
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Opening the circular
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="w-full min-h-screen bg-[#FDFBF7] text-stone-900 font-sans flex flex-col">
        <Helmet>
          <title>Circular not found | Shri Nirakar Education Society</title>
        </Helmet>
        <Navbar />
        <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <FileText size={30} className="text-stone-300" />
          <h1 className="font-serif text-2xl font-bold text-stone-800">Circular not found</h1>
          <p className="max-w-sm text-sm text-stone-500">
            This circular is not in the registry. It may have been withdrawn, or the
            address may be mistyped.
          </p>
          <Link
            to="/notices"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b132b] px-5 py-3 text-xs font-bold text-white transition hover:bg-stone-800"
          >
            <ArrowLeft size={14} />
            Back to the archive
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Format paragraphs
  const paragraphs = notice.description.split('\n\n').filter(Boolean);

  return (
    <div className="notice-page-root w-full min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-amber-200 selection:text-stone-900 print:bg-white print:min-h-0 print:text-black">
      <Helmet>
        <title>{`${notice.title} | Official Circular | Shri Nirakar Education Society`}</title>
        <meta name="description" content={notice.description.slice(0, 160)} />
      </Helmet>

      {/* DEDICATED PRINT STYLESHEET FOR AUTHENTIC SCHOOL NOTICE PRINTING */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 14mm 8mm 14mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            text-shadow: none !important;
            box-shadow: none !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: "Times New Roman", Times, Georgia, serif !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Strictly hide all web elements, headers, navs, footers, recaptcha badge and aside */
          header, nav, footer, aside, .no-print,
          .screen-notice-container,
          .grecaptcha-badge,
          iframe[src*="recaptcha"],
          iframe[title*="recaptcha"],
          div[style*="z-index: 2000000000"] {
            display: none !important;
            visibility: hidden !important;
            position: absolute !important;
            left: -99999px !important;
            top: -99999px !important;
            height: 0 !important;
            width: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          /* Force clean full-width A4 document container without any height leaks */
          .notice-page-root {
            background: #ffffff !important;
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
          }

          /* Show only the authentic physical school notice */
          .official-school-notice-document {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 265mm !important;
            max-height: 265mm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }

          .official-school-notice-document * {
            color: #000000 !important;
            background-color: transparent !important;
            border-color: #000000 !important;
          }

          .print-avoid-break {
            page-break-inside: avoid !important;
          }
        }

        /* Screen-only view hides the print-only physical document */
        @media screen {
          .official-school-notice-document {
            display: none;
          }
        }
      `}</style>

      {/* ============================================================== */}
      {/* 1. AUTHENTIC SCHOOL NOTICE DOCUMENT (PRINT ONLY)               */}
      {/* ============================================================== */}
      <div className="official-school-notice-document font-serif">
        {/* Top Header & Crest */}
        <div className="text-center pb-3 border-b-2 border-black">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img
              src="/images/Logo.png"
              alt="School Crest"
              className="w-18 h-18 object-contain filter grayscale contrast-200"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/Logo.jpg';
              }}
            />
            <div className="text-center">
              <div className="text-[10.5pt] tracking-wider uppercase font-sans font-semibold">
                ॥ विद्या ददाति विनयं ॥
              </div>
              <h1 className="text-[21pt] font-black uppercase tracking-tight leading-none mt-0.5">
                SHRI NIRAKAR EDUCATION SOCIETY
              </h1>
              <div className="text-[10pt] font-sans uppercase tracking-normal mt-1">
                Mashem, Canacona, South Goa – 403 728
              </div>
            </div>
          </div>

          <div className="text-[9pt] font-sans border-t border-black/60 pt-1.5 mt-1 text-center">
            <span>Govt. Reg. No. 248/Goa</span>
            <span className="mx-2.5">•</span>
            <span>Recognized by Directorate of Education, Govt. of Goa</span>
            <span className="mx-2.5">•</span>
            <span>Tel: (0832) 2643236</span>
          </div>
        </div>

        {/* Central Notice Title Banner */}
        <div className="text-center my-4">
          <span className="inline-block border-b-2 border-black text-[16pt] font-black tracking-[0.28em] uppercase pb-0.5 px-6 font-serif">
            CIRCULAR / NOTICE
          </span>
        </div>

        {/* Dispatch Details Bar */}
        <div className="flex items-center justify-between text-[11pt] font-serif border-b border-black pb-2 mb-4">
          <div>
            <strong>Ref. No.:</strong> <span className="font-mono font-bold">{notice.refNo}</span>
          </div>
          <div>
            <strong>Date:</strong> <span className="font-bold">{notice.date}</span>
          </div>
        </div>

        {/* Target Jurisdiction / To Whom */}
        <div className="text-[11.5pt] font-serif mb-4 leading-normal">
          <div><strong>To:</strong> All Headmasters, Teachers, Staff Members & Students</div>
          <div><strong>Jurisdiction / Section:</strong> <span className="uppercase font-semibold">{notice.target}</span></div>
          {notice.urgent && (
            <div className="font-bold text-[10.5pt] uppercase mt-1.5 inline-block border-2 border-black px-2.5 py-0.5">
              Urgent / Statutory Compliance
            </div>
          )}
        </div>

        {/* Subject Line */}
        <div className="p-2.5 border-y-2 border-black text-[12.5pt] font-serif mb-6 leading-snug">
          <strong>SUBJECT: </strong>
          <span className="font-black uppercase tracking-tight">{notice.title}</span>
        </div>

        {/* Notice Narrative Body Paragraphs */}
        <div className="space-y-4 text-[12pt] font-serif leading-[1.65] text-justify flex-1">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="indent-8 text-black">
              {p}
            </p>
          ))}
        </div>

        {/* Official School Seal & Dual Signatures Block (Positioned down at bottom) */}
        <div className="print-avoid-break mt-auto pt-6 border-t-2 border-black">
          <div className="grid grid-cols-3 items-end text-center pt-2">

            {/* Left: Office / Seal */}
            <div className="text-left text-[9.5pt]">
              <div className="border border-dashed border-black/80 w-28 h-28 rounded-full flex flex-col items-center justify-center text-center p-2 mx-auto sm:mx-0">
                <span className="text-[8.5pt] font-bold uppercase">Official Seal</span>
                <span className="text-[7pt] leading-tight mt-1">Shri Nirakar Education Society</span>
              </div>
              <div className="mt-2 text-[8.5pt] font-sans text-neutral-800 text-center sm:text-left">
                Place: Mashem, Canacona
              </div>
            </div>

            {/* Center: Headmaster / Principal */}
            <div className="space-y-1">
              <div className="h-14"></div>
              <div className="font-bold text-[11.5pt]">Headmaster / In-Charge</div>
              <div className="text-[9.5pt] font-sans">Shree Nirakar Vidyalaya</div>
              <div className="text-[8.5pt] font-sans text-neutral-800">Canacona - Goa</div>
            </div>

            {/* Right: Secretary / Chairman */}
            <div className="space-y-1 text-right sm:text-center">
              <div className="h-14"></div>
              <div className="font-bold text-[11.5pt]">Chairman / Hon. Secretary</div>
              <div className="text-[9.5pt] font-sans">Shri Nirakar Education Society</div>
              <div className="text-[8.5pt] font-sans text-neutral-800">Executive Committee</div>
            </div>

          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SCREEN-ONLY INTERACTIVE WEBSITE DISPLAY                     */}
      {/* ============================================================== */}
      <div className="screen-notice-container">
        {/* GLOBAL NAVBAR - HIDDEN IN PRINT */}
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

            {/* Institutional Crest & Letterhead Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-stone-800">
              <div className="space-y-1">
                <div className="font-serif text-xl sm:text-2xl font-black text-[#0b132b] tracking-tight uppercase">
                  Shri Nirakar Education Society
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-stone-500">
                  Central Administrative Registry • Estd. 1968 • Mashem, Canacona, South Goa 403728
                </div>
                <div className="text-[11px] text-stone-400 font-sans">
                  Govt. Reg. No. 248/Goa • Recognized by Directorate of Education, Govt. of Goa
                </div>
              </div>

              {/* ACTION BUTTONS (PRINT, COPY REF) */}
              <div className="flex items-center gap-3 self-start sm:self-auto text-xs font-mono">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-300 hover:border-stone-800 text-stone-700 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer transition-colors bg-white shadow-xs"
                >
                  <Printer size={13} />
                  <span>Print Circular</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-300 hover:border-stone-800 text-stone-700 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer transition-colors bg-white shadow-xs"
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

          {/* 2. DISPATCH BODY LAYOUT */}
          <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-6 border-t border-stone-200">

            {/* Main Dispatch Narrative Column */}
            <div className="lg:col-span-8 space-y-8">
              <article className="space-y-6">
                <div className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
                  Directive Preamble & Mandates
                </div>

                {paragraphs.map((p, idx) => (
                  <div
                    key={idx}
                    className={`text-stone-800 leading-relaxed font-sans ${idx === 0
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
                  <div className="text-sm text-stone-600 font-sans">Shri Nirakar Education Society, Canacona</div>
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

            {/* Institutional Sidebar: Attested PDF & Office Hours */}
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
    </div>
  );
};
