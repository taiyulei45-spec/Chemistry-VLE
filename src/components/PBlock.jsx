import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function PBlock() {
  // ==========================================
  // 状态管理区
  // ==========================================

  const [bnctPower, setBnctPower] = useState(0); 
  const [silicaPh, setSilicaPh] = useState(7.4); 
  const [vesselState, setVesselState] = useState('constricted'); 
  const [asState, setAsState] = useState('mutant'); 
  const [pdtLight, setPdtLight] = useState(0); 
  const [hasFluorine, setHasFluorine] = useState(false);
  const [xeState, setXeState] = useState('idle'); 
  const [biPeriod, setBiPeriod] = useState(3); 

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是 p 区元素 AI 导师。p 区元素跨越金属与非金属，拥有最复杂的成键方式。\n\n关于“碳族介孔材料”、“氟在药物中的代谢阻断”、“单线态氧的激发”或“惰性电子对效应”，随时向我提问！' }
  ]);
  const chatEndRef = useRef(null);

  // 修复1：消除 Math.random 带来的 Hydration 报错，全部放入 useEffect 初始化
  const [drugParticles, setDrugParticles] = useState([]);
  const [noParticles, setNoParticles] = useState([]);

  useEffect(() => {
    setDrugParticles(Array.from({ length: 15 }).map(() => ({
      x: (Math.random() - 0.5) * 60, 
      y: Math.random() * 80 + 20, 
      startY: 140 + Math.random() * 20, // 固定初始位置
      dur: 1 + Math.random()
    })));
    
    setNoParticles(Array.from({ length: 12 }).map(() => ({
      x: 10 + Math.random() * 80, 
      y: 50 + Math.random() * 100, 
      dur: 1.5 + Math.random()
    })));
  }, []);

  // ==========================================
  // 交互逻辑
  // ==========================================

  const triggerNO = () => {
    setVesselState('dilated');
    setTimeout(() => setVesselState('constricted'), 4000);
  };

  const triggerAs = () => {
    setAsState('binding');
    setTimeout(() => setAsState('degraded'), 2000);
    setTimeout(() => setAsState('mutant'), 6000);
  };

  const triggerXe = () => {
    setXeState('inhaling');
    setTimeout(() => {
      setXeState('imaging');
      setTimeout(() => setXeState('idle'), 3000);
    }, 2000);
  };

  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton && (e.key !== 'Enter' || e.nativeEvent.isComposing)) return;
    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在检索 p区元素化学文献与前沿药理数据库...' }]);

    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, 'p区元素化学与生命医学前沿');
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

  // ------------------------------------------
  // SVG 渲染器
  // ------------------------------------------

  const renderBNCT = () => {
    const isFission = bnctPower > 80;
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <rect x="0" y="0" width="400" height="250" fill="rgba(15,23,42,0.8)"/>
        
        <g opacity={bnctPower / 100}>
          <path d="M 20 125 L 150 125" stroke="var(--cyan-glow)" strokeWidth="4" strokeDasharray="10 5">
            <animate attributeName="stroke-dashoffset" from="15" to="0" dur="0.2s" repeatCount="indefinite"/>
          </path>
          <circle cx="80" cy="125" r="5" fill="#fff"/>
          <text x="80" y="115" fill="#fff" fontSize="12" fontWeight="bold">热中子 (n)</text>
        </g>

        {!isFission ? (
          <g>
            <circle cx="200" cy="125" r="30" fill="var(--purple-med)"/>
            <text x="200" y="130" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle"><sup>10</sup>B</text>
            <text x="200" y="180" fill="var(--text-muted)" fontSize="12" textAnchor="middle">无毒性的硼同位素药物，富集于脑胶质瘤中</text>
          </g>
        ) : (
          <g>
            <circle cx="160" cy="80" r="25" fill="var(--life-green)"><animate attributeName="cx" values="200; 120" dur="0.5s" fill="freeze"/><animate attributeName="cy" values="125; 60" dur="0.5s" fill="freeze"/></circle>
            <text x="120" y="65" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle"><sup>7</sup>Li</text>
            
            <circle cx="260" cy="180" r="15" fill="var(--alert-orange)"><animate attributeName="cx" values="200; 280" dur="0.5s" fill="freeze"/><animate attributeName="cy" values="125; 190" dur="0.5s" fill="freeze"/></circle>
            <text x="280" y="195" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">α 粒子</text>
            
            <path d="M 280 190 L 350 230" stroke="var(--alert-orange)" strokeWidth="4" strokeDasharray="5 5"><animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.1s" repeatCount="indefinite"/></path>
            
            <text x="200" y="220" fill="var(--alert-red)" fontSize="16" fontWeight="bold" textAnchor="middle">核裂变发生！高能 α 粒子定点炸碎周围癌细胞 DNA！</text>
          </g>
        )}
      </svg>
    );
  };

  const renderSilica = () => {
    const capOpened = silicaPh <= 6.0;
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <circle cx="200" cy="180" r="80" fill="rgba(6,182,212,0.2)" stroke="var(--cyan-glow)" strokeWidth="4" strokeDasharray="15 5"/>
        <text x="200" y="250" fill="var(--cyan-glow)" fontSize="12" textAnchor="middle">介孔二氧化硅纳米粒 (MSN)</text>
        <rect x="170" y="100" width="60" height="80" fill="rgba(15,23,42,0.9)"/>
        
        <g>
          {drugParticles.map((p, i) => (
            <circle key={`drug_${i}`} cx={200 + p.x} cy={capOpened ? p.y : p.startY} r="4" fill="var(--pink-glow)">
              {capOpened && <animate attributeName="cy" values={`${p.startY}; ${p.y}`} dur={`${p.dur}s`} fill="freeze"/>}
              {capOpened && <animate attributeName="opacity" values="1; 0" dur={`${p.dur}s`} fill="freeze"/>}
            </circle>
          ))}
        </g>

        <polygon points="160,100 240,100 220,80 180,80" fill="var(--alert-orange)" style={{ transform: capOpened ? 'translate(80px, -40px) rotate(45deg)' : 'translate(0, 0)', transition: 'all 1s ease' }}/>
        <text x={capOpened ? 280 : 200} y={capOpened ? 60 : 75} fill="#fff" fontSize="10" textAnchor="middle" style={{ transition: 'all 1s ease' }}>pH敏感门控</text>

        {capOpened && <text x="200" y="40" fill="var(--life-green)" fontSize="16" fontWeight="bold" textAnchor="middle">肿瘤酸性微环境 (pH {silicaPh})：阀门溶解，靶向释药！</text>}
        {!capOpened && <text x="200" y="40" fill="var(--text-muted)" fontSize="14" textAnchor="middle">血液循环 (pH {silicaPh})：阀门紧闭，药物安全包裹。</text>}
      </svg>
    );
  };

  const renderPDT = () => {
    const isExcited = pdtLight > 50;
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <g opacity={pdtLight / 100}>
          <path d="M 200 20 L 200 120" stroke="var(--alert-red)" strokeWidth="6" strokeDasharray="15 5"><animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.2s" repeatCount="indefinite"/></path>
          <text x="250" y="60" fill="var(--alert-red)" fontSize="14" fontWeight="bold">630nm 激光激发</text>
        </g>

        <circle cx="200" cy="140" r="30" fill={isExcited ? "var(--pink-glow)" : "#334155"} stroke="#fff" strokeWidth="2" style={{ transition: 'fill 0.5s' }}/>
        <text x="200" y="145" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">PS</text>
        {isExcited && <circle cx="200" cy="140" r="40" fill="none" stroke="var(--pink-glow)" strokeWidth="2"><animate attributeName="r" values="30; 50" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="1; 0" dur="1s" repeatCount="indefinite"/></circle>}

        <text x="100" y="145" fill="var(--cyan-glow)" fontSize="18" fontWeight="bold"><sup>3</sup>O<sub>2</sub></text>
        <text x="100" y="165" fill="var(--text-muted)" fontSize="10">(基态三线态氧)</text>
        
        <path d="M 120 140 L 160 140" stroke="#fff" strokeWidth="2" markerEnd="url(#arrow_pdt)"/>
        
        {isExcited ? (
          <g>
            <path d="M 240 140 L 280 140" stroke="var(--alert-orange)" strokeWidth="3" markerEnd="url(#arrow_pdt_or)"><animate attributeName="stroke-dasharray" values="0 40; 40 0" dur="0.5s"/></path>
            <text x="320" y="145" fill="var(--alert-orange)" fontSize="20" fontWeight="bold" filter="drop-shadow(0 0 5px var(--alert-orange))"><sup>1</sup>O<sub>2</sub></text>
            <text x="320" y="170" fill="var(--alert-red)" fontSize="12" fontWeight="bold" textAnchor="middle">极强氧化性！</text>
            <text x="320" y="190" fill="var(--alert-red)" fontSize="12" fontWeight="bold" textAnchor="middle">摧毁肿瘤细胞膜</text>
          </g>
        ) : (
          <text x="320" y="145" fill="#475569" fontSize="14" textAnchor="middle">无反应</text>
        )}
        <defs>
          <marker id="arrow_pdt" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#fff"/></marker>
          <marker id="arrow_pdt_or" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--alert-orange)"/></marker>
        </defs>
      </svg>
    );
  };

  const renderFluorine = () => {
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <text x="200" y="30" fill="var(--text-muted)" fontSize="14" textAnchor="middle">肝脏细胞色素 P450 酶代谢攻击</text>
        
        <path d="M 50 125 C 50 70, 150 70, 150 125 C 150 180, 50 180, 50 125" fill="rgba(139,92,246,0.2)" stroke="var(--purple-med)" strokeWidth="3"/>
        <polygon points="120,125 160,100 160,150" fill="var(--bg-dark)"/> 
        <text x="80" y="130" fill="var(--purple-med)" fontSize="14" fontWeight="bold">P450 酶</text>

        <g transform="translate(260, 125)">
          <circle cx="0" cy="0" r="25" fill="#334155"/>
          <text x="0" y="4" fill="#fff" fontSize="10" textAnchor="middle">Drug</text>
          
          <line x1="-25" y1="0" x2="-60" y2="0" stroke={hasFluorine ? "var(--life-green)" : "#fff"} strokeWidth="4"/>
          <circle cx="-65" cy="0" r="10" fill={hasFluorine ? "var(--life-green)" : "#94a3b8"}/>
          <text x="-65" y="4" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">{hasFluorine ? "F" : "H"}</text>

          {!hasFluorine ? (
            <g>
              <path d="M -75 0 L -120 0" stroke="var(--alert-red)" strokeWidth="3" strokeDasharray="5 5"><animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.5s" repeatCount="indefinite"/></path>
              <text x="-90" y="-15" fill="var(--alert-red)" fontSize="12" fontWeight="bold" textAnchor="middle">C-H 键易断裂</text>
              <text x="-90" y="25" fill="var(--alert-red)" fontSize="10" textAnchor="middle">药物被代谢降解</text>
            </g>
          ) : (
            <g>
              <path d="M -90 -20 L -120 -50 M -90 20 L -120 50" stroke="var(--life-green)" strokeWidth="3" markerEnd="url(#arrow_bounce)"/>
              <text x="-90" y="-30" fill="var(--life-green)" fontSize="12" fontWeight="bold" textAnchor="middle">C-F 键能极大！阻断代谢</text>
              <text x="-90" y="45" fill="var(--life-green)" fontSize="10" textAnchor="middle">药物半衰期显著延长</text>
            </g>
          )}
        </g>
        <defs>
          <marker id="arrow_bounce" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--life-green)"/>
          </marker>
        </defs>
      </svg>
    );
  };

  const renderXeMRI = () => {
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <text x="200" y="20" fill="var(--text-muted)" fontSize="14" textAnchor="middle">肺部气体通气显像</text>
        
        <path d="M 120 50 C 60 50, 40 150, 100 200 C 140 200, 180 150, 180 100" fill="rgba(6,182,212,0.1)" stroke="var(--cyan-glow)" strokeWidth="2"/>
        <path d="M 280 50 C 340 50, 360 150, 300 200 C 260 200, 220 150, 220 100" fill="rgba(6,182,212,0.1)" stroke="var(--cyan-glow)" strokeWidth="2"/>
        <path d="M 180 100 Q 200 80 220 100 L 200 40 Z" fill="rgba(6,182,212,0.3)"/>
        
        {xeState === 'idle' && (
          <text x="200" y="150" fill="var(--text-muted)" fontSize="14" textAnchor="middle">传统 MRI 无法对肺部空腔成像</text>
        )}

        {xeState === 'inhaling' && (
          <g>
            <circle cx="200" cy="20" r="10" fill="var(--sz-gold)"><animate attributeName="cy" values="20; 80" dur="1s" fill="freeze"/></circle>
            <text x="200" y="24" fill="#000" fontSize="10" fontWeight="bold" textAnchor="middle">
              <animate attributeName="y" values="24; 84" dur="1s" fill="freeze"/>
              <tspan>¹²⁹Xe</tspan>
            </text>
            <text x="200" y="220" fill="var(--sz-gold)" fontSize="14" fontWeight="bold" textAnchor="middle">吸入超极化 ¹²⁹Xe 气体</text>
          </g>
        )}

        {xeState === 'imaging' && (
          <g>
            <path d="M 120 50 C 60 50, 40 150, 100 200 C 140 200, 180 150, 180 100" fill="rgba(253,224,71,0.6)" filter="blur(4px)">
               <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
            </path>
            <path d="M 280 50 C 340 50, 360 150, 300 200 C 260 200, 220 150, 220 100" fill="rgba(253,224,71,0.6)" filter="blur(4px)" clipPath="url(#lung_defect)">
               <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite"/>
            </path>
            <text x="200" y="230" fill="var(--sz-gold)" fontSize="16" fontWeight="bold" textAnchor="middle">核自旋信号增强 100,000 倍！完美显示肺通气</text>
          </g>
        )}
        <defs>
          <clipPath id="lung_defect">
             <rect x="200" y="0" width="200" height="120" />
             <rect x="260" y="160" width="100" height="100" />
          </clipPath>
        </defs>
      </svg>
    );
  };

  const renderInertPairSVG = () => {
    const sDrop = (biPeriod - 3) * 30; 
    const isHeavy = biPeriod === 6;

    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <text x="20" y="30" fill="var(--text-muted)" fontSize="12">能级 (E)</text>
        <line x1="40" y1="230" x2="40" y2="40" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow_pb)"/>
        
        <text x="70" y="85" fill="#fff" fontSize="14">n p 轨道 (容易失去)</text>
        <line x1="220" y1="80" x2="250" y2="80" stroke="var(--cyan-glow)" strokeWidth="4"/>
        <line x1="260" y1="80" x2="290" y2="80" stroke="var(--cyan-glow)" strokeWidth="4"/>
        <line x1="300" y1="80" x2="330" y2="80" stroke="var(--cyan-glow)" strokeWidth="4"/>
        <circle cx="235" cy="80" r="4" fill="var(--alert-orange)"/>
        {biPeriod > 3 && <circle cx="275" cy="80" r="4" fill="var(--alert-orange)"/>}
        {biPeriod > 4 && <circle cx="315" cy="80" r="4" fill="var(--alert-orange)"/>}

        <text x="70" y={145 + sDrop} fill="#fff" fontSize="14">n s² 轨道</text>
        <line x1="260" y1={140 + sDrop} x2="290" y2={140 + sDrop} stroke="var(--pink-glow)" strokeWidth="4" style={{ transition: 'all 0.5s ease' }}/>
        <circle cx="268" cy={140 + sDrop} r="4" fill="var(--alert-orange)" style={{ transition: 'all 0.5s ease' }}/>
        <circle cx="282" cy={140 + sDrop} r="4" fill="var(--alert-orange)" style={{ transition: 'all 0.5s ease' }}/>

        {isHeavy && (
          <g>
            <path d={`M 200 80 Q 150 ${110 + sDrop/2} 240 ${140 + sDrop}`} fill="none" stroke="var(--alert-red)" strokeWidth="2" strokeDasharray="4"/>
            <text x="120" y="210" fill="var(--alert-red)" fontSize="14" fontWeight="bold">相对论效应收缩！</text>
            <text x="120" y="230" fill="var(--alert-red)" fontSize="12">6s² 电子被核紧紧吸附，变为惰性，Bi 仅表现 +3 价</text>
          </g>
        )}
        <defs>
          <marker id="arrow_pb" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
          </marker>
        </defs>
      </svg>
    );
  };

  // ==========================================
  // 样式定义 (采用安全注入方式防止报错)
  // ==========================================
  const innerStyles = `
    .pblock-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(15, 23, 42, 0.75); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --sz-gold: #fde047; --pink-glow: #ec4899; background: var(--bg-dark); color: #f8fafc; font-family: 'Segoe UI', sans-serif; line-height: 1.6; overflow-x: hidden; padding-bottom: 40px; }
    
    .pblock-wrapper h1, .pblock-wrapper h2, .pblock-wrapper h3 { color: var(--cyan-glow); margin-top: 0; }
    .pblock-wrapper h2 { border-left: 5px solid var(--primary-blue); padding-left: 10px; margin: 25px 0 15px 0; font-size: 1.4rem; }
    .pblock-wrapper section { padding: 30px 5%; border-bottom: 1px solid rgba(255,255,255,0.05); }
    
    .pblock-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .pblock-wrapper .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .pblock-wrapper .panel { background: var(--bg-panel); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
    .pblock-wrapper .svg-box { border: 2px dashed var(--primary-blue); border-radius: 12px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; min-height: 300px; display: flex; flex-direction: column; justify-content: center; }
    .pblock-wrapper .btn { background: linear-gradient(135deg, var(--primary-blue), var(--purple-med)); border: none; padding: 10px 20px; color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; margin-top: 10px; width: 100%; }
    .pblock-wrapper .btn:hover:not(:disabled) { box-shadow: 0 4px 15px rgba(59, 130, 246, 0.5); transform: translateY(-2px); }
    .pblock-wrapper .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .pblock-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; font-size: 13px; margin-right: 8px; }
    .pblock-wrapper .btn-outline:hover, .pblock-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); border-color: var(--cyan-glow); color: #fff; }
    
    .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
    .markdown-prose strong { color: var(--cyan-glow); }
    .markdown-prose sub, .markdown-prose sup { font-size: 0.8em; }
  `;

  return (
    <div className="pblock-wrapper">
      <style dangerouslySetInnerHTML={{ __html: innerStyles }} />

      {/* Hero Banner */}
      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #0f172a 0%, var(--bg-dark) 100%)', paddingTop: '50px', paddingBottom: '30px' }}>
        <h1 style={{ fontSize: '2.8rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>p 区元素：非金属的变幻与生命密码</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>“从惰性电子对的沉淀之谜，到自由基的心血管奇迹。这里是氧化还原与配位的终极战场。”</p>
      </section>

      {/* 知识图谱 */}
      <section>
        <h2>第一板块：p区元素核心通性</h2>
        <div className="grid-3">
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>⚛️ 结构与电负性</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>价电子构型为 ns<sup>2</sup>np<sup>1-6</sup>。包含所有非金属、半金属及部分主族金属。从左到右电负性显著增加，F 是电负性之王。它们呈现出极其多样的氧化态（如 Cl 的 -1 到 +7）。</p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>☠️ 毒性与生命必需</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>p区充满了剧毒物质（如 As、Pb、Tl、Cl<sub>2</sub>），但也包含了构建生命的基础框架（C、N、O、P、S）。它们的成药性往往在于其独特的分子轨道与配位能力。</p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>🛡️ 惰性电子对效应</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>在第 6 周期（如 Tl、Pb、Bi），由于相对论效应，ns<sup>2</sup> 电子穿透到核附近被紧紧束缚，不易参与成键。导致 Bi(V) 氧化性极强，而 Bi(III) 极其稳定。</p>
          </div>
        </div>
      </section>

      {/* M2: 硼族 BNCT */}
      <section>
        <h2>第二板块：硼族 (IIIA) —— 硼中子俘获治疗 (BNCT)</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--purple-med)' }}>定点清除癌细胞的“微型核爆”</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              硼的非金属性极强，常形成缺电子化合物。无放射性的 <sup>10</sup>B 同位素具有超高的热中子俘获截面。<br/><br/>
              <strong>医学奇迹：</strong>将含 <sup>10</sup>B 的药物（如 BPA）注射入体内，药物特异性富集在脑胶质瘤细胞内。随后用热中子束照射脑部，<sup>10</sup>B 吸收中子发生核裂变，瞬间释放出高能 α 粒子 (<sup>4</sup>He) 和 <sup>7</sup>Li 离子。<br/>
              这两种粒子的射程极短（约一个细胞直径），能在不伤及周围健康脑组织的情况下，从内部精准炸碎癌细胞！
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: 'var(--cyan-glow)', fontWeight: 'bold' }}>开启热中子束照射: {bnctPower}%</label>
              <input type="range" min="0" max="100" value={bnctPower} onChange={e => setBnctPower(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--cyan-glow)', marginTop: '10px' }}/>
            </div>
          </div>
          <div className="svg-box">{renderBNCT()}</div>
        </div>
      </section>

      {/* M3: 碳族 介孔硅 */}
      <section>
        <h2>第三板块：碳族 (IVA) —— 介孔二氧化硅 (MSNs) 递药系统</h2>
        <div className="grid-2">
          <div className="svg-box">{renderSilica()}</div>
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>硅的纳米级“运兵车”</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              碳族元素的氧化物，如二氧化硅 (SiO<sub>2</sub>)，在宏观上是沙子和玻璃，生物相容性极好。通过模板法合成的介孔二氧化硅纳米粒 (MSNs) 具有巨大的比表面积，内部管道可以装载大量化疗药物。<br/><br/>
              <strong>pH 响应释放：</strong>在 MSNs 表面装上“ZnO 纳米阀门”。在血液 (pH 7.4) 中，阀门紧闭；一旦被肿瘤细胞吞噬进入弱酸性的溶酶体 (pH 5.0)，ZnO 阀门溶解，药物释放，实现完美靶向！
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className={`btn-outline ${silicaPh === 7.4 ? 'active' : ''}`} onClick={() => setSilicaPh(7.4)}>血液循环 (pH 7.4)</button>
              <button className={`btn-outline ${silicaPh <= 6.0 ? 'active' : ''}`} style={{ borderColor: 'var(--alert-orange)', color: silicaPh<=6.0?'#fff':'var(--alert-orange)' }} onClick={() => setSilicaPh(5.0)}>肿瘤微环境 (pH 5.0)</button>
            </div>
          </div>
        </div>
      </section>

      {/* M4: 氮族 NO */}
      <section>
        <h2>第四板块：氮族 (VA) 诺奖分子 —— NO 自由基的心血管奇迹</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--alert-red)' }}>奇电子分子的跨膜渗透</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              一氧化氮 (NO) 拥有 11 个价电子，反键 π* 轨道上有一个未成对电子，是典型的自由基分子。<br/><br/>
              作为体积极小的中性气体，NO 能瞬间穿透细胞膜，结合平滑肌细胞中鸟苷酸环化酶 (sGC) 中心的 Fe<sup>2+</sup>，激活血管舒张。急救药<strong>硝酸甘油</strong>的作用机制正是迅速在体内分解释放 NO，挽救心绞痛患者。
            </p>
            <button className="btn" style={{ background: 'var(--alert-red)' }} onClick={triggerNO} disabled={vesselState === 'dilated'}>
              💊 舌下含服硝酸甘油 (释放 NO·)
            </button>
          </div>
          <div className="svg-box">
             <svg width="100%" height="250" viewBox="0 0 400 250">
              <text x="200" y="20" fill="var(--text-muted)" fontSize="14" textAnchor="middle">血管平滑肌截面</text>
              <rect x="100" y={vesselState === 'dilated' ? 65 : 95} width="200" height={vesselState === 'dilated' ? 120 : 60} fill="rgba(225,29,72,0.2)" stroke="var(--alert-red)" strokeWidth="4" style={{ transition: 'all 1s ease' }}/>
              <text x="200" y="130" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle">
                {vesselState === 'dilated' ? "血管极度扩张 (血压骤降)" : "血管正常收缩"}
              </text>
              {vesselState === 'dilated' && noParticles.map((p, i) => (
                <g key={`no_${i}`}>
                  <circle cx="100" cy="125" r="5" fill="var(--cyan-glow)">
                    <animate attributeName="cx" values={`100; ${100 + p.x + 100}`} dur={`${p.dur}s`} fill="freeze" />
                    <animate attributeName="cy" values={`125; ${p.y}`} dur={`${p.dur}s`} fill="freeze" />
                    <animate attributeName="opacity" values="1; 0" dur={`${p.dur}s`} fill="freeze" />
                  </circle>
                  <text x="100" y="125" fill="#fff" fontSize="8" fontWeight="bold">
                    <tspan>NO·</tspan>
                    <animate attributeName="x" values={`100; ${100 + p.x + 100}`} dur={`${p.dur}s`} fill="freeze" />
                    <animate attributeName="y" values={`125; ${p.y}`} dur={`${p.dur}s`} fill="freeze" />
                    <animate attributeName="opacity" values="1; 0" dur={`${p.dur}s`} fill="freeze" />
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* M5: 氮族 As2O3 */}
      <section>
        <h2>第五板块：氮族 (VA) 毒与药 —— 砒霜 (As₂O₃) 靶向白血病</h2>
        <div className="grid-2">
          <div className="svg-box">
             <svg width="100%" height="250" viewBox="0 0 400 250">
              <text x="200" y="30" fill="var(--text-muted)" fontSize="14" textAnchor="middle">PML-RARA 融合致癌蛋白 (含丰富 -SH 巯基)</text>
              {asState === 'mutant' && (
                <g>
                  <path d="M 120 120 C 120 70, 280 70, 280 120 C 280 170, 120 170, 120 120" fill="rgba(245,158,11,0.3)" stroke="var(--alert-orange)" strokeWidth="3"/>
                  <text x="200" y="125" fill="var(--alert-orange)" fontSize="16" fontWeight="bold" textAnchor="middle">异常增殖蛋白 (导致白血病)</text>
                  <circle cx="160" cy="90" r="4" fill="var(--life-green)"/><text x="160" y="85" fill="var(--life-green)" fontSize="12">-SH</text>
                  <circle cx="240" cy="90" r="4" fill="var(--life-green)"/><text x="240" y="85" fill="var(--life-green)" fontSize="12">-SH</text>
                </g>
              )}
              {asState === 'binding' && (
                <g>
                  <path d="M 120 120 C 120 70, 280 70, 280 120 C 280 170, 120 170, 120 120" fill="rgba(245,158,11,0.3)" stroke="var(--alert-orange)" strokeWidth="3"/>
                  <circle cx="200" cy="70" r="10" fill="var(--cyan-glow)"/>
                  <text x="200" y="74" fill="#fff" fontSize="10" textAnchor="middle">As³⁺</text>
                  <line x1="200" y1="70" x2="160" y2="90" stroke="var(--cyan-glow)" strokeWidth="2" strokeDasharray="2"/>
                  <line x1="200" y1="70" x2="240" y2="90" stroke="var(--cyan-glow)" strokeWidth="2" strokeDasharray="2"/>
                  <text x="200" y="130" fill="var(--cyan-glow)" fontSize="14" fontWeight="bold" textAnchor="middle">As³⁺ 与巯基特异性螯合！</text>
                </g>
              )}
              {asState === 'degraded' && (
                <g>
                  <path d="M 120 120 C 120 90, 160 90, 160 120 C 160 150, 120 150, 120 120" fill="rgba(71,85,105,0.3)" stroke="#475569" strokeWidth="2"/>
                  <path d="M 240 120 C 240 90, 280 90, 280 120 C 280 150, 240 150, 240 120" fill="rgba(71,85,105,0.3)" stroke="#475569" strokeWidth="2"/>
                  <text x="200" y="125" fill="var(--life-green)" fontSize="16" fontWeight="bold" textAnchor="middle">蛋白泛素化降解，癌细胞凋亡！</text>
                </g>
              )}
            </svg>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--alert-orange)' }}>以毒攻毒的配位化学</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              中国科学家的伟大贡献：急性早幼粒细胞白血病 (APL) 是由于染色体易位产生了致癌的 <strong>PML-RARA 融合蛋白</strong>。<br/><br/>
              砒霜的有效成分亚砷酸 (As<sup>3+</sup>) 能够以极高的亲和力，特异性地与该致癌蛋白富半胱氨酸区域的<strong>巯基 (-SH)</strong> 发生配位结合。<br/>
              这导致致癌蛋白构象崩溃并被降解，癌细胞被迫分化凋亡，实现了近 100% 的临床治愈率！
            </p>
            <button className="btn" style={{ background: 'var(--cyan-glow)', color: '#0f172a' }} onClick={triggerAs} disabled={asState !== 'mutant'}>
              🔬 注入 As₂O₃ 靶向治疗
            </button>
          </div>
        </div>
      </section>

      {/* M6: 氧族 PDT */}
      <section>
        <h2>第六板块：氧族 (VIA) —— 光动力疗法 (PDT) 单线态氧杀伤</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--pink-glow)' }}>“点亮”肿瘤的死神之光</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              基态氧气分子 (O<sub>2</sub>) 含有两个平行的未成对电子，处于三线态 (<sup>3</sup>O<sub>2</sub>)。<br/><br/>
              <strong>PDT 疗法原理：</strong>向患者体内注射光敏剂 (PS)。PS 富集于肿瘤后，用 630nm 激光照射，PS 被激发并将能量传递给基态氧分子。氧分子的自旋发生翻转，变成了极其活泼、剧毒的<strong>单线态氧 (<sup>1</sup>O<sub>2</sub>)</strong>！<br/>
              它能瞬间氧化撕裂肿瘤细胞膜和线粒体，是一种无创且不耐药的极具前景的癌症疗法。
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: 'var(--alert-red)', fontWeight: 'bold' }}>调节 630nm 激光激发功率：{pdtLight}%</label>
              <input type="range" min="0" max="100" value={pdtLight} onChange={e => setPdtLight(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--alert-red)', marginTop: '10px' }}/>
            </div>
          </div>
          <div className="svg-box">{renderPDT()}</div>
        </div>
      </section>

      {/* M7: 卤族 氟代药物 */}
      <section>
        <h2>第七板块：卤族 (VIIA) —— 氟 (F) 元素在药物化学中的神迹</h2>
        <div className="grid-2">
          <div className="svg-box">{renderFluorine()}</div>
          <div className="panel">
            <h3 style={{ color: 'var(--life-green)' }}>史上最强电负性的盾牌</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              现代小分子药物中，超过 20% 含有氟元素（如百忧解、氟苯尼考）。氟原子电负性极高 (4.0)，且 C-F 键能极大 (485 kJ/mol)。<br/><br/>
              <strong>阻断代谢降解：</strong>肝脏的细胞色素 P450 酶负责降解清除外来药物。如果把药物分子上容易被酶攻击断裂的 C-H 键替换为极其坚固的 C-F 键，就能抵御酶的破坏，极大延长药物在体内的半衰期！
            </p>
            <button className="btn" style={{ background: 'var(--life-green)' }} onClick={() => setHasFluorine(!hasFluorine)}>
              {hasFluorine ? "🛡️ 移除氟原子 (恢复易感态)" : "🛡️ 氟代修饰 (阻断代谢)"}
            </button>
          </div>
        </div>
      </section>

      {/* M8: 稀有气体超极化 MRI */}
      <section>
        <h2>第八板块：稀有气体 (VIIIA) —— 超极化 ¹²⁹Xe MRI 显像</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--sz-gold)' }}>点亮肺部的“惰性呼吸”</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              稀有气体氙 (Xe) 化学性质极度惰性，且能安全吸入。<br/><br/>
              肺部充满空气，水分子极少，传统 MRI 在肺部是一片黑洞盲区。科学家通过激光射频光泵浦技术，将 <sup>129</sup>Xe 的核自旋信号增强十万倍（<strong>超极化技术</strong>）。<br/>
              患者吸入超极化氙气后，肺部的气体流动、死腔和微血管交换立刻在核磁影像上绽放出耀眼的金光！这是 COPD 和哮喘诊断的革命。
            </p>
            <button className="btn" style={{ background: 'var(--sz-gold)', color: '#000', marginTop: '15px' }} onClick={triggerXe} disabled={xeState !== 'idle'}>
              🫁 吸入超极化 ¹²⁹Xe
            </button>
          </div>
          <div className="svg-box">{renderXeMRI()}</div>
        </div>
      </section>

      {/* M9: 惰性电子对 (铋剂) */}
      <section>
        <h2>第九板块：相对论物理化学 —— 惰性电子对效应与护胃神药铋剂</h2>
        <div className="grid-2">
          <div className="svg-box">{renderInertPairSVG()}</div>
          <div className="panel">
            <h3 style={{ color: 'var(--alert-red)' }}>为什么铋 (Bi) 是无毒的安全金属？</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              同为氮族，氮(N)和磷(P)的 +5 价极其稳定，但到了第六周期的铋(Bi, Z=83)，其 6s<sup>2</sup> 电子产生了强烈的<strong>相对论收缩效应</strong>，被核死死吸住，不参与成键。<br/><br/>
              因此，Bi<sup>3+</sup> 是它最稳定的形态。<strong>枸橼酸铋钾</strong>进入强酸胃液中，不仅不会被氧化出毒性，反而水解生成极难溶的 <strong>BiOCl</strong> 沉淀。它像装甲一样覆盖在胃溃疡表面，还能彻底杀灭幽门螺杆菌！
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: 'var(--alert-red)', fontWeight: 'bold' }}>调节所处周期 (观察 ns 轨道下沉): {biPeriod}</label>
              <input type="range" min="3" max="6" value={biPeriod} onChange={e => setBiPeriod(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--alert-red)', marginTop: '10px' }}/>
            </div>
          </div>
        </div>
      </section>

      {/* AI Bot 窗口 */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--cyan-glow), var(--purple-med))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', cursor: 'pointer', zIndex: 100, boxShadow: '0 0 20px rgba(6,182,212,0.5)' }}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block', position: 'fixed', bottom: '100px', right: '30px', width: '350px', background: 'var(--bg-dark)', border: '1px solid var(--purple-med)', borderRadius: '12px', padding: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '15px' }}>p区化学与医学 AI 导师</h3>
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
            <input type="text" placeholder="输入问题..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #3b82f6', background: '#1e293b', color: '#fff', outline: 'none' }} />
            <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'var(--purple-med)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span></button>
          </div>
        </div>
      )}
    </div>
  );
}