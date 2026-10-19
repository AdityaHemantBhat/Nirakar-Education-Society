import React, { useRef, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import './Transition.css';

export interface TransitionHandle {
  playLeave: (onComplete: () => void) => void;
  playEnter: (onComplete: () => void) => void;
}

export interface TransitionProps {
  timeline?: gsap.core.Timeline;
  duration?: number;
  /** Primary single light color for the curve (default: #82A0FF from agentPritam47) */
  color?: string;
  onComplete?: () => void;
}

export const AGENT_PRITAM_PATH =
  'M13.4746 291.27C13.4746 291.27 100.646 -18.6724 255.617 16.8418C410.588 52.356 61.0296 431.197 233.017 546.326C431.659 679.299 444.494 21.0125 652.73 100.784C860.967 180.556 468.663 430.709 617.216 546.326C765.769 661.944 819.097 48.2722 988.501 120.156C1174.21 198.957 809.424 543.841 988.501 636.726C1189.37 740.915 1301.67 149.213 1301.67 149.213';

/**
 * Pure Single-Color Light SVG Page Transition from agentPritam47/svg-page-transition.
 * Features official Shree Nirakar Education Society emblem & prominent typography in the center.
 * Light pastel blue (#82A0FF), zero yellow, clean, airy, 60fps GPU Composited.
 */
export const Transition = forwardRef<TransitionHandle, TransitionProps>(
  ({ duration = 0.85, color = '#0b132b', onComplete }, ref) => {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const mainPathRef = useRef<SVGPathElement | null>(null);
    const badgeRef = useRef<HTMLDivElement | null>(null);

    // Initial setup: measure exact path length and initialize stroke dash offsets
    useLayoutEffect(() => {
      const mainPath = mainPathRef.current;
      if (!mainPath) return;

      const len = mainPath.getTotalLength();
      gsap.set(mainPath, {
        strokeDasharray: len,
        strokeDashoffset: len,
        strokeWidth: 2,
      });
    }, []);

    // Expose playLeave and playEnter animations matching agentPritam47's TransitionRouter hooks
    useImperativeHandle(ref, () => ({
      playLeave: (done) => {
        const overlay = overlayRef.current;
        const mainPath = mainPathRef.current;
        const badge = badgeRef.current;
        if (!overlay || !mainPath) {
          done();
          return;
        }

        // Kill any pending tweens to prevent race conditions
        gsap.killTweensOf([overlay, mainPath, badge]);

        // Enable pointer-events during transition to prevent clicks bleed-through
        overlay.style.pointerEvents = 'auto';

        const tl = gsap.timeline({
          onComplete: done,
        });

        // 1. Overlay fades in smoothly
        tl.to(
          overlay,
          {
            opacity: 1,
            duration: 0.35,
            ease: 'power2.inOut',
          },
          0
        );

        // 2. Light Blue Path draws across screen and balloons strokeWidth to 380 (covers entire screen)
        tl.to(
          mainPath,
          {
            strokeDashoffset: 0,
            strokeWidth: 380,
            duration: duration,
            ease: 'power2.inOut',
          },
          0
        );

        // 3. Official Logo and Society Name bloom in the center
        if (badge) {
          tl.fromTo(
            badge,
            { opacity: 0, scale: 0.88, y: 12 },
            { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power2.out' },
            0.4
          );
        }
      },

      playEnter: (done) => {
        const overlay = overlayRef.current;
        const mainPath = mainPathRef.current;
        const badge = badgeRef.current;
        if (!overlay || !mainPath) {
          done();
          return;
        }

        // Kill any pending tweens
        gsap.killTweensOf([overlay, mainPath, badge]);

        const len = mainPath.getTotalLength();
        const tl = gsap.timeline({
          onComplete: () => {
            // Reset to initial state once completed
            gsap.set(mainPath, {
              strokeDashoffset: len,
              strokeWidth: 2,
            });
            // Ensure inputs and links on the newly mounted page are immediately interactive
            overlay.style.pointerEvents = 'none';
            done();
            onComplete?.();
          },
        });

        // 1. Logo and Name gently dissolve as the curve unwinds
        if (badge) {
          tl.to(
            badge,
            { opacity: 0, scale: 0.95, y: -8, duration: 0.3, ease: 'power2.in' },
            0
          );
        }

        // 2. Path unwinds toward the exit (strokeDashoffset -> -len, strokeWidth -> 2)
        tl.to(
          mainPath,
          {
            strokeDashoffset: -len,
            strokeWidth: 2,
            duration: duration,
            ease: 'power2.inOut',
          },
          0
        );

        // 3. Overlay fades back to 0 opacity
        tl.to(
          overlay,
          {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut',
          },
          0.45
        );
      },
    }));

    return (
      <div
        ref={overlayRef}
        className="svg-transition-overlay"
        aria-hidden="true"
      >
        {/* Exact agentPritam47 SVG configuration */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1316 664"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="svg-transition-canvas"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Single Light Color Path (No yellow, not dark, clean & airy) */}
          <path
            ref={mainPathRef}
            d={AGENT_PRITAM_PATH}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Centered Institutional Logo & Name (Slightly Big, Zero Yellow, High Contrast) */}
        <div ref={badgeRef} className="svg-transition-badge opacity-0">
          {/* Official Emblem Image - Sized prominently in clean white card */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-2.5 shadow-2xl border-2 border-white/80 mb-3 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <img
              src="/images/Logo.jpg"
              alt="Shree Nirakar Education Society Official Emblem"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>

          {/* Prominent Society Title */}
          <div className="text-white font-serif font-black text-xl sm:text-2xl md:text-3xl tracking-wide uppercase mb-1 drop-shadow-lg text-center px-4 leading-tight">
            Shree Nirakar Education Society
          </div>

          {/* Sanskrit Motto */}
          <div className="text-white/95 font-serif text-sm sm:text-base font-semibold tracking-widest drop-shadow-md text-center">
            ।। तमसो मा ज्योतिर्गमय ।।
          </div>

          {/* Location & Legacy Tagline */}
          <div className="mt-1.5 text-white/85 text-xs sm:text-sm font-sans uppercase tracking-widest font-semibold text-center drop-shadow-sm">
            Mashem, Canacona, South Goa • Estd. 1939
          </div>
        </div>
      </div>
    );
  }
);

Transition.displayName = 'Transition';

export default Transition;
