import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ==========================================
// 1. 基础公共页面（保持静态导入，确保首屏瞬间秒开）
// ==========================================
import Home from './pages/Home';
import SignInPage from './pages/SignInPage';

// ==========================================
// 2. 核心实验舱（采用 Lazy 懒加载，解决打包体积过大问题）
// ==========================================
const Structure = lazy(() => import('./pages/Structure'));
const Reactions = lazy(() => import('./pages/Reactions'));
const Elements = lazy(() => import('./pages/Elements'));
const Theory = lazy(() => import('./pages/Theory'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Trajectory = lazy(() => import('./pages/Trajectory'));

// ==========================================
// 3. 全局加载过渡动画（在请求子模块代码时展示）
// ==========================================
const LoadingFallback = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#020617', 
    color: '#0ea5e9' 
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: '48px', animation: 'spin 2s linear infinite' }}>
      science
    </span>
    <h2 style={{ marginTop: '20px', letterSpacing: '2px', fontWeight: 'bold' }}>
      科研舱体正在接入...
    </h2>
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

export default function App() {
  return (
    // 🔑 核心布局基座
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#020617' }}>
      
      {/* Suspense 边界：捕获所有 Lazy 组件的加载状态 */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          
          {/* ---------------- 公共基础路由 ---------------- */}
          {/* 实验室超级主页 */}
          <Route path="/" element={<Home />} />
          
          {/* 沉浸式登录/注册系统 */}
          <Route path="/sign-in" element={<SignInPage />} />

          {/* ---------------- 核心实验舱路由 (懒加载) ---------------- */}
          {/* 模块一：物质结构 */}
          <Route path="/structure/*" element={<Structure />} />

          {/* 模块二：反应基础 */}
          <Route path="/reactions/*" element={<Reactions />} />

          {/* 模块三：元素化学 */}
          <Route path="/elements/*" element={<Elements />} />

          {/* 模块四：理论应用 */}
          <Route path="/theory/*" element={<Theory />} />

          {/* 模块五：AI + 前沿 */}
          <Route path="/ai-assistant/*" element={<AIAssistant />} />

          {/* 模块六：学习轨迹 */}
          <Route path="/trajectory/*" element={<Trajectory />} />

          {/* ---------------- 兜底安全路由 ---------------- */}
          {/* 404 Fallback：未知路径重定向回主页 */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </Suspense>
    </div>
  );
}