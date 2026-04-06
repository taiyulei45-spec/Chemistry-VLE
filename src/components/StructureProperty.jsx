import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 模块 1: 铂类抗肿瘤药物发展史 (Cisplatin Evolution)
// ==========================================
const CisplatinModule = () => {
  const [activeGen, setActiveGen] = useState(1);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: '你好！我是 Pt-Bot 教授。欢迎来到铂类药物研发实验室。点击上方的分子看看它们的结构变化，有什么问题随时问我！' }
  ]);

  const drugData = {
    1: {
      title: '第一代：顺铂 (Cisplatin)',
      subtitle: 'PtCl2(NH3)2',
      desc: '顺铂是经典的铂类抗肿瘤药物。它进入细胞后，氯离子离去，与DNA上的鸟嘌呤交联，阻断DNA复制。',
      toxicity: '极高。具有严重的肾毒性和耳毒性，恶心呕吐发生率极高。',
      mechanism: '氯离子作为离去基团，在血液中(高氯环境)较稳定，但在细胞内(低氯环境)迅速水解脱落。'
    },
    2: {
      title: '第二代：卡铂 (Carboplatin)',
      subtitle: '以环丁烷二羧酸取代氯离子',
      desc: '为了降低顺铂的剧烈毒性，科学家将离去基团替换为1,1-环丁烷二羧酸（CBDCA）。',
      toxicity: '显著降低。肾毒性大幅减小，但主要副作用转为骨髓抑制。',
      mechanism: '形成了稳定的**六元双齿螯合环**，取代了原来活泼的单齿氯离子。双齿螯合效应大大增加了分子的热力学稳定性，使其在体内不易过早水解，从而降低了毒副作用。'
    },
    3: {
      title: '第三代：奥沙利铂 (Oxaliplatin)',
      subtitle: '引入DACH保留基团',
      desc: '针对顺铂产生的耐药性问题，保留基团替换成了(1R,2R)-DACH（环己二胺），离去基团替换为草酸根。',
      toxicity: '较小。无明显肾毒性，主要表现为外周神经毒性。',
      mechanism: 'DACH基团巨大的空间位阻，使得生成的铂-DNA加合物难以被细胞的修复蛋白识别和修复，从而有效克服了耐药性。'
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: newMsg }]);
    setChatInput('');

    // Bot Response Logic
    setTimeout(() => {
      let reply = "这是一个非常值得深挖的化学问题！试着结合我们在主界面观察到的**结构变化**来自己推导一下？";
      if (newMsg.includes("答案") || newMsg.includes("抄")) {
        reply = "抄答案可做不出新药哦！结合结构，用你自己的话描述一下吧。";
      } else if (newMsg.includes("毒") || newMsg.includes("副作用")) {
        reply = "非常好！降低毒性的关键就是让离去基团更难脱落。结合这里的**螯合效应**，你觉得它是如何通过热力学增加稳定性的？";
      } else if (newMsg.includes("耐药")) {
        reply = "第三代药物奥沙利铂正是为了解决耐药性！它庞大的环己二胺基团提供了空间位阻，让修复蛋白无从下手。";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 800);
  };

  const formatText = (text) => {
    // 简单处理加粗标记
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-blue-700">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-center space-x-8 mb-8">
            {[1, 2, 3].map(gen => (
              <button
                key={gen}
                onClick={() => setActiveGen(gen)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${activeGen === gen ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                第{gen}代
              </button>
            ))}
          </div>

          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl relative overflow-hidden border border-slate-100">
            {/* SVG 分子简图 (占位与示意) */}
            <svg viewBox="0 0 400 200" className="w-full h-full drop-shadow-lg transition-all duration-500">
              <circle cx="200" cy="100" r="30" fill="#94a3b8" />
              <text x="200" y="105" textAnchor="middle" fill="white" fontWeight="bold">Pt</text>
              
              {/* 保留基团 (左侧) */}
              <line x1="170" y1="100" x2="120" y2="70" stroke="#64748b" strokeWidth="4" />
              <line x1="170" y1="100" x2="120" y2="130" stroke="#64748b" strokeWidth="4" />
              <circle cx="120" cy="70" r="20" fill="#3b82f6" />
              <circle cx="120" cy="130" r="20" fill="#3b82f6" />
              <text x="120" y="75" textAnchor="middle" fill="white" fontSize="12">
                {activeGen === 3 ? 'DACH' : 'NH3'}
              </text>
              <text x="120" y="135" textAnchor="middle" fill="white" fontSize="12">
                {activeGen === 3 ? 'DACH' : 'NH3'}
              </text>

              {/* 离去基团 (右侧) */}
              <line x1="230" y1="100" x2="280" y2="70" stroke="#64748b" strokeWidth="4" />
              <line x1="230" y1="100" x2="280" y2="130" stroke="#64748b" strokeWidth="4" />
              <circle cx="280" cy="70" r="20" fill={activeGen === 1 ? '#10b981' : '#f59e0b'} />
              <circle cx="280" cy="130" r="20" fill={activeGen === 1 ? '#10b981' : '#f59e0b'} />
              
              {activeGen > 1 && (
                 <path d="M 280 70 Q 320 100 280 130" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" strokeDasharray="5,5" className="animate-pulse" />
              )}

              <text x="280" y="75" textAnchor="middle" fill="white" fontSize="12">
                {activeGen === 1 ? 'Cl' : 'O'}
              </text>
              <text x="280" y="135" textAnchor="middle" fill="white" fontSize="12">
                {activeGen === 1 ? 'Cl' : 'O'}
              </text>
            </svg>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-bold text-slate-800">{drugData[activeGen].title}</h2>
            <p className="text-blue-600 font-mono text-sm mb-4">{drugData[activeGen].subtitle}</p>
            <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
              <p><strong>💊 药理机制：</strong>{formatText(drugData[activeGen].desc)}</p>
              <p><strong>⚠️ 毒副作用：</strong>{formatText(drugData[activeGen].toxicity)}</p>
              <p><strong>🔬 结构玄机：</strong>{formatText(drugData[activeGen].mechanism)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl flex flex-col shadow-sm h-[600px]">
        <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex items-center shadow-md">
          <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <span className="font-bold tracking-wide">Pt-Bot 结构化学助教</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-slate-400 mb-1 px-1">
                {msg.sender === 'user' ? '你' : 'Pt-Bot 教授'}
              </span>
              <div className={`p-3 max-w-[85%] text-sm shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none'}`}>
                {formatText(msg.text)}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-slate-200 rounded-b-2xl flex">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="询问结构、毒性、螯合效应..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors font-medium text-sm">
            发送
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 模块 2: EDTA 螯合机制 (EDTA Chelation)
// ==========================================
const EDTAModule = () => {
  const [step, setStep] = useState(0);

  const stepsInfo = [
    { title: "状态 1：微量金属离子的潜伏", desc: "体系中存在微量游离 Fe³⁺，由于其较高的条件电极电位，随时准备夺取药物分子的电子。" },
    { title: "状态 2：氧化破坏发生", desc: "Fe³⁺ 接触药物分子，发生氧化还原反应，导致药物氧化变质，自身还原为 Fe²⁺。" },
    { title: "状态 3：EDTA 紧急介入", desc: "加入 EDTA 螯合剂。由于 EDTA 是强大的多齿配体，迅速将铁离子牢牢包裹。" },
    { title: "状态 4：热力学锁死", desc: "能斯特方程发威！极稳定的 [Fe(EDTA)]⁻ 配合物极大地降低了游离 Fe³⁺ 浓度，条件电极电位暴跌，铁离子的氧化能力被彻底封印。" }
  ];

  // 动画坐标和状态计算
  const getEntityStyles = () => {
    switch (step) {
      case 0:
        return {
          drug: { transform: 'translate(50px, 150px)', filter: 'none', background: 'linear-gradient(135deg, #10b981, #059669)' },
          iron: { transform: 'translate(450px, 50px)', background: '#ef4444' },
          edta: { transform: 'translate(450px, 250px) scale(0.5)', opacity: 0 },
          potBar: { height: '80%', background: '#ef4444' }
        };
      case 1:
        return {
          drug: { transform: 'translate(200px, 150px)', filter: 'grayscale(80%) sepia(50%)', background: '#64748b' },
          iron: { transform: 'translate(260px, 120px)', background: '#f59e0b' },
          edta: { transform: 'translate(450px, 250px) scale(0.5)', opacity: 0 },
          potBar: { height: '80%', background: '#ef4444' }
        };
      case 2:
        return {
          drug: { transform: 'translate(50px, 150px)', filter: 'none', background: 'linear-gradient(135deg, #10b981, #059669)' },
          iron: { transform: 'translate(300px, 150px)', background: '#ef4444' },
          edta: { transform: 'translate(300px, 150px) scale(1.2)', opacity: 1 },
          potBar: { height: '80%', background: '#ef4444' }
        };
      case 3:
        return {
          drug: { transform: 'translate(50px, 150px)', filter: 'none', background: 'linear-gradient(135deg, #10b981, #059669)' },
          iron: { transform: 'translate(300px, 150px)', background: '#ef4444', fontSize: '12px' },
          edta: { transform: 'translate(300px, 150px) scale(1)', opacity: 1 },
          potBar: { height: '15%', background: '#10b981' }
        };
      default:
        return getEntityStyles(0);
    }
  };

  const styles = getEntityStyles();

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* 左侧：3D 交互舞台 */}
        <div className="flex-1 relative h-[350px] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-inner" style={{ perspective: '1000px' }}>
          
          {/* 药物分子 */}
          <div className="absolute w-24 h-12 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 z-10" style={styles.drug}>
            {step === 1 ? 'Oxidized Drug' : 'Drug Molecule'}
          </div>

          {/* 铁离子 */}
          <div className="absolute w-12 h-12 rounded-full text-white font-bold text-sm flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all duration-1000 z-30" style={styles.iron}>
            {step === 1 ? 'Fe²⁺' : 'Fe³⁺'}
          </div>

          {/* EDTA 螯合笼 */}
          <div className="absolute w-20 h-20 border-4 border-blue-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(96,165,250,0.8)] transition-all duration-1000 z-20 bg-blue-900 bg-opacity-30 backdrop-blur-sm" style={styles.edta}>
            <span className="absolute -top-6 text-blue-300 text-xs font-mono">EDTA⁴⁻</span>
          </div>

          {/* 仪表盘: 电极电位 */}
          <div className="absolute right-6 top-6 bottom-6 w-12 bg-slate-900 rounded-full border border-slate-600 flex flex-col justify-end p-1 z-40">
            <div className="w-full rounded-full transition-all duration-1000 relative" style={styles.potBar}>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-slate-300">E°'</div>
            </div>
          </div>
        </div>

        {/* 右侧：解说控制面板 */}
        <div className="w-full md:w-80 flex flex-col space-y-4">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex-1">
            <h3 className="text-xl font-bold text-blue-400 mb-2">{stepsInfo[step].title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed min-h-[80px]">
              {stepsInfo[step].desc}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map(idx => (
              <button
                key={idx}
                onClick={() => setStep(idx)}
                className={`py-2 px-3 rounded-lg text-sm font-bold transition-all ${step === idx ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
              >
                阶段 {idx + 1}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setStep(prev => (prev + 1) % 4)}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl font-bold tracking-wider shadow-lg transition-all"
          >
            {step === 3 ? '重新开始演示' : '下一步演化 ➔'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 主容器: 结构与性质综合平台 (SMARTCHEM VLE)
// ==========================================
export default function StructureProperty() {
  const [activeTab, setActiveTab] = useState('cisplatin');

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* VLE 顶栏 */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-end border-b-2 border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              结构与性质深度剖析
            </h1>
            <p className="text-slate-500 mt-2 font-mono text-sm tracking-widest">
              SMARTCHEM VIRTUAL LEARNING ENVIRONMENT
            </p>
          </div>
          
          {/* 导航卡片 */}
          <div className="flex space-x-2 mt-4 md:mt-0 bg-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('cisplatin')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'cisplatin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              💊 铂类药物结构演变
            </button>
            <button
              onClick={() => setActiveTab('edta')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'edta' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              🛡️ EDTA 热力学锁死
            </button>
          </div>
        </header>

        {/* 动态内容区 */}
        <main className="transition-all duration-500 ease-in-out">
          {activeTab === 'cisplatin' && <CisplatinModule />}
          {activeTab === 'edta' && <EDTAModule />}
        </main>

      </div>
    </div>
  );
}