import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function FBlock() {
  // ==========================================
  // 状态管理区
  // ==========================================

  // Module 2: 镧系收缩 (Lanthanide Contraction)
  const [atomicZ, setAtomicZ] = useState(57); // 57(La) - 71(Lu)

  // Module 3 & 4: MRI 造影与配体毒性 (Gd3+ Ligand Toxicity)
  const [gdLigand, setGdLigand] = useState('macrocyclic'); // 'linear', 'macrocyclic'
  const [mriField, setMriField] = useState(false);

  // Module 5: 上转换发光 (UCNPs)
  const [nirLaser, setNirLaser] = useState(0); // 0-100

  // Module 6: 靶向阿尔法疗法 (TAT - Targeted Alpha Therapy)
  const [radiationType, setRadiationType] = useState('alpha'); // 'alpha', 'beta'

  // Module 8: 降磷药物 (Lanthanum Carbonate)
  const [po4Level, setPo4Level] = useState(100); 

  // Module 10: 测验状态
  const [quizState, setQuizState] = useState({});

  // AI 助教状态
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是 f区元素 AI 导师。内过渡金属隐藏的 4f/5f 轨道赋予了它们独特的磁性、发光特性和放射性。\n\n关于“镧系收缩的相对论效应”、“Gd造影剂的弛豫率”或“锕系核药的制备”，随时向我提问！' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 核心微观交互渲染函数 (SVG)
  // ==========================================

  // M2: 镧系收缩 SVG
  const renderContractionSVG = () => {
    // 半径随原子序数增加而缩小 (粗略模拟)
    const radius = 106 - (atomicZ - 57) * 1.5; 
    const fElectrons = atomicZ - 57;
    return (
      <svg width="100%" height="200" viewBox="0 0 400 200">
        <circle cx="200" cy="100" r="110" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4"/>
        <circle cx="200" cy="100" r={radius} fill="rgba(6,182,212,0.2)" stroke="var(--cyan-glow)" strokeWidth="3" style={{ transition: 'r 0.3s ease' }}/>
        <circle cx="200" cy="100" r="15" fill="var(--alert-orange)"/>
        <text x="200" y="105" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">+{atomicZ}</text>
        <text x="200" y="30" fill="var(--text-muted)" fontSize="14" textAnchor="middle">4f 轨道电子数: {fElectrons}</text>
        <text x="200" y="180" fill="var(--cyan-glow)" fontSize="14" fontWeight="bold" textAnchor="middle">离子半径 (Ln³⁺): {radius.toFixed(1)} pm</text>
        {fElectrons > 0 && (
          <text x="200" y="140" fill="var(--alert-red)" fontSize="12" textAnchor="middle">4f 电子屏蔽效应极差，有效核电荷剧增！</text>
        )}
      </svg>
    );
  };

  // M4: 配体毒性与螯合 SVG
  const renderLigandSVG = () => {
    const isLinear = gdLigand === 'linear';
    return (
      <svg width="100%" height="200" viewBox="0 0 400 200">
        {isLinear ? (
          <g>
            <path d="M 120 100 Q 200 150 280 100" fill="none" stroke="var(--alert-orange)" strokeWidth="4"/>
            <text x="200" y="160" fill="var(--alert-orange)" fontSize="14" textAnchor="middle">线性配体 (DTPA)：类似夹子</text>
            {mriField ? (
              <g>
                <circle cx="200" cy="50" r="15" fill="var(--alert-red)"><animate attributeName="cy" values="50; 20" dur="1s" fill="freeze"/></circle>
                <text x="200" y="55" fill="#fff" fontSize="10" textAnchor="middle"><animate attributeName="y" values="55; 25" dur="1s" fill="freeze"/>Gd³⁺</text>
                <text x="200" y="180" fill="var(--alert-red)" fontSize="14" fontWeight="bold" textAnchor="middle">警告：Gd³⁺ 脱落入血！引发肾源性系统纤维化(NSF)</text>
              </g>
            ) : (
              <g><circle cx="200" cy="80" r="15" fill="var(--sz-gold)"/><text x="200" y="85" fill="#fff" fontSize="10" textAnchor="middle">Gd³⁺</text></g>
            )}
          </g>
        ) : (
          <g>
            <circle cx="200" cy="100" r="40" fill="none" stroke="var(--life-green)" strokeWidth="6"/>
            <text x="200" y="160" fill="var(--life-green)" fontSize="14" textAnchor="middle">大环配体 (DOTA)：类似鸟笼</text>
            <circle cx="200" cy="100" r="15" fill="var(--sz-gold)"/>
            <text x="200" y="105" fill="#fff" fontSize="10" textAnchor="middle">Gd³⁺</text>
            {mriField && <text x="200" y="180" fill="var(--life-green)" fontSize="14" fontWeight="bold" textAnchor="middle">动力学极度惰性，完美锁死无毒性！</text>}
          </g>
        )}
      </svg>
    );
  };

  // M5: 上转换发光 UCNPs SVG
  const renderUCNPSVG = () => {
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <rect x="50" y="50" width="300" height="150" fill="rgba(15,23,42,0.8)" rx="20" stroke="var(--purple-med)" strokeWidth="2"/>
        <text x="200" y="40" fill="var(--purple-med)" fontSize="14" fontWeight="bold" textAnchor="middle">NaYF₄: Yb³⁺/Er³⁺ 纳米晶体</text>
        
        <circle cx="150" cy="125" r="25" fill="#334155"/>
        <text x="150" y="130" fill="#fff" fontSize="14" textAnchor="middle">Yb³⁺</text>
        <circle cx="250" cy="125" r="25" fill="#334155"/>
        <text x="250" y="130" fill="#fff" fontSize="14" textAnchor="middle">Er³⁺</text>

        {/* 近红外光 (980nm) 激发 Yb3+ */}
        <g opacity={nirLaser / 100}>
          <path d="M 20 100 L 110 115" stroke="var(--alert-red)" strokeWidth="3" strokeDasharray="5 5"><animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.2s" repeatCount="indefinite"/></path>
          <path d="M 20 150 L 110 135" stroke="var(--alert-red)" strokeWidth="3" strokeDasharray="5 5"><animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.2s" repeatCount="indefinite"/></path>
          <text x="60" y="90" fill="var(--alert-red)" fontSize="12" fontWeight="bold">980nm NIR (低能)</text>
          
          {/* Yb 到 Er 的能量共振转移 (ETU) */}
          <path d="M 180 120 L 220 120" stroke="var(--sz-gold)" strokeWidth="4" markerEnd="url(#arrow_ucnp)"><animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"/></path>
          <text x="200" y="110" fill="var(--sz-gold)" fontSize="10" textAnchor="middle">能量转移</text>

          {/* Er3+ 发出可见光 (540nm) */}
          <path d="M 280 125 L 380 125" stroke="var(--life-green)" strokeWidth="4" strokeDasharray="8 4"><animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.1s" repeatCount="indefinite"/></path>
          <text x="330" y="115" fill="var(--life-green)" fontSize="12" fontWeight="bold">540nm Green (高能)</text>
        </g>

        {nirLaser > 0 && <text x="200" y="220" fill="var(--cyan-glow)" fontSize="14" fontWeight="bold" textAnchor="middle">反斯托克斯发光：吸收两个低能光子，发射一个高能光子！深层穿透无背景荧光。</text>}
        <defs><marker id="arrow_ucnp" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sz-gold)"/></marker></defs>
      </svg>
    );
  };

  // M6: 靶向阿尔法疗法 (TAT) SVG
  const renderTATSVG = () => {
    const isAlpha = radiationType === 'alpha';
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <text x="200" y="20" fill="var(--text-muted)" fontSize="14" textAnchor="middle">癌细胞 DNA 螺旋</text>
        
        {/* 绘制双螺旋简图 */}
        <path d="M 50 100 Q 100 50 150 100 T 250 100 T 350 100" fill="none" stroke="var(--primary-blue)" strokeWidth="4"/>
        <path d="M 50 150 Q 100 200 150 150 T 250 150 T 350 150" fill="none" stroke="var(--cyan-glow)" strokeWidth="4"/>
        {[75, 125, 175, 225, 275, 325].map(x => <line key={x} x1={x} y1="85" x2={x} y2="165" stroke="#475569" strokeWidth="2"/>)}

        {/* 放射线攻击 */}
        {isAlpha ? (
          <g>
            <circle cx="200" cy="20" r="10" fill="var(--alert-orange)"/>
            <text x="200" y="24" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">He²⁺</text>
            <path d="M 200 30 L 200 125" stroke="var(--alert-orange)" strokeWidth="6" strokeDasharray="5 5"><animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.2s" repeatCount="indefinite"/></path>
            {/* 爆裂双链断裂 (DSB) */}
            <circle cx="200" cy="125" r="20" fill="rgba(239,68,68,0.5)">
              <animate attributeName="r" values="10;30;10" dur="1s" repeatCount="indefinite"/>
            </circle>
            <text x="200" y="200" fill="var(--alert-red)" fontSize="16" fontWeight="bold" textAnchor="middle">α 粒子 (Ac-225)：LET 极高，双链直接炸断！绝无修复可能！</text>
            <text x="200" y="220" fill="var(--text-muted)" fontSize="12" textAnchor="middle">射程极短 (几个细胞)，不伤及周边健康组织。</text>
          </g>
        ) : (
          <g>
            <circle cx="200" cy="20" r="4" fill="var(--life-green)"/>
            <text x="215" y="24" fill="var(--life-green)" fontSize="12" fontWeight="bold">e⁻</text>
            <path d="M 200 30 L 200 150" stroke="var(--life-green)" strokeWidth="2" strokeDasharray="5 5"><animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.2s" repeatCount="indefinite"/></path>
            {/* 单链断裂 (SSB) */}
            <circle cx="200" cy="100" r="10" fill="rgba(16,185,129,0.5)">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1s" repeatCount="indefinite"/>
            </circle>
            <text x="200" y="200" fill="var(--life-green)" fontSize="16" fontWeight="bold" textAnchor="middle">β 粒子 (Lu-177)：LET 较低，仅造成单链断裂。</text>
            <text x="200" y="220" fill="var(--text-muted)" fontSize="12" textAnchor="middle">癌细胞存在修复概率，但射程长，适合大体积肿瘤。</text>
          </g>
        )}
      </svg>
    );
  };

  // ==========================================
  // AI 处理逻辑
  // ==========================================
  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton && (e.key !== 'Enter' || e.nativeEvent.isComposing)) return;
    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在检索 f区核医学与材料学前沿文献...' }]);

    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, 'f区元素与核医学材料学前沿');
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply };
        return newHistory;
      });
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 算力节点连接异常，请重试。' };
        return newHistory;
      });
    }
  };

  useEffect(() => { 
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
  }, [chatHistory, isChatOpen]);

  return (
    <div className="fblock-wrapper">
      <style>{`
        .fblock-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(15, 23, 42, 0.75); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --sz-gold: #fbbf24; --pink-glow: #ec4899; background: var(--bg-dark); color: #f8fafc; font-family: 'Segoe UI', sans-serif; line-height: 1.6; overflow-x: hidden; }
        
        .fblock-wrapper h1, .fblock-wrapper h2, .fblock-wrapper h3 { color: var(--purple-med); margin-top: 0; }
        .fblock-wrapper h2 { border-left: 5px solid var(--cyan-glow); padding-left: 10px; margin: 30px 0 20px 0; font-size: 1.5rem; color: #fff; }
        .fblock-wrapper section { padding: 40px 5%; border-bottom: 1px solid rgba(255,255,255,0.05); }
        
        .fblock-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .fblock-wrapper .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .fblock-wrapper .panel { background: var(--bg-panel); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .fblock-wrapper .svg-box { border: 2px dashed var(--purple-med); border-radius: 12px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; min-height: 280px; display: flex; flex-direction: column; justify-content: center; }
        
        .fblock-wrapper .btn { background: linear-gradient(135deg, var(--cyan-glow), var(--purple-med)); border: none; padding: 10px 20px; color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; width: 100%; margin-top: 10px; }
        .fblock-wrapper .btn:hover:not(:disabled) { box-shadow: 0 4px 15px rgba(6, 182, 212, 0.5); transform: translateY(-2px); }
        .fblock-wrapper .btn-outline { background: transparent; border: 1px solid var(--purple-med); color: var(--purple-med); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; font-size: 13px; margin-right: 8px; }
        .fblock-wrapper .btn-outline:hover, .fblock-wrapper .btn-outline.active { background: rgba(139, 92, 246, 0.2); border-color: var(--purple-med); color: #fff; }
        
        .fblock-wrapper .quiz-card { background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px; border-left: 4px solid var(--life-green); margin-bottom: 15px; }
        .fblock-wrapper .quiz-opt { background: transparent; border: 1px solid var(--cyan-glow); color: var(--text-muted); padding: 10px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; display: block; width: 100%; text-align: left; margin-bottom: 8px; font-size: 14px; }
        .fblock-wrapper .quiz-opt:hover { background: rgba(6, 182, 212, 0.2); color: #fff; }
        
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        .markdown-prose strong { color: var(--cyan-glow); }
        .markdown-prose sub, .markdown-prose sup { font-size: 0.8em; }
        
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        .hero-orb { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* Hero Banner */}
      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', paddingTop: '60px', paddingBottom: '40px' }}>
        <svg width="200" height="150" viewBox="0 0 200 150" className="hero-orb" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 20px var(--purple-med))' }}>
          {/* 模拟 f 轨道复杂的形状 */}
          <path d="M 100 75 Q 120 10 100 0 Q 80 10 100 75" fill="rgba(139,92,246,0.5)"/>
          <path d="M 100 75 Q 120 140 100 150 Q 80 140 100 75" fill="rgba(139,92,246,0.5)"/>
          <path d="M 100 75 Q 190 55 200 75 Q 190 95 100 75" fill="rgba(6,182,212,0.5)"/>
          <path d="M 100 75 Q 10 55 0 75 Q 10 95 100 75" fill="rgba(6,182,212,0.5)"/>
          <circle cx="100" cy="75" r="8" fill="#fff"/>
        </svg>
        <h1 style={{ fontSize: '3rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '20px 0' }}>f 区元素：内过渡金属与核医学奇迹</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto' }}>“深埋于原子的 4f 与 5f 轨道，赋予了它们发光、磁性与毁灭性的放射能量。它们是元素周期表最底层的隐秘王者。”</p>
      </section>

      {/* Module 1: 理论基石 */}
      <section>
        <h2>模块一：f 区核心理论通性</h2>
        <div className="grid-3">
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>🛡️ 电子构型与屏蔽效应</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>价电子构型为 (n-2)f<sup>1-14</sup>(n-1)d<sup>0-1</sup>ns<sup>2</sup>。4f 轨道深埋在 5s 和 5p 内部，受到强烈的屏蔽保护，因此镧系元素的化学性质极为相似。最稳定的氧化态是 <strong>+3 价</strong>。</p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--pink-glow)' }}>🧲 f-f 跃迁与强磁性</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>未成对的 f 电子极多（如 Gd<sup>3+</sup> 有 7 个未成对电子），产生极强的顺磁矩。f-f 跃迁虽然是禁阻跃迁，但因受配位场影响极小，发光光谱表现为<strong>极其锐利的线状谱</strong>，色彩极纯。</p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--alert-orange)' }}>☢️ 锕系放射性</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>5f 电子比 4f 更靠近外部，锕系元素表现出更多的可变氧化态（如 U 最高可达 +7）。更重要的是，所有锕系元素都具有放射性，是核反应堆与核医学的核心。</p>
          </div>
        </div>
      </section>

      {/* Module 2: 镧系收缩 */}
      <section>
        <h2>模块二：物理化学 —— 镧系收缩 (Lanthanide Contraction)</h2>
        <div className="grid-2">
          <div className="panel">
            <h3>为什么第二、三过渡系性质如此相似？</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              从 La (Z=57) 到 Lu (Z=71)，新增的电子填充在深层的 4f 轨道。由于 f 轨道的空间形状分散，<strong>屏蔽效应极差</strong>。<br/><br/>
              核电荷数的增加导致有效核电荷 (Z<sub>eff</sub>) 剧增，对外层电子的吸引力越来越强，导致<strong>原子/离子半径随原子序数增加而显著缩小</strong>。<br/><br/>
              这直接导致了位于镧系之后的第三过渡系元素（如 Hf、Ta）的半径与第二过渡系（如 Zr、Nb）几乎相同，极难分离！
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: 'var(--cyan-glow)', fontWeight: 'bold' }}>调节原子序数 (Z): {atomicZ}</label>
              <input type="range" min="57" max="71" value={atomicZ} onChange={e => setAtomicZ(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--cyan-glow)', marginTop: '10px' }}/>
            </div>
          </div>
          <div className="svg-box">{renderContractionSVG()}</div>
        </div>
      </section>

      {/* Module 3 & 4: MRI 造影与配体毒性 */}
      <section>
        <h2>模块三/四：影像医学 —— Gd³⁺ MRI 造影与配体锁死技术</h2>
        <div className="grid-2">
          <div className="svg-box">{renderLigandSVG()}</div>
          <div className="panel">
            <h3>七个电子的磁力与游离的致命剧毒</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              钆离子 (Gd<sup>3+</sup>) 的排布为 [Xe]4f<sup>7</sup>，拥有最多的 7 个未成对电子，是最强的顺磁性物质，能极大地缩短水质子的 T1 弛豫时间，是绝佳的 MRI 造影剂。<br/><br/>
              <strong style={{ color: 'var(--alert-red)' }}>致命缺陷：</strong>游离的 Gd<sup>3+</sup> 体内剧毒，会竞争性取代 Ca<sup>2+</sup>，引发无法治愈的<strong>肾源性系统纤维化 (NSF)</strong>。<br/><br/>
              <strong style={{ color: 'var(--life-green)' }}>化学配体的拯救：</strong>必须通过配位化学设计笼子。早期使用的<strong>线性配体 (DTPA)</strong> 容易在体内发生置换解离；现代采用的<strong>大环配体 (DOTA)</strong> 实现了完美的三维空间包裹，动力学极度惰性，造就了绝对安全！
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className={`btn-outline ${gdLigand === 'linear' ? 'active' : ''}`} style={{ borderColor: 'var(--alert-orange)', color: gdLigand==='linear'?'#fff':'var(--alert-orange)' }} onClick={() => {setGdLigand('linear'); setMriField(false);}}>选择线性配体 (DTPA)</button>
              <button className={`btn-outline ${gdLigand === 'macrocyclic' ? 'active' : ''}`} style={{ borderColor: 'var(--life-green)', color: gdLigand==='macrocyclic'?'#fff':'var(--life-green)' }} onClick={() => {setGdLigand('macrocyclic'); setMriField(false);}}>选择大环配体 (DOTA)</button>
            </div>
            <button className="btn" style={{ background: 'var(--alert-red)' }} onClick={() => setMriField(true)}>
              💉 注入体内并施加生理代谢环境
            </button>
          </div>
        </div>
      </section>

      {/* Module 5: 上转换发光 (UCNPs) */}
      <section>
        <h2>模块五：光子材料学 —— 上转换纳米发光 (UCNPs)</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--sz-gold)' }}>“逆天”的光学魔法：反斯托克斯发光</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              传统的荧光是吸收高能紫外光，发射低能可见光。但紫外光不仅伤细胞，且穿透力极差。<br/><br/>
              将镧系元素 Yb<sup>3+</sup> 和 Er<sup>3+</sup> 共掺杂在氟化物晶体中，奇迹发生了：Yb<sup>3+</sup> 就像“天线”，吸收穿透力极深、无伤害的<strong>低能近红外光 (980nm)</strong>。<br/>
              它连续吸收两个光子，通过<strong>能量共振转移 (ETU)</strong> 传给 Er<sup>3+</sup>，Er<sup>3+</sup> 跃迁后发射出明亮的<strong>高能绿光 (540nm)</strong>！<br/><br/>
              这使得人类首次实现了在深层动物活体内部，进行无背景噪点的极致清晰成像。
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: 'var(--alert-red)', fontWeight: 'bold' }}>调节 980nm NIR 激发激光：{nirLaser} %</label>
              <input type="range" min="0" max="100" value={nirLaser} onChange={e => setNirLaser(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--alert-red)', marginTop: '10px' }}/>
            </div>
          </div>
          <div className="svg-box">{renderUCNPSVG()}</div>
        </div>
      </section>

      {/* Module 6: 靶向阿尔法疗法 (TAT) */}
      <section>
        <h2>模块六：核医学核武 —— 靶向 α 粒子疗法 (TAT)</h2>
        <div className="grid-2">
          <div className="svg-box">{renderTATSVG()}</div>
          <div className="panel">
            <h3 style={{ color: 'var(--alert-orange)' }}>Ac-225：炸碎癌细胞 DNA 双链的重锤</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              锕系元素锕-225 (Ac-225) 衰变时会释放高能的 <strong>α 粒子 (氦核)</strong>。<br/><br/>
              相比于传统的 β 粒子 (如 Lu-177释放的高速电子)，α 粒子的质量极大，拥有极高的<strong>线性能量传递 (LET)</strong>。它能将巨大的能量瞬间倾泻在短短几十微米 (几个细胞) 的射程内。<br/><br/>
              <strong>物理机制决定生死：</strong>β 粒子通常只造成 DNA 单链断裂，癌细胞有机会修复；而 α 粒子宛如重型炮弹，直接造成 <strong>DNA 双链断裂 (DSB)</strong>，一击毙命，绝无耐药性与修复可能，且完全不伤及远处的健康细胞！
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className={`btn-outline ${radiationType === 'beta' ? 'active' : ''}`} onClick={() => setRadiationType('beta')}>选择 β 发射体 (Lu-177)</button>
              <button className={`btn-outline ${radiationType === 'alpha' ? 'active' : ''}`} style={{ borderColor: 'var(--alert-orange)', color: radiationType==='alpha'?'#fff':'var(--alert-orange)' }} onClick={() => setRadiationType('alpha')}>选择 α 发射体 (Ac-225)</button>
            </div>
          </div>
        </div>
      </section>

      {/* Module 7 & 8: 诊疗一体化与肾脏医学 */}
      <section>
        <h2>模块七/八：交叉医学 —— 诊疗一体化与消化道降磷</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--purple-med)' }}>Module 7: 诊疗一体化 (Theranostics)</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              这是一种“所见即所治”的科幻级理念。利用具有相似配位化学性质的镧系/锕系同位素对：<br/>
              先注射<strong>诊断核素 (如 Ga-68)</strong>，连接 PSMA 配体靶向前列腺癌，PET 扫描确认全身病灶；<br/>
              确认后，立刻换成相同配体的<strong>治疗核素 (如 Lu-177 甚至 Ac-225)</strong>，由于化学结构几乎一样，它会精准飞向刚才扫描到的每一个病灶进行定点摧毁！
            </p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>Module 8: 碳酸镧 (Lanthanum Carbonate)</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              不仅是放射性，稳定的镧系元素也有大用处。慢性肾病患者无法排泄磷，导致致命的高磷血症。<br/><br/>
              口服<strong>碳酸镧 [La₂(CO₃)₃]</strong> 后，它在极酸性的胃液中解离出自由的 La³⁺。La³⁺ 对食物中的磷酸根 (PO₄³⁻) 具有极高的亲和力，形成极难溶的 LaPO₄ 沉淀，随着粪便排出体外，完美解决了肾病学难题。
            </p>
            <button className="btn" onClick={() => setPo4Level(Math.max(0, po4Level - 20))}>
              💊 吞服碳酸镧 (当前肠道血磷吸收入血率: {po4Level}%)
            </button>
          </div>
        </div>
      </section>

      {/* Module 9: 锕系元素生产 */}
      <section>
        <h2>模块九：高能物理 —— 医用同位素的“炼金术”</h2>
        <div className="panel" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--sz-gold)' }}>如何获得珍贵的 Ac-225？</h3>
          <p style={{ fontSize: '14px', color: '#cbd5e1', maxWidth: '800px', margin: '0 auto' }}>
            自然界几乎没有 Ac-225。我们需要利用回旋加速器，加速高能质子 (p) 去轰击镭-226 (Ra-226) 靶材。<br/>
            核反应方程式：<strong><sup>226</sup>Ra (p, 2n) <sup>225</sup>Ac</strong><br/><br/>
            这是一个将炼金术化为现实的过程：质子击碎原子核，打飞两个中子，硬生生将镭变成了救命的锕！
          </p>
        </div>
      </section>

      {/* Module 10: 思维道场 (Ultimate Quiz) */}
      <section>
        <h3 style={{ color: 'var(--life-green)' }}>⚔️ Module 10: f 区终极道场</h3>
        <div className="grid-2">
          <div className="quiz-card">
            <p style={{ fontWeight: 'bold', color: '#fff' }}>1. 镧系收缩导致了周期表中哪一现象？</p>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q1: 'wrong'})}>A. 第一过渡系元素极其活泼</button>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q1: 'correct'})}>B. 锆 (Zr) 与 铪 (Hf) 半径几乎相同，极难分离</button>
            {quizState.q1 && <p style={{ color: quizState.q1 === 'correct' ? 'var(--life-green)' : 'var(--alert-red)' }}>{quizState.q1 === 'correct' ? '正确！镧系收缩抹平了周期增加带来的半径增大。' : '错误。请回顾镧系收缩对后续元素的影响。'}</p>}
          </div>
          <div className="quiz-card">
            <p style={{ fontWeight: 'bold', color: '#fff' }}>2. 相较于 β 粒子，α 粒子 (如 Ac-225) 治疗肿瘤的绝对优势是？</p>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q2: 'wrong'})}>A. 穿透力极强，能照射全身</button>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q2: 'correct'})}>B. 射程极短且线性能量传递 (LET) 高，直接造成 DNA 双链断裂</button>
            {quizState.q2 && <p style={{ color: quizState.q2 === 'correct' ? 'var(--life-green)' : 'var(--alert-red)' }}>{quizState.q2 === 'correct' ? '正确！α 疗法被称为“单细胞杀手”，是未来核医学的终极武器。' : '错误。α 粒子穿透力很弱，一张纸就能挡住，但杀伤力极大。'}</p>}
          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--cyan-glow), var(--purple-med))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', cursor: 'pointer', zIndex: 100 }}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block', position: 'fixed', bottom: '100px', right: '30px', width: '350px', background: 'var(--bg-dark)', border: '1px solid var(--purple-med)', borderRadius: '12px', padding: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '15px' }}>f区化学与核医学 AI 导师</h3>
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
            <input type="text" placeholder="输入关于 f 区核医学的问题..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#1e293b', color: '#fff', outline: 'none' }} />
            <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'var(--purple-med)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span></button>
          </div>
        </div>
      )}
    </div>
  );
}