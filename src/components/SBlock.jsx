import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function SBlock() {
  // ==========================================
  // 状态管理区
  // ==========================================

  // Lab 1: 钠钾泵 (Na/K Pump)
  const [pumpState, setPumpState] = useState('resting'); 
  const [potential, setPotential] = useState(-70);

  // Lab 2: 钡餐安全实验 (Barium Meal)
  const [baCompound, setBaCompound] = useState('none'); 
  const stomachPH = 1.5; 

  // 测验与 AI
  const [quizState, setQuizState] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是 s区元素 AI 导师。碱金属和碱土金属不仅是活泼的化学元素，更是维系生命的“生命金属”。\n\n关于“焰色反应机制”、“钠钾泵热力学”或“碳酸锂抗躁狂机理”，随时向我提问！' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 交互逻辑与动画函数
  // ==========================================

  // 钠钾泵触发机制
  const triggerPump = () => {
    setPumpState('pumping');
    setTimeout(() => {
      setPotential(-90); 
      setPumpState('action');
      setTimeout(() => {
        setPotential(30); 
        setTimeout(() => {
          setPotential(-70); 
          setPumpState('resting');
        }, 1500);
      }, 1000);
    }, 1500);
  };

  // 缓存生成钡餐粒子，避免 React 渲染引发动画闪烁与内存泄露
  const baParticles = useMemo(() => Array.from({ length: 30 }).map(() => ({
    x: 100 + Math.random() * 200, y: 140 + Math.random() * 40,
    vx: (Math.random() - 0.5) * 20, vy: -50 - Math.random() * 100
  })), []);

  const renderPumpSVG = () => {
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <rect x="0" y="100" width="400" height="50" fill="rgba(51,65,85,0.5)" stroke="#475569" strokeWidth="2"/>
        <text x="20" y="80" fill="var(--text-muted)" fontSize="14">细胞外液 (高 Na⁺)</text>
        <text x="20" y="180" fill="var(--text-muted)" fontSize="14">细胞内液 (高 K⁺)</text>

        <path d="M 170 90 L 230 90 L 210 160 L 190 160 Z" fill="var(--purple-med)" opacity="0.8"/>
        <text x="200" y="130" fill="#fff" fontSize="12" textAnchor="middle" fontWeight="bold">ATPase</text>

        {pumpState === 'pumping' && (
          <g>
            <circle cx="160" cy="170" r="10" fill="var(--sz-gold)">
              <animate attributeName="opacity" values="1;0" dur="1.5s" fill="freeze"/>
            </circle>
            <text x="160" y="174" fill="#fff" fontSize="8" textAnchor="middle">ATP</text>
          </g>
        )}

        <g>
          {[0, 1, 2].map(i => (
            <circle key={`na_${i}`} cx={185 + i*15} cy={pumpState==='resting'?170:70} r="6" fill="var(--alert-orange)">
              {pumpState === 'pumping' && <animate attributeName="cy" values="170; 70" dur="1.5s" fill="freeze"/>}
            </circle>
          ))}
        </g>
        
        <g>
          {[0, 1].map(i => (
            <circle key={`k_${i}`} cx={260 + i*15} cy={pumpState==='resting'?70:170} r="6" fill="var(--life-green)">
              {pumpState === 'pumping' && <animate attributeName="cy" values="70; 170" dur="1.5s" fill="freeze"/>}
            </circle>
          ))}
        </g>
        
        {pumpState === 'action' && (
          <path d="M 300 130 L 320 130 L 330 60 L 340 160 L 360 130 L 380 130" fill="none" stroke="var(--cyan-glow)" strokeWidth="2">
            <animate attributeName="stroke-dasharray" values="0 100; 100 0" dur="1s"/>
          </path>
        )}
      </svg>
    );
  };

  const renderBaMealSVG = () => {
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <path d="M 120 50 C 100 100, 100 200, 200 200 C 300 200, 320 150, 280 100 C 240 50, 180 30, 120 50" fill="rgba(239,68,68,0.1)" stroke="var(--alert-red)" strokeWidth="3"/>
        <text x="200" y="220" fill="var(--alert-red)" fontSize="14" textAnchor="middle" fontWeight="bold">虚拟胃环境 (pH = {stomachPH})</text>

        {baCompound === 'baso4' && (
          <g>
            <rect x="150" y="170" width="100" height="20" fill="#f8fafc" rx="5"/>
            <text x="200" y="185" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">BaSO₄ 沉淀</text>
            <text x="200" y="100" fill="var(--life-green)" fontSize="16" fontWeight="bold" textAnchor="middle">Ksp 极小，不溶于酸，安全！</text>
          </g>
        )}

        {baCompound === 'baco3' && (
          <g>
            {baParticles.map((p, i) => (
              <g key={`ba_${i}`}>
                <circle cx={p.x} cy={p.y} r="3" fill="#fde047">
                  <animate attributeName="cy" values={`${p.y}; ${p.y + p.vy}`} dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="cx" values={`${p.x}; ${p.x + p.vx}`} dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite"/>
                </circle>
                {i % 3 === 0 && <circle cx={p.x} cy={p.y} r="2" fill="#fff"><animate attributeName="cy" values={`${p.y}; 50`} dur={`${1+Math.random()}s`} repeatCount="indefinite"/></circle>}
              </g>
            ))}
            <text x="200" y="120" fill="var(--sz-gold)" fontSize="14" fontWeight="bold" textAnchor="middle">BaCO₃ + 2H⁺ → Ba²⁺(毒!) + H₂O + CO₂↑</text>
            <rect x="0" y="0" width="400" height="250" fill="var(--alert-red)" opacity="0.2">
              <animate attributeName="opacity" values="0.2; 0.6; 0.2" dur="1s" repeatCount="indefinite"/>
            </rect>
            <text x="200" y="150" fill="var(--alert-red)" fontSize="20" fontWeight="bold" textAnchor="middle">剧毒警告！重金属离子入血</text>
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
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在检索 s区元素化学文献与药理数据库...' }]);

    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, 's区元素化学与生命医学前沿');
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply };
        return newHistory;
      });
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 连接大模型核心失败，请重试。' };
        return newHistory;
      });
    }
  };

  useEffect(() => { 
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
  }, [chatHistory, isChatOpen]);

  return (
    <div className="sblock-wrapper">
      <style>{`
        .sblock-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(15, 23, 42, 0.75); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --sz-gold: #fde047; background: var(--bg-dark); color: #f8fafc; font-family: 'Segoe UI', sans-serif; line-height: 1.6; overflow-x: hidden; }
        
        .sblock-wrapper h1, .sblock-wrapper h2, .sblock-wrapper h3 { color: var(--cyan-glow); margin-top: 0; }
        .sblock-wrapper h2 { border-left: 5px solid var(--primary-blue); padding-left: 10px; margin: 25px 0 15px 0; font-size: 1.4rem; }
        .sblock-wrapper section { padding: 30px 5%; border-bottom: 1px solid rgba(255,255,255,0.05); }
        
        .sblock-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .sblock-wrapper .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .sblock-wrapper .panel { background: var(--bg-panel); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .sblock-wrapper .svg-box { border: 2px dashed var(--primary-blue); border-radius: 12px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; min-height: 300px; display: flex; flex-direction: column; justify-content: center; }
        .sblock-wrapper .btn { background: linear-gradient(135deg, var(--primary-blue), var(--purple-med)); border: none; padding: 10px 20px; color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; margin-top: 10px; width: 100%; }
        .sblock-wrapper .btn:hover:not(:disabled) { box-shadow: 0 4px 15px rgba(59, 130, 246, 0.5); transform: translateY(-2px); }
        .sblock-wrapper .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .sblock-wrapper .btn-danger { background: linear-gradient(135deg, var(--alert-red), #991b1b); border: none; padding: 10px 20px; color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; margin-top: 10px; width: 100%; }
        .sblock-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; font-size: 13px; margin-right: 8px; }
        .sblock-wrapper .btn-outline:hover { background: rgba(6, 182, 212, 0.2); border-color: var(--cyan-glow); color: #fff; }
        
        .sblock-wrapper .quiz-card { background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px; border-left: 4px solid var(--sz-gold); margin-bottom: 15px; }
        
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        .markdown-prose strong { color: var(--cyan-glow); }
        
        @keyframes flicker {
          0% { opacity: 0.7; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>

      {/* Hero Banner */}
      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', paddingTop: '50px', paddingBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
          {/* 焰色反应展示 */}
          {[{c: '#ef4444', n: 'Li (紫红)'}, {c: '#fde047', n: 'Na (黄)'}, {c: '#c084fc', n: 'K (紫)'}, {c: '#10b981', n: 'Ba (黄绿)'}].map(f => (
            <div key={f.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '60px', borderRadius: '50% 50% 20% 20%', background: f.c, filter: `blur(4px) drop-shadow(0 0 10px ${f.c})`, animation: 'flicker 0.5s infinite alternate' }}></div>
              <span style={{ fontSize: '12px', marginTop: '5px', color: '#94a3b8' }}>{f.n}</span>
            </div>
          ))}
        </div>
        <h1 style={{ fontSize: '2.5rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--life-green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>s 区元素：生命金属与前沿医学</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>“从焰色反应的光辉，到神经元电位的跃动。活泼的 s 区金属，是生命的电火花。”</p>
      </section>

      {/* 知识图谱 */}
      <section>
        <h2>第一板块：s区元素核心通性</h2>
        <div className="grid-3">
          <div className="panel">
            <h3 style={{ color: 'var(--alert-orange)' }}>⚛️ 结构与电离能</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>价电子构型为 ns<sup>1</sup> (IA族) 和 ns<sup>2</sup> (IIA族)。原子半径大，第一电离能极低，极易失去电子成为 +1 或 +2 价阳离子，表现出<strong style={{ color: '#fff' }}>极强的还原性</strong>。</p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--alert-orange)' }}>🔥 焰色反应</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>电子吸收热能跃迁至高能级，跳回基态时释放出特定波长的可见光。这是量子力学能级量子化的宏观视觉体现，常用于碱金属的定性鉴别。</p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--alert-orange)' }}>⚗️ 奇特的氧化物</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>除常规氧化物外，Na 燃烧生成过氧化钠 (Na<sub>2</sub>O<sub>2</sub>，含 O<sub>2</sub><sup>2-</sup>)，K 燃烧生成超氧化钾 (KO<sub>2</sub>，含 O<sub>2</sub><sup>-</sup>)。它们极易与水和二氧化碳反应释放氧气，常用于潜艇供氧。</p>
          </div>
        </div>
      </section>

      {/* 虚拟实验 1：钠钾泵 */}
      <section>
        <h2>第二板块：生理学前沿 —— Na⁺/K⁺ 泵与动作电位</h2>
        <div className="grid-2">
          <div className="panel">
            <h3>跨膜的主动运输 (耗能)</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              细胞内外 Na⁺ 和 K⁺ 的浓度差是神经冲动（思考、运动）的物理基础。Na⁺/K⁺-ATPase 每消耗 1 分子 ATP，可逆浓度梯度将 <strong>3个 Na⁺ 泵出细胞，同时将 2个 K⁺ 泵入细胞</strong>。<br/><br/>
              这导致细胞外带正电，细胞内带负电，维持了约 <strong>-70mV</strong> 的静息膜电位。
            </p>
            <div style={{ marginTop: '20px', background: '#020617', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>实时膜电位计</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: potential > 0 ? 'var(--alert-red)' : 'var(--life-green)', transition: '0.3s' }}>
                {potential} mV
              </div>
            </div>
            <button className="btn" onClick={triggerPump} disabled={pumpState !== 'resting'}>
              {pumpState === 'resting' ? '⚡ 消耗 ATP 激发钠钾泵' : '运转中...'}
            </button>
          </div>
          <div className="svg-box">{renderPumpSVG()}</div>
        </div>
      </section>

      {/* 虚拟实验 2：钡餐 */}
      <section>
        <h2>第三板块：影像药理学 —— 生死“钡餐” (沉淀溶解平衡)</h2>
        <div className="grid-2">
          <div className="svg-box">{renderBaMealSVG()}</div>
          <div className="panel">
            <h3>X光造影剂的致命选择</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              钡 (Ba) 元素的原子序数大，对 X 射线阻挡能力强，是理想的胃肠道造影剂。然而，游离的 <strong>Ba²⁺ 属于剧毒重金属离子</strong>，会导致肌肉痉挛和心律失常。<br/><br/>
              <strong>化学原理的救赎：</strong><br/>
              BaSO<sub>4</sub> 的 K<sub>sp</sub> 极小 (1.1 × 10<sup>-10</sup>)，且不与强酸反应，在胃酸中极度安全。<br/>
              BaCO<sub>3</sub> 虽然也难溶，但它是弱酸盐。在胃酸 (HCl) 中会发生：<br/>
              <span style={{ color: 'var(--alert-orange)', fontFamily: 'monospace' }}>BaCO₃ + 2H⁺ ⇌ Ba²⁺ + H₂O + CO₂↑</span><br/>
              平衡右移，释放剧毒 Ba²⁺！
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn" style={{ background: 'var(--life-green)' }} onClick={() => setBaCompound('baso4')}>服入 硫酸钡 (BaSO₄)</button>
              <button className="btn-danger" onClick={() => setBaCompound('baco3')}>误服 碳酸钡 (BaCO₃)</button>
            </div>
            <button className="btn-outline" style={{ marginTop: '10px', width: '100%' }} onClick={() => setBaCompound('none')}>清空胃部</button>
          </div>
        </div>
      </section>

      {/* 精神病学前沿：锂盐 */}
      <section>
        <h2>第四板块：精神药理前沿 —— 锂 (Li⁺) 的情绪魔法</h2>
        <div className="panel" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--pink-glow)' }}>双相情感障碍的“定海神针”</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              作为最轻的碱金属，锂离子 (Li<sup>+</sup>) 与镁离子 (Mg<sup>2+</sup>) 存在<strong>对角线规则</strong>（半径和电荷密度相似）。<br/><br/>
              在神经系统中，过度活跃的肌醇单磷酸酶 (IMPase，其活性依赖于 Mg<sup>2+</sup>) 会导致躁狂症。Li<sup>+</sup> 凭借与 Mg<sup>2+</sup> 的相似性，“竞争性”地霸占了酶的活性位点，从而抑制了异常的神经信号传导，成为现代医学治疗双相情感障碍的一线药物。
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <svg width="100%" height="150" viewBox="0 0 300 150">
              <path d="M 50 75 C 100 10, 200 10, 250 75 C 200 140, 100 140, 50 75" fill="rgba(139,92,246,0.2)" stroke="var(--purple-med)" strokeWidth="3"/>
              <text x="150" y="80" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">IMPase 酶 (需 Mg²⁺)</text>
              <circle cx="100" cy="75" r="15" fill="var(--life-green)" opacity="0.3"/><text x="100" y="79" fill="var(--life-green)" fontSize="10" textAnchor="middle">Mg²⁺</text>
              <circle cx="100" cy="75" r="10" fill="var(--alert-red)"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/></circle>
              <text x="100" y="79" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">Li⁺</text>
              <text x="150" y="130" fill="var(--pink-glow)" fontSize="12" textAnchor="middle">Li⁺ 竞争性取代 Mg²⁺，阻断躁狂信号</text>
            </svg>
          </div>
        </div>
      </section>

      {/* 测验区 */}
      <section>
        <h3 style={{ color: 'var(--alert-orange)' }}>⚔️ s 区思维道场</h3>
        <div className="grid-2">
          <div className="quiz-card">
            <p style={{ fontWeight: 'bold' }}>1. 临床上若发生误服 BaCO₃ 引起中毒，下列哪种溶液可作为急救洗胃剂？</p>
            <button className="btn-outline" style={{ display: 'block', width: '100%', marginBottom: '5px', textAlign: 'left' }} onClick={() => setQuizState({...quizState, q1: 'wrong'})}>A. 0.9% NaCl 溶液</button>
            <button className="btn-outline" style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => setQuizState({...quizState, q1: 'correct'})}>B. 5% Na₂SO₄ 溶液</button>
            {quizState.q1 && <p style={{ color: quizState.q1 === 'correct' ? 'var(--life-green)' : 'var(--alert-red)' }}>{quizState.q1 === 'correct' ? '正确！SO₄²⁻ 能结合体内游离的 Ba²⁺ 形成极难溶的 BaSO₄ 沉淀排出。' : '错误。Cl⁻ 无法沉淀 Ba²⁺。'}</p>}
          </div>
          <div className="quiz-card">
            <p style={{ fontWeight: 'bold' }}>2. 潜水艇和宇航员生命维持系统中，常用来吸收 CO₂ 并同步释放 O₂ 的物质是？</p>
            <button className="btn-outline" style={{ display: 'block', width: '100%', marginBottom: '5px', textAlign: 'left' }} onClick={() => setQuizState({...quizState, q2: 'wrong'})}>A. NaOH (氢氧化钠)</button>
            <button className="btn-outline" style={{ display: 'block', width: '100%', textAlign: 'left' }} onClick={() => setQuizState({...quizState, q2: 'correct'})}>B. Na₂O₂ (过氧化钠) 或 KO₂ (超氧化钾)</button>
            {quizState.q2 && <p style={{ color: quizState.q2 === 'correct' ? 'var(--life-green)' : 'var(--alert-red)' }}>{quizState.q2 === 'correct' ? '正确！2Na₂O₂ + 2CO₂ → 2Na₂CO₃ + O₂，一举两得。' : '错误。NaOH 只能吸收 CO₂，不能产氧。'}</p>}
          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--cyan-glow), var(--purple-med))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', cursor: 'pointer', zIndex: 100 }}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block', position: 'fixed', bottom: '100px', right: '30px', width: '340px', background: 'var(--bg-dark)', border: '1px solid var(--cyan-glow)', borderRadius: '12px', padding: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--life-green)', fontSize: '15px' }}>s区化学与医学 AI 导师</h3>
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
            <input type="text" placeholder="输入你想探究的问题..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#1e293b', color: '#fff', outline: 'none' }} />
            <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'var(--cyan-glow)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span></button>
          </div>
        </div>
      )}
    </div>
  );
}