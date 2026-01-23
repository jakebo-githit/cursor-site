/**
 * 一键发布博客草稿
 *
 * 功能：
 * 1. 将草稿从 drafts 目录移动到 blog-posts 目录
 * 2. 自动更新 blog-posts.ts 中的元数据
 * 3. 直接提交到 Git
 *
 * 使用方法：
 * node scripts/publish-post.cjs <草稿文件名>
 */

const fs = require('fs');
const path = require('path');

// 博客数据文件路径
const BLOG_POSTS_FILE = path.join(__dirname, '../src/data/blog-posts.ts');
const DRAFTS_DIR = path.join(__dirname, '../public/blog-posts/drafts');
const PUBLISHED_DIR = path.join(__dirname, '../public/blog-posts');

// 获取今天的日期
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 从文件名提取文章ID
function getArticleIdFromFilename(filename) {
  return filename.replace('.md', '');
}

// 解析 Markdown 文件获取标题和摘要
function parseMarkdownMetadata(content) {
  const lines = content.split('\n');
  let title = '';
  let excerpt = '';

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i].trim();
    if (line.startsWith('#')) {
      title = line.substring(1).trim();
      break;
    }
  }

  // 尝试获取第一段作为摘要
  let excerptStart = false;
  for (let i = 0; i < lines.length && excerptStart === false; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#')) {
      continue;
    }
    if (line && !line.startsWith('#') && !line.startsWith('>') && !line.startsWith('-') && !line.startsWith('|')) {
      excerpt += line;
      if (excerpt.length > 100) {
        excerptStart = true;
        break;
      }
    }
  }

  return { title, excerpt: excerpt.trim().substring(0, 80) };
}

// 生成元数据配置行
function generateMetadataLine(metadata, articleId) {
  return `  {
    id: '${articleId}',
    title: '${metadata.title}',
    titleEn: '${metadata.title}',
    excerpt: '${metadata.excerpt.replace(/'/g, "\\'")}',
    excerptEn: '${metadata.excerpt.replace(/'/g, "\\'")}',
    date: '${getTodayDate()}',
    category: '${metadata.category}',
    categoryEn: '${metadata.categoryEn}',
    imageUrl: '/images/pocs-surgery.jpg',
    author: '刘波主任'
  }`;
}

// 获取分类映射
function getCategoryEn(cnCategory) {
  const map = {
    '胆结石预防': 'Gallstone Prevention',
    '技术介绍': 'Technology Introduction',
    '饮食指导': 'Dietary Guidance',
    '肝胆健康': 'Hepatobiliary Health'
  };
  return map[cnCategory] || 'General';
}

// 主函数
function main() {
  console.log('========================================');
  console.log('  一键发布博客文章');
  console.log('========================================\n');

  // 获取命令行参数
  const args = process.argv.slice(2);
  let draftFilename = '';

  if (args.length > 0) {
    draftFilename = args[0];
    if (!draftFilename.endsWith('.md')) {
      draftFilename += '.md';
    }
  } else {
    // 列出所有草稿供选择
    console.log('可用草稿：\n');
    const files = fs.readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.md'));
    if (files.length === 0) {
      console.log('  没有找到草稿文件\n');
      return;
    }
    files.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f}`);
    });
    console.log('\n使用方法：');
    console.log(`  node scripts/publish-post.cjs <草稿文件名>`);
    console.log(`  例如: node scripts/publish-post.cjs gallbladder-preservation-mkqxqysd.md`);
    console.log('\n========================================\n');
    return;
  }

  const draftFilePath = path.join(DRAFTS_DIR, draftFilename);
  const articleId = getArticleIdFromFilename(draftFilename);
  const publishedFilePath = path.join(PUBLISHED_DIR, draftFilename);

  // 检查草稿文件是否存在
  if (!fs.existsSync(draftFilePath)) {
    console.log(`✗ 草稿文件不存在: ${draftFilePath}`);
    return;
  }

  // 检查是否已存在同名发布文件
  if (fs.existsSync(publishedFilePath)) {
    console.log(`✗ 已存在同名发布文件: ${publishedFilePath}`);
    return;
  }

  // 读取草稿内容
  console.log(`读取草稿: ${draftFilename}`);
  const draftContent = fs.readFileSync(draftFilePath, 'utf8');
  const metadata = parseMarkdownMetadata(draftContent);

  // 确定分类
  let category = '技术介绍';
  let categoryEn = 'Technology Introduction';
  if (draftContent.includes('胆结石') || draftContent.includes('结石')) {
    category = '胆结石预防';
    categoryEn = 'Gallstone Prevention';
  } else if (draftContent.includes('饮食') || draftContent.includes('营养')) {
    category = '饮食指导';
    categoryEn = 'Dietary Guidance';
  } else if (draftContent.includes('肝胆') || draftContent.includes('肝')) {
    category = '肝胆健康';
    categoryEn = 'Hepatobiliary Health';
  }

  metadata.category = category;
  metadata.categoryEn = categoryEn;

  // 移动草稿到发布目录
  console.log(`移动草稿到发布目录: ${draftFilename} -> published/`);
  fs.writeFileSync(publishedFilePath, draftContent, 'utf8');

  // 更新 blog-posts.ts
  console.log(`更新元数据配置: src/data/blog-posts.ts`);
  let blogPostsContent = fs.readFileSync(BLOG_POSTS_FILE, 'utf8');

  // 检查文章ID是否已存在
  const articleIdPattern = new RegExp(`id:\\s*'${articleId}'`, 'g');
  if (articleIdPattern.test(blogPostsContent)) {
    console.log(`✗ 文章ID已存在，跳过添加元数据`);
  } else {
    // 找到 blogPosts 数组的最后一个元素的结束位置
    const arrayEndMatch = blogPostsContent.lastIndexOf(']');
    if (arrayEndMatch === -1) {
      arrayEndMatch = blogPostsContent.lastIndexOf(']');
    }

    const insertPosition = arrayEndMatch;
    const metadataLine = generateMetadataLine(metadata, articleId);
    const newContent = blogPostsContent.substring(0, insertPosition) +
                         '\n' + metadataLine +
                         blogPostsContent.substring(insertPosition);
    fs.writeFileSync(BLOG_POSTS_FILE, newContent, 'utf8');
    console.log(`  ✓ 元数据已添加`);
  }

  console.log('\n========================================');
  console.log('  发布完成!');
  console.log('========================================\n');
  console.log(`已发布文章: ${metadata.title}`);
  console.log(`文件位置: /blog-posts/${draftFilename}`);
  console.log('\n下一步：');
  console.log('1. 本地测试: npm run dev');
  console.log('2. 提交发布: git add && git commit && git push');
  console.log('3. Vercel 将自动部署\n');
  console.log('========================================\n');
}

main();
