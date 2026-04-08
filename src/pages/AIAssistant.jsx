import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useUser, UserButton } from "@clerk/clerk-react";
import { fetchChemistryAnswer } from '../utils/llmClient';

// 🌟 这里的路径是 ../components 因为此文件在 pages 文件夹中
import CalcTools from '../components/CalcTools';
import VirtualLab from '../components/VirtualLab';
import ResearchCases from '../components/ResearchCases';
import AIChemistry from '../components/AIChemistry';
import ResearchFrontier from '../components/ResearchFrontier';

const AI_MODULES_DATA = [
  {
    id: 'ai', title: 'AI与前沿交叉', icon: 'memory',
    children: [
      { id: 'micro', title: '微观结构', subTitle: 'AI辅助分子轨道与多原子空间构型预测', desc: '结合薛定谔方程波函数与价层电子对互斥理论，展示机器学习如何快速预测复杂分子的杂化方式、几何构型及电子云分布。', isReady: true, component: 'AIChemistry' },
      { id: 'thermo', title: '热动规律', subTitle: '数据驱动的催化剂筛选与活化能预测', desc: '基于碰撞理论和过渡态理论，探讨AI算法如何通过海量数据预测化学反应的活化能和指前因子，从而加速新型催化剂的发现。', isReady: true, component: 'ResearchFrontier' },
      { id: 'aqueous', title: '水溶液平衡', subTitle: '柔性生物传感器与电化学分析前沿', desc: '结合原电池与能斯特方程原理，展示柔性可穿戴生物传感器在精准医疗中的应用。' },
      { id: 'coordination', title: '配位化学', subTitle: '金属有机化合物与原子簇的计算设计', desc: '展示计算化学和AI在设计含金属-金属键的多核金属簇合物、以及金属有机均相催化剂方面的交叉前沿应用。' },
      { id: 'materials', title: '材料化学', subTitle: '高通量筛选与无机固体/纳米材料发现', desc: '基于ds区、f区及稀土元素特性，探讨AI如何辅助设计零族元素化合物、超导材料、发光材料及功能纳米颗粒。' },
      { id: 'bio', title: '生物无机', subTitle: '基因测序与精准医学的分子机制', desc: '结合无机分子生物学，引入基因测序、靶向药物等前沿技术词汇，探讨无机金属离子在生命体系中的关键作用。' }
    ]
  },
  {
    id: 'calc', title: '化学计算工具', icon: 'calculate',
    children: [
      { id: 'micro', title: '微观结构', subTitle: '波函数3D可视化与晶格能推算平台', desc: '提供原子轨道角度分布图与电子云的3D建模，并结合晶体结构理论，计算离子晶体的晶格能及晶胞参数。', isReady: true, component: 'CalcTools' },
      { id: 'thermo', title: '热动规律', subTitle: 'Hess定律与Arrhenius方程计算器', desc: '支持输入反应速率常数和温度自动拟合作图求算活化能；并支持利用Hess定律进行多步反应推算。' },
      { id: 'aqueous', title: '水溶液平衡', subTitle: 'Nernst方程与多重平衡计算器', desc: '提供非标准状态下电极电势的计算，以及复杂缓冲体系pH值、溶度积常数与溶解度换算的综合计算模型。' },
      { id: 'coordination', title: '配位化学', subTitle: '晶体场理论与磁矩综合计算工具', desc: '用于计算配合物的晶体场稳定化能（CFSE），并结合电子排布推算中心离子的自旋状态及磁矩。' },
      { id: 'materials', title: '材料化学', subTitle: '胶体聚沉值与纳米颗粒表面电势估算', desc: '针对溶胶与纳米颗粒知识，提供溶胶的基本性质计算、电解质聚沉值预估及同离子效应分析工具。' },
      { id: 'bio', title: '生物无机', subTitle: '血液缓冲系与药物分布模型模拟', desc: '结合人体血液碳酸缓冲系机制，提供药物在体内不同酸碱度下解离度变化的计算模型。' }
    ]
  },
  {
    id: 'vlab', title: '虚拟实验平台', icon: 'biotech',
    children: [
      { id: 'micro', title: '微观结构', subTitle: '氢原子光谱与核外电子运动状态探究', desc: '模拟氢原子放电管实验，学生可观察氢原子光谱的线状特征，并利用玻尔理论虚拟推算能级跃迁。' },
      { id: 'thermo', title: '热动规律', subTitle: '反应速率常数与活化能测定仿真', desc: '模拟不同温度和浓度条件下的动力学实验，学生自主收集数据并在虚拟坐标系中作图求活化能。' },
      { id: 'aqueous', title: '水溶液平衡', subTitle: '难溶盐分级沉淀控制与分离实验', desc: '要求学生在虚拟平台滴加沉淀剂，探究离子积与溶度积的关系，实现离子的分级沉淀与分离。' },
      { id: 'coordination', title: '配位化学', subTitle: '特殊配位化合物合成与光热变色机理', desc: '模拟复杂过渡金属配合物（如三草酸合铁酸钾或铜胺配合物）的制备，并在虚拟显微镜下探究其随条件变化的结构改变。', isReady: true, component: 'VirtualLab' },
      { id: 'materials', title: '材料化学', subTitle: '纳米颗粒与溶胶的制备及性质验证', desc: '在虚拟环境中通过化学凝聚法制备纳米溶胶，并验证丁达尔效应、布朗运动及外加电解质对其聚沉的影响。' },
      { id: 'bio', title: '生物无机', subTitle: '肿瘤微环境纳米药物释放模拟', desc: '结合真实生物医学研究，模拟脂质纳米粒在人体血液与肿瘤酸性微环境中发生水解并释放药物的动力学过程。' }
    ]
  },
  {
    id: 'cases', title: '科研案例库', icon: 'article',
    children: [
      { id: 'micro', title: '微观结构', subTitle: '分子轨道理论的应用：从O2到超分子', desc: '介绍传统价键理论的局限性，展示科学家如何利用分子轨道（MO）理论成功解释氧气的顺磁性及单电子键的里程碑案例。', isReady: true, component: 'ResearchCases' },
      { id: 'thermo', title: '热动规律', subTitle: '现代合成氨与生物酶催化的动力学突破', desc: '对比极端高温高压条件下的工业合成氨热力学/动力学原理，与常温常压下固氮酶高效催化的生物无机动力学奥秘。' },
      { id: 'aqueous', title: '水溶液平衡', subTitle: '脑内酸碱平衡与抗癫痫药物作用机制', desc: '引入神经科学交叉案例，探讨人体大脑细胞内外复杂的酸碱稳态调节，以及抗惊厥药物如何通过酸化发挥作用。' },
      { id: 'coordination', title: '配位化学', subTitle: '顺铂抗癌药物与金属有机均相催化', desc: '讲述典型配合物（如顺铂）的抗癌作用机理，以及金属有机化合物在现代均相催化和特殊材料中的重大科研价值。' },
      { id: 'materials', title: '材料化学', subTitle: '零族元素与f区稀土材料的前沿突破', desc: '展示稀有气体从“惰性”到被合成出化合物的突破历程，以及我国f区稀土元素在发光材料等应用中的战略地位。' },
      { id: 'bio', title: '生物无机', subTitle: '生命元素的奥秘：血红蛋白与维生素B12', desc: '剖析人体内不可或缺的金属酶，如血红蛋白和肌红蛋白的结构及其携氧机制，以及含钻元素的辅酶在生命体系中的核心作用。' }
    ]
  }
];

