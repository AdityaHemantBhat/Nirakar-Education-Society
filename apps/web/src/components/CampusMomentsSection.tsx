import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CampusMomentsProps {
  gallery?: Array<{
    id: string;
    title: string;
    mediaUrl: string;
    caption?: string | null;
    album?: {
      id: string;
      title: string;
      institutionCode?: 'NIRAKAR_HS' | 'TUDAL_HS' | 'ANGLE_HSS' | null;
      category?: string;
    } | null;
  }>;
}

const FALLBACK_MOMENTS = [
  {
    id: 'm-1',
    title: 'Nirakar Maidan Sports & Republic Day Ceremonial Parade',
    caption: 'NCC cadets, Scouts & Guides, and track events conducted at the sprawling Nirakar Maidan grounds in Dapot.',
    mediaUrl: '/images/angle_campus.jpg',
    campusTag: 'S.S. Angle Higher Secondary',
    village: 'Dapot, Canacona',
    category: 'Sports & NCC',
    photoCount: 2,
    items: [
      { id: '1-1', url: '/images/angle_campus.jpg', caption: 'Full-scale cricket, football, and athletic pavilion at Dapot.' },
      { id: '1-2', url: '/images/nirakar_students_real2.jpg', caption: 'Disciplined youth leadership marching in ceremonial state parades.' },
    ],
  },
  {
    id: 'm-2',
    title: 'Higher Secondary Science, Commerce & Arts Conclave',
    caption: 'Class XI & XII laboratory practicals, commerce symposiums, and university entrance foundation mentoring sessions at Dapot.',
    mediaUrl: '/images/S.S.Angle_Higher_Secondary_School_Dapot.webp',
    campusTag: 'S.S. Angle Higher Secondary',
    village: 'Dapot, Canacona',
    category: 'Higher Secondary',
    photoCount: 3,
    items: [
      { id: '2-1', url: '/images/S.S.Angle_Higher_Secondary_School_Dapot.webp', caption: 'The landmark campus of Satyawati Soiru Angle Higher Secondary School.' },
      { id: '2-2', url: '/images/science_lab.jpg', caption: 'Experiential learning environment preparing scholars for medical and engineering entrances.' },
      { id: '2-3', url: '/images/nirakar_students_real1.jpg', caption: 'Senior educators guiding graduating scholars on college roadmaps.' },
    ],
  },
  {
    id: 'm-3',
    title: 'Western Ghats Biodiversity & Eco-Sanctuary Walk',
    caption: 'Field botany excursions, indigenous tree planting, and biodiversity observation clubs across Gaondongrem hills.',
    mediaUrl: '/images/tudal_campus.jpg',
    campusTag: 'Tudal High School',
    village: 'Gaondongrem, Canacona',
    category: 'Nature & Campus',
    photoCount: 2,
    items: [
      { id: '3-1', url: '/images/tudal_campus.jpg', caption: 'Medicinal plants and biodiversity sanctuary maintained by students.' },
      { id: '3-2', url: '/images/Tudal_High_School_Gaodongrem.webp', caption: 'Ensuring education reaches every doorstep across interior forest settlements.' },
    ],
  },
  {
    id: 'm-4',
    title: 'Traditional Goan Folk Arts, Natak & Fugdi Festival',
    caption: 'State-awarded traditional folk theatre, Natak, Dhalo, and Fugdi presentations preserving Goan rural performing arts in Gaondongrem.',
    mediaUrl: '/images/folk_arts.jpg',
    campusTag: 'Tudal High School',
    village: 'Gaondongrem, Canacona',
    category: 'Cultural & Heritage',
    photoCount: 3,
    items: [
      { id: '4-1', url: '/images/folk_arts.jpg', caption: 'State award-winning theatrical performance by Tudal High School students.' },
      { id: '4-2', url: '/images/Tudal_High_School_Gaodongrem.webp', caption: 'The serene rural sanctuary campus in Gaondongrem.' },
      { id: '4-3', url: '/images/tudal_campus.jpg', caption: 'Celebrating traditional songs and folklore of the Canacona hinterlands.' },
    ],
  },
  {
    id: 'm-5',
    title: 'Inter-School Athletics & Volleyball Championships',
    caption: 'State tournament victories, volleyball rallies, and athletics meets hosted at the historic Mashem sports pavilion.',
    mediaUrl: '/images/sports_champs.jpg',
    campusTag: 'Shri Nirakar High School',
    village: 'Mashem, Canacona',
    category: 'Sports & Athletics',
    photoCount: 2,
    items: [
      { id: '5-1', url: '/images/sports_champs.jpg', caption: 'Unbroken legacy of district and state volleyball accolades.' },
      { id: '5-2', url: '/images/mashem_campus.jpg', caption: 'Scholars preparing for the All-Goa secondary athletics championship.' },
    ],
  },
  {
    id: 'm-6',
    title: 'Atal Tinkering Robotics & Innovation Lab Showcase',
    caption: 'Scholars of Shri Nirakar High School experimenting with microcontroller kits, sensor programming, and 3D prototyping models.',
    mediaUrl: '/images/science_lab.jpg',
    campusTag: 'Shri Nirakar High School',
    village: 'Mashem, Canacona',
    category: 'STEM & Robotics',
    photoCount: 3,
    items: [
      { id: '6-1', url: '/images/science_lab.jpg', caption: 'Students assembling automated obstacle-avoiding sensor robots.' },
      { id: '6-2', url: '/images/nirakar_vidyalaya_real.jpg', caption: 'Interactive wet chemistry and optics stations at the Mashem campus.' },
      { id: '6-3', url: '/images/nirakar_student_winner.jpg', caption: 'Canacona zonal science exposition prize winners.' },
    ],
  },
];

