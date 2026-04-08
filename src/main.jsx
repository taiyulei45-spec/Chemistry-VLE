import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react' // 1. 导入 Provider

// 2. 从环境变量或 Clerk 后台获取你的 Publishable Key
// 如果你还没去 clerk.com 创建项目，可以先填入一个占位符，但建议去官网拿真 Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. 请在 .env 文件中配置 VITE_CLERK_PUBLISHABLE_KEY")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. 使用 ClerkProvider 包裹 */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <HashRouter>
        <App />
      </HashRouter>
    </ClerkProvider>
  </React.StrictMode>,
)