# LRN-001: Archive Curation Inventory

Recorded: 2026-06-06
Related: BI-260002, ADR-260002, REQ-FR-260002

## Purpose

Documents the inventory of `crystord_platform_archive` public-facing pages and sections, with a
Keep / Rework / Drop decision for each. Satisfies the BI-260002 acceptance criterion to inventory
and map archive content before it is used in the new Astro static site.

## Archive Structure Surveyed

The archive is an Angular + CoreUI application. All surveyed paths are under
`crystord_platform_archive/src/app/views/`.

## Inventory and Decisions

| Archive path | Type | Decision | Rationale | New-site location |
|---|---|---|---|---|
| `landing/` | Landing page | **Rework** | Hero copy and product messaging rewritten for new static-site context | `src/pages/index.astro` |
| `gaddon/gaddon.component.html` | Google Add-on overview | **Rework** | Content preserved, Angular/CoreUI markup replaced with Astro | `src/pages/google-addon.astro` |
| `gaddon/privacy/` | Add-on Privacy Policy | **Keep (reviewed)** | Legal content reviewed for accuracy and ported verbatim | `src/pages/privacy.astro` |
| `gaddon/terms/` | Add-on Terms of Service | **Keep (reviewed)** | Legal content reviewed for accuracy and ported verbatim | `src/pages/terms.astro` |
| `gaddon/support/` | Add-on Support page | **Keep (reviewed)** | Support instructions verified against current Add-on behaviour | `src/pages/google-addon/support.astro` |
| `pages/login/` | App sign-in page | **Drop** | Replaced by the new cross-origin sign-in form (BI-260001); app-auth route excluded |  |
| `pages/register/` | User registration page | **Drop** | Sign-up flow excluded per BI-260002 scope |  |
| `pages/page404/` | 404 error page | **Drop** | App-internal; not needed on the static public site |  |
| `pages/page500/` | 500 error page | **Drop** | App-internal; not needed on the static public site |  |
| `dashboard/` | Authenticated app dashboard | **Drop** | App-internal authenticated surface; excluded from migration |  |
| `base/`, `buttons/`, `charts/`, `control/`, `forms/`, `icons/`, `notifications/`, `tables/`, `theme/`, `widgets/` | Angular/CoreUI UI component showcase pages | **Drop** | App-internal component library views; not public-facing content |  |

## Newsletter / Demo / Sign-up

No dedicated newsletter or demo-login Angular component was found as a separate view in the archive.
These capabilities were part of the landing page copy and were excluded when the landing-page
content was reworked. They remain excluded unless a future backlog item re-approves them.

## Verification

All "Keep" and "Rework" items have corresponding pages in the new Astro site.
All "Drop" items are absent from `src/pages/` and the main navigation.
No Angular assets, CoreUI CSS, or app-internal routes were carried forward.
