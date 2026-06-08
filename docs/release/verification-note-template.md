# Release Verification Note

Copy this file to `docs/release/notes/YYYY-MM-DD-<short-description>.md` and fill it in before
accepting a release.

---

## Release details

| Field | Value |
|---|---|
| Date | YYYY-MM-DD |
| Commit SHA | `<sha>` |
| Local preview URL | `http://localhost:4321` |
| Deployed URL | `https://crystord.com` (or GitHub Pages staging URL) |
| Reviewer | |

---

## Automated gate result

| Result | Details |
|---|---|
| CI `build` job | ☐ Pass  ☐ Fail |
| CI `gate` job | ☐ Pass  ☐ Fail |
| Playwright report | Attached / Link: |

If either CI job failed, stop here. Do not proceed to manual checks or sign-off.

---

## Manual gate results

Complete against both **local preview** and the **deployed URL**. Mark each environment.

| # | Check | Local | Deployed | Notes |
|---|---|---|---|---|
| M1 | Landing page loads; hero, sign-in form, nav visible | ☐ | ☐ | |
| M2 | Sign-in label reads "Sign in to Crystord App" in all three locations | ☐ | ☐ | |
| M3 | Sign-in link/button routes to configured app-domain entry | ☐ | ☐ | |
| M4 | Google Add-on link navigates to `/google-addon`; Marketplace button present | ☐ | ☐ | |
| M5 | Contact link navigates to `/contact`; email address visible | ☐ | ☐ | |
| M6 | YouTube link opens in new tab; correct channel | ☐ | ☐ | |
| M7 | Privacy link navigates to `/privacy`; page readable | ☐ | ☐ | |
| M8 | Terms link navigates to `/terms`; page readable | ☐ | ☐ | |
| M9 | Support link navigates to `/google-addon/support`; page readable | ☐ | ☐ | |
| M10 | Static-only: all pages load without backend; no server errors | ☐ | ☐ | |
| M11 | Desktop smoke: layout intact, no console errors (Chrome/Firefox) | ☐ | ☐ | |
| M12 | Mobile smoke: layout intact, nav accessible, sign-in form usable | ☐ | ☐ | |

---

## Outcome

☐ **All gates passed** — release accepted.

☐ **One or more gates failed** — release blocked. Failed items:

- 

Rollback action taken (if deployed):

---

## Sign-off

Accepted by: _________________________ Date: _____________
