import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 为了防止因缺少本地文件导致黑屏，这里提供一个模拟的 AI 请求函数。
// 如果你有真实的 ../utils/llmClient，可以将其替换回去。
const fetchChemistryAnswer = async (userText, chatHistory, context) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`针对您的问题：“${userText}”，这是 AI 助教的模拟回复。沉淀溶解平衡和天线效应在 MOF 组装中起着至关重要的作用。`);
    }, 1000);
  });
};

export default function VirtualLab() {
  // ==========================================
  // 核心状态管理 (15个实验步骤)
  // ==========================================
  const [step, setStep] = useState(1);
  const [metal, setMetal] = useState(''); 
  const [ligand, setLigand] = useState(''); 
  const [temp, setTemp] = useState(120); 
  const [analyte, setAnalyte] = useState(''); 

  // 实验动画与UI状态
  const [isHeating, setIsHeating] = useState(false);
  const [isCentrifuging, setIsCentrifuging] = useState(false);
  const [uvOn, setUvOn] = useState(false);

  // AI 助教
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '欢迎进入前沿 MOFs 材料虚拟实验室！本实验基于真实科研文献设计。\n\n你将经历完整的材料合成、表征与传感应用。关于“沉淀溶解平衡”、“天线效应”随时向我提问！' }
  ]);
  const chatEndRef = useRef(null);

  // 避免在渲染期间产生随机数导致 React 崩溃，使用 useMemo 缓存气泡数据
  const heatingBubbles = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      cx: 20 + Math.random() * 40,
      cyFrom: 100 - Math.random() * 20,
      dur: 1 + Math.random()
    }));
  }, []);

  // ==========================================
  // 步骤描述数据 (15步)
  // ==========================================
  const stepsData = [
    { id: 1, title: "1. 理论预习与对照组设计", desc: "MOFs 是由金属中心与有机配体组装的多孔晶体。沉淀溶解平衡理论表明，晶体的缓慢生长需要精确控制过饱和度。" },
    { id: 2, title: "2. 金属中心选择", desc: "选择镧系金属能赋予 MOF 独特的发光性质。请选择你的金属盐：" },
    { id: 3, title: "3. 有机配体选择", desc: "配体不仅是“支架”，更是吸收光能的“天线”。请选择有机配体：" },
    { id: 4, title: "4. 溶剂调配与溶解", desc: "将金属盐与配体溶于 N,N-二甲基甲酰胺 (DMF) 与水的混合溶剂中，加入适量调节剂以减缓沉淀速率。" },
    { id: 5, title: "5. 转移至反应釜", desc: "将澄清溶液转移至带有聚四氟乙烯内衬的不锈钢高压反应釜中，旋紧釜盖密闭。" },
    { id: 6, title: "6. 溶剂热合成 (温度探究)", desc: "设置烘箱温度。请设置合适的溶剂热温度（建议 100-150 ℃）：" },
    { id: 7, title: "7. 晶体生长与沉淀平衡", desc: "在密闭高温高压下，体系达到过饱和，MOF 晶体开始缓慢析出。" },
    { id: 8, title: "8. 离心分离", desc: "反应结束后自然冷却至室温。将悬浊液转移至离心管中进行高速离心，分离出块状晶体。" },
    { id: 9, title: "9. 洗涤与真空干燥", desc: "用 DMF 和无水乙醇多次洗涤晶体，去除游离配体，随后在 60 ℃ 真空干燥箱中过夜干燥。" },
    { id: 10, title: "10. 粉末 X 射线衍射 (PXRD) 表征", desc: "进行 XRD 测试。若选择正确，将出现尖锐的衍射峰，证明形成了高结晶度 MOF。" },
    { id: 11, title: "11. 热重分析 (TGA) 表征", desc: "通过 TGA 测试材料的热稳定性。观察客体分子的逸出与骨架坍塌的临界温度。" },
    { id: 12, title: "12. 紫外光激发 (UV) 荧光测试", desc: "在 254nm 紫外灯照射下，验证配体到金属的能量转移 (天线效应)。" },
    { id: 13, title: "13. 荧光传感应用构建", desc: "制备 MOF 均一悬浊液，用于特定离子的吸附检测。" },
    { id: 14, title: "14. 滴加待测分析物", desc: "向 MOF 悬浊液中滴加不同的金属离子，观察对荧光强度的影响。请选择待测物：" },
    { id: 15, title: "15. 结果分析与机制探究", desc: "完成实验！根据荧光淬灭现象（Stern-Volmer 曲线），分析其机制（如竞争吸收）。" }
  ];

  const isSuccess = metal === 'Tb' && ligand === 'H2BPD' && temp >= 100 && temp <= 150;

  // ==========================================
  // SVG 视图渲染器
  // ==========================================
  const renderBench = () => (
    <svg width="100%" height="300" viewBox="0 0 500 300">
      <rect x="50" y="250" width="400" height="20" fill="#334155" rx="5"/>
      <path d="M 120 150 L 120 250 L 180 250 L 180 150 Z" fill="rgba(255,255,255,0.1)" stroke="#cbd5e1" strokeWidth="2"/>
      <rect x="122" y={metal ? 180 : 220} width="56" height={metal ? 68 : 28} fill={metal === 'Tb' ? "rgba(16,185,129,0.4)" : metal === 'Zn' ? "rgba(255,255,255,0.3)" : "rgba(59,130,246,0.3)"} style={{transition: 'all 0.5s'}}/>
      <text x="150" y="200" fill="#fff" fontSize="14" textAnchor="middle" fontWeight="bold">{metal ? `${metal}(NO₃)₃` : '金属盐'}</text>
      
      <path d="M 320 150 L 320 250 L 380 250 L 380 150 Z" fill="rgba(255,255,255,0.1)" stroke="#cbd5e1" strokeWidth="2"/>
      <rect x="322" y={ligand ? 180 : 220} width="56" height={ligand ? 68 : 28} fill={ligand === 'H2BPD' ? "rgba(245,158,11,0.4)" : ligand === 'Acetate' ? "rgba(236,72,153,0.4)" : "rgba(139,92,246,0.3)"} style={{transition: 'all 0.5s'}}/>
      <text x="350" y="200" fill="#fff" fontSize="14" textAnchor="middle" fontWeight="bold">{ligand === 'H2BPD' ? 'H₂BPD' : ligand === 'Acetate' ? '乙酸' : '有机配体'}</text>

      {step >= 4 && (
        <g>
          <path d="M 220 50 L 220 120 L 280 120 L 280 50 Z" fill="rgba(255,255,255,0.1)" stroke="#cbd5e1" strokeWidth="2"/>
          <rect x="222" y="70" width="56" height="48" fill="rgba(6,182,212,0.4)"/>
          <text x="250" y="100" fill="#fff" fontSize="12" textAnchor="middle">DMF/H₂O</text>
          <path d="M 250 125 L 250 180" stroke="var(--cyan-glow)" strokeWidth="3" strokeDasharray="5 5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.5s" repeatCount="indefinite"/>
          </path>
        </g>
      )}
    </svg>
  );

  const renderAutoclave = () => (
    <svg width="100%" height="300" viewBox="0 0 500 300">
      <rect x="100" y="20" width="300" height="260" fill="rgba(15,23,42,0.8)" stroke="#475569" strokeWidth="4" rx="10"/>
      <rect x="150" y="60" width="200" height="180" fill="rgba(0,0,0,0.5)" rx="5"/>
      <text x="250" y="50" fill="var(--alert-red)" fontSize="16" fontWeight="bold" textAnchor="middle">程序升温烘箱 : {temp} ℃</text>
      
      <g transform="translate(210, 100)">
        <rect x="0" y="0" width="80" height="120" fill="#94a3b8" rx="8"/>
        <rect x="10" y="10" width="60" height="100" fill="#f8fafc" rx="5"/> 
        <rect x="12" y={isHeating ? 40 : 80} width="56" height={isHeating ? 68 : 28} fill="rgba(6,182,212,0.5)" style={{transition: 'all 2s'}}/>
        {/* 修复点：使用稳定的 useMemo 缓存避免 Hydration 不匹配 */}
        {isHeating && heatingBubbles.map(b => (
           <circle key={b.id} cx={b.cx} cy={100} r="2" fill="#fff">
             <animate attributeName="cy" values={`${b.cyFrom}; 40`} dur={`${b.dur}s`} repeatCount="indefinite"/>
           </circle>
        ))}
        {step === 7 && isHeating && (
          <polygon points="30,100 50,100 40,80" fill={isSuccess ? "var(--life-green)" : "#475569"}/>
        )}
      </g>
      {isHeating && <rect x="120" y="220" width="260" height="10" fill="var(--alert-red)" filter="blur(4px)"><animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/></rect>}
    </svg>
  );

  const renderWorkup = () => (
    <svg width="100%" height="300" viewBox="0 0 500 300">
      <rect x="150" y="100" width="200" height="150" fill="#334155" rx="20"/>
      <circle cx="250" cy="175" r="60" fill="#0f172a"/>
      {/* 修复点：增加内部嵌套的 <g>，防止 animateTransform 覆盖父级的 translate */}
      <g transform="translate(250, 175)">
        <g>
          {isCentrifuging && <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.2s" repeatCount="indefinite"/>}
          {[0, 90, 180, 270].map(angle => (
            <g key={angle} transform={`rotate(${angle}) translate(0, -35)`}>
              <rect x="-10" y="-20" width="20" height="40" fill="rgba(255,255,255,0.2)" rx="5"/>
              <rect x="-8" y="0" width="16" height="18" fill="rgba(6,182,212,0.5)"/>
              <circle cx="0" cy="15" r="4" fill={isSuccess ? "var(--life-green)" : "#475569"}/>
            </g>
          ))}
        </g>
      </g>
      <text x="250" y="80" fill="var(--cyan-glow)" fontSize="16" fontWeight="bold" textAnchor="middle">高速离心机 (8000 rpm)</text>
    </svg>
  );

  const renderCharacterization = () => (
    <svg width="100%" height="300" viewBox="0 0 500 300">
      {step === 10 && (
        <g>
          <text x="250" y="30" fill="var(--cyan-glow)" fontSize="16" fontWeight="bold" textAnchor="middle">粉末 X 射线衍射 (PXRD) 图谱</text>
          <line x1="50" y1="250" x2="450" y2="250" stroke="#cbd5e1" strokeWidth="2"/>
          <line x1="50" y1="250" x2="50" y2="50" stroke="#cbd5e1" strokeWidth="2"/>
          <text x="440" y="270" fill="#cbd5e1" fontSize="12">2θ (度)</text>
          {isSuccess ? (
            <path d="M 50 240 L 100 240 L 110 80 L 120 240 L 180 240 L 190 120 L 200 240 L 300 240 L 310 160 L 320 240 L 450 240" fill="none" stroke="var(--life-green)" strokeWidth="2"/>
          ) : (
            <path d="M 50 240 Q 150 200 250 180 T 450 240" fill="none" stroke="var(--alert-red)" strokeWidth="2"/>
          )}
          <text x="250" y="100" fill={isSuccess ? "var(--life-green)" : "var(--alert-red)"} fontSize="14" textAnchor="middle">
            {isSuccess ? "尖锐特征峰：成功形成高结晶度 MOF" : "宽散馒头峰：无定形聚合物，合成失败"}
          </text>
        </g>
      )}
      {step === 11 && (
        <g>
          <text x="250" y="30" fill="var(--pink-glow)" fontSize="16" fontWeight="bold" textAnchor="middle">热重分析 (TGA) 曲线</text>
          <line x1="50" y1="250" x2="450" y2="250" stroke="#cbd5e1" strokeWidth="2"/>
          <line x1="50" y1="250" x2="50" y2="50" stroke="#cbd5e1" strokeWidth="2"/>
          <path d="M 50 80 L 150 80 C 180 80, 190 120, 220 120 L 320 120 C 350 120, 360 220, 380 220 L 450 220" fill="none" stroke="var(--pink-glow)" strokeWidth="3"/>
          <text x="180" y="70" fill="#fff" fontSize="12">脱去孔道水分子</text>
        </g>
      )}
      {step === 12 && (
        <g>
          <text x="250" y="30" fill="var(--purple-med)" fontSize="16" fontWeight="bold" textAnchor="middle">紫外灯 (254nm) 下荧光发射现象</text>
          <rect x="230" y="150" width="40" height="80" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="2" rx="4"/>
          {uvOn && (
            <g>
              <polygon points="250,50 150,150 350,150" fill="rgba(139,92,246,0.3)"/>
              <rect x="232" y="180" width="36" height="48" fill={isSuccess ? "var(--life-green)" : "rgba(255,255,255,0.4)"} filter={isSuccess ? "drop-shadow(0 0 15px var(--life-green))" : "none"}/>
            </g>
          )}
          <rect x="210" y="40" width="80" height="20" fill="#1e293b" stroke="var(--purple-med)" strokeWidth="2"/>
          <text x="250" y="54" fill="var(--purple-med)" fontSize="12" textAnchor="middle" fontWeight="bold">UV Lamp</text>
        </g>
      )}
    </svg>
  );

  const renderSensing = () => {
    const isQuenched = analyte === 'Fe3+';
    return (
      <svg width="100%" height="300" viewBox="0 0 500 300">
        {step < 15 ? (
          <g>
            <rect x="220" y="120" width="60" height="100" fill="rgba(255,255,255,0.1)" stroke="#fff" strokeWidth="3" rx="5"/>
            {/* 修复点：filter 不能传空字符串，应传 "none" 否则某些浏览器下会导致整个 SVG 渲染崩溃 */}
            <rect x="223" y="150" width="54" height="67" fill={!isSuccess ? "rgba(255,255,255,0.3)" : (analyte && isQuenched) ? "rgba(16,185,129,0.2)" : "var(--life-green)"} filter={(!analyte || !isQuenched) && isSuccess ? "drop-shadow(0 0 15px var(--life-green))" : "none"} style={{transition: 'all 1s'}}/>
            <text x="250" y="240" fill="#fff" fontSize="14" textAnchor="middle">Tb-MOF 悬浊液</text>
            
            {analyte && (
              <g>
                <path d="M 245 40 L 245 100 L 255 100 L 255 40 Z" fill="#94a3b8"/>
                <circle cx="250" cy="110" r="4" fill={analyte === 'Fe3+' ? "var(--alert-orange)" : "#fff"}>
                  <animate attributeName="cy" values="110; 160" dur="1s" repeatCount="3"/>
                  <animate attributeName="opacity" values="1; 0" dur="1s" repeatCount="3"/>
                </circle>
                <text x="280" y="90" fill={analyte === 'Fe3+' ? "var(--alert-orange)" : "#fff"} fontSize="14" fontWeight="bold">{analyte}</text>
              </g>
            )}
          </g>
        ) : (
          <g>
            <text x="250" y="30" fill="var(--cyan-glow)" fontSize="16" fontWeight="bold" textAnchor="middle">Stern-Volmer 荧光淬灭曲线</text>
            <line x1="50" y1="250" x2="450" y2="250" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1="50" y1="250" x2="50" y2="50" stroke="#cbd5e1" strokeWidth="2"/>
            <path d="M 50 250 L 400 80" fill="none" stroke="var(--alert-orange)" strokeWidth="3"/>
            {[100, 170, 240, 310, 380].map((x, i) => (
               <circle key={i} cx={x} cy={250 - (x-50)*0.48} r="4" fill="var(--alert-red)"/>
            ))}
          </g>
        )}
      </svg>
    );
  };

  const getSceneSVG = () => {
    if (step <= 4) return renderBench();
    if (step <= 7) return renderAutoclave();
    if (step <= 9) return renderWorkup();
    if (step <= 12) return renderCharacterization();
    return renderSensing();
  };

  // ==========================================
  // 交互控制逻辑
  // ==========================================
  const handleNext = () => {
    if (step === 2 && !metal) return alert("请先选择金属中心！");
    if (step === 3 && !ligand) return alert("请先选择有机配体！");
    if (step === 6) {
      setIsHeating(true);
      setTimeout(() => { setIsHeating(false); setStep(s => s + 1); }, 3000);
      return;
    }
    if (step === 8) {
      setIsCentrifuging(true);
      setTimeout(() => { setIsCentrifuging(false); setStep(s => s + 1); }, 2000);
      return;
    }
    if (step === 14 && !analyte) return alert("请先选择滴加的分析物！");
    if (step < 15) setStep(s => s + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton && (e.key !== 'Enter' || e.nativeEvent.isComposing)) return;
    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在检索无机化学教材与最新科研文献...' }]);

    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, 'MOFs材料合成');
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply };
        return newHistory;
      });
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 网络或模型接口连接异常。' };
        return newHistory;
      });
    }
  };

  useEffect(() => { 
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); 
  }, [chatHistory, isChatOpen]);

  // CSS 样式
  const innerStyles = `
    .vlab-wrapper { --bg-dark: #0f172a; --bg-panel: rgba(30, 41, 59, 0.75); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --pink-glow: #ec4899; background: var(--bg-dark); color: #f8fafc; font-family: 'Segoe UI', sans-serif; line-height: 1.6; min-height: 100vh; display: flex; flex-direction: column; }
    .vlab-header { text-align: center; padding: 20px; background: #020617; border-bottom: 1px solid #334155; }
    .vlab-header h1 { margin: 0; color: var(--cyan-glow); font-size: 24px; }
    .vlab-content { display: flex; flex: 1; padding: 20px; gap: 20px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
    .vlab-left { flex: 1; display: flex; flex-direction: column; gap: 20px; }
    .vlab-right { flex: 1.5; background: var(--bg-panel); border: 1px solid #334155; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .step-card { background: rgba(0,0,0,0.4); padding: 20px; border-radius: 12px; border-left: 4px solid var(--cyan-glow); }
    .step-card h3 { color: var(--cyan-glow); margin-top: 0; }
    .btn { background: linear-gradient(135deg, var(--primary-blue), var(--cyan-glow)); border: none; padding: 10px 20px; color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; }
    .btn:hover:not(:disabled) { box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4); transform: translateY(-2px); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; font-size: 13px; margin: 5px; }
    .btn-outline:hover, .btn-outline.active { background: rgba(6, 182, 212, 0.2); color: #fff; }
    .svg-stage { flex: 1; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(0,0,0,1)); position: relative; }
    .controls { padding: 20px; background: #020617; border-top: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
    .markdown-prose strong { color: var(--cyan-glow); }
  `;

  const currData = stepsData.find(s => s.id === step);

  return (
    <div className="vlab-wrapper">
      <style dangerouslySetInnerHTML={{ __html: innerStyles }} />
      <div className="vlab-header">
        <h1>🔬 虚拟化学实验室：荧光 MOF 靶向传感与可控合成</h1>
        <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>科教融合开放实验项目 —— 探究沉淀溶解平衡与前沿配位组装</p>
      </div>

      <div className="vlab-content">
        <div className="vlab-left">
          <div className="step-card">
            <h3>{currData?.title}</h3>
            <p style={{ color: '#cbd5e1', fontSize: '14px' }}>{currData?.desc}</p>
            <div style={{ marginTop: '20px' }}>
              {step === 2 && (
                <div>
                  <button className={`btn-outline ${metal === 'Tb' ? 'active' : ''}`} onClick={() => setMetal('Tb')}>Tb(NO₃)₃ (铽盐)</button>
                  <button className={`btn-outline ${metal === 'Zn' ? 'active' : ''}`} onClick={() => setMetal('Zn')}>Zn(NO₃)₂ (锌盐)</button>
                </div>
              )}
              {step === 3 && (
                <div>
                  <button className={`btn-outline ${ligand === 'H2BPD' ? 'active' : ''}`} onClick={() => setLigand('H2BPD')}>联苯二甲酸 (H₂BPD)</button>
                  <button className={`btn-outline ${ligand === 'Acetate' ? 'active' : ''}`} onClick={() => setLigand('Acetate')}>冰醋酸 (CH₃COOH)</button>
                </div>
              )}
              {step === 6 && (
                <div>
                  <input type="range" min="20" max="250" value={temp} onChange={e => setTemp(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--alert-red)' }}/>
                  <div style={{ color: 'var(--alert-red)', fontWeight: 'bold', marginTop: '10px' }}>设定温度: {temp} ℃</div>
                </div>
              )}
              {step === 12 && (
                <button className={`btn-outline ${uvOn ? 'active' : ''}`} onClick={() => setUvOn(!uvOn)}>
                  {uvOn ? '关闭紫外灯' : '💡 开启 254nm 紫外灯'}
                </button>
              )}
              {step === 14 && (
                <div>
                  <button className={`btn-outline ${analyte === 'Na+' ? 'active' : ''}`} onClick={() => setAnalyte('Na+')}>滴加 NaCl 溶液</button>
                  <button className={`btn-outline ${analyte === 'Fe3+' ? 'active' : ''}`} onClick={() => setAnalyte('Fe3+')}>滴加 FeCl₃ 溶液</button>
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1, background: '#020617', border: '1px solid var(--purple-med)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: 'var(--purple-med)', padding: '10px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>smart_toy</span> 实验 AI 导师
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', fontSize: '13px' }}>
              {chatHistory.map((msg, i) => (
                <div key={i} style={{ marginBottom: '12px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  <div style={{ display: 'inline-block', maxWidth: '85%', padding: '10px 15px', borderRadius: '12px', background: msg.role === 'user' ? 'var(--primary-blue)' : 'rgba(255,255,255,0.1)', color: '#fff', textAlign: 'left' }}>
                    {/* 修复点：高版本 react-markdown 不再支持直接传 className 属性，在外层包裹 div 进行样式应用 */}
                    {msg.role === 'ai' ? (
                      <div className="markdown-prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>
                    ) : msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #334155', background: '#0f172a' }}>
              <input type="text" placeholder="提问实验原理..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: '#fff', outline: 'none' }} />
              <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'transparent', border: 'none', color: 'var(--cyan-glow)', cursor: 'pointer', padding: '0 10px' }}><span className="material-symbols-outlined">send</span></button>
            </div>
          </div>
        </div>

        <div className="vlab-right">
          <div className="svg-stage">
            {getSceneSVG()}
          </div>
          
          <div className="controls">
            <button className="btn-outline" onClick={handlePrev} disabled={step === 1 || isHeating || isCentrifuging}>
              ← 上一步
            </button>
            <div style={{ color: '#fff', fontWeight: 'bold' }}>
              实验进度: <span style={{ color: 'var(--cyan-glow)' }}>{step} / 15</span>
            </div>
            <button className="btn" onClick={handleNext} disabled={step === 15 || isHeating || isCentrifuging}>
              {step === 6 ? '执行溶剂热合成' : step === 8 ? '开启离心机' : step === 15 ? '实验完成' : '下一步 →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}