#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Weekly Blog Pipeline for AskDrLiu / cursor-site
------------------------------------------------
运行时机：每周日 08:00 (北京时间)
功能：
  1. 从 PubMed RSS + Reddit + 搜索 抓取话题
  2. 用 GLM-5 筛选 7 个最优话题
  3. 批量生成 7 篇草稿（正文 + Seedream 5.0 配图）
  4. 写入发布队列 scripts/queue.json
  5. 通过 Telegram 推送话题清单供用户审核
"""

import os, re, json, random, string, requests, feedparser, warnings
from datetime import datetime, timedelta
from pathlib import Path

warnings.filterwarnings("ignore")
from zhipuai import ZhipuAI
from openai import OpenAI

# ─── 路径 ───────────────────────────────────────────────
REPO_ROOT   = Path(__file__).resolve().parents[1]
DRAFTS_DIR  = REPO_ROOT / "public" / "blog-posts" / "drafts"
IMAGES_DIR  = REPO_ROOT / "public" / "images" / "blog"
QUEUE_FILE  = REPO_ROOT / "scripts" / "queue.json"
INDEX_FILE  = REPO_ROOT / "src" / "data" / "blog-posts.ts"

DRAFTS_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# ─── API Keys ───────────────────────────────────────────
ZHIPU_KEY   = os.getenv("ZHIPU_API_KEY", "")
ARK_KEY     = os.getenv("ARK_API_KEY", "")
TG_TOKEN    = os.getenv("TELEGRAM_BOT_TOKEN", "")
TG_CHAT_ID  = os.getenv("TELEGRAM_CHAT_ID", "1094807201")

# ─── 模型 ────────────────────────────────────────────────
GLM_MODEL   = "glm-5"
GLM_FALLBACK= "glm-4-plus"
ARK_MODEL   = "doubao-seedream-5-0-260128"
ARK_BASE    = "https://ark.cn-beijing.volces.com/api/v3"

# ─── RSS 来源 ─────────────────────────────────────────────
FEED_URLS = [
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=gallbladder&format=rss&limit=20",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=cholecystectomy+diet&format=rss&limit=20",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=longevity+nutrition&format=rss&limit=15",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=liver+health+diet&format=rss&limit=15",
    "https://www.sciencedaily.com/rss/health_medicine/gallbladder_disease.xml",
    "https://www.sciencedaily.com/rss/health_medicine/nutrition.xml",
]

REDDIT_SUBS = ["gallbladders", "liver", "nutrition", "longevity"]

IMAGE_PROMPTS = {
    "胆囊健康": "医学科普插图，胆囊健康主题，蓝绿色调，专业简洁，无文字，高清写实风",
    "肝脏健康": "医学健康主题，肝脏保健，绿色自然色调，温暖阳光，无文字，高清",
    "长寿饮食": "长寿健康生活方式，新鲜蔬果，地中海饮食风格，明亮自然光，无文字，高清",
    "营养科学": "健康营养饮食，丰富蔬菜水果，明亮色彩，俯拍平铺，无文字，高清",
    "术后康复": "术后康复健康主题，温暖医疗环境，积极正能量色调，无文字，高清",
    "default":  "医学健康科普，专业温暖，蓝白色调，现代简约，无文字，高清",
}


# ─── 1. 抓取话题 ──────────────────────────────────────────
def fetch_rss_entries():
    entries = []
    for url in FEED_URLS:
        try:
            d = feedparser.parse(url, request_headers={"User-Agent": "AskDrLiu/1.0"})
            for e in d.entries[:15]:
                title   = (e.get("title") or "").strip()
                link    = (e.get("link") or "").strip()
                summary = re.sub(r"\s+", " ", (e.get("summary") or "").strip())[:500]
                if title and link:
                    entries.append({"title": title, "link": link, "summary": summary, "source": "pubmed"})
        except Exception as ex:
            print(f"[WARN] RSS {url}: {ex}")
    print(f"[RSS] {len(entries)} entries")
    return entries


def fetch_reddit_entries():
    entries = []
    for sub in REDDIT_SUBS:
        try:
            url  = f"https://www.reddit.com/r/{sub}/hot.json?limit=10"
            resp = requests.get(url, headers={"User-Agent": "AskDrLiu/1.0"}, timeout=15)
            posts = resp.json().get("data", {}).get("children", [])
            for p in posts:
                d = p.get("data", {})
                title = d.get("title", "").strip()
                score = d.get("score", 0)
                if title and score > 50:
                    entries.append({
                        "title":   title,
                        "link":    f"https://reddit.com{d.get('permalink','')}",
                        "summary": d.get("selftext", "")[:300],
                        "source":  f"reddit/r/{sub}",
                        "score":   score,
                    })
        except Exception as ex:
            print(f"[WARN] Reddit r/{sub}: {ex}")
    print(f"[Reddit] {len(entries)} entries")
    return entries


# ─── 2. GLM-5 筛选 7 个话题 ───────────────────────────────
TOPIC_SELECT_PROMPT = """你是 AskDrLiu.com（肝胆外科医生刘波主任的科普网站）的内容策划。

