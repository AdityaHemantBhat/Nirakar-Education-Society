import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Award, BookOpen, ShieldCheck } from 'lucide-react';
import { SectionEdge } from '@nirakar/ui';

interface Slide {
  id: number;
  imageUrl: string;
  badge: string;
  headline: string;
  subheadline: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=85',
    badge: 'ESTABLISHED 1968 • MASHEM, CANACONA',
    headline: 'Nurturing Intellect, Inspiring Character',
    subheadline:
      'Providing holistic, value-based education across secondary and higher secondary levels in South Goa for over five decades.',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=85',
    badge: 'ACADEMIC EXCELLENCE & MERIT',
    headline: 'A Legacy of Distinction in Rural Goa',
    subheadline:
      'From state board merit rankers to national sports champions, our three premier institutions mold confident global contributors.',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1920&q=85',
    badge: 'CONNECTING 16,000+ ALUMNI',
    headline: 'Rooted in Heritage, Bound by Purpose',
    subheadline:
      'A trusted lifelong sanctuary connecting alumni leaders across academia, civil service, arts, and enterprise.',
  },
];

export const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[current];

  return (
    <div className="relative w-full min-h-[640px] md:min-h-[720px] bg-ink text-paper overflow-hidden flex flex-col justify-between">
      {/* Background Cinematic Slide with AnimatePresence */}
      <div className="absolute inset-0 -z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          >
            {/* Rich Academic Vignette Gradient: no bright purple blobs, refined deep ink contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-16 w-full flex-1 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6">
          {/* Recognition Badge */}
          <motion.div
            key={`badge-${slide.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-900/80 border border-brand-500/40 text-accent-300 text-xs font-serif font-bold tracking-widest backdrop-blur-sm"
          >
            <Award size={14} className="text-accent-400" />
            <span>{slide.badge}</span>
          </motion.div>

          {/* Editorial Headline */}
          <motion.h1
            key={`head-${slide.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]"
          >
            {slide.headline}
          </motion.h1>

          {/* Subheadline Paragraph */}
          <motion.p
            key={`sub-${slide.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-stone-200 leading-relaxed font-sans max-w-2xl"
          >
            {slide.subheadline}
          </motion.p>

          {/* Two Distinct CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="/institutions"
              className="px-6 py-3.5 rounded-xl font-serif text-sm font-bold bg-brand-700 text-white hover:bg-brand-600 transition-all shadow-lg shadow-brand-950/40 flex items-center gap-2 group"
            >
              <span>Explore Institutions</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="/magazine"
              className="px-6 py-3.5 rounded-xl font-serif text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <BookOpen size={16} className="text-amber-400" />
              <span>Read Daily Magazine</span>
            </a>
          </div>

          {/* Institutional Trust Badges */}
          <div className="pt-8 border-t border-stone-800/80 flex flex-wrap items-center gap-6 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-accent-400" />
              <span>Goa Board Recognized</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-accent-400" />
              <span>Three Campuses in Canacona</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Verified Alumni Network</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex items-center gap-2 z-20">
        {HERO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              current === idx ? 'w-8 bg-accent-400' : 'w-2 bg-stone-600 hover:bg-stone-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Bottom SVG wave continuing into stats neutral background */}
      <SectionEdge variant="wave" color="#f4f1ea" height={44} />
    </div>
  );
};
