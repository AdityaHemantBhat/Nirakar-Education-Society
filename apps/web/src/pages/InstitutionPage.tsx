import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, useReducedMotion } from 'framer-motion';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { Award, BookOpen, ChevronRight, GraduationCap, Image as ImageIcon, MapPin, ShieldCheck, User } from 'lucide-react';

type Committee = { id: string; name: string; description?: string | null; members: Array<{ id: string; name: string; designation: string; role: string; photoUrl?: string | null }> };
type InstitutionProfile = { commitments?: string; infrastructure?: string[]; rules?: string[]; admissions?: string[]; courses?: string[]; activities?: string[] };
type Institution = { id: string; code: string; name: string; slug: string; tagline: string; history?: string | null; vision?: string | null; bannerUrl?: string | null; profile?: InstitutionProfile; committees?: Committee[] };
type Faculty = { id: string; name?: string; designation?: string; department?: string; qualification?: string; experience?: string; photoUrl?: string | null };

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

export const InstitutionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'faculty' | 'committees' | 'heritage'>('overview');
  const [bannerLoadFailed, setBannerLoadFailed] = useState(false);
  const reducedMotion = useReducedMotion();

  const institutionQuery = useQuery<Institution>({
    queryKey: ['institution', slug],
    queryFn: async () => {
      const res = await fetch(`/api/v1/content/institutions/${encodeURIComponent(slug || '')}`);
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error?.message || `Institution request failed (${res.status})`);
      if (!payload?.data) throw new Error('Institution record was not returned by the API.');
      return payload.data;
    },
    enabled: Boolean(slug),
  });
  const inst = institutionQuery.data;
  React.useEffect(() => setBannerLoadFailed(false), [inst?.bannerUrl]);
  const facultyQuery = useQuery<Faculty[]>({
    queryKey: ['institutionFaculty', inst?.code],
    queryFn: async () => {
      const res = await fetch(`/api/v1/faculty?institutionCode=${encodeURIComponent(inst!.code)}`);
      if (!res.ok) throw new Error('Faculty could not be loaded.');
      const data = (await res.json()).data;
      return Array.isArray(data) ? data.map((item: any) => {
        const toggles = item.publicContactToggles || {};
        const name = item.name || toggles.name || toggles.fullName ||
          (toggles.firstName && toggles.lastName ? `${toggles.firstName} ${toggles.lastName}` : '') ||
          item.user?.username || '';
        return { ...item, name } as Faculty;
      }) : [];
    },
    enabled: Boolean(inst?.code),
  });
  const faculty = useMemo(() => facultyQuery.data || [], [facultyQuery.data]);
  const committees = inst?.committees || [];
  const profile = inst?.profile || {};
  const profileSections = [
    ['Commitments', typeof profile.commitments === 'string' ? profile.commitments.split(/\n+/).filter(Boolean) : []],
    ['Infrastructure', Array.isArray(profile.infrastructure) ? profile.infrastructure : []],
    ['Rules & regulations', Array.isArray(profile.rules) ? profile.rules : []],
    ['Admission policy', Array.isArray(profile.admissions) ? profile.admissions : []],
    ['Courses of study', Array.isArray(profile.courses) ? profile.courses : []],
    ['Key features & activities', Array.isArray(profile.activities) ? profile.activities : []],
  ] as const;
  const hasProfileSections = profileSections.some(([, items]) => items.length > 0);

  if (institutionQuery.isLoading) return <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" /></div>;
  if (institutionQuery.isError || !inst) return <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center gap-4 p-6 text-center"><h1 className="font-serif text-3xl font-bold text-[#111b5e]">School profile unavailable</h1><p className="max-w-xl text-stone-600">{institutionQuery.error instanceof Error ? institutionQuery.error.message : 'This school profile could not be loaded. Please try again later.'}</p><div className="flex flex-wrap justify-center gap-3"><button onClick={() => void institutionQuery.refetch()} className="rounded-full bg-[#111b5e] px-5 py-2.5 text-sm font-semibold text-white">Try again</button><Link to="/institutions" className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700">Explore institutions</Link></div></div>;

  const tabs = [
    ['overview', 'Our Story'], ['faculty', `Faculty Directory (${faculty.length})`], ['committees', `Committees (${committees.length})`], ['heritage', 'Heritage & Photos'],
  ] as const;
  return <>
    <Helmet><title>{inst.name} | Shri Nirakar Education Society</title><meta name="description" content={inst.tagline || inst.history || ''} /></Helmet>
    <Navbar />
    <main className="min-h-screen bg-[#FAF7F2] pb-20 font-sans">
      <section className="relative isolate overflow-hidden bg-[#0b132b] px-4 pb-20 pt-12 text-white sm:px-8 lg:-mt-[78px] lg:px-12 lg:pb-24 lg:pt-36">
        {inst.bannerUrl && !bannerLoadFailed && <div className="absolute inset-0 z-0" aria-hidden="true"><img src={inst.bannerUrl} alt="" onError={() => setBannerLoadFailed(true)} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#0b132b]/80 via-[#0b132b]/55 to-[#0b132b]/35" /></div>}
        <HeroWaves opacity={0.8} className="z-[1]" />
        <motion.div initial={reducedMotion ? false : 'hidden'} animate="visible" variants={fadeUp} transition={{ duration: .65 }} className="relative z-10 mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.18em] text-amber-300">
            <MapPin size={13} />{' '}
            {inst.code === 'NIRAKAR_HS' || inst.slug === 'nirakar-high-school'
              ? 'Mashem, Goa'
              : inst.code === 'ANGLE_HSS' || inst.slug === 'angle-higher-secondary'
              ? 'Dapot, Goa'
              : inst.code === 'TUDAL_HS' || inst.slug === 'tudal-high-school'
              ? 'Gaondongrem, Goa'
              : 'Canacona, Goa'}
          </span>
          <h1 className="mt-6 font-serif text-4xl font-black tracking-tight sm:text-6xl">{inst.name}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-stone-200 sm:text-xl">{inst.tagline}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3"><a href="#school-profile" className="rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-[#111b5e]">Explore the school</a><Link to={`/faculty?campus=${encodeURIComponent(inst.code)}`} className="rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Meet our faculty</Link></div>
        </motion.div>
      </section>
      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />
      <div id="school-profile" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="-mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[[String(faculty.length), 'Published faculty'], [String(committees.length), 'Committees'], [String(profileSections.filter(([, items]) => items.length > 0).length), 'Profile sections']].map(([value, label]) => <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-sm"><p className="font-serif text-2xl font-black text-[#111b5e]">{value}</p><p className="mt-1 text-[11px] font-semibold text-stone-500">{label}</p></div>)}
        </div>
        <div className="mt-10 flex gap-2 overflow-x-auto border-b border-stone-200 pb-3" role="tablist" aria-label="School profile sections">{tabs.map(([id, label]) => <button key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition ${activeTab === id ? 'bg-[#111b5e] text-white shadow' : 'text-stone-600 hover:bg-stone-100'}`}>{label}</button>)}</div>

        {activeTab === 'overview' && <motion.div initial={reducedMotion ? false : 'hidden'} animate="visible" variants={fadeUp} className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
          <article className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10"><div className="flex items-center gap-3 text-[#111b5e]"><BookOpen size={22} /><h2 className="font-serif text-2xl font-bold">A century of learning</h2></div><div className="mt-6 space-y-4 text-[15px] leading-8 text-stone-700">{(inst.history || '').split(/(?<=[.!?])\s+/).reduce<string[][]>((chunks, sentence, index) => { const chunk = Math.floor(index / 3); (chunks[chunk] ||= []).push(sentence); return chunks; }, []).map((paragraph, index) => <p key={index}>{paragraph.join(' ')}</p>)}</div></article>
          <div className="space-y-6"><article className="rounded-3xl bg-[#111b5e] p-7 text-white shadow-sm"><div className="flex items-center gap-3 text-amber-300"><Award size={22} /><h2 className="font-serif text-2xl font-bold">Our vision</h2></div><p className="mt-5 leading-7 text-stone-200">{inst.vision}</p></article>{profile.commitments && <article className="rounded-3xl border border-amber-200 bg-amber-50 p-7"><div className="flex items-center gap-3 text-[#111b5e]"><ShieldCheck size={22} /><h2 className="font-serif text-xl font-bold">We are committed to</h2></div><div className="mt-4 space-y-3 text-sm leading-7 text-stone-700">{String(profile.commitments).split(/\n+/).filter(Boolean).map((paragraph: string, index: number) => <p key={index}>{paragraph}</p>)}</div></article>}</div>
        </motion.div>}
        {activeTab === 'overview' && hasProfileSections && <section className="mt-12 grid gap-5 md:grid-cols-2">{profileSections.filter(([, items]) => items.length > 0).map(([title, items]) => <article key={title} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"><h2 className="font-serif text-xl font-bold text-[#111b5e]">{title}</h2><ul className="mt-4 space-y-2 text-sm leading-6 text-stone-700">{items.map((item, index) => <li key={index} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"/><span>{item}</span></li>)}</ul></article>)}</section>}

        {activeTab === 'faculty' && <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-amber-700">Live directory</p><h2 className="mt-2 font-serif text-3xl font-bold text-[#111b5e]">The people who teach and guide</h2></div><Link to={`/faculty?campus=${encodeURIComponent(inst.code)}`} className="hidden items-center gap-1 text-sm font-bold text-[#111b5e] sm:flex">Full directory <ChevronRight size={16} /></Link></div>{facultyQuery.isLoading ? <div className="mt-8 rounded-3xl bg-white p-12 text-center text-stone-500">Loading published faculty…</div> : facultyQuery.isError ? <div className="mt-8 rounded-3xl bg-white p-12 text-center text-stone-500">Faculty directory is temporarily unavailable.</div> : faculty.length === 0 ? <div className="mt-8 rounded-3xl bg-white p-12 text-center text-stone-500">No published faculty profiles are available yet.</div> : <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">{faculty.map((f) => <motion.article whileHover={reducedMotion ? undefined : { y: -5 }} key={f.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"><div className="h-48 bg-stone-100">{f.photoUrl ? <img src={f.photoUrl} alt={f.name || 'Faculty member'} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#111b5e]"><GraduationCap size={42} /></div>}</div><div className="p-5"><h3 className="font-serif text-lg font-bold text-[#111b5e]">{f.name || 'Faculty member'}</h3><p className="mt-1 text-sm font-semibold text-amber-700">{f.designation || 'Teaching faculty'}</p><p className="mt-3 text-xs leading-5 text-stone-500">{[f.department, f.qualification].filter(Boolean).join(' · ')}</p></div></motion.article>)}</div>}</section>}

        {activeTab === 'committees' && <section className="mt-10 space-y-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-700">Stewardship & Governance</p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#111b5e]">The people behind the school</h2>
            <p className="mt-3 text-stone-600 leading-relaxed">Management and community records that guide and uphold {inst.name}.</p>
          </div>

          <div className="space-y-8">
            {committees.map((committee) => (
              <article key={committee.id} className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 lg:p-10 shadow-sm transition-all">
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 border-b border-stone-200/80 pb-5">
                  <div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 mb-2">
                      Committee
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#111b5e] tracking-tight">{committee.name}</h3>
                  </div>
                  {committee.description && (
                    <p className="max-w-xl text-sm leading-relaxed text-stone-600 md:text-right">{committee.description}</p>
                  )}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {committee.members.map((member) => (
                    <div key={member.id} className="group flex items-center gap-3.5 rounded-2xl border border-stone-100 bg-[#FAF7F2]/60 p-3.5 transition-all hover:border-amber-400/40 hover:bg-white hover:shadow-sm">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="h-12 w-12 shrink-0 rounded-full object-cover border border-amber-500/25 shadow-2xs group-hover:scale-105 transition-transform"
                          onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-400 border border-stone-200 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                          <User size={20} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-stone-800 truncate" title={member.name}>{member.name}</p>
                        <p className="text-xs font-semibold text-amber-800/90 truncate mt-0.5">{member.designation}</p>
                        {member.role && member.role !== member.designation && (
                          <p className="text-[11px] text-stone-500 truncate">{member.role}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>}

        {activeTab === 'heritage' && <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm"><ImageIcon size={42} className="mx-auto text-[#111b5e]" /><h2 className="mt-4 font-serif text-3xl font-bold text-[#111b5e]">A living heritage</h2><p className="mx-auto mt-3 max-w-xl leading-7 text-stone-600">Explore the society’s archival stories, campus moments, and batch memories as they are added to the public archive.</p><Link to="/batch-photos" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#111b5e] px-5 py-3 text-sm font-bold text-white">View heritage archive <ChevronRight size={16} /></Link></section>}
      </div>
    </main><Footer />
  </>;
};
