import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use happy-dom for fast DOM simulation
    environment: 'happy-dom',

    // Global test setup
    setupFiles: ['./src/test/setup.ts'],

    // Include patterns
    include: ['**/*.{test,spec}.{ts,tsx}'],

    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/e2e/**',
      '**/playwright-report/**',
      '**/coverage/**',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/e2e/**',
        '**/test/**',
        '**/*.config.{ts,js,mjs}',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/src/app/**', // Next.js pages tested via E2E
        '**/.gitkeep',
      ],
      // Coverage thresholds
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },

    // Globals (allows using describe, it, expect without imports)
    globals: true,

    // Test timeout (3D rendering can be slow)
    testTimeout: 10000,

    // Run tests in parallel
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },

  resolve: {
    alias: {
      // Match tsconfig.json path aliases
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/data': path.resolve(__dirname, './src/data'),
    },
  },
});
