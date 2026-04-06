import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function Kinetics() {
  const [osm, setOsm] = useState(300);
  const [dh, setDh] = useState(-20);
  const [ds, setDs] = useState(50);
  const [kMode, setKMode] = useState('normal');

  const [quizState, setQuizState] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是你的无机化学 AI 助教。关于“渗透压、自由能或动力学加速实验”，你有什么疑问吗？\n\n*(例如您可以问：“为什么输液不能直接输入蒸馏水？”或“药厂怎么用动力学测定药物保质期？”)*' }
  ]);
  const chatEndRef = useRef(null);

  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton && (e.key !== 'Enter' || e.nativeEvent.isComposing)) return;
    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在深度思考...' }]);

    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, '化学热力学与动力学基础');
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply };
        return newHistory;
      });
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 网络异常或 API 连接失败。' };
        return newHistory;
      });
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  // 渲染渗透压红细胞
  const renderOsmosis = () => {
    let rX = 40, rY = 40, cellColor = "#ef4444", status = "", cellState = "", advice = "";
    if (osm < 280) {
      status = "低渗溶液 (Hypotonic)"; cellState = "膨胀胀破 (溶血 Hemolysis) 危险！"; advice = "严禁静脉输入！会导致红细胞破裂。"; rX = 60; rY = 60; cellColor = "#fca5a5";
    } else if (osm >= 280 && osm <= 320) {
      status = "等渗溶液 (Isotonic)"; cellState = "正常双凹圆盘状"; advice = "安全输液 (如 0.9% NaCl，5% GS)。"; rX = 40; rY = 30;
    } else {
      status = "高渗溶液 (Hypertonic)"; cellState = "皱缩变形 (质壁分离 Plasmolysis)"; advice = "特殊治疗使用(如20%甘露醇)，需缓慢滴注。"; rX = 25; rY = 25; cellColor = "#991b1b";
    }
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <svg width="100%" height="200" viewBox="0 0 300 200">
          <rect x="0" y="0" width="300" height="200" fill="rgba(59,130,246,0.1)" rx="10"/>
          <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5"/>
          <ellipse cx="150" cy="100" rx={rX} ry={rY} fill={cellColor} style={{ transition: 'all 0.5s ease' }} filter="drop-shadow(0 0 10px rgba(239,68,68,0.5))"/>
          {osm >= 280 && osm <= 320 && <ellipse cx="150" cy="100" rx="20" ry="15" fill="rgba(0,0,0,0.2)" />}
          {osm < 280 && <><text x="50" y="100" fill="var(--primary-blue)" fontSize="20" className="water-left">H₂O ➔</text><text x="250" y="100" fill="var(--primary-blue)" fontSize="20" className="water-right">H₂O ➔</text></>}
          {osm > 320 && <><text x="80" y="100" fill="var(--primary-blue)" fontSize="20" className="water-right">➔ H₂O</text><text x="220" y="100" fill="var(--primary-blue)" fontSize="20" className="water-left">➔ H₂O</text></>}
        </svg>
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          当前状态：<strong style={{ color: osm >= 280 && osm <= 320 ? 'var(--life-green)' : (osm < 280 ? 'var(--primary-blue)' : 'var(--alert-red)') }}>{status}</strong><br/>
          红细胞形态：<strong>{cellState}</strong><br/>临床建议：<strong>{advice}</strong>
        </div>
      </div>
    );
  };

  // 渲染热力学平衡
  const renderThermo = () => {
    const dG = (dh - (310 * ds) / 1000).toFixed(2);
    const isSpon = dG < 0;
    const angle = isSpon ? 15 : -15;
    const balanceColor = isSpon ? "#10b981" : "#ef4444";
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <svg width="100%" height="250" viewBox="0 0 400 250">
          <text x="200" y="30" fill="#fff" fontSize="20" textAnchor="middle" fontWeight="bold">吉布斯自由能天平 (ΔG = ΔH - TΔS)</text>
          <polygon points="180,200 220,200 200,160" fill="#64748b"/>
          <g transform={`rotate(${angle}, 200, 160)`} style={{ transition: 'transform 0.5s ease' }}>
            <rect x="50" y="150" width="300" height="10" fill={balanceColor} rx="5"/>
            <rect x="70" y={150 - Math.abs(dh)*1.5} width="60" height={Math.abs(dh)*1.5 + 5} fill={dh < 0 ? '#3b82f6' : '#ef4444'} rx="5"/>
            <text x="100" y={140 - Math.abs(dh)*1.5} fill="#fff" fontSize="14" textAnchor="middle">ΔH {dh}</text>
            <rect x="270" y={150 - Math.abs(ds)*1.5} width="60" height={Math.abs(ds)*1.5 + 5} fill={ds > 0 ? '#10b981' : '#f59e0b'} rx="5"/>
            <text x="300" y={140 - Math.abs(ds)*1.5} fill="#fff" fontSize="14" textAnchor="middle">TΔS</text>
          </g>
          <text x="200" y="230" fill={balanceColor} fontSize="18" textAnchor="middle" fontWeight="bold">系统偏向: {isSpon ? '产物 (自发结合)' : '反应物 (结合解离)'}</text>
        </svg>
        <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          <span style={{ color: balanceColor, fontSize: '1.5em', fontWeight: 'bold' }}>ΔG = {dG} kJ/mol</span><br/>
          <strong>结论：{isSpon ? '结合自发进行 (Spontaneous)。药物能成功靶向结合！' : '结合非自发 (Non-spontaneous)。需改造结构。'}</strong>
        </div>
      </div>
    );
  };

  // 渲染动力学活化能
  const renderKineticsSVG = () => {
    const curvePath = kMode === 'normal' ? "M 50,200 C 100,200 150,20 200,20 C 250,20 300,250 350,250" : "M 50,200 C 120,200 160,120 200,120 C 240,120 280,250 350,250";
    const eaLineY = kMode === 'normal' ? 20 : 120;
    const eaTextY = kMode === 'normal' ? 60 : 140;
    const color = kMode === 'normal' ? '#3b82f6' : '#f59e0b';
    
    return (
      <svg width="100%" height="300" viewBox="0 0 400 300">
        <line x1="40" y1="280" x2="380" y2="280" stroke="#fff" strokeWidth="2"/><line x1="40" y1="280" x2="40" y2="20" stroke="#fff" strokeWidth="2"/>
        <text x="360" y="295" fill="#94a3b8" fontSize="12">反应进程</text><text x="10" y="30" fill="#94a3b8" fontSize="12">能量 E</text>
        <line x1="30" y1="200" x2="80" y2="200" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4"/><text x="40" y="195" fill="#3b82f6" fontSize="12">反应物(药物)</text>
        <line x1="320" y1="250" x2="380" y2="250" stroke="#10b981" strokeWidth="2" strokeDasharray="4"/><text x="330" y="245" fill="#10b981" fontSize="12">产物(降解物)</text>
        <path d={curvePath} fill="none" stroke={color} strokeWidth="4" style={{ transition: 'all 0.8s ease' }}/>
        <line x1="200" y1="200" x2="200" y2={eaLineY} stroke="#fff" strokeWidth="1" strokeDasharray="3,3"/>
        <text x="210" y={eaTextY} fill={color} fontSize="16" fontWeight="bold" style={{ transition: 'all 0.8s ease' }}>Ea 活化能</text>
        <circle r="6" fill="#ef4444"><animateMotion dur="2.5s" repeatCount="indefinite" path={curvePath} /></circle>
      </svg>
    );
  };

  return (
    <div className="kinetics-wrapper">
      <style>{`
        .kinetics-wrapper { --bg-dark: #0b1120; --bg-panel: rgba(30, 41, 59, 0.7); --primary-blue: #3b82f6; --life-green: #10b981; --alert-red: #ef4444; --warm-orange: #f59e0b; --sz-red: #e11d48; --text-main: #f8fafc; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.6; }
        .kinetics-wrapper h1, .kinetics-wrapper h2, .kinetics-wrapper h3 { color: var(--primary-blue); margin-top: 0; }
        .kinetics-wrapper h2 { border-left: 5px solid var(--life-green); padding-left: 15px; margin-bottom: 20px; }
        .kinetics-wrapper section { padding: 40px 10%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .kinetics-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .kinetics-wrapper .panel { background: var(--bg-panel); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .kinetics-wrapper .btn { background: linear-gradient(135deg, var(--primary-blue), var(--life-green)); border: none; padding: 12px 24px; color: #fff; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s; }
        .kinetics-wrapper .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6); }
        .kinetics-wrapper input[type="range"] { width: 100%; accent-color: var(--life-green); }
        .kinetics-wrapper .svg-container { display: flex; flex-direction: column; border: 2px dashed var(--primary-blue); border-radius: 16px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; min-height: 350px; }
        .kinetics-wrapper .quiz-card { background: rgba(0,0,0,0.3); border-radius: 10px; padding: 20px; border-left: 3px solid var(--primary-blue); margin-bottom: 20px; }
        .kinetics-wrapper .quiz-opt { display: block; width: 100%; text-align: left; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 10px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; transition: 0.2s; }
        .kinetics-wrapper .quiz-opt:hover { background: rgba(255,255,255,0.15); }
        .kinetics-wrapper .quiz-opt.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--life-green); color: #fff; }
        .kinetics-wrapper .quiz-opt.wrong { background: rgba(239, 68, 68, 0.2); border-color: var(--alert-red); color: #fff; }
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        @keyframes flowLeft { 0% { transform: translateX(20px); opacity: 0;} 50% {opacity: 1;} 100% { transform: translateX(-20px); opacity: 0;} }
        @keyframes flowRight { 0% { transform: translateX(-20px); opacity: 0;} 50% {opacity: 1;} 100% { transform: translateX(20px); opacity: 0;} }
        .water-left { animation: flowLeft 1.5s infinite; }
        .water-right { animation: flowRight 1.5s infinite; }
      `}</style>

      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e3a8a 0%, var(--bg-dark) 100%)', paddingTop: '60px' }}>
        <svg width="250" height="200" viewBox="0 0 250 200" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 20px #3b82f6)' }}>
          <path d="M 50,20 L 200,20 L 140,100 L 200,180 L 50,180 L 110,100 Z" fill="none" stroke="#3b82f6" strokeWidth="4"/>
          <circle cx="125" cy="140" r="20" fill="#10b981"><animate attributeName="cy" values="60;140" dur="2s" repeatCount="indefinite" /></circle>
          <text x="50" y="105" fill="#fff" fontSize="24" fontWeight="bold">ΔG</text>
          <text x="170" y="105" fill="#fff" fontSize="24" fontWeight="bold">Ea</text>
        </svg>
        <h1 style={{ fontSize: '3rem', marginTop: '20px' }}>生命原动力：热力学、动力学与药学</h1>
        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '40px' }}>“从输液的等渗设计到药物体内代谢的方向，从受体结合的自发性到有效期的预测，一切皆受制于理化法则。”</p>
      </section>

      <section id="module1">
        <h2>模块一：稀溶液依数性与临床输液安全</h2>
        <div className="grid-2">
          <div className="panel">
            <h3>红细胞渗透压模拟器 (Π = icRT)</h3>
            <p style={{ color: '#cbd5e1', fontSize: '14px' }}>人体血浆渗透压约为 <strong>300 mmol/L (等渗)</strong>。请拖动滑块调节外部静脉输液的浓度，观察水分子的跨膜移动及影响。</p>
            <div style={{ marginTop: '30px' }}>
              <label>外部输液渗透浓度: <span style={{ color: 'var(--primary-blue)' }}>{osm}</span> mmol/L</label>
              <input type="range" min="100" max="500" value={osm} step="10" onChange={e => setOsm(parseInt(e.target.value))} />
            </div>
          </div>
          <div className="svg-container">{renderOsmosis()}</div>
        </div>
      </section>

      <section>
        <h2>模块二：热力学第二定律 (药物-受体结合的自发性)</h2>
        <div className="grid-2">
          <div className="svg-container">{renderThermo()}</div>
          <div className="panel">
            <h3>ΔG = ΔH - TΔS</h3>
            <p style={{ color: '#cbd5e1' }}>调节药物结合过程中的<strong>焓变(ΔH)</strong>和<strong>熵变(ΔS)</strong>，判断能否自发结合。</p>
            <div style={{ marginBottom: '20px' }}>
              <label>焓变 ΔH (吸/放热): {dh} kJ/mol</label>
              <input type="range" min="-50" max="50" value={dh} onChange={e => setDh(parseInt(e.target.value))} />
            </div>
            <div>
              <label>熵变 ΔS (混乱度变化): {ds} J/(mol·K)</label>
              <input type="range" min="-100" max="100" value={ds} onChange={e => setDs(parseInt(e.target.value))} />
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>* 假设体温 T = 310 K (37℃)</p>
          </div>
        </div>
      </section>

      <section>
        <h2>模块三：化学动力学 (活化能屏障与催化酶)</h2>
        <div className="grid-2">
          <div className="panel">
            <h3>阿伦尼乌斯方程与活化能 (Ea)</h3>
            <p style={{ color: '#cbd5e1' }}>为什么多数药物需阴凉处避光保存？为什么体内生化反应能在37℃下极速进行？</p>
            <div style={{ margin: '20px 0' }}>
              <button className="btn" style={{ width: '100%', marginBottom: '10px' }} onClick={() => setKMode('normal')}>🌡️ 室温下药物缓慢降解 (无酶)</button>
              <button className="btn" style={{ width: '100%', background: 'var(--warm-orange)' }} onClick={() => setKMode('enzyme')}>🧬 生物酶催化 (极速代谢)</button>
            </div>
            <div style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              {kMode === 'normal' ? '活化能 (Ea) 屏障极高，常温下仅极少数活化分子能越过，药物可保质2-3年。' : '酶通过改变反应路径，极大降低了 Ea，温和体温下分子也能瞬间越过屏障。'}
            </div>
          </div>
          <div className="svg-container" style={{ alignItems: 'flex-start' }}>{renderKineticsSVG()}</div>
        </div>
      </section>

      <section>
        <h2>模块四：课程思政与专业考核</h2>
        <div className="grid-2">
          <div className="panel" style={{ background: 'rgba(225, 29, 72, 0.1)', borderColor: 'var(--sz-red)' }}>
            <h3 style={{ color: 'var(--sz-red)' }}>🚩 课程思政：科学严谨与生命至上</h3>
            <p><strong>1. 敬畏生命：</strong> 临床输液等渗要求事关患者生死红线。低渗导致溶血，高渗导致脱水。</p>
            <p><strong>2. 创新报国：</strong> 屠呦呦提取青蒿素时，改用低沸点乙醚冷萃取，克服了高温下的动力学加速降解，这是热力学与动力学原理在原创新药中的伟大应用。</p>
          </div>
          <div>
            <div className="quiz-card">
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>1. 为防止输液发生溶血，必须考虑渗透压。哪种属于等渗溶液？</p>
              <button className={`quiz-opt ${quizState.q1?.sel === 'A' ? 'wrong' : ''}`} onClick={() => setQuizState({ ...quizState, q1: { sel: 'A', res: 'KCl 不是用于大量静脉输液的等渗液。' } })}>A. 0.9% 氯化钾溶液</button>
              <button className={`quiz-opt ${quizState.q1?.sel === 'B' ? 'correct' : ''}`} onClick={() => setQuizState({ ...quizState, q1: { sel: 'B', res: '正确！0.9% NaCl 或 5% GS 是标准的等渗溶液。' } })}>B. 0.9% 氯化钠溶液 或 5% 葡萄糖溶液</button>
              {quizState.q1 && <p style={{ color: quizState.q1.sel === 'B' ? 'var(--life-green)' : 'var(--alert-red)', fontSize: '13px' }}>{quizState.q1.res}</p>}
            </div>
            <div className="quiz-card">
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>2. 大分子药物与受体结合伴随水分子的释放（疏水效应）。其自发结合（ΔG &lt; 0）的主要驱动力是：</p>
              <button className={`quiz-opt ${quizState.q2?.sel === 'A' ? 'wrong' : ''}`} onClick={() => setQuizState({ ...quizState, q2: { sel: 'A', res: '结合过程中氢键重组，焓变贡献通常不大。' } })}>A. 焓变驱动 (ΔH 变得极负)</button>
              <button className={`quiz-opt ${quizState.q2?.sel === 'B' ? 'correct' : ''}`} onClick={() => setQuizState({ ...quizState, q2: { sel: 'B', res: '正确！水分子释放导致系统混乱度显著增加，即熵变 (ΔS > 0) 驱动。' } })}>B. 熵变驱动 (水分子释放导致混乱度 ΔS 增加)</button>
              {quizState.q2 && <p style={{ color: quizState.q2.sel === 'B' ? 'var(--life-green)' : 'var(--alert-red)', fontSize: '13px' }}>{quizState.q2.res}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
          <h3 style={{ marginTop: 0, color: 'var(--life-green)', fontSize: '15px' }}>动力学与热力学 AI助教</h3>
          <div style={{ height: '220px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '8px', color: msg.role === 'ai' ? 'var(--primary-blue)' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong>
                <div className="markdown-prose" style={{ color: '#cbd5e1' }}>
                  {msg.role === 'ai' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="输入问题..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: '#1e293b', color: '#fff', fontSize: '13px', outline: 'none' }} />
            <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'var(--primary-blue)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span></button>
          </div>
        </div>
      )}
    </div>
  );
}