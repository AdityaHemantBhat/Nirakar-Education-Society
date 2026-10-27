import { describe, it, expect } from 'vitest';
import { extractClassicalKeywords, extractExtractiveExcerpt } from '../lib/pdf.js';

describe('Deterministic Classical PDF Text & Keyword Analytics', () => {
  const sampleArticleText = `
    Shri Nirakar Education Society celebrated its annual founders day in Mashem Canacona.
    The ceremony witnessed outstanding academic distinctions awarded to SSC and HSSC merit rankers.
    Distinguished alumni highlighted the importance of mathematics and scientific research in rural Goa.
    The governing committee announced new laboratory facilities and scholarship endowments for deserving students.
  `;

  it('extracts high frequency meaningful keywords via classical RAKE/TF-IDF without external AI', () => {
    const keywords = extractClassicalKeywords(sampleArticleText, 5);
    expect(keywords).toBeInstanceOf(Array);
    expect(keywords.length).toBeGreaterThan(0);
    // Should extract prominent tokens like 'Academic', 'Distinctions', 'Merit'
    const lower = keywords.map((k) => k.toLowerCase());
    expect(lower.some((k) => ['academic', 'distinctions', 'founders', 'rankers', 'scientific'].includes(k))).toBe(true);
  });

  it('generates deterministic extractive excerpt preserving original sentences', () => {
    const excerpt = extractExtractiveExcerpt(sampleArticleText, 150);
    expect(excerpt).toBeTypeOf('string');
    expect(excerpt.length).toBeLessThanOrEqual(160);
    expect(excerpt).toContain('Shri Nirakar Education Society');
  });
});
