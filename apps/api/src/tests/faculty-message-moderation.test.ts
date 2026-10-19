import { describe, expect, it } from 'vitest';
import {
  formatModerationTimeInIst,
  hasProfanity,
} from '../modules/faculty-messages/faculty-message-moderation.js';

describe('faculty message language moderation', () => {
  it('flags English profanity and punctuation-separated attempts', () => {
    expect(hasProfanity('This is fucking unacceptable')).toBe(true);
    expect(hasProfanity('f.u.c.k')).toBe(true);
  });

  it('flags common Hindi and Marathi profanity in Latin and Devanagari scripts', () => {
    expect(hasProfanity('tu chutiya hai')).toBe(true);
    expect(hasProfanity('यह चुतिया है')).toBe(true);
  });

  it('flags the supplied Konkani profanity examples and common spelling variants', () => {
    expect(hasProfanity('Fodo')).toBe(true);
    expect(hasProfanity('chediyechya')).toBe(true);
    expect(hasProfanity('FODDE!')).toBe(true);
  });

  it('does not flag ordinary conversation text', () => {
    expect(hasProfanity('Please share the class schedule and homework.')).toBe(false);
  });

  it('formats moderation times in IST instead of UTC', () => {
    expect(formatModerationTimeInIst(new Date('2026-10-19T03:58:23.467Z')))
      .toBe('19 Oct 2026, 09:28:23 am IST');
  });
});
