#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Medical Blog Auto-Generator for AskDrLiu / cursor-site
-------------------------------------------------------
- Fetches latest medical news (gallbladder, longevity, diet)
- Generates bilingual (zh/en) blog post via Claude API
- Fetches a relevant cover image from Pexels
- Saves markdown to public/blog-posts/
- Auto-registers the post in src/data/blog-posts.ts

Run daily via GitHub Actions or manually.
"""

import os
import re
import json
import time
import random
import string
import requests
import feedparser
from datetime import datetime, timezone
from pathlib import Path

from anthropic import Anthropic

# ─────────────────────────── Config ───────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[1]
BLOG_MD_DIR = REPO_ROOT / "public" / "blog-posts"
BLOG_INDEX_FILE = REPO_ROOT / "src" / "data" / "blog-posts.ts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"

BLOG_MD_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "").strip()

MODEL = "claude-3-5-sonnet-20241022"

# RSS sources: gallbladder health, liver, longevity, nutrition
FEED_URLS = [
    "https://www.sciencedaily.com/rss/health_medicine/gallbladder_disease.xml",
    "https://www.sciencedaily.com/rss/health_medicine/nutrition.xml",
    "https://www.sciencedaily.com/rss/health_medicine/liver_disease.xml",
    "https://www.sciencedaily.com/rss/health_medicine.xml",
    "https://feeds.feedburner.com/StudyFinds",
    "https://www.medicalnewstoday.com/rss",
    "https://feeds.bmj.com/bmj/recent",
]

# Image search keywords mapped to topics
IMAGE_KEYWORDS = {
    "gallbladder": ["healthy food", "digestive health", "nutrition", "medical"],
    "liver": ["liver health", "healthy lifestyle", "medical research"],
    "longevity": ["longevity", "healthy aging", "exercise lifestyle"],
    "nutrition": ["healthy food", "vegetables", "mediterranean diet"],
    "default": ["healthcare", "medical", "healthy lifestyle"],
}

FOCUS_KEYWORDS = [
    "gallstone", "gallbladder", "cholecystectomy", "bile", "ERCP", "POCS",
    "liver", "hepatic", "longevity", "nutrition", "diet", "aging",
    "digestive health", "fatty liver", "obesity", "metabolic",
]


# ─────────────────────────── RSS Fetch ───────────────────────────
def fetch_entries(feed_url: str, timeout=20):
    try:
        d = feedparser.parse(feed_url, request_headers={"User-Agent": "AskDrLiu-Bot/1.0"})
        entries = []
        for e in d.entries[:30]:
            title = (e.get("title") or "").strip()
            link = (e.get("link") or "").strip()
            summary = re.sub(r"\s+", " ", (e.get("summary") or e.get("description") or "").strip())
            if title and link:
                entries.append({"title": title, "link": link, "summary": summary[:800]})
        return entries
    except Exception as ex:
        print(f"[WARN] Feed failed: {feed_url} → {ex}")
        return []


def pick_topic(all_entries):
    if not all_entries:
        raise RuntimeError("No RSS entries. Check feeds or network.")
    focus = [k.lower() for k in FOCUS_KEYWORDS]
    # Prefer entries matching focus keywords
    for e in all_entries:
        t = e["title"].lower() + " " + e["summary"].lower()
        if any(k in t for k in focus):
            return e
    return random.choice(all_entries[:10])


def detect_topic_type(title: str, summary: str) -> str:
    text = (title + " " + summary).lower()
    if any(k in text for k in ["gallbladder", "gallstone", "bile", "cholecyst", "ercp", "pocs"]):
        return "gallbladder"
    if any(k in text for k in ["liver", "hepatic", "fatty liver"]):
        return "liver"
    if any(k in text for k in ["longevity", "aging", "lifespan", "centenar"]):
        return "longevity"
    if any(k in text for k in ["nutrition", "diet", "food", "vitamin", "mineral"]):
        return "nutrition"
    return "default"


# ─────────────────────────── Claude Generation ───────────────────────────
SYSTEM_PROMPT = """You are a senior physician (hepatobiliary surgery specialist) writing bilingual medical education content.
Rules:
- Educational only — not diagnosis or personal medical advice.
- No fear-based language, no absolute treatment claims.
- Clear structure, short paragraphs, practical guidance.
- When evidence is uncertain, explicitly say so.
- Include a brief "When to see a doctor" section.
- Output MUST be valid JSON only (no markdown fences).

