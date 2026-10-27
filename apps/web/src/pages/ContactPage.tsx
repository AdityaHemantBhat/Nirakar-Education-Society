import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { MapPin, Phone, Mail, Send, CheckCircle2, ExternalLink } from 'lucide-react';

const CAMPUS_MAPS = [
  {
    name: 'Shri Nirakar High School',
    campus: 'Mashem',
    address: 'Mashem, Loliem, Canacona, Goa 403728',
    mapQuery: 'Nirakar High School, Mashem, Loliem, Goa 403728',
    url: 'https://maps.app.goo.gl/bvkukHjw9TVyw1WH6?g_st=aw',
  },
  {
    name: 'S. S. Angle Higher Secondary School',
    campus: 'Dapot',
    address: 'Dapotloliem, Canacona, Goa 403728',
    mapQuery: 'S S Angle Higher Secondary School, Dapotloliem, Canacona, Goa 403728',
    url: 'https://maps.app.goo.gl/AqxNosipxGN5d5828?g_st=aw',
  },
  {
    name: 'Tudal High School',
    campus: 'Gaondongrem',
    address: 'Tudal, Gaondongrem, Canacona, Goa 403702',
    mapQuery: 'Tudal High School, Tudal, Gaondongrem, Canacona, Goa 403702',
    url: 'https://maps.app.goo.gl/UigQTdh1Skaxc8SJ8?g_st=aw',
  },
];

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/content/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Could not send message. Please verify network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Shri Nirakar Education Society</title>
        <meta
          name="description"
          content="Get in touch with Shri Nirakar Education Society administration, admissions, and alumni relations in Mashem, Canacona, Goa."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-[#FAF7F2] pb-20 font-sans">
        {/* Header Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
        <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
          {/* Thread-like curve wave strips in light orange / amber */}
          <HeroWaves opacity={0.85} />

          <div className="mx-auto w-full max-w-6xl space-y-4 text-center relative z-10">
            <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block">
              Administration & Inquiries
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Connect With Shree Nirakar
            </h1>
            <p className="text-sm sm:text-base text-stone-300 font-sans max-w-xl mx-auto leading-relaxed">
              We welcome inquiries from prospective families, alumni, researchers, and community benefactors.
            </p>
          </div>
        </div>

        <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

        <div className="mx-auto mt-8 w-full max-w-[1850px] space-y-12 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Administrative contact details */}
            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800">Get in touch</span>
                <h2 className="mt-2 font-serif text-2xl font-bold text-ink">Administrative Office</h2>
                <div className="mt-6 space-y-5 text-sm font-sans text-stone-700">
                  <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-brand-700 shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold block text-ink">Campus Location</span>
                    <span>Mashem, Canacona, South Goa, 403728, India</span>
                    <a
                      href={CAMPUS_MAPS[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#16247e] hover:text-amber-800"
                    >
                      Directions to the Society office <ExternalLink size={13} />
                    </a>
                  </div>
                  </div>

                  <div className="flex items-center gap-3">
                  <Phone size={18} className="text-brand-700 shrink-0" />
                  <div>
                    <span className="font-semibold block text-ink">Telephone</span>
                    <a href="tel:+918322643232" className="hover:text-brand-700">
                      +91 832 2643232
                    </a>
                  </div>
                  </div>

                  <div className="flex items-center gap-3">
                  <Mail size={18} className="text-brand-700 shrink-0" />
                  <div>
                    <span className="font-semibold block text-ink">Official Email</span>
                    <a href="mailto:info@nirakar.org" className="hover:text-brand-700">
                      info@nirakar.org
                    </a>
                    </div>
                  </div>
                </div>
            </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8 lg:col-span-8 lg:p-10">
              <div className="mb-7">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800">We are here to help</span>
                <h2 className="mt-2 font-serif text-2xl font-bold text-ink sm:text-3xl">Send a Message</h2>
                <p className="mt-2 max-w-2xl text-sm text-stone-500 font-sans">
                  Please complete the form below. Inquiries are reviewed and answered by the administration office.
                </p>
              </div>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <p id="contact-privacy-notice" className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs leading-relaxed text-stone-600">
                    We use your details to review and respond to this inquiry. Avoid including children’s sensitive personal information unless needed for your request. See our <a href="/privacy" className="font-semibold text-[#111b5e] underline">Privacy Policy</a>. For personal-data requests, use the <a href="/data-rights" className="font-semibold text-[#111b5e] underline">Data Rights form</a>; no separate privacy contact email is published here.
                  </p>
                  <div>
                    <label className="mb-1.5 block text-xs font-serif font-bold uppercase tracking-wider text-stone-600">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      aria-describedby="contact-privacy-notice"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-serif font-bold uppercase tracking-wider text-stone-600">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-serif font-bold uppercase tracking-wider text-stone-600">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-serif font-bold uppercase tracking-wider text-stone-600">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-serif font-bold uppercase tracking-wider text-stone-600">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm focus:border-brand-700 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#111b5e] px-6 py-3.5 font-serif text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0b132b] disabled:opacity-60 sm:w-auto sm:min-w-56"
                  >
                    <Send size={16} />
                    <span>{loading ? 'Submitting...' : 'Send Inquiry'}</span>
                  </button>
                </form>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-600" />
                  <h3 className="font-serif text-xl font-bold text-ink">Thank You</h3>
                  <p className="mx-auto max-w-sm text-sm text-stone-600 font-sans">
                    Your message has been received. Our administrative team in Mashem will review and respond promptly.
                  </p>
                </div>
              )}
            </div>
          </div>

          <section aria-labelledby="campus-locations">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-800">Visit us</span>
                <h2 id="campus-locations" className="mt-2 font-serif text-2xl font-bold text-[#0b132b] sm:text-3xl">
                  Find a Campus
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-stone-600">
                Find each institution on the map or open its verified Google Maps listing for directions.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {CAMPUS_MAPS.map((campus) => {
                const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(campus.mapQuery)}&output=embed`;

                return (
                  <article key={campus.name} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <iframe
                        title={`Google Map: ${campus.name}, ${campus.campus}`}
                        src={embedUrl}
                        className="absolute inset-0 h-full w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600">
                        <MapPin size={16} className="text-amber-800" />
                        {campus.campus}
                      </span>
                      <a
                        href={campus.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#16247e] hover:text-amber-800"
                      >
                        Directions <ExternalLink size={15} />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
          </div>
      </main>

      <Footer />
    </>
  );
};