interface MomentPhotoItem {
  id?: string;
  url: string;
  caption?: string | null;
}

interface MomentItem {
  id: string;
  title: string;
  caption: string;
  mediaUrl: string;
  campusTag: string;
  village: string;
  category: string;
  photoCount: number;
  items: MomentPhotoItem[];
}

export const CampusMomentsSection: React.FC<CampusMomentsProps> = ({ gallery }) => {
  const [selectedAlbumIndex, setSelectedAlbumIndex] = useState<number | null>(null);
  const [activePhotoInModal, setActivePhotoInModal] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Pin animation container refs
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Directly fetch real gallery albums from /api/v1/content/galleries
  const { data: directGalleries } = useQuery({
    queryKey: ['campus-moments-galleries'],
    queryFn: async () => {
      const res = await fetch('/api/v1/content/galleries');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    staleTime: 60 * 1000,
  });

  // Map real gallery albums directly so titles, descriptions, and photographs match the Gallery page exactly
  const items: MomentItem[] = React.useMemo(() => {
    // 1. If directGalleries loaded from /api/v1/content/galleries
    if (directGalleries && directGalleries.length > 0) {
      return directGalleries.map((album: any, idx: number): MomentItem => {
        const instCode = album.institutionCode;
        let campusTag = 'Shri Nirakar Education Society';
        let village = 'Canacona, South Goa';

        if (instCode === 'NIRAKAR_HS') {
          campusTag = 'Shri Nirakar High School';
          village = 'Mashem, Canacona';
        } else if (instCode === 'TUDAL_HS') {
          campusTag = 'Tudal High School';
          village = 'Gaondongrem, Canacona';
        } else if (instCode === 'ANGLE_HSS') {
          campusTag = 'S.S. Angle Higher Secondary';
          village = 'Dapot, Canacona';
        }

        const coverPhoto =
          album.coverUrl ||
          album.coverImage ||
          album.items?.[0]?.mediaUrl ||
          album.items?.[0]?.url ||
          '/images/science_lab.jpg';

        const albumItems = (album.items || []).map((it: any) => ({
          id: it.id,
          url: it.mediaUrl || it.url,
          caption: it.caption || it.title || album.title,
        }));

        return {
          id: album.id || `album-${idx}`,
          title: album.title,
          caption: album.description || album.caption || 'Photographed across society campuses.',
          mediaUrl: coverPhoto,
          campusTag,
          village,
          category: album.category || (instCode === 'ANGLE_HSS' ? 'Higher Secondary' : 'High School'),
          photoCount: albumItems.length || 1,
          items: albumItems.length > 0 ? albumItems : [{ id: `item-${idx}`, url: coverPhoto, caption: album.title }],
        };
      });
    }

    // 2. If gallery was passed from home endpoint
    if (gallery && gallery.length > 0) {
      return gallery.map((g: any, idx: number): MomentItem => {
        const instCode = g.album?.institutionCode || g.institutionCode;
        let campusTag = 'Society Campus';
        let village = 'Canacona, South Goa';

        if (instCode === 'NIRAKAR_HS') {
          campusTag = 'Shri Nirakar High School';
          village = 'Mashem, Canacona';
        } else if (instCode === 'TUDAL_HS') {
          campusTag = 'Tudal High School';
          village = 'Gaondongrem, Canacona';
        } else if (instCode === 'ANGLE_HSS') {
          campusTag = 'S.S. Angle Higher Secondary';
          village = 'Dapot, Canacona';
        }

        const photoUrl =
          g.mediaUrl ||
          g.coverUrl ||
          g.coverImage ||
          '/images/science_lab.jpg';

        const displayTitle = g.album?.title || g.title || 'Campus Moment';
        const displayCaption = g.caption || g.album?.title || 'Photographed on campus.';

        return {
          id: g.id || `photo-${idx}`,
          title: displayTitle,
          caption: displayCaption,
          mediaUrl: photoUrl,
          campusTag,
          village,
          category: g.album?.category || g.category || 'Campus Life',
          photoCount: 1,
          items: [{ id: g.id, url: photoUrl, caption: displayCaption }],
        };
      });
    }

    return FALLBACK_MOMENTS;
  }, [gallery, directGalleries]);

  // GSAP Horizontal Pin and Pinout Animation for Desktop (>= lg)
  useLayoutEffect(() => {
    const pinSection = pinSectionRef.current;
    const track = trackRef.current;
    if (!pinSection || !track || items.length === 0) return;

    // Responsive ScrollTrigger with GSAP MatchMedia (Only on large desktops)
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        const viewportWidth = window.innerWidth;
        return -(trackWidth - viewportWidth + 120);
      };

      const ctx = gsap.context(() => {
        const scrollTween = gsap.to(track, {
          x: getScrollAmount,
          ease: 'none',
          scrollTrigger: {
            trigger: pinSection,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${Math.max(window.innerHeight * 1.5, track.scrollWidth - window.innerWidth + 200)}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            fastScrollEnd: true,
            onUpdate: (self) => {
              const calculatedIndex = Math.min(
                items.length - 1,
                Math.floor(self.progress * items.length),
              );
              setActiveIndex(calculatedIndex);
            },
          },
        });

        // Parallax depth on images inside cards while panning
        const cards = gsap.utils.toArray<HTMLElement>('.gsap-reel-card', track);
        cards.forEach((card) => {
          const img = card.querySelector('.gsap-reel-img');
          if (img) {
            gsap.fromTo(
              img,
              { scale: 1.06, xPercent: -5 },
              {
                scale: 1,
                xPercent: 5,
                ease: 'none',
                scrollTrigger: {
                  trigger: card,
                  containerAnimation: scrollTween,
                  start: 'left right',
                  end: 'right left',
                  scrub: true,
                },
              },
            );
          }
        });
      }, pinSection);

      // Force recalculation after layout settles
      const timeoutId = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, [items]);

  const activeAlbum = selectedAlbumIndex !== null ? items[selectedAlbumIndex] : null;

  const openModal = (index: number) => {
    setSelectedAlbumIndex(index);
    setActivePhotoInModal(0);
  };

  const closeModal = () => {
    setSelectedAlbumIndex(null);
    setActivePhotoInModal(0);
  };

  const handleMobileScroll = () => {
    if (mobileScrollRef.current) {
      const { scrollLeft, clientWidth } = mobileScrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setMobileActiveIndex(index);
    }
  };

  const scrollToMobileIndex = (index: number) => {
    if (mobileScrollRef.current) {
      const { clientWidth } = mobileScrollRef.current;
      mobileScrollRef.current.scrollTo({
        left: index * clientWidth,
        behavior: 'smooth',
      });
      setMobileActiveIndex(index);
    }
  };

  return (
    <section
      ref={pinSectionRef}
      className="relative w-full bg-[#FAF7F2] border-t border-stone-200/90 overflow-hidden"
    >
      {/* =========================================================================
          MOBILE & TABLET VIEW (< lg): Exactly 1 card at a time with smooth swipe
         ========================================================================= */}
      <div className="block lg:hidden py-10 px-4 sm:px-6 md:px-8">
        {/* Mobile Header Bar */}
        <div className="flex flex-col gap-3.5 mb-6 border-b border-stone-200/90 pb-5">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase font-mono font-bold tracking-wider text-amber-900 bg-amber-500/10 border border-amber-600/25 px-3 py-1.5 rounded-full w-fit">
            <Camera size={13} className="text-amber-700 shrink-0" />
            <span>Living Chronicle Across All 3 Institutions</span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                Campus Moments &amp; Activities
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm mt-1 font-sans leading-relaxed">
                Swipe horizontally to browse each campus activity and album.
              </p>
            </div>

            <Link
              to="/gallery"
              className="shrink-0 inline-flex items-center gap-1.5 bg-[#111b5e] hover:bg-[#0b132b] text-white px-3.5 py-2 rounded-xl text-xs font-serif font-bold tracking-wide transition-all shadow-sm"
            >
              <span>Gallery</span>
              <ArrowRight size={13} className="text-amber-300" />
            </Link>
          </div>

          {/* Swipe Indicator & Prev / Next Arrows */}
          <div className="flex items-center justify-between pt-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-600 bg-stone-100/90 border border-stone-200 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Swipe to explore • {mobileActiveIndex + 1} of {items.length}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollToMobileIndex(Math.max(0, mobileActiveIndex - 1))}
                disabled={mobileActiveIndex === 0}
                className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs active:scale-95 transition-transform"
                aria-label="Previous card"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollToMobileIndex(Math.min(items.length - 1, mobileActiveIndex + 1))}
                disabled={mobileActiveIndex === items.length - 1}
                className="w-9 h-9 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs active:scale-95 transition-transform"
                aria-label="Next card"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container: Exactly 1 card at a time with 100% width and mandatory snap */}
        <div
          ref={mobileScrollRef}
          onScroll={handleMobileScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 w-full"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {items.map((album, idx) => (
            <div
              key={album.id}
              className="w-full shrink-0 snap-center snap-always px-0.5"
            >
              <div
                onClick={() => openModal(idx)}
                className="w-full bg-white rounded-3xl border border-stone-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer group active:scale-[0.99]"
              >
                {/* Visual Image Viewport */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-stone-900">
                  <img
                    src={album.mediaUrl}
                    alt={album.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent pointer-events-none" />

                  {/* Campus pill */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="bg-stone-900/85 backdrop-blur-md text-amber-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-white/10 shadow-sm">
                      {album.campusTag}
                    </span>
                  </div>

                  {/* Photos count pill */}
                  <div className="absolute top-3.5 right-3.5">
                    <span className="bg-black/60 backdrop-blur-md text-white text-xs font-mono px-3 py-1 rounded-full border border-white/20 inline-flex items-center gap-1.5 shadow-md">
                      <Layers size={12} className="text-amber-400" />
                      <span>{album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}</span>
                    </span>
                  </div>

                  {/* Bottom location & category overlay */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-mono drop-shadow-sm">
                    <span className="flex items-center gap-1.5 text-stone-200 font-medium">
                      <MapPin size={13} className="text-amber-400 shrink-0" />
                      <span>{album.village}</span>
                    </span>
                    <span className="text-amber-300 font-semibold uppercase tracking-wider text-[11px] bg-black/40 px-2.5 py-0.5 rounded-md border border-white/10">
                      {album.category}
                    </span>
                  </div>
                </div>

                {/* Narrative Details */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-white space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 font-bold block">
                      {album.campusTag}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                      {album.title}
                    </h3>
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-sans line-clamp-3">
                      {album.caption}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-500 font-medium flex items-center gap-1">
                      <Sparkles size={13} className="text-amber-600" />
                      <span>Click to view photos</span>
                    </span>
                    <span className="text-[#111b5e] font-bold inline-flex items-center gap-1">
                      <span>Explore Album</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Dots Pagination Indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToMobileIndex(idx)}
              className={`transition-all duration-300 rounded-full ${mobileActiveIndex === idx
                  ? 'w-6 h-2 bg-[#111b5e]'
                  : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* =========================================================================
          DESKTOP VIEW (>= lg): Full Pinned GSAP ScrollTrigger Reel
         ========================================================================= */}
      <div className="hidden lg:flex lg:flex-col lg:justify-between w-full h-screen py-8 px-12 xl:px-16 2xl:px-24">
        {/* Top Header Bar */}
        <div className="flex flex-row items-end justify-between gap-4 border-b border-stone-200/90 pb-6 shrink-0">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase font-mono font-bold tracking-wider text-amber-900 bg-amber-500/10 border border-amber-600/25 px-3.5 py-1.5 rounded-full mb-2.5">
              <Camera size={13} className="text-amber-700 shrink-0" />
              <span>Living Chronicle Across All 3 Institutions</span>
            </div>

            <h2 className="font-serif text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
              Campus Moments &amp; Activities
            </h2>

            <p className="text-stone-600 text-sm mt-1.5 font-sans leading-relaxed max-w-xl">
              Scroll down to glide across the archives—from wet labs and athletic championships to folk traditions in Mashem, Gaondongrem, and Dapot.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 bg-[#111b5e] hover:bg-[#0b132b] text-white px-5 py-2.5 rounded-xl text-xs font-serif font-bold tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>Explore Full 3-Campus Gallery</span>
              <ArrowRight size={14} className="text-amber-300" />
            </Link>

            {/* Desktop Progress Indicator Badge */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono text-stone-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Album {activeIndex + 1} of {items.length}</span>
            </div>
          </div>
        </div>

        {/* Reel Strip Wrapper: Pinned horizontal scroll on Desktop */}
        <div className="w-full flex-1 flex items-center overflow-visible pt-4 pb-0">
          <div
            ref={trackRef}
            className="flex flex-row gap-8 items-stretch will-change-transform"
          >
            {items.map((album, idx) => (
              <div
                key={album.id}
                onClick={() => openModal(idx)}
                className="gsap-reel-card w-[520px] xl:w-[600px] shrink-0 bg-white rounded-3xl border border-stone-200/90 shadow-md hover:shadow-2xl hover:border-amber-400/50 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer group active:scale-[0.99]"
              >
                {/* Visual Image Viewport: Clean, prominent, expansive */}
                <div className="relative aspect-[16/9.5] overflow-hidden bg-stone-900 shrink-0">
                  <img
                    src={album.mediaUrl}
                    alt={album.title}
                    loading="lazy"
                    decoding="async"
                    className="gsap-reel-img w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent pointer-events-none" />

                  {/* Campus pill */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-stone-900/85 backdrop-blur-md text-amber-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-white/10 shadow-sm">
                      {album.campusTag}
                    </span>
                  </div>

                  {/* Photos count pill */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-black/60 backdrop-blur-md text-white text-xs font-mono px-3 py-1 rounded-full border border-white/20 inline-flex items-center gap-1.5 shadow-md">
                      <Layers size={12} className="text-amber-400" />
                      <span>{album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}</span>
                    </span>
                  </div>

                  {/* Bottom location & category overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-mono drop-shadow-sm">
                    <span className="flex items-center gap-1.5 text-stone-200 font-medium">
                      <MapPin size={13} className="text-amber-400 shrink-0" />
                      <span>{album.village}</span>
                    </span>
                    <span className="text-amber-300 font-semibold uppercase tracking-wider text-[11px] bg-black/40 px-2.5 py-0.5 rounded-md border border-white/10 backdrop-blur-xs">
                      {album.category}
                    </span>
                  </div>
                </div>

                {/* Narrative Details Box */}
                <div className="p-6 flex-1 flex flex-col justify-between bg-white space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 font-bold">
                        {album.campusTag}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-[#111b5e] transition-colors leading-snug">
                      {album.title}
                    </h3>

                    <p className="text-stone-600 text-sm leading-relaxed font-sans line-clamp-3">
                      {album.caption}
                    </p>
                  </div>

                  {/* Interactive Trigger Button */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-500 font-medium flex items-center gap-1">
                      <Sparkles size={13} className="text-amber-600" />
                      <span>Click to view photos</span>
                    </span>
                    <span className="text-[#111b5e] font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Explore Album</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Hint strip on Desktop */}
        <div className="flex items-center justify-between text-xs font-mono text-stone-500 pt-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-400" />
            <span>Interactive Smooth Scroll Reel • Scroll vertically to pan through campus moments</span>
          </div>
          <Link
            to="/gallery"
            className="text-[#111b5e] hover:text-amber-700 font-bold inline-flex items-center gap-1"
          >
            <span>View All Society Albums</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Lightbox / Modal for Expanded Inspection */}
      {activeAlbum &&
        createPortal(
          <div
            onClick={closeModal}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-800/20 flex flex-col lg:flex-row h-auto max-h-[94vh] sm:max-h-[92vh]"
            >
              {/* Left Stage: High-Resolution Photo Display */}
              <div className="flex-1 bg-stone-950 relative flex items-center justify-center p-3 sm:p-4 md:p-6 min-h-[280px] xs:min-h-[320px] sm:min-h-[420px] lg:min-h-[540px] overflow-hidden group">
                <img
                  src={
                    activeAlbum.items[activePhotoInModal]?.url ||
                    activeAlbum.mediaUrl ||
                    '/images/science_lab.jpg'
                  }
                  alt={activeAlbum.items[activePhotoInModal]?.caption || activeAlbum.title}
                  className="w-full h-full max-h-[45vh] xs:max-h-[50vh] sm:max-h-[60vh] lg:max-h-[82vh] object-contain drop-shadow-2xl"
                />

                {/* Close Button on Mobile */}
                <button
                  type="button"
                  onClick={closeModal}
                  className="lg:hidden absolute top-3 right-3 p-2.5 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors cursor-pointer z-20 border border-white/20 shadow-md active:scale-95"
                  aria-label="Close photo inspection"
                >
                  <X size={18} />
                </button>

                {/* Prev Photo Arrow */}
                {activeAlbum.items.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoInModal((prev) =>
                        prev > 0 ? prev - 1 : activeAlbum.items.length - 1,
                      );
                    }}
                    className="absolute left-3 sm:left-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
                    title="Previous photo"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}

                {/* Next Photo Arrow */}
                {activeAlbum.items.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoInModal((prev) =>
                        (prev + 1) % activeAlbum.items.length,
                      );
                    }}
                    className="absolute right-3 sm:right-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
                    title="Next photo"
                    aria-label="Next photo"
                  >
                    <ChevronRight size={22} />
                  </button>
                )}

                {/* Bottom Left Photo Counter */}
                <div className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-stone-300 text-xs font-mono border border-white/10 select-none">
                  Photo {activePhotoInModal + 1} of {activeAlbum.items.length}
                </div>
              </div>

              {/* Right: Album Metadata & Photo Thumbnails Sidebar */}
              <div className="w-full lg:w-96 p-5 sm:p-7 flex flex-col justify-between space-y-5 overflow-y-auto bg-stone-50/90 border-t lg:border-t-0 lg:border-l border-stone-200 shrink-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {activeAlbum.category}
                    </span>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="hidden lg:inline-flex p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                      {activeAlbum.title}
                    </h2>
                    <div className="text-xs font-mono text-stone-500 mt-1 flex items-center gap-1.5">
                      <MapPin size={12} className="text-amber-600" />
                      <span>{activeAlbum.village}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-stone-200 text-xs font-sans">
                    <div>
                      <span className="font-mono text-stone-400 uppercase text-[10px] block font-semibold">Campus</span>
                      <span className="font-bold text-stone-900 text-sm">
                        {activeAlbum.campusTag}
                      </span>
                    </div>

                    {activeAlbum.caption && (
                      <div>
                        <span className="font-mono text-stone-400 uppercase text-[10px] block font-semibold">Album Description</span>
                        <p className="text-stone-700 text-xs sm:text-sm leading-relaxed mt-1 font-sans">
                          {activeAlbum.caption}
                        </p>
                      </div>
                    )}

                    {/* Active photograph caption if distinct */}
                    {activeAlbum.items[activePhotoInModal]?.caption && (
                      <div className="bg-white p-3 rounded-xl border border-stone-200">
                        <span className="font-mono text-stone-400 uppercase text-[10px] block font-semibold">Current Photograph</span>
                        <p className="text-stone-800 text-xs mt-1 font-medium">
                          {activeAlbum.items[activePhotoInModal].caption}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Album Photo Thumbnails Filmstrip */}
                  {activeAlbum.items.length > 1 && (
                    <div className="space-y-1.5 pt-3 border-t border-stone-200">
                      <span className="font-mono text-stone-400 uppercase text-[10px] block font-semibold">
                        Photos in this Album ({activeAlbum.items.length})
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {activeAlbum.items.map((it, idx) => (
                          <button
                            key={it.id || idx}
                            onClick={() => setActivePhotoInModal(idx)}
                            className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${idx === activePhotoInModal
                                ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20'
                                : 'border-stone-200 opacity-60 hover:opacity-100'
                              }`}
                          >
                            <img src={it.url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Link to Full Gallery */}
                <div className="pt-4 border-t border-stone-200 space-y-2">
                  <Link
                    to="/gallery"
                    onClick={closeModal}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#111b5e] hover:bg-[#0b132b] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Browse All Campuses in Gallery</span>
                    <ArrowRight size={14} className="text-amber-300" />
                  </Link>
                  <p className="text-[11px] text-stone-500 font-mono text-center">
                    Shri Nirakar Education Society Photographic Archives
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
};

export default CampusMomentsSection;
