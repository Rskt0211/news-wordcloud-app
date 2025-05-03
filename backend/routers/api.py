from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter()
BASE = Path(__file__).resolve().parent.parent / "data"

@router.get("/latest", summary="最新バッチのタイムスタンプ一覧")
def get_latest(limit: int = 8):
    dirs = sorted(
        [d.name for d in BASE.iterdir() if d.is_dir()],
        reverse=True
    )
    return dirs[:limit]

@router.get("/data/{timestamp}/{category}", summary="指定バッチ・カテゴリの記事JSONを返却")
def get_data(timestamp: str, category: str):
    p = BASE / timestamp / f"{category}.json"
    if not p.exists():
        raise HTTPException(status_code=404, detail="JSON not found")
    return json.loads(p.read_text(encoding="utf-8"))

@router.get("/wordcloud/{timestamp}/{category}", summary="指定バッチ・カテゴリのワードクラウド画像URLを返却")
def get_wordcloud(timestamp: str, category: str):
    p = BASE / timestamp / f"{category}_wordcloud.png"
    if not p.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return {"url": f"/static/{timestamp}/{category}_wordcloud.png"}

@router.get("/related/{timestamp}/{category}", summary="記事JSONから上位n件のリンクを返却")
def get_related(timestamp: str, category: str, top: int = 3):
    data = get_data(timestamp, category)
    return data[:top]
