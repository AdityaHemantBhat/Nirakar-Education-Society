import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { FlipbookReader } from '../components/FlipbookReader.js';
import { SupporterPassModal } from '../components/SupporterPassModal.js';

export const MagazineReaderPage: React.FC = () => {
  const { date, id } = useParams<{ date?: string; id?: string }>();
  const target = date || id || 'today';
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['magazine_issue', target],
    queryFn: async () => {
      const res = await fetch(`/api/v1/magazine/issue/${target}`);
      if (!res.ok) {
        throw new Error('Could not load requested publication issue');
      }
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111422] text-stone-200 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <p className="font-serif text-sm tracking-widest text-stone-300 uppercase">
          Loading Shree Nirakar Daily Magazine...
        </p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-[#111422] text-stone-200 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-white">Daily Magazine Issue Not Found</h2>
        <p className="text-sm text-stone-400 max-w-sm">
          No publication was found for issue reference "{target}". You can browse all available issues in our digital calendar archives.
        </p>
        <a
          href="/magazine"
          className="px-6 py-2.5 rounded-xl bg-amber-400 text-[#07112c] font-serif text-xs font-bold hover:bg-amber-300 transition-colors"
        >
          View Publication Calendar
        </a>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${issue.title} (${issue.publishDate}) | Shri Nirakar Daily Magazine`}</title>
        <meta
          name="description"
          content={issue.excerpt || `Read the complete issue of Shri Nirakar Daily Magazine (Shri Nirakar High School) published on ${issue.publishDate}.`}
        />
      </Helmet>

      {/* The Paper Book Reader (StPageFlip wrapped with desk vignette and preview gating) */}
      <FlipbookReader
        title={issue.title}
        publishDate={issue.publishDate}
        pages={issue.pages || []}
        articles={issue.articles || []}
        isPaywalled={issue.isPaywalled}
        onOpenPassSheet={() => setIsPassModalOpen(true)}
      />

      {/* Supporter Pass Paywall Modal */}
      <SupporterPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onSuccess={() => {
          // Re-fetch issue to unlock all pages
          window.location.reload();
        }}
      />
    </>
  );
};
