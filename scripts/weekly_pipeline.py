#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Weekly Blog Pipeline for AskDrLiu / cursor-site
------------------------------------------------
运行时机：每周日 08:00 (北京时间)
功能：
  1. 从胆囊相关 RSS / Reddit 热点中筛选适合的题目
  2. 优先复用尚未发布的草稿，避免队列断档
  3. 补足未来 7 天的待发布草稿
  4. 写入发布队列 scripts/queue.json
  5. 通过 Telegram 推送未来发布计划
"""

import json
import os
import random
import re
import time
import warnings
from copy import deepcopy
from datetime import date, datetime, timedelta
from pathlib import Path
import threading
from queue import Queue, Empty

import feedparser
import requests
from openai import OpenAI

from ark_image_helper import generate_cover_image
from daily_auto_generate import SUBTOPICS as CURATED_SUBTOPICS
from generate_blog_auto import generate_post as generate_news_post
from seo_article_rules import (
    build_seo_fields as shared_build_seo_fields,
    ensure_book_link as shared_ensure_book_link,
    find_similar_article,
    find_title_conflict,
    validate_article_payload,
)

warnings.filterwarnings("ignore")

REPO_ROOT = Path(__file__).resolve().parents[1]
DRAFTS_DIR = REPO_ROOT / "public" / "blog-posts" / "drafts"
PUBLISH_DIR = REPO_ROOT / "public" / "blog-posts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"
QUEUE_FILE = REPO_ROOT / "scripts" / "queue.json"

DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

TEXT_API_KEY = (os.getenv("LLM_API_KEY") or os.getenv("ZHIPU_API_KEY") or "").strip()
ARK_API_KEY = os.getenv("ARK_API_KEY", "").strip()
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://open.bigmodel.cn/api/coding/paas/v4")
TG_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TG_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "1094807201").strip()

GLM_MODEL = "glm-5"
GLM_FALLBACK = "glm-4-plus"
TARGET_QUEUE_DEPTH = 7
MIN_QUEUE_DEPTH = 5
API_COOLDOWN_SECONDS = 6
API_CALL_TIMEOUT_SECONDS = 70

FEED_URLS = [
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=gallbladder+stone+cholecystitis&format=rss&limit=30",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=cholecystectomy+postoperative+nutrition&format=rss&limit=30",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=gallbladder+preservation+cholelithiasis&format=rss&limit=25",
    "https://www.sciencedaily.com/rss/health_medicine/gallbladder_disease.xml",
]
REDDIT_SUBS = ["gallbladders"]
FOCUS_TERMS = [
    "gallbladder",
    "gallstone",
    "cholelithiasis",
    "cholecystitis",
    "cholecystectomy",
    "post-cholecystectomy",
    "bile",
    "biliary",
    "pocs",
]
ALLOWED_CATEGORIES = ["保胆", "胆囊炎", "胆囊结石", "胆囊切除术后营养"]
CATEGORY_EN_MAP = {
    "保胆": "Gallbladder Preservation",
    "胆囊炎": "Cholecystitis",
    "胆囊结石": "Gallstones",
    "胆囊切除术后营养": "Post-Cholecystectomy Nutrition",
}
IMAGE_PROMPTS = {
    "保胆": "黑白漫画风格医学科普封面，主题为术前保胆评估与医生门诊沟通，画面干净明亮、专业可信，可出现医生与患者交流、检查资料说明、安心决策场景",
    "胆囊炎": "黑白漫画风格医学科普封面，主题为胆囊炎恢复期饮食与日常护理，画面干净明亮、温和安心，可出现清淡家常饮食、休息恢复、轻松生活场景",
    "胆囊结石": "黑白漫画风格医学科普封面，主题为胆囊结石患者的日常饮食管理与门诊咨询，画面干净明亮、安心专业，可出现医生沟通、健康饮食、轻松生活方式",
    "胆囊切除术后营养": "黑白漫画风格医学科普封面，主题为胆囊切除术后饮食恢复与营养管理，画面干净明亮、安心专业，可出现均衡清淡饮食、家中恢复、散步等日常生活方式",
    "default": "黑白漫画风格肝胆健康医学科普封面，画面干净明亮、专业可信，可出现医生沟通、健康饮食、恢复生活方式等安全场景",
}

def is_rate_limit_error(ex: Exception):
    message = str(ex).lower()
    return any(token in message for token in ["429", "rate limit", "too many requests", "余额不足", "无可用资源包", "频率"])

def run_with_timeout(func, timeout_seconds: int, /, *args, **kwargs):
    result_queue: Queue = Queue(maxsize=1)

    def worker():
        try:
            result_queue.put((True, func(*args, **kwargs)))
        except Exception as ex:
            result_queue.put((False, ex))

    thread = threading.Thread(target=worker, daemon=True)
    thread.start()
    thread.join(timeout_seconds)
    if thread.is_alive():
        raise TimeoutError(f"GLM request timed out after {timeout_seconds}s")
    try:
        ok, payload = result_queue.get_nowait()
    except Empty as ex:
        raise RuntimeError("GLM worker exited without a result") from ex
    if ok:
        return payload
    raise payload


TOPIC_SELECT_PROMPT = """你是 AskDrLiu.com 的中文医学选题编辑。

