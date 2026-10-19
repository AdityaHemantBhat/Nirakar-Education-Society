import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { SectionEdge } from '@nirakar/ui';

interface AccordionItem {
  number: string;
  title: string;
  summary: string;
  details: string[];
}

const WHY_POINTS: AccordionItem[] = [
  {
    number: '01',
    title: '54+ Years of Proven Educational Heritage',
    summary:
      'Established in 1968, Shree Nirakar Education Society has built an unshakeable institutional reputation in Canacona, South Goa.',
    details: [
      'Pioneered secondary education in the rural taluka of Canacona.',
      'Generations of alumni serving as teachers, administrators, and entrepreneurs.',
      'Steadfast commitment to character formation alongside academic rigor.',
    ],
  },
  {
    number: '02',
    title: 'Three Distinct Institutions Under One Vision',
    summary:
      'From rural middle-high school in Gaodongrem to higher secondary science, commerce, and arts streams in Mashem.',
    details: [
      'Shri Nirakar High School (Mashem) - Secondary education with full laboratory facilities.',
      'Tudal High School (Gaodongrem) - Empowering rural and tribal talent with holistic care.',
      'S. S. Angle Higher Secondary School (Maxem) - Premier Arts, Science & Commerce preparation.',
    ],
  },
  {
    number: '03',
    title: 'Dedicated, Long-Tenured Faculty & Mentors',
    summary:
      'Our educators are experienced scholars with decades of classroom service, personal student mentorship, and pastoral guidance.',
    details: [
      'Over 90 full-time certified teachers and administrative specialists.',
      'Individual doubt-clearing sessions and personalized academic counselling.',
      'Regular continuous professional development and Goa Board workshop participation.',
    ],
  },
  {
    number: '04',
    title: 'State Board Merit Rankers & Consistent Results',
    summary:
      'Year after year, our students achieve outstanding distinctions in the Goa Board SSC and HSSC examinations.',
    details: [
      'Consistent 95%+ passing percentage across all three institutions.',
      'Multiple state merit rank holders in Science and Commerce streams.',
      'Rigorous pre-board examination series and remedial coaching for every student.',
    ],
  },
  {
    number: '05',
    title: 'Rich Cultural Heritage & Goan Folk Traditions',
    summary:
      'We celebrate Goa’s rich artistic, literary, and theatrical heritage through vibrant cultural societies and festivals.',
    details: [
      'Annual cultural fests featuring Konkani drama, classical music, and folk dances.',
      'Active literary clubs publishing student poetry and essays in English, Konkani, and Marathi.',
      'Inter-school elocution, quiz, and debate championships.',
    ],
  },
  {
    number: '06',
    title: 'Comprehensive Sports & NCC/NSS Programs',
    summary:
      'Spacious campus grounds, dedicated athletic coaches, and active physical training that builds resilience and teamwork.',
    details: [
      'State-level representation in football, volleyball, athletics, and kabaddi.',
      'Active NCC and Scout & Guide troops fostering discipline and national service.',
      'Annual multi-day athletic meet with high community participation.',
    ],
  },
  {
    number: '07',
    title: 'Global Alumni Brotherhood & Lifelong Community',
    summary:
      'A network of 16,000+ alumni who return to mentor, sponsor facilities, and champion the next generation of Canacona learners.',
    details: [
      'Active scholarship funds sponsored entirely by proud alumni.',
      'Annual batch reunions and structured career guidance seminars.',
      'Direct peer-to-peer alumni networking across India and the diaspora.',
    ],
  },
];

export const WhyNirakarAccordion: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  return (
    <section className="relative bg-paper py-16 md:py-24 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1 rounded-full border border-brand-200/60">
            Institutional Foundations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            Why Choose Shree Nirakar
          </h2>
          <p className="text-sm sm:text-base text-ink-muted font-sans leading-relaxed">
            Seven defining pillars that have anchored educational excellence in Canacona for more than five decades.
          </p>
        </div>

        {/* 7-Point Numbered Accordion */}
        <div className="max-w-4xl mx-auto space-y-3">
          {WHY_POINTS.map((item, idx) => {
            const isOpen = activeIdx === idx;
            return (
              <div
                key={item.number}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-brand-700/50 shadow-md ring-1 ring-brand-700/20'
                    : 'bg-white/70 border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveIdx(isOpen ? -1 : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span
                      className={`font-serif text-xl sm:text-2xl font-black ${
                        isOpen ? 'text-brand-700' : 'text-stone-400'
                      }`}
                    >
                      {item.number}
                    </span>
                    <div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-ink">
                        {item.title}
                      </h3>
                      {!isOpen && (
                        <p className="text-xs sm:text-sm text-stone-500 font-sans line-clamp-1 mt-0.5">
                          {item.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-brand-50 text-brand-700' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-stone-100 px-5 sm:px-6 pb-6 pt-3"
                    >
                      <p className="text-sm text-stone-600 font-sans leading-relaxed mb-4">
                        {item.summary}
                      </p>
                      <div className="space-y-2">
                        {item.details.map((point, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                            <CheckCircle2 size={16} className="text-brand-700 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG edge continuing to next section */}
      <SectionEdge variant="arc" color="#f4f1ea" height={40} />
    </section>
  );
};
