import React from 'react';
import { cn } from '../tokens.js';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-stone-200/70',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent',
        className
      )}
      {...props}
    />
  );
};

export const HeroSkeleton: React.FC = () => (
  <div className="w-full min-h-[640px] bg-stone-100 flex flex-col justify-end p-8 md:p-16 relative overflow-hidden">
    <div className="max-w-4xl space-y-6">
      <Skeleton className="h-6 w-36 rounded-full" />
      <Skeleton className="h-14 md:h-20 w-3/4 rounded-xl" />
      <Skeleton className="h-6 w-2/3" />
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-12 w-44 rounded-full" />
        <Skeleton className="h-12 w-36 rounded-full" />
      </div>
    </div>
  </div>
);

export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex flex-col items-center space-y-3 p-6 bg-white/60 rounded-xl border border-stone-200/50">
        <Skeleton className="h-10 w-24 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </div>
    ))}
  </div>
);

export const NewsCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-stone-200/70 shadow-sm flex flex-col">
    <Skeleton className="w-full h-48" />
    <div className="p-6 space-y-3 flex-1 flex flex-col">
      <Skeleton className="h-4 w-24 rounded-full" />
      <Skeleton className="h-6 w-5/6 rounded" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="pt-4 mt-auto">
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  </div>
);

export const NoticeRowSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200/60 my-2">
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-5 w-3/4" />
    </div>
    <Skeleton className="h-9 w-24 rounded-lg ml-4" />
  </div>
);

export const EventCardSkeleton: React.FC = () => (
  <div className="flex flex-col sm:flex-row bg-white rounded-xl border border-stone-200/70 overflow-hidden shadow-sm my-3">
    <Skeleton className="w-full sm:w-44 h-40 shrink-0" />
    <div className="p-5 flex-1 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-32" />
    </div>
  </div>
);

export const FacultyCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-stone-200/70 p-6 flex flex-col items-center text-center space-y-4 shadow-sm">
    <Skeleton className="w-28 h-28 rounded-full" />
    <Skeleton className="h-6 w-36" />
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-3 w-44" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  </div>
);

export const AlumniCardSkeleton: React.FC = () => (
  <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,.55)]">
    <Skeleton className="h-2 w-full rounded-none bg-amber-200/70" />
    <div className="p-5 space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
        <div className="space-y-2.5 flex-1">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3.5 w-2/5" />
        </div>
      </div>
      <div className="space-y-2.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
    </div>
  </div>
);

export const MagazineCoverSkeleton: React.FC = () => (
  <div className="flex flex-col items-center space-y-3">
    <div className="w-48 sm:w-56 aspect-[3/4] bg-stone-200 rounded-lg shadow-md overflow-hidden relative">
      <Skeleton className="w-full h-full" />
    </div>
    <Skeleton className="h-5 w-36" />
    <Skeleton className="h-4 w-24" />
  </div>
);

export const TableRowsSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full divide-y divide-stone-200/60 bg-white rounded-xl border border-stone-200/60 overflow-hidden">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 space-x-4">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/6" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    ))}
  </div>
);
