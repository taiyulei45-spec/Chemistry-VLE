import React, { useState, useEffect, useRef } from 'react';

export default function TrendsChart() {
  const [activeTrend, setActiveTrend] = useState('radius'); // 'radius', 'electronegativity', 'ionization'
  const [hoveredData, setHoveredData] = useState(null); // 用于图表悬浮提示
  
  // AI 助教状态
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是趋势分析 AI助教。关于“原子半径收缩”或“电负性递变”，你有什么疑问吗？' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 核心数据库：主族元素 (第二、三周期)
  // ==========================================
  const elementsData = [
    { symbol: 'Li', radius: 152, en: 0.98, ie: 520,  period: 2 },
    { symbol: 'Be', radius: 112, en: 1.57, ie: 899,  period: 2 },
    { symbol: 'B',  radius: 85,  en: 2.04, ie: 801,  period: 2 },
    { symbol: 'C',  radius: 77,  en: 2.55, ie: 1086, period: 2 },
    { symbol: 'N',  radius: 70,  en: 3.04, ie: 1402, period: 2 },
    { symbol: 'O',  radius: 73,  en: 3.44, ie: 1314, period: 2 },
    { symbol: 'F',  radius: 72,  en: 3.98, ie: 1681, period: 2 },
    { symbol: 'Ne', radius: 71,  en: 0,    ie: 2081, period: 2, isNoble: true },
    { symbol: 'Na', radius: 186, en: 0.93, ie: 496,  period: 3 },
    { symbol: 'Mg', radius: 160, en: 1.31, ie: 738,  period: 3 },
    { symbol: 'Al', radius: 143, en: 1.61, ie: 578,  period: 3 },
    { symbol: 'Si', radius: 118, en: 1.90, ie: 786,  period: 3 },
    { symbol: 'P',  radius: 110, en: 2.19, ie: 1012, period: 3 },
    { symbol: 'S',  radius: 103, en: 2.58, ie: 1000, period: 3 },
    { symbol: 'Cl', radius: 99,  en: 3.16, ie: 1251, period: 3 },
    { symbol: 'Ar', radius: 98,  en: 0,    ie: 1521, period: 3, isNoble: true },
  ];

  // ==========================================
  // SVG 渲染引擎核心参数
  // ==========================================
  const svgWidth = 800;
  const svgHeight = 350;
  const paddingX = 50;
  const paddingY = 40;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const getX = (index) => paddingX + index * (plotWidth / (elementsData.length - 1));

  // --- 1. 原子半径渲染逻辑 (气泡连线图) ---
  const renderRadiusChart = () => {
    const maxRadius = 200;
    const getY = (val) => svgHeight - paddingY - (val / maxRadius) * plotHeight;
    const pathD = `M ${elementsData.map((d, i) => `${getX(i)},${getY(d.radius)}`).join(' L ')}`;

    return (
      <g>
        <path d={pathD} fill="none" stroke="var(--primary-cyan)" strokeWidth="3" filter="drop-shadow(0 0 8px rgba(34,211,238,0.5))" />
        {elementsData.map((d, i) => (
          <g key={d.symbol} 
             onMouseEnter={() => setHoveredData({ x: getX(i), y: getY(d.radius), title: d.symbol, val: `${d.radius} pm`, type: '原子半径' })}
             onMouseLeave={() => setHoveredData(null)}
             style={{ cursor: 'pointer' }}
          >
            {/* 气泡大小映射真实半径 */}
            <circle cx={getX(i)} cy={getY(d.radius)} r={d.radius * 0.15} fill="rgba(34,211,238,0.2)" stroke="var(--primary-cyan)" strokeWidth="2" style={{ transition: 'all 0.3s' }} className="chart-node" />
            <text x={getX(i)} y={svgHeight - 15} fill="#94a3b8" fontSize="14" textAnchor="middle">{d.symbol}</text>
          </g>
        ))}
      </g>
    );
  };

  // --- 2. 电负性渲染逻辑 (能量柱状图) ---
  const renderENChart = () => {
    const maxEN = 4.0;
    const getY = (val) => svgHeight - paddingY - (val / maxEN) * plotHeight;

    return (
      <g>
        {elementsData.map((d, i) => {
          if (d.isNoble) return <text key={d.symbol} x={getX(i)} y={svgHeight - 15} fill="#475569" fontSize="14" textAnchor="middle">{d.symbol}</text>;
          const h = (d.en / maxEN) * plotHeight;
          const y = svgHeight - paddingY - h;
          return (
            <g key={d.symbol}
               onMouseEnter={() => setHoveredData({ x: getX(i), y: y, title: d.symbol, val: `${d.en} (鲍林标度)`, type: '电负性' })}
               onMouseLeave={() => setHoveredData(null)}
               style={{ cursor: 'pointer' }}
            >
              <rect x={getX(i) - 15} y={y} width="30" height={h} fill="url(#enGrad)" rx="4" className="chart-node" style={{ transition: 'all 0.4s ease' }} />
              <text x={getX(i)} y={svgHeight - 15} fill="#94a3b8" fontSize="14" textAnchor="middle">{d.symbol}</text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="enGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--pink-glow)" />
            <stop offset="100%" stopColor="rgba(236,72,153,0.1)" />
          </linearGradient>
        </defs>
      </g>
    );
  };

  // --- 3. 电离能渲染逻辑 (发光面积图) ---
  const renderIEChart = () => {
    const maxIE = 2200;
    const getY = (val) => svgHeight - paddingY - (val / maxIE) * plotHeight;
    const pathDLine = `M ${elementsData.map((d, i) => `${getX(i)},${getY(d.ie)}`).join(' L ')}`;
    const pathDArea = `${pathDLine} L ${getX(elementsData.length - 1)},${svgHeight - paddingY} L ${getX(0)},${svgHeight - paddingY} Z`;

    return (
      <g>
        <path d={pathDArea} fill="url(#ieGrad)" />
        <path d={pathDLine} fill="none" stroke="var(--life-green)" strokeWidth="3" filter="drop-shadow(0 0 8px rgba(16,185,129,0.5))" />
        {elementsData.map((d, i) => (
          <g key={d.symbol}
             onMouseEnter={() => setHoveredData({ x: getX(i), y: getY(d.ie), title: d.symbol, val: `${d.ie} kJ/mol`, type: '第一电离能' })}
             onMouseLeave={() => setHoveredData(null)}
             style={{ cursor: 'pointer' }}
          >
            <circle cx={getX(i)} cy={getY(d.ie)} r="6" fill="#fff" stroke="var(--life-green)" strokeWidth="3" className="chart-node" style={{ transition: 'all 0.3s' }} />
            <text x={getX(i)} y={svgHeight - 15} fill="#94a3b8" fontSize="14" textAnchor="middle">{d.symbol}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="ieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(16,185,129,0.4)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0)" />
          </linearGradient>
        </defs>
      </g>
    );
  };


  // ==========================================
  // AI 助教交互逻辑
  // ==========================================
  const handleChat = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');
      setTimeout(() => {
        let reply = "同一周期从左到右，随着核电荷数的增加，有效核电荷增大，对最外层电子的吸引力增强。因此我们能在图表上清晰地看到：原子半径逐渐减小（收缩），而电负性（抢夺电子的能力）逐渐增大！";
        if(val.includes('反常') || val.includes('电离能')) {
           reply = "你可能注意到了电离能图表上的锯齿状波动！这是因为 N (2p³) 和 P (3p³) 处于半满稳定状态，Be (2s²) 和 Mg (3s²) 处于全满状态，它们异常稳定，导致电离能比它们右边紧挨着的元素还要高。";
        }
        setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
      }, 1000);
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  return (
    <div className="trends-wrapper">
      <style>{`
        .trends-wrapper { --bg-dark: #0f172a; --primary-cyan: #22d3ee; --life-green: #10b981; --pink-glow: #ec4899; --text-main: #f8fafc; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', sans-serif; min-height: 100vh; padding: 40px 5%; position: relative; }
        .trends-wrapper h1 { color: var(--primary-cyan); font-size: 2.5rem; margin-bottom: 10px; }
        .trends-wrapper .panel { background: rgba(30, 41, 59, 0.7); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 30px; backdrop-filter: blur(10px); }
        .trends-wrapper .btn-toggle { background: transparent; border: 1px solid var(--primary-cyan); color: var(--primary-cyan); padding: 10px 20px; border-radius: 6px; cursor: pointer; transition: 0.3s; margin-right: 15px; font-weight: bold; }
        .trends-wrapper .btn-toggle.active, .trends-wrapper .btn-toggle:hover { background: rgba(34, 211, 238, 0.2); box-shadow: 0 0 15px rgba(34, 211, 238, 0.5); color: #fff; border-color: #fff; }
        
        .trends-wrapper .chart-area { width: 100%; height: 450px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(15,23,42,0.8), #020617); border: 2px dashed #475569; border-radius: 12px; position: relative; overflow: hidden; }
        .trends-wrapper .chart-node:hover { filter: brightness(1.5); }
        
        /* 自定义浮动提示框 */
        .trends-wrapper .tooltip { position: absolute; background: rgba(0,0,0,0.8); border: 1px solid var(--primary-cyan); padding: 10px 15px; border-radius: 8px; color: #fff; pointer-events: none; transform: translate(-50%, -120%); transition: top 0.1s, left 0.1s; box-shadow: 0 4px 15px rgba(0,0,0,0.5); z-index: 50; }
        
        .trends-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary-cyan), var(--life-green)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); z-index: 100; transition: 0.3s; }
        .trends-wrapper .ai-bot:hover { transform: scale(1.1); }
        .trends-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: var(--bg-dark); border: 1px solid var(--primary-cyan); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
      `}</style>

      <h1>元素周期性全景趋势图</h1>
      <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '1.1rem' }}>“门捷列夫的伟大，在于他在杂乱无章的自然界中，看见了数学般优美的起伏韵律。”</p>

      <div className="panel">
        <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
          <button className={`btn-toggle ${activeTrend === 'radius' ? 'active' : ''}`} onClick={() => setActiveTrend('radius')}>
            🔵 原子半径 (收缩趋势)
          </button>
          <button className={`btn-toggle ${activeTrend === 'electronegativity' ? 'active' : ''}`} style={{ borderColor: 'var(--pink-glow)', color: activeTrend === 'electronegativity' ? '#fff' : 'var(--pink-glow)' }} onClick={() => setActiveTrend('electronegativity')}>
            🔥 电负性 (夺电子能力)
          </button>
          <button className={`btn-toggle ${activeTrend === 'ionization' ? 'active' : ''}`} style={{ borderColor: 'var(--life-green)', color: activeTrend === 'ionization' ? '#fff' : 'var(--life-green)' }} onClick={() => setActiveTrend('ionization')}>
            ⚡ 第一电离能 (锯齿波动)
          </button>
        </div>
        
        {/* 原生 React SVG 渲染引擎 */}
        <div className="chart-area">
          <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: 'visible' }}>
            {/* 绘制背景横向网格线 */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
              <line key={ratio} x1={paddingX} y1={paddingY + ratio * plotHeight} x2={svgWidth - paddingX} y2={paddingY + ratio * plotHeight} stroke="#334155" strokeDasharray="4" />
            ))}
            
            {/* 第二与第三周期分界线 */}
            <line x1={getX(7) + (getX(8)-getX(7))/2} y1={paddingY} x2={getX(7) + (getX(8)-getX(7))/2} y2={svgHeight - paddingY} stroke="#475569" strokeWidth="2" strokeDasharray="6" />
            <text x={getX(3)} y={20} fill="#64748b" fontSize="14" fontWeight="bold">第二周期 (n=2)</text>
            <text x={getX(11)} y={20} fill="#64748b" fontSize="14" fontWeight="bold">第三周期 (n=3)</text>

            {/* 动态挂载对应的图表 */}
            {activeTrend === 'radius' && renderRadiusChart()}
            {activeTrend === 'electronegativity' && renderENChart()}
            {activeTrend === 'ionization' && renderIEChart()}
          </svg>

          {/* 悬浮 Tooltip */}
          {hoveredData && (
            <div className="tooltip" style={{ left: `${(hoveredData.x / svgWidth) * 100}%`, top: `${(hoveredData.y / svgHeight) * 100}%` }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-cyan)', marginBottom: '5px' }}>{hoveredData.title} 元素</div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>{hoveredData.type}: <span style={{ color: '#fff', fontWeight: 'bold' }}>{hoveredData.val}</span></div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--primary-cyan)' }}>
          <strong style={{ color: '#fff' }}>微观揭秘：</strong> 
          <span style={{ color: '#cbd5e1', marginLeft: '10px' }}>
            {activeTrend === 'radius' && '同一周期从左向右，电子层数不变，但核内质子数增多，有效核电荷增大，对核外电子的吸引力增强，导致原子半径逐渐“收缩”。'}
            {activeTrend === 'electronegativity' && '电负性反映了原子在分子中吸引电子的能力。同周期从左向右，由于半径减小、有效核电荷增加，元素“抢夺”电子的能力越来越强（氟F达到顶峰）。'}
            {activeTrend === 'ionization' && '第一电离能呈现整体上升、局部锯齿的形态。注意第IIA族(全满)和第VA族(半满)的异常突起，这是由于它们特殊的电子对称排布导致了极高的稳定性。'}
          </span>
        </div>
      </div>

      {/* AI 助教 */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-cyan)' }}>趋势 AI 助教</h3>
          <div style={{ height: '180px', overflowY: 'auto', fontSize: '13px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--primary-cyan)' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong> {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <input type="text" placeholder="试试问我：为什么电离能有锯齿状？" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={handleChat} style={{ width: 'calc(100% - 22px)', padding: '10px', borderRadius: '6px', border: 'none', marginTop: '10px', background: '#1e293b', color: '#fff', outline: 'none' }} />
        </div>
      )}
    </div>
  );
}