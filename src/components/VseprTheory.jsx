import React, { useState, useEffect, useRef } from 'react';

export default function VseprTheory() {
  const [currentMol, setCurrentMol] = useState('BeCl2');
  const [q1Ans, setQ1Ans] = useState('');
  const [q2Ans, setQ2Ans] = useState('');
  const [quizResult, setQuizResult] = useState({ text: '', color: '' });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是你的无机化学与结构化学AI助教。关于“路易斯电子配对、VSEPR推导或孤对电子排斥”，你有什么疑问吗？\n(例如您可以问：“在三角双锥构型中，孤对电子为什么优先占据赤道面？”)' }
  ]);
  const chatEndRef = useRef(null);

  // 核心微观构型数据库
  const molData = {
    'BeCl2': {
        title: '氯化铍 (BeCl₂)', vp: 2, bp: 2, lp: 0,
        eGeom: '直线形 (Linear)', mGeom: '直线形', angle: '180°',
        desc: '中心铍原子无孤对电子，2对成键电子在空间上相距最远，形成 180° 的直线。',
        svg: `<circle cx="150" cy="120" r="20" fill="#f59e0b"/><text x="150" y="125" fill="#000" font-size="14" font-weight="bold" text-anchor="middle">Be</text><line x1="130" y1="120" x2="60" y2="120" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><line x1="170" y1="120" x2="240" y2="120" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="120" r="15" fill="var(--life-green)"/><text x="50" y="125" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">Cl</text><circle cx="250" cy="120" r="15" fill="var(--life-green)"/><text x="250" y="125" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">Cl</text><path d="M 100,105 Q 150,80 200,105" fill="none" stroke="var(--alert-orange)" stroke-width="2" stroke-dasharray="4"/><text x="150" y="90" fill="var(--alert-orange)" font-size="14" text-anchor="middle">180°</text>`
    },
    'BF3': {
        title: '三氟化硼 (BF₃)', vp: 3, bp: 3, lp: 0,
        eGeom: '平面三角形 (Trigonal Planar)', mGeom: '平面三角形', angle: '120°',
        desc: '3对成键电子，无孤对电子，在二维平面上均匀分布，键角均为 120°。',
        svg: `<circle cx="150" cy="130" r="20" fill="#f59e0b"/><text x="150" y="135" fill="#000" font-size="14" font-weight="bold" text-anchor="middle">B</text><line x1="150" y1="110" x2="150" y2="50" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><line x1="133" y1="140" x2="80" y2="185" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><line x1="167" y1="140" x2="220" y2="185" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><circle cx="150" cy="40" r="15" fill="var(--life-green)"/><text x="150" y="45" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">F</text><circle cx="70" cy="195" r="15" fill="var(--life-green)"/><text x="70" y="200" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">F</text><circle cx="230" cy="195" r="15" fill="var(--life-green)"/><text x="230" y="200" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">F</text><path d="M 125,75 A 50 50 0 0 0 100,165" fill="none" stroke="var(--alert-orange)" stroke-width="2" stroke-dasharray="4"/><text x="90" y="110" fill="var(--alert-orange)" font-size="14" text-anchor="middle">120°</text>`
    },
    'CH4': {
        title: '甲烷 (CH₄)', vp: 4, bp: 4, lp: 0,
        eGeom: '正四面体 (Tetrahedral)', mGeom: '正四面体', angle: '109.5°',
        desc: '4对成键电子在三维空间中力求排斥力最小，指向正四面体的四个顶点。',
        svg: `<circle cx="150" cy="130" r="20" fill="#f59e0b"/><text x="150" y="135" fill="#000" font-size="14" font-weight="bold" text-anchor="middle">C</text><line x1="150" y1="110" x2="150" y2="40" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><line x1="135" y1="145" x2="60" y2="190" stroke="var(--cyan-glow)" stroke-width="12" stroke-linecap="round"/><line x1="165" y1="145" x2="240" y2="190" stroke="var(--cyan-glow)" stroke-width="12" stroke-linecap="round"/><line x1="150" y1="145" x2="150" y2="200" stroke="#475569" stroke-width="6" stroke-dasharray="4" stroke-linecap="round"/><circle cx="150" cy="30" r="12" fill="#e2e8f0"/><text x="150" y="34" fill="#000" font-size="10" font-weight="bold" text-anchor="middle">H</text><circle cx="50" cy="200" r="14" fill="#e2e8f0"/><text x="50" y="204" fill="#000" font-size="10" font-weight="bold" text-anchor="middle">H</text><circle cx="250" cy="200" r="14" fill="#e2e8f0"/><text x="250" y="204" fill="#000" font-size="10" font-weight="bold" text-anchor="middle">H</text><circle cx="150" cy="210" r="10" fill="#94a3b8"/><text x="150" y="213" fill="#000" font-size="8" font-weight="bold" text-anchor="middle">H</text><path d="M 165,70 Q 210,120 205,160" fill="none" stroke="var(--alert-orange)" stroke-width="2" stroke-dasharray="4"/><text x="215" y="110" fill="var(--alert-orange)" font-size="14" text-anchor="middle">109.5°</text>`
    },
    'NH3': {
        title: '氨气 (NH₃)', vp: 4, bp: 3, lp: 1,
        eGeom: '正四面体 (Tetrahedral)', mGeom: '三角锥形 (Trigonal Pyramidal)', angle: '107.3°',
        desc: '氮原子带有1对孤对电子。孤对电子对成键电子对的排斥力更大 (LP-BP > BP-BP)，将键角从 109.5° 压缩至 107.3°。',
        svg: `<circle cx="150" cy="130" r="20" fill="#3b82f6"/><text x="150" y="135" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">N</text><ellipse cx="150" cy="70" rx="20" ry="40" fill="rgba(139, 92, 246, 0.4)" stroke="var(--purple-med)" stroke-width="2"/><text x="150" y="70" fill="#fff" font-size="16" font-weight="bold" text-anchor="middle">..</text><line x1="135" y1="145" x2="60" y2="190" stroke="var(--cyan-glow)" stroke-width="12" stroke-linecap="round"/><line x1="165" y1="145" x2="240" y2="190" stroke="var(--cyan-glow)" stroke-width="12" stroke-linecap="round"/><line x1="150" y1="145" x2="150" y2="200" stroke="#475569" stroke-width="6" stroke-dasharray="4" stroke-linecap="round"/><circle cx="50" cy="200" r="14" fill="#e2e8f0"/><text x="50" y="204" fill="#000" font-size="10" font-weight="bold" text-anchor="middle">H</text><circle cx="250" cy="200" r="14" fill="#e2e8f0"/><text x="250" y="204" fill="#000" font-size="10" font-weight="bold" text-anchor="middle">H</text><circle cx="150" cy="210" r="10" fill="#94a3b8"/><text x="150" y="213" fill="#000" font-size="8" font-weight="bold" text-anchor="middle">H</text><path d="M 120,80 Q 90,120 100,165" fill="none" stroke="var(--alert-red)" stroke-width="2"/><path d="M 180,80 Q 210,120 200,165" fill="none" stroke="var(--alert-red)" stroke-width="2"/>`
    },
    'H2O': {
        title: '水分子 (H₂O)', vp: 4, bp: 2, lp: 2,
        eGeom: '正四面体 (Tetrahedral)', mGeom: 'V形 / 折线形 (Bent)', angle: '104.5°',
        desc: '氧原子带有2对孤对电子。巨大的排斥力 (LP-LP > LP-BP) 进一步严重挤压了成键电子对，使键角缩小至 104.5°。',
        svg: `<circle cx="150" cy="130" r="22" fill="#ef4444"/><text x="150" y="135" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">O</text><ellipse cx="120" cy="80" rx="20" ry="40" fill="rgba(139, 92, 246, 0.4)" stroke="var(--purple-med)" stroke-width="2" transform="rotate(-35 120 80)"/><text x="115" y="80" fill="#fff" font-size="16" font-weight="bold">..</text><ellipse cx="180" cy="80" rx="20" ry="40" fill="rgba(139, 92, 246, 0.4)" stroke="var(--purple-med)" stroke-width="2" transform="rotate(35 180 80)"/><text x="175" y="80" fill="#fff" font-size="16" font-weight="bold">..</text><line x1="135" y1="145" x2="80" y2="190" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><line x1="165" y1="145" x2="220" y2="190" stroke="var(--cyan-glow)" stroke-width="8" stroke-linecap="round"/><circle cx="70" cy="200" r="12" fill="#e2e8f0"/><text x="70" y="205" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">H</text><circle cx="230" cy="200" r="12" fill="#e2e8f0"/><text x="230" y="205" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">H</text><path d="M 105,170 Q 150,140 195,170" fill="none" stroke="var(--alert-orange)" stroke-width="2" stroke-dasharray="4"/><text x="150" y="185" fill="var(--alert-orange)" font-size="14" font-weight="bold" text-anchor="middle">104.5°</text><path d="M 120,105 Q 110,130 95,145" fill="none" stroke="var(--alert-red)" stroke-width="2"/><path d="M 180,105 Q 190,130 205,145" fill="none" stroke="var(--alert-red)" stroke-width="2"/>`
    }
  };

  const activeData = molData[currentMol];

  const submitQuiz = () => {
    if (q1Ans === 'A' && q2Ans === 'C') {
      setQuizResult({ text: "✅ 回答完美！你不仅掌握了 VSEPR 根据孤对电子推导构型，还深刻理解了孤对电子强排斥导致键角压缩的核心规律！", color: "var(--life-green)" });
    } else {
      setQuizResult({ text: "❌ 回答有误。提示：ICl₄⁻中VP=6,LP=2为平面四边形；NH₃由于顶部存在1对孤对电子，挤压了键角。", color: "var(--alert-orange)" });
    }
  };

  const handleChat = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: "这是一个经典问题！在 VSEPR 模型推导中，一旦存在孤对电子，就一定要把孤对电子放置在受周围电子对排斥力总和最小的位置。例如在 VP=5（三角双锥）中，赤道位置只有2个90°的相邻键，而轴向有3个90°的相邻键。由于孤对电子电子云非常庞大，受不了挤压，所以它们总是优先占据赤道位置！" }]);
      }, 1000);
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  return (
    <div className="vsepr-wrapper">
      <style>{`
        .vsepr-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(20, 30, 48, 0.7); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --pink-glow: #ec4899; --text-main: #f8fafc; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
        .vsepr-wrapper h1, .vsepr-wrapper h2, .vsepr-wrapper h3, .vsepr-wrapper h4 { color: var(--cyan-glow); }
        .vsepr-wrapper h2 { border-left: 5px solid var(--purple-med); padding-left: 15px; margin-bottom: 30px;}
        .vsepr-wrapper section { min-height: 100vh; padding: 60px 10%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        
        .vsepr-wrapper .btn { background: linear-gradient(135deg, var(--cyan-glow), var(--purple-med)); border: none; padding: 12px 24px; color: #fff; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
        .vsepr-wrapper .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6); }
        .vsepr-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; margin-right: 10px; margin-bottom: 10px; }
        .vsepr-wrapper .btn-outline:hover, .vsepr-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); box-shadow: 0 0 10px rgba(6, 182, 212, 0.5); border-color: var(--cyan-glow); color: #fff; }
        
        .vsepr-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .vsepr-wrapper .panel { background: var(--bg-panel); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .vsepr-wrapper .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .vsepr-wrapper .summary-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--primary-blue); border-radius: 12px; padding: 25px; transition: all 0.3s; box-shadow: inset 0 0 20px rgba(14, 165, 233, 0.05); }
        .vsepr-wrapper .summary-card:hover { transform: translateY(-10px); box-shadow: 0 10px 30px rgba(14, 165, 233, 0.2); border-color: var(--cyan-glow); }
        .vsepr-wrapper .card-icon { font-size: 2.5rem; margin-bottom: 15px; }
        .vsepr-wrapper .tag { display: inline-block; background: rgba(239, 68, 68, 0.15); color: #fca5a5; padding: 4px 10px; border-radius: 4px; font-size: 12px; margin-top: 10px; border: 1px solid var(--alert-red); }
        
        .vsepr-wrapper .svg-container { display: flex; align-items: center; justify-content: center; flex-direction: column; border: 2px dashed var(--cyan-glow); border-radius: 16px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; position: relative; min-height: 400px; }
        .vsepr-wrapper .data-box { display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #334155; text-align: center; }
        .vsepr-wrapper .data-val { font-size: 24px; font-weight: bold; color: var(--cyan-glow); margin-top: 5px; }
        
        .vsepr-wrapper .quiz-item { margin-bottom: 25px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; border-left: 3px solid var(--primary-blue); }
        .vsepr-wrapper .quiz-item p { margin-top: 0; font-weight: bold; }
        .vsepr-wrapper .quiz-item label { display: block; margin: 8px 0; cursor: pointer; padding: 8px; border-radius: 5px; transition: 0.2s; background: rgba(255,255,255,0.05); }
        .vsepr-wrapper .quiz-item label:hover { background: rgba(255,255,255,0.15); }
        
        .vsepr-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--cyan-glow), var(--purple-med)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(6, 182, 212, 0.6); z-index: 100; transition: transform 0.3s; }
        .vsepr-wrapper .ai-bot:hover { transform: scale(1.1); }
        .vsepr-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: var(--bg-dark); border: 1px solid var(--cyan-glow); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
        .vsepr-wrapper .ai-chat-window input { width: calc(100% - 22px); padding: 10px; border-radius: 6px; border: none; margin-top: 10px; background: #1e293b; color: #fff;}
        .vsepr-wrapper .formula-box { background: rgba(0,0,0,0.4); padding: 10px 15px; border-radius: 6px; font-family: monospace; color: var(--life-green); word-break: break-all; margin: 10px 0; border-left: 3px solid var(--life-green); font-size: 16px; text-align: center;}
      `}</style>

      <section id="hero" style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)' }}>
        <svg width="300" height="200" viewBox="0 0 300 200" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 20px var(--cyan-glow))' }}>
          <ellipse cx="150" cy="100" rx="80" ry="25" fill="none" stroke="var(--cyan-glow)" strokeWidth="2" transform="rotate(45 150 100)"/>
          <ellipse cx="150" cy="100" rx="80" ry="25" fill="none" stroke="var(--purple-med)" strokeWidth="2" transform="rotate(-45 150 100)"/>
          <ellipse cx="150" cy="100" rx="80" ry="25" fill="rgba(139, 92, 246, 0.3)" stroke="var(--pink-glow)" strokeWidth="2" transform="rotate(90 150 100)"/>
          <text x="150" y="30" fill="#fff" fontSize="24" fontWeight="bold" textAnchor="middle">..</text>
          <circle cx="150" cy="100" r="15" fill="#3b82f6"/>
          <circle cx="95" cy="155" r="10" fill="#10b981"/>
          <circle cx="205" cy="155" r="10" fill="#10b981"/>
          <path d="M 120,60 Q 150,110 180,60" fill="none" stroke="var(--alert-red)" strokeWidth="2"/>
        </svg>
        <h1 style={{ fontSize: '3rem', marginTop: '20px', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          微观几何：电子配对与VSEPR理论
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '40px' }}>“原子周围的电子云互相排斥，在三维空间中寻找最舒适的落脚点，从而塑造了分子的千姿百态。”</p>
        <button className="btn" onClick={() => document.getElementById('summary').scrollIntoView()}>揭秘构型推导规则 ↓</button>
      </section>

      <section id="summary" style={{ paddingTop: '20px' }}>
        <h2>模块一：理论要点与核心概念 (Theoretical Essentials)</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-icon">🔵</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>1. 路易斯电子点式</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>推导的基础在于画出分子的 Lewis 结构式。所有的价电子必须配对（成键电子对 BP 和未成键的孤电子对 LP），从而满足八隅体规则（少数例外）。</p>
          </div>
          <div className="summary-card">
            <div className="card-icon">📐</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>2. 价层电子对 (VP) 计算</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>价层电子对互斥理论 (VSEPR) 认为，中心原子的电子对会在空间中尽可能远离。核心公式：</p>
            <div className="formula-box">总电子对 (VP) = 成键对 (BP) + 孤电子对 (LP)</div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>VP 决定了电子的空间构型 (如 VP=4 为正四面体)。</p>
          </div>
          <div className="summary-card">
            <div className="card-icon">⚡</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>3. 排斥力递减法则</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>孤对电子(LP)只受中心原子核吸引，电子云更“胖”，占据更大空间。因此排斥力顺序为：</p>
            <div className="tag">LP-LP &gt; LP-BP &gt; BP-BP</div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>这种挤压使得实际分子的键角往往小于理想几何构型的键角（如 H₂O 键角被压缩至 104.5°）。</p>
          </div>
        </div>
      </section>

      <section id="module2">
        <h2>模块二：动态微观 —— 电子对排斥与分子几何构型</h2>
        <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {Object.keys(molData).map(key => (
            <button key={key} className={`btn-outline ${currentMol === key ? 'active' : ''}`} onClick={() => setCurrentMol(key)}>
              {molData[key].title}
            </button>
          ))}
        </div>

        <div className="grid-2">
          <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)' }}>{activeData.title}</h3>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6, height: '60px' }}>{activeData.desc}</p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div className="data-box" style={{ flex: 1, borderColor: 'var(--purple-med)' }}>
                <span style={{ fontSize:'12px', color:'#cbd5e1' }}>总电子对 (VP)</span>
                <span className="data-val" style={{ color: 'var(--purple-med)' }}>{activeData.vp}</span>
              </div>
              <div className="data-box" style={{ flex: 1, borderColor: 'var(--life-green)' }}>
                <span style={{ fontSize:'12px', color:'#cbd5e1' }}>成键电子对 (BP)</span>
                <span className="data-val" style={{ color: 'var(--life-green)' }}>{activeData.bp}</span>
              </div>
              <div className="data-box" style={{ flex: 1, borderColor: 'var(--alert-orange)' }}>
                <span style={{ fontSize:'12px', color:'#cbd5e1' }}>孤对电子 (LP)</span>
                <span className="data-val" style={{ color: 'var(--alert-orange)' }}>{activeData.lp}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', flex: 1 }}>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>电子对空间构型：</span><br/>
                <strong style={{ fontSize: '18px', color: '#fff' }}>{activeData.eGeom}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>实际分子构型 (去除孤对电子不可见部分)：</span><br/>
                <strong style={{ fontSize: '22px', color: 'var(--cyan-glow)' }}>{activeData.mGeom}</strong>
              </div>
            </div>
          </div>
          
          <div className="svg-container">
            <h3 style={{ marginTop: 0, color: '#fff', textShadow: '0 0 5px var(--cyan-glow)' }}>三维构型渲染</h3>
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
          <div className="panel" style={{ background: 'rgba(139, 92, 246, 0.1)', borderColor: 'var(--purple-med)' }}>
            <h3 style={{ color: 'var(--pink-glow)' }}>🚩 科学启迪：从现象到本质的逻辑跃迁</h3>
            <p><strong>1. 突破几何表象：</strong> 为什么同为 VP=4 的分子，甲烷、氨气、水分子的键角却依次递减（109.5° → 107.3° → 104.5°）？VSEPR 理论通过引入“孤对电子斥力更大”的概念，完美地用同一套微观规律解释了宏观的结构差异，体现了科学理论<strong>“透过现象看本质”</strong>的强大解释力。</p>
            <p><strong>2. 唯物辩证的普遍性：</strong> 空间构型其实是电子之间排斥力（对立）与原子核吸引力（统一）在三维空间中妥协、博弈的结果。这启示我们，世间万物的稳定状态，往往不是消灭矛盾，而是在矛盾中寻找动态的平衡点。</p>
          </div>
          <div>
            <h3>核心考点在线测评</h3>
            <div className="quiz-item">
              <p>1. 【VSEPR 构型推导】根据 VSEPR 理论，计算四氯化碘阴离子 (ICl₄⁻) 的价层电子对数(VP)及其实际的分子空间构型分别是？</p>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('A')} /> A. VP=4, 正四面体</label>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('B')} /> B. VP=6, 平面正方形 (Square Planar)</label>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('C')} /> C. VP=5, 变形四面体 (Seesaw)</label>
            </div>
            <div className="quiz-item">
              <p>2. 【键角比较与排斥理论】比较 H₂O、NH₃ 和 CH₄ 的键角大小，并选出造成这种差异的根本原因：</p>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('A')} /> A. CH₄ &gt; NH₃ &gt; H₂O；因为中心原子的电负性逐渐增大</label>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('B')} /> B. H₂O &gt; NH₃ &gt; CH₄；因为氢原子数量逐渐减少</label>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('C')} /> C. CH₄ &gt; NH₃ &gt; H₂O；因为孤对电子对成键电子对的空间排斥力更大 (LP-BP &gt; BP-BP)，导致键角被剧烈压缩</label>
            </div>
            <button className="btn" onClick={submitQuiz}>提交试卷检测</button>
            {quizResult.text && <p style={{ marginTop: '15px', fontWeight: 'bold', color: quizResult.color }}>{quizResult.text}</p>}
          </div>
        </div>
      </section>

      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '16px' }}>VSEPR AI 助教</h3>
          <div style={{ height: '200px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--cyan-glow)' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong> <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <input type="text" placeholder="输入问题，按回车发送..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleChat} />
        </div>
      )}
    </div>
  );
}