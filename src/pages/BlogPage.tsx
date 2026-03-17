import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPosts, blogCategories } from '../data/blog-posts';
import SectionHeader from '../components/common/SectionHeader';

const BlogPage = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 9;

  const topicClusters = useMemo(() => [
    {
      key: 'cholecystitis',
      title: isEnglish ? 'Cholecystitis' : '胆囊炎专题',
      description: isEnglish
        ? 'Focus on recurrent attacks, antibiotic use, dietary triggers, and the warning signs that need urgent evaluation.'
        : '围绕胆囊炎反复发作、抗生素使用、饮食刺激和就医时机，帮助读者更快判断当前问题属于哪一类。',
      posts: blogPosts.filter((post) => post.category === '胆囊炎').slice(0, 2)
    },
    {
      key: 'gallstones',
      title: isEnglish ? 'Gallstones' : '胆囊结石专题',
      description: isEnglish
        ? 'Understand risk, prevention, myths around natural passage, and when observation is no longer safe.'
        : '重点解释胆囊结石能否自己排出、如何通过饮食降低风险，以及哪些情况不适合继续拖延观察。',
      posts: blogPosts.filter((post) => post.category === '胆囊结石').slice(0, 2)
    },
    {
      key: 'preservation',
      title: isEnglish ? 'Gallbladder Preservation' : '保胆评估专题',
      description: isEnglish
        ? 'Learn who may be suitable for preservation, what evaluation matters most, and how recovery is managed.'
        : '聚焦保胆取石适合哪些人、术前评估看什么、术后恢复怎么安排，帮助读者理解治疗决策的关键点。',
      posts: blogPosts.filter((post) => post.category === '保胆').slice(0, 2)
    },
    {
      key: 'post-op',
      title: isEnglish ? 'Post-Cholecystectomy Nutrition' : '术后营养专题',
      description: isEnglish
        ? 'Practical guidance for diarrhea, fat intolerance, staged diet progression, and longer-term nutrition recovery.'
        : '重点回答切除胆囊后吃什么、腹泻怎么办、油腻不耐受怎么调，以及术后营养恢复的节奏。',
      posts: blogPosts.filter((post) => post.category === '胆囊切除术后营养').slice(0, 2)
    }
  ], [isEnglish]);

  useEffect(() => {
    const title = isEnglish ? 'Gallbladder Health Blog | AskDrLiu.com' : '胆囊健康医学博客 | 刘波主任';
    const description = isEnglish
      ? 'Medical articles on cholecystitis, gallstones, gallbladder preservation, and post-cholecystectomy nutrition.'
      : '围绕胆囊炎、胆囊结石、保胆评估和胆囊切除术后营养恢复，持续更新更适合中文搜索与患者阅读的医学博客内容。';
    const canonicalHref = `${window.location.origin}/blog`;

    const setMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (property) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content || '');
    };

    document.title = title;
    setMeta('description', description);
    setMeta('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', canonicalHref, true);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);

    const schema = [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: isEnglish ? 'Gallbladder Health Blog' : '胆囊健康医学博客',
        url: canonicalHref,
        description
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: isEnglish ? 'Home' : '首页',
            item: window.location.origin
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: isEnglish ? 'Blog' : '博客',
            item: canonicalHref
          }
        ]
      }
    ];

    const scriptId = 'blog-index-jsonld';
    const old = document.getElementById(scriptId);
    if (old) old.remove();
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const toRemove = document.getElementById(scriptId);
      if (toRemove) toRemove.remove();
    };
  }, [isEnglish]);

  const filteredPosts = useMemo(() => {
    let result = [...blogPosts];

    if (activeCategory) {
      result = result.filter((post) =>
        isEnglish ? post.categoryEn === activeCategory : post.category === activeCategory
      );
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((post) => {
        const title = isEnglish ? post.titleEn.toLowerCase() : post.title.toLowerCase();
        const excerpt = isEnglish ? post.excerptEn.toLowerCase() : post.excerpt.toLowerCase();
        return title.includes(lowerQuery) || excerpt.includes(lowerQuery);
      });
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeCategory, searchQuery, isEnglish]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const categories = blogCategories(isEnglish);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (excerpt: string) => {
    const wordsPerMinute = isEnglish ? 200 : 400;
    const wordCount = excerpt.length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return isEnglish ? `${minutes} min read` : `${minutes} 分钟阅读`;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="pt-24 pb-12 bg-primary-800 text-white">
        <div className="container mx-auto px-4">
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-center mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isEnglish ? "Dr. Liu Bo's Medical Blog" : '刘波主任医学博客'}
          </motion.h1>
          <motion.p
            className="text-xl text-gray-200 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isEnglish
              ? 'Expert insights on gallstone treatment, hepatobiliary health, and minimally invasive surgery'
              : '关于胆结石治疗、肝胆健康和微创手术的专家见解'}
          </motion.p>
        </div>
      </div>

      <section className="py-6 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-8 md:gap-16 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User size={16} className="text-primary-600" />
              <span>{isEnglish ? 'Dr. Liu Bo' : '刘波主任'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary-600" />
              <span>{isEnglish ? `${blogPosts.length} Articles` : `${blogPosts.length} 篇文章`}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary-600" />
              <span>{isEnglish ? 'Updated Daily' : '每日更新'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#f7f4ed] border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div>
              <SectionHeader title={isEnglish ? 'How to Use This Blog' : '这个博客页解决什么问题'} />
              <div className="space-y-4 text-gray-700 leading-8">
                <p>
                  {isEnglish
                    ? 'This page is designed as a topic hub rather than a simple archive. It groups the most important gallbladder questions into clearer reading paths.'
                    : '这个页面不只是文章列表，而是围绕胆囊炎、胆囊结石、保胆评估和胆囊切除术后营养恢复，建立一个更容易被读者理解、也更容易被搜索引擎识别的专题内容入口。'}
                </p>
                <p>
                  {isEnglish
                    ? 'If you are trying to understand whether symptoms are urgent, whether diet is making things worse, or whether preservation is still possible, start from the topic clusters below.'
                    : '如果你正在关心胆囊炎反复发作怎么办、胆囊结石能不能继续观察、保胆取石适不适合自己，或者切除胆囊后腹泻、吃油不适、营养恢复慢，这个页面会比单篇文章更适合作为起点。'}
                </p>
                <p>
                  {isEnglish
                    ? 'From an SEO and navigation perspective, we organize content around symptom-driven and decision-driven searches so readers can reach the next useful article faster.'
                    : '从 SEO 和用户体验的角度，我们把内容按问题路径组织起来，让读者能更快进入“症状判断、治疗决策、术后恢复”这些真正有搜索需求的主题，而不是随机翻找文章。'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">
                {isEnglish ? 'Priority Topic Clusters' : '优先阅读的 4 个专题'}
              </h2>
              <ul className="space-y-3 text-sm text-gray-700">
                {topicClusters.map((cluster) => (
                  <li key={cluster.key} className="rounded-xl bg-gray-50 px-4 py-3">
                    <div className="font-medium text-primary-900">{cluster.title}</div>
                    <div className="mt-1 text-gray-600">{cluster.description}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <SectionHeader
              title={isEnglish ? 'Browse by Topic' : '按主题进入阅读'}
              subtitle={isEnglish
                ? 'These topic clusters strengthen internal linking and help readers reach the right next article faster.'
                : '这 4 个主题分区既帮助读者更快找到目标文章，也能强化站内内链结构。'}
              centered
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topicClusters.map((cluster) => (
                <div key={cluster.key} className="rounded-2xl border border-gray-200 bg-[#fbfaf7] p-6 shadow-soft">
                  <h2 className="text-xl font-semibold text-primary-900 mb-3">{cluster.title}</h2>
                  <p className="text-gray-700 leading-7 mb-4">{cluster.description}</p>
                  <div className="space-y-3">
                    {cluster.posts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.id}`}
                        className="block rounded-xl bg-white border border-gray-200 px-4 py-3 text-primary-800 hover:border-primary-400 hover:text-primary-600 transition-colors"
                      >
                        {isEnglish ? post.titleEn : post.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === null
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setActiveCategory(null);
                  setCurrentPage(1);
                }}
              >
                {isEnglish ? 'All' : '全部'}
              </button>

              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === category
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setActiveCategory(category);
                    setCurrentPage(1);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-auto">
              <input
                type="text"
                className="w-full lg:w-80 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none transition-shadow"
                placeholder={isEnglish ? 'Search articles...' : '搜索文章...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white min-h-[600px]">
        <div className="container mx-auto px-4">
          {paginatedPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post, index) => {
                  const title = isEnglish ? post.titleEn : post.title;
                  const excerpt = isEnglish ? post.excerptEn : post.excerpt;
                  const category = isEnglish ? post.categoryEn : post.category;
                  const readTime = calculateReadTime(excerpt);

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link
                        to={`/blog/${post.id}`}
                        className="group bg-white rounded-xl shadow-soft hover:shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="aspect-video overflow-hidden bg-gray-100">
                          <img
                            src={post.imageUrl || '/images/pocs-surgery.jpg'}
                            alt={title}
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (!target.src.includes('/images/pocs-surgery.jpg')) {
                                target.src = '/images/pocs-surgery.jpg';
                              }
                            }}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="p-5 flex-grow flex flex-col">
                          <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-primary-100 text-primary-700 mb-3 w-fit">
                            {category}
                          </span>

                          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {title}
                          </h3>

                          <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                            {excerpt}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              <span>{formatDate(post.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span>{readTime}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="inline-flex items-center rounded-lg shadow-sm">
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {isEnglish ? 'Previous' : '上一页'}
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`px-4 py-2 text-sm font-medium border border-gray-300 ${
                          currentPage === page
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {isEnglish ? 'Next' : '下一页'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Search className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {isEnglish ? 'No articles found' : '没有找到相关文章'}
              </h3>
              <p className="text-gray-500">
                {isEnglish
                  ? 'Try adjusting your search or category filter'
                  : '请尝试调整搜索关键词或分类筛选'}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
              {isEnglish
                ? 'Stay Updated with Latest Medical Insights'
                : '订阅最新医学见解'}
            </h2>

            <p className="text-gray-300 mb-6">
              {isEnglish
                ? "Subscribe to Dr. Liu Bo's newsletter for regular updates on gallstone treatment and hepatobiliary health."
                : '订阅刘波主任的newsletter，定期获取胆结石治疗和肝胆健康的最新资讯。'}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
              <input
                type="email"
                className="px-4 py-3 rounded-md border border-gray-400 bg-primary-800 text-white focus:ring-2 focus:ring-secondary focus:outline-none flex-grow placeholder-gray-400"
                placeholder={isEnglish ? 'Your email address' : '您的邮箱地址'}
              />
              <button className="px-6 py-3 bg-secondary hover:bg-secondary-600 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none">
                {isEnglish ? 'Subscribe' : '订阅'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPage;
