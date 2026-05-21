# Crystord Platform Site Instantiation Checklist


This checklist tracks the transition from the archived Angular-based public site (now in the `crystord_platform_archive` folder) to a GitHub Pages-hosted static landing site for Crystord.

**Note:** The archive is to be used for inspiration only. Do not reuse its technology stack (e.g., Angular). Review each feature and content for relevance and suitability. Make independent decisions about what to include and how to implement it for the new site.


## 1. Bootstrap the project

- [x] Confirm the archive source path (`crystord_platform_archive`) to use for inspiration.
- [x] Confirm the new public-site repo structure and destination folders.
- [x] Keep the SaaS sign-in experience separate from the public landing page. (ADR-260001: sign-in on landing page → redirect to app.crystord.com)
- [x] Instantiate the project governance files under `.github/project/` and `.github/project/evolution/`.
- [x] Preserve the existing project instructions and update them only where they describe the new site accurately.


## 2. Review and select archive features/content

- [x] Inventory the archive pages, features, and content that might be relevant.
- [x] For each feature or section, decide if it should be included in the new site.
- [x] Document the rationale for including or excluding each feature/content.

Decision record: `ADR-260002`, `REQ-FR-260002`, `BI-260002`

- Keep: landing-page product overview, dedicated Google Add-on page, Add-on Privacy, Add-on Terms, Add-on Support, contact path, YouTube reference, Google trademark notice where relevant.
- Rework: landing hero copy, feature summaries, footer/legal navigation, contact CTA, legal/support text after review.
- Drop unless later re-approved: newsletter, landing-page sign-up flow, demo-login flow.
- Exclude: app-internal authenticated routes and Angular/CoreUI implementation details.


## 3. Define the technology stack

- [x] Choose a static-site generator or framework that works well on GitHub Pages (e.g., Astro, Jekyll, Hugo, plain HTML/CSS/JS).
- [x] Ensure the stack does not use Angular or other SPA frameworks requiring a backend.
- [x] Confirm the stack supports easy maintenance and static deployment.


## 4. Define the target site shape

- [x] Choose a static-site stack that works well on GitHub Pages.
- [ ] Confirm the routing model for the public landing page.
- [x] Confirm the separate sign-in/login entry point for the SaaS app.
- [x] Decide how the public site will link to the SaaS app without merging the two experiences.
- [x] Decide whether the public site needs a dedicated Google Add-on page, or if that content belongs on the landing page.


## 5. Decide the content structure

- [x] Define the landing page sections and the order they should appear in.
- [x] Define which content should be standalone pages versus sections on the home page.
- [x] Define the footer navigation and legal link placement.
- [x] Define the contact call-to-action and support handoff behavior.
- [x] Define the sign-in button wording and destination.

Decision record: ADR-260003, REQ-FR-260003, BI-260003

- Landing page section order: Hero, Primary actions, Product overview, Trust/compliance strip, Connect block, Final CTA.
- Standalone pages: Google Add-on, Add-on Privacy, Add-on Terms, Add-on Support, Contact.
- Footer links: Google Add-on, Support, Privacy, Terms, Contact, YouTube.
- Primary sign-in wording: Sign in to Crystord App.
- Sign-in destination: app-domain entry point (app.crystord.com or configured equivalent).


## 6. Set the implementation boundaries

- [x] Decide which archive visuals should be copied directly.
- [x] Decide which archive content should be rewritten for clarity.
- [x] Decide whether the new site should keep the archive’s brand voice or modernize it.
- [x] Decide whether analytics, forms, or other external services are required.
- [x] Decide whether any redirects are needed from old public URLs.

Decision record: ADR-260004, REQ-FR-260004, BI-260004

- Copy directly only when accurate: logo/favicon, approved product or add-on media, trademark notice text.
- Do not copy directly: archive layout system, card/grid compositions, typography/spacing/buttons, Angular/CoreUI visual patterns.
- Copy policy: rewrite marketing copy; review/adapt legal and support copy before publication.
- Brand direction: modernized, precise, non-hype tone.
- Launch integration default: no analytics and no external form backend unless later approved; use contact page + mailto fallback.
- Redirect strategy: provide compatibility routes/pages for high-value legacy public URLs where practical.


## 7. Plan the build and deployment setup

- [x] Add the static-site project skeleton required for GitHub Pages.
- [x] Configure base-path handling for GitHub Pages deployment.
- [x] Add the build workflow for publishing the site.
- [x] Confirm the final public repository name and Pages URL.
- [x] Confirm how preview builds or local development should work.

Decision record: ADR-260005, REQ-FR-260005, BI-260005

- Deploy model: automatic on `main` push, plus manual workflow dispatch.
- Build model: Node 20, static build, publish `dist` artifact to GitHub Pages.
- URL policy: canonical public target `https://crystord.com`; app sign-in `https://app.crystord.com/sign-in` (or configured equivalent).
- Base-path policy: keep `GITHUB_PAGES_BASE` configurable for repo-path fallback/testing.
- Preview/local policy: `npm run dev`, `npm run build`, `npm run preview`.
- Rollback policy: revert bad commit and redeploy.


## 8. Verification and acceptance

- [x] Verify the landing page loads correctly on the GitHub Pages base path.
- [x] Verify the sign-in link points to the SaaS application and is visually distinct.
- [x] Verify the Google Add-on, contact, YouTube, ToS, and Privacy links are present and correct.
- [x] Verify the public site remains static and needs no backend runtime.
- [x] Verify the page works cleanly on desktop and mobile.

Decision record: ADR-260006, REQ-FR-260006, BI-260006

- Mandatory gate set: landing/base-path, sign-in target clarity, key navigation/footer links, static-only behavior, desktop/mobile smoke checks.
- Validation scope: local preview and deployed GitHub Pages URL.
- Pass/fail policy: release blocked if any mandatory gate fails.
- Sign-off owner: repository owner.
- Evidence policy: release verification note with URL, timestamp, reviewer, and gate results.
- Regression response: revert-and-redeploy if a post-release gate failure is discovered.


## 9. Open questions

- [x] Where exactly is the archive directory located in the current workspace or source storage?
- [x] What is the canonical SaaS sign-in URL for the new public site to link to? (Decided: app.crystord.com)
- [x] Should the public site be single-page with anchored sections, or multi-page with separate routes? (Decided: multi-page public site with dedicated detail pages.)
- [x] Should the legal pages be fully recreated now, or carried over after the initial scaffold is in place? (Decided: phased legal rollout; reviewed carry-over at launch, full rewrite post-launch.)
- [x] Is there a preferred visual direction to keep from the archive, or is a fresh design acceptable? (Decided: modernized brand-preserving refresh.)

Decision record: ADR-260007, REQ-FR-260007, BI-260007

- Legal strategy: phase 1 reviewed carry-over, phase 2 full rewrite.
- Visual strategy: preserve brand anchors, modernize layout/typography/spacing/components.


## Suggested next steps

1. Locate the archive content and enumerate the pages or sections that must be preserved.
2. Confirm the SaaS sign-in destination and the desired public-site URL structure.
3. Choose the GitHub Pages-friendly stack and bootstrap the static site skeleton.
