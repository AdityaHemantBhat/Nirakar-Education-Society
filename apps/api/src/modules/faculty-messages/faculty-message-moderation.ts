import { createHmac } from 'node:crypto';
import { config } from '../../config/index.js';

const profaneTerms = new Set([
  'arsehole', 'asshole', 'bastard', 'bitch', 'bullshit', 'cock', 'cocksucker',
  'crap', 'cunt', 'dammit', 'damn', 'dick', 'dickhead', 'fag', 'faggot',
  'fuck', 'fucker', 'fucking', 'motherfucker', 'piss', 'pissed', 'pussy',
  'shit', 'shitty', 'slut', 'twat', 'whore', 'wanker',
  'behenchod', 'bhenchod', 'bhosadike', 'bhosdi', 'chutiya', 'gandu',
  'gaand', 'gaanduu', 'harami', 'loda', 'lode', 'lund', 'madarchod',
  'randi', 'zhavadya', 'zhavdya', 'lavdya', 'aizhavli', 'randichya',
  'fodo', 'fodde', 'foddya', 'chediyechya', 'chedyechya', 'chedya',
  'भेंचोद', 'भोसडी', 'भोसडीके', 'चुतिया', 'गांड', 'गांडू', 'हरामी',
  'लवड्या', 'मादरचोद', 'रंडी', 'झवाड्या', 'आईझवली',
]);

const leetMap: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '@': 'a',
  '$': 's',
  '5': 's',
  '7': 't',
};

export type VisitorModerationIdentity = {
  phone?: string | null;
  email?: string | null;
  visitorTokenHash?: string;
};

export function visitorModerationHashes(identity: VisitorModerationIdentity) {
  const values = [
    identity.phone ? `phone:${identity.phone.replace(/\D/g, '')}` : '',
    identity.email ? `email:${identity.email.trim().toLowerCase()}` : '',
    identity.visitorTokenHash ? `token:${identity.visitorTokenHash}` : '',
  ].filter(Boolean);
  return [...new Set(values)].map((value) => hashIdentity(value));
}

export function facultyModerationHash(userId: string) {
  return hashIdentity(`faculty:${userId}`);
}

export function formatModerationTimeInIst(value: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(value) + ' IST';
}

function hashIdentity(value: string) {
  return createHmac('sha256', config.JWT_ACCESS_SECRET).update(value).digest('hex');
}

function normalizeToken(token: string) {
  return [...token].map((character) => leetMap[character] || character).join('');
}

export function hasProfanity(text: string) {
  const tokens = text
    .normalize('NFKC')
    .toLocaleLowerCase()
    .match(/[\p{L}\p{M}\p{N}@$]+/gu)
    ?.map(normalizeToken) || [];

  for (let start = 0; start < tokens.length; start += 1) {
    for (let count = 1; count <= 4 && start + count <= tokens.length; count += 1) {
      if (profaneTerms.has(tokens.slice(start, start + count).join(''))) return true;
    }
  }
  return false;
}
