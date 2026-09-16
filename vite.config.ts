/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    // server/ is a separate package (its own package.json/deps/env) —
    // without this, the default test glob also picks up server/src/**/*.test.ts.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
