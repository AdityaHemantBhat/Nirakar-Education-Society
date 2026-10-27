import React, { useState, useEffect, useRef } from 'react';
import { Search, X, GraduationCap, BookOpen, Users, FileText, ArrowRight, Sparkles, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

interface SearchResultItem {
  id: string;
  title: string;
  type: 'result' | 'library' | 'faculty' | 'notice';
  subtitle: string;
  url: string;
}

export const GlobalSearch: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Industry-standard bulletproof scroll lock (position fixed on body)
  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const originalOverflow = document.body.style.overflow;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => inputRef.current?.focus(), 50);

    return () => {
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;
      window.scrollTo(0, scrollY);

      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['global_live_search', query],
    enabled: isOpen && query.trim().length >= 2,
    queryFn: async () => {
      const q = encodeURIComponent(query.trim());
      const [resResults, libResults, facultyRes] = await Promise.all([
        fetch(`/api/v1/results?search=${q}&limit=5`).then((r) => r.json()).catch(() => ({ success: false })),
        fetch(`/api/v1/library/catalog?q=${q}&limit=5`).then((r) => r.json()).catch(() => ({ success: false })),
        fetch(`/api/v1/faculty?search=${q}&limit=5`).then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      const items: SearchResultItem[] = [];

      if (resResults.success && resResults.data?.items) {
        resResults.data.items.forEach((item: any) => {
          items.push({
            id: item.id,
            title: item.title || `Std ${item.standard} Result: ${item.studentName || 'Official List'}`,
            type: 'result',
            subtitle: `Std ${item.standard} · ${item.examType} (${item.academicYear})`,
            url: '/results',
          });
        });
      }

      if (libResults.success && libResults.data?.items) {
        libResults.data.items.forEach((item: any) => {
          items.push({
            id: item.id,
            title: item.title,
            type: 'library',
            subtitle: `Library Volume · Std ${item.standard} (${item.author || item.publisher || 'Nirakar'})`,
            url: `/library/volume/${item.slug}`,
          });
        });
      }

      if (facultyRes.success && facultyRes.data) {
        facultyRes.data.forEach((item: any) => {
          items.push({
            id: item.id,
            title: item.user?.name || item.designation,
            type: 'faculty',
            subtitle: `${item.designation} · ${item.department} (${item.institutionCode})`,
            url: `/faculty/${item.id}`,
          });
        });
      }

      return items;
    },
    staleTime: 30 * 1000,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] h-[100dvh] w-screen flex items-center justify-center p-3 sm:p-4 bg-[#0b132b]/75 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      {/* Modal Container (stops click propagation so clicking inside doesn't close) */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-stone-200/80 z-10 flex flex-col m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight Search Header */}
        <div className="p-5 sm:p-6 pb-4 bg-white border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3 rounded-2xl bg-stone-50/80 border border-stone-200/80 px-4 py-3.5 focus-within:bg-white focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all duration-200 shadow-inner">
            <Search size={20} className="text-amber-600 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search academic results, faculty, library volumes, notices..."
              className="w-full bg-transparent text-stone-900 placeholder:text-stone-400 font-sans text-sm sm:text-base font-medium outline-none focus:outline-none ring-0 focus:ring-0 invalid:border-stone-200"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-200/60 transition shrink-0"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-200/80 text-stone-700 hover:bg-stone-300 transition shrink-0 text-xs font-mono font-bold"
              title="Close search"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search Results Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {query.trim().length < 2 ? (
            <div className="py-8 px-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3 shadow-xs">
                <Sparkles size={22} />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">What are you looking for today?</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1 leading-relaxed">
                Type at least 2 characters to instantly search across examination results, digital library books, and faculty profiles.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                {['Std X Results', 'Science', 'Library', 'Principal', 'Admissions', 'Magazine'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 hover:bg-brand-50 hover:text-brand-700 px-3.5 py-1.5 text-xs font-semibold text-stone-700 transition border border-stone-200/60 shadow-2xs"
                  >
                    <Compass size={12} className="text-amber-600" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-700 border-t-transparent" />
              <p className="text-xs font-medium text-stone-500 animate-pulse">Searching Nirakar records...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 mb-3">
                <Search size={22} />
              </div>
              <h4 className="font-serif text-base font-bold text-stone-800">No matching records found for "{query}"</h4>
              <p className="text-xs text-stone-500 mt-1">Try checking your spelling or searching for a broader term like "Std X", "Science", or faculty names.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-stone-400 flex items-center justify-between">
                <span>Matching Results</span>
                <span className="text-brand-700">{searchResults.length} found</span>
              </div>
              {searchResults.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    navigate(item.url);
                    onClose();
                  }}
                  className="group flex items-center justify-between rounded-2xl p-4 bg-stone-50/60 hover:bg-brand-50/80 cursor-pointer transition border border-stone-200/50 hover:border-brand-300 shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white group-hover:bg-brand-700 text-stone-700 group-hover:text-white shadow-xs transition duration-300">
                      {item.type === 'result' ? <GraduationCap size={20} /> : item.type === 'library' ? <BookOpen size={20} /> : <Users size={20} />}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="font-bold font-serif text-sm sm:text-base text-stone-900 truncate group-hover:text-brand-900 transition">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-500 font-medium truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white group-hover:bg-brand-700 text-stone-400 group-hover:text-white shadow-2xs transition shrink-0 ml-3">
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-stone-50/90 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono shrink-0">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded bg-stone-200 px-1.5 py-0.5 font-sans font-semibold text-stone-700">ESC</kbd> to close
          </span>
          <span className="font-serif font-bold text-[#111b5e]">Shree Nirakar Education Society</span>
        </div>
      </div>
    </div>
  );
};
