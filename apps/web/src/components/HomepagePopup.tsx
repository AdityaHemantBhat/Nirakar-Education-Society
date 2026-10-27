import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Sparkles, X } from 'lucide-react';
import { useAdmissionsSocket } from '../hooks/useAdmissionsSocket.js';

interface HomepagePopupData {
  title?: string | null;
  body?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  visible?: boolean;
  ctaText?: string | null;
  ctaUrl?: string | null;
}

interface HomepagePopupProps {
  isReady: boolean;
}

export const HomepagePopup: React.FC<HomepagePopupProps> = ({ isReady }) => {
  useAdmissionsSocket();
  const [dismissed, setDismissed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const { data: popup } = useQuery({
    queryKey: ['homepage_popup'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admissions/popup');
      if (!response.ok) throw new Error('Unable to load homepage popup');
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Unable to load homepage popup');
      return result.data as HomepagePopupData;
    },
    enabled: isReady,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setDismissed(false);
    setImageFailed(false);
  }, [popup?.title, popup?.body, popup?.mediaUrl]);

  const title = popup?.title?.trim() || '';
  const body = popup?.body?.trim() || '';
  const ctaText = popup?.ctaText?.trim() || '';
  const ctaUrl = popup?.ctaUrl?.trim() || '';
  const hasImage = Boolean(popup?.mediaUrl && popup.mediaType === 'image' && !imageFailed);
  const hasText = Boolean(title || body || ctaText);
  const canShow = isReady && !dismissed && popup?.visible !== false && (hasText || hasImage);

  return (
    <AnimatePresence>
      {canShow && (
        <motion.div
          className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/80 p-4 sm:p-6 md:p-10"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDismissed(true);
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'homepage-popup-title' : undefined}
            className={`relative overflow-hidden rounded-[2rem] bg-[#FAF7F2] shadow-[0_30px_100px_rgba(0,0,0,0.5)] ring-1 ring-white/30 w-full ${
              hasImage && hasText
                ? 'max-w-5xl grid md:grid-cols-[1.2fr_1fr] min-h-[420px] md:min-h-[460px] max-h-[85vh]'
                : hasImage && !hasText
                ? 'max-w-3xl max-h-[85vh] flex flex-col bg-black'
                : 'max-w-xl'
            }`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            <button
              type="button"
              aria-label="Close popup"
              onClick={() => setDismissed(true)}
              className="absolute right-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/75 text-white backdrop-blur-md transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 shadow-xl"
            >
              <X size={18} />
            </button>

            {hasImage && (
              <div className={`relative bg-stone-950 flex items-center justify-center overflow-hidden p-3 sm:p-4 ${hasText ? 'min-h-[280px] md:min-h-[460px] h-full' : 'w-full max-h-[80vh]'}`}>
                <img
                  src={popup?.mediaUrl || undefined}
                  alt=""
                  loading="eager"
                  decoding="async"
                  className={`w-full h-full object-contain ${hasText ? 'max-h-[420px]' : 'max-h-[80vh]'}`}
                  onError={() => setImageFailed(true)}
                />
              </div>
            )}

            {hasText && (
              <div className="flex flex-col justify-between overflow-y-auto px-7 py-8 sm:px-10 sm:py-10 bg-[#FAF7F2] h-full">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-serif font-bold uppercase tracking-widest text-[#111b5e] bg-amber-100/70 border border-amber-200 px-3.5 py-1.5 rounded-full mb-4 shadow-xs">
                    <Sparkles size={12} className="text-amber-600" />
                    <span>Special Announcement</span>
                  </div>

                  {title && (
                    <h2 id="homepage-popup-title" className="font-serif text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-[#111b5e]">
                      {title}
                    </h2>
                  )}

                  {body && (
                    <p className="mt-3 sm:mt-4 whitespace-pre-line text-sm leading-relaxed text-stone-600 font-sans">
                      {body}
                    </p>
                  )}
                </div>

                {ctaText && ctaUrl && (
                  <div className="mt-6 pt-5 border-t border-stone-200/60">
                    <a
                      href={ctaUrl}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#111b5e] px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md transition hover:bg-[#0b132b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 group"
                    >
                      <span>{ctaText}</span>
                      <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomepagePopup;
