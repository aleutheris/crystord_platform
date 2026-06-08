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

  test("/gaddon/support redirects to /google-addon/support", async ({ page }) => {
    await page.goto("/gaddon/support");
    await page.waitForURL(/\/google-addon\/support/, { timeout: 5000 });
    expect(page.url()).toContain("/google-addon/support");
  });
});

test.describe("No analytics integrations at launch (BI-260004)", () => {
  const ANALYTICS_PATTERN = /googletagmanager\.com|google-analytics\.com|analytics\.js/;

  test("landing page HTML contains no analytics script tags", async ({ page }) => {
    await page.goto("/");
    const scripts = await page.locator("script[src]").all();
    for (const script of scripts) {
      const src = await script.getAttribute("src");
      expect(src ?? "").not.toMatch(ANALYTICS_PATTERN);
    }
  });

  test("Google Add-on page HTML contains no analytics script tags", async ({ page }) => {
    await page.goto("/google-addon");
    const scripts = await page.locator("script[src]").all();
    for (const script of scripts) {
      const src = await script.getAttribute("src");
      expect(src ?? "").not.toMatch(ANALYTICS_PATTERN);
    }
  });
});

test.describe("Contact flow: contact page and mailto fallback (BI-260004)", () => {
  test("contact page is accessible", async ({ page }) => {
    const response = await page.goto("/contact");
    expect(response?.status()).toBeLessThan(400);
  });

  test("contact page has a mailto link as fallback", async ({ page }) => {
    await page.goto("/contact");
    const emailLink = page.getByRole("link", { name: /@crystord\.com/i });
    await expect(emailLink).toBeVisible();
    const href = await emailLink.getAttribute("href");
    expect(href).toMatch(/^mailto:/);
  });
});
