import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';

// ==========================================
// 1. 导入所有子模块组件 (包括新加入的前沿模块)
// ==========================================
import CalcTools from '../components/CalcTools';
import VirtualLab from '../components/VirtualLab';
import ResearchCases from '../components/ResearchCases';
import AIChemistry from '../components/AIChemistry';
import ResearchFrontier from '../components/ResearchFrontier';

export default function AIAssistant() {
  const location = useLocation();
  // 默认展示刚刚加入的最炫酷的 AI化学前沿 模块
  const [activeComponent, setActiveComponent] = useState('AIChemistry');
  
  // 侧边栏折叠状态：默认展开新加入的 'ai' 模块
  const [expandedMenus, setExpandedMenus] = useState({ 
    'ai': true, 
    'calc': true, 
    'vlab': false, 
    'cases': false 
  });

  const toggleMenu = (menu) => setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

  // 监听路由变化，智能切换组件
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/aichemistry')) setActiveComponent('AIChemistry');
    else if (path.includes('/frontier')) setActiveComponent('ResearchFrontier');
    else if (path.includes('/calc-tools')) setActiveComponent('CalcTools');
    else if (path.includes('/v-lab')) setActiveComponent('VirtualLab');
    else if (path.includes('/cases')) setActiveComponent('ResearchCases');
    else setActiveComponent('AIChemistry'); // 默认底线
  }, [location.pathname]);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '您好！我是集成大模型的智能科研导师。我可以帮您阅读最新的 Nature/Science 化学文献，解析 AI4S 算法，或者辅助构建计算化学模型。' }
  ]);
  const chatEndRef = useRef(null);

  // 映射当前模块名称，给 AI 提供更精准的上下文
  const componentNameMap = { 
    'AIChemistry': 'AI 与化学前沿 (AI4S)',
    'ResearchFrontier': '2026 顶级科研前沿',
    'CalcTools': '化学计算工具', 
    'VirtualLab': '虚拟实验平台', 
    'ResearchCases': '科研案例库' 
  };

  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton) { if (e.key !== 'Enter' || e.nativeEvent.isComposing) return; }
    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在调取 DeepSeek 算力核心...' }]);

    try {
      const currentModule = componentNameMap[activeComponent] || 'AI与前沿化学';
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, currentModule);
      setChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply }; return newHistory; });
    } catch (err) {
      setChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 算力节点连接断开。' }; return newHistory; });
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  // 核心路由分发器：根据 activeComponent 渲染对应的组件
  const renderContent = () => {
    switch (activeComponent) {
      case 'AIChemistry': return <AIChemistry />;
      case 'ResearchFrontier': return <ResearchFrontier />;
      case 'CalcTools': return <CalcTools />; 
      case 'VirtualLab': return <VirtualLab />;
      case 'ResearchCases': return <ResearchCases />; 
      default: return <AIChemistry />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Markdown 渲染样式 */}
      <style>{`
        .markdown-prose p { margin-top: 0; margin-bottom: 8px; line-height: 1.6; }
        .markdown-prose p:last-child { margin-bottom: 0; }
        .markdown-prose strong { font-weight: 700; color: inherit; }
        .markdown-prose ul, .markdown-prose ol { margin-top: 4px; margin-bottom: 8px; padding-left: 20px; }
        .markdown-prose li { margin-bottom: 4px; }
        .markdown-prose code { background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 4px; font-family: monospace; }
      `}</style>

      {/* 顶部导航 */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/" style={styles.backBtn}><span className="material-symbols-outlined">arrow_back</span> 返回主页</Link>
          <span style={styles.headerTitle}>AI + 前沿科研实验室</span>
        </div>
      </header>

      <div style={styles.workspace}>
        {/* 左侧菜单栏 */}
        <aside style={styles.sidebar}>
          
          {/* 新增：AI与前沿交叉 菜单组 */}
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('ai')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>memory</span> 
              <span style={styles.menuText}>AI与前沿交叉</span>
            </div>
            {expandedMenus['ai'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'AIChemistry' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('AIChemistry')}>AI + 化学前沿 (AI4S)</div>
                <div style={activeComponent === 'ResearchFrontier' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('ResearchFrontier')}>2026 顶刊科研前沿</div>
              </div>
            )}
          </div>

          {/* 原有：化学计算工具 */}
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('calc')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>calculate</span> 
              <span style={styles.menuText}>化学计算工具</span>
            </div>
            {expandedMenus['calc'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'CalcTools' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('CalcTools')}>DFT与分子动力学</div>
              </div>
            )}
          </div>

          {/* 原有：虚拟实验平台 */}
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('vlab')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>biotech</span> 
              <span style={styles.menuText}>虚拟实验平台</span>
            </div>
            {expandedMenus['vlab'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'VirtualLab' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('VirtualLab')}>虚拟实验模拟</div>
              </div>
            )}
          </div>

          {/* 原有：科研案例库 */}
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('cases')}>
              <span className="material-symbols-outlined" style={styles.menuIcon}>article</span> 
              <span style={styles.menuText}>科研案例库</span>
            </div>
            {expandedMenus['cases'] && (
              <div style={styles.subMenuBox}>
                <div style={activeComponent === 'ResearchCases' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('ResearchCases')}>顶刊文献解析</div>
              </div>
            )}
          </div>
        </aside>

        {/* 中间核心实验展示区 */}
        <main style={styles.mainContent}>
          {renderContent()}
        </main>

        {/* 右侧 AI 对话框 */}
        <aside style={styles.aiSidebar}>
          <div style={styles.aiHeader}>
            <span className="material-symbols-outlined" style={{ color: '#0ea5e9' }}>auto_awesome</span>
            <span style={{ fontWeight: 'bold' }}>DeepMind 化学大模型</span>
          </div>
          <div style={styles.aiBody}>
            {chatHistory.map((msg, index) => (
              <div key={index} style={{ ...styles.aiMessageBase, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'ai' ? '#f0f9ff' : '#f8fafc', borderColor: msg.role === 'ai' ? '#bae6fd' : '#e2e8f0' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: msg.role === 'ai' ? '#0284c7' : '#475569', marginBottom: '4px' }}>{msg.role === 'ai' ? '🤖 核心超算' : '👤 研究员'}</div>
                <div className="markdown-prose" style={{ fontSize: '13px', color: '#334155' }}>
                  {msg.role === 'ai' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={styles.aiInputArea}>
            <input type="text" placeholder="呼叫 AI 计算核心..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={styles.aiInput} />
            <button style={styles.aiSendBtn} onClick={(e) => handleChatSubmit(e, true)}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span></button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ==========================================
// 样式保持不变
// ==========================================
const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', fontFamily: 'Inter, sans-serif' },
  header: { height: '60px', backgroundColor: '#082f49', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', zIndex: 50 },
  backBtn: { color: '#bae6fd', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px' },
  headerTitle: { fontSize: '18px', fontWeight: '800', letterSpacing: '1px', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '15px' },
  workspace: { flex: 1, display: 'flex', overflow: 'hidden' },
  
  sidebar: { width: '200px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px 8px', overflowY: 'auto', zIndex: 10 },
  menuGroup: { marginBottom: '8px' },
  menuHeader: { display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#475569' },
  menuIcon: { fontSize: '20px', marginRight: '8px', color: '#64748b' },
  menuText: { fontSize: '14px', fontWeight: '600', flex: 1 },
  subMenuBox: { display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '36px', marginTop: '4px', marginBottom: '8px' },
  subMenuItem: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: '500', transition: '0.2s' },
  subMenuItemActive: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#0284c7', backgroundColor: '#f0f9ff', fontSize: '13px', fontWeight: 'bold', transition: '0.2s' },
  
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#0f172a' },
  
  aiSidebar: { width: '240px', backgroundColor: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 10 },
  aiHeader: { height: '60px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px', backgroundColor: '#f8fafc' },
  aiBody: { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' },
  aiMessageBase: { padding: '12px 16px', borderRadius: '12px', border: '1px solid', color: '#334155', fontSize: '14px', lineHeight: 1.5 },
  aiInputArea: { padding: '12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', gap: '8px' },
  aiInput: { flex: 1, padding: '10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' },
  aiSendBtn: { backgroundColor: '#082f49', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s', ':hover': { backgroundColor: '#0284c7' } }
};