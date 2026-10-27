import React from 'react';
import { FileImage, FileText, Film, FileArchive } from 'lucide-react';

/**
 * The mark that tells you what kind of file something is.
 *
 * The letter on its own is easy to miss, so each format also carries a
 * shape that stands for it: a picture, a page, a film, or a bundle.
 */
const MARKS: Record<string, { icon: React.ElementType; className: string }> = {
  webp: { icon: FileImage, className: 'text-emerald-600' },
  avif: { icon: FileImage, className: 'text-emerald-600' },
  jpg: { icon: FileImage, className: 'text-sky-600' },
  jpeg: { icon: FileImage, className: 'text-sky-600' },
  png: { icon: FileImage, className: 'text-sky-600' },
  gif: { icon: FileImage, className: 'text-sky-600' },
  heic: { icon: FileImage, className: 'text-sky-600' },
  pdf: { icon: FileText, className: 'text-rose-600' },
  mp4: { icon: Film, className: 'text-violet-600' },
  webm: { icon: Film, className: 'text-violet-600' },
  mov: { icon: Film, className: 'text-violet-600' },
  zip: { icon: FileArchive, className: 'text-amber-600' },
};

export const FileTypeIcon: React.FC<{ format: string; size?: number }> = ({
  format,
  size = 12,
}) => {
  const mark = MARKS[(format || '').toLowerCase()];
  const Icon = mark?.icon ?? FileImage;
  return <Icon size={size} className={mark?.className ?? 'text-stone-500'} aria-hidden="true" />;
};

export default FileTypeIcon;