JSON structure:
{
  "title": "中文标题 (max 30 chars)",
  "titleEn": "English title (max 60 chars)",
  "excerpt": "中文摘要 (80-120 chars, no newlines)",
  "excerptEn": "English excerpt (100-160 chars, no newlines)",
  "category": "中文分类 (one of: 胆囊健康 | 肝脏健康 | 长寿饮食 | 微创技术 | 术后康复)",
  "categoryEn": "English category (one of: Gallbladder Health | Liver Health | Longevity & Diet | Minimally Invasive Tech | Post-Surgery Recovery)",
  "tags": ["tag1", "tag2", "tag3"],
  "markdownZh": "中文正文 markdown (~900-1200字)",
  "markdownEn": "English body markdown (~600-900 words)"
}"""

USER_PROMPT = """Generate a bilingual medical blog post based on this news cue.

Headline: {headline}
Source URL: {url}
Summary: {summary}

Key focus areas: {focus}

Chinese article requirements:
- Hook (1-2 lines that make readers curious)
- What this research means for patients
- 3-5 practical takeaways (bullet points)
- When to seek medical care (bullets)
- One-line disclaimer

English article requirements:
- Same structure but natural English tone
- More concise than Chinese version

Return valid JSON only."""


def generate_post(headline: str, url: str, summary: str) -> dict:
    if not ANTHROPIC_API_KEY:
        raise RuntimeError("Missing ANTHROPIC_API_KEY")
    client = Anthropic(api_key=ANTHROPIC_API_KEY)

    prompt = USER_PROMPT.format(
        headline=headline,
        url=url,
        summary=summary[:600],
        focus=", ".join(FOCUS_KEYWORDS[:8]),
    )

    resp = client.messages.create(
        model=MODEL,
        max_tokens=3500,
        temperature=0.4,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    text = "".join(b.text for b in resp.content if hasattr(b, "text")).strip()

    # Parse JSON
    try:
        data = json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if not m:
            raise ValueError(f"Model did not return JSON:\n{text[:300]}")
        data = json.loads(m.group(0))

    required = ["title", "titleEn", "excerpt", "excerptEn", "category", "categoryEn", "tags", "markdownZh", "markdownEn"]
    for k in required:
        if k not in data:
            raise ValueError(f"Missing key: {k}")
    return data


# ─────────────────────────── Image Fetch ───────────────────────────
def fetch_pexels_image(topic_type: str, slug: str) -> str:
    """Download a Pexels image and return the local path (relative to public/)."""
    if not PEXELS_API_KEY:
        # Return a default existing image
        defaults = {
            "gallbladder": "/images/gallstone-prevention.jpg",
            "liver": "/images/liver-health.jpg",
            "longevity": "/images/dietary-guidance.jpg",
            "nutrition": "/images/dietary-guidance.jpg",
            "default": "/images/recovery-guide.jpg",
        }
        return defaults.get(topic_type, "/images/pocs-surgery.jpg")

    keywords = IMAGE_KEYWORDS.get(topic_type, IMAGE_KEYWORDS["default"])
    query = random.choice(keywords)

    try:
        resp = requests.get(
            "https://api.pexels.com/v1/search",
            headers={"Authorization": PEXELS_API_KEY},
            params={"query": query, "per_page": 10, "orientation": "landscape"},
            timeout=15,
        )
        photos = resp.json().get("photos", [])
        if not photos:
            return "/images/pocs-surgery.jpg"

        photo = random.choice(photos[:5])
        img_url = photo["src"]["large"]
        photographer = photo.get("photographer", "Pexels")

        # Download
        img_resp = requests.get(img_url, timeout=30)
        img_filename = f"blog-{slug[:40]}.jpg"
        img_path = IMAGES_DIR / img_filename
        img_path.write_bytes(img_resp.content)

        return f"/images/blog/{img_filename}"
    except Exception as ex:
        print(f"[WARN] Pexels fetch failed: {ex}")
        return "/images/pocs-surgery.jpg"


# ─────────────────────────── Save Markdown ───────────────────────────
def save_markdown(slug: str, data: dict, image_url: str, source_url: str):
    today = datetime.now().strftime("%Y-%m-%d")

    # Chinese markdown file
    zh_path = BLOG_MD_DIR / f"{slug}.md"
    zh_header = f"""---
