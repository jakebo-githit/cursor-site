#!/usr/bin/env python3
"""Two-phase blog generator: generate + expand."""
import os, sys, re, json, time, random, string
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))
import requests as http_requests
from seo_article_rules import count_cjk_chars, count_words, plain_text

SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "").strip()

def call_api(messages, max_tokens=8192):
    url = "https://api.siliconflow.cn/v1/chat/completions"
    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    payload = {"model": "Qwen/Qwen2.5-72B-Instruct", "messages": messages, "temperature": 0.4, "max_tokens": max_tokens}
    for attempt in range(3):
        try:
            r = http_requests.post(url, headers=headers, json=payload, timeout=180)
            if r.status_code == 429:
                time.sleep(30)
                continue
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
        except Exception as ex:
            print(f"[WARN] API attempt {attempt+1} failed: {ex}")
            time.sleep(5)
    raise RuntimeError("API failed")

def parse_json(text):
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
    m = re.search(r"\{[\s\S]*\}", text)
    return json.loads(m.group(0)) if m else json.loads(text)

# Phase 1: Generate base content
print("[PHASE 1] Generating base content...")
resp1 = call_api([
    {"role": "system", "content": """你是肝胆外科主任医师，为 AskDrLiu.com 撰写双语医学科普文章。

规则：
- 仅供科普，不作个人诊疗建议
- 不提及医院名称，不推广产品，不用恐吓语气
- 所有参考文献必须真实可验证

输出JSON格式：
{"title":"中文标题(含胆囊炎急性发作)","titleEn":"English title","excerpt":"80-120字中文摘要","excerptEn":"120-160 char English excerpt","focusKeyword":"胆囊炎急性发作","longTailKeywords":["k1","k2","k3","k4"],"category":"胆囊炎","categoryEn":"Cholecystitis","markdownZh":"中文正文markdown","markdownEn":"English body markdown"}

中文正文要求：
- 以 ## 先说结论（30秒读完） 开头
- 至少包含这些H2标题（用问句形式）：胆囊炎急性发作时有什么典型症状？/ 胆囊炎发作时能不能先吃止痛药？/ 急性胆囊炎能自愈吗？/ 胆囊炎急性发作在家怎么应急处理？/ 胆囊炎发作后保胆还是切胆？/ 风险边界与就医信号
- 每节：结论句→3-5个要点→一个常见误区
- 包含内链：[了解更多](/blog) [在线评估](/assessment)
- ## 参考文献 3-5条真实文献，含标题/期刊/年份/URL
- 结尾加免责声明
- 目标2500-3000汉字"""},
    {"role": "user", "content": """写一篇关于"胆囊炎急性发作时该怎么办"的双语科普文章。

要点覆盖：症状识别、家庭应急、何时必须急诊、治疗选择（保胆vs切胆）
参考来源：https://pubmed.ncbi.nlm.nih.gov/36623428/

输出纯JSON，不要其他文字。"""}
], max_tokens=8192)

data = parse_json(resp1)
cjk = count_cjk_chars(plain_text(data.get("markdownZh", "")))
en_w = count_words(plain_text(data.get("markdownEn", "")))
print(f"[CHECK] CJK: {cjk}, EN words: {en_w}")

# Phase 2: Expand if too short
if cjk < 2000:
    print(f"[PHASE 2] Expanding Chinese content ({cjk} < 2000 CJK)...")
    expand_resp = call_api([
        {"role": "system", "content": "你是医学科普编辑。你的任务是扩写已有的医学文章，使其达到2500-3000汉字。保持原有结构和医学准确性，扩充每个要点的细节，增加临床实例和实用建议。只输出扩写后的完整markdown正文，不要加```。"},
        {"role": "user", "content": f"请将以下中文文章扩写到至少2500汉字。保持原有标题结构，但每个H2下的内容要更详细充实，增加实用细节和临床经验。\n\n{data['markdownZh']}"}
    ], max_tokens=8192)
    expanded = expand_resp.strip()
    if expanded.startswith("```"):
        expanded = re.sub(r"^```\s*\n?", "", expanded)
        expanded = re.sub(r"\n?```\s*$", "", expanded)
    new_cjk = count_cjk_chars(plain_text(expanded))
    if new_cjk > cjk:
        data["markdownZh"] = expanded
        cjk = new_cjk
        print(f"[OK] Expanded to {cjk} CJK chars")

if en_w < 700:
    print(f"[PHASE 2] Expanding English content ({en_w} < 700 words)...")
    expand_en = call_api([
        {"role": "system", "content": "You are a medical editor. Expand the following English medical article to at least 900 words while keeping accuracy and structure. Output only the expanded markdown, no fences."},
        {"role": "user", "content": data["markdownEn"]}
    ], max_tokens=8192)
    expanded_en = expand_en.strip()
    if expanded_en.startswith("```"):
        expanded_en = re.sub(r"^```\s*\n?", "", expanded_en)
        expanded_en = re.sub(r"\n?```\s*$", "", expanded_en)
    new_en = count_words(plain_text(expanded_en))
    if new_en > en_w:
        data["markdownEn"] = expanded_en
        print(f"[OK] Expanded EN to {new_en} words")

# Force fields
data["focusKeyword"] = "胆囊炎急性发作"
data["category"] = "胆囊炎"
data["categoryEn"] = "Cholecystitis"
if "胆囊炎急性发作" not in data.get("title", ""):
    data["title"] = "胆囊炎急性发作时该怎么办？应急处理与就医指南"
if not data.get("longTailKeywords") or len(data.get("longTailKeywords",[])) < 3:
    data["longTailKeywords"] = ["胆囊炎急性发作怎么办", "胆囊炎发作应急处理", "胆囊炎什么时候必须就医", "急性胆囊炎能自愈吗"]
if len(data.get("excerpt","")) < 80:
    data["excerpt"] = "胆囊炎急性发作时剧烈腹痛让人恐慌，本文详解急性胆囊炎的症状识别、家庭应急处理、何时必须急诊就医及后续治疗选择。"
if len(data.get("excerptEn","")) < 100:
    data["excerptEn"] = "Acute cholecystitis causes severe right upper quadrant pain. Learn symptom recognition, home emergency measures, when to visit the ER, and treatment options."

print(f"\n[RESULT] Title: {data['title']}")
print(f"[RESULT] CJK: {count_cjk_chars(plain_text(data.get('markdownZh','')))} chars")
print(f"[RESULT] EN: {count_words(plain_text(data.get('markdownEn','')))} words")

# Save as JSON for the publish step
output_path = Path(__file__).parent / "today_draft.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"[OK] Saved draft to {output_path}")
