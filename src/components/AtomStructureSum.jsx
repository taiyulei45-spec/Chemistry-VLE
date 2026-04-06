import React, { useState, useEffect, useRef } from 'react';

export default function AtomStructureLab() {
  // ==========================================
  // 状态管理区
  // ==========================================
  // 模块二：量子数状态
  const [n, setN] = useState(3);
  const [l, setL] = useState(2);
  const [m, setM] = useState(0);
  const [showSlice, setShowSlice] = useState(false);

  // 模块三：核外电子排布状态
  const [pool, setPool] = useState([
    { id: 'e1', spin: 'up', symbol: '↑' }, { id: 'e2', spin: 'down', symbol: '↓' },
    { id: 'e3', spin: 'up', symbol: '↑' }, { id: 'e4', spin: 'down', symbol: '↓' },
    { id: 'e5', spin: 'up', symbol: '↑' }, { id: 'e6', spin: 'up', symbol: '↑' }
  ]);
  const [orbitals, setOrbitals] = useState({
    '3d_0': [], '3d_1': [], '3d_2': [], '3d_3': [], '3d_4': [],
    '4s_0': [],
    '3p_0': [], '3p_1': [], '3p_2': []
  });
  const [ruleAlert, setRuleAlert] = useState('');
  const [isPenetrating, setIsPenetrating] = useState(false);

  // 模块四：药用元素周期律状态
  const [medicMode, setMedicMode] = useState(false);
  const [filterType, setFilterType] = useState(null); // 'radius' | 'electronegativity' | null
  const [activeMedicInfo, setActiveMedicInfo] = useState('');

  // 模块五：随堂闯关状态
  const [q1Ans, setQ1Ans] = useState(null);
  const [q2Ans, setQ2Ans] = useState(null);
  const [quizResult, setQuizResult] = useState('');

  // AI 助教状态
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！对“波粒二象性”或微观结构有疑惑吗？例如，你可以问我“电子显微镜是怎么利用波粒二象性观察病毒的？”' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 逻辑与数据定义区
  // ==========================================
  // --- 模块二逻辑 ---
  const isLValid = l < n;
  const isMValid = Math.abs(m) <= l;
  const isValid = isLValid && isMValid;
  const orbitalNames = ['s', 'p', 'd', 'f'];
  const orbName = `${n}${orbitalNames[l] || '?'}`;
  const colors = ['#38bdf8', '#10b981', '#f59e0b', '#c084fc'];
  const currentColor = colors[l] || '#38bdf8';
  let shapeText = "球形对称";
  if (l === 1) shapeText = "双哑铃状";
  if (l === 2) shapeText = "花瓣状 / 哑铃带圆环";
  if (l === 3) shapeText = "复杂的空间多裂片结构";
  const radialNodes = n - l - 1;

  const renderCrossSectionSVG = () => {
    const circles = [];
    for (let i = 1; i <= radialNodes; i++) {
      let radius = 90 - (i * (90 / (radialNodes + 1)));
      circles.push(<circle key={`b${i}`} cx="100" cy="100" r={radius} fill="none" stroke="#0f172a" strokeWidth="12" />);
      circles.push(<circle key={`w${i}`} cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeDasharray="2,2" />);
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="180" height="180" style={{ filter: `drop-shadow(0 0 15px ${currentColor}80)` }}>
        <circle cx="100" cy="100" r="90" fill={currentColor} fillOpacity="0.2" stroke={currentColor} strokeWidth="2" strokeDasharray="4,4" />
        <circle cx="100" cy="100" r="90" fill="url(#grad)" fillOpacity="0.4" />
        <defs>
          <radialGradient id="grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={currentColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={currentColor} stopOpacity="0.1" />
          </radialGradient>
        </defs>
        {circles}
        <circle cx="100" cy="100" r="4" fill="#fff" filter="drop-shadow(0 0 5px #fff)" />
      </svg>
    );
  };

  // --- 模块三逻辑 ---
  const handleDragStart = (e, electron, sourceId) => {
    e.dataTransfer.setData('electron', JSON.stringify(electron));
    e.dataTransfer.setData('sourceId', sourceId);
  };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e, targetOrbitalId) => {
    e.preventDefault();
    const electron = JSON.parse(e.dataTransfer.getData('electron'));
    const sourceId = e.dataTransfer.getData('sourceId');

    if (targetOrbitalId !== 'pool') {
      const targetElectrons = orbitals[targetOrbitalId];
      if (targetElectrons.length >= 2) {
        setRuleAlert('🚨 违反【泡利不相容原理】：一个轨道最多只能容纳两个电子！');
        return;
      }
      if (targetElectrons.length === 1 && targetElectrons[0].spin === electron.spin) {
        setRuleAlert('🚨 违反【泡利不相容原理】：同一轨道内电子自旋必须相反！');
        return;
      }
      const level = targetOrbitalId.split('_')[0];
      const p3Filled = orbitals['3p_0'].length === 2 && orbitals['3p_1'].length === 2 && orbitals['3p_2'].length === 2;
      if ((level === '4s' || level === '3d') && !p3Filled) {
        setRuleAlert('🚨 违反【能量最低原理】：必须先填满低能量的 3p 轨道！');
        return;
      }
    }
    setRuleAlert('');
    if (sourceId === 'pool') { setPool(pool.filter(e => e.id !== electron.id)); } 
    else { setOrbitals(prev => ({ ...prev, [sourceId]: prev[sourceId].filter(e => e.id !== electron.id) })); }

    if (targetOrbitalId === 'pool') { setPool(prev => [...prev, electron]); } 
    else { setOrbitals(prev => ({ ...prev, [targetOrbitalId]: [...prev[targetOrbitalId], electron] })); }
  };
  const triggerPenetration = () => {
    setIsPenetrating(true);
    setRuleAlert('由于 钻穿效应，4s 电子避开内层电子屏蔽靠近原子核，使其能量低于 3d，能级发生交错！');
  };

  // --- 模块四逻辑 ---
  const medicalDB = {
    'Fe': '<strong>血液的“氧气搬运工”：</strong>血红素核心。Fe²⁺ 利用空 d 轨道与 O₂ 配位。',
    'Zn': '<strong>生命的“催化引擎”：</strong>d¹⁰ 全满结构极稳定，作为超强路易斯酸极化底物，存在于碳酸酐酶中。',
    'Cu': '<strong>呼吸链的枢纽：</strong>细胞色素 c 氧化酶核心，利用 Cu⁺/Cu²⁺ 变价传递电子。',
    'As': '<strong>毒与药的辩证：</strong>曾是剧毒物，如今三氧化二砷被成功用于治疗急性早幼粒细胞白血病(APL)。',
    'I':  '<strong>甲状腺专属：</strong>电负性大，同位素 ¹³¹I 发出的 β 射线用于精准治疗甲状腺癌。',
    'Gd': '<strong>MRI 造影王牌：</strong>[Xe]4f⁷ 排布，7个未成对电子带来极强顺磁性。',
    'Pt': '<strong>DNA 终结者：</strong>d⁸ 金属，形成稳定的顺铂平面四边形结构，嵌入癌细胞 DNA。',
    'Li': '<strong>情绪稳定剂：</strong>离子半径极小，高电荷密度，干扰神经元信号通路治疗躁郁症。'
  };
  const elementsData = [
    'H','He','Li','Be','B','C','N','O','F','Ne',
    'Na','Mg','Al','Si','P','S','Cl','Ar',
    'K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr',
    'Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'
  ];
  
  // 生成固定的随机数种子用于滤镜
  const [randomSeeds] = useState(() => elementsData.map(() => Math.random() * 0.5 + 0.1));

  const handleElementHover = (el) => {
    if (medicMode && medicalDB[el]) {
      setActiveMedicInfo(`<h3 style="margin-top:0; color:#10b981;">💊 药用元素：${el}</h3><p>${medicalDB[el]}</p>`);
    }
  };

  // --- 模块五逻辑 ---
  const submitQuiz = () => {
    if (q1Ans === 'C' && q2Ans === 'A') {
      setQuizResult('✅ 全部正确！您已经完美掌握了结构决定性质、微观联系宏观的精髓！');
    } else {
      setQuizResult('❌ 存在错误。提示：请回顾“过渡金属异常排布与配合物构型”及“同位素化学性质主要由价电子决定”的知识点。');
    }
  };

  // --- AI 助手逻辑 ---
  const handleChatSubmit = (e) => {
    if (e.key === 'Enter' && chatInput.trim() !== '') {
      setChatHistory(prev => [...prev, { role: 'user', text: chatInput }]);
      setChatInput('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: '这是一个非常好的问题！在医学中，我们常利用波粒二象性。例如电子显微镜利用电子的高速运动产生的极短物质波（德布罗意波），突破了光学显微镜的衍射极限，从而能够清晰地观察到新冠病毒表面的微观结构。' }]);
      }, 1000);
    }
  };
  useEffect(() => {
    if (chatEndRef.current) { chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }
  }, [chatHistory, isChatOpen]);

  // ==========================================
  // 渲染区 (严格映射原 HTML)
  // ==========================================
  return (
    <div className="atom-lab-container">
      {/* 注入原版全局 CSS 变量与动画 */}
      <style>{`
        .atom-lab-container {
          --bg-dark: #0f172a;
          --bg-panel: rgba(30, 58, 138, 0.4);
          --primary-blue: #38bdf8;
          --life-green: #10b981;
          --alert-red: #ef4444;
          --text-main: #f8fafc;
          background: var(--bg-dark);
          color: var(--text-main);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          width: 100%;
        }
        .atom-lab-container h1, .atom-lab-container h2, .atom-lab-container h3, .atom-lab-container h4 { color: var(--primary-blue); }
        .atom-lab-container h2 { border-left: 5px solid var(--life-green); padding-left: 15px; margin-bottom: 30px;}
        .atom-lab-container section { min-height: 100vh; padding: 60px 10%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .atom-lab-container .btn { background: linear-gradient(135deg, var(--primary-blue), var(--life-green)); border: none; padding: 12px 24px; color: white; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
        .atom-lab-container .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6); }
        .atom-lab-container .btn:disabled { cursor: not-allowed; opacity: 0.5; }
        
        .cloud-animation { width: 250px; height: 250px; margin: 0 auto 40px; border-radius: 50%; background: radial-gradient(circle, rgba(56,189,248,0.8) 0%, rgba(16,185,129,0.2) 60%, transparent 80%); box-shadow: 0 0 60px rgba(56,189,248,0.4); animation: pulse-cloud 4s infinite alternate, spin 10s linear infinite; display: flex; align-items: center; justify-content: center; font-size: 50px; position: relative; }
        .cloud-animation::after { content: '💊'; animation: float 3s ease-in-out infinite; position: absolute;}
        @keyframes pulse-cloud { 0% { transform: scale(0.9); } 100% { transform: scale(1.1); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

        .element-box { transition: all 0.3s; position: relative; }
        .element-box:hover { transform: scale(1.5); z-index: 10; background: var(--primary-blue) !important; color: #000; }
        .medicine-mode .element-box:not(.medic) { opacity: 0.1; filter: grayscale(100%); }
        .medicine-mode .element-box.medic { background: rgba(16,185,129,0.3); box-shadow: 0 0 10px var(--life-green); }
        
        .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: var(--primary-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(56,189,248,0.6); z-index: 100; transition: transform 0.3s; }
        .ai-bot:hover { transform: scale(1.1); }
      `}</style>

      {/* ================= 模块一：Hero Section ================= */}
      <section id="hero" style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e3a8a 0%, #0f172a 100%)' }}>
        <div className="cloud-animation"></div>
        <h1 style={{ fontSize: '3rem', background: '-webkit-linear-gradient(45deg, #38bdf8, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>微观视界：原子结构与药学</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '40px', color: '#cbd5e1' }}>“从薛定谔的波动方程，到拯救生命的靶向药物，一切故事都从这团概率云开始……”</p>
        <div>
          <button className="btn" onClick={() => document.getElementById('module2').scrollIntoView()}>开启量子探索 ↓</button>
        </div>
      </section>

      {/* ================= 模块二：量子密码档案馆 ================= */}
      <section id="module2">
        <h2>模块二：量子密码档案馆 (轨道图像与量子数)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <h3>设置量子数</h3>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>主量子数 n (1-4): <span style={{ color: '#38bdf8' }}>{n}</span></label>
              <input type="range" min="1" max="4" value={n} onChange={e => setN(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>角量子数 l (0-3): <span style={{ color: '#38bdf8' }}>{l}</span></label>
              <input type="range" min="0" max="3" value={l} onChange={e => setL(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
              {!isLValid && <span style={{ color: '#ef4444', fontSize: '0.9em', marginTop: '5px', display: 'block' }}>⚠️ 预警：角量子数 l 必须小于 n (当前 n={n})</span>}
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>磁量子数 m: <span style={{ color: '#38bdf8' }}>{m}</span></label>
              <input type="range" min="-3" max="3" value={m} onChange={e => setM(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
              {!isMValid && <span style={{ color: '#ef4444', fontSize: '0.9em', marginTop: '5px', display: 'block' }}>⚠️ 预警：磁量子数 m 必须在 -l 到 +l 之间 (当前 l={l})</span>}
            </div>
            <button className="btn" disabled={!isValid} onClick={() => setShowSlice(!showSlice)} style={{ marginTop: '10px' }}>
              {showSlice ? "❌ 关闭剖面仪" : "🔍 开启剖面仪 (显示径向节面)"}
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', border: '2px dashed #38bdf8', borderRadius: '16px', position: 'relative', background: 'radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1))', padding: '20px' }}>
            {isValid ? (
              <div style={{ fontSize: '18px', color: '#10b981', textAlign: 'center', width: '100%' }}>
                <div style={{ marginBottom: '20px' }}>
                  [模拟 3D 电子云外观]<br/><br/>
                  当前轨道：<strong style={{ fontSize: '2.5em', color: '#fff' }}>{orbName}</strong><br/>
                  宏观形状：{shapeText}
                </div>
                {showSlice && (
                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '20px' }}>
                    <h4 style={{ color: '#ef4444', marginTop: 0 }}>🔪 电子云已切开</h4>
                    <p style={{ fontSize: '15px', marginBottom: '15px', color: '#cbd5e1' }}>
                      根据公式 <strong>n - l - 1 = {n} - {l} - 1 = <span style={{ color: '#fff', fontSize: '1.2em' }}>{radialNodes}</span></strong><br/>
                      内部存在 <strong>{radialNodes}</strong> 个径向节面（电子出现概率为 0 的球面暗环）。
                    </p>
                    {renderCrossSectionSVG()}
                  </div>
                )}
              </div>
            ) : (
              <span style={{ color: '#ef4444' }}>量子数不合法，无法形成真实的原子轨道！</span>
            )}

            {l === 3 && isValid && (
              <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', padding: '15px', borderRadius: '8px', width: '220px', boxShadow: '0 0 15px #10b981' }}>
                <strong>🩺 药学探秘：钆(Gd)</strong><br/><br/>
                为什么拥有7个未成对 4f 电子的钆能成为核磁共振(MRI)的王牌造影剂？<br/>
                <em>点击下方 AI 助教提问获取详情！</em>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= 模块三：核外电子排布 ================= */}
      <section id="module3">
        <h2>模块三：核外电子排布 (组装车间)</h2>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>当前药用元素靶标：<strong>铂 (Pt) 的简化外层模型</strong>。请将电子拖入轨道，违反泡利不相容、洪特规则或能量最低原理将触发警报！</p>
        
        <div style={{ display: 'flex', gap: '40px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', gap: '15px', position: 'relative' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', transform: isPenetrating ? 'translateY(-60px)' : 'none', transition: 'transform 0.8s ease' }} data-level="3d">
              <span style={{ width: '30px', fontWeight: 'bold', color: '#38bdf8' }}>3d</span>
              {['3d_0', '3d_1', '3d_2', '3d_3', '3d_4'].map(id => (
                <div key={id} style={{ width: '50px', height: '50px', border: '2px solid #64748b', borderRadius: '6px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', background: 'rgba(0,0,0,0.3)', fontSize: '24px' }} onDrop={e => handleDrop(e, id)} onDragOver={handleDragOver}>
                  {orbitals[id].map(elec => (
                    <div key={elec.id} draggable onDragStart={e => handleDragStart(e, elec, id)} style={{ display: 'inline-block', width: '30px', height: '40px', lineHeight: '40px', background: '#38bdf8', color: '#000', margin: '5px', cursor: 'grab', fontWeight: 'bold', borderRadius: '4px', userSelect: 'none', textAlign: 'center' }}>{elec.symbol}</div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', transform: isPenetrating ? 'translateY(60px)' : 'none', transition: 'transform 0.8s ease' }} data-level="4s">
              <span style={{ width: '30px', fontWeight: 'bold', color: '#38bdf8' }}>4s</span>
              <div style={{ width: '50px', height: '50px', border: '2px solid #64748b', borderRadius: '6px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', background: 'rgba(0,0,0,0.3)', fontSize: '24px' }} onDrop={e => handleDrop(e, '4s_0')} onDragOver={handleDragOver}>
                {orbitals['4s_0'].map(elec => (
                  <div key={elec.id} draggable onDragStart={e => handleDragStart(e, elec, '4s_0')} style={{ display: 'inline-block', width: '30px', height: '40px', lineHeight: '40px', background: '#38bdf8', color: '#000', margin: '5px', cursor: 'grab', fontWeight: 'bold', borderRadius: '4px', userSelect: 'none', textAlign: 'center' }}>{elec.symbol}</div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} data-level="3p">
              <span style={{ width: '30px', fontWeight: 'bold', color: '#38bdf8' }}>3p</span>
              {['3p_0', '3p_1', '3p_2'].map(id => (
                <div key={id} style={{ width: '50px', height: '50px', border: '2px solid #64748b', borderRadius: '6px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', background: 'rgba(0,0,0,0.3)', fontSize: '24px' }} onDrop={e => handleDrop(e, id)} onDragOver={handleDragOver}>
                  {orbitals[id].map(elec => (
                    <div key={elec.id} draggable onDragStart={e => handleDragStart(e, elec, id)} style={{ display: 'inline-block', width: '30px', height: '40px', lineHeight: '40px', background: '#38bdf8', color: '#000', margin: '5px', cursor: 'grab', fontWeight: 'bold', borderRadius: '4px', userSelect: 'none', textAlign: 'center' }}>{elec.symbol}</div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} data-level="3s">
              <span style={{ width: '30px', fontWeight: 'bold', color: '#38bdf8' }}>3s</span>
              <div style={{ width: '50px', height: '50px', border: '2px solid #64748b', borderRadius: '6px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', background: 'rgba(0,0,0,0.3)', fontSize: '24px' }}>↑↓</div>
            </div>
          </div>

          <div style={{ flex: 1, background: 'var(--bg-panel)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
            <h3>电子池 (电子自旋)</h3>
            <div onDrop={e => handleDrop(e, 'pool')} onDragOver={handleDragOver} style={{ minHeight: '60px' }}>
              {pool.map(elec => (
                <div key={elec.id} draggable onDragStart={e => handleDragStart(e, elec, 'pool')} style={{ display: 'inline-block', width: '30px', height: '40px', lineHeight: '40px', background: '#38bdf8', color: '#000', margin: '5px', cursor: 'grab', fontWeight: 'bold', borderRadius: '4px', userSelect: 'none', textAlign: 'center' }}>{elec.symbol}</div>
              ))}
            </div>
            <p style={{ color: ruleAlert.includes('钻穿') ? '#10b981' : '#ef4444', marginTop: '20px', fontWeight: 'bold', minHeight: '40px' }} dangerouslySetInnerHTML={{__html: ruleAlert}}></p>
            <button className="btn" style={{ marginTop: '20px' }} onClick={triggerPenetration}>演示屏蔽与钻穿效应 (4s沉降)</button>
          </div>
        </div>
      </section>

      {/* ================= 模块四：药用元素周期律 ================= */}
      <section id="module4">
        <h2>模块四：药用元素周期律 (医理融合视角)</h2>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
          <button className="btn" style={{ background: medicMode ? '#ef4444' : '' }} onClick={() => { setMedicMode(!medicMode); setActiveMedicInfo(medicMode ? '' : '<h3 style="margin-top:0;">📚 药用元素知识卡片</h3><p>请开启“医药视角”并鼠标悬停在高亮元素上，探索“结构决定性质，性质决定药理”的奥秘。</p>'); }}>
            {medicMode ? "🌐 关闭医药视角" : "🧬 开启医药视角"}
          </button>
          <button className="btn" style={{ background: 'transparent', border: '1px solid #38bdf8' }} onClick={() => setFilterType('radius')}>原子半径滤镜</button>
          <button className="btn" style={{ background: 'transparent', border: '1px solid #38bdf8' }} onClick={() => setFilterType('electronegativity')}>电负性滤镜</button>
        </div>
        
        <div className={medicMode ? "medicine-mode" : ""} style={{ display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gap: '4px' }}>
          {elementsData.map((el, idx) => (
            <div 
              key={el} 
              className={`element-box ${medicalDB[el] ? 'medic' : ''}`}
              onMouseEnter={() => handleElementHover(el)}
              style={{ 
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', 
                borderColor: medicalDB[el] ? '#10b981' : '#334155', fontWeight: medicalDB[el] ? 'bold' : 'normal',
                backgroundColor: filterType === 'radius' ? `rgba(56,189,248,${randomSeeds[idx]})` : filterType === 'electronegativity' ? `rgba(16,185,129,${randomSeeds[idx]})` : ''
              }}
            >
              {el}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '25px', padding: '20px', background: 'rgba(16,185,129,0.1)', borderLeft: '5px solid #10b981', borderRadius: '0 8px 8px 0', minHeight: '80px' }} dangerouslySetInnerHTML={{ __html: activeMedicInfo || '<h3 style="margin-top:0;">📚 药用元素知识卡片</h3><p>请开启“医药视角”并鼠标悬停在高亮元素上，探索“结构决定性质，性质决定药理”的奥秘。</p>' }}>
        </div>
      </section>

      {/* ================= 模块五：随堂闯关与教学闭环 ================= */}
      <section id="module5">
        <h2>模块五：随堂闯关与教学闭环 (课程思政)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <div style={{ marginBottom: '25px', background: 'var(--bg-panel)', padding: '20px', borderRadius: '10px' }}>
              <p style={{ marginTop: 0, fontWeight: 'bold', color: '#38bdf8' }}>1. 结合医学应用思考：抗癌药物顺铂[Pt(NH3)2Cl2]能牢固结合DNA，其中心Pt(II)形成平面四边形结构。这主要与排布规则中的哪个原理/效应有关？</p>
              <label style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}><input type="radio" name="q1" onChange={() => setQ1Ans('A')} /> A. 能量最低原理</label>
              <label style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}><input type="radio" name="q1" onChange={() => setQ1Ans('B')} /> B. 钻穿效应</label>
              <label style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}><input type="radio" name="q1" onChange={() => setQ1Ans('C')} /> C. d轨道电子排布构型与晶体场分裂 (结构决定药理)</label>
            </div>
            <div style={{ marginBottom: '25px', background: 'var(--bg-panel)', padding: '20px', borderRadius: '10px' }}>
              <p style={{ marginTop: 0, fontWeight: 'bold', color: '#38bdf8' }}>2. 【思政题】居里夫人发现的镭(Ra)和钋(Po)为现代放射治疗奠定了基础。放射性同位素如131-I常用于治疗甲状腺癌。这些同位素的化学性质与普通稳定同位素基本相同，这是因为？</p>
              <label style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}><input type="radio" name="q2" onChange={() => setQ2Ans('A')} /> A. 它们的核外电子排布（尤其是价电子）完全相同</label>
              <label style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}><input type="radio" name="q2" onChange={() => setQ2Ans('B')} /> B. 它们的原子核质量相同</label>
            </div>
            <button className="btn" onClick={submitQuiz}>提交试卷检测</button>
            <p style={{ marginTop: '15px', fontSize: '1.2em', color: quizResult.includes('✅') ? '#10b981' : '#ef4444' }}>{quizResult}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
            <p>点击右下角 AI 助教随时提问解惑！</p>
          </div>
        </div>
      </section>

      {/* ================= 悬浮 AI 助教 ================= */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      
      {isChatOpen && (
        <div style={{ position: 'fixed', bottom: '100px', right: '30px', width: '320px', background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '12px', padding: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h3 style={{ marginTop: 0, color: '#10b981' }}>无机化学 AI 助教</h3>
          <div style={{ height: '150px', overflowY: 'auto', fontSize: '14px', marginBottom: '10px', color: '#cbd5e1' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? '#10b981' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong> {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleChatSubmit}
            placeholder="输入您的问题，按回车发送..." 
            style={{ width: 'calc(100% - 20px)', padding: '10px', borderRadius: '6px', border: 'none', marginTop: '10px' }} 
          />
        </div>
      )}

    </div>
  );
}