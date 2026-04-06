import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function AcidBase() {
  // ==========================================
  // 状态管理
  // ==========================================
  const [lab1Mode, setLab1Mode] = useState('temp');
  const [lab1Val, setLab1Val] = useState(25); 
  const [saltState, setSaltState] = useState('reset');

  const [lab2Mode, setLab2Mode] = useState('buffer');
  const [bufferRatio, setBufferRatio] = useState(1);
  const [bufferState, setBufferState] = useState('normal');
  const [titrationType, setTitrationType] = useState('sAsB');
  const [titrationErr, setTitrationErr] = useState(0);
  const [indicatorPh, setIndicatorPh] = useState(7.0);
  const [currentInd, setCurrentInd] = useState('mo');

  const [quizState, setQuizState] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是你的化学 AI助教。关于“多元酸分步解离、缓冲容量计算、盐效应与同离子效应的区别”，你有什么疑问吗？' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 实验室 1 计算与防闪烁优化
  // ==========================================
  const handleLab1Switch = (mode) => {
    setLab1Mode(mode);
    setLab1Val(mode === 'temp' ? 25 : mode === 'conc' ? 100 : 0);
    setSaltState('reset');
  };

  let alpha = 0.05, pH = 3.0, hCount = 5;
  let displayVal1 = "";
  if (lab1Mode === 'temp') {
    displayVal1 = lab1Val + " ℃";
    alpha = 0.05 + (lab1Val - 25) * 0.001; 
    pH = 3.0 - (lab1Val - 25) * 0.01;
    hCount = Math.floor(alpha * 100);
  } else if (lab1Mode === 'conc') {
    let c = lab1Val / 1000;
    displayVal1 = c.toFixed(3) + " mol/L";
    let hConc = Math.sqrt(1e-5 * c);
    pH = -Math.log10(hConc);
    alpha = hConc / c;
    hCount = Math.floor(hConc * 10000);
  } else if (lab1Mode === 'salt') {
    if (saltState === 'nacl') { alpha = 0.06; pH = 2.95; hCount = 6; }
    else if (saltState === 'naa') { alpha = 0.001; pH = 4.5; hCount = 1; }
    else { alpha = 0.05; pH = 3.0; hCount = 5; }
  }
  let haCount = Math.max(5, 30 - hCount);

  // 提前生成巨大的静态粒子池，避免滑块滑动时 React 重新计算数组导致动画错乱
  const staticParticlesHA = useMemo(() => Array.from({ length: 40 }).map(() => ({
    x: 10 + Math.random() * 380, y: 10 + Math.random() * 130, dur: 3 + Math.random(), tx: Math.random() * 400
  })), []);
  const staticParticlesH = useMemo(() => Array.from({ length: 40 }).map(() => ({
    x: 10 + Math.random() * 380, y: 10 + Math.random() * 130, dur: 1.5 + Math.random(), ty: Math.random() * 150
  })), []);

  const renderLab1SVG = () => (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '12px', zIndex: 2 }}>
        解离度 α: <span style={{ color: 'var(--alert-red)' }}>{(alpha * 100).toFixed(2)}%</span><br/>
        体系 pH: <span style={{ color: 'var(--cyan-glow)', fontSize: '1.2em', fontWeight: 'bold' }}>{pH.toFixed(2)}</span>
      </div>
      <svg width="100%" height="150" viewBox="0 0 400 150">
        {staticParticlesHA.slice(0, haCount).map((p, i) => (
          <circle key={`ha_${i}`} cx={p.x} cy={p.y} r="6" fill="#475569">
            <animate attributeName="cx" values={`${p.x};${p.tx};${p.x}`} dur={`${p.dur}s`} repeatCount="indefinite"/>
          </circle>
        ))}
        {staticParticlesH.slice(0, hCount).map((p, i) => (
          <React.Fragment key={`ions_${i}`}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--alert-orange)"><animate attributeName="cy" values={`${p.y};${p.ty};${p.y}`} dur={`${p.dur}s`} repeatCount="indefinite"/></circle>
            <circle cx={p.x + 10} cy={p.y} r="4" fill="var(--life-green)"><animate attributeName="cy" values={`${p.y};${p.ty};${p.y}`} dur={`${p.dur}s`} repeatCount="indefinite"/></circle>
          </React.Fragment>
        ))}
      </svg>
    </div>
  );

  // ==========================================
  // 实验室 2 计算逻辑
  // ==========================================
  const handleLab2Switch = (mode) => {
    setLab2Mode(mode); setBufferRatio(1); setTitrationErr(0); setIndicatorPh(7);
  };

  const testBuffer = (type) => {
    setBufferState(type); setTimeout(() => setBufferState('normal'), 2000);
  };

  const renderLab2SVG = () => {
    if (lab2Mode === 'buffer') {
      let pKa = 4.75;
      let currPh = pKa + Math.log10(bufferRatio);
      let beta = 2.303 * (bufferRatio / Math.pow(bufferRatio + 1, 2));
      if (bufferState === 'acid') currPh -= 0.05;
      if (bufferState === 'base') currPh += 0.05;
      if (bufferState === 'freeze') currPh += 0.01;
      let barH = beta * 200;

      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '5px', left: '10px', fontFamily: 'monospace', fontSize: '12px' }}>
            当前 pH: <span style={{ color: 'var(--cyan-glow)', fontSize: '1.3em', fontWeight: 'bold' }}>{currPh.toFixed(2)}</span><br/>
            缓冲容量 β:
          </div>
          <svg width="100%" height="150" viewBox="0 0 400 150">
            <rect x="50" y={130 - barH} width="30" height={barH} fill="var(--pink-glow)"/>
            <path d={`M 120 ${130 - (currPh-3)*20} Q 200 ${130 - (currPh-3)*20} 280 ${130 - (currPh-3)*20}`} stroke="var(--primary-blue)" strokeWidth="4" fill="none"/>
          </svg>
        </div>
      );
    } else if (lab2Mode === 'titration') {
      let path = '';
      if (titrationType === 'sAsB') path = `M 20 130 Q 150 120 180 ${70 - titrationErr*8} T 350 15`;
      else if (titrationType === 'sAwB') path = `M 20 100 Q 150 85 180 ${55 - titrationErr*8} T 350 15`;
      else if (titrationType === 'mixedB') path = `M 20 15 Q 100 25 150 55 T 250 95 T 350 135`;
      else if (titrationType === 'mixedA') path = `M 20 130 Q 100 120 150 85 T 250 45 T 350 15`;

      return (
        <svg width="100%" height="150" viewBox="0 0 400 150">
          <line x1="20" y1="130" x2="380" y2="130" stroke="#fff" strokeWidth="1"/> 
          <line x1="20" y1="15" x2="380" y2="15" stroke="#fff" strokeWidth="1"/> 
          <path d={path} fill="none" stroke="var(--cyan-glow)" strokeWidth="3"/>
          <rect x="20" y="90" width="360" height="15" fill="rgba(245,158,11,0.2)"/> <text x="30" y="100" fill="var(--alert-orange)" fontSize="9">甲基橙</text>
          <rect x="20" y="35" width="360" height="15" fill="rgba(236,72,153,0.2)"/> <text x="30" y="45" fill="var(--pink-glow)" fontSize="9">酚酞</text>
        </svg>
      );
    } else if (lab2Mode === 'multiprotic') {
      return (
        <svg width="100%" height="150">
          <rect x="80" y="20" width="30" height="110" fill="var(--cyan-glow)"/>
          <text x="95" y="15" fill="#fff" textAnchor="middle" fontSize="10">10⁻³(K₁)</text>
          <rect x="180" y="60" width="30" height="70" fill="var(--life-green)"/>
          <text x="195" y="55" fill="#fff" textAnchor="middle" fontSize="10">10⁻⁸(K₂)</text>
          <rect x="280" y="115" width="30" height="15" fill="var(--alert-orange)"/>
          <text x="295" y="110" fill="#fff" textAnchor="middle" fontSize="10">10⁻¹³(K₃)</text>
          <line x1="40" y1="130" x2="360" y2="130" stroke="#fff" strokeWidth="2"/>
        </svg>
      );
    } else if (lab2Mode === 'indicator') {
      let color = '#fff', stateText = '';
      if (currentInd === 'mo') {
        color = indicatorPh < 3.1 ? '#ef4444' : (indicatorPh > 4.4 ? '#f59e0b' : '#f97316');
        stateText = indicatorPh < 3.1 ? 'HIn (酸色:红)' : (indicatorPh > 4.4 ? 'In⁻ (碱色:黄)' : '混合色:橙');
      } else if (currentInd === 'pp') {
        color = indicatorPh < 8.0 ? 'rgba(255,255,255,0.2)' : (indicatorPh > 10.0 ? '#ec4899' : 'rgba(236,72,153,0.5)');
        stateText = indicatorPh < 8.0 ? 'HIn (无色)' : (indicatorPh > 10.0 ? 'In⁻ (红色)' : '微红过渡');
      } else {
        color = indicatorPh < 5.1 ? '#ef4444' : (indicatorPh > 5.1 ? '#10b981' : '#94a3b8');
        stateText = indicatorPh < 5.1 ? '酸色 (红)' : (indicatorPh > 5.1 ? '碱色 (绿)' : '敏锐灰变');
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: color, border: '2px solid #fff', boxShadow: `0 0 15px ${color}`, transition: '0.5s' }}></div>
          <div style={{ marginTop: '10px', fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{stateText}</div>
        </div>
      );
    }
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
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, '酸碱平衡与滴定');
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

  return (
    <div className="acidbase-wrapper">
      <style>{`
        .acidbase-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(20, 30, 48, 0.7); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --pink-glow: #ec4899; --text-main: #f8fafc; --text-muted: #cbd5e1; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; overflow-x: hidden; scroll-behavior: smooth; line-height: 1.5; width: 100%; }
        .acidbase-wrapper h1, .acidbase-wrapper h2, .acidbase-wrapper h3, .acidbase-wrapper h4 { color: var(--cyan-glow); margin-top: 0; margin-bottom: 10px; }
        .acidbase-wrapper h2 { border-left: 5px solid var(--primary-blue); padding-left: 10px; margin-bottom: 15px; margin-top: 20px; font-size: 1.4rem;}
        .acidbase-wrapper h3 { color: var(--pink-glow); margin-top: 15px; font-size: 1.1rem; }
        .acidbase-wrapper section { padding: 30px 5%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .acidbase-wrapper .btn { background: linear-gradient(135deg, var(--primary-blue), var(--purple-med)); border: none; padding: 8px 16px; color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
        .acidbase-wrapper .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6); }
        .acidbase-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.3s; margin: 3px; font-size: 13px; }
        .acidbase-wrapper .btn-outline:hover, .acidbase-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); box-shadow: 0 0 10px rgba(6, 182, 212, 0.5); border-color: var(--cyan-glow); color: #fff; }
        .acidbase-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .acidbase-wrapper .grid-2-asym { display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; }
        .acidbase-wrapper .panel { background: var(--bg-panel); padding: 15px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .acidbase-wrapper .theory-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--purple-med); border-radius: 10px; padding: 15px; transition: all 0.3s; }
        .acidbase-wrapper .theory-card:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(139, 92, 246, 0.2); border-color: var(--cyan-glow);}
        .acidbase-wrapper .theory-list { padding-left: 20px; color: var(--text-muted); font-size: 13px; margin: 10px 0; }
        .acidbase-wrapper .theory-list li { margin-bottom: 12px; }
        .acidbase-wrapper .theory-example { color: var(--life-green); font-weight: 500; display: block; margin-top: 4px; background: rgba(16, 185, 129, 0.1); padding: 4px 8px; border-radius: 4px; border-left: 2px solid var(--life-green);}
        .acidbase-wrapper .formula-box { background: rgba(0,0,0,0.5); padding: 10px; border-radius: 6px; font-family: 'Courier New', Courier, monospace; color: var(--life-green); border-left: 3px solid var(--life-green); margin: 8px 0; font-size: 1em; }
        .acidbase-wrapper .hl-term { color: var(--alert-orange); font-weight: bold; }
        .acidbase-wrapper .hl-math { color: var(--cyan-glow); font-style: italic; font-family: 'Times New Roman', Times, serif; }
        .acidbase-wrapper .lab-container { display: flex; flex-direction: column; border: 2px dashed var(--primary-blue); border-radius: 12px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 15px; min-height: 320px; position: relative; }
        .acidbase-wrapper .lab-screen { flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); border-radius: 8px; margin-top: 10px; position: relative; overflow: hidden; }
        .acidbase-wrapper .control-group { margin-top: 10px; }
        .acidbase-wrapper .control-group label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 3px;}
        .acidbase-wrapper input[type=range] { width: 100%; accent-color: var(--cyan-glow); margin: 5px 0; }
        .acidbase-wrapper .quiz-card { background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px; border-left: 4px solid var(--pink-glow); transition: all 0.3s; margin-bottom: 15px;}
        .acidbase-wrapper .quiz-q { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #fff; }
        .acidbase-wrapper .quiz-opt { display: block; width: 100%; text-align: left; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; cursor: pointer; transition: 0.2s; font-size: 13px; }
        .acidbase-wrapper .quiz-opt:hover:not(.disabled) { background: rgba(255,255,255,0.1); border-color: var(--cyan-glow); color: #fff; }
        .acidbase-wrapper .quiz-opt.disabled { cursor: not-allowed; opacity: 0.6; }
        .acidbase-wrapper .quiz-opt.correct { background: rgba(16, 185, 129, 0.2); border-color: var(--life-green); color: #fff; }
        .acidbase-wrapper .quiz-opt.wrong { background: rgba(239, 68, 68, 0.2); border-color: var(--alert-red); color: #fff; }
        .acidbase-wrapper .quiz-feedback { margin-top: 10px; padding: 10px; border-radius: 6px; background: rgba(14, 165, 233, 0.1); border: 1px solid var(--cyan-glow); font-size: 12.5px; line-height: 1.5; color: #f8fafc; }
        .acidbase-wrapper .ai-bot { position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; background: linear-gradient(135deg, var(--cyan-glow), var(--purple-med)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; box-shadow: 0 0 15px rgba(139, 92, 246, 0.6); z-index: 100; transition: transform 0.3s; }
        .acidbase-wrapper .ai-bot:hover { transform: scale(1.1); }
        .acidbase-wrapper .ai-chat-window { position: fixed; bottom: 80px; right: 20px; width: 340px; background: var(--bg-dark); border: 1px solid var(--purple-med); border-radius: 10px; padding: 15px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.9); }
        
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        .markdown-prose p:last-child { margin-bottom: 0; }
        .markdown-prose strong { font-weight: 700; color: inherit; }
        .markdown-prose ul, .markdown-prose ol { margin-top: 4px; margin-bottom: 8px; padding-left: 20px; }
        .markdown-prose li { margin-bottom: 4px; }
      `}</style>

      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', paddingTop: '50px', paddingBottom: '30px' }}>
        <svg width="350" height="120" viewBox="0 0 350 120" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 15px var(--primary-blue))' }}>
          <text x="40" y="70" fill="#fff" fontSize="28" fontWeight="bold">HA</text>
          <path d="M 95 60 L 155 60" stroke="var(--cyan-glow)" strokeWidth="3" markerEnd="url(#arrow1_ab)"/>
          <path d="M 155 70 L 95 70" stroke="var(--pink-glow)" strokeWidth="3" markerEnd="url(#arrow2_ab)"/>
          <text x="180" y="70" fill="var(--alert-orange)" fontSize="28" fontWeight="bold">H<tspan dy="-12" fontSize="16">+</tspan></text>
          <text x="220" y="70" fill="#fff" fontSize="28" fontWeight="bold">+</text>
          <text x="250" y="70" fill="var(--life-green)" fontSize="28" fontWeight="bold">A<tspan dy="-12" fontSize="16">-</tspan></text>
          <circle cx="125" cy="60" r="4" fill="var(--alert-orange)"><animateMotion dur="2s" repeatCount="indefinite" path="M -25 0 L 25 0"/></circle>
          <circle cx="125" cy="70" r="4" fill="var(--life-green)"><animateMotion dur="2s" repeatCount="indefinite" path="M 25 0 L -25 0"/></circle>
          <defs>
            <marker id="arrow1_ab" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cyan-glow)"/></marker>
            <marker id="arrow2_ab" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--pink-glow)"/></marker>
          </defs>
        </svg>
        <h1 style={{ fontSize: '2.5rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>酸碱平衡理论：质子传递与动态微观</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '20px' }}>“掌握质子的流动法则，揭示缓冲与滴定的微观奥秘。”</p>
      </section>

      <section id="module1">
        <h2>模块一：酸碱理论演进与四大效应</h2>
        <div className="grid-2">
          <div className="theory-card">
            <h3 style={{ marginTop: 0 }}>1. 酸碱理论的演进、对比与实例</h3>
            <ul className="theory-list">
              <li><strong style={{ color: 'var(--primary-blue)' }}>电离理论 (Arrhenius)：</strong><br/>局限于水溶液体系；解离出 H⁺ 的是酸，解离出 OH⁻ 的是碱。<span className="theory-example">【实例】HCl → H⁺ + Cl⁻</span></li>
              <li><strong style={{ color: 'var(--cyan-glow)' }}>酸碱质子理论 (Brønsted-Lowry)：</strong><br/>给出质子的是酸，接受质子的是碱。存在“共轭酸碱对”。<span className="theory-example">【实例】NH₃ + H₂O ⇌ NH₄⁺ + OH⁻</span></li>
              <li><strong style={{ color: 'var(--pink-glow)' }}>Lewis 电子理论：</strong><br/>接受电子对的是酸，给出电子对的是碱。<span className="theory-example">【实例】BF₃ + :NH₃ → F₃B-NH₃</span></li>
            </ul>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="theory-card" style={{ flex: 1 }}>
              <h3 style={{ marginTop: 0 }}>2. 拉平效应与区分效应</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: 0 }}>
                <strong>拉平效应：</strong>溶剂将不同强度的酸拉平到同一强度 (如水将 HClO₄、HCl 拉平)。<br/>
                <strong>区分效应：</strong>换用弱碱性溶剂（如冰醋酸）能区分强酸的相对强弱。
              </p>
            </div>
            <div className="theory-card" style={{ flex: 1 }}>
              <h3 style={{ marginTop: 0 }}>3. 同离子效应与盐效应</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: 0 }}>
                <strong>同离子效应：</strong>加入含有<span className="hl-term">相同离子</span>的强电解质，平衡左移，解离度骤降。<br/>
                <strong>盐效应：</strong>加入<span className="hl-term">不含相同离子</span>的强电解质，离子强度增大，解离度略微增大。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="module2">
        <h2>模块二：pH 计算与微观解离实验室</h2>
        <div className="grid-2-asym">
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>各类酸碱体系的 pH 计算法则</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              <strong>一元弱酸 (HA)：</strong>c/Ka ≥ 500 时，最简式：<div className="formula-box">[H⁺] = √(Ka · c)</div>
              <strong>两性物质 (如 HA⁻)：</strong>酸碱相抵，与浓度无关：<div className="formula-box">pH = ½(pKa1 + pKa2)</div>
              <strong>多元弱酸：</strong>阶梯解离。第一步决定 [H⁺]，第二步产物 [A²⁻] ≈ Ka2。
            </div>
          </div>
          <div className="lab-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>全息实验室 1：解离与效应</h3>
              <div>
                <button className={`btn-outline ${lab1Mode === 'temp' ? 'active' : ''}`} onClick={() => handleLab1Switch('temp')}>温度/勒夏</button>
                <button className={`btn-outline ${lab1Mode === 'conc' ? 'active' : ''}`} onClick={() => handleLab1Switch('conc')}>稀释定律</button>
                <button className={`btn-outline ${lab1Mode === 'salt' ? 'active' : ''}`} onClick={() => handleLab1Switch('salt')}>盐/同离子效应</button>
              </div>
            </div>
            <div className="lab-screen">
              {renderLab1SVG()}
            </div>
            <div className="control-group">
              {lab1Mode === 'temp' && <React.Fragment><label>调节温度 (T)：<span style={{ color: 'var(--cyan-glow)', fontWeight: 'bold' }}>{displayVal1}</span></label><input type="range" min="0" max="100" value={lab1Val} onChange={e => setLab1Val(parseInt(e.target.value))} /></React.Fragment>}
              {lab1Mode === 'conc' && <React.Fragment><label>调节 HA 浓度 (c)：<span style={{ color: 'var(--cyan-glow)', fontWeight: 'bold' }}>{displayVal1}</span></label><input type="range" min="1" max="100" value={lab1Val} onChange={e => setLab1Val(parseInt(e.target.value))} /></React.Fragment>}
              {lab1Mode === 'salt' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                  <button className="btn" style={{ flex: 1, background: 'var(--bg-panel)', border: '1px solid var(--primary-blue)', fontSize: '12px' }} onClick={() => setSaltState('nacl')}>加 NaCl (盐)</button>
                  <button className="btn" style={{ flex: 1, background: 'var(--bg-panel)', border: '1px solid var(--alert-red)', fontSize: '12px' }} onClick={() => setSaltState('naa')}>加 NaA (同离子)</button>
                  <button className="btn" style={{ flex: 1, background: 'var(--bg-panel)', border: '1px solid #475569', fontSize: '12px' }} onClick={() => setSaltState('reset')}>重置</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="module3">
        <h2>模块三：缓冲体系、多元解离与滴定实验室</h2>
        <div className="grid-2-asym">
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>缓冲溶液与滴定原理</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              <strong>缓冲公式 (Henderson-Hasselbalch)：</strong><div className="formula-box">pH = pKa + lg(c碱 / c酸)</div>
              <strong>滴定突跃：</strong>强酸滴强碱突跃大(4.3~9.7)，弱酸滴强碱突跃偏碱性(选酚酞)。
            </div>
          </div>
          <div className="lab-container" style={{ borderColor: 'var(--pink-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>全息实验室 2：演化分析</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '4px' }}>
                <button className={`btn-outline ${lab2Mode === 'buffer' ? 'active' : ''}`} style={{ borderColor: 'var(--pink-glow)', color: lab2Mode==='buffer'?'#fff':'var(--pink-glow)' }} onClick={() => handleLab2Switch('buffer')}>缓冲抗性</button>
                <button className={`btn-outline ${lab2Mode === 'titration' ? 'active' : ''}`} style={{ borderColor: 'var(--pink-glow)', color: lab2Mode==='titration'?'#fff':'var(--pink-glow)' }} onClick={() => handleLab2Switch('titration')}>滴定曲线</button>
                <button className={`btn-outline ${lab2Mode === 'multiprotic' ? 'active' : ''}`} style={{ borderColor: 'var(--pink-glow)', color: lab2Mode==='multiprotic'?'#fff':'var(--pink-glow)' }} onClick={() => handleLab2Switch('multiprotic')}>多元解离</button>
                <button className={`btn-outline ${lab2Mode === 'indicator' ? 'active' : ''}`} style={{ borderColor: 'var(--pink-glow)', color: lab2Mode==='indicator'?'#fff':'var(--pink-glow)' }} onClick={() => handleLab2Switch('indicator')}>指示剂</button>
              </div>
            </div>
            <div className="lab-screen">{renderLab2SVG()}</div>
            <div className="control-group">
              {lab2Mode === 'buffer' && (
                <React.Fragment>
                  <label>缓冲比: <span style={{ color: 'var(--pink-glow)', fontWeight: 'bold' }}>{bufferRatio.toFixed(1)} : 1</span></label>
                  <input type="range" min="0.1" max="10" step="0.1" value={bufferRatio} onChange={e => setBufferRatio(parseFloat(e.target.value))} />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn" style={{ flex: 1, fontSize: '12px' }} onClick={() => testBuffer('acid')}>+HCl</button>
                    <button className="btn" style={{ flex: 1, fontSize: '12px' }} onClick={() => testBuffer('base')}>+NaOH</button>
                    <button className="btn" style={{ flex: 1, fontSize: '12px' }} onClick={() => testBuffer('dilute')}>加水稀释</button>
                  </div>
                </React.Fragment>
              )}
              {lab2Mode === 'titration' && (
                <React.Fragment>
                  <select value={titrationType} onChange={e => setTitrationType(e.target.value)} style={{ width: '100%', padding: '6px', background: '#1e293b', color: '#fff', border: '1px solid var(--pink-glow)' }}>
                    <option value="sAsB">强碱滴定强酸 (NaOH -{">"} HCl)</option>
                    <option value="sAwB">强碱滴定弱酸 (NaOH -{">"} HAc)</option>
                    <option value="mixedB">混合碱滴定 (HCl -{">"} NaOH + Na2CO3)</option>
                    <option value="mixedA">混合酸滴定 (NaOH -{">"} HCl + H3PO4)</option>
                  </select>
                  <label style={{ marginTop: '8px' }}>终点误差滴数: <span style={{ color: 'var(--alert-orange)' }}>{titrationErr}滴</span></label>
                  <input type="range" min="-5" max="5" value={titrationErr} onChange={e => setTitrationErr(parseInt(e.target.value))} />
                </React.Fragment>
              )}
              {lab2Mode === 'indicator' && (
                <React.Fragment>
                  <label>调节 pH: <span style={{ color: 'var(--pink-glow)', fontWeight: 'bold' }}>{indicatorPh.toFixed(1)}</span></label>
                  <input type="range" min="1" max="14" step="0.1" value={indicatorPh} onChange={e => setIndicatorPh(parseFloat(e.target.value))} />
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn" style={{ flex: 1, fontSize: '12px', border: '1px solid var(--alert-orange)' }} onClick={() => setCurrentInd('mo')}>甲基橙</button>
                    <button className="btn" style={{ flex: 1, fontSize: '12px', border: '1px solid var(--pink-glow)' }} onClick={() => setCurrentInd('pp')}>酚酞</button>
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
        
        <div className="dojo-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--alert-orange)', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '15px' }}>⚔️ 思维道场：pH计算闯关</div>
          <div className="grid-2">
            <div className="quiz-card">
              <div className="quiz-q">1. 在醋酸(HAc)中升温并加水稀释，解离度 α 和 pH 分别如何变化？</div>
              <button className={`quiz-opt ${quizState.q1 && quizState.q1.sel === 'A' ? (quizState.q1.isCorrect ? 'correct' : 'wrong') : ''}`} onClick={() => setQuizState({ ...quizState, q1: { sel: 'A', isCorrect: false, fdbk: '加水稀释H⁺绝对浓度降低。' } })}>A. α 增大，pH 降低</button>
              <button className={`quiz-opt ${quizState.q1 && quizState.q1.sel === 'B' ? (quizState.q1.isCorrect ? 'correct' : 'wrong') : ''}`} onClick={() => setQuizState({ ...quizState, q1: { sel: 'B', isCorrect: true, fdbk: '【批判性解析】正确！升温和稀释使α增大；但体积膨胀效应更大，H⁺浓度下降，pH升高。' } })}>B. α 增大，pH 升高</button>
              {quizState.q1 && <div className="quiz-feedback" style={{ display: 'block' }}>{quizState.q1.fdbk}</div>}
            </div>
            <div className="quiz-card">
              <div className="quiz-q">2. 已知 H₂CO₃ 的 pKa1=6.38, pKa2=10.25。0.1 mol/L NaHCO₃ 溶液 pH 约为？</div>
              <button className={`quiz-opt ${quizState.q2 && quizState.q2.sel === 'A' ? (quizState.q2.isCorrect ? 'correct' : 'wrong') : ''}`} onClick={() => setQuizState({ ...quizState, q2: { sel: 'A', isCorrect: true, fdbk: '【批判性解析】正确！HCO₃⁻ 是两性物质，直接用最简公式：pH = ½(pKa1 + pKa2) = 8.315。' } })}>A. pH = ½(pKa1 + pKa2) = 8.315</button>
              <button className={`quiz-opt ${quizState.q2 && quizState.q2.sel === 'B' ? (quizState.q2.isCorrect ? 'correct' : 'wrong') : ''}`} onClick={() => setQuizState({ ...quizState, q2: { sel: 'B', isCorrect: false, fdbk: '不适用弱酸盐公式。' } })}>B. pH = 7 + ½(pKa1 + lg c)</button>
              {quizState.q2 && <div className="quiz-feedback" style={{ display: 'block' }}>{quizState.q2.fdbk}</div>}
            </div>
          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '15px' }}>化学原理 AI助教</h3>
          <div style={{ height: '220px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: 'var(--text-muted)', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '8px', color: msg.role === 'ai' ? 'var(--cyan-glow)' : '#fff' }}>
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
            <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'var(--primary-blue)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}