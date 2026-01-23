import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, FileText, Eye, Trash2, Check, ArrowRight, Plus } from 'lucide-react';

// 草稿类型
interface Draft {
  id: string;
  title: string;
  date: string;
  status: 'draft' | 'review' | 'published';
  preview?: string;
}

const BlogDraftsPage = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 加载草稿列表（这里使用本地存储演示）
  useEffect(() => {
    // 在实际应用中，这里应该从后端 API 获取草稿列表
    // 现在使用 localStorage 演示
    const savedDrafts = localStorage.getItem('blog-drafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    } else {
      // 默认示例草稿
      setDrafts([
        {
          id: 'draft-1',
          title: 'POCS技术在胆道狭窄治疗中的应用',
          date: '2025-01-23',
          status: 'draft',
          preview: '胆道狭窄是胆道疾病中较为复杂的病变类型...'
        },
        {
          id: 'draft-2',
          title: '胆结石患者的生活方式调整建议',
          date: '2025-01-22',
          status: 'review',
          preview: '除了手术治疗外，生活方式的调整对胆结石...'
        }
      ]);
    }
  }, []);

  // 保存草稿列表
  const saveDrafts = (newDrafts: Draft[]) => {
    setDrafts(newDrafts);
    localStorage.setItem('blog-drafts', JSON.stringify(newDrafts));
  };

  // 过滤草稿
  const filteredDrafts = drafts.filter(draft => {
    const matchesStatus = filterStatus === 'all' || draft.status === filterStatus;
    const matchesSearch = draft.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 删除草稿
  const handleDelete = (id: string) => {
    if (confirm(isEnglish ? 'Are you sure you want to delete this draft?' : '确定要删除这篇草稿吗？')) {
      saveDrafts(drafts.filter(d => d.id !== id));
    }
  };

  // 移动状态
  const handleStatusChange = (id: string, newStatus: 'draft' | 'review' | 'published') => {
    saveDrafts(drafts.map(d =>
      d.id === id ? { ...d, status: newStatus } : d
    ));
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 状态标签
  const statusBadge = (status: string) => {
    const badges = {
      draft: { color: 'bg-yellow-100 text-yellow-800', icon: FileText, label: isEnglish ? 'Draft' : '草稿' },
      review: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: isEnglish ? 'Review' : '审核中' },
      published: { color: 'bg-green-100 text-green-800', icon: Check, label: isEnglish ? 'Published' : '已发布' }
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  // 统计信息
  const stats = {
    total: drafts.length,
    draft: drafts.filter(d => d.status === 'draft').length,
    review: drafts.filter(d => d.status === 'review').length,
    published: drafts.filter(d => d.status === 'published').length
  };

  return (
    <>
      {/* Page Header */}
      <div className="pt-24 pb-12 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-serif font-bold">
              {isEnglish ? 'Blog Drafts Management' : '博客草稿管理'}
            </h1>
            <Link
              to="/blog/drafts/new"
              className="flex items-center gap-2 px-4 py-2 bg-white text-primary-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <Plus size={18} />
              <span>{isEnglish ? 'Create New' : '新建草稿'}</span>
            </Link>
          </div>
          <p className="text-gray-200 max-w-3xl">
            {isEnglish
              ? 'Manage your blog article drafts, review, and publish them when ready.'
              : '管理您的博客文章草稿，审核后准备发布。'}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-sm">{isEnglish ? 'Total' : '总计'}:</span>
              <span className="font-bold">{stats.total}</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
              <FileText size={16} />
              <span className="font-bold">{stats.draft}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-lg">
              <Eye size={16} />
              <span className="font-bold">{stats.review}</span>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg">
              <Check size={16} />
              <span className="font-bold">{stats.published}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <section className="py-6 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filterStatus === 'all'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setFilterStatus('all')}
              >
                {isEnglish ? 'All' : '全部'}
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filterStatus === 'draft'
                    ? 'bg-yellow-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setFilterStatus('draft')}
              >
                {isEnglish ? 'Drafts' : '草稿'}
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filterStatus === 'review'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setFilterStatus('review')}
              >
                {isEnglish ? 'Under Review' : '审核中'}
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  filterStatus === 'published'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setFilterStatus('published')}
              >
                {isEnglish ? 'Published' : '已发布'}
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                className="w-full md:w-80 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none transition-shadow"
                placeholder={isEnglish ? 'Search drafts...' : '搜索草稿...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* Drafts List */}
      <section className="py-12 md:py-16 bg-white min-h-[600px]">
        <div className="container mx-auto px-4 max-w-5xl">
          {filteredDrafts.length > 0 ? (
            <div className="space-y-4">
              {filteredDrafts.map((draft, index) => {
                const badge = statusBadge(draft.status);
                const StatusIcon = badge.icon;

                return (
                  <motion.div
                    key={draft.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                            <StatusIcon size={12} />
                            {badge.label}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(draft.date)}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {draft.title}
                        </h3>
                        {draft.preview && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {draft.preview}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 md:flex-shrink-0">
                        <button
                          onClick={() => handleStatusChange(draft.id, 'review')}
                          className={`p-2 rounded-lg transition-colors ${
                            draft.status === 'draft'
                              ? 'text-blue-600 hover:bg-blue-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={isEnglish ? 'Mark for review' : '标记为审核中'}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(draft.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title={isEnglish ? 'Delete draft' : '删除草稿'}
                        >
                          <Trash2 size={18} />
                        </button>
                        <Link
                          to="#"
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          {isEnglish ? 'Edit' : '编辑'}
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {isEnglish ? 'No drafts found' : '没有找到草稿'}
              </h3>
              <p className="text-gray-500 mb-4">
                {isEnglish
                  ? filterStatus === 'all'
                    ? 'Click "Create New" to start writing your first article.'
                    : `No ${filterStatus} drafts yet.`
                  : filterStatus === 'all'
                    ? '点击"新建草稿"开始撰写你的第一篇文章。'
                    : `还没有${filterStatus === 'draft' ? '草稿' : filterStatus === 'review' ? '审核中' : '已发布'}的文章。`}
              </p>
              {filterStatus === 'all' && (
                <Link
                  to="/blog/drafts/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={18} />
                  <span>{isEnglish ? 'Create New Draft' : '新建草稿'}</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isEnglish ? 'Quick Actions' : '快捷操作'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 text-left">
              <Plus className="text-primary-600 mb-3" size={24} />
              <h3 className="font-semibold text-gray-900 mb-1">
                {isEnglish ? 'Create Draft from Template' : '从模板创建草稿'}
              </h3>
              <p className="text-sm text-gray-600">
                {isEnglish
                  ? 'Generate a draft based on hot topics and templates'
                  : '基于热点话题和模板生成草稿'}
              </p>
            </button>
            <button className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 text-left">
              <Search className="text-primary-600 mb-3" size={24} />
              <h3 className="font-semibold text-gray-900 mb-1">
                {isEnglish ? 'Search Hot Topics' : '搜索热点话题'}
              </h3>
              <p className="text-sm text-gray-600">
                {isEnglish
                  ? 'Find trending topics in hepatobiliary health'
                  : '查找肝胆健康领域的热点话题'}
              </p>
            </button>
            <Link
              to="/blog"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 text-left"
            >
              <FileText className="text-primary-600 mb-3" size={24} />
              <h3 className="font-semibold text-gray-900 mb-1">
                {isEnglish ? 'View Published Blog' : '查看已发布博客'}
              </h3>
              <p className="text-sm text-gray-600">
                {isEnglish ? 'See all published articles' : '查看所有已发布的文章'}
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDraftsPage;
