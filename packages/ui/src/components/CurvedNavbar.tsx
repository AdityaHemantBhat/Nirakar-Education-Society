import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../tokens.js';
import { User, ChevronDown } from 'lucide-react';

export interface NavItem {
  label: string;
  url: string;
  children?: { label: string; url: string; description?: string }[];
}

interface CurvedNavbarProps {
  navItems?: NavItem[];
  currentPath?: string;
  user?: { username: string; role: string } | null;
  logoUrl?: string;
}

const DEFAULT_NAV: NavItem[] = [
  {
    label: 'Society',
    url: '/society',
    children: [
      { label: 'Vision & Mission', url: '/society/vision', description: 'Our guiding principles since 1968' },
      { label: 'Founders & History', url: '/society/history', description: 'Heritage and pioneering educators' },
      { label: 'Governing Committee', url: '/society/committee', description: 'Leadership and administration' },
      { label: 'Honours & Awards', url: '/society/honours', description: 'Institutional recognition' },
    ],
  },
  {
    label: 'Institutions',
    url: '/institutions',
    children: [
      { label: 'Shri Nirakar High School', url: '/institutions/nirakar-high-school', description: 'Secondary school, Mashem' },
      { label: 'Tudal High School', url: '/institutions/tudal-high-school', description: 'Rural talent, Gaodongrem' },
      { label: 'S. S. Angle HSS', url: '/institutions/angle-higher-secondary', description: 'Arts, Science & Commerce' },
    ],
  },
  { label: 'Academics', url: '/academics' },
  { label: 'Alumni', url: '/alumni' },
  { label: 'Patrika', url: '/patrika' },
  { label: 'Notices', url: '/notices' },
  { label: 'Contact', url: '/contact' },
];

