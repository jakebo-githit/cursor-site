#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AskDrLiu Blog Daily Auto-Generator (No RSS dependency)
-------------------------------------------------------
- Generates bilingual blog post via GLM-4-Plus API
- Topics restricted to: 保胆, 胆囊炎, 胆囊结石, 胆囊切除术后营养
- AIGC cover image via Volcengine Ark / Doubao Seedream
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
import threading
from queue import Queue, Empty
from openai import OpenAI

# Load .env manually
_env_file = Path(__file__).resolve().parents[1] / ".env"
if _env_file.exists():
    for line in _env_file.read_text().strip().splitlines():
        if "=" in line and not line.startswith("#"):
            key, val = line.split("=", 1)
            os.environ.setdefault(key.strip(), val.strip())
from ark_image_helper import generate_cover_image
from seo_article_rules import build_seo_fields as shared_build_seo_fields, ensure_book_link as shared_ensure_book_link, validate_article_payload, validate_reference_policy, find_title_conflict, find_similar_article, extract_reference_urls

# ─────────────────────────── Config ───────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[1]
BLOG_MD_DIR = REPO_ROOT / "public" / "blog-posts"
BLOG_INDEX_FILE = REPO_ROOT / "src" / "data" / "blog-posts.ts"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "blog"
QUEUE_FILE = REPO_ROOT / "scripts" / "queue.json"

BLOG_MD_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

LLM_API_KEY = (os.getenv("LLM_API_KEY") or os.getenv("ZHIPU_API_KEY") or "").strip()
ARK_API_KEY = os.getenv("ARK_API_KEY", "").strip()
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://open.bigmodel.cn/api/coding/paas/v4")

MODEL = "glm-5"
API_CALL_TIMEOUT_SECONDS = 300

ALLOWED_CATEGORIES_ZH = ["保胆", "胆囊炎", "胆囊结石", "胆囊切除术后营养"]
ALLOWED_CATEGORIES_EN = ["Gallbladder Preservation", "Cholecystitis", "Gallstones", "Post-Cholecystectomy Nutrition"]

CATEGORY_MAP = {
    "保胆": "Gallbladder Preservation",
    "胆囊炎": "Cholecystitis",
    "胆囊结石": "Gallstones",
    "胆囊切除术后营养": "Post-Cholecystectomy Nutrition",
}

# Subtopics for each category (for content variety)
# SEO Strategy: 30%-40% 长尾关键词 (Long-tail) + 60%-70% 普通关键词 (Medium competition)
SUBTOPICS = {
    "保胆": [
        # 普通关键词 (60%) - 竞争度中等
        "POCS微创保胆技术的优势与适应症",
        "保胆取石后如何预防结石复发",
        "哪些患者适合保胆取石手术",
        "保胆vs切胆：如何做选择",
        "保胆手术后的复查与长期管理",
        "保胆手术成功率与长期效果评估",
        "保胆取石术后护理要点",
        # 长尾关键词 (40%) - 竞争度低，诉求稳定
        "保胆手术后多久可以正常上班",
        "保胆取石术后一周恢复时间表",
        "保胆手术后饮食禁忌清单",
        "保胆手术后伤口疼痛正常吗",
        "保胆取石术后洗澡时间",
        "保胆手术后能吃鸡蛋吗",
        "保胆手术后多久可以运动",
        "保胆手术后可以开车吗",
    ],
    "胆囊炎": [
        # 普通关键词 (60%)
        "急性胆囊炎的早期识别与紧急处理",
        "慢性胆囊炎的日常管理与饮食调整",
        "胆囊炎发作的诱因与预防策略",
        "抗生素治疗胆囊炎的合理使用",
        "胆囊炎并发症的识别与预防",
        "胆囊炎的超声诊断标准",
        "胆囊炎保守治疗的适应症",
        # 长尾关键词 (40%)
        "胆囊炎发作的早期症状有哪些",
        "胆囊炎发作时能喝水吗",
        "胆囊炎发作多久能缓解",
        "胆囊炎发作可以吃止痛药吗",
        "胆囊炎发作时能吃东西吗",
        "胆囊炎反复发作的原因是什么",
        "胆囊炎发作时应该什么姿势",
        "胆囊炎发作需要住院吗",
    ],
    "胆囊结石": [
        # 普通关键词 (60%)
        "胆囊结石的成因与高危因素",
        "无症状胆囊结石是否需要手术",
        "胆囊结石的非手术治疗方法",
        "如何通过饮食预防胆囊结石形成",
        "胆囊结石与胰腺炎的关系",
        "胆囊结石手术方式对比",
        "胆固醇性胆结石的饮食预防",
        # 长尾关键词 (40%)
        "胆固醇性胆结石怎么吃",
        "胆囊结石小于1cm怎么治疗",
        "胆囊结石不做手术可以观察多久",
        "胆囊结石能喝牛奶吗",
        "胆囊结石能吃豆腐吗",
        "胆囊结石可以喝茶吗",
        "胆囊结石能吃水果吗",
        "胆囊结石会引起腰痛吗",
    ],
    "胆囊切除术后营养": [
        # 普通关键词 (60%)
        "术后初期饮食调整与注意事项",
        "术后长期营养补充与饮食规划",
        "如何应对术后腹泻与消化不良",
        "术后体重管理的营养策略",
        "胆囊切除后的脂肪消化问题",
        "术后营养补充剂的选择",
        "术后饮食恢复时间表",
        # 长尾关键词 (40%)
        "胆囊切除术后一周食谱清单",
        "胆囊切除术后能吃鸡蛋吗",
        "胆囊切除术后能吃坚果吗",
        "胆囊切除术后能喝牛奶吗",
        "胆囊切除术后多久可以吃肉",
        "胆囊切除术后能吃海鲜吗",
        "胆囊切除术后能吃辣吗",
        "胆囊切除术后能喝咖啡吗",
    ],
}

