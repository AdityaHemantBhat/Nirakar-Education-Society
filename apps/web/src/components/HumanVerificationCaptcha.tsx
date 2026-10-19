import React, { useState, useEffect, useRef } from 'react';
import { Check, RotateCw, Headphones, Info, X, Volume2, ArrowLeft } from 'lucide-react';

interface CaptchaProps {
  onVerify: (token: string) => void;
  isVerified: boolean;
}

interface ChallengeTile {
  id: number;
  label: string;
  renderSvg: () => React.ReactNode;
}

interface ChallengeDefinition {
  id: string;
  subject: string;
  instruction: string;
  correctIndices: number[];
  tiles: ChallengeTile[];
}

// Visual Challenge 1: Traffic Lights
const TRAFFIC_LIGHTS_CHALLENGE: ChallengeDefinition = {
  id: 'traffic_lights',
  subject: 'traffic lights',
  instruction: 'Click verify once there are none left.',
  correctIndices: [0, 3, 6],
  tiles: [
    // 0: MATCH - Street intersection with 3-lens vertical traffic signal
    {
      id: 0,
      label: 'Traffic signal at crossroad',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="60" fill="#93c5fd" />
          <rect y="60" width="100" height="40" fill="#475569" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#facc15" strokeWidth="2" strokeDasharray="6 4" />
          {/* Traffic Signal Post */}
          <rect x="42" y="25" width="6" height="55" fill="#334155" />
          <rect x="36" y="8" width="18" height="38" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          {/* Signal Hoods & Lenses */}
          <circle cx="45" cy="15" r="4.5" fill="#ef4444" />
          <circle cx="45" cy="26" r="4.5" fill="#f59e0b" />
          <circle cx="45" cy="37" r="4.5" fill="#22c55e" className="animate-pulse" />
        </svg>
      ),
    },
    // 1: No match - Office building facade
    {
      id: 1,
      label: 'Office building window facade',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#cbd5e1" />
          <rect x="10" y="10" width="22" height="35" fill="#64748b" />
          <rect x="39" y="10" width="22" height="35" fill="#64748b" />
          <rect x="68" y="10" width="22" height="35" fill="#64748b" />
          <rect x="10" y="55" width="22" height="35" fill="#64748b" />
          <rect x="39" y="55" width="22" height="35" fill="#64748b" />
          <rect x="68" y="55" width="22" height="35" fill="#64748b" />
        </svg>
      ),
    },
    // 2: No match - Road with trees
    {
      id: 2,
      label: 'Roadside trees and hedge',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="60" fill="#bae6fd" />
          <rect y="60" width="100" height="40" fill="#64748b" />
          <circle cx="30" cy="40" r="22" fill="#15803d" />
          <circle cx="65" cy="35" r="26" fill="#166534" />
          <rect x="27" y="50" width="6" height="20" fill="#78350f" />
          <rect x="62" y="45" width="7" height="25" fill="#78350f" />
        </svg>
      ),
    },
    // 3: MATCH - Cantilevered overhead traffic signal
    {
      id: 3,
      label: 'Overhead traffic signal on gantry arm',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="65" fill="#7dd3fc" />
          <rect y="65" width="100" height="35" fill="#334155" />
          {/* Overhead Horizontal Arm */}
          <rect x="0" y="15" width="85" height="4" fill="#1e293b" />
          <rect x="80" y="15" width="5" height="70" fill="#1e293b" />
          {/* Signal box hanging */}
          <rect x="30" y="19" width="30" height="14" rx="2" fill="#0f172a" />
          <circle cx="37" cy="26" r="3.5" fill="#ef4444" />
          <circle cx="45" cy="26" r="3.5" fill="#f59e0b" />
          <circle cx="53" cy="26" r="3.5" fill="#22c55e" />
        </svg>
      ),
    },
    // 4: No match - Asphalt road with yellow lines
    {
      id: 4,
      label: 'Asphalt roadway',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#334155" />
          <line x1="48" y1="0" x2="48" y2="100" stroke="#facc15" strokeWidth="2.5" />
          <line x1="53" y1="0" x2="53" y2="100" stroke="#facc15" strokeWidth="2.5" />
        </svg>
      ),
    },
    // 5: No match - Park bench
    {
      id: 5,
      label: 'Park bench on sidewalk',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="70" fill="#e2e8f0" />
          <rect y="70" width="100" height="30" fill="#94a3b8" />
          <rect x="25" y="55" width="50" height="6" rx="1" fill="#78350f" />
          <rect x="25" y="45" width="50" height="6" rx="1" fill="#78350f" />
          <rect x="30" y="55" width="4" height="25" fill="#1e293b" />
          <rect x="66" y="55" width="4" height="25" fill="#1e293b" />
        </svg>
      ),
    },
    // 6: MATCH - Pedestrian crossing signal
    {
      id: 6,
      label: 'Pedestrian crossing traffic signal',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="55" fill="#bae6fd" />
          <rect y="55" width="100" height="45" fill="#475569" />
          <rect x="47" y="30" width="6" height="50" fill="#1e293b" />
          <rect x="42" y="14" width="16" height="26" rx="2" fill="#0f172a" />
          {/* Red stop hand & green walk figure */}
          <rect x="46" y="18" width="8" height="8" rx="1" fill="#ef4444" />
          <circle cx="50" cy="30" r="2.5" fill="#22c55e" />
          <line x1="50" y1="32" x2="50" y2="37" stroke="#22c55e" strokeWidth="1.5" />
        </svg>
      ),
    },
    // 7: No match - Parked silver sedan car
    {
      id: 7,
      label: 'Parked car at curb',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="50" fill="#e0f2fe" />
          <rect y="50" width="100" height="50" fill="#64748b" />
          <path d="M20 62 L30 45 L70 45 L80 62 Z" fill="#94a3b8" />
          <rect x="15" y="60" width="70" height="15" rx="3" fill="#cbd5e1" />
          <circle cx="30" cy="75" r="7" fill="#1e293b" />
          <circle cx="70" cy="75" r="7" fill="#1e293b" />
        </svg>
      ),
    },
    // 8: No match - Lamp post without traffic light
    {
      id: 8,
      label: 'Street lamp post',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="70" fill="#93c5fd" />
          <rect y="70" width="100" height="30" fill="#475569" />
          <rect x="48" y="20" width="4" height="60" fill="#1e293b" />
          <path d="M42 20 Q50 10 58 20 Z" fill="#334155" />
          <circle cx="50" cy="22" r="4" fill="#fef08a" />
        </svg>
      ),
    },
  ],
};

