// src/main.jsx
import './index.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App.jsx'
import DetailPage from './components/DetailPage.jsx'


const container = document.getElementById('root')
const root = createRoot(container)

root.render(
    // basename は末尾スラッシュなし
  <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>

    <Routes>
      {/* Dashboard を / に */}
      <Route path="/" element={<App />} />

      {/* 各カテゴリ詳細を /detail/:category に */}
      <Route path="/detail/:category" element={<DetailPage />} />

      {/* 未定義パスは Dashboard にリダイレクトする場合 */}
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  </BrowserRouter>
)
