import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogPosts, blogCategories, searchBlogPosts } from '../data/blog-posts';
import SectionHeader from '../components/common/SectionHeader';

const BlogPage = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 9;

  // 根据分类和搜索过滤文章
  const filteredPosts = useMemo(() => {
    let result = [...blogPosts];

    // 按分类过滤
    if (activeCategory) {
      result = result.filter(post =>
        isEnglish ? post.categoryEn === activeCategory : post.category === activeCategory
      );
    }

    // 按搜索词过滤
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(post => {
        const title = isEnglish ? post.titleEn.toLowerCase() : post.title.toLowerCase();
        const excerpt = isEnglish ? post.excerptEn.toLowerCase() : post.excerpt.toLowerCase();
        return title.includes(lowerQuery) || excerpt.includes(lowerQuery);
      });
    }

    // 按日期降序排序
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeCategory, searchQuery, isEnglish]);

  // 分页计算
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const categories = blogCategories(isEnglish);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 计算阅读时间
  const calculateReadTime = (excerpt: string) => {
    const wordsPerMinute = isEnglish ? 200 : 400; // 中文阅读速度更快
    const wordCount = excerpt.length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return isEnglish ? `${minutes} min read` : `${minutes} 分钟阅读`;
  };

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
        <div className="container mx-auto px-4">
          <motion.h1
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-center mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {isEnglish ? 'Dr. Liu Bo\'s Medical Blog' : '刘波主任医学博客'}
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

      {/* Stats Bar */}
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

      {/* Filters Section */}
      <section className="py-6 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Categories */}
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

            {/* Search */}
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

      {/* Articles Section */}
      <section className="py-12 md:py-16 bg-white min-h-[600px]">
        <div className="container mx-auto px-4">
          {paginatedPosts.length > 0 ? (
            <>
              {/* Article Grid */}
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
                        {/* Article Image */}
                        <div className="aspect-video overflow-hidden bg-gray-100">
                          <img
                            src={post.imageUrl || '/images/pocs-surgery.jpg'}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-grow flex flex-col">
                          {/* Category Badge */}
                          <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-primary-100 text-primary-700 mb-3 w-fit">
                            {category}
                          </span>

                          {/* Title */}
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                            {excerpt}
                          </p>

                          {/* Meta */}
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

              {/* Pagination */}
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

      {/* Newsletter Section */}
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
                ? 'Subscribe to Dr. Liu Bo\'s newsletter for regular updates on gallstone treatment and hepatobiliary health.'
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
