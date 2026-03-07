#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AskDrLiu Blog Daily Auto-Generator (No RSS dependency)
-------------------------------------------------------
- Generates bilingual blog post via GLM-4-Plus API
- Topics restricted to: 保胆, 胆囊炎, 胆囊结石, 胆囊切除术后营养
- AIGC cover image via SiliconFlow (FLUX)
- Validates references are real and reachable
- Saves markdown and updates blog-posts.ts
- Auto commits and pushes to trigger Vercel deploy
"""

import os
import re
import json
import time
import random
import string
import requests
from datetime import datetime
from pathlib import Path
from zhipuai import ZhipuAI

# ─────────────────────────── Config ───────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[1]
BLOG_MD_DIR = REPO_ROOT / "public" / "blog-posts"
BLOG_INDEX_FILE = REPO_ROOT / "src" / "data" / "blog-posts.ts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"
QUEUE_FILE = REPO_ROOT / "scripts" / "queue.json"

BLOG_MD_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY", "").strip()
SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "").strip()

MODEL = "glm-4-plus"
SILICONFLOW_IMAGE_MODELS = [
    "Doubao-Seedream-5.0-lite",
    "Doubao-Seedream-4.5",
    "black-forest-labs/FLUX.1-dev",
    "black-forest-labs/FLUX.1-schnell",
]
SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1/images/generations"

# Allowed topics (from requirements)
ALLOWED_CATEGORIES_ZH = ["保胆", "胆囊炎", "胆囊结石", "胆囊切除术后营养"]
ALLOWED_CATEGORIES_EN = ["Gallbladder Preservation", "Cholecystitis", "Gallstones", "Post-Cholecystectomy Nutrition"]

CATEGORY_MAP = {
    "保胆": "Gallbladder Preservation",
    "胆囊炎": "Cholecystitis",
    "胆囊结石": "Gallstones",
    "胆囊切除术后营养": "Post-Cholecystectomy Nutrition",
}

# Subtopics for each category (for content variety)
SUBTOPICS = {
    "保胆": [
        "POCS微创保胆技术的优势与适应症",
        "保胆取石后如何预防结石复发",
        "哪些患者适合保胆取石手术",
        "保胆vs切胆：如何做选择",
        "保胆手术后的复查与长期管理",
    ],
    "胆囊炎": [
        "急性胆囊炎的早期识别与紧急处理",
        "慢性胆囊炎的日常管理与饮食调整",
        "胆囊炎发作的诱因与预防策略",
        "抗生素治疗胆囊炎的合理使用",
        "胆囊炎并发症的识别与预防",
    ],
    "胆囊结石": [
        "胆囊结石的成因与高危因素",
        "无症状胆囊结石是否需要手术",
        "胆囊结石的非手术治疗方法",
        "如何通过饮食预防胆囊结石形成",
        "胆囊结石与胰腺炎的关系",
    ],
    "胆囊切除术后营养": [
        "术后初期饮食调整与注意事项",
        "术后长期营养补充与饮食规划",
        "如何应对术后腹泻与消化不良",
        "术后体重管理的营养策略",
        "胆囊切除后的脂肪消化问题",
    ],
}

# ─────────────────────────── System Prompts ───────────────────────────
SYSTEM_PROMPT = """You are a senior hepatobiliary surgeon (Dr. Liu Bo) writing bilingual medical education content for patients and the general public.

Core Principles:
- Educational only — not personal medical advice or diagnosis
- Evidence-based, no absolute treatment claims
- Clear, patient-friendly language
- Practical takeaways and actionable advice
- Include "When to see a doctor" section
- One-line disclaimer at the end

Output MUST be valid JSON only (no markdown fences).

JSON Structure:
{
  "title": "Chinese title (max 30 chars, concise and engaging)",
  "titleEn": "English title (max 60 chars)",
  "excerpt": "Chinese excerpt (80-120 chars, no newlines, highlights key point)",
  "excerptEn": "English excerpt (100-160 chars, no newlines)",
  "category": "Chinese category (must be one of: 保胆 | 胆囊炎 | 胆囊结石 | 胆囊切除术后营养)",
  "categoryEn": "English category (must match category mapping)",
  "tags": ["tag1", "tag2", "tag3"],
  "seoTitle": "SEO-optimized Chinese title (40-60 chars)",
  "seoDescription": "SEO description (120-160 chars, includes main keywords)",
  "markdownZh": "Chinese article body (1200-1800 chars, include ## 参考文献 section with 3-6 real sources with URLs)",
  "markdownEn": "English article body (800-1200 words, include ## References section with 3-6 real sources with URLs)"
}"""

USER_PROMPT_TEMPLATE = """Generate a bilingual medical blog post on this topic:

