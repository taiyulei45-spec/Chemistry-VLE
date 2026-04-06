import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

import StructureProperty from '../components/StructureProperty';
import EqShift from '../components/EqShift';
import RateControl from '../components/RateControl';

export default function Theory() {
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState('StructureProperty');
  const [expandedMenus, setExpandedMenus] = useState({ 'properties': true, 'equilibrium': false, 'rate': false });

  const toggleMenu = (menu) => setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/properties')) setActiveComponent('StructureProperty');
    else if (path.includes('/equilibrium')) setActiveComponent('EqShift');
    else if (path.includes('/rate-control')) setActiveComponent('RateControl');
    else setActiveComponent('StructureProperty');
  }, [location.pathname]);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '欢迎来到理论应用舱！这里我们将抽象理论转化为实际生产。关于勒夏特列原理的工业应用或是催化剂设计，向我开炮吧！' }
  ]);
  const chatEndRef = useRef(null);

  const componentNameMap = { 'StructureProperty': '组成结构与性能', 'EqShift': '化学平衡移动', 'RateControl': '反应速率调控' };

  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton) { if (e.key !== 'Enter' || e.nativeEvent.isComposing) return; }
    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在深度思考...' }]);

    try {
      const currentModule = componentNameMap[activeComponent] || '理论应用';
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, currentModule);
      setChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply }; return newHistory; });
    } catch (err) {
      setChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 连接断开，请重试。' }; return newHistory; });
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const renderContent = () => {
    switch (activeComponent) {
      case 'StructureProperty': return <StructureProperty />; case 'EqShift': return <EqShift />;
      case 'RateControl': return <RateControl />; default: return <StructureProperty />;
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
          <span style={styles.headerTitle}>理论应用转化舱</span>
        </div>
      </header>

      <div style={styles.workspace}>
        <aside style={styles.sidebar}>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('properties')}><span className="material-symbols-outlined" style={styles.menuIcon}>category</span> <span style={styles.menuText}>组成结构与性能</span></div>
            {expandedMenus['properties'] && (<div style={styles.subMenuBox}><div style={activeComponent === 'StructureProperty' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('StructureProperty')}>构效关系推演</div></div>)}
          </div>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('equilibrium')}><span className="material-symbols-outlined" style={styles.menuIcon}>sync_alt</span> <span style={styles.menuText}>化学平衡移动</span></div>
            {expandedMenus['equilibrium'] && (<div style={styles.subMenuBox}><div style={activeComponent === 'EqShift' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('EqShift')}>工业条件优化</div></div>)}
          </div>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('rate')}><span className="material-symbols-outlined" style={styles.menuIcon}>tune</span> <span style={styles.menuText}>反应速率调控</span></div>
            {expandedMenus['rate'] && (<div style={styles.subMenuBox}><div style={activeComponent === 'RateControl' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('RateControl')}>催化与动力学控制</div></div>)}
          </div>
        </aside>

        <main style={styles.mainContent}>{renderContent()}</main>

        <aside style={styles.aiSidebar}>
          <div style={styles.aiHeader}>
            <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>smart_toy</span>
            <span style={{ fontWeight: 'bold' }}>工程应用 AI 导师</span>
          </div>
          <div style={styles.aiBody}>
            {chatHistory.map((msg, index) => (
              <div key={index} style={{ ...styles.aiMessageBase, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'ai' ? '#f5f3ff' : '#eff6ff', borderColor: msg.role === 'ai' ? '#ddd6fe' : '#bfdbfe' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: msg.role === 'ai' ? '#7c3aed' : '#2563eb', marginBottom: '4px' }}>{msg.role === 'ai' ? '🤖 AI导师' : '👤 您'}</div>
                <div className="markdown-prose" style={{ fontSize: '13px', color: '#334155' }}>
                  {msg.role === 'ai' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={styles.aiInputArea}>
            <input type="text" placeholder="输入工程难题..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={styles.aiInput} />
            <button style={styles.aiSendBtn} onClick={(e) => handleChatSubmit(e, true)}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span></button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ⚠️ 此处保留你原文件最底部的 const styles = { ... } 不变！

// 样式复用（修改了 header 颜色）
const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', fontFamily: 'Inter, sans-serif' },
  header: { height: '60px', backgroundColor: '#2e1065', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', zIndex: 50 },
  backBtn: { color: '#ddd6fe', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px' },
  headerTitle: { fontSize: '18px', fontWeight: '800', letterSpacing: '1px', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '15px' },
  workspace: { flex: 1, display: 'flex', overflow: 'hidden' },
  
  sidebar: { width: '190px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px 8px', overflowY: 'auto', zIndex: 10 },
  menuGroup: { marginBottom: '8px' },
  menuHeader: { display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#475569' },
  menuIcon: { fontSize: '20px', marginRight: '8px', color: '#64748b' },
  menuText: { fontSize: '14px', fontWeight: '600', flex: 1 },
  subMenuBox: { display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '36px', marginTop: '4px', marginBottom: '8px' },
  subMenuItem: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: '500' },
  subMenuItemActive: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#7c3aed', backgroundColor: '#f5f3ff', fontSize: '13px', fontWeight: 'bold' },
  
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#0f172a' },
  
  aiSidebar: { width: '220px', backgroundColor: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 10 },
  aiHeader: { height: '60px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px', backgroundColor: '#f8fafc' },
  aiBody: { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' },
  aiMessageBase: { padding: '12px 16px', borderRadius: '12px', border: '1px solid', color: '#334155', fontSize: '14px', lineHeight: 1.5 },
  aiInputArea: { padding: '12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', gap: '8px' },
  aiInput: { flex: 1, padding: '10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' },
  aiSendBtn: { backgroundColor: '#2e1065', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s', ':hover': { backgroundColor: '#7c3aed' } }
};