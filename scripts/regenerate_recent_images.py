#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import colorsys
import json
import os
import statistics
from pathlib import Path

from PIL import Image

from ark_image_helper import generate_cover_image

REPO_ROOT = Path(__file__).resolve().parents[1]
BLOG_POSTS_DIR = REPO_ROOT / "public" / "blog-posts"
QUEUE_FILE = REPO_ROOT / "scripts" / "queue.json"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"

DEFAULT_SINCE = "2026-04-06"
DEFAULT_UNTIL = "2026-04-26"
DEFAULT_SATURATION_THRESHOLD = 0.19
DEFAULT_LIGHTNESS_THRESHOLD = 0.82

IMAGE_PROMPTS = {
    "保胆": "彩色医学科普封面，主题为术前保胆评估与医生门诊沟通，可出现医生与患者交流、检查资料说明、安心决策与恢复规划场景",
    "胆囊炎": "彩色医学科普封面，主题为胆囊炎恢复期饮食与日常护理，可出现清淡家常饮食、休息恢复、补水与轻松生活场景",
    "胆囊结石": "彩色医学科普封面，主题为胆囊结石患者的日常饮食管理与门诊咨询，可出现医生沟通、健康餐桌、家庭生活方式调整场景",
    "胆囊切除术后营养": "彩色医学营养封面，主题为胆囊切除术后饮食恢复与营养管理，可出现均衡清淡饮食、家中恢复、散步与食材准备场景",
    "default": "彩色肝胆健康医学科普封面，可出现医生沟通、健康饮食、恢复生活方式等安全场景，整体温暖专业",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Regenerate recent monochrome blog covers in color.")
    parser.add_argument("--since", default=DEFAULT_SINCE)
    parser.add_argument("--until", default=DEFAULT_UNTIL)
    parser.add_argument("--saturation-threshold", type=float, default=DEFAULT_SATURATION_THRESHOLD)
    parser.add_argument("--lightness-threshold", type=float, default=DEFAULT_LIGHTNESS_THRESHOLD)
    parser.add_argument("--max-posts", type=int, default=20)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def image_metrics(path: Path) -> tuple[float, float]:
    img = Image.open(path).convert("RGB").resize((256, 256))
    sats = []
    lights = []
    for r, g, b in img.getdata():
        _, lightness, saturation = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        sats.append(saturation)
        lights.append(lightness)
    return statistics.fmean(sats), statistics.fmean(lights)


def should_regenerate(path: Path, sat_threshold: float, light_threshold: float) -> tuple[bool, float, float]:
    saturation, lightness = image_metrics(path)
    is_monochrome = saturation < sat_threshold and lightness > light_threshold
    return is_monochrome, saturation, lightness


def build_prompt(category: str, title: str, second_pass: bool = False) -> str:
    prompt = IMAGE_PROMPTS.get(category, IMAGE_PROMPTS["default"])
    title = " ".join((title or "").split()).strip()
    if title:
        prompt += f"。具体聚焦《{title}》"
    if second_pass:
        prompt += "。强调清晰可见的绿色、金色、蓝色或暖橙色层次，避免大面积白背景，避免黑白线稿观感。"
    return prompt


def resolve_image_path(image_url: str) -> Path:
    clean = image_url.strip()
    if clean.startswith("/images/"):
        return REPO_ROOT / "public" / clean.lstrip("/")
    return REPO_ROOT / clean.lstrip("/")


def parse_frontmatter(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    lines = text.splitlines()
    data = {}
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        data[key.strip()] = value.strip()
    return data


def collect_posts(since: str, until: str) -> list[dict]:
    posts_by_slug: dict[str, dict] = {}

    if QUEUE_FILE.exists():
        queue = json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
        for post in queue.get("posts", []):
            publish_date = str(post.get("publish_date", ""))
            if since <= publish_date <= until:
                slug = str(post.get("slug", "")).strip()
                if slug:
                    posts_by_slug[slug] = dict(post)

    for path in sorted(BLOG_POSTS_DIR.glob("2026*.md")):
        if path.name.endswith("-en.md"):
            continue
        meta = parse_frontmatter(path)
        publish_date = str(meta.get("date", "")).strip()
        if not (since <= publish_date <= until):
            continue
        slug = path.stem
        posts_by_slug[slug] = {
            "slug": slug,
            "publish_date": publish_date,
            "title": str(meta.get("title", "")).strip(),
            "category": str(meta.get("category", "")).strip(),
            "imageUrl": str(meta.get("image", "")).strip(),
        }

    return sorted(posts_by_slug.values(), key=lambda item: item.get("publish_date", ""))


def main() -> int:
    args = parse_args()
    api_key = (os.getenv("ARK_API_KEY") or "").strip()
    if not api_key and not args.dry_run:
        raise SystemExit("Missing ARK_API_KEY")

    posts = collect_posts(args.since, args.until)
    selected = []

    for post in posts:
        publish_date = str(post.get("publish_date", ""))
        image_url = str(post.get("imageUrl", ""))
        if not (args.since <= publish_date <= args.until):
            continue
        if not image_url.startswith("/images/blog/blog-2026"):
            continue
        img_path = resolve_image_path(image_url)
        if not img_path.exists() or img_path.suffix.lower() != ".png":
            continue
        should, saturation, lightness = should_regenerate(img_path, args.saturation_threshold, args.lightness_threshold)
        if not should:
            continue
        selected.append((post, img_path, saturation, lightness))

    selected.sort(key=lambda item: item[0].get("publish_date", ""))
    selected = selected[: args.max_posts]

    if not selected:
        print("[OK] No monochrome covers matched the current threshold.")
        return 0

    print(f"[INFO] Selected {len(selected)} covers for regeneration")
    replaced = 0
    for post, img_path, saturation, lightness in selected:
        title = str(post.get("title", "")).strip()
        category = str(post.get("category", "")).strip()
        slug = str(post.get("slug", "")).strip()
        print(f"\n[POST] {post.get('publish_date')} {slug}")
        print(f"[BEFORE] saturation={saturation:.4f} lightness={lightness:.4f} {img_path.name}")
        if args.dry_run:
            continue

        fallback_path = str(post.get("imageUrl", "")).strip()
        for pass_index in range(2):
            prompt = build_prompt(category, title, second_pass=(pass_index == 1))
            image_url = generate_cover_image(
                slug=slug,
                images_dir=IMAGES_DIR,
                fallback_path=fallback_path,
                base_prompt=prompt,
                api_key=api_key,
            )
            if image_url != fallback_path:
                print(f"[WARN] Image path changed unexpectedly: {image_url}")
            new_saturation, new_lightness = image_metrics(img_path)
            print(f"[AFTER pass {pass_index + 1}] saturation={new_saturation:.4f} lightness={new_lightness:.4f}")
            if new_saturation >= args.saturation_threshold or new_lightness <= args.lightness_threshold:
                replaced += 1
                break

    print(f"\n[OK] Replaced or refreshed {replaced} cover images")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
