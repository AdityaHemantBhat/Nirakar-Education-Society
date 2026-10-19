import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../tokens.js';
import { Menu as MenuIcon, X, User, ChevronDown } from 'lucide-react';

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
              d={
                isScrolled
                  ? 'M0,0 L1440,0 L1440,80 Q720,85 0,80 Z'
                  : 'M0,0 L1440,0 L1440,84 C920,84 840,84 790,84 C760,84 750,100 720,100 C690,100 680,84 650,84 C600,84 520,84 0,84 Z'
              }
            />
          </svg>
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
          {/* Left Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-end pr-14">
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
                Shree Nirakar
              </span>
            </a>
          </div>

          {/* Right Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-start pl-14">
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

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-ink hover:bg-stone-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
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
