# AskDrLiu — 百度 / Google / AI 搜索基线审计
**日期**：2026-11-13  
**状态**：初步公开搜索与真实生产HTML核验；不是搜索后台索引报告。  
**正式站点**：https://www.askdrliu.com  
**战略目标**：让海外华人和医疗专业人士准确发现刘波（Bo Liu / Liu Bo）在胆囊结石、胆总管结石、复杂肝内胆管结石、无射线ERCP（适当病例）和POCS领域的真实专长。站点保持科普属性，不能代替跨境医疗许可。

## 已核实的生产站点行为

| URL | 状态 | HTML标题 / canonical | 备注 |
|---|---|---|---|
| /overseas-care | HTTP 200 | 独立title，canonical=/overseas-care | 初始HTML已包含H1、医生领域、联系和免责声明；对无JS爬虫可读 |
| /about | HTTP 200 | 独立title，canonical=/about | 目前构建模板仅输出较简略内容，缺少较完整作者身份 |
| /patients/ | HTTP 200 | 首页title，canonical=首页 | 历史搜索结果仍显示该路径，但现时由SPA兜底返回首页HTML；需决定301重定向到明确的新页面或恢复正确内容，并检查站长平台旧索引 |
| /robots.txt | HTTP 200 | User-agent:* Allow:/ | 当前不拒绝OAI-SearchBot、Googlebot、Bingbot；仍须检查CDN/WAF实际拦截 |
| /sitemap.xml | HTTP 200 | 包含 /overseas-care | 还未在站长控制台核实成功提交/处理 |

搜索工具截至当日显示旧版 AskDrLiu 页面（/patients/、/professionals、/zh等），部分搜索描述仍强调“保胆”，与本期禁止作为品牌宣传卖点的策略不一致。**搜索结果有缓存/滞后**，不能直接视为目前网站正文；需要重新抓取并逐条清理历史页面、canonical、外部链接和过时文案。搜索引擎具体收录量、展示量、点击量、AI引用量尚未知，禁止虚报。

## 优先级 P0：品牌可信性与技术一致性
1. 整理页面与域名清单：/、/about、/overseas-care、/blog、/patients/、/professionals、/zh、/contact、/technology及tool子域。识别200+首页canonical的历史路径（软404风险），逐一选择内容恢复、301重定向或410；不得不经审批批量改路由。
2. 审核旧页面/SEO脚本/博客/浮动按钮的“保胆取石”等宣传与明显不精确医学表述；**明确禁止将保胆取石作为品牌卖点**。对已发内容先列出范围、医疗依据和迁移/处理建议，征得所有者批准后修改。
3. 解决品牌描述冲突：医生姓名刘波 / Bo Liu / Liu Bo；专业职称、工作机构、当前身份须按可证明的事实统一。网站/第三方医生平台资料需保持一致。官网不能暗示获得国外医师执照或提供未授权跨境诊疗。
4. 为公开页面建立唯一title/H1/meta description、URL canonical、可索引HTML。对静态渲染的页面保持React显示与无JS正文事实一致。
5. Vercel生产构建仍提示 api/lead.ts 中缺乏Node类型定义（TS2580）；当作独立质量修复，不在本审计中改站点设计。

## 优先级 P1：百度推广（先自然搜索，后付费）
- 登录 https://ziyuan.baidu.com/ ，添加并验证 https://www.askdrliu.com ，提交 https://www.askdrliu.com/sitemap.xml ；URL提交与爬虫统计须从百度后台核实。
- 页面使用真实标题、患者实际检索表达和高价值医学内容，严禁堆叠关键词与误导性疗效。
- 主题：胆总管结石ERCP、复杂肝内胆管结石、无射线ERCP的适应证/限制、POCS与ERCP的关系、海外华人就医流程。
- 医疗广告、名医排名、价格、个体化远程问诊导流均需另行资质和合规审核，不能把科普当做无资质医疗广告。

## 优先级 P1：AI搜索
- OpenAI官方 https://developers.openai.com/api/docs/bots ：保持OAI-SearchBot可访问；它与GPTBot（训练）是两种独立控制。robots允许≠WAF一定放行≠一定被引用。
- Google官方 https://developers.google.com/search/docs/appearance/ai-features ：AI搜索主要依赖传统可索引SEO与原创有价值内容，不需要“AI神奇文件”。Google Search Console查看索引和表现。
- Bing Webmaster Tools核对索引及AI引用指标；中文AI工具逐个实测是否检索并正确陈述专业资历。
- 内容建立真实个人/机构资料，真实作者身份、证据引用、审稿日期，真实的 schema.org 信息；不要虚构评论、病例、疗效统计或认证。

## 发布 / 验证机制
- 各轮操作：Ingest → Triage → Draft → Publish → Measure → Learn。
- 预发布：GitHub feature branch与PR、Vercel Preview、测试页面HTML、SEO metadata、移动端、历史页面无回归、医疗广告合规。
- 用户已授权本轮启动搜索推广及安全技术工作；旧站结构/设计与收费规则的重大变化仍需显式认可。
- 第一次正式月报所需数据：百度/Google/Bing的已收录数、搜索曝光和点击、品牌/非品牌查询、AI中真实引用的URL、进站后合法联系数。

## 本轮新错误日志
**现象**：老链接 /patients/ 仍有旧内容搜索结果，但实时生产HTML返回200的首页title与首页canonical。  
**根因候选**：网站重构/SPA fallback保留了历史链接，却没有为历史路径建立301/410或独立内容。尚未调取旧站变更历史验证。  
**防范**：发布新站时必须进行旧URL映射、站点地图与软404审计，且核实实际搜索引擎更新状态。  
**当前状态**：已识别，未修改历史链接；待合规内容审查和迁移计划。
