#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple daily blog update for testing
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path

# Add scripts directory to path
SCRIPTS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS_DIR))

REPO_ROOT = SCRIPTS_DIR.parent
DRAFTS_DIR = REPO_ROOT / "drafts"

def make_slug(title: str) -> str:
    """Generate URL-friendly slug."""
    import re
    import random
    import string
    # Remove special characters
    slug = re.sub(r'[^\w\s-]', '', title)
    slug = re.sub(r'[\s]+', '-', slug)
    slug = slug.strip('-')[:80]
    # Add random suffix
    suffix = ''.join(random.choices(string.ascii_lowercase, k=6))
    date_prefix = datetime.now().strftime("%Y%m%d")
    return f"{date_prefix}-{slug}-{suffix}"

def create_test_post():
    """Create a test blog post"""
    
    title = "胆囊切除术后腹泻管理指南"
    title_en = "Managing Diarrhea After Gallbladder Removal: A Comprehensive Guide"
    category = "胆囊切除术后营养"
    category_en = "Post-Cholecystectomy Nutrition"
    
    # Simple content (avoiding API calls)
    markdown_zh = f"""# {title}

## 胆囊切除术后腹泻的常见原因

胆囊切除术后出现腹泻是常见的消化系统症状，发生率约为15-30%。主要原因包括：

### 1. 胆汁持续分泌
- 胆囊切除后，肝脏持续分泌胆汁直接进入小肠
- 高浓度胆汁刺激肠道蠕动加快
- 导致食物在肠道停留时间缩短

### 2. 脂肪消化不良
- 胆囊储存和浓缩胆汁的功能丧失
- 进食高脂食物时，胆汁不足导致脂肪吸收不良
- 脂肪进入大肠刺激分泌，引起腹泻

### 3. 肠道菌群变化
- 手术和抗生素使用可能影响肠道菌群平衡
- 菌群失调导致消化功能紊乱

## 科学管理策略

### 饮食调整

#### 第一阶段：术后1-2周（低脂流质）
- 避免高脂食物
- 少量多餐，每次进食量控制在200ml以内
- 推荐食物：米汤、藕粉、蛋白水、稀粥

#### 第二阶段：术后3-4周（低脂半流质）
- 逐步增加食物种类
- 避免油炸、肥肉、奶油等高脂食物
- 推荐食物：蒸蛋、烂面条、馒头、煮蔬菜

#### 第三阶段：术后1个月以上（逐步恢复正常）
- 逐步恢复正常饮食
- 注意观察身体反应
- 避免暴饮暴食

### 药物治疗建议

#### 益生菌
- 双歧杆菌、乳酸杆菌等益生菌制剂
- 有助于调节肠道菌群
- 建议：餐后服用，温水送服

#### 止泻药物
- 蒙脱石散：保护肠道黏膜
- 洛哌丁胺：减少肠道蠕动
- 使用时间：症状严重时短期使用

## 重要提醒

### 就医时机
- 腹泻持续超过2周
- 出现脱水症状（尿量减少、口干）
- 伴有发热、腹痛加重
- 大便带血或黏液

### 长期注意事项
- 避免长时间卧床
- 适当运动促进肠道蠕动
- 保持良好心态
- 定期复查肝功能

## 总结

胆囊切除术后腹泻是常见现象，但通过科学的饮食管理和适当的药物治疗，大多数患者可以在3-6个月内逐渐恢复。如有疑虑，请及时咨询专业医生。

---

## Managing Diarrhea After Gallbladder Removal: A Comprehensive Guide

### Common Causes of Post-Cholecystectomy Diarrhea

Diarrhea after gallbladder removal is a common digestive symptom, occurring in about 15-30% of patients. The main causes include:

#### 1. Continuous Bile Secretion
- After gallbladder removal, the liver continuously secretes bile directly into the small intestine
- High bile concentration stimulates increased intestinal motility
- Results in reduced food residence time in the intestine

#### 2. Fat Malabsorption
- Loss of gallbladder function for bile storage and concentration
- Insufficient bile when consuming high-fat foods leads to poor fat absorption
- Undigested fats enter the large intestine, stimulating secretion and causing diarrhea

#### 3. Gut Microbiome Changes
- Surgery and antibiotic use may affect gut flora balance
- Microbiome imbalance leads to digestive dysfunction

### Scientific Management Strategies

#### Dietary Adjustments

**Phase 1: Postoperative Weeks 1-2 (Low-Fat Liquid)**
- Avoid high-fat foods
- Small, frequent meals (≤200ml per meal)
- Recommended foods: rice soup, water chestnut powder, protein water, congee

**Phase 2: Postoperative Weeks 3-4 (Low-Fat Semi-Liquid)**
- Gradually increase food variety
- Avoid fried foods, fatty meats, cream, and other high-fat foods
- Recommended foods: steamed eggs, soft noodles, steamed buns, boiled vegetables

**Phase 3: Postoperative 1+ Months (Gradual Normalization)**
- Gradually return to normal diet
- Monitor body response
- Avoid overeating

### Medication Recommendations

#### Probiotics
- Bifidobacteria, Lactobacillus and other probiotic formulations
- Help regulate gut flora
- Administration: after meals with warm water

#### Antidiarrheal Medications
- Montmorillonite powder: protects intestinal mucosa
- Loperamide: reduces intestinal motility
- Use: Short-term use for severe symptoms

### Important Reminders

#### When to Seek Medical Attention
- Diarrhea persists for more than 2 weeks
- Dehydration symptoms appear (reduced urine output, dry mouth)
- Fever or worsening abdominal pain
- Blood or mucus in stool

#### Long-term Considerations
- Avoid prolonged bed rest
- Moderate exercise to promote intestinal motility
- Maintain positive mindset
- Regular liver function check-ups

### Conclusion

Post-cholecystectomy diarrhea is common, but most patients can gradually recover within 3-6 months through scientific dietary management and appropriate medication. Consult your doctor if you have any concerns.
"""

    # Create frontmatter
    frontmatter = f"""---
title: {title}
titleEn: {title_en}
category: {category}
categoryEn: {category_en}
imageUrl: /images/blog/gallbladder-removal-diarrhea-management-{datetime.now().strftime('%Y%m%d')}.jpg
excerpt: 胆囊切除术后腹泻是常见症状，本文详细介绍腹泻的原因、科学管理策略、药物治疗建议及就医时机，助您科学恢复。
excerptEn: Diarrhea after gallbladder removal is common. This article covers causes, management strategies, medications, and when to seek medical help.
seoTitle: 胆囊切除术后腹泻管理指南 | 肝胆外科专家建议
seoDescription: 胆囊切除术后腹泻怎么办？肝胆外科专家详解腹泻原因、饮食调整、药物治疗及康复指导，助您科学度过恢复期。
publish_date: {datetime.now().strftime('%Y-%m-%d')}
status: draft
---

"""
    
    # Combine content
    content = frontmatter + markdown_zh
    
    # Save
    slug = make_slug(title)
    draft_path = DRAFTS_DIR / f"{slug}.md"
    draft_path.write_text(content, encoding='utf-8')
    print(f"[DRAFT] Saved: {draft_path}")
    
    return {
        "title": title,
        "titleEn": title_en,
        "slug": slug,
        "category": category,
        "excerpt": markdown_zh[:100] + "...",
        "markdownZh": markdown_zh,
        "markdownEn": markdown_zh.split('---\n\n')[1] if '---\n\n' in markdown_zh else markdown_zh,
    }

