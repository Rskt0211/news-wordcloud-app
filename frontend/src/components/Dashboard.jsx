// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  // Vite が inject してくれる base URL ('/' or '/news-wordcloud-app/')
  const base = import.meta.env.BASE_URL || '/'

  // 最新バッチのタイムスタンプ state
  const [ts, setTs] = useState('')

  // 各カテゴリの関連記事 JSON
  const [newsByCategory, setNewsByCategory] = useState({})

  const categories = ['business','entertainment','general','health','technology']

  // ── 1) 起動時に最新タイムスタンプを取得 ───────────────
  useEffect(() => {
    fetch(`${base}api/latest?limit=1`)
      .then(res => {
        if (!res.ok) throw new Error('最新タイムスタンプ取得失敗')
        return res.json()
      })
      .then(arr => {
        if (Array.isArray(arr) && arr.length > 0) {
          setTs(arr[0])
        }
      })
      .catch(err => {
        console.error(err)
      })
  }, [base])

  // ── 2) ts が取れたら各カテゴリの JSON を取得 ────────────
  useEffect(() => {
    if (!ts) return

    categories.forEach(cat => {
      fetch(`${base}static/${ts}/${cat}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`${cat}.json が取得できませんでした`)
          return res.json()
        })
        .then(data => {
          setNewsByCategory(prev => ({ ...prev, [cat]: data }))
        })
        .catch(err => {
          console.error(err)
          setNewsByCategory(prev => ({ ...prev, [cat]: [] }))
        })
    })
  }, [base, ts])

  // セクションへスクロール
  const scrollTo = id => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-2">
        World News Trends: What's Hot Now?
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Instantly grasp main topics by category.
      </p>

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

      <div className="grid grid-cols-1 gap-12">
        {categories.map(cat => {
          const articles = newsByCategory[cat] || []
          return (
            <section id={cat} key={cat} className="space-y-4">
              <h2 className="text-2xl font-semibold">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </h2>

              {/* ワードクラウド画像 */}
              {ts ? (
                <img
                  src={`${base}static/${ts}/${cat}_wordcloud.png`}
                  alt={`${cat} wordcloud`}
                  className="w-full object-contain rounded shadow"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 animate-pulse rounded" />
              )}

              {/* 関連ニュース */}
              <h3 className="text-xl font-medium">Related Articles</h3>
              <ul className="list-disc list-inside space-y-1">
                {articles.length === 0 ? (
                  <li>No related articles found yet.</li>
                ) : (
                  articles.slice(0, 5).map((a, i) => (
                    <li key={i}>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {a.title || `Article #${i + 1}`}
                      </a>
                    </li>
                  ))
                )}
              </ul>
            </section>
          )
        })}
      </div>

      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>Advertisement space<br/>
        (Sponsor ads appear here in the free version)</p>
      </footer>
    </div>
  )
}