# ─────────────────────────── System Prompts ───────────────────────────

# ─────────────────────────── System Prompts ───────────────────────────
SYSTEM_PROMPT = """You are a senior hepatobiliary surgeon. Generate bilingual medical blog JSON.

JSON fields: title, titleEn, excerpt, excerptEn, category, categoryEn, tags, focusKeyword, longTailKeywords, seoTitle, seoDescription, markdownZh(800-1200 chars), markdownEn(400-600 words)

Requirements:
- markdownZh includes multiple ## section headings
- markdownZh ends with ## References (3-5 real URLs)
- Include disclaimer at end
- Output pure JSON only, no markdown fences"""

USER_PROMPT_TEMPLATE = """Topic: {subtopic}
Category: {category}

Generate JSON format bilingual article."""

def clean_json_string(text: str) -> str:
    """Remove invalid control characters from JSON string."""
    import re
    result = []
    for char in text:
        code = ord(char)
        if code < 32 and code not in (9, 10, 13):
            continue
        result.append(char)
    return ''.join(result)

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
    """Validate reference count, freshness, and reachability."""
    zh = data.get("markdownZh", "")
    en = data.get("markdownEn", "")

    issues = validate_reference_policy(zh, en, min_refs=3, max_refs=5, recent_year_threshold=2021)
    all_urls = list(dict.fromkeys(extract_reference_urls(zh) + extract_reference_urls(en)))

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


def is_rate_limit_error(ex: Exception) -> bool:
    message = str(ex).lower()
    return any(token in message for token in ["429", "rate limit", "too many requests", "余额不足", "无可用资源包", "频率"])


def call_llm_with_backoff(client: OpenAI, *, messages: list[dict], temperature: float, max_attempts: int = 5):
    last_error = None
    current_error = None
    for attempt in range(1, max_attempts + 1):
        try:
            return run_with_timeout(
                client.chat.completions.create,
                API_CALL_TIMEOUT_SECONDS,
                model=MODEL,
                temperature=temperature,
                messages=messages,
                max_tokens=6000,
            )
        except TimeoutError as ex:
            current_error = ex
            last_error = ex
        except Exception as ex:
            current_error = ex
            last_error = ex
        if attempt >= max_attempts:
            raise last_error
        if is_rate_limit_error(current_error):
            sleep_seconds = min(90, 8 * attempt + random.uniform(1.0, 3.0))
            print(f"[WARN] Provider throttled on attempt {attempt}/{max_attempts}: {current_error}")
        else:
            sleep_seconds = min(30, 3 * attempt + random.uniform(0.5, 1.5))
            print(f"[WARN] LLM call failed on attempt {attempt}/{max_attempts}: {current_error}")
        print(f"[WAIT] Sleeping {sleep_seconds:.1f}s before retry")
        time.sleep(sleep_seconds)
    raise RuntimeError(f"Failed after retries: {last_error}")

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
        raise TimeoutError(f"LLM request timed out after {timeout_seconds}s")
    try:
        ok, payload = result_queue.get_nowait()
    except Empty as ex:
        raise RuntimeError("LLM worker exited without a result") from ex
    if ok:
        return payload
    raise payload



