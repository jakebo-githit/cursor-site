# Google Analytics 4 (GA4) 部署指南

## 1. 注册 Google Analytics

### 步骤：
1. 访问 https://analytics.google.com/
2. 使用 Google 账号登录
3. 点击 **开始设置** (Start setup)
4. 创建账号：
   - **Account Name**: AskDrLiu Blog
5. 创建媒体资源：
   - **Property Name**: AskDrLiu Website
   - **Reporting Time Zone**: China Standard Time (GMT+8)
   - **Currency**: CNY (或 USD)

## 2. 设置数据流

### 步骤：
1. 选择平台：**Web**
2. 输入网站信息：
   - **Website URL**: https://askdrliu.com
   - **Stream Name**: AskDrLiu Blog Stream
3. 选择行业：**Health**（或最接近的）
4. 点击 **创建数据流**

## 3. 获取 GA4 测量 ID

创建完成后，会显示一个测量 ID（Measurement ID）：

```
G-XXXXXXXXXX
```

记下这个 ID，下一步会用到。

## 4. 集成到 AskDrLiu 网站

### 方法：使用 Google Tag Manager（推荐）

#### 步骤：
1. 访问 https://tagmanager.google.com/
2. 使用 Google 账号登录
3. 创建账号：**AskDrLiu**
4. 创建容器：
   - **Container Name**: AskDrLiu Website
   - **Target Platform**: Web
5. 添加 GA4 配置标签：
   - **Tag Name**: Google Analytics 4 Configuration
   - **Tag Type**: Google Analytics: GA4 Configuration
   - **Measurement ID**: G-XXXXXXXXXX（替换为实际 ID）
6. 设置触发器：
   - **Trigger Type**: Page View - Page View
   - **Trigger Name**: All Pages
7. 提交并发布容器

### 方法：直接添加到 index.html（简单）

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Google Analytics 4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>

  <!-- 其他 head 内容... -->
</head>
```

### 方法：React/Vue 框架集成

```tsx
// src/components/GAnalyticsScript.tsx
export function GAnalyticsScript() {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', 'G-XXXXXXXXXX');
  }, []);

  return null;
}
```

然后在主布局中使用：
```tsx
import { GAnalyticsScript } from '@/components/GAnalyticsScript';

export default function RootLayout() {
  return (
    <html>
      <head>
        <GAnalyticsScript />
      </head>
      <body>
        {/* 页面内容 */}
      </body>
    </html>
  );
}
```

## 5. 验证部署

### 步骤：
1. 将更改部署到 Vercel（自动部署）
2. 访问 https://askdrliu.com
3. 回到 Google Analytics
4. 点击左侧菜单 **配置** → **数据流**
5. 应该显示 **实时数据** 卡片
6. 访问网站，应该能看到实时活动

### 验证指标：
- **Realtime**: 实时用户数
- **Page views**: 页面浏览量
- **Events**: 事件数
- **Active users**: 活跃用户

## 6. GA4 核心指标

### Engagement（参与度）
- **Sessions**: 会话数
- **Active users**: 活跃用户数
- **Engagement rate**: 参与率
- **Engaged sessions**: 参与会话数
- **Average engagement time**: 平均参与时长

### Traffic acquisition（流量获取）
- **Sessions by channel**: 按渠道划分的会话（Organic/Referral/Direct/Social）
- **Traffic source**: 流量来源
- **Traffic medium**: 流量媒介

### Events（事件）
- **Page view**: 页面浏览
- **Scroll**: 滚动事件
- **Outbound link**: 外链点击
- **File download**: 文件下载

### Tech（技术）
- **Browser**: 浏览器
- **Device category**: 设备类型（Desktop/Mobile/Tablet）
- **Operating system**: 操作系统
- **Screen resolution**: 屏幕分辨率

## 7. 自定义事件追踪

### 追踪外部链接点击

```javascript
// 追踪用户点击外部链接
gtag('event', 'click', {
  'event_category': 'outbound',
  'event_label': 'https://external.com/article',
  'link_url': 'https://external.com/article',
  'link_domain': 'external.com'
});
```

### 追踪页面滚动深度

```javascript
// 追踪滚动到页面底部
window.addEventListener('scroll', function() {
  const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
  if (scrollPercent >= 90) {
    gtag('event', 'scroll', {
      'event_category': 'engagement',
      'event_label': 'Scroll to bottom',
      'percent_scrolled': 90
    });
  }
});
```

### 追踪文件下载

```javascript
// 追踪文件下载
gtag('event', 'file_download', {
  'event_category': 'engagement',
  'event_label': 'PDF Guide',
  'file_name': 'post-surgery-guide.pdf',
  'link_url': 'https://askdrliu.com/downloads/guide.pdf'
});
```

## 8. GA4 数据查询

### 实时报告
- 位置：**报告** → **实时**
- 用途：立即验证部署是否正常

### 参与度报告
- 位置：**报告** → **参与度** → **页面和屏幕**
- 指标：
  - **浏览量**: 页面浏览次数
  - **唯一用户数**: 唯一访客数
  - **平均参与时长**: 平均停留时间
  - **参与度**: 停留 > 10 秒的会话占比

### 流量获取报告
- 位置：**报告** → **流量获取**
- 指标：
  - **有机流量**: 来自 Google 搜索
  - **推介流量**: 来自外部网站链接
  - **直接流量**: 用户直接输入网址
  - **社交流量**: 来自社交媒体

## 9. GA4 与 Search Console 集成

### 步骤：
1. 在 GA4 中，点击 **管理员** → **Search Console 链接**
2. 选择 Search Console 资源：https://askdrliu.com
3. 验证所有权（如果还未验证）
4. 链接完成后，可以在 GA4 中查看：
   - 搜索关键词
   - 网页展示次数
   - 点击率

## 10. 隐私与合规

### GDPR 合规
在 GA4 设置中可以：
- **禁用广告个性化**
- **启用匿名 IP**
- **设置数据保留期限**（2个月/14个月）
- **启用用户数据删除**（响应删除请求）

### 隐私政策
在 AskDrLiu 网站上添加隐私政策，说明：
- 使用 Google Analytics 收集数据
- 数据用途：改善用户体验
- 数据收集：匿名化处理
- 用户权利：可要求删除数据

## 11. 常用查询

### 查看页面表现
1. 打开 GA4 → **报告** → **参与度** → **页面和屏幕**
2. 调整日期范围：90天
3. 按 **浏览量** 排序
4. 查看前 10 页面

### 查看用户行为
1. 打开 GA4 → **报告** → **参与度** → **事件**
2. 选择事件类型：**page_view**
3. 查看事件趋势

### 导出数据
1. 点击右上角 **导出**
2. 选择格式：CSV/Excel/Google Sheets
3. 可导出报告数据用于进一步分析

## 12. 下一步

部署完成后：
1. **等待 24 小时** - 累积初始数据
2. **查看实时报告** - 验证数据收集正常
3. **设置目标/转化** - 定义关键用户行为（如点击"预约"按钮）
4. **定期查看报告** - 每周查看流量趋势和用户行为

---

## 检索标签
#Google Analytics 4 #GA4 #网站分析 #流量追踪 #用户行为 #SEO #数据可视化
