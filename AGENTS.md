# AskDrLiu Website Editing Rules / 网站修改强制规范
> **READ FIRST before reading, generating, or changing any website code.**
> 项目所有者规则（2026-11-13）。适用于人类贡献者及所有 AI 编码助手。本文件不是部署授权。

## 0. 审批是最高优先级 / Owner approval is mandatory
- **未经网站所有者逐次明确同意，不得合并 PR、推送到主分支、改动线上网站或触发生产部署。**
- Treat all changes as proposals. Work on a dedicated feature branch, open a **draft PR**, provide a preview and a list of changed files, and obtain explicit owner approval **before merge or production deploy**.
- 用户提出“做一个页面”允许先在独立分支开发草稿，不等于同意上线。不得默认为用户批准。
- No silent dependency upgrades, broad refactors, formatting-only sweeps, global CSS changes, or replacement of existing content.

## 1. ABSOLUTE design rule: preserve existing look and information architecture
- **保持原有风格、颜色、字体、布局、页眉页脚、导航和所有原页面结构不变。默认只允许新增页面，并在获得授权时为首页添加极小的入口。**
- Reuse `tailwind.config.js` design tokens. PRIMARY navy (`primary`: #0A2463; primary-800 #13264B; primary-900 #0A1326), SECONDARY blue (`secondary`: #247BA0), ACCENT orange (`accent`: #EA7020). Do NOT invent a new palette (e.g., teal/green) for a new page.
- Fonts: `Noto Sans SC` and `Noto Serif SC`, existing `font-sans` and `font-serif` classes. Use existing spacing, heading scales, `container mx-auto px-4`, `shadow-soft`, `rounded-lg`, etc.
- Page header pattern: `pt-24 pb-12 bg-primary-800 text-white`; sections use `py-12 md:py-16` and existing white/gray/primary-50 backgrounds.
- Use existing `Header`, `Footer`, `Button`, `SectionHeader`; no separate header, floating redesign, or new site shell.
- Existing pages and copy remain unchanged unless the owner specifically approves a named change.
- Homepage layout remains the same; a small new linked section may be proposed where approved. Avoid changing hero, photo, typography or overall hierarchy.
- Any change to design system, navigation patterns, global CSS, shared components, or existing routes requires **separate explicit approval**.

## 2. Existing architecture (verify current code before editing)
- Stack: React 18 + TypeScript + Vite + React Router v6 + Tailwind CSS + i18next/react-i18next; icons: lucide-react; animation: framer-motion.
- `src/App.tsx`: BrowserRouter, routes, shared Header/Footer and ScrollToTop.
- `src/pages/HomePage.tsx`: assembles existing home sections (HeroSection, DoctorIntroSection, TechnologyPreviewSection, TestimonialSection).
- `src/components/layout/Header.tsx`: navigation, desktop/mobile menu, language switch.
- `src/components/layout/Footer.tsx`: footer/disclaimer.
- `src/components/home/`: existing home page sections.
- `src/components/common/`: shared UI primitives.
- `src/pages/`: individual pages; current routes include `/`, `/about`, `/technology`, `/assessment`, `/cases`, `/blog`, `/blog/:id`, `/faq`, `/contact`, `/free-guide`.
- `src/i18n/`: localization. New Chinese-first copy must display correctly when Chinese selected; if exposing English mode, provide real translated content instead of an untranslated half-English page.
- `tailwind.config.js`: **single source of truth for existing design tokens**.
- `src/index.css`: existing global styles. Avoid editing.
- `public/`: existing images/assets; reuse appropriately; no copying others' copyrighted assets.
- `vercel.json`: SPA fallback and API rewrites. Preserve behavior.
- `package.json`: `npm run build` invokes Vite build and SEO script.

## 3. Allowed default change set
1. Add one new page at `src/pages/<Name>Page.tsx`.
2. Register its route with the **smallest** change in `src/App.tsx`.
3. If explicitly requested, add a small link in `HomePage.tsx`, visually consistent with current components.
4. If owner explicitly approves, add a small entry to both desktop/mobile navigation, without removing entries or altering its layout.
5. Make narrowly necessary SEO/meta/indexing improvements in scoped files **only after presenting the file diff and securing approval**.
Do not alter other files just because a new library, template or generator suggests it.

## 4. First imitate, then innovate / 先模拟，再创新
- Before creating a new product/page, study 3–5 relevant mature sites and record their page hierarchy, user journey, FAQs, SEO, mobile interaction, trust markers and calls to action.
- Copy proven **patterns**, not source code, copywriting, photos, trademarks or proprietary designs.
- Follow original site style first. Innovate only when user feedback and clear evidence support a change, with explicit approval.

## 5. Search, AI visibility & advertising
- Every new public page should have unique Chinese title and meta description, clear H1/H2, accessible semantic markup, valid internal links, mobile performance, HTTPS, canonical and inclusion in sitemap as appropriate.
- SEO: verify public crawling, server-rendering/prerendering needs for SPA, robots.txt, sitemap.xml, 200 responses, Search Console and Bing Webmaster Tools. Search indexing and AI citation are **not guaranteed**.
- Medical trust: author credentials, dates, traceable references and careful limits of evidence; use accurate schema.org JSON-LD only when supported.
- Google Ads: review latest healthcare advertising, destination quality, misrepresentation, privacy and consent requirements; do not promise campaign eligibility or approvals. Do not launch ads without separate owner approval.
- No tracking of patient sensitive information via analytics/ad pixels.

## 6. Healthcare legal and ethics requirements
- Personal site is **medical education and general care-navigation information**, not a hospital official appointment/fee portal or a licensed overseas telemedicine practice.
- Do not present patient-specific diagnosis, image interpretation, written second opinions or paid remote treatment as available until formal legal/clinical compliance is established.
- Do not promise priority beds, guaranteed surgery schedules/outcomes, lower costs, radiation-free suitability for all cases, or unauthorized hospital partnerships.
- No promotion of `保胆取石`. Core educational areas: gallstones, common bile duct stones, complex intrahepatic stones, ERCP, POCS; distinguish fluoroscopy-free ERCP from cholangioscopy.
- Any institution name, appointment link, referral or hospital promotional content must receive proper institutional/medical-advertising review.
- Do not collect patient records, scans, medical history or sensitive health data through a generic marketing form.

## 7. Safe workflow and explicit acceptance gate
1. Read `AGENTS.md`, `README.md`, `tailwind.config.js`, relevant source files. Compare baseline/screenshots before proposing UI changes.
2. Define only the files needed. Document current architecture and risks.
3. Create feature branch, never write unapproved feature changes directly to master.
4. Implement small atomic changes, preserve original styles.
5. Run `npm run build`; check desktop/mobile, existing routes, translation, links, accessibility, SEO, and healthcare/legal copy.
6. Create **draft PR** and Vercel **preview** (not production); compare before/after screenshots. If unavailable, report honestly.
7. Send owner: changed-file list, preview URL, before/after differences, tests, risks and decision needed. **STOP for explicit approval.**
8. Only then merge and verify Vercel production deployment and indexing status.
9. Update the Google Drive `AskDrLiu Website Building Skill` error log with root cause, fix, test and prevention rule.

## 8. Review checklist
- [ ] Existing pages unchanged; only authorized files changed
- [ ] Original palette, fonts, header/footer, layout, responsive design reused
- [ ] New page displays in Chinese; English mode is handled, not silently broken
- [ ] No unapproved medical advertising, paid second opinion, patient-data capture, or保胆取石宣传
- [ ] Build/tests pass and mobile/desktop preview inspected
- [ ] SEO/AI-crawl/Google Ads readiness checked with realistic limitations
- [ ] Draft PR and file diff reviewed by owner
- [ ] **Owner explicitly approved merge and production deployment**

**If a request conflicts with these rules, stop and ask owner for approval; do not improvise a redesign.**
