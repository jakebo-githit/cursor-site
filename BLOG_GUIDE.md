# 博客系统使用指南

## 概述

已成功为你的网站添加了博客系统，包含一键发布功能！

## 访问博客

- 博客列表页：`/blog`
- 博客详情页：`/blog/:文章ID`
- 草稿管理页：`/blog/drafts`

---

## 一、快速发布流程（推荐）

### 步骤 1：生成专业草稿

运行自动生成脚本：

```bash
node scripts/generate-blog-post.cjs
```

脚本会自动：
1. 随机选择一个医学主题
2. 生成包含研究背景、临床数据、案例的深度内容
3. 保存 Markdown 文件到草稿目录
4. 提供元数据配置代码

### 步骤 2：一键发布

审核完成后，使用一键发布命令：

```bash
# 发布指定草稿
node scripts/publish-post.cjs <草稿文件名>

# 查看可用草稿
node scripts/publish-post.cjs
```

**一键发布会自动：**
- ✓ 将草稿从 `drafts` 移动到 `blog-posts`
- ✓ 自动更新 `src/data/blog-posts.ts` 元数据
- ✓ 自动推断文章分类

### 步骤 3：提交部署

```bash
git add .
git commit -m "Publish new blog post"
git push origin master
```

Vercel 自动部署。

---

## 二、草稿管理界面

访问 `/blog/drafts` 可查看和管理所有草稿。

### 功能说明

| 操作 | 说明 |
|-----|------|
| 眼睛图标 | 标记为审核中 |
| 垃圾桶图标 | 删除草稿 |
| 编辑按钮 | 进入编辑页面 |

### 筛选功能
- 按状态筛选（全部/草稿/审核中/已发布）
- 按标题搜索

---

## 三、手动添加文章

### 步骤 1：添加文章元数据

打开 `src/data/blog-posts.ts` 文件，在 `blogPosts` 数组中添加新文章的信息：

```typescript
{
  id: 'your-article-id',
  title: '文章标题',
  titleEn: 'Article Title',
  excerpt: '文章摘要...',
  excerptEn: 'Article excerpt...',
  date: '2025-01-23',
  category: '分类名称',
  categoryEn: 'Category Name',
  imageUrl: '/images/your-image.jpg',
  author: '刘波主任'
}
```

### 步骤 2：创建 Markdown 文章文件

在 `public/blog-posts/` 目录下创建对应的 Markdown 文件：

```markdown
# 文章标题

> **分类名称** • 2025年1月23日

---

正文内容...

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

---

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

### 草稿管理页 (/blog/drafts)
- 查看所有草稿
- 按状态筛选
- 搜索草稿
- 管理草稿状态

---

## 文章主题参考

自动生成脚本提供 **6 个专业医学主题**：

| ID | 主题 | 分类 |
|-----|-------|------|
| gallstone-formation | 胆结石形成的分子机制与临床意义 | 胆结石预防 |
| pocs-advantages | POCS技术的临床优势与适应症 | 技术介绍 |
| post-diet | POCS手术后科学饮食康复方案 | 饮食指导 |
| gallbladder-preservation | 保胆取石手术的适应症与长期效果 | 技术介绍 |
| liver-health-monitoring | 肝胆健康自我监测与预警信号 | 肝胆健康 |
| nutrition-prevention | 基于循证医学的胆结石营养预防策略 | 饮食指导 |

### 指定主题生成

```bash
node scripts/generate-blog-post.cjs 胆结石
node scripts/generate-blog-post.cjs pocs
node scripts/generate-blog-post.cjs diet
node scripts/generate-blog-post.cjs liver
```

---

## 常用分类

- 胆结石预防 (Gallstone Prevention)
- 肝胆健康 (Hepatobiliary Health)
- 饮食指导 (Dietary Guidance)
- 技术介绍 (Technology Introduction)

---

## 文章图片

文章图片放在 `public/images/` 目录下，然后在文章元数据中引用：

```typescript
imageUrl: '/images/your-image.jpg'
```

---

## 测试博客

本地测试：

```bash
npm run dev
```

访问：
- http://localhost:5173/blog - 博客列表
- http://localhost:5173/blog/drafts - 草稿管理

---

## 自动化工作流程

### 推荐流程（3步搞定）

1. **生成草稿**
   ```bash
   node scripts/generate-blog-post.cjs
   ```

2. **一键发布**
   ```bash
   # 查看草稿列表
   node scripts/publish-post.cjs

   # 或直接发布指定草稿
   node scripts/publish-post.cjs <草稿文件名.md>
   ```

3. **提交上线**
   ```bash
   git add .
   git commit -m "Publish new blog post"
   git push origin master
   ```

### 快捷命令（全部操作）

```bash
# 生成 + 查看草稿
node scripts/generate-blog-post.cjs && node scripts/publish-post.cjs

# 一条命令发布最新草稿
node scripts/publish-post.cjs $(ls -t ~/cursor-site/public/blog-posts/drafts | head -1)
```

---

## 注意事项

1. **文章 ID 必须唯一**：确保每篇文章的 id 不重复
2. **日期格式**：使用 YYYY-MM-DD 格式
3. **Markdown 文件名**：必须与文章 ID 完全一致
4. **图片路径**：使用绝对路径 `/images/...`
5. **中英文对应**：确保中英文内容都填写完整
6. **发布前检查**：一键发布后建议本地预览确认

---

## 导航菜单

已在 Header 导航中添加"医学博客"链接，位置在"手术案例"和"医学科普"之间。

---

## 命令参考

```bash
# 生成草稿
node scripts/generate-blog-post.cjs

# 查看并选择发布
node scripts/publish-post.cjs

# 直接发布指定草稿
node scripts/publish-post.cjs 文件名.md

# 测试
npm run dev

# 提交
git push origin master
```
