import React from 'react';
import { cn } from '../tokens.js';

export type SectionEdgeVariant = 'wave' | 'arc' | 'scoop' | 'tide';

interface SectionEdgeProps {
  variant?: SectionEdgeVariant;
  color?: string; // Fill color matching the next section
  flip?: boolean; // Flip horizontally
  invert?: boolean; // Flip vertically
  className?: string;
  height?: number;
}

const SVG_PATHS: Record<SectionEdgeVariant, string> = {
  wave: 'M0,18 C320,52 640,-8 960,32 C1100,50 1280,24 1440,28 L1440,64 L0,64 Z',
  arc: 'M0,10 Q720,68 1440,10 L1440,64 L0,64 Z',
  scoop: 'M0,2 C480,72 960,72 1440,2 L1440,64 L0,64 Z',
  tide: 'M0,24 C280,48 560,4 840,36 C1040,58 1260,16 1440,28 L1440,64 L0,64 Z',
};

export const SectionEdge: React.FC<SectionEdgeProps> = ({
  variant = 'wave',
  color = 'var(--color-paper, #fbfaf7)',
  flip = false,
  invert = false,
  className,
  height = 56,
}) => {
  const transform = [
    flip ? 'scaleX(-1)' : '',
    invert ? 'scaleY(-1)' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cn(
        'w-full overflow-hidden leading-none select-none pointer-events-none transition-colors duration-300',
        invert ? '-mb-[1px]' : '-mt-[1px]',
        className
      )}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="w-full h-full block"
        style={{
          transform: transform || undefined,
          transformOrigin: 'center',
        }}
      >
        <path d={SVG_PATHS[variant]} fill={color} />
      </svg>
    </div>
  );
};
