# Crystord Platform Site Instantiation Checklist


This checklist tracks the transition from the archived Angular-based public site (now in the `crystord_platform_archive` folder) to a GitHub Pages-hosted static landing site for Crystord.

**Note:** The archive is to be used for inspiration only. Do not reuse its technology stack (e.g., Angular). Review each feature and content for relevance and suitability. Make independent decisions about what to include and how to implement it for the new site.


## 1. Bootstrap the project

- [x] Confirm the archive source path (`crystord_platform_archive`) to use for inspiration.
- [x] Confirm the new public-site repo structure and destination folders.
- [ ] Keep the SaaS sign-in experience separate from the public landing page.
- [x] Instantiate the project governance files under `.github/project/` and `.github/project/evolution/`.
- [x] Preserve the existing project instructions and update them only where they describe the new site accurately.


## 2. Review and select archive features/content

- [ ] Inventory the archive pages, features, and content that might be relevant.
- [ ] For each feature or section, decide if it should be included in the new site.
- [ ] Document the rationale for including or excluding each feature/content.


## 3. Define the technology stack

- [x] Choose a static-site generator or framework that works well on GitHub Pages (e.g., Astro, Jekyll, Hugo, plain HTML/CSS/JS).
- [x] Ensure the stack does not use Angular or other SPA frameworks requiring a backend.
- [x] Confirm the stack supports easy maintenance and static deployment.


## 4. Define the target site shape

- [ ] Choose a static-site stack that works well on GitHub Pages.
- [ ] Confirm the routing model for the public landing page.
- [ ] Confirm the separate sign-in/login entry point for the SaaS app.
- [ ] Decide how the public site will link to the SaaS app without merging the two experiences.
- [ ] Decide whether the public site needs a dedicated Google Add-on page, or if that content belongs on the landing page.


## 5. Decide the content structure

- [ ] Define the landing page sections and the order they should appear in.
- [ ] Define which content should be standalone pages versus sections on the home page.
- [ ] Define the footer navigation and legal link placement.
- [ ] Define the contact call-to-action and support handoff behavior.
- [ ] Define the sign-in button wording and destination.


## 6. Set the implementation boundaries

- [ ] Decide which archive visuals should be copied directly.
- [ ] Decide which archive content should be rewritten for clarity.
- [ ] Decide whether the new site should keep the archive’s brand voice or modernize it.
- [ ] Decide whether analytics, forms, or other external services are required.
- [ ] Decide whether any redirects are needed from old public URLs.


## 7. Plan the build and deployment setup

- [x] Add the static-site project skeleton required for GitHub Pages.
- [x] Configure base-path handling for GitHub Pages deployment.
- [ ] Add the build workflow for publishing the site.
- [ ] Confirm the final public repository name and Pages URL.
- [ ] Confirm how preview builds or local development should work.


## 8. Verification and acceptance

- [ ] Verify the landing page loads correctly on the GitHub Pages base path.
- [ ] Verify the sign-in link points to the SaaS application and is visually distinct.
- [ ] Verify the Google Add-on, contact, YouTube, ToS, and Privacy links are present and correct.
- [ ] Verify the public site remains static and needs no backend runtime.
- [ ] Verify the page works cleanly on desktop and mobile.


## 9. Open questions

- [x] Where exactly is the archive directory located in the current workspace or source storage?
- [ ] What is the canonical SaaS sign-in URL for the new public site to link to?
- [ ] Should the public site be single-page with anchored sections, or multi-page with separate routes?
- [ ] Should the legal pages be fully recreated now, or carried over after the initial scaffold is in place?
- [ ] Is there a preferred visual direction to keep from the archive, or is a fresh design acceptable?


## Suggested next steps

1. Locate the archive content and enumerate the pages or sections that must be preserved.
2. Confirm the SaaS sign-in destination and the desired public-site URL structure.
3. Choose the GitHub Pages-friendly stack and bootstrap the static site skeleton.
