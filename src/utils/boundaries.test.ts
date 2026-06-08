// BI-260004: launch boundary enforcement — no analytics, no form backends, contact mailto present
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const root = process.cwd();

function read(relPath: string) {
  return readFileSync(join(root, relPath), "utf-8");
}

const ANALYTICS_PATTERNS =
  /googletagmanager\.com|google-analytics\.com|analytics\.js|gtag\s*\(|dataLayer\.push/i;

const FORM_BACKEND_PATTERNS =
  /formspree\.io|web3forms\.com|netlify\.com\/api\/form|getform\.io/i;

describe("No analytics at launch (BI-260004)", () => {
  it("MainLayout contains no external analytics scripts", () => {
    expect(read("src/layouts/MainLayout.astro")).not.toMatch(ANALYTICS_PATTERNS);
  });

  it("landing page contains no external analytics scripts", () => {
    expect(read("src/pages/index.astro")).not.toMatch(ANALYTICS_PATTERNS);
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
