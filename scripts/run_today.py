#!/usr/bin/env python3
"""Daily blog auto-generator: pick topic → generate → image → save → register → push."""
import os, sys, re, json, time, random, string
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))

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

SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "").strip()
ARK_API_KEY = os.getenv("ARK_API_KEY") or os.getenv("VOLCENGINE_API_KEY") or ""

# ── Today's Topic: Post-Cholecystectomy Nutrition ──
TOPIC = {
    "headline": "胆囊切除术后外卖怎么吃？术后营养与点餐避坑指南",
    "url": "https://www.niddk.nih.gov/health-information/digestive-diseases/gallstones/eating-diet-nutrition",
    "summary": "胆囊切除术后很多患者需要外卖就餐。本文基于可验证指南与研究，给出术后分阶段点餐原则、食物选择、腹泻腹胀应对与复诊信号。",
    "category": "胆囊术后",
    "categoryEn": "Post-Cholecystectomy",
}

SYSTEM_PROMPT = """You are a senior hepatobiliary surgeon writing bilingual medical education content for AskDrLiu.com.
Rules:
- Educational only — not diagnosis or personal medical advice.
- No hospital names, no product promotion, no fear-based language.
- Clear structure, short paragraphs, practical guidance.
- Output MUST be valid JSON only (no markdown fences, no commentary).
- References must be REAL, verifiable publications with actual URLs.

JSON structure:
{
  "title": "中文标题 (max 30 chars)",
  "titleEn": "English title (max 60 chars)",
  "excerpt": "中文摘要 (80-120 chars, no newlines)",
  "excerptEn": "English excerpt (100-160 chars, no newlines)",
  "focusKeyword": "Primary Chinese keyword phrase",
  "longTailKeywords": ["keyword1", "keyword2", "keyword3"],
  "category": "胆囊炎",
  "categoryEn": "Cholecystitis",
  "tags": ["tag1", "tag2", "tag3"],
  "markdownZh": "中文正文 markdown (2200-3200 Chinese chars)",
  "markdownEn": "English body markdown (900-1400 words)"
}

Chinese article requirements:
- Must start with ## 先说结论（30秒读完）
- SEO: title reflects concrete search intent; first paragraph includes main keyword
- 3-5 real references (prefer 2021+), each with title/journal/year/URL in ## 参考文献
- At least 2 internal links (/blog, /faq, /assessment, /contact)
- At least 4 FAQ-style subheadings (question format like '胆囊炎发作时能不能先吃止痛药？')
- Each FAQ: one-line conclusion + 2-4 bullets + one misconception
- Include ## 风险边界与就医信号 with emergency bullets
- End with one-line medical disclaimer
- Tone: professional, reassuring, practical
- 2200-3200 Chinese characters minimum

English article requirements:
- Same structure, natural English tone, 900-1400 words
- Start with Key Takeaway block
- At least 4 FAQ-style subheadings
- ## References with 3-5 real sources with URLs"""

USER_PROMPT = """Generate a bilingual blog post for this topic:

Headline: {headline}
Source: {url}
Summary: {summary}

Focus: post-cholecystectomy nutrition, staged diet progression, fat tolerance, diarrhea and bloating management, red flags for follow-up

IMPORTANT: All reference URLs must be real, accessible URLs from PubMed, NEJM, Lancet, JAMA, or similar. Do NOT fabricate DOIs or URLs.

Return valid JSON only."""


def call_api(messages, temperature=0.4, max_tokens=8192):
    url = "https://api.siliconflow.cn/v1/chat/completions"
    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": "Qwen/Qwen2.5-72B-Instruct", "messages": messages, "temperature": temperature, "max_tokens": max_tokens}
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
    urls = re.findall(r"https?://[^\s)\"]+", text)
    bad = []
    for u in urls[:10]:
        try:
            r = http_requests.head(u, timeout=10, allow_redirects=True)
            if r.status_code >= 400:
                bad.append(u)
        except Exception:
            bad.append(u)
    return bad


