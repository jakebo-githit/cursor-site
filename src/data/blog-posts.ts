// 博客文章元数据配置
// 每次添加新文章时，需要在这里添加对应的元数据
// 同时在 src/blog-posts/ 目录下创建对应的 .md 文件

export interface BlogPost {
  id: string;           // 文章唯一标识（对应 .md 文件名）
  title: string;        // 中文标题
  titleEn: string;      // 英文标题
  excerpt: string;      // 中文摘要
  excerptEn: string;    // 英文摘要
  seoTitle?: string;    // SEO标题（可选）
  seoDescription?: string; // SEO描述（可选）
  date: string;         // 发布日期 (YYYY-MM-DD)
  category: string;     // 中文分类
  categoryEn: string;   // 英文分类
  imageUrl?: string;    // 图片URL（可选）
  author?: string;      // 作者（可选）
}

export const blogPosts: BlogPost[] = [
  {
    id: '肝硬化能逆转警惕钼元素疗法陷阱-1je8c',
    title: '肝硬化能逆转？警惕“钼元素”疗法陷阱',
    titleEn: '肝硬化能逆转？警惕“钼元素”疗法陷阱',
    excerpt: '肝硬化真的能逆转？刘波主任带你看清“钼元素”疗法的真相 文/肝胆外科专家 刘波主任 在我的门诊里，经常能遇到一脸焦虑的肝硬化患者。他们手里拿着厚厚的检查单，眼神中透着同一个疑问：“刘主任，肝硬化真的治不好吗？我在网上看到',
    excerptEn: '肝硬化真的能逆转？刘波主任带你看清“钼元素”疗法的真相 文/肝胆外科专家 刘波主任 在我的门诊里，经常能遇到一脸焦虑的肝硬化患者。他们手里拿着厚厚的检查单，眼神中透着同一个疑问：“刘主任，肝硬化真的治不好吗？我在网上看到',
    seoTitle: '肝硬化能逆转？警惕“钼元素”疗法陷阱',
    seoDescription: '肝硬化能逆转吗？本文基于真实研究，解析“钼元素疗法”常见误区，给出可执行的就医与管理建议。',
    date: '2026-03-09',
    category: '肝脏健康',
    categoryEn: 'Liver Health',
    imageUrl: '/images/blog/blog-肝硬化能逆转警惕钼元素疗法陷阱-1je8c.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '2026-03-04-cholecystectomy-diet',
    title: '切了胆囊，为什么吃点油还是难受？',
    titleEn: 'Why Does Eating Fat Still Hurt After Gallbladder Removal?',
    excerpt: '胆囊切除后仍然对油腻食物不耐受？肝胆外科医生从医学角度解析原因，并提供有文献依据的饮食建议。',
    excerptEn: 'Still struggling with fatty foods after cholecystectomy? A hepatobiliary surgeon explains the mechanism and offers evidence-based dietary advice.',
    seoTitle: '切了胆囊，为什么吃点油还是难受？',
    seoDescription: '胆囊切除后饮食怎么调？从机制、食物选择到就医指征，一文讲清术后油腻不适的应对方法。',
    date: '2026-03-04',
    category: '胆囊健康',
    categoryEn: 'Gallbladder Health',
    imageUrl: '/images/blog/blog-cholecystectomy-diet-cover.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: 'pocs-vs-traditional',
    title: 'POCS技术与传统手术的对比',
    titleEn: 'Comparison between POCS Technology and Traditional Surgery',
    excerpt: 'POCS技术作为一种先进的微创治疗手段，相比传统开腹手术有哪些优势？本文从创伤程度、恢复时间、并发症风险等方面进行详细对比分析。',
    excerptEn: 'As an advanced minimally invasive treatment method, what advantages does POCS technology have compared to traditional open surgery? This article provides a detailed comparative analysis in terms of trauma degree, recovery time, and complication risk.',
    seoTitle: 'POCS技术与传统手术的对比',
    seoDescription: 'POCS与传统手术怎么选？对比创伤、恢复时间、并发症风险，帮助患者做出更清晰的治疗决策。',
    date: '2025-01-05',
    category: '技术介绍',
    categoryEn: 'Technology Introduction',
    imageUrl: '/images/pocs-surgery.jpg',
    author: 'AskDrLiu.com'
  }
];

// 获取所有分类
export const blogCategories = (isEnglish: boolean): string[] => {
  const categorySet = new Set<string>();
  blogPosts.forEach(post => {
    categorySet.add(isEnglish ? post.categoryEn : post.category);
  });
  return Array.from(categorySet);
};

// 根据ID获取文章
export const getBlogPostById = (id: string): BlogPost | undefined => {
  return blogPosts.find(post => post.id === id);
};

// 根据分类过滤文章
export const getBlogPostsByCategory = (category: string, isEnglish: boolean): BlogPost[] => {
  return blogPosts.filter(post => {
    return isEnglish ? post.categoryEn === category : post.category === category;
  });
};

// 搜索文章
export const searchBlogPosts = (query: string, isEnglish: boolean): BlogPost[] => {
  const lowerQuery = query.toLowerCase();
  return blogPosts.filter(post => {
    const title = isEnglish ? post.titleEn.toLowerCase() : post.title.toLowerCase();
    const excerpt = isEnglish ? post.excerptEn.toLowerCase() : post.excerpt.toLowerCase();
    const category = isEnglish ? post.categoryEn.toLowerCase() : post.category.toLowerCase();
    return title.includes(lowerQuery) ||
           excerpt.includes(lowerQuery) ||
           category.includes(lowerQuery);
  });
};
