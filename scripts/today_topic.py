#!/usr/bin/env python3
"""Today's topic config for auto blog generation."""
import sys, os, json, re, time, random, string
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))

# ── Topic ──
TOPIC = {
    "headline": "胆囊炎急性发作时该怎么办？肝胆外科医生的应急处理与就医时机",
    "url": "https://pubmed.ncbi.nlm.nih.gov/36623428/",
    "summary": "胆囊炎急性发作是常见急腹症，患者常因疼痛突然加剧而恐慌。本文从循证医学角度，介绍急性胆囊炎的典型症状识别、家庭应急措施、何时必须急诊就医、以及后续治疗方案选择（保胆vs切胆）。",
    "category": "胆囊炎",
    "categoryEn": "Cholecystitis",
    "topic_type": "cholecystitis",
}

SYSTEM_PROMPT = """You are a senior hepatobiliary surgeon writing bilingual medical education content for AskDrLiu.com.
Rules:
- Educational only — not diagnosis or personal medical advice.
- No hospital names, no product promotion, no fear-based language.
- Clear structure, short paragraphs, practical guidance.
- Output MUST be valid JSON only (no markdown fences).
- References must be REAL, verifiable publications.

JSON structure:
{
  "title": "中文标题 (max 30 chars)",
  "titleEn": "English title (max 60 chars)",
  "excerpt": "中文摘要 (80-120 chars, no newlines)",
  "excerptEn": "English excerpt (100-160 chars, no newlines)",
  "focusKeyword": "Primary Chinese keyword phrase",
  "longTailKeywords": ["keyword1", "keyword2", "keyword3"],
  "category": "胆囊炎",
  "categoryEn": "Cholecystitis",
  "tags": ["tag1", "tag2", "tag3"],
  "markdownZh": "中文正文 markdown (2200-3200 Chinese chars)",
  "markdownEn": "English body markdown (900-1400 words)"
}

Chinese article requirements:
- Must start with ## 先说结论（30秒读完）
- SEO: title reflects concrete search intent; first paragraph includes main keyword
- 3-5 real references (prefer 2021+), each with title/journal/year/URL in ## 参考文献
- At least 2 internal links (/blog, /faq, /assessment, /contact)
- At least 4 FAQ-style subheadings (question format)
- Each FAQ: one-line conclusion + 2-4 bullets + one misconception
- Include ## 风险边界与就医信号 with emergency bullets
- End with one-line medical disclaimer
- Tone: "能保尽保，前提是安全可保；不具备条件时，规范切除 + 术后营养管理"
- 2200-3200 Chinese characters minimum

English article requirements:
- Same structure, natural English tone, 900-1400 words
- Start with Key Takeaway block
- At least 4 FAQ-style subheadings
- ## References with 3-5 real sources"""

USER_PROMPT = """Generate a bilingual blog post for this topic:

Headline: {headline}
Source: {url}
Summary: {summary}

Focus: acute cholecystitis, gallbladder inflammation, emergency response, when to go to ER, treatment options, gallbladder preservation vs removal

Return valid JSON only."""

if __name__ == "__main__":
    # Just print the topic for verification
    print(f"Topic: {TOPIC['headline']}")
    print(f"Category: {TOPIC['category']}")
