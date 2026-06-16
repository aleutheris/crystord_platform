// BI-260004: launch boundary enforcement — no form backends, contact mailto present.
// BI-260012 / ADR-260012: GA4 analytics approved post-launch (supersedes the
// analytics-launch clause of ADR-260004); analytics is now required, not forbidden.
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();

function read(relPath: string) {
  return readFileSync(join(root, relPath), "utf-8");
}

const FORM_BACKEND_PATTERNS =
  /formspree\.io|web3forms\.com|netlify\.com\/api\/form|getform\.io/i;

describe("Google Analytics integration (BI-260012 / ADR-260012)", () => {
  it("Analytics component uses the official gtag.js snippet verbatim", () => {
    const analytics = read("src/components/Analytics.astro");
    // Must load the gtag library and use the unmodified snippet (no rest-params
    // rewrite — see LRN-002, which silently sends zero data).
    expect(analytics).toMatch(/googletagmanager\.com\/gtag\/js/);
    expect(analytics).toContain("dataLayer.push(arguments)");
  });

  it("both layouts include the Analytics component so every content page is covered", () => {
    for (const layout of ["src/layouts/MainLayout.astro", "src/layouts/AddonLayout.astro"]) {
      const src = read(layout);
      expect(src).toMatch(/import\s+Analytics\s+from/);
      expect(src).toContain("<Analytics");
    }
  });
});

describe("No external form backend at launch (BI-260004)", () => {
  it("MainLayout references no external form backend services", () => {
    expect(read("src/layouts/MainLayout.astro")).not.toMatch(FORM_BACKEND_PATTERNS);
  });

  it("SignInForm component references no external form backend services", () => {
    expect(read("src/components/SignInForm.astro")).not.toMatch(FORM_BACKEND_PATTERNS);
  });
});

describe("Contact flow: contact page plus mailto fallback (BI-260004)", () => {
  it("contact.astro contains a mailto: link", () => {
    expect(read("src/pages/contact.astro")).toContain("mailto:");
  });
});

describe("No disallowed layout system reuse (BI-260004)", () => {
  it("MainLayout does not import Angular or CoreUI packages", () => {
    const layout = read("src/layouts/MainLayout.astro");
    expect(layout).not.toMatch(/@coreui|@angular/i);
  });

  it("astro.config.mjs does not reference Angular or CoreUI", () => {
    const config = read("astro.config.mjs");
    expect(config).not.toMatch(/@coreui|@angular/i);
  });
});

describe("Compatibility redirects declared (BI-260004)", () => {
  it("astro.config.mjs declares legacy /gaddon redirect", () => {
    expect(read("astro.config.mjs")).toContain('"/gaddon"');
  });

  it("astro.config.mjs declares legacy /landing redirect", () => {
    expect(read("astro.config.mjs")).toContain('"/landing"');
  });
});
