import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import gsap from 'gsap';
import { LogOut } from 'lucide-react';
import { fetchPublicBatchPhotos, publicBatchPhotosQueryKey } from '../lib/batchPhotos.js';

interface DrawerLink {
  label: string;
  href: string;
  note?: string;
}

interface DrawerEntry {
  label: string;
  href: string;
  note?: string;
  children?: DrawerLink[];
}

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  isAlumni: boolean;
  isFaculty: boolean;
  hasAuthUser: boolean;
  alumniProfileHref: string;
  facultyProfileHref: string;
}

/** Reveal origin — the hamburger sits at the top-right of the viewport. */
const ORIGIN_X = '92%';
const ORIGIN_Y = '6%';

const EASE = [0.32, 0.72, 0, 1] as const;

const ENTRIES: DrawerEntry[] = [
  { label: 'Home', href: '/', note: 'Welcome' },
  {
    label: 'About the Society',
    href: '/society',
    note: 'Since 1939',
    children: [
      { label: 'Grievance Redressal', href: '/grievance-redressal', note: 'Support' },
    ],
  },
  { label: 'Our Campuses', href: '/institutions', note: 'Three schools' },
  {
    label: 'Academics',
    href: '/academics',
    note: 'Curricula & Labs',
    children: [
      { label: 'Campus Photo Gallery', href: '/gallery', note: 'All 3 Schools' },
      { label: 'Academic Results & Toppers', href: '/results', note: 'Std V–XII' },
      { label: 'Batch Photos Archive', href: '/batch-photos', note: 'Photographs' },
      { label: 'Online Admissions', href: '/admissions', note: '2026–27' },
      { label: 'Programs & Science Labs', href: '/academics' },
    ],
  },
  { label: 'Academic Results', href: '/results', note: 'Toppers & Lists' },
  { label: 'Faculty & Mentors', href: '/faculty', note: '92+ educators' },
  { label: 'Digital Library', href: '/library', note: 'Std V–XII' },
  { label: 'Daily Magazine', href: '/magazine', note: 'Patrika' },
  { label: 'Alumni Sanctuary', href: '/alumni', note: 'Directory' },
  { label: 'Notices & Circulars', href: '/notices', note: 'Official' },
  { label: 'Contact & Helplines', href: '/contact', note: 'Reach us' },
  { label: 'My Data Rights', href: '/data-rights', note: 'Privacy' },
];

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  open,
  onClose,
  isAlumni,
  isFaculty,
  hasAuthUser,
  alumniProfileHref,
  facultyProfileHref,
}) => {
  const listRef = useRef<HTMLOListElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  /* How many photographs the archive holds, so the note beside the link
     is the real number rather than one written down long ago. */
  const { data: batchPhotoCount } = useQuery({
    queryKey: [...publicBatchPhotosQueryKey, 'count'],
    queryFn: async () => {
      const result = await fetchPublicBatchPhotos({ limit: 1 });
      return result.total;
    },
    staleTime: 5 * 60 * 1000,
  });

  /* Freeze the page behind the sheet so a flick never scrolls the background page.
     The site scrolls with Lenis, which ignores `overflow: hidden` on the body —
     so we stop Lenis explicitly via the app's own scroll-lock event, while ensuring
     clean restoration when the drawer unmounts. */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const lock = () => window.dispatchEvent(new CustomEvent('nirakar:scroll-lock', { detail: true }));
    const unlock = () => window.dispatchEvent(new CustomEvent('nirakar:scroll-lock', { detail: false }));

    lock();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      unlock();
    };
  }, [open]);

  /* Escape closes. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /**
   * GSAP drives the line-by-line text reveal.
   * A layout effect is essential: the lines must be at their pre-animation
   * state before the first paint, otherwise they flash in and then jump.
   */
  useLayoutEffect(() => {
    if (!open || !listRef.current) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const lowPower = memory <= 4;

    if (reduced) {
      gsap.set(listRef.current.querySelectorAll('[data-line]'), { clearProps: 'all' });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-line]',
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out',
          stagger: lowPower ? 0.035 : 0.055,
          delay: 0.12,
          overwrite: true,
        },
      );
    }, listRef);

    return () => ctx.revert();
  }, [open]);

  const close = () => {
    setExpanded(null);
    onClose();
  };

  const signOut = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      localStorage.removeItem('nirakar_auth_user');
      window.dispatchEvent(new Event('nirakar:auth-changed'));
      window.location.href = '/';
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="lg:hidden fixed inset-0 z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          {/* Scrim — flat tint, no blur, so low-end GPUs stay cool */}
          <div className="absolute inset-0 bg-[#0b132b]/60" onClick={close} aria-hidden="true" />

          {/* The sheet reveals from the hamburger as an expanding SVG-shaped curve */}
          <motion.div
            className="absolute inset-0 flex flex-col bg-[#FBFAF7] will-change-transform"
            style={{ clipPath: `circle(0% at ${ORIGIN_X} ${ORIGIN_Y})` }}
            initial={{ clipPath: `circle(0% at ${ORIGIN_X} ${ORIGIN_Y})` }}
            animate={{ clipPath: `circle(150% at ${ORIGIN_X} ${ORIGIN_Y})` }}
            exit={{ clipPath: `circle(0% at ${ORIGIN_X} ${ORIGIN_Y})` }}
            transition={{ duration: 0.55, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Gold hairline that traces the reveal edge */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <motion.circle
                cx="92"
                cy="6"
                r="10"
                fill="none"
                stroke="#d97706"
                strokeWidth="0.35"
                vectorEffect="non-scaling-stroke"
                initial={{ scale: 0, opacity: 0.9 }}
                animate={{ scale: 16, opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
                style={{ transformOrigin: '92px 6px' }}
              />
            </svg>

            {/* Masthead */}
            <div className="relative shrink-0 px-6 pt-[calc(env(safe-area-inset-top)+22px)] pb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-700">
                    Est. 1939 · Mashem, Canacona
                  </p>
                  <h2 className="mt-1.5 font-serif text-[22px] font-black uppercase leading-[1.15] tracking-[0.02em] text-[#111b5e]">
                    Shri Nirakar
                    <span className="block text-stone-500">Education Society</span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={close}
                  aria-label="Close navigation menu"
                  className="relative -mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#111b5e] transition-colors duration-200 hover:bg-[#111b5e]/[0.07] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111b5e]/30"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                    <path
                      d="M3 3 L15 15 M15 3 L3 15"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Hairline */}
            <div className="relative mx-6 h-px shrink-0 bg-gradient-to-r from-[#111b5e]/25 via-[#111b5e]/10 to-transparent" />

            {/* The index */}
            <nav
              ref={listRef}
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain px-6 pt-1 pb-6 touch-pan-y [-webkit-overflow-scrolling:touch]"
            >
              <ol className="list-none">
                {ENTRIES.map((entry, i) => {
                  const isOpen = expanded === entry.href;
                  return (
                    <li key={entry.href} className="border-b border-[#111b5e]/10 last:border-b-0">
                      <div className="flex items-center gap-4 py-[13px]">
                        <span
                          data-line
                          className="w-6 shrink-0 font-mono text-[10px] tabular-nums text-accent-600/80"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="overflow-hidden">
                            <a
                              data-line
                              href={entry.href}
                              onClick={close}
                              className="inline-block font-serif text-[19px] font-semibold leading-[1.25] text-stone-900 transition-colors duration-200 hover:text-[#111b5e]"
                            >
                              {entry.label}
                            </a>
                          </div>
                        </div>

                        {entry.note && !entry.children && (
                          <span data-line className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-stone-400">
                            {entry.note}
                          </span>
                        )}

                        {entry.children && (
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : entry.href)}
                            aria-expanded={isOpen}
                            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${entry.label}`}
                            className="-mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 transition-colors duration-200 hover:bg-[#111b5e]/[0.07] active:scale-95"
                          >
                            <motion.svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.28, ease: EASE }}
                            >
                              <path
                                d="M2.5 5 L7 9.5 L11.5 5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </motion.svg>
                          </button>
                        )}
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen && entry.children && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <li className="pb-3 pl-10">
                              {entry.children.map((child) => (
                                <a
                                  key={child.href + child.label}
                                  href={child.href}
                                  onClick={close}
                                  className="group flex items-baseline gap-2 py-1.5"
                                >
                                  <span className="font-serif text-[15px] text-stone-600 transition-colors duration-200 group-hover:text-[#111b5e]">
                                    {child.label}
                                  </span>
                                  {child.note && (
                                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-stone-400">
                                      {child.href === '/batch-photos' && batchPhotoCount
                                        ? `${batchPhotoCount} photos`
                                        : child.note}
                                    </span>
                                  )}
                                </a>
                              ))}
                            </li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}

                {(!hasAuthUser || isFaculty) && (
                  <li className="border-b border-[#111b5e]/10">
                    <div className="flex items-center gap-4 py-[13px]">
                      <span data-line className="w-6 shrink-0 font-mono text-[10px] text-accent-600/80">
                        {String(ENTRIES.length + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="overflow-hidden">
                          <a
                            data-line
                            href={isFaculty ? facultyProfileHref : '/faculty/login'}
                            onClick={close}
                            className="inline-block font-serif text-[19px] font-semibold leading-[1.25] text-stone-900 transition-colors duration-200 hover:text-[#111b5e]"
                          >
                            {isFaculty ? 'My Faculty Profile' : 'Faculty Portal'}
                          </a>
                        </div>
                      </div>
                      <span data-line className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-stone-400">
                        {isFaculty ? 'Edit' : 'Login'}
                      </span>
                    </div>
                  </li>
                )}
              </ol>
            </nav>

            {/* Closing actions — typographic, no boxes */}
            <div className="relative shrink-0 border-t border-[#111b5e]/12 bg-[#F4F1EA]/60 px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
              <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
                <a
                  href={isAlumni ? alumniProfileHref : '/alumni/register'}
                  onClick={close}
                  className="group inline-flex items-center gap-1.5 font-serif text-[14px] font-bold text-[#111b5e]"
                >
                  <span className="bg-[#111b5e] bg-clip-text text-transparent transition-all duration-200 group-hover:bg-accent-700 group-hover:bg-clip-text group-hover:text-transparent">
                    {isAlumni ? 'My Alumni Profile' : 'Register as Alumni'}
                  </span>
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                    →
                  </span>
                </a>

                {!hasAuthUser && (
                  <a
                    href="/account/login"
                    onClick={close}
                    className="font-serif text-[14px] text-stone-500 underline decoration-stone-300 underline-offset-4 transition-colors duration-200 hover:text-[#111b5e]"
                  >
                    Alumni Login
                  </a>
                )}

                {isAlumni && (
                  <>
                    <a
                      href="/alumni/dashboard"
                      onClick={close}
                      className="font-serif text-[14px] text-stone-500 underline decoration-stone-300 underline-offset-4 transition-colors duration-200 hover:text-[#111b5e]"
                    >
                      Manage Profile
                    </a>
                    <button
                      type="button"
                      onClick={() => void signOut()}
                      className="inline-flex items-center gap-1.5 font-serif text-[14px] text-stone-500 underline decoration-stone-300 underline-offset-4 transition-colors duration-200 hover:text-[#111b5e]"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default MobileMenuDrawer;
