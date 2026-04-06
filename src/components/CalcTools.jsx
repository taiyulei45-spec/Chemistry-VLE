import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

export default function AIChemistry() {
  // ==========================================
  // 状态管理区
  // ==========================================

  // Module 2: AlphaFold 蛋白质折叠模拟
  const [foldProgress, setFoldProgress] = useState(0); // 0 到 100

  // Module 3: 逆合成路线规划 (Retrosynthesis)
  const [retroStep, setRetroStep] = useState(0); // 0(Target), 1(Cut), 2(Precursors)

  // Module 4: 生成式 AI 药物设计 (De Novo Design)
  const [genEpoch, setGenEpoch] = useState(0); // 训练轮数 0 - 100
  const [isTraining, setIsTraining] = useState(false);

  // 测验与 AI
  const [quizState, setQuizState] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是 AI+化学 交叉学科导师。从机器学习预测分子性质，到 AlphaFold 解析蛋白质 3D 结构，AI 正在彻底颠覆新药研发的流程。\n\n关于“图神经网络(GNN)”、“分子生成模型(VAE/GAN)”或“自动化无人实验室”，随时向我提问！' }
  ]);
  const chatEndRef = useRef(null);

  // ==========================================
  // 交互逻辑与动画数据预处理
  // ==========================================

  // 缓存 AlphaFold 氨基酸节点的起始(1D)与终点(3D折叠)坐标
  const aminoAcids = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
    startX: 20 + i * 12,
    startY: 125,
    // 目标折叠成一个螺旋/紧凑的三维假象
    endX: 200 + 60 * Math.cos(i * 0.5) * (1 - i/40),
    endY: 125 + 60 * Math.sin(i * 0.5) * (1 - i/40)
  })), []);

  // 生成模型训练动画
  useEffect(() => {
    let timer;
    if (isTraining && genEpoch < 100) {
      timer = setInterval(() => setGenEpoch(prev => prev + 2), 50);
    } else if (genEpoch >= 100) {
      setIsTraining(false);
    }
    return () => clearInterval(timer);
  }, [isTraining, genEpoch]);

  // ==========================================
  // SVG 渲染器
  // ==========================================

  // M2: AlphaFold 折叠
  const renderAlphaFoldSVG = () => {
    const pct = foldProgress / 100;
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <text x="200" y="20" fill="var(--text-muted)" fontSize="14" textAnchor="middle">从 1D 氨基酸序列到 3D 空间结构的端到端预测</text>
        
        {/* 连接线 */}
        <path d={aminoAcids.map((aa, i) => {
          const x = aa.startX + (aa.endX - aa.startX) * pct;
          const y = aa.startY + (aa.endY - aa.startY) * pct;
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ')} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>

        {/* 氨基酸节点 */}
        {aminoAcids.map((aa, i) => {
          const x = aa.startX + (aa.endX - aa.startX) * pct;
          const y = aa.startY + (aa.endY - aa.startY) * pct;
          return (
            <circle key={i} cx={x} cy={y} r="5" fill={aa.color} style={{ transition: 'all 0.1s linear' }}/>
          );
        })}

        {foldProgress > 80 && (
          <text x="200" y="220" fill="var(--life-green)" fontSize="16" fontWeight="bold" textAnchor="middle">
            折叠完成！形成具有特定催化活性的三维口袋
          </text>
        )}
      </svg>
    );
  };

  // M3: 逆合成 MCTS
  const renderRetrosynthesisSVG = () => {
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <text x="200" y="20" fill="var(--text-muted)" fontSize="14" textAnchor="middle">蒙特卡洛树搜索 (MCTS) 寻找最优合成路径</text>
        
        {/* Target Molecule */}
        <g transform="translate(200, 60)">
          <polygon points="0,-20 17,-10 17,10 0,20 -17,10 -17,-10" fill="rgba(6,182,212,0.2)" stroke="var(--cyan-glow)" strokeWidth="2"/>
          <line x1="17" y1="10" x2="30" y2="20" stroke="var(--alert-orange)" strokeWidth="2"/>
          <circle cx="30" cy="20" r="4" fill="var(--alert-orange)"/>
          <text x="0" y="4" fill="#fff" fontSize="10" textAnchor="middle">Target</text>
        </g>

        {retroStep >= 1 && (
          <g>
            <path d="M 200 90 L 200 120" stroke="#475569" strokeWidth="2" strokeDasharray="4 2"/>
            <text x="230" y="110" fill="var(--pink-glow)" fontSize="12" fontWeight="bold">AI 识别切断键</text>
            <line x1="210" y1="75" x2="225" y2="65" stroke="var(--alert-red)" strokeWidth="2"/>
            <line x1="215" y1="80" x2="220" y2="60" stroke="var(--alert-red)" strokeWidth="2"/>
          </g>
        )}

        {retroStep >= 2 && (
          <g>
            <path d="M 200 120 L 130 160" stroke="var(--life-green)" strokeWidth="2" markerEnd="url(#arrow_retro)"/>
            <path d="M 200 120 L 270 160" stroke="var(--life-green)" strokeWidth="2" markerEnd="url(#arrow_retro)"/>
            
            {/* Precursor 1 */}
            <g transform="translate(110, 180)">
              <polygon points="0,-15 13,-7 13,7 0,15 -13,7 -13,-7" fill="rgba(16,185,129,0.2)" stroke="var(--life-green)" strokeWidth="2"/>
              <text x="0" y="4" fill="#fff" fontSize="10" textAnchor="middle">Synthon A</text>
            </g>
            
            {/* Precursor 2 */}
            <g transform="translate(290, 180)">
              <circle cx="0" cy="0" r="10" fill="rgba(245,158,11,0.2)" stroke="var(--alert-orange)" strokeWidth="2"/>
              <text x="0" y="3" fill="#fff" fontSize="10" textAnchor="middle">Br</text>
            </g>
            
            <text x="200" y="230" fill="var(--cyan-glow)" fontSize="14" fontWeight="bold" textAnchor="middle">成功规划出具有高商业可得性的前体路径！</text>
          </g>
        )}

        <defs>
          <marker id="arrow_retro" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--life-green)"/></marker>
        </defs>
      </svg>
    );
  };

  // M4: 生成模型 GAN / VAE
  const renderGenerativeSVG = () => {
    // 模拟从无序噪声收敛到有序分子的过程
    const noiseLevel = 1 - (genEpoch / 100);
    const loss = (2.5 * Math.exp(-genEpoch / 20) + 0.1).toFixed(3);
    
    return (
      <svg width="100%" height="250" viewBox="0 0 400 250">
        <text x="200" y="20" fill="var(--text-muted)" fontSize="14" textAnchor="middle">潜在空间 (Latent Space) 采样与分子生成</text>
        
        <rect x="50" y="40" width="100" height="150" fill="rgba(139,92,246,0.1)" stroke="var(--purple-med)" strokeWidth="2" rx="8"/>
        <text x="100" y="120" fill="var(--purple-med)" fontSize="14" fontWeight="bold" textAnchor="middle">生成器 (Generator)</text>

        <path d="M 150 115 L 230 115" stroke="var(--cyan-glow)" strokeWidth="3" strokeDasharray="5 5"><animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.5s" repeatCount="indefinite"/></path>

        {/* 右侧动态生成分子 */}
        <g transform="translate(290, 115)">
          {/* 中心苯环点位 */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = i * 60 * Math.PI / 180;
            // 随着 Epoch 增加，随机偏移逐渐减小，收敛于正六边形
            const rx = 30 * Math.cos(angle) + (Math.random() - 0.5) * 100 * noiseLevel;
            const ry = 30 * Math.sin(angle) + (Math.random() - 0.5) * 100 * noiseLevel;
            return <circle key={i} cx={rx} cy={ry} r="4" fill="var(--life-green)" style={{ transition: 'all 0.1s' }}/>;
          })}
          {genEpoch > 80 && <polygon points="30,0 15,26 -15,26 -30,0 -15,-26 15,-26" fill="rgba(16,185,129,0.2)" stroke="var(--life-green)" strokeWidth="2"/>}
        </g>
        
        {/* 数据面板 */}
        <rect x="10" y="200" width="380" height="40" fill="#020617" rx="6"/>
        <text x="100" y="225" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">Epoch: {genEpoch} / 100</text>
        <text x="300" y="225" fill="var(--alert-red)" fontSize="14" fontWeight="bold" textAnchor="middle">Loss: {loss}</text>
      </svg>
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
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在连线底层大模型，检索计算化学文献...' }]);

    try {
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, '人工智能在化学与医药领域的应用');
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
    <div className="aichem-wrapper">
      <style>{`
        .aichem-wrapper { --bg-dark: #020617; --bg-panel: rgba(15, 23, 42, 0.8); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --sz-gold: #fbbf24; --pink-glow: #ec4899; background: var(--bg-dark); color: #f8fafc; font-family: 'Segoe UI', sans-serif; line-height: 1.6; overflow-x: hidden; }
        
        .aichem-wrapper h1, .aichem-wrapper h2, .aichem-wrapper h3 { color: var(--cyan-glow); margin-top: 0; }
        .aichem-wrapper h2 { border-left: 5px solid var(--purple-med); padding-left: 10px; margin: 30px 0 20px 0; font-size: 1.5rem; color: #fff;}
        .aichem-wrapper section { padding: 40px 5%; border-bottom: 1px solid rgba(255,255,255,0.05); }
        
        .aichem-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .aichem-wrapper .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .aichem-wrapper .panel { background: var(--bg-panel); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .aichem-wrapper .svg-box { border: 1px solid #334155; border-radius: 12px; background: radial-gradient(circle, rgba(15,23,42,0.9), rgba(2,6,23,1)); padding: 20px; min-height: 280px; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
        
        .aichem-wrapper .btn { background: linear-gradient(135deg, var(--cyan-glow), var(--primary-blue)); border: none; padding: 12px 24px; color: #fff; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; width: 100%; margin-top: 15px; }
        .aichem-wrapper .btn:hover:not(:disabled) { box-shadow: 0 4px 15px rgba(6, 182, 212, 0.5); transform: translateY(-2px); }
        .aichem-wrapper .btn-outline { background: transparent; border: 1px solid var(--purple-med); color: var(--purple-med); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; font-size: 13px; margin-right: 8px; }
        .aichem-wrapper .btn-outline:hover, .aichem-wrapper .btn-outline.active { background: rgba(139, 92, 246, 0.2); color: #fff; }
        
        .aichem-wrapper .quiz-card { background: rgba(0,0,0,0.4); border-radius: 10px; padding: 20px; border-left: 4px solid var(--sz-gold); margin-bottom: 15px; }
        .aichem-wrapper .quiz-opt { background: #0f172a; border: 1px solid #334155; color: var(--text-muted); padding: 12px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; display: block; width: 100%; text-align: left; margin-bottom: 10px; }
        .aichem-wrapper .quiz-opt:hover { background: rgba(6, 182, 212, 0.1); border-color: var(--cyan-glow); color: #fff; }
        
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        .markdown-prose strong { color: var(--cyan-glow); }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(139, 92, 246, 0); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        .hero-brain { animation: pulse-ring 3s infinite; }
      `}</style>

      {/* Hero Banner */}
      <section style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)', paddingTop: '60px', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          {/* AI Brain Icon */}
          <div className="hero-brain" style={{ width: '80px', height: '80px', background: 'var(--purple-med)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#fff' }}>memory</span>
          </div>
          <path d="M 0 0 L 50 0" stroke="var(--cyan-glow)" strokeWidth="4" strokeDasharray="5 5"/>
          {/* Molecule Icon */}
          <svg width="80" height="80" viewBox="0 0 100 100">
            <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="var(--cyan-glow)" strokeWidth="4"/>
            <circle cx="50" cy="10" r="5" fill="var(--life-green)"/>
            <circle cx="85" cy="70" r="5" fill="var(--alert-red)"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '3rem', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 20px 0' }}>AI 与前沿化学：硅基智能重塑碳基生命</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto' }}>“从试管烧杯到 GPU 矩阵，从偶然发现到精准生成。人工智能正在将化学从一门实验科学，进化为一门计算与数据驱动的精确科学。”</p>
      </section>

      {/* Module 1: 核心方向概览 */}
      <section>
        <h2>模块一：AI 赋能化学的四大引擎</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)' }}>🔬 分子性质预测 (Property Prediction)</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>
              利用<strong>图神经网络 (GNN)</strong>（如 Chemprop），将分子的原子视作“节点”，化学键视作“边”。AI 可以瞬间预测出分子的毒性、水溶性 (LogP)、跨膜能力甚至受体结合亲和力，彻底替代了耗时极长的小鼠毒理实验。<br/><br/>
              <strong>经典案例：</strong>MIT 研究团队利用深度学习模型，从包含 1.07 亿个分子的文库中，仅仅耗时几天便筛选出了全新的广谱抗生素 <strong>Halicin</strong>，对抗超级细菌。
            </p>
          </div>
          <div className="panel">
            <h3 style={{ color: 'var(--pink-glow)' }}>⚡ 量子化学与分子动力学加速</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>
              传统的密度泛函理论 (DFT) 计算极其精准但极度耗时，无法模拟大体系。利用<strong>神经网络势函数 (Neural Network Potentials, 如 SchNet, DeepMD)</strong>，AI 能够学习 DFT 的计算规律，在保持第一性原理精度的同时，将计算速度提升数百万倍！<br/><br/>
              <strong>经典案例：</strong>2020年戈登·贝尔奖得主利用 DeepMD 在超级计算机上实现了对包含 1 亿个原子的体系进行 1 纳秒精度的从头算分子动力学模拟。
            </p>
          </div>
        </div>
      </section>

      {/* Module 2: AlphaFold */}
      <section>
        <h2>模块二：破解半个世纪的魔咒 —— AlphaFold 与蛋白质折叠</h2>
        <div className="grid-2">
          <div className="svg-box">{renderAlphaFoldSVG()}</div>
          <div className="panel">
            <h3 style={{ color: 'var(--life-green)' }}>从 1D 序列到 3D 口袋的端到端预测</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              蛋白质的三维结构决定了它的生物学功能（如作为药物靶点）。在过去，解开一个蛋白质的 3D 结构需要耗费研究员数月甚至数年的冷冻电镜或 X 射线晶体学实验。<br/><br/>
              DeepMind 团队开发的 <strong>AlphaFold 2</strong> 基于 Transformer 架构和多序列比对 (MSA)，直接输入一维氨基酸序列，几分钟内就能输出达到原子级精度 (误差 &lt; 1 Å) 的三维结构。这直接为靶向药物设计提供了数亿个现成的靶点口袋！
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: 'var(--cyan-glow)', fontWeight: 'bold' }}>拉动滑块，模拟 Evoformer 模块的折叠推演：{foldProgress}%</label>
              <input type="range" min="0" max="100" value={foldProgress} onChange={e => setFoldProgress(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--life-green)', marginTop: '10px' }}/>
            </div>
          </div>
        </div>
      </section>

      {/* Module 3: 逆合成 */}
      <section>
        <h2>模块三：化学家的“导航仪” —— 计算机辅助逆合成规划</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--alert-orange)' }}>蒙特卡洛树搜索 (MCTS) 的化学应用</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              逆合成分析是指从复杂的目标分子倒推，逐步寻找简单、廉价市售原料的过程。过去这完全依赖化学家的大脑直觉和经验积累。<br/><br/>
              现在，诸如 <strong>ASKCOS</strong> 或 <strong>IBM RXN</strong> 等系统，将庞大的已知化学反应库作为规则，运用与 AlphaGo 下围棋相同的 <strong>MCTS (蒙特卡洛树搜索)</strong> 算法。AI 在亿万种切割组合中不断评估“合成可行性得分”，规划出最优、成本最低的合成路线。
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="btn-outline" onClick={() => setRetroStep(0)}>重置目标分子</button>
              <button className="btn-outline" onClick={() => setRetroStep(1)}>1. 策略网络预测切断位点</button>
              <button className="btn" style={{ width: 'auto', flex: 1, marginTop: '0' }} onClick={() => setRetroStep(2)}>2. 搜索最优前体化合物</button>
            </div>
          </div>
          <div className="svg-box">{renderRetrosynthesisSVG()}</div>
        </div>
      </section>

      {/* Module 4: 生成式 AI */}
      <section>
        <h2>模块四：无中生有 —— 生成式 AI 药物设计 (De Novo Design)</h2>
        <div className="grid-2">
          <div className="svg-box">{renderGenerativeSVG()}</div>
          <div className="panel">
            <h3 style={{ color: 'var(--purple-med)' }}>在化学潜在空间中“画”出新药</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1' }}>
              人类已知的化合物只是化学空间（约 $10^{60}$ 种可能分子）的沧海一粟。传统的筛选是“在干草堆里找针”，而生成式 AI 则是“直接制造一根完美的针”。<br/><br/>
              利用 <strong>变分自编码器 (VAE)、生成对抗网络 (GAN) 或 强化学习 (RL)</strong>，AI 可以学习分子的底层语法，从连续的数学潜在空间中反向解码，直接生成出自然界从未存在过，但完美契合靶点、且毒性极低的新型分子结构。<br/><br/>
              <strong>经典案例：</strong>Insilico Medicine 公司利用生成模型 GENTRL，仅耗时 <strong>21 天</strong> 就从零设计并合成出了一款 DDR1 激酶抑制剂，震惊了传统医药界。
            </p>
            <button className="btn" style={{ background: 'var(--purple-med)' }} onClick={() => {setGenEpoch(0); setIsTraining(true);}} disabled={isTraining}>
              {isTraining ? '模型训练与收敛中...' : '🚀 启动生成模型 (Train Model)'}
            </button>
          </div>
        </div>
      </section>

      {/* Module 5: 无人实验室 */}
      <section>
        <h2>模块五：未来形态 —— 自动驾驶实验室 (Self-driving Labs)</h2>
        <div className="panel" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--sz-gold)', marginTop: 0 }}>闭环的终极形态：AI 大脑 + 机械手臂</h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.8 }}>
              化学研究的终极未来是：研究员只需输入一个目标（如“寻找一种高效率的太阳能光催化剂”），自动驾驶实验室就能完成余下的一切。<br/><br/>
              <strong>1. AI 设计实验：</strong>基于贝叶斯优化，提出下一组合成参数。<br/>
              <strong>2. 机械臂执行：</strong>液体工作站和移动机器人 (Mobile Robot Chemist) 自动抓取试剂、加料、控温、搅拌。<br/>
              <strong>3. 自动表征与反馈：</strong>仪器自动测试产物性能，将结果实时传回 AI 大脑更新模型。<br/><br/>
              利物浦大学的移动机器人化学家可以 <strong>24小时不间断工作，一周盲测了 688 个实验</strong>，速度是人类博士生的上千倍。
            </p>
          </div>
          <div style={{ width: '200px', height: '200px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid var(--sz-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '60px', color: 'var(--sz-gold)' }}>precision_manufacturing</span>
            <span style={{ marginTop: '10px', color: '#fff', fontWeight: 'bold' }}>24/7 Autonomous</span>
          </div>
        </div>
      </section>

      {/* 测验区 */}
      <section>
        <h3 style={{ color: 'var(--alert-orange)' }}>⚔️ AI for Science 思维道场</h3>
        <div className="grid-2">
          <div className="quiz-card">
            <p style={{ fontWeight: 'bold', color: '#fff' }}>1. 深度学习模型 AlphaFold 2 在化学和生物学界引发了巨大轰动，它主要解决了什么经典问题？</p>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q1: 'wrong'})}>A. 预测任意无机小分子的水溶性</button>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q1: 'correct'})}>B. 根据一维氨基酸序列，准确预测蛋白质的三维空间结构</button>
            {quizState.q1 && <p style={{ color: quizState.q1 === 'correct' ? 'var(--life-green)' : 'var(--alert-red)' }}>{quizState.q1 === 'correct' ? '正确！AlphaFold2 解决了结构生物学 50 年的宏伟挑战。' : '错误。这是蛋白质领域的革命。'}</p>}
          </div>
          <div className="quiz-card">
            <p style={{ fontWeight: 'bold', color: '#fff' }}>2. 在进行复杂的药物分子合成时，用来规划“最佳合成路线”的人工智能技术通常依赖于哪种核心算法？</p>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q2: 'wrong'})}>A. 仅使用基础的线性回归网络</button>
            <button className="quiz-opt" onClick={() => setQuizState({...quizState, q2: 'correct'})}>B. 蒙特卡洛树搜索 (MCTS) 结合深度神经网络</button>
            {quizState.q2 && <p style={{ color: quizState.q2 === 'correct' ? 'var(--life-green)' : 'var(--alert-red)' }}>{quizState.q2 === 'correct' ? '正确！像下围棋一样，AI 预测了每一步切割带来的高价值收益。' : '错误。逆合成搜索空间极其庞大，需要类似 AlphaGo 的搜索树策略。'}</p>}
          </div>
        </div>
      </section>

      {/* AI Bot */}
      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)} style={{ position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--cyan-glow), var(--purple-med))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', cursor: 'pointer', zIndex: 100, boxShadow: '0 0 20px rgba(139,92,246,0.6)' }}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block', position: 'fixed', bottom: '100px', right: '30px', width: '360px', background: 'var(--bg-dark)', border: '1px solid var(--cyan-glow)', borderRadius: '12px', padding: '20px', zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.9)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '15px' }}>AI4S 智能导师</h3>
          <div style={{ height: '240px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--cyan-glow)' : '#fff' }}>
                <strong>{msg.role === 'ai' ? 'AI 导师' : '你'}:</strong>
                <div className="markdown-prose" style={{ color: '#cbd5e1', marginTop: '4px' }}>
                  {msg.role === 'ai' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="探讨计算化学与大模型..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: '#1e293b', color: '#fff', outline: 'none' }} />
            <button onClick={(e) => handleChatSubmit(e, true)} style={{ background: 'var(--cyan-glow)', color: '#0f172a', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 'bold' }}>send</span></button>
          </div>
        </div>
      )}
    </div>
  );
}