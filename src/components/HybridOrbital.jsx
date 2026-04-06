import React, { useState, useEffect, useRef } from 'react';

export default function HybridOrbital() {
  const [hybridType, setHybridType] = useState('sp');
  const [stateSlider, setStateSlider] = useState(3);
  const [q1Ans, setQ1Ans] = useState('');
  const [q2Ans, setQ2Ans] = useState('');
  const [quizResult, setQuizResult] = useState({ text: '', color: '' });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是你的无机化学与结构化学AI助教。关于“轨道杂化、分子构型或VSEPR理论”，你有什么疑问吗？\n(例如您可以问：“除了 s 和 p 轨道，d 轨道也可以参与杂化吗？” 或 “为什么孤对电子的排斥力更大？”)' }
  ]);
  const chatEndRef = useRef(null);

  const hybridData = {
    'sp': {
        atom: '铍 (Be)', desc: '基态铍(Be)最外层电子排布为 2s²。为了成键，一个 2s 电子激发到 2p 轨道。接着，1个 s 轨道和 1个 p 轨道发生杂化，形成两个呈 180° 排列的 sp 杂化轨道。',
        geoName: '直线形 (Linear) - BeCl₂', angle: '180°',
        orbitals: {
            1: { s: ['↑↓'], p: ['', '', ''] }, 2: { s: ['↑'], p: ['↑', '', ''] }, 3: { hybName: 'sp', hyb: ['↑', '↑'], unhybName: '2p', unhyb: ['', ''] }
        },
        svg: `<circle cx="150" cy="120" r="20" fill="#f59e0b"/><text x="150" y="125" fill="#000" font-size="14" font-weight="bold" text-anchor="middle">Be</text><line x1="130" y1="120" x2="60" y2="120" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><line x1="170" y1="120" x2="240" y2="120" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="120" r="15" fill="var(--life-green)"/><text x="50" y="125" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">Cl</text><circle cx="250" cy="120" r="15" fill="var(--life-green)"/><text x="250" y="125" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">Cl</text><path d="M 100,105 Q 150,80 200,105" fill="none" stroke="var(--alert-orange)" stroke-width="2" stroke-dasharray="4"/><text x="150" y="90" fill="var(--alert-orange)" font-size="14" text-anchor="middle">180°</text>`
    },
    'sp2': {
        atom: '硼 (B)', desc: '基态硼(B)电子排布为 2s² 2p¹。一个 2s 电子激发至 2p 轨道。1个 s 轨道与 2个 p 轨道混合，形成三个能量相等的 sp² 杂化轨道，呈平面三角形。',
        geoName: '平面三角形 (Trigonal Planar) - BF₃', angle: '120°',
        orbitals: {
            1: { s: ['↑↓'], p: ['↑', '', ''] }, 2: { s: ['↑'], p: ['↑', '↑', ''] }, 3: { hybName: 'sp²', hyb: ['↑', '↑', '↑'], unhybName: '2p', unhyb: [''] }
        },
        svg: `<circle cx="150" cy="130" r="20" fill="#f59e0b"/><text x="150" y="135" fill="#000" font-size="14" font-weight="bold" text-anchor="middle">B</text><line x1="150" y1="110" x2="150" y2="50" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><line x1="133" y1="140" x2="80" y2="185" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><line x1="167" y1="140" x2="220" y2="185" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><circle cx="150" cy="40" r="15" fill="var(--life-green)"/><text x="150" y="45" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">F</text><circle cx="70" cy="195" r="15" fill="var(--life-green)"/><text x="70" y="200" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">F</text><circle cx="230" cy="195" r="15" fill="var(--life-green)"/><text x="230" y="200" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">F</text><path d="M 125,75 A 50 50 0 0 0 100,165" fill="none" stroke="var(--alert-orange)" stroke-width="2" stroke-dasharray="4"/><text x="90" y="110" fill="var(--alert-orange)" font-size="14" text-anchor="middle">120°</text>`
    },
    'sp3': {
        atom: '碳 (C)', desc: '基态碳(C)为 2s² 2p²。激发后变为 2s¹ 2p³。1个s与3个p轨道完全等性混合，形成四个指向正四面体顶点的 sp³ 杂化轨道，均含1个单电子。',
        geoName: '正四面体形 (Tetrahedral) - CH₄', angle: '109°28′ (或 109.5°)',
        orbitals: {
            1: { s: ['↑↓'], p: ['↑', '↑', ''] }, 2: { s: ['↑'], p: ['↑', '↑', '↑'] }, 3: { hybName: 'sp³', hyb: ['↑', '↑', '↑', '↑'], unhybName: '', unhyb: [] }
        },
        svg: `<circle cx="150" cy="130" r="20" fill="#f59e0b"/><text x="150" y="135" fill="#000" font-size="14" font-weight="bold" text-anchor="middle">C</text><line x1="150" y1="110" x2="150" y2="40" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><line x1="135" y1="145" x2="60" y2="190" stroke="var(--cyan-glow)" stroke-width="12" stroke-linecap="round"/><line x1="165" y1="145" x2="240" y2="190" stroke="var(--cyan-glow)" stroke-width="12" stroke-linecap="round"/><line x1="150" y1="145" x2="150" y2="200" stroke="#475569" stroke-width="6" stroke-dasharray="4" stroke-linecap="round"/><circle cx="150" cy="30" r="12" fill="#e2e8f0"/><circle cx="50" cy="200" r="14" fill="#e2e8f0"/><circle cx="250" cy="200" r="14" fill="#e2e8f0"/><circle cx="150" cy="210" r="10" fill="#94a3b8"/><path d="M 165,70 Q 210,120 205,160" fill="none" stroke="var(--alert-orange)" stroke-width="2" stroke-dasharray="4"/><text x="215" y="110" fill="var(--alert-orange)" font-size="14" text-anchor="middle">109.5°</text>`
    },
    'sp3u': {
        atom: '氧 (O)', desc: '基态氧(O)为 2s² 2p⁴。在此直接发生杂化（无需激发），形成四个 sp³ 轨道。其中两个轨道被孤对电子(↑↓)占据，另外两个是单电子，形成“不等性”杂化。孤对电子排斥力强，导致键角被压缩。',
        geoName: 'V形 / 折线形 (Bent) - H₂O', angle: '104.5° (受孤电子对挤压)',
        orbitals: {
            1: { s: ['↑↓'], p: ['↑↓', '↑', '↑'] }, 2: { s: ['↑↓'], p: ['↑↓', '↑', '↑'], note: '（氧原子无需激发，直接进入杂化）' }, 3: { hybName: 'sp³ (不等性)', hyb: ['↑↓', '↑↓', '↑', '↑'], unhybName: '', unhyb: [] }
        },
        svg: `<circle cx="150" cy="130" r="22" fill="#ef4444"/><text x="150" y="135" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">O</text><ellipse cx="120" cy="80" rx="20" ry="40" fill="rgba(139, 92, 246, 0.4)" stroke="var(--purple-med)" stroke-width="2" transform="rotate(-35 120 80)"/><text x="115" y="80" fill="#fff" font-size="16" font-weight="bold">..</text><ellipse cx="180" cy="80" rx="20" ry="40" fill="rgba(139, 92, 246, 0.4)" stroke="var(--purple-med)" stroke-width="2" transform="rotate(35 180 80)"/><text x="175" y="80" fill="#fff" font-size="16" font-weight="bold">..</text><line x1="135" y1="145" x2="80" y2="190" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><line x1="165" y1="145" x2="220" y2="190" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><circle cx="70" cy="200" r="12" fill="#e2e8f0"/><text x="70" y="205" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">H</text><circle cx="230" cy="200" r="12" fill="#e2e8f0"/><text x="230" y="205" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">H</text><path d="M 105,170 Q 150,140 195,170" fill="none" stroke="var(--alert-orange)" stroke-width="2" stroke-dasharray="4"/><text x="150" y="185" fill="var(--alert-orange)" font-size="14" font-weight="bold" text-anchor="middle">104.5°</text><path d="M 120,105 Q 110,130 95,145" fill="none" stroke="var(--alert-red)" stroke-width="2"/><path d="M 180,105 Q 190,130 205,145" fill="none" stroke="var(--alert-red)" stroke-width="2"/>`
    }
  };

  const activeData = hybridData[hybridType];
  const activeOrb = activeData.orbitals[stateSlider];

  const handleSwitch = (type) => { setHybridType(type); setStateSlider(3); };

  const submitQuiz = () => {
    if (q1Ans === 'B' && q2Ans === 'C') {
      setQuizResult({ text: "✅ 回答完美！您精准掌握了 VSEPR 构型推导以及孤对电子引发的不等性杂化效应！", color: "var(--life-green)" });
    } else {
      setQuizResult({ text: "❌ 回答有误。提示：平面三角形对应 sp² 杂化；H₂O 键角变小是因为氧上有两对孤对电子的强烈空间排斥。", color: "var(--alert-orange)" });
    }
  };

  const handleChat = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: "真是个好问题！在现代化学中，如果中心原子拥有可用的 d 轨道（如第三周期的磷、硫），它们也可以参与杂化。例如：形成五氯化磷 (PCl₅) 时会发生 **sp³d 杂化**，空间构型为三角双锥；形成六氟化硫 (SF₆) 时会发生 **sp³d² 杂化**，空间构型为正八面体。量子力学允许能量相近的轨道进行重新组合，以达到整个分子能量的最低点。" }]);
      }, 1000);
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  return (
    <div className="hyb-wrapper">
      <style>{`
        .hyb-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(20, 30, 48, 0.7); --primary-blue: #0ea5e9; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --cyan-glow: #06b6d4; --text-main: #f8fafc; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
        .hyb-wrapper h1, .hyb-wrapper h2, .hyb-wrapper h3, .hyb-wrapper h4 { color: var(--cyan-glow); }
        .hyb-wrapper h2 { border-left: 5px solid var(--purple-med); padding-left: 15px; margin-bottom: 30px; }
        .hyb-wrapper section { min-height: 100vh; padding: 60px 10%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .hyb-wrapper .btn { background: linear-gradient(135deg, var(--purple-med), #6d28d9); border: none; padding: 12px 24px; color: #fff; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
        .hyb-wrapper .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6); }
        .hyb-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; margin-right: 10px; }
        .hyb-wrapper .btn-outline:hover, .hyb-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); box-shadow: 0 0 10px rgba(6, 182, 212, 0.5); }
        .hyb-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .hyb-wrapper .panel { background: var(--bg-panel); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .hyb-wrapper .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .hyb-wrapper .summary-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--primary-blue); border-radius: 12px; padding: 25px; transition: all 0.3s; box-shadow: inset 0 0 20px rgba(14, 165, 233, 0.05); }
        .hyb-wrapper .summary-card:hover { transform: translateY(-10px); box-shadow: 0 10px 30px rgba(14, 165, 233, 0.2); border-color: var(--cyan-glow); }
        .hyb-wrapper .card-icon { font-size: 2.5rem; margin-bottom: 15px; }
        .hyb-wrapper .tag { display: inline-block; background: rgba(139, 92, 246, 0.15); color: #c4b5fd; padding: 4px 10px; border-radius: 4px; font-size: 12px; margin-top: 10px; border: 1px solid var(--purple-med); }
        .hyb-wrapper .svg-container { display: flex; align-items: center; justify-content: center; flex-direction: column; border: 2px dashed var(--cyan-glow); border-radius: 16px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; position: relative; min-height: 380px; }
        .hyb-wrapper .orbital-row { display: flex; align-items: center; margin-bottom: 15px; gap: 15px; }
        .hyb-wrapper .orbital-label { width: 60px; font-weight: bold; color: var(--primary-blue); text-align: right; }
        .hyb-wrapper .orbital-box-group { display: flex; gap: 5px; }
        .hyb-wrapper .orbital-box { width: 40px; height: 40px; border: 1px solid var(--life-green); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; background: rgba(16, 185, 129, 0.1); position: relative; transition: all 0.5s; }
        .hyb-wrapper .orbital-box.hybridized { border-color: var(--purple-med); background: rgba(139, 92, 246, 0.2); box-shadow: 0 0 10px rgba(139,92,246,0.5); }
        .hyb-wrapper .orbital-box.empty { border-color: #475569; background: rgba(255,255,255,0.02); }
        .hyb-wrapper .quiz-item { margin-bottom: 25px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; border-left: 3px solid var(--primary-blue); }
        .hyb-wrapper .quiz-item p { margin-top: 0; font-weight: bold; }
        .hyb-wrapper .quiz-item label { display: block; margin: 8px 0; cursor: pointer; padding: 8px; border-radius: 5px; transition: 0.2s; background: rgba(255,255,255,0.05); }
        .hyb-wrapper .quiz-item label:hover { background: rgba(255,255,255,0.15); }
        .hyb-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--cyan-glow), var(--purple-med)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(6, 182, 212, 0.6); z-index: 100; transition: transform 0.3s; }
        .hyb-wrapper .ai-bot:hover { transform: scale(1.1); }
        .hyb-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: var(--bg-dark); border: 1px solid var(--cyan-glow); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
        .hyb-wrapper .ai-chat-window input { width: calc(100% - 22px); padding: 10px; border-radius: 6px; border: none; margin-top: 10px; background: #1e293b; color: #fff;}
      `}</style>

      <section id="hero" style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)' }}>
        <svg width="300" height="200" viewBox="0 0 300 200" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 20px var(--cyan-glow))' }}>
          <ellipse cx="150" cy="100" rx="80" ry="25" fill="none" stroke="var(--cyan-glow)" strokeWidth="2" transform="rotate(30 150 100)"/>
          <ellipse cx="150" cy="100" rx="80" ry="25" fill="none" stroke="var(--purple-med)" strokeWidth="2" transform="rotate(-30 150 100)"/>
          <ellipse cx="150" cy="100" rx="80" ry="25" fill="none" stroke="var(--primary-blue)" strokeWidth="2" transform="rotate(90 150 100)"/>
          <circle cx="150" cy="100" r="15" fill="#f59e0b"/>
          <circle r="4" fill="#fff"><animateMotion dur="2s" repeatCount="indefinite" path="M 75 60 A 80 25 30 1 1 225 140 A 80 25 30 1 1 75 60" /></circle>
        </svg>
        <h1 style={{ fontSize: '3rem', marginTop: '20px', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>杂化轨道理论</h1>
        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '40px' }}>“能量相近的原子轨道重新组合，以最大重叠和最小排斥，塑造了缤纷的微观分子世界。”</p>
        <button className="btn" onClick={() => document.getElementById('summary').scrollIntoView()}>进入微观量子世界 ↓</button>
      </section>

      <section id="summary" style={{ paddingTop: '20px' }}>
        <h2>模块一：理论要点与核心概念 (Theoretical Essentials)</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-icon">🌀</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>1. 杂化的本质与目的</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>原理：</strong>在形成多原子分子时，中心原子中能量相近的原子轨道（如 s 和 p 轨道）相互叠加混编，形成一组能量相同、方向特定的新轨道——<strong>杂化轨道</strong>。</p>
            <div className="tag">🎯 核心目的：增强成键能力</div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>杂化轨道的电子云分布更加集中（一头大一头小），成键时轨道重叠程度更大，形成的化学键更牢固，分子能量更低、更稳定。</p>
          </div>
          <div className="summary-card">
            <div className="card-icon">📐</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>2. 杂化类型决定空间构型</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>对应法则：</strong>杂化轨道的空间伸展方向直接决定了分子的几何构型，它们在空间中会相互排斥，力求距离最远。</p>
            <ul style={{ fontSize: '13px', color: '#cbd5e1', paddingLeft: '20px', lineHeight: 1.6 }}>
              <li><strong>sp 杂化：</strong> 直线形 (180°)</li>
              <li><strong>sp² 杂化：</strong> 平面三角形 (120°)</li>
              <li><strong>sp³ 杂化：</strong> 正四面体形 (109.5°)</li>
            </ul>
          </div>
          <div className="summary-card">
            <div className="card-icon">⚖️</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>3. 等性杂化 vs 不等性杂化</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>等性杂化：</strong>参与杂化的轨道成分均等，且都被成键电子对占据（如 CH₄）。键角完美对应理想几何角度。</p>
            <div className="tag">⚠️ 不等性杂化效应</div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>当杂化轨道被<strong>孤电子对</strong>占据时，由于孤电子对对成键电子的排斥力更大，会导致成键轨道被“挤压”，使得实际键角变小（如 H₂O 的键角为 104.5°）。</p>
          </div>
        </div>
      </section>

      <section id="module2">
        <h2>模块二：动态微观 —— 轨道电子排布与空间构型演变</h2>
        <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button className={`btn-outline ${hybridType === 'sp' ? 'active' : ''}`} onClick={() => handleSwitch('sp')}>sp 杂化 (BeCl₂)</button>
          <button className={`btn-outline ${hybridType === 'sp2' ? 'active' : ''}`} onClick={() => handleSwitch('sp2')}>sp² 杂化 (BF₃)</button>
          <button className={`btn-outline ${hybridType === 'sp3' ? 'active' : ''}`} onClick={() => handleSwitch('sp3')}>sp³ 等性杂化 (CH₄)</button>
          <button className={`btn-outline ${hybridType === 'sp3u' ? 'active' : ''}`} onClick={() => handleSwitch('sp3u')}>sp³ 不等性杂化 (H₂O)</button>
        </div>

        <div className="grid-2">
          <div className="panel">
            <h3>电子排布演化 (<span>{activeData.atom}</span>)</h3>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6, height: '60px' }}>{activeData.desc}</p>
            
            <div style={{ marginTop: '30px', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '12px', position: 'relative' }}>
              <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', marginRight: '15px' }}>当前状态演变阶段：</span>
                <input type="range" min="1" max="3" value={stateSlider} step="1" onChange={e => setStateSlider(parseInt(e.target.value))} style={{ width: '150px', accentColor: 'var(--cyan-glow)', verticalAlign: 'middle' }} />
                <span style={{ color: ['var(--cyan-glow)','#f59e0b','var(--purple-med)'][stateSlider-1], fontWeight: 'bold', marginLeft: '15px', display: 'inline-block', width: '60px' }}>
                  {['1. 基态', '2. 激发态', '3. 杂化态'][stateSlider-1]}
                </span>
              </div>

              <div style={{ minHeight: '120px' }}>
                {stateSlider <= 2 ? (
                  <>
                    <div className="orbital-row"><div className="orbital-label">2s</div><div className="orbital-box-group"><div className="orbital-box">{activeOrb.s[0]}</div></div></div>
                    <div className="orbital-row"><div className="orbital-label">2p</div><div className="orbital-box-group">{activeOrb.p.map((e,i)=><div key={i} className={`orbital-box ${e===''?'empty':''}`}>{e}</div>)}</div></div>
                    {activeOrb.note && <p style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>{activeOrb.note}</p>}
                  </>
                ) : (
                  <>
                    <div className="orbital-row"><div className="orbital-label" style={{ color: 'var(--purple-med)' }}>{activeOrb.hybName}</div><div className="orbital-box-group">{activeOrb.hyb.map((e,i)=><div key={i} className="orbital-box hybridized">{e}</div>)}</div></div>
                    {activeOrb.unhyb.length > 0 && (
                      <>
                        <div className="orbital-row"><div className="orbital-label" style={{ color: '#64748b' }}>{activeOrb.unhybName}</div><div className="orbital-box-group">{activeOrb.unhyb.map((e,i)=><div key={i} className="orbital-box empty">{e}</div>)}</div></div>
                        <p style={{ color: '#64748b', fontSize: '12px' }}>注: 未参与杂化的 p 轨道通常用于形成 π 键</p>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="svg-container">
            <h3 style={{ marginTop: 0, color: '#fff', textShadow: '0 0 5px var(--cyan-glow)' }}>分子空间构型展示</h3>
            <p style={{ color: 'var(--cyan-glow)', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{activeData.geoName}</p>
            <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="300" height="250" viewBox="0 0 300 250" dangerouslySetInnerHTML={{ __html: activeData.svg }} />
            </div>
            <div style={{ marginTop: '15px', padding: '10px 20px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', fontFamily: 'monospace', color: 'var(--alert-orange)', fontSize: '16px', fontWeight: 'bold' }}>
                键角: {activeData.angle}
            </div>
          </div>
        </div>
      </section>

      <section id="module3">
        <h2>模块三：教学闭环 —— 随堂挑战与科学启迪</h2>
        <div className="grid-2">
          <div className="panel" style={{ background: 'rgba(14, 165, 233, 0.1)', borderColor: 'var(--primary-blue)' }}>
            <h3 style={{ color: 'var(--cyan-glow)' }}>🚩 科学启迪：从抽象数学到真实世界的桥梁</h3>
            <p><strong>1. 破除认知边界：</strong> 薛定谔方程给出了电子的概率波分布，然而这只是抽象的数学推导。鲍林等人提出的杂化轨道理论，用极具创造性的“数学轨道组合”成功解释了真实分子的构型。这告诉我们，科学不仅需要严谨的计算，更需要<strong>大胆假设与物理直觉</strong>的结合。</p>
            <p><strong>2. 对立统一的唯物辩证观：</strong> 电子之间的排斥力（对立）与成键需求（统一），共同促成了能量最低。不等性杂化打破了完美的对称，却造就了水（H₂O）这样的极性分子——正是这种“不完美”，孕育了地球上所有的生命。</p>
          </div>
          <div>
            <h3>核心考点在线测评</h3>
            <div className="quiz-item">
              <p>1. 【构型与杂化类型判断】三氟化硼 (BF₃) 分子空间构型为平面三角形，请问中心硼(B)原子的杂化方式是？</p>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('A')} /> A. sp 杂化</label>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('B')} /> B. sp² 杂化</label>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('C')} /> C. sp³ 杂化</label>
            </div>
            <div className="quiz-item">
              <p>2. 【不等性杂化机制】水分子 (H₂O) 中氧原子的杂化轨道类型同样是 sp³，但其键角（104.5°）显著小于甲烷（109.5°），其根本原因是：</p>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('A')} /> A. 氢原子太小，无法撑开空间</label>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('B')} /> B. 氧的电负性太强导致键收缩</label>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('C')} /> C. 氧原子上有两对孤电子对（未成键），对成键电子对产生了更大的空间排斥力</label>
            </div>
            <button className="btn" onClick={submitQuiz}>提交试卷检测</button>
            {quizResult.text && <p style={{ marginTop: '15px', fontWeight: 'bold', color: quizResult.color }}>{quizResult.text}</p>}
          </div>
        </div>
      </section>

      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
            <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '16px' }}>量子化AI助教</h3>
            <div style={{ height: '200px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--cyan-glow)' : '#fff' }}>
                    <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong> <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
                  </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <input type="text" placeholder="输入问题，按回车发送..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={handleChat} />
        </div>
      )}
    </div>
  );
}