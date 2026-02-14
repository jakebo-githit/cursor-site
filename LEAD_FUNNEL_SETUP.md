# 免费 PDF 漏斗配置

## 已实现内容
- 落地页：`/free-guide`
- 提交接口：`/api/lead`
- PDF 下载路径：`/guides/post-cholecystectomy-nutrition-guide.pdf`
- 自动发信：通过 Resend API
- 线索名单：写入 Resend Audience（联系人列表）

## Vercel 环境变量
在 Vercel Project -> Settings -> Environment Variables 配置：

- `RESEND_API_KEY`
- `RESEND_AUDIENCE_ID`
- `FROM_EMAIL`（建议：`askdrliu@askdrliu.com`）
- `NOTIFY_EMAIL`（建议：`askdrliu@askdrliu.com`）
- `FREE_GUIDE_URL`（可选，不填则使用当前域名下的 PDF 路径）

## Resend 侧准备
1. 验证发件域名 `askdrliu.com`
2. 创建一个 Audience，复制 Audience ID 到 `RESEND_AUDIENCE_ID`

## 使用方式
- 直接投放这个链接：`https://askdrliu.com/free-guide`
- 用户提交邮箱后：
  1. 进入你的 Resend Audience 联系人列表
  2. 自动收到 PDF 邮件
  3. 你会收到一封新线索通知邮件
