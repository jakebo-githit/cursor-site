#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AskDrLiu Blog Daily Update Runner
----------------------------------
One-click daily blog update workflow:
1. Generate article (GLM API)
2. Generate cover image (Doubao Seedream)
3. Save to queue and draft
4. Publish
5. Git commit & push
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path

# Add scripts directory to path
SCRIPTS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS_DIR))

# Load .env manually
_env_file = SCRIPTS_DIR.parent / ".env"
if _env_file.exists():
    for line in _env_file.read_text().strip().splitlines():
        if "=" in line and not line.startswith("#"):
            key, val = line.split("=", 1)
            os.environ.setdefault(key.strip(), val.strip())

from daily_auto_generate import (
    pick_unique_seed_topic,
    generate_post,
    generate_cover_image,
    BLOG_MD_DIR,
    IMAGES_DIR,
    QUEUE_FILE,
    CATEGORY_MAP,
)
from seo_article_rules import ensure_book_link as shared_ensure_book_link

REPO_ROOT = SCRIPTS_DIR.parent
DRAFTS_DIR = BLOG_MD_DIR / "drafts"

def make_slug(title: str) -> str:
    """Generate URL-friendly slug."""
    import re
    import random
    import string
    # Remove special characters
    slug = re.sub(r'[^\w\s-]', '', title)
    slug = re.sub(r'[\s]+', '-', slug)
    slug = slug.strip('-')[:80]
    # Add random suffix
    suffix = ''.join(random.choices(string.ascii_lowercase, k=6))
    date_prefix = datetime.now().strftime("%Y%m%d")
    return f"{date_prefix}-{slug}-{suffix}"


def save_draft(slug: str, data: dict, image_url: str):
    """Save article as draft markdown file."""
    DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Build frontmatter
    frontmatter = f"""---
title: {data['title']}
titleEn: {data['titleEn']}
category: {data['category']}
categoryEn: {data['categoryEn']}
imageUrl: {image_url}
excerpt: {data['excerpt']}
excerptEn: {data['excerptEn']}
seoTitle: {data['seoTitle']}
seoDescription: {data['seoDescription']}
publish_date: {datetime.now().strftime('%Y-%m-%d')}
status: draft
---

"""
    
    # Combine content
    content = frontmatter + data['markdownZh'] + "\n\n---\n\n" + data['markdownEn']
    
    # Save
    draft_path = DRAFTS_DIR / f"{slug}.md"
    draft_path.write_text(content, encoding='utf-8')
    print(f"[DRAFT] Saved: {draft_path}")
    return draft_path


