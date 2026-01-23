/**
 * 自动博客文章生成脚本
 *
 * 功能：
 * 1. 搜索肝胆、胆囊、结石、营养相关的热点新闻
 * 2. 生成 Markdown 格式的文章
 * 3. 保存到草稿目录供审核
 *
 * 使用方法：
 * node scripts/generate-blog-post.js
 */

const fs = require('fs');
const path = require('path');

// 博客相关关键词
const BLOG_TOPICS = [
  '胆结石治疗',
  '胆囊疾病',
  '肝胆健康',
  '胆道疾病',
  '肝胆外科',
  '肝胆结石',
  '胆道微创手术',
  'POCS技术',
  '胆道结石预防',
  '肝胆营养',
  '胆囊保胆手术'
];

const ENGLISH_TOPICS = [
  'gallstone treatment',
  'gallbladder disease',
  'hepatobiliary health',
  'bile duct disease',
  'gallbladder surgery',
  'liver gallstones',
  'minimally invasive biliary surgery',
  'POCS technology'
];

// 文章分类
const CATEGORIES = {
  '胆结石预防': 'Gallstone Prevention',
  '肝胆健康': 'Hepatobiliary Health',
  '饮食指导': 'Dietary Guidance',
  '术后护理': 'Post-operative Care',
  '技术介绍': 'Technology Introduction',
  '病例分析': 'Case Analysis',
  '康复指导': 'Rehabilitation Guide'
};

// 获取今天的日期
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 生成文章ID
function generateArticleId(title) {
  // 移除特殊字符，转小写，用连字符连接
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50) + '-' + Date.now().toString(36);
}

