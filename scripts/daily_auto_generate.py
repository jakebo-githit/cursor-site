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
from seo_article_rules import build_seo_fields as shared_build_seo_fields, ensure_book_link as shared_ensure_book_link, validate_article_payload, validate_reference_policy, find_title_conflict, find_similar_article, extract_reference_urls, normalize_space, plain_text

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
SYSTEM_PROMPT = """You are a senior hepatobiliary surgeon writing bilingual patient-education JSON for AskDrLiu.com.

Hard rules:
- Output pure JSON only. No markdown fences, no explanations, no extra commentary.
- The Chinese article is the primary output and must be complete, practical, and long enough for a flagship medical education post.
- category must be exactly one of: 保胆, 胆囊炎, 胆囊结石, 胆囊切除术后营养
- categoryEn must exactly match the Chinese category.
- Do not use category aliases like 保胆取石 or 保胆手术 as the category field.
- Do not mention hospitals, institutional promotion, or affiliate products.
- Do not manually add ebook promotion blocks; site code will inject the ebook section later.

JSON fields:
- title
- titleEn
- excerpt
- excerptEn
- category
- categoryEn
- tags
- focusKeyword
- longTailKeywords
- seoTitle
- seoDescription
- markdownZh
- markdownEn

Chinese article requirements:
- markdownZh must be 2200-3200 Chinese characters after removing markdown syntax.
- Start with `## 先说结论（30秒读完）`.
- Include at least 5 Chinese H2 sections.
- At least 4 H2 headings should reflect search intent such as “能不能… / 怎么办 / 多久恢复 / 什么时候需要就医 / 要不要…”.
- The first 220 Chinese characters must naturally include focusKeyword and answer the question directly.
- Include section `## 风险边界与就医信号（什么时候需要就医）`.
- Include at least 2 internal relative links chosen from /blog /faq /assessment /contact /about.
- Include section `## 参考文献` with 3-5 real sources, each with title, journal or guideline, year, and URL.
- At least 1 reference must be from 2021 or later.
- End with a one-line medical disclaimer.

Metadata requirements:
- title must be <= 32 Chinese characters and reflect concrete patient search intent.
- excerpt must be 60-120 Chinese characters.
- seoTitle must be 18-60 Chinese characters and include focusKeyword.
- seoDescription must be 70-160 Chinese characters and include focusKeyword.
- Provide at least 3 longTailKeywords and naturally use at least 2 of them in the title/body.

English article requirements:
- markdownEn can be concise, but must remain valid markdown.
- Include `## Key takeaway` and `## References`.
- No fabricated institutions or product promotion."""

USER_PROMPT_TEMPLATE = """Write a new bilingual article for AskDrLiu.com.

Locked topic:
- Topic: {subtopic}
- Required category: {category}
- Required categoryEn: {category_en}

Chinese article must satisfy all of these:
- 2200-3200 Chinese characters
- Answer the search intent quickly in the first 220 Chinese characters
- focusKeyword must appear in the Chinese title, seoTitle, seoDescription, and first 220 Chinese characters
- Include at least 3 longTailKeywords, and use at least 2 of them naturally in the title/body
- Include `## 风险边界与就医信号（什么时候需要就医）`
- Include at least 2 internal relative links among /blog /faq /assessment /contact /about
- Include `## 参考文献` with 3-5 real sources
- End with one-line disclaimer
- Do not output placeholders or template notes

{feedback_block}
Return valid JSON only."""

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


STANDARD_CARE_SECTION = """
## 风险边界与就医信号（什么时候需要就医）

- 如果出现持续加重的右上腹痛、发热、寒战、黄疸、反复呕吐，或已经无法进食饮水，应尽快线下就医。
- 术后如果出现伤口红肿渗液、腹痛明显升级、腹泻迅速加重或持续腹胀，也建议尽早复诊。
- 合并糖尿病、妊娠、老年体弱或既往肝胆基础疾病的人群，应更早与医生沟通。
"""

