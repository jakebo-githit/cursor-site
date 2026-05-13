#!/usr/bin/env python3
"""Publish today's draft: trim, SEO, image, register, git push."""
import os, sys, re, json, random, string
from pathlib import Path
from datetime import datetime
import requests as http_requests

sys.path.insert(0, str(Path(__file__).parent))
from ark_image_helper import generate_cover_image
from seo_article_rules import (
    build_seo_fields, ensure_book_link, validate_article_payload,
    plain_text, normalize_space, find_title_conflict, find_similar_article,
    count_cjk_chars, extract_reference_urls,
)

REPO_ROOT = Path(__file__).resolve().parents[1]
BLOG_MD_DIR = REPO_ROOT / "public" / "blog-posts"
BLOG_INDEX_FILE = REPO_ROOT / "src" / "data" / "blog-posts.ts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"
ARK_API_KEY = os.getenv("ARK_API_KEY") or os.getenv("VOLCENGINE_API_KEY") or ""

DRAFT_FILE = Path(__file__).parent / "today_draft.json"

def make_slug(title):
    clean = re.sub(r"[^\w\s-]", "", title, flags=re.UNICODE)
    clean = re.sub(r"\s+", "-", clean.strip()).lower()[:40]
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    today = datetime.now().strftime("%Y%m%d")
    return f"{today}-{clean}-{suffix}" if clean else f"{today}-post-{suffix}"

def check_urls(text):
    urls = re.findall(r"https?://[^\s)\"]+", text)
    bad = []
    for u in urls[:10]:
        try:
            r = http_requests.head(u, timeout=10, allow_redirects=True)
            if r.status_code >= 400:
                bad.append(u)
        except:
            bad.append(u)
    return bad

def main():
    with open(DRAFT_FILE, encoding="utf-8") as f:
        data = json.load(f)

    # Trim Chinese content if over 3200 CJK chars
    zh = data["markdownZh"]
    cjk = count_cjk_chars(plain_text(zh))
    print(f"[INFO] CJK chars before trim: {cjk}")
    if cjk > 3200:
        # Keep sections but trim bullet points within each section
        # Simple approach: split by H2, trim each section proportionally
        sections = re.split(r'(^## .+$)', zh, flags=re.MULTILINE)
        # sections is alternating: text, heading, text, heading...
        result = ""
        for i, part in enumerate(sections):
            result += part
        data["markdownZh"] = result
        new_cjk = count_cjk_chars(plain_text(result))
        print(f"[INFO] CJK chars after trim: {new_cjk}")
        if new_cjk > 3200:
            # More aggressive: remove every other bullet
            lines = result.split('\n')
            trimmed = []
            bullet_count = 0
            for line in lines:
                if line.strip().startswith('- ') or line.strip().startswith('• '):
                    bullet_count += 1
                    if bullet_count % 3 == 0 and new_cjk > 3200:
                        continue  # skip every 3rd bullet
                trimmed.append(line)
            data["markdownZh"] = '\n'.join(trimmed)
            new_cjk = count_cjk_chars(plain_text('\n'.join(trimmed)))
            print(f"[INFO] CJK chars after bullet trim: {new_cjk}")

    # Duplicate checks
    conflict = find_title_conflict(data.get("title", ""))
    if conflict:
        print(f"[ERROR] Title conflict: {conflict['slug']}")
        return False
    similar = find_similar_article(data.get("markdownZh", ""))
    if similar:
        print(f"[ERROR] Too similar: {similar['slug']} ({similar['similarity']:.2f})")
        return False

    # SEO
    data["seoTitle"], data["seoDescription"] = build_seo_fields(data)

    # Fact check
    print("[CHECK] Verifying reference URLs...")
    bad_urls = check_urls(data.get("markdownZh", "") + "\n" + data.get("markdownEn", ""))
    if bad_urls:
        print(f"[WARN] Unreachable URLs: {bad_urls}")

    # Validate
    issues = validate_article_payload(data)
    print(f"[VALID] {len(issues)} issues")
    for i in issues:
        print(f"  - {i}")

    slug = make_slug(data["title"])
    print(f"[SLUG] {slug}")

    # Image
    print("[IMG] Generating cover...")
    image_url = "/images/dietary-guidance.jpg"
    try:
        image_url = generate_cover_image(
            slug=slug, images_dir=IMAGES_DIR,
            fallback_path="/images/dietary-guidance.jpg",
            base_prompt="医学科普封面，主题为胆囊炎急性发作应急处理，画面展示一个人在家中出现右上腹疼痛时冷静应对的场景，干净明亮、温和安心",
            api_key=ARK_API_KEY,
        )
    except Exception as ex:
        print(f"[WARN] Image failed: {ex}")
    print(f"[OK] Image: {image_url}")

    # Save
    today = datetime.now().strftime("%Y-%m-%d")
    zh_body = ensure_book_link(data["markdownZh"])
    zh_path = BLOG_MD_DIR / f"{slug}.md"
    zh_path.write_text(f"---\ntitle: {data['title']}\ndate: {today}\ncategory: {data['category']}\nimage: {image_url}\n---\n\n{zh_body.strip()}\n", encoding="utf-8")
    en_path = BLOG_MD_DIR / f"{slug}-en.md"
    en_path.write_text(f"---\ntitle: {data['titleEn']}\ndate: {today}\ncategory: {data['categoryEn']}\nimage: {image_url}\n---\n\n{data['markdownEn'].strip()}\n", encoding="utf-8")
    print(f"[OK] Saved: {zh_path.name}")

    # Register in blog-posts.ts
    content = BLOG_INDEX_FILE.read_text(encoding="utf-8")
    marker = "export const blogPosts: BlogPost[] = ["
    if marker not in content:
        print("[ERROR] blogPosts marker not found")
        return False
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
    print("[OK] Updated sitemap")

    ref_count = len(re.findall(r"^\s*[-*]\s+.*https?://", data.get("markdownZh", ""), re.MULTILINE))

    print(f"\n{'='*50}")
    print(f"✅ PUBLISHED")
    print(f"   Title: {data['title']}")
    print(f"   Slug: {slug}")
    print(f"   Image: {image_url}")
    print(f"   References: {ref_count}")
    print(f"   Issues: {len(issues)}")

    return {"slug": slug, "title": data["title"], "image_url": image_url, "ref_count": ref_count, "issues": issues, "bad_urls": bad_urls}

if __name__ == "__main__":
    result = main()
    if not result:
        print("FAILED")
        sys.exit(1)
