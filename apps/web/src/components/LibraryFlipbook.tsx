import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
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
  X,
  Home,
  Info,
} from 'lucide-react';

export interface LibraryFlipPage {
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
}

interface LibraryFlipbookProps {
  title: string;
  pages: LibraryFlipPage[];
  onClose?: () => void;
  homeHref?: string;
  homeLabel?: string;
  articles?: Array<{ id?: string; title: string; startPage: number; author?: string | null }>;
  /** Volume details, shown in a slide-in sheet. */
  details?: React.ReactNode;
  detailsOpen?: boolean;
  onToggleDetails?: () => void;
  onCloseDetails?: () => void;
}

/** How many pages either side of the current one hold a live image source. */
const WINDOW_RADIUS = 3;

/** Paper tones for the page stack, so the book does not read as a flat slab. */
const PAPER = '#FBF7EE';
const PAPER_EDGE = 'rgba(120, 98, 60, 0.16)';

export const LibraryFlipbook: React.FC<LibraryFlipbookProps> = ({
  title,
  pages = [],
  onClose,
  homeHref = '/library',
  homeLabel = 'Library',
  articles = [],
  details,
  detailsOpen = false,
  onToggleDetails,
  onCloseDetails,
}) => {
  const bookRef = useRef<any>(null);
  const imgRefs = useRef<Array<HTMLImageElement | null>>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageElRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(pages.length);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [tocOpen, setTocOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [readerMode, setReaderMode] = useState(false);

  const [bookSize, setBookSize] = useState({ width: 500, height: 707, mobile: false });

  /* ------------------------------------------------------------------ */
  /* Sizing                                                               */
  /* ------------------------------------------------------------------ */

  /**
   * The book is sized to the stage it actually sits in, so it always fits
   * on screen — the reader header above it changes height with the volume
   * title, and a fixed size would either overflow or waste the space.
   */
  useEffect(() => {
    const stage = stageElRef.current;
    if (!stage) return;

    const measure = () => {
      const box = stage.getBoundingClientRect();
      if (box.width === 0) return;

      const isMobile = window.innerWidth < 768;
      const pad = isMobile ? 12 : 24;

      /* How much room the stage actually has. The reader is a full-height
         layout, so the stage height is what limits the book — measuring
         the viewport instead would ignore the toolbars above and below. */
      const viewportBelow = Math.max(220, box.height - pad);

      if (isMobile) {
        /* A single page on a phone. */
        const width = Math.min(box.width - pad, 460);
        setBookSize({ width, height: Math.round(width * 1.42), mobile: true });
        return;
      }

      /* A two-page spread: the height is driven by the space available and
         each page's width follows from it, so the pages keep a book-like
         proportion and the whole spread fits on screen. */
      const height = Math.min(900, Math.max(300, viewportBelow));
      const byHeight = Math.round(height / 1.42);
      const byWidth = Math.round((box.width - pad) / 2);
      const width = Math.max(200, Math.min(byHeight, byWidth, 520));

      setBookSize({ width, height: Math.round(width * 1.42), mobile: false });
    };

    measure();

    /* The stage only has a height once the flex layout has settled, so the
       measurement is repeated over the next few frames. */
    const raf = requestAnimationFrame(measure);
    const timer = window.setTimeout(measure, 200);

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Lazy image activation                                                */
  /* ------------------------------------------------------------------ */

  /**
   * The current page is kept in a ref as well as in state, so the image
   * callback below can decide whether a page is close enough to the reader
   * to be worth downloading. `react-pageflip` clones the page elements and
   * owns their refs, so the source is applied directly to the element
   * rather than through React's rendering.
   */
  const currentPageRef = useRef(0);
  currentPageRef.current = currentPage;

  const applySource = useCallback((index: number) => {
    const img = imgRefs.current[index];
    if (!img) return;

    const page = pages[index];
    if (!page) return;

    const start = Math.max(0, currentPageRef.current - WINDOW_RADIUS);
    const end = Math.min(pages.length - 1, currentPageRef.current + WINDOW_RADIUS);
    const inWindow = index >= start && index <= end;

    if (inWindow) {
      const src = page.imageVariants.w1024 || page.imageVariants.w640 || '';
      if (src && img.getAttribute('src') !== src) {
        img.setAttribute('src', src);
      }
    } else if (img.getAttribute('src')) {
      img.removeAttribute('src');
    }
  }, [pages]);

  /**
   * Only pages near the current spread hold a live `src`. A 400-page volume
   * would otherwise request every page image at once, which is the single
   * biggest cost in the reader.
   */
  useEffect(() => {
    for (let i = 0; i < pages.length; i++) applySource(i);
  }, [currentPage, pages, applySource]);

  /**
   * `react-pageflip` clones and re-parents the page elements, so the images
   * are collected from the DOM after the book has been built rather than
   * through React refs. The collected elements are then given a source
   * according to the lazy-loading window.
   */
  useEffect(() => {
    const collect = () => {
      const stage = stageRef.current;
      if (!stage) return;

      const found = stage.querySelectorAll<HTMLImageElement>('img[data-page-index]');
      if (found.length === 0) return;

      imgRefs.current = [];
      found.forEach((img) => {
        const index = Number(img.getAttribute('data-page-index'));
        if (!Number.isNaN(index)) imgRefs.current[index] = img;
      });

      for (let i = 0; i < pages.length; i++) applySource(i);
    };

    /* The book is built in an effect, so the elements appear one tick later.
       A resize rebuilds the book and brings new elements with it, so the
       collection is repeated then as well. */
    const raf = requestAnimationFrame(collect);
    const timer = window.setTimeout(collect, 400);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [pages, applySource, totalPages, bookSize]);

  /* ------------------------------------------------------------------ */
  /* Keyboard                                                             */
  /* ------------------------------------------------------------------ */

  const flipTo = useCallback((index: number) => {
    const flipbook = bookRef.current?.pageFlip?.();
    if (!flipbook) return;
    const target = Math.max(0, Math.min(pages.length - 1, index));
    flipbook.flip(target);
    setCurrentPage(target);
  }, [pages.length]);

  const turnSpread = useCallback((direction: -1 | 1) => {
    const current = bookRef.current?.pageFlip?.()?.getCurrentPageIndex?.() ?? currentPage;
    const step = bookSize.mobile ? 1 : 2;
    flipTo(current + direction * step);
  }, [bookSize.mobile, currentPage, flipTo]);

  const toggleFullscreen = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!document.fullscreenElement) {
      root.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') turnSpread(1);
      else if (e.key === 'ArrowLeft') turnSpread(-1);
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      else if (e.key === 'Escape') {
        if (tocOpen) setTocOpen(false);
        else if (searchOpen) setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tocOpen, searchOpen, turnSpread, toggleFullscreen]);

  /**
   * Fullscreen is requested on the reader's own root element rather than on
   * the document, so the browser promotes exactly the reader to the top
   * layer. Overlaying the whole page with a `fixed` element instead would
   * fight the surrounding layout, and the book would keep the size it had
   * before the switch.
   */
  /* The browser can leave fullscreen on its own (Esc, or a browser-level
     exit), so the state follows the document rather than the click. */
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  /* ------------------------------------------------------------------ */
  /* Search within the volume                                             */
  /* ------------------------------------------------------------------ */

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return pages
      .map((p, i) => ({ page: p, index: i }))
      .filter(({ page }) => page.text?.toLowerCase().includes(q))
      .slice(0, 40);
  }, [query, pages]);

  /* ------------------------------------------------------------------ */
  /* Rendered page                                                        */
  /* ------------------------------------------------------------------ */

  const renderPage = (p: LibraryFlipPage, index: number) => (
    <div
      key={p.id || index}
      className="relative h-full w-full overflow-hidden"
      style={{ background: PAPER }}
    >
      <div className="relative h-full w-full">
        {/*
          `react-pageflip` takes ownership of the page elements and clones
          them, so the image is given its source imperatively once the
          element exists rather than through a React ref.
        */}
        <img
          data-page-index={index}
          alt={`Page ${p.pageNo}`}
          decoding="async"
          className="pointer-events-none h-full w-full object-contain"
          style={{ background: PAPER }}
        />
      </div>

      {/* The bound edge of the sheet, where the paper curves away from the
          reader. In single-page mode this is the spine, so it is deeper
          than the outer edge. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-14"
        style={{
          background:
            'linear-gradient(to right, rgba(74, 56, 28, 0.26) 0%, rgba(74, 56, 28, 0.10) 32%, rgba(74, 56, 28, 0.02) 68%, transparent 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8"
        style={{
          background:
            'linear-gradient(to left, rgba(74, 56, 28, 0.13) 0%, rgba(74, 56, 28, 0.03) 45%, transparent 100%)',
        }}
      />

      {/* The cut edge of the paper — a hairline of the page stack. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: 'rgba(120, 98, 60, 0.22)' }}
      />

      {/* Folio */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-2.5 text-center font-mono text-[10px] tracking-widest"
        style={{ color: 'rgba(96, 78, 48, 0.5)' }}
      >
        {p.pageNo}
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ */

  /* A wide screen shows a two-page spread, so the container is two pages
     wide; a phone shows a single page. */
  const bookWidth = bookSize.mobile ? bookSize.width : bookSize.width * 2;

  /* The page range currently on screen — "4-5" for a spread, "4" for a
     single page — so a turn never looks like it skipped a page. */
  const pageRange = (() => {
    if (bookSize.mobile) return `${currentPage + 1}`;
    /* PageFlip reports the leading index of the open spread. Normalize the
       visible range to that two-page spread, with a final orphan if needed. */
    const spreadStart = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    const left = spreadStart + 1;
    const right = Math.min(spreadStart + 2, pages.length);
    return left === right ? `${left}` : `${left}-${right}`;
  })();

  return (
    <div
      ref={rootRef}
      /* The reader fills the space it is given. In fullscreen the browser
         makes this element the top layer, so it must be able to stand on
         its own without the surrounding page. */
      className="relative flex h-full w-full flex-col overflow-hidden text-stone-100 select-none"
      style={{
        /* A dark desk the book rests on, warmed by a lamp above it. */
        background:
          'radial-gradient(ellipse 90% 70% at 50% 12%, #232c47 0%, #141a2e 45%, #0a0e1c 100%)',
        /* In fullscreen the browser gives the element the whole screen; the
           regular case fills the container the reader placed it in. */
        height: isFullscreen ? '100vh' : '100%',
      }}
    >
      {/* ----------------------------- Toolbar ----------------------------- */}
      <div className="z-30 flex items-center justify-between gap-3 border-b border-white/[0.07] bg-black/20 px-3 py-2.5 backdrop-blur-md sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex shrink-0 items-center gap-1 text-stone-400 transition-colors hover:text-white"
            >
              <ChevronLeft size={16} />
              <span className="hidden text-xs sm:inline">{homeLabel}</span>
            </button>
          ) : (
            <a
              href={homeHref}
              className="flex shrink-0 items-center gap-1 text-stone-400 transition-colors hover:text-white"
            >
              <Home size={15} />
              <span className="hidden text-xs sm:inline">{homeLabel}</span>
            </a>
          )}

          <span className="hidden text-stone-600 sm:inline">|</span>

          <span className="truncate font-serif text-xs font-bold tracking-wide text-white">
            {title}
          </span>

          {onToggleDetails && (
            <button
              type="button"
              onClick={onToggleDetails}
              aria-expanded={detailsOpen}
              className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-stone-300 transition hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              <Info size={12} />
              Details
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Search in this volume"
            aria-label="Search in this volume"
          >
            <Search size={16} />
          </button>

          <button
            type="button"
            onClick={() => setTocOpen((v) => !v)}
            className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Page thumbnails"
            aria-label="Page thumbnails"
          >
            <List size={16} />
          </button>

          <button
            type="button"
            onClick={() => setReaderMode((v) => !v)}
            className={`rounded-lg p-1.5 transition-colors hover:bg-white/10 ${
              readerMode ? 'text-accent-400' : 'text-stone-300 hover:text-white'
            }`}
            title="Text reader"
            aria-label="Text reader"
          >
            <BookOpen size={16} />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg p-1.5 text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
            title="Toggle fullscreen"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* ----------------------------- Search ------------------------------ */}
      {searchOpen && (
        <div className="z-30 border-b border-white/10 bg-black/25 px-3 py-2.5 backdrop-blur-md sm:px-5">
          <div className="flex items-center gap-2">
            <Search size={14} className="shrink-0 text-stone-500" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the text of this volume…"
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-stone-600"
            />
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setQuery('');
              }}
              className="shrink-0 text-stone-500 transition-colors hover:text-white"
              aria-label="Close search"
            >
              <X size={15} />
            </button>
          </div>

          {query.trim().length >= 2 && (
            <div className="mt-2 max-h-40 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="py-2 text-[11px] text-stone-500">
                  No page in this volume contains “{query.trim()}”.
                </p>
              ) : (
                <ul className="space-y-1">
                  {searchResults.map(({ page, index }) => (
                    <li key={page.id || index}>
                      <button
                        type="button"
                        onClick={() => {
                          flipTo(index);
                          setSearchOpen(false);
                        }}
                        className="w-full rounded-lg px-2 py-1.5 text-left text-[11px] text-stone-300 transition-colors hover:bg-white/10"
                      >
                        <span className="font-mono text-accent-400">p.{page.pageNo}</span>{' '}
                        <span className="line-clamp-1 text-stone-400">
                          {page.text?.slice(0, 140)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------ Stage ----------------------------- */}
      <div
        ref={stageElRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden p-3 sm:p-6"
      >
        {/* A soft pool of light on the desk the book rests on */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 45% at 50% 42%, rgba(255, 214, 140, 0.09), transparent 72%)',
          }}
        />

        {/* ------------------------- Details sheet ------------------------- */}
        {details && detailsOpen && (
          <>
            <button
              type="button"
              aria-label="Close details"
              onClick={onCloseDetails}
              className="absolute inset-0 z-20 cursor-default bg-black/45 backdrop-blur-[2px]"
            />
            <aside
              className="absolute right-0 top-0 z-30 h-full w-full max-w-sm overflow-y-auto border-l border-white/10 bg-[#111729]/95 px-5 py-6 shadow-2xl backdrop-blur-xl sm:px-6"
              style={{ animation: 'librarySheetIn 260ms cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
                  About this volume
                </span>
                <button
                  type="button"
                  onClick={onCloseDetails}
                  aria-label="Close details"
                  className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
              {details}
            </aside>
          </>
        )}

        {pages.length === 0 ? (
          /* A volume whose pages could not be rendered has nothing to
             turn. The reader is told so plainly rather than being shown
             an empty desk. */
          <div className="relative z-10 flex max-w-sm flex-col items-center gap-2 px-6 text-center">
            <BookOpen size={26} className="text-stone-500" />
            <p className="font-serif text-sm font-bold text-stone-200">
              This volume has no pages yet.
            </p>
            <p className="text-xs leading-relaxed text-stone-400">
              The document could not be prepared for reading. Please try again later, or contact
              the school if the problem persists.
            </p>
          </div>
        ) : readerMode ? (
          /* Text reader — the accessible fallback and a fast way to skim */
          <div
            className="relative z-10 max-h-[70vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 shadow-2xl sm:p-8"
            style={{ background: PAPER, color: '#3a2f1d' }}
          >
            <h3 className="mb-4 border-b pb-2 font-serif text-xl font-bold" style={{ borderColor: PAPER_EDGE }}>
              Page {currentPage + 1}
            </h3>
            <p className="whitespace-pre-line font-serif text-sm leading-relaxed">
              {pages[currentPage]?.text || 'No transcribed text is available for this page.'}
            </p>
          </div>
        ) : (
          <div
            ref={stageRef}
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
            className="relative z-10"
          >
            {pages.length > 0 && (
              <HTMLFlipBook
                ref={bookRef}
                /* `PageFlip` takes its width and height once, when it is
                   built, and keeps them for good — new props do not resize
                   it. So the book is rebuilt whenever the measured size
                   changes, which is what lets the full-screen book open
                   larger than the one on the page. */
                key={`${bookSize.width}x${bookSize.height}x${bookSize.mobile ? 'p' : 'l'}`}
                /* A warm, deep shadow so the book reads as a physical object
                   resting on the desk rather than a flat rectangle. */
                className="shadow-[0_28px_60px_-12px_rgba(0,0,0,0.75),0_10px_24px_-8px_rgba(0,0,0,0.55)]"
                style={{ width: `${bookWidth}px`, height: `${bookSize.height}px` }}
                width={bookSize.width}
                height={bookSize.height}
                size="fixed"
                minWidth={200}
                maxWidth={560}
                minHeight={300}
                maxHeight={960}
                maxShadowOpacity={0.45}
                /* No synthetic hard cover: page 1 of the volume is already
                   its own front board, and a cover here would leave the
                   left half of the opening spread blank. */
                showCover={false}
                /* A wide screen opens the book as a two-page spread — one
                   physical sheet turns per click, so pages 4-5 are visible
                   together and turning lands on pages 6-7. A narrow screen
                   opens as a single page. */
                usePortrait={bookSize.mobile}
                startPage={currentPage}
                startZIndex={0}
                autoSize={false}
                drawShadow
                flippingTime={900}
                useMouseEvents
                clickEventForward
                swipeDistance={24}
                showPageCorners
                disableFlipByClick={false}
                mobileScrollSupport
                onInit={(e: any) => {
                  setTotalPages(e?.data?.pageCount ?? pages.length);
                }}
                onFlip={(e: any) => {
                  const pageIndex = Number(e?.data);
                  if (Number.isFinite(pageIndex)) setCurrentPage(pageIndex);
                }}
              >
                {pages.map(renderPage)}
              </HTMLFlipBook>
            )}
          </div>
        )}

        {/* Turn arrows */}
        {!readerMode && pages.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => turnSpread(-1)}
              className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur transition-all hover:bg-black/70 sm:left-4 sm:h-11 sm:w-11"
              aria-label="Previous page"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => turnSpread(1)}
              className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur transition-all hover:bg-black/70 sm:right-4 sm:h-11 sm:w-11"
              aria-label="Next page"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* --------------------------- Thumbnail rail --------------------------- */}
      {tocOpen && (
        <div className="z-30 max-h-56 overflow-y-auto border-t border-white/10 bg-black/30 px-3 py-3 backdrop-blur sm:px-5">
          {articles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 border-b border-white/10 pb-3">
              {articles.map((article, index) => (
                <button
                  key={article.id || `${article.startPage}-${index}`}
                  type="button"
                  onClick={() => flipTo(Math.max(0, Math.min(pages.length - 1, article.startPage - 1)))}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-left text-[10px] text-stone-300 transition hover:border-accent-400/50 hover:text-white"
                >
                  {article.title} <span className="ml-1 font-mono text-accent-400">p.{article.startPage}</span>
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {pages.map((p, idx) => (
              <button
                key={p.id || idx}
                type="button"
                onClick={() => flipTo(idx)}
                aria-label={`Go to page ${p.pageNo}`}
                className={`relative aspect-[3/4] overflow-hidden rounded border transition ${
                  currentPage === idx
                    ? 'border-accent-400 ring-2 ring-accent-400/40'
                    : 'border-white/15 opacity-60 hover:opacity-100'
                }`}
                style={{ background: PAPER }}
              >
                {p.imageVariants.thumb ? (
                  <img
                    src={p.imageVariants.thumb}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-mono text-[9px] text-stone-500">
                    {p.pageNo}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------- Status bar ---------------------------- */}
      <div className="z-30 flex items-center justify-between gap-3 border-t border-white/10 bg-black/30 px-3 py-2.5 font-mono text-[11px] text-stone-400 backdrop-blur sm:px-6">
        <span className="shrink-0">
          Page{bookSize.mobile ? '' : 's'} {pageRange} of {totalPages}
        </span>

        <div className="hidden items-center gap-1.5 sm:flex">
          {pages
            .slice(Math.max(0, currentPage - 4), currentPage + 5)
            .map((p) => {
              const idx = pages.indexOf(p);
              return (
                <button
                  key={p.id || idx}
                  type="button"
                  onClick={() => flipTo(idx)}
                  className={`h-8 w-6 overflow-hidden rounded-sm border transition ${
                    idx === currentPage
                      ? 'border-accent-400'
                      : 'border-white/15 opacity-55 hover:opacity-100'
                  }`}
                  style={{ background: PAPER }}
                  aria-label={`Page ${p.pageNo}`}
                >
                  {p.imageVariants.thumb && (
                    <img
                      src={p.imageVariants.thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
              );
            })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="rounded p-1 text-stone-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Zoom out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
            className="rounded p-1 text-stone-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryFlipbook;
