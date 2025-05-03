# main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os
import requests
import datetime
from pathlib import Path
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from wordcloud import WordCloud
import json
import logging

# Routers
from routers.api import router as api_router

# ─── ログ設定 ────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── 環境変数の読み込み ─────────────────────────────────────────
load_dotenv()
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")

# ─── 定数 ──────────────────────────────────────────────────────
CATEGORIES = ["business", "entertainment", "general", "health", "technology"]
BASE_DIR = Path("data")
BASE_DIR.mkdir(exist_ok=True)

# ─── FastAPI アプリケーション初期化 ─────────────────────────────
app = FastAPI()

# 1) APIルーターを /api 以下にまとめる
app.include_router(api_router, prefix="/api")

# 2) 起動時に一度バッチ処理を実行
@app.on_event("startup")
def on_startup():
    update_all_categories()

# 3) data/ 以下を /static で公開
app.mount("/static", StaticFiles(directory="data"), name="static")

# ─── ルートエンドポイント ─────────────────────────────────────
@app.get("/")
def read_root():
    return {"message": "WordCloud batch is running."}

# ─── ワードクラウド一覧ページ ─────────────────────────────────
@app.get("/wordclouds", response_class=HTMLResponse)
def list_wordclouds():
    dirs = sorted([d for d in BASE_DIR.iterdir() if d.is_dir()], reverse=True)
    if not dirs:
        return "<p>No data found.</p>"
    latest = dirs[0]
    html = f"<h1>WordCloud & Top News ({latest.name})</h1>"
    for cat in CATEGORIES:
        png = latest / f"{cat}_wordcloud.png"
        jsn = latest / f"{cat}.json"
        if not png.exists() or not jsn.exists():
            continue
        html += f"<h2>{cat.title()}</h2>"
        html += f'<img src="/static/{latest.name}/{png.name}" width="400"><br>'
        articles = json.loads(jsn.read_text(encoding="utf-8"))
        html += "<ul>"
        for art in articles:
            title = art.get("title", "No Title")
            url   = art.get("url", "#")
            html += f'<li><a href="{url}" target="_blank">{title}</a></li>'
        html += "</ul>"
    return html

# ─── ニュース取得関数 ────────────────────────────────────────────
def fetch_news(category: str):
    """
    NewsAPI からトップヘッドラインを取得して articles を返却。
    失敗時は空リストを返す。
    """
    # 1) API URL 組み立て
    url = (
        "https://newsapi.org/v2/top-headlines"
        f"?country=us&category={category}"
        f"&pageSize=100&apiKey={NEWSAPI_KEY}"
    )
    logger.info(f"Fetching (category={category}) → {url}")

    # 2) HTTP リクエスト
    resp = requests.get(url)
    if resp.status_code != 200:
        logger.error(f"HTTP Error {resp.status_code} for category {category}")
        return []

    # 3) JSON デコード
    try:
        data = resp.json()
    except Exception as e:
        logger.error(f"JSON decode error for {category}: {e}")
        return []

    # 4) API エラーチェック
    if data.get("status") != "ok":
        logger.error(f"NewsAPI error for {category}: {data}")
        return []

    # 5) 記事取得 & ロギング
    articles = data.get("articles", [])
    logger.info(f"[DEBUG] {category} → fetched {len(articles)} articles")

    return articles


    """
    NewsAPI の everything エンドポイントを使い、
    直近12時間以内の記事をページネーションで取得。
    1ページあたり pageSize=100, page=1,2,... をループ。
    レスポンスヘッダー X-RateLimit-Remaining をチェックして枯渇前に停止。
    """
    all_articles = []
    now = datetime.datetime.utcnow()
    from_dt = (now - datetime.timedelta(hours=12)).isoformat() + "Z"
    page = 1
    page_size = 100

    while True:
        params = {
            "q": category,
            "language": "en",
            "from": from_dt,
            "pageSize": page_size,
            "page": page,
            "apiKey": NEWSAPI_KEY
        }
        url = "https://newsapi.org/v2/everything"
        logger.info(f"Fetching (category={category}, page={page})")
        resp = requests.get(url, params=params)
        data = resp.json()

        if data.get("status") != "ok":
            logger.error(f"Failed fetch {category} page {page}: {data}")
            break

        articles = data.get("articles", [])
        all_articles.extend(articles)

        # ページ内の記事数が満たない or no articles -> 終了
        if len(articles) < page_size:
            break

        # 残りリクエスト数を確認。残り1以下なら打ち切る
        remaining = int(resp.headers.get("X-RateLimit-Remaining", "0"))
        logger.info(f"X-RateLimit-Remaining={remaining}")
        if remaining <= 1:
            logger.warning("Rate limit nearly exhausted, stop pagination.")
            break

        page += 1

    return all_articles

# ─── ワードクラウド生成関数 ─────────────────────────────────────
def generate_wordcloud(text: str, save_path: Path):
    if not text.strip():
        return
    wc = WordCloud(
        font_path="C:/Windows/Fonts/msgothic.ttc",
        width=800, height=400, background_color="white"
    )
    img = wc.generate(text)
    save_path.parent.mkdir(parents=True, exist_ok=True)
    img.to_file(str(save_path))

# ─── バッチ処理関数 ────────────────────────────────────────────
def update_all_categories():
    now = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M")
    logger.info(f"[BATCH START] {now}")
    for cat in CATEGORIES:
        articles = fetch_news(cat)
        dir_path = BASE_DIR / now
        dir_path.mkdir(parents=True, exist_ok=True)
        with open(dir_path / f"{cat}.json", "w", encoding="utf-8") as f:
            json.dump(articles, f, ensure_ascii=False, indent=2)
        titles = " ".join(a.get("title","") for a in articles)
        generate_wordcloud(titles, dir_path / f"{cat}_wordcloud.png")
    logger.info(f"[BATCH END] {now}")

# ─── APScheduler で 朝6時・18時にバッチ実行 ─────────────────────
scheduler = BackgroundScheduler()
scheduler.add_job(
    update_all_categories,
    trigger="cron",
    hour="6,18",
    minute=0,
    timezone="Asia/Tokyo"
)
scheduler.start()

# ─── アプリ起動 ───────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
