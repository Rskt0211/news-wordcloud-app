import React, { useEffect, useState } from 'react'

const categories = ['business','entertainment','general','health','technology']

export default function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') || ''

  const [latestTS, setLatestTS] = useState('')
  const [newsByCategory, setNewsByCategory] = useState({})

  useEffect(() => {
    fetch(`${base}/static/latest.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch latest timestamp')
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data) && data.length) setLatestTS(data[0])
      })
      .catch(console.error)
  }, [base])

  useEffect(() => {
    if (!latestTS) return
    categories.forEach(cat => {
      fetch(`${base}/static/${latestTS}/${cat}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`${cat}.json fetch failed`)
          return res.json()
        })
        .then(data => {
          setNewsByCategory(prev => ({ ...prev, [cat]: data }))
        })
        .catch(() => {
          setNewsByCategory(prev => ({ ...prev, [cat]: [] }))
        })
    })
  }, [base, latestTS])

  const scrollTo = id => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* …同じくワードクラウド表示のロジック… */}
    </div>
  )
}
