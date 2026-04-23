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

from seo_article_rules import find_title_conflict, find_similar_article

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


def find_publish_candidate(posts: list[dict], today: str):
    publishable_statuses = {"draft", "pending"}
    todays = [
        p for p in posts
        if p.get("publish_date") == today and p.get("status") in publishable_statuses
    ]
    if todays:
        return todays[0], False

    overdue = []
    for p in posts:
        publish_date = (p.get("publish_date") or "").strip()
        if not publish_date or p.get("status") not in publishable_statuses:
            continue
        if publish_date >= today:
            continue
        slug = p.get("slug") or ""
        if (DRAFTS_DIR / f"{slug}.md").exists() or (PUBLISH_DIR / f"{slug}.md").exists():
            overdue.append(p)

    overdue.sort(key=lambda item: (item.get("publish_date") or "9999-99-99", item.get("slug") or ""))
    if overdue:
        chosen = overdue[0]
        original_date = chosen.get("publish_date")
        chosen["publish_date"] = today
        chosen["recovered_from"] = original_date
        print(f"[RECOVER] No post scheduled for {today}; using overdue draft {chosen.get('slug')} from {original_date}")
        return chosen, True

    return None, False


def register_in_index(entry: dict):
    """将文章注册到 blog-posts.ts"""
    title_conflict = find_title_conflict(entry.get("title", ""), ignore_slugs={entry.get("slug", "")})
    if title_conflict:
        raise ValueError(f"Duplicate title conflict with {title_conflict['slug']}")
    content = INDEX_FILE.read_text(encoding="utf-8")
    marker  = "export const blogPosts: BlogPost[] = ["

    if f"id: '{entry['slug']}'" in content:
        print(f"  [SKIP] Already registered: {entry['slug']}")
        return

    title = json.dumps(entry.get('title', '') or '', ensure_ascii=False)
    title_en = json.dumps(entry.get('titleEn', '') or '', ensure_ascii=False)
    excerpt = json.dumps(entry.get('excerpt', '') or '', ensure_ascii=False)
    excerpt_en = json.dumps(entry.get('excerptEn', '') or '', ensure_ascii=False)
    category = json.dumps(entry.get('category', '') or '', ensure_ascii=False)
    category_en = json.dumps(entry.get('categoryEn', '') or '', ensure_ascii=False)
    image_url = json.dumps(resolve_image_url(entry) or '', ensure_ascii=False)
    seo_title = json.dumps(entry.get('seoTitle', entry.get('title', '')) or '', ensure_ascii=False)
    seo_desc = json.dumps(entry.get('seoDescription', entry.get('excerpt', '')) or '', ensure_ascii=False)
    slug = json.dumps(entry['slug'], ensure_ascii=False)
    publish_date = json.dumps(entry['publish_date'], ensure_ascii=False)

    new_entry = f"""  {{
    id: {slug},
    title: {title},
    titleEn: {title_en},
    excerpt: {excerpt},
    excerptEn: {excerpt_en},
    seoTitle: {seo_title},
    seoDescription: {seo_desc},
    date: {publish_date},
    category: {category},
    categoryEn: {category_en},
    imageUrl: {image_url},
    author: "AskDrLiu.com"
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

    # 2. 找今天的条目；如无，自动补位最早的过期待发草稿
    entry, recovered = find_publish_candidate(posts, today)
    if not entry:
        print(f"[INFO] No post scheduled for {today}.")
        return

    slug  = entry["slug"]
    print(f"[PUB] Publishing: {slug} — {entry.get('title','')}")

    title_conflict = find_title_conflict(entry.get("title", ""), ignore_slugs={slug})
    if title_conflict:
        entry["status"] = "failed"
        entry["error"] = f"duplicate-title:{title_conflict['slug']}"
        QUEUE_FILE.write_text(
            json.dumps({"updated": queue["updated"], "posts": posts}, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
        print(f"[ERROR] Duplicate title blocked: {title_conflict['slug']}")
        return

    # 3. 找草稿文件（若已迁移到发布目录，走补偿路径）
    draft_path = DRAFTS_DIR / f"{slug}.md"
    publish_path = PUBLISH_DIR / f"{slug}.md"

    if draft_path.exists():
        # 4. 读取草稿，剥离 frontmatter
        raw = draft_path.read_text(encoding="utf-8")
        _meta, body = strip_frontmatter(raw)

        # 5. 写入正式发布目录（只保留正文，frontmatter 已通过 blog-posts.ts 管理）
        similar_article = find_similar_article(body, ignore_slugs={slug})
        if similar_article:
            entry["status"] = "failed"
            entry["error"] = f"duplicate-content:{similar_article['slug']}"
            QUEUE_FILE.write_text(
                json.dumps({"updated": queue["updated"], "posts": posts}, ensure_ascii=False, indent=2),
                encoding="utf-8"
            )
            print(f"[ERROR] Similar article blocked: {similar_article['slug']} ({similar_article['similarity']:.2f})")
            return
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
            p["publish_date"] = today

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
