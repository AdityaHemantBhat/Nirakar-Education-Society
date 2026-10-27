import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';

export const DataRightsPage: React.FC = () => {
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/v1/privacy/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || 'Unable to submit your request.');
      setReference(payload?.data?.reference ?? '');
      event.currentTarget.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] text-stone-900">
      <Helmet><title>My Data Rights | Shree Nirakar Education Society</title></Helmet>
      <Navbar />
      <header className="w-full bg-[#0b132b] text-white lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        <HeroWaves opacity={0.85} />
        <div className="relative z-10 mx-auto w-full max-w-6xl space-y-4 text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Privacy and personal information</p>
          <h1 className="mt-3 font-serif text-3xl font-black sm:text-5xl">My Data Rights</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-stone-200">Use this form to request access to, correction of, or erasure of personal information, or to raise a privacy concern. We may need to verify your identity before acting. Requests involving a child should be submitted by a parent or lawful guardian.</p>
        </div>
      </header>
      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />
      <main className="w-full flex-1 px-4 py-10 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
              {reference && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">Your request was received and recorded. Reference: <strong>{reference}</strong>. Keep this reference for any follow-up. A response timeline and privacy contact have not been published here; this form does not confirm identity or guarantee a statutory response period.</div>}
              <p className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed text-stone-600">Use this form to submit a request for review by authorized staff. Do not include Aadhaar numbers or other unnecessary sensitive identifiers. No separate privacy contact email or response timeline is published here. We may need to verify your identity before acting; submitting this form does not itself verify identity or guarantee a statutory response timeline.</p>
              <div>
                <label htmlFor="rights-name" className="mb-1.5 block text-xs font-serif font-bold uppercase tracking-wider text-stone-600">Your name</label>
                <input id="rights-name" name="name" required minLength={2} maxLength={120} autoComplete="name" className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none" />
              </div>
              <div>
                <label htmlFor="rights-email" className="mb-1.5 block text-xs font-serif font-bold uppercase tracking-wider text-stone-600">Email address</label>
                <input id="rights-email" name="email" type="email" required maxLength={254} autoComplete="email" className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none" />
              </div>
              <div>
                <label htmlFor="rights-type" className="mb-1.5 block text-xs font-serif font-bold uppercase tracking-wider text-stone-600">Request type</label>
                <select id="rights-type" name="requestType" required className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none">
                  <option value="ACCESS">Access / summary</option><option value="CORRECTION">Correction or update</option><option value="ERASURE">Erasure</option><option value="NOMINATION">Nomination</option><option value="GRIEVANCE">Privacy grievance</option>
                </select>
              </div>
              <div>
                <label htmlFor="rights-details" className="mb-1.5 block text-xs font-serif font-bold uppercase tracking-wider text-stone-600">What do you need help with?</label>
                <textarea id="rights-details" name="details" required minLength={10} maxLength={3000} rows={5} className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none" />
              </div>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-xl bg-[#111b5e] px-6 py-3.5 font-serif text-sm font-bold text-white transition-colors hover:bg-[#0b132b] disabled:opacity-60">{loading ? 'Submitting…' : 'Submit request'}</button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};
