import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // 部署配置：
  // - GitHub Pages: 需要设置 VITE_BASE_PATH 为 /仓库名/
  // - Vercel: 使用 '/' (默认，无需设置)
  // - 本地开发: 使用 './' (默认)
  const base = process.env.VITE_BASE_PATH || (process.env.VERCEL ? '/' : './');
  return {
    plugins: [react()],
    base: base,
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  }
})