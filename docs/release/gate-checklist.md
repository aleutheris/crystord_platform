# Release Gate Checklist

Every production release of the Crystord public site must satisfy all gates below before
deployment is accepted. A release is blocked if any mandatory gate fails.

See ADR-260006 for the rationale behind this gate model.

---

## Automated gates (CI — must be green before deploy merges)

These run in the GitHub Actions `build` and `gate` jobs on every push to `main`.

| Check | Job | What verifies it |
|---|---|---|
| Unit tests pass | `build` | `npm test` (Vitest) |
| All required route files present in `dist/` | `build` | `Verify build output` step |
| App sign-in link present in `dist/index.html` | `build` | `Verify build output` step |
| Landing page renders and has correct section structure | `gate` | `e2e/navigation.spec.ts` |
| Sign-in form visible; `data-auth-url` targets app domain | `gate` | `e2e/sign-in-entry.spec.ts` |
| Sign-in success redirects to `app.crystord.com` | `gate` | `e2e/sign-in-entry.spec.ts` |
| Sign-in failure shows inline error without page reload | `gate` | `e2e/sign-in-entry.spec.ts` |
| Main nav: Home, Google Add-on, Contact, Sign-In links correct | `gate` | `e2e/navigation.spec.ts` |
| Footer nav: all 6 links present and routable | `gate` | `e2e/navigation.spec.ts` |
| Google Add-on page loads with marketplace link | `gate` | `e2e/archive-content.spec.ts` |
| Support, Privacy, Terms, Contact pages load | `gate` | `e2e/archive-content.spec.ts` |
| YouTube link present and opens in new tab with `noopener noreferrer` | `gate` | `e2e/navigation.spec.ts` |
| Excluded routes (login, register, dashboard, newsletter, demo) return 404 | `gate` | `e2e/archive-content.spec.ts` |
| Legacy compatibility routes redirect correctly | `gate` | `e2e/boundaries.spec.ts` |
| No analytics scripts in rendered pages | `gate` | `e2e/boundaries.spec.ts` |
| Contact page has mailto fallback | `gate` | `e2e/boundaries.spec.ts` |
| Mobile viewport smoke check (Pixel 5) — all above on mobile | `gate` | Playwright `Mobile Chrome` project |

---

## Manual gates (performed by repository owner before release approval)

Run these against `npm run preview` (local build) **and** against the deployed GitHub Pages URL.

| # | Check | Pass criteria |
|---|---|---|
| M1 | Landing page loads at the canonical URL | Page renders without errors; hero, sign-in form, and nav all visible |
| M2 | Sign-in control label and placement | Label reads "Sign in to Crystord App"; appears in nav, actions panel, and footer CTA |
| M3 | App sign-in link destination | Clicking sign-in routes to `https://app.crystord.com/sign-in` (or configured equivalent) |
| M4 | Google Add-on link | Navigates to `/google-addon`; Marketplace install button present |
| M5 | Contact link | Navigates to `/contact`; email address visible |
| M6 | YouTube link | Opens in new tab; correct channel URL |
| M7 | Privacy link | Navigates to `/privacy`; page readable |
| M8 | Terms link | Navigates to `/terms`; page readable |
| M9 | Support link | Navigates to `/google-addon/support`; page readable |
| M10 | Static-only behavior | No sign of server-side errors; all pages load without a backend |
| M11 | Desktop smoke | Chrome/Firefox — layout intact, no console errors |
| M12 | Mobile smoke | iOS Safari or Chrome Mobile — layout intact, nav accessible, sign-in form usable |

---

## Pass/fail discipline

- Release is **blocked** if any automated gate is red.
- Release is **blocked** if any manual gate fails.
- If a gate fails post-deploy, execute rollback: `git revert <sha>` → push → redeploy → re-verify.

---

## Sign-off

Record the outcome in a `docs/release/notes/` file using `verification-note-template.md` before
merging a release commit as accepted.
