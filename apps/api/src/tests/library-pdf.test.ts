import { describe, it, expect } from 'vitest';
import { selectPagesToRender, MAX_LIBRARY_PAGES } from '../lib/library-pdf.js';

/**
 * A large document is sampled down to the page ceiling rather than
 * refused. The sample must spread evenly across the whole document and
 * keep the first and last pages, so the book opens at the beginning and
 * shows the whole span.
 */
describe('Library page selection', () => {
  it('renders every page of a document inside the ceiling', () => {
    expect(selectPagesToRender(1)).toEqual([1]);
    expect(selectPagesToRender(400)).toHaveLength(400);
    expect(selectPagesToRender(400)[399]).toBe(400);
  });

  it('samples a document that is over the ceiling', () => {
    const pages = selectPagesToRender(11_717);

    expect(pages.length).toBeLessThanOrEqual(MAX_LIBRARY_PAGES + 1);
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(11_717);
  });

  it('keeps the sample in order and free of duplicates', () => {
    const pages = selectPagesToRender(5_000);

    for (let i = 1; i < pages.length; i++) {
      expect(pages[i]).toBeGreaterThan(pages[i - 1]);
    }
  });

  it('spreads the sample evenly rather than truncating the front', () => {
    const pages = selectPagesToRender(4_000);
    const last = pages[pages.length - 1];

    /* The final sample is near the end of the document, not somewhere in
       the first few hundred pages. */
    expect(last).toBeGreaterThan(3_900);
  });

  it('handles a document just over the ceiling', () => {
    const pages = selectPagesToRender(MAX_LIBRARY_PAGES + 10);

    expect(pages.length).toBeLessThanOrEqual(MAX_LIBRARY_PAGES + 1);
    expect(pages[0]).toBe(1);
    expect(pages[pages.length - 1]).toBe(MAX_LIBRARY_PAGES + 10);
  });
});