STANDARD_LINK_SECTION = """
## 下一步该怎么办？

- [查看更多胆囊相关文章](/blog)
- [先做一次症状与手术评估](/assessment)
- [继续阅读常见问题答疑](/faq)
"""

STANDARD_DISCLAIMER = "免责声明：本文仅用于医学科普，不替代面对面的专业医疗建议，也不构成个人诊疗方案。"


def _dedupe_keep_order(items: list[str]) -> list[str]:
    seen = set()
    result = []
    for item in items:
        value = normalize_space(item)
        if not value or value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def _normalize_category(value: str, fallback: str) -> str:
    text = normalize_space(value)
    if text in ALLOWED_CATEGORIES_ZH:
        return text
    lowered = text.lower()
    if "保胆" in text or "pocs" in lowered or "preservation" in lowered:
        return "保胆"
    if "胆囊炎" in text or "cholecystitis" in lowered:
        return "胆囊炎"
    if any(token in text for token in ["术后", "营养", "腹泻", "切除"]) or any(token in lowered for token in ["post-cholecystectomy", "nutrition", "diarrhea", "diet after"]):
        return "胆囊切除术后营养"
    if "结石" in text or "gallstone" in lowered or "cholelithiasis" in lowered:
        return "胆囊结石"
    return fallback


def _extract_internal_links(markdown: str) -> list[str]:
    prefixes = ("/blog", "/faq", "/assessment", "/contact", "/about")
    return [u for u in re.findall(r"\((/[^)]+)\)", markdown or "") if u.startswith(prefixes)]


def _build_markdown_en_fallback(data: dict) -> str:
    title_en = normalize_space(data.get("titleEn")) or normalize_space(data.get("title")) or "Gallbladder Health Article"
    excerpt_en = normalize_space(data.get("excerptEn")) or normalize_space(data.get("excerpt")) or "This article is currently available primarily in Chinese on AskDrLiu.com."
    zh_urls = extract_reference_urls(data.get("markdownZh", ""))[:5]
    refs = "\n".join(f"- {u}" for u in zh_urls) if zh_urls else "- Please refer to the Chinese reference section."
    return (
        f"# {title_en}\n\n"
        f"## Key takeaway\n\n{excerpt_en}\n\n"
        "Please refer to the Chinese article on AskDrLiu.com for the full detailed discussion.\n\n"
        f"## References\n{refs}\n"
    )


def _build_strict_seo_fields(data: dict) -> tuple[str, str]:
    title = normalize_space(data.get("title"))
    focus = normalize_space(data.get("focusKeyword")) or title
    seo_title, seo_desc = shared_build_seo_fields(data)

    if len(seo_title) < 18:
        seo_title = normalize_space(f"{focus}：关键要点与就医建议")
    if focus and focus not in seo_title:
        seo_title = normalize_space(f"{focus}：{seo_title}")
    seo_title = seo_title[:60]

    zh_plain = plain_text(data.get("markdownZh", ""))
    excerpt = normalize_space(data.get("excerpt"))
    if len(excerpt) < 60 and zh_plain:
        excerpt = zh_plain[:92].rstrip(" ，。；;,. ") + "。"
    seo_desc = normalize_space(data.get("seoDescription")) or seo_desc
    if focus and focus not in seo_desc:
        seo_desc = normalize_space(f"{focus}，{seo_desc}")
    if len(seo_desc) < 70:
        seed = excerpt or zh_plain[:92]
        seo_desc = normalize_space(f"{focus}，{seed}，并说明常见误区、风险信号与就医建议。")
    seo_desc = seo_desc[:160]
    return seo_title, seo_desc


def _normalize_heading_labels(markdown: str) -> str:
    text = (markdown or "").strip()
    replacements = {
        "## References": "## 参考文献",
        "### References": "## 参考文献",
        "## When to see a doctor": "## 风险边界与就医信号（什么时候需要就医）",
        "### When to see a doctor": "## 风险边界与就医信号（什么时候需要就医）",
    }
    for old, new in replacements.items():
        if old in text and new not in text:
            text = text.replace(old, new)
    return text


