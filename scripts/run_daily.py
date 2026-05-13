#!/usr/bin/env python3
"""Robust daily blog generator with length enforcement and retry."""
import os, sys, re, json, time, random, string
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))
import requests as http_requests
from ark_image_helper import generate_cover_image
from seo_article_rules import (
    build_seo_fields, ensure_book_link, validate_article_payload,
    plain_text, normalize_space, find_title_conflict, find_similar_article,
    count_cjk_chars, count_words,
)

REPO_ROOT = Path(__file__).resolve().parents[1]
BLOG_MD_DIR = REPO_ROOT / "public" / "blog-posts"
BLOG_INDEX_FILE = REPO_ROOT / "src" / "data" / "blog-posts.ts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"

SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "").strip()
ARK_API_KEY = os.getenv("ARK_API_KEY") or os.getenv("VOLCENGINE_API_KEY") or ""

SYSTEM_PROMPT = """You are a senior hepatobiliary surgeon writing bilingual medical education content for AskDrLiu.com.

ABSOLUTE RULES:
- Educational only — not diagnosis or personal medical advice.
- No hospital names, no product promotion, no fear-based language.
- Clear structure, short paragraphs, practical guidance.
- Output MUST be valid JSON only. No markdown fences, no commentary before or after.
- All references must be REAL, verifiable publications with working URLs.

OUTPUT this exact JSON structure (fill in all fields):
{
  "title": "中文标题 (20-30 chars, MUST contain 胆囊炎急性发作)",
  "titleEn": "English title (40-60 chars)",
  "excerpt": "中文摘要 (80-120 Chinese chars, no newlines)",
  "excerptEn": "English excerpt (120-160 chars, no newlines)",
  "focusKeyword": "胆囊炎急性发作",
  "longTailKeywords": ["胆囊炎急性发作怎么办", "胆囊炎发作应急处理", "胆囊炎什么时候必须就医", "急性胆囊炎能自愈吗"],
  "category": "胆囊炎",
  "categoryEn": "Cholecystitis",
  "tags": ["急性胆囊炎", "胆囊炎发作", "应急处理", "就医指南"],
  "markdownZh": "FULL Chinese article in markdown (MUST be 2200-3200 Chinese characters)",
  "markdownEn": "FULL English article in markdown (MUST be 900-1400 words)"
}

CHINESE ARTICLE (markdownZh) — ABSOLUTE REQUIREMENTS:
- Minimum 2200 Chinese characters. Count them. If under 2200, keep writing.
- Start with ## 先说结论（30秒读完） — 3-5 key takeaway bullets
- Then at least these sections (use question-style H2 headings):
  ## 胆囊炎急性发作时有什么典型症状？
  ## 胆囊炎发作时能不能先吃止痛药？
  ## 急性胆囊炎能自愈吗？不治疗会怎样？
  ## 胆囊炎急性发作在家怎么应急处理？
  ## 胆囊炎发作后，保胆还是切胆？
  ## 风险边界与就医信号
  ## 参考文献
- Each section: conclusion line → 3-5 detailed bullets → one common misconception
- Include at least 2 internal links: [了解更多胆囊知识](/blog)  [在线自测评估](/assessment)
- 3-5 real references in ## 参考文献, each with: title, journal, year, URL
- End with: *免责声明：本文仅供健康科普参考，不构成个人诊疗建议。如有不适请及时就医。*

ENGLISH ARTICLE (markdownEn) — REQUIREMENTS:
- Minimum 900 words.
- Same structure with English headings.
- Start with ### Key Takeaways block
- ## References section with 3-5 real sources
"""

USER_PROMPT = """Generate a bilingual blog post about:

TOPIC: 胆囊炎急性发作时该怎么办？应急处理与就医时机
CLINICAL CONTEXT: Acute cholecystitis is a common surgical emergency. Patients experience sudden severe right upper quadrant pain and often panic. This article should help them recognize symptoms, take appropriate first-aid measures at home, know when they MUST go to the ER, and understand treatment options (gallbladder preservation vs removal).

REFERENCE SOURCE: https://pubmed.ncbi.nlm.nih.gov/36623428/

REQUIREMENTS REMINDER:
- Chinese text: AT LEAST 2200 Chinese characters (汉字). Write SUBSTANTIAL content.
- English text: AT LEAST 900 English words.
- title MUST contain "胆囊炎急性发作"
- excerpt MUST be 80-120 Chinese characters
- All reference URLs must be real and accessible
- Include internal links to /blog and /assessment

Return ONLY the JSON object. No other text."""


def call_api(messages, temperature=0.4, max_tokens=8192):
    url = "https://api.siliconflow.cn/v1/chat/completions"
    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": "Qwen/Qwen2.5-72B-Instruct", "messages": messages, "temperature": temperature, "max_tokens": max_tokens}
    for attempt in range(3):
        try:
            r = http_requests.post(url, headers=headers, json=payload, timeout=180)
            if r.status_code == 429:
                time.sleep(min(90, 8 * (attempt + 1)))
                continue
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
        except Exception as ex:
            print(f"[WARN] API attempt {attempt+1} failed: {ex}")
            time.sleep(5 * (attempt + 1))
    raise RuntimeError("API calls failed after retries")


