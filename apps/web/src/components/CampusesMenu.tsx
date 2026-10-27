import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';

export interface Campus {
  code: string;
  name: string;
  location: string;
  year?: string;
  note: string;
  href: string;
  image: string;
  imageAlt: string;
}

export const CAMPUSES: Campus[] = [
  {
    code: 'NHS',
    name: 'Shri Nirakar High School',
    location: 'Mashem, Canacona',
    year: 'Estd. 1968',
    note: 'The founding institution of the Society.',
    href: '/institutions/nirakar-high-school',
    image: '/images/Nirakar_Vidyalaya_Mashem.webp',
    imageAlt: 'Shri Nirakar Vidyalaya, Mashem campus',
  },
  {
    code: 'THS',
    name: 'Tudal High School',
    location: 'Gaondongrem, Canacona',
    year: 'Estd. 1989',
    note: 'Rural education, brought to the doorstep.',
    href: '/institutions/tudal-high-school',
    image: '/images/Tudal_High_School_Gaodongrem.webp',
    imageAlt: 'Tudal High School, Gaondongrem campus',
  },
  {
    code: 'SSA',
    name: 'S. S. Angle Higher Secondary',
    location: 'Dapot, Canacona',
    year: 'Estd. 1996',
    note: 'Arts, Science and Commerce streams.',
    href: '/institutions/angle-higher-secondary',
    image: '/images/S.S.Angle_Higher_Secondary_School_Dapot.webp',
    imageAlt: 'S. S. Angle Higher Secondary School, Dapot campus',
  },
];

interface CampusesMenuProps {
  open: boolean;
  onClose: () => void;
}

const EASE = [0.32, 0.72, 0, 1] as const;

export const CampusesMenu: React.FC<CampusesMenuProps> = ({ open, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* Escape closes the panel. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /**
   * GSAP staggers the three campuses in.
   * Layout effect so the rows are pre-positioned before first paint — otherwise
   * they flash at their final spot and then jump backwards.
   */
  useLayoutEffect(() => {
    if (!open || !listRef.current) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const lowPower = memory <= 4;

    if (reduced) {
      gsap.set(listRef.current.querySelectorAll('[data-campus]'), { clearProps: 'all' });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-campus]',
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.42,
          ease: 'power3.out',
          stagger: lowPower ? 0.05 : 0.075,
          delay: 0.08,
          overwrite: true,
        },
      );

      /* The photos ease in a touch later than their captions, for depth. */
      gsap.fromTo(
        '[data-campus-photo]',
        { scale: 1.06, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: lowPower ? 0.05 : 0.075,
          delay: 0.12,
          overwrite: true,
        },
      );
    }, listRef);

    return () => ctx.revert();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          className="absolute left-0 right-0 top-full z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.26, ease: EASE }}
        >
          {/* A soft gold seam that ties the panel to the utility bar above it */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-accent-500/45 to-transparent" />

          {/* The panel continues the navy of the utility bar — a continuation of the
              header, not a floating white card. */}
          <div className="relative overflow-hidden bg-[#080e21]">
            {/* Faint radial warmth behind the grid, decorative only */}
            <div
              className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 opacity-[0.16] blur-3xl"
              style={{ background: 'radial-gradient(ellipse, #d97706 0%, transparent 70%)' }}
              aria-hidden="true"
            />

            <div className="relative mx-auto w-full max-w-6xl px-4 pb-6 pt-5 sm:px-6 lg:px-12 lg:pb-8 lg:pt-6">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-400/90">
                  Institutions under the Society
                </h3>
                <a
                  href="/gallery"
                  onClick={onClose}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>View All 3 Campus Galleries</span>
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>

              {/* MOBILE & TABLET — vertical rhythm, photo leads each entry */}
              <ul ref={listRef} className="lg:hidden mt-4 space-y-3">
                {CAMPUSES.map((campus, i) => (
                  <li key={campus.code} data-campus>
                    <a
                      href={campus.href}
                      onClick={onClose}
                      className="group flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 transition-colors duration-300 hover:border-accent-500/40 hover:bg-white/[0.06] active:bg-white/[0.08]"
                    >
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-black/30">
                        <img
                          data-campus-photo
                          src={campus.image}
                          alt={campus.imageAlt}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute left-1 top-1 font-mono text-[9px] font-bold tracking-wider text-white/80">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-serif text-[15px] font-bold leading-tight text-white">
                          {campus.name}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-400/80">
                          {campus.location}
                          {campus.year ? ` · ${campus.year}` : ''}
                        </div>
                        <div className="mt-1 line-clamp-1 text-[11px] text-stone-400">
                          {campus.note}
                        </div>
                      </div>

                      <span
                        aria-hidden="true"
                        className="shrink-0 pr-1 text-stone-500 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-accent-400"
                      >
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              {/* DESKTOP — editorial triptych, photo above each caption */}
              <ul className="hidden lg:grid lg:grid-cols-3 lg:gap-6 mt-5">
                {CAMPUSES.map((campus, i) => (
                  <li key={campus.code} data-campus>
                    <a href={campus.href} onClick={onClose} className="group block">
                      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-black/40 ring-1 ring-white/10">
                        <img
                          data-campus-photo
                          src={campus.image}
                          alt={campus.imageAlt}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                        />
                        {/* Legibility scrim, bottom-weighted */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080e21]/85 via-transparent to-transparent" />
                        <span className="absolute left-3 top-3 font-mono text-[10px] font-bold tracking-[0.18em] text-white/70">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="mt-3">
                        <h4 className="font-serif text-[17px] font-bold leading-tight text-white transition-colors duration-200 group-hover:text-accent-300">
                          {campus.name}
                        </h4>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-stone-500">
                          {campus.location}
                          {campus.year ? ` · ${campus.year}` : ''}
                        </p>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-stone-400">
                          {campus.note}
                        </p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom edge — the panel itself ends in an SVG swoosh instead of a
              dead straight line, echoing the curve of the header above it.
              The navy shape bulges down in the centre and the gold hairline
              traces its edge; everything below the curve stays transparent so
              the page shows through. */}
          <div className="relative h-[26px] w-full">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 1440 26"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="campusesCurveAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.35" />
                  <stop offset="30%" stopColor="#d97706" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                  <stop offset="70%" stopColor="#d97706" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.35" />
                </linearGradient>
              </defs>

              {/* The navy body of the swoosh — a soft continuous wave, no
                  cusps or points anywhere along the edge */}
              <path
                d="M 0,0
                   L 1440,0
                   C 1260,0 1200,17 1080,17
                   C 960,17 900,5 720,5
                   C 540,5 480,17 360,17
                   C 240,17 180,0 0,0
                   Z"
                fill="#080e21"
              />

              {/* Gold hairline tracing the same wave */}
              <path
                d="M 0,0
                   C 180,0 240,17 360,17
                   C 480,17 540,5 720,5
                   C 900,5 960,17 1080,17
                   C 1200,17 1260,0 1440,0"
                fill="none"
                stroke="url(#campusesCurveAccent)"
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CampusesMenu;
