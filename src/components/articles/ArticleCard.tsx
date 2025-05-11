import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, Utensils, Heart, Activity } from 'lucide-react';

type ArticleCardProps = {
  title: string;
  excerpt: string;
  date: string;
  category?: string;
  imageUrl?: string;
  articleId?: string;
};

const ArticleCard = ({ 
  title, 
  excerpt, 
  date,
  category,
  imageUrl = "https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  articleId = ""
}: ArticleCardProps) => {
  // 为不同类别使用不同颜色和图标
  let categoryColor = "bg-primary-100 text-primary-800";
  let CategoryIcon = BookOpen;
  
  if (category) {
    if (category.includes("预防") || category.includes("Prevention")) {
      categoryColor = "bg-blue-100 text-blue-800";
      CategoryIcon = BookOpen;
    } else if (category.includes("健康") || category.includes("Health")) {
      categoryColor = "bg-green-100 text-green-800";
      CategoryIcon = Heart;
    } else if (category.includes("准备") || category.includes("Preparation")) {
      categoryColor = "bg-purple-100 text-purple-800";
      CategoryIcon = Activity;
    } else if (category.includes("饮食") || category.includes("Diet")) {
      categoryColor = "bg-yellow-100 text-yellow-800";
      CategoryIcon = Utensils;
    } else if (category.includes("护理") || category.includes("Care")) {
      categoryColor = "bg-red-100 text-red-800";
      CategoryIcon = Heart;
    }
  }
  
  const cardContent = (
    <>
      {/* Article Image */}
      <div className="aspect-video overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      
      {/* Content */}
      <div className="p-5">
        {category && (
          <span className={`inline-flex items-center ${categoryColor} text-xs font-medium px-2.5 py-1 rounded mb-3`}>
            <CategoryIcon size={14} className="mr-1" />
            {category}
          </span>
        )}
        
        <h3 className="text-lg font-semibold text-primary-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 line-clamp-3 mb-4">
          {excerpt}
        </p>
        
        <div className="flex items-center text-gray-500 text-sm">
          <Calendar size={14} className="mr-1" />
          <span>{date}</span>
        </div>
      </div>
    </>
  );
  
  // 如果有文章ID，则使用Link组件包装
  if (articleId) {
    return (
      <Link 
        to={`/articles/${articleId}`}
        className="bg-white rounded-lg shadow-soft overflow-hidden h-full border border-gray-100 block transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
      >
        {cardContent}
      </Link>
    );
  }
  
  // 否则使用普通的动画组件
  return (
    <motion.article
      className="bg-white rounded-lg shadow-soft overflow-hidden h-full border border-gray-100"
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      {cardContent}
    </motion.article>
  );
};

export default ArticleCard;