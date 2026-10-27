import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Loader2, Check, ShieldCheck } from 'lucide-react';
import { useAuthCaptcha, useArmCaptcha } from './AuthCaptcha.js';

export interface LibraryRatingSummary {
  average: number | null;
  count: number;
  breakdown: Array<{ stars: number; count: number }>;
}

export interface LibraryReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  guestName?: string | null;
  user?: {
    username: string;
    email?: string | null;
    alumniProfile?: { firstName?: string | null; lastName?: string | null } | null;
    facultyProfile?: { publicContactToggles?: unknown } | null;
  } | null;
}

interface LibraryRatingProps {
  volumeId: string;
  rating: LibraryRatingSummary;
  reviews: LibraryReview[];
  /** The signed-in reader's name, when there is one. */
  readerName?: string | null;
  /** True when the reader is signed in; a guest may still review. */
  isSignedIn?: boolean;
  onSubmitted?: (summary: LibraryRatingSummary) => void;
}

/** Renders a row of stars, filled to the given rating. */
const Stars: React.FC<{ value: number; size?: number; className?: string }> = ({
  value,
  size = 14,
  className = '',
}) => (
  <span className={`inline-flex items-center gap-0.5 ${className}`} aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={i <= Math.round(value) ? 'fill-accent-500 text-accent-500' : 'text-stone-300'}
        strokeWidth={1.5}
      />
    ))}
  </span>
);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** The name a review is shown under, whether it came from an account or a guest. */
const authorName = (review: LibraryReview): string => {
  if (review.guestName?.trim()) return review.guestName.trim();

  const alumniName = [review.user?.alumniProfile?.firstName, review.user?.alumniProfile?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  const facultyToggles = review.user?.facultyProfile?.publicContactToggles as { name?: string; fullName?: string } | null;
  return facultyToggles?.name?.trim() || facultyToggles?.fullName?.trim() || alumniName || review.user?.username || 'Anonymous';
};

/**
 * The reader's own rating and the reviews left by other readers.
 *
 * Every figure shown here comes from the database — the average is computed
 * from the stored reviews, so it can never disagree with the count.
 *
 * An account is not needed to review. A guest gives a name, and the
 * reCAPTCHA token is what keeps the endpoint from being flooded.
 */
export const LibraryRating: React.FC<LibraryRatingProps> = ({
  volumeId,
  rating,
  reviews,
  readerName,
  isSignedIn = false,
  onSubmitted,
}) => {
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const queryClient = useQueryClient();

  /* The reCAPTCHA provider is armed only when a review is actually being
     left, so the Google script is not downloaded by every reader who
     merely opens the page. */
  const armCaptcha = useArmCaptcha();
  const executeCaptcha = useAuthCaptcha();

  useEffect(() => {
    if (isSignedIn && readerName) setGuestName(readerName);
  }, [isSignedIn, readerName]);

  const submit = async () => {
    if (myRating < 1) {
      setMessage({ kind: 'err', text: 'Please choose a rating first.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      armCaptcha();

      const captchaToken = await executeCaptcha('library_review');

      const response = await fetch(`/api/v1/library/volume/${volumeId}/review`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: myRating,
          comment: comment.trim() || undefined,
          guestName: isSignedIn ? undefined : guestName.trim() || undefined,
          captchaToken,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json?.error?.message || 'The review could not be saved.');
      }

      setMessage({ kind: 'ok', text: 'Thank you — your rating has been recorded.' });
      setComment('');
      onSubmitted?.(json.data.rating as LibraryRatingSummary);
      await queryClient.invalidateQueries({ queryKey: ['library_volume'] });
    } catch (err: any) {
      setMessage({ kind: 'err', text: err?.message || 'The review could not be saved.' });
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = isSignedIn
    ? readerName && readerName.toLowerCase() !== 'admin' ? readerName : 'your profile name'
    : guestName.trim() || 'Anonymous';
  const shown = hoverRating || myRating;

  return (
    <section className="border-t border-stone-200/90 pt-10" id="reviews">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* The score */}
        <div className="flex shrink-0 gap-6 lg:w-72 lg:flex-col lg:items-center lg:gap-4">
          <div className="text-center">
            <p className="font-serif text-5xl font-black text-stone-900">
              {rating.average !== null ? rating.average.toFixed(1) : '—'}
            </p>
            <Stars value={rating.average ?? 0} size={16} className="mt-1.5" />
            <p className="mt-1.5 font-mono text-[11px] text-stone-500">
              {rating.count} review{rating.count === 1 ? '' : 's'}
            </p>
          </div>

          {/* The distribution */}
          {rating.count > 0 && (
            <div className="w-full space-y-1">
              {rating.breakdown.map((row) => (
                <div key={row.stars} className="flex items-center gap-2">
                  <span className="w-3 font-mono text-[10px] text-stone-500">{row.stars}</span>
                  <Star size={10} className="fill-accent-500 text-accent-500" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-accent-500"
                      style={{
                        width: `${(row.count / rating.count) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-5 text-right font-mono text-[10px] text-stone-400">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* The form and the list */}
        <div className="min-w-0 flex-1">
          <div className="mb-8 rounded-2xl border border-stone-200/90 bg-white p-5">
            <h3 className="font-serif text-base font-bold text-stone-900">Rate this volume</h3>
            <p className="mt-1 text-xs text-stone-500">
              {isSignedIn
                ? `Your rating will appear as ${displayName}.`
                : 'Ratings can be anonymous. Add a name only if you want it shown publicly.'}
            </p>

            {/* The name a guest reviews under */}
            {!isSignedIn && (
              <div className="mt-4">
                <label
                  htmlFor="library-review-name"
                  className="mb-1 block font-serif text-xs font-bold uppercase tracking-wider text-stone-600"
                >
                  Display name <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span>
                </label>
                <input
                  id="library-review-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={60}
                  placeholder="Leave blank to post anonymously"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-[#111b5e] focus:bg-white"
                />
              </div>
            )}

            <div className={`flex items-center gap-2 ${isSignedIn ? 'mt-4' : 'mt-4'}`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMyRating(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${i} star${i === 1 ? '' : 's'}`}
                  aria-pressed={myRating === i}
                  className="rounded p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    size={26}
                    strokeWidth={1.5}
                    className={
                      i <= shown ? 'fill-accent-500 text-accent-500' : 'text-stone-300'
                    }
                  />
                </button>
              ))}
              {myRating > 0 && (
                <span className="ml-1 font-mono text-[11px] text-stone-500">{myRating} of 5</span>
              )}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="What did you think of this volume? (optional)"
              className="mt-4 w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 outline-none transition focus:border-[#111b5e] focus:bg-white"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#111b5e] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0b132b] disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Publish rating
              </button>

              <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-400">
                <ShieldCheck size={12} aria-hidden="true" />
                Protected by Google reCAPTCHA v3
              </span>

              {message && (
                <p
                  role="status"
                  className={`text-[11px] font-semibold ${
                    message.kind === 'ok' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {message.text}
                </p>
              )}
            </div>
          </div>

          {/* The reviews */}
          {reviews.length === 0 ? (
            <p className="text-sm text-stone-500">No reviews yet. Be the first to rate this volume.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="border-b border-stone-200/80 pb-4 last:border-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars value={review.rating} size={13} />
                    <span className="font-mono text-[11px] font-semibold text-stone-700">
                      {authorName(review)}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{review.comment}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default LibraryRating;
