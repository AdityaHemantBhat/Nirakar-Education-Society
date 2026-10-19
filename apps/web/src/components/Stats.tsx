import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Landmark, 
  Users, 
  GraduationCap, 
  Globe, 
  BookOpen, 
  Presentation, 
  Award, 
  History, 
  School 
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  key: string;
  label: string;
  value: number;
  suffix?: string | null;
  prefix?: string | null;
  icon?: string | null;
}

interface StatsProps {
  stats?: Stat[];
}

/**
 * Animated Count-Up Number Component
 * Starts at 0 and counts smoothly to the target value with comma formatting.
 */
const CountUpNumber: React.FC<{
  target: number;
  duration?: number;
  startTrigger: boolean;
}> = ({ target, duration = 2000, startTrigger }) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!startTrigger || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic curve for natural decelerating momentum
      const easeProgress = 1 - Math.pow(1 - progress, 3.5);
      const current = Math.floor(easeProgress * target);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration, startTrigger]);

  const val = hasAnimatedRef.current ? displayValue : (startTrigger ? displayValue : 0);
  return <>{val.toLocaleString('en-US')}</>;
};

export const Stats: React.FC<StatsProps> = ({ stats }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState<boolean>(false);

  // Canonical institutional statistics with accurate, context-specific icons
  const defaultStats: Stat[] = [
    { key: 'years_service', label: 'Years of Heritage', value: 54, suffix: '+', icon: 'Landmark' },
    { key: 'students_count', label: 'Current Learners', value: 1450, suffix: '+', icon: 'Users' },
    { key: 'alumni_network', label: 'Global Alumni', value: 16500, suffix: '+', icon: 'Globe' },
    { key: 'faculty_staff', label: 'Dedicated Faculty', value: 92, suffix: '', icon: 'GraduationCap' },
  ];

  const items = stats && stats.length > 0 ? stats : defaultStats;

  /**
   * Intelligently resolve the most fitting unboxed Lucide icon based on key, label, and explicit icon string
   */
  const getIcon = (iconName?: string | null, key?: string, label?: string) => {
    const k = (key || '').toLowerCase();
    const l = (label || '').toLowerCase();
    const ic = (iconName || '').toLowerCase();
    const iconClass = "w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-amber-400 stroke-[1.75]";

    // 1. Years of Heritage / Founding Legacy (Landmark)
    if (k.includes('heritage') || k.includes('year') || l.includes('heritage') || l.includes('year') || ic === 'landmark') {
      return <Landmark className={iconClass} />;
    }

    // 2. Global Alumni (Globe)
    if (k.includes('alumni') || l.includes('alumni') || ic === 'globe') {
      return <Globe className={iconClass} />;
    }

    // 3. Dedicated Faculty / Teachers / Mentors (GraduationCap)
    if (k.includes('faculty') || k.includes('teacher') || k.includes('mentor') || l.includes('faculty') || l.includes('teacher') || ic === 'graduationcap') {
      return <GraduationCap className={iconClass} />;
    }

    // 4. Current Learners / Students (Users)
    if (k.includes('student') || k.includes('learner') || l.includes('student') || l.includes('learner') || ic === 'users') {
      return <Users className={iconClass} />;
    }

    // Fallbacks
    switch (ic) {
      case 'bookopen': return <BookOpen className={iconClass} />;
      case 'presentation': return <Presentation className={iconClass} />;
      case 'award': return <Award className={iconClass} />;
      case 'history': return <History className={iconClass} />;
      case 'school': return <School className={iconClass} />;
      default: return <Landmark className={iconClass} />;
    }
  };

  // IntersectionObserver to trigger count-up as soon as section scrolls into viewport
  useEffect(() => {
    if (!rootRef.current) return;

    // Check if already in viewport
    const rect = rootRef.current.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  // GSAP subtle entrance fade & lift
  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.gsap-stat-item', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 92%',
          once: true,
          onEnter: () => setIsInView(true),
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="w-full relative select-none">
      {/* 1. Main Dark Navy Stats Ribbon */}
      <section className="w-full bg-[#111b5e] text-white pt-10 pb-12 sm:pt-12 sm:pb-14 relative overflow-hidden">
        {/* Subtle Ambient Radial Lighting for depth */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(217,119,6,0.1),transparent_70%)]" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-0 lg:divide-x lg:divide-white/15">
            {items.map((stat, idx) => (
              <div
                key={stat.key || idx}
                className={`gsap-stat-item group flex items-center gap-4 sm:gap-5 lg:px-8 first:lg:pl-0 last:lg:pr-0 py-2 sm:py-3`}
              >
                {/* Clean, Unboxed Organic Icon */}
                <div className="shrink-0 text-amber-400 group-hover:text-amber-300 group-hover:scale-110 transition-all duration-300">
                  {getIcon(stat.icon, stat.key, stat.label)}
                </div>

                {/* Numbers and Labels */}
                <div className="min-w-0 flex-1">
                  <div className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-white tracking-tight leading-none flex items-baseline">
                    {stat.prefix && (
                      <span className="text-amber-400 text-xl sm:text-2xl mr-0.5 font-bold">
                        {stat.prefix}
                      </span>
                    )}
                    <span className="tabular-nums font-extrabold text-white">
                      <CountUpNumber target={stat.value} duration={2000} startTrigger={isInView} />
                    </span>
                    {stat.suffix && (
                      <span className="text-amber-400 font-black text-xl sm:text-2xl lg:text-3xl ml-0.5 select-none">
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-[13px] font-sans font-medium text-stone-200/90 mt-1.5 leading-snug tracking-wide group-hover:text-white transition-colors">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Seamless Navy Bottom Curve: Pure navy shape dipping into cream with NO rectangular parent box */}
      <div className="w-full overflow-hidden leading-none select-none pointer-events-none -mt-px relative z-10">
        <svg
          viewBox="0 0 1440 38"
          preserveAspectRatio="none"
          className="w-full h-8 sm:h-10 md:h-12 block"
        >
          <path d="M0,0 L1440,0 C960,38 480,38 0,0 Z" fill="#111b5e" stroke="none" />
        </svg>
      </div>
    </div>
  );
};
