import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ArrowUpRight,
  ExternalLink,
  ArrowUp
} from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#FAF7F2] text-stone-300 font-sans relative select-none">
      
      {/* 1. ARCHITECTURAL SVG SCULPTED CURVE TRANSITION */}
      {/* Transitions smoothly from the cream (#FAF7F2) canvas into the Deep Royal Navy (#07112c) */}
      <div className="w-full overflow-hidden leading-none -mb-px">
        <svg 
          viewBox="0 0 1440 90" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 sm:h-18 lg:h-22 block text-[#07112c]"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="footerGoldContour" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Deep Royal Navy Fill Scoop */}
          <path 
            d="M0,0 C380,80 1060,80 1440,0 L1440,90 L0,90 Z" 
            fill="currentColor" 
          />

          {/* Whispering Gold Arch Accent */}
          <path 
            d="M0,0 C380,80 1060,80 1440,0" 
            stroke="url(#footerGoldContour)" 
            strokeWidth="1.5" 
            fill="none" 
          />
        </svg>
      </div>

      <div className="w-full bg-[#07112c] pt-10 sm:pt-14 pb-14 px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20 2xl:px-28">
        
        {/* TOP EDITORIAL SPREAD: Pure Typography, Wide Hierarchy, Zero Box Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pb-16 border-b border-white/[0.08]">
          
          {/* Left: Monumental Society Statement */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <img 
                src="/images/Logo.webp" 
                alt="Shree Nirakar Education Society" 
                className="w-12 h-12 object-contain shrink-0"
              />
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                  Mashem • Gaondongrem • Dapot, Canacona
                </span>
                <span className="text-xs text-stone-400 font-serif">
                  Estd. 1939 • Registered Society No. 128
                </span>
              </div>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
              Shree Nirakar Education Society
            </h3>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
              Dedicated to rural empowerment, academic excellence, scientific innovation, and moral character for the youth of Canacona, South Goa across three historic campuses.
            </p>

            <div className="pt-2 text-xs text-amber-400/90 font-serif font-bold tracking-wide">
              <span>विद्या परं दैवतम् • Knowledge is the Supreme Deity</span>
            </div>
          </div>

          {/* Right: Direct Contacts & Campus Central Line */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:pl-6">
            <div className="space-y-4">
              <div className="text-xs uppercase font-mono tracking-widest text-stone-400 font-bold">
                Central Administrative Secretariat
              </div>
              
              <div className="space-y-3 text-sm text-stone-300 font-sans">
                <a 
                  href="tel:+918322643232" 
                  className="flex items-center gap-3 hover:text-white transition-colors group"
                >
                  <Phone size={15} className="text-amber-400 shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Helpline: +91 832 2643232
                  </span>
                </a>

                <a 
                  href="mailto:info@nirakar.org" 
                  className="flex items-center gap-3 hover:text-white transition-colors group"
                >
                  <Mail size={15} className="text-amber-400 shrink-0" />
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    info@nirakar.org
                  </span>
                </a>

                <div className="flex items-start gap-3 text-stone-400">
                  <MapPin size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Mashem, Canacona, South Goa, Goa 403728, India
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Portals Ribbon (Clean Text Links with Underline Effects) */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2">
              <a 
                href="/contact" 
                className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 group font-bold"
              >
                <span>Enrollment 2026–27</span>
                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <span className="text-white/20">•</span>
              <a 
                href="/faculty" 
                className="hover:text-white transition-colors"
              >
                Faculty Portal
              </a>
              <span className="text-white/20">•</span>
              <a 
                href="/magazine" 
                className="hover:text-white transition-colors"
              >
                Daily Magazine
              </a>
              <span className="text-white/20">•</span>
              <a 
                href="/alumni" 
                className="hover:text-white transition-colors"
              >
                Alumni Sanctuary
              </a>
            </div>
          </div>

        </div>

        {/* 3. MINIMALIST 4-COLUMN INSTITUTIONAL DIRECTORY (Zero Boxes, Pure Typography) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 py-14 border-b border-white/[0.08] text-xs">
          
          {/* Column 1: Three Campuses */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              Institutions
            </h4>
            <ul className="space-y-2 text-stone-400 font-sans">
              <li>
                <a href="/institutions/nirakar-high-school" className="hover:text-white transition-colors block">
                  Shri Nirakar High School, Mashem
                </a>
                <a href="https://maps.app.goo.gl/bvkukHjw9TVyw1WH6?g_st=aw" target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300">
                  Directions <ArrowUpRight size={12} />
                </a>
              </li>
              <li>
                <a href="/institutions/tudal-high-school" className="hover:text-white transition-colors block">
                  Tudal High School, Gaondongrem
                </a>
                <a href="https://maps.app.goo.gl/UigQTdh1Skaxc8SJ8?g_st=aw" target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300">
                  Directions <ArrowUpRight size={12} />
                </a>
              </li>
              <li>
                <a href="/institutions/angle-higher-secondary" className="hover:text-white transition-colors block">
                  S. S. Angle HSSC, Dapot
                </a>
                <a href="https://maps.app.goo.gl/AqxNosipxGN5d5828?g_st=aw" target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300">
                  Directions <ArrowUpRight size={12} />
                </a>
              </li>
              <li>
                <a href="/faculty" className="hover:text-white transition-colors block">
                  Teaching Faculty Directory
                </a>
              </li>
              <li>
                <a href="/batch-photos" className="hover:text-white transition-colors block">
                  Historical Batch Photos (1968–Present)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Academics */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              Academics
            </h4>
            <ul className="space-y-2 text-stone-400 font-sans">
              <li>
                <a href="/academics" className="hover:text-white transition-colors block">
                  Secondary Curriculum (Std V–X)
                </a>
              </li>
              <li>
                <a href="/academics#hssc" className="hover:text-white transition-colors block">
                  HSSC Streams: Science, Arts, Commerce
                </a>
              </li>
              <li>
                <a href="/academics#calendar" className="hover:text-white transition-colors block">
                  Academic Calendar 2026–27
                </a>
              </li>
              <li>
                <a href="/notices" className="hover:text-white transition-colors block">
                  Goa Board Examination Circulars
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors block">
                  Admissions & Enrollment Office
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Sanctuary & Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              Sanctuary
            </h4>
            <ul className="space-y-2 text-stone-400 font-sans">
              <li>
                <a href="/alumni" className="hover:text-white transition-colors block">
                  Verified Alumni Directory
                </a>
              </li>
              <li>
                <a href="/alumni/register" className="hover:text-white transition-colors block">
                  Register as Alumni Member
                </a>
              </li>
              <li>
                <a href="/account/login" className="hover:text-white transition-colors block">
                  Alumni Portal Login
                </a>
              </li>
              <li>
                <a href="/alumni#achievers" className="hover:text-white transition-colors block">
                  Distinguished Achievers
                </a>
              </li>
              <li>
                <a href="/pass" className="hover:text-white transition-colors block">
                  Supporter Pass Contribution
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Publications & Media */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              Publications
            </h4>
            <ul className="space-y-2 text-stone-400 font-sans">
              <li>
                <a href="/magazine" className="hover:text-white transition-colors block">
                  Shri Nirakar Daily Magazine
                </a>
              </li>
              <li>
                <a href="/events" className="hover:text-white transition-colors block">
                  Annual Sports & Cultural Utsavs
                </a>
              </li>
              <li>
                <a href="/gallery" className="hover:text-white transition-colors block">
                  Campus Moments & Activity Photos
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/NirakarVidyalay/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Facebook</span>
                  <ExternalLink size={10} />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/nirakarvidyalay/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Instagram</span>
                  <ExternalLink size={10} />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* 4. GOVERNMENT ACCREDITATIONS (Single-Line Minimalist Text) */}
        <div className="py-6 border-b border-white/[0.08] text-[11px] text-stone-400 font-sans flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>Recognised by Directorate of Education, Government of Goa</span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span>Affiliated to Goa Board of Secondary & Higher Secondary Education (GBSHSE)</span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span>Societies Registration Act 1860 No. 128</span>
          </div>

          <button
            onClick={scrollToTop}
            type="button"
            className="hover:text-white text-stone-400 transition-colors inline-flex items-center gap-1 font-mono text-xs cursor-pointer group"
          >
            <span>Back to top</span>
            <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform text-amber-400" />
          </button>
        </div>

        {/* 5. MINIMAL BOTTOM BAR: Legal, Rights, DPDP Act */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-stone-400 text-xs gap-4 font-sans">
          <div>
            © {new Date().getFullYear()} Shree Nirakar Education Society, Mashem, Canacona, South Goa. All rights reserved.
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-white/20">•</span>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Use</a>
            <span className="text-white/20">•</span>
            <a href="/dpdp" className="hover:text-white transition-colors">DPDP Act 2023</a>
            <span className="text-white/20">•</span>
            <a href="/contact" className="hover:text-white transition-colors">Grievance Desk</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
