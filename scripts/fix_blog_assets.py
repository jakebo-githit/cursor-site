#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_blog_assets.py
------------------
1. 重新生成占位图/重复图 → 彩色卡通风格
2. 为缺少英文版的文章生成 -en.md
3. 更新 blog-posts.ts 中的 imageUrl
"""

import os, re, json, time
from pathlib import Path
from openai import OpenAI

# Load .env
_env_file = Path(__file__).resolve().parents[1] / ".env"
if _env_file.exists():
    for line in _env_file.read_text().strip().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

from ark_image_helper import generate_cover_image

REPO_ROOT = Path(__file__).resolve().parents[1]
BLOG_MD_DIR = REPO_ROOT / "public" / "blog-posts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"
BLOG_INDEX_FILE = REPO_ROOT / "src" / "data" / "blog-posts.ts"

ARK_API_KEY = os.getenv("ARK_API_KEY", "").strip()
LLM_API_KEY = (os.getenv("LLM_API_KEY") or os.getenv("ZHIPU_API_KEY") or "").strip()
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://open.bigmodel.cn/api/coding/paas/v4")

# Posts that have placeholder/duplicate images — need new colorful images
PLACEHOLDER_IMAGES = {
    "/images/pocs-surgery.jpg",
    "/images/gallstone-prevention.jpg",
    "/images/recovery-guide.jpg",
    "/images/dietary-guidance.jpg",
    "/images/liver-health.jpg",
}

# Slug → (Chinese title, English title) for image prompt
SLUG_TO_TITLES = {
    "20260321-保胆取石术后护理要点加速康复的关键指南-7fvbbi": ("保胆取石术后护理要点：加速康复的关键指南", "Post-Op Care After Gallbladder-Preserving Stone Removal"),
    "20260320-急性胆囊炎的早期识别与紧急处理-x5w0vo": ("急性胆囊炎的早期识别与紧急处理", "Early Identification and Emergency Management of Acute Cholecystitis"),
    "20260319-胆囊炎反复发作的原因-folgmj": ("胆囊炎反复发作的原因与预防", "Causes and Prevention of Recurrent Cholecystitis"),
    "20260308-胆囊切除后腹泻应对-l357rf": ("胆囊切除后腹泻应对", "Managing Diarrhea After Gallbladder Removal"),
    "20260305-蔬果农药与胆囊健康-olrmws": ("蔬果农药残留与胆囊健康", "Pesticide Residues in Produce and Gallbladder Health"),
    "gallstone-prevention": ("胆结石形成的原因及预防措施", "Gallstone Formation: Causes and Prevention"),
    "dietary-guidance": ("POCS手术前后的饮食指导", "Dietary Guidance Before and After POCS Surgery"),
    "liver-health": ("肝胆健康的自我监测方法", "Self-Monitoring Methods for Hepatobiliary Health"),
    "recovery-guide": ("术后康复指南：如何加速恢复", "Post-operative Rehabilitation Guide"),
    "pocs-vs-traditional": ("POCS技术与传统手术的对比", "POCS vs Traditional Surgery Comparison"),
    "2026-03-04-cholecystectomy-diet": ("切了胆囊，为什么吃点油还是难受？", "Why Does Eating Fat Still Hurt After Gallbladder Removal?"),
    "肝硬化能逆转警惕钼元素疗法陷阱-1je8c": ("肝硬化能逆转？警惕钼元素疗法陷阱", "Can Liver Cirrhosis Be Reversed? Beware of Molybdenum Therapy"),
}

def parse_blog_index():
    """Return list of (slug, imageUrl) from blog-posts.ts"""
    content = BLOG_INDEX_FILE.read_text(encoding="utf-8")
    entries = re.findall(r"id: '([^']+)'.*?imageUrl: '([^']*)'", content, re.DOTALL)
    return entries

def update_image_url_in_index(slug: str, new_url: str):
    content = BLOG_INDEX_FILE.read_text(encoding="utf-8")
    # Find the block for this slug and replace imageUrl
    pattern = rf"(id: '{re.escape(slug)}'.*?imageUrl: ')(.*?)(')"
    replacement = rf"\g<1>{new_url}\g<3>"
    new_content = re.sub(pattern, replacement, content, count=1, flags=re.DOTALL)
    if new_content != content:
        BLOG_INDEX_FILE.write_text(new_content, encoding="utf-8")
        print(f"  [OK] Updated imageUrl in blog-posts.ts → {new_url}")
    else:
        print(f"  [WARN] Could not update imageUrl for {slug}")

def update_md_frontmatter_image(md_path: Path, new_url: str):
    if not md_path.exists():
        return
    text = md_path.read_text(encoding="utf-8")
    new_text = re.sub(r"(^image: ).*", rf"\g<1>{new_url}", text, count=1, flags=re.MULTILINE)
    if new_text != text:
        md_path.write_text(new_text, encoding="utf-8")

def generate_en_markdown(zh_md_path: Path, slug: str, title_en: str) -> str:
    """Call GLM to produce a concise English markdown from Chinese content."""
    if not LLM_API_KEY:
        return ""
    zh_content = zh_md_path.read_text(encoding="utf-8")
    # Strip frontmatter for the prompt
    body = re.sub(r"^---[\s\S]*?---\r?\n", "", zh_content).strip()[:3000]

    client = OpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL)
    prompt = (
        f"Translate and adapt the following Chinese medical article into a concise, "
        f"patient-friendly English markdown article for AskDrLiu.com.\n\n"
        f"English title: {title_en}\n\n"
        f"Requirements:\n"
        f"- Output ONLY valid markdown, no frontmatter, no code fences\n"
        f"- Keep ## heading structure\n"
        f"- Include ## Key Takeaway section at the top\n"
        f"- Include ## References section at the bottom (keep URLs from Chinese version)\n"
        f"- End with: *Disclaimer: This article is for health education only and does not replace professional medical advice.*\n"
        f"- Do NOT mix Chinese and English\n\n"
        f"Chinese article:\n{body}"
    )
    try:
        resp = client.chat.completions.create(
            model="glm-5",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=4000,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        print(f"  [ERROR] English generation failed: {e}")
        return ""

def get_en_fallback(slug: str, title_en: str, excerpt_en: str) -> str:
    return (
        f"# {title_en}\n\n"
        f"## Key Takeaway\n\n{excerpt_en}\n\n"
        f"Please refer to the Chinese article on AskDrLiu.com for the full discussion.\n\n"
        f"*Disclaimer: This article is for health education only and does not replace professional medical advice.*\n"
    )

def main():
    print("=== AskDrLiu Blog Asset Fixer ===\n")
    entries = parse_blog_index()

    # Also build excerpt_en map from blog-posts.ts
    ts_content = BLOG_INDEX_FILE.read_text(encoding="utf-8")
    excerpt_en_map = {}
    title_en_map = {}
    for m in re.finditer(r"id: '([^']+)'.*?titleEn: '([^']*)'.*?excerptEn: '([^']*)'", ts_content, re.DOTALL):
        excerpt_en_map[m.group(1)] = m.group(3)
        title_en_map[m.group(1)] = m.group(2)

    # STEP 1: Regenerate placeholder/duplicate images
    print("── STEP 1: Regenerating placeholder images ──")
    seen_images = {}
    for slug, img_url in entries:
        if img_url in PLACEHOLDER_IMAGES or img_url in seen_images.values():
            titles = SLUG_TO_TITLES.get(slug, (slug, slug))
            prompt = titles[0]
            print(f"\n[IMG] {slug}")
            new_url = generate_cover_image(
                slug=slug,
                images_dir=IMAGES_DIR,
                fallback_path=img_url,
                base_prompt=prompt,
                api_key=ARK_API_KEY,
            )
            if new_url != img_url:
                update_image_url_in_index(slug, new_url)
                # Update zh and en md frontmatter
                update_md_frontmatter_image(BLOG_MD_DIR / f"{slug}.md", new_url)
                update_md_frontmatter_image(BLOG_MD_DIR / f"{slug}-en.md", new_url)
            time.sleep(2)
        seen_images[slug] = img_url

    # STEP 2: Generate missing English markdown files
    print("\n── STEP 2: Generating missing English markdown files ──")
    for slug, _ in entries:
        en_path = BLOG_MD_DIR / f"{slug}-en.md"
        zh_path = BLOG_MD_DIR / f"{slug}.md"
        if en_path.exists():
            continue
        title_en = title_en_map.get(slug, SLUG_TO_TITLES.get(slug, ("", slug))[1])
        excerpt_en = excerpt_en_map.get(slug, "")
        img_url = next((img for s, img in entries if s == slug), "")

        print(f"\n[EN] {slug}")

        # Try to generate proper English translation
        if zh_path.exists() and LLM_API_KEY:
            en_body = generate_en_markdown(zh_path, slug, title_en)
        else:
            en_body = ""

        if not en_body:
            en_body = get_en_fallback(slug, title_en, excerpt_en)

        from datetime import date
        today = date.today().strftime("%Y-%m-%d")
        en_header = f"---\ntitle: {title_en}\ndate: {today}\nimage: {img_url}\n---\n\n"
        en_path.write_text(en_header + en_body + "\n", encoding="utf-8")
        print(f"  [OK] Written: {en_path.name}")
        time.sleep(3)

    print("\n✅ Done! Run: git add -A && git commit -m 'fix: colorful images + English versions for all posts'")

if __name__ == "__main__":
    main()
