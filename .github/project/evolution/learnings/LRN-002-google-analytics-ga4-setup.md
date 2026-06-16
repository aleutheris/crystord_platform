# LRN-002: Google Analytics (GA4) Setup Checklist for Web Projects

Recorded: 2026-06-15

A field guide distilled from a real debugging session where GA showed zero data
for weeks. Reusable across all web projects.

This project's GA4 measurement ID is `G-CS37QHFW49`. The official gtag.js snippet
is rendered from `src/components/Analytics.astro` and included in both
`src/layouts/MainLayout.astro` and `src/layouts/AddonLayout.astro` `<head>`s.

## The bug that broke everything

The gtag snippet was "modernized" to use rest params:

```js
// ❌ BROKEN — silently sends NO data
function gtag(...args) { dataLayer.push(args); }
```

gtag.js **only** treats the `arguments` object as a command. Push a plain array
and your `config`/`page_view` is ignored — the library loads fine but never
sends a hit. Use the official snippet verbatim:

```js
// ✅ CORRECT
function gtag(){ dataLayer.push(arguments); }
```

If ESLint's `prefer-rest-params` flags it, **disable the rule for that line** —
do not rewrite the function:

```js
function gtag() {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}
```

## Rules for every project

1. **Never edit the official GA snippet.** Copy it exactly. Don't let a refactor,
   Prettier, or an AI "clean it up."

2. **The only test that matters is the `collect` request — not whether `gtag/js`
   loads.** DevTools → Network → filter `collect` → reload. Want
   `…/g/collect?...&en=page_view` returning **204**. `gtag/js` loading `200`
   proves nothing.

3. **Test from a clean environment.** Brave, Edge InPrivate, Startpage, VPNs,
   Pi-hole / AdGuard / NextDNS, and "Private DNS" all block GA
   (`ERR_CONNECTION_REFUSED` / blocked on the collect hit), so your own visits
   never count. Verify from a phone on mobile data with a vanilla browser, or
   ask someone else.

4. **Use Realtime, not the report snapshot.** Reports → **Realtime** is instant.
   The "Reports snapshot" / home page lags **24–48h** and shows zeros even when
   data flows.

5. **Verify the property/stream match.** The measurement ID in your code
   (`G-XXXX`) must belong to the property whose reports you're viewing. Multiple
   properties = easy to stare at an empty one.

6. **"Data collection isn't active" banner = GA has received ZERO hits ever.**
   Treat it as "no hit is arriving," not "wrong ID."

7. **Mind decoupled CI/deploy.** A red lint/"quality" check does NOT mean it
   didn't deploy. If the deploy workflow only runs `build` (no lint),
   broken-but-building code ships anyway. Check what the *deploy* job runs.

## 30-second verification for any new site

Clean browser → load page → Network tab, filter `collect` → see `204` with
`en=page_view` → confirm in GA **Realtime**. All three green = it works.
