import React, { useState, useEffect, useRef } from 'react';

export default function AtomStructureSum() {
  // ==========================================
  // 核心数据库：20 个精心挑选的关卡元素
  // 涵盖前5周期：主族、副族、d区过渡、以及经典特例
  // ==========================================
  const levels = [
    { id: 1, symbol: 'H', z: 1, name: '氢', period: 1, group: 1, block: 's区', core: '', val: {'1s': 1}, desc: '万物之始。薛定谔方程最精确的解，仅需考虑 n=1, l=0 的 1s 轨道。' },
    { id: 2, symbol: 'He', z: 2, name: '氦', period: 1, group: 18, block: 's区', core: '', val: {'1s': 2}, desc: '第一周期大结局。泡利不相容原理生效：1s 轨道填入自旋相反的两个电子(ms = ±1/2)。' },
    { id: 3, symbol: 'Li', z: 3, name: '锂', period: 2, group: 1, block: 's区', core: '[He]', val: {'2s': 1}, desc: 'n=2 的开端。主量子数 n 决定周期数。屏蔽效应开始显现。' },
    { id: 4, symbol: 'C', z: 6, name: '碳', period: 2, group: 14, block: 'p区', core: '[He]', val: {'2s': 2, '2p': 2}, desc: '有机生命的基础。注意洪特规则：2p 轨道的两个电子应分占不同轨道且自旋平行。' },
    { id: 5, symbol: 'N', z: 7, name: '氮', period: 2, group: 15, block: 'p区', core: '[He]', val: {'2s': 2, '2p': 3}, desc: 'p³ 半满极稳定！三个 p 电子分布在 px, py, pz，轨道高度对称。' },
    { id: 6, symbol: 'O', z: 8, name: '氧', period: 2, group: 16, block: 'p区', core: '[He]', val: {'2s': 2, '2p': 4}, desc: '必须有电子开始配对，电子间静电排斥增大，导致其第一电离能反而小于氮(N)。' },
    { id: 7, symbol: 'Ne', z: 10, name: '氖', period: 2, group: 18, block: 'p区', core: '[He]', val: {'2s': 2, '2p': 6}, desc: '八隅体满层(ns²np⁶)。极其稳定，闭壳层结构。' },
    { id: 8, symbol: 'Na', z: 11, name: '钠', period: 3, group: 1, block: 's区', core: '[Ne]', val: {'3s': 1}, desc: '进入 n=3。最外层只有 1 个 s 电子，金属性极强。' },
    { id: 9, symbol: 'P', z: 15, name: '磷', period: 3, group: 15, block: 'p区', core: '[Ne]', val: {'3s': 2, '3p': 3}, desc: '重现半满奇迹。具有可用的空 3d 轨道，可发生 sp³d 杂化！' },
    { id: 10, symbol: 'Ar', z: 18, name: '氩', period: 3, group: 18, block: 'p区', core: '[Ne]', val: {'3s': 2, '3p': 6}, desc: '第三周期惰性气体。注意，3d 轨道此时依然是空的！' },
    { id: 11, symbol: 'K', z: 19, name: '钾', period: 4, group: 1, block: 's区', core: '[Ar]', val: {'4s': 1, '3d': 0}, desc: '钻穿效应发威！4s(n=4,l=0) 的能量竟然低于 3d(n=3,l=2)，电子优先填入 4s。' },
    { id: 12, symbol: 'Sc', z: 21, name: '钪', period: 4, group: 3, block: 'd区', core: '[Ar]', val: {'4s': 2, '3d': 1}, desc: '过渡金属的开端！电子终于开始填入 3d 轨道。族数 = ns + (n-1)d 电子数。' },
    { id: 13, symbol: 'Cr', z: 24, name: '铬', period: 4, group: 6, block: 'd区', core: '[Ar]', val: {'4s': 1, '3d': 5}, exc: true, desc: '⚠️ 【考点突击】洪特规则特例！为了达到 3d⁵ 半满极致稳定态，一个 4s 电子跃迁至 3d。' },
    { id: 14, symbol: 'Mn', z: 25, name: '锰', period: 4, group: 7, block: 'd区', core: '[Ar]', val: {'4s': 2, '3d': 5}, desc: '正统的半满结构。拥有极高的第一电离能。' },
    { id: 15, symbol: 'Cu', z: 29, name: '铜', period: 4, group: 11, block: 'ds区', core: '[Ar]', val: {'4s': 1, '3d': 10}, exc: true, desc: '⚠️ 【考点突击】全满特例！为了达到 3d¹⁰ 全满稳定态，借用一个 4s 电子。属于 ds 区。' },
    { id: 16, symbol: 'Zn', z: 30, name: '锌', period: 4, group: 12, block: 'ds区', core: '[Ar]', val: {'4s': 2, '3d': 10}, desc: 'd 轨道完全填满闭合。不显过渡金属典型的颜色和变价特性。' },
    { id: 17, symbol: 'Ga', z: 31, name: '镓', period: 4, group: 13, block: 'p区', core: '[Ar]', val: {'4s': 2, '3d': 10, '4p': 1}, desc: 'd 区填满后，继续向 4p 轨道进军。由于 d 轨道收缩，产生了著名的“d区收缩效应”。' },
    { id: 18, symbol: 'Mo', z: 42, name: '钼', period: 5, group: 6, block: 'd区', core: '[Kr]', val: {'5s': 1, '4d': 5}, exc: true, desc: '⚠️ 【第五周期特例】和铬(Cr)同族，同样追求 4d⁵ 半满结构的能量极小值。' },
    { id: 19, symbol: 'Ag', z: 47, name: '银', period: 5, group: 11, block: 'ds区', core: '[Kr]', val: {'5s': 1, '4d': 10}, exc: true, desc: '⚠️ 【第五周期特例】和铜(Cu)同族，形成 4d¹⁰ 全满结构。极具延展性和导电性。' },
    { id: 20, symbol: 'Xe', z: 54, name: '氙', period: 5, group: 18, block: 'p区', core: '[Kr]', val: {'5s': 2, '4d': 10, '5p': 6}, desc: '稀有气体不再绝对“稀有”。由于原子半径极大，最外层电子受核束缚弱，可与强电负性元素(F,O)成键。' }
  ];

  // 轨道能级排序（按 Aufbau 原理能量从低到高排列展示）
  const orbitalOrder = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p'];
  const orbitalCap = { 's': 1, 'p': 3, 'd': 5, 'f': 7 }; // box 数量 (容量=box*2)

  // 状态管理
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(0); // 记录解锁到第几关
  const [userConfig, setUserConfig] = useState({});
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // AI 助教状态
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '欢迎来到量子游戏舱！在填电子时，切记：\n1. 泡利不相容（同一轨道自旋相反 ↑↓）\n2. 洪特规则（等价轨道先单填 ↑ ↑ ↑）\n3. 找找那些打破常规的“半满/全满”刺客！' }
  ]);
  const chatEndRef = useRef(null);

  const currentLvl = levels[currentLevelIdx];

  // 初始化当前关卡的空轨道
  useEffect(() => {
    let initialConfig = {};
    Object.keys(currentLvl.val).forEach(orb => {
      let type = orb.replace(/[0-9]/g, '');
      initialConfig[orb] = Array(orbitalCap[type]).fill(0); // 0=空, 1=上(↑), 2=上下(↑↓)
    });
    setUserConfig(initialConfig);
    setFeedback({ type: '', msg: '' });
  }, [currentLevelIdx]);

  // 点击轨道格子切换电子状态
  const handleOrbitalClick = (orb, index) => {
    setUserConfig(prev => {
      const newConfig = { ...prev };
      const currentVal = newConfig[orb][index];
      // 循环切换: 0(空) -> 1(↑) -> 2(↑↓) -> 0(空)
      newConfig[orb][index] = (currentVal + 1) % 3;
      return newConfig;
    });
    setFeedback({ type: '', msg: '' }); // 每次操作清除提示
  };

  // 核心校验逻辑
  const checkAnswer = () => {
    let isCorrect = true;
    let totalExpected = 0;
    let totalUser = 0;

    // 1. 统计总电子数
    Object.entries(currentLvl.val).forEach(([orb, expectedCount]) => {
      totalExpected += expectedCount;
      const userCount = userConfig[orb].reduce((sum, val) => sum + (val === 2 ? 2 : val), 0);
      totalUser += userCount;
    });

    if (totalUser !== totalExpected) {
      setFeedback({ type: 'error', msg: `❌ 电子总数不对！目标需要 ${totalExpected} 个价电子，你目前填了 ${totalUser} 个。` });
      return;
    }

    // 2. 具体分布校验 (防洪特规则报错 & 特例捕捉)
    let hasAufbauError = false;
    let hasHundError = false;

    Object.entries(currentLvl.val).forEach(([orb, expectedCount]) => {
      const userArr = userConfig[orb];
      const userCount = userArr.reduce((sum, val) => sum + (val === 2 ? 2 : val), 0);
      
      // 检查异常跃迁错填 (如 Cr 填了 4s2 3d4)
      if (userCount !== expectedCount) {
        hasAufbauError = true;
      }

      // 检查洪特规则 (例如 p 轨道 3个电子 必须是 [1,1,1] 而不能是 [2,1,0])
      let filledSlots = userArr.filter(v => v > 0).length;
      let maxSlots = Math.min(expectedCount, orbitalCap[orb.replace(/[0-9]/g, '')]);
      if (userCount === expectedCount && filledSlots < maxSlots) {
        hasHundError = true;
      }
    });

    if (hasAufbauError) {
      if (currentLvl.exc) {
        setFeedback({ type: 'error', msg: '🚨 警报！你掉进了“能级交错”陷阱。请仔细思考全满（d10）或半满（d5）的特殊稳定态能量补偿！' });
      } else {
        setFeedback({ type: 'error', msg: '❌ 电子所在能级不正确。请遵循 Aufbau(构造)原理，由低能级向高能级排布。' });
      }
      return;
    }

    if (hasHundError) {
      setFeedback({ type: 'error', msg: '❌ 违反洪特规则(Hund\'s Rule)！同一亚层的电子应尽量分占不同的轨道，且自旋平行(全 ↑)。' });
      return;
    }

    // 通过全部校验
    setFeedback({ type: 'success', msg: `✅ 完美！您成功推导了 ${currentLvl.name} 的微观量子排布。` });
    if (currentLevelIdx === unlockedLevel) {
      setUnlockedLevel(prev => Math.min(prev + 1, levels.length - 1));
    }
  };

  // AI 助教
  const handleChatSubmit = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');
      setTimeout(() => {
        let reply = "在构造原理中，能级的高低受“屏蔽效应”和“钻穿效应”双重影响。例如，4s 电子云在原子核附近有小的主峰，穿透内层电子云的能力强（钻穿效应大），导致 4s 能量反而低于 3d！但一旦过渡金属失去电子，却又是 4s 的电子先掉，因为原子实有效核电荷增加了，3d 能量骤降。";
        setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
      }, 1000);
    }
  };
  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  // 渲染轨道盒子
  const renderOrbitalGroup = (orbName) => {
    if (!userConfig[orbName]) return null;
    return (
      <div key={orbName} className="orbital-group">
        <div className="orb-label">{orbName}</div>
        <div className="box-container">
          {userConfig[orbName].map((val, idx) => (
            <div key={idx} className={`orb-box ${val > 0 ? 'filled' : ''}`} onClick={() => handleOrbitalClick(orbName, idx)}>
              {val === 1 && <span className="arrow up">↑</span>}
              {val === 2 && <span className="arrow both"><span className="up">↑</span><span className="down">↓</span></span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="quantum-wrapper">
      <style>{`
        .quantum-wrapper { --bg-dark: #0f172a; --panel-bg: rgba(30, 41, 59, 0.8); --cyan: #22d3ee; --green: #10b981; --orange: #f59e0b; --pink: #ec4899; color: #f8fafc; font-family: 'Segoe UI', system-ui, sans-serif; min-height: 100vh; padding: 40px 5%; }
        .quantum-wrapper h1 { color: var(--cyan); text-align: center; margin-bottom: 10px; font-size: 2.5rem; }
        
        .level-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 10px; margin-bottom: 30px; }
        .lvl-btn { padding: 10px; border-radius: 8px; border: 1px solid #475569; background: #1e293b; color: #94a3b8; cursor: pointer; font-weight: bold; transition: 0.3s; }
        .lvl-btn.unlocked { color: var(--cyan); border-color: var(--cyan); box-shadow: inset 0 0 10px rgba(34,211,238,0.1); }
        .lvl-btn.active { background: var(--cyan); color: #000; box-shadow: 0 0 15px var(--cyan); }
        .lvl-btn.locked { cursor: not-allowed; opacity: 0.5; }
        .lvl-btn.exception { border-color: var(--pink); color: var(--pink); }
        .lvl-btn.exception.active { background: var(--pink); color: #fff; box-shadow: 0 0 15px var(--pink); }

        .game-dashboard { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }
        .panel { background: var(--panel-bg); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        
        .data-tag { display: inline-block; padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-right: 10px; margin-bottom: 10px; font-size: 14px; border-left: 3px solid var(--cyan); }
        .core-box { font-family: monospace; font-size: 24px; color: var(--green); background: #000; padding: 10px 20px; border-radius: 8px; border: 1px dashed var(--green); display: inline-block; margin-bottom: 20px; }

        .orbital-workspace { display: flex; flex-wrap: wrap; gap: 25px; margin-top: 20px; padding: 20px; background: #020617; border-radius: 12px; border: 2px solid #334155; }
        .orbital-group { display: flex; flex-direction: column; align-items: center; }
        .orb-label { color: var(--cyan); font-weight: bold; margin-bottom: 8px; font-size: 18px; }
        .box-container { display: flex; gap: 4px; }
        .orb-box { width: 45px; height: 45px; border: 2px solid #64748b; background: rgba(255,255,255,0.05); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; transition: 0.2s; user-select: none; }
        .orb-box:hover { border-color: var(--cyan); background: rgba(34,211,238,0.1); }
        .orb-box.filled { border-color: var(--green); box-shadow: inset 0 0 10px rgba(16,185,129,0.2); }
        .arrow.up { color: var(--green); }
        .arrow.both .up { color: var(--green); margin-right: -4px;}
        .arrow.both .down { color: var(--orange); margin-left: -4px;}

        .action-btn { width: 100%; padding: 15px; border: none; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer; transition: 0.3s; margin-top: 30px; background: linear-gradient(135deg, var(--cyan), var(--green)); color: #000; }
        .action-btn:hover { box-shadow: 0 0 20px rgba(16,185,129,0.5); transform: translateY(-2px); }

        .feedback-box { margin-top: 20px; padding: 15px; border-radius: 8px; font-weight: bold; line-height: 1.5; }
        .feedback-box.error { background: rgba(239,68,68,0.1); color: #fca5a5; border-left: 4px solid var(--pink); }
        .feedback-box.success { background: rgba(16,185,129,0.1); color: #a7f3d0; border-left: 4px solid var(--green); }

        .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--cyan), var(--pink)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(236, 72, 153, 0.6); z-index: 100; transition: 0.3s; }
        .ai-bot:hover { transform: scale(1.1); }
        .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: var(--bg-dark); border: 1px solid var(--cyan); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
      `}</style>

      <h1>🌌 量子跃迁：核外电子排布极限挑战</h1>
      <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '30px' }}>根据洪特规则、泡利不相容原理与能量最低原理，点击空轨道为目标元素填入价电子，解锁所有 20 个特征关卡！</p>

      {/* 关卡选择器 */}
      <div className="level-grid">
        {levels.map((lvl, idx) => {
          let btnClass = "lvl-btn ";
          if (idx <= unlockedLevel) btnClass += "unlocked ";
          else btnClass += "locked ";
          if (idx === currentLevelIdx) btnClass += "active ";
          if (lvl.exc) btnClass += "exception ";

          return (
            <button key={lvl.id} className={btnClass} onClick={() => idx <= unlockedLevel && setCurrentLevelIdx(idx)} disabled={idx > unlockedLevel}>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Z={lvl.z}</div>
              <div style={{ fontSize: '20px' }}>{lvl.symbol}</div>
            </button>
          );
        })}
      </div>

      <div className="game-dashboard">
        {/* 左侧信息面板 */}
        <div className="panel">
          <h2 style={{ fontSize: '32px', margin: '0 0 10px 0', color: '#fff' }}>{currentLvl.name} ({currentLvl.symbol})</h2>
          <div style={{ marginBottom: '20px' }}>
            <span className="data-tag">第 {currentLvl.period} 周期</span>
            <span className="data-tag">第 {currentLvl.group} 族</span>
            {/* 这里修正了之前的语法错误 */}
            <span className="data-tag" style={{ borderColor: 'var(--pink)' }}>{currentLvl.block}</span>
          </div>
          <p style={{ color: '#cbd5e1', lineHeight: 1.6, borderBottom: '1px solid #334155', paddingBottom: '20px' }}>{currentLvl.desc}</p>
          
          <h3 style={{ color: 'var(--cyan)', marginTop: '20px' }}>原子核外电子排布通式</h3>
          <p style={{ color: '#64748b', fontSize: '13px' }}>主族元素：ns¹⁻² np¹⁻⁶<br/>过渡元素：(n-1)d¹⁻¹⁰ ns¹⁻²</p>
        </div>

        {/* 右侧交互工作台 */}
        <div className="panel">
          <h3 style={{ marginTop: 0, color: '#fff' }}>量子轨道工作台 (点击方格填入电子)</h3>
          
          <div className="orbital-workspace">
            {/* 内层电子直接显示原子实（惰性气体核心） */}
            {currentLvl.core && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="orb-label">内层原子实</div>
                <div className="core-box">{currentLvl.core}</div>
              </div>
            )}
            
            {/* 价电子让用户手填，按能级顺序渲染 */}
            {orbitalOrder.filter(o => Object.keys(currentLvl.val).includes(o)).map(orbName => renderOrbitalGroup(orbName))}
          </div>

          <button className="action-btn" onClick={checkAnswer}>🔬 提交观测结果</button>

          {feedback.msg && (
            <div className={`feedback-box ${feedback.type}`}>
              {feedback.msg}
            </div>
          )}
        </div>
      </div>

      {/* AI 助教悬浮窗 */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan)', fontSize: '16px' }}>量子规律 AI 助教</h3>
          <div style={{ height: '200px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--cyan)' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI导师' : '你'}:</strong> {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <input 
            type="text" 
            placeholder="输入问题：能级交错是怎么回事？" 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            onKeyDown={handleChatSubmit} 
            style={{ width: 'calc(100% - 22px)', padding: '10px', borderRadius: '6px', border: 'none', marginTop: '10px', background: '#1e293b', color: '#fff', outline: 'none' }} 
          />
        </div>
      )}
    </div>
  );
}