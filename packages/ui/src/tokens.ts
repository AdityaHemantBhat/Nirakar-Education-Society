import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DESIGN_TOKENS = {
  colors: {
    brand: {
      50: '#fdf3f3',
      100: '#fce5e5',
      200: '#f9cfcf',
      300: '#f4abab',
      400: '#eb7979',
      500: '#dc4848',
      600: '#bd2828',
      700: '#9b1e1e', // Heritage Crimson
      800: '#7f1d1d',
      900: '#681c1c',
      950: '#3a0a0a',
    },
    accent: {
      50: '#fdfbf0',
      100: '#faf5dc',
      200: '#f5eab8',
      300: '#eed98b',
      400: '#e4c35c',
      500: '#d7ab36', // Golden Diya Flame
      600: '#bc8e29',
      700: '#956b23',
      800: '#795523',
      900: '#654722',
      950: '#3a2610',
    },
    ink: {
      50: '#f6f7f9',
      100: '#edeef2',
      200: '#d7dae2',
      300: '#b4bacb',
      400: '#8c95af',
      500: '#6d7796',
      600: '#565f7c',
      700: '#464d65',
      800: '#2b3040',
      900: '#1a1d27', // Refined Deep Ink
      950: '#0f1118',
    },
    paper: '#fbfaf7',
    cream: '#f4f1ea',
    sand: '#eae5d9',
  },
  curves: {
    wave: 'M0,0 C300,50 600,-20 1200,30 L1200,60 L0,60 Z',
    arc: 'M0,0 Q600,60 1200,0 L1200,60 L0,60 Z',
    scoop: 'M0,0 C400,60 800,60 1200,0 L1200,60 L0,60 Z',
    tide: 'M0,15 C200,35 450,-5 700,25 C950,55 1100,5 1200,15 L1200,60 L0,60 Z',
  },
};
