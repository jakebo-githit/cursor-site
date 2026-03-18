#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Medical Blog Auto-Generator for AskDrLiu / cursor-site
-------------------------------------------------------
- Fetches latest medical news (gallbladder, longevity, diet)
- Generates bilingual (zh/en) blog post via Zhipu GLM-4-Plus API
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

from zhipuai import ZhipuAI
from ark_image_helper import generate_cover_image
from seo_article_rules import build_seo_fields as shared_build_seo_fields, ensure_book_link as shared_ensure_book_link, validate_article_payload, plain_text, normalize_space, validate_reference_policy, find_title_conflict, find_similar_article

# ─────────────────────────── Config ───────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[1]
BLOG_MD_DIR = REPO_ROOT / "public" / "blog-posts"
BLOG_INDEX_FILE = REPO_ROOT / "src" / "data" / "blog-posts.ts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"

BLOG_MD_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY", "").strip()
ARK_API_KEY = os.getenv("ARK_API_KEY", "").strip()

MODEL = "glm-4-plus"              # 智谱清言文本模型

# RSS sources: strict hepatobiliary focus
FEED_URLS = [
    "https://www.sciencedaily.com/rss/health_medicine/gallbladder_disease.xml",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=gallbladder+stone+cholecystitis&format=rss&limit=30",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=cholecystectomy+postoperative+nutrition&format=rss&limit=30",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=gallbladder+preservation+cholelithiasis&format=rss&limit=25",
]

FALLBACK_TOPICS = [
    {
        "title": "Dietary Considerations in Cholecystectomy: Investigating the Impact of Various Dietary Factors on Symptoms and Outcomes",
        "link": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11200314/",
        "summary": "Review of dietary considerations after cholecystectomy, including symptom management, meal timing, fat tolerance, and patient-centered recovery strategies.",
    },
    {
        "title": "A High-Fat, High-Cholesterol Diet Promotes Intestinal Inflammation by Exacerbating Gut Microbiome Dysbiosis and Bile Acid Disorders in Cholecystectomy",
        "link": "https://pubmed.ncbi.nlm.nih.gov/37686860/",
        "summary": "Experimental evidence that high-fat and high-cholesterol diets can worsen bile acid disorders, gut dysbiosis, and intestinal inflammation after cholecystectomy.",
    },
    {
        "title": "Bile acid diarrhea: current status and future directions",
        "link": "https://pubmed.ncbi.nlm.nih.gov/40110492/",
        "summary": "Updated review covering bile acid diarrhea mechanisms, diagnosis, and treatment directions relevant to persistent diarrhea after gallbladder removal.",
    },
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
    "gallbladder", "gallstone", "cholelithiasis", "cholecystitis", "cholecystectomy",
    "post-cholecystectomy", "gallbladder preservation", "biliary", "bile", "pocs",
    "diet after cholecystectomy", "gallbladder inflammation", "gallbladder diet", "bile acid diarrhea",
]

BLOCK_KEYWORDS = [
    "organ transplant", "transplantation", "kidney transplant", "heart transplant",
    "lung transplant", "donor", "allograft", "immunosuppression",
]

IMAGE_PROMPTS = {
    "gallbladder": "黑白漫画风格医学科普封面，主题为胆囊健康、门诊沟通与日常健康管理，画面干净明亮、温和安心、适合个人医生网站文章封面",
    "liver": "黑白漫画风格医学科普封面，主题为肝胆健康与日常保养，画面干净明亮、专业可信，可出现健康饮食与生活方式场景",
    "longevity": "黑白漫画风格医学科普封面，主题为健康长寿与代谢管理，画面干净明亮、轻松自然，可出现步行、轻运动、规律生活",
    "nutrition": "黑白漫画风格医学科普封面，主题为胆囊切除术后饮食恢复与营养管理，画面干净明亮、安心专业，可出现均衡清淡饮食、家中恢复与散步场景",
    "default": "黑白漫画风格肝胆健康医学科普封面，画面干净明亮、专业可信，可出现医生沟通、健康饮食、恢复生活方式等安全场景",
}


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
    block = [k.lower() for k in BLOCK_KEYWORDS]

    # 仅保留肝胆目标话题，并剔除器官移植类
    filtered = []
    for e in all_entries:
        t = (e["title"] + " " + e["summary"]).lower()
        if any(k in t for k in block):
            continue
        if any(k in t for k in focus):
            filtered.append(e)

    if filtered:
        return filtered[0]

    print("[WARN] No eligible RSS topic found, falling back to curated hepatobiliary topic.")
    return random.choice(FALLBACK_TOPICS)


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
- This is for a personal doctor website, not a hospital or e-commerce site.
- Do not mention concrete hospital names, departments, or institutional promotion.
- Do not recommend affiliate products or product bundles; ebook mention is allowed only as soft follow-up reading.
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
  "focusKeyword": "Primary Chinese keyword phrase for this article",
  "longTailKeywords": ["long-tail keyword 1", "long-tail keyword 2", "long-tail keyword 3"],
  "category": "中文分类 (one of: 保胆 | 胆囊炎 | 胆囊结石 | 胆囊切除术后营养)",
  "categoryEn": "English category (one of: Gallbladder Preservation | Cholecystitis | Gallstones | Post-Cholecystectomy Nutrition)",
  "tags": ["tag1", "tag2", "tag3"],
  "markdownZh": "中文正文 markdown (1200-1800字，含“参考文献”段)",
  "markdownEn": "English body markdown (800-1200 words, include 'References')"
}"""

USER_PROMPT = """Generate a bilingual medical blog post based on this news cue.

