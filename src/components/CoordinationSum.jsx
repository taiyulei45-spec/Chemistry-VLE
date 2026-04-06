import React, { useState, useEffect, useRef } from 'react';

export default function CoordinationEquilibrium() {
  const [fieldStrength, setFieldStrength] = useState(20);
  const [isChelated, setIsChelated] = useState(false);

  const [q1Ans, setQ1Ans] = useState('');
  const [q2Ans, setQ2Ans] = useState('');
  const [quizResult, setQuizResult] = useState({ text: '', color: '' });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是你的无机化学AI助教。关于“晶体场理论、顺铂构型或EDTA螯合热力学”，你有什么疑问吗？\n(例如您可以问：“为什么CO配位能力比氧气强那么多？光谱化学序列的本质是什么？”)' }
  ]);
  const chatEndRef = useRef(null);

  // 模块二：晶体场计算逻辑
  const isStrongField = fieldStrength > 60;
  const deltaO = 30 + (fieldStrength * 0.9);
  const baseY = 200;
  const t2g_Y = baseY + (deltaO * 0.4);
  const eg_Y = baseY - (deltaO * 0.6);

  const renderCFTSvg = () => {
    const drawElectron = (x, y, dir) => {
      let color = "#38bdf8";
      let arrow = dir === 'up' ? `M${x-4},${y-3} L${x},${y-12} L${x+4},${y-3} M${x},${y-12} L${x},${y+8}` : `M${x-4},${y+3} L${x},${y+12} L${x+4},${y+3} M${x},${y+12} L${x},${y-8}`;
      return `<path d="${arrow}" stroke="${color}" stroke-width="2" fill="none" />`;
    };

    let svg = `<svg width="100%" height="100%" viewBox="0 0 400 300">
      <text x="20" y="30" fill="#94a3b8" font-size="14">能量 E</text>
      <line x1="40" y1="280" x2="40" y2="40" stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
      <defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" /></marker></defs>
      <text x="50" y="240" fill="#64748b" font-size="12">简并 d 轨道</text>
      <line x1="60" y1="200" x2="90" y2="200" stroke="#64748b" stroke-width="3"/>
      <line x1="95" y1="200" x2="125" y2="200" stroke="#64748b" stroke-width="3"/>
      <line x1="130" y1="200" x2="160" y2="200" stroke="#64748b" stroke-width="3"/>
      <line x1="165" y1="200" x2="195" y2="200" stroke="#64748b" stroke-width="3"/>
      <line x1="200" y1="200" x2="230" y2="200" stroke="#64748b" stroke-width="3"/>
      
      <text x="350" y="${eg_Y + 5}" fill="var(--primary-plat)" font-size="14">e_g</text>
      <line x1="260" y1="${eg_Y}" x2="290" y2="${eg_Y}" stroke="var(--primary-plat)" stroke-width="3"/>
      <line x1="300" y1="${eg_Y}" x2="330" y2="${eg_Y}" stroke="var(--primary-plat)" stroke-width="3"/>
      
      <text x="350" y="${t2g_Y + 5}" fill="var(--primary-plat)" font-size="14">t_2g</text>
      <line x1="240" y1="${t2g_Y}" x2="270" y2="${t2g_Y}" stroke="var(--primary-plat)" stroke-width="3"/>
      <line x1="280" y1="${t2g_Y}" x2="310" y2="${t2g_Y}" stroke="var(--primary-plat)" stroke-width="3"/>
      <line x1="320" y1="${t2g_Y}" x2="350" y2="${t2g_Y}" stroke="var(--primary-plat)" stroke-width="3"/>
      
      <line x1="220" y1="${eg_Y}" x2="240" y2="${eg_Y}" stroke="#ef4444" stroke-width="1" stroke-dasharray="2"/>
      <line x1="220" y1="${t2g_Y}" x2="240" y2="${t2g_Y}" stroke="#ef4444" stroke-width="1" stroke-dasharray="2"/>
      <path d="M 230,${eg_Y} L 230,${t2g_Y}" fill="none" stroke="#ef4444" stroke-width="2" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
      <text x="195" y="${baseY}" fill="#ef4444" font-weight="bold">Δo</text>
    `;

    if (!isStrongField) {
      svg += drawElectron(250, t2g_Y, 'up') + drawElectron(260, t2g_Y, 'down');
      svg += drawElectron(295, t2g_Y, 'up') + drawElectron(335, t2g_Y, 'up');
      svg += drawElectron(275, eg_Y, 'up') + drawElectron(315, eg_Y, 'up');
    } else {
      svg += drawElectron(250, t2g_Y, 'up') + drawElectron(260, t2g_Y, 'down');
      svg += drawElectron(290, t2g_Y, 'up') + drawElectron(300, t2g_Y, 'down');
      svg += drawElectron(330, t2g_Y, 'up') + drawElectron(340, t2g_Y, 'down');
      svg += `<text x="290" y="${t2g_Y + 30}" fill="var(--heme-red)" font-weight="bold" font-size="16" text-anchor="middle" opacity="0.8">极高晶体场稳定化能 (CFSE)! 毒性锁定!<animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite"/></text>`;
    }
    svg += `</svg>`;
    return { __html: svg };
  };

  const renderEDTASvg = () => {
    let svg = `<svg width="100%" height="100%" viewBox="0 0 400 250">
      <text x="200" y="30" fill="#94a3b8" font-size="14" text-anchor="middle">水溶液中的游离铅离子 (毒性沉积态)</text>
      <circle cx="200" cy="130" r="18" fill="#64748b"/>
      <text x="200" y="135" fill="#fff" font-weight="bold" font-size="14" text-anchor="middle">Pb²⁺</text>`;
    
    if (!isChelated) {
      for(let i=0; i<6; i++) {
        let angle = (i * 60) * Math.PI / 180;
        let x = 200 + 60 * Math.cos(angle); let y = 130 + 60 * Math.sin(angle);
        svg += `<g><line x1="200" y1="130" x2="${x}" y2="${y}" stroke="#475569" stroke-width="2" stroke-dasharray="3"/><circle cx="${x}" cy="${y}" r="12" fill="var(--primary-plat)"/><text x="${x}" y="${y+4}" fill="#000" font-size="10" text-anchor="middle">H₂O</text></g>`;
      }
      svg += `<text x="200" y="230" fill="var(--primary-plat)" font-size="16" font-weight="bold" text-anchor="middle">微粒总数: 2 (1个水合铅离子 + 1个待反应的EDTA)</text>`;
    } else {
      svg += `<path d="M 170,80 Q 200,60 230,80 Q 260,130 230,180 Q 200,200 170,180 Q 140,130 170,80 Z" fill="rgba(16,185,129,0.2)" stroke="var(--life-green)" stroke-width="4"/>
      <circle cx="170" cy="80" r="8" fill="var(--life-green)"/><text x="170" y="83" fill="#fff" font-size="8" text-anchor="middle">O</text>
      <circle cx="230" cy="80" r="8" fill="var(--life-green)"/><text x="230" y="83" fill="#fff" font-size="8" text-anchor="middle">O</text>
      <circle cx="150" cy="130" r="8" fill="#38bdf8"/><text x="150" y="133" fill="#fff" font-size="8" text-anchor="middle">N</text>
      <circle cx="250" cy="130" r="8" fill="#38bdf8"/><text x="250" y="133" fill="#fff" font-size="8" text-anchor="middle">N</text>
      <circle cx="170" cy="180" r="8" fill="var(--life-green)"/><text x="170" y="183" fill="#fff" font-size="8" text-anchor="middle">O</text>
      <circle cx="230" cy="180" r="8" fill="var(--life-green)"/><text x="230" y="183" fill="#fff" font-size="8" text-anchor="middle">O</text>
      <text x="200" y="90" fill="var(--life-green)" font-weight="bold" font-size="12" text-anchor="middle">EDTA⁴⁻</text>`;
      for(let i=0; i<6; i++) {
        let angle = (i * 60) * Math.PI / 180;
        let xStart = 200 + 80 * Math.cos(angle); let yStart = 130 + 80 * Math.sin(angle);
        let xEnd = 200 + 150 * Math.cos(angle); let yEnd = 130 + 150 * Math.sin(angle);
        svg += `<g><circle cx="${xStart}" cy="${yStart}" r="10" fill="rgba(203, 213, 225, 0.5)"><animate attributeName="cx" values="${xStart}; ${xEnd}" dur="2s" fill="freeze"/><animate attributeName="cy" values="${yStart}; ${yEnd}" dur="2s" fill="freeze"/><animate attributeName="opacity" values="1; 0" dur="2s" fill="freeze"/></circle><text x="${xStart}" y="${yStart+3}" fill="#fff" font-size="8" text-anchor="middle">H₂O<animate attributeName="x" values="${xStart}; ${xEnd}" dur="2s" fill="freeze"/><animate attributeName="y" values="${yStart+3}; ${yEnd+3}" dur="2s" fill="freeze"/><animate attributeName="opacity" values="1; 0" dur="2s" fill="freeze"/></text></g>`;
      }
      svg += `<text x="200" y="230" fill="var(--sz-gold)" font-size="16" font-weight="bold" text-anchor="middle">微粒总数: 7 (1个螯合物 + 6个被释放的水分子) -&gt; 熵剧烈增大 (ΔS&gt;0)!</text>`;
    }
    svg += `</svg>`;
    return { __html: svg };
  };

  const submitQuiz = () => {
    if (q1Ans === 'B' && q2Ans === 'C') {
      setQuizResult({ text: "✅ 回答完美！您精准掌握了价键理论与抗癌机制的联系，以及螯合效应底层的热力学规律！", color: "var(--life-green)" });
    } else {
      setQuizResult({ text: "❌ 存在错误。提示：铂为d8排布常形成平面正方形；多齿配位导致的颗粒数增加属于系统混乱度（熵）增加。", color: "var(--alert-orange)" });
    }
  };

  const handleChat = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: "非常好的问题！CO 作为配体比氧气强很多，根本原因在于**反馈 π 键 (π-backbonding)**。CO 的碳端不仅有孤对电子形成 σ 键，更致命的是，它的碳氧键具有极低能量的**空反键 π* 轨道**。中心铁离子的 d 电子会“倒流”回 CO 的空轨道，这种“推-拉 (Push-Pull)”协同效应导致中心金属的 t2g 能级被剧烈拉低，从而产生极其巨大的晶体场分裂能 Δo，这就是 CO 引起不可逆窒息的量子本质！" }]);
      }, 1000);
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  return (
    <div className="equilibrium-wrapper">
      <style>{`
        .equilibrium-wrapper { --bg-dark: #0f172a; --bg-panel: rgba(30, 41, 59, 0.75); --primary-plat: #cbd5e1; --heme-red: #e11d48; --life-green: #10b981; --alert-orange: #f59e0b; --text-main: #f8fafc; --sz-gold: #fbbf24; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
        .equilibrium-wrapper h1, .equilibrium-wrapper h2, .equilibrium-wrapper h3, .equilibrium-wrapper h4 { color: var(--primary-plat); }
        .equilibrium-wrapper h2 { border-left: 5px solid var(--heme-red); padding-left: 15px; margin-bottom: 30px; }
        .equilibrium-wrapper section { min-height: 100vh; padding: 60px 10%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .equilibrium-wrapper .btn { background: linear-gradient(135deg, var(--heme-red), #9f1239); border: none; padding: 12px 24px; color: #fff; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(225, 29, 72, 0.3); }
        .equilibrium-wrapper .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(225, 29, 72, 0.6); }
        .equilibrium-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .equilibrium-wrapper .panel { background: var(--bg-panel); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .equilibrium-wrapper .slider-group { margin-bottom: 20px; }
        .equilibrium-wrapper .slider-group label { display: block; margin-bottom: 8px; font-weight: bold; color: var(--primary-plat); }
        .equilibrium-wrapper input[type="range"] { width: 100%; accent-color: var(--heme-red); }
        .equilibrium-wrapper .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .equilibrium-wrapper .summary-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--heme-red); border-radius: 12px; padding: 25px; transition: all 0.3s; box-shadow: inset 0 0 20px rgba(225, 29, 72, 0.05); }
        .equilibrium-wrapper .summary-card:hover { transform: translateY(-10px); border-color: var(--primary-plat); }
        .equilibrium-wrapper .card-icon { font-size: 2.5rem; margin-bottom: 15px; }
        .equilibrium-wrapper .tag-medicine { display: inline-block; background: rgba(225, 29, 72, 0.15); color: #fda4af; padding: 4px 10px; border-radius: 4px; font-size: 12px; margin-top: 10px; border: 1px solid var(--heme-red); }
        .equilibrium-wrapper .svg-container { display: flex; align-items: center; justify-content: center; flex-direction: column; border: 2px dashed var(--heme-red); border-radius: 16px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; position: relative; min-height: 400px; overflow: hidden; }
        .equilibrium-wrapper .quiz-item { margin-bottom: 25px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; border-left: 3px solid var(--heme-red); }
        .equilibrium-wrapper .quiz-item p { margin-top: 0; font-weight: bold; }
        .equilibrium-wrapper .quiz-item label { display: block; margin: 8px 0; cursor: pointer; padding: 8px; border-radius: 5px; transition: 0.2s; background: rgba(255,255,255,0.05); }
        .equilibrium-wrapper .quiz-item label:hover { background: rgba(255,255,255,0.15); }
        .equilibrium-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--heme-red), #9f1239); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(225, 29, 72, 0.6); z-index: 100; transition: transform 0.3s; }
        .equilibrium-wrapper .ai-bot:hover { transform: scale(1.1); }
        .equilibrium-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: var(--bg-dark); border: 1px solid var(--heme-red); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
        .equilibrium-wrapper .ai-chat-window input { width: calc(100% - 22px); padding: 10px; border-radius: 6px; border: none; margin-top: 10px; background: #1e293b; color: #fff;}
      `}</style>

      <section id="hero" style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #2e0916 0%, var(--bg-dark) 100%)' }}>
        <svg width="300" height="200" viewBox="0 0 300 200" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 20px #e11d48)' }}>
          <circle cx="150" cy="100" r="30" fill="none" stroke="#cbd5e1" strokeWidth="4"/>
          <text x="150" y="105" fill="#cbd5e1" fontSize="20" fontWeight="bold" textAnchor="middle">Pt²⁺</text>
          <circle cx="90" cy="100" r="15" fill="#10b981"/><text x="90" y="104" fill="#fff" fontSize="10" textAnchor="middle">Cl⁻</text>
          <circle cx="150" cy="40" r="15" fill="#38bdf8"/><text x="150" y="44" fill="#fff" fontSize="10" textAnchor="middle">NH₃</text>
          <circle cx="210" cy="100" r="15" fill="#10b981"/><text x="210" y="104" fill="#fff" fontSize="10" textAnchor="middle">Cl⁻</text>
          <circle cx="150" cy="160" r="15" fill="#38bdf8"/><text x="150" y="164" fill="#fff" fontSize="10" textAnchor="middle">NH₃</text>
          <line x1="105" y1="100" x2="120" y2="100" stroke="#e11d48" strokeWidth="3" strokeDasharray="4"/>
          <line x1="150" y1="55" x2="150" y2="70" stroke="#e11d48" strokeWidth="3" strokeDasharray="4"/>
          <line x1="195" y1="100" x2="180" y2="100" stroke="#e11d48" strokeWidth="3" strokeDasharray="4"/>
          <line x1="150" y1="145" x2="150" y2="130" stroke="#e11d48" strokeWidth="3" strokeDasharray="4"/>
          <animateTransform attributeName="transform" type="rotate" values="0 150 100; 360 150 100" dur="15s" repeatCount="indefinite"/>
        </svg>
        <h1 style={{ fontSize: '3rem', marginTop: '20px', background: '-webkit-linear-gradient(45deg, #cbd5e1, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>生命配位：结构与药理的交响</h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '40px' }}>“从顺铂的抗癌奇迹，到血红蛋白的死亡锁死。配位键的得失，决定了生命的呼吸与存亡。”</p>
        <button className="btn" onClick={() => document.getElementById('summary').scrollIntoView()}>开启配位化学之旅 ↓</button>
      </section>

      <section id="summary" style={{ paddingTop: '20px' }}>
        <h2>理论先导：配位理论与药学核心应用</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-icon">🧬</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>1. 空间构型与靶向</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>化学本质：</strong>中心金属离子的杂化轨道类型决定了配合物的空间构型（如 dsp² 杂化形成平面正方形）。</p>
            <div className="tag-medicine">🔬 药学应用：顺铂抗癌</div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>顺铂[Pt(NH₃)₂Cl₂]凭借其精确的平面正方形构型，完美嵌入癌细胞 DNA 双螺旋的相邻鸟嘌呤上形成交联，阻断复制。反铂则因空间位阻无效。</p>
          </div>
          <div className="summary-card">
            <div className="card-icon">⚡</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>2. 晶体场理论 (CFT)</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>化学本质：</strong>不同场强的配体会导致中心离子 d 轨道发生不同程度的能级分裂 (Δo)，决定配合物的颜色、磁性和稳定性。</p>
            <div className="tag-medicine">🩸 药学应用：CO中毒机制</div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>CO 是极强场配体，迫使血红蛋白中 Fe²⁺ 的 d 电子全成对（低自旋），产生巨大的稳定化能（CFSE），将携氧通道“死死焊住”。</p>
          </div>
          <div className="summary-card">
            <div className="card-icon">🔄</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>3. 螯合效应与熵增</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>化学本质：</strong>多齿配体取代单齿水分子，使体系微粒数剧增，产生极大的混乱度增加（ΔS &gt; 0），热力学极度稳定。</p>
            <div className="tag-medicine">🚑 药学应用：重金属解毒</div>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>临床利用 EDTA（六齿配体）极强的螯合熵增效应，将骨骼或血液中沉积的铅 (Pb²⁺) 紧紧包裹成环状水溶性螯合物，随尿排出。</p>
          </div>
        </div>
      </section>

      <section id="module2">
        <h2>交互微观 一：晶体场分裂 (CFT) —— 一氧化碳“锁喉”的量子机制</h2>
        <div className="grid-2">
          <div className="panel">
            <h3>血红素中 Fe²⁺ (d⁶) 的轨道分裂战</h3>
            <p style={{ color:'#cbd5e1', fontSize:'14px', lineHeight: 1.6 }}>
              <strong>病理机制：</strong>正常呼吸时，O₂（中弱场配体）与血红蛋白 Fe²⁺ 结合，晶体场分裂能 (Δo) 较小，电子排布多为<strong>高自旋</strong>（易解离，方便释放氧气）。<br/>
              当吸入含有孤对电子且具极强 π 反馈键能力的 CO 时，配位场急剧增强，Δo 被极度拉大，迫使电子客服成对能全部挤入低能级，形成<strong>低自旋态</strong>，结合力暴增 200 倍以上！<br/><br/>
              👉 <strong>拖动滑块</strong>增强配体场强 (模拟从 O₂ 替换为 CO)，观察 d 轨道分裂与电子跃迁。
            </p>
            <div className="slider-group" style={{ marginTop: '20px' }}>
              <label>配体场强 (Ligand Field Strength): <span style={{ color: !isStrongField ? 'var(--life-green)' : 'var(--heme-red)', fontSize: '1.2em' }}>{!isStrongField ? '弱场 / 中等场 (如 H₂O, O₂)' : '极强场 (如 CO, CN⁻)'}</span></label>
              <input type="range" min="1" max="100" value={fieldStrength} onChange={e=>setFieldStrength(parseInt(e.target.value))} />
            </div>
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              分裂能与成对能：<strong style={{ color: !isStrongField ? 'var(--life-green)' : 'var(--heme-red)' }}>{!isStrongField ? 'Δo < P (分裂能小于电子成对能)' : 'Δo > P (分裂能极大，迫使电子克服斥力成对)'}</strong><br/>
              电子排布与磁性：<strong style={{ color: !isStrongField ? 'var(--life-green)' : 'var(--heme-red)' }}>{!isStrongField ? '高自旋态 (High Spin)，顺磁性 (4个未成对单电子)' : '低自旋态 (Low Spin)，抗磁性 (0个单电子)'}</strong><br/>
              临床宏观表现：<strong style={{ color: !isStrongField ? 'var(--life-green)' : 'var(--heme-red)' }}>{!isStrongField ? '可逆结合，正常运输与释放氧气' : '不可逆结合死锁！产生巨大稳定化能致窒息'}</strong>
            </div>
          </div>
          <div className="svg-container" style={{ background: '#0b0f19' }}>
            <div dangerouslySetInnerHTML={renderCFTSvg()} style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
      </section>

      <section id="module3">
        <h2>交互微观 二：螯合效应 (Chelate Effect) —— 熵驱动的重金属“囚笼”</h2>
        <div className="grid-2">
          <div className="svg-container" style={{ background: '#111827' }}>
            <div dangerouslySetInnerHTML={renderEDTASvg()} style={{ width: '100%', height: '100%' }}></div>
          </div>
          <div className="panel">
            <h3>热力学熵增 (ΔS &gt; 0) 的急救奇迹</h3>
            <p style={{ color:'#cbd5e1', lineHeight: 1.6 }}>
              <strong>解毒原理：</strong>单纯依靠生成焓（ΔH）不足以将沉积在骨骼中的铅离子彻底洗脱。EDTA（乙二胺四乙酸）通过六个配位原子（2个N，4个O）像“八爪鱼”一样包裹住 Pb²⁺。在这个过程中，原本包围 Pb²⁺ 的 6 个水分子被 1 个 EDTA 分子挤出：<br/>
              [Pb(H₂O)₆]²⁺ + EDTA⁴⁻ → [Pb(EDTA)]²⁻ + 6 H₂O<br/>
              反应前后，体系微粒数从 2 个变成了 7 个！这导致体系混乱度（熵 S）极度增加，极负的 ΔG 使得该螯合物坚不可摧。<br/><br/>
              👉 <strong>点击按钮</strong>观察水分子脱落与熵增过程：
            </p>
            <button className="btn" style={{ width: '100%', marginTop: '15px', background: 'var(--life-green)' }} onClick={()=>setIsChelated(true)}>🐙 滴注 EDTA 螯合剂 (观察熵增)</button>
            <button className="btn" style={{ width: '100%', marginTop: '15px', background: 'transparent', border: '1px solid var(--primary-plat)', color: 'var(--primary-plat)' }} onClick={()=>setIsChelated(false)}>🔄 恢复铅中毒水合态</button>
          </div>
        </div>
      </section>

      <section id="module4">
        <h2>教学闭环：课程思政与随堂挑战</h2>
        <div className="grid-2">
          <div className="panel" style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'var(--sz-gold)' }}>
            <h3 style={{ color: 'var(--sz-gold)' }}>🚩 课程思政：敬畏生命法则与科学探索精神</h3>
            <p><strong>1. 敬畏生命的“锁钥”法则：</strong> 顺铂的抗癌奇迹在于它 dsp² 杂化形成的完美“平面正方形”。仅仅是因为空间排布差之毫厘的“反铂”，就毫无抗癌活性。自然界用最严苛的空间几何法则筛选着生命的密码，提醒我们在药物研发中必须一丝不苟、心存敬畏。</p>
            <p><strong>2. 从表象到本质的唯物史观：</strong> 一氧化碳中毒，表象上是气体吸入，本质却是微观量子层面的“晶体场分裂与低自旋能量陷阱”。作为新时代的药学人，我们要学习透过临床病理的宏观现象，利用化学的底层逻辑去挖掘疾病的微观根源，这是马克思主义认识论在自然科学中的生动体现。</p>
          </div>
          <div>
            <h3>核心考点在线测评</h3>
            <div className="quiz-item">
              <p>1. 【空间构型与杂化】抗癌神药“顺铂”能有效抑制癌细胞 DNA 复制，这主要依赖于其独特的空间构型。中心 Pt²⁺ 的电子排布为 d⁸，其采用的杂化轨道类型及形成的配合物空间构型为：</p>
              <label><input type="radio" name="q1" onChange={()=>setQ1Ans('A')} /> A. sp³ 杂化，正四面体构型</label>
              <label><input type="radio" name="q1" onChange={()=>setQ1Ans('B')} /> B. dsp² 杂化，平面正方形构型</label>
              <label><input type="radio" name="q1" onChange={()=>setQ1Ans('C')} /> C. sp³d² 杂化，正八面体构型</label>
            </div>
            <div className="quiz-item">
              <p>2. 【螯合效应本质】在临床重金属中毒急救中，使用 EDTA 替代普通单齿配体氨水（NH₃）进行解毒，其生成的螯合物稳定性远高于氨配合物。从热力学角度看，这种超强稳定性的主要驱动力是：</p>
              <label><input type="radio" name="q2" onChange={()=>setQ2Ans('A')} /> A. 焓变驱动：形成了更多的配位键，释放大量热量 (ΔH ≪ 0)</label>
              <label><input type="radio" name="q2" onChange={()=>setQ2Ans('B')} /> B. 动力学驱动：活化能极低</label>
              <label><input type="radio" name="q2" onChange={()=>setQ2Ans('C')} /> C. 熵变驱动：多齿配体取代单齿溶剂分子，导致体系微粒数急剧增加，混乱度显著增大 (ΔS ≫ 0)</label>
            </div>
            <button className="btn" onClick={submitQuiz}>提交试卷检测</button>
            {quizResult.text && <p style={{ marginTop: '15px', fontWeight: 'bold', color: quizResult.color }}>{quizResult.text}</p>}
          </div>
        </div>
      </section>

      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
            <h3 style={{ marginTop: 0, color: 'var(--heme-red)', fontSize: '16px' }}>无机化学 AI 助教</h3>
            <div style={{ height: '180px', overflowY: 'auto', fontSize: '14px', marginBottom: '10px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--primary-plat)' : '#fff' }}>
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