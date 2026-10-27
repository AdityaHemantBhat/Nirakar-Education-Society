import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { SectionEdge } from '../components/SectionEdge.js';

export const GrievanceRedressalPage: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [trackingSecret, setTrackingSecret] = useState('');
  const [trackingMessage, setTrackingMessage] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const submitGrievance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSubmitting(true); setSubmitError('');
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch('/api/v1/privacy/grievances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.get('name'), email: form.get('email'), category: form.get('category'), subject: form.get('subject'), description: form.get('description') }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || 'Unable to submit grievance.');
      setSubmission(payload.data); event.currentTarget.reset();
    } catch (error) { setSubmitError(error instanceof Error ? error.message : 'Unable to submit grievance.'); }
    finally { setSubmitting(false); }
  };

  const trackGrievance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setTrackingMessage(''); setTrackingResult(null);
    try {
      const response = await fetch('/api/v1/privacy/grievances/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference: trackingId, trackingCode: trackingSecret }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || 'Tracking details were not recognized.');
      setTrackingResult(payload.data);
    } catch (error) { setTrackingMessage(error instanceof Error ? error.message : 'Unable to retrieve tracking information.'); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] text-stone-900">
      <Helmet><title>Grievance Redressal | Shree Nirakar Education Society</title></Helmet>
      <Navbar />
      <header className="w-full bg-[#0b132b] text-white lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        <HeroWaves opacity={0.85} />
        <div className="relative z-10 mx-auto w-full max-w-6xl space-y-4 text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Support and accountability</p>
          <h1 className="mt-3 font-serif text-3xl font-black sm:text-5xl">Grievance Redressal</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-stone-200">Submit a concern through this form, then keep the reference and private tracking code to check for updates. The Society’s responsible contact, escalation route, and response timeline are not published here. This website is not an emergency reporting service.</p>
        </div>
      </header>
      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />
      <main className="mx-auto grid w-full max-w-[1850px] flex-1 gap-6 px-4 py-10 sm:px-8 lg:grid-cols-2 lg:gap-8 lg:px-12 xl:gap-10 xl:px-16 2xl:px-24">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-serif text-xl font-bold text-[#111b5e]">Submit a grievance</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">For immediate danger or a child-safety concern, contact the appropriate local emergency or statutory authority. This website is not an emergency reporting service. Share only information needed to review the concern.</p>
          {submission ? <div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><p>Your grievance was received. Keep this page’s tracking code private.</p><p className="mt-2"><strong>Reference:</strong> {submission.reference}</p><p className="mt-1 break-all"><strong>Private tracking code (shown once):</strong> {submission.trackingCode}</p><p className="mt-2 text-xs">Save both values securely. The code cannot be retrieved if lost.</p></div> : <form onSubmit={(event) => void submitGrievance(event)} className="mt-4 space-y-3">
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-stone-700">Save the reference and private tracking code shown after submission. Do not submit Aadhaar numbers or unnecessary sensitive details. No response timeline is published for this online channel.</p>
            <input name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Your name" aria-label="Your name" className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm" />
            <input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="Email address" aria-label="Email address" className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm" />
            <select name="category" required aria-label="Grievance category" className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm"><option value="GENERAL">General concern</option><option value="ADMISSIONS">Admissions</option><option value="PRIVACY">Privacy</option><option value="SAFETY">Safety concern (restricted)</option><option value="DISCRIMINATION">Discrimination</option><option value="OTHER">Other</option></select>
            <input name="subject" required minLength={3} maxLength={180} placeholder="Subject" aria-label="Subject" className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm" />
            <textarea name="description" required minLength={10} maxLength={5000} rows={5} placeholder="Describe the concern" aria-label="Describe the concern" className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm" />
            {submitError && <p role="alert" className="text-sm text-red-700">{submitError}</p>}
            <button type="submit" disabled={submitting} className="rounded-xl bg-[#111b5e] px-5 py-3 font-serif text-sm font-bold text-white hover:bg-[#0b132b] disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit grievance'}</button>
          </form>}
        </section>
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-serif text-xl font-bold text-[#111b5e]">Track a grievance</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">Enter the reference and private tracking code provided when you submitted the grievance. A case number alone does not reveal case information.</p>
          <form onSubmit={(event) => void trackGrievance(event)} className="mt-5 space-y-4">
            <div><label htmlFor="tracking-id" className="mb-1.5 block text-xs font-serif font-bold uppercase tracking-wider text-stone-600">Tracking ID</label><input id="tracking-id" value={trackingId} onChange={(event) => setTrackingId(event.target.value)} autoComplete="off" className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none" /></div>
            <div><label htmlFor="tracking-secret" className="mb-1.5 block text-xs font-serif font-bold uppercase tracking-wider text-stone-600">Private tracking code</label><input id="tracking-secret" type="password" value={trackingSecret} onChange={(event) => setTrackingSecret(event.target.value)} autoComplete="off" className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none" /></div>
            {trackingMessage && <p role="status" className="text-sm text-amber-800">{trackingMessage}</p>}
            {trackingResult && <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm"><p><strong>{trackingResult.reference}</strong> · {trackingResult.status}</p><p className="mt-1">{trackingResult.subject}</p><ol className="mt-3 space-y-2">{trackingResult.events.map((entry: any, index: number) => <li key={`${entry.kind}-${index}`} className="border-l-2 border-stone-300 pl-3"><p className="text-[11px] text-stone-500">{entry.kind} · {new Date(entry.createdAt).toLocaleString()}</p><p>{entry.message}</p></li>)}</ol></div>}
            <button type="submit" className="rounded-xl border border-[#111b5e] px-5 py-3 font-serif text-sm font-bold text-[#111b5e] hover:bg-stone-50">Check status</button>
          </form>
        </section>
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:col-span-2 sm:p-7">
          <h2 className="font-serif text-xl font-bold text-[#111b5e]">Procedure and escalation</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-600"><li>Your submission is saved in the Society’s grievance case database and assigned a reference plus a private tracking code.</li><li>Authorized administrators can review the case, update its status, add internal notes, and post responses visible through secure tracking.</li><li>Cases involving safety are marked restricted. Confirm the responsible officer, escalation path and response timelines with the Society before relying on this workflow for urgent or statutory reporting.</li></ol>
          <p className="mt-4 text-xs text-stone-500">This online channel is not an emergency service. The Society’s contact details, escalation route, and response timeline are not published here.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};
