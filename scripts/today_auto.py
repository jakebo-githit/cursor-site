#!/usr/bin/env python3
"""One-shot daily blog generator: pick topic → generate → image → save → register → push."""
import os, sys, re, json, time, random, string, threading
from pathlib import Path
from datetime import datetime

# Add scripts dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Use Moonshot (Kimi) as LLM provider via OpenAI-compatible API
import requests as http_requests
from ark_image_helper import generate_cover_image
from seo_article_rules import (
    build_seo_fields, ensure_book_link, validate_article_payload,
    plain_text, normalize_space, find_title_conflict, find_similar_article
)

REPO_ROOT = Path(__file__).resolve().parents[1]
BLOG_MD_DIR = REPO_ROOT / "public" / "blog-posts"
BLOG_INDEX_FILE = REPO_ROOT / "src" / "data" / "blog-posts.ts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"

ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY", "").strip()
MOONSHOT_API_KEY = os.getenv("MOONSHOT_API_KEY", "").strip()
ARK_API_KEY = os.getenv("ARK_API_KEY", "") or os.getenv("VOLCENGINE_API_KEY", "") or os.getenv("SILICONFLOW_API_KEY", "").strip()

TOPIC = {
    "headline": "胆囊切除术后能喝牛奶吗？乳糖不耐受、脂肪消化与术后营养补充的科学解答",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11200314/",
    "summary": "胆囊切除术后患者常有乳制品摄入疑问，涉及脂肪消化能力变化、乳糖不耐受风险、钙质补充需求等。本文从循证医学角度解答术后牛奶摄入的安全性、适宜量及替代方案。",
    "category": "胆囊切除术后营养",
    "categoryEn": "Post-Cholecystectomy Nutrition",
    "topic_type": "nutrition",
}

SYSTEM_PROMPT = """You are a senior hepatobiliary surgeon writing bilingual medical education content for AskDrLiu.com.
Rules:
- Educational only — not diagnosis or personal medical advice.
- No hospital names, no product promotion, no fear-based language.
- Clear structure, short paragraphs, practical guidance.
- Output MUST be valid JSON only (no markdown fences).
- References must be REAL, verifiable publications.

JSON structure:
{
  "title": "中文标题 (max 30 chars)",
  "titleEn": "English title (max 60 chars)",
  "excerpt": "中文摘要 (80-120 chars, no newlines)",
  "excerptEn": "English excerpt (100-160 chars, no newlines)",
  "focusKeyword": "Primary Chinese keyword phrase",
  "longTailKeywords": ["keyword1", "keyword2", "keyword3"],
  "category": "胆囊切除术后营养",
  "categoryEn": "Post-Cholecystectomy Nutrition",
  "tags": ["tag1", "tag2", "tag3"],
  "markdownZh": "中文正文 markdown (2200-3200 Chinese chars)",
  "markdownEn": "English body markdown (900-1400 words)"
}

Chinese article requirements:
- Must start with ## 先说结论（30秒读完）
- SEO: title reflects concrete search intent; first paragraph includes main keyword
- 3-5 real references (prefer 2021+), each with title/journal/year/URL in ## 参考文献
- At least 2 internal links (/blog, /faq, /assessment, /contact)
- At least 4 FAQ-style subheadings (question format)
- Each FAQ: one-line conclusion + 2-4 bullets + one misconception
- Include ## 风险边界与就医信号 with emergency bullets
- End with one-line medical disclaimer
- Tone: "能保尽保，前提是安全可保；不具备条件时，规范切除 + 术后营养管理"
- 2200-3200 Chinese characters minimum

English article requirements:
- Same structure, natural English tone, 900-1400 words
- Start with Key Takeaway block
- At least 4 FAQ-style subheadings
- ## References with 3-5 real sources"""

USER_PROMPT = """Generate a bilingual blog post for this topic:

Headline: {headline}
Source: {url}
Summary: {summary}

Focus: gallbladder, cholecystectomy, postoperative nutrition, milk, dairy, lactose, fat digestion, calcium

Return valid JSON only."""


