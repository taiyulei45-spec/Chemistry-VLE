import React, { useState, useEffect, useRef } from 'react';

export default function ElectronConfig() {
  const [chartType, setChartType] = useState('IE'); // 'IE' = 电离能, 'EA' = 电子亲和能
  const [activeElement, setActiveElement] = useState('N');

  // AI 助教状态
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是周期性规律 AI助教。关于“电离能异常、电子亲和能规律或屏蔽效应”，你有什么疑问吗？\n(例如：“为什么氮(N)的第一电离能反而比氧(O)大？”)' }
  ]);
  const chatEndRef = useRef(null);

  // 核心数据 (第二、三周期元素)
  const elements = ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'];
  const atomicNums = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  
  // 第一电离能 (kJ/mol)
  const ieData = [520, 899, 801, 1086, 1402, 1314, 1681, 2081, 496, 738, 578, 786, 1012, 1000, 1251, 1521];
  // 电子亲和能 (kJ/mol，取绝对值表示释放的能量，负值或接近0按0处理)
  const eaData = [60, 0, 27, 122, 0, 141, 328, 0, 53, 0, 43, 134, 72, 200, 349, 0];

  const configData = {
    'Li': '[He] 2s¹', 'Be': '[He] 2s²', 'B': '[He] 2s² 2p¹', 'C': '[He] 2s² 2p²', 'N': '[He] 2s² 2p³', 'O': '[He] 2s² 2p⁴', 'F': '[He] 2s² 2p⁵', 'Ne': '[He] 2s² 2p⁶',
    'Na': '[Ne] 3s¹', 'Mg': '[Ne] 3s²', 'Al': '[Ne] 3s² 3p¹', 'Si': '[Ne] 3s² 3p²', 'P': '[Ne] 3s² 3p³', 'S': '[Ne] 3s² 3p⁴', 'Cl': '[Ne] 3s² 3p⁵', 'Ar': '[Ne] 3s² 3p⁶'
  };

  const getExceptionDesc = (el, type) => {
    if (type === 'IE') {
      if (el === 'Be' || el === 'Mg') return "⭐ 异常反转：ns² 全满结构。s 轨道全满，电子云呈球形对称，穿透效应强，屏蔽较小，因此失去电子比下一个同周期的 III A 族元素更难。";
      if (el === 'N' || el === 'P') return "⭐ 异常反转：np³ 半满结构。p 轨道三个方向各有一个单电子，排布对称，能量较低极稳定，导致第一电离能大于紧随其后的 VI A 族元素。";
      if (el === 'O' || el === 'S') return "💡 能量补偿：np⁴ 结构。失去一个电子后反而能达到稳定的 np³ 半满结构，且 p 轨道中成对电子存在静电排斥，因此比前一个元素更容易失去电子。";
    } else {
      if (el === 'Be' || el === 'Mg' || el === 'Ne' || el === 'Ar') return "⚠️ 亲和能极低：具有稳定的 ns² 或 ns²np⁶ 全满结构，极难再接纳外来电子。";
      if (el === 'N' || el === 'P') return "⚠️ 亲和能反常偏低：原有的 np³ 半满结构已非常稳定，外加电子不仅会破坏这种对称性，还会引发同轨道电子的强烈排斥。";
    }
    return "符合同一周期从左至右，有效核电荷增加、原子半径减小带来的整体递增规律。";
  };

  // 生成 SVG 折线图坐标
  const activeData = chartType === 'IE' ? ieData : eaData;
  const maxVal = chartType === 'IE' ? 2200 : 400;
  const svgWidth = 800;
  const svgHeight = 300;
  const paddingX = 60;
  const paddingY = 40;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  const points = elements.map((el, i) => {
    const val = activeData[i];
    const x = paddingX + i * (usableWidth / (elements.length - 1));
    const y = svgHeight - paddingY - (val / maxVal) * usableHeight;
    return { x, y, el, val };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  const activeIndex = elements.indexOf(activeElement);
  const activePoint = points[activeIndex];

  const handleChat = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');
      setTimeout(() => {
        let reply = "这是一个经典考点！决定电离能和电子亲和能的本质因素是**有效核电荷 (Z*)** 与 **电子排布的对称性**。当轨道处于全满 (s², p⁶, d¹⁰) 或半满 (p³, d⁵) 时，电子云分布极度对称，能量最低。此时你要夺走它的电子（电离能）会非常困难，而塞给它一个电子（亲和能）它也会非常抗拒！";
        setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
      }, 1000);
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  return (
    <div className="periodicity-wrapper">
      <style>{`
        .periodicity-wrapper { --bg-dark: #0f172a; --bg-panel: rgba(30, 41, 59, 0.7); --primary-cyan: #22d3ee; --life-green: #10b981; --alert-orange: #f59e0b; --pink-glow: #ec4899; --text-main: #f8fafc; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; min-height: 100vh; padding: 40px 5%; overflow-x: hidden; }
        .periodicity-wrapper h1, .periodicity-wrapper h2, .periodicity-wrapper h3 { color: var(--primary-cyan); }
        .periodicity-wrapper h2 { border-left: 5px solid var(--life-green); padding-left: 15px; margin-bottom: 20px; }
        .periodicity-wrapper .panel { background: var(--bg-panel); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); margin-bottom: 40px; }
        
        .periodicity-wrapper .btn-toggle { background: transparent; border: 1px solid var(--primary-cyan); color: var(--primary-cyan); padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: 0.3s; font-weight: bold; margin-right: 15px; }
        .periodicity-wrapper .btn-toggle:hover, .periodicity-wrapper .btn-toggle.active { background: rgba(34, 211, 238, 0.2); box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); color: #fff; }
        
        .periodicity-wrapper .chart-container { display: flex; justify-content: center; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); border: 2px dashed #475569; border-radius: 16px; padding: 20px; position: relative; overflow-x: auto; }
        .periodicity-wrapper .point { cursor: pointer; transition: 0.3s; }
        .periodicity-wrapper .point:hover { transform: scale(1.5); filter: drop-shadow(0 0 10px #fff); }
        
        .periodicity-wrapper .info-card { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; background: rgba(0,0,0,0.3); padding: 25px; border-radius: 12px; border-left: 4px solid var(--pink-glow); margin-top: 30px; }
        .periodicity-wrapper .data-val { font-size: 32px; font-weight: bold; color: #fff; text-shadow: 0 0 10px var(--primary-cyan); }
        .periodicity-wrapper .config-box { font-family: monospace; font-size: 20px; color: var(--alert-orange); background: #1e293b; padding: 10px; border-radius: 6px; display: inline-block; margin-top: 10px; }
        
        .periodicity-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary-cyan), var(--life-green)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); z-index: 100; transition: transform 0.3s; }
        .periodicity-wrapper .ai-bot:hover { transform: scale(1.1); }
        .periodicity-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: var(--bg-dark); border: 1px solid var(--primary-cyan); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, background: '-webkit-linear-gradient(45deg, #22d3ee, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          元素排布与周期性规律
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '10px' }}>
          “元素的性质随着原子序数的递增，呈现出波浪般的周期性变化，这是由于核外电子排布周期性重演的必然结果。”
        </p>
      </div>

      <div className="panel">
        <h2>交互微观：电离能与电子亲和能突变观测舱</h2>
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <button className={`btn-toggle ${chartType === 'IE' ? 'active' : ''}`} onClick={() => setChartType('IE')}>
            ⚡ 观测 第一电离能 (IE₁)
          </button>
          <button className={`btn-toggle ${chartType === 'EA' ? 'active' : ''}`} onClick={() => setChartType('EA')}>
            🧲 观测 电子亲和能 (EA)
          </button>
        </div>

        {/* 动态可交互 SVG 折线图 */}
        <div className="chart-container">
          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            {/* Y轴网格线 */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
              const y = paddingY + ratio * usableHeight;
              const val = Math.round(maxVal - ratio * maxVal);
              return (
                <g key={ratio}>
                  <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="#334155" strokeDasharray="4" />
                  <text x={paddingX - 10} y={y + 4} fill="#64748b" fontSize="12" textAnchor="end">{val}</text>
                </g>
              );
            })}
            
            {/* 折线路径 */}
            <path d={pathD} fill="none" stroke={chartType === 'IE' ? 'var(--primary-cyan)' : 'var(--life-green)'} strokeWidth="3" filter="drop-shadow(0 0 5px rgba(255,255,255,0.3))" />
            
            {/* 数据点与标签 */}
            {points.map((p, i) => {
              const isException = (chartType === 'IE' && ['Be','N','Mg','P'].includes(p.el)) || (chartType === 'EA' && ['Be','N','Mg','Ne','Ar'].includes(p.el));
              const pointColor = isException ? 'var(--pink-glow)' : (chartType === 'IE' ? 'var(--primary-cyan)' : 'var(--life-green)');
              const isActive = activeElement === p.el;

              return (
                <g key={p.el} className="point" onClick={() => setActiveElement(p.el)}>
                  <circle cx={p.x} cy={p.y} r={isActive ? 8 : 5} fill={pointColor} stroke="#fff" strokeWidth={isActive ? 2 : 1} />
                  <text x={p.x} y={svgHeight - 15} fill={isActive ? '#fff' : '#94a3b8'} fontSize={isActive ? '16' : '14'} fontWeight={isActive ? 'bold' : 'normal'} textAnchor="middle">
                    {p.el}
                  </text>
                  {/* 分界线：第2周期与第3周期 */}
                  {p.el === 'Ne' && <line x1={p.x + 25} y1={paddingY} x2={p.x + 25} y2={svgHeight - paddingY} stroke="#ef4444" strokeWidth="2" strokeDasharray="6" />}
                </g>
              );
            })}

            {/* 周期标注 */}
            <text x={(paddingX + points[7].x) / 2} y={20} fill="#64748b" fontSize="14" fontWeight="bold" textAnchor="middle">第二周期元素</text>
            <text x={(points[8].x + points[15].x) / 2} y={20} fill="#64748b" fontSize="14" fontWeight="bold" textAnchor="middle">第三周期元素</text>
          </svg>
        </div>

        {/* 动态元素详情解析面板 */}
        <div className="info-card">
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#fff' }}>元素：{activeElement} (Z={atomicNums[activeIndex]})</h3>
            <div className="config-box">{configData[activeElement]}</div>
            <div style={{ marginTop: '20px' }}>
              <span style={{ color: '#94a3b8' }}>当前 {chartType === 'IE' ? '第一电离能' : '电子亲和能'}：</span><br/>
              <span className="data-val">{activePoint.val}</span> <span style={{ color: '#cbd5e1' }}>kJ/mol</span>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary-cyan)' }}>微观规律解析：</h4>
            <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.8 }}>
              {getExceptionDesc(activeElement, chartType)}
            </p>
          </div>
        </div>
      </div>

      <div className="panel" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--life-green)' }}>
        <h2 style={{ borderLeftColor: 'var(--life-green)', color: 'var(--life-green)' }}>教学闭环：有效核电荷与屏蔽效应</h2>
        <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
          <strong>斯莱脱规则 (Slater's Rules)：</strong> 多电子原子中，外层电子不仅受到原子核的吸引，还受到内层及同层电子的排斥（屏蔽效应）。因此，外层电子实际感受到的核电荷称为“有效核电荷 (Z*)”。<br/><br/>
          同一周期从左到右，质子数增加，但新增加的电子填入同一壳层，屏蔽能力较弱，导致 <strong>有效核电荷 Z* 显著增加，原子半径收缩，电离能整体呈上升趋势。</strong>
        </p>
      </div>

      {/* AI 助教 */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-cyan)', fontSize: '16px' }}>周期律 AI 助教</h3>
          <div style={{ height: '200px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--primary-cyan)' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong> <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <input 
            type="text" 
            placeholder="输入关于洪特规则、排布异常的问题..." 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            onKeyDown={handleChat} 
            style={{ width: 'calc(100% - 22px)', padding: '10px', borderRadius: '6px', border: 'none', marginTop: '10px', background: '#1e293b', color: '#fff', outline: 'none' }} 
          />
        </div>
      )}
    </div>
  );
}