// Visual Challenge 2: Crosswalks
const CROSSWALKS_CHALLENGE: ChallengeDefinition = {
  id: 'crosswalks',
  subject: 'crosswalks',
  instruction: 'Click verify once there are none left.',
  correctIndices: [1, 3, 5, 7],
  tiles: [
    // 0: No match - Plain sidewalk
    {
      id: 0,
      label: 'Concrete sidewalk',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#cbd5e1" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#94a3b8" strokeWidth="2" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#94a3b8" strokeWidth="2" />
        </svg>
      ),
    },
    // 1: MATCH - White zebra crossing stripes
    {
      id: 1,
      label: 'Zebra pedestrian crossing lines',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#334155" />
          <rect x="10" y="10" width="80" height="12" fill="#ffffff" rx="1" />
          <rect x="10" y="32" width="80" height="12" fill="#ffffff" rx="1" />
          <rect x="10" y="54" width="80" height="12" fill="#ffffff" rx="1" />
          <rect x="10" y="76" width="80" height="12" fill="#ffffff" rx="1" />
        </svg>
      ),
    },
    // 2: No match - Red car stopped at curb
    {
      id: 2,
      label: 'Car stopped at curb',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#475569" />
          <rect x="20" y="30" width="60" height="45" rx="8" fill="#dc2626" />
          <circle cx="35" cy="75" r="6" fill="#0f172a" />
          <circle cx="65" cy="75" r="6" fill="#0f172a" />
          <rect x="30" y="40" width="40" height="16" rx="2" fill="#93c5fd" />
        </svg>
      ),
    },
    // 3: MATCH - Pedestrian crossing stripes with curb
    {
      id: 3,
      label: 'Pedestrian crossing leading to curb',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="30" fill="#94a3b8" />
          <rect y="30" width="100" height="70" fill="#1e293b" />
          <rect x="15" y="40" width="12" height="50" fill="#ffffff" />
          <rect x="37" y="40" width="12" height="50" fill="#ffffff" />
          <rect x="59" y="40" width="12" height="50" fill="#ffffff" />
          <rect x="81" y="40" width="12" height="50" fill="#ffffff" />
        </svg>
      ),
    },
    // 4: No match - Plain road with dashed lines
    {
      id: 4,
      label: 'Empty lane markings',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#334155" />
          <line x1="50" y1="5" x2="50" y2="35" stroke="#facc15" strokeWidth="4" />
          <line x1="50" y1="55" x2="50" y2="85" stroke="#facc15" strokeWidth="4" />
        </svg>
      ),
    },
    // 5: MATCH - Angled crosswalk markings
    {
      id: 5,
      label: 'Intersection angled crosswalk',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#1e293b" />
          <polygon points="10,20 30,15 45,85 25,90" fill="#ffffff" />
          <polygon points="40,15 60,10 75,80 55,85" fill="#ffffff" />
          <polygon points="70,10 90,5 105,75 85,80" fill="#ffffff" />
        </svg>
      ),
    },
    // 6: No match - Hedge along road
    {
      id: 6,
      label: 'Roadside hedge',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="60" fill="#86efac" />
          <rect y="60" width="100" height="40" fill="#475569" />
          <circle cx="20" cy="50" r="18" fill="#15803d" />
          <circle cx="50" cy="48" r="20" fill="#166534" />
          <circle cx="80" cy="52" r="18" fill="#15803d" />
        </svg>
      ),
    },
    // 7: MATCH - School zone crosswalk
    {
      id: 7,
      label: 'School zone crosswalk lines',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#334155" />
          <rect x="5" y="15" width="90" height="14" fill="#ffffff" />
          <rect x="5" y="42" width="90" height="14" fill="#ffffff" />
          <rect x="5" y="69" width="90" height="14" fill="#ffffff" />
        </svg>
      ),
    },
    // 8: No match - Driveway ramp
    {
      id: 8,
      label: 'Driveway ramp',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="40" fill="#64748b" />
          <rect y="40" width="100" height="60" fill="#94a3b8" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="#cbd5e1" strokeWidth="4" />
        </svg>
      ),
    },
  ],
};

