// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
/* server: {
/*     proxy: {
      // フロント → /static/xxxx.png → バックエンド http://127.0.0.1:8000/static/xxxx.png
      '/static': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // API も同様にプロキシしているはずですが、念のため
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    } 
  }*/
})
