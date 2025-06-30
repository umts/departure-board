import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  plugins: [react()],
  test: {
    setupFiles: ['./test/setup.js'],
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [
        { browser: 'chromium' }
      ]
    },
    coverage: {
      enabled: true,
      include: ['src/**/*'],
      exclude: ['src/index.jsx'],
      thresholds: {
        100: true,
      },
    },
  },
})
