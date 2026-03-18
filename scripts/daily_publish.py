#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Daily Publish Script for AskDrLiu / cursor-site
-------------------------------------------------
运行时机：每天 09:00 (北京时间)
功能：
  1. 读取 scripts/queue.json
  2. 找到今天应该发布的草稿
  3. 草稿 → 正式发布目录
  4. 注册到 src/data/blog-posts.ts
  5. 删除已发布条目的 draft 标记
"""

import os, re, json
from datetime import datetime
from pathlib import Path

# ─── 路径 ───────────────────────────────────────────────
REPO_ROOT   = Path(__file__).resolve().parents[1]
DRAFTS_DIR  = REPO_ROOT / "public" / "blog-posts" / "drafts"
PUBLISH_DIR = REPO_ROOT / "public" / "blog-posts"
QUEUE_FILE  = REPO_ROOT / "scripts" / "queue.json"
INDEX_FILE  = REPO_ROOT / "src" / "data" / "blog-posts.ts"
PUBLIC_DIR  = REPO_ROOT / "public"

FALLBACK_IMAGE_MAP = {
    "保胆": ["/images/pocs-surgery.jpg", "/images/gallstone-prevention.jpg"],
    "Gallbladder Preservation": ["/images/pocs-surgery.jpg", "/images/gallstone-prevention.jpg"],
    "胆囊炎": ["/images/gallstone-prevention.jpg", "/images/recovery-guide.jpg"],
    "Cholecystitis": ["/images/gallstone-prevention.jpg", "/images/recovery-guide.jpg"],
    "胆囊结石": ["/images/gallstone-prevention.jpg", "/images/pocs-surgery.jpg"],
    "Gallstones": ["/images/gallstone-prevention.jpg", "/images/pocs-surgery.jpg"],
    "胆囊切除术后营养": ["/images/recovery-guide.jpg", "/images/dietary-guidance.jpg"],
    "Post-Cholecystectomy Nutrition": ["/images/recovery-guide.jpg", "/images/dietary-guidance.jpg"],
    "胆囊与长寿": ["/images/dietary-guidance.jpg", "/images/liver-health.jpg"],
    "Gallbladder & Longevity": ["/images/dietary-guidance.jpg", "/images/liver-health.jpg"],
    "肝脏健康": ["/images/liver-health.jpg", "/images/pocs-surgery.jpg"],
    "Liver Health": ["/images/liver-health.jpg", "/images/pocs-surgery.jpg"],
    "胆囊健康": ["/images/gallstone-prevention.jpg", "/images/pocs-surgery.jpg"],
    "Gallbladder Health": ["/images/gallstone-prevention.jpg", "/images/pocs-surgery.jpg"],
}

BOOK_LINK_BLOCK_ZH = """

## 延伸阅读：推荐电子书

