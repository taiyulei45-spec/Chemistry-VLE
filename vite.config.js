import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Chemistry-VLE/', // 别忘了保留你之前配的 GitHub Pages 路径
  build: {
    chunkSizeWarningLimit: 1500, // 将警告限制调高到 1500 kB
  }
})