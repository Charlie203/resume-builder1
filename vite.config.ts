import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 📌 Added this part to remove the 500kb warning
  build: {
    chunkSizeWarningLimit: 1000, // you can adjust this number if needed
  },
})
