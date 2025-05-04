// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  // Vite の BASE_URL（例 '/news-wordcloud-app/'）の末尾スラッシュを除去
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')

  // 最新バッチのタイムスタンプ
  const [latestTS, setLatestTS] = useState('')

  // カテゴリごとの記事 JSON
  const [newsByCategory, setNewsByCategory] = useState({})

  const categories = [
    'business',
    'entertainment',
    'general',
    'health',
    'technology',
  ]

  // 1) 起動時に最新タイムスタンプを取得
  useEffect(() => {
    fetch(`${base}/api/latest?limit=1`)
      .then(res => {
        if (!res.ok) throw new Error('最新タイムスタンプの取得に失敗しました')
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLatestTS(data[0])
        }
      })
      .catch(console.error)
  }, [base])

  // 2) latestTS が決まったらカテゴリごとの JSON を取得
  useEffect(() => {
    if (!latestTS) return

    categories.forEach(cat => {
      fetch(`${import.meta.env.BASE_URL}static/${latestTS}/${cat}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`${cat}.json の取得に失敗しました`)
          return res.json()
        })
        .then(data => {
          setNewsByCategory(prev => ({
            ...prev,
            [cat]: data,
          }))
        })
        .catch(() => {
          setNewsByCategory(prev => ({
            ...prev,
            [cat]: [],
          }))
        })
    })
  }, [base, latestTS])

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-2">
        World News Trends: What's Hot Now?
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Instantly grasp main topics by category.
      </p>

      <h2 className="text-xl font-semibold mb-4">Category List</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {categories.map(cat => (
          <Link
            key={cat}
            to={`/detail/${cat}`}
            className="flex flex-col items-center bg-white rounded-xl shadow hover:shadow-lg transition p-4"
          >
            {/* latestTS が取れていれば画像を表示 */}
            {latestTS ? (
              <img
                src={`${import.meta.env.BASE_URL}static/${ts}/${cat}_wordcloud.png`}
                alt={`${cat} wordcloud`}
                className="w-full h-36 object-contain mb-2"
                onError={e => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = `${base}/placeholder.png`
                }}
              />
            ) : (
              // 取得前のプレースホルダー
              <div className="w-full h-36 bg-gray-200 mb-2 animate-pulse rounded" />
            )}

            <span className="mt-1 text-lg font-medium capitalize">{cat}</span>
          </Link>
        ))}
      </div>

      <div className="mt-12 py-8 bg-gray-100 text-center text-sm text-gray-500 rounded-lg">
        Advertisement Space
      </div>
    </div>
  )
}
