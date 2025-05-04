import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const categories = ['business','entertainment','general','health','technology']

export default function Dashboard() {
  // Vite が inject するベース URL（末尾スラッシュを除去）
  const base = import.meta.env.BASE_URL.replace(/\/$/, '') || ''

  // 最新タイムスタンプ取得
  const [latestTS, setLatestTS] = useState('')
  useEffect(() => {
    fetch(`${base}/static/latest.json`)
      .then(res => {
        if (!res.ok) throw new Error('latest.json が取得できませんでした')
        return res.json()
      })
      .then(arr => {
        if (Array.isArray(arr) && arr.length) setLatestTS(arr[0])
      })
      .catch(console.error)
  }, [base])

  // 各カテゴリの記事 JSON 取得
  const [newsByCategory, setNewsByCategory] = useState({})
  useEffect(() => {
    if (!latestTS) return
    categories.forEach(cat => {
      fetch(`${base}/static/${latestTS}/${cat}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`${cat}.json を取得できませんでした`)
          return res.json()
        })
        .then(data => setNewsByCategory(prev => ({ ...prev, [cat]: data })))
        .catch(() => setNewsByCategory(prev => ({ ...prev, [cat]: [] })))
    })
  }, [base, latestTS])

  // ボタンでスクロール
  const scrollTo = id => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">World News Trends: What's Hot Now?</h1>
        <p className="text-gray-600">Instantly grasp main topics by category.</p>
      </header>

      <div className="flex justify-center gap-4 mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => scrollTo(cat)}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <main className="space-y-16">
        {categories.map(cat => {
          const articles = newsByCategory[cat] || []
          return (
            <section id={cat} key={cat}>
              <h2 className="text-2xl font-semibold mb-4 capitalize">{cat}</h2>

              {latestTS ? (
                <img
                  src={`${base}/static/${latestTS}/${cat}_wordcloud.png`}
                  alt={`${cat} wordcloud`}
                  className="w-full max-w-xl mx-auto mb-4"
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.png' }}
                />
              ) : (
                <div className="w-full max-w-xl h-48 bg-gray-200 mx-auto mb-4 animate-pulse rounded" />
              )}

              <h3 className="text-xl font-medium mb-2">Related Articles</h3>
              <ul className="list-disc list-inside space-y-1">
                {articles.length === 0
                  ? <li>No related articles found yet.</li>
                  : articles.slice(0,5).map((a,i) => (
                      <li key={i}>
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          {a.title || `Article #${i+1}`}
                        </a>
                      </li>
                    ))
                }
              </ul>
            </section>
          )
        })}
      </main>

      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>Advertisement space<br/>(Sponsor ads appear here in the free version)</p>
      </footer>
    </div>
  )
}
