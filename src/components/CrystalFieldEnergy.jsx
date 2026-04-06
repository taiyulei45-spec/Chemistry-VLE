import React, { useState, useEffect, useRef } from 'react';

export default function CrystalFieldEnergy() {
  const [dElectrons, setDElectrons] = useState(6);
  const [fieldStrength, setFieldStrength] = useState(1.0);

  const [q1Ans, setQ1Ans] = useState('');
  const [quizResult, setQuizResult] = useState({ text: '', color: '' });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！这里是光谱与颜色实验室。想知道为什么硫酸铜是蓝色，而高锰酸钾是紫色吗？随时问我！' }
  ]);
  const chatEndRef = useRef(null);

  // 动态预测颜色逻辑
  const getColorPrediction = (strength) => {
    if (strength < 0.8) return { name: "淡紫色 (吸收黄绿光)", hex: "#d8b4fe" };
    if (strength < 1.1) return { name: "浅绿色 (吸收红光)", hex: "#bbf7d0" };
    if (strength < 1.5) return { name: "亮黄色 (吸收紫蓝光)", hex: "#fef08a" };
    if (strength < 1.8) return { name: "深红色 (吸收蓝绿光)", hex: "#f87171" };
    return { name: "深紫色 (吸收黄绿光，跃迁能量极大)", hex: "#a855f7" };
  };

  const currentColor = getColorPrediction(fieldStrength);

  // 电子分配逻辑
  const isStrongField = fieldStrength > 1.2; // 以1.2为强弱场分界点
  let t2gCount = 0, egCount = 0, pairs = 0;

  if (isStrongField) {
    t2gCount = Math.min(dElectrons, 6);
    egCount = Math.max(0, dElectrons - 6);
    pairs = Math.max(0, dElectrons - 3); // 强场下尽量配对
    if (dElectrons > 6) pairs = 3 + Math.max(0, dElectrons - 8);
  } else {
    // 弱场优先填单电子
    if (dElectrons <= 3) { t2gCount = dElectrons; egCount = 0; pairs = 0; }
    else if (dElectrons <= 5) { t2gCount = 3; egCount = dElectrons - 3; pairs = 0; }
    else if (dElectrons <= 8) { t2gCount = 3 + (dElectrons - 5); egCount = 2; pairs = dElectrons - 5; }
    else { t2gCount = 6; egCount = 2 + (dElectrons - 8); pairs = 3 + (dElectrons - 8); }
  }

  const cfseDq = (-4 * t2gCount + 6 * egCount).toFixed(1);
  const cfseDelta = (cfseDq / 10).toFixed(2);

  // 动态渲染电子箭头
  const renderOrbitalBoxes = (count, maxSlots, startIndex, totalPairs) => {
    const boxes = [];
    for (let i = 1; i <= maxSlots; i++) {
      let hasUp = false, hasDown = false;
      const globalIndex = startIndex + i;
      
      // 这里的逻辑为简化模拟，确保箭头数目正确
      if (i <= count) hasUp = true;
      if (globalIndex <= totalPairs && i <= count && count > maxSlots) {
         hasDown = true; 
      }
      // 强场t2g配对特判
      if (isStrongField && startIndex === 0) {
        if (i <= count) hasUp = true;
        if (i <= count - 3) hasDown = true;
      }
      // 弱场t2g配对特判
      if (!isStrongField && startIndex === 0 && dElectrons > 5) {
        if (i <= dElectrons - 5) hasDown = true;
      }
      // 弱场eg配对特判
      if (!isStrongField && startIndex === 3 && dElectrons > 8) {
        if (i <= dElectrons - 8) hasDown = true;
      }

      boxes.push(
        <div key={i} className="orbital-box">
          {hasUp && <span className="e-up">↑</span>}
          {hasDown && <span className="e-down">↓</span>}
        </div>
      );
    }
    return boxes;
  };

  const submitQuiz = () => {
    if (q1Ans === 'B') {
      setQuizResult({ text: "✅ 完全正确！光谱化学序列正是反映配体场强大小的标尺，直接决定了物质吸收光的波长与互补色！", color: "var(--life-green)" });
    } else {
      setQuizResult({ text: "❌ 存在错误。提示：配体不同会导致 Δo 改变，吸收的光子能量不同，呈现的互补色自然不同。", color: "var(--alert-red)" });
    }
  };

  const handleChat = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: "在过渡金属配合物中，我们看到的颜色通常是**物质吸收某种色光后，透射出的“互补色”**。例如，当配合物吸收了能量较低的红光（说明其分裂能 Δo 较小，如弱场水合铜离子），它就会呈现出红色对应的互补色——蓝色。如果你加入强场配体（如氨水），Δo 增大，吸收的光波长变短（向紫光偏移），溶液颜色就会变成深蓝色！" }]);
      }, 1000);
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  // 动态轨道距离
  const splitGap = 60 + (fieldStrength * 40);

  return (
    <div className="energy-wrapper">
      <style>{`
        .energy-wrapper { --bg-color: #f8fafc; --text-color: #1e293b; --primary: #3b82f6; --life-green: #10b981; --alert-red: #ef4444; background: var(--bg-color); color: var(--text-color); font-family: 'Segoe UI', system-ui, sans-serif; min-height: 100vh; padding: 40px 10%; }
        .energy-wrapper h1 { text-align: center; color: #0f172a; margin-bottom: 40px; border-bottom: 2px solid var(--primary); padding-bottom: 10px; }
        .energy-wrapper h2 { color: var(--primary); margin-top: 40px; }
        .energy-wrapper .glass-panel { background: #fff; padding: 30px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-bottom: 30px; border: 1px solid #e2e8f0; }
        .energy-wrapper .controls { display: flex; gap: 40px; margin-bottom: 30px; }
        .energy-wrapper .control-group { flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .energy-wrapper label { font-weight: bold; color: #475569; }
        .energy-wrapper input[type="range"] { width: 100%; accent-color: var(--primary); }
        .energy-wrapper select { padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 16px; outline: none; }
        
        .energy-wrapper .split-diagram { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 350px; background: #f1f5f9; border-radius: 12px; border: 2px dashed #94a3b8; position: relative; padding: 40px 0; transition: 0.3s; }
        .energy-wrapper .orbital-row { display: flex; gap: 15px; position: relative; z-index: 10; transition: all 0.5s ease; }
        .energy-wrapper .orbital-box { width: 44px; height: 44px; border: 2px solid #374151; background: #fff; border-radius: 6px; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
        .energy-wrapper .e-up { color: var(--alert-red); font-size: 24px; position: absolute; transform: translateX(-4px); font-weight: bold; }
        .energy-wrapper .e-down { color: var(--primary); font-size: 24px; position: absolute; transform: translateX(4px); font-weight: bold; }
        
        .energy-wrapper .color-prediction { text-align: center; margin-top: 30px; padding: 20px; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .energy-wrapper .color-swatch { width: 100%; height: 80px; border-radius: 8px; margin: 15px 0; transition: background-color 0.5s ease; box-shadow: inset 0 0 20px rgba(0,0,0,0.1); }
        
        .energy-wrapper .quiz-box { background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid var(--primary); margin-bottom: 20px; }
        .energy-wrapper .quiz-box label { display: block; margin: 8px 0; cursor: pointer; padding: 8px; border-radius: 5px; transition: 0.2s; }
        .energy-wrapper .quiz-box label:hover { background: #dbeafe; }
        .energy-wrapper .btn { background: var(--primary); color: white; border: none; padding: 10px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; transition: 0.3s; }
        .energy-wrapper .btn:hover { background: #2563eb; }

        .energy-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4); z-index: 100; transition: transform 0.3s; }
        .energy-wrapper .ai-bot:hover { transform: scale(1.1); }
        .energy-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: #fff; border: 1px solid var(--primary); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
      `}</style>

      <h1>晶体场能级与颜色模拟器</h1>

      <div className="glass-panel">
        <div className="controls">
          <div className="control-group">
            <label>中心金属 d 电子数 (1-10)</label>
            <select value={dElectrons} onChange={e=>setDElectrons(parseInt(e.target.value))}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>d{n} 排布</option>)}
            </select>
          </div>
          <div className="control-group">
            <label>配体场强度 (Δo): {fieldStrength.toFixed(2)}</label>
            <input type="range" min="0.5" max="2.5" step="0.1" value={fieldStrength} onChange={e=>setFieldStrength(parseFloat(e.target.value))} />
            <span style={{ fontSize: '12px', color: '#64748b' }}>拖动滑块：右侧代表强场 (如CN⁻)，左侧代表弱场 (如Cl⁻)</span>
          </div>
        </div>

        <div className="split-diagram">
          <div style={{ position: 'absolute', left: '20px', top: '20px', color: '#64748b', fontWeight: 'bold' }}>能量 E ↑</div>
          
          <div className="orbital-row" style={{ transform: `translateY(-${splitGap}px)` }}>
            <span style={{ position: 'absolute', left: '-30px', top: '10px', fontWeight: 'bold' }}>eg</span>
            {renderOrbitalBoxes(egCount, 2, 3, pairs)}
          </div>
          
          <div style={{ height: `${splitGap*2}px`, borderLeft: '2px dashed #94a3b8', position: 'absolute', display: 'flex', alignItems: 'center' }}>
             <span style={{ background: '#f1f5f9', padding: '0 5px', color: '#ef4444', fontWeight: 'bold', marginLeft: '-10px' }}>Δo</span>
          </div>

          <div className="orbital-row" style={{ transform: `translateY(${splitGap}px)` }}>
            <span style={{ position: 'absolute', left: '-40px', top: '10px', fontWeight: 'bold' }}>t2g</span>
            {renderOrbitalBoxes(t2gCount, 3, 0, pairs)}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {/* 修复了上一版这里的单引号语法错误 */}
            <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>CFSE 计算器</h3>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>计算公式: <span style={{ fontFamily: 'monospace' }}>(-0.4 t2g + 0.6 eg) Δo</span></div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--alert-red)' }}>= {cfseDq} Dq</div>
            <div style={{ fontSize: '18px', color: '#64748b' }}>= {cfseDelta} Δo</div>
          </div>
          
          <div className="color-prediction">
            <h3 style={{ marginTop: 0 }}>光学现象：配合物宏观颜色预测</h3>
            <p style={{ fontSize: '14px', color: '#64748b' }}>随着 Δo 的增大，d-d 跃迁吸收的光波长逐渐变短（从红光移向紫光），因此透射出的互补色发生明显变化。</p>
            <div className="color-swatch" style={{ backgroundColor: currentColor.hex }}></div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#1e293b' }}>{currentColor.name}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <h2>随堂检验</h2>
        <div className="quiz-box">
          <p><strong>结合光谱化学序列思考：如果将含有 [Co(H₂O)₆]²⁺ (粉红色) 的溶液中加入大量的浓盐酸 (Cl⁻为极弱场配体)，取代了部分水分子，溶液的颜色预计会如何变化？</strong></p>
          <label><input type="radio" name="q1" onChange={()=>setQ1Ans('A')}/> A. 配体场变强，Δo 增大，颜色更深，变成深红色</label>
          <label><input type="radio" name="q1" onChange={()=>setQ1Ans('B')}/> B. Cl⁻ 是比 H₂O 更弱的配体，Δo 减小，吸收光波长变长，溶液会变成蓝色</label>
          <label><input type="radio" name="q1" onChange={()=>setQ1Ans('C')}/> C. 颜色不会发生改变，因为中心金属仍然是 Co²⁺</label>
        </div>
        <button className="btn" onClick={submitQuiz}>提交测评</button>
        {quizResult.text && <p style={{ marginTop: '15px', fontWeight: 'bold', color: quizResult.color }}>{quizResult.text}</p>}
      </div>

      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window">
          <h3 style={{ marginTop: 0, color: 'var(--primary)', fontSize: '16px' }}>光学 AI 助教</h3>
          <div style={{ height: '200px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--primary)' : '#333', background: msg.role === 'ai' ? '#eff6ff' : '#f8fafc', padding: '8px', borderRadius: '6px' }}>
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