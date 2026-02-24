import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['apps/worker/test/**/*.test.ts'],
  },
});