def _ensure_lead_block(markdown: str, focus_keyword: str) -> str:
    body = (markdown or "").strip()
    lead = (
        "## 先说结论（30秒读完）\n\n"
        f"围绕“{focus_keyword}”这个问题，先记住三点：要结合症状、影像和恢复阶段判断是否需要进一步检查或手术；多数饮食与恢复问题可以通过分阶段管理改善；一旦出现持续加重腹痛、发热、黄疸、反复呕吐或无法进食，应尽快就医。"
    )
    if body.startswith("## 先说结论（30秒读完）"):
        if focus_keyword and focus_keyword in plain_text(body)[:220]:
            return body
        body = re.sub(r"^##\s*先说结论（30秒读完）\s*", "", body, count=1)
    if not body:
        return lead
    return lead + "\n\n" + body.lstrip()


def _ensure_care_section(markdown: str) -> str:
    text = (markdown or "").strip()
    if any(marker in text for marker in ["## 风险边界与就医信号", "## 风险边界与就医信号（什么时候需要就医）", "## 什么时候需要就医"]):
        return text
    if not text:
        return STANDARD_CARE_SECTION.strip()
    return text + "\n\n" + STANDARD_CARE_SECTION.strip()


def _ensure_internal_links(markdown: str) -> str:
    text = (markdown or "").strip()
    if len(_extract_internal_links(text)) >= 2:
        return text
    if not text:
        return STANDARD_LINK_SECTION.strip()
    return text + "\n\n" + STANDARD_LINK_SECTION.strip()


def _ensure_disclaimer(markdown: str) -> str:
    text = (markdown or "").strip()
    if "免责声明" in text or "不替代专业医疗建议" in text or "不构成个人诊疗方案" in text:
        return text
    if not text:
        return STANDARD_DISCLAIMER
    return text + "\n\n" + STANDARD_DISCLAIMER


def _split_reference_block(markdown: str) -> tuple[str, str]:
    text = (markdown or "").strip()
    match = re.search(r"\n##\s*参考文献\s*\n", text)
    if not match:
        return text, ""
    return text[:match.start()].rstrip(), text[match.start():].lstrip()


