// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    ssr: {noExternal: ["@mui/material", "@mui/utils", "@mui/base", "@mui/icons-material"]},
    define: {
      'process.env': env
    }
  }

  // optimizeDeps: {
  //   include: ['@mui/icons-material'],
  // },
})
