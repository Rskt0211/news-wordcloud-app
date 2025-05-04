// src/main.jsx
import './index.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App.jsx'
import Dashboard from './components/Dashboard.jsx'


const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/detail/:category" element={<App />} />
    </Routes>
  </BrowserRouter>
)