> **如果你希望更系统地了解胆囊切除术后饮食、腹泻、腹胀、脂肪消化与营养修复，可以进一步查看刘波医生整理的相关患者教育资料与电子书页面。**
>
> **《手術成功了，為什麼我的身體變了？——膽囊切除後的飲食與營養修復》**
>
> **👉 [在 gallbladdercare.com 查看这本书](https://gallbladdercare.com)**
"""


def strip_frontmatter(content: str) -> tuple[dict, str]:
    """解析并剥离 frontmatter，返回 (meta_dict, body)"""
    meta = {}
    body = content
    m = re.match(r"^---\r?\n([\s\S]*?)\r?\n---\r?\n", content)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, _, v = line.partition(":")
                meta[k.strip()] = v.strip()
        body = content[m.end():]
    return meta, body


def ensure_book_link(markdown_text: str) -> str:
    if "gallbladdercare.com" in markdown_text:
        return markdown_text
    marker = "## 参考文献"
    if marker in markdown_text:
        return markdown_text.replace(marker, BOOK_LINK_BLOCK_ZH + "\n" + marker, 1)
    return markdown_text.rstrip() + "\n\n" + BOOK_LINK_BLOCK_ZH + "\n"


def recent_image_urls(limit: int = 4) -> list[str]:
    """读取已发布列表前N篇 imageUrl，用于避免新文与头部文章重复。"""
    try:
        content = INDEX_FILE.read_text(encoding="utf-8")
        urls = re.findall(r"imageUrl:\s*'([^']+)'", content)
        return urls[:limit]
    except Exception:
        return []


def resolve_image_url(entry: dict) -> str:
    """确保 imageUrl 可用；缺失时回退到相关且尽量不重复的图片。"""
    image_url = (entry.get("imageUrl") or "").strip()

    if image_url.startswith("/"):
        image_path = PUBLIC_DIR / image_url.lstrip("/")
        if image_path.exists():
            return image_url

    candidates = FALLBACK_IMAGE_MAP.get(entry.get("category")) \
        or FALLBACK_IMAGE_MAP.get(entry.get("categoryEn")) \
        or ["/images/pocs-surgery.jpg", "/images/gallstone-prevention.jpg"]

    recent = set(recent_image_urls(limit=4))
    fallback = next((u for u in candidates if u not in recent), candidates[0])

    print(f"  [WARN] Missing image file for {entry.get('slug')}: {image_url or '(empty)'}")
    print(f"  [WARN] Fallback image applied: {fallback}")
    return fallback


def register_in_index(entry: dict):
    """将文章注册到 blog-posts.ts"""
    content = INDEX_FILE.read_text(encoding="utf-8")
    marker  = "export const blogPosts: BlogPost[] = ["

    if f"id: '{entry['slug']}'" in content:
        print(f"  [SKIP] Already registered: {entry['slug']}")
        return

    esc = lambda s: (s or '').replace("'", "\\\\'")
    title = esc(entry.get('title', ''))
    title_en = esc(entry.get('titleEn', ''))
    excerpt = esc(entry.get('excerpt', ''))
    excerpt_en = esc(entry.get('excerptEn', ''))
    category = esc(entry.get('category', ''))
    category_en = esc(entry.get('categoryEn', ''))
    image_url = esc(resolve_image_url(entry))
    seo_title = esc(entry.get('seoTitle', title))
    seo_desc = esc(entry.get('seoDescription', excerpt))

    new_entry = f"""  {{
    id: '{entry['slug']}',
    title: '{title}',
    titleEn: '{title_en}',
    excerpt: '{excerpt}',
    excerptEn: '{excerpt_en}',
    seoTitle: '{seo_title}',
    seoDescription: '{seo_desc}',
    date: '{entry['publish_date']}',
    category: '{category}',
    categoryEn: '{category_en}',
    imageUrl: '{image_url}',
    author: 'AskDrLiu.com'
  }},"""

    insert_pos  = content.index(marker) + len(marker)
    new_content = content[:insert_pos] + "\n" + new_entry + content[insert_pos:]
    INDEX_FILE.write_text(new_content, encoding="utf-8")
    print(f"  [Index] Registered: {entry['slug']}")


def main():
    today = (os.getenv("DATE_OVERRIDE") or datetime.now().strftime("%Y-%m-%d")).strip()
    print(f"=== Daily Publish: {today} ===")

    # 1. 读取队列
    if not QUEUE_FILE.exists():
        print("[INFO] No queue.json found. Nothing to publish today.")
        return

    queue = json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
    posts = queue.get("posts", [])

    # 2. 找今天的条目
    publishable_statuses = {"draft", "pending"}
    todays = [
        p for p in posts
        if p.get("publish_date") == today and p.get("status") in publishable_statuses
    ]

    if not todays:
        print(f"[INFO] No post scheduled for {today}.")
        return

    entry = todays[0]
    slug  = entry["slug"]
    print(f"[PUB] Publishing: {slug} — {entry.get('title','')}")

    # 3. 找草稿文件（若已迁移到发布目录，走补偿路径）
    draft_path = DRAFTS_DIR / f"{slug}.md"
    publish_path = PUBLISH_DIR / f"{slug}.md"

    if draft_path.exists():
        # 4. 读取草稿，剥离 frontmatter
        raw = draft_path.read_text(encoding="utf-8")
        _meta, body = strip_frontmatter(raw)

        # 5. 写入正式发布目录（只保留正文，frontmatter 已通过 blog-posts.ts 管理）
        publish_path.write_text(ensure_book_link(body).strip() + "\n", encoding="utf-8")
        print(f"  [File] → {publish_path.name}")
    elif publish_path.exists():
        body = publish_path.read_text(encoding="utf-8")
        publish_path.write_text(ensure_book_link(body).strip() + "\n", encoding="utf-8")
        print(f"  [Compensate] Draft missing, normalized published file: {publish_path.name}")
    else:
        print(f"[ERROR] Neither draft nor published file found for slug: {slug}")
        return

    # 6. 注册到 blog-posts.ts
    register_in_index(entry)

    # 7. 更新队列状态
    for p in posts:
        if p["slug"] == slug:
            p["status"] = "published"
            p["published_at"] = today

    QUEUE_FILE.write_text(
        json.dumps({"updated": queue["updated"], "posts": posts}, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"  [Queue] Marked as published")

    # 8. 删除草稿文件（若存在）
    if draft_path.exists():
        draft_path.unlink()
        print(f"  [Draft] Removed draft file")

    print(f"\n✅ Published: {entry.get('title','')}")


if __name__ == "__main__":
    main()
