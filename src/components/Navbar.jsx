import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.logoGroup}>
        {/* 高级感原子轨道 Logo */}
        <div style={styles.atomLogo}>
          <div style={styles.nucleus}></div>
          <div style={styles.orbit1}></div>
          <div style={styles.orbit2}></div>
        </div>
        <Link to="/" style={styles.logoText}>SMARTCHEM <span style={{fontWeight:300}}>VLE</span></Link>
      </div>
      
      <div style={styles.links}>
        <Link to="/" style={styles.navLink}>实验室首页</Link>
        
        {/* 未登录状态：使用 Link 跳转到独立登录页 */}
        <SignedOut>
          <Link to="/sign-in" style={styles.loginBtn}>进入系统</Link>
        </SignedOut>
        
        {/* 已登录状态：显示用户头像 */}
        <SignedIn>
          <UserButton afterSignOutUrl="/"/>
        </SignedIn>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4rem', height: '80px', backgroundColor: '#fff', boxShadow: '0 2px 15px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
  logoText: { fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none', letterSpacing: '1px' },
  atomLogo: { width: '40px', height: '40px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  nucleus: { width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 10px #3b82f6' },
  orbit1: { position: 'absolute', width: '30px', height: '12px', border: '1.5px solid #94a3b8', borderRadius: '50%', transform: 'rotate(45deg)' },
  orbit2: { position: 'absolute', width: '30px', height: '12px', border: '1.5px solid #94a3b8', borderRadius: '50%', transform: 'rotate(-45deg)' },
  links: { display: 'flex', alignItems: 'center', gap: '2rem' },
  navLink: { textDecoration: 'none', color: '#64748b', fontSize: '0.95rem', fontWeight: '500' },
  loginBtn: { padding: '10px 25px', backgroundColor: '#0f172a', color: '#fff', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }
};