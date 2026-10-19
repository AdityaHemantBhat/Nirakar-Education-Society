import React from 'react';

export interface SectionEdgeProps {
  variant?: 'scoop' | 'wave' | 'arch' | 'slant' | 'gentle';
  position?: 'top' | 'bottom';
  fillColor?: string;
  color?: string;
  bgColor?: string;
  className?: string;
  height?: number;
  withGoldLine?: boolean;
}

export const SectionEdge: React.FC<SectionEdgeProps> = ({
  variant = 'scoop',
  position = 'bottom',
  fillColor = '#FAF7F2',
  color,
  bgColor,
  className = '',
  height = 36,
  withGoldLine = true,
}) => {
  const isTop = position === 'top';
  const effectiveColor = color || fillColor;

  const paths: Record<string, string> = {
    scoop: isTop 
      ? 'M0,36 C360,6 1080,6 1440,36 L1440,0 L0,0 Z'
      : 'M0,0 C360,30 1080,30 1440,0 L1440,36 L0,36 Z',
    wave: isTop
      ? 'M0,24 C320,44 640,4 960,30 C1200,48 1360,18 1440,24 L1440,0 L0,0 Z'
      : 'M0,12 C320,-8 640,32 960,6 C1200,-12 1360,18 1440,12 L1440,36 L0,36 Z',
    arch: isTop
      ? 'M0,36 Q720,-6 1440,36 L1440,0 L0,0 Z'
      : 'M0,0 Q720,42 1440,0 L1440,36 L0,36 Z',
    slant: isTop
      ? 'M0,36 L1440,0 L1440,0 L0,0 Z'
      : 'M0,0 L1440,36 L1440,36 L0,36 Z',
    gentle: isTop
      ? 'M0,20 C480,0 960,36 1440,16 L1440,0 L0,0 Z'
      : 'M0,16 C480,36 960,0 1440,20 L1440,36 L0,36 Z',
  };

  const curveLines: Record<string, string> = {
    scoop: isTop
      ? 'M0,36 C360,6 1080,6 1440,36'
      : 'M0,0 C360,30 1080,30 1440,0',
    wave: isTop
      ? 'M0,24 C320,44 640,4 960,30 C1200,48 1360,18 1440,24'
      : 'M0,12 C320,-8 640,32 960,6 C1200,-12 1360,18 1440,12',
    arch: isTop
      ? 'M0,36 Q720,-6 1440,36'
      : 'M0,0 Q720,42 1440,0',
    slant: isTop
      ? 'M0,36 L1440,0'
      : 'M0,0 L1440,36',
    gentle: isTop
      ? 'M0,20 C480,0 960,36 1440,16'
      : 'M0,16 C480,36 960,0 1440,20',
  };

  const path = paths[variant] || paths.scoop;
  const curveLine = curveLines[variant] || curveLines.scoop;

  return (
    <div
      className={`w-full overflow-hidden leading-none pointer-events-none select-none z-10 ${className}`}
      style={{ 
        height: `${height}px`,
        ...(bgColor ? { backgroundColor: bgColor } : {})
      }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full block"
        viewBox="0 0 1440 36"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sectionEdgeGoldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
            <stop offset="25%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="75%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <path d={path} style={{ fill: effectiveColor }} />

        {withGoldLine && (
          <path
            d={curveLine}
            fill="none"
            stroke="url(#sectionEdgeGoldAccent)"
            strokeWidth="2"
          />
        )}
      </svg>
    </div>
  );
};
