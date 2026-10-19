import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionEdge } from '@nirakar/ui';
import { GraduationCap, Landmark, Sparkles, Compass } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Pillar {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  icon: React.ReactNode;
  imageUrl: string;
}

const PILLARS: Pillar[] = [
  {
    id: 'p1',
    number: 'PILLAR I',
    title: 'Academic Discipline & Scientific Inquiry',
    subtitle: 'Nurturing curiosity, rigor, and analytical clarity',
    description:
      'Providing rigorous science labs, modern computer technology centers, and state-of-the-art libraries that ignite deep intellectual ambition in every learner.',
    tag: 'SCHOLARSHIP',
    icon: <GraduationCap size={28} className="text-white" />,
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'p2',
    number: 'PILLAR II',
    title: 'Cultural Heritage & Moral Compass',
    subtitle: 'Preserving Goa’s timeless civilizational roots',
    description:
      'Instilling humility, moral rectitude, and appreciation for Konkani literature, Indian classical arts, and democratic citizenship.',
    tag: 'ETHICS & ROOTS',
    icon: <Landmark size={28} className="text-white" />,
    imageUrl: 'https://images.unsplash.com/photo-1514467958506-6479c7f13237?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'p3',
    number: 'PILLAR III',
    title: 'Rural Empowerment & Inclusive Growth',
    subtitle: 'Equitable opportunities across interior Canacona',
    description:
      'Ensuring that students from interior villages receive the highest standard of secondary and higher secondary training without economic barriers.',
    tag: 'COMMUNITY',
    icon: <Compass size={28} className="text-white" />,
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'p4',
    number: 'PILLAR IV',
    title: 'Leadership & Lifelong Fellowship',
    subtitle: 'Molding leaders of integrity for India and the world',
    description:
      'Connecting student dreams with mentorship from distinguished alumni in medicine, engineering, civil services, and entrepreneurship.',
    tag: 'ALUMNI LEADERSHIP',
    icon: <Sparkles size={28} className="text-white" />,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
  },
];

export const PillarsScrollStack: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !cardsRef.current.length) return;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (!card || index === cardsRef.current.length - 1) return;

        ScrollTrigger.create({
          trigger: card,
          start: 'top top+=90',
          pin: true,
          pinSpacing: false,
          end: 'bottom top+=90',
          scrub: true,
          onUpdate: (self) => {
            const scale = 1 - self.progress * 0.06;
            const opacity = 1 - self.progress * 0.35;
            gsap.set(card, {
              scale,
              opacity,
              transformOrigin: 'center top',
            });
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative bg-cream py-16 md:py-24 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center space-y-3">
        <span className="text-xs uppercase font-serif font-bold tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1 rounded-full border border-brand-200/60">
          Core Identity
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
          Pillars of Shree Nirakar
        </h2>
        <p className="text-sm sm:text-base text-ink-muted font-sans max-w-xl mx-auto">
          The foundational principles that guide every classroom, laboratory, and community initiative.
        </p>
      </div>

      {/* Sticky Stacking Cards Container */}
      <div className="max-w-5xl mx-auto px-4 space-y-12 pb-16">
        {PILLARS.map((p, idx) => (
          <div
            key={p.id}
            ref={(el) => { cardsRef.current[idx] = el; }}
            className="w-full bg-paper rounded-3xl border border-stone-200/80 shadow-xl overflow-hidden flex flex-col md:flex-row relative top-0 will-change-transform"
            style={{ zIndex: idx + 10 }}
          >
            {/* Card Content Left */}
            <div className="p-8 sm:p-12 md:w-3/5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xs font-bold uppercase tracking-widest text-accent-700">
                    {p.number}
                  </span>
                  <span className="text-[11px] font-mono uppercase bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
                    {p.tag}
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-tight">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm font-serif italic text-brand-800 font-semibold">
                  {p.subtitle}
                </p>
                <p className="text-sm text-stone-600 font-sans leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-brand-700 flex items-center justify-center shadow-md">
                  {p.icon}
                </div>
                <span className="text-xs font-serif text-stone-400 font-medium">Shree Nirakar Vidhyalaya</span>
              </div>
            </div>

            {/* Card Image Right */}
            <div className="md:w-2/5 min-h-[260px] md:min-h-full relative overflow-hidden bg-stone-200">
              <img
                src={p.imageUrl}
                alt={p.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
            </div>
          </div>
        ))}
      </div>

      <SectionEdge variant="tide" color="#fbfaf7" height={42} />
    </section>
  );
};
