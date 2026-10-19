import React, { useState } from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { SectionEdge } from '@nirakar/ui';

interface EventItem {
  id: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  coverUrl?: string | null;
  institutionCode?: string | null;
}

interface EventsStripProps {
  upcoming?: EventItem[];
  past?: EventItem[];
}

export const EventsStrip: React.FC<EventsStripProps> = ({ upcoming = [], past = [] }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const activeEvents = activeTab === 'upcoming' ? upcoming : past;

  return (
    <section className="relative bg-cream py-16 md:py-24 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase font-serif font-bold tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200/60">
              Campus Happenings
            </span>
            <h2 className="font-serif text-3xl font-bold text-ink tracking-tight">
              Institutional Events
            </h2>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-paper p-1.5 rounded-2xl border border-stone-200 shadow-sm self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-ink'
              }`}
            >
              Upcoming Events
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-serif font-bold transition-all ${
                activeTab === 'past'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-ink'
              }`}
            >
              Past Events
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {activeEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-paper rounded-2xl border border-stone-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs font-mono text-brand-800">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-accent-600" />
                      <span>{evt.startDate}</span>
                    </div>
                    {evt.location && (
                      <div className="flex items-center gap-1.5 text-stone-500">
                        <MapPin size={14} />
                        <span>{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-bold text-ink group-hover:text-brand-700 transition-colors">
                    {evt.title}
                  </h3>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-serif font-semibold text-brand-700">
                  <span>Event Details</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-paper rounded-2xl border border-stone-200 p-8 text-center max-w-md mx-auto space-y-2">
            <Calendar size={28} className="mx-auto text-stone-400" />
            <h4 className="font-serif text-sm font-bold text-ink">No Scheduled Events</h4>
            <p className="text-xs text-stone-500 font-sans">
              All official calendar notifications will appear here once announced by school authorities.
            </p>
          </div>
        )}
      </div>

      <SectionEdge variant="scoop" color="#fbfaf7" height={38} />
    </section>
  );
};
