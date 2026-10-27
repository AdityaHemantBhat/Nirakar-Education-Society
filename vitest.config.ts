import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@nirakar/shared': path.resolve(rootDir, 'packages/shared/src/index.ts'),
      '@nirakar/db': path.resolve(rootDir, 'packages/db/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    setupFiles: ['apps/api/src/tests/setup.ts'],
    testTimeout: 15000,
  },
});
