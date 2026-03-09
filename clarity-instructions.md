# Microsoft Clarity 部署指南

## 1. 注册 Microsoft Clarity

### 步骤：
1. 访问 https://clarity.microsoft.com/
2. 使用 Microsoft 账号登录（或注册新账号）
3. 创建新项目（New Project）
4. 输入项目信息：
   - **Project Name**: AskDrLiu Blog
   - **Website URL**: https://askdrliu.com
   - **Category**: Blog/Content
5. 完成设置

## 2. 获取 Clarity 脚本

创建项目后，会自动生成一个 Clarity 脚本（类似 Google Analytics）：

```html
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
</script>
```

## 3. 集成到 AskDrLiu 网站

### 方法：添加到 index.html
将 Clarity 脚本添加到 `index.html` 的 `<head>` 标签中：

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Microsoft Clarity -->
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
  </script>

  <!-- 其他 head 内容... -->
</head>
```

### 方法：添加到主组件（React/Vue）
如果使用 React/Vue 框架，可以创建一个 Clarity 组件：

```tsx
// src/components/ClarityScript.tsx
export function ClarityScript() {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "YOUR_PROJECT_ID");
    `;
    document.head.appendChild(script);
  }, []);

  return null;
}
```

然后在主布局中使用：
```tsx
import { ClarityScript } from '@/components/ClarityScript';

export default function RootLayout() {
  return (
    <html>
      <head>
        <ClarityScript />
      </head>
      <body>
        {/* 页面内容 */}
      </body>
    </html>
  );
}
```

## 4. 验证部署

### 步骤：
1. 将更改部署到 Vercel（自动部署）
2. 访问 https://askdrliu.com
3. 回到 Microsoft Clarity 仪表板
4. 等待 10-30 分钟，应该能看到实时访问数据

### 验证指标：
- **Sessions**: 会话数
- **Page views**: 页面浏览量
- **Active users**: 活跃用户
- **Heatmaps**: 热力图（需要至少 300 次页面浏览）
- **Recordings**: 录制（需要开启录制功能）

## 5. Clarity 功能说明

### Heatmaps（热力图）
- **Tap Heatmap**: 点击热力图 - 显示哪些元素被点击最多
- **Scroll Heatmap**: 滚动热力图 - 显示用户滚动深度
- **Area Heatmap**: 区域热力图 - 显示点击密度

### Recordings（录制）
- 自动录制用户会话（需要开启）
- 可以回放每个用户的互动
- 帮助发现用户体验问题

### Dashboard 功能
- **Benchmarks**: 基准测试 - A/B 测试
- **Funnel**: 漏斗分析 - 转化漏斗
- **Segments**: 细分 - 按设备/地区/来源过滤

## 6. 隐私设置

### GDPR 合规
在 Clarity 设置中可以：
- 启用匿名 IP 地址
- 禁用录制功能
- 设置数据保留期限

### 录制功能注意事项
- **默认关闭** - 需要手动开启
- **敏感信息** - Clarity 会自动屏蔽信用卡号、密码等
- **合规要求** - GDPR 需要用户同意才能录制

## 7. 常用查询

### 查看用户行为
1. 打开 Clarity 仪表板
2. 点击左侧菜单 **Heatmaps**
3. 选择时间范围（30天/60天/90天）
4. 选择目标页面 URL
5. 查看 Tap/Scroll/Area 热力图

### 查看录制
1. 点击左侧菜单 **Recordings**
2. 筛选条件：
   - 互动时长：> 30 秒
   - 页面：选择目标页面
3. 点击代表性会话进行回放

### 导出数据
- 点击 **Export** 按钮
- 支持 CSV、JSON 格式
- 可导出热力图数据、录制数据

## 8. 下一步

部署完成后：
1. **等待 24 小时** - 累积初始数据
2. **查看热力图** - 找到用户点击最多的区域
3. **查看录制** - 发现用户体验问题
4. **优化页面** - 根据热力图和录制数据改进

---

## 检索标签
#Microsoft Clarity #用户行为分析 #热力图 #录制 #用户体验 #数据分析
