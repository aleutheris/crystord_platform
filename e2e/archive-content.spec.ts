// BI-260002: curated archive content present in the public site
import { test, expect } from "@playwright/test";

test.describe("Google Add-on page (BI-260002)", () => {
  test("page loads and shows product heading", async ({ page }) => {
    await page.goto("/google-addon");
    await expect(page.getByRole("heading", { name: "Crystord" })).toBeVisible();
  });

  test("marketplace install link is present", async ({ page }) => {
    await page.goto("/google-addon");
    const installLink = page.getByRole("link", { name: /install/i }).first();
    await expect(installLink).toBeVisible();
    const href = await installLink.getAttribute("href");
    expect(href).toContain("workspace.google.com");
  });

  test("How It Works section is present", async ({ page }) => {
    await page.goto("/google-addon");
    await expect(page.getByRole("heading", { name: "How It Works" })).toBeVisible();
  });

  test("trademark disclaimer references Google Sheets and Slides", async ({ page }) => {
    await page.goto("/google-addon");
    await expect(page.locator(".trademark")).toContainText("Google Sheets");
    await expect(page.locator(".trademark")).toContainText("Google Slides");
  });

  test("links to support, privacy, and terms are present", async ({ page }) => {
    await page.goto("/google-addon");
    const trademark = page.locator(".trademark");
    await expect(trademark.getByRole("link", { name: "Support" })).toBeVisible();
    await expect(trademark.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
    await expect(trademark.getByRole("link", { name: "Terms of Service" })).toBeVisible();
  });
});

test.describe("Support page (BI-260002)", () => {
  test("page loads successfully", async ({ page }) => {
    const response = await page.goto("/google-addon/support");
    expect(response?.status()).toBeLessThan(400);
  });

  test("page has a heading", async ({ page }) => {
    await page.goto("/google-addon/support");
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Legal pages (BI-260002)", () => {
  test("privacy page loads and has a heading", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("terms page loads and has a heading", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Contact path (BI-260002)", () => {
  test("contact page loads and has a heading", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("contact page has an email link", async ({ page }) => {
    await page.goto("/contact");
    const emailLink = page.getByRole("link", { name: /@crystord\.com/i });
    await expect(emailLink).toBeVisible();
    const href = await emailLink.getAttribute("href");
    expect(href).toMatch(/^mailto:/);
  });
});

test.describe("YouTube reference preserved (BI-260002)", () => {
  test("landing page connect section links to YouTube", async ({ page }) => {
    await page.goto("/");
    const ytLink = page.locator(".connect-panel, .panel").getByRole("link", { name: /youtube/i });
    await expect(ytLink).toBeVisible();
    const href = await ytLink.getAttribute("href");
    expect(href).toContain("youtube.com");
  });
});

test.describe("Excluded archive content (BI-260002)", () => {
  test("newsletter route is not served", async ({ page }) => {
    const response = await page.goto("/newsletter");
    expect(response?.status()).toBe(404);
  });

  test("demo route is not served", async ({ page }) => {
    const response = await page.goto("/demo");
    expect(response?.status()).toBe(404);
  });

  // Archive app-internal authenticated routes must not be served on the public site
  test("/login is not served", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBe(404);
  });

  test("/register is not served", async ({ page }) => {
    const response = await page.goto("/register");
    expect(response?.status()).toBe(404);
  });

  test("/dashboard is not served", async ({ page }) => {
    const response = await page.goto("/dashboard");
    expect(response?.status()).toBe(404);
  });
});
