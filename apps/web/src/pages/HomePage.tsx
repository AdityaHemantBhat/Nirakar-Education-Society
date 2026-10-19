import React, { useLayoutEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from '../components/Navbar.js';
import { Hero } from '../components/Hero.js';
import { Stats } from '../components/Stats.js';
import { HeadmasterMessage } from '../components/HeadmasterMessage.js';
import { Campuses } from '../components/Campuses.js';
import { WhyNirakar } from '../components/WhyNirakar.js';
import { NewsAndEvents } from '../components/NewsAndEvents.js';
import { AlumniShowcase } from '../components/AlumniShowcase.js';
import { DailyMagazineSection } from '../components/DailyMagazineSection.js';
import { NirakarSpotlight } from '../components/NirakarSpotlight.js';
import { Footer } from '../components/Footer.js';
import { ArrowRight, Image as ImageIcon, Sparkles } from 'lucide-react';
import { SectionEdge } from '../components/SectionEdge.js';

const initialDocumentPath = typeof window === 'undefined' ? '' : window.location.pathname;
let hasPlayedHomePreloader = false;

gsap.registerPlugin(ScrollTrigger);

export const HomePage: React.FC = () => {
  const homepageRef = useRef<HTMLDivElement>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const [showPreloader, setShowPreloader] = useState(
    () => initialDocumentPath === '/' && !hasPlayedHomePreloader,
  );

  const { data } = useQuery({
    queryKey: ['home_data'],
    queryFn: async () => {
      const res = await fetch('/api/v1/home');
      if (!res.ok) throw new Error('Failed to load homepage data');
      const json = await res.json();
      return json.data;
    },
    staleTime: 60 * 1000,
  });

  useLayoutEffect(() => {
    const root = homepageRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const deviceMemory = 'deviceMemory' in navigator ? Number(navigator.deviceMemory) : null;
    const isLowMemory = deviceMemory !== null && deviceMemory <= (isMobile ? 2 : 4);
    const distance = isLowMemory ? 8 : 14;
    const duration = isLowMemory ? 0.38 : 0.55;

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-home-reveal]', root).forEach((section) => {
        gsap.fromTo(
          section,
          { autoAlpha: isLowMemory ? 0.88 : 0.82, y: distance },
          {
            autoAlpha: 1,
            y: 0,
            duration,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: 'top 90%',
              once: true,
              fastScrollEnd: true,
            },
          },
        );
      });
    }, root);

    return () => context.revert();
  }, []);

  useLayoutEffect(() => {
    if (!showPreloader || !preloaderRef.current) return;

    hasPlayedHomePreloader = true;
    const root = preloaderRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const curtain = root.querySelector<SVGPathElement>('[data-preloader-curtain]');
    const curveLine = root.querySelector<SVGPathElement>('[data-preloader-curve-line]');
    const logo = root.querySelector<HTMLElement>('[data-preloader-logo]');
    const logoImage = root.querySelector<HTMLImageElement>('[data-preloader-logo-image]');
    const locationText = root.querySelector<HTMLElement>('[data-preloader-location]');
    const titleLetters = root.querySelectorAll<HTMLElement>('[data-preloader-title-letter]');
    const tagline = root.querySelector<HTMLElement>('[data-preloader-tagline]');
    const curvedShape = 'M0 502S175 272 500 272s500 230 500 230V0H0Z';
    const closedShape = 'M0,1005S175,995,500,995s500,5,500,5V0H0Z';
    const closedCurve = 'M0 1000S175 1000 500 1000s500 0 500 0';

    let cancelled = false;
    let timeline: gsap.core.Timeline | undefined;
    if (curtain) gsap.set(curtain, { attr: { d: closedShape } });
    if (curveLine) gsap.set(curveLine, { attr: { d: closedCurve } });
    if (logo) gsap.set(logo, { autoAlpha: 0, y: 8 });
    if (locationText) gsap.set(locationText, { autoAlpha: 0, y: 5 });
    if (titleLetters.length) gsap.set(titleLetters, { autoAlpha: 0, y: 5 });
    if (tagline) gsap.set(tagline, { autoAlpha: 0, y: 5 });

    const runAnimation = async () => {
      if (logoImage) {
        try {
          await logoImage.decode();
        } catch {
          // Continue into the loader if the browser cannot decode this image.
        }
      }
      if (cancelled) return;

      timeline = gsap.timeline({
        onComplete: () => setShowPreloader(false),
      });

      if (reduceMotion) {
        timeline.to(root, { autoAlpha: 0, duration: 0.25 });
        return;
      }

      if (logo) {
        timeline.to(logo, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' });
      }
      if (locationText) {
        timeline.to(locationText, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.15');
      }
      if (titleLetters.length) {
        timeline.to(
          titleLetters,
          { autoAlpha: 1, y: 0, duration: 0.22, stagger: 0.035, ease: 'power1.out' },
          '-=0.05',
        );
      }
      if (tagline) {
        timeline.to(tagline, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.05');
      }

      timeline.addLabel('curtainOpen', '+=1.1');
      if (curtain) {
        timeline.to(curtain, { duration: 2.2, attr: { d: curvedShape }, ease: 'power2.inOut' }, 'curtainOpen');
      }
      if (curveLine) {
        timeline.to(
          curveLine,
          { duration: 2.2, attr: { d: curvedShape.slice(0, curvedShape.indexOf('V')) }, ease: 'power2.inOut' },
          'curtainOpen',
        );
      }
      timeline.to(root, { y: '-120%', duration: 2.2, ease: 'power3.inOut' }, 'curtainOpen');
    };

    void runAnimation();

    return () => {
      cancelled = true;
      timeline?.kill();
    };
  }, [showPreloader]);

  return (
    <div ref={homepageRef} className="w-full min-h-screen bg-[#FAF7F2] text-ink flex flex-col font-sans">
      {showPreloader && (
        <div
          ref={preloaderRef}
          className="fixed inset-0 z-[10000] flex min-h-[100svh] items-center justify-center overflow-hidden bg-transparent px-6 text-[#0b132b]"
          role="status"
          aria-label="Loading Shree Nirakar Education Society homepage"
        >
          <svg className="absolute inset-0 z-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
            <path
              data-preloader-curtain
              d="M0,1005S175,995,500,995s500,5,500,5V0H0Z"
              fill="#f8f5ee"
            />
            <path
              data-preloader-curve-line
              d="M0 1000S175 1000 500 1000s500 0 500 0"
              fill="none"
              stroke="#d97706"
              strokeWidth="2"
            />
          </svg>
          <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center text-[#0b132b]">
            <div data-preloader-logo className="mb-7 flex h-48 w-48 items-center justify-center sm:h-60 sm:w-60">
              <img
                data-preloader-logo-image
                src="/images/Logo.webp"
                alt="Shree Nirakar Vidyalaya emblem"
                className="h-full w-full object-contain"
              />
            </div>
            <p data-preloader-location className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-800">
              Mashem · Canacona · Goa
            </p>
            <div className="mt-3 w-full py-1">
              <h1
                aria-label="Shree Nirakar Education Society"
                className="font-serif text-2xl font-semibold tracking-[0.04em] text-[#0b132b] sm:text-4xl"
              >
                {'Shree Nirakar Education Society'.split('').map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    data-preloader-title-letter
                    aria-hidden="true"
                    className="inline-block whitespace-pre"
                  >
                    {letter}
                  </span>
                ))}
              </h1>
            </div>
            <p data-preloader-tagline className="mt-2 text-xs font-medium tracking-[0.15em] text-stone-600">
              A tradition of learning since 1939
            </p>
          </div>
        </div>
      )}

      <Helmet>
        <title>Shree Nirakar Education Society | Mashem, Canacona, Goa • Estd. 1939</title>
        <meta
          name="description"
          content="Official portal of Shree Nirakar Education Society, encompassing Shri Nirakar High School, Tudal High School, and S.S. Angle Higher Secondary School."
        />
      </Helmet>

      {/* 1. Full-Width University Navigation with Centered Logo, Full Society Name & Split Menus */}
      <Navbar />

      <main id="main-content" className="w-full flex-1 bg-[#FAF7F2]">
        {/* 2. Full-Width Hero Slider with Campus Marquee */}
        <div data-home-reveal className="w-full">
          <Hero />
        </div>

        {/* 3. Full-Width Key Statistics Ribbon with Bottom SVG Curve */}
        <div data-home-reveal className="w-full">
          <Stats stats={data?.stats} />
        </div>

        {/* 4. Academic Leadership: Headmaster Mrs. Urvee Phaldessai's Message */}
        <div data-home-reveal className="w-full">
          <HeadmasterMessage />
        </div>

        {/* 5. 2026 Senior Architecture: Three Premier Campuses in Canacona */}
        <div data-home-reveal className="w-full">
          <Campuses />
        </div>

        {/* 6. The 7 Pillars & Founder's Covenant: Why Shree Nirakar Education Society */}
        <div data-home-reveal className="w-full">
          <WhyNirakar />
        </div>

        {/* 7. Dual Hub: Campus Events & Official Circulars Notice Wall */}
        <div data-home-reveal className="w-full">
          <NewsAndEvents
            upcoming={data?.events?.upcoming}
            past={data?.events?.past}
            notices={data?.notices}
          />
        </div>

        {/* 8. 2026 Senior Design: Distinguished Alumni Hall of Fame */}
        <div data-home-reveal className="w-full">
          <AlumniShowcase
            alumni={data?.alumniAchievers}
            registeredCount={data?.registeredAlumniCount}
          />
        </div>

        {/* 9. Shri Nirakar High School Daily Magazine */}
        <div data-home-reveal className="w-full">
          <DailyMagazineSection issue={data?.latestMagazine || data?.latestPatrika} />
        </div>

        {/* 10. Visual Archives Gallery on Warm Cream (#FAF7F2) */}
        {data?.gallery && data.gallery.length > 0 && (
          <section data-home-reveal className="w-full bg-[#FAF7F2] py-20 px-4 sm:px-8 lg:px-12 xl:px-16">
            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs uppercase font-serif font-bold tracking-widest text-[#111b5e] bg-white border border-stone-200/50 px-3.5 py-1.5 rounded-full shadow-xs mb-2">
                    <Sparkles size={12} className="text-accent-600" />
                    <span>Visual Archives</span>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                    Campus Moments & Activities
                  </h2>
                </div>
                <a
                  href="/gallery"
                  className="text-xs font-serif font-bold text-[#111b5e] hover:text-[#0b132b] flex items-center gap-1.5 shrink-0"
                >
                  <span>View All Albums</span>
                  <ArrowRight size={14} />
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {data.gallery.slice(0, 8).map((g: any) => (
                  <div
                    key={g.id}
                    className="group relative h-56 rounded-3xl overflow-hidden shadow-sm bg-stone-200"
                  >
                    <img
                      src={g.coverImage || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80'}
                      alt={g.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-5 flex flex-col justify-end">
                      <span className="text-xs font-serif font-bold text-white drop-shadow-sm leading-snug">
                        {g.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 11. End of All Sections: Sheryians-Inspired Giant NIRAKAR Spotlight Reveal */}
        <div data-home-reveal className="w-full">
          <NirakarSpotlight />
        </div>
      </main>

      {/* 12. Full-Width 5-Column University Mega Footer */}
      <div data-home-reveal className="w-full">
        <Footer />
      </div>
    </div>
  );
};
