// src/App.jsx
import React, { useEffect, useState } from 'react';

const categories = ["business", "entertainment", "general", "health", "technology"];

export default function App() {
  // テスト用固定タイムスタンプ
  const ts = "2025-05-01_17-19";

  // カテゴリごとのニュース配列を保持
  const [newsByCategory, setNewsByCategory] = useState({});

  useEffect(() => {
    categories.forEach(cat => {
      fetch(`/static/${ts}/${cat}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`${cat}.json を取得できませんでした`);
          return res.json();
        })
        .then(data => {
          // data は articles の配列
          setNewsByCategory(prev => ({
            ...prev,
            [cat]: data
          }));
        })
        .catch(err => {
          console.error(err);
          setNewsByCategory(prev => ({
            ...prev,
            [cat]: []
          }));
        });
    });
  }, [ts]);

  // ボタンクリックで該当セクションへスクロール
  const scrollTo = id => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="container">
      <header>
        <h1>ニューストレンドを一目で把握</h1>
        <p>カテゴリ別ワードクラウドと関連ニュースで、話題をすぐにキャッチ。</p>
      </header>

      {/* カテゴリボタン */}
      <div className="button-group">
        {categories.map(cat => (
          <button key={cat} onClick={() => scrollTo(cat)}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <main>
        {categories.map(cat => {
          const articles = newsByCategory[cat] || [];
          return (
            <section id={cat} key={cat} className="category-section">
              <h2>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h2>

              {/* ワードクラウド画像 */}
              <img
                src={`/static/${ts}/${cat}_wordcloud.png`}
                alt={`${cat} wordcloud`}
                className="category-image"
              />
               {/* ここから追加 */}
             <h3 className="related-title">関連ニュース記事</h3>

              {/* 関連ニュースリンク上位5件 */}
              <ul className="related-list">
                {articles.length === 0 && (
                  <li>関連記事が見つかりませんでした</li>
                )}
                {articles.slice(0, 5).map((a, i) => (
                  <li key={i}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {a.title || `記事 #${i + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>

      <footer>
        <p>広告スペース（無料版はここにスポンサー広告が表示されます）</p>
      </footer>
    </div>
  );
}