def main():
    print("=== Simple Daily Blog Update Test ===")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    try:
        # Create test post
        data = create_test_post()
        slug = data['slug']
        print(f"✅ Created test post: {data['title']}")
        print(f"✅ Slug: {slug}")
        
        # Create summary
        summary = {
            "title": data['title'],
            "slug": slug,
            "image_url": f"/images/blog/gallbladder-removal-diarrhea-management-{datetime.now().strftime('%Y%m%d')}.jpg",
            "category": data['category'],
            "refs_count": 3,  # Example reference count
            "pushed": False,
            "status": "DRAFT_CREATED"
        }
        
        # Write summary
        summary_file = SCRIPTS_DIR / "today_summary.txt"
        summary_file.write_text(
            f"Title: {summary['title']}\n"
            f"Slug: {summary['slug']}\n"
            f"Image: {summary['image_url']}\n"
            f"References: {summary['refs_count']}\n"
            f"Status: DRAFT_CREATED\n"
            f"Date: {datetime.now().strftime('%Y-%m-%d')}\n"
            f"Category: {summary['category']}\n",
            encoding='utf-8'
        )
        
        print("✅ Summary saved")
        return summary
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "FAILED", "error": str(e)}

if __name__ == "__main__":
    result = main()
    print(f"\nResult: {result}")