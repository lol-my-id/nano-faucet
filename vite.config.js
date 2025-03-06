// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    noExternal: ['@mui/icons-material'],
  },
  optimizeDeps: {
    include: ['@mui/icons-material'],
  },
})
