import React from 'react';
import { cn } from '../tokens.js';

interface MotifProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export const DiyaLampMotif: React.FC<MotifProps> = ({
  className,
  size = 48,
  strokeWidth = 1.5,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('inline-block text-accent-500', className)}
    aria-hidden="true"
  >
    {/* Base of clay diya */}
    <path d="M12 40 C14 52, 50 52, 52 40 L54 36 C54 34, 10 34, 10 36 Z" />
    <path d="M10 36 C10 36, 32 39, 54 36" />
    {/* Oil surface */}
    <ellipse cx="32" cy="36" rx="20" ry="3" />
    {/* Wick & Flame */}
    <path
      d="M32 34 C30 26, 26 22, 32 12 C38 22, 34 26, 32 34 Z"
      fill="currentColor"
      fillOpacity="0.2"
    />
    <path d="M32 34 C31 28, 29 25, 32 18 C35 25, 33 28, 32 34 Z" />
    {/* Radiance aura */}
    <path d="M32 6 L32 8" strokeDasharray="1 1" />
    <path d="M22 12 L24 14" strokeDasharray="1 1" />
    <path d="M42 12 L40 14" strokeDasharray="1 1" />
  </svg>
);

export const OpenBookMotif: React.FC<MotifProps> = ({
  className,
  size = 48,
  strokeWidth = 1.5,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('inline-block text-brand-700', className)}
    aria-hidden="true"
  >
    {/* Left Page block */}
    <path d="M32 48 C24 44, 12 44, 8 46 L8 18 C12 16, 24 16, 32 20 Z" />
    {/* Right Page block */}
    <path d="M32 48 C40 44, 52 44, 56 46 L56 18 C52 16, 40 16, 32 20 Z" />
    {/* Spine line */}
    <line x1="32" y1="20" x2="32" y2="48" />
    {/* Subtle text lines */}
    <line x1="14" y1="26" x2="26" y2="28" strokeOpacity="0.6" />
    <line x1="14" y1="32" x2="26" y2="34" strokeOpacity="0.6" />
    <line x1="38" y1="28" x2="50" y2="26" strokeOpacity="0.6" />
    <line x1="38" y1="34" x2="50" y2="32" strokeOpacity="0.6" />
  </svg>
);

export const LaurelWreathMotif: React.FC<MotifProps> = ({
  className,
  size = 48,
  strokeWidth = 1.5,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('inline-block text-accent-600', className)}
    aria-hidden="true"
  >
    {/* Left Branch */}
    <path d="M30 52 C20 48, 14 36, 14 24 C14 16, 18 10, 22 8" />
    {/* Left Leaves */}
    <path d="M22 50 C18 46, 17 40, 21 38" />
    <path d="M16 40 C11 36, 11 30, 16 28" />
    <path d="M14 28 C10 24, 12 18, 17 18" />
    <path d="M18 18 C15 13, 20 8, 24 10" />

    {/* Right Branch */}
    <path d="M34 52 C44 48, 50 36, 50 24 C50 16, 46 10, 42 8" />
    {/* Right Leaves */}
    <path d="M42 50 C46 46, 47 40, 43 38" />
    <path d="M48 40 C53 36, 53 30, 48 28" />
    <path d="M50 28 C54 24, 52 18, 47 18" />
    <path d="M46 18 C49 13, 44 8, 40 10" />
    {/* Ribbon tie */}
    <circle cx="32" cy="52" r="2.5" />
  </svg>
);

export const GoanLeafMotif: React.FC<MotifProps> = ({
  className,
  size = 48,
  strokeWidth = 1.5,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('inline-block text-brand-600', className)}
    aria-hidden="true"
  >
    {/* Stylized banyan / coconut frond curve */}
    <path d="M12 56 C24 44, 38 28, 52 8" />
    <path d="M22 47 C28 41, 33 44, 34 38" />
    <path d="M28 40 C34 34, 39 37, 40 31" />
    <path d="M34 33 C40 27, 45 30, 46 24" />
    <path d="M40 26 C46 20, 50 22, 51 17" />
  </svg>
);
