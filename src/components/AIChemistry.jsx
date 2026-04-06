import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function ResearchFrontier() {
  // ==========================================
  // 1. 状态管理区 (严格排查，确保无无用变量)
  // ==========================================

  // 模块一：量子电池 (Light: Science & Applications 2026)
  const [qbUnits, setQbUnits] = useState(10); 
  const [coupling, setCoupling] = useState(50); 
  
  // 模块二：铝氧化还原催化 (Nature 2026)
  const [catStep, setCatStep] = useState('Al-I'); // 'Al-I', 'Ox-Add', 'Insert', 'Red-Elim'
  const [ligandAngle, setLigandAngle] = useState(105);

  // 通用状态
  const [quizState, setQuizState] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '您好！我是前沿科学导师。我正在解析 2026 年最新的研究进展：微腔量子电池的超线性功率输出，以及铝基主族元素的氧化还原催化。' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 2. 逻辑计算
  // ==========================================
  
  // 量子电池功率缩放比例 (P ∝ N^k)
  const powerFactor = useMemo(() => 1 + (coupling / 100) * 0.5, [coupling]);
  const qbPower = useMemo(() => Math.pow(qbUnits, powerFactor).toFixed(2), [qbUnits, powerFactor]);

  // ==========================================
  // 3. SVG 渲染器
  // ==========================================

  // M1: 量子电池实验
  const renderQBSVG = () => {
    const isSuper = coupling > 75;
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <rect x="20" y="40" width="360" height="120" fill="rgba(15,23,42,0.6)" stroke="var(--cyan-glow)" strokeWidth="2" rx="10"/>
        
        {/* 谐振腔光子场 */}
        <g opacity={coupling / 100}>
          <path d="M 40 100 Q 200 10 360 100" fill="none" stroke="var(--sz-gold)" strokeWidth="2" strokeDasharray="5 5">
            <animate attributeName="stroke-dashoffset" from="15" to="0" dur="0.3s" repeatCount="indefinite"/>
          </path>
        </g>

        {/* 量子单元阵列 */}
        {Array.from({ length: Math.min(qbUnits, 12) }).map((_, i) => {
          const x = 60 + (i % 6) * 55;
          const y = i < 6 ? 85 : 125;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill={isSuper ? "var(--alert-red)" : "var(--primary-blue)"}>
                {isSuper && <animate attributeName="r" values="8;11;8" dur="0.5s" repeatCount="indefinite" />}
              </circle>
              {isSuper && <circle cx={x} cy={y} r="15" fill="none" stroke="var(--alert-red)" strokeWidth="1" opacity="0.3">
                <animate attributeName="r" values="8;20" dur="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0" dur="0.8s" repeatCount="indefinite" />
              </circle>}
            </g>
          );
        })}

        {/* 功率输出仪表 */}
        <rect x="50" y="200" width="300" height="15" fill="#1e293b" rx="5"/>
        <rect x="50" y="200" width={Math.min(300, (parseFloat(qbPower)/100) * 300)} height="15" fill="var(--cyan-glow)" rx="5" style={{ transition: 'width 0.3s' }}/>
        <text x="200" y="240" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">
          输出功率: {qbPower} 单元 (超线性增益: {isSuper ? "显著" : "微弱"})
        </text>
      </svg>
    );
  };

  // M2: 铝催化循环
  const renderAlCycleSVG = () => {
    return (
      <svg width="100%" height="280" viewBox="0 0 400 280">
        <circle cx="200" cy="140" r="90" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="5 5"/>
        
        {/* 中心铝原子 */}
        <g transform="translate(200, 140)">
          {/* 配体夹角 */}
          <path d="M -45 -25 L 0 0 L 45 -25" fill="none" stroke="var(--purple-med)" strokeWidth="6" style={{ transform: `rotate(${ligandAngle - 105}deg)`, transition: 'all 0.5s' }}/>
          <circle cx="0" cy="0" r="22" fill="var(--sz-gold)"/>
          <text x="0" y="5" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">Al</text>
          <text x="0" y="45" fill="var(--sz-gold)" fontSize="11" fontWeight="bold" textAnchor="middle">
            {catStep === 'Al-I' ? "状态: Al(I) 亲核性" : "状态: Al(III) 路易斯酸"}
          </text>
        </g>

        {/* 步骤高亮 */}
        <g fontSize="11" fontWeight="bold">
          <text x="200" y="30" fill={catStep==='Al-I'?'var(--cyan-glow)':'#475569'} textAnchor="middle">1. 活性种 Al(I) 生成</text>
          <text x="320" y="145" fill={catStep==='Ox-Add'?'var(--cyan-glow)':'#475569'}>2. 氧化加成</text>
          <text x="200" y="260" fill={catStep==='Insert'?'var(--cyan-glow)':'#475569'} textAnchor="middle">3. 炔烃环三聚插入</text>
          <text x="20" y="145" fill={catStep==='Red-Elim'?'var(--cyan-glow)':'#475569'}>4. 还原消除</text>
        </g>

        {/* 产物动画 */}
        {catStep === 'Red-Elim' && (
          <g transform="translate(80, 80)">
             <polygon points="15,0 7,13 -7,13 -15,0 -7,-13 7,-13" fill="rgba(16,185,129,0.3)" stroke="var(--life-green)" strokeWidth="2">
               <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze"/>
             </polygon>
             <text x="0" y="35" fill="var(--life-green)" fontSize="10" textAnchor="middle">苯衍生物生成</text>
          </g>
        )}
      </svg>
    );
  };

  // AI 处理
  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton && (e.key !== 'Enter' || e.nativeEvent.isComposing)) return;
    const userText = chatInput.trim();
    if (!userText) return;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在调取算力集群，深度解析 2026 前沿文献...' }]);
    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, '2026量子电池与铝催化前沿');
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply };
        return newHistory;
      });
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 神经中枢繁忙，请稍后再试。' };
        return newHistory;
      });
    }
  };

  useEffect(() => { 
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
  }, [chatHistory, isChatOpen]);

  return (
    <div className="frontier-wrapper">
      <style>{`
        .frontier-wrapper { --bg-dark: #020617; --bg-panel: rgba(15, 23, 42, 0.8); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --sz-gold: #fbbf24; background: var(--bg-dark); color: #f8fafc; font-family: 'Segoe UI', sans-serif; line-height: 1.6; overflow-x: hidden; }
        .frontier-wrapper h1, .frontier-wrapper h2, .frontier-wrapper h3 { color: var(--cyan-glow); margin-top: 0; }
        .frontier-wrapper h2 { border-left: 5px solid var(--sz-gold); padding-left: 10px; margin: 30px 0 20px 0; font-size: 1.5rem; color: #fff;}
        .frontier-wrapper section { padding: 40px 5%; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .frontier-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
        .frontier-wrapper .panel { background: var(--bg-panel); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
        .frontier-wrapper .svg-box { border: 1px solid #334155; border-radius: 12px; background: radial-gradient(circle, rgba(15,23,42,0.9), rgba(2,6,23,1)); padding: 20px; min-height: 300px; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
        .frontier-wrapper .btn { background: linear-gradient(135deg, var(--cyan-glow), var(--primary-blue)); border: none; padding: 10px 20px; color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; width: 100%; margin-top: 10px; }
        .frontier-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; font-size: 13px; margin: 4px; }
        .frontier-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); color: #fff; }
        .frontier-wrapper input[type="range"] { width: 100%; accent-color: var(--cyan-glow); margin: 10px 0; }
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        .markdown-prose strong { color: var(--sz-gold); }
      `}</style>

      {/* Hero Banner */}
      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', paddingTop: '60px', paddingBottom: '40px' }}>
        <h1 style={{ fontSize: '2.8rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--sz-gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '20px 0' }}>2026 化学科研前沿：能量与催化的范式转移</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto' }}>“从量子激子的相干协作，到主族元素的电子转移。我们正在见证经典化学教科书被重新书写。”</p>
      </section>

      {/* 模块一：量子电池 */}
      <section>
        <h2>模块一：量子能源 —— 超线性功率量子电池 (Superextensivity)</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>核心原理：Dicke 集体增强效应</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              传统的化学电池，功率随体积线性增加 (P ∝ N)。<br/><br/>
              2026 年 <sup>Light: Science & Applications</sup> 的研究证明，在微腔中通过<strong>强耦合 (Strong Coupling)</strong> 产生的激子极化激元，可以实现量子相干。这使得电池的输出电功率表现出<strong>超线性缩放 (Superextensive Scaling)</strong>，即功率增长速度远超单元数量的叠加。
            </p>
            <div style={{ marginTop: '20px' }}>
              <label>1. 设置量子单元数量 (N): {qbUnits}</label>
              <input type="range" min="1" max="50" value={qbUnits} onChange={e => setQbUnits(parseInt(e.target.value))} />
              <label>2. 调节光-物耦合强度 (g): {coupling}%</label>
              <input type="range" min="0" max="100" value={coupling} onChange={e => setCoupling(parseInt(e.target.value))} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
              论文创新：首次实现了稳态条件下的超线性功率输出，突破了量子效应仅能存在于极短时间的限制。
            </p>
          </div>
          <div className="svg-box">{renderQBSVG()}</div>
        </div>
      </section>

      {/* 模块二：铝催化 */}
      <section>
        <h2>模块二：主族催化 —— 铝的氧化还原革命 (Aluminium Redox)</h2>
        <div className="grid-2">
          <div className="svg-box">{renderAlCycleSVG()}</div>
          <div className="panel">
            <h3 style={{ color: 'var(--purple-med)' }}>核心原理：打破“路易斯酸”定式</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              铝在地壳中含量极丰，但因其极低的电负性，通常仅作为 +III 价的路易斯酸催化剂。<br/><br/>
              2026 年 <sup>Nature</sup> 报道利用<strong>咔唑基配体</strong>稳定了低价 <strong>Al(I)</strong>，使其首次展现出原本专属于贵金属（如 Pd, Pt）的<strong>氧化加成-还原消除</strong>循环能力，成功实现了炔烃的 Reppe 环三聚反应。
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '15px' }}>
              <button className={`btn-outline ${catStep==='Al-I'?'active':''}`} onClick={()=>setCatStep('Al-I')}>1. 活性种生成</button>
              <button className={`btn-outline ${catStep==='Ox-Add'?'active':''}`} onClick={()=>setCatStep('Ox-Add')}>2. 氧化加成</button>
              <button className={`btn-outline ${catStep==='Insert'?'active':''}`} onClick={()=>setCatStep('Insert')}>3. 炔烃插入</button>
              <button className={`btn-outline ${catStep==='Red-Elim'?'active':''}`} onClick={()=>setCatStep('Red-Elim')}>4. 还原消除</button>
            </div>
            <div style={{ marginTop: '15px' }}>
              <label>配体几何扭曲角度调制: {ligandAngle}°</label>
              <input type="range" min="90" max="120" value={ligandAngle} onChange={e => setLigandAngle(parseInt(e.target.value))} />
            </div>
          </div>
        </div>
      </section>

      {/* 测验区 */}
      <section>
        <h3 style={{ color: 'var(--life-green)' }}>⚔️ 前沿科学思维挑战</h3>
        <div className="grid-2">
          <div className="quiz-card" style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--sz-gold)' }}>
            <p style={{ fontWeight: 'bold' }}>1. 为什么铝基催化循环的实现被称为“范式转移”？</p>
            <button className="btn-outline" style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => setQuizState({...quizState, q1: 'wrong'})}>A. 铝比铂便宜</button>
            <button className="btn-outline" style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => setQuizState({...quizState, q1: 'correct'})}>B. 它证明了主族元素可以模拟过渡金属进行双电子氧化还原过程</button>
            {quizState.q1 && <p style={{ color: quizState.q1 === 'correct' ? 'var(--life-green)' : 'var(--alert-red)', fontSize: '13px', marginTop: '10px' }}>{quizState.q1 === 'correct' ? '正确！这挑战了传统无机化学对主族金属价态稳定性的认知。' : '错误。成本只是应用价值，核心是电子转移机制的突破。'}</p>}
          </div>
          <div className="quiz-card" style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--sz-gold)' }}>
            <p style={{ fontWeight: 'bold' }}>2. 在量子电池中，提高耦合强度 (g) 的主要目的是？</p>
            <button className="btn-outline" style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => setQuizState({...quizState, q2: 'correct'})}>A. 诱导量子相干，实现功率的非线性叠加</button>
            <button className="btn-outline" style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => setQuizState({...quizState, q2: 'wrong'})}>B. 增加电池的物理密封性</button>
            {quizState.q2 && <p style={{ color: quizState.q2 === 'correct' ? 'var(--life-green)' : 'var(--alert-red)', fontSize: '13px', marginTop: '10px' }}>{quizState.q2 === 'correct' ? '正确！强耦合是产生 Dicke 超辐射式快速放电的前提。' : '错误。耦合是指光子场与电子态的量子纠缠，而非机械密封。'}</p>}
          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--cyan-glow), var(--purple-med))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', cursor: 'pointer', zIndex: 100, boxShadow: '0 0 20px rgba(6,182,212,0.5)' }}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block', position: 'fixed', bottom: '100px', right: '30px', width: '350px', background: 'var(--bg-dark)', border: '1px solid var(--purple-med)', borderRadius: '12px', padding: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '15px' }}>2026 前沿导师</h3>
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
            <input type="text" placeholder="探讨最新的 2026 文献..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#1e293b', color: '#fff', outline: 'none' }} />
            <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'var(--primary-blue)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span></button>
          </div>
        </div>
      )}
    </div>
  );
}