以下是本周抓取的医学资讯与患者热点，请你只挑选最适合 AskDrLiu.com 的题目。

严格要求：
1. 只允许以下方向：保胆评估、胆囊炎、胆囊结石、胆囊切除术后饮食与营养
2. 不要选择肝病、饮酒伤肝、长寿养生、泛营养、非胆囊主题
3. 标题要像真实搜索问题，适合后续写成患者教育长文
4. 不得与已有题目重复或高度相似
5. 优先保留近 5 年研究或指南能支持的话题

输入数据（JSON 数组）：
{entries_json}

输出 JSON 数组，最多 {limit} 个元素：
[
  {{
    "title_zh": "中文选题标题",
    "reason": "一句话说明为什么值得写",
    "source_title": "原始标题",
    "source_url": "来源 URL",
    "summary": "来源摘要",
    "category": "保胆|胆囊炎|胆囊结石|胆囊切除术后营养"
  }}
]
只输出 JSON，不要其他内容。"""


def is_focus_entry(title: str, summary: str) -> bool:
    text = f"{title} {summary}".lower()
    return any(term in text for term in FOCUS_TERMS)


def normalize_title(value: str) -> str:
    value = re.sub(r"\s+", " ", (value or "")).strip().lower()
    return re.sub(r"[^\w\u4e00-\u9fff]+", "", value)


def infer_category(title: str, summary: str) -> str:
    text = f"{title} {summary}".lower()
    if any(term in text for term in ["pocs", "preservation", "保胆"]):
        return "保胆"
    if any(term in text for term in ["cholecystitis", "胆囊炎"]):
        return "胆囊炎"
    if any(term in text for term in ["nutrition", "diet", "diarrhea", "post-cholecystectomy", "术后", "营养"]):
        return "胆囊切除术后营养"
    return "胆囊结石"


def fetch_rss_entries():
    entries = []
    for url in FEED_URLS:
        try:
            data = feedparser.parse(url, request_headers={"User-Agent": "AskDrLiu/1.0"})
            for entry in data.entries[:15]:
                title = (entry.get("title") or "").strip()
                link = (entry.get("link") or "").strip()
                summary = re.sub(r"\s+", " ", (entry.get("summary") or entry.get("description") or "").strip())[:500]
                if title and link and is_focus_entry(title, summary):
                    entries.append(
                        {
                            "title": title,
                            "link": link,
                            "summary": summary,
                            "source": "rss",
                            "category": infer_category(title, summary),
                        }
                    )
        except Exception as ex:
            print(f"[WARN] RSS {url}: {ex}")
    print(f"[RSS] {len(entries)} entries")
    return entries


def fetch_reddit_entries():
    entries = []
    for sub in REDDIT_SUBS:
        try:
            url = f"https://www.reddit.com/r/{sub}/hot.json?limit=10"
            resp = requests.get(url, headers={"User-Agent": "AskDrLiu/1.0"}, timeout=15)
            posts = resp.json().get("data", {}).get("children", [])
            for post in posts:
                data = post.get("data", {})
                title = (data.get("title") or "").strip()
                summary = (data.get("selftext") or "")[:300]
                if title and data.get("score", 0) > 30 and is_focus_entry(title, summary):
                    entries.append(
                        {
                            "title": title,
                            "link": f"https://reddit.com{data.get('permalink', '')}",
                            "summary": summary,
                            "source": f"reddit/r/{sub}",
                            "category": infer_category(title, summary),
                        }
                    )
        except Exception as ex:
            print(f"[WARN] Reddit r/{sub}: {ex}")
    print(f"[Reddit] {len(entries)} entries")
    return entries


def _call_glm(messages, temperature=0.3, max_attempts=4):
    if not TEXT_API_KEY:
        raise RuntimeError("Missing LLM_API_KEY/ZHIPU_API_KEY")

    client = OpenAI(api_key=TEXT_API_KEY, base_url=LLM_BASE_URL)
    last_error = None
    for attempt in range(1, max_attempts + 1):
        for model in [GLM_MODEL, GLM_FALLBACK]:
            try:
                resp = run_with_timeout(
                    client.chat.completions.create,
                    API_CALL_TIMEOUT_SECONDS,
                    model=model,
                    temperature=temperature,
                    messages=messages,
                    max_tokens=2500,
                )
                return resp.choices[0].message.content.strip(), model
            except TimeoutError as ex:
                last_error = TimeoutError(f"GLM request timed out after {API_CALL_TIMEOUT_SECONDS}s on {model}")
                print(f"[WARN] model {model} timed out on attempt {attempt}/{max_attempts}")
            except Exception as ex:
                last_error = ex
                print(f"[WARN] model {model} failed on attempt {attempt}/{max_attempts}: {ex}")
        if attempt < max_attempts:
            if is_rate_limit_error(last_error):
                sleep_seconds = min(90, 8 * attempt + random.uniform(1.0, 3.0))
            else:
                sleep_seconds = min(45, (2 ** attempt) + random.uniform(0.5, 1.5))
            print(f"[WAIT] Topic selection retry in {sleep_seconds:.1f}s")
            time.sleep(sleep_seconds)
    raise RuntimeError(f"All GLM models failed: {last_error}")


def _extract_json_array(text: str):
    clean = re.sub(r"```json\s*|\s*```", "", text).strip()
    try:
        return json.loads(clean)
    except Exception:
        match = re.search(r"\[[\s\S]*\]", clean)
        if not match:
            raise
        return json.loads(match.group(0))


def heuristically_select_topics(entries, limit, exclude_titles=None):
    exclude_titles = exclude_titles or set()
    selected = []
    seen_titles = set(exclude_titles)
    seen_categories = set()

    for entry in entries:
        title = normalize_title(entry["title"])
        if not title or title in seen_titles or find_title_conflict(entry["title"]):
            continue
        category = entry.get("category") or infer_category(entry["title"], entry.get("summary", ""))
        if category not in ALLOWED_CATEGORIES:
            continue
        if category in seen_categories and len(selected) >= limit:
            continue
        selected.append(
            {
                "title_zh": entry["title"][:28],
                "reason": "来源中有明确的患者问题或新近研究线索",
                "source_title": entry["title"],
                "source_url": entry["link"],
                "summary": entry.get("summary", ""),
                "category": category,
            }
        )
        seen_titles.add(title)
        seen_categories.add(category)
        if len(selected) >= limit:
            break
    return selected


def select_topics(all_entries, limit, exclude_titles=None):
    exclude_titles = exclude_titles or set()
    if not all_entries:
        return []

    sample = all_entries[: min(40, len(all_entries))]
    entries_json = json.dumps(
        [
            {
                "title": item["title"],
                "url": item["link"],
                "summary": item.get("summary", "")[:220],
                "source": item.get("source", "rss"),
                "category": item.get("category") or infer_category(item["title"], item.get("summary", "")),
            }
            for item in sample
        ],
        ensure_ascii=False,
    )

    try:
        text, model_used = _call_glm(
            [{"role": "user", "content": TOPIC_SELECT_PROMPT.format(entries_json=entries_json, limit=limit)}],
            temperature=0.2,
        )
        print(f"[Topics] Selected by {model_used}")
        raw_topics = _extract_json_array(text)
    except Exception as ex:
        print(f"[WARN] Topic selection fell back to heuristic mode: {ex}")
        return heuristically_select_topics(sample, limit, exclude_titles=exclude_titles)

    topics = []
    seen_titles = set(exclude_titles)
    for item in raw_topics:
        title = normalize_title(item.get("title_zh"))
        category = item.get("category") or infer_category(item.get("source_title", ""), item.get("summary", ""))
        if not title or title in seen_titles or category not in ALLOWED_CATEGORIES:
            continue
        if find_title_conflict(item.get("title_zh", "")):
            continue
        topics.append(
            {
                "title_zh": item.get("title_zh", "").strip()[:28],
                "reason": item.get("reason", "").strip(),
                "source_title": item.get("source_title", item.get("title_zh", "")).strip(),
                "source_url": item.get("source_url", "").strip(),
                "summary": item.get("summary", "").strip(),
                "category": category,
            }
        )
        seen_titles.add(title)
        if len(topics) >= limit:
            break

    if not topics:
        return heuristically_select_topics(sample, limit, exclude_titles=exclude_titles)
    return topics


def build_curated_fallback_topics(limit, exclude_titles=None):
    exclude_titles = exclude_titles or set()
    topics = []
    seen_titles = set(exclude_titles)

    for category in ALLOWED_CATEGORIES:
        for subtopic in CURATED_SUBTOPICS.get(category, []):
            normalized = normalize_title(subtopic)
            if not normalized or normalized in seen_titles or find_title_conflict(subtopic):
                continue
            topics.append(
                {
                    "title_zh": subtopic,
                    "reason": "使用已验证的胆囊主题作为稳妥补位选题",
                    "source_title": subtopic,
                    "source_url": "",
                    "summary": subtopic,
                    "category": category,
                    "fallback_seed": True,
                }
            )
            seen_titles.add(normalized)
            if len(topics) >= limit:
                return topics
    return topics


def draft_exists(slug: str) -> bool:
    return (DRAFTS_DIR / f"{slug}.md").exists()


def load_queue_posts():
    if not QUEUE_FILE.exists():
        return {"updated": datetime.now().strftime("%Y-%m-%d"), "posts": []}
    payload = json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
    if isinstance(payload, dict):
        payload.setdefault("updated", datetime.now().strftime("%Y-%m-%d"))
        payload.setdefault("posts", [])
        return payload
    return {"updated": datetime.now().strftime("%Y-%m-%d"), "posts": payload}


def split_queue_posts(posts):
    history = []
    reusable = []
    seen_slugs = set()

    for item in posts:
        if not isinstance(item, dict):
            continue
        entry = deepcopy(item)
        slug = (entry.get("slug") or "").strip()
        status = (entry.get("status") or "").strip().lower()
        if status in {"published", "failed"} or not slug:
            history.append(entry)
            continue
        if slug in seen_slugs:
            continue
        if draft_exists(slug):
            reusable.append(entry)
            seen_slugs.add(slug)
        else:
            entry["status"] = "failed"
            entry["error"] = "missing-draft"
            history.append(entry)
    return history, reusable


def future_publish_dates(count, *, start_date=None, used_dates=None):
    start_date = start_date or (date.today() + timedelta(days=1))
    used_dates = set(used_dates or set())
    dates = []
    current = start_date
    while len(dates) < count:
        label = current.strftime("%Y-%m-%d")
        if label not in used_dates:
            dates.append(label)
            used_dates.add(label)
        current += timedelta(days=1)
    return dates


def reassign_existing_drafts(entries, target_count):
    if not entries:
        return []
    sorted_entries = sorted(entries, key=lambda item: (item.get("publish_date") or "9999-99-99", item.get("slug") or ""))
    dates = future_publish_dates(min(target_count, len(sorted_entries)))
    reassigned = []
    for entry, publish_date in zip(sorted_entries, dates):
        cloned = deepcopy(entry)
        cloned["publish_date"] = publish_date
        cloned["status"] = "draft"
        cloned.pop("published_at", None)
        cloned.pop("error", None)
        reassigned.append(cloned)
    return reassigned


def make_slug(title):
    clean = re.sub(r"[^\w\s-]", "", title, flags=re.UNICODE)
    clean = re.sub(r"\s+", "-", clean.strip()).lower().strip("-")[:60]
    if not clean:
        clean = "post"
    base = clean
    path = DRAFTS_DIR / f"{base}.md"
    if path.exists() or (PUBLISH_DIR / f"{base}.md").exists():
        suffix = hex(abs(hash(title)) % (16 ** 6))[2:].zfill(6)
        base = f"{base}-{suffix}"
    return base


def normalize_generated_payload(payload, source_topic):
    markdown = payload.get("markdownZh") or payload.get("markdown") or ""
    return {
        "title": payload.get("title", source_topic["title_zh"]).strip(),
        "titleEn": payload.get("titleEn", payload.get("title", source_topic["title_zh"])).strip(),
        "excerpt": payload.get("excerpt", "").strip(),
        "excerptEn": payload.get("excerptEn", payload.get("excerpt", "")).strip(),
        "category": payload.get("category", source_topic.get("category", "胆囊结石")),
        "categoryEn": payload.get("categoryEn", CATEGORY_EN_MAP.get(payload.get("category", source_topic.get("category", "胆囊结石")), "Gallstones")),
        "focusKeyword": payload.get("focusKeyword", payload.get("title", source_topic["title_zh"])).strip(),
        "longTailKeywords": payload.get("longTailKeywords") or [],
        "markdown": markdown.strip(),
        "model_used": payload.get("model_used", "glm"),
    }


def generate_article(topic):
    source_title = topic.get("source_title") or topic["title_zh"]
    source_url = topic.get("source_url") or "https://www.askdrliu.com/blog"
    source_summary = topic.get("summary") or topic.get("reason") or topic["title_zh"]
    payload = generate_news_post(source_title, source_url, source_summary)
    return normalize_generated_payload(payload, topic)


def generate_image(category, slug):
    fallback = {
        "保胆": "/images/pocs-surgery.jpg",
        "胆囊炎": "/images/gallstone-prevention.jpg",
        "胆囊结石": "/images/gallstone-prevention.jpg",
        "胆囊切除术后营养": "/images/recovery-guide.jpg",
    }
    return generate_cover_image(
        slug=slug,
        images_dir=IMAGES_DIR,
        fallback_path=fallback.get(category, "/images/pocs-surgery.jpg"),
        base_prompt=IMAGE_PROMPTS.get(category, IMAGE_PROMPTS["default"]),
        api_key=ARK_API_KEY,
    )


def save_draft(slug, data, image_url, source_url, publish_date):
    seo_title, seo_desc = shared_build_seo_fields(data)
    header = f"""---
