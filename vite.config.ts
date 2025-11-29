import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // GitHub Pages 部署：如果设置了 VITE_BASE_PATH，使用它；否则默认 './'（本地开发）
  const base = process.env.VITE_BASE_PATH || './';
  return {
    plugins: [react()],
    base: base,
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  }
})