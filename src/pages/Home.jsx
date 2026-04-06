import React from 'react';
import { Link } from 'react-router-dom';

// ==========================================
// 🚨 核心修复：将所有图片作为变量导入
// 确保您的 src/assets/ 目录下有这些对应的图片文件
// ==========================================
import structureImg from '../assets/structure.jpg';
import reactionsImg from '../assets/reactions.jpg';
import elementsImg from '../assets/elements.jpg';
import theoryImg from '../assets/theory.jpg';
import aiImg from '../assets/AI+.jpg';
import trajectoryImg from '../assets/tractory.jpg';
import heroCoverImg from '../assets/hero-cover.jpg';

export default function Home() {
  // ==========================================
  // 核心模块数据字典（已替换为安全的图片变量）
  // ==========================================
  const coreModules = [
    { 
      id: 'structure', 
      name: '物质结构', 
      icon: 'science',
      img: structureImg, // 使用 import 的变量
      path: '/structure',
      desc: '探索原子轨道、分子构型与晶体结构，建立三维空间认知，剖析物质微观本质。',
      subModules: [
        { name: '元素周期性', path: '/structure/periodicity' },
        { name: '原子结构', path: '/structure/atom' },
        { name: '分子结构', path: '/structure/molecule' },
        { name: '配合物结构', path: '/structure/complex' },
        { name: '极限挑战', path: '/structure/quiz' }
      ]
    },
    { 
      id: 'reactions', 
      name: '反应基础', 
      icon: 'experiment',
      img: reactionsImg, // 使用 import 的变量
      path: '/reactions',
      desc: '深入解析热力学与动力学原理，通过交互动画直观阐释反应机理与能量变化过程。',
      subModules: [
        { name: '稀溶液理论', path: '/reactions/solution' },
        { name: '化学热力学', path: '/reactions/thermodynamics' },
        { name: '化学动力学', path: '/reactions/kinetics' },
        { name: '酸碱平衡', path: '/reactions/acid-base' },
        { name: '沉淀溶解平衡', path: '/reactions/precipitation' },
        { name: '氧化还原平衡', path: '/reactions/redox' },
        { name: '配位平衡', path: '/reactions/coordination' },
        { name: '极限挑战', path: '/reactions/quiz' }
      ]
    },
    { 
      id: 'elements', 
      name: '元素化学', 
      icon: 'grid_view',
      img: elementsImg, // 使用 import 的变量
      path: '/elements',
      desc: '系统学习主族与副族元素性质，构建动态周期表，洞悉元素递变规律与典型化合物特性。',
      subModules: [
        { name: 's区元素', path: '/elements/s-block' },
        { name: 'p区元素', path: '/elements/p-block' },
        { name: 'd区元素', path: '/elements/d-block' },
        { name: 'f区元素', path: '/elements/f-block' },
        { name: '极限挑战', path: '/elements/quiz' }
      ]
    },
    { 
      id: 'theory', 
      name: '理论应用', 
      icon: 'functions',
      img: theoryImg, // 使用 import 的变量
      path: '/theory',
      desc: '探究理论在实践中的应用案例，将深奥理论转化为可视化模型，指导实际化学应用。',
      subModules: [
        { name: '组成结构与性能', path: '/theory/properties' },
        { name: '化学平衡移动', path: '/theory/equilibrium' },
        { name: '反应速率调控', path: '/theory/rate-control' }
      ]
    },
    { 
      id: 'ai', 
      name: 'AI+前沿', 
      icon: 'auto_awesome',
      img: aiImg, // 使用 import 的变量
      path: '/ai-assistant',
      desc: '探究AI驱动的前沿化学领域的最新应用，AI助教解析前沿科研文献研究亮点。',
      subModules: [
        { name: '化学计算工具', path: '/ai-assistant/calc-tools' },
        { name: '虚拟实验平台', path: '/ai-assistant/v-lab' },
        { name: '科研案例库', path: '/ai-assistant/cases' }
      ]
    },
    { 
      id: 'trajectory', 
      name: '学习轨迹', 
      icon: 'timeline',
      img: trajectoryImg, // 使用 import 的变量
      path: '/trajectory',
      desc: '利用数据分析多维度评估学习成效，生成个性化能力雷达图，精准规划后续提升路径。',
      subModules: [
        { name: '学习时长', path: '/trajectory/time' },
        { name: '知识点掌握度', path: '/trajectory/mastery' },
        { name: '挑战完成率', path: '/trajectory/challenges' },
        { name: '报告与分析导出', path: '/trajectory/reports' }
      ]
    }
  ];

  return (
    <div style={styles.container}>
      {/* ================= 1. 顶部导航 ================= */}
      <header style={styles.header}>
        <Link to="/" style={styles.logoBox}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#001e40' }}>science</span>
          <span style={styles.logoText}>SMARTCHEM VLE</span>
        </Link>
        <nav style={styles.nav}>
          <div style={styles.navLinks}>
            <a href="#philosophy" style={styles.navLink}>核心理念</a>
            <a href="#modules" style={styles.navLink}>核心模块</a>
            <a href="#support" style={styles.navLink}>用户支持</a>
          </div>
          <div style={styles.authBox}>
            <Link to="/sign-in" style={styles.registerTextBtn}>免费注册</Link>
            <Link to="/sign-in" style={styles.loginSolidBtn}>登录系统</Link>
          </div>
        </nav>
      </header>

      {/* ================= 2. 主页巨幕 ================= */}
      <section id="hero" style={styles.hero}>
        <div style={styles.heroContainer}>
          <div style={styles.heroText}>
            <h1 style={styles.heroTitle}>可视化驱动<br/>化学认知升级</h1>
            <p style={styles.heroSub}>
              基于深度学习框架与高保真渲染的虚拟实验室，构建游戏化交互探究式化学学习生态，重塑化学教育未来。
            </p>
            <div style={styles.registrationBox}>
              <input type="email" placeholder="输入邮箱地址，开启您的科研之旅..." style={styles.emailInput} />
              <Link to="/sign-in" style={styles.heroRegisterBtn}>免费注册</Link>
            </div>
          </div>
          <div style={styles.heroImageContainer}>
            {/* 🚨 核心修复：巨幕背景图使用变量引入 */}
            <img src={heroCoverImg} alt="Hero" style={styles.heroImg} />
          </div>
        </div>
      </section>

      {/* ================= 3. 核心理念 ================= */}
      <section id="philosophy" style={styles.sectionLight}>
        <div style={styles.contentWrapper}>
          <h2 style={styles.sectionTitle}>核心理念：构建游戏化交互探究式化学学习生态</h2>
          <div style={styles.grid3}>
            <div style={styles.philosophyCard}>
              <div style={styles.iconBoxPrimary}><span className="material-symbols-outlined">view_in_ar</span></div>
              <h3 style={styles.cardTitle}>动态多维可视化引擎</h3>
              <p style={styles.cardText}>支持分子结构的三维拖拽旋转、电子云分布的实时动态渲染。将微观世界具象化为可触控的数字实体。</p>
            </div>
            <div style={styles.philosophyCard}>
              <div style={styles.iconBoxSecondary}><span className="material-symbols-outlined">psychology</span></div>
              <h3 style={styles.cardTitle}>AI模型无缝对接</h3>
              <p style={styles.cardText}>搭载先进的深度学习框架，实现智能辅助解题、化学方程预测。提供实验室导师般的全天候伴随式指导。</p>
            </div>
            <div style={styles.philosophyCard}>
              <div style={styles.iconBoxTertiary}><span className="material-symbols-outlined">all_inclusive</span></div>
              <h3 style={styles.cardTitle}>认知闭环与学习生态</h3>
              <p style={styles.cardText}>从知识获取到能力评测，结合个性化学习轨迹。让探究式学习真正落地，激发科研潜能。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. 核心模块 (全量级透出式胶囊导航) ================= */}
      <section id="modules" style={styles.sectionWhite}>
        <div style={styles.contentWrapper}>
          <h2 style={styles.sectionTitleLeft}>核心模块</h2>
          <div style={styles.gridModules}>
            {coreModules.map(mod => (
              <div key={mod.id} style={styles.moduleCard}>
                <Link to={mod.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {/* 🚨 核心修复：动态渲染正确的变量图片 */}
                  <div style={{ ...styles.moduleImg, backgroundImage: `url(${mod.img})` }}></div>
                  <div style={styles.moduleContent}>
                    <div style={styles.moduleHeader}>
                      <div style={styles.smallIcon}><span className="material-symbols-outlined">{mod.icon}</span></div>
                      <h3 style={styles.moduleTitle}>{mod.name}</h3>
                    </div>
                    <p style={styles.moduleDesc}>{mod.desc}</p>
                  </div>
                </Link>
                
                {/* 胶囊标签区：通过 flexWrap 完美适配多达 8 个的子模块标签 */}
                <div style={styles.subModuleContainer}>
                  {mod.subModules.map((sub, index) => (
                    <Link to={sub.path} key={index} style={styles.subModuleTag}>
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 5. 支持模块与 AI 助教预览 ================= */}
      <section id="support" style={styles.sectionLight}>
        <div style={styles.aiSupportContainer}>
          <div style={styles.aiSupportText}>
            <div style={styles.aiBadge}>AI服务中心</div>
            <h2 style={styles.aiTitle}>全天候智能实验助教</h2>
            <p style={styles.aiSub}>搭载多模态大模型的数字生命体，随时响应您的化学探索疑问。支持图文识别、方程推演及文献检索。</p>
            <ul style={styles.aiList}>
              <li style={styles.aiListItem}><span className="material-symbols-outlined">check_circle</span> 24小时实时解答理论与实验问题</li>
              <li style={styles.aiListItem}><span className="material-symbols-outlined">check_circle</span> 各模块均配置互动可视化与AI解析</li>
              <li style={styles.aiListItem}><span className="material-symbols-outlined">mail</span> 反馈邮箱: taiyulei@163.com</li>
            </ul>
          </div>
          <div style={styles.aiAssistantUI}>
            <div style={styles.chatHeader}>
              <div style={styles.chatStatus}></div>
              <span>SmartChem AI Assistant</span>
            </div>
            <div style={styles.chatBody}>
              <div style={styles.chatMessageUser}>请帮我生成《配合物结构》的极限挑战习题。</div>
              <div style={styles.chatMessageAI}>
                好的，已为您定位到“晶体场理论”。接下来请观察以下配合物的吸收光谱，并推断其磁性...
                <div style={styles.chatVisual}>[AI 生成的晶体场分裂互动图表]</div>
              </div>
            </div>
            <div style={styles.chatInput}>
              <input type="text" placeholder="询问 AI 助教..." style={styles.chatInputField} readOnly />
              <button style={styles.chatSend}>发送</button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer style={styles.footer}>
        <div style={styles.contentWrapper}>
          <div style={styles.footerTop}>
            <div style={styles.logoBox}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#001e40' }}>science</span>
              <span style={styles.logoText}>SMARTCHEM VLE</span>
            </div>
            <div style={styles.footerLinks}>
              <a href="#" style={styles.footerLink}>隐私政策</a>
              <a href="#" style={styles.footerLink}>服务条款</a>
            </div>
          </div>
          <div style={styles.footerBottom}>
            © 2026 SMARTCHEM VLE 虚拟实验室. 保留所有权利.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ================= 样式表 =================
const styles = {
  container: { backgroundColor: '#f8f9fa', color: '#191c1d', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 64px', backgroundColor: '#fff', borderBottom: '1px solid #e7e8e9', position: 'sticky', top: 0, zIndex: 100 },
  logoBox: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
  logoText: { fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '20px', color: '#001e40', letterSpacing: '-0.02em' },
  nav: { display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'space-between', marginLeft: '60px' },
  navLinks: { display: 'flex', gap: '32px' },
  navLink: { color: '#43474f', textDecoration: 'none', fontWeight: 600, fontSize: '15px' },
  authBox: { display: 'flex', alignItems: 'center', gap: '20px' },
  registerTextBtn: { color: '#0056d2', textDecoration: 'none', fontWeight: 700, fontSize: '15px' },
  loginSolidBtn: { backgroundColor: '#0056d2', color: '#fff', padding: '10px 24px', borderRadius: '4px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' },

  hero: { backgroundColor: '#001e40', padding: '100px 64px 140px', color: '#fff', overflow: 'hidden' },
  heroContainer: { maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '48px' },
  heroText: { flex: 1 },
  heroTitle: { fontFamily: 'Manrope, sans-serif', fontSize: '56px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' },
  heroSub: { fontSize: '18px', color: '#d5e3ff', lineHeight: 1.6, marginBottom: '40px', maxWidth: '500px' },
  registrationBox: { display: 'flex', gap: '12px', maxWidth: '500px', backgroundColor: '#fff', padding: '6px', borderRadius: '8px' },
  emailInput: { flex: 1, padding: '14px 16px', borderRadius: '6px', border: 'none', fontSize: '16px', outline: 'none', color: '#0f172a' },
  heroRegisterBtn: { backgroundColor: '#0056d2', color: '#fff', textDecoration: 'none', padding: '0 32px', borderRadius: '6px', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' },
  heroImageContainer: { flex: 1.2, position: 'relative' },
  heroImg: { width: '100%', borderRadius: '16px', boxShadow: '0 24px 48px rgba(0,0,0,0.3)', objectFit: 'cover' },

  sectionLight: { padding: '96px 64px', backgroundColor: '#f3f4f5' },
  sectionWhite: { padding: '96px 64px', backgroundColor: '#fff' },
  contentWrapper: { maxWidth: '1280px', margin: '0 auto' },
  sectionTitle: { textAlign: 'center', fontFamily: 'Manrope, sans-serif', fontSize: '32px', fontWeight: 800, marginBottom: '64px', color: '#001e40' },
  sectionTitleLeft: { fontFamily: 'Manrope, sans-serif', fontSize: '32px', fontWeight: 800, marginBottom: '48px', color: '#001e40' },

  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' },
  philosophyCard: { backgroundColor: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  iconBoxPrimary: { width: '56px', height: '56px', backgroundColor: '#d5e3ff', color: '#001e40', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' },
  iconBoxSecondary: { width: '56px', height: '56px', backgroundColor: '#90efef', color: '#006e6e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' },
  iconBoxTertiary: { width: '56px', height: '56px', backgroundColor: '#ffd6fe', color: '#35003f', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' },
  cardTitle: { fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' },
  cardText: { fontSize: '14px', lineHeight: 1.6, color: '#43474f' },

  gridModules: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  moduleCard: { backgroundColor: '#fff', border: '1px solid #e7e8e9', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', ':hover': { boxShadow: '0 10px 30px rgba(0,0,0,0.08)' } },
  moduleImg: { height: '180px', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#e2e8f0' }, 
  moduleContent: { padding: '24px 24px 16px' },
  moduleHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  smallIcon: { color: '#001e40' },
  moduleTitle: { fontFamily: 'Manrope, sans-serif', fontSize: '18px', fontWeight: 700, color: '#0f172a' },
  moduleDesc: { fontSize: '14px', color: '#43474f', lineHeight: 1.6 },
  
  subModuleContainer: { padding: '0 24px 24px', display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' },
  subModuleTag: { padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '50px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', transition: '0.2s', border: '1px solid transparent', ':hover': { backgroundColor: '#e2e8f0' } },

  aiSupportContainer: { maxWidth: '1024px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '24px', padding: '48px', display: 'flex', gap: '64px', alignItems: 'center', border: '1px solid #e7e8e9' },
  aiSupportText: { flex: 1 },
  aiBadge: { display: 'inline-block', backgroundColor: '#ffd6fe', color: '#35003f', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, marginBottom: '24px' },
  aiTitle: { fontFamily: 'Manrope, sans-serif', fontSize: '32px', fontWeight: 800, marginBottom: '16px' },
  aiSub: { fontSize: '16px', color: '#43474f', lineHeight: 1.6, marginBottom: '32px' },
  aiList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' },
  aiListItem: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 500 },
  aiAssistantUI: { flex: 1, backgroundColor: '#f3f4f5', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e7e8e9', display: 'flex', flexDirection: 'column', height: '400px' },
  chatHeader: { backgroundColor: '#fff', padding: '16px', borderBottom: '1px solid #e7e8e9', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '14px' },
  chatStatus: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' },
  chatBody: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  chatMessageUser: { alignSelf: 'flex-end', backgroundColor: '#001e40', color: '#fff', padding: '12px 16px', borderRadius: '12px 12px 0 12px', fontSize: '14px', maxWidth: '80%' },
  chatMessageAI: { alignSelf: 'flex-start', backgroundColor: '#fff', padding: '12px 16px', borderRadius: '12px 12px 12px 0', fontSize: '14px', maxWidth: '85%', border: '1px solid #e7e8e9' },
  chatVisual: { marginTop: '12px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #c3c6d1', textAlign: 'center', color: '#737780', fontSize: '12px' },
  chatInput: { backgroundColor: '#fff', padding: '16px', borderTop: '1px solid #e7e8e9', display: 'flex', gap: '12px' },
  chatInputField: { flex: 1, border: '1px solid #e7e8e9', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', outline: 'none' },
  chatSend: { backgroundColor: '#001e40', color: '#fff', border: 'none', padding: '0 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' },

  footer: { padding: '64px 64px 48px', backgroundColor: '#edeeef', borderTop: '1px solid #e7e8e9' },
  footerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' },
  footerLinks: { display: 'flex', gap: '24px' },
  footerLink: { color: '#43474f', textDecoration: 'none', fontSize: '14px' },
  footerBottom: { textAlign: 'center', color: '#737780', fontSize: '12px' }
};