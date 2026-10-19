import React, { useRef, useState, useEffect } from 'react';
import { PageFlip } from 'page-flip';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  List,
  Search,
  BookOpen,
  Volume2,
  VolumeX,
  X,
  Lock,
} from 'lucide-react';

export interface PageData {
  id: string;
  pageNo: number;
  text?: string;
  imageVariants: {
    thumb?: string;
    w640?: string;
    w1024?: string;
    w1600?: string;
    zoom?: string;
  };
  blurhash?: string;
  isLockedPage?: boolean;
}

export interface TocArticle {
  id?: string;
  title: string;
  startPage: number;
  author?: string | null;
}

interface FlipbookReaderProps {
  title: string;
  publishDate: string;
  pages: PageData[];
  articles?: TocArticle[];
  isPaywalled?: boolean;
  onOpenPassSheet?: () => void;
  readerName?: string;
}

export const FlipbookReader: React.FC<FlipbookReaderProps> = ({
  title,
  publishDate,
  pages = [],
  articles = [],
  isPaywalled = false,
  onOpenPassSheet,
  readerName = 'Alumni Reader',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipbookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(pages.length);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [readerModeText, setReaderModeText] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Initialize PageFlip instance
  useEffect(() => {
    if (!containerRef.current || pages.length === 0) return;

    const isMobile = window.innerWidth < 1024;
    const width = isMobile ? Math.min(window.innerWidth - 32, 480) : 520;
    const height = isMobile ? Math.round(width * 1.41) : 735;

    try {
      const pageFlip = new PageFlip(containerRef.current, {
        width,
        height,
        size: 'stretch',
        minWidth: 320,
        maxWidth: 720,
        minHeight: 450,
        maxHeight: 1000,
        maxShadowOpacity: 0.4,
        showCover: true,
        usePortrait: isMobile,
        startPage: 0,
        drawShadow: true,
        flippingTime: 700,
        useMouseEvents: true,
      });

      pageFlip.loadFromHTML(containerRef.current.querySelectorAll('.flip-page'));

      pageFlip.on('flip', (e: any) => {
        setCurrentPage(e.data);

        // Paywall enforcement if user flips beyond preview page 2
        if (isPaywalled && e.data >= 2) {
          onOpenPassSheet?.();
        }
      });

      flipbookRef.current = pageFlip;
      setTotalPages(pageFlip.getPageCount());
    } catch (err) {
      // Graceful fallback for non-canvas environments
    }

    return () => {
      if (flipbookRef.current) {
        try {
          flipbookRef.current.destroy();
        } catch {
          // cleanup
        }
      }
    };
  }, [pages.length, isPaywalled, onOpenPassSheet]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        flipbookRef.current?.flipNext();
      } else if (e.key === 'ArrowLeft') {
        flipbookRef.current?.flipPrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel((z) => Math.min(2.0, z + 0.2));
      } else if (e.key === '-') {
        setZoomLevel((z) => Math.max(0.8, z - 0.2));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const jumpToPage = (pageNum: number) => {
    if (isPaywalled && pageNum > 2) {
      onOpenPassSheet?.();
      return;
    }
    flipbookRef.current?.flip(pageNum);
    setIsTocOpen(false);
  };

  const filteredArticles = articles.filter(
    (a) => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`relative w-full min-h-[85vh] bg-[#221c1a] text-paper flex flex-col justify-between overflow-hidden select-none ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen' : ''
      }`}
      style={{
        backgroundImage: 'radial-gradient(#3a2f2b 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Paper Reader Toolbar */}
      <div className="bg-[#181312]/90 border-b border-stone-800 px-4 py-2.5 flex items-center justify-between text-xs font-serif backdrop-blur-md z-30">
        <div className="flex items-center space-x-3">
          <a
            href="/magazine"
            className="text-stone-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">All Issues</span>
          </a>
          <span className="text-stone-600">|</span>
          <span className="font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
            {title} ({publishDate})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Table of Contents Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="p-1.5 rounded-lg text-stone-300 hover:bg-stone-800 transition-colors flex items-center gap-1"
            title="Table of Contents"
          >
            <List size={16} />
            <span className="hidden md:inline">Index</span>
          </button>

          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-1.5 rounded-lg text-stone-300 hover:bg-stone-800 transition-colors"
            title="Search In Issue"
          >
            <Search size={16} />
          </button>

          {/* Reader Mode Text Toggle */}
          <button
            type="button"
            onClick={() => setReaderModeText(!readerModeText)}
            className="p-1.5 rounded-lg text-stone-300 hover:bg-stone-800 transition-colors"
            title="Accessible Reader Mode"
          >
            <BookOpen size={16} />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-stone-300 hover:bg-stone-800 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Flipbook Stage with Paper Thickness & Desk Vignette */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Soft Warm Desk Light Vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/30 to-black/80 pointer-events-none" />

        {/* Client-side faint reader watermark overlay (Section 8 Protection) */}
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-[0.03] select-none text-2xl font-mono text-white rotate-[-25deg]">
          {readerName} • Shri Nirakar Vidhyalaya • Canacona
        </div>

        {!readerModeText ? (
          <div
            style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
            className="relative"
          >
            <div ref={containerRef} className="shadow-2xl rounded-sm">
              {pages.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flip-page bg-[#fbfaf7] text-ink overflow-hidden shadow-md border-r border-stone-300/40 relative"
                  style={{
                    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.06)',
                  }}
                >
                  {p.isLockedPage ? (
                    /* Locked Page Placeholder with Pass Trigger */
                    <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center space-y-4 bg-stone-100">
                      <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center">
                        <Lock size={28} />
                      </div>
                      <h4 className="font-serif text-lg font-bold text-ink">Supporter Pass Required</h4>
                      <p className="text-xs text-stone-600 max-w-xs">
                        Page {p.pageNo} is reserved for active supporters. Contribute from ₹10 to unlock all issues and the archive.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenPassSheet}
                        className="px-5 py-2.5 rounded-xl bg-brand-700 text-white font-serif text-xs font-bold shadow-md hover:bg-brand-800"
                      >
                        Unlock with Supporter Pass
                      </button>
                    </div>
                  ) : (
                    /* Normal Page Spread Image */
                    <div className="w-full h-full relative">
                      <img
                        src={p.imageVariants.w1024 || p.imageVariants.w640 || p.imageVariants.zoom || ''}
                        alt={`Page ${p.pageNo}`}
                        className="w-full h-full object-contain pointer-events-none"
                        loading={idx <= 3 ? 'eager' : 'lazy'}
                      />
                      {/* Subtle Page Edge Paper Curl / Shadow */}
                      <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
                      <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />

                      {/* Page number footer */}
                      <div className="absolute bottom-2 inset-x-0 text-center text-[10px] font-mono text-stone-400">
                        {p.pageNo}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Accessible Reader Mode Text View */
          <div className="max-w-2xl w-full bg-[#fbfaf7] text-ink p-8 rounded-2xl shadow-2xl overflow-y-auto max-h-[70vh] border border-stone-200">
            <h3 className="font-serif text-xl font-bold mb-4 border-b pb-2">
              Reader Mode: Page {currentPage + 1}
            </h3>
            <p className="text-sm font-sans leading-relaxed whitespace-pre-line text-stone-800">
              {pages[currentPage]?.text || 'No transcribed text available for this page.'}
            </p>
          </div>
        )}

        {/* Side Turn Arrows */}
        <button
          type="button"
          onClick={() => flipbookRef.current?.flipPrev()}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all z-30 shadow-lg"
          aria-label="Previous Page"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          type="button"
          onClick={() => flipbookRef.current?.flipNext()}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all z-30 shadow-lg"
          aria-label="Next Page"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Table of Contents Drawer */}
      {isTocOpen && (
        <div className="absolute left-0 inset-y-0 w-80 bg-[#1e1715] text-paper border-r border-stone-800 z-40 p-6 flex flex-col justify-between shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <List size={16} className="text-accent-400" />
                <span>Table of Contents</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsTocOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[60vh]">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((art, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => jumpToPage(art.startPage - 1)}
                    className="w-full text-left p-3 rounded-xl hover:bg-stone-800/80 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-serif text-sm font-semibold text-stone-200 group-hover:text-accent-300">
                        {art.title}
                      </div>
                      {art.author && (
                        <div className="text-xs text-stone-400 font-sans">{art.author}</div>
                      )}
                    </div>
                    <span className="font-mono text-xs text-accent-500 font-bold shrink-0">
                      p. {art.startPage}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-stone-400">No indexed sections found.</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-800 text-[11px] font-mono text-stone-400">
            Shri Nirakar Daily Magazine • Shri Nirakar High School Archives
          </div>
        </div>
      )}

      {/* Bottom Status & Page Navigation Bar */}
      <div className="bg-[#181312]/95 border-t border-stone-800 px-6 py-3 flex items-center justify-between text-xs font-mono text-stone-300 z-30">
        <div className="flex items-center space-x-2">
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          {isPaywalled && (
            <span className="text-[10px] text-accent-400 font-bold px-2 py-0.5 rounded bg-accent-950/60 border border-accent-800/60">
              Preview Mode
            </span>
          )}
        </div>

        {/* Thumbnail Quick Strip */}
        <div className="hidden sm:flex items-center space-x-1.5 overflow-x-auto max-w-md py-1">
          {pages.slice(0, 10).map((p, idx) => (
            <button
              key={p.id || idx}
              type="button"
              onClick={() => jumpToPage(idx)}
              className={`w-6 h-8 rounded-sm overflow-hidden border shrink-0 transition-transform ${
                currentPage === idx ? 'border-accent-400 scale-110' : 'border-stone-700 opacity-60'
              }`}
            >
              {p.imageVariants.thumb ? (
                <img src={p.imageVariants.thumb} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-stone-800 text-[8px] flex items-center justify-center">
                  {idx + 1}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
            className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span>{Math.round(zoomLevel * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
            className="p-1 rounded hover:bg-stone-800 text-stone-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
