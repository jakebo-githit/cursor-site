import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import ArticleCard from '../components/articles/ArticleCard';

const ArticlesPage = () => {
  const { t } = useTranslation();
  
  // Get categories and featured articles from translations
  const categories = t('articles.categories', { returnObjects: true }) as string[];
  const featuredArticles = t('articles.featuredArticles', { returnObjects: true }) as {
    title: string;
    excerpt: string;
    date: string;
  }[];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // For demo purposes - in a real app, this would filter based on actual data
  const filteredArticles = featuredArticles;

  return (
    <>
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-primary-800 text-white">
        <div className="container mx-auto px-4">
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('articles.title')}
          </motion.h1>
          <motion.p
            className="text-xl text-gray-200 text-center mt-4 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('articles.subtitle')}
          </motion.p>
        </div>
      </div>

      {/* Filters Section */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === null 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveCategory(null)}
              >
                {t('common.home') === 'Home' ? 'All' : '全部'}
              </button>
              
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none"
                placeholder={t('common.home') === 'Home' ? 'Search articles...' : '搜索文章...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={t('common.home') === 'Home' ? 'Latest Articles' : '最新文章'}
            subtitle={t('common.home') === 'Home' 
              ? 'Stay informed with Dr. Liu Bo\'s expert insights on gallstone management'
              : '获取刘波主任关于胆结石管理的专家见解'}
            centered
          />

          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filteredArticles.map((article, index) => {
              // 根据文章索引选择相应的图片
              let articleImage = '/images/pocs-surgery.jpg';
              let articleId = '';
              
              if (index === 0) {
                articleImage = '/images/gallstone-prevention.jpg';
                articleId = 'gallstone-prevention';
              } else if (index === 1) {
                articleImage = '/images/dietary-guidance.jpg';
                articleId = 'dietary-guidance';
              } else if (index === 2) {
                articleImage = '/images/liver-health.jpg';
                articleId = 'liver-health';
              } else if (index === 3) {
                articleImage = '/images/recovery-guide.jpg';
                articleId = 'post-surgery-recovery';
              }
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ArticleCard
                    title={article.title}
                    excerpt={article.excerpt}
                    date={article.date}
                    category={categories[index % categories.length]}
                    imageUrl={articleImage}
                    articleId={articleId}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Pagination (simplified for demo) */}
          <div className="flex justify-center mt-12">
            <div className="inline-flex rounded-md shadow-sm">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50">
                {t('common.home') === 'Home' ? 'Previous' : '上一页'}
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-primary-600">
                1
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50">
                {t('common.home') === 'Home' ? 'Next' : '下一页'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-12 bg-primary-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
              {t('common.home') === 'Home' 
                ? 'Stay Updated with the Latest Medical Insights' 
                : '获取最新医学见解'}
            </h2>
            
            <p className="text-gray-300 mb-6">
              {t('common.home') === 'Home' 
                ? 'Subscribe to Dr. Liu Bo\'s newsletter for regular updates on gallstone treatment and liver health.' 
                : '订阅刘波主任的newsletter，定期获取胆结石治疗和肝脏健康的最新资讯。'}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
              <input
                type="email"
                className="px-4 py-3 rounded-md border border-gray-400 bg-primary-800 text-white focus:ring-2 focus:ring-secondary focus:outline-none flex-grow"
                placeholder={t('common.home') === 'Home' ? 'Your email address' : '您的邮箱地址'}
              />
              <button className="px-6 py-3 bg-secondary hover:bg-secondary-600 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none">
                {t('common.home') === 'Home' ? 'Subscribe' : '订阅'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ArticlesPage;