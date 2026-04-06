import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Structure from './pages/Structure';
import SignInPage from './pages/SignInPage'; // 1. 导入新的登录页

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/structure" element={<Structure />} />
        {/* 2. 增加登录页的路由 */}
        <Route path="/sign-in" element={<SignInPage />} />
        
        <Route path="/reactions" element={<div style={{padding:'2rem'}}><h2>核心模块二：反应基础 (建设中...)</h2></div>} />
        <Route path="/elements" element={<div style={{padding:'2rem'}}><h2>核心模块三：元素化学 (建设中...)</h2></div>} />
        <Route path="/theory" element={<div style={{padding:'2rem'}}><h2>核心模块四：理论应用 (建设中...)</h2></div>} />
        <Route path="/ai-assistant" element={<div style={{padding:'2rem'}}><h2>核心模块五：AI+前沿 (建设中...)</h2></div>} />
        <Route path="/help" element={<div style={{padding:'2rem'}}><h2>帮助中心 (建设中...)</h2></div>} />
      </Routes>
    </div>
  );
}

export default App;