def call_openai_compatible(base_url, api_key, model, messages, temperature=0.4, max_tokens=8192):
    """Call OpenAI-compatible API (Moonshot/Kimi) with retry."""
    url = f"{base_url}/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {"model": model, "messages": messages, "temperature": temperature, "max_tokens": max_tokens}
    for attempt in range(3):
        try:
            r = http_requests.post(url, headers=headers, json=payload, timeout=120)
            if r.status_code == 429:
                time.sleep(min(90, 8 * (attempt + 1)))
                continue
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
        except Exception as ex:
            print(f"[WARN] API attempt {attempt+1} failed: {ex}")
            time.sleep(5 * (attempt + 1))
    raise RuntimeError("API calls failed after retries")


def make_slug(title):
    clean = re.sub(r"[^\w\s-]", "", title, flags=re.UNICODE)
    clean = re.sub(r"\s+", "-", clean.strip()).lower()[:40]
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    today = datetime.now().strftime("%Y%m%d")
    return f"{today}-{clean}-{suffix}" if clean else f"{today}-post-{suffix}"


def check_reference_urls(text):
    import requests
    urls = re.findall(r"https?://[^\s)]+", text)
    bad = []
    for u in urls[:8]:
        try:
            r = requests.head(u, timeout=10, allow_redirects=True)
            if r.status_code >= 400: bad.append(u)
        except: bad.append(u)
    return bad