def update_queue(slug: str, data: dict, image_url: str):
    """Add article to queue.json."""
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Load existing queue
    if QUEUE_FILE.exists():
        queue = json.loads(QUEUE_FILE.read_text(encoding='utf-8'))
    else:
        queue = {"updated": today, "posts": []}
    
    # Check if slug already exists
    existing = next((p for p in queue['posts'] if p['slug'] == slug), None)
    if existing:
        print(f"[QUEUE] Updating existing entry: {slug}")
        existing.update({
            "title": data['title'],
            "titleEn": data['titleEn'],
            "category": data['category'],
            "categoryEn": data['categoryEn'],
            "imageUrl": image_url,
            "excerpt": data['excerpt'],
            "excerptEn": data['excerptEn'],
            "seoTitle": data['seoTitle'],
            "seoDescription": data['seoDescription'],
            "publish_date": today,
            "status": "draft",
        })
    else:
        print(f"[QUEUE] Adding new entry: {slug}")
        queue['posts'].insert(0, {
            "publish_date": today,
            "slug": slug,
            "title": data['title'],
            "titleEn": data['titleEn'],
            "category": data['category'],
            "categoryEn": data['categoryEn'],
            "imageUrl": image_url,
            "excerpt": data['excerpt'],
            "excerptEn": data['excerptEn'],
            "seoTitle": data['seoTitle'],
            "seoDescription": data['seoDescription'],
            "status": "draft",
        })
    
    queue['updated'] = today
    QUEUE_FILE.write_text(json.dumps(queue, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"[QUEUE] Updated: {QUEUE_FILE}")


def run_publish():
    """Run daily_publish.py to publish the draft."""
    print("\n[PUBLISH] Running daily_publish.py...")
    result = subprocess.run(
        [sys.executable, str(SCRIPTS_DIR / "daily_publish.py")],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    print(result.stdout)
    if result.stderr:
        print(result.stderr)
    if result.returncode != 0:
        raise RuntimeError(f"Publish failed with code {result.returncode}")
    return result.returncode == 0


def git_commit_push(slug: str, title: str):
    """Commit and push changes to Git."""
    print("\n[GIT] Checking status...")
    
    # Check if there are changes
    status = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    
    if not status.stdout.strip():
        print("[GIT] No changes to commit")
        return
    
    print("[GIT] Adding changes...")
    subprocess.run(["git", "add", "-A"], cwd=REPO_ROOT, check=True)
    
    commit_msg = f"blog: {title[:50]}"
    print(f"[GIT] Committing: {commit_msg}")
    subprocess.run(["git", "commit", "-m", commit_msg], cwd=REPO_ROOT, check=True)
    
    print("[GIT] Pushing...")
    subprocess.run(["git", "push"], cwd=REPO_ROOT, check=True)
    
    print("[GIT] ✅ Pushed successfully")


def main():
    print("=== AskDrLiu Daily Blog Update ===")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Step 1: Pick topic
    print("[1/6] Picking topic...")
    category, subtopic = pick_unique_seed_topic()
    print(f"  Category: {category}")
    print(f"  Subtopic: {subtopic}")
    
    # Step 2: Generate article
    print("\n[2/6] Generating article...")
    data = generate_post(category, subtopic)
    slug = make_slug(data['title'])
    print(f"  Slug: {slug}")
    
    # Step 3: Generate cover image
    print("\n[3/6] Generating cover image...")
    base_prompt = f"彩色医学科普封面，主题为{data['category']}，突出真实生活方式、门诊沟通或饮食管理场景，整体温暖专业，适合个人医生网站文章封面"
    
    category_fallbacks = {
        "保胆": "/images/pocs-surgery.jpg",
        "胆囊炎": "/images/gallstone-prevention.jpg",
        "胆囊结石": "/images/gallstone-prevention.jpg",
        "胆囊切除术后营养": "/images/recovery-guide.jpg",
    }
    fallback = category_fallbacks.get(data['category'], "/images/pocs-surgery.jpg")
    
    image_url = generate_cover_image(
        slug=slug,
        images_dir=IMAGES_DIR,
        fallback_path=fallback,
        base_prompt=base_prompt,
    )
    print(f"  Image: {image_url}")
    
    # Step 4: Save draft and update queue
    print("\n[4/6] Saving draft and updating queue...")
    save_draft(slug, data, image_url)
    update_queue(slug, data, image_url)
    
    # Step 5: Publish
    print("\n[5/6] Publishing...")
    run_publish()
    
    # Step 6: Git push
    print("\n[6/6] Committing and pushing to Git...")
    git_commit_push(slug, data['title'])
    
    # Summary
    print("\n" + "="*50)
    print("✅ Daily update completed!")
    print(f"Title: {data['title']}")
    print(f"Slug: {slug}")
    print(f"Image: {image_url}")
    print(f"Category: {data['category']}")
    print("="*50)
    
    # Return summary for Telegram notification
    return {
        "title": data['title'],
        "slug": slug,
        "image_url": image_url,
        "category": data['category'],
        "refs_count": data.get('markdownZh', '').count('http'),
        "pushed": True,
    }


if __name__ == "__main__":
    try:
        result = main()
        # Write summary for cron to read
        summary_file = SCRIPTS_DIR / "today_summary.txt"
        summary_file.write_text(
            f"Title: {result['title']}\n"
            f"Slug: {result['slug']}\n"
            f"Image: {result['image_url']}\n"
            f"References: {result['refs_count']}\n"
            f"Status: PUBLISHED\n"
            f"Date: {datetime.now().strftime('%Y-%m-%d')}\n"
            f"Category: {result['category']}\n",
            encoding='utf-8'
        )
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        
        # Write failure summary
        summary_file = SCRIPTS_DIR / "today_summary.txt"
        summary_file.write_text(
            f"Status: FAILED\n"
            f"Error: {str(e)}\n"
            f"Date: {datetime.now().strftime('%Y-%m-%d')}\n",
            encoding='utf-8'
        )
        sys.exit(1)
