# Crystord Platform Project Instructions

Instantiated from `.github/generic/process/project-instructions.md`.

## 1. Project Profile

- Project name: Crystord Platform Site
- Goal: Publish a GitHub Pages-hosted public site for Crystord that keeps the SaaS sign-in flow separate from the landing page while preserving the archive's public content.
- Primary users: Prospective customers, existing users, and people seeking product, add-on, legal, or contact information.
- Constraints: Must be static-site friendly, deployable to GitHub Pages, and maintain the archived public-facing content without Angular.

## 2. Architecture Instantiation

- Major modules and responsibilities: Public landing page, separate SaaS sign-in page, Google add-on overview page, legal pages, support page, shared layout and global styling.
- Module ownership map: Layout and styling in `src/layouts` and `src/styles`; content pages in `src/pages`; deployment metadata in `.github/workflows` and `.github/project`.
- Allowed dependency directions: Pages may depend on shared layout/config, `src/components/`, and `src/features/<name>/components/`; shared layout may depend on site config and global styles; pages must not depend on each other.
- Boundary contract catalog (API/schema/events/config): Public links, build-time environment variables for base path and SaaS sign-in URL, and the copied public contact/legal copy.
- Behavior-oriented slicing plan: Landing experience, sign-in entry, add-on explanation, legal compliance pages, and support/troubleshooting.

## 3. Interface Governance Instantiation

- Project-specific approval authority: Repository owner.
- Required approval SLA: Same day for public-facing copy or link changes; one business day for structural changes.
- Contract versioning strategy: External links and legal pages change only through explicit review; internal page structure may evolve with compatible paths preserved.
- ICR storage location: `.github/project/evolution/adr/`

All contract changes must use `.github/generic/templates/interface-change-request.template.md`.

## 4. Verification Instantiation

- Critical end-to-end flows: Landing page renders, sign-in page links to the SaaS app, add-on page links to legal/help pages, legal pages render on GitHub Pages, contact and outbound links resolve.
- Required boundary contracts to test: Base-path-aware routing, build-time app sign-in URL, outbound legal/support links.
- Integration points with highest failure risk: GitHub Pages base path, external sign-in target, and content copy drift from the archive.
- Component/service checks for fault localization: Layout rendering, page routing, and deployment workflow generation.
- Optional unit-test focus areas (if needed): Content link generation and base-path helpers.

## 5. Delivery Instantiation

- Branching constraints for this project: Small, reviewable changes; avoid mixing content refreshes with infrastructure changes unless necessary.
- CI gates and blocking checks: Static build must succeed; deployed pages must preserve public routes; outbound links should be reviewed before release.
- Rollback strategy by release type: Revert the last content or workflow change; keep routes stable where possible.
- Observability minimum for release: Manual spot check of landing, sign-in, add-on, privacy, terms, and support pages after deploy.

## 6. Quality Gate Instantiation

- Requirement taxonomy for this project's artifacts: `FR`, `QR`, `OR`, `CR`.
- Portability acceptance checks: Static output only; no server runtime required.
- Maintainability acceptance checks: Keep files small, prefer shared layout/config, and avoid duplicated copy where practical.
- Observability acceptance checks: Clear navigation and explicit sign-in separation on the public site.
- Contract-stability checks: Preserved public routes for landing, sign-in, add-on, privacy, terms, and support pages.
- Readability and documentation checks: Human-readable content, straightforward page structure, and concise inline comments only when needed.

Code cohesion defaults (required unless explicitly overridden with rationale):

- File size guardrail: `<= 200 lines`.
- Function size guardrail: `<= 30 lines where practical`.

### Definition of Done

All backlog items are considered "Done" only when they are behavior-oriented and satisfy the following end-to-end criteria:
- **Documentation**: Any necessary documentation (e.g., READMEs, code comments) is updated.
- **Source Code**: The feature is fully implemented.
- **Testing**: Automated tests are written to verify the behavior, aiming for 100% test and code coverage.

## 7. Stack Addendum

- Language and runtime: TypeScript and Astro.
- Frameworks and platform: Astro static site output for GitHub Pages.
- Data/storage choices: No backend data store; build-time config only.
- Infrastructure/deployment model: Static deployment to GitHub Pages.

## 8. Evolution Tracking

The `.github/project/evolution/` folder tracks the lifecycle of requirements, decisions, and work items.

### Folder Structure (Bootstrap Requirements)

Every instantiated project must create and maintain the following one-file-per-item structure:

- `.github/project/evolution/adr/`
- `.github/project/evolution/backlog-items/`
- `.github/project/evolution/requirements/`
- `.github/project/evolution/requirements-index.md`
- `.github/project/evolution/product-backlog.md`
- `.github/project/evolution/backlog-status.md`

### Learnings Folder (On-Demand Knowledge)

- `.github/project/learnings/`
- `.github/project/learnings/index.md`

### Project-Specific Instantiation

- Decision cadence: Per major public-facing decision.
- Review cadence for project instructions: After the first static site release and then per milestone.
- Requirement ID allocation: Repository owner assigns IDs and keeps `FR-`, `QR-`, `OR-`, and `CR-` records consistent.
- Backlog item ownership: Repository owner maintains vertical backlog items.

## 9. Loading Matrix Instantiation

Always-on:
- `.github/copilot-instructions.md`
- `.github/project/project-instructions.md`

Usually referenced:
- `.github/generic/process/llm-software-execution.md`
- `.github/project/evolution/product-backlog.md`

On-demand:
- `.github/project/evolution/requirements/*`
- `.github/project/evolution/adr/*`
- `.github/project/evolution/backlog-items/*`
- `.github/project/learnings/*`
