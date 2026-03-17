import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { marked } from 'marked';

const SITE_URL = 'https://www.askdrliu.com';
const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST_DIR = path.join(REPO_ROOT, 'dist');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const BLOG_DATA_FILE = path.join(REPO_ROOT, 'src', 'data', 'blog-posts.ts');
const BLOG_POSTS_DIR = path.join(PUBLIC_DIR, 'blog-posts');
const ROBOTS_FILE = path.join(PUBLIC_DIR, 'robots.txt');
const SITEMAP_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const RSS_FILE = path.join(PUBLIC_DIR, 'rss.xml');

marked.setOptions({ gfm: true, breaks: false });

const STATIC_PAGES = [
  {
    path: '/',
    title: '刘波主任 | 胆囊保留与肝胆健康科普',
    description: '刘波主任个人医学网站，聚焦胆囊结石、胆囊炎、保胆评估、胆囊切除术后营养与肝胆健康科普。',
    priority: '1.0',
    changefreq: 'weekly'
  },
  {
    path: '/blog',
    title: '胆囊健康医学博客 | 刘波主任',
    description: '围绕胆囊炎、胆囊结石、保胆评估和术后营养恢复的医学博客，持续更新中文长尾搜索型患者教育内容。',
    priority: '0.9',
    changefreq: 'daily'
  },
  { path: '/about', title: '关于刘波主任 | AskDrLiu.com', description: '了解刘波主任的专业方向、医学科普定位与患者教育内容。', priority: '0.6', changefreq: 'monthly' },
  { path: '/technology', title: '胆囊保留与微创技术科普 | AskDrLiu.com', description: '了解保胆思路、微创技术与胆囊结石相关医学科普。', priority: '0.7', changefreq: 'monthly' },
  { path: '/assessment', title: '胆囊保留评估入口 | AskDrLiu.com', description: '查看胆囊保留评估相关说明与患者教育信息。', priority: '0.7', changefreq: 'weekly' },
  { path: '/cases', title: '肝胆外科案例与患者教育 | AskDrLiu.com', description: '围绕肝胆外科常见问题、案例解读与患者教育内容。', priority: '0.6', changefreq: 'monthly' },
  { path: '/faq', title: '胆囊健康常见问题 FAQ | AskDrLiu.com', description: '整理胆囊炎、胆囊结石、保胆与术后恢复的常见问题和解答。', priority: '0.7', changefreq: 'weekly' },
  { path: '/contact', title: '联系 AskDrLiu.com', description: '联系 AskDrLiu.com，获取胆囊健康相关内容与站点信息。', priority: '0.4', changefreq: 'monthly' },
  { path: '/free-guide', title: '胆囊健康免费资料 | AskDrLiu.com', description: '获取胆囊健康和术后恢复的免费科普资料与阅读资源。', priority: '0.5', changefreq: 'monthly' }
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absoluteUrl(routePath) {
  if (!routePath || routePath === '/') return SITE_URL;
  return `${SITE_URL}${routePath}`;
}

function loadBlogPosts() {
  const source = fs.readFileSync(BLOG_DATA_FILE, 'utf8');
  const match = source.match(/export const blogPosts: BlogPost\[] = \[([\s\S]*?)\n\];/);
  if (!match) {
    throw new Error('Unable to parse blog posts data file.');
  }
  return vm.runInNewContext(`[${match[1]}]`);
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---[\s\S]*?---\r?\n/, '');
}

function readArticleMarkdown(slug) {
  const mdPath = path.join(BLOG_POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) return '';
  return stripFrontmatter(fs.readFileSync(mdPath, 'utf8'));
}

