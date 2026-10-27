import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiUrl } from '../lib/api.js';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { SectionEdge } from '../components/SectionEdge.js';
import { HeroWaves } from '../components/HeroWaves.js';
import { HumanVerificationCaptcha } from '../components/HumanVerificationCaptcha.js';
import { useAdmissionsSocket } from '../hooks/useAdmissionsSocket.js';
import { CustomSelect, type SelectOption } from '../components/CustomSelect.js';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  Printer,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Phone,
  ChevronDown,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  FileCheck,
  Info,
  X,
  Sparkles,
  PenTool,
  Camera,
  HelpCircle,
  RefreshCw,
  Sliders,
} from 'lucide-react';



interface GoogleDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  id?: string;
  placeholder?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const GoogleDatePicker: React.FC<GoogleDatePickerProps> = ({
  value,
  onChange,
  id,
  placeholder = 'Select Date of Birth (DD/MM/YYYY)',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'years'>('days');
  const containerRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  // Parse initial year/month (default to 2014 for school admission candidates if empty)
  const initialYear = value ? parseInt(value.split('-')[0], 10) || 2014 : 2014;
  const initialMonth = value ? (parseInt(value.split('-')[1], 10) || 6) - 1 : 5; // June 2014

  const [viewYear, setViewYear] = useState<number>(initialYear);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m) && m >= 0 && m < 12) {
          setViewYear(y);
          setViewMonth(m);
        }
      }
    }
  }, [value]);

  // Click-outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Auto-scroll to selected year in Year picker
  useEffect(() => {
    if (isOpen && viewMode === 'years' && yearListRef.current) {
      const activeEl = yearListRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [isOpen, viewMode]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 1 = Mon...

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const fullDate = `${viewYear}-${mStr}-${dStr}`;
    onChange(fullDate);
    setIsOpen(false);
    setViewMode('days');
  };

  const handleSelectYear = (yr: number) => {
    setViewYear(yr);
    setViewMode('days');
  };

  // Formatted date string for input trigger display (e.g. 15 August 2014)
  const displayFormatted = (() => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 0 && m < 12) {
        return `${d} ${MONTH_NAMES[m]} ${y}`;
      }
    }
    return value;
  })();

  // Google Material header date string (e.g. "Fri, Aug 15" or "Select Date")
  const headerDateString = (() => {
    if (!value) return 'Select Date';
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) {
        const weekday = DAY_NAMES_SHORT[dt.getDay()];
        const mon = MONTH_NAMES_SHORT[m];
        return `${weekday}, ${mon} ${d}`;
      }
    }
    return 'Select Date';
  })();

  // Match selected day
  const isSelectedDay = (day: number) => {
    if (!value) return false;
    const parts = value.split('-');
    if (parts.length === 3) {
      return (
        parseInt(parts[0], 10) === viewYear &&
        parseInt(parts[1], 10) - 1 === viewMonth &&
        parseInt(parts[2], 10) === day
      );
    }
    return false;
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  // Date of birth cannot be future
  const isFuture = (day: number) => {
    const checkDate = new Date(viewYear, viewMonth, day);
    return checkDate > today;
  };

  // Candidate DOB year range (2026 down to 2004)
  const currentYear = today.getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= 2004; y--) {
    years.push(y);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border bg-white text-sm sm:text-base font-sans text-left transition-all cursor-pointer ${
          isOpen
            ? 'border-[#111b5e] ring-2 ring-[#111b5e]/20 shadow-sm'
            : 'border-stone-300 hover:border-stone-400 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          <Calendar size={18} className="text-[#111b5e] shrink-0" />
          <span className={value ? 'font-medium text-stone-900 truncate' : 'text-stone-400 truncate'}>
            {displayFormatted || placeholder}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-stone-400 shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#111b5e]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden w-full animate-fadeIn">
          {/* Google Material Signature Header */}
          <div className="bg-[#111b5e] text-white p-4 sm:p-5 w-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-widest uppercase text-blue-200/90 font-semibold">
                SELECT DATE OF BIRTH
              </span>
              <button
                type="button"
                onClick={() => setViewMode((m) => (m === 'years' ? 'days' : 'years'))}
                className="flex items-center gap-1 text-xs font-mono font-medium text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <span>{viewYear}</span>
                <ChevronDown size={13} className={viewMode === 'years' ? 'rotate-180' : ''} />
              </button>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              {headerDateString}
            </div>
          </div>

          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-stone-100 bg-white">
            <button
              type="button"
              onClick={() => setViewMode((m) => (m === 'years' ? 'days' : 'years'))}
              className="flex items-center gap-1.5 text-sm sm:text-base font-serif font-bold text-stone-800 hover:text-[#111b5e] hover:bg-stone-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <span>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <ChevronDown
                size={14}
                className={`text-stone-400 transition-transform ${
                  viewMode === 'years' ? 'rotate-180 text-[#111b5e]' : ''
                }`}
              />
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next Month"
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Body: Days Mode */}
          {viewMode === 'days' && (
            <div className="p-4 sm:p-5 bg-white">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 mb-2 text-center text-xs sm:text-sm font-semibold text-stone-400">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-y-1.5 sm:gap-y-2">
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="w-9 sm:w-10 h-9 sm:h-10 mx-auto" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const selected = isSelectedDay(dayNum);
                  const todayFlag = isToday(dayNum);
                  const futureFlag = isFuture(dayNum);

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={futureFlag}
                      onClick={() => handleSelectDay(dayNum)}
                      className={`w-9 sm:w-10 h-9 sm:h-10 mx-auto rounded-full text-xs sm:text-sm font-sans flex items-center justify-center transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#111b5e] text-white font-bold shadow-md shadow-[#111b5e]/25 scale-105'
                          : futureFlag
                          ? 'text-stone-300 cursor-not-allowed'
                          : todayFlag
                          ? 'border border-[#111b5e] text-[#111b5e] font-semibold hover:bg-blue-50'
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Body: Years Mode (Fast Quick-Picker) */}
          {viewMode === 'years' && (
            <div
              ref={yearListRef}
              className="p-4 sm:p-5 max-h-72 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2.5 bg-white"
            >
              {years.map((yr) => {
                const isSelectedYear = yr === viewYear;
                return (
                  <button
                    key={yr}
                    type="button"
                    data-selected={isSelectedYear}
                    onClick={() => handleSelectYear(yr)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-mono font-medium transition-colors cursor-pointer text-center ${
                      isSelectedYear
                        ? 'bg-[#111b5e] text-white font-bold shadow-sm'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          )}

          {/* Google Material Footer Actions */}
          <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-xs font-serif font-bold tracking-wider text-stone-500 hover:text-stone-800 uppercase px-2 py-1 rounded transition-colors cursor-pointer"
            >
              Clear
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setViewMode('days');
                }}
                className="text-xs font-serif font-bold tracking-wider text-stone-600 hover:bg-stone-200/60 uppercase px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setViewMode('days');
                }}
                className="text-xs font-serif font-bold tracking-wider text-white bg-[#111b5e] hover:bg-[#0b132b] uppercase px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const secondaryClassOptions: SelectOption[] = [
  { value: 'Class V', label: 'Class V' },
  { value: 'Class VI', label: 'Class VI' },
  { value: 'Class VII', label: 'Class VII' },
  { value: 'Class VIII', label: 'Class VIII' },
  { value: 'Class IX', label: 'Class IX' },
  { value: 'Class X', label: 'Class X (SSC)' },
];

const higherSecondaryClassOptions: SelectOption[] = [
  { value: 'Class XI', label: 'Class XI' },
  { value: 'Class XII', label: 'Class XII' },
];

const secondLanguageOptions: SelectOption[] = [
  { value: 'Marathi', label: 'Marathi (Second Language)' },
  { value: 'Hindi', label: 'Hindi (Second Language)' },
  { value: 'Konkani', label: 'Konkani (Second Language)' },
];

const genderOptions: SelectOption[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const motherTongueOptions: SelectOption[] = [
  { value: 'Konkani', label: 'Konkani' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'English', label: 'English' },
  { value: 'Other', label: 'Other' },
];

const categoryOptions: SelectOption[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'OBC', label: 'Other Backward Class (OBC)' },
  { value: 'ST', label: 'Scheduled Tribe (ST)' },
  { value: 'SC', label: 'Scheduled Caste (SC)' },
  { value: 'EWS', label: 'Economically Weaker Section (EWS)' },
];

// Key for persisting form state across step navigation and browser refreshes
const ADMISSION_DRAFT_KEY = 'nirakar_admission_draft';

interface AdmissionDraft {
  step?: number;
  maxVisitedStep?: number;
  institutionCode?: string;
  gradeApplied?: string;
  selectedBaseStream?: 'SCIENCE' | 'COMMERCE' | 'ARTS';
  secondLanguage?: string;
  stream?: string;
  studentName?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  placeOfBirth?: string;
  nationality?: string;
  motherTongue?: string;
  aadhaarNumber?: string;
  category?: string;
  bloodGroup?: string;
  photoData?: string;
  photoName?: string;
  photoSizeKb?: number;
  signatureData?: string;
  signatureName?: string;
  signatureSizeKb?: number;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  primaryPhone?: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
  previousSchool?: string;
  previousClass?: string;
  previousPercentage?: string;
  declarationAccepted?: boolean;
}

const getSavedDraft = (): AdmissionDraft => {
  try {
    const raw = localStorage.getItem(ADMISSION_DRAFT_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse saved admission draft:', err);
    return {};
  }
};

const ADMISSION_SUBMITTED_KEY = 'nirakar_admission_submitted';

const getSavedSubmittedData = () => {
  try {
    const raw = localStorage.getItem(ADMISSION_SUBMITTED_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse saved admission receipt:', err);
    return null;
  }
};

export const inferPreviousClass = (gradeApplied?: string, enteredPreviousClass?: string) => {
  if (enteredPreviousClass && enteredPreviousClass.trim() && enteredPreviousClass.trim().toUpperCase() !== 'N/A') {
    return enteredPreviousClass.trim();
  }
  if (!gradeApplied) return '';
  const g = gradeApplied.toLowerCase();
  if (g.includes('xi') && !g.includes('xii')) return 'Class X (SSCE)';
  if (g.includes('xii')) return 'Class XI';
  if (g.includes('v') && !g.includes('vi') && !g.includes('vii') && !g.includes('viii')) return 'Class IV';
  if (g.includes('vi') && !g.includes('vii') && !g.includes('viii')) return 'Class V';
  if (g.includes('vii') && !g.includes('viii')) return 'Class VI';
  if (g.includes('viii')) return 'Class VII';
  if (g.includes('ix')) return 'Class VIII';
  if (g.includes('x')) return 'Class IX';
  return '';
};

export const formatPreviousAcademicRecord = (
  gradeApplied?: string,
  prevClass?: string,
  percentage?: number | string | null
) => {
  const resolvedClass = inferPreviousClass(gradeApplied, prevClass);
  const hasPercentage =
    percentage !== null &&
    percentage !== undefined &&
    percentage !== '' &&
    percentage !== 'N/A' &&
    percentage !== 'undefined';

  if (resolvedClass && hasPercentage) {
    return `${resolvedClass} (${percentage}%)`;
  }
  if (hasPercentage) {
    return `${percentage}%`;
  }
  if (resolvedClass) {
    return resolvedClass;
  }
  return 'Not Specified';
};

export const getApplicantLocation = (data: any) => {
  if (data?.village && data?.taluka) {
    return `${data.village}, ${data.taluka}`;
  }
  if (data?.village) {
    return `${data.village}, Goa`;
  }
  if (data?.taluka) {
    return `${data.taluka}, Goa`;
  }
  if (data?.placeOfBirth) {
    return data.placeOfBirth;
  }
  return 'Canacona, Goa';
};

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  info?: string;
  metrics: {
    width: number;
    height: number;
    ratio: number;
    bgLuma: number;
    isWhiteOrLightBg: boolean;
    isPortrait: boolean;
    isLandscape: boolean;
    isSignatureLike: boolean;
    isPhotoLike: boolean;
    skinToneRatio: number;
    whiteRatio: number;
  };
}

// 1. Analyze and validate Candidate Photograph according to Govt of India & Board Examination Standards
export const analyzeCandidatePhoto = (
  img: HTMLImageElement
): ImageValidationResult => {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const ratio = width / height;

  // Aspect ratio check (Passport photos must be vertical / portrait 3.5cm x 4.5cm, standard ratio ~0.777)
  // If uploaded image is horizontal / landscape (ratio > 1.15), reject immediately.
  if (ratio > 1.15) {
    return {
      isValid: false,
      error: `Aspect Ratio Error: The photo is horizontal / landscape (${width} × ${height} px, ratio: ${ratio.toFixed(2)}). Official passport photos must be vertical portrait (3.5 cm × 4.5 cm). If this is your signature, please upload it in the Signature section below.`,
      metrics: {
        width,
        height,
        ratio,
        bgLuma: 0,
        isWhiteOrLightBg: false,
        isPortrait: false,
        isLandscape: true,
        isSignatureLike: true,
        isPhotoLike: false,
        skinToneRatio: 0,
        whiteRatio: 0,
      },
    };
  }

  // Pixel scanning for Background Luminance, Uniformity, and Face / Signature Differentiation
  const canvas = document.createElement('canvas');
  const sampleW = Math.min(width, 360);
  const sampleH = Math.min(height, 460);
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      isValid: true,
      metrics: {
        width,
        height,
        ratio,
        bgLuma: 240,
        isWhiteOrLightBg: true,
        isPortrait: true,
        isLandscape: false,
        isSignatureLike: false,
        isPhotoLike: true,
        skinToneRatio: 0.2,
        whiteRatio: 0.2,
      },
    };
  }

  ctx.drawImage(img, 0, 0, sampleW, sampleH);
  const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
  const data = imgData.data;

  // A. Sample Background in top corners (Top 18% left and right)
  const cornerW = Math.max(4, Math.floor(sampleW * 0.20));
  const cornerH = Math.max(4, Math.floor(sampleH * 0.18));
  let bgLumaSum = 0;
  let bgSampleCount = 0;
  let maxColorDiff = 0;

  for (let y = 0; y < cornerH; y += 2) {
    for (let x = 0; x < cornerW; x += 2) {
      // Top-Left corner
      const idx1 = (y * sampleW + x) * 4;
      const r1 = data[idx1];
      const g1 = data[idx1 + 1];
      const b1 = data[idx1 + 2];
      const l1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
      bgLumaSum += l1;
      bgSampleCount++;
      maxColorDiff = Math.max(maxColorDiff, Math.abs(r1 - g1), Math.abs(g1 - b1), Math.abs(r1 - b1));

      // Top-Right corner
      const idx2 = (y * sampleW + (sampleW - 1 - x)) * 4;
      const r2 = data[idx2];
      const g2 = data[idx2 + 1];
      const b2 = data[idx2 + 2];
      const l2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;
      bgLumaSum += l2;
      bgSampleCount++;
      maxColorDiff = Math.max(maxColorDiff, Math.abs(r2 - g2), Math.abs(g2 - b2), Math.abs(r2 - b2));
    }
  }

  const avgBgLuma = bgSampleCount > 0 ? bgLumaSum / bgSampleCount : 240;

  // B. Sample Center region (Face area: 28% to 72% width, 25% to 75% height)
  const startX = Math.floor(sampleW * 0.28);
  const endX = Math.floor(sampleW * 0.72);
  const startY = Math.floor(sampleH * 0.25);
  const endY = Math.floor(sampleH * 0.75);

  let centerPixels = 0;
  let whiteCenterPixels = 0;
  let skinCenterPixels = 0;

  for (let y = startY; y < endY; y += 2) {
    for (let x = startX; x < endX; x += 2) {
      centerPixels++;
      const idx = (y * sampleW + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      if (luma > 218) {
        whiteCenterPixels++;
      }

      // Skin tone standard computer vision heuristic
      const isSkin =
        r > 60 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r > b &&
        r - g >= 10 &&
        Math.abs(r - g) <= 85 &&
        r - b >= 14 &&
        luma < 238 &&
        luma > 40;

      if (isSkin) {
        skinCenterPixels++;
      }
    }
  }

  const whiteCenterRatio = centerPixels > 0 ? whiteCenterPixels / centerPixels : 0;
  const skinCenterRatio = centerPixels > 0 ? skinCenterPixels / centerPixels : 0;

  // Check 1: Anti-Cross-Upload: Is this a signature or scanned blank page uploaded as photo?
  if (whiteCenterRatio > 0.82 || (skinCenterRatio < 0.02 && whiteCenterRatio > 0.65)) {
    return {
      isValid: false,
      error:
        'Invalid Candidate Photo: The uploaded file contains mostly blank white paper and line strokes. It appears to be a signature, document, or line drawing, not a candidate photograph. Please upload your formal portrait photograph here.',
      metrics: {
        width,
        height,
        ratio,
        bgLuma: avgBgLuma,
        isWhiteOrLightBg: true,
        isPortrait: true,
        isLandscape: false,
        isSignatureLike: true,
        isPhotoLike: false,
        skinToneRatio: skinCenterRatio,
        whiteRatio: whiteCenterRatio,
      },
    };
  }

  // Check 2: Background Luminance (Must be plain white or off-white)
  // Govt / Board standard: average luminance >= 168 (out of 255)
  if (avgBgLuma < 168) {
    return {
      isValid: false,
      error: `Background Error: The photograph background is too dark or shadowy (measured brightness: ${Math.round(
        avgBgLuma
      )}/255, minimum required: 170/255). Indian Board & Govt standards require a plain white or light off-white background. Please upload a photo taken against a plain white wall.`,
      metrics: {
        width,
        height,
        ratio,
        bgLuma: avgBgLuma,
        isWhiteOrLightBg: false,
        isPortrait: true,
        isLandscape: false,
        isSignatureLike: false,
        isPhotoLike: true,
        skinToneRatio: skinCenterRatio,
        whiteRatio: whiteCenterRatio,
      },
    };
  }

  // Check 3: Vivid / Non-Uniform Background (Trees, outdoor sky, red curtain)
  if (maxColorDiff > 55) {
    return {
      isValid: false,
      error:
        'Background Error: The photo background has strong colors or outdoor scenery (vivid greenery, red wall, or dark patterns). Official passport specifications require a uniform, plain white or light background.',
      metrics: {
        width,
        height,
        ratio,
        bgLuma: avgBgLuma,
        isWhiteOrLightBg: false,
        isPortrait: true,
        isLandscape: false,
        isSignatureLike: false,
        isPhotoLike: true,
        skinToneRatio: skinCenterRatio,
        whiteRatio: whiteCenterRatio,
      },
    };
  }

  return {
    isValid: true,
    info: `✓ Meets Govt/Board specifications (Brightness: ${Math.round(
      avgBgLuma
    )}/255 • Portrait Face Confirmed)`,
    metrics: {
      width,
      height,
      ratio,
      bgLuma: avgBgLuma,
      isWhiteOrLightBg: true,
      isPortrait: true,
      isLandscape: false,
      isSignatureLike: false,
      isPhotoLike: true,
      skinToneRatio: skinCenterRatio,
      whiteRatio: whiteCenterRatio,
    },
  };
};

// 2. Analyze and validate Candidate / Guardian Signature
export const analyzeCandidateSignature = (
  img: HTMLImageElement
): ImageValidationResult => {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const ratio = width / height;

  // Aspect ratio check: Signature must be horizontal / landscape (width > height)
  if (ratio < 1.05) {
    return {
      isValid: false,
      error: `Aspect Ratio Error: Signatures must be signed horizontally on plain white paper (width must be greater than height; current ratio: ${ratio.toFixed(
        2
      )}). The uploaded image has vertical portrait proportions. If this is your passport photo, please upload it in the Candidate Photograph section above.`,
      metrics: {
        width,
        height,
        ratio,
        bgLuma: 0,
        isWhiteOrLightBg: false,
        isPortrait: true,
        isLandscape: false,
        isSignatureLike: false,
        isPhotoLike: true,
        skinToneRatio: 0.3,
        whiteRatio: 0.3,
      },
    };
  }

  // Pixel scanning for White Paper Coverage and Ink Type
  const canvas = document.createElement('canvas');
  const sampleW = Math.min(width, 500);
  const sampleH = Math.min(height, 250);
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      isValid: true,
      metrics: {
        width,
        height,
        ratio,
        bgLuma: 250,
        isWhiteOrLightBg: true,
        isPortrait: false,
        isLandscape: true,
        isSignatureLike: true,
        isPhotoLike: false,
        skinToneRatio: 0,
        whiteRatio: 0.9,
      },
    };
  }

  ctx.drawImage(img, 0, 0, sampleW, sampleH);
  const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
  const data = imgData.data;

  let totalSampled = 0;
  let whitePaperCount = 0;
  let blackInkCount = 0;
  let blueInkCount = 0;
  let otherInkCount = 0;
  let skinToneCount = 0;

  for (let i = 0; i < data.length; i += 8) {
    totalSampled++;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

    if (luma > 185) {
      whitePaperCount++;
    } else {
      // Non-white stroke pixel
      if (b > r + 18 && b > g + 10 && b < 215) {
        blueInkCount++;
      } else if (r < 115 && g < 115 && b < 115 && Math.abs(r - g) < 25 && Math.abs(r - b) < 25) {
        blackInkCount++;
      } else {
        otherInkCount++;
      }
    }

    // Check for skin tones (which indicate a face photo uploaded as signature)
    const isSkin =
      r > 65 &&
      g > 40 &&
      b > 20 &&
      r > g &&
      r > b &&
      r - g >= 10 &&
      Math.abs(r - g) <= 85 &&
      r - b >= 14 &&
      luma < 235 &&
      luma > 40;

    if (isSkin) {
      skinToneCount++;
    }
  }

  const whiteRatio = totalSampled > 0 ? whitePaperCount / totalSampled : 0;
  const skinToneRatio = totalSampled > 0 ? skinToneCount / totalSampled : 0;

  // Anti-Cross-Upload: Is this a photo uploaded into the signature slot?
  if (whiteRatio < 0.60 || skinToneRatio > 0.05) {
    return {
      isValid: false,
      error:
        'Invalid Signature File: The uploaded image appears to be a photograph or colorful picture (white background is insufficient). Please sign on a clean, blank white paper and upload.',
      metrics: {
        width,
        height,
        ratio,
        bgLuma: 100,
        isWhiteOrLightBg: false,
        isPortrait: false,
        isLandscape: true,
        isSignatureLike: false,
        isPhotoLike: true,
        skinToneRatio,
        whiteRatio,
      },
    };
  }

  let warning: string | undefined;
  if (otherInkCount > blackInkCount + blueInkCount) {
    warning =
      'Ink Notice: Please ensure signature is written in dark Black or Blue ink ballpoint/gel pen. Pencil, light gray, or red ink will be flagged during office verification.';
  }

  const inkTypeStr = blueInkCount > blackInkCount ? 'Blue Pen' : 'Black Pen';

  return {
    isValid: true,
    warning,
    info: `✓ Valid Signature on White Paper (${inkTypeStr} Ink • ${(whiteRatio * 100).toFixed(
      0
    )}% white paper coverage)`,
    metrics: {
      width,
      height,
      ratio,
      bgLuma: 245,
      isWhiteOrLightBg: true,
      isPortrait: false,
      isLandscape: true,
      isSignatureLike: true,
      isPhotoLike: false,
      skinToneRatio,
      whiteRatio,
    },
  };
};

// 3. Compress, crop, and optimize candidate photo strictly to 25 KB – 45 KB range (within 20 KB – 50 KB standard)
const optimizePhotoToTargetRange = (
  fileOrDataUrl: string,
  onComplete: (optimizedDataUrl: string, sizeKb: number, dimensions: string) => void,
  onError?: (msg: string) => void
) => {
  const img = new window.Image();
  img.onload = () => {
    try {
      // First validate authenticity against Govt/Board specs
      const check = analyzeCandidatePhoto(img);
      if (!check.isValid) {
        onError?.(check.error || 'Invalid photo format');
        return;
      }

      // Try multiple target canvas resolutions if needed to guarantee 25–45 KB
      // Standard passport ratio is 3.5 : 4.5
      const candidateResolutions = [
        { w: 380, h: 488 },
        { w: 420, h: 540 },
        { w: 460, h: 591 },
        { w: 340, h: 437 },
      ];

      let finalDataUrl = '';
      let finalSizeKb = 0;
      let finalDimStr = '380 × 488 px';

      for (const res of candidateResolutions) {
        const canvas = document.createElement('canvas');
        canvas.width = res.w;
        canvas.height = res.h;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Center crop to 3.5:4.5 ratio without distortion
        const sourceRatio = img.width / img.height;
        const targetRatio = res.w / res.h;

        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;
        if (sourceRatio > targetRatio) {
          sw = img.height * targetRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / targetRatio;
          sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, res.w, res.h);

        // Binary search for JPEG quality
        let low = 0.30;
        let high = 0.98;
        let bestUrl = '';
        let bestKb = 0;

        for (let iter = 0; iter < 8; iter++) {
          const mid = (low + high) / 2;
          const testUrl = canvas.toDataURL('image/jpeg', mid);
          const testKb = Math.round(((testUrl.length * 3) / 4) / 1024);

          bestUrl = testUrl;
          bestKb = testKb;

          if (testKb >= 25 && testKb <= 45) {
            break;
          } else if (testKb < 25) {
            low = mid;
          } else {
            high = mid;
          }
        }

        if (bestKb >= 20 && bestKb <= 50) {
          finalDataUrl = bestUrl;
          finalSizeKb = bestKb;
          finalDimStr = `${res.w} × ${res.h} px`;
          break;
        }

        // Keep best attempt so far
        if (!finalDataUrl || Math.abs(bestKb - 35) < Math.abs(finalSizeKb - 35)) {
          finalDataUrl = bestUrl;
          finalSizeKb = bestKb;
          finalDimStr = `${res.w} × ${res.h} px`;
        }
      }

      onComplete(finalDataUrl, finalSizeKb, finalDimStr);
    } catch (e: any) {
      onError?.(e.message || 'Failed to auto-fit photo');
    }
  };
  img.onerror = () => onError?.('Could not load image file for auto-fit');
  img.src = fileOrDataUrl;
};

// 4. Clean signature, enhance black/blue ink contrast, auto-crop signature bounding box, and optimize strictly to 10 KB – 50 KB range
const optimizeSignatureToTargetRange = (
  fileOrDataUrl: string,
  onComplete: (optimizedDataUrl: string, sizeKb: number, inkType: 'BLACK' | 'BLUE' | 'OTHER') => void,
  onError?: (msg: string) => void
) => {
  const img = new window.Image();
  img.onload = () => {
    try {
      // First validate authenticity
      const check = analyzeCandidateSignature(img);
      if (!check.isValid) {
        onError?.(check.error || 'Invalid signature format');
        return;
      }

      // Step 1: Detect signature bounding box to remove excess white borders
      const scanCanvas = document.createElement('canvas');
      const scanW = Math.min(img.naturalWidth || img.width, 1000);
      const scanH = Math.min(img.naturalHeight || img.height, 600);
      scanCanvas.width = scanW;
      scanCanvas.height = scanH;
      const scanCtx = scanCanvas.getContext('2d');
      if (!scanCtx) return;

      scanCtx.drawImage(img, 0, 0, scanW, scanH);
      const scanData = scanCtx.getImageData(0, 0, scanW, scanH).data;

      let minX = scanW, minY = scanH, maxX = 0, maxY = 0;
      let strokePixelCount = 0;

      for (let y = 0; y < scanH; y += 2) {
        for (let x = 0; x < scanW; x += 2) {
          const idx = (y * scanW + x) * 4;
          const luma = 0.299 * scanData[idx] + 0.587 * scanData[idx + 1] + 0.114 * scanData[idx + 2];
          if (luma < 190) {
            strokePixelCount++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // If ink strokes detected, crop tightly around strokes with balanced padding
      let cropX = 0, cropY = 0, cropW = scanW, cropH = scanH;
      if (strokePixelCount > 30 && maxX > minX && maxY > minY) {
        const padX = Math.max(25, Math.floor((maxX - minX) * 0.12));
        const padY = Math.max(20, Math.floor((maxY - minY) * 0.18));
        cropX = Math.max(0, minX - padX);
        cropY = Math.max(0, minY - padY);
        cropW = Math.min(scanW - cropX, (maxX - minX) + padX * 2);
        cropH = Math.min(scanH - cropY, (maxY - minY) + padY * 2);
      }

      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fit cropped signature bounding box comfortably into 500x200 canvas
      const scale = Math.min(460 / cropW, 165 / cropH);
      const drawW = cropW * scale;
      const drawH = cropH * scale;
      const dx = (500 - drawW) / 2;
      const dy = (200 - drawH) / 2;

      ctx.drawImage(scanCanvas, cropX, cropY, cropW, cropH, dx, dy, drawW, drawH);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let blackInkCount = 0;
      let blueInkCount = 0;
      let otherInkCount = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        if (luminance > 195) {
          // Whiten background
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        } else if (luminance < 165) {
          if (b > r + 15 && b > g) {
            blueInkCount++;
            data[i] = Math.max(0, r - 30);
            data[i + 1] = Math.max(0, g - 20);
            data[i + 2] = Math.min(255, b + 20);
          } else {
            blackInkCount++;
            data[i] = Math.max(0, r - 40);
            data[i + 1] = Math.max(0, g - 40);
            data[i + 2] = Math.max(0, b - 40);
          }
        } else {
          otherInkCount++;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      const inkType: 'BLACK' | 'BLUE' | 'OTHER' =
        blueInkCount > blackInkCount ? 'BLUE' : blackInkCount > 10 ? 'BLACK' : 'OTHER';

      // Calibrate size strictly into 15 KB – 45 KB
      let dataUrl = canvas.toDataURL('image/png');
      let sizeKb = Math.round(((dataUrl.length * 3) / 4) / 1024);

      if (sizeKb < 10 || sizeKb > 50) {
        let low = 0.5;
        let high = 0.98;
        for (let j = 0; j < 6; j++) {
          const mid = (low + high) / 2;
          const testUrl = canvas.toDataURL('image/jpeg', mid);
          const testKb = Math.round(((testUrl.length * 3) / 4) / 1024);
          if (testKb >= 15 && testKb <= 45) {
            dataUrl = testUrl;
            sizeKb = testKb;
            break;
          } else if (testKb < 15) {
            low = mid;
          } else {
            high = mid;
          }
        }
      }

      onComplete(dataUrl, sizeKb, inkType);
    } catch (e: any) {
      onError?.(e.message || 'Failed to process signature');
    }
  };
  img.onerror = () => onError?.('Could not load signature file');
  img.src = fileOrDataUrl;
};

const DEFAULT_ADMISSION_PAGE_CONFIG = {
  isOpen: true,
  academicYear: '2026–2027',
  announcementText:
    'Online Admissions Open for Academic Year 2026–2027 across Secondary & Higher Secondary campuses.',
};

export const AdmissionsPage: React.FC = () => {
  // Real-time synchronization with Admin toggles and session updates
  useAdmissionsSocket();

  const { data: config } = useQuery({
    queryKey: ['admissions_config'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/admissions/config');
        if (!res.ok) return DEFAULT_ADMISSION_PAGE_CONFIG;
        const json = await res.json();
        return json.data || DEFAULT_ADMISSION_PAGE_CONFIG;
      } catch {
        return DEFAULT_ADMISSION_PAGE_CONFIG;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const academicYear = config?.academicYear || '2026–2027';
  const announcementText =
    typeof config?.announcementText === 'string' && config.announcementText.trim()
      ? config.announcementText.trim()
      : DEFAULT_ADMISSION_PAGE_CONFIG.announcementText;
  const isOpen = config ? config.isOpen === true : true;

  // Cached draft for instant, non-destructive state hydration
  const [draft] = useState<AdmissionDraft>(() => getSavedDraft());

  // Persisted submitted receipt data (if form was already submitted)
  const [submittedData, setSubmittedData] = useState<any | null>(() => getSavedSubmittedData());

  // Step state: 1: Campus & Class, 2: Candidate, 3: Parents, 4: Address, 5: Verification, 6: Success
  const [step, setStep] = useState<number>(() => {
    const savedReceipt = getSavedSubmittedData();
    if (savedReceipt) return 6;
    const saved = draft.step;
    if (saved && saved >= 1 && saved <= 5) return saved;
    return 1;
  });
  const [maxVisitedStep, setMaxVisitedStep] = useState<number>(() => {
    const savedReceipt = getSavedSubmittedData();
    if (savedReceipt) return 6;
    const saved = draft.maxVisitedStep || draft.step;
    if (saved && saved >= 1 && saved <= 5) return saved;
    return 1;
  });
  const [hasDraft, setHasDraft] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem(ADMISSION_DRAFT_KEY);
    } catch {
      return false;
    }
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Form State
  const [institutionCode, setInstitutionCode] = useState<string>(() => draft.institutionCode || 'NIRAKAR_HS');
  const [gradeApplied, setGradeApplied] = useState<string>(() => draft.gradeApplied || 'Class V');
  const [selectedBaseStream, setSelectedBaseStream] = useState<'SCIENCE' | 'COMMERCE' | 'ARTS'>(() => draft.selectedBaseStream || 'SCIENCE');
  const [secondLanguage, setSecondLanguage] = useState<string>(() => draft.secondLanguage || 'Marathi');
  const [stream, setStream] = useState<string>(() => {
    if (draft.stream) return draft.stream;
    if (draft.institutionCode === 'ANGLE_HSS') {
      const base = draft.selectedBaseStream || 'SCIENCE';
      const lang = draft.secondLanguage || 'Marathi';
      const baseName = base === 'SCIENCE' ? 'Science' : base === 'COMMERCE' ? 'Commerce' : 'Arts';
      return `${baseName} (Language II: ${lang})`;
    }
    return '';
  });

  const updateHssSelection = (base: 'SCIENCE' | 'COMMERCE' | 'ARTS', lang: string) => {
    setSelectedBaseStream(base);
    setSecondLanguage(lang);
    const baseName = base === 'SCIENCE' ? 'Science' : base === 'COMMERCE' ? 'Commerce' : 'Arts';
    setStream(`${baseName} (Language II: ${lang})`);
  };

  // Student Particulars
  const [studentName, setStudentName] = useState<string>(() => draft.studentName || '');
  const [dob, setDob] = useState<string>(() => draft.dob || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>(() => draft.gender || 'MALE');
  const [placeOfBirth, setPlaceOfBirth] = useState<string>(() => draft.placeOfBirth || '');
  const [nationality, setNationality] = useState<string>(() => draft.nationality || 'Indian');
  const [motherTongue, setMotherTongue] = useState<string>(() => draft.motherTongue || 'Konkani');
  const [aadhaarNumber, setAadhaarNumber] = useState<string>(() => draft.aadhaarNumber || '');
  const [category, setCategory] = useState<string>(() => draft.category || 'GENERAL');
  const [bloodGroup, setBloodGroup] = useState<string>(() => draft.bloodGroup || '');

  // Candidate Photograph & Signature Upload State
  const [photoData, setPhotoData] = useState<string>(() => draft.photoData || '');
  const [photoName, setPhotoName] = useState<string>(() => draft.photoName || '');
  const [photoSizeKb, setPhotoSizeKb] = useState<number>(() => draft.photoSizeKb || 0);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState<string | null>(null);
  const [photoMetrics, setPhotoMetrics] = useState<string | null>(null);
  const [isOptimizingPhoto, setIsOptimizingPhoto] = useState<boolean>(false);

  const [signatureData, setSignatureData] = useState<string>(() => draft.signatureData || '');
  const [signatureName, setSignatureName] = useState<string>(() => draft.signatureName || '');
  const [signatureSizeKb, setSignatureSizeKb] = useState<number>(() => draft.signatureSizeKb || 0);
  const [sigInkType, setSigInkType] = useState<'BLACK' | 'BLUE' | 'OTHER'>('BLACK');
  const [sigError, setSigError] = useState<string | null>(null);
  const [sigSuccessMsg, setSigSuccessMsg] = useState<string | null>(null);
  const [sigMetrics, setSigMetrics] = useState<string | null>(null);
  const [isOptimizingSig, setIsOptimizingSig] = useState<boolean>(false);

  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    setPhotoSuccessMsg(null);
    setPhotoMetrics(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setPhotoError('Invalid format. Please upload a JPG or PNG photograph.');
      return;
    }

    setPhotoName(file.name);
    setIsOptimizingPhoto(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const testImg = new window.Image();
      testImg.onload = () => {
        // Run full Government of India & Board Examination authenticity verification
        const check = analyzeCandidatePhoto(testImg);
        if (!check.isValid) {
          setIsOptimizingPhoto(false);
          setPhotoError(check.error || 'Invalid photo format');
          return;
        }

        // Auto-fit immediately into strict 25–45 KB passport standard
        optimizePhotoToTargetRange(
          dataUrl,
          (optUrl, optSize, dimStr) => {
            setIsOptimizingPhoto(false);
            setPhotoData(optUrl);
            setPhotoSizeKb(optSize);
            setPhotoError(null);
            setPhotoSuccessMsg(`✓ Successfully auto-fitted to ${optSize} KB (${dimStr})`);
            setPhotoMetrics(`Passport 3.5:4.5 • Brightness: ${Math.round(check.metrics.bgLuma)}/255 • White BG Verified`);
          },
          (err) => {
            setIsOptimizingPhoto(false);
            setPhotoError(err);
          }
        );
      };
      testImg.onerror = () => {
        setIsOptimizingPhoto(false);
        setPhotoError('Could not process the uploaded photo file. Please try another image.');
      };
      testImg.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSigError(null);
    setSigSuccessMsg(null);
    setSigMetrics(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setSigError('Invalid format. Please upload a JPG or PNG signature.');
      return;
    }

    setSignatureName(file.name);
    setIsOptimizingSig(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const testImg = new window.Image();
      testImg.onload = () => {
        // Run full Government of India & Board Examination signature verification
        const check = analyzeCandidateSignature(testImg);
        if (!check.isValid) {
          setIsOptimizingSig(false);
          setSigError(check.error || 'Invalid signature format');
          return;
        }

        // Auto-clean background and calibrate into 10–50 KB
        optimizeSignatureToTargetRange(
          dataUrl,
          (optUrl, optSize, inkType) => {
            setIsOptimizingSig(false);
            setSignatureData(optUrl);
            setSignatureSizeKb(optSize);
            setSigInkType(inkType);
            setSigError(check.warning || null);
            setSigSuccessMsg(`✓ Cleaned & Calibrated to ${optSize} KB (${inkType} Ink)`);
            setSigMetrics(`White Paper: ${(check.metrics.whiteRatio * 100).toFixed(0)}% • Horizontal Ratio: ${check.metrics.ratio.toFixed(2)}`);
          },
          (err) => {
            setIsOptimizingSig(false);
            setSigError(err);
          }
        );
      };
      testImg.onerror = () => {
        setIsOptimizingSig(false);
        setSigError('Could not process the uploaded signature file.');
      };
      testImg.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Parents Particulars
  const [fatherName, setFatherName] = useState<string>(() => draft.fatherName || '');
  const [fatherOccupation, setFatherOccupation] = useState<string>(() => draft.fatherOccupation || '');
  const [motherName, setMotherName] = useState<string>(() => draft.motherName || '');
  const [motherOccupation, setMotherOccupation] = useState<string>(() => draft.motherOccupation || '');
  const [primaryPhone, setPrimaryPhone] = useState<string>(() => draft.primaryPhone || '');
  const [alternatePhone, setAlternatePhone] = useState<string>(() => draft.alternatePhone || '');
  const [email, setEmail] = useState<string>(() => draft.email || '');

  // Address & Academic Records
  const [address, setAddress] = useState<string>(() => draft.address || '');
  const [village, setVillage] = useState<string>(() => draft.village || '');
  const [taluka, setTaluka] = useState<string>(() => draft.taluka || 'Canacona');
  const [district, setDistrict] = useState<string>(() => draft.district || 'South Goa');
  const [state, setState] = useState<string>(() => draft.state || 'Goa');
  const [pincode, setPincode] = useState<string>(() => draft.pincode || '403728');

  const [previousSchool, setPreviousSchool] = useState<string>(() => draft.previousSchool || '');
  const [previousClass, setPreviousClass] = useState<string>(() => draft.previousClass || '');
  const [previousPercentage, setPreviousPercentage] = useState<string>(() => draft.previousPercentage || '');
  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(() => !!draft.declarationAccepted);

  // Track the highest step reached to allow backward and forward jumping
  useEffect(() => {
    if (step > maxVisitedStep && step <= 5) {
      setMaxVisitedStep(step);
    }
  }, [step, maxVisitedStep]);

  // Synchronize draft to localStorage whenever any form value changes
  useEffect(() => {
    if (step >= 1 && step <= 5) {
      const payload: AdmissionDraft = {
        step,
        maxVisitedStep,
        institutionCode,
        gradeApplied,
        selectedBaseStream,
        secondLanguage,
        stream,
        studentName,
        dob,
        gender,
        placeOfBirth,
        nationality,
        motherTongue,
        aadhaarNumber,
        category,
        bloodGroup,
        photoData,
        photoName,
        photoSizeKb,
        signatureData,
        signatureName,
        signatureSizeKb,
        fatherName,
        fatherOccupation,
        motherName,
        motherOccupation,
        primaryPhone,
        alternatePhone,
        email,
        address,
        village,
        taluka,
        district,
        state,
        pincode,
        previousSchool,
        previousClass,
        previousPercentage,
        declarationAccepted,
      };
      try {
        localStorage.setItem(ADMISSION_DRAFT_KEY, JSON.stringify(payload));
        setHasDraft(true);
      } catch (err) {
        console.warn('Failed to save admission draft to localStorage:', err);
      }
    }
  }, [
    step,
    maxVisitedStep,
    institutionCode,
    gradeApplied,
    selectedBaseStream,
    secondLanguage,
    stream,
    studentName,
    dob,
    gender,
    placeOfBirth,
    nationality,
    motherTongue,
    aadhaarNumber,
    category,
    bloodGroup,
    photoData,
    photoName,
    photoSizeKb,
    signatureData,
    signatureName,
    signatureSizeKb,
    fatherName,
    fatherOccupation,
    motherName,
    motherOccupation,
    primaryPhone,
    alternatePhone,
    email,
    address,
    village,
    taluka,
    district,
    state,
    pincode,
    previousSchool,
    previousClass,
    previousPercentage,
    declarationAccepted,
  ]);

  // Sync with browser history so browser Back stays within the form and moves to previous step
  useEffect(() => {
    const sectionId = decodeURIComponent(window.location.hash.slice(1));
    if (!sectionId) return;

    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  useEffect(() => {
    if (step >= 1 && step <= 5) {
      const currentHistStep = window.history.state?.admissionStep;
      if (currentHistStep !== step) {
        const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.history.pushState({ admissionStep: step }, '', currentUrl);
      }
    }
  }, [step]);

  // Listen to browser Back and Forward navigation events
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state.admissionStep === 'number') {
        const target = e.state.admissionStep;
        if (target >= 1 && target <= 5) {
          setStep(target);
          setErrorMessage(null);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Clear draft handler with confirmation
  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear your saved admission draft and start fresh? All entered details will be reset.')) {
      try {
        localStorage.removeItem(ADMISSION_DRAFT_KEY);
        localStorage.removeItem(ADMISSION_SUBMITTED_KEY);
      } catch {}
      setStep(1);
      setMaxVisitedStep(1);
      setInstitutionCode('NIRAKAR_HS');
      setGradeApplied('Class V');
      setSelectedBaseStream('SCIENCE');
      setSecondLanguage('Marathi');
      setStream('');
      setStudentName('');
      setDob('');
      setGender('MALE');
      setPlaceOfBirth('');
      setNationality('Indian');
      setMotherTongue('Konkani');
      setAadhaarNumber('');
      setCategory('GENERAL');
      setBloodGroup('');
      setPhotoData('');
      setPhotoName('');
      setPhotoSizeKb(0);
      setPhotoError(null);
      setSignatureData('');
      setSignatureName('');
      setSignatureSizeKb(0);
      setSigError(null);
      setFatherName('');
      setFatherOccupation('');
      setMotherName('');
      setMotherOccupation('');
      setPrimaryPhone('');
      setAlternatePhone('');
      setEmail('');
      setAddress('');
      setVillage('');
      setTaluka('Canacona');
      setDistrict('South Goa');
      setState('Goa');
      setPincode('403728');
      setPreviousSchool('');
      setPreviousClass('');
      setPreviousPercentage('');
      setDeclarationAccepted(false);
      setErrorMessage(null);
      setHasDraft(false);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  // Strict Numeric Sanitizer Handlers (Disallows letters, symbols, or injection payload)
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaarNumber(raw);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPrimaryPhone(raw);
  };

  const handleAltPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setAlternatePhone(raw);
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(raw);
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    if (Number(raw) <= 100) setPreviousPercentage(raw);
  };

  // Submission Mutation
  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/v1/admissions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Submission failed. Please check the entered particulars.');
      }
      return json.data;
    },
    onSuccess: (data) => {
      try {
        localStorage.removeItem(ADMISSION_DRAFT_KEY);
        localStorage.setItem(ADMISSION_SUBMITTED_KEY, JSON.stringify(data));
      } catch {}
      setSubmittedData(data);
      setStep(6);
      setMaxVisitedStep(6);
      setHasDraft(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'An error occurred during submission.');
    },
  });

  // Step validation
  const handleNext = () => {
    setErrorMessage(null);
    if (step === 1) {
      if (!institutionCode || !gradeApplied) {
        setErrorMessage('Please select both the institution and the class applied for.');
        return;
      }
      if (institutionCode === 'ANGLE_HSS' && !stream) {
        setErrorMessage('Please select an academic stream (Arts, Science, or Commerce).');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } else if (step === 2) {
      if (!studentName.trim() || studentName.trim().length < 2) {
        setErrorMessage('Please enter the full legal name of the candidate.');
        return;
      }
      if (!dob) {
        setErrorMessage('Please provide a valid date of birth.');
        return;
      }
      if (aadhaarNumber.length !== 12) {
        setErrorMessage('Aadhaar number must be exactly 12 numeric digits (strictly numbers only).');
        return;
      }
      if (!photoData) {
        setErrorMessage('Please upload a passport size photograph of the candidate (strictly 20 KB – 50 KB).');
        return;
      }
      if (photoSizeKb < 20 || photoSizeKb > 50) {
        setErrorMessage(`Candidate photo size is ${photoSizeKb} KB. Goa Board / Educational standards require photo size strictly between 20 KB and 50 KB. You can click the "Auto-Fit" button to optimize.`);
        return;
      }
      if (!signatureData) {
        setErrorMessage('Please upload candidate/guardian signature (strictly 10 KB – 50 KB in Black or Blue ink).');
        return;
      }
      if (signatureSizeKb < 10 || signatureSizeKb > 50) {
        setErrorMessage(`Signature size is ${signatureSizeKb} KB. Signature size must be strictly between 10 KB and 50 KB. Click "Auto-Clean" to optimize.`);
        return;
      }
      setStep(3);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } else if (step === 3) {
      if (!fatherName.trim() || !motherName.trim()) {
        setErrorMessage("Please enter both Father's and Mother's full names.");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(primaryPhone)) {
        setErrorMessage('Primary contact number must be a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.');
        return;
      }
      if (alternatePhone && alternatePhone.length !== 10) {
        setErrorMessage('Alternate contact number must be exactly 10 numeric digits if provided.');
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrorMessage('Please enter a valid email address for application correspondence.');
        return;
      }
      setStep(4);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } else if (step === 4) {
      if (!address.trim() || !village.trim()) {
        setErrorMessage('Please enter complete residential address particulars.');
        return;
      }
      if (pincode.length !== 6) {
        setErrorMessage('PIN Code must be exactly 6 numeric digits.');
        return;
      }
      setStep(5);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!captchaToken) {
      setErrorMessage('Please complete the identity verification security challenge before submitting.');
      return;
    }

    if (!declarationAccepted) {
      setErrorMessage('You must confirm the truthfulness of the provided particulars.');
      return;
    }

    const payload = {
      institutionCode,
      gradeApplied,
      stream: institutionCode === 'ANGLE_HSS' ? stream : undefined,
      studentName: studentName.trim(),
      dob,
      gender,
      placeOfBirth: placeOfBirth.trim() || undefined,
      nationality: nationality.trim() || 'Indian',
      motherTongue: motherTongue.trim() || 'Konkani',
      aadhaarNumber,
      category,
      bloodGroup: bloodGroup.trim() || undefined,
      fatherName: fatherName.trim(),
      fatherOccupation: fatherOccupation.trim() || undefined,
      motherName: motherName.trim(),
      motherOccupation: motherOccupation.trim() || undefined,
      primaryPhone,
      alternatePhone: alternatePhone || undefined,
      email: email.trim(),
      address: address.trim(),
      village: village.trim(),
      taluka: taluka.trim() || 'Canacona',
      district: district.trim() || 'South Goa',
      state: state.trim() || 'Goa',
      pincode,
      previousSchool: previousSchool.trim() || undefined,
      previousClass: previousClass.trim() || inferPreviousClass(gradeApplied) || undefined,
      previousPercentage: previousPercentage ? Number(previousPercentage) : undefined,
      photoData: photoData || undefined,
      signatureData: signatureData || undefined,
      declarationAccepted: true,
    };

    submitMutation.mutate(payload);
  };

  const stepsList = [
    { num: 1, label: 'Campus & Standard' },
    { num: 2, label: 'Candidate Particulars' },
    { num: 3, label: 'Parent Details' },
    { num: 4, label: 'Residential Address' },
    { num: 5, label: 'Verification & Submit' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-ink flex flex-col font-sans">
      <Helmet>
        <title>Student Admissions {academicYear} | Shri Nirakar Education Society</title>
        <meta
          name="description"
          content={`Official online admission application for Academic Session ${academicYear} across Shri Nirakar High School, S.S. Angle Higher Secondary, and Tudal High School in Canacona, Goa.`}
        />
      </Helmet>

      {/* High-Resolution A4 Print Stylesheet (Calibrated for strict single-page pure white print) */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 11px !important;
            line-height: 1.25 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, footer, .no-print, button, a {
            display: none !important;
          }
          /* Reset top-level containers only, NEVER generic div */
          body > #root,
          #root > div,
          main,
          main > section,
          .print-clean-container,
          .no-print-wrapper {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: transparent !important;
            background-color: transparent !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-form-sheet {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 4mm 6mm !important;
            border: 1.5px solid #000000 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            height: 280mm !important;
            min-height: 280mm !important;
            max-height: 282mm !important;
          }
          /* Real government form: Pure white background everywhere in print */
          .print-form-sheet,
          .print-form-sheet *:not(img) {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
          }
          /* Protect flex header row */
          .print-outer-meta {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            border-bottom: 1.2px solid #000000 !important;
            padding-bottom: 3px !important;
            font-size: 11px !important;
            font-weight: bold !important;
          }
          .print-header-grid {
            display: flex !important;
            flex-direction: row !important;
            align-items: stretch !important;
            justify-content: space-between !important;
            gap: 12px !important;
            border: 1px solid #000000 !important;
            width: 100% !important;
            padding: 5px !important;
          }
          /* PASSPORT PHOTO STRICT LOCK: Perfectly proportioned 32mm width x 40mm height */
          .print-photo-box {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            width: 32mm !important;
            min-width: 32mm !important;
            max-width: 32mm !important;
            height: 40mm !important;
            min-height: 40mm !important;
            max-height: 40mm !important;
            border: 1px solid #000000 !important;
            overflow: hidden !important;
            flex-shrink: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-photo-box img,
          .print-photo-img {
            width: 32mm !important;
            min-width: 32mm !important;
            max-width: 32mm !important;
            height: 35mm !important;
            min-height: 35mm !important;
            max-height: 35mm !important;
            object-fit: cover !important;
            display: block !important;
            background: transparent !important;
            background-color: transparent !important;
          }
          .print-sig-img {
            max-height: 28px !important;
            max-width: 130px !important;
            object-fit: contain !important;
            display: inline-block !important;
            background: transparent !important;
            background-color: transparent !important;
          }
          .print-declaration-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 10px !important;
            text-align: center !important;
            width: 100% !important;
          }
          .print-office-grid {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: stretch !important;
            width: 100% !important;
            gap: 12px !important;
          }
          .print-office-left {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            width: 56% !important;
            flex: 0 0 56% !important;
          }
          .print-stamp-box {
            border: 1.5px dashed #000000 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 40% !important;
            flex: 0 0 40% !important;
            min-height: 105px !important;
            height: 105px !important;
            padding: 6px !important;
            background: #ffffff !important;
          }
          .print-form-sheet table {
            border-collapse: collapse !important;
            border: 1px solid #000000 !important;
            width: 100% !important;
            margin: 0 !important;
          }
          .print-form-sheet th,
          .print-form-sheet td {
            border: 1px solid #000000 !important;
            padding: 4px 6px !important;
          }
        }
      `}</style>

      <div className="no-print">
        <Navbar />
      </div>

      <main className="w-full flex-1">
        {/* Header Banner: Seamlessly tucked under Navbar golden curve with ZERO gap */}
        <section className="no-print w-full bg-[#0b132b] text-white -mt-0 lg:-mt-[78px] pt-12 sm:pt-16 lg:pt-28 pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-0 overflow-hidden">
          {/* Thread-like curve wave strips in light orange / amber */}
          <HeroWaves opacity={0.85} />

          <div className="w-full max-w-5xl mx-auto space-y-4 relative z-10 flex flex-col items-center text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-mono text-stone-300">
              <span className="font-semibold text-amber-300">Shri Nirakar Education Society</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-300">Canacona, South Goa</span>
              <span className="text-stone-500">•</span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-amber-300 border border-white/20 px-3.5 py-1 rounded-full font-bold text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Academic Session {academicYear}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                Student Admission Application Form
              </h1>
            </div>

            <p className="font-sans text-base sm:text-lg text-stone-300 max-w-3xl leading-relaxed mx-auto text-center">
              Official online application for admission to secondary classes (Shri Nirakar High School, Tudal High School) and higher secondary streams (S.S. Angle Higher Secondary School).
            </p>
          </div>
        </section>

        {/* SVG Curve finishing the hero banner with smooth organic transition */}
        <div className="no-print">
          <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />
        </div>

        {/* Full-Width Stretched Form Area (Matches Homepage Layout, Big & Legible) */}
        <section id="application-form" className="scroll-mt-28 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 sm:py-14">
          {!isOpen ? (
            /* Concluded Notice */
            <div className="py-16 text-center space-y-5 max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl font-bold text-stone-900">
                Admissions Concluded for Session {academicYear}
              </h2>
              <p className="text-base text-stone-600 leading-relaxed font-sans">
                Online admission applications for Academic Session {academicYear} are currently concluded. For transfer inquiries, late enrolments, or physical verification of submitted forms, please contact the Principal’s office during working hours.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-[#111b5e] hover:bg-[#0b132b] text-white px-7 py-3 rounded-xl font-serif text-sm font-bold transition-all shadow-sm"
                >
                  <Phone size={16} />
                  <span>Contact Campus Office</span>
                </a>
                <a
                  href="/institutions"
                  className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 text-stone-800 px-6 py-3 rounded-xl font-serif text-sm font-semibold transition-all"
                >
                  <Building2 size={16} />
                  <span>Institutions Directory</span>
                </a>
              </div>
            </div>
          ) : step === 6 && submittedData ? (
            /* Full-Page Official Admission Form Receipt (Designed like an authentic Indian Board / Educational Form) */
            <div className="print-clean-container py-6 sm:py-10 space-y-8 animate-fade-in">
              {/* Top Action Bar (Hidden during print) */}
              <div className="no-print flex flex-col xl:flex-row xl:items-center justify-between gap-5 pb-6 border-b border-stone-200">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shadow-2xs">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>Application Registered Successfully</span>
                    </span>
                    {submittedData?.applicationNumber && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                        <span className="text-stone-400 font-sans text-[11px] font-normal uppercase tracking-wider">Ref:</span>
                        <strong className="text-[#111b5e] font-bold">{submittedData.applicationNumber}</strong>
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                    Official Admission Form Receipt
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
                    Official admission application recorded for Academic Session {academicYear}. Download the verified PDF or print this form.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <a
                    href={apiUrl(`/api/v1/admissions/applications/${submittedData.id}/pdf`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#111b5e] hover:bg-[#0b132b] text-white px-4.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer active:translate-y-0.5"
                  >
                    <Download size={15} className="shrink-0" />
                    <span>Download Official PDF</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-stone-800 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-2xs transition-colors whitespace-nowrap cursor-pointer active:translate-y-0.5"
                  >
                    <Printer size={15} className="shrink-0 text-stone-600" />
                    <span>Print Form / Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.removeItem(ADMISSION_DRAFT_KEY);
                        localStorage.removeItem(ADMISSION_SUBMITTED_KEY);
                      } catch {}
                      setStep(1);
                      setMaxVisitedStep(1);
                      setSubmittedData(null);
                      setInstitutionCode('NIRAKAR_HS');
                      setGradeApplied('Class V');
                      setStudentName('');
                      setDob('');
                      setGender('MALE');
                      setPlaceOfBirth('');
                      setAadhaarNumber('');
                      setFatherName('');
                      setMotherName('');
                      setPrimaryPhone('');
                      setAlternatePhone('');
                      setEmail('');
                      setAddress('');
                      setVillage('');
                      setPincode('403728');
                      setPreviousSchool('');
                      setPreviousClass('');
                      setPreviousPercentage('');
                      setPhotoData('');
                      setPhotoName('');
                      setPhotoSizeKb(0);
                      setSignatureData('');
                      setSignatureName('');
                      setSignatureSizeKb(0);
                      setDeclarationAccepted(false);
                      setCaptchaToken(null);
                      setHasDraft(false);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-900 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer active:translate-y-0.5"
                  >
                    <RotateCcw size={14} className="shrink-0 text-stone-500" />
                    <span>New Application</span>
                  </button>
                </div>
              </div>

              {/* Authentic Government School Admission Form Sheet (Spacious On-Website View & Guaranteed 1-Page Print) */}
              <div className="no-print-wrapper w-full flex justify-center py-6 sm:py-8 overflow-x-auto bg-stone-100 rounded-2xl border border-stone-200 p-2 sm:p-5 lg:p-8">
                <div className="print-form-sheet bg-white border-2 border-black p-5 sm:p-7 md:p-8 shadow-2xl text-black font-sans w-full max-w-4xl lg:max-w-5xl xl:max-w-[960px] space-y-2.5 box-border">
                  {/* Outer Form Metadata Bar (Application Ref No. & Filing Date at Top Boundary) */}
                  <div
                    className="print-outer-meta flex items-center justify-between pb-1.5 border-b border-black text-xs sm:text-sm bg-white"
                    style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs uppercase font-bold text-black tracking-wider">Application Ref. No.:</span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-black tracking-wide">
                        {submittedData.applicationNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-right">
                      <span className="text-xs uppercase font-bold text-black tracking-wider">Date of Filing:</span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-black">
                        {new Date(submittedData.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Institutional Top Header */}
                  <div className="text-center py-1.5 border-b border-black space-y-1 bg-white">
                    <h1 className="font-serif text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
                      Shri Nirakar Education Society
                    </h1>
                    <p className="font-sans font-bold text-xs sm:text-sm text-black tracking-wide uppercase">
                      Canacona, South Goa — 403728
                    </p>
                    <p className="text-[11px] sm:text-xs text-black font-sans">
                      (Recognised by Directorate of Education, Govt. of Goa &amp; Affiliated to G.B.S.H.S.E.)
                    </p>
                    <div className="pt-1">
                      <span className="inline-block border border-black bg-white text-black font-sans font-bold text-xs sm:text-sm px-4 py-1 uppercase tracking-wider">
                        Application Form for Admission ({academicYear})
                      </span>
                    </div>
                  </div>

                  {/* Campus, Standard & Candidate Passport Photo Block */}
                  <div
                    className="print-header-grid flex items-stretch justify-between gap-3 p-2 border border-black bg-white"
                    style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch' }}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 text-xs sm:text-sm bg-white">
                      <div className="text-xs sm:text-sm text-black">
                        <span className="font-bold text-black uppercase text-[11px] block text-stone-600">Institution / Campus</span>
                        <strong className="font-bold text-black text-xs sm:text-sm">{submittedData.institutionName}</strong>
                      </div>
                      <div className="text-xs sm:text-sm text-black">
                        <span className="font-bold text-black uppercase text-[11px] block text-stone-600">Class &amp; Stream Applied</span>
                        <strong className="font-bold text-black text-xs sm:text-sm">
                          {submittedData.gradeApplied} {submittedData.stream ? `— ${submittedData.stream}` : ''}
                        </strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-black pt-1">
                        <div>
                          <span className="font-bold text-stone-600 uppercase text-[10.5px] block">Admission Category</span>
                          <span className="uppercase font-bold text-xs sm:text-sm">{submittedData.category || 'General'}</span>
                        </div>
                        <div>
                          <span className="font-bold text-stone-600 uppercase text-[10.5px] block">Medium of Instruction</span>
                          <span className="font-bold text-xs sm:text-sm">English</span>
                        </div>
                      </div>
                    </div>

                    {/* Passport Photo Box (Top Right) */}
                    <div
                      className="print-photo-box shrink-0 border border-black bg-white overflow-hidden flex flex-col items-center justify-center"
                      style={{
                        width: '105px',
                        minWidth: '105px',
                        maxWidth: '105px',
                        height: '135px',
                        minHeight: '135px',
                        maxHeight: '135px',
                      }}
                    >
                      {photoData || submittedData.photoUrl ? (
                        <div className="w-full h-full flex flex-col bg-white">
                          <img
                            src={photoData || submittedData.photoUrl}
                            alt="Candidate Photo"
                            className="print-photo-img object-cover"
                            style={{
                              width: '105px',
                              maxWidth: '105px',
                              height: '115px',
                              maxHeight: '115px',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                          <div className="bg-white border-t border-black text-[8.5px] font-sans font-bold text-center py-0.5 uppercase text-black">
                            Candidate Photo
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[9px] text-black font-sans bg-white leading-tight">
                          <Camera size={16} className="mb-1 text-black" />
                          <span className="font-bold">AFFIX RECENT<br/>PASSPORT PHOTO</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section I: Candidate Legal Particulars */}
                  <div>
                    <div className="bg-white border-x border-t border-black px-2.5 py-1 font-sans font-bold text-xs uppercase tracking-wide text-black">
                      I. Candidate Legal Particulars
                    </div>
                    <table className="w-full border-collapse border border-black text-xs sm:text-sm bg-white">
                      <tbody>
                        <tr className="border-b border-black">
                          <td className="p-1.5 sm:p-2 border-r border-black w-1/4 bg-white text-[10.5px] text-stone-700 font-bold uppercase">Candidate Full Name</td>
                          <td className="p-1.5 sm:p-2 border-r border-black font-bold text-black uppercase bg-white text-xs sm:text-sm" colSpan={3}>{submittedData.studentName}</td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Date of Birth</td>
                          <td className="p-1.5 sm:p-2 border-r border-black font-mono font-bold text-black bg-white text-xs sm:text-sm">{submittedData.dob?.slice(0, 10)}</td>
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Gender</td>
                          <td className="p-1.5 sm:p-2 font-bold text-black bg-white text-xs sm:text-sm">{submittedData.gender}</td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Place of Birth</td>
                          <td className="p-1.5 sm:p-2 border-r border-black font-bold text-black bg-white text-xs sm:text-sm">{submittedData.placeOfBirth || 'Canacona, Goa'}</td>
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Aadhaar Card No.</td>
                          <td className="p-1.5 sm:p-2 font-mono font-bold text-black bg-white text-xs sm:text-sm">{submittedData.aadhaarNumber?.replace(/(\d{4})/g, '$1 ').trim()}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Social Category</td>
                          <td className="p-1.5 sm:p-2 border-r border-black font-bold text-black bg-white text-xs sm:text-sm">{submittedData.category}</td>
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Mother Tongue / Nationality</td>
                          <td className="p-1.5 sm:p-2 font-bold text-black bg-white text-xs sm:text-sm">{submittedData.motherTongue} / Indian</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section II: Parent & Guardian Particulars */}
                  <div>
                    <div className="bg-white border-x border-t border-black px-2.5 py-1 font-sans font-bold text-xs uppercase tracking-wide text-black">
                      II. Parent &amp; Guardian Particulars
                    </div>
                    <table className="w-full border-collapse border border-black text-xs sm:text-sm bg-white">
                      <tbody>
                        <tr className="border-b border-black">
                          <td className="p-1.5 sm:p-2 border-r border-black w-1/4 bg-white text-[10.5px] text-stone-700 font-bold uppercase">Father's Full Name</td>
                          <td className="p-1.5 sm:p-2 border-r border-black font-bold text-black bg-white text-xs sm:text-sm">{submittedData.fatherName}</td>
                          <td className="p-1.5 sm:p-2 border-r border-black w-1/4 bg-white text-[10.5px] text-stone-700 font-bold uppercase">Occupation</td>
                          <td className="p-1.5 sm:p-2 font-bold text-black bg-white text-xs sm:text-sm">{submittedData.fatherOccupation || 'Employed / Self-Employed'}</td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Mother's Full Name</td>
                          <td className="p-1.5 sm:p-2 border-r border-black font-bold text-black bg-white text-xs sm:text-sm">{submittedData.motherName}</td>
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Occupation</td>
                          <td className="p-1.5 sm:p-2 font-bold text-black bg-white text-xs sm:text-sm">{submittedData.motherOccupation || 'Homemaker'}</td>
                        </tr>
                        <tr className="border-b border-black">
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Primary Mobile (+91)</td>
                          <td className="p-1.5 sm:p-2 border-r border-black font-mono font-bold text-black bg-white text-xs sm:text-sm">+91 {submittedData.primaryPhone}</td>
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Alternate Phone / Email</td>
                          <td className="p-1.5 sm:p-2 font-bold text-black truncate bg-white text-xs sm:text-sm">{submittedData.alternatePhone ? `+91 ${submittedData.alternatePhone} / ` : ''}{submittedData.email}</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Residential Address</td>
                          <td className="p-1.5 sm:p-2 font-bold text-black bg-white text-xs sm:text-sm" colSpan={3}>
                            {submittedData.address}, {submittedData.village}, {submittedData.taluka}, {submittedData.district}, Goa — PIN: {submittedData.pincode}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section III: Previous Academic Record (Resolves without N/A) */}
                  <div>
                    <div className="bg-white border-x border-t border-black px-2.5 py-1 font-sans font-bold text-xs uppercase tracking-wide text-black">
                      III. Previous Academic Record
                    </div>
                    <table className="w-full border-collapse border border-black text-xs sm:text-sm bg-white">
                      <tbody>
                        <tr>
                          <td className="p-1.5 sm:p-2 border-r border-black w-1/4 bg-white text-[10.5px] text-stone-700 font-bold uppercase">Last School Attended</td>
                          <td className="p-1.5 sm:p-2 border-r border-black font-bold text-black bg-white text-xs sm:text-sm">{submittedData.previousSchool || 'Not Specified'}</td>
                          <td className="p-1.5 sm:p-2 border-r border-black bg-white text-[10.5px] text-stone-700 font-bold uppercase">Class Passed &amp; Score</td>
                          <td className="p-1.5 sm:p-2 font-bold text-black font-mono bg-white text-xs sm:text-sm">
                            {formatPreviousAcademicRecord(
                              submittedData.gradeApplied,
                              submittedData.previousClass,
                              submittedData.previousPercentage
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section IV: Declaration & Signatures */}
                  <div className="border border-black p-2 bg-white space-y-2 text-xs sm:text-sm">
                    <div className="text-xs text-black leading-relaxed bg-white">
                      <strong>Declaration:</strong> I hereby certify that the particulars furnished in this admission application are true and correct to the best of my knowledge and belief. If admitted, we promise to strictly abide by all rules, academic regulations, and discipline of the school and the Goa Board.
                    </div>
                    <div
                      className="print-declaration-grid grid grid-cols-3 gap-3 pt-2 text-center text-xs bg-white"
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
                    >
                      <div className="bg-white">
                        <div className="h-10 flex items-end justify-center bg-white">
                          <span className="font-mono text-black font-bold">________________________</span>
                        </div>
                        <span className="text-black font-bold block pt-1 text-xs">Signature of Parent / Guardian</span>
                      </div>
                      <div className="bg-white">
                        <div className="h-10 flex items-center justify-center bg-white">
                          {signatureData || submittedData.signatureUrl ? (
                            <img
                              src={signatureData || submittedData.signatureUrl}
                              alt="Candidate Signature"
                              className="print-sig-img h-8 max-w-[130px] object-contain"
                              style={{ maxHeight: '32px', maxWidth: '130px', objectFit: 'contain' }}
                            />
                          ) : (
                            <span className="font-mono text-black font-bold">________________________</span>
                          )}
                        </div>
                        <span className="text-black font-bold block pt-1 text-xs">Signature of Candidate</span>
                      </div>
                      <div className="bg-white">
                        <div className="h-10 flex flex-col justify-end text-xs text-black font-mono font-bold bg-white leading-tight">
                          <span>
                            Date: {new Date(submittedData.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                          <span>Place: {getApplicantLocation(submittedData)}</span>
                        </div>
                        <span className="text-black font-bold block pt-1 text-xs">Date &amp; Place</span>
                      </div>
                    </div>
                  </div>

                  {/* Section V: Official School Scrutiny & Seal Verification (Spacious Headmaster Stamp Box) */}
                  <div className="border border-black p-2.5 bg-white space-y-2 text-xs sm:text-sm">
                    <div className="font-sans font-bold text-xs uppercase tracking-wider text-black border-b border-black pb-1 bg-white">
                      FOR OFFICE / SCHOOL SCRUTINY &amp; VERIFICATION ONLY
                    </div>
                    
                    {/* Verification Checkboxes */}
                    <div className="grid grid-cols-4 gap-2 text-xs text-black py-1 bg-white font-medium">
                      <span className="font-mono font-bold">[ &nbsp; ] Birth Certificate Verified</span>
                      <span className="font-mono font-bold">[ &nbsp; ] Transfer Certificate (TC/LC)</span>
                      <span className="font-mono font-bold">[ &nbsp; ] Aadhaar Copy Attached</span>
                      <span className="font-mono font-bold">[ &nbsp; ] Marksheet Verified</span>
                    </div>

                    {/* Official Record & Spacious Headmaster Stamp Box (Guaranteed Side-by-Side: Left Info, Right Stamp Box) */}
                    <div
                      className="print-office-grid border-t border-black pt-2.5 flex flex-row items-stretch justify-between gap-4 bg-white"
                      style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch' }}
                    >
                      {/* Left Side: Administrative Info Lines */}
                      <div
                        className="print-office-left space-y-2.5 text-xs sm:text-sm text-black font-sans flex flex-col justify-between bg-white"
                        style={{ width: '56%', flex: '0 0 56%' }}
                      >
                        <div>
                          <span className="font-bold text-black">Admission Granted to Class: </span>
                          <span className="font-mono font-bold">________________________ &nbsp; Div: ____________</span>
                        </div>
                        <div>
                          <span className="font-bold text-black">General Register (G.R.) No.: </span>
                          <span className="font-mono font-bold">________________________________</span>
                        </div>
                        <div>
                          <span className="font-bold text-black">Date of Admission: </span>
                          <span className="font-mono font-bold">________________________________</span>
                        </div>
                        <div>
                          <span className="font-bold text-black">Scrutiny Clerk Signature: </span>
                          <span className="font-mono font-bold">________________________________</span>
                        </div>
                      </div>

                      {/* Right Side: Dedicated Headmaster Rubber Stamp & Signature Box */}
                      <div
                        className="print-stamp-box border border-dashed border-black bg-white p-2.5 rounded flex flex-col items-center justify-between min-h-[110px] text-center"
                        style={{
                          width: '40%',
                          flex: '0 0 40%',
                          border: '1.5px dashed #000000',
                          minHeight: '110px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span className="text-[9px] font-bold text-black uppercase tracking-widest block">
                          [ OFFICIAL SCHOOL SEAL / STAMP ]
                        </span>
                        <div className="w-full pt-4 bg-white">
                          <div className="border-b border-black w-4/5 mx-auto mb-1.5"></div>
                          <span className="text-[10px] sm:text-xs font-bold text-black uppercase tracking-tight block">
                            Headmaster / Principal Seal &amp; Sign
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Document Verification Notice (Hidden in print) */}
              <div className="no-print p-5 bg-amber-50/70 border-l-4 border-amber-500 rounded-r-xl text-sm text-amber-950 space-y-1.5">
                <strong className="font-bold block text-base">Office Document Verification Notice:</strong>
                <p className="leading-relaxed">
                  Please print this official application form. Attach photocopies of the candidate’s Birth Certificate, Aadhaar Card, and the Transfer Certificate (TC) from the previous school, and submit them in person to the respective school office.
                </p>
              </div>
            </div>
          ) : (
            /* Full-Page Form Flow (Direct Page Flow, Big & Stretched Wide) */
            <div className="space-y-10">
              {/* Horizontal Formal Steps Timeline */}
              <div className="border-b border-stone-200/90 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#111b5e] text-white font-mono text-xs font-bold flex items-center justify-center shadow-xs">
                      {step}
                    </span>
                    <span className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                      {stepsList[step - 1]?.label}
                    </span>
                    <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-md">
                      Step {step} of 5
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasDraft && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-sans text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-2.5 py-1 rounded-full shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Draft Auto-Saved
                      </span>
                    )}
                    {hasDraft && (
                      <button
                        type="button"
                        onClick={handleClearDraft}
                        className="inline-flex items-center gap-1 text-xs font-sans text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                        title="Clear all saved progress and start fresh"
                      >
                        <RotateCcw size={12} />
                        <span>Clear Draft</span>
                      </button>
                    )}
                    <span className="text-stone-500 text-xs sm:text-sm font-sans hidden md:inline">
                      <span className="text-red-500 font-bold">*</span> Mandatory fields
                    </span>
                  </div>
                </div>

                {/* Clean Horizontal Steps Line - Clickable navigation for visited steps */}
                <div className="grid grid-cols-5 gap-2.5 sm:gap-4">
                  {stepsList.map((s) => {
                    const isClickable = s.num <= maxVisitedStep;
                    return (
                      <button
                        key={s.num}
                        type="button"
                        disabled={!isClickable}
                        onClick={() => {
                          if (isClickable) {
                            setErrorMessage(null);
                            setStep(s.num);
                            window.scrollTo({ top: 200, behavior: 'smooth' });
                          }
                        }}
                        className={`text-left space-y-2 transition-all ${
                          isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default opacity-60'
                        }`}
                        title={isClickable ? `Jump to Step ${s.num}: ${s.label}` : `Complete previous steps first`}
                      >
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            step >= s.num ? 'bg-[#111b5e]' : 'bg-stone-200'
                          }`}
                        />
                        <span
                          className={`text-xs sm:text-sm block truncate font-sans ${
                            step === s.num
                              ? 'text-[#111b5e] font-bold'
                              : step > s.num
                              ? 'text-stone-800 font-semibold'
                              : 'text-stone-400 font-medium'
                          }`}
                        >
                          {s.num}. {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-sans flex items-start gap-3 animate-shake">
                  <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Required correction: </strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* STEP 1: Institution & Class Selection (Formal Selection, No Boxes) */}
              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
                      Select Institution & Standard Applied For
                    </h2>
                    <p className="text-sm sm:text-base text-stone-600 mt-1.5 font-sans">
                      Choose the school under Shri Nirakar Education Society for Academic Session {academicYear}.
                    </p>
                  </div>

                  {/* Formal Institution Selection List (Centered SVG Radios, No Gimmick Badges) */}
                  <div className="space-y-4 pt-2">
                    <label className="block text-sm sm:text-base font-serif font-bold uppercase tracking-wider text-stone-800">
                      Select Institution <span className="text-red-500">*</span>
                    </label>

                    <div className="space-y-3">
                      {/* School 1: Shri Nirakar High School */}
                      <label
                        className={`group relative flex items-center gap-4 px-5 py-4 sm:py-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          institutionCode === 'NIRAKAR_HS'
                            ? 'border-[#111b5e] bg-white shadow-sm ring-1 ring-[#111b5e]'
                            : 'border-stone-200 bg-white/70 hover:bg-white hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="institution"
                          checked={institutionCode === 'NIRAKAR_HS'}
                          onChange={() => {
                            if (institutionCode !== 'NIRAKAR_HS') {
                              setInstitutionCode('NIRAKAR_HS');
                              setStream('');
                              setGradeApplied('Class V');
                            }
                          }}
                          className="sr-only"
                        />
                        {/* Perfectly Centered Vector SVG Radio Indicator */}
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                            <circle
                              cx="10"
                              cy="10"
                              r="8.5"
                              stroke={institutionCode === 'NIRAKAR_HS' ? '#111b5e' : '#cbd5e1'}
                              strokeWidth="2"
                              fill="#ffffff"
                            />
                            {institutionCode === 'NIRAKAR_HS' && (
                              <circle cx="10" cy="10" r="4.5" fill="#111b5e" />
                            )}
                          </svg>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <span className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#111b5e] transition-colors">
                              Shri Nirakar High School
                            </span>
                            <span className="text-xs sm:text-sm font-sans text-stone-500">
                              Mashem, Canacona
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-stone-500 font-sans mt-0.5">
                            Secondary Classes V to X • Goa Board SSC Affiliated
                          </p>
                        </div>
                      </label>

                      {/* School 2: S.S. Angle Higher Secondary */}
                      <label
                        className={`group relative flex items-center gap-4 px-5 py-4 sm:py-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          institutionCode === 'ANGLE_HSS'
                            ? 'border-[#111b5e] bg-white shadow-sm ring-1 ring-[#111b5e]'
                            : 'border-stone-200 bg-white/70 hover:bg-white hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="institution"
                          checked={institutionCode === 'ANGLE_HSS'}
                          onChange={() => {
                            if (institutionCode !== 'ANGLE_HSS') {
                              setInstitutionCode('ANGLE_HSS');
                              setGradeApplied('Class XI');
                              updateHssSelection('SCIENCE', secondLanguage || 'Marathi');
                            }
                          }}
                          className="sr-only"
                        />
                        {/* Perfectly Centered Vector SVG Radio Indicator */}
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                            <circle
                              cx="10"
                              cy="10"
                              r="8.5"
                              stroke={institutionCode === 'ANGLE_HSS' ? '#111b5e' : '#cbd5e1'}
                              strokeWidth="2"
                              fill="#ffffff"
                            />
                            {institutionCode === 'ANGLE_HSS' && (
                              <circle cx="10" cy="10" r="4.5" fill="#111b5e" />
                            )}
                          </svg>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <span className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#111b5e] transition-colors">
                              S.S. Angle Higher Secondary School
                            </span>
                            <span className="text-xs sm:text-sm font-sans text-stone-500">
                              Dapot, Canacona
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-stone-500 font-sans mt-0.5">
                            Higher Secondary Classes XI & XII • Arts, Science & Commerce Streams
                          </p>
                        </div>
                      </label>

                      {/* School 3: Tudal High School */}
                      <label
                        className={`group relative flex items-center gap-4 px-5 py-4 sm:py-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          institutionCode === 'TUDAL_HS'
                            ? 'border-[#111b5e] bg-white shadow-sm ring-1 ring-[#111b5e]'
                            : 'border-stone-200 bg-white/70 hover:bg-white hover:border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="institution"
                          checked={institutionCode === 'TUDAL_HS'}
                          onChange={() => {
                            if (institutionCode !== 'TUDAL_HS') {
                              setInstitutionCode('TUDAL_HS');
                              setStream('');
                              setGradeApplied('Class V');
                            }
                          }}
                          className="sr-only"
                        />
                        {/* Perfectly Centered Vector SVG Radio Indicator */}
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                            <circle
                              cx="10"
                              cy="10"
                              r="8.5"
                              stroke={institutionCode === 'TUDAL_HS' ? '#111b5e' : '#cbd5e1'}
                              strokeWidth="2"
                              fill="#ffffff"
                            />
                            {institutionCode === 'TUDAL_HS' && (
                              <circle cx="10" cy="10" r="4.5" fill="#111b5e" />
                            )}
                          </svg>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <span className="font-serif text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#111b5e] transition-colors">
                              Tudal High School
                            </span>
                            <span className="text-xs sm:text-sm font-sans text-stone-500">
                              Gaondongrem, Canacona
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-stone-500 font-sans mt-0.5">
                            Secondary Classes V to X • Goa Board SSC Affiliated
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Standard / Grade Selection & Academic Stream Options */}
                  {institutionCode === 'ANGLE_HSS' ? (
                    <div className="space-y-6 pt-4 border-t border-stone-200">
                      {/* Standard: Choose either Class XI or Class XII */}
                      <div>
                        <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                          Standard / Class Applied For <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setGradeApplied('Class XI')}
                            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                              gradeApplied === 'Class XI'
                                ? 'border-[#111b5e] bg-[#111b5e]/5 ring-2 ring-[#111b5e] shadow-xs'
                                : 'border-stone-200 bg-white hover:border-stone-300'
                            }`}
                          >
                            <div>
                              <strong
                                className={`block text-base font-serif ${
                                  gradeApplied === 'Class XI' ? 'text-[#111b5e]' : 'text-stone-900'
                                }`}
                              >
                                Class XI
                              </strong>
                              <span className="text-xs text-stone-500 font-sans">
                                First Year Higher Secondary (Fresh Admission)
                              </span>
                            </div>
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                                <circle
                                  cx="10"
                                  cy="10"
                                  r="8.5"
                                  stroke={gradeApplied === 'Class XI' ? '#111b5e' : '#cbd5e1'}
                                  strokeWidth="2"
                                  fill="#ffffff"
                                />
                                {gradeApplied === 'Class XI' && (
                                  <circle cx="10" cy="10" r="4.5" fill="#111b5e" />
                                )}
                              </svg>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setGradeApplied('Class XII')}
                            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                              gradeApplied === 'Class XII'
                                ? 'border-[#111b5e] bg-[#111b5e]/5 ring-2 ring-[#111b5e] shadow-xs'
                                : 'border-stone-200 bg-white hover:border-stone-300'
                            }`}
                          >
                            <div>
                              <strong
                                className={`block text-base font-serif ${
                                  gradeApplied === 'Class XII' ? 'text-[#111b5e]' : 'text-stone-900'
                                }`}
                              >
                                Class XII
                              </strong>
                              <span className="text-xs text-stone-500 font-sans">
                                Second Year Higher Secondary (HSSC Board)
                              </span>
                            </div>
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                                <circle
                                  cx="10"
                                  cy="10"
                                  r="8.5"
                                  stroke={gradeApplied === 'Class XII' ? '#111b5e' : '#cbd5e1'}
                                  strokeWidth="2"
                                  fill="#ffffff"
                                />
                                {gradeApplied === 'Class XII' && (
                                  <circle cx="10" cy="10" r="4.5" fill="#111b5e" />
                                )}
                              </svg>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Academic Stream Choice: Science, Commerce, Arts */}
                      {/* Academic Stream Choice: Science, Commerce, Arts */}
                      <div>
                        <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                          Choose Academic Stream <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            {
                              id: 'SCIENCE' as const,
                              name: 'Science Stream',
                              desc: 'Physics, Chemistry, Maths & Biology (All Compulsory) + English & Second Language',
                            },
                            {
                              id: 'COMMERCE' as const,
                              name: 'Commerce Stream',
                              desc: 'Accountancy, Business Studies, Economics + English & Second Language',
                            },
                            {
                              id: 'ARTS' as const,
                              name: 'Arts Stream',
                              desc: 'History, Political Science, Sociology + English & Second Language',
                            },
                          ].map((st) => {
                            const isSelected = selectedBaseStream === st.id;
                            return (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => updateHssSelection(st.id, secondLanguage || 'Marathi')}
                                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-[#111b5e] bg-[#111b5e]/5 ring-2 ring-[#111b5e] shadow-xs'
                                    : 'border-stone-200 bg-white hover:border-stone-300'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <strong
                                    className={`font-serif text-base ${
                                      isSelected ? 'text-[#111b5e]' : 'text-stone-900'
                                    }`}
                                  >
                                    {st.name}
                                  </strong>
                                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none">
                                      <circle
                                        cx="10"
                                        cy="10"
                                        r="8.5"
                                        stroke={isSelected ? '#111b5e' : '#cbd5e1'}
                                        strokeWidth="2"
                                        fill="#ffffff"
                                      />
                                      {isSelected && (
                                        <circle cx="10" cy="10" r="4.5" fill="#111b5e" />
                                      )}
                                    </svg>
                                  </div>
                                </div>
                                <p className="text-xs text-stone-500 font-sans leading-relaxed">
                                  {st.desc}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Compulsory Second Language Selection (Language II) */}
                      <div>
                        <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                          Compulsory Second Language (Language II) <span className="text-red-500">*</span>
                        </label>
                        <CustomSelect
                          value={secondLanguage}
                          onChange={(val) => updateHssSelection(selectedBaseStream, val)}
                          options={secondLanguageOptions}
                          placeholder="Select Second Language..."
                          className="w-full"
                        />
                        <span className="text-xs text-stone-500 mt-1.5 block font-sans">
                          English is compulsory for all students as Language I. Select your compulsory second language.
                        </span>
                      </div>

                      {/* Official Goa Board HSSC Curriculum Breakdown */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
                          <span className="font-serif font-bold text-sm sm:text-base text-[#111b5e]">
                            S.S. Angle HSS {selectedBaseStream === 'SCIENCE' ? 'Science' : selectedBaseStream === 'COMMERCE' ? 'Commerce' : 'Arts'} Subject Structure
                          </span>
                          <span className="text-xs font-mono text-stone-600 bg-white border border-stone-200 px-2.5 py-0.5 rounded-full font-medium">
                            Goa Board HSSC
                          </span>
                        </div>

                        <div>
                          <span className="text-xs font-serif font-bold text-stone-700 uppercase tracking-wider block mb-2">
                            Compulsory Board Examination Subjects (All 6 Papers are Mandatory):
                          </span>
                          {selectedBaseStream === 'SCIENCE' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm font-sans">
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                1. English <span className="text-stone-400 text-xs block">(Language I • Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-[#111b5e]/40 text-[#111b5e] font-semibold bg-blue-50/30">
                                2. {secondLanguage} <span className="text-stone-500 text-xs block font-normal">(Language II • Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                3. Physics <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                4. Chemistry <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                5. Mathematics <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                6. Biology <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                            </div>
                          ) : selectedBaseStream === 'COMMERCE' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm font-sans">
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                1. English <span className="text-stone-400 text-xs block">(Language I • Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-[#111b5e]/40 text-[#111b5e] font-semibold bg-blue-50/30">
                                2. {secondLanguage} <span className="text-stone-500 text-xs block font-normal">(Language II • Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                3. Accountancy <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                4. Business Studies <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                5. Economics <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                6. Secretarial Practice / Maths <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm font-sans">
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                1. English <span className="text-stone-400 text-xs block">(Language I • Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-[#111b5e]/40 text-[#111b5e] font-semibold bg-blue-50/30">
                                2. {secondLanguage} <span className="text-stone-500 text-xs block font-normal">(Language II • Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                3. History <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                4. Political Science <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                5. Sociology <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                              <div className="bg-white px-3 py-2.5 rounded-lg border border-stone-200 text-stone-800">
                                6. Geography / Economics <span className="text-stone-400 text-xs block">(Compulsory)</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Internal Practical Subject (No External Board Exam) */}
                        <div className="pt-2.5 border-t border-stone-200/80 flex items-start sm:items-center gap-2 text-xs text-stone-600 font-sans">
                          <span className="font-semibold text-stone-800 shrink-0">Internal Subject:</span>
                          <span>Computer is compulsory in the school curriculum and evaluated internally through practicals (there is no external Board written examination for Computer).</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Standard Secondary Classes (V to X) for Nirakar HS and Tudal HS */
                    <div className="pt-4 border-t border-stone-200 max-w-md">
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Standard / Class Applied For <span className="text-red-500">*</span>
                      </label>
                      <CustomSelect
                        value={gradeApplied}
                        onChange={(val) => setGradeApplied(val)}
                        options={secondaryClassOptions}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Candidate Particulars */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
                      Legal Candidate Particulars
                    </h2>
                    <p className="text-sm sm:text-base text-stone-600 mt-1.5 font-sans">
                      Ensure candidate details match the official Birth Certificate and Aadhaar records.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Full Legal Name of Candidate <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Candidate Full Legal Name"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white text-sm sm:text-base font-sans text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                    </div>

                    {/* Date of Birth (Google Calendar Style Material Date Picker) */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <GoogleDatePicker
                        value={dob}
                        onChange={(val) => setDob(val)}
                        placeholder="Select Date of Birth (DD/MM/YYYY)"
                      />
                    </div>

                    {/* Place of Birth */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Place of Birth
                      </label>
                      <input
                        type="text"
                        value={placeOfBirth}
                        onChange={(e) => setPlaceOfBirth(e.target.value)}
                        placeholder="e.g. Canacona, Margao, Goa"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white text-sm sm:text-base font-sans text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                    </div>

                    {/* Gender Dropdown */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <CustomSelect
                        value={gender}
                        onChange={(val) => setGender(val as any)}
                        options={genderOptions}
                        className="w-full"
                      />
                    </div>

                    {/* Aadhaar Number (Strictly 12 digits, non-numeric rejected) */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Aadhaar Number (12 Numeric Digits) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={12}
                        value={aadhaarNumber}
                        onChange={handleAadhaarChange}
                        placeholder="12-digit Aadhaar number"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white font-mono text-sm sm:text-base text-stone-900 tracking-wider shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                      <span className="text-xs text-stone-500 mt-1.5 block font-mono">
                        Numbers only: {aadhaarNumber.length}/12 digits
                      </span>
                    </div>

                    {/* Mother Tongue Dropdown */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Mother Tongue <span className="text-red-500">*</span>
                      </label>
                      <CustomSelect
                        value={motherTongue}
                        onChange={(val) => setMotherTongue(val)}
                        options={motherTongueOptions}
                        className="w-full"
                      />
                    </div>

                    {/* Social Category Dropdown */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Social Category <span className="text-red-500">*</span>
                      </label>
                      <CustomSelect
                        value={category}
                        onChange={(val) => setCategory(val)}
                        options={categoryOptions}
                        className="w-full"
                      />
                    </div>

                    {/* Blood Group */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Blood Group (Optional)
                      </label>
                      <input
                        type="text"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value.toUpperCase().slice(0, 5))}
                        placeholder="e.g. O+, A+, B+"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white font-mono text-sm sm:text-base text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Official Candidate Photograph & Signature Upload (Goa Board / Govt. Standard) */}
                  <div className="pt-6 border-t border-stone-200 space-y-6">
                    {/* Guidance / Instructions Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-950 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={18} className="text-[#111b5e]" />
                          <strong className="font-serif font-bold text-sm sm:text-base text-stone-900">
                            Official Photo & Signature Upload Guidelines (Goa Board / Educational Standards)
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowGuidelines((prev) => !prev)}
                          className="text-xs font-semibold text-[#111b5e] hover:underline cursor-pointer"
                        >
                          {showGuidelines ? 'Hide Details' : 'View Full Specifications'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm font-sans text-stone-700">
                        <div className="bg-white/80 p-3 rounded-xl border border-amber-100 space-y-1">
                          <div className="font-bold text-[#111b5e] flex items-center gap-1.5">
                            <Camera size={14} />
                            <span>1. Passport Photo (20 KB – 50 KB)</span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-xs text-stone-600">
                            <li>Standard 3.5 cm x 4.5 cm passport photograph.</li>
                            <li>Plain white or light-colored background.</li>
                            <li>Strictly NO casual selfies, group photos, hats, or sunglasses.</li>
                            <li>Both ears and face must be clearly visible and centered.</li>
                          </ul>
                        </div>

                        <div className="bg-white/80 p-3 rounded-xl border border-amber-100 space-y-1">
                          <div className="font-bold text-[#111b5e] flex items-center gap-1.5">
                            <PenTool size={14} />
                            <span>2. Candidate / Guardian Signature (10 KB – 50 KB)</span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-xs text-stone-600">
                            <li>Must be signed on clean plain white paper.</li>
                            <li>Strictly in <strong className="text-stone-800">Black or Blue ink ballpoint/gel pen</strong>.</li>
                            <li>No pencil, red ink, ruled notebook lines, or blurry shadows.</li>
                            <li>Crop closely around the signature in horizontal orientation.</li>
                          </ul>
                        </div>
                      </div>

                      {showGuidelines && (
                        <div className="pt-2 border-t border-amber-200/60 text-xs text-stone-600 space-y-1">
                          <p>
                            <strong>Scrutiny Notice:</strong> The uploaded photograph and signature will be permanently embossed on the official School Admission Register, Student Identity Card, and Board Examination Enrolment Records. Submissions with selfies, dark backgrounds, or unverified ink will be flagged for resubmission during school office physical verification.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Upload Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Photo Upload Card */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <label className="block text-sm sm:text-base font-serif font-bold text-stone-900">
                              Candidate Passport Photo <span className="text-red-500">*</span>
                            </label>
                            <span className="text-xs text-stone-500 font-sans block mt-0.5">
                              3.5 × 4.5 cm portrait • Light/white background • Strictly 20 KB – 50 KB
                            </span>
                          </div>
                          {photoData && photoSizeKb >= 20 && photoSizeKb <= 50 && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold whitespace-nowrap shadow-2xs shrink-0 self-start sm:self-auto">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{photoSizeKb} KB • Compliant</span>
                            </div>
                          )}
                        </div>

                        {photoData ? (
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-stone-50/80 border border-stone-200/90">
                            {/* Passport Photo Frame */}
                            <div className="relative w-28 h-36 shrink-0 rounded-lg overflow-hidden border-2 border-[#111b5e]/40 shadow-xs bg-white flex flex-col">
                              <img
                                src={photoData}
                                alt="Candidate Passport"
                                className="w-full h-full object-cover flex-1"
                              />
                              <span className="bg-[#111b5e] text-white text-[9px] font-mono text-center py-0.5 font-bold tracking-wider">
                                3.5 × 4.5 CM
                              </span>
                            </div>

                            {/* Structured Specification Sheet */}
                            <div className="flex-1 min-w-0 space-y-2.5 w-full">
                              {/* File Info Bar */}
                              <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileCheck size={14} className="text-[#111b5e] shrink-0" />
                                  <span className="font-mono text-xs font-medium text-stone-800 truncate" title={photoName}>
                                    {photoName || 'passport_photo.jpg'}
                                  </span>
                                </div>
                                <span className="font-mono text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 shrink-0 shadow-2xs">
                                  {photoSizeKb} KB
                                </span>
                              </div>

                              {/* Spec Badges Grid */}
                              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/70 shadow-2xs">
                                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Proportions</span>
                                  <span className="text-stone-800 font-mono text-[11px] font-medium">3.5 × 4.5 cm (Portrait)</span>
                                </div>
                                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/70 shadow-2xs">
                                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Background</span>
                                  <span className="text-emerald-700 font-sans text-[11px] font-semibold flex items-center gap-1">
                                    <Check size={12} className="shrink-0" /> White / Light Pass
                                  </span>
                                </div>
                              </div>

                              {/* Verification Status Pill */}
                              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 font-sans">
                                <span className="flex items-center gap-1.5 font-medium truncate">
                                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                  <span className="truncate">{photoSuccessMsg || 'Meets 20–50 KB Board Standard'}</span>
                                </span>
                                <span className="text-[10px] font-mono text-emerald-700 font-bold shrink-0 ml-2">20–50 KB</span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2.5 pt-1">
                                <button
                                  type="button"
                                  disabled={isOptimizingPhoto}
                                  onClick={() => {
                                    setIsOptimizingPhoto(true);
                                    setPhotoError(null);
                                    optimizePhotoToTargetRange(
                                      photoData,
                                      (optUrl, optSize, dimStr) => {
                                        setIsOptimizingPhoto(false);
                                        setPhotoData(optUrl);
                                        setPhotoSizeKb(optSize);
                                        setPhotoSuccessMsg(`Calibrated to ${optSize} KB (${dimStr})`);
                                      },
                                      (err) => {
                                        setIsOptimizingPhoto(false);
                                        setPhotoError(err);
                                      }
                                    );
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111b5e] hover:bg-[#0b132b] text-white font-serif text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                  title="Recalibrate image resolution and JPEG quality into 25–45 KB target range"
                                >
                                  {isOptimizingPhoto ? (
                                    <>
                                      <RefreshCw size={12} className="animate-spin" />
                                      <span>Calibrating...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles size={12} />
                                      <span>Auto-Fit (20–50 KB)</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPhotoData('');
                                    setPhotoName('');
                                    setPhotoSizeKb(0);
                                    setPhotoError(null);
                                    setPhotoSuccessMsg(null);
                                    setPhotoMetrics(null);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 text-xs font-sans font-medium transition-colors cursor-pointer"
                                >
                                  <X size={13} />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-dashed border-stone-300 hover:border-[#111b5e] bg-stone-50/60 hover:bg-white transition-all cursor-pointer text-center group">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#111b5e] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                              <Camera size={22} />
                            </div>
                            <span className="text-sm font-semibold text-stone-800 block mb-0.5">
                              Upload Candidate Passport Photograph
                            </span>
                            <span className="text-xs text-stone-500 font-sans block max-w-xs">
                              Click or drag file here. Formal plain white/light background, strictly 20 KB to 50 KB.
                            </span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={handlePhotoUpload}
                              className="sr-only"
                            />
                          </label>
                        )}

                        {photoError && (
                          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-sans flex items-start gap-2.5">
                            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                            <div className="space-y-1">
                              <strong className="block font-semibold text-red-800">Verification Rejected:</strong>
                              <p className="leading-relaxed">{photoError}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Signature Upload Card */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <label className="block text-sm sm:text-base font-serif font-bold text-stone-900">
                              Candidate / Guardian Signature <span className="text-red-500">*</span>
                            </label>
                            <span className="text-xs text-stone-500 font-sans block mt-0.5">
                              Horizontal on white paper • Black or Blue ink • Strictly 10 KB – 50 KB
                            </span>
                          </div>
                          {signatureData && signatureSizeKb >= 10 && signatureSizeKb <= 50 && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold whitespace-nowrap shadow-2xs shrink-0 self-start sm:self-auto">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{signatureSizeKb} KB • {sigInkType} Ink</span>
                            </div>
                          )}
                        </div>

                        {signatureData ? (
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-stone-50/80 border border-stone-200/90">
                            {/* Signature Frame */}
                            <div className="relative w-44 h-28 shrink-0 rounded-lg overflow-hidden border-2 border-[#111b5e]/40 shadow-xs bg-white flex flex-col">
                              <div className="flex-1 w-full flex items-center justify-center p-2 bg-white">
                                <img
                                  src={signatureData}
                                  alt="Candidate Signature"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="bg-[#111b5e] text-white text-[9px] font-mono text-center py-0.5 font-bold tracking-wider">
                                VERIFIED SIGNATURE
                              </span>
                            </div>

                            {/* Structured Specification Sheet */}
                            <div className="flex-1 min-w-0 space-y-2.5 w-full">
                              {/* File Info Bar */}
                              <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                                <div className="flex items-center gap-2 min-w-0">
                                  <PenTool size={14} className="text-[#111b5e] shrink-0" />
                                  <span className="font-mono text-xs font-medium text-stone-800 truncate" title={signatureName}>
                                    {signatureName || 'candidate_signature.png'}
                                  </span>
                                </div>
                                <span className="font-mono text-xs font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 shrink-0 shadow-2xs">
                                  {signatureSizeKb} KB
                                </span>
                              </div>

                              {/* Spec Badges Grid */}
                              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/70 shadow-2xs">
                                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Orientation</span>
                                  <span className="text-stone-800 font-mono text-[11px] font-medium">Horizontal Landscape</span>
                                </div>
                                <div className="bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/70 shadow-2xs">
                                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">Ink Stroke</span>
                                  <span className="text-stone-800 font-sans text-[11px] font-semibold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                                    {sigInkType === 'BLUE' ? 'Blue Pen' : sigInkType === 'BLACK' ? 'Black Pen' : 'Ballpoint Pen'}
                                  </span>
                                </div>
                              </div>

                              {/* Verification Status Pill */}
                              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 font-sans">
                                <span className="flex items-center gap-1.5 font-medium truncate">
                                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                  <span className="truncate">{sigSuccessMsg || 'Cleaned on Plain White Paper'}</span>
                                </span>
                                <span className="text-[10px] font-mono text-emerald-700 font-bold shrink-0 ml-2">10–50 KB</span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2.5 pt-1">
                                <button
                                  type="button"
                                  disabled={isOptimizingSig}
                                  onClick={() => {
                                    setIsOptimizingSig(true);
                                    setSigError(null);
                                    optimizeSignatureToTargetRange(
                                      signatureData,
                                      (optUrl, optSize, inkType) => {
                                        setIsOptimizingSig(false);
                                        setSignatureData(optUrl);
                                        setSignatureSizeKb(optSize);
                                        setSigInkType(inkType);
                                        setSigSuccessMsg(`Cleaned & Calibrated (${inkType} Ink)`);
                                      },
                                      (err) => {
                                        setIsOptimizingSig(false);
                                        setSigError(err);
                                      }
                                    );
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111b5e] hover:bg-[#0b132b] text-white font-serif text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                  title="Enhance black/blue ink contrast and normalize white paper background"
                                >
                                  {isOptimizingSig ? (
                                    <>
                                      <RefreshCw size={12} className="animate-spin" />
                                      <span>Cleaning...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles size={12} />
                                      <span>Auto-Clean Signature</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSignatureData('');
                                    setSignatureName('');
                                    setSignatureSizeKb(0);
                                    setSigError(null);
                                    setSigSuccessMsg(null);
                                    setSigMetrics(null);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 text-xs font-sans font-medium transition-colors cursor-pointer"
                                >
                                  <X size={13} />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-dashed border-stone-300 hover:border-[#111b5e] bg-stone-50/60 hover:bg-white transition-all cursor-pointer text-center group">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#111b5e] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                              <PenTool size={22} />
                            </div>
                            <span className="text-sm font-semibold text-stone-800 block mb-0.5">
                              Upload Signature (Black or Blue Ink)
                            </span>
                            <span className="text-xs text-stone-500 font-sans block max-w-xs">
                              Sign on plain white paper. Strictly 10 KB to 50 KB.
                            </span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={handleSignatureUpload}
                              className="sr-only"
                            />
                          </label>
                        )}

                        {sigError && (
                          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-sans flex items-start gap-2.5">
                            <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-700" />
                            <div className="space-y-1">
                              <strong className="block font-semibold text-amber-900">Verification Notice:</strong>
                              <p className="leading-relaxed">{sigError}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Parent / Guardian Particulars */}
              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
                      Parent & Guardian Records
                    </h2>
                    <p className="text-sm sm:text-base text-stone-600 mt-1.5 font-sans">
                      Primary contact coordinates for official circulars and academic correspondence.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {/* Father's Name */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Father's Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        placeholder="Father's Legal Name"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white text-sm sm:text-base font-sans text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                    </div>

                    {/* Father's Occupation */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Father's Occupation
                      </label>
                      <input
                        type="text"
                        value={fatherOccupation}
                        onChange={(e) => setFatherOccupation(e.target.value)}
                        placeholder="e.g. Agriculture / Business / Service"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white text-sm sm:text-base font-sans text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                    </div>

                    {/* Mother's Name */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Mother's Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={motherName}
                        onChange={(e) => setMotherName(e.target.value)}
                        placeholder="Mother's Legal Name"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white text-sm sm:text-base font-sans text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                    </div>

                    {/* Mother's Occupation */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Mother's Occupation
                      </label>
                      <input
                        type="text"
                        value={motherOccupation}
                        onChange={(e) => setMotherOccupation(e.target.value)}
                        placeholder="e.g. Homemaker / Service"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white text-sm sm:text-base font-sans text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                    </div>

                    {/* Primary Mobile (Strictly 10 digits starting with 6-9) */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Primary Mobile Phone (10 Digits) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-stone-300 bg-stone-100 text-stone-700 font-mono text-sm sm:text-base font-medium">
                          +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          value={primaryPhone}
                          onChange={handlePhoneChange}
                          placeholder="9822XXXXXX"
                          className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-r-xl border border-stone-300 bg-white font-mono text-sm sm:text-base text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                        />
                      </div>
                      <span className="text-xs text-stone-500 mt-1.5 block font-mono">
                        Numbers only: {primaryPhone.length}/10 digits
                      </span>
                    </div>

                    {/* Alternate Contact Number (Optional) */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Alternate Contact Number (Optional)
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-stone-300 bg-stone-100 text-stone-700 font-mono text-sm sm:text-base font-medium">
                          +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          value={alternatePhone}
                          onChange={handleAltPhoneChange}
                          placeholder="Optional second phone"
                          className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-r-xl border border-stone-300 bg-white font-mono text-sm sm:text-base text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                        />
                      </div>
                      <span className="text-xs text-stone-500 mt-1.5 block font-mono">
                        Optional: {alternatePhone.length}/10 digits
                      </span>
                    </div>

                    {/* Official Email */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Official Correspondence Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="parent.email@example.com"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white text-sm sm:text-base font-sans text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Address & Prior School Record */}
              {step === 4 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
                      Residential Address & Prior School Record
                    </h2>
                    <p className="text-sm sm:text-base text-stone-600 mt-1.5 font-sans">
                      Residential address within Canacona or neighboring areas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {/* Full Street Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        House / Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House No., Ward / Vaddem / Street"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white text-sm sm:text-base font-sans text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                    </div>

                    {/* Village */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Village / Town <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        placeholder="e.g. Mashem, Loliem, Poinguinim"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white text-sm sm:text-base font-sans text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                    </div>

                    {/* Postal PIN Code (Strictly 6 numeric digits) */}
                    <div>
                      <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                        Postal PIN Code (6 Digits) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="403728"
                        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white font-mono text-sm sm:text-base text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                      />
                      <span className="text-xs text-stone-500 mt-1.5 block font-mono">
                        Numbers only: {pincode.length}/6 digits
                      </span>
                    </div>

                    {/* Prior School Record */}
                    <div className="sm:col-span-2 pt-4 border-t border-stone-200">
                      <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 mb-4">
                        Prior Academic Record
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="sm:col-span-2">
                          <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                            Name of Last School Attended
                          </label>
                          <input
                            type="text"
                            value={previousSchool}
                            onChange={(e) => setPreviousSchool(e.target.value)}
                            placeholder="e.g. Shri Nirakar Vidyalaya Mashem, Canacona - Goa"
                            className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white text-sm sm:text-base font-sans text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                            Last Class Passed
                          </label>
                          <input
                            type="text"
                            value={previousClass}
                            onChange={(e) => setPreviousClass(e.target.value)}
                            placeholder={inferPreviousClass(gradeApplied) || 'e.g. Class IV'}
                            className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white text-sm sm:text-base font-sans text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                          />
                          <span className="text-[11px] text-stone-500 mt-1 block font-sans">
                            Auto: {inferPreviousClass(gradeApplied) || 'Optional'}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm sm:text-base font-serif font-bold text-stone-800 mb-2">
                            Percentage / Score (%)
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={previousPercentage}
                            onChange={handlePercentageChange}
                            placeholder="e.g. 75.5"
                            className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl border border-stone-300 bg-white font-mono text-sm sm:text-base text-stone-900 shadow-xs focus:outline-none focus:border-[#111b5e] focus:ring-2 focus:ring-[#111b5e]/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Verification & Legal Declaration */}
              {step === 5 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
                      Security Verification & Confirmation
                    </h2>
                    <p className="text-sm sm:text-base text-stone-600 mt-1.5 font-sans">
                      Complete the verification challenge and confirm the accuracy of the provided particulars.
                    </p>
                  </div>

                  {/* Summary Check Grid (Direct Page Flow, No Boxes) */}
                  <div className="border-y border-stone-200 py-5 text-sm sm:text-base space-y-3">
                    <div className="flex justify-between py-1.5">
                      <span className="text-stone-500">Applicant Full Legal Name:</span>
                      <strong className="text-stone-900 font-semibold">{studentName}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-t border-stone-100">
                      <span className="text-stone-500">Date of Birth:</span>
                      <strong className="text-stone-900 font-semibold">{dob || 'Not specified'}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-t border-stone-100">
                      <span className="text-stone-500">Selected Institution:</span>
                      <strong className="text-[#111b5e] font-semibold">
                        {institutionCode === 'NIRAKAR_HS'
                          ? 'Shri Nirakar High School (Mashem)'
                          : institutionCode === 'ANGLE_HSS'
                          ? `S.S. Angle Higher Secondary School, Dapot (${stream})`
                          : 'Tudal High School (Gaondongrem)'}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-t border-stone-100">
                      <span className="text-stone-500">Standard / Class Applied For:</span>
                      <strong className="text-stone-900 font-semibold">{gradeApplied}</strong>
                    </div>
                    {placeOfBirth && (
                      <div className="flex justify-between py-1.5 border-t border-stone-100">
                        <span className="text-stone-500">Place of Birth:</span>
                        <strong className="text-stone-900 font-semibold">{placeOfBirth}</strong>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 border-t border-stone-100">
                      <span className="text-stone-500">Parent / Guardian Contact:</span>
                      <span className="font-mono font-bold text-stone-900">
                        +91 {primaryPhone}
                        {alternatePhone ? ` (Alt: +91 ${alternatePhone})` : ''}
                      </span>
                    </div>
                    {photoData && (
                      <div className="flex justify-between items-center py-2 border-t border-stone-100">
                        <span className="text-stone-500">Candidate Passport Photo:</span>
                        <div className="flex items-center gap-3">
                          <img
                            src={photoData}
                            alt="Candidate"
                            className="w-12 h-16 object-cover rounded-md border border-stone-300 shadow-2xs"
                          />
                          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {photoSizeKb} KB • Verified (20–50 KB)
                          </span>
                        </div>
                      </div>
                    )}
                    {signatureData && (
                      <div className="flex justify-between items-center py-2 border-t border-stone-100">
                        <span className="text-stone-500">Candidate / Guardian Signature:</span>
                        <div className="flex items-center gap-3">
                          <img
                            src={signatureData}
                            alt="Signature"
                            className="h-10 max-w-[140px] object-contain bg-white px-2 py-1 rounded-md border border-stone-300 shadow-2xs"
                          />
                          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {signatureSizeKb} KB • {sigInkType} Ink
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clean Authentic reCAPTCHA Widget */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-sm sm:text-base font-serif font-bold text-stone-800">
                      Human Verification <span className="text-red-500">*</span>
                    </label>
                    <HumanVerificationCaptcha
                      onVerify={(t) => {
                        setCaptchaToken(t);
                        setErrorMessage(null);
                      }}
                      isVerified={Boolean(captchaToken)}
                    />
                  </div>

                  {/* Legal Declaration Checkbox (Direct Page Flow, No Boxes) */}
                  <div className="pt-3">
                    <label className="flex items-start gap-4 py-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declarationAccepted}
                        onChange={(e) => setDeclarationAccepted(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded text-[#111b5e] focus:ring-[#111b5e]"
                      />
                      <span className="text-sm sm:text-base text-stone-800 leading-relaxed font-sans">
                        I hereby declare that the particulars provided in this admission application are true and correct to the best of my knowledge. I agree to abide by the rules of Shri Nirakar Education Society and present original documentation upon request. <span className="text-red-500">*</span>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-8 sm:pt-10 border-t border-stone-200 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setStep(step - 1);
                      window.scrollTo({ top: 200, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border border-stone-300 text-sm sm:text-base font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    <span>Previous Step</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2.5 bg-[#111b5e] hover:bg-[#0b132b] text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-serif text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <span>Proceed to Step {step + 1}</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="inline-flex items-center gap-2.5 bg-[#111b5e] hover:bg-[#0b132b] text-white px-8 sm:px-12 py-4 rounded-xl font-serif text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>Submit Admission Application</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdmissionsPage;