def main():
    print("=== Daily Blog Auto-Generator (Direct Topic) ===")
    
    SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "").strip()
    if not SILICONFLOW_API_KEY:
        print("[ERROR] SILICONFLOW_API_KEY not set"); return False

    prompt = USER_PROMPT.format(**TOPIC)

    # Generate content via SiliconFlow (OpenAI-compatible)
    print("[GEN] Calling SiliconFlow API (Qwen2.5-72B)...")
    data = None
    for attempt in range(3):
        resp = call_openai_compatible(
            base_url="https://api.siliconflow.cn/v1",
            api_key=SILICONFLOW_API_KEY,
            model="Qwen/Qwen2.5-72B-Instruct",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_tokens=8192,
        )
        text = resp.strip()
        try:
            m = re.search(r"\{.*\}", text, re.DOTALL)
            data = json.loads(m.group(0) if m else text)
            # Validate required keys
            for k in ["title", "titleEn", "excerpt", "excerptEn", "markdownZh", "category", "categoryEn"]:
                assert k in data, f"Missing {k}"
            break
        except Exception as ex:
            print(f"[WARN] Attempt {attempt+1} parse failed: {ex}")
            data = None
            time.sleep(3)

    if not data:
        print("[ERROR] Failed to generate valid content"); return False

    print(f"[OK] Generated: {data['title']}")

    # Force category
    data["category"] = TOPIC["category"]
    data["categoryEn"] = TOPIC["categoryEn"]
    data["focusKeyword"] = data.get("focusKeyword") or "胆囊切除术后喝牛奶"
    if not data.get("longTailKeywords"):
        data["longTailKeywords"] = ["胆囊切除术后喝牛奶", "胆囊术后乳制品", "胆囊术后钙质补充"]

    # Title conflict check
    conflict = find_title_conflict(data.get("title", ""))
    if conflict:
        print(f"[ERROR] Title conflict: {conflict['slug']}"); return False

    # Similarity check
    similar = find_similar_article(data.get("markdownZh", ""))
    if similar:
        print(f"[ERROR] Too similar to: {similar['slug']} ({similar['similarity']:.2f})"); return False

    # SEO fields
    data["seoTitle"], data["seoDescription"] = build_seo_fields(data)

    # Check reference URLs
    print("[CHECK] Verifying reference URLs...")
    bad_urls = check_reference_urls(data.get("markdownZh", ""))
    if bad_urls:
        print(f"[WARN] Unreachable URLs ({len(bad_urls)}): {bad_urls[:3]}")
        # Don't fail, just warn

    # Generate slug
    slug = make_slug(data["title"])
    print(f"[SLUG] {slug}")

    # Generate cover image
    print("[IMG] Generating cover image...")
    image_url = "/images/dietary-guidance.jpg"  # fallback
    try:
        image_url = generate_cover_image(
            slug=slug,
            images_dir=IMAGES_DIR,
            fallback_path="/images/dietary-guidance.jpg",
            base_prompt="彩色医学营养封面，主题为胆囊切除术后饮食与牛奶乳制品摄入，可出现早餐餐桌、牛奶替代选择、清淡饮食与居家恢复场景",
            api_key=ARK_API_KEY,
        )
    except Exception as ex:
        print(f"[WARN] Image generation failed, using fallback: {ex}")
    print(f"[OK] Image: {image_url}")

    # Save markdown
    today = datetime.now().strftime("%Y-%m-%d")
    zh_body = ensure_book_link(data["markdownZh"])
    zh_path = BLOG_MD_DIR / f"{slug}.md"
    zh_path.write_text(f"---\ntitle: {data['title']}\ndate: {today}\ncategory: {data['category']}\nimage: {image_url}\n---\n\n{zh_body.strip()}\n", encoding="utf-8")

    en_body = data.get("markdownEn", "")
    en_path = BLOG_MD_DIR / f"{slug}-en.md"
    en_path.write_text(f"---\ntitle: {data['titleEn']}\ndate: {today}\ncategory: {data['categoryEn']}\nimage: {image_url}\n---\n\n{en_body.strip()}\n", encoding="utf-8")
    print(f"[OK] Saved: {zh_path.name}")

    # Register in blog-posts.ts
    content = BLOG_INDEX_FILE.read_text(encoding="utf-8")
    marker = "export const blogPosts: BlogPost[] = ["
    if marker not in content:
        print("[ERROR] blogPosts marker not found"); return False

    esc = lambda s: (s or "").replace("'", "\\'")
    new_entry = f"""  {{
    id: '{slug}',
    title: '{esc(data['title'])}',
    titleEn: '{esc(data['titleEn'])}',
    excerpt: '{esc(data['excerpt'])}',
    excerptEn: '{esc(data.get('excerptEn', ''))}',
    seoTitle: '{esc(data['seoTitle'])}',
    seoDescription: '{esc(data['seoDescription'])}',
    date: '{today}',
    category: '{esc(data['category'])}',
    categoryEn: '{esc(data['categoryEn'])}',
    imageUrl: '{image_url}',
    author: 'AskDrLiu.com'
  }},"""
    insert_pos = content.index(marker) + len(marker)
    BLOG_INDEX_FILE.write_text(content[:insert_pos] + "\n" + new_entry + content[insert_pos:], encoding="utf-8")
    print(f"[OK] Registered in blog-posts.ts")

    # Update sitemap
    sitemap_path = REPO_ROOT / "public" / "sitemap.xml"
    ids = re.findall(r"id:\s*'([^']+)'", BLOG_INDEX_FILE.read_text(encoding="utf-8"))
    urls = ["https://www.askdrliu.com/", "https://www.askdrliu.com/blog"]
    urls.extend([f"https://www.askdrliu.com/blog/{s}" for s in ids])
    body = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in list(dict.fromkeys(urls)):
        body.append(f"  <url><loc>{u}</loc></url>")
    body.append("</urlset>")
    sitemap_path.write_text("\n".join(body) + "\n", encoding="utf-8")
    print("[OK] Updated sitemap.xml")

    # Count references
    ref_count = len(re.findall(r"^\s*[-*]\s+.*https?://", data.get("markdownZh", ""), re.MULTILINE))

    print(f"\n✅ SUCCESS")
    print(f"   Title: {data['title']}")
    print(f"   Slug: {slug}")
    print(f"   Image: {image_url}")
    print(f"   References: {ref_count}")
    
    return {"slug": slug, "title": data["title"], "image_url": image_url, "ref_count": ref_count}


if __name__ == "__main__":
    result = main()
    if not result:
        print("\n❌ FAILED")
        sys.exit(1)
