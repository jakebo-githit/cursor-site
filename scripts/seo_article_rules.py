#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""Shared SEO writing rules and validation for AskDrLiu blog articles."""

from __future__ import annotations

import re
from typing import Iterable

BOOK_LINK_BLOCK_ZH = """

## 延伸阅读：推荐电子书

> **如果你希望更系统地了解胆囊切除术后饮食、腹泻、腹胀、脂肪消化与营养修复，可以进一步查看刘波医生整理的相关患者教育资料与电子书页面。**
>
> **《手術成功了，為什麼我的身體變了？——膽囊切除後的飲食與營養修復》**
>
> **👉 [在 gallbladdercare.com 查看这本书](https://gallbladdercare.com)**
"""

PROHIBITED_TERMS = [
    "中山大学附属第三医院",
    "中山大学附属第三医院岭南医院",
    "岭南医院",
    "某某医院",
    "本院",
    "我院",
    "affiliate",
    "联盟产品",
    "Amazon联盟",
]

SEARCH_INTENT_HINTS = ["怎么办", "不能吃什么", "饮食怎么调", "多久恢复", "什么时候就医", "能不能", "是否需要", "要不要"]
INTERNAL_LINK_HINTS = ["/blog", "/faq", "/assessment", "/contact", "/about"]
DISCLAIMER_HINTS = ["免责声明", "不替代专业医疗建议", "不构成个人诊疗建议", "does not replace professional medical advice"]
CARE_HINTS = ["何时需要就医", "风险边界与就医信号", "什么时候需要就医", "When to see a doctor"]