function renderShell({ title, description, canonicalPath, body, imageUrl, schema, publishedTime, modifiedTime }) {
  const canonical = absoluteUrl(canonicalPath);
  const ogImage = imageUrl ? absoluteUrl(imageUrl) : `${SITE_URL}/favicon.svg`;
  const schemaScripts = (schema || [])
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`)
    .join('\n');

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="${publishedTime ? 'article' : 'website'}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}" />` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}" />` : ''}
    ${schemaScripts}
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f4ed;
        --card: #ffffff;
        --ink: #16322d;
        --muted: #5f6f67;
        --line: #dde5df;
        --brand: #0f766e;
        --accent: #c7774a;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
        background: linear-gradient(180deg, #f6f1e8 0%, #faf8f3 100%);
        color: var(--ink);
      }
      a { color: var(--brand); }
      .wrap { max-width: 920px; margin: 0 auto; padding: 28px 20px 80px; }
      .topbar {
        display: flex; gap: 16px; flex-wrap: wrap; align-items: center; justify-content: space-between;
        background: rgba(255,255,255,0.9); border: 1px solid var(--line); border-radius: 20px; padding: 14px 18px;
        box-shadow: 0 10px 30px rgba(22,50,45,0.05);
      }
      .brand { font-weight: 800; text-decoration: none; color: var(--ink); }
      .nav { display: flex; gap: 14px; flex-wrap: wrap; }
      .nav a { text-decoration: none; color: var(--muted); font-size: 14px; }
      .hero, article, .list-card {
        margin-top: 24px; background: var(--card); border: 1px solid var(--line); border-radius: 28px;
        padding: 28px; box-shadow: 0 14px 40px rgba(22,50,45,0.06);
      }
      h1 { font-size: clamp(2rem, 4vw, 3rem); line-height: 1.08; margin: 0 0 14px; }
      h2 { font-size: 1.6rem; margin-top: 2rem; margin-bottom: .8rem; }
      h3 { font-size: 1.2rem; margin-top: 1.4rem; margin-bottom: .6rem; }
      p, li { color: var(--muted); font-size: 1.03rem; line-height: 1.9; }
      img.cover { width: 100%; border-radius: 22px; display: block; margin: 18px 0 24px; }
      .meta { display: flex; gap: 14px; flex-wrap: wrap; color: var(--muted); font-size: 14px; margin-bottom: 10px; }
      .cta { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; padding: 12px 18px; border-radius: 999px; background: var(--brand); color: white; text-decoration: none; font-weight: 700; }
      .grid { display: grid; gap: 18px; }
      .list-card h2 { margin-top: 0; font-size: 1.25rem; }
      .badge { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #e8f4f1; color: var(--brand); font-size: 12px; font-weight: 700; }
      .promo {
        margin: 28px 0; padding: 20px 22px; border-radius: 22px; border: 1px solid #f0c58b;
        background: linear-gradient(90deg, #fff8e6, #fff3dc); color: #7a3b12;
      }
      .promo a { color: #8a3a10; font-weight: 800; }
      .footer { margin-top: 28px; text-align: center; color: var(--muted); font-size: 13px; }
      @media (max-width: 640px) { .hero, article, .list-card { padding: 22px; } }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="topbar">
        <a class="brand" href="${SITE_URL}">AskDrLiu.com</a>
        <nav class="nav">
          <a href="${SITE_URL}/">首页</a>
          <a href="${SITE_URL}/blog">博客</a>
          <a href="${SITE_URL}/faq">FAQ</a>
          <a href="${SITE_URL}/contact">联系</a>
        </nav>
      </div>
      ${body}
      <div class="footer">AskDrLiu.com · 胆囊健康、保胆评估与术后营养科普</div>
    </div>
  </body>
</html>`;
}

function articleSchema(post, canonicalPath) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.imageUrl ? [absoluteUrl(post.imageUrl)] : undefined,
    datePublished: `${post.date}T08:00:00+08:00`,
    dateModified: `${post.date}T08:00:00+08:00`,
    author: { '@type': 'Person', name: '刘波主任' },
    publisher: { '@type': 'Organization', name: 'AskDrLiu.com' },
    mainEntityOfPage: absoluteUrl(canonicalPath)
  };
}

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AskDrLiu.com',
    url: SITE_URL,
    inLanguage: 'zh-CN',
    description: '刘波主任个人医学网站，聚焦胆囊结石、胆囊炎、保胆评估、胆囊切除术后营养与肝胆健康科普。'
  };
}

function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: '刘波主任',
    url: SITE_URL,
    jobTitle: '肝胆外科医生',
    worksFor: { '@type': 'Organization', name: 'AskDrLiu.com' }
  };
}

function renderArticlePage(post, markdown) {
  const articleHtml = marked.parse(markdown || '');
  const body = `
    <article>
      <div class="badge">${escapeHtml(post.category)}</div>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="meta"><span>${escapeHtml(post.date)}</span><span>作者：AskDrLiu.com</span><span>${escapeHtml(post.category)}</span></div>
      <p>${escapeHtml(post.excerpt || post.seoDescription || '')}</p>
      ${post.imageUrl ? `<img class="cover" src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title)}" />` : ''}
      <div class="article-body">${articleHtml}</div>
    </article>`;

  return renderShell({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    canonicalPath: `/blog/${post.id}`,
    body,
    imageUrl: post.imageUrl,
    publishedTime: `${post.date}T08:00:00+08:00`,
    modifiedTime: `${post.date}T08:00:00+08:00`,
    schema: [articleSchema(post, `/blog/${post.id}`)]
  });
}

function renderBlogIndex(posts) {
  const cards = posts.map((post) => `
    <section class="list-card">
      <div class="badge">${escapeHtml(post.category)}</div>
      <h2><a href="${SITE_URL}/blog/${post.id}">${escapeHtml(post.title)}</a></h2>
      <div class="meta"><span>${escapeHtml(post.date)}</span><span>${escapeHtml(post.category)}</span></div>
      <p>${escapeHtml(post.excerpt || post.seoDescription || '')}</p>
      <a class="cta" href="${SITE_URL}/blog/${post.id}">阅读文章</a>
    </section>`).join('\n');

  const body = `
    <section class="hero">
      <div class="badge">刘波主任医学博客</div>
      <h1>胆囊健康、保胆评估与术后营养医学博客</h1>
      <p>围绕胆囊炎、胆囊结石、保胆评估、胆囊切除术后营养与肝胆健康，持续发布更适合中文搜索与患者阅读的医学科普文章。</p>
    </section>
    <div class="grid">${cards}</div>`;

  return renderShell({
    title: '胆囊健康医学博客 | 刘波主任',
    description: '围绕胆囊炎、胆囊结石、保胆评估和术后营养恢复的医学博客，持续更新中文长尾搜索型患者教育内容。',
    canonicalPath: '/blog',
    body,
    schema: [{
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '胆囊健康医学博客',
      url: `${SITE_URL}/blog`
    }]
  });
}

function renderSimplePage(page) {
  const body = `
    <section class="hero">
      <div class="badge">AskDrLiu.com</div>
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
      <a class="cta" href="${SITE_URL}/blog">查看医学博客</a>
    </section>`;

  return renderShell({
    title: page.title,
    description: page.description,
    canonicalPath: page.path,
    body,
    schema: [websiteSchema()]
  });
}

function writeFileSyncRecursive(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

function generateSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [];
  for (const page of STATIC_PAGES) {
    urls.push(`  <url>\n    <loc>${escapeHtml(absoluteUrl(page.path))}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`);
  }
  for (const post of posts) {
    urls.push(`  <url>\n    <loc>${escapeHtml(absoluteUrl(`/blog/${encodeURI(post.id)}`))}</loc>\n    <lastmod>${post.date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function generateRss(posts) {
  const items = posts.slice(0, 20).map((post) => {
    const markdown = readArticleMarkdown(post.id);
    const description = escapeHtml(post.seoDescription || post.excerpt || '');
    const content = escapeHtml(marked.parse(markdown || '').slice(0, 4000));
    return `    <item>\n      <title>${escapeHtml(post.title)}</title>\n      <link>${absoluteUrl(`/blog/${post.id}`)}</link>\n      <guid>${absoluteUrl(`/blog/${post.id}`)}</guid>\n      <pubDate>${new Date(`${post.date}T08:00:00+08:00`).toUTCString()}</pubDate>\n      <description>${description}</description>\n      <content:encoded><![CDATA[${content}]]></content:encoded>\n    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n  <channel>\n    <title>AskDrLiu.com 医学博客</title>\n    <link>${SITE_URL}/blog</link>\n    <description>刘波主任关于胆囊炎、胆囊结石、保胆评估和术后营养恢复的医学博客。</description>\n    <language>zh-CN</language>\n${items}\n  </channel>\n</rss>\n`;
}

function patchHomeIndex() {
  const file = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('rel="canonical"')) {
    html = html.replace('</head>', `  <link rel="canonical" href="${SITE_URL}" />\n  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />\n  <script type="application/ld+json">${JSON.stringify(websiteSchema())}</script>\n  <script type="application/ld+json">${JSON.stringify(personSchema())}</script>\n</head>`);
  }
  fs.writeFileSync(file, html, 'utf8');
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('dist directory not found. Run vite build first.');
  }

  const posts = loadBlogPosts().sort((a, b) => new Date(b.date) - new Date(a.date));

  const sitemap = generateSitemap(posts);
  const rss = generateRss(posts);
  fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf8');
  fs.writeFileSync(RSS_FILE, rss, 'utf8');
  writeFileSyncRecursive(path.join(DIST_DIR, 'sitemap.xml'), sitemap);
  writeFileSyncRecursive(path.join(DIST_DIR, 'rss.xml'), rss);

  writeFileSyncRecursive(path.join(DIST_DIR, 'blog', 'index.html'), renderBlogIndex(posts));

  for (const post of posts) {
    const markdown = readArticleMarkdown(post.id);
    writeFileSyncRecursive(path.join(DIST_DIR, 'blog', post.id, 'index.html'), renderArticlePage(post, markdown));
  }

  for (const page of STATIC_PAGES.filter((page) => page.path !== '/' && page.path !== '/blog')) {
    writeFileSyncRecursive(path.join(DIST_DIR, page.path.replace(/^\//, ''), 'index.html'), renderSimplePage(page));
  }

  patchHomeIndex();

  if (fs.existsSync(ROBOTS_FILE)) {
    writeFileSyncRecursive(path.join(DIST_DIR, 'robots.txt'), fs.readFileSync(ROBOTS_FILE, 'utf8'));
  }

  console.log(`SEO assets generated for ${posts.length} blog posts.`);
}

main();
