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

## Environment variables

- `GITHUB_PAGES_BASE`: Base path used by Astro for GitHub Pages deployments.
- `PUBLIC_APP_SIGN_IN_URL`: External SaaS sign-in URL linked from the public site.
