import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// ローカル開発では `vercel dev` を使用すると /api/* が Vercel Functions として動作します。
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
