import React, { useRef, useState } from 'react';

/**
 * NirakarSpotlight
 * 
 * Minimalist, high-impact brand spotlight reveal effect inspired by Sheryians (sheryians.com),
 * tailored to Nirakar Education Society:
 * - Seamless smooth cream (#FAF7F2) background matching the homepage canvas.
 * - Zero square/rectangle border lines across the section.
 * - Base state: Colossal hollow outline text with subtle navy stroke.
 * - Hover state: Dynamic radial spotlight tracking the cursor that reveals our authentic
 *   school & campus photography masked inside the illuminated letterforms!
 */
export const NirakarSpotlight: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeColor, setActiveColor] = useState('rgba(17, 27, 94, 0.72)');

  const spotlightColors = [
    'rgba(17, 27, 94, 0.72)',
    'rgba(217, 119, 6, 0.72)',
    'rgba(29, 53, 216, 0.72)',
  ];

  const rafIdRef = useRef<number | null>(null);

  const updateCoordinates = (clientX: number, clientY: number) => {
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateCoordinates(e.clientX, e.clientY);
    if (!isHovered) setIsHovered(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches[0]) {
      updateCoordinates(e.touches[0].clientX, e.touches[0].clientY);
      if (!isHovered) setIsHovered(true);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    updateCoordinates(e.clientX, e.clientY);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleCycleColor = () => {
    setActiveColor((current) => {
      const index = spotlightColors.indexOf(current);
      return spotlightColors[(index + 1) % spotlightColors.length];
    });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
      onClick={handleCycleColor}
      aria-label="Nirakar Brand Wordmark"
      className="relative w-full bg-[#FAF7F2] py-12 sm:py-20 md:py-28 lg:py-36 flex items-center justify-center overflow-hidden cursor-default select-none border-0"
      style={
        {
          '--mouse-x': '50%',
          '--mouse-y': '50%',
        } as React.CSSProperties
      }
    >
      {/* Container with zero borders or rectangular dividing lines */}
      <div className="w-full max-w-[100vw] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">

        {/* Layer 1: Base State (Hollow Outline on Smooth Cream Canvas) */}
        <div className="w-full flex items-center justify-center pointer-events-none">
          <span
            className="font-sans font-black tracking-tighter leading-none text-center select-none text-[22vw] xs:text-[20vw] sm:text-[16.5vw] lg:text-[18vw] block whitespace-nowrap"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1.2px rgba(17, 27, 94, 0.24)',
            }}
          >
            NIRAKAR
          </span>
        </div>

        {/* Layer 2: Sheryians Lighting Spotlight Overlay (Campus Photography Masked in Text) */}
        <div
          className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 pointer-events-none transition-opacity duration-300 ease-out"
          style={{
            opacity: isHovered ? 1 : 0,
            WebkitMaskImage:
              'radial-gradient(circle 280px at var(--mouse-x, 50%) var(--mouse-y, 50%), black 28%, rgba(0,0,0,0.65) 65%, transparent 100%)',
            maskImage:
              'radial-gradient(circle 280px at var(--mouse-x, 50%) var(--mouse-y, 50%), black 28%, rgba(0,0,0,0.65) 65%, transparent 100%)',
          }}
        >
          <span
            className="font-sans font-black tracking-tighter leading-none text-center select-none text-[22vw] xs:text-[20vw] sm:text-[16.5vw] lg:text-[18vw] block whitespace-nowrap transition-all duration-700 ease-out"
            style={{
              backgroundImage: `radial-gradient(circle 320px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(245, 158, 11, 0.28) 0%, ${activeColor} 52%, rgba(11, 19, 43, 0.88) 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: '#111b5e',
              WebkitTextStroke: '1px #111b5e',
              filter: 'drop-shadow(0 0 25px rgba(29, 53, 216, 0.35))',
            }}
          >
            NIRAKAR
          </span>
        </div>

      </div>
    </section>
  );
};
