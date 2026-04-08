import React, { useState, useRef, useEffect } from 'react';

// ================= 数据字典 =================
const ReagentData = {
  A: [
    { id: 'mohr', name: '加入莫尔盐 (Fe<sup>2+</sup>)' },
    { id: 'oxalate', name: '加入草酸钾沉淀剂' },
    { id: 'h2o2', name: '滴加 30% H<sub>2</sub>O<sub>2</sub> 氧化' },
    { id: 'ethanol', name: '无水乙醇 (醇析结晶)' }
  ],
  B: [
    { id: 'cuso4', name: '0.1M CuSO<sub>4</sub> 溶液' },
    { id: 'nh3', name: '滴加浓氨水 (NH<sub>3</sub>)' },
    { id: 'en', name: '加入乙二胺 (en)' },
    { id: 'hcl', name: '加入浓盐酸 (Cl<sup>-</sup>)' }
  ]
};

const CompoundProps = {
  'cuso4': { name: '[Cu(H<sub>2</sub>O)<sub>6</sub>]<sup>2+</sup>', color: 'rgba(56, 189, 248, 0.8)', cn: '6 (畸变八面体)', lambda: '800', delta: '149.6', path: "M 0 100 Q 20 100, 40 80 T 80 20 T 100 100", css: "curve-light-blue", mag: 1.73 },
  'nh3': { name: '[Cu(NH<sub>3</sub>)<sub>4</sub>]<sup>2+</sup>', color: 'rgba(29, 78, 216, 0.9)', cn: '4 (平面正方形)', lambda: '600', delta: '199.5', path: "M 0 100 Q 20 100, 50 20 T 80 80 T 100 100", css: "curve-deep-blue", mag: 1.73 },
  'en': { name: '[Cu(en)<sub>2</sub>]<sup>2+</sup>', color: 'rgba(124, 58, 237, 0.9)', cn: '4 (螯合平面)', lambda: '550', delta: '217.6', path: "M 0 100 Q 30 100, 40 10 T 70 90 T 100 100", css: "curve-purple", mag: 1.73 },
  'hcl': { name: '[CuCl<sub>4</sub>]<sup>2-</sup>', color: 'rgba(132, 204, 22, 0.8)', cn: '4 (变形四面体)', lambda: '950', delta: '80.5', path: "M 0 100 Q 60 100, 90 40 T 100 100", css: "curve-light-blue", mag: 1.73 },
  'mohr': { name: '[Fe(H<sub>2</sub>O)<sub>6</sub>]<sup>2+</sup>', color: 'rgba(163, 230, 53, 0.8)', cn: '6 (八面体)', lambda: '--', delta: '--', path: "M 0 100 L 100 100", css: "curve-ir", mag: 4.90 },
  'oxalate': { name: 'FeC<sub>2</sub>O<sub>4</sub>(s)', color: 'rgba(250, 204, 21, 0.9)', cn: '6', lambda: '--', delta: '--', path: "M 0 100 L 100 100", css: "curve-ir", mag: 4.90 },
  'h2o2': { name: 'K<sub>3</sub>[Fe(C<sub>2</sub>O<sub>4</sub>)<sub>3</sub>] 溶液', color: 'rgba(16, 185, 129, 0.9)', cn: '6 (高自旋)', lambda: '紫外区', delta: 'LMCT掩盖', path: "M 0 10 L 20 90 L 100 100", css: "curve-purple", mag: 5.92 },
  'ethanol': { name: 'K<sub>3</sub>[Fe(C<sub>2</sub>O<sub>4</sub>)<sub>3</sub>]&middot;3H<sub>2</sub>O 晶体', color: 'rgba(5, 150, 105, 0.95)', cn: '6 (高自旋)', lambda: '紫外区', delta: 'LMCT掩盖', path: "M 0 10 L 20 90 L 100 100", css: "curve-purple", mag: 5.92 }
};

