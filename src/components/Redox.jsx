import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function Redox() {
  const [l1Mode, setL1Mode] = useState('direction');
  const [l1Ox, setL1Ox] = useState(0.77);
  const [l1Red, setL1Red] = useState(0.54);
  const [l1Ph, setL1Ph] = useState(0);

  const [l2Mode, setL2Mode] = useState('titration');
  const [l2Prog, setL2Prog] = useState(50);

  const [l3Mode, setL3Mode] = useState('complex');
  const [l3Comp, setL3Comp] = useState(0);
  const [l3Energy, setL3Energy] = useState(10);
  const [l3Cat, setL3Cat] = useState(false);

  const [quizState, setQuizState] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是你的化学 AI 助教。关于“能斯特方程的推导”、“元素电势图的应用”，或是“自催化机理”，都可以随时问我！' }
  ]);
  const chatEndRef = useRef(null);

  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton && (e.key !== 'Enter' || e.nativeEvent.isComposing)) return;
    const userText = chatInput.trim();
    if (!userText) return;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在深度思考...' }]);
    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, '氧化还原平衡与能斯特方程');
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

  const renderLab1 = () => {
    if (l1Mode === 'direction') {
      const dE = l1Ox - l1Red;
      const isSpon = dE > 0;
      const color = isSpon ? "var(--life-green)" : "var(--alert-red)";
      return (
        <div style={{ width: '100%', height: '100%', textAlign: 'center', paddingTop: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color, textShadow: `0 0 10px ${color}` }}>ΔE<sup>⊖</sup> = {dE.toFixed(2)} V</div>
          <div style={{ fontSize: '16px', color: '#fff', marginBottom: '20px' }}>反应状态：{isSpon ? "正向自发" : "非自发 (逆向)"}</div>
          <svg width="300" height="80" viewBox="0 0 300 80" style={{ margin: '0 auto' }}>
            <rect x="50" y="30" width="60" height="40" fill="rgba(6,182,212,0.4)" stroke="var(--cyan-glow)" strokeWidth="2"/>
            <rect x="190" y="30" width="60" height="40" fill="rgba(236,72,153,0.4)" stroke="var(--pink-glow)" strokeWidth="2"/>
            <text x="80" y="55" fill="#fff" textAnchor="middle">Ox</text><text x="220" y="55" fill="#fff" textAnchor="middle">Red</text>
            <path d="M 120 40 Q 150 20 180 40" fill="none" stroke={isSpon ? '#10b981' : '#475569'} strokeWidth="4" strokeDasharray="5"/>
            {isSpon && <circle cx="120" cy="40" r="4" fill="#fde047"><animateMotion dur={`${Math.max(0.5, 2 - dE)}s`} repeatCount="indefinite" path="M 0 0 Q 30 -20 60 0"/></circle>}
          </svg>
        </div>
      );
    } else {
      const currentE = 1.51 - (0.0592 * 8 / 5) * l1Ph;
      const dropH = Math.max(0, (1.51 - currentE) * 80);
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '15px', left: '15px', fontFamily: 'monospace', color: '#fff', fontSize: '13px' }}>
            标准 E<sup>⊖</sup>: 1.510 V<br/>当前 E : <span style={{ color: 'var(--alert-orange)', fontSize: '1.4em', fontWeight: 'bold' }}>{currentE.toFixed(3)} V</span>
          </div>
          <svg width="100%" height="200" viewBox="0 0 400 200">
            <line x1="40" y1="180" x2="360" y2="180" stroke="#475569" strokeWidth="2"/> <line x1="40" y1="180" x2="40" y2="20" stroke="#475569" strokeWidth="2"/>
            <text x="350" y="195" fill="var(--text-muted)" fontSize="12">pH</text><text x="15" y="30" fill="var(--text-muted)" fontSize="12">E(V)</text>
            <rect x="180" y={60 + dropH} width="40" height={Math.max(0, 120 - dropH)} fill="var(--alert-orange)"/>
            <line x1="40" y1="60" x2="360" y2="60" stroke="#94a3b8" strokeDasharray="4"/><text x="370" y="65" fill="#94a3b8" fontSize="10">1.51V</text>
          </svg>
        </div>
      );
    }
  };

  const renderLab2 = () => {
    if (l2Mode === 'titration') {
      let pct = l2Prog / 100;
      let eVal = l2Prog === 100 ? 1.39 : (l2Prog < 100 ? 0.77 + 0.059 * Math.log10(pct/(1.001-pct)) : 1.51 + (0.0592/5) * Math.log10((pct-1)/1));
      let yMap = Math.max(20, Math.min(180, 180 - ((eVal - 0.5) / 1.1) * 160));
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px', color: '#fff', fontSize: '13px' }}>体系电势 E: <span style={{ color: 'var(--life-green)', fontSize: '1.4em', fontWeight: 'bold' }}>{eVal.toFixed(2)} V</span></div>
          <svg width="100%" height="200" viewBox="0 0 400 200">
            <line x1="40" y1="180" x2="360" y2="180" stroke="#475569" strokeWidth="2"/><line x1="40" y1="180" x2="40" y2="20" stroke="#475569" strokeWidth="2"/><text x="360" y="195" fill="var(--text-muted)" fontSize="12">滴加量</text>
            <path d="M 40 160 Q 200 150 200 100 T 360 25" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="4"/>
            <circle cx={40 + l2Prog*2} cy={yMap} r="6" fill="var(--cyan-glow)"/>
            <line x1={40 + l2Prog*2} y1="180" x2={40 + l2Prog*2} y2={yMap} stroke="var(--pink-glow)" strokeDasharray="4"/>
            <line x1="40" y1="50" x2="360" y2="50" stroke="var(--alert-red)" strokeDasharray="2"/><text x="250" y="45" fill="var(--alert-red)" fontSize="10">计量点 E_sp = 1.39V</text>
          </svg>
        </div>
      );
    } else {
      return (
        <svg width="100%" height="150" viewBox="0 0 400 150">
          <circle cx="80" cy="80" r="25" fill="var(--primary-blue)"/><text x="80" y="85" fill="#fff" fontWeight="bold" textAnchor="middle">Cu²⁺</text>
          <circle cx="200" cy="80" r="25" fill="var(--alert-orange)"/><text x="200" y="85" fill="#fff" fontWeight="bold" textAnchor="middle">Cu⁺</text>
          <circle cx="320" cy="80" r="25" fill="var(--life-green)"/><text x="320" y="85" fill="#fff" fontWeight="bold" textAnchor="middle">Cu</text>
          <path d="M 110 80 L 170 80" stroke="#fff" strokeWidth="2" markerEnd="url(#arrow_w)"/><text x="140" y="70" fill="var(--cyan-glow)" fontSize="14" textAnchor="middle" fontWeight="bold">0.15V</text>
          <path d="M 230 80 L 290 80" stroke="#fff" strokeWidth="2" markerEnd="url(#arrow_w)"/><text x="260" y="70" fill="var(--pink-glow)" fontSize="14" textAnchor="middle" fontWeight="bold">0.52V</text>
          <path d="M 200 50 Q 140 10 80 50" fill="none" stroke="var(--alert-red)" strokeWidth="2" markerEnd="url(#arrow_r)" strokeDasharray="4"/>
          <path d="M 200 110 Q 260 150 320 110" fill="none" stroke="var(--alert-red)" strokeWidth="2" markerEnd="url(#arrow_r)" strokeDasharray="4"/>
          <text x="200" y="25" fill="var(--alert-red)" fontSize="14" textAnchor="middle" fontWeight="bold">歧化自发分裂</text>
          <defs><marker id="arrow_w" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#fff"/></marker><marker id="arrow_r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--alert-red)"/></marker></defs>
        </svg>
      );
    }
  };

  const renderLab3 = () => {
    if (l3Mode === 'complex') {
      let eVal = 0.77 - (l3Comp * 0.005);
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px', color: '#fff', fontSize: '14px' }}>Fe³⁺/Fe²⁺ 电势: <span style={{ color: 'var(--alert-red)', fontWeight: 'bold' }}>{eVal.toFixed(3)} V</span></div>
          <svg width="100%" height="200" viewBox="0 0 400 200">
            <line x1="40" y1="180" x2="360" y2="180" stroke="#475569" strokeWidth="2"/><text x="5" y="100" fill="var(--text-muted)" fontSize="12" transform="rotate(-90 15 100)">电势 E (V)</text>
            <rect x="180" y={180 - Math.max(0, eVal*150)} width="40" height={Math.max(0, eVal*150)} fill="var(--alert-red)"/>
            <line x1="40" y1={180 - 0.77*150} x2="360" y2={180 - 0.77*150} stroke="#94a3b8" strokeDasharray="4"/><text x="250" y={180 - 0.77*150 - 5} fill="#94a3b8" fontSize="10">未配位标准电势 (0.77V)</text>
          </svg>
        </div>
      );
    } else if (l3Mode === 'energy') {
      let dE = l3Energy / 100;
      let dG = dE * 1.5;
      let lnK = Math.min(150, Math.exp(dE * 4));
      return (
        <svg width="100%" height="200" viewBox="0 0 400 200">
          <line x1="40" y1="180" x2="360" y2="180" stroke="#475569" strokeWidth="2"/>
          <rect x="80" y={180 - dE*100} width="40" height={dE*100} fill="var(--cyan-glow)"/><text x="100" y="195" fill="var(--text-muted)" textAnchor="middle" fontSize="12">ΔE</text>
          <rect x="180" y={180 - dG*100} width="40" height={dG*100} fill="var(--pink-glow)"/><text x="200" y="195" fill="var(--text-muted)" textAnchor="middle" fontSize="12">|ΔG|</text>
          <rect x="280" y={180 - lnK} width="40" height={lnK} fill="var(--life-green)"/><text x="300" y="195" fill="var(--text-muted)" textAnchor="middle" fontSize="12">K (指数级)</text>
        </svg>
      );
    } else {
      let pathStr = l3Cat ? "M 50 150 Q 200 100 350 150" : "M 50 150 Q 200 20 350 150";
      let color = l3Cat ? "var(--life-green)" : "var(--alert-orange)";
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div style={{ position: 'absolute', top: '10px', width: '100%', textAlign: 'center', color, fontWeight: 'bold', fontSize: '16px' }}>{l3Cat ? "自催化路径：Ea 急剧降低！" : "无催化：活化能 Ea 极高"}</div>
          <svg width="100%" height="200" viewBox="0 0 400 200">
            <line x1="40" y1="180" x2="360" y2="180" stroke="#475569" strokeWidth="2"/><text x="5" y="100" fill="var(--text-muted)" fontSize="12" transform="rotate(-90 15 100)">势能 (E)</text>
            <path d={pathStr} fill="none" stroke={color} strokeWidth="4"/>
            {l3Cat && <path d="M 50 150 Q 200 20 350 150" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4"/>}
            <circle r="8" fill="#fde047"><animateMotion dur={l3Cat ? "0.8s" : "3s"} repeatCount="indefinite" path={pathStr}/></circle>
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="redox-wrapper">
      <style>{`
        .redox-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(20, 30, 48, 0.7); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --pink-glow: #ec4899; --text-main: #f8fafc; --text-muted: #cbd5e1; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.5; overflow-x: hidden; }
        .redox-wrapper h1, .redox-wrapper h2, .redox-wrapper h3 { color: var(--cyan-glow); margin-top: 0; }
        .redox-wrapper h2 { border-left: 5px solid var(--primary-blue); padding-left: 10px; margin-bottom: 15px; margin-top: 20px; font-size: 1.4rem; }
        .redox-wrapper section { padding: 30px 5%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .redox-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.3s; margin: 3px; font-size: 13px; }
        .redox-wrapper .btn-outline:hover, .redox-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); border-color: var(--cyan-glow); color: #fff; }
        .redox-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .redox-wrapper .grid-2-asym { display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; }
        .redox-wrapper .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .redox-wrapper .panel { background: var(--bg-panel); padding: 15px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .redox-wrapper .theory-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--purple-med); border-radius: 10px; padding: 15px; transition: all 0.3s; }
        .redox-wrapper .formula-box { background: rgba(0,0,0,0.5); padding: 10px; border-radius: 6px; font-family: monospace; color: var(--life-green); border-left: 3px solid var(--life-green); text-align: center; font-weight: bold; }
        .redox-wrapper .lab-container { display: flex; flex-direction: column; border: 2px dashed var(--primary-blue); border-radius: 12px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 15px; min-height: 380px; }
        .redox-wrapper .lab-screen { flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); border-radius: 8px; margin-top: 10px; overflow: hidden; border: 1px solid #334155; }
        .redox-wrapper input[type=range] { width: 100%; accent-color: var(--cyan-glow); margin: 5px 0; }
        .redox-wrapper .quiz-card { background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px; border-left: 4px solid var(--pink-glow); margin-bottom: 15px; }
        .redox-wrapper .quiz-opt { display: block; width: 100%; text-align: left; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; cursor: pointer; transition: 0.2s; font-size: 13px; }
        .redox-wrapper .quiz-opt:hover { background: rgba(255,255,255,0.1); border-color: var(--cyan-glow); color: #fff; }
        .redox-wrapper .quiz-opt.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--life-green); color: #fff; }
        .redox-wrapper .quiz-opt.wrong { background: rgba(239, 68, 68, 0.2); border-color: var(--alert-red); color: #fff; }
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
      `}</style>

      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', paddingTop: '40px', paddingBottom: '20px' }}>
        <svg width="500" height="120" viewBox="0 0 500 120" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 15px var(--primary-blue))' }}>
          <text x="10" y="70" fill="#fff" fontSize="24" fontWeight="bold">Zn(s)</text><text x="80" y="70" fill="#fff" fontSize="24" fontWeight="bold">+</text>
          <text x="105" y="70" fill="var(--cyan-glow)" fontSize="24" fontWeight="bold">Cu<tspan dy="-10" fontSize="16">2+</tspan><tspan dy="10" fontSize="20">(aq)</tspan></text>
          <path d="M 215 60 L 265 60" stroke="var(--primary-blue)" strokeWidth="3" markerEnd="url(#arrow1)"/><path d="M 265 70 L 215 70" stroke="var(--pink-glow)" strokeWidth="3" markerEnd="url(#arrow2)"/>
          <text x="285" y="70" fill="var(--alert-orange)" fontSize="24" fontWeight="bold">Zn<tspan dy="-10" fontSize="16">2+</tspan><tspan dy="10" fontSize="20">(aq)</tspan></text>
          <text x="380" y="70" fill="#fff" fontSize="24" fontWeight="bold">+</text><text x="405" y="70" fill="var(--life-green)" fontSize="24" fontWeight="bold">Cu(s)</text>
          <circle cx="240" cy="50" r="4" fill="#fde047"><animateMotion dur="1.5s" repeatCount="indefinite" path="M -50 0 Q 0 -30 50 0"/></circle>
          <defs><marker id="arrow1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary-blue)"/></marker><marker id="arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--pink-glow)"/></marker></defs>
        </svg>
        <h1 style={{ fontSize: '2.4rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>氧化还原平衡：电子转移与动态微观</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>“跨越电势的鸿沟，洞悉电子的流转、滴定的突跃与能量的变迁。”</p>
      </section>

      <section id="module1">
        <h2>模块一：氧化还原理论与配平规则</h2>
        <div className="grid-3">
          <div className="theory-card"><h3>1. 核心概念辨析</h3><p style={{ color: 'var(--text-muted)', fontSize: '13px' }}><strong>氧化剂：</strong>得电子，氧化数降低，自身被还原。<br/><strong>还原剂：</strong>失电子，氧化数升高，自身被氧化。</p></div>
          <div className="theory-card"><h3>2. 氧化还原半反应</h3><p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>完整反应可拆分：<br/><span style={{ color: 'var(--alert-orange)' }}>氧化半反应：</span> Red ⇌ Ox + ne⁻<br/><span style={{ color: 'var(--alert-orange)' }}>还原半反应：</span> Ox + ne⁻ ⇌ Red</p></div>
          <div className="theory-card"><h3>3. 离子-电子法配平规则</h3><p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>1. 拆分。 2. 配平主元素。 3. 酸性用 H⁺/H₂O，碱性用 OH⁻/H₂O 补齐。 4. 加 e⁻ 配平电荷。</p></div>
        </div>
      </section>

      <section id="module2">
        <h2>模块二：能斯特方程与自发方向判断</h2>
        <div className="grid-2-asym">
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>能斯特方程 (Nernst Equation)</h3>
            <div className="formula-box">E = E<sup>⊖</sup> - (0.0592 / n) · lg([Red] / [Ox])</div>
            <ul style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              <li><strong>浓度影响：</strong>[Ox] 升高，电势 E 增大。</li>
              <li><strong>pH 影响：</strong>若 H⁺ 参与反应，pH 增大，E 下降。</li>
              <li><strong>自发方向：</strong>ΔE = E<sub>正极</sub> - E<sub>负极</sub>。若 ΔE &gt; 0，则正向自发。</li>
            </ul>
          </div>
          <div className="lab-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>全息实验室 1</h3>
              <div><button className={`btn-outline ${l1Mode === 'direction' ? 'active' : ''}`} onClick={() => setL1Mode('direction')}>双电对自发预测</button><button className={`btn-outline ${l1Mode === 'nernst' ? 'active' : ''}`} onClick={() => setL1Mode('nernst')}>Nernst pH计算</button></div>
            </div>
            <div className="lab-screen">{renderLab1()}</div>
            <div className="control-group">
              {l1Mode === 'direction' ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}><label>氧化剂电对：</label><select value={l1Ox} onChange={e => setL1Ox(parseFloat(e.target.value))} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff' }}><option value={1.51}>MnO₄⁻ / Mn²⁺ (1.51V)</option><option value={0.77}>Fe³⁺ / Fe²⁺ (0.77V)</option><option value={0.15}>Sn⁴⁺ / Sn²⁺ (0.15V)</option></select></div>
                  <div style={{ flex: 1 }}><label>还原剂电对：</label><select value={l1Red} onChange={e => setL1Red(parseFloat(e.target.value))} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff' }}><option value={1.06}>Br₂ / Br⁻ (1.06V)</option><option value={0.54}>I₂ / I⁻ (0.54V)</option><option value={-0.76}>Zn²⁺ / Zn (-0.76V)</option></select></div>
                </div>
              ) : (
                <><label>体系 pH: <span style={{ color: 'var(--cyan-glow)' }}>{l1Ph}</span></label><input type="range" min="0" max="6" step="0.5" value={l1Ph} onChange={e => setL1Ph(parseFloat(e.target.value))} /></>
              )}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '20px', color: 'var(--alert-orange)', fontWeight: 'bold' }}>⚔️ 思维道场：能斯特突围</div>
        <div className="grid-2" style={{ marginTop: '10px' }}>
          <div className="quiz-card"><p style={{ fontWeight: 'bold' }}>1. MnO₄⁻ + 8H⁺ + 5e⁻ ⇌ Mn²⁺ + 4H₂O。当 pH 从 0 升至 2 时，E 将？</p>
            <button className={`quiz-opt ${quizState.q1?.sel === 'B' ? 'correct' : (quizState.q1?.sel ? 'wrong' : '')}`} onClick={() => setQuizState({ ...quizState, q1: { sel: 'B' } })}>B. 大幅下降 (因为 [H⁺] 的 8 次方放大效应)</button>
          </div>
          <div className="quiz-card"><p style={{ fontWeight: 'bold' }}>2. 浓差电池中，高浓度 CuSO₄ 和低浓度 CuSO₄ 谁作正极？</p>
            <button className={`quiz-opt ${quizState.q2?.sel === 'B' ? 'correct' : (quizState.q2?.sel ? 'wrong' : '')}`} onClick={() => setQuizState({ ...quizState, q2: { sel: 'B' } })}>B. 高浓度端作正极，低浓度端作负极</button>
          </div>
        </div>
      </section>

      <section id="module3">
        <h2>模块三：氧化还原滴定与电势图</h2>
        <div className="grid-2-asym">
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>滴定曲线与指示剂选择</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>化学计量点电势：E<sub>sp</sub> ≈ (n₁E₁<sup>⊖</sup> + n₂E₂<sup>⊖</sup>) / (n₁ + n₂)<br/><br/>
            <strong>Latimer 图歧化规则：</strong>若 E<sub>右</sub> &gt; E<sub>左</sub>，中间氧化态极不稳定，将发生歧化。</p>
          </div>
          <div className="lab-container" style={{ borderColor: 'var(--pink-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>全息实验室 2</h3>
              <div><button className={`btn-outline ${l2Mode === 'titration' ? 'active' : ''}`} onClick={() => setL2Mode('titration')}>滴定曲线</button><button className={`btn-outline ${l2Mode === 'latimer' ? 'active' : ''}`} onClick={() => setL2Mode('latimer')}>Latimer</button></div>
            </div>
            <div className="lab-screen">{renderLab2()}</div>
            <div className="control-group">
              {l2Mode === 'titration' && <><label>滴加进度: {l2Prog}%</label><input type="range" min="1" max="150" value={l2Prog} onChange={e => setL2Prog(parseInt(e.target.value))} /></>}
            </div>
          </div>
        </div>
      </section>

      <section id="module4">
        <h2>模块四：高级调控：配位、能量转化与机理</h2>
        <div className="grid-2-asym">
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>热力学、动力学与配位效应</h3>
            <div className="formula-box">ΔG<sup>⊖</sup> = -nFE<sup>⊖</sup> = -RT lnK</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>配位效应：若高价态形成极稳定的配合物，游离态剧降，电极电势 E 显著降低。<br/>动力学：反应生成物若自身具有催化作用，会发生“自催化”，速率呈现先慢后快的跃变。</p>
          </div>
          <div className="lab-container" style={{ borderColor: 'var(--life-green)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>全息实验室 3</h3>
              <div><button className={`btn-outline ${l3Mode === 'complex' ? 'active' : ''}`} onClick={() => setL3Mode('complex')}>配位调控</button><button className={`btn-outline ${l3Mode === 'energy' ? 'active' : ''}`} onClick={() => setL3Mode('energy')}>能量柱</button><button className={`btn-outline ${l3Mode === 'catalyst' ? 'active' : ''}`} onClick={() => setL3Mode('catalyst')}>自催化</button></div>
            </div>
            <div className="lab-screen">{renderLab3()}</div>
            <div className="control-group">
              {l3Mode === 'complex' && <><label>加 CN⁻ 浓度: {l3Comp}</label><input type="range" min="0" max="100" value={l3Comp} onChange={e => setL3Comp(parseInt(e.target.value))} /></>}
              {l3Mode === 'energy' && <><label>ΔE 变化: {(l3Energy/100).toFixed(2)} V</label><input type="range" min="1" max="100" value={l3Energy} onChange={e => setL3Energy(parseInt(e.target.value))} /></>}
              {l3Mode === 'catalyst' && <div style={{ display: 'flex', gap: '10px' }}><button className="btn-outline" onClick={() => setL3Cat(false)}>初始无催化</button><button className="btn-outline" onClick={() => setL3Cat(true)}>产物自催化</button></div>}
            </div>
          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--cyan-glow), var(--purple-med))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', cursor: 'pointer', zIndex: 100 }}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block', position: 'fixed', bottom: '100px', right: '30px', width: '340px', background: 'var(--bg-dark)', border: '1px solid var(--purple-med)', borderRadius: '12px', padding: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--life-green)', fontSize: '15px' }}>氧化还原 AI 助教</h3>
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