Headline: {headline}
Source URL: {url}
Summary: {summary}

Key focus areas: {focus}

Chinese article requirements (AskDrLiu GEO template):
- Topic must stay strictly within gallbladder and postoperative nutrition scope, prioritizing: gallbladder preservation, cholecystitis, gallstones, post-cholecystectomy nutrition
- Length must be 2200-3200 Chinese characters (do not write short posts)
- Must start with section `## 先说结论（30秒读完）` and give clear conclusion first
- SEO rule: title must reflect a concrete search intent; the first paragraph must naturally include the main keyword and answer the question quickly
- References should be concise: 3-5 total maximum, and prioritize newer studies or guidelines from the last 5 years when possible
- Include at least 2 internal relative links in the Chinese article, such as /blog /faq /assessment /contact
- Then use at least 4 FAQ-style subheadings (question format), e.g. “胆囊结石一定要切吗？”
- Each FAQ section must include: one-line conclusion + 2-4 actionable bullets + one common misconception line
- Include section `## 风险边界与就医信号` with clear emergency signals (bullets)
- Include section `## 参考文献` with 3-5 real sources, each as markdown list item with title/journal/year/URL
- End with one-line medical disclaimer
- Tone rule: flagship stance allowed but medically safe — "能保尽保，前提是安全可保；不具备条件时，规范切除 + 术后营养管理"

English article requirements:
- Same structure but natural English tone
- Length 900-1400 words
- Start with a clear "Key takeaway" block before details
- Use at least 4 question-style subheadings (FAQ style)
- Add section `## References` with 3-5 real sources

SEO/GEO requirement:
- Write for citation-readability: short paragraphs, explicit conclusions, practical bullets, no vague claims

