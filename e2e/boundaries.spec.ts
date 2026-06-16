// BI-260004: implementation boundary enforcement
import { test, expect } from "@playwright/test";

test.describe("Compatibility routes for legacy archive URLs (BI-260004)", () => {
  test("/landing redirects to the home page", async ({ page }) => {
    await page.goto("/landing");
    await page.waitForURL(/\/$/, { timeout: 5000 });
    expect(page.url()).toMatch(/\/$/);
  });

  test("/gaddon redirects to /google-addon", async ({ page }) => {
    await page.goto("/gaddon");
    await page.waitForURL(/\/google-addon/, { timeout: 5000 });
    expect(page.url()).toContain("/google-addon");
  });

  test("/gaddon/privacy redirects to /privacy", async ({ page }) => {
    await page.goto("/gaddon/privacy");
    await page.waitForURL(/\/privacy/, { timeout: 5000 });
    expect(page.url()).toContain("/privacy");
  });

  test("/gaddon/terms redirects to /terms", async ({ page }) => {
    await page.goto("/gaddon/terms");
    await page.waitForURL(/\/terms/, { timeout: 5000 });
    expect(page.url()).toContain("/terms");
  });

  test("/gaddon/support redirects to /support", async ({ page }) => {
    await page.goto("/gaddon/support");
    await page.waitForURL(/\/support/, { timeout: 5000 });
    expect(page.url()).toContain("/support");
  });
});

// ADR-260012 approved GA4 post-launch, superseding the analytics-launch clause of
// ADR-260004. Content pages must now carry the official gtag.js tag.
test.describe("Google Analytics present on content pages (BI-260012 / ADR-260012)", () => {
  const GA_TAG_PATTERN = /googletagmanager\.com\/gtag\/js/;

  async function gaTagSrcs(page: import("@playwright/test").Page) {
    const scripts = await page.locator("script[src]").all();
    const srcs = await Promise.all(scripts.map((s) => s.getAttribute("src")));
    return srcs.filter((src): src is string => !!src && GA_TAG_PATTERN.test(src));
  }

  test("landing page loads the GA4 gtag script", async ({ page }) => {
    await page.goto("/");
    expect(await gaTagSrcs(page)).toHaveLength(1);
  });

  test("Google Add-on page loads the GA4 gtag script", async ({ page }) => {
    await page.goto("/google-addon");
    expect(await gaTagSrcs(page)).toHaveLength(1);
  });
});

test.describe("Contact flow: contact page and mailto fallback (BI-260004)", () => {
  test("contact page is accessible", async ({ page }) => {
    const response = await page.goto("/contact");
    expect(response?.status()).toBeLessThan(400);
  });

  test("contact page has a mailto link as fallback", async ({ page }) => {
    await page.goto("/contact");
    const emailLink = page.getByRole("link", { name: /@/i });
    await expect(emailLink).toBeVisible();
    const href = await emailLink.getAttribute("href");
    expect(href).toMatch(/^mailto:/);
  });
});
