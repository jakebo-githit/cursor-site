# AskDrLiu Website SPECS — Original English Green Site / 原版网站设计冻结规范

**Status: OWNER MANDATE / 不可擅自更改**  
**Effective:** 2026-11-13  
**Scope:** AskDrLiu official website `www.askdrliu.com`, its original design, and all future pages / linked services developed as part of this website.  
**Authority:** Website owner. This file specifies design/approval requirements; it does not by itself authorize deployment.

## 0.唯一正确基准：原版英文绿色主页

- **Original, approved site snapshot:** Vercel project `cursor-site` (`prj_YB2oRQjZG0WjHYQkomAO47rchnmj`), production deployment `dpl_GN9eXverkLr9Vf7eF9XzKEgpMQHJ`, created 2026-10-24.
- Original homepage: https://cursor-site-hj9fxzfzf-jakebo-githits-projects.vercel.app/
- Official custom domain: https://www.askdrliu.com/ . On 2026-11-13, that domain was verified to serve the **original English green** deployment.
- Reference title: **AskDrLiu — Medical education by Bo Liu, MD, PhD**.
- Reference style: original English-first layout; muted cream/ivory backgrounds, deep and soft greens, original editorial fonts, photographs, headings, navigation, spacing, buttons, cards, and responsive behavior. CSS is available in the immutable historical deployment snapshot.
- **Do not confuse** this approved original with the later **blue Chinese React/Vite source currently in the GitHub `cursor-site` `master` branch**, or with independently deployed `askdrliu-v4`, `askdrliu-en`, and `askdrliu-us-care-preview` projects. Despite similar names, these are NOT an authorization to replace the approved original.
- **CRITICAL RELEASE WARNING:** GitHub `jakebo-githit/cursor-site` at `master` currently contains the different blue React/Vite site. Building/deploying it as production would replace the restored green original. Do not deploy or merge into production until the original site's actual source has been located/recovered and matched to the reference snapshot. A restored Vercel alias is not the same as restoring the `master` source.

## 1. Absolute design freeze / 设计冻结（最高优先级）

**默认只能添加一个清晰、最小的链接。不能重新设计、重构或改写原网站。**

- No changes to original **colors** (all background/text/border/hover colors), CSS design tokens, typography, font families, font sizes, weights, line heights, spacing, widths, breakpoints, grids, border radii, shadows, icons, animation, page proportions, or responsive layout.
- No changes to existing **hero/headline**, primary messaging, header, navigation hierarchy, logo, photographs, illustrations, page order, content blocks, footer, or original page URLs.
- No blanket changes to global CSS, dependencies, build system, routing, domain mapping, redirects, or deploy settings.
- New requested overseas Chinese healthcare page must be created using the **same original green palette, original fonts and design scale**, with English/Chinese switch that translates the entire page, including disclaimers, platform links, service status, and contact instructions.
- On the **existing original homepage**, add only the smallest approved link such as `Overseas Chinese Patients | 海外华人就医指南`. Insert it in the **owner-approved exact location**, without moving, restyling or renaming anything else.
- "Add a link" is not consent to edit original headings, change the hero, replace photos or reorganize the navbar.

## 2. Approval gates / 高风险更改必须反复确认

**Owner approval is required before every release and before any wider scope.**

1. **First confirmation — change scope.** Present exact affected original URL(s), file paths, screenshots of baseline, the location of the single proposed link, and a written minimal diff. Owner approves the precise scope.
2. **Second confirmation — before design-related deviation.** If even one existing color, size, font, layout, hero, image, global component, navigation or other original specification needs to change, **stop** and ask again for explicit approval of that *specific deviation*. Silence, a generic "continue", or a previous approval is not permission.
3. **Third confirmation — release gate.** Show side-by-side visual comparison of original and preview, desktop and mobile, list all changed paths, verify no unintended design changes. Obtain explicit owner approval to merge/promote to production.
4. For any extensive redesign, require a **separate project specification** and multiple rounds of clear owner agreement; otherwise do not proceed. Never bundle unrelated changes with a link request.
5. New docs/specs may be drafted without changing production, but owner must review before they become release policy attached to an actual production change.

## 3. Mandatory versioning, traceability and rollback / 版本记录和回滚

- Every change gets a date, version identifier, reason, named file list, linked Git commit SHA, PR URL, Vercel preview deployment ID, production deployment ID, owner approval record and rollback target.
- Before any release, preserve and verify the **last known good production deployment ID** and confirm it is accessible. Save screenshots or comparable baseline evidence.
- Use GitHub feature branches + PR review. Do NOT deploy GitHub `master` blindly: the blue codebase currently does not match the restored English green production site.
- Deploy to a protected preview first; test original home and every affected route at desktop/mobile sizes. Confirm original colors, hero, fonts, navigation, pictures and spacing remain pixel-consistent except for the explicitly approved new link.
- Only promote to production after explicit approval. After release, verify live domain DNS/aliases, original homepage, added link, no-JS indexable HTML, English/Chinese text, health claims and outbound links.
- Rollback method: preferably Vercel **promote** a confirmed good prior deployment without rebuilding, or restore from a Git release tag/snapshot. **Do not promise one-click rollback**: Vercel's rollback endpoint may be plan-limited (observed 402 attempting deep rollback on 2026-11-13), while promotion of the preserved original deployment succeeded.
- Each release must specify a tested restoration method and any plan restrictions; do not overwrite/delete the preserved original release.

### Immutable reference and recovery event (2026-11-13)

- Original green English site restored by Vercel `request_promote` for deployment `dpl_GN9eXverkLr9Vf7eF9XzKEgpMQHJ`.
- Live alias `www.askdrliu.com` was independently verified pointing to that deployment; website HTTP 200 and original English title were verified.
- Source-of-truth inconsistency remains: `cursor-site` GitHub `master` contains blue React site, NOT restored Astro original. Reconcile this before any production release. Historical deployment has recoverable published files but no confirmed matching editable source repository.

## 4. Medical, SEO and AI visibility constraints

- Brand focuses on overseas Chinese medical education and authenticated experience with gallbladder stones, CBD stones, complex intrahepatic bile duct stones, POCS and fluoroscopy-free ERCP *in suitable patients*. Do not promote gallbladder preservation as a marketing selling point.
- Do not promise outcomes, international licenses, foreign practice rights, cross-border telemedicine availability or hospital appointments. Emergency cholangitis must be directed to immediate local care.
- All language versions must be medically equivalent; no partially translated English UI.
- Preserve crawlability, unique titles/canonical for new pages, sitemap, robots and factual schema; SEO does not override design freeze or medical advertising law.
- Use actual verified doctor profile URLs only; distinguish platform homepage, article and doctor consultation service.

## 5. Repeatable process

**Ingest → Verify exact original → Freeze baseline → Propose only a link → Owner approves scope → Build matching new page in separate branch → Preview and compare → Owner approves release → Deploy → Verify → Record errors and lessons.**

All errors, wrong-project selections, build failures and recoveries must be written to the existing **AskDrLiu Website Building Skill** in Google Drive, including phenomenon, root cause, repair, verification and prevention.

**Non-negotiable:** the original English green site and its design always win over newly generated templates or source code when they conflict.
