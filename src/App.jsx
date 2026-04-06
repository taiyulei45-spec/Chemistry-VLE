import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ==========================================
// 1. 导入公共与基础页面组件
// ==========================================
import Home from './pages/Home';
import SignInPage from './pages/SignInPage';

// ==========================================
// 2. 导入六大核心“总控舱”组件
// (注意：总控舱组件负责接管 /* 后的路径，并渲染具体的三级子模块)
// ==========================================
import Structure from './pages/Structure';
import Reactions from './pages/Reactions';
import Elements from './pages/Elements';
import Theory from './pages/Theory';
import AIAssistant from './pages/AIAssistant';
import Trajectory from './pages/Trajectory';

export default function App() {
  return (
    // 🔑 核心布局基座：
    // 强制使用 minHeight: '100vh' 替代写死的 height: '100vh'。
    // 这允许内部路由组件（如超长的微观实验舱）自由向下延展，完美支持丝滑滚动。
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Routes>
        
        {/* ---------------- 公共基础路由 ---------------- */}
        {/* 实验室超级主页 */}
        <Route path="/" element={<Home />} />
        
        {/* 沉浸式登录/注册系统 */}
        <Route path="/sign-in" element={<SignInPage />} />


        {/* ---------------- 核心实验舱路由 ---------------- */}
        {/* 模块一：物质结构
            带 /* 表示将形如 /structure/atom 的路由完全交由 Structure.jsx 去解析，
            Structure 会自动调起内部的 AtomStructureLab 等 11 个三级交互组件。
        */}
        <Route path="/structure/*" element={<Structure />} />

        {/* 模块二：反应基础 (包含稀溶液、热力学、动力学及四大平衡等) */}
        <Route path="/reactions/*" element={<Reactions />} />

        {/* 模块三：元素化学 (包含s区、p区、d区、f区等) */}
        <Route path="/elements/*" element={<Elements />} />

        {/* 模块四：理论应用 (包含结构性能、平衡移动、速率调控等) */}
        <Route path="/theory/*" element={<Theory />} />

        {/* 模块五：AI+前沿 (包含计算工具、虚拟实验、科研案例等) */}
        <Route path="/ai-assistant/*" element={<AIAssistant />} />

        {/* 模块六：学习轨迹 (包含学习时长、雷达图、报告导出等) */}
        <Route path="/trajectory/*" element={<Trajectory />} />


        {/* ---------------- 兜底安全路由 ---------------- */}
        {/* 404 Fallback：任何未匹配的未知路径，强制平滑重定向回主页，防止白屏 */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </div>
  );
}