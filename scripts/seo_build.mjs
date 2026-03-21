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

const FAQ_ENTRIES = [
  {
    question: 'POCS技术安全吗？',
    answer: 'POCS技术是经过充分验证的微创技术，相比传统开腹手术，并发症发生率显著降低。在专业医生操作下，安全性很高。但任何手术都存在一定风险，术前会进行详细评估和沟通。'
  },
  {
    question: '多大的结石可以通过POCS技术处理？',
    answer: '理论上，POCS技术可以处理任何大小的胆道结石，因为它可以在直视下进行碎石。对于较大结石或多发结石，可能需要分次治疗。具体情况需要根据患者的影像学检查结果来评估。'
  },
  {
    question: 'POCS手术后多久能恢复正常生活？',
    answer: '大多数患者术后1-3天即可下床活动，5-7天可出院，2-4周可恢复正常生活和轻度工作。完全恢复通常需要1-2个月，期间应避免剧烈运动和过度劳累。'
  },
  {
    question: '做了POCS手术后还会复发吗？',
    answer: 'POCS技术可以有效清除已形成的结石，但无法改变患者的结石体质。术后需要结合药物治疗、饮食调整和定期随访，可显著降低复发风险。'
  },
  {
    question: 'POCS技术和传统ERCP取石有什么区别？',
    answer: '传统ERCP更依赖间接操作，而POCS是在直视下处理结石，对复杂胆道结石、肝内胆管结石和传统方法失败患者更有优势。'
  },
  {
    question: '是否所有胆结石患者都适合POCS技术？',
    answer: '并非所有患者都适合。需要综合考虑结石情况、患者年龄和基础疾病等因素，建议通过正规专科评估确定最适合的治疗方案。'
  }
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


function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

function getRelatedPosts(posts, currentPost, limit = 3) {
  return posts
    .filter((post) => post.id !== currentPost.id)
    .sort((a, b) => {
      const aScore = (a.category === currentPost.category ? 2 : 0) + (a.categoryEn === currentPost.categoryEn ? 1 : 0);
      const bScore = (b.category === currentPost.category ? 2 : 0) + (b.categoryEn === currentPost.categoryEn ? 1 : 0);
      if (bScore !== aScore) return bScore - aScore;
      return new Date(b.date) - new Date(a.date);
    })
    .slice(0, limit);
}

function renderArticlePage(post, markdown, posts) {
  const articleHtml = marked.parse(markdown || '');
  const relatedPosts = getRelatedPosts(posts, post);
  const relatedHtml = relatedPosts.map((item) => `
      <section class="list-card">
        <div class="badge">${escapeHtml(item.category)}</div>
        <h3><a href="${SITE_URL}/blog/${item.id}">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.excerpt || item.seoDescription || '')}</p>
      </section>`).join('\n');
  const body = `
    <article>
      <div class="meta"><a href="${SITE_URL}">首页</a> / <a href="${SITE_URL}/blog">博客</a> / <span>${escapeHtml(post.title)}</span></div>
      <div class="badge">${escapeHtml(post.category)}</div>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="meta"><span>${escapeHtml(post.date)}</span><span>作者：刘波主任医师</span><span>${escapeHtml(post.category)}</span></div>
      <p>${escapeHtml(post.excerpt || post.seoDescription || '')}</p>
      ${post.imageUrl ? `<img class="cover" src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title)}" />` : ''}
      <div class="article-body">${articleHtml}</div>
      <div style="margin-top:32px;padding:22px 24px;border-radius:18px;border:1px solid #dde5df;background:#f6fbf9;">
        <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;">
          <div>
            <p style="margin:0 0 6px;font-weight:700;font-size:1rem;color:#16322d;">关于作者 · 刘波主任医师</p>
            <p style="margin:0;font-size:0.93rem;color:#5f6f67;line-height:1.8;">
              中山大学附属第三医院（岭南医院）肝胆外科主任医师，从事肝胆外科临床工作近30年。
              专注胆囊结石保胆取石（POCS）、ERCP、肝硬化与肝癌诊治。
              2008年赴德国访学，2009–2011年于美国耶鲁大学访学。
              本文内容基于临床循证医学，仅供患者教育参考，不替代专业诊疗建议。
            </p>
          </div>
        </div>
      </div>
    </article>
    <section class="hero">
      <div class="badge">相关文章</div>
      <h2>继续阅读同主题内容</h2>
      <p>从站内主题相关性出发，补充更多与当前文章相关的胆囊健康内容。</p>
      <div class="grid">${relatedHtml}</div>
    </section>`;

  return renderShell({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    canonicalPath: `/blog/${post.id}`,
    body,
    imageUrl: post.imageUrl,
    publishedTime: `${post.date}T08:00:00+08:00`,
    modifiedTime: `${post.date}T08:00:00+08:00`,
    schema: [
      articleSchema(post, `/blog/${post.id}`),
      breadcrumbSchema([
        { name: '首页', path: '/' },
        { name: '博客', path: '/blog' },
        { name: post.title, path: `/blog/${post.id}` }
      ])
    ]
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

  const topicClusters = [
    {
      title: '胆囊炎专题',
      description: '围绕胆囊炎反复发作、抗生素使用、饮食刺激和就医时机，帮助读者更快判断当前问题属于哪一类。',
      posts: posts.filter((post) => post.category === '胆囊炎').slice(0, 2)
    },
    {
      title: '胆囊结石专题',
      description: '重点解释胆囊结石能否自己排出、如何通过饮食降低风险，以及哪些情况不适合继续拖延观察。',
      posts: posts.filter((post) => post.category === '胆囊结石').slice(0, 2)
    },
    {
      title: '保胆评估专题',
      description: '聚焦保胆取石适合哪些人、术前评估看什么、术后恢复怎么安排，帮助读者理解治疗决策的关键点。',
      posts: posts.filter((post) => post.category === '保胆').slice(0, 2)
    },
    {
      title: '术后营养专题',
      description: '重点回答切除胆囊后吃什么、腹泻怎么办、油腻不耐受怎么调，以及术后营养恢复的节奏。',
      posts: posts.filter((post) => post.category === '胆囊切除术后营养').slice(0, 2)
    }
  ];

  const clusterCards = topicClusters.map((cluster) => `
    <section class="list-card">
      <div class="badge">主题导航</div>
      <h2>${escapeHtml(cluster.title)}</h2>
      <p>${escapeHtml(cluster.description)}</p>
      <div class="grid">${cluster.posts.map((post) => `
        <a class="cta" href="${SITE_URL}/blog/${post.id}">${escapeHtml(post.title)}</a>`).join('')}
      </div>
    </section>`).join('\n');

  const body = `
    <section class="hero">
      <div class="badge">刘波主任医学博客</div>
      <h1>胆囊健康、保胆评估与术后营养医学博客</h1>
      <p>围绕胆囊炎、胆囊结石、保胆评估、胆囊切除术后营养与肝胆健康，持续提供更贴近患者实际问题的医学科普文章。</p>
    </section>
    <section class="hero">
      <h2>如果你不知道从哪篇开始读</h2>
      <p>这里把患者最常见的 4 类问题集中在一起：胆囊炎、胆囊结石、保胆评估和胆囊切除术后营养恢复。你可以根据自己当前最关心的问题，直接进入相应专题。</p>
      <p>如果你正在关心胆囊炎反复发作怎么办、胆囊结石能不能继续观察、保胆取石适不适合自己，或者切除胆囊后腹泻、吃油不适、营养恢复慢，这个页面会比单篇文章更适合作为起点。</p>
      <p>如果你暂时不确定自己该先看哪一部分，可以先从与当前症状、检查结果或术后恢复最接近的专题开始，再继续阅读相应文章。</p>
    </section>
    <section class="hero">
      <div class="badge">按主题进入阅读</div>
      <h2>优先阅读的 4 个专题</h2>
      <p>如果你想更快找到和自己情况接近的内容，可以先从下面 4 个专题开始。</p>
      <div class="grid">${clusterCards}</div>
    </section>
    <div class="grid">${cards}</div>`;

  return renderShell({
    title: '胆囊健康医学博客 | 刘波主任',
    description: '围绕胆囊炎、胆囊结石、保胆评估和胆囊切除术后营养恢复，持续更新中文长尾搜索型患者教育内容。',
    canonicalPath: '/blog',
    body,
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '胆囊健康医学博客',
        url: `${SITE_URL}/blog`,
        description: '围绕胆囊炎、胆囊结石、保胆评估和胆囊切除术后营养恢复，持续更新中文长尾搜索型患者教育内容。'
      },
      breadcrumbSchema([
        { name: '首页', path: '/' },
        { name: '博客', path: '/blog' }
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: posts.slice(0, 10).map((post, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: absoluteUrl(`/blog/${post.id}`),
          name: post.title
        }))
      }
    ]
  });
}

function renderFaqPage(page) {
  const faqItems = FAQ_ENTRIES.map((item) => `
    <section class="list-card">
      <h2>${escapeHtml(item.question)}</h2>
      <p>${escapeHtml(item.answer)}</p>
    </section>`).join('\n');

  const body = `
    <section class="hero">
      <div class="badge">AskDrLiu.com FAQ</div>
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
    </section>
    <div class="grid">${faqItems}</div>`;

  return renderShell({
    title: page.title,
    description: page.description,
    canonicalPath: page.path,
    body,
    schema: [
      websiteSchema(),
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ_ENTRIES.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer }
        }))
      },
      breadcrumbSchema([
        { name: '首页', path: '/' },
        { name: 'FAQ', path: '/faq' }
      ])
    ]
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
    writeFileSyncRecursive(path.join(DIST_DIR, 'blog', post.id, 'index.html'), renderArticlePage(post, markdown, posts));
  }

  for (const page of STATIC_PAGES.filter((page) => page.path !== '/' && page.path !== '/blog')) {
    const html = page.path === '/faq' ? renderFaqPage(page) : renderSimplePage(page);
    writeFileSyncRecursive(path.join(DIST_DIR, page.path.replace(/^\//, ''), 'index.html'), html);
  }

  patchHomeIndex();

  if (fs.existsSync(ROBOTS_FILE)) {
    writeFileSyncRecursive(path.join(DIST_DIR, 'robots.txt'), fs.readFileSync(ROBOTS_FILE, 'utf8'));
  }

  console.log(`SEO assets generated for ${posts.length} blog posts.`);
}

main();
