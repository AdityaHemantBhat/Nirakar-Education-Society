import React from 'react';
import { ReCaptchaProvider, useReCaptcha } from '@wojtekmaj/react-recaptcha-v3';
import { useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const AuthCaptchaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const needsCaptcha = ['/login', '/faculty/login'].includes(pathname);

  return siteKey && needsCaptcha ? (
    <ReCaptchaProvider reCaptchaKey={siteKey}>{children}</ReCaptchaProvider>
  ) : (
    <>{children}</>
  );
};

export function useAuthCaptcha() {
  const { executeRecaptcha } = useReCaptcha();

  return async (action: string) => {
    if (!siteKey) throw new Error('Security verification is not configured. Please try again later.');
    if (!executeRecaptcha) throw new Error('Security verification is loading. Please try again.');
    return executeRecaptcha(action);
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
