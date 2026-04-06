import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function Thermodynamics() {
  const [colligativeType, setColligativeType] = useState('vp');
  const [collConc, setCollConc] = useState(0);
  const [catMode, setCatMode] = useState(false);

  const [quizState, setQuizState] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！关于“依数性、焓变、反应级数或盖斯定律”，你有什么疑问吗？' }
  ]);
  const chatEndRef = useRef(null);

  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton && (e.key !== 'Enter' || e.nativeEvent.isComposing)) return;
    const userText = chatInput.trim();
    if (!userText) return;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在深度思考...' }]);
    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, '化学反应基础与热力学');
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply };
        return newHistory;
      });
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 网络异常。' };
        return newHistory;
      });
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  const renderColligative = () => {
    if (colligativeType === 'vp') {
      let vaporCount = 40 - Math.floor(collConc * 0.3);
      let soluteCount = Math.floor(collConc * 0.4);
      return (
        <svg width="250" height="250" viewBox="0 0 100 100">
          <path d="M 20 10 L 20 90 L 80 90 L 80 10" fill="none" stroke="#fff" strokeWidth="2"/>
          <rect x="21" y="50" width="58" height="39" fill="rgba(6, 182, 212, 0.4)" />
          <line x1="21" y1="50" x2="79" y2="50" stroke="var(--primary-blue)" strokeWidth="2"/>
          {Array.from({ length: vaporCount }).map((_, i) => <circle key={`v_${i}`} cx={25 + Math.random()*50} cy={15 + Math.random()*30} r="1.5" fill="#fff" opacity="0.8"/>)}
          {Array.from({ length: soluteCount }).map((_, i) => <circle key={`s_${i}`} cx={25 + Math.random()*50} cy={55 + Math.random()*30} r="2" fill="var(--alert-orange)"/>)}
        </svg>
      );
    } else if (colligativeType === 'bp') {
      let tempLevel = 70 - (collConc * 0.4);
      return (
        <svg width="150" height="250" viewBox="0 0 100 150">
          <rect x="40" y="20" width="20" height="100" rx="10" fill="none" stroke="#fff" strokeWidth="2"/>
          <circle cx="50" cy="120" r="15" fill="var(--alert-red)"/>
          <rect x="44" y={tempLevel} width="12" height={120-tempLevel} fill="var(--alert-red)"/>
          <line x1="65" y1="70" x2="75" y2="70" stroke="#fff" strokeWidth="1"/><text x="80" y="73" fill="#fff" fontSize="10">纯水Tb</text>
        </svg>
      );
    } else if (colligativeType === 'fp') {
      let tempLevel = 50 + (collConc * 0.5);
      return (
        <svg width="150" height="250" viewBox="0 0 100 150">
          <rect x="40" y="20" width="20" height="100" rx="10" fill="none" stroke="#fff" strokeWidth="2"/>
          <circle cx="50" cy="120" r="15" fill="var(--primary-blue)"/>
          <rect x="44" y={tempLevel} width="12" height={120-tempLevel} fill="var(--primary-blue)"/>
          <line x1="65" y1="50" x2="75" y2="50" stroke="#fff" strokeWidth="1"/><text x="80" y="53" fill="#fff" fontSize="10">纯水Tf</text>
        </svg>
      );
    } else {
      let leftLevel = 60 + (collConc * 0.2);
      let rightLevel = 60 - (collConc * 0.3);
      return (
        <svg width="250" height="250" viewBox="0 0 100 100">
          <path d="M 20 20 L 20 80 Q 20 90 50 90 Q 80 90 80 80 L 80 20" fill="none" stroke="#fff" strokeWidth="4"/>
          <line x1="50" y1="80" x2="50" y2="92" stroke="var(--alert-orange)" strokeWidth="3" strokeDasharray="2"/>
          <path d={`M 22 ${leftLevel} L 22 80 Q 22 88 48 88 L 48 88 L 48 ${leftLevel} Z`} fill="rgba(6, 182, 212, 0.5)"/>
          <path d={`M 52 88 Q 78 88 78 80 L 78 ${rightLevel} L 52 ${rightLevel} Z`} fill="rgba(139, 92, 246, 0.6)"/>
          <path d="M 40 85 L 60 85" stroke="var(--cyan-glow)" strokeWidth="2" markerEnd="url(#arrow_o)"/>
          <defs><marker id="arrow_o" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cyan-glow)" /></marker></defs>
          <text x="25" y="15" fill="#fff" fontSize="8">纯溶剂</text><text x="65" y="15" fill="#fff" fontSize="8">溶液</text>
        </svg>
      );
    }
  };

  const renderKinetics = () => {
    let color = catMode ? 'var(--life-green)' : 'var(--alert-orange)';
    let path = catMode ? "M 100 130 Q 150 80 200 80 T 300 160" : "M 100 130 Q 150 20 200 20 T 300 160";
    return (
      <svg width="350" height="200" viewBox="0 0 400 200">
        <line x1="40" y1="180" x2="380" y2="180" stroke="#fff" strokeWidth="2"/><line x1="40" y1="180" x2="40" y2="20" stroke="#fff" strokeWidth="2"/>
        <text x="180" y="195" fill="var(--text-muted)" fontSize="12">反应进度 (ξ)</text><text x="5" y="100" fill="var(--text-muted)" fontSize="12" transform="rotate(-90 15 100)">势能 (E)</text>
        <line x1="40" y1="130" x2="100" y2="130" stroke="var(--cyan-glow)" strokeWidth="3"/><text x="50" y="125" fill="var(--cyan-glow)" fontSize="12">反应物</text>
        <line x1="300" y1="160" x2="360" y2="160" stroke="var(--cyan-glow)" strokeWidth="3"/><text x="310" y="155" fill="var(--cyan-glow)" fontSize="12">产物</text>
        <path d={path} fill="none" stroke={color} strokeWidth="4"/>
        <line x1="200" y1={catMode?80:20} x2="200" y2="130" stroke={color} strokeWidth="1" strokeDasharray="2"/><text x="210" y={catMode?110:80} fill={color} fontSize="14" fontWeight="bold">Ea{catMode?"'":""}</text>
      </svg>
    );
  };

  return (
    <div className="thermo-wrapper">
      <style>{`
        .thermo-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(20, 30, 48, 0.7); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --pink-glow: #ec4899; --text-main: #f8fafc; --text-muted: #cbd5e1; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }
        .thermo-wrapper h1, .thermo-wrapper h2, .thermo-wrapper h3 { color: var(--cyan-glow); }
        .thermo-wrapper h2 { border-left: 5px solid var(--primary-blue); padding-left: 15px; margin-bottom: 20px; margin-top: 40px; }
        .thermo-wrapper section { padding: 40px 10%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .thermo-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; margin: 5px; }
        .thermo-wrapper .btn-outline:hover, .thermo-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); border-color: var(--cyan-glow); color: #fff; }
        .thermo-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .thermo-wrapper .panel { background: var(--bg-panel); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .thermo-wrapper .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .thermo-wrapper .summary-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--primary-blue); border-radius: 12px; padding: 25px; transition: all 0.3s; box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.05); }
        .thermo-wrapper .formula-box { background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; font-family: monospace; color: var(--alert-orange); border-left: 3px solid var(--alert-orange); margin: 15px 0; text-align: center; font-size: 1.1em; }
        .thermo-wrapper .svg-container { display: flex; align-items: center; justify-content: center; flex-direction: column; border: 2px dashed var(--purple-med); border-radius: 16px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; min-height: 350px; }
        .thermo-wrapper .quiz-card { background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; border-left: 4px solid var(--purple-med); margin-bottom: 15px; }
        .thermo-wrapper .quiz-opt { display: block; width: 100%; text-align: left; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); padding: 10px 15px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; transition: 0.2s; font-size: 14px; }
        .thermo-wrapper .quiz-opt.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--life-green); color: #fff; }
        .thermo-wrapper .quiz-opt.wrong { background: rgba(239, 68, 68, 0.2); border-color: var(--alert-red); color: #fff; }
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
      `}</style>

      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', paddingTop: '40px' }}>
        <svg width="400" height="200" viewBox="0 0 400 200" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 20px var(--primary-blue))' }}>
          <path d="M 50 150 Q 150 150 200 80 T 350 50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeDasharray="8"/>
          <path d="M 50 150 Q 150 150 200 100 T 350 20" fill="none" stroke="var(--cyan-glow)" strokeWidth="4"/>
          <circle cx="50" cy="150" r="10" fill="var(--alert-orange)"/><circle cx="350" cy="20" r="10" fill="var(--life-green)"/>
          <text x="50" y="180" fill="var(--text-muted)" fontSize="14" textAnchor="middle">反应物 (始态)</text><text x="350" y="50" fill="var(--text-muted)" fontSize="14" textAnchor="middle">产物 (终态)</text>
          <circle r="6" fill="#fff"><animateMotion dur="3s" repeatCount="indefinite" path="M 50 150 Q 150 150 200 100 T 350 20"/></circle>
        </svg>
        <h1 style={{ fontSize: '3rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>化学反应基础：从微观到宏观</h1>
      </section>

      <section id="module1">
        <h2>模块一：理论要点概览</h2>
        <div className="summary-grid">
          <div className="summary-card"><h3>💧 稀溶液理论</h3><p style={{ fontSize: '14px' }}>性质仅与所含溶质的粒子数目成正比，而与溶质本性无关。</p></div>
          <div className="summary-card"><h3>🔥 化学热力学</h3><p style={{ fontSize: '14px' }}>研究能量转化与方向。涉及内能(U)、焓(H)、热(q)与功(w)。</p></div>
          <div className="summary-card"><h3>⏱️ 化学动力学</h3><p style={{ fontSize: '14px' }}>研究反应速率及机理。探讨温度、催化剂等因素改变活化能(Ea)。</p></div>
        </div>
      </section>

      <section id="module2">
        <h2>模块二：稀溶液依数性</h2>
        <div className="grid-2">
          <div className="panel">
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className={`btn-outline ${colligativeType === 'vp' ? 'active' : ''}`} onClick={() => setColligativeType('vp')}>蒸气压下降</button>
              <button className={`btn-outline ${colligativeType === 'bp' ? 'active' : ''}`} onClick={() => setColligativeType('bp')}>沸点升高</button>
              <button className={`btn-outline ${colligativeType === 'fp' ? 'active' : ''}`} onClick={() => setColligativeType('fp')}>凝固点降低</button>
              <button className={`btn-outline ${colligativeType === 'op' ? 'active' : ''}`} onClick={() => setColligativeType('op')}>渗透压</button>
            </div>
            <div style={{ marginTop: '25px' }}>
              <label>调节溶质浓度：</label><input type="range" min="0" max="100" value={collConc} onChange={e => setCollConc(parseInt(e.target.value))} />
            </div>
          </div>
          <div className="svg-container">{renderColligative()}</div>
        </div>
      </section>

      <section id="module3">
        <h2>模块三与四：热力学与动力学基础</h2>
        <div className="grid-2">
          <div className="panel">
            <h3>热力学第一定律与盖斯定律</h3>
            <div className="formula-box">ΔU = q + w <br/> ΔrHm = Σ ΔrHm(分步)</div>
            <p>热力学决定了反应的“能不能”（自发性与方向）。</p>
          </div>
          <div className="svg-container">
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <button className={`btn-outline ${!catMode ? 'active' : ''}`} onClick={() => setCatMode(false)}>无催化剂</button>
              <button className={`btn-outline ${catMode ? 'active' : ''}`} onClick={() => setCatMode(true)}>加入催化剂</button>
            </div>
            {renderKinetics()}
            <p style={{ color: 'var(--alert-orange)', fontSize: '14px', textAlign: 'center' }}>催化剂只改变路径降低 Ea，但不改变始末态能量差！</p>
          </div>
        </div>
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: 'var(--alert-orange)' }}>⚔️ 思维道场：动力学与热力学辨析</h3>
          <div className="grid-2">
            <div className="quiz-card"><p style={{ fontWeight: 'bold' }}>1. 钻石变石墨在热力学上是自发的(ΔG &lt; 0)。你的钻戒会变成铅笔芯吗？</p>
              <button className={`quiz-opt ${quizState.q1?.sel === 'B' ? 'correct' : (quizState.q1?.sel ? 'wrong' : '')}`} onClick={() => setQuizState({ ...quizState, q1: { sel: 'B' } })}>B. 不会，热力学自发不代表动力学迅速，常温下重排活化能极高，反应速率几乎为零。</button>
            </div>
            <div className="quiz-card"><p style={{ fontWeight: 'bold' }}>2. 合成氨工业中加入优异催化剂，能提高最终氨气的产量限度吗？</p>
              <button className={`quiz-opt ${quizState.q2?.sel === 'B' ? 'correct' : (quizState.q2?.sel ? 'wrong' : '')}`} onClick={() => setQuizState({ ...quizState, q2: { sel: 'B' } })}>B. 不能，催化剂只缩短达到平衡的时间，不改变热力学平衡常数。</button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--cyan-glow), var(--purple-med))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', cursor: 'pointer', zIndex: 100 }}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block', position: 'fixed', bottom: '100px', right: '30px', width: '340px', background: 'var(--bg-dark)', border: '1px solid var(--purple-med)', borderRadius: '12px', padding: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '15px' }}>化学原理 AI助教</h3>
          <div style={{ height: '220px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '8px', color: msg.role === 'ai' ? 'var(--cyan-glow)' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong>
                <div className="markdown-prose" style={{ color: '#cbd5e1' }}>
                  {msg.role === 'ai' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="输入问题..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#1e293b', color: '#fff', outline: 'none' }} />
            <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'var(--cyan-glow)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span></button>
          </div>
        </div>
      )}
    </div>
  );
}