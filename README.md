> **Original green site design is frozen.** Before edits, read [SPECS.md](./SPECS.md). The live approved baseline is the October 24 English-green Vercel snapshot; current repository source differs. Do not deploy `master` to production blindly. Only add an approved link by default; any design change requires repeated explicit owner confirmation.

# AskDrLiu Website / 刘医生个人医学网站

> **IMPORTANT — ALL AI AGENTS & CONTRIBUTORS MUST READ [AGENTS.md](./AGENTS.md) FIRST.**  
> **注意：修改任何网站代码前，请先阅读 [AGENTS.md](./AGENTS.md)，并获得网站所有者对上线的明确批准。**

## 网站维护最高原则

**保持原有网站的风格、颜色、字体、结构与现有页面不变。默认仅新增页面。未经所有者批准，不合并、不部署正式网站。**

开发原则：**先模拟，再模拟，再创新**。参考成熟网站的信息架构与用户流程，不复制第三方受版权保护的素材和文案。

## 技术架构

- React + TypeScript + Vite + Tailwind CSS + React Router + i18next
- `src/App.tsx` — 页面路由和共用布局
- `src/pages/` — 既有页面以及新增页面
- `src/pages/HomePage.tsx` — 首页（由 `src/components/home/` 模块组成）
- `src/components/layout/Header.tsx` — 全站导航和语言切换
- `src/components/layout/Footer.tsx` — 共用页脚
- `src/components/common/` — 共用组件
- `src/i18n/` — 中文及英文国际化
- `tailwind.config.js` — **设计体系唯一来源**，主色 primary、辅助色 secondary、强调色 accent，Noto 中文字体
- `src/index.css` — 全站样式
- `public/` — 静态资源
- `vercel.json` — Vercel SPA/API 路由配置

## 增加页面的标准过程

1. 阅读 [AGENTS.md](./AGENTS.md) 并检查原网站页面、设计系统与导航。
2. 在独立 Git 分支新增页面，仅作必要路由和已获授权的首页入口修改。
3. 使用已有样式、布局、组件，保持原站视觉不变。
4. 检查中英文、移动端、构建、SEO、AI可检索性、Google Ads和医疗广告/隐私合规。
5. 创建 **Draft Pull Request** 与 Vercel Preview，交给所有者审核。
6. **所有者明确同意后**才能合并进 `master` 并发布正式网站。
7. 将错误与修复经验写入 Google Drive 网站建设 Skill。

## 当前进行中的新页面（未上线）

- `/overseas-care`：海外华人健康指南
- 审核分支：`feature/overseas-care-v1-20261113`
- [Draft PR #1](https://github.com/jakebo-githit/cursor-site/pull/1)
- 本次页面尚未获批准合并，不属于正式站点已上线内容。

## 本地测试

```bash
npm install
npm run dev
npm run build
```

完整禁止事项、各页面职责、设计规范、审批闸口与发布检查表以 [AGENTS.md](./AGENTS.md) 为准。
