import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';

// ==========================================
// 1. 导入 Markdown 渲染库 (解析 AI 的排版)
// ==========================================
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ==========================================
// 2. 导入全局 AI 大模型请求引擎
// ==========================================
import { fetchChemistryAnswer } from '../utils/llmClient';

// ==========================================
// 3. 导入预留的所有三级子组件
// ==========================================
import DiluteSolution from '../components/DiluteSolution';
import Thermodynamics from '../components/Thermodynamics';
import Kinetics from '../components/Kinetics';
import AcidBase from '../components/AcidBase';
import BufferSolution from '../components/BufferSolution';
import Precipitation from '../components/Precipitation';
import Redox from '../components/Redox';
import CoordinationEq from '../components/CoordinationEq';
import ReactionsQuiz from '../components/ReactionsQuiz';

export default function Reactions() {
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState('DiluteSolution');
  
  const [expandedMenus, setExpandedMenus] = useState({
    'solution': true, 'thermo': false, 'kinetics': false, 'acidBase': false, 
    'precip': false, 'redox': false, 'coord': false
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/solution')) setActiveComponent('DiluteSolution');
    else if (path.includes('/thermodynamics')) setActiveComponent('Thermodynamics');
    else if (path.includes('/kinetics')) setActiveComponent('Kinetics');
    else if (path.includes('/acid-base')) setActiveComponent('AcidBase');
    else if (path.includes('/precipitation')) setActiveComponent('Precipitation');
    else if (path.includes('/redox')) setActiveComponent('Redox');
    else if (path.includes('/coordination')) setActiveComponent('CoordinationEq');
    else setActiveComponent('DiluteSolution');
  }, [location.pathname]);

  // ==========================================
  // 右侧 AI 导师状态与逻辑
  // ==========================================
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '我是反应基础专属 AI 助教，关于热力学公式或四大平衡的计算，随时问我！' }
  ]);
  const chatEndRef = useRef(null);

  const componentNameMap = {
    'DiluteSolution': '稀溶液理论',
    'Thermodynamics': '化学热力学',
    'Kinetics': '化学动力学',
    'AcidBase': '酸碱平衡',
    'BufferSolution': '缓冲溶液系统',
    'Precipitation': '沉淀溶解平衡',
    'Redox': '氧化还原平衡',
    'CoordinationEq': '配位平衡',
    'ReactionsQuiz': '反应全景挑战'
  };

  // ✅ 真实调用 DeepSeek API 的逻辑
  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton) {
      if (e.key !== 'Enter') return;
      if (e.nativeEvent.isComposing) return;
    }

    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    
    // 上屏用户问题，并显示“正在思考”占位符
    setChatHistory(prev => [
      ...prev, 
      { role: 'user', text: userText },
      { role: 'ai', text: '正在深度思考...' } 
    ]);

    try {
      const currentModule = componentNameMap[activeComponent] || '反应基础';
      
      // 发起真实请求
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, currentModule);

      // 替换占位符为真实回答
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply };
        return newHistory;
      });
      
    } catch (err) {
      console.error(err);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 神经中枢连接断开，请检查网络或 API Key 状态。' };
        return newHistory;
      });
    }
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const renderContent = () => {
    switch (activeComponent) {
      case 'DiluteSolution': return <DiluteSolution />;
      case 'Thermodynamics': return <Thermodynamics />;
      case 'Kinetics': return <Kinetics />;
      case 'AcidBase': return <AcidBase />;
      case 'BufferSolution': return <BufferSolution />; 
      case 'Precipitation': return <Precipitation />;
      case 'Redox': return <Redox />;
      case 'CoordinationEq': return <CoordinationEq />;
      case 'ReactionsQuiz': return <ReactionsQuiz />;
      default: return <DiluteSolution />;
    }
  };

  return (
    <div style={styles.container}>
      {/* 注入 Markdown 专属样式，保证排版极其漂亮 */}
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
          <Link to="/" style={styles.backBtn}>
            <span className="material-symbols-outlined">arrow_back</span> 返回主页
          </Link>
          <span style={styles.headerTitle}>反应基础实验舱</span>
        </div>
      </header>

      <div style={styles.workspace}>
        <aside style={styles.sidebar}>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('solution')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>water_drop</span> 
              <span style={styles.menuText}>稀溶液理论</span>
            </div>
            {expandedMenus['solution'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'DiluteSolution' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('DiluteSolution')}>依数性与渗透压</div>
              </div>
            )}
          </div>

          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('thermo')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>local_fire_department</span> 
              <span style={styles.menuText}>化学热力学</span>
            </div>
            {expandedMenus['thermo'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'Thermodynamics' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('Thermodynamics')}>热力学三大定律</div>
              </div>
            )}
          </div>

          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('kinetics')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>speed</span> 
              <span style={styles.menuText}>化学动力学</span>
            </div>
            {expandedMenus['kinetics'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'Kinetics' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('Kinetics')}>速率方程与催化剂</div>
              </div>
            )}
          </div>

          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('acidBase')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>scale</span> 
              <span style={styles.menuText}>酸碱平衡</span>
            </div>
            {expandedMenus['acidBase'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'AcidBase' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('AcidBase')}>弱酸弱碱平衡</div>
                <div style={activeComponent === 'BufferSolution' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('BufferSolution')}>缓冲溶液系统 ⚡</div>
              </div>
            )}
          </div>

          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('precip')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>grain</span> 
              <span style={styles.menuText}>沉淀溶解平衡</span>
            </div>
            {expandedMenus['precip'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'Precipitation' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('Precipitation')}>溶度积与平衡移动</div>
              </div>
            )}
          </div>

          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('redox')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>battery_charging_full</span> 
              <span style={styles.menuText}>氧化还原平衡</span>
            </div>
            {expandedMenus['redox'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'Redox' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('Redox')}>能斯特方程与滴定</div>
              </div>
            )}
          </div>

          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('coord')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>hub</span> 
              <span style={styles.menuText}>配位平衡</span>
            </div>
            {expandedMenus['coord'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'CoordinationEq' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('CoordinationEq')}>转化与配位竞争</div>
              </div>
            )}
          </div>

          <div style={{ ...styles.menuGroup, marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            <div style={{ ...styles.menuHeader, color: '#d97706' }} onClick={() => setActiveComponent('ReactionsQuiz')}>
              <span className="material-symbols-outlined" style={{ ...styles.menuIcon, color: '#d97706' }}>local_fire_department</span> 
              <span style={{ ...styles.menuText, fontWeight: 'bold' }}>反应全景挑战</span>
            </div>
          </div>
        </aside>

        <main style={styles.mainContent}>{renderContent()}</main>

        {/* AI 助教 */}
        <aside style={styles.aiSidebar}>
          <div style={styles.aiHeader}>
            <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>smart_toy</span>
            <span style={{ fontWeight: 'bold' }}>AI 反应导师</span>
          </div>
          <div style={styles.aiBody}>
            {chatHistory.map((msg, index) => (
              <div key={index} style={{ ...styles.aiMessageBase, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'ai' ? '#fef2f2' : '#eff6ff', borderColor: msg.role === 'ai' ? '#fecaca' : '#bfdbfe' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: msg.role === 'ai' ? '#dc2626' : '#2563eb', marginBottom: '4px' }}>
                  {msg.role === 'ai' ? '🤖 AI导师' : '👤 您'}
                </div>
                {/* ✅ 重点：在这里使用 ReactMarkdown 渲染排版 */}
                <div className="markdown-prose" style={{ fontSize: '13px', color: '#334155' }}>
                  {msg.role === 'ai' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <div style={styles.aiInputArea}>
            <input 
              type="text" 
              placeholder="输入化学方程式或疑问..." 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              onKeyDown={(e) => handleChatSubmit(e, false)} 
              style={styles.aiInput} 
            />
            <button style={styles.aiSendBtn} onClick={(e) => handleChatSubmit(e, true)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', fontFamily: 'Inter, sans-serif' },
  header: { height: '60px', backgroundColor: '#450a0a', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', zIndex: 50 },
  backBtn: { color: '#fecaca', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px' },
  headerTitle: { fontSize: '18px', fontWeight: '800', letterSpacing: '1px', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '15px' },
  workspace: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: { width: '190px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px 8px', overflowY: 'auto', zIndex: 10 },
  menuGroup: { marginBottom: '8px' },
  menuHeader: { display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#475569' },
  menuIcon: { fontSize: '20px', marginRight: '8px', color: '#64748b' },
  menuText: { fontSize: '14px', fontWeight: '600', flex: 1 },
  subMenuBox: { display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '36px', marginTop: '4px', marginBottom: '8px' },
  subMenuItem: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: '500' },
  subMenuItemActive: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626', backgroundColor: '#fef2f2', fontSize: '13px', fontWeight: 'bold' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#0f172a' },
  aiSidebar: { width: '220px', backgroundColor: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 10 },
  aiHeader: { height: '60px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px', backgroundColor: '#f8fafc' },
  aiBody: { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' },
  aiMessageBase: { padding: '12px 16px', borderRadius: '12px', border: '1px solid', color: '#334155', fontSize: '14px', lineHeight: 1.5 },
  aiInputArea: { padding: '12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', gap: '8px' },
  aiInput: { flex: 1, padding: '10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' },
  aiSendBtn: { backgroundColor: '#450a0a', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s', ':hover': { backgroundColor: '#7f1d1d' } }
};