Category: {category}
Subtopic: {subtopic}

Chinese Article Requirements (1200-1800 characters):
- Engaging hook (1-2 lines that grab attention)
- Clear explanation of the medical condition or topic
- 3-5 practical takeaways (bullet points with explanations)
- "何时需要就医" (When to see a doctor) section with 3-5 specific situations
- ## 参考文献 section with 3-6 real medical sources (PubMed, reputable journals, guidelines) with URLs
- One-line disclaimer: 本内容仅供科普参考，不替代专业医疗建议

English Article Requirements (800-1200 words):
- Same structure but natural English tone
- Practical takeaways (3-5 bullet points)
- "When to see a doctor" section (3-5 situations)
- ## References section with 3-6 real sources with URLs
- One-line disclaimer: This content is for educational purposes only and does not replace professional medical advice

IMPORTANT:
- All reference URLs MUST be real and accessible (PubMed, clinical guidelines, reputable medical sites)
- Do NOT fabricate studies or make up URLs
- If uncertain about a reference, use general authoritative sources like PubMed, UpToDate, or medical society guidelines
- Keep citations realistic and relevant to the topic

Return valid JSON only."""

# ─────────────────────────── Helper Functions ───────────────────────────
def extract_urls(text: str) -> list[str]:
    return re.findall(r"https?://[^\s)\]\"]+", text)

def url_reachable(url: str, timeout=15) -> bool:
    try:
        resp = requests.head(url, timeout=timeout, allow_redirects=True)
        if resp.status_code < 400:
            return True
        resp = requests.get(url, timeout=timeout, allow_redirects=True)
        return resp.status_code < 400
    except Exception:
        return False

def validate_references(data: dict) -> dict:
    """Validate references and report issues. Returns dict with validation results."""
    zh = data.get("markdownZh", "")
    en = data.get("markdownEn", "")

    issues = []

    if "参考文献" not in zh:
        issues.append("Missing '参考文献' section in Chinese article")
    if "References" not in en:
        issues.append("Missing 'References' section in English article")

    zh_urls = extract_urls(zh)
    en_urls = extract_urls(en)
    all_urls = list(dict.fromkeys(zh_urls + en_urls))

    if len(all_urls) < 3:
        issues.append(f"Insufficient references: found {len(all_urls)}, need at least 3")

    # Check first 5 URLs for reachability
    unreachable = []
    for url in all_urls[:5]:
        if not url_reachable(url):
            unreachable.append(url)

    if unreachable:
        issues.append(f"Unreachable reference URLs: {', '.join(unreachable)}")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "total_refs": len(all_urls),
        "checked_refs": min(len(all_urls), 5),
        "unreachable": unreachable
    }

def generate_post(category: str, subtopic: str, max_retries=3) -> dict:
    """Generate blog post with retry logic for reference validation."""
    if not ZHIPU_API_KEY:
        raise RuntimeError("Missing ZHIPU_API_KEY environment variable")

    client = ZhipuAI(api_key=ZHIPU_API_KEY)

    prompt = USER_PROMPT_TEMPLATE.format(
        category=category,
        subtopic=subtopic
    )

    for attempt in range(max_retries):
        try:
            print(f"[GEN] Attempt {attempt + 1}/{max_retries}...")

            resp = client.chat.completions.create(
                model=MODEL,
                temperature=0.4,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
            )

            text = resp.choices[0].message.content.strip()

            # Parse JSON
            try:
                data = json.loads(text)
            except Exception:
                m = re.search(r"\{.*\}", text, re.DOTALL)
                if not m:
                    raise ValueError(f"Model did not return valid JSON:\n{text[:300]}")
                data = json.loads(m.group(0))

            # Validate required fields
            required = ["title", "titleEn", "excerpt", "excerptEn", "category", "categoryEn",
                       "tags", "seoTitle", "seoDescription", "markdownZh", "markdownEn"]
            for k in required:
                if k not in data:
                    raise ValueError(f"Missing required field: {k}")

            # Validate category
            if data["category"] not in ALLOWED_CATEGORIES_ZH:
                raise ValueError(f"Invalid category: {data['category']}. Must be one of {ALLOWED_CATEGORIES_ZH}")

            # Validate references
            validation = validate_references(data)

            if not validation["valid"]:
                print(f"[WARN] Reference validation failed: {', '.join(validation['issues'])}")
                if attempt < max_retries - 1:
                    print(f"[RETRY] Regenerating with better references...")
                    time.sleep(2)
                    continue
                else:
                    # Final attempt: still has issues, but proceed with warning
                    print(f"[WARN] Proceeding despite reference issues after {max_retries} attempts")

            print(f"[OK] Generated: {data['title']} / {data['titleEn']}")
            print(f"[OK] References: {validation['total_refs']} total, {validation['checked_refs']} checked")

            return data

        except Exception as e:
            print(f"[ERROR] Generation attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(3)
            else:
                raise

    raise RuntimeError(f"Failed to generate post after {max_retries} attempts")

# ─────────────────────────── Image Generation ───────────────────────────
def generate_image(category: str, slug: str) -> str:
    """Generate cover image via SiliconFlow."""
    fallback_map = {
        "保胆": "/images/pocs-surgery.jpg",
        "胆囊炎": "/images/gallstone-prevention.jpg",
        "胆囊结石": "/images/gallstone-prevention.jpg",
        "胆囊切除术后营养": "/images/recovery-guide.jpg",
    }

    if not SILICONFLOW_API_KEY:
        print("[WARN] SILICONFLOW_API_KEY not set, using fallback image")
        return fallback_map.get(category, "/images/pocs-surgery.jpg")

    # Topic-specific prompts
    prompt_map = {
        "保胆": "Modern medical illustration of gallbladder preservation and minimally invasive POCS surgery, clean clinical style, soft natural lighting, professional medical education tone, no text, no letters, no symbols, no watermark, no blood, no gore, no frightening scenes",
        "胆囊炎": "Medical illustration of gallbladder inflammation and biliary system, clinical style, calm blue-green tones, professional medical education, no text, no watermark, no frightening scenes",
        "胆囊结石": "Medical illustration of gallstones in gallbladder, anatomical style, clean professional medical visualization, no text, no watermark",
        "胆囊切除术后营养": "Post-cholecystectomy nutrition and recovery meal scene, medical education style, healthy food composition, warm reassuring tones, no text, no watermark",
    }

    prompt = (prompt_map.get(category, prompt_map["保胆"]) +
               "; strict constraints: no text overlay, no Chinese characters, no English letters, no numbers, no logo, no watermark, no signature, no calligraphy, no blood, no gore, no wounds, no surgery close-up, keep clean professional medical education style")

    for model_name in SILICONFLOW_IMAGE_MODELS:
        for attempt in range(1, 3):
            try:
                payload = {
                    "model": model_name,
                    "prompt": prompt,
                    "image_size": "1280x720",
                }
                resp = requests.post(
                    SILICONFLOW_BASE_URL,
                    headers={
                        "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                    timeout=120,
                )
                resp.raise_for_status()
                data = resp.json().get("data", [])
                if not data:
                    raise RuntimeError("No image data from SiliconFlow")

                if data[0].get("url"):
                    img_resp = requests.get(data[0]["url"], timeout=60)
                    img_resp.raise_for_status()
                    img_bytes = img_resp.content
                elif data[0].get("b64_json"):
                    import base64
                    img_bytes = base64.b64decode(data[0]["b64_json"])
                else:
                    raise RuntimeError("No image URL/base64 from SiliconFlow")

                img_filename = f"blog-{slug[:40]}.jpg"
                img_path = IMAGES_DIR / img_filename
                img_path.write_bytes(img_bytes)

                print(f"[OK] Image saved: {img_filename} via {model_name}")
                return f"/images/blog/{img_filename}"

            except Exception as e:
                print(f"[WARN] Image generation failed ({model_name}, attempt {attempt}): {e}")
                continue

    print(f"[WARN] Using fallback image for {category}")
    return fallback_map.get(category, "/images/pocs-surgery.jpg")

# ─────────────────────────── File Operations ───────────────────────────
def make_slug(title: str) -> str:
    """Generate URL-friendly slug."""
    clean = re.sub(r"[^\w\s-]", "", title, flags=re.UNICODE)
    clean = re.sub(r"\s+", "-", clean.strip()).lower()
    clean = clean[:40]
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    today = datetime.now().strftime("%Y%m%d")
    return f"{today}-{clean}-{suffix}" if clean else f"{today}-post-{suffix}"

def save_markdown(slug: str, data: dict, image_url: str, source_url: str):
    """Save markdown files."""
    today = datetime.now().strftime("%Y-%m-%d")

    # Chinese
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

    # English
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

    print(f"[OK] Saved markdown: {zh_path.name} + {en_path.name}")
    return str(zh_path), str(en_path)

def update_blog_index(slug: str, data: dict, image_url: str):
    """Update blog-posts.ts index."""
    today = datetime.now().strftime("%Y-%m-%d")

    esc = lambda s: (s or "").replace("'", "\\'")
    title = esc(data.get("title", ""))
    title_en = esc(data.get("titleEn", ""))
    excerpt = esc(data.get("excerpt", ""))
    excerpt_en = esc(data.get("excerptEn", ""))
    category = esc(data.get("category", ""))
    category_en = esc(data.get("categoryEn", ""))
    seo_title = esc(data.get("seoTitle", title))
    seo_desc = esc(data.get("seoDescription", excerpt))

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
    marker = "export const blogPosts: BlogPost[] = ["

    if f"id: '{slug}'" in content:
        print(f"[SKIP] Already registered: {slug}")
        return

    insert_pos = content.index(marker) + len(marker)
    new_content = content[:insert_pos] + "\n" + new_entry + content[insert_pos:]
    BLOG_INDEX_FILE.write_text(new_content, encoding="utf-8")
    print(f"[OK] Registered in blog-posts.ts: {slug}")

def update_queue(slug: str, data: dict, image_url: str, publish_date: str):
    """Add new post to queue.json."""
    if not QUEUE_FILE.exists():
        queue_data = {"updated": publish_date, "posts": []}
    else:
        queue_data = json.loads(QUEUE_FILE.read_text(encoding="utf-8"))

    entry = {
        "publish_date": publish_date,
        "slug": slug,
        "title": data["title"],
        "titleEn": data["titleEn"],
        "category": data["category"],
        "categoryEn": data["categoryEn"],
        "imageUrl": image_url,
        "excerpt": data["excerpt"],
        "excerptEn": data["excerptEn"],
        "seoTitle": data.get("seoTitle", data["title"]),
        "seoDescription": data.get("seoDescription", data["excerpt"]),
        "status": "published",
        "published_at": publish_date,
    }

    queue_data["posts"].insert(0, entry)  # Add at the beginning
    queue_data["updated"] = publish_date

    QUEUE_FILE.write_text(json.dumps(queue_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] Updated queue.json")

def commit_and_push(slug: str):
    """Commit changes and push to trigger Vercel deploy."""
    try:
        os.chdir(REPO_ROOT)

        # Check if there are changes
        result = os.popen("git status --porcelain").read()
        if not result.strip():
            print("[INFO] No changes to commit")
            return False

        # Commit
        commit_msg = f"Auto-daily: {slug}"
        os.popen(f"git add -A").read()
        os.popen(f'git commit -m "{commit_msg}"').read()

        # Push
        push_result = os.popen("git push").read()
        print(f"[OK] Pushed to remote: {push_result}")
        return True

    except Exception as e:
        print(f"[WARN] Git push failed: {e}")
        return False

# ─────────────────────────── Main ───────────────────────────
def main():
    print("=== AskDrLiu Daily Auto-Generator ===")

    # 1. Pick random category and subtopic
    category = random.choice(ALLOWED_CATEGORIES_ZH)
    subtopic = random.choice(SUBTOPICS[category])

    print(f"[TOPIC] Category: {category}")
    print(f"[TOPIC] Subtopic: {subtopic}")

    # 2. Generate content
    try:
        data = generate_post(category, subtopic)
    except Exception as e:
        print(f"[ERROR] Content generation failed: {e}")
        return {
            "success": False,
            "error": f"Content generation failed: {str(e)}",
            "next_steps": "Check API keys and network connectivity. Manually create post or retry later."
        }

    # 3. Generate slug
    slug = make_slug(data["title"])
    print(f"[SLUG] {slug}")

    # 4. Generate image
    try:
        image_url = generate_image(data["category"], slug)
        print(f"[IMAGE] {image_url}")
    except Exception as e:
        print(f"[WARN] Image generation failed: {e}")
        image_url = "/images/pocs-surgery.jpg"

    # 5. Save markdown
    save_markdown(slug, data, image_url, "auto-generated")

    # 6. Update blog-posts.ts
    try:
        update_blog_index(slug, data, image_url)
    except Exception as e:
        print(f"[WARN] Failed to update blog-posts.ts: {e}")

    # 7. Update queue.json
    today = datetime.now().strftime("%Y-%m-%d")
    try:
        update_queue(slug, data, image_url, today)
    except Exception as e:
        print(f"[WARN] Failed to update queue.json: {e}")

    # 8. Count references
    zh_refs = len(extract_urls(data["markdownZh"]))
    en_refs = len(extract_urls(data["markdownEn"]))
    total_refs = zh_refs + en_refs

    # 9. Commit and push
    pushed = commit_and_push(slug)

    print(f"\n✅ Success! Post: {data['title']}")

    return {
        "success": True,
        "title": data["title"],
        "slug": slug,
        "cover_url": image_url,
        "references": total_refs,
        "pushed": pushed,
        "next_steps": "Monitor Vercel deployment. Verify blog post appears on site."
    }

if __name__ == "__main__":
    result = main()
    print("\n=== RESULT ===")
    print(json.dumps(result, ensure_ascii=False, indent=2))
