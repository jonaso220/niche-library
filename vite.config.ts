import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        onlyExplicitManualChunks: true,
        // Vendor splitting: group heavy third-party deps into stable chunks
        // so they stay cached across deploys and don't bloat the entry bundle.
        manualChunks(id) {
          if (id.includes('/node_modules/@firebase/app-check') || id.includes('/node_modules/firebase/app-check')) {
            return 'vendor-firebase-app-check'
          }
          if (id.includes('/node_modules/@firebase/') || id.includes('/node_modules/firebase/')) {
            return 'vendor-firebase'
          }
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react-router/')) {
            return 'vendor-react'
          }
          if (id.includes('/node_modules/dexie/') || id.includes('/node_modules/dexie-react-hooks/')) {
            return 'vendor-dexie'
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
