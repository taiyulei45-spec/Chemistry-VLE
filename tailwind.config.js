/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#001e40",
        "on-primary": "#ffffff",
        "primary-container": "#003366",
        "on-primary-container": "#799dd6",
        "primary-fixed-dim": "#a7c8ff",
        
        "secondary": "#006a6a", // Teal (用于输入框激活等)
        "secondary-container": "#90efef",
        "on-secondary-container": "#006e6e",
        
        "tertiary": "#3a0044", // Neon Violet (仅用于关键强调)
        "tertiary-container": "#5c006b",
        "on-tertiary-container": "#e16bf2",
        
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        
        "surface": "#f8f9fa", // 全局背景大白/灰白
        "on-surface": "#191c1d", // 全局主字体颜色
        "surface-variant": "#e1e3e4",
        "on-surface-variant": "#43474f",
        
        // 阶梯式容器背景（用于实现“无边框法则”）
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-container": "#edeeef",
        "surface-container-high": "#e7e8e9",
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      letterSpacing: {
        tightest: '-0.02em',
        widest: '0.1em', // 用于化学符号的特殊排版
      }
    },
  },
  plugins: [],
}