// Visual Challenge 3: Bicycles
const BICYCLES_CHALLENGE: ChallengeDefinition = {
  id: 'bicycles',
  subject: 'bicycles',
  instruction: 'Click verify once there are none left.',
  correctIndices: [0, 2, 5, 8],
  tiles: [
    // 0: MATCH - Blue road bicycle
    {
      id: 0,
      label: 'Blue road bicycle',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="70" fill="#e2e8f0" />
          <rect y="70" width="100" height="30" fill="#64748b" />
          {/* Wheels */}
          <circle cx="28" cy="68" r="14" fill="none" stroke="#1e293b" strokeWidth="2.5" />
          <circle cx="72" cy="68" r="14" fill="none" stroke="#1e293b" strokeWidth="2.5" />
          {/* Frame */}
          <line x1="28" y1="68" x2="50" y2="68" stroke="#2563eb" strokeWidth="2.5" />
          <line x1="28" y1="68" x2="45" y2="48" stroke="#2563eb" strokeWidth="2.5" />
          <line x1="50" y1="68" x2="45" y2="48" stroke="#2563eb" strokeWidth="2.5" />
          <line x1="50" y1="68" x2="68" y2="48" stroke="#2563eb" strokeWidth="2.5" />
          <line x1="45" y1="48" x2="68" y2="48" stroke="#2563eb" strokeWidth="2.5" />
          <line x1="72" y1="68" x2="68" y2="44" stroke="#2563eb" strokeWidth="2.5" />
          {/* Seat & Handlebars */}
          <line x1="43" y1="46" x2="48" y2="46" stroke="#78350f" strokeWidth="3" />
          <line x1="66" y1="43" x2="72" y2="43" stroke="#1e293b" strokeWidth="2.5" />
        </svg>
      ),
    },
    // 1: No match - Fire hydrant and curb
    {
      id: 1,
      label: 'Sidewalk with trash bin',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="60" fill="#93c5fd" />
          <rect y="60" width="100" height="40" fill="#94a3b8" />
          <rect x="40" y="38" width="20" height="32" rx="2" fill="#15803d" />
        </svg>
      ),
    },
    // 2: MATCH - Mountain bike
    {
      id: 2,
      label: 'Mountain bicycle with thick tires',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="65" fill="#f8fafc" />
          <rect y="65" width="100" height="35" fill="#475569" />
          <circle cx="26" cy="65" r="15" fill="none" stroke="#0f172a" strokeWidth="3.5" />
          <circle cx="74" cy="65" r="15" fill="none" stroke="#0f172a" strokeWidth="3.5" />
          <polygon points="26,65 48,65 44,45" fill="none" stroke="#dc2626" strokeWidth="3" />
          <polygon points="48,65 70,45 44,45" fill="none" stroke="#dc2626" strokeWidth="3" />
          <line x1="74" y1="65" x2="70" y2="42" stroke="#dc2626" strokeWidth="3" />
          <line x1="68" y1="41" x2="74" y2="41" stroke="#0f172a" strokeWidth="2.5" />
        </svg>
      ),
    },
    // 3: No match - Road center
    {
      id: 3,
      label: 'Empty roadway lane',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#334155" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#facc15" strokeWidth="3" strokeDasharray="8 6" />
        </svg>
      ),
    },
    // 4: No match - Motor scooter
    {
      id: 4,
      label: 'Motor scooter',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="70" fill="#e0f2fe" />
          <rect y="70" width="100" height="30" fill="#475569" />
          <circle cx="30" cy="72" r="9" fill="#0f172a" />
          <circle cx="70" cy="72" r="9" fill="#0f172a" />
          <path d="M25 68 L45 68 L55 50 L68 50 L70 70 Z" fill="#475569" />
          <rect x="52" y="44" width="12" height="16" fill="#eab308" />
        </svg>
      ),
    },
    // 5: MATCH - Vintage bicycle with basket
    {
      id: 5,
      label: 'City bicycle with front basket',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="65" fill="#fef3c7" />
          <rect y="65" width="100" height="35" fill="#475569" />
          <circle cx="28" cy="65" r="14" fill="none" stroke="#334155" strokeWidth="2" />
          <circle cx="72" cy="65" r="14" fill="none" stroke="#334155" strokeWidth="2" />
          <line x1="28" y1="65" x2="48" y2="65" stroke="#059669" strokeWidth="2" />
          <line x1="28" y1="65" x2="45" y2="48" stroke="#059669" strokeWidth="2" />
          <line x1="48" y1="65" x2="68" y2="48" stroke="#059669" strokeWidth="2" />
          <line x1="72" y1="65" x2="68" y2="45" stroke="#059669" strokeWidth="2" />
          {/* Front Basket */}
          <rect x="68" y="42" width="10" height="8" fill="#d97706" rx="1" />
        </svg>
      ),
    },
    // 6: No match - Park bench
    {
      id: 6,
      label: 'Wooden park bench',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="60" fill="#dcfce7" />
          <rect y="60" width="100" height="40" fill="#94a3b8" />
          <rect x="25" y="48" width="50" height="6" fill="#78350f" />
          <rect x="30" y="54" width="4" height="20" fill="#1e293b" />
          <rect x="66" y="54" width="4" height="20" fill="#1e293b" />
        </svg>
      ),
    },
    // 7: No match - Silver car
    {
      id: 7,
      label: 'Silver sedan automobile',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="60" fill="#f1f5f9" />
          <rect y="60" width="100" height="40" fill="#334155" />
          <path d="M20 58 Q35 42 50 42 Q65 42 80 58 Z" fill="#94a3b8" />
          <circle cx="32" cy="68" r="6" fill="#0f172a" />
          <circle cx="68" cy="68" r="6" fill="#0f172a" />
        </svg>
      ),
    },
    // 8: MATCH - Yellow sport bicycle
    {
      id: 8,
      label: 'Yellow sport bicycle',
      renderSvg: () => (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="65" fill="#f8fafc" />
          <rect y="65" width="100" height="35" fill="#475569" />
          <circle cx="28" cy="65" r="14" fill="none" stroke="#1e293b" strokeWidth="2.5" />
          <circle cx="72" cy="65" r="14" fill="none" stroke="#1e293b" strokeWidth="2.5" />
          <polygon points="28,65 48,65 45,46" fill="none" stroke="#eab308" strokeWidth="2.5" />
          <polygon points="48,65 68,46 45,46" fill="none" stroke="#eab308" strokeWidth="2.5" />
          <line x1="72" y1="65" x2="68" y2="42" stroke="#eab308" strokeWidth="2.5" />
        </svg>
      ),
    },
  ],
};