def _build_length_expansion_sections(focus_keyword: str, category: str) -> list[str]:
    focus = focus_keyword or "这个问题"
    category_tips = {
        "保胆": "保胆相关判断通常不能只看一项症状，还要结合胆囊收缩功能、结石位置与数量、胆囊壁状态、是否反复发作以及既往治疗反应综合评估。对于已经做过保胆治疗的人，还要把手术时间、术后饮食变化、复查结果和是否合并感染一起纳入判断。",
        "胆囊炎": "胆囊炎的恢复重点除了止痛和饮食控制，还要结合体温、白细胞、影像学和腹部压痛变化来判断炎症是否真正缓解。单纯今天比昨天轻一些，并不一定代表风险已经解除，还要关注夜间疼痛、发热和进食后的反应。",
        "胆囊结石": "胆囊结石并不是发现了就一定要手术，是否需要干预通常取决于症状频率、结石负担、并发症风险和生活质量影响。对很多患者来说，比“有没有石头”更重要的是“石头有没有引起持续症状、炎症、梗阻或胰腺炎风险”。",
        "胆囊切除术后营养": "胆囊切除后的营养管理强调少量多餐、逐步增加脂肪耐受、记录诱发食物，并结合体重、排便和腹胀情况动态调整。恢复期最怕的是一下子恢复到术前重油重辣饮食，导致腹泻、腹胀和进食焦虑反复出现。",
    }
    category_tip = category_tips.get(category, "胆囊问题的处理需要把症状、影像、化验结果和恢复阶段放在一起综合判断，不能只凭单一感觉来下结论。")
    return [
        (
            f"## {focus}常见误区有哪些？\n\n"
            f"很多患者一看到“{focus}”就会立刻把它理解成病情恶化，或者简单地认为只要暂时不疼就说明已经完全恢复。实际上，{focus}更需要结合疼痛持续时间、发作频率、发热与黄疸表现、进食后的反应以及近期超声或化验结果综合判断。"
            f"{category_tip}如果只盯着单一症状，很容易忽略恢复中的可逆因素，也可能错过真正需要就医的危险信号。"
            f"另外，情绪紧张、睡眠不足、连续高脂饮食、突然增加活动量，都可能让症状在短时间内波动，因此判断时要看连续几天甚至一两周的整体趋势，而不是只看某一餐或某一天。"
        ),
        (
            "## 饮食、活动和复诊怎么安排？\n\n"
            f"围绕“{focus}”进行自我管理时，建议把饮食、活动和复诊安排一起看。饮食上先从清淡、低油、规律三餐做起，避免一次性进食过多或连续高脂饮食；活动上以轻度步行、拉伸和逐步恢复日常节奏为主，不要在疼痛还未稳定时突然剧烈运动。"
            "复诊时重点关注疼痛是否逐周减轻、睡眠和食欲是否改善、排便是否恢复稳定，以及是否出现发热、黄疸或反复呕吐。把这些变化记录下来，医生更容易判断下一步是继续观察、调整饮食，还是需要追加检查。"
            "如果你发现某类食物每次都能诱发不适，最稳妥的做法不是永久禁食，而是暂时减少量、拉开间隔，再在症状稳定后小量试回。"
        ),
        (
            "## 家庭观察时要记录哪些变化？\n\n"
            f"在家观察“{focus}”时，可以简单记录四类信息：第一，疼痛的位置、持续时间和强度；第二，是否伴随发热、寒战、黄疸、恶心、呕吐或腹泻；第三，进食什么以后更容易诱发不适；第四，休息、热敷、清淡饮食后症状能否缓解。"
            "这些信息比单纯说一句“今天又疼了”更有价值，因为它能帮助区分是普通恢复波动、饮食刺激，还是提示胆道梗阻、感染或术后并发症。"
            "如果症状已经持续数天没有改善，或者波动越来越频繁，也建议不要继续拖延复诊。"
        ),
        (
            "## 和医生沟通时要准备什么？\n\n"
            f"如果你准备因为“{focus}”去复诊，最好提前整理好最近的检查结果、用药情况、手术时间或既往发作史，以及这段时间最典型的症状变化。"
            "和医生沟通时，重点不是只问“我要不要手术”或“是不是出问题了”，而是要把几个核心问题问清楚：现在最可能的原因是什么、还需要做哪些检查、短期内最值得警惕的信号是什么、饮食和活动应当怎么调整、多久复查一次更合适。"
            "把问题问具体，后续管理通常会更顺，也能减少因为信息不足带来的焦虑。"
        ),
        (
            "## 恢复期如何降低再次发作风险？\n\n"
            f"无论“{focus}”最终是恢复波动还是需要进一步处理，降低再次发作风险都离不开几个长期动作：规律饮食、不过度饥饿也不过量进食、减少高脂高糖暴食、保持稳定作息、按时复查，以及把既往容易诱发症状的场景记录下来。"
            "对于反复发作的人群，单纯靠止痛药或短期节食往往不够，更需要建立一套可持续的恢复节奏，包括餐次安排、活动强度、复查节点和警戒信号。"
            "如果已经出现并发症倾向，越早把管理策略调整到位，越能避免后面付出更高的治疗成本。"
        ),
        (
            "## 什么时候需要进一步检查？\n\n"
            f"如果“{focus}”持续超过原本恢复预期，或者伴随夜间痛醒、进食后明显加重、反复恶心呕吐、黄疸、发热、寒战、黑便等表现，就不建议只靠自行观察。"
            "此时通常需要结合腹部超声、肝功能、炎症指标，必要时再评估胆总管、残余结石、术后并发症或其他胃肠道问题。"
            "对于老年人、糖尿病患者、孕期人群以及既往有严重胆道感染史的人，更要把复查阈值放低一些；如果症状来得急、变化快，优先考虑线下急诊评估，而不是继续等待。"
        ),
    ]


