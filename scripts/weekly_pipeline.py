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

import os, re, json, random, string, requests, feedparser, warnings, hashlib
from datetime import datetime, timedelta
from pathlib import Path

warnings.filterwarnings("ignore")
from zhipuai import ZhipuAI
from ark_image_helper import generate_cover_image
from seo_article_rules import build_seo_fields as shared_build_seo_fields, ensure_book_link as shared_ensure_book_link, validate_article_payload, validate_reference_policy, find_title_conflict, find_similar_article

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
ARK_API_KEY = os.getenv("ARK_API_KEY", "")
TG_TOKEN    = os.getenv("TELEGRAM_BOT_TOKEN", "")
TG_CHAT_ID  = os.getenv("TELEGRAM_CHAT_ID", "1094807201")

# ─── 模型 ────────────────────────────────────────────────
GLM_MODEL   = "glm-5"
GLM_FALLBACK= "glm-4-plus"

# ─── RSS 来源 ─────────────────────────────────────────────
FEED_URLS = [
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=gallbladder+stone+cholecystitis&format=rss&limit=30",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=cholecystectomy+postoperative+nutrition&format=rss&limit=30",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=gallbladder+preservation+cholelithiasis&format=rss&limit=25",
    "https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=liver+health+longevity&format=rss&limit=20",
    "https://www.sciencedaily.com/rss/health_medicine/gallbladder_disease.xml",
    "https://www.sciencedaily.com/rss/health_medicine/liver_disease.xml",
]

REDDIT_SUBS = ["gallbladders", "liver"]

FOCUS_TERMS = [
    "gallbladder", "gallstone", "cholelithiasis", "cholecystitis", "cholecystectomy",
    "post-cholecystectomy", "bile", "biliary", "liver", "hepatic", "pocs",
]

IMAGE_PROMPTS = {
    "胆囊结石": "黑白漫画风格医学科普封面，主题为胆囊结石患者的日常饮食管理与门诊咨询，画面干净明亮、安心专业，可出现医生沟通、健康饮食、轻松生活方式",
    "胆囊炎": "黑白漫画风格医学科普封面，主题为胆囊炎恢复期饮食与日常护理，画面干净明亮、温和安心，可出现清淡家常饮食、休息恢复、轻松生活场景",
    "保胆": "黑白漫画风格医学科普封面，主题为术前保胆评估与医生门诊沟通，画面干净明亮、专业可信，可出现医生与患者交流、检查资料说明、安心决策场景",
    "胆囊切除术后营养": "黑白漫画风格医学科普封面，主题为胆囊切除术后饮食恢复与营养管理，画面干净明亮、安心专业，可出现均衡清淡饮食、家中恢复、散步等日常生活方式",
    "胆囊与长寿": "黑白漫画风格医学科普封面，主题为胆囊代谢健康与积极生活方式，画面干净明亮、轻松自然，可出现步行、轻运动、规律生活场景",
    "肝脏健康": "黑白漫画风格医学科普封面，主题为肝胆健康与日常保养，画面干净明亮、专业可信，可出现健康饮食、规律生活、门诊健康教育场景",
    "default": "黑白漫画风格肝胆健康医学科普封面，画面干净明亮、专业可信，可出现医生沟通、健康饮食、恢复生活方式等安全场景",
}


# ─── 1. 抓取话题 ──────────────────────────────────────────
def is_focus_entry(title: str, summary: str) -> bool:
    text = f"{title} {summary}".lower()
    return any(k in text for k in FOCUS_TERMS)


def fetch_rss_entries():
    entries = []
    for url in FEED_URLS:
        try:
            d = feedparser.parse(url, request_headers={"User-Agent": "AskDrLiu/1.0"})
            for e in d.entries[:15]:
                title   = (e.get("title") or "").strip()
                link    = (e.get("link") or "").strip()
                summary = re.sub(r"\s+", " ", (e.get("summary") or "").strip())[:500]
                if title and link and is_focus_entry(title, summary):
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
                if title and score > 50 and is_focus_entry(title, d.get("selftext", "")):
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

以下是本周抓取的医学资讯和患者热点讨论（共{total}条），请从中挑选**最适合科普写作且具备中文长尾搜索价值的7个话题**。