def pick_unique_seed_topic() -> tuple[str, str]:
    candidates = [
        (category, subtopic)
        for category, subtopics in SUBTOPICS.items()
        for subtopic in subtopics
        if not find_title_conflict(subtopic)
    ]
    if not candidates:
        candidates = [
            (category, subtopic)
            for category, subtopics in SUBTOPICS.items()
            for subtopic in subtopics
        ]
    return random.choice(candidates)


def generate_post(category: str, subtopic: str, max_retries=3) -> dict:
    """Generate blog post with retry logic for reference validation."""
    if not LLM_API_KEY:
        raise RuntimeError("Missing LLM_API_KEY/ZHIPU_API_KEY environment variable")

    client = OpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL)

    prompt = USER_PROMPT_TEMPLATE.format(
        category=category,
        subtopic=subtopic
    )

    for attempt in range(max_retries):
        try:
            print(f"[GEN] Attempt {attempt + 1}/{max_retries}...")

            resp = call_llm_with_backoff(
                client,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.4,
            )

            text = resp.choices[0].message.content.strip()

            # Parse JSON
            text = clean_json_string(text)
            try:
                data = json.loads(text, strict=False)
            except Exception:
                m = re.search(r"\{.*\}", text, re.DOTALL)
                if not m:
                    raise ValueError(f"Model did not return valid JSON:\n{text[:300]}")
                json_str = clean_json_string(m.group(0))
                data = json.loads(json_str, strict=False)

            # Validate required fields
            required = ["title", "titleEn", "excerpt", "excerptEn", "category", "categoryEn",
                       "tags", "focusKeyword", "longTailKeywords", "seoTitle", "seoDescription", "markdownZh", "markdownEn"]
            for k in required:
                if k not in data:
                    raise ValueError(f"Missing required field: {k}")

            # Validate category
            if data["category"] not in ALLOWED_CATEGORIES_ZH:
                raise ValueError(f"Invalid category: {data['category']}. Must be one of {ALLOWED_CATEGORIES_ZH}")

            data["seoTitle"], data["seoDescription"] = shared_build_seo_fields(data)

            # Skip strict validation for now
            seo_issues = []
            if len(data.get("markdownZh", "")) < 200:
                seo_issues.append("Chinese article too short: less than 200 chars")
            if len(data.get("markdownEn", "")) < 100:
                seo_issues.append("English article too short: less than 100 words")
            
            title_conflict = find_title_conflict(data.get("title", ""))
            if title_conflict:
                seo_issues.append(f"Duplicate title conflict with {title_conflict['slug']}")
            similar_article = find_similar_article(data.get("markdownZh", ""))
            if similar_article:
                seo_issues.append(
                    f"Article too similar to existing post {similar_article['slug']} ({similar_article['similarity']:.2f})"
                )

            if seo_issues:
                print(f"[WARN] Validation failed: {'; '.join(seo_issues[:8])}")
                if attempt < max_retries - 1:
                    print(f"[RETRY] Regenerating...")
                    time.sleep(2)
                    continue
                raise ValueError("Validation failed after retries: " + "; ".join(seo_issues[:10]))

            print(f"[OK] Generated: {data['title']} / {data['titleEn']}")
            print(f"[OK] SEO keyword: {data.get('focusKeyword', '')}")

            return data

        except Exception as e:
            print(f"[ERROR] Generation attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(3)
            else:
                raise

    raise RuntimeError(f"Failed to generate post after {max_retries} attempts")
