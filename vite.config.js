// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {noExternal: ["@mui/material", "@mui/utils", "@mui/base", "@mui/icons-material"]},
  // optimizeDeps: {
  //   include: ['@mui/icons-material'],
  // },
})
