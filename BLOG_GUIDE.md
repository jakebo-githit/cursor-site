# 博客系统使用指南

## 概述

已成功为你的网站添加了博客系统，你现在可以每天更新文章了！

## 访问博客

- 博客列表页：`/blog`
- 博客详情页：`/blog/:文章ID`

## 如何添加新文章

### 步骤 1：添加文章元数据

打开 `src/data/blog-posts.ts` 文件，在 `blogPosts` 数组中添加新文章的信息：

```typescript
{
  id: 'your-article-id',           // 文章唯一标识（用英文，短横线连接）
  title: '文章标题',              // 中文标题
  titleEn: 'Article Title',         // 英文标题
  excerpt: '文章摘要...',         // 中文摘要
  excerptEn: 'Article excerpt...',  // 英文摘要
  date: '2025-01-23',           // 发布日期 (YYYY-MM-DD)
  category: '分类名称',           // 中文分类
  categoryEn: 'Category Name',     // 英文分类
  imageUrl: '/images/your-image.jpg', // 图片URL（可选）
  author: '刘波主任'              // 作者（可选）
}
```

### 步骤 2：创建 Markdown 文章文件

在 `public/blog-posts/` 目录下创建对应的 Markdown 文件：

```
public/blog-posts/your-article-id.md
```

### 步骤 3：编写文章内容

Markdown 文件格式示例：

```markdown
# 文章标题

> **分类名称** • 2025年1月23日

---

## 小节标题

正文内容...

### 子小节

更多内容...

## 另一个小节

- 列表项 1
- 列表项 2

> 引用内容

---

*免责声明：本文仅供健康科普参考...*
```

### Markdown 支持的功能

- 标题：`#`、`##`、`###`
- 列表：`-` 或数字列表
- 链接：`[文字](URL)`
- 引用：`> 引用内容`
- 表格：支持 Markdown 表格语法
- 代码：\`代码\` 和 ```代码块```
- 粗体：`**粗体**`
- 斜体：`*斜体*`

## 博客功能

### 博客列表页 (/blog)
- 显示所有文章卡片
- 按分类筛选文章
- 搜索文章（按标题、摘要、分类）
- 分页功能（每页9篇）
- 响应式设计

### 博客详情页 (/blog/:id)
- 显示完整文章内容
- 支持中英双语
- 文章分享功能
- 相关文章推荐
- 阅读时间计算
- 发布日期显示

## 已创建的示例文章

已创建以下示例文章：

1. `gallstone-prevention.md` - 胆结石形成的原因及预防措施
2. `dietary-guidance.md` - POCS手术前后的饮食指导
3. `pocs-vs-traditional.md` - POCS技术与传统手术的对比

## 文章图片

文章图片放在 `public/images/` 目录下，然后在文章元数据中引用：

```typescript
imageUrl: '/images/your-image.jpg'
```

## 常用分类

- 胆结石预防
- 饮食指导
- 肝胆健康
- 术后护理
- 技术介绍
- 病例分析
- 康复指导

## 测试博客

本地测试：
```bash
npm run dev
```

访问：http://localhost:5173/blog

## 构建和部署

```bash
# 构建生产版本
npm run build

# 部署到 GitHub Pages
npm run deploy
```

## 注意事项

1. **文章 ID 必须唯一**：确保每篇文章的 id 不重复
2. **日期格式**：使用 YYYY-MM-DD 格式
3. **Markdown 文件名**：必须与文章 ID 完全一致
4. **图片路径**：使用绝对路径 `/images/...`
5. **中英文对应**：确保中英文内容都填写完整

## 导航菜单

已在 Header 导航中添加"医学博客"链接，位置在"手术案例"和"医学科普"之间。
