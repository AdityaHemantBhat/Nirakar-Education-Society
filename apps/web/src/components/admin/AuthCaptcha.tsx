import React, { useRef } from 'react';
import { ReCaptchaProvider, useReCaptcha } from '@wojtekmaj/react-recaptcha-v3';
import { ShieldCheck } from 'lucide-react';

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

/**
 * How long to wait for Google's script to arrive before giving up.
 */
const LOAD_TIMEOUT_MS = 15_000;
const POLL_INTERVAL_MS = 100;

/**
 * Waits for the reCAPTCHA script to finish loading.
 *
 * The script is fetched after the page has loaded, so a reader who taps
 * "Sign in" straight away can beat it. Rather than telling them to try
 * again, the request waits for the script — for a moment — and then goes
 * ahead.
 *
 * The wait reports whether the script is merely slow or has not arrived at
 * all, so that the message the reader sees is the true one.
 */
async function waitForCaptcha(
  read: () => ((action?: string) => Promise<string> | null) | undefined,
): Promise<
  | { ready: true; execute: (action?: string) => Promise<string> | null }
  | { ready: false; reason: 'timeout' | 'unavailable' }
> {
  const started = Date.now();

  while (Date.now() - started < LOAD_TIMEOUT_MS) {
    const execute = read();
    if (execute) return { ready: true, execute };

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  /* If Google's script never arrived at all — a blocked network, an
     extension, or an ad blocker — that is a different problem from a
     slow load, and the reader is told so. */
  const scriptArrived = typeof window !== 'undefined' && 'grecaptcha' in window;
  return { ready: false, reason: scriptArrived ? 'timeout' : 'unavailable' };
}

/**
 * A single reCAPTCHA provider for the whole application.
 *
 * The upstream library tears the global reCAPTCHA instance down whenever its
 * last provider unmounts, which wipes `window.grecaptcha` while a token
 * request may still be in flight. That surfaces in the console as
 * "Uncaught (in promise) Error: reCAPTCHA TypeError" and fails the sign-in.
 *
 * The provider is therefore mounted once, for the whole session, rather than
 * being brought up and taken down per route. That avoids the race entirely
 * and means a second provider elsewhere in the tree can never tear the
 * shared one down.
 *
 * It is mounted for every route, and not only the ones that need a token,
 * because the sign-in page can be moved to any address — and a provider
 * that is switched on by route would leave the moved page with no
 * protection at all.
 */
export const AuthCaptchaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!siteKey) return <>{children}</>;

  return <ReCaptchaProvider reCaptchaKey={siteKey}>{children}</ReCaptchaProvider>;
};

/**
 * Lets a descendant request the application-wide reCAPTCHA provider without
 * mounting a second one. The provider is always mounted now, so this is a
 * no-op that is kept for the components that still call it.
 */

export function useAuthCaptcha() {
  const { executeRecaptcha } = useReCaptcha();

  /* The context value changes once Google's script has loaded. The
     reference is kept current on every render, so the wait below always
     sees the latest function rather than the one that was missing when
     the request started. */
  const executeRef = useRef(executeRecaptcha);
  executeRef.current = executeRecaptcha;

  return async (action: string): Promise<string> => {
    if (!siteKey) throw new Error('Security verification is not configured. Please try again later.');

    const captcha = await waitForCaptcha(() => executeRef.current);
    if (!captcha.ready) {
      throw new Error(
        captcha.reason === 'unavailable'
          ? 'Security verification could not be reached. Check your connection and try again.'
          : 'Security verification is taking too long. Please try again.',
      );
    }
    const execute = captcha.execute;

    try {
      const token = await execute(action);
      if (!token) throw new Error('Security verification failed. Please try again.');
      return token;
    } catch (err: any) {
      /* Google's script throws a bare "reCAPTCHA <reason>" error when the
         global instance is torn down mid-request. Report it as a retryable
         message rather than letting it surface as an unhandled rejection. */
      const message = err instanceof Error ? err.message : String(err ?? '');
      if (/recaptcha/i.test(message)) {
        throw new Error('Security verification failed. Please try again.');
      }
      throw err;
    }
  };
}

export const AuthCaptchaNotice: React.FC<{ className?: string }> = ({ className = '' }) => (
  <p className={`flex items-center justify-center gap-1.5 text-[11px] ${className} ${
    siteKey ? 'text-stone-500' : 'text-rose-400'
  }`}>
    <ShieldCheck size={14} aria-hidden="true" />
    {siteKey ? 'Protected by Google reCAPTCHA v3' : 'Security verification is unavailable'}
  </p>
);
