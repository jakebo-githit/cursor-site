#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auto Daily Publish Script for AskDrLiu Blog
Complete workflow: Generate → Publish → Git Push → Telegram Notify
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

from daily_auto_generate import pick_unique_seed_topic, generate_post
from ark_image_helper import generate_cover_image

# Load .env
env_file = Path(__file__).resolve().parents[1] / ".env"
if env_file.exists():
    for line in env_file.read_text().strip().splitlines():
        if "=" in line and not line.startswith("#"):
            key, val = line.split("=", 1)
            os.environ.setdefault(key.strip(), val.strip())

REPO_ROOT = Path(__file__).resolve().parents[1]
BLOG_MD_DIR = REPO_ROOT / "public" / "blog-posts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"
QUEUE_FILE = REPO_ROOT / "scripts" / "queue.json"

def main():
    print("=" * 60)
    print(f"AskDrLiu Blog Auto Daily Publish - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Step 1: Generate new post
    print("\n[1/5] Generating new blog post...")
    try:
        category, subtopic = pick_unique_seed_topic()
        print(f"  Topic: {category} - {subtopic}")
        
        post_data = generate_post(category, subtopic)
        
        # Generate slug if not present
        if "slug" not in post_data:
            import re
            from datetime import datetime as dt
            import random
            import string
            
            date_prefix = dt.now().strftime("%Y%m%d")
            title_slug = re.sub(r'[^\w\u4e00-\u9fff]+', '-', post_data['title'])[:30]
            random_suffix = ''.join(random.choices(string.ascii_lowercase, k=6))
            post_data["slug"] = f"{date_prefix}-{title_slug}-{random_suffix}"
        
        print(f"  ✓ Generated: {post_data['title']}")
        print(f"  Slug: {post_data['slug']}")
    except Exception as e:
        import traceback
        print(f"  ✗ Generation failed: {e}")
        traceback.print_exc()
        return {"success": False, "error": f"Generation failed: {e}"}
    
    # Step 2: Generate cover image
    print("\n[2/5] Generating cover image...")
    try:
        image_keyword = post_data.get("category", "gallbladder")
        image_path = generate_cover_image(image_keyword, post_data["slug"])
        if image_path:
            post_data["imageUrl"] = image_path
            print(f"  ✓ Image: {image_path}")
        else:
            # Fallback to existing image
            post_data["imageUrl"] = "/images/gallstone-prevention.jpg"
            print(f"  ⚠ Using fallback image")
    except Exception as e:
        print(f"  ⚠ Image generation failed: {e}")
        post_data["imageUrl"] = "/images/gallstone-prevention.jpg"
    
    # Step 3: Save markdown files
    print("\n[3/5] Saving markdown files...")
    try:
        # Save Chinese markdown
        slug = post_data["slug"]
        zh_path = BLOG_MD_DIR / f"{slug}.md"
        en_path = BLOG_MD_DIR / f"{slug}-en.md"
        
        zh_content = f"""# {post_data['title']}

> **{post_data['category']}** • {datetime.now().strftime('%Y年%m月%d日')}

{post_data['markdownZh']}

---

*免责声明：本文仅供健康科普参考，不作为诊断或治疗依据。如有不适，请及时就医。*
"""
        
        en_content = f"""# {post_data['titleEn']}

> **{post_data['categoryEn']}** • {datetime.now().strftime('%B %d, %Y')}

{post_data['markdownEn']}

---

*Disclaimer: This article is for health education purposes only and should not be used as a basis for diagnosis or treatment. Please consult a healthcare professional if you experience any symptoms.*
"""
        
        zh_path.write_text(zh_content, encoding="utf-8")
        en_path.write_text(en_content, encoding="utf-8")
        print(f"  ✓ Saved: {zh_path.name}")
        print(f"  ✓ Saved: {en_path.name}")
    except Exception as e:
        print(f"  ✗ Save failed: {e}")
        return {"success": False, "error": f"Save failed: {e}"}
    
    # Step 4: Update queue.json
    print("\n[4/5] Updating publish queue...")
    try:
        queue_data = {"updated": datetime.now().strftime("%Y-%m-%d"), "posts": []}
        if QUEUE_FILE.exists():
            queue_data = json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
        
        # Add new post to queue
        today = datetime.now().strftime("%Y-%m-%d")
        new_entry = {
            "publish_date": today,
            "slug": slug,
            "title": post_data["title"],
            "titleEn": post_data["titleEn"],
            "category": post_data["category"],
            "categoryEn": post_data["categoryEn"],
            "imageUrl": post_data["imageUrl"],
            "excerpt": post_data["excerpt"],
            "excerptEn": post_data["excerptEn"],
            "seoTitle": post_data["seoTitle"],
            "seoDescription": post_data["seoDescription"],
            "status": "published",
            "published_at": today
        }
        
        queue_data["posts"].insert(0, new_entry)
        queue_data["updated"] = today
        
        QUEUE_FILE.write_text(json.dumps(queue_data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  ✓ Queue updated: {len(queue_data['posts'])} posts")
    except Exception as e:
        print(f"  ✗ Queue update failed: {e}")
        return {"success": False, "error": f"Queue update failed: {e}"}
    
    # Step 5: Update blog-posts.ts
    print("\n[5/5] Updating blog-posts.ts...")
    try:
        index_file = REPO_ROOT / "src" / "data" / "blog-posts.ts"
        if index_file.exists():
            content = index_file.read_text(encoding="utf-8")
            
            # Create new entry
            new_ts_entry = f"""  {{
    id: '{slug}',
    title: '{post_data['title']}',
    titleEn: '{post_data['titleEn']}',
    excerpt: '{post_data['excerpt']}',
    excerptEn: '{post_data['excerptEn']}',
    date: '{datetime.now().strftime('%Y-%m-%d')}',
    category: '{post_data['category']}',
    categoryEn: '{post_data['categoryEn']}',
    imageUrl: '{post_data['imageUrl']}',
    author: '刘波主任'
  }}"""
            
            # Insert after the opening bracket of blogPosts array
            if "export const blogPosts: BlogPost[] = [" in content:
                content = content.replace(
                    "export const blogPosts: BlogPost[] = [",
                    f"export const blogPosts: BlogPost[] = [\n{new_ts_entry},"
                )
                index_file.write_text(content, encoding="utf-8")
                print(f"  ✓ blog-posts.ts updated")
    except Exception as e:
        print(f"  ⚠ blog-posts.ts update failed: {e}")
    
    # Step 6: Git commit and push
    print("\n[6/6] Committing and pushing to Git...")
    try:
        os.chdir(REPO_ROOT)
        
        # Git add
        subprocess.run(["git", "add", "-A"], check=True)
        
        # Git commit
        commit_msg = f"Publish: {post_data['title']}"
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
        
        # Git push
        result = subprocess.run(["git", "push", "origin", "master"], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print(f"  ✓ Pushed to GitHub")
            pushed = True
        else:
            print(f"  ⚠ Push failed: {result.stderr}")
            pushed = False
    except subprocess.TimeoutExpired:
        print(f"  ⚠ Push timeout")
        pushed = False
    except Exception as e:
        print(f"  ⚠ Git operation failed: {e}")
        pushed = False
    
    # Prepare result
    result_data = {
        "success": True,
        "title": post_data["title"],
        "slug": slug,
        "coverUrl": post_data["imageUrl"],
        "category": post_data["category"],
        "refCount": post_data.get("markdownZh", "").count("http"),
        "pushed": pushed,
        "seoTitle": post_data["seoTitle"],
        "seoDescription": post_data["seoDescription"]
    }
    
    print("\n" + "=" * 60)
    print("✅ Blog post published successfully!")
    print("=" * 60)
    
    return result_data

if __name__ == "__main__":
    result = main()
    
    # Output for cron to capture
    if result.get("success"):
        print("\n--- SUMMARY ---")
        print(f"Title: {result['title']}")
        print(f"Slug: {result['slug']}")
        print(f"Cover: {result['coverUrl']}")
        print(f"References: {result['refCount']}")
        print(f"Pushed: {'Yes' if result['pushed'] else 'No'}")
    else:
        print(f"\n--- FAILED ---")
        print(f"Error: {result.get('error', 'Unknown error')}")
        sys.exit(1)
