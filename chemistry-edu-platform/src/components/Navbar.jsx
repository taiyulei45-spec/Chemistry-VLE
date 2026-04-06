import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '1rem 2rem', borderBottom: '1px solid #eee', backgroundColor: 'white' }}>
      <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'none', color: '#0f172a' }}>⚛️ SmartChem VLE</Link>
      <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
        <li><Link to="/structure" style={{textDecoration:'none', color:'#475569', fontWeight: '500'}}>物质结构</Link></li>
        <li><Link to="/reactions" style={{textDecoration:'none', color:'#475569', fontWeight: '500'}}>反应基础</Link></li>
        <li><Link to="/elements" style={{textDecoration:'none', color:'#475569', fontWeight: '500'}}>元素化学</Link></li>
        <li><Link to="/theory" style={{textDecoration:'none', color:'#475569', fontWeight: '500'}}>理论应用</Link></li>
        <li><Link to="/ai-assistant" style={{textDecoration:'none', color:'#475569', fontWeight: '500'}}>AI+前沿</Link></li>
      </ul>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/help" style={{textDecoration:'none', color:'#3b82f6', fontSize: '0.9rem'}}>帮助中心</Link>
        
        {/* 修改这里：不再使用 SignInButton 弹窗，而是用 Link 组件跳转到独立的登录页面 */}
        <SignedOut>
          <Link to="/sign-in" style={{ padding: '0.5rem 1.2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}>
            登录 / 注册
          </Link>
        </SignedOut>
        
        <SignedIn><UserButton afterSignOutUrl="/"/></SignedIn>
      </div>
    </nav>
  );
}