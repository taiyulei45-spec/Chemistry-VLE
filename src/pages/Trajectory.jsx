import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchChemistryAnswer } from '../utils/llmClient';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar
} from 'recharts';

const radarData = [
  { subject: '物质结构', score: 85, fullMark: 100 }, { subject: '反应基础', score: 60, fullMark: 100 },
  { subject: '元素化学', score: 90, fullMark: 100 }, { subject: '理论应用', score: 75, fullMark: 100 },
  { subject: 'AI+前沿', score: 95, fullMark: 100 },
];
const timeData = [
  { week: '第一周', 理论学习: 4, 极限挑战: 2, 虚拟实验: 1 }, { week: '第二周', 理论学习: 5, 极限挑战: 3, 虚拟实验: 2 },
  { week: '第三周', 理论学习: 3, 极限挑战: 5, 虚拟实验: 4 }, { week: '第四周', 理论学习: 6, 极限挑战: 4, 虚拟实验: 3 },
];

export default function Trajectory() {
  const location = useLocation();
  const [activeComponent, setActiveComponent] = useState('Mastery');
  const [expandedMenus, setExpandedMenus] = useState({ 'stats': true, 'reports': true });

  const toggleMenu = (menu) => setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/mastery')) setActiveComponent('Mastery');
    else if (path.includes('/time')) setActiveComponent('Time');
    else if (path.includes('/challenges')) setActiveComponent('Challenges');
    else if (path.includes('/reports')) setActiveComponent('Reports');
    else setActiveComponent('Mastery');
  }, [location.pathname]);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: '欢迎来到学习轨迹中心！我是您的专属学情顾问，为您分析数据并制定提分策略。' }
  ]);
  const chatEndRef = useRef(null);

  const componentNameMap = { 'Mastery': '知识点掌握度', 'Time': '学习时长趋势', 'Challenges': '极限挑战完成率', 'Reports': '学情总结与输出' };

  const handleChatSubmit = async (e, isButton = false) => {
    if (!isButton) { if (e.key !== 'Enter' || e.nativeEvent.isComposing) return; }
    const userText = chatInput.trim();
    if (!userText) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userText }, { role: 'ai', text: '正在为您分析底层学习数据...' }]);

    try {
      const currentModule = componentNameMap[activeComponent] || '学情分析';
      const aiReply = await fetchChemistryAnswer(userText, chatHistory, currentModule);
      setChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'ai', text: aiReply }; return newHistory; });
    } catch (err) {
      setChatHistory(prev => { const newHistory = [...prev]; newHistory[newHistory.length - 1] = { role: 'ai', text: '⚠️ 网络异常。' }; return newHistory; });
    }
  };

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const handleExport = () => alert("📊 正在生成专属学习报告...\n报告将包含：多维能力雷达图、薄弱知识点清单及 AI 进阶学习策略。\n文件将以 PDF 格式下载。");

  const renderContent = () => {
    if (activeComponent === 'Mastery') {
      return (
        <div style={styles.chartWrapper}>
          <h3 style={styles.chartTitle}>多维化学能力雷达图</h3>
          <ResponsiveContainer width="100%" height="85%"><RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}><PolarGrid stroke="#334155" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 14, fontWeight: 'bold' }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569' }} /><Radar name="学生当前掌握度" dataKey="score" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.4} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} /></RadarChart></ResponsiveContainer>
        </div>
      );
    }
    if (activeComponent === 'Time') {
      return (
        <div style={styles.chartWrapper}>
          <h3 style={styles.chartTitle}>本月学习时长分布</h3>
          <ResponsiveContainer width="100%" height="85%"><BarChart data={timeData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} /><XAxis dataKey="week" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} /><Legend wrapperStyle={{ paddingTop: '20px' }} /><Bar dataKey="理论学习" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} /><Bar dataKey="虚拟实验" stackId="a" fill="#10b981" /><Bar dataKey="极限挑战" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
      );
    }
    if (activeComponent === 'Challenges') {
      return (
        <div style={{...styles.chartWrapper, alignItems: 'center', justifyContent: 'center'}}>
          <span className="material-symbols-outlined" style={{fontSize: '64px', color: '#f59e0b', marginBottom: '20px'}}>military_tech</span><h2 style={{color: '#fff'}}>极限挑战通关率：42%</h2><p style={{color: '#94a3b8'}}>您在“配位平衡”关卡停留时间过长，建议查阅理论解析。</p>
        </div>
      );
    }
    if (activeComponent === 'Reports') {
      return (
        <div style={{...styles.chartWrapper, alignItems: 'center', justifyContent: 'center'}}>
          <span className="material-symbols-outlined" style={{fontSize: '64px', color: '#10b981', marginBottom: '20px'}}>summarize</span><h2 style={{color: '#fff'}}>学期期中报告已生成</h2><button onClick={handleExport} style={{...styles.aiSendBtn, padding: '15px 30px', fontSize: '16px', marginTop: '20px'}}>📥 下载 PDF 报告</button>
        </div>
      );
    }
    return null;
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
          <span style={styles.headerTitle}>学习轨迹与学情数据舱</span>
        </div>
      </header>

      <div style={styles.workspace}>
        <aside style={styles.sidebar}>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('stats')}><span className="material-symbols-outlined" style={styles.menuIcon}>monitoring</span> <span style={styles.menuText}>多维数据看板</span></div>
            {expandedMenus['stats'] && (<div style={styles.subMenuBox}><div style={activeComponent === 'Mastery' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('Mastery')}>🎯 知识点掌握度</div><div style={activeComponent === 'Time' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('Time')}>⏳ 学习时长趋势</div><div style={activeComponent === 'Challenges' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('Challenges')}>⚔️ 挑战完成率</div></div>)}
          </div>
          <div style={styles.menuGroup}>
            <div style={styles.menuHeader} onClick={() => toggleMenu('reports')}><span className="material-symbols-outlined" style={styles.menuIcon}>assignment</span> <span style={styles.menuText}>学情总结与输出</span></div>
            {expandedMenus['reports'] && (<div style={styles.subMenuBox}><div style={activeComponent === 'Reports' ? styles.subMenuItemActive : styles.subMenuItem} onClick={() => setActiveComponent('Reports')}>📥 数据报告导出</div></div>)}
          </div>
        </aside>

        <main style={styles.mainContent}>{renderContent()}</main>

        <aside style={styles.aiSidebar}>
          <div style={styles.aiHeader}>
            <span className="material-symbols-outlined" style={{ color: '#10b981' }}>psychology</span>
            <span style={{ fontWeight: 'bold' }}>专属学情顾问</span>
          </div>
          <div style={styles.aiBody}>
            {chatHistory.map((msg, index) => (
              <div key={index} style={{ ...styles.aiMessageBase, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'ai' ? '#f0fdf4' : '#eff6ff', borderColor: msg.role === 'ai' ? '#bbf7d0' : '#bfdbfe' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: msg.role === 'ai' ? '#16a34a' : '#2563eb', marginBottom: '4px' }}>{msg.role === 'ai' ? '🤖 顾问诊断' : '👤 您'}</div>
                <div className="markdown-prose" style={{ fontSize: '13px', color: '#334155' }}>
                  {msg.role === 'ai' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> : msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={styles.aiInputArea}>
            <input type="text" placeholder="询问如何提高特定成绩..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => handleChatSubmit(e, false)} style={styles.aiInput} />
            <button style={styles.aiSendBtn} onClick={(e) => handleChatSubmit(e, true)}><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span></button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ⚠️ 此处保留你原文件最底部的 const styles = { ... } 不变！

// ================= 全局一致的高级样式 =================
const styles = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', fontFamily: 'Inter, sans-serif' },
  
  // 核心！强制变为深翠绿背景
  header: { height: '60px', backgroundColor: '#064e3b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  backBtn: { color: '#a7f3d0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '6px', transition: '0.2s', ':hover': { backgroundColor: 'rgba(255,255,255,0.1)' } },
  headerTitle: { fontSize: '18px', fontWeight: '800', letterSpacing: '1px', borderLeft: '2px solid rgba(255,255,255,0.2)', paddingLeft: '15px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  workspace: { flex: 1, display: 'flex', overflow: 'hidden' },
  
  // 左侧栏强制收紧至 190px
  sidebar: { width: '190px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px 8px', overflowY: 'auto', zIndex: 10 },
  menuGroup: { marginBottom: '8px' },
  menuHeader: { display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', color: '#475569', transition: '0.2s', ':hover': { backgroundColor: '#f8fafc' } },
  menuIcon: { fontSize: '20px', marginRight: '8px', color: '#64748b' },
  menuText: { fontSize: '14px', fontWeight: '600', flex: 1 },
  arrowIcon: { fontSize: '18px', color: '#94a3b8' },
  subMenuBox: { display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '36px', marginTop: '4px', marginBottom: '8px' },
  subMenuItem: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: '500', transition: '0.2s', ':hover': { backgroundColor: '#f8fafc', color: '#0f172a' } },
  subMenuItemActive: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', color: '#10b981', backgroundColor: '#f0fdf4', fontSize: '13px', fontWeight: 'bold' },

  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#0f172a', padding: '30px' },
  chartWrapper: { width: '100%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', backgroundColor: '#1e293b', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  chartTitle: { color: '#f8fafc', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', letterSpacing: '1px' },

  // 右侧栏强制收紧至 220px
  aiSidebar: { width: '220px', backgroundColor: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 10 },
  aiHeader: { height: '60px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 20px', backgroundColor: '#f8fafc' },
  aiBody: { flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' },
  aiMessageBase: { padding: '12px 16px', borderRadius: '12px', border: '1px solid', color: '#334155', fontSize: '14px', lineHeight: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  aiInputArea: { padding: '12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'flex', gap: '8px' },
  aiInput: { flex: 1, padding: '10px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' },
  aiSendBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s', ':hover': { backgroundColor: '#059669' } }
};