title: {data['title']}
date: {today}
category: {data['category']}
image: {image_url}
source: {source_url}
---

"""
    zh_path.write_text(zh_header + data["markdownZh"].strip() + "\n", encoding="utf-8")

    # English markdown file
    en_path = BLOG_MD_DIR / f"{slug}-en.md"
    en_header = f"""---
title: {data['titleEn']}
date: {today}
category: {data['categoryEn']}
image: {image_url}
source: {source_url}
---

"""
    en_path.write_text(en_header + data["markdownEn"].strip() + "\n", encoding="utf-8")

    print(f"[OK] Saved: {zh_path.name} + {en_path.name}")
    return str(zh_path), str(en_path)


# ─────────────────────────── Update blog-posts.ts ───────────────────────────
def update_blog_index(slug: str, data: dict, image_url: str):
    """Insert new post entry into src/data/blog-posts.ts"""
    today = datetime.now().strftime("%Y-%m-%d")

    new_entry = f"""  {{
    id: '{slug}',
    title: '{data['title'].replace("'", "\\'")}',
    titleEn: '{data['titleEn'].replace("'", "\\'")}',
    excerpt: '{data['excerpt'].replace("'", "\\'")}',
    excerptEn: '{data['excerptEn'].replace("'", "\\'")}',
    date: '{today}',
    category: '{data['category']}',
    categoryEn: '{data['categoryEn']}',
    imageUrl: '{image_url}',
    author: '刘波主任'
  }},"""

    content = BLOG_INDEX_FILE.read_text(encoding="utf-8")

    # Insert after "export const blogPosts: BlogPost[] = ["
    marker = "export const blogPosts: BlogPost[] = ["
    if marker not in content:
        print("[WARN] Could not find blogPosts array marker. Skipping auto-insert.")
        print(f"[INFO] Manually add this entry:\n{new_entry}")
        return

    insert_pos = content.index(marker) + len(marker)
    # Skip any whitespace/newline after marker
    new_content = content[:insert_pos] + "\n" + new_entry + content[insert_pos:]
    BLOG_INDEX_FILE.write_text(new_content, encoding="utf-8")
    print(f"[OK] Registered in blog-posts.ts: {slug}")


# ─────────────────────────── Main ───────────────────────────
def make_slug(title: str) -> str:
    """Generate a URL-friendly slug from Chinese or English title."""
    # Remove non-alphanumeric (keep spaces)
    clean = re.sub(r"[^\w\s-]", "", title, flags=re.UNICODE)
    clean = re.sub(r"\s+", "-", clean.strip()).lower()
    # Limit length and add random suffix
    clean = clean[:40]
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    today = datetime.now().strftime("%Y%m%d")
    return f"{today}-{clean}-{suffix}" if clean else f"{today}-post-{suffix}"


def main():
    print("=== AskDrLiu Medical Blog Auto-Generator ===")

    # 1. Fetch RSS feeds
    all_entries = []
    for url in FEED_URLS:
        entries = fetch_entries(url)
        all_entries.extend(entries)
        if entries:
            print(f"[OK] {url} → {len(entries)} entries")

    if not all_entries:
        print("[ERROR] No RSS entries fetched. Exiting.")
        return

    # 2. Pick topic
    topic = pick_topic(all_entries)
    print(f"\n[TOPIC] {topic['title']}\n  → {topic['link']}")

    # 3. Detect topic type for image matching
    topic_type = detect_topic_type(topic["title"], topic["summary"])

    # 4. Generate bilingual post
    print("[GEN] Calling Claude API...")
    data = generate_post(topic["title"], topic["link"], topic["summary"])
    print(f"[OK] Generated: {data['title']} / {data['titleEn']}")

    # 5. Fetch image
    slug = make_slug(data["title"])
    print("[IMG] Fetching cover image...")
    image_url = fetch_pexels_image(topic_type, slug)
    print(f"[OK] Image: {image_url}")

    # 6. Save markdown files
    save_markdown(slug, data, image_url, topic["link"])

    # 7. Update blog-posts.ts
    update_blog_index(slug, data, image_url)

    print(f"\n✅ Done! Slug: {slug}")
    print("   Next: commit & push → Vercel will auto-deploy.")


if __name__ == "__main__":
    main()
