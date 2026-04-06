import React, { useState, useEffect, useRef } from 'react';

export default function CrystalFieldTheory() {
  const [dCount, setDCount] = useState(5); // 默认 d5
  const [fieldType, setFieldType] = useState('weak'); // 'weak' or 'strong'

  const [q1Ans, setQ1Ans] = useState('');
  const [q2Ans, setQ2Ans] = useState('');
  const [quizResult, setQuizResult] = useState({ text: '', color: '' });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！欢迎来到八面体晶体场(CFT)专区。关于“能级分裂、高低自旋或姜-泰勒畸变”，你有什么疑问吗？\n(例如：“为什么 d5 强场和弱场的磁性差别那么大？”)' }
  ]);
  const chatEndRef = useRef(null);

  // 核心计算引擎
  const calculateConfig = () => {
    let t2g = 0, eg = 0, unpaired = 0;
    if (dCount <= 3) {
      t2g = dCount; eg = 0; unpaired = dCount;
    } else if (dCount >= 8) {
      t2g = 6; eg = dCount - 6; unpaired = (10 - dCount);
    } else {
      // d4 - d7 是强弱场分化的关键区
      if (fieldType === 'weak') {
        if (dCount === 4) { t2g = 3; eg = 1; unpaired = 4; }
        if (dCount === 5) { t2g = 3; eg = 2; unpaired = 5; }
        if (dCount === 6) { t2g = 4; eg = 2; unpaired = 4; }
        if (dCount === 7) { t2g = 5; eg = 2; unpaired = 3; }
      } else {
        if (dCount === 4) { t2g = 4; eg = 0; unpaired = 2; }
        if (dCount === 5) { t2g = 5; eg = 0; unpaired = 1; }
        if (dCount === 6) { t2g = 6; eg = 0; unpaired = 0; }
        if (dCount === 7) { t2g = 6; eg = 1; unpaired = 1; }
      }
    }
    
    const cfse = (-0.4 * t2g + 0.6 * eg).toFixed(1);
    const magMoment = Math.sqrt(unpaired * (unpaired + 2)).toFixed(2);
    const magType = unpaired > 0 ? "顺磁性 (Paramagnetic)" : "抗磁性 (Diamagnetic)";
    const spinState = (dCount >=4 && dCount <=7) ? (fieldType==='weak' ? '高自旋 (High Spin)' : '低自旋 (Low Spin)') : '无高低自旋之分';

    // 姜-泰勒效应判断
    let jt = "✅ 完美的八面体构型：电子排布对称，无 Jahn-Teller 畸变。";
    let jtColor = "#10b981";
    if (eg === 1 || eg === 3) {
      jt = "🚨 显著的 Jahn-Teller 效应：eg 轨道电子排布不对称，预计八面体构型将发生明显拉长或压扁畸变！";
      jtColor = "#ef4444";
    } else if (t2g === 1 || t2g === 2 || t2g === 4 || t2g === 5) {
      jt = "⚠️ 微弱的 Jahn-Teller 效应：t2g 轨道排布不对称，构型有轻微畸变。";
      jtColor = "#f59e0b";
    }

    return { t2g, eg, unpaired, cfse, magMoment, magType, spinState, jt, jtColor };
  };

  const data = calculateConfig();

  // 渲染轨道电子箭头的辅助函数
  const getArrows = (count, maxSlots) => {
    const slots = Array(maxSlots).fill({ up: false, down: false });
    let remaining = count;
    // 先填向上的单电子
    for (let i = 0; i < maxSlots && remaining > 0; i++) { slots[i] = { up: true, down: false }; remaining--; }
    // 再填向下的电子配对
    for (let i = 0; i < maxSlots && remaining > 0; i++) { slots[i] = { ...slots[i], down: true }; remaining--; }
    return slots;
  };

  const submitQuiz = () => {
    if (q1Ans === 'B' && q2Ans === 'C') {
      setQuizResult({ text: "✅ 满分！你已经精确掌握了姜-泰勒畸变的本质以及强场对低自旋CFSE的巨大贡献！", color: "var(--life-green)" });
    } else {
      setQuizResult({ text: "❌ 有点小瑕疵。提示：eg轨道不对称引发的J-T效应最强；强场（如CN-）迫使电子在t2g配对，产生更大的负CFSE。", color: "var(--alert-orange)" });
    }
  };

  const handleChat = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: "配体强弱取决于它与金属轨道的相互作用模式！像 CN⁻ 这样的强场配体，不仅通过孤对电子形成强 σ 键，还能利用其空的反键 π* 轨道接受金属反馈的 d 电子。这种强烈的“推-拉”作用极大地拉开了 t2g 和 eg 的能级差 (Δo)，从而迫使电子优先在下层配对，形成低自旋配合物。" }]);
      }, 1000);
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  return (
    <div className="cft-wrapper">
      <style>{`
        .cft-wrapper { --bg-light: #f4f7f6; --bg-card: #ffffff; --primary-blue: #2980b9; --accent-blue: #3498db; --life-green: #27ae60; --alert-red: #e74c3c; --alert-orange: #f39c12; background: var(--bg-light); color: #333; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; min-height: 100vh; padding: 40px 10%; }
        .cft-wrapper h1 { color: #2c3e50; text-align: center; border-bottom: 2px solid var(--accent-blue); padding-bottom: 10px; margin-bottom: 40px; }
        .cft-wrapper h2 { color: var(--primary-blue); }
        .cft-wrapper .container { background: var(--bg-card); padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin-bottom: 40px; }
        .cft-wrapper .control-panel { display: flex; justify-content: space-around; background: #e8f4f8; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #bde0ec; }
        .cft-wrapper .control-group { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .cft-wrapper select { font-size: 16px; padding: 8px 16px; border-radius: 6px; border: 1px solid var(--accent-blue); outline: none; }
        .cft-wrapper .radio-group { display: flex; gap: 15px; }
        .cft-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        
        .cft-wrapper .orbital-diagram { display: flex; flex-direction: column; align-items: center; padding: 20px; background: #fafafa; border-radius: 8px; border: 1px dashed #bdc3c7; }
        .cft-wrapper .level-row { display: flex; gap: 10px; margin-bottom: 40px; position: relative; }
        .cft-wrapper .box { width: 50px; height: 50px; border: 2px solid #7f8c8d; background: #fff; border-radius: 6px; display: flex; justify-content: center; align-items: center; font-size: 24px; font-weight: bold; position: relative; transition: 0.3s; }
        .cft-wrapper .box.eg { border-color: var(--alert-red); background: rgba(231, 76, 60, 0.05); }
        .cft-wrapper .box.t2g { border-color: var(--primary-blue); background: rgba(41, 128, 185, 0.05); }
        .cft-wrapper .arrow-up { color: var(--alert-red); position: absolute; transform: translateX(-5px); }
        .cft-wrapper .arrow-down { color: var(--primary-blue); position: absolute; transform: translateX(5px); }
        
        .cft-wrapper .dashboard { background: #fff; padding: 25px; border-radius: 8px; border-left: 5px solid var(--accent-blue); box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 15px; font-size: 16px; }
        .cft-wrapper .highlight { color: var(--alert-red); font-weight: bold; font-size: 1.1em; }
        .cft-wrapper .quiz-box { background: #fdfbf7; padding: 20px; border-radius: 8px; border: 1px solid #f3e5ab; margin-bottom: 20px; }
        .cft-wrapper .quiz-box label { display: block; margin: 8px 0; cursor: pointer; padding: 5px; transition: 0.2s; }
        .cft-wrapper .quiz-box label:hover { background: #f0f0f0; }
        .cft-wrapper .btn { background: var(--accent-blue); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; transition: 0.3s; }
        .cft-wrapper .btn:hover { background: var(--primary-blue); }
        
        .cft-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: var(--primary-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 5px 15px rgba(41, 128, 185, 0.4); z-index: 100; transition: transform 0.3s; }
        .cft-wrapper .ai-bot:hover { transform: scale(1.1); }
        .cft-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: #fff; border: 1px solid var(--primary-blue); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
      `}</style>

      <h1>无机化学交互课堂：八面体晶体场理论 (CFT)</h1>

      <div className="container">
        <div className="control-panel">
          <div className="control-group">
            <label>中心金属 d 电子数 (dⁿ)</label>
            <select value={dCount} onChange={e => setDCount(parseInt(e.target.value))}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>d{n} 组态</option>)}
            </select>
          </div>
          <div className="control-group">
            <label>配体场强度 (Ligand Field)</label>
            <div className="radio-group">
              <label><input type="radio" checked={fieldType==='weak'} onChange={()=>setFieldType('weak')}/> 弱场 (高自旋)</label>
              <label><input type="radio" checked={fieldType==='strong'} onChange={()=>setFieldType('strong')}/> 强场 (低自旋)</label>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="orbital-diagram">
            <h3 style={{ marginTop: 0 }}>d 轨道能级分裂图</h3>
            
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-60px', top: '20px', color: '#94a3b8', fontSize: '12px' }}>能量E ↑</div>
              
              <div className="level-row">
                <span style={{ position: 'absolute', left: '-40px', top: '15px', color: 'var(--alert-red)', fontWeight: 'bold' }}>e_g</span>
                {getArrows(data.eg, 2).map((slot, i) => (
                  <div key={i} className="box eg">
                    {slot.up && <span className="arrow-up">↑</span>}
                    {slot.down && <span className="arrow-down">↓</span>}
                  </div>
                ))}
              </div>

              <div style={{ height: '20px', borderLeft: '2px dashed #bdc3c7', marginLeft: '50px', marginBottom: '40px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '-5px', color: '#7f8c8d' }}>Δo (分裂能)</span>
              </div>

              <div className="level-row" style={{ marginBottom: 0 }}>
                <span style={{ position: 'absolute', left: '-40px', top: '15px', color: 'var(--primary-blue)', fontWeight: 'bold' }}>t_2g</span>
                {getArrows(data.t2g, 3).map((slot, i) => (
                  <div key={i} className="box t2g">
                    {slot.up && <span className="arrow-up">↑</span>}
                    {slot.down && <span className="arrow-down">↓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard">
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>数据监控仪表盘</h3>
            <div><strong>电子组态：</strong> (t₂g)<span className="highlight"> {data.t2g} </span> (e_g)<span className="highlight"> {data.eg} </span></div>
            <div><strong>自旋状态：</strong> <span className="highlight">{data.spinState}</span></div>
            <div><strong>晶体场稳定化能 (CFSE)：</strong> <span className="highlight">{data.cfse} Δo</span></div>
            <div><strong>未成对电子数 (n)：</strong> <span className="highlight">{data.unpaired}</span> 个</div>
            <div><strong>理论磁矩 (μ)：</strong> <span className="highlight">{data.magMoment} B.M.</span> <em>({data.magType})</em></div>
            <div style={{ marginTop: '10px', padding: '10px', background: `${data.jtColor}20`, borderLeft: `4px solid ${data.jtColor}`, borderRadius: '4px' }}>
              <strong>Jahn-Teller 畸变分析：</strong><br/>
              <span style={{ color: data.jtColor, fontSize: '14px', display: 'inline-block', marginTop: '5px' }}>{data.jt}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <h2>随堂检验</h2>
        <div className="quiz-box">
          <p><strong>1. 根据姜-泰勒(Jahn-Teller)定理，以下哪种电子排布会导致最显著的八面体构型畸变（如拉长或压扁）？</strong></p>
          <label><input type="radio" name="q1" onChange={()=>setQ1Ans('A')}/> A. t2g³ eg⁰ (如 Cr³⁺)</label>
          <label><input type="radio" name="q1" onChange={()=>setQ1Ans('B')}/> B. t2g³ eg¹ (如 Mn³⁺ 弱场)</label>
          <label><input type="radio" name="q1" onChange={()=>setQ1Ans('C')}/> C. t2g⁶ eg² (如 Ni²⁺)</label>
        </div>
        <div className="quiz-box">
          <p><strong>2. 对于 d⁶ 组态的 Fe²⁺ 离子，当遇到强场配体（如 CN⁻）时，其晶体场稳定化能 (CFSE) 和磁性特征是：</strong></p>
          <label><input type="radio" name="q2" onChange={()=>setQ2Ans('A')}/> A. CFSE = -0.4 Δo，顺磁性</label>
          <label><input type="radio" name="q2" onChange={()=>setQ2Ans('B')}/> B. CFSE = -2.4 Δo，顺磁性</label>
          <label><input type="radio" name="q2" onChange={()=>setQ2Ans('C')}/> C. CFSE = -2.4 Δo，抗磁性</label>
        </div>
        <button className="btn" onClick={submitQuiz}>提交测评</button>
        {quizResult.text && <p style={{ marginTop: '15px', fontWeight: 'bold', color: quizResult.color }}>{quizResult.text}</p>}
      </div>

      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window">
          <h3 style={{ marginTop: 0, color: 'var(--primary-blue)', fontSize: '16px' }}>晶体场 AI 助教</h3>
          <div style={{ height: '200px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--primary-blue)' : '#333', background: msg.role === 'ai' ? '#f0f8ff' : '#f9f9f9', padding: '8px', borderRadius: '6px' }}>
                <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong> {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <input type="text" placeholder="输入问题，按回车发送..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={handleChat} style={{ width: 'calc(100% - 20px)', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }} />
        </div>
      )}
    </div>
  );
}