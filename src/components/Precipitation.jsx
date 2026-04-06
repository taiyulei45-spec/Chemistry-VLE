import React, { useState, useEffect, useRef } from 'react';

export default function Precipitation() {
  // ==========================================
  // 状态管理区
  // ==========================================
  // 模块二：Qc 与 Ksp 动态模拟
  const [currentSub, setCurrentSub] = useState('AgCl');
  const [agLog, setAgLog] = useState(-5);
  const [xLog, setXLog] = useState(-5);

  // 模块三：莫尔法滴定
  const [drops, setDrops] = useState(0);

  // 模块四：随堂测验
  const [q1Ans, setQ1Ans] = useState('');
  const [q2Ans, setQ2Ans] = useState('');
  const [quizResult, setQuizResult] = useState({ text: '', color: '' });

  // AI 助教
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是沉淀平衡 AI 导师。关于“溶度积常数(Ksp)”、“分步沉淀”或“莫尔法滴定”，你有什么疑问吗？\n(例如：“如何利用沉淀和配位效应分离银离子和铜离子？”)' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 数据字典与核心逻辑
  // ==========================================
  const kspData = {
    'AgCl': { name: '氯化银 (AgCl)', ksp: 1.8e-10, pKsp: 9.74, color: 'var(--crystal-white)', label: '白色' },
    'AgBr': { name: '溴化银 (AgBr)', ksp: 5.0e-13, pKsp: 12.30, color: 'var(--crystal-yellow)', label: '淡黄色' },
    'AgI':  { name: '碘化银 (AgI)',  ksp: 8.3e-17, pKsp: 16.08, color: '#eab308', label: '黄色' }
  };

  const activeSub = kspData[currentSub];
  
  // 计算 Qc
  const calcQc = () => {
    return Math.pow(10, agLog) * Math.pow(10, xLog);
  };
  const qc = calcQc();
  
  // 格式化科学计数法
  const formatSci = (num) => {
    if (num === 0) return "0";
    let exponent = Math.floor(Math.log10(num));
    let mantissa = (num / Math.pow(10, exponent)).toFixed(1);
    return `${mantissa} × 10<sup>${exponent}</sup>`;
  };

  // 判断沉淀状态
  let stateText = "", stateColor = "", crystalOpacity = 0, crystalHeight = 0;
  if (qc < activeSub.ksp * 0.9) {
    stateText = "Unsaturated (不饱和) - 无沉淀，固体溶解";
    stateColor = "var(--primary-blue)";
    crystalOpacity = 0;
    crystalHeight = 0;
  } else if (qc >= activeSub.ksp * 0.9 && qc <= activeSub.ksp * 1.1) {
    stateText = "Equilibrium (饱和) - 达到动态平衡";
    stateColor = "var(--life-green)";
    crystalOpacity = 0.5;
    crystalHeight = 15;
  } else {
    stateText = "Supersaturated (过饱和) - 产生沉淀";
    stateColor = "var(--alert-red)";
    crystalOpacity = 1;
    // 动态计算结晶高度，Qc超得越多长得越高 (封顶50px)
    const diffLog = Math.log10(qc) - Math.log10(activeSub.ksp);
    crystalHeight = Math.min(50, 20 + diffLog * 5);
  }

  // 莫尔法滴定逻辑
  let beakerLiquidColor = "rgba(6, 182, 212, 0.15)";
  let pptColor = "transparent";
  let pptHeight = 0;
  let endpointText = "滴加 AgNO₃，等待反应...";
  let endpointColor = "#cbd5e1";

  if (drops > 0 && drops <= 60) {
    pptColor = "var(--crystal-white)";
    pptHeight = drops * 0.6;
    endpointText = "AgCl (白色) 不断生成，CrO₄²⁻ 尚未反应。";
    endpointColor = "var(--cyan-glow)";
  } else if (drops > 60) {
    pptColor = "var(--brick-red)";
    beakerLiquidColor = "rgba(185, 28, 28, 0.2)";
    pptHeight = 36 + (drops - 60) * 1.5;
    endpointText = "🚨 滴定终点到达！AgCl 沉淀完全，生成砖红色 Ag₂CrO₄ 沉淀！";
    endpointColor = "var(--alert-red)";
  }

  // 测验逻辑
  const submitQuiz = () => {
    if (q1Ans === 'B' && q2Ans === 'C') {
      setQuizResult({ text: "✅ 恭喜通关！你完美掌握了溶度积常数 Qc 与 Ksp 的核心原理以及分步沉淀的药学分析应用！", color: "var(--life-green)" });
    } else {
      setQuizResult({ text: "❌ 存在错误。提示：Qc > Ksp 时才会产生沉淀；在分步沉淀中，所需沉淀剂离子浓度越小的越先沉淀（Ksp小的优先）。", color: "var(--alert-orange)" });
    }
  };

  // AI 交互逻辑
  const handleChatSubmit = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');

      setTimeout(() => {
        let reply = "非常有创意的实验方案！利用沉淀溶解平衡和配位效应分离重金属，思路是完全可行的。你可以先通过精确控制极小的 [OH⁻] 或通入 H₂S 让 Ksp 极小的 Ag₂S 优先沉淀（分步沉淀），将银完美分离。而后针对高浓度铜离子，利用过量氨水发生配位反应形成 [Cu(NH₃)₄]²⁺ 配合物进行后续处理。<br><br>不过我要提醒你一个热力学陷阱：如果氨水浓度过高，体系的强碱性可能会引发竞争反应，导致生成 Cu(OH)₂ 甚至碱式盐沉淀！这就是我们常说的副反应竞争。";
        setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
      }, 1000);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatOpen]);

  return (
    <div className="precip-wrapper">
      <style>{`
        .precip-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(20, 30, 48, 0.7); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --pink-glow: #ec4899; --text-main: #f8fafc; --brick-red: #b91c1c; --crystal-white: #f1f5f9; --crystal-yellow: #fde047; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
        .precip-wrapper h1, .precip-wrapper h2, .precip-wrapper h3, .precip-wrapper h4 { color: var(--cyan-glow); }
        .precip-wrapper h2 { border-left: 5px solid var(--primary-blue); padding-left: 15px; margin-bottom: 30px; }
        .precip-wrapper section { min-height: 100vh; padding: 60px 10%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .precip-wrapper .btn { background: linear-gradient(135deg, var(--primary-blue), var(--cyan-glow)); border: none; padding: 12px 24px; color: #fff; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3); }
        .precip-wrapper .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(6, 182, 212, 0.6); }
        .precip-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; margin-right: 10px; margin-bottom: 10px; }
        .precip-wrapper .btn-outline:hover, .precip-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); box-shadow: 0 0 10px rgba(6, 182, 212, 0.5); color: #fff; }
        
        .precip-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .precip-wrapper .panel { background: var(--bg-panel); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        
        .precip-wrapper .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .precip-wrapper .summary-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--cyan-glow); border-radius: 12px; padding: 25px; transition: all 0.3s; box-shadow: inset 0 0 20px rgba(6, 182, 212, 0.05); }
        .precip-wrapper .summary-card:hover { transform: translateY(-10px); box-shadow: 0 10px 30px rgba(6, 182, 212, 0.2); border-color: var(--life-green); }
        .precip-wrapper .card-icon { font-size: 2.5rem; margin-bottom: 15px; }
        
        /* 烧杯与动画样式 */
        .precip-wrapper .beaker-container { display: flex; align-items: center; justify-content: center; flex-direction: column; border: 2px dashed var(--primary-blue); border-radius: 16px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 40px; min-height: 400px; position: relative; overflow: hidden; }
        .precip-wrapper .beaker { width: 140px; height: 180px; border: 4px solid rgba(255,255,255,0.4); border-top: none; border-radius: 0 0 20px 20px; position: relative; background: rgba(6, 182, 212, 0.1); display: flex; align-items: flex-end; justify-content: center; overflow: hidden; box-shadow: 0 0 30px rgba(6, 182, 212, 0.2); }
        .precip-wrapper .liquid { width: 100%; height: 70%; background: var(--beaker-color, rgba(6, 182, 212, 0.2)); position: absolute; bottom: 0; transition: background 1s ease; }
        .precip-wrapper .precipitate { width: 100%; position: absolute; bottom: 0; background: var(--ppt-color, transparent); transition: all 0.5s ease; opacity: 0.9; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        .precip-wrapper .floating-beaker { animation: float 4s ease-in-out infinite; }
        
        .precip-wrapper .slider-group { margin-bottom: 20px; }
        .precip-wrapper .slider-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #cbd5e1; }
        .precip-wrapper input[type="range"] { width: 100%; accent-color: var(--cyan-glow); }
        
        .precip-wrapper .data-box { background: rgba(0,0,0,0.5); border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center; }
        .precip-wrapper .data-val { font-size: 24px; font-weight: bold; margin-top: 5px; display: block; }
        
        .precip-wrapper .quiz-item { margin-bottom: 25px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; border-left: 3px solid var(--primary-blue); }
        .precip-wrapper .quiz-item label { display: block; margin: 8px 0; cursor: pointer; padding: 8px; border-radius: 5px; transition: 0.2s; background: rgba(255,255,255,0.05); }
        .precip-wrapper .quiz-item label:hover { background: rgba(255,255,255,0.15); }
        
        .precip-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--cyan-glow), var(--primary-blue)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(6, 182, 212, 0.6); z-index: 100; transition: transform 0.3s; }
        .precip-wrapper .ai-bot:hover { transform: scale(1.1); }
        .precip-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: var(--bg-dark); border: 1px solid var(--cyan-glow); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
        .precip-wrapper .ai-chat-window input { width: calc(100% - 22px); padding: 10px; border-radius: 6px; border: none; margin-top: 10px; background: #1e293b; color: #fff;}
      `}</style>

      <section id="hero" style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #082f49 0%, var(--bg-dark) 100%)' }}>
        <div className="floating-beaker" style={{ margin: '0 auto 40px', width: '120px', height: '140px', border: '4px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 15px 15px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 40px rgba(6, 182, 212, 0.4)' }}>
            <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '60%', background: 'rgba(6, 182, 212, 0.3)' }}></div>
            <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '15px', background: 'var(--crystal-white)' }}></div>
            <div style={{ position: 'absolute', bottom: '15px', width: '100%', height: '10px', background: 'var(--crystal-yellow)' }}></div>
        </div>
        <h1 style={{ fontSize: '3rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--life-green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          沉淀溶解平衡：从微观机制到宏观应用
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px' }}>
          “沉淀并非静止的死亡，而是溶解与结晶的激烈博弈。掌控 Ksp，你就能在复杂的离子混合液中，犹如上帝般分离出想要的物质。”
        </p>
        <button className="btn" onClick={() => document.getElementById('summary').scrollIntoView()}>进入沉淀分离实验室 ↓</button>
      </section>

      <section id="summary" style={{ paddingTop: '20px' }}>
        <h2>模块一：理论要点与核心概念</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-icon">⚖️</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>1. 溶度积常数 (Ksp)</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>在一定温度下，难溶电解质的饱和溶液中，各离子浓度幂的乘积是一个常数。Ksp 越小，该物质越难溶。<br/>
            例如：AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)<br/>Ksp = [Ag⁺][Cl⁻]</p>
          </div>
          <div className="summary-card">
            <div className="card-icon">🎯</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>2. 溶度积规则 (Qc vs Ksp)</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>任意时刻的离子浓度积称为 Qc：<br/>
            - <strong>Qc &lt; Ksp：</strong> 不饱和溶液，沉淀溶解。<br/>
            - <strong>Qc = Ksp：</strong> 饱和溶液，动态平衡。<br/>
            - <strong>Qc &gt; Ksp：</strong> 过饱和溶液，<strong>产生沉淀</strong>。</p>
          </div>
          <div className="summary-card">
            <div className="card-icon">🧪</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>3. 分步沉淀与药学应用</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>当溶液中有多种离子都能与加入的沉淀剂反应时，所需沉淀剂离子浓度越小的物质越先沉淀。药学检验中常利用此原理分离提准干扰离子，如利用 Mohr 法测定氯离子浓度。</p>
          </div>
        </div>
      </section>

      <section id="module2">
        <h2>模块二：动态微观 —— 溶度积规则模拟器</h2>
        <div style={{ marginBottom: '20px' }}>
          <button className={`btn-outline ${currentSub === 'AgCl' ? 'active' : ''}`} onClick={() => { setCurrentSub('AgCl'); setAgLog(-5); setXLog(-5); }}>氯化银 AgCl</button>
          <button className={`btn-outline ${currentSub === 'AgBr' ? 'active' : ''}`} onClick={() => { setCurrentSub('AgBr'); setAgLog(-6); setXLog(-6); }}>溴化银 AgBr</button>
          <button className={`btn-outline ${currentSub === 'AgI' ? 'active' : ''}`} onClick={() => { setCurrentSub('AgI'); setAgLog(-8); setXLog(-8); }}>碘化银 AgI</button>
        </div>

        <div className="grid-2">
          <div className="panel">
            <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)' }}>离子浓度调节控制台</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>当前物质：<strong>{activeSub.name}</strong>，其 Ksp 值为 <span style={{ color: 'var(--alert-orange)' }} dangerouslySetInnerHTML={{ __html: formatSci(activeSub.ksp) }}></span>。</p>
            
            <div className="slider-group">
              <label>[Ag⁺] 浓度对数: 10<sup style={{ color: 'var(--cyan-glow)' }}>{agLog}</sup> mol/L</label>
              <input type="range" min="-12" max="-1" value={agLog} onChange={e => setAgLog(parseInt(e.target.value))} />
            </div>
            
            <div className="slider-group">
              <label>[X⁻] 浓度对数: 10<sup style={{ color: 'var(--cyan-glow)' }}>{xLog}</sup> mol/L</label>
              <input type="range" min="-12" max="-1" value={xLog} onChange={e => setXLog(parseInt(e.target.value))} />
            </div>

            <div className="data-box">
              <span style={{ color: '#cbd5e1', fontSize: '14px' }}>当前离子浓度积 Qc = [Ag⁺][X⁻]</span>
              <span className="data-val" dangerouslySetInnerHTML={{ __html: formatSci(qc) }}></span>
            </div>

            <div className="data-box" style={{ borderColor: stateColor, backgroundColor: 'rgba(0,0,0,0.8)' }}>
              <span style={{ color: '#cbd5e1', fontSize: '14px' }}>系统状态诊断：</span>
              <span style={{ display: 'block', color: stateColor, fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>{stateText}</span>
            </div>
          </div>
          
          <div className="beaker-container">
            <h3 style={{ position: 'absolute', top: '20px', color: '#fff', textShadow: '0 0 5px var(--cyan-glow)' }}>沉淀宏观表现</h3>
            <div className="beaker">
              <div className="liquid"></div>
              <div className="precipitate" style={{ height: `${crystalHeight}px`, backgroundColor: activeSub.color, opacity: crystalOpacity }}></div>
            </div>
            <div style={{ marginTop: '20px', color: '#94a3b8', fontSize: '14px' }}>
               若产生沉淀，将生成 <strong>{activeSub.label}</strong> 固体。
            </div>
          </div>
        </div>
      </section>

      <section id="module3">
        <h2>模块三：药学分析应用 —— 莫尔法 (Mohr Method) 滴定模拟</h2>
        <div className="grid-2">
          <div className="beaker-container" style={{ background: '#020617' }}>
            <div className="beaker">
              <div className="liquid" style={{ background: beakerLiquidColor }}></div>
              <div className="precipitate" style={{ height: `${pptHeight}px`, background: pptColor }}></div>
            </div>
            <div style={{ marginTop: '30px', color: endpointColor, fontSize: '16px', fontWeight: 'bold', textAlign: 'center', height: '40px' }}>
                {endpointText}
            </div>
          </div>

          <div className="panel" style={{ borderColor: 'var(--brick-red)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--alert-red)' }}>滴定原理：分步沉淀的艺术</h3>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
              莫尔法利用 <strong>K₂CrO₄</strong> 作为指示剂，用 <strong>AgNO₃</strong> 标准溶液滴定 Cl⁻。<br/><br/>
              1. <strong>沉淀竞争：</strong> AgCl 的溶解度远小于 Ag₂CrO₄。因此滴入 Ag⁺ 时，AgCl 优先沉淀（白色）。<br/>
              2. <strong>终点突变：</strong> 当溶液中的 Cl⁻ 被几乎耗尽后，再滴入哪怕一滴 AgNO₃，[Ag⁺]²[CrO₄²⁻] 就会超过 Ag₂CrO₄ 的 Ksp，瞬间产生砖红色的 Ag₂CrO₄ 沉淀，指示滴定到达终点！
            </p>
            <div className="slider-group" style={{ marginTop: '30px' }}>
              <label>滴加 AgNO₃ 体积 (mL): <span style={{ color: 'var(--alert-red)' }}>{drops}</span></label>
              <input type="range" min="0" max="100" value={drops} onChange={e => setDrops(parseInt(e.target.value))} style={{ accentColor: 'var(--alert-red)' }} />
            </div>
            <button className="btn" style={{ background: 'var(--brick-red)', width: '100%', marginTop: '10px' }} onClick={() => setDrops(0)}>🔄 重置滴定</button>
          </div>
        </div>
      </section>

      <section id="module4">
        <h2>模块四：教学闭环 —— 随堂挑战与科学思政</h2>
        <div className="grid-2">
          <div className="panel" style={{ background: 'rgba(139, 92, 246, 0.1)', borderColor: 'var(--purple-med)' }}>
            <h3 style={{ color: 'var(--pink-glow)' }}>🚩 课程思政：动态平衡中的辩证法</h3>
            <p><strong>1. 沉淀与溶解的对立统一：</strong> 宏观上看似静止的一杯带有沉淀的水，在微观下却是离子不断脱离晶体进入溶液，以及溶液离子不断撞击晶格沉淀下来的剧烈交锋。这就是唯物辩证法中“绝对运动与相对静止”的生动体现。</p>
            <p><strong>2. 量变引起质变：</strong> 莫尔法滴定中，我们一直在滴加银离子，前半程只生成白色沉淀。但当氯离子被消耗到一个临界点（度）时，一滴银离子的加入就导致了砖红色沉淀的爆发式生成。这告诉我们在药学检验中，必须极其精确地控制实验条件，警惕“质变”的发生。</p>
          </div>
          <div>
            <h3>核心考点在线测评</h3>
            <div className="quiz-item">
              <p>1. 【溶度积规则判断】在含有 BaSO₄ 固体的饱和溶液中，如果加入少量的 Na₂SO₄ 固体（不考虑体积变化），溶液的 Qc 会如何变化？BaSO₄ 的溶解度会如何改变？</p>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('A')} /> A. Qc 减小，溶解度增大</label>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('B')} /> B. Qc 短暂增大（Qc &gt; Ksp），促使平衡向沉淀方向移动，最终导致 BaSO₄ 的溶解度减小（同离子效应）</label>
              <label><input type="radio" name="q1" onChange={() => setQ1Ans('C')} /> C. Qc 不变，溶解度不变</label>
            </div>
            <div className="quiz-item">
              <p>2. 【分步沉淀】混合溶液中同时含有 0.1 mol/L 的 Cl⁻ 和 I⁻。若逐滴加入 AgNO₃ 溶液，已知 Ksp(AgCl) = 1.8×10⁻¹⁰，Ksp(AgI) = 8.3×10⁻¹⁷。哪种沉淀会先生成？</p>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('A')} /> A. 同时生成</label>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('B')} /> B. AgCl 先生成</label>
              <label><input type="radio" name="q2" onChange={() => setQ2Ans('C')} /> C. AgI 先生成，因为其 Ksp 远小于 AgCl，所需析出沉淀的 [Ag⁺] 浓度更低</label>
            </div>
            <button className="btn" onClick={submitQuiz}>提交试卷检测</button>
            {quizResult.text && <p style={{ marginTop: '15px', fontWeight: 'bold', color: quizResult.color }}>{quizResult.text}</p>}
          </div>
        </div>
      </section>

      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '16px' }}>沉淀平衡 AI 导师</h3>
          <div style={{ height: '200px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--cyan-glow)' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI导师' : '你'}:</strong> <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <input type="text" placeholder="输入实验构想或理论问题..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleChatSubmit} />
        </div>
      )}
    </div>
  );
}