Return valid JSON only."""


def _extract_reference_urls(markdown_text: str) -> list[str]:
    return re.findall(r"https?://[^\s)]+", markdown_text)


def _url_reachable(u: str) -> bool:
    try:
        r = requests.head(u, timeout=12, allow_redirects=True)
        if r.status_code < 400:
            return True
    except Exception:
        pass
    try:
        r = requests.get(u, timeout=15, allow_redirects=True)
        return r.status_code < 400
    except Exception:
        return False


def is_rate_limit_error(ex: Exception) -> bool:
    message = str(ex).lower()
    return any(token in message for token in ["429", "rate limit", "too many requests", "余额不足", "无可用资源包", "频率"])


def call_glm_with_backoff(client: ZhipuAI, *, messages: list[dict], temperature: float, max_attempts: int = 5):
    last_error = None
    for attempt in range(1, max_attempts + 1):
        try:
            return client.chat.completions.create(
                model=MODEL,
                temperature=temperature,
                messages=messages,
            )
        except Exception as ex:
            last_error = ex
            if attempt >= max_attempts:
                raise
            if is_rate_limit_error(ex):
                sleep_seconds = min(90, 8 * attempt + random.uniform(1.0, 3.0))
                print(f"[WARN] Provider throttled on attempt {attempt}/{max_attempts}: {ex}")
            else:
                sleep_seconds = min(30, 3 * attempt + random.uniform(0.5, 1.5))
                print(f"[WARN] GLM call failed on attempt {attempt}/{max_attempts}: {ex}")
            print(f"[WAIT] Sleeping {sleep_seconds:.1f}s before retry")
            time.sleep(sleep_seconds)
    raise RuntimeError(f"Failed after retries: {last_error}")


def _build_markdown_en_fallback(data: dict) -> str:
    title_en = normalize_space(data.get("titleEn")) or normalize_space(data.get("title")) or "Gallbladder Health Article"
    excerpt_en = normalize_space(data.get("excerptEn")) or normalize_space(data.get("excerpt")) or "This article is currently available primarily in Chinese on AskDrLiu.com."
    zh_urls = _extract_reference_urls(data.get("markdownZh", ""))[:5]
    refs = "\n".join(f"- {u}" for u in zh_urls) if zh_urls else "- Source links are listed in the Chinese version."
    return f"# {title_en}\n\n## Key takeaway\n\n{excerpt_en}\n\nThis article is currently published primarily in Chinese on AskDrLiu.com. Please refer to the Chinese version for the full discussion.\n\n## References\n{refs}\n"


def _repair_generated_payload(data: dict) -> dict:
    zh_plain = plain_text(data.get("markdownZh", ""))
    if len(normalize_space(data.get("excerpt"))) < 60 and zh_plain:
        data["excerpt"] = zh_plain[:86].rstrip(" ，。；;,. ") + "。"
    if len(normalize_space(data.get("excerptEn"))) < 60:
        seed = normalize_space(data.get("excerptEn")) or normalize_space(data.get("excerpt")) or "Chinese article with practical gallbladder health guidance and references."
        data["excerptEn"] = seed[:156]
    if not normalize_space(data.get("focusKeyword")) or normalize_space(data.get("focusKeyword")) not in normalize_space(data.get("title")):
        data["focusKeyword"] = normalize_space(data.get("title"))
    if not data.get("longTailKeywords"):
        focus = normalize_space(data.get("focusKeyword")) or normalize_space(data.get("title"))
        data["longTailKeywords"] = [focus, f"{focus}怎么办"] if focus else []
    if not normalize_space(data.get("markdownEn")):
        data["markdownEn"] = _build_markdown_en_fallback(data)
    return data


def _validate_references(data: dict):
    zh = data.get("markdownZh", "")
    en = data.get("markdownEn", "")

    issues = validate_reference_policy(zh, en, min_refs=3, max_refs=5, recent_year_threshold=2021)
    urls = list(dict.fromkeys(extract_reference_urls(zh) + extract_reference_urls(en)))
    unreachable = [u for u in urls[:5] if not _url_reachable(u)]
    if unreachable:
        issues.append("Unreachable reference URLs: " + ", ".join(unreachable[:3]))
    if issues:
        raise ValueError("; ".join(issues))


def generate_post(headline: str, url: str, summary: str) -> dict:
    if not ZHIPU_API_KEY:
        raise RuntimeError("Missing ZHIPU_API_KEY")
    client = ZhipuAI(api_key=ZHIPU_API_KEY)

    prompt = USER_PROMPT.format(
        headline=headline,
        url=url,
        summary=summary[:600],
        focus=", ".join(FOCUS_KEYWORDS[:8]),
    )

    last_error = None
    for attempt in range(1, 4):
        resp = call_glm_with_backoff(
            client,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
        )

        text = resp.choices[0].message.content.strip()

        try:
            try:
                data = json.loads(text)
            except Exception:
                m = re.search(r"\{.*\}", text, re.DOTALL)
                if not m:
                    raise ValueError(f"Model did not return JSON: {text[:300]}")
                data = json.loads(m.group(0))

            required = ["title", "titleEn", "excerpt", "excerptEn", "category", "categoryEn", "tags", "focusKeyword", "longTailKeywords", "markdownZh"]
            for k in required:
                if k not in data:
                    raise ValueError(f"Missing required key: {k}")

            data = _repair_generated_payload(data)
            data["seoTitle"], data["seoDescription"] = shared_build_seo_fields(data)
            _validate_references(data)
            seo_issues = validate_article_payload(
                data,
                min_zh_chars=2200,
                min_en_words=0,
                require_keyword_fields=True,
                require_internal_links=True,
            )
            title_conflict = find_title_conflict(data.get("title", ""))
            if title_conflict:
                seo_issues.append(f"Duplicate title conflict with {title_conflict['slug']}")
            similar_article = find_similar_article(data.get("markdownZh", ""))
            if similar_article:
                seo_issues.append(
                    f"Article too similar to existing post {similar_article['slug']} ({similar_article['similarity']:.2f})"
                )
            if seo_issues:
                raise ValueError("SEO validation failed: " + "; ".join(seo_issues[:8]))
            return data
        except Exception as ex:
            last_error = ex
            print(f"[WARN] JSON parse/validation failed on attempt {attempt}: {ex}")
            time.sleep(2)

    raise RuntimeError(f"Failed to generate valid post JSON after retries: {last_error}")




IMAGE_PROMPTS = {
    "gallbladder": "黑白漫画风格医学科普封面，主题为胆囊健康、门诊沟通与日常健康管理，画面干净明亮、温和安心、适合个人医生网站文章封面",
    "liver": "黑白漫画风格医学科普封面，主题为肝胆健康与日常保养，画面干净明亮、专业可信，可出现健康饮食与生活方式场景",
    "longevity": "黑白漫画风格医学科普封面，主题为健康长寿与代谢管理，画面干净明亮、轻松自然，可出现步行、轻运动、规律生活",
    "nutrition": "黑白漫画风格医学科普封面，主题为胆囊切除术后饮食恢复与营养管理，画面干净明亮、安心专业，可出现均衡清淡饮食、家中恢复与散步场景",
    "default": "黑白漫画风格肝胆健康医学科普封面，画面干净明亮、专业可信，可出现医生沟通、健康饮食、恢复生活方式等安全场景",
}


def generate_siliconflow_image(topic_type: str, slug: str) -> str:
    fallback_map = {
        "gallbladder": "/images/gallstone-prevention.jpg",
        "liver": "/images/liver-health.jpg",
        "longevity": "/images/dietary-guidance.jpg",
        "nutrition": "/images/dietary-guidance.jpg",
        "default": "/images/recovery-guide.jpg",
    }
    return generate_cover_image(
        slug=slug,
        images_dir=IMAGES_DIR,
        fallback_path=fallback_map.get(topic_type, "/images/pocs-surgery.jpg"),
        base_prompt=IMAGE_PROMPTS.get(topic_type, IMAGE_PROMPTS["default"]),
        api_key=ARK_API_KEY,
    )





def save_markdown(slug: str, data: dict, image_url: str, source_url: str):
    today = datetime.now().strftime("%Y-%m-%d")

    zh_path = BLOG_MD_DIR / f"{slug}.md"
    zh_header = f"""---
