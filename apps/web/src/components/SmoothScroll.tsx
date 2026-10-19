import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLocation } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1. Initialize Lenis once with butter-smooth 60/120fps kinetics
    const lenis = new Lenis({
      duration: 0.95,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    // 2. Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const handleScrollLock = (event: Event) => {
      if ((event as CustomEvent<boolean>).detail) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };
    window.addEventListener('nirakar:scroll-lock', handleScrollLock);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    // lagSmoothing(500, 33) absorbs split-second frame drops instead of hard-freezing
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      window.removeEventListener('nirakar:scroll-lock', handleScrollLock);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // 3. Smoothly navigate to anchors or page top without destroying Lenis
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lenisRef.current) return;

    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        lenisRef.current.scrollTo(el as HTMLElement, { offset: -90 });
      }
    } else if (prevPathnameRef.current !== null && prevPathnameRef.current !== location.pathname) {
      // Only scroll to top on actual route transitions, NOT on page refresh or initial load!
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    prevPathnameRef.current = location.pathname;

    // Refresh ScrollTrigger positions after route changes
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);

    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return <>{children}</>;
};
