import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Transition, TransitionHandle } from './Transition.js';

interface PageTransitionLayoutProps {
  children: React.ReactNode;
}

/**
 * Universal SVG Page Transition Coordinator (Inspired by agentPritam47/svg-page-transition)
 * - Orchestrates the leave/enter lifecycle matching agentPritam47's TransitionRouter.
 * - On link click: executes playLeave (path draws across screen & expands strokeWidth to 380).
 * - Midpoint: React Router switches route & Lenis resets scroll to (0,0) unseen.
 * - On route mount: executes playEnter (path unwinds & shrinks to strokeWidth 2, overlay fades out).
 * - Styled with Shree Nirakar Royal Heritage Navy & Radiant Golden Saffron.
 * - Optimized with pure GSAP for 2GB RAM phones and 4GB PCs.
 */
export const PageTransitionLayout: React.FC<PageTransitionLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const contentRef = useRef<HTMLDivElement | null>(null);
  const transitionRef = useRef<TransitionHandle | null>(null);
  const isNavigatingRef = useRef<boolean>(false);
  const hasLoadedInitialRef = useRef<boolean>(false);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Client-Side SPA Link & Programmatic Transition Interceptor:
  // Converts regular <a href="/..."> clicks and customNavigate events into agentPritam47's playLeave -> route change -> playEnter flow
  useEffect(() => {
    const triggerTransition = (targetHref: string) => {
      // Parse target pathname to prevent full page transition on the same page
      let targetPathname = targetHref;
      try {
        targetPathname = new URL(targetHref, window.location.origin).pathname;
      } catch {}

      // If target is the exact same pathname (e.g. /society to /society?tab=...), navigate directly without transition
      if (targetPathname === location.pathname) {
        navigate(targetHref);
        return;
      }

      // Accessibility: Reduced motion check
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReduced) {
        navigate(targetHref);
        return;
      }

      // Prevent race condition during active transition
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      if (!transitionRef.current) {
        navigate(targetHref);
        isNavigatingRef.current = false;
        return;
      }

      // Safety failsafe: If playEnter is not triggered within 1600ms, auto-recover
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = setTimeout(() => {
        if (isNavigatingRef.current && transitionRef.current) {
          transitionRef.current.playEnter(() => {
            isNavigatingRef.current = false;
          });
        }
      }, 1600);

      // Play the Leave Animation (exact agentPritam47 stroke drawing & width expansion)
      transitionRef.current.playLeave(() => {
        // Midpoint: Screen is 100% flooded with Royal Navy & Golden curves
        navigate(targetHref);
        window.scrollTo(0, 0);
      });
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');
      const download = anchor.getAttribute('download');

      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !target &&
        download === null &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey &&
        e.button === 0
      ) {
        // Skip SVG transition if link or parent explicitly requests no transition (e.g. auth slider)
        if (anchor.hasAttribute('data-no-transition') || anchor.closest('[data-no-transition]')) {
          return;
        }
        let targetPathname = href;
        let targetSearch = '';
        let targetHash = '';
        try {
          const parsed = new URL(href, window.location.origin);
          targetPathname = parsed.pathname;
          targetSearch = parsed.search;
          targetHash = parsed.hash;
        } catch {}

        // If clicking on the exact SAME PATHNAME (e.g. /society to /society?tab=vision#pillars or /faculty to /faculty?campus=...)
        // NEVER trigger full page transition! Let in-page React state, router, and smooth scroll handle it!
        if (targetPathname === location.pathname) {
          // If completely identical URL, prevent useless page reload
          if (targetSearch === location.search && targetHash === location.hash) {
            e.preventDefault();
            return;
          }
          // Do NOT call e.preventDefault() or e.stopPropagation()!
          // Allow the element's onClick handler and in-page navigation to proceed naturally!
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        triggerTransition(href);
      }
    };

    // Custom programmatic navigation event listener (e.g. after form login or register)
    const handleCustomNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ to: string }>;
      const to = customEvent.detail?.to;
      if (!to || to === location.pathname) return;
      triggerTransition(to);
    };

    // Capture: true ensures we capture inter-page navigation
    document.addEventListener('click', handleDocumentClick, { capture: true });
    window.addEventListener('customNavigate', handleCustomNavigate as EventListener);

    return () => {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      window.removeEventListener('customNavigate', handleCustomNavigate as EventListener);
    };
  }, [navigate, location.pathname, location.search, location.hash]);

  // 2. Play Enter Animation when a new route mounts (or Back/Forward button)
  useLayoutEffect(() => {
    const content = contentRef.current;

    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }

    // Check prefers-reduced-motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      if (content) {
        content.style.opacity = '1';
        content.style.transform = 'none';
      }
      isNavigatingRef.current = false;
      return;
    }

    // If initial page mount, reveal content cleanly with ZERO vertical jumping
    if (!hasLoadedInitialRef.current) {
      hasLoadedInitialRef.current = true;
      if (content) {
        gsap.fromTo(
          content,
          { opacity: 0.85 },
          { opacity: 1, duration: 0.25, ease: 'power2.out', clearProps: 'all' }
        );
      }
      return;
    }

    // Play the Enter Animation (exact agentPritam47 path unwinding & overlay fade out)
    if (transitionRef.current) {
      transitionRef.current.playEnter(() => {
        isNavigatingRef.current = false;
        ScrollTrigger.refresh();
      });
    } else {
      isNavigatingRef.current = false;
    }

    // Synchronized smooth opacity reveal of new page content without vertical jitter
    if (content) {
      gsap.fromTo(
        content,
        { opacity: 0.4 },
        {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          clearProps: 'opacity',
        }
      );
    }
  }, [location.pathname]);

  return (
    <div className="relative w-full min-h-screen bg-[#FAF7F2]">
      {/* agentPritam47 SVG Curve Page Transition Layer */}
      <Transition ref={transitionRef} />

      {/* Main Page Content Layer */}
      <div ref={contentRef} className="page-transition-content">
        {children}
      </div>
    </div>
  );
};

export default PageTransitionLayout;
