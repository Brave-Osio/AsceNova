import { defineConfig } from 'vitest/config';

/**
 * Without this, Vitest has no config of its own here and bubbles up to
 * the frontend's vite.config.ts at the repo root — pulling in dependencies
 * this package doesn't have. `setupFiles` loads .env the same way
 * src/server.ts does, since config/env.ts validates process.env eagerly
 * at import time and several services now transitively import it (via
 * lib/gemini.ts).
 */
export default defineConfig({
  test: {
    setupFiles: ['dotenv/config'],
  },
});