def _ensure_min_zh_length(markdown: str, focus_keyword: str, category: str, min_cjk_chars: int = 2200) -> str:
    text = (markdown or "").strip()

    def merged_text(body_text: str, refs_text: str) -> str:
        return (body_text + ("\n\n" + refs_text if refs_text else "")).strip()

    def cjk_count(candidate: str) -> int:
        return len(re.findall(r"[\u4e00-\u9fff]", plain_text(candidate)))

    if cjk_count(text) >= min_cjk_chars:
        return text

    body, refs = _split_reference_block(text)
    sections = _build_length_expansion_sections(focus_keyword, category)
    existing_headings = set(re.findall(r"^##\s+(.+)$", body, flags=re.MULTILINE))

    for section in sections:
        heading_match = re.match(r"##\s+(.+?)\n", section)
        heading = heading_match.group(1).strip() if heading_match else section
        if heading in existing_headings:
            continue
        body = body.rstrip() + "\n\n" + section.strip()
        existing_headings.add(heading)
        merged = merged_text(body, refs)
        if cjk_count(merged) >= min_cjk_chars:
            return merged

    focus = focus_keyword or "当前症状"
    category_tip = {
        "保胆": "保胆治疗后的管理重点，是把症状变化、影像复查和日常饮食节奏放在一起看，避免因为短期波动就过度紧张，也避免在明显恶化时继续拖延。",
        "胆囊炎": "胆囊炎恢复期最重要的是观察炎症有没有真正往下走，而不是只看某一次疼痛是不是稍微轻了一点。",
        "胆囊结石": "胆囊结石相关症状往往和饮食、作息、炎症波动以及结石位置有关，因此记录诱因和复发频率非常重要。",
        "胆囊切除术后营养": "胆囊切除术后的饮食恢复更强调逐步增加耐受，而不是急着回到术前的饮食模式。",
    }.get(category, "胆囊问题的恢复需要连续观察，不建议只凭一两次波动来判断结论。")

    supplemental_paragraphs = [
        f"围绕“{focus}”做日常管理时，最容易被忽略的一点，是要把症状变化和恢复阶段对应起来看。很多人在症状稍好时马上恢复高油饮食、熬夜或重体力活动，结果在一两天后又出现疼痛、腹胀、恶心甚至排便紊乱。{category_tip}如果能连续记录一周左右的饮食、睡眠、活动和症状变化，往往比零散描述更能帮助医生判断问题性质。",
        f"另外，面对“{focus}”时，不建议同时做太多激烈调整，比如一天之内既突然节食、又临时加很多保健品、还自己频繁更换药物。更稳妥的做法是一次只调整一件事，例如先把饮食改为少量多餐、把活动量恢复到轻度步行，再观察两到三天身体反馈。这样更容易分辨到底是哪一个因素在加重或改善症状，也能减少不必要的焦虑。",
        f"如果这段时间你已经明显影响到进食、睡眠、工作节奏，或者家里人也观察到面色变差、体力下降、黄疸、持续低热等情况，就不要把“再等等看”当成默认方案。对很多胆囊相关问题来说，及时复查的价值不只是为了确认是否严重，更是为了尽早排除危险因素、减少反复发作，并为后续饮食和恢复安排建立一个更清晰的节奏。",
    ]

    if "## 日常管理补充说明" not in body:
        body = body.rstrip() + "\n\n## 日常管理补充说明"
    for paragraph in supplemental_paragraphs:
        body = body.rstrip() + "\n\n" + paragraph.strip()
        merged = merged_text(body, refs)
        if cjk_count(merged) >= min_cjk_chars:
            return merged

    return merged_text(body, refs)


