import React, { useState, useEffect, useRef } from 'react';

export default function MolecularOrbital() {
  const [currentMol, setCurrentMol] = useState('N2');
  const [mixLevel, setMixLevel] = useState(0);
  const [q1Ans, setQ1Ans] = useState('');
  const [q2Ans, setQ2Ans] = useState('');
  const [quizResult, setQuizResult] = useState({ text: '', color: '' });

  // AI 助教状态
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是你的无机化学 AI助教。关于“成键反键轨道、能级交错或是自由基”，你有什么疑问吗？\n(例如您可以问：“NO是一氧化氮，它为什么含有单电子？它的磁性如何？”)' }
  ]);
  const chatEndRef = useRef(null);

  // 核心数据库
  const molData = {
    'N2': {
      name: 'N₂', title: 'N₂ (氮气)', atomL: 'N (2s² 2p³)', atomR: 'N (2s² 2p³)',
      desc: '第二周期同族双原子分子。2s与2p能量相近，发生显著的s-p相互作用，导致 σ<sub>2p</sub> 能级越过 π<sub>2p</sub>。',
      sp_mixing: true, config: 'KK (σ<sub>2s</sub>)² (σ*<sub>2s</sub>)² (π<sub>2p</sub>)⁴ (σ<sub>2p</sub>)²',
      bo: 3.0, boStr: '(8 - 2) / 2', mag: '抗磁性', magStr: '0个未成对电子',
      electrons: { L: { '2s': 2, '2p': 3 }, R: { '2s': 2, '2p': 3 }, MO: { 's2s': 2, 's2s_s': 2, 'p2p': 4, 's2p': 2, 'p2p_s': 0, 's2p_s': 0 } }
    },
    'O2': {
      name: 'O₂', title: 'O₂ (氧气)', atomL: 'O (2s² 2p⁴)', atomR: 'O (2s² 2p⁴)',
      desc: '随着核电荷增加，2s与2p能量差拉大，s-p混杂不明显。正常的能级顺序：σ<sub>2p</sub> 低于 π<sub>2p</sub>。',
      sp_mixing: false, config: 'KK (σ<sub>2s</sub>)² (σ*<sub>2s</sub>)² (σ<sub>2p</sub>)² (π<sub>2p</sub>)⁴ (π*<sub>2p</sub>)²',
      bo: 2.0, boStr: '(8 - 4) / 2', mag: '顺磁性', magStr: '2个未成对电子(在π*轨道)',
      electrons: { L: { '2s': 2, '2p': 4 }, R: { '2s': 2, '2p': 4 }, MO: { 's2s': 2, 's2s_s': 2, 's2p': 2, 'p2p': 4, 'p2p_s': 2, 's2p_s': 0 } }
    },
    'O2_minus': {
      name: 'O₂⁻', title: 'O₂⁻ (超氧根负离子)', atomL: 'O (2s² 2p⁴)', atomR: 'O⁻ (2s² 2p⁵)',
      desc: '氧分子获得一个电子，该电子填入 π*<sub>2p</sub> 反键轨道。导致键级下降，稳定性减弱。是人体衰老的自由基元凶之一。',
      sp_mixing: false, config: 'KK (σ<sub>2s</sub>)² (σ*<sub>2s</sub>)² (σ<sub>2p</sub>)² (π<sub>2p</sub>)⁴ (π*<sub>2p</sub>)³',
      bo: 1.5, boStr: '(8 - 5) / 2', mag: '顺磁性', magStr: '1个未成对电子(自由基)',
      electrons: { L: { '2s': 2, '2p': 4 }, R: { '2s': 2, '2p': 5 }, MO: { 's2s': 2, 's2s_s': 2, 's2p': 2, 'p2p': 4, 'p2p_s': 3, 's2p_s': 0 } }
    },
    'NO': {
      name: 'NO', title: 'NO (一氧化氮)', atomL: 'N (2s² 2p³)', atomR: 'O (2s² 2p⁴)',
      desc: '异核双原子分子。因氧电负性大，总体能级接近O2排布规律。奇数电子分子，存在一个未配对的反键电子。',
      sp_mixing: false, config: 'KK (σ<sub>2s</sub>)² (σ*<sub>2s</sub>)² (σ<sub>2p</sub>)² (π<sub>2p</sub>)⁴ (π*<sub>2p</sub>)¹',
      bo: 2.5, boStr: '(8 - 3) / 2', mag: '顺磁性', magStr: '1个未成对电子',
      electrons: { L: { '2s': 2, '2p': 3 }, R: { '2s': 2, '2p': 4 }, MO: { 's2s': 2, 's2s_s': 2, 's2p': 2, 'p2p': 4, 'p2p_s': 1, 's2p_s': 0 } }
    },
    'CO': {
      name: 'CO', title: 'CO (一氧化碳)', atomL: 'C (2s² 2p²)', atomR: 'O (2s² 2p⁴)',
      desc: '异核双原子分子，与N2等电子体。由于C原子的参与，依然存在 s-p 混杂现象，σ<sub>2p</sub> 能量高于 π<sub>2p</sub>。',
      sp_mixing: true, config: 'KK (σ<sub>2s</sub>)² (σ*<sub>2s</sub>)² (π<sub>2p</sub>)⁴ (σ<sub>2p</sub>)²',
      bo: 3.0, boStr: '(8 - 2) / 2', mag: '抗磁性', magStr: '0个未成对电子',
      electrons: { L: { '2s': 2, '2p': 2 }, R: { '2s': 2, '2p': 4 }, MO: { 's2s': 2, 's2s_s': 2, 'p2p': 4, 's2p': 2, 'p2p_s': 0, 's2p_s': 0 } }
    }
  };

  const activeData = molData[currentMol];

  // 轨道透明度推演
  const aoOpacity = 1 - (mixLevel / 100) * 0.8;
  const moOpacity = mixLevel / 100;
  const lineOpacity = mixLevel > 20 && mixLevel < 80 ? 1 : 0.2;

  const pos = { AO_2p: 20, AO_2s: 80, MO_s2p_s: 5, MO_p2p_s: 25, MO_s2p: 45, MO_p2p: 60, MO_s2s_s: 75, MO_s2s: 90 };
  if (activeData.sp_mixing) { pos.MO_s2p = 60; pos.MO_p2p = 45; }

  const getArrow = (count, boxCount = 1) => {
    if (count === 0) return boxCount === 1 ? '' : (boxCount === 2 ? ['',''] : ['','','']);
    if (boxCount === 1) return count === 1 ? '↑' : '↑↓';
    if (boxCount === 2) {
      if (count === 1) return ['↑', '']; if (count === 2) return ['↑', '↑'];
      if (count === 3) return ['↑↓', '↑']; if (count === 4) return ['↑↓', '↑↓'];
    }
    if (boxCount === 3) {
      if (count === 1) return ['↑', '', '']; if (count === 2) return ['↑', '↑', ''];
      if (count === 3) return ['↑', '↑', '↑']; if (count === 4) return ['↑↓', '↑', '↑'];
      if (count === 5) return ['↑↓', '↑↓', '↑']; if (count === 6) return ['↑↓', '↑↓', '↑↓'];
    }
    return '';
  };

  const submitQuiz = () => {
    if (q1Ans === 'B' && q2Ans === 'B') {
      setQuizResult({ text: "✅ 回答完美！你深刻理解了自由基成因、反键轨道的破坏力，以及能级交错现象背后的 s-p 相互排斥本质。", color: "var(--life-green)" });
    } else {
      setQuizResult({ text: "❌ 回答有误。提示：负离子多出的电子往往被逼进入反键轨道；N的核电荷较小，2s与2p能量靠近，容易产生排斥混杂。", color: "var(--alert-orange)" });
    }
  };

  const handleChat = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: "NO（一氧化氮）的总价电子数是 5(N) + 6(O) = 11，是奇数。多出的1个电子必须独占能量较高的 π*₂p 反键轨道。正因为存在这个未成对的单电子，NO表现为顺磁性，且化学性质极其活泼（作为体内重要的信号分子传递信息）。" }]);
      }, 1000);
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  return (
    <div className="mot-wrapper">
      <style>{`
        .mot-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(20, 30, 48, 0.7); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --pink-glow: #ec4899; --text-main: #f8fafc; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
        .mot-wrapper h1, .mot-wrapper h2, .mot-wrapper h3, .mot-wrapper h4 { color: var(--cyan-glow); }
        .mot-wrapper h2 { border-left: 5px solid var(--pink-glow); padding-left: 15px; margin-bottom: 30px; }
        .mot-wrapper section { min-height: 100vh; padding: 60px 10%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .mot-wrapper .btn { background: linear-gradient(135deg, var(--primary-blue), var(--purple-med)); border: none; padding: 12px 24px; color: #fff; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
        .mot-wrapper .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6); }
        .mot-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; margin-bottom: 10px; margin-right: 10px; }
        .mot-wrapper .btn-outline:hover, .mot-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); box-shadow: 0 0 10px rgba(6, 182, 212, 0.5); border-color: var(--cyan-glow); color: #fff; }
        .mot-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1.2fr; gap: 40px; }
        .mot-wrapper .panel { background: var(--bg-panel); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .mot-wrapper .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .mot-wrapper .summary-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--primary-blue); border-radius: 12px; padding: 25px; transition: all 0.3s; box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.05); }
        .mot-wrapper .summary-card:hover { transform: translateY(-10px); box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2); border-color: var(--pink-glow); }
        .mot-wrapper .card-icon { font-size: 2.5rem; margin-bottom: 15px; }
        .mot-wrapper .tag { display: inline-block; background: rgba(236, 72, 153, 0.15); color: #f472b6; padding: 4px 10px; border-radius: 4px; font-size: 12px; margin-top: 10px; border: 1px solid var(--pink-glow); }
        .mot-wrapper .mo-diagram-container { display: flex; justify-content: space-between; align-items: stretch; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); border: 2px dashed var(--purple-med); border-radius: 16px; padding: 20px; position: relative; min-height: 480px; }
        .mot-wrapper .mo-col { display: flex; flex-direction: column; justify-content: space-between; width: 30%; position: relative; }
        .mot-wrapper .mo-col.center { width: 40%; align-items: center; justify-content: space-around; }
        .mot-wrapper .level-group { display: flex; flex-direction: column; align-items: center; position: absolute; width: 100%; transition: opacity 0.5s; }
        .mot-wrapper .mo-box-container { display: flex; gap: 8px; justify-content: center; align-items: center; margin-bottom: 5px; }
        .mot-wrapper .mo-box { width: 30px; height: 30px; border: 1px solid var(--cyan-glow); border-radius: 4px; display: flex; justify-content: center; align-items: center; font-size: 18px; color: #fff; background: rgba(6, 182, 212, 0.1); transition: all 0.5s; }
        .mot-wrapper .mo-box.antibonding { border-color: var(--pink-glow); background: rgba(236, 72, 153, 0.1); }
        .mot-wrapper .mo-box.filled { box-shadow: 0 0 10px rgba(6, 182, 212, 0.6); }
        .mot-wrapper .mo-box.antibonding.filled { box-shadow: 0 0 10px rgba(236, 72, 153, 0.6); }
        .mot-wrapper .level-label { font-size: 12px; color: #94a3b8; margin-top: 2px; }
        .mot-wrapper .svg-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; transition: opacity 0.5s; }
        .mot-wrapper .slider-wrapper { margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
        .mot-wrapper .quiz-item { margin-bottom: 25px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; border-left: 3px solid var(--purple-med); }
        .mot-wrapper .quiz-item label { display: block; margin: 8px 0; cursor: pointer; padding: 8px; border-radius: 5px; transition: 0.2s; background: rgba(255,255,255,0.05); }
        .mot-wrapper .quiz-item label:hover { background: rgba(255,255,255,0.15); }
        .mot-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--cyan-glow), var(--purple-med)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(6, 182, 212, 0.6); z-index: 100; transition: transform 0.3s; }
        .mot-wrapper .ai-bot:hover { transform: scale(1.1); }
        .mot-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: var(--bg-dark); border: 1px solid var(--cyan-glow); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
        .mot-wrapper .formula-box { background: rgba(0,0,0,0.4); padding: 10px; border-radius: 6px; font-family: monospace; color: var(--life-green); word-break: break-all; margin: 10px 0; border-left: 3px solid var(--life-green); }
      `}</style>

      <section id="hero" style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)' }}>
        <svg width="300" height="150" viewBox="0 0 300 150" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 15px var(--cyan-glow))' }}>
          <ellipse cx="100" cy="75" rx="60" ry="30" fill="rgba(6, 182, 212, 0.2)" stroke="var(--cyan-glow)" strokeWidth="2"/>
          <ellipse cx="200" cy="75" rx="60" ry="30" fill="rgba(236, 72, 153, 0.2)" stroke="var(--pink-glow)" strokeWidth="2"/>
          <circle cx="150" cy="75" r="10" fill="#fff"/>
          <text x="150" y="105" fill="#fff" fontSize="12" textAnchor="middle">MO 过渡区</text>
        </svg>
        <h1 style={{ fontSize: '3rem', marginTop: '20px', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--pink-glow))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          分子轨道理论 (MOT)：揭示分子稳定性与磁性
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '40px' }}>“当原子轨道线性组合，电子不再属于单个原子，而是属于整个分子。”</p>
        <button className="btn" onClick={() => document.getElementById('summary').scrollIntoView()}>开启 MO 探索 ↓</button>
      </section>

      <section id="summary" style={{ paddingTop: '20px' }}>
        <h2>模块一：理论要点与核心概念 (Theoretical Essentials)</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-icon">🌊</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>1. 原子轨道的线性组合 (LCAO)</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>原理：</strong>分子轨道由成键原子的原子轨道波函数线性叠加而成。遵循三个原则：<strong>对称性匹配、能量相近、最大重叠</strong>。</p>
            <div className="tag">成键 vs 反键</div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>波函数同号相加产生能量低于原子的<strong>成键轨道(σ, π)</strong>；异号相减产生能量升高的<strong>反键轨道(σ*, π*)</strong>。</p>
          </div>
          <div className="summary-card">
            <div class="card-icon">⚖️</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>2. 键级计算与分子稳定性</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>定义：</strong>键级 (Bond Order) 衡量化学键的强度与稳定性。键级越大，键能越高，键长越短，分子越稳定。</p>
            <div className="formula-box" style={{ fontSize: '14px' }}>键级 = (成键电子数 - 反键电子数) / 2</div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>若键级 = 0，表示该分子无法稳定存在（如 He₂）。</p>
          </div>
          <div className="summary-card">
            <div class="card-icon">🧲</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>3. 分子的磁性判断</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>突破：</strong>MOT 成功解释了价键理论无法解释的 O₂ 顺磁性问题。根据洪特规则和泡利不相容原理填入电子：</p>
            <ul style={{ fontSize: '13px', color: '#cbd5e1', paddingLeft: '20px', lineHeight: 1.6 }}>
              <li><strong>顺磁性 (Paramagnetic)：</strong> 存在未成对单电子。</li>
              <li><strong>抗磁性 (Diamagnetic)：</strong> 所有电子均成对排布。</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="module2">
        <h2>模块二：动态微观 —— 分子轨道能级排布与计算</h2>
        <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {Object.keys(molData).map(key => (
            <button key={key} className={`btn-outline ${currentMol === key ? 'active' : ''}`} onClick={() => { setCurrentMol(key); setMixLevel(0); }}>
              <span dangerouslySetInnerHTML={{ __html: molData[key].name }}></span>
            </button>
          ))}
        </div>

        <div className="grid-2">
          <div className="panel">
            <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)' }} dangerouslySetInnerHTML={{ __html: activeData.title }}></h3>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6, height: '60px' }} dangerouslySetInnerHTML={{ __html: activeData.desc }}></p>
            
            <h4 style={{ color: '#94a3b8', borderBottom: '1px solid #334', paddingBottom: '5px' }}>分子轨道电子排布式</h4>
            <div className="formula-box" dangerouslySetInnerHTML={{ __html: activeData.config }}></div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', padding: '15px', borderRadius: '8px', borderLeft: '3px solid var(--life-green)' }}>
                <div style={{ color: 'var(--life-green)', fontSize: '12px' }}>键级 (Bond Order) 计算</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{activeData.bo.toFixed(1)}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{activeData.boStr}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(245,158,11,0.1)', padding: '15px', borderRadius: '8px', borderLeft: '3px solid var(--alert-orange)' }}>
                <div style={{ color: 'var(--alert-orange)', fontSize: '12px' }}>磁性 (Magnetism)</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{activeData.mag}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{activeData.magStr}</div>
              </div>
            </div>

            <div className="slider-wrapper">
              <label style={{ fontWeight: 'bold', color: '#fff' }}>轨道演化推演：</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>孤立原子 (AO)</span>
                <input type="range" min="0" max="100" value={mixLevel} onChange={(e) => setMixLevel(e.target.value)} style={{ flex: 1, accentColor: 'var(--pink-glow)' }} />
                <span style={{ color: 'var(--cyan-glow)', fontSize: '12px' }}>成键分子 (MO)</span>
              </div>
            </div>
          </div>
          
          <div className="mo-diagram-container">
            <svg className="svg-lines" style={{ opacity: lineOpacity }}>
              <line x1="15%" y1={`${pos.AO_2p+3}%`} x2="50%" y2={`${pos.MO_s2p_s+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
              <line x1="85%" y1={`${pos.AO_2p+3}%`} x2="50%" y2={`${pos.MO_s2p_s+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
              <line x1="15%" y1={`${pos.AO_2p+3}%`} x2="50%" y2={`${pos.MO_p2p_s+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
              <line x1="85%" y1={`${pos.AO_2p+3}%`} x2="50%" y2={`${pos.MO_p2p_s+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
              <line x1="15%" y1={`${pos.AO_2p+3}%`} x2="50%" y2={`${pos.MO_s2p+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
              <line x1="85%" y1={`${pos.AO_2p+3}%`} x2="50%" y2={`${pos.MO_s2p+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
              <line x1="15%" y1={`${pos.AO_2p+3}%`} x2="50%" y2={`${pos.MO_p2p+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
              <line x1="85%" y1={`${pos.AO_2p+3}%`} x2="50%" y2={`${pos.MO_p2p+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
              <line x1="15%" y1={`${pos.AO_2s+3}%`} x2="50%" y2={`${pos.MO_s2s_s+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
              <line x1="85%" y1={`${pos.AO_2s+3}%`} x2="50%" y2={`${pos.MO_s2s_s+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
              <line x1="15%" y1={`${pos.AO_2s+3}%`} x2="50%" y2={`${pos.MO_s2s+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
              <line x1="85%" y1={`${pos.AO_2s+3}%`} x2="50%" y2={`${pos.MO_s2s+3}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4"/>
            </svg>
            
            <div className="mo-col" style={{ opacity: aoOpacity }}>
              <div style={{ position: 'absolute', top: '-20px', width: '100%', textAlign: 'center', color: '#94a3b8', fontWeight: 'bold' }}>{activeData.atomL}</div>
              <div className="level-group" style={{ top: `${pos.AO_2p}%` }}>
                <div className="mo-box-container">
                  {getArrow(activeData.electrons.L['2p'], 3).map((a, i) => <div key={i} className="mo-box">{a}</div>)}
                </div><div className="level-label">2p</div>
              </div>
              <div className="level-group" style={{ top: `${pos.AO_2s}%` }}>
                <div className="mo-box-container"><div className="mo-box">{getArrow(activeData.electrons.L['2s'], 1)}</div></div>
                <div className="level-label">2s</div>
              </div>
            </div>
            
            <div className="mo-col center" style={{ opacity: moOpacity }}>
              <div style={{ position: 'absolute', top: '-20px', width: '100%', textAlign: 'center', color: 'var(--cyan-glow)', fontWeight: 'bold' }} dangerouslySetInnerHTML={{ __html: `${activeData.name} 轨道` }}></div>
              
              <div className="level-group" style={{ top: `${pos.MO_s2p_s}%` }}>
                <div className="mo-box-container"><div className={`mo-box antibonding ${getArrow(activeData.electrons.MO['s2p_s'], 1)?'filled':''}`}>{getArrow(activeData.electrons.MO['s2p_s'], 1)}</div></div>
                <div className="level-label" style={{ color: 'var(--pink-glow)' }} dangerouslySetInnerHTML={{__html: 'σ*<sub>2p</sub>'}}></div>
              </div>
              
              <div className="level-group" style={{ top: `${pos.MO_p2p_s}%` }}>
                <div className="mo-box-container">
                  {getArrow(activeData.electrons.MO['p2p_s'], 2).map((a, i) => <div key={i} className={`mo-box antibonding ${a?'filled':''}`}>{a}</div>)}
                </div><div className="level-label" style={{ color: 'var(--pink-glow)' }} dangerouslySetInnerHTML={{__html: 'π*<sub>2p</sub>'}}></div>
              </div>

              <div className="level-group" style={{ top: `${pos.MO_s2p}%` }}>
                <div className="mo-box-container"><div className={`mo-box ${getArrow(activeData.electrons.MO['s2p'], 1)?'filled':''}`}>{getArrow(activeData.electrons.MO['s2p'], 1)}</div></div>
                <div className="level-label" style={{ color: 'var(--cyan-glow)' }} dangerouslySetInnerHTML={{__html: 'σ<sub>2p</sub>'}}></div>
              </div>

              <div className="level-group" style={{ top: `${pos.MO_p2p}%` }}>
                <div className="mo-box-container">
                  {getArrow(activeData.electrons.MO['p2p'], 2).map((a, i) => <div key={i} className={`mo-box ${a?'filled':''}`}>{a}</div>)}
                </div><div className="level-label" style={{ color: 'var(--cyan-glow)' }} dangerouslySetInnerHTML={{__html: 'π<sub>2p</sub>'}}></div>
              </div>

              <div className="level-group" style={{ top: `${pos.MO_s2s_s}%` }}>
                <div className="mo-box-container"><div className={`mo-box antibonding ${getArrow(activeData.electrons.MO['s2s_s'], 1)?'filled':''}`}>{getArrow(activeData.electrons.MO['s2s_s'], 1)}</div></div>
                <div className="level-label" style={{ color: 'var(--pink-glow)' }} dangerouslySetInnerHTML={{__html: 'σ*<sub>2s</sub>'}}></div>
              </div>

              <div className="level-group" style={{ top: `${pos.MO_s2s}%` }}>
                <div className="mo-box-container"><div className={`mo-box ${getArrow(activeData.electrons.MO['s2s'], 1)?'filled':''}`}>{getArrow(activeData.electrons.MO['s2s'], 1)}</div></div>
                <div className="level-label" style={{ color: 'var(--cyan-glow)' }} dangerouslySetInnerHTML={{__html: 'σ<sub>2s</sub>'}}></div>
              </div>
            </div>
            
            <div className="mo-col" style={{ opacity: aoOpacity }}>
              <div style={{ position: 'absolute', top: '-20px', width: '100%', textAlign: 'center', color: '#94a3b8', fontWeight: 'bold' }}>{activeData.atomR}</div>
              <div className="level-group" style={{ top: `${pos.AO_2p}%` }}>
                <div className="mo-box-container">
                  {getArrow(activeData.electrons.R['2p'], 3).map((a, i) => <div key={i} className="mo-box">{a}</div>)}
                </div><div className="level-label">2p</div>
              </div>
              <div className="level-group" style={{ top: `${pos.AO_2s}%` }}>
                <div className="mo-box-container"><div className="mo-box">{getArrow(activeData.electrons.R['2s'], 1)}</div></div>
                <div className="level-label">2s</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="module3">
        <h2>模块三：教学闭环 —— 随堂挑战与科学启迪</h2>
        <div className="grid-2">
          <div className="panel" style={{ background: 'rgba(139, 92, 246, 0.1)', borderColor: 'var(--purple-med)' }}>
            <h3 style={{ color: 'var(--pink-glow)' }}>🚩 科学启迪：科学发展的否定之否定</h3>
            <p><strong>1. 突破经典理论的局限：</strong> 经典的价键理论(VB)认为 O₂ 中所有电子配对，应当是抗磁性的，但这与液氧能被磁铁吸引的客观实验相悖。分子轨道理论的诞生打破了这一困境，体现了科学认识是<strong>螺旋式上升、否定之否定</strong>的过程。实践是检验真理的唯一标准，理论必须服从事实。</p>
            <p><strong>2. 整体与部分的关系：</strong> 在 MOT 中，电子不再局限于单个原子，而是归属于整个分子系统。这蕴含着深刻的系统论哲学：<strong>整体不等于部分之和</strong>，原子轨道的重新组合产生了全新的分子性质。在医药研究与新材料设计中，我们也必须建立大局观和系统思维。</p>
          </div>
          <div>
            <h3>核心考点在线测评</h3>
            <div className="quiz-item">
              <p>1. 【键级与稳定性判断】O₂ 得到一个电子形成超氧根负离子 (O₂⁻) 时，电子会填入哪个轨道？这会导致键级如何变化？</p>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('A')} /> A. 填入成键轨道，键级变大，更稳定</label>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('B')} /> B. 填入 π*₂p 反键轨道，键级从2减小到1.5，稳定性下降</label>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('C')} /> C. 填入 σ*₂p 反键轨道，键级不变</label>
            </div>
            <div className="quiz-item">
              <p>2. 【能级交错现象】为什么 N₂ 的分子轨道排布中，σ₂p 轨道的能量会高出 π₂p 轨道？</p>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('A')} /> A. 因为氮原子的电负性特别大</label>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('B')} /> B. 因为2s与2p轨道能量相近，发生了 s-p 轨道间的相互排斥（混杂），使得 σ₂p 能量显著升高</label>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('C')} /> C. 泡利不相容原理强制要求电子换位排布</label>
            </div>
            <button className="btn" onClick={submitQuiz}>提交试卷检测</button>
            {quizResult.text && <p style={{ marginTop: '15px', fontWeight: 'bold', color: quizResult.color }}>{quizResult.text}</p>}
          </div>
        </div>
      </section>

      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '16px' }}>MO 理论 AI助教</h3>
          <div style={{ height: '200px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--cyan-glow)' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong> {msg.text}
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