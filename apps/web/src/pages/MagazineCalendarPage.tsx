import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { Footer } from '../components/Footer.js';
import { BookOpen, Calendar as CalendarIcon, Lock, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export const MagazineCalendarPage: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['magazine_calendar', currentYear, currentMonth],
    queryFn: async () => {
      const res = await fetch(`/api/v1/magazine/calendar?year=${currentYear}&month=${currentMonth}`);
      if (!res.ok) throw new Error('Failed to load magazine calendar');
      const json = await res.json();
      return json.data || [];
    },
  });

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate days in month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <>
      <Helmet>
        <title>Shri Nirakar Daily Magazine — Publication Calendar & Archives</title>
        <meta
          name="description"
          content="Browse daily issues, back issues, and publication archives of Shri Nirakar Daily Magazine (Shri Nirakar High School)."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-[#FAF7F2] pb-20 font-sans">
        {/* Header: Seamlessly tucked under Navbar golden curve with ZERO gap */}
        <div className="w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
          {/* Thread-like curve wave strips in light orange / amber */}
          <HeroWaves opacity={0.85} />

          <div className="max-w-5xl mx-auto space-y-4 text-center relative z-10">
            <span className="text-xs uppercase font-serif font-bold tracking-widest text-amber-300 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block">
              Shri Nirakar High School • Daily Archives
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Shri Nirakar Daily Magazine
            </h1>
            <p className="text-sm sm:text-base text-stone-300 font-sans max-w-xl mx-auto leading-relaxed">
              Circulated exclusively within Shri Nirakar High School. Explore daily morning issues, student dispatches, academic commentary, and school historical records.
            </p>
          </div>
        </div>

        <SectionEdge variant="wave" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
          {/* Calendar Controls */}
          <div className="bg-cream p-6 rounded-3xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
                aria-label="Previous Month"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink">
                {monthNames[currentMonth - 1]} {currentYear}
              </h2>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0b132b]" />
                <span>Published Issue</span>
              </div>
              <span className="text-stone-300">•</span>
              <div className="flex items-center gap-1">
                <Lock size={12} className="text-stone-500" />
                <span>Pass Protected</span>
              </div>
            </div>
          </div>

          {/* Month Calendar Grid */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm">
            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-serif font-bold text-stone-400 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty leading days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square bg-stone-50/50 rounded-xl" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(
                  dayNum
                ).padStart(2, '0')}`;
                const issue = issues.find((iss: any) => iss.publishDate === dateStr);

                return (
                  <div
                    key={dayNum}
                    className={`aspect-square rounded-2xl p-2 flex flex-col justify-between border transition-all ${
                      issue
                        ? 'bg-blue-50/40 border-blue-200 hover:border-[#0b132b] shadow-sm hover:shadow-md cursor-pointer'
                        : 'bg-white border-stone-100 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-semibold">
                      <span className={issue ? 'text-[#0b132b]' : 'text-stone-400'}>{dayNum}</span>
                      {issue?.isLocked && <Lock size={11} className="text-amber-600" />}
                    </div>

                    {issue && (
                      <a
                        href={`/magazine/issue/${issue.publishDate}`}
                        className="w-full text-center py-1 rounded-lg bg-[#0b132b] text-white text-[10px] font-serif font-bold hover:bg-[#16247e] transition-colors"
                      >
                        Read
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};
