import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const HeadmasterMessage: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (imageRef.current) {
        gsap.from(imageRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        });
      }

      if (textRef.current) {
        gsap.from(textRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.9,
          delay: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="headmaster-message"
      className="w-full bg-[#FAF7F2] py-16 sm:py-20 lg:py-24 relative"
    >
      {/* Full-width stretched container across the viewport */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">

          {/* LEFT: Authentic Portrait with Physical Pushpin Holding the Photo */}
          <div ref={imageRef} className="lg:col-span-5 xl:col-span-5">
            <div className="relative w-full group">

              {/* Realistic Physical Metallic Paper Clip Holding the Photo */}
              <div className="absolute -top-4 sm:-top-5 left-8 sm:left-12 z-20 pointer-events-none select-none -rotate-[6deg]">
                <svg
                  width="28"
                  height="62"
                  viewBox="0 0 24 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="filter drop-shadow-[0_4px_5px_rgba(0,0,0,0.38)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                >
                  <defs>
                    {/* Polished metallic steel/silver gradient with subtle warm tone */}
                    <linearGradient id="metalClipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f8fafc" />
                      <stop offset="20%" stopColor="#cbd5e1" />
                      <stop offset="45%" stopColor="#f1f5f9" />
                      <stop offset="55%" stopColor="#ffffff" />
                      <stop offset="75%" stopColor="#94a3b8" />
                      <stop offset="90%" stopColor="#64748b" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>

                    {/* Specular edge highlight */}
                    <linearGradient id="metalClipHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                      <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#475569" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Drop shadow path behind clip on paper */}
                  <path
                    d="M 15 20 L 15 40 A 3 3 0 0 1 9 40 L 9 10 A 6 6 0 0 1 21 10 L 21 44 A 9 9 0 0 1 3 44 L 3 14"
                    stroke="rgba(0,0,0,0.28)"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    transform="translate(1, 2)"
                  />

                  {/* Primary Metallic Wire */}
                  <path
                    d="M 15 20 L 15 40 A 3 3 0 0 1 9 40 L 9 10 A 6 6 0 0 1 21 10 L 21 44 A 9 9 0 0 1 3 44 L 3 14"
                    stroke="url(#metalClipGrad)"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />

                  {/* Specular wire edge sheen */}
                  <path
                    d="M 15 20 L 15 40 A 3 3 0 0 1 9 40 L 9 10 A 6 6 0 0 1 21 10 L 21 44 A 9 9 0 0 1 3 44 L 3 14"
                    stroke="url(#metalClipHighlight)"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Physical Pinned Photo with Crisp Archival White Paper Border */}
              <div className="relative p-2.5 sm:p-3 bg-white rounded-2xl lg:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-stone-200/90 -rotate-[0.35deg] hover:rotate-0">
                <div className="relative aspect-[4/5] sm:aspect-[6/7] lg:aspect-[4/5] w-full rounded-xl lg:rounded-2xl overflow-hidden bg-stone-100">
                  <picture>
                    <source srcSet="/images/Urvee_Phaldessai_Headmaster.webp" type="image/webp" />
                    <img
                      src="/images/Urvee_Phaldessai_Headmaster.jpg"
                      alt="Mrs. Urvee Phaldessai, Headmistress of Shri Nirakar High School, Mashem"
                      className="w-full h-full object-cover object-[center_22%] group-hover:scale-102 transition-transform duration-500"
                      loading="eager"
                    />
                  </picture>
                </div>
              </div>

              {/* Dignified Editorial Caption Below Photo */}
              <div className="mt-3.5 px-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-stone-600">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0b132b]">
                    Mrs. Urvee Phaldessai
                  </h3>
                  <p className="text-xs text-stone-500 font-sans">
                    Headmistress, Shri Nirakar High School
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-sans">
                  <MapPin size={13} className="text-amber-600 shrink-0" />
                  <span>Mashem, Canacona, South Goa</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Humanized, Heartfelt Message from the Headmaster */}
          <div ref={textRef} className="lg:col-span-7 xl:col-span-7 space-y-6">

            {/* Overline Badge */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-amber-600/70" />
              <span className="text-xs uppercase font-mono font-bold tracking-widest text-amber-700">
                From the Headmistress's Desk
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-500 font-sans">Shri Nirakar High School</span>
            </div>

            {/* Main Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#0b132b] tracking-tight leading-[1.18]">
              A school where every village child is known, nurtured, and encouraged to dream.
            </h2>

            {/* Leading Heartfelt Pull Quote */}
            <div className="py-1">
              <p className="font-serif text-lg sm:text-xl text-[#111b5e] font-semibold italic leading-relaxed">
                “True education does not merely train children for examinations—it builds their character, discovers their unique gifts, and gives them the confidence to stand tall anywhere in Goa and the world.”
              </p>
            </div>

            {/* Grounded Human Narrative (No AI boilerplate) */}
            <div className="space-y-4 text-stone-700 font-sans text-base sm:text-[17px] leading-relaxed">
              <p>
                Every morning when I watch our boys and girls walk through the school gates—some arriving from right here in Mashem, others taking the bus from Poinguinim, Loliem, and the border hills—I am reminded of what makes Nirakar special. We are not an impersonal institution where students are just seat numbers. Here, our teachers know every child by name: their strengths, where they need extra help, and what lights up their eyes.
              </p>
              <p>
                We take immense pride in our consistent 100% SSC board results, but what matters just as much to us happens outside the mark sheet. It is about teachers sitting back after school hours with a student who found science or math difficult that day. It is about our children giving their all on the sports ground, singing at annual gatherings, and learning to speak up with quiet confidence.
              </p>
              <p>
                Coming from a rural background in Canacona is never a limitation—it is our students' greatest strength. It gives them humility, resilience, and deep respect for their community. When they graduate from our halls, they go out into the world with sharp minds and steady hearts.
              </p>
              <p className="text-stone-800 font-medium pt-1">
                To all our parents and alumni: thank you for trusting us with your children. Our doors are always open to you.
              </p>
            </div>

            {/* Sign-off & Clean Action Links */}
            <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="font-serif text-base font-bold text-[#0b132b]">
                  Mrs. Urvee Phaldessai
                </div>
                <div className="text-xs text-stone-500 font-sans">
                  Headmistress • Shri Nirakar High School (Mashem Campus)
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="/institutions/nirakar-high-school"
                  className="inline-flex items-center gap-2 bg-[#111b5e] hover:bg-[#0b132b] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-full transition-colors duration-200"
                >
                  <span>Explore High School Campus</span>
                  <ArrowRight size={14} className="text-amber-400" />
                </a>

                <a
                  href="/contact"
                  className="text-xs sm:text-sm font-semibold text-stone-700 hover:text-[#111b5e] transition-colors"
                >
                  Contact School Office →
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
