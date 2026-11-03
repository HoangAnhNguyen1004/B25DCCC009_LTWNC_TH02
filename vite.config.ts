import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      include: ['src/features/**', 'src/utils/**'],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: {
        'src/features/**': { lines: 70 },
        'src/utils/**': { lines: 70 },
      },
    },
  },
});
