import React from 'react';

export default function Structure() {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      {/* 左侧：模块专属侧边栏 */}
      <aside style={{ width: '250px', borderRight: '1px solid #e2e8f0', padding: '1.5rem', backgroundColor: '#f8fafc' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>物质结构</h3>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5', fontSize: '0.95rem' }}>
          {/* 这里可以做成点击切换的菜单 */}
          <li style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>1.1 元素周期表</li>
          <li style={{ color: '#475569', cursor: 'pointer' }}>1.2 原子结构</li>
          <li style={{ color: '#475569', cursor: 'pointer' }}>1.3 分子结构 (3D展示)</li>
          <li style={{ color: '#475569', cursor: 'pointer' }}>1.4 配合物结构</li>
        </ul>
      </aside>

      {/* 右侧：主学习与交互区 */}
      <main style={{ flex: 1, padding: '2rem', backgroundColor: '#ffffff' }}>
        <h2 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem', color: '#1e293b' }}>
          1.1 元素周期表与周期性
        </h2>
        
        <p style={{ color: '#475569', lineHeight: '1.6' }}>
          在这里，我们将通过富文本讲解元素周期律。右侧/下方的灰色区域，就是我们未来放置 Three.js 3D 模型或者 ECharts 动态折线图的地方。
        </p>

        {/* 预留的虚拟交互容器 */}
        <div style={{ 
          height: '400px', 
          backgroundColor: '#f1f5f9', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginTop: '2rem',
          border: '1px dashed #cbd5e1'
        }}>
          <span style={{ color: '#94a3b8', fontSize: '1.1rem' }}>[ 🧪 核心交互组件加载区 ]</span>
        </div>
      </main>
    </div>
  );
}