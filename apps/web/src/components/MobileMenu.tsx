import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X, ChevronDown, Building2, GraduationCap, BookOpen, ArrowRight, UserPlus, Phone, Lock } from 'lucide-react';
import type { CurrentAuthUser } from '../hooks/useCurrentAuthUser.js';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: CurrentAuthUser | null;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, authUser }) => {
  const isFaculty = authUser?.role === 'FACULTY';
  const isAlumni = authUser?.role === 'ALUMNI';
  const facultyProfileHref = authUser?.facultyProfile?.id ? `/faculty/${authUser.facultyProfile.id}` : '/faculty/dashboard';
  const alumniProfileHref = `/alumni/${authUser?.alumniProfile?.username || authUser?.username || ''}`;

  const menuRef = useRef<HTMLDivElement>(null);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [campusesOpen, setCampusesOpen] = useState(false);

  useEffect(() => {
    const menuEl = menuRef.current;
    if (!menuEl) return;

    if (isOpen) {
      gsap.fromTo(menuEl, { x: '100%' }, { x: '0%', duration: 0.3, ease: 'power3.out' });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(menuEl, { x: '100%', duration: 0.3, ease: 'power3.in' });
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="fixed inset-0 z-[60] bg-white transform translate-x-full lg:hidden overflow-y-auto"
    >
      <div className="p-5 flex justify-between items-center border-b border-stone-100">
        <span className="font-serif font-bold text-stone-800">Menu</span>
        <button onClick={onClose} className="p-2 text-stone-600 hover:text-brand-900">
          <X size={24} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <a href="/" onClick={onClose} className="block py-2 font-serif font-bold text-stone-800 border-b border-stone-100">Home</a>
        <a href="/society" onClick={onClose} className="block py-2 font-serif font-bold text-stone-800 border-b border-stone-100">About Society</a>

        <div>
          <button onClick={() => setCampusesOpen(!campusesOpen)} className="w-full flex justify-between items-center py-2 font-serif font-bold text-stone-800">
            Campuses <ChevronDown size={18} />
          </button>
          {campusesOpen && (
            <div className="pl-4 py-2 space-y-2 text-sm text-stone-600">
              <a href="/institutions/nirakar-high-school" onClick={onClose} className="block">Shri Nirakar High School</a>
              <a href="/institutions/tudal-high-school" onClick={onClose} className="block">Tudal High School</a>
              <a href="/institutions/angle-higher-secondary" onClick={onClose} className="block">S.S. Angle Higher Secondary</a>
            </div>
          )}
        </div>

        <div>
          <button onClick={() => setAcademicsOpen(!academicsOpen)} className="w-full flex justify-between items-center py-2 font-serif font-bold text-stone-800">
            Academics <ChevronDown size={18} />
          </button>
          {academicsOpen && (
            <div className="pl-4 py-2 space-y-2 text-sm text-stone-600">
              <a href="/admissions" onClick={onClose} className="block">Admissions</a>
              <a href="/academics" onClick={onClose} className="block">Programs</a>
            </div>
          )}
        </div>

        <a href="/faculty" onClick={onClose} className="block py-2 font-serif font-bold text-stone-800">Faculty</a>
        <a href="/magazine" onClick={onClose} className="block py-2 font-serif font-bold text-stone-800">Daily Magazine</a>
        <a href="/alumni" onClick={onClose} className="block py-2 font-serif font-bold text-stone-800">Alumni Sanctuary</a>
        <a href="/contact" onClick={onClose} className="block py-2 font-serif font-bold text-stone-800">Contact</a>
      </div>
    </div>
  );
};
