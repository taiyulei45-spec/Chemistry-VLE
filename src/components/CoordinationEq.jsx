import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function CoordinationEq() {
  // ==========================================
  // 状态管理
  // ==========================================
  const [fieldStrength, setFieldStrength] = useState(20);
  const [isChelated, setIsChelated] = useState(false);

  const [quizState, setQuizState] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是无机化学AI助教。关于“晶体场理论、顺铂构型或EDTA螯合热力学”，你有什么疑问吗？' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 实验室 1：晶体场分裂 (CFT) 计算
  // ==========================================
  const isStrongField = fieldStrength > 60;
  const deltaO = 30 + (fieldStrength * 0.9);
  const baseY = 200;
  const t2gY = baseY + (deltaO * 0.4);
  const egY = baseY - (deltaO * 0.6);

  const renderCFT = () => {
    const drawElectron = (x, y, dir) => {
      const arrow = dir === 'up' ? `M${x-4},${y-3} L${x},${y-12} L${x+4},${y-3} M${x},${y-12} L${x},${y+8}` : `M${x-4},${y+3} L${x},${y+12} L${x+4},${y+3} M${x},${y+12} L${x},${y-8}`;
      return <path d={arrow} stroke="#38bdf8" strokeWidth="2" fill="none" />;
    };

    return (
      <svg width="100%" height="100%" viewBox="0 0 400 300">
        <text x="20" y="30" fill="#94a3b8" fontSize="14">能量 E</text>
        <line x1="40" y1="280" x2="40" y2="40" stroke="#475569" strokeWidth="2" markerEnd="url(#cft_arrow)"/>
        <defs>
          <marker id="cft_arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" /></marker>
        </defs>
        
        <text x="50" y="240" fill="#64748b" fontSize="12">简并 d 轨道</text>
        {[60, 95, 130, 165, 200].map(x => <line key={x} x1={x} y1="200" x2={x+30} y2="200" stroke="#64748b" strokeWidth="3"/>)}

        <text x="350" y={egY + 5} fill="var(--primary-plat)" fontSize="14">e_g</text>
        <line x1="260" y1={egY} x2="290" y2={egY} stroke="var(--primary-plat)" strokeWidth="3"/>
        <line x1="300" y1={egY} x2="330" y2={egY} stroke="var(--primary-plat)" strokeWidth="3"/>

        <text x="350" y={t2gY + 5} fill="var(--primary-plat)" fontSize="14">t_2g</text>
        {[240, 280, 320].map(x => <line key={x} x1={x} y1={t2gY} x2={x+30} y2={t2gY} stroke="var(--primary-plat)" strokeWidth="3"/>)}

        <line x1="220" y1={egY} x2="240" y2={egY} stroke="#ef4444" strokeWidth="1" strokeDasharray="2"/>
        <line x1="220" y1={t2gY} x2="240" y2={t2gY} stroke="#ef4444" strokeWidth="1" strokeDasharray="2"/>
        <path d={`M 230,${egY} L 230,${t2gY}`} fill="none" stroke="#ef4444" strokeWidth="2" markerStart="url(#cft_arrow)" markerEnd="url(#cft_arrow)"/>
        <text x="195" y={baseY} fill="#ef4444" fontWeight="bold">Δo</text>

        {!isStrongField ? (
          <g>
            {drawElectron(250, t2gY, 'up')}{drawElectron(260, t2gY, 'down')}
            {drawElectron(295, t2gY, 'up')}{drawElectron(335, t2gY, 'up')}
            {drawElectron(275, egY, 'up')}{drawElectron(315, egY, 'up')}
          </g>
        ) : (
          <g>
            {drawElectron(250, t2gY, 'up')}{drawElectron(260, t2gY, 'down')}
            {drawElectron(290, t2gY, 'up')}{drawElectron(300, t2gY, 'down')}
            {drawElectron(330, t2gY, 'up')}{drawElectron(340, t2gY, 'down')}
            <text x="290" y={t2gY + 30} fill="var(--heme-red)" fontWeight="bold" fontSize="16" textAnchor="middle" opacity="0.8">
              极高晶体场稳定化能! 毒性锁定!
              <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite"/>
            </text>
          </g>
        )}
      </svg>
    );
  };

  // ==========================================
  // 实验室 2：EDTA 模拟
  // ==========================================
  const renderChelate = () => {
    const renderH2O = (i, moving) => {
      const angle = (i * 60) * Math.PI / 180;
      const xStart = 200 + 80 * Math.cos(angle);
      const yStart = 130 + 80 * Math.sin(angle);
      const xEnd = 200 + 150 * Math.cos(angle);
      const yEnd = 130 + 150 * Math.sin(angle);
      if (!moving) {
        const x = 200 + 60 * Math.cos(angle);
        const y = 130 + 60 * Math.sin(angle);
        return (
          <g key={i}>
            <line x1="200" y1="130" x2={x} y2={y} stroke="#475569" strokeWidth="2" strokeDasharray="3"/>
            <circle cx={x} cy={y} r="12" fill="var(--primary-plat)"/>
            <text x={x} y={y+4} fill="#000" fontSize="10" textAnchor="middle">H₂O</text>
          </g>
        );
      }
      return (
        <g key={i}>
          <circle cx={xStart} cy={yStart} r="10" fill="rgba(203, 213, 225, 0.5)">
            <animate attributeName="cx" values={`${xStart}; ${xEnd}`} dur="2s" fill="freeze"/>
            <animate attributeName="cy" values={`${yStart}; ${yEnd}`} dur="2s" fill="freeze"/>
            <animate attributeName="opacity" values="1; 0" dur="2s" fill="freeze"/>
          </circle>
          <text x={xStart} y={yStart+3} fill="#fff" fontSize="8" textAnchor="middle">H₂O
            <animate attributeName="x" values={`${xStart}; ${xEnd}`} dur="2s" fill="freeze"/>
            <animate attributeName="y" values={`${yStart+3}; ${yEnd+3}`} dur="2s" fill="freeze"/>
            <animate attributeName="opacity" values="1; 0" dur="2s" fill="freeze"/>
          </text>
        </g>
      );
    };

    return (
      <svg width="100%" height="100%" viewBox="0 0 400 250">
        <text x="200" y="30" fill="#94a3b8" fontSize="14" textAnchor="middle">水溶液中的游离铅离子 (毒性沉积态)</text>
        <circle cx="200" cy="130" r="18" fill="#64748b"/>
        <text x="200" y="135" fill="#fff" fontWeight="bold" fontSize="14" textAnchor="middle">Pb²⁺</text>
        
        {!isChelated ? (
          <React.Fragment>
            {[0,1,2,3,4,5].map(i => renderH2O(i, false))}
            <text x="200" y="230" fill="var(--primary-plat)" fontSize="16" fontWeight="bold" textAnchor="middle">微粒总数: 2 (1个水合铅离子 + 1个待反应的EDTA)</text>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <path d="M 170,80 Q 200,60 230,80 Q 260,130 230,180 Q 200,200 170,180 Q 140,130 170,80 Z" fill="rgba(16,185,129,0.2)" stroke="var(--life-green)" strokeWidth="4"/>
            <circle cx="170" cy="80" r="8" fill="var(--life-green)"/><text x="170" y="83" fill="#fff" fontSize="8" textAnchor="middle">O</text>
            <circle cx="230" cy="80" r="8" fill="var(--life-green)"/><text x="230" y="83" fill="#fff" fontSize="8" textAnchor="middle">O</text>
            <circle cx="150" cy="130" r="8" fill="#38bdf8"/><text x="150" y="133" fill="#fff" fontSize="8" textAnchor="middle">N</text>
            <circle cx="250" cy="130" r="8" fill="#38bdf8"/><text x="250" y="133" fill="#fff" fontSize="8" textAnchor="middle">N</text>
            <circle cx="170" cy="180" r="8" fill="var(--life-green)"/><text x="170" y="183" fill="#fff" fontSize="8" textAnchor="middle">O</text>
            <circle cx="230" cy="180" r="8" fill="var(--life-green)"/><text x="230" y="183" fill="#fff" fontSize="8" textAnchor="middle">O</text>
            <text x="200" y="90" fill="var(--life-green)" fontWeight="bold" fontSize="12" textAnchor="middle">EDTA⁴⁻</text>
            {[0,1,2,3,4,5].map(i => renderH2O(i, true))}
            <text x="200" y="230" fill="var(--sz-gold)" fontSize="16" fontWeight="bold" textAnchor="middle">微粒总数: 7 -{">"} 熵剧烈增大 (ΔS&gt;0)!</text>
          </React.Fragment>
        )}
      </svg>
    );
  };

  // ==========================================
  // 真 AI 助手逻辑
  // ==========================================
  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton) {
      if (e.key !== 'Enter') return;
      if (e.nativeEvent.isComposing) return;
    }
    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在深度思考...' }]);

    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, '配位化学与晶体场理论');
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply };
        return newHistory;
      });
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 神经中枢连接断开，请检查网络。' };
        return newHistory;
      });
    }
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatOpen]);

  const submitQuiz = () => {
    if (quizState.q1 === 'B' && quizState.q2 === 'C') setQuizState({ ...quizState, res: "✅ 回答完美！您精准掌握了价键理论与抗癌机制的联系，以及螯合效应底层的热力学规律！", color: "var(--life-green)" });
    else setQuizState({ ...quizState, res: "❌ 存在错误。提示：铂为d8排布常形成平面正方形；多齿配位导致颗粒数增加属于系统混乱度增加。", color: "var(--alert-orange)" });
  };

  return (
    <div className="coord-wrapper">
      <style>{`
        .coord-wrapper { --bg-dark: #0f172a; --bg-panel: rgba(30, 41, 59, 0.75); --primary-plat: #cbd5e1; --heme-red: #e11d48; --life-green: #10b981; --alert-orange: #f59e0b; --text-main: #f8fafc; --sz-gold: #fbbf24; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
        .coord-wrapper h1, .coord-wrapper h2, .coord-wrapper h3 { color: var(--primary-plat); }
        .coord-wrapper h2 { border-left: 5px solid var(--heme-red); padding-left: 15px; margin-bottom: 30px; }
        .coord-wrapper section { padding: 40px 5%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .coord-wrapper .btn { background: linear-gradient(135deg, var(--heme-red), #9f1239); border: none; padding: 12px 24px; color: #fff; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(225, 29, 72, 0.3); }
        .coord-wrapper .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(225, 29, 72, 0.6); }
        .coord-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .coord-wrapper .panel { background: var(--bg-panel); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .coord-wrapper .slider-group { margin-bottom: 20px; }
        .coord-wrapper .slider-group label { display: block; margin-bottom: 8px; font-weight: bold; color: var(--primary-plat); }
        .coord-wrapper input[type="range"] { width: 100%; accent-color: var(--heme-red); }
        .coord-wrapper .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .coord-wrapper .summary-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--heme-red); border-radius: 12px; padding: 25px; transition: all 0.3s; box-shadow: inset 0 0 20px rgba(225, 29, 72, 0.05); }
        .coord-wrapper .summary-card:hover { transform: translateY(-5px); border-color: var(--primary-plat); }
        .coord-wrapper .svg-container { display: flex; align-items: center; justify-content: center; flex-direction: column; border: 2px dashed var(--heme-red); border-radius: 16px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; position: relative; min-height: 400px; overflow: hidden; }
        .coord-wrapper .quiz-item { margin-bottom: 20px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; border-left: 3px solid var(--heme-red);}
        .coord-wrapper .quiz-item p { margin-top: 0; font-weight: bold; }
        .coord-wrapper .quiz-item label { display: block; margin: 8px 0; cursor: pointer; padding: 8px; border-radius: 5px; transition: 0.2s; background: rgba(255,255,255,0.05);}
        .coord-wrapper .quiz-item label:hover { background: rgba(255,255,255,0.15); }
        .coord-wrapper .ai-bot { position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; background: linear-gradient(135deg, var(--heme-red), #9f1239); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; box-shadow: 0 0 20px rgba(225, 29, 72, 0.6); z-index: 100; transition: transform 0.3s; }
        .coord-wrapper .ai-bot:hover { transform: scale(1.1); }
        .coord-wrapper .ai-chat-window { position: fixed; bottom: 80px; right: 20px; width: 340px; background: var(--bg-dark); border: 1px solid var(--heme-red); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
        
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        .markdown-prose p:last-child { margin-bottom: 0; }
        .markdown-prose strong { font-weight: 700; color: inherit; }
        .markdown-prose ul, .markdown-prose ol { margin-top: 4px; margin-bottom: 8px; padding-left: 20px; }
        .markdown-prose li { margin-bottom: 4px; }
      `}</style>

      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #2e0916 0%, var(--bg-dark) 100%)', paddingTop: '40px' }}>
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
        <h1 style={{ fontSize: '2.5rem', background: '-webkit-linear-gradient(45deg, #cbd5e1, #e11d48)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>生命配位：结构与药理的交响</h1>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>“从顺铂的抗癌奇迹，到血红蛋白的死亡锁死。配位键的得失，决定了生命的呼吸与存亡。”</p>
      </section>

      <section>
        <h2>理论先导：配位理论与药学核心应用</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🧬</div><h3 style={{ color: '#fff', marginTop: 0 }}>1. 空间构型与靶向</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>中心金属离子的杂化轨道类型决定了配合物的空间构型。</p>
            <div style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.15)', color: '#fda4af', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', border: '1px solid var(--heme-red)' }}>🔬 药学应用：顺铂抗癌</div>
          </div>
          <div className="summary-card">
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⚡</div><h3 style={{ color: '#fff', marginTop: 0 }}>2. 晶体场理论 (CFT)</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>不同场强的配体会导致中心离子 d 轨道发生不同程度的能级分裂 (Δo)。</p>
            <div style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.15)', color: '#fda4af', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', border: '1px solid var(--heme-red)' }}>🩸 药学应用：CO中毒机制</div>
          </div>
          <div className="summary-card">
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🔄</div><h3 style={{ color: '#fff', marginTop: 0 }}>3. 螯合效应与熵增</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>多齿配体取代单齿水分子，使体系微粒数剧增，导致极大的混乱度增加 (ΔS &gt; 0)。</p>
            <div style={{ display: 'inline-block', background: 'rgba(225, 29, 72, 0.15)', color: '#fda4af', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', border: '1px solid var(--heme-red)' }}>🚑 药学应用：重金属解毒</div>
          </div>
        </div>
      </section>

      <section>
        <h2>交互微观 一：晶体场分裂 (CFT) —— CO“锁喉”机制</h2>
        <div className="grid-2">
          <div className="panel">
            <p style={{ color: '#cbd5e1', fontSize: '14px' }}>拖动滑块增强配体场强 (模拟从 O₂ 替换为 CO)，观察 d 轨道分裂与电子跃迁。</p>
            <div className="slider-group">
              <label>配体场强: <span style={{ color: isStrongField ? 'var(--heme-red)' : 'var(--life-green)', fontSize: '1.2em' }}>{isStrongField ? "极强场 (如 CO, CN⁻)" : "弱场/中等场 (如 H₂O, O₂)"}</span></label>
              <input type="range" min="1" max="100" value={fieldStrength} onChange={e => setFieldStrength(parseInt(e.target.value))} />
            </div>
            <div style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', lineHeight: 1.6, fontSize: '14px' }}>
              分裂能与成对能：<strong style={{ color: isStrongField ? 'var(--heme-red)' : 'var(--life-green)' }}>{isStrongField ? "Δo > P (迫使成对)" : "Δo < P (小于成对能)"}</strong><br/>
              电子排布与磁性：<strong style={{ color: isStrongField ? 'var(--heme-red)' : 'var(--life-green)' }}>{isStrongField ? "低自旋态，抗磁性" : "高自旋，顺磁性"}</strong><br/>
              临床表现：<strong style={{ color: isStrongField ? 'var(--heme-red)' : 'var(--life-green)' }}>{isStrongField ? "不可逆死锁！巨大稳定化能致窒息" : "正常可逆结合"}</strong>
            </div>
          </div>
          <div className="svg-container" style={{ background: '#0b0f19' }}>{renderCFT()}</div>
        </div>
      </section>

      <section>
        <h2>交互微观 二：螯合效应 —— 熵驱动的重金属“囚笼”</h2>
        <div className="grid-2">
          <div className="svg-container" style={{ background: '#111827' }}>{renderChelate()}</div>
          <div className="panel">
            <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
              解毒原理：EDTA通过六个配位原子像“八爪鱼”包裹住 Pb²⁺，挤出 6 个水分子。体系微粒数从 2 变成 7，熵(S)极度增加，螯合物坚不可摧。
            </p>
            <button className="btn" style={{ width: '100%', marginBottom: '10px', background: 'var(--life-green)' }} onClick={() => setIsChelated(true)}>🐙 滴注 EDTA 观察熵增</button>
            <button className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid var(--primary-plat)' }} onClick={() => setIsChelated(false)}>🔄 恢复水合态</button>
          </div>
        </div>
      </section>

      <section>
        <h2>教学闭环：课程思政与随堂挑战</h2>
        <div className="grid-2">
          <div className="panel" style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'var(--sz-gold)' }}>
            <h3 style={{ color: 'var(--sz-gold)' }}>🚩 课程思政：科学探索精神</h3>
            <p style={{ fontSize: '13px' }}>顺铂的奇迹在于 $dsp^2$ 的完美“平面正方形”。我们要学习透过病理宏观现象，利用化学逻辑挖掘微观根源。</p>
          </div>
          <div>
            <div className="quiz-item">
              <p>1. 顺铂 Pt²⁺ 的 d⁸ 杂化轨道及构型：</p>
              <label><input type="radio" name="q1" onChange={() => setQuizState({...quizState, q1: 'A'})}/> A. sp³ 杂化，正四面体</label>
              <label><input type="radio" name="q1" onChange={() => setQuizState({...quizState, q1: 'B'})}/> B. dsp² 杂化，平面正方形</label>
            </div>
            <div className="quiz-item">
              <p>2. EDTA 替代氨水解毒重金属的超强稳定性驱动力：</p>
              <label><input type="radio" name="q2" onChange={() => setQuizState({...quizState, q2: 'A'})}/> A. 焓变驱动</label>
              <label><input type="radio" name="q2" onChange={() => setQuizState({...quizState, q2: 'C'})}/> C. 熵变驱动：取代水分子导致微粒数增加，混乱度显著增大</label>
            </div>
            <button className="btn" onClick={submitQuiz}>提交</button>
            <p style={{ marginTop: '15px', fontWeight: 'bold', color: quizState.color }}>{quizState.res}</p>
          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
          <h3 style={{ marginTop: 0, color: 'var(--heme-red)', fontSize: '15px' }}>配位平衡 AI助教</h3>
          <div style={{ height: '220px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: 'var(--text-muted)', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '8px', color: msg.role === 'ai' ? 'var(--primary-plat)' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong> 
                <div className="markdown-prose">
                  {msg.role === 'ai' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="输入问题..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: '#1e293b', color: '#fff', fontSize: '13px', outline: 'none' }} />
            <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'var(--heme-red)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}