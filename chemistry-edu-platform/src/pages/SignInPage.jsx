import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div style={styles.container}>
      {/* 左侧：品牌视觉区 */}
      <div style={styles.brandSection}>
        <div style={styles.brandContent}>
          <h1 style={styles.title}>⚛️ SmartChem VLE</h1>
          <p style={styles.subtitle}>
            构建下一代化学教育生态。<br/>
            在这里，通过 3D 交互、实时动力学计算与 AI 助教，<br/>
            重新发现物质结构的微观之美。
          </p>
          <div style={styles.decorativeBox}>
            {/* 这里未来可以放一个自转的 3D 分子作为点缀 */}
            <span style={{ fontSize: '3rem' }}>🔬</span>
          </div>
        </div>
      </div>

      {/* 右侧：登录表单区 */}
      <div style={styles.formSection}>
        {/* 直接渲染 Clerk 的登录组件，去掉外层的弹窗限制 */}
        <SignIn 
          routing="hash" 
          forceRedirectUrl="/" 
          appearance={{
            elements: {
              // 这里的样式配置可以深度定制 Clerk 内部的 UI 细节，使其融入你的主题
              formButtonPrimary: { backgroundColor: '#2563eb', textTransform: 'none' },
              card: { boxShadow: 'none', padding: 0 },
              headerTitle: { color: '#0f172a' },
              headerSubtitle: { color: '#64748b' }
            }
          }}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: 'calc(100vh - 70px)', // 减去导航栏的高度
    backgroundColor: '#ffffff',
  },
  brandSection: {
    flex: 1,
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // 深邃的科技暗蓝渐变色
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
  },
  brandContent: {
    maxWidth: '500px',
    position: 'relative',
    zIndex: 10,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    letterSpacing: '1px',
  },
  subtitle: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#cbd5e1', // 浅蓝灰色
    marginBottom: '3rem',
  },
  decorativeBox: {
    width: '100px',
    height: '100px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  formSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  }
};