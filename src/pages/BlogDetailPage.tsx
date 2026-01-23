import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Share2, Clock, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getBlogPostById } from '../data/blog-posts';

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const article = getBlogPostById(id || '');

  // 获取文章标题
  const title = isEnglish ? article?.titleEn : article?.title;
  const excerpt = isEnglish ? article?.excerptEn : article?.excerpt;
  const category = isEnglish ? article?.categoryEn : article?.category;

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
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = isEnglish ? 200 : 400;
    const wordCount = content.length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return isEnglish ? `${minutes} min read` : `${minutes} 分钟阅读`;
  };

  // 加载 Markdown 内容
  useEffect(() => {
    const loadMarkdownContent = async () => {
      if (!article) {
        setLoading(false);
        return;
      }

      try {
        // 尝试从 public/blog-posts 目录加载
        const publicPath = `/blog-posts/${article.id}.md`;
        const response = await fetch(publicPath);

        if (response.ok) {
          const text = await response.text();
          setMarkdownContent(text);
        } else {
          // 如果 public 目录没有，显示默认内容
          setMarkdownContent(getDefaultMarkdownContent(article, isEnglish));
        }
      } catch (err) {
        // 加载失败时使用默认内容
        setMarkdownContent(getDefaultMarkdownContent(article, isEnglish));
      } finally {
        setLoading(false);
      }
    };

    loadMarkdownContent();
  }, [article, isEnglish]);

  // 如果没有提供 id，重定向到博客列表页
  if (!id || !article) {
    return <Navigate to="/blog" />;
  }

  // 默认 Markdown 内容
  const getDefaultMarkdownContent = (post: any, english: boolean) => {
    const title = english ? post.titleEn : post.title;
    const category = english ? post.categoryEn : post.category;
    const excerpt = english ? post.excerptEn : post.excerpt;

    return `# ${title}

> **${category}** • ${formatDate(post.date)}

---

## 文章简介

${excerpt}

## 关于作者

**刘波主任**，医学博士、教授、博士生导师，现任中山大学附属第三医院胆石症中心主任，岭南医院肝胆胰脾外科主任、普通外科主任。拥有超过三十年肝胆外科临床经验，专注于胆结石、肝癌、肝硬化与门静脉高压等疾病的微创治疗。

## 阅读更多

如需了解更多关于胆结石治疗的信息，欢迎浏览我们的其他文章，或前往[门诊咨询](/clinic)。

---

*免责声明：本文仅供健康科普参考，不能替代专业医疗建议。如有相关症状，请及时就医。*
`;
  };

  // 处理分享
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || '',
          text: excerpt || '',
          url: window.location.href
        });
      } catch (err) {
        // 用户取消分享
      }
    } else {
      // 复制链接
      navigator.clipboard.writeText(window.location.href);
      alert(isEnglish ? 'Link copied to clipboard!' : '链接已复制到剪贴板！');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">
            {isEnglish ? 'Loading article...' : '加载文章中...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center text-gray-200 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              <span>{isEnglish ? 'Back to Blog' : '返回博客'}</span>
            </Link>
          </motion.div>

          <motion.h1
            className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h1>

          <motion.div
            className="flex flex-wrap items-center gap-4 text-gray-200 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{article.author || (isEnglish ? 'Dr. Liu Bo' : '刘波主任')}</span>
            </div>
            {article.date && (
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(article.date)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{calculateReadTime(markdownContent)}</span>
            </div>
            {category && (
              <div className="flex items-center gap-2">
                <Tag size={16} />
                <span>{category}</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Article Content */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Featured Image */}
            {article.imageUrl && (
              <motion.div
                className="mb-10 rounded-2xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <img
                  src={article.imageUrl}
                  alt={title}
                  className="w-full h-auto"
                />
              </motion.div>
            )}

            {/* Article Body */}
            <motion.div
              className="prose prose-lg prose-primary max-w-none blog-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-primary-600 hover:text-primary-700 underline"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary-500 pl-4 py-2 my-6 bg-primary-50 text-gray-700 italic">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-800">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full border border-gray-300">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 px-4 py-2 text-left">
                      {children}
                    </td>
                  ),
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </motion.div>

            {/* Share & Tags */}
            <motion.div
              className="mt-12 pt-8 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-4 font-medium">
                    {isEnglish ? 'Share this article:' : '分享本文：'}
                  </span>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Share2 size={18} />
                    <span>{isEnglish ? 'Share' : '分享'}</span>
                  </button>
                </div>

                {category && (
                  <span className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    <Tag size={16} className="mr-2" />
                    {category}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Disclaimer */}
            <motion.div
              className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-sm text-yellow-800">
                {isEnglish
                  ? 'Disclaimer: This article is for health education purposes only and cannot replace professional medical advice. If you have related symptoms, please seek medical attention promptly.'
                  : '免责声明：本文仅供健康科普参考，不能替代专业医疗建议。如有相关症状，请及时就医。'}
              </p>
            </motion.div>

            {/* Back to blog */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link
                to="/blog"
                className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                <span>{isEnglish ? 'Back to Blog' : '返回博客'}</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Articles Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {isEnglish ? 'Latest Articles' : '最新文章'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {blogPosts.slice(0, 3).map((post) => {
              const postTitle = isEnglish ? post.titleEn : post.title;
              const postExcerpt = isEnglish ? post.excerptEn : post.excerpt;
              const postCategory = isEnglish ? post.categoryEn : post.category;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={post.id === article.id ? 'hidden' : ''}
                >
                  <Link
                    to={`/blog/${post.id}`}
                    className="bg-white rounded-xl shadow-soft hover:shadow-lg border border-gray-100 overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={post.imageUrl || '/images/pocs-surgery.jpg'}
                        alt={postTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-primary-100 text-primary-700 mb-2 w-fit">
                        {postCategory}
                      </span>

                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                        {postTitle}
                      </h3>

                      <p className="text-gray-600 text-sm line-clamp-2">
                        {postExcerpt}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

// 导入 blogPosts 用于相关文章
import { blogPosts } from '../data/blog-posts';

export default BlogDetailPage;
