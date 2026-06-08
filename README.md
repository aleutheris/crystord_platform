# Crystord Platform Public Site

This repository is bootstrapped as an Astro static site for GitHub Pages.

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Testing

### Unit tests (Vitest)

Run the unit test suite:

```
npm test
```

Watch mode (re-runs on file change):

```
npm run test:watch
```

Unit tests live in `src/**/*.test.ts` alongside the source they cover. Currently covers:
- `src/utils/sign-in.test.ts` — `submitSignIn` function (BI-260001)
- `src/config/site.test.ts` — nav and footer config structure (BI-260001, BI-260003)

### E2E tests (Playwright)

First-time setup — download browser binaries:

```
npx playwright install --with-deps chromium
```

Run the full E2E suite (starts the Astro dev server automatically):

```
npm run test:e2e
```

E2E tests live in `e2e/` and map to backlog items:
- `e2e/navigation.spec.ts` — main nav, footer nav, section order, route navigation (BI-260003)
- `e2e/sign-in-entry.spec.ts` — sign-in form and sign-in links on the landing page (BI-260001)
- `e2e/archive-content.spec.ts` — curated page routes and excluded archive routes (BI-260002)

### Static analysis (ESLint)

```
npm run lint
```

Covers `.ts` and `.astro` files with TypeScript and Astro plugin rules.

## Deployment

### How it works

The site is deployed to GitHub Pages via `.github/workflows/deploy.yml`. The pipeline runs on every push to `main` and can also be triggered manually via **Actions → Deploy to GitHub Pages → Run workflow**.

Build pipeline:
1. Install dependencies (`npm install`)
2. Run unit tests (`npm test`) — failure blocks the deploy
3. Build static output (`npm run build`) with `PUBLIC_APP_SIGN_IN_URL` and `GITHUB_PAGES_BASE` set
4. Verify build output — checks that all required routes and the app sign-in link are present in `dist/`
5. Upload `dist/` and deploy to GitHub Pages

Canonical public URL: `https://crystord.com`  
App sign-in target: `https://app.crystord.com/sign-in`

### Local workflow

```
npm run dev       # start dev server at http://localhost:4321
npm run build     # build static output into dist/
npm run preview   # serve dist/ locally to verify the build
```

### Rollback

Rollback is performed by reverting the offending commit on `main` and redeploying:

```
git revert <bad-commit-sha>
git push origin main
```

The revert commit triggers the deploy workflow automatically. No manual intervention in GitHub Pages settings is required. After the workflow completes, verify key routes to confirm the rollback is live.

## Environment variables

- `GITHUB_PAGES_BASE`: Base path used by Astro for GitHub Pages deployments.
- `PUBLIC_APP_SIGN_IN_URL`: External SaaS sign-in URL linked from the public site.
