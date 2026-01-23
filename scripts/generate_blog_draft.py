#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Generate ONE medical blog draft from RSS feeds and save it into:
  public/blog-posts/<slug>.md

Notes:
- This script writes only the Markdown file (content).
- It prints a "metadata snippet" you will later paste (or automate) into src/data/blog-posts.ts
- For GitHub Actions later: set ANTHROPIC_API_KEY in repo secrets.
"""

import os
import re
import json
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
import feedparser
from slugify import slugify

from anthropic import Anthropic

# ====== Config ======
# You can change these later; keep it simple for now.
FEED_URLS = [
    # General medicine / health news (RSS)
    "https://www.sciencedaily.com/rss/health_medicine.xml",
    "https://www.medicalnewstoday.com/rss",
    # Gastro / liver-related journals often have RSS; add/replace later if you want.
]

SITE_FOCUS = [
    "gallstones", "cholecystectomy", "post-cholecystectomy nutrition",
    "bile acids", "fat-soluble vitamins", "ERCP", "POCS",
    "fatty liver", "liver health",
]

REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = REPO_ROOT / "public" / "blog-posts"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# We do NOT edit blog-posts.ts yet in this step; we only print a snippet.
BLOG_INDEX_FILE = REPO_ROOT / "src" / "data" / "blog-posts.ts"

MODEL = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20240620")
API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()

SYSTEM_PROMPT = """You are a senior physician writing a public medical education blog draft.
Rules:
- Educational only, not medical diagnosis or personal medical advice.
- Avoid fear-based language, absolute claims, or overpromising.
- Use clear structure, short paragraphs, and practical guidance.
- When evidence is uncertain, say so.
- Include a short "When to seek medical care" section.
Output MUST be valid JSON only with keys:
title, excerpt, tags, markdown
"""

USER_PROMPT_TEMPLATE = """Create a blog draft based on this news/topic cue.

Topic cue:
- headline: {headline}
- source_url: {url}
- source_summary: {summary}

Site focus keywords (prefer integrating 2-4 naturally):
{focus_keywords}

Requirements:
- Audience: general public
- Language: Chinese
- Length: ~900-1400 Chinese characters
- Structure:
  1) Hook (1-2 lines)
  2) What happened / what it means
  3) Practical takeaways (3-6 bullets)
  4) When to seek medical care (bullets)
  5) Disclaimer (1 line)
- Tags: 3-6 short tags
Return JSON only.
"""


def fetch_feed_entries(feed_url: str, timeout=20):
    d = feedparser.parse(feed_url)
    entries = []
    for e in d.entries[:20]:
        title = (e.get("title") or "").strip()
        link = (e.get("link") or "").strip()
        summary = (e.get("summary") or e.get("description") or "").strip()
        # Normalize whitespace
        summary = re.sub(r"\s+", " ", summary)
        if title and link:
            entries.append({"title": title, "link": link, "summary": summary, "feed": feed_url})
    return entries


def pick_topic(all_entries):
    """
    Pick one entry. Heuristic: choose the first one whose title contains
    any focus keyword (case-insensitive). Fallback: first entry.
    """
    if not all_entries:
        raise RuntimeError("No RSS entries fetched. Check FEED_URLS or network.")
    focus = [k.lower() for k in SITE_FOCUS]
    for e in all_entries:
        t = e["title"].lower()
        if any(k in t for k in focus):
            return e
    return all_entries[0]


def extract_json_only(text: str) -> dict:
    """
    Claude should output JSON only. This is defensive parsing.
    """
    text = text.strip()
    # If it's already JSON
    try:
        return json.loads(text)
    except Exception:
        pass

    # Try to find the first JSON object
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        raise ValueError("Model output is not JSON.")
    return json.loads(m.group(0))


def generate_with_claude(headline: str, url: str, summary: str) -> dict:
    if not API_KEY:
        raise RuntimeError("Missing ANTHROPIC_API_KEY env var.")

    client = Anthropic(api_key=API_KEY)
    user_prompt = USER_PROMPT_TEMPLATE.format(
        headline=headline,
        url=url,
        summary=summary[:600],
        focus_keywords=", ".join(SITE_FOCUS),
    )

    resp = client.messages.create(
        model=MODEL,
        max_tokens=2200,
        temperature=0.4,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    # Newer SDK returns content blocks
    content_text = ""
    for block in resp.content:
        if hasattr(block, "text"):
            content_text += block.text

    data = extract_json_only(content_text)
    # Basic validation
    for k in ("title", "excerpt", "tags", "markdown"):
        if k not in data:
            raise ValueError(f"Missing key in JSON: {k}")
    if not isinstance(data["tags"], list):
        raise ValueError("tags must be a list")
    return data


def write_markdown(slug: str, md: str) -> Path:
    path = OUTPUT_DIR / f"{slug}.md"
    path.write_text(md.strip() + "\n", encoding="utf-8")
    return path


def main():
    # 1) fetch feeds
    all_entries = []
    for u in FEED_URLS:
        try:
            all_entries.extend(fetch_feed_entries(u))
        except Exception as ex:
            print(f"[WARN] Failed feed: {u} -> {ex}")

    topic = pick_topic(all_entries)
    headline, url, summary = topic["title"], topic["link"], topic["summary"]

    # 2) generate draft
    data = generate_with_claude(headline, url, summary)

    # 3) slug and save
    today = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d")
    base_slug = slugify(data["title"])[:60] or slugify(headline)[:60] or "post"
    slug = f"{today}-{base_slug}"

    out_path = write_markdown(slug, data["markdown"])

    # 4) print snippet (we'll automate insertion later)
    meta = {
        "title": data["title"],
        "slug": slug,
        "excerpt": data["excerpt"],
        "date": datetime.now().strftime("%Y-%m-%d"),
        "tags": data["tags"][:6],
        "sourceUrl": url,
    }

    print("\n✅ Draft generated:")
    print(f"- markdown: {out_path}")
    print("\n📌 Metadata snippet (save this; next step we will insert into src/data/blog-posts.ts automatically):")
    print(json.dumps(meta, ensure_ascii=False, indent=2))
    print("\n(Next step after you confirm: we create the GitHub Actions workflow to run this daily and commit the new .md file.)")


if __name__ == "__main__":
    main()