title: {data['title']}
date: {today}
category: {data['category']}
image: {image_url}
source: {source_url}
---

"""
    zh_body = shared_ensure_book_link(data["markdownZh"])
    zh_path.write_text(zh_header + zh_body.strip() + "\n", encoding="utf-8")

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

def update_blog_index(slug: str, data: dict, image_url: str):
    """Insert new post entry into src/data/blog-posts.ts"""
    today = datetime.now().strftime("%Y-%m-%d")
    title_conflict = find_title_conflict(data.get("title", ""), ignore_slugs={slug})
    if title_conflict:
        raise ValueError(f"Duplicate title conflict with {title_conflict['slug']}")

    esc = lambda s: (s or "").replace("'", "\\'")
    title = esc(data.get("title", ""))
    title_en = esc(data.get("titleEn", ""))
    excerpt = esc(data.get("excerpt", ""))
    excerpt_en = esc(data.get("excerptEn", ""))
    category = esc(data.get("category", ""))
    category_en = esc(data.get("categoryEn", ""))

    built_seo_title, built_seo_desc = shared_build_seo_fields(data)
    seo_title = esc(built_seo_title)
    seo_desc = esc(built_seo_desc)

    new_entry = f"""  {{
    id: '{slug}',
    title: '{title}',
    titleEn: '{title_en}',
    excerpt: '{excerpt}',
    excerptEn: '{excerpt_en}',
    seoTitle: '{seo_title}',
    seoDescription: '{seo_desc}',
    date: '{today}',
    category: '{category}',
    categoryEn: '{category_en}',
    imageUrl: '{image_url}',
    author: 'AskDrLiu.com'
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


def update_sitemap():
    sitemap_path = REPO_ROOT / "public" / "sitemap.xml"
    ids = re.findall(r"id:\s*'([^']+)'", BLOG_INDEX_FILE.read_text(encoding="utf-8"))
    urls = ["https://www.askdrliu.com/", "https://www.askdrliu.com/blog"]
    urls.extend([f"https://www.askdrliu.com/blog/{slug}" for slug in ids])
    unique_urls = list(dict.fromkeys(urls))
    body = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in unique_urls:
        body.append("  <url>")
        body.append(f"    <loc>{url}</loc>")
        body.append("  </url>")
    body.append("</urlset>")
    sitemap_path.write_text("\n".join(body) + "\n", encoding="utf-8")
    print(f"[OK] Updated sitemap.xml with {len(unique_urls)} URLs")


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
    print("[GEN] Calling GLM API...")
    try:
        data = generate_post(topic["title"], topic["link"], topic["summary"])
    except Exception as ex:
        if is_rate_limit_error(ex):
            print(f"[WARN] Provider throttled, skip this manual run without failing: {ex}")
            return
        raise
    print(f"[OK] Generated: {data['title']} / {data['titleEn']}")

    # 5. AIGC 生成封面图
    slug = make_slug(data["title"])
    print("[IMG] Generating AIGC cover image via SiliconFlow...")
    image_url = generate_siliconflow_image(topic_type, slug)
    print(f"[OK] Image: {image_url}")

    # 6. Save markdown files
    save_markdown(slug, data, image_url, topic["link"])

    # 7. Update blog-posts.ts
    update_blog_index(slug, data, image_url)

    # 8. Update sitemap.xml
    update_sitemap()

    print(f"\n✅ Done! Slug: {slug}")
    print("   Next: commit & push → Vercel will auto-deploy.")


if __name__ == "__main__":
    main()
