import { useLocation, useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function DetailPage() {
  const { cat } = useParams()
  const { state } = useLocation()
  const ts = state?.ts
  const [articles, setArticles] = useState([])

  useEffect(() => {
    if (!ts) return
    axios.get(`/api/data/${ts}/${cat}`)
      .then(res => setArticles(res.data))
      .catch(console.error)
  }, [ts, cat])

  return (
    <div className="p-8 space-y-6">
      <Link to="/" className="text-blue-600 hover:underline">← Back</Link>
      <h1 className="text-3xl font-semibold capitalize">{cat}</h1>

      {ts && (
        <img
          src={`/static/${ts}/${cat}_wordcloud.png`}
          alt={cat}
          className="w-full h-auto rounded-lg shadow-md"
        />
      )}

      <h2 className="text-2xl font-medium mt-6">Top News</h2>
      <ul className="list-disc pl-6 space-y-2">
        {articles.slice(0,3).map((a,i) => (
          <li key={i}>
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {a.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
