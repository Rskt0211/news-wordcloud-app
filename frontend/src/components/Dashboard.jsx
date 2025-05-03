import React from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  // テスト用に固定
  const ts = '2025-05-01_17-19'
  const categories = ['business','entertainment','general','health','technology']

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-2">World News Trends: What's Hot Now?</h1>
      <p className="text-center text-gray-600 mb-8">
      Instantly grasp main topics by category.
      </p>

      <h2 className="text-xl font-semibold mb-4">カテゴリ一覧</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {categories.map(cat => (
          <Link
            key={cat}
            to={`/detail/${cat}`}
            className="flex flex-col items-center bg-white rounded-xl shadow hover:shadow-lg transition p-4"
          >
            {/* 条件分岐を外して、常に img を描画 */}
            <img
              src={`/static/${ts}/${cat}_wordcloud.png`}
              alt={`${cat} wordcloud`}
              className="w-full h-36 object-contain mb-2"
              onError={e => {
                e.currentTarget.onerror = null
                e.currentTarget.src = '/placeholder.png'
              }}
            />
            <span className="mt-1 text-lg font-medium capitalize">{cat}</span>
          </Link>
        ))}
      </div>

      <div className="mt-12 py-8 bg-gray-100 text-center text-sm text-gray-500 rounded-lg">
        広告スペース<br/>
        （無料版はここにスポンサー広告が表示されます）
      </div>
    </div>
  )
}