def normalize_space(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip()


def strip_frontmatter(markdown: str) -> str:
    return re.sub(r"^---[\s\S]*?---\r?\n", "", markdown or "")


def plain_text(markdown: str) -> str:
    text = strip_frontmatter(markdown or "")
    text = re.sub(r"```[\s\S]*?```", " ", text)
    text = re.sub(r"`[^`]*`", " ", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"\[[^\]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"[#>*_\-|]", " ", text)
    return normalize_space(text)


def count_cjk_chars(text: str) -> int:
    return len(re.findall(r"[\u4e00-\u9fff]", text or ""))


def count_words(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text or ""))


def extract_h2_headings(markdown: str) -> list[str]:
    return [normalize_space(m.group(1)) for m in re.finditer(r"^##\s+(.+)$", markdown or "", flags=re.MULTILINE)]


def extract_internal_links(markdown: str) -> list[str]:
    return [u for u in re.findall(r"\((/[^)]+)\)", markdown or "") if any(u.startswith(p) for p in INTERNAL_LINK_HINTS)]


def ensure_book_link(markdown_text: str) -> str:
    if "gallbladdercare.com" in (markdown_text or ""):
        return markdown_text
    marker = "## 参考文献"
    if marker in (markdown_text or ""):
        return markdown_text.replace(marker, BOOK_LINK_BLOCK_ZH + "\n" + marker, 1)
    return (markdown_text or "").rstrip() + "\n\n" + BOOK_LINK_BLOCK_ZH + "\n"


def build_seo_fields(data: dict) -> tuple[str, str]:
    title = normalize_space(data.get("title"))
    excerpt = normalize_space(data.get("excerpt"))
    focus_keyword = normalize_space(data.get("focusKeyword")) or title

    seo_title = normalize_space(data.get("seoTitle")) or title
    if focus_keyword and focus_keyword not in seo_title:
        seo_title = f"{focus_keyword}：{seo_title}" if seo_title else focus_keyword
    seo_title = seo_title[:60]

    seo_desc = normalize_space(data.get("seoDescription")) or excerpt
    if focus_keyword and focus_keyword not in seo_desc:
        seo_desc = f"{focus_keyword}，{seo_desc}" if seo_desc else focus_keyword
    seo_desc = seo_desc[:160]

    return seo_title, seo_desc


def _contains_any(text: str, needles: Iterable[str]) -> bool:
    haystack = normalize_space(text).lower()
    return any(normalize_space(needle).lower() in haystack for needle in needles if normalize_space(needle))


def validate_article_payload(
    data: dict,
    *,
    allowed_categories: list[str] | None = None,
    category_map: dict[str, str] | None = None,
    min_zh_chars: int = 2200,
    min_en_words: int = 800,
    require_keyword_fields: bool = True,
    require_internal_links: bool = True,
) -> list[str]:
    issues: list[str] = []

    title = normalize_space(data.get("title"))
    excerpt = normalize_space(data.get("excerpt"))
    category = normalize_space(data.get("category"))
    category_en = normalize_space(data.get("categoryEn"))
    zh_markdown = data.get("markdownZh") or data.get("markdown") or ""
    en_markdown = data.get("markdownEn") or ""
    seo_title, seo_desc = build_seo_fields(data)
    focus_keyword = normalize_space(data.get("focusKeyword"))
    long_tail_keywords = [normalize_space(k) for k in data.get("longTailKeywords") or [] if normalize_space(k)]

    if not title:
        issues.append("Missing title")
    if not excerpt:
        issues.append("Missing excerpt")
    if allowed_categories and category not in allowed_categories:
        issues.append(f"Invalid category: {category}")
    if category_map and category and category_map.get(category) and category_en != category_map.get(category):
        issues.append(f"categoryEn does not match category mapping: {category} -> {category_en}")

    if len(title) > 32:
        issues.append(f"Title too long for Chinese SERP: {len(title)} chars")
    if len(excerpt) < 60:
        issues.append(f"Excerpt too short: {len(excerpt)} chars")
    if len(seo_title) < 18 or len(seo_title) > 60:
        issues.append(f"seoTitle length out of range: {len(seo_title)} chars")
    if len(seo_desc) < 70 or len(seo_desc) > 160:
        issues.append(f"seoDescription length out of range: {len(seo_desc)} chars")

    zh_plain = plain_text(zh_markdown)
    if count_cjk_chars(zh_plain) < min_zh_chars:
        issues.append(f"Chinese article too short: {count_cjk_chars(zh_plain)} CJK chars")
    if min_en_words > 0 and count_words(plain_text(en_markdown)) < min_en_words:
        issues.append(f"English article too short: {count_words(plain_text(en_markdown))} words")

    headings = extract_h2_headings(zh_markdown)
    if len(headings) < 5:
        issues.append(f"Not enough H2 sections: {len(headings)}")
    if not _contains_any(zh_markdown, ["## 参考文献"]):
        issues.append("Missing 参考文献 section")
    if not _contains_any(zh_markdown, CARE_HINTS):
        issues.append("Missing care escalation / when-to-see-doctor section")
    if not _contains_any(zh_markdown, DISCLAIMER_HINTS):
        issues.append("Missing disclaimer")
    if not _contains_any(" ".join(headings), SEARCH_INTENT_HINTS):
        issues.append("H2 headings are not search-intent oriented enough")

    first_window = zh_plain[:220]
    if require_keyword_fields:
        if not focus_keyword:
            issues.append("Missing focusKeyword")
        if len(long_tail_keywords) < 2:
            issues.append("Need at least 2 longTailKeywords")
    if focus_keyword:
        if focus_keyword not in title:
            issues.append("focusKeyword missing from title")
        if focus_keyword not in seo_title:
            issues.append("focusKeyword missing from seoTitle")
        if focus_keyword not in seo_desc:
            issues.append("focusKeyword missing from seoDescription")
        if focus_keyword not in first_window:
            issues.append("focusKeyword missing from first 220 characters")

    matched_long_tails = [kw for kw in long_tail_keywords if kw and kw in (title + "\n" + zh_markdown)]
    if long_tail_keywords and len(matched_long_tails) < min(2, len(long_tail_keywords)):
        issues.append("Not enough long-tail keywords are naturally used in article/title")

    if require_internal_links and len(extract_internal_links(zh_markdown)) < 2:
        issues.append("Need at least 2 internal relative links in Chinese article")

    blocked_hits = [term for term in PROHIBITED_TERMS if term in (zh_markdown + "\n" + en_markdown)]
    if blocked_hits:
        issues.append("Contains prohibited brand/institution terms: " + ", ".join(blocked_hits[:3]))

    return issues
