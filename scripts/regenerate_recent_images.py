#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Regenerate duplicate/placeholder cover images for recent blog posts.
Targets posts that share the same generic image (pocs-surgery.jpg,
gallstone-prevention.jpg, recovery-guide.jpg).
"""

import os
import re
import random
from pathlib import Path
import requests

REPO_ROOT = Path(__file__).resolve().parents[1]
BLOG_MD_DIR = REPO_ROOT / "public" / "blog-posts"
BLOG_INDEX_FILE = REPO_ROOT / "src" / "data" / "blog-posts.ts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"

ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations"
ARK_API_KEY = os.getenv("ARK_API_KEY", "").strip()
ARK_IMAGE_MODELS = [
    "doubao-seedream-5-0-260128",
    "doubao-seedream-4-5-251128",
]

# Posts that need unique images (slug -> descriptive prompt hint)
TARGET_POSTS = [
    {
        "slug": "20260321-保胆取石术后护理要点加速康复的关键指南-7fvbbi",
        "hint": "保胆取石术后护理与康复，温馨居家恢复场景，患者在家休息调养",
        "old_image": "/images/pocs-surgery.jpg",
    },
    {
        "slug": "20260320-急性胆囊炎的早期识别与紧急处理-x5w0vo",
        "hint": "急性胆囊炎早期识别，医生细心诊察腹部，温暖的门诊场景",
        "old_image": "/images/gallstone-prevention.jpg",
    },
    {
        "slug": "20260319-胆囊炎反复发作的原因-folgmj",
        "hint": "胆囊炎反复发作的预防，健康饮食与规律生活，厨房里准备清淡食物",
        "old_image": "/images/gallstone-prevention.jpg",
    },
    {
        "slug": "20260305-蔬果农药与胆囊健康-olrmws",
        "hint": "蔬果清洗与食品安全，厨房台面上色彩丰富的新鲜蔬果，清水冲洗",
        "old_image": "/images/pocs-surgery.jpg",
    },
]

STYLES = [
    "充满活力的水彩与色铅笔结合的童话治愈画风",
    "吉卜力般明亮温暖的彩色治愈动画场景",
    "明快活泼的多彩治愈系健康生活插画风格",
    "极其干净高级的矢量多彩扁平风插画，马卡龙明快配色",
    "温暖柔和的日系手绘水彩风，色调清新自然",
]


def generate_image(prompt_hint: str, slug: str):
    """Generate a unique cover image using Ark API."""
    if not ARK_API_KEY:
        raise ValueError("ARK_API_KEY environment variable is not set")

    style = STYLES[hash(slug) % len(STYLES)]  # deterministic style per slug
    full_prompt = (
        f"健康医学博客温馨插画，核心主题：{prompt_hint}。"
        f"要求画风：{style}。"
        f"画面必须留白充足、健康明亮、积极向上、安全感满满。"
        f"绝对不要出现任何文字、字母、数字、中文、英文、拼音、水牌、书籍封面文字、logo、水印、签名。"
        f"绝对不要出现人体器官直接暴露、血腥、手术内伤或夸张痛苦表情。"
        f"要求细节丰富且独一无二（唯一标识：{slug[:12]}-{random.randint(1000,9999)}），以保证图片不重复。"
    )

    for model_name in ARK_IMAGE_MODELS:
        for attempt in range(1, 3):
            print(f"  [{model_name}] Attempt {attempt}... Generating for {slug[:30]}")
            try:
                resp = requests.post(
                    ARK_BASE_URL,
                    headers={
                        "Authorization": f"Bearer {ARK_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model_name,
                        "prompt": full_prompt,
                        "size": "2K",
                        "response_format": "url",
                        "watermark": False,
                    },
                    timeout=180,
                )
                resp.raise_for_status()
                data = resp.json().get("data", [])
                if data and data[0].get("url"):
                    url = data[0]["url"]
                    img_resp = requests.get(url, timeout=120)
                    img_resp.raise_for_status()
                    img_bytes = img_resp.content
                    img_filename = f"blog-{slug[:50]}-regen.png"
                    img_path = IMAGES_DIR / img_filename
                    img_path.write_bytes(img_bytes)
                    print(f"  [OK] Saved: {img_filename} ({len(img_bytes)//1024}KB)")
                    return f"/images/blog/{img_filename}"
            except Exception as e:
                print(f"  [ERROR] {model_name} attempt {attempt}: {e}")
    return None


def update_index(slug: str, new_image: str, content: str) -> str:
    """Replace imageUrl for the given slug in blog-posts.ts content."""
    block_pattern = r"(id:\s*'" + re.escape(slug) + r"'(?:[\s\S]*?)imageUrl:\s*')[^']+'"
    new_content = re.sub(block_pattern, r"\g<1>" + new_image + "'", content, count=1)
    return new_content


def update_markdown(slug: str, new_image: str):
    """Update imageUrl/image field in markdown frontmatter."""
    for suffix in ["", "-en"]:
        md_path = BLOG_MD_DIR / f"{slug}{suffix}.md"
        if md_path.exists():
            md = md_path.read_text(encoding="utf-8")
            md = re.sub(r"^image(?:Url)?:\s*.*$", f"image: {new_image}", md, flags=re.MULTILINE)
            md_path.write_text(md, encoding="utf-8")
            print(f"  [OK] Updated {md_path.name}")


def main():
    if not BLOG_INDEX_FILE.exists():
        print("blog-posts.ts not found. Aborting.")
        return

    if not ARK_API_KEY:
        print("[ERROR] ARK_API_KEY not set. Cannot generate images.")
        print("Set it with: export ARK_API_KEY=your_key")
        return

    content = BLOG_INDEX_FILE.read_text(encoding="utf-8")
    updated = False

    for post in TARGET_POSTS:
        slug = post["slug"]
        hint = post["hint"]
        old_image = post["old_image"]

        # Check if this slug exists in the index
        if f"'{slug}'" not in content:
            print(f"[SKIP] Slug not found in index: {slug}")
            continue

        # Check if image is still the duplicate one
        current_match = re.search(
            r"id:\s*'" + re.escape(slug) + r"'(?:[\s\S]*?)imageUrl:\s*'([^']+)'",
            content,
        )
        if current_match:
            current_image = current_match.group(1)
            if current_image != old_image:
                print(f"[SKIP] {slug[:30]}... already has unique image: {current_image}")
                continue

        print(f"\n[REGEN] {slug}")
        print(f"  Old: {old_image}")
        new_image = generate_image(hint, slug)
        if not new_image:
            print(f"  [FAIL] Could not generate image, keeping old")
            continue

        print(f"  New: {new_image}")
        content = update_index(slug, new_image, content)
        update_markdown(slug, new_image)
        updated = True

    if updated:
        BLOG_INDEX_FILE.write_text(content, encoding="utf-8")
        print("\n✅ blog-posts.ts updated with new images")
    else:
        print("\n⚠️ No images were regenerated")


if __name__ == "__main__":
    main()
