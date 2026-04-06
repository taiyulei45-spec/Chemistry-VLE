import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

import PeriodicTable from '../components/PeriodicTable';
import ElectronConfig from '../components/ElectronConfig';
import AtomStructureLab from '../components/AtomStructureLab';
import AtomStructureSum from '../components/AtomStructureSum';
import VseprTheory from '../components/VseprTheory';
import HybridOrbital from '../components/HybridOrbital';
import MolecularOrbital from '../components/MolecularOrbital';
import CoordinationSum from '../components/CoordinationSum';
import CrystalFieldTheory from '../components/CrystalFieldTheory';
import CrystalFieldEnergy from '../components/CrystalFieldEnergy';
import StructureQuiz from '../components/StructureQuiz';

export default function Structure() {
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState('PeriodicTable');
  const [expandedMenus, setExpandedMenus] = useState({
    'periodicity': true, 'atom': true, 'molecule': true, 'complex': true
  });

  const toggleMenu = (menu) => setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/periodicity')) setActiveComponent('PeriodicTable');
    else if (path.includes('/atom')) setActiveComponent('AtomStructureLab');
    else if (path.includes('/molecule')) setActiveComponent('VseprTheory');
    else if (path.includes('/complex')) setActiveComponent('CoordinationSum');
    else if (path.includes('/quiz')) setActiveComponent('StructureQuiz');
    else setActiveComponent('PeriodicTable');
  }, [location.pathname]);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '我是物质结构专属 AI 导师，关于薛定谔方程、杂化轨道或晶体场理论，随时问我！' }
  ]);
  const chatEndRef = useRef(null);

  const componentNameMap = {
    'PeriodicTable': '元素周期表', 'ElectronConfig': '元素周期性',
    'AtomStructureLab': '原子结构与量子数', 'AtomStructureSum': '原子结构总结',
    'VseprTheory': 'VSEPR 理论', 'HybridOrbital': '杂化轨道', 'MolecularOrbital': '分子轨道',
    'CoordinationSum': '配位价键理论', 'CrystalFieldTheory': '晶体场理论', 'CrystalFieldEnergy': '晶体场能级计算',
    'StructureQuiz': '物质结构极限挑战'
  };

  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton) {
      if (e.key !== 'Enter') return;
      if (e.nativeEvent.isComposing) return;
    }
    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在调取 DeepSeek 算力...' }]);

    try {
      const currentModule = componentNameMap[activeComponent] || '物质结构';
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, currentModule);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply };
        return newHistory;
      });
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ DeepSeek 节点连接失败，请检查网络或 API Key。' };
        return newHistory;
      });
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const renderContent = () => {
    switch (activeComponent) {
      case 'PeriodicTable': return <PeriodicTable />; case 'ElectronConfig': return <ElectronConfig />;
      case 'AtomStructureLab': return <AtomStructureLab />; case 'AtomStructureSum': return <AtomStructureSum />;
      case 'VseprTheory': return <VseprTheory />; case 'HybridOrbital': return <HybridOrbital />;
      case 'MolecularOrbital': return <MolecularOrbital />; case 'CoordinationSum': return <CoordinationSum />;
      case 'CrystalFieldTheory': return <CrystalFieldTheory />; case 'CrystalFieldEnergy': return <CrystalFieldEnergy />;
      case 'StructureQuiz': return <StructureQuiz />; default: return <PeriodicTable />;
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        .markdown-prose p:last-child { margin-bottom: 0; }
        .markdown-prose strong { font-weight: 700; color: inherit; }
        .markdown-prose ul, .markdown-prose ol { margin-top: 4px; margin-bottom: 8px; padding-left: 20px; }
        .markdown-prose li { margin-bottom: 4px; }
        .markdown-prose code { background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 4px; font-family: monospace; }
      `}</style>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/" style={styles.backBtn}><span className="material-symbols-outlined">arrow_back</span> 返回主页</Link>
          <span style={styles.headerTitle}>物质结构实验舱</span>
        </div>
      </header>

      <div style={styles.workspace}>
        <aside style={styles.sidebar}>
          {/* 左侧菜单内容保留原样 */}
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('periodicity')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>grid_view</span> 
              <span style={styles.menuText}>元素周期性</span>
            </div>
            {expandedMenus['periodicity'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'PeriodicTable' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('PeriodicTable')}>元素周期表</div>
                <div style={activeComponent === 'ElectronConfig' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('ElectronConfig')}>元素排布与周期性</div>
              </div>
            )}
          </div>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('atom')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>blur_on</span> 
              <span style={styles.menuText}>原子结构</span>
            </div>
            {expandedMenus['atom'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'AtomStructureLab' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('AtomStructureLab')}>量子数与排布</div>
                <div style={activeComponent === 'AtomStructureSum' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('AtomStructureSum')}>结构总结</div>
              </div>
            )}
          </div>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('molecule')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>share</span> 
              <span style={styles.menuText}>分子结构</span>
            </div>
            {expandedMenus['molecule'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'VseprTheory' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('VseprTheory')}>VSEPR 理论</div>
                <div style={activeComponent === 'HybridOrbital' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('HybridOrbital')}>杂化轨道理论</div>
                <div style={activeComponent === 'MolecularOrbital' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('MolecularOrbital')}>分子轨道理论</div>
              </div>
            )}
          </div>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('complex')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>hub</span> 
              <span style={styles.menuText}>配合物结构</span>
            </div>
            {expandedMenus['complex'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'CoordinationSum' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('CoordinationSum')}>价键理论与平衡</div>
                <div style={activeComponent === 'CrystalFieldTheory' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('CrystalFieldTheory')}>晶体场理论</div>
                <div style={activeComponent === 'CrystalFieldEnergy' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('CrystalFieldEnergy')}>晶体场能级与颜色</div>
              </div>
            )}
          </div>
          <div style={{ ...styles.menuGroup, marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            <div style={{ ...styles.menuHeader, color: '#d97706' }} onClick={() => setActiveComponent('StructureQuiz')}>
              <span className="material-symbols-outlined" style={{ ...styles.menuIcon, color: '#d97706' }}>local_fire_department</span> 
              <span style={{ ...styles.menuText, fontWeight: 'bold' }}>极限挑战</span>
            </div>
          </div>
        </aside>

        <main style={styles.mainContent}>{renderContent()}</main>

        <aside style={styles.aiSidebar}>
          <div style={styles.aiHeader}>
            <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>smart_toy</span>
            <span style={{ fontWeight: 'bold' }}>AI 导师答疑</span>
          </div>
          <div style={styles.aiBody}>
            {chatHistory.map((msg, index) => (
              <div key={index} style={{ ...styles.aiMessageBase, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'ai' ? '#f0fdf4' : '#eff6ff', borderColor: msg.role === 'ai' ? '#bbf7d0' : '#bfdbfe' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: msg.role === 'ai' ? '#16a34a' : '#2563eb', marginBottom: '4px' }}>{msg.role === 'ai' ? '🤖 AI导师' : '👤 您'}</div>
                <div className="markdown-prose" style={{ fontSize: '13px', color: '#334155' }}>
                  {msg.role === 'ai' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={styles.aiInputArea}>
            <input type="text" placeholder="输入公式或问题..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={styles.aiInput} />
            <button style={styles.aiSendBtn} onClick={(e) => handleChatSubmit(e, true)}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span></button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ⚠️ 此处保留你原文件最底部的 const styles = { ... } 不变！

// ================= 样式表 =================
const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', fontFamily: 'Inter, sans-serif' },
  header: { height: '60px', backgroundColor: '#001e40', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  backBtn: { color: '#d5e3ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px', transition: '0.2s', ':hover': { backgroundColor: 'rgba(255,255,255,0.1)' } },
  headerTitle: { fontSize: '18px', fontWeight: '800', letterSpacing: '1px', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '15px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  workspace: { flex: 1, display: 'flex', overflow: 'hidden' },
  
  // ✅ 左侧栏收窄至 190px，微调内边距
  sidebar: { width: '190px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px 8px', overflowY: 'auto', zIndex: 10 },
  menuGroup: { marginBottom: '8px' },
  menuHeader: { display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#475569', transition: '0.2s', ':hover': { backgroundColor: '#f8fafc' } },
  menuIcon: { fontSize: '20px', marginRight: '8px', color: '#64748b' }, // 缩小右边距防止折行
  menuText: { fontSize: '14px', fontWeight: '600', flex: 1 },
  arrowIcon: { fontSize: '18px', color: '#94a3b8' },
  subMenuBox: { display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '36px', marginTop: '4px', marginBottom: '8px' }, // 缩小左侧缩进
  subMenuItem: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: '500', transition: '0.2s', ':hover': { backgroundColor: '#f8fafc', color: '#0f172a' } },
  subMenuItemActive: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#0056d2', backgroundColor: '#eff6ff', fontSize: '13px', fontWeight: 'bold' },

  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#0f172a' },

  // ✅ 右侧 AI 框收窄至 220px，微调输入框尺寸
  aiSidebar: { width: '220px', backgroundColor: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 10 },
  aiHeader: { height: '60px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px', backgroundColor: '#f8fafc' },
  aiBody: { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' },
  aiMessageBase: { padding: '12px 16px', borderRadius: '12px', border: '1px solid', color: '#334155', fontSize: '14px', lineHeight: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  aiInputArea: { padding: '12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', gap: '8px' },
  aiInput: { flex: 1, padding: '10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' },
  aiSendBtn: { backgroundColor: '#001e40', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s', ':hover': { backgroundColor: '#0056d2' } }
};