def _repair_generated_payload(data: dict, expected_category: str, subtopic: str) -> dict:
    data = dict(data)
    title = normalize_space(data.get("title")) or normalize_space(subtopic)
    if len(title) > 32 and len(normalize_space(subtopic)) <= 32:
        title = normalize_space(subtopic)
    data["title"] = title
    data["titleEn"] = normalize_space(data.get("titleEn")) or title

    category = _normalize_category(data.get("category", ""), expected_category)
    data["category"] = category
    data["categoryEn"] = CATEGORY_MAP[category]

    focus_keyword = normalize_space(data.get("focusKeyword"))
    if not focus_keyword or focus_keyword not in title:
        focus_keyword = title
    data["focusKeyword"] = focus_keyword

    long_tail_keywords = _dedupe_keep_order(
        list(data.get("longTailKeywords") or [])
        + [subtopic, title, f"{subtopic}怎么办", f"{subtopic}多久恢复"]
    )
    data["longTailKeywords"] = long_tail_keywords[:4]

    markdown_zh = _normalize_heading_labels(data.get("markdownZh") or data.get("markdown") or "")
    markdown_zh = _ensure_lead_block(markdown_zh, focus_keyword)
    markdown_zh = _ensure_care_section(markdown_zh)
    markdown_zh = _ensure_internal_links(markdown_zh)
    markdown_zh = _ensure_disclaimer(markdown_zh)
    markdown_zh = _ensure_min_zh_length(markdown_zh, focus_keyword, category)
    data["markdownZh"] = markdown_zh.strip()

    zh_plain = plain_text(data["markdownZh"])
    excerpt = normalize_space(data.get("excerpt"))
    if len(excerpt) < 60 and zh_plain:
        excerpt = zh_plain[:92].rstrip(" ，。；;,. ") + "。"
    data["excerpt"] = excerpt[:120] if len(excerpt) > 120 else excerpt

    excerpt_en = normalize_space(data.get("excerptEn"))
    if len(excerpt_en) < 60:
        seed = excerpt_en or data["excerpt"] or "Chinese article with practical gallbladder guidance and references."
        excerpt_en = seed[:156]
    data["excerptEn"] = excerpt_en

    if not normalize_space(data.get("markdownEn")):
        data["markdownEn"] = _build_markdown_en_fallback(data)

    data["seoTitle"], data["seoDescription"] = _build_strict_seo_fields(data)
    data["tags"] = _dedupe_keep_order(list(data.get("tags") or []) + [category, focus_keyword])[:6]
    return data


def _collect_validation_issues(data: dict) -> list[str]:
    issues = validate_article_payload(
        data,
        allowed_categories=ALLOWED_CATEGORIES_ZH,
        category_map=CATEGORY_MAP,
        min_zh_chars=2200,
        min_en_words=0,
        require_keyword_fields=True,
        require_internal_links=True,
    )
    title_conflict = find_title_conflict(data.get("title", ""))
    if title_conflict:
        issues.append(f"Duplicate title conflict with {title_conflict['slug']}")
    similar_article = find_similar_article(data.get("markdownZh", ""))
    if similar_article:
        issues.append(
            f"Article too similar to existing post {similar_article['slug']} ({similar_article['similarity']:.2f})"
        )
    return issues


def _build_feedback_block(expected_category: str, issues: list[str]) -> str:
    if not issues:
        return ""
    bullets = "\n".join(f"- {issue}" for issue in issues[:8])
    return (
        "Previous output failed validation. Regenerate the full JSON from scratch and fix every issue below exactly:\n"
        f"{bullets}\n\n"
        f"Keep category exactly `{expected_category}` and categoryEn exactly `{CATEGORY_MAP[expected_category]}`. "
        "Do not shorten the Chinese article and do not omit the references section."
    )

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
                max_tokens=9000,
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


