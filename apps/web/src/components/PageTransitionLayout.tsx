import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Transition, TransitionHandle } from './Transition.js';
import { preloadRouteChunk } from '../utils/routePreloader.js';

interface PageTransitionLayoutProps {
  children: React.ReactNode;
}

/**
 * Universal SVG Page Transition Coordinator (Inspired by agentPritam47/svg-page-transition)
 * - Orchestrates the leave/enter lifecycle matching agentPritam47's TransitionRouter.
 * - On link click: executes playLeave (path draws across screen & expands strokeWidth to 380).
 * - Midpoint: Preloads destination chunk, hides old page content, switches route & resets scroll to (0,0) unseen.
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
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      let hasNavigated = false;

      // Start preloading the destination route chunk immediately while leave animation plays
      const preloadPromise = preloadRouteChunk(targetHref);

      const navigateToTarget = async () => {
        if (hasNavigated) return;
        hasNavigated = true;

        // Ensure the destination route chunk is finished downloading so React doesn't suspend with the old page
        if (preloadPromise) {
          try {
            await Promise.race([
              preloadPromise,
              new Promise((resolve) => setTimeout(resolve, 400)),
            ]);
          } catch {
            // Ignore preloader error and continue navigation
          }
        }

        // Conceal the old page content completely under the SVG curve
        if (contentRef.current) {
          contentRef.current.style.opacity = '0';
        }

        navigate(targetHref);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      };

      // Failsafe timer: in case route mount event is delayed, unwind curtain automatically
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = setTimeout(() => {
        if (isNavigatingRef.current) {
          if (contentRef.current) contentRef.current.style.opacity = '1';
          transitionRef.current?.playEnter(() => {
            isNavigatingRef.current = false;
            ScrollTrigger.refresh();
          });
        }
      }, 1600);

      // Play the Leave Animation (exact agentPritam47 stroke drawing & width expansion)
      if (transitionRef.current) {
        transitionRef.current.playLeave(navigateToTarget);
      } else {
        navigateToTarget();
        isNavigatingRef.current = false;
      }
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
          if (targetSearch === location.search && targetHash === location.hash) {
            e.preventDefault();
            return;
          }
          return;
        }

        e.preventDefault();
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

    // Mouseover preloading: loads JS chunks ahead of time so transition is instantaneous
    const handleDocumentMouseOver = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        preloadRouteChunk(href);
      }
    };

    // Trigger playEnter ONLY when the new route has actually committed to the DOM
    const handlePageRouteMounted = () => {
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }

      if (isNavigatingRef.current) {
        if (contentRef.current) {
          contentRef.current.style.opacity = '1';
        }
        if (transitionRef.current) {
          transitionRef.current.playEnter(() => {
            isNavigatingRef.current = false;
            ScrollTrigger.refresh();
          });
        } else {
          isNavigatingRef.current = false;
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    document.addEventListener('mouseover', handleDocumentMouseOver, { passive: true });
    window.addEventListener('customNavigate', handleCustomNavigate as EventListener);
    window.addEventListener('pageRouteMounted', handlePageRouteMounted);

    return () => {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      document.removeEventListener('mouseover', handleDocumentMouseOver);
      window.removeEventListener('customNavigate', handleCustomNavigate as EventListener);
      window.removeEventListener('pageRouteMounted', handlePageRouteMounted);
    };
  }, [navigate, location.pathname, location.search, location.hash]);

  // 2. Initial Mount and Browser History (Back/Forward) Management
  useLayoutEffect(() => {
    const content = contentRef.current;

    // Prefers-reduced-motion check
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

    // Initial page load: smooth clean entrance without transition curtain
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

    // If navigating via browser Back/Forward (where isNavigatingRef is false)
    if (!isNavigatingRef.current && content) {
      content.style.opacity = '1';
      ScrollTrigger.refresh();
    }
  }, [location.pathname]);

  return (
    <div className="relative w-full min-h-screen bg-[#FAF7F2]">
      {/* SVG page transition layer */}
      <Transition ref={transitionRef} />

      {/* Main Page Content Layer */}
      <div ref={contentRef} className="page-transition-content">
        {children}
      </div>
    </div>
  );
};

export default PageTransitionLayout;
