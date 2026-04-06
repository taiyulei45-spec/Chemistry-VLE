import React, { useState, useEffect, useRef } from 'react';

export default function MolecularFolding() {
  const [bp, setBp] = useState(4);
  const [lp, setLp] = useState(0);
  const [dockVal, setDockVal] = useState(0);
  const [q1Ans, setQ1Ans] = useState('');
  const [q2Ans, setQ2Ans] = useState('');
  const [quizResult, setQuizResult] = useState({ text: '', color: '' });

  // AI 助教状态
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是你的无机化学AI助教。关于分子的空间结构、杂化理论或药物靶向设计，你有什么疑问吗？\n(例如你可以问：“为什么青蒿素的过氧桥键容易断裂？”)' }
  ]);
  const chatEndRef = useRef(null);

  const total = bp + lp;
  let eGeom = "", mGeom = "", hyb = "", popupShow = false;
  if(total >= 2 && total <= 6) {
    if(total === 2) { eGeom="直线型"; hyb="sp"; mGeom="直线型"; }
    else if(total === 3) { eGeom="平面三角形"; hyb="sp²"; mGeom = lp===0 ? "平面三角形" : "V型 (折线型)"; }
    else if(total === 4) { eGeom="正四面体"; hyb="sp³"; popupShow = true; if(lp===0) mGeom="正四面体"; else if(lp===1) mGeom="三角锥型"; else if(lp===2) mGeom="V型 (水分子)"; else mGeom="直线型"; }
    else if(total === 5) { eGeom="三角双锥"; hyb="sp³d"; if(lp===0) mGeom="三角双锥"; else if(lp===1) mGeom="变形四面体(跷跷板)"; else if(lp===2) mGeom="T型"; else mGeom="直线型"; }
    else if(total === 6) { eGeom="正八面体"; hyb="sp³d²"; if(lp===0) mGeom="正八面体"; else if(lp===1) mGeom="四方锥"; else if(lp===2) mGeom="平面正方形"; else mGeom="T型/直线"; }
  }

  const renderVSEPRSvg = () => {
    let svg = `<svg width="300" height="300" viewBox="-150 -150 300 300">`;
    let angles = [];
    if(total===2) angles = [0, Math.PI];
    else if(total===3) angles = [Math.PI/2, Math.PI/2 + 2*Math.PI/3, Math.PI/2 + 4*Math.PI/3];
    else if(total===4) angles = [Math.PI/2, Math.PI/2+2.2, Math.PI/2+4.08, Math.PI/2+3.14]; 
    else if(total===5) angles = [Math.PI/2, -Math.PI/2, 0, 2.6, 3.6];
    else if(total===6) angles = [Math.PI/2, -Math.PI/2, 0, Math.PI, Math.PI/4, 3*Math.PI/4];
    
    for(let i=0; i<bp; i++) {
        let x = 100 * Math.cos(angles[i]); let y = -100 * Math.sin(angles[i]); 
        svg += `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="#22d3ee" stroke-width="6" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="15" fill="#f8fafc"/>`;
    }
    for(let i=bp; i<total; i++) {
        let x = 70 * Math.cos(angles[i]); let y = -70 * Math.sin(angles[i]); let rot = -angles[i] * 180 / Math.PI;
        svg += `<ellipse cx="${x/2}" cy="${y/2}" rx="40" ry="20" fill="rgba(245, 158, 11, 0.4)" stroke="#f59e0b" stroke-width="2" transform="rotate(${rot}, ${x/2}, ${y/2})"/>`;
        svg += `<circle cx="${x*0.7}" cy="${y*0.7}" r="3" fill="#f59e0b"/><circle cx="${x*0.9}" cy="${y*0.9}" r="3" fill="#f59e0b"/>`;
    }
    svg += `<circle cx="0" cy="0" r="25" fill="#10b981" filter="drop-shadow(0 0 10px #10b981)"/></svg>`;
    return { __html: svg };
  };

  const renderDockingSvg = () => {
    let drugX = 50 + dockVal * 2; let recX = 350; 
    let hBondDraw = "";
    if (dockVal > 80) {
        hBondDraw = `<line x1="${drugX+40}" y1="120" x2="${recX-20}" y2="100" stroke="#f59e0b" stroke-width="4" class="h-bond"/><line x1="${drugX+40}" y1="180" x2="${recX-20}" y2="200" stroke="#f59e0b" stroke-width="4" class="h-bond"/><text x="230" y="150" fill="#f59e0b" font-weight="bold">Hydrogen Bonds Formed!</text>`;
    }
    return { __html: `
      <svg width="100%" height="100%" viewBox="0 0 500 300">
          <path d="M ${recX},50 Q ${recX-80},150 ${recX},250" fill="none" stroke="#10b981" stroke-width="8"/>
          <circle cx="${recX-20}" cy="100" r="15" fill="#10b981"/> <circle cx="${recX-20}" cy="200" r="15" fill="#10b981"/> 
          ${hBondDraw}
          <polygon points="${drugX},100 ${drugX+40},120 ${drugX+40},180 ${drugX},200 ${drugX-40},150" fill="rgba(34,211,238,0.3)" stroke="#22d3ee" stroke-width="3"/>
          <circle cx="${drugX+40}" cy="120" r="10" fill="#22d3ee"/> <circle cx="${drugX+40}" cy="180" r="10" fill="#22d3ee"/> 
          <text x="${drugX-30}" y="155" fill="#fff" font-size="12">Drug</text>
      </svg>` };
  };

  const submitQuiz = () => {
    if (q1Ans === 'C' && q2Ans === 'C') {
      setQuizResult({ text: "✅ 挑战成功！你完美掌握了手性构型的杂化本质和奇电子分子的轨道特征。希望你牢记科学伦理，做一名有担当的新时代药学人！", color: "var(--life-green)" });
    } else {
      setQuizResult({ text: "❌ 存在错误哦。提示：产生四个不同立体方向的杂化是 sp³；导致 NO 活泼的是能量较高的反键轨道。请再试一次！", color: "var(--alert-orange)" });
    }
  };

  const handleChat = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: "好问题！青蒿素的过氧桥键 (-O-O-) 由于氧原子的电负性强且带有孤对电子，相互之间存在较强的排斥力（可以从分子轨道理论的反键成分理解），导致键能较低。在疟原虫体内富铁的环境下，该键极易断裂生成高活性的自由基，从而杀死疟原虫。这就是‘结构决定药效’的经典案例！" }]);
      }, 1000);
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  return (
    <div className="vsepr-wrapper">
      <style>{`
        .vsepr-wrapper { --bg-dark: #0f172a; --bg-panel: rgba(30, 58, 138, 0.4); --primary-cyan: #22d3ee; --life-green: #10b981; --alert-orange: #f59e0b; --text-main: #f8fafc; --sz-red: #ef4444; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
        .vsepr-wrapper h1, .vsepr-wrapper h2, .vsepr-wrapper h3, .vsepr-wrapper h4 { color: var(--primary-cyan); }
        .vsepr-wrapper h2 { border-left: 5px solid var(--life-green); padding-left: 15px; margin-bottom: 30px;}
        .vsepr-wrapper section { min-height: 100vh; padding: 60px 10%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .vsepr-wrapper .btn { background: linear-gradient(135deg, var(--primary-cyan), var(--life-green)); border: none; padding: 12px 24px; color: #000; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
        .vsepr-wrapper .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6); }
        .vsepr-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .vsepr-wrapper .panel { background: var(--bg-panel); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .vsepr-wrapper .slider-group { margin-bottom: 20px; }
        .vsepr-wrapper .slider-group label { display: block; margin-bottom: 8px; font-weight: bold; }
        .vsepr-wrapper .svg-container { display: flex; align-items: center; justify-content: center; flex-direction: column; border: 2px dashed var(--primary-cyan); border-radius: 16px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; position: relative; min-height: 400px; }
        .vsepr-wrapper .medic-popup { position: absolute; top: 15px; right: 15px; background: rgba(16,185,129,0.15); border: 1px solid var(--life-green); padding: 15px; border-radius: 8px; width: 220px; box-shadow: 0 0 15px rgba(16,185,129,0.4); font-size: 14px; }
        @keyframes dash { to { stroke-dashoffset: 0; } }
        .vsepr-wrapper .h-bond { stroke-dasharray: 5; stroke-dashoffset: 100; animation: dash 2s linear forwards infinite; }
        .vsepr-wrapper .quiz-item { margin-bottom: 25px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; border-left: 3px solid var(--primary-cyan);}
        .vsepr-wrapper .quiz-item.sz-item { border-left-color: var(--sz-red); background: rgba(239, 68, 68, 0.05); }
        .vsepr-wrapper .quiz-item p { margin-top: 0; font-weight: bold; }
        .vsepr-wrapper .quiz-item label { display: block; margin: 8px 0; cursor: pointer; padding: 5px; border-radius: 5px; transition: 0.2s;}
        .vsepr-wrapper .quiz-item label:hover { background: rgba(255,255,255,0.1); }
        .vsepr-wrapper .sz-tag { background: var(--sz-red); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-right: 5px;}
        .vsepr-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary-cyan), var(--life-green)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); z-index: 100; transition: transform 0.3s; }
        .vsepr-wrapper .ai-bot:hover { transform: scale(1.1); }
        .vsepr-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: var(--bg-dark); border: 1px solid var(--life-green); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
        .vsepr-wrapper .ai-chat-window input { width: calc(100% - 22px); padding: 10px; border-radius: 6px; border: none; margin-top: 10px; background: #1e293b; color: #fff;}
      `}</style>

      <section id="hero" style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #083344 0%, var(--bg-dark) 100%)' }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 20px #22d3ee)' }}>
            <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="none" stroke="#22d3ee" strokeWidth="4" strokeDasharray="10" className="h-bond"/>
            <circle cx="100" cy="100" r="15" fill="#10b981"/>
            <line x1="100" y1="100" x2="170" y2="60" stroke="#10b981" strokeWidth="3"/>
            <line x1="100" y1="100" x2="30" y2="140" stroke="#10b981" strokeWidth="3"/>
        </svg>
        <h1 style={{ fontSize: '3rem', marginTop: '20px' }}>分子折叠：结构决定药理</h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '40px' }}>“药物与受体的相遇，是空间几何与微观作用力的极致浪漫。”</p>
        <button className="btn" onClick={() => document.getElementById('module2').scrollIntoView()}>探索 VSEPR 空间几何 ↓</button>
      </section>

      <section id="module2">
        <h2>模块二：VSEPR 与药物的三维骨架 (杂化与构型)</h2>
        <div className="grid-2">
            <div className="panel">
                <h3>调整价层电子对 (VSEPR)</h3>
                <p style={{ color: '#cbd5e1', fontSize: '14px' }}>药物受体往往具有高度的空间特异性（手性）。通过调整成键电子对和孤电子对，观察中心原子的空间构型变化。</p>
                <div className="slider-group">
                    <label>成键电子对 (BP): <span style={{ color: 'var(--primary-cyan)' }}>{bp}</span></label>
                    <input type="range" min="2" max="6" value={bp} onChange={e=>setBp(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--life-green)' }} />
                </div>
                <div className="slider-group">
                    <label>孤电子对 (LP): <span style={{ color: 'var(--alert-orange)' }}>{lp}</span></label>
                    <input type="range" min="0" max="3" value={lp} onChange={e=>setLp(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--life-green)' }} />
                </div>
                {total >= 2 && total <= 6 ? (
                  <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                      电子对构型：<strong>{eGeom}</strong><br/>
                      分子空间构型：<strong style={{ color: 'var(--life-green)', fontSize: '1.2em' }}>{mGeom}</strong><br/>
                      杂化方式：<strong>{hyb}</strong>
                  </div>
                ) : (
                  <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}><span style={{ color: 'red' }}>不存在此稳定状态</span></div>
                )}
            </div>
            <div className="svg-container">
                {total >= 2 && total <= 6 && <div dangerouslySetInnerHTML={renderVSEPRSvg()} />}
                {popupShow && (
                  <div className="medic-popup">
                      <strong style={{ color: 'var(--sz-red)' }}>🚩 课程思政：科学与伦理的教训</strong><br/>
                      当碳原子呈 sp³ 杂化时可能产生手性异构。20世纪的“反应停”惨案中，R构型镇痛止吐，S构型却导致海豹肢畸胎。这警示药学人：<strong>微观结构的毫厘之差，即是患者生命的生死之界。严谨，是药学人不可逾越的底线。</strong>
                  </div>
                )}
            </div>
        </div>
      </section>

      <section id="module4">
        <h2>模块四：分子间作用力 (靶向识别的本质)</h2>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p>拖动滑块，模拟药物分子（如对乙酰氨基酚）靠近受体蛋白口袋，观察 <strong>氢键 (Hydrogen Bond)</strong> 的形成。</p>
            <input type="range" min="0" max="100" value={dockVal} onChange={e=>setDockVal(parseInt(e.target.value))} style={{ width: '50%', accentColor: 'var(--life-green)' }} />
        </div>
        <div className="svg-container" style={{ height: '350px', background: '#020617' }}>
            <div dangerouslySetInnerHTML={renderDockingSvg()} style={{ width: '100%', height: '100%' }} />
        </div>
      </section>

      <section id="module5">
        <h2>模块五：课程思政与随堂挑战 (教学闭环)</h2>
        <div className="grid-2">
            <div className="panel" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--life-green)' }}>
                <h3 style={{ color: 'var(--life-green)' }}>🚩 课程思政：分子结构的辩证与文化自信</h3>
                <p><strong>1. 辩证唯物主义：</strong>化学键的本质是原子间吸引力与排斥力的对立统一。当距离达到平衡时，能量最低，形成稳定的分子。这体现了马克思主义哲学中“对立统一”的普遍规律。</p>
                <p><strong>2. 文化自信与科学报国：</strong><br/>
                - 1965年，我国科学家在世界上首次人工合成结晶牛胰岛素，打破了生命物质与非生命物质的界限，这是对蛋白质空间结构深刻理解的伟大胜利。<br/>
                - 屠呦呦团队从传统中药中提取青蒿素，其核心的<strong>过氧桥键（-O-O-）空间结构</strong>是其抗疟活性的绝对核心。传统医学与现代化学结构分析的完美交融，铸就了诺贝尔奖的辉煌。</p>
            </div>
            <div>
                <h3>随堂测验</h3>
                <div className="quiz-item sz-item">
                    <p><span className="sz-tag">思政与专业</span>1. “反应停”事件的悲剧提醒药学工作者必须重视分子的空间立体构型。导致碳原子产生手性（结合四个不同基团）的杂化方式是：</p>
                    <label><input type="radio" name="q1" onChange={()=>setQ1Ans('A')} /> A. sp 杂化</label>
                    <label><input type="radio" name="q1" onChange={()=>setQ1Ans('B')} /> B. sp² 杂化</label>
                    <label><input type="radio" name="q1" onChange={()=>setQ1Ans('C')} /> C. sp³ 杂化</label>
                </div>
                <div className="quiz-item">
                    <p>2. 根据刚才的分子轨道理论演示，一氧化氮（NO）之所以能作为心血管信号分子，是因为其在哪个分子轨道上具有未成对的奇电子？</p>
                    <label><input type="radio" name="q2" onChange={()=>setQ2Ans('A')} /> A. σ(2p) 成键轨道</label>
                    <label><input type="radio" name="q2" onChange={()=>setQ2Ans('B')} /> B. π(2p) 成键轨道</label>
                    <label><input type="radio" name="q2" onChange={()=>setQ2Ans('C')} /> C. π*(2p) 反键轨道</label>
                </div>
                <button className="btn" onClick={submitQuiz}>提交答案</button>
                {quizResult.text && <p style={{ marginTop: '15px', fontWeight: 'bold', color: quizResult.color }}>{quizResult.text}</p>}
            </div>
        </div>
      </section>

      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
            <h3 style={{ marginTop: 0, color: 'var(--life-green)', fontSize: '16px' }}>无机化学 AI 助教</h3>
            <div style={{ height: '180px', overflowY: 'auto', fontSize: '14px', marginBottom: '10px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--primary-cyan)' : '#fff' }}>
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