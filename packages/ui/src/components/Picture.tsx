import React, { useState } from 'react';
import { cn } from '../tokens.js';

export interface PictureVariant {
  width: number;
  format: 'avif' | 'webp' | 'jpeg';
  url: string;
}

interface PictureProps {
  src: string; // Default fallback image URL
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: string; // e.g. "16/9", "4/3", "1/1"
  variants?: PictureVariant[];
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean; // If true, sets fetchpriority="high" and loading="eager"
  blurhash?: string;
  dominantColor?: string;
}

export const Picture: React.FC<PictureProps> = ({
  src,
  alt,
  width,
  height,
  aspectRatio,
  variants = [],
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className,
  imgClassName,
  priority = false,
  dominantColor = '#f4f1ea',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Group variants by format
  const avifVariants = variants.filter((v) => v.format === 'avif');
  const webpVariants = variants.filter((v) => v.format === 'webp');
  const jpegVariants = variants.filter((v) => v.format === 'jpeg');

  const buildSrcSet = (items: PictureVariant[]) =>
    items.map((item) => `${item.url} ${item.width}w`).join(', ');

  const avifSrcSet = buildSrcSet(avifVariants);
  const webpSrcSet = buildSrcSet(webpVariants);
  const jpegSrcSet = buildSrcSet(jpegVariants);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        backgroundColor: dominantColor,
        aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
      }}
    >
      <picture>
        {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
        {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
        {jpegSrcSet && <source type="image/jpeg" srcSet={jpegSrcSet} sizes={sizes} />}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // @ts-expect-error fetchpriority is a modern HTML standard attribute
          fetchpriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0',
            imgClassName
          )}
        />
      </picture>
    </div>
  );
};
