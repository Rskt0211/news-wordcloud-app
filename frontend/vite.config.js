// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages のサブフォルダ名（リポジトリ名）を指定
  base: '/news-wordcloud-app/',

  // ビルド成果物をルート直下の docs/ に出力
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },

  plugins: [react()],

  server: {
    // もしバックエンドへのプロキシ設定があればここに
    proxy: {
      /* … */
    },
  },
})
