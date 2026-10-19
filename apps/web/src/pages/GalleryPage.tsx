import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { Image as ImageIcon, X } from 'lucide-react';

const ALBUMS = [
  { id: 1, title: 'Annual Sports & Athletics Meet at Mashem Grounds', category: 'Sports', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80' },
  { id: 2, title: 'Science Laboratory Experiment Sessions', category: 'Academics', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80' },
  { id: 3, title: 'Goa Liberation Day & Republic Day Parade', category: 'Cultural', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80' },
  { id: 4, title: 'Tudal High School Campus & Nature Garden', category: 'Campus', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80' },
  { id: 5, title: 'S.S. Angle HSS Science Project Presentations', category: 'Academics', image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80' },
  { id: 6, title: 'Silver Jubilee Alumni Gathering & Felicitation', category: 'Alumni', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80' },
];

export const GalleryPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#0f172a] flex flex-col font-sans">
      <Helmet>
        <title>Campus Photo Gallery | Shree Nirakar Education Society</title>
        <meta name="description" content="View photo archives of campus events, science fairs, sports meets, and alumni reunions." />
      </Helmet>

      <Navbar />

      {/* Header Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
      <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
        {/* Thread-like curve wave strips in light orange / amber */}
        <HeroWaves opacity={0.85} />

        <div className="w-full relative z-10 max-w-5xl space-y-3">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block">
            Visual Memories
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black mt-2 tracking-tight leading-tight">
            Campus Photo Archives
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Capturing five decades of academic discipline, sports championships, and cultural heritage in Canacona.
          </p>
        </div>
      </div>

      <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

      <main className="w-full flex-1 px-4 sm:px-8 lg:px-12 xl:px-16 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {ALBUMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item.image)}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#0b132b]/80 backdrop-blur-sm text-accent-400 px-3 py-1 rounded text-xs font-semibold">
                  {item.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-base font-bold text-ink group-hover:text-[#16247e] transition-colors leading-snug">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img src={selectedImage} alt="Enlarged" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
