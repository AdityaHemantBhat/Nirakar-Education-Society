import React, { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronDown } from 'lucide-react';

export type SelectOption = { value: string; label: string; shortLabel?: string };

interface AdminSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  compact?: boolean;
  disabled?: boolean;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
}

/** Bespoke modern custom dropdown (No raw browser select) */
export const AdminSelect: React.FC<AdminSelectProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select an option...',
  compact = false,
  disabled = false,
  icon: Icon = Building2,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedItem = options.find((i) => i.value === value);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`group flex w-full select-none items-center justify-between border bg-white text-left shadow-xs transition-all ${
          disabled ? 'cursor-not-allowed opacity-60 bg-slate-50' : 'cursor-pointer'
        } ${
          compact ? 'rounded-lg px-3 py-2 text-xs' : 'rounded-xl px-4 py-3 text-sm'
        } ${
          isOpen
            ? 'border-brand-700 shadow-md ring-2 ring-brand-700/20'
            : 'border-slate-300 hover:border-slate-400 hover:shadow-xs'
        }`}
      >
        <div className="flex min-w-0 items-center gap-2.5 pr-2">
          <div
            className={`flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-brand-50 group-hover:text-brand-700 ${
              compact ? 'h-5 w-5' : 'h-7 w-7'
            }`}
          >
            <Icon size={compact ? 12 : 15} />
          </div>
          <span className="truncate font-semibold text-slate-900">
            {selectedItem ? (compact && selectedItem.shortLabel ? selectedItem.shortLabel : selectedItem.label) : placeholder}
          </span>
        </div>

        <ChevronDown
          size={compact ? 14 : 16}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-700' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value || '__all__'}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                  isSelected
                    ? 'bg-brand-50 font-bold text-brand-800'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      isSelected ? 'bg-brand-700' : 'bg-slate-300'
                    }`}
                  />
                  <div className="truncate text-xs sm:text-sm">{option.label}</div>
                </div>
                {isSelected && <Check size={16} className="ml-2 shrink-0 text-brand-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CAMPUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All Society Campuses', shortLabel: 'All Campuses' },
  { value: 'NIRAKAR_HS', label: 'Shri Nirakar High School (Mashem)', shortLabel: 'Nirakar HS' },
  { value: 'TUDAL_HS', label: 'Tudal High School (Gaodongrem)', shortLabel: 'Tudal HS' },
  { value: 'ANGLE_HSS', label: 'S. S. Angle Higher Secondary School (Dapot)', shortLabel: 'Angle HSS' },
];

/** Campus-specific select preset used across admin pages */
export const CustomCampusSelect: React.FC<Omit<AdminSelectProps, 'options' | 'icon'>> = (props) => (
  <AdminSelect {...props} options={CAMPUS_OPTIONS} icon={Building2} placeholder="Select Campus..." />
);