export const CurvedNavbar: React.FC<CurvedNavbarProps> = ({
  navItems = DEFAULT_NAV,
  currentPath = '/',
  user,
  logoUrl = '/logo.png',
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Slim Academic Utility Bar */}
      <div className="bg-ink text-paper text-xs py-1.5 px-4 sm:px-8 border-b border-stone-800 hidden md:flex justify-between items-center z-50 relative">
        <div className="flex items-center space-x-6">
          <span className="text-stone-300 font-sans">Canacona, South Goa, India</span>
          <span className="text-stone-400">|</span>
          <a href="tel:+918322643232" className="text-stone-300 hover:text-accent-400 transition-colors">
            +91 832 2643232
          </a>
        </div>
        <div className="flex items-center space-x-5">
          <a
            href="/alumni/register"
            className="text-accent-400 hover:text-accent-300 font-medium transition-colors"
          >
            Register as Alumni
          </a>
          <span className="text-stone-600">|</span>
          {user ? (
            <a href="/account" className="flex items-center gap-1.5 text-stone-200 hover:text-white">
              <User size={13} />
              <span>{user.username}</span>
            </a>
          ) : (
            <a href="/account/login" className="text-stone-300 hover:text-white">
              Alumni Login
            </a>
          )}
        </div>
      </div>

      {/* Main Sticky Curved Header */}
      <header
        className={cn(
          'sticky top-0 w-full z-40 transition-all duration-300',
          isScrolled ? 'py-1 shadow-lg' : 'py-3'
        )}
      >
        {/* Background container with dynamic SVG Curved Dip */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            className="w-full h-full fill-paper stroke-stone-200/80 stroke-1 shadow-sm"
          >
            {/* Smooth SVG bottom curve with a center dip specifically shaped for the institution crest */}
            <path
              className="hidden lg:block"
              d={
                isScrolled
                  ? 'M0,0 L1440,0 L1440,80 Q720,85 0,80 Z'
                  : 'M0,0 L1440,0 L1440,84 C920,84 840,84 790,84 C760,84 750,100 720,100 C690,100 680,84 650,84 C600,84 520,84 0,84 Z'
              }
            />
            {/* Smooth, rounded curve for mobile and tablet — refined shoulders & flat valley */}
            <path
              className="lg:hidden"
              d={
                isScrolled
                  ? 'M0,0 L1440,0 L1440,74 Q720,84 0,74 Z'
                  : 'M0,0 L1440,0 L1440,82 C980,82 880,82 820,82 C770,82 740,97 720,98.5 C700,97 670,82 620,82 C540,82 340,82 0,82 Z'
              }
            />
          </svg>
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Desktop Layout (lg and above) - unchanged */}
          <div className="hidden lg:flex items-center justify-between">
            {/* Left Navigation Links */}
            <div className="flex items-center space-x-1 flex-1 justify-end pr-14">
              {navItems.slice(0, 4).map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    href={item.url}
                    className={cn(
                      'px-3.5 py-2 text-sm font-serif font-medium tracking-wide rounded-md transition-colors flex items-center gap-1',
                      currentPath.startsWith(item.url)
                        ? 'text-brand-800 font-semibold'
                        : 'text-ink-muted hover:text-brand-800'
                    )}
                  >
                    {item.label}
                    {item.children && <ChevronDown size={13} className="opacity-60" />}
                  </a>

                  {/* Dropdown Menu */}
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 mt-1 w-64 bg-paper rounded-xl shadow-xl border border-stone-200 p-2 z-50"
                    >
                      {item.children.map((sub) => (
                        <a
                          key={sub.label}
                          href={sub.url}
                          className="block px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
                        >
                          <div className="text-sm font-serif font-semibold text-ink">{sub.label}</div>
                          {sub.description && (
                            <div className="text-xs text-stone-500 font-sans mt-0.5">{sub.description}</div>
                          )}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Center Institution Crest & Identity */}
            <div className="relative shrink-0 flex flex-col items-center group">
              <a href="/" className="flex flex-col items-center focus:outline-none">
                <div
                  className={cn(
                    'rounded-full bg-white border-2 border-brand-700 shadow-md flex items-center justify-center transition-all duration-300',
                    isScrolled ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20 -mb-2'
                  )}
                >
                  {/* Crest / Logo mark */}
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-brand-50 border border-brand-200 flex flex-col items-center justify-center p-1 text-center">
                    <span className="font-serif font-bold text-brand-800 text-[9px] sm:text-[10px] leading-tight">
                      NIRAKAR
                    </span>
                    <span className="text-[7px] text-accent-700 font-medium">EST. 1968</span>
                  </div>
                </div>
                <span className="mt-1 text-center font-serif text-xs sm:text-sm font-bold text-ink tracking-tight hidden sm:block">
                  Shri Nirakar
                </span>
              </a>
            </div>

            {/* Right Navigation Links */}
            <div className="flex items-center space-x-1 flex-1 justify-start pl-14">
              {navItems.slice(4).map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  className={cn(
                    'px-3.5 py-2 text-sm font-serif font-medium tracking-wide rounded-md transition-colors',
                    currentPath.startsWith(item.url)
                      ? 'text-brand-800 font-semibold'
                      : 'text-ink-muted hover:text-brand-800'
                  )}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="/patrika"
                className="ml-3 px-4 py-1.5 rounded-full text-xs font-serif font-semibold bg-brand-700 text-white hover:bg-brand-800 shadow-sm transition-all"
              >
                Read Patrika
              </a>
            </div>
          </div>

          {/* Mobile and Tablet Layout (below lg) — premium, viewport-centered logo, modern hamburger */}
          <div className="lg:hidden flex items-center justify-between relative h-[56px] sm:h-[64px] gap-2 sm:gap-3">
            {/* Left: Institution name — truncated, never overlaps centered logo */}
            <div className="flex-1 min-w-0 flex items-center justify-start pr-2 sm:pr-3">
              <a
                href="/"
                className="font-serif text-[13px] sm:text-[15px] font-bold text-ink tracking-tight leading-none truncate max-w-[34vw] sm:max-w-[200px] inline-block py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/20 rounded-sm"
                title="Shri Nirakar Education Society"
              >
                Shri Nirakar
              </a>
            </div>

            {/* Center: Logo perfectly centered to viewport */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
              <a
                href="/"
                className="pointer-events-auto flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/20 rounded-full"
                aria-label="Shri Nirakar — Home"
              >
                <div
                  className={cn(
                    'rounded-full bg-white border-[1.5px] sm:border-2 border-brand-700 flex items-center justify-center transition-all duration-300',
                    'shadow-[0_2px_14px_rgba(15,23,42,0.09),0_1px_3px_rgba(15,23,42,0.07)]',
                    isScrolled ? 'w-[42px] h-[42px] sm:w-12 sm:h-12' : 'w-14 h-14 sm:w-[60px] sm:h-[60px]'
                  )}
                >
                  <div className="w-[36px] h-[36px] sm:w-10 sm:h-10 rounded-full bg-brand-50 border border-brand-200/70 flex flex-col items-center justify-center p-0.5 text-center">
                    <span className="font-serif font-bold text-brand-800 text-[7.5px] sm:text-[9px] leading-none tracking-wide">
                      NIRAKAR
                    </span>
                    <span className="text-[5.5px] sm:text-[7px] text-accent-700 font-semibold tracking-widest mt-[1px]">EST. 1968</span>
                  </div>
                </div>
              </a>
            </div>

            {/* Right: Modern 2026 hamburger — sleek, minimal, 44px touch target */}
            <div className="flex-1 flex items-center justify-end pl-2 sm:pl-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl text-ink hover:bg-stone-100/80 active:bg-stone-100 active:scale-[0.97] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/20 shrink-0"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                <span className="relative block w-[22px] h-[14px] sm:w-[24px] sm:h-[16px]">
                  <motion.span
                    animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute left-0 top-0 block h-[1.9px] w-[22px] sm:w-[24px] bg-ink rounded-full origin-center"
                    style={{ top: '1px' }}
                  />
                  <motion.span
                    animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.16, ease: 'easeInOut' }}
                    className="absolute left-1/2 -translate-x-1/2 block h-[1.9px] w-[16px] sm:w-[18px] bg-ink rounded-full origin-center"
                    style={{ top: '50%', marginTop: '-0.95px' }}
                  />
                  <motion.span
                    animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute left-0 bottom-0 block h-[1.9px] w-[22px] sm:w-[24px] bg-ink rounded-full origin-center"
                    style={{ bottom: '1px' }}
                  />
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* Fullscreen Curved Reveal Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, clipPath: 'ellipse(100% 0% at 50% 0%)' }}
              animate={{ opacity: 1, clipPath: 'ellipse(150% 100% at 50% 0%)' }}
              exit={{ opacity: 0, clipPath: 'ellipse(100% 0% at 50% 0%)' }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="fixed inset-0 top-[70px] bg-paper/98 backdrop-blur-md z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-4 pt-4">
                {navItems.map((item) => (
                  <div key={item.label} className="border-b border-stone-200/60 pb-3">
                    <a
                      href={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-serif font-bold text-ink block"
                    >
                      {item.label}
                    </a>
                    {item.children && (
                      <div className="pl-4 mt-2 space-y-2">
                        {item.children.map((sub) => (
                          <a
                            key={sub.label}
                            href={sub.url}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-sm text-stone-600 hover:text-brand-700 font-sans"
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-stone-200 space-y-3">
                <a
                  href="/alumni/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-3 rounded-xl bg-brand-700 text-white font-serif font-semibold"
                >
                  Register as Alumni
                </a>
                <a
                  href="/account/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-3 rounded-xl bg-stone-100 text-ink font-sans text-sm font-medium"
                >
                  Alumni & Reader Login
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
