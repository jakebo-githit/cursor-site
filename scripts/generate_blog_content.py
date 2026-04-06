#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate blog content using GLM-5 API
"""

import os
import json
from openai import OpenAI
from datetime import datetime

# Load API key
LLM_API_KEY = os.getenv("LLM_API_KEY", "7eda33e77d444512b09c86aaa5aa54e3.qXfGiVp67Pg4JOT8")
LLM_BASE_URL = "https://open.bigmodel.cn/api/coding/paas/v4"
MODEL = "glm-5"

SYSTEM_PROMPT = """You are a senior hepatobiliary surgeon. Generate bilingual medical blog JSON.

JSON fields: title, titleEn, excerpt, excerptEn, category, categoryEn, tags, focusKeyword, longTailKeywords, seoTitle, seoDescription, markdownZh(800-1200 chars), markdownEn(400-600 words)

Requirements:
- markdownZh includes multiple ## section headings
- markdownZh ends with ## 参考文献 (3-5 real URLs from reputable medical sources)
- Include disclaimer at end
- Output pure JSON only, no markdown fences"""

USER_PROMPT = """Topic: 胆囊切除术后一周食谱清单
Category: 胆囊切除术后营养

Generate JSON format bilingual article focusing on practical, evidence-based nutrition guidance for patients one week after gallbladder surgery. Include:
- Specific meal examples for each day
- Foods to avoid and why
- Portion size guidance
- Cooking methods recommendations
- When to seek medical advice

Ensure all medical claims are supported by references from peer-reviewed journals or reputable medical organizations (PubMed, Mayo Clinic, etc.)."""

def main():
    client = OpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL)
    
    print("[GEN] Generating blog content...")
    
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": USER_PROMPT}
        ],
        temperature=0.4,
        max_tokens=6000
    )
    
    text = response.choices[0].message.content.strip()
    
    # Parse JSON
    try:
        data = json.loads(text)
    except:
        # Extract JSON if wrapped in markdown
        import re
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            data = json.loads(m.group(0))
        else:
            raise ValueError("Failed to parse JSON from response")
    
    # Save to file
    output_file = f"/Users/liubo/.openclaw/workspace/projects/cursor-site/scripts/generated_content_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"[SUCCESS] Content generated and saved to: {output_file}")
    print(f"Title: {data.get('title')}")
    print(f"SEO Keyword: {data.get('focusKeyword')}")
    
    return data

if __name__ == "__main__":
    main()
