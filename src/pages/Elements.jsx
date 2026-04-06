import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

import SBlock from '../components/SBlock';
import PBlock from '../components/PBlock';
import DBlock from '../components/DBlock';
import FBlock from '../components/FBlock';
import ElementsQuiz from '../components/ElementsQuiz';

export default function Elements() {
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState('SBlock');
  const [expandedMenus, setExpandedMenus] = useState({ 's-block': true, 'p-block': false, 'd-block': false, 'f-block': false });

  const toggleMenu = (menu) => setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/s-block')) setActiveComponent('SBlock');
    else if (path.includes('/p-block')) setActiveComponent('PBlock');
    else if (path.includes('/d-block')) setActiveComponent('DBlock');
    else if (path.includes('/f-block')) setActiveComponent('FBlock');
    else if (path.includes('/quiz')) setActiveComponent('ElementsQuiz');
    else setActiveComponent('SBlock');
  }, [location.pathname]);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '我是元素化学专属 AI 助教！关于主族元素的递变规律、过渡金属的配合物特征，或是镧系收缩效应，随时问我！' }
  ]);
  const chatEndRef = useRef(null);

  const componentNameMap = { 'SBlock': 's区元素', 'PBlock': 'p区元素', 'DBlock': 'd/ds区元素', 'FBlock': 'f区元素', 'ElementsQuiz': '元素极限挑战' };

  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton) { if (e.key !== 'Enter' || e.nativeEvent.isComposing) return; }
    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在深度检索元素周期律...' }]);

    try {
      const currentModule = componentNameMap[activeComponent] || '元素化学';
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, currentModule);
      setChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply }; return newHistory; });
    } catch (err) {
      setChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 节点连接失败，请检查网络或 API Key。' }; return newHistory; });
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const renderContent = () => {
    switch (activeComponent) {
      case 'SBlock': return <SBlock />; case 'PBlock': return <PBlock />;
      case 'DBlock': return <DBlock />; case 'FBlock': return <FBlock />;
      case 'ElementsQuiz': return <ElementsQuiz />; default: return <SBlock />;
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
          <span style={styles.headerTitle}>元素化学实验舱</span>
        </div>
      </header>

      <div style={styles.workspace}>
        <aside style={styles.sidebar}>
          {/* 左侧菜单内容保留原样 */}
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('s-block')}><span className="material-symbols-outlined" style={styles.menuIcon}>looks_one</span> <span style={styles.menuText}>s区元素</span></div>
            {expandedMenus['s-block'] && (<div style={styles.subMenuBox}><div style={activeComponent === 'SBlock' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('SBlock')}>碱金属与碱土金属</div></div>)}
          </div>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('p-block')}><span className="material-symbols-outlined" style={styles.menuIcon}>looks_two</span> <span style={styles.menuText}>p区元素</span></div>
            {expandedMenus['p-block'] && (<div style={styles.subMenuBox}><div style={activeComponent === 'PBlock' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('PBlock')}>硼族至惰性气体</div></div>)}
          </div>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('d-block')}><span className="material-symbols-outlined" style={styles.menuIcon}>looks_3</span> <span style={styles.menuText}>d/ds区元素</span></div>
            {expandedMenus['d-block'] && (<div style={styles.subMenuBox}><div style={activeComponent === 'DBlock' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('DBlock')}>过渡金属特性</div></div>)}
          </div>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('f-block')}><span className="material-symbols-outlined" style={styles.menuIcon}>looks_4</span> <span style={styles.menuText}>f区元素</span></div>
            {expandedMenus['f-block'] && (<div style={styles.subMenuBox}><div style={activeComponent === 'FBlock' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('FBlock')}>镧系与锕系</div></div>)}
          </div>
          <div style={{ ...styles.menuGroup, marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            <div style={{ ...styles.menuHeader, color: '#d97706' }} onClick={() => setActiveComponent('ElementsQuiz')}><span className="material-symbols-outlined" style={{ ...styles.menuIcon, color: '#d97706' }}>local_fire_department</span> <span style={{ ...styles.menuText, fontWeight: 'bold' }}>元素寻宝挑战</span></div>
          </div>
        </aside>

        <main style={styles.mainContent}>{renderContent()}</main>

        <aside style={styles.aiSidebar}>
          <div style={styles.aiHeader}>
            <span className="material-symbols-outlined" style={{ color: '#10b981' }}>smart_toy</span>
            <span style={{ fontWeight: 'bold' }}>周期律 AI 导师</span>
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
            <input type="text" placeholder="输入元素符号或疑问..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={styles.aiInput} />
            <button style={styles.aiSendBtn} onClick={(e) => handleChatSubmit(e, true)}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span></button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ⚠️ 此处保留你原文件最底部的 const styles = { ... } 不变！

// 样式复用
const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', fontFamily: 'Inter, sans-serif' },
  header: { height: '60px', backgroundColor: '#064e3b', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', zIndex: 50 },
  backBtn: { color: '#a7f3d0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px' },
  headerTitle: { fontSize: '18px', fontWeight: '800', letterSpacing: '1px', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '15px' },
  workspace: { flex: 1, display: 'flex', overflow: 'hidden' },
  
  sidebar: { width: '190px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px 8px', overflowY: 'auto', zIndex: 10 },
  menuGroup: { marginBottom: '8px' },
  menuHeader: { display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#475569' },
  menuIcon: { fontSize: '20px', marginRight: '8px', color: '#64748b' },
  menuText: { fontSize: '14px', fontWeight: '600', flex: 1 },
  subMenuBox: { display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '36px', marginTop: '4px', marginBottom: '8px' },
  subMenuItem: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: '500' },
  subMenuItemActive: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#16a34a', backgroundColor: '#f0fdf4', fontSize: '13px', fontWeight: 'bold' },
  
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#0f172a' },
  
  aiSidebar: { width: '220px', backgroundColor: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 10 },
  aiHeader: { height: '60px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px', backgroundColor: '#f8fafc' },
  aiBody: { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' },
  aiMessageBase: { padding: '12px 16px', borderRadius: '12px', border: '1px solid', color: '#334155', fontSize: '14px', lineHeight: 1.5 },
  aiInputArea: { padding: '12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', gap: '8px' },
  aiInput: { flex: 1, padding: '10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' },
  aiSendBtn: { backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s', ':hover': { backgroundColor: '#16a34a' } }
};