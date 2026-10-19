import React from 'react';
import { ShieldCheck, Award, ArrowRight, User } from 'lucide-react';
import { SectionEdge } from '@nirakar/ui';

interface AlumniAchiever {
  id: string;
  firstName: string;
  lastName: string;
  school: string;
  batchYear: number;
  photoUrl?: string | null;
  occupation?: string | null;
  city?: string | null;
  user?: { username: string };
}

interface AlumniAchieversProps {
  alumni?: AlumniAchiever[];
}

const SCHOOL_NAME_MAP: Record<string, string> = {
  NIRAKAR_HS: 'Shri Nirakar High School',
  TUDAL_HS: 'Tudal High School',
  ANGLE_HSS: 'S. S. Angle Higher Secondary School',
};

export const AlumniAchievers: React.FC<AlumniAchieversProps> = ({ alumni = [] }) => {
  return (
    <section className="relative bg-paper py-16 md:py-24 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <span className="text-xs uppercase font-serif font-bold tracking-widest text-brand-700 bg-brand-50 px-3.5 py-1 rounded-full border border-brand-200/60">
              Community Heritage
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
              Meet Our Proud Alumni
            </h2>
            <p className="text-sm sm:text-base text-ink-muted font-sans max-w-xl">
              From leaders in medicine and civil service to visionary scholars, our graduates shape communities worldwide.
            </p>
          </div>

          <a
            href="/alumni"
            className="inline-flex items-center gap-2 font-serif text-sm font-semibold text-brand-700 hover:text-brand-900 transition-colors group self-start md:self-end"
          >
            <span>Explore Complete Directory</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {alumni.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {alumni.map((member) => (
              <a
                key={member.id}
                href={`/alumni/${member.user?.username || member.id}`}
                className="bg-white rounded-2xl border border-stone-200/70 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-brand-700/40 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-stone-100 border-2 border-brand-100 shrink-0 relative">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <User size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-serif text-base font-bold text-ink group-hover:text-brand-700 transition-colors">
                          {member.firstName} {member.lastName}
                        </h3>
                        <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-xs text-stone-500 font-sans">
                        Class of {member.batchYear} • {SCHOOL_NAME_MAP[member.school] || member.school}
                      </p>
                    </div>
                  </div>

                  {member.occupation && (
                    <p className="text-sm font-serif font-semibold text-brand-800">
                      {member.occupation}
                    </p>
                  )}

                  {member.city && (
                    <p className="text-xs text-stone-500 font-sans">
                      Based in {member.city}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-brand-700 font-serif font-semibold">
                  <span>View Verified Profile</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="bg-cream rounded-2xl border border-stone-200 p-8 text-center max-w-lg mx-auto space-y-3">
            <Award className="mx-auto text-accent-600" size={32} />
            <h3 className="font-serif text-lg font-bold text-ink">Alumni Directory Opening</h3>
            <p className="text-xs sm:text-sm text-stone-600 font-sans">
              Verified alumni achiever profiles will appear here. If you studied at Shri Nirakar, Tudal, or S.S. Angle, join our registered network.
            </p>
            <a
              href="/alumni/register"
              className="inline-block mt-2 px-5 py-2 rounded-xl bg-brand-700 text-white font-serif text-xs font-semibold hover:bg-brand-800 transition-colors"
            >
              Register Your Profile
            </a>
          </div>
        )}
      </div>

      <SectionEdge variant="wave" color="#f4f1ea" height={40} />
    </section>
  );
};
