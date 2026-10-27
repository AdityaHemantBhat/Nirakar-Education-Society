import { defineConfig } from 'vitest/config';

/**
 * The tests run against the real database and the real upload directory.
 *
 * The reCAPTCHA check is stubbed here rather than in each test, so the
 * endpoint can be exercised without calling Google for every request. The
 * stub answers exactly as the real service does for a valid token.
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./src/tests/setup.ts'],
    /* Several tests wait for a document to be rendered in the background,
       which takes a few seconds. The files also run in parallel against a
       remote database, so the default five seconds is not enough. */
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
