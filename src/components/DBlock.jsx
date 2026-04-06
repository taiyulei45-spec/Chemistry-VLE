import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function DBlock() {
  // ==========================================
  // 状态管理区 (已严格排查，确保无 unused 变量)
  // ==========================================

  // M2: d-d 跃迁交互
  const [lightWave, setLightWave] = useState(500); // 波长 nm (400-700)

  // M3: 超顺磁性 MRI
  const [mriField, setMriField] = useState(0); // 磁场强度 0-100

  // M4: 顺铂抗癌机理
  const [cisplatinState, setCisplatinState] = useState('blood'); // 'blood', 'cell', 'dna'

  // M5: 锝-99m (Tc-99m) 核医学显像
  const [tcLigand, setTcLigand] = useState('none'); // 'none', 'mibi', 'mdp'
  const [scanState, setScanState] = useState('idle'); // 'idle', 'injecting', 'imaging'

  // M6: 金纳米光热
  const [auLaser, setAuLaser] = useState(0); // 激光功率 0-100

  // M7: 银离子抗菌
  const [agIons, setAgIons] = useState(0); // Ag+ 释放量 0-100

  // 测验与 AI
  const [quizState, setQuizState] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是 d区和 ds区 AI 导师。过渡金属的未充满 d 轨道赋予了它们色彩、磁性、催化性，是现代药物与医学材料的基石。\n\n关于“顺铂配位原理”、“金纳米表面等离子共振”、“造影剂弛豫机制”或“锝的核医学应用”，随时提问！' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 交互逻辑与动画缓存 (SVG Renderers)
  // ==========================================

  // 波长转颜色简易函数
  const waveToColor = (w) => {
    if (w < 450) return '#8b5cf6'; // 紫
    if (w < 500) return '#3b82f6'; // 蓝
    if (w < 550) return '#10b981'; // 绿
    if (w < 600) return '#fde047'; // 黄
    if (w < 650) return '#f59e0b'; // 橙
    return '#ef4444'; // 红
  };

  // M2: d-d 跃迁
  const renderDDTransition = () => {
    const isAbsorbing = lightWave > 480 && lightWave < 520; // 假设吸收 500nm 左右的蓝绿光
    const compColor = isAbsorbing ? '#ef4444' : '#334155'; // 吸收蓝绿，呈现红色

    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <text x="200" y="20" fill="var(--text-muted)" fontSize="14" textAnchor="middle">八面体场 d 轨道能级分裂 (Δo)</text>
        
        {/* 能级横线 */}
        <line x1="250" y1="80" x2="280" y2="80" stroke="var(--primary-blue)" strokeWidth="3"/>
        <line x1="300" y1="80" x2="330" y2="80" stroke="var(--primary-blue)" strokeWidth="3"/>
        <text x="350" y="85" fill="#fff" fontSize="12">e<sub>g</sub></text>

        <line x1="225" y1="180" x2="255" y2="180" stroke="var(--primary-blue)" strokeWidth="3"/>
        <line x1="275" y1="180" x2="305" y2="180" stroke="var(--primary-blue)" strokeWidth="3"/>
        <line x1="325" y1="180" x2="355" y2="180" stroke="var(--primary-blue)" strokeWidth="3"/>
        <text x="375" y="185" fill="#fff" fontSize="12">t<sub>2g</sub></text>

        {/* 电子跃迁 */}
        <circle cx="240" cy={isAbsorbing ? 80 : 180} r="5" fill="var(--sz-gold)" style={{ transition: 'cy 0.3s ease' }}/>
        
        {/* 入射光 */}
        <path d="M 50 200 L 220 185" stroke={waveToColor(lightWave)} strokeWidth="4" strokeDasharray="5 5">
          <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.2s" repeatCount="indefinite"/>
        </path>
        <text x="100" y="215" fill={waveToColor(lightWave)} fontSize="12" fontWeight="bold">入射光 ({lightWave} nm)</text>

        {/* 宏观颜色展示 */}
        <circle cx="100" cy="80" r="40" fill={compColor} stroke="#fff" strokeWidth="2" style={{ transition: 'fill 0.5s ease' }}/>
        <text x="100" y="145" fill={compColor} fontSize="14" fontWeight="bold" textAnchor="middle">
          {isAbsorbing ? "呈现互补色 (红)" : "未激发 (暗色)"}
        </text>
      </svg>
    );
  };

  // M3: MRI 磁偶极子缓存
  const dipoles = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    x: 100 + (i % 4) * 40, y: 70 + Math.floor(i / 4) * 40, initAngle: Math.random() * 360
  })), []);

  const renderMRISVG = () => {
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <rect x="70" y="40" width="180" height="140" fill="rgba(15,23,42,0.6)" rx="10" stroke="#475569" strokeWidth="2"/>
        <text x="160" y="200" fill="var(--text-muted)" fontSize="12" textAnchor="middle">SPIO 纳米颗粒核心 (Fe³⁺/Fe²⁺)</text>

        <g opacity={mriField / 100}>
          {[80, 120, 160, 200, 240].map(x => (
            <line key={x} x1={x} y1="220" x2={x} y2="20" stroke="var(--cyan-glow)" strokeWidth="2" strokeDasharray="8 4">
              <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.5s" repeatCount="indefinite"/>
            </line>
          ))}
        </g>

        {dipoles.map((d, i) => {
          const angle = d.initAngle * (1 - mriField / 100) - 90 * (mriField / 100);
          return (
            <g key={i} transform={`translate(${d.x}, ${d.y}) rotate(${angle})`} style={{ transition: 'transform 0.3s ease' }}>
              <line x1="-10" y1="0" x2="10" y2="0" stroke={mriField > 50 ? "var(--life-green)" : "var(--alert-orange)"} strokeWidth="2"/>
              <polygon points="10,0 5,-4 5,4" fill={mriField > 50 ? "var(--life-green)" : "var(--alert-orange)"}/>
            </g>
          );
        })}

        <text x="320" y="80" fill="var(--cyan-glow)" fontSize="14" fontWeight="bold" textAnchor="middle">B₀ = {mriField}%</text>
        <text x="320" y="110" fill="#fff" fontSize="12" textAnchor="middle">{mriField > 80 ? "磁矩高度一致" : "磁矩随机热运动"}</text>
        {mriField > 80 && <text x="320" y="140" fill="var(--alert-red)" fontSize="12" fontWeight="bold" textAnchor="middle">缩短周围水 T2</text>}
      </svg>
    );
  };

  // M4: 顺铂抗癌
  const renderCisplatinSVG = () => {
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <text x="200" y="20" fill="var(--text-muted)" fontSize="14" textAnchor="middle">顺铂 [Pt(NH₃)₂Cl₂] 靶向 DNA</text>
        
        {/* DNA 链 */}
        <path d="M 50 160 Q 200 120 350 160" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="8"/>
        <text x="350" y="180" fill="var(--primary-blue)" fontSize="12">DNA 双螺旋骨架</text>
        <rect x="170" y="150" width="20" height="15" fill="var(--life-green)"/><text x="180" y="162" fill="#000" fontSize="10" textAnchor="middle">G</text>
        <rect x="210" y="150" width="20" height="15" fill="var(--life-green)"/><text x="220" y="162" fill="#000" fontSize="10" textAnchor="middle">G</text>

        <g style={{ transition: 'all 1s ease' }} transform={cisplatinState === 'blood' ? 'translate(200, 50)' : cisplatinState === 'cell' ? 'translate(200, 100)' : 'translate(200, 135)'}>
          <circle cx="0" cy="0" r="15" fill="var(--sz-gold)"/>
          <text x="0" y="4" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">Pt</text>
          
          <circle cx="-20" cy="-20" r="8" fill="var(--cyan-glow)"/><text x="-20" y="-17" fill="#000" fontSize="8" textAnchor="middle">NH₃</text>
          <circle cx="20" cy="-20" r="8" fill="var(--cyan-glow)"/><text x="20" y="-17" fill="#000" fontSize="8" textAnchor="middle">NH₃</text>
          
          {cisplatinState !== 'dna' && <g><circle cx="-20" cy="20" r="8" fill="var(--alert-orange)"/><text x="-20" y="23" fill="#000" fontSize="8" textAnchor="middle">Cl</text></g>}
          {cisplatinState === 'blood' && <g><circle cx="20" cy="20" r="8" fill="var(--alert-orange)"/><text x="20" y="23" fill="#000" fontSize="8" textAnchor="middle">Cl</text></g>}
        </g>

        {cisplatinState === 'blood' && <text x="200" y="100" fill="#fff" fontSize="12" textAnchor="middle">血液高氯环境，抑制解离</text>}
        {cisplatinState === 'cell' && <text x="200" y="140" fill="var(--alert-red)" fontSize="12" textAnchor="middle">细胞内低氯，Cl⁻ 脱落生成水合离子</text>}
        {cisplatinState === 'dna' && <text x="200" y="220" fill="var(--alert-red)" fontSize="14" fontWeight="bold" textAnchor="middle">Pt 与相邻鸟嘌呤(G) N7 位螯合，DNA 扭曲致死！</text>}
      </svg>
    );
  };

  // M5: 锝-99m 核医学靶向显像
  const triggerScan = () => {
    if (tcLigand === 'none') return alert('请先选择靶向配体！');
    setScanState('injecting');
    setTimeout(() => {
      setScanState('imaging');
      setTimeout(() => setScanState('idle'), 4000);
    }, 2000);
  };

  const renderTcSVG = () => {
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        {/* 人体简图 */}
        <path d="M 200 40 Q 220 40 220 70 Q 220 90 200 90 Q 180 90 180 70 Q 180 40 200 40 Z" fill="none" stroke="#475569" strokeWidth="2"/>
        <path d="M 180 90 Q 150 90 150 150 L 150 200 M 220 90 Q 250 90 250 150 L 250 200 M 180 90 L 180 250 M 220 90 L 220 250" fill="none" stroke="#475569" strokeWidth="2"/>
        
        {/* 心脏 (Target 1) */}
        <path d="M 200 120 C 200 120 185 105 175 115 C 165 125 175 140 200 155 C 225 140 235 125 225 115 C 215 105 200 120 200 120 Z" fill={scanState === 'imaging' && tcLigand === 'mibi' ? 'var(--alert-red)' : 'rgba(239,68,68,0.2)'} stroke="var(--alert-red)" strokeWidth="2" style={{ transition: 'all 1s' }}/>
        <text x="160" y="130" fill="var(--text-muted)" fontSize="10">心脏</text>

        {/* 骨骼 (Target 2) */}
        <line x1="150" y1="150" x2="150" y2="190" stroke={scanState === 'imaging' && tcLigand === 'mdp' ? 'var(--cyan-glow)' : 'rgba(6,182,212,0.2)'} strokeWidth="6" strokeLinecap="round" style={{ transition: 'all 1s' }}/>
        <text x="135" y="170" fill="var(--text-muted)" fontSize="10">骨骼</text>

        {/* Tc-99m 注入动画 */}
        {scanState === 'injecting' && (
          <g>
            <circle cx="100" cy="50" r="8" fill="var(--sz-gold)">
              <animate attributeName="cx" values="100; 200" dur="2s" fill="freeze"/>
              <animate attributeName="cy" values="50; 90" dur="2s" fill="freeze"/>
            </circle>
            <text x="100" y="45" fill="var(--sz-gold)" fontSize="10" fontWeight="bold">
              <sup>99m</sup>Tc
              <animate attributeName="x" values="100; 200" dur="2s" fill="freeze"/>
              <animate attributeName="y" values="45; 85" dur="2s" fill="freeze"/>
            </text>
          </g>
        )}

        {/* 放射 γ 射线成像 */}
        {scanState === 'imaging' && (
          <g>
            <circle cx={tcLigand === 'mibi' ? 200 : 150} cy={tcLigand === 'mibi' ? 135 : 170} r="15" fill="none" stroke="var(--sz-gold)" strokeWidth="2">
              <animate attributeName="r" values="15; 40" dur="1s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1; 0" dur="1s" repeatCount="indefinite"/>
            </circle>
            <text x="300" y="140" fill="var(--sz-gold)" fontSize="14" fontWeight="bold">发射 γ 射线</text>
            <text x="300" y="160" fill="#fff" fontSize="12">SPECT 显像中...</text>
          </g>
        )}
      </svg>
    );
  };

  // M6: 金纳米光热
  const renderAuNPSVG = () => {
    const temp = 37 + auLaser * 0.15;
    const isDead = temp > 45;
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <g opacity={auLaser / 100}>
          <polygon points="200,20 150,150 250,150" fill="rgba(239,68,68,0.2)"/>
          <path d="M 200 20 L 200 150" stroke="var(--alert-red)" strokeWidth="4" strokeDasharray="10 5">
            <animate attributeName="stroke-dashoffset" from="15" to="0" dur="0.3s" repeatCount="indefinite"/>
          </path>
        </g>
        
        <circle cx="200" cy="150" r="60" fill={isDead ? "#475569" : "var(--pink-glow)"} stroke="#fff" strokeWidth="2" style={{ transition: 'fill 1s ease' }}/>
        <text x="200" y="235" fill={isDead ? "var(--text-muted)" : "var(--alert-red)"} fontSize="14" fontWeight="bold" textAnchor="middle">{isDead ? "热消融坏死" : "肿瘤细胞"}</text>
        
        <circle cx="200" cy="150" r="15" fill="var(--sz-gold)"/>
        <text x="200" y="154" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">Au</text>

        {auLaser > 0 && !isDead && (
          <circle cx="200" cy="150" r="15" fill="none" stroke="var(--alert-orange)" strokeWidth="3">
            <animate attributeName="r" values={`15; ${15 + auLaser/2}`} dur="0.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1; 0" dur="0.8s" repeatCount="indefinite"/>
          </circle>
        )}
        <text x="80" y="150" fill={temp>42?"var(--alert-red)":"#fff"} fontSize="18" fontWeight="bold">T = {temp.toFixed(1)} ℃</text>
      </svg>
    );
  };

  // M7: 银离子抗菌
  const renderAgSVG = () => {
    const membraneOp = Math.max(0.2, 1 - agIons / 100);
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <rect x="50" y="100" width="300" height="40" fill="rgba(16,185,129,0.3)" stroke="var(--life-green)" strokeWidth="3" opacity={membraneOp}/>
        <text x="200" y="125" fill="var(--life-green)" fontSize="14" textAnchor="middle" opacity={membraneOp}>细菌细胞膜 / 呼吸酶</text>
        
        {Array.from({ length: Math.floor(agIons / 10) }).map((_, i) => (
          <g key={i}>
            <circle cx={70 + i*30} cy="100" r="6" fill="#cbd5e1">
              <animate attributeName="cy" values="50; 120" dur={`${1 + Math.random()}s`} fill="freeze"/>
            </circle>
            <text x={70 + i*30} y="100" fill="#000" fontSize="8" textAnchor="middle" fontWeight="bold">
              Ag⁺<animate attributeName="y" values="54; 124" dur={`${1 + Math.random()}s`} fill="freeze"/>
            </text>
          </g>
        ))}
        {agIons > 50 && <text x="200" y="180" fill="var(--alert-red)" fontSize="16" fontWeight="bold" textAnchor="middle">Ag⁺ 结合巯基(-SH)，酶蛋白变性，细菌死亡！</text>}
      </svg>
    );
  };

  // ==========================================
  // AI 交互逻辑
  // ==========================================
  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton && (e.key !== 'Enter' || e.nativeEvent.isComposing)) return;
    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在检索 d 区过渡金属文献与医学图谱...' }]);

    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, 'd区/ds区金属医药前沿');
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply };
        return newHistory;
      });
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 核心超算连接断开，请重试。' };
        return newHistory;
      });
    }
  };

  useEffect(() => { 
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
  }, [chatHistory, isChatOpen]);

  return (
    <div className="dblock-wrapper">
      <style>{`
        .dblock-wrapper { --bg-dark: #0f172a; --bg-panel: rgba(30, 41, 59, 0.75); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --sz-gold: #fbbf24; --pink-glow: #ec4899; background: var(--bg-dark); color: #f8fafc; font-family: 'Segoe UI', sans-serif; line-height: 1.6; overflow-x: hidden; }
        
        .dblock-wrapper h1, .dblock-wrapper h2, .dblock-wrapper h3 { color: var(--cyan-glow); margin-top: 0; }
        .dblock-wrapper h2 { border-left: 5px solid var(--primary-blue); padding-left: 10px; margin: 30px 0 20px 0; font-size: 1.5rem; color: #fff;}
        .dblock-wrapper section { padding: 40px 5%; border-bottom: 1px solid rgba(255,255,255,0.05); }
        
        .dblock-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .dblock-wrapper .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .dblock-wrapper .panel { background: var(--bg-panel); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .dblock-wrapper .svg-box { border: 2px dashed var(--primary-blue); border-radius: 12px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; min-height: 280px; display: flex; flex-direction: column; justify-content: center; }
        
        .dblock-wrapper .btn { background: linear-gradient(135deg, var(--cyan-glow), var(--primary-blue)); border: none; padding: 10px 20px; color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; width: 100%; margin-top: 10px; }
        .dblock-wrapper .btn:hover:not(:disabled) { box-shadow: 0 4px 15px rgba(6, 182, 212, 0.5); transform: translateY(-2px); }
        .dblock-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; font-size: 13px; margin-right: 8px; }
        .dblock-wrapper .btn-outline:hover, .dblock-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); color: #fff; }
        
        .dblock-wrapper .quiz-card { background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px; border-left: 4px solid var(--sz-gold); margin-bottom: 15px; }
        .dblock-wrapper .quiz-opt { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; display: block; width: 100%; text-align: left; margin-bottom: 8px; }
        .dblock-wrapper .quiz-opt:hover { background: rgba(6, 182, 212, 0.2); }
        
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        .markdown-prose strong { color: var(--sz-gold); }
        
        /* 绚丽的 d 轨道旋转动画 */
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Hero Banner - 完美保留经典的四叶玫瑰线动画 */}
      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', paddingTop: '60px', paddingBottom: '40px' }}>
        <svg width="200" height="150" viewBox="0 0 200 150" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 15px var(--cyan-glow))' }}>
          {/* 抽象的 d 轨道 (四叶玫瑰线) */}
          <g style={{ transformOrigin: '100px 75px', animation: 'orbit 10s linear infinite' }}>
            <path d="M 100 75 Q 150 25 100 0 Q 50 25 100 75" fill="rgba(6,182,212,0.4)" stroke="var(--cyan-glow)" strokeWidth="2"/>
            <path d="M 100 75 Q 150 125 100 150 Q 50 125 100 75" fill="rgba(6,182,212,0.4)" stroke="var(--cyan-glow)" strokeWidth="2"/>
            <path d="M 100 75 Q 150 25 200 75 Q 150 125 100 75" fill="rgba(236,72,153,0.4)" stroke="var(--pink-glow)" strokeWidth="2"/>
            <path d="M 100 75 Q 50 25 0 75 Q 50 125 100 75" fill="rgba(236,72,153,0.4)" stroke="var(--pink-glow)" strokeWidth="2"/>
          </g>
          <circle cx="100" cy="75" r="10" fill="var(--sz-gold)"/>
        </svg>
        <h1 style={{ fontSize: '3rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '20px 0' }}>d 区与 ds 区：过渡金属与生命奇迹</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto' }}>“从未充满的 d 轨道到五彩斑斓的配合物，从拯救生命的顺铂到诊断病灶的核磁造影。它们是无机化学王冠上的明珠。”</p>
      </section>

      {/* Module 1: 理论基石 */}
      <section>
        <h2>模块一：d 区与 ds 区核心通性</h2>
        <div className="grid-3">
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>⚛️ 电子排布与氧化态</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>d 区元素含有未充满的 (n-1)d 轨道，ds 区元素 d 轨道全满。由于 ns 和 (n-1)d 能级相近，它们能表现出极其丰富的可变氧化态，如 Mn 最高可达 +7 价。</p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--pink-glow)' }}>🧲 磁性与颜色</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>d 轨道通常含有未成对电子，宏观表现为顺磁性。在配体场作用下，d 轨道发生能级分裂，吸收可见光发生 d-d 跃迁，形成五彩斑斓的配合物。</p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--alert-orange)' }}>🔗 强大的配位与催化</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>过渡金属具有空 d 轨道，极易接受配体的孤对电子。同时它们能在多个氧化态间轻松切换，是自然界金属酶和工业催化的核心主角。</p>
          </div>
        </div>
      </section>

      {/* Module 2: d-d 跃迁 */}
      <section>
        <h2>模块二：晶体场理论与绚丽色彩 (d-d 跃迁)</h2>
        <div className="grid-2">
          <div className="panel">
            <h3>为什么过渡金属化合物五颜六色？</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              在配体（如水分子、氨分子）的静电场包围下，中心金属原本简并的 5 个 d 轨道会分裂成能量不同的两组（如 e<sub>g</sub> 和 t<sub>2g</sub>）。<br/><br/>
              当外部可见光的能量（波长）刚好等于这个能量差（分裂能 Δo）时，低能级的电子就会吸收光子跃迁到高能级。我们肉眼看到的，是被吸收光色的<strong>互补色</strong>。
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: waveToColor(lightWave), fontWeight: 'bold' }}>滑动调节入射光波长：{lightWave} nm</label>
              <input type="range" min="400" max="700" value={lightWave} onChange={e => setLightWave(parseInt(e.target.value))} style={{ width: '100%', marginTop: '10px' }}/>
            </div>
          </div>
          <div className="svg-box">{renderDDTransition()}</div>
        </div>
      </section>

      {/* Module 3: MRI SPIONs */}
      <section>
        <h2>模块三：磁性医学 —— 超顺磁氧化铁 (SPIONs) 与 MRI 造影</h2>
        <div className="grid-2">
          <div className="svg-box">{renderMRISVG()}</div>
          <div className="panel">
            <h3>“点亮”核磁共振的微观磁场</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              Fe<sup>3+</sup> 和 Fe<sup>2+</sup> 拥有未成对的 d 电子。在纳米尺度下，氧化铁表现出<strong>超顺磁性</strong>：平时磁矩随机排列（无剩磁），但在外部主磁场 (B₀) 下，会瞬间整齐排列。<br/><br/>
              这种强大的局部磁场干扰会极大地缩短病灶周围水分子的 <strong>T2 弛豫时间</strong>，在影像上形成明显的暗区，成为肝癌诊断的利器。
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: 'var(--cyan-glow)', fontWeight: 'bold' }}>调节 MRI 主磁场 B₀：{mriField} %</label>
              <input type="range" min="0" max="100" value={mriField} onChange={e => setMriField(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--cyan-glow)' }}/>
            </div>
          </div>
        </div>
      </section>

      {/* Module 4: Cisplatin */}
      <section>
        <h2>模块四：抗癌里程碑 —— 顺铂的 dsp² 配位魔法</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--sz-gold)' }}>拯救千万生命的几何学</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              铂 (Pt) 是重过渡金属，Pt<sup>2+</sup> 为 d<sup>8</sup> 构型，通过 dsp² 杂化形成独特的<strong>平面正方形</strong>构型。<br/><br/>
              顺铂 [Pt(NH<sub>3</sub>)<sub>2</sub>Cl<sub>2</sub>] 在高氯离子浓度的血液中保持稳定。进入癌细胞后（低氯环境），两个 Cl⁻ 被水分子取代脱落，裸露的 Pt 随后与 DNA 的相邻鸟嘌呤 (G) 的 N7 位发生强烈配位，导致 <strong>DNA 严重扭曲，癌细胞无法复制而凋亡</strong>。
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="btn-outline" onClick={() => setCisplatinState('blood')}>1. 血液运输 (高 Cl⁻)</button>
              <button className="btn-outline" onClick={() => setCisplatinState('cell')}>2. 进入细胞 (水解)</button>
              <button className="btn" style={{ background: 'var(--alert-red)' }} onClick={() => setCisplatinState('dna')}>3. 靶向 DNA 螯合</button>
            </div>
          </div>
          <div className="svg-box">{renderCisplatinSVG()}</div>
        </div>
      </section>

      {/* Module 5: Tc-99m */}
      <section>
        <h2>模块五：核医学影像 —— 锝-99m (Tc) 与靶向探测</h2>
        <div className="grid-2">
          <div className="svg-box">{renderTcSVG()}</div>
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>人工元素与生命向导</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              锝 (Tc) 是第一个人造元素。其同位素 <sup>99m</sup>Tc 具有 6 小时的理想半衰期，并释放穿透力极强的 γ 射线，占据了全球 85% 的核医学显像。<br/><br/>
              <strong>配位化学的魔法：</strong>裸露的锝没有靶向性，但通过配位化学为其穿上“外衣”即可实现精准制导：<br/>
              - <strong>MIBI</strong> (甲氧基异丁基异腈) 配合物 ➔ 靶向心肌 (诊断冠心病)。<br/>
              - <strong>MDP</strong> (亚甲基二磷酸盐) 配合物 ➔ 靶向成骨活跃区 (骨扫描)。
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className={`btn-outline ${tcLigand === 'mibi' ? 'active' : ''}`} onClick={() => setTcLigand('mibi')}>装载 MIBI (心肌靶向)</button>
              <button className={`btn-outline ${tcLigand === 'mdp' ? 'active' : ''}`} onClick={() => setTcLigand('mdp')}>装载 MDP (骨骼靶向)</button>
            </div>
            <button className="btn" style={{ background: 'var(--alert-red)', marginTop: '10px' }} onClick={triggerScan} disabled={scanState !== 'idle'}>
              ☢️ 注入 <sup>99m</sup>Tc 配合物进行 SPECT 扫描
            </button>
          </div>
        </div>
      </section>

      {/* Module 6: AuNP */}
      <section>
        <h2>模块六：纳米光子学 —— 金纳米颗粒 (AuNPs) 的光热治疗</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--alert-orange)' }}>燃烧癌细胞的金色“特洛伊木马”</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              金 (Au) 属于 ds 区元素。缩小到纳米尺度后，表面自由电子在红外光激发下集体振荡，即<strong>局域表面等离子体共振 (LSPR)</strong>。<br/><br/>
              近红外光 (NIR) 能无创穿透皮肤。聚集在肿瘤内的 AuNPs 吸收光能并瞬间转化为巨大热能，将局部温度升至 45℃ 以上，导致癌细胞蛋白质变性发生热消融。
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: 'var(--alert-red)' }}>照射近红外激光 (NIR) 功率: {auLaser}%</label>
              <input type="range" min="0" max="100" value={auLaser} onChange={e => setAuLaser(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--alert-red)', marginTop: '10px' }}/>
            </div>
          </div>
          <div className="svg-box">{renderAuNPSVG()}</div>
        </div>
      </section>

      {/* Module 7: Ag Antibacterial */}
      <section>
        <h2>模块七：防腐奇迹 —— 银离子 (Ag⁺) 的广谱抗菌机制</h2>
        <div className="grid-2">
          <div className="svg-box">{renderAgSVG()}</div>
          <div className="panel">
            <h3 style={{ color: '#cbd5e1' }}>金属界的抗生素</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              银 (Ag) 是强效抗菌材料。Ag⁺ 作为一种“软酸”，对硫、氮等“软碱”具有极高的配位亲和力。<br/><br/>
              Ag⁺ 缓慢释放后，能穿透细菌细胞壁，牢牢结合在细菌呼吸酶的<strong>巯基 (-SH)</strong> 上，使其蛋白质构象破坏、代谢瘫痪，最终导致细菌死亡。同时 Ag⁺ 物理杀菌机制不易让细菌产生抗药性。
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: '#cbd5e1' }}>调节纳米银敷料释放 Ag⁺ 量: {agIons}%</label>
              <input type="range" min="0" max="100" value={agIons} onChange={e => setAgIons(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#cbd5e1', marginTop: '10px' }}/>
            </div>
          </div>
        </div>
      </section>

      {/* Module 8, 9: 铜锌代谢 */}
      <section>
        <h2>模块八 / 九：微量元素与代谢疾病 (铜与锌)</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>Module 8: 铜代谢与威尔逊病 (Wilson's)</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>
              铜 (Cu) 是细胞色素 c 氧化酶的核心。但当 ATP7B 基因突变时，铜无法排出，在肝脑中大量沉积（形成角膜 K-F 环）。<br/>
              <strong>化学解法：</strong>使用青霉胺 (D-Penicillamine)。其分子中的 -SH 和 -NH<sub>2</sub> 就像钳子一样，与有毒的 Cu 离子发生强烈的<strong>螯合反应</strong>，形成水溶性极好的配合物经尿液排出。
            </p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--purple-med)' }}>Module 9: 锌指蛋白与基因表达</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>
              锌 (Zn) 作为 ds 区最后的元素，其 d 轨道全满 (d<sup>10</sup>)，不再发生氧化还原反应，构型极度稳定。<br/>
              在人体内，Zn<sup>2+</sup> 与蛋白质中的半胱氨酸 (-SH) 和组氨酸 (-N) 配位，将多肽链折叠成“手指”状结构。这些<strong>锌指蛋白</strong>能精准插入 DNA 的大沟中，开启或关闭生命体的基因表达！
            </p>
          </div>
        </div>
      </section>

      {/* Module 10, 11: 骨科钛与维生素B12 */}
      <section>
        <h2>模块十 / 十一：从骨科支架到生命维生素</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--life-green)' }}>M10: 钛合金与人工骨骼</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>钛 (Ti) 作为早期过渡金属，具有极高的比强度和绝佳的生物相容性。其表面会瞬间氧化生成极度致密的 TiO<sub>2</sub> 钝化膜，使其在体液（含高浓度盐和酸）中绝对抗腐蚀，成为现代骨科植入物的首选材料。</p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--pink-glow)' }}>M11: 钴与维生素 B12</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>维生素 B12 是自然界唯一含有金属钴 (Co) 的维生素。Co<sup>3+</sup> 处于巨大的咕啉环中心形成完美的大环配合物，参与人体造血和神经髓鞘合成，缺乏会导致严重的恶性贫血与神经系统退化。</p>
          </div>
        </div>
      </section>

      {/* Module 12: 终极测验 */}
      <section>
        <h3 style={{ color: 'var(--sz-gold)' }}>⚔️ Module 12: d 区极限挑战道场</h3>
        <div className="grid-2">
          <div className="quiz-card">
            <p style={{ fontWeight: 'bold', color: '#fff' }}>1. 顺铂具有强大抗癌活性的微观结构前提是它形成了哪种构型？</p>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q1: 'wrong'})}>A. sp³ 杂化，正四面体构型</button>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q1: 'correct'})}>B. dsp² 杂化，平面正方形构型</button>
            {quizState.q1 && <p style={{ color: quizState.q1 === 'correct' ? 'var(--life-green)' : 'var(--alert-red)' }}>{quizState.q1 === 'correct' ? '正确！平面构型使其恰好能插入 DNA 碱基对之间产生交联。' : '错误。Pt(II) 是典型的 d8 电子构型。'}</p>}
          </div>
          <div className="quiz-card">
            <p style={{ fontWeight: 'bold', color: '#fff' }}>2. 锝-99m 能够用于核医学心脏或骨骼靶向显像的根本原因是？</p>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q2: 'wrong'})}>A. 锝元素天生具有对不同器官的趋向性</button>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q2: 'correct'})}>B. 锝能够与不同性质的配体 (如 MIBI 或 MDP) 发生配位结合，由配体实现靶向</button>
            {quizState.q2 && <p style={{ color: quizState.q2 === 'correct' ? 'var(--life-green)' : 'var(--alert-red)' }}>{quizState.q2 === 'correct' ? '正确！配位化学赋予了放射性核素无穷的医学可能。' : '错误。放射性核素本身通常是均匀分布的。'}</p>}
          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--cyan-glow), var(--purple-med))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', cursor: 'pointer', zIndex: 100 }}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block', position: 'fixed', bottom: '100px', right: '30px', width: '350px', background: 'var(--bg-dark)', border: '1px solid var(--purple-med)', borderRadius: '12px', padding: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '15px' }}>d区医药前沿 AI 导师</h3>
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
            <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'var(--primary-blue)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span></button>
          </div>
        </div>
      )}
    </div>
  );
}