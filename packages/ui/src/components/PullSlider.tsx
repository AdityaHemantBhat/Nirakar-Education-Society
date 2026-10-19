import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../tokens.js';

export interface PullSliderProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  snapStops?: number[];
  tierLabels?: Record<string | number, string>;
  thankYouMessages?: Record<string | number, string>;
  onChange?: (value: number) => void;
  className?: string;
}

const DEFAULT_STOPS = [10, 20, 50, 100, 250, 500, 1000];

export const PullSlider: React.FC<PullSliderProps> = ({
  min = 10,
  max = 1000,
  defaultValue = 100,
  snapStops = DEFAULT_STOPS,
  tierLabels = {
    10: 'Student Supporter',
    20: 'Book Patron',
    50: 'Vidya Sahayak',
    100: 'Heritage Builder',
    250: 'Classroom Sponsor',
    500: 'Guardian Pillar',
    1000: 'Distinguished Benefactor',
  },
  thankYouMessages = {
    10: 'Thank you for supporting our student library!',
    20: 'Your generosity enriches our learning materials.',
    50: 'Your contribution fuels bright ambitions in Canacona.',
    100: 'Warmest gratitude from the entire Nirakar family.',
    250: 'Your support directly empowers classroom enhancements.',
    500: 'You are a beacon of hope and strength for our students.',
    1000: 'Exceptional dedication towards the advancement of Goan education.',
  },
  onChange,
  className,
}) => {
  const [amount, setAmount] = useState<number>(defaultValue);
  const trackRef = useRef<HTMLDivElement>(null);

  // Convert raw value to 0..1 non-linear fraction based on snap stops index
  const valueToFraction = (val: number): number => {
    const sorted = [...snapStops].sort((a, b) => a - b);
    if (val <= sorted[0]) return 0;
    if (val >= sorted[sorted.length - 1]) return 1;

    for (let i = 0; i < sorted.length - 1; i++) {
      if (val >= sorted[i] && val <= sorted[i + 1]) {
        const segFrac = (val - sorted[i]) / (sorted[i + 1] - sorted[i]);
        return (i + segFrac) / (sorted.length - 1);
      }
    }
    return 0.5;
  };

  const fractionToValue = (frac: number): number => {
    const clamped = Math.max(0, Math.min(1, frac));
    const sorted = [...snapStops].sort((a, b) => a - b);
    const pos = clamped * (sorted.length - 1);
    const index = Math.floor(pos);
    const remainder = pos - index;

    if (index >= sorted.length - 1) return sorted[sorted.length - 1];
    const interpolated = sorted[index] + remainder * (sorted[index + 1] - sorted[index]);

    // Find nearest snap stop within threshold
    const nearest = sorted.reduce((prev, curr) =>
      Math.abs(curr - interpolated) < Math.abs(prev - interpolated) ? curr : prev
    );

    if (Math.abs(nearest - interpolated) < (sorted[index + 1] - sorted[index]) * 0.25) {
      return nearest;
    }
    return Math.round(interpolated);
  };

  const currentFrac = valueToFraction(amount);
  const dragX = useMotionValue(0);
  const smoothX = useSpring(dragX, { stiffness: 450, damping: 35 });

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  };

  const updateAmount = (newVal: number) => {
    const clamped = Math.max(min, Math.min(max, newVal));
    setAmount(clamped);
    onChange?.(clamped);
    triggerHaptic();
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const calculated = fractionToValue(frac);
    updateAmount(calculated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const sorted = [...snapStops].sort((a, b) => a - b);
    const currIdx = sorted.indexOf(amount);

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (currIdx !== -1 && currIdx < sorted.length - 1) {
        updateAmount(sorted[currIdx + 1]);
      } else {
        updateAmount(Math.min(max, amount + 10));
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (currIdx !== -1 && currIdx > 0) {
        updateAmount(sorted[currIdx - 1]);
      } else {
        updateAmount(Math.max(min, amount - 10));
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      updateAmount(sorted[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      updateAmount(sorted[sorted.length - 1]);
    }
  };

  // Determine current active tier label and message
  const sortedStops = [...snapStops].sort((a, b) => a - b);
  const currentTierStop = [...sortedStops].reverse().find((s) => amount >= s) ?? sortedStops[0];
  const tierLabel = tierLabels[currentTierStop] || 'Supporter';
  const thankYouText = thankYouMessages[currentTierStop] || 'Heartfelt gratitude for supporting our students.';

  return (
    <div className={cn('w-full max-w-xl mx-auto p-6 md:p-8 bg-paper rounded-3xl border border-stone-200 shadow-xl', className)}>
      {/* Big Odometer Amount Display */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs uppercase tracking-widest text-brand-700 font-semibold px-3 py-1 bg-brand-50 rounded-full border border-brand-200/60">
          Voluntary Contribution
        </span>
        <div className="flex items-center justify-center gap-1 text-ink pt-2">
          <span className="text-3xl md:text-4xl font-serif text-accent-700 font-bold">₹</span>
          <motion.span
            key={amount}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="text-5xl md:text-6xl font-serif font-black tracking-tight"
          >
            {amount.toLocaleString('en-IN')}
          </motion.span>
        </div>
        <div className="text-lg font-serif font-bold text-brand-800">{tierLabel}</div>
        <p className="text-sm text-stone-600 max-w-md mx-auto italic">{thankYouText}</p>
      </div>

      {/* SVG Curved Track and Elastic Handle */}
      <div
        ref={trackRef}
        onPointerDown={handleTrackPointerDown}
        tabIndex={0}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={amount}
        aria-valuetext={`₹${amount} - ${tierLabel}`}
        onKeyDown={handleKeyDown}
        className="relative h-16 w-full cursor-pointer touch-none select-none flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 rounded-xl"
      >
        {/* SVG Track */}
        <svg viewBox="0 0 1000 48" preserveAspectRatio="none" className="w-full h-8 overflow-visible">
          {/* Background Track with gentle curve */}
          <path
            d="M 20,24 Q 500,32 980,24"
            stroke="#e7e5e4"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          {/* Active Fill Track */}
          <path
            d="M 20,24 Q 500,32 980,24"
            stroke="url(#slider-gradient)"
            strokeWidth="12"
            strokeDasharray="1000"
            strokeDashoffset={1000 * (1 - currentFrac)}
            strokeLinecap="round"
            fill="none"
          />
          <defs>
            <linearGradient id="slider-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d7ab36" />
              <stop offset="100%" stopColor="#9b1e1e" />
            </linearGradient>
          </defs>
        </svg>

        {/* Magnetic Snapping Tick Marks */}
        <div className="absolute inset-x-4 top-10 flex justify-between pointer-events-none">
          {sortedStops.map((stop) => {
            const frac = valueToFraction(stop);
            return (
              <div
                key={stop}
                className="flex flex-col items-center"
                style={{ position: 'absolute', left: `${frac * 100}%`, transform: 'translateX(-50%)' }}
              >
                <div
                  className={cn(
                    'w-1.5 h-2.5 rounded-full mb-1 transition-all duration-200',
                    amount >= stop ? 'bg-brand-700 scale-125' : 'bg-stone-300'
                  )}
                />
                <span className="text-[10px] font-mono text-stone-500 font-medium">₹{stop}</span>
              </div>
            );
          })}
        </div>

        {/* Elastic Draggable Handle */}
        <motion.div
          style={{
            left: `${currentFrac * 100}%`,
            x: '-50%',
          }}
          className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl border-4 border-brand-700 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-transform"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-accent-500 shadow-sm" />
        </motion.div>
      </div>

      {/* Quick Select Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-10 pt-4 border-t border-stone-200/80">
        <span className="text-xs uppercase text-stone-500 font-semibold mr-1">Quick Select:</span>
        {sortedStops.map((stop) => (
          <button
            key={stop}
            type="button"
            onClick={() => updateAmount(stop)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm border',
              amount === stop
                ? 'bg-brand-700 text-white border-brand-800 scale-105'
                : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
            )}
          >
            ₹{stop}
          </button>
        ))}
      </div>
    </div>
  );
};
