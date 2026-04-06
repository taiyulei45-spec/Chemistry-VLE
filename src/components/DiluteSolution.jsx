import React, { useState, useEffect, useRef, useMemo } from 'react';

export default function DiluteSolution() {
  // ==========================================
  // 状态管理区
  // ==========================================
  
  // 实验室1状态 (依数性)
  const [lab1Mode, setLab1Mode] = useState('vapor');
  const [lab1Val, setLab1Val] = useState(0);

  // 实验室2状态 (细胞与反渗透)
  const [lab2Mode, setLab2Mode] = useState('cell');
  const [lab2Val, setLab2Val] = useState(9); // cell默认9(0.9%), RO默认0

  // 随堂测验状态
  const [quizState, setQuizState] = useState({});

  // AI 助教状态
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是你的专属 AI 助教。关于“依数性定量计算”、“红细胞渗透机制”或“反渗透原理”，我都能为你深度解答！\n\n*(输入你的疑惑，按回车探讨...)*' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 计算与渲染逻辑：实验室 1 (依数性)
  // ==========================================
  const handleLab1Switch = (mode) => {
    setLab1Mode(mode);
    setLab1Val(0); // 切换模式时重置浓度
  };

  let lab1DisplayVal = "纯溶剂";
  if (lab1Val > 0 && lab1Val < 50) lab1DisplayVal = "稀溶液";
  else if (lab1Val >= 50) lab1DisplayVal = "浓溶液";

  // 利用 useMemo 固定粒子的随机位置，防止滑块拖动时过度闪烁
  const vaporParticles = useMemo(() => Array.from({ length: 40 - Math.floor(lab1Val * 0.35) }).map(() => ({
    x: 110 + Math.random() * 180, cy1: 30 + Math.random() * 90, cy2: 10 + Math.random() * 60, dur: 2 + Math.random()
  })), [lab1Val]);
  
  const soluteParticlesVapor = useMemo(() => Array.from({ length: Math.floor(lab1Val * 0.4) }).map(() => ({
    x: 110 + Math.random() * 180, y: 145 + Math.random() * 60
  })), [lab1Val]);

  const soluteParticlesBoil = useMemo(() => Array.from({ length: Math.floor(lab1Val * 0.25) }).map(() => ({
    x: 65 + Math.random() * 110, y: 80 + Math.random() * 15
  })), [lab1Val]);

  const soluteParticlesFreeze = useMemo(() => Array.from({ length: Math.floor(lab1Val * 0.2) }).map(() => ({
    path: `M ${60 + Math.random() * 120} ${60 + Math.random() * 120} L ${60 + Math.random() * 120} ${60 + Math.random() * 120}`,
    dur: 0.5 + Math.random()
  })), [lab1Val]);

  const renderLab1SVG = () => {
    if (lab1Mode === 'vapor') {
      return (
        <svg width="100%" height="220" viewBox="0 0 400 220">
          <rect x="100" y="140" width="200" height="80" fill="rgba(6,182,212,0.3)"/>
          <line x1="100" y1="140" x2="300" y2="140" stroke="var(--primary-blue)" strokeWidth="3"/>
          {/* 气相水分子 */}
          {vaporParticles.map((p, i) => (
            <circle key={`v_${i}`} cx={p.x} cy={p.cy1} r="4" fill="#fff" opacity="0.8">
              <animate attributeName="cy" values={`${p.cy1};${p.cy2};${p.cy1}`} dur={`${p.dur}s`} repeatCount="indefinite"/>
            </circle>
          ))}
          {/* 液相溶质 */}
          {soluteParticlesVapor.map((p, i) => (
            <circle key={`s_${i}`} cx={p.x} cy={p.y} r="5" fill="var(--alert-orange)"/>
          ))}
          <text x="200" y="20" fill="#fff" textAnchor="middle" fontSize="12">蒸气压：活跃气相分子数 {vaporParticles.length}</text>
        </svg>
      );
    } else if (lab1Mode === 'boil') {
      let tbLevel = 110 - lab1Val * 0.6;
      return (
        <svg width="100%" height="220" viewBox="0 0 400 220">
          <text x="120" y="25" fill="var(--alert-red)" fontSize="13" textAnchor="middle" fontWeight="bold">沸点微观机制</text>
          <rect x="60" y="80" width="120" height="100" fill="rgba(239,68,68,0.15)"/>
          <line x1="60" y1="80" x2="180" y2="80" stroke="var(--alert-red)" strokeWidth="2"/>
          <text x="120" y="200" fill="var(--text-muted)" fontSize="11" textAnchor="middle">溶质阻挡水分子逃逸</text>
          {Array.from({ length: 8 }).map((_, i) => (
            <circle key={`bw_${i}`} cx={70 + i*14} cy="75" r="4" fill="#fff" opacity="0.8">
              <animate attributeName="cy" values="75;30" dur={`${1 + Math.random()*1.5}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0" dur={`${1 + Math.random()*1.5}s`} repeatCount="indefinite"/>
            </circle>
          ))}
          {soluteParticlesBoil.map((p, i) => <circle key={`bs_${i}`} cx={p.x} cy={p.y} r="5" fill="var(--alert-orange)"/>)}
          
          <text x="300" y="25" fill="var(--alert-red)" textAnchor="middle" fontWeight="bold">沸点 T₀ 上升</text>
          <rect x="290" y="40" width="20" height="140" rx="10" fill="rgba(255,255,255,0.1)" stroke="#fff" strokeWidth="2"/>
          <circle cx="300" cy="180" r="18" fill="var(--alert-red)"/>
          <rect x="294" y={tbLevel+20} width="12" height={160-tbLevel} fill="var(--alert-red)"/>
          <line x1="270" y1="130" x2="290" y2="130" stroke="#fff" strokeWidth="1" strokeDasharray="2"/>
          <text x="235" y="134" fill="#fff" fontSize="11">100℃</text>
        </svg>
      );
    } else if (lab1Mode === 'freeze') {
      let tfLevel = 110 + lab1Val * 0.6;
      return (
        <svg width="100%" height="220" viewBox="0 0 400 220">
          <text x="120" y="25" fill="var(--primary-blue)" fontSize="13" textAnchor="middle" fontWeight="bold">凝固点微观机制</text>
          <rect x="50" y="50" width="140" height="140" fill="rgba(6,182,212,0.15)"/>
          <text x="120" y="210" fill="var(--text-muted)" fontSize="11" textAnchor="middle">溶质无序撞击，阻断冰晶构建！</text>
          <g transform="translate(120, 120)">
            <path d="M 0 -40 L 34 -20 L 34 20 L 0 40 L -34 20 L -34 -20 Z" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="6">
              <animate attributeName="opacity" values="0.1; 0.9; 0.1" dur={`${Math.max(0.5, 3 - lab1Val*0.02)}s`} repeatCount="indefinite"/>
            </path>
            <circle cx="0" cy="-40" r="6" fill="#fff"/><circle cx="34" cy="-20" r="6" fill="#fff"/><circle cx="34" cy="20" r="6" fill="#fff"/>
            <circle cx="0" cy="40" r="6" fill="#fff"/><circle cx="-34" cy="20" r="6" fill="#fff"/><circle cx="-34" cy="-20" r="6" fill="#fff"/>
          </g>
          {soluteParticlesFreeze.map((p, i) => (
            <circle key={`fs_${i}`} r="5" fill="var(--alert-orange)">
              <animateMotion dur={`${p.dur}s`} repeatCount="indefinite" path={p.path}/>
            </circle>
          ))}
          <text x="300" y="25" fill="var(--primary-blue)" textAnchor="middle" fontWeight="bold">凝固点 T<sub>f</sub> 下降</text>
          <rect x="290" y="40" width="20" height="140" rx="10" fill="rgba(255,255,255,0.1)" stroke="#fff" strokeWidth="2"/>
          <circle cx="300" cy="180" r="18" fill="var(--primary-blue)"/>
          <rect x="294" y={tfLevel+20} width="12" height={160-tfLevel} fill="var(--primary-blue)"/>
          <line x1="310" y1="130" x2="330" y2="130" stroke="#fff" strokeWidth="1" strokeDasharray="2"/>
          <text x="335" y="134" fill="#fff" fontSize="11">0℃</text>
        </svg>
      );
    } else if (lab1Mode === 'osmosis') {
      let diff = lab1Val * 0.4;
      return (
        <svg width="100%" height="220" viewBox="0 0 400 220">
          <path d="M 150 40 L 150 180 Q 150 200 200 200 Q 250 200 250 180 L 250 40" fill="none" stroke="#475569" strokeWidth="6"/>
          <line x1="200" y1="180" x2="200" y2="200" stroke="var(--alert-orange)" strokeWidth="4" strokeDasharray="4"/>
          <path d={`M 153 ${110+diff} L 153 180 Q 153 197 198 197 L 198 197 L 198 ${110+diff} Z`} fill="rgba(6,182,212,0.5)"/>
          <text x="110" y="100" fill="var(--cyan-glow)" fontSize="12">纯水</text>
          <path d={`M 202 197 Q 247 197 247 180 L 247 ${110-diff} L 202 ${110-diff} Z`} fill="rgba(139,92,246,0.6)"/>
          <text x="280" y="100" fill="var(--purple-med)" fontSize="12">溶液</text>
          
          {lab1Val > 0 && (
            <>
              <path d="M 170 190 L 190 190" fill="none" stroke="var(--cyan-glow)" strokeWidth="2" markerEnd="url(#arrow_o)"/>
              <line x1="250" y1={110-diff} x2="270" y2={110-diff} stroke="#fff" strokeDasharray="2"/>
              <line x1="250" y1={110+diff} x2="270" y2={110+diff} stroke="#fff" strokeDasharray="2"/>
              <line x1="260" y1={110-diff} x2="260" y2={110+diff} stroke="var(--pink-glow)" strokeWidth="2" markerStart="url(#arrow-rev)" markerEnd="url(#arrow-rev)"/>
              <text x="265" y="110" fill="var(--pink-glow)" fontSize="18" fontWeight="bold">Π</text>
            </>
          )}
          <defs>
            <marker id="arrow_o" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cyan-glow)"/></marker>
            <marker id="arrow-rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><circle cx="5" cy="5" r="3" fill="var(--pink-glow)"/></marker>
          </defs>
        </svg>
      );
    }
  };

  // ==========================================
  // 计算与渲染逻辑：实验室 2 (细胞与工程)
  // ==========================================
  const handleLab2Switch = (mode) => {
    setLab2Mode(mode);
    setLab2Val(mode === 'cell' ? 9 : 0);
  };

  const renderLab2SVG = () => {
    if (lab2Mode === 'cell') {
      let conc = lab2Val / 10;
      let state = "", rx = 40, ry = 30, dash = "none", animDur = "2s";
      let displayValStr = "";

      if (conc === 0.9) {
        displayValStr = "0.9% (等渗溶液)";
        state = "形态正常";
      } else if (conc < 0.9) {
        displayValStr = conc.toFixed(1) + "% (低渗溶液)";
        rx = 40 + (0.9 - conc)*20;
        ry = 30 + (0.9 - conc)*20;
        if (conc < 0.3) { state = "细胞胀破 (溶血)"; dash = "5"; rx = 60; ry = 60; animDur="0.5s"; }
        else { state = "吸水膨胀"; }
      } else {
        displayValStr = conc.toFixed(1) + "% (高渗溶液)";
        rx = Math.max(18, 40 - (conc - 0.9)*12);
        ry = Math.max(12, 30 - (conc - 0.9)*12);
        state = "失水皱缩";
      }

      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{ position:'absolute', top:'10px', width:'100%', textAlign:'center', fontWeight:'bold', color:'#fff' }}>{displayValStr} - {state}</div>
          <svg width="100%" height="200" viewBox="0 0 400 200">
            <ellipse cx="200" cy="110" rx={rx} ry={ry} fill="var(--alert-red)" stroke="#b91c1c" strokeWidth="4" strokeDasharray={dash}>
              <animate attributeName="rx" values={`${rx};${rx-2};${rx}`} dur={animDur} repeatCount="indefinite"/>
            </ellipse>
            {conc < 0.8 && <><path d="M 110 110 L 150 110" stroke="var(--cyan-glow)" strokeWidth="3" markerEnd="url(#arrow_c)"/><path d="M 290 110 L 250 110" stroke="var(--cyan-glow)" strokeWidth="3" markerEnd="url(#arrow_c)"/></>}
            {conc > 1.0 && <><path d="M 170 110 L 130 110" stroke="var(--cyan-glow)" strokeWidth="3" markerEnd="url(#arrow_c)"/><path d="M 230 110 L 270 110" stroke="var(--cyan-glow)" strokeWidth="3" markerEnd="url(#arrow_c)"/></>}
            <defs>
              <marker id="arrow_c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cyan-glow)"/></marker>
            </defs>
          </svg>
        </div>
      );
    } else if (lab2Mode === 'ro') {
      let P = lab2Val / 10;
      let Pi = 2.5; 
      let netPressure = P - Pi; 
      let leftLevel = 90 - netPressure * 6;
      let rightLevel = 70 + netPressure * 6; 
      let pistonY = rightLevel - 5;
      let arrowDir = netPressure < 0 ? "M 170 160 L 190 160" : "M 230 160 L 210 160";
      let textDir = netPressure < 0 ? "自然渗透" : (netPressure > 0 ? "反渗透发生！淡水产出！" : "渗透平衡");
      let textColor = netPressure > 0 ? "var(--life-green)" : "var(--alert-orange)";

      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{ position:'absolute', top:'10px', width:'100%', textAlign:'center', fontWeight:'bold', color:textColor }}>{textDir} (Π = 2.5 MPa, 当前外压 {P.toFixed(1)} MPa)</div>
          <svg width="100%" height="200" viewBox="0 0 400 200">
            <path d="M 150 40 L 150 180 Q 150 200 200 200 Q 250 200 250 180 L 250 40" fill="none" stroke="#475569" strokeWidth="6"/>
            <line x1="200" y1="180" x2="200" y2="200" stroke="var(--alert-orange)" strokeWidth="4" strokeDasharray="4"/>
            <path d={`M 153 ${leftLevel} L 153 180 Q 153 197 198 197 L 198 197 L 198 ${leftLevel} Z`} fill="rgba(6,182,212,0.5)"/>
            <text x="100" y="120" fill="var(--cyan-glow)" fontSize="12">淡水区</text>
            <path d={`M 202 197 Q 247 197 247 180 L 247 ${rightLevel} L 202 ${rightLevel} Z`} fill="rgba(139,92,246,0.6)"/>
            <text x="260" y="120" fill="var(--purple-med)" fontSize="12">海水区</text>
            
            <rect x="250" y={pistonY-20} width="4" height="20" fill="#fff"/>
            <rect x="202" y={pistonY} width="45" height="6" fill="#f8fafc"/>
            <path d={`M 225 ${pistonY-20} L 225 ${pistonY}`} stroke="#fff" strokeWidth="3"/>
            <text x="225" y={pistonY-25} fill="#fff" fontSize="12" textAnchor="middle">外压 P</text>
            
            {netPressure !== 0 && <path d={arrowDir} fill="none" stroke="var(--life-green)" strokeWidth="3" markerEnd="url(#arrow_ro)"/>}
            
            <defs>
              <marker id="arrow_ro" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--life-green)"/></marker>
            </defs>
          </svg>
        </div>
      );
    }
  };

  // ==========================================
  // 测验与 AI 处理
  // ==========================================
  const handleQuizSubmit = (qId, isCorrect, optIndex, feedbackText) => {
    setQuizState(prev => ({
      ...prev,
      [qId]: { isCorrect, optIndex, feedbackText }
    }));
  };

  const handleChatSubmit = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim() !== '') {
      const userText = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
      setChatInput('');

      setTimeout(() => {
        let reply = "极好的思考！稀溶液的依数性揭示了自然界一个非常有趣的哲学：在浓度足够稀的情况下，物质个体的差异被抹平了，唯有“数量”决定了宏观的物理性质（沸点、凝固点、渗透压）。这也是为什么不论你输的是糖水还是盐水，只要保证“总粒子浓度”与血液相等，细胞就能安然无恙！";
        setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
      }, 800);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatOpen]);

  // ==========================================
  // 渲染区
  // ==========================================
  return (
    <div className="dilute-solution-wrapper">
      <style>{`
        .dilute-solution-wrapper {
          --bg-dark: #0a0f1a; --bg-panel: rgba(20, 30, 48, 0.7); --primary-blue: #3b82f6; --cyan-glow: #06b6d4;
          --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6;
          --pink-glow: #ec4899; --text-main: #f8fafc; --text-muted: #cbd5e1;
          background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif;
          overflow-x: hidden; scroll-behavior: smooth; line-height: 1.6; width: 100%;
        }
        .dilute-solution-wrapper h1, .dilute-solution-wrapper h2, .dilute-solution-wrapper h3, .dilute-solution-wrapper h4 { color: var(--cyan-glow); margin-top: 0; margin-bottom: 10px; }
        .dilute-solution-wrapper h2 { border-left: 4px solid var(--primary-blue); padding-left: 10px; margin-bottom: 15px; margin-top: 25px; font-size: 1.35rem; }
        .dilute-solution-wrapper h3 { color: var(--pink-glow); margin-top: 15px; font-size: 1.05rem; }
        .dilute-solution-wrapper section { padding: 40px 10%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        
        .dilute-solution-wrapper .btn { background: linear-gradient(135deg, var(--primary-blue), var(--purple-med)); border: none; padding: 12px 24px; color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
        .dilute-solution-wrapper .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6); }
        .dilute-solution-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.3s; margin: 3px; font-size: 13px; }
        .dilute-solution-wrapper .btn-outline:hover, .dilute-solution-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); box-shadow: 0 0 10px rgba(6, 182, 212, 0.5); border-color: var(--cyan-glow); color: #fff; }

        .dilute-solution-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .dilute-solution-wrapper .grid-2-asym { display: grid; grid-template-columns: 1fr 1.2fr; gap: 20px; }
        .dilute-solution-wrapper .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .dilute-solution-wrapper .panel { background: var(--bg-panel); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        
        .dilute-solution-wrapper .theory-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--purple-med); border-radius: 8px; padding: 20px; transition: all 0.3s; }
        .dilute-solution-wrapper .theory-card:hover { transform: translateY(-3px); box-shadow: 0 8px 15px rgba(139, 92, 246, 0.2); border-color: var(--cyan-glow); }
        .dilute-solution-wrapper .formula-box { background: rgba(0,0,0,0.5); padding: 12px; border-radius: 6px; font-family: 'Courier New', Courier, monospace; color: var(--life-green); border-left: 3px solid var(--life-green); margin: 10px 0; font-size: 14px; font-weight: bold; }
        .dilute-solution-wrapper .hl-term { color: var(--alert-orange); font-weight: bold; }
        .dilute-solution-wrapper .med-block { background: rgba(16, 185, 129, 0.05); border-left: 3px solid var(--life-green); padding: 15px; margin-top: 15px; border-radius: 4px; font-size: 14px; }

        .dilute-solution-wrapper .lab-container { display: flex; flex-direction: column; border: 2px dashed var(--primary-blue); border-radius: 12px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; min-height: 420px; position: relative; }
        .dilute-solution-wrapper .lab-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; gap: 10px; }
        .dilute-solution-wrapper .lab-title { margin: 0; color: #fff; font-size: 1.1rem; white-space: nowrap; margin-right: 10px; text-shadow: 0 0 8px var(--primary-blue); }
        .dilute-solution-wrapper .lab-screen { flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; background: rgba(0,0,0,0.4); border-radius: 8px; margin-top: 15px; position: relative; overflow: hidden; border: 1px solid #334155; box-shadow: inset 0 0 20px rgba(0,0,0,0.8); width: 100%; }
        
        .dilute-solution-wrapper .dojo-container { margin-top: 40px; padding-top: 20px; border-top: 1px dashed rgba(255,255,255,0.1); }
        .dilute-solution-wrapper .quiz-card { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 20px; border-left: 4px solid var(--pink-glow); transition: all 0.3s; margin-bottom: 20px; }
        .dilute-solution-wrapper .quiz-q { font-size: 15px; font-weight: bold; margin-bottom: 12px; color: #fff; line-height: 1.5; }
        .dilute-solution-wrapper .quiz-opt { display: block; width: 100%; text-align: left; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); padding: 10px 15px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; transition: 0.2s; font-size: 14px; }
        .dilute-solution-wrapper .quiz-opt:hover:not(.disabled) { background: rgba(255,255,255,0.1); border-color: var(--cyan-glow); color: #fff; }
        .dilute-solution-wrapper .quiz-opt.disabled { cursor: not-allowed; opacity: 0.6; }
        .dilute-solution-wrapper .quiz-opt.correct { background: rgba(16, 185, 129, 0.2) !important; border-color: var(--life-green) !important; color: #fff !important; box-shadow: 0 0 10px rgba(16,185,129,0.3); }
        .dilute-solution-wrapper .quiz-opt.wrong { background: rgba(239, 68, 68, 0.2) !important; border-color: var(--alert-red) !important; color: #fff !important; }
        .dilute-solution-wrapper .quiz-feedback { margin-top: 12px; padding: 12px; border-radius: 6px; background: rgba(14, 165, 233, 0.1); border: 1px solid var(--cyan-glow); font-size: 14px; line-height: 1.5; color: #f8fafc; }

        .dilute-solution-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--cyan-glow), var(--purple-med)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(139, 92, 246, 0.6); z-index: 100; transition: transform 0.3s; }
        .dilute-solution-wrapper .ai-bot:hover { transform: scale(1.1); }
        .dilute-solution-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: var(--bg-dark); border: 1px solid var(--purple-med); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.9); }
        .dilute-solution-wrapper .ai-chat-window input { width: calc(100% - 22px); padding: 10px; border-radius: 8px; border: none; margin-top: 10px; background: #1e293b; color: #fff; font-size: 14px; outline: none; }
      `}</style>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', paddingTop: '60px', paddingBottom: '40px' }}>
        <div style={{ position: 'relative', width: '100%', height: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: 'bold', margin: '0 auto', maxWidth: '500px' }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', filter: 'drop-shadow(0 0 10px var(--cyan-glow))' }}>
            <path d="M 180 20 L 180 100 Q 180 120 250 120 Q 320 120 320 100 L 320 20" fill="none" stroke="#475569" strokeWidth="6"/>
            <line x1="250" y1="100" x2="250" y2="130" stroke="var(--alert-orange)" strokeWidth="4" strokeDasharray="4"/>
            <path d="M 183 50 L 183 100 Q 183 117 248 117 L 248 50 Z" fill="rgba(6,182,212,0.4)">
              <animate attributeName="d" values="M 183 50 L 183 100 Q 183 117 248 117 L 248 50 Z; M 183 70 L 183 100 Q 183 117 248 117 L 248 70 Z; M 183 50 L 183 100 Q 183 117 248 117 L 248 50 Z" dur="4s" repeatCount="indefinite"/>
            </path>
            <path d="M 252 50 L 252 117 Q 317 117 317 100 L 317 50 Z" fill="rgba(139,92,246,0.5)">
              <animate attributeName="d" values="M 252 50 L 252 117 Q 317 117 317 100 L 317 50 Z; M 252 30 L 252 117 Q 317 117 317 100 L 317 30 Z; M 252 50 L 252 117 Q 317 117 317 100 L 317 50 Z" dur="4s" repeatCount="indefinite"/>
            </path>
            <path d="M 220 110 L 280 110" fill="none" stroke="var(--cyan-glow)" strokeWidth="3" markerEnd="url(#arrow_top)">
              <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
            </path>
            <defs>
              <marker id="arrow_top" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--cyan-glow)"/></marker>
            </defs>
          </svg>
          <span style={{ color: '#fff', zIndex: 2, marginTop: '-90px' }}><i>Π = cRT</i></span>
        </div>
        <h1 style={{ fontSize: '2.8rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>稀溶液理论：微观依数性与医药工程前沿</h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '30px' }}>“跨越浓度的界限，揭示纯水与溶液在能量、沸点与细胞存亡中的终极法则。”</p>
        <button className="btn" onClick={() => document.getElementById('module1').scrollIntoView()}>探索依数性奥秘 ↓</button>
      </section>

      {/* Module 1: Theory */}
      <section id="module1">
        <h2>模块一：理想溶液与稀溶液理论要点</h2>
        <div className="grid-3">
          <div className="theory-card">
            <h3 style={{ marginTop: 0 }}>1. 理想溶液与稀溶液</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              <strong>理想溶液：</strong>溶质与溶剂分子间作用力完全相同的溶液。遵循拉乌尔定律 (Raoult's Law)。<br/>
              <strong>稀溶液：</strong>浓度极低，溶质分子间作用可忽略。溶剂遵循拉乌尔定律，挥发性溶质遵循亨利定律 (Henry's Law)。对于难挥发非电解质，其稀水溶液的 <i>c</i><sub>B</sub> ≈ <i>b</i><sub>B</sub>。
            </p>
          </div>
          <div className="theory-card">
            <h3 style={{ marginTop: 0 }}>2. 依数性本质 (Colligative Properties)</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              难挥发、非电解质稀溶液的某些性质，<span className="hl-term">仅与一定量溶剂中所含溶质的“粒子数目”成正比</span>，而与溶质的本性（分子大小、种类）无关。这就好比高速公路的拥堵程度取决于车辆的数量，而不管那是货车还是轿车。
            </p>
          </div>
          <div className="theory-card">
            <h3 style={{ marginTop: 0 }}>3. 四大核心公式</h3>
            <div className="formula-box" style={{ textAlign: 'left', paddingLeft: '20px' }}>
              1. 蒸气压下降：Δ<i>p</i> = <i>p</i><sup>*</sup> <i>x</i><sub>B</sub><br/>
              2. 沸点升高：Δ<i>T</i><sub>b</sub> = <i>K</i><sub>b</sub> <i>b</i><sub>B</sub><br/>
              3. 凝固点降低：Δ<i>T</i><sub>f</sub> = <i>K</i><sub>f</sub> <i>b</i><sub>B</sub><br/>
              4. 渗透压：<i>Π</i> = <i>c</i><sub>B</sub> <i>R T</i>
            </div>
          </div>
        </div>
      </section>

      {/* Module 2: Lab 1 */}
      <section id="module2">
        <h2>模块二：稀溶液依数性可视化实验室</h2>
        <div className="grid-2-asym">
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>改变浓度，洞察微观变化</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              当难挥发溶质加入纯溶剂中，溶质粒子占据了溶液表面，减少了溶剂分子逃逸的概率（蒸气压下降）；这进一步导致溶液需要更高的温度才能沸腾（沸点升高），更低的温度才能结冰（凝固点降低）；而在半透膜两侧，浓度差将驱动溶剂自发流动（渗透压）。
            </p>
            <div className="med-block" style={{ borderColor: 'var(--cyan-glow)', background: 'rgba(6,182,212,0.05)' }}>
              请在右侧选择不同的依数性物理量，并拖动滑块增加溶质浓度，观察微观粒子行为与宏观物理量的联动变化。
            </div>
          </div>

          <div className="lab-container">
            <div className="lab-header">
              <h3 className="lab-title">全息实验室 1：依数性微观模拟</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button className={`btn-outline ${lab1Mode === 'vapor' ? 'active' : ''}`} onClick={() => handleLab1Switch('vapor')}>蒸气压下降</button>
                <button className={`btn-outline ${lab1Mode === 'boil' ? 'active' : ''}`} onClick={() => handleLab1Switch('boil')}>沸点升高</button>
                <button className={`btn-outline ${lab1Mode === 'freeze' ? 'active' : ''}`} onClick={() => handleLab1Switch('freeze')}>凝固点降低</button>
                <button className={`btn-outline ${lab1Mode === 'osmosis' ? 'active' : ''}`} onClick={() => handleLab1Switch('osmosis')}>渗透压</button>
              </div>
            </div>
            <div className="lab-screen">
              {renderLab1SVG()}
            </div>
            <div className="control-group">
              <label>调节溶质浓度：<span style={{ color: 'var(--cyan-glow)', fontWeight: 'bold' }}>{lab1DisplayVal}</span></label>
              <input type="range" min="0" max="100" value={lab1Val} onChange={e => setLab1Val(parseInt(e.target.value))} />
            </div>
            <div style={{ marginTop: '15px', fontSize: '13px', color: 'var(--cyan-glow)', background: 'rgba(6,182,212,0.1)', padding: '12px', borderRadius: '8px' }}>
              {lab1Mode === 'vapor' && <span><strong>蒸气压下降 (Raoult's Law)：</strong>难挥发溶质（橙色）占据了液面，阻挡了溶剂分子（白点）逃逸到气相中，导致气相分子数减少，蒸气压降低。</span>}
              {lab1Mode === 'boil' && <span><strong>沸点升高机制：</strong>由于表面被溶质占据，水分子难以逃逸（蒸气压下降）。必须提供更高的热能（温度上升），才能使其蒸气压达到外界大气压而沸腾。</span>}
              {lab1Mode === 'freeze' && <span><strong>凝固点降低极致解析：</strong>微观下，水分子（白）正试图通过氢键（虚线）构建规则的六边形冰晶格；但四处游荡的溶质粒子（橙）不断撞击和阻碍。这导致<span style={{color:'var(--alert-red)'}}>必须提供更低的温度（减缓分子的热运动与撞击）</span>，冰晶格才能成功结存！</span>}
              {lab1Mode === 'osmosis' && <span><strong>渗透压产生：</strong>半透膜中间隔开纯水与溶液。右侧浓度增加，“化学势”变低，左侧纯水自发涌入右侧，导致右侧液面上升产生高差（静水压 Π）。</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Module 3: Lab 2 */}
      <section id="module3">
        <h2>模块三：医药细胞形态与反渗透工程</h2>
        <div className="grid-2-asym">
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>渗透压在医药与工程中的绝对统治力</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              <strong>等渗溶液：</strong>人体血浆渗透压约为 770 kPa。0.9% NaCl 溶液和 5% 葡萄糖溶液与血浆等渗。静脉输液必须使用等渗溶液，否则红细胞会因渗透作用吸水胀破（溶血）或失水皱缩。<br/>
              <strong>半透膜 (Semipermeable Membrane)：</strong>只允许溶剂分子通过，阻止溶质分子通过的膜（如细胞膜、醋酸纤维素膜）。<br/>
              <strong>反渗透 (Reverse Osmosis, RO)：</strong>当施加在溶液侧的外部压力 <i>P</i> &gt; 渗透压 <i>Π</i> 时，水分子将被强行从溶液侧挤向纯水侧。这是海水淡化和医药高纯水制备的核心技术。
            </p>
            <div className="med-block">
              <strong style={{ color: 'var(--life-green)' }}>💊 医药与工程应用：</strong><br/>
              <span className="hl-term">血液透析：</span>利用半透膜清除尿毒症患者血液中的代谢废物（小分子），保留蛋白质和血细胞（大分子）。<br/>
              <span className="hl-term">海水淡化：</span>采用超高压泵克服海水的巨大渗透压，通过反渗透膜挤出纯净的淡水。
            </div>
          </div>

          <div className="lab-container" style={{ borderColor: 'var(--pink-glow)' }}>
            <div className="lab-header">
              <h3 className="lab-title" style={{ textShadow: '0 0 8px var(--pink-glow)' }}>全息实验室 2：细胞与反渗透</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button className={`btn-outline ${lab2Mode === 'cell' ? 'active' : ''}`} style={{ borderColor: 'var(--pink-glow)', color: lab2Mode==='cell'?'#fff':'var(--pink-glow)', backgroundColor: lab2Mode==='cell'?'var(--pink-glow)':'transparent' }} onClick={() => handleLab2Switch('cell')}>红细胞渗透模拟</button>
                <button className={`btn-outline ${lab2Mode === 'ro' ? 'active' : ''}`} style={{ borderColor: 'var(--pink-glow)', color: lab2Mode==='ro'?'#fff':'var(--pink-glow)', backgroundColor: lab2Mode==='ro'?'var(--pink-glow)':'transparent' }} onClick={() => handleLab2Switch('ro')}>反渗透纯水制备</button>
              </div>
            </div>
            <div className="lab-screen">
              {renderLab2SVG()}
            </div>
            <div className="control-group">
              {lab2Mode === 'cell' ? (
                <>
                  <label>调节外部 NaCl 浓度：<span style={{ color: 'var(--pink-glow)', fontWeight: 'bold' }}>{lab2Val === 9 ? '0.9% (等渗)' : `${(lab2Val/10).toFixed(1)}%`}</span></label>
                  <input type="range" min="0" max="20" value={lab2Val} onChange={e => setLab2Val(parseInt(e.target.value))} style={{ accentColor: 'var(--pink-glow)' }} />
                </>
              ) : (
                <>
                  <label>施加右侧活塞压力 <i>P</i>：<span style={{ color: 'var(--pink-glow)', fontWeight: 'bold' }}>{(lab2Val/10).toFixed(1)} MPa</span></label>
                  <input type="range" min="0" max="50" value={lab2Val} onChange={e => setLab2Val(parseInt(e.target.value))} style={{ accentColor: 'var(--pink-glow)' }} />
                </>
              )}
            </div>
            <div style={{ marginTop: '15px', fontSize: '13px', color: 'var(--life-green)', background: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: '8px' }}>
              {lab2Mode === 'cell' && <span><strong>细胞形态演变：</strong>0.9% 浓度为等渗状态，细胞形态正常。滑块向左（低渗）水分涌入细胞导致胀破；滑块向右（高渗）细胞内水分被吸出，导致严重皱缩。</span>}
              {lab2Mode === 'ro' && <span><strong>反渗透机制：</strong>右侧为高渗海水（Π ≈ 2.5MPa）。当施加的外压 <i>P</i> &lt; <i>Π</i> 时，自然渗透仍占主导；当 <i>P</i> &gt; <i>Π</i> 时，强力逼迫海水中的水分子逆向穿透半透膜，左侧获得纯净淡水！</span>}
            </div>
          </div>
        </div>

        {/* Dojo Quiz */}
        <div className="dojo-container">
          <div className="dojo-title">⚔️ 思维道场：浓度边界破局</div>
          <div className="grid-2">
            
            {/* Quiz 1 */}
            <div className="quiz-card">
              <div className="quiz-q">1. 医院输液时，若误将大量蒸馏水直接注入静脉，会造成什么致命后果？</div>
              <button 
                className={`quiz-opt ${quizState.q1?.selectedOpt === 'A' ? (quizState.q1.isCorrect ? 'correct' : 'wrong') : ''} ${quizState.q1 ? 'disabled' : ''}`}
                onClick={() => !quizState.q1 && setQuizState(prev => ({...prev, q1: {isCorrect: true, selectedOpt: 'A', feedback: '【批判性解析】正确！蒸馏水的渗透压接近 0，属于极度低渗溶液。红细胞内部存在较高的渗透压，水分会疯狂涌入细胞内，导致红细胞过度膨胀并破裂（溶血），引发严重医疗事故。'}}))}
              >
                A. 细胞外液变为低渗，红细胞吸水膨胀破裂 (溶血)
              </button>
              <button 
                className={`quiz-opt ${quizState.q1?.selectedOpt === 'B' ? (quizState.q1.isCorrect ? 'correct' : 'wrong') : ''} ${quizState.q1 ? 'disabled' : ''}`}
                onClick={() => !quizState.q1 && setQuizState(prev => ({...prev, q1: {isCorrect: false, selectedOpt: 'B', feedback: '蒸馏水是低渗溶液，红细胞会吸水而不是失水。'}}))}
              >
                B. 细胞外液变为高渗，红细胞严重失水皱缩
              </button>
              {quizState.q1 && <div className="quiz-feedback">{quizState.q1.feedback}</div>}
            </div>

            {/* Quiz 2 */}
            <div className="quiz-card">
              <div className="quiz-q">2. 相同温度下，0.1 mol/L 的 NaCl 溶液与 0.1 mol/L 的葡萄糖溶液，谁的渗透压更高？</div>
              <button 
                className={`quiz-opt ${quizState.q2?.selectedOpt === 'A' ? (quizState.q2.isCorrect ? 'correct' : 'wrong') : ''} ${quizState.q2 ? 'disabled' : ''}`}
                onClick={() => !quizState.q2 && setQuizState(prev => ({...prev, q2: {isCorrect: false, selectedOpt: 'A', feedback: '依数性只与溶液中微粒的总数量成正比，与分子大小无关。'}}))}
              >
                A. 葡萄糖，因为其分子量大
              </button>
              <button 
                className={`quiz-opt ${quizState.q2?.selectedOpt === 'B' ? (quizState.q2.isCorrect ? 'correct' : 'wrong') : ''} ${quizState.q2 ? 'disabled' : ''}`}
                onClick={() => !quizState.q2 && setQuizState(prev => ({...prev, q2: {isCorrect: true, selectedOpt: 'B', feedback: '【批判性解析】正确！依数性只看“粒子数”。NaCl 是强电解质，1 mol NaCl 在水中完全解离成 1 mol Na⁺ 和 1 mol Cl⁻，共 2 mol 粒子。因此其渗透压几乎是葡萄糖（非电解质不解离）的两倍。'}}))}
              >
                B. NaCl，因为它在水中解离出双倍的离子数
              </button>
              {quizState.q2 && <div className="quiz-feedback">{quizState.q2.feedback}</div>}
            </div>

            {/* Quiz 3 */}
            <div className="quiz-card">
              <div className="quiz-q">3. 北方冬天常常在马路上撒盐融雪，但如果是极寒天气（如 -30℃），撒盐还能奏效吗？</div>
              <button 
                className={`quiz-opt ${quizState.q3?.selectedOpt === 'A' ? (quizState.q3.isCorrect ? 'correct' : 'wrong') : ''} ${quizState.q3 ? 'disabled' : ''}`}
                onClick={() => !quizState.q3 && setQuizState(prev => ({...prev, q3: {isCorrect: true, selectedOpt: 'A', feedback: '【批判性解析】正确！凝固点降低并非无极限。NaCl 溶液存在一个最低共晶点（约为 -21℃）。当气温低于此极限时，无论加多少盐水都会结冰。此时需要使用物理除雪或换用 CaCl₂ 等极限更低的融雪剂。'}}))}
              >
                A. 不能，凝固点降低存在热力学极限
              </button>
              <button 
                className={`quiz-opt ${quizState.q3?.selectedOpt === 'B' ? (quizState.q3.isCorrect ? 'correct' : 'wrong') : ''} ${quizState.q3 ? 'disabled' : ''}`}
                onClick={() => !quizState.q3 && setQuizState(prev => ({...prev, q3: {isCorrect: false, selectedOpt: 'B', feedback: '盐水溶液确实能降低凝固点，但有最低下限。'}}))}
              >
                B. 能，盐越多凝固点可以无限下降
              </button>
              {quizState.q3 && <div className="quiz-feedback">{quizState.q3.feedback}</div>}
            </div>

            {/* Quiz 4 */}
            <div className="quiz-card">
              <div className="quiz-q">4. 反渗透海水淡化设备中，为什么要配备功率极大的高压泵？</div>
              <button 
                className={`quiz-opt ${quizState.q4?.selectedOpt === 'A' ? (quizState.q4.isCorrect ? 'correct' : 'wrong') : ''} ${quizState.q4 ? 'disabled' : ''}`}
                onClick={() => !quizState.q4 && setQuizState(prev => ({...prev, q4: {isCorrect: false, selectedOpt: 'A', feedback: '半透膜孔径是固定的，高压并不能将其“撑开”。'}}))}
              >
                A. 为了撑开半透膜的微小孔隙
              </button>
              <button 
                className={`quiz-opt ${quizState.q4?.selectedOpt === 'B' ? (quizState.q4.isCorrect ? 'correct' : 'wrong') : ''} ${quizState.q4 ? 'disabled' : ''}`}
                onClick={() => !quizState.q4 && setQuizState(prev => ({...prev, q4: {isCorrect: true, selectedOpt: 'B', feedback: '【批判性解析】正确！海水中含有大量盐分，具有极高的渗透压（约 2.5 MPa）。自然状态下，淡水会流向海水。反渗透必须施加一个远大于海水渗透压的外部机械压力，才能强行逼迫海水中的水分子逆向穿过半透膜流向淡水侧。'}}))}
              >
                B. 必须克服并超越海水极高的内在渗透压
              </button>
              {quizState.q4 && <div className="quiz-feedback">{quizState.q4.feedback}</div>}
            </div>

          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '16px' }}>化学原理 AI助教</h3>
          <div style={{ height: '200px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: 'var(--text-muted)', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--cyan-glow)' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong> <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <input 
            type="text" 
            placeholder="输入问题探讨，按回车发送..." 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
                const val = chatInput.trim();
                setChatHistory(prev => [...prev, { role: 'user', text: val }]);
                setChatInput('');
                setTimeout(() => {
                  setChatHistory(prev => [...prev, { role: 'ai', text: "极好的思考！稀溶液的依数性揭示了自然界一个非常有趣的哲学：在浓度足够稀的情况下，物质个体的差异被抹平了，唯有“数量”决定了宏观的物理性质（沸点、凝固点、渗透压）。这也是为什么不论你输的是糖水还是盐水，只要保证“总粒子浓度”与血液相等，细胞就能安然无恙！" }]);
                }, 1000);
              }
            }} 
          />
        </div>
      )}
    </div>
  );
}