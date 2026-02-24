import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['apps/miniapp/test/**/*.{test,spec}.ts']
  }
});
