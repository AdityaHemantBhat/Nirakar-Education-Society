import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete?: () => void;
  minDurationMs?: number; // 900 ms floor
  maxDurationMs?: number; // ~2.4 s cap
}

export const Preloader: React.FC<PreloaderProps> = ({
  onComplete,
  minDurationMs = 900,
  maxDurationMs = 2400,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check session storage to only run once per session
    if (typeof window !== 'undefined') {
      const hasShown = sessionStorage.getItem('nirakar_preloader_seen');
      if (hasShown) {
        setIsFinished(true);
        onComplete?.();
        return;
      }
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
    }

    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const calculated = Math.min(100, Math.round((elapsed / maxDurationMs) * 100));
      setProgress(calculated);

      if (elapsed >= maxDurationMs || (elapsed >= minDurationMs && document.readyState === 'complete')) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setIsFinished(true);
          sessionStorage.setItem('nirakar_preloader_seen', 'true');
          onComplete?.();
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minDurationMs, maxDurationMs, onComplete]);

  if (isFinished) return null;

  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper transition-opacity duration-300">
        <span className="font-serif text-lg font-bold text-brand-800">Shree Nirakar Education Society</span>
      </div>
    );
  }

  // Calculate SVG circular progress arc
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
          transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
        }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper text-ink overflow-hidden select-none"
      >
        {/* Curtains left and right with subtle paper texture */}
        <div className="relative flex flex-col items-center justify-center p-8">
          {/* Circular Progress Arc surrounding the Diya & Book scene */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-stone-200"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="88"
                cy="88"
                r={radius}
                className="stroke-brand-700 transition-all duration-75"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Central Animated Scene: Open Book turning pages + Lamp flame lighting */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="overflow-visible">
                {/* Diya Clay Base */}
                <path
                  d="M26 62 C28 72, 56 72, 58 62 L60 58 C60 56, 24 56, 24 58 Z"
                  className="stroke-brand-800"
                  strokeWidth="2"
                  fill="#9b1e1e"
                  fillOpacity="0.1"
                />

                {/* Flame glowing and rising */}
                <motion.path
                  d="M42 56 C39 46, 34 40, 42 26 C50 40, 45 46, 42 56 Z"
                  fill="#d7ab36"
                  animate={{
                    scaleY: [1, 1.15, 0.95, 1.1],
                    scaleX: [1, 0.9, 1.05, 0.95],
                  }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  style={{ transformOrigin: '42px 56px' }}
                />

                {/* Turning Book Pages */}
                <motion.path
                  d="M42 38 C32 34, 18 34, 12 36 L12 12 C18 10, 32 10, 42 14 Z"
                  stroke="#1a1d27"
                  strokeWidth="1.75"
                  fill="#fbfaf7"
                />
                <motion.path
                  d="M42 38 C52 34, 66 34, 72 36 L72 12 C66 10, 52 10, 42 14 Z"
                  stroke="#1a1d27"
                  strokeWidth="1.75"
                  fill="#fbfaf7"
                />

                {/* Animated Flip Page */}
                <motion.path
                  d="M42 38 C42 38, 42 38, 42 38 L42 14 C42 14, 42 14, 42 14 Z"
                  animate={{
                    d: [
                      'M42 38 C42 38, 42 38, 42 38 L42 14 C42 14, 42 14, 42 14 Z',
                      'M42 38 C48 32, 58 32, 72 36 L72 12 C58 8, 48 8, 42 14 Z',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  stroke="#9b1e1e"
                  strokeWidth="1.5"
                  fill="#f4f1ea"
                />
              </svg>
            </div>
          </div>

          {/* Typography & Loading Percent */}
          <div className="mt-6 text-center space-y-1">
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-brand-900">
              Shree Nirakar Vidhyalaya
            </h1>
            <p className="font-serif text-xs uppercase tracking-widest text-accent-700 font-semibold">
              Mashem, Canacona, Goa • Est. 1968
            </p>
            <div className="pt-2 text-xs font-mono text-stone-500">{progress}%</div>
          </div>

          {/* Skip button for user control */}
          <button
            type="button"
            onClick={() => {
              setIsFinished(true);
              sessionStorage.setItem('nirakar_preloader_seen', 'true');
              onComplete?.();
            }}
            className="mt-6 text-[11px] uppercase tracking-wider text-stone-400 hover:text-stone-700 underline underline-offset-4"
          >
            Skip Intro
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