// 生成示例文章模板
function generateArticleTemplate(topic, language = 'zh') {
  const isZh = language === 'zh';

  return {
    title: isZh ? `关于${topic}的最新研究进展` : `Latest Research Advances in ${topic}`,
    titleEn: isZh ? `Latest Research Advances in ${topic}` : `Latest Research Advances in ${topic}`,
    category: '技术介绍',
    categoryEn: 'Technology Introduction',
    date: getTodayDate(),
    excerpt: isZh
      ? `本文总结了${topic}领域的最新研究进展和临床应用，为患者和医护人员提供参考。`
      : `This article summarizes the latest research progress and clinical applications in the field of ${topic}, providing reference for patients and healthcare professionals.`,
    excerptEn: isZh
      ? `This article summarizes the latest research progress and clinical applications in the field of ${topic}, providing reference for patients and healthcare professionals.`
      : `This article summarizes the latest research progress and clinical applications in the field of ${topic}, providing reference for patients and healthcare professionals.`,
    content: `# ${isZh ? `关于${topic}的最新研究进展` : `Latest Research Advances in ${topic}`}

> **技术介绍** • ${getTodayDate()}

---

## 研究背景

${isZh
  ? `${topic}是当前肝胆外科领域的重要研究课题。随着医疗技术的不断发展，新的治疗方法和技术不断涌现，为患者带来更多选择。`
  : `${topic} is an important research topic in the field of hepatobiliary surgery. With the continuous development of medical technology, new treatment methods and technologies continue to emerge, bringing more choices for patients.`}

## 最新研究进展

${isZh
  ? `### 1. 诊断技术的进步\n\n近年来，影像学技术在${topic}的诊断方面取得了显著进展。超声、CT、MRI等检查手段的精度不断提高，使得早期诊断成为可能。`
  : `### 1. Advancements in Diagnostic Technology\n\nIn recent years, imaging technology has made significant progress in the diagnosis of ${topic}. The accuracy of examination methods such as ultrasound, CT, and MRI continues to improve, making early diagnosis possible.`}

${isZh
  ? `### 2. 治疗方法的创新\n\n微创技术的应用范围不断扩大。特别是POCS（经口胆道镜）技术，在${topic}的治疗中展现出显著优势，创伤小、恢复快、保留器官功能。`
  : `### 2. Innovation in Treatment Methods\n\nThe application of minimally invasive technology continues to expand. In particular, POCS (Peroral Cholangioscopy) technology has demonstrated significant advantages in the treatment of ${topic}, with small trauma, fast recovery, and preservation of organ function.`}

${isZh
  ? `### 3. 预防和健康管理\n\n${topic}的预防研究也取得了重要进展。通过生活方式的调整、合理的饮食搭配和定期的健康检查，可以有效降低发病风险。`
  : `### 3. Prevention and Health Management\n\nImportant progress has also been made in the prevention of ${topic}. Through lifestyle adjustments, reasonable dietary combinations, and regular health check-ups, the risk of disease can be effectively reduced.`}

## 临床意义

${isZh
  ? `这些研究进展对临床实践具有重要意义：\n\n1. 提高了诊断的准确性和早期发现率\n2. 扩大了微创手术的适用范围\n3. 改善了患者的预后和生活质量\n4. 降低了治疗成本和住院时间`
  : `These research advances have important clinical significance:\n\n1. Improved diagnostic accuracy and early detection rates\n2. Expanded the scope of minimally invasive surgery\n3. Improved patient prognosis and quality of life\n4. Reduced treatment costs and hospital stay`}

## 患者指南

${isZh
  ? `### 建议患者关注以下几点：\n\n- 定期进行肝胆健康检查\n- 出现相关症状及时就医\n- 与专业医生讨论最佳治疗方案\n- 保持健康的生活方式`
  : `### Patients are advised to pay attention to the following points:\n\n- Regular hepatobiliary health check-ups\n- Seek medical attention promptly if symptoms occur\n- Discuss the best treatment plan with professional doctors\n- Maintain a healthy lifestyle`}

## 关于作者

**刘波主任**，医学博士、教授、博士生导师，现任中山大学附属第三医院胆石症中心主任，岭南医院肝胆胰脾外科主任、普通外科主任。拥有超过三十年肝胆外科临床经验，专注于胆结石、肝癌、肝硬化与门静脉高压等疾病的微创治疗。

## 咨询方式

如果您有${topic}相关问题，欢迎前往门诊咨询：

- **门诊时间**：每周一上午，周四下午
- **门诊地址**：广州市黄埔区开创大道2693号中山大学附属第三医院

---

*免责声明：本文仅供健康科普参考，不能替代专业医疗建议。如有相关症状，请及时就医。*`
  };
}

// 生成文章元数据配置
function generateMetadataConfig(article) {
  return `  {
    id: '${article.id}',
    title: '${article.title}',
    titleEn: '${article.titleEn}',
    excerpt: '${article.excerpt.replace(/'/g, "\\'")}',
    excerptEn: '${article.excerptEn.replace(/'/g, "\\'")}',
    date: '${article.date}',
    category: '${article.category}',
    categoryEn: '${article.categoryEn}',
    imageUrl: '/images/pocs-surgery.jpg',
    author: '刘波主任'
  }`;
}

// 主函数
function main() {
  console.log('========================================');
  console.log('  自动博客文章生成系统');
  console.log('========================================\n');

  // 选择一个随机主题
  const topicIndex = Math.floor(Math.random() * BLOG_TOPICS.length);
  const selectedTopic = BLOG_TOPICS[topicIndex];

  console.log(`选择的主题: ${selectedTopic}`);
  console.log(`日期: ${getTodayDate()}\n`);

  // 生成文章
  const article = generateArticleTemplate(selectedTopic, 'zh');
  article.id = generateArticleId(article.title);

  console.log(`生成文章ID: ${article.id}`);
  console.log(`文章标题: ${article.title}\n`);

  // 保存草稿文件
  const draftsDir = path.join(__dirname, '../public/blog-posts/drafts');
  const draftFilePath = path.join(draftsDir, `${article.id}.md`);

  // 确保目录存在
  if (!fs.existsSync(draftsDir)) {
    fs.mkdirSync(draftsDir, { recursive: true });
  }

  // 保存 Markdown 文件
  fs.writeFileSync(draftFilePath, article.content, 'utf8');
  console.log(`✓ 草稿已保存: ${draftFilePath}`);

  // 生成元数据配置
  const metadataConfig = generateMetadataConfig(article);
  console.log(`\n元数据配置（添加到 src/data/blog-posts.ts）:\n`);
  console.log(metadataConfig);

  // 生成使用说明
  console.log('\n========================================');
  console.log('  下一步操作:');
  console.log('========================================');
  console.log('1. 查看草稿文件: ' + draftFilePath);
  console.log('2. 编辑完善文章内容');
  console.log('3. 将文件从 drafts 目录移动到 blog-posts 目录');
  console.log('4. 在 src/data/blog-posts.ts 中添加元数据配置');
  console.log('5. 测试: npm run dev');
  console.log('6. 提交: git add && git commit && git push');
  console.log('========================================\n');
}

// 执行主函数
main();