以下是本周抓取的医学资讯和患者热点讨论（共{total}条），请从中挑选**最适合科普写作的7个话题**。

选题标准：
1. 与胆囊健康、肝脏健康、长寿饮食、营养科学、术后康复相关
2. 有医学文献支撑或患者真实痛点
3. 话题多样，不重复同一主题
4. 优先选择有争议性或实用价值高的话题

输入数据（JSON 数组）：
{entries_json}

输出格式（JSON 数组，7个元素）：
[
  {{
    "rank": 1,
    "title_zh": "中文选题标题（20字以内）",
    "reason": "选题理由（一句话）",
    "source_title": "原始标题",
    "source_url": "来源URL",
    "source_type": "pubmed|reddit|news",
    "category": "胆囊健康|肝脏健康|长寿饮食|营养科学|术后康复"
  }},
  ...
]
只输出 JSON，不要其他内容。"""


def _call_glm(messages, temperature=0.3):
    client = ZhipuAI(api_key=ZHIPU_KEY)
    # 优先 glm-5，失败回退 glm-4-plus
    for model in [GLM_MODEL, GLM_FALLBACK]:
        try:
            resp = client.chat.completions.create(
                model=model,
                temperature=temperature,
                messages=messages,
            )
            return resp.choices[0].message.content.strip(), model
        except Exception as ex:
            print(f"[WARN] model {model} failed: {ex}")
            continue
    raise RuntimeError("All GLM models failed")


def _extract_json_array(text: str):
    clean = re.sub(r"```json\s*|\s*```", "", text).strip()
    try:
        return json.loads(clean)
    except Exception:
        m = re.search(r"\[[\s\S]*\]", clean)
        if not m:
            raise
        return json.loads(m.group(0))


def select_topics(all_entries):
    if not ZHIPU_KEY:
        raise RuntimeError("Missing ZHIPU_API_KEY")

    sample = random.sample(all_entries, min(50, len(all_entries)))
    entries_json = json.dumps(
        [{"title": e["title"], "url": e["link"], "summary": e["summary"][:200], "source": e["source"]}
         for e in sample],
        ensure_ascii=False
    )

    text, model_used = _call_glm(
        [{"role": "user", "content": TOPIC_SELECT_PROMPT.format(total=len(sample), entries_json=entries_json)}],
        temperature=0.3,
    )
    topics = _extract_json_array(text)
    print(f"[Topics] Selected {len(topics)} topics by {model_used}")
    return topics[:10]


# ─── 3. 生成单篇草稿 ─────────────────────────────────────
ARTICLE_SYSTEM = """你是 AskDrLiu.com 医学团队的科普撰稿人。
写作规则：
- 基于提供来源，不捏造研究结论
- 字数1200-1800中文
- 结构：引子 → 机制/背景 → 研究证据 → 实用建议(3-5条) → 就医指征 → 参考文献 → 免责声明
- 文末必须包含：
  ⚠️ 免责声明：本文仅供医学科普参考，不构成个人诊疗建议。如您有相关症状或疑虑，请及时就诊于正规医疗机构，遵从医生的专业指导。
只输出 Markdown 正文，不要JSON，不要代码块。"""

ARTICLE_USER = """话题：{title_zh}
来源标题：{source_title}
来源链接：{source_url}
分类：{category}

请写一篇可直接发布的中文医学博客文章。"""

CATEGORY_EN_MAP = {
    "胆囊健康": "Gallbladder Health",
    "肝脏健康": "Liver Health",
    "长寿饮食": "Longevity & Diet",
    "营养科学": "Nutrition Science",
    "术后康复": "Post-Surgery Recovery",
}


def generate_article(topic):
    markdown, model_used = _call_glm(
        [
            {"role": "system", "content": ARTICLE_SYSTEM},
            {"role": "user", "content": ARTICLE_USER.format(**topic)},
        ],
        temperature=0.4,
    )
    markdown = markdown.strip()
    markdown = re.sub(r"^```markdown\s*|\s*```$", "", markdown).strip()

    title = topic["title_zh"].strip()[:40]
    plain = re.sub(r"[#>*`\-\[\]\(\)]", "", markdown)
    plain = re.sub(r"\s+", " ", plain).strip()
    excerpt = plain[:110]

    return {
        "title": title,
        "titleEn": title,
        "excerpt": excerpt,
        "excerptEn": excerpt[:150],
        "category": topic.get("category", "营养科学"),
        "categoryEn": CATEGORY_EN_MAP.get(topic.get("category", "营养科学"), "Nutrition Science"),
        "markdown": markdown,
        "model_used": model_used,
    }


# ─── 4. 生成 AIGC 配图 ──────────────────────────────────
def generate_image(category, slug):
    fallback = {
        "胆囊健康": "/images/gallstone-prevention.jpg",
        "肝脏健康": "/images/liver-health.jpg",
        "长寿饮食": "/images/dietary-guidance.jpg",
        "营养科学": "/images/dietary-guidance.jpg",
        "术后康复": "/images/recovery-guide.jpg",
    }
    if not ARK_KEY:
        return fallback.get(category, "/images/pocs-surgery.jpg")
    try:
        client = OpenAI(api_key=ARK_KEY, base_url=ARK_BASE)
        prompt = IMAGE_PROMPTS.get(category, IMAGE_PROMPTS["default"])
        resp = client.images.generate(
            model=ARK_MODEL, prompt=prompt, n=1, size="2048x2048", response_format="url"
        )
        img_url = resp.data[0].url
        img_data = requests.get(img_url, timeout=60).content
        fname = f"blog-{slug[:40]}.jpg"
        (IMAGES_DIR / fname).write_bytes(img_data)
        print(f"  [IMG] {fname}")
        return f"/images/blog/{fname}"
    except Exception as ex:
        print(f"  [WARN] Image failed: {ex}")
        return fallback.get(category, "/images/pocs-surgery.jpg")


# ─── 5. 保存草稿 ─────────────────────────────────────────
def make_slug(title):
    clean = re.sub(r"[^\w\s-]", "", title, flags=re.UNICODE)
    clean = re.sub(r"\s+", "-", clean.strip()).lower()[:40]
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=5))
    return f"{clean}-{suffix}" if clean else f"post-{suffix}"


def save_draft(slug, data, image_url, source_url, publish_date):
    today = datetime.now().strftime("%Y-%m-%d")
    header = f"""---