const UnderConstruction = ({ data }) => (
  <div style={styles.constructionContainer}>
    <div style={styles.constructionCard}>
      <span className="material-symbols-outlined" style={styles.constructionIcon}>engineering</span>
      <h2 style={styles.constructionTitle}>舱体模块正在接入中...</h2>
      <div style={styles.tagLabel}>【{data.title}】 {data.subTitle}</div>
      <p style={styles.constructionDesc}>{data.desc}</p>
      <div style={styles.progressBar}>
        <div style={styles.progressFill}></div>
      </div>
      <p style={styles.progressText}>核心算法与场景渲染编译进度: 12% - 预计下期更新开放</p>
    </div>
  </div>
);

export default function AIAssistant() {
  const { user } = useUser(); 
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({ 'ai': true, 'calc': true, 'vlab': true, 'cases': true });
  const toggleMenu = (menu) => setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: `您好，**${user?.firstName || '研究员'}**！我是 SmartChem AI 导师。我已连接 DeepSeek 算力核心，准备好为您解析当前实验舱体下的化学难题。` }
  ]);
  const chatEndRef = useRef(null);

  const renderReadyComponent = (componentName) => {
    switch (componentName) {
      case 'AIChemistry': return <AIChemistry />;
      case 'ResearchFrontier': return <ResearchFrontier />;
      case 'CalcTools': return <CalcTools />; 
      case 'VirtualLab': return <VirtualLab />;
      case 'ResearchCases': return <ResearchCases />; 
      default: return <UnderConstruction data={{title: 'Error', subTitle: 'Component not mapped', desc: ''}} />;
    }
  };

  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton) { if (e.key !== 'Enter' || e.nativeEvent.isComposing) return; }
    const userText = chatInput.trim();
    if (!userText) return;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '📡 正在调取 DeepSeek 算力核心进行推理...' }]);
    try {
      const currentModuleContext = location.pathname.split('/').pop() || '综合化学';
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, currentModuleContext);
      setChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply }; return newHistory; });
    } catch (err) {
      setChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 算力节点连接断开，请检查 API 额度或网络环境。' }; return newHistory; });
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  return (
    <div style={styles.container}>
      <style>{`
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        .markdown-prose strong { font-weight: 700; color: #0284c7; }
        .markdown-prose ul { padding-left: 20px; }
        @keyframes progress-bar-stripes { from { background-position: 1rem 0; } to { background-position: 0 0; } }
      `}</style>

      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
          <Link to="/" style={styles.backBtn}><span className="material-symbols-outlined">arrow_back</span> 返回主页</Link>
          <span style={styles.headerTitle}>AI + 前沿科研实验舱</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', opacity: 0.8 }}>{user?.firstName} (在线)</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div style={styles.workspace}>
        <aside style={styles.sidebar}>
          {AI_MODULES_DATA.map((category) => (
            <div key={category.id} style={styles.menuGroup}>
              <div style={styles.menuHeader} onClick={() => toggleMenu(category.id)}>
                <span className="material-symbols-outlined" style={styles.menuIcon}>{category.icon}</span> 
                <span style={styles.menuText}>{category.title}</span>
                <span className="material-symbols-outlined" style={{ fontSize:'16px', color:'#94a3b8', transform: expandedMenus[category.id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>expand_more</span>
              </div>
              {expandedMenus[category.id] && (
                <div style={styles.subMenuBox}>
                  {category.children.map(sub => {
                    const path = `/ai-assistant/${category.id}/${sub.id}`;
                    const isActive = location.pathname.includes(path);
                    return (
                      <NavLink key={sub.id} to={`/ai-assistant/${category.id}/${sub.id}`} style={isActive ? { ...styles.subMenuItem, ...styles.subMenuItemActive } : styles.subMenuItem}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '12px', color: isActive ? '#0284c7' : '#94a3b8' }}>•</span><span style={{ flex: 1 }}>{sub.title}</span></div>
                        {sub.isReady && <span style={styles.readyBadge}>可用</span>}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </aside>

        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Navigate to="ai/micro" replace />} />
            {AI_MODULES_DATA.map(category => 
              category.children.map(sub => (
                <Route key={`${category.id}-${sub.id}`} path={`${category.id}/${sub.id}`} element={sub.isReady ? renderReadyComponent(sub.component) : <UnderConstruction data={sub} />} />
              ))
            )}
          </Routes>
        </main>

        <aside style={styles.aiSidebar}>
          <div style={styles.aiHeader}>
            <span className="material-symbols-outlined" style={{ color: '#0ea5e9' }}>auto_awesome</span>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>DeepSeek 算力核心</span>
          </div>
          <div style={styles.aiBody}>
            {chatHistory.map((msg, index) => (
              <div key={index} style={{ ...styles.aiMessageBase, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'ai' ? '#f0f9ff' : '#f8fafc', borderColor: msg.role === 'ai' ? '#bae6fd' : '#e2e8f0' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', color: msg.role === 'ai' ? '#0284c7' : '#64748b', marginBottom: '4px' }}>{msg.role === 'ai' ? '🤖 SMARTCHEM AI' : `👤 ${user?.firstName || '研究员'}`}</div>
                <div className="markdown-prose" style={{ fontSize: '13px', color: '#334155' }}>{msg.role === 'ai' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={styles.aiInputArea}>
            <input type="text" placeholder="询问 AI 导师关于当前模块的问题..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={styles.aiInput} />
            <button style={styles.aiSendBtn} onClick={(e) => handleChatSubmit(e, true)}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span></button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', fontFamily: 'Inter, sans-serif' },
  header: { height: '60px', backgroundColor: '#082f49', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', zIndex: 50 },
  backBtn: { color: '#bae6fd', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold' },
  headerTitle: { fontSize: '18px', fontWeight: '800', letterSpacing: '1px', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '15px' },
  workspace: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: { width: '240px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '16px 8px', overflowY: 'auto' },
  menuGroup: { marginBottom: '8px' },
  menuHeader: { display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#334155', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' },
  menuIcon: { fontSize: '20px', marginRight: '8px', color: '#0ea5e9' },
  menuText: { fontSize: '14px', fontWeight: '700', flex: 1 },
  subMenuBox: { display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '28px', marginTop: '6px' },
  subMenuItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', color: '#64748b', fontSize: '13px', transition: '0.2s' },
  subMenuItemActive: { color: '#0284c7', backgroundColor: '#f0f9ff', fontWeight: 'bold' },
  readyBadge: { fontSize: '10px', padding: '2px 6px', backgroundColor: '#d1fae5', color: '#059669', borderRadius: '4px', fontWeight: 'bold' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#0f172a', position: 'relative' },
  constructionContainer: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' },
  constructionCard: { maxWidth: '500px', backgroundColor: '#0f172a', padding: '40px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  constructionIcon: { fontSize: '56px', color: '#38bdf8', marginBottom: '20px' },
  constructionTitle: { fontSize: '22px', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' },
  tagLabel: { display: 'inline-block', padding: '6px 12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#facc15', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' },
  constructionDesc: { fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px', textAlign: 'left', backgroundColor: '#020617', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' },
  progressBar: { height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' },
  progressFill: { height: '100%', width: '12%', backgroundColor: '#38bdf8', backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem', animation: 'progress-bar-stripes 1s linear infinite' },
  progressText: { fontSize: '12px', color: '#64748b' },
  aiSidebar: { width: '300px', backgroundColor: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' },
  aiHeader: { height: '60px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px', backgroundColor: '#f8fafc' },
  aiBody: { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' },
  aiMessageBase: { padding: '12px 16px', borderRadius: '12px', border: '1px solid', maxWidth: '90%' },
  aiInputArea: { padding: '12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', gap: '8px' },
  aiInput: { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' },
  aiSendBtn: { backgroundColor: '#082f49', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }
};