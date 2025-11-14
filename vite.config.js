import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  plugins: [react()],
  test: {
    setupFiles: ['./test/setup.js'],
    browser: {
      enabled: true,
      provider: playwright({ contextOptions: { timezoneId: 'UTC' } }),
      headless: true,
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        { browser: 'webkit' },
      ],
    },
    coverage: {
      enabled: true,
      provider: 'istanbul',
      include: ['src/**/*'],
      exclude: ['src/index.jsx'],
      thresholds: {
        100: true,
      },
    },
  },
})