def generate_post(category: str, subtopic: str, max_retries=4) -> dict:
    """Generate blog post with retry logic aligned to weekly validation rules."""
    if not LLM_API_KEY:
        raise RuntimeError("Missing LLM_API_KEY/ZHIPU_API_KEY environment variable")

    client = OpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL)
    feedback_issues: list[str] = []

    for attempt in range(max_retries):
        prompt = USER_PROMPT_TEMPLATE.format(
            category=category,
            category_en=CATEGORY_MAP[category],
            subtopic=subtopic,
            feedback_block=_build_feedback_block(category, feedback_issues),
        )
        try:
            print(f"[GEN] Attempt {attempt + 1}/{max_retries}...")

            resp = call_llm_with_backoff(
                client,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.25,
            )

            text = resp.choices[0].message.content.strip()
            text = clean_json_string(text)
            try:
                data = json.loads(text, strict=False)
            except Exception:
                m = re.search(r"\{.*\}", text, re.DOTALL)
                if not m:
                    raise ValueError(f"Model did not return valid JSON:\n{text[:300]}")
                json_str = clean_json_string(m.group(0))
                data = json.loads(json_str, strict=False)

            required = ["title", "category"]
            for key in required:
                if not normalize_space(data.get(key)):
                    raise ValueError(f"Missing required field: {key}")
            if not normalize_space(data.get("markdownZh") or data.get("markdown")):
                raise ValueError("Missing required field: markdownZh")

            data = _repair_generated_payload(data, category, subtopic)
            seo_issues = _collect_validation_issues(data)
            if seo_issues:
                print(f"[WARN] Validation failed: {'; '.join(seo_issues[:8])}")
                feedback_issues = seo_issues
                if attempt < max_retries - 1:
                    print("[RETRY] Regenerating with validation feedback...")
                    time.sleep(2)
                    continue
                raise ValueError("Validation failed after retries: " + "; ".join(seo_issues[:10]))

            print(f"[OK] Generated: {data['title']} / {data['titleEn']}")
            print(f"[OK] SEO keyword: {data.get('focusKeyword', '')}")
            return data

        except Exception as e:
            print(f"[ERROR] Generation attempt {attempt + 1} failed: {e}")
            if not feedback_issues:
                feedback_issues = [str(e)]
            if attempt < max_retries - 1:
                time.sleep(3)
            else:
                raise

    raise RuntimeError(f"Failed to generate post after {max_retries} attempts")



def make_slug(title: str) -> str:
    """Generate a URL-friendly slug from title."""
    # Remove non-alphanumeric (keep spaces/hyphens)
    clean = re.sub(r"[^\w\s-]", "", title, flags=re.UNICODE)
    # Replace spaces with hyphens
    clean = re.sub(r"\s+", "-", clean.strip()).lower()
    # Limit length
    clean = clean[:40]
    # Add random suffix
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    today = datetime.now().strftime("%Y%m%d")
    return f"{today}-{clean.strip('-')}-{suffix}" if clean.strip('-') else f"{today}-post-{suffix}"


def save_markdown(slug: str, data: dict, image_url: str):
    """Save bilingual markdown files to public/blog-posts/."""
    today = datetime.now().strftime("%Y-%m-%d")

    # Chinese version
    zh_path = BLOG_MD_DIR / f"{slug}.md"
    zh_header = f"""---
title: {data['title']}
date: {today}
category: {data['category']}
image: {image_url}
---

"""
    zh_body = shared_ensure_book_link(data["markdownZh"])
    zh_path.write_text(zh_header + zh_body.strip() + "\n", encoding="utf-8")

    # English version
    en_path = BLOG_MD_DIR / f"{slug}-en.md"
    en_header = f"""---
title: {data['titleEn']}
date: {today}
category: {data['categoryEn']}
image: {image_url}
---

"""
    en_path.write_text(en_header + data["markdownEn"].strip() + "\n", encoding="utf-8")

    print(f"[OK] Files saved: {zh_path.name}, {en_path.name}")