def parse_json_response(resp_text):
    text = resp_text.strip()
    # Remove markdown fences if present
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
    m = re.search(r"\{[\s\S]*\}", text)
    if m:
        return json.loads(m.group(0))
    return json.loads(text)


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
    print("=== Daily Blog Auto-Generator (Robust) ===")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Topic: 胆囊炎急性发作应急处理与就医时机\n")

    if not SILICONFLOW_API_KEY:
        return {"status": "FAILED", "error": "SILICONFLOW_API_KEY not set"}

    # Generate with retry for length
    data = None
    for attempt in range(3):
        print(f"[GEN] Attempt {attempt+1}: Calling SiliconFlow API...")
        try:
            resp = call_api([
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": USER_PROMPT + (f"\n\nThis is attempt {attempt+1}. Previous output was too SHORT." if attempt > 0 else "")},
            ])
            data = parse_json_response(resp)
            cjk = count_cjk_chars(plain_text(data.get("markdownZh", "")))
            en_words = count_words(plain_text(data.get("markdownEn", "")))
            print(f"[CHECK] CJK chars: {cjk}, EN words: {en_words}")
            if cjk >= 2000 and en_words >= 700:
                break
            print(f"[WARN] Content still short, retrying...")
        except Exception as ex:
            print(f"[WARN] Attempt {attempt+1} failed: {ex}")
            time.sleep(5)

    if not data:
        return {"status": "FAILED", "error": "Failed to generate valid content after 3 attempts"}

    # Force critical fields
    data["focusKeyword"] = "胆囊炎急性发作"
    data["category"] = "胆囊炎"
    data["categoryEn"] = "Cholecystitis"
    if "胆囊炎急性发作" not in data.get("title", ""):
        data["title"] = "胆囊炎急性发作时该怎么办？应急处理与就医指南"
    if not data.get("longTailKeywords") or len(data["longTailKeywords"]) < 3:
        data["longTailKeywords"] = ["胆囊炎急性发作怎么办", "胆囊炎发作应急处理", "胆囊炎什么时候必须就医", "急性胆囊炎能自愈吗"]
    if len(data.get("excerpt", "")) < 80:
        data["excerpt"] = "胆囊炎急性发作时剧烈腹痛让人恐慌，本文详解急性胆囊炎的症状识别、家庭应急处理、何时必须急诊就医及后续治疗选择。"
    if len(data.get("excerptEn", "")) < 100:
        data["excerptEn"] = "Acute cholecystitis causes severe right upper quadrant pain. Learn symptom recognition, home emergency measures, when to go to ER, and treatment options."

    # Duplicate check
    conflict = find_title_conflict(data.get("title", ""))
    if conflict:
        return {"status": "FAILED", "error": f"Title conflict: {conflict['slug']}"}
    similar = find_similar_article(data.get("markdownZh", ""))
    if similar:
        return {"status": "FAILED", "error": f"Too similar to: {similar['slug']} ({similar['similarity']:.2f})"}

    # SEO
    data["seoTitle"], data["seoDescription"] = build_seo_fields(data)

    # Fact check references
    print("[CHECK] Verifying reference URLs...")
    bad_urls = check_reference_urls(data.get("markdownZh", "") + "\n" + data.get("markdownEn", ""))

    # Validate
    issues = validate_article_payload(data)
    print(f"[VALID] Issues: {len(issues)}")
    for i in issues:
        print(f"  - {i}")

    slug = make_slug(data["title"])
    print(f"[SLUG] {slug}")

    # Cover image
    print("[IMG] Generating cover image...")
    image_url = "/images/dietary-guidance.jpg"
    try:
        image_url = generate_cover_image(
            slug=slug,
            images_dir=IMAGES_DIR,
            fallback_path="/images/dietary-guidance.jpg",
            base_prompt="医学科普封面，主题为胆囊炎急性发作应急处理，画面展示一个人在家中出现右上腹疼痛时冷静应对的场景，干净明亮、温和安心",
            api_key=ARK_API_KEY,
        )
    except Exception as ex:
        print(f"[WARN] Image generation failed: {ex}")
    print(f"[OK] Image: {image_url}")

    # Save
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
        return {"status": "FAILED", "error": "blogPosts marker not found"}
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
    print("[OK] Registered in blog-posts.ts")

    # Sitemap
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

    ref_count = len(re.findall(r"^\s*[-*]\s+.*https?://", data.get("markdownZh", ""), re.MULTILINE))

    print(f"\n{'='*50}")
    print(f"✅ DRAFT CREATED")
    print(f"   Title: {data['title']}")
    print(f"   Slug: {slug}")
    print(f"   Image: {image_url}")
    print(f"   References: {ref_count}")
    print(f"   Bad URLs: {len(bad_urls)}")
    print(f"   Issues: {len(issues)}")

    return {"slug": slug, "title": data["title"], "image_url": image_url, "ref_count": ref_count, "bad_urls": bad_urls, "issues": issues}


if __name__ == "__main__":
    result = main()
    if not result or isinstance(result, dict) and result.get("status") == "FAILED":
        print(f"\n❌ FAILED: {result}")
        sys.exit(1)
