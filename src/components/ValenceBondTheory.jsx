import React, { useState, useEffect, useRef } from 'react';

export default function ValenceBondTheory() {
  const [ligandType, setLigandType] = useState('mono');
  const [currentComp, setCurrentComp] = useState('AgNH3');
  const [stageSlider, setStageSlider] = useState(1);

  const [q1Ans, setQ1Ans] = useState('');
  const [q2Ans, setQ2Ans] = useState('');
  const [quizResult, setQuizResult] = useState({ text: '', color: '' });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '你好！我是你的无机化学 AI助教。关于“内外轨配合物、配位数计算、或是配体的命名”，你有什么疑问吗？\n(例如您可以问：“如何快速判断一个配体是强场还是弱场？” 或 “EDTA 为什么能解金属中毒？”)' }
  ]);
  const chatEndRef = useRef(null);

  // === 模块一数据 ===
  const ligandData = {
    'mono': {
      title: '单齿配体 (Monodentate)',
      desc: '代表：氨分子 (NH₃), 氰根 (CN⁻), 水 (H₂O)',
      struct: <>H₃<span className="hl-atom">N</span>: &nbsp;&nbsp;&nbsp;&nbsp; :<span className="hl-atom">C</span>≡N⁻</>,
      calc: '计算公式：配位数 = 配体数 × 1',
      note: '说明：每个配体只能提供 1 个配位原子与中心离子结合。'
    },
    'bi': {
      title: '双齿配体 (Bidentate)',
      desc: '代表：乙二胺 (en), 草酸根 (ox)',
      struct: <>H₂<span className="hl-atom">N</span>-CH₂-CH₂-<span className="hl-atom">N</span>H₂ &nbsp;&nbsp;&nbsp;&nbsp; ⁻<span className="hl-atom">O</span>OC-CO<span className="hl-atom">O</span>⁻</>,
      calc: '计算公式：配位数 = 配体数 × 2',
      note: '说明：像一个夹子，1个配体分子能同时用 2个配位原子 钳住中心离子，形成稳定的螯合环。'
    },
    'hexa': {
      title: '六齿配体 (Hexadentate)',
      desc: '代表：乙二胺四乙酸 (EDTA)',
      struct: <div style={{fontSize:'14px'}}>(⁻<span className="hl-atom">O</span>OC-CH₂)₂<span className="hl-atom">N</span>-CH₂-CH₂-<span className="hl-atom">N</span>(CH₂-CO<span className="hl-atom">O</span>⁻)₂</div>,
      calc: '计算公式：配位数 = 配体数 × 6',
      note: '说明：终极螯合剂！1个 EDTA 分子能提供 2个N 和 4个O 共 6 个配位原子，像八爪鱼一样紧紧包裹金属离子。'
    }
  };

  // === 模块三数据 ===
  const complexData = {
    'AgNH3': {
      title: '[Ag(NH₃)₂]⁺', hyb: 'sp', orbit: '外轨型', mag: '抗磁性', shape: '直线形 (Linear)',
      stages: {
        1: { name: '自由中心离子', desc: '银离子 Ag⁺ 基态核外电子排布为 [Kr] 4d¹⁰，5s 和 5p 轨道为空。', orbitals: [{ label: '4d', boxes: ['↑↓','↑↓','↑↓','↑↓','↑↓'] }, { label: '5s', boxes: [''] }, { label: '5p', boxes: ['','',''] }] },
        2: { name: '配体逼近', desc: 'NH₃ 配体逼近，由于 4d 轨道已经全满，电子无法重排，只能使用现成的空轨道。', orbitals: [{ label: '4d', boxes: ['↑↓','↑↓','↑↓','↑↓','↑↓'] }, { label: '5s', boxes: [''] }, { label: '5p', boxes: ['','',''] }] },
        3: { name: '轨道杂化 (sp)', desc: 'Ag⁺ 取 1个 5s 和 1个 5p 轨道进行等性杂化，形成 2个能量相等的 sp 杂化空轨道，呈 180° 排布。', orbitals: [{ label: '4d', boxes: ['↑↓','↑↓','↑↓','↑↓','↑↓'] }, { label: 'sp杂化', boxes: ['',''], isHyb: true }, { label: '5p未参与', boxes: ['',''] }] },
        4: { name: '形成配位键', desc: '2个 NH₃ 分子各自提供一对孤对电子 (图中绿色)，填入 2个 sp 杂化空轨道，形成 [Ag(NH₃)₂]⁺。', orbitals: [{ label: '4d', boxes: ['↑↓','↑↓','↑↓','↑↓','↑↓'] }, { label: 'sp杂化', boxes: ['⇅','⇅'], isHyb: true, isLigand: true }, { label: '5p未参与', boxes: ['',''] }] }
      },
      svg: <><line x1="60" y1="150" x2="240" y2="150" stroke="var(--cyan-glow)" strokeWidth="8" strokeLinecap="round"/><circle cx="150" cy="150" r="25" fill="var(--purple-med)"/><text x="150" y="155" fill="#fff" fontWeight="bold" textAnchor="middle">Ag</text><circle cx="60" cy="150" r="20" fill="var(--life-green)"/><text x="60" y="155" fill="#000" fontWeight="bold" fontSize="12" textAnchor="middle">NH<tspan dy="3" fontSize="9">3</tspan></text><circle cx="240" cy="150" r="20" fill="var(--life-green)"/><text x="240" y="155" fill="#000" fontWeight="bold" fontSize="12" textAnchor="middle">NH<tspan dy="3" fontSize="9">3</tspan></text></>
    },
    'NiCl4': {
      title: '[NiCl₄]²⁻', hyb: 'sp³', orbit: '外轨型', mag: '顺磁性', shape: '正四面体 (Tetrahedral)',
      stages: {
        1: { name: '自由中心离子', desc: '镍离子 Ni²⁺ 基态排布为 [Ar] 3d⁸，含有2个未成对电子。', orbitals: [{ label: '3d', boxes: ['↑↓','↑↓','↑↓','↑','↑'] }, { label: '4s', boxes: [''] }, { label: '4p', boxes: ['','',''] }] },
        2: { name: '弱场配体逼近', desc: 'Cl⁻ 是弱场配体，排斥力较弱。3d 电子不克服成对能发生重排，保持原状。', orbitals: [{ label: '3d', boxes: ['↑↓','↑↓','↑↓','↑','↑'] }, { label: '4s', boxes: [''] }, { label: '4p', boxes: ['','',''] }] },
        3: { name: '轨道杂化 (sp³)', desc: '由于内层 3d 没有空轨道，Ni²⁺ 动用外层的 1个 4s 和 3个 4p 轨道，杂化形成 4个 sp³ 杂化空轨道。', orbitals: [{ label: '3d', boxes: ['↑↓','↑↓','↑↓','↑','↑'] }, { label: 'sp³杂化', boxes: ['','','',''], isHyb: true }] },
        4: { name: '形成配位键', desc: '4个 Cl⁻ 离子的孤对电子填入 sp³ 空轨道，形成外轨型配合物。因含有单电子，呈顺磁性。', orbitals: [{ label: '3d', boxes: ['↑↓','↑↓','↑↓','↑','↑'] }, { label: 'sp³杂化', boxes: ['⇅','⇅','⇅','⇅'], isHyb: true, isLigand: true }] }
      },
      svg: <><line x1="150" y1="140" x2="150" y2="40" stroke="var(--cyan-glow)" strokeWidth="10" strokeLinecap="round"/><line x1="150" y1="140" x2="60" y2="200" stroke="var(--cyan-glow)" strokeWidth="10" strokeLinecap="round"/><line x1="150" y1="140" x2="240" y2="200" stroke="var(--cyan-glow)" strokeWidth="10" strokeLinecap="round"/><line x1="150" y1="140" x2="150" y2="210" stroke="#475569" strokeWidth="6" strokeDasharray="5" strokeLinecap="round"/><circle cx="150" cy="140" r="22" fill="var(--purple-med)"/><text x="150" y="145" fill="#fff" fontWeight="bold" textAnchor="middle">Ni</text><circle cx="150" cy="30" r="16" fill="var(--life-green)"/><text x="150" y="35" fill="#000" fontWeight="bold" textAnchor="middle">Cl</text><circle cx="50" cy="210" r="16" fill="var(--life-green)"/><text x="50" y="215" fill="#000" fontWeight="bold" textAnchor="middle">Cl</text><circle cx="250" cy="210" r="16" fill="var(--life-green)"/><text x="250" y="215" fill="#000" fontWeight="bold" textAnchor="middle">Cl</text><circle cx="150" cy="210" r="12" fill="var(--life-green)"/><text x="150" y="214" fill="#000" fontWeight="bold" fontSize="10" textAnchor="middle">Cl</text></>
    },
    'NiCN4': {
      title: '[Ni(CN)₄]²⁻', hyb: 'dsp²', orbit: '内轨型', mag: '抗磁性', shape: '平面正方形 (Square Planar)',
      stages: {
        1: { name: '自由中心离子', desc: '镍离子 Ni²⁺ 基态排布为 [Ar] 3d⁸，含有2个未成对电子。', orbitals: [{ label: '3d', boxes: ['↑↓','↑↓','↑↓','↑','↑'] }, { label: '4s', boxes: [''] }, { label: '4p', boxes: ['','',''] }] },
        2: { name: '强场配体逼近', desc: 'CN⁻ 是强场配体！强大的排斥力迫使 3d 中的 2个单电子挤入同一个轨道配对，腾出 1个内层 3d 空轨道。', orbitals: [{ label: '3d', boxes: ['↑↓','↑↓','↑↓','↑↓',''] }, { label: '4s', boxes: [''] }, { label: '4p', boxes: ['','',''] }] },
        3: { name: '轨道杂化 (dsp²)', desc: 'Ni²⁺ 利用腾出的 1个 3d，加上 1个 4s 和 2个 4p，杂化成 4个 dsp² 杂化空轨道，共面分布。', orbitals: [{ label: '3d未参与', boxes: ['↑↓','↑↓','↑↓','↑↓'] }, { label: 'dsp²杂化', boxes: ['','','',''], isHyb: true }, { label: '4p未参与', boxes: [''] }] },
        4: { name: '形成配位键', desc: '4个 CN⁻ 的孤对电子填入 dsp² 空轨道。由于所有电子均已成对，呈抗磁性，构型为平面正方形。', orbitals: [{ label: '3d未参与', boxes: ['↑↓','↑↓','↑↓','↑↓'] }, { label: 'dsp²杂化', boxes: ['⇅','⇅','⇅','⇅'], isHyb: true, isLigand: true }, { label: '4p未参与', boxes: [''] }] }
      },
      svg: <><polygon points="60,110 240,110 240,190 60,190" fill="rgba(6, 182, 212, 0.1)" stroke="var(--cyan-glow)" strokeDasharray="2"/><line x1="150" y1="150" x2="60" y2="110" stroke="var(--cyan-glow)" strokeWidth="8"/><line x1="150" y1="150" x2="240" y2="110" stroke="var(--cyan-glow)" strokeWidth="8"/><line x1="150" y1="150" x2="60" y2="190" stroke="var(--cyan-glow)" strokeWidth="8"/><line x1="150" y1="150" x2="240" y2="190" stroke="var(--cyan-glow)" strokeWidth="8"/><circle cx="150" cy="150" r="22" fill="var(--purple-med)"/><text x="150" y="155" fill="#fff" fontWeight="bold" textAnchor="middle">Ni</text><circle cx="50" cy="105" r="16" fill="var(--life-green)"/><text x="50" y="110" fill="#000" fontWeight="bold" fontSize="12" textAnchor="middle">CN</text><circle cx="250" cy="105" r="16" fill="var(--life-green)"/><text x="250" y="110" fill="#000" fontWeight="bold" fontSize="12" textAnchor="middle">CN</text><circle cx="50" cy="195" r="16" fill="var(--life-green)"/><text x="50" y="200" fill="#000" fontWeight="bold" fontSize="12" textAnchor="middle">CN</text><circle cx="250" cy="195" r="16" fill="var(--life-green)"/><text x="250" y="200" fill="#000" fontWeight="bold" fontSize="12" textAnchor="middle">CN</text></>
    },
    'FeF6': {
      title: '[FeF₆]³⁻', hyb: 'sp³d²', orbit: '外轨型', mag: '强顺磁(高自旋)', shape: '正八面体 (Octahedral)',
      stages: {
        1: { name: '自由中心离子', desc: '铁离子 Fe³⁺ 基态排布为 [Ar] 3d⁵，5个单电子分占5个 3d 轨道（半满极稳定）。', orbitals: [{ label: '3d', boxes: ['↑','↑','↑','↑','↑'] }, { label: '4s', boxes: [''] }, { label: '4p', boxes: ['','',''] }, { label: '4d', boxes: ['','','','',''] }] },
        2: { name: '弱场配体逼近', desc: 'F⁻ 是典型弱场配体，无法撼动极其稳定的 3d⁵ 半满结构，电子不配对，保持高自旋状态。', orbitals: [{ label: '3d', boxes: ['↑','↑','↑','↑','↑'] }, { label: '4s', boxes: [''] }, { label: '4p', boxes: ['','',''] }, { label: '4d', boxes: ['','','','',''] }] },
        3: { name: '轨道杂化 (sp³d²)', desc: '因内层无空位，Fe³⁺ 动用 1个 4s、3个 4p 和外层的 2个 4d 轨道，进行 sp³d² 杂化，形成 6个空轨道。', orbitals: [{ label: '3d未参与', boxes: ['↑','↑','↑','↑','↑'] }, { label: 'sp³d²杂化', boxes: ['','','','','',''], isHyb: true }, { label: '4d剩余', boxes: ['','',''] }] },
        4: { name: '形成配位键', desc: '6个 F⁻ 的孤对电子填入 sp³d² 杂化轨道。由于保留了5个未成对电子，具有很强的顺磁性。', orbitals: [{ label: '3d未参与', boxes: ['↑','↑','↑','↑','↑'] }, { label: 'sp³d²杂化', boxes: ['⇅','⇅','⇅','⇅','⇅','⇅'], isHyb: true, isLigand: true }, { label: '4d剩余', boxes: ['','',''] }] }
      },
      svg: <><line x1="150" y1="150" x2="150" y2="40" stroke="var(--cyan-glow)" strokeWidth="8"/><line x1="150" y1="150" x2="150" y2="260" stroke="var(--cyan-glow)" strokeWidth="8"/><line x1="150" y1="150" x2="60" y2="120" stroke="var(--cyan-glow)" strokeWidth="6" strokeDasharray="4"/><line x1="150" y1="150" x2="240" y2="120" stroke="var(--cyan-glow)" strokeWidth="6" strokeDasharray="4"/><line x1="150" y1="150" x2="60" y2="180" stroke="var(--cyan-glow)" strokeWidth="10"/><line x1="150" y1="150" x2="240" y2="180" stroke="var(--cyan-glow)" strokeWidth="10"/><circle cx="150" cy="150" r="20" fill="var(--purple-med)"/><text x="150" y="155" fill="#fff" fontWeight="bold" textAnchor="middle">Fe</text><circle cx="150" cy="30" r="14" fill="var(--life-green)"/><text x="150" y="35" fill="#000" fontWeight="bold" textAnchor="middle">F</text><circle cx="150" cy="270" r="14" fill="var(--life-green)"/><text x="150" y="275" fill="#000" fontWeight="bold" textAnchor="middle">F</text><circle cx="50" cy="115" r="12" fill="var(--life-green)"/><circle cx="250" cy="115" r="12" fill="var(--life-green)"/><circle cx="50" cy="185" r="16" fill="var(--life-green)"/><circle cx="250" cy="185" r="16" fill="var(--life-green)"/></>
    },
    'FeCN6': {
      title: '[Fe(CN)₆]³⁻', hyb: 'd²sp³', orbit: '内轨型', mag: '弱顺磁(低自旋)', shape: '正八面体 (Octahedral)',
      stages: {
        1: { name: '自由中心离子', desc: '铁离子 Fe³⁺ 基态排布为 [Ar] 3d⁵，5个单电子分占5个 3d 轨道。', orbitals: [{ label: '3d', boxes: ['↑','↑','↑','↑','↑'] }, { label: '4s', boxes: [''] }, { label: '4p', boxes: ['','',''] }] },
        2: { name: '强场配体逼近', desc: 'CN⁻ 是强场配体！强大的静电和反键排斥力迫使 3d⁵ 的电子违背洪特规则配对，挤进3个轨道，腾出 2个内层空轨道。', orbitals: [{ label: '3d', boxes: ['↑↓','↑↓','↑','',''] }, { label: '4s', boxes: [''] }, { label: '4p', boxes: ['','',''] }] },
        3: { name: '轨道杂化 (d²sp³)', desc: 'Fe³⁺ 利用内层腾出的 2个 3d，结合 1个 4s 和 3个 4p 轨道，杂化形成 6个 d²sp³ 杂化空轨道。', orbitals: [{ label: '3d未参与', boxes: ['↑↓','↑↓','↑'] }, { label: 'd²sp³杂化', boxes: ['','','','','',''], isHyb: true }] },
        4: { name: '形成配位键', desc: '6个 CN⁻ 孤对电子填入 d²sp³ 轨道。形成内轨型配合物，由于只剩 1 个未成对电子，表现为弱顺磁性（低自旋）。', orbitals: [{ label: '3d未参与', boxes: ['↑↓','↑↓','↑'] }, { label: 'd²sp³杂化', boxes: ['⇅','⇅','⇅','⇅','⇅','⇅'], isHyb: true, isLigand: true }] }
      },
      svg: <><line x1="150" y1="150" x2="150" y2="40" stroke="var(--cyan-glow)" strokeWidth="8"/><line x1="150" y1="150" x2="150" y2="260" stroke="var(--cyan-glow)" strokeWidth="8"/><line x1="150" y1="150" x2="60" y2="120" stroke="var(--cyan-glow)" strokeWidth="6" strokeDasharray="4"/><line x1="150" y1="150" x2="240" y2="120" stroke="var(--cyan-glow)" strokeWidth="6" strokeDasharray="4"/><line x1="150" y1="150" x2="60" y2="180" stroke="var(--cyan-glow)" strokeWidth="10"/><line x1="150" y1="150" x2="240" y2="180" stroke="var(--cyan-glow)" strokeWidth="10"/><circle cx="150" cy="150" r="20" fill="var(--purple-med)"/><text x="150" y="155" fill="#fff" fontWeight="bold" textAnchor="middle">Fe</text><circle cx="150" cy="30" r="14" fill="var(--life-green)"/><text x="150" y="35" fill="#000" fontWeight="bold" fontSize="10" textAnchor="middle">CN</text><circle cx="150" cy="270" r="14" fill="var(--life-green)"/><text x="150" y="275" fill="#000" fontWeight="bold" fontSize="10" textAnchor="middle">CN</text><circle cx="45" cy="115" r="14" fill="var(--life-green)"/><text x="45" y="120" fill="#000" fontWeight="bold" fontSize="10" textAnchor="middle">CN</text><circle cx="255" cy="115" r="14" fill="var(--life-green)"/><text x="255" y="120" fill="#000" fontWeight="bold" fontSize="10" textAnchor="middle">CN</text><circle cx="45" cy="185" r="14" fill="var(--life-green)"/><text x="45" y="190" fill="#000" fontWeight="bold" fontSize="10" textAnchor="middle">CN</text><circle cx="255" cy="185" r="14" fill="var(--life-green)"/><text x="255" y="190" fill="#000" fontWeight="bold" fontSize="10" textAnchor="middle">CN</text></>
    }
  };

  const activeLigand = ligandData[ligandType];
  const activeCompData = complexData[currentComp];
  const activeStage = activeCompData.stages[stageSlider];
  const stageLabels = ['1. 自由中心离子', '2. 配体逼近', '3. 空轨道杂化', '4. 配位键形成'];
  const stageColors = ['var(--cyan-glow)', '#f59e0b', 'var(--purple-med)', 'var(--ligand-color)'];

  const submitQuiz = () => {
    if (q1Ans === 'C' && q2Ans === 'B') {
      setQuizResult({ text: "✅ 完全正确！你不仅掌握了多齿配体（如EDTA）配位数的乘法计算本质，还深刻理解了强场配体挤压内层d轨道电子成对的微观机制！", color: "var(--life-green)" });
    } else {
      setQuizResult({ text: "❌ 回答有误。提示：EDTA 是六齿配体，1个分子能提供6个配位原子，故 CN=6；CN⁻ 强场迫使 Fe³⁺(3d⁵) 电子配对，未成对电子数从5骤降至1，磁性大幅减小。", color: "var(--alert-orange)" });
    }
  };

  const handleChat = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && chatInput.trim()) {
      const val = chatInput.trim();
      setChatHistory(prev => [...prev, { role: 'user', text: val }]);
      setChatInput('');
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: "好问题！在配位化学中，<strong>EDTA (乙二胺四乙酸)</strong> 被称为“终极解毒剂”。因为它是一个<strong>六齿配体</strong>，含有2个氮原子和4个氧原子。这6个配位原子可以像八爪鱼一样，从上下左右前后六个方向紧紧钳住重金属离子（如 Pb²⁺, Hg²⁺），形成极其稳定的具有多个五元环的螯合物。由于这种超级稳定的“螯合效应”，重金属离子被牢牢锁死，随着尿液排出体外，从而达到解毒的目的。<br><br>判断配体强弱通常参考<strong>光谱化学序列 (Spectrochemical series)</strong>。常见的弱场配体主要是卤素离子（I⁻ < Br⁻ < Cl⁻ < F⁻）和含氧配体（如 H₂O, OH⁻），它们排斥力弱，形成外轨高自旋。而含有 C 或 N 供电子原子的配体（如 NH₃, en, NO₂⁻, CN⁻, CO）通常是强场配体，容易迫使金属 d 电子配对，形成内轨低自旋配合物。" }]);
      }, 1000);
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, isChatOpen]);

  return (
    <div className="vbt-wrapper">
      <style>{`
        .vbt-wrapper { --bg-dark: #0a0f1a; --bg-panel: rgba(20, 30, 48, 0.7); --primary-blue: #3b82f6; --cyan-glow: #06b6d4; --life-green: #10b981; --alert-orange: #f59e0b; --alert-red: #ef4444; --purple-med: #8b5cf6; --pink-glow: #ec4899; --text-main: #f8fafc; --ligand-color: #34d399; background: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', system-ui, sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
        .vbt-wrapper h1, .vbt-wrapper h2, .vbt-wrapper h3, .vbt-wrapper h4 { color: var(--cyan-glow); }
        .vbt-wrapper h2 { border-left: 5px solid var(--primary-blue); padding-left: 15px; margin-bottom: 30px;}
        .vbt-wrapper section { min-height: 100vh; padding: 60px 10%; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
        .vbt-wrapper .btn { background: linear-gradient(135deg, var(--primary-blue), var(--purple-med)); border: none; padding: 12px 24px; color: #fff; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
        .vbt-wrapper .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6); }
        .vbt-wrapper .btn-outline { background: transparent; border: 1px solid var(--cyan-glow); color: var(--cyan-glow); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; margin: 5px; }
        .vbt-wrapper .btn-outline:hover, .vbt-wrapper .btn-outline.active { background: rgba(6, 182, 212, 0.2); box-shadow: 0 0 10px rgba(6, 182, 212, 0.5); border-color: var(--cyan-glow); color: #fff; }
        .vbt-wrapper .grid-2 { display: grid; grid-template-columns: 1fr 1.2fr; gap: 40px; }
        .vbt-wrapper .panel { background: var(--bg-panel); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
        .vbt-wrapper .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .vbt-wrapper .summary-card { background: rgba(15, 23, 42, 0.8); border: 1px solid var(--primary-blue); border-radius: 12px; padding: 25px; transition: all 0.3s; box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.05); }
        .vbt-wrapper .summary-card:hover { transform: translateY(-10px); box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2); border-color: var(--cyan-glow); }
        .vbt-wrapper .card-icon { font-size: 2.5rem; margin-bottom: 15px; }
        .vbt-wrapper .tag { display: inline-block; background: rgba(16, 185, 129, 0.15); color: var(--life-green); padding: 4px 10px; border-radius: 4px; font-size: 12px; margin-top: 10px; border: 1px solid var(--life-green); }
        .vbt-wrapper .orbital-row { display: flex; align-items: center; margin-bottom: 15px; gap: 10px; flex-wrap: wrap; }
        .vbt-wrapper .orbital-label { width: 60px; font-weight: bold; color: #94a3b8; text-align: right; }
        .vbt-wrapper .orbital-box-group { display: flex; gap: 4px; border-right: 1px dashed rgba(255,255,255,0.2); padding-right: 10px; }
        .vbt-wrapper .orbital-box-group:last-child { border-right: none; }
        .vbt-wrapper .orbital-box { width: 36px; height: 36px; border: 1px solid var(--primary-blue); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #fff; background: rgba(59, 130, 246, 0.1); position: relative; transition: all 0.5s; }
        .vbt-wrapper .orbital-box.hybridized { border-color: var(--purple-med); background: rgba(139, 92, 246, 0.2); box-shadow: 0 0 8px rgba(139,92,246,0.5); }
        .vbt-wrapper .orbital-box.empty { border-color: #475569; background: rgba(255,255,255,0.02); }
        .vbt-wrapper .ligand-e { color: var(--ligand-color); font-weight: bold; text-shadow: 0 0 5px var(--ligand-color); font-size: 20px;}
        .vbt-wrapper .svg-container { display: flex; align-items: center; justify-content: center; flex-direction: column; border: 2px dashed var(--purple-med); border-radius: 16px; background: radial-gradient(circle, rgba(15,23,42,0.8), rgba(15,23,42,1)); padding: 20px; position: relative; min-height: 400px; overflow: hidden; }
        .vbt-wrapper .data-box { display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; border: 1px solid #334155; text-align: center; }
        .vbt-wrapper .data-val { font-size: 20px; font-weight: bold; color: var(--cyan-glow); margin-top: 5px; }
        .vbt-wrapper .quiz-item { margin-bottom: 25px; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; border-left: 3px solid var(--purple-med); }
        .vbt-wrapper .quiz-item label { display: block; margin: 8px 0; cursor: pointer; padding: 8px; border-radius: 5px; transition: 0.2s; background: rgba(255,255,255,0.05); }
        .vbt-wrapper .quiz-item label:hover { background: rgba(255,255,255,0.15); }
        .vbt-wrapper .ai-bot { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background: linear-gradient(135deg, var(--cyan-glow), var(--purple-med)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; cursor: pointer; box-shadow: 0 0 20px rgba(139, 92, 246, 0.6); z-index: 100; transition: transform 0.3s; }
        .vbt-wrapper .ai-bot:hover { transform: scale(1.1); }
        .vbt-wrapper .ai-chat-window { position: fixed; bottom: 100px; right: 30px; width: 340px; background: var(--bg-dark); border: 1px solid var(--purple-med); border-radius: 12px; padding: 20px; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.8); }
        .vbt-wrapper .ai-chat-window input { width: calc(100% - 22px); padding: 10px; border-radius: 6px; border: none; margin-top: 10px; background: #1e293b; color: #fff;}
        .vbt-wrapper .formula-box { background: rgba(0,0,0,0.4); padding: 10px 15px; border-radius: 6px; font-family: monospace; color: var(--alert-orange); word-break: break-all; margin: 10px 0; border-left: 3px solid var(--alert-orange); }
        .vbt-wrapper .hl-num { color: var(--pink-glow); font-weight: bold; }
        .vbt-wrapper .hl-ligand { color: var(--life-green); font-weight: bold; }
        .vbt-wrapper .hl-center { color: var(--primary-blue); font-weight: bold; }
        .vbt-wrapper .hl-val { color: var(--alert-orange); font-weight: bold; }
        .vbt-wrapper .hl-atom { color: var(--alert-red); font-weight: bold; text-shadow: 0 0 8px rgba(239, 68, 68, 0.6); font-size: 1.1em; }
      `}</style>

      <section id="hero" style={{ textAlign: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, var(--bg-dark) 100%)' }}>
        <svg width="300" height="250" viewBox="0 0 300 250" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 20px var(--primary-blue))' }}>
          <g stroke="var(--cyan-glow)" strokeWidth="2" fill="none">
            <polygon points="60,130 150,160 240,130 150,100" strokeDasharray="4"/>
            <line x1="150" y1="30" x2="60" y2="130"/><line x1="150" y1="30" x2="150" y2="160"/>
            <line x1="150" y1="30" x2="240" y2="130"/><line x1="150" y1="30" x2="150" y2="100"/>
            <line x1="150" y1="230" x2="60" y2="130"/><line x1="150" y1="230" x2="150" y2="160"/>
            <line x1="150" y1="230" x2="240" y2="130"/><line x1="150" y1="230" x2="150" y2="100"/>
          </g>
          <circle cx="150" cy="130" r="20" fill="var(--purple-med)"/><text x="150" y="135" fill="#fff" fontWeight="bold" textAnchor="middle">M</text>
          <circle cx="150" cy="30" r="12" fill="var(--life-green)"/><circle cx="150" cy="230" r="12" fill="var(--life-green)"/>
          <circle cx="60" cy="130" r="12" fill="var(--life-green)"/><circle cx="240" cy="130" r="12" fill="var(--life-green)"/>
          <circle cx="150" cy="100" r="10" fill="#34d399"/><circle cx="150" cy="160" r="14" fill="#34d399"/>
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,10; 0,0" dur="4s" repeatCount="indefinite"/>
        </svg>
        <h1 style={{ fontSize: '3rem', marginTop: '10px', background: '-webkit-linear-gradient(45deg, var(--cyan-glow), var(--purple-med))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>配合物：从命名到价键微观理论</h1>
        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '40px' }}>“当中心离子的空轨道与配体的孤对电子相遇，杂化与重组造就了缤纷的配位世界。”</p>
        <button className="btn" onClick={() => document.getElementById('module1').scrollIntoView()}>进入配位化学世界 ↓</button>
      </section>

      <section id="module1" style={{ paddingTop: '20px' }}>
        <h2>模块一：配位基础 —— 命名法则与配位数计算</h2>
        <div className="grid-2">
          <div className="panel">
            <h3 style={{ color: 'var(--cyan-glow)', marginTop: 0 }}>1. 配合物的命名公式</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>命名顺序总是从右向左。在内界（即方括号 [ ] 内的内容）中，遵循以下严格顺序：</p>
            <div className="formula-box" style={{ fontSize: '16px', textAlign: 'center' }}>
                <span className="hl-num">[配体数]</span> <span className="hl-ligand">[配体名称]</span> + 合 + <span className="hl-center">[中心离子]</span><span className="hl-val">(氧化态)</span>
            </div>
            <h4 style={{ color: '#fff', marginTop: '20px', borderBottom: '1px solid #334', paddingBottom: '5px' }}>经典案例拆解：</h4>
            <ul style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
              <li><strong>[Ag(NH₃)₂]⁺</strong><br/>命名：<span className="hl-num">二</span><span className="hl-ligand">氨</span>合<span className="hl-center">银</span><span className="hl-val">(I)</span> 离子</li>
              <li><strong>K₃[Fe(CN)₆]</strong><br/>命名：<span className="hl-num">六</span><span className="hl-ligand">氰</span>合<span className="hl-center">铁</span><span className="hl-val">(III)</span>酸钾<br/><em style={{ color:'#64748b', fontSize: '12px' }}>(注：若配离子为阴离子，需在中心原子后加“酸”字)</em></li>
              <li><strong>[Cu(NH₃)₄]SO₄</strong><br/>命名：硫酸<span className="hl-num">四</span><span className="hl-ligand">氨</span>合<span className="hl-center">铜</span><span className="hl-val">(II)</span></li>
            </ul>
          </div>
          <div className="panel" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'var(--life-green)' }}>
            <h3 style={{ color: 'var(--life-green)', marginTop: 0 }}>2. 配位数(CN)的计算与配位原子</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '15px' }}><strong>注意：配位数 ≠ 配体数！</strong> 配位数是指直接与中心离子键合的<span className="hl-atom">配位原子</span>的总数。</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button className={`btn-outline ${ligandType==='mono'?'active':''}`} style={{ borderColor: 'var(--life-green)', color: ligandType==='mono'?'#fff':'var(--life-green)' }} onClick={()=>setLigandType('mono')}>单齿配体</button>
              <button className={`btn-outline ${ligandType==='bi'?'active':''}`} style={{ borderColor: 'var(--life-green)', color: ligandType==='bi'?'#fff':'var(--life-green)' }} onClick={()=>setLigandType('bi')}>双齿配体</button>
              <button className={`btn-outline ${ligandType==='hexa'?'active':''}`} style={{ borderColor: 'var(--life-green)', color: ligandType==='hexa'?'#fff':'var(--life-green)' }} onClick={()=>setLigandType('hexa')}>六齿配体</button>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '8px', minHeight: '180px' }}>
              <div style={{ fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>{activeLigand.title}</div>
              <div style={{ color: 'var(--cyan-glow)', fontSize: '14px', margin: '10px 0' }} dangerouslySetInnerHTML={{ __html: activeLigand.desc }}></div>
              <div style={{ fontFamily: 'monospace', fontSize: '18px', color: '#cbd5e1', background: '#1e293b', padding: '10px', borderRadius: '4px', textAlign: 'center', marginBottom: '10px' }}>{activeLigand.struct}</div>
              <div style={{ color: 'var(--alert-orange)', fontWeight: 'bold' }}>{activeLigand.calc}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '5px' }}>{activeLigand.note}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="module2">
        <h2>模块二：理论要点 —— 配位键与杂化本质</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-icon">🤝</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>1. 配位键：特殊的共价键</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>普通共价键：</strong>成键双方各提供一个未成对电子，配对成键。<br/><br/><strong>配位共价键：</strong>一方（中心金属离子）提供<strong>空轨道</strong>，另一方（配位原子）提供<strong>孤对电子</strong>。本质上仍是电子云重叠形成的极性共价键。</p>
          </div>
          <div className="summary-card">
            <div className="card-icon">🧬</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>2. 中心离子的轨道杂化</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>VBT 核心假设：</strong>中心离子的能量相近的空轨道在配体逼近时，会发生重新组合（杂化），形成数目相等、方向特定的<strong>杂化空轨道</strong>。</p>
            <div className="tag">空轨道数 = 配位数</div>
          </div>
          <div className="summary-card">
            <div className="card-icon">🧲</div>
            <h3 style={{ color: '#fff', marginTop: 0 }}>3. 内外轨与磁性特征</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}><strong>内轨型配合物：</strong>强场配体（如 CN⁻）迫使中心离子 d 电子违背洪特规则成对，腾出内层 (n-1)d 轨道参与杂化，通常为低自旋、抗磁性。<br/><strong>外轨型配合物：</strong>弱场配体（如 F⁻）排斥力弱，借用外层 nd 轨道杂化，通常为高自旋、顺磁性。</p>
          </div>
        </div>
      </section>

      <section id="module3">
        <h2>模块三：动态微观 —— 轨道杂化与配位全过程演化</h2>
        <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-panel)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <strong style={{ color: 'var(--cyan-glow)', marginRight: '15px' }}>选择配位体系案例：</strong>
          <button className={`btn-outline ${currentComp==='AgNH3'?'active':''}`} onClick={()=> {setCurrentComp('AgNH3'); setStageSlider(1);}}>[Ag(NH₃)₂]⁺ (CN=2)</button>
          <button className={`btn-outline ${currentComp==='NiCl4'?'active':''}`} onClick={()=> {setCurrentComp('NiCl4'); setStageSlider(1);}}>[NiCl₄]²⁻ (外轨四面体)</button>
          <button className={`btn-outline ${currentComp==='NiCN4'?'active':''}`} onClick={()=> {setCurrentComp('NiCN4'); setStageSlider(1);}}>[Ni(CN)₄]²⁻ (内轨平面)</button>
          <button className={`btn-outline ${currentComp==='FeF6'?'active':''}`} onClick={()=> {setCurrentComp('FeF6'); setStageSlider(1);}}>[FeF₆]³⁻ (外轨八面体)</button>
          <button className={`btn-outline ${currentComp==='FeCN6'?'active':''}`} onClick={()=> {setCurrentComp('FeCN6'); setStageSlider(1);}}>[Fe(CN)₆]³⁻ (内轨八面体)</button>
        </div>
        <div className="grid-2">
          <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, color: 'var(--pink-glow)' }} dangerouslySetInnerHTML={{ __html: activeCompData.title }}></h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div className="data-box" style={{ flex: 1 }}><span style={{ fontSize:'12px', color:'#cbd5e1' }}>杂化类型</span><span className="data-val" dangerouslySetInnerHTML={{ __html: activeCompData.hyb }}></span></div>
              <div className="data-box" style={{ flex: 1, borderColor: 'var(--primary-blue)' }}><span style={{ fontSize:'12px', color:'#cbd5e1' }}>内外轨型</span><span className="data-val" style={{ color: 'var(--primary-blue)' }}>{activeCompData.orbit}</span></div>
              <div className="data-box" style={{ flex: 1, borderColor: 'var(--alert-orange)' }}><span style={{ fontSize:'12px', color:'#cbd5e1' }}>磁性特征</span><span className="data-val" style={{ color: 'var(--alert-orange)' }}>{activeCompData.mag}</span></div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', flex: 1, position: 'relative' }}>
              <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>微观演变阶段：</span>
                <input type="range" min="1" max="4" value={stageSlider} onChange={e=>setStageSlider(parseInt(e.target.value))} style={{ width: '150px', accentColor: 'var(--cyan-glow)', verticalAlign: 'middle', margin: '0 15px' }} />
                <span style={{ color: stageColors[stageSlider-1], fontWeight: 'bold' }}>{stageLabels[stageSlider-1]}</span>
              </div>
              <p style={{ color:'#cbd5e1', fontSize:'13px', lineHeight: 1.6, minHeight: '40px', marginTop: 0 }}><strong>{activeStage.name}：</strong><span dangerouslySetInnerHTML={{ __html: activeStage.desc }}></span></p>
              <div style={{ minHeight: '150px', marginTop: '20px' }}>
                {activeStage.orbitals.map((group, idx) => (
                  <div className="orbital-row" key={idx}>
                    <div className="orbital-label" style={{ color: group.isHyb ? 'var(--purple-med)' : '' }}>{group.label}</div>
                    <div className="orbital-box-group">
                      {group.boxes.map((e, i) => {
                        let isLigand = group.isLigand && e === '⇅';
                        let clz = group.isHyb ? 'hybridized' : (e === '' ? 'empty' : '');
                        return <div key={i} className={`orbital-box ${clz}`}>{isLigand ? <span className="ligand-e">{e}</span> : e}</div>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="svg-container">
            <h3 style={{ marginTop: 0, color: '#fff', textShadow: '0 0 5px var(--cyan-glow)' }}>配合物空间几何构型</h3>
            <div style={{ color: 'var(--cyan-glow)', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>{activeCompData.shape}</div>
            <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="300" height="300" viewBox="0 0 300 300">{activeCompData.svg}</svg>
            </div>
          </div>
        </div>
      </section>

      <section id="module4">
        <h2>模块四：教学闭环 —— 科学启迪与随堂挑战</h2>
        <div className="grid-2">
          <div className="panel" style={{ background: 'rgba(139, 92, 246, 0.1)', borderColor: 'var(--purple-med)' }}>
            <h3 style={{ color: 'var(--pink-glow)' }}>🚩 科学启迪：环境重塑内在，配体决定命运</h3>
            <p><strong>1. 强场与弱场的隐喻：</strong> 同样是铁离子 (Fe³⁺)，遇到温和的弱场配体 (F⁻)，它保持随性（高自旋，外轨）；遇到强势的强场配体 (CN⁻)，它被迫改变原有的电子排布，将电子挤压配对以腾出内层轨道（低自旋，内轨）。这启示我们：<strong>外部环境的压力和属性，往往能深刻改变事物的内在结构与表现形式</strong>。</p>
            <p><strong>2. 空轨道哲学（包容与合作）：</strong> 在配位键中，金属离子并不提供电子，而是提供包容一切的“空轨道”，让配体的孤对电子得以安家。这是最经典的“空杯心态”与合作共赢，体系由此获得了极高的稳定性。</p>
          </div>
          <div>
            <h3>核心考点在线测评</h3>
            <div className="quiz-item">
              <p>1. 【配位数计算】配合物 [Ca(EDTA)]²⁻ 中，虽然 EDTA 只有一个分子，但钙离子的配位数(CN)是多少？</p>
              <label><input type="radio" name="q1" onChange={()=>setQ1Ans('A')} /> A. CN = 1，因为只有一个配体</label>
              <label><input type="radio" name="q1" onChange={()=>setQ1Ans('B')} /> B. CN = 4，因为有4个羧基氧原子参与配位</label>
              <label><input type="radio" name="q1" onChange={()=>setQ1Ans('C')} /> C. CN = 6，因为 EDTA 是六齿配体，提供2个N和4个O共6个配位原子</label>
            </div>
            <div className="quiz-item">
              <p>2. 【磁性与电子配对】相比于外轨型配合物 [FeF₆]³⁻，内轨型配合物 [Fe(CN)₆]³⁻ 的磁矩显著减小，根本原因是：</p>
              <label><input type="radio" name="q2" onChange={()=>setQ2Ans('A')} /> A. 氟原子电负性大，夺走了铁的电子</label>
              <label><input type="radio" name="q2" onChange={()=>setQ2Ans('B')} /> B. 氰根是强场配体，导致铁离子的 3d 电子克服成对能发生配对，未成对单电子数减少</label>
              <label><input type="radio" name="q2" onChange={()=>setQ2Ans('C')} /> C. CN⁻ 占据了外层 4d 轨道，抵消了磁性</label>
            </div>
            <button className="btn" onClick={submitQuiz}>提交试卷检测</button>
            {quizResult.text && <p style={{ marginTop: '15px', fontWeight: 'bold', color: quizResult.color }}>{quizResult.text}</p>}
          </div>
        </div>
      </section>

      <div className="ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>🤖</div>
      {isChatOpen && (
        <div className="ai-chat-window" style={{ display: 'block' }}>
            <h3 style={{ marginTop: 0, color: 'var(--cyan-glow)', fontSize: '16px' }}>配位化学 AI助教</h3>
            <div style={{ height: '200px', overflowY: 'auto', fontSize: '13px', marginBottom: '10px', color: '#cbd5e1', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ marginTop: '10px', color: msg.role === 'ai' ? 'var(--cyan-glow)' : '#fff' }}>
                    <strong>{msg.role === 'ai' ? 'AI助教' : '你'}:</strong> <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
                  </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <input type="text" placeholder="输入问题，按回车发送..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={handleChat} />
        </div>
      )}
    </div>
  );
}