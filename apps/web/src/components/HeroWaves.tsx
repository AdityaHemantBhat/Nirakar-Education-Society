import React from 'react';

interface HeroWavesProps {
  className?: string;
  opacity?: number;
}

/**
 * Two fine, subtle organic curves flowing gently from left to right
 * in light orange / amber across dark navy hero banners.
 * Soft and understated so they do not distract the naked eye.
 */
export const HeroWaves: React.FC<HeroWavesProps> = ({ className = '', opacity = 1 }) => {
  // Normalize opacity to keep the lines soft, gentle, and understated (~0.20-0.25)
  const effectiveOpacity = opacity > 0.35 ? opacity * 0.25 : opacity;

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden -z-10 ${className}`}
      style={{ opacity: effectiveOpacity }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="none"
      >
        {/* Line 1: Fine, delicate curve in soft amber */}
        <path
          d="M -100 120 C 300 40, 600 240, 1000 90 C 1250 20, 1450 180, 1600 120"
          stroke="rgba(251, 191, 36, 0.3)"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Line 2: Second delicate parallel curve in warm saffron */}
        <path
          d="M -80 180 C 320 90, 620 280, 1020 140 C 1270 60, 1470 220, 1620 170"
          stroke="rgba(217, 119, 6, 0.25)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
};


export default HeroWaves;
