import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 🚨 重要：绑定自定义域名后，根路径必须设置为 '/'
  // 这样浏览器才会去 www.smartchemistry.cn/assets/ 找文件
  // 而不是去 www.smartchemistry.cn/Chemistry-VLE/assets/ 找
  base: '/', 

  build: {
    // 优化：由于项目包含 3D 渲染和大型化学库，保持较高的分块警告阈值
    chunkSizeWarningLimit: 1500,
    
    // 建议增加：自动清理旧的构建文件
    emptyOutDir: true,
  }
})