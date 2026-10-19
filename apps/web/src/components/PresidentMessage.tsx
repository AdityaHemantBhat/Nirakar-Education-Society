import React from 'react';
import { ArrowRight, Quote, Award } from 'lucide-react';

export const PresidentMessage: React.FC = () => {
  return (
    <section className="w-full bg-[#f8fafc] py-20 px-4 sm:px-8 lg:px-12 xl:px-16 border-b border-stone-200">
      <div className="w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-stone-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Portrait Column */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-brand-100 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
                  alt="President, Shree Nirakar Education Society"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-2 bg-[#16247e] text-white text-[11px] font-serif font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                Estd. 1968
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-serif text-xl font-bold text-ink">From the President’s Desk</h3>
              <p className="text-xs font-semibold text-accent-700 tracking-wider uppercase mt-1">
                Shree Nirakar Education Society
              </p>
              <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                Mashem, Canacona, South Goa
              </p>
            </div>
          </div>

          {/* Message Content Column */}
          <div className="lg:col-span-8 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-accent-100 text-accent-800 flex items-center justify-center">
              <Quote size={24} />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-snug">
              "Education is not merely about board certificates; it is the sacred awakening of self-reliance, moral integrity, and community devotion."
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
              <p>
                When our founding elders gathered in Mashem in 1968, Canacona was an isolated corner of South Goa where children walked miles across rivers and hill paths just to access basic high schooling. Our pioneers resolved that geographical remoteness must never dictate the destiny of our youth.
              </p>
              <p>
                Today, with Shri Nirakar High School, Tudal High School in Gaondongrem, and S.S. Angle Higher Secondary School, our classrooms have empowered over 16,500 boys and girls. Our alumni serve with distinction as magistrates, physicians, civil administrators, teachers, and business innovators across India and overseas.
              </p>
              <p className="font-medium text-stone-800">
                We welcome parents, alumni, and friends of education to join hands with us as we expand modern digital infrastructure while remaining deeply rooted in our Goan moral values.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <a
                href="/society/vision"
                className="inline-flex items-center gap-2 bg-[#16247e] hover:bg-[#111b5e] text-white font-semibold text-xs px-5 py-3 rounded-lg shadow-sm transition-colors"
              >
                <span>Read Full Society Charter</span>
                <ArrowRight size={14} />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-stone-700 hover:text-brand-900 font-semibold text-xs px-4 py-3"
              >
                <span>Meet the Governing Committee</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
