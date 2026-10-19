import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Pin,
  MapPin,
  Search,
  RefreshCw,
  Image as ImageIcon,
  ArrowLeft,
  ExternalLink,
  Info,
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sunrise,
  Sun,
  Moon,
  Sparkles,
  Building2,
  RotateCcw,
  Eye,
  Video,
  Film,
  Play,
  Layers,
  FilePlus,
  Share2,
} from 'lucide-react';

export interface EventPhotoItem {
  id?: string;
  url: string;
  caption?: string; // SEO Caption
  altText?: string; // SEO Alt text
}

export interface EventDocumentItem {
  id?: string;
  url: string;
  title: string; // SEO custom document display name
  size?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  isUpcoming: boolean;
  coverUrl: string | null;
  pdfUrl?: string | null;
  photos?: EventPhotoItem[] | null;
  documents?: EventDocumentItem[] | null;
  videoUrl?: string | null;
  institutionCode: string | null;
  createdAt?: string;
}

export interface NoticeItem {
  id: string;
  refNo?: string;
  urgent?: boolean;
  title: string;
  content: string | null;
  date: string;
  pinned: boolean;
  pdfUrl: string | null;
  institutionCode: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  institutionCode: string;
  isUpcoming: boolean;
  coverUrl: string;
  pdfUrl: string;
  photos: EventPhotoItem[];
  documents: EventDocumentItem[];
  videoUrl: string;
}

export interface NoticeFormData {
  title: string;
  refNo: string;
  urgent: boolean;
  content: string;
  date: string;
  pinned: boolean;
  pdfUrl: string;
  institutionCode: string;
}

/** Encode metadata (Ref No. & Urgent) inside notice content header */
export function encodeNoticeMeta(body: string, meta: { refNo?: string; urgent?: boolean }): string {
  const cleanRef = meta.refNo ? meta.refNo.trim() : '';
  const isUrgent = Boolean(meta.urgent);
  if (!cleanRef && !isUrgent) {
    return body;
  }
  const header = `<!--NOTICE_META:${JSON.stringify({ refNo: cleanRef, urgent: isUrgent })}-->\n`;
  return header + (body || '');
}

/** Decode metadata (Ref No. & Urgent) from notice content header */
export function decodeNoticeMeta(rawContent: string | null | undefined): { content: string; refNo: string; urgent: boolean } {
  if (!rawContent) return { content: '', refNo: '', urgent: false };
  const match = rawContent.match(/^<!--NOTICE_META:(\{.*?\})-->\n?/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      return {
        content: rawContent.slice(match[0].length),
        refNo: parsed.refNo || '',
        urgent: Boolean(parsed.urgent),
      };
    } catch {}
  }
  return { content: rawContent, refNo: '', urgent: false };
}

/** Sanitize and convert video link to safe embed URL (YouTube, Vimeo, or direct video) */
export function getSafeVideoEmbedUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // YouTube standard watch or shorts or youtu.be
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Direct video file (must be HTTPS or relative uploads path)
  if (trimmed.startsWith('/uploads/') || trimmed.match(/^https:\/\/.+\.(mp4|webm|mov|mkv)(\?.*)?$/i)) {
    return trimmed;
  }

  return null;
}

const INSTITUTIONS = [
  { code: '', label: 'All Society Campuses', short: 'All Campuses' },
  { code: 'NIRAKAR_HS', label: 'Shri Nirakar High School (Mashem)', short: 'Nirakar HS' },
  { code: 'TUDAL_HS', label: 'Tudal High School (Gaodongrem)', short: 'Tudal HS' },
  { code: 'ANGLE_HSS', label: 'S. S. Angle Higher Secondary School (Dapot)', short: 'Angle HSS' },
];

const MAX_PDF_MB = 15; // 15MB limit with buffer for exact 10MB PDFs and metadata

/** Clean hover tooltip for concise info without clutter */
const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => {
          e.preventDefault();
          setShow((prev) => !prev);
        }}
        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        aria-label="Information"
      >
        <Info size={14} />
      </button>
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};

interface CustomCampusSelectProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  compact?: boolean;
}