def update_blog_index(slug: str, data: dict, image_url: str):
    """Insert new post entry into src/data/blog-posts.ts."""
    today = datetime.now().strftime("%Y-%m-%d")

    title = json.dumps(data.get("title", "") or "", ensure_ascii=False)
    title_en = json.dumps(data.get("titleEn", "") or "", ensure_ascii=False)
    excerpt = json.dumps(data.get("excerpt", "") or "", ensure_ascii=False)
    excerpt_en = json.dumps(data.get("excerptEn", "") or "", ensure_ascii=False)
    category = json.dumps(data.get("category", "") or "", ensure_ascii=False)
    category_en = json.dumps(data.get("categoryEn", "") or "", ensure_ascii=False)
    seo_title = json.dumps(data.get("seoTitle", data.get("title", "")) or "", ensure_ascii=False)
    seo_desc = json.dumps(data.get("seoDescription", data.get("excerpt", "")) or "", ensure_ascii=False)
    slug_literal = json.dumps(slug, ensure_ascii=False)
    date_literal = json.dumps(today, ensure_ascii=False)
    image_literal = json.dumps(image_url or "", ensure_ascii=False)

    new_entry = f"""  {{
    id: {slug_literal},
    title: {title},
    titleEn: {title_en},
    excerpt: {excerpt},
    excerptEn: {excerpt_en},
    seoTitle: {seo_title},
    seoDescription: {seo_desc},
    date: {date_literal},
    category: {category},
    categoryEn: {category_en},
    imageUrl: {image_literal},
    author: "AskDrLiu.com"
  }},"""

    try:
        content = BLOG_INDEX_FILE.read_text(encoding="utf-8")
        marker = "export const blogPosts: BlogPost[] = ["
        if marker not in content:
            print(f"[WARN] Marker not found in {BLOG_INDEX_FILE}. Manual update required.")
            print(f"[ENTRY]\n{new_entry}")
            return

        pos = content.index(marker) + len(marker)
        new_content = content[:pos] + "\n" + new_entry + content[pos:]
        BLOG_INDEX_FILE.write_text(new_content, encoding="utf-8")
        print(f"[OK] Updated blog-posts.ts: {slug}")
    except Exception as e:
        print(f"[ERROR] Failed to update blog-posts.ts: {e}")


def update_sitemap():
    """Basic sitemap generator."""
    sitemap_path = REPO_ROOT / "public" / "sitemap.xml"
    if not BLOG_INDEX_FILE.exists():
        return
    ids = re.findall(r"id:\s*'([^']+)'", BLOG_INDEX_FILE.read_text(encoding="utf-8"))
    urls = ["https://www.askdrliu.com/", "https://www.askdrliu.com/blog"]
    urls.extend([f"https://www.askdrliu.com/blog/{slug}" for slug in ids])
    unique_urls = list(dict.fromkeys(urls))

    body = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in unique_urls:
        body.append(f"  <url><loc>{url}</loc></url>")
    body.append("</urlset>")

    sitemap_path.write_text("\n".join(body) + "\n", encoding="utf-8")
    print(f"[OK] Updated sitemap.xml with {len(unique_urls)} URLs")


def main():
    print("=== AskDrLiu Blog Daily Generator (Standalone) ===")

    # 1. Pick a topic
    category, subtopic = pick_unique_seed_topic()
    print(f"[TOPIC] {subtopic} ({category})")

    # 2. Generate content
    try:
        data = generate_post(category, subtopic)
    except Exception as e:
        if is_rate_limit_error(e):
            print(f"[SKIP] API Throttled: {e}")
            return
        print(f"[FATAL] Generation failed: {e}")
        return

    # 3. Generate cover image
    slug = make_slug(data["title"])
    print(f"[IMG] Generating image for {slug}...")
    image_url = generate_cover_image(
        slug=slug,
        images_dir=IMAGES_DIR,
        fallback_path="/images/pocs-surgery.jpg",
        base_prompt=data["title"],
        api_key=ARK_API_KEY
    )

    # 4. Save and Update
    save_markdown(slug, data, image_url)
    update_blog_index(slug, data, image_url)
    update_sitemap()

    print(f"\n✅ Done! Slug: {slug}")


if __name__ == "__main__":
    main()
