import React, { useEffect, useState } from 'react'

const categories = ['business', 'entertainment', 'general', 'health', 'technology']

export default function App() {
  // Vite の BASE_URL（例 /news-wordcloud-app/）の末尾スラッシュを削除
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')

  // 最新バッチのタイムスタンプ
  const [latestTS, setLatestTS] = useState('')
  // カテゴリごとの関連記事データ
  const [newsByCategory, setNewsByCategory] = useState({})

  
  // 1) 起動時に最新タイムスタンプを static/latest.json から取得
  useEffect(() => {
    fetch(`${base}static/latest.json`)

      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch latest timestamp')
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLatestTS(data[0])
        }
      })
      .catch(console.error)
  }, [base])

  // 2) タイムスタンプが決まったら各カテゴリのJSONを取得
  useEffect(() => {
    if (!latestTS) return
    categories.forEach(cat => {
      fetch(`${import.meta.env.BASE_URL}static/${latestTS}/${cat}.json`)
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

  // ボタンクリックでスクロール
  const scrollTo = id => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">World News Trends: What's Hot Now?</h1>
        <p className="text-gray-600">Instantly grasp main topics by category.</p>
      </header>

      {/* カテゴリボタン */}
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
              <h2 className="text-2xl font-semibold mb-4 capitalize">
                {cat}
              </h2>

              {/* ワードクラウド画像 */}
              {latestTS ? (
                <img
                  src={`${import.meta.env.BASE_URL}static/${ts}/${cat}_wordcloud.png`}
                  alt={`${cat} wordcloud`}
                  className="w-full max-w-xl mx-auto mb-4"
                />
              ) : (
                <div className="w-full max-w-xl h-48 bg-gray-200 mx-auto mb-4 animate-pulse rounded" />
              )}

              {/* 関連ニュース */}
              <h3 className="text-xl font-medium mb-2">Related Articles</h3>
              <ul className="list-disc list-inside space-y-1">
                {articles.length === 0 ? (
                  <li>No related articles found yet.</li>
                ) : (
                  articles.slice(0,5).map((a,i) => (
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
                )}
              </ul>
            </section>
          )
        })}
      </main>

      <footer className="mt-16 text-center text-sm text-gray-500">
        Advertisement space
      </footer>
    </div>
  )
}
