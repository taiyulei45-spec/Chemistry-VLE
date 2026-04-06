import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SignInPage() {
  // 状态：用于在 "登录(Login)" 和 "注册(Register)" 之间切换
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={styles.wrapper}>
      {/* 极简顶部 Logo 栏 */}
      <header style={styles.header}>
        <Link to="/" style={styles.logoBox}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#001e40' }}>science</span>
          <span style={styles.logoText}>SMARTCHEM VLE</span>
        </Link>
      </header>

      {/* 登录/注册 卡片 */}
      <main style={styles.main}>
        <div style={styles.authCard}>
          <h1 style={styles.cardTitle}>{isLogin ? '欢迎回来' : '注册开启科研之旅'}</h1>
          
          {/* 切换 Tab */}
          <div style={styles.tabContainer}>
            <button 
              style={isLogin ? styles.activeTab : styles.inactiveTab}
              onClick={() => setIsLogin(true)}
            >
              登录系统
            </button>
            <button 
              style={!isLogin ? styles.activeTab : styles.inactiveTab}
              onClick={() => setIsLogin(false)}
            >
              邮箱注册
            </button>
          </div>

          {/* 表单区域 */}
          <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>全名</label>
                <input type="text" placeholder="输入您的真实姓名" style={styles.input} />
              </div>
            )}
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>电子邮箱</label>
              <input type="email" placeholder="name@example.com" style={styles.input} />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>密码</label>
              <input type="password" placeholder="输入您的密码" style={styles.input} />
            </div>

            <button type="submit" style={styles.submitBtn}>
              {isLogin ? '立即登录' : '创建免费账号'}
            </button>
          </form>

          {/* 底部协议与声明 */}
          <div style={styles.footerText}>
            继续操作即表示您同意我们的 <a href="#" style={styles.link}>服务条款</a> 和 <a href="#" style={styles.link}>隐私政策</a>。
          </div>
        </div>
      </main>
    </div>
  );
}

// 登录注册页的专属内联样式
const styles = {
  wrapper: { backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' },
  
  header: { padding: '24px 48px', backgroundColor: '#fff', borderBottom: '1px solid #e7e8e9' },
  logoBox: { display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
  logoText: { fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '20px', color: '#001e40', letterSpacing: '-0.02em' },
  
  main: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },
  authCard: { backgroundColor: '#fff', padding: '48px', borderRadius: '12px', width: '100%', maxWidth: '440px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e7e8e9' },
  
  cardTitle: { textAlign: 'center', fontSize: '24px', fontWeight: 800, color: '#001e40', marginBottom: '32px', fontFamily: 'Manrope, sans-serif' },
  
  tabContainer: { display: 'flex', borderBottom: '1px solid #e7e8e9', marginBottom: '32px' },
  activeTab: { flex: 1, padding: '12px 0', border: 'none', backgroundColor: 'transparent', borderBottom: '2px solid #0056d2', color: '#0056d2', fontWeight: 700, fontSize: '15px', cursor: 'pointer' },
  inactiveTab: { flex: 1, padding: '12px 0', border: 'none', backgroundColor: 'transparent', borderBottom: '2px solid transparent', color: '#737780', fontWeight: 600, fontSize: '15px', cursor: 'pointer' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#43474f' },
  input: { padding: '12px 16px', borderRadius: '6px', border: '1px solid #c3c6d1', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' },
  
  submitBtn: { marginTop: '10px', backgroundColor: '#0056d2', color: '#fff', border: 'none', padding: '14px', borderRadius: '6px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: '0.2s' },
  
  footerText: { marginTop: '32px', fontSize: '12px', color: '#737780', textAlign: 'center', lineHeight: 1.5 },
  link: { color: '#0056d2', textDecoration: 'none' }
};