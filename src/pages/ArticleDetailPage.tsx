import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Share2 } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';

// 导入文章组件
import GallstonePrevention from './articles/GallstonePrevention';
import DietaryGuidance from './articles/DietaryGuidance';

// 文章内容类型
type ArticleContent = {
  title: string;
  date: string;
  category: string;
  imageUrl: string;
  content: React.ReactNode;
  relatedArticles?: {
    id: string;
    title: string;
  }[];
};

// 对应文章ID的内容映射
const articleContents: Record<string, ArticleContent> = {
  'gallstone-prevention': {
    title: '胆结石形成的原因及预防措施',
    date: '2025-03-15',
    category: '胆结石预防',
    imageUrl: '/images/gallstone-prevention.jpg',
    content: <GallstonePrevention />,
    relatedArticles: [
      {
        id: 'dietary-guidance',
        title: 'POCS手术前后的饮食指导'
      },
      {
        id: 'liver-health',
        title: '肝胆健康的自我监测方法'
      }
    ]
  },
  'dietary-guidance': {
    title: 'POCS手术前后的饮食指导',
    date: '2025-02-22',
    category: '饮食指导',
    imageUrl: '/images/dietary-guidance.jpg',
    content: <DietaryGuidance />,
    relatedArticles: [
      {
        id: 'gallstone-prevention',
        title: '胆结石形成的原因及预防措施'
      },
      {
        id: 'recovery-guide',
        title: '术后康复指南：如何加速恢复'
      }
    ]
  },
  'liver-health': {
    title: '肝胆健康的自我监测方法',
    date: '2025-01-30',
    category: '肝胆健康',
    imageUrl: '/images/liver-health.jpg',
    content: <div className="text-center py-12">
      <p className="text-lg text-gray-600">该文章内容正在编写中，敬请期待...</p>
    </div>,
    relatedArticles: [
      {
        id: 'gallstone-prevention',
        title: '胆结石形成的原因及预防措施'
      }
    ]
  },
  'recovery-guide': {
    title: '术后康复指南：如何加速恢复',
    date: '2025-01-10',
    category: '术后护理',
    imageUrl: '/images/recovery-guide.jpg',
    content: <div className="text-center py-12">
      <p className="text-lg text-gray-600">该文章内容正在编写中，敬请期待...</p>
    </div>,
    relatedArticles: [
      {
        id: 'dietary-guidance',
        title: 'POCS手术前后的饮食指导'
      }
    ]
  }
};

const ArticleDetailPage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  
  // 如果没有提供articleId，重定向到文章列表页
  if (!articleId) {
    return <Navigate to="/articles" />;
  }

  // 获取文章内容，如果不存在则使用默认内容
  const article = articleContents[articleId] || {
    title: isEnglish ? 'Article Not Found' : '文章未找到',
    date: '',
    category: '',
    imageUrl: '/images/pocs-surgery.jpg',
    content: (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">
          {isEnglish 
            ? 'Sorry, the article you are looking for does not exist or has been removed.'
            : '抱歉，您查找的文章不存在或已被移除。'}
        </p>
        <Link 
          to="/articles" 
          className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          {isEnglish ? 'Return to Articles' : '返回文章列表'}
        </Link>
      </div>
    ),
  };

  // 英文模式下的标题翻译
  const titleMap: Record<string, string> = {
    '胆结石形成的原因及预防措施': 'Causes of Gallstone Formation and Preventive Measures',
    'POCS手术前后的饮食指导': 'Dietary Guidance Before and After POCS Surgery',
    '肝胆健康的自我监测方法': 'Self-monitoring Methods for Hepatobiliary Health',
    '术后康复指南：如何加速恢复': 'Post-operative Rehabilitation Guide: How to Accelerate Recovery'
  };

  // 英文模式下的分类翻译
  const categoryMap: Record<string, string> = {
    '胆结石预防': 'Gallstone Prevention',
    '饮食指导': 'Dietary Guidance',
    '肝胆健康': 'Hepatobiliary Health',
    '术后护理': 'Post-operative Care'
  };

  const displayTitle = isEnglish ? titleMap[article.title] || article.title : article.title;
  const displayCategory = isEnglish ? categoryMap[article.category] || article.category : article.category;

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
            {displayTitle}
          </motion.h1>
          
          {article.date && (
            <motion.div
              className="flex justify-center items-center mt-4 text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Calendar size={16} className="mr-2" />
              <span>{article.date}</span>
              
              {article.category && (
                <>
                  <span className="mx-2">•</span>
                  <Tag size={16} className="mr-2" />
                  <span>{displayCategory}</span>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back to articles */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link 
                to="/articles" 
                className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                <span>{isEnglish ? 'Back to Articles' : '返回文章列表'}</span>
              </Link>
            </motion.div>
            
            {/* Featured Image */}
            {article.imageUrl && (
              <motion.div
                className="mb-8 rounded-lg overflow-hidden shadow-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <img 
                  src={article.imageUrl} 
                  alt={displayTitle} 
                  className="w-full h-auto"
                />
              </motion.div>
            )}
            
            {/* Article Body */}
            <motion.div
              className="prose prose-lg max-w-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {article.content}
            </motion.div>
            
            {/* Share Links */}
            <motion.div
              className="mt-12 pt-8 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">{isEnglish ? 'Share this article:' : '分享本文：'}</span>
                <div className="flex space-x-4">
                  <button className="text-gray-500 hover:text-primary-600 transition-colors">
                    <Share2 size={20} />
                  </button>
                  {/* 这里可以添加更多分享按钮 */}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Articles Section */}
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <SectionHeader
              title={isEnglish ? 'Related Articles' : '相关文章'}
              subtitle=""
              centered
            />
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {article.relatedArticles.map((relatedArticle, index) => {
                const relatedTitle = isEnglish && titleMap[relatedArticle.title] 
                  ? titleMap[relatedArticle.title] 
                  : relatedArticle.title;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-soft p-6"
                  >
                    <h3 className="text-lg font-semibold text-primary-900 mb-2">
                      <Link 
                        to={`/articles/${relatedArticle.id}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {relatedTitle}
                      </Link>
                    </h3>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ArticleDetailPage; 