title: {data['title']}
titleEn: {data['titleEn']}
excerpt: {data['excerpt']}
excerptEn: {data['excerptEn']}
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
    path.write_text(header + data["markdown"].strip() + "\n", encoding="utf-8")
    return str(path)


# ─── 6. 写入发布队列 ─────────────────────────────────────
def write_queue(queue_entries):
    QUEUE_FILE.write_text(
        json.dumps({"updated": datetime.now().strftime("%Y-%m-%d"), "posts": queue_entries},
                   ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"[Queue] Written {len(queue_entries)} entries to {QUEUE_FILE}")


# ─── 7. Telegram 通知 ─────────────────────────────────────
def send_telegram(topics, queue_entries):
    if not TG_TOKEN:
        print("[WARN] No TELEGRAM_BOT_TOKEN, skipping notification")
        return
    lines = ["📚 本周博客话题（草稿已生成）\n"]
    for i, (t, q) in enumerate(zip(topics[:len(queue_entries)], queue_entries), 1):
        lines.append(f"{i}. {t['title_zh']} [{t['category']}]")
        lines.append(f"   计划发布：{q['publish_date']}")
    lines.append("\n✅ 默认按序自动发布")
    lines.append("如需调整，请在24小时内回复序号+指令")
    text = "\n".join(lines)
    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
            json={"chat_id": TG_CHAT_ID, "text": text},
            timeout=15
        )
        print(f"[TG] Sent: {resp.status_code}")
    except Exception as ex:
        print(f"[WARN] Telegram failed: {ex}")


# ─── Main ─────────────────────────────────────────────────
def main():
    print("=== Weekly Pipeline Start ===")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")

    # 1. 抓取话题
    rss_entries    = fetch_rss_entries()
    reddit_entries = fetch_reddit_entries()
    all_entries    = rss_entries + reddit_entries
    print(f"Total entries: {len(all_entries)}\n")

    # 2. GLM 筛选 7 个话题
    topics = select_topics(all_entries)

    # 3. 生成草稿 + 配图
    queue_entries = []
    # 发布日期：从下周一开始，每天一篇
    next_monday = datetime.now() + timedelta(days=(7 - datetime.now().weekday()))
    
    for i, topic in enumerate(topics):
        publish_date = (next_monday + timedelta(days=i)).strftime("%Y-%m-%d")
        print(f"\n[{i+1}/7] {topic['title_zh']} → {publish_date}")
        
        try:
            # 生成文章
            data = generate_article(topic)
            slug = make_slug(topic["title_zh"])
            
            # 生成配图
            image_url = generate_image(topic["category"], slug)
            
            # 保存草稿
            path = save_draft(slug, data, image_url, topic["source_url"], publish_date)
            print(f"  [Draft] {path}")
            
            queue_entries.append({
                "publish_date": publish_date,
                "slug": slug,
                "title": data["title"],
                "category": data["category"],
                "imageUrl": image_url,
                "excerpt": data["excerpt"],
                "excerptEn": data["excerptEn"],
                "titleEn": data["titleEn"],
                "categoryEn": data["categoryEn"],
                "status": "draft"
            })
        except Exception as ex:
            print(f"  [ERROR] {ex}")
            continue

    # 4. 写队列
    write_queue(queue_entries)

    # 5. Telegram 通知
    send_telegram(topics, queue_entries)

    print(f"\n=== Done: {len(queue_entries)}/7 drafts generated ===")


if __name__ == "__main__":
    main()
