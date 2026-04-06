import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function BufferSolution() {
  // ==========================================
  // 状态管理区
  // ==========================================
  
  // 模块一：微观缓冲抗性机制
  const [mechAction, setMechAction] = useState('none'); // 'none', 'acid', 'base'
  
  // 模块二：虚拟实验室 Tabs & States
  const [labTab, setLabTab] = useState('task1');
  
  // Task 1: 寻找 pH 5.0
  const [t1Pka, setT1Pka] = useState(4.76);
  const [t1LogRatio, setT1LogRatio] = useState(0); // 对应 log([A-]/[HA]), 范围 -1 到 1
  
  // Task 2: 缓冲能力厚度测试
  const [t2Conc, setT2Conc] = useState(1.0); // 1.0M or 0.1M
  const [t2Drops, setT2Drops] = useState(0); // 加入的 NaOH 滴数
  
  // Task 3: 纯水对比
  const [t3Drops, setT3Drops] = useState(0);

  // 模块三：医药前沿探究
  const [appTab, setAppTab] = useState('nano');
  const [nanoEnv, setNanoEnv] = useState('normal'); // 'normal' (pH 7.4), 'tumor' (pH 6.5)

  // AI 助教
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '欢迎来到缓冲溶液与生命工程实验舱！关于 H-H 方程推导、血液缓冲系统或 pH 靶向纳米药物，随时向我提问！' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 核心计算与机制动画
  // ==========================================

  // 模块一动画控制
  const triggerMech = (action) => {
    setMechAction(action);
    setTimeout(() => setMechAction('none'), 2500); // 2.5秒后重置
  };

  const renderMechanism = () => {
    // 渲染微观粒子碰撞
    return (
      <svg width="100%" height="200" viewBox="0 0 400 200">
        {/* 背景溶液 */}
        <rect x="50" y="50" width="300" height="150" rx="10" fill="rgba(6,182,212,0.1)" stroke="var(--primary-blue)" strokeWidth="2"/>
        <text x="200" y="40" fill="var(--cyan-glow)" fontSize="14" textAnchor="middle" fontWeight="bold">微观“化学海绵”机制：同离子效应的绝对防御</text>

        {/* 静态本底粒子 */}
        <circle cx="120" cy="120" r="15" fill="var(--purple-med)" opacity="0.6"/><text x="120" y="124" fill="#fff" fontSize="12" textAnchor="middle">HA</text>
        <circle cx="280" cy="140" r="15" fill="var(--life-green)" opacity="0.6"/><text x="280" y="144" fill="#fff" fontSize="12" textAnchor="middle">A⁻</text>
        <circle cx="160" cy="170" r="15" fill="var(--purple-med)" opacity="0.6"/><text x="160" y="174" fill="#fff" fontSize="12" textAnchor="middle">HA</text>
        <circle cx="240" cy="90" r="15" fill="var(--life-green)" opacity="0.6"/><text x="240" y="94" fill="#fff" fontSize="12" textAnchor="middle">A⁻</text>

        {/* 动画组 */}
        {mechAction === 'acid' && (
          <g>
            <circle cx="200" cy="10" r="12" fill="var(--alert-red)"><animate attributeName="cy" values="10; 130" dur="1s" fill="freeze"/></circle>
            <text x="200" y="14" fill="#fff" fontSize="12" textAnchor="middle"><animate attributeName="y" values="14; 134" dur="1s" fill="freeze"/>H⁺</text>
            <path d="M 280 140 Q 240 160 210 130" fill="none" stroke="var(--life-green)" strokeWidth="2" strokeDasharray="4"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s"/></path>
            <text x="200" y="180" fill="var(--alert-orange)" fontSize="14" fontWeight="bold" textAnchor="middle" opacity="0"><animate attributeName="opacity" values="0;0;1" keyTimes="0;0.5;1" dur="2s" fill="freeze"/>H⁺ + A⁻ ➔ HA (被吸收!)</text>
          </g>
        )}

        {mechAction === 'base' && (
          <g>
            <circle cx="200" cy="10" r="12" fill="var(--pink-glow)"><animate attributeName="cy" values="10; 110" dur="1s" fill="freeze"/></circle>
            <text x="200" y="14" fill="#fff" fontSize="10" textAnchor="middle"><animate attributeName="y" values="14; 114" dur="1s" fill="freeze"/>OH⁻</text>
            <path d="M 120 120 Q 150 100 190 110" fill="none" stroke="var(--purple-med)" strokeWidth="2" strokeDasharray="4"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s"/></path>
            <text x="200" y="180" fill="var(--alert-orange)" fontSize="14" fontWeight="bold" textAnchor="middle" opacity="0"><animate attributeName="opacity" values="0;0;1" keyTimes="0;0.5;1" dur="2s" fill="freeze"/>OH⁻ + HA ➔ A⁻ + H₂O (被中和!)</text>
          </g>
        )}
      </svg>
    );
  };

  // ==========================================
  // 虚拟实验 Tasks 逻辑
  // ==========================================
  const t1Ratio = Math.pow(10, t1LogRatio);
  const t1Ph = t1Pka + t1LogRatio;
  const isT1Success = t1Pka === 4.76 && Math.abs(t1Ph - 5.0) < 0.02;

  const t2InitHA = t2Conc / 2;
  const t2InitA = t2Conc / 2;
  const t2AddedBase = t2Drops * 0.01; // 每滴 0.01M
  const t2CurrentHA = Math.max(0.0001, t2InitHA - t2AddedBase);
  const t2CurrentA = t2InitA + t2AddedBase;
  const t2Ph = 4.76 + Math.log10(t2CurrentA / t2CurrentHA);
  const isT2Destroyed = t2CurrentHA <= 0.0001;

  const t3Ph = t3Drops === 0 ? 7.0 : 14 + Math.log10(t3Drops * 0.01);

  const renderLabScreen = () => {
    if (labTab === 'task1') {
      return (
        <div style={{ padding: '20px', width: '100%', height: '100%' }}>
          <h3 style={{ color: 'var(--cyan-glow)', textAlign: 'center', marginTop: 0 }}>挑战一：配制完美 pH = 5.0 的缓冲液</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px' }}>
              <label style={{ color: '#fff', fontSize: '13px' }}>1. 选择弱酸的 pKa：</label>
              <select value={t1Pka} onChange={e => setT1Pka(parseFloat(e.target.value))} style={{ width: '100%', padding: '6px', background: '#1e293b', color: '#fff', border: '1px solid var(--primary-blue)', margin: '8px 0 15px' }}>
                <option value={3.75}>甲酸 (pKa = 3.75)</option>
                <option value={4.76}>醋酸 (pKa = 4.76)</option>
                <option value={7.20}>磷酸二氢根 (pKa = 7.20)</option>
                <option value={9.25}>铵根 (pKa = 9.25)</option>
              </select>

              <label style={{ color: '#fff', fontSize: '13px' }}>2. 调节浓度比 [A⁻] / [HA]：</label>
              <div style={{ color: 'var(--alert-orange)', fontWeight: 'bold', margin: '5px 0' }}>当前比值: {t1Ratio.toFixed(2)} : 1</div>
              <input type="range" min="-1" max="1" step="0.01" value={t1LogRatio} onChange={e => setT1LogRatio(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--alert-orange)' }} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '120px', height: '60px', background: '#020617', border: '2px solid var(--life-green)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 15px rgba(16,185,129,0.2)' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: isT1Success ? 'var(--life-green)' : '#fff' }}>pH: {t1Ph.toFixed(2)}</span>
              </div>
              {isT1Success ? (
                <div style={{ marginTop: '15px', color: 'var(--life-green)', fontWeight: 'bold', textAlign: 'center', background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '8px' }}>
                  ✅ 配制成功！<br/>你利用醋酸并将其配比调节至 1.74:1，完美命中了目标！
                </div>
              ) : (
                <div style={{ marginTop: '15px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
                  提示：根据 Henderson-Hasselbalch 方程，应首先选择 pKa 最接近目标 pH 值的弱酸。
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (labTab === 'task2') {
      return (
        <div style={{ padding: '20px', width: '100%', height: '100%' }}>
          <h3 style={{ color: 'var(--cyan-glow)', textAlign: 'center', marginTop: 0 }}>挑战二：探测缓冲海绵的“厚度”（缓冲容量 β）</h3>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button className={`btn-outline ${t2Conc === 1.0 ? 'active' : ''}`} onClick={() => {setT2Conc(1.0); setT2Drops(0);}}>1.0 M 浓缓冲液</button>
                <button className={`btn-outline ${t2Conc === 0.1 ? 'active' : ''}`} onClick={() => {setT2Conc(0.1); setT2Drops(0);}}>0.1 M 稀缓冲液</button>
              </div>
              <button className="btn" style={{ width: '100%', background: 'var(--pink-glow)' }} onClick={() => setT2Drops(d => d + 1)} disabled={isT2Destroyed}>
                + 滴加 1 滴强碱 NaOH (0.01M)
              </button>
              <div style={{ marginTop: '15px', color: '#fff', fontSize: '13px' }}>
                已滴加：<span style={{ color: 'var(--pink-glow)', fontWeight: 'bold' }}>{t2Drops} 滴</span><br/>
                体系 pH：<span style={{ color: isT2Destroyed ? 'var(--alert-red)' : 'var(--life-green)', fontWeight: 'bold', fontSize: '18px' }}>{t2Ph.toFixed(2)}</span>
              </div>
              {isT2Destroyed && <div style={{ color: 'var(--alert-red)', fontWeight: 'bold', marginTop: '10px' }}>🚨 弱酸耗尽，缓冲体系彻底崩溃！</div>}
            </div>
            
            <div style={{ flex: 1 }}>
              <svg width="100%" height="150" viewBox="0 0 200 150">
                <line x1="20" y1="130" x2="180" y2="130" stroke="#475569" strokeWidth="2"/>
                <line x1="20" y1="130" x2="20" y2="20" stroke="#475569" strokeWidth="2"/>
                <text x="10" y="15" fill="#94a3b8" fontSize="10">pH</text><text x="180" y="145" fill="#94a3b8" fontSize="10">NaOH 滴数</text>
                
                {/* 动态柱状图代表 HA 和 A- 的存量 */}
                <rect x="40" y={130 - t2CurrentHA * 100} width="30" height={t2CurrentHA * 100} fill="var(--purple-med)"/>
                <text x="55" y="145" fill="#fff" fontSize="10" textAnchor="middle">HA</text>
                <rect x="90" y={130 - Math.min(1.2, t2CurrentA) * 100} width="30" height={Math.min(1.2, t2CurrentA) * 100} fill="var(--life-green)"/>
                <text x="105" y="145" fill="#fff" fontSize="10" textAnchor="middle">A⁻</text>
              </svg>
            </div>
          </div>
        </div>
      );
    } else if (labTab === 'task3') {
      return (
        <div style={{ padding: '20px', width: '100%', height: '100%', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--cyan-glow)', marginTop: 0 }}>挑战三：纯水的极度“脆弱”</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>向没有任何缓冲能力的纯水 (pH=7.0) 中滴加极少量的强碱。</p>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: t3Drops > 0 ? 'var(--alert-red)' : '#fff', margin: '20px 0', textShadow: t3Drops > 0 ? '0 0 15px var(--alert-red)' : 'none' }}>
            pH = {t3Ph.toFixed(2)}
          </div>
          <button className="btn" style={{ background: 'var(--alert-red)' }} onClick={() => setT3Drops(d => d + 1)}>
            + 滴加 1 滴强碱 NaOH (0.01M)
          </button>
          <button className="btn-outline" style={{ marginLeft: '10px' }} onClick={() => setT3Drops(0)}>重置纯水</button>
          {t3Drops > 0 && (
            <div style={{ marginTop: '20px', color: 'var(--alert-orange)', fontWeight: 'bold', background: 'rgba(245,158,11,0.1)', padding: '10px', borderRadius: '8px' }}>
              仅仅一滴！pH 值就产生了破坏性的断崖式飙升。<br/>这就是为什么人体血液必须依赖严密的缓冲系统！
            </div>
          )}
        </div>
      );
    }
  };

  // ==========================================
  // 前沿医药应用
  // ==========================================
  const renderAppNano = () => {
    const isTumor = nanoEnv === 'tumor';
    return (
      <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        <h3 style={{ color: 'var(--pink-glow)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined">vaccines</span> 智能响应型纳米药物递送系统
        </h3>
        <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>
          <strong>挑战：</strong>如何让化疗药物只攻击癌细胞？<br/>
          <strong>前沿解法：</strong>正常组织细胞间液 pH ≈ 7.4，而肿瘤组织由于快速代谢乳酸，微环境呈弱酸性 (pH 6.5 - 6.8)。科学家利用此差异，设计出<span style={{ color: 'var(--pink-glow)', fontWeight: 'bold' }}>“pH 敏感型脱缓冲纳米载体”</span>。
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '20px 0' }}>
          <button className={`btn-outline ${!isTumor ? 'active' : ''}`} onClick={() => setNanoEnv('normal')}>血液循环 (pH 7.4)</button>
          <button className={`btn-outline ${isTumor ? 'active' : ''}`} style={{ borderColor: 'var(--alert-red)', color: isTumor?'#fff':'var(--alert-red)', backgroundColor: isTumor?'var(--alert-red)':'transparent' }} onClick={() => setNanoEnv('tumor')}>肿瘤微环境 (pH 6.5)</button>
        </div>

        <svg width="100%" height="160" viewBox="0 0 400 160">
          <rect x="0" y="0" width="400" height="160" fill={isTumor ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)"} rx="8"/>
          
          {/* 纳米球外壳 */}
          {!isTumor ? (
            <g>
              <circle cx="200" cy="80" r="40" fill="none" stroke="var(--life-green)" strokeWidth="4" strokeDasharray="10 5"/>
              <text x="200" y="140" fill="var(--life-green)" fontSize="14" fontWeight="bold" textAnchor="middle">化学键锁定，药物安全包裹</text>
            </g>
          ) : (
            <g>
              {/* 破碎的外壳 */}
              <path d="M 180 40 Q 200 60 220 40" fill="none" stroke="var(--alert-red)" strokeWidth="4"/>
              <path d="M 160 100 Q 180 120 160 140" fill="none" stroke="var(--alert-red)" strokeWidth="4"/>
              <path d="M 240 100 Q 220 120 240 140" fill="none" stroke="var(--alert-red)" strokeWidth="4"/>
              <text x="200" y="140" fill="var(--alert-red)" fontSize="14" fontWeight="bold" textAnchor="middle">酸性触发脱壳，药物精准轰炸！</text>
            </g>
          )}

          {/* 药物分子 (红星) */}
          <g style={{ transition: 'all 0.5s ease' }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 60) * Math.PI / 180;
              const r = isTumor ? 60 + Math.random()*20 : 20;
              const cx = 200 + r * Math.cos(angle);
              const cy = 80 + r * Math.sin(angle);
              return <path key={i} d={`M ${cx} ${cy-5} L ${cx+3} ${cy+5} L ${cx-5} ${cy-1} L ${cx+5} ${cy-1} L ${cx-3} ${cy+5} Z`} fill="var(--alert-orange)">
                {isTumor && <animate attributeName="opacity" values="1;0;1" dur={`${1+Math.random()}s`} repeatCount="indefinite"/>}
              </path>
            })}
          </g>
        </svg>
      </div>
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
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在深度思考...' }]);

    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, '缓冲溶液体系与医药前沿应用');
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


  return (
    <div className="buffer-wrapper">
      <style>{`
        .buffer-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(20, 30, 48, 0.7); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --pink-glow: #ec4899; --text-main: #f8fafc; --text-muted: #cbd5e1; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }
        .buffer-wrapper h1, .buffer-wrapper h2, .buffer-wrapper h3 { color: var(--cyan-glow); margin-top: 0; }
        .buffer-wrapper h2 { border-left: 5px solid var(--primary-blue); padding-left: 10px; margin-bottom: 15px; margin-top: 20px; font-size: 1.4rem; }
        .buffer-wrapper section { padding: 30px 5%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .buffer-wrapper .btn { background: linear-gradient(135deg, var(--primary-blue), var(--cyan-glow)); border: none; padding: 10px 20px; color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; }
        .buffer-wrapper .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4); }
        .buffer-wrapper .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .buffer-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; font-size: 13px; margin-right: 8px; }
        .buffer-wrapper .btn-outline:hover, .buffer-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); border-color: var(--cyan-glow); color: #fff; }
        
        .buffer-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .buffer-wrapper .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .buffer-wrapper .panel { background: var(--bg-panel); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
        .buffer-wrapper .theory-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--cyan-glow); border-radius: 10px; padding: 20px; transition: 0.3s; }
        .buffer-wrapper .formula-box { background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; font-family: monospace; color: var(--alert-orange); border-left: 4px solid var(--alert-orange); text-align: center; font-weight: bold; font-size: 1.1em; margin: 10px 0; }
        
        .buffer-wrapper .lab-container { display: flex; flex-direction: column; border: 2px dashed var(--primary-blue); border-radius: 12px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 0; min-height: 400px; overflow: hidden; }
        .buffer-wrapper .lab-nav { display: flex; background: rgba(0,0,0,0.5); border-bottom: 1px solid #334155; }
        .buffer-wrapper .lab-nav-item { flex: 1; padding: 15px; text-align: center; cursor: pointer; font-weight: bold; color: var(--text-muted); transition: 0.3s; border-bottom: 3px solid transparent; }
        .buffer-wrapper .lab-nav-item.active { color: var(--cyan-glow); border-bottom-color: var(--cyan-glow); background: rgba(6, 182, 212, 0.1); }
        
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
      `}</style>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #083344 0%, var(--bg-dark) 100%)', paddingTop: '50px', paddingBottom: '30px' }}>
        <svg width="400" height="150" viewBox="0 0 400 150" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 15px var(--cyan-glow))' }}>
          {/* HA and A- balancing scale */}
          <path d="M 150 120 L 250 120 L 200 140 Z" fill="#475569"/>
          <line x1="100" y1="100" x2="300" y2="100" stroke="var(--cyan-glow)" strokeWidth="6" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" values="-5 200 100; 5 200 100; -5 200 100" dur="4s" repeatCount="indefinite"/>
          </line>
          <g transform="translate(100, 70)"><circle cx="0" cy="0" r="25" fill="var(--purple-med)"/><text x="0" y="5" fill="#fff" textAnchor="middle" fontWeight="bold">HA</text>
            <animateTransform attributeName="transform" type="translate" values="100 80; 100 120; 100 80" dur="4s" repeatCount="indefinite"/>
          </g>
          <g transform="translate(300, 70)"><circle cx="0" cy="0" r="25" fill="var(--life-green)"/><text x="0" y="5" fill="#fff" textAnchor="middle" fontWeight="bold">A⁻</text>
            <animateTransform attributeName="transform" type="translate" values="300 120; 300 80; 300 120" dur="4s" repeatCount="indefinite"/>
          </g>
          <text x="200" y="40" fill="#fff" fontSize="24" fontWeight="bold" textAnchor="middle" letterSpacing="2px">pH ≈ pKa</text>
        </svg>
        <h1 style={{ fontSize: '2.5rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--life-green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: '20px' }}>缓冲溶液系统：化学界的神奇海绵</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>“无论风吹雨打（加酸加碱），我自岿然不动。这是生命维系平衡的终极密码。”</p>
      </section>

      {/* 第一板块：缓冲溶液知识图谱 */}
      <section id="module1">
        <h2>板块一：知识图谱与微观机制</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>核心定义与组成</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              <strong>缓冲溶液：</strong>一种能够抵抗外来少量强酸、强碱或稀释，而保持自身 pH 值基本稳定的体系。<br/><br/>
              <strong>经典配方 (同离子效应)：</strong><br/>
              1. <span style={{ color: 'var(--purple-med)', fontWeight: 'bold' }}>弱酸 (HA)</span> + 其共轭碱盐 (<span style={{ color: 'var(--life-green)', fontWeight: 'bold' }}>A⁻</span>)，如 醋酸 / 醋酸钠。<br/>
              2. 弱碱 (B) + 其共轭酸盐 (BH⁺)，如 氨水 / 氯化铵。
            </p>
            
            <h3 style={{ marginTop: '20px' }}>H-H 方程与缓冲容量 (β)</h3>
            <div className="formula-box">
              pH = pKa + log([A⁻] / [HA])
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              当 [A⁻] = [HA] 时，pH = pKa，此时缓冲体系处于最佳状态，<strong>缓冲容量 β 最大</strong>。有效缓冲范围通常为 pKa ± 1。
            </p>
          </div>

          <div className="panel" style={{ border: '1px solid var(--cyan-glow)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, textAlign: 'center' }}>微观拦截机制展示</h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {renderMechanism()}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="btn" style={{ flex: 1, background: 'var(--alert-red)' }} onClick={() => triggerMech('acid')}>注入外来强酸 (H⁺)</button>
              <button className="btn" style={{ flex: 1, background: 'var(--pink-glow)' }} onClick={() => triggerMech('base')}>注入外来强碱 (OH⁻)</button>
            </div>
          </div>
        </div>
      </section>

      {/* 第二板块：交互式虚拟实验 */}
      <section id="module2">
        <h2>板块二：缓冲极限探究实验室</h2>
        <div className="lab-container">
          <div className="lab-nav">
            <div className={`lab-nav-item ${labTab === 'task1' ? 'active' : ''}`} onClick={() => setLabTab('task1')}>🧪 任务一：配制黄金缓冲液</div>
            <div className={`lab-nav-item ${labTab === 'task2' ? 'active' : ''}`} onClick={() => setLabTab('task2')}>🛡️ 任务二：测试海绵“厚度”</div>
            <div className={`lab-nav-item ${labTab === 'task3' ? 'active' : ''}`} onClick={() => setLabTab('task3')}>💧 任务三：纯水的崩溃</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }}>
            {renderLabScreen()}
          </div>
        </div>
      </section>

      {/* 第三板块：医药前沿应用探究 */}
      <section id="module3">
        <h2>板块三：医药领域的前沿靶向应用</h2>
        <div className="grid-2-asym">
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>生理体系与药物设计</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              <p>
                <strong>1. 血液的最后防线：</strong>人体血液 pH 严格维持在 7.35-7.45。最重要的体系是碳酸/碳酸氢盐缓冲对 (H₂CO₃ / HCO₃⁻)。
              </p>
              <p>
                <strong>2. 蛋白药物的保存液：</strong>像胰岛素这样的蛋白质药物极其娇贵。环境 pH 必须远离其等电点 (pI)，因此必须精密添加磷酸盐或组氨酸缓冲液，利用电荷斥力防止药物变性沉淀。
              </p>
              <p>
                <strong>3. 药物溶解度的“黄金窗口”：</strong>多数药物是弱酸或弱碱，只有用精确配比的缓冲体系锁定 pH，才能保证药物在血管中既不析出结晶，又保持高活性。
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {renderAppNano()}
          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--cyan-glow), var(--purple-med))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', cursor: 'pointer', zIndex: 100 }}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block', position: 'fixed', bottom: '100px', right: '30px', width: '340px', background: 'var(--bg-dark)', border: '1px solid var(--cyan-glow)', borderRadius: '12px', padding: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--life-green)', fontSize: '15px' }}>缓冲系统 AI 导师</h3>
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