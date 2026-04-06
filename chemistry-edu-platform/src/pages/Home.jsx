import { Link } from 'react-router-dom';

export default function Home() {
  const modules = [
    { title: '物质结构', desc: '元素周期律、原子与分子空间结构、配合物 3D 渲染', path: '/structure' },
    { title: '反应基础', desc: '化学热力学、动力学曲线计算、四大化学平衡模拟', path: '/reactions' },
    { title: '元素化学', desc: 's区、p区、d区、f区元素特性与反应机理', path: '/elements' },
    { title: '理论应用', desc: '前沿理论推导与工业应用实例', path: '/theory' },
    { title: 'AI + 前沿', desc: '智能化学问答助手与最新文献导读', path: '/ai-assistant' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', padding: '4rem 0', background: '#f8fafc', borderRadius: '8px', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '1rem' }}>探索化学的微观世界</h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>综合性虚拟化学交互学习平台 · 3D分子 · 动态动力学 · AI助教</p>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {modules.map((mod, i) => (
          <div key={i} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0 }}>{mod.title}</h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', minHeight: '40px', marginBottom: '1.5rem' }}>{mod.desc}</p>
            <Link to={mod.path} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>进入模块 &rarr;</Link>
          </div>
        ))}
      </div>
    </div>
  );
}