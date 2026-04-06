import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function StructureProperty() {
  // ==========================================
  // 状态管理区
  // ==========================================

  // Module 1: MOFs 光学性质 (天线效应)
  const [optMetal, setOptMetal] = useState('Eu'); // 'Eu', 'Tb', 'Zn'
  const [optLigand, setOptLigand] = useState('BTC'); // 'BTC', 'BDC'

  // Module 2: MRI 造影剂设计 (晶体场博弈)
  const [cftField, setCftField] = useState('weak'); // 'weak', 'strong'

  // Module 3: pH 响应型纳米药物递送
  const [phEnv, setPhEnv] = useState(7.4); // 7.4 (血液), 5.5 (肿瘤)

  // AI 助教
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是材料化学与药学交叉 AI 导师。这里展示了物质微观“组成-结构”如何决定宏观“性能-药效”。\n\n关于“稀土天线效应”、“晶体场分裂能”或“肿瘤微环境靶向释药”，随时提问！' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 核心计算与数据预处理
  // ==========================================

  // M1 逻辑处理
  let m1Color = '#94a3b8';
  let m1Title = '', m1Optics = '', m1Mech = '';
  if (optMetal === 'Eu' && optLigand === 'BTC') {
    m1Color = '#ef4444'; // 红色
    m1Title = 'Eu-BTC 框架 (发出耀眼红光)';
    m1Optics = '在紫外光激发下，呈现极强的特征红色荧光（主要来自 ⁵D₀ → ⁷F₂ 跃迁）。';
    m1Mech = '【天线效应】BTC配体具有极高的摩尔吸光系数，它像“天线”一样吸收紫外光能量，通过系间窜跃（ISC）将能量传递给 Eu³⁺ 的激发态，极大放大了稀土发光！';
  } else if (optMetal === 'Tb' && optLigand === 'BTC') {
    m1Color = '#10b981'; // 绿色
    m1Title = 'Tb-BTC 框架 (发出耀眼绿光)';
    m1Optics = '在紫外光激发下，呈现明亮的特征绿色荧光（主要来自 ⁵D₄ → ⁷F₅ 跃迁）。';
    m1Mech = '【天线效应匹配】BTC配体的三重态能级与 Tb³⁺ 的激发态能级完美匹配，能量传递效率极高，因此绿光极其明亮。';
  } else if (optMetal === 'Zn' && optLigand === 'BDC') {
    m1Color = '#f8fafc'; // 白色/无色
    m1Title = '经典 MOF-5 (无稀土特征发光)';
    m1Optics = '无显著的锐线荧光，仅表现为配体本身的微弱宽峰发光。';
    m1Mech = '【缺乏能级跃迁】Zn²⁺ 是 d¹⁰ 电子构型，没有 f-f 跃迁能级，无法像稀土离子那样接受配体的能量转移产生锐利的线状发光。';
  } else {
    m1Color = '#f59e0b'; // 橙色/警告
    m1Title = `${optMetal}-${optLigand} 框架 (发光猝灭/较弱)`;
    m1Optics = '荧光十分微弱或被完全猝灭。';
    m1Mech = '【能级不匹配】该配体的三重态能级过低，导致能量无法有效传递给中心金属离子，甚至发生能量回传（反向能量传递），导致天线效应失效。';
  }

  // M2 逻辑处理
  const isWeak = cftField === 'weak';
  const m2DeltaO = isWeak ? 10000 : 30000;
  const m2Spin = isWeak ? "高自旋 (t₂g³ e_g²)" : "低自旋 (t₂g⁶ e_g⁰)";
  const m2Unpaired = isWeak ? 5 : 0;
  const m2Cfse = isWeak ? "0 Δo (极不稳定)" : "-2.4 Δo + 2P (极其稳定)";

  // M3 药物粒子缓存
  const drugParticles = useMemo(() => Array.from({ length: 20 }).map(() => ({
    x: (Math.random() - 0.5) * 60, y: Math.random() * 60, dur: 1 + Math.random(), vx: (Math.random() - 0.5) * 40
  })), []);

  // ==========================================
  // SVG 渲染器
  // ==========================================

  // M1: MOFs 天线效应 SVG
  const renderOpticsSVG = () => {
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        {/* 紫外光激发 */}
        <path d="M 20 20 L 150 100" stroke="var(--purple-med)" strokeWidth="4" strokeDasharray="10 5">
          <animate attributeName="stroke-dashoffset" from="15" to="0" dur="0.5s" repeatCount="indefinite"/>
        </path>
        <text x="40" y="40" fill="var(--purple-med)" fontSize="14" fontWeight="bold">紫外光 (UV)</text>

        {/* 晶体发光 */}
        <g transform="translate(200, 125)">
          <circle cx="0" cy="0" r="50" fill="none" stroke={m1Color} strokeWidth="4" filter={`drop-shadow(0 0 15px ${m1Color})`}/>
          <polygon points="0,-40 35,20 -35,20" fill="rgba(255,255,255,0.1)" stroke={m1Color} strokeWidth="2"/>
          <polygon points="0,40 35,-20 -35,-20" fill="rgba(255,255,255,0.1)" stroke={m1Color} strokeWidth="2"/>
          <circle cx="0" cy="0" r="15" fill={m1Color}/>
          <text x="0" y="5" fill="#000" fontSize="12" fontWeight="bold" textAnchor="middle">{optMetal}</text>
          
          {/* 发光波纹 */}
          {(optMetal === 'Eu' || (optMetal === 'Tb' && optLigand === 'BTC')) && (
            <circle cx="0" cy="0" r="50" fill="none" stroke={m1Color} strokeWidth="2">
              <animate attributeName="r" values="50; 120" dur="1.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="1; 0" dur="1.5s" repeatCount="indefinite"/>
            </circle>
          )}
        </g>
        <text x="200" y="220" fill={m1Color} fontSize="16" fontWeight="bold" textAnchor="middle">{m1Title}</text>
      </svg>
    );
  };

  // M2: MRI 晶体场博弈 SVG
  const renderCFTSVG = () => {
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <text x="200" y="20" fill="var(--text-muted)" fontSize="14" textAnchor="middle">八面体晶体场能级分裂</text>
        
        {/* 能级分裂示意 */}
        <text x="30" y="140" fill="var(--text-muted)" fontSize="12">能量 E</text>
        <line x1="50" y1="230" x2="50" y2="40" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow_cft)"/>

        {/* eg 轨道 */}
        <line x1="180" y1={isWeak ? 100 : 50} x2="220" y2={isWeak ? 100 : 50} stroke="var(--cyan-glow)" strokeWidth="3" style={{ transition: 'all 0.5s' }}/>
        <line x1="240" y1={isWeak ? 100 : 50} x2="280" y2={isWeak ? 100 : 50} stroke="var(--cyan-glow)" strokeWidth="3" style={{ transition: 'all 0.5s' }}/>
        <text x="310" y={isWeak ? 105 : 55} fill="#fff" fontSize="12" style={{ transition: 'all 0.5s' }}>e_g</text>

        {/* t2g 轨道 */}
        <line x1="150" y1={isWeak ? 150 : 200} x2="190" y2={isWeak ? 150 : 200} stroke="var(--cyan-glow)" strokeWidth="3" style={{ transition: 'all 0.5s' }}/>
        <line x1="210" y1={isWeak ? 150 : 200} x2="250" y2={isWeak ? 150 : 200} stroke="var(--cyan-glow)" strokeWidth="3" style={{ transition: 'all 0.5s' }}/>
        <line x1="270" y1={isWeak ? 150 : 200} x2="310" y2={isWeak ? 150 : 200} stroke="var(--cyan-glow)" strokeWidth="3" style={{ transition: 'all 0.5s' }}/>
        <text x="340" y={isWeak ? 155 : 205} fill="#fff" fontSize="12" style={{ transition: 'all 0.5s' }}>t_2g</text>

        {/* 电子排布 */}
        <g style={{ transition: 'all 0.5s' }}>
          {isWeak ? (
            <g>
              <circle cx="200" cy="95" r="4" fill="var(--sz-gold)"/>
              <circle cx="260" cy="95" r="4" fill="var(--sz-gold)"/>
              <circle cx="170" cy="145" r="4" fill="var(--sz-gold)"/>
              <circle cx="230" cy="145" r="4" fill="var(--sz-gold)"/>
              <circle cx="290" cy="145" r="4" fill="var(--sz-gold)"/>
            </g>
          ) : (
            <g>
              <circle cx="165" cy="195" r="4" fill="var(--sz-gold)"/>
              <circle cx="175" cy="205" r="4" fill="var(--life-green)"/>
              <circle cx="225" cy="195" r="4" fill="var(--sz-gold)"/>
              <circle cx="235" cy="205" r="4" fill="var(--life-green)"/>
              <circle cx="285" cy="195" r="4" fill="var(--sz-gold)"/>
              <circle cx="295" cy="205" r="4" fill="var(--life-green)"/>
            </g>
          )}
        </g>
        
        {/* Δo 标记 */}
        <path d={`M 130 ${isWeak ? 100 : 50} L 130 ${isWeak ? 150 : 200}`} fill="none" stroke="var(--alert-red)" strokeWidth="2" strokeDasharray="4"/>
        <text x="100" y="130" fill="var(--alert-red)" fontSize="14" fontWeight="bold">Δo</text>

        <defs>
          <marker id="arrow_cft" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
          </marker>
        </defs>
      </svg>
    );
  };

  // M3: pH 响应递送 SVG
  const renderPHDeliverySVG = () => {
    const isAcidic = phEnv === 5.5;
    return (
      <svg width="100%" height="280" viewBox="0 0 400 280">
        <text x="200" y="20" fill="var(--text-muted)" fontSize="14" textAnchor="middle">配位键的质子化断裂机制</text>

        {/* MOF 载体框架 */}
        <g transform="translate(200, 150)">
          {/* 外壳 */}
          <circle cx="0" cy="0" r="70" fill="none" stroke="var(--cyan-glow)" strokeWidth="4" strokeDasharray={isAcidic ? "10 20" : "0 0"} style={{ transition: 'all 1s ease', opacity: isAcidic ? 0.3 : 1 }}/>
          
          {/* 配体与金属节点的连线 */}
          <path d="M 0 -70 L 0 -40 M 60 -35 L 35 -20 M 60 35 L 35 20 M 0 70 L 0 40 M -60 35 L -35 20 M -60 -35 L -35 -20" stroke="var(--life-green)" strokeWidth="3" style={{ opacity: isAcidic ? 0 : 1, transition: 'all 0.5s ease' }}/>
          
          {isAcidic && (
            <text x="0" y="-80" fill="var(--alert-red)" fontSize="12" fontWeight="bold" textAnchor="middle">H⁺ 质子化攻击！配位键断裂！</text>
          )}

          {/* 药物释放动画 */}
          {drugParticles.map((p, i) => (
            <circle key={`d_${i}`} cx={isAcidic ? p.vx * 2 : p.x} cy={isAcidic ? -p.y * 3 : p.y - 30} r="4" fill="var(--pink-glow)" style={{ transition: 'all 1.5s ease-out' }}>
               {isAcidic && <animate attributeName="opacity" values="1;0" dur={`${p.dur + 1}s`} fill="freeze"/>}
            </circle>
          ))}
        </g>
        
        <text x="200" y="250" fill={isAcidic ? "var(--life-green)" : "var(--text-muted)"} fontSize="16" fontWeight="bold" textAnchor="middle">
          {isAcidic ? "肿瘤酸性微环境：MOF 解体，精准释放药物！" : "血液微环境：MOF 坚固，安全锁死药物"}
        </text>
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
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在检索晶体场理论与材料学前沿数据库...' }]);

    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, '化学物质构效关系与医药应用');
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
    <div className="structure-wrapper">
      <style>{`
        .structure-wrapper { --bg-dark: #0f172a; --bg-panel: rgba(30, 41, 59, 0.75); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --sz-gold: #fbbf24; --pink-glow: #ec4899; background: var(--bg-dark); color: #f8fafc; font-family: 'Segoe UI', sans-serif; line-height: 1.6; overflow-x: hidden; }
        
        .structure-wrapper h1, .structure-wrapper h2, .structure-wrapper h3 { color: var(--cyan-glow); margin-top: 0; }
        .structure-wrapper h2 { border-left: 5px solid var(--primary-blue); padding-left: 10px; margin: 30px 0 20px 0; font-size: 1.5rem; color: #fff;}
        .structure-wrapper section { padding: 40px 5%; border-bottom: 1px solid rgba(255,255,255,0.05); }
        
        .structure-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .structure-wrapper .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .structure-wrapper .panel { background: var(--bg-panel); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .structure-wrapper .svg-box { border: 2px dashed var(--primary-blue); border-radius: 12px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; min-height: 280px; display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
        
        .structure-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; font-size: 13px; margin-right: 8px; margin-bottom: 8px; }
        .structure-wrapper .btn-outline:hover, .structure-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); color: #fff; }
        
        .structure-wrapper select { background: #1e293b; color: #fff; border: 1px solid var(--cyan-glow); padding: 8px; border-radius: 6px; outline: none; margin-bottom: 15px; width: 100%; }
        
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        .markdown-prose strong { color: var(--cyan-glow); }
        .markdown-prose sub, .markdown-prose sup { font-size: 0.8em; }
        
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        .hero-mof { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* Hero Banner */}
      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', paddingTop: '60px', paddingBottom: '40px' }}>
        <svg width="200" height="150" viewBox="0 0 200 150" className="hero-mof" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 15px var(--cyan-glow))' }}>
          <polygon points="100,10 160,50 160,110 100,140 40,110 40,50" fill="none" stroke="var(--cyan-glow)" strokeWidth="4" strokeDasharray="5 5"/>
          <line x1="100" y1="10" x2="100" y2="140" stroke="var(--purple-med)" strokeWidth="2"/>
          <line x1="40" y1="50" x2="160" y2="110" stroke="var(--purple-med)" strokeWidth="2"/>
          <line x1="160" y1="50" x2="40" y2="110" stroke="var(--purple-med)" strokeWidth="2"/>
          <circle cx="100" cy="75" r="15" fill="var(--pink-glow)"/>
        </svg>
        <h1 style={{ fontSize: '3rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '20px 0' }}>组成、结构与性能：物质的密码</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto' }}>“从 MOFs 的光学天线到核磁共振的晶体场博弈，结构不仅决定性能，更决定了拯救生命的潜力。”</p>
      </section>

      {/* Module 1: MOFs 光学性质 */}
      <section>
        <h2>模块一：配位发光 —— MOFs 稀土天线效应 (Antenna Effect)</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--pink-glow)' }}>配体设计的能量传递艺术</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              稀土离子 (如 Eu³⁺, Tb³⁺) 发光颜色极纯，但它们直接吸收紫外光的能力极差 (f-f 禁阻跃迁)。<br/><br/>
              <strong>解法：</strong>引入具有大共轭 π 键的有机配体 (如 BTC) 形成 MOFs。配体作为“天线”大量吸收紫外光，然后通过系统内的能量传递将其交给稀土离子，瞬间爆发强烈的特征荧光！
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', color: 'var(--cyan-glow)', marginBottom: '5px' }}>1. 选择中心金属离子：</label>
              <select value={optMetal} onChange={(e) => setOptMetal(e.target.value)}>
                <option value="Eu">铕 (Eu³⁺) - 寻求发红光</option>
                <option value="Tb">铽 (Tb³⁺) - 寻求发绿光</option>
                <option value="Zn">锌 (Zn²⁺) - 对照组 d¹⁰</option>
              </select>

              <label style={{ display: 'block', color: 'var(--cyan-glow)', marginBottom: '5px' }}>2. 选择有机配体 (天线)：</label>
              <select value={optLigand} onChange={(e) => setOptLigand(e.target.value)}>
                <option value="BTC">均苯三甲酸 (BTC) - 三重态能级完美匹配</option>
                <option value="BDC">对苯二甲酸 (BDC) - 能级不匹配</option>
              </select>
            </div>
            
            <div style={{ background: '#020617', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
              <strong style={{ color: m1Color }}>光学现象：</strong><span style={{ color: '#fff', fontSize: '13px' }}>{m1Optics}</span><br/>
              <strong style={{ color: 'var(--alert-orange)' }}>机理解析：</strong><span style={{ color: '#cbd5e1', fontSize: '13px' }}>{m1Mech}</span>
            </div>
          </div>
          <div className="svg-box">{renderOpticsSVG()}</div>
        </div>
      </section>

      {/* Module 2: MRI 晶体场博弈 */}
      <section>
        <h2>模块二：临床核磁共振 (MRI) —— 晶体场理论的生死博弈</h2>
        <div className="grid-2">
          <div className="svg-box">{renderCFTSVG()}</div>
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>医用造影剂设计的“不可能三角”</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              MRI 造影剂需要中心金属 (如 Fe²⁺) 拥有尽量多的<strong>未成对电子</strong>，以产生强顺磁性缩短水质子 T2 弛豫时间。<br/><br/>
              <strong>化学家的困境 (认知冲突)：</strong><br/>
              - 若使用<strong>弱场配体</strong>：晶体场分裂能 (Δo) 小于电子成对能 (P)，电子趋向占满所有轨道形成<strong>高自旋</strong>。造影效果极好，但 CFSE 为 0，极易解离出剧毒的游离金属离子入血！<br/>
              - 若使用<strong>强场配体</strong>：Δo 大于 P，电子被迫挤在下层轨道配对形成<strong>低自旋</strong>。络合物坚如磐石（无毒），但未成对电子清零，失去顺磁性，造影失败！
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className={`btn-outline ${cftField === 'weak' ? 'active' : ''}`} style={{ borderColor: 'var(--alert-orange)' }} onClick={() => setCftField('weak')}>使用弱场配体 (如 H₂O)</button>
              <button className={`btn-outline ${cftField === 'strong' ? 'active' : ''}`} style={{ borderColor: 'var(--life-green)' }} onClick={() => setCftField('strong')}>使用强场配体 (如 CN⁻)</button>
            </div>
            
            <div style={{ background: '#020617', padding: '15px', borderRadius: '8px', marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>自旋状态:</span><br/><strong style={{ color: '#fff' }}>{m2Spin}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>未成对电子数 (n):</span><br/><strong style={{ color: isWeak ? 'var(--alert-orange)' : 'var(--alert-red)' }}>{m2Unpaired}</strong></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>晶体场稳定化能 (CFSE):</span><br/><strong style={{ color: isWeak ? 'var(--alert-red)' : 'var(--life-green)' }}>{m2Cfse}</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* Module 3: pH 响应纳米药物递送 */}
      <section>
        <h2>模块三：智能材料 —— CADD 辅助的 pH 响应型药物递送</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--life-green)' }}>利用配位键的质子化实现“定向爆破”</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              基于模块二的晶体场理论，计算机辅助药物设计 (CADD) 筛选出一种特殊的配体构建 MOF 药物载体。<br/><br/>
              <strong>靶向原理：</strong><br/>
              正常血液微环境 (pH 7.4) 中，MOF 配位键极强，安全包裹化疗药物在血管中穿梭。<br/>
              到达肿瘤微环境 (因无氧糖酵解产生乳酸，pH 约 5.5) 时，H⁺ 大量涌入。H⁺ 会与配体竞争性结合（配体质子化），导致金属-配体键断裂，CFSE 发生断崖式下跌，MOF 框架瞬间瓦解，将药物精准倾泻在癌细胞内！
            </p>
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #334155', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '10px' }}>当前药物所处环境</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <button className={`btn-outline ${phEnv === 7.4 ? 'active' : ''}`} onClick={() => setPhEnv(7.4)}>人体血液循环 (pH 7.4)</button>
                <button className={`btn-outline ${phEnv === 5.5 ? 'active' : ''}`} style={{ borderColor: 'var(--alert-red)', color: phEnv===5.5?'#fff':'var(--alert-red)', backgroundColor: phEnv===5.5?'var(--alert-red)':'transparent' }} onClick={() => setPhEnv(5.5)}>到达肿瘤病灶 (pH 5.5)</button>
              </div>
            </div>
          </div>
          <div className="svg-box" style={{ background: '#020617' }}>{renderPHDeliverySVG()}</div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--cyan-glow), var(--purple-med))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', cursor: 'pointer', zIndex: 100, boxShadow: '0 0 20px rgba(6,182,212,0.5)' }}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block', position: 'fixed', bottom: '100px', right: '30px', width: '350px', background: 'var(--bg-dark)', border: '1px solid var(--purple-med)', borderRadius: '12px', padding: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '15px' }}>构效关系 AI 导师</h3>
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
            <input type="text" placeholder="输入你想探讨的构效关系..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#1e293b', color: '#fff', outline: 'none' }} />
            <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'var(--primary-blue)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span></button>
          </div>
        </div>
      )}
    </div>
  );
}