import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string | number;
  description?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  label?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  enableSearch?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select option...',
  className = '',
  containerClassName = '',
  menuClassName = '',
  align = 'left',
  enableSearch = false,
  disabled = false,
  size = 'sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownId = useId();

  const isFullWidth = className.includes('w-full') || containerClassName.includes('w-full');

  // Normalize options to SelectOption format
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && enableSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, enableSearch]);

  // Close on Escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Filter options if search query is typed
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      (opt.description && opt.description.toLowerCase().includes(q))
    );
  });

  const shouldShowSearch = enableSearch || normalizedOptions.length > 8;

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative ${isFullWidth ? 'w-full flex' : 'inline-flex'} items-center text-left ${isOpen ? 'z-50' : 'z-auto'} ${containerClassName}`}
    >
      {label && (
        <span className="text-xs font-serif font-semibold text-stone-500 mr-2 shrink-0 select-none">
          {label}
        </span>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={dropdownId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`${isFullWidth ? 'w-full flex' : 'inline-flex'} items-center justify-between gap-2.5 rounded-xl border transition-all duration-200 ease-out cursor-pointer select-none text-left ${
          size === 'sm' ? 'h-9 px-3 text-xs' : 'h-10 px-3.5 text-xs sm:text-sm'
        } ${
          isOpen
            ? 'bg-white border-amber-400 shadow-sm ring-2 ring-amber-500/10 text-stone-900'
            : 'bg-stone-50/90 hover:bg-stone-100 border-stone-200 hover:border-amber-400/90 text-stone-800 shadow-xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <span className={`font-sans font-medium text-stone-800 flex-1 text-left truncate ${size === 'sm' ? 'text-xs' : 'text-xs sm:text-sm'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={size === 'sm' ? 14 : 16}
          className={`shrink-0 text-stone-400 transition-transform duration-200 ml-1.5 ${
            isOpen ? 'rotate-180 text-amber-600' : 'group-hover:text-stone-600'
          }`}
        />
      </button>

      {/* Floating Dropdown Menu Panel */}
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={dropdownId}
          className={`absolute top-full mt-1.5 z-50 bg-white rounded-2xl border border-stone-200 shadow-xl p-1.5 ${
            isFullWidth ? 'w-full left-0 right-0 min-w-full' : 'min-w-[220px] max-w-sm'
          } max-h-72 flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200 ${
            !isFullWidth && align === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
        >
          {/* Optional In-Menu Quick Search for large lists */}
          {shouldShowSearch && (
            <div className="p-1.5 pb-2 border-b border-stone-100">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Filter options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-sans text-stone-800 placeholder-stone-400 outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto space-y-0.5 py-1 max-h-60 scrollbar-thin scrollbar-thumb-stone-200">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-stone-400 font-sans">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm transition-colors duration-150 ease-out cursor-pointer font-sans ${
                      isSelected
                        ? 'bg-amber-50 text-amber-950 font-bold border border-amber-200/70 shadow-2xs'
                        : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <div className="min-w-0 flex-1 text-left">
                      <div className="font-sans font-medium text-stone-800 break-words leading-relaxed">
                        {opt.label}
                      </div>
                      {opt.description && (
                        <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                          {opt.description}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 ml-2">
                      {opt.badge !== undefined && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-amber-200/60 text-amber-900 font-bold'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check size={14} className="text-amber-600" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
