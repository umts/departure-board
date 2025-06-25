import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  test: {
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
