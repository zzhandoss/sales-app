import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared/errors': resolve(__dirname, '../../packages/shared/errors/src/index.ts'),
      '@shared/logging': resolve(__dirname, '../../packages/shared/logging/src/index.ts'),
      '@shared/config': resolve(__dirname, '../../packages/shared/config/src/index.ts'),
      '@integration/erp-1c': resolve(__dirname, '../../packages/integration/erp-1c/src/index.ts'),
      '@contracts': resolve(__dirname, '../../packages/contracts/src/index.ts'),
    },
  },
  test: {
    include: ['apps/api/test/**/*.test.ts'],
  },
});
