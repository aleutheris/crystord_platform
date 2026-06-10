// BI-260007: visual design adheres to branding.md; consistent layout; legal content preserved
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf-8");

// ── Token completeness ────────────────────────────────────────────────────────
// Every token defined in branding.md must be present in global.css.
// This prevents the token system from silently drifting from the brand spec.

describe("CSS token system covers all branding.md tokens (BI-260007)", () => {
  const css = read("src/styles/global.css");

  const requiredTokens: Array<[string, string]> = [
    ["--bg",          "#fafbfc"],  // Open White
    ["--surface",     "#f3f6f8"],  // Soft Neutral
    ["--surface-alt", "#e7edf2"],  // Structured Neutral
    ["--ink",         "#17202a"],  // Deep Charcoal
    ["--muted",       "#5b6b7a"],  // Slate Gray
    ["--brand",       "#0066cc"],  // Trust Blue
    ["--brand-dark",  "#004c99"],  // Deep Trust Blue
    ["--green",       "#00a676"],  // Control Green
    ["--green-dark",  "#007a58"],  // Deep Control Green
    ["--gold",        "#ffb000"],  // Confidence Gold
    ["--line",        "#d6dee5"],  // Soft Border
    ["--success",     "#2e8b57"],  // Success Green
    ["--warning",     "#f39c12"],  // Review Orange
    ["--error",       "#d64545"],  // Privacy Red
  ];

  for (const [token, hex] of requiredTokens) {
    it(`declares ${token} (${hex})`, () => {
      expect(css).toContain(token);
      expect(css.toLowerCase()).toContain(hex.toLowerCase());
    });
  }
});

// ── Consistent layout application ────────────────────────────────────────────
// Every public page file must import MainLayout so the header/footer/nav
// and token-based styles are applied uniformly across the site.

describe("All public pages use MainLayout (BI-260007)", () => {
  const pagesDir = join(root, "src/pages");

  function collectAstroFiles(dir: string): string[] {
    const entries = readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((e) => {
      const full = join(dir, e.name);
      if (e.isDirectory()) return collectAstroFiles(full);
      if (e.name.endsWith(".astro")) return [full];
      return [];
    });
  }

  const pageFiles = collectAstroFiles(pagesDir);

  for (const file of pageFiles) {
    const rel = file.replace(root + "/", "");
    it(`${rel} imports a site layout`, () => {
      const content = read(rel);
      expect(content.includes("MainLayout") || content.includes("AddonLayout")).toBe(true);
    });
  }
});

// ── Legal content preserved (phase 1 carry-over) ─────────────────────────────
// Legal pages must retain their section headings so that a simple grep can
// confirm the reviewed phase-1 text is still intact.

describe("Legal page content preserved (BI-260007 phase 1)", () => {
  it("privacy.astro contains the Privacy Policy heading", () => {
    expect(read("src/pages/privacy.astro")).toContain("Privacy Policy");
  });

  it("privacy.astro contains the Data Collection section", () => {
    expect(read("src/pages/privacy.astro")).toContain("Data Collection");
  });

  it("terms.astro contains the Terms of Service heading", () => {
    expect(read("src/pages/terms.astro")).toContain("Terms of Service");
  });

  it("terms.astro contains the Description of the Service section", () => {
    expect(read("src/pages/terms.astro")).toContain("Description of the Service");
  });

  it("support.astro contains the support heading", () => {
    expect(read("src/pages/support.astro")).toContain("Add-on Support");
  });

  it("support.astro contains the Getting Started section", () => {
    expect(read("src/pages/support.astro")).toContain("Getting Started");
  });
});

// ── No archive-era layout patterns ───────────────────────────────────────────

describe("No disallowed visual patterns from archive (BI-260007)", () => {
  it("global.css contains no Angular/CoreUI class references", () => {
    expect(read("src/styles/global.css")).not.toMatch(/@coreui|\.c-sidebar|\.c-header/i);
  });

  it("MainLayout.astro contains no Angular/CoreUI imports", () => {
    expect(read("src/layouts/MainLayout.astro")).not.toMatch(/@coreui|@angular/i);
  });
});