选题标准（严格）：
1. 仅限肝脏及胆囊健康，优先以下方向：保胆、胆囊炎、胆囊结石、胆囊切除术后营养、胆囊与健康长寿关联
2. 与上述方向无关的内容（泛营养、泛养生、非肝胆系统）一律剔除
3. 有医学文献支撑或患者真实痛点
4. 话题多样，不重复同一主题，不得与站内已有文章标题重复或高度相似
5. 优先选择可以自然延伸出“怎么办”“不能吃什么”“饮食怎么调”“多久恢复”“什么时候就医”等长尾搜索表达的话题
6. 优先采用近5年内仍有临床参考价值的新研究或新指南，不要堆太多文献

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
    "category": "保胆|胆囊炎|胆囊结石|胆囊切除术后营养|胆囊与长寿|肝脏健康"
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
- 选题边界严格限定在肝脏/胆囊健康（保胆、胆囊炎、胆囊结石、胆囊切除术后营养、胆囊与长寿关联）
- 基于提供来源，不捏造研究结论
- 每篇聚焦1个核心搜索意图，标题与首段必须围绕该意图
- 字数2200-3600中文，不能像短 FAQ
- 必须符合 SEO 写作：标题直指核心搜索意图，首段 80-120 字内出现主关键词，H2 小标题尽量采用搜索式问题句
- 正文至少自然包含 2-4 个长尾搜索表达，如“怎么办”“不能吃什么”“饮食怎么调”“多久恢复”“什么时候就医”
- 不得出现具体医院名称、具体科室名称、机构宣传口吻
- 不得插入联盟产品、导购清单或强销售内容
- 允许文末以“延伸阅读”方式推荐 Kindle 电子书，但语气必须克制
- 参考文献控制在 3-5 条，优先选近5年内的新研究或新指南
- 结构：引子(H1后首段含核心关键词) → 机制/背景(H2) → 研究证据(H2) → 实用建议(3-5条，H2) → 就医指征(H2) → 常见问题FAQ(2-3问，H2) → 参考文献 → 免责声明
- 至少包含 2 个站内相对链接，如 /blog /faq /assessment /contact
- 正文中至少包含2-3个站内相对链接（如 /blog /clinic /assessment）
- 文末必须包含：
  ⚠️ 免责声明：本文仅供医学科普参考，不构成个人诊疗建议。如您有相关症状或疑虑，请及时就诊于正规医疗机构，遵从医生的专业指导。
只输出 Markdown 正文，不要JSON，不要代码块。"""

ARTICLE_USER = """话题：{title_zh}
来源标题：{source_title}
来源链接：{source_url}
分类：{category}

请写一篇可直接发布的中文医学博客文章，并同时兼顾 SEO、患者可读性和个人品牌网站定位。"""

CATEGORY_EN_MAP = {
    "保胆": "Gallbladder Preservation",
    "胆囊炎": "Cholecystitis",
    "胆囊结石": "Gallstones",
    "胆囊切除术后营养": "Post-Cholecystectomy Nutrition",
    "胆囊与长寿": "Gallbladder & Longevity",
    "肝脏健康": "Liver Health",
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
        "category": topic.get("category", "胆囊结石"),
        "categoryEn": CATEGORY_EN_MAP.get(topic.get("category", "胆囊结石"), "Gallstones"),
        "focusKeyword": title,
        "longTailKeywords": [],
        "markdown": markdown,
        "model_used": model_used,
    }


# ─── 4. 生成 AIGC 配图 ──────────────────────────────────
def generate_image(category, slug):
    fallback = {
        "保胆": "/images/pocs-surgery.jpg",
        "胆囊炎": "/images/gallstone-prevention.jpg",
        "胆囊结石": "/images/gallstone-prevention.jpg",
        "胆囊切除术后营养": "/images/recovery-guide.jpg",
        "胆囊与长寿": "/images/dietary-guidance.jpg",
        "肝脏健康": "/images/liver-health.jpg",
    }
    return generate_cover_image(
        slug=slug,
        images_dir=IMAGES_DIR,
        fallback_path=fallback.get(category, "/images/pocs-surgery.jpg"),
        base_prompt=IMAGE_PROMPTS.get(category, IMAGE_PROMPTS["default"]),
        api_key=ARK_API_KEY,
    )




# ─── 5. 保存草稿 ─────────────────────────────────────────
def make_slug(title):
    clean = re.sub(r"[^\w\s-]", "", title, flags=re.UNICODE)
    clean = re.sub(r"\s+", "-", clean.strip()).lower().strip("-")[:60]
    if not clean:
        clean = "post"
    base = clean
    path = DRAFTS_DIR / f"{base}.md"
    if path.exists():
        tail = hashlib.md5(title.encode("utf-8")).hexdigest()[:6]
        base = f"{base}-{tail}"
    return base


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
            data["seoTitle"], data["seoDescription"] = shared_build_seo_fields(data)
            seo_issues = validate_article_payload(
                {**data, "markdownZh": data["markdown"], "markdownEn": ""},
                allowed_categories=list(CATEGORY_EN_MAP.keys()),
                category_map=CATEGORY_EN_MAP,
                min_zh_chars=2200,
                min_en_words=0,
                require_keyword_fields=False,
                require_internal_links=True,
            )
            seo_issues.extend(validate_reference_policy(data["markdown"], "", min_refs=3, max_refs=5, recent_year_threshold=2021))
            title_conflict = find_title_conflict(data.get("title", ""))
            if title_conflict:
                seo_issues.append(f"Duplicate title conflict with {title_conflict['slug']}")
            similar_article = find_similar_article(data.get("markdown", ""))
            if similar_article:
                seo_issues.append(
                    f"Article too similar to existing post {similar_article['slug']} ({similar_article['similarity']:.2f})"
                )
            if seo_issues:
                raise ValueError("SEO validation failed: " + "; ".join(seo_issues[:8]))
            slug = make_slug(topic["title_zh"])
            
            # 生成配图
            image_url = generate_image(topic["category"], slug)
            
            # 保存草稿
            path = save_draft(slug, data, image_url, topic["source_url"], publish_date)
            print(f"  [Draft] {path}")
            
            seo_title, seo_desc = shared_build_seo_fields(data)
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
                "seoTitle": seo_title,
                "seoDescription": seo_desc,
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
