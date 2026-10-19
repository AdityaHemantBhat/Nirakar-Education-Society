import React, { useEffect, useState, useRef } from 'react';
import { Award, Users, GraduationCap, BookOpen } from 'lucide-react';
import { SectionEdge } from '@nirakar/ui';

interface StatItem {
  key: string;
  label: string;
  value: number;
  prefix?: string | null;
  suffix?: string | null;
  icon?: string | null;
}

interface StatsBandProps {
  stats?: StatItem[];
}

const DEFAULT_STATS: StatItem[] = [
  { key: 'years', label: 'Years of Service', value: 54, suffix: '+', icon: 'Award' },
  { key: 'students', label: 'Enrolled Learners', value: 1450, suffix: '+', icon: 'Users' },
  { key: 'alumni', label: 'Alumni Network', value: 16500, suffix: '+', icon: 'GraduationCap' },
  { key: 'faculty', label: 'Faculty & Mentors', value: 92, suffix: '', icon: 'BookOpen' },
];

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const duration = 1800; // ms
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <span ref={ref}>{count.toLocaleString('en-IN')}</span>;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Award: <Award className="text-brand-700" size={24} />,
  Users: <Users className="text-brand-700" size={24} />,
  GraduationCap: <GraduationCap className="text-brand-700" size={24} />,
  BookOpen: <BookOpen className="text-brand-700" size={24} />,
};

export const StatsBand: React.FC<StatsBandProps> = ({ stats = DEFAULT_STATS }) => {
  return (
    <div className="relative bg-cream py-10 md:py-14 border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((item) => (
            <div
              key={item.key}
              className="bg-paper p-6 rounded-2xl border border-stone-200/70 shadow-sm flex flex-col items-center text-center space-y-2 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center mb-1">
                {ICON_MAP[item.icon || 'Award'] || <Award className="text-brand-700" size={24} />}
              </div>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-ink flex items-baseline">
                {item.prefix && <span className="text-accent-700 mr-0.5">{item.prefix}</span>}
                <CountUp target={item.value} />
                {item.suffix && <span className="text-accent-700 ml-0.5">{item.suffix}</span>}
              </div>
              <p className="text-xs sm:text-sm font-serif font-medium text-ink-muted uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