const CHALLENGE_PRESETS: ChallengeDefinition[] = [
  TRAFFIC_LIGHTS_CHALLENGE,
  CROSSWALKS_CHALLENGE,
  BICYCLES_CHALLENGE,
];

export const HumanVerificationCaptcha: React.FC<CaptchaProps> = ({ onVerify, isVerified }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showChallenge, setShowChallenge] = useState<boolean>(false);
  const [challengeIndex, setChallengeIndex] = useState<number>(0);
  const [selectedTiles, setSelectedTiles] = useState<Set<number>>(new Set());
  const [verifying, setVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio challenge alternative mode
  const [isAudioMode, setIsAudioMode] = useState<boolean>(false);
  const [audioCode, setAudioCode] = useState<string>('7419');
  const [audioInput, setAudioInput] = useState<string>('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const currentChallenge = CHALLENGE_PRESETS[challengeIndex % CHALLENGE_PRESETS.length];

  // Pick a random audio code on mount or refresh
  const generateNewAudioCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setAudioCode(code);
    setAudioInput('');
  };

  const handleCheckboxClick = () => {
    if (loading || isVerified) return;
    setLoading(true);

    // Realistic reCAPTCHA behavioral detection pause
    setTimeout(() => {
      setLoading(false);
      // Open the visual task challenge modal
      setShowChallenge(true);
      setSelectedTiles(new Set());
      setErrorMessage(null);
      setIsAudioMode(false);
      generateNewAudioCode();
    }, 450);
  };

  const toggleTile = (idx: number) => {
    setErrorMessage(null);
    setSelectedTiles((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleReloadChallenge = () => {
    setErrorMessage(null);
    setSelectedTiles(new Set());
    setChallengeIndex((prev) => prev + 1);
    generateNewAudioCode();
  };

  const handleVerify = () => {
    if (verifying) return;
    setVerifying(true);
    setErrorMessage(null);

    setTimeout(() => {
      setVerifying(false);

      if (isAudioMode) {
        // Audio mode verification
        if (audioInput.trim() === audioCode) {
          completeVerification();
        } else {
          setErrorMessage('Incorrect audio code. Please try again.');
          generateNewAudioCode();
        }
        return;
      }

      // Visual tile verification
      const correct = currentChallenge.correctIndices;
      const selected = Array.from(selectedTiles).sort((a, b) => a - b);
      const isCorrect =
        correct.length === selected.length &&
        correct.every((val, i) => val === selected[i]);

      if (isCorrect) {
        completeVerification();
      } else {
        // If wrong or skipped, show error and present a new challenge
        setErrorMessage('Please select all matching images to verify.');
        setSelectedTiles(new Set());
        setChallengeIndex((prev) => prev + 1);
      }
    }, 400);
  };

  const completeVerification = () => {
    setShowChallenge(false);
    const token = `recaptcha_v2_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    onVerify(token);
  };

  const handlePlayAudio = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // Read out digits one by one
        const digits = audioCode.split('').join(' . ');
        const utterance = new SpeechSynthesisUtterance(`Verification code is: ${digits}`);
        utterance.rate = 0.85;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 2000);
      }
    } catch {
      setIsPlayingAudio(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showChallenge) {
        setShowChallenge(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showChallenge]);

  return (
    <div className="relative inline-block select-none">
      {/* reCAPTCHA Main Checkbox Box */}
      <div className="w-full max-w-[304px] bg-[#f9f9f9] border border-[#d3d3d3] rounded-[3px] shadow-[0_0_4px_1px_rgba(0,0,0,0.06)] px-3.5 py-2.5 transition-all">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Checkbox & "I'm not a robot" */}
          <div
            onClick={handleCheckboxClick}
            className="flex items-center gap-3 cursor-pointer group py-1"
            role="checkbox"
            aria-checked={isVerified}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleCheckboxClick();
              }
            }}
          >
            {/* Checkbox / Spinner / Checkmark */}
            <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
              {isVerified ? (
                <div className="w-7 h-7 rounded-sm flex items-center justify-center animate-scale-in">
                  <Check size={24} className="text-[#0f9d58] stroke-[3]" />
                </div>
              ) : loading ? (
                <div className="w-6 h-6 rounded-full border-[3px] border-[#4285f4] border-t-transparent animate-spin" />
              ) : (
                <div className="w-6 h-6 bg-white border-2 border-[#c1c1c1] rounded-sm group-hover:border-[#888888] transition-colors" />
              )}
            </div>

            {/* Label */}
            <span className="text-sm font-sans text-[#282727] font-normal leading-none group-hover:text-black">
              I'm not a robot
            </span>
          </div>

          {/* Right: Authentic reCAPTCHA Brand Logo & Legal Links */}
          <div className="flex flex-col items-center justify-center shrink-0 pl-3 border-l border-stone-200/60 min-w-[70px]">
            <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M24 4C12.95 4 4 12.95 4 24C4 35.05 12.95 44 24 44C35.05 44 44 35.05 44 24C44 12.95 35.05 4 24 4ZM24 40C15.16 40 8 32.84 8 24C8 15.16 15.16 8 24 8C32.84 8 40 15.16 40 24C40 32.84 32.84 40 24 40Z"
                fill="#1A73E8"
                fillOpacity="0.12"
              />
              <path
                d="M37.5 17.5L34 21C35.2 22.8 36 25 36 27.5C36 34.4 30.4 40 23.5 40L25 36C29.4 36 33 32.4 33 28C33 26.2 32.4 24.5 31.5 23.2L35 19.7L37.5 17.5Z"
                fill="#1A73E8"
              />
              <path
                d="M10.5 30.5L14 27C12.8 25.2 12 23 12 20.5C12 13.6 17.6 8 24.5 8L23 12C18.6 12 15 15.6 15 20C15 21.8 15.6 23.5 16.5 24.8L13 28.3L10.5 30.5Z"
                fill="#4285F4"
              />
              <path
                d="M28 12C32.4 12 36 15.6 36 20H40C40 13.4 34.6 8 28 8V12Z"
                fill="#34A853"
              />
            </svg>
            <span className="text-[10px] text-[#555] font-sans font-medium leading-none mt-1">
              reCAPTCHA
            </span>
            <div className="flex items-center gap-1 text-[8px] text-[#555] font-sans mt-0.5">
              <a
                href="https://www.google.com/intl/en/policies/privacy/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-[#555]"
              >
                Privacy
              </a>
              <span>-</span>
              <a
                href="https://www.google.com/intl/en/policies/terms/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-[#555]"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Google reCAPTCHA Interactive Challenge Modal */}
      {showChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-[1px] animate-fade-in">
          <div
            ref={modalRef}
            className="w-full max-w-[360px] sm:max-w-[390px] bg-white border border-[#d3d3d3] rounded-[3px] shadow-2xl overflow-hidden animate-scale-in"
          >
            {/* Blue Header Banner */}
            <div className="bg-[#1a73e8] p-4 text-white relative">
              <button
                type="button"
                onClick={() => setShowChallenge(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-sm cursor-pointer"
                aria-label="Close Challenge"
              >
                <X size={18} />
              </button>

              {isAudioMode ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAudioMode(false);
                      setErrorMessage(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-blue-100 hover:text-white mb-2 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to visual challenge</span>
                  </button>
                  <h3 className="text-lg sm:text-xl font-bold font-sans tracking-tight">
                    Audio Verification
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Listen to the code and enter the digits below.
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-xs text-blue-100 font-sans block">
                    Select all squares with
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-sans tracking-tight capitalize mt-0.5">
                    {currentChallenge.subject}
                  </h3>
                  <p className="text-[11px] text-blue-100 mt-1 font-sans">
                    {currentChallenge.instruction}
                  </p>
                </div>
              )}
            </div>

            {/* Main Challenge Content */}
            <div className="p-2 sm:p-2.5 bg-[#f4f4f4]">
              {isAudioMode ? (
                <div className="p-6 bg-white border border-stone-200 rounded-[2px] text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 text-[#1a73e8] flex items-center justify-center">
                    <Headphones size={30} />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handlePlayAudio}
                      disabled={isPlayingAudio}
                      className="inline-flex items-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-sm transition-colors"
                    >
                      <Volume2 size={16} />
                      <span>{isPlayingAudio ? 'Playing Audio...' : 'Play Audio Code'}</span>
                    </button>
                  </div>
                  <div>
                    <input
                      type="text"
                      maxLength={4}
                      value={audioInput}
                      onChange={(e) => setAudioInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4 digits"
                      className="w-44 text-center tracking-[8px] font-mono font-bold text-lg px-3 py-2 border border-stone-300 rounded focus:ring-2 focus:ring-[#1a73e8] focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Click Play and enter the four numbers spoken.
                  </p>
                </div>
              ) : (
                /* 3x3 Tile Matrix */
                <div className="grid grid-cols-3 gap-1 bg-[#dcdcdc] p-1 rounded-[2px]">
                  {currentChallenge.tiles.map((tile, idx) => {
                    const isSelected = selectedTiles.has(idx);
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => toggleTile(idx)}
                        aria-label={tile.label}
                        className={`aspect-square relative overflow-hidden bg-white cursor-pointer transition-transform duration-100 ${
                          isSelected
                            ? 'ring-4 ring-[#1a73e8] ring-inset scale-[0.93]'
                            : 'hover:opacity-95'
                        }`}
                      >
                        {tile.renderSvg()}
                        {/* Selected Indicator Badge */}
                        {isSelected && (
                          <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shadow-md animate-scale-in">
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="mt-2 text-center text-xs font-medium text-red-600 bg-red-50 border border-red-200 py-1.5 px-2 rounded-[2px] animate-fade-in">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-white border-t border-[#e0e0e0] px-3 py-2.5 flex items-center justify-between">
              {/* Left Utilities */}
              <div className="flex items-center gap-3 text-[#555]">
                <button
                  type="button"
                  onClick={handleReloadChallenge}
                  title="Get a new challenge"
                  className="hover:text-black cursor-pointer p-1"
                >
                  <RotateCw size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAudioMode(!isAudioMode);
                    setErrorMessage(null);
                  }}
                  title={isAudioMode ? 'Switch to visual challenge' : 'Get an audio challenge'}
                  className="hover:text-black cursor-pointer p-1"
                >
                  <Headphones size={18} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      'reCAPTCHA Verification: Select all images that correspond to the requested subject and click Verify.'
                    )
                  }
                  title="Help & Info"
                  className="hover:text-black cursor-pointer p-1"
                >
                  <Info size={18} />
                </button>
              </div>

              {/* Right Action Button: SKIP or VERIFY */}
              <div>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying}
                  className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs px-6 py-2 rounded-[2px] tracking-wider uppercase transition-colors shadow-xs cursor-pointer active:translate-y-0.5 disabled:opacity-60"
                >
                  {verifying ? (
                    'VERIFYING...'
                  ) : isAudioMode ? (
                    'VERIFY'
                  ) : selectedTiles.size === 0 ? (
                    'SKIP'
                  ) : (
                    'VERIFY'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HumanVerificationCaptcha;
