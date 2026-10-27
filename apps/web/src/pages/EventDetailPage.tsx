import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Film, 
  Check,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { getSafeVideoEmbedUrl, CampusEvent } from '../components/NewsAndEvents.js';
import { fetchEvent, fetchEventComments, submitEventComment, type EventComment } from '../lib/content.js';
import { useAuthCaptcha, AuthCaptchaNotice } from '../components/AuthCaptcha.js';

export const EventDetailPage: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const routeParam = slug || id || '';
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [commentForm, setCommentForm] = useState({ authorName: '', place: '', email: '', content: '' });
  const [commentMessage, setCommentMessage] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const executeCaptcha = useAuthCaptcha();
  const queryClient = useQueryClient();

  /* The gathering itself, read from the registry. There is no second,
     hand-written copy to fall back on: if the registry has no such
     gathering, the page says so rather than showing something else in
     its place. */
  const { data: event, isLoading } = useQuery<CampusEvent | null>({
    queryKey: ['event', routeParam],
    queryFn: () => fetchEvent(routeParam),
    enabled: Boolean(routeParam),
    staleTime: 60 * 1000,
  });

  const { data: comments = [] } = useQuery<EventComment[]>({
    queryKey: ['event_comments', event?.id],
    queryFn: () => fetchEventComments(event!.id),
    enabled: Boolean(event?.id),
    staleTime: 30 * 1000,
  });

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');
    setCommentMessage('');
    setIsSubmittingComment(true);
    try {
      const captchaToken = await executeCaptcha('event_comment');
      await submitEventComment({ eventId: event?.id || routeParam, ...commentForm, captchaToken });
      setCommentForm({ authorName: '', place: '', email: '', content: '' });
      setCommentMessage('Your comment has been published.');
      await queryClient.invalidateQueries({ queryKey: ['event_comments', event?.id] });
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : 'Could not publish your comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#FDFBF7] text-stone-900 font-sans flex flex-col">
        <Navbar />
        <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0b132b] border-t-transparent" />
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Opening the gathering
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="w-full min-h-screen bg-[#FDFBF7] text-stone-900 font-sans flex flex-col">
        <Helmet>
          <title>Gathering not found | Shri Nirakar Education Society</title>
        </Helmet>
        <Navbar />
        <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <FileText size={30} className="text-stone-300" />
          <h1 className="font-serif text-2xl font-bold text-stone-800">Gathering not found</h1>
          <p className="max-w-sm text-sm text-stone-500">
            This gathering is not in the calendar. It may have been withdrawn, or the
            address may be mistyped.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b132b] px-5 py-3 text-xs font-bold text-white transition hover:bg-stone-800"
          >
            <ArrowLeft size={14} />
            Back to the calendar
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleShare = async () => {
    if (!event) return;
    const shareData = {
      title: event.title,
      text: `${event.title} • ${event.dateStr} at ${event.location}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {}
  };

  const getGoogleCalendarUrl = (ev: CampusEvent) => {
    const title = encodeURIComponent(ev.title);
    const details = encodeURIComponent(`${ev.description}\n\nVenue: ${ev.location}\nCampus: ${ev.campus}`);
    const location = encodeURIComponent(ev.location);
    let dates = '';
    if (ev.rawStartDate) {
      try {
        const start = new Date(ev.rawStartDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
        const end = ev.rawEndDate 
          ? new Date(ev.rawEndDate).toISOString().replace(/-|:|\.\d\d\d/g, '')
          : new Date(new Date(ev.rawStartDate).getTime() + 4 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '');
        dates = `${start}/${end}`;
      } catch {}
    }
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${dates ? `&dates=${dates}` : ''}`;
  };

  const safeEmbedUrl = getSafeVideoEmbedUrl(event.videoUrl);
  const isDirectVideo = safeEmbedUrl ? (safeEmbedUrl.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i) || safeEmbedUrl.startsWith('/uploads/')) : false;

  // Split description into lead paragraph and body
  const descParagraphs = event.description.split('\n\n').filter(Boolean);
  const leadParagraph = descParagraphs[0] || '';
  const bodyParagraphs = descParagraphs.slice(1);

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] text-stone-900 font-sans selection:bg-amber-200 selection:text-stone-900">
      <Helmet>
        <title>{`${event.title} | Shri Nirakar Education Society`}</title>
        <meta name="description" content={event.description.slice(0, 160)} />
      </Helmet>

      <Navbar />

      {/* FULL-WIDTH REFINED BREADCRUMB STRIP */}
      <div className="w-full border-b border-stone-200/80 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-3">
        <div className="w-full flex items-center justify-between text-xs font-mono text-stone-500">
          <div className="flex items-center gap-2 truncate">
            <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <span className="text-stone-300">/</span>
            <Link to="/events" className="hover:text-stone-900 transition-colors">Campus Events</Link>
            <span className="text-stone-300">/</span>
            <span className="text-stone-800 font-medium truncate">{event.title}</span>
          </div>

          <Link
            to="/events"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-stone-600 hover:text-stone-900 shrink-0 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>All Events Archive</span>
          </Link>
        </div>
      </div>

      {/* EXPANSIVE FULL-WIDTH STRETCHED EDITORIAL CANVAS */}
      <main className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-14 space-y-10 sm:space-y-12">
        
        {/* 1. REFINED EDITORIAL HEADLINE & METADATA (NO AI-SLOP PILLS OR BOXES) */}
        <header className="space-y-4">
          
          {/* Understated Editorial Kicker */}
          <div className="text-xs sm:text-[13px] font-mono tracking-widest uppercase text-stone-500 font-semibold flex flex-wrap items-center gap-x-2.5 gap-y-1.5 leading-relaxed">
            <span className="shrink-0">{event.campus}</span>
            <span className="text-stone-300 select-none">•</span>
            <span className="text-amber-800 shrink-0">{event.category}</span>
            <span className="text-stone-300 select-none">•</span>
            <span className="shrink-0">{event.isUpcoming ? 'Scheduled Gathering' : 'Past Archive'}</span>
          </div>

          {/* Grand Editorial Serif Title */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-[#0b132b] tracking-tight leading-[1.12]">
            {event.title}
          </h1>

          {/* Clean Hairline Dateline Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200/90 text-xs sm:text-sm font-sans text-stone-600">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                {event.dateStr}
              </span>
              <span className="text-stone-300 font-mono hidden sm:inline">|</span>
              <span className="text-stone-700">
                {event.time}
              </span>
              <span className="text-stone-300 font-mono hidden sm:inline">|</span>
              <span className="text-stone-600">
                {event.location}
              </span>
            </div>

            <div className="flex items-center gap-5 text-xs font-mono">
              <a
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-600 hover:text-[#0b132b] underline underline-offset-4 flex items-center gap-1 transition-colors"
              >
                <span>Add to Calendar</span>
                <ArrowUpRight size={13} />
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="text-stone-600 hover:text-[#0b132b] underline underline-offset-4 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedShare ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    <span>Share Event</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* 2. FULL-WIDTH CINEMATIC PHOTOGRAPHY CONTAINER */}
        {event.photos.length > 0 && (
          <section className="w-full space-y-3">
            <div className="relative w-full aspect-[21/9] sm:aspect-[2.35/1] min-h-[340px] sm:min-h-[460px] lg:min-h-[540px] rounded-2xl overflow-hidden bg-stone-900 shadow-sm border border-stone-200/90 group">
              <img
                src={event.photos[activePhotoIdx]?.url || event.coverImage}
                alt={event.photos[activePhotoIdx]?.altText || event.title}
                className="w-full h-full object-cover transition-opacity duration-500"
              />

              {/* Minimal Prev / Next Arrows */}
              {event.photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? event.photos.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((prev) => (prev === event.photos.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-mono font-medium bg-black/60 backdrop-blur-md text-white border border-white/20 select-none">
                    {activePhotoIdx + 1} / {event.photos.length}
                  </div>
                </>
              )}
            </div>

            {/* Authentic Photographic Caption */}
            {event.photos[activePhotoIdx]?.caption && (
              <p className="text-xs sm:text-sm text-stone-500 italic font-serif pt-1">
                {event.photos[activePhotoIdx].caption}
              </p>
            )}

            {/* Minimalist thumbnail row */}
            {event.photos.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-2 scrollbar-none">
                {event.photos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative h-16 w-24 sm:h-20 sm:w-32 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx 
                        ? 'border-[#0b132b] shadow-sm' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. EXPANSIVE FULL-WIDTH 2-COLUMN EDITORIAL CONTENT GRID */}
        <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-8 border-t border-stone-200/90">
          
          {/* Main Chronicle Narrative Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* The Gathering Chronicle */}
            <article className="space-y-6">
              <h2 className="text-xs font-mono uppercase tracking-widest text-stone-400 font-bold">
                Chronicle & Order of Proceedings
              </h2>

              {leadParagraph && (
                <p className="text-lg sm:text-xl font-serif text-stone-800 leading-relaxed font-normal">
                  {leadParagraph}
                </p>
              )}

              {bodyParagraphs.map((para, i) => (
                <p key={i} className="text-stone-700 text-base sm:text-lg leading-relaxed font-sans">
                  {para}
                </p>
              ))}
            </article>

            {/* Official Campus Video Recording (if present) */}
            {safeEmbedUrl && (
              <div className="space-y-3 pt-8 border-t border-stone-200">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-900 font-bold">
                  <Film size={14} className="text-purple-600" />
                  <span>Official Campus Video Recording</span>
                </div>

                <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-black shadow-sm border border-stone-200">
                  {isDirectVideo ? (
                    <video 
                      src={safeEmbedUrl} 
                      controls 
                      playsInline 
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={safeEmbedUrl}
                      title={`${event.title} Video Player`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Public discussion */}
            <section className="space-y-6 pt-8 border-t border-stone-200" aria-labelledby="event-comments-heading">
              <div>
                <h2 id="event-comments-heading" className="font-serif text-2xl font-bold text-[#0b132b]">Discussion</h2>
                <p className="mt-1 text-sm text-stone-500">Share a thoughtful note about this gathering.</p>
              </div>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-stone-500">No comments yet. Be the first to join the discussion.</p>
                ) : comments.map((comment) => (
                  <article key={comment.id} className="rounded-xl border border-stone-200 bg-white p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold text-stone-900">{comment.authorName}{comment.place ? ` · ${comment.place}` : ''}</p>
                      <time className="text-xs text-stone-400" dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleDateString()}</time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{comment.content}</p>
                  </article>
                ))}
              </div>

              <form onSubmit={handleCommentSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {(['authorName', 'place', 'email'] as const).map((field) => (
                    <label key={field} className={field === 'email' ? 'sm:col-span-2' : ''}>
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">{field === 'authorName' ? 'Name' : field === 'place' ? 'Place' : 'Email'}</span>
                      <input
                        required={field !== 'place'}
                        type={field === 'email' ? 'email' : 'text'}
                        value={commentForm[field]}
                        onChange={(e) => setCommentForm((current) => ({ ...current, [field]: e.target.value }))}
                        maxLength={field === 'authorName' ? 120 : field === 'place' ? 120 : 254}
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#0b132b]"
                      />
                    </label>
                  ))}
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">Comment</span>
                  <textarea required minLength={3} maxLength={1000} rows={4} value={commentForm.content} onChange={(e) => setCommentForm((current) => ({ ...current, content: e.target.value }))} className="w-full resize-y rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#0b132b]" />
                </label>
                {commentError && <p className="text-sm text-rose-700" role="alert">{commentError}</p>}
                {commentMessage && <p className="text-sm text-emerald-700" role="status">{commentMessage}</p>}
                <AuthCaptchaNotice className="justify-start" />
                <button type="submit" disabled={isSubmittingComment} className="rounded-lg bg-[#0b132b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16247e] disabled:cursor-not-allowed disabled:opacity-50">
                  {isSubmittingComment ? 'Publishing…' : 'Publish comment'}
                </button>
              </form>
            </section>

            {/* Back link */}
            <div className="pt-8 border-t border-stone-200">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0b132b] hover:text-amber-700 hover:underline transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Return to All Campus Events Archive</span>
              </Link>
            </div>
          </div>

          {/* Refined Institutional Fact Sheet & Documents Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Event Logistics Fact Sheet */}
            <div className="space-y-5">
              <h3 className="font-serif text-lg font-bold text-[#0b132b] pb-2 border-b border-stone-300">
                Event Information
              </h3>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Date & Day</dt>
                  <dd className="font-serif font-bold text-stone-900 mt-0.5">{event.dateStr}</dd>
                </div>

                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Timing</dt>
                  <dd className="font-medium text-stone-900 mt-0.5">{event.time}</dd>
                </div>

                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Pavilion & Venue</dt>
                  <dd className="font-medium text-stone-900 mt-0.5">{event.location}</dd>
                  <dd className="text-xs text-stone-500 mt-0.5">{event.campus}</dd>
                </div>

                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Organised By</dt>
                  <dd className="text-xs font-medium text-stone-700 mt-0.5">
                    Shri Nirakar Education Society Central Office, Mashem, Canacona
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-mono uppercase tracking-wider text-stone-400">Admission</dt>
                  <dd className="text-xs text-stone-600 mt-0.5">
                    Open to all students, parents, alumni, and local community members.
                  </dd>
                </div>
              </dl>
            </div>

            {/* Official Rulebooks & Schedules (Downloads) */}
            {event.documents.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <h3 className="font-serif text-lg font-bold text-[#0b132b] pb-2 border-b border-stone-300 flex items-center gap-2">
                  <FileText size={16} className="text-amber-800" />
                  <span>Official Schedules & Rulebooks</span>
                </h3>

                <div className="space-y-2.5">
                  {event.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="p-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 shadow-xs flex items-center justify-between gap-3 text-xs font-sans group transition-all"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate group-hover:text-amber-800 transition-colors">
                          {doc.title || 'Official Event PDF'}
                        </div>
                        <div className="text-[11px] font-mono text-stone-500 mt-0.5">
                          {doc.size || 'Authenticated PDF Document'}
                        </div>
                      </div>

                      <Download size={15} className="text-stone-400 group-hover:text-[#0b132b] shrink-0 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Society Contact Information */}
            <div className="space-y-2 pt-4 border-t border-stone-200 text-xs text-stone-500 font-sans leading-relaxed">
              <div className="font-mono font-bold uppercase text-stone-600">Event Inquiries</div>
              <div>Administrative Central Desk: +91 832 2643236</div>
              <div>Office of the General Secretary, Mashem, Canacona, Goa</div>
            </div>

          </aside>

        </section>

      </main>

      <Footer />
    </div>
  );
};