title: {data['title']}
titleEn: {data['titleEn']}
excerpt: {data['excerpt']}
excerptEn: {data['excerptEn']}
seoTitle: {seo_title}
seoDescription: {seo_desc}
date: {publish_date}
category: {data['category']}
categoryEn: {data['categoryEn']}
imageUrl: {image_url}
author: AskDrLiu.com
source: {source_url}
status: draft
---

"""
    path = DRAFTS_DIR / f"{slug}.md"
    body = shared_ensure_book_link(data["markdown"])
    path.write_text(header + body.strip() + "\n", encoding="utf-8")
    return str(path)


def write_queue(history_posts, future_posts):
    all_posts = history_posts + future_posts

    def sort_key(item):
        publish_date = item.get("publish_date") or item.get("published_at") or "9999-99-99"
        status_order = {"published": 0, "failed": 1, "draft": 2, "pending": 2}.get(item.get("status"), 3)
        return (publish_date, status_order, item.get("slug") or "")

    all_posts = sorted(all_posts, key=sort_key)
    QUEUE_FILE.write_text(
        json.dumps({"updated": datetime.now().strftime("%Y-%m-%d"), "posts": all_posts}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"[Queue] Updated with {len(future_posts)} future entries and {len(history_posts)} history entries")


def send_telegram(future_posts):
    if not TG_TOKEN or not future_posts:
        return
    lines = ["📚 下周博客发布计划\n"]
    for idx, item in enumerate(future_posts, 1):
        lines.append(f"{idx}. {item['title']} [{item['category']}]")
        lines.append(f"   计划发布：{item['publish_date']}")
    lines.append("\n✅ 若未手动调整，将按日期自动发布")
    text = "\n".join(lines)
    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
            json={"chat_id": TG_CHAT_ID, "text": text},
            timeout=15,
        )
        print(f"[TG] Sent: {resp.status_code}")
    except Exception as ex:
        print(f"[WARN] Telegram failed: {ex}")


def validate_generated_entry(data, slug):
    payload = {**data, "markdownZh": data["markdown"], "markdownEn": ""}
    issues = validate_article_payload(
        payload,
        allowed_categories=ALLOWED_CATEGORIES,
        category_map=CATEGORY_EN_MAP,
        min_zh_chars=2200,
        min_en_words=0,
        require_keyword_fields=True,
        require_internal_links=True,
    )
    title_conflict = find_title_conflict(data.get("title", ""), ignore_slugs={slug})
    if title_conflict:
        issues.append(f"Duplicate title conflict with {title_conflict['slug']}")
    similar_article = find_similar_article(data.get("markdown", ""), ignore_slugs={slug})
    if similar_article:
        issues.append(
            f"Article too similar to existing post {similar_article['slug']} ({similar_article['similarity']:.2f})"
        )
    if issues:
        raise ValueError("SEO validation failed: " + "; ".join(issues[:8]))


def main():
    print("=== Weekly Pipeline Start ===")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")

    rss_entries = fetch_rss_entries()
    reddit_entries = fetch_reddit_entries()
    all_entries = rss_entries + reddit_entries
    print(f"Total source entries: {len(all_entries)}")

    queue_payload = load_queue_posts()
    history_posts, reusable_posts = split_queue_posts(queue_payload.get("posts", []))
    future_posts = reassign_existing_drafts(reusable_posts, TARGET_QUEUE_DEPTH)
    future_titles = {normalize_title(item.get("title", "")) for item in future_posts if item.get("title")}

    need_count = max(0, TARGET_QUEUE_DEPTH - len(future_posts))
    topic_pool = []
    if need_count:
        topic_pool.extend(select_topics(all_entries, max(need_count * 2, 6), exclude_titles=future_titles))
        topic_pool.extend(
            build_curated_fallback_topics(
                max(need_count * 2, 6),
                exclude_titles=future_titles | {normalize_title(item.get("title_zh", "")) for item in topic_pool},
            )
        )

    publish_dates = future_publish_dates(TARGET_QUEUE_DEPTH)
    for idx, entry in enumerate(future_posts):
        entry["publish_date"] = publish_dates[idx]
        entry["status"] = "draft"

    next_date_index = len(future_posts)
    generated_count = 0

    for topic in topic_pool:
        if next_date_index >= TARGET_QUEUE_DEPTH:
            break
        print(f"\n[GEN {generated_count + 1}] {topic['title_zh']} → {publish_dates[next_date_index]}")
        try:
            data = generate_article(topic)
            slug = make_slug(data["title"])
            validate_generated_entry(data, slug)
            image_url = generate_image(data["category"], slug)
            save_draft(slug, data, image_url, topic.get("source_url", ""), publish_dates[next_date_index])
            seo_title, seo_desc = shared_build_seo_fields(data)
            future_posts.append(
                {
                    "publish_date": publish_dates[next_date_index],
                    "slug": slug,
                    "title": data["title"],
                    "category": data["category"],
                    "imageUrl": image_url,
                    "excerpt": data["excerpt"],
                    "excerptEn": data["excerptEn"],
                    "titleEn": data["titleEn"],
                    "categoryEn": data["categoryEn"],
                    "seoTitle": seo_title,
                    "seoDescription": seo_desc,
                    "status": "draft",
                }
            )
            generated_count += 1
            next_date_index += 1
            if next_date_index < TARGET_QUEUE_DEPTH:
                sleep_seconds = API_COOLDOWN_SECONDS + random.uniform(0.5, 1.5)
                print(f"[WAIT] Cooling down {sleep_seconds:.1f}s before next draft")
                time.sleep(sleep_seconds)
        except Exception as ex:
            print(f"  [ERROR] {ex}")
            continue

    write_queue(history_posts, future_posts)
    send_telegram(future_posts)

    future_count = len(future_posts)
    print(f"\n=== Done: {future_count} future drafts queued ({generated_count} newly generated) ===")
    if future_count < MIN_QUEUE_DEPTH:
        raise RuntimeError(f"Future draft queue too shallow: {future_count} < {MIN_QUEUE_DEPTH}")


if __name__ == "__main__":
    main()
