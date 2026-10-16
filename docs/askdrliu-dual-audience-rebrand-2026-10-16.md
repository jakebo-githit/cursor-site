# AskDrLiu Dual-Audience Rebrand — Implementation Plan (2026-10-16)

Status: DISCOVERY / NOT DEPLOYED. Do not merge or publish before review.

## Verified infrastructure
- Production custom domains `askdrliu.com` and `www.askdrliu.com` currently belong to Vercel project `cursor-site` (`prj_YB2oRQjZG0WjHYQkomAO47rchnmj`).
- Current production deployment at audit: `dpl_4WsiyNWyJWbEkqATc6JHkcWbT85m` (READY).
- Vercel project `askdrliu-v4` exists but does NOT host those custom domains.
- `en.askdrliu.com` belongs to `askdrliu-en`.
- Existing production deployment history includes the previous production snapshot `dpl_J2JoxM2eTz5NKvzWKJSFq1N9mKUv`.
- `jakebo-githit/cursor-site` GitHub master is React/Vite and may not match the current Astro static deployment. DO NOT overwrite production with that repo without source reconciliation.
- A GitHub master backup branch exists: `backup-before-askdrliu-rebrand-2026-10-16`. This backs up GitHub master, NOT necessarily the currently deployed Astro site.
- Domain ownership endpoint returned 403 although project metadata independently confirms associated domains.

## Architecture decision
Brand: AskDrLiu = evidence-based hepatobiliary education. Audience entry points:
1. /for-patients — gallstones, gallbladder decisions, ERCP, liver health, educational explainers.
2. /clinical-innovation — radiation-free ERCP, POCS, physician training, procedural innovation.
3. /industry — factual professional record, institutional collaboration, device education.
Main home features both entry points; general public receives plain-English information first.

## Preserve
- New radiation-free ERCP showcase and technical footage.
- Validated biography, original portraits and images (with rights checked).
- Existing patient educational articles, downloadables, existing leads/data (subject to privacy review).
- All source and deployment history.

## Editorial/legal gate
- Do not imply California physician licensure or offer personalized diagnosis, treatment, prescriptions, or consultations.
- Verify qualification abbreviations and geographic professional affiliations.
- Review `Dr.` branding and all patient-facing health advertising with California counsel.
- Make disease content evidence-based with medical review/date/source metadata.
- Patient assessments and lead capture need privacy, accessibility and compliance review.
- Avoid supplement disease-treatment claims and conflicts of interest.

## Implementation sequencing
1. Obtain complete current production source or export from Vercel deployment, and reconcile with Github.
2. Create restorable independent backup of the current production site plus forms/assets.
3. Implement home / patient / professional route changes in isolated preview branch/project.
4. Review mobile, link integrity, accessibility, SEO redirects, analytics, lead capture and legal text.
5. Obtain explicit medical/content approval before production release.
6. Publish with verified rollback plan and measure engagement.

## First homepage content outline
Hero: 'Clear answers for better liver and gallbladder decisions.'
Subhead: 'Evidence-based education on gallstones, gallbladder care, ERCP, and hepatobiliary health from Bo Liu, a hepatobiliary surgeon trained and practiced in China.'
Primary: Explore Patient Education.
Secondary: Clinical Innovation & Physician Training.
Sections: common questions; educational videos; about Dr Liu's documented China career; professional innovation highlights; newsletter opt-in after privacy review.

Nothing in this plan authorizes clinical services in California.