/** Bespoke modern custom dropdown for campus selection (No raw browser select) */
const CustomCampusSelect: React.FC<CustomCampusSelectProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select Campus...',
  compact = false,
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

  const selectedItem = INSTITUTIONS.find((i) => i.code === value) || INSTITUTIONS[0];

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full border bg-white flex items-center justify-between text-left transition-all shadow-xs select-none cursor-pointer group ${
          compact ? 'px-3 py-2 rounded-lg text-xs' : 'px-4 py-3 rounded-xl text-sm'
        } ${
          isOpen
            ? 'border-brand-700 ring-2 ring-brand-700/20 shadow-md'
            : 'border-slate-300 hover:border-slate-400 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div
            className={`rounded-lg bg-slate-100 group-hover:bg-brand-50 text-slate-500 group-hover:text-brand-700 flex items-center justify-center shrink-0 transition-colors ${
              compact ? 'w-5 h-5' : 'w-7 h-7'
            }`}
          >
            <Building2 size={compact ? 12 : 15} />
          </div>
          <span className="font-semibold text-slate-900 truncate">
            {selectedItem ? (compact ? selectedItem.short : selectedItem.label) : placeholder}
          </span>
        </div>

        <ChevronDown
          size={compact ? 14 : 16}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-brand-700' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 animate-in fade-in zoom-in-95 duration-100 overflow-hidden max-h-64 overflow-y-auto">
          {INSTITUTIONS.map((inst) => {
            const isSelected = inst.code === value;
            return (
              <button
                key={inst.code}
                type="button"
                onClick={() => {
                  onChange(inst.code);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-brand-50 text-brand-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isSelected ? 'bg-brand-700' : 'bg-slate-300'
                    }`}
                  />
                  <div className="truncate text-xs sm:text-sm">{inst.label}</div>
                </div>
                {isSelected && <Check size={16} className="text-brand-700 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// CUSTOM DATE & TIME PICKER HELPERS & COMPONENTS
// =========================================================================

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function parseDateTime(val: string) {
  if (!val) {
    const now = new Date();
    const h24 = now.getHours();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      hour12: h24 % 12 || 12,
      minute: Math.floor(now.getMinutes() / 5) * 5,
      ampm: (h24 >= 12 ? 'PM' : 'AM') as 'AM' | 'PM',
    };
  }
  const [datePart, timePart] = val.split('T');
  if (datePart && timePart) {
    const [y, m, d] = datePart.split('-').map(Number);
    const [h24, min] = timePart.split(':').map(Number);
    const hour12 = h24 % 12 || 12;
    const ampm: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
    return {
      year: y || new Date().getFullYear(),
      month: m ? m - 1 : 0,
      day: d || 1,
      hour12,
      minute: min || 0,
      ampm,
    };
  }
  const d = new Date(val);
  const h24 = d.getHours();
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
    hour12: h24 % 12 || 12,
    minute: d.getMinutes(),
    ampm: (h24 >= 12 ? 'PM' : 'AM') as 'AM' | 'PM',
  };
}

function formatDateTime(
  year: number,
  month: number,
  day: number,
  hour12: number,
  minute: number,
  ampm: 'AM' | 'PM'
) {
  let h24 = hour12 % 12;
  if (ampm === 'PM') h24 += 12;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(h24)}:${pad(minute)}`;
}

function formatDisplayDate(val: string) {
  if (!val) return '';
  const datePart = val.includes('T') ? val.split('T')[0] : val;
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return val;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDisplayTime(val: string) {
  if (!val || !val.includes('T')) return '';
  const timePart = val.split('T')[1];
  const [h24, min] = timePart.split(':').map(Number);
  const hour12 = h24 % 12 || 12;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hour12)}:${pad(min)} ${ampm}`;
}

const TIME_PRESETS = [
  { label: '08:30 AM', sub: 'Assembly', h12: 8, min: 30, ap: 'AM' as const },
  { label: '10:00 AM', sub: 'Morning', h12: 10, min: 0, ap: 'AM' as const },
  { label: '12:00 PM', sub: 'Noon', h12: 12, min: 0, ap: 'PM' as const },
  { label: '02:30 PM', sub: 'Afternoon', h12: 2, min: 30, ap: 'PM' as const },
  { label: '04:30 PM', sub: 'Closing', h12: 4, min: 30, ap: 'PM' as const },
  { label: '06:00 PM', sub: 'Evening', h12: 6, min: 0, ap: 'PM' as const },
];

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

interface DateTimePickerProps {
  label: string;
  value: string; // "YYYY-MM-DDTHH:mm"
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
  isOptional?: boolean;
}

const CustomDateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = 'Select date & time...',
  isOptional = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsed = parseDateTime(value);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  useEffect(() => {
    if (value) {
      const p = parseDateTime(value);
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value, isOpen]);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowMonthGrid(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleDocClick);
    }
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const current = parseDateTime(value);
    const newStr = formatDateTime(viewYear, viewMonth, day, current.hour12, current.minute, current.ampm);
    onChange(newStr);
  };

  const handleTimeChange = (hour12: number, minute: number, ampm: 'AM' | 'PM') => {
    const current = parseDateTime(value);
    const day = value ? current.day : new Date().getDate();
    const year = value ? current.year : viewYear;
    const month = value ? current.month : viewMonth;
    const newStr = formatDateTime(year, month, day, hour12, minute, ampm);
    onChange(newStr);
  };

  const handleStepHour = (delta: number) => {
    let nextH = parsed.hour12 + delta;
    if (nextH > 12) nextH = 1;
    if (nextH < 1) nextH = 12;
    handleTimeChange(nextH, parsed.minute, parsed.ampm);
  };

  const handleStepMinute = (delta: number) => {
    let nextMin = Math.round(parsed.minute / 5) * 5 + delta;
    let nextH = parsed.hour12;
    let nextAmPm = parsed.ampm;
    if (nextMin >= 60) {
      nextMin = 0;
      nextH = nextH === 12 ? 1 : nextH + 1;
    } else if (nextMin < 0) {
      nextMin = 55;
      nextH = nextH === 1 ? 12 : nextH - 1;
    }
    handleTimeChange(nextH, nextMin, nextAmPm);
  };

  const handleQuickPreset = (preset: 'today' | 'tomorrow' | 'nextMon' | 'nextMonth') => {
    const now = new Date();
    const cur = parseDateTime(value);
    let target = new Date();
    if (preset === 'today') {
      target = new Date();
    } else if (preset === 'tomorrow') {
      target.setDate(now.getDate() + 1);
    } else if (preset === 'nextMon') {
      const day = now.getDay();
      const diff = day === 0 ? 1 : 8 - day;
      target.setDate(now.getDate() + diff);
    } else if (preset === 'nextMonth') {
      target.setMonth(now.getMonth() + 1);
    }
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
    const newStr = formatDateTime(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
      cur.hour12,
      cur.minute,
      cur.ampm
    );
    onChange(newStr);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const currentSelection = value ? parseDateTime(value) : null;
  const isSelected = (day: number) => {
    if (!currentSelection) return false;
    return (
      currentSelection.year === viewYear &&
      currentSelection.month === viewMonth &&
      currentSelection.day === day
    );
  };

  const isToday = (day: number) => {
    const now = new Date();
    return (
      now.getFullYear() === viewYear &&
      now.getMonth() === viewMonth &&
      now.getDate() === day
    );
  };

  const isMorning = parsed.ampm === 'AM' && parsed.hour12 < 12;
  const isAfternoon = parsed.ampm === 'PM' && (parsed.hour12 === 12 || parsed.hour12 < 5);

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Styled Interactive Trigger Input */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 py-3 rounded-xl border bg-white flex items-center justify-between cursor-pointer transition-all shadow-xs select-none group ${
          isOpen
            ? 'border-brand-700 ring-2 ring-brand-700/20 shadow-md'
            : 'border-slate-300 hover:border-slate-400 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              value
                ? 'bg-brand-50 text-brand-700 border border-brand-200/60'
                : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200/70'
            }`}
          >
            <Calendar size={18} />
          </div>
          {value ? (
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                {formatDisplayDate(value)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-50 text-brand-800 border border-brand-200/80 shadow-2xs">
                <Clock size={12} className="text-brand-700" />
                <span>{formatDisplayTime(value)}</span>
              </span>
            </div>
          ) : (
            <span className="text-sm text-slate-400 font-normal">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {isOptional && value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
              title="Clear date & time"
            >
              <X size={15} />
            </button>
          )}
          <div className={`p-1 rounded-md text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-700' : ''}`}>
            <ChevronDown size={17} />
          </div>
        </div>
      </div>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute z-50 left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 ring-1 ring-slate-900/5 p-4 sm:p-5 w-full max-w-[380px] sm:max-w-[410px] animate-in fade-in zoom-in-95 duration-150">
          {/* Segmented Mode Switcher (Date & Time Tabs) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('date');
                setShowMonthGrid(false);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'date'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar size={13} />
              <span>{value ? formatDisplayDate(value).split(',')[1]?.trim() || 'Date' : 'Date'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('time')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'time'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock size={13} />
              <span>{value ? formatDisplayTime(value) : 'Time'}</span>
            </button>
          </div>

          {activeTab === 'date' ? (
            /* ========================================================= */
            /* TAB 1: CALENDAR VIEW                                      */
            /* ========================================================= */
            <div className="space-y-3.5">
              {/* Quick Date Shortcuts Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('today')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-800 border border-slate-200/80 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('tomorrow')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-800 border border-slate-200/80 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('nextMon')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-800 border border-slate-200/80 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Next Mon
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('nextMonth')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-800 border border-slate-200/80 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  +1 Month
                </button>
              </div>

              {/* Month/Year Navigation */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft size={17} />
                </button>

                {/* Clickable Month/Year to toggle fast Month Grid */}
                <button
                  type="button"
                  onClick={() => setShowMonthGrid((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg hover:bg-slate-100 text-slate-900 font-bold text-sm transition-colors cursor-pointer"
                >
                  <span>{MONTHS_FULL[viewMonth]} {viewYear}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${showMonthGrid ? 'rotate-180 text-brand-700' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight size={17} />
                </button>
              </div>

              {/* If Month Grid Open: Jump to Month/Year */}
              {showMonthGrid ? (
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between px-2 pt-1 text-xs font-bold text-slate-700">
                    <button
                      type="button"
                      onClick={() => setViewYear((y) => y - 1)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span>{viewYear}</span>
                    <button
                      type="button"
                      onClick={() => setViewYear((y) => y + 1)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {MONTHS_SHORT.map((m, idx) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setViewMonth(idx);
                          setShowMonthGrid(false);
                        }}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          viewMonth === idx
                            ? 'bg-brand-700 text-white font-bold shadow-xs'
                            : 'text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Regular Calendar Day Grid */
                <div>
                  {/* Weekday Row */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((wd) => (
                      <span key={wd} className="text-[10px] font-bold text-slate-400 uppercase py-1 select-none">
                        {wd}
                      </span>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <span
                        key={`prev-${i}`}
                        className="text-xs text-slate-300 py-2 select-none flex items-center justify-center"
                      >
                        {prevMonthDays - firstDayOfWeek + i + 1}
                      </span>
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const selected = isSelected(day);
                      const today = isToday(day);

                      return (
                        <button
                          key={`day-${day}`}
                          type="button"
                          onClick={() => handleSelectDay(day)}
                          className={`w-9 h-9 mx-auto rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                            selected
                              ? 'bg-brand-700 text-white font-bold shadow-md shadow-brand-500/30 scale-105'
                              : today
                              ? 'bg-brand-50 text-brand-800 font-bold ring-1.5 ring-brand-300'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-105 active:scale-95'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date Tab Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('today')}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline cursor-pointer"
                >
                  Select Today
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('time')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-brand-800 bg-slate-100 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Clock size={12} className="text-brand-700" />
                  <span>Adjust Time →</span>
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* TAB 2: TIME PICKER VIEW (ULTRA MODERN TACTILE UI)         */
            /* ========================================================= */
            <div className="space-y-4">
              {/* Digital Hero Display Card */}
              <div className="bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 shadow-inner space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-1.5">
                    {isMorning ? (
                      <>
                        <Sunrise size={13} className="text-amber-400" />
                        <span className="text-amber-200">Morning Session</span>
                      </>
                    ) : isAfternoon ? (
                      <>
                        <Sun size={13} className="text-amber-300" />
                        <span className="text-amber-100">Afternoon Session</span>
                      </>
                    ) : (
                      <>
                        <Moon size={13} className="text-violet-300" />
                        <span className="text-violet-200">Evening / Ceremony</span>
                      </>
                    )}
                  </span>
                  <span className="text-slate-500 font-mono">12-Hour Clock</span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  {/* Hour Display & Steppers */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => handleStepHour(1)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <span className="text-3xl font-mono font-bold tracking-wider text-white">
                      {String(parsed.hour12).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepHour(-1)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Hour</span>
                  </div>

                  <span className="text-2xl font-bold font-mono text-slate-600 -mt-4">:</span>

                  {/* Minute Display & Steppers */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => handleStepMinute(5)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <span className="text-3xl font-mono font-bold tracking-wider text-brand-500">
                      {String(parsed.minute).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepMinute(-5)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">Minute</span>
                  </div>

                  {/* AM / PM Toggle */}
                  <div className="flex flex-col gap-1.5 ml-2 -mt-4">
                    <button
                      type="button"
                      onClick={() => handleTimeChange(parsed.hour12, parsed.minute, 'AM')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        parsed.ampm === 'AM'
                          ? 'bg-brand-700 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTimeChange(parsed.hour12, parsed.minute, 'PM')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        parsed.ampm === 'PM'
                          ? 'bg-brand-700 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Preset Times */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-500" />
                  <span>Popular School Timings</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_PRESETS.map((pst) => (
                    <button
                      key={pst.label}
                      type="button"
                      onClick={() => handleTimeChange(pst.h12, pst.min, pst.ap)}
                      className="px-2 py-1.5 text-left rounded-lg bg-slate-50 hover:bg-brand-50 border border-slate-200/90 hover:border-brand-300 transition-colors cursor-pointer group"
                    >
                      <div className="text-[11px] font-bold text-slate-800 group-hover:text-brand-800">
                        {pst.label}
                      </div>
                      <div className="text-[9px] text-slate-400 group-hover:text-brand-700 truncate">
                        {pst.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tactile Hour Grid (1-12) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Hour
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {HOURS.map((h) => {
                    const isHourSelected = parsed.hour12 === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleTimeChange(h, parsed.minute, parsed.ampm)}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          isHourSelected
                            ? 'bg-brand-700 text-white font-bold shadow-xs scale-105'
                            : 'bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-800 border border-slate-200/80'
                        }`}
                      >
                        {String(h).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tactile Minute Grid (00-55) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Minute
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {MINUTES.map((m) => {
                    const isMinSelected = Math.floor(parsed.minute / 5) * 5 === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleTimeChange(parsed.hour12, m, parsed.ampm)}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          isMinSelected
                            ? 'bg-brand-700 text-white font-bold shadow-xs scale-105'
                            : 'bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-800 border border-slate-200/80'
                        }`}
                      >
                        :{String(m).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Tab Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('date')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Back to Calendar
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// CUSTOM DATE PICKER (FOR NOTICES & CIRCULARS)
// =========================================================================
function parseDateOnly(val: string) {
  if (!val) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  }
  const parts = val.split('-').map(Number);
  if (parts.length === 3) {
    return {
      year: parts[0],
      month: parts[1] - 1,
      day: parts[2],
    };
  }
  const d = new Date(val);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

function formatDateOnly(year: number, month: number, day: number) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

interface DatePickerProps {
  label: string;
  value: string; // "YYYY-MM-DD"
  onChange: (val: string) => void;
  required?: boolean;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsed = parseDateOnly(value);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  useEffect(() => {
    if (value) {
      const p = parseDateOnly(value);
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value, isOpen]);

  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowMonthGrid(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleDocClick);
    }
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const newStr = formatDateOnly(viewYear, viewMonth, day);
    onChange(newStr);
    setIsOpen(false);
  };

  const handleQuickPreset = (preset: 'today' | 'tomorrow' | 'nextMon') => {
    const now = new Date();
    let target = new Date();
    if (preset === 'today') {
      target = new Date();
    } else if (preset === 'tomorrow') {
      target.setDate(now.getDate() + 1);
    } else if (preset === 'nextMon') {
      const day = now.getDay();
      const diff = day === 0 ? 1 : 8 - day;
      target.setDate(now.getDate() + diff);
    }
    onChange(formatDateOnly(target.getFullYear(), target.getMonth(), target.getDate()));
    setIsOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const currentSelection = value ? parseDateOnly(value) : null;
  const isSelected = (day: number) => {
    if (!currentSelection) return false;
    return (
      currentSelection.year === viewYear &&
      currentSelection.month === viewMonth &&
      currentSelection.day === day
    );
  };

  const isToday = (day: number) => {
    const now = new Date();
    return (
      now.getFullYear() === viewYear &&
      now.getMonth() === viewMonth &&
      now.getDate() === day
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Styled Trigger */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 py-3 rounded-xl border bg-white flex items-center justify-between cursor-pointer transition-all shadow-xs select-none group ${
          isOpen
            ? 'border-brand-700 ring-2 ring-brand-700/20 shadow-md'
            : 'border-slate-300 hover:border-slate-400 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 border border-brand-200/60 flex items-center justify-center shrink-0">
            <Calendar size={18} />
          </div>
          <span className="text-sm font-bold text-slate-900 truncate">
            {formatDisplayDate(value)}
          </span>
        </div>

        <div className={`p-1 rounded-md text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-700' : ''}`}>
          <ChevronDown size={17} />
        </div>
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 ring-1 ring-slate-900/5 p-4 sm:p-5 w-full max-w-[360px] animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => handleQuickPreset('today')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-800 border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('tomorrow')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-800 border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('nextMon')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-800 border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              Next Mon
            </button>
          </div>

          {/* Month/Year Nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() => setShowMonthGrid((p) => !p)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-slate-100 text-slate-900 font-bold text-sm cursor-pointer"
            >
              <span>{MONTHS_FULL[viewMonth]} {viewYear}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${showMonthGrid ? 'rotate-180 text-brand-700' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          {/* Fast Month Grid */}
          {showMonthGrid ? (
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 mb-2">
              <div className="flex items-center justify-between px-2 pt-1 text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => setViewYear((y) => y - 1)}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600"
                >
                  <ChevronLeft size={14} />
                </button>
                <span>{viewYear}</span>
                <button
                  type="button"
                  onClick={() => setViewYear((y) => y + 1)}
                  className="p-1 hover:bg-slate-200 rounded text-slate-600"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {MONTHS_SHORT.map((m, idx) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setViewMonth(idx);
                      setShowMonthGrid(false);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      viewMonth === idx
                        ? 'bg-brand-700 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Weekday Row */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((wd) => (
                  <span key={wd} className="text-[10px] font-bold text-slate-400 uppercase py-1 select-none">
                    {wd}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <span
                    key={`prev-${i}`}
                    className="text-xs text-slate-300 py-2 select-none flex items-center justify-center"
                  >
                    {prevMonthDays - firstDayOfWeek + i + 1}
                  </span>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const selected = isSelected(day);
                  const today = isToday(day);

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`w-9 h-9 mx-auto rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                        selected
                          ? 'bg-brand-700 text-white font-bold shadow-md shadow-brand-500/30 scale-105'
                          : today
                          ? 'bg-brand-50 text-brand-800 font-bold ring-1.5 ring-brand-300'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleQuickPreset('today')}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// MAIN CONTENT MANAGER PAGE
// =========================================================================
export const ContentManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search Param & LocalStorage Editor State Recovery (ensures refresh stays on create/edit page)
  const getInitialEditorState = () => {
    const urlMode = searchParams.get('mode');
    const urlType = searchParams.get('type') as 'event' | 'notice' | null;
    const urlId = searchParams.get('id');

    if (urlMode) {
      return {
        mode: urlMode as 'create' | 'edit',
        type: urlType === 'notice' ? 'notice' : 'event',
        id: urlId || null,
      };
    }

    try {
      const stored = localStorage.getItem('nirakar_active_editor_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.mode) {
          return {
            mode: parsed.mode as 'create' | 'edit',
            type: (parsed.type === 'notice' ? 'notice' : 'event') as 'event' | 'notice',
            id: parsed.id || null,
          };
        }
      }
    } catch {}

    return null;
  };

  const initialEditor = getInitialEditorState();

  // Mode: 'list' or 'editor'
  const [viewMode, setViewMode] = useState<'list' | 'editor'>(initialEditor ? 'editor' : 'list');
  const [editorType, setEditorType] = useState<'event' | 'notice'>(
    initialEditor?.type === 'notice' ? 'notice' : 'event'
  );
  const [editingId, setEditingId] = useState<string | null>(initialEditor?.id || null);

  // In-box Upload Errors (renders inside Cover & PDF upload boxes)
  const [imageError, setImageError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [draftRestoredToast, setDraftRestoredToast] = useState(false);

  // List View Controls
  const [activeTab, setActiveTab] = useState<'events' | 'notices'>(
    searchParams.get('tab') === 'notices' || initialEditor?.type === 'notice' ? 'notices' : 'events'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past' | 'pinned' | 'urgent'>('all');

  // Event Form State with default or draft
  const [eventFormData, setEventFormData] = useState<EventFormData>(() => {
    if (initialEditor?.mode === 'create' && initialEditor?.type === 'event') {
      try {
        const saved = localStorage.getItem('nirakar_event_draft');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            title: parsed.title || '',
            description: parsed.description || '',
            startDate: parsed.startDate || new Date().toISOString().slice(0, 16),
            endDate: parsed.endDate || '',
            location: parsed.location || '',
            institutionCode: parsed.institutionCode || '',
            isUpcoming: parsed.isUpcoming ?? true,
            coverUrl: parsed.coverUrl || '',
            pdfUrl: parsed.pdfUrl || '',
            photos: Array.isArray(parsed.photos) ? parsed.photos : [],
            documents: Array.isArray(parsed.documents) ? parsed.documents : [],
            videoUrl: parsed.videoUrl || '',
          };
        }
      } catch {}
    }
    return {
      title: '',
      description: '',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: '',
      location: '',
      institutionCode: '',
      isUpcoming: true,
      coverUrl: '',
      pdfUrl: '',
      photos: [],
      documents: [],
      videoUrl: '',
    };
  });

  // Notice Form State with default or draft
  const [noticeFormData, setNoticeFormData] = useState<NoticeFormData>(() => {
    if (initialEditor?.mode === 'create' && initialEditor?.type === 'notice') {
      try {
        const saved = localStorage.getItem('nirakar_notice_draft');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            title: parsed.title || '',
            refNo: parsed.refNo || '',
            urgent: Boolean(parsed.urgent),
            content: parsed.content || '',
            date: parsed.date || new Date().toISOString().split('T')[0],
            pinned: Boolean(parsed.pinned),
            pdfUrl: parsed.pdfUrl || '',
            institutionCode: parsed.institutionCode || '',
          };
        }
      } catch {}
    }
    return {
      title: '',
      refNo: '',
      urgent: false,
      content: '',
      date: new Date().toISOString().split('T')[0],
      pinned: false,
      pdfUrl: '',
      institutionCode: '',
    };
  });

  // Upload States & Refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const multiplePhotosInputRef = useRef<HTMLInputElement>(null);
  const multiplePdfsInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingPdfs, setIsUploadingPdfs] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [isDraggingPdfs, setIsDraggingPdfs] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Live Post Preview Modal State
  const [isPreviewPostModalOpen, setIsPreviewPostModalOpen] = useState(false);
  const [previewActivePhotoIdx, setPreviewActivePhotoIdx] = useState(0);

  // Toast / Status Message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Check if draft was restored on mount
  useEffect(() => {
    if (initialEditor?.mode === 'create') {
      if (initialEditor.type === 'notice') {
        const saved = localStorage.getItem('nirakar_notice_draft');
        if (saved) {
          try {
            const p = JSON.parse(saved);
            if (p.title || p.content || p.pdfUrl) setDraftRestoredToast(true);
          } catch {}
        }
      } else {
        const saved = localStorage.getItem('nirakar_event_draft');
        if (saved) {
          try {
            const p = JSON.parse(saved);
            if (
              p.title ||
              p.description ||
              p.coverUrl ||
              p.pdfUrl ||
              (p.photos && p.photos.length > 0) ||
              (p.documents && p.documents.length > 0) ||
              p.videoUrl
            ) {
              setDraftRestoredToast(true);
            }
          } catch {}
        }
      }
    }
  }, []);

  // Sync active editor state with localStorage and URL search params
  useEffect(() => {
    if (viewMode === 'editor') {
      const mode = editingId ? 'edit' : 'create';
      localStorage.setItem(
        'nirakar_active_editor_state',
        JSON.stringify({ mode, type: editorType, id: editingId })
      );
      const params: Record<string, string> = { mode, type: editorType };
      if (editingId) params.id = editingId;
      setSearchParams(params, { replace: true });
    } else {
      localStorage.removeItem('nirakar_active_editor_state');
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [viewMode, editorType, editingId, activeTab]);

  // Auto-save drafts to localStorage
  useEffect(() => {
    if (viewMode === 'editor' && !editingId) {
      if (editorType === 'notice') {
        if (noticeFormData.title || noticeFormData.content || noticeFormData.pdfUrl) {
          localStorage.setItem('nirakar_notice_draft', JSON.stringify(noticeFormData));
        }
      } else if (editorType === 'event') {
        if (
          eventFormData.title ||
          eventFormData.description ||
          eventFormData.coverUrl ||
          eventFormData.pdfUrl ||
          (eventFormData.photos && eventFormData.photos.length > 0) ||
          (eventFormData.documents && eventFormData.documents.length > 0) ||
          eventFormData.videoUrl
        ) {
          localStorage.setItem('nirakar_event_draft', JSON.stringify(eventFormData));
        }
      }
    }
  }, [viewMode, editorType, editingId, noticeFormData, eventFormData]);

  // Intercept accidental browser reload or tab close when form has data
  useEffect(() => {
    const isDirty =
      viewMode === 'editor' &&
      ((editorType === 'notice' &&
        Boolean(noticeFormData.title.trim() || noticeFormData.content.trim() || noticeFormData.pdfUrl)) ||
        (editorType === 'event' &&
          Boolean(
            eventFormData.title.trim() ||
              eventFormData.description.trim() ||
              eventFormData.coverUrl ||
              eventFormData.pdfUrl ||
              eventFormData.photos.length > 0 ||
              eventFormData.documents.length > 0 ||
              eventFormData.videoUrl
          )));

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [viewMode, editorType, noticeFormData, eventFormData]);

  // 1. Fetch Events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery<EventItem[]>({
    queryKey: ['admin_events', institutionFilter],
    queryFn: async () => {
      const url = institutionFilter
        ? `/api/v1/content/events?institutionCode=${institutionFilter}`
        : '/api/v1/content/events';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch events');
      const json = await res.json();
      return json.data || [];
    },
  });

  // 2. Fetch Notices
  const { data: notices = [], isLoading: isLoadingNotices } = useQuery<NoticeItem[]>({
    queryKey: ['admin_notices', institutionFilter],
    queryFn: async () => {
      const url = institutionFilter
        ? `/api/v1/content/notices?institutionCode=${institutionFilter}`
        : '/api/v1/content/notices';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch notices');
      const json = await res.json();
      const rawList = json.data || [];
      return rawList.map((item: any) => {
        const decoded = decodeNoticeMeta(item.content);
        return {
          ...item,
          refNo: decoded.refNo || item.refNo || '',
          urgent: item.urgent !== undefined ? Boolean(item.urgent) : decoded.urgent,
        };
      });
    },
  });

  // Generic File Upload Handler
  const uploadFileToApi = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', file.name);

    const res = await fetch('/api/v1/content/media/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || json.message || 'File upload failed');
    }

    return json.data?.url || (json.data?.filename ? `/uploads/${json.data.filename}` : '');
  };

  // Helper to format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Image Upload (Auto WebP converted on backend)
  const handleImageFile = async (file: File) => {
    setImageError(null);
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|avif|heic|gif)$/i)) {
      setImageError('Please upload an image file (JPG, PNG, WebP, AVIF)');
      return;
    }

    setIsUploadingImage(true);
    try {
      const url = await uploadFileToApi(file);
      setEventFormData((prev) => {
        const photos = prev.photos && prev.photos.length > 0 ? prev.photos : [{ url, caption: prev.title, altText: prev.title }];
        return { ...prev, coverUrl: url, photos };
      });
      setImageError(null);
      showStatus('Photo uploaded and converted to optimized WebP format', 'success');
    } catch (err: any) {
      setImageError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Upload multiple event photos (with auto SEO alt and caption generation)
  const handleMultiplePhotoFiles = async (files: FileList | File[]) => {
    setImageError(null);
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|webp|avif|heic|gif)$/i)
    );

    if (fileArray.length === 0) {
      setImageError('Please select valid image files (JPG, PNG, WebP, AVIF)');
      return;
    }

    setIsUploadingPhotos(true);
    try {
      const uploadedItems: EventPhotoItem[] = [];
      for (const file of fileArray) {
        const url = await uploadFileToApi(file);
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        uploadedItems.push({
          url,
          caption: cleanName,
          altText: `${eventFormData.title || 'Campus Event'} - ${cleanName}`,
        });
      }

      setEventFormData((prev) => {
        const existing = prev.photos || [];
        const nextPhotos = [...existing, ...uploadedItems];
        const coverUrl = prev.coverUrl || nextPhotos[0]?.url || '';
        return {
          ...prev,
          photos: nextPhotos,
          coverUrl,
        };
      });

      showStatus(`${fileArray.length} photo(s) added to gallery slider`, 'success');
    } catch (err: any) {
      setImageError(err.message || 'Failed to upload photos. Please try again.');
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  // PDF Document Upload (Single, for notices and legacy fallback)
  const handlePdfFile = async (file: File) => {
    setPdfError(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('Please select a PDF document (.pdf)');
      return;
    }

    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setPdfError(
        `PDF is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which exceeds the limit. Please compress the PDF before uploading.`
      );
      return;
    }

    setIsUploadingPdf(true);
    try {
      const url = await uploadFileToApi(file);
      if (editorType === 'event') {
        setEventFormData((prev) => {
          const docs = prev.documents && prev.documents.length > 0
            ? prev.documents
            : [{ url, title: file.name.replace(/\.[^/.]+$/, ''), size: formatFileSize(file.size) }];
          return { ...prev, pdfUrl: url, documents: docs };
        });
      } else {
        setNoticeFormData((prev) => ({ ...prev, pdfUrl: url }));
      }
      setPdfError(null);
      showStatus('PDF attached successfully', 'success');
    } catch (err: any) {
      setPdfError(err.message || 'PDF upload failed. Please try again.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Upload multiple event documents (PDFs) with customizable SEO display titles
  const handleMultiplePdfFiles = async (files: FileList | File[]) => {
    setPdfError(null);
    const fileArray = Array.from(files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (fileArray.length === 0) {
      setPdfError('Please select PDF files (.pdf)');
      return;
    }

    for (const file of fileArray) {
      if (file.size > MAX_PDF_MB * 1024 * 1024) {
        setPdfError(
          `File "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, exceeding ${MAX_PDF_MB}MB limit.`
        );
        return;
      }
    }

    setIsUploadingPdfs(true);
    try {
      const uploadedDocs: EventDocumentItem[] = [];
      for (const file of fileArray) {
        const url = await uploadFileToApi(file);
        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        uploadedDocs.push({
          url,
          title: cleanTitle,
          size: formatFileSize(file.size),
        });
      }

      setEventFormData((prev) => {
        const existing = prev.documents || [];
        const nextDocs = [...existing, ...uploadedDocs];
        const pdfUrl = prev.pdfUrl || nextDocs[0]?.url || '';
        return {
          ...prev,
          documents: nextDocs,
          pdfUrl,
        };
      });

      showStatus(`${fileArray.length} document(s) attached successfully`, 'success');
    } catch (err: any) {
      setPdfError(err.message || 'Failed to upload documents.');
    } finally {
      setIsUploadingPdfs(false);
    }
  };

  // Upload video file (MP4, WebM up to 50MB)
  const handleVideoUpload = async (file: File) => {
    setVideoError(null);
    const validVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|mkv)$/i);
    if (!validVideo) {
      setVideoError('Please upload a video file (MP4, WebM, MOV)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setVideoError(
        `Video size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Server limit is 50MB. For longer videos, paste a YouTube or Vimeo link.`
      );
      return;
    }

    setIsUploadingVideo(true);
    try {
      const url = await uploadFileToApi(file);
      setEventFormData((prev) => ({ ...prev, videoUrl: url }));
      showStatus('Video uploaded successfully', 'success');
    } catch (err: any) {
      setVideoError(err.message || 'Failed to upload video.');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Start Create Event
  const handleStartCreateEvent = () => {
    setEditingId(null);
    setEditorType('event');
    setImageError(null);
    setPdfError(null);
    setVideoError(null);
    setSearchParams({ type: 'event', mode: 'create' });
    const saved = localStorage.getItem('nirakar_event_draft');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setEventFormData({
          title: p.title || '',
          description: p.description || '',
          startDate: p.startDate || new Date().toISOString().slice(0, 16),
          endDate: p.endDate || '',
          location: p.location || '',
          institutionCode: p.institutionCode || institutionFilter || '',
          isUpcoming: p.isUpcoming ?? true,
          coverUrl: p.coverUrl || '',
          pdfUrl: p.pdfUrl || '',
          photos: Array.isArray(p.photos) ? p.photos : [],
          documents: Array.isArray(p.documents) ? p.documents : [],
          videoUrl: p.videoUrl || '',
        });
        if (
          p.title ||
          p.description ||
          p.coverUrl ||
          p.pdfUrl ||
          p.photos?.length ||
          p.documents?.length ||
          p.videoUrl
        ) {
          setDraftRestoredToast(true);
        }
      } catch {
        setEventFormData({
          title: '',
          description: '',
          startDate: new Date().toISOString().slice(0, 16),
          endDate: '',
          location: '',
          institutionCode: institutionFilter || '',
          isUpcoming: true,
          coverUrl: '',
          pdfUrl: '',
          photos: [],
          documents: [],
          videoUrl: '',
        });
      }
    } else {
      setEventFormData({
        title: '',
        description: '',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: '',
        location: '',
        institutionCode: institutionFilter || '',
        isUpcoming: true,
        coverUrl: '',
        pdfUrl: '',
        photos: [],
        documents: [],
        videoUrl: '',
      });
    }
    setViewMode('editor');
  };

  // Start Edit Event
  const handleStartEditEvent = (ev: EventItem) => {
    setEditingId(ev.id);
    setEditorType('event');
    setImageError(null);
    setPdfError(null);
    setVideoError(null);
    setDraftRestoredToast(false);
    setSearchParams({ type: 'event', mode: 'edit', id: ev.id });

    // Defensive parsing for photos and documents
    let parsedPhotos: EventPhotoItem[] = [];
    if (Array.isArray(ev.photos)) {
      parsedPhotos = ev.photos;
    } else if (typeof ev.photos === 'string') {
      try { parsedPhotos = JSON.parse(ev.photos); } catch {}
    }
    if (parsedPhotos.length === 0 && ev.coverUrl) {
      parsedPhotos = [{ url: ev.coverUrl, caption: ev.title, altText: ev.title }];
    }

    let parsedDocs: EventDocumentItem[] = [];
    if (Array.isArray(ev.documents)) {
      parsedDocs = ev.documents;
    } else if (typeof ev.documents === 'string') {
      try { parsedDocs = JSON.parse(ev.documents); } catch {}
    }
    if (parsedDocs.length === 0 && ev.pdfUrl) {
      parsedDocs = [{ url: ev.pdfUrl, title: 'Official Event Document' }];
    }

    setEventFormData({
      title: ev.title,
      description: ev.description || '',
      startDate: ev.startDate.includes('T') ? ev.startDate.slice(0, 16) : ev.startDate,
      endDate: ev.endDate ? (ev.endDate.includes('T') ? ev.endDate.slice(0, 16) : ev.endDate) : '',
      location: ev.location || '',
      institutionCode: ev.institutionCode || '',
      isUpcoming: ev.isUpcoming,
      coverUrl: ev.coverUrl || (parsedPhotos[0]?.url || ''),
      pdfUrl: ev.pdfUrl || (parsedDocs[0]?.url || ''),
      photos: parsedPhotos,
      documents: parsedDocs,
      videoUrl: ev.videoUrl || '',
    });
    setViewMode('editor');
  };

  // Start Create Notice
  const handleStartCreateNotice = () => {
    setEditingId(null);
    setEditorType('notice');
    setPdfError(null);
    setSearchParams({ type: 'notice', mode: 'create' });
    const saved = localStorage.getItem('nirakar_notice_draft');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setNoticeFormData({
          title: p.title || '',
          refNo: p.refNo || '',
          urgent: Boolean(p.urgent),
          content: p.content || '',
          date: p.date || new Date().toISOString().split('T')[0],
          pinned: Boolean(p.pinned),
          pdfUrl: p.pdfUrl || '',
          institutionCode: p.institutionCode || institutionFilter || '',
        });
        if (p.title || p.content || p.pdfUrl || p.refNo) setDraftRestoredToast(true);
      } catch {
        setNoticeFormData({
          title: '',
          refNo: '',
          urgent: false,
          content: '',
          date: new Date().toISOString().split('T')[0],
          pinned: false,
          pdfUrl: '',
          institutionCode: institutionFilter || '',
        });
      }
    } else {
      setNoticeFormData({
        title: '',
        refNo: '',
        urgent: false,
        content: '',
        date: new Date().toISOString().split('T')[0],
        pinned: false,
        pdfUrl: '',
        institutionCode: institutionFilter || '',
      });
    }
    setViewMode('editor');
  };

  // Start Edit Notice
  const handleStartEditNotice = (n: NoticeItem) => {
    setEditingId(n.id);
    setEditorType('notice');
    setPdfError(null);
    setDraftRestoredToast(false);
    setSearchParams({ type: 'notice', mode: 'edit', id: n.id });
    const decoded = decodeNoticeMeta(n.content);
    setNoticeFormData({
      title: n.title,
      refNo: n.refNo || decoded.refNo || '',
      urgent: n.urgent !== undefined ? Boolean(n.urgent) : decoded.urgent,
      content: decoded.content || '',
      date: n.date,
      pinned: Boolean(n.pinned),
      pdfUrl: n.pdfUrl || '',
      institutionCode: n.institutionCode || '',
    });
    setViewMode('editor');
  };

  // Cancel Editor (Exits and Clears URL query & draft)
  const handleCancelEditor = () => {
    localStorage.removeItem('nirakar_active_editor_state');
    if (editorType === 'notice') {
      localStorage.removeItem('nirakar_notice_draft');
    } else {
      localStorage.removeItem('nirakar_event_draft');
    }
    setDraftRestoredToast(false);
    setImageError(null);
    setPdfError(null);
    setVideoError(null);
    setViewMode('list');
    setEditingId(null);
    setSearchParams({ tab: editorType === 'notice' ? 'notices' : 'events' }, { replace: true });
  };

  // Discard draft button handler
  const handleDiscardDraft = () => {
    if (editorType === 'notice') {
      localStorage.removeItem('nirakar_notice_draft');
      setNoticeFormData({
        title: '',
        refNo: '',
        urgent: false,
        content: '',
        date: new Date().toISOString().split('T')[0],
        pinned: false,
        pdfUrl: '',
        institutionCode: institutionFilter || '',
      });
    } else {
      localStorage.removeItem('nirakar_event_draft');
      setEventFormData({
        title: '',
        description: '',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: '',
        location: '',
        institutionCode: institutionFilter || '',
        isUpcoming: true,
        coverUrl: '',
        pdfUrl: '',
        photos: [],
        documents: [],
        videoUrl: '',
      });
    }
    setDraftRestoredToast(false);
  };

  // Save Event
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.title.trim() || !eventFormData.startDate) {
      showStatus('Event title and start date are required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: eventFormData.title.trim(),
        description: eventFormData.description.trim() || null,
        startDate: eventFormData.startDate,
        endDate: eventFormData.endDate || null,
        location: eventFormData.location.trim() || null,
        institutionCode: eventFormData.institutionCode || null,
        isUpcoming: eventFormData.isUpcoming,
        coverUrl: eventFormData.coverUrl.trim() || (eventFormData.photos?.[0]?.url || null),
        pdfUrl: eventFormData.pdfUrl.trim() || (eventFormData.documents?.[0]?.url || null),
        photos: eventFormData.photos || [],
        documents: eventFormData.documents || [],
        videoUrl: eventFormData.videoUrl.trim() || null,
      };

      const isEdit = Boolean(editingId);
      const url = isEdit ? `/api/v1/content/events/${editingId}` : '/api/v1/content/events';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to save event');
      }

      localStorage.removeItem('nirakar_event_draft');
      localStorage.removeItem('nirakar_active_editor_state');
      setDraftRestoredToast(false);
      setImageError(null);
      setPdfError(null);
      showStatus(isEdit ? 'Event updated successfully' : 'Event published successfully', 'success');
      setViewMode('list');
      setEditingId(null);
      setSearchParams({ tab: 'events' }, { replace: true });
      queryClient.invalidateQueries({ queryKey: ['admin_events'] });
    } catch (err: any) {
      showStatus(err.message || 'Failed to save event', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Notice
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeFormData.title.trim() || !noticeFormData.date) {
      showStatus('Notice title and date are required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const encodedContent = encodeNoticeMeta(noticeFormData.content.trim(), {
        refNo: noticeFormData.refNo,
        urgent: noticeFormData.urgent,
      });

      const payload = {
        title: noticeFormData.title.trim(),
        content: encodedContent || null,
        date: noticeFormData.date,
        pinned: noticeFormData.pinned,
        pdfUrl: noticeFormData.pdfUrl.trim() || null,
        institutionCode: noticeFormData.institutionCode || null,
      };

      const isEdit = Boolean(editingId);
      const url = isEdit ? `/api/v1/content/notices/${editingId}` : '/api/v1/content/notices';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to save notice');
      }

      localStorage.removeItem('nirakar_notice_draft');
      localStorage.removeItem('nirakar_active_editor_state');
      setDraftRestoredToast(false);
      setImageError(null);
      setPdfError(null);
      showStatus(isEdit ? 'Notice updated successfully' : 'Notice published successfully', 'success');
      setViewMode('list');
      setEditingId(null);
      setSearchParams({ tab: 'notices' }, { replace: true });
      queryClient.invalidateQueries({ queryKey: ['admin_notices'] });
    } catch (err: any) {
      showStatus(err.message || 'Failed to save notice', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Delete event "${title}"?`)) return;

    try {
      const res = await fetch(`/api/v1/content/events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete event');
      showStatus('Event deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin_events'] });
    } catch (err: any) {
      showStatus(err.message || 'Failed to delete event', 'error');
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id: string, title: string) => {
    if (!confirm(`Delete notice "${title}"?`)) return;

    try {
      const res = await fetch(`/api/v1/content/notices/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete notice');
      showStatus('Notice deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin_notices'] });
    } catch (err: any) {
      showStatus(err.message || 'Failed to delete notice', 'error');
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      ev.title.toLowerCase().includes(q) ||
      (ev.description && ev.description.toLowerCase().includes(q)) ||
      (ev.location && ev.location.toLowerCase().includes(q));
    const matchesInst = !institutionFilter || ev.institutionCode === institutionFilter;
    const isPast = new Date(ev.startDate).getTime() < Date.now();
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'upcoming' && !isPast) ||
      (statusFilter === 'past' && isPast);
    return matchesSearch && matchesInst && matchesStatus;
  });

  // Filtered Notices
  const filteredNotices = notices.filter((n) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      n.title.toLowerCase().includes(q) ||
      (n.refNo && n.refNo.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q));
    const matchesInst = !institutionFilter || n.institutionCode === institutionFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pinned' && n.pinned) ||
      (statusFilter === 'urgent' && n.urgent);
    return matchesSearch && matchesInst && matchesStatus;
  });

  const getInstitutionShort = (code: string | null) => {
    const found = INSTITUTIONS.find((i) => i.code === code);
    return found ? found.short : 'Central';
  };

  // =========================================================================
  // VIEW 1: FULL-WIDTH HUMAN-CRAFTED EDITOR WITH BESPOKE DATE/TIME PICKERS
  // =========================================================================
  if (viewMode === 'editor') {
    const isEvent = editorType === 'event';
    const isEdit = Boolean(editingId);

    return (
      <div className="w-full space-y-6 pb-16 font-sans">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={handleCancelEditor}
              className="rounded-xl p-2.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
              title="Return to list"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                  {isEdit ? (isEvent ? 'Edit Event' : 'Edit Notice') : (isEvent ? 'Create New Event' : 'Publish New Notice')}
                </h1>
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                  {isEdit ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500">
                {isEvent
                  ? 'Manage schedule, physical venue, cover visuals, and official circulars.'
                  : 'Publish official directives and authenticated PDF notices for parents and students.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelEditor}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={isEvent ? handleSaveEvent : handleSaveNotice}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-800 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Publish to Website')}</span>
            </button>
          </div>
        </header>

        {/* Draft Restored Banner */}
        {draftRestoredToast && (
          <div className="p-4 rounded-xl bg-brand-50/90 border border-brand-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-brand-950 animate-in fade-in shadow-xs">
            <div className="flex items-center gap-2.5">
              <RotateCcw size={16} className="text-brand-700 shrink-0" />
              <div>
                <span className="font-bold">Unsaved draft restored.</span>
                <span className="text-brand-800 ml-1">Your in-progress draft was safely recovered so you didn't lose any work on refresh.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-3 py-1.5 rounded-lg bg-white border border-brand-200 hover:bg-brand-100/60 text-brand-900 font-semibold cursor-pointer transition-colors"
              >
                Discard Draft
              </button>
              <button
                type="button"
                onClick={() => setDraftRestoredToast(false)}
                className="p-1.5 text-brand-700 hover:text-brand-950 cursor-pointer"
                title="Dismiss banner"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium border shadow-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Symmetrical Form Canvas */}
        {isEvent ? (
          /* ================================================================ */
          /* EVENT FORM (Clean, Logical, Full Width)                         */
          /* ================================================================ */
          <div className="w-full space-y-6">
            {/* 1. Basic Information & Location */}
            <div className="w-full bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Event Information
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPreviewPostModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <Eye size={13} className="text-brand-700" />
                  <span>Preview Interactive Post</span>
                </button>
              </div>

              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Inter-School Athletics & Sports Championship 2027"
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  className="w-full px-4 py-3 text-base font-semibold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Campus & Venue Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <CustomCampusSelect
                  label="Target Campus"
                  value={eventFormData.institutionCode}
                  onChange={(val) => setEventFormData({ ...eventFormData, institutionCode: val })}
                />

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Physical Venue / Location
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Mashem Central Sports Pavilion & Athletics Field"
                      value={eventFormData.location}
                      onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-3 text-sm text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-700 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Event Description & Highlights
                </label>
                <textarea
                  rows={5}
                  placeholder="Detail order of ceremonies, sports schedules, participating campus teams, student instructions..."
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  className="w-full px-4 py-3 text-sm text-slate-800 leading-relaxed border border-slate-300 rounded-xl focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* 2. Date, Timing & Spotlight Visibility (BESPOKE DATE & TIME PICKER) */}
            <div className="w-full bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Clock size={16} className="text-brand-700" />
                <span>Date, Timing & Spotlight</span>
              </h3>

              {/* Custom Date & Time Picker Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <CustomDateTimePicker
                  label="Start Date & Time"
                  required
                  value={eventFormData.startDate}
                  onChange={(val) => setEventFormData({ ...eventFormData, startDate: val })}
                />

                <CustomDateTimePicker
                  label="End Date & Time (Optional)"
                  isOptional
                  placeholder="Select end date & time (optional)..."
                  value={eventFormData.endDate}
                  onChange={(val) => setEventFormData({ ...eventFormData, endDate: val })}
                />
              </div>

              {/* Spotlight Toggle */}
              <div className="pt-1">
                <label className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={eventFormData.isUpcoming}
                    onChange={(e) => setEventFormData({ ...eventFormData, isUpcoming: e.target.checked })}
                    className="w-4 h-4 mt-0.5 text-brand-700 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Featured in Spotlight Banner</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Highlights this event on the main website homepage and active academic calendar.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. Interactive Event Post Media Studio */}
            <div className="w-full bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Interactive Event Post Media Studio
                    </h3>
                    <p className="text-xs text-slate-500">
                      Upload multiple gallery photos, video link/file, and multiple downloadable documents with custom SEO names.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewPostModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
                >
                  <Eye size={13} />
                  <span>Preview Interactive Post</span>
                </button>
              </div>

              {/* A. MULTI-PHOTO GALLERY & SLIDER SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon size={15} className="text-brand-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Photo Gallery Slider ({eventFormData.photos?.length || 0} Photos)
                    </span>
                    <InfoTooltip text="Upload multiple photos. Users can swipe through an interactive slider in the public event post. You can set the Primary Cover, reorder, and edit SEO captions & alt text." />
                  </div>
                  <button
                    type="button"
                    onClick={() => multiplePhotosInputRef.current?.click()}
                    disabled={isUploadingPhotos}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200/80 cursor-pointer transition-colors"
                  >
                    {isUploadingPhotos ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
                    <span>Add Photos</span>
                  </button>
                </div>

                {imageError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="text-red-600 shrink-0" />
                      <span className="font-medium">{imageError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageError(null)}
                      className="text-red-500 hover:text-red-700 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <input
                  ref={multiplePhotosInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleMultiplePhotoFiles(e.target.files);
                    }
                  }}
                  className="hidden"
                />

                {/* Photos Grid or Drag Drop */}
                {eventFormData.photos && eventFormData.photos.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {eventFormData.photos.map((photo, idx) => {
                        const isCover =
                          eventFormData.coverUrl === photo.url ||
                          (!eventFormData.coverUrl && idx === 0);
                        return (
                          <div
                            key={photo.url + idx}
                            className={`p-3 rounded-xl border transition-all bg-white flex flex-col gap-3 ${
                              isCover
                                ? 'border-brand-500 ring-2 ring-brand-500/10 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="relative h-44 w-full bg-slate-900 rounded-lg overflow-hidden group">
                              <img
                                src={photo.url}
                                alt={photo.altText || 'Event image'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                              {/* Top Badges */}
                              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                                  Slide {idx + 1}
                                </span>
                                {isCover && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-700 text-white shadow-xs">
                                    Primary Cover
                                  </span>
                                )}
                              </div>

                              {/* Actions overlay */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEventFormData((prev) => ({ ...prev, coverUrl: photo.url }));
                                      showStatus('Cover photo updated', 'success');
                                    }}
                                    className="px-2.5 py-1 text-xs font-bold bg-white text-slate-800 rounded-md hover:bg-brand-50 hover:text-brand-700 cursor-pointer shadow-sm"
                                  >
                                    Set Cover
                                  </button>
                                )}
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEventFormData((prev) => {
                                        const copy = [...prev.photos];
                                        const temp = copy[idx - 1];
                                        copy[idx - 1] = copy[idx];
                                        copy[idx] = temp;
                                        return { ...prev, photos: copy };
                                      });
                                    }}
                                    className="p-1.5 text-xs bg-white text-slate-800 rounded-md hover:bg-slate-100 cursor-pointer"
                                    title="Move Left"
                                  >
                                    <ChevronLeft size={14} />
                                  </button>
                                )}
                                {idx < eventFormData.photos.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEventFormData((prev) => {
                                        const copy = [...prev.photos];
                                        const temp = copy[idx + 1];
                                        copy[idx + 1] = copy[idx];
                                        copy[idx] = temp;
                                        return { ...prev, photos: copy };
                                      });
                                    }}
                                    className="p-1.5 text-xs bg-white text-slate-800 rounded-md hover:bg-slate-100 cursor-pointer"
                                    title="Move Right"
                                  >
                                    <ChevronRight size={14} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEventFormData((prev) => {
                                      const filtered = prev.photos.filter((_, i) => i !== idx);
                                      let nextCover = prev.coverUrl;
                                      if (isCover) {
                                        nextCover = filtered[0]?.url || '';
                                      }
                                      return { ...prev, photos: filtered, coverUrl: nextCover };
                                    });
                                  }}
                                  className="p-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
                                  title="Remove Photo"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* SEO Caption & Alt Text Inputs */}
                            <div className="space-y-2">
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                  SEO Caption (Displayed on Interactive Slider)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Winner receives academic trophy at Central Sports Ground"
                                  value={photo.caption || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEventFormData((prev) => {
                                      const copy = [...prev.photos];
                                      copy[idx] = { ...copy[idx], caption: val };
                                      return { ...prev, photos: copy };
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-700 text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                  SEO Alt Text (Accessibility & Google Search Optimization)
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Nirakar high school students receiving athletic championship medals"
                                  value={photo.altText || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEventFormData((prev) => {
                                      const copy = [...prev.photos];
                                      copy[idx] = { ...copy[idx], altText: val };
                                      return { ...prev, photos: copy };
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-brand-700 text-slate-800"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => multiplePhotosInputRef.current?.click()}
                      disabled={isUploadingPhotos}
                      className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-xl text-xs font-semibold text-slate-600 hover:text-brand-700 bg-slate-50/50 hover:bg-brand-50/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isUploadingPhotos ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                      <span>Upload More Gallery Photos</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingPhotos(true);
                    }}
                    onDragLeave={() => setIsDraggingPhotos(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingPhotos(false);
                      if (e.dataTransfer.files?.length) handleMultiplePhotoFiles(e.dataTransfer.files);
                    }}
                    onClick={() => multiplePhotosInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDraggingPhotos
                        ? 'border-brand-500 bg-brand-50/50'
                        : 'border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
                      {isUploadingPhotos ? <RefreshCw size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      {isUploadingPhotos ? 'Uploading and optimizing photos...' : 'Click to select multiple photos or drag & drop'}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supports multiple JPG, PNG, WebP photos. Converted to WebP format automatically.
                    </p>
                  </div>
                )}
              </div>

              {/* B. VIDEO ATTACHMENT SECTION (YouTube, Vimeo, or MP4 Upload) */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Film size={15} className="text-purple-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Event Video Broadcast (YouTube / Vimeo / Direct Video)
                    </span>
                    <InfoTooltip text="Add a YouTube video link, Vimeo URL, or upload an MP4/WebM clip (up to 50MB). The interactive post embeds a secure player." />
                  </div>
                  {eventFormData.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setEventFormData((prev) => ({ ...prev, videoUrl: '' }))}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      Remove Video
                    </button>
                  )}
                </div>

                {videoError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="text-red-600 shrink-0" />
                      <span className="font-medium">{videoError}</span>
                    </div>
                    <button type="button" onClick={() => setVideoError(null)} className="text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Video size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="url"
                      placeholder="Paste YouTube, Vimeo link or video URL (e.g. https://www.youtube.com/watch?v=...)"
                      value={eventFormData.videoUrl}
                      onChange={(e) => setEventFormData({ ...eventFormData, videoUrl: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isUploadingVideo}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isUploadingVideo ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                    <span>{isUploadingVideo ? 'Uploading...' : 'Upload Video File (Max 50MB)'}</span>
                  </button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleVideoUpload(f);
                    }}
                    className="hidden"
                  />
                </div>

                {/* Live Video Preview if present */}
                {eventFormData.videoUrl && (
                  <div className="p-3 bg-slate-900 rounded-xl overflow-hidden shadow-inner max-w-xl">
                    <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
                      <Play size={12} className="text-emerald-400" />
                      <span>Sanitized Safe Video Preview</span>
                    </div>
                    {getSafeVideoEmbedUrl(eventFormData.videoUrl) ? (
                      getSafeVideoEmbedUrl(eventFormData.videoUrl)!.includes('youtube-nocookie.com') ||
                      getSafeVideoEmbedUrl(eventFormData.videoUrl)!.includes('vimeo.com') ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                          <iframe
                            src={getSafeVideoEmbedUrl(eventFormData.videoUrl)!}
                            title="Event Video Preview"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            sandbox="allow-scripts allow-same-origin allow-presentation"
                          />
                        </div>
                      ) : (
                        <video
                          src={getSafeVideoEmbedUrl(eventFormData.videoUrl)!}
                          controls
                          playsInline
                          className="w-full max-h-56 rounded-lg bg-black"
                        />
                      )
                    ) : (
                      <div className="p-4 bg-slate-800 text-amber-300 text-xs rounded-lg">
                        Video link format not recognized. Please check URL or upload an MP4/WebM video file.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* C. MULTIPLE PDF DOCUMENTS WITH SEO TITLES */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileText size={15} className="text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Official Documents & PDFs ({eventFormData.documents?.length || 0})
                    </span>
                    <InfoTooltip text="Upload multiple documents (e.g., Rulebook, Event Schedule, Entry Form). You can rename their display title so visitors see clean, SEO-optimized labels instead of raw filenames." />
                  </div>
                  <button
                    type="button"
                    onClick={() => multiplePdfsInputRef.current?.click()}
                    disabled={isUploadingPdfs}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200/80 cursor-pointer transition-colors"
                  >
                    {isUploadingPdfs ? <RefreshCw size={12} className="animate-spin" /> : <FilePlus size={12} />}
                    <span>Attach PDF(s)</span>
                  </button>
                </div>

                {pdfError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="text-red-600 shrink-0" />
                      <span className="font-medium">{pdfError}</span>
                    </div>
                    <button type="button" onClick={() => setPdfError(null)} className="text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                )}

                <input
                  ref={multiplePdfsInputRef}
                  type="file"
                  multiple
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleMultiplePdfFiles(e.target.files);
                    }
                  }}
                  className="hidden"
                />

                {eventFormData.documents && eventFormData.documents.length > 0 ? (
                  <div className="space-y-2.5">
                    {eventFormData.documents.map((doc, idx) => (
                      <div
                        key={doc.url + idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Document Display Title (SEO Optimized)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Official Championship Rulebook 2026"
                              value={doc.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEventFormData((prev) => {
                                  const copy = [...prev.documents];
                                  copy[idx] = { ...copy[idx], title: val };
                                  return { ...prev, documents: copy };
                                });
                              }}
                              className="w-full px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-brand-700"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {doc.size && (
                            <span className="text-[11px] font-mono text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                              {doc.size}
                            </span>
                          )}
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-semibold text-brand-700 hover:text-brand-800 bg-white border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <span>View</span>
                            <ExternalLink size={11} />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setEventFormData((prev) => {
                                const filtered = prev.documents.filter((_, i) => i !== idx);
                                const nextPdf = prev.pdfUrl === doc.url ? filtered[0]?.url || '' : prev.pdfUrl;
                                return { ...prev, documents: filtered, pdfUrl: nextPdf };
                              });
                            }}
                            className="p-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 cursor-pointer"
                            title="Remove Document"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => multiplePdfsInputRef.current?.click()}
                      disabled={isUploadingPdfs}
                      className="w-full py-2 border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl text-xs font-semibold text-slate-600 hover:text-amber-700 bg-slate-50/50 hover:bg-amber-50/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isUploadingPdfs ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                      <span>Attach Another PDF Document</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingPdfs(true);
                    }}
                    onDragLeave={() => setIsDraggingPdfs(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingPdfs(false);
                      if (e.dataTransfer.files?.length) handleMultiplePdfFiles(e.dataTransfer.files);
                    }}
                    onClick={() => multiplePdfsInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDraggingPdfs
                        ? 'border-amber-500 bg-amber-50/50'
                        : 'border-slate-300 hover:border-amber-400 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                      {isUploadingPdfs ? <RefreshCw size={20} className="animate-spin" /> : <FileText size={20} />}
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      {isUploadingPdfs ? 'Uploading documents...' : 'Click to attach PDF documents or drag & drop'}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supports multiple PDFs up to 15MB each (exact 10MB PDFs fully accepted).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer Action Bar */}
            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewPostModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-colors cursor-pointer"
              >
                <Eye size={15} />
                <span>Preview Interactive Post</span>
              </button>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEditor}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEvent}
                  disabled={isSaving}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 disabled:opacity-60 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish to Website'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================ */
          /* NOTICE FORM (Clean, Logical, Full Width)                        */
          /* ================================================================ */
          <div className="w-full space-y-6">
            {/* 1. Notice Information */}
            <div className="w-full bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Notice Information
              </h3>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Notice Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa Board Secondary & Higher Secondary Examination Form Submission"
                  value={noticeFormData.title}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, title: e.target.value })}
                  className="w-full px-4 py-3 text-base font-semibold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Ref No & Target Campus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Circular Reference Number (Ref. No.)
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">Optional</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. NIRAKAR/HS/CIR/0114"
                    value={noticeFormData.refNo}
                    onChange={(e) => setNoticeFormData({ ...noticeFormData, refNo: e.target.value })}
                    className="w-full px-4 py-3 text-sm font-mono uppercase tracking-wide text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700 transition-all placeholder:text-slate-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Official dispatch / circular code (printed on original letterhead or gazette).
                  </p>
                </div>

                <CustomCampusSelect
                  label="Target Campus"
                  value={noticeFormData.institutionCode}
                  onChange={(val) => setNoticeFormData({ ...noticeFormData, institutionCode: val })}
                />
              </div>

              {/* Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <CustomDatePicker
                  label="Notice Issue Date"
                  required
                  value={noticeFormData.date}
                  onChange={(val) => setNoticeFormData({ ...noticeFormData, date: val })}
                />
              </div>

              {/* Notice Details */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Notice Details & Instructions
                </label>
                <textarea
                  rows={6}
                  placeholder="Provide complete details, eligibility requirements, verification deadlines, administrative counters..."
                  value={noticeFormData.content}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, content: e.target.value })}
                  className="w-full px-4 py-3 text-sm text-slate-800 leading-relaxed border border-slate-300 rounded-xl focus:outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Two Toggles: Urgent / Statutory Compliance AND Pinned */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Urgent Toggle */}
                <label className={`flex items-start gap-3.5 p-4 rounded-xl border transition-colors cursor-pointer ${
                  noticeFormData.urgent
                    ? 'border-red-300 bg-red-50/90 shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={noticeFormData.urgent}
                    onChange={(e) => setNoticeFormData({ ...noticeFormData, urgent: e.target.checked })}
                    className="w-4 h-4 mt-0.5 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle size={14} className={noticeFormData.urgent ? 'text-red-600' : 'text-slate-400'} />
                      <span className={noticeFormData.urgent ? 'text-red-900' : 'text-slate-800'}>
                        Statutory Compliance / Urgent Notice
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Flags this circular with a prominent <strong className="text-red-700 font-semibold">[URGENT]</strong> badge and &ldquo;Statutory Compliance Required&rdquo; notice for mandatory directives or deadlines.
                    </div>
                  </div>
                </label>

                {/* Pinned Toggle */}
                <label className={`flex items-start gap-3.5 p-4 rounded-xl border transition-colors cursor-pointer ${
                  noticeFormData.pinned
                    ? 'border-amber-300 bg-amber-50/90 shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={noticeFormData.pinned}
                    onChange={(e) => setNoticeFormData({ ...noticeFormData, pinned: e.target.checked })}
                    className="w-4 h-4 mt-0.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Pin size={14} className={noticeFormData.pinned ? 'text-amber-600' : 'text-slate-400'} />
                      <span className={noticeFormData.pinned ? 'text-amber-900' : 'text-slate-800'}>
                        Pin to Top of Noticeboard
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Keeps this circular permanently anchored at the top of the noticeboard above all standard chronological notices.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 2. Official Circular Document (PDF) */}
            <div className="w-full bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Official PDF Attachment (Circular Document)
                </span>
                <InfoTooltip text="Accepts PDFs up to 15MB. Exact 10MB PDFs are fully accepted. Please use compressed PDFs for optimal student and parent mobile access." />
              </div>

              {/* In-box PDF Error Alert */}
              {pdfError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="text-red-600 shrink-0" />
                    <span className="font-medium">{pdfError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPdfError(null)}
                    className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
                    title="Dismiss error"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePdfFile(f);
                }}
                className="hidden"
              />

              {noticeFormData.pdfUrl ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {noticeFormData.pdfUrl.split('/').pop()}
                      </div>
                      <div className="text-[11px] text-slate-500">Official PDF attached & authenticated</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <a
                      href={noticeFormData.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-700 hover:text-brand-800 font-semibold"
                    >
                      <span>Preview Document</span>
                      <ExternalLink size={12} />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded border border-slate-300 bg-white cursor-pointer"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoticeFormData((p) => ({ ...p, pdfUrl: '' }))}
                        className="px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 rounded border border-red-200 bg-red-50 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingPdf(true);
                  }}
                  onDragLeave={() => setIsDraggingPdf(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingPdf(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) handlePdfFile(f);
                  }}
                  onClick={() => pdfInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDraggingPdf
                      ? 'border-brand-500 bg-brand-50/50'
                      : 'border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                    {isUploadingPdf ? <RefreshCw size={20} className="animate-spin" /> : <FileText size={20} />}
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {isUploadingPdf ? 'Uploading PDF...' : 'Click to attach PDF document or drag & drop'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Maximum size: 15MB (exact 10MB fully supported)</p>
                </div>
              )}
            </div>

            {/* Bottom Footer Action Bar */}
            <div className="w-full flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelEditor}
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotice}
                disabled={isSaving}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-brand-700 hover:bg-brand-800 disabled:opacity-60 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Publish to Website')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* LIVE INTERACTIVE POST PREVIEW MODAL                              */}
        {/* ================================================================ */}
        {isPreviewPostModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-stone-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
              {/* Modal Top Bar */}
              <div className="px-6 py-4 bg-[#0b132b] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                    Interactive Post Live Preview (Public Visitor View)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewPostModalOpen(false)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                {/* PHOTO SLIDER */}
                {eventFormData.photos && eventFormData.photos.length > 0 ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black text-white shadow-xl aspect-16/9 max-h-96 w-full group">
                    <img
                      src={eventFormData.photos[previewActivePhotoIdx]?.url || eventFormData.coverUrl}
                      alt={eventFormData.photos[previewActivePhotoIdx]?.altText || eventFormData.title}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                    {/* Slider Nav Buttons */}
                    {eventFormData.photos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewActivePhotoIdx((prev) =>
                              prev === 0 ? eventFormData.photos.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer shadow-md"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewActivePhotoIdx((prev) =>
                              prev === eventFormData.photos.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer shadow-md"
                        >
                          <ChevronRight size={20} />
                        </button>

                        {/* Slide dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                          {eventFormData.photos.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setPreviewActivePhotoIdx(i)}
                              className={`h-2 rounded-full transition-all cursor-pointer ${
                                previewActivePhotoIdx === i
                                  ? 'w-6 bg-amber-400'
                                  : 'w-2 bg-white/60 hover:bg-white'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Slide caption */}
                    {eventFormData.photos[previewActivePhotoIdx]?.caption && (
                      <div className="absolute bottom-4 left-5 right-5 text-xs text-white/95 bg-black/60 backdrop-blur-xs px-3.5 py-1.5 rounded-lg w-fit max-w-[85%] border border-white/10">
                        {eventFormData.photos[previewActivePhotoIdx]?.caption}
                      </div>
                    )}
                  </div>
                ) : eventFormData.coverUrl ? (
                  <div className="rounded-2xl overflow-hidden aspect-16/9 max-h-96 w-full bg-slate-900 shadow-xl">
                    <img src={eventFormData.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                ) : null}

                {/* Post Metadata Header */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                      {getInstitutionShort(eventFormData.institutionCode) || 'All Campuses'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-brand-100 text-brand-950 border border-brand-200">
                      {eventFormData.isUpcoming ? 'Upcoming Campus Gathering' : 'Concluded Event'}
                    </span>
                    {eventFormData.startDate && (
                      <span className="text-xs font-mono text-stone-600 flex items-center gap-1 ml-auto">
                        <Clock size={13} className="text-amber-600" />
                        <span>
                          {new Date(eventFormData.startDate).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#0b132b] leading-tight">
                    {eventFormData.title || 'Untitled Campus Event'}
                  </h2>

                  {eventFormData.location && (
                    <div className="flex items-center gap-2 text-xs text-stone-600 font-sans">
                      <MapPin size={14} className="text-amber-600 shrink-0" />
                      <span>{eventFormData.location}</span>
                    </div>
                  )}

                  <div className="text-stone-700 text-sm font-sans leading-relaxed whitespace-pre-line pt-2">
                    {eventFormData.description || 'No description provided yet.'}
                  </div>
                </div>

                {/* VIDEO EMBED PREVIEW */}
                {eventFormData.videoUrl && (
                  <div className="space-y-2 pt-4 border-t border-stone-200">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                      <Film size={14} className="text-purple-600" />
                      <span>Event Video Broadcast</span>
                    </h4>
                    <div className="rounded-2xl overflow-hidden bg-black aspect-video max-h-80 shadow-md">
                      {getSafeVideoEmbedUrl(eventFormData.videoUrl) ? (
                        getSafeVideoEmbedUrl(eventFormData.videoUrl)!.includes('youtube-nocookie.com') ||
                        getSafeVideoEmbedUrl(eventFormData.videoUrl)!.includes('vimeo.com') ? (
                          <iframe
                            src={getSafeVideoEmbedUrl(eventFormData.videoUrl)!}
                            title="Event Video"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            sandbox="allow-scripts allow-same-origin allow-presentation"
                          />
                        ) : (
                          <video
                            src={getSafeVideoEmbedUrl(eventFormData.videoUrl)!}
                            controls
                            playsInline
                            className="w-full h-full"
                          />
                        )
                      ) : null}
                    </div>
                  </div>
                )}

                {/* ATTACHED DOCUMENTS WITH CUSTOM SEO TITLES */}
                {((eventFormData.documents && eventFormData.documents.length > 0) || eventFormData.pdfUrl) && (
                  <div className="space-y-3 pt-4 border-t border-stone-200">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                      <FileText size={14} className="text-amber-600" />
                      <span>Official Attached Documents & Schedules</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(eventFormData.documents && eventFormData.documents.length > 0
                        ? eventFormData.documents
                        : [{ url: eventFormData.pdfUrl, title: 'Official Event Document' }]
                      ).map((doc, i) => (
                        <div
                          key={doc.url + i}
                          className="p-3.5 bg-white rounded-xl border border-stone-300/80 shadow-xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-stone-900 truncate">
                                {doc.title || 'Official Document'}
                              </div>
                              <div className="text-[10px] text-stone-500 font-mono">
                                {doc.size || 'PDF Document'}
                              </div>
                            </div>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#0b132b] hover:bg-stone-800 rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                          >
                            <span>Download</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
                <span className="text-xs text-stone-500">
                  This preview renders the interactive post exactly as visitors will experience it on the public portal.
                </span>
                <button
                  type="button"
                  onClick={() => setIsPreviewPostModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULL-WIDTH CLEAN LIST VIEW
  // =========================================================================
  return (
    <div className="w-full space-y-6 pb-16 font-sans">
      {/* Toast */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-medium border shadow-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            <FileText className="text-brand-700" size={28} />
            Events & Notices
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Manage society events, announcements, and official circulars across all Nirakar institutions.
          </p>
        </div>

        <button
          onClick={activeTab === 'events' ? handleStartCreateEvent : handleStartCreateNotice}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-800 cursor-pointer"
        >
          <Plus size={16} />
          <span>{activeTab === 'events' ? 'New Event' : 'New Notice'}</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 rounded-xl border border-stone-200/80 bg-stone-100 p-1.5">
        <button
          onClick={() => {
            setActiveTab('events');
            setStatusFilter('all');
          }}
          className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'events'
              ? 'bg-brand-700 font-semibold text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
          }`}
        >
          <Calendar size={17} />
          <span>Events</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === 'events' ? 'bg-white/20 text-white' : 'bg-white text-stone-600'}`}>
            {events.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('notices');
            setStatusFilter('all');
          }}
          className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'notices'
              ? 'bg-brand-700 font-semibold text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
          }`}
        >
          <FileText size={17} />
          <span>Notices & Circulars</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === 'notices' ? 'bg-white/20 text-white' : 'bg-white text-stone-600'}`}>
            {notices.length}
          </span>
        </button>
      </div>

      {/* Filter & Search Bar (Full Width) */}
      <div className="flex w-full flex-col items-stretch justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs md:flex-row md:items-center">
        {/* Search Input */}
        <div className="relative w-full md:flex-1 md:max-w-md">
          <Search size={16} className="absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder={activeTab === 'events' ? 'Search events by title or location...' : 'Search notices by title or content...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-3.5 text-sm placeholder:text-stone-400 focus:border-brand-700 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Institution Dropdown & Status Filter Chips */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          <div className="w-full shrink-0 sm:w-64">
            <CustomCampusSelect
              compact
              value={institutionFilter}
              onChange={(val) => setInstitutionFilter(val)}
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {activeTab === 'events' ? (
              <>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-brand-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('upcoming')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'upcoming'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setStatusFilter('past')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'past'
                      ? 'bg-stone-200 text-stone-800'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Past
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-brand-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('urgent')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'urgent'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Urgent
                </button>
                <button
                  onClick={() => setStatusFilter('pinned')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'pinned'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Pinned
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Table (Full Width) */}
      <div className="w-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        {activeTab === 'events' ? (
          /* EVENTS TABLE */
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="py-4 px-5">Event</th>
                  <th className="py-4 px-5">Campus</th>
                  <th className="py-4 px-5">Date & Time</th>
                  <th className="py-4 px-5">Attachments</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoadingEvents ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      Loading events...
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="mb-2 text-stone-400">No events found matching your search.</div>
                      <button
                        onClick={handleStartCreateEvent}
                        className="text-xs font-semibold text-brand-700 hover:underline cursor-pointer"
                      >
                        + Create your first event
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => {
                    const isPast = new Date(ev.startDate).getTime() < Date.now();
                    return (
                      <tr key={ev.id} className="transition-colors hover:bg-stone-50/80">
                        <td className="py-4 px-5">
                          <div className="text-sm font-semibold text-stone-900">{ev.title}</div>
                          {ev.location && (
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <MapPin size={13} className="text-slate-400" />
                              <span>{ev.location}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {getInstitutionShort(ev.institutionCode)}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-xs text-slate-600">
                          {new Date(ev.startDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(ev.photos?.length || ev.coverUrl) ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-800 border border-brand-200">
                                {ev.photos && ev.photos.length > 1
                                  ? `${ev.photos.length} Photos`
                                  : '1 Photo'}
                              </span>
                            ) : null}
                            {ev.videoUrl ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                Video
                              </span>
                            ) : null}
                            {(ev.documents?.length || ev.pdfUrl) ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                {ev.documents && ev.documents.length > 1
                                  ? `${ev.documents.length} PDFs`
                                  : 'PDF'}
                              </span>
                            ) : null}
                            {!ev.coverUrl && !ev.pdfUrl && !ev.videoUrl && !ev.photos?.length && (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          {isPast ? (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                              Past
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Upcoming
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                handleStartEditEvent(ev);
                                setIsPreviewPostModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-700 hover:bg-brand-50 transition-colors cursor-pointer"
                              title="Preview Interactive Post"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleStartEditEvent(ev)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-700 hover:bg-brand-50 transition-colors cursor-pointer"
                              title="Edit Event"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id, ev.title)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Event"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* NOTICES & CIRCULARS TABLE */
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="py-4 px-5">Notice / Circular</th>
                  <th className="py-4 px-5">Campus</th>
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5">Document</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoadingNotices ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      Loading notices...
                    </td>
                  </tr>
                ) : filteredNotices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="mb-2 text-stone-400">No notices found matching your search.</div>
                      <button
                        onClick={handleStartCreateNotice}
                        className="text-xs font-semibold text-brand-700 hover:underline cursor-pointer"
                      >
                        + Create your first notice
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map((n) => {
                    const decoded = decodeNoticeMeta(n.content);
                    const displayRef = n.refNo || decoded.refNo;
                    const isUrgent = n.urgent !== undefined ? n.urgent : decoded.urgent;
                    const cleanText = decoded.content || n.content;

                    return (
                      <tr key={n.id} className="transition-colors hover:bg-stone-50/80">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-stone-900">{n.title}</div>
                            {isUrgent && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 animate-pulse">
                                URGENT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            {displayRef && (
                              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                {displayRef}
                              </span>
                            )}
                            {cleanText && (
                              <span className="truncate max-w-md text-slate-500">
                                {cleanText}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {getInstitutionShort(n.institutionCode)}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-xs text-slate-600">
                          {new Date(n.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-5">
                          {n.pdfUrl ? (
                            <a
                              href={n.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              <FileText size={14} />
                              <span>PDF Attached</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-1 items-start">
                            {isUrgent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                                <AlertTriangle size={11} className="text-red-600" />
                                <span>Urgent</span>
                              </span>
                            )}
                            {n.pinned ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <Pin size={11} />
                                <span>Pinned</span>
                              </span>
                            ) : !isUrgent ? (
                              <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                                Standard
                              </span>
                            ) : null}
                          </div>
                        </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEditNotice(n)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-700 hover:bg-brand-50 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteNotice(n.id, n.title)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