def main():
    print("=== Daily Blog Auto-Generator ===")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Topic: {TOPIC['headline']}\n")

    if not SILICONFLOW_API_KEY:
        print("[ERROR] SILICONFLOW_API_KEY not set")
        return False

    # ── 1. Generate content ──
    prompt = USER_PROMPT.format(**TOPIC)
    print("[GEN] Calling SiliconFlow API (Qwen2.5-72B)...")
    data = None
    for attempt in range(3):
        resp = call_api([
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ])
        text = resp.strip()
        try:
            m = re.search(r"\{.*\}", text, re.DOTALL)
            data = json.loads(m.group(0) if m else text)
            for k in ["title", "titleEn", "excerpt", "excerptEn", "markdownZh", "category"]:
                assert k in data, f"Missing {k}"
            break
        except Exception as ex:
            print(f"[WARN] Attempt {attempt+1} parse failed: {ex}")
            data = None
            time.sleep(3)

    if not data:
        print("[ERROR] Failed to generate valid content")
        return False

    print(f"[OK] Generated: {data['title']}")

    # Force category
    data["category"] = TOPIC["category"]
    data["categoryEn"] = TOPIC["categoryEn"]
    data["focusKeyword"] = data.get("focusKeyword") or "胆囊切除术后营养"
    if not data.get("longTailKeywords"):
        data["longTailKeywords"] = ["胆囊切除术后吃什么", "胆囊切除术后外卖", "胆囊切除术后腹泻饮食"]

    # ── 2. Duplicate checks ──
    conflict = find_title_conflict(data.get("title", ""))
    if conflict:
        print(f"[ERROR] Title conflict with: {conflict['slug']}")
        return False

    similar = find_similar_article(data.get("markdownZh", ""))
    if similar:
        print(f"[ERROR] Too similar to: {similar['slug']} ({similar['similarity']:.2f})")
        return False

    # ── 3. SEO fields ──
    data["seoTitle"], data["seoDescription"] = build_seo_fields(data)
    print(f"[SEO] seoTitle: {data['seoTitle']}")
    print(f"[SEO] seoDescription: {data['seoDescription'][:80]}...")

    # ── 4. Fact-check references ──
    print("[CHECK] Verifying reference URLs...")
    bad_urls = check_reference_urls(data.get("markdownZh", "") + "\n" + data.get("markdownEn", ""))
    if bad_urls:
        print(f"[WARN] Unreachable URLs ({len(bad_urls)}): {bad_urls[:3]}")
        # Remove bad refs? Just warn for now

    # ── 5. Validate with SEO rules ──
    issues = validate_article_payload(data)
    if issues:
        print(f"[WARN] Validation issues ({len(issues)}):")
        for issue in issues:
            print(f"  - {issue}")

    # ── 6. Slug ──
    slug = make_slug(data["title"])
    print(f"[SLUG] {slug}")

    # ── 7. Generate cover image ──
    print("[IMG] Generating cover image...")
    image_url = "/images/dietary-guidance.jpg"  # fallback
    try:
        image_url = generate_cover_image(
            slug=slug,
            images_dir=IMAGES_DIR,
            fallback_path="/images/dietary-guidance.jpg",
            base_prompt="医学科普封面，主题为胆囊切除术后营养管理，展示清淡均衡餐盘与温和就餐场景，画面明亮、干净、真实，无文字无水印",
            api_key=ARK_API_KEY,
        )
    except Exception as ex:
        print(f"[WARN] Image generation failed, using fallback: {ex}")
    print(f"[OK] Image: {image_url}")

    # ── 8. Save markdown files ──
    today = datetime.now().strftime("%Y-%m-%d")
    zh_body = ensure_book_link(data["markdownZh"])
    zh_path = BLOG_MD_DIR / f"{slug}.md"
    zh_path.write_text(f"---\ntitle: {data['title']}\ndate: {today}\ncategory: {data['category']}\nimage: {image_url}\n---\n\n{zh_body.strip()}\n", encoding="utf-8")

    en_body = data.get("markdownEn", "")
    en_path = BLOG_MD_DIR / f"{slug}-en.md"
    en_path.write_text(f"---\ntitle: {data['titleEn']}\ndate: {today}\ncategory: {data['categoryEn']}\nimage: {image_url}\n---\n\n{en_body.strip()}\n", encoding="utf-8")
    print(f"[OK] Saved: {zh_path.name}")

    # ── 9. Register in blog-posts.ts ──
    content = BLOG_INDEX_FILE.read_text(encoding="utf-8")
    marker = "export const blogPosts: BlogPost[] = ["
    if marker not in content:
        print("[ERROR] blogPosts marker not found in blog-posts.ts")
        return False

    title = json.dumps(data.get("title", "") or "", ensure_ascii=False)
    title_en = json.dumps(data.get("titleEn", "") or "", ensure_ascii=False)
    excerpt = json.dumps(data.get("excerpt", "") or "", ensure_ascii=False)
    excerpt_en = json.dumps(data.get("excerptEn", "") or "", ensure_ascii=False)
    seo_title = json.dumps(data.get("seoTitle", "") or "", ensure_ascii=False)
    seo_desc = json.dumps(data.get("seoDescription", "") or "", ensure_ascii=False)
    category = json.dumps(data.get("category", "") or "", ensure_ascii=False)
    category_en = json.dumps(data.get("categoryEn", "") or "", ensure_ascii=False)
    image_literal = json.dumps(image_url or "", ensure_ascii=False)
    slug_literal = json.dumps(slug, ensure_ascii=False)
    date_literal = json.dumps(today, ensure_ascii=False)
    new_entry = f"""  {{
    id: {slug_literal},
    title: {title},
    titleEn: {title_en},
    excerpt: {excerpt},
    excerptEn: {excerpt_en},
    seoTitle: {seo_title},
    seoDescription: {seo_desc},
    date: {date_literal},
    category: {category},
    categoryEn: {category_en},
    imageUrl: {image_literal},
    author: 'AskDrLiu.com'
  }},"""
    insert_pos = content.index(marker) + len(marker)
    BLOG_INDEX_FILE.write_text(content[:insert_pos] + "\n" + new_entry + content[insert_pos:], encoding="utf-8")
    print("[OK] Registered in blog-posts.ts")

    # ── 10. Update sitemap ──
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

    # ── 11. Count references ──
    ref_count = len(re.findall(r"^\s*[-*]\s+.*https?://", data.get("markdownZh", ""), re.MULTILINE))

    # ── 12. Save summary ──
    summary = {
        "slug": slug,
        "title": data["title"],
        "image_url": image_url,
        "ref_count": ref_count,
        "category": data["category"],
        "bad_urls": bad_urls,
        "validation_issues": issues,
    }
    summary_file = Path(__file__).parent / "today_summary.txt"
    summary_file.write_text(
        f"Title: {data['title']}\n"
        f"Slug: {slug}\n"
        f"Image: {image_url}\n"
        f"References: {ref_count}\n"
        f"Category: {data['category']}\n"
        f"Date: {today}\n"
        f"BadURLs: {bad_urls}\n"
        f"Issues: {issues}\n",
        encoding="utf-8"
    )

    print(f"\n{'='*50}")
    print(f"✅ DRAFT CREATED SUCCESSFULLY")
    print(f"   Title: {data['title']}")
    print(f"   Slug: {slug}")
    print(f"   Image: {image_url}")
    print(f"   References: {ref_count}")
    print(f"   Bad URLs: {len(bad_urls)}")
    print(f"   Validation issues: {len(issues)}")

    return summary


if __name__ == "__main__":
    result = main()
    if not result:
        print("\n❌ FAILED")
        sys.exit(1)