export default function VirtualLab() {
  // --- 核心状态 ---
  const [activeModule, setActiveModule] = useState('A');
  const [currentCompoundId, setCurrentCompoundId] = useState('none');
  const [liquidVol, setLiquidVol] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [activeStage, setActiveStage] = useState('stage-reaction');
  const [activeInstCard, setActiveInstCard] = useState('none');

  // --- 视觉控制状态 ---
  const [reactionSetup, setReactionSetup] = useState({ clamps: false, mantle: false, condenser: false, heating: false, stirring: false, water: false, flaskBottom: '30px' });
  const [balanceVal, setBalanceVal] = useState("0.0000 g");
  const [vacTubeOpacity, setVacTubeOpacity] = useState(1);
  const [ovenFanRunning, setOvenFanRunning] = useState(false);

  // --- 状态栏文字 ---
  const [statusText, setStatusText] = useState({ title: '📖 自由探索模式已开启', body: '左侧所有步骤已解锁。您可以随时点击任意按钮或药品进行观察。' });
  const [precautionsText, setPrecautionsText] = useState('您可以随时点击左侧的任何步骤按钮，或点击试剂配置不同化合物。');

  // --- 仪器状态 ---
  const [uvState, setUvState] = useState({ text: '系统待机中...', opacity: 0, path: '', css: '' });
  const [irState, setIrState] = useState({ text: '迈克尔逊干涉仪待机中', opacity: 0, path: '', css: '' });
  const [magState, setMagState] = useState({ text: '请预热并调零', display: '---' });
  const [tgaState, setTgaState] = useState({ text: '加热炉冷却中，等待装样', opacity: 0 });

  // --- UI 交互状态 ---
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [aiOpen, setAiOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 0, role: 'ai', html: '同学你好！我是你的 AI 助教。请点击下方你在预习或实验中遇到的核心难点问题：' }
  ]);
  const chatBodyRef = useRef(null);

  const currentProps = CompoundProps[currentCompoundId] || null;

  // --- 辅助函数 ---
  const showToast = (msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  const addReagent = (id) => {
    const p = CompoundProps[id];
    if (!p) return;
    setCurrentCompoundId(id);
    setLiquidVol(prev => prev === 0 ? 40 : (prev < 80 ? prev + 15 : 80));
    showToast(`成功加入：${p.name.replace(/<[^>]*>?/gm, '')}`); // 去除HTML标签作为Toast提示
  };

  const switchModule = (mod) => {
    setActiveModule(mod);
    setCurrentCompoundId('none');
    setLiquidVol(0);
    doStep(1);
  };

  const resetReactionApparatus = () => {
    setReactionSetup({ clamps: false, mantle: false, condenser: false, heating: false, stirring: false, water: false, flaskBottom: '30px' });
  };

  const resetInstruments = () => {
    setUvState({ text: '系统待机中...', opacity: 0, path: '', css: '' });
    setIrState({ text: '迈克尔逊干涉仪待机中', opacity: 0, path: '', css: '' });
    setMagState({ text: '请预热并调零', display: '---' });
    setTgaState({ text: '加热炉冷却中，等待装样', opacity: 0 });
  };

  const openInstrument = (id) => {
    setActiveInstCard(id);
    resetInstruments();
  };

  const doStep = (step) => {
    setActiveStep(step);
    
    switch (step) {
      case 1:
        openInstrument('none'); setActiveStage('stage-reaction'); resetReactionApparatus();
        setStatusText({ title: '🧪 第1步：试剂沙盒与物种演化', body: '本模块探究不同氧化态与配体形成的配合物稳定性。您可以在上方<strong>随时点击</strong>试剂按钮。' });
        setPrecautionsText("提示：点击左侧试剂框即可看到烧瓶颜色变化。无需拘泥于本提示。");
        break;
      case 2:
        openInstrument('none'); setActiveStage('stage-balance');
        setBalanceVal(activeModule === 'A' ? "5.0021 g" : "2.5011 g");
        setStatusText({ title: '⚖️ 第2步：分析天平称量', body: '将原料转移至天平称量纸上，精确记录质量。' });
        setPrecautionsText("必须佩戴手套，轻开轻关天平门，待读数完全稳定后再记录。");
        break;
      case 3:
        setActiveStage('stage-reaction'); resetReactionApparatus();
        setReactionSetup(prev => ({ ...prev, clamps: true, mantle: true, flaskBottom: '55px' }));
        setStatusText({ title: '⚙️ 第3步：反应体系搭建', body: '将装有试剂的圆底瓶移入恒温磁力搅拌加热套，进行固定。' });
        setPrecautionsText("使用十字夹和铁夹固定圆底烧瓶，铁夹内侧应有橡胶垫或石棉网垫。");
        break;
      case 4:
        setActiveStage('stage-reaction');
        setReactionSetup(prev => ({ ...prev, clamps: true, mantle: true, condenser: true, flaskBottom: '55px' }));
        setStatusText({ title: '⚙️ 第4步：安装球形冷凝管', body: '安装冷凝管进行回流，防止溶剂逃逸。' });
        setPrecautionsText("冷却水软管的连接必须遵循“下进上出”原则，以达到最大冷凝效率。");
        break;
      case 5:
        setActiveStage('stage-reaction');
        setReactionSetup(prev => ({ ...prev, clamps: true, mantle: true, condenser: true, heating: true, stirring: true, water: true, flaskBottom: '55px' }));
        setStatusText({ title: '🔥 第5步：加热、搅拌与回流反应', body: '开启加热套电源，通入冷凝水，体系开始进行反应。' });
        setPrecautionsText("转速旋钮必须从零开始缓慢调高。严禁在完全密闭的体系中加热。");
        break;
      case 6:
        setActiveStage('stage-reaction');
        setReactionSetup(prev => ({ ...prev, clamps: true, mantle: true, condenser: true, heating: false, stirring: false, water: false, flaskBottom: '55px' }));
        setStatusText({ title: '🛑 第6步：反应结束', body: '关闭加热、搅拌及冷却水，待冷却后拆卸装置。' });
        setPrecautionsText("加热套温度较高，需等待降温后佩戴隔热手套拆卸玻璃仪器。");
        break;
      case 7:
        setActiveStage('stage-filtration'); setVacTubeOpacity(1);
        setStatusText({ title: '🌪️ 第7步：布氏漏斗减压抽滤', body: '利用循环水泵产生负压，将晶体与母液快速分离。' });
        setPrecautionsText("必须先拔掉吸滤瓶上的橡胶管解除真空，再关闭水泵电源，严防倒吸！");
        break;
      case 8:
        setActiveStage('stage-oven'); setOvenFanRunning(true);
        setStatusText({ title: '♨️ 第8步：鼓风干燥箱', body: '将晶体置于表面皿进入干燥箱去除溶剂。' });
        setPrecautionsText("必须确认设定温度低于配合物的分解温度或熔点。");
        break;
      case 9:
        setActiveStage('stage-balance');
        setBalanceVal(activeModule === 'A' ? "6.8532 g" : "4.1205 g");
        setStatusText({ title: '⚖️ 第9步：称量计算', body: '记录晶体质量计算产率。即将进入现代仪器表征。' });
        setPrecautionsText("如果产率异常偏低或偏高，需分析误差。");
        break;
      case 10:
        setActiveStage('stage-uvvis'); openInstrument('uvvis');
        setStatusText({ title: '🔬 UV-Vis 分光光度计', body: '吸收特定波长后分子内电子发生跃迁。吸收峰反映了晶体场分裂能的大小。' });
        setPrecautionsText("比色皿只能捏住毛面。先用空白溶剂平扫校零。浓度需极稀。");
        break;
      case 11:
        setActiveStage('stage-ftir'); openInstrument('ftir');
        setStatusText({ title: '🔬 FT-IR 红外光谱', body: '发生干涉后，经 FFT 算法解码为光谱。配位会导致特征峰位移与裂分。' });
        setPrecautionsText("样品与干燥KBr比例约1:100，必须使用红外透明的KBr压片。");
        break;
      case 12:
        setActiveStage('stage-mag'); openInstrument('mag');
        setStatusText({ title: '🧲 Gouy 磁天平分析', body: '顺磁性物质会被磁场吸引导致表现质量增加。' });
        setPrecautionsText("垂直轻敲管底填实，绝不能有空隙或分层，以防磁化率计算偏差。");
        break;
      case 13:
        setActiveStage('stage-tga'); openInstrument('tga');
        setStatusText({ title: '🔥 TGA-DTG 热重分析', body: '记录加热时的质量与热量变化，反映分解过程。' });
        setPrecautionsText("实验前需通入高纯氮气吹扫炉腔，排除空气中氧气的氧化干扰。");
        break;
      default:
        break;
    }
  };

  // --- 仪器操作函数 ---
  const runUVVis = (step) => {
    if (step === 'bg') {
      setUvState(s => ({ ...s, text: '扫描溶剂背景...完成。' }));
    } else if (step === 'scan') {
      setUvState(s => ({ ...s, text: 'Focused Beam Optics 测定中...' }));
      setTimeout(() => {
        if (currentCompoundId !== 'none' && currentProps) {
          setUvState({
            text: `扫描完毕。<br>&lambda;<sub>max</sub>: ${currentProps.lambda} nm<br>&Delta;<sub>o</sub>: ${currentProps.delta} kJ/mol`,
            opacity: 1,
            path: currentProps.path,
            css: currentProps.css
          });
        } else {
          setUvState(s => ({ ...s, text: '请先在上方随意点击一种药品试剂！' }));
        }
      }, 1000);
    }
  };

  const runFTIR = (step) => {
    if (step === 'bg') {
      setIrState(s => ({ ...s, text: '背景扫描完成，消除 H<sub>2</sub>O 和 CO<sub>2</sub>' }));
    } else if (step === 'interferogram') {
      setIrState({
        text: '生成干涉图 (Interferogram)',
        opacity: 1,
        path: "M 0 50 Q 10 90, 20 10 T 30 80 T 40 20 T 50 100 T 60 0 T 70 80 T 80 30 T 90 60 T 100 50",
        css: "curve-light-blue"
      });
    } else if (step === 'fft') {
      setIrState(s => ({ ...s, text: '执行 FFT 算法解析光谱...', path: "M 0 90 L 30 90 L 35 20 L 40 90 L 70 90 L 75 40 L 80 90 L 100 90", css: "curve-ir" }));
      setTimeout(() => {
        setIrState(s => ({ ...s, text: '解析完成：&nu;(C=O) 位移且裂分' }));
      }, 1000);
    }
  };

  const runMag = (step) => {
    if (step === 'zero') {
      setMagState({ display: '000', text: '已调零。记录空管重' });
    } else if (step === 'pack') {
      setMagState(s => ({ ...s, text: '敲击压实至 3.5 cm，拭净外壁' }));
    } else if (step === 'read') {
      if (currentCompoundId !== 'none' && currentProps) {
        setMagState({ display: '284', text: `R = 284。<br>&mu;<sub>eff</sub> = ${currentProps.mag} B.M.` });
      } else {
        setMagState({ display: '284', text: '请先选择一种药品！' });
      }
    }
  };

  const runTGA = (step) => {
    if (step === 'load') {
      setTgaState(s => ({ ...s, text: '样品置于氧化铝坩埚并降入炉体' }));
    } else if (step === 'heat') {
      setTgaState(s => ({ ...s, text: '通入 N<sub>2</sub>。程序升温中...', opacity: 1 }));
      setTimeout(() => {
        setTgaState(s => ({ ...s, text: '测试结束：双台阶失重。<br>脱水及骨架分解' }));
      }, 1500);
    }
  };

  // --- AI 问答交互 ---
  const toggleAIChat = () => setAiOpen(!aiOpen);

  const askAI = (qId) => {
    let qText = "";
    if (qId === 1) qText = "发现 [Cu(H₂O)₆]²⁺ 的 UV-Vis 吸收峰存在不对称“肩峰”，结合姜-泰勒效应解释。";
    else if (qId === 2) qText = "实验要求三草酸铁酸钾避光。请从氧化还原角度解释光促内电子转移？";
    else if (qId === 3) qText = "在生成 [Cu(en)₂]²⁺ 时反应焓变极小，从热力学推导“螯合效应”。";

    const userMsgId = Date.now();
    const loadingId = Date.now() + 1;

    setChatHistory(prev => [
      ...prev,
      { id: userMsgId, role: 'user', html: qText },
      { id: loadingId, role: 'ai', html: '正在分析...' }
    ]);

    setTimeout(() => {
      let ans = '';
      if (qId === 1) ans = `由于 Cu<sup>2+</sup> 是 d<sup>9</sup> 构型，在八面体场中 e<sub>g</sub> 轨道存在轨道简并。根据姜-泰勒效应 <span class="cite-tag"></span>，系统会自发畸变以消除简并，表现为z轴拉长的八面体。这导致跃迁能量分裂，叠加后表现为“肩峰”。`;
      else if (qId === 2) ans = `在强光下，极易发生电荷转移（LMCT）。中心离子 Fe<sup>3+</sup> 具氧化性，草酸根具还原性 <span class="cite-tag"></span>。光能促使电子跃迁至铁的空d轨道，导致 Fe<sup>3+</sup> 被还原，草酸根被氧化分解为 CO<sub>2</sub>，因此必须避光。`;
      else if (qId === 3) ans = `当使用双齿配体取代单齿配体时，反应前后微观粒子数剧增，导致微观状态数大幅增加，即正熵变很大 <span class="cite-tag"></span>。在 &Delta;H 接近时，正熵变使得 &Delta;G &lt;&lt; 0，赋予了螯合极大的自发性。`;

      setChatHistory(prev => prev.map(msg => msg.id === loadingId ? { ...msg, html: ans } : msg));
    }, 800);
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="vle-container">
      <style>{`
        .vle-container {
            --bg-color: #0f172a; --panel-bg: #1e293b; --text-main: #f8fafc;
            --text-muted: #94a3b8; --accent: #3b82f6; --accent-hover: #2563eb;
            --danger: #ef4444; --success: #10b981; --warning: #facc15;
            background-color: var(--bg-color); color: var(--text-main); height: 100vh; display: flex; flex-direction: column; overflow: hidden;
            font-family: 'Segoe UI', Tahoma, sans-serif;
        }
        .vle-container * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .vle-header { background-color: #020617; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; z-index: 100; }
        .title-box h1 { font-size: 1.2rem; font-weight: 600; color: #38bdf8; }
        .title-box p { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }
        .module-switch button { background-color: var(--panel-bg); color: white; border: 1px solid #475569; padding: 6px 15px; border-radius: 5px; cursor: pointer; transition: 0.3s; margin-left: 10px; }
        .module-switch button.active { background-color: var(--accent); border-color: var(--accent); }

        .vle-main { display: flex; flex: 1; height: calc(100vh - 65px); position: relative;}

        .sidebar { width: 310px; background-color: var(--panel-bg); padding: 15px; overflow-y: auto; border-right: 1px solid #334155; display: flex; flex-direction: column; }
        .step-group { margin-bottom: 15px; }
        .step-title { font-size: 0.85rem; color: var(--warning); border-bottom: 1px solid #334155; padding-bottom: 5px; margin-bottom: 10px; font-weight: bold; }
        
        .step-btn { width: 100%; text-align: left; padding: 8px 10px; background: #334155; border: none; border-radius: 4px; color: white; margin-bottom: 6px; cursor: pointer; font-size: 0.85rem; transition: 0.2s; border-left: 4px solid transparent;}
        .step-btn:hover { background: #475569; transform: translateX(5px); }
        .step-btn.active { background: #475569; border-left: 4px solid var(--accent); }
        
        .reagent-box { padding: 10px; background: #0f172a; border-radius: 6px; margin-bottom: 15px; border: 1px dashed #475569; }
        .reagent-btn { display: block; width: 100%; padding: 8px; background: #1e3a8a; border: none; border-radius: 4px; color: white; cursor: pointer; margin-bottom: 5px; font-size: 0.85rem; transition: 0.2s; text-align: left; padding-left: 15px;}
        .reagent-btn:hover { background: #2563eb; transform: scale(1.02); }

        .workbench { flex: 1; position: relative; background: radial-gradient(circle, #334155 0%, #0f172a 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .stage-container { width: 100%; height: 350px; display: flex; justify-content: center; align-items: center; position: relative; }
        
        .workbench-status { background: rgba(0,0,0,0.6); padding: 15px; border-radius: 8px; width: 85%; color: #cbd5e1; min-height: 120px; line-height: 1.6; font-size: 0.9rem; margin-top: 20px; border: 1px solid #475569; overflow-y: auto;}
        .principle-title { color: #38bdf8; font-weight: bold; margin-bottom: 8px; display: block; border-bottom: 1px dashed #475569; padding-bottom: 5px;}

        .visual-item { display: none; position: absolute; flex-direction: column; align-items: center; justify-content: center; transition: all 0.5s; width: 100%; height: 100%;}
        .visual-item.active { display: flex; animation: fadeIn 0.5s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .reaction-setup { position: relative; height: 280px; width: 200px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
        .stand-base { position: absolute; bottom: 0; left: 0; width: 80px; height: 10px; background: #475569; }
        .stand-pole { position: absolute; bottom: 10px; left: 35px; width: 6px; height: 260px; background: #475569; }
        .clamp1, .clamp2 { position: absolute; left: 40px; width: 60px; height: 4px; background: #64748b; }
        .clamp1 { bottom: 100px; } .clamp2 { bottom: 200px; } 
        .mantle { width: 100px; height: 50px; background: #1e293b; border-radius: 10px 10px 5px 5px; position: relative; display: flex; justify-content: center; z-index: 5; border: 2px solid #334155;}
        .flask { width: 80px; height: 100px; border: 3px solid rgba(255,255,255,0.5); border-radius: 40px 40px 10px 10px; position: absolute; z-index: 4; background: rgba(255,255,255,0.05); display: flex; align-items: flex-end; overflow: hidden; clip-path: polygon(30% 0, 70% 0, 100% 100%, 0% 100%); transition: 0.5s;}
        .condenser { width: 20px; height: 120px; border: 2px solid rgba(255,255,255,0.4); border-radius: 8px; position: absolute; bottom: 120px; z-index: 3; background: rgba(135, 206, 235, 0.1); }
        .water-in { position: absolute; bottom: 10px; left: -35px; color: #38bdf8; font-size: 12px; }
        .water-out { position: absolute; top: 10px; right: -35px; color: #38bdf8; font-size: 12px; }
        .liquid-core { width: 100%; height: 0%; background: transparent; transition: all 0.5s; box-shadow: inset 0 0 20px rgba(0,0,0,0.2); }
        .magnetic-bar { width: 20px; height: 6px; background: white; border-radius: 3px; position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); opacity: 0; z-index: 6; }
        .heating { box-shadow: 0 -10px 20px rgba(239, 68, 68, 0.4); }
        .stirring { opacity: 1 !important; animation: spin 0.2s linear infinite; }
        @keyframes spin { 100% { transform: translateX(-50%) rotate(360deg); } }

        .balance { width: 180px; height: 120px; background: #cbd5e1; border-radius: 5px; position: relative; border: 2px solid #94a3b8; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 10px; }
        .balance-glass { position: absolute; top: 0; left: 10px; right: 10px; height: 70px; background: rgba(255,255,255,0.3); border: 1px solid #94a3b8; border-bottom: none; }
        .balance-screen { background: #020617; color: #10b981; font-family: monospace; font-size: 1.2rem; padding: 2px 10px; border-radius: 3px; width: 120px; text-align: right; z-index: 2; }

        .filtration-setup { position: relative; height: 200px; width: 150px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
        .suction-flask { width: 100px; height: 100px; border: 3px solid rgba(255,255,255,0.5); clip-path: polygon(30% 0, 70% 0, 100% 100%, 0 100%); position: relative; background: rgba(255,255,255,0.1); border-radius: 5px; display: flex; align-items: flex-end; }
        .suction-arm { position: absolute; right: -20px; top: 20px; width: 30px; height: 8px; border: 2px solid rgba(255,255,255,0.5); border-left: none; transform: rotate(-10deg); }
        .buchner { position: absolute; bottom: 100px; width: 60px; height: 50px; background: rgba(255,255,255,0.8); clip-path: polygon(0 0, 100% 0, 80% 50%, 60% 50%, 60% 100%, 40% 100%, 40% 50%, 20% 50%); z-index: 6; }
        .vacuum-tube { position: absolute; right: -60px; top: 15px; width: 50px; height: 6px; background: #64748b; transition: 0.3s;}

        .oven { width: 160px; height: 160px; background: #e2e8f0; border-radius: 10px; border: 4px solid #94a3b8; display: flex; justify-content: center; align-items: center; position: relative; }
        .oven-window { width: 100px; height: 100px; background: #020617; border: 2px solid #64748b; position: relative; overflow: hidden; }
        .fan { position: absolute; top: 10px; right: 10px; font-size: 20px; opacity: 0; }
        .fan.running { opacity: 1; animation: spin 0.5s linear infinite; }

        .inst-uv { width: 220px; height: 120px; background: #cbd5e1; border-radius: 8px; border: 2px solid #64748b; display: flex; align-items: center; justify-content: space-around; position: relative; padding: 0 10px;}
        .uv-light { width: 20px; height: 20px; border-radius: 50%; background: #facc15; box-shadow: 0 0 15px #facc15; }
        .uv-cuvette { width: 20px; height: 40px; border: 2px solid #333; transition: 0.5s;}
        .uv-detector { width: 30px; height: 50px; background: #334155; border-radius: 4px; }
        .beam { position: absolute; left: 35px; top: 58px; width: 140px; height: 4px; background: rgba(250, 204, 21, 0.6); z-index: 0; }

        .inst-ir { width: 200px; height: 160px; position: relative; }
        .ir-source { position: absolute; left: 0; top: 70px; width: 20px; height: 20px; background: #ef4444; border-radius: 50%; }
        .ir-splitter { position: absolute; left: 80px; top: 50px; width: 4px; height: 60px; background: #94a3b8; transform: rotate(45deg); }
        .ir-mirror-fix { position: absolute; left: 60px; top: 0; width: 40px; height: 6px; background: #e2e8f0; }
        .ir-mirror-mov { position: absolute; right: 0; top: 60px; width: 6px; height: 40px; background: #e2e8f0; animation: moveMirror 2s infinite alternate; }
        .ir-sample { position: absolute; left: 70px; bottom: 0; width: 20px; height: 20px; background: #a3e635; border-radius: 50%; }

        .inst-mag { width: 140px; height: 180px; position: relative; display: flex; flex-direction: column; align-items: center; }
        .mag-poles { width: 120px; height: 60px; border: 20px solid #ef4444; border-top: none; border-radius: 0 0 60px 60px; margin-top: 60px; position: relative; }
        .mag-poles::after { content: 'N'; position: absolute; left: -15px; top: -20px; color: white; font-weight: bold; }
        .mag-poles::before { content: 'S'; position: absolute; right: -15px; top: -20px; color: white; font-weight: bold; }
        .mag-tube { width: 14px; height: 100px; border: 2px solid rgba(255,255,255,0.8); border-top: none; position: absolute; top: 10px; border-radius: 0 0 7px 7px; transition: 0.5s; }

        .inst-tga { width: 160px; height: 180px; position: relative; display: flex; flex-direction: column; align-items: center; }
        .tga-balance { width: 100px; height: 40px; background: #475569; border-radius: 5px; }
        .tga-wire { width: 2px; height: 60px; background: #fff; }
        .tga-furnace { width: 80px; height: 80px; background: #ef4444; border-radius: 8px; border: 4px solid #334155; display: flex; justify-content: center; align-items: center; box-shadow: inset 0 0 20px #facc15; }
        .tga-pan { width: 20px; height: 10px; background: #e2e8f0; border-radius: 0 0 10px 10px; }

        .dashboard { width: 380px; background-color: var(--panel-bg); border-left: 1px solid #334155; padding: 20px; display: flex; flex-direction: column; gap: 15px; overflow-y: auto;}
        .dashboard-card { background-color: #0f172a; padding: 15px; border-radius: 8px; border: 1px solid #334155; }
        .dashboard-card h3 { font-size: 0.95rem; color: #38bdf8; margin-bottom: 10px; border-bottom: 1px dashed #334155; padding-bottom: 5px; }
        .data-row { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; color: #cbd5e1; border-bottom: 1px dashed #334155; padding-bottom: 3px;}
        .data-val { font-family: monospace; color: #a3e635; font-weight: bold; text-align: right;}

        .inst-card { background-color: #0f172a; padding: 15px; border-radius: 8px; border: 1px solid #334155; display: none; flex-direction: column; gap: 10px;}
        .inst-card.active { display: flex; animation: fadeIn 0.5s; }
        .inst-title { font-size: 1rem; color: #38bdf8; margin-bottom: 5px; border-bottom: 1px dashed #334155; padding-bottom: 5px; font-weight: bold;}
        .screen { width: 100%; height: 140px; background-color: #020617; border-radius: 4px; position: relative; overflow: hidden; border: 1px inset #475569; display: flex; align-items: center; justify-content: center; }
        .chart-curve { position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; transition: 1s ease-in-out; }
        .curve-path { fill: none; strokeWidth: 3; }
        .step-text { font-family: monospace; color: #a3e635; font-size: 0.8rem; text-align: center; padding: 5px; background: rgba(0,0,0,0.6); width: 100%; z-index: 2; position: absolute; }
        
        .action-btn { width: 100%; padding: 10px; background-color: var(--accent); color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 0.85rem;}
        .action-btn:hover { background-color: var(--accent-hover); }

        .curve-light-blue { stroke: #facc15; filter: drop-shadow(0 0 5px #facc15); } 
        .curve-deep-blue { stroke: #f97316; filter: drop-shadow(0 0 5px #f97316); } 
        .curve-purple { stroke: #22c55e; filter: drop-shadow(0 0 5px #22c55e); } 
        .curve-ir { stroke: #38bdf8; strokeWidth: 2; filter: drop-shadow(0 0 3px #38bdf8); }
        .curve-tga { stroke: #10b981; strokeWidth: 2; filter: drop-shadow(0 0 3px #10b981); }

        .precautions-box { background: rgba(245, 158, 11, 0.1); border-left: 4px solid var(--warning); padding: 10px; border-radius: 4px; font-size: 0.8rem; color: #cbd5e1; line-height: 1.6; margin-top: 10px;}
        .precautions-box strong { color: var(--warning); }
        .mag-digital { font-family: 'Courier New', Courier, monospace; font-size: 2rem; color: #ef4444; background: #000; padding: 5px 20px; border-radius: 5px; border: 2px solid #333; text-align: center;}
        
        .toast-msg { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(16, 185, 129, 0.9); color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; transition: 0.3s; z-index: 200; pointer-events: none;}

        .ai-fab { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: #8b5cf6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4); z-index: 1000; transition: 0.3s;}
        .ai-fab:hover { transform: scale(1.1); background: #7c3aed; }
        
        .ai-modal { position: fixed; bottom: 100px; right: 30px; width: 400px; max-height: 500px; background: var(--panel-bg); border: 1px solid #475569; border-radius: 12px; display: none; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 1000; overflow: hidden;}
        .ai-modal.active { display: flex; animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        
        .ai-header { background: #8b5cf6; padding: 15px; color: white; font-weight: bold; display: flex; justify-content: space-between; align-items: center;}
        .ai-header span { font-size: 1rem; }
        .ai-close { cursor: pointer; background: none; border: none; color: white; font-size: 1.2rem;}
        
        .ai-body { padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: #0f172a; flex: 1; height: 350px;}
        .ai-question { background: #334155; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; color: #f8fafc; transition: 0.2s; border-left: 3px solid #8b5cf6;}
        .ai-question:hover { background: #475569; }
        
        .chat-bubble { max-width: 85%; padding: 10px 15px; border-radius: 12px; font-size: 0.85rem; line-height: 1.5; margin-bottom: 10px;}
        .chat-user { background: #3b82f6; color: white; align-self: flex-end; border-bottom-right-radius: 2px;}
        .chat-ai { background: #1e293b; color: #cbd5e1; align-self: flex-start; border: 1px solid #334155; border-bottom-left-radius: 2px;}
        .cite-tag { font-size: 0.7rem; color: #a78bfa; margin-left: 4px; vertical-align: super;}
      `}</style>

      <header className="vle-header">
        <div className="title-box">
          <h1>🧪 SMARTCHEM VLE：过渡金属配合物合成与表征平台 (完全解禁版)</h1>
          <p>已彻底解除所有步骤顺序限制 | 药品随时点击 | 即点即看</p>
        </div>
        <div className="module-switch">
          <button className={activeModule === 'A' ? 'active' : ''} onClick={() => switchModule('A')}>模块 A: 铁配合物</button>
          <button className={activeModule === 'B' ? 'active' : ''} onClick={() => switchModule('B')}>模块 B: 铜配合物</button>
        </div>
      </header>

      <main className="vle-main">
        <aside className="sidebar">
          <div className="step-group">
            <div className="step-title">◆ 药品试剂选择 (可随时点击)</div>
            <div className="reagent-box">
              {ReagentData[activeModule].map(r => (
                <button key={r.id} className="reagent-btn" onClick={() => addReagent(r.id)} dangerouslySetInnerHTML={{ __html: r.name }} />
              ))}
            </div>
          </div>

          <div className="step-group">
            <div className="step-title">I. 反应预处理</div>
            <button className={`step-btn ${activeStep === 1 ? 'active' : ''}`} onClick={() => doStep(1)}>1. 观察烧瓶状态</button>
            <button className={`step-btn ${activeStep === 2 ? 'active' : ''}`} onClick={() => doStep(2)}>2. 分析天平精确称量</button>
          </div>
          
          <div className="step-group">
            <div className="step-title">II. 核心合成操作</div>
            <button className={`step-btn ${activeStep === 3 ? 'active' : ''}`} onClick={() => doStep(3)}>3. 体系搭建 (铁架台+磁力搅拌)</button>
            <button className={`step-btn ${activeStep === 4 ? 'active' : ''}`} onClick={() => doStep(4)}>4. 安装球形冷凝管</button>
            <button className={`step-btn ${activeStep === 5 ? 'active' : ''}`} onClick={() => doStep(5)}>5. 开启加热与搅拌回流</button>
            <button className={`step-btn ${activeStep === 6 ? 'active' : ''}`} onClick={() => doStep(6)}>6. 反应结束，关闭系统</button>
          </div>

          <div className="step-group">
            <div className="step-title">III. 分离纯化与干燥</div>
            <button className={`step-btn ${activeStep === 7 ? 'active' : ''}`} onClick={() => doStep(7)}>7. 布氏漏斗减压抽滤</button>
            <button className={`step-btn ${activeStep === 8 ? 'active' : ''}`} onClick={() => doStep(8)}>8. 鼓风干燥箱恒温干燥</button>
            <button className={`step-btn ${activeStep === 9 ? 'active' : ''}`} onClick={() => doStep(9)}>9. 称量计算产率</button>
          </div>

          <div className="step-group">
            <div className="step-title">IV. 现代仪器表征</div>
            <button className={`step-btn ${activeStep === 10 ? 'active' : ''}`} onClick={() => doStep(10)}>10. UV-Vis 紫外光谱分析</button>
            <button className={`step-btn ${activeStep === 11 ? 'active' : ''}`} onClick={() => doStep(11)}>11. FT-IR 红外光谱分析</button>
            <button className={`step-btn ${activeStep === 12 ? 'active' : ''}`} onClick={() => doStep(12)}>12. Gouy 磁天平分析</button>
            <button className={`step-btn ${activeStep === 13 ? 'active' : ''}`} onClick={() => doStep(13)}>13. TGA-DTG 热重分析</button>
          </div>
        </aside>

        <section className="workbench">
          <div className="stage-container">
            <div className={`visual-item ${activeStage === 'stage-reaction' ? 'active' : ''}`}>
              <div className="reaction-setup">
                <div className="stand-base"></div><div className="stand-pole"></div>
                <div className="clamp1" style={{ display: reactionSetup.clamps ? 'block' : 'none' }}></div>
                <div className="clamp2" style={{ display: reactionSetup.condenser ? 'block' : 'none' }}></div>
                <div className={`mantle ${reactionSetup.heating ? 'heating' : ''}`} style={{ display: reactionSetup.mantle ? 'flex' : 'none' }}></div>
                <div className="flask" style={{ bottom: reactionSetup.flaskBottom }}>
                  <div className="liquid-core" style={{ height: `${liquidVol}%`, backgroundColor: currentProps?.color || 'transparent' }}></div>
                  <div className={`magnetic-bar ${reactionSetup.stirring ? 'stirring' : ''}`}></div>
                </div>
                <div className="condenser" style={{ display: reactionSetup.condenser ? 'block' : 'none' }}>
                  <div className="water-in" style={{ display: reactionSetup.water ? 'block' : 'none' }}>→进水</div>
                  <div className="water-out" style={{ display: reactionSetup.water ? 'block' : 'none' }}>出水→</div>
                </div>
              </div>
            </div>
            
            <div className={`visual-item ${activeStage === 'stage-balance' ? 'active' : ''}`}>
              <div className="balance">
                <div className="balance-glass"></div>
                <div className="balance-screen">{balanceVal}</div>
              </div>
            </div>
            
            <div className={`visual-item ${activeStage === 'stage-filtration' ? 'active' : ''}`}>
              <div className="filtration-setup">
                <div className="suction-flask"><div className="liquid-core" style={{ height: '20%', backgroundColor: 'transparent' }}></div></div>
                <div className="suction-arm"></div>
                <div className="buchner"><div style={{ width: '100%', height: '5px', backgroundColor: currentProps?.color || 'var(--success)', position: 'absolute', bottom: '25px' }}></div></div>
                <div className="vacuum-tube" style={{ opacity: vacTubeOpacity }}></div>
              </div>
            </div>
            
            <div className={`visual-item ${activeStage === 'stage-oven' ? 'active' : ''}`}>
              <div className="oven">
                <div className="oven-window">
                  <div style={{ width: '40px', height: '5px', backgroundColor: currentProps?.color || 'var(--success)', position: 'absolute', bottom: '20px', left: '30px' }}></div>
                  <div className={`fan ${ovenFanRunning ? 'running' : ''}`}>⚙️</div>
                </div>
              </div>
            </div>

            <div className={`visual-item ${activeStage === 'stage-uvvis' ? 'active' : ''}`}>
              <div className="inst-uv">
                <div className="beam"></div><div className="uv-light"></div>
                <div className="uv-cuvette" style={{ backgroundColor: currentProps?.color || 'rgba(56, 189, 248, 0.4)' }}></div>
                <div className="uv-detector"></div>
              </div>
            </div>
            
            <div className={`visual-item ${activeStage === 'stage-ftir' ? 'active' : ''}`}>
              <div className="inst-ir">
                <div className="ir-source"></div><div className="ir-splitter"></div>
                <div className="ir-mirror-fix"></div><div className="ir-mirror-mov"></div><div className="ir-sample"></div>
                <div style={{ position: 'absolute', left: '10px', top: '80px', width: '70px', height: '2px', background: 'red' }}></div>
                <div style={{ position: 'absolute', left: '80px', top: '0', width: '2px', height: '80px', background: 'red' }}></div>
                <div style={{ position: 'absolute', left: '80px', top: '80px', width: '2px', height: '60px', background: 'red' }}></div>
              </div>
            </div>
            
            <div className={`visual-item ${activeStage === 'stage-mag' ? 'active' : ''}`}>
              <div className="inst-mag">
                <div className="tga-balance" style={{ width: '60px' }}></div>
                <div className="mag-tube" style={{ background: currentProps ? `linear-gradient(to top, ${currentProps.color} 35%, transparent 35%)` : 'transparent' }}></div>
                <div className="mag-poles"></div>
              </div>
            </div>
            
            <div className={`visual-item ${activeStage === 'stage-tga' ? 'active' : ''}`}>
              <div className="inst-tga">
                <div className="tga-balance"></div><div className="tga-wire"></div>
                <div className="tga-furnace"><div className="tga-pan"></div></div>
              </div>
            </div>
          </div>
          
          <div className="workbench-status">
            <span className="principle-title">{statusText.title}</span>
            <span dangerouslySetInnerHTML={{ __html: statusText.body }} />
          </div>
        </section>

        <aside className="dashboard">
          <div className="dashboard-card">
            <h3>🧪 物种宏观状态 (VBT预测)</h3>
            <div className="data-row"><span>目标产物体系:</span> <span className="data-val" dangerouslySetInnerHTML={{ __html: currentProps ? currentProps.name : '未选择' }} /></div>
            <div className="data-row"><span>配位构型 (CN):</span> <span className="data-val" dangerouslySetInnerHTML={{ __html: currentProps ? currentProps.cn : '--' }} /></div>
          </div>

          <div className={`inst-card ${activeInstCard === 'uvvis' ? 'active' : ''}`}>
            <div className="inst-title">UV-Vis 分光光度计</div>
            <div className="screen">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart-curve" style={{ opacity: uvState.opacity }}>
                <path d={uvState.path} className={`curve-path ${uvState.css}`} />
              </svg>
              <div className="step-text" dangerouslySetInnerHTML={{ __html: uvState.text }} />
            </div>
            <button className="action-btn" onClick={() => runUVVis('bg')}>1. 采集空白背景 (Background)</button>
            <button className="action-btn" onClick={() => runUVVis('scan')}>2. 测量样品吸收谱</button>
          </div>

          <div className={`inst-card ${activeInstCard === 'ftir' ? 'active' : ''}`}>
            <div className="inst-title">FT-IR 傅里叶变换红外光谱仪</div>
            <div className="screen">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart-curve" style={{ opacity: irState.opacity }}>
                <path d={irState.path} className={`curve-path ${irState.css}`} />
              </svg>
              <div className="step-text" dangerouslySetInnerHTML={{ __html: irState.text }} />
            </div>
            <button className="action-btn" onClick={() => runFTIR('bg')}>1. 采集背景干涉图</button>
            <button className="action-btn" onClick={() => runFTIR('interferogram')}>2. 动镜扫描生成干涉图</button>
            <button className="action-btn" onClick={() => runFTIR('fft')}>3. 执行傅里叶变换 (FFT)</button>
          </div>

          <div className={`inst-card ${activeInstCard === 'mag' ? 'active' : ''}`}>
            <div className="inst-title">Gouy 磁化率天平</div>
            <div className="screen" style={{ flexDirection: 'column', background: '#1e293b', border: 'none' }}>
              <div className="mag-digital">{magState.display}</div>
              <div className="step-text" style={{ position: 'relative', marginTop: '10px', background: 'transparent' }} dangerouslySetInnerHTML={{ __html: magState.text }} />
            </div>
            <button className="action-btn" onClick={() => runMag('zero')}>1. 无管调零并记录空管重</button>
            <button className="action-btn" onClick={() => runMag('pack')}>2. 装样敲击压实至 3.5cm</button>
            <button className="action-btn" onClick={() => runMag('read')}>3. 插入天平读取 R 值</button>
          </div>

          <div className={`inst-card ${activeInstCard === 'tga' ? 'active' : ''}`}>
            <div className="inst-title">TGA-DTA 同步热分析仪</div>
            <div className="screen">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart-curve" style={{ opacity: tgaState.opacity }}>
                <path d="M 0 10 L 20 10 Q 30 10, 35 30 L 60 30 Q 70 30, 80 80 L 100 80" className="curve-path curve-tga" />
              </svg>
              <div className="step-text" dangerouslySetInnerHTML={{ __html: tgaState.text }} />
            </div>
            <button className="action-btn" onClick={() => runTGA('load')}>1. 将样品压实装入氧化铝坩埚</button>
            <button className="action-btn" onClick={() => runTGA('heat')}>2. 通 N<sub>2</sub> 扫气并升温</button>
          </div>

          <div className="precautions-box">
            <strong>⚠️ 操作规范与提示：</strong><br />
            <span>{precautionsText}</span>
          </div>
        </aside>

        <div className="ai-fab" onClick={toggleAIChat}>🤖</div>
        <div className={`ai-modal ${aiOpen ? 'active' : ''}`}>
          <div className="ai-header">
            <span>🧠 AI 深度思考助教</span>
            <button className="ai-close" onClick={toggleAIChat}>×</button>
          </div>
          <div className="ai-body" ref={chatBodyRef}>
            {chatHistory.map(msg => (
              <div key={msg.id} className={`chat-bubble ${msg.role === 'ai' ? 'chat-ai' : 'chat-user'}`} dangerouslySetInnerHTML={{ __html: msg.html }} />
            ))}
            <div className="ai-question" onClick={() => askAI(1)}>❓ 发现 [Cu(H₂O)₆]²⁺ 的吸收峰存在不对称“肩峰”，结合姜-泰勒效应解释。</div>
            <div className="ai-question" onClick={() => askAI(2)}>❓ 实验要求三草酸铁酸钾避光。请从氧化还原角度解释光促内电子转移？</div>
            <div className="ai-question" onClick={() => askAI(3)}>❓ 在生成 [Cu(en)₂]²⁺ 时，反应焓变极小，从热力学推导“螯合效应”。</div>
          </div>
        </div>
      </main>

      <div className="toast-msg" style={{ opacity: toast.visible ? 1 : 0 }}>{toast.msg}</div>
    </div>
  );
}