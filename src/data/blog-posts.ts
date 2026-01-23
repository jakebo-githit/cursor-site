// 博客文章元数据配置
// 每次添加新文章时，需要在这里添加对应的元数据
// 同时在 src/blog-posts/ 目录下创建对应的 .md 文件

export interface BlogPost {
  id: string;           // 文章唯一标识（对应 .md 文件名）
  title: string;        // 中文标题
  titleEn: string;      // 英文标题
  excerpt: string;      // 中文摘要
  excerptEn: string;    // 英文摘要
  date: string;         // 发布日期 (YYYY-MM-DD)
  category: string;     // 中文分类
  categoryEn: string;   // 英文分类
  imageUrl?: string;    // 图片URL（可选）
  author?: string;      // 作者（可选）
}

export const blogPosts: BlogPost[] = [
  {
    id: 'pocs-vs-traditional',
    title: 'POCS技术与传统手术的对比',
    titleEn: 'Comparison between POCS Technology and Traditional Surgery',
    excerpt: 'POCS技术作为一种先进的微创治疗手段，相比传统开腹手术有哪些优势？本文从创伤程度、恢复时间、并发症风险等方面进行详细对比分析。',
    excerptEn: 'As an advanced minimally invasive treatment method, what advantages does POCS technology have compared to traditional open surgery? This article provides a detailed comparative analysis in terms of trauma degree, recovery time, and complication risk.',
    date: '2025-01-05',
    category: '技术介绍',
    categoryEn: 'Technology Introduction',
    imageUrl: '/images/pocs-surgery.jpg',
    author: '刘波主任'
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
