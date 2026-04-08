import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SignIn, SignUp, SignedIn, SignedOut } from '@clerk/clerk-react';

export default function SignInPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div style={styles.wrapper}>
      {/* 顶部 Logo 栏 */}
      <header style={styles.header}>
        <Link to="/" style={styles.logoBox}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#001e40' }}>science</span>
          <span style={styles.logoText}>SMARTCHEM VLE</span>
        </Link>
      </header>

      {/* 登录/注册 核心区 */}
      <main style={styles.main}>
        <div style={styles.authCard}>
          
          {/* 🌟 1. 登录成功后，安全护航，直接送回主页 */}
          <SignedIn>
            <Navigate to="/" replace />
          </SignedIn>

          {/* 🌟 2. 只有未登录时，才显示这块区域 */}
          <SignedOut>
            <h1 style={styles.cardTitle}>{isLogin ? '欢迎回来' : '注册开启科研之旅'}</h1>
            
            {/* 顶部 Tab 切换 */}
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

            {/* Clerk 官方组件区：恢复了 routing="hash" */}
            <div style={styles.clerkContainer}>
              {isLogin ? (
                <SignIn 
                  routing="hash" 
                  fallbackRedirectUrl="/" 
                />
              ) : (
                <SignUp 
                  routing="hash" 
                  fallbackRedirectUrl="/" 
                />
              )}
            </div>
          </SignedOut>

        </div>
      </main>
    </div>
  );
}

// 样式保持不变
const styles = {
  wrapper: { backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' },
  header: { padding: '24px 48px', backgroundColor: '#fff', borderBottom: '1px solid #e7e8e9' },
  logoBox: { display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
  logoText: { fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '20px', color: '#001e40', letterSpacing: '-0.02em' },
  main: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },
  authCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e7e8e9' },
  cardTitle: { textAlign: 'center', fontSize: '24px', fontWeight: 800, color: '#001e40', marginBottom: '24px', fontFamily: 'Manrope, sans-serif' },
  tabContainer: { display: 'flex', borderBottom: '1px solid #e7e8e9', marginBottom: '32px' },
  activeTab: { flex: 1, padding: '12px 0', border: 'none', backgroundColor: 'transparent', borderBottom: '2px solid #0056d2', color: '#0056d2', fontWeight: 700, fontSize: '15px', cursor: 'pointer' },
  inactiveTab: { flex: 1, padding: '12px 0', border: 'none', backgroundColor: 'transparent', borderBottom: '2px solid transparent', color: '#737780', fontWeight: 600, fontSize: '15px', cursor: 'pointer' },
  clerkContainer: { display: 'flex', justifyContent: 'center', width: '100%' }
};