import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Quote, Award, Sparkles, CheckCircle2, BookOpen, Users, MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const ChairpersonMessage: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.gsap-chair-header', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });

      gsap.from('.gsap-chair-portrait', {
        scale: 0.9,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });

      gsap.from('.gsap-chair-quote', {
        x: 30,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="chairperson-message" className="relative w-full bg-[#FAF7F2] py-20 px-4 sm:px-8 lg:px-12 xl:px-16 overflow-hidden">
      {/* Ambient background ornamentation */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full">
        {/* Header Pill */}
        <div className="gsap-chair-header text-center mb-10">
          <span className="inline-flex items-center gap-2 text-xs uppercase font-serif font-bold tracking-widest text-[#111b5e] bg-white/90 border border-stone-200 px-4 py-1.5 rounded-full shadow-sm">
            <Sparkles size={13} className="text-accent-600" />
            <span>Leadership & Guidance</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-ink mt-3">
            Message from the Chairperson
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto mt-2 font-sans">
            Guiding five decades of educational excellence across Mashem and Gaondongrem in South Goa.
          </p>
        </div>

        {/* Master Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 border border-stone-200/90 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Left Column: Authentic Portrait of Chairperson Shri Prashant Naik */}
          <div className="gsap-chair-portrait lg:col-span-4 flex flex-col items-center text-center">
            <div className="relative group">
              {/* Golden circular aura */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-accent-400/40 via-brand-500/20 to-accent-300/40 rounded-full blur-md group-hover:blur-lg transition-all" />

              {/* Photo Frame */}
              <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-[#f0ede6]">
                <img
                  src="/photos/Prashant_naik.png"
                  alt="Shri Prashant Naik, Chairperson, Shree Nirakar Education Society"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.endsWith('Prashant_naik.jpg')) {
                      target.src = '/photos/Prashant_naik.jpg';
                    }
                  }}
                />
              </div>

              {/* Saffron & Royal Seal Pill */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#111b5e] text-white text-[11px] font-serif font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-lg border border-accent-400/40 whitespace-nowrap flex items-center gap-1.5">
                <Award size={12} className="text-accent-400" />
                <span>Estd. 1968 • Mashem</span>
              </div>
            </div>

            <div className="mt-7 space-y-1">
              <h3 className="font-serif text-2xl font-bold text-[#111b5e]">
                Shri Prashant Naik
              </h3>
              <p className="text-xs font-serif font-bold text-accent-700 tracking-wider uppercase">
                Chairperson
              </p>
              <p className="text-xs text-stone-600 font-sans">
                Shree Nirakar Education Society
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 font-sans pt-1">
                <MapPin size={12} className="text-accent-600" />
                <span>Mashem, Canacona, South Goa</span>
              </div>
            </div>

            {/* Quick Credentials Pills */}
            <div className="mt-5 grid grid-cols-2 gap-2 w-full max-w-xs text-center text-xs">
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-stone-200">
                <div className="font-serif font-black text-[#111b5e] text-base">3</div>
                <div className="text-[10px] text-stone-600 font-medium">Institutions</div>
              </div>
              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-stone-200">
                <div className="font-serif font-black text-accent-700 text-base">54+</div>
                <div className="text-[10px] text-stone-600 font-medium">Years Active</div>
              </div>
            </div>
          </div>

          {/* Right Column: Keynote Message with Glassmorphism & Senior Typography */}
          <div className="gsap-chair-quote lg:col-span-8 space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-100 text-accent-800 shadow-sm border border-accent-200/60">
              <Quote size={24} />
            </div>

            <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-ink leading-snug tracking-tight">
              "Education is not merely about board certificates; it is the sacred awakening of self-reliance, moral integrity, and community devotion."
            </blockquote>

            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
              <p>
                When our founding visionary elders gathered in Mashem in 1968, Canacona was a geographically isolated corner of South Goa where children walked miles across hill paths and rivulets just to reach secondary schooling. Our pioneers resolved that geographical distance must never dictate the destiny of our youth.
              </p>
              <p>
                Today, through <strong className="text-stone-900 font-serif">Shri Nirakar High School</strong> at Mashem, <strong className="text-stone-900 font-serif">Tudal High School</strong> deep within Gaondongrem, and <strong className="text-stone-900 font-serif">S. S. Angle Higher Secondary School</strong>, our classrooms have empowered over 16,500 boys and girls. Our alumni serve with distinction as magistrates, physicians, teachers, software architects, and community leaders across India and abroad.
              </p>
              <p className="font-medium text-stone-900 bg-amber-50/60 p-3.5 rounded-xl border border-accent-200/60">
                We invite all parents, alumni, and patrons of learning to walk with us as we expand digital laboratories, sports infrastructure, and higher secondary programs while preserving our Goan moral foundation.
              </p>
            </div>

            {/* Quick Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-stone-800">
                <CheckCircle2 size={16} className="text-[#111b5e] shrink-0" />
                <span className="font-medium">100% SSC Results Track</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-800">
                <CheckCircle2 size={16} className="text-[#111b5e] shrink-0" />
                <span className="font-medium">Free Rural Transport & Books</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-800">
                <CheckCircle2 size={16} className="text-[#111b5e] shrink-0" />
                <span className="font-medium">State Sports Championships</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-stone-200/80">
              <a
                href="/society"
                className="inline-flex items-center gap-2 bg-[#111b5e] hover:bg-[#0b132b] text-white font-serif font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all group"
              >
                <span>Read Full Society Charter</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/society#governing-body"
                className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-serif font-semibold text-xs px-5 py-3.5 rounded-xl border border-stone-300 transition-colors"
              >
                <Users size={14} className="text-stone-600" />
                <span>Meet